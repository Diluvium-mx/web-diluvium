"use client";

// Estrellas y número de reseñas bajo el título (hoy las pone la app Trustoo). Al tocar «N Reseñas» baja suave hasta
// donde terminan los datos del producto, que es donde la app pone la lista de reseñas.

const ESTRELLA = "M9 .6l2.5 5.5 6 .7-4.4 4.1 1.1 6L9 13.9 3.7 16.9l1.1-6L.4 6.8l6-.7L9 .6z";

function Estrella({ relleno }: { relleno: number }) {
  return (
    <span className="relative mr-0.5 inline-block size-5">
      <svg viewBox="0 0 18 17" width={20} height={20} className="block" aria-hidden="true" focusable="false">
        <path d={ESTRELLA} fill="#d9d9d9" />
      </svg>
      {relleno > 0 && (
        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: relleno * 20 }}>
          <svg viewBox="0 0 18 17" width={20} height={20} className="block" aria-hidden="true" focusable="false">
            <path d={ESTRELLA} fill="#ffa800" />
          </svg>
        </span>
      )}
    </span>
  );
}

export function Calificacion({ promedio, total, destino }: { promedio: number; total: number; destino: string }) {
  return (
    <div className="flex h-6 items-center">
      <span className="flex" role="img" aria-label={`${promedio} de 5 estrellas`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Estrella key={i} relleno={Math.min(1, Math.max(0, promedio - i))} />
        ))}
      </span>
      <button
        type="button"
        onClick={() => document.getElementById(destino)?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="mx-1.5 mt-0.5 inline-block cursor-pointer text-base leading-[14px] text-[#585858]"
      >
        {total} Reseñas
      </button>
    </div>
  );
}
