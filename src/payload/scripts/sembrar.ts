// Carga al administrador todo el contenido de contenido/*.json (productos, reseñas, páginas, blog, colecciones, menús,
// fichas para Google y las secciones de cada plantilla), con sus fotos y videos.
//
// Uso: npm run admin:sembrar             (solo si el administrador está vacío)
//      npm run admin:sembrar -- --desde-cero   (borra la base local y las fotos subidas, y carga todo de nuevo)
// Solo para esta Mac: en el hosting la base se llena una vez con esto y después se edita en el administrador.

import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { getPayload, type Payload } from "payload";
import config from "../../payload.config";
import { ESQUEMA, type CampoEsquema } from "../secciones";
import { CONTENIDO, PLANTILLAS, RAIZ, esMedio, leer, seccionPorTipo } from "./comun";

type Dic = Record<string, unknown>;
type Seccion = { id: string; tipo: string; ajustes: Dic; bloques: { id: string; tipo: string; ajustes: Dic }[] };

const desdeCero = process.argv.includes("--desde-cero");
if (desdeCero) {
  const base = (process.env.DATABASE_URL ?? "").replace(/^file:/, "");
  if (base && !base.includes("://")) rmSync(path.resolve(RAIZ, base), { force: true });
  rmSync(path.join(RAIZ, "public/media/admin"), { recursive: true, force: true });
}

const payload: Payload = await getPayload({ config });
if (!desdeCero && (await payload.count({ collection: "productos" })).totalDocs > 0) {
  console.error("El administrador ya tiene contenido. Para cargar todo de nuevo: npm run admin:sembrar -- --desde-cero");
  process.exit(1);
}

// Fotos y videos: uno por archivo de public/, aunque lo usen varias páginas (se guarda la promesa para que dos
// cargas al mismo tiempo del mismo archivo no lo suban dos veces).
const medios = new Map<string, Promise<number>>();
async function medio(ruta: unknown, alt = ""): Promise<number | null> {
  if (typeof ruta !== "string" || !ruta) return null;
  const limpia = ruta.split("?")[0];
  if (!medios.has(limpia)) {
    const archivo = path.join(RAIZ, "public", decodeURIComponent(limpia));
    if (!existsSync(archivo)) throw new Error(`No existe el archivo ${archivo}`);
    medios.set(limpia, payload.create({ collection: "medios", data: { alt, ruta: limpia }, filePath: archivo }).then((d) => d.id as number));
  }
  return medios.get(limpia)!;
}

/** Ajustes del tema → datos del bloque: fotos y videos como referencia; el orden original va en «claves». */
async function ajustes(valores: Dic, campos: CampoEsquema[]) {
  const tipos = new Map(campos.map((c) => [c.clave, c.tipo]));
  const datos: Dic = { claves: Object.keys(valores) };
  for (const [clave, valor] of Object.entries(valores)) {
    datos[clave] = esMedio(tipos.get(clave) ?? "") ? await medio(valor) : valor;
  }
  return datos;
}

// --- Productos -----------------------------------------------------------------------------------------------------
type Producto = {
  id: number; nombre: string; titulo: string; plantilla: string; descripcionHtml: string; tipo: string; etiquetas: string;
  proveedor: string; opciones: { nombre: string; valores: string[] }[];
  variantes: { id: number; titulo: string; precio: number; precioAntes: number | null; opcion1: string; sku: string;
    codigoBarras: string; existencias: number | null; imagen: string | null }[];
  imagenes: { src: string; alt: string; ancho: number; alto: number }[];
  videos: { posicion: number; src: string; poster: string }[];
};
const productos = leer<{ _fuente: string; productos: Producto[] }>("productos.json");
const idProducto = new Map<string, number>();
for (const [i, p] of productos.productos.entries()) {
  const doc = await payload.create({
    collection: "productos",
    data: {
      titulo: p.titulo, nombre: p.nombre, plantilla: (p.plantilla || "basica") as never, descripcionHtml: p.descripcionHtml, proveedor: p.proveedor,
      tipo: p.tipo, etiquetas: p.etiquetas, orden: i, idProducto: p.id,
      opciones: p.opciones.map((o) => ({ nombre: o.nombre, valores: o.valores.map((valor) => ({ valor })) })),
      variantes: await Promise.all(p.variantes.map(async (v) => ({
        titulo: v.titulo, precio: v.precio, precioAntes: v.precioAntes, existencias: v.existencias, opcion1: v.opcion1,
        codigoBarras: v.codigoBarras, sku: v.sku, imagen: await medio(v.imagen), idVariante: v.id,
      }))),
      imagenes: await Promise.all(p.imagenes.map(async (img) => ({
        imagen: (await medio(img.src, img.alt))!, alt: img.alt, ancho: img.ancho, alto: img.alto,
      }))),
      videos: await Promise.all(p.videos.map(async (v) => ({
        video: (await medio(v.src))!, portada: (await medio(v.poster))!, posicion: v.posicion,
      }))),
    },
  });
  idProducto.set(`/products/${p.nombre}`, doc.id as number);
}
console.log(`${productos.productos.length} productos`);

