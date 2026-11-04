// Compara lo que leen Google y las redes (título, descripción, canónica, Open Graph, Twitter y datos estructurados)
// entre la réplica y las capturas del sitio en vivo, página por página.
//
// Uso: node herramientas/comparar-seo.mjs [pagina,pagina…]   (sin nada: las 34 páginas de capturar-sitio.mjs)
// Requiere la réplica en http://localhost:3100 (npm run dev). Sale en pantalla; código 1 si algo no coincide.

import { readFileSync } from "node:fs";

const BASE = process.env.REPLICA_URL ?? "http://localhost:3100";
const CAPTURAS = "docs/sitio-actual/capturas/2026-11-03";
const SITIO = "https://www.diluvium.com.mx";

const lista = readFileSync("herramientas/capturar-sitio.mjs", "utf8").split("const PAGINAS = {")[1].split("};")[0];
const PAGINAS = Object.fromEntries([...lista.matchAll(/(?:"([^"]+)"|(\w[\w-]*)):\s*"([^"]+)"/g)].map((m) => [m[1] ?? m[2], m[3]]));
const solo = process.argv[2]?.split(",");

const desescapar = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
// Las fotos cambian de casa (CDN de Shopify → /media), así que se comparan por nombre de archivo.
const archivo = (u) => (u ? u.split("?")[0].split("/").pop() : u);
const ruta = (u) => (u ? u.replace(SITIO, "").replace(/^http:\/\/www\.diluvium\.com\.mx/, "") || "/" : u);

function cabeza(html) {
  const head = html.split("</head>")[0];
  const meta = (k) => {
    const m = head.match(new RegExp(`<meta\\s+(?:name|property)="${k.replace(/[.:]/g, "\\$&")}"\\s+content="([^"]*)"`));
    // Una descripción vacía (content="") es lo mismo que no tenerla.
    return m ? desescapar(m[1]).replace(/\s+/g, " ").trim() || null : null;
  };
  const titulo = head.match(/<title>([\s\S]*?)<\/title>/);
  const canonica = head.match(/<link rel="canonical" href="([^"]+)"/);
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const producto = ld.find((d) => d["@type"] === "Product");
  return {
    titulo: titulo ? desescapar(titulo[1]).replace(/\s+/g, " ").trim() : null,
    descripcion: meta("description"),
    canonica: ruta(canonica?.[1]),
    "og:type": meta("og:type"),
    "og:url": ruta(meta("og:url")),
    "og:title": meta("og:title"),
    "og:description": meta("og:description"),
    "og:image": archivo(meta("og:image:secure_url") ?? meta("og:image")),
    "og:image:width": meta("og:image:width"),
    "og:image:height": meta("og:image:height"),
    "og:price:amount": meta("og:price:amount"),
    "og:price:currency": meta("og:price:currency"),
    "twitter:card": meta("twitter:card"),
    "twitter:title": meta("twitter:title"),
    "twitter:description": meta("twitter:description"),
    "ld:tipos": ld.map((d) => d["@type"]).sort().join(","),
    "ld:producto": producto
      ? JSON.stringify({
          name: producto.name,
          url: producto.url,
          image: (producto.image ?? []).map(archivo),
          offers: producto.offers.map((o) => [o.availability, Number(o.price), o.priceCurrency, o.url, o.gtin13 ?? null]),
        })
      : null,
    "ld:articulo": (() => {
      const a = ld.find((d) => d["@type"] === "Article");
      return a ? JSON.stringify({ headline: a.headline, datePublished: a.datePublished, image: (a.image ?? []).map(archivo), author: a.author }) : null;
    })(),
  };
}

let fallas = 0;
for (const [nombre, r] of Object.entries(PAGINAS)) {
  if (solo && !solo.includes(nombre)) continue;
  const vivo = cabeza(readFileSync(`${CAPTURAS}/${nombre}.html`, "utf8"));
  const replica = cabeza(await (await fetch(BASE + r)).text());
  const distintas = Object.keys(vivo).filter((k) => vivo[k] !== replica[k]);
  if (!distintas.length) {
    console.log(`✓ ${nombre}`);
    continue;
  }
  fallas++;
  console.log(`✗ ${nombre}`);
  for (const k of distintas) console.log(`    ${k}\n      vivo:    ${vivo[k]}\n      réplica: ${replica[k]}`);
}
console.log(fallas ? `\n${fallas} páginas con diferencias` : "\nTodas iguales");
process.exit(fallas ? 1 : 0);
