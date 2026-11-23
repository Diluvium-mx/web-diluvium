// Formato de los textos que se escriben en el editor (pestaña Textos, 23-nov-2026, dueño): para acomodar cada texto
// como se quiera.
//   - Salto de línea: Enter o Shift+Enter en el editor (se guarda como un salto de línea normal).
//   - **negrita**   → en negritas.
//   - ==naranja==   → en el naranja de la marca (como las palabras resaltadas de los títulos de la tienda de hoy).
// Un texto sin marcas se pinta igual que siempre. Sirve en las piezas del servidor y en las del teléfono.

import { Fragment, type ReactNode } from "react";

const MARCAS = /(\*\*[^*\n]+?\*\*|==[^=\n]+?==)/g;

/** El texto con sus saltos de línea, negritas y resaltados en naranja. */
export function formato(texto: string | null | undefined): ReactNode {
  if (!texto) return texto ?? null;
  if (!/\n|\*\*|==/.test(texto)) return texto;
  return texto.split("\n").map((linea, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {linea.split(MARCAS).map((parte, k) => {
        if (parte.length > 4 && parte.startsWith("**") && parte.endsWith("**")) return <strong key={k}>{parte.slice(2, -2)}</strong>;
        if (parte.length > 4 && parte.startsWith("==") && parte.endsWith("==")) return <span key={k} className="text-boton">{parte.slice(2, -2)}</span>;
        return parte;
      })}
    </Fragment>
  ));
}

/** El mismo texto sin marcas ni saltos (para etiquetas de accesibilidad, ejemplos dentro de un campo, etc.). */
export const sinFormato = (texto: string) =>
  texto
    .replace(/\*\*([^*\n]+?)\*\*/g, "$1")
    .replace(/==([^=\n]+?)==/g, "$1")
    .replace(/\s*\n\s*/g, " ")
    .trim();
