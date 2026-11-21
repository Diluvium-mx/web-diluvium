// Sección «landing-resenas»: muro de reseñas a la vista (sin carrusel ni flechas). Cada pieza elige una foto de una
// reseña publicada; el nombre (como se publicó), las estrellas y el texto salen de esa reseña en contenido/resenas.json,
// nunca se escriben aquí. Si la foto ya no corresponde a ninguna reseña publicada, la pieza no se muestra.
// Con «layout» = dos_columnas (Producto de B1, 21-nov-2026): dos columnas como en la tienda de hoy y la reseña en
// grande con su número y flechas (MuroResenas.tsx).

import Image from "next/image";
import resenas from "@contenido/resenas.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { textoVersion } from "./datos";
import { medidasImagen } from "../ImagenBanner";
import { MuroResenas } from "./MuroResenas";
import { TEXTOS_MURO } from "./textos";
import { tx } from "./datos";

type Resena = { nombre: string; calificacion: number; texto: string; fotos: string[] };
const PUBLICADAS = resenas.pagina as Resena[];

function EstrellasResena({ n }: { n: number }) {
  return (
    <span className="flex text-estrella" role="img" aria-label={`${n} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`size-4 ${i <= n ? "" : "opacity-25"}`} fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/** Las demás reseñas publicadas, sin las que ya eligió la sección. Para «Ver más»: primero todas las que traen foto
 *  y al final las de puro texto (dueño, 21-nov-2026), cada grupo en el orden de la tienda. */
function restantes(elegidas: string[]) {
  const todas = PUBLICADAS.flatMap((r, i) => {
    if (r.fotos.some((f) => elegidas.includes(f))) return [];
    const foto = r.fotos[0] ?? "";
    const { ancho, alto } = foto ? medidasImagen(foto) : { ancho: 0, alto: 0 };
    return [{ id: `resena-${i + 1}`, nombre: r.nombre, calificacion: r.calificacion, texto: r.texto.trim(), foto, ancho, alto }];
  });
  return [...todas.filter((r) => r.foto), ...todas.filter((r) => !r.foto)];
}

export function ResenasVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const tarjetas = seccion.bloques
    .filter((b) => b.tipo === "review")
    .map((b) => {
      const foto = texto(b.ajustes, "image");
      const r = PUBLICADAS.find((x) => x.fotos.includes(foto));
      return r ? { id: b.id, foto, ajustes: b.ajustes, ...r } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (!tarjetas.length) return null;

  return (
    <section data-seccion="landing-resenas" id="resenas" aria-labelledby="titulo-resenas" className="bg-white py-14 text-marino md:py-20">
      <div className="marco-version">
        <div className="mb-8 max-w-[44rem] md:mb-10">
          <h2 id="titulo-resenas" className="titulo-ancho m-0 text-[28px] md:text-[38px]">
            {textoVersion(a, "heading")}
          </h2>
          {texto(a, "subheading") && <p className="m-0 mt-3 text-[17px] text-texto-suave">{textoVersion(a, "subheading")}</p>}
        </div>
        {texto(a, "layout") === "dos_columnas" ? (
          <MuroResenas
            tarjetas={tarjetas.map((t) => {
              const { ancho, alto } = medidasImagen(t.foto);
              return { id: t.id, nombre: t.nombre, calificacion: t.calificacion, texto: t.texto, foto: t.foto, ancho, alto, estilo: estiloFoto(t.ajustes), marca: marcaEditar(seccion.id, t.id, "image") };
            })}
            mas={restantes(tarjetas.map((t) => t.foto))}
            textos={{
              verMas: tx(a, "more_button", TEXTOS_MURO.verMas),
              viendo: tx(a, "count_text", TEXTOS_MURO.viendo),
              leerMas: tx(a, "read_more_text", TEXTOS_MURO.leerMas),
              resena: tx(a, "viewer_title", TEXTOS_MURO.resena),
              anterior: tx(a, "prev_button", TEXTOS_MURO.anterior),
              siguiente: tx(a, "next_button", TEXTOS_MURO.siguiente),
              verSeisMas: tx(a, "more_six_button", TEXTOS_MURO.verSeisMas),
            }}
          />
        ) : (
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {tarjetas.map((t) => (
            <li key={t.id} data-pieza={t.id} className="grid min-h-[176px] grid-cols-[116px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-linea bg-white md:grid-cols-[140px_minmax(0,1fr)]">
              <div className="relative overflow-hidden bg-niebla">
                <Image src={t.foto} alt={`Compuerta de ${t.nombre} puesta en su entrada`} fill sizes="140px" className="object-cover" style={estiloFoto(t.ajustes)} {...marcaEditar(seccion.id, t.id, "image")} />
              </div>
              <figure className="m-0 flex flex-col gap-2 p-4 md:p-5">
                <EstrellasResena n={t.calificacion} />
                <blockquote className="m-0 text-[15.5px] leading-[1.5] text-tinta">«{t.texto.trim()}»</blockquote>
                <figcaption className="mt-auto pt-1 text-[15px] font-bold">{t.nombre}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        )}
      </div>
    </section>
  );
}
