import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { EXPERIMENTO, VERSIONES, version } from "@/lib/versiones";
import { PiezasTienda } from "@/components/MarcoSitio";
import { Secciones } from "@/components/secciones/registro";
import { Medicion } from "@/components/secciones/landing/Medicion";
import { EnlacesVersion } from "@/components/secciones/landing/EnlacesVersion";
import { PastillaVersion } from "../../PastillaVersion";
import { MapaVersion } from "@/components/mapa/MapaVersion";
import { esArchivoMapa } from "@/lib/mapa";

// Una versión de la portada: /v/a es la portada de hoy con el marco de la tienda; /v/b1… son las versiones B, cada
// una con su contenido (contenido/tema/index.<versión>.json) y su propio encabezado. Todas llevan la medición.

export function generateStaticParams() {
  return VERSIONES.map((v) => ({ version: v.clave }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const v = version((await params).version);
  return v ? { title: `Versión ${v.etiqueta}: ${v.nombre}` } : {};
}

export default async function PaginaVersion({ params }: { params: Promise<{ version: string }> }) {
  const v = version((await params).version);
  if (!v) notFound();
  const secciones = plantilla(v.plantilla).secciones;

  if (v.clave === "a") {
    return (
      <>
        <PiezasTienda>
          <Secciones secciones={secciones} />
        </PiezasTienda>
        <PastillaVersion etiqueta={v.etiqueta} />
        <Medicion experimento={EXPERIMENTO} version={v.etiqueta} />
        <EnlacesVersion clave={v.clave} />
      </>
    );
  }

  // El encabezado y el pie son secciones de la plantilla: todo lo demás va dentro de <main>.
  const encabezado = secciones.filter((s) => s.tipo === "landing-encabezado");
  const pie = secciones.filter((s) => s.tipo === "landing-pie");
  const cuerpo = secciones.filter((s) => s.tipo !== "landing-encabezado" && s.tipo !== "landing-pie");

  return (
    <div className="version bg-white text-marino">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold text-marino focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <Secciones secciones={encabezado} />
      <main id="contenido">
        <Secciones secciones={cuerpo} />
      </main>
      <Secciones secciones={pie} />
      <PastillaVersion etiqueta={v.etiqueta} />
      <Medicion experimento={EXPERIMENTO} version={v.etiqueta} />
      <EnlacesVersion clave={v.clave} />
      {/* Mapa con los nombres de cada parte: solo con «?mapa» en la dirección. */}
      {esArchivoMapa(`index.${v.clave}`) && <MapaVersion archivo={`index.${v.clave}` as "index.b1"} />}
    </div>
  );
}
