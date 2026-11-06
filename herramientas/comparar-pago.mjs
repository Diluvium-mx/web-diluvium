// Compara la pantalla de pago de la réplica (/checkout) contra las capturas del pago en vivo (capturar-pago.mjs).
// En la réplica pone en el carrito la misma compuerta de las capturas (Extra Chica, 1 pieza), contesta la región por IP
// con «Sinaloa» (lo que mostró la captura en vivo) y captura cada estado: tarjeta (inicio), PayPal, Mercado Pago y, en
// celular y tableta, el resumen abierto. Por estado y vista dice el alto en vivo contra el de la réplica y el % de
// píxeles distintos (tolerancia de color 12 %) en cada zona de la página, medida en la réplica.
//
// Se tapan en las dos imágenes (no se comparan): el interior de los campos de la tarjeta (en vivo son marcos de Mercado
// Pago), las fotos del resumen y los botones de PayPal cuando en vivo salieron en blanco (también son marcos).
//
// Uso: node herramientas/comparar-pago.mjs [vistas=celular,tableta,compu] [estados=inicio,paypal,mercadopago,resumen]
// Requiere el servidor de la réplica en http://localhost:3100 (npm run dev).
// Salida: $COMPARAR_SALIDA (comparaciones/pago) con <estado>-<vista>.jpg (izquierda en vivo, derecha réplica),
//         <estado>-<vista>-<zona>.png y resumen.md.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirChrome, espera } from "./cdp.mjs";

const BASE = process.env.REPLICA_URL ?? "http://localhost:3100";
const SALIDA = process.env.COMPARAR_SALIDA ?? "comparaciones/pago";
const CAPTURAS = "docs/sitio-actual/capturas/2026-11-06";
const vistas = (process.argv[2] ?? "celular,tableta,compu").split(",");
const estados = (process.argv[3] ?? "inicio,paypal,mercadopago,resumen").split(",");
const CARRITO = JSON.stringify([{ id: 46431147524316, cantidad: 1 }]);
mkdirSync(SALIDA, { recursive: true });

const magick = (...args) => execFileSync("magick", args, { stdio: ["ignore", "pipe", "pipe"] });
const alto = (img) => Number(String(magick(img, "-format", "%h", "info:")).trim());
function diferencia(a, b) {
  try {
    execFileSync("magick", ["compare", "-metric", "AE", "-fuzz", "12%", a, b, "null:"], { stdio: ["ignore", "pipe", "pipe"] });
    return 0;
  } catch (e) {
    const n = parseFloat(String(e.stderr).trim().split(/\s/)[0]);
    return Number.isFinite(n) ? n : NaN;
  }
}
/** ¿El píxel (x, y) de la imagen es casi blanco? (para saber si el botón de PayPal en vivo salió en blanco). */
function blanco(img, x, y) {
  const c = String(magick(img, "-format", `%[pixel:p{${x},${y}}]`, "info:"));
  const n = (c.match(/\d+/g) ?? []).slice(0, 3).map(Number);
  return n.length === 3 && n.every((v) => v > 240);
}

