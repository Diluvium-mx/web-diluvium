"use client";

// Botón «Quick add» de las tarjetas de la búsqueda, como en vivo: si el producto no tiene tamaños, lo agrega y abre el
// carrito lateral; si tiene, abre la ventana «Select variant» (sale abajo a la derecha) con los tamaños en cuadros de
// 48 px, el aviso de existencias, el subtotal, «Añadir al carrito» y «Ver detalles». Medidas de la tienda en vivo
// (4-nov-2026).

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconoEquis } from "@/components/producto/IconosColeccion";
import { AvisoExistencias, Cuadro } from "@/components/producto/ficha/Variantes";
import { BOTON_PRIMARIO } from "@/components/producto/estilos";
import { precioTexto } from "@/components/producto/formato-precio";
import { articulosDeProducto, type ArticuloCatalogo } from "./catalogo";
import { abrirCarrito, agregar, avisoExistencias } from "./estado";
import { AvisoError } from "./piezas";

const BOTON_QUICK_ADD =
  "relative isolate flex min-h-10 w-full cursor-pointer items-center justify-center overflow-hidden bg-white px-5 py-1.5 font-titulo leading-[normal] font-medium shadow-[inset_0_0_0_1px_rgba(0,66,136,0.12)] transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 after:bg-azul-oscuro after:transition-[bottom] after:duration-[400ms] hover:text-white hover:after:bottom-0";

const hayPiezas = (a: ArticuloCatalogo) => a.existencias === null || a.existencias > 0;

function Ventana({ producto, variantes, cerrar }: { producto: string; variantes: ArticuloCatalogo[]; cerrar: () => void }) {
  // Como la tienda: abre en el primer tamaño que se puede comprar.
  const [elegida, setElegida] = useState(() => Math.max(0, variantes.findIndex(hayPiezas)));
  const [visible, setVisible] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const dialogo = useRef<HTMLDivElement>(null);
  const v = variantes[elegida];
  const agotada = !hayPiezas(v);

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setVisible(true));
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // El foco entra a la ventana (sin marcar ningún botón, como en vivo).
    dialogo.current?.focus({ preventScroll: true });
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    return () => {
      cancelAnimationFrame(cuadro);
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", tecla);
    };
  }, [cerrar]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-end overflow-hidden bg-[rgba(23,22,26,0.5)] p-6 text-azul transition-opacity duration-250 md:p-12 min-[1025px]:p-16 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={(e) => e.target === e.currentTarget && cerrar()}
    >
      <div
        ref={dialogo}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Select variant"
        className="max-h-full w-full overflow-x-hidden text-left outline-none overflow-y-auto bg-white [scrollbar-width:none] md:w-[400px] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex flex-col">
          <div className="sticky top-0 z-[2] flex items-center justify-between bg-white py-3 pr-3 pl-6">
            <span className="font-titulo font-medium" style={{ fontSize: "var(--h6)", lineHeight: 1.25 }}>
              Select variant
            </span>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={cerrar}
              className="flex size-9 cursor-pointer items-center justify-center min-[1025px]:size-10"
            >
              <IconoEquis className="size-4 min-[1025px]:size-5" />
            </button>
          </div>

          <div className="px-6 pt-6 pb-6">
            <fieldset className="m-0 flex min-w-0 flex-wrap border-0 p-0">
              <legend className="mb-2 w-full p-0 md:mb-3 min-[1025px]:mb-4">
                <span className="font-bold">Tamaño</span>{" "}
                <span className="text-[13.6px] leading-[17px] text-current/60">{v.opcion}</span>
              </legend>
              <div className="flex w-full flex-wrap gap-2 md:gap-3 min-[1025px]:gap-4">
                {variantes.map((x, i) => {
                  const id = `rapido-${producto}-${i}`;
                  return (
                    <div key={x.id} className="relative">
                      <input
                        type="radio"
                        id={id}
                        name={`rapido-${producto}`}
                        value={x.opcion ?? ""}
                        checked={i === elegida}
                        onChange={() => {
                          setElegida(i);
                          setAviso(null);
                        }}
                        aria-label="Tamaño"
                        className="peer absolute size-px appearance-none overflow-hidden opacity-0"
                      />
                      <label
                        htmlFor={id}
                        className="block rounded-[8px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul"
                      >
                        <Cuadro v={{ titulo: x.opcion ?? "" }} elegida={i === elegida} agotada={!hayPiezas(x)} chico />
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            <div className="mt-8">
              <AvisoExistencias n={v.existencias} />
            </div>
          </div>

          <div className="sticky bottom-0 z-[2] flex flex-col items-center gap-2 bg-white px-6 pt-4 pb-6">
            <div className="flex w-full items-center justify-between">
              <span>Subtotal</span>
              <span className="font-bold">{precioTexto(v.precio)}</span>
            </div>
            {aviso && (
              <AvisoError className="w-full">
                <span className="text-[13.6px] leading-6">{aviso}</span>
              </AvisoError>
            )}
            <div className="flex w-full flex-col">
              <button
                type="button"
                disabled={agotada}
                onClick={() => {
                  const { tope } = agregar(v.id, 1);
                  if (tope !== null) {
                    setAviso(avisoExistencias(tope));
                    return;
                  }
                  cerrar();
                  abrirCarrito({ anadido: true });
                }}
                className={`${BOTON_PRIMARIO} min-h-10 w-full cursor-pointer px-5 py-1.5 leading-[normal]`}
              >
                {agotada ? "Agotado" : "Añadir al carrito"}
              </button>
            </div>
            <div className="w-full text-center">
              <Link
                href={`/products/${producto}`}
                className="relative inline-flex min-h-10 items-center justify-center py-1.5 font-titulo leading-6 font-medium text-naranja underline decoration-1"
              >
                Ver detalles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgregarRapido({ producto }: { producto: string }) {
  const [abierta, setAbierta] = useState(false);
  const [variantes] = useState(() => articulosDeProducto(producto));
  const cerrar = useCallback(() => setAbierta(false), []);
  const sinTamanos = variantes.length === 1 && variantes[0].opcion === null;

  return (
    <>
      <button
        type="button"
        aria-label="Quick add"
        aria-haspopup={sinTamanos ? undefined : "dialog"}
        className={BOTON_QUICK_ADD}
        onClick={() => {
          if (!sinTamanos) {
            setAbierta(true);
            return;
          }
          // Sin tamaños: se agrega directo y se abre el carrito, como en vivo.
          const { tope } = agregar(variantes[0].id, 1);
          if (tope === null) abrirCarrito({ anadido: true });
        }}
      >
        Quick add
      </button>
      {abierta && <Ventana producto={producto} variantes={variantes} cerrar={cerrar} />}
    </>
  );
}
