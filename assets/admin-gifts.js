(function () {
  var app = document.getElementById('appView');
  var panel = document.createElement('section'); panel.className = 'panel photos-panel';
  var heading = document.createElement('h2'); heading.textContent = 'Detalles para nuestro hogar';
  var button = document.createElement('button'); button.type = 'button'; button.className = 'btn secondary small'; button.textContent = 'Actualizar regalos';
  var list = document.createElement('div'); list.className = 'invites'; list.setAttribute('aria-live', 'polite');
  panel.append(heading, button, list); app.append(panel);
  async function load() {
    var token = sessionStorage.getItem('lg_admin_session'); if (!token) return;
    try {
      var response = await fetch('/api/gifts?view=admin', { headers: { Authorization: 'Bearer ' + token } });
      var data = await response.json(); if (!response.ok) throw new Error(data.error);
      list.replaceChildren();
      data.reservations.map(function (row) { return { guest: row.guest, text: row.name }; }).concat(data.suggestions.map(function (row) { return { guest: row.guest, text: 'Otro detalle: ' + row.description }; })).forEach(function (row) {
        var card = document.createElement('article'); card.className = 'invite';
        var name = document.createElement('strong'); name.textContent = row.guest;
        var detail = document.createElement('p'); detail.textContent = row.text;
        card.append(name, detail); list.append(card);
      });
      if (!list.childElementCount) list.textContent = 'Aún no hay detalles elegidos.';
    } catch (error) { list.textContent = error.message; }
  }
  button.addEventListener('click', load);
  new MutationObserver(function () { if (!app.classList.contains('hidden')) load(); }).observe(app, { attributes: true, attributeFilter: ['class'] });
  load();
})();
