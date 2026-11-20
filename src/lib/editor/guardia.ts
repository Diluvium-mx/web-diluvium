// Quién puede usar el editor local (/editor): solo esta Mac, con el servidor de desarrollo (npm run dev).
// - En la página publicada (construcción de producción, Cloudflare) no existe: responde 404.
// - El servidor de desarrollo escucha también en la red de la casa: solo se aceptan pedidos a localhost.
// - Los cambios (POST) solo se aceptan desde la misma página del editor (Origin igual), para que otra página abierta
//   en el navegador no pueda mandar cambios por su cuenta.

const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

export function editorDisponible(): boolean {
  return process.env.NODE_ENV === "development";
}

/** null si el pedido puede seguir; si no, la respuesta con el motivo. */
export function revisarPedido(request: Request, { cambia = false } = {}): Response | null {
  if (!editorDisponible()) return new Response("No encontrado", { status: 404 });
  const host = request.headers.get("host") ?? "";
  if (!LOCAL.test(host)) return new Response("El editor solo se usa desde esta Mac (localhost).", { status: 403 });
  if (cambia) {
    const origen = request.headers.get("origin");
    if (!origen || new URL(origen).host !== host) return new Response("Origen no permitido.", { status: 403 });
  }
  return null;
}

/** Para la página del editor (componente de servidor): ¿se puede mostrar? */
export function hostLocal(host: string | null): boolean {
  return LOCAL.test(host ?? "");
}
