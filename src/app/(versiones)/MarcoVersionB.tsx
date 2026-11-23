import { plantilla, type Seccion } from "@/lib/contenido";
import type { Version } from "@/lib/versiones";
import type { Producto } from "@/components/producto/catalogo";
import { Secciones } from "@/components/secciones/registro";
import { SeccionesConOlas } from "@/components/secciones/landing/Olas";
import { Medicion } from "@/components/secciones/landing/Medicion";
import { EnlacesVersion } from "@/components/secciones/landing/EnlacesVersion";
import { MapaVersion } from "@/components/mapa/MapaVersion";
import { esArchivoMapa } from "@/lib/mapa";
import { EXPERIMENTO } from "@/lib/versiones";
import { PastillaVersion } from "./PastillaVersion";

// Marco de toda página de una versión B (portada, fichas y, desde el 23-nov-2026, Contacto, Nosotros, Blog, artículo y
// Productos): «Saltar al contenido», encabezado, el cuerpo con sus olas, pie, la pastilla de la versión, la medición y
// los enlaces que se quedan en la versión. Las páginas nuevas no traen encabezado ni pie en su plantilla: usan los de la
// portada de la versión (así se editan en un solo lugar), sin los enlaces «En esta página».

function marcoDePortada(v: Version, tipo: "landing-encabezado" | "landing-pie"): Seccion[] {
  return plantilla(v.plantilla)
    .secciones.filter((s) => s.tipo === tipo)
    .map((s) => (tipo === "landing-encabezado" ? { ...s, bloques: [] } : s));
}

export function MarcoVersionB({
  v,
  secciones,
  producto,
  slugArticulo,
  archivoMapa,
}: {
  v: Version;
  secciones: Seccion[];
  producto?: Producto;
  slugArticulo?: string;
  /** Archivo de la plantilla para el mapa («?mapa»), si la página tiene mapa. */
  archivoMapa?: string;
}) {
  const propioEncabezado = secciones.filter((s) => s.tipo === "landing-encabezado");
  const propioPie = secciones.filter((s) => s.tipo === "landing-pie");
  const encabezado = propioEncabezado.length ? propioEncabezado : marcoDePortada(v, "landing-encabezado");
  const pie = propioPie.length ? propioPie : marcoDePortada(v, "landing-pie");
  const cuerpo = secciones.filter((s) => s.tipo !== "landing-encabezado" && s.tipo !== "landing-pie");

  return (
    <div className="version bg-white text-marino">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold text-marino focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <Secciones secciones={encabezado} producto={producto} />
      <main id="contenido">
        <SeccionesConOlas secciones={cuerpo} producto={producto} slugArticulo={slugArticulo} />
      </main>
      <Secciones secciones={pie} producto={producto} />
      <PastillaVersion etiqueta={v.etiqueta} />
      <Medicion experimento={EXPERIMENTO} version={v.etiqueta} />
      <EnlacesVersion clave={v.clave} conPaginas={Boolean(v.paginas)} />
      {/* Mapa con los nombres de cada parte: solo con «?mapa» en la dirección. */}
      {archivoMapa && esArchivoMapa(archivoMapa) && <MapaVersion archivo={archivoMapa} />}
    </div>
  );
}
