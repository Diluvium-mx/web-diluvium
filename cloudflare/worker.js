// Entrada del Worker de Cloudflare: lo de OpenNext (la página de Next.js) y, antes, una sola cosa propia:
// los videos se entregan por partes (respuestas 206 a «Range: bytes=…»).
//
// Por qué: los archivos fijos de Cloudflare (Workers Static Assets) siempre mandan el video completo (200) aunque el
// navegador pida un pedazo. Chrome lo reproduce igual, pero Safari del iPhone (y el navegador de Facebook e Instagram
// en iPhone) pide pedazos y, si no los recibe, puede no reproducir el video (18-nov-2026).
//
// Cuesta muy poco procesador (el plan gratis da 10 ms por visita): el archivo pasa en flujo, sin cargarlo completo en
// memoria; solo se cortan los trozos de las orillas. wrangler manda aquí /media/videos/* («run_worker_first»).
// Va en JavaScript (no TypeScript) para que la revisión de tipos de Next no lo lea: depende de .open-next/, que solo
// existe al construir.

import pagina from "../.open-next/worker.js";

/** «bytes=0-1», «bytes=100-», «bytes=-500» → [inicio, fin] dentro de 0…total-1, o null si no se entiende. */
function rango(cabecera, total) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(cabecera.trim());
  if (!m || (m[1] === "" && m[2] === "")) return null;
  let inicio;
  let fin;
  if (m[1] === "") {
    inicio = Math.max(0, total - Number(m[2]));
    fin = total - 1;
  } else {
    inicio = Number(m[1]);
    fin = m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1);
  }
  return inicio <= fin ? [inicio, fin] : null;
}

async function videoPorPartes(request, env, ctx) {
  const completo = await env.ASSETS.fetch(new Request(request.url, { method: "GET" }));
  const total = Number(completo.headers.get("content-length"));
  const pedido = request.headers.get("range");
  if (!completo.ok || !completo.body || !pedido || !total) return completo;

  const partes = rango(pedido, total);
  if (!partes) {
    completo.body.cancel();
    return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
  }
  const [inicio, fin] = partes;
  const largo = fin - inicio + 1;

  // Se deja pasar solo lo que cae entre inicio y fin; al llegar a fin se corta el resto del archivo.
  let visto = 0;
  const corte = new TransformStream({
    transform(trozo, control) {
      const desde = visto;
      visto += trozo.byteLength;
      if (visto <= inicio) return;
      if (desde > fin) {
        control.terminate();
        return;
      }
      control.enqueue(trozo.subarray(Math.max(0, inicio - desde), Math.min(trozo.byteLength, fin - desde + 1)));
      if (visto > fin) control.terminate();
    },
  });
  // FixedLengthStream: Cloudflare manda el «content-length» exacto (Safari lo espera en un 206).
  const { readable, writable } = new FixedLengthStream(largo);
  ctx.waitUntil(completo.body.pipeThrough(corte).pipeTo(writable).catch(() => {}));

  const cabeceras = new Headers(completo.headers);
  cabeceras.set("content-range", `bytes ${inicio}-${fin}/${total}`);
  cabeceras.set("content-length", String(largo));
  cabeceras.set("accept-ranges", "bytes");
  cabeceras.delete("content-encoding");
  return new Response(request.method === "HEAD" ? null : readable, { status: 206, headers: cabeceras });
}

const worker = {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/media/videos/") && (request.method === "GET" || request.method === "HEAD")) {
      if (request.headers.has("range")) return videoPorPartes(request, env, ctx);
      // Sin «Range»: el archivo tal cual, y se avisa que se puede pedir por partes.
      const r = await env.ASSETS.fetch(request);
      const cabeceras = new Headers(r.headers);
      cabeceras.set("accept-ranges", "bytes");
      return new Response(r.body, { status: r.status, headers: cabeceras });
    }
    return pagina.fetch(request, env, ctx);
  },
};

export default worker;
