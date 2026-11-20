import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { biblioteca, leerEsquema, leerPlantilla } from "@/lib/editor/archivos";
import { PAGINAS_MAPA, type ArchivoMapa, type PlantillaTema } from "@/lib/mapa";
import { Opciones } from "./Opciones";

// Prototipos para elegir cómo se editan las fotos (21-nov-2026): A como el editor de la tienda en Shopify, B directo
// sobre la página y C tablero de fotos. No guardan nada. Solo en esta Mac: http://localhost:3100/editor/opciones

export const dynamic = "force-dynamic";

export default async function PaginaOpciones() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  const archivos = Object.keys(PAGINAS_MAPA) as ArchivoMapa[];
  const plantillas = Object.fromEntries(archivos.map((a) => [a, leerPlantilla(a)])) as Record<ArchivoMapa, PlantillaTema>;
  return <Opciones plantillas={plantillas} esquema={leerEsquema()} biblioteca={biblioteca().filter((m) => !m.video).slice(0, 180)} />;
}
