// Piezas chicas de las reseñas del producto: estrellas (con la última parcial para el promedio), botón de escribir y
// el ícono de ordenar. Dibujos propios, no los de la app.

const NARANJA = "#ffa50a";

function Estrella({ tamano, relleno, vacia }: { tamano: number; relleno: number; vacia: string }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: tamano, height: tamano }}>
      <svg viewBox="0 0 20 19" width={tamano} height={tamano} aria-hidden="true" focusable="false" className="absolute inset-0">
        <path d="M10 .8 12.6 6.6l6.3.6-4.8 4.2 1.4 6.2L10 14.4l-5.5 3.2 1.4-6.2L1.1 7.2l6.3-.6L10 .8Z" fill={vacia} />
      </svg>
      {relleno > 0 && (
        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${relleno * 100}%` }}>
          <svg viewBox="0 0 20 19" width={tamano} height={tamano} aria-hidden="true" focusable="false">
            <path d="M10 .8 12.6 6.6l6.3.6-4.8 4.2 1.4 6.2L10 14.4l-5.5 3.2 1.4-6.2L1.1 7.2l6.3-.6L10 .8Z" fill={NARANJA} />
          </svg>
        </span>
      )}
    </span>
  );
}

/** Cinco estrellas; «valor» puede tener decimales (la última se llena en parte). */
export function EstrellasResena({
  valor,
  tamano,
  separacion = 2,
  vacia = "#d9d9d9",
  className = "",
}: {
  valor: number;
  tamano: number;
  separacion?: number;
  vacia?: string;
  className?: string;
}) {
  return (
    <div className={`flex ${className}`} role="img" aria-label={`${Math.round(valor * 10) / 10} de 5 estrellas`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="flex" style={{ marginRight: separacion }}>
          <Estrella tamano={tamano} relleno={Math.max(0, Math.min(1, valor - i))} vacia={vacia} />
        </span>
      ))}
    </div>
  );
}

export const BOTON_RESENAS =
  "cursor-pointer rounded-[10px] border border-[rgb(143_143_143/0.8)] bg-azul-oscuro text-white " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-oscuro";

// «Escriba un comentario» abre la ventana para mandar una reseña (EscribirResena.tsx).
export { BotonEscribir } from "./EscribirResena";

export function IconoOrdenar() {
  return (
    <svg viewBox="0 0 19 18" width={19} height={18} fill="none" aria-hidden="true" focusable="false">
      <path d="M1 4.5h3.2M9.6 4.5H18M1 13.5h9.4M15.8 13.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6.9" cy="4.5" r="2.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13.1" cy="13.5" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
