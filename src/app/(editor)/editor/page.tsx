import { editorDe } from "./editorDe";

// Editor local de las versiones: fotos (orden, cambiar, subir, encuadre) y textos de cada parte, con los mismos
// nombres del mapa (B1-P3.4…). Solo en esta Mac: http://localhost:3100/editor con npm run dev. docs/editor.md.
// Uno por versión (25-nov-2026): B en /editor, C en /editor/c y D en /editor/d, cada uno con todas sus páginas.

export const dynamic = "force-dynamic";

export default async function PaginaEditor() {
  return editorDe("B1");
}
