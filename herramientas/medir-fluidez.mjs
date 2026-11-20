// Mide qué tan fluidas se sienten en el celular las páginas de las versiones (/v/<versión> y su producto).
// Simula un celular de gama media: pantalla de 390 px, toques con el dedo y el procesador 4 veces más lento.
// En cada página mide:
//   - bajar y subir toda la página con el dedo (cuadros por segundo y cuadros lentos, de más de 25 ms);
//   - las interacciones de la página (galería, antes y después, tamaños, medida, ventanas, carrito, menú, preguntas):
//     cuánto tarda la página en responder al toque (Event Timing, como el «INP» de Google; bueno: menos de 200 ms);
//   - tareas largas del procesador (más de 50 ms) y saltos de contenido (CLS; bueno: menos de 0.1).
//
// Uso: node herramientas/medir-fluidez.mjs [dirección base] [versiones=a,b1,…] [lentitud=4]
//      node herramientas/medir-fluidez.mjs http://localhost:3100 b1

import { abrirChrome } from "./cdp.mjs";

const BASE = (process.argv[2] ?? "https://diluvium-prueba.web-diluvium.workers.dev").replace(/\/$/, "");
const VERSIONES = (process.argv[3] ?? "a,b1").split(",");
const LENTITUD = Number(process.argv[4] ?? 4);
const PRODUCTO = "compuerta-anti-inundaciones";
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

// Se instala antes de que cargue la página: anota cuadros, tareas largas, saltos y la respuesta a cada toque.
const SONDA = `(() => {
  const m = (window.__m = { cuadros: [], largas: 0, cls: 0, eventos: [], midiendo: false });
  let ultimo = performance.now();
  const cuadro = (t) => { if (m.midiendo) m.cuadros.push(t - ultimo); ultimo = t; requestAnimationFrame(cuadro); };
  requestAnimationFrame(cuadro);
  try { new PerformanceObserver((l) => { m.largas += l.getEntries().length; }).observe({ type: "longtask", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) m.cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) m.eventos.push({ nombre: e.name, ms: Math.round(e.duration) }); }).observe({ type: "event", durationThreshold: 16, buffered: true }); } catch {}
})();`;

