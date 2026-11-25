import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { biblioteca, leerEsquema, leerPlantilla } from "@/lib/editor/archivos";
import { PAGINAS_MAPA, type ArchivoMapa, type PlantillaTema } from "@/lib/mapa";
import { Editor } from "./Editor";

/** El editor de una versión («B1», «C1» o «D1»): solo sus páginas. */
export async function editorDe(version: string) {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  const archivos = (Object.keys(PAGINAS_MAPA) as ArchivoMapa[]).filter((a) => PAGINAS_MAPA[a].version === version);
  const plantillas = Object.fromEntries(archivos.map((a) => [a, leerPlantilla(a)])) as Record<ArchivoMapa, PlantillaTema>;
  return <Editor version={version} plantillas={plantillas} esquema={leerEsquema()} biblioteca={biblioteca()} />;
}
