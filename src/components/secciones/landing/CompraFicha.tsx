"use client";

// Compra en la ficha de las versiones: tamaños, «¿Cuánto mide tu entrada?» (opcional), el botón y su aviso.
// Mapa de calor (11-nov-2026): elegir tamaño es lo primero que la gente sí hace y la guía «¿Qué tamaño necesito?»
// se abre y se cierra sin decidir. Por eso:
// - cada tamaño dice su medida, sin abrir nada;
// - con la medida de la entrada se elige solo el tamaño que le queda (o se ofrece la medida especial o WhatsApp);
// - el botón dice el precio del tamaño elegido y, sin tamaño, lleva a elegirlo en vez de fallar.
// El tamaño elegido lo comparten la barra de compra del celular y este bloque (eleccion.ts).

import { useId, useState } from "react";
import type { Tamano } from "./datos";
import { pesos } from "./datos";
import { agregarElegido, elegir, useElegido } from "./eleccion";
import { TablaMedidas } from "./TablaMedidas";
import { CLASE_BOTON, IconoFlecha, IconoWhatsapp } from "./piezas";

/** Avisa a la medición de algo que no es un clic (escribir la medida). */
function medir(nombre: string) {
  document.dispatchEvent(new CustomEvent("dlv-evento", { detail: nombre }));
}

const RANGO = /(\d+)\s*–\s*(\d+)/;

