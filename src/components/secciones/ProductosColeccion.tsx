// Encabezado y productos de una colección, con filtros, orden y columnas (sección «main-collection-products»).
// El servidor ordena y filtra según la dirección (?sort_by=…, ?filter.v.…), como Shopify; lo que se mueve en la
// página (orden, columnas, filtros) está en ColeccionInteractiva.

import type { PropsSeccion } from "./registro";
import { esquema } from "@/lib/contenido";
import type { Coleccion, Filtros } from "@/components/producto/colecciones";
import { ORDENES, aplicarFiltros, hayFiltros, precioMaximo, productosOrdenados } from "@/components/producto/colecciones";
import { ColeccionInteractiva } from "@/components/producto/ColeccionInteractiva";
import { TarjetaColeccion } from "@/components/producto/TarjetaColeccion";

type Props = PropsSeccion & { coleccion?: Coleccion; filtros?: Filtros };

// Ancho de la foto: 2 por renglón en celular y tableta, 4 en computadora (se puede cambiar a 3 o 6).
const SIZES = "(min-width: 1025px) 25vw, 50vw";

export function ProductosColeccion({ seccion, coleccion, filtros }: Props) {
  if (!coleccion || !filtros) return <div data-seccion="main-collection-products" />;
  const todos = productosOrdenados(coleccion, filtros.orden);
  const visibles = hayFiltros(filtros) ? aplicarFiltros(todos, filtros) : todos;
  // «(7 productos )» o, con filtros que quitan productos, «(1 de 7 productos )», con el espacio de la tienda.
  const conteo = visibles.length === todos.length ? `(${todos.length} productos )` : `(${visibles.length} de ${todos.length} productos )`;
  const base = `/collections/${coleccion.nombre}`;

  return (
    <div className={`${esquema(seccion.ajustes)} my-[var(--aire)]`} data-seccion="main-collection-products">
      <ColeccionInteractiva
        base={base}
        titulo={coleccion.titulo}
        conteo={conteo}
        filtros={filtros}
        precioMax={precioMaximo(todos)}
        ordenes={ORDENES}
        tarjetas={visibles.map((p, i) => ({
          clave: p.nombre,
          nodo: <TarjetaColeccion producto={p} enlace={`${base}/products/${p.nombre}`} sizes={SIZES} prioridad={i < 4} />,
        }))}
      />
    </div>
  );
}
