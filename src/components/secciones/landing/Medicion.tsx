"use client";

// Medición de las versiones, igual que la prueba de Shopify (tienda-tema/prueba-b/snippets/ab-prueba.liquid):
// - etiqueta la visita en Clarity con «experiment» y «version» (A, B1…);
// - manda los mismos eventos: boton_portada, elige_tamano, abre_tabla, agrega_carrito, toca_whatsapp, ve_precio y
//   interaccion_util (una sola vez por visita a la página, con la primera acción útil).
// Cada elemento dice su evento con data-evento="…"; los enlaces a WhatsApp se reconocen solos. El precio que cuenta
// como «visto» lleva data-precio. Sin Clarity no pasa nada; en desarrollo los eventos salen en la consola.

import { useEffect } from "react";

type Clarity = (...args: unknown[]) => void;

const UTILES = new Set(["elige_tamano", "abre_tabla", "agrega_carrito", "toca_whatsapp"]);

function clarity(): Clarity | null {
  const c = (window as unknown as { clarity?: Clarity }).clarity;
  return typeof c === "function" ? c : null;
}

export function Medicion({ experimento, version }: { experimento: string; version: string }) {
  useEffect(() => {
    let etiquetada = false;
    let util = false;
    const desarrollo = process.env.NODE_ENV !== "production";
    (window as unknown as { dlvVersion?: string }).dlvVersion = version;

    // Clarity puede cargar después de la página: se vuelve a intentar con cada evento.
    const etiquetar = () => {
      const c = clarity();
      if (etiquetada || !c) return;
      try {
        c("set", "experiment", experimento);
        c("set", "version", version);
        etiquetada = true;
      } catch {
        // Clarity falló: la página sigue igual.
      }
    };

    const evento = (nombre: string) => {
      etiquetar();
      if (desarrollo) console.info(`[medición ${version}] ${nombre}`);
      try {
        clarity()?.("event", nombre);
      } catch {
        // Sin Clarity no se mide, y no pasa nada.
      }
      if (UTILES.has(nombre) && !util) {
        util = true;
        evento("interaccion_util");
      }
    };

    etiquetar();

    const alTocar = (e: MouseEvent) => {
      const objetivo = e.target instanceof Element ? e.target : null;
      if (!objetivo) return;
      const marcado = objetivo.closest<HTMLElement>("[data-evento]");
      if (marcado?.dataset.evento) {
        evento(marcado.dataset.evento);
        return;
      }
      const enlace = objetivo.closest("a");
      if (enlace && /whatsapp|wa\.me/i.test(enlace.getAttribute("href") ?? "")) evento("toca_whatsapp");
    };
    document.addEventListener("click", alTocar, true);

    // «ve_precio»: el precio se vio al menos al 60 % (una vez).
    let observador: IntersectionObserver | null = null;
    const precios = [...document.querySelectorAll<HTMLElement>("[data-precio]")].filter((p) => p.offsetParent !== null);
    if (precios.length && "IntersectionObserver" in window) {
      observador = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((en) => en.isIntersecting)) {
            evento("ve_precio");
            observador?.disconnect();
          }
        },
        { threshold: 0.6 },
      );
      precios.forEach((p) => observador?.observe(p));
    }

    return () => {
      document.removeEventListener("click", alTocar, true);
      observador?.disconnect();
    };
  }, [experimento, version]);

  return null;
}
