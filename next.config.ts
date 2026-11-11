import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

// Encabezados de seguridad básicos (docs/seguridad.md §7). La política de contenido (CSP) estricta se arma en el
// paso 5, cuando estén todos los scripts de terceros (Mercado Pago, PayPal, Clarity, Google, Meta, TikTok).
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Copia de prueba (SITIO_PRUEBA=1 al construir): ningún buscador la indexa, ni la página ni las fotos.
  ...(process.env.SITIO_PRUEBA === "1" ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Paquetes con código especial para Cloudflare (workerd), como en la plantilla oficial de Payload para Cloudflare.
  serverExternalPackages: ["jose", "pg-cloudflare"],
  // Hay un package-lock.json suelto en la carpeta de usuario; sin esto Next toma esa carpeta como raíz.
  turbopack: { root: import.meta.dirname },
  images: {
    qualities: [75, 90],
  },
  // Dos diseños raíz (tienda y administrador): la página 404 general va en app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Versiones de la portada para pruebas: nunca se indexan, ni en la copia de prueba ni al publicar.
      { source: "/v", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/v/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

// Payload (administrador) se monta en /admin y su API en /api.
export default withPayload(nextConfig, { devBundleServerPackages: false });
