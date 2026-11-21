// Mapa de elementos (como el mapa del CRM): cada elemento de la página lleva un número fijo para pedir cambios en una
// línea: «Producto 37: …». Lo usa el editor local (pestaña Mapa).
//
// Qué es un elemento: título, texto, botón, enlace, opción (tamaño), campo, foto, video o ícono.
// El número no depende del texto: cada elemento tiene una «firma» = parte (sección) | pieza | tipo@camino, donde el
// camino es su lugar exacto dentro de la pieza (p. ej. «div2>p1»: el 1.er párrafo del 2.º bloque). Así, quitar o
// cambiar un elemento no mueve los números de los demás (21-nov-2026: con «tipo:orden» quitar un texto recorría
// todos los siguientes). Las fotos van por su campo (data-editar) y data-el fija la firma a mano cuando una pieza se
// rehace. Al cambiar un texto o mover fotos, la firma no cambia y el número tampoco. Lo
// nuevo toma el siguiente número libre y un número quitado no se vuelve a usar
// (contenido/mapa-elementos.json, lo escribe /editor/api/elementos).

import type { SeccionMapa } from "@/lib/mapa";

export type Elemento = { firma: string; rol: string; nombre: string; parte: string; el: Element };

const INTERACTIVOS: Record<string, string> = { A: "Enlace", BUTTON: "Botón", SUMMARY: "Botón", INPUT: "Campo", TEXTAREA: "Campo", SELECT: "Campo" };
const CON_TEXTO = new Set(["P", "SPAN", "LI", "BLOCKQUOTE", "FIGCAPTION", "DT", "DD", "STRONG", "EM", "B", "DIV", "LABEL", "CODE", "S", "SMALL"]);

function textoPropio(el: Element): string {
  let t = "";
  for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent ?? "";
  return t.replace(/\s+/g, " ").trim();
}

/** Qué tipo de elemento es (o null si no cuenta por sí solo). */
function rolDe(el: Element): string | null {
  const tag = el.tagName;
  if (tag === "IMG") return "Foto";
  if (tag === "VIDEO") return "Video";
  if (/^H[1-6]$/.test(tag)) return "Título";
  // Una tabla (la de tamaños de los pasos clave) es un solo elemento.
  if (tag === "TABLE") return "Tabla";
  if (tag === "LABEL" && el.querySelector("input[type=radio],input[type=checkbox]")) return "Opción";
  if (INTERACTIVOS[tag]) return (el as HTMLInputElement).type === "hidden" ? null : INTERACTIVOS[tag];
  // Controles hechos a mano (la línea del antes y después) cuentan como uno solo.
  if (["slider", "button", "tab", "switch"].includes(el.getAttribute("role") ?? "")) return "Control";
  if (tag === "svg" || tag === "SVG") return "Ícono";
  if (CON_TEXTO.has(tag) && textoPropio(el)) return "Texto";
  return null;
}

function resumen(el: Element, rol: string): string {
  const h = el as HTMLElement & { alt?: string; placeholder?: string; value?: string; src?: string; currentSrc?: string };
  const archivo = (src: string) => {
    const limpio = src.includes("/_next/image") ? new URL(src, "http://x").searchParams.get("url") ?? src : src;
    return decodeURIComponent(limpio.split("/").pop()?.split("?")[0] ?? "");
  };
  if (rol === "Foto") return `${archivo(h.currentSrc || h.src || "")}${h.alt ? ` · ${h.alt}` : ""}`.slice(0, 70);
  const texto =
    el.getAttribute("aria-label") ||
    (rol === "Video" ? decodeURIComponent((h.currentSrc || h.src || "").split("/").pop() ?? "") : "") ||
    (rol === "Campo" ? h.placeholder || h.value || "" : "") ||
    (el.textContent ?? "");
  let limpio = texto.replace(/\s+/g, " ").trim();
  // Un enlace o botón que solo lleva una foto se nombra por la foto.
  if (!limpio && (rol === "Enlace" || rol === "Botón")) {
    const foto = el.querySelector("img");
    if (foto) limpio = `foto ${foto.alt || archivo(foto.currentSrc || foto.src)}`;
  }
  if (!limpio && rol.startsWith("Ícono")) {
    // Un ícono sin texto se nombra por lo que tiene al lado («junto a "Envío gratis"»).
    const texto = (x: Element | null | undefined) => (x as HTMLElement | null)?.innerText || x?.textContent || "";
    const vecino = (texto(el.nextElementSibling) || texto(el.parentElement)).replace(/\s+/g, " ").trim();
    limpio = vecino ? `junto a "${vecino.slice(0, 40)}"` : "adorno";
  }
  return limpio.length > 60 ? `${limpio.slice(0, 59)}…` : limpio;
}

