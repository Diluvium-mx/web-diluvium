// Qué pieza dibuja cada tipo de sección del tema. Cada tipo se construye una vez y se reutiliza en todas las páginas.

import type { ComponentType } from "react";
import { PIEZAS_CD } from "./cd/registro";
import { PIEZAS_D } from "./d/registro";
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
import { ContenidoPagina } from "./ContenidoPagina";
import { Texto } from "./Texto";
import { ListaArticulos } from "./ListaArticulos";
import { Articulo } from "./Articulo";
import { ProductosColeccion } from "./ProductosColeccion";
import { ListaColecciones } from "./ListaColecciones";
import { Carrito } from "./Carrito";
import { Busqueda } from "./Busqueda";
import { NoEncontrada } from "./NoEncontrada";
// Secciones propias de las versiones de la portada para pruebas (/v/<versión>).
import { EncabezadoVersion } from "./landing/Encabezado";
import { EncabezadoC } from "./c/EncabezadoC";
import { PortadaC } from "./c/PortadaC";
import { HistoriasC } from "./c/HistoriasC";
import { CifrasC } from "./c/CifrasC";
import { TamanosC } from "./c/TamanosC";
import { ResenasC } from "./c/ResenasC";
import { PreguntasC } from "./c/PreguntasC";
import { CierreC } from "./c/CierreC";
import { PieC } from "./c/PieC";
import { FichaC } from "./c/FichaC";
import { AyudaC } from "./c/AyudaC";
import { ConfianzaC } from "./c/ConfianzaC";
import { PagosC } from "./c/PagosC";
import { BarraAyudaC } from "./c/BarraAyudaC";
import { PortadaVersion } from "./landing/Portada";
import { ResenasVersion } from "./landing/Resenas";
import { ComparacionVersion } from "./landing/Comparacion";
import { BeneficiosVersion } from "./landing/Beneficios";
import { PasosVersion } from "./landing/Pasos";
import { PreguntasVersion } from "./landing/Preguntas";
import { CierreVersion } from "./landing/Cierre";
import { PieVersion } from "./landing/Pie";
import { FichaVersion } from "./landing/Ficha";
import { TituloVersion } from "./landing/TituloPagina";
import { ProductosVersion } from "./landing/Productos";
import { ContactoVersion } from "./landing/Contacto";
import { HistoriaVersion } from "./landing/Historia";
import { PremiosVersion } from "./landing/Premios";
import { CitaVersion } from "./landing/Cita";
import { BlogVersion } from "./landing/Blog";
import { ArticuloVersion } from "./landing/ArticuloVersion";

// `producto` llega en las páginas de producto (el de esa página); en las demás páginas no viene.
/** «slugArticulo»: el artículo del blog de la página (/v/<versión>/blogs/blog/<artículo>), para «landing-articulo». */
export type PropsSeccion = { seccion: Seccion; producto?: Producto; slugArticulo?: string };
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
  "main-page": ContenidoPagina,
  "text": Texto,
  "main-blog": ListaArticulos,
  "main-article": Articulo,
  "main-collection-products": ProductosColeccion,
  "main-list-collections": ListaColecciones,
  "main-cart": Carrito,
  "main-search": Busqueda,
  "main-404": NoEncontrada,
  "landing-encabezado": EncabezadoVersion,
  "landing-portada": PortadaVersion,
  "landing-resenas": ResenasVersion,
  "landing-comparacion": ComparacionVersion,
  "landing-beneficios": BeneficiosVersion,
  "landing-pasos": PasosVersion,
  "landing-preguntas": PreguntasVersion,
  "landing-cierre": CierreVersion,
  "landing-pie": PieVersion,
  "landing-ficha": FichaVersion,
  // Páginas nuevas de B1 (23-nov-2026): Contacto, Nosotros, Blog, artículo y Productos.
  "landing-titulo": TituloVersion,
  "landing-productos": ProductosVersion,
  "landing-contacto": ContactoVersion,
  "landing-historia": HistoriaVersion,
  "landing-premios": PremiosVersion,
  "landing-cita": CitaVersion,
  "landing-blog": BlogVersion,
  "landing-articulo": ArticuloVersion,
  // Versión C (24-nov-2026): partes completamente nuevas (src/components/secciones/c).
  "c-encabezado": EncabezadoC,
  "c-portada": PortadaC,
  "c-historias": HistoriasC,
  "c-cifras": CifrasC,
  "c-tamanos": TamanosC,
  "c-resenas": ResenasC,
  "c-preguntas": PreguntasC,
  "c-cierre": CierreC,
  "c-pie": PieC,
  "c-ficha": FichaC,
  "c-ayuda": AyudaC,
  "c-confianza": ConfianzaC,
  "c-pagos": PagosC,
  "c-barra": BarraAyudaC,
  ...PIEZAS_CD,
  ...PIEZAS_D,
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

export function Secciones({ secciones, producto, slugArticulo }: { secciones: Seccion[]; producto?: Producto; slugArticulo?: string }) {
  return secciones.map((s) => {
    const Pieza = PIEZAS[s.tipo] ?? Pendiente;
    return <Pieza key={s.id} seccion={s} producto={producto} slugArticulo={slugArticulo} />;
  });
}