const chrome = await abrirChrome();
const filas = [];
try {
  for (const v of VERSIONES) {
    for (const tipo of ["portada", "producto"]) {
      const url = tipo === "portada" ? `${BASE}/v/${v}` : `${BASE}/v/${v}/products/${PRODUCTO}`;
      const p = await chrome.abrirPagina("about:blank", "celular", { esperaMs: 200 });
      await p.cdp("Page.addScriptToEvaluateOnNewDocument", { source: SONDA });
      await p.cdp("Emulation.setCPUThrottlingRate", { rate: LENTITUD });
      await p.cdp("Page.navigate", { url });
      await pausa(9000);
      const js = (e) => p.evaluar(e);
      const empezar = () => js(`window.__m.cuadros=[];window.__m.midiendo=true`);
      const terminar = () => js(`(()=>{const m=window.__m;m.midiendo=false;const f=m.cuadros.slice(1);return {n:f.length,lentos:f.filter(x=>x>25).length,peor:Math.round(Math.max(0,...f))}})()`);
      const tocar = async (selector) => {
        const r = await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:"center",behavior:"instant"});const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`);
        if (!r) return false;
        await pausa(400);
        await p.cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: r.x, y: r.y }] });
        await p.cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await pausa(700);
        // Si el toque abrió otra página, se anota y se regresa (la medición sigue en la página que toca).
        const ahora = await js(`location.href`);
        if (ahora !== url) {
          console.log(`   ⚠ ${selector} llevó a ${ahora}`);
          await p.cdp("Page.navigate", { url });
          await pausa(7000);
          await empezar();
        }
        return true;
      };
      const arrastrar = async (x0, x1, y, pasos = 24) => {
        await p.cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
        for (let i = 1; i <= pasos; i++) {
          await p.cdp("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / pasos, y }] });
          await pausa(16);
        }
        await p.cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await pausa(700);
      };
      const hechas = [];

      // 1) Bajar y subir toda la página con el dedo.
      await js(`scrollTo(0,0)`);
      await empezar();
      const alto = await js(`document.documentElement.scrollHeight`);
      await p.cdp("Input.synthesizeScrollGesture", { x: 195, y: 600, yDistance: -Math.min(alto, 9000), speed: 1600, gestureSourceType: "touch", repeatCount: 1 });
      await p.cdp("Input.synthesizeScrollGesture", { x: 195, y: 300, yDistance: Math.min(alto, 9000), speed: 2400, gestureSourceType: "touch", repeatCount: 1 });
      const scroll = await terminar();
      await js(`scrollTo(0,0)`);
      await pausa(500);

      // 2) Interacciones.
      await empezar();
      const galeria = await js(`(()=>{const s=document.querySelector('[aria-roledescription=foto]');if(!s)return null;s.scrollIntoView({block:"center"});const r=s.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,comparador:!!s.querySelector('[role=slider]')}})()`);
      if (galeria) {
        await pausa(300);
        if (galeria.comparador) {
          await arrastrar(galeria.x + galeria.w / 2, galeria.x + galeria.w * 0.15, galeria.y + galeria.h * 0.7);
          hechas.push("antes/después");
        }
        for (let i = 0; i < 3; i++) await arrastrar(galeria.x + galeria.w * 0.3, galeria.x + galeria.w * 0.02, galeria.y + galeria.h * 0.75, 14);
        hechas.push("galería×3");
      }
      const comparadorPortada = !galeria && (await js(`(()=>{const s=document.querySelector('[role=slider]');if(!s)return null;const c=s.closest('.touch-pan-y');if(!c)return null;c.scrollIntoView({block:"center"});const r=c.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}})()`));
      if (comparadorPortada) {
        await pausa(300);
        await arrastrar(comparadorPortada.x + comparadorPortada.w * 0.8, comparadorPortada.x + comparadorPortada.w * 0.1, comparadorPortada.y + comparadorPortada.h * 0.6);
        hechas.push("antes/después");
      }
      if (await tocar('#tamanos label:nth-of-type(3)')) hechas.push("tamaño");
      const medida = await js(`(()=>{const i=[...document.querySelectorAll('input[inputmode=decimal]')][0];if(!i)return false;i.scrollIntoView({block:"center"});i.focus();return true})()`);
      if (medida) {
        await p.cdp("Input.insertText", { text: "9" });
        await pausa(300);
        await p.cdp("Input.insertText", { text: "5" });
        await pausa(600);
        hechas.push("medida");
      }
      if (await tocar('button[data-evento="abre_tabla"]')) {
        await tocar('dialog[open] button[aria-label="Cerrar"]');
        hechas.push("guía de tamaños");
      }
      if (await tocar('button#boton-principal')) {
        await pausa(600);
        await js(`document.querySelector('[aria-label*="Cerrar"]')?.click()`);
        hechas.push("añadir al carrito");
      }
      if (await tocar('details summary')) hechas.push("pregunta");
      await js(`scrollTo(0,0)`);
      await pausa(400);
      if (await tocar('header button[aria-haspopup="dialog"], header button[aria-expanded]')) {
        await js(`document.querySelector('dialog[open] button[aria-label*="Cerrar"]')?.click()`);
        hechas.push("menú");
      }
      const interacciones = await terminar();
      const final = await js(`(()=>{const m=window.__m;const peor=m.eventos.reduce((a,e)=>e.ms>a.ms?e:a,{nombre:"",ms:0});return {largas:m.largas,cls:+m.cls.toFixed(3),eventos:m.eventos.length,peorToque:peor}})()`);
      filas.push({ pagina: `${v} ${tipo}`, scroll, interacciones, ...final, hechas: hechas.join(", ") });
      console.log(
        `${(v + " " + tipo).padEnd(13)} bajar/subir: ${scroll.lentos}/${scroll.n} lentos (peor ${scroll.peor} ms) · interacciones: ${interacciones.lentos}/${interacciones.n} lentos (peor ${interacciones.peor} ms) · respuesta al toque más lenta: ${final.peorToque.ms} ms (${final.peorToque.nombre}) · tareas largas: ${final.largas} · CLS: ${final.cls} · probado: ${hechas.join(", ")}`,
      );
      await p.cerrar();
    }
  }
} finally {
  await chrome.cerrar();
}
