// ¿El video tiene sonido de verdad? Lo mide herramientas/videos-sonido.mjs (contenido/videos-sonido.json). Al «video
// automático» se le quita el botón de sonido cuando no tiene (dueño, 23-nov-2026). Un video que todavía no se mide
// cuenta como con sonido: el botón se queda, como siempre.

import medidos from "@contenido/videos-sonido.json";

const VIDEOS = medidos.videos as Record<string, { sonido: boolean }>;

export function tieneSonido(src: string): boolean {
  return VIDEOS[decodeURIComponent(src.split("?")[0])]?.sonido !== false;
}
