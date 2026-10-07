(function () {
  'use strict';

  var TARGET_SECTION = 'PBnVwKBzJxQZpBf8';
  var WEDDING_AT = new Date('2026-11-28T15:30:00-05:00').getTime();
  var MEMORIES_OPEN_AT = new Date('2026-11-28T00:00:00-05:00').getTime();
  var ASSETS = './assets/demo3/';
  var confirmationScreen = null;
  var invitationAddress = '';
  var previousOverflow = '';
  var backgroundNodes = [];

  function closeConfirmation() {
    if (!confirmationScreen) return;
    confirmationScreen.remove();
    confirmationScreen = null;
    document.body.style.overflow = previousOverflow;
    backgroundNodes.forEach(function (item) { item.node.inert = item.inert; });
    backgroundNodes = [];
  }

  function openConfirmation(url, restoring) {
    if (confirmationScreen) return;
    if (!restoring) invitationAddress = location.href;
    previousOverflow = document.body.style.overflow;
    backgroundNodes = Array.from(document.body.children).map(function (node) {
      var item = { node: node, inert: node.inert };
      node.inert = true;
      return item;
    });
    confirmationScreen = document.createElement('iframe');
    confirmationScreen.title = 'Confirma tu asistencia';
    confirmationScreen.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647;background:#f4f0e8';
    confirmationScreen.src = url.href;
    document.body.appendChild(confirmationScreen);
    document.body.style.overflow = 'hidden';
    if (!restoring) history.pushState({ confirmationScreen: true }, '', url);
    confirmationScreen.focus();
  }

  window.addEventListener('popstate', function () {
    if (location.href === invitationAddress) closeConfirmation();
    else if (history.state && history.state.confirmationScreen && !confirmationScreen) {
      openConfirmation(new URL(location.href), true);
    }
  });
  window.addEventListener('message', function (event) {
    if (confirmationScreen && event.origin === location.origin &&
        event.source === confirmationScreen.contentWindow && event.data &&
        event.data.type === 'demo2:return-to-invitation') history.back();
  });

  function installMirrorPhoto(section) {
    var photo = section.querySelector('#demo2-mirror-photo-frame img');
    if (!photo) return;
    photo.classList.add('demo2-mirror-photo');
    if (!photo.src.includes('gleen-lesly-confirmacion.jpg')) photo.src = '/assets/demo3/media/gleen-lesly-confirmacion.jpg';
    photo.alt = 'Gleen y Lesly abrazados';
    var frame = photo.parentElement;
    frame.style.width = '450.417px';
    frame.style.height = '600.643px';
    frame.style.transform = 'translateY(5%) translate(-86.6383px, -109.709px) translate(218.208px, 402.822px) rotate(0deg) translate(-218.208px, -382.822px)';
    frame.style.transformOrigin = '0px 0px';
    frame.style.opacity = '1';
  }

  function updateMemoriesAccess() {
    var link = document.querySelector('[data-guest-memories-link]');
    if (!link) return;
    var available = Date.now() >= MEMORIES_OPEN_AT;
    link.textContent = available ? 'Ver y subir recuerdos' : 'Disponible el 28 de noviembre';
    if (available) {
      var url = new URL('./recuerdos.html?from=invitation', location.href);
      if (window.demo2InviteToken) url.searchParams.set('invite', window.demo2InviteToken);
      link.href = url.pathname + url.search;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
    }
  }

  function invitationHtml() {
    return '<div class="demo3-long-page">' +
      '<p class="demo3-scroll-hint">Desliza para conocer todos los detalles <span aria-hidden="true">↓</span></p>' +
      '<section class="demo3-countdown demo3-long-section" id="cuenta-regresiva" aria-labelledby="countdownTitle">' +
        '<div class="demo3-closing-inner"><p class="demo3-long-eyebrow">28 de noviembre de 2026</p><h2 id="countdownTitle">Nos vemos en:</h2>' +
          '<div class="demo3-countdown-grid" aria-live="off">' +
            '<div class="demo3-countdown-item"><span class="demo3-countdown-value" data-unit="days">00</span><span class="demo3-countdown-label">Días</span></div>' +
            '<div class="demo3-countdown-item"><span class="demo3-countdown-value" data-unit="hours">00</span><span class="demo3-countdown-label">Horas</span></div>' +
            '<div class="demo3-countdown-item"><span class="demo3-countdown-value" data-unit="minutes">00</span><span class="demo3-countdown-label">Minutos</span></div>' +
            '<div class="demo3-countdown-item"><span class="demo3-countdown-value" data-unit="seconds">00</span><span class="demo3-countdown-label">Segundos</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="demo3-long-section demo3-long-celebration demo2-family" id="detalles" aria-labelledby="detailsTitle">' +
        '<div class="demo3-long-inner"><h2 id="detailsTitle">Con la bendición y compañía<br>de nuestros padres</h2>' +
          '<div class="demo2-family-grid"><article><h3>Padres del novio</h3><p>Reyna de los Milagros Castillo Heredia</p><p>Glen Pablo Sandoval Ruiz</p></article>' +
          '<article><h3>Padres de la novia</h3><p>Julio Castro Tassara</p><p>Verónica Valdez Becerra de Castro</p></article></div>' +
          '<h2 class="demo2-family-together">Junto a</h2><div class="demo2-family-grid">' +
          '<article class="demo2-family-witnesses"><h3>Testigos</h3><p>Gian Navarro Garrido</p><p>Rosa Arcela Ojeda</p></article>' +
          '<article><h3>Padrinos del novio</h3><p>Jorge Luis Garcia Espinoza</p><p>Ruth Flores Calle</p></article>' +
          '<article><h3>Padrinos de la novia</h3><p>Jaime Valdiviezo Marcelo</p><p>Heydy Abab Burgos</p></article></div>' +
        '</div></section>' +
      '<section class="demo3-long-section demo3-timeline" id="cronograma" aria-labelledby="timelineTitle"><div class="demo3-long-inner"><h2 id="timelineTitle">Itinerario</h2>' +
          '<div class="demo3-long-events" aria-label="Programa de la celebración"><article><img class="demo3-event-icon" src="/assets/demo3/icons/civil.svg" alt="" aria-hidden="true"><span>03:30 PM</span><h3>Ceremonia civil</h3></article><article><img class="demo3-event-icon" src="/assets/demo3/icons/chapel.svg" alt="" aria-hidden="true"><span>04:00 PM</span><h3>Consagración</h3></article><article><img class="demo3-event-icon" src="/assets/demo3/icons/reception.svg" alt="" aria-hidden="true"><span>05:00 PM</span><h3>Recepción</h3></article></div>' +
        '</div></section>' +
      '<section class="demo3-long-section demo3-long-story" id="nuestra-historia" aria-labelledby="storyTitle">' +
        '<h2 id="storyTitle" class="demo2-story-heading">Nuestra historia</h2>' +
        '<div class="demo3-long-inner demo3-long-split"><div class="demo3-long-copy"><h3 class="demo2-story-name">GlenslyLand</h3>' +
          '<p>Contigo entendí que el amor verdadero no se promete solo en palabras sino en cada pequeño instante que se convierte en eternidad</p></div>' +
          '<figure class="demo3-long-photo"><img src="' + ASSETS + 'media/gleen-lesly-3.jpg" alt="Fotografía de Gleen y Lesly" loading="lazy"></figure></div>' +
      '</section>' +
      '<section class="demo3-long-section demo3-long-gifts" id="regalos" aria-labelledby="giftsTitle">' +
        '<div class="demo3-long-inner"><p class="demo3-long-eyebrow">Un detalle para nuestro nuevo comienzo</p><h2 id="giftsTitle">Regalos</h2>' +
          '<p class="demo3-long-lead">Celebrar nuestro amor junto a ustedes es un regalo muy bonito. Si desean acompañarnos también en la construcción de nuestro futuro, recibiremos su detalle con todo nuestro amor.</p>' +
          '<div class="demo3-gift-grid"><article><h3>Gleen Sandoval</h3><p><strong>BCP Soles</strong></p><p>Cuenta: <span class="demo3-gift-number">53592524271077</span></p><p>CCI: <span class="demo3-gift-number">00253519252427107737</span></p><p>Yape: <span class="demo3-gift-number">924 336 163</span></p></article>' +
            '<article><h3>Lesly Castro</h3><p><strong>BCP Soles</strong></p><p>Cuenta: <span class="demo3-gift-number">53596266668076</span></p><p>CCI: <span class="demo3-gift-number">00253519626666807634</span></p><p>Yape: <span class="demo3-gift-number">904 322 221</span></p></article>' +
            '<article class="demo3-gift-physical"><h3>Regalo físico</h3><p>Recibiremos tus regalos con cariño en la casa de la novia.<br>Av. Víctor Raúl, Mz. L, Lt. 12, Ramiro Prialé, Sullana.</p></article></div>' +
        '</div>' +
      '</section>' +
      '<section class="demo3-social demo3-long-section" id="recuerdos" aria-labelledby="socialTitle"><div class="demo3-closing-inner">' +
        '<img class="demo3-social-logo" src="' + ASSETS + 'branding/lg-monogram.png" alt="Monograma de Gleen y Lesly"><div class="demo3-kicker">Comparte este recuerdo</div><h2 id="socialTitle">Etiqueta a los novios</h2>' +
        '<p class="demo3-closing-copy">Durante nuestra boda comparte tus fotografías y videos con nosotros en redes sociales.</p><div class="demo3-tags"><span>#GleenyLes</span><span>#GlenslyLand</span></div>' +
        '<div class="demo3-memory-links"><div class="demo3-album-pending demo3-guest-memories"><strong>Nuestros recuerdos</strong><span>Comparte las fotos que captures durante la celebración.</span><a class="demo3-album-button" data-guest-memories-link aria-disabled="true" tabindex="-1">Disponible el 28 de noviembre</a></div></div>' +
      '</div></section>' +
      '<section class="demo3-farewell demo3-long-section" id="con-carino"><img class="demo3-angels" src="' + ASSETS + 'media/ac55e3d49fc01691837c45349775e860.png" alt="Angelitos decorativos">' +
        '<div class="demo3-kicker">Con cariño</div><h2>Gleen &amp; Lesly</h2><a class="demo3-back" href="#inicio">Volver al inicio</a></section>' +
    '</div>';
  }

  function updateCountdown() {
    var root = document.querySelector('.demo2-migrated-sections .demo3-countdown-grid');
    if (!root) return;
    var remaining = Math.max(0, WEDDING_AT - Date.now());
    var values = { days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60, seconds: Math.floor(remaining / 1000) % 60 };
    Object.keys(values).forEach(function (unit) {
      var node = root.querySelector('[data-unit="' + unit + '"]');
      if (node) node.textContent = String(values[unit]).padStart(2, '0');
    });
  }

  function installReveal(root) {
    var targets = root.querySelectorAll('.demo3-scroll-hint, .demo3-countdown .demo3-closing-inner > *, .demo3-long-story .demo3-long-copy > *, .demo3-long-story .demo3-long-photo, .demo3-long-celebration .demo3-long-inner > *, .demo3-long-events article, .demo3-long-notes article, .demo3-gift-grid article, .demo3-long-rsvp .demo3-rsvp-ornament, .demo3-long-rsvp .demo3-long-deadline, .demo3-social .demo3-closing-inner > *, .demo3-farewell > :not(.demo3-back)');
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
    installMirrorPhoto(section);
    if (window.demo2InviteToken && !new URLSearchParams(location.search).has('invite')) {
      var invitationUrl = new URL(location.href);
      invitationUrl.searchParams.set('invite', window.demo2InviteToken);
      history.replaceState(history.state, '', invitationUrl);
    }
    var confirmationUrl = new URL('./confirmacion.html', location.href);
    var token = window.demo2InviteToken || new URLSearchParams(location.search).get('invite');
    if (token) confirmationUrl.searchParams.set('invite', token);
    section.querySelectorAll('a[href="#page-4"]').forEach(function (link) {
      link.href = confirmationUrl.pathname + confirmationUrl.search;
    });
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
    updateMemoriesAccess();
    if (location.hash === '#inicio') requestAnimationFrame(function () { section.scrollIntoView({ block: 'start' }); });
    var hashTarget = location.hash && wrapper.querySelector(location.hash);
    var requestedSection = new URLSearchParams(location.search).get('section');
    if (requestedSection === 'recuerdos' || requestedSection === 'detalles') hashTarget = wrapper.querySelector('#' + requestedSection);
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
    installMirrorPhoto(section);
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
    if (/\/confirmacion\.html$/i.test(destination.pathname) && !event.ctrlKey &&
        !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openConfirmation(destination);
      return;
    }
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
    if (destination.hash === '#page-4' || destination.hash === '#confirmacion') {
      event.preventDefault();
      event.stopImmediatePropagation();
      var confirmationUrl = new URL('./confirmacion.html', location.href);
      var token = window.demo2InviteToken || new URLSearchParams(location.search).get('invite');
      if (token) confirmationUrl.searchParams.set('invite', token);
      openConfirmation(confirmationUrl);
      return;
    }
    if (destination.hash === '#page-2') {
      event.preventDefault();
      event.stopImmediatePropagation();
      var detailsUrl = new URL('./detalles.html', location.href);
      var detailsToken = window.demo2InviteToken || new URLSearchParams(location.search).get('invite');
      if (detailsToken) detailsUrl.searchParams.set('invite', detailsToken);
      location.href = detailsUrl.href;
      return;
    }
    var hash = { '#page-3': '#nuestra-historia' }[destination.hash];
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
  window.setInterval(updateCountdown, 1000);
  window.setInterval(updateMemoriesAccess, 30000);
  document.addEventListener('visibilitychange', updateMemoriesAccess);
})();
