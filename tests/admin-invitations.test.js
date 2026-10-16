const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('permite crear más de 20 invitaciones; el 20 limita solo los cupos', async () => {
  const rows = [];
  const helper = { ...require('../api/_lib/supabase'), requireAdmin: async () => ({ id: 'admin-test' }),
    supabaseRequest: async (path, options) => {
      const row = { ...JSON.parse(options.body), id: 'test-' + rows.length };
      rows.push(row); return [row];
    } };
  const context = { module: { exports: {} }, require: p => p === 'crypto' ? require('node:crypto') : helper, console };
  vm.runInNewContext(fs.readFileSync(require.resolve('../api/admin'), 'utf8'), context);
  for (let i = 1; i <= 30; i++) {
    const res = { setHeader() {}, end(s) { this.data = JSON.parse(s); } };
    await context.module.exports({ method: 'POST', body: { names: 'Prueba ' + i, seats: 2, exp: '2026-11-06' } }, res);
    assert.equal(res.statusCode, 201, 'invitación ' + i);
  }
  assert.equal(rows.length, 30);
  assert.equal(new Set(rows.map(row => row.access_token)).size, 30);
  const res = { setHeader() {}, end(s) { this.data = JSON.parse(s); } };
  await context.module.exports({ method: 'POST', body: { names: '21 cupos', seats: 21, exp: '2026-11-06' } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(rows.length, 30);
});

function panelFixture({ clipboardFails = false, listFails = false } = {}) {
  const elements = new Map(); let posts = 0;
  function element(id) {
    if (!elements.has(id)) elements.set(id, { value: '', disabled: false, textContent: '', className: '', handlers: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(type, fn) { this.handlers[type] = fn; }, reset() {} });
    return elements.get(id);
  }
  const context = {
    document: { getElementById: element }, sessionStorage: { getItem: () => '', setItem() {}, removeItem() {} },
    navigator: { clipboard: { writeText: async () => { if (clipboardFails) throw new Error('NotAllowedError'); } } },
    URL, location: { origin: 'https://test.invalid' }, setTimeout: () => 1, clearTimeout() {},
    fetch: async (url, options) => {
      if (options.method === 'POST') { posts++; return { ok: true, json: async () => ({ invitation: { id: 'new-invite', token: 'test-token', names: 'Familia Prueba', seats: 2, exp: '2026-11-06', active: true, status: 'pending' } }) }; }
      if (listFails) throw new Error('Connection lost');
      return { ok: true, json: async () => ({ invitations: [] }) };
    }
  };
  const html = fs.readFileSync(require.resolve('../admin.html'), 'utf8');
  vm.runInNewContext(html.match(/<script>\s*([\s\S]*?)<\/script>/)[1], context);
  element('names').value = 'Familia Prueba'; element('seats').value = '2'; element('expiry').value = '2026-11-06';
  return { element, posts: () => posts, submit: () => element('inviteForm').handlers.submit({ preventDefault() {} }) };
}

test('una invitación creada sigue siendo éxito aunque no se pueda copiar el enlace', async () => {
  const panel = panelFixture({ clipboardFails: true });
  await panel.submit();
  assert.equal(panel.posts(), 1);
  assert.match(panel.element('toast').textContent, /Invitación creada.*Copia el enlace/);
  assert.equal(panel.element('toast').className.includes('error'), false);
  assert.equal(panel.element('createdInvitationLink').value, 'https://test.invalid/?invite=test-token');
  assert.equal(panel.element('saveButton').disabled, false);
});

test('un fallo al actualizar la lista no presenta como fallida una invitación ya creada', async () => {
  const panel = panelFixture({ listFails: true });
  await Promise.all([panel.submit(), panel.submit()]);
  assert.equal(panel.posts(), 1, 'bloquea un doble clic mientras crea la invitación');
  assert.match(panel.element('toast').textContent, /Invitación creada.*No se pudo actualizar la lista/);
  assert.equal(panel.element('toast').className.includes('error'), false);
});
