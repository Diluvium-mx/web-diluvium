"use client";

// Trampa para robots de los formularios: un campo que una persona no ve (los robots lo llenan) y la hora en que se
// abrió el formulario (un envío en menos de 2.5 s no es de una persona). El servidor revisa las dos cosas
// (src/lib/formularios/acciones.ts). El captcha invisible llega en el paso de seguridad.

import { useEffect, useRef } from "react";
import type { Trampa } from "@/lib/formularios/acciones";

export function useTrampa() {
  const abierto = useRef(0);
  const campo = useRef<HTMLInputElement>(null);
  useEffect(() => {
    abierto.current = Date.now();
  }, []);

  const CampoTrampa = (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        No llenar
        <input ref={campo} type="text" name="sitio" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );

  const datos = (): Trampa => ({ sitio: campo.current?.value ?? "", abierto: abierto.current || undefined });
  return { CampoTrampa, datos, abierto };
}
