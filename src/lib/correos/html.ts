// Convierte las plantillas de correo (componentes de React sin estado) en el HTML que se manda.
//
// Por qué no react-dom/server: los correos salen desde los ganchos de Payload y las acciones del servidor, que Next
// arma en la capa de «React Server Components». Ahí React no deja usar react-dom/server (su versión para esa capa solo
// lanza «react-dom/server is not supported in React Server Components», y Next la cambia por una que tampoco trae
// renderToStaticMarkup). Este convertidor corre igual en Next, en los scripts con tsx y en Cloudflare, sin dependencias.
//
// Alcance: etiquetas HTML, componentes de función síncronos, fragmentos, listas, texto y números. Sin estado ni efectos
// (un correo no los necesita). El texto y los atributos se escapan siempre; solo `dangerouslySetInnerHTML` pasa tal cual.

import type { ReactNode } from "react";

const VACIAS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
// Propiedades de estilo que van sin «px» cuando son número (como hace React).
const SIN_UNIDAD = new Set(["fontWeight", "lineHeight", "opacity", "zIndex", "flex", "flexGrow", "flexShrink", "order"]);
const NOMBRES: Record<string, string> = { className: "class", htmlFor: "for" };
const FRAGMENTO = Symbol.for("react.fragment");

export function escapar(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function estilo(objeto: Record<string, unknown>): string {
  return Object.entries(objeto)
    .filter(([, v]) => v !== null && v !== undefined && v !== false && v !== "")
    .map(([k, v]) => {
      const nombre = k.startsWith("--") ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      const valor = typeof v === "number" && v !== 0 && !SIN_UNIDAD.has(k) ? `${v}px` : String(v);
      return `${nombre}:${valor}`;
    })
    .join(";");
}

function atributos(props: Record<string, unknown>): string {
  let salida = "";
  for (const [k, v] of Object.entries(props)) {
    if (k === "children" || k === "dangerouslySetInnerHTML" || k === "key" || k === "ref") continue;
    if (v === null || v === undefined || v === false || typeof v === "function") continue;
    const nombre = NOMBRES[k] ?? k.toLowerCase();
    if (v === true) salida += ` ${nombre}`;
    else if (k === "style" && typeof v === "object") salida += ` style="${escapar(estilo(v as Record<string, unknown>))}"`;
    else salida += ` ${nombre}="${escapar(String(v))}"`;
  }
  return salida;
}

type Elemento = { type: unknown; props: Record<string, unknown> & { children?: ReactNode } };

/** HTML de un árbol de React (sin el <!DOCTYPE>; para eso, documento()). */
export function aHtml(nodo: ReactNode): string {
  if (nodo === null || nodo === undefined || typeof nodo === "boolean") return "";
  if (typeof nodo === "string") return escapar(nodo);
  if (typeof nodo === "number" || typeof nodo === "bigint") return String(nodo);
  if (Array.isArray(nodo)) return nodo.map(aHtml).join("");
  if (typeof nodo === "object" && "type" in nodo && "props" in nodo) {
    const { type, props } = nodo as unknown as Elemento;
    if (type === FRAGMENTO) return aHtml(props.children);
    if (typeof type === "function") {
      const resultado = (type as (p: unknown) => unknown)(props);
      if (resultado instanceof Promise) throw new Error("Las plantillas de correo no pueden ser asíncronas");
      return aHtml(resultado as ReactNode);
    }
    if (typeof type === "string") {
      const interior = (props.dangerouslySetInnerHTML as { __html?: string } | undefined)?.__html ?? aHtml(props.children);
      return VACIAS.has(type) ? `<${type}${atributos(props)}>` : `<${type}${atributos(props)}>${interior}</${type}>`;
    }
  }
  throw new Error("Pieza no admitida en una plantilla de correo");
}

/** Documento completo del correo: encabezado para los programas de correo y el texto de vista previa (preencabezado). */
export function documento(cuerpo: ReactNode, { titulo, preencabezado }: { titulo: string; preencabezado?: string }): string {
  const oculto = preencabezado
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${escapar(preencabezado)}${"&#847;&zwnj;&nbsp;".repeat(40)}</div>`
    : "";
  return (
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="x-apple-disable-message-reformatting">` +
    `<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">` +
    `<title>${escapar(titulo)}</title></head>` +
    `<body style="margin:0;padding:0;background-color:#ffffff;-webkit-text-size-adjust:100%">${oculto}${aHtml(cuerpo)}</body></html>`
  );
}
