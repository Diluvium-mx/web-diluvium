"use server";

// Formularios de la página: «¡Hola!» y Contacto (mensajes), boletín del pie (suscriptores) y «Escriba un comentario»
// (reseñas nuevas, ocultas hasta que el dueño las publica). Todo se guarda en el administrador; el aviso por correo a
// la tienda sale con Resend cuando esté conectado (src/lib/correos).
// Contra robots, por ahora: un campo trampa que una persona no ve y un tiempo mínimo para llenar. El captcha invisible
// (Turnstile) y el límite de intentos llegan en el paso de seguridad (docs/seguridad.md §3).

import { getPayload } from "payload";
import config from "@payload-config";
import { avisoMensajeNuevo } from "@/lib/correos/avisos";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MS = 2500;

export type Trampa = { sitio?: string; abierto?: number };
export type RespuestaFormulario = { ok: true } | { ok: false; error: string; campo?: string };

/** Llenado por un robot: campo trampa con texto o enviado demasiado rápido. Se responde «ok» para no darle pistas. */
function esRobot(t: Trampa | undefined): boolean {
  return Boolean(t?.sitio) || (typeof t?.abierto === "number" && Date.now() - t.abierto < MIN_MS);
}

const limpio = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

async function avisarTienda(datos: Parameters<typeof avisoMensajeNuevo>[0]) {
  try {
    // Sin la llave de Resend no se manda: queda en «Correos enviados» como pendiente. El mensaje ya está guardado.
    await avisoMensajeNuevo(datos);
  } catch {
    // Nunca se pierde el mensaje por un correo que no salió.
  }
}

/** «¡Hola!» (portada) y Contacto. */
export async function enviarMensaje(
  formulario: "hola" | "contacto",
  campos: { nombre?: string; telefono?: string; correo?: string; mensaje?: string; pagina?: string },
  trampa?: Trampa,
): Promise<RespuestaFormulario> {
  if (formulario !== "hola" && formulario !== "contacto") return { ok: false, error: "Formulario desconocido" };
  if (esRobot(trampa)) return { ok: true };
  const correo = limpio(campos.correo, 160);
  // Los mismos avisos que da Shopify con sus formularios en español.
  if (!correo) return { ok: false, error: "Correo electrónico no puede estar en blanco.", campo: "correo" };
  if (!CORREO.test(correo)) return { ok: false, error: "Correo electrónico no es válido.", campo: "correo" };
  const datos = {
    formulario,
    nombre: limpio(campos.nombre, 120),
    telefono: limpio(campos.telefono, 40),
    correo,
    mensaje: String(campos.mensaje ?? "").trim().slice(0, 4000),
    pagina: limpio(campos.pagina, 200),
  };
  if (formulario === "contacto" && (!datos.nombre || !datos.mensaje)) {
    return { ok: false, error: "Por favor, rellena campos obligatorios", campo: !datos.nombre ? "nombre" : "mensaje" };
  }
  const payload = await getPayload({ config });
  await payload.create({ collection: "mensajes", data: datos });
  await avisarTienda(datos);
  return { ok: true };
}

/** Boletín del pie (y la casilla de novedades de la pantalla de pago). Si ya estaba, solo se reactiva. */
export async function suscribir(correoBruto: string, origen: "pie" | "pago" = "pie", trampa?: Trampa): Promise<RespuestaFormulario> {
  if (esRobot(trampa)) return { ok: true };
  const correo = limpio(correoBruto, 160).toLowerCase();
  if (!correo) return { ok: false, error: "Correo electrónico no puede estar en blanco." };
  if (!CORREO.test(correo)) return { ok: false, error: "Correo electrónico no es válido." };
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: "suscriptores", depth: 0, limit: 1, where: { correo: { equals: correo } } });
  if (docs[0]) await payload.update({ collection: "suscriptores", id: docs[0].id, data: { activo: true } });
  else await payload.create({ collection: "suscriptores", data: { correo, origen, activo: true } });
  return { ok: true };
}

const TIPOS_FOTO = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_FOTO = 8 * 1024 * 1024;

/**
 * «Escriba un comentario»: la reseña queda guardada como NO publicada, para que el dueño la revise y la publique en el
 * administrador (como hoy con la app de reseñas). Recibe FormData por las fotos (hasta 5, de hasta 8 MB).
 */
export async function enviarResena(datos: FormData): Promise<RespuestaFormulario> {
  if (esRobot({ sitio: String(datos.get("sitio") ?? ""), abierto: Number(datos.get("abierto")) || undefined })) return { ok: true };
  const calificacion = Math.round(Number(datos.get("calificacion")));
  const texto = String(datos.get("texto") ?? "").trim().slice(0, 2000);
  const nombre = limpio(datos.get("nombre"), 80);
  if (!(calificacion >= 1 && calificacion <= 5)) return { ok: false, error: "Elige una calificación", campo: "calificacion" };
  if (!texto) return { ok: false, error: "Escribe tu opinión", campo: "texto" };
  if (!nombre) return { ok: false, error: "Escribe tu nombre", campo: "nombre" };

  const payload = await getPayload({ config });
  const nombreProducto = limpio(datos.get("producto"), 160);
  let producto: number | string | null = null;
  if (nombreProducto) {
    const { docs } = await payload.find({ collection: "productos", depth: 0, limit: 1, where: { nombre: { equals: nombreProducto } } });
    producto = docs[0]?.id ?? null;
  }

  const fotos: { foto: number | string }[] = [];
  for (const archivo of datos.getAll("fotos").slice(0, 5)) {
    if (!(archivo instanceof File) || !archivo.size) continue;
    if (!TIPOS_FOTO.has(archivo.type) || archivo.size > MAX_FOTO) return { ok: false, error: "Las fotos deben ser JPG, PNG o WebP de hasta 8 MB", campo: "fotos" };
    const nombreArchivo = `resena-${Date.now()}-${fotos.length + 1}.${archivo.type.split("/")[1].replace("jpeg", "jpg")}`;
    const medio = await payload.create({
      collection: "medios",
      data: { alt: `Foto de la reseña de ${nombre}` },
      file: { data: Buffer.from(await archivo.arrayBuffer()), mimetype: archivo.type, name: nombreArchivo, size: archivo.size },
    });
    fotos.push({ foto: medio.id });
  }

  // Al final de la lista (las publicadas conservan su orden); el dueño decide si se publica.
  const { docs: ultima } = await payload.find({ collection: "resenas", depth: 0, limit: 1, sort: "-orden", select: { orden: true } });
  await payload.create({
    collection: "resenas",
    data: {
      nombre,
      calificacion,
      texto,
      fotos,
      variasFotos: fotos.length > 1,
      producto,
      publicada: false,
      orden: Number(ultima[0]?.orden ?? 0) + 1,
    } as never,
  });
  return { ok: true };
}
