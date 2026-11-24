// ¿Qué videos de public/media tienen sonido de verdad? (dueño, 23-nov-2026: al «video automático» se le quita el botón
// de sonido cuando el video no tiene sonido). Casi todos los videos traen pista de audio, aunque esté callada (Shopify
// les pone una al convertirlos), así que se mide el volumen más alto con ffmpeg: abajo de -45 dB es solo ruido y el
// video cuenta como «sin sonido». Lo guarda en contenido/videos-sonido.json, que la página lee al construir.
//
// Solo mide los videos nuevos o que cambiaron de tamaño. Si no hay ffmpeg, no cambia nada y la página muestra el botón
// de sonido como siempre. Corre antes de construir (npm run build), al subir un video en el editor y a mano:
//   node herramientas/videos-sonido.mjs

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative, sep } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const PUBLICO = join(RAIZ, "public");
const SALIDA = join(RAIZ, "contenido/videos-sonido.json");
const UMBRAL_DB = -45;

function videos(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) return videos(ruta);
    return /\.(mp4|webm|mov)$/i.test(e.name) ? [ruta] : [];
  });
}

/** Volumen más alto en dB, o null si no tiene audio. undefined si ffmpeg no está. */
function volumenMaximo(ruta) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", ruta, "-map", "0:a:0?", "-af", "volumedetect", "-f", "null", "-"], {
    encoding: "utf8",
    timeout: 120_000,
  });
  if (r.error) return undefined;
  const m = (r.stderr ?? "").match(/max_volume:\s*(-?[\d.]+) dB/);
  return m ? Number(m[1]) : null;
}

const previo = existsSync(SALIDA) ? JSON.parse(readFileSync(SALIDA, "utf8")).videos ?? {} : {};
const salida = {};
let medidos = 0;
let sinFfmpeg = false;

for (const ruta of videos(join(PUBLICO, "media")).sort()) {
  const clave = "/" + relative(PUBLICO, ruta).split(sep).join("/");
  const bytes = statSync(ruta).size;
  if (previo[clave]?.bytes === bytes) {
    salida[clave] = previo[clave];
    continue;
  }
  if (sinFfmpeg) continue;
  const db = volumenMaximo(ruta);
  if (db === undefined) {
    sinFfmpeg = true;
    continue;
  }
  medidos++;
  salida[clave] = { bytes, sonido: db !== null && db > UMBRAL_DB, ...(db !== null ? { maximoDb: db } : {}) };
}

writeFileSync(
  SALIDA,
  JSON.stringify(
    { fuente: "herramientas/videos-sonido.mjs: volumen más alto de cada video (abajo de -45 dB = sin sonido)", videos: salida },
    null,
    1,
  ) + "\n",
);
console.log(`${Object.keys(salida).length} videos (${medidos} medidos ahora)${sinFfmpeg ? " · sin ffmpeg: los nuevos quedan con botón de sonido" : ""}`);
