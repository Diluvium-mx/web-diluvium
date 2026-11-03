"use client";

// Estado compartido de la ficha: qué variante está elegida y cuántas piezas. Lo leen el precio, el selector de
// tamaño, el aviso de existencias y los botones de compra. Como en la tienda, la variante elegida va en la dirección
// (?variant=…) para que se pueda compartir o recargar.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type VarianteFicha = {
  id: number;
  titulo: string;
  precio: number;
  precioAntes: number | null;
  /** null: sin control de inventario (se puede comprar sin número). */
  existencias: number | null;
};

type Estado = {
  variantes: VarianteFicha[];
  elegida: number;
  elegir: (i: number) => void;
  cantidad: number;
  setCantidad: (n: number) => void;
};

const Contexto = createContext<Estado | null>(null);

export function useFicha(): Estado {
  const estado = useContext(Contexto);
  if (!estado) throw new Error("useFicha va dentro de <EstadoFicha>");
  return estado;
}

export function puedeComprarse(v: VarianteFicha): boolean {
  return v.existencias === null || v.existencias > 0;
}

export function EstadoFicha({
  variantes,
  inicial,
  children,
}: {
  variantes: VarianteFicha[];
  inicial: number;
  children: ReactNode;
}) {
  const [elegida, setElegida] = useState(inicial);
  const [cantidad, setCantidad] = useState(1);

  // Al abrir con ?variant=… en la dirección, se elige esa variante.
  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get("variant"));
    const i = variantes.findIndex((v) => v.id === id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la dirección solo existe en el navegador
    if (i >= 0) setElegida(i);
  }, [variantes]);

  const elegir = useCallback(
    (i: number) => {
      if (i === elegida) return;
      setElegida(i);
      const url = new URL(window.location.href);
      url.searchParams.set("variant", String(variantes[i].id));
      window.history.replaceState(window.history.state, "", url);
    },
    [elegida, variantes],
  );

  const valor = useMemo(() => ({ variantes, elegida, elegir, cantidad, setCantidad }), [variantes, elegida, elegir, cantidad]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
