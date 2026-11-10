// Correos que salen solos al guardar un pedido (gancho afterChange de la colección «pedidos»):
//   1. El pago pasa a «pagado»            → «Confirmación de pedido» al cliente y «Pedido nuevo» a la tienda.
//   2. Un envío con «Notificar al cliente» sin fecha de «Ya se le avisó» → «Confirmación de envío» al cliente, y esa
//      fecha queda puesta para no volver a avisar.
//   3. La preparación pasa a «Entregado»   → «Pedido entregado» con la invitación a la reseña.
// Cada correo deja su renglón en el historial; ese renglón también evita mandarlo dos veces. El propio guardado del
// gancho lleva `context.omitirCorreos`, así no se vuelve a disparar. Si algo falla, el pedido se guarda igual.

import type { CollectionAfterChangeHook } from "payload";
import type { Pedido } from "@/payload-types";
import { avisoPedidoNuevoTienda } from "./avisos";
import { pedidoDesdeDoc } from "./comun";
import { confirmacionEnvio } from "./confirmacion-envio";
import { confirmacionPedido } from "./confirmacion-pedido";
import { enviarCorreo, type ResultadoCorreo } from "./enviar";
import { pedidoEntregado } from "./pedido-entregado";

const CONFIRMACION = "Correo de confirmación";
const ENTREGA = "Correo de entrega y reseña";

/** Renglón del historial: «… enviado», «… enviado (en espera…)» o «No se pudo enviar …» (este último deja reintentar). */
function nota(r: ResultadoCorreo, que: string): string {
  if (r.estado === "enviado") return `${que} enviado`;
  if (r.estado === "pendiente") return `${que} enviado (en espera: falta conectar Resend)`;
  return `No se pudo enviar el ${que.charAt(0).toLowerCase()}${que.slice(1)}: ${r.error ?? "error"}`;
}

export const correosDelPedido: CollectionAfterChangeHook<Pedido> = async ({ doc, previousDoc, operation, req, context }) => {
  if (context?.omitirCorreos) return doc;
  const antes: Partial<Pedido> = operation === "update" ? (previousDoc ?? {}) : {};
  const historial = doc.historial ?? [];
  const yaSalio = (que: string) => historial.some((h) => String(h.evento ?? "").startsWith(que));
  const ahora = new Date().toISOString();
  const nuevos: { fecha: string; evento: string }[] = [];
  let envios = doc.envios ?? [];
  let cambioEnvios = false;

  try {
    const p = pedidoDesdeDoc(doc as never);
    const comun = { para: p.correo, pedido: p.numero, payload: req.payload };

    if (doc.estadoPago === "pagado" && antes.estadoPago !== "pagado" && !yaSalio(CONFIRMACION)) {
      const r = await enviarCorreo({ ...comun, ...confirmacionPedido(p), tipo: "confirmacion-pedido" });
      nuevos.push({ fecha: ahora, evento: nota(r, CONFIRMACION) });
      await avisoPedidoNuevoTienda(p, doc.id, req.payload);
    }

    const porAvisar = envios.filter((e) => e.notificar && !e.notificado && e.guia);
    if (porAvisar.length) {
      const guias = porAvisar.map((e) => ({ guia: String(e.guia), paqueteria: e.paqueteria ?? null }));
      const r = await enviarCorreo({ ...comun, ...confirmacionEnvio(p, guias), tipo: "confirmacion-envio" });
      const lista = guias.map((g) => `${g.paqueteria ?? "guía"} ${g.guia}`).join(", ");
      nuevos.push({ fecha: ahora, evento: `${nota(r, "Correo de envío")} (${lista})` });
      if (r.estado !== "error") {
        envios = envios.map((e) => (porAvisar.includes(e) ? { ...e, notificado: ahora } : e));
        cambioEnvios = true;
      }
    }

    if (doc.estadoPreparacion === "entregado" && antes.estadoPreparacion !== "entregado" && !yaSalio(ENTREGA)) {
      const r = await enviarCorreo({ ...comun, ...pedidoEntregado(p), tipo: "pedido-entregado" });
      nuevos.push({ fecha: ahora, evento: nota(r, ENTREGA) });
    }

    if (!nuevos.length && !cambioEnvios) return doc;
    return await req.payload.update({
      collection: "pedidos",
      id: doc.id,
      depth: 0,
      req,
      context: { omitirCorreos: true },
      data: { historial: [...historial, ...nuevos], ...(cambioEnvios ? { envios } : {}) },
    });
  } catch (e) {
    req.payload.logger.error(`[correos] Pedido #${doc.numero}: ${e instanceof Error ? e.message : String(e)}`);
    return doc;
  }
};
