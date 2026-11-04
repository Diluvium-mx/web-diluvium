"use client";

// Para las ventanas del encabezado: empiezan invisibles y aparecen en el siguiente cuadro (transición de 0.25 s).

import { useEffect, useState } from "react";

export function useAparecer(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(cuadro);
  }, []);
  return visible;
}