// --- Reseñas y carrusel ----------------------------------------------------------------------------------------------
type Resena = { nombre: string; calificacion: number; texto: string; fotos: string[]; variasFotos?: boolean;
  producto: { titulo: string; url: string } | null };
const resenas = leer<{ fuente: string; carrusel: { resumen: Dic; filas: Resena[][] }; pagina: Resena[] }>("resenas.json");
const idResena = new Map<string, number>();
for (const [i, r] of resenas.pagina.entries()) {
  const doc = await payload.create({
    collection: "resenas",
    data: {
      nombre: r.nombre, calificacion: r.calificacion, texto: r.texto, variasFotos: Boolean(r.variasFotos), orden: i,
      publicada: true, producto: r.producto ? idProducto.get(r.producto.url) : null,
      fotos: await Promise.all(r.fotos.map(async (f) => ({ foto: (await medio(f))! }))),
    },
  });
  idResena.set(`${r.nombre}\n${r.texto}`, doc.id as number);
}
const fila = async (lista: Resena[]) =>
  Promise.all(lista.map(async (r) => {
    const id = idResena.get(`${r.nombre}\n${r.texto}`);
    if (!id) throw new Error(`Reseña del carrusel sin pareja en la lista: ${r.nombre}`);
    return { resena: id, foto: await medio(r.fotos[0]) };
  }));
await payload.updateGlobal({
  slug: "carrusel-resenas",
  data: { resumen: resenas.carrusel.resumen, fila1: await fila(resenas.carrusel.filas[0]), fila2: await fila(resenas.carrusel.filas[1]) },
});
console.log(`${resenas.pagina.length} reseñas`);

// --- Blog, páginas y políticas ---------------------------------------------------------------------------------------
type Articulo = { titulo: string; url: string; fecha: string; resumen: string; imagen: { src: string; alt: string; ancho: number; alto: number } | null;
  slug: string; autor: string; publicado: string; etiquetas: unknown[]; anterior: string | null; siguiente: string | null;
  seo: { titulo: string; descripcion: string }; cuerpo: string };
const blog = leer<{ fuente: string; articulos: Articulo[] }>("blog.json");
for (const [i, a] of blog.articulos.entries()) {
  await payload.create({
    collection: "articulos",
    data: {
      titulo: a.titulo, slug: a.slug, resumen: a.resumen, cuerpo: a.cuerpo, autor: a.autor, fecha: a.fecha, publicado: a.publicado,
      etiquetas: a.etiquetas, anterior: a.anterior, siguiente: a.siguiente, seo: a.seo, orden: i,
      imagen: a.imagen ? { foto: await medio(a.imagen.src, a.imagen.alt), alt: a.imagen.alt, ancho: a.imagen.ancho, alto: a.imagen.alto } : {},
    },
  });
}
type PaginaSimple = { ruta: string; titulo: string; nombre: string; tituloVisible: string; cuerpo: string };
for (const [archivo, coleccion, clave] of [["paginas.json", "paginas", "paginas"], ["politicas.json", "politicas", "politicas"]] as const) {
  const datos = leer<Record<string, PaginaSimple[]>>(archivo);
  for (const [i, p] of datos[clave].entries()) {
    await payload.create({ collection: coleccion, data: { titulo: p.titulo, nombre: p.nombre, tituloVisible: p.tituloVisible, cuerpo: p.cuerpo, orden: i } });
  }
}
console.log(`${blog.articulos.length} artículos, páginas y políticas`);

// --- Colecciones -----------------------------------------------------------------------------------------------------
type Coleccion = { nombre: string; titulo: string; descripcionHtml: string; imagenCompartir: string; orden: string;
  precioMaximo: number; productos: string[]; ordenes: Dic; imagen: string };
const colecciones = leer<{ fuente: string; lista: string[]; colecciones: Coleccion[] }>("colecciones.json");
for (const [i, c] of colecciones.colecciones.entries()) {
  const lugar = colecciones.lista.indexOf(c.nombre);
  await payload.create({
    collection: "colecciones",
    data: {
      titulo: c.titulo, nombre: c.nombre, descripcionHtml: c.descripcionHtml, imagen: await medio(c.imagen),
      imagenCompartir: await medio(c.imagenCompartir), ordenPredeterminado: c.orden as never, precioMaximo: c.precioMaximo,
      ordenes: c.ordenes, enLista: lugar < 0 ? null : lugar, orden: i,
      productos: c.productos.map((n) => idProducto.get(`/products/${n}`)!),
    },
  });
}
console.log(`${colecciones.colecciones.length} colecciones`);

