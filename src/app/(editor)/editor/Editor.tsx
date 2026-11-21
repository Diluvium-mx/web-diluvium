"use client";

// Editor local de las versiones (/editor), «B · directo en la página» (elegido por el dueño el 21-nov-2026).
//
// Fotos: se toca cualquier foto o video en la página de en medio y ahí mismo, dentro de su marco rojo, se arrastra
// para acomodarla, se acerca, se cambia (biblioteca o subir desde la computadora), se quita, se agrega otra o se mueve
// de lugar. Cada ajuste se ve al momento en la página. Textos: pestaña aparte con los textos de cada parte.
// «Guardar» escribe la plantilla (contenido/tema/), la pasa al administrador y deja respaldo; «Publicar» sube la copia
// de prueba a Cloudflare. Cada foto sabe de qué campo es por su marca data-editar="sección|pieza|campo" (mapa.ts).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clavesEncuadre,
  estiloFoto,
  leerFocal,
  mapaPlantilla,
  PAGINAS_MAPA,
  type Ajustes,
  type ArchivoMapa,
  type CampoMapa,
  type Esquema,
  type PlantillaTema,
} from "@/lib/mapa";
import type { MedioBiblioteca } from "@/lib/editor/archivos";
import { MapaElementos, precargarNumeros } from "./MapaElementos";

type Props = { plantillas: Record<ArchivoMapa, PlantillaTema>; esquema: Esquema; biblioteca: MedioBiblioteca[] };
type Seleccion = { seccionId: string; piezaId: string; clave: string };
type Caja = { top: number; left: number; width: number; height: number };
type EstadoPublicar = { corriendo: boolean; ok: boolean | null; peso: string | null; direccion: string | null; ultimas: string[] };

const copia = <T,>(x: T): T => structuredClone(x);
const marca = (s: Seleccion) => `${s.seccionId}|${s.piezaId}|${s.clave}`;
const leerMarca = (m: string): Seleccion => {
  const [seccionId, piezaId, clave] = m.split("|");
  return { seccionId, piezaId, clave };
};

/** Dónde está una foto dentro de la plantilla: índice de sección y de pieza (null = foto de la sección). */
function ubicar(p: PlantillaTema, sel: Seleccion): { s: number; b: number | null; ajustes: Ajustes } | null {
  const s = p.secciones.findIndex((x) => x.id === sel.seccionId);
  if (s < 0) return null;
  if (!sel.piezaId) return { s, b: null, ajustes: p.secciones[s].ajustes };
  const b = p.secciones[s].bloques.findIndex((x) => x.id === sel.piezaId);
  return b < 0 ? null : { s, b, ajustes: p.secciones[s].bloques[b].ajustes };
}

// ───────────────────────── Biblioteca de fotos y videos ─────────────────────────

