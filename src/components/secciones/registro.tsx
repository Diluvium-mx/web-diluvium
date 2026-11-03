// Qué pieza dibuja cada tipo de sección del tema. Cada tipo se construye una vez y se reutiliza en todas las páginas.

import type { ComponentType } from "react";
import type { Seccion } from "@/lib/contenido";
import type { Producto } from "@/components/producto/catalogo";
import { Espaciador } from "./Espaciador";
import { FranjaMensajes } from "./FranjaMensajes";
import { ImagenBanner } from "./ImagenBanner";
import { Logos } from "./Logos";
import { CollageImagenTexto } from "./CollageImagenTexto";
import { VideoConTexto } from "./VideoConTexto";
import { CollageContenido } from "./CollageContenido";
import { ProductoDestacado } from "./ProductoDestacado";
import { PestanasProductos } from "./PestanasProductos";
import { IconosConTexto } from "./IconosConTexto";
import { AntesDespues } from "./AntesDespues";
import { ResenasClientes } from "./ResenasClientes";
import { PestanasInfo } from "./PestanasInfo";
import { MediosColumnas } from "./MediosColumnas";
import { LogosDesplazables } from "./LogosDesplazables";
import { FormularioWhatsapp } from "./FormularioWhatsapp";
import { ListaBlog } from "./ListaBlog";
import { Apps } from "./Apps";
import { ProductoPrincipal } from "./ProductoPrincipal";
import { CodigoPropio } from "./CodigoPropio";
import { PreguntasFrecuentes } from "./PreguntasFrecuentes";
import { MigasDePan } from "./MigasDePan";

// `producto` llega en las páginas de producto (el de esa página); en las demás páginas no viene.
export type PropsSeccion = { seccion: Seccion; producto?: Producto };
type PiezaSeccion = ComponentType<PropsSeccion>;

const PIEZAS: Record<string, PiezaSeccion> = {
  "running-content": FranjaMensajes,
  spacer: Espaciador,
  "image-banner": ImagenBanner,
  "logos": Logos,
  "image-collage-with-text": CollageImagenTexto,
  "video-with-text": VideoConTexto,
  "content-collage": CollageContenido,
  "featured-product": ProductoDestacado,
  "multiple-product-tabs": PestanasProductos,
  "icon-with-text": IconosConTexto,
  "before-after-images": AntesDespues,
  "customer-reviews": ResenasClientes,
  "info-tab": PestanasInfo,
  "media-with-text-columns": MediosColumnas,
  "scrolling-logos": LogosDesplazables,
  "whatsapp-form": FormularioWhatsapp,
  "blog-post-list": ListaBlog,
  "apps": Apps,
  "main-product": ProductoPrincipal,
  "custom-liquid": CodigoPropio,
  faqs: PreguntasFrecuentes,
  breadcrumb: MigasDePan,
};

function Pendiente({ seccion }: { seccion: Seccion }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="contenedor py-8" data-seccion={seccion.tipo}>
      <div className="border-2 border-dashed border-naranja p-6 text-center font-titulo text-naranja">
        Sección sin pieza: {seccion.tipo}
      </div>
    </div>
  );
}

export function Secciones({ secciones, producto }: { secciones: Seccion[]; producto?: Producto }) {
  return secciones.map((s) => {
    const Pieza = PIEZAS[s.tipo] ?? Pendiente;
    return <Pieza key={s.id} seccion={s} producto={producto} />;
  });
}
