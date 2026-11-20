// Sube una foto o un video desde la computadora a public/media/editor/ (editor local, solo en esta Mac).
// Ojo: lo que se sube queda en la página pública y en el repositorio (también público): nada de datos de clientes.

import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { revisarPedido } from "@/lib/editor/guardia";
import { medirFotos, RAIZ } from "@/lib/editor/archivos";

export const dynamic = "force-dynamic";

const TIPOS: Record<string, { ext: string; max: number }> = {
  "image/jpeg": { ext: "jpg", max: 8 * 1024 * 1024 },
  "image/png": { ext: "png", max: 8 * 1024 * 1024 },
  "image/webp": { ext: "webp", max: 8 * 1024 * 1024 },
  // Cloudflare entrega archivos fijos de hasta 25 MB.
  "video/mp4": { ext: "mp4", max: 24 * 1024 * 1024 },
};

/** «Mi Foto (1).JPG» → «mi-foto-1»: sin acentos ni espacios, para que la dirección funcione en todos lados. */
function nombreSeguro(nombre: string): string {
  return (
    nombre
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "foto"
  );
}

export async function POST(request: Request) {
  const bloqueo = revisarPedido(request, { cambia: true });
  if (bloqueo) return bloqueo;
  const datos = await request.formData().catch(() => null);
  const archivo = datos?.get("archivo");
  if (!(archivo instanceof File)) return Response.json({ ok: false, mensaje: "No llegó ningún archivo." }, { status: 400 });
  const tipo = TIPOS[archivo.type];
  if (!tipo) return Response.json({ ok: false, mensaje: "Solo fotos JPG, PNG o WebP, o videos MP4." }, { status: 400 });
  if (archivo.size > tipo.max) return Response.json({ ok: false, mensaje: `Pesa demasiado (máximo ${tipo.max / 1024 / 1024} MB).` }, { status: 400 });

  const carpeta = path.join(RAIZ, "public/media/editor");
  mkdirSync(carpeta, { recursive: true });
  const nombre = `${new Date().toISOString().slice(0, 10)}-${nombreSeguro(archivo.name)}-${Date.now().toString(36).slice(-4)}.${tipo.ext}`;
  writeFileSync(path.join(carpeta, nombre), Buffer.from(await archivo.arrayBuffer()));
  if (tipo.ext !== "mp4") await medirFotos();
  return Response.json({ ok: true, src: `/media/editor/${nombre}`, nombre, video: tipo.ext === "mp4" });
}
