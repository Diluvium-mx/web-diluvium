"use client";

// Tres prototipos de edición de fotos para que el dueño elija uno (no guardan nada):
//   A · Como el editor de la tienda en Shopify: partes a la izquierda, la página en medio (tocar una foto la elige) y
//       el panel de la foto a la derecha (punto focal, Cambiar, Quitar, Agregar).
//   B · Directo sobre la página: se toca la foto en la página y ahí mismo se arrastra, se acerca, se cambia o se quita.
//   C · Tablero: todas las fotos recortadas como se ven; al tocar una, el ajuste grande con vista de celular y computadora.
// Los cambios de encuadre y de foto se ven al momento en la página de en medio (A y B).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { leerFocal, mapaPlantilla, PAGINAS_MAPA, type ArchivoMapa, type Esquema, type PlantillaTema } from "@/lib/mapa";
import type { MedioBiblioteca } from "@/lib/editor/archivos";

type Props = { plantillas: Record<ArchivoMapa, PlantillaTema>; esquema: Esquema; biblioteca: MedioBiblioteca[] };

/** Un lugar con foto en la página. */
type Hueco = {
  codigo: string;
  seccion: string;
  seccionCodigo: string;
  etiqueta: string;
  original: string;
  src: string;
  x: number;
  y: number;
  zoom: number;
  quitada: boolean;
  nueva?: boolean;
  /** Proporción con que se recorta en el celular. */
  forma: number;
};

const FORMAS: Record<string, number> = {
  "landing-ficha": 4 / 3,
  "landing-portada": 4 / 3,
  "landing-comparacion": 16 / 10,
  "landing-beneficios": 4 / 3,
  "landing-pasos": 1,
  "landing-resenas": 116 / 176,
};

function huecosDe(archivo: ArchivoMapa, p: PlantillaTema, e: Esquema): Hueco[] {
  const lista: Hueco[] = [];
  for (const s of mapaPlantilla(archivo, p, e)) {
    const forma = FORMAS[s.tipo] ?? 4 / 3;
    const agregar = (codigo: string, etiqueta: string, src: unknown, focal: unknown) => {
      if (typeof src !== "string" || !/\.(jpe?g|png|webp|avif)$/i.test(src)) return;
      const { x, y } = leerFocal(focal);
      lista.push({ codigo, seccion: s.etiqueta, seccionCodigo: s.codigo, etiqueta, original: src, src, x, y, zoom: 1, quitada: false, forma });
    };
    for (const c of s.campos) if (c.tipo === "imagen" && c.clave !== "logo") agregar(c.codigo, c.etiqueta, c.valor, undefined);
    for (const b of s.bloques) {
      const aj = p.secciones[s.indice].bloques[b.indice].ajustes;
      for (const c of b.campos) {
        if (c.tipo !== "imagen" || c.clave === "poster") continue;
        const focal = c.clave === "image" ? aj.focal : aj[c.clave.replace("image_", "focal_")];
        agregar(c.codigo, `${b.etiqueta}${c.clave.includes("before") ? " (antes)" : c.clave.includes("after") ? " (después)" : ""}`, c.valor, focal);
      }
    }
  }
  return lista;
}

/** Seguir al puntero aunque salga del marco (si el navegador no lo permite, se sigue igual mientras esté encima). */
function capturar(e: React.PointerEvent<Element>) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // Sin captura: no pasa nada.
  }
}

const nombre = (src: string) => decodeURIComponent(src.split("/").pop() ?? "");

/** Las fotos de la página de en medio que corresponden a un hueco (por su archivo original). */
function fotosEnPagina(doc: Document | null | undefined, h: Hueco): HTMLImageElement[] {
  if (!doc) return [];
  const archivo = nombre(h.original);
  return [...doc.querySelectorAll("img")].filter((img) => decodeURIComponent(img.currentSrc || img.src).includes(archivo) || img.dataset.hueco === h.codigo);
}

