import { buscarRapido } from "@/components/producto/busqueda";
import { precioTexto, proveedor, resumenPrecio } from "@/components/producto/catalogo";

// Resultados rápidos del buscador del encabezado (en Shopify: /search/suggest). Devuelve solo lo que se dibuja.

export type SugerenciasJson = {
  productos: { titulo: string; enlace: string; proveedor: string; imagen: string; alt: string; precio: string; antes: string }[];
  colecciones: { titulo: string; enlace: string; imagen: string; cantidad: number }[];
  articulos: { titulo: string; enlace: string; imagen: string }[];
  paginas: { titulo: string; enlace: string }[];
};

export function GET(peticion: Request) {
  const q = (new URL(peticion.url).searchParams.get("q") ?? "").slice(0, 200);
  const r = buscarRapido(q);
  const datos: SugerenciasJson = {
    productos: r.productos.map((p) => {
      const precio = resumenPrecio(p);
      return {
        titulo: p.titulo,
        enlace: `/products/${p.nombre}`,
        proveedor: proveedor(p),
        imagen: p.imagenes[0]?.src ?? "",
        alt: p.imagenes[0]?.alt || p.titulo,
        precio: `${precio.desde ? "Desde " : ""}${precioTexto(precio.precio)}`,
        antes: precio.antes ? precioTexto(precio.antes) : "",
      };
    }),
    colecciones: r.colecciones.map((c) => ({
      titulo: c.titulo,
      enlace: `/collections/${c.nombre}`,
      imagen: c.imagen ?? "",
      cantidad: c.productos.length,
    })),
    articulos: r.articulos.map((a) => ({ titulo: a.titulo, enlace: a.url, imagen: a.imagen?.src ?? "" })),
    paginas: r.paginas.map((p) => ({ titulo: p.titulo, enlace: p.ruta })),
  };
  return Response.json(datos, { headers: { "Cache-Control": "public, max-age=300" } });
}
