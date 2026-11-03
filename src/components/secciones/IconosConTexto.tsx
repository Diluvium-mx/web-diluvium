// Íconos con texto (sección «icon-with-text»): envío gratis, garantía, características del producto…
// Con «list_style» activo, en celular y tableta van en carrusel que se desliza (uno y dos por vista); si no, en
// rejilla de 1 y 2 columnas. En computadora, siempre en «columns_per_row» columnas.

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import productos from "@contenido/productos.json";
import type { Bloque, Seccion } from "@/lib/contenido";
import { esquema, numero, plantilla, plantillaProducto, siNo, texto } from "@/lib/contenido";
import { TextoRico, Titulo } from "@/components/comunes/Texto";
import type { Producto } from "@/components/producto/catalogo";
import { sinAireArriba } from "./aire";

// Íconos dibujados para Diluvium con la idea de los de la biblioteca del tema (no son su código).
const ICONOS: Record<string, ReactNode> = {
  truck: (
    <>
      <path d="M3 6.5h12.5v11" />
      <path d="M15.5 9.5h3.8l2.7 3.6v4.4h-1.2" />
      <path d="M3 17.5h1.6M10.1 17.5h5.4" />
      <path d="M3 9.8h6.5M3 13.2h4.5" />
      <circle cx="7.4" cy="18" r="2.2" />
      <circle cx="18.2" cy="18" r="2.2" />
    </>
  ),
  "check-circle": (
    <>
      <path d="M15.6 20.5A9 9 0 1 1 19.4 17.8" />
      <path d="m8.8 12.3 2.6 2.6 4.9-5" />
    </>
  ),
  check: <path d="m2.2 13.2 5.4 5.4L21.8 4.6" strokeLinecap="butt" />,
  heart: (
    <path d="M12.6 8.8c-1.5-3.3-5.7-4-7.5-1.4-1.4 2.1-.6 4.6 1.3 6.5l6.2 5.9 6.2-5.9c1.9-1.9 2.7-4.4 1.3-6.5-1.8-2.6-6-1.9-7.5 1.4Z" />
  ),
  subscription: (
    <>
      <path d="M5.2 8.7V4.5h14.4v8.2" />
      <path d="m15.8 9.3 3.8 3.8 3.8-3.8" />
      <path d="M19.6 16.4v3.9H5.2v-8.6" />
      <path d="m1.4 15.3 3.8-3.8 3.8 3.8" />
    </>
  ),
  storefront: (
    <>
      <path d="M5 4h15l1.6 4.6a2.6 2.6 0 0 1-4.8 1.6 2.6 2.6 0 0 1-4.3 0 2.6 2.6 0 0 1-4.3 0A2.6 2.6 0 0 1 3.4 8.6z" />
      <path d="M5.4 12v8h14.2v-8" />
      <path d="M9.5 15h6v2.2h-6z" />
    </>
  ),
};

function Icono({ nombre }: { nombre: string }) {
  return (
    <svg
      viewBox="0 0 25 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="round"
      className="size-full"
      aria-hidden="true"
      focusable="false"
    >
      {ICONOS[nombre] ?? ICONOS["check-circle"]}
    </svg>
  );
}

/** Ícono del bloque: imagen propia («custom_img») o uno de la biblioteca. */
function IconoBloque({ bloque }: { bloque: Bloque }) {
  const b = bloque.ajustes;
  const fuente = texto(b, "icon_source");
  if (fuente === "html") return null;
  const imagen = texto(b, "custom_img");
  if (fuente === "custom_img" && imagen) {
    return (
      <Image
        src={imagen}
        alt=""
        width={60}
        height={64}
        sizes="60px"
        unoptimized={imagen.endsWith(".svg")}
        className="size-full object-cover"
      />
    );
  }
  return <Icono nombre={texto(b, "options_icon")} />;
}

/** ¿La sección anterior es una franja de mensajes del mismo color? (medido en vivo: también quita el aire de
 * arriba en celular y tableta; «aire.ts» no cuenta las franjas como anterior). */
