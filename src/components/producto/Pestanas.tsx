"use client";

// Pestañas que cambian entre varios paneles ya dibujados en el servidor. Con un solo panel la tienda no muestra
// botones de pestaña, solo el espacio de la barra; aquí igual.

import { useId, useState, type ReactNode } from "react";

export function Pestanas({ titulos, children }: { titulos: string[]; children: ReactNode[] }) {
  const [activa, setActiva] = useState(0);
  const id = useId();
  const varias = titulos.length > 1;

  return (
    <div>
      <div
        role={varias ? "tablist" : undefined}
        className="-mx-[var(--margen)] flex overflow-x-auto px-[var(--margen)] pb-4 [scrollbar-width:none] md:pb-6 min-[1025px]:pb-8 [&::-webkit-scrollbar]:hidden"
      >
        {varias &&
          titulos.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`${id}-pestana-${i}`}
              aria-selected={i === activa}
              aria-controls={`${id}-panel-${i}`}
              onClick={() => setActiva(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  const siguiente = (i + (e.key === "ArrowRight" ? 1 : titulos.length - 1)) % titulos.length;
                  setActiva(siguiente);
                  document.getElementById(`${id}-pestana-${siguiente}`)?.focus();
                }
              }}
              tabIndex={i === activa ? 0 : -1}
              className={`mr-6 shrink-0 cursor-pointer font-titulo text-[length:var(--h6)] leading-[1.25] font-medium ${i === activa ? "underline underline-offset-8" : "opacity-60 hover:opacity-100"}`}
            >
              {t}
            </button>
          ))}
      </div>
      {children.map((panel, i) => (
        <div
          key={i}
          role={varias ? "tabpanel" : undefined}
          id={`${id}-panel-${i}`}
          aria-labelledby={varias ? `${id}-pestana-${i}` : undefined}
          hidden={i !== activa}
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
