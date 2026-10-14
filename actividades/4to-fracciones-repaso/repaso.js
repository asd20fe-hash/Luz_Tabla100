/* Repaso de fracciones (fracciones de 4to) — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.2  (2026-10-14) Fuegos artificiales
     + Al terminar la ronda hay fuegos artificiales en el resumen, que siguen hasta tocar "Otro repaso" o "Salir".
   v1.0.1  (2026-10-13) Teclado y correcciones
     + Teclado: S y N eligen Sí o No, las flechas ← → recorren las opciones y Enter elige.
   v1.0.0  (2026-10-13) Primera versión
     + Repaso tipo prueba, como el test del módulo: 8 preguntas de opción múltiple (4 opciones) con temas mezclados:
       reparto, parte pintada, equivalencia, comparación, cuánto falta, suma o resta, medidas y un verdadero o falso.
     + Cada opción incorrecta sale de un error típico y lleva su código. Sin pistas ni "Me perdí"; el 🔊 sí está.
     + Al final: estrellas, resultado por tema, revisión de cada error con su explicación y un dibujo, y "Practicar esto".
     + Sin niveles: usa el nivel 2 de cada generador (o el 3 si ya está en el nivel 3 de esa actividad).
     + Guarda el puntaje por tema (clave "ultimo"), que alimenta el Mapa de fracciones.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.2', ACT = '4to-fracciones-repaso';
  var FRUI = REF4_FRUI, FR = REF4_FR, G = REF4_FRGEN, cf = FRUI.conFracciones, esc = FRUI.esc;
  var ACTS = ['4to-fracciones-repartos', '4to-fracciones-partes', '4to-fracciones-muro', '4to-fracciones-comparar', '4to-fracciones-cuanto-falta', '4to-fracciones-potes-vasos'];
  var resultados = [];

  // Nivel de cada actividad de fracciones (para elegir la dificultad de su pregunta).
  function niveles() {
    var n = {};
    var perfil = MATE.perfil() ? MATE.perfil().id : null;
    ACTS.forEach(function (a) { try { n[a] = REF4_EV.leerDirecto(localStorage, perfil, a).estado.nivel || 1; } catch (e) { n[a] = 1; } });
    return n;
  }
  function dibujo(d) {
    if (!d) return '';
    if (d.fig) return FRUI.figuraSVG(d.fig, { px: 160, guia: d.guia, etiqueta: 'la figura con su cuadrícula' });
    if (d.kilos) return FRUI.barraKilosSVG({ max: 3, total: d.kilos, objetivo: d.kilos });
    if (d.tira) { var f = d.tira, W = Math.max(1, Math.ceil(f.n / f.d)); return FRUI.tiraSVG(f.d * W, { pintadas: f.n, alto: 24, etiqueta: FR.leer(f) }) + (W > 1 ? '<small>(' + W + ' enteros)</small>' : ''); }
    return '';
  }
  function textoOpcion(o) { return o.texto !== undefined ? o.texto : FR.formatear(o.f); }

  function pintar(q, api) {
    var h = '<div class="fr-enun">' + cf(q.pregunta) + '</div>';
    if (q.fig) h += '<div class="rps-fig">' + FRUI.figuraSVG(q.fig, { px: 220, etiqueta: 'figura' }) + '</div>';
    h += '<div id="ops"></div>';
    api.cont.innerHTML = h;
    FRUI.opciones(document.getElementById('ops'), q.opciones.map(function (o) { return { texto: textoOpcion(o), valor: o }; }), function (o, b) {
      var ok = o.codigo === null, correcta = q.opciones.filter(function (x) { return x.codigo === null; })[0];
      api.responder({ paso: 'repaso', ok: ok, error: o.codigo, esperado: textoOpcion(correcta), respuesta: textoOpcion(o), forma: 'opcion', tema: q.tema, item: { tema: q.tema, pregunta: q.pregunta } });
      FRUI.globo(null);
      resultados.push({ q: q, elegida: o, ok: ok, correcta: correcta });
      document.querySelectorAll('#ops .ref-opcion').forEach(function (x) { x.disabled = true; });
      b.classList.add(ok ? 'ok' : 'mal');
      api.fin(450);
    }, q.vf ? '' : (q.opciones.some(function (o) { return textoOpcion(o).length > 12; }) ? 'texto' : ''));
    api.botonVoz(q.pregunta + ' ' + q.opciones.map(textoOpcion).join(', '));
  }

  // Resumen final: estrellas, resultado por tema, revisión de errores y "Practicar esto".
  function resumen(r, otra) {
    var porTema = {};
    resultados.forEach(function (x) { var t = porTema[x.q.tema] || (porTema[x.q.tema] = { ok: 0, n: 0, act: x.q.act }); t.n++; if (x.ok) t.ok++; });
    try { REF4_FRUI._ctx.store.set('ultimo', { fecha: Date.now(), pct: r.pct, porTema: porTema }); } catch (e) { /* sin espacio */ }
    REF4_FRUI._ctx.reg.evento({ tipo: 'repaso_fin', pct: r.pct, porTema: porTema });
    var est = ''; for (var i = 1; i <= 3; i++) est += '<span class="' + (i <= r.estrellas ? '' : 'off') + '">⭐</span>';
    var errores = resultados.filter(function (x) { return !x.ok; });
    var m = document.createElement('div'); m.className = 'ref-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="ref-panel rps-final"><h2>' + (r.estrellas === 3 ? '¡Impecable!' : (r.estrellas === 2 ? '¡Muy bien!' : '¡Buen trabajo, seguimos!')) + '</h2><div class="ref-estrellas">' + est + '</div>' +
      '<p class="rps-pct">' + resultados.filter(function (x) { return x.ok; }).length + ' de ' + resultados.length + ' bien</p>' +
      '<h3>Por tema</h3><div class="rps-temas">' + Object.keys(porTema).map(function (t) { var x = porTema[t]; return '<div class="fila"><span>' + esc(FR.TEMAS[t] || t) + '</span><b class="' + (x.ok === x.n ? 'ok' : 'mal') + '">' + x.ok + ' de ' + x.n + '</b></div>'; }).join('') + '</div>' +
      (errores.length ? '<h3>Para revisar</h3>' + errores.map(function (x, i) {
        return '<div class="rps-caso"><p><b>' + cf(x.q.pregunta) + '</b></p><p>Elegiste ' + cf(textoOpcion(x.elegida)) + '; era ' + cf(textoOpcion(x.correcta)) + '.</p><p>' + cf(x.q.explicacion) + '</p>' + dibujo(x.q.dibujo) +
          '<div class="ref-fila"><button class="ref-btn" data-practicar="' + esc(x.q.act) + '" data-i="' + i + '">Practicar esto</button></div></div>'; }).join('') : '<p class="fr-msg">¡No hay nada para revisar!</p>') +
      '<div class="ref-fila"><button class="ref-btn" id="r-salir">Salir</button><button class="ref-btn main" id="r-otra">Otro repaso</button></div></div>';
    document.body.appendChild(m); REF4_UI.fuegos.iniciar();
    m.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return; REF4_UI.fuegos.parar();
      if (b.id === 'r-otra') { m.remove(); resultados = []; otra(); }
      else if (b.id === 'r-salir') { m.remove(); MATE.irMenu(); }
      else if (b.dataset.practicar) { REF4_FRUI._ctx.reg.flush(); MATE.abrir(b.dataset.practicar); }
    };
    m.querySelector('#r-otra').focus();
  }

  var api = FRUI.actividad({
    act: ACT, titulo: 'Repaso de fracciones', version: VERSION, nivelMax: 1, sinNiveles: true, sinAyudas: true,
    tamRonda: function () { return 8; }, tipos: function () { return ['Q']; }, secuencia: function () { return ['Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q']; },
    generar: function (nivel, tipo, az, ses) {
      if (!ses.cola || !ses.cola.length) ses.cola = G.repaso.preguntas(niveles(), az);
      var q = ses.cola.shift(); q.tipo = 'Q'; q.info = { tema: q.tema, pregunta: q.pregunta }; return q;
    },
    pintar: pintar,
    textoPaso: function () { return 'elegir una respuesta'; },
    esperado: function (q) { var c = q.opciones.filter(function (o) { return o.codigo === null; })[0]; return c ? textoOpcion(c) : null; },
    resumen: resumen
  });
  if (api) REF4_FRUI._ctx = api.ctx;
})();
