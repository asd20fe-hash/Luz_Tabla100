/* Matemática — núcleo compartido. Único global: MATE. Script clásico (sin módulos). */
(function(){
'use strict';
const VERSION='2.0';
const MATE=window.MATE=window.MATE||{};
MATE.version=VERSION;
MATE.perfiles=MATE.perfiles||[];
MATE.actividades=MATE.actividades||[];

/* ==== LOG Y VERSIÓN ==== */
MATE.log=(tag,...a)=>console.log('[Mate v'+VERSION+']['+tag+']',...a);
MATE.ver=el=>{ if(el) el.textContent='v'+VERSION; };

/* ==== RUTAS ==== */
// Raíz del proyecto: dos niveles arriba de core/core.js
const me=document.currentScript;
const RAIZ=me&&me.src?new URL('../',me.src).href:location.href;
MATE.raiz=RAIZ;

/* ==== GUARDADO ==== */
const ls={
  get(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:JSON.parse(v); }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
MATE.global={ get:(k,d)=>ls.get('mate.global.'+k,d), set:(k,v)=>ls.set('mate.global.'+k,v) };

/* ==== URL (perfil y tema viajan también por ?p=&t=) ==== */
const qs=new URLSearchParams(location.search);

/* ==== TEMA ==== */
const root=document.documentElement;
MATE.tema={
  get(){ return root.dataset.theme||null; },
  set(t){
    if(t==='dark'||t==='light'){ root.dataset.theme=t; MATE.global.set('theme',t); }
    else { delete root.dataset.theme; ls.del('mate.global.theme'); }
    MATE.log('tema',t);
  },
  oscuro(){ return root.dataset.theme?root.dataset.theme==='dark':!!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches); },
  alternar(){ const t=MATE.tema.oscuro()?'light':'dark'; MATE.tema.set(t); return t; }
};
{ const t=qs.get('t')||MATE.global.get('theme',null); if(t==='dark'||t==='light'){ root.dataset.theme=t; if(qs.get('t')) MATE.global.set('theme',t); } }

/* ==== PERFIL ==== */
let perfilId=qs.get('p')||MATE.global.get('perfil',null);
MATE.perfil=()=>MATE.perfiles.find(p=>p.id===perfilId)||null;
MATE.setPerfil=id=>{ perfilId=id||null; if(id) MATE.global.set('perfil',id); else ls.del('mate.global.perfil'); MATE.log('perfil',id); };

/* ==== GUARDADO POR ACTIVIDAD ==== */
// mate.<perfil>.<actividad>.<clave>; sin perfil activo no guarda nada
MATE.store=act=>{
  const k=c=>'mate.'+perfilId+'.'+act+'.'+c;
  return {
    get:(c,d)=>perfilId?ls.get(k(c),d):d,
    set:(c,v)=>{ if(perfilId) ls.set(k(c),v); }
  };
};

/* ==== NAVEGACIÓN ==== */
const query=()=>{ const p=new URLSearchParams(); if(perfilId) p.set('p',perfilId); const t=MATE.tema.get(); if(t) p.set('t',t); const s=p.toString(); return s?'?'+s:''; };
MATE.irMenu=()=>{ location.href=RAIZ+'index.html'+query(); };
MATE.abrir=act=>{ const a=typeof act==='string'?MATE.actividades.find(x=>x.id===act):act; if(!a) return MATE.log('abrir','actividad inexistente',act); location.href=RAIZ+a.ruta+query(); };

/* ==== PIN (candado para chicos, no seguridad real) ==== */
const hash=s=>{ let h=5381; for(const c of String(s)) h=((h*33)^c.charCodeAt(0))>>>0; return h.toString(36); };
MATE.pin={
  check(p){ const g=MATE.global.get('pin',null); return hash(p)===(g||hash('1234')); },
  set(p){ MATE.global.set('pin',hash(p)); MATE.log('pin','actualizado'); }
};

MATE.log('core','listo');
})();
