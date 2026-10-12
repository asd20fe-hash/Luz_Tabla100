/* Registro de eventos, agregados y estadísticas del refuerzo de 4to.
   Parte pura (plegar, resumir, ranking, ajustar nivel) + registro con almacenamiento.
   El almacenamiento es cualquier objeto {get(k,def), set(k,v)} (en la app: MATE.store(act)). */
(function (root) {
  'use strict';

  var MAX_EVENTOS = 3000;
  var DIA = 86400000;

  function agregadosVacios() { return { hechos: {}, errores: {}, dias: {}, compactados: 0 }; }

  function claveDia(ts) {
    var d = new Date(ts), m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  }
  function mediana(arr) {
    if (!arr.length) return 0;
    var a = arr.slice().sort(function (x, y) { return x - y; }), m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  // Suma un evento a los agregados (modifica ag).
  function plegar(ag, ev) {
    var dia = ag.dias[claveDia(ev.ts)] || (ag.dias[claveDia(ev.ts)] = { rondas: 0, ms: 0, pasos1: 0, ok1: 0, inact: 0 });
    if (ev.tipo === 'ronda_fin') { dia.rondas++; dia.ms += ev.durMs || 0; }
    else if (ev.tipo === 'inactividad') dia.inact++;
    else if (ev.tipo === 'paso') {
      if (ev.intento === 1) { dia.pasos1++; if (ev.ok) dia.ok1++; }
      if (ev.error) {
        var e = ag.errores[ev.error] || (ag.errores[ev.error] = { n: 0, ejemplo: null });
        e.n++; e.ejemplo = { item: ev.item, paso: ev.paso, esperado: ev.esperado, respuesta: ev.respuesta };
      }
      var h = ev.item && ev.item.hecho;
      if (h) {
        var x = ag.hechos[h] || (ag.hechos[h] = { n: 0, ok: 0, ms: [], ultimoError: null });
        x.n++; if (ev.ok) x.ok++; else x.ultimoError = ev.error || 'OTRO';
        if (ev.ms) { x.ms.push(ev.ms); if (x.ms.length > 10) x.ms.shift(); }
      }
    }
    return ag;
  }

  // Agregados completos = los guardados (eventos viejos compactados) + los eventos que siguen en la lista.
  function combinar(eventos, agregados) {
    var ag = JSON.parse(JSON.stringify(agregados || agregadosVacios()));
    (eventos || []).forEach(function (e) { plegar(ag, e); });
    return ag;
  }

  /* resumen para el panel: nivel aparte; rondas y minutos de 7 y 30 días, % al primer intento,
     5 errores más frecuentes y desconexiones por ronda. */
  function resumir(eventos, agregados, ahora) {
    var ag = combinar(eventos, agregados), r = { rondas7: 0, rondas30: 0, min7: 0, min30: 0, pasos1: 0, ok1: 0, inact: 0, rondas: 0 };
    Object.keys(ag.dias).forEach(function (k) {
      var d = ag.dias[k], edad = (ahora - new Date(k + 'T12:00:00').getTime()) / DIA;
      if (edad <= 30) { r.rondas30 += d.rondas; r.min30 += d.ms / 60000; }
      if (edad <= 7) { r.rondas7 += d.rondas; r.min7 += d.ms / 60000; }
      r.pasos1 += d.pasos1; r.ok1 += d.ok1; r.inact += d.inact; r.rondas += d.rondas;
    });
    r.pct1 = r.pasos1 ? Math.round(100 * r.ok1 / r.pasos1) : null;
    r.desconexionesPorRonda = r.rondas ? Math.round(10 * r.inact / r.rondas) / 10 : 0;
    r.errores = Object.keys(ag.errores).map(function (c) { return { codigo: c, n: ag.errores[c].n, ejemplo: ag.errores[c].ejemplo }; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
    r.min7 = Math.round(r.min7 * 10) / 10; r.min30 = Math.round(r.min30 * 10) / 10;
    return r;
  }

  /* Hechos (d×q) más errados y más lentos (suma varias actividades). */
  function rankingHechos(listaAgregados) {
    var tot = {};
    listaAgregados.forEach(function (ag) {
      Object.keys(ag.hechos).forEach(function (h) {
        var x = ag.hechos[h], t = tot[h] || (tot[h] = { n: 0, ok: 0, ms: [] });
        t.n += x.n; t.ok += x.ok; t.ms = t.ms.concat(x.ms);
      });
    });
    var lista = Object.keys(tot).map(function (h) {
      return { hecho: h, n: tot[h].n, errores: tot[h].n - tot[h].ok, tasa: (tot[h].n - tot[h].ok) / tot[h].n, ms: mediana(tot[h].ms) };
    });
    return {
      errados: lista.filter(function (x) { return x.errores > 0 && x.n >= 2; }).sort(function (a, b) { return b.tasa - a.tasa || b.n - a.n; }).slice(0, 8),
      lentos: lista.filter(function (x) { return x.ms > 0 && x.n >= 2; }).sort(function (a, b) { return b.ms - a.ms; }).slice(0, 8)
    };
  }

  /* Peso de cada hecho para los generadores: doble si tuvo errores en los últimos 14 días o es lento (> 5 s).
     Lee los eventos recientes; devuelve {"7x8": 2, ...} (los demás pesan 1). */
  function pesosHechos(eventos, ahora) {
    var w = {};
    (eventos || []).forEach(function (e) {
      if (e.tipo !== 'paso' || !e.item || !e.item.hecho || ahora - e.ts > 14 * DIA) return;
      if (!e.ok || e.ms > 5000) w[e.item.hecho] = 2;
    });
    return w;
  }

  function estrellas(pct) { return pct >= 85 ? 3 : (pct >= 60 ? 2 : 1); }

  /* Progresión: sube con 2 rondas seguidas ≥ 80 % y sin errores de control; baja con 2 seguidas < 50 %.
     est = {nivel, buenas, malas}; devuelve {est, cambio:-1|0|1}. */
  function ajustarNivel(est, pct, conErrorControl, nivelMax) {
    var e = { nivel: est.nivel || 1, buenas: est.buenas || 0, malas: est.malas || 0, rondas: (est.rondas || 0) + 1 };
    var cambio = 0;
    if (pct >= 80 && !conErrorControl) { e.buenas++; e.malas = 0; }
    else if (pct < 50) { e.malas++; e.buenas = 0; }
    else { e.buenas = 0; e.malas = 0; }
    if (e.buenas >= 2 && e.nivel < nivelMax) { e.nivel++; e.buenas = 0; cambio = 1; }
    else if (e.malas >= 2 && e.nivel > 1) { e.nivel--; e.malas = 0; cambio = -1; }
    else if (e.buenas >= 2) e.buenas = 0;
    return { est: e, cambio: cambio };
  }

  /* ---------- registro con almacenamiento ---------- */
  function crearRegistro(cfg) {
    var store = cfg.store, act = cfg.act, version = cfg.version, perfil = cfg.perfil || null;
    var sesion = cfg.sesion || ('s' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36));
    var eventos = store.get('eventos', []), ag = store.get('agregados', agregadosVacios()), est = store.get('estado', null) || { nivel: 1, buenas: 0, malas: 0, rondas: 0 };
    if (!Array.isArray(eventos)) eventos = [];
    var ctx = { ronda: 0, nivel: est.nivel }, timer = null, ultimos = [];
    var ahoraFn = cfg.ahora || function () { return Date.now(); };

    function compactar(cuantos) {
      var viejos = eventos.splice(0, cuantos);
      viejos.forEach(function (e) { plegar(ag, e); });
      ag.compactados += viejos.length;
    }
    function escribir() {
      var intento = 0;
      for (;;) {
        try {
          store.set('eventos', eventos); store.set('agregados', ag); store.set('estado', est);
          return true;
        } catch (e) { /* almacenamiento lleno */ }
        if (++intento > 3 || !eventos.length) return false;
        compactar(Math.ceil(eventos.length / 2));
      }
    }
    function flush() { if (timer) { clearTimeout(timer); timer = null; } return escribir(); }
    function agendar() { if (!timer && typeof setTimeout === 'function') timer = setTimeout(function () { timer = null; escribir(); }, 1000); }

    function evento(obj) {
      var e = { v: version, act: act, perfil: perfil, ts: ahoraFn(), sesion: sesion, ronda: ctx.ronda, nivel: ctx.nivel };
      for (var k in obj) e[k] = obj[k];
      eventos.push(e);
      ultimos.push(e); if (ultimos.length > 8) ultimos.shift();
      if (eventos.length > MAX_EVENTOS) compactar(eventos.length - Math.floor(MAX_EVENTOS * 0.8));
      agendar();
      if (typeof console !== 'undefined' && cfg.log) cfg.log(e);
      return e;
    }

    return {
      sesion: sesion, estado: function () { return est; }, ultimos: function () { return ultimos; },
      eventos: function () { return eventos; }, agregados: function () { return ag; },
      ctx: ctx, evento: evento, flush: flush,
      iniciarRonda: function () { ctx.ronda = (est.rondas || 0) + 1; ctx.nivel = est.nivel; evento({ tipo: 'ronda_inicio' }); },
      // Cierra la ronda: registra, ajusta el nivel y guarda. Devuelve {estrellas, cambio, nivel}.
      cerrarRonda: function (pct, durMs, conErrorControl, nivelMax) {
        var est2 = estrellas(pct);
        evento({ tipo: 'ronda_fin', durMs: durMs, pct: pct, estrellas: est2 });
        var r = ajustarNivel(est, pct, conErrorControl, nivelMax);
        var antes = est.nivel; est = r.est;
        if (r.cambio) evento({ tipo: 'nivel_cambio', de: antes, a: est.nivel });
        ctx.nivel = est.nivel;
        flush();
        return { estrellas: est2, cambio: r.cambio, nivel: est.nivel };
      }
    };
  }

  // Lectura directa para el panel de configuración (esquema mate.<perfil>.<act>.<clave>).
  function claveAlmacen(perfil, act, clave) { return 'mate.' + perfil + '.' + act + '.' + clave; }
  function leerDirecto(ls, perfil, act) {
    function g(c, d) { try { var v = ls.getItem(claveAlmacen(perfil, act, c)); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
    return { eventos: g('eventos', []), agregados: g('agregados', agregadosVacios()), estado: g('estado', { nivel: 1, buenas: 0, malas: 0, rondas: 0 }) };
  }

  var api = {
    MAX_EVENTOS: MAX_EVENTOS, agregadosVacios: agregadosVacios, plegar: plegar, combinar: combinar, resumir: resumir,
    rankingHechos: rankingHechos, pesosHechos: pesosHechos, estrellas: estrellas, ajustarNivel: ajustarNivel,
    crearRegistro: crearRegistro, claveAlmacen: claveAlmacen, leerDirecto: leerDirecto, claveDia: claveDia, mediana: mediana
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_EV = api; }
})(typeof window !== 'undefined' ? window : this);
