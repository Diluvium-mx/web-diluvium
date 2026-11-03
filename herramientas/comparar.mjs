// Compara la réplica local contra la referencia del sitio en vivo, sección por sección.
// Captura la réplica con el mismo navegador y vistas que la referencia, empareja las secciones en orden y, para cada
// una, mide el % de píxeles distintos (ImageMagick, tolerancia de color 12 %) y arma una imagen lado a lado.
//
// Uso: npm run comparar -- <pagina> <ruta-local> [vistas=celular,compu] [secciones=0,3,5]
// Ejemplo: npm run comparar -- portada / celular,compu
// Requiere el servidor de la réplica en http://localhost:3100 (npm run dev).
// Salida: comparaciones/<pagina>-<vista>.md, comparaciones/<pagina>-<vista>/<n>.jpg (izquierda: en vivo, derecha: réplica)

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirChrome } from "./cdp.mjs";
import { MEDIR } from "./medir.mjs";

const [pagina, ruta = "/", vistasArg = "celular,compu", soloArg] = process.argv.slice(2);
if (!pagina) {
  console.error("Uso: npm run comparar -- <pagina> <ruta-local> [vistas] [secciones]");
  process.exit(1);
}
const BASE = process.env.REPLICA_URL ?? "http://localhost:3100";
// Referencia: la captura más nueva que exista de esa página y vista (las del 3-nov van con las medidas del mismo día).
const CARPETAS_REF = ["docs/sitio-actual/capturas/2026-11-03", "docs/sitio-actual/capturas/2026-10-31"];
const REF_MEDIDAS = "docs/sitio-actual/medidas";
// COMPARAR_SALIDA permite que varias personas o agentes comparen a la vez sin pisarse los archivos.
const SALIDA = process.env.COMPARAR_SALIDA ?? "comparaciones";
const solo = soloArg ? new Set(soloArg.split(",").map(Number)) : null;
// Secciones que se mueven solas (franjas, carruseles): su % no se toma como falla.
const MOVIBLES = /running|marquee|scrolling|reviews|apps|logos/i;

const magick = (...args) => execFileSync("magick", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
function diferencia(a, b) {
  try {
    execFileSync("magick", ["compare", "-metric", "AE", "-fuzz", "12%", a, b, "null:"], { stdio: ["ignore", "pipe", "pipe"] });
    return 0;
  } catch (e) {
    // compare sale con código 1 cuando hay diferencias; el número va en stderr.
    const n = parseFloat(String(e.stderr).trim().split(/\s/)[0]);
    return Number.isFinite(n) ? n : NaN;
  }
}

const chrome = await abrirChrome();
try {
  for (const vista of vistasArg.split(",")) {
    const ref = JSON.parse(readFileSync(join(REF_MEDIDAS, `${pagina}-${vista}.json`), "utf8"));
    const refFoto = CARPETAS_REF.map((c) => join(c, `${pagina}-${vista}.jpg`)).find((f) => existsSync(f)) ?? "";
    const carpeta = join(SALIDA, `${pagina}-${vista}`);
    mkdirSync(carpeta, { recursive: true });

    const p = await chrome.abrirPagina(BASE + ruta, vista, { esperaMs: 4000 });
    const local = await p.evaluar(MEDIR);
    const { buffer } = await p.capturar({ calidad: 80 });
    const localFoto = join(SALIDA, `${pagina}-${vista}-replica.jpg`);
    writeFileSync(localFoto, buffer);
    writeFileSync(join(SALIDA, `${pagina}-${vista}-replica.json`), JSON.stringify(local, null, 1));
    await p.cerrar();

    const filas = [];
    const n = Math.max(ref.secciones.length, local.secciones.length);
    for (let i = 0; i < n; i++) {
      if (solo && !solo.has(i)) continue;
      const r = ref.secciones[i];
      const l = local.secciones[i];
      if (!r || !l) {
        filas.push({ i, tipo: r?.tipo || l?.tipo || "?", nota: r ? "falta en la réplica" : "sobra en la réplica" });
        continue;
      }
      const [, ry, , rh] = r.caja;
      const [, ly, , lh] = l.caja;
      const ancho = ref.ancho;
      const altoRef = Math.min(rh, 4000);
      const a = join(carpeta, `${i}-vivo.png`);
      const b = join(carpeta, `${i}-replica.png`);
      magick(refFoto, "-crop", `${ancho}x${altoRef}+0+${ry}`, "+repage", a);
      magick(localFoto, "-crop", `${ancho}x${Math.min(lh, 4000)}+0+${ly}`, "+repage", "-resize", `${ancho}x${altoRef}!`, b);
      const pixeles = diferencia(a, b);
      const pct = (100 * pixeles) / (ancho * altoRef);
      magick(a, b, "+append", "-quality", "70", join(carpeta, `${i}.jpg`));
      filas.push({
        i, tipo: r.tipo || r.id.split("__").pop(), local: l.tipo, altoVivo: rh, altoReplica: lh, pct,
        movible: MOVIBLES.test(r.tipo + " " + r.id),
      });
    }

    const lineas = [
      `# Comparación ${pagina} · ${vista} (${new Date().toISOString().slice(0, 16)})`,
      "",
      `Alto de página: en vivo ${ref.altoPagina} px · réplica ${local.altoPagina} px`,
      "",
      "| # | Sección en vivo | En la réplica | Alto vivo | Alto réplica | Diferencia |",
      "|---|---|---|---|---|---|",
      ...filas.map((f) =>
        f.nota
          ? `| ${f.i} | ${f.tipo} | — | | | ${f.nota} |`
          : `| ${f.i} | ${f.tipo} | ${f.local} | ${f.altoVivo} | ${f.altoReplica} | ${f.pct.toFixed(1)} %${f.movible ? " (se mueve sola)" : ""}${Math.abs(f.altoVivo - f.altoReplica) > 4 ? " · alto distinto" : ""} |`,
      ),
    ];
    writeFileSync(join(SALIDA, `${pagina}-${vista}.md`), lineas.join("\n") + "\n");
    console.log(lineas.join("\n"));
    if (!existsSync(refFoto)) console.warn("No hay captura de referencia:", refFoto);
  }
} finally {
  await chrome.cerrar();
}
