import type { Metadata } from "next";
import "./pago.css";

// Diseño de la pantalla de pago y la página de «gracias»: sin el marco de la tienda (ni franja, ni encabezado, ni pie,
// ni botón de WhatsApp), como el pago de Shopify. La tienda vive en app/(sitio) y el administrador en app/(payload).

export const metadata: Metadata = {
  metadataBase: new URL("https://www.diluvium.com.mx"),
  title: { default: "Pantalla de pago – Diluvium", template: "%s – Diluvium" },
  icons: { icon: "/media/files/Favicon_2aabf220-4641-4694-9dbb-be135ad53af1.png" },
  // El pago y sus pedidos nunca van a Google (además de la regla de /robots.txt).
  robots: { index: false, follow: false },
};

export default function DisenoPago({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
