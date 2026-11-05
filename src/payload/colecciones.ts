// Secciones del administrador (colecciones de Payload). Cada una guarda lo que hoy está en un archivo de contenido/ y
// el exportador (src/payload/scripts/exportar.ts) lo vuelve a escribir igual. Nombres y ayudas en español para el dueño.
// Acceso: solo usuarios con sesión (lo que Payload hace si no se dice otra cosa); la página pública no lee de aquí.

import type { CollectionConfig, Field } from "payload";
import { BLOQUES_SECCIONES } from "./secciones";

const orden: Field = {
  name: "orden",
  label: "Orden",
  type: "number",
  admin: { position: "sidebar", description: "Lugar en la lista (menor va primero)." },
};

const PLANTILLAS_PRODUCTO = [
  { label: "Producto (básica)", value: "basica" },
  { label: "Compuerta estándar", value: "compuerta-estandar" },
  { label: "Compuerta estándar 2", value: "compuerta-estandar-2" },
  { label: "Medida especial", value: "medida-especial" },
  { label: "Mini compuerta", value: "mini-compuerta" },
  { label: "Tapón inflable", value: "tapon-inflable" },
];

export const Usuarios: CollectionConfig = {
  slug: "usuarios",
  labels: { singular: "Usuario", plural: "Usuarios" },
  admin: { useAsTitle: "email", group: "Ajustes" },
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  fields: [{ name: "nombre", label: "Nombre", type: "text" }],
};

export const Medios: CollectionConfig = {
  slug: "medios",
  labels: { singular: "Foto o video", plural: "Fotos y videos" },
  admin: { useAsTitle: "filename", group: "Contenido" },
  upload: {
    // En esta Mac se guardan aquí; al publicar, en el almacenamiento del hosting (paso 2, publicación).
    staticDir: "public/media/admin",
    mimeTypes: ["image/*", "video/mp4", "video/webm"],
  },
  fields: [
    { name: "alt", label: "Texto alternativo (para lectores de pantalla y Google)", type: "text" },
    {
      name: "ruta",
      label: "Dirección en la página",
      type: "text",
      admin: { readOnly: true, description: "Las fotos que ya estaban en la página conservan su dirección." },
    },
  ],
};

export const Productos: CollectionConfig = {
  slug: "productos",
  labels: { singular: "Producto", plural: "Productos" },
  admin: { useAsTitle: "titulo", defaultColumns: ["titulo", "nombre", "orden"], group: "Tienda" },
  defaultSort: "orden",
  fields: [
    { name: "titulo", label: "Nombre del producto", type: "text", required: true },
    {
      name: "nombre",
      label: "Dirección",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Va en /products/…; cambiarla rompe los enlaces y lo ganado en Google." },
    },
    { name: "plantilla", label: "Plantilla de la ficha", type: "select", options: PLANTILLAS_PRODUCTO, defaultValue: "basica" },
    { name: "descripcionHtml", label: "Descripción (HTML)", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "proveedor", label: "Proveedor", type: "text" },
        { name: "tipo", label: "Tipo", type: "text" },
        { name: "etiquetas", label: "Etiquetas", type: "text" },
      ],
    },
    {
      name: "opciones",
      label: "Opciones (p. ej. Tamaño)",
      type: "array",
      fields: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "valores", label: "Valores", type: "array", fields: [{ name: "valor", label: "Valor", type: "text" }] },
      ],
    },
    {
      name: "variantes",
      label: "Tamaños y precios",
      type: "array",
      labels: { singular: "Tamaño", plural: "Tamaños" },
      admin: { components: {}, initCollapsed: true },
      fields: [
        { name: "titulo", label: "Nombre", type: "text", required: true },
        {
          type: "row",
          fields: [
            { name: "precio", label: "Precio (MXN)", type: "number", required: true, min: 0 },
            { name: "precioAntes", label: "Precio antes (tachado)", type: "number", min: 0 },
            {
              name: "existencias",
              label: "Piezas en existencia",
              type: "number",
              min: 0,
              admin: { description: "Vacío: sin control de inventario (se vende siempre)." },
            },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "opcion1", label: "Valor de la opción", type: "text" },
            { name: "codigoBarras", label: "Código de barras", type: "text" },
            { name: "sku", label: "SKU", type: "text" },
          ],
        },
        { name: "imagen", label: "Foto de este tamaño", type: "upload", relationTo: "medios" },
        {
          name: "idVariante",
          label: "Número de variante",
          type: "number",
          admin: { readOnly: true, description: "El mismo de Shopify; va en ?variant=… y en el carrito." },
        },
      ],
    },
    {
      name: "imagenes",
      label: "Fotos de la galería",
      type: "array",
      fields: [
        { name: "imagen", label: "Foto", type: "upload", relationTo: "medios", required: true },
        { name: "alt", label: "Texto alternativo", type: "text" },
        {
          type: "row",
          fields: [
            { name: "ancho", label: "Ancho (px)", type: "number", admin: { readOnly: true } },
            { name: "alto", label: "Alto (px)", type: "number", admin: { readOnly: true } },
          ],
        },
      ],
    },
    {
      name: "videos",
      label: "Videos de la galería",
      type: "array",
      fields: [
        { name: "video", label: "Video", type: "upload", relationTo: "medios", required: true },
        { name: "portada", label: "Imagen de portada", type: "upload", relationTo: "medios", required: true },
        { name: "posicion", label: "Lugar entre las fotos (0 = primero)", type: "number", required: true, min: 0 },
      ],
    },
    orden,
    { name: "idProducto", label: "Número de producto", type: "number", admin: { position: "sidebar", readOnly: true } },
  ],
};

