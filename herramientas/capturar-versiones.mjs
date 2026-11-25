// Captura la primera pantalla en celular (390 × 844) de la portada de cada versión, para la lista /v: quien aprueba
// ve de un vistazo cómo abre cada una. Por omisión las toma de la copia de prueba publicada.
//
// Uso: node herramientas/capturar-versiones.mjs [dirección base]
//      node herramientas/capturar-versiones.mjs http://localhost:3100
//      node herramientas/capturar-versiones.mjs http://localhost:3100 c1     (solo esas versiones)
// Salida: public/media/versiones/portada-<versión>.webp

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirChrome, BLOQUEAR_ANALITICA } from "./cdp.mjs";

const BASE = (process.argv[2] ?? "https://diluvium-prueba.web-diluvium.workers.dev").replace(/\/$/, "");
const SALIDA = "public/media/versiones";
const VERSIONES = process.argv[3]?.split(",") ?? ["a", "b1", "c1", "d1"];
mkdirSync(SALIDA, { recursive: true });

const chrome = await abrirChrome();
try {
  for (const v of VERSIONES) {
    const p = await chrome.abrirPagina(`${BASE}/v/${v}`, "celular", { bloquear: BLOQUEAR_ANALITICA, esperaMs: 5000 });
    // Sin la pastilla «Versión · cambiar» ni el indicador de Next en desarrollo: solo lo que ve el cliente.
    await p.evaluar(`(()=>{document.querySelectorAll('a[href="/v"], nextjs-portal').forEach(e=>e.style.display='none');scrollTo(0,0)})()`);
    await new Promise((r) => setTimeout(r, 800));
    const { data } = await p.cdp("Page.captureScreenshot", { format: "webp", quality: 82 });
    writeFileSync(join(SALIDA, `portada-${v}.webp`), Buffer.from(data, "base64"));
    console.log(`portada-${v}.webp`);
  }
} finally {
  await chrome.cerrar();
}
