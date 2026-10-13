/* Panel de fracciones de 4to para "Ajustes de padres" (detrás del PIN). Versión 1.0.0 (2026-10-13).
   - Mapa de fracciones por tema: % al primer intento en los últimos 14 días, cantidad de ítems, tendencia contra los 14 anteriores
     y el último puntaje del Repaso.
   - Interruptor "Incluir ejercicios del módulo de la escuela" (mate.<perfil>.4to-fracciones.config).
   - Agrega los nombres de los errores de fracciones al panel de estadísticas existente (REF4_PANEL.ERRORES).
   Depende de REF4_EV y REF4_FR. window.REF4_PANEL_FR.render(contenedor, {perfiles, actividades}); mapa(...) es pura. */
(function (root) {
  'use strict';
  var EV = root.REF4_EV, FR = root.REF4_FR, DIA = 86400000;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var CONFIG_ACT = '4to-fracciones', REPASO = '4to-fracciones-repaso';
  var ORDEN = ['reparto', 'partes', 'entero', 'equivalencias', 'comparacion', 'mayor_que_uno', 'cuanto_falta', 'sumas_restas', 'problemas', 'medidas', 'estrategia'];

  // Nombres de los errores nuevos en el panel existente (solo se agregan; los que ya estaban no se tocan).
  if (root.REF4_PANEL && FR) Object.keys(FR.ERRORES).forEach(function (k) { if (!root.REF4_PANEL.ERRORES[k]) root.REF4_PANEL.ERRORES[k] = FR.ERRORES[k]; });

  /* mapa(listaDeEventos, ahora) → {tema: {n, ok, pct, nAnt, pctAnt, tendencia}} con los eventos de paso de fracciones.
     Cuenta el primer intento de cada paso; para "estrategia" ("¿Qué aprendiste?"), el evento marcado primero. */
  function mapa(eventos, ahora) {
    var m = {};
    eventos.forEach(function (e) {
      if (e.tipo !== 'paso' || !e.tema) return;
      var primero = e.paso === 'aprendiste' ? e.primero : e.intento === 1;
      if (!primero) return;
      var edad = ahora - e.ts, t = m[e.tema] || (m[e.tema] = { n: 0, ok: 0, nAnt: 0, okAnt: 0 });
      if (edad <= 14 * DIA) { t.n++; if (e.ok) t.ok++; } else if (edad <= 28 * DIA) { t.nAnt++; if (e.ok) t.okAnt++; }
    });
    Object.keys(m).forEach(function (k) {
      var t = m[k]; t.pct = t.n ? Math.round(100 * t.ok / t.n) : null; t.pctAnt = t.nAnt ? Math.round(100 * t.okAnt / t.nAnt) : null;
      t.tendencia = t.pct === null || t.pctAnt === null ? '—' : (t.pct - t.pctAnt >= 5 ? '↑' : (t.pctAnt - t.pct >= 5 ? '↓' : '='));
    });
    return m;
  }
  function leer(ls, perfil, act, clave, def) { try { var v = ls.getItem(EV.claveAlmacen(perfil, act, clave)); return v === null ? def : JSON.parse(v); } catch (e) { return def; } }

  function render(cont, cfg) {
    var ls = cfg.ls || root.localStorage, ahora = Date.now(), out = '';
    (cfg.perfiles || []).forEach(function (p) {
      var acts = cfg.actividades.filter(function (a) { return /^4to-fracciones-/.test(a.id) && (!a.perfiles || a.perfiles.indexOf(p.id) >= 0); });
      if (!acts.length) return;
      var eventos = []; acts.forEach(function (a) { eventos = eventos.concat(EV.leerDirecto(ls, p.id, a.id).eventos || []); });
      var m = mapa(eventos, ahora), ult = leer(ls, p.id, REPASO, 'ultimo', null), conf = leer(ls, p.id, CONFIG_ACT, 'config', { incluirModulo: false });
      out += '<div class="ref4-perfil"><h3>' + esc(p.avatar) + ' ' + esc(p.nombre) + ' · mapa de fracciones</h3>' +
        '<table class="fr4-mapa"><thead><tr><th>Tema</th><th>Bien al primer intento (14 días)</th><th>Ítems</th><th>Tendencia</th><th>Último repaso</th></tr></thead><tbody>' +
        ORDEN.map(function (t) {
          var x = m[t] || { n: 0, pct: null, tendencia: '—' }, r = ult && ult.porTema && ult.porTema[t];
          return '<tr><td>' + esc(FR.TEMAS[t] || t) + '</td><td>' + (x.pct === null ? '—' : x.pct + ' %') + '</td><td>' + x.n + '</td><td>' + x.tendencia + '</td><td>' + (r ? r.ok + ' de ' + r.n : '—') + '</td></tr>';
        }).join('') + '</tbody></table>' +
        (ult ? '<p><small>Último repaso: ' + esc(new Date(ult.fecha).toLocaleDateString('es-AR')) + ', ' + ult.pct + ' % bien.</small></p>' : '<p><small>Todavía no hizo el repaso.</small></p>') +
        '<label class="fr4-switch"><input type="checkbox" data-modulo="' + esc(p.id) + '"' + (conf.incluirModulo ? ' checked' : '') + '> Incluir ejercicios del módulo de la escuela</label>' +
        '<p><small>Si está prendido, de vez en cuando (15 %, uno por ronda como máximo) aparece un ejercicio con los mismos números que el módulo. Por defecto está apagado para que la app no le resuelva la tarea en papel.</small></p></div>';
    });
    cont.innerHTML = out || '<p class="sub">No hay actividades de fracciones para mostrar.</p>';
    cont.onchange = function (e) {
      var c = e.target.closest('[data-modulo]'); if (!c) return;
      var perfil = c.dataset.modulo, conf = leer(ls, perfil, CONFIG_ACT, 'config', { incluirModulo: false });
      conf.incluirModulo = c.checked;
      try { ls.setItem(EV.claveAlmacen(perfil, CONFIG_ACT, 'config'), JSON.stringify(conf)); } catch (err) { /* sin espacio */ }
    };
  }

  var api = { VERSION: '1.0.0', render: render, mapa: mapa };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_PANEL_FR = api; }
})(typeof window !== 'undefined' ? window : this);
