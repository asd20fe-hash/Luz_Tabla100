'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path'), C = require('./comun.js'), V = C.V, JG = C.JG, LC = C.LC, RP = C.RP, AL = C.AL, PET = C.PET;
prueba('acciones: cada verbo tiene su animación en el modelo y su forma -ing', function () {
  var src = fs.readFileSync(path.join(__dirname, C.R, '_comun-ingles/mascota3d.js'), 'utf8');
  V.palabras({ temas: ['acciones'] }).forEach(function (w) {
    assert.ok(w.img, w.en); assert.strictEqual(w.art, '', 'sin artículo: ' + w.en); assert.ok(/ING$/.test(w.ing), w.en + ' → ' + w.ing);
    assert.ok(src.indexOf("id === '" + w.accion + "'") >= 0, 'sin animación: ' + w.accion);
  });
});
prueba('Mimi says!: orden, al revés y lo que dice la profe', function () {
  var j = JG.get('hacer'), az = C.AZ.crear(5);
  assert.strictEqual(j.orden(V.por('JUMP'), 'Mimi', {}), 'Mimi, jump!');
  assert.strictEqual(j.orden(V.por('JUMP'), 'Mimi', { alReves: true }), 'What is Mimi doing?');
  assert.strictEqual(j.dice(V.por('RUN'), 'Bo'), 'Bo is running!');
  assert.strictEqual(j.dice(V.por('CLAP'), 'Bo'), 'Bo is clapping!');
  [1, 2, 3].forEach(function (nv) {
    var rev = 0;
    for (var i = 0; i < 1000; i++) {
      var r = LC.rondaJuego({ juego: 'hacer', nivel: nv, rep: RP.vacio(), az: az, n: 1 })[0];
      assert.strictEqual(r.w.tema, 'acciones'); assert.ok(r.w.nivel <= nv); assert.strictEqual(r.opciones.length, JG.cuantas(nv)); if (r.alReves) rev++;
    }
    assert.ok(rev > 200 && rev < 650, 'nivel ' + nv + ': al revés ' + rev + ' de 1000');
  });
});
prueba('álbum: falta → nueva (al jugarla) → pegada (una vez); oro si la sabe bien', function () {
  var rep = RP.vacio(), pet = PET.nuevo(0), c0 = AL.cuenta(rep, pet);
  assert.strictEqual(c0.total, V.palabras().length); assert.strictEqual(c0.pegadas + c0.nuevas, 0);
  assert.strictEqual(AL.carta(V.por('RED'), rep, pet).estado, 'falta');
  RP.registrar(rep, 'RED', true); RP.registrar(rep, 'BLUE', false);
  assert.strictEqual(AL.carta(V.por('RED'), rep, pet).estado, 'nueva'); assert.strictEqual(AL.cuenta(rep, pet).nuevas, 2);
  assert.ok(AL.pegar(pet, 'RED')); assert.ok(!AL.pegar(pet, 'RED'), 'una sola vez'); assert.ok(!AL.pegar(pet, 'NADA'));
  assert.strictEqual(AL.carta(V.por('RED'), rep, pet).estado, 'pegada');
  assert.ok(!AL.carta(V.por('RED'), rep, pet).oro, 'caja 2: todavía no es de oro');
  RP.registrar(rep, 'RED', true); assert.ok(AL.carta(V.por('RED'), rep, pet).oro, 'caja 3: de oro');
  AL.pegar(pet, 'BLUE'); RP.registrar(rep, 'BLUE', true); RP.registrar(rep, 'BLUE', true); assert.ok(!AL.carta(V.por('BLUE'), rep, pet).oro, 'errada y en caja 2');
  var c = AL.cuenta(rep, pet); assert.strictEqual(c.pegadas, 2); assert.strictEqual(c.nuevas, 0); assert.strictEqual(c.oro, 1);
  assert.deepStrictEqual(PET.normalizar({ nacido: true }, 0).album, [], 'estados viejos reciben álbum vacío');
});
prueba('álbum: una página por tema con todas sus palabras; completa al pegarlas todas', function () {
  var rep = RP.vacio(), pet = PET.nuevo(0), pags = AL.paginas(rep, pet);
  assert.deepStrictEqual(pags.map(function (p) { return p.id; }), V.temas().map(function (t) { return t.id; }));
  pags.forEach(function (p) { assert.strictEqual(p.cartas.length, V.palabras({ temas: [p.id] }).length); assert.ok(!p.completa); assert.strictEqual(p.tiene, 0); });
  V.palabras({ temas: ['acciones'] }).forEach(function (w) { RP.registrar(rep, w.en, true); });
  var ac = AL.paginas(rep, pet).filter(function (p) { return p.id === 'acciones'; })[0];
  assert.strictEqual(ac.nuevas, ac.total); assert.ok(!ac.completa);
  ac.cartas.forEach(function (c) { AL.pegar(pet, c.w.en); });
  ac = AL.paginas(rep, pet).filter(function (p) { return p.id === 'acciones'; })[0];
  assert.ok(ac.completa); assert.strictEqual(ac.nuevas, 0); assert.strictEqual(ac.tiene, ac.total);
});
