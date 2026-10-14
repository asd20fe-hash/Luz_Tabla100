/* Potes y vasos (fracciones de 4to) — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.2  (2026-10-14) Fuegos artificiales
     + Al terminar la ronda hay fuegos artificiales en el resumen, que siguen hasta tocar "Otra ronda" o "Salir".
   v1.0.1  (2026-10-13) Teclado y correcciones
     + Teclado: Tab y Enter pasan a la casilla siguiente de la fracción (Enter en la última es OK).
     + Teclado: S y N eligen Sí o No, las flechas ← → recorren las opciones y Enter elige.
   v1.0.0  (2026-10-13) Primera versión
     + Fracciones en medidas: potes de 1, 1/2 y 1/4 kg; vasos de 1/4 l (mediano) y 1/8 l (chico); jarra de 1 1/2 l.
     + K1 "Llená la balanza" (con condiciones y la variante "¿Se puede?"), K2 "¿Alcanza?", K3 "¿Es justo?",
       K4 "Completá la suma", K5 "Vasos" (y servir con la jarra) y K6 "¿Cuál es el vaso chico?".
     + Todo se hace tocando: tocar un pote lo pone en la balanza y tocarlo ahí lo saca.
     + 3 niveles, rondas de 4 ítems, registro de eventos, ?debug=1, ?seed=N, ?nivel=N y ?tipo=X.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.2', ACT = '4to-fracciones-potes-vasos';
  var FRUI = REF4_FRUI, FR = REF4_FR, G = REF4_FRGEN, A = G.potes, cf = FRUI.conFracciones;
  var fr = FR.fr, txt = function (f) { return FR.formatear(f); }, mix = function (f) { return FR.formatear(f, { mixto: true }); };
  var TEXTO_PASO = { sepuede: 'decidir si se puede', K1: 'poner potes y tocar Listo', alcanza: 'decidir si alcanza', cuanto: 'escribir cuánto', fila: 'revisar la fila', K4: 'completar la suma',
    K5: 'contestar la pregunta', servir: 'servir los vasos', sobra: 'escribir cuánto sobra', K6: 'elegir el vaso chico' };

  function kg(f) { return FRUI.fraccionHTML(f, { mixto: true }) + ' kg'; }
  function sumaTexto(lista) { return lista.length ? lista.map(function (f) { return FRUI.fraccionHTML(f); }).join(' + ') : '0'; }
  function potesHTML(lista, op) {
    op = op || {};
    return lista.map(function (f, i) { return '<button class="fr-potebtn" data-i="' + i + '"' + (op.inerte ? ' tabindex="-1"' : '') + ' aria-label="pote de ' + FR.leer(f, { unidad: 'kg' }) + '">' + FRUI.poteSVG(f) + '<span class="pot-lbl">' + kg(f) + '</span></button>'; }).join('');
  }
  function estadoTexto(e) { return e.estado === 'justo' ? '¡Justo!' : (e.estado === 'falta' ? 'Falta ' + mix(e.dif) + ' kg' : 'Te pasaste ' + mix(e.dif) + ' kg'); }

  function pintar(it, api) {
    var est = api.est, nivel = api.nivel, h = '', p;
    if (!est.iniciado) {
      est.iniciado = true; est.lista = []; est.fila = 0; est.res = []; est.servidos = []; est.alto = 2;
      est.paso = { K1: it.sePuede ? 'sepuede' : 'K1', K2: 'alcanza', K3: 'fila', K4: 'K4', K5: it.pregunta === 'jarra' ? 'servir' : 'K5', K6: 'K6' }[it.tipo];
      if (it.tipo === 'K3') est.sub = 'justo';
      api.nuevoPaso(est.paso);
    }
    p = est.paso;
    if (it.tipo === 'K1') {
      if (p === 'sepuede') h += '<div class="fr-preg">' + cf('¿Puede llevar justo ' + mix(it.objetivo) + ' kg solo con potes de 1/2 kg?') + '</div><div id="ops"></div>';
      else {
        var e = A.estadoPotes(est.lista, it.objetivo);
        h += '<div class="fr-preg">' + cf('Llená la balanza hasta ' + mix(it.objetivo) + ' kg.') + '<small>Tocá un pote para ponerlo; tocalo en la balanza para sacarlo.</small></div>' +
          (it.condTexto ? '<div class="pot-cond">' + cf(it.condTexto) + '</div>' : '') +
          '<div class="fr-estante" id="estante">' + potesHTML(it.disponibles) + '</div>' + FRUI.barraKilosSVG({ max: 3, total: e.suma, objetivo: it.objetivo }) +
          '<div class="fr-balanza" id="balanza" aria-label="la balanza">' + (est.lista.length ? potesHTML(est.lista) : '<span class="fr-msg">La balanza está vacía.</span>') + '</div>';
        if (it.ayudaSuma) h += '<div class="fr-suma">' + sumaTexto(est.lista) + ' = ' + kg(e.suma) + '</div><div class="pot-estado ' + e.estado + '">' + (est.lista.length ? estadoTexto(e) : '') + '</div>';
        h += '<div class="fr-fila"><button class="ref-btn main" id="listo">✔ Listo</button></div>';
      }
    } else if (it.tipo === 'K2') {
      h += '<div class="fr-preg">' + cf('Tiene estos potes y necesita ' + mix(it.objetivo) + ' kg.') + '</div><div class="fr-estante">' + potesHTML(it.lista, { inerte: true }) + '</div>';
      if (it.ayuda || est.verBarra) h += FRUI.barraKilosSVG({ max: 3, total: A.sumaLista(it.lista), objetivo: it.objetivo });
      h += p === 'alcanza' ? '<div class="fr-preg">¿Alcanza?</div><div id="ops"></div>' : '<div class="fr-preg">' + (it.estado === 'falta' ? '¿Cuánto falta?' : '¿Cuánto sobra?') + '</div><div id="ing"></div>';
    } else if (it.tipo === 'K3') {
      h += '<div class="fr-preg">' + cf('¿Es justo ' + mix(it.objetivo) + ' kg?') + '</div><table class="fr-tabla"><tbody>' + it.filas.map(function (f, i) {
        var r = est.res[i];
        return '<tr class="' + (i === est.fila ? 'on' : (r ? 'hecha' : '')) + '"><td>' + sumaTexto(f.potes) + '</td><td>' + (r ? (r.estado === 'justo' ? '✔ Justo' : (r.estado === 'falta' ? 'Falta ' : 'Sobra ') + (r.estado === 'justo' ? '' : FRUI.fraccionHTML(r.dif, { mixto: true }))) : '') + '</td></tr>'; }).join('') + '</tbody></table>';
      if (est.fila < it.filas.length) {
        var sub = est.sub;
        h += '<div class="fr-preg">' + (sub === 'justo' ? '¿Esta fila da justo?' : (sub === 'fs' ? '¿Falta o sobra?' : (est.fs === 'falta' ? '¿Cuánto falta?' : '¿Cuánto sobra?'))) + '</div>' + (sub === 'cuanto' ? '<div id="ing"></div>' : '<div id="ops"></div>');
      }
    } else if (it.tipo === 'K4') {
      h += '<div class="fr-preg">Completá la suma.</div><div class="fr-grande">' + sumaTexto(it.sumandos) + ' + <span class="fal-hueco">?</span> = ' + kg(it.total) + '</div><div id="ing"></div>';
    } else if (it.tipo === 'K5') {
      var ref = '<div class="pot-ref"><figure>' + FRUI.vasoSVG(1) + '<figcaption>mediano<br>' + FRUI.fraccionHTML(fr(1, 4)) + ' l</figcaption></figure><figure>' + FRUI.vasoSVG(0.5) + '<figcaption>chico<br>' + FRUI.fraccionHTML(fr(1, 8)) + ' l</figcaption></figure></div>';
      if (it.pregunta === 'jarra') {
        var servido = est.servidos.reduce(function (s, i) { return FR.sumar(s, it.servir[i]); }, fr(0, 1)), queda = FR.restar(it.capacidad, servido);
        h += '<div class="fr-preg">' + cf('Con una jarra de 1 1/2 l servís estos vasos.') + '<small>' + (p === 'servir' ? 'Tocá cada vaso para servirlo.' : '') + '</small></div><div class="fr-fila">' + FRUI.jarraSVG({ capacidad: it.capacidad, nivel: queda }) +
          '<div class="fr-vasos" id="vasos">' + it.servir.map(function (v, i) { return '<button class="fr-vasobtn' + (est.servidos.indexOf(i) >= 0 ? ' servido' : '') + '" data-i="' + i + '">' + FRUI.vasoSVG(v.d === 4 ? 1 : 0.5, { lleno: est.servidos.indexOf(i) >= 0 }) + FRUI.fraccionHTML(v) + ' l</button>'; }).join('') + '</div></div>';
        if (p === 'sobra') h += '<div class="fr-preg">¿Cuánto sobra en la jarra?</div><div id="ing"></div>';
      } else h += ref + '<div class="fr-preg">' + cf('1 l llena 8 vasos chicos o 4 medianos. ' + it.texto) + '</div><div id="ing"></div>';
    } else if (it.tipo === 'K6') {
      h += '<div class="fr-preg">' + cf('Este es el vaso mediano (1/4 l). El chico tiene 1/8 l y la misma base. ¿Cómo es el vaso chico?') + '</div><div class="pot-ref"><figure>' + FRUI.vasoSVG(1) + '<figcaption>mediano</figcaption></figure></div>';
      if (it.modo === 'ajustar') h += '<div class="pot-ref"><figure>' + FRUI.vasoSVG(est.alto / 4) + '<figcaption>tu vaso</figcaption></figure></div><div class="pot-ajustar"><button class="ref-btn" id="menos" aria-label="Más bajo">−</button><button class="ref-btn" id="mas" aria-label="Más alto">+</button><button class="ref-btn main" id="listo">✔ Listo</button></div>';
      else h += '<div class="fr-vasos" id="ops">' + it.opciones.map(function (o, i) { return '<button class="fr-vasobtn" data-i="' + i + '" aria-label="vaso ' + (i + 1) + '">' + FRUI.vasoSVG(o.alto) + '</button>'; }).join('') + '</div>';
    }
    api.cont.innerHTML = h;
    eventos(it, api);
    if (it.tipo === 'K2' && !it.ayuda && !est.verBarra) api.boton('⚖️ Ver balanza', function () { api.ayuda('dibujo'); est.verBarra = true; api.render(); });
  }

  function eventos(it, api) {
    var est = api.est, p = est.paso, $ = function (s) { return document.querySelector(s); };
    function ir(x) { est.paso = x; api.nuevoPaso(x); api.render(); }
    function ingreso(modo, onOk, sufijo) { FRUI.ingreso($('#ing'), { modo: modo, onOk: onOk, sufijo: sufijo }); }
    function bien(f, esp) { return FR.iguales(f, esp) && !FR.identicas(FR.simplificar(f), f) ? '¡Bien! ' + mix(f) + ' es lo mismo que ' + mix(esp) + '.' : null; }
    if (it.tipo === 'K1') {
      if (p === 'sepuede') {
        var sePuede = (it.objetivo.n * 2) % it.objetivo.d === 0;
        FRUI.opciones($('#ops'), [{ html: 'Sí', valor: true }, { html: 'No', valor: false }], function (si, b) {
          var ok = si === sePuede;
          api.responder({ paso: 'sepuede', ok: ok, error: ok ? null : 'CALCULO', esperado: sePuede ? 'si' : 'no', respuesta: si ? 'si' : 'no', forma: 'opcion', pista: ok ? null : 'Con potes de 1/2 kg solo llegás a 1/2, 1, 1 1/2, 2… ¿Está ' + mix(it.objetivo) + ' kg?' });
          if (ok) { FRUI.globo('No se puede justo. Armalo con la mayor cantidad posible de potes de 1/2.', 'ok'); ir('K1'); } else { b.classList.add('mal'); b.disabled = true; }
        });
        return;
      }
      $('#estante').onclick = function (e) { var b = e.target.closest('[data-i]'); if (!b) return; est.lista.push(it.disponibles[+b.dataset.i]); REF4_UI.sonar('tecla'); api.render(); };
      $('#balanza').onclick = function (e) { var b = e.target.closest('[data-i]'); if (!b) return; est.lista.splice(+b.dataset.i, 1); REF4_UI.sonar('tecla'); api.render(); };
      $('#listo').onclick = function () {
        var v = A.validarK1(it, est.lista), e2 = A.estadoPotes(est.lista, it.objetivo);
        api.responder({ paso: 'K1', ok: v.ok, error: v.codigo, esperado: mix(it.objetivo) + (it.cond !== 'ninguna' ? ' (' + it.cond + ')' : ''), respuesta: est.lista.map(txt).join('+') || '0', forma: 'opcion',
          pista: v.ok ? null : A.pista(v.codigo, it, { falta: e2.estado === 'falta' ? e2.dif : null }), item: { objetivo: mix(it.objetivo), cond: it.cond, potes: est.lista.map(txt), total: mix(e2.suma) } });
        if (v.ok) api.fin(900);
      };
      return;
    }
    if (it.tipo === 'K2') {
      if (p === 'alcanza') {
        var ops = [{ html: 'Alcanza justo', valor: 'justo' }, { html: 'Falta', valor: 'falta' }, { html: 'Sobra', valor: 'sobra' }];
        FRUI.opciones($('#ops'), ops, function (x, b) {
          var ok = x === it.estado;
          api.responder({ paso: 'alcanza', ok: ok, error: ok ? null : 'CALCULO', esperado: it.estado, respuesta: x, forma: 'opcion', pista: ok ? null : 'Sumá los potes: ' + it.lista.map(txt).join(' + ') + '. Dos de 1/4 hacen 1/2.' });
          if (!ok) { b.classList.add('mal'); b.disabled = true; return; }
          if (it.estado === 'justo') api.fin(800); else ir('cuanto');
        });
        return;
      }
      ingreso('mixto', function (f, forma) {
        var ok = FR.iguales(f, it.dif);
        api.responder({ paso: 'cuanto', ok: ok, error: ok ? null : (FR.iguales(fr(f.n, f.d), FR.sumar(it.dif, fr(1, 1))) ? 'MIXTO' : 'CALCULO'), esperado: mix(it.dif), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma,
          pista: ok ? null : A.pista('CALCULO', it), mensaje: ok ? bien(f, it.dif) : null });
        if (ok) api.fin(1000);
      }, 'kg');
      return;
    }
    if (it.tipo === 'K3') {
      var fila = it.filas[est.fila]; if (!fila) return;
      var cerrarFila = function () { est.res[est.fila] = fila; est.fila++; est.sub = 'justo'; api.intentos.fila = 0; if (est.fila >= it.filas.length) { api.render(); api.fin(900); } else api.render(); };
      if (est.sub === 'justo') {
        FRUI.opciones($('#ops'), [{ html: 'Sí', valor: true }, { html: 'No', valor: false }], function (si, b) {
          var ok = si === (fila.estado === 'justo');
          api.responder({ paso: 'fila', ok: ok, error: ok ? null : 'CALCULO', esperado: fila.estado, respuesta: si ? 'justo' : 'no', forma: 'opcion', item: { potes: fila.potes.map(txt), objetivo: mix(it.objetivo) }, pista: ok ? null : A.pista('EQUIV', it) });
          if (!ok) { b.classList.add('mal'); b.disabled = true; return; }
          if (si) cerrarFila(); else { est.sub = 'fs'; api.render(); }
        });
      } else if (est.sub === 'fs') {
        FRUI.opciones($('#ops'), [{ html: 'Falta', valor: 'falta' }, { html: 'Sobra', valor: 'sobra' }], function (x, b) {
          var ok = x === fila.estado;
          api.responder({ paso: 'fila', ok: ok, error: ok ? null : (x === 'falta' ? 'NO_LLEGA' : 'SE_PASA'), esperado: fila.estado, respuesta: x, forma: 'opcion', item: { potes: fila.potes.map(txt), objetivo: mix(it.objetivo) }, pista: ok ? null : 'Sumá los potes de a uno y compará con ' + mix(it.objetivo) + ' kg.' });
          if (!ok) { b.classList.add('mal'); b.disabled = true; return; }
          est.fs = x; est.sub = 'cuanto'; api.render();
        });
      } else {
        ingreso('mixto', function (f, forma) {
          var ok = FR.iguales(f, fila.dif);
          api.responder({ paso: 'cuanto', ok: ok, error: ok ? null : 'CALCULO', esperado: mix(fila.dif), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma, item: { potes: fila.potes.map(txt), objetivo: mix(it.objetivo) }, pista: ok ? null : A.pista('CALCULO', it), mensaje: ok ? bien(f, fila.dif) : null });
          if (ok) cerrarFila();
        }, 'kg');
      }
      return;
    }
    if (it.tipo === 'K4') {
      ingreso('mixto', function (f, forma) {
        var ok = FR.iguales(f, it.esperado), suma = FR.sumar(A.sumaLista(it.sumandos), f);
        api.responder({ paso: 'K4', ok: ok, error: ok ? null : (FR.comparar(suma, it.total) > 0 ? 'SE_PASA' : 'NO_LLEGA'), esperado: mix(it.esperado), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma,
          pista: ok ? null : 'Sumá lo que ya hay: ' + mix(A.sumaLista(it.sumandos)) + ' kg. ¿Cuánto falta para ' + mix(it.total) + ' kg?', mensaje: ok ? bien(f, it.esperado) : null });
        if (ok) api.fin(1200);
      }, 'kg');
      return;
    }
    if (it.tipo === 'K5') {
      if (it.pregunta === 'jarra') {
        if (p === 'servir') {
          $('#vasos').onclick = function (e) { var b = e.target.closest('[data-i]'); if (!b) return; var i = +b.dataset.i; if (est.servidos.indexOf(i) >= 0) return; est.servidos.push(i); REF4_UI.sonar('tecla');
            if (est.servidos.length === it.servir.length) ir('sobra'); else api.render(); };
        } else {
          ingreso('mixto', function (f, forma) {
            var ok = FR.iguales(f, it.esperado);
            api.responder({ paso: 'sobra', ok: ok, error: ok ? null : 'CALCULO', esperado: mix(it.esperado), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma, pista: ok ? null : A.pista('JARRA', it), mensaje: ok ? bien(f, it.esperado) : null });
            if (ok) api.fin(1200);
          }, 'l');
        }
        return;
      }
      ingreso(it.fraccion ? 'fraccion' : 'entero', function (f, forma) {
        var ok = it.fraccion ? FR.iguales(f, it.esperado) : (f.n / f.d === it.esperado);
        api.responder({ paso: 'K5', ok: ok, error: ok ? null : 'CALCULO', esperado: it.fraccion ? txt(it.esperado) : it.esperado, respuesta: txt(f), forma: forma,
          pista: ok ? null : A.pista(/medio/.test(it.pregunta) ? 'MEDIO' : 'VASOS', it) });
        if (ok) api.fin(800);
      }, it.fraccion ? 'l' : 'vasos');
      return;
    }
    if (it.tipo === 'K6') {
      if (it.modo === 'ajustar') {
        $('#menos').onclick = function () { if (est.alto > 1) { est.alto--; api.render(); } };
        $('#mas').onclick = function () { if (est.alto < 8) { est.alto++; api.render(); } };
        $('#listo').onclick = function () {
          var ok = est.alto === 2; // en cuartos de la altura del mediano: 2/4 = la mitad
          api.responder({ paso: 'K6', ok: ok, error: ok ? null : 'CALCULO', esperado: 'mitad de alto', respuesta: est.alto + '/4 del alto', forma: 'opcion', pista: ok ? null : 'El chico tiene la mitad que el mediano (1/8 es la mitad de 1/4) y la misma base: la mitad de alto.' });
          if (ok) api.fin(800);
        };
        return;
      }
      $('#ops').onclick = function (e) {
        var b = e.target.closest('[data-i]'); if (!b || b.disabled) return;
        var o = it.opciones[+b.dataset.i];
        api.responder({ paso: 'K6', ok: o.ok, error: o.ok ? null : 'CALCULO', esperado: 'mitad de alto', respuesta: o.alto + ' del alto', forma: 'opcion', pista: o.ok ? null : 'El chico tiene la mitad que el mediano (1/8 es la mitad de 1/4) y la misma base: la mitad de alto.' });
        if (o.ok) { b.classList.add('sel'); api.fin(800); } else { b.classList.add('mal'); b.disabled = true; }
      };
    }
  }

  FRUI.actividad({
    act: ACT, titulo: 'Potes y vasos', version: VERSION, nivelMax: 3, moduloAct: 'potes-vasos',
    tamRonda: A.ronda, tipos: A.tipos, generar: A.generar,
    deModulo: function (e, az, nivel) { var f = A.armar[e.tipo]; if (!f) return null; var it = f(e.params, Math.max(2, nivel), az); if (it) it.modulo = e.id; return it; },
    pintar: pintar,
    meperdi: function (it, api) {
      api.est.verBarra = true; if (it.tipo === 'K1') it.ayudaSuma = true; api.render();
      api.pista(it.tipo === 'K5' || it.tipo === 'K6' ? '1 l llena 8 vasos chicos: cada vaso chico es 1/8 de litro; el mediano, 1/4.' : 'Dos potes de 1/4 kg pesan lo mismo que uno de 1/2 kg. Sumá de a uno.');
    },
    textoPaso: function (it, api) { return TEXTO_PASO[api.est.paso] || 'seguir'; },
    esperado: function (it) { return it.tipo === 'K1' ? mix(it.objetivo) + ' (' + it.cond + ')' : (it.tipo === 'K2' ? it.estado + ' ' + mix(it.dif) : (it.tipo === 'K3' ? it.filas.map(function (f) { return f.estado; }).join(', ') : (it.tipo === 'K6' ? 'mitad de alto' : it.esperado))); },
    aprendiste: G.APRENDISTE['potes-vasos']
  });
})();
