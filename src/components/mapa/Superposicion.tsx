"use client";

// Mapa de la página (?mapa): una etiqueta con el nombre corto sobre cada sección (B1-P3…) y, al tocarla, la lista de
// sus campos y piezas con su nombre (B1-P3.4, B1-P3.b2…) y lo que dicen hoy. Tocar un campo lo señala en la página y
// copia su nombre para pegarlo en el chat: «B1-P3.4 (Precio): que diga …».

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { mapaPlantilla, PAGINAS_MAPA, type ArchivoMapa, type CampoMapa, type Esquema, type PlantillaTema, type SeccionMapa } from "@/lib/mapa";

const CARGAR: Record<ArchivoMapa, () => Promise<{ default: unknown }>> = {
  "index.b1": () => import("@contenido/tema/index.b1.json"),
  "product.b1": () => import("@contenido/tema/product.b1.json"),
  "index.c1": () => import("@contenido/tema/index.c1.json"),
  "product.c1": () => import("@contenido/tema/product.c1.json"),
  "collection.c1": () => import("@contenido/tema/collection.c1.json"),
  "product.c1.mini-compuerta": () => import("@contenido/tema/product.c1.mini-compuerta.json"),
  "product.c1.medida-especial": () => import("@contenido/tema/product.c1.medida-especial.json"),
  "product.c1.tapon-inflable": () => import("@contenido/tema/product.c1.tapon-inflable.json"),
  "product.c1.funda": () => import("@contenido/tema/product.c1.funda.json"),
  "product.c1.tira": () => import("@contenido/tema/product.c1.tira.json"),
  "product.c1.plastilina": () => import("@contenido/tema/product.c1.plastilina.json"),
  "page.contact.c1": () => import("@contenido/tema/page.contact.c1.json"),
  "page.nosotros.c1": () => import("@contenido/tema/page.nosotros.c1.json"),
  "blog.c1": () => import("@contenido/tema/blog.c1.json"),
  "article.c1": () => import("@contenido/tema/article.c1.json"),
  "index.d1": () => import("@contenido/tema/index.d1.json"),
  "product.d1": () => import("@contenido/tema/product.d1.json"),
  "collection.d1": () => import("@contenido/tema/collection.d1.json"),
  "product.d1.mini-compuerta": () => import("@contenido/tema/product.d1.mini-compuerta.json"),
  "product.d1.medida-especial": () => import("@contenido/tema/product.d1.medida-especial.json"),
  "product.d1.tapon-inflable": () => import("@contenido/tema/product.d1.tapon-inflable.json"),
  "product.d1.funda": () => import("@contenido/tema/product.d1.funda.json"),
  "product.d1.tira": () => import("@contenido/tema/product.d1.tira.json"),
  "product.d1.plastilina": () => import("@contenido/tema/product.d1.plastilina.json"),
  "page.contact.d1": () => import("@contenido/tema/page.contact.d1.json"),
  "page.nosotros.d1": () => import("@contenido/tema/page.nosotros.d1.json"),
  "blog.d1": () => import("@contenido/tema/blog.d1.json"),
  "article.d1": () => import("@contenido/tema/article.d1.json"),
  "collection.b1": () => import("@contenido/tema/collection.b1.json"),
  "product.b1.mini-compuerta": () => import("@contenido/tema/product.b1.mini-compuerta.json"),
  "product.b1.medida-especial": () => import("@contenido/tema/product.b1.medida-especial.json"),
  "product.b1.tapon-inflable": () => import("@contenido/tema/product.b1.tapon-inflable.json"),
  "product.b1.funda": () => import("@contenido/tema/product.b1.funda.json"),
  "product.b1.tira": () => import("@contenido/tema/product.b1.tira.json"),
  "product.b1.plastilina": () => import("@contenido/tema/product.b1.plastilina.json"),
  "page.contact.b1": () => import("@contenido/tema/page.contact.b1.json"),
  "page.nosotros.b1": () => import("@contenido/tema/page.nosotros.b1.json"),
  "blog.b1": () => import("@contenido/tema/blog.b1.json"),
  "article.b1": () => import("@contenido/tema/article.b1.json"),
};

type Caja = { top: number; left: number; width: number; height: number };

/** Las secciones de la página en el orden del archivo: el elemento [data-seccion] de cada una. */
function elementosDeSecciones(secciones: SeccionMapa[]): (HTMLElement | null)[] {
  const todos = [...document.querySelectorAll<HTMLElement>("[data-seccion]")].filter((e) => !e.parentElement?.closest("[data-seccion]"));
  let desde = 0;
  return secciones.map((s) => {
    const i = todos.findIndex((e, k) => k >= desde && e.dataset.seccion === s.tipo);
    if (i < 0) return null;
    desde = i + 1;
    return todos[i];
  });
}

