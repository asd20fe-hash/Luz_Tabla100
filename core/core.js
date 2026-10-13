/* Matemática — núcleo compartido. Único global: MATE. Script clásico (sin módulos). */
(function(){
'use strict';
const VERSION='2.2';
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

/* ==== FONDO (global para todos los perfiles y actividades) ==== */
// mate.global.fondo; viaja también por ?f= como el tema. "aurora" es el de base (sin data-bg).
const FONDOS=[
  {id:'aurora',nombre:'Aurora',muestra:'linear-gradient(135deg,#ff8cc6,#a78bfa,#5ee0c4)'},
  {id:'oceano',nombre:'Océano',muestra:'linear-gradient(135deg,#38bdf8,#2563eb,#2dd4bf)'},
  {id:'bosque',nombre:'Bosque',muestra:'linear-gradient(135deg,#86efac,#16a34a,#facc15)'},
  {id:'atardecer',nombre:'Atardecer',muestra:'linear-gradient(135deg,#fdba74,#fb7185,#c084fc)'},
  {id:'espacio',nombre:'Espacio',muestra:'radial-gradient(circle at 30% 30%,#fff 0 8%,transparent 10%),linear-gradient(135deg,#1e1b4b,#4c1d95)'}
];
const fondoOk=f=>FONDOS.some(x=>x.id===f);
let fondo='aurora';
const pintaFondo=()=>{ if(fondo==='aurora') delete root.dataset.bg; else root.dataset.bg=fondo; };
const montaFondo=()=>{
  if(document.getElementById('mate-fondo')) return;
  const d=document.createElement('div'); d.id='mate-fondo'; d.setAttribute('aria-hidden','true');
  d.innerHTML='<div class="stars"></div><div class="stars s2"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="blob b4"></div><div class="blob b5"></div>';
  document.body.insertBefore(d,document.body.firstChild);
};
MATE.fondo={
  lista:FONDOS,
  get:()=>fondo,
  set(f){ if(!fondoOk(f)) f='aurora'; fondo=f; pintaFondo(); MATE.global.set('fondo',f); MATE.log('fondo',f); },
  // muestra un menú flotante junto al botón para elegir el fondo
  menu(btn){
    const viejo=document.getElementById('mate-fondos'); if(viejo){ viejo.remove(); return; }
    const m=document.createElement('div'); m.id='mate-fondos'; m.setAttribute('role','menu');
    m.innerHTML='<b>Fondo</b>'+FONDOS.map(x=>'<button role="menuitemradio" data-f="'+x.id+'" class="'+(x.id===fondo?'on':'')+'" aria-checked="'+(x.id===fondo)+'"><i class="mate-swatch" style="background:'+x.muestra+'"></i>'+x.nombre+'</button>').join('');
    document.body.appendChild(m);
    const r=btn.getBoundingClientRect(), w=m.offsetWidth;
    m.style.top=Math.round(r.bottom+8)+'px'; m.style.left=Math.round(Math.max(8,Math.min(innerWidth-w-8,r.right-w)))+'px';
    const cerrar=()=>{ m.remove(); document.removeEventListener('pointerdown',fuera,true); document.removeEventListener('keydown',tecla); };
    const fuera=e=>{ if(!m.contains(e.target)&&!btn.contains(e.target)) cerrar(); };
    const tecla=e=>{ if(e.key==='Escape'){ cerrar(); btn.focus(); } };
    m.onclick=e=>{ const b=e.target.closest('[data-f]'); if(!b) return; MATE.fondo.set(b.dataset.f); cerrar(); };
    document.addEventListener('pointerdown',fuera,true); document.addEventListener('keydown',tecla);
    const on=m.querySelector('.on'); if(on) on.focus();
  }
};
{ const f=qs.get('f')||MATE.global.get('fondo',null); if(fondoOk(f)){ fondo=f; if(qs.get('f')) MATE.global.set('fondo',f); } pintaFondo(); }
if(document.body) montaFondo(); else document.addEventListener('DOMContentLoaded',montaFondo);

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
const query=()=>{ const p=new URLSearchParams(); if(perfilId) p.set('p',perfilId); const t=MATE.tema.get(); if(t) p.set('t',t); if(fondo!=='aurora') p.set('f',fondo); const s=p.toString(); return s?'?'+s:''; };
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
