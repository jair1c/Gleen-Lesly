const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/invitation');

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
  } finally {
    global.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldKey;
    if (oldPhone === undefined) delete process.env.WHATSAPP_NUMBER; else process.env.WHATSAPP_NUMBER = oldPhone;
  }
});
