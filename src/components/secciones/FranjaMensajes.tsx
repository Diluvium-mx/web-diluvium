// Franja de texto que corre (sección «running-content»: encabezado y varias páginas). Velocidad en píxeles por
// segundo, como el ajuste «speed» del tema; se pausa al pasar el mouse si «pause_when_hover» está prendido.
// El tamaño de letra sale de «heading_size» (h2 a h6) y el aire de arriba y abajo mide un renglón. Como las demás
// secciones, pierde el aire de arriba si la sección anterior tiene el mismo color de fondo.

import type { Seccion } from "@/lib/contenido";
import type { Producto } from "@/components/producto/catalogo";
import { esquema, numero, siNo, texto } from "@/lib/contenido";
import { TextoRico } from "@/components/comunes/Texto";
import { esUltimaDeLaPagina, sinAireArriba } from "./aire";
import { FranjaPista } from "./FranjaMensajesPista";

// Íconos de la biblioteca del tema que usa Diluvium, dibujados aquí (no son los del tema).
const TRAZOS: Record<string, React.ReactNode> = {
  cart: (
    <>
      <rect x="4.5" y="8.5" width="15" height="11.5" rx="2.5" />
      <path d="M8.5 8.5V7a3.5 3.5 0 0 1 7 0v1.5" />
    </>
  ),
  truck: (
    <>
      <path d="M5.5 6.5h9v9.5M14.5 9.5h3.5l2.5 3v3.5h-1.5M2.5 9.5h6M3.5 12.5h4" />
      <path d="M5.5 15v1M9.5 16.5h5" />
      <circle cx="7.5" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </>
  ),
  clock: (
    <>
      <path d="M12 4.5a7.5 7.5 0 1 1-5.3 2.2" />
      <path d="M12 4.5V12L8.5 8.5" />
    </>
  ),
  check: <path d="m4.5 12.5 4.5 4.5 10.5-10.5" />,
  subscription: (
    <>
      <path d="M7 9.5v-3h10.5V13M14.5 10.5l3 3 3-3" />
      <path d="M17 14.5v3H6.5V11M3.5 13.5l3-3 3 3" />
    </>
  ),
};

function Icono({ nombre }: { nombre: string }) {
  const trazo = TRAZOS[nombre];
  if (!trazo) {
    // «ellipsis» (y cualquier otro): tres puntos.
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className="h-[1.25em] w-[1.25em] shrink-0">
        <circle cx="5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="19" cy="12" r="1.6" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="h-[1.25em] w-[1.25em] shrink-0"
    >
      {trazo}
    </svg>
  );
}

/** Foto de la franja, del alto del renglón. Sin foto elegida, el tema muestra un cuadro gris de muestra (/collections). */
function FotoFranja({ src }: { src: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- ícono chico dentro de la franja, sin optimizar
    return <img src={src} alt="" className="h-[1.25em] w-auto shrink-0" />;
  }
  return (
    <svg viewBox="0 0 98 70" aria-hidden="true" focusable="false" className="aspect-[98/70] w-[1.25em] shrink-0">
      <rect width="98" height="70" fill="#e5e6e6" />
      <path d="m25 32 24 22 24-15" fill="none" stroke="#187f80" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

// Tamaño de letra y aire (un renglón de 1.25) según «heading_size».
const TAMANOS: Record<string, string> = {
  h2: "text-[length:var(--h2)] py-[calc(var(--h2)*1.25)]",
  h3: "text-[length:var(--h3)] py-[calc(var(--h3)*1.25)]",
  h4: "text-[length:var(--h4)] py-[calc(var(--h4)*1.25)]",
  h6: "text-[length:var(--h6)] py-[calc(var(--h6)*1.25)]",
};
// Cuando la franja es la última sección de la página, en vivo deja además un renglón de margen arriba y abajo
// (página 404 y /collections); el de arriba no, si la sección anterior tiene el mismo fondo.
const MARGEN_FINAL: Record<string, { arriba: string; abajo: string }> = {
  h2: { arriba: "mt-[calc(var(--h2)*1.25)]", abajo: "mb-[calc(var(--h2)*1.25)]" },
  h3: { arriba: "mt-[calc(var(--h3)*1.25)]", abajo: "mb-[calc(var(--h3)*1.25)]" },
  h4: { arriba: "mt-[calc(var(--h4)*1.25)]", abajo: "mb-[calc(var(--h4)*1.25)]" },
  h6: { arriba: "mt-[calc(var(--h6)*1.25)]", abajo: "mb-[calc(var(--h6)*1.25)]" },
};

export function FranjaMensajes({ seccion, producto }: { seccion: Seccion; producto?: Producto }) {
  const a = seccion.ajustes;
  const pausa = siNo(a, "pause_when_hover") ? "franja" : "";
  const tamano = TAMANOS[texto(a, "heading_size")] ?? TAMANOS.h6;
  const margen = MARGEN_FINAL[texto(a, "heading_size")] ?? MARGEN_FINAL.h6;
  const pegada = sinAireArriba(seccion, producto);
  const final = esUltimaDeLaPagina(seccion, producto) ? `${margen.abajo} ${pegada ? "" : margen.arriba}` : "";
  const arriba = sinAireArriba(seccion, producto) ? "pt-0!" : "";
  // «animation-reverse»: corre hacia la derecha.
  const sentido = texto(a, "moving_direction") === "animation-reverse" ? "[&_.franja-pista]:[animation-direction:reverse]" : "";

  return (
    <div
      className={`${pausa} ${esquema(a)} overflow-hidden leading-[1.25] ${tamano} ${arriba} ${sentido} ${final}`}
      data-seccion="running-content"
    >
      <FranjaPista velocidad={numero(a, "speed", 50)}>
        {seccion.bloques.map((b) =>
          b.tipo === "icon" ? (
            <Icono key={b.id} nombre={texto(b.ajustes, "options_icon")} />
          ) : b.tipo === "image" ? (
            <FotoFranja key={b.id} src={texto(b.ajustes, "image")} />
          ) : (
            <TextoRico
              key={b.id}
              // Sin texto propio, el tema pone su texto de ejemplo (así se ve en la página 404 en vivo).
              html={"promotion_text" in b.ajustes ? texto(b.ajustes, "promotion_text") : "<p>Promotion text</p>"}
              className="shrink-0 whitespace-nowrap text-center font-titulo font-medium [&_p]:m-0"
            />
          ),
        )}
      </FranjaPista>
    </div>
  );
}
