// Sección «d-resenas»: todas las reseñas publicadas (de 2 estrellas para arriba, como en B), en un mazo de páginas
// que se desliza y da la vuelta (ResenasDCliente). Con «product_filter» (p. ej. la XXL), solo las de ese producto, y el número de arriba es
// el de esas reseñas; sin filtro, el de la tienda.

import resenas from "@contenido/resenas.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { calificacion, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoD, EtiquetaD, TituloD } from "./comun";
import { ResenasDCliente, type ResenaD } from "./ResenasDCliente";

type Resena = { nombre: string; calificacion: number | string; texto: string; fotos: string[]; producto?: { url?: string } | null };

const MINIMO_ESTRELLAS = 2;

export function ResenasD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const filtro = texto(a, "product_filter");
  const lista: ResenaD[] = (resenas.pagina as Resena[])
    .filter((r) => Number(r.calificacion) >= MINIMO_ESTRELLAS && (!filtro || r.producto?.url === filtro))
    .map((r, i) => ({ id: `d-resena-${i}`, nombre: r.nombre, texto: r.texto.trim(), estrellas: Number(r.calificacion), fotos: r.fotos }));
  if (!lista.length) return null;
  const numero = filtro ? (Math.round((lista.reduce((s, r) => s + r.estrellas, 0) / lista.length) * 10) / 10).toFixed(1) : calificacion();
  return (
    <section data-seccion="d-resenas" id="resenas" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoD(texto(a, "fondo") || "blanco")} py-12 md:py-20`}>
      <div className="marco-version max-w-[1040px]">
        <EtiquetaD>{formato(textoVersion(a, "subheading"))}</EtiquetaD>
        <TituloD id={`titulo-${seccion.id}`}>{formato(textoVersion(a, "heading"))}</TituloD>
        {texto(a, "text") && <p className="m-0 mt-4 text-[18px] leading-[1.6]">{formato(textoVersion(a, "text"))}</p>}
        <div className="mt-7">
          <ResenasDCliente
            resenas={lista}
            numero={numero}
            textos={{
              total: tx(a, "total_text", "{n} reseñas publicadas"),
              anterior: tx(a, "prev_button", "Página anterior"),
              siguiente: tx(a, "next_button", "Página siguiente"),
              pagina: tx(a, "page_text", "Página {n} de {total}"),
              cerrar: tx(a, "close_text", "Cerrar"),
            }}
          />
        </div>
      </div>
    </section>
  );
}
