"use client";

// Fecha estimada de entrega (hoy la pone la app NestScale): «Envío gratis a <estado> 🇲🇽» y tres pasos con fecha
// (pedido, en ruta, entrega). Las fechas se calculan en el navegador con su hora, como la app. El estado sale de la
// ubicación aproximada por IP con el mismo servicio que usa la app en vivo (ipinfo.io); si no responde, dice «México».

import { useEffect, useState } from "react";
import { fechasEntrega } from "./entrega";
import { IconoPaso } from "./Iconos";

type Lugar = { nombre: string; pais: string };

function BanderaMexico() {
  return (
    <svg viewBox="0 0 20 11" width={20} height={11} className="inline align-baseline" aria-hidden="true" focusable="false">
      <rect width="7" height="11" fill="#006847" />
      <rect x="7" width="6" height="11" fill="#fff" />
      <rect x="13" width="7" height="11" fill="#ce1126" />
      <circle cx="10" cy="5.5" r="1.4" fill="#8c6a3a" />
    </svg>
  );
}

const PASOS = ["Pedido", "En ruta", "Entrega"] as const;

export function EntregaEstimada() {
  const [fechas, setFechas] = useState<ReturnType<typeof fechasEntrega> | null>(null);
  const [lugar, setLugar] = useState<Lugar | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la fecha es la del navegador del cliente
    setFechas(fechasEntrega(new Date()));
    const control = new AbortController();
    fetch("https://ipinfo.io/json", { signal: control.signal, credentials: "omit", referrerPolicy: "no-referrer" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { region?: unknown; country?: unknown }) =>
        setLugar({
          nombre: typeof d.region === "string" && d.region ? d.region : "México",
          pais: typeof d.country === "string" ? d.country : "MX",
        }),
      )
      .catch(() => {
        if (!control.signal.aborted) setLugar({ nombre: "México", pais: "MX" });
      });
    return () => control.abort();
  }, []);

  const valores = fechas ? [fechas.pedido, fechas.enRuta, fechas.entrega] : ["", "", ""];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="m-0 min-h-[22px] leading-[22px]">
            {lugar && (
              <>
                Envío gratis a {lugar.nombre}
                {"\u00a0 "}
                {lugar.pais === "MX" && <BanderaMexico />}
              </>
            )}
          </p>
        </div>
        <div className="flex">
          {PASOS.map((paso, i) => (
            <div key={paso} className="relative flex flex-1 flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#1c397b]">
                <IconoPaso paso={i as 0 | 1 | 2} />
              </div>
              {i === 1 && (
                <>
                  <div className="absolute top-4 left-[-30%] h-px w-[60%] bg-[#d9d9d9]" />
                  <div className="absolute top-4 left-[70%] h-px w-[60%] bg-[#d9d9d9]" />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="-mt-2 flex">
          {PASOS.map((paso, i) => (
            <div key={paso} className="flex flex-1 flex-col items-center">
              <span className="text-sm leading-6 text-[#1a1a1a]">{paso}</span>
              <span className="min-h-[22px] text-xs leading-[22px] text-[#666]">{valores[i]}</span>
            </div>
          ))}
        </div>
      </div>
      {/* En vivo aquí va «Powered by NestScale» (la marca de la app); se deja solo su espacio. */}
      <div className="h-6" aria-hidden="true" />
    </div>
  );
}
