"use client";

// Comparador «antes y después»: la foto de después tapa a la de antes desde la barra hacia la derecha. La barra se
// arrastra con el mouse o el dedo (desde la manija o la línea, como en la tienda) y con las flechas del teclado.

import { useRef, useState, type ReactNode } from "react";

export function ComparadorImagenes({
  antes,
  despues,
  inicial = 50,
  className = "",
}: {
  antes: ReactNode;
  despues: ReactNode;
  /** Posición inicial de la barra, en % desde la izquierda. */
  inicial?: number;
  className?: string;
}) {
  const [pos, setPos] = useState(inicial);
  const caja = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);

  function mover(clientX: number) {
    const r = caja.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  return (
    <div ref={caja} className={`relative overflow-hidden ${className}`}>
      <div className="size-full">{antes}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        {despues}
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Comparar antes y después"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-orientation="horizontal"
        className="absolute inset-y-0 z-[2] grid w-10 -translate-x-1/2 cursor-grab touch-none place-items-center before:absolute before:inset-y-0 before:left-1/2 before:w-1 before:-translate-x-1/2 before:bg-gris-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:cursor-grabbing min-[1025px]:w-11"
        style={{ left: `${pos}%` }}
        onPointerDown={(e) => {
          arrastrando.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (arrastrando.current) mover(e.clientX);
        }}
        onPointerUp={() => {
          arrastrando.current = false;
        }}
        onPointerCancel={() => {
          arrastrando.current = false;
        }}
        onKeyDown={(e) => {
          const paso = e.shiftKey ? 10 : 2;
          if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - paso));
          else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + paso));
          else if (e.key === "Home") setPos(0);
          else if (e.key === "End") setPos(100);
          else return;
          e.preventDefault();
        }}
      >
        <span className="relative flex size-10 items-center justify-center bg-gris-fondo text-azul-oscuro min-[1025px]:size-11">
          <svg viewBox="0 0 24 24" className="size-5 min-[1025px]:size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
            <path d="M8 6v12M12 6v12M16 6v12" />
          </svg>
        </span>
      </div>
    </div>
  );
}
