/* Repartos (fracciones de 4to) — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.2  (2026-10-14) Fuegos artificiales
     + Al terminar la ronda hay fuegos artificiales en el resumen, que siguen hasta tocar "Otra ronda" o "Salir".
   v1.0.1  (2026-10-13) Teclado y correcciones
     + Nivel 1: el tercer reparto de la ronda salía sin preguntas (la ronda tiene un solo tipo de ítem).
     + Teclado: Tab y Enter pasan a la casilla siguiente de la fracción (Enter en la última es OK).
     + Teclado: S y N eligen Sí o No, las flechas ← → recorren las opciones y Enter elige.
   v1.0.0  (2026-10-13) Primera versión
     + Repartir en partes iguales cuando sobra: primero los enteros, después se parte lo que sobra.
     + R1 guiado (Enteros → Sobra → Corto → Respuesta), R2 con la cuenta, R3 "¿Qué reparto es?" y R4 "Elegí".
     + "Dar una vuelta" en el nivel 1; "Ver la cuenta" (la cuenta de la carpeta) y "Ver dibujo" a pedido.
     + Cosas que no se parten (figuritas, pelotas, lápices), kilos de helado y litros de jugo.
     + 3 niveles, ronda de 3 repartos (4 ítems en el nivel 3), registro de eventos, ?debug=1, ?seed=N, ?nivel=N y ?tipo=X.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.2', ACT = '4to-fracciones-repartos';
  var FRUI = REF4_FRUI, FR = REF4_FR, FIG = REF4_FIG, G = REF4_FRGEN, A = G.repartos, esc = FRUI.esc, cf = FRUI.conFracciones;
  var fr = FR.fr, mix = function (f) { return FR.formatear(f, { mixto: true }); };

  var PASOS = ['enteros', 'sobra', 'corte', 'respuesta'], NOMBRE_PASO = { enteros: 'Enteros', sobra: 'Sobra', corte: 'Corto', respuesta: 'Respuesta' };
  var TEXTO_PASO = { enteros: 'repartir los enteros', sobra: 'contar cuántos sobran', corte: 'elegir en cuántas partes cortás', partir: 'decidir si se puede partir',
    respuesta: 'escribir cuánto le toca a cada uno', otraForma: 'escribirlo de otra forma', frase: 'elegir la frase', problema: 'elegir el problema', eleccion: 'elegir la respuesta',
    cociente: 'completar el cociente', resto: 'completar el resto' };

  /* ---------- dibujo de la mesa y de los que reciben ---------- */
  function obj(it, op) { return FRUI.objetoSVG(it.ctx.forma, op); }
  // Colores de los pedacitos: el pedacito j (de r·k) va a la persona j / (r·k/M).
  function colorPieza(it, k, o, i) { var porPersona = it.r * k / it.M; return 'p' + (Math.floor((o * k + i) / porPersona) + 1); }
  function dibujo(it, est) {
    var dados = est.dados || 0, k = est.k || 0, h = '<div class="fr-mesa" aria-label="La mesa">';
    var quedan = it.N - dados * it.M;
    if (est.paso === 'enteros' || dados < it.q) for (var i = 0; i < quedan; i++) h += obj(it, {});
    else for (var o = 0; o < it.r; o++) {
      if (k) { var cols = []; for (var j = 0; j < k; j++) cols.push(colorPieza(it, k, o, j)); h += obj(it, { partes: k, colores: cols }); }
      else h += obj(it, {});
    }
    if (quedan === 0 || (dados >= it.q && it.r === 0)) h += '<span class="fr-msg">¡No queda nada en la mesa!</span>';
    h += '</div><div class="fr-reciben">';
    it.nombres.forEach(function (n, p) {
      var c = 'p' + (p + 1), cosas = '';
      for (var e = 0; e < dados; e++) cosas += obj(it, { color: c });
      if (k && it.r) cosas += '<span class="rep-pieza">+ ' + (it.r * k / it.M) + ' × ' + FRUI.fraccionHTML(fr(1, k)) + '</span>';
      h += '<div class="fr-persona ' + c + '"><b>' + esc(n) + '</b><div class="cosas">' + (cosas || '<small>—</small>') + '</div></div>';
    });
    return h + '</div>';
  }
  function pasosBar(est) {
    var i = PASOS.indexOf(est.paso === 'partir' ? 'corte' : (est.paso === 'otraForma' || est.paso === 'frase' || est.paso === 'fin' ? 'respuesta' : est.paso));
    return '<div class="fr-pasos" aria-label="Pasos">' + PASOS.map(function (p, j) { return '<span class="' + (j === i ? 'on' : (j < i ? 'hecho' : '')) + '">' + NOMBRE_PASO[p] + '</span>'; }).join('') + '</div>';
  }
  function dibujarCuenta(el, it) {
    var sim = REF4_DIV.simular(it.N, it.M), v = REF4_DIV.vistaDe(sim), nv = v.vueltas.length;
    v.vueltas[nv - 1].final = true; v.igual = v.cociente; v.cocienteLen = Math.max(v.cociente.length, nv); v.totalVueltas = nv; v.sinTabla = true;
    v.vueltas.forEach(function (x) { x.producto = String(x.producto); x.resta = String(x.resta); });
    REF4_CUADERNO.dibujar(el, v, { ancho: Math.min(el.clientWidth || 320, 420), mini: true });
  }

  /* ---------- ítems ---------- */
  function pintar(it, api) {
    var est = api.est, nivel = api.nivel;
    if (!est.paso) { est.paso = { R1: 'enteros', R2: 'cociente', R3: 'problema', R4: 'eleccion' }[it.tipo]; est.dados = 0; api.nuevoPaso(est.paso); }
    var h = '<div class="fr-enun">' + cf(it.tipo === 'R4' ? 'Se reparten ' + it.N + ' ' + (it.ctx.unidad ? it.ctx.unidad + ' de ' + (it.ctx.unidad === 'kg' ? 'helado' : 'jugo') + ' en ' + it.M + ' ' + it.ctx.reciben + '. ¿Cuánto va en cada ' + it.ctx.recibe + '?' : it.ctx.cosas + ' entre ' + it.M + ' personas. ¿Cuánto recibe cada una?') : (it.tipo === 'R3' ? 'Mirá este reparto ya resuelto.' : it.texto)) + '</div>';
    if (it.tipo === 'R1') {
      h += pasosBar(est);
      if (it.verDibujo || est.verDibujo) h += dibujo(it, est);
    } else if (it.tipo === 'R2') {
      h += '<div class="rep-cuenta-txt">' + it.N + ' : ' + it.M + '</div>';
      if (est.verDibujo) h += dibujo(it, est);
    } else if (it.tipo === 'R3') {
      if (it.forma === 'dibujo') { var e2 = { paso: 'fin', dados: it.q, k: it.r ? it.M : 0 }; h += dibujo(it, e2); }
      else h += '<div class="fr-fila"><div class="fr-cuenta" id="r3-cuenta"></div><div class="rep-figura">' + FRUI.figuraSVG(FIG.pintar(FIG.circulo(it.M), ['r0']), { px: 120, etiqueta: 'un círculo partido en ' + it.M + ' con una parte pintada' }) + '</div></div>';
    } else if (est.verDibujo) { var e3 = { paso: 'fin', dados: it.q, k: it.r ? it.M : 0 }; h += dibujo(it, e3); }
    if (est.verCuenta) h += '<div class="fr-cuenta" id="cuenta"></div>';
    h += '<div id="ctrl"></div>';
    api.cont.innerHTML = h;
    if (est.verCuenta) dibujarCuenta(document.getElementById('cuenta'), it);
    if (it.tipo === 'R3' && it.forma === 'cuenta') dibujarCuenta(document.getElementById('r3-cuenta'), it);
    controles(it, api, document.getElementById('ctrl'));
    api.botonVoz(it.tipo === 'R3' ? '¿Qué problema resolvió? ' + it.problemas.map(function (p) { return p.texto; }).join(' ') : it.texto);
    if (nivel >= 2 && !est.verCuenta && it.N >= 1 && it.tipo !== 'R3') api.boton('🧮 Ver la cuenta', function () { api.ayuda('cuenta'); est.verCuenta = true; api.render(); });
    var sinDibujo = (it.tipo === 'R1' && !it.verDibujo) || it.tipo === 'R2' || it.tipo === 'R4';
    if (sinDibujo && !est.verDibujo) api.boton('🖍️ Ver dibujo', function () { api.ayuda('dibujo'); est.verDibujo = true; if (est.paso !== 'enteros' && est.paso !== 'cociente') est.dados = it.q; api.render(); });
  }

  function controles(it, api, c) {
    var est = api.est, p = est.paso;
    function preg(t) { return '<div class="fr-preg">' + cf(t) + '</div>'; }
    function ingreso(modo, onOk, sufijo) { var d = document.createElement('div'); c.appendChild(d); FRUI.ingreso(d, { modo: modo, onOk: onOk, sufijo: sufijo }); }
    function ir(paso) { est.paso = paso; api.nuevoPaso(paso); api.render(); }
    function terminar(msg) { est.paso = 'fin'; api.render(); api.celebrar(msg); api.fin(1100); }
    if (p === 'fin') { c.innerHTML = '<div class="fr-grande">' + (it.ctx.parte ? FRUI.fraccionHTML(it.esperado, { mixto: true }) : it.q) + '</div>'; return; }

    if (p === 'enteros' && it.modoEnteros === 'vuelta') {
      var quedan = it.N - est.dados * it.M;
      c.innerHTML = preg('Repartí los enteros: cada toque le da uno a cada uno.') + '<div class="rep-quedan">Quedan ' + quedan + ' en la mesa.</div>' +
        '<div class="rep-botones"><button class="ref-btn main fr-activo" id="vuelta">🔁 Dar una vuelta</button><button class="ref-btn" id="noalcanza">✋ No alcanza</button></div>';
      document.getElementById('vuelta').onclick = function () {
        if (quedan >= it.M) { est.dados++; UI_tecla(); api.render(); return; }
        api.responder({ paso: 'enteros', ok: false, error: 'VUELTA_DE_MAS', esperado: it.q, respuesta: est.dados + 1, forma: 'opcion', pista: A.pista('VUELTA_DE_MAS', it, { quedan: quedan }) });
      };
      document.getElementById('noalcanza').onclick = function () {
        if (quedan >= it.M) { api.responder({ paso: 'enteros', ok: false, error: 'RESTO_MAYOR', esperado: it.q, respuesta: est.dados, forma: 'opcion', pista: A.pista('RESTO_MAYOR', it, { quedan: quedan }) }); return; }
        api.responder({ paso: 'enteros', ok: true, esperado: it.q, respuesta: est.dados, forma: 'opcion' }); ir('sobra');
      };
      return;
    }
    if (p === 'enteros' || p === 'cociente') {
      c.innerHTML = preg(p === 'cociente' ? '¿Cuánto da ' + it.N + ' : ' + it.M + '? (el cociente)' : '¿Cuántos enteros recibe cada uno?');
      ingreso('entero', function (f) {
        var x = f.n / f.d, v = A.validarEnteros(it, x);
        api.responder({ paso: p, ok: v.ok, error: v.codigo, esperado: it.q, respuesta: x, forma: 'entero', pista: v.ok ? null : A.pista(v.codigo, it, { quedan: it.N - x * it.M }) });
        if (v.ok) { est.dados = it.q; ir(p === 'cociente' ? 'resto' : 'sobra'); }
      });
      return;
    }
    if (p === 'sobra' || p === 'resto') {
      c.innerHTML = preg(p === 'resto' ? '¿Y cuánto sobra? (el resto)' : '¿Cuántos sobran?');
      ingreso('entero', function (f) {
        var x = f.n / f.d, v = A.validarSobra(it, x);
        api.responder({ paso: p, ok: v.ok, error: v.codigo, esperado: it.r, respuesta: x, forma: 'entero', pista: v.ok ? null : A.pista('SOBRA', it) });
        if (!v.ok) return;
        if (it.tipo === 'R2') return ir('respuesta');
        if (it.r === 0) { FRUI.globo('¡No sobra nada! A cada uno le toca justo ' + it.q + '.', 'ok'); return ir('respuesta'); }
        ir(it.ctx.parte ? 'corte' : 'partir');
      });
      return;
    }
    if (p === 'corte') {
      c.innerHTML = preg('¿En cuántas partes iguales cortás cada uno de los que sobran?') + '<div class="rep-cortes" id="cortes"></div>';
      var ks = [2, 3, 4, 5, 6, 7, 8];
      FRUI.opciones(document.getElementById('cortes'), ks.map(function (k) { return { html: String(k), valor: k }; }), function (k, b) {
        var ok = A.cortaParejo(it, k);
        api.responder({ paso: 'corte', ok: ok, error: ok ? null : 'CORTE_INVALIDO', esperado: it.cortesValidos.join(' o '), respuesta: k, forma: 'opcion', pista: ok ? null : A.pista('CORTE_INVALIDO', it, { k: k }) });
        if (ok) { est.k = k; est.verDibujo = est.verDibujo || it.verDibujo; ir('respuesta'); } else { b.classList.add('mal'); b.disabled = true; }
      });
      return;
    }
    if (p === 'partir') {
      c.innerHTML = preg('¿Se puede partir ' + (it.ctx.fem ? 'una ' : 'un ') + it.ctx.cosa + '?') + '<div id="sn"></div>';
      FRUI.opciones(document.getElementById('sn'), [{ html: 'Sí', valor: true }, { html: 'No', valor: false }], function (si, b) {
        api.responder({ paso: 'partir', ok: !si, error: si ? 'PARTIR_INDIVISIBLE' : null, esperado: 'no', respuesta: si ? 'si' : 'no', forma: 'opcion', pista: si ? A.pista('PARTIR_INDIVISIBLE', it) : null });
        if (si) { b.classList.add('mal'); b.disabled = true; return; }
        FRUI.globo('Sobran ' + it.r + ' ' + (it.r === 1 ? it.ctx.cosa : it.ctx.cosas) + '.', 'ok'); ir('respuesta');
      });
      return;
    }
    if (p === 'respuesta') {
      var parte = it.ctx.parte;
      c.innerHTML = preg(parte ? (it.ctx.unidad ? '¿Cuánto va en cada ' + it.ctx.recibe + '?' : '¿Cuánto le toca a cada uno?') : '¿Cuántas ' + (it.ctx.fem ? '' : '') + it.ctx.cosas + ' le tocan a cada uno?');
      ingreso(parte ? 'mixto' : 'entero', function (f, forma) {
        var v = A.validarRespuesta(it, f);
        var noSimpl = v.ok && parte && !FR.identicas(FR.simplificar(f), f) ? '¡Bien! ' + FR.formatear(f, { mixto: forma === 'mixto' }) + ' es lo mismo que ' + mix(it.esperado) + '.' : null;
        api.responder({ paso: 'respuesta', ok: v.ok, error: v.codigo, esperado: FR.formatear(it.esperado, { mixto: true }), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma,
          pista: v.ok ? null : A.pista(v.codigo, it, { k: est.k || it.M, x: FR.formatear(f, { mixto: true }) }), mensaje: noSimpl });
        if (!v.ok) return;
        est.formaResp = forma;
        if (it.otraForma && (forma === 'mixto' || forma === 'fraccion')) return ir('otraForma');
        if (it.frase) return ir('frase');
        terminar();
      }, it.ctx.unidad || '');
      return;
    }
    if (p === 'otraForma') {
      var pedida = est.formaResp === 'mixto' ? 'fraccion' : 'mixto';
      c.innerHTML = preg(pedida === 'fraccion' ? '¿Y escrito como una sola fracción?' : '¿Y escrito como entero y fracción?');
      ingreso(pedida, function (f, forma) {
        var v = A.validarOtraForma(it, f, forma, pedida);
        api.responder({ paso: 'otraForma', ok: v.ok, error: v.codigo, esperado: FR.formatear(it.esperado, { mixto: pedida === 'mixto' }), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma, pista: v.ok ? null : A.pista('MIXTO', it) });
        if (!v.ok) return;
        if (it.frase) return ir('frase');
        terminar();
      });
      return;
    }
    if (p === 'frase') {
      c.innerHTML = preg('¿Cuál es la respuesta completa?') + '<div id="fr-fr"></div>';
      FRUI.opciones(document.getElementById('fr-fr'), it.frases.map(function (x) { return { texto: x.texto, valor: x }; }), function (x, b) {
        api.responder({ paso: 'frase', ok: !x.codigo, error: x.codigo, esperado: it.frases.filter(function (y) { return !y.codigo; })[0].texto, respuesta: x.texto, forma: 'opcion', pista: x.codigo ? A.pista(x.codigo, it, { x: mix(it.esperado) }) : null });
        if (x.codigo) { b.classList.add('mal'); b.disabled = true; } else terminar();
      }, 'texto');
      return;
    }
    if (p === 'problema') {
      c.innerHTML = preg('¿Qué problema resolvió?') + '<div id="pb"></div>';
      FRUI.opciones(document.getElementById('pb'), it.problemas.map(function (x) { return { texto: x.texto, valor: x }; }), function (x, b) {
        api.responder({ paso: 'problema', ok: x.ok, error: x.codigo, esperado: it.problemas.filter(function (y) { return y.ok; })[0].texto, respuesta: x.texto, forma: 'opcion', pista: x.ok ? null : (x.codigo === 'INVERTIDA' ? 'Fijate qué se reparte y entre cuántos: ¿qué hay en la mesa y cuántos reciben?' : 'Contá cuántas cosas se repartieron en total.') });
        if (x.ok) ir('eleccion'); else { b.classList.add('mal'); b.disabled = true; }
      }, 'texto');
      return;
    }
    if (p === 'eleccion') {
      c.innerHTML = preg(it.tipo === 'R3' ? '¿Qué respuesta escribió?' : 'Elegí la respuesta.') + '<div id="ops"></div>';
      FRUI.opciones(document.getElementById('ops'), it.opciones.map(function (o) { return { texto: o.texto, valor: o }; }), function (o, b) {
        api.responder({ paso: 'eleccion', ok: !o.codigo, error: o.codigo, esperado: FR.formatear(it.esperado), respuesta: o.texto, forma: 'opcion', pista: o.codigo ? A.pista(o.codigo, it, { k: it.M }) : null });
        if (o.codigo) { b.classList.add('mal'); b.disabled = true; } else terminar();
      });
    }
  }
  function UI_tecla() { REF4_UI.sonar('tecla'); }

  FRUI.actividad({
    act: ACT, titulo: 'Repartos', version: VERSION, nivelMax: 3, moduloAct: 'repartos',
    tamRonda: A.ronda, tipos: A.tipos, generar: A.generar,
    deModulo: function (e, az, nivel) { var it = A.armar[e.tipo](e.params, Math.max(2, nivel), az); if (it) it.modulo = e.id; return it; },
    pintar: pintar,
    meperdi: function (it, api) { api.est.verDibujo = true; if (api.nivel >= 2) api.est.verCuenta = true; if (api.est.paso !== 'enteros' && api.est.paso !== 'cociente') api.est.dados = it.q; api.render();
      api.pista('Primero los enteros: ' + it.N + ' : ' + it.M + ' = ' + it.q + ' y sobran ' + it.r + '. Lo que sobra se corta en ' + it.M + '.'); },
    textoPaso: function (it, api) { return TEXTO_PASO[api.est.paso] || 'seguir'; },
    esperado: function (it, api) { var p = api.est.paso; return p === 'enteros' || p === 'cociente' ? it.q : (p === 'sobra' || p === 'resto' ? it.r : (p === 'corte' ? it.cortesValidos.join(' o ') : it.esperado)); },
    aprendiste: G.APRENDISTE.repartos
  });
})();
