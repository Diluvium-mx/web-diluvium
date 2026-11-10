// Captura la ventana «Escriba un comentario» de la app de reseñas (Trustoo) en el sitio en vivo, para rehacerla igual.
// Como visitante: abre la ficha de la compuerta, pulsa el botón y captura la ventana (paso 1 y, si lo hay, los
// siguientes pasos de la ventana al tocar sus estrellas). NO escribe ningún dato y NO envía nada. Bloquea la analítica.
//
// Uso: node herramientas/capturar-resena.mjs [vistas=celular,tableta,compu]
// Salida: docs/sitio-actual/capturas/2026-11-10/resena-<paso>-<vista>.jpg y resena-<vista>.html

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirChrome, BLOQUEAR_ANALITICA, espera } from "./cdp.mjs";

const BLOQUEAR = BLOQUEAR_ANALITICA.filter((b) => b !== "*shopify.com/s/*" && b !== "*/reviews/collect*");
const CAPTURAS = "docs/sitio-actual/capturas/2026-11-10";
const vistas = (process.argv[2] ?? "celular,tableta,compu").split(",");
mkdirSync(CAPTURAS, { recursive: true });

const pantalla = async (p) => Buffer.from((await p.cdp("Page.captureScreenshot", { format: "jpeg", quality: 85 })).data, "base64");

for (const vista of vistas) {
  const chrome = await abrirChrome();
  try {
    const p = await chrome.abrirPagina("https://www.diluvium.com.mx/products/compuerta-anti-inundaciones", vista, { bloquear: BLOQUEAR, esperaMs: 9000 });
    const abierto = await p.evaluar(`(async()=>{const b=[...document.querySelectorAll('button,a,div[role=button],span')].find(e=>/escrib[ae] un comentario/i.test(e.textContent.trim())&&e.offsetParent!==null&&e.children.length<3);if(!b)return 'sin botón';b.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,600));b.click();await new Promise(r=>setTimeout(r,2500));return 'ok'})()`);
    console.log(vista, abierto);
    writeFileSync(join(CAPTURAS, `resena-1-${vista}.jpg`), await pantalla(p));
    const info = await p.evaluar(`(()=>{const m=[...document.querySelectorAll('div,section,form')].filter(e=>{const s=getComputedStyle(e);return (s.position==='fixed'||s.position==='absolute')&&e.offsetWidth>250&&e.offsetHeight>200&&+s.zIndex>10}).pop();return JSON.stringify({texto:m?.innerText.slice(0,900),html:m?.outerHTML.length})})()`);
    console.log(info);
    writeFileSync(join(CAPTURAS, `resena-${vista}.html`), await p.evaluar(`document.documentElement.outerHTML`));
  } finally {
    await chrome.cerrar();
  }
}
