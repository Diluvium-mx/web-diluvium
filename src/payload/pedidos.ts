// Pedidos, códigos de descuento y ajustes del envío en el administrador (paso 3). Réplica de lo que se usa en el
// administrador de Shopify (docs/proceso-replica.md §6): número, cliente, dirección, artículos, totales, pago,
// preparación con número de guía y «Notificar al cliente», notas y el historial.
// Los datos de clientes viven SOLO en la base (nunca en el repositorio ni en contenido/).

import type { CollectionConfig, Field, GlobalConfig } from "payload";
import { correosDelPedido } from "@/lib/correos/ganchos-pedidos";
import { ESTADOS } from "@/lib/pago/tipos";

const direccion = (name: string, label: string): Field => ({
  name,
  label,
  type: "group",
  fields: [
    {
      type: "row",
      fields: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "apellidos", label: "Apellidos", type: "text" },
      ],
    },
    { name: "direccion", label: "Dirección", type: "text" },
    { name: "interior", label: "Casa, apartamento, etc.", type: "text" },
    {
      type: "row",
      fields: [
        { name: "codigoPostal", label: "Código postal", type: "text" },
        { name: "ciudad", label: "Ciudad", type: "text" },
        { name: "estado", label: "Estado", type: "select", options: ESTADOS.map((e) => ({ label: e.nombre, value: e.clave })) },
      ],
    },
    { name: "telefono", label: "Teléfono", type: "text" },
  ],
});

export const Pedidos: CollectionConfig = {
  slug: "pedidos",
  labels: { singular: "Pedido", plural: "Pedidos" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "createdAt", "cliente", "total", "estadoPago", "estadoPreparacion"],
    group: "Ventas",
    listSearchableFields: ["titulo", "correo", "cliente"],
  },
  defaultSort: "-numero",
  // Los pedidos los crea la pantalla de pago (en el servidor) y se editan aquí; nadie sin sesión los ve.
  access: { create: () => false },
  // Correos al cliente y a la tienda al confirmar el pago, al notificar un envío y al marcar «Entregado».
  hooks: { afterChange: [correosDelPedido] },
  fields: [
    { name: "titulo", label: "Pedido", type: "text", admin: { readOnly: true } },
    { name: "numero", label: "Número", type: "number", required: true, unique: true, admin: { position: "sidebar", readOnly: true } },
    // Clave al azar de la página de «gracias» (/checkout/gracias?pedido=…&clave=…): el número solo no basta para ver
    // un pedido, así nadie puede adivinar los de otros clientes.
    { name: "clave", type: "text", index: true, admin: { hidden: true } },
    {
      type: "row",
      fields: [
        {
          name: "estadoPago",
          label: "Pago",
          type: "select",
          defaultValue: "pendiente",
          options: [
            { label: "Pendiente", value: "pendiente" },
            { label: "Pagado", value: "pagado" },
            { label: "Reembolsado", value: "reembolsado" },
            { label: "Cancelado", value: "cancelado" },
          ],
        },
        {
          name: "estadoPreparacion",
          label: "Preparación",
          type: "select",
          defaultValue: "no-preparado",
          options: [
            { label: "No preparado", value: "no-preparado" },
            { label: "Preparado (enviado)", value: "preparado" },
            { label: "Entregado", value: "entregado" },
          ],
        },
      ],
    },
    {
      name: "articulos",
      label: "Artículos",
      type: "array",
      admin: { readOnly: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "titulo", label: "Producto", type: "text" },
            { name: "opcion", label: "Tamaño", type: "text" },
            { name: "cantidad", label: "Piezas", type: "number" },
            { name: "precio", label: "Precio", type: "number" },
            { name: "idVariante", label: "Variante", type: "number" },
          ],
        },
      ],
    },
    {
      name: "totales",
      label: "Totales (calculados en el servidor)",
      type: "group",
      admin: { readOnly: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "subtotal", label: "Subtotal", type: "number" },
            { name: "descuento", label: "Descuento", type: "number" },
            { name: "codigoDescuento", label: "Código", type: "text" },
            { name: "envio", label: "Envío", type: "number" },
          ],
        },
        { name: "metodoEnvio", label: "Forma de entrega", type: "text" },
      ],
    },
    { name: "total", label: "Total (MXN)", type: "number", admin: { readOnly: true } },
    {
      name: "pago",
      label: "Pago",
      type: "group",
      admin: { readOnly: true },
      fields: [
        {
          name: "metodo",
          label: "Forma de pago",
          type: "select",
          options: [
            { label: "Tarjeta (Mercado Pago)", value: "tarjeta" },
            { label: "Mercado Pago", value: "mercadopago" },
            { label: "PayPal", value: "paypal" },
          ],
        },
        { name: "meses", label: "Meses", type: "number" },
        { name: "idPago", label: "Id del pago", type: "text" },
        { name: "detalle", label: "Detalle de la pasarela", type: "json" },
      ],
    },
    { name: "cliente", label: "Cliente", type: "text", admin: { readOnly: true } },
    { name: "correo", label: "Correo", type: "email", admin: { readOnly: true } },
    { name: "novedades", label: "Quiere novedades por correo", type: "checkbox", admin: { readOnly: true } },
    direccion("entrega", "Dirección de envío"),
    direccion("facturacion", "Dirección de facturación"),
    {
      name: "envios",
      label: "Preparar artículos (número de guía)",
      type: "array",
      labels: { singular: "Envío", plural: "Envíos" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "guia", label: "Número de guía", type: "text", required: true },
            {
              name: "paqueteria",
              label: "Paquetería",
              type: "select",
              options: ["Estafeta", "FedEx", "DHL", "Paquetexpress", "99minutos", "Redpack", "UPS", "J&T", "Otro"].map((p) => ({
                label: p,
                value: p,
              })),
            },
          ],
        },
        {
          name: "notificar",
          label: "Notificar al cliente",
          type: "checkbox",
          defaultValue: true,
          admin: { description: "Al guardar, el cliente recibe la «Confirmación de envío» con su número de guía (paso 3, correos)." },
        },
        { name: "notificado", label: "Ya se le avisó", type: "date", admin: { readOnly: true } },
      ],
    },
    { name: "notas", label: "Notas del cliente", type: "textarea" },
    { name: "comentarios", label: "Comentarios internos", type: "textarea" },
    { name: "etiquetas", label: "Etiquetas", type: "text" },
    {
      name: "historial",
      label: "Historial",
      type: "array",
      admin: { readOnly: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "fecha", label: "Fecha", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
            { name: "evento", label: "Qué pasó", type: "text" },
          ],
        },
      ],
    },
  ],
};

