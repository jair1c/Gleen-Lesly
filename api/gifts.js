const catalog = require('../assets/gift-catalog.json');
const { matchingIds } = require('./_lib/gift-matching');
const { cleanText, getBody, requireAdmin, sendJson, supabaseRequest } = require('./_lib/supabase');

function giftName(value) {
  return cleanText(value, 500).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function findGuest(token) {
  if (!/^[A-Za-z0-9_-]{20,128}$/.test(token)) return null;
  const rows = await supabaseRequest(`invitations?access_token=eq.${encodeURIComponent(token)}&select=id,active,expires_at&limit=1`);
  const guest = rows[0];
  return guest && guest.active && Date.now() < new Date(`${guest.expires_at}T23:59:59.999-05:00`).getTime() ? guest : null;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const params = new URL(req.url, 'https://local.invalid').searchParams;
      if (params.get('view') === 'admin') {
        await requireAdmin(req);
        const reservations = await supabaseRequest('gift_reservations?select=gift_id,created_at,invitations(guest_name)&order=created_at.desc');
        const suggestions = await supabaseRequest('gift_suggestions?select=description,updated_at,invitations(guest_name)&order=updated_at.desc');
        const external = catalog.filter(item => item.reservedExternally && !reservations.some(row => row.gift_id === item.id)).map(item => ({ name: item.name, guest: 'Elegido fuera de la lista', date: null }));
        return sendJson(res, 200, { reservations: reservations.map(row => ({ name: catalog.find(item => item.id === row.gift_id)?.name || row.gift_id, guest: row.invitations?.guest_name || '', date: row.created_at })).concat(external), suggestions: suggestions.map(row => ({ description: row.description, guest: row.invitations?.guest_name || '', date: row.updated_at })) });
      }
      const token = params.get('token') || '';
      const guest = await findGuest(token);
      const rows = await supabaseRequest('gift_reservations?select=gift_id,invitation_id');
      const suggestions = await supabaseRequest('gift_suggestions?select=invitation_id,description');
      const suggestedIds = new Set(suggestions.flatMap(row => matchingIds(row.description)));
      return sendJson(res, 200, { gifts: catalog.map(item => ({ ...item, reserved: !!item.reservedExternally || rows.some(row => row.gift_id === item.id) || suggestedIds.has(item.id), mine: !item.reservedExternally && !!guest && rows.some(row => row.gift_id === item.id && row.invitation_id === guest.id) })), canReserve: !!guest, suggestion: suggestions.find(row => guest && row.invitation_id === guest.id)?.description || '' });
    }
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Método no permitido.' });
    const body = await getBody(req);
    const guest = await findGuest(String(body.token || ''));
    if (!guest) return sendJson(res, 403, { error: 'Abre la lista desde tu enlace personal de invitación para elegir un regalo.' });
    if (body.action === 'suggest') {
      const description = cleanText(body.description, 500);
      if (!description) return sendJson(res, 400, { error: 'Cuéntanos qué otro detalle deseas llevar.' });
      const suggestions = await supabaseRequest('gift_suggestions?select=invitation_id,description');
      const reservations = await supabaseRequest('gift_reservations?select=gift_id');
      const ids = matchingIds(description);
      const picked = new Set([...catalog.filter(item => item.reservedExternally).map(item => item.id), ...reservations.map(row => row.gift_id)]);
      if (ids.some(id => picked.has(id))) return sendJson(res, 409, { error: 'Ya hay un regalo escogido con ese nombre. Por favor, elige otro detalle para evitar regalos repetidos.' });
      if (suggestions.some(item => item.invitation_id !== guest.id && (giftName(item.description) === giftName(description) || matchingIds(item.description).some(id => ids.includes(id))))) {
        return sendJson(res, 409, { error: 'Otro invitado ya eligió un regalo con ese nombre. Por favor, escribe otro detalle para evitar regalos repetidos.' });
      }
      await supabaseRequest('gift_suggestions?on_conflict=invitation_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ invitation_id: guest.id, description, updated_at: new Date().toISOString() }) });
      return sendJson(res, 200, { ok: true });
    }
    const item = catalog.find(item => item.id === body.giftId);
    if (!item) return sendJson(res, 400, { error: 'Ese regalo no está en nuestra lista.' });
    if (item.reservedExternally) return sendJson(res, 409, { error: 'Este regalo ya está escogido. Por favor, elige otro detalle.' });
    if (body.action === 'release') {
      await supabaseRequest(`gift_reservations?gift_id=eq.${item.id}&invitation_id=eq.${guest.id}`, { method: 'DELETE' });
    } else if (body.action === 'reserve') {
      const suggestions = await supabaseRequest('gift_suggestions?select=description');
      if (suggestions.some(row => matchingIds(row.description).includes(item.id))) return sendJson(res, 409, { error: 'Ya hay un regalo escogido con ese nombre. Por favor, elige otro detalle.' });
      // La clave única en gift_id decide también entre dos elecciones simultáneas.
      await supabaseRequest('gift_reservations', { method: 'POST', body: JSON.stringify({ gift_id: item.id, invitation_id: guest.id }) });
    } else return sendJson(res, 400, { error: 'Acción no válida.' });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    if (error.status === 401 || error.status === 403) return sendJson(res, error.status, { error: error.message });
    if (error.details?.code === '23505') return sendJson(res, 409, { error: 'Alguien acaba de elegir este regalo. Puedes escoger otro detalle.' });
    console.error('Gift registry:', error.message);
    return sendJson(res, 503, { error: 'No pudimos consultar la lista. Inténtalo nuevamente en un momento.' });
  }
};
