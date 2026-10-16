(function () {
  'use strict';
  var token = new URLSearchParams(location.search).get('invite') || '';
  var gifts = [], canReserve = false, busy = false;
  var grid = document.getElementById('gift-grid'), status = document.getElementById('gift-status');
  var search = document.getElementById('gift-search'), available = document.getElementById('gift-available');
  var form = document.getElementById('gift-other-form'), description = document.getElementById('gift-description');
  var otherStatus = document.getElementById('gift-other-status');
  var back = document.querySelector('.gift-back');
  if (token) back.href += '&invite=' + encodeURIComponent(token);
  if (window.parent !== window) back.addEventListener('click', function (event) {
    event.preventDefault(); window.parent.postMessage({ type: 'demo2:return-to-invitation' }, location.origin);
  });
  function element(tag, text, className) { var el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el; }
  function render() {
    grid.replaceChildren();
    var term = search.value.toLocaleLowerCase('es');
    gifts.filter(function (gift) { return gift.name.toLocaleLowerCase('es').includes(term) && (!available.checked || !gift.reserved); }).forEach(function (gift) {
      var card = element('article', '', 'gift-card'); card.dataset.reserved = gift.reserved;
      var photo = element(gift.url ? 'a' : 'div', '', 'gift-photo');
      if (gift.url) { photo.href = gift.url; photo.target = '_blank'; photo.rel = 'noopener noreferrer'; photo.setAttribute('aria-label', 'Ver ' + gift.name + ' en la tienda'); }
      var placeholder = function () { photo.replaceChildren(element('span', 'Un detalle para nuestro hogar', 'gift-placeholder')); };
      if (gift.image) { var img = element('img'); img.src = gift.image; img.alt = gift.name; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; img.addEventListener('error', placeholder, { once: true }); photo.append(img); } else placeholder();
      card.append(photo, element('span', gift.unknown ? 'Disponibilidad por consultar' : gift.mine ? 'Elegido por ti' : gift.reserved ? 'Ya elegido' : 'Disponible', 'gift-badge'), element('h2', gift.name));
      if (gift.reference) card.append(element('p', 'Ilustración de referencia', 'gift-badge'));
      var actions = element('div', '', 'gift-actions');
      if (gift.url) { var link = element('a', 'Ver en la tienda'); link.href = gift.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; actions.append(link); }
      var button = element('button', gift.mine ? 'Liberar mi elección' : gift.reserved ? 'Ya elegido' : 'Elegir este detalle');
      button.disabled = busy || !canReserve || (gift.reserved && !gift.mine);
      button.addEventListener('click', function () { update({ action: gift.mine ? 'release' : 'reserve', giftId: gift.id }); });
      actions.append(button); card.append(actions); grid.append(card);
    });
    if (!grid.childElementCount) grid.append(element('p', 'No hay detalles que coincidan con tu búsqueda.'));
  }
  async function load() {
    var response = await fetch('/api/gifts?token=' + encodeURIComponent(token));
    var data = await response.json(); if (!response.ok) throw new Error(data.error);
    gifts = data.gifts; canReserve = data.canReserve;
    description.value = data.suggestion; form.querySelector('button').disabled = !canReserve;
    status.textContent = canReserve ? 'Puedes elegir un detalle y cambiar tu elección si lo necesitas.' : 'Puedes explorar las ideas. Para elegir un regalo, abre esta página desde tu invitación personal.';
    render();
  }
  async function update(body) {
    if (busy) return; busy = true; render(); form.querySelector('button').disabled = true;
    try {
      var response = await fetch('/api/gifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ token: token }, body)) });
      var data = await response.json();
      if (!response.ok) { if (response.status === 409 && body.action !== 'suggest') await load(); throw new Error(data.error); }
      await load();
      var message = body.action === 'suggest' ? 'Tu detalle quedó guardado. ¡Muchas gracias por acompañarnos!' : body.action === 'release' ? 'Tu elección quedó liberada.' : 'Este detalle quedó elegido por ti. ¡Muchas gracias!';
      (body.action === 'suggest' ? otherStatus : status).textContent = message;
    } catch (error) { (body.action === 'suggest' ? otherStatus : status).textContent = error.message; }
    finally { busy = false; render(); form.querySelector('button').disabled = !canReserve; }
  }
  search.addEventListener('input', render); available.addEventListener('change', render);
  form.addEventListener('submit', function (event) { event.preventDefault(); if (form.reportValidity()) update({ action: 'suggest', description: description.value }); });
  load().catch(async function () {
    canReserve = false; form.querySelector('button').disabled = true;
    status.textContent = 'Puedes ver nuestras ideas. La disponibilidad no se pudo consultar; vuelve a intentarlo en un momento para elegir un detalle.';
    try {
      var response = await fetch('assets/gift-catalog.json');
      if (!response.ok) throw new Error('catalog');
      gifts = (await response.json()).map(function (gift) { return Object.assign({}, gift, { reserved: !!gift.reservedExternally, unknown: !gift.reservedExternally }); });
      available.disabled = true; render();
    } catch (_) { status.textContent = 'No pudimos cargar la lista. Vuelve a intentarlo en un momento.'; }
  });
})();
