import type { Metadata } from "next";
import { Archivo, Bevan, Instrument_Sans } from "next/font/google";
import { plantilla } from "@/lib/contenido";
import { FranjaMensajes } from "@/components/secciones/FranjaMensajes";
import { BarraContacto } from "@/components/encabezado/BarraContacto";
import { Encabezado } from "@/components/encabezado/Encabezado";
import { Pie } from "@/components/pie/Pie";
import { BotonWhatsapp } from "@/components/comunes/BotonWhatsapp";
import { DatosEstructurados, datosOrganizacion } from "@/lib/seo";
import "./globals.css";

// Las mismas letras que usa el tema (Google Fonts); Next las descarga al construir y las sirve desde la página.
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const bevan = Bevan({ subsets: ["latin"], weight: "400", variable: "--font-bevan", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.diluvium.com.mx"),
  // Título, descripción y fichas para redes salen de cada página (src/lib/seo.tsx), como en vivo.
  title: { default: "Diluvium", template: "%s – Diluvium" },
  icons: { icon: "/media/files/Favicon_2aabf220-4641-4694-9dbb-be135ad53af1.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const encabezado = plantilla("encabezado").secciones;
  const pie = plantilla("pie").secciones;
  const franja = encabezado.find((s) => s.tipo === "running-content");
  const contacto = encabezado.find((s) => s.tipo === "extra-info-header");
  const cabecera = encabezado.find((s) => s.tipo === "header");
  const piePagina = pie.find((s) => s.tipo === "footer");

  return (
    <html lang="es" className={`${instrumentSans.variable} ${archivo.variable} ${bevan.variable}`}>
      <body>
        <DatosEstructurados datos={datosOrganizacion()} />
        {franja && <FranjaMensajes seccion={franja} />}
        {contacto && <BarraContacto seccion={contacto} />}
        {cabecera && <Encabezado seccion={cabecera} />}
        <main>{children}</main>
        {piePagina && <Pie seccion={piePagina} />}
        <BotonWhatsapp />
      </body>
    </html>
  );
}
