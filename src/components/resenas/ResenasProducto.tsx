// Reseñas del producto (en vivo las pone la app Trustoo justo después del producto principal, fuera de las secciones
// del tema). Se rehacen con las reseñas publicadas de ese producto (contenido/resenas.json, sacado por
// herramientas/extraer-resenas-blog.py): resumen con promedio y barras por estrellas, botones de escribir y ordenar,
// y la cuadrícula de tarjetas con «Ver más reseñas». Sin reseñas queda el aviso «aún no hay comentarios».
// El texto de las reseñas es de los clientes: va siempre como texto plano.

import resenas from "@contenido/resenas.json";
import type { Producto } from "@/components/producto/catalogo";
import { enlaceProducto } from "@/components/producto/catalogo";
import { medidasImagen } from "@/components/secciones/ImagenBanner";
import { ListaResenas, type ResenaTarjeta } from "./ListaResenas";
import { BotonEscribir, EstrellasResena } from "./piezas";

type ResenaPagina = {
  nombre: string;
  calificacion: number;
  texto: string;
  fotos: string[];
  variasFotos?: boolean;
  producto?: { url: string };
};

function resenasDe(producto: Producto): ResenaTarjeta[] {
  const enlace = enlaceProducto(producto);
  return (resenas.pagina as ResenaPagina[])
    .filter((r) => r.producto?.url === enlace)
    .map((r, i) => {
      const src = r.fotos[0];
      const medidas = src ? medidasImagen(src) : null;
      return {
        id: i,
        nombre: r.nombre,
        calificacion: Math.max(1, Math.min(5, Math.round(r.calificacion))),
        texto: r.texto,
        foto: src && medidas ? { src, ancho: medidas.ancho, alto: medidas.alto } : null,
        variasFotos: Boolean(r.variasFotos),
      };
    });
}

function SinResenas() {
  return (
    <div className="bg-white px-3 pt-10 pb-5 text-black md:px-[30px] md:pb-10 min-[1025px]:py-[90px]">
      <div className="md:px-5 min-[1025px]:mx-[90px] min-[1025px]:px-0">
        <div className="flex h-[110px] flex-col items-center justify-between min-[1025px]:h-10 min-[1025px]:flex-row min-[1025px]:items-stretch">
          <div className="text-[28px] leading-[normal]">Reseñas</div>
          <div className="my-5 flex w-full flex-col justify-center md:items-start min-[1025px]:my-0 min-[1025px]:w-auto">
            <BotonEscribir className="h-9 w-full px-[15px] text-base font-normal md:w-[300px] min-[1025px]:h-10 min-[1025px]:w-auto" />
          </div>
        </div>
        <div className="mt-8 text-center">
          <EstrellasResena valor={0} tamano={20} separacion={3} vacia="#dedede" className="justify-center" />
          <p className="m-0 mt-1 text-xl leading-6">aún no hay comentarios</p>
        </div>
      </div>
    </div>
  );
}

export function ResenasProducto({ producto }: { producto: Producto }) {
  const lista = resenasDe(producto);
  if (lista.length === 0) return <SinResenas />;
  const conteo = [5, 4, 3, 2, 1].map((n) => ({ estrellas: n, total: lista.filter((r) => r.calificacion === n).length }));
  const promedio = lista.reduce((s, r) => s + r.calificacion, 0) / lista.length;
  return <ListaResenas resenas={lista} promedio={promedio} conteo={conteo} />;
}