function Biblioteca({
  medios,
  soloVideos,
  soloResenas,
  alElegir,
  alCerrar,
  alSubir,
}: {
  medios: MedioBiblioteca[];
  soloVideos: boolean;
  soloResenas: boolean;
  alElegir: (src: string) => void;
  alCerrar: () => void;
  alSubir: (m: MedioBiblioteca) => void;
}) {
  const [filtro, setFiltro] = useState("");
  const [aviso, setAviso] = useState("");
  const lista = medios
    .filter((m) => m.video === soloVideos && (soloResenas ? m.carpeta === "resenas" : m.carpeta !== "resenas"))
    .filter((m) => m.nombre.toLowerCase().includes(filtro.toLowerCase()))
    .slice(0, 300);

  async function subir(archivos: FileList | null) {
    if (!archivos?.length) return;
    for (const archivo of archivos) {
      setAviso(`Subiendo ${archivo.name}…`);
      const datos = new FormData();
      datos.append("archivo", archivo);
      const r = await fetch("/editor/api/subir", { method: "POST", body: datos });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; src?: string; nombre?: string; video?: boolean; mensaje?: string };
      if (!j.ok || !j.src) {
        setAviso(j.mensaje ?? "No se pudo subir.");
        return;
      }
      alSubir({ src: j.src, carpeta: "editor", nombre: j.nombre ?? "", video: Boolean(j.video), fecha: Date.now() });
      if (archivos.length === 1) alElegir(j.src);
    }
    setAviso("");
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Elegir foto" className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <div className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-wrap items-center gap-2 border-b border-linea p-3">
          <strong className="mr-auto text-[17px]">{soloVideos ? "Elegir video" : soloResenas ? "Elegir foto de una reseña publicada" : "Elegir foto"}</strong>
          <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar por nombre…" className="h-10 w-56 rounded-lg border border-linea px-3" />
          {!soloResenas && (
            <label className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-marino px-4 font-semibold text-white">
              Subir desde la computadora
              <input type="file" accept={soloVideos ? "video/mp4" : "image/jpeg,image/png,image/webp"} multiple className="sr-only" onChange={(e) => subir(e.target.files)} />
            </label>
          )}
          <button type="button" onClick={alCerrar} className="h-10 cursor-pointer rounded-lg border border-linea px-4">
            Cerrar
          </button>
        </div>
        {aviso && <p className="m-0 bg-[#fdf1dd] px-4 py-2 text-[14px] font-semibold">{aviso}</p>}
        <p className="m-0 px-4 pt-2 text-[13px] text-texto-suave">
          {soloResenas ? "El muro solo muestra reseñas publicadas: elige la foto de otra reseña." : "Lo que subas queda público en la página: nada de datos de clientes."}
        </p>
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

// ───────────────────────── Un campo de texto (pestaña Textos) ─────────────────────────

function Campo({ campo, alCambiar }: { campo: CampoMapa; alCambiar: (v: unknown) => void }) {
  const id = `campo-${campo.codigo}`;
  const valor = campo.valor;
  let control: React.ReactNode;
  if (campo.tipo === "siNo") {
    control = <input id={id} type="checkbox" checked={valor === true} onChange={(e) => alCambiar(e.target.checked)} className="size-5" />;
  } else if (campo.tipo === "numero") {
    control = <input id={id} type="number" value={typeof valor === "number" ? valor : ""} onChange={(e) => alCambiar(Number(e.target.value))} className="h-10 w-32 rounded-lg border border-linea px-3" />;
  } else if (campo.tipo === "html" || campo.tipo === "textoLargo") {
    control = <textarea id={id} value={typeof valor === "string" ? valor : ""} onChange={(e) => alCambiar(e.target.value)} rows={campo.tipo === "html" ? 4 : 3} className="w-full rounded-lg border border-linea p-2 text-[14px] leading-snug" />;
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

const ES_DE_FOTO = new Set(["imagen", "video", "focal", "zoom"]);

/** Controles de la página (botones, enlaces, la línea del antes y después…): en Fotos siguen funcionando. */
const CONTROLES = "a,button,[role=button],[role=slider],[role=tab],input,select,textarea,label,summary";
const area = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width * r.height;
};

// ───────────────────────── Editor ─────────────────────────

export function Editor({ plantillas, esquema, biblioteca }: Props) {
  const archivos = Object.keys(PAGINAS_MAPA) as ArchivoMapa[];
  const [archivo, setArchivo] = useState<ArchivoMapa>("product.b1");
  const [modo, setModo] = useState<"fotos" | "mapa" | "textos">("fotos");
  const [borradores, setBorradores] = useState(() => copia(plantillas));
  const [guardadas, setGuardadas] = useState(() => copia(plantillas));
  const [medios, setMedios] = useState(biblioteca);
  const [sel, setSel] = useState<Seleccion | null>(null);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [pedido, setPedido] = useState<{ agregar: boolean } | null>(null);
  const [abierta, setAbierta] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  // La página de en medio es una sola para Fotos, Mapa y Textos: cambiar de pestaña no la vuelve a cargar.
  // «carga» cambia solo al elegir Portada/Producto, al guardar o al descartar (vuelve a cargar la página).
  const [carga, setCarga] = useState<{ ruta: string; n: number }>({ ruta: PAGINAS_MAPA["product.b1"].ruta, n: 0 });
  const [cargada, setCargada] = useState(0);
  // Dirección de la página de en medio cuando no es una de B1 (se llegó por un enlace): sin fotos ni números.
  const [fuera, setFuera] = useState<string | null>(null);
  const [capa, setCapa] = useState<HTMLDivElement | null>(null);
  const [publicacion, setPublicacion] = useState<EstadoPublicar | null>(null);
  const marco = useRef<HTMLIFrameElement>(null);
  const arrastre = useRef<{ px: number; py: number; x: number; y: number; ox: number; oy: number } | null>(null);

  const plantilla = borradores[archivo];
  const mapa = useMemo(() => mapaPlantilla(archivo, plantilla, esquema), [archivo, plantilla, esquema]);
  const pendientes = archivos.filter((a) => JSON.stringify(borradores[a]) !== JSON.stringify(guardadas[a]));
  const doc = () => marco.current?.contentDocument ?? null;
  const elementoSel = useCallback(() => (sel ? (doc()?.querySelector<HTMLElement>(`[data-editar="${CSS.escape(marca(sel))}"]`) ?? null) : null), [sel]);

  // Aviso si se cierra la pestaña con cambios sin guardar.
  useEffect(() => {
    const avisar = (e: BeforeUnloadEvent) => {
      if (pendientes.length) e.preventDefault();
    };
    addEventListener("beforeunload", avisar);
    return () => removeEventListener("beforeunload", avisar);
  }, [pendientes.length]);

  /** Vuelve a cargar la página de en medio (la de la pestaña elegida). */
  const recargar = (a: ArchivoMapa = archivo) => {
    setFuera(null);
    setCarga((c) => ({ ruta: PAGINAS_MAPA[a].ruta, n: c.n + 1 }));
  };

  // Al abrir el editor: los números del Mapa y las dos páginas quedan listos (la primera vez tardan en prepararse).
  useEffect(() => {
    for (const a of archivos) {
      void precargarNumeros(a);
      fetch(PAGINAS_MAPA[a].ruta, { cache: "no-store" }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ¿Qué página se ve en medio? Si un enlace llevó a la otra de B1, cambia la pestaña; si es otra, lo avisa. */
  const revisarDireccion = useCallback(() => {
    let ruta: string | null = null;
    try {
      ruta = marco.current?.contentWindow?.location.pathname ?? null;
    } catch {
      ruta = null;
    }
    if (ruta === "about:blank" || ruta === "blank") return;
    const de = (Object.keys(PAGINAS_MAPA) as ArchivoMapa[]).find((a) => PAGINAS_MAPA[a].ruta === ruta);
    if (de) {
      setFuera(null);
      if (de !== archivo) {
        setArchivo(de);
        setSel(null);
        setAbierta(null);
      }
    } else setFuera(ruta ?? "otra página");
  }, [archivo]);

  // Los enlaces que cambian de página sin recargar (los del menú) también se notan.
  useEffect(() => {
    const t = setInterval(revisarDireccion, 700);
    return () => clearInterval(t);
  }, [revisarDireccion]);

  function cambiar(fn: (p: PlantillaTema) => void) {
    setBorradores((todo) => {
      const nueva = copia(todo[archivo]);
      fn(nueva);
      return { ...todo, [archivo]: nueva };
    });
  }

  function ponerEnSel(cambios: Ajustes) {
    if (!sel) return;
    cambiar((p) => {
      const u = ubicar(p, sel);
      if (u) Object.assign(u.ajustes, cambios);
    });
  }

  // ── Lo que se ajusta se ve al momento en la página de en medio ──
  useEffect(() => {
    const d = doc();
    if (!d || modo !== "fotos" || fuera) return;
    for (const el of d.querySelectorAll<HTMLImageElement | HTMLVideoElement>("[data-editar]")) {
      const s = leerMarca(el.dataset.editar ?? "");
      const ahora = ubicar(plantilla, s);
      const antes = ubicar(guardadas[archivo], s);
      if (!ahora) {
        // Quitada (se va al guardar).
        el.style.opacity = "0.15";
        continue;
      }
      const estilo = estiloFoto(ahora.ajustes, s.clave) ?? {};
      el.style.objectPosition = String(estilo.objectPosition ?? "");
      el.style.transform = String(estilo.transform ?? "");
      el.style.transformOrigin = String(estilo.transformOrigin ?? "");
      el.style.opacity = "";
      const src = ahora.ajustes[s.clave];
      if (typeof src === "string" && antes && src !== antes.ajustes[s.clave] && el.getAttribute("data-src-nueva") !== src) {
        el.setAttribute("data-src-nueva", src);
        if (el instanceof HTMLImageElement) el.srcset = "";
        el.src = src;
      }
    }
  }, [plantilla, guardadas, archivo, cargada, modo, fuera]);

  // ── Tocar una foto en la página la elige. Los botones y enlaces chicos encima de una foto (flechas de la galería,
  //    la línea del antes y después) y todos los demás siguen funcionando y llevan a su página, como en la real ──
  useEffect(() => {
    const d = doc();
    if (!d || modo !== "fotos" || fuera) return;
    const alTocar = (e: MouseEvent) => {
      const marcada = d.elementsFromPoint(e.clientX, e.clientY).find((x) => (x as HTMLElement).dataset?.editar) as HTMLElement | undefined;
      if (!marcada) return;
      const control = (e.target as Element | null)?.closest?.(CONTROLES);
      // Un botón chico encima de la foto funciona; uno que la cubre toda (el del video) o que la envuelve, la elige.
      if (control && !control.contains(marcada) && area(control) < area(marcada) * 0.6) return;
      e.preventDefault();
      e.stopPropagation();
      setSel(leerMarca(marcada.dataset.editar ?? ""));
    };
    d.addEventListener("click", alTocar, true);
    return () => d.removeEventListener("click", alTocar, true);
  }, [cargada, modo, fuera]);

  // ── El marco rojo sigue a la foto aunque se baje la página o se deslice la galería ──
  useEffect(() => {
    if (!sel || modo !== "fotos") return;
    let cuadro = 0;
    let previa = "";
    const seguir = () => {
      const el = elementoSel();
      const marcoFoto = el?.parentElement?.closest<HTMLElement>(".overflow-hidden") ?? el;
      if (marcoFoto) {
        const r = marcoFoto.getBoundingClientRect();
        const nueva = `${Math.round(r.top)},${Math.round(r.left)},${Math.round(r.width)},${Math.round(r.height)}`;
        if (nueva !== previa) {
          previa = nueva;
          setCaja({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      } else if (previa !== "-") {
        previa = "-";
        setCaja(null);
      }
      cuadro = requestAnimationFrame(seguir);
    };
    cuadro = requestAnimationFrame(seguir);
    return () => cancelAnimationFrame(cuadro);
  }, [sel, modo, elementoSel, cargada]);

  const u = sel ? ubicar(plantilla, sel) : null;
  const claves = sel ? clavesEncuadre(sel.clave) : null;
  const focal = u && claves ? leerFocal(u.ajustes[claves.focal]) : { x: 50, y: 50 };
  const zoom = u && claves && typeof u.ajustes[claves.zoom] === "number" ? (u.ajustes[claves.zoom] as number) : 1;
  const seccionSel = u ? mapa[u.s] : null;
  const piezaSel = u && u.b !== null && seccionSel ? seccionSel.bloques[u.b] : null;
  const campoSel = sel && seccionSel ? (piezaSel ?? seccionSel).campos.find((c) => c.clave === sel.clave) : null;
  const esPieza = Boolean(u && u.b !== null);
  const tipoPieza = u && u.b !== null ? plantilla.secciones[u.s].bloques[u.b].tipo : null;
  const esVideo = sel?.clave === "video";

  /** Cuánto se mueve el encuadre al arrastrar: lo que la foto sobra fuera de su marco (en px). */
  function sobrante(): { ox: number; oy: number } {
    const el = elementoSel();
    if (!el || !caja) return { ox: 1, oy: 1 };
    const nw = el instanceof HTMLVideoElement ? el.videoWidth : (el as HTMLImageElement).naturalWidth;
    const nh = el instanceof HTMLVideoElement ? el.videoHeight : (el as HTMLImageElement).naturalHeight;
    if (!nw || !nh) return { ox: caja.width * 0.5, oy: caja.height * 0.5 };
    const escala = Math.max(caja.width / nw, caja.height / nh);
    return {
      ox: (nw * escala - caja.width) * zoom + caja.width * (zoom - 1),
      oy: (nh * escala - caja.height) * zoom + caja.height * (zoom - 1),
    };
  }

  function moverPieza(dir: -1 | 1) {
    if (!u || u.b === null) return;
    cambiar((p) => {
      const lista = p.secciones[u.s].bloques;
      const tipo = lista[u.b!].tipo;
      let j = u.b! + dir;
      while (j >= 0 && j < lista.length && lista[j].tipo !== tipo) j += dir;
      if (j < 0 || j >= lista.length) return;
      [lista[u.b!], lista[j]] = [lista[j], lista[u.b!]];
    });
    setMensaje("Se movió de lugar: se ve en la página al guardar.");
  }

  function quitar() {
    if (!u || u.b === null || !sel) return;
    if (!confirm("¿Quitar esta foto de la página? (Se puede deshacer con «Descartar cambios» mientras no guardes.)")) return;
    cambiar((p) => {
      p.secciones[u.s].bloques.splice(u.b!, 1);
    });
    setSel(null);
    setMensaje("Foto quitada: desaparece de la página al guardar.");
  }

  function agregarDespues(src: string) {
    if (!u || u.b === null || !sel) return;
    cambiar((p) => {
      const lista = p.secciones[u.s].bloques;
      const nueva = copia(lista[u.b!]);
      nueva.id = `${nueva.tipo}_${Date.now().toString(36)}`;
      nueva.ajustes[sel.clave] = src;
      const k = clavesEncuadre(sel.clave);
      nueva.ajustes[k.focal] = "50% 50%";
      delete nueva.ajustes[k.zoom];
      lista.splice(u.b! + 1, 0, nueva);
    });
    setMensaje("Foto agregada después de la elegida: aparece en la página al guardar.");
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
      setSel(null);
      recargar();
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

  useEffect(() => {
    if (!publicacion?.corriendo) return;
    const t = setInterval(async () => {
      const r = await fetch("/editor/api/publicar");
      if (r.ok) setPublicacion((await r.json()) as EstadoPublicar);
    }, 4000);
    return () => clearInterval(t);
  }, [publicacion?.corriendo]);

  const ruta = PAGINAS_MAPA[archivo].ruta;
  const ALTO = 844;
  const barraArriba = caja ? caja.top + caja.height + 190 > ALTO - 16 : false;

  return (
    <div className="flex h-dvh flex-col">
      {/* ── Barra de arriba ── */}
      <header className="flex flex-wrap items-center gap-2 border-b border-linea bg-white px-4 py-2.5">
        <strong className="mr-1 text-[17px] text-marino">Editor · B1</strong>
        <div className="flex rounded-lg bg-niebla p-1">
          {archivos.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setArchivo(a);
                setSel(null);
                setAbierta(null);
                recargar(a);
              }}
              className={`h-9 cursor-pointer rounded-md px-3 text-[14px] font-semibold ${a === archivo ? "bg-white text-marino shadow" : "text-texto-suave"}`}
            >
              {PAGINAS_MAPA[a].nombre}
              {pendientes.includes(a) ? " •" : ""}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg bg-niebla p-1">
          {(
            [
              ["fotos", "Fotos"],
              ["mapa", "Mapa"],
              ["textos", "Textos"],
            ] as const
          ).map(([m, t]) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setModo(m);
                setSel(null);
              }}
              className={`h-9 cursor-pointer rounded-md px-3 text-[14px] font-semibold ${modo === m ? "bg-white text-marino shadow" : "text-texto-suave"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="min-w-0 flex-1 truncate text-[14px] text-texto-suave">{mensaje}</span>
        <button
          type="button"
          disabled={!pendientes.length || guardando}
          onClick={() => {
            setBorradores(copia(guardadas));
            setSel(null);
            recargar();
          }}
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
          <strong>{publicacion.corriendo ? "Publicando la copia de prueba (unos minutos)…" : publicacion.ok ? "Publicado." : "La publicación falló."}</strong>{" "}
          {publicacion.peso && <>Peso: {publicacion.peso} de 3 MB. </>}
          {publicacion.direccion && !publicacion.corriendo && (
            <a href={`${publicacion.direccion}${ruta}`} target="_blank" rel="noreferrer" className="font-semibold text-marino underline">
              Abrir
            </a>
          )}
          <span className="block truncate font-mono text-[12px] text-texto-suave">{publicacion.ultimas.at(-1)}</span>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* ── Pestaña Textos: la lista de cada parte ── */}
        {modo === "textos" && (
          <main className="min-h-0 flex-1 overflow-y-auto p-4">
            <p className="m-0 mb-3 text-[14px] text-texto-suave">Los textos de cada parte, con su nombre del mapa. Las fotos se editan en la pestaña Fotos. Se ven en la página al guardar.</p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {mapa.map((s, i) => {
                const textos = s.campos.filter((c) => !c.diseno && !ES_DE_FOTO.has(c.tipo));
                const piezas = s.bloques.filter((b) => b.campos.some((c) => !ES_DE_FOTO.has(c.tipo)));
                if (!textos.length && !piezas.length) return null;
                return (
                  <li key={s.id} className="rounded-xl border border-linea bg-white">
                    <button type="button" onClick={() => setAbierta(abierta === i ? null : i)} className="flex w-full cursor-pointer items-center gap-2 px-3 py-3 text-left">
                      <code className="rounded bg-[#e11d48] px-2 py-1 font-mono text-[13px] font-bold text-white">{s.codigo}</code>
                      <strong className="flex-1 text-[15px]">{s.etiqueta}</strong>
                      <span aria-hidden="true">{abierta === i ? "▴" : "▾"}</span>
                    </button>
                    {abierta === i && (
                      <div className="border-t border-linea px-3 pb-3">
                        {textos.map((c) => (
                          <Campo
                            key={c.codigo}
                            campo={c}
                            alCambiar={(v) =>
                              cambiar((p) => {
                                p.secciones[i].ajustes[c.clave] = v;
                              })
                            }
                          />
                        ))}
                        {piezas.map((b) => (
                          <div key={b.codigo} className="mt-2 rounded-lg bg-niebla px-3 py-1">
                            <p className="m-0 pt-1 text-[13px] font-bold">
                              <code className="font-mono text-[#e11d48]">{b.codigo}</code> · {b.etiqueta}
                            </p>
                            {b.campos
                              .filter((c) => !ES_DE_FOTO.has(c.tipo))
                              .map((c) => (
                                <Campo
                                  key={c.codigo}
                                  campo={c}
                                  alCambiar={(v) =>
                                    cambiar((p) => {
                                      p.secciones[i].bloques[b.indice].ajustes[c.clave] = v;
                                    })
                                  }
                                />
                              ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </main>
        )}

        {/* ── La página en un celular (con el marco rojo encima en Fotos) ── */}
        <div className={`flex min-h-0 items-start justify-center gap-6 overflow-auto bg-niebla p-4 ${modo === "textos" ? "w-[440px] shrink-0 border-l border-linea" : "flex-1"}`}>
          <div className="grid shrink-0 gap-2">
          {fuera && (
            <div className="w-[406px] rounded-xl bg-[#fdf1dd] p-2.5 text-[13px] leading-snug text-[#8a4b00]">
              <strong>Estás viendo otra página</strong> (<code className="font-mono">{fuera}</code>): así la verá la gente al tocar ese enlace. Aquí no hay fotos ni números para editar.{" "}
              <button type="button" onClick={() => recargar()} className="cursor-pointer font-bold text-marino underline">
                ← Volver a {PAGINAS_MAPA[archivo].nombre}
              </button>
            </div>
          )}
          <div className="relative shrink-0 overflow-hidden rounded-[28px] border-[8px] border-tinta bg-white" style={{ width: 390 + 16, height: ALTO + 16 }}>
            <iframe
              ref={marco}
              key={carga.n}
              title="Página"
              src={carga.ruta}
              onLoad={(e) => {
                // Como en un teléfono: sin la barra de desplazamiento de la computadora a la derecha (tapaba la orilla
                // de las olas y hacía ver la página 15 px más angosta). La página publicada no cambia.
                const d = e.currentTarget.contentDocument;
                if (d?.head && !d.getElementById("editor-sin-barra")) {
                  const estilo = d.createElement("style");
                  estilo.id = "editor-sin-barra";
                  estilo.textContent = "html{scrollbar-width:none}html::-webkit-scrollbar{display:none}";
                  d.head.appendChild(estilo);
                }
                setCargada((c) => c + 1);
                revisarDireccion();
              }}
              className="size-full"
              style={{ width: 390, height: ALTO }}
            />
            {/* Aquí pone sus números la pestaña Mapa. */}
            <div ref={setCapa} className={`pointer-events-none absolute inset-0 ${modo === "mapa" ? "" : "hidden"}`} />

            {modo === "fotos" && !fuera && sel && caja && u && (
              <div className="pointer-events-none absolute inset-0">
                {/* Marco rojo sobre la foto: arrastrar acomoda la foto dentro de él. */}
                <div
                  className="pointer-events-auto absolute cursor-grab touch-none border-4 border-[#e11d48] active:cursor-grabbing"
                  style={{ top: caja.top, left: caja.left, width: caja.width, height: caja.height }}
                  onPointerDown={(e) => {
                    const { ox, oy } = sobrante();
                    arrastre.current = { px: e.clientX, py: e.clientY, x: focal.x, y: focal.y, ox, oy };
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch {
                      // Sin captura: se sigue igual mientras el puntero esté encima.
                    }
                  }}
                  onPointerMove={(e) => {
                    const a = arrastre.current;
                    if (!a || !claves) return;
                    // Arrastrar la foto a la derecha deja ver más de su lado izquierdo: el punto baja.
                    // Si la foto no sobra hacia un lado, en ese sentido no hay nada que acomodar.
                    const x = a.ox < 2 ? a.x : Math.round(Math.min(100, Math.max(0, a.x - ((e.clientX - a.px) / a.ox) * 100)));
                    const y = a.oy < 2 ? a.y : Math.round(Math.min(100, Math.max(0, a.y - ((e.clientY - a.py) / a.oy) * 100)));
                    ponerEnSel({ [claves.focal]: `${x}% ${y}%` });
                  }}
                  onPointerUp={() => (arrastre.current = null)}
                  onPointerCancel={() => (arrastre.current = null)}
                  onDoubleClick={() => setSel(null)}
                >
                  <span className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full bg-tinta/70 px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-white">✋ Arrastra la foto</span>
                </div>

                {/* Botones de la foto, debajo (o arriba si no caben). */}
                <div
                  className="pointer-events-auto absolute z-10 grid gap-2 rounded-xl bg-white p-2.5 shadow-[0_10px_30px_-8px_rgba(12,30,51,0.55)]"
                  style={{
                    left: Math.max(6, Math.min(caja.left, 390 - 326)),
                    width: 320,
                    ...(barraArriba ? { top: Math.max(6, caja.top - 186) } : { top: caja.top + caja.height + 6 }),
                  }}
                >
                  <div className="flex items-center gap-2 text-[12px]">
                    {campoSel && <code className="rounded bg-[#e11d48] px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">{campoSel.codigo}</code>}
                    <span className="min-w-0 flex-1 truncate font-semibold">{piezaSel?.etiqueta ?? campoSel?.etiqueta}</span>
                    <button type="button" onClick={() => setSel(null)} className="h-7 cursor-pointer rounded-md bg-niebla px-2 font-semibold">
                      Listo
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-[13px]">
                    <span className="w-14 shrink-0 font-semibold">Acercar</span>
                    <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => claves && ponerEnSel({ [claves.zoom]: Number(e.target.value) })} className="w-full" />
                    <span className="w-9 text-right tabular-nums">{zoom.toFixed(1)}×</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => setPedido({ agregar: false })} className="h-8 cursor-pointer rounded-lg bg-marino px-2.5 text-[12.5px] font-semibold text-white">
                      {esVideo ? "Cambiar video" : "Cambiar foto"}
                    </button>
                    <button
                      type="button"
                      onClick={() => claves && ponerEnSel({ [claves.focal]: "50% 50%", [claves.zoom]: 1 })}
                      className="h-8 cursor-pointer rounded-lg border border-linea px-2.5 text-[12.5px] font-semibold"
                    >
                      Centrar
                    </button>
                    {esPieza && (
                      <>
                        <button type="button" onClick={() => setPedido({ agregar: true })} className="h-8 cursor-pointer rounded-lg border border-linea px-2.5 text-[12.5px] font-semibold">
                          + Agregar otra
                        </button>
                        <button type="button" onClick={quitar} className="h-8 cursor-pointer rounded-lg border border-linea px-2.5 text-[12.5px] font-semibold text-[#b42318]">
                          Quitar
                        </button>
                        <button type="button" aria-label="Mover antes" onClick={() => moverPieza(-1)} className="h-8 cursor-pointer rounded-lg border border-linea px-2 text-[12.5px] font-semibold">
                          ◀ Antes
                        </button>
                        <button type="button" aria-label="Mover después" onClick={() => moverPieza(1)} className="h-8 cursor-pointer rounded-lg border border-linea px-2 text-[12.5px] font-semibold">
                          Después ▶
                        </button>
                      </>
                    )}
                  </div>
                  {!esPieza && <p className="m-0 text-[11.5px] text-texto-suave">Esta foto es fija en el diseño: se puede cambiar o acomodar, no quitar.</p>}
                </div>
              </div>
            )}
          </div>
          </div>

          {modo === "fotos" && (
            <aside className="w-[300px] shrink-0 pt-2 text-[14px] leading-relaxed text-texto-suave">
              <p className="m-0 font-bold text-tinta">Cómo se usa</p>
              <ol className="mt-1 mb-3 pl-5">
                <li>Toca cualquier foto o video de la página.</li>
                <li>Arrástrala dentro de su marco rojo hasta que quede bien; usa «Acercar» si hace falta.</li>
                <li>Cámbiala, quítala, agrega otra o muévela de lugar con sus botones.</li>
                <li>«Guardar» arriba cuando termines.</li>
              </ol>
              <p className="m-0">
                Puedes bajar la página y deslizar la galería con el mouse como siempre: el marco sigue a la foto. Doble clic en el marco o «Listo» para soltarla. Los botones y
                enlaces funcionan como en la página real (llevan a su página).
              </p>
              {pendientes.length > 0 && (
                <p className="mt-3 rounded-lg bg-[#fdf1dd] p-2.5 text-[13px] text-[#8a4b00]">
                  Hay cambios sin guardar. Los ajustes de encuadre y las fotos cambiadas ya se ven; las fotos agregadas, quitadas o movidas aparecen al guardar.
                </p>
              )}
            </aside>
          )}
        </div>

        {/* ── Pestaña Mapa: cada elemento de la página con su número fijo ── */}
        {modo === "mapa" && <MapaElementos archivo={archivo} secciones={mapa} marco={marco} cargada={cargada} capa={capa} activo={!fuera} />}
      </div>

      {pedido && sel && (
        <Biblioteca
          medios={medios}
          soloVideos={esVideo}
          soloResenas={tipoPieza === "review"}
          alSubir={(m) => setMedios((x) => [m, ...x])}
          alCerrar={() => setPedido(null)}
          alElegir={(src) => {
            if (pedido.agregar) agregarDespues(src);
            else if (claves) ponerEnSel({ [sel.clave]: src, [claves.focal]: "50% 50%", [claves.zoom]: 1 });
            setPedido(null);
          }}
        />
      )}
    </div>
  );
}
