"use client";

// Descripción del producto con «Ver más»: si el texto pasa de 320 px de alto se corta ahí y aparece el botón, que lo
// abre completo (y entonces dice «View less», tal cual lo deja la tienda sin traducir).

import { useEffect, useRef, useState, type ReactNode } from "react";

const ALTO_MAXIMO = 320;

export function LeerMas({ children }: { children: ReactNode }) {
  const caja = useRef<HTMLDivElement>(null);
  const [alto, setAlto] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const largo = alto > ALTO_MAXIMO;

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => setAlto(el.scrollHeight);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el.firstElementChild ?? el);
    return () => observador.disconnect();
  }, []);

  return (
    <div className="mb-8 block">
      <div
        ref={caja}
        className="relative overflow-hidden"
        style={{ maxHeight: largo ? (abierto ? alto : ALTO_MAXIMO) : undefined }}
      >
        {children}
      </div>
      {largo && (
        <div className="relative w-full text-left">
          <button
            type="button"
            onClick={() => setAbierto((a) => !a)}
            aria-expanded={abierto}
            className="inline-block cursor-pointer py-2 leading-[normal] font-bold text-naranja underline decoration-1 transition-colors duration-[400ms]"
          >
            {abierto ? "View less" : "Ver más"}
          </button>
        </div>
      )}
    </div>
  );
}
