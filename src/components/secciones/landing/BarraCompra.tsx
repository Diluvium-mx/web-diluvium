"use client";

// Barra de compra fija abajo en el celular: precio y el botón principal. Aparece cuando el botón de la primera
// pantalla ya quedó arriba (fuera de la vista) y se esconde al regresar. En B4 agrega el tamaño elegido o, si aún no
// eligen, lleva a los tamaños.

import { useEffect, useState } from "react";
import { agregarElegido, irATamanos, useElegido } from "./eleccion";
import { CLASE_BOTON } from "./piezas";

export function BarraCompra({
  precio,
  precioAntes,
  boton,
  enlace,
  conTamanos,
  textoElegir,
}: {
  precio: string;
  precioAntes: string | null;
  boton: string;
  enlace: string;
  conTamanos: boolean;
  textoElegir: string;
}) {
  const [visible, setVisible] = useState(false);
  const elegido = useElegido();

  // Se revisa al bajar (no con IntersectionObserver: al saltar de abajo hasta arriba el botón pasa de «fuera por
  // arriba» a «fuera por abajo» sin cruzar la pantalla y el observador no avisa).
  useEffect(() => {
    const ancla = document.getElementById("boton-principal");
    if (!ancla) return;
    let pendiente = 0;
    const revisar = () => {
      pendiente = 0;
      setVisible(ancla.getBoundingClientRect().bottom < 0);
    };
    const alBajar = () => {
      if (!pendiente) pendiente = requestAnimationFrame(revisar);
    };
    revisar();
    window.addEventListener("scroll", alBajar, { passive: true });
    window.addEventListener("resize", alBajar);
    return () => {
      cancelAnimationFrame(pendiente);
      window.removeEventListener("scroll", alBajar);
      window.removeEventListener("resize", alBajar);
    };
  }, []);

  const clase = `${CLASE_BOTON} min-h-12 flex-1 rounded-lg px-4 text-base shadow-none`;

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-linea bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-[transform,visibility] duration-300 md:hidden ${
        visible ? "visible translate-y-0" : "invisible translate-y-full"
      }`}
    >
      <div className="marco-version flex items-center gap-3 py-2.5">
        <p className="m-0 flex flex-col leading-tight text-marino">
          <span className="titulo-ancho text-[22px]">{precio}</span>
          {precioAntes && (
            <span className="text-[13px] text-texto-suave">
              antes <s>{precioAntes}</s>
            </span>
          )}
        </p>
        {conTamanos ? (
          <button
            type="button"
            data-evento={elegido === null ? "boton_portada" : "agrega_carrito"}
            onClick={() => (elegido === null ? irATamanos() : agregarElegido(elegido))}
            className={clase}
          >
            {elegido === null ? textoElegir : boton}
          </button>
        ) : (
          <a href={enlace} data-evento="boton_portada" className={clase}>
            {boton}
          </a>
        )}
      </div>
    </div>
  );
}