/** Lugar exacto de un elemento dentro de su pieza o sección: «div2>p1» = el 1.er <p> dentro del 2.º <div>. */
function camino(el: Element, raiz: Element): string {
  const partes: string[] = [];
  for (let n: Element | null = el; n && n !== raiz; n = n.parentElement) {
    const padre: Element | null = n.parentElement;
    const tag = n.tagName.toLowerCase();
    const iguales = padre ? [...padre.children].filter((c) => c.tagName === n!.tagName) : [n];
    partes.unshift(`${tag}${iguales.indexOf(n) + 1}`);
  }
  return partes.join(">");
}

/** El elemento [data-seccion] de cada sección de la plantilla, en orden. */
export function seccionesEnPagina(doc: Document, secciones: SeccionMapa[]): (HTMLElement | null)[] {
  const todos = [...doc.querySelectorAll<HTMLElement>("[data-seccion]")].filter((e) => !e.parentElement?.closest("[data-seccion]"));
  let desde = 0;
  return secciones.map((s) => {
    const i = todos.findIndex((e, k) => k >= desde && e.dataset.seccion === s.tipo);
    if (i < 0) return null;
    desde = i + 1;
    return todos[i];
  });
}

/** Todos los elementos de la página con su firma, en el orden en que aparecen. */
export function escanear(doc: Document, secciones: SeccionMapa[]): Elemento[] {
  const lista: Elemento[] = [];
  const raices = seccionesEnPagina(doc, secciones);
  raices.forEach((raiz, i) => {
    if (!raiz) return;
    const s = secciones[i];
    const contados = new Set<Element>();
    const caminante = doc.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT);
    for (let el = caminante.nextNode() as Element | null; el; el = caminante.nextNode() as Element | null) {
      if (el.closest(".sr-only")) continue;
      // Lo que ya está dentro de un elemento contado (el texto de un botón, el ícono de un enlace) no cuenta aparte.
      let dentro = false;
      for (let p = el.parentElement; p && p !== raiz.parentElement; p = p.parentElement) {
        if (contados.has(p)) {
          dentro = true;
          break;
        }
      }
      if (dentro) continue;
      let rol = rolDe(el);
      let objetivo: Element = el;
      if (rol === "Ícono") {
        // Varias estrellas o íconos juntos son un solo elemento.
        const padre = el.parentElement;
        if (padre && padre !== raiz && [...padre.children].length > 1 && [...padre.children].every((c) => c.tagName.toLowerCase() === "svg")) {
          if (contados.has(padre)) continue;
          objetivo = padre;
        }
      }
      if (!rol) continue;
      if (rol === "Campo" && (el as HTMLInputElement).type === "radio") continue;
      contados.add(objetivo);
      const pieza = objetivo.closest<HTMLElement>("[data-pieza]");
      const piezaId = pieza && raiz.contains(pieza) ? (pieza.dataset.pieza ?? "") : "";
      const editar = (objetivo as HTMLElement).dataset?.editar;
      // data-el: el elemento conserva el número que tenía aunque la pieza se haya rehecho (p. ej. las tarjetas de reseñas).
      const fija = (objetivo as HTMLElement).dataset?.el;
      let clave: string;
      if (editar) clave = `foto:${editar.split("|").slice(1).join("|")}`;
      else if (fija) clave = fija;
      else clave = `${rol}@${camino(objetivo, pieza && raiz.contains(pieza) ? pieza : raiz)}`;
      rol = rol === "Ícono" && objetivo !== el ? "Íconos" : rol;
      lista.push({ firma: `${s.id}|${piezaId}|${clave}`, rol, nombre: `${rol} «${resumen(objetivo, rol)}»`, parte: `${s.codigo} · ${s.etiqueta}`, el: objetivo });
    }
  });
  return lista;
}
