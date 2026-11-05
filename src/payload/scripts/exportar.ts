// Escribe lo que hay en el administrador en contenido/*.json, que es lo que la página lee al construirse. Al publicar,
// corre antes de cada construcción (y cada cambio guardado en el administrador lanza una construcción nueva).
//
// Uso: npm run admin:exportar                     (escribe en contenido/)
//      npm run admin:exportar -- --en <carpeta>   (escribe en otra carpeta, p. ej. para comparar)

import path from "node:path";
import { getPayload, type Payload } from "payload";
import config from "../../payload.config";
import { ESQUEMA, type CampoEsquema } from "../secciones";
import { CONTENIDO, PLANTILLAS, RAIZ, escribir, esMedio, seccionPorSlug, tituloResena } from "./comun";

type Dic = Record<string, unknown>;
type Doc = Dic & { id: number | string };

const argEn = process.argv.indexOf("--en");
const SALIDA = argEn > 0 ? path.resolve(RAIZ, process.argv[argEn + 1]) : CONTENIDO;

const payload: Payload = await getPayload({ config });
const todos = async (collection: Parameters<Payload["find"]>[0]["collection"]) =>
  (await payload.find({ collection, pagination: false, depth: 0, sort: collection === "plantillas" ? "id" : "orden" })).docs as unknown as Doc[];
const global = async (slug: Parameters<Payload["findGlobal"]>[0]["slug"]) => (await payload.findGlobal({ slug, depth: 0 })) as unknown as Dic;

// Fotos y videos: las que ya estaban conservan su dirección; las subidas después van en /media/admin/<archivo>.
const medios = new Map<number | string, { ruta: string; ancho: number | null; alto: number | null }>();
for (const m of await todos("medios")) {
  medios.set(m.id, { ruta: (m.ruta as string) || `/media/admin/${m.filename as string}`, ancho: (m.width as number) ?? null, alto: (m.height as number) ?? null });
}
const ruta = (id: unknown) => (id == null ? null : (medios.get(id as number)?.ruta ?? null));
const txt = (v: unknown) => (v == null ? "" : String(v));
const num = (v: unknown) => (v == null || v === "" ? null : Number(v));
const fuentes = ((await global("fuentes")).datos ?? {}) as Dic;

/** Datos de un bloque → ajustes del tema, en el orden original de sus claves (las nuevas van al final). */
function ajustes(datos: Dic, campos: CampoEsquema[]): Dic {
  const tipos = new Map(campos.map((c) => [c.clave, c.tipo]));
  const claves = [...((datos.claves as string[]) ?? [])];
  for (const c of campos) if (!claves.includes(c.clave) && datos[c.clave] != null && datos[c.clave] !== "") claves.push(c.clave);
  const salida: Dic = {};
  for (const clave of claves) {
    const tipo = tipos.get(clave) ?? "texto";
    const v = datos[clave];
    if (esMedio(tipo)) salida[clave] = ruta(v) ?? "";
    else if (tipo === "siNo") salida[clave] = Boolean(v);
    else if (tipo === "numero") salida[clave] = num(v) ?? 0;
    else if (tipo === "json") salida[clave] = v ?? [];
    else salida[clave] = txt(v);
  }
  return salida;
}

// --- Productos -------------------------------------------------------------------------------------------------------
const docsProductos = await todos("productos");
const nombreProducto = new Map(docsProductos.map((p) => [p.id, p.nombre as string]));
const tituloProducto = new Map(docsProductos.map((p) => [p.id, p.titulo as string]));
let siguienteVariante = Math.max(0, ...docsProductos.flatMap((p) => ((p.variantes as Dic[]) ?? []).map((v) => Number(v.idVariante) || 0)));
escribir(SALIDA, "productos.json", {
  _fuente: fuentes["productos.json"],
  productos: docsProductos.map((p) => ({
    id: num(p.idProducto) ?? Number(p.id),
    nombre: p.nombre,
    titulo: p.titulo,
    plantilla: p.plantilla === "basica" ? "" : txt(p.plantilla),
    descripcionHtml: txt(p.descripcionHtml),
    tipo: txt(p.tipo),
    etiquetas: txt(p.etiquetas),
    opciones: ((p.opciones as Dic[]) ?? []).map((o) => ({ nombre: txt(o.nombre), valores: ((o.valores as Dic[]) ?? []).map((v) => txt(v.valor)) })),
    // Un tamaño nuevo recibe el número siguiente (va en ?variant=… y en el carrito).
    variantes: ((p.variantes as Dic[]) ?? []).map((v) => ({
      id: num(v.idVariante) ?? ++siguienteVariante,
      titulo: txt(v.titulo),
      precio: num(v.precio) ?? 0,
      precioAntes: num(v.precioAntes),
      opcion1: txt(v.opcion1),
      // Sin SKU en la tienda es «null» (no texto vacío): se deja igual.
      sku: (v.sku as string | null) ?? null,
      codigoBarras: txt(v.codigoBarras),
      imagen: ruta(v.imagen),
      existencias: num(v.existencias),
    })),
    imagenes: ((p.imagenes as Dic[]) ?? []).map((i) => ({
      src: ruta(i.imagen),
      alt: txt(i.alt),
      ancho: num(i.ancho) ?? medios.get(i.imagen as number)?.ancho ?? 1000,
      alto: num(i.alto) ?? medios.get(i.imagen as number)?.alto ?? 1000,
      variantes: [],
    })),
    proveedor: txt(p.proveedor),
    videos: ((p.videos as Dic[]) ?? []).map((v) => ({ posicion: num(v.posicion) ?? 0, src: ruta(v.video), poster: ruta(v.portada) })),
  })),
});

