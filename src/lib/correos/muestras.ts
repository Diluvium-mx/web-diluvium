// Datos inventados para la vista previa de los correos (/correos/<tipo>). Nada aquí es de un cliente real: pedido
// #1362, «Cliente de Prueba», prueba@diluvium.test y una dirección de Mazatlán de ejemplo.

import { avisoMensaje, avisoPedidoNuevo } from "./aviso-tienda";
import { SITIO, type Correo, type PedidoCorreo } from "./comun";
import { confirmacionEnvio } from "./confirmacion-envio";
import { confirmacionPedido } from "./confirmacion-pedido";
import { pagoAbandonado } from "./pago-abandonado";
import { pedidoEntregado } from "./pedido-entregado";

const direccion = {
  pais: "MX" as const,
  nombre: "Cliente",
  apellidos: "de Prueba",
  direccion: "Av. Camarón Sábalo 123",
  interior: "Depto. 4",
  codigoPostal: "82110",
  ciudad: "Mazatlán",
  estado: "SIN",
  telefono: "669 000 0000",
};

export const PEDIDO_MUESTRA: PedidoCorreo = {
  numero: 1362,
  clave: "0".repeat(36),
  nombre: "Cliente",
  correo: "prueba@diluvium.test",
  lineas: [
    {
      titulo: "Compuerta Anti-Inundaciones",
      opcion: "Extra Chica (69cm a 78cm)",
      cantidad: 1,
      precio: 5500,
      imagen: "/media/files/Frame697.jpg",
      producto: "compuerta-anti-inundaciones",
    },
  ],
  subtotal: 5500,
  descuento: 0,
  codigoDescuento: "",
  envio: 0,
  metodoEnvio: "Terrestre 3–5 días",
  total: 5500,
  metodoPago: "tarjeta",
  meses: 3,
  entrega: direccion,
  facturacion: direccion,
};

export const TIPOS_CORREO = [
  { tipo: "confirmacion-pedido", nombre: "Confirmación de pedido", para: "Cliente" },
  { tipo: "confirmacion-envio", nombre: "Confirmación de envío", para: "Cliente" },
  { tipo: "pedido-entregado", nombre: "Pedido entregado + reseña", para: "Cliente" },
  { tipo: "pago-abandonado", nombre: "Recordatorio de pago abandonado", para: "Cliente" },
  { tipo: "pedido-nuevo", nombre: "Pedido nuevo", para: "Tienda" },
  { tipo: "mensaje-nuevo", nombre: "Mensaje nuevo (formularios)", para: "Tienda" },
] as const;

export type TipoMuestra = (typeof TIPOS_CORREO)[number]["tipo"];

/** El correo de muestra de cada tipo. `sitio` cambia solo de dónde salen fotos y enlaces (en esta Mac, localhost). */
export function correoMuestra(tipo: string, sitio = SITIO): Correo | null {
  const p = PEDIDO_MUESTRA;
  switch (tipo) {
    case "confirmacion-pedido":
      return confirmacionPedido(p, sitio);
    case "confirmacion-envio":
      return confirmacionEnvio(p, [{ guia: "9824001234567890", paqueteria: "Estafeta" }], sitio);
    case "pedido-entregado":
      return pedidoEntregado(p, sitio);
    case "pago-abandonado":
      return pagoAbandonado({ nombre: p.nombre, lineas: p.lineas }, sitio);
    case "pedido-nuevo":
      return avisoPedidoNuevo(p, null, sitio);
    case "mensaje-nuevo":
      return avisoMensaje(
        {
          formulario: "contacto",
          nombre: "Cliente de Prueba",
          correo: "prueba@diluvium.test",
          telefono: "669 000 0000",
          mensaje: "Hola, ¿la compuerta Extra Chica sirve para una puerta de 75 cm? ¿Hacen envíos a Mazatlán?",
        },
        sitio,
      );
    default:
      return null;
  }
}
