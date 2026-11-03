// Espacio en blanco entre secciones (sección «spacer»), con alto y color distintos en celular y en computadora.

import type { Seccion } from "@/lib/contenido";
import { numero, texto } from "@/lib/contenido";

export function Espaciador({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const estilo = {
    "--esp-cel": `${numero(a, "padding_top") + numero(a, "padding_bottom")}px`,
    "--esp-compu": `${numero(a, "padding_top_desktop") + numero(a, "padding_bottom_desktop")}px`,
    "--esp-fondo-cel": texto(a, "background_color") || "transparent",
    "--esp-fondo-compu": texto(a, "background_color_desktop") || "transparent",
  } as React.CSSProperties;
  return (
    <div
      aria-hidden="true"
      data-seccion="spacer"
      style={estilo}
      className="h-[var(--esp-cel)] bg-[var(--esp-fondo-cel)] min-[1025px]:h-[var(--esp-compu)] min-[1025px]:bg-[var(--esp-fondo-compu)]"
    />
  );
}
