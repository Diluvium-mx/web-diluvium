"use client";

// Editor local de las versiones (/editor). A la izquierda, cada parte de la página con su nombre del mapa (B1-P3…):
// sus textos, sus fotos (cambiar, subir, encuadre) y sus piezas (ordenar, duplicar, quitar). A la derecha, la página
// como se ve en un celular. «Guardar» escribe la plantilla y la pasa al administrador; «Publicar» sube la copia de
// prueba a Cloudflare.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  leerFocal,
  mapaPlantilla,
  PAGINAS_MAPA,
  type ArchivoMapa,
  type CampoMapa,
  type Esquema,
  type PlantillaTema,
  type SeccionMapa,
} from "@/lib/mapa";
import type { MedioBiblioteca } from "@/lib/editor/archivos";

type Props = { plantillas: Record<ArchivoMapa, PlantillaTema>; esquema: Esquema; biblioteca: MedioBiblioteca[] };
type Ruta = { s: number; b: number | null };
type EstadoPublicar = { corriendo: boolean; ok: boolean | null; peso: string | null; direccion: string | null; ultimas: string[] };

const copia = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

/** La foto que corresponde a un encuadre: focal → image, focal_before → image_before… */
function fotoDelEncuadre(clave: string, ajustes: Record<string, unknown>): string {
  const foto = clave === "focal" ? ajustes.image : ajustes[clave.replace("focal_", "image_")];
  return typeof foto === "string" ? foto : "";
}

// ───────────────────────── Biblioteca de fotos y videos ─────────────────────────

