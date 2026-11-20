import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { biblioteca, leerEsquema, leerPlantilla } from "@/lib/editor/archivos";
import { PAGINAS_MAPA, type ArchivoMapa, type PlantillaTema } from "@/lib/mapa";
import { Editor } from "./Editor";

// Editor local de las versiones: fotos (orden, cambiar, subir, encuadre) y textos de cada parte, con los mismos
// nombres del mapa (B1-P3.4…). Solo en esta Mac: http://localhost:3100/editor con npm run dev. docs/editor.md.

export const dynamic = "force-dynamic";

export default async function PaginaEditor() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  const archivos = Object.keys(PAGINAS_MAPA) as ArchivoMapa[];
  const plantillas = Object.fromEntries(archivos.map((a) => [a, leerPlantilla(a)])) as Record<ArchivoMapa, PlantillaTema>;
  return <Editor plantillas={plantillas} esquema={leerEsquema()} biblioteca={biblioteca()} />;
}
