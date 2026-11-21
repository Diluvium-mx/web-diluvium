"use client";

// Muro de reseñas en dos columnas, como en la tienda de hoy (Producto › B1-P3, 21-nov-2026): foto completa arriba,
// estrellas, nombre y el texto cortado con «...Mostrar reseña completa». Al tocar una reseña se abre en grande con su
// número («Reseña 3 de 6») y flechas (o deslizar, o ← →) para pasar a la anterior o a la siguiente, en el orden en
// que están puestas en la sección.
//
// Las tarjetas se reparten a la izquierda y a la derecha una y una (1 izq., 2 der., 3 izq.…), así se leen de izquierda
// a derecha igual que el orden de las flechas. data-el conserva los números del mapa que tenían antes.

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

export type TarjetaMuro = {
  id: string;
  nombre: string;
  calificacion: number;
  texto: string;
  foto: string;
  ancho: number;
  alto: number;
  estilo?: CSSProperties;
  marca: Record<string, string>;
};

const CORTE = 75;

function Estrellas({ n, tamano = "size-4" }: { n: number; tamano?: string }) {
  return (
    <span className="flex text-estrella" role="img" aria-label={`${n} de 5 estrellas`} data-el="Ícono:1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`${tamano} ${i <= n ? "" : "opacity-25"}`} fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Tarjeta({ t, alAbrir }: { t: TarjetaMuro; alAbrir: () => void }) {
  const texto = t.texto.trim();
  const cortado = texto.length > CORTE + 25;
  return (
    <li data-pieza={t.id} onClick={alAbrir} className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-[1px_1px_8px_rgb(0_0_0/0.12)]">
      <div className="relative overflow-hidden bg-niebla">
        <Image src={t.foto} alt={`Compuerta de ${t.nombre} puesta en su entrada`} width={t.ancho} height={t.alto} sizes="(min-width: 768px) 360px, 50vw" className="block h-auto w-full" style={t.estilo} {...t.marca} />
      </div>
      <div className="px-3.5 pt-3.5 pb-4">
        <Estrellas n={t.calificacion} />
        <p className="m-0 mt-2.5 text-[15px] leading-5 font-bold text-tinta" data-el="Texto:2">
          {t.nombre}
        </p>
        <p className="m-0 mt-2 text-[15px] leading-[1.45] break-words text-tinta" data-el="Texto:1">
          {cortado ? texto.slice(0, CORTE) : texto}
          {cortado && <span className="text-texto-suave">...Mostrar reseña completa</span>}
        </p>
        {/* Para teclado y lectores de pantalla (la tarjeta completa se toca con el dedo). */}
        <button type="button" onClick={alAbrir} className="sr-only">
          Leer la reseña completa de {t.nombre}
        </button>
      </div>
    </li>
  );
}

export function MuroResenas({ tarjetas }: { tarjetas: TarjetaMuro[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const ventana = useRef<HTMLDialogElement>(null);
  const inicioDedo = useRef<number | null>(null);

  useEffect(() => {
    const d = ventana.current;
    if (!d) return;
    if (abierta !== null && !d.open) d.showModal();
    if (abierta === null && d.open) d.close();
  }, [abierta]);

  const ir = (i: number) => setAbierta(Math.min(tarjetas.length - 1, Math.max(0, i)));
  const t = abierta === null ? null : tarjetas[abierta];
  const columnas = [tarjetas.filter((_, i) => i % 2 === 0), tarjetas.filter((_, i) => i % 2 === 1)];

  return (
    <>
      <div className="grid max-w-[760px] grid-cols-2 items-start gap-3 md:gap-4">
        {columnas.map((col, c) => (
          <ul key={c} className="m-0 grid list-none gap-3 p-0 md:gap-4">
            {col.map((x) => (
              <Tarjeta key={x.id} t={x} alAbrir={() => setAbierta(tarjetas.indexOf(x))} />
            ))}
          </ul>
        ))}
      </div>

      <dialog
        ref={ventana}
        onClose={() => setAbierta(null)}
        onClick={(e) => e.target === ventana.current && setAbierta(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" && abierta !== null) ir(abierta + 1);
          if (e.key === "ArrowLeft" && abierta !== null) ir(abierta - 1);
        }}
        aria-label={t ? `Reseña ${abierta! + 1} de ${tarjetas.length}` : "Reseña"}
        className="version m-auto max-h-[94dvh] w-[min(94vw,560px)] max-w-none overflow-hidden rounded-2xl bg-white p-0 text-tinta backdrop:bg-tinta/70"
      >
        {t && abierta !== null && (
          <div
            className="flex max-h-[94dvh] flex-col"
            onPointerDown={(e) => (inicioDedo.current = e.clientX)}
            onPointerUp={(e) => {
              // Deslizar a la izquierda: la siguiente; a la derecha: la anterior.
              const d = inicioDedo.current === null ? 0 : e.clientX - inicioDedo.current;
              inicioDedo.current = null;
              if (Math.abs(d) > 50) ir(abierta + (d < 0 ? 1 : -1));
            }}
          >
            <div className="flex items-center gap-2 border-b border-linea px-4 py-2.5">
              <strong className="flex-1 font-titulo text-[16px] text-marino">
                Reseña {abierta + 1} de {tarjetas.length}
              </strong>
              <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[24px] leading-none hover:bg-niebla">
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex items-center justify-center bg-tinta">
                <Image key={t.id} src={t.foto} alt={`Compuerta de ${t.nombre} puesta en su entrada`} width={t.ancho} height={t.alto} sizes="560px" className="block h-auto max-h-[52dvh] w-full object-contain" />
              </div>
              <div className="px-5 pt-4 pb-5">
                <Estrellas n={t.calificacion} tamano="size-5" />
                <p className="m-0 mt-2.5 text-[17px] font-bold">{t.nombre}</p>
                <p className="m-0 mt-2 text-[16px] leading-[1.55] break-words whitespace-pre-line">{t.texto.trim()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-linea px-3 py-2.5">
              <button type="button" onClick={() => ir(abierta - 1)} disabled={abierta === 0} className="h-11 flex-1 cursor-pointer rounded-xl border-2 border-marino font-titulo text-[15px] font-bold text-marino disabled:cursor-not-allowed disabled:opacity-30">
                ← Anterior
              </button>
              <span className="w-14 text-center text-[14px] font-semibold text-texto-suave tabular-nums">
                {abierta + 1}/{tarjetas.length}
              </span>
              <button type="button" onClick={() => ir(abierta + 1)} disabled={abierta === tarjetas.length - 1} className="h-11 flex-1 cursor-pointer rounded-xl border-2 border-marino font-titulo text-[15px] font-bold text-marino disabled:cursor-not-allowed disabled:opacity-30">
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
