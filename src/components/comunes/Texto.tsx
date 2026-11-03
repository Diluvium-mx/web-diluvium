import type { ElementType, ReactNode } from "react";

/** Título con las palabras entre [corchetes] en el color destacado, como en el tema. */
export function Titulo({
  como: Etiqueta = "h2",
  texto,
  className,
  style,
}: {
  como?: ElementType;
  texto: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!texto) return null;
  const partes: ReactNode[] = [];
  const patron = /\[([^\]]+)\]/g;
  let ultimo = 0;
  for (const m of texto.matchAll(patron)) {
    if (m.index > ultimo) partes.push(texto.slice(ultimo, m.index));
    partes.push(
      <span key={m.index} className="resaltado">
        {m[1]}
      </span>,
    );
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return (
    <Etiqueta className={className} style={style}>
      {partes}
    </Etiqueta>
  );
}

// Etiquetas y atributos permitidos en el texto con formato que viene del contenido.
const ETIQUETAS = new Set(["p", "br", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li", "span", "h1", "h2", "h3", "h4", "h5", "h6"]);

/** Limpia HTML del contenido: solo etiquetas de formato y enlaces seguros; quita estilos, scripts y eventos. */
export function limpiarHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (todo, etiqueta: string, atributos: string) => {
      const nombre = etiqueta.toLowerCase();
      if (!ETIQUETAS.has(nombre)) return "";
      if (todo.startsWith("</")) return `</${nombre}>`;
      if (nombre === "a") {
        const href = atributos.match(/href\s*=\s*"([^"]*)"/i)?.[1] ?? "";
        const seguro = /^(https?:\/\/|\/|#|tel:|mailto:)/i.test(href) ? href : "#";
        const externo = /^https?:\/\//i.test(seguro) ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${seguro.replace(/"/g, "&quot;")}"${externo}>`;
      }
      return nombre === "br" ? "<br>" : `<${nombre}>`;
    });
}

/** Texto con formato (párrafos, negritas, enlaces) del contenido. */
export function TextoRico({ html, className, como: Etiqueta = "div" }: { html: string; className?: string; como?: ElementType }) {
  if (!html) return null;
  return <Etiqueta className={`texto-rico ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: limpiarHtml(html) }} />;
}
