import type { ReactNode } from "react";
import type { Version } from "@/lib/versiones";
import { plantilla, type Seccion } from "@/lib/contenido";
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

// Marco de las páginas de las versiones C y D (24 y 25-nov-2026): las partes van una tras otra como están en la
// plantilla, sin las olas de B. El encabezado («c-encabezado» o «d-encabezado»), el pie y la barra o botón fijo de
// WhatsApp («-barra») salen de la plantilla de la página o, si no los trae, de los de la portada de la versión (así se
// editan en un solo lugar); los prestados van dentro de «data-prestada» y el editor no deja tocar ahí sus fotos.
// Lleva lo mismo que B alrededor: «Saltar al contenido», la pastilla de la versión, la medición, los enlaces que se
// quedan en la versión, las fotos nítidas y el mapa («?mapa»).

const PARTES_FIJAS = ["encabezado", "pie", "barra"] as const;

function Prestada({ si, children }: { si: boolean; children: ReactNode }) {
  return si ? (
    <div data-prestada="" className="contents">
      {children}
    </div>
  ) : (
    children
  );
}

export function MarcoVersionC({
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
  archivoMapa?: string;
}) {
  const letra = v.clave.charAt(0);
  const tipo = (parte: (typeof PARTES_FIJAS)[number]) => `${letra}-${parte}`;
  const esFija = (s: Seccion) => PARTES_FIJAS.some((p) => s.tipo === tipo(p));
  const portada = secciones.some((s) => s.tipo === tipo("encabezado")) ? [] : plantilla(v.plantilla).secciones;
  const parte = (p: (typeof PARTES_FIJAS)[number]) => {
    const propias = secciones.filter((s) => s.tipo === tipo(p));
    return { secciones: propias.length ? propias : portada.filter((s) => s.tipo === tipo(p)), prestada: !propias.length };
  };
  const encabezado = parte("encabezado");
  const pie = parte("pie");
  const barra = parte("barra");
  const cuerpo = secciones.filter((s) => !esFija(s));
  return (
    <div className="version bg-white text-tinta">
      <a href="#contenido" className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold text-marino focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Saltar al contenido
      </a>
      <Prestada si={encabezado.prestada}>
        <Secciones secciones={encabezado.secciones} producto={producto} />
      </Prestada>
      <main id="contenido">
        <Secciones secciones={cuerpo} producto={producto} slugArticulo={slugArticulo} />
      </main>
      <Prestada si={pie.prestada}>
        <Secciones secciones={pie.secciones} producto={producto} />
      </Prestada>
      <Prestada si={barra.prestada}>
        <Secciones secciones={barra.secciones} producto={producto} />
      </Prestada>
      <PastillaVersion etiqueta={v.etiqueta} />
      <Medicion experimento={EXPERIMENTO} version={v.etiqueta} />
      <EnlacesVersion clave={v.clave} conPaginas={Boolean(v.paginas)} />
      <AlejarFotos />
      <FotosNitidas />
      {archivoMapa && esArchivoMapa(archivoMapa) && <MapaVersion archivo={archivoMapa} />}
    </div>
  );
}