function caja(e: HTMLElement): Caja {
  const r = e.getBoundingClientRect();
  return { top: r.top + scrollY, left: r.left + scrollX, width: r.width, height: r.height };
}

/** Señala en la página lo que dice un campo (texto o foto) dentro de su sección. */
function senalar(seccion: HTMLElement | null, campo: CampoMapa) {
  if (!seccion) return;
  let objetivo: Element | null = null;
  const valor = typeof campo.valor === "string" ? campo.valor : "";
  if (campo.tipo === "imagen" || campo.tipo === "video") {
    const archivo = valor.split("/").pop() ?? "";
    objetivo = [...seccion.querySelectorAll("img,video")].find((m) => decodeURIComponent((m as HTMLImageElement).currentSrc || (m as HTMLImageElement).src || "").includes(archivo)) ?? null;
  } else if (valor) {
    const trozo = campo.resumen.replace(/\{[^}]*\}/g, "").trim().slice(0, 28).trim();
    if (trozo.length >= 3) {
      const candidatos = [...seccion.querySelectorAll<HTMLElement>("h1,h2,h3,h4,p,li,a,button,span,summary,label,blockquote,figcaption,dd,dt")];
      objetivo = candidatos.filter((c) => c.textContent?.includes(trozo)).sort((a, b) => (a.textContent?.length ?? 0) - (b.textContent?.length ?? 0))[0] ?? null;
    }
  }
  const destino = (objetivo as HTMLElement | null) ?? seccion;
  destino.scrollIntoView({ block: "center", behavior: "smooth" });
  const antes = destino.style.outline;
  destino.style.outline = "4px solid #e11d48";
  destino.style.outlineOffset = "3px";
  setTimeout(() => {
    destino.style.outline = antes;
  }, 1800);
}

function Fila({ campo, alTocar }: { campo: CampoMapa; alTocar: (c: CampoMapa) => void }) {
  return (
    <li>
      <button type="button" onClick={() => alTocar(campo)} className="flex w-full cursor-pointer items-baseline gap-2 rounded-lg px-2 py-2 text-left hover:bg-[#fff1f2]">
        <code className="shrink-0 rounded bg-[#e11d48] px-1.5 py-0.5 font-mono text-[12px] font-bold text-white">{campo.codigo}</code>
        <span className="min-w-0 text-[14px] leading-snug">
          <strong className="text-[#0c1e33]">{campo.etiqueta}</strong>
          <span className="block truncate text-[#45566a]">{campo.resumen}</span>
        </span>
      </button>
    </li>
  );
}

