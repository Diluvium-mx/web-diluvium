// Catálogo de productos desde las fichas públicas de la tienda (/products/<nombre>.json), con pausas para no chocar
// con el límite de Shopify. Descarga las fotos que falten. Solo datos públicos de la tienda, nada de clientes.
//
// Uso: node herramientas/catalogo.mjs
// Salida: contenido/productos.json y fotos en public/media/products/ o public/media/files/

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://www.diluvium.com.mx";
const NOMBRES = [
  "compuerta-anti-inundaciones",
  "compuerta-anti-inundaciones-hecha-a-la-medida",
  "mini-compuerta",
  "tapon-inflable-anti-inundaciones",
  "funda-de-repuesto-compuerta-anti-inundaciones",
  "accesorio-tira-de-hule-de-repuesto",
  "accesorio-plastilina-de-secado-rapido",
];
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh) web-diluvium-replica" };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedir(url, intentos = 5) {
  for (let i = 0; i < intentos; i++) {
    const r = await fetch(url, { headers: UA });
    const t = await r.text();
    if (t.startsWith("{")) return JSON.parse(t);
    await espera(8000 * (i + 1));
  }
  throw new Error(`Sin respuesta válida: ${url}`);
}

async function foto(src) {
  const limpio = src.split("?")[0].replace(/^\/\//, "https://");
  const m = limpio.match(/\/(files|products)\/([^/]+)$/);
  const tipo = m?.[1] ?? "files";
  const nombre = decodeURIComponent(m?.[2] ?? limpio.split("/").pop());
  const local = join("public/media", tipo, nombre);
  if (!existsSync(local)) {
    const r = await fetch(limpio, { headers: UA });
    if (!r.ok) throw new Error(`Foto ${r.status}: ${limpio}`);
    mkdirSync(join("public/media", tipo), { recursive: true });
    writeFileSync(local, Buffer.from(await r.arrayBuffer()));
  }
  return `/media/${tipo}/${nombre}`;
}

const productos = [];
for (const nombre of NOMBRES) {
  const { product: p } = await pedir(`${BASE}/products/${nombre}.json`);
  const imagenes = [];
  for (const img of p.images) {
    imagenes.push({ src: await foto(img.src), alt: img.alt ?? p.title, ancho: img.width, alto: img.height, variantes: img.variant_ids });
  }
  productos.push({
    id: p.id,
    nombre: p.handle,
    titulo: p.title,
    plantilla: p.template_suffix || "",
    descripcionHtml: p.body_html ?? "",
    tipo: p.product_type,
    etiquetas: p.tags,
    opciones: p.options.map((o) => ({ nombre: o.name, valores: o.values })),
    variantes: p.variants.map((v) => ({
      id: v.id, titulo: v.title, precio: Number(v.price), precioAntes: v.compare_at_price ? Number(v.compare_at_price) : null,
      opcion1: v.option1, sku: v.sku, imagen: v.image_id,
    })),
    imagenes,
  });
  console.log(`${p.handle}: ${p.variants.length} variantes, ${imagenes.length} fotos`);
  await espera(4000);
}
writeFileSync("contenido/productos.json", JSON.stringify({ _fuente: `${BASE}/products/<nombre>.json (${new Date().toISOString().slice(0, 10)})`, productos }, null, 1));