export const Resenas: CollectionConfig = {
  slug: "resenas",
  labels: { singular: "Reseña", plural: "Reseñas" },
  admin: { useAsTitle: "nombre", defaultColumns: ["nombre", "calificacion", "producto", "publicada"], group: "Tienda" },
  defaultSort: "orden",
  fields: [
    { name: "nombre", label: "Nombre (como se muestra)", type: "text", required: true },
    { name: "calificacion", label: "Estrellas", type: "number", required: true, min: 1, max: 5 },
    { name: "texto", label: "Reseña", type: "textarea" },
    { name: "fotos", label: "Fotos", type: "array", fields: [{ name: "foto", label: "Foto", type: "upload", relationTo: "medios", required: true }] },
    { name: "variasFotos", label: "Marcar «varias fotos»", type: "checkbox" },
    { name: "producto", label: "Producto", type: "relationship", relationTo: "productos" },
    {
      name: "publicada",
      label: "Publicada",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar", description: "Solo las publicadas salen en la página." },
    },
    orden,
  ],
};

export const Articulos: CollectionConfig = {
  slug: "articulos",
  labels: { singular: "Artículo del blog", plural: "Blog" },
  admin: { useAsTitle: "titulo", group: "Contenido" },
  defaultSort: "orden",
  fields: [
    { name: "titulo", label: "Título", type: "text", required: true },
    { name: "slug", label: "Dirección", type: "text", required: true, unique: true, admin: { description: "Va en /blogs/blog/…" } },
    { name: "resumen", label: "Resumen", type: "textarea" },
    { name: "cuerpo", label: "Texto del artículo (HTML)", type: "textarea" },
    {
      name: "imagen",
      label: "Imagen principal",
      type: "group",
      fields: [
        { name: "foto", label: "Foto", type: "upload", relationTo: "medios" },
        { name: "alt", label: "Texto alternativo", type: "text" },
        {
          type: "row",
          fields: [
            { name: "ancho", label: "Ancho (px)", type: "number", admin: { readOnly: true } },
            { name: "alto", label: "Alto (px)", type: "number", admin: { readOnly: true } },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "autor", label: "Autor", type: "text" },
        { name: "fecha", label: "Fecha como se muestra", type: "text" },
        { name: "publicado", label: "Fecha de publicación (ISO)", type: "text" },
      ],
    },
    { name: "etiquetas", label: "Etiquetas", type: "json" },
    {
      type: "row",
      fields: [
        { name: "anterior", label: "Artículo anterior (dirección)", type: "text" },
        { name: "siguiente", label: "Artículo siguiente (dirección)", type: "text" },
      ],
    },
    {
      name: "seo",
      label: "Google",
      type: "group",
      fields: [
        { name: "titulo", label: "Título en Google", type: "text" },
        { name: "descripcion", label: "Descripción en Google", type: "textarea" },
      ],
    },
    orden,
  ],
};

const paginaSimple = (slug: string, singular: string, plural: string, prefijo: string): CollectionConfig => ({
  slug,
  labels: { singular, plural },
  admin: { useAsTitle: "titulo", group: "Contenido" },
  defaultSort: "orden",
  fields: [
    { name: "titulo", label: "Título (pestaña y menús)", type: "text", required: true },
    { name: "nombre", label: "Dirección", type: "text", required: true, unique: true, admin: { description: `Va en ${prefijo}…` } },
    { name: "tituloVisible", label: "Título que se ve en la página", type: "text" },
    { name: "cuerpo", label: "Texto (HTML)", type: "textarea" },
    orden,
  ],
});

export const Paginas = paginaSimple("paginas", "Página", "Páginas", "/pages/");
export const Politicas = paginaSimple("politicas", "Política", "Políticas", "/policies/");

const ORDENES = [
  { label: "Manual", value: "manual" },
  { label: "Más vendidos", value: "best-selling" },
  { label: "Más relevantes", value: "most-relevant" },
  { label: "Alfabético A-Z", value: "title-ascending" },
  { label: "Alfabético Z-A", value: "title-descending" },
  { label: "Precio menor a mayor", value: "price-ascending" },
  { label: "Precio mayor a menor", value: "price-descending" },
  { label: "Más antiguos", value: "created-ascending" },
  { label: "Más nuevos", value: "created-descending" },
];

export const Colecciones: CollectionConfig = {
  slug: "colecciones",
  labels: { singular: "Colección", plural: "Colecciones" },
  admin: { useAsTitle: "titulo", group: "Tienda" },
  defaultSort: "orden",
  fields: [
    { name: "titulo", label: "Título", type: "text", required: true },
    { name: "nombre", label: "Dirección", type: "text", required: true, unique: true, admin: { description: "Va en /collections/…" } },
    { name: "descripcionHtml", label: "Descripción (HTML)", type: "textarea" },
    { name: "imagen", label: "Imagen", type: "upload", relationTo: "medios" },
    { name: "imagenCompartir", label: "Imagen al compartir", type: "upload", relationTo: "medios" },
    { name: "productos", label: "Productos (en orden manual)", type: "relationship", relationTo: "productos", hasMany: true },
    { name: "ordenPredeterminado", label: "Orden predeterminado", type: "select", options: ORDENES },
    {
      name: "ordenes",
      label: "Orden de cada opción de «Ordenar por»",
      type: "json",
      admin: { description: "Leído de la tienda; los productos nuevos se agregan al final de cada orden." },
    },
    { name: "precioMaximo", label: "Precio máximo del filtro", type: "number" },
    {
      name: "enLista",
      label: "Sale en la lista de colecciones (/collections)",
      type: "number",
      admin: { position: "sidebar", description: "Lugar en esa lista; vacío: no sale." },
    },
    orden,
  ],
};

export const FichasSeo: CollectionConfig = {
  slug: "fichas-seo",
  labels: { singular: "Ficha para Google", plural: "Fichas para Google" },
  admin: { useAsTitle: "ruta", defaultColumns: ["ruta", "titulo"], group: "Google" },
  defaultSort: "orden",
  fields: [
    { name: "ruta", label: "Página", type: "text", required: true, unique: true },
    { name: "titulo", label: "Título de la pestaña y en Google", type: "text", required: true },
    { name: "descripcion", label: "Descripción en Google", type: "textarea", admin: { description: "Vacía: la página no lleva descripción (como en vivo)." } },
    { name: "canonica", label: "Dirección principal", type: "text" },
    {
      name: "og",
      label: "Al compartir (Facebook, WhatsApp)",
      type: "group",
      fields: [
        { name: "tipo", label: "Tipo", type: "text" },
        { name: "titulo", label: "Título", type: "text" },
        { name: "descripcion", label: "Descripción", type: "textarea" },
        { name: "imagen", label: "Imagen", type: "upload", relationTo: "medios" },
        { type: "row", fields: [{ name: "ancho", label: "Ancho", type: "number" }, { name: "alto", label: "Alto", type: "number" }] },
      ],
    },
    {
      name: "twitter",
      label: "Al compartir en X (Twitter)",
      type: "group",
      fields: [
        { name: "tarjeta", label: "Tipo de tarjeta", type: "text" },
        { name: "titulo", label: "Título", type: "text" },
        { name: "descripcion", label: "Descripción", type: "textarea" },
      ],
    },
    orden,
  ],
};

export const Plantillas: CollectionConfig = {
  slug: "plantillas",
  labels: { singular: "Plantilla de página", plural: "Plantillas de páginas" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "archivo"],
    group: "Diseño de páginas",
    description: "Las secciones de cada página, en orden, como en el editor de temas de Shopify.",
  },
  defaultSort: "orden",
  fields: [
    { name: "titulo", label: "Página", type: "text", required: true },
    { name: "archivo", label: "Archivo", type: "text", required: true, unique: true, admin: { readOnly: true, position: "sidebar" } },
    { name: "secciones", label: "Secciones", type: "blocks", blocks: BLOQUES_SECCIONES },
    orden,
  ],
};