// Zonas de la réplica: [nombre, selector]. Se mide la caja de cada una (página completa) y se compara esa misma caja en
// las dos imágenes.
const ZONAS = `(()=>{
  const caja = (e) => { if (!e || e.offsetParent === null && getComputedStyle(e).position !== 'fixed') return null; const r = e.getBoundingClientRect(); return r.width && r.height ? [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)] : null; };
  const una = (s) => caja(document.querySelector(s));
  const zonas = {
    encabezado: una('header'),
    barra_resumen: una('aside[aria-label="Resumen del pedido"]'),
    pago_expres: una('section[aria-labelledby=pago-expres]'),
    contacto: una('section[aria-labelledby=contacto]'),
    entrega: una('section[aria-labelledby=entrega]'),
    envio: una('section[aria-labelledby=metodos-envio]'),
    pago: una('section[aria-labelledby=pago]'),
    facturacion: una('section[aria-labelledby=facturacion]'),
    resumen_abajo: una('section[aria-labelledby=resumen-abajo]'),
    pagar: caja(document.querySelector('#checkout-pay-button, button[aria-label="Pagar con PayPal"]:not(section *)')),
    terminos: caja(document.querySelector('button[aria-controls=politicas]')),
    resumen_lateral: una('aside[aria-labelledby=resumen-lateral]'),
  };
  const tapar = [...document.querySelectorAll('[data-mp-campo]:not([data-mp-campo=installments])')].map(caja).filter(Boolean).map(([x,y,w,h]) => [x+2,y+2,w-4,h-4]);
  const fotos = [...document.querySelectorAll('main img, aside img')].map(caja).filter(Boolean);
  const paypal = [...document.querySelectorAll('button[aria-label="Pagar con PayPal"]')].map(caja).filter(Boolean);
  return JSON.stringify({ zonas, tapar, fotos, paypal, alto: document.documentElement.scrollHeight });
})()`;

async function capturarReplica(chrome, vista, estado) {
  // Primero una página cualquiera del mismo origen para dejar el carrito en localStorage.
  const p = await chrome.abrirPagina(`${BASE}/robots.txt`, vista, { esperaMs: 800 });
  await p.evaluar(`localStorage.setItem('diluvium-carrito', ${JSON.stringify(CARRITO)}); localStorage.removeItem('diluvium-pago-datos'); true`);
  // La región por IP: la misma que salió en la captura en vivo.
  await p.cdp("Fetch.enable", { patterns: [{ urlPattern: "*ipinfo.io*" }] });
  const dejar = p.escuchar((msg) => {
    if (msg.method !== "Fetch.requestPaused") return;
    p.cdp("Fetch.fulfillRequest", {
      requestId: msg.params.requestId,
      responseCode: 200,
      responseHeaders: [
        { name: "Content-Type", value: "application/json" },
        { name: "Access-Control-Allow-Origin", value: "*" },
      ],
      body: Buffer.from(JSON.stringify({ region: "Sinaloa", country: "MX" })).toString("base64"),
    }).catch(() => {});
  });
  await p.cdp("Page.navigate", { url: `${BASE}/checkout` });
  await espera(3500);
  if (estado === "paypal") await p.evaluar(`document.getElementById('metodo-paypal').click()`);
  if (estado === "mercadopago") await p.evaluar(`document.getElementById('metodo-mercadopago').click()`);
  if (estado === "resumen") {
    const hay = await p.evaluar(`(()=>{const b=document.querySelector('button[aria-controls=resumen-arriba]');if(!b||b.offsetParent===null)return false;b.click();return true})()`);
    if (!hay) {
      dejar();
      await p.cerrar();
      return null;
    }
  }
  await espera(800);
  await p.evaluar(`(async()=>{const t=Date.now();while([...document.images].some(i=>!i.complete)&&Date.now()-t<8000){await new Promise(r=>setTimeout(r,250))}document.activeElement?.blur();scrollTo(0,0);await new Promise(r=>setTimeout(r,300))})()`);
  const datos = JSON.parse(await p.evaluar(ZONAS));
  const { buffer } = await p.capturar({ calidad: 92 });
  dejar();
  await p.cerrar();
  const archivo = join(SALIDA, `${estado}-${vista}-replica.jpg`);
  writeFileSync(archivo, buffer);
  return { archivo, ...datos };
}

