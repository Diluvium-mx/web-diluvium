import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "../(versiones)/versiones.css";

// Diseño raíz del editor local (/editor): solo en esta Mac con npm run dev. No se publica en Cloudflare
// (herramientas/publicar-prueba.mjs lo quita de la copia) y en producción responde 404 (src/lib/editor/guardia.ts).

const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Editor de la página – Diluvium",
  robots: { index: false, follow: false },
};

export default function DisenoEditor({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={instrumentSans.variable}>
      <body className="bg-niebla text-tinta">{children}</body>
    </html>
  );
}
