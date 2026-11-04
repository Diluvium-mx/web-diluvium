// Capturas y medidas del carrito CON productos en el sitio en vivo (las de 2026-11-03 solo lo tienen vacío).
// Como visitante anónimo: abre una ficha, pulsa «Añadir al carrito» y captura el carrito lateral y /cart.
//   1: Compuerta Anti-Inundaciones (primer tamaño disponible), 1 pieza.
//   2: lo anterior + Tapón inflable (primer tamaño disponible), 2 piezas.
// Nunca inicia sesión, nunca va al pago y no envía ningún otro formulario. Antes de navegar bloquea la analítica y los
// píxeles de anuncios (también dentro de iframes y trabajadores) para no ensuciar las métricas de la tienda.
//
// Uso: node herramientas/capturar-carrito.mjs [vistas=celular,tableta,compu]
// Salida: docs/sitio-actual/capturas/2026-11-04/carrito-lateral-<n>-<vista>.jpg (solo la pantalla),
//         carrito-<n>-<vista>.jpg (página completa), *.html de referencia, y
//         docs/sitio-actual/medidas/carrito-lateral-<n>-<vista>.json, carrito-<n>-<vista>.json

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirChrome, BLOQUEAR_ANALITICA as BLOQUEAR, CONGELAR_VIDEOS, espera } from "./cdp.mjs";
import { MEDIR, medirCon } from "./medir.mjs";

const VIVO = "https://www.diluvium.com.mx";
const CAPTURAS = "docs/sitio-actual/capturas/2026-11-04";
const MEDIDAS = "docs/sitio-actual/medidas";
const vistas = (process.argv[2] ?? "celular,tableta,compu").split(",");

// El carrito lateral abierto (en vivo: <sht-cart-drwr>).
const LATERAL = "#shtCartDrawer .drawer__wrapper";

mkdirSync(CAPTURAS, { recursive: true });
mkdirSync(MEDIDAS, { recursive: true });

// Pantalla tal cual se ve (el carrito lateral es fijo: no se captura la página completa).
async function capturarPantalla(p) {
  await p.evaluar(CONGELAR_VIDEOS);
  const { data } = await p.cdp("Page.captureScreenshot", { format: "jpeg", quality: 85 });
  return Buffer.from(data, "base64");
}

async function agregar(chrome, vista, producto, { cantidad = 1 } = {}) {
  const p = await chrome.abrirPagina(`${VIVO}/products/${producto}`, vista, { bloquear: BLOQUEAR });
  await p.evaluar(`scrollTo(0,0)`);
  // El campo de cantidad va fuera del formulario (atributo form=…); se sube con el botón «+» de la ficha.
  for (let i = 1; i < cantidad; i++) {
    await p.evaluar(`document.querySelector('input[name=quantity]').parentElement.querySelector('.js-quantity-btn-plus').click()`);
    await espera(300);
  }
  const pedida = Number(await p.evaluar(`document.querySelector('input[name=quantity]').value`));
  if (pedida !== cantidad) throw new Error(`La ficha quedó en ${pedida} piezas, no ${cantidad}`);
  await p.evaluar(`document.querySelector('form[action*="/cart/add"] button[name=add]').click()`);
  // Respuesta del carrito + animación del panel (0.25 s + 0.25 s) + fotos.
  await espera(3500);
  await p.evaluar(`(async()=>{const t=Date.now();while([...document.querySelectorAll('${LATERAL} img')].some(i=>!i.complete)&&Date.now()-t<8000){await new Promise(r=>setTimeout(r,250))}})()`);
  await espera(500);
  return p;
}

const chromes = [];
try {
  for (const vista of vistas) {
    // Un navegador limpio por vista: el carrito empieza vacío.
    const chrome = await abrirChrome();
    chromes.push(chrome);
    const pasos = [
      { n: 1, producto: "compuerta-anti-inundaciones", cantidad: 1 },
      { n: 2, producto: "tapon-inflable-anti-inundaciones", cantidad: 2 },
    ];
    for (const { n, producto, cantidad } of pasos) {
      const p = await agregar(chrome, vista, producto, { cantidad });
      writeFileSync(join(CAPTURAS, `carrito-lateral-${n}-${vista}.jpg`), await capturarPantalla(p));
      const lateral = await p.evaluar(medirCon(LATERAL));
      writeFileSync(join(MEDIDAS, `carrito-lateral-${n}-${vista}.json`), JSON.stringify(lateral, null, 1));
      if (vista === vistas[0]) writeFileSync(join(CAPTURAS, `carrito-lateral-${n}.html`), await p.evaluar(`document.querySelector('#shtCartDrawer').outerHTML`));
      const resumen = await p.evaluar(`fetch('/cart.js').then(r=>r.json()).then(c=>c.items.map(i=>i.variant_id+' x'+i.quantity).join(', '))`);
      console.log(`${vista} ${n}: carrito lateral (${resumen})`);
      await p.cerrar();

      // 12 s: el botón de PayPal (iframe) tarda en dibujarse; antes queda el hueco en blanco.
      const c = await chrome.abrirPagina(`${VIVO}/cart`, vista, { bloquear: BLOQUEAR, esperaMs: 12000 });
      await c.evaluar(CONGELAR_VIDEOS);
      await espera(1000);
      const medidas = await c.evaluar(MEDIR);
      writeFileSync(join(MEDIDAS, `carrito-${n}-${vista}.json`), JSON.stringify(medidas, null, 1));
      const { buffer } = await c.capturar({ calidad: 85 });
      writeFileSync(join(CAPTURAS, `carrito-${n}-${vista}.jpg`), buffer);
      if (vista === vistas[0]) writeFileSync(join(CAPTURAS, `carrito-${n}.html`), await c.evaluar(`document.documentElement.outerHTML`));
      console.log(`${vista} ${n}: /cart, ${medidas.secciones.length} secciones, alto ${medidas.altoPagina}`);
      await c.cerrar();
    }
    await chrome.cerrar();
    chromes.pop();
  }
} finally {
  for (const c of chromes) await c.cerrar();
}
