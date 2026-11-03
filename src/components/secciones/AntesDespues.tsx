// Antes y después con barra deslizante (sección «before-after-images», «De improvisar con sacos… a una protección
// segura»). En computadora el texto va a la izquierda (30 %) y las fotos a la derecha; en celular y tableta, arriba.

import Image from "next/image";
import type { Seccion } from "@/lib/contenido";
import { esquema, texto } from "@/lib/contenido";
import { Titulo, TextoRico } from "@/components/comunes/Texto";
import { ComparadorImagenes } from "@/components/producto/ComparadorImagenes";

const TAMANOS = "(min-width: 1025px) 70vw, (min-width: 768px) calc(100vw - 96px), calc(100vw - 48px)";

/** Foto de computadora y, si hay, la de celular (debajo de 480 px, como la tienda). */
function Foto({ escritorio, celular, alt }: { escritorio: string; celular: string; alt: string }) {
  return (
    <>
      {escritorio && (
        <Image
          src={escritorio}
          alt={alt}
          fill
          sizes={TAMANOS}
          className={`object-cover ${celular ? "hidden min-[480px]:block" : ""}`}
        />
      )}
      {celular && <Image src={celular} alt={alt} fill sizes={TAMANOS} className="object-cover min-[480px]:hidden" />}
    </>
  );
}

function Etiqueta({ texto: t, lado }: { texto: string; lado: "izquierda" | "derecha" }) {
  if (!t) return null;
  return (
    <div className={`absolute bottom-0 z-[1] p-4 md:p-6 min-[1025px]:p-8 ${lado === "izquierda" ? "left-0" : "right-0"}`}>
      <span className="flex items-center border border-[rgba(0,66,136,0.12)] bg-gris-fondo px-3 py-1 text-sm leading-[17.5px] text-azul-oscuro">
        {t}
      </span>
    </div>
  );
}

export function AntesDespues({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const sub = texto(a, "subheading");
  const titulo = texto(a, "heading");
  const descripcion = texto(a, "description");
  const enLinea = texto(a, "content_align_desktop") === "inline";

  return (
    <div className={esquema(a)} data-seccion="before-after-images">
      <div className="contenedor py-[var(--aire)]">
        <div className={`flex flex-col gap-[var(--hueco)] ${enLinea ? "min-[1025px]:flex-row min-[1025px]:gap-[2vw]" : ""}`}>
          <div
            className={`flex flex-col items-center text-center ${enLinea ? "min-[1025px]:shrink-0 min-[1025px]:basis-[calc((100%-2vw)*0.3)] min-[1025px]:items-start min-[1025px]:text-left" : ""}`}
          >
            {sub && <span className="mb-3 inline-block font-titulo text-[19.2px] leading-6 font-medium">{sub}</span>}
            <Titulo texto={titulo} className="break-words" />
            {descripcion && (
              <TextoRico
                html={descripcion}
                className={`mx-auto mt-[27px] w-full max-w-[650px] md:mt-[28.8px] ${enLinea ? "min-[1025px]:mx-0" : ""}`}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <ComparadorImagenes
              className="aspect-square rounded-[16px] md:rounded-[24px] min-[1025px]:rounded-[32px]"
              antes={
                <>
                  <Foto escritorio={texto(a, "desktop_image")} celular={texto(a, "mobile_image")} alt={texto(a, "label_image_before") || "Antes"} />
                  <Etiqueta texto={texto(a, "label_image_before")} lado="izquierda" />
                </>
              }
              despues={
                <>
                  <Foto
                    escritorio={texto(a, "desktop_image_second")}
                    celular={texto(a, "mobile_image_second")}
                    alt={texto(a, "label_image_after") || "Después"}
                  />
                  <Etiqueta texto={texto(a, "label_image_after")} lado="derecha" />
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
