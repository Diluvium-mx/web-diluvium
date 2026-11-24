"use client";

// «Video automático» (nombre del dueño, 23-nov-2026): el mismo reproductor del video de la galería de la compuerta
// (VideoGaleria.tsx, el 3.º de sus fotos). Al llegar a él en la pantalla se reproduce solo, sin sonido y se repite;
// tocarlo lo pausa, el botón de abajo le pone sonido («Toca para oír»; no sale si el video no tiene sonido) y una barra
// fina muestra el avance. Al salir de la pantalla se pausa. Es para videos que se ven de pasada, no para regresar ni adelantar.
// El otro sistema es el «video con controles» (VideoControles.tsx, el de «¿Cómo medir?»): empieza con sonido al
// abrirlo, con regresar y adelantar 10 s, pantalla completa y la barra azul.
// Va dentro de un cuadro con «relative» y su proporción (llena el cuadro como las fotos).

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { VideoGaleria } from "./VideoGaleria";

export function VideoAutomatico({
  src,
  poster,
  alt,
  estilo,
  tocaParaOir,
  sinSonido,
  marca,
}: {
  src: string;
  poster: string;
  alt: string;
  estilo?: CSSProperties;
  tocaParaOir?: string;
  /** El video no tiene sonido (herramientas/videos-sonido.mjs): sin botón de sonido. */
  sinSonido?: boolean;
  /** Marca del editor local (marcaEditar), para cambiar el video ahí. */
  marca?: Record<string, string>;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // «Activo» mientras al menos la mitad del video está en la pantalla.
  useEffect(() => {
    const e = caja.current;
    if (!e) return;
    const vigia = new IntersectionObserver(([d]) => setVisible(d.isIntersecting), { threshold: 0.5 });
    vigia.observe(e);
    return () => vigia.disconnect();
  }, []);

  return (
    <div ref={caja} className="absolute inset-0">
      <VideoGaleria src={src} poster={poster} alt={alt} activo={visible} estilo={estilo} marca={marca} tocaParaOir={tocaParaOir} sinSonido={sinSonido} />
    </div>
  );
}
