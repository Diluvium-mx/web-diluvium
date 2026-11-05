"use client";

// La luz del «fondo iluminado» del CRM (crm-diluvium › glow-pointer.tsx): sigue al cursor dentro del botón, tarjeta o
// enlace del menú que está debajo (fija --glow-x/--glow-y). Un solo detector para todo el administrador, a lo más
// una escritura por cuadro. Con «reducir movimiento» la luz queda centrada. Estilos en app/(payload)/custom.scss.

import { useEffect } from "react";

const INTERACTIVOS = [".btn--style-primary", ".btn--style-secondary", ".card", ".nav__link", "[data-glow]"]
  .map((s) => `${s}:not([data-no-glow])`)
  .join(", ");

export function BrilloCursor({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cuadro = 0;
    let ultimo: PointerEvent | null = null;

    const aplicar = () => {
      cuadro = 0;
      const e = ultimo;
      if (!e || reducir.matches || !(e.target instanceof Element)) return;
      const el = e.target.closest(INTERACTIVOS);
      if (!(el instanceof HTMLElement)) return;
      const caja = el.getBoundingClientRect();
      el.style.setProperty("--glow-x", `${Math.round(e.clientX - caja.left)}px`);
      el.style.setProperty("--glow-y", `${Math.round(e.clientY - caja.top)}px`);
    };
    const alMover = (e: PointerEvent) => {
      ultimo = e;
      if (!cuadro) cuadro = requestAnimationFrame(aplicar);
    };

    document.addEventListener("pointermove", alMover, { passive: true });
    document.addEventListener("pointerdown", alMover, { passive: true });
    return () => {
      document.removeEventListener("pointermove", alMover);
      document.removeEventListener("pointerdown", alMover);
      if (cuadro) cancelAnimationFrame(cuadro);
    };
  }, []);
  return <>{children}</>;
}
