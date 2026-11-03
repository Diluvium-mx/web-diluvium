// Franja de texto que corre (sección «running-content»: encabezado y varias páginas). Velocidad en píxeles por
// segundo, como el ajuste «speed» del tema; se pausa al pasar el mouse si «pause_when_hover» está prendido.
// El tamaño de letra sale de «heading_size» (h4 o h6) y el aire de arriba y abajo mide un renglón. Como las demás
// secciones, pierde el aire de arriba si la sección anterior tiene el mismo color de fondo.

import type { Seccion } from "@/lib/contenido";
import type { Producto } from "@/components/producto/catalogo";
import { esquema, numero, siNo, texto } from "@/lib/contenido";
import { TextoRico } from "@/components/comunes/Texto";
import { sinAireArriba } from "./aire";
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

// Tamaño de letra y aire (un renglón de 1.25) según «heading_size».
const TAMANOS: Record<string, string> = {
  h4: "text-[length:var(--h4)] py-[calc(var(--h4)*1.25)]",
  h6: "text-[length:var(--h6)] py-[calc(var(--h6)*1.25)]",
};

export function FranjaMensajes({ seccion, producto }: { seccion: Seccion; producto?: Producto }) {
  const a = seccion.ajustes;
  const pausa = siNo(a, "pause_when_hover") ? "franja" : "";
  const tamano = TAMANOS[texto(a, "heading_size")] ?? TAMANOS.h6;
  const arriba = sinAireArriba(seccion, producto) ? "pt-0!" : "";

  return (
    <div
      className={`${pausa} ${esquema(a, "scheme-3")} overflow-hidden leading-[1.25] ${tamano} ${arriba}`}
      data-seccion="running-content"
    >
      <FranjaPista velocidad={numero(a, "speed", 50)}>
        {seccion.bloques.map((b) =>
          b.tipo === "icon" ? (
            <Icono key={b.id} nombre={texto(b.ajustes, "options_icon")} />
          ) : (
            <TextoRico
              key={b.id}
              html={texto(b.ajustes, "promotion_text")}
              className="shrink-0 whitespace-nowrap text-center font-titulo font-medium [&_p]:m-0"
            />
          ),
        )}
      </FranjaPista>
    </div>
  );
}
