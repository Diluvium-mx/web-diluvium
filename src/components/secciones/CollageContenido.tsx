// Collage de tarjetas con imagen o video, título y botón (sección «content-collage»). Cada bloque ocupa las columnas
// y filas que dice su ajuste: rejilla de 4 columnas en computadora (1025 px o más) y de 2 en celular y tableta.

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Bloque, Seccion } from "@/lib/contenido";
import { esquema, numero, siNo, texto } from "@/lib/contenido";
import { Titulo, TextoRico } from "@/components/comunes/Texto";
import { BOTON_GRANDE, BOTON_PRIMARIO } from "@/components/producto/estilos";

const JUSTIFICAR: Record<string, string> = { start: "justify-start", center: "justify-center", end: "justify-end" };
const JUSTIFICAR_MD: Record<string, string> = {
  start: "min-[1025px]:justify-start",
  center: "min-[1025px]:justify-center",
  end: "min-[1025px]:justify-end",
};

/** «end-xs middle-xs ta-center» → clases de posición vertical del contenido (la tarjeta es una columna). */
function posicion(ajustes: Bloque["ajustes"]): string {
  const cel = texto(ajustes, "content_position_mobile").match(/(start|center|end)-xs/)?.[1] ?? "center";
  const md = texto(ajustes, "content_position_desktop").match(/(start|center|end)-md/)?.[1] ?? "center";
  return `${JUSTIFICAR[cel]} ${JUSTIFICAR_MD[md]}`;
}

/** Columnas y filas que ocupa el bloque (variables que leen las clases de la rejilla). */
function tramo(ajustes: Bloque["ajustes"]): CSSProperties {
  return {
    "--col": numero(ajustes, "column_mobile", 2),
    "--fila": numero(ajustes, "row_mobile", 1),
    "--col-md": numero(ajustes, "column_desktop", 2),
    "--fila-md": numero(ajustes, "row_desktop", 1),
  } as CSSProperties;
}

const TRAMO =
  "[grid-column:span_var(--col)] [grid-row:span_var(--fila)] min-[1025px]:[grid-column:span_var(--col-md)] min-[1025px]:[grid-row:span_var(--fila-md)]";
const TARJETA = `${TRAMO} relative flex flex-col items-center overflow-hidden rounded-[16px] p-4 text-center md:rounded-[24px] min-[1025px]:rounded-[32px] min-[1025px]:p-6`;

function Contenido({ bloque }: { bloque: Bloque }) {
  const b = bloque.ajustes;
  const titulo = texto(b, "heading");
  const boton = texto(b, "button_label");
  const enlace = texto(b, "button_link");
  if (!titulo && !boton) return null;
  const color = texto(b, "block_content_overlay_color");
  const tamano = texto(b, "heading_size") || "h3";
  return (
    <div className="relative z-[1] flex flex-col items-center gap-3" style={color ? { color } : undefined}>
      {titulo && <Titulo como="h3" texto={titulo} style={{ fontSize: `var(--${tamano})`, marginBottom: 8 }} />}
      {boton && !siNo(b, "disable_link") && enlace && (
        <Link href={enlace} className={`${BOTON_PRIMARIO} ${BOTON_GRANDE}`}>
          {boton}
        </Link>
      )}
    </div>
  );
}

/** Capa de color sobre la foto (ajustes «block_mask_overlay_color» y «block_overlay_opacity»). */
function Capa({ ajustes }: { ajustes: Bloque["ajustes"] }) {
  const color = texto(ajustes, "block_mask_overlay_color");
  const opacidad = numero(ajustes, "block_overlay_opacity", 0);
  if (!color || opacidad <= 0) return null;
  return <div className="absolute inset-0 z-[1]" style={{ backgroundColor: color, opacity: opacidad / 100 }} />;
}

function BloqueCollage({ bloque }: { bloque: Bloque }) {
  const b = bloque.ajustes;

  if (bloque.tipo === "text") {
    const titulo = texto(b, "heading");
    const tamano = texto(b, "heading_size") || "h1";
    return (
      <div className={`${TRAMO} flex flex-col items-center gap-3 overflow-hidden text-center ${posicion(b)}`} style={tramo(b)}>
        <div className="flex flex-col">
          {titulo && <Titulo como="h3" texto={titulo} style={{ fontSize: `var(--${tamano})`, marginBottom: 8 }} />}
          <TextoRico html={texto(b, "description")} />
        </div>
      </div>
    );
  }

  if (bloque.tipo === "video") {
    const video = texto(b, "video_hosted");
    return (
      <div className={`${TARJETA} ${posicion(b)}`} style={tramo(b)}>
        {video && (
          // El video es cuadrado y va pegado arriba; lo que sobra abajo queda recortado, como en la tienda.
          <div className="absolute top-0 left-0 aspect-square w-full">
            <video
              className="absolute inset-0 size-full object-contain"
              src={video}
              poster={video.replace(/^\/media\/videos\/([0-9a-f]+)\..*$/, "/media/files/$1.thumbnail.0000000000_small.jpg")}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          </div>
        )}
        <Capa ajustes={b} />
        <Contenido bloque={bloque} />
      </div>
    );
  }

  // Imagen: la de computadora y, debajo de 1025 px, la de celular encima.
  const escritorio = texto(b, "desktop_image");
  const celular = texto(b, "mobile_image");
  const alt = texto(b, "heading");
  return (
    <div className={`${TARJETA} ${posicion(b)}`} style={tramo(b)}>
      <div className="absolute inset-0">
        {escritorio && (
          <Image src={escritorio} alt={alt} fill sizes="(min-width: 1025px) 50vw, 100vw" className="object-cover" />
        )}
        {celular && (
          <Image src={celular} alt={alt} fill sizes="100vw" className="object-cover min-[1025px]:hidden" />
        )}
      </div>
      <Capa ajustes={b} />
      <Contenido bloque={bloque} />
    </div>
  );
}

export function CollageContenido({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  // Alto de cada fila: el del ajuste en computadora; en celular y tableta crece con el ancho de la pantalla
  // (medido: 270 → 80 % del ancho, o sea alto ÷ 3.375 en vw).
  const filaCelular = `${numero(a, "mobile_row_height", 270) / 3.375}vw`;
  const filaEscritorio = `${numero(a, "desktop_row_height", 260)}px`;

  return (
    <div className={esquema(a, "scheme-2")} data-seccion="content-collage">
      <div className="contenedor py-[var(--aire)]">
        <div
          className="grid grid-cols-2 [grid-auto-rows:var(--fila-cel)] gap-[min(3.6vw,24px)] min-[1025px]:grid-cols-4 min-[1025px]:[grid-auto-rows:var(--fila-esc)] min-[1025px]:gap-[2vw]"
          style={{ "--fila-cel": filaCelular, "--fila-esc": filaEscritorio } as CSSProperties}
        >
          {seccion.bloques.map((b) => (
            <BloqueCollage key={b.id} bloque={b} />
          ))}
        </div>
      </div>
    </div>
  );
}
