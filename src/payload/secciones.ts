// Bloques del administrador para las secciones del tema. Se arman solos con src/payload/esquema-secciones.json (que
// sale de los datos con herramientas/esquema-secciones.py): un bloque por tipo de sección, con sus piezas adentro, y
// cada ajuste como campo con nombre en español. Lo de forma (alineación, márgenes, colores…) va en «Diseño», cerrado.

import type { Block, Field } from "payload";
import esquema from "./esquema-secciones.json";

export type CampoEsquema = { clave: string; tipo: string; etiqueta: string; diseno: boolean };
type BloqueEsquema = { tipo: string; slug: string; dbName: string; etiqueta: string; campos: CampoEsquema[] };
export type SeccionEsquema = BloqueEsquema & { bloques: BloqueEsquema[] };

export const ESQUEMA = esquema as { secciones: SeccionEsquema[]; ajustesTema: CampoEsquema[] };

/** Un ajuste del tema → campo del administrador (el nombre del campo es la clave original del tema). */
export function campo(c: CampoEsquema): Field {
  const base = { name: c.clave, label: c.etiqueta };
  switch (c.tipo) {
    case "siNo":
      return { ...base, type: "checkbox" };
    case "numero":
      return { ...base, type: "number" };
    case "imagen":
      return { ...base, type: "upload", relationTo: "medios" };
    case "video":
      return { ...base, type: "upload", relationTo: "medios" };
    case "json":
      return { ...base, type: "json" };
    case "html":
      return { ...base, type: "textarea", admin: { description: "Texto con formato (HTML): <p>párrafo</p>, <strong>negritas</strong>, <a href=\"…\">enlace</a>." } };
    case "textoLargo":
      return { ...base, type: "textarea" };
    default:
      return { ...base, type: "text" };
  }
}

/** Datos internos de cada sección o pieza para exportarla igual: su nombre en el tema y el orden de sus ajustes. */
export const CAMPOS_INTERNOS: Field[] = [
  { name: "idTema", type: "text", admin: { hidden: true } },
  { name: "claves", type: "json", admin: { hidden: true } },
];

/** Campos de contenido arriba y los de forma juntos en un grupo «Diseño» que se abre aparte. */
export function camposConDiseno(campos: CampoEsquema[]): Field[] {
  const contenido = campos.filter((c) => !c.diseno).map(campo);
  const diseno = campos.filter((c) => c.diseno).map(campo);
  return diseno.length
    ? [...contenido, { type: "collapsible", label: "Diseño", admin: { initCollapsed: true }, fields: diseno }]
    : contenido;
}

export const BLOQUES_SECCIONES: Block[] = ESQUEMA.secciones.map((s) => ({
  slug: s.slug,
  dbName: s.dbName,
  labels: { singular: s.etiqueta, plural: s.etiqueta },
  fields: [
    ...CAMPOS_INTERNOS,
    ...camposConDiseno(s.campos),
    ...(s.bloques.length
      ? [
          {
            name: "bloques",
            label: "Piezas",
            type: "blocks",
            blocks: s.bloques.map((b) => ({
              slug: b.slug,
              dbName: b.dbName,
              labels: { singular: b.etiqueta, plural: b.etiqueta },
              fields: [...CAMPOS_INTERNOS, ...camposConDiseno(b.campos)],
            })),
          } satisfies Field,
        ]
      : []),
  ],
}));
