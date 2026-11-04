// Migas de pan (sección «breadcrumb»): «Inicio › Nombre del producto»; en las páginas sueltas «Inicio › Título de la
// página» («actual»); en /collections «Inicio › Colecciones» y en /search «Inicio › Buscar»; el blog pasa sus propios
// «pasos» (el último no es enlace). Si el nombre no cabe, baja al siguiente renglón como en la tienda. Con el esquema
// transparente («scheme-5») el tema deja el aire por fuera (margen) en lugar de por dentro. Al pasar el mouse, los
// enlaces se ponen naranjas y subrayados (0.25 s).

import { Fragment } from "react";
import Link from "next/link";
import type { PropsSeccion } from "./registro";
import { esquema, plantilla } from "@/lib/contenido";

export type PasoMigas = { texto: string; url?: string };

const ENLACE = "leading-[17px] transition-all duration-[250ms] hover:text-naranja hover:underline";

function Flecha() {
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" aria-hidden="true" focusable="false">
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

/** Paso fijo de las plantillas que no tienen título propio (medido en vivo, 3-nov-2026). */
function pasoDePlantilla(seccion: PropsSeccion["seccion"]): string | undefined {
  if (plantilla("list-collections").secciones.includes(seccion)) return "Colecciones";
  if (plantilla("search").secciones.includes(seccion)) return "Buscar";
  return undefined;
}

export function MigasDePan({
  seccion,
  producto,
  actual,
  pasos,
}: PropsSeccion & { actual?: string; pasos?: PasoMigas[] }) {
  const nombre = producto?.titulo ?? actual ?? pasoDePlantilla(seccion);
  const lista: PasoMigas[] = pasos ?? (nombre ? [{ texto: nombre }] : []);
  const aire = "py-4 md:py-6 min-[1025px]:py-8";
  const transparente = esquema(seccion.ajustes) === "esquema-5";
  return (
    <div
      className={`${esquema(seccion.ajustes)} ${transparente ? "my-4 md:my-6 min-[1025px]:my-8" : ""}`}
      data-seccion="breadcrumb"
    >
      <nav aria-label="Migas de pan" className={`contenedor ${transparente ? "" : aire}`}>
        <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0 text-[13.6px] leading-6 break-words">
          <li>
            <Link href="/" className={ENLACE}>
              Inicio
            </Link>
          </li>
          {lista.map((paso, i) => (
            <Fragment key={`${i}-${paso.texto}`}>
              <li className="flex">
                <Flecha />
              </li>
              <li>
                {paso.url ? (
                  <Link href={paso.url} className={ENLACE}>
                    {paso.texto}
                  </Link>
                ) : (
                  <span aria-current="page" className="leading-[17px] opacity-60">
                    {paso.texto}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
    </div>
  );
}
