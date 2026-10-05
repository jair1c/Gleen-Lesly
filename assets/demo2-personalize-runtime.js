(function () {
  'use strict';

  // Cambiamos únicamente el contenido visible: el motor original conserva
  // sus tamaños, coordenadas, máscaras y animaciones en cada viewport.
  var replacements = [
    [/Rachel/g, 'Gleen'],
    [/Carter/g, 'Lesly'],
    [/A LOVE LETTER FROM/g, 'UNA CARTA DE AMOR DE'],
    [/CLICK TO OPEN\.\.\./gi, 'CLIC PARA ABRIR...'],
    [/BACK TO ENVELOPE/gi, 'VOLVER AL SOBRE'],
    [/THE WEDDING OF/g, 'LA BODA DE'],
    [/WITH LOVE/gi, 'CON AMOR'],
    [/Our Story/gi, 'Historia'],
    [/Details/gi, 'Detalles'],
    [/Click here/gi, 'Ver detalles'],
    [/Rsvp/gi, 'Confirma'],
    [/June 2027/g, 'Noviembre 2026'],
    [/4:30PM AT/g, '2:30 PM EN'],
    [/Solara Canyon Retreat/gi, 'Los Cantaritos'],
    [/Palm Springs, CA/gi, 'Sullana, Piura']
  ];

  function personalize() {
    var cover = document.getElementById('PByb2KV5jZ9P1h1c');
    if (cover) {
      cover.querySelectorAll('img[src*="envelope-white.png"]').forEach(function (image) {
        var envelope = image.closest('.DF_utQ');
        if (!envelope || envelope.querySelector('.demo2-cover-bouquet')) return;
        envelope.classList.add('demo2-cover-envelope');
        ['left', 'right'].forEach(function (side) {
          var flowers = document.createElement('span');
          flowers.className = 'demo2-cover-bouquet demo2-cover-bouquet-' + side;
          flowers.setAttribute('aria-hidden', 'true');
          envelope.appendChild(flowers);
        });
      });
    }
    // Medidas y encuadre elegidos para la fotografía de Historia.
    document.querySelectorAll('#PBnVwKBzJxQZpBf8 img[src*="7cafb878c428817a3252767e625c279f.png"]:not(.demo2-mirror-photo), #PBnVwKBzJxQZpBf8 img[src*="01c2a6286fa931df44c7777a4daa0304.png"]:not(.demo2-mirror-photo), #PBnVwKBzJxQZpBf8 img[src*="gleen-lesly-confirmacion.jpg"]:not(.demo2-mirror-photo), #PBnVwKBzJxQZpBf8 img[src*="gleen-lesly-2.jpeg"]').forEach(function (image) {
      if (image.closest('#demo2-mirror-photo-frame')) return;
      if (!image.src.includes('gleen-lesly-2.jpeg')) image.src = '/assets/demo3/media/gleen-lesly-2.jpeg';
      var frame = image.parentElement;
      if (frame) {
        frame.style.width = '275.122px';
        frame.style.height = '380.997px';
        frame.style.transform = 'translate(-17.1707px, -48.744px) translate(149.061px, 223.999px) rotate(0deg) translate(-149.061px, -223.999px)';
        frame.style.transformOrigin = '0px 0px';
        frame.style.opacity = '1';
      }
    });
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest('script, style, noscript')) continue;
      var next = node.nodeValue;
      if (node.parentElement.closest('#LBtb18hX61WmVN3f')) {
        next = next.replace(/Kindly/gi, 'Confirma').replace(/Rsvp/gi, 'hoy');
      }
      if (node.parentElement.closest('#LBCww0zp2db2W2vt')) {
        next = next.replace(/Click here/gi, 'Toca el sobre');
      }
      replacements.forEach(function (rule) { next = next.replace(rule[0], rule[1]); });
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  var queued = false;
  var observer = new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; personalize(); });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', personalize, { once: true });
  else personalize();
})();
