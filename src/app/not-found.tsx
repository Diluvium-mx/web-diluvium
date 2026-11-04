import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";

// Página para direcciones que no existen (plantilla «404» del tema: franja, aviso con buscador y otra franja).

export const metadata: Metadata = { title: "404 No encontrado" };

export default function NoExiste() {
  return <Secciones secciones={plantilla("404").secciones} />;
}
