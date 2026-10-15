/* Mi mascota en inglés (1ro) — la actividad: huevo → nacimiento → casa → lección o juego → resumen.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.0  (2026-10-15) Primera versión
     + Casa 3D (three.js r128) con la mascota y Miss Hoot, la profe búho. La mascota sigue el dedo con los ojos,
       salta si la tocan, se ríe si le hacen cosquillas y dice en inglés la parte del cuerpo que le tocan.
     + Primera vez: el huevo ("Tap, tap, tap!" y nace), elegir su color ("Red!") y su nombre.
     + Lección del día: la profe presenta hasta 3 palabras nuevas y las practican con la mascota, mezcladas con repaso.
     + Juegos: "Paint Pip!" (colores) y "Feed Pip" (comida). Monedas ⭐ por acierto; la comida le llena la panza.
     + Registro de cada intento (CONFUNDE_TEMA, CONFUNDE_PARECIDA…), repaso espaciado y niveles como las demás de 1ro.
   v1.1.0  (2026-10-15) Supermercado, despensa y partes del cuerpo
     + 🛒 Supermercado: la mascota pide ("I want two bananas!"), Luz lo busca en la góndola y lo pone en el carrito
       (contando en inglés si son varios) y paga en la caja con sus ⭐, moneda por moneda ("One! Two! Three!").
     + 🧺 Despensa: lo comprado queda guardado; la mascota pide qué quiere comer y Luz se lo da (arrastrar o tocar).
     + Juego "Touch Pip!": "Touch Mimi's nose!" y Luz toca esa parte en la mascota (estornuda, mueve las orejas, guiña…).
   v1.2.0  (2026-10-15) Baño, dormitorio y patio
     + 🛁 Baño: "Wash Mimi's ears!" (frotar la parte del cuerpo, con espuma) y "Pop five bubbles!" (reventar contando).
     + 🛏️ Dormitorio: "Where is my teddy bear?" (ordenar los juguetes, tema cosas), a la cama, "Turn off the light!" y a dormir
       hasta "Good morning!".
     + ⚽ Patio: pelota y arco. Se arrastra desde la pelota hacia abajo: la flecha marca dirección y fuerza, y al soltar patea.
       Los goles se cuentan en inglés ("Goal! Two goals!").
     + Juego "Find it!" (cosas) también en la lección. Necesidades nuevas: limpieza 🫧 y energía ⚡.
     + La nariz de la mascota se ve y se toca bien; si la parte pedida ya brilla, cualquier toque avanza (antes se trababa).
     + La casa ordena los botones: ¡A aprender!, 🎮 Juegos (menú) y los lugares 🛒 🛁 🛏️ ⚽.
   v1.3.0  (2026-10-15) Números, sentimientos e inclinación
     + Juego "How many?" (números): "Give Mimi three apples!" y Luz toca el plato con esa cantidad; la profe cuenta mientras
       cada cosa vuela a la boca. Error nuevo CANTIDAD_MAL.
     + Tema sentimientos y juego "How is Mimi?": "Mimi is sad!" → Luz toca la carita y la mascota lo actúa.
     + Al llegar a la casa, la profe pregunta "How is Mimi?" según lo que le pasa (hambre, sueño…) y Luz toca la carita.
     + Al inclinar la tablet la escena se mueve un poco; la pantalla no se apaga mientras juega (Wake Lock).
     + El botón para ir a English muestra la bandera de Estados Unidos.
   ------------------------------------------------------------
   El entorno J que reciben los juegos (ING_JUEGOS) se arma en entorno(): M, O, pip, hoot, az, nivel, nombre, debug,
   posiciones(n), responder(w) → {ok, mostrar, ignorar}, opciones(lista), aviso(icono, texto), pintado(color), alimentar(n),
   decir(texto, alEmpezar) (la profe habla cuando se calla lo anterior: la cuenta de "How many?"). */
