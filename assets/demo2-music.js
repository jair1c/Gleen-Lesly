(function () {
  'use strict';

  var isAlbum = /\/album\.html\/?$/i.test(location.pathname);
  var savedMusic = null;
  var navigationSaved = false;
  var awaitingGesture = false;
  var userPaused = false;
  try { savedMusic = JSON.parse(sessionStorage.getItem('demo2:music') || 'null'); } catch (_) {}

  userPaused = !!(savedMusic && savedMusic.userPaused);

  var music = new Audio('/assets/music/music.mp3');
  music.loop = true;
  music.preload = 'auto';
  music.volume = 0.75;
  music.hidden = true;
  document.body.appendChild(music);

  if (savedMusic && Number.isFinite(savedMusic.time) && savedMusic.time >= 0) {
    music.addEventListener('loadedmetadata', function () {
      if (Number.isFinite(music.duration) && music.duration > 0) music.currentTime = savedMusic.time % music.duration;
    }, { once: true });
  }

  function saveMusic() {
    var time = music.readyState > 0 ? music.currentTime : (savedMusic && savedMusic.time || 0);
    try { sessionStorage.setItem('demo2:music', JSON.stringify({ time: time, playing: !music.paused, userPaused: userPaused })); } catch (_) {}
  }
  window.addEventListener('pagehide', function () { if (!navigationSaved) saveMusic(); });

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
    userPaused = false;
    awaitingGesture = true;
    var attempt = music.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.then(function () { awaitingGesture = false; }).catch(function () { refreshButton(); });
    }
    refreshButton();
  }

  music.addEventListener('play', refreshButton);
  music.addEventListener('pause', refreshButton);
  button.addEventListener('click', function () {
    if (music.paused) playMusic();
    else { userPaused = true; awaitingGesture = false; music.pause(); }
  });

  // Canva cambia de página desde este enlace. Iniciar aquí conserva la
  // activación del toque del invitado, necesaria para reproducir en móvil.
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target : null;
    var link = target && target.closest('a[href]');
    if (!link) return;
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (/\/album\.html$/i.test(url.pathname) || (isAlbum && /\/(home|home\.html)$/i.test(url.pathname))) {
      saveMusic();
      navigationSaved = true;
    }
    if (awaitingGesture && link.closest('#PByb2KV5jZ9P1h1c')) playMusic();
  }, true);

  // Solicitar música desde la portada. Si el navegador exige interacción,
  // reintentar al primer toque sin reactivar una pausa elegida por el invitado.
  button.hidden = false;
  if (!userPaused) playMusic();
  function unlockMusic(event) {
    var target = event.target instanceof Element ? event.target : null;
    if (target && target.closest('.demo2-music-toggle')) return;
    if (!userPaused && music.paused) playMusic();
  }
  // En móvil la activación suele concederse al terminar el toque; en escritorio,
  // al pulsar. Capturar también evita que Canva intercepte la interacción.
  ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach(function (type) {
    document.addEventListener(type, unlockMusic, { capture: true, passive: true });
  });
  refreshButton();
})();