function despuesDeFranjaIgual(seccion: Seccion, producto?: Producto): boolean {
  const plantillaNombre = producto ? productos.productos.find((p) => p.nombre === producto.nombre)?.plantilla : undefined;
  const lista = producto ? plantillaProducto(plantillaNombre ?? "").secciones : plantilla("portada").secciones;
  const i = lista.findIndex((s) => s.id === seccion.id);
  const anterior = i > 0 ? lista[i - 1] : undefined;
  return anterior?.tipo === "running-content" && esquema(anterior.ajustes) === esquema(seccion.ajustes);
}

const COLUMNAS: Record<number, string> = {
  1: "min-[1025px]:grid-cols-1",
  2: "min-[1025px]:grid-cols-2",
  3: "min-[1025px]:grid-cols-3",
  4: "min-[1025px]:grid-cols-4",
  5: "min-[1025px]:grid-cols-5",
  6: "min-[1025px]:grid-cols-6",
};

export function IconosConTexto({ seccion, producto }: { seccion: Seccion; producto?: Producto }) {
  const a = seccion.ajustes;
  const tamano = texto(a, "icon_size") || "64px";
  const carrusel = siNo(a, "list_style");
  const columnas = COLUMNAS[numero(a, "columns_per_row", 3)] ?? COLUMNAS[3];
  const sub = texto(a, "subheading");
  const titulo = texto(a, "heading");
  const descripcion = texto(a, "description");
  const tamanoTitulo = texto(a, "heading_size") || "h2";
  // En computadora el aire es siempre de 30 px (medido, aunque la anterior sea del mismo color).
  const sinAire = sinAireArriba(seccion, producto) || despuesDeFranjaIgual(seccion, producto);
  const arriba = sinAire ? "pt-0 min-[1025px]:pt-[30px]" : "pt-[var(--aire)] min-[1025px]:pt-[30px]";

  // Carrusel (deslizable) o rejilla debajo de 1025 px; en computadora, rejilla.
  const lista = carrusel
    ? "-mx-[var(--margen)] flex snap-x snap-mandatory gap-[min(3.6vw,24px)] overflow-x-auto scroll-px-[var(--margen)] px-[var(--margen)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[1025px]:mx-0 min-[1025px]:overflow-visible min-[1025px]:px-0"
    : "grid grid-cols-1 gap-[min(3.6vw,24px)] md:grid-cols-2";
  const tarjeta = carrusel ? "shrink-0 basis-full snap-start md:basis-[calc((100%-24px)/2)]" : "";

  return (
    <div className={`${esquema(a)} overflow-hidden`} data-seccion="icon-with-text">
      <div className={`contenedor flex flex-col gap-[var(--hueco)] ${arriba} pb-[var(--aire)] min-[1025px]:pb-[30px]`}>
        {(sub || titulo || descripcion) && (
          <div className="flex flex-col items-center text-center">
            {sub && <span className="mb-3 inline-block font-titulo text-[19.2px] leading-6 font-medium">{sub}</span>}
            <Titulo texto={titulo} className="break-words" style={{ fontSize: `var(--${tamanoTitulo})` }} />
            {descripcion && <TextoRico html={descripcion} className="mt-4 max-w-[650px]" />}
          </div>
        )}
        <div className={`${lista} min-[1025px]:grid min-[1025px]:gap-[2vw] ${columnas}`}>
          {seccion.bloques.map((b) => {
            const encabezado = texto(b.ajustes, "heading");
            const detalle = texto(b.ajustes, "description");
            return (
              <div
                key={b.id}
                className={`flex min-w-0 flex-col items-center gap-3 py-4 text-center min-[1025px]:py-6 ${tarjeta}`}
              >
                <div className="pr-1" style={{ width: tamano, height: tamano } as CSSProperties}>
                  <IconoBloque bloque={b} />
                </div>
                {(encabezado || detalle) && (
                  <div className="flex flex-col gap-2">
                    {encabezado && <h3 style={{ fontSize: "19.2px", lineHeight: "24px" }}>{encabezado}</h3>}
                    <TextoRico html={detalle} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
