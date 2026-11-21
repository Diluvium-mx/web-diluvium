"use client";

// «¿Cómo medir?» (Producto 66, 21-nov-2026, dueño): abre una ventana con el video «Dónde medir», que empieza solo y con
// sonido (la persona lo pidió con un toque). Debajo, «Ver pasos clave» cambia la misma ventana a los 3 pasos (el
// video se pausa) con «← Volver al video». Abrirla cuenta como «abre_tabla».
// Video: public/media/videos/donde-medir.mp4 (la versión comprimida del CRM, 6.2 MB, 2:13). Es un archivo fijo:
// no cuenta en el límite de 3 MB del plan gratis de Cloudflare (ese límite es solo del código).

import { useEffect, useRef, useState } from "react";
import { IconoTache } from "./piezas";
import { PASOS_MEDIR, PasosMedir, type TamanoPaso, type VariantePasos } from "./PasosMedir";
import { TEXTOS_COMO_MEDIR, type TextosComoMedir } from "./textos";


import { VideoControles } from "./VideoControles";

/** Botón azul de la ventana (propuesta 1 que eligió el dueño, 21-nov-2026): el texto y, debajo, una flecha dibujada
 *  (no es una letra del texto) que se mueve suave hacia donde lleva. */
function BotonVentana({ texto, lado, alTocar }: { texto: string; lado?: "derecha" | "izquierda"; alTocar: () => void }) {
  return (
    <button
      type="button"
      onClick={alTocar}
      className="mt-4 flex min-h-[64px] w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl bg-marino px-5 py-2.5 font-titulo text-[18px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(10,85,154,0.8)] transition-colors hover:bg-marino-hondo"
    >
      {texto}
      {lado && (
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
      )}
    </button>
  );
}

export function ComoMedir({
  texto,
  className,
  tamanos,
  variante = "a",
  textos = TEXTOS_COMO_MEDIR,
}: {
  texto: string;
  className: string;
  tamanos: TamanoPaso[];
  variante?: VariantePasos;
  textos?: TextosComoMedir;
}) {
  const ventana = useRef<HTMLDialogElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  // El video vive dentro de la ventana (VideoControles); aquí solo se prepara y se le da play en el toque.
  const elVideo = () => ventana.current?.querySelector("video") ?? null;
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

  // Arranque rápido (21-nov-2026): cuando el botón está cerca de la pantalla (400 px antes; al abrir la página queda
  // justo debajo), el video ya baja su índice (144 KB) para que al tocarlo empiece al momento; al poner el dedo encima,
  // empieza a bajar el video.
  useEffect(() => {
    const b = boton.current;
    if (!b || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        const v = elVideo();
        if (e.isIntersecting && v && v.preload === "none") {
          v.preload = "metadata";
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px 400px 0px" },
    );
    obs.observe(b);
    // Por si acaso (pantalla en segundo plano, navegador viejo): a los 1.5 s de abrir la página se prepara igual.
    const respaldo = setTimeout(() => {
      const v = elVideo();
      if (v && v.preload === "none") v.preload = "metadata";
    }, 1500);
    return () => {
      obs.disconnect();
      clearTimeout(respaldo);
    };
  }, []);

  return (
    <>
      <button
        ref={boton}
        type="button"
        data-evento="abre_tabla"
        aria-haspopup="dialog"
        onPointerDown={() => {
          const v = elVideo();
          if (v) v.preload = "auto";
        }}
        onClick={() => {
          // Play en el mismo toque: empieza antes y el iPhone lo deja con sonido.
          const v = elVideo();
          if (v) {
            v.muted = false;
            v.play().catch(() => {});
          }
          setVista("video");
          setAbierta(true);
        }}
        className={className}
      >
        {texto}
      </button>
      <dialog
        ref={ventana}
        aria-label={textos.tituloVideo}
        onClose={() => setAbierta(false)}
        onClick={(e) => e.target === e.currentTarget && cerrar()}
        className="version m-auto max-h-[94dvh] w-[min(94vw,560px)] max-w-none overflow-y-auto rounded-2xl bg-white p-0 text-marino backdrop:bg-tinta/70"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-linea bg-white py-2.5 pr-2 pl-5">
          <h2 className="titulo-ancho m-0 text-[20px]">{vista === "video" ? textos.tituloVideo : textos.tituloPasos}</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-niebla">
            <IconoTache className="size-6" />
          </button>
        </div>

        {/* El video se queda puesto (escondido) mientras se ven los pasos: al volver sigue donde iba. */}
        <div className={`p-4 ${vista === "video" ? "" : "hidden"}`}>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-tinta">
            <VideoControles
              src="/media/videos/donde-medir.mp4"
              poster="/media/videos/donde-medir-poster.jpg"
              alt="Video: dónde medir tu entrada para elegir el tamaño de la compuerta"
              activo={abierta && vista === "video"}
              tocaParaOir={textos.tocaParaOir}
            />
          </div>
          {/* 217: solo el texto, al centro (dueño, 21-nov-2026); 224 conserva su flecha. */}
          <BotonVentana texto={textos.botonPasos} alTocar={() => cambiarVista("pasos")} />
        </div>
        {vista === "pasos" && (
          <div className="p-4">
            <PasosMedir variante={variante} tamanos={tamanos} columnas={textos.columnas} pasos={PASOS_MEDIR.map((p, i) => ({ ...p, titulo: textos.pasos[i] ?? p.titulo }))} />
            <BotonVentana texto={textos.botonVolver} lado="izquierda" alTocar={() => cambiarVista("video")} />
          </div>
        )}
      </dialog>
    </>
  );
}