/** Aplica en la página de en medio lo que se cambió: encuadre, acercamiento, foto nueva o quitada. */
function aplicar(doc: Document | null | undefined, h: Hueco, elegida: boolean) {
  for (const img of fotosEnPagina(doc, h)) {
    img.dataset.hueco = h.codigo;
    if (img.dataset.srcOriginal === undefined) img.dataset.srcOriginal = img.src;
    if (h.src !== h.original && !img.src.includes(nombre(h.src))) {
      img.srcset = "";
      img.src = h.src;
    }
    img.style.objectPosition = `${h.x}% ${h.y}%`;
    img.style.transformOrigin = `${h.x}% ${h.y}%`;
    img.style.transform = h.zoom > 1 ? `scale(${h.zoom})` : "";
    img.style.opacity = h.quitada ? "0.15" : "";
    img.style.outline = elegida ? "4px solid #e11d48" : "";
    img.style.outlineOffset = "-4px";
  }
}

// ─────────────── Piezas compartidas ───────────────

/** La foto recortada como se ve en el celular, con su encuadre y acercamiento. */
function Recorte({ h, ancho, forma = h.forma, className = "" }: { h: Hueco; ancho?: number; forma?: number; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-niebla ${className}`} style={{ aspectRatio: String(forma), width: ancho }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={h.src}
        alt=""
        draggable={false}
        className="absolute inset-0 size-full object-cover"
        style={{ objectPosition: `${h.x}% ${h.y}%`, transformOrigin: `${h.x}% ${h.y}%`, transform: h.zoom > 1 ? `scale(${h.zoom})` : undefined, opacity: h.quitada ? 0.2 : 1 }}
      />
      {h.quitada && <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[#b42318]">Quitada</span>}
    </div>
  );
}

/** Arrastrar la foto dentro de su marco para acomodarla (como al recortar en el celular). */
function Arrastrable({ h, alMover, forma = h.forma, ancho }: { h: Hueco; alMover: (x: number, y: number) => void; forma?: number; ancho?: number }) {
  const inicio = useRef<{ px: number; py: number; x: number; y: number; w: number; hgt: number } | null>(null);
  return (
    <div
      className="relative cursor-grab touch-none overflow-hidden rounded-xl bg-niebla select-none active:cursor-grabbing"
      style={{ aspectRatio: String(forma), width: ancho }}
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        inicio.current = { px: e.clientX, py: e.clientY, x: h.x, y: h.y, w: r.width, hgt: r.height };
        capturar(e);
      }}
      onPointerMove={(e) => {
        const i = inicio.current;
        if (!i) return;
        // Mover la foto a la derecha muestra más de su lado izquierdo: el punto baja.
        const nx = Math.min(100, Math.max(0, i.x - ((e.clientX - i.px) / i.w) * 100 * (1.6 / h.zoom)));
        const ny = Math.min(100, Math.max(0, i.y - ((e.clientY - i.py) / i.hgt) * 100 * (1.6 / h.zoom)));
        alMover(Math.round(nx), Math.round(ny));
      }}
      onPointerUp={() => (inicio.current = null)}
      onPointerCancel={() => (inicio.current = null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={h.src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-cover"
        style={{ objectPosition: `${h.x}% ${h.y}%`, transformOrigin: `${h.x}% ${h.y}%`, transform: h.zoom > 1 ? `scale(${h.zoom})` : undefined }}
      />
      <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-tinta/70 px-2.5 py-1 text-[12px] font-semibold text-white">✋ Arrastra para acomodar</span>
    </div>
  );
}

/** Punto focal como en Shopify: la foto completa y un círculo que se arrastra al punto importante. */
function PuntoFocal({ h, alMover }: { h: Hueco; alMover: (x: number, y: number) => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const mover = (e: React.PointerEvent) => {
    const r = caja.current?.getBoundingClientRect();
    if (!r) return;
    alMover(Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))), Math.round(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100))));
  };
  return (
    <div
      ref={caja}
      className="relative w-full cursor-crosshair touch-none overflow-hidden rounded-lg select-none"
      onPointerDown={(e) => {
        capturar(e);
        mover(e);
      }}
      onPointerMove={(e) => e.buttons && mover(e)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={h.src} alt="" draggable={false} className="block w-full" />
      <span className="pointer-events-none absolute size-9 -translate-1/2 rounded-full border-[3px] border-white bg-white/25 shadow-[0_0_0_2px_rgba(0,0,0,0.4)]" style={{ left: `${h.x}%`, top: `${h.y}%` }} />
    </div>
  );
}

function Zoom({ h, alCambiar }: { h: Hueco; alCambiar: (z: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-[13px]">
      <span className="w-20 shrink-0 font-semibold">Acercar</span>
      <input type="range" min={1} max={2.5} step={0.05} value={h.zoom} onChange={(e) => alCambiar(Number(e.target.value))} className="w-full" />
      <span className="w-10 text-right tabular-nums">{h.zoom.toFixed(1)}×</span>
    </label>
  );
}

function Acciones({ h, alCambiar, alQuitar, alAgregar }: { h: Hueco; alCambiar: () => void; alQuitar: () => void; alAgregar: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={alCambiar} className="h-9 cursor-pointer rounded-lg bg-marino px-3 text-[13px] font-semibold text-white">
        Cambiar foto
      </button>
      <button type="button" onClick={alQuitar} className="h-9 cursor-pointer rounded-lg border border-linea bg-white px-3 text-[13px] font-semibold text-[#b42318]">
        {h.quitada ? "Regresarla" : "Quitar"}
      </button>
      <button type="button" onClick={alAgregar} className="h-9 cursor-pointer rounded-lg border border-linea bg-white px-3 text-[13px] font-semibold">
        + Agregar otra foto aquí
      </button>
    </div>
  );
}

function Biblioteca({ medios, alElegir, alCerrar }: { medios: MedioBiblioteca[]; alElegir: (src: string) => void; alCerrar: () => void }) {
  const [filtro, setFiltro] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <div className="flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white">
        <div className="flex items-center gap-2 border-b border-linea p-3">
          <strong className="mr-auto">Elegir foto</strong>
          <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar…" className="h-9 rounded-lg border border-linea px-3" />
          <span className="rounded-lg bg-niebla px-3 py-2 text-[12px] text-texto-suave">Subir desde la computadora (en la versión final)</span>
          <button type="button" onClick={alCerrar} className="h-9 cursor-pointer rounded-lg border border-linea px-3">
            Cerrar
          </button>
        </div>
        <ul className="m-0 grid list-none grid-cols-4 gap-2 overflow-y-auto p-3 sm:grid-cols-6">
          {medios
            .filter((m) => m.nombre.toLowerCase().includes(filtro.toLowerCase()))
            .map((m) => (
              <li key={m.src}>
                <button type="button" onClick={() => alElegir(m.src)} className="block w-full cursor-pointer overflow-hidden rounded-lg border-2 border-transparent hover:border-marino">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────── Prototipos ───────────────

export function Opciones({ plantillas, esquema, biblioteca }: Props) {
  const [opcion, setOpcion] = useState<"A" | "B" | "C">("A");
  const [archivo, setArchivo] = useState<ArchivoMapa>("product.b1");
  const [huecos, setHuecos] = useState<Hueco[]>(() => huecosDe("product.b1", plantillas["product.b1"], esquema));
  const [elegido, setElegido] = useState<string | null>(null);
  const [cambiando, setCambiando] = useState<{ codigo: string; agregar: boolean } | null>(null);
  const [cargada, setCargada] = useState(0);
  const marco = useRef<HTMLIFrameElement>(null);
  const [cajaB, setCajaB] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const h = huecos.find((x) => x.codigo === elegido) ?? null;
  const grupos = useMemo(() => {
    const g = new Map<string, Hueco[]>();
    for (const x of huecos) g.set(`${x.seccionCodigo} · ${x.seccion}`, [...(g.get(`${x.seccionCodigo} · ${x.seccion}`) ?? []), x]);
    return [...g.entries()];
  }, [huecos]);

  function cambiarPagina(a: ArchivoMapa) {
    setArchivo(a);
    setHuecos(huecosDe(a, plantillas[a], esquema));
    setElegido(null);
    setCajaB(null);
  }

  const actualizar = useCallback((codigo: string, cambio: Partial<Hueco>) => setHuecos((l) => l.map((x) => (x.codigo === codigo ? { ...x, ...cambio } : x))), []);

  function agregarDespues(codigo: string, src: string) {
    setHuecos((l) => {
      const i = l.findIndex((x) => x.codigo === codigo);
      const base = l[i];
      const nuevo: Hueco = { ...base, codigo: `${base.codigo}+${Date.now() % 1000}`, etiqueta: "Foto nueva", original: src, src, x: 50, y: 50, zoom: 1, quitada: false, nueva: true };
      return [...l.slice(0, i + 1), nuevo, ...l.slice(i + 1)];
    });
  }

  // Los cambios se ven al momento en la página de en medio (A y B).
  useEffect(() => {
    const doc = marco.current?.contentDocument;
    for (const x of huecos) if (!x.nueva) aplicar(doc, x, x.codigo === elegido);
  }, [huecos, elegido, cargada, opcion]);

  // Tocar una foto en la página de en medio la elige (y no abre enlaces mientras se edita).
  useEffect(() => {
    const doc = marco.current?.contentDocument;
    if (!doc || opcion === "C") return;
    const alTocar = (e: MouseEvent) => {
      const objetivo = e.target as Element | null;
      const img = (objetivo?.closest?.("img") ?? objetivo?.parentElement?.querySelector?.("img")) as HTMLImageElement | null;
      if (objetivo?.closest?.("a")) e.preventDefault();
      if (!img) return;
      const hueco = huecos.find((x) => !x.nueva && fotosEnPagina(doc, x).includes(img));
      if (!hueco) return;
      e.preventDefault();
      e.stopPropagation();
      setElegido(hueco.codigo);
      if (opcion === "B") {
        const r = img.getBoundingClientRect();
        setCajaB({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    doc.addEventListener("click", alTocar, true);
    const alBajar = () => setCajaB(null);
    doc.addEventListener("scroll", alBajar, { passive: true });
    return () => {
      doc.removeEventListener("click", alTocar, true);
      doc.removeEventListener("scroll", alBajar);
    };
  }, [huecos, opcion, cargada]);

  const ruta = PAGINAS_MAPA[archivo].ruta;
  const pagina = (
    <iframe
      ref={marco}
      key={`${archivo}-${opcion}`}
      title="Página"
      src={ruta}
      onLoad={() => setCargada((c) => c + 1)}
      className="size-full bg-white"
    />
  );

  const panelFoto = h && (
    <div className="grid gap-3">
      <div>
        <code className="rounded bg-[#e11d48] px-1.5 py-0.5 font-mono text-[12px] font-bold text-white">{h.codigo}</code>{" "}
        <strong className="text-[14px]">{h.etiqueta}</strong>
        <p className="m-0 text-[12px] text-texto-suave">
          {h.seccionCodigo} · {h.seccion}
        </p>
      </div>
      <Acciones
        h={h}
        alCambiar={() => setCambiando({ codigo: h.codigo, agregar: false })}
        alQuitar={() => actualizar(h.codigo, { quitada: !h.quitada })}
        alAgregar={() => setCambiando({ codigo: h.codigo, agregar: true })}
      />
    </div>
  );

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-linea bg-white px-4 py-2.5">
        <strong className="text-[16px] text-marino">Elige cómo editar las fotos</strong>
        <div className="flex rounded-lg bg-niebla p-1">
          {(
            [
              ["A", "A · Como Shopify"],
              ["B", "B · Directo en la página"],
              ["C", "C · Tablero de fotos"],
            ] as const
          ).map(([o, t]) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                setOpcion(o);
                setCajaB(null);
              }}
              className={`h-9 cursor-pointer rounded-md px-3 text-[14px] font-semibold ${opcion === o ? "bg-white text-marino shadow" : "text-texto-suave"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg bg-niebla p-1">
          {(Object.keys(PAGINAS_MAPA) as ArchivoMapa[]).map((a) => (
            <button key={a} type="button" onClick={() => cambiarPagina(a)} className={`h-9 cursor-pointer rounded-md px-3 text-[14px] font-semibold ${archivo === a ? "bg-white text-marino shadow" : "text-texto-suave"}`}>
              {PAGINAS_MAPA[a].nombre}
            </button>
          ))}
        </div>
        <span className="ml-auto rounded-full bg-[#fdf1dd] px-3 py-1 text-[13px] font-semibold text-[#8a4b00]">Prototipo: no guarda nada</span>
      </header>

      {/* ── A · Como el editor de la tienda en Shopify ── */}
      {opcion === "A" && (
        <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_340px]">
          <nav className="min-h-0 overflow-y-auto border-r border-linea bg-white p-3">
            <p className="m-0 mb-2 text-[13px] text-texto-suave">Partes de la página. Toca una foto aquí o en la página.</p>
            {grupos.map(([g, lista]) => (
              <div key={g} className="mb-3">
                <p className="m-0 mb-1 text-[13px] font-bold">{g}</p>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {lista.map((x) => (
                    <li key={x.codigo}>
                      <button
                        type="button"
                        onClick={() => setElegido(x.codigo)}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg p-1.5 text-left text-[12.5px] ${elegido === x.codigo ? "bg-[#fff1f2] ring-2 ring-[#e11d48]" : "hover:bg-niebla"}`}
                      >
                        <Recorte h={x} ancho={44} />
                        <span className="min-w-0">
                          <code className="font-mono text-[11px] font-bold text-[#e11d48]">{x.codigo}</code>
                          <span className="block truncate">{x.etiqueta}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="flex min-h-0 items-center justify-center bg-niebla p-4">
            <div className="h-full max-h-[844px] w-[390px] overflow-hidden rounded-[28px] border-[8px] border-tinta">{pagina}</div>
          </div>
          <aside className="min-h-0 overflow-y-auto border-l border-linea bg-white p-4">
            {h ? (
              <div className="grid gap-4">
                {panelFoto}
                <div>
                  <p className="m-0 mb-1 text-[13px] font-bold">Punto focal</p>
                  <p className="m-0 mb-2 text-[12px] text-texto-suave">Arrastra el círculo al punto que nunca se debe cortar (como en Shopify).</p>
                  <PuntoFocal h={h} alMover={(x, y) => actualizar(h.codigo, { x, y })} />
                </div>
                <Zoom h={h} alCambiar={(zoom) => actualizar(h.codigo, { zoom })} />
                <div>
                  <p className="m-0 mb-1 text-[13px] font-bold">Así se ve en el celular</p>
                  <Recorte h={h} />
                </div>
              </div>
            ) : (
              <p className="m-0 text-[14px] text-texto-suave">Toca una foto en la página o en la lista para editarla.</p>
            )}
          </aside>
        </div>
      )}

      {/* ── B · Directo sobre la página ── */}
      {opcion === "B" && (
        <div className="flex min-h-0 flex-1 items-start justify-center gap-6 overflow-hidden bg-niebla p-4">
          <div className="relative h-full max-h-[844px] w-[390px] overflow-hidden rounded-[28px] border-[8px] border-tinta">
            {pagina}
            {h && cajaB && (
              <div className="pointer-events-none absolute inset-0">
                <div className="pointer-events-auto absolute" style={{ top: cajaB.top, left: cajaB.left, width: cajaB.width, height: cajaB.height }}>
                  <div
                    className="absolute inset-0 cursor-grab touch-none border-4 border-[#e11d48] active:cursor-grabbing"
                    onPointerDown={(e) => {
                      (e.currentTarget as HTMLElement).dataset.px = String(e.clientX);
                      (e.currentTarget as HTMLElement).dataset.py = String(e.clientY);
                      (e.currentTarget as HTMLElement).dataset.x = String(h.x);
                      (e.currentTarget as HTMLElement).dataset.y = String(h.y);
                      capturar(e);
                    }}
                    onPointerMove={(e) => {
                      const d = (e.currentTarget as HTMLElement).dataset;
                      if (!e.buttons || d.px === undefined) return;
                      const nx = Math.min(100, Math.max(0, Number(d.x) - ((e.clientX - Number(d.px)) / cajaB.width) * 100 * (1.6 / h.zoom)));
                      const ny = Math.min(100, Math.max(0, Number(d.y) - ((e.clientY - Number(d.py)) / cajaB.height) * 100 * (1.6 / h.zoom)));
                      actualizar(h.codigo, { x: Math.round(nx), y: Math.round(ny) });
                    }}
                  >
                    <span className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full bg-tinta/70 px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-white">✋ Arrastra la foto</span>
                  </div>
                  <div className="absolute top-full left-0 z-10 mt-1 grid w-[min(330px,100%)] min-w-[280px] gap-2 rounded-xl bg-white p-2.5 shadow-xl">
                    <Zoom h={h} alCambiar={(zoom) => actualizar(h.codigo, { zoom })} />
                    <Acciones
                      h={h}
                      alCambiar={() => setCambiando({ codigo: h.codigo, agregar: false })}
                      alQuitar={() => actualizar(h.codigo, { quitada: !h.quitada })}
                      alAgregar={() => setCambiando({ codigo: h.codigo, agregar: true })}
                    />
                    <button type="button" onClick={() => setCajaB(null)} className="h-8 cursor-pointer rounded-lg bg-niebla text-[13px] font-semibold">
                      Listo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="max-w-[300px] pt-4 text-[14px] leading-relaxed text-texto-suave">
            <p className="m-0 font-bold text-tinta">Cómo se usa</p>
            <ol className="mt-1 pl-5">
              <li>Toca cualquier foto de la página.</li>
              <li>Arrástrala dentro de su marco rojo hasta que quede bien.</li>
              <li>Usa «Acercar» si hace falta, o cámbiala, quítala o agrega otra.</li>
            </ol>
            <p className="m-0 mt-2">Al bajar la página, el marco se cierra; vuelve a tocar la foto.</p>
          </div>
        </div>
      )}

      {/* ── C · Tablero de fotos ── */}
      {opcion === "C" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <p className="m-0 mb-3 text-[14px] text-texto-suave">Todas las fotos de la página, recortadas como se ven en el celular. Toca una para ajustarla.</p>
          {grupos.map(([g, lista]) => (
            <section key={g} className="mb-6">
              <h2 className="m-0 mb-2 text-[15px] font-bold">{g}</h2>
              <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4 lg:grid-cols-6">
                {lista.map((x) => (
                  <li key={x.codigo}>
                    <button type="button" onClick={() => setElegido(x.codigo)} className="block w-full cursor-pointer rounded-xl border-2 border-transparent bg-white p-1.5 text-left hover:border-marino">
                      <Recorte h={x} />
                      <code className="mt-1 block font-mono text-[11px] font-bold text-[#e11d48]">{x.codigo}</code>
                      <span className="block truncate text-[12px]">{x.etiqueta}</span>
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setCambiando({ codigo: lista[lista.length - 1].codigo, agregar: true })}
                    className="flex aspect-[4/3] w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-linea text-[13px] font-semibold text-texto-suave hover:border-marino"
                  >
                    + Agregar foto
                  </button>
                </li>
              </ul>
            </section>
          ))}
          {h && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-tinta/60 p-4" onClick={(e) => e.target === e.currentTarget && setElegido(null)}>
              <div className="grid w-full max-w-4xl gap-4 rounded-2xl bg-white p-4 md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="grid content-start gap-3">
                  {panelFoto}
                  <Arrastrable h={h} alMover={(x, y) => actualizar(h.codigo, { x, y })} />
                  <Zoom h={h} alCambiar={(zoom) => actualizar(h.codigo, { zoom })} />
                </div>
                <div className="grid content-start gap-3">
                  <p className="m-0 text-[13px] font-bold">Celular</p>
                  <Recorte h={h} ancho={180} />
                  <p className="m-0 text-[13px] font-bold">Computadora</p>
                  <Recorte h={h} forma={1} ancho={180} />
                  <button type="button" onClick={() => setElegido(null)} className="h-10 cursor-pointer rounded-lg bg-marino font-semibold text-white">
                    Listo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {cambiando && (
        <Biblioteca
          medios={biblioteca}
          alCerrar={() => setCambiando(null)}
          alElegir={(src) => {
            if (cambiando.agregar) agregarDespues(cambiando.codigo, src);
            else actualizar(cambiando.codigo, { src });
            setCambiando(null);
          }}
        />
      )}
    </div>
  );
}
