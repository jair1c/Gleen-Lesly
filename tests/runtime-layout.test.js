const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');

function pngSize(relativePath) {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

test('la portada blanca conserva el lienzo y la máscara del sobre original', () => {
  const theme = fs.readFileSync(path.join(root, 'assets/demo2-theme.css'), 'utf8');
  assert.deepEqual(pngSize('assets/media/2628c957b9f9df41845f2056ef40750e.png'), [800, 600]);
  assert.deepEqual(pngSize('assets/media/1f0d2a384aef31f19ee78aa1e24857b3.png'), [1448, 1086]);
  assert.deepEqual(pngSize('assets/images/envelope-white.png'), [1448, 1086]);
  assert.match(theme, /mask: url\("media\/2628c957b9f9df41845f2056ef40750e\.png"\)/);
});

test('la composición abierta usa las piezas originales sin PNG generados de distinto tamaño', () => {
  const html = fs.readFileSync(path.join(root, 'Home.html'), 'utf8');
  const theme = fs.readFileSync(path.join(root, 'assets/demo2-theme.css'), 'utf8');
  assert.match(html, /assets\/media\/21ea36b8e1d17f33b5ed300aa10cb4b3\.png/);
  assert.match(html, /assets\/media\/6d7538c3b267dba4940820b9458df1e6\.png/);
  assert.doesNotMatch(html + theme, /open-envelope(?:-front)?-white\.png|stripe-ivory\.png/);
  assert.match(theme, /#LB2qSkdK1B4tFS55/);
});

test('la portada y Home comparten el mismo motor adaptable', () => {
  assert.equal(
    fs.readFileSync(path.join(root, 'index.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'Home.html'), 'utf8')
  );
});

test('el cierre del collage no deja hueco y reutiliza el sobre blanco y monograma LG', () => {
  const theme = fs.readFileSync(path.join(root, 'assets/demo2-theme.css'), 'utf8');
  const migrated = fs.readFileSync(path.join(root, 'assets/demo2-migrated-sections.js'), 'utf8');
  const personalize = fs.readFileSync(path.join(root, 'assets/demo2-personalize-runtime.js'), 'utf8');
  assert.deepEqual(pngSize('assets/media/267bfe012a2275a1484a58d24bdb0b8d.png'), [800, 600]);
  assert.match(theme, /#LB4s6jMR7p5T7TDt\s*\{\s*display: none !important/);
  assert.match(theme, /media\/267bfe012a2275a1484a58d24bdb0b8d\.png/);
  assert.match(theme, /background: url\("images\/envelope-white\.png"\)/);
  assert.match(theme, /#LBk0QGmlFY5wsDdZ::after[\s\S]*?lg-monogram-transparent\.png/);
  assert.match(migrated, /frameRect\.bottom - sectionRect\.top \+ 18/);
  assert.match(personalize, /VOLVER AL SOBRE/);
  assert.match(personalize, /Confirma/);
});

test('el Polaroid Historia sustituye solo la foto y conserva la composición', () => {
  const personalize = fs.readFileSync(path.join(root, 'assets/demo2-personalize-runtime.js'), 'utf8');
  const migrated = fs.readFileSync(path.join(root, 'assets/demo2-migrated-sections.js'), 'utf8');
  assert.ok(fs.existsSync(path.join(root, 'assets/demo3/media/gleen-lesly-confirmacion.jpg')));
  assert.match(personalize, /7cafb878c428817a3252767e625c279f\.png/);
  assert.match(personalize, /01c2a6286fa931df44c7777a4daa0304\.png/);
  assert.match(personalize, /gleen-lesly-confirmacion\.jpg/);
  assert.match(personalize, /translate\(-17\.1707px, -118\.744px\).*translate\(-17\.1707px, -48\.744px\)/);
  assert.match(migrated, /class="demo3-countdown-polaroid"[^\n]*gleen-lesly-historia\.jpg/);
});

test('la música inicia con la apertura y se repite sin reiniciarse al desplazarse', () => {
  const html = fs.readFileSync(path.join(root, 'Home.html'), 'utf8');
  const music = fs.readFileSync(path.join(root, 'assets/demo2-music.js'), 'utf8');
  const server = fs.readFileSync(path.join(root, 'local_server.js'), 'utf8');
  assert.ok(fs.statSync(path.join(root, 'assets/music/music.mp3')).size > 0);
  assert.match(html, /demo2-music\.js\?v=2/);
  assert.match(music, /music\.loop = true/);
  assert.match(music, /url\.hash === '#page-1' && link\.closest\('#PByb2KV5jZ9P1h1c'\)/);
  assert.match(music, /url\.hash === '#page-0'\) stopMusic\(\)/);
  assert.match(server, /'\.mp3': 'audio\/mpeg'/);
});
