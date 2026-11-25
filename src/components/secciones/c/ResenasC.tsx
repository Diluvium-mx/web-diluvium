// Sección «c-resenas»: lo que dicen los clientes, en lista (ListaResenasC): la calificación grande arriba y tres
// reseñas con foto a la vez, con «Ver 3 reseñas más». Solo reseñas publicadas con foto y 4 o 5 estrellas; con
// «product_filter», solo las de ese producto.

import resenas from "@contenido/resenas.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { calificacion, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoC, EstrellaC, Etiqueta, TITULO_C } from "./comun";
import { ListaResenasC } from "./ListaResenasC";

type Resena = { nombre: string; calificacion: number | string; texto: string; fotos: string[]; producto?: { url?: string } | null };

export function ResenasC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "claro";
  const filtro = texto(a, "product_filter");
  const lista = (resenas.pagina as Resena[])
    .filter((r) => r.fotos.length && Number(r.calificacion) >= 4 && (!filtro || r.producto?.url === filtro))
    .slice(0, 30)
    .map((r, i) => ({ id: `c-resena-${i}`, nombre: r.nombre, texto: r.texto.trim(), estrellas: Number(r.calificacion), foto: r.fotos[0] }));
  if (!lista.length) return null;
  return (
    <section data-seccion="c-resenas" id="resenas" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-12 md:py-20`}>
      <div className="marco-version">
        <Etiqueta>{formato(textoVersion(a, "subheading"))}</Etiqueta>
        <h2 id={`titulo-${seccion.id}`} className={`${TITULO_C} text-[#06182f]`}>
          {formato(textoVersion(a, "heading"))}
        </h2>
        <p className="m-0 mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#06182f]">
          <span className="font-titulo text-[48px] leading-none font-semibold">{calificacion()}</span>
          <span className="flex text-estrella">
            {[0, 1, 2, 3, 4].map((i) => (
              <EstrellaC key={i} className="size-7" />
            ))}
          </span>
          <span className="w-full text-[18px] text-[#45566a]">{tx(a, "rating_text", "de 5, con más de 200 reseñas publicadas")}</span>
        </p>
        <div className="mt-8">
          <ListaResenasC resenas={lista} textos={{ verMas: tx(a, "more_button", "Ver 3 reseñas más"), leer: tx(a, "read_more_text", "Leer completa") }} />
        </div>
      </div>
    </section>
  );
}