(function () {
  'use strict';
  var VERSION = '1.3.0', ACT = '1ro-ingles-mascota';
  var V = ING_VOCAB, JG = ING_JUEGOS, LC = ING_LECC, PET = ING_PET, TD = ING_TIENDA, VZ = ING_VOZ, O = ING_OBJ3D, RP = REPASO1, UI = REF4_UI;
  var esc = UI1.esc, TX = UI1.txt, F = UI1.frase;
  var ctx = UI1.base({ act: ACT, version: VERSION, titulo: 'Mi mascota', alCambiarCaso: function () { pintarHUD(); if (S.banner) banner(S.banner); } });
  if (!ctx) return;
  var $ = function (s) { return document.querySelector(s); };
  var ahora = Date.now();
  var rep = ctx.store.get('repaso', null) || RP.vacio();
  var pet = PET.avanzar(PET.normalizar(ctx.store.get('pet', null), ahora), ahora);
  var nena = MATE.perfil().nombre;
  var S = { modo: 'inicio', token: 0 };
  function guardar() { pet.ts = Date.now(); try { ctx.store.set('pet', pet); ctx.store.set('repaso', rep); } catch (e) { /* sin espacio */ } }
  var nombre = function () { return pet.nombre || 'Pip'; };
  var nombreVoz = function () { return nombre().charAt(0) + nombre().slice(1).toLowerCase(); };

  /* ---------- escena ---------- */
  var M;
  try { M = ING_MUNDO.crear($('#escena')); }
  catch (e) {
    console.error('[' + ACT + ' v' + VERSION + ']', 'sin 3D:', e && e.message);
    velo('<div class="grande">😿</div><h2>' + esc(F('Sin 3D')) + '</h2><p>' + esc(F('Este dispositivo no puede mostrar la casa de la mascota.')) + '</p>' +
      '<div class="l1-fila"><button class="ing-btn" id="v-menu">🏠 ' + esc(F('Menú')) + '</button><button class="ing-btn main" id="v-eng">🇺🇸 English</button></div>');
    $('#v-menu').onclick = function () { MATE.irMenu(); }; $('#v-eng').onclick = function () { MATE.abrir('1ro-ingles'); };
    return;
  }
  var pip = ING_MASCOTA3D.crear(M, { color: pet.color || '#f4f0ff', escala: PET.etapa(pet).escala });
  var hoot = ING_PROFE3D.crear(M);
  var SUP = ING_SUPER3D.crear(M), LG = ING_LUGARES.crear(M);
  addEventListener('resize', function () { if (SUP.grupo.visible) { hoot.ponerEn(SUP.lugarProfe()); var lp = SUP.lugarPip(); pip.ponerEn(lp[0], lp[1]); pip.escala(PET.etapa(pet).escala * SUP.escalaPip()); } });
  pip.visible(pet.nacido);
  var base = M.scene.children.slice();             // lo que queda siempre (lo demás se limpia entre pasos)
  function limpiarEscena() { M.limpiar(M.scene.children.filter(function (o) { return base.indexOf(o) < 0; })); }
  M.alMover(function (info) { pip.mirar(info.x * 1.3, info.y * 1.1 + 0.25); });

  // Acerca la mascota a la cámara (para tocarle la nariz u otra parte chiquita); sin tween si es para volver de golpe.
  var cerca = false;
  function acercar(on, deGolpe) {
    if (on === cerca) return; cerca = on;
    var e = PET.etapa(pet).escala, z0 = on ? -0.2 : 0.9, z1 = on ? 0.9 : -0.2, e0 = on ? e : e * 1.35, e1 = on ? e * 1.35 : e;
    if (deGolpe) { pip.ponerEn(0, z1); pip.escala(e1); return; }
    M.tween(600, function (k) { pip.ponerEn(0, z0 + (z1 - z0) * k); pip.escala(e0 + (e1 - e0) * k); }, null, 'entraSale');
  }

  /* ---------- voz ---------- */
  function profe(texto, despues) { VZ.decir(texto, { quien: 'profe', alEmpezar: function () { hoot.hablar(true); }, alTerminar: function () { hoot.hablar(false); }, despues: despues }); }
  function pipDice(texto, despues) { VZ.decir(texto, { quien: 'pip', alEmpezar: function () { pip.hablar(true); }, alTerminar: function () { pip.hablar(false); }, despues: despues }); }
  function charla(lista, despues) {
    VZ.secuencia(lista.map(function (x) {
      var p = x.quien === 'pip' ? pip : hoot;
      return { t: x.t, quien: x.quien || 'profe', lento: x.lento, alEmpezar: function () { p.hablar(true); }, alTerminar: function () { p.hablar(false); } };
    }), despues);
  }
  // Espera a que termine de hablar (y un respiro) antes de seguir.
  function cuandoCalle(fn, extra) {
    var quieto = 0, quitar = M.cuadro(function (dt) { quieto = VZ.hablando() ? 0 : quieto + dt; if (quieto > (extra || 0.35)) { quitar(); fn(); } });
  }
  var frase = function (w) { return (w.art ? w.art + ' ' : '') + w.en.toLowerCase(); };   // "an apple", "blue"

  /* ---------- interfaz encima ---------- */
  function velo(html) { $('#panel').innerHTML = html; $('#velo').hidden = !html; }
  function dib(w) { return w.color ? '<span class="ing-color" style="background:' + w.color + '"></span>' : esc(w.img); }
  function banner(o) {
    S.banner = o; var b = $('#banner');
    if (!o) { b.hidden = true; return; }
    b.innerHTML = '<span class="ic">' + (o.w ? dib(o.w) : esc(o.icono || '')) + '</span><div><div class="en">' + esc(TX(o.en)) + '</div>' + (o.es ? '<div class="es">' + esc(F(o.es)) + '</div>' : '') + '</div>' +
      (o.oir ? '<button class="l1-btn ing-oir" id="oir" title="Escuchar otra vez">🔊</button>' : '');
    b.hidden = false;
    var oir = $('#oir'); if (oir) oir.onclick = function () { S.repite = (S.repite || 0) + 1; o.oir(); };
  }
  var tChip = 0;
  function chip(html, mal, ms) { var c = $('#chip'); clearTimeout(tChip); if (!html) { c.hidden = true; return; } c.innerHTML = html; c.className = 'ing-chip' + (mal ? ' mal' : ''); c.hidden = false; if (ms) tChip = setTimeout(function () { c.hidden = true; }, ms); }
  function aviso(icono, texto) { var a = $('#aviso'); if (!texto) { a.hidden = true; return; } a.textContent = icono + ' ' + F(texto); a.hidden = false; }
  function pintarHUD() {
    var h = PET.NECESIDADES.map(function (n) {
      var c = pet[n.id] < 40 ? 'var(--bad)' : (n.id === 'panza' ? 'var(--warn)' : 'var(--accent2)');
      return '<div class="ing-burbuja ing-card" title="' + n.id + '"><div class="ing-anillo" style="--v:' + Math.round(pet[n.id]) + ';--c:' + c + '"><span>' + n.icono + '</span></div></div>';
    }).join('');
    $('#estado').innerHTML = pet.nacido ? h + '<div class="ing-burbuja ing-card" id="monedas"><span class="ing-moneda">⭐</span>' + pet.monedas + '</div>' : '';
    var ab = $('#abajo');
    if (S.modo === 'casa') {
      ab.innerHTML = '<button class="ing-btn main' + (pet.lecciones ? '' : ' late') + '" id="b-leccion"><span class="ic">🦉</span>' + esc(F('¡A aprender!')) + '</button>' +
        '<button class="ing-btn" id="b-juegos"><span class="ic">🎮</span>' + esc(F('Juegos')) + '</button>' +
        LUGARES.map(function (l) { return '<button class="ing-btn ing-lugar' + (S.sugerido === l[0] ? ' late' : '') + '" data-l="' + l[0] + '" title="' + l[2] + '">' + l[1] + '</button>'; }).join('') +
        (TD.cuantas(pet) ? '<button class="ing-btn ing-lugar' + (S.recienCompro ? ' main late' : '') + '" id="b-comida" title="Su comida">🧺<b>' + TD.cuantas(pet) + '</b></button>' : '');
      $('#b-leccion').onclick = leccion; $('#b-juegos').onclick = menuJuegos; if ($('#b-comida')) $('#b-comida').onclick = despensa;
      ab.querySelectorAll('[data-l]').forEach(function (b) { b.onclick = function () { ({ super: supermercado, bano: bano, dormir: dormitorio, patio: patio })[b.dataset.l](); }; });
    } else if (S.modo === 'leccion' || S.modo === 'libre') {
      ab.innerHTML = '<button class="ing-btn" id="b-salir" title="Volver a la casa">✖</button><div class="ing-prog ing-card">' + S.res.map(function (r, i) {
        return '<i class="' + (r || (i === S.k ? 'actual' : '')) + '"></i>'; }).join('') + '</div><span style="width:64px"></span>';
      $('#b-salir').onclick = function () { VZ.callar(); casa(false); };
    } else if (S.modo === 'super') {
      ab.innerHTML = '<button class="ing-btn" id="b-salir" title="Volver a la casa">✖</button><div class="ing-lista ing-card">' + S.lista.map(function (it, i) {
        var hecho = S.compra[i] >= it.n, cual = hecho || i < S.k ? dib(it.w) : '❔';
        return '<span class="' + (hecho ? 'ok' : (i === S.k ? 'actual' : '')) + '">' + cual + (it.n > 1 ? '<b>×' + it.n + '</b>' : '') + '</span>';
      }).join('') + '</div><span style="width:64px"></span>';
      $('#b-salir').onclick = function () { VZ.callar(); casa(false); };
    } else if (S.modo === 'patio') {
      ab.innerHTML = '<button class="ing-btn" id="b-salir" title="Volver a la casa">🏠</button><div class="ing-burbuja ing-card ing-goles">⚽ ' + S.goles + '</div><span style="width:64px"></span>';
      $('#b-salir').onclick = function () { VZ.callar(); casa(false); };
    } else if (S.modo === 'bano' || S.modo === 'dormir') {
      ab.innerHTML = '<button class="ing-btn" id="b-salir" title="Volver a la casa">🏠 ' + esc(F('Casa')) + '</button>' +
        (S.fase === 'duerme' ? '<button class="ing-btn main late" id="b-dia"><span class="ic">☀️</span>Good morning!</button>' : '');
      $('#b-salir').onclick = function () { VZ.callar(); casa(false); };
      if ($('#b-dia')) $('#b-dia').onclick = despertar;
    } else if (S.modo === 'despensa') {
      ab.innerHTML = '<button class="ing-btn" id="b-salir" title="Volver a la casa">🏠 ' + esc(F('Casa')) + '</button>' + (TD.cuantas(pet) ? '' : '<button class="ing-btn main" id="b-super"><span class="ic">🛒</span>' + esc(F('Súper')) + '</button>');
      $('#b-salir').onclick = function () { VZ.callar(); casa(false); };
      if ($('#b-super')) $('#b-super').onclick = supermercado;
    } else ab.innerHTML = '';
  }
  var LUGARES = [['super', '🛒', 'Súper'], ['bano', '🛁', 'Baño'], ['dormir', '🛏️', 'Dormitorio'], ['patio', '⚽', 'Patio']];
  function menuJuegos() {
    velo('<h2>🎮 ' + esc(F('Juegos')) + '</h2><div class="ing-nombres">' + JG.lista().map(function (j) {
      return '<button class="ing-btn" data-j="' + j.id + '"><span class="ic">' + j.icono + '</span>' + esc(j.nombre.replace('Pip', nombreVoz())) + '</button>'; }).join('') +
      '</div><div class="l1-fila"><button class="ing-btn" id="v-no">✖ ' + esc(F('Cerrar')) + '</button></div>');
    $('#panel').querySelectorAll('[data-j]').forEach(function (b) { b.onclick = function () { velo(''); jugarSolo(b.dataset.j); }; });
    $('#v-no').onclick = function () { velo(''); };
  }
  function saltarMonedas() { var m = $('#monedas'); if (m) { m.classList.remove('salta'); void m.offsetWidth; m.classList.add('salta'); } }

  /* ---------- toques en la casa ---------- */
  var cosquillas = 0, ultRisa = 0;
  function espuma(punto, n) { M.particulas('gota', punto, n || 4, { color: '#ffffff', arriba: 0.8, fuerza: 0.7, gravedad: 0.6, vida: 1.2, tam: 0.2 }); }
  pip.alTocar(function (parte, hit) {
    if (S.modo === 'bano' && hit && hit.point) { espuma(hit.point, 6); VZ.sfx('burbuja'); }
    if (S.tocarPip) { S.tocarPip(parte); return; }
    if (S.modo !== 'casa') return;
    var w = V.palabras({ temas: ['cuerpo'] }).filter(function (x) { return x.parte === parte; })[0];
    VZ.sfx('boing'); pip.saltar(0.45);
    if (w) { pipDice(w.en); chip(dib(w) + ' ' + esc(TX(w.en)) + ' = ' + esc(TX(w.es)), false, 2200); }
    else M.particulas('corazon', pip.cabeza.getWorldPosition(new M.T.Vector3()).add(new M.T.Vector3(0, 0.5, 0.3)), 3);
    PET.sumar(pet, 'alegria', 1); pintarHUD(); guardar();
  });
  M.alMover(function (info) {
    if (S.modo === 'bano' && info.abajo) { var gb = M.golpe(info.e); if (gb && pip.esMio(gb) && Math.random() < 0.5) espuma(gb.hit.point, 2); return; }
    if (S.modo !== 'casa' || !info.abajo) return;
    var g = M.golpe(info.e); if (!g || !pip.esMio(g)) return;
    cosquillas += 1;
    if (cosquillas > 14 && Date.now() - ultRisa > 1800) { cosquillas = 0; ultRisa = Date.now(); pip.reir(); PET.sumar(pet, 'alegria', 3); pintarHUD(); guardar(); }
  });
  hoot.alTocar(function () {
    if (S.modo === 'casa') { hoot.asentir(); profe('Hoo hoo! Hello, ' + nena + '!'); }
    else if (S.oirActual) { S.repite = (S.repite || 0) + 1; S.oirActual(); }
  });

  /* ---------- inicio (hace falta un toque para que suene la voz) ---------- */
  function inicio() {
    var avisoVoz = !VZ.hayVoz() ? '<p class="l1-msg mal">' + esc(F('Este dispositivo no tiene voz en inglés.')) + '</p>' : (!VZ.sonidoOn() ? '<p class="l1-msg mal">' + esc(F('Prendé el sonido 🔊 para escuchar.')) + '</p>' : '');
    velo('<div class="grande">' + (pet.nacido ? '🐾' : '🥚') + '</div><h2>' + esc(pet.nacido ? TX(nombre()) : F('¡Hola!')) + '</h2>' + avisoVoz +
      '<div class="l1-fila"><button class="ing-btn main" id="v-jugar">▶ ' + esc(F('¡A jugar!')) + '</button></div>');
    $('#v-jugar').onclick = function () { velo(''); VZ.sfx('pop'); despierta(); M.inclinacion(); if (pet.nacido) casa(true); else huevo(); };
  }
  VZ.alCambiarVoces(function () { if (S.modo === 'inicio') inicio(); });
  // Que la pantalla no se apague mientras juega (se suelta sola al salir de la pestaña; al volver se pide de nuevo).
  var wake = null;
  function despierta() { try { if (navigator.wakeLock && document.visibilityState === 'visible') navigator.wakeLock.request('screen').then(function (l) { wake = l; }).catch(function () {}); } catch (e) { /* sin Wake Lock */ } }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && wake) despierta(); });

  /* ---------- nacimiento ---------- */
  function huevo() {
    S.modo = 'huevo'; S.token++; pintarHUD();
    var h = O.huevo(M), taps = 0, mano = O.mano(M); h.position.set(0, 7, -0.2); M.scene.add(h);
    M.tween(900, function (k) { h.position.y = 7 * (1 - k); }, function () {
      VZ.sfx('boing'); M.tween(500, function (k) { h.scale.set(1 + 0.15 * Math.sin(k * Math.PI) * (1 - k), 1 - 0.15 * Math.sin(k * Math.PI) * (1 - k), 1 + 0.15 * Math.sin(k * Math.PI) * (1 - k)); }, null, 'lineal');
      banner({ icono: '🥚', en: 'Tap, tap, tap!', es: 'Tocá el huevo', oir: function () { profe('Tap, tap, tap!'); } });
      S.oirActual = function () { profe('Tap, tap, tap!'); };
      charla([{ t: 'Look! An egg!' }, { t: 'Tap, tap, tap!' }]);
      mano.position.set(0.35, 1.7, 0.4); M.scene.add(mano);
    }, function (k) { return k * k; });
    var NUM = ['One!', 'Two!', 'Three!'];
    M.tocable(h, function () {
      if (taps >= 3) return;
      taps++; VZ.sfx('crack'); VZ.vibrar(40); h.userData.rajarse(taps);
      M.tween(500, function (k) { h.rotation.z = Math.sin(k * Math.PI * 4) * 0.18 * (1 - k); }, null, 'lineal');
      M.particulas('brillo', new M.T.Vector3(0, 1, 0.3), 3);
      profe(NUM[taps - 1]); chip(esc(TX(NUM[taps - 1].replace('!', ''))) + ' = ' + esc(TX(['uno', 'dos', 'tres'][taps - 1])), false, 1500);
      if (taps === 3) {
        mano.userData.quitar(); banner(null);
        M.esperar(700, function () {
          VZ.sfx('brillo'); M.particulas('estrella', new M.T.Vector3(0, 1, 0), 14); M.particulas('brillo', new M.T.Vector3(0, 1, 0.2), 6);
          M.tween(300, function (k) { h.scale.setScalar(1 + k * 0.4); }, function () { M.limpiar([h]); pip.visible(true); pip.nacer(function () { charla([{ t: 'Hello, baby!' }, { t: 'Hi!', quien: 'pip' }], elegirColor); }); });
        });
      }
    });
  }
  function elegirColor() {
    S.modo = 'color'; pintarHUD();
    var cols = V.palabras({ temas: ['colores'], nivel: 1 }).concat([V.por('PINK')]), pos = posiciones(cols.length), elegido = null;
    banner({ icono: '🎨', en: 'What color?', es: 'Elegí su color', oir: function () { profe('What color?'); } });
    profe('What color?');
    cols.forEach(function (w, i) {
      var b = O.balde(M, w.color); b.position.copy(pos[i]); b.scale.setScalar(0.01); M.scene.add(b);
      M.tween(450 + i * 80, function (k) { b.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote');
      M.tocable(b, function () {
        elegido = w; O.rebotar(M, b, 0.4); VZ.sfx('splash'); M.particulas('gota', b.position.clone().setY(0.5), 10, { color: w.color, arriba: 3 });
        pip.colorA(w.color, 500, function () { pip.saltar(0.4); }); pipDice(w.en + '!');
        chip(dib(w) + ' ' + esc(TX(w.en)) + ' = ' + esc(TX(w.es)), false);
        $('#abajo').innerHTML = '<button class="ing-btn main" id="b-listo">✔ ' + esc(F('¡Listo!')) + '</button>';
        $('#b-listo').onclick = function () { pet.color = elegido.color; guardar(); limpiarEscena(); chip(null); elegirNombre(); };
      });
    });
  }
  function elegirNombre() {
    S.modo = 'nombre'; banner(null); $('#abajo').innerHTML = ''; var elegido = null;
    profe('What is your name?');
    velo('<h2>' + esc(F('¿Cómo se llama?')) + '</h2><div class="ing-nombres">' + PET.NOMBRES.map(function (n) { return '<button class="ing-btn" data-n="' + n + '">' + esc(TX(n)) + '</button>'; }).join('') +
      '</div><div class="l1-fila"><button class="ing-btn main" id="v-ok" disabled>✔ ' + esc(F('¡Listo!')) + '</button></div>');
    $('#panel').querySelectorAll('[data-n]').forEach(function (b) {
      b.onclick = function () {
        elegido = b.dataset.n; $('#panel').querySelectorAll('[data-n]').forEach(function (x) { x.classList.toggle('elegido', x === b); });
        $('#v-ok').disabled = false; pip.saltar(0.35); pipDice("Hi! I'm " + elegido.charAt(0) + elegido.slice(1).toLowerCase() + '!');
      };
    });
    $('#v-ok').onclick = function () {
      pet.nombre = elegido; pet.nacido = true; guardar(); velo('');
      ctx.log('nació', pet.nombre, pet.color);
      casa(false); pip.feliz(); charla([{ t: "Let's play!" }]);
    };
  }

  /* ---------- casa ---------- */
  function casa(saludo) {
    S.modo = 'casa'; S.token++; S.oirActual = null; S.tocarPip = null; limpiarEscena(); banner(null); chip(null); aviso(); UI.fuegos.parar();
    salirLugares(); pintarHUD(); S.recienCompro = false;
    if (!saludo) return;
    var an = PET.animo(pet), tk = S.token;
    S.sugerido = an === 'sucio' ? 'bano' : (an === 'sueno' ? 'dormir' : (an === 'hambre' && !TD.cuantas(pet) ? 'super' : null)); pintarHUD();
    function avisar() {
      if (!vivo(tk)) return;
      var a = an === 'hambre' ? ['🍎', nombre() + ' tiene hambre' + (TD.cuantas(pet) ? ': tocá 🧺' : ': ¡vamos al súper 🛒!')] : (an === 'sucio' ? ['🛁', nombre() + ' necesita un baño'] : (an === 'sueno' ? ['🛏️', nombre() + ' tiene sueño'] : null));
      if (an === 'sucio') profe(nombreVoz() + ' is dirty!');
      if (a) { aviso(a[0], a[1]); setTimeout(function () { if (vivo(tk)) aviso(); }, 5000); }
    }
    charla([{ t: 'Hello, ' + nena + '!' }, { t: 'Hello!', quien: 'pip' }], function () { if (vivo(tk)) comoEsta(an, tk, avisar); });
    M.esperar(600, function () { pip.feliz(); });
  }
  // "How is Mimi?": la mascota actúa lo que le pasa y Luz toca la carita (no se registra: es parte del cuidado).
  var SENTIR = { hambre: 'HUNGRY', sueno: 'SLEEPY', aburrido: 'SAD', feliz: 'HAPPY', contento: 'HAPPY' };
  function comoEsta(an, tk, despues) {
    var w = V.por(SENTIR[an] || ''); if (!w) return despues();
    var ops = ctx.az.mezclar([w].concat(ctx.az.mezclar(V.palabras({ temas: ['sentimientos'], nivel: 1 }).filter(function (x) { return x !== w; })).slice(0, 2)));
    var pos = posiciones(3), listo = false, dicho = 'How is ' + nombreVoz() + '?', oir = function () { profe(dicho); };
    pip.sentir(w.sentir); banner({ icono: '🎭', en: dicho, es: '¿Cómo está ' + nombre() + '?', oir: oir }); oir();
    var fichas = ops.map(function (x, i) {
      var f = O.ficha(M, x, 0.7); f.position.copy(pos[i]); f.scale.setScalar(0.01); M.scene.add(f);
      M.esperar(300 + i * 90, function () { VZ.sfx('pop'); M.tween(450, function (k) { f.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
      M.tocable(f, function () { elegir(f); }); return f;
    });
    S.opciones = fichas.map(function (f) { return { w: f.userData.w, elegir: function () { elegir(f); } }; });
    function elegir(f) {
      var x = f.userData.w; if (listo || !vivo(tk) || f.userData.fuera) return;
      if (x !== w) { f.userData.fuera = true; O.temblar(M, f); O.apagar(f, true); pip.no(); VZ.sfx('mal'); chip(dib(x) + ' ' + esc(TX(x.en)) + ' = ' + esc(TX(x.es)), true, 2500); charla([{ t: "No, that's " + x.en.toLowerCase() + '.' }, { t: dicho }]); return; }
      listo = true; S.opciones = null; VZ.sfx('ok'); hoot.aplaudir(); banner(null); O.rebotar(M, f, 0.4);
      chip(dib(w) + ' ' + esc(TX(w.en)) + ' = ' + esc(TX(w.es)), false, 3000);
      fichas.forEach(function (y) { M.esperar(y === f ? 600 : 0, function () { M.tween(300, function (k) { y.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([y]); }); }); });
      pip.sentir(w.sentir); charla([{ t: 'Yes! ' + nombreVoz() + ' is ' + w.en.toLowerCase() + '!' }], function () { if (vivo(tk)) despues(); });
    }
  }

  /* ---------- lección y juegos ---------- */
  function nivel() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(3, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  function posiciones(n) {
    var medio = Math.min(2.3, M.anchoVisible(1.5) * 0.8), out = [];
    for (var i = 0; i < n; i++) out.push(new M.T.Vector3(n === 1 ? 0 : -medio + i * (2 * medio / (n - 1)), 0, 1.5 - (n > 3 && (i === 0 || i === n - 1) ? 0.35 : 0)));
    return out;
  }
  function empezar(modo, pasos) {
    VZ.callar(); limpiarEscena(); chip(null); aviso(); banner(null); UI.fuegos.parar();
    S.modo = modo; S.pasos = pasos; S.i = -1; S.k = -1; S.res = pasos.filter(function (p) { return p.tipo === 'juego'; }).map(function () { return null; });
    S.t0r = Date.now(); S.ganadas = 0; S.nuevas = pasos.filter(function (p) { return p.tipo === 'presenta'; }).map(function (p) { return p.w; });
    ctx.reg.iniciarRonda(); ctx.reg.ctx.nivel = nivel();
    ctx.log(modo, pasos.map(function (p) { return p.tipo + (p.w ? ':' + p.w.en : ''); }).join(' '));
    pintarHUD(); siguientePaso();
  }
  function leccion() { empezar('leccion', LC.armar({ nivel: nivel(), rep: rep, az: ctx.az })); }
  function jugarSolo(id) { empezar('libre', LC.rondaJuego({ juego: id, nivel: nivel(), rep: rep, az: ctx.az, n: 6 })); }
  function siguientePaso() {
    var tk = ++S.token; limpiarEscena(); aviso(); hoot.senalar(false); S.tocarPip = null; acercar(false);
    S.i++; var p = S.pasos[S.i]; S.paso = p; S.oirActual = null;
    if (!p) return terminar();
    ({ hola: hola, presenta: presenta, juego: juego, chau: chau })[p.tipo](p, tk);
  }
  var vivo = function (tk) { return tk === S.token; };
  function hola(p, tk) {
    banner({ icono: '🦉', en: 'Hello, ' + nena + '!' });
    M.esperar(300, function () { pip.feliz(); });
    charla([{ t: 'Hello, ' + nena + '!' }, { t: "Let's play with " + nombreVoz() + '!' }], function () { if (vivo(tk)) siguientePaso(); });
  }
  function presenta(p, tk) {
    var w = p.w, obj = S.objPresenta = O.palabra(M, w, 1.1), listo = false, mano = O.mano(M), fl;
    obj.position.set(M.vertical() ? 0.9 : 1.5, 0, 1.0); obj.scale.setScalar(0.01); M.scene.add(obj);
    M.tween(600, function (k) { obj.scale.setScalar(Math.max(0.01, k)); }, function () { fl = O.flotar(M, obj, 0.08); }, 'rebote');
    var aura = M.aura(obj, 2); VZ.sfx('brillo'); hoot.senalar(true); pip.mirarA(obj.position);
    var decirla = function () { charla([{ t: 'Look! ' + (w.art ? w.art + ' ' : '') + w.en.toLowerCase() + '.' }, { t: w.en.toLowerCase() + '!', lento: true }]); };
    banner({ w: w, en: w.en, es: w.es, oir: decirla }); S.oirActual = decirla;
    charla([{ t: 'Look! ' + frase(w) + '.' }, { t: w.en.toLowerCase() + '!', lento: true }], function () {
      if (!vivo(tk)) return;
      listo = true; mano.position.set(obj.position.x + 0.25, 1.9, obj.position.z + 0.3); M.scene.add(mano); aviso('👆', 'Tocalo');
    });
    M.tocable(obj, function () {
      if (!listo || !vivo(tk)) return;
      listo = false; mano.userData.quitar(); aviso(); hoot.senalar(false); aura.quitar(); if (fl) fl.parar();
      VZ.sfx('pop'); M.particulas('estrella', obj.position.clone().setY(0.9), 10);
      if (w.color) pip.destello(w.color, 900); else if (w.sentir) pip.sentir(w.sentir); else pip.saltar(0.5);
      M.tween(350, function (k) { obj.scale.setScalar(Math.max(0.01, 1 + 0.3 * k - 1.3 * k * k)); }, function () { M.limpiar([obj]); });
      pipDice(w.en + '!', function () { if (vivo(tk)) M.esperar(400, siguientePaso); });
    });
  }
  // o (opcional): {orden, quien:'pip', icono, fin} para usar un juego fuera de la lección (la despensa).
  function juego(p, tk, o) {
    o = o || {};
    S.k++; S.intento = 0; S.fase = 'responde'; S.t0 = Date.now(); S.repite = 0; pintarHUD(); chip(null);
    var j = JG.get(p.juego); S.orden = o.orden || j.orden(p.w, nombreVoz(), p); S.quienOrden = o.quien || 'profe';
    var oir = function () { (S.quienOrden === 'pip' ? pipDice : profe)(S.orden); };
    banner({ icono: o.icono || j.accion, en: S.orden, oir: oir }); S.oirActual = oir;
    ctx.log('juego', p.juego, p.w.en, p.opciones.map(function (w) { return w.en; }).join(','));
    j.jugar(entorno(tk), p, function () {
      if (!vivo(tk)) return;
      S.fase = 'fin'; cuandoCalle(function () { if (vivo(tk)) M.esperar(350, o.fin || siguientePaso); });
    });
    M.esperar(500, function () { if (vivo(tk)) oir(); });
  }
  function chau(p, tk) {
    banner({ icono: '🦉', en: 'Great job, ' + nena + '!' }); hoot.aplaudir(); pip.feliz();
    charla([{ t: 'Great job, ' + nena + '!' }, { t: 'Bye bye!', quien: 'pip' }], function () { if (vivo(tk)) terminar(); });
  }

  // El entorno de cada paso: si el paso ya terminó (se salió a la casa), lo que llegue tarde no hace nada.
  function entorno(tk) {
    return {
      M: M, O: O, pip: pip, hoot: hoot, az: ctx.az, nivel: nivel(), nombre: nombre(), debug: ctx.debug, posiciones: posiciones,
      responder: function (w) { return vivo(tk) ? responder(w) : { ignorar: true }; },
      opciones: function (lista) { S.opciones = lista; },
      aviso: function (icono, texto) { if (vivo(tk)) aviso(icono, texto); },
      decir: function (texto, alEmpezar) { cuandoCalle(function () { if (!vivo(tk)) return; profe(texto); if (alEmpezar) alEmpezar(); }, 0.1); },
      pintado: function (color) { pet.color = color; guardar(); },
      alimentar: function (n) { PET.sumar(pet, 'panza', n); PET.sumar(pet, 'alegria', 2); guardar(); pintarHUD(); },
      acercarPip: function (on) { if (vivo(tk)) acercar(on); },
      destino: S.modo === 'dormir' ? function () { return LG.dormitorio.posCaja(); } : null,
      tocarPip: function (fn) { S.tocarPip = fn && vivo(tk) ? fn : null; }
    };
  }
  function registrar(ok, error, w) {
    var p = S.paso, pw = p.w;
    if (p.sinRegistro) return;
    ctx.reg.evento({ tipo: 'paso', tema: pw.tema, paso: p.juego, intento: S.intento, item: { palabra: pw.en, img: pw.img || '🎨', tema: pw.tema, es: pw.es },
      esperado: pw.en, respuesta: w.en, ok: ok, error: error, forma: UI1.caso(), ms: Date.now() - S.t0, ayuda: S.repite ? 'repitio ' + S.repite : 'ninguna', modo: S.modo, cantidad: p.n || undefined });
    S.t0 = Date.now();
    if (S.intento === 1) { RP.registrar(rep, pw.en, ok); S.res[S.k] = ok ? 'ok' : 'mal'; }
    guardar();
  }
  var BIEN = ['Yes!', 'Great!', 'Good job!', 'Super!'];
  function responder(w) {
    var p = S.paso, j = JG.get(p.juego), err = j && j.error ? j.error(p.w, w) : V.errorEleccion(p.w, w);
    if (S.fase === 'fin') return { ignorar: true };
    if (S.fase === 'muestra') { if (err) return { ignorar: true }; S.fase = 'fin'; acierto(false, true); return { ok: true }; }
    S.intento++;
    registrar(!err, err, w);
    if (!err) { S.fase = 'fin'; acierto(S.intento === 1); return { ok: true, primera: S.intento === 1 }; }
    VZ.sfx('mal'); VZ.vibrar(60);
    chip(dib(w) + ' ' + esc(TX(w.en)) + ' = ' + esc(TX(w.es)), true, 3500);
    if (S.intento >= 2) { S.fase = 'muestra'; charla([{ t: "That's " + frase(w) + '.' }, { t: 'Look! ' + frase(p.w) + '.' }]); return { ok: false, mostrar: true }; }
    charla([{ t: "No, that's " + frase(w) + '.' }, { t: S.orden, quien: S.quienOrden }]);
    return { ok: false };
  }
  function acierto(primera, mostrado) {
    var w = S.paso.w, etapa0 = PET.etapa(pet).id;
    VZ.sfx('ok'); hoot.aplaudir();
    chip(dib(w) + ' ' + esc(TX(w.en)) + ' = ' + esc(TX(w.es)), false, S.modo === 'super' ? 2200 : 0);
    if (S.modo === 'super') { PET.sumar(pet, 'alegria', 2); guardar(); return; }      // en el súper se gasta, no se gana (y lo que se dice lo pone el súper)
    if (!mostrado && S.modo !== 'despensa') {
      PET.premiar(pet, primera); S.ganadas += primera ? 2 : 1;
      setTimeout(function () { VZ.sfx('monedas'); pintarHUD(); saltarMonedas(); }, 400);
    }
    profe((mostrado ? 'Good! ' : BIEN[Math.floor(Math.random() * BIEN.length)] + ' ') + w.en.toLowerCase() + '!');
    if (PET.etapa(pet).id !== etapa0) {          // creció
      var e = PET.etapa(pet).escala; M.esperar(1600, function () { M.tween(800, function (k) { pip.escala(e * (0.9 + 0.1 * k)); }, null, 'elastico'); M.particulas('estrella', new M.T.Vector3(0, 1.4, 0), 16); });
      ctx.log('creció', PET.etapa(pet).id);
    }
    guardar();
  }
  function terminar() {
    acercar(false);
    var tk = ++S.token, n = S.res.length, ok1 = S.res.filter(function (r) { return r === 'ok'; }).length, pct = n ? Math.round(100 * ok1 / n) : 100;
    var r = ctx.reg.cerrarRonda(pct, Date.now() - S.t0r, false, 3);
    if (S.modo === 'leccion') pet.lecciones++;
    guardar(); banner(null); chip(null); limpiarEscena(); S.modo = 'resumen'; pintarHUD();
    UI.fuegos.iniciar(); VZ.sfx('brillo'); pip.feliz();
    var e = ''; for (var i = 1; i <= 3; i++) e += '<span class="' + (i <= r.estrellas ? '' : 'off') + '">⭐</span>';
    var nuevas = S.nuevas.length ? '<p>' + esc(F('Palabras nuevas:')) + '</p><div class="ing-palabras">' + S.nuevas.map(function (w) { return '<span>' + dib(w) + ' ' + esc(TX(w.en)) + '</span>'; }).join('') + '</div>' : '';
    velo('<h2>' + esc(F(r.estrellas === 3 ? '¡Excelente!' : (r.estrellas === 2 ? '¡Muy bien!' : '¡Buen trabajo!'))) + '</h2><div class="ing-estrellas">' + e + '</div>' +
      '<p>' + esc(F(ok1 + ' de ' + n + ' bien a la primera')) + '</p><p>' + esc(F('Ganaste')) + ' ⭐ ' + S.ganadas + '</p>' + nuevas +
      (r.cambio === 1 ? '<p><b>' + esc(F('¡Subiste al nivel ' + r.nivel + '!')) + '</b></p>' : '') +
      '<div class="l1-fila"><button class="ing-btn" id="v-casa">🏠 ' + esc(F('Casa')) + '</button><button class="ing-btn main" id="v-otra">▶ ' + esc(F('Otra vez')) + '</button></div>');
    var modo = S.pasos.some(function (p) { return p.tipo === 'hola'; }) ? 'leccion' : S.pasos[0].juego;
    $('#v-casa').onclick = function () { velo(''); casa(false); };
    $('#v-otra').onclick = function () { velo(''); if (modo === 'leccion') leccion(); else jugarSolo(modo); };
    if (vivo(tk)) ctx.log('fin', pct + '%', r.estrellas + '⭐', 'nivel', r.nivel);
  }

  /* ---------- supermercado ---------- */
  var NUMS = ['', 'One!', 'Two!', 'Three!', 'Four!', 'Five!', 'Six!', 'Seven!', 'Eight!', 'Nine!', 'Ten!'];
  var mayus = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
  function supermercado() {
    VZ.callar(); limpiarEscena(); chip(null); aviso(); banner(null); UI.fuegos.parar(); velo('');
    var tk = ++S.token, lista = TD.lista({ nivel: nivel(), az: ctx.az, rep: rep, monedas: pet.monedas });
    S.modo = 'super'; S.oirActual = null; S.tocarPip = null; S.paso = null; S.opciones = null; S.aura = null;
    S.lista = lista; S.compra = lista.map(function () { return 0; }); S.k = -1; S.res = lista.map(function () { return null; });
    SUP.mostrar(true); hoot.ponerEn(SUP.lugarProfe()); VZ.sfx('woosh'); pip.ponerEn(0, -0.2); var lp = SUP.lugarPip(); pip.escala(PET.etapa(pet).escala * SUP.escalaPip()); pip.irA(lp[0], lp[1]);
    pintarHUD();
    if (!lista.length) {
      banner({ icono: '🛒', en: 'No coins!', es: 'Necesitás ⭐: jugá con Miss Hoot para ganar' });
      charla([{ t: 'Oh no! No coins!' }, { t: "Let's learn and get some stars!" }]);
      $('#abajo').innerHTML = '<button class="ing-btn" id="b-salir">🏠 ' + esc(F('Casa')) + '</button><button class="ing-btn main" id="b-l"><span class="ic">🦉</span>' + esc(F('¡A aprender!')) + '</button>';
      $('#b-salir').onclick = function () { casa(false); }; $('#b-l').onclick = function () { casa(false); leccion(); };
      return;
    }
    ctx.log('súper', lista.map(function (x) { return x.n + ' ' + x.w.en; }).join(', '), 'total', TD.total(lista));
    // la góndola, con el precio de cada cosa
    var huecos = SUP.huecos();
    S.estante = TD.estante(lista, nivel(), ctx.az).map(function (w, i) {
      var f = O.ficha(M, w, 0.7), h = huecos[i]; f.position.copy(h); f.scale.setScalar(0.01); M.scene.add(f);
      var etq = O.etiqueta(M, TD.precio(w) + '⭐', { fondo: '#fff6cf', alto: 0.17 }); etq.position.set(h.x + 0.36, h.y + 0.14, h.z + 0.42); M.scene.add(etq);
      M.esperar(200 + i * 70, function () { VZ.sfx('pop'); M.tween(400, function (k) { f.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
      M.tocable(f, function () { tomar(f, tk); });
      return f;
    });
    S.opciones = S.estante.map(function (f) { return { w: f.userData.w, elegir: function () { tomar(f, tk); } }; });
    banner({ icono: '🛒', en: "Let's go shopping!" });
    charla([{ t: "Let's go shopping!" }], function () { if (vivo(tk)) pedir(0, tk); });
  }
  // La mascota pide la cosa i de la lista.
  function pedir(i, tk) {
    if (!vivo(tk)) return;
    if (i >= S.lista.length) return caja(tk);
    var it = S.lista[i];
    S.k = i; S.intento = 0; S.fase = 'responde'; S.t0 = Date.now(); S.repite = 0;
    S.estante.forEach(function (f) { f.userData.fuera = false; O.apagar(f, false); });
    S.paso = { tipo: 'juego', juego: 'super', w: it.w, n: it.n, opciones: S.estante.map(function (f) { return f.userData.w; }) };
    S.orden = 'I want ' + TD.pedido(it.w, it.n) + '!'; S.quienOrden = 'pip';
    var oir = function () { pipDice(S.orden); };
    banner({ icono: '🛒', en: S.orden, oir: oir }); S.oirActual = oir; pintarHUD();
    pip.saltar(0.3); oir();
  }
  function tomar(f, tk) {
    if (!vivo(tk) || S.modo !== 'super' || !S.paso) return;
    var w = f.userData.w, it = S.lista[S.k];
    if (S.fase === 'contando') { if (w === it.w) meter(f, tk); else { pip.no(); O.temblar(M, f); } return; }
    if ((S.fase !== 'responde' && S.fase !== 'muestra') || f.userData.fuera) return;
    var r = responder(w); if (r.ignorar) return;
    if (r.ok) { S.fase = 'contando'; if (S.aura) { S.aura.quitar(); S.aura = null; } meter(f, tk); return; }
    f.userData.fuera = true; O.temblar(M, f); O.apagar(f, true); pip.no();
    if (r.mostrar) { var c = S.estante.filter(function (x) { return x.userData.w === it.w; })[0]; S.aura = M.aura(c, 1.4); O.rebotar(M, c, 0.3); }
  }
  // Una más al carrito (vuela el dibujo); si son varias, la profe cuenta.
  function meter(f, tk) {
    var it = S.lista[S.k], w = it.w, c = ++S.compra[S.k], T = M.T;
    var s = new T.Sprite(new T.SpriteMaterial({ map: M.texEmoji(w.img), transparent: true })); s.scale.setScalar(0.45);
    var desde = f.userData.sprite.getWorldPosition(new T.Vector3()), hasta = SUP.carrito.proximo(); s.position.copy(desde); M.scene.add(s);
    VZ.sfx('woosh'); O.rebotar(M, f, 0.25); pip.mirarA(hasta);
    M.tween(550, function (k) { s.position.lerpVectors(desde, hasta, k); s.position.y += Math.sin(k * Math.PI) * 0.9; }, function () { SUP.carrito.meter(s); VZ.sfx('pop'); M.particulas('brillo', hasta, 2); }, 'entraSale');
    if (it.n > 1) { profe(NUMS[c]); chip(esc(TX(TD.numero(c))) + ' = ' + c, false, 1500); }
    pintarHUD();
    if (c < it.n) { aviso('👆', '¡Otra más!'); return; }
    S.fase = 'fin'; aviso();
    M.esperar(it.n > 1 ? 800 : 0, function () {
      if (!vivo(tk)) return;
      var dicho = mayus(TD.pedido(w, it.n)) + '!';
      charla([{ t: it.n > 1 ? dicho : BIEN[Math.floor(Math.random() * BIEN.length)] + ' ' + dicho }, { t: 'Thank you!', quien: 'pip' }],
        function () { if (vivo(tk)) M.esperar(300, function () { pedir(S.k + 1, tk); }); });
    });
  }
  // La caja: se paga tocando las monedas de a una, y la profe cuenta.
  function caja(tk) {
    var total = TD.total(S.lista), pagadas = 0, cc = SUP.lugarCarroCaja(), monedas = [];
    S.fase = 'pagar'; S.k = S.lista.length; S.paso = null; S.opciones = null; S.monedas = monedas; pintarHUD();
    S.estante.forEach(function (f) { M.quitarToque(f); });
    SUP.carrito.rodar(cc[0], cc[1]); SUP.caja.pantalla(total + ' ⭐');
    var dicho = "That's " + TD.numero(total) + (total === 1 ? ' coin!' : ' coins!'), oir = function () { profe(dicho); };
    banner({ icono: '💰', en: dicho, es: 'Pagá ' + total + ' ⭐: tocá las monedas', oir: oir }); S.oirActual = oir;
    var pos = SUP.bandeja(total);
    M.esperar(800, function () {
      if (!vivo(tk)) return;
      oir();
      pos.forEach(function (p, i) {
        var m = O.moneda(M, 1.3); m.position.copy(p); m.scale.setScalar(0.01); M.scene.add(m); monedas.push(m);
        M.esperar(i * 80, function () { VZ.sfx('moneda'); M.tween(350, function (k) { m.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
        M.tocable(m, function () { pagarUna(m); });
      });
      cuandoCalle(function () { if (vivo(tk) && !pagadas) aviso('👆', 'Tocá las monedas'); });
    });
    function pagarUna(m) {
      if (!vivo(tk) || m.userData.pagada) return;
      m.userData.pagada = true; M.quitarToque(m); pagadas++; aviso();
      var desde = m.position.clone(), hasta = SUP.caja.cajon();
      M.tween(380, function (k) { m.position.lerpVectors(desde, hasta, k); m.position.y += Math.sin(k * Math.PI) * 0.4; m.scale.setScalar(Math.max(0.01, 1 - 0.6 * k)); }, function () { M.limpiar([m]); }, 'entraSale');
      VZ.sfx('moneda'); profe(NUMS[pagadas]); chip('⭐ ' + esc(TX(TD.numero(pagadas))) + ' = ' + pagadas, false, 1500);
      var mon = $('#monedas'); if (mon) mon.lastChild.textContent = pet.monedas - pagadas;
      SUP.caja.pantalla((total - pagadas) + ' ⭐');
      if (pagadas === total) M.esperar(700, function () { if (vivo(tk)) cobrado(total, tk); });
    }
  }
  function cobrado(total, tk) {
    TD.pagar(pet, total); S.lista.forEach(function (it) { TD.guardar(pet, it.w.en, it.n); }); PET.sumar(pet, 'alegria', 5); guardar();
    ctx.log('compró', S.lista.map(function (x) { return x.n + ' ' + x.w.en; }).join(', '), '-' + total + '⭐');
    VZ.sfx('caja'); SUP.caja.pantalla('✔'); hoot.aplaudir(); pip.feliz(); M.particulas('estrella', SUP.caja.cajon().add(new M.T.Vector3(0, 0.5, 0)), 10);
    S.fase = 'fin'; banner({ icono: '🛍️', en: 'Thank you!' }); pintarHUD();
    charla([{ t: 'Thank you!' }, { t: 'Yay! Food!', quien: 'pip' }], function () {
      if (!vivo(tk)) return;
      UI.fuegos.iniciar(); banner(null);
      velo('<div class="grande">🛍️</div><h2>' + esc(F('¡Compraste!')) + '</h2><div class="ing-palabras">' + S.lista.map(function (it) {
        return '<span>' + dib(it.w) + ' ' + (it.n > 1 ? it.n + ' ' : '') + esc(TX(it.w.en)) + '</span>'; }).join('') + '</div>' +
        '<p>' + esc(F('Pagaste')) + ' ⭐ ' + total + '</p><div class="l1-fila"><button class="ing-btn" id="v-casa">🏠 ' + esc(F('Casa')) + '</button>' +
        '<button class="ing-btn main" id="v-comer">🧺 ' + esc(F('¡A comer!')) + '</button></div>');
      $('#v-casa').onclick = function () { velo(''); casa(false); S.recienCompro = true; pintarHUD(); };
      $('#v-comer').onclick = function () { velo(''); despensa(); };
    });
  }

  /* ---------- despensa: darle de comer lo comprado ---------- */
  function despensa() {
    VZ.callar(); velo(''); chip(null); aviso(); banner(null); UI.fuegos.parar();
    salirLugares();
    S.modo = 'despensa'; S.res = []; S.k = -1; S.dadas = 0; S.tocarPip = null;
    darComida();
  }
  function darComida() {
    var tk = ++S.token; limpiarEscena(); aviso(); S.oirActual = null; S.opciones = null;
    var d = TD.despensa(pet); pintarHUD();
    if (!d.length) {
      banner({ icono: '🧺', en: 'No food!', es: S.dadas ? 'Se terminó la comida' : 'No hay comida: ¡vamos al súper!' });
      charla(S.dadas ? [{ t: 'Yummy! Thank you!', quien: 'pip' }] : [{ t: 'No food!' }, { t: "Let's go shopping!" }]);
      return;
    }
    if (pet.panza >= 95) {
      banner({ icono: '😋', en: "I'm full!", es: nombre() + ' ya comió mucho' }); pip.feliz();
      pipDice("I'm full! Thank you!", function () { if (vivo(tk)) M.esperar(800, function () { if (vivo(tk)) casa(false); }); });
      return;
    }
    // Pide una de las que hay (si hay una sola, no cuenta como ejercicio).
    var hay = ctx.az.mezclar(d).slice(0, JG.cuantas(nivel())), w = ctx.az.elegir(hay).w;
    var p = S.paso = { tipo: 'juego', juego: 'comer', w: w, opciones: hay.map(function (x) { return x.w; }), sinRegistro: hay.length < 2 };
    juego(p, tk, { orden: 'I want ' + frase(w) + '!', quien: 'pip', icono: '🧺', fin: function () {
      TD.sacar(pet, w.en); S.dadas++; guardar(); pintarHUD();
      if (S.dadas >= 3 && TD.cuantas(pet)) { pipDice('Yummy! Thank you!', function () { if (vivo(tk)) casa(false); }); return; }
      darComida();
    } });
  }

  /* ---------- lugares de la casa: baño, dormitorio y patio ---------- */
  // Deja todo como en la casa: saca el súper y los lugares, la mascota a su lugar y la luz prendida.
  function salirLugares() {
    if (SUP.grupo.visible) { SUP.mostrar(false); hoot.volver(); }
    ['bano', 'dormitorio', 'patio'].forEach(function (k) { if (LG[k].grupo.visible) LG[k].mostrar(false); });
    if (S.futbol) { S.futbol.parar(); S.futbol = null; }
    if (S.zzz) { S.zzz(); S.zzz = null; }
    if (S.mirarPelota) { S.mirarPelota(); S.mirarPelota = null; }
    LG.dormitorio.levantar(pip); M.atenuar(1); pip.dormir(false); acercar(false, true);
    pip.ponerEn(0, -0.2); pip.escala(PET.etapa(pet).escala);
  }
  function entrar(modo, lugar) {
    VZ.callar(); velo(''); limpiarEscena(); chip(null); aviso(); banner(null); UI.fuegos.parar();
    salirLugares(); lugar.mostrar(true); VZ.sfx('woosh');
    S.modo = modo; S.fase = null; S.paso = null; S.opciones = null; S.oirActual = null; S.tocarPip = null; S.res = []; S.k = -1;
    var tk = ++S.token; pintarHUD(); return tk;
  }
  // Una palabra del tema (con repaso), distinta de la anterior.
  function palabraDe(tema, filtro, ult) {
    var claves = V.palabras({ temas: [tema], nivel: nivel() }).filter(filtro || function () { return true; }).map(function (w) { return w.en; });
    var sin = claves.filter(function (k) { return k !== ult; });
    return V.por(RP.elegir(rep, sin.length ? sin : claves, 1, ctx.az, { minRepaso: 2 })[0]);
  }

  // Baño: lavar 3 partes del cuerpo (en la bañera) y reventar burbujas contando.
  function bano() {
    var tk = entrar('bano', LG.bano); S.lavados = 0; S.ult = null;
    acercar(true);
    banner({ icono: '🛁', en: 'Bath time!' });
    charla([{ t: 'Bath time!' }, { t: 'Splash splash!', quien: 'pip' }], function () { if (vivo(tk)) lavar(); });
  }
  function lavar() {
    var tk = ++S.token;
    if (S.lavados >= 3) return burbujas();
    var w = palabraDe('cuerpo', function (x) { return x.parte !== 'feet' && x.parte !== 'tummy'; }, S.ult); S.ult = w.en;
    var p = S.paso = { tipo: 'juego', juego: 'tocar', w: w, opciones: JG.get('tocar').opciones(w, nivel(), ctx.az) };
    juego(p, tk, { orden: 'Wash ' + nombreVoz() + "'s " + w.en.toLowerCase() + '!', icono: '🧽', fin: function () { S.lavados++; lavar(); } });
  }
  var NUMW = function (n) { return mayus(TD.numero(n)); };
  function burbujas() {
    var tk = ++S.token, n = [0, 3, 5, 7][Math.min(3, nivel())], total = n + 3, rotas = 0, zb = LG.bano.zonaBurbujas(), T = M.T;
    S.paso = null; S.opciones = null; S.fase = 'burbujas'; S.burbujas = [];
    var dicho = 'Pop ' + TD.numero(n) + ' bubbles!', oir = function () { profe(dicho); };
    banner({ icono: '🫧', en: dicho, es: 'Reventá ' + n + ' burbujas', oir: oir }); S.oirActual = oir; oir();
    for (var i = 0; i < total; i++) (function (i) {
      M.esperar(300 + i * 220, function () {
        if (!vivo(tk)) return;
        var b = O.burbuja(M, 0.38 + Math.random() * 0.2), x0 = zb.x + (Math.random() * 2 - 1) * zb.ancho * 1.5, y0 = zb.y + 0.3 + Math.random() * 1.1, z0 = zb.z + 0.4 + Math.random() * 0.5, t = Math.random() * 6;
        b.position.set(x0, y0, z0); b.scale.multiplyScalar(0.01); var tam = b.scale.x * 100; M.scene.add(b); S.burbujas.push(b);
        M.tween(400, function (k) { b.scale.setScalar(Math.max(0.01, tam * k)); }, null, 'rebote'); VZ.sfx('burbuja');
        M.fx({ update: function (dt) { if (!b.parent || b.userData.rota) return false; t += dt; b.position.y = y0 + Math.sin(t * 1.3) * 0.12; b.position.x = x0 + Math.sin(t * 0.8) * 0.1; return true; } });
        M.tocable(b, function () { romper(b, true); });
      });
    })(i);
    M.esperar(300 + total * 220 + 300, function () { if (vivo(tk) && !rotas) aviso('👆', 'Tocá las burbujas'); });
    function romper(b, cuenta) {
      if (!vivo(tk) || b.userData.rota || (cuenta && rotas >= n)) return;
      b.userData.rota = true; M.quitarToque(b); VZ.sfx('burbuja');
      M.particulas('gota', b.position.clone(), 6, { color: '#d8f3ff', arriba: 1, fuerza: 1.2, tam: 0.1 });
      var s0 = b.scale.x; M.tween(160, function (k) { b.scale.setScalar(s0 * (1 + 0.5 * k)); b.material.opacity = 1 - k; }, function () { M.limpiar([b]); });
      if (!cuenta) return;
      rotas++; aviso(); profe(NUMS[rotas]); chip('🫧 ' + esc(TX(TD.numero(rotas))) + ' = ' + rotas, false, 1300);
      if (rotas === n) M.esperar(700, function () {
        if (!vivo(tk)) return;
        S.burbujas.forEach(function (x, j) { M.esperar(j * 60, function () { romper(x, false); }); });
        charla([{ t: NUMW(n) + ' bubbles! Great!' }, { t: 'So clean!', quien: 'pip' }], function () { if (vivo(tk)) limpio(tk); });
      });
    }
  }
  function limpio(tk) {
    pet.limpieza = 100; PET.sumar(pet, 'alegria', 4); guardar(); pintarHUD(); S.fase = 'fin';
    VZ.sfx('brillo'); M.particulas('brillo', pip.cabeza.getWorldPosition(new M.T.Vector3()), 6); M.particulas('estrella', pip.cabeza.getWorldPosition(new M.T.Vector3()).add(new M.T.Vector3(0, 0.5, 0.3)), 10);
    banner({ icono: '✨', en: 'Squeaky clean!', es: nombre() + ' quedó limpito' });
    pip.reir(function () { pip.feliz(function () { if (vivo(tk)) M.esperar(1200, function () { if (vivo(tk)) casa(false); }); }); });
  }

  // Dormitorio: ordenar juguetes (tema cosas), a la cama, apagar la luz y dormir hasta "Good morning!".
  function dormitorio() {
    var tk = entrar('dormir', LG.dormitorio); S.ordenados = 0; S.ult = null;
    banner({ icono: '🧸', en: 'Tidy up!', es: 'A ordenar los juguetes' });
    charla([{ t: 'Tidy up!' }, { t: 'Where are my toys?', quien: 'pip' }], function () { if (vivo(tk)) ordenar(); });
  }
  function ordenar() {
    var tk = ++S.token;
    if (S.ordenados >= (nivel() > 1 ? 3 : 2)) return aCama(tk);
    var w = palabraDe('cosas', null, S.ult); S.ult = w.en;
    var p = S.paso = { tipo: 'juego', juego: 'buscar', w: w, opciones: JG.get('buscar').opciones(w, nivel(), ctx.az) };
    juego(p, tk, { orden: 'Where is my ' + w.en.toLowerCase() + '?', quien: 'pip', icono: '🧸', fin: function () { S.ordenados++; ordenar(); } });
  }
  function aCama(tk) {
    S.paso = null; S.opciones = null; S.fase = 'cama'; chip(null);
    banner({ icono: '🛏️', en: 'Time for bed!' }); profe('Time for bed!');
    var c = LG.dormitorio.posCama();
    pip.irA(c.x, c.z, function () {
      if (!vivo(tk)) return;
      LG.dormitorio.acostar(pip); VZ.sfx('boing'); pip.mirar(0, 0.5);
      var dicho = 'Turn off the light!', oir = function () { profe(dicho); };
      S.fase = 'luz'; banner({ icono: '💡', en: dicho, es: 'Apagá la luz', oir: oir }); S.oirActual = oir;
      M.esperar(500, function () { if (vivo(tk)) oir(); });
      var lp = LG.dormitorio.lampara.getWorldPosition(new M.T.Vector3());
      S.mano = O.mano(M); S.mano.position.set(lp.x + 0.2, lp.y + 0.95, lp.z + 0.3); M.scene.add(S.mano);
      aviso('👆', 'Tocá la lámpara');
    });
  }
  LG.dormitorio.lampara && M.tocable(LG.dormitorio.lampara, function () { apagar(); });
  function apagar() {
    if (S.modo !== 'dormir' || S.fase !== 'luz') return;
    var tk = S.token; S.fase = 'duerme'; if (S.mano) S.mano.userData.quitar(); aviso();
    VZ.sfx('click'); LG.dormitorio.prender(false); M.atenuar(0.3, 900); pip.dormir(true);
    pet.energia = 100; PET.sumar(pet, 'alegria', 3); guardar(); pintarHUD();
    banner({ icono: '🌙', en: 'Good night, ' + nombreVoz() + '!' });
    charla([{ t: 'Good night, ' + nombreVoz() + '!', lento: true }, { t: 'Sweet dreams!', lento: true }]);
    var cada = 0; S.zzz = M.cuadro(function (dt) { cada += dt; if (cada > 1.3) { cada = 0; M.particulas('zzz', pip.cabeza.getWorldPosition(new M.T.Vector3()).add(new M.T.Vector3(0.2, 0.4, 0)), 1, { arriba: 0.6, fuerza: 0.3, vida: 2 }); } });
    M.esperar(2500, function () { if (vivo(tk) && S.fase === 'duerme') pintarHUD(); });
  }
  function despertar() {
    if (S.modo !== 'dormir' || S.fase !== 'duerme') return;
    var tk = S.token; S.fase = 'fin'; if (S.zzz) { S.zzz(); S.zzz = null; }
    M.atenuar(1, 700); LG.dormitorio.prender(true); pip.dormir(false); LG.dormitorio.levantar(pip);
    var c = LG.dormitorio.posCama(); pip.ponerEn(c.x, c.z); VZ.sfx('brillo'); pip.feliz(); pintarHUD();
    banner({ icono: '☀️', en: 'Good morning!' });
    charla([{ t: 'Good morning, ' + nombreVoz() + '!' }, { t: 'Good morning!', quien: 'pip' }], function () { if (vivo(tk)) M.esperar(600, function () { if (vivo(tk)) casa(false); }); });
  }

  // Patio: patear al arco (arrastrar desde la pelota hacia abajo, como una gomera).
  function patio() {
    var tk = entrar('patio', LG.patio); S.goles = 0; S.patadas = 0; pintarHUD();
    pip.ponerEn(M.vertical() ? 1.2 : 2.2, M.vertical() ? 0.4 : 0.5);
    banner({ icono: '⚽', en: "Let's play football!", es: 'Arrastrá desde la pelota hacia abajo y soltá' });
    charla([{ t: "Let's play football!" }, { t: 'Kick the ball!', quien: 'pip' }]);
    S.futbol = LG.patio.futbol({
      alPatear: function () { aviso(); banner(null); S.patadas++; PET.sumar(pet, 'energia', -1); PET.sumar(pet, 'limpieza', -1); },
      alGol: function () {
        S.goles++; VZ.sfx('gol'); hoot.aplaudir(); pip.feliz();
        M.particulas('estrella', new M.T.Vector3(0, 1, LG.patio.arco.z), 16); M.particulas('brillo', new M.T.Vector3(0, 0.8, LG.patio.arco.z), 5);
        var t = NUMW(S.goles); profe('Goal! ' + t + (S.goles === 1 ? ' goal!' : ' goals!'));
        chip('⚽ ' + esc(TX(TD.numero(S.goles))) + ' = ' + S.goles, false, 2500);
        PET.sumar(pet, 'alegria', 3); guardar(); pintarHUD();
        if (S.goles % 5 === 0) UI.fuegos.iniciar();
      },
      alTerminar: function (r) { if (!vivo(tk) || r === 'gol') return; pip.no(); profe(r === 'palo' ? 'Oh! So close!' : 'Try again!'); guardar(); pintarHUD(); },
      alTocar: function () { banner({ icono: '👇', en: 'Pull and kick!', es: 'Arrastrá desde la pelota hacia abajo y soltá' }); }
    });
    S.mirarPelota = M.cuadro(function () { if (S.futbol) pip.mirarA(S.futbol.pelota.position); });
  }

  /* ---------- debug ---------- */
  if (ctx.debug) {
    var fps = document.createElement('div'); fps.className = 'ing-fps'; document.body.appendChild(fps);
    setInterval(function () { fps.textContent = M.fps + ' fps · ' + S.modo + (S.paso && S.paso.w ? ' · ' + S.paso.w.en : '') + ' · nivel ' + nivel(); }, 500);
    window.__pip = { S: S, M: M, pip: pip, pet: pet, rep: rep, inicio: function () { $('#v-jugar').click(); },
      elegir: function (en) { var o = (S.opciones || []).filter(function (x) { return x.w.en === en; })[0]; if (o) o.elegir(); return !!o; },
      correcta: function () { return window.__pip.elegir(S.paso.w.en); },
      super: function () { supermercado(); }, despensa: function () { despensa(); }, TD: TD, LG: LG,
      bano: function () { bano(); }, dormir: function () { dormitorio(); }, patio: function () { patio(); }, apagar: function () { apagar(); }, despertar: function () { despertar(); },
      patear: function (k, x) { if (S.futbol) S.futbol.patear(k, x); }, burbujas: function () { return (S.burbujas || []).filter(function (b) { return !b.userData.rota; }); },
      pagar: function () { (S.monedas || []).forEach(function (m) { if (m.userData.tocar) m.userData.tocar(); }); },
      tocar: function (parte) { if (S.tocarPip) S.tocarPip(parte); }, juego: function (id) { jugarSolo(id); }, sentir: function (id) { pip.sentir(id); },
      incorrecta: function () { var o = (S.opciones || []).filter(function (x) { return x.w !== S.paso.w; })[0]; if (o) o.elegir(); return o && o.w.en; } };
  }
  inicio();
})();
