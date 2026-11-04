// Lista de colecciones (sección «main-list-collections», página /collections): título «Collection list» y una tarjeta
// cuadrada por colección con su foto y el nombre encima, abajo al centro.

import Image from "next/image";
import Link from "next/link";
import type { PropsSeccion } from "./registro";
import { esquema } from "@/lib/contenido";
import { LISTA_COLECCIONES, coleccion } from "@/components/producto/colecciones";
import type { Coleccion } from "@/components/producto/colecciones";

export function ListaColecciones({ seccion }: PropsSeccion) {
  const colecciones = LISTA_COLECCIONES.map((n) => coleccion(n)).filter((c): c is Coleccion => Boolean(c));
  return (
    <div className={`${esquema(seccion.ajustes)} my-[var(--aire)]`} data-seccion="main-list-collections">
      <div className="contenedor grid gap-6 md:gap-9 min-[1025px]:gap-12">
        <div className="mx-auto">
          {/* El tema pone el título de ejemplo en inglés; así se ve en vivo. */}
          <h1 style={{ fontSize: "var(--h2)" }}>Collection list</h1>
        </div>
        <div className="grid grid-cols-2 gap-[3.6vw] md:gap-[3.125vw] min-[1025px]:grid-cols-4 min-[1025px]:gap-[2vw]">
          {colecciones.map((c, i) => (
            <div
              key={c.nombre}
              className="esquema-6 group relative aspect-square overflow-hidden rounded-2xl text-center md:rounded-3xl min-[1025px]:rounded-[32px]"
            >
              <Link href={`/collections/${c.nombre}`} aria-label={c.titulo} className="absolute inset-0 z-[3]" />
              {c.imagen && (
                <Image
                  src={c.imagen}
                  alt={c.titulo}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1025px) 25vw, 50vw"
                  className="object-cover transition-transform duration-150 group-hover:scale-110"
                />
              )}
              <div className="absolute bottom-0 z-[2] w-full p-4 break-words min-[1025px]:p-6">
                <h3 className="relative z-[3] text-azul-oscuro" style={{ fontSize: 19.2, lineHeight: "24px" }}>
                  {c.titulo}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
