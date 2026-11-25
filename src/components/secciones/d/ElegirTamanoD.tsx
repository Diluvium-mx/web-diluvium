"use client";

// Elegir el tamaño en D (25-nov-2026), sin escribir la medida (eso quedó solo para B): botones grandes, uno por cada
// medida real de la entrada («69–78 cm», con el nombre del tamaño abajo), en dos columnas; el último, «Más de 120 cm»,
// lleva a la que se hace a la medida. Los productos que no tienen medidas (la funda, el tapón) muestran su nombre y,
// si cambia, su precio. Abajo, el precio del tamaño elegido y «Añadir al carrito», que usa el mismo carrito de B y C.
// Lo usan la ficha de D (d-ficha) y el paso 2 del asistente (d-asistente).

import { useRef, useState } from "react";
import type { Tamano } from "../landing/datos";
import { abrirCarrito, agregar, avisoExistencias } from "@/components/carrito/estado";
import { BOTON_D } from "./comun";

export const pesosD = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const rango = (m: string) => {
  const r = m.match(/(\d+)\D+(\d+)/);
  return r ? ([Number(r[1]), Number(r[2])] as const) : null;
};
/** ¿Los tamaños son por medida de la entrada («69–78 cm»)? */
export const conMedidas = (tamanos: Tamano[]) => tamanos.length > 1 && tamanos.every((t) => rango(t.medidas));
/** Hasta cuántos centímetros llega el tamaño más grande. */
export const hastaCm = (tamanos: Tamano[]) => (conMedidas(tamanos) ? rango(tamanos[tamanos.length - 1].medidas)![1] : null);

export type TextosElegirD = {
  pregunta: string;
  ayuda: string;
  /** «Más de {hasta} cm». */
  masAncha: string;
  masAnchaTexto: string;
  elegiste: string;
  anadir: string;
  agotado: string;
  falta: string;
};

/** Los botones de los tamaños (sin el precio ni el botón de comprar). */
export function BotonesTamanoD({
  tamanos,
  elegido,
  elegir,
  textos,
  enlaceMasAncha,
}: {
  tamanos: Tamano[];
  elegido: number | undefined;
  elegir: (id: number) => void;
  textos: Pick<TextosElegirD, "masAncha" | "masAnchaTexto" | "agotado">;
  enlaceMasAncha?: string;
}) {
  const medidas = conMedidas(tamanos);
  const preciosDistintos = new Set(tamanos.map((t) => t.precio)).size > 1;
  const hasta = hastaCm(tamanos);
  return (
    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Tamaño">
      {tamanos.map((t) => {
        const si = t.id === elegido;
        const agotado = t.existencias === 0;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={si}
            disabled={agotado}
            onClick={() => elegir(t.id)}
            className={`flex min-h-[72px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-center text-[#0b2545] disabled:cursor-not-allowed disabled:opacity-45 ${si ? "border-[#0b2545] bg-[#0b2545] text-white" : "border-[#c9d1db] bg-white hover:border-[#0b2545]"}`}
          >
            <span className="font-titulo text-[20px] leading-tight font-bold">{medidas ? t.medidas : t.nombre}</span>
            {(medidas || preciosDistintos || agotado) && (
              <span className={`mt-0.5 text-[15px] ${si ? "text-white/85" : "text-[#4a5568]"}`}>
                {agotado ? textos.agotado : medidas ? t.nombre : pesosD(t.precio)}
              </span>
            )}
          </button>
        );
      })}
      {medidas && enlaceMasAncha && hasta && (
        <a href={enlaceMasAncha} {...(/^https?:/.test(enlaceMasAncha) ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex min-h-[72px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#9a6700] bg-[#fffaeb] px-2 py-2 text-center text-[#7a5200]">
          <span className="font-titulo text-[18px] leading-tight font-bold">{textos.masAncha.replace("{hasta}", String(hasta))}</span>
          <span className="mt-0.5 text-[15px] leading-snug">{textos.masAnchaTexto}</span>
        </a>
      )}
    </div>
  );
}

/** El precio grande con el de antes tachado y el descuento. */
export function PrecioD({ precio, antes, grande = false }: { precio: number; antes: number | null; grande?: boolean }) {
  const menos = antes && antes > precio ? Math.round(((antes - precio) / antes) * 100) : null;
  return (
    <p className={`m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-titulo leading-none font-bold text-[#0b2545] ${grande ? "text-[46px] md:text-[54px]" : "text-[38px]"}`}>
      {pesosD(precio)}
      {antes && antes > precio && <s className="text-[21px] font-normal text-[#4a5568]">{pesosD(antes)}</s>}
      {menos && <span className="rounded-md bg-[#ffc83d] px-2.5 py-1 text-[17px] font-bold text-[#0b2545]">-{menos}%</span>}
    </p>
  );
}

/** Añade el tamaño al carrito y lo abre (el mismo carrito de B y C). Regresa el aviso de existencias, si hay. */
export function anadirAlCarrito(t: Tamano): string {
  const r = agregar(t.id, 1);
  abrirCarrito({ anadido: true });
  return r.tope !== null ? avisoExistencias(r.tope) : "";
}

export function ElegirTamanoD({ tamanos, textos, enlaceMasAncha }: { tamanos: Tamano[]; textos: TextosElegirD; enlaceMasAncha?: string }) {
  const [elegido, setElegido] = useState<number | undefined>(tamanos.length === 1 ? tamanos[0].id : undefined);
  const [aviso, setAviso] = useState("");
  const caja = useRef<HTMLDivElement>(null);
  const t = tamanos.find((x) => x.id === elegido);
  const base = tamanos.reduce((m, x) => (x.precio < m.precio ? x : m), tamanos[0]);
  const anadir = () => {
    if (!t) {
      setAviso(textos.falta);
      caja.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (t.existencias === 0) return;
    setAviso(anadirAlCarrito(t));
  };
  if (!tamanos.length) return null;
  return (
    <div className="text-[#0b2545]">
      {tamanos.length > 1 && (
        <div ref={caja}>
          <p className="m-0 font-titulo text-[21px] font-semibold">{textos.pregunta}</p>
          {textos.ayuda && <p className="m-0 mt-1 mb-3 text-[17px] text-[#4a5568]">{textos.ayuda}</p>}
          <BotonesTamanoD
            tamanos={tamanos}
            elegido={elegido}
            elegir={(id) => {
              setElegido(id);
              setAviso("");
            }}
            textos={textos}
            enlaceMasAncha={enlaceMasAncha}
          />
        </div>
      )}
      <div className="mt-5" aria-live="polite">
        {t && tamanos.length > 1 && (
          <p className="m-0 mb-2 text-[18px]">
            {textos.elegiste} <strong>{t.nombre}</strong>
            {t.medidas ? ` (${t.medidas})` : ""}
          </p>
        )}
        <PrecioD precio={(t ?? base).precio} antes={(t ?? base).precioAntes} />
      </div>
      <button type="button" onClick={anadir} disabled={t?.existencias === 0} data-evento="anadir_carrito" className={`${BOTON_D} mt-4 sm:w-full`}>
        {textos.anadir}
      </button>
      {aviso && (
        <p className="m-0 mt-2 text-[17px] font-semibold text-[#b42318]" role="status">
          {aviso}
        </p>
      )}
    </div>
  );
}
