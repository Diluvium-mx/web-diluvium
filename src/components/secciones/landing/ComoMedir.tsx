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
          <button
            type="button"
            onClick={() => cambiarVista("pasos")}
            className="mx-auto mt-3 flex min-h-12 cursor-pointer items-center gap-2 px-3 font-titulo text-[17px] font-bold text-marino underline decoration-2 underline-offset-4"
          >
            Ver pasos clave
            <span aria-hidden="true">→</span>
          </button>
        </div>
        {vista === "pasos" && (
          <div className="p-4">
            <PasosMedir variante={variante} tamanos={tamanos} />
            <button
              type="button"
              onClick={() => cambiarVista("video")}
              className="mx-auto mt-4 flex min-h-12 cursor-pointer items-center gap-2 px-3 font-titulo text-[16px] font-bold text-marino underline decoration-2 underline-offset-4"
            >
              <span aria-hidden="true">←</span> Volver al video
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
