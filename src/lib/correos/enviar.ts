// Manda un correo con Resend (su API por fetch, sin dependencias) y lo anota en «Correos enviados» (colección
// «correos» del administrador). Sin RESEND_API_KEY no falla: el correo queda anotado como «pendiente» y se escribe una
// línea en el registro. Nunca lanza error ni escribe la llave: quien lo llama (p. ej. guardar un pedido) sigue igual.
//
// Variables (.env.example): RESEND_API_KEY, CORREO_REMITENTE («Diluvium <pedidos@diluvium.com.mx>»), CORREO_TIENDA.

import type { Payload } from "payload";

export type TipoCorreo = "confirmacion-pedido" | "confirmacion-envio" | "pedido-entregado" | "pago-abandonado" | "pedido-nuevo" | "mensaje-nuevo";

export type DatosCorreo = {
  para: string;
  asunto: string;
  html: string;
  texto: string;
  /** A quién le llega la respuesta (p. ej. el cliente que escribió en un formulario). */
  responderA?: string;
  tipo?: TipoCorreo;
  /** Número del pedido, para encontrar sus correos en el administrador. */
  pedido?: number;
  /** La instancia de Payload si ya se tiene (en los ganchos, req.payload); si no, se abre la de la configuración. */
  payload?: Payload;
};

export type ResultadoCorreo = { estado: "pendiente" | "enviado" | "error"; error?: string };

const RESEND = "https://api.resend.com/emails";
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** «cliente@dominio.mx» → «c***@dominio.mx», para el registro (sin datos completos de clientes). */
function oculto(correo: string): string {
  const [u, d] = correo.split("@");
  return d ? `${u.slice(0, 1)}***@${d}` : "***";
}

async function abrirPayload(dado?: Payload): Promise<Payload> {
  if (dado) return dado;
  // Carga diferida: este archivo lo usan los ganchos de la propia configuración de Payload.
  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("@payload-config")]);
  return getPayload({ config });
}

export async function enviarCorreo(datos: DatosCorreo): Promise<ResultadoCorreo> {
  const { para, asunto, html, texto, responderA, tipo, pedido } = datos;
  const llave = process.env.RESEND_API_KEY;
  const remitente = process.env.CORREO_REMITENTE || "Diluvium <pedidos@diluvium.com.mx>";

  let payload: Payload | null = null;
  let registro: number | string | null = null;
  try {
    payload = await abrirPayload(datos.payload);
    const creado = await payload.create({
      collection: "correos",
      depth: 0,
      data: { para, asunto, tipo, pedido, html, texto, estado: "pendiente", fecha: new Date().toISOString() },
    });
    registro = creado.id;
  } catch (e) {
    console.error(`[correos] No se pudo anotar «${asunto}»: ${e instanceof Error ? e.message : String(e)}`);
  }

  const anotar = async (resultado: ResultadoCorreo) => {
    if (!payload || registro === null) return;
    try {
      await payload.update({ collection: "correos", id: registro, depth: 0, data: { estado: resultado.estado, error: resultado.error ?? "" } });
    } catch (e) {
      console.error(`[correos] No se pudo actualizar «${asunto}»: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  if (!CORREO.test(para)) {
    const r: ResultadoCorreo = { estado: "error", error: "Correo de destino inválido" };
    await anotar(r);
    console.warn(`[correos] ${tipo ?? "correo"} «${asunto}»: correo de destino inválido`);
    return r;
  }

  if (!llave) {
    console.info(`[correos] ${tipo ?? "correo"} «${asunto}» → ${oculto(para)}: pendiente (falta RESEND_API_KEY, no se envió)`);
    return { estado: "pendiente" };
  }

  let resultado: ResultadoCorreo;
  try {
    const respuesta = await fetch(RESEND, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llave}`,
        "Content-Type": "application/json",
        // Si se reintenta el mismo correo anotado, Resend no lo manda dos veces.
        ...(registro !== null ? { "Idempotency-Key": `correo-${registro}` } : {}),
      },
      body: JSON.stringify({
        from: remitente,
        to: [para],
        subject: asunto,
        html,
        text: texto,
        ...(responderA && CORREO.test(responderA) ? { reply_to: responderA } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (respuesta.ok) {
      resultado = { estado: "enviado" };
    } else {
      const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
      resultado = { estado: "error", error: `Resend ${respuesta.status}: ${String(cuerpo?.message ?? respuesta.statusText).slice(0, 300)}` };
    }
  } catch (e) {
    resultado = { estado: "error", error: e instanceof Error ? e.message.slice(0, 300) : "Error de red" };
  }

  await anotar(resultado);
  console.info(`[correos] ${tipo ?? "correo"} «${asunto}» → ${oculto(para)}: ${resultado.estado}${resultado.error ? ` (${resultado.error})` : ""}`);
  return resultado;
}