export const Descuentos: CollectionConfig = {
  slug: "descuentos",
  labels: { singular: "Código de descuento", plural: "Códigos de descuento" },
  admin: { useAsTitle: "codigo", defaultColumns: ["codigo", "tipo", "valor", "activo", "usos"], group: "Ventas" },
  fields: [
    {
      name: "codigo",
      label: "Código",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Lo que escribe el cliente (no importa si es con mayúsculas o minúsculas)." },
    },
    {
      type: "row",
      fields: [
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          required: true,
          defaultValue: "porcentaje",
          options: [
            { label: "Porcentaje", value: "porcentaje" },
            { label: "Monto fijo (MXN)", value: "monto" },
          ],
        },
        { name: "valor", label: "Valor", type: "number", required: true, min: 0 },
        { name: "minimo", label: "Compra mínima (MXN)", type: "number", min: 0 },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "desde", label: "Válido desde", type: "date" },
        { name: "hasta", label: "Válido hasta", type: "date" },
        { name: "usosMaximos", label: "Usos máximos", type: "number", min: 0 },
      ],
    },
    { name: "usos", label: "Veces usado", type: "number", defaultValue: 0, admin: { readOnly: true } },
    { name: "activo", label: "Activo", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

export const AjustesVenta: GlobalConfig = {
  slug: "ajustes-venta",
  label: "Envío y pedidos",
  admin: { group: "Ventas" },
  fields: [
    {
      name: "envio",
      label: "Envío",
      type: "group",
      fields: [
        { name: "nombre", label: "Nombre del envío (como lo ve el cliente)", type: "text", defaultValue: "Terrestre 3–5 días" },
        {
          type: "row",
          fields: [
            { name: "gratisDesde", label: "Gratis desde (MXN)", type: "number", defaultValue: 499 },
            {
              name: "costo",
              label: "Costo debajo del mínimo (MXN)",
              type: "number",
              defaultValue: 0,
              admin: { description: "Revisar con la tienda de hoy: cuánto se cobra en pedidos de menos de $499." },
            },
          ],
        },
      ],
    },
    {
      name: "siguienteNumero",
      label: "Número del próximo pedido",
      type: "number",
      defaultValue: 1362,
      admin: { description: "Sigue después del último de Shopify para no repetir números." },
    },
  ],
};