export function Superposicion({ archivo }: { archivo: ArchivoMapa }) {
  const [secciones, setSecciones] = useState<SeccionMapa[]>([]);
  const [cajas, setCajas] = useState<(Caja | null)[]>([]);
  const [abierta, setAbierta] = useState<number | null>(null);
  const [oculto, setOculto] = useState(false);
  const [copiado, setCopiado] = useState("");
  const pagina = PAGINAS_MAPA[archivo];

  useEffect(() => {
    Promise.all([CARGAR[archivo](), import("@/payload/esquema-secciones.json")]).then(([p, e]) =>
      setSecciones(mapaPlantilla(archivo, p.default as PlantillaTema, e.default as unknown as Esquema)),
    );
  }, [archivo]);

  const medir = useCallback(() => {
    setCajas(elementosDeSecciones(secciones).map((e) => (e ? caja(e) : null)));
  }, [secciones]);

  // Las etiquetas siguen a las secciones si la página cambia de alto (fotos que terminan de cargar, acordeones…).
  useEffect(() => {
    if (!secciones.length) return;
    const primera = requestAnimationFrame(medir);
    const obs = new ResizeObserver(() => medir());
    obs.observe(document.body);
    addEventListener("resize", medir);
    return () => {
      cancelAnimationFrame(primera);
      obs.disconnect();
      removeEventListener("resize", medir);
    };
  }, [secciones, medir]);

  const elementos = useMemo(() => (secciones.length ? elementosDeSecciones(secciones) : []), [secciones, cajas]); // eslint-disable-line react-hooks/exhaustive-deps

  function tocarCampo(seccion: number, c: CampoMapa) {
    senalar(elementos[seccion] ?? null, c);
    const texto = `${c.codigo} (${c.etiqueta})`;
    navigator.clipboard?.writeText(texto).catch(() => {});
    setCopiado(texto);
    setTimeout(() => setCopiado(""), 2500);
  }

  if (!secciones.length) return null;
  const s = abierta === null ? null : secciones[abierta];

  return createPortal(
    <div className="version">
      {/* Pastilla del mapa, abajo (arriba taparía el encabezado, que también tiene su etiqueta). */}
      {!s && (
        <div className="fixed bottom-3 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#e11d48] py-1.5 pr-1.5 pl-4 text-[14px] font-semibold whitespace-nowrap text-white shadow-lg">
          Mapa · {pagina.version} {pagina.nombre}
          <button type="button" onClick={() => setOculto((o) => !o)} className="cursor-pointer rounded-full bg-white/25 px-3 py-1">
            {oculto ? "Mostrar" : "Ocultar"}
          </button>
        </div>
      )}

      {/* Contornos y etiquetas de cada sección */}
      {!oculto && (
        <div aria-hidden={false} className="pointer-events-none absolute top-0 left-0 z-[90] w-full">
          {cajas.map((c, i) =>
            c ? (
              <div key={secciones[i].id} className="absolute border-2 border-dashed border-[#e11d48]/70" style={{ top: c.top, left: c.left, width: c.width, height: c.height }}>
                <button
                  type="button"
                  onClick={() => setAbierta(i)}
                  className="pointer-events-auto absolute top-1 left-1 flex cursor-pointer items-center gap-1.5 rounded-md bg-[#e11d48] px-2 py-1 text-left text-[13px] leading-tight font-bold text-white shadow-md"
                >
                  <code className="font-mono">{secciones[i].codigo}</code>
                  <span className="font-semibold">{secciones[i].etiqueta}</span>
                </button>
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* Lista de campos y piezas de la sección elegida */}
      {s && (
        <div className="fixed inset-x-0 bottom-0 z-[110] max-h-[62dvh] overflow-y-auto rounded-t-2xl border-t-4 border-[#e11d48] bg-white px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] text-[#0c1e33] shadow-[0_-12px_30px_-10px_rgba(0,0,0,0.4)] md:right-auto md:left-4 md:bottom-4 md:w-[420px] md:rounded-2xl md:border-4">
          <div className="sticky -top-3 -mx-3 flex items-center gap-2 bg-white px-3 pt-1 pb-2">
            <code className="rounded bg-[#e11d48] px-2 py-1 font-mono text-[15px] font-bold text-white">{s.codigo}</code>
            <strong className="min-w-0 flex-1 truncate text-[16px]">{s.etiqueta}</strong>
            <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[22px] hover:bg-[#f2f5f9]">
              ×
            </button>
          </div>
          <p className="m-0 mb-1 px-2 text-[13px] text-[#45566a]">Toca un campo: se señala en la página y su nombre se copia para pegarlo en el chat.</p>
          <ul className="m-0 list-none p-0">
            {s.campos.filter((c) => !c.diseno).map((c) => (
              <Fila key={c.codigo} campo={c} alTocar={(x) => tocarCampo(s.indice, x)} />
            ))}
          </ul>
          {s.bloques.map((b) => (
            <div key={b.codigo} className="mt-2 rounded-xl bg-[#f2f5f9] p-1.5">
              <p className="m-0 px-2 pt-1 text-[13px] font-bold">
                <code className="font-mono text-[#e11d48]">{b.codigo}</code> · {b.etiqueta}
              </p>
              <ul className="m-0 list-none p-0">
                {b.campos.filter((c) => !c.diseno).map((c) => (
                  <Fila key={c.codigo} campo={c} alTocar={(x) => tocarCampo(s.indice, x)} />
                ))}
              </ul>
            </div>
          ))}
          {s.campos.some((c) => c.diseno) && (
            <details className="mt-2 px-2 text-[14px]">
              <summary className="cursor-pointer py-2 font-semibold text-[#45566a]">Diseño (colores, tamaños…)</summary>
              <ul className="m-0 list-none p-0">
                {s.campos.filter((c) => c.diseno).map((c) => (
                  <Fila key={c.codigo} campo={c} alTocar={(x) => tocarCampo(s.indice, x)} />
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {copiado && (
        <div role="status" className="fixed top-12 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-[#0c1e33] px-4 py-2 text-[14px] font-semibold text-white shadow-lg">
          Copiado: {copiado}
        </div>
      )}
    </div>,
    document.body,
  );
}
