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

export type Fondo = "blanco" | "niebla" | "cielo" | "marino";
/** «linea», «corta», «larga» y «pie»: las de la tienda de hoy. Las demás (23-nov-2026, dueño: «se necesita variar»):
 *  propuestas para que cada cambio de parte se vea distinto al bajar (editor/propuestas). */
export type FormaOla = "linea" | "corta" | "larga" | "pie" | "capas" | "rizos" | "curva" | "inclinada" | "espuma" | "lluvia";

export const COLOR: Record<Fondo, string> = { blanco: "#ffffff", niebla: "var(--color-niebla)", cielo: "#e6f0fb", marino: "var(--color-marino)" };
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
// «grosor» 0 = sin línea; «capa» = una ola de fondo, azul muy claro, detrás de la principal; «espuma» = una segunda
// línea fina encima; «gotas» = tres gotas que caen sobre la ola (van aparte para que no se estiren); «filo» = el filo
// gris de la ola del pie.
type Dibujo = { alto: number; d: string; grosor: number; alturas: string; capa?: string; espuma?: boolean; gotas?: boolean; filo?: boolean };

const DIBUJO: Record<FormaOla, Dibujo> = {
  // Dos olas y media, como la de la tabla comparativa.
  corta: { alto: 64, d: "M0,32 C96,14 192,14 288,32 S480,50 576,32 S768,14 864,32 S1056,50 1152,32 S1344,14 1440,32", grosor: 4, alturas: "h-9 md:h-14" },
  // Una sola ola larga: abajo a la izquierda y arriba a la derecha (Frame_769).
  larga: { alto: 72, d: "M0,46 C240,56 480,58 720,48 S1200,22 1440,24", grosor: 5, alturas: "h-9 md:h-14" },
  // Ola del pie (Frame_726).
  pie: { alto: 72, d: "M0,30 C360,14 720,22 1000,40 S1320,44 1440,32", grosor: 5, alturas: "h-9 md:h-14", filo: true },
  // Misma tela arriba y abajo: solo una línea ondulada suave.
  linea: { alto: 40, d: "M0,20 C120,10 240,10 360,20 S600,30 720,20 S960,10 1080,20 S1320,30 1440,20", grosor: 3, alturas: "h-6 md:h-8" },
  // Marea en capas: dos olas encimadas, la de atrás en azul muy claro; sin línea.
  capas: {
    alto: 84,
    capa: "M0,30 C200,6 430,6 650,26 S1090,58 1440,22",
    d: "M0,58 C260,34 540,78 820,54 S1250,32 1440,50",
    grosor: 0,
    alturas: "h-11 md:h-16",
  },
  // Olas pequeñas: doce rizos iguales, como el agua que empieza a subir.
  rizos: { alto: 44, d: `M0,30${" q60,-26 120,0".repeat(12)}`, grosor: 3, alturas: "h-6 md:h-9" },
  // Colina: una sola curva amplia que sube al centro; sin línea.
  curva: { alto: 80, d: "M0,72 C380,2 1060,2 1440,72", grosor: 0, alturas: "h-9 md:h-16" },
  // Pendiente: baja suave de izquierda a derecha, como el agua que escurre.
  inclinada: { alto: 72, d: "M0,8 C500,8 1020,36 1440,62", grosor: 4, alturas: "h-9 md:h-14" },
  // Ola con espuma: tres olas con una segunda línea fina encima.
  espuma: { alto: 72, d: "M0,44 C160,22 320,22 480,44 S800,66 960,44 S1280,22 1440,44", grosor: 4, alturas: "h-10 md:h-14", espuma: true },
  // Gotas: una ola larga con tres gotas que caen sobre ella.
  lluvia: { alto: 76, d: "M0,58 C240,66 480,68 720,58 S1200,38 1440,42", grosor: 4, alturas: "h-11 md:h-16", gotas: true },
};

/** Gota de 12×16 (no se estira con la ola). */
function Gota({ izquierda, arriba }: { izquierda: string; arriba: number }) {
  return (
    <svg viewBox="0 0 12 16" className="absolute h-4 w-3 md:h-5 md:w-[15px]" style={{ left: izquierda, top: arriba }} focusable="false">
      <path d="M6 0C4 4 0 7.5 0 10.5a6 6 0 0 0 12 0C12 7.5 8 4 6 0z" fill={LINEA} opacity="0.85" />
    </svg>
  );
}

export function Ola({ arriba, abajo, forma }: { arriba: Fondo; abajo: Fondo; forma: FormaOla }) {
  const t = DIBUJO[forma];
  const cerrar = (d: string) => `${d} L1440,${t.alto} L0,${t.alto} Z`;
  return (
    <div data-ola={forma} aria-hidden="true" className="relative" style={{ background: COLOR[arriba] }}>
      <svg viewBox={`0 0 1440 ${t.alto}`} preserveAspectRatio="none" className={`block w-full ${t.alturas}`} focusable="false">
        {t.capa && <path d={cerrar(t.capa)} fill="var(--color-marino)" opacity="0.16" />}
        <path d={cerrar(t.d)} fill={COLOR[abajo]} />
        {t.filo ? (
          // Filo gris claro sobre la ola azul, como en la tienda.
          <path d={t.d} fill="none" stroke="#e5e5e5" strokeWidth={t.grosor} vectorEffect="non-scaling-stroke" transform="translate(0,-2)" />
        ) : t.grosor > 0 ? (
          <path d={t.d} fill="none" stroke={LINEA} strokeWidth={t.grosor} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        ) : null}
        {t.espuma && <path d={t.d} fill="none" stroke={LINEA} strokeWidth={1.5} opacity="0.5" vectorEffect="non-scaling-stroke" transform="translate(0,-11)" />}
      </svg>
      {t.gotas && (
        <>
          <Gota izquierda="16%" arriba={2} />
          <Gota izquierda="48%" arriba={6} />
          <Gota izquierda="80%" arriba={0} />
        </>
      )}
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
