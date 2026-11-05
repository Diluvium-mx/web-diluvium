// Ancho y alto de todas las fotos de public/media, leídos de su cabecera (PNG, JPG, WebP, GIF), en
// contenido/medidas-imagenes.json. La página los usa para reservar el espacio de cada foto sin leer archivos al momento
// de la visita (en Cloudflare no se puede). Corre solo antes de construir (npm run build) y se puede correr a mano.
//
// Uso: node herramientas/medidas-imagenes.mjs

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const PUBLICO = join(RAIZ, "public");
const SALIDA = join(RAIZ, "contenido/medidas-imagenes.json");

function medidas(b) {
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString("ascii", 0, 3) === "GIF") return [b.readUInt16LE(6), b.readUInt16LE(8)];
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 12, 15) === "VP8") {
    const tipo = b.toString("ascii", 12, 16);
    if (tipo === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (tipo === "VP8L") {
      const bits = b.readUInt32LE(21);
      return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
    }
    return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const marca = b[i + 1];
      if (marca >= 0xc0 && marca <= 0xcf && marca !== 0xc4 && marca !== 0xc8 && marca !== 0xcc) {
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

const resultado = {};
for (const entrada of readdirSync(join(PUBLICO, "media"), { recursive: true, withFileTypes: true })) {
  if (!entrada.isFile() || !/\.(png|jpe?g|webp|gif)$/i.test(entrada.name)) continue;
  const archivo = join(entrada.parentPath, entrada.name);
  const ruta = "/" + relative(PUBLICO, archivo).split(sep).join("/");
  // Las copias del administrador (public/media/admin) solo existen en esta Mac: no se guardan.
  if (ruta.startsWith("/media/admin/")) continue;
  const m = medidas(readFileSync(archivo));
  if (m) resultado[ruta] = m;
}
const ordenado = Object.fromEntries(Object.entries(resultado).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(SALIDA, JSON.stringify(ordenado, null, 1) + "\n");
console.log(`${Object.keys(ordenado).length} fotos medidas → contenido/medidas-imagenes.json`);
