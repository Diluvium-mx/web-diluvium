"use client";

// Elegir el tamaño en C (25-nov-2026, para 40-60 años; reemplaza la regla que se arrastraba): una caja grande para
// escribir cuánto mide la entrada (sale el teclado de números) que elige sola el tamaño, y abajo la lista de tamaños
// como renglones grandes para tocar, cada uno con su medida y su precio. Luego el precio y «Añadir al carrito».
// Si la entrada es más angosta o más ancha que los tamaños, lo dice y ofrece la salida (WhatsApp o la XXL).

import { useState } from "react";
import { abrirCarrito, agregar, avisoExistencias } from "@/components/carrito/estado";
import { BOTON_C } from "./comun";

export type TamanoC = { id: number; nombre: string; medidas: string; precio: number; precioAntes: number | null; existencias: number | null };
export type TextosTamano = {
  pregunta: string;
  ayuda: string;
  teQueda: string;
  lista: string;
  anadir: string;
  agotado: string;
  masAncha: string;
  masAnchaEnlace: string;
  masAngosta: string;
  masAngostaEnlace: string;
};

const pesos = (n: number) => `$${n.toLocaleString("en-US")}`;
const rango = (m: string) => {
  const r = m.match(/(\d+)\D+(\d+)/);
  return r ? ([Number(r[1]), Number(r[2])] as const) : null;
};

export function ElegirTamanoC({ tamanos, textos, enlaceMasAncha, enlaceWhatsapp }: { tamanos: TamanoC[]; textos: TextosTamano; enlaceMasAncha?: string; enlaceWhatsapp?: string }) {
  const conMedidas = tamanos.length > 1 && tamanos.every((t) => rango(t.medidas));
  const [elegido, setElegido] = useState<number | undefined>(tamanos.length === 1 ? tamanos[0].id : undefined);
  const [cm, setCm] = useState("");
  const [aviso, setAviso] = useState("");
  const min = conMedidas ? rango(tamanos[0].medidas)![0] : 0;
  const max = conMedidas ? rango(tamanos[tamanos.length - 1].medidas)![1] : 0;
  const medida = Number(cm);
  const fuera = conMedidas && cm !== "" && medida > 0 ? (medida < min ? "angosta" : medida > max ? "ancha" : null) : null;
  const t = tamanos.find((x) => x.id === elegido);

  const escribir = (v: string) => {
    const limpio = v.replace(/\D/g, "").slice(0, 3);
    setCm(limpio);
    const n = Number(limpio);
    const t2 = tamanos.find((x) => {
      const r = rango(x.medidas);
      return r && n >= r[0] && n <= r[1];
    });
    if (t2) setElegido(t2.id);
  };
  const anadir = () => {
    if (!t || t.existencias === 0) return;
    const r = agregar(t.id, 1);
    setAviso(r.tope !== null ? avisoExistencias(r.tope) : "");
    abrirCarrito({ anadido: true });
  };

  return (
    <div className="text-[#06182f]">
      {conMedidas && (
        <>
          <label htmlFor="medida-c" className="block font-titulo text-[20px] font-medium">
            {textos.pregunta}
          </label>
          <p className="m-0 mt-1 text-[16px] text-[#45566a]">{textos.ayuda}</p>
          <div className="mt-3 flex items-center gap-3">
            <input
              id="medida-c"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ej. 95"
              value={cm}
              onChange={(e) => escribir(e.target.value)}
              className="h-16 w-36 rounded-2xl border-[2.5px] border-[#06182f] bg-white px-4 text-center font-titulo text-[28px] font-semibold outline-none placeholder:text-[20px] placeholder:font-normal placeholder:text-[#8a99aa] focus:border-[#1663a8] focus:ring-4 focus:ring-[#1663a8]/20"
            />
            <span className="text-[22px] font-semibold">cm</span>
          </div>
          {t && !fuera && cm !== "" && (
            <p className="m-0 mt-3 rounded-2xl bg-[#e3f5e8] px-4 py-3 text-[18px] text-[#14532d]" role="status">
              {textos.teQueda} <strong>{t.nombre}</strong> ({t.medidas}).
            </p>
          )}
          {fuera === "ancha" && (
            <p className="m-0 mt-3 rounded-2xl bg-[#fff4e0] px-4 py-3 text-[18px] text-[#7a4b00]" role="status">
              {textos.masAncha}{" "}
              {enlaceMasAncha && (
                <a href={enlaceMasAncha} className="font-semibold underline underline-offset-2">
                  {textos.masAnchaEnlace}
                </a>
              )}
            </p>
          )}
          {fuera === "angosta" && (
            <p className="m-0 mt-3 rounded-2xl bg-[#fff4e0] px-4 py-3 text-[18px] text-[#7a4b00]" role="status">
              {textos.masAngosta}{" "}
              {enlaceWhatsapp && (
                <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                  {textos.masAngostaEnlace}
                </a>
              )}
            </p>
          )}
          <p className="m-0 mt-6 font-titulo text-[18px] font-medium">{textos.lista}</p>
        </>
      )}
      {tamanos.length > 1 && (
        <div className="mt-3 grid gap-2.5" role="radiogroup" aria-label="Tamaño">
          {tamanos.map((x) => {
            const si = x.id === elegido;
            const agotado = x.existencias === 0;
            return (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={si}
                disabled={agotado}
                onClick={() => setElegido(x.id)}
                className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-[2.5px] px-4 text-left disabled:cursor-not-allowed disabled:opacity-50 ${si ? "border-[#1663a8] bg-[#eaf4fd]" : "border-[#dbe7f3] bg-white"}`}
              >
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border-[2.5px] ${si ? "border-[#1663a8]" : "border-[#8a99aa]"}`} aria-hidden="true">
                  {si && <span className="size-3.5 rounded-full bg-[#1663a8]" />}
                </span>
                <span className="flex-1">
                  <span className="block text-[18px] font-bold">{x.nombre}</span>
                  {x.medidas && <span className="block text-[16px] text-[#45566a]">{x.medidas}</span>}
                </span>
                <span className="font-titulo text-[19px] font-semibold">{agotado ? textos.agotado : pesos(x.precio)}</span>
              </button>
            );
          })}
        </div>
      )}
      {t && (
        <p className="m-0 mt-5 flex flex-wrap items-baseline gap-x-3 font-titulo text-[34px] leading-none font-semibold">
          {pesos(t.precio)}
          {t.precioAntes && <s className="text-[19px] font-normal text-[#45566a]">{pesos(t.precioAntes)}</s>}
          {t.precioAntes && <span className="rounded-full bg-[#e3f5e8] px-3 py-1 text-[16px] font-bold text-[#1a7f37]">-{Math.round(((t.precioAntes - t.precio) / t.precioAntes) * 100)}%</span>}
        </p>
      )}
      <button type="button" onClick={anadir} disabled={!t || t.existencias === 0} data-evento="anadir_carrito" className={`${BOTON_C} mt-4 sm:w-full`}>
        {t ? textos.anadir : textos.lista}
      </button>
      {aviso && <p className="m-0 mt-2 text-[16px] font-semibold text-[#b42318]">{aviso}</p>}
    </div>
  );
}