// --- Fichas para Google ----------------------------------------------------------------------------------------------
type Ficha = { titulo: string; descripcion: string | null; canonica: string | null;
  og: { tipo: string | null; titulo: string | null; descripcion: string | null; imagen: string | null; ancho: number | null; alto: number | null };
  twitter: { tarjeta: string | null; titulo: string | null; descripcion: string | null } };
const seo = leer<{ paginas: Record<string, Ficha>; articulos: Dic; organizacion: Dic; sitioWeb: Dic }>("seo.json");
for (const [i, [ruta, f]] of Object.entries(seo.paginas).entries()) {
  await payload.create({
    collection: "fichas-seo",
    data: { ruta, titulo: f.titulo, descripcion: f.descripcion, canonica: f.canonica, twitter: f.twitter, orden: i,
      og: { ...f.og, imagen: await medio(f.og.imagen) } },
  });
}
await payload.updateGlobal({ slug: "datos-google", data: { organizacion: seo.organizacion, sitioWeb: seo.sitioWeb, articulos: seo.articulos } });
console.log(`${Object.keys(seo.paginas).length} fichas para Google`);

// --- Menús y ajustes del tema ----------------------------------------------------------------------------------------
const menus = leer<Dic>("menus.json");
await payload.updateGlobal({ slug: "menus", data: { principal: menus.principal, pie: menus.pie, redes: menus.redes } as never });
await payload.updateGlobal({ slug: "ajustes-tema", data: (await ajustes(leer<Dic>("tema/ajustes.json"), ESQUEMA.ajustesTema)) as never });

// --- Plantillas: secciones de cada página ----------------------------------------------------------------------------
// Nombre corto de cada sección en la lista del administrador: su primer título o texto (sin formato).
function nombreCorto(s: { ajustes: Dic; bloques?: { ajustes: Dic }[] }): string | undefined {
  for (const fuente of [s.ajustes, ...(s.bloques ?? []).map((b) => b.ajustes)]) {
    for (const clave of ["heading", "title", "subheading", "text", "description", "content", "button_label"]) {
      const v = fuente[clave];
      if (typeof v === "string" && v.trim()) {
        const limpio = v.replace(/<[^>]+>/g, " ").replace(/[[\]]/g, "").replace(/\s+/g, " ").trim();
        if (limpio) return limpio.length > 50 ? `${limpio.slice(0, 50)}…` : limpio;
      }
    }
  }
  return undefined;
}

for (const [i, [archivo, titulo]] of Object.entries(PLANTILLAS).entries()) {
  if (!existsSync(path.join(CONTENIDO, "tema", `${archivo}.json`))) continue;
  const plantilla = leer<{ fuente: string; secciones: Seccion[] }>(`tema/${archivo}.json`);
  const secciones = [];
  for (const s of plantilla.secciones) {
    const esquema = seccionPorTipo(s.tipo);
    const bloques = [];
    for (const b of s.bloques) {
      const eb = esquema.bloques.find((x) => x.tipo === b.tipo)!;
      bloques.push({ blockType: eb.slug, blockName: nombreCorto({ ajustes: b.ajustes }), idTema: b.id, ...(await ajustes(b.ajustes, eb.campos)) });
    }
    secciones.push({ blockType: esquema.slug, blockName: nombreCorto(s), idTema: s.id, ...(await ajustes(s.ajustes, esquema.campos)), ...(esquema.bloques.length ? { bloques } : {}) });
  }
  await payload.create({ collection: "plantillas", data: { titulo, archivo, orden: i, secciones: secciones as never } });
}
console.log(`${Object.keys(PLANTILLAS).length} plantillas`);

// --- De dónde salió cada archivo -------------------------------------------------------------------------------------
const fuentes: Dic = {
  "productos.json": productos._fuente, "resenas.json": resenas.fuente, "blog.json": blog.fuente,
  "paginas.json": leer<Dic>("paginas.json").fuente, "politicas.json": leer<Dic>("politicas.json").fuente,
  "colecciones.json": colecciones.fuente, "menus.json": menus._fuente,
};
for (const archivo of Object.keys(PLANTILLAS)) {
  if (existsSync(path.join(CONTENIDO, "tema", `${archivo}.json`))) fuentes[`tema/${archivo}.json`] = leer<Dic>(`tema/${archivo}.json`).fuente;
}
await payload.updateGlobal({ slug: "fuentes", data: { datos: fuentes } });

console.log(`${medios.size} fotos y videos. Listo.`);
process.exit(0);
