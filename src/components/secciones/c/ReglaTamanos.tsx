"use client";

// «Regla de tamaños» de C (nueva: en B se escribe la medida en una caja y se eligen botones): una regla de 69 a 120 cm
// con un tramo por tamaño; se arrastra el marcador hasta el ancho de la entrada y dice qué tamaño le queda, su precio
// y lo agrega al carrito. Si el producto no tiene medidas (repuestos), los tamaños van como fichas para tocar.

import { useState } from "react";
import { abrirCarrito, agregar, avisoExistencias } from "@/components/carrito/estado";
import { BOTON_C } from "./comun";

export type TamanoC = { id: number; nombre: string; medidas: string; precio: number; precioAntes: number | null; existencias: number | null };
export type TextosRegla = { mide: string; teQueda: string; anadir: string; agotado: string; masAncha: string; masAngosta: string };

const pesos = (n: number) => `$${n.toLocaleString("en-US")}`;
const rango = (m: string) => {
  const r = m.match(/(\d+)\D+(\d+)/);
  return r ? [Number(r[1]), Number(r[2])] : null;
};

export function ReglaTamanos({
  tamanos,
  textos,
  oscuro = false,
  enlaceMasAncha,
}: {
  tamanos: TamanoC[];
  textos: TextosRegla;
  oscuro?: boolean;
  enlaceMasAncha?: string;
}) {
  const conRango = tamanos.map((t) => ({ ...t, r: rango(t.medidas) })).filter((t): t is TamanoC & { r: number[] } => Boolean(t.r));
  const usaRegla = conRango.length > 1 && conRango.length === tamanos.length;
  const min = usaRegla ? conRango[0].r[0] : 0;
  const max = usaRegla ? conRango[conRango.length - 1].r[1] : 0;
  const [cm, setCm] = useState(usaRegla ? Math.round((min + max) / 2) : 0);
  const [elegidoFicha, setElegidoFicha] = useState(tamanos.find((t) => t.existencias !== 0)?.id ?? tamanos[0]?.id);
  const [aviso, setAviso] = useState("");
  const t = usaRegla ? conRango.find((x) => cm >= x.r[0] && cm <= x.r[1]) ?? conRango[conRango.length - 1] : tamanos.find((x) => x.id === elegidoFicha);
  const agotado = t?.existencias === 0;
  const anadir = () => {
    if (!t || agotado) return;
    const r = agregar(t.id, 1);
    setAviso(r.tope !== null ? avisoExistencias(r.tope) : "");
    abrirCarrito({ anadido: true });
  };
  const suave = oscuro ? "text-white/70" : "text-texto-suave";

  return (
    <div>
      {usaRegla ? (
        <>
          <div className="flex items-end justify-between">
            <p className={`m-0 text-[15px] font-semibold ${suave}`}>{textos.mide}</p>
            <p className="m-0 font-titulo text-[40px] leading-none font-semibold tabular-nums">
              {cm}
              <span className="ml-1 text-[18px]">cm</span>
            </p>
          </div>
          <div className="relative mt-4 h-14">
            <div className="absolute inset-x-0 top-3 flex h-8 overflow-hidden rounded-xl">
              {conRango.map((x, i) => (
                <div
                  key={x.id}
                  style={{ flexGrow: x.r[1] - x.r[0] + 1 }}
                  className={`flex items-center justify-center border-r text-[11px] font-bold last:border-r-0 ${
                    x.id === t?.id ? "border-transparent bg-[#3fa9f5] text-white" : oscuro ? "border-white/10 bg-white/10 text-white/70" : `border-white bg-[#d8ecfd] text-[#1b5f99] ${i % 2 ? "bg-[#c8e3fb]" : ""}`
                  } ${x.existencias === 0 ? "line-through opacity-50" : ""}`}
                >
                  {x.nombre.split(" ").map((p) => p[0]).join("")}
                </div>
              ))}
            </div>
            {/* Marcas cada 10 cm debajo */}
            <div className={`absolute inset-x-0 bottom-0 flex justify-between text-[10.5px] tabular-nums ${suave}`} aria-hidden="true">
              <span>{min}</span>
              <span>{Math.round((min + max) / 2)}</span>
              <span>{max}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={cm}
              onChange={(e) => setCm(Number(e.target.value))}
              aria-label={textos.mide}
              aria-valuetext={`${cm} centímetros: ${t?.nombre ?? ""}`}
              className="regla-c absolute inset-x-0 top-0 h-14 w-full cursor-pointer"
            />
          </div>
          <p className={`m-0 mt-3 text-[16px] ${oscuro ? "text-white" : "text-tinta"}`}>
            {textos.teQueda} <strong>{t?.nombre}</strong> <span className={suave}>({t?.medidas})</span>
          </p>
          {enlaceMasAncha && (
            <p className={`m-0 mt-1 text-[14px] ${suave}`}>
              {textos.masAncha}{" "}
              <a href={enlaceMasAncha} className="font-semibold underline underline-offset-2">
                {textos.masAngosta}
              </a>
            </p>
          )}
        </>
      ) : (
        tamanos.length > 1 && (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tamaño">
            {tamanos.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={x.id === elegidoFicha}
                disabled={x.existencias === 0}
                onClick={() => setElegidoFicha(x.id)}
                className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-semibold disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                  x.id === elegidoFicha ? "border-[#3fa9f5] bg-[#3fa9f5] text-white" : oscuro ? "border-white/25 text-white" : "border-linea text-tinta"
                }`}
              >
                {x.nombre}
              </button>
            ))}
          </div>
        )
      )}
      {t && (
        <div className="mt-5 flex items-center gap-4">
          <p className="m-0 font-titulo text-[30px] leading-none font-semibold">
            {pesos(t.precio)}
            {t.precioAntes && <s className={`ml-2 text-[16px] font-normal ${suave}`}>{pesos(t.precioAntes)}</s>}
          </p>
          {t.precioAntes && (
            <span className="rounded-full bg-[#e3f5e8] px-2.5 py-1 text-[13px] font-bold text-[#1a7f37]">-{Math.round(((t.precioAntes - t.precio) / t.precioAntes) * 100)}%</span>
          )}
        </div>
      )}
      <button type="button" onClick={anadir} disabled={!t || agotado} data-evento="anadir_carrito" className={`${BOTON_C} mt-4 w-full`}>
        {agotado ? textos.agotado : textos.anadir}
      </button>
      {aviso && <p className="m-0 mt-2 text-[14px] font-semibold text-[#b42318]">{aviso}</p>}
    </div>
  );
}
