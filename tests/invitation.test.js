const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/invitation');
const fs = require('node:fs');
const vm = require('node:vm');

const token = 'personalized_invitation_token_12345';
const invitation = {
  id: 'guest-1', guest_name: 'Familia Prueba', seats: 2,
  expires_at: '2099-10-23', active: true, status: 'pending', rsvps: []
};

function response() {
  return {
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    end(body) { this.body = JSON.parse(body); }
  };
}

function mockSupabase(rows = [invitation]) {
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 200, text: async () =>
      options.method === 'POST' || options.method === 'PATCH' ? '' : JSON.stringify(rows) };
  };
  return requests;
}

test('el formulario reemplaza el texto anterior y conserva el destinatario', () => {
  const browser = { URL };
  vm.runInNewContext(fs.readFileSync(require.resolve('../assets/rsvp-whatsapp-message'), 'utf8'), browser);
  const oldUrl = 'https://api.whatsapp.com/send?phone=51985627087&text=CONFIRMA%20TU%20ASISTENCIA';
  const updated = browser.formatRsvpWhatsAppMessage.updateUrl(oldUrl, { guest_name: 'Ana Muñoz', seats: 1 }, true, 1, ['Ana Muñoz'], 'Gracias');
  const link = new URL(updated);
  assert.equal(link.searchParams.get('phone'), '51985627087');
  assert.match(link.searchParams.get('text'), /Yo, Ana Muñoz, confirmo.*asistiré/);
  assert.doesNotMatch(link.searchParams.get('text'), /CONFIRMA TU ASISTENCIA/);
  assert.doesNotMatch(link.searchParams.get('text'), /Tus palabras, para siempre|Gracias/);
  const declined = browser.formatRsvpWhatsAppMessage.updateUrl(oldUrl, { guest_name: 'Ana Muñoz', seats: 1 }, false, 0, [], 'Gracias');
  assert.doesNotMatch(new URL(declined).searchParams.get('text'), /Tus palabras, para siempre|Gracias/);
});

test('invitación personalizada: lectura, cupos, guardado y enlace de WhatsApp', async () => {
  const oldFetch = global.fetch;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SECRET_KEY;
  const oldPhone = process.env.WHATSAPP_NUMBER;
  try {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'sb_secret_test';
    process.env.WHATSAPP_NUMBER = '51999999999';
    const requests = mockSupabase();

    let res = response();
    await handler({ method: 'GET', url: '/api/invitation?token=bad' }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(requests.length, 0);

    res = response();
    await handler({ method: 'GET', url: `/api/invitation?token=${token}` }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.invitation.names, 'Familia Prueba');
    assert.equal(res.body.invitation.seats, 2);
    assert.equal(requests.length, 1);

    res = response();
    await handler({ method: 'POST', body: { token, attendance: true, attendeeCount: 3, attendeeNames: ['A', 'B', 'C'] } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(requests.length, 2);

    res = response();
    await handler({ method: 'POST', body: { token, attendance: true, attendeeCount: 2, attendeeNames: ['Familia Prueba', 'Acompañante'], message: 'Gracias' } }, res);
    assert.equal(res.statusCode, 200);
    assert.match(res.body.whatsappUrl, /^https:\/\/api\.whatsapp\.com\/send\?phone=51999999999/);
    assert.equal(requests.filter(request => request.options.method === 'POST').length, 1);
    assert.equal(requests.filter(request => request.options.method === 'PATCH').length, 1);
    const saved = JSON.parse(requests.find(request => request.options.method === 'POST').options.body);
    assert.equal(saved.attendee_count, 2);
    assert.deepEqual(saved.attendee_names, ['Familia Prueba', 'Acompañante']);
    assert.equal(saved.message, 'Gracias');
    const attendingText = new URL(res.body.whatsappUrl).searchParams.get('text');
    assert.doesNotMatch(attendingText, /Tus palabras, para siempre|Gracias/);
    assert.match(attendingText, /Nosotros, Familia Prueba, confirmamos con mucha alegría/);
    assert.match(attendingText, /N.º DE ASISTENTES:\* 2/);
    assert.match(attendingText, /- Familia Prueba\n- Acompañante/);
    assert.match(attendingText, /¡Nos vemos en GlenslyLand! 🥂/);
    assert.match(attendingText, /#Gleen&Les$/);

    mockSupabase([{ ...invitation, guest_name: 'Ana Castro', seats: 1 }]);
    res = response();
    await handler({ method: 'POST', body: { token, attendance: false, attendeeCount: 0, attendeeNames: [] } }, res);
    assert.equal(res.statusCode, 200);
    const decliningText = new URL(res.body.whatsappUrl).searchParams.get('text');
    assert.match(decliningText, /Yo, Ana Castro, esta vez no podré acompañarlos, pero deseo/);
    assert.match(decliningText, /¡Que su historia en GlenslyLand sea maravillosa!/);
    assert.doesNotMatch(decliningText, /ASISTENTES|Familia Prueba/);
    res = response();
    await handler({ method: 'POST', body: { token, attendance: true, attendeeCount: 1, attendeeNames: ['Ana Castro'] } }, res);
    assert.equal(res.statusCode, 200);
    const individualText = new URL(res.body.whatsappUrl).searchParams.get('text');
    assert.match(individualText, /Yo, Ana Castro, confirmo con mucha alegría que asistiré/);
    assert.match(individualText, /N.º DE ASISTENTES:\* 1/);
    assert.doesNotMatch(individualText, /Nosotros|asistiremos/);
    mockSupabase();
    res = response();
    await handler({ method: 'POST', body: { token, attendance: false, attendeeCount: 0, attendeeNames: [] } }, res);
    assert.match(new URL(res.body.whatsappUrl).searchParams.get('text'), /Nosotros, Familia Prueba, esta vez no podremos acompañarlos, pero deseamos/);
  } finally {
    global.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldKey;
    if (oldPhone === undefined) delete process.env.WHATSAPP_NUMBER; else process.env.WHATSAPP_NUMBER = oldPhone;
  }
});
