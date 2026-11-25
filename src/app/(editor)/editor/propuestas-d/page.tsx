import { headers } from "next/headers";
import { notFound } from "next/navigation";
import resenas from "@contenido/resenas.json";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { calificacion } from "@/components/secciones/landing/datos";
import { PropuestasD, type ResenaPD } from "./PropuestasD";

// Propuestas para las reseñas de D (dueño, 25-nov-2026): con «Anterior» y «Siguiente» (114 y 116 del Producto de D)
// la página te regresa hasta arriba de las reseñas y cansa. Cuatro formas de pasar de una a otra deslizando el dedo,
// sin que la página salte. Solo en esta Mac: /editor/propuestas-d.

export const dynamic = "force-dynamic";

export default async function PaginaPropuestasD() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  type R = { nombre: string; calificacion: number | string; texto: string; fotos: string[] };
  // Las mismas que muestra la sección de D: de 2 estrellas para arriba (como en B).
  const lista: ResenaPD[] = (resenas.pagina as R[])
    .filter((r) => Number(r.calificacion) >= 2)
    .map((r, i) => ({ id: i, nombre: r.nombre, texto: r.texto.trim(), estrellas: Number(r.calificacion), fotos: r.fotos }));
  return <PropuestasD resenas={lista} numero={calificacion()} />;
}
