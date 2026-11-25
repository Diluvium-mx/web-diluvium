"use client";

// «Si lo pides hoy, llega entre el jue 27 nov y el mar 2 dic»: de 3 a 5 días hábiles desde hoy (sin sábados ni
// domingos). Se calcula en el teléfono de quien visita, con su fecha; la página es fija y no sabe qué día es.

import { useSyncExternalStore } from "react";

function sumarHabiles(desde: Date, dias: number) {
  const d = new Date(desde);
  let n = 0;
  while (n < dias) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) n += 1;
  }
  return d;
}

const formato = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" });
const nada = () => () => {};

export function EntregaC({ prefijo, y }: { prefijo: string; y: string }) {
  const texto = useSyncExternalStore(
    nada,
    () => {
      const hoy = new Date();
      return `${formato.format(sumarHabiles(hoy, 3))} ${y} ${formato.format(sumarHabiles(hoy, 5))}`.replace(/\./g, "");
    },
    () => "",
  );
  if (!texto) return <p className="m-0 mt-4 h-11" aria-hidden="true" />;
  return (
    <p className="m-0 mt-4 flex min-h-11 items-center gap-2.5 rounded-2xl bg-[#e3f5e8] px-4 py-2.5 text-[17px] text-[#14532d]">
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7zM6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      </svg>
      <span>
        {prefijo} <strong>{texto}</strong>
      </span>
    </p>
  );
}
