// Banner con imagen (sección «image-banner»): foto a todo lo ancho, con otra foto para celular y tableta, y
// encima, si tiene, una tarjeta con título, texto y botón. Con «adapt_img» el alto sale de la proporción de la foto
// (sin bajar del relleno: 80 px celular, 96 px tableta, 128 px computadora). El tema cambia de foto en 1025 px.

import { getImageProps } from "next/image";
import Link from "next/link";
import type { Bloque, Seccion } from "@/lib/contenido";
import { bloquesDe, esquema, numero, plantilla, siNo, texto } from "@/lib/contenido";
import { BOTON_GRANDE, BOTON_PRIMARIO } from "@/components/producto/estilos";
import medidasGuardadas from "@contenido/medidas-imagenes.json";

// ---- Medidas de las fotos (las usan también otras secciones de medios) ----

// Medidas de todas las fotos de public/media, calculadas antes de construir (herramientas/medidas-imagenes.mjs): así la
// página no lee archivos al momento de la visita, que en Cloudflare no se puede.
const MEDIDAS = medidasGuardadas as Record<string, number[]>;

/** Ancho y alto en píxeles de una foto local («/media/…»). Si no está medida, cuadrada (la página no se rompe). */
export function medidasImagen(src: string): { ancho: number; alto: number } {
  const m = MEDIDAS[decodeURIComponent(src.split("?")[0])];
  return m ? { ancho: m[0], alto: m[1] } : { ancho: 1000, alto: 1000 };
}

// ---- Posición del contenido (ajustes «content_position_mobile» y «content_position_desktop») ----

const HORIZONTAL_CEL: Record<string, string> = { start: "justify-start", center: "justify-center", end: "justify-end" };
const VERTICAL_CEL: Record<string, string> = { top: "items-start", middle: "items-center", bottom: "items-end" };
const TEXTO_CEL: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right" };
const HORIZONTAL_COMPU: Record<string, string> = {
  start: "min-[1025px]:justify-start",
  center: "min-[1025px]:justify-center",
  end: "min-[1025px]:justify-end",
};
const VERTICAL_COMPU: Record<string, string> = {
  top: "min-[1025px]:items-start",
  middle: "min-[1025px]:items-center",
  bottom: "min-[1025px]:items-end",
};
const TEXTO_COMPU: Record<string, string> = {
  left: "min-[1025px]:text-left",
  center: "min-[1025px]:text-center",
  right: "min-[1025px]:text-right",
};

function posicion(valor: string, sufijo: "xs" | "md") {
  const tokens = valor.split(/\s+/);
  const buscar = (opciones: string[], prefijo = "") =>
    opciones.find((o) => tokens.includes(`${prefijo}${o}-${sufijo}`) || (sufijo === "xs" && prefijo && tokens.includes(`${prefijo}${o}`)));
  return {
    h: buscar(["start", "center", "end"]) ?? "center",
    v: buscar(["top", "middle", "bottom"]) ?? "middle",
    t: buscar(["left", "center", "right"], "ta-") ?? "left",
  };
}

// ---- Tarjeta de título y botón ----

function Tarjeta({ bloque }: { bloque: Bloque }) {
  const a = bloque.ajustes;
  const titulo = texto(a, "heading");
  const tituloCel = texto(a, "heading_mobile") || titulo;
  const descripcion = texto(a, "description");
  const descripcionCel = texto(a, "description_mobile");
  const boton = texto(a, "button_text");
  const enlace = texto(a, "button_link");
  const estilo = {
    "--tit-color": texto(a, "heading_color") || "#1c397b",
    "--tit-color-cel": texto(a, "heading_color_mobile") || texto(a, "heading_color") || "#1c397b",
    "--tit-tam": `${numero(a, "heading_size", 44)}px`,
    "--desc-color": texto(a, "description_color") || "#5a5a5a",
    "--desc-color-cel": texto(a, "description_color_mobile") || texto(a, "description_color") || "#5a5a5a",
    "--desc-tam": `${numero(a, "description_size", 16)}px`,
  } as React.CSSProperties;
  const fondoTitulo = siNo(a, "enable_bg_title") ? "bg-white/90 p-5 min-[1025px]:bg-transparent min-[1025px]:p-0" : "";

  return (
    <div className="max-w-[200px] min-[1025px]:max-w-[500px]" style={estilo}>
      {tituloCel && (
        <h2
          className={`mb-2! text-[20px]! leading-[25px]! font-bold! text-[var(--tit-color-cel)] md:mb-3! min-[1025px]:hidden ${fondoTitulo}`}
        >
          {tituloCel}
        </h2>
      )}
      {titulo && (
        <h2 className="mb-4! hidden text-[length:var(--tit-tam)]! leading-none! font-bold! tracking-[1px] text-[var(--tit-color)] min-[1025px]:block">
          {titulo}
        </h2>
      )}
      {descripcionCel && (
        <p className="mb-[10.67px] text-[var(--desc-color-cel)] min-[1025px]:hidden">{descripcionCel}</p>
      )}
      {descripcion && (
        <p className="mb-[10.67px] hidden text-[length:var(--desc-tam)] text-[var(--desc-color)] min-[1025px]:block">
          {descripcion}
        </p>
      )}
      {boton && (
        <Link href={enlace || "#"} className={`${BOTON_PRIMARIO} ${BOTON_GRANDE} mt-[30px] ml-5 min-[1025px]:ml-0`}>
          {boton}
        </Link>
      )}
    </div>
  );
}

