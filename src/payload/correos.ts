// «Correos enviados»: cada correo que manda la tienda (src/lib/correos/enviar.ts) queda anotado aquí con su estado.
// Mientras Resend no esté conectado (sin RESEND_API_KEY) quedan como «pendiente». Solo se leen: nadie los crea ni los
// cambia desde el administrador o la API (lo hace el servidor con la API local). Viven SOLO en la base, nunca en el
// repositorio: llevan datos de clientes.

import type { CollectionConfig } from "payload";

export const Correos: CollectionConfig = {
  slug: "correos",
  labels: { singular: "Correo enviado", plural: "Correos enviados" },
  admin: {
    useAsTitle: "asunto",
    defaultColumns: ["asunto", "para", "tipo", "estado", "fecha"],
    group: "Ventas",
    listSearchableFields: ["asunto", "para"],
    description: "Vista previa de cada correo: /correos/confirmacion-pedido (con sesión iniciada).",
  },
  defaultSort: "-fecha",
  access: { create: () => false, update: () => false },
  fields: [
    {
      type: "row",
      fields: [
        { name: "para", label: "Para", type: "text", required: true, admin: { readOnly: true } },
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          admin: { readOnly: true },
          options: [
            { label: "Confirmación de pedido", value: "confirmacion-pedido" },
            { label: "Confirmación de envío", value: "confirmacion-envio" },
            { label: "Pedido entregado (reseña)", value: "pedido-entregado" },
            { label: "Pago abandonado", value: "pago-abandonado" },
            { label: "Pedido nuevo (tienda)", value: "pedido-nuevo" },
            { label: "Mensaje nuevo (tienda)", value: "mensaje-nuevo" },
          ],
        },
      ],
    },
    { name: "asunto", label: "Asunto", type: "text", required: true, admin: { readOnly: true } },
    {
      type: "row",
      fields: [
        {
          name: "estado",
          label: "Estado",
          type: "select",
          defaultValue: "pendiente",
          admin: { readOnly: true },
          options: [
            { label: "Pendiente (sin enviar)", value: "pendiente" },
            { label: "Enviado", value: "enviado" },
            { label: "Error", value: "error" },
          ],
        },
        { name: "fecha", label: "Fecha", type: "date", admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } } },
        { name: "pedido", label: "Pedido", type: "number", admin: { readOnly: true } },
      ],
    },
    { name: "error", label: "Error", type: "text", admin: { readOnly: true, condition: (d) => Boolean(d?.error) } },
    { name: "html", label: "HTML", type: "textarea", admin: { readOnly: true, rows: 8 } },
    { name: "texto", label: "Texto simple", type: "textarea", admin: { readOnly: true, rows: 8 } },
  ],
};
