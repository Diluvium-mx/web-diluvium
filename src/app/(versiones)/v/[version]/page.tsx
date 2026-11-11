import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { EXPERIMENTO, VERSIONES, version } from "@/lib/versiones";
import { PiezasTienda } from "@/components/MarcoSitio";
import { Secciones } from "@/components/secciones/registro";
import { Medicion } from "@/components/secciones/landing/Medicion";

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

/** «Versión B1 · cambiar»: lleva a la lista de versiones. Solo para revisar; no forma parte de la versión. En
 * computadora flota abajo a la izquierda; en celular y tableta va al final, para no tapar el botón ni la barra. */
function PastillaVersion({ etiqueta }: { etiqueta: string }) {
  const contenido = (
    <>
      Versión {etiqueta}
      <span aria-hidden="true">·</span>
      <span className="underline underline-offset-2">cambiar</span>
    </>
  );
  return (
    <>
      <Link
        href="/v"
        className="fixed bottom-4 left-4 z-[35] hidden min-h-9 items-center gap-1.5 rounded-full bg-tinta/85 px-3.5 text-[13px] font-semibold text-white shadow-lg backdrop-blur hover:bg-tinta lg:inline-flex"
      >
        {contenido}
      </Link>
      <div className="bg-tinta pb-24 text-center md:pb-4 lg:hidden">
        <Link href="/v" className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-white">
          {contenido}
        </Link>
      </div>
    </>
  );
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
    </div>
  );
}