// --- Reseñas -----------------------------------------------------------------------------------------------------------
const docsResenas = (await todos("resenas")).filter((r) => r.publicada !== false);
const resenaPorId = new Map(docsResenas.map((r) => [r.id, r]));
const resena = (r: Doc, fotos: (string | null)[]) => ({
  nombre: r.nombre,
  calificacion: num(r.calificacion),
  texto: txt(r.texto),
  fotos: fotos.filter(Boolean),
});
const carrusel = await global("carrusel-resenas");
const fila = (lista: unknown) =>
  ((lista as Dic[]) ?? []).filter((f) => resenaPorId.has(f.resena as number)).map((f) => resena(resenaPorId.get(f.resena as number)!, [ruta(f.foto)]));
escribir(SALIDA, "resenas.json", {
  fuente: fuentes["resenas.json"],
  carrusel: { resumen: carrusel.resumen, filas: [fila(carrusel.fila1), fila(carrusel.fila2)] },
  pagina: docsResenas.map((r) => ({
    ...resena(r, ((r.fotos as Dic[]) ?? []).map((f) => ruta(f.foto))),
    producto: r.producto ? { titulo: tituloResena(tituloProducto.get(r.producto as number) ?? ""), url: `/products/${nombreProducto.get(r.producto as number)}` } : null,
    ...(r.variasFotos ? { variasFotos: true } : {}),
  })),
});

// --- Blog, páginas y políticas ---------------------------------------------------------------------------------------
escribir(SALIDA, "blog.json", {
  fuente: fuentes["blog.json"],
  articulos: (await todos("articulos")).map((a) => {
    const img = (a.imagen ?? {}) as Dic;
    return {
      titulo: a.titulo,
      url: `/blogs/blog/${a.slug as string}`,
      fecha: txt(a.fecha),
      resumen: txt(a.resumen),
      imagen: img.foto
        ? { src: ruta(img.foto), alt: txt(img.alt), ancho: num(img.ancho) ?? medios.get(img.foto as number)?.ancho, alto: num(img.alto) ?? medios.get(img.foto as number)?.alto }
        : null,
      slug: a.slug,
      autor: txt(a.autor),
      publicado: txt(a.publicado),
      etiquetas: a.etiquetas ?? [],
      anterior: (a.anterior as string) || null,
      siguiente: (a.siguiente as string) || null,
      seo: { titulo: txt((a.seo as Dic)?.titulo), descripcion: txt((a.seo as Dic)?.descripcion) },
      cuerpo: txt(a.cuerpo),
    };
  }),
});
for (const [archivo, coleccion, prefijo] of [["paginas.json", "paginas", "/pages/"], ["politicas.json", "politicas", "/policies/"]] as const) {
  escribir(SALIDA, archivo, {
    fuente: fuentes[archivo],
    [coleccion]: (await todos(coleccion)).map((p) => ({
      ruta: `${prefijo}${p.nombre as string}`,
      titulo: p.titulo,
      nombre: p.nombre,
      tituloVisible: txt(p.tituloVisible),
      cuerpo: txt(p.cuerpo),
    })),
  });
}

