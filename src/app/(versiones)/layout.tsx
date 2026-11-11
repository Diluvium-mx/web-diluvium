import type { Metadata, Viewport } from "next";
import { Archivo, Bevan, Instrument_Sans } from "next/font/google";
import "./versiones.css";

// Diseño raíz de las versiones de la portada para pruebas (/v, /v/a, /v/b1…). Va aparte de la tienda para que las
// versiones B tengan su propio encabezado, sin las 2 barras de arriba. Nunca se indexa.

const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
// Archivo con su eje de ancho («wdth»): los títulos de las versiones B van extra gruesos y anchos. Con el ancho normal
// es la misma letra de la tienda (la versión A se ve igual).
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
// Solo la usa la versión A (la portada de hoy): sin precarga.
const bevan = Bevan({ subsets: ["latin"], weight: "400", variable: "--font-bevan", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.diluvium.com.mx"),
  title: { default: "Versiones de la portada – Diluvium", template: "%s – Diluvium" },
  icons: { icon: "/media/files/Favicon_2aabf220-4641-4694-9dbb-be135ad53af1.png" },
  // Páginas de trabajo: Google nunca las indexa ni sigue sus enlaces (además de /robots.txt y X-Robots-Tag).
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function DisenoVersiones({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${instrumentSans.variable} ${archivo.variable} ${bevan.variable}`}>
      <body>{children}</body>
    </html>
  );
}
