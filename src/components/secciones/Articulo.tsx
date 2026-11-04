// Artículo del blog (sección «main-article», páginas /blogs/blog/<artículo>): foto principal, título con fecha y
// autor, el cuerpo del artículo y los botones «Anterior» / «Siguiente». Los artículos salen de contenido/blog.json
// (herramientas/extraer-articulos.py). La página del artículo pasa cuál es; sin artículo, la sección no muestra nada.

import Image from "next/image";
import Link from "next/link";
import blog from "@contenido/blog.json";
import type { Bloque } from "@/lib/contenido";
import { esquema, numero, siNo } from "@/lib/contenido";
import type { PropsSeccion } from "./registro";

export type ArticuloBlog = {
  titulo: string;
  url: string;
  slug: string;
  fecha: string;
  publicado: string;
  resumen: string;
  autor: string;
  imagen?: { src: string; alt: string; ancho: number; alto: number };
  etiquetas: { nombre: string; url: string }[];
  anterior: string | null;
  siguiente: string | null;
  seo: { titulo: string; descripcion: string };
  cuerpo: string;
};

const ARTICULOS: ArticuloBlog[] = blog.articulos;

/** Artículos del blog, del más nuevo al más viejo. */
export function articulosBlog(): ArticuloBlog[] {
  return ARTICULOS;
}

/** Artículo por su nombre en la dirección (/blogs/blog/<nombre>). */
export function articuloBlog(slug: string): ArticuloBlog | undefined {
  return ARTICULOS.find((a) => a.slug === slug);
}

// --- Cuerpo del artículo: HTML del contenido, limpio ---------------------------------------------------------------
// Como limpiarHtml (comunes/Texto) pero además deja fotos propias (/media/…), citas, bloques y los estilos de
// alineación, color y sangría que usa el editor de la tienda.

const ETIQUETAS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "span", "div", "blockquote", "img",
  "h1", "h2", "h3", "h4", "h5", "h6",
]);
const ESTILOS = new Set(["text-align", "color", "padding-left", "margin-left", "margin-right", "display"]);

function atributos(texto: string): Map<string, string> {
  const salida = new Map<string, string>();
  for (const m of texto.matchAll(/([a-z-]+)\s*=\s*"([^"]*)"/gi)) salida.set(m[1].toLowerCase(), m[2]);
  return salida;
}

