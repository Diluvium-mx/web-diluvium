// Olas entre las partes de las versiones B (21-nov-2026, dueño): el mismo patrón de la tienda de hoy, que separa sus
// partes con olas (hacen alusión a la compuerta). En la tienda vienen dibujadas dentro de 3 imágenes:
//   - tabla_comparativa_mobile_home_buena.jpg: blanco arriba, gris abajo y una línea azul marino ondulada (ola corta);
//   - Frame_769: gris arriba, blanco abajo y una línea azul gruesa con una sola ola larga;
//   - Frame_726: blanco arriba y azul abajo, con un filo gris claro (antes del pie).
// Aquí se rehacen como dibujo (SVG, sin bajar imágenes) y se ponen solas entre dos partes según su color de fondo:
// mismo color → solo la línea ondulada; blanco → gris: ola corta; gris → blanco: ola larga; → azul: ola del pie.
// Al lado de una ola las partes pierden aire arriba/abajo (versiones.css, [data-ola]), para que no quede un hueco.

import { Fragment } from "react";
import type { Seccion } from "@/lib/contenido";
import { texto } from "@/lib/contenido";
import { Secciones } from "../registro";
import type { Producto } from "@/components/producto/catalogo";

type Fondo = "blanco" | "niebla" | "marino";
type FormaOla = "linea" | "corta" | "larga" | "pie";

const COLOR: Record<Fondo, string> = { blanco: "#ffffff", niebla: "var(--color-niebla)", marino: "var(--color-marino)" };
const LINEA = "var(--color-marino-hondo)";

/** Color de fondo de cada parte de las versiones B (lo que no está aquí no lleva ola). */
function fondoDe(s: Seccion): Fondo | null {
  switch (s.tipo) {
    case "landing-portada":
      return texto(s.ajustes, "color_scheme") === "marino" ? "marino" : "blanco";
    case "landing-ficha":
    case "landing-resenas":
    case "landing-beneficios":
    case "landing-preguntas":
      return "blanco";
    case "landing-comparacion":
    case "landing-pasos":
      return "niebla";
    case "landing-cierre":
      return "marino";
    default:
      return null;
  }
}

function formaEntre(arriba: Fondo, abajo: Fondo): FormaOla | null {
  if (arriba === "marino") return null;
  if (abajo === "marino") return "pie";
  if (arriba === abajo) return "linea";
  return arriba === "blanco" ? "corta" : "larga";
}

// Trazos en una caja de 1440 de ancho (se estira al ancho de la pantalla; la línea conserva su grosor).
const TRAZO: Record<FormaOla, { alto: number; d: string; grosor: number }> = {
  // Dos olas y media, como la de la tabla comparativa.
  corta: { alto: 64, d: "M0,32 C96,14 192,14 288,32 S480,50 576,32 S768,14 864,32 S1056,50 1152,32 S1344,14 1440,32", grosor: 4 },
  // Una sola ola larga: abajo a la izquierda y arriba a la derecha (Frame_769).
  larga: { alto: 72, d: "M0,46 C240,56 480,58 720,48 S1200,22 1440,24", grosor: 5 },
  // Ola del pie (Frame_726).
  pie: { alto: 72, d: "M0,30 C360,14 720,22 1000,40 S1320,44 1440,32", grosor: 5 },
  // Misma tela arriba y abajo: solo una línea ondulada suave.
  linea: { alto: 40, d: "M0,20 C120,10 240,10 360,20 S600,30 720,20 S960,10 1080,20 S1320,30 1440,20", grosor: 3 },
};

export function Ola({ arriba, abajo, forma }: { arriba: Fondo; abajo: Fondo; forma: FormaOla }) {
  const t = TRAZO[forma];
  const relleno = `${t.d} L1440,${t.alto} L0,${t.alto} Z`;
  return (
    <div data-ola={forma} aria-hidden="true" style={{ background: COLOR[arriba] }}>
      <svg
        viewBox={`0 0 1440 ${t.alto}`}
        preserveAspectRatio="none"
        className={`block w-full ${forma === "linea" ? "h-6 md:h-8" : "h-9 md:h-14"}`}
        focusable="false"
      >
        <path d={relleno} fill={COLOR[abajo]} />
        {forma === "pie" ? (
          // Filo gris claro sobre la ola azul, como en la tienda.
          <path d={t.d} fill="none" stroke="#e5e5e5" strokeWidth={t.grosor} vectorEffect="non-scaling-stroke" transform="translate(0,-2)" />
        ) : (
          <path d={t.d} fill="none" stroke={LINEA} strokeWidth={t.grosor} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
    </div>
  );
}

/** Las partes de una versión B con su ola entre cada dos (según sus colores de fondo). */
export function SeccionesConOlas({ secciones, producto }: { secciones: Seccion[]; producto?: Producto }) {
  return secciones.map((s, i) => {
    const antes = i > 0 ? fondoDe(secciones[i - 1]) : null;
    const ahora = fondoDe(s);
    const forma = antes && ahora ? formaEntre(antes, ahora) : null;
    return (
      <Fragment key={s.id}>
        {forma && antes && ahora && <Ola arriba={antes} abajo={ahora} forma={forma} />}
        <Secciones secciones={[s]} producto={producto} />
      </Fragment>
    );
  });
}
