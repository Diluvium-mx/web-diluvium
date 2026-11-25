// Sección «c-resenas» (25-nov-2026, propuesta R2 «Reseñas por tema»; tres a la vez no servía: hay más de 230). La
// calificación grande arriba con cuántas reseñas hay, botones con lo que más dicen los clientes y cuántos lo dicen
// («Fácil de poner (48)»), y la lista: al tocar un tema salen esas reseñas, de 10 en 10, con su foto si la mandaron.
// Los temas son piezas «topic»: su nombre y las palabras que lo cuentan (separadas por comas; sin acentos ni
// mayúsculas), así se cambian en el editor. Todas las reseñas publicadas de 2 estrellas o más; con «product_filter»,
// solo las de ese producto (la XXL, las hechas a la medida).

import resenas from "@contenido/resenas.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { calificacion, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoC, EstrellaC, Etiqueta, TITULO_C } from "./comun";
import { ListaResenasC } from "./ListaResenasC";

type Resena = { nombre: string; calificacion: number | string; texto: string; fotos: string[]; producto?: { url?: string } | null };

const MINIMO_ESTRELLAS = 2;
const sinAcentos = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ResenasC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "claro";
  const filtro = texto(a, "product_filter");
  const temas = seccion.bloques
    .filter((b) => b.tipo === "topic" && texto(b.ajustes, "text"))
    .map((b) => ({ id: b.id, nombre: textoVersion(b.ajustes, "text"), palabras: sinAcentos(texto(b.ajustes, "words")).split(",").map((p) => p.trim()).filter(Boolean) }));
  const lista = (resenas.pagina as Resena[])
    .filter((r) => Number(r.calificacion) >= MINIMO_ESTRELLAS && (!filtro || r.producto?.url === filtro))
    .map((r, i) => {
      const t = sinAcentos(r.texto);
      return {
        id: `c-resena-${i}`,
        nombre: r.nombre,
        texto: r.texto.trim(),
        estrellas: Number(r.calificacion),
        foto: r.fotos[0] ?? "",
        temas: temas.filter((x) => x.palabras.some((p) => t.includes(p))).map((x) => x.id),
      };
    });
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
          <span className="flex text-estrella" role="img" aria-label={`${calificacion()} de 5 estrellas`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <EstrellaC key={i} className="size-7" />
            ))}
          </span>
          <span className="w-full text-[18px] text-[#45566a]">{tx(a, "rating_text", "{total} reseñas publicadas").replace("{total}", String(lista.length))}</span>
        </p>
        <div className="mt-6">
          <ListaResenasC
            resenas={lista}
            temas={temas.map(({ id, nombre }) => ({ id, nombre }))}
            textos={{
              temas: tx(a, "topics_text", "Lo que más dicen:"),
              todas: tx(a, "all_text", "Todas"),
              verMas: tx(a, "more_button", "Ver 10 reseñas más"),
              faltan: tx(a, "left_text", "faltan {n}"),
              leer: tx(a, "read_more_text", "Leer completa"),
            }}
          />
        </div>
      </div>
    </section>
  );
}