export function ImagenBanner({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const fotoCompu = texto(a, "desktop_image");
  const fotoCel = texto(a, "mobile_image") || fotoCompu;
  const tarjetas = bloquesDe(seccion, "header-card");
  const enlace = texto(a, "link");
  const opacidad = numero(a, "section_overlay_opacity");
  const colorCapa = texto(a, "section_mask_overlay_color") || "#000000";

  const compu = fotoCompu ? medidasImagen(fotoCompu) : null;
  const cel = fotoCel ? medidasImagen(fotoCel) : null;
  const proporcion = (m: { ancho: number; alto: number } | null) => (m ? `${m.ancho} / ${m.alto}` : "16 / 9");
  const adaptaCel = texto(a, "height_mobile") === "adapt_img" || !texto(a, "height_mobile");
  const adaptaCompu = texto(a, "height_desktop") === "adapt_img" || !texto(a, "height_desktop");
  const estilo = {
    "--proporcion-cel": adaptaCel ? proporcion(cel) : "auto",
    "--proporcion-compu": adaptaCompu ? proporcion(compu) : "auto",
  } as React.CSSProperties;

  const pCel = posicion(texto(a, "content_position_mobile") || "center-xs middle-xs ta-center", "xs");
  const pCompu = posicion(texto(a, "content_position_desktop") || "center-md middle-md ta-center-md", "md");
  // En celular y tableta el tema quita el margen izquierdo cuando la tarjeta va arriba o en medio a la izquierda.
  const sinMargenIzq = pCel.h === "start" && pCel.v !== "bottom";

  // Una foto para computadora y otra para celular/tableta, eligiendo con <picture> para que solo se baje una.
  let foto: React.ReactNode = null;
  if (fotoCompu && compu && cel) {
    // La primera sección de la portada es la foto principal: se pide primero; las demás esperan a verse.
    const primera = plantilla("portada").secciones[0]?.id === seccion.id;
    const comun = primera
      ? { alt: "", sizes: "100vw", loading: "eager" as const, fetchPriority: "high" as const }
      : { alt: "", sizes: "100vw" };
    const { props: propsCompu } = getImageProps({ ...comun, src: fotoCompu, width: compu.ancho, height: compu.alto });
    const { props: propsCel } = getImageProps({ ...comun, src: fotoCel, width: cel.ancho, height: cel.alto });
    const { srcSet: srcSetCel, ...resto } = propsCel;
    foto = (
      <picture>
        <source media="(min-width: 1025px)" srcSet={propsCompu.srcSet} sizes="100vw" />
        <img {...resto} srcSet={srcSetCel} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
    );
  }

  const contenido = (
    <div
      className={`relative z-[3] flex w-full py-10 pr-[var(--margen)] md:py-12 min-[1025px]:mx-auto min-[1025px]:max-w-[1428px] min-[1025px]:p-16 ${
        sinMargenIzq ? "pl-0" : "pl-[var(--margen)]"
      } ${HORIZONTAL_CEL[pCel.h]} ${VERTICAL_CEL[pCel.v]} ${TEXTO_CEL[pCel.t]} ${HORIZONTAL_COMPU[pCompu.h]} ${
        VERTICAL_COMPU[pCompu.v]
      } ${TEXTO_COMPU[pCompu.t]}`}
    >
      {tarjetas.length > 0 && (
        <div className="w-full">
          {tarjetas.map((b) => (
            <Tarjeta key={b.id} bloque={b} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`${esquema(a)} relative`} data-seccion="image-banner">
      <div
        className="relative flex aspect-[var(--proporcion-cel)] min-h-20 w-full overflow-hidden md:min-h-24 min-[1025px]:aspect-[var(--proporcion-compu)] min-[1025px]:min-h-32"
        style={estilo}
      >
        <div className="absolute inset-0 z-[1]">{foto}</div>
        {opacidad > 0 && (
          <div className="absolute inset-0 z-[2]" style={{ backgroundColor: colorCapa, opacity: opacidad / 100 }} />
        )}
        {enlace && (
          <Link href={enlace} className="absolute inset-0 z-[4]" aria-label="Ver más">
            <span className="sr-only">Ver más</span>
          </Link>
        )}
        {contenido}
      </div>
    </div>
  );
}
