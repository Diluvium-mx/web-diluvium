// Página de búsqueda (sección «main-search»): título, campo de búsqueda y, con una búsqueda, las pestañas por tipo
// (Productos, Blog posts, Páginas), el filtro, el orden y los resultados mezclados como en la tienda.

import Image from "next/image";
import Link from "next/link";
import type { PropsSeccion } from "./registro";
import { esquema } from "@/lib/contenido";
import { IconoBuscar } from "@/components/comunes/Iconos";
import type { Filtros } from "@/components/producto/colecciones";
import { aplicarFiltros, hayFiltros, precioMaximo } from "@/components/producto/colecciones";
import type { Resultado } from "@/components/producto/busqueda";
import { buscarPagina } from "@/components/producto/busqueda";
import type { Producto } from "@/components/producto/catalogo";
import { resumenPrecio } from "@/components/producto/catalogo";
import { BusquedaInteractiva } from "@/components/producto/BusquedaInteractiva";
import { TarjetaColeccion } from "@/components/producto/TarjetaColeccion";

export type ConsultaBusqueda = { q: string; tipo: string; filtros: Filtros };

const TIPOS = [
  { tipo: "product", resultado: "producto", texto: "Productos" },
  { tipo: "article", resultado: "articulo", texto: "Blog posts" },
  { tipo: "page", resultado: "pagina", texto: "Páginas" },
] as const;

/** Resultados con el tipo, los filtros y el orden pedidos (los filtros y el orden solo aplican a productos). */
export function resultadosBusqueda({ q, tipo, filtros }: ConsultaBusqueda) {
  const todos = buscarPagina(q);
  const conteos = TIPOS.map((t) => todos.filter((r) => r.tipo === t.resultado).length);
  let lista = todos;
  const elegido = TIPOS.find((t) => t.tipo === tipo);
  if (elegido) lista = lista.filter((r) => r.tipo === elegido.resultado);
  if (hayFiltros(filtros)) {
    const productos = aplicarFiltros(
      lista.flatMap((r) => (r.tipo === "producto" ? [r.producto] : [])),
      filtros,
    );
    lista = productos.map((p): Resultado => ({ tipo: "producto", producto: p }));
  }
  if (filtros.orden === "price-ascending" || filtros.orden === "price-descending") {
    const signo = filtros.orden === "price-ascending" ? 1 : -1;
    const precio = (r: Resultado) => (r.tipo === "producto" ? resumenPrecio(r.producto).precio : Infinity * signo);
    lista = [...lista].sort((a, b) => signo * (precio(a) - precio(b)));
  }
  const productos = todos.flatMap((r): Producto[] => (r.tipo === "producto" ? [r.producto] : []));
  return { lista, conteos, precioMax: precioMaximo(productos) };
}

function IconoPagina() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0 opacity-60" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 3h8l4 4v14H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Tarjeta({ r, i }: { r: Resultado; i: number }) {
  if (r.tipo === "producto") {
    return (
      <TarjetaColeccion
        producto={r.producto}
        enlace={`/products/${r.producto.nombre}`}
        sizes="(min-width: 1025px) 25vw, 100vw"
        vendedor
        estrellas={false}
        agregarRapido
        prioridad={i < 4}
      />
    );
  }
  if (r.tipo === "pagina") {
    return (
      <div className="relative h-full w-full">
        <Link href={r.pagina.ruta} aria-label={r.pagina.titulo} className="flex gap-x-2">
          <IconoPagina />
          <span className="flex-1 font-bold underline">{r.pagina.titulo}</span>
        </Link>
      </div>
    );
  }
  const a = r.articulo;
  // En tableta, con un resultado por renglón, el artículo ocupa media rejilla (como en la tienda).
  return (
    <div className="esquema-6 h-full w-full overflow-hidden rounded-2xl md:max-[1024px]:w-[calc((100%-3.125vw)/2)] text-azul-oscuro md:rounded-3xl min-[1025px]:rounded-[32px]">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl md:rounded-3xl min-[1025px]:rounded-[32px]">
        <Link href={a.url} aria-label={a.titulo} className="absolute inset-0 z-[1]" />
        {a.imagen && (
          <Image src={a.imagen.src} alt={a.imagen.alt || a.titulo} fill sizes="(min-width: 1025px) 25vw, 100vw" className="object-cover" />
        )}
      </div>
      <div className="p-4 min-[1025px]:p-6">
        <h3 className="mb-2" style={{ fontSize: 19.2, lineHeight: "24px" }}>
          <Link href={a.url}>{a.titulo}</Link>
        </h3>
        <div className="mb-3 text-[13.6px] leading-[17px] text-azul-oscuro/60">
          <span className="inline-block">{a.autor}</span>
          <span className="mx-3">•</span>
          <span className="inline-block">{a.fecha}</span>
        </div>
        {a.resumen && <p className="overflow-hidden">{a.resumen}</p>}
      </div>
    </div>
  );
}

