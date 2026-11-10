// Vista previa de los correos de la tienda (/correos/<tipo>) con datos inventados. Solo con sesión del administrador:
// sin ella responde 404, como si no existiera. Es una ruta (no una página) para que el 404 sea un 404 de verdad (una
// página dentro del diseño de Payload ya empezó a enviarse cuando se sabe que no hay sesión, y quedaría en 200).

import { getPayload } from "payload";
import config from "@payload-config";
import { paginaVistaPrevia } from "@/lib/correos/vista-previa";

const noEncontrado = () => new Response("No encontrado", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

export async function GET(request: Request, { params }: { params: Promise<{ tipo: string }> }) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return noEncontrado();

  const { tipo } = await params;
  // Fotos y enlaces desde esta misma dirección (en esta Mac, localhost) para verlos antes de publicar. Los correos de
  // verdad siempre apuntan a https://www.diluvium.com.mx.
  const html = paginaVistaPrevia(tipo, new URL(request.url).origin);
  if (!html) return noEncontrado();
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