// --- Colecciones -----------------------------------------------------------------------------------------------------
const docsColecciones = await todos("colecciones");
escribir(SALIDA, "colecciones.json", {
  fuente: fuentes["colecciones.json"],
  lista: docsColecciones.filter((c) => c.enLista != null).sort((a, b) => Number(a.enLista) - Number(b.enLista)).map((c) => c.nombre),
  colecciones: docsColecciones.map((c) => {
    const productos = ((c.productos as (number | string)[]) ?? []).map((id) => nombreProducto.get(id)).filter((n): n is string => Boolean(n));
    // Cada orden guardado de la tienda: sin los productos borrados y con los nuevos al final.
    const ordenes: Record<string, string[]> = {};
    for (const [clave, lista] of Object.entries((c.ordenes ?? {}) as Record<string, string[]>)) {
      const vigentes = lista.filter((n) => productos.includes(n));
      ordenes[clave] = [...vigentes, ...productos.filter((n) => !vigentes.includes(n))];
    }
    return {
      nombre: c.nombre,
      titulo: c.titulo,
      descripcionHtml: txt(c.descripcionHtml),
      imagenCompartir: ruta(c.imagenCompartir) ?? "",
      orden: txt(c.ordenPredeterminado),
      precioMaximo: num(c.precioMaximo),
      productos,
      ordenes,
      // Las colecciones sin imagen (como «all») no llevan la clave.
      ...(c.imagen ? { imagen: ruta(c.imagen) } : {}),
    };
  }),
});

// --- Fichas para Google ------------------------------------------------------------------------------------------------
const datosGoogle = await global("datos-google");
const fichas: Dic = {};
for (const f of await todos("fichas-seo")) {
  const og = (f.og ?? {}) as Dic;
  const tw = (f.twitter ?? {}) as Dic;
  fichas[f.ruta as string] = {
    titulo: f.titulo,
    descripcion: (f.descripcion as string | null) ?? null,
    canonica: (f.canonica as string | null) ?? null,
    og: { tipo: og.tipo ?? null, titulo: og.titulo ?? null, descripcion: og.descripcion ?? null, imagen: ruta(og.imagen), ancho: num(og.ancho), alto: num(og.alto) },
    twitter: { tarjeta: tw.tarjeta ?? null, titulo: tw.titulo ?? null, descripcion: tw.descripcion ?? null },
  };
}
escribir(SALIDA, "seo.json", { paginas: fichas, articulos: datosGoogle.articulos, organizacion: datosGoogle.organizacion, sitioWeb: datosGoogle.sitioWeb });

// --- Menús y ajustes del tema ----------------------------------------------------------------------------------------
const menus = await global("menus");
const menu = (m: unknown) => {
  const d = (m ?? {}) as Dic;
  return { titulo: txt(d.titulo), enlaces: ((d.enlaces as Dic[]) ?? []).map((e) => ({ texto: txt(e.texto), url: txt(e.url) })) };
};
escribir(SALIDA, "menus.json", {
  _fuente: fuentes["menus.json"],
  principal: menu(menus.principal),
  pie: menu(menus.pie),
  redes: ((menus.redes as Dic[]) ?? []).map((r) => ({ red: txt(r.red), url: txt(r.url) })),
});
escribir(SALIDA, "tema/ajustes.json", ajustes(await global("ajustes-tema"), ESQUEMA.ajustesTema));

// --- Plantillas ----------------------------------------------------------------------------------------------------------
const aleatorio = () => Math.random().toString(36).slice(2, 8);
for (const p of await todos("plantillas")) {
  const archivo = p.archivo as string;
  if (!(archivo in PLANTILLAS)) continue;
  const secciones = ((p.secciones as Dic[]) ?? []).map((s) => {
    const esquema = seccionPorSlug(s.blockType as string);
    return {
      id: (s.idTema as string) || `${esquema.tipo.replace(/-/g, "_")}_${aleatorio()}`,
      tipo: esquema.tipo,
      ajustes: ajustes(s, esquema.campos),
      bloques: ((s.bloques as Dic[]) ?? []).map((b) => {
        const eb = esquema.bloques.find((x) => x.slug === b.blockType)!;
        return { id: (b.idTema as string) || `${eb.tipo}_${aleatorio()}`, tipo: eb.tipo, ajustes: ajustes(b, eb.campos) };
      }),
    };
  });
  escribir(SALIDA, `tema/${archivo}.json`, { fuente: fuentes[`tema/${archivo}.json`], secciones });
}

console.log(`Contenido exportado en ${path.relative(RAIZ, SALIDA) || "."}`);
process.exit(0);
