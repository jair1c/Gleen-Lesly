(function () {
  'use strict';

  var music = new Audio('/assets/music/music.mp3');
  music.loop = true;
  music.preload = 'none';
  music.volume = 0.75;
  music.hidden = true;
  document.body.appendChild(music);

  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'demo2-music-toggle';
  button.hidden = true;
  document.body.appendChild(button);

  function refreshButton() {
    var playing = !music.paused;
    button.textContent = playing ? 'Ⅱ' : '♫';
    button.setAttribute('aria-label', playing ? 'Pausar música' : 'Reanudar música');
    button.setAttribute('aria-pressed', String(playing));
    button.title = playing ? 'Pausar música' : 'Reanudar música';
  }

  function playMusic() {
    button.hidden = false;
    music.preload = 'auto';
    var attempt = music.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () { refreshButton(); });
    }
    refreshButton();
  }

  function stopMusic() {
    music.pause();
    if (music.readyState > 0) music.currentTime = 0;
    button.hidden = true;
    refreshButton();
  }

  music.addEventListener('play', refreshButton);
  music.addEventListener('pause', refreshButton);
  button.addEventListener('click', function () {
    if (music.paused) playMusic();
    else music.pause();
  });

  // Canva cambia de página desde este enlace. Iniciar aquí conserva la
  // activación del toque del invitado, necesaria para reproducir en móvil.
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target : null;
    var link = target && target.closest('a[href]');
    if (!link) return;
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.hash === '#page-1' && link.closest('#PByb2KV5jZ9P1h1c')) playMusic();
    if (url.hash === '#page-0') stopMusic();
  }, true);

  window.addEventListener('hashchange', function () {
    if (location.hash === '#page-0') stopMusic();
    else if (location.hash === '#page-1') button.hidden = false;
  });

  if (location.hash === '#page-1') button.hidden = false;
  refreshButton();
})();
