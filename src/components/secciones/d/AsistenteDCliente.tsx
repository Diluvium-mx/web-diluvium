"use client";

// El asistente de 3 pasos de D (propuesta T2, 25-nov-2026; como el recomendador de Andafacil): 1) ¿qué pasa en tu casa
// cuando llueve fuerte? (cada respuesta lleva a un producto: la compuerta, la mini o el tapón), 2) ¿qué tan ancha es
// tu entrada? (botones grandes con cada medida real y «Más de 120 cm»), 3) la recomendación con su precio y «Añadir al
// carrito». Los tres pasos están siempre en la página (solo se esconden), para que sus enlaces se queden en la versión.

import { useRef, useState } from "react";
import type { Tamano } from "../landing/datos";
import { BOTON_D, BOTON_D_CONTORNO, IconoD } from "./comun";
import { anadirAlCarrito, BotonesTamanoD, PrecioD, type TextosElegirD } from "./ElegirTamanoD";

export type OpcionAsistente = {
  id: string;
  icono: string;
  texto: string;
  subtexto: string;
  /** Si la respuesta lleva directo a otra página (el tapón para la coladera). */
  enlace?: string;
  /** Si la respuesta lleva al paso 2: el producto y sus tamaños. */
  producto?: { nombre: string; tamanos: Tamano[] };
};

export type TextosAsistente = TextosElegirD & {
  paso: string;
  pregunta1: string;
  resultado: string;
  recomendamos: string;
  empezar: string;
  atras: string;
};

export function AsistenteDCliente({ opciones, textos, enlaceMasAncha }: { opciones: OpcionAsistente[]; textos: TextosAsistente; enlaceMasAncha?: string }) {
  const [paso, setPasoEstado] = useState(1);
  const caja = useRef<HTMLDivElement>(null);
  /** Cambia de paso y, si el principio del asistente quedó arriba de la pantalla, lo vuelve a mostrar. */
  const setPaso = (n: number) => {
    setPasoEstado(n);
    const top = caja.current?.getBoundingClientRect().top ?? 0;
    if (top < 80) caja.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [opcion, setOpcion] = useState<string | null>(null);
  const [tamano, setTamano] = useState<number | null>(null);
  const [aviso, setAviso] = useState("");
  const elegida = opciones.find((o) => o.id === opcion);
  const t = elegida?.producto?.tamanos.find((x) => x.id === tamano);

  return (
    <div ref={caja} className="scroll-mt-28 text-[#0b2545]">
      <div className="flex gap-2" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-2.5 flex-1 rounded-full ${i <= paso ? "bg-[#0b2545]" : "bg-[#dde2e8]"}`} />
        ))}
      </div>
      <p className="m-0 mt-4 text-[16px] font-bold text-[#4a5568]" aria-live="polite">
        {textos.paso.replace("{n}", String(paso))}
      </p>

      {/* Paso 1 */}
      <div hidden={paso !== 1}>
        <p className="m-0 mt-1 font-titulo text-[24px] leading-tight font-semibold">{textos.pregunta1}</p>
        <div className="mt-4 grid gap-3">
          {opciones.map((o) => {
            const dentro = (
              <>
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#fff4d1] text-[#0b2545]">
                  <IconoD nombre={o.icono} className="size-9" />
                </span>
                <span className="flex-1">
                  <span className="block text-[19px] leading-snug font-bold">{o.texto}</span>
                  {o.subtexto && <span className="mt-0.5 block text-[16px] leading-snug text-[#4a5568]">{o.subtexto}</span>}
                </span>
                <span aria-hidden="true" className="text-[26px] text-[#9a6700]">
                  ›
                </span>
              </>
            );
            const clase = "flex min-h-[76px] w-full cursor-pointer items-center gap-3.5 rounded-xl border-2 border-[#c9d1db] bg-white px-4 py-3 text-left hover:border-[#0b2545]";
            return o.enlace ? (
              <a key={o.id} href={o.enlace} data-pieza={o.id} className={clase}>
                {dentro}
              </a>
            ) : (
              <button
                key={o.id}
                type="button"
                data-pieza={o.id}
                onClick={() => {
                  setOpcion(o.id);
                  setTamano(null);
                  setPaso(2);
                }}
                className={clase}
              >
                {dentro}
              </button>
            );
          })}
        </div>
      </div>

      {/* Paso 2: uno por cada producto (escondidos los demás) */}
      {opciones
        .filter((o) => o.producto)
        .map((o) => (
          <div key={o.id} hidden={paso !== 2 || opcion !== o.id}>
            <p className="m-0 mt-1 font-titulo text-[24px] leading-tight font-semibold">{textos.pregunta}</p>
            {textos.ayuda && <p className="m-0 mt-1 mb-4 text-[17px] text-[#4a5568]">{textos.ayuda}</p>}
            <BotonesTamanoD
              tamanos={o.producto!.tamanos}
              elegido={tamano ?? undefined}
              elegir={(id) => {
                setTamano(id);
                setAviso("");
                setPaso(3);
              }}
              textos={textos}
              enlaceMasAncha={enlaceMasAncha}
            />
            <button type="button" onClick={() => setPaso(1)} className="mt-4 min-h-12 cursor-pointer text-[17px] font-semibold text-[#0b2545] underline underline-offset-4">
              ← {textos.atras}
            </button>
          </div>
        ))}

      {/* Paso 3 */}
      <div hidden={paso !== 3}>
        <p className="m-0 mt-1 font-titulo text-[24px] leading-tight font-semibold">{textos.resultado}</p>
        {elegida?.producto && t && (
          <div className="mt-4 rounded-xl border-2 border-[#0b2545] bg-[#f4f6f8] p-5">
            <p className="m-0 text-[18px] leading-snug">
              {textos.recomendamos} <strong>{elegida.producto.nombre}</strong>
            </p>
            <p className="m-0 mt-1 text-[18px]">
              {textos.elegiste} <strong>{t.nombre}</strong>
              {t.medidas ? ` (${t.medidas})` : ""}
            </p>
            <div className="mt-4">
              <PrecioD precio={t.precio} antes={t.precioAntes} />
            </div>
            <button type="button" onClick={() => setAviso(anadirAlCarrito(t))} disabled={t.existencias === 0} data-evento="anadir_carrito" className={`${BOTON_D} mt-5 sm:w-full`}>
              {t.existencias === 0 ? textos.agotado : textos.anadir}
            </button>
            {aviso && (
              <p className="m-0 mt-2 text-[17px] font-semibold text-[#b42318]" role="status">
                {aviso}
              </p>
            )}
          </div>
        )}
        <div className="mt-4 grid gap-2 sm:flex sm:gap-3">
          <button type="button" onClick={() => setPaso(2)} className={BOTON_D_CONTORNO}>
            ← {textos.atras}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpcion(null);
              setTamano(null);
              setPaso(1);
            }}
            className="min-h-12 cursor-pointer px-3 text-[17px] font-semibold text-[#0b2545] underline underline-offset-4"
          >
            {textos.empezar}
          </button>
        </div>
      </div>
    </div>
  );
}
