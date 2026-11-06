// Capturas de la pantalla de pago del sitio en vivo (Shopify), para rehacerla igual.
// Como visitante anónimo: agrega 1 compuerta al carrito y abre /checkout. NO escribe ningún dato, NO pulsa
// «Pagar ahora» ni envía nada: solo mira y, para ver cada forma de pago, marca su opción (eso no manda nada).
// Antes de navegar bloquea la analítica y los píxeles (como capturar-carrito.mjs).
//
// Uso: node herramientas/capturar-pago.mjs [vistas=celular,tableta,compu] [--explorar]
// Salida: docs/sitio-actual/capturas/2026-11-06/pago-<estado>-<vista>.jpg (página completa) y pago-<vista>.html

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirChrome, BLOQUEAR_ANALITICA, espera } from "./cdp.mjs";

// Lo mismo que se bloquea siempre, menos «*shopify.com/s/*», que también tapa las fotos del CDN de Shopify (logo y
// producto); la analítica de Shopify sigue bloqueada por «trekkie», «monorail» y «web-pixels».
const BLOQUEAR = BLOQUEAR_ANALITICA.filter((b) => b !== "*shopify.com/s/*");

const VIVO = "https://www.diluvium.com.mx";
const CAPTURAS = "docs/sitio-actual/capturas/2026-11-06";
const vistas = (process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "celular,tableta,compu").split(",");
const explorar = process.argv.includes("--explorar");
mkdirSync(CAPTURAS, { recursive: true });

for (const vista of vistas) {
  const chrome = await abrirChrome();
  try {
    const f = await chrome.abrirPagina(`${VIVO}/products/compuerta-anti-inundaciones`, vista, { bloquear: BLOQUEAR });
    await f.evaluar(`document.querySelector('form[action*="/cart/add"] button[name=add]').click()`);
    await espera(3500);
    await f.cerrar();

    const p = await chrome.abrirPagina(`${VIVO}/checkout`, vista, { bloquear: BLOQUEAR, esperaMs: 12000 });
    const url = await p.evaluar(`location.href.replace(/\\/cn\\/[^/]+/, '/cn/…')`);
    console.log(vista, "en", url);
    writeFileSync(join(CAPTURAS, `pago-${vista}.html`), await p.evaluar(`document.documentElement.outerHTML`));
    // Medidas de cada pieza visible: caja, letra, colores, bordes y relleno (para rehacerla igual).
    const medidas = await p.evaluar(`JSON.stringify([...document.querySelectorAll('header,main,aside,h1,h2,h3,p,label,span,input,select,button,a,img,svg,div[role=radiogroup],section,form>div')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0}).slice(0,900).map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();const t=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();return {tag:e.tagName.toLowerCase(),id:e.id||undefined,caja:[Math.round(r.x),Math.round(r.y+scrollY),Math.round(r.width),Math.round(r.height)],texto:t.slice(0,80)||undefined,placeholder:e.placeholder||undefined,font:s.fontFamily.split(',')[0],size:s.fontSize,lh:s.lineHeight,weight:s.fontWeight,color:s.color,bg:s.backgroundColor!=='rgba(0, 0, 0, 0)'?s.backgroundColor:undefined,border:s.borderTopWidth!=='0px'?s.borderTopWidth+' '+s.borderTopColor:undefined,radius:s.borderTopLeftRadius!=='0px'?s.borderTopLeftRadius:undefined,pad:s.padding!=='0px'?s.padding:undefined}}))`);
    writeFileSync(join("docs/sitio-actual/medidas", `pago-${vista}.json`), medidas);
    const { buffer, alto } = await p.capturar({ calidad: 85 });
    writeFileSync(join(CAPTURAS, `pago-inicio-${vista}.jpg`), buffer);
    console.log(vista, "alto", alto);
    // Cada forma de pago abierta (marcar la opción no envía nada).
    for (const [estado, id] of [["paypal", "basic-PAYPAL_EXPRESS"], ["mercadopago", "basic-Mercado Pago"]]) {
      await p.evaluar(`document.getElementById(${JSON.stringify(id)}).click()`);
      await espera(1500);
      const c = await p.capturar({ calidad: 85 });
      writeFileSync(join(CAPTURAS, `pago-${estado}-${vista}.jpg`), c.buffer);
    }
    await p.evaluar(`document.getElementById("basic-creditCards").click()`);
    await espera(800);
    // En celular y tableta, el resumen del pedido va plegado arriba: se captura también abierto.
    const plegado = await p.evaluar(`(()=>{const b=[...document.querySelectorAll('button,[role=button]')].find(e=>/resumen del pedido/i.test(e.innerText||''));if(!b||b.offsetParent===null)return false;b.click();return true})()`);
    if (plegado) {
      await espera(1500);
      const c = await p.capturar({ calidad: 85 });
      writeFileSync(join(CAPTURAS, `pago-resumen-${vista}.jpg`), c.buffer);
    }
    if (explorar) {
      console.log(await p.evaluar(`JSON.stringify([...document.querySelectorAll('input[type=radio]')].map(r=>({name:r.name,id:r.id,checked:r.checked,label:(document.querySelector('label[for="'+r.id+'"]')?.innerText||'').slice(0,80)})))`));
      console.log(await p.evaluar(`[...document.querySelectorAll('h2,h3,legend')].map(e=>e.innerText.trim()).filter(Boolean).join(' | ')`));
    }
    await p.cerrar();
  } finally {
    await chrome.cerrar();
  }
}
