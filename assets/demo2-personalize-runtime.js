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
    [/Click here/gi, 'Clic aquí'],
    [/Kindly/gi, 'Confirma'],
    [/Rsvp/gi, 'Aquí'],
    [/June 2027/g, 'Noviembre 2026'],
    [/4:30PM AT/g, '3:00 PM EN'],
    [/Solara Canyon Retreat/gi, 'Los Cantaritos'],
    [/Palm Springs, CA/gi, 'Sullana, Piura']
  ];

  function personalize() {
    // Mantener el marco y ajustar únicamente la posición vertical de esta foto.
    document.querySelectorAll('#PBnVwKBzJxQZpBf8 img[src*="7cafb878c428817a3252767e625c279f.png"], #PBnVwKBzJxQZpBf8 img[src*="01c2a6286fa931df44c7777a4daa0304.png"], #PBnVwKBzJxQZpBf8 img[src*="gleen-lesly-confirmacion.jpg"]').forEach(function (image) {
      if (!image.src.includes('gleen-lesly-confirmacion.jpg')) image.src = '/assets/demo3/media/gleen-lesly-confirmacion.jpg';
      var frame = image.parentElement;
      if (frame && frame.style.transform.includes('translate(-17.1707px, -118.744px)')) {
        frame.style.transform = frame.style.transform.replace('translate(-17.1707px, -118.744px)', 'translate(-17.1707px, -48.744px)');
      }
    });
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest('script, style, noscript')) continue;
      var next = node.nodeValue;
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
