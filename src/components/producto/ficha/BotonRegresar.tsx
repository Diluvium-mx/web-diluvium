"use client";

// Botón flotante «Regresar al producto»: aparece abajo a la derecha cuando ya se bajó 900 px más allá del inicio de
// la información del producto (medido en vivo en las tres vistas) y lleva de vuelta a ella.

import { useEffect, useState } from "react";
import { BOTON_PRIMARIO } from "../estilos";

const DISTANCIA = 900;

export function BotonRegresar({ destino }: { destino: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(destino);
    if (!el) return;
    const revisar = () => setVisible(window.scrollY > el.getBoundingClientRect().top + window.scrollY + DISTANCIA);
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    window.addEventListener("resize", revisar);
    return () => {
      window.removeEventListener("scroll", revisar);
      window.removeEventListener("resize", revisar);
    };
  }, [destino]);

  if (!visible) return null;
  return (
    <div className="fixed right-5 bottom-5 z-[100]">
      <a href={`#${destino}`} className={`${BOTON_PRIMARIO} min-h-10 px-5 py-1.5 text-base`}>
        Regresar al producto
      </a>
    </div>
  );
}
