"use client";

// Tamaño elegido en B4, compartido por los tamaños de la primera pantalla y la barra de compra del celular. Vive solo
// en memoria (al recargar se elige de nuevo).

import { useSyncExternalStore } from "react";
import { abrirCarrito, agregar, avisoExistencias } from "@/components/carrito/estado";

let elegido: number | null = null;
const oyentes = new Set<() => void>();

export function elegir(id: number) {
  elegido = id;
  for (const avisar of oyentes) avisar();
}

export function useElegido(): number | null {
  return useSyncExternalStore(
    (avisar) => {
      oyentes.add(avisar);
      return () => oyentes.delete(avisar);
    },
    () => elegido,
    () => null,
  );
}

/** Agrega una pieza del tamaño elegido y abre el carrito lateral. Regresa el aviso de existencias, si lo hay. */
export function agregarElegido(id: number): string | null {
  const { tope } = agregar(id, 1);
  abrirCarrito({ anadido: true });
  return tope === null ? null : avisoExistencias(tope);
}

/** Lleva a los tamaños y enfoca el primero disponible (cuando aún no eligen). */
export function irATamanos() {
  const grupo = document.getElementById("tamanos");
  if (!grupo) return;
  grupo.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  grupo.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus({ preventScroll: true });
}
