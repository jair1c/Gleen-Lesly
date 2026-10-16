const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const catalog = require('../assets/gift-catalog.json');
const token = 'personalized_invitation_token_12345';

function fixture() {
  const reservations = [], suggestions = [];
  const helper = { ...require('../api/_lib/supabase'), supabaseRequest: async (path, options = {}) => {
    if (path.startsWith('invitations?')) return path.includes(token) ? [{ id: 'guest-1', active: true, expires_at: '2099-12-31' }] : [];
    if (path.startsWith('gift_suggestions')) {
      if (options.method === 'POST') { suggestions.splice(0, suggestions.length, JSON.parse(options.body)); return; }
      return suggestions;
    }
    if (options.method === 'POST') {
      const row = JSON.parse(options.body);
      if (reservations.some(item => item.gift_id === row.gift_id)) { const e = new Error('Duplicate'); e.details = { code: '23505' }; throw e; }
      reservations.push(row); return;
    }
    if (options.method === 'DELETE') {
      const id = new URLSearchParams(path.split('?')[1]).get('gift_id').slice(3);
      const i = reservations.findIndex(row => row.gift_id === id && row.invitation_id === 'guest-1');
      if (i >= 0) reservations.splice(i, 1); return;
    }
    return reservations;
  } };
  const context = { module: { exports: {} }, require: p => p.includes('gift-catalog') ? catalog : p.includes('gift-matching') ? require('../api/_lib/gift-matching') : helper, URL, Date, console };
  vm.runInNewContext(fs.readFileSync(require.resolve('../api/gifts'), 'utf8'), context);
  const call = async (method, body, query = '') => {
    const res = { setHeader() {}, end(s) { this.data = JSON.parse(s); } };
    await context.module.exports({ method, body, headers: {}, url: '/api/gifts' + query }, res);
    return res;
  };
  return { call, reservations, suggestions };
}

test('dos elecciones simultáneas: una reserva y un conflicto, sin divulgar identidad', async () => {
  const { call } = fixture();
  const responses = await Promise.all([call('POST', { token, action: 'reserve', giftId: 'regalo-1' }), call('POST', { token, action: 'reserve', giftId: 'regalo-1' })]);
  assert.deepEqual(responses.map(r => r.statusCode).sort(), [200, 409]);
  const publicList = await call('GET');
  assert.equal(publicList.data.gifts[0].reserved, true);
  assert.equal(publicList.data.gifts[0].mine, false);
  assert.equal(JSON.stringify(publicList.data).includes('guest-1'), false);
  const personal = await call('GET', null, '?token=' + token);
  assert.equal(personal.data.gifts[0].mine, true);
});

test('las cortinas quedan reservadas y no se pueden elegir ni proponer en singular o plural', async () => {
  const { call } = fixture();
  const list = await call('GET', null, '?token=' + token);
  const curtains = list.data.gifts.find(item => item.id === 'regalo-12');
  assert.equal(curtains.reserved, true);
  assert.equal(curtains.mine, false);
  for (const action of ['reserve', 'release']) assert.equal((await call('POST', { token, action, giftId: curtains.id })).statusCode, 409);
  for (const description of ['cortina', 'CORTINAS', 'Unas cortinas color perla', 'Llevaré una cortina', 'Una cafetera y unas cortinas']) {
    const response = await call('POST', { token, action: 'suggest', description });
    assert.equal(response.statusCode, 409, description);
    assert.match(response.data.error, /Ya hay un regalo escogido/);
  }
});

test('cruza regalos del catálogo y propuestas en ambas direcciones sin bloquear variantes distintas', async () => {
  const { call, reservations } = fixture();
  reservations.push({ gift_id: 'regalo-10', invitation_id: 'another-guest' });
  assert.equal((await call('POST', { token, action: 'suggest', description: 'Una sandwichera' })).statusCode, 409);
  await call('POST', { token, action: 'suggest', description: 'Una cafetera eléctrica' });
  assert.equal((await call('POST', { token, action: 'reserve', giftId: 'regalo-11' })).statusCode, 409);
  const list = await call('GET');
  assert.equal(list.data.gifts.find(item => item.id === 'regalo-11').reserved, true);
  reservations.push({ gift_id: 'regalo-8', invitation_id: 'another-guest' });
  assert.equal((await call('POST', { token, action: 'suggest', description: 'Plancha a vapor' })).statusCode, 200);
});
test('solo una invitación válida puede elegir, liberar y proponer otro detalle', async () => {
  const { call, reservations } = fixture();
  assert.equal((await call('POST', { action: 'reserve', giftId: 'regalo-1' })).statusCode, 403);
  assert.equal((await call('POST', { token, action: 'reserve', giftId: 'inventado' })).statusCode, 400);
  await call('POST', { token, action: 'reserve', giftId: 'regalo-1' });
  await call('POST', { token, action: 'release', giftId: 'regalo-1' });
  assert.equal(reservations.length, 0);
  await call('POST', { token, action: 'suggest', description: 'Unas colchas' });
  assert.equal((await call('GET', null, '?token=' + token)).data.suggestion, 'Unas colchas');
  assert.equal((await call('GET')).data.suggestion, '');
});
test('el detalle privado de regalos requiere una sesión de administrador', async () => {
  const { call } = fixture();
  assert.equal((await call('GET', null, '?view=admin')).statusCode, 401);
});

test('no permite otro regalo con el mismo nombre normalizado ni revela al invitado', async () => {
  const { call, suggestions } = fixture();
  await call('POST', { token, action: 'suggest', description: 'Cafetera eléctrica' });
  assert.equal((await call('POST', { token, action: 'suggest', description: 'CAFETERA   ELECTRICA' })).statusCode, 200);
  suggestions.push({ invitation_id: 'another-guest', description: '  Juego de sábanas  ' });
  const duplicate = await call('POST', { token, action: 'suggest', description: 'JUEGO  DE SABANAS' });
  assert.equal(duplicate.statusCode, 409);
  assert.match(duplicate.data.error, /Otro invitado ya eligió/);
  assert.equal(JSON.stringify(duplicate.data).includes('another-guest'), false);
  assert.equal(suggestions[0].description, 'CAFETERA ELECTRICA');
});
