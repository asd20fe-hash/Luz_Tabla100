/* Detective de problemas: instancias, validadores y pistas (lógica pura, sin DOM).
   Patrón UMD sin módulos: window.REF4_DETECTIVE. */
(function (root) {
  'use strict';
  var PR = (typeof module !== 'undefined' && module.exports) ? require('./problemas.js') : root.REF4_PROBLEMAS;
  var miles = PR.miles, pesos = PR.pesos;

  var CATS_NIVEL = { 1: [1, 2, 3], 2: [4, 5, 6, 7, 8], 3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] };
  var RONDA = { 1: 3, 2: 3, 3: 3, 4: 4 };
  var TRAMPAS = { 9: 1, 10: 1, 11: 1, 7: 1 };
  var OPS = ['+', '−', '×', ':'];

  function valorDe(inst, ref, vals) {
    if (ref.charAt(0) === 's' && /^s\d$/.test(ref)) return vals[parseInt(ref.slice(1), 10) - 1];
    return inst.datos[ref].v;
  }
  /* Evalúa un plan: {vals:[resultado de cada paso], restos:[resto de la división o 0]} */
  function evaluar(inst, plan) {
    var vals = [], restos = [];
    plan.forEach(function (st) {
      var a = st.args.map(function (r) { return valorDe(inst, r, vals); }), v, r = 0;
      if (st.op === '+') v = a.reduce(function (x, y) { return x + y; }, 0);
      else if (st.op === '×') v = a.reduce(function (x, y) { return x * y; }, 1);
      else if (st.op === '−') v = a[0] - a[1];
      else { v = Math.floor(a[0] / a[1]); r = a[0] - v * a[1]; }
      vals.push(v); restos.push(r);
    });
    return { vals: vals, restos: restos };
  }

  /* Forma canónica de un plan: no depende del orden de los pasos independientes ni de la conmutatividad de + y ×. */
  function canon(plan) {
    var c = [];
    plan.forEach(function (st, i) {
      var args = st.args.map(function (r) { return /^s\d$/.test(r) ? c[parseInt(r.slice(1), 10) - 1] : r; });
      if (st.op === '+' || st.op === '×') args = args.slice().sort();
      c.push(st.op + '(' + args.join(',') + ')');
    });
    return c.length ? c[c.length - 1] : '';
  }
  function opsDe(plan) { return plan.map(function (s) { return s.op; }).sort().join(''); }
  function planCompleto(plan) {
    return plan.length > 0 && plan.every(function (s) {
      return OPS.indexOf(s.op) >= 0 && s.args.length >= 2 && s.args.every(function (a) { return !!a; });
    });
  }

  /* instanciar(plantilla, az) → problema listo para jugar */
  function instanciar(tpl, az) {
    var g = tpl.gen(az);
    g.id = tpl.id; g.cat = tpl.cat; g.trampa = tpl.trampa;
    var ev = evaluar(g, g.planes[0]);
    g.vals = ev.vals; g.restos = ev.restos; g.resultado = ev.vals[ev.vals.length - 1];
    if (g.cat === 8) g.resultado = Math.abs(g.resultado);   // ¿alcanza?: se pide cuánto sobra o falta
    g.final = g.fin(ev.vals);
    return g;
  }

  /* Elige una plantilla para el nivel. En el nivel 3 el 60 % lleva trampa. */
  function generar(nivel, az, usadas) {
    var cats = CATS_NIVEL[nivel] || CATS_NIVEL[1];
    var todas = PR.plantillas.filter(function (t) { return cats.indexOf(t.cat) >= 0; });
    var cand = todas.filter(function (t) { return !(usadas && usadas[t.id]); });
    if (!cand.length) cand = todas;
    if (nivel === 3) {
      var conT = cand.filter(function (t) { return TRAMPAS[t.cat]; }), sinT = cand.filter(function (t) { return !TRAMPAS[t.cat]; });
      if (conT.length && sinT.length) cand = az.prob(0.6) ? conT : sinT;
    }
    var t = az.elegir(cand);
    if (usadas) usadas[t.id] = true;
    return instanciar(t, az);
  }

  /* ---------- texto ---------- */
  function textoPlano(inst) {
    function ps(a) { return a.map(function (p) { return typeof p === 'string' ? p : inst.datos[p.k].t; }).join(''); }
    return ps(inst.partes) + ps(inst.pregunta);
  }
  function palabras(inst) { return textoPlano(inst).split(/\s+/).filter(Boolean).length; }

  /* ---------- pasos ---------- */
  function opcionesPregunta(inst, az) {
    return az.mezclar([{ t: inst.op.ok, ok: true, cual: 'ok' }, { t: inst.op.paso, ok: false, cual: 'paso' }, { t: inst.op.clave, ok: false, cual: 'clave' }]);
  }
  function validarPregunta(inst, opcion) {
    if (opcion.ok) return { ok: true, codigo: null, pista: null };
    if (opcion.cual === 'clave' && inst.palabra)
      return { ok: false, codigo: 'PREGUNTA', pista: "Dice '" + inst.palabra + "', pero preguntan cuántos había ANTES. ¿Antes había más o menos que ahora?" };
    return { ok: false, codigo: 'PREGUNTA', pista: 'Leé la última oración otra vez. ¿Qué quieren saber?' };
  }
  function validarDatos(inst, marcados) {
    var keys = Object.keys(inst.datos), falta = keys.filter(function (k) { return inst.datos[k].nec && marcados.indexOf(k) < 0; });
    var demas = marcados.filter(function (k) { return !inst.datos[k].nec; });
    if (falta.length) {
      var imp = falta.filter(function (k) { return inst.datos[k].imp; })[0];
      if (imp) return { ok: false, codigo: 'DATOS_FALTAN', pista: "'" + inst.datos[imp].expr + "' también es un dato. ¿Cuántos " + inst.datos[imp].unidadImp + ' son?' };
      return { ok: false, codigo: 'DATOS_FALTAN', pista: 'Falta marcar un dato que necesitás. Releé la pregunta: ¿qué necesitás para contestarla?' };
    }
    if (demas.length) return { ok: false, codigo: 'DATOS_DE_MAS', pista: '¿Para qué usarías ' + inst.datos[demas[0]].t + '? Si no lo necesitás, dejalo.' };
    return { ok: true, codigo: null, pista: null };
  }
  function validarPlan(inst, plan) {
    if (!planCompleto(plan)) return { ok: false, codigo: 'PLAN_INCOMPLETO', pista: 'Completá todos los casilleros del plan.' };
    var c = canon(plan);
    if (inst.planes.some(function (p) { return canon(p) === c && p.length === plan.length; })) return { ok: true, codigo: null, pista: null };
    var ref = inst.planes.filter(function (p) { return p.length === plan.length; })[0] || inst.planes[0];
    if (plan.length < ref.length)
      return { ok: false, codigo: 'PLAN_INCOMPLETO', pista: inst.trampa === 'ultimo_paso' ? 'Ya sabés cuánto sale cada parte. ¿La pregunta pide cada parte o el total?' : 'Falta un paso: ¿ya llegaste a lo que pide la pregunta?' };
    if (opsDe(plan) === opsDe(ref)) return { ok: false, codigo: 'PLAN_ORDEN', pista: 'Las operaciones están bien, pero el orden cambia el resultado. ¿Qué va primero?' };
    return { ok: false, codigo: 'PLAN_OPERACION', pista: 'Pensá: ¿se junta, se saca, se reparte o se repite? Probá con otra operación.' };
  }
  function validarCalculo(inst, valor) {
    if (valor === inst.resultado) return { ok: true, codigo: null, pista: null };
    return { ok: false, codigo: 'OTRO', pista: 'Revisá la cuenta del plan. Podés usar la calculadora.' };
  }

  var RESTO_OPC = [{ id: 'sobran', t: 'Lo dejo, sobran' }, { id: 'uno_mas', t: 'Necesito uno más' }, { id: 'falta', t: 'Me fijo cuánto falta para completar otro' }, { id: 'seguir', t: 'Lo sigo repartiendo' }];
  function opcionesResto(az) { return az.mezclar(RESTO_OPC); }
  function validarResto(inst, id) {
    var r = inst.resto;
    if (id === r.tipo) return { ok: true, codigo: null, pista: null };
    var pistas = { uno_mas: 'Si quedan ' + r.r + ' sin lugar, ¿se quedan en casa? Hace falta una más.',
                   sobran: 'La pregunta pide lo que sobra: ¿qué número es?',
                   falta: 'Si ya hay ' + r.r + ' en el lugar, ¿cuántos faltan para llenarlo? Pensá ' + r.k + ' − ' + r.r + '.' };
    return { ok: false, codigo: 'RESTO_INTERPRETACION', pista: pistas[r.tipo] };
  }

  /* Opciones para la respuesta final (niveles 1 a 3). */
  function opcionesRespuesta(inst, az) {
    var f = inst.final, un = f.unidad, mal = inst.unidadMal || [], op = [];
    function txt(n, u) { return u === 'pesos' ? pesos(n) : miles(n) + ' ' + u; }
    if (f.frase) {
      op.push({ t: f.frase, ok: true });
      f.malas.forEach(function (m, i) { op.push({ t: m, ok: false, codigo: i === 0 ? 'OTRO' : 'PLAN_INCOMPLETO' }); });
      op.push({ t: f.frase.replace(/\$\d[\d.]*/, pesos(f.num)) + ' ' + mal[0], ok: false, codigo: 'UNIDAD' });
      return az.mezclar(op);
    }
    op.push({ t: txt(f.num, un), ok: true });
    op.push({ t: miles(f.num) + ' ' + mal[0], ok: false, codigo: 'UNIDAD' });
    var inter = inst.vals[0] !== f.num ? inst.vals[0] : f.num + 1;
    op.push({ t: txt(inter, un), ok: false, codigo: inst.vals.length > 1 || inst.resto ? 'PLAN_INCOMPLETO' : 'OTRO' });
    var otro = f.num + (f.num > 20 ? az.elegir([-10, 10, -1, 1]) : 2);
    if (otro === inter || otro === f.num) otro = f.num + 3;
    op.push({ t: txt(otro, un), ok: false, codigo: 'OTRO' });
    return az.mezclar(op);
  }
  function pistaRespuesta(inst, op) {
    if (op.codigo === 'UNIDAD') return '¿' + miles(inst.final.num) + ' qué? ¿Pesos, chicos, bolsitas?';
    if (op.codigo === 'PLAN_INCOMPLETO') return 'Ese número es un paso del camino. Releé la pregunta: ¿es eso lo que piden?';
    return 'Revisá la cuenta y volvé a leer lo que preguntan.';
  }
  // Nivel 4: número + unidad.
  function validarRespuestaAbierta(inst, num, unidad) {
    if (num !== inst.final.num) return { ok: false, codigo: 'OTRO', pista: 'Revisá el cálculo y lo que preguntan.' };
    if (unidad !== inst.final.unidad) return { ok: false, codigo: 'UNIDAD', pista: '¿' + miles(num) + ' qué? ¿Pesos, chicos, bolsitas?' };
    return { ok: true, codigo: null, pista: null };
  }
  function unidadesAbiertas(inst, az) {
    var u = [inst.final.unidad].concat((inst.unidadMal || []).slice(0, 2));
    return az.mezclar(u);
  }

  var api = { CATS_NIVEL: CATS_NIVEL, RONDA: RONDA, evaluar: evaluar, canon: canon, instanciar: instanciar, generar: generar, textoPlano: textoPlano, palabras: palabras,
              opcionesPregunta: opcionesPregunta, validarPregunta: validarPregunta, validarDatos: validarDatos, validarPlan: validarPlan, validarCalculo: validarCalculo,
              opcionesResto: opcionesResto, validarResto: validarResto, opcionesRespuesta: opcionesRespuesta, pistaRespuesta: pistaRespuesta,
              validarRespuestaAbierta: validarRespuestaAbierta, unidadesAbiertas: unidadesAbiertas, planCompleto: planCompleto, OPS: OPS };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_DETECTIVE = api; }
})(typeof window !== 'undefined' ? window : this);
