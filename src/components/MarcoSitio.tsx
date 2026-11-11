import type { Metadata } from "next";
import { Archivo, Bevan, Instrument_Sans } from "next/font/google";
import { plantilla } from "@/lib/contenido";
import { FranjaMensajes } from "@/components/secciones/FranjaMensajes";
import { BarraContacto } from "@/components/encabezado/BarraContacto";
import { Encabezado } from "@/components/encabezado/Encabezado";
import { Pie } from "@/components/pie/Pie";
import { BotonWhatsapp } from "@/components/comunes/BotonWhatsapp";
import { DatosEstructurados, datosOrganizacion } from "@/lib/seo";

// Marco de toda la tienda: letras, franja, barra de contacto, encabezado, pie y botón de WhatsApp. Lo usan el diseño
// de la tienda (app/(sitio)/layout.tsx) y la página para direcciones que no existen (app/global-not-found.tsx), que
// va aparte porque el administrador (app/(payload)) tiene su propio marco.

// Las mismas letras que usa el tema (Google Fonts); Next las descarga al construir y las sirve desde la página.
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const bevan = Bevan({ subsets: ["latin"], weight: "400", variable: "--font-bevan", display: "swap" });

export const METADATOS_SITIO: Metadata = {
  metadataBase: new URL("https://www.diluvium.com.mx"),
  // Título, descripción y fichas para redes salen de cada página (src/lib/seo.tsx), como en vivo.
  title: { default: "Diluvium", template: "%s – Diluvium" },
  icons: { icon: "/media/files/Favicon_2aabf220-4641-4694-9dbb-be135ad53af1.png" },
  // En la copia de prueba ninguna página se indexa (aunque alguien comparta el enlace).
  ...(process.env.SITIO_PRUEBA === "1" ? { robots: { index: false, follow: false } } : {}),
};

/** Franja, barra de contacto, encabezado, pie y botón de WhatsApp de la tienda alrededor del contenido. Lo usa
 * MarcoSitio y la versión A de las pruebas (/v/a), que tiene su propio diseño raíz. */
export function PiezasTienda({ children }: { children: React.ReactNode }) {
  const encabezado = plantilla("encabezado").secciones;
  const pie = plantilla("pie").secciones;
  const franja = encabezado.find((s) => s.tipo === "running-content");
  const contacto = encabezado.find((s) => s.tipo === "extra-info-header");
  const cabecera = encabezado.find((s) => s.tipo === "header");
  const piePagina = pie.find((s) => s.tipo === "footer");

  return (
    <>
      {franja && <FranjaMensajes seccion={franja} />}
      {contacto && <BarraContacto seccion={contacto} />}
      {cabecera && <Encabezado seccion={cabecera} />}
      <main>{children}</main>
      {piePagina && <Pie seccion={piePagina} />}
      <BotonWhatsapp />
    </>
  );
}

export function MarcoSitio({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${instrumentSans.variable} ${archivo.variable} ${bevan.variable}`}>
      <body>
        <DatosEstructurados datos={datosOrganizacion()} />
        <PiezasTienda>{children}</PiezasTienda>
      </body>
    </html>
  );
}
