"use client";

// Sección «c-cifras»: franja de números grandes que cuentan desde cero al llegar a ella (+2,000 vendidas, 4.9 de
// calificación, 1 año de garantía, 3–5 días). Piezas «stat»: número (con lo que lleve antes o después, «+», «★») y texto.

import { useEffect, useRef, useState } from "react";

type Cifra = { id: string; numero: string; texto: string };

function Contador({ valor, activo }: { valor: string; activo: boolean }) {
  const m = valor.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  const objetivo = m ? Number(m[2].replace(/,/g, "")) : 0;
  const decimales = m?.[2].includes(".") ? m[2].split(".")[1].length : 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!activo || !m) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cuadro = 0;
    const inicio = performance.now();
    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / 1200);
      setN(objetivo * (1 - Math.pow(1 - p, 3)));
      if (p < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, objetivo]);
  if (!m) return <>{valor}</>;
  const sinMovimiento = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mostrado = activo && !sinMovimiento ? n : objetivo;
  return (
    <>
      {m[1]}
      {mostrado.toLocaleString("en-US", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}
      {m[3]}
    </>
  );
}

export function CifrasCCliente({ cifras, titulo }: { cifras: Cifra[]; titulo: string }) {
  const caja = useRef<HTMLElement>(null);
  const [activo, setActivo] = useState(false);
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const vigia = new IntersectionObserver(([e]) => e.isIntersecting && setActivo(true), { threshold: 0.4 });
    vigia.observe(el);
    return () => vigia.disconnect();
  }, []);
  return (
    <section ref={caja} data-seccion="c-cifras" aria-label={titulo || "Diluvium en números"} className="bg-[#06182f] py-12 text-white md:py-16">
      <dl className="marco-version m-0 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {cifras.map((c) => (
          <div key={c.id} data-pieza={c.id} className="border-l-2 border-[#3fa9f5] pl-4">
            <dt className="font-titulo text-[40px] leading-none font-semibold tabular-nums md:text-[56px]">
              <Contador valor={c.numero} activo={activo} />
            </dt>
            <dd className="m-0 mt-2 text-[14.5px] leading-snug text-white/75 md:text-[16px]">{c.texto}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
