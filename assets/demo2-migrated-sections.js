(function () {
  'use strict';

  var TARGET_SECTION = 'PBnVwKBzJxQZpBf8';
  var WEDDING_AT = new Date('2026-11-28T15:00:00-05:00').getTime();
  var ASSETS = './assets/demo3/';

  function invitationHtml() {
    var token = window.demo2InviteToken || new URLSearchParams(location.search).get('invite');
    var rsvpUrl = './_website-element-widget.html?v=2' + (token ? '&invite=' + encodeURIComponent(token) : '');
    return '<div class="demo3-long-page">' +
      '<p class="demo3-scroll-hint">Desliza para conocer todos los detalles <span aria-hidden="true">↓</span></p>' +
      '<section class="demo3-countdown demo3-long-section" id="cuenta-regresiva" aria-labelledby="countdownTitle">' +
        '<div class="demo3-closing-inner"><p class="demo3-long-eyebrow">28 de noviembre de 2026</p><h2 id="countdownTitle">Nos vemos en:</h2>' +
          '<div class="demo3-countdown-grid" aria-live="off">' +
            '<div class="demo3-countdown-item"><span class="demo3-countdown-value" data-unit="days">00</span><span class="demo3-countdown-label">Días</span></div>' +
            '<div class="demo3-countdown-item"><span class="demo3-countdown-value" data-unit="hours">00</span><span class="demo3-countdown-label">Horas</span></div>' +
            '<div class="demo3-countdown-item"><span class="demo3-countdown-value" data-unit="seconds">0000</span><span class="demo3-countdown-label">Segundos</span></div>' +
          '</div>' +
          '<figure class="demo3-countdown-polaroid"><img src="' + ASSETS + 'media/gleen-lesly-historia.jpg" alt="Gleen y Lesly juntos" loading="lazy"><figcaption>Gleen &amp; Lesly</figcaption></figure>' +
          '<p class="demo3-date-line">De la mano hacia un nuevo comienzo.<br>Gracias por acompañarnos.</p>' +
        '</div>' +
      '</section>' +
      '<section class="demo3-long-section demo3-long-story" id="nuestra-historia" aria-labelledby="storyTitle">' +
        '<div class="demo3-long-inner demo3-long-split"><div class="demo3-long-copy"><p class="demo3-long-eyebrow">Un mensaje de nosotros</p><h2 id="storyTitle">Nuestra historia</h2>' +
          '<p>Hoy queremos celebrar junto a las personas que han acompañado nuestro camino. Gracias por ser parte de este nuevo comienzo.</p></div>' +
          '<figure class="demo3-long-photo"><img src="' + ASSETS + 'media/gleen-lesly-detalles.jpg" alt="Fotografía de Gleen y Lesly" loading="lazy"></figure></div>' +
      '</section>' +
      '<section class="demo3-long-section demo3-long-celebration" id="detalles" aria-labelledby="detailsTitle">' +
        '<div class="demo3-long-inner"><p class="demo3-long-eyebrow">El día que compartiremos</p><h2 id="detailsTitle">La celebración</h2>' +
          '<p class="demo3-long-lead">Sábado 28 de noviembre de 2026<br>Club Campestre “Los Cantaritos” · Sullana</p>' +
          '<div class="demo3-long-events"><article><span>03:00 PM</span><h3>Ceremonia civil</h3></article><article><span>04:00 PM</span><h3>Consagración</h3></article><article><span>Después</span><h3>Recepción y celebración</h3></article></div>' +
          '<p>Club Campestre “Los Cantaritos”<br>Calle Cola del Alacrán S/N, Sullana<br>Frente al Club Campestre “Pájaro Loco Sport”</p>' +
          '<a class="demo3-long-button" href="https://www.google.com/maps/search/?api=1&amp;query=Club+Campestre+Los+Cantaritos+Cola+del+Alacran+Sullana" target="_blank" rel="noopener">Ver ubicación en el mapa</a>' +
          '<div class="demo3-long-notes"><article><h3>Vestimenta</h3><p>Elegancia clásica en tonos sobrios, cómoda para disfrutar toda la celebración.</p></article>' +
            '<article><h3>Estacionamiento</h3><p>Habrá estacionamiento para los invitados en el lugar.</p></article>' +
            '<article><h3>Solo adultos</h3><p>Para disfrutar plenamente de la celebración, el evento será solo para adultos.</p></article></div>' +
        '</div>' +
      '</section>' +
      '<section class="demo3-long-section demo3-long-gifts" id="regalos" aria-labelledby="giftsTitle">' +
        '<div class="demo3-long-inner"><p class="demo3-long-eyebrow">Un detalle para nuestro nuevo comienzo</p><h2 id="giftsTitle">Regalos</h2>' +
          '<p class="demo3-long-lead">Celebrar nuestro amor junto a ustedes es un regalo muy bonito. Si desean acompañarnos también en la construcción de nuestro futuro, recibiremos su detalle con todo nuestro amor.</p>' +
          '<div class="demo3-gift-grid"><article><h3>Gleen Sandoval</h3><p><strong>BCP Soles</strong></p><p>Cuenta: <span class="demo3-gift-number">53592524271077</span></p><p>CCI: <span class="demo3-gift-number">00253519252427107737</span></p><p>Yape: <span class="demo3-gift-number">924 336 163</span></p></article>' +
            '<article><h3>Lesly Castro</h3><p><strong>BCP Soles</strong></p><p>Cuenta: <span class="demo3-gift-number">53596266668076</span></p><p>CCI: <span class="demo3-gift-number">00253519626666807634</span></p><p>Yape: <span class="demo3-gift-number">904 322 221</span></p></article>' +
            '<article class="demo3-gift-physical"><h3>Regalo físico</h3><p>Si prefieres entregarnos un detalle en persona, lo recibiremos con mucho cariño el día de la boda.</p></article></div>' +
        '</div>' +
      '</section>' +
      '<section class="demo3-long-section demo3-long-rsvp" id="confirmacion" aria-label="Confirmación de asistencia">' +
        '<div class="demo3-long-inner"><div class="demo3-rsvp-ornament" aria-hidden="true">✧</div>' +
          '<iframe class="demo3-long-rsvp-frame" title="Formulario de confirmación" src="' + rsvpUrl + '" scrolling="no"></iframe>' +
          '<p class="demo3-long-deadline" aria-live="polite"></p></div>' +
      '</section>' +
      '<section class="demo3-social demo3-long-section" id="recuerdos" aria-labelledby="socialTitle"><div class="demo3-closing-inner">' +
        '<img class="demo3-social-logo" src="' + ASSETS + 'branding/lg-monogram.png" alt="Monograma de Gleen y Lesly"><div class="demo3-kicker">Comparte este recuerdo</div><h2 id="socialTitle">Etiqueta a los novios</h2>' +
        '<p class="demo3-closing-copy">Durante nuestra boda comparte tus fotografías y videos con nosotros en redes sociales.</p><div class="demo3-tags"><span>#GleenyLes</span><span>#GlenslyLand</span></div>' +
        '<div class="demo3-memory-links"><div class="demo3-album-pending"><strong>Álbum de los novios</strong><span>Recorre nuestra baraja de momentos y fotografías.</span><a class="demo3-album-button" href="./album.html?from=invitation">Ver álbum de fotos</a></div>' +
          '<div class="demo3-album-pending demo3-guest-memories"><strong>Recuerdos de nuestros invitados</strong><span>Comparte las fotos que captures durante la celebración.</span><a class="demo3-album-button" href="./recuerdos.html?from=invitation">Ver y subir recuerdos</a></div></div>' +
      '</div></section>' +
      '<section class="demo3-farewell demo3-long-section" id="con-carino"><img class="demo3-angels" src="' + ASSETS + 'media/ac55e3d49fc01691837c45349775e860.png" alt="Angelitos decorativos">' +
        '<div class="demo3-kicker">Con cariño</div><h2>Gleen &amp; Lesly</h2><a class="demo3-back" href="#inicio">Volver al inicio</a></section>' +
    '</div>';
  }

  function updateCountdown() {
    var root = document.querySelector('.demo2-migrated-sections .demo3-countdown-grid');
    if (!root) return;
    var remaining = Math.max(0, WEDDING_AT - Date.now());
    var values = { days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, seconds: Math.floor(remaining / 1000) % 3600 };
    Object.keys(values).forEach(function (unit) {
      var node = root.querySelector('[data-unit="' + unit + '"]');
      if (node) node.textContent = String(values[unit]).padStart(unit === 'seconds' ? 4 : 2, '0');
    });
  }

  function installReveal(root) {
    var targets = root.querySelectorAll('.demo3-scroll-hint, .demo3-countdown .demo3-closing-inner > *, .demo3-long-story .demo3-long-copy > *, .demo3-long-story .demo3-long-photo, .demo3-long-celebration .demo3-long-inner > *, .demo3-long-events article, .demo3-long-notes article, .demo3-gift-grid article, .demo3-long-rsvp .demo3-rsvp-ornament, .demo3-long-rsvp .demo3-long-deadline, .demo3-social .demo3-closing-inner > *, .demo3-farewell > *');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(function (node) { node.classList.add('demo3-reveal', 'is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (node, index) { node.classList.add('demo3-reveal'); node.style.setProperty('--demo3-reveal-delay', Math.min(index % 6, 4) * 90 + 'ms'); observer.observe(node); });
  }

  /* Canva ya define las coordenadas responsivas de la composición original.
     No recalculamos sus piezas: solo añadimos las secciones posteriores. */
  function fitOpenCollage(section) {
    return section;
  }

  function trimOriginalCollage(section) {
    var frame = section.querySelector('#LBWxLNNX5DqRSFgV');
    if (!frame) return;
    var sectionRect = section.getBoundingClientRect();
    var frameRect = frame.getBoundingClientRect();
    var height = Math.ceil(frameRect.bottom - sectionRect.top + 18);
    if (!Number.isFinite(height) || height <= 0) return;
    section.style.setProperty('height', height + 'px', 'important');
    section.style.setProperty('max-height', height + 'px', 'important');
    section.style.setProperty('overflow', 'hidden', 'important');
  }

  function alignOriginalCalendar() {
    var calendar = document.getElementById('LB7qHBC0SsRPYpnz');
    if (!calendar) return;
    Array.prototype.forEach.call(calendar.querySelectorAll('p'), function (day) {
      var value = day.textContent.trim();
      day.classList.toggle('demo2-wedding-date', value === '28');
      day.classList.toggle('demo2-former-wedding-date', value === '18');
      if (value === '31') day.style.visibility = 'hidden';
    });
  }

  function install() {
    var section = document.getElementById(TARGET_SECTION);
    if (!section || !section.parentElement) return;
    if (window.demo2InviteToken && !new URLSearchParams(location.search).has('invite')) {
      var invitationUrl = new URL(location.href);
      invitationUrl.searchParams.set('invite', window.demo2InviteToken);
      history.replaceState(history.state, '', invitationUrl);
    }
    fitOpenCollage(section);
    alignOriginalCalendar();
    trimOriginalCollage(section);
    if (document.querySelector('.demo2-migrated-sections')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'demo2-migrated-sections';
    wrapper.innerHTML = invitationHtml();
    section.insertAdjacentElement('afterend', wrapper);
    installReveal(wrapper);
    updateCountdown();
    if (location.hash === '#inicio') requestAnimationFrame(function () { section.scrollIntoView({ block: 'start' }); });
    var hashTarget = location.hash && wrapper.querySelector(location.hash);
    if (hashTarget) requestAnimationFrame(function () { hashTarget.scrollIntoView({ block: 'start' }); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
  window.setTimeout(install, 250);
  window.setTimeout(install, 900);
  window.addEventListener('resize', install, { passive: true });
  // La versión responsiva de Canva inserta la página abierta al navegar.
  // Los temporizadores iniciales pueden vencer antes de que exista esa sección.
  var pageObserver = new MutationObserver(function () {
    var section = document.getElementById(TARGET_SECTION);
    if (!section) return;
    trimOriginalCollage(section);
    if (!document.querySelector('.demo2-migrated-sections')) install();
    else if (!document.querySelector('.demo2-wedding-date')) alignOriginalCalendar();
  });
  pageObserver.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var destination;
    try { destination = new URL(link.getAttribute('href'), location.href); } catch (_) { return; }
    if (destination.origin !== location.origin) return;
    if (destination.hash === '#inicio' && link.matches('.demo3-back')) {
      var beginning = document.getElementById(TARGET_SECTION);
      if (!beginning) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var beginningUrl = new URL(location.href);
      beginningUrl.hash = 'inicio';
      history.pushState(null, '', beginningUrl);
      beginning.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    var hash = { '#page-2': '#detalles', '#page-3': '#nuestra-historia', '#page-4': '#confirmacion' }[destination.hash];
    if (!hash) return;
    var target = document.querySelector('.demo2-migrated-sections ' + hash);
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var url = new URL(location.href);
    if (window.demo2InviteToken) url.searchParams.set('invite', window.demo2InviteToken);
    url.hash = hash;
    history.pushState(null, '', url);
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }, true);
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin || !event.data) return;
    var frame = document.querySelector('.demo2-migrated-sections .demo3-long-rsvp-frame');
    if (!frame || event.source !== frame.contentWindow) return;
    if (event.data.type === 'demo3:invitation-loaded' && /^\d{4}-\d{2}-\d{2}$/.test(event.data.exp)) {
      var parts = event.data.exp.split('-').map(Number);
      var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      if (date.getUTCFullYear() === parts[0] && date.getUTCMonth() === parts[1] - 1 && date.getUTCDate() === parts[2]) {
        var deadline = document.querySelector('.demo2-migrated-sections .demo3-long-deadline');
        if (deadline) deadline.textContent = 'Confirma tu asistencia antes del ' + new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date) + '.';
      }
    }
    if (event.data.type === 'demo3:rsvp-height' && Number.isFinite(event.data.height)) {
      frame.style.height = Math.max(300, Math.ceil(event.data.height)) + 'px';
    }
  });
  window.setInterval(updateCountdown, 1000);
})();
