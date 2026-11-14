"use client";

// B1: foto de antes y después que se desliza. Se arrastra desde cualquier punto de la foto (mouse o dedo), se puede
// tocar para saltar ahí y se mueve con las flechas del teclado (Inicio/Fin a los extremos). Al primer movimiento se
// esconde la pista «Desliza».
//
// Fluido en el celular (14-nov-2026): al arrastrar no se vuelve a dibujar nada con React. La posición vive en una
// referencia y, una vez por cuadro (requestAnimationFrame), solo se mueven tres capas con `transform`, que el
// teléfono hace en la tarjeta gráfica sin repintar las fotos:
//   - la foto de «después» va en una caja que se corre a la derecha (y la foto adentro se corre de regreso), así se ve
//     solo la parte derecha sin recortar con clip-path;
//   - la línea y el botón van en un riel del mismo ancho que se corre igual.
// El tamaño de la caja se lee una vez al poner el dedo, no en cada movimiento.
//
// «arrastre»:
//   - "foto" (portada): se arrastra desde cualquier punto de la foto (deja bajar la página con el dedo: pan-y);
//   - "linea" (galería de la ficha): solo desde el botón o una franja de 64 px junto a la línea. El resto de la foto
//     deja deslizar la galería. Si los dos gestos comparten la foto, en iPhone el teléfono empieza a correr la galería,
//     la cancela y la regresa de golpe: se siente trabado (14-nov-2026).

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Lado = { src: string; alt: string; etiqueta: string };

/** «forma»: proporción de la caja (la de la portada si no se dice; en la galería de la ficha, «size-full»). */
export function Comparador({
  antes,
  despues,
  sizes,
  forma = "aspect-[4/3] md:aspect-[16/9] lg:aspect-square rounded-2xl md:rounded-3xl",
  arrastre = "foto",
}: {
  antes: Lado;
  despues: Lado;
  sizes: string;
  forma?: string;
  arrastre?: "foto" | "linea";
}) {
  // Solo para lectores de pantalla y la pista: se actualiza al soltar o con el teclado, no en cada movimiento.
  const [valor, setValor] = useState(50);
  const [movido, setMovido] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const capa = useRef<HTMLDivElement>(null);
  const foto = useRef<HTMLDivElement>(null);
  const riel = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const cuadro = useRef(0);
  const medida = useRef<{ izquierda: number; ancho: number } | null>(null);

  const pintar = useCallback(() => {
    cuadro.current = 0;
    const p = pos.current;
    if (capa.current) capa.current.style.transform = `translate3d(${p}%,0,0)`;
    if (foto.current) foto.current.style.transform = `translate3d(${-p}%,0,0)`;
    if (riel.current) riel.current.style.transform = `translate3d(${p}%,0,0)`;
  }, []);

  const colocar = useCallback(
    (p: number) => {
      pos.current = Math.min(100, Math.max(0, p));
      if (!cuadro.current) cuadro.current = requestAnimationFrame(pintar);
    },
    [pintar],
  );

  useEffect(() => () => cancelAnimationFrame(cuadro.current), []);

  function mover(clientX: number) {
    const m = medida.current;
    if (!m || m.ancho === 0) return;
    colocar(((clientX - m.izquierda) / m.ancho) * 100);
  }

  function soltar() {
    medida.current = null;
    setValor(Math.round(pos.current));
  }

  // Poner el dedo: se mide la caja una vez y se sigue al dedo aunque salga de la franja.
  const tocar = (e: React.PointerEvent<HTMLElement>) => {
    const r = caja.current?.getBoundingClientRect();
    if (!r) return;
    medida.current = { izquierda: r.left, ancho: r.width };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (arrastre === "foto") mover(e.clientX);
    if (!movido) setMovido(true);
  };
  const manejadores = {
    onPointerDown: tocar,
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => medida.current && mover(e.clientX),
    onPointerUp: soltar,
    onPointerCancel: soltar,
    onLostPointerCapture: () => medida.current && soltar(),
  };
  const enFoto = arrastre === "foto";

  function teclado(nuevo: number) {
    colocar(nuevo);
    setValor(Math.round(pos.current));
    setMovido(true);
  }

  return (
    <div
      ref={caja}
      className={`relative overflow-hidden bg-niebla select-none [-webkit-touch-callout:none] ${enFoto ? "touch-pan-y" : ""} ${forma}`}
      {...(enFoto ? manejadores : {})}
    >
      <Image src={antes.src} alt={antes.alt} fill sizes={sizes} loading="eager" fetchPriority="high" className="object-cover" draggable={false} />
      <div ref={capa} className="absolute inset-0 overflow-hidden will-change-transform" style={{ transform: "translate3d(50%,0,0)" }}>
        <div ref={foto} className="absolute inset-0 will-change-transform" style={{ transform: "translate3d(-50%,0,0)" }}>
          <Image src={despues.src} alt={despues.alt} fill sizes={sizes} loading="eager" fetchPriority="high" className="object-cover" draggable={false} />
        </div>
      </div>

      {antes.etiqueta && (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-tinta/80 px-2.5 py-1 text-[13px] font-semibold text-white md:bottom-4 md:left-4 md:text-sm">
          {antes.etiqueta}
        </span>
      )}
      {despues.etiqueta && (
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-md bg-marino px-2.5 py-1 text-[13px] font-semibold text-white md:right-4 md:bottom-4 md:text-sm">
          {despues.etiqueta}
        </span>
      )}

      {/* Riel del ancho de la caja: la línea y el botón quedan en su orilla izquierda y el riel se corre. */}
      <div ref={riel} className="pointer-events-none absolute inset-0 will-change-transform" style={{ transform: "translate3d(50%,0,0)" }}>
        <div className="absolute inset-y-0 left-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(12,30,51,0.15)]" />
        {!enFoto && (
          // Franja para agarrar la línea con el dedo (64 px): aquí el teléfono no corre la galería ni la página.
          <div aria-hidden="true" className="pointer-events-auto absolute inset-y-0 left-0 w-16 -translate-x-1/2 cursor-grab touch-none active:cursor-grabbing" {...manejadores} />
        )}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Comparar antes y después"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={valor}
          aria-valuetext={`${valor} % de la foto de antes a la vista`}
          aria-orientation="horizontal"
          className={`pointer-events-auto absolute top-1/2 left-0 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-white text-marino shadow-[0_6px_18px_-6px_rgba(12,30,51,0.6)] active:cursor-grabbing ${enFoto ? "" : "touch-none"}`}
          {...(enFoto ? {} : manejadores)}
          onKeyDown={(e) => {
            const paso = e.shiftKey ? 10 : 4;
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") teclado(pos.current - paso);
            else if (e.key === "ArrowRight" || e.key === "ArrowUp") teclado(pos.current + paso);
            else if (e.key === "Home") teclado(0);
            else if (e.key === "End") teclado(100);
            else return;
            e.preventDefault();
          }}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </div>
      </div>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-md bg-white/90 px-2.5 py-1 text-[13px] font-semibold text-marino transition-opacity duration-300 md:top-4 ${
          movido ? "opacity-0" : "opacity-100"
        }`}
      >
        {enFoto ? "← Desliza →" : "← Arrastra la línea →"}
      </span>
    </div>
  );
}
