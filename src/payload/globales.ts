// Ajustes únicos del administrador (globales de Payload): menús, ajustes generales del tema, el carrusel de reseñas de
// la portada y los datos fijos para Google.

import type { Field, GlobalConfig } from "payload";
import { ESQUEMA, camposConDiseno } from "./secciones";

const enlaces = (name: string, label: string): Field => ({
  name,
  label,
  type: "group",
  fields: [
    { name: "titulo", label: "Título", type: "text" },
    {
      name: "enlaces",
      label: "Enlaces",
      type: "array",
      fields: [
        { type: "row", fields: [{ name: "texto", label: "Texto", type: "text", required: true }, { name: "url", label: "Dirección", type: "text", required: true }] },
      ],
    },
  ],
});

export const Menus: GlobalConfig = {
  slug: "menus",
  label: "Menús",
  admin: { group: "Contenido" },
  fields: [
    enlaces("principal", "Menú principal"),
    enlaces("pie", "Menú del pie"),
    {
      name: "redes",
      label: "Redes sociales",
      type: "array",
      fields: [{ type: "row", fields: [{ name: "red", label: "Red", type: "text" }, { name: "url", label: "Dirección", type: "text" }] }],
    },
  ],
};

export const AjustesTema: GlobalConfig = {
  slug: "ajustes-tema",
  label: "Ajustes generales",
  admin: { group: "Diseño de páginas", description: "Colores, letras y textos generales del tema." },
  fields: [{ name: "claves", type: "json", admin: { hidden: true } }, ...camposConDiseno(ESQUEMA.ajustesTema)],
};

const fila = (name: string, label: string): Field => ({
  name,
  label,
  type: "array",
  fields: [
    { name: "resena", label: "Reseña", type: "relationship", relationTo: "resenas", required: true },
    { name: "foto", label: "Foto (tamaño chico del carrusel)", type: "upload", relationTo: "medios" },
  ],
});

export const CarruselResenas: GlobalConfig = {
  slug: "carrusel-resenas",
  label: "Carrusel de reseñas (portada)",
  admin: { group: "Tienda" },
  fields: [
    {
      name: "resumen",
      label: "Resumen",
      type: "group",
      fields: [
        { name: "texto", label: "Texto", type: "text" },
        { type: "row", fields: [{ name: "calificacion", label: "Calificación", type: "number" }, { name: "total", label: "Total", type: "number" }] },
      ],
    },
    fila("fila1", "Primera fila"),
    fila("fila2", "Segunda fila"),
  ],
};

export const DatosGoogle: GlobalConfig = {
  slug: "datos-google",
  label: "Datos fijos para Google",
  admin: { group: "Google", description: "Datos de la empresa y del sitio que lee Google (formato JSON-LD)." },
  fields: [
    { name: "organizacion", label: "Empresa", type: "json" },
    { name: "sitioWeb", label: "Sitio y buscador", type: "json" },
    { name: "articulos", label: "Fichas de los artículos", type: "json" },
  ],
};

// De dónde salió cada archivo de contenido (la primera línea «fuente» de cada uno), para escribirlos igual.
export const Fuentes: GlobalConfig = {
  slug: "fuentes",
  label: "Origen de los datos",
  admin: { group: "Ajustes", hidden: true },
  fields: [{ name: "datos", type: "json" }],
};
