// Íconos de la barra de las colecciones (filtrar, columnas, flechas). Dibujados aquí con figuras simples.

type Props = { className?: string };

const comunes = { "aria-hidden": true, focusable: false, fill: "none" } as const;

/** Dos líneas con un círculo cada una (abrir o esconder filtros). */
export function IconoFiltro({ className = "size-6" }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...comunes}>
      <path d="M12 7.2h8.5M4.5 17.2H13" stroke="currentColor" strokeWidth="2" />
      <circle cx="7.5" cy="7" r="2.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="17.2" r="2.2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** Barras verticales: una por columna de la rejilla. */
export function IconoColumnas({ columnas, className = "size-6" }: Props & { columnas: number }) {
  const ancho = columnas >= 6 ? 28 : 24;
  const barra = columnas >= 6 ? 2.5 : 3;
  const paso = columnas >= 6 ? 4.1 : 4.2;
  const inicio = (ancho - (columnas - 1) * paso - barra) / 2;
  return (
    <svg viewBox={`0 0 ${ancho} 24`} className={className} {...comunes}>
      {Array.from({ length: columnas }, (_, i) => (
        <rect key={i} x={inicio + i * paso} y="5" width={barra} height="14" rx="1" fill="currentColor" />
      ))}
    </svg>
  );
}

export function IconoFlechaAbajo({ className = "size-6" }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...comunes}>
      <path d="m5.6 8.6 6.4 6.4 6.9-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function IconoEquis({ className = "size-6" }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...comunes}>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
