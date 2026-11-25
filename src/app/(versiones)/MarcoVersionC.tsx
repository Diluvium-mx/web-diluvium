import type { Version } from "@/lib/versiones";
import type { Seccion } from "@/lib/contenido";
import type { Producto } from "@/components/producto/catalogo";
import { Secciones } from "@/components/secciones/registro";
import { Medicion } from "@/components/secciones/landing/Medicion";
import { EnlacesVersion } from "@/components/secciones/landing/EnlacesVersion";
import { MapaVersion } from "@/components/mapa/MapaVersion";
import { AlejarFotos } from "@/components/AlejarFotos";
import { FotosNitidas } from "@/components/FotosNitidas";
import { esArchivoMapa } from "@/lib/mapa";
import { EXPERIMENTO } from "@/lib/versiones";
import { PastillaVersion } from "./PastillaVersion";

// Marco de las páginas de la versión C (24-nov-2026): las partes van una tras otra como están en la plantilla
// (encabezado y pie incluidos), sin las olas de B. Lleva lo mismo que B alrededor: «Saltar al contenido», la pastilla
// de la versión, la medición, los enlaces que se quedan en la versión, las fotos nítidas y el mapa («?mapa»).

export function MarcoVersionC({ v, secciones, producto, archivoMapa }: { v: Version; secciones: Seccion[]; producto?: Producto; archivoMapa?: string }) {
  const encabezado = secciones.filter((s) => s.tipo === "c-encabezado");
  const cuerpo = secciones.filter((s) => s.tipo !== "c-encabezado" && s.tipo !== "c-pie");
  const pie = secciones.filter((s) => s.tipo === "c-pie");
  return (
    <div className="version bg-white text-tinta">
      <a href="#contenido" className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold text-marino focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Saltar al contenido
      </a>
      <Secciones secciones={encabezado} producto={producto} />
      <main id="contenido">
        <Secciones secciones={cuerpo} producto={producto} />
      </main>
      <Secciones secciones={pie} producto={producto} />
      <PastillaVersion etiqueta={v.etiqueta} />
      <Medicion experimento={EXPERIMENTO} version={v.etiqueta} />
      <EnlacesVersion clave={v.clave} conPaginas={Boolean(v.paginas)} />
      <AlejarFotos />
      <FotosNitidas />
      {archivoMapa && esArchivoMapa(archivoMapa) && <MapaVersion archivo={archivoMapa} />}
    </div>
  );
}
