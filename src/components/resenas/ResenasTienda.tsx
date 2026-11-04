// Todas las reseñas de la tienda (página /pages/reviews; en vivo las pone la app Trustoo dentro del texto de la
// página). Se arman con las reseñas publicadas (contenido/resenas.json): cada tarjeta lleva al pie el producto
// reseñado con su foto. El texto de las reseñas es de los clientes: va siempre como texto plano.

import resenas from "@contenido/resenas.json";
import { producto } from "@/components/producto/catalogo";
import { medidasImagen } from "@/components/secciones/ImagenBanner";
import type { ResenaTarjeta } from "./ListaResenas";
import { ListaResenasTienda } from "./ListaResenasTienda";

type ResenaPagina = {
  nombre: string;
  calificacion: number;
  texto: string;
  fotos: string[];
  variasFotos?: boolean;
  producto?: { titulo: string; url: string };
};

export function ResenasTienda() {
  const lista: ResenaTarjeta[] = (resenas.pagina as ResenaPagina[]).map((r, i) => {
    const src = r.fotos[0];
    const medidas = src ? medidasImagen(src) : null;
    const reseñado = r.producto ? producto(r.producto.url) : undefined;
    return {
      id: i,
      nombre: r.nombre,
      calificacion: Math.max(1, Math.min(5, Math.round(r.calificacion))),
      texto: r.texto,
      foto: src && medidas ? { src, ancho: medidas.ancho, alto: medidas.alto } : null,
      variasFotos: Boolean(r.variasFotos),
      producto:
        r.producto && reseñado
          ? { titulo: r.producto.titulo, url: r.producto.url, foto: reseñado.imagenes[0]?.src ?? "" }
          : undefined,
    };
  });
  const conteo = [5, 4, 3, 2, 1].map((n) => ({ estrellas: n, total: lista.filter((r) => r.calificacion === n).length }));
  const promedio = lista.length ? lista.reduce((s, r) => s + r.calificacion, 0) / lista.length : 0;
  return <ListaResenasTienda resenas={lista} promedio={promedio} conteo={conteo} />;
}
