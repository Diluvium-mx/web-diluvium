import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { producto } from "@/components/producto/catalogo";
import { Secciones } from "@/components/secciones/registro";
import { DatosEstructurados, datosProducto, datosSitioWeb, metadatos } from "@/lib/seo";

export const metadata: Metadata = metadatos("/");

export default function Portada() {
  const secciones = plantilla("portada").secciones;
  // Como en vivo: la portada describe el sitio (con su buscador) y el producto que muestra la sección de producto.
  const destacado = secciones
    .map((s) => s.ajustes.product)
    .find((v): v is string => typeof v === "string");
  const p = destacado ? producto(destacado) : undefined;
  return (
    <>
      <DatosEstructurados datos={datosSitioWeb()} />
      {p && <DatosEstructurados datos={datosProducto(p)} />}
      <Secciones secciones={secciones} />
    </>
  );
}
