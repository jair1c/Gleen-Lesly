(function () {
  'use strict';

  var storageKey = 'demo2:opening-invitation';
  var path = location.pathname.toLowerCase();
  var token = new URLSearchParams(location.search).get('invite');

  if (token) {
    window.demo2InviteToken = token;
    try { sessionStorage.setItem(storageKey, token); } catch (_) {}
    return;
  }

  if (path === '/' || path === '/index.html') {
    try { sessionStorage.removeItem(storageKey); } catch (_) {}
    return;
  }
  if (path !== '/home' && path !== '/home.html') return;

  try {
    var referrer = new URL(document.referrer);
    if (referrer.origin === location.origin) token = referrer.searchParams.get('invite');
  } catch (_) {}
  if (!token) {
    try { token = sessionStorage.getItem(storageKey); } catch (_) {}
  }
  if (!token) return;

  window.demo2InviteToken = token;
  try { sessionStorage.setItem(storageKey, token); } catch (_) {}
  var url = new URL(location.href);
  url.searchParams.set('invite', token);
  history.replaceState(history.state, '', url);
  window.addEventListener('load', function () {
    if (new URLSearchParams(location.search).has('invite')) return;
    var loadedUrl = new URL(location.href);
    loadedUrl.searchParams.set('invite', token);
    history.replaceState(history.state, '', loadedUrl);
  }, { once: true });
})();
