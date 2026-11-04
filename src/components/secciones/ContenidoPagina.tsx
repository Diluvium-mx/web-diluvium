// Título y texto de una página de Shopify (sección «main-page»): Preguntas frecuentes, Reseñas, Compartir carrito…
// El texto vive en el administrador de Shopify (contenido/paginas.json). Título centrado y el texto en una columna
// de 650 px; si la plantilla apaga el título y el texto (Nosotros, Contacto…) la sección no se ve.

import type { ReactNode } from "react";
import type { PropsSeccion } from "./registro";
import { esquema, siNo } from "@/lib/contenido";
import { clasesAire } from "./aire";

/** Formato del texto de páginas y políticas (medido en vivo): títulos con 32 px arriba y 16 abajo, párrafos y listas
 * con 32 px abajo (el último párrafo sin aire), listas con la viñeta adentro, citas en recuadro y fotos redondeadas. */
export const ESTILO_TEXTO_PAGINA = [
  "[&_:is(h1,h2,h3,h4,h5,h6)]:mt-8 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-4 [&_:is(strong,b)]:font-bold",
  "[&_p]:mb-8 [&_p:last-child]:mb-0",
  "[&_:is(ul,ol)]:mb-8 [&_:is(ul,ol)]:list-inside [&_:is(ul,ol)]:pl-4 [&_ul]:list-disc [&_ol]:list-decimal",
  "[&_li_ul]:list-[circle] [&_li]:mb-2 [&_li_li]:mb-1 [&_ul>li:last-child]:mb-0",
  "[&_blockquote]:mb-8 [&_blockquote]:rounded-[10px] [&_blockquote]:bg-[rgba(10,85,154,0.04)] [&_blockquote]:p-6",
  "[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl md:[&_img]:rounded-3xl min-[1025px]:[&_img]:rounded-[32px]",
  "[&_hr]:my-2 [&_hr]:border [&_hr]:border-[rgb(128,128,128)] [&_hr]:[border-style:inset]",
  "[&_a]:underline [&_a]:underline-offset-[3px]",
].join(" ");

export type Pagina = { nombre: string; ruta: string; titulo: string; tituloVisible: string; cuerpo: string };

export function ContenidoPagina({
  seccion,
  producto,
  pagina,
  children,
}: PropsSeccion & { pagina?: Pagina; children?: ReactNode }) {
  const a = seccion.ajustes;
  // Sin el ajuste, el tema muestra título y texto.
  const conTitulo = a.show_page_title === undefined || siNo(a, "show_page_title");
  const conTexto = a.show_page_content === undefined || siNo(a, "show_page_content");
  const titulo = conTitulo ? pagina?.tituloVisible ?? "" : "";
  // El cuerpo es HTML ya limpiado al sacarlo (herramientas/extraer-paginas.py): solo formato, fotos y enlaces.
  const cuerpo = conTexto ? pagina?.cuerpo ?? "" : "";
  const app = conTexto ? children : null;
  if (!titulo && !cuerpo && !app) return <div className={esquema(a)} data-seccion="main-page" />;

  return (
    <div className={esquema(a)} data-seccion="main-page">
      <div className={`contenedor grid gap-[var(--hueco)] break-words ${clasesAire(seccion, producto)}`}>
        {titulo && <h2 className="mx-auto text-center">{titulo}</h2>}
        {(cuerpo || app) && (
          <div className="mx-auto w-full max-w-[650px]">
            {cuerpo && <div className={ESTILO_TEXTO_PAGINA} dangerouslySetInnerHTML={{ __html: cuerpo }} />}
            {app}
          </div>
        )}
      </div>
    </div>
  );
}
