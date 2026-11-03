// Calificación con estrellas y número de reseñas, como la muestra la app de reseñas en las tarjetas.

const ESTRELLA = "M9 .6l2.5 5.5 6 .7-4.4 4.1 1.1 6L9 13.9 3.7 16.9l1.1-6L.4 6.8l6-.7L9 .6z";

function Estrella({ relleno }: { relleno: number }) {
  return (
    <span className="relative inline-block size-3.5 min-[1025px]:mr-0.5 min-[1025px]:size-4">
      <svg viewBox="0 0 18 17" className="absolute inset-0 size-full" aria-hidden="true" focusable="false">
        <path d={ESTRELLA} fill="#d9d9d9" />
      </svg>
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${relleno * 100}%` }}>
        <svg viewBox="0 0 18 17" className="h-full w-3.5 min-[1025px]:w-4" aria-hidden="true" focusable="false">
          <path d={ESTRELLA} fill="#ffa800" />
        </svg>
      </span>
    </span>
  );
}

export function Estrellas({ promedio, total }: { promedio: number; total: number }) {
  return (
    <div className="my-[5px] flex h-6 items-center justify-center" aria-label={`${promedio} de 5 estrellas, ${total} reseñas`} role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <Estrella key={i} relleno={Math.min(1, Math.max(0, promedio - i))} />
      ))}
      <span className="mt-px mr-1.5 ml-[3px] font-titulo text-sm leading-[normal] text-[#313131]">({total})</span>
    </div>
  );
}
