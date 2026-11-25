import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { EXPERIMENTO, VERSIONES, version } from "@/lib/versiones";
import { PiezasTienda } from "@/components/MarcoSitio";
import { Secciones } from "@/components/secciones/registro";
import { Medicion } from "@/components/secciones/landing/Medicion";
import { EnlacesVersion } from "@/components/secciones/landing/EnlacesVersion";
import { PastillaVersion } from "../../PastillaVersion";
import { MarcoVersionB } from "../../MarcoVersionB";
import { MarcoVersionC } from "../../MarcoVersionC";

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

  if (v.clave.startsWith("c")) return <MarcoVersionC v={v} secciones={secciones} archivoMapa={`index.${v.clave}`} />;
  return <MarcoVersionB v={v} secciones={secciones} archivoMapa={`index.${v.clave}`} />;
}