function Biblioteca({
  medios,
  soloVideos,
  alElegir,
  alCerrar,
  alSubir,
}: {
  medios: MedioBiblioteca[];
  soloVideos: boolean;
  alElegir: (src: string) => void;
  alCerrar: () => void;
  alSubir: (m: MedioBiblioteca) => void;
}) {
  const [filtro, setFiltro] = useState("");
  const [subiendo, setSubiendo] = useState("");
  const lista = medios.filter((m) => m.video === soloVideos && m.nombre.toLowerCase().includes(filtro.toLowerCase())).slice(0, 240);

  async function subir(archivos: FileList | null) {
    if (!archivos?.length) return;
    for (const archivo of archivos) {
      setSubiendo(`Subiendo ${archivo.name}…`);
      const datos = new FormData();
      datos.append("archivo", archivo);
      const r = await fetch("/editor/api/subir", { method: "POST", body: datos });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; src?: string; nombre?: string; video?: boolean; mensaje?: string };
      if (!j.ok || !j.src) {
        setSubiendo(j.mensaje ?? "No se pudo subir.");
        return;
      }
      alSubir({ src: j.src, carpeta: "editor", nombre: j.nombre ?? "", video: Boolean(j.video), fecha: Date.now() });
      if (archivos.length === 1) alElegir(j.src);
    }
    setSubiendo("");
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Elegir foto" className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <div className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-wrap items-center gap-2 border-b border-linea p-3">
          <strong className="mr-auto text-[17px]">{soloVideos ? "Elegir video" : "Elegir foto"}</strong>
          <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar por nombre…" className="h-10 w-56 rounded-lg border border-linea px-3" />
          <label className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-marino px-4 font-semibold text-white">
            Subir desde la computadora
            <input type="file" accept={soloVideos ? "video/mp4" : "image/jpeg,image/png,image/webp"} multiple className="sr-only" onChange={(e) => subir(e.target.files)} />
          </label>
          <button type="button" onClick={alCerrar} className="h-10 cursor-pointer rounded-lg border border-linea px-4">
            Cerrar
          </button>
        </div>
        {subiendo && <p className="m-0 bg-[#fdf1dd] px-4 py-2 text-[14px] font-semibold">{subiendo}</p>}
        <p className="m-0 px-4 pt-2 text-[13px] text-texto-suave">Lo que subas queda público en la página: nada de datos de clientes.</p>
        <ul className="m-0 grid list-none grid-cols-3 gap-2 overflow-y-auto p-3 sm:grid-cols-4 lg:grid-cols-6">
          {lista.map((m) => (
            <li key={m.src}>
              <button type="button" onClick={() => alElegir(m.src)} className="block w-full cursor-pointer overflow-hidden rounded-lg border-2 border-transparent text-left hover:border-marino">
                {m.video ? (
                  <video src={m.src} muted preload="metadata" className="aspect-square w-full bg-tinta object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.src} alt="" loading="lazy" className="aspect-square w-full bg-niebla object-cover" />
                )}
                <span className="block truncate px-1 py-0.5 text-[11px] text-texto-suave">
                  {m.carpeta === "editor" ? "● " : ""}
                  {m.nombre}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ───────────────────────── Encuadre (el punto de la foto que nunca se corta) ─────────────────────────

function Encuadre({ foto, valor, alCambiar }: { foto: string; valor: unknown; alCambiar: (v: string) => void }) {
  const { x, y } = leerFocal(valor);
  if (!foto) return <p className="m-0 text-[13px] text-texto-suave">Primero elige la foto.</p>;
  return (
    <div className="grid max-w-[560px] grid-cols-[minmax(0,1fr)_120px] items-start gap-3">
      <div
        className="relative w-fit cursor-crosshair overflow-hidden rounded-lg"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          alCambiar(`${Math.round(((e.clientX - r.left) / r.width) * 100)}% ${Math.round(((e.clientY - r.top) / r.height) * 100)}%`);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} alt="" className="block max-h-[360px] w-auto max-w-full" draggable={false} />
        <span className="pointer-events-none absolute size-7 -translate-1/2 rounded-full border-[3px] border-white bg-[#e11d48]/70 shadow-[0_0_0_2px_#e11d48]" style={{ left: `${x}%`, top: `${y}%` }} />
      </div>
      <div>
        <p className="m-0 mb-1 text-[12px] text-texto-suave">Así queda en el celular (4:3):</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} alt="" className="aspect-[4/3] w-full rounded-md object-cover" style={{ objectPosition: `${x}% ${y}%` }} />
        <p className="m-0 mt-1 text-[12px] text-texto-suave">Toca en la foto el punto importante.</p>
      </div>
    </div>
  );
}

// ───────────────────────── Un campo ─────────────────────────

function Campo({
  campo,
  ajustes,
  alCambiar,
  alPedirMedio,
}: {
  campo: CampoMapa;
  ajustes: Record<string, unknown>;
  alCambiar: (v: unknown) => void;
  alPedirMedio: (video: boolean) => void;
}) {
  const id = `campo-${campo.codigo}`;
  const valor = campo.valor;
  let control: React.ReactNode;
  if (campo.tipo === "imagen" || campo.tipo === "video") {
    const src = typeof valor === "string" ? valor : "";
    control = (
      <div className="flex items-center gap-3">
        {src ? (
          campo.tipo === "video" ? (
            <video src={src} muted className="size-20 rounded-lg bg-tinta object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-20 rounded-lg bg-niebla object-cover" />
          )
        ) : (
          <span className="flex size-20 items-center justify-center rounded-lg bg-niebla text-[12px] text-texto-suave">Sin foto</span>
        )}
        <div className="min-w-0">
          <p className="m-0 truncate text-[13px] text-texto-suave">{campo.resumen}</p>
          <button type="button" onClick={() => alPedirMedio(campo.tipo === "video")} className="mt-1 h-9 cursor-pointer rounded-lg bg-marino px-3 text-[14px] font-semibold text-white">
            {campo.tipo === "video" ? "Cambiar video" : "Cambiar foto"}
          </button>
        </div>
      </div>
    );
  } else if (campo.tipo === "focal") {
    control = <Encuadre foto={fotoDelEncuadre(campo.clave, ajustes)} valor={valor} alCambiar={alCambiar} />;
  } else if (campo.tipo === "siNo") {
    control = <input id={id} type="checkbox" checked={valor === true} onChange={(e) => alCambiar(e.target.checked)} className="size-5" />;
  } else if (campo.tipo === "numero") {
    control = <input id={id} type="number" value={typeof valor === "number" ? valor : ""} onChange={(e) => alCambiar(Number(e.target.value))} className="h-10 w-32 rounded-lg border border-linea px-3" />;
  } else if (campo.tipo === "html" || campo.tipo === "textoLargo") {
    control = (
      <textarea id={id} value={typeof valor === "string" ? valor : ""} onChange={(e) => alCambiar(e.target.value)} rows={campo.tipo === "html" ? 4 : 3} className="w-full rounded-lg border border-linea p-2 text-[14px] leading-snug" />
    );
  } else {
    control = <input id={id} value={typeof valor === "string" ? valor : String(valor ?? "")} onChange={(e) => alCambiar(e.target.value)} className="h-10 w-full rounded-lg border border-linea px-3 text-[14px]" />;
  }
  return (
    <div className="py-2">
      <label htmlFor={id} className="mb-1 flex items-baseline gap-2 text-[13px]">
        <code className="rounded bg-[#e11d48] px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">{campo.codigo}</code>
        <span className="font-semibold">{campo.etiqueta}</span>
        {campo.tipo === "html" && <span className="text-texto-suave">(con formato: &lt;p&gt;, &lt;strong&gt;…)</span>}
      </label>
      {control}
    </div>
  );
}

// ───────────────────────── Editor ─────────────────────────

export function Editor({ plantillas, esquema, biblioteca }: Props) {
  const archivos = Object.keys(PAGINAS_MAPA) as ArchivoMapa[];
  const [archivo, setArchivo] = useState<ArchivoMapa>("product.b1");
  const [borradores, setBorradores] = useState(() => copia(plantillas));
  const [guardadas, setGuardadas] = useState(() => copia(plantillas));
  const [medios, setMedios] = useState(biblioteca);
  const [abierta, setAbierta] = useState<number | null>(1);
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());
  const [pedido, setPedido] = useState<{ ruta: Ruta; clave: string; video: boolean; nuevo?: boolean } | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [vista, setVista] = useState(0);
  const [conMapa, setConMapa] = useState(true);
  const [publicacion, setPublicacion] = useState<EstadoPublicar | null>(null);
  const arrastrado = useRef<{ s: number; b: number } | null>(null);

  const plantilla = borradores[archivo];
  const mapa = useMemo(() => mapaPlantilla(archivo, plantilla, esquema), [archivo, plantilla, esquema]);
  const pendientes = archivos.filter((a) => JSON.stringify(borradores[a]) !== JSON.stringify(guardadas[a]));

  // Aviso si se cierra la pestaña con cambios sin guardar.
  useEffect(() => {
    const avisar = (e: BeforeUnloadEvent) => {
      if (pendientes.length) e.preventDefault();
    };
    addEventListener("beforeunload", avisar);
    return () => removeEventListener("beforeunload", avisar);
  }, [pendientes.length]);

  function cambiar(fn: (p: PlantillaTema) => void) {
    setBorradores((todo) => {
      const nueva = copia(todo[archivo]);
      fn(nueva);
      return { ...todo, [archivo]: nueva };
    });
  }

  function ponerValor(ruta: Ruta, clave: string, valor: unknown) {
    cambiar((p) => {
      const s = p.secciones[ruta.s];
      const destino = ruta.b === null ? s.ajustes : s.bloques[ruta.b].ajustes;
      destino[clave] = valor;
    });
  }

  function moverBloque(s: number, de: number, a: number) {
    cambiar((p) => {
      const lista = p.secciones[s].bloques;
      if (a < 0 || a >= lista.length) return;
      const [pieza] = lista.splice(de, 1);
      lista.splice(a, 0, pieza);
    });
  }

  function duplicarBloque(s: number, b: number) {
    cambiar((p) => {
      const lista = p.secciones[s].bloques;
      const nueva = copia(lista[b]);
      nueva.id = `${nueva.tipo}_${Date.now().toString(36)}`;
      lista.splice(b + 1, 0, nueva);
    });
  }

  function quitarBloque(s: number, b: number) {
    if (!confirm("¿Quitar esta pieza? (Se puede deshacer con «Descartar cambios» mientras no guardes.)")) return;
    cambiar((p) => {
      p.secciones[s].bloques.splice(b, 1);
    });
  }

  /** «Agregar foto»: una pieza de foto nueva justo después de la última foto de la sección. */
  function agregarFoto(s: number, src: string) {
    cambiar((p) => {
      const lista = p.secciones[s].bloques;
      const ultima = lista.map((b) => b.tipo).lastIndexOf("image");
      lista.splice(ultima + 1, 0, { id: `image_${Date.now().toString(36)}`, tipo: "image", ajustes: { image: src, alt: "Compuerta Anti-Inundaciones", focal: "50% 50%" } });
    });
  }

  async function guardar() {
    setGuardando(true);
    setMensaje("Guardando…");
    try {
      for (const a of pendientes) {
        const r = await fetch("/editor/api/guardar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ archivo: a, plantilla: borradores[a] }) });
        const j = (await r.json().catch(() => ({}))) as { ok?: boolean; mensaje?: string };
        if (!j.ok) {
          setMensaje(`No se guardó ${PAGINAS_MAPA[a].nombre}: ${j.mensaje ?? r.statusText}`);
          return;
        }
        setGuardadas((g) => ({ ...g, [a]: copia(borradores[a]) }));
        setMensaje(`${PAGINAS_MAPA[a].nombre}: ${j.mensaje}`);
      }
      setVista((v) => v + 1);
    } finally {
      setGuardando(false);
    }
  }

  async function publicar() {
    if (pendientes.length && !confirm("Hay cambios sin guardar; se publica lo guardado. ¿Seguir?")) return;
    const r = await fetch("/editor/api/publicar", { method: "POST" });
    if (!r.ok) {
      setMensaje(((await r.json().catch(() => ({}))) as { mensaje?: string }).mensaje ?? "No se pudo publicar.");
      return;
    }
    setPublicacion({ corriendo: true, ok: null, peso: null, direccion: null, ultimas: ["Empezando…"] });
  }

  // Mientras se publica, pregunta cada 4 s cómo va.
  useEffect(() => {
    if (!publicacion?.corriendo) return;
    const t = setInterval(async () => {
      const r = await fetch("/editor/api/publicar");
      if (r.ok) setPublicacion((await r.json()) as EstadoPublicar);
    }, 4000);
    return () => clearInterval(t);
  }, [publicacion?.corriendo]);

  const seccion: SeccionMapa | null = abierta === null ? null : mapa[abierta] ?? null;
  const ruta = PAGINAS_MAPA[archivo].ruta;

  return (
    <div className="flex h-dvh flex-col">
      {/* Barra de arriba */}
      <header className="flex flex-wrap items-center gap-2 border-b border-linea bg-white px-4 py-2.5">
        <strong className="mr-2 text-[17px] text-marino">Editor · B1</strong>
        <div className="flex rounded-lg bg-niebla p-1">
          {archivos.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setArchivo(a);
                setAbierta(null);
              }}
              className={`h-9 cursor-pointer rounded-md px-3 text-[14px] font-semibold ${a === archivo ? "bg-white text-marino shadow" : "text-texto-suave"}`}
            >
              {PAGINAS_MAPA[a].nombre}
              {pendientes.includes(a) ? " •" : ""}
            </button>
          ))}
        </div>
        <span className="min-w-0 flex-1 truncate text-[14px] text-texto-suave">{mensaje}</span>
        <button
          type="button"
          disabled={!pendientes.length || guardando}
          onClick={() => setBorradores(copia(guardadas))}
          className="h-10 cursor-pointer rounded-lg border border-linea bg-white px-3 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Descartar cambios
        </button>
        <button type="button" disabled={!pendientes.length || guardando} onClick={guardar} className="h-10 cursor-pointer rounded-lg bg-marino px-4 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {guardando ? "Guardando…" : pendientes.length ? "Guardar" : "Todo guardado"}
        </button>
        <button type="button" disabled={publicacion?.corriendo} onClick={publicar} className="h-10 cursor-pointer rounded-lg bg-boton px-4 text-[14px] font-bold text-white disabled:cursor-wait disabled:opacity-60">
          {publicacion?.corriendo ? "Publicando…" : "Publicar en la prueba"}
        </button>
      </header>

      {publicacion && (
        <div className={`border-b px-4 py-2 text-[13px] ${publicacion.ok === false ? "bg-[#fde8e8]" : publicacion.ok ? "bg-[#e6f6ea]" : "bg-[#fdf1dd]"}`}>
          <strong>
            {publicacion.corriendo ? "Publicando la copia de prueba (unos minutos)…" : publicacion.ok ? "Publicado." : "La publicación falló."}
          </strong>{" "}
          {publicacion.peso && <>Peso: {publicacion.peso} de 3 MB. </>}
          {publicacion.direccion && !publicacion.corriendo && (
            <a href={`${publicacion.direccion}${ruta}`} target="_blank" rel="noreferrer" className="font-semibold text-marino underline">
              Abrir
            </a>
          )}
          <span className="block truncate font-mono text-[12px] text-texto-suave">{publicacion.ultimas.at(-1)}</span>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_430px]">
        {/* Partes de la página */}
        <main className="min-h-0 overflow-y-auto p-4">
          <p className="m-0 mb-3 text-[14px] text-texto-suave">
            Cada parte tiene su nombre del mapa. Toca una para ver sus textos, fotos y piezas. Los cambios se ven en la vista de la derecha al guardar.
          </p>
          <ul className="m-0 grid list-none gap-2 p-0">
            {mapa.map((s, i) => (
              <li key={s.id} className="rounded-xl border border-linea bg-white">
                <button type="button" onClick={() => setAbierta(abierta === i ? null : i)} className="flex w-full cursor-pointer items-center gap-2 px-3 py-3 text-left">
                  <code className="rounded bg-[#e11d48] px-2 py-1 font-mono text-[13px] font-bold text-white">{s.codigo}</code>
                  <strong className="flex-1 text-[15px]">{s.etiqueta}</strong>
                  <span className="text-[13px] text-texto-suave">{s.bloques.length ? `${s.bloques.length} piezas` : ""}</span>
                  <span aria-hidden="true">{abierta === i ? "▴" : "▾"}</span>
                </button>

                {seccion && abierta === i && (
                  <div className="border-t border-linea px-3 pb-3">
                    {seccion.campos.filter((c) => !c.diseno).map((c) => (
                      <Campo
                        key={c.codigo}
                        campo={c}
                        ajustes={plantilla.secciones[i].ajustes}
                        alCambiar={(v) => ponerValor({ s: i, b: null }, c.clave, v)}
                        alPedirMedio={(video) => setPedido({ ruta: { s: i, b: null }, clave: c.clave, video })}
                      />
                    ))}

                    {seccion.bloques.length > 0 && (
                      <div className="mt-2">
                        <div className="mb-1 flex items-center gap-2">
                          <strong className="flex-1 text-[14px]">Piezas (arrástralas o usa ▲ ▼ para cambiar el orden)</strong>
                          {seccion.bloques.some((b) => b.tipo === "image") && (
                            <button type="button" onClick={() => setPedido({ ruta: { s: i, b: null }, clave: "image", video: false, nuevo: true })} className="h-9 cursor-pointer rounded-lg bg-marino px-3 text-[13px] font-semibold text-white">
                              + Agregar foto
                            </button>
                          )}
                        </div>
                        <ul className="m-0 grid list-none gap-1.5 p-0">
                          {seccion.bloques.map((b) => {
                            const ajustes = plantilla.secciones[i].bloques[b.indice].ajustes;
                            const foto = [ajustes.image, ajustes.image_after, ajustes.poster].find((x) => typeof x === "string" && x) as string | undefined;
                            const llave = `${archivo}:${b.codigo}`;
                            const abiertoB = abiertos.has(llave);
                            return (
                              <li
                                key={plantilla.secciones[i].bloques[b.indice].id}
                                draggable
                                onDragStart={() => (arrastrado.current = { s: i, b: b.indice })}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (arrastrado.current && arrastrado.current.s === i) moverBloque(i, arrastrado.current.b, b.indice);
                                  arrastrado.current = null;
                                }}
                                className="rounded-lg border border-linea bg-niebla"
                              >
                                <div className="flex items-center gap-2 p-1.5">
                                  <span aria-hidden="true" className="cursor-grab px-1 text-texto-suave">⋮⋮</span>
                                  {foto ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={foto} alt="" className="size-11 rounded-md object-cover" />
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAbiertos((x) => {
                                        const n = new Set(x);
                                        if (n.has(llave)) n.delete(llave);
                                        else n.add(llave);
                                        return n;
                                      })
                                    }
                                    className="min-w-0 flex-1 cursor-pointer text-left"
                                  >
                                    <code className="font-mono text-[12px] font-bold text-[#e11d48]">{b.codigo}</code> <span className="text-[13px] font-semibold">{b.etiqueta}</span>
                                    <span className="block truncate text-[12px] text-texto-suave">{b.campos.find((c) => c.tipo !== "focal")?.resumen}</span>
                                  </button>
                                  <button type="button" aria-label="Subir" onClick={() => moverBloque(i, b.indice, b.indice - 1)} className="size-8 cursor-pointer rounded-md bg-white">▲</button>
                                  <button type="button" aria-label="Bajar" onClick={() => moverBloque(i, b.indice, b.indice + 1)} className="size-8 cursor-pointer rounded-md bg-white">▼</button>
                                  <button type="button" onClick={() => duplicarBloque(i, b.indice)} className="h-8 cursor-pointer rounded-md bg-white px-2 text-[12px]">Duplicar</button>
                                  <button type="button" onClick={() => quitarBloque(i, b.indice)} className="h-8 cursor-pointer rounded-md bg-white px-2 text-[12px] text-[#b42318]">Quitar</button>
                                </div>
                                {abiertoB && (
                                  <div className="border-t border-linea bg-white px-3">
                                    {b.campos.map((c) => (
                                      <Campo
                                        key={c.codigo}
                                        campo={c}
                                        ajustes={ajustes}
                                        alCambiar={(v) => ponerValor({ s: i, b: b.indice }, c.clave, v)}
                                        alPedirMedio={(video) => setPedido({ ruta: { s: i, b: b.indice }, clave: c.clave, video })}
                                      />
                                    ))}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {seccion.campos.some((c) => c.diseno) && (
                      <details className="mt-2">
                        <summary className="cursor-pointer py-2 text-[14px] font-semibold text-texto-suave">Diseño (colores, tamaños…)</summary>
                        {seccion.campos.filter((c) => c.diseno).map((c) => (
                          <Campo
                            key={c.codigo}
                            campo={c}
                            ajustes={plantilla.secciones[i].ajustes}
                            alCambiar={(v) => ponerValor({ s: i, b: null }, c.clave, v)}
                            alPedirMedio={(video) => setPedido({ ruta: { s: i, b: null }, clave: c.clave, video })}
                          />
                        ))}
                      </details>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </main>

        {/* Vista de celular */}
        <aside className="hidden min-h-0 flex-col items-center gap-2 border-l border-linea bg-white p-3 lg:flex">
          <div className="flex w-full items-center gap-2 text-[13px]">
            <strong className="flex-1">Vista de celular (lo guardado)</strong>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={conMapa} onChange={(e) => setConMapa(e.target.checked)} /> Con mapa
            </label>
            <button type="button" onClick={() => setVista((v) => v + 1)} className="h-8 cursor-pointer rounded-md border border-linea px-2">
              Recargar
            </button>
          </div>
          <div className="min-h-0 w-[390px] flex-1 overflow-hidden rounded-[28px] border-[8px] border-tinta">
            <iframe key={`${archivo}-${vista}-${conMapa}`} title="Vista de celular" src={`${ruta}${conMapa ? "?mapa" : ""}`} className="size-full bg-white" />
          </div>
        </aside>
      </div>

      {pedido && (
        <Biblioteca
          medios={medios}
          soloVideos={pedido.video}
          alSubir={(m) => setMedios((x) => [m, ...x])}
          alCerrar={() => setPedido(null)}
          alElegir={(src) => {
            if (pedido.nuevo) agregarFoto(pedido.ruta.s, src);
            else ponerValor(pedido.ruta, pedido.clave, src);
            setPedido(null);
          }}
        />
      )}
    </div>
  );
}
