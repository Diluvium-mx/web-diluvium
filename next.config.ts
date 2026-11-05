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
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Hay un package-lock.json suelto en la carpeta de usuario; sin esto Next toma esa carpeta como raíz.
  turbopack: { root: import.meta.dirname },
  images: {
    qualities: [75, 90],
  },
  // Dos diseños raíz (tienda y administrador): la página 404 general va en app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

// Payload (administrador) se monta en /admin y su API en /api.
export default withPayload(nextConfig, { devBundleServerPackages: false });
