const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const bootstrap = fs.readFileSync(path.join(root, 'assets/demo2-invite-context.js'), 'utf8');

function visit(url, referrer, storage) {
  const location = new URL(url);
  const window = { addEventListener() {} };
  const history = {
    state: null,
    replaceState(_state, _title, next) {
      const updated = new URL(next);
      location.search = updated.search;
      location.hash = updated.hash;
    }
  };
  const sessionStorage = {
    getItem(key) { return storage.get(key) || null; },
    setItem(key, value) { storage.set(key, value); },
    removeItem(key) { storage.delete(key); }
  };
  vm.runInNewContext(bootstrap, { URL, URLSearchParams, location, document: { referrer }, history, sessionStorage, window });
  return { location, window };
}

test('el token sobrevive al salto del sobre a /home y a una recarga', () => {
  const storage = new Map();
  const token = 'personalized_invitation_token_12345';
  visit(`https://example.test/?invite=${token}`, '', storage);
  assert.equal(storage.get('demo2:opening-invitation'), token);

  const home = visit('https://example.test/home', `https://example.test/?invite=${token}`, storage);
  assert.equal(home.location.search, `?invite=${token}`);
  assert.equal(home.window.demo2InviteToken, token);
  assert.equal(storage.get('demo2:opening-invitation'), token);

  const reloaded = visit('https://example.test/home', '', storage);
  assert.equal(reloaded.window.demo2InviteToken, token);

  visit('https://example.test/', '', storage);
  assert.equal(storage.has('demo2:opening-invitation'), false);

  const generic = visit('https://example.test/home', '', storage);
  assert.equal(generic.location.search, '');
  assert.equal(generic.window.demo2InviteToken, undefined);
});

test('el formulario recibe el token y la fecha se obtiene de la invitación', () => {
  const migrated = fs.readFileSync(path.join(root, 'assets/demo2-migrated-sections.js'), 'utf8');
  const widget = fs.readFileSync(path.join(root, '_website-element-widget.html'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'Home.html'), 'utf8');
  assert.match(home, /demo2-invite-context\.js\?v=1/);
  assert.match(home, /rel="icon" type="image\/png" href="\/assets\/demo3\/branding\/lg-monogram-transparent\.png\?v=1"/);
  assert.match(home, /rel="apple-touch-icon" href="\/assets\/demo3\/branding\/lg-monogram\.png\?v=1"/);
  assert.match(migrated, /_website-element-widget\.html' \+ \(token \? '\?invite='/);
  assert.match(widget, /fetch\('\/api\/invitation\?token='/);
  assert.match(widget, /setPeopleOptions\(Number\(value\.seats\)\|\|1,Number\(value\.seats\)\|\|1\)/);
  assert.match(widget, /postMessage\(\{type:'demo3:invitation-loaded',exp:value\.exp\}/);
  assert.match(migrated, /event\.data\.type === 'demo3:invitation-loaded'/);
  assert.match(migrated, /url\.searchParams\.set\('invite', window\.demo2InviteToken\)/);
  assert.match(migrated, /history\.pushState\(null, '', url\)/);
  assert.doesNotMatch(migrated, /Confirma tu asistencia antes del 23 de octubre de 2026/);
});