const filas = [];
for (const vista of vistas) {
  const chrome = await abrirChrome();
  try {
    for (const estado of estados) {
      if (estado === "resumen" && vista === "compu") continue;
      const vivo = join(CAPTURAS, `pago-${estado}-${vista}.jpg`);
      const r = await capturarReplica(chrome, vista, estado);
      if (!r) continue;
      const altoVivo = alto(vivo);
      const altoReplica = alto(r.archivo);

      // Se tapa lo mismo en las dos imágenes.
      const rect = ([x, y, w, h]) => `rectangle ${x},${y} ${x + w - 1},${y + h - 1}`;
      const tapas = [...r.tapar, ...r.fotos];
      for (const b of r.paypal) if (blanco(vivo, b[0] + Math.round(b[2] / 2), b[1] + Math.round(b[3] / 2))) tapas.push(b);
      const a = join(SALIDA, `${estado}-${vista}-vivo-tapado.png`);
      const b = join(SALIDA, `${estado}-${vista}-replica-tapado.png`);
      const dibujar = tapas.flatMap((t) => ["-draw", rect(t)]);
      magick(vivo, "-fill", "#808080", ...dibujar, a);
      magick(r.archivo, "-fill", "#808080", ...dibujar, b);

      const zonas = [];
      for (const [nombre, caja] of Object.entries(r.zonas)) {
        if (!caja) continue;
        const [x, y, w, h] = caja;
        if (y + h > altoVivo) {
          zonas.push({ nombre, pct: NaN, nota: "fuera de la captura en vivo" });
          continue;
        }
        const za = join(SALIDA, `${estado}-${vista}-${nombre}-vivo.png`);
        const zb = join(SALIDA, `${estado}-${vista}-${nombre}-replica.png`);
        magick(a, "-crop", `${w}x${h}+${x}+${y}`, "+repage", za);
        magick(b, "-crop", `${w}x${h}+${x}+${y}`, "+repage", zb);
        zonas.push({ nombre, pct: (100 * diferencia(za, zb)) / (w * h), y, h });
      }
      // Página completa (en el alto menor de las dos).
      const h = Math.min(altoVivo, altoReplica);
      const w = Number(String(magick(vivo, "-format", "%w", "info:")).trim());
      const ca = join(SALIDA, `${estado}-${vista}-pagina-vivo.png`);
      const cb = join(SALIDA, `${estado}-${vista}-pagina-replica.png`);
      magick(a, "-crop", `${w}x${h}+0+0`, "+repage", ca);
      magick(b, "-crop", `${w}x${h}+0+0`, "+repage", cb);
      const total = (100 * diferencia(ca, cb)) / (w * h);
      magick(vivo, r.archivo, "-background", "#ff00ff", "+append", "-quality", "70", join(SALIDA, `${estado}-${vista}.jpg`));

      const fila = { estado, vista, altoVivo, altoReplica, total, zonas };
      filas.push(fila);
      console.log(
        `${estado}-${vista}: alto ${altoVivo}/${altoReplica} (Δ${altoReplica - altoVivo}) · página ${total.toFixed(2)} %\n  ` +
          zonas.map((z) => `${z.nombre} ${Number.isFinite(z.pct) ? z.pct.toFixed(2) + " %" : z.nota}`).join(" · "),
      );
    }
  } finally {
    await chrome.cerrar();
  }
}

const lineas = [
  `# Comparación de la pantalla de pago (${new Date().toISOString().slice(0, 16)})`,
  "",
  "Meta: alto ±4 px y ≤ 2 % de píxeles distintos por zona (tolerancia de color 12 %).",
  "",
  "| Estado | Vista | Alto vivo | Alto réplica | Δ | Página | Zonas |",
  "|---|---|---|---|---|---|---|",
  ...filas.map(
    (f) =>
      `| ${f.estado} | ${f.vista} | ${f.altoVivo} | ${f.altoReplica} | ${f.altoReplica - f.altoVivo} | ${f.total.toFixed(2)} % | ${f.zonas
        .map((z) => `${z.nombre} ${Number.isFinite(z.pct) ? z.pct.toFixed(2) + " %" : "—"}`)
        .join(" · ")} |`,
  ),
];
writeFileSync(join(SALIDA, "resumen.md"), lineas.join("\n") + "\n");
