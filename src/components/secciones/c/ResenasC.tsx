// Sección «c-resenas»: «Una a la vez». Las reseñas con foto como una pila de tarjetas: arriba la de ahora, grande, y
// detrás asoman las siguientes; se pasan deslizando o con las flechas (en A son un carrusel y en B un muro). Solo
// reseñas publicadas con foto y 4 o 5 estrellas; con «product_filter», solo las de ese producto.

import resenas from "@contenido/resenas.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { medidasImagen } from "../ImagenBanner";
import { calificacion, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoC, Etiqueta } from "./comun";
import { PilaResenas } from "./PilaResenas";

type Resena = { nombre: string; calificacion: number | string; texto: string; fotos: string[]; producto?: { url?: string } | null };

export function ResenasC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "claro";
  const filtro = texto(a, "product_filter");
  const lista = (resenas.pagina as Resena[])
    .filter((r) => r.fotos.length && Number(r.calificacion) >= 4 && (!filtro || r.producto?.url === filtro))
    .slice(0, 60)
    .map((r, i) => ({ id: `c-resena-${i}`, nombre: r.nombre, texto: r.texto.trim(), estrellas: Number(r.calificacion), foto: r.fotos[0], ...medidasImagen(r.fotos[0]) }));
  if (!lista.length) return null;
  const oscuro = fondo === "noche";
  return (
    <section data-seccion="c-resenas" id="resenas" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} overflow-hidden py-14 md:py-20`}>
      <div className="marco-version grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-16">
        <div>
          <Etiqueta oscuro={oscuro}>{formato(textoVersion(a, "subheading"))}</Etiqueta>
          <h2 id={`titulo-${seccion.id}`} className={`titulo-version m-0 mt-2 text-[32px] md:text-[44px] ${oscuro ? "text-white" : "text-[#06182f]"}`}>
            {formato(textoVersion(a, "heading"))}
          </h2>
          <p className={`m-0 mt-4 flex items-baseline gap-3 ${oscuro ? "text-white" : "text-[#06182f]"}`}>
            <span className="font-titulo text-[56px] leading-none font-semibold">{calificacion()}</span>
            <span className={`text-[16px] ${oscuro ? "text-white/70" : "text-texto-suave"}`}>{tx(a, "rating_text", "de 5, con más de 200 reseñas publicadas")}</span>
          </p>
        </div>
        <PilaResenas resenas={lista} oscuro={oscuro} textos={{ anterior: tx(a, "prev_button", "Anterior"), siguiente: tx(a, "next_button", "Siguiente"), de: tx(a, "count_text", "{n} de {total}") }} />
      </div>
    </section>
  );
}