/** El tamaño que le queda a una entrada de «cm» de ancho. Los rangos van seguidos: 78.5 cm todavía es el primero. */
function tamanoPara(cm: number, tamanos: Tamano[]): { tamano: Tamano } | { fuera: "chica" | "grande" } | null {
  const conRango = tamanos
    .map((t) => {
      const m = t.medidas.match(RANGO);
      return m ? { t, desde: Number(m[1]), hasta: Number(m[2]) } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.desde - b.desde);
  if (!conRango.length || !Number.isFinite(cm) || cm <= 0) return null;
  if (cm < conRango[0].desde) return { fuera: "chica" };
  if (cm > conRango[conRango.length - 1].hasta + 0.99) return { fuera: "grande" };
  for (let i = 0; i < conRango.length; i++) {
    const siguiente = conRango[i + 1];
    if (!siguiente || cm < siguiente.desde) return { tamano: conRango[i].t };
  }
  return null;
}

export function CompraFicha({
  titulo,
  tamanos,
  textoMedir,
  textoAyuda,
  textoMedida,
  textoEnlaceMedida,
  enlaceMedida,
  textoBoton,
  textoError,
  whatsapp,
}: {
  titulo: string;
  tamanos: Tamano[];
  textoMedir: string;
  /** «¿Cuánto mide tu entrada?»: si viene vacío, no se muestra la ayuda para medir. */
  textoAyuda: string;
  textoMedida: string;
  textoEnlaceMedida: string;
  enlaceMedida: string;
  textoBoton: string;
  textoError: string;
  whatsapp: string;
}) {
  const elegido = useElegido();
  const [aviso, setAviso] = useState("");
  const [medida, setMedida] = useState("");
  const [medido, setMedido] = useState(false);
  const nombre = useId();
  const idAviso = `${nombre}-aviso`;
  const idAyuda = `${nombre}-ayuda`;

  const actual = tamanos.find((t) => t.id === elegido) ?? null;
  const precio = pesos(actual?.precio ?? Math.min(...tamanos.map((t) => t.precio)));
  const resultado = medida ? tamanoPara(Number(medida.replace(",", ".")), tamanos) : null;
  const unico = tamanos.length === 1;

  function alMedir(valor: string) {
    setMedida(valor);
    const r = valor ? tamanoPara(Number(valor.replace(",", ".")), tamanos) : null;
    if (r && "tamano" in r) {
      const agotado = r.tamano.existencias !== null && r.tamano.existencias <= 0;
      // Elegido por su medida: cuenta igual que tocar el tamaño.
      if (!agotado && r.tamano.id !== elegido) {
        elegir(r.tamano.id);
        medir("elige_tamano");
      }
    }
    if (!medido && valor.length >= 2) {
      setMedido(true);
      medir("usa_medida");
    }
  }

  return (
    <div>
      {textoAyuda && !unico && (
        <div className="mb-4 rounded-xl bg-niebla p-3.5">
          <label htmlFor={idAyuda} className="block font-titulo text-[16px] font-bold">
            {textoAyuda}
          </label>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative w-32">
              <input
                id={idAyuda}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Ej. 95"
                value={medida}
                onChange={(e) => alMedir(e.target.value.replace(/[^\d.,]/g, "").slice(0, 5))}
                aria-describedby={`${idAyuda}-resultado`}
                className="h-12 w-full rounded-lg border-2 border-linea bg-white pr-11 pl-3 text-[17px] font-semibold text-tinta placeholder:font-normal placeholder:text-texto-suave focus:border-marino focus:outline-none"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[15px] text-texto-suave">cm</span>
            </div>
            {textoMedir && (
              <TablaMedidas
                texto={textoMedir}
                className="min-h-11 cursor-pointer text-[15px] font-semibold underline decoration-2 underline-offset-4 hover:decoration-4"
              />
            )}
          </div>
          <p id={`${idAyuda}-resultado`} aria-live="polite" className="m-0 mt-2 min-h-5 text-[15px] leading-5 text-tinta">
            {resultado && "tamano" in resultado && (
              <>
                Te queda la <strong>{resultado.tamano.nombre}</strong> ({resultado.tamano.medidas}). Ya está elegida.
              </>
            )}
            {resultado && "fuera" in resultado && resultado.fuera === "grande" && (
              <>
                Tu entrada es más ancha:{" "}
                <a href={enlaceMedida} className="font-semibold text-marino underline decoration-2 underline-offset-4">
                  la hacemos a la medida
                </a>
                .
              </>
            )}
            {resultado && "fuera" in resultado && resultado.fuera === "chica" && (
              <>
                Tu entrada es más angosta.{" "}
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className="font-semibold text-marino underline decoration-2 underline-offset-4">
                  Escríbenos y vemos tu caso
                </a>
                .
              </>
            )}
            {!medida && <span className="text-texto-suave">Escribe el ancho de marco a marco y te decimos tu tamaño.</span>}
          </p>
        </div>
      )}

      {!unico && (
        <fieldset id="tamanos" className="m-0 scroll-mt-28 border-0 p-0" aria-describedby={aviso ? idAviso : undefined}>
          <legend className="float-left flex min-h-11 items-center p-0 font-titulo text-[17px] font-bold">
            {titulo}
            {actual && <span className="ml-2 font-sans text-[15px] font-semibold text-texto-suave">· {actual.nombre}</span>}
          </legend>
          {textoMedir && !textoAyuda && (
            <TablaMedidas
              texto={textoMedir}
              className="float-right min-h-11 cursor-pointer text-[15px] font-semibold underline decoration-2 underline-offset-4 hover:decoration-4"
            />
          )}
          <div className="clear-both grid grid-cols-3 gap-2 pt-1 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
            {tamanos.map((t) => {
              const agotado = t.existencias !== null && t.existencias <= 0;
              const activo = elegido === t.id;
              return (
                <label
                  key={t.id}
                  data-pieza={`tamano-${t.id}`}
                  className={`relative flex min-h-[60px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 px-1 py-1.5 text-center transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marino ${
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
                      setAviso("");
                    }}
                    className="sr-only"
                  />
                  <span className="text-[14.5px] leading-tight font-bold">{t.nombre}</span>
                  {t.medidas && <span className={`text-[13px] leading-5 ${activo ? "text-white" : "text-texto-suave"}`}>{t.medidas}</span>}
                  {agotado && <span className="text-[12px] leading-4 no-underline">Agotado</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {textoMedida && enlaceMedida && (
        <p className="m-0 mt-1 text-[15px] text-texto-suave">
          {textoMedida}{" "}
          <a href={enlaceMedida} className="inline-flex min-h-11 items-center font-semibold text-marino underline decoration-2 underline-offset-4">
            {textoEnlaceMedida}
          </a>
        </p>
      )}

      <button
        id="boton-principal"
        type="button"
        data-evento={elegido === null && !unico ? undefined : "agrega_carrito"}
        className={`${CLASE_BOTON} mt-2 w-full`}
        onClick={() => {
          const id = unico ? tamanos[0].id : elegido;
          if (id === null) {
            setAviso(textoError || "Elige un tamaño para continuar.");
            const grupo = document.getElementById("tamanos");
            grupo?.scrollIntoView({ block: "center", behavior: "smooth" });
            grupo?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus({ preventScroll: true });
            return;
          }
          setAviso(agregarElegido(id) ?? "");
        }}
      >
        <span>
          {textoBoton} · {precio}
        </span>
        <IconoFlecha />
      </button>
      <p id={idAviso} role="status" className="m-0 text-[15px] font-semibold text-[#b42318] empty:hidden">
        {aviso}
      </p>
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          data-evento="toca_whatsapp"
          className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1a7f37] px-4 text-center font-titulo text-[16px] font-bold text-[#14632b] hover:bg-[#1a7f37]/5"
        >
          <IconoWhatsapp className="size-5 text-[#1a7f37]" />
          Pregúntanos por WhatsApp
        </a>
      )}
    </div>
  );
}
