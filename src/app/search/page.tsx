import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { leerFiltros } from "@/components/producto/colecciones";
import { Secciones } from "@/components/secciones/registro";
import { Busqueda, resultadosBusqueda } from "@/components/secciones/Busqueda";

// Búsqueda, con la misma dirección que en Shopify: /search?q=…&type=…&sort_by=…&filter.v.…

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function leerConsulta(searchParams: Props["searchParams"]) {
  const p = await searchParams;
  const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  // Un «type» con varios tipos («product,article») cuenta como todos.
  const tipo = uno(p.type);
  return { q: uno(p.q).slice(0, 200), tipo: tipo.includes(",") ? "" : tipo, filtros: leerFiltros(p, "relevance", ["relevance", "price-ascending", "price-descending"]) };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const consulta = await leerConsulta(searchParams);
  const q = consulta.q.trim();
  if (!q) return { title: "Buscar", alternates: { canonical: "/search" } };
  const n = resultadosBusqueda(consulta).lista.length;
  return { title: `Búsqueda: ${n} resultados encontrados para "${q}"`, alternates: { canonical: `/search?q=${encodeURIComponent(q)}` } };
}

export default async function PaginaBusqueda({ searchParams }: Props) {
  const consulta = await leerConsulta(searchParams);
  return plantilla("search").secciones.map((s) =>
    s.tipo === "main-search" ? <Busqueda key={s.id} seccion={s} consulta={consulta} /> : <Secciones key={s.id} secciones={[s]} />,
  );
}
