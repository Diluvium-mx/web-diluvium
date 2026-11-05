import type { Metadata } from "next";
import { METADATOS_SITIO, MarcoSitio } from "@/components/MarcoSitio";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { metadatos } from "@/lib/seo";
import "./(sitio)/globals.css";

// Direcciones que no existen en ninguna parte (ni tienda ni administrador): la misma página 404 de la tienda, con su
// marco completo. Next la usa porque hay dos diseños raíz (tienda y administrador).

export const metadata: Metadata = { ...METADATOS_SITIO, ...metadatos("404") };

export default function NoExisteGlobal() {
  return (
    <MarcoSitio>
      <Secciones secciones={plantilla("404").secciones} />
    </MarcoSitio>
  );
}