type Props = PropsSeccion & { consulta?: ConsultaBusqueda };

export function Busqueda({ seccion, consulta }: Props) {
  const q = consulta?.q.trim() ?? "";
  const datos = consulta && q ? resultadosBusqueda(consulta) : null;
  const enlaceTipo = (tipo: string) => `/search?type=${tipo}&q=${encodeURIComponent(q)}&options%5Bprefix%5D=last`;
  const base = `/search?q=${encodeURIComponent(q)}${consulta?.tipo ? `&type=${consulta.tipo}` : ""}`;

  return (
    <div className={`${esquema(seccion.ajustes)} my-[var(--aire)] overflow-hidden`} data-seccion="main-search">
      <div className="contenedor">
        <div className="mx-auto flex flex-col gap-[var(--hueco)]">
          <div className="mx-auto grid w-full gap-[var(--hueco)]">
            <h1 className="text-center" style={{ fontSize: "var(--h2)" }}>
              {q ? "Buscar resultados" : "Buscar"}
            </h1>
            <div className="mx-auto w-full md:w-2/3 min-[1025px]:w-1/2">
              <form action="/search" method="get" role="search" className="relative w-full">
                <label htmlFor="busqueda-pagina" className="sr-only">
                  Buscar
                </label>
                <input
                  id="busqueda-pagina"
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar"
                  className="h-10 w-full rounded-[64px] border border-azul-oscuro/12 bg-white py-2 pr-11 pl-5 text-azul-oscuro outline-none placeholder:text-azul-oscuro/40 hover:border-azul-oscuro/40 focus:border-azul-oscuro min-[1025px]:h-11 [&::-webkit-search-cancel-button]:appearance-none"
                />
                <input type="hidden" name="options[prefix]" value="last" />
                <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2">
                  <button type="submit" aria-label="Buscar" className="pointer-events-auto flex size-10 items-center justify-center min-[1025px]:size-11">
                    <IconoBuscar className="h-5 w-5 min-[1025px]:h-6 min-[1025px]:w-6" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {datos && consulta && (
            <div>
              <ul className="-mx-[var(--margen)] mb-4 flex gap-4 overflow-x-auto px-[var(--margen)] md:mb-6 md:gap-6 min-[1025px]:mb-8 min-[1025px]:justify-center min-[1025px]:gap-8">
                {TIPOS.map((t, i) => {
                  const activa = consulta.tipo ? consulta.tipo === t.tipo : i === 0;
                  return (
                    <li key={t.tipo} className="shrink-0">
                      <Link
                        href={enlaceTipo(t.tipo)}
                        className={`block py-3 font-titulo font-medium whitespace-nowrap ${activa ? "" : "text-azul-oscuro/60"}`}
                      >
                        {t.texto} ({datos.conteos[i]})
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <BusquedaInteractiva
                base={base}
                conteo={`${datos.lista.length} productos`}
                filtros={consulta.filtros}
                precioMax={datos.precioMax}
                tarjetas={datos.lista.map((r, i) => ({
                  clave: `${r.tipo}-${r.tipo === "producto" ? r.producto.nombre : r.tipo === "pagina" ? r.pagina.nombre : r.articulo.slug}`,
                  nodo: <Tarjeta r={r} i={i} />,
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
