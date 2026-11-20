"use client";

// Interruptor del mapa: solo si la dirección lleva «?mapa» se carga la superposición con los nombres (Superposicion.tsx).
// Sin «?mapa» no baja nada más: la página pesa lo mismo de siempre.

import { useEffect, useState, type ComponentType } from "react";
import type { ArchivoMapa } from "@/lib/mapa";

type Props = { archivo: ArchivoMapa };

export function MapaVersion({ archivo }: Props) {
  const [Pieza, setPieza] = useState<ComponentType<Props> | null>(null);
  useEffect(() => {
    if (!new URLSearchParams(location.search).has("mapa")) return;
    import("./Superposicion").then((m) => setPieza(() => m.Superposicion));
  }, []);
  return Pieza ? <Pieza archivo={archivo} /> : null;
}
