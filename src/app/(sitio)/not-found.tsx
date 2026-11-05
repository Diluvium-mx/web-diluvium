import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { metadatos } from "@/lib/seo";

// Página para direcciones que no existen (plantilla «404» del tema: franja, aviso con buscador y otra franja).

export const metadata: Metadata = metadatos("404");

export default function NoExiste() {
  return <Secciones secciones={plantilla("404").secciones} />;
}
