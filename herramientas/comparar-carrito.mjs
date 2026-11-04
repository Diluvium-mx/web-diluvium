// Compara el carrito CON productos de la réplica contra las capturas del sitio en vivo (capturar-carrito.mjs).
// En la réplica hace lo mismo que en vivo: abre la ficha, pulsa «Añadir al carrito» y captura el carrito lateral y
// /cart con 1 producto y con 2 productos (el segundo, 2 piezas). Por cada uno mide el % de píxeles distintos
// (tolerancia de color 12 %), el alto en vivo contra el de la réplica y los textos que se mueven más de 4 px.
//
// Uso: node herramientas/comparar-carrito.mjs [vistas=celular,tableta,compu]
// Requiere el servidor de la réplica en http://localhost:3100 (npm run dev).
// Salida: $COMPARAR_SALIDA (comparaciones/carrito) con <pieza>-<n>-<vista>.jpg (izquierda en vivo, derecha réplica)
//         y resumen.md.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirChrome, CONGELAR_VIDEOS, espera } from "./cdp.mjs";
import { MEDIR, medirCon } from "./medir.mjs";

const BASE = process.env.REPLICA_URL ?? "http://localhost:3100";
const SALIDA = process.env.COMPARAR_SALIDA ?? "comparaciones/carrito";
const CAPTURAS = "docs/sitio-actual/capturas/2026-11-04";
const MEDIDAS = "docs/sitio-actual/medidas";
const vistas = (process.argv[2] ?? "celular,tableta,compu").split(",");
mkdirSync(SALIDA, { recursive: true });

const magick = (...args) => execFileSync("magick", args, { stdio: ["ignore", "pipe", "pipe"] });
function diferencia(a, b) {
  try {
    execFileSync("magick", ["compare", "-metric", "AE", "-fuzz", "12%", a, b, "null:"], { stdio: ["ignore", "pipe", "pipe"] });
    return 0;
  } catch (e) {
    const n = parseFloat(String(e.stderr).trim().split(/\s/)[0]);
    return Number.isFinite(n) ? n : NaN;
  }
}

// Fotos de la réplica servidas por next/image (/_next/image?url=/media/…): se comparan por su archivo.
const archivo = (src) => (src?.includes("/_next/image") ? decodeURIComponent(new URL(src, BASE).searchParams.get("url") ?? "") : src);
const claveDe = (e) => e.texto ?? archivo(e.src);

/** Textos e imágenes que en la réplica quedan a más de 4 px (posición o tamaño) de donde están en vivo. */
function desfases(vivo, replica) {
  const usados = new Set();
  const salida = [];
  for (const e of vivo.elementos) {
    // «>» es un resto de texto suelto dentro del ícono de la palomita en vivo.
    if ((!e.texto && e.tag !== "img") || e.texto === ">") continue;
    const clave = claveDe(e);
    const i = replica.elementos.findIndex((r, j) => !usados.has(j) && claveDe(r) === clave);
    if (i < 0) {
      salida.push(`falta «${String(clave).slice(0, 40)}»`);
      continue;
    }
    usados.add(i);
    const r = replica.elementos[i];
    const d = e.caja.map((v, k) => r.caja[k] - v);
    const ox = vivo.caja[0] - replica.caja[0];
    d[0] += ox;
    if (d.some((v) => Math.abs(v) > 4)) salida.push(`«${String(clave).slice(0, 30)}» Δx${d[0]} Δy${d[1]} Δw${d[2]} Δh${d[3]}`);
  }
  return salida;
}

async function agregarEnReplica(chrome, vista, producto, cantidad) {
  const p = await chrome.abrirPagina(`${BASE}/products/${producto}`, vista, { esperaMs: 3000 });
  await p.evaluar(`scrollTo(0,0)`);
  for (let i = 1; i < cantidad; i++) {
    await p.evaluar(`document.querySelector('form button[aria-label="Más"]').click()`);
    await espera(200);
  }
  await p.evaluar(`document.querySelector('form button[name=add]').click()`);
  await espera(1500);
  await p.evaluar(`(async()=>{const t=Date.now();while([...document.querySelectorAll('[data-carrito-lateral] img')].some(i=>!i.complete)&&Date.now()-t<8000){await new Promise(r=>setTimeout(r,250))}})()`);
  await espera(500);
  return p;
}

