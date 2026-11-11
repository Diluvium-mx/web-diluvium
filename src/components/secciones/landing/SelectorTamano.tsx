"use client";

// B4: los tamaños de la compuerta con sus medidas, «¿Cómo medir?», la medida especial y «Añadir al carrito» en la
// misma portada. Los tamaños son botones de opción (un solo grupo: flechas del teclado para moverse). Agregar usa el
// carrito de la tienda y abre el carrito lateral. Precio y existencias salen del catálogo.

import { useId, useState } from "react";
import type { Tamano } from "./datos";
import { agregarElegido, elegir, useElegido } from "./eleccion";
import { TablaMedidas } from "./TablaMedidas";
import { CLASE_BOTON, IconoFlecha } from "./piezas";

export function SelectorTamano({
  titulo,
  tamanos,
  textoMedir,
  textoMedida,
  textoEnlaceMedida,
  enlaceMedida,
  textoBoton,
  textoError,
  precio,
}: {
  titulo: string;
  tamanos: Tamano[];
  textoMedir: string;
  textoMedida: string;
  textoEnlaceMedida: string;
  enlaceMedida: string;
  textoBoton: string;
  textoError: string;
  precio: string;
}) {
  const elegido = useElegido();
  const [aviso, setAviso] = useState<{ tipo: "error" | "existencias"; texto: string } | null>(null);
  const nombre = useId();
  const idTitulo = `${nombre}-titulo`;
  const idAviso = `${nombre}-aviso`;

  return (
    <div id="tamanos">
      <fieldset className="m-0 border-0 p-0" aria-describedby={aviso ? idAviso : undefined}>
        {/* La leyenda flota para quedar en la misma línea que «¿Cómo medir?» (una <legend> no puede ir dentro de otra caja). */}
        <legend id={idTitulo} className="float-left flex min-h-11 items-center p-0 font-titulo text-[17px] font-bold">
          {titulo}
        </legend>
        {textoMedir && (
          <TablaMedidas
            texto={textoMedir}
            className="float-right min-h-11 cursor-pointer font-semibold underline decoration-2 underline-offset-4 hover:decoration-4"
          />
        )}
        <div className="clear-both grid grid-cols-3 gap-2 pt-1 md:grid-cols-5 lg:grid-cols-3">
          {tamanos.map((t) => {
            const agotado = t.existencias !== null && t.existencias <= 0;
            const activo = elegido === t.id;
            return (
              <label
                key={t.id}
                className={`relative flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 px-1.5 py-2 text-center transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marino ${
                  agotado
                    ? "cursor-not-allowed border-linea text-texto-suave line-through"
                    : activo
                      ? "border-marino bg-marino text-white"
                      : "border-linea bg-white hover:border-marino"
                }`}
              >
                <input
                  type="radio"
                  name={nombre}
                  value={t.id}
                  checked={activo}
                  disabled={agotado}
                  data-evento="elige_tamano"
                  onChange={() => {
                    elegir(t.id);
                    setAviso(null);
                  }}
                  className="sr-only"
                />
                <span className="text-[15px] leading-tight font-bold">{t.nombre}</span>
                {t.medidas && <span className={`text-[13px] leading-5 ${activo ? "text-white" : "text-texto-suave"}`}>{t.medidas}</span>}
                {agotado && <span className="text-[12px] leading-4 no-underline">Agotado</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

      {textoMedida && enlaceMedida && (
        <p className="m-0 mt-2 text-[15px] text-texto-suave">
          {textoMedida}{" "}
          <a href={enlaceMedida} className="inline-flex min-h-11 items-center font-semibold text-marino underline decoration-2 underline-offset-4">
            {textoEnlaceMedida}
          </a>
        </p>
      )}

      <button
        type="button"
        // Sin tamaño elegido no se agrega nada: no cuenta como «agrega_carrito».
        data-evento={elegido === null ? undefined : "agrega_carrito"}
        className={`${CLASE_BOTON} mt-3 w-full`}
        onClick={() => {
          if (elegido === null) {
            setAviso({ tipo: "error", texto: textoError || "Elige un tamaño para continuar." });
            document.querySelector<HTMLInputElement>(`input[name="${CSS.escape(nombre)}"]:not(:disabled)`)?.focus();
            return;
          }
          const tope = agregarElegido(elegido);
          setAviso(tope ? { tipo: "existencias", texto: tope } : null);
        }}
      >
        <span>
          {textoBoton} · {precio}
        </span>
        <IconoFlecha />
      </button>
      <p id={idAviso} role="status" className="m-0 min-h-0 text-[15px] font-semibold text-[#b42318] empty:hidden">
        {aviso?.texto ?? ""}
      </p>
    </div>
  );
}
