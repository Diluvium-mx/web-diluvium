// Descarga las fotos y videos de Diluvium que usa el sitio actual (solo archivos de la tienda, nunca el código del
// tema Shine). Fuentes: el HTML capturado de cada página y la lista de medios del tema.
//
// Uso: npm run medios
// Salida: public/media/<tipo>/<archivo> y herramientas/mapa-medios.json (dirección original → archivo local)

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CAPTURAS = "docs/sitio-actual/capturas/2026-10-31";
const LISTA_TEMA = "docs/sitio-actual/medios.md";
const DESTINO = "public/media";
const MAPA = "herramientas/mapa-medios.json";
const ORIGEN = "https://www.diluvium.com.mx/cdn/shop";
const TIPOS = new Set(["files", "products", "videos", "articles", "collections"]);

const urls = new Set();
const patron = /(?:https?:)?\/\/(?:www\.diluvium\.com\.mx\/cdn\/shop|cdn\.shopify\.com\/s\/files\/[0-9/]+)\/[^"'\s)>,\\]+/g;
for (const archivo of readdirSync(CAPTURAS).filter((f) => f.endsWith(".html"))) {
  for (const u of readFileSync(join(CAPTURAS, archivo), "utf8").match(patron) ?? []) urls.add(u.split("?")[0]);
}
for (const linea of readFileSync(LISTA_TEMA, "utf8").split("\n")) {
  const m = linea.match(/shopify:\/\/shop_images\/(\S+)/);
  if (m) urls.add(`${ORIGEN}/files/${m[1]}`);
}

// Normaliza a https://www.diluvium.com.mx/cdn/shop/<tipo>/<ruta> y se queda solo con medios de la tienda.
const pendientes = new Map();
for (const u of urls) {
  const m = u.match(/\/(?:cdn\/shop|s\/files\/[0-9/]+)\/([a-z]+)\/(.+)$/);
  if (!m || !TIPOS.has(m[1])) continue;
  const [, tipo, ruta] = m;
  const nombre = decodeURIComponent(ruta.split("/").pop());
  pendientes.set(`${ORIGEN}/${tipo}/${ruta}`, join(DESTINO, tipo, nombre));
}

const mapa = existsSync(MAPA) ? JSON.parse(readFileSync(MAPA, "utf8")) : {};
let nuevos = 0;
let fallas = 0;
const cola = [...pendientes.entries()];
async function trabajador() {
  while (cola.length) {
    const [url, local] = cola.shift();
    if (existsSync(local) && statSync(local).size > 0) {
      mapa[url] ??= { local };
      continue;
    }
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh) web-diluvium-replica" } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const tipo = r.headers.get("content-type") ?? "";
      if (tipo.includes("text/html")) throw new Error("devolvió HTML");
      const datos = Buffer.from(await r.arrayBuffer());
      mkdirSync(join(local, ".."), { recursive: true });
      writeFileSync(local, datos);
      mapa[url] = { local, tipo, bytes: datos.length };
      nuevos++;
    } catch (e) {
      fallas++;
      mapa[url] = { local, error: String(e.message ?? e) };
    }
  }
}
await Promise.all(Array.from({ length: 4 }, trabajador));
writeFileSync(MAPA, JSON.stringify(mapa, null, 2));
console.log(`${pendientes.size} medios · ${nuevos} descargados ahora · ${fallas} con falla`);