const filas = [];
for (const vista of vistas) {
  const chrome = await abrirChrome();
  try {
    const pasos = [
      { n: 1, producto: "compuerta-anti-inundaciones", cantidad: 1 },
      { n: 2, producto: "tapon-inflable-anti-inundaciones", cantidad: 2 },
    ];
    for (const { n, producto, cantidad } of pasos) {
      // Carrito lateral: se recorta solo el panel (lo de atrás es la ficha y no se compara aquí).
      const p = await agregarEnReplica(chrome, vista, producto, cantidad);
      await p.evaluar(CONGELAR_VIDEOS);
      const { data } = await p.cdp("Page.captureScreenshot", { format: "png" });
      const pantalla = join(SALIDA, `lateral-${n}-${vista}-pantalla.png`);
      writeFileSync(pantalla, Buffer.from(data, "base64"));
      const replica = (await p.evaluar(medirCon("[data-carrito-lateral]"))).secciones[0];
      await p.cerrar();
      const vivo = JSON.parse(readFileSync(join(MEDIDAS, `carrito-lateral-${n}-${vista}.json`), "utf8")).secciones[0];
      filas.push(comparar(`lateral-${n}-${vista}`, join(CAPTURAS, `carrito-lateral-${n}-${vista}.jpg`), vivo, pantalla, replica));

      // /cart: se recorta la sección «main-cart».
      const c = await chrome.abrirPagina(`${BASE}/cart`, vista, { esperaMs: 3000 });
      await c.evaluar(CONGELAR_VIDEOS);
      await espera(800);
      const medidas = await c.evaluar(MEDIR);
      const { buffer } = await c.capturar({ calidad: 90 });
      const pagina = join(SALIDA, `pagina-${n}-${vista}-completa.jpg`);
      writeFileSync(pagina, buffer);
      await c.cerrar();
      const vivoPagina = JSON.parse(readFileSync(join(MEDIDAS, `carrito-${n}-${vista}.json`), "utf8"));
      const sVivo = vivoPagina.secciones.find((s) => s.tipo === "Main Cart Section");
      const sReplica = medidas.secciones.find((s) => s.tipo === "main-cart");
      filas.push(comparar(`pagina-${n}-${vista}`, join(CAPTURAS, `carrito-${n}-${vista}.jpg`), sVivo, pagina, sReplica));
    }
  } finally {
    await chrome.cerrar();
  }
}

function comparar(nombre, fotoVivo, vivo, fotoReplica, replica) {
  const [vx, vy, vw, vh] = vivo.caja;
  const [rx, ry, rw, rh] = replica.caja;
  const a = join(SALIDA, `${nombre}-vivo.png`);
  const b = join(SALIDA, `${nombre}-replica.png`);
  magick(fotoVivo, "-crop", `${vw}x${vh}+${vx}+${vy}`, "+repage", a);
  magick(fotoReplica, "-crop", `${rw}x${rh}+${rx}+${ry}`, "+repage", "-resize", `${vw}x${vh}!`, b);
  const pct = (100 * diferencia(a, b)) / (vw * vh);
  magick(a, b, "+append", "-quality", "75", join(SALIDA, `${nombre}.jpg`));
  const fila = { nombre, altoVivo: vh, altoReplica: rh, anchoVivo: vw, anchoReplica: rw, pct, desfases: desfases(vivo, replica) };
  console.log(`${nombre}: ${pct.toFixed(2)} % · alto ${vh}/${rh} · ancho ${vw}/${rw}${fila.desfases.length ? "\n  " + fila.desfases.join("\n  ") : ""}`);
  return fila;
}

const lineas = [
  `# Comparación del carrito con productos (${new Date().toISOString().slice(0, 16)})`,
  "",
  "| Pieza | Alto vivo | Alto réplica | Ancho vivo | Ancho réplica | Píxeles distintos | Textos desfasados (> 4 px) |",
  "|---|---|---|---|---|---|---|",
  ...filas.map(
    (f) =>
      `| ${f.nombre} | ${f.altoVivo} | ${f.altoReplica} | ${f.anchoVivo} | ${f.anchoReplica} | ${f.pct.toFixed(2)} % | ${f.desfases.length ? f.desfases.join("; ") : "—"} |`,
  ),
];
writeFileSync(join(SALIDA, "resumen.md"), lineas.join("\n") + "\n");
