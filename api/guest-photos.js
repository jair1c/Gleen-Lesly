const { randomUUID, createHmac, timingSafeEqual } = require('node:crypto');
const { cleanText, getBody, sendJson, storageRequest, supabaseRequest } = require('./_lib/supabase');
const BUCKET = 'wedding-uploads';
const OPEN_AT = Date.parse('2026-11-28T00:00:00-05:00');
const MAX_SIZE = 6 * 1024 * 1024;
function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function receipt(ids) {
  const payload = Buffer.from(JSON.stringify({ ids, exp: Date.now() + 2 * 3600000 })).toString('base64url');
  return payload + '.' + createHmac('sha256', process.env.SUPABASE_SECRET_KEY).update(payload).digest('base64url');
}
function readReceipt(value) {
  const [payload, signature] = String(value || '').split('.');
  if (!payload || !signature) fail('El envío no es válido. Vuelve a seleccionar tus fotos.');
  const expected = createHmac('sha256', process.env.SUPABASE_SECRET_KEY).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) fail('El envío no es válido.', 403);
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (data.exp < Date.now()) fail('El envío venció. Vuelve a seleccionar tus fotos.');
  return data.ids;
}
async function invitation(token) {
  if (!token) return null;
  if (!/^[A-Za-z0-9_-]{20,128}$/.test(token)) fail('La invitación no es válida.', 403);
  const rows = await supabaseRequest(`invitations?access_token=eq.${encodeURIComponent(token)}&select=id,guest_name,active&limit=1`);
  if (!rows[0] || !rows[0].active) fail('La invitación no está disponible.', 403);
  // La fecha límite de RSVP no debe impedir compartir recuerdos el día de la boda.
  return rows[0];
}
function storageUrl(path) {
  return new URL(path.startsWith('/storage/v1/') ? path : '/storage/v1' + path, process.env.SUPABASE_URL).href;
}
module.exports = async function handler(req, res) {
  try {
    if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return sendJson(res, 405, { error: 'Método no permitido.' }); }
    const open = Date.now() >= OPEN_AT;
    if (req.method === 'GET') {
      const token = new URL(req.url, 'http://localhost').searchParams.get('token') || '';
      const guest = await invitation(token);
      const rows = await supabaseRequest('guest_photos?status=eq.approved&select=id,storage_path,caption&order=approved_at.desc&limit=300');
      let gallery = [];
      if (rows.length) {
        const signed = await storageRequest(`object/sign/${BUCKET}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 1800, paths: rows.map(row => row.storage_path) }) });
        gallery = rows.map((row, index) => ({ id: row.id, caption: row.caption || '', url: signed[index] && signed[index].signedURL ? storageUrl(signed[index].signedURL) : '' })).filter(row => row.url);
      }
      return sendJson(res, 200, { gallery, invitation: guest ? { names: guest.guest_name } : null, upload: { allowed: open, code: open ? 'ready' : 'not_started', message: open ? 'Comparte tus fotografías. Las revisaremos antes de publicarlas.' : 'Podrás compartir tus fotografías desde el 28 de noviembre.' } });
    }
    if (!open) fail('La subida de fotografías se habilita el 28 de noviembre.', 403);
    const body = await getBody(req);
    if (body.action === 'prepare') {
      const guest = await invitation(String(body.token || ''));
      const name = cleanText(body.uploaderName, 100);
      if (name.length < 3) fail('Escribe tu nombre y apellido para identificar tus fotografías.');
      if (!Array.isArray(body.files) || !body.files.length || body.files.length > 10) fail('Selecciona entre 1 y 10 fotografías.');
      for (const file of body.files) {
        if (file.type !== 'image/jpeg' || !Number.isInteger(file.size) || file.size < 1 || file.size > MAX_SIZE || !Number.isInteger(file.width) || !Number.isInteger(file.height) || Math.min(file.width, file.height) < 640 || Math.max(file.width, file.height) > 2400) fail('Una fotografía no cumple los límites de formato, tamaño o resolución.');
      }
      const rows = body.files.map(file => {
        const id = randomUUID();
        return { id, invitation_id: guest ? guest.id : null, uploader_name: name, storage_path: `guests/${id}.jpg`, original_name: cleanText(file.name, 180) || 'recuerdo.jpg', mime_type: file.type, size_bytes: file.size, width: file.width, height: file.height, status: 'uploading' };
      });
      await supabaseRequest('guest_photos', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
      const uploads = [];
      for (const row of rows) {
        const result = await storageRequest(`object/upload/sign/${BUCKET}/${row.storage_path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        uploads.push({ id: row.id, signedUrl: storageUrl(result.url || result.signedURL) });
      }
      return sendJson(res, 200, { uploads, receipt: receipt(rows.map(row => row.id)), publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '' });
    }
    if (body.action === 'finalize') {
      const ids = readReceipt(body.receipt);
      if (!Array.isArray(ids) || !ids.length || ids.length > 10 || ids.some(id => !/^[0-9a-f-]{36}$/i.test(id))) fail('El envío no es válido.');
      const filter = `id=in.(${ids.join(',')})`;
      const rows = await supabaseRequest(`guest_photos?${filter}&select=id,storage_path,size_bytes,mime_type,status`);
      if (rows.length !== ids.length) fail('No encontramos todas las fotografías del envío.');
      for (const row of rows.filter(row => row.status === 'uploading')) {
        const object = await storageRequest(`object/info/${BUCKET}/${row.storage_path}`);
        const metadata = object.metadata || {};
        if (Number(metadata.size) !== row.size_bytes || metadata.mimetype !== row.mime_type) fail('Una fotografía no terminó de subir o no coincide con el archivo esperado.');
      }
      await supabaseRequest(`guest_photos?${filter}&status=eq.uploading`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'pending', uploaded_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
      return sendJson(res, 200, { message: '¡Gracias! Tus fotografías están pendientes de aprobación por los novios.' });
    }
    fail('Acción no válida.');
  } catch (error) {
    console.error('Guest photos API:', error.message);
    return sendJson(res, error.status && error.status < 500 ? error.status : 500, { error: error.status && error.status < 500 ? error.message : 'No pudimos procesar las fotografías. Intenta nuevamente en unos minutos.' });
  }
};