function estiloSeguro(estilo: string): string {
  return estilo
    .split(";")
    .map((d) => d.split(":").map((x) => x.trim()))
    .filter(([prop, valor]) => prop && valor && ESTILOS.has(prop.toLowerCase()) && /^[#a-z0-9.,%()\s-]+$/i.test(valor))
    .map(([prop, valor]) => `${prop.toLowerCase()}: ${valor}`)
    .join("; ");
}

function hrefSeguro(href: string): string {
  // Direcciones web, rutas del sitio, anclas, teléfono, correo o rutas relativas (sin «:»).
  return /^(https?:\/\/|\/|#|tel:|mailto:)/i.test(href) || !href.includes(":") ? href : "#";
}

export function limpiarCuerpo(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|template)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (todo, etiqueta: string, resto: string) => {
      const nombre = etiqueta.toLowerCase();
      if (!ETIQUETAS.has(nombre)) return "";
      if (todo.startsWith("</")) return nombre === "img" || nombre === "br" ? "" : `</${nombre}>`;
      const at = atributos(resto);
      const partes: string[] = [];
      const estilo = estiloSeguro(at.get("style") ?? "");
      if (estilo) partes.push(`style="${estilo}"`);
      if (nombre === "a") {
        partes.unshift(`href="${hrefSeguro(at.get("href") ?? "")}"`);
        if (at.get("title")) partes.push(`title="${at.get("title")}"`);
        if (at.get("target") === "_blank") partes.push('target="_blank" rel="noopener noreferrer"');
      }
      if (nombre === "img") {
        const src = at.get("src") ?? "";
        if (!/^\/media\/[\w./-]+$/.test(src) || src.includes("..")) return "";
        partes.unshift(`src="${src}"`, `alt="${at.get("alt") ?? ""}"`);
        for (const medida of ["width", "height"]) {
          const valor = at.get(medida);
          if (valor && /^\d+$/.test(valor)) partes.push(`${medida}="${valor}"`);
        }
        partes.push('loading="lazy" decoding="async"');
      }
      return `<${nombre}${partes.length ? " " + partes.join(" ") : ""}>`;
    });
}

// Medidas del cuerpo en vivo (3-nov-2026): letra 18px con interlineado 1.65, 32px entre bloques, títulos con 32px
// arriba y 16px abajo, listas con la viñeta adentro y 8px entre renglones, fotos con esquinas redondeadas.
const ESTILO_CUERPO = `
  .articulo-cuerpo { font-size: var(--letra-articulo, 18px); line-height: 1.65; overflow-wrap: break-word; }
  .articulo-cuerpo p, .articulo-cuerpo ul, .articulo-cuerpo ol, .articulo-cuerpo blockquote { margin: 0 0 32px; }
  .articulo-cuerpo :is(h1, h2, h3, h4, h5, h6) { margin: 32px 0 16px; }
  .articulo-cuerpo > :last-child { margin-bottom: 0; }
  .articulo-cuerpo ul, .articulo-cuerpo ol { padding-left: 16px; list-style-position: inside; }
  .articulo-cuerpo ul { list-style-type: disc; }
  .articulo-cuerpo ol { list-style-type: decimal; }
  .articulo-cuerpo li + li { margin-top: 8px; }
  /* La letra de la tienda no trae números de ancho fijo: los números de la lista van con su ancho normal. */
  .articulo-cuerpo li::marker { font-variant-numeric: normal; }
  .articulo-cuerpo a { text-decoration: underline; }
  .articulo-cuerpo blockquote { padding-left: 16px; border-left: 2px solid currentColor; }
  .articulo-cuerpo img { display: inline; max-width: 100%; height: auto; vertical-align: middle; border-radius: 16px; }
  @media (min-width: 768px) { .articulo-cuerpo img { border-radius: 24px; } }
  @media (min-width: 1025px) { .articulo-cuerpo img { border-radius: 32px; } }
`;

function Flecha({ izquierda }: { izquierda?: boolean }) {
  return (
    <svg
      className={izquierda ? "mr-2" : "ml-2"}
      width={24}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {izquierda ? (
        <>
          <path d="M5.89587 12L20.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" />
          <path d="M11.3073 18.0245L5.25725 12.0005L11.3073 5.97546" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M19.1041 12L4.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" />
          <path d="M13.6927 18.0245L19.7427 12.0005L13.6927 5.97546" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

// Botón «btn-outline» grande: blanco con filo tenue; al pasar el mouse un relleno azul baja desde arriba (0.4 s) y el
// texto queda blanco (medido en vivo).
const BOTON =
  "relative isolate inline-flex h-10 items-center justify-center overflow-hidden bg-white px-6 py-1.5 font-titulo " +
  "text-base leading-[26.4px] font-medium text-[#004288] shadow-[inset_0_0_0_1px_rgb(0_66_136/0.12)] " +
  "transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 " +
  "after:bg-[#004288] after:transition-[bottom] after:duration-[400ms] after:ease-[cubic-bezier(0.7,0,0.3,1)] " +
  "hover:text-white hover:after:bottom-0 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[#004288] focus-visible:after:bottom-0 min-[1025px]:h-11";

function bloque(bloques: Bloque[], tipo: string): Bloque | undefined {
  return bloques.find((b) => b.tipo === tipo);
}

export function Articulo({ seccion, articulo }: PropsSeccion & { articulo?: ArticuloBlog }) {
  if (!articulo) return null;
  const foto = bloque(seccion.bloques, "featured_image");
  const titulo = bloque(seccion.bloques, "title");
  const contenido = bloque(seccion.bloques, "content");
  const conFecha = titulo ? siNo(titulo.ajustes, "show_published_date") : false;
  const conAutor = titulo ? siNo(titulo.ajustes, "show_author") && Boolean(articulo.autor) : false;
  const conEtiquetas = contenido ? siNo(contenido.ajustes, "show_blog_tags") : false;
  const letra = contenido ? numero(contenido.ajustes, "font_size", 18) : 18;
  const navegacion = articulo.anterior && articulo.siguiente ? "justify-between" : articulo.anterior ? "justify-start" : "justify-end";

  return (
    <div className={`${esquema(seccion.ajustes)} my-[var(--aire)]`} data-seccion="main-article">
      <style>{ESTILO_CUERPO}</style>
      <div className="contenedor">
        <article>
          {foto && articulo.imagen && (
            <div className="mx-auto mb-4 h-[422px] max-w-[1000px] overflow-hidden rounded-2xl md:mb-6 md:h-[512px] md:rounded-3xl min-[1025px]:mb-8 min-[1025px]:h-[450px] min-[1025px]:rounded-[32px]">
              {/* En celular la foto llena el ancho de la pantalla y se recorta al cuadro con esquinas. */}
              <div className="relative -mx-[var(--margen)] h-full md:mx-0">
                <Image
                  src={articulo.imagen.src}
                  alt={articulo.imagen.alt}
                  fill
                  priority
                  sizes="(min-width: 1025px) 1000px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {titulo && (
            <div className="mx-auto max-w-[1280px] py-4 text-center md:py-6 min-[1025px]:py-8">
              <h1 className="mb-4 text-[length:var(--h2)]">{articulo.titulo}</h1>
              {(conFecha || conAutor) && (
                <div className="mr-2 text-[13.6px] leading-[17px] text-[rgb(0_66_136/0.6)]">
                  {conFecha && <time dateTime={articulo.publicado || undefined}>{articulo.fecha}</time>}
                  {conFecha && conAutor && " • "}
                  {conAutor && <span className="inline-block">Por {articulo.autor}</span>}
                </div>
              )}
            </div>
          )}

          {contenido && (
            <div className="mx-auto max-w-[650px] pt-4 md:pt-6 min-[1025px]:pt-8">
              <div
                className="articulo-cuerpo"
                style={{ "--letra-articulo": `${letra}px` } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: limpiarCuerpo(articulo.cuerpo) }}
              />
              {conEtiquetas && articulo.etiquetas.length > 0 && (
                <ul className="my-8 flex list-none flex-wrap gap-x-2 p-0">
                  {articulo.etiquetas.map((e) => (
                    <li key={e.url}>
                      <Link href={e.url} className={BOTON}>
                        {e.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {(articulo.anterior || articulo.siguiente) && (
                <div className={`mt-8 flex ${navegacion}`}>
                  {articulo.anterior && (
                    <Link href={articulo.anterior} className={BOTON}>
                      <Flecha izquierda />
                      Anterior
                    </Link>
                  )}
                  {articulo.siguiente && (
                    <Link href={articulo.siguiente} className={BOTON}>
                      Siguiente
                      <Flecha />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
