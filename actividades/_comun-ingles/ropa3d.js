/* Inglés — la ropa de la mascota en 3D (formas con contorno, sin modelos). window.ING_ROPA3D. Versión 1.0.0 (2026-10-15).
   modelo(M, en, hex) → grupo de la prenda armado alrededor de su ancla (userData.mats: los materiales, para apagarla).
   vitrina(M, en, hex) → la prenda centrada y del tamaño justo para mostrarla parada sobre un plato (juego y cambiador).
   poner(M, pip, {en, color}) la engancha a la mascota (sigue a la cabeza o al cuerpo); sacar(pip, slot); vestir(M, pip, puesto)
   deja puesto exactamente eso (lo demás se saca). Los lugares (slot) están en ING_ROPA.SLOT. */
(function (root) {
  'use strict';
  // dónde va cada lugar: [parte de la mascota, x, y, z]
  var ANCLA = { cabeza: ['cabeza', 0, 0, 0], oreja: ['cabeza', 0.34, 0.47, 0.12], ojos: ['cabeza', 0, 0.07, 0.6], cuello: ['cuerpo', 0, 0.78, 0], pies: ['cuerpo', 0, 0, 0] };
  var VITRINA = { BOW: 0.8, CROWN: 0.9 };            // en la vitrina todas miden lo mismo (~0.95 de lado); esto lo corrige

  function modelo(M, en, hex) {
    var T = M.T, g = new T.Group(), mats = [], mat = M.toon(hex), blanco = M.toon('#ffffff'), oscuro = M.toon('#3a2f55');
    mats.push(mat, blanco, oscuro);
    function pieza(geo, m, x, y, z, borde) { var o = new T.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); g.add(o); if (borde !== false) M.contorno(o, borde || 0.05); return o; }
    if (en === 'HAT') {                 // galera: ala, copa y cinta
      var h = new T.Group(); h.position.set(0, 0.5, 0); h.rotation.set(-0.08, 0, 0.12); h.scale.setScalar(1.15); g.add(h);
      var ala = new T.Mesh(new T.CylinderGeometry(0.36, 0.34, 0.04, 28), mat); h.add(ala); M.contorno(ala, 0.06);
      var copa = new T.Mesh(new T.CylinderGeometry(0.2, 0.22, 0.34, 24), mat); copa.position.y = 0.19; h.add(copa); M.contorno(copa, 0.05);
      var cinta = new T.Mesh(new T.CylinderGeometry(0.225, 0.226, 0.07, 24), oscuro); cinta.position.y = 0.07; h.add(cinta);
    } else if (en === 'CAP') {           // gorra: casquete sobre la cabeza y visera adelante
      var cas = pieza(new T.SphereGeometry(0.62, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.36), mat, 0, 0.02, 0, 0.03); cas.scale.set(1.13, 1.02, 1.02);
      var vis = pieza(new T.CylinderGeometry(0.3, 0.3, 0.03, 24, 1, false, -Math.PI / 2, Math.PI), mat, 0, 0.28, 0.42, 0.06); vis.scale.set(1, 1, 1.25); vis.rotation.x = 0.12;
      pieza(new T.SphereGeometry(0.05, 10, 8), blanco, 0, 0.62, 0, false);
    } else if (en === 'CROWN') {         // corona: aro con puntas y piedras
      var c = new T.Group(); c.position.y = 0.47; c.rotation.z = 0.1; c.scale.setScalar(1.25); g.add(c);
      var mAro = mat.clone(); mAro.side = T.DoubleSide; mats.push(mAro);
      var aro = new T.Mesh(new T.CylinderGeometry(0.25, 0.23, 0.15, 24, 1, true), mAro); aro.position.y = 0.07; c.add(aro); M.contorno(aro, 0.05);
      for (var i = 0; i < 5; i++) {
        var a = i / 5 * Math.PI * 2, pu = new T.Mesh(new T.ConeGeometry(0.06, 0.16, 4), mat); pu.position.set(Math.sin(a) * 0.24, 0.22, Math.cos(a) * 0.24); c.add(pu); M.contorno(pu, 0.08);
        var bo = new T.Mesh(new T.SphereGeometry(0.035, 10, 8), blanco); bo.position.set(Math.sin(a) * 0.24, 0.31, Math.cos(a) * 0.24); c.add(bo);
      }
      var gema = new T.Mesh(new T.SphereGeometry(0.045, 10, 8), blanco); gema.position.set(0, 0.08, 0.25); c.add(gema);
    } else if (en === 'BOW') {           // moño en la oreja
      [-1, 1].forEach(function (s) { var l = pieza(new T.ConeGeometry(0.1, 0.2, 14), mat, s * 0.1, 0, 0, 0.07); l.rotation.z = s * Math.PI / 2; l.scale.set(1, 1, 0.6); });
      pieza(new T.SphereGeometry(0.055, 12, 10), mat, 0, 0, 0.02, 0.08);
      g.rotation.z = -0.35;
    } else if (en === 'GLASSES') {       // anteojos: dos aros, puente, patillas y vidrio apenas visible
      var vid = M.toon('#e8f6ff', { transparente: true, opacidad: 0.35 }); mats.push(vid);
      [-1, 1].forEach(function (s) {
        pieza(new T.TorusGeometry(0.14, 0.026, 8, 24), mat, s * 0.23, 0, 0.03, 0.12);
        var v = new T.Mesh(new T.CircleGeometry(0.13, 20), vid); v.position.set(s * 0.23, 0, 0.03); g.add(v);
        pieza(new T.BoxGeometry(0.025, 0.025, 0.42), mat, s * 0.38, 0.02, -0.18, 0.2);
      });
      var pu2 = pieza(new T.TorusGeometry(0.05, 0.02, 6, 10, Math.PI), mat, 0, 0.02, 0.03, 0.15);
    } else if (en === 'SCARF') {         // bufanda: rosca alrededor del cuello y una punta que cuelga
      var ro = pieza(new T.TorusGeometry(0.47, 0.095, 10, 30), mat, 0, 0, 0, 0.04); ro.rotation.x = Math.PI / 2; ro.scale.set(1, 0.92, 1);
      var pun = pieza(new T.BoxGeometry(0.17, 0.42, 0.07), mat, 0.2, -0.2, 0.46, 0.05); pun.rotation.z = 0.18; pun.rotation.x = -0.25;
      [-0.05, 0.05].forEach(function (dx) { pieza(new T.BoxGeometry(0.03, 0.08, 0.075), blanco, 0.2 + dx + 0.07, -0.36, 0.5, false).rotation.z = 0.18; });
      [0.12, -0.12].forEach(function (dy) { var r = new T.Mesh(new T.BoxGeometry(0.175, 0.04, 0.075), blanco); r.position.set(0.2 + dy * 0.18, -0.2 + dy, 0.46); r.rotation.copy(pun.rotation); g.add(r); });
    } else if (en === 'SHOES') {         // zapatillas: una por pie, con puntera y suela blancas
      [-1, 1].forEach(function (s) {
        var z = pieza(new T.SphereGeometry(0.2, 20, 14), mat, s * 0.24, 0.09, 0.15, 0.07); z.scale.set(1.1, 0.64, 1.36);
        var pu = pieza(new T.SphereGeometry(0.1, 14, 10), blanco, s * 0.24, 0.07, 0.36, false); pu.scale.set(1.25, 0.65, 0.7);
        var su = pieza(new T.CylinderGeometry(0.21, 0.21, 0.04, 20), blanco, s * 0.24, 0.02, 0.15, 0.08); su.scale.set(1.1, 1, 1.36);
      });
    }
    g.userData = { en: en, mats: mats };
    return g;
  }
  // La prenda sola, centrada sobre el origen y apoyada en y = 0, con su tamaño de vitrina.
  function vitrina(M, en, hex) {
    var T = M.T, m = modelo(M, en, hex), g = new T.Group(), caja = new T.Box3(), c = new T.Vector3(), t = new T.Vector3(), e;
    if (en === 'BOW') m.rotation.z = 0;
    m.updateMatrixWorld(true); caja.setFromObject(m); caja.getCenter(c); caja.getSize(t); e = (VITRINA[en] || 1) * 0.95 / Math.max(t.x, t.y, t.z);
    m.position.sub(c); m.position.y += t.y / 2; g.add(m); g.scale.setScalar(e);
    g.userData = { en: en, mats: m.userData.mats, alto: t.y * e };
    return g;
  }
  function puesto(pip) { return pip._ropa || (pip._ropa = {}); }
  function sacar(pip, slot) { var r = puesto(pip), o = r[slot]; if (o && o.parent) o.parent.remove(o); delete r[slot]; }
  function poner(M, pip, it) {
    var R = root.ING_ROPA, slot = R.SLOT[it.en], w = root.ING_VOCAB.por(it.color || ''), a = ANCLA[slot];
    if (!slot || !a) return null;
    sacar(pip, slot);
    var m = modelo(M, it.en, w && w.color ? w.color : '#e63946'); m.position.add(new M.T.Vector3(a[1], a[2], a[3]));
    (a[0] === 'cabeza' ? pip.cabeza : pip.cuerpo).add(m); m.userData.prenda = { en: it.en, color: it.color };
    puesto(pip)[slot] = m; return m;
  }
  function vestir(M, pip, lista) {
    var r = puesto(pip); Object.keys(r).forEach(function (s) { sacar(pip, s); });
    Object.keys(lista || {}).forEach(function (s) { if (lista[s]) poner(M, pip, lista[s]); });
  }
  root.ING_ROPA3D = { VERSION: '1.0.0', ANCLA: ANCLA, modelo: modelo, vitrina: vitrina, poner: poner, sacar: sacar, vestir: vestir };
})(window);
