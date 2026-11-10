// Avisos para el buzón de la tienda (CORREO_TIENDA, por omisión contacto@diluvium.com.mx). Los formularios de contacto
// llaman a avisoMensajeNuevo(); el aviso de «Pedido nuevo» lo manda el gancho de los pedidos (ganchos-pedidos.ts).

import type { Payload } from "payload";
import { avisoMensaje, avisoPedidoNuevo, type MensajeNuevo } from "./aviso-tienda";
import { correoTienda, type PedidoCorreo } from "./comun";
import { enviarCorreo, type ResultadoCorreo } from "./enviar";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** «Mensaje nuevo» a la tienda con lo que llenó el cliente. La respuesta va directo al correo del cliente. */
export async function avisoMensajeNuevo(
  { formulario, nombre, correo, telefono, mensaje }: { formulario: "hola" | "contacto"; nombre?: string | null; correo?: string | null; telefono?: string | null; mensaje?: string | null },
  payload?: Payload,
): Promise<ResultadoCorreo> {
  const datos: MensajeNuevo = { formulario, nombre, correo, telefono, mensaje };
  const c = avisoMensaje(datos);
  const responderA = String(correo ?? "").trim();
  return enviarCorreo({ para: correoTienda(), ...c, tipo: "mensaje-nuevo", responderA: CORREO.test(responderA) ? responderA : undefined, payload });
}

/** «Pedido nuevo #…» a la tienda, cuando se confirma el pago. */
export async function avisoPedidoNuevoTienda(p: PedidoCorreo, idPedido: number | string | null, payload?: Payload): Promise<ResultadoCorreo> {
  const c = avisoPedidoNuevo(p, idPedido);
  return enviarCorreo({ para: correoTienda(), ...c, tipo: "pedido-nuevo", pedido: p.numero, responderA: p.correo || undefined, payload });
}
