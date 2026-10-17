const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function fixture(before = false) {
  const rows = []; let missing = false;
  class Clock extends Date { static now() { return Date.parse(before ? '2026-10-17' : '2026-11-29'); } }
  const helper = { ...require('../api/_lib/supabase'), supabaseRequest: async (path, options = {}) => {
    if (path.startsWith('invitations?')) return [{ id: 'invite-1', guest_name: 'Familia', active: true }];
    if (options.method === 'POST') { rows.push(...JSON.parse(options.body)); return; }
    if (options.method === 'PATCH') { rows.filter(r => r.status === 'uploading').forEach(r => Object.assign(r, JSON.parse(options.body))); return; }
    return path.includes('status=eq.approved') ? rows.filter(r => r.status === 'approved') : rows;
  }, storageRequest: async (path) => {
    if (path.startsWith('object/upload/sign/')) return { url: '/object/upload/sign/wedding-uploads/file?token=signed' };
    if (path.startsWith('object/info/')) { if (missing) throw Object.assign(new Error('Archivo ausente'), { status: 404 }); return { metadata: { size: 1234, mimetype: 'image/jpeg' } }; }
    return rows.filter(r => r.status === 'approved').map(r => ({ signedURL: '/object/sign/wedding-uploads/' + r.id }));
  } };
  const context = { module: { exports: {} }, require: p => p === 'node:crypto' ? require(p) : helper, process: { env: { SUPABASE_SECRET_KEY: 'test-only-secret', SUPABASE_URL: 'https://example.supabase.co' } }, Buffer, URL, Date: Clock, console: { error() {} } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../api/guest-photos'), 'utf8'), context);
  async function call(method, body, query = '') {
    const res = { setHeader() {}, end(value) { this.data = JSON.parse(value); } };
    await context.module.exports({ method, body, url: '/api/guest-photos' + query }, res); return res;
  }
  return { call, rows, missing() { missing = true; } };
}
const file = { name: 'foto.jpg', size: 1234, type: 'image/jpeg', width: 1200, height: 1600 };
test('QR sin invitación: nombre obligatorio y fotos privadas hasta aprobación', async () => {
  const f = fixture();
  assert.equal((await f.call('POST', { action: 'prepare', files: [file] })).statusCode, 400);
  const prepared = await f.call('POST', { action: 'prepare', uploaderName: 'Ana Pérez', files: [file] });
  assert.equal(prepared.statusCode, 200);
  assert.equal(f.rows[0].invitation_id, null);
  assert.equal(f.rows[0].uploader_name, 'Ana Pérez');
  assert.equal((await f.call('GET')).data.gallery.length, 0);
  assert.equal((await f.call('POST', { action: 'finalize', receipt: prepared.data.receipt })).statusCode, 200);
  assert.equal(f.rows[0].status, 'pending');
  assert.equal((await f.call('GET')).data.gallery.length, 0);
  f.rows[0].status = 'approved';
  const publicData = (await f.call('GET')).data;
  assert.equal(publicData.gallery.length, 1);
  assert.equal(JSON.stringify(publicData).includes('Ana'), false);
});
test('fecha bloqueada en servidor incluso saltándose la interfaz', async () => {
  const f = fixture(true);
  assert.equal((await f.call('GET')).data.upload.code, 'not_started');
  assert.equal((await f.call('POST', { action: 'prepare', uploaderName: 'Ana Pérez', files: [file] })).statusCode, 403);
  assert.equal(f.rows.length, 0);
});
test('rechaza recibos manipulados, fotos ausentes y lotes inválidos', async () => {
  const f = fixture();
  for (const files of [[], Array(11).fill(file), [{ ...file, size: 6291457 }], [{ ...file, type: 'text/html' }]]) {
    assert.equal((await f.call('POST', { action: 'prepare', uploaderName: 'Ana Pérez', files })).statusCode, 400);
  }
  const prepared = await f.call('POST', { action: 'prepare', uploaderName: 'Ana Pérez', files: [file] });
  assert.equal((await f.call('POST', { action: 'finalize', receipt: prepared.data.receipt + 'x' })).statusCode, 403);
  f.missing();
  assert.equal((await f.call('POST', { action: 'finalize', receipt: prepared.data.receipt })).statusCode, 404);
  assert.equal(f.rows[0].status, 'uploading');
});
test('invitación válida sigue disponible después del plazo RSVP', async () => {
  const f = fixture();
  const prepared = await f.call('POST', { action: 'prepare', token: 'valid_invitation_token_123456', uploaderName: 'Ana Pérez', files: [file] });
  assert.equal(prepared.statusCode, 200);
  assert.equal(f.rows[0].invitation_id, 'invite-1');
});
