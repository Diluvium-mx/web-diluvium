"use client";

// «¿Cómo medir?» (Producto 66, 21-nov-2026, dueño): abre una ventana con el video «Dónde medir», que empieza solo y con
// sonido (la persona lo pidió con un toque). Debajo, «Ver pasos clave» cambia la misma ventana a los 3 pasos (el
// video se pausa) con «← Volver al video». Abrirla cuenta como «abre_tabla».
// Video: public/media/videos/donde-medir.mp4 (la versión comprimida del CRM, 6.2 MB, 2:13). Es un archivo fijo:
// no cuenta en el límite de 3 MB del plan gratis de Cloudflare (ese límite es solo del código).

import { useEffect, useRef, useState } from "react";
import { IconoTache } from "./piezas";
import { PasosMedir, type TamanoPaso, type VariantePasos } from "./PasosMedir";
import { VideoGaleria } from "./VideoGaleria";

/** Botón azul de la ventana (propuesta 1 que eligió el dueño, 21-nov-2026): el texto y, debajo, una flecha dibujada
 *  (no es una letra del texto) que se mueve suave hacia donde lleva. */
function BotonVentana({ texto, lado, alTocar }: { texto: string; lado: "derecha" | "izquierda"; alTocar: () => void }) {
  return (
    <button
      type="button"
      onClick={alTocar}
      className="mt-4 flex min-h-[64px] w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl bg-marino px-5 py-2.5 font-titulo text-[18px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(10,85,154,0.8)] transition-colors hover:bg-marino-hondo"
    >
      {texto}
      <svg
        viewBox="0 0 24 24"
        className={`flecha-empuje size-6 ${lado === "derecha" ? "animate-[empuje-der_1.4s_ease-in-out_infinite]" : "animate-[empuje-izq_1.4s_ease-in-out_infinite]"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {lado === "derecha" ? <path d="M4 12h15M13 6l6 6-6 6" /> : <path d="M20 12H5M11 6l-6 6 6 6" />}
      </svg>
    </button>
  );
}

export function ComoMedir({ texto, className, tamanos, variante = "a" }: { texto: string; className: string; tamanos: TamanoPaso[]; variante?: VariantePasos }) {
  const ventana = useRef<HTMLDialogElement>(null);
  const [abierta, setAbierta] = useState(false);
  const [vista, setVista] = useState<"video" | "pasos">("video");
  const cerrar = () => ventana.current?.close();
  const cambiarVista = (v: "video" | "pasos") => {
    setVista(v);
    ventana.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const d = ventana.current;
    if (!d) return;
    if (abierta && !d.open) d.showModal();
  }, [abierta]);

  return (
    <>
      <button
        type="button"
        data-evento="abre_tabla"
        aria-haspopup="dialog"
        onClick={() => {
          setVista("video");
          setAbierta(true);
        }}
        className={className}
      >
        {texto}
      </button>
      <dialog
        ref={ventana}
        aria-label="Cómo medir tu entrada"
        onClose={() => setAbierta(false)}
        onClick={(e) => e.target === e.currentTarget && cerrar()}
        className="version m-auto max-h-[94dvh] w-[min(94vw,560px)] max-w-none overflow-y-auto rounded-2xl bg-white p-0 text-marino backdrop:bg-tinta/70"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-linea bg-white py-2.5 pr-2 pl-5">
          <h2 className="titulo-ancho m-0 text-[20px]">{vista === "video" ? "¿Cómo medir tu entrada?" : "3 pasos clave"}</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-niebla">
            <IconoTache className="size-6" />
          </button>
        </div>

        {/* El video se queda puesto (escondido) mientras se ven los pasos: al volver sigue donde iba. */}
        <div className={`p-4 ${vista === "video" ? "" : "hidden"}`}>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-tinta">
            <VideoGaleria
              src="/media/videos/donde-medir.mp4"
              poster="/media/videos/donde-medir-poster.jpg"
              alt="Video: dónde medir tu entrada para elegir el tamaño de la compuerta"
              activo={abierta && vista === "video"}
              conSonido
            />
          </div>
          <BotonVentana texto="Ver pasos clave" lado="derecha" alTocar={() => cambiarVista("pasos")} />
        </div>
        {vista === "pasos" && (
          <div className="p-4">
            <PasosMedir variante={variante} tamanos={tamanos} />
            <BotonVentana texto="Volver al video" lado="izquierda" alTocar={() => cambiarVista("video")} />
          </div>
        )}
      </dialog>
    </>
  );
}
