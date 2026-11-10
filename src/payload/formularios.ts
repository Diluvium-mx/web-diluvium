// Lo que llega por los formularios de la página: mensajes («¡Hola!» de la portada y Contacto) y suscriptores del
// boletín del pie. Las reseñas nuevas van a «Reseñas» como no publicadas. Datos de clientes: solo en la base.

import type { CollectionConfig } from "payload";

export const Mensajes: CollectionConfig = {
  slug: "mensajes",
  labels: { singular: "Mensaje", plural: "Mensajes" },
  admin: { useAsTitle: "nombre", defaultColumns: ["nombre", "formulario", "correo", "telefono", "createdAt", "atendido"], group: "Ventas" },
  defaultSort: "-createdAt",
  // Los crea la página desde el servidor; nadie sin sesión los ve ni los crea por la API.
  access: { create: () => false },
  fields: [
    {
      name: "formulario",
      label: "Formulario",
      type: "select",
      options: [
        { label: "¡Hola! (portada)", value: "hola" },
        { label: "Contacto", value: "contacto" },
      ],
      admin: { readOnly: true },
    },
    { type: "row", fields: [{ name: "nombre", label: "Nombre", type: "text" }, { name: "telefono", label: "Teléfono", type: "text" }] },
    { name: "correo", label: "Correo", type: "email" },
    { name: "mensaje", label: "Mensaje", type: "textarea" },
    { name: "pagina", label: "Desde la página", type: "text", admin: { readOnly: true } },
    { name: "atendido", label: "Ya se atendió", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    { name: "notas", label: "Notas internas", type: "textarea", admin: { position: "sidebar" } },
  ],
};

export const Suscriptores: CollectionConfig = {
  slug: "suscriptores",
  labels: { singular: "Suscriptor", plural: "Suscriptores del boletín" },
  admin: { useAsTitle: "correo", defaultColumns: ["correo", "origen", "createdAt", "activo"], group: "Ventas" },
  defaultSort: "-createdAt",
  access: { create: () => false },
  fields: [
    { name: "correo", label: "Correo", type: "email", required: true, unique: true },
    {
      name: "origen",
      label: "Dónde se suscribió",
      type: "select",
      options: [
        { label: "Pie de página", value: "pie" },
        { label: "Pantalla de pago", value: "pago" },
      ],
    },
    { name: "activo", label: "Suscrito", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
