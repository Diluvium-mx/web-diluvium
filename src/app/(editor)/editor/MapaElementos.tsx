"use client";

// Pestaña «Mapa» del editor: la página con un número fijo sobre cada elemento (como el mapa del CRM) y la tabla de
// números. Para pedir un cambio: «Producto 37: …». Los números los guarda /editor/api/elementos
// (contenido/mapa-elementos.json) y no cambian aunque cambie el texto o el orden de las fotos.
//
// Rápido (21-nov-2026, dueño): usa la misma página que Fotos y Textos (no la vuelve a cargar), pide los números
// guardados al abrir el editor y lee la página al instante; solo pregunta al servidor si apareció algo nuevo.
// Si en la página se abre una ventana (carrito, «¿Cómo medir?», menú), solo se ven los números de esa ventana. Lo que
// aparece al tocar (una ventana, los pasos clave, lo del carrito) se numera solo.

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { escanear, type Elemento } from "@/lib/elementos";
import { PAGINAS_MAPA, type ArchivoMapa, type SeccionMapa } from "@/lib/mapa";

type Guardado = Record<string, { n: number; nombre: string }>;
type Props = {
  archivo: ArchivoMapa;
  secciones: SeccionMapa[];
  marco: React.RefObject<HTMLIFrameElement | null>;
  /** Sube cada vez que la página termina de cargar. */
  cargada: number;
  /** Capa encima de la página donde van los números. */
  capa: HTMLElement | null;
  /** false si la página de en medio es otra (no hay números que poner). */
  activo: boolean;
};
type Marca = { firma: string; n: number; top: number; left: number };

const ALTO = 844;
const ANCHO = 390;

// Números guardados de cada página (se piden una vez al abrir el editor).
const guardados: Partial<Record<ArchivoMapa, Guardado>> = {};
const pedidos: Partial<Record<ArchivoMapa, Promise<Guardado>>> = {};

/** Pide los números guardados de una página (el editor lo llama al abrir, para que el Mapa salga al instante). */
export function precargarNumeros(archivo: ArchivoMapa): Promise<Guardado> {
  if (guardados[archivo]) return Promise.resolve(guardados[archivo]);
  pedidos[archivo] ??= fetch(`/editor/api/elementos?archivo=${encodeURIComponent(archivo)}`)
    .then((r) => r.json() as Promise<{ elementos?: Guardado }>)
    .then((j) => (guardados[archivo] = j.elementos ?? {}))
    .catch(() => ({}));
  return pedidos[archivo];
}

/** La ventana abierta en la página (si hay): sus números son los únicos que se ven. */
function ventanaAbierta(doc: Document): Element | null {
  const lista = [...doc.querySelectorAll<HTMLElement>("dialog[open], [role=dialog][aria-modal=true]")].filter((v) => {
    const r = v.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(v).visibility !== "hidden";
  });
  return lista.at(-1) ?? null;
}

export function MapaElementos({ archivo, secciones, marco, cargada, capa, activo }: Props) {
  const tabla = useRef<HTMLDivElement>(null);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [numeros, setNumeros] = useState<Record<string, number>>({});
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [ventana, setVentana] = useState<Element | null>(null);
  const [elegido, setElegido] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [conNumeros, setConNumeros] = useState(true);
  const [copiado, setCopiado] = useState("");
  const pagina = PAGINAS_MAPA[archivo].nombre;

  // Al llegar a la pestaña o al cargar la página: leerla ya, con los números guardados (solo si hay algo nuevo se
  // pregunta al servidor). Después, lo que aparezca en la página (una ventana, los pasos clave…) se lee solo.
  useEffect(() => {
    const doc = marco.current?.contentDocument;
    if (!doc?.body || !activo) return;
    let vigente = true;
    const leer = async () => {
      const lista = escanear(doc, secciones);
      const antes = await precargarNumeros(archivo);
      if (!vigente) return;
      setElementos(lista);
      setNumeros(Object.fromEntries(Object.entries(antes).map(([f, e]) => [f, e.n])));
      if (!lista.some((e) => !antes[e.firma] || antes[e.firma].nombre !== e.nombre.slice(0, 120))) return;
      const r = await fetch("/editor/api/elementos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ archivo, elementos: lista.map(({ firma, nombre, parte }) => ({ firma, nombre, parte })) }),
      });
      const j = (await r.json().catch(() => ({}))) as { elementos?: Guardado };
      if (!j.elementos) return;
      guardados[archivo] = j.elementos;
      if (vigente) setNumeros(Object.fromEntries(Object.entries(j.elementos).map(([f, e]) => [f, e.n])));
    };
    let espera: ReturnType<typeof setTimeout> | undefined;
    const pronto = () => {
      clearTimeout(espera);
      espera = setTimeout(leer, 250);
    };
    const cuadro = requestAnimationFrame(() => void leer());
    const obs = new MutationObserver(pronto);
    obs.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["open", "aria-modal", "hidden"] });
    return () => {
      vigente = false;
      cancelAnimationFrame(cuadro);
      clearTimeout(espera);
      obs.disconnect();
    };
  }, [archivo, secciones, cargada, marco, activo]);

  // Los números siguen a los elementos al bajar la página o deslizar la galería (solo los que están a la vista).
  useEffect(() => {
    const doc = marco.current?.contentDocument;
    const win = marco.current?.contentWindow;
    if (!doc || !win || !activo) return;
    const ubicar = () => {
      const abierta = ventanaAbierta(doc);
      setVentana((v) => (v === abierta ? v : abierta));
      // El encabezado fijo de arriba tapa lo que pasa por debajo: esos números no se ponen encima del encabezado.
      const fijos = abierta
        ? []
        : [...doc.querySelectorAll<HTMLElement>("header, [data-seccion] > div, [data-seccion]")].filter((el) => {
            const pos = getComputedStyle(el).position;
            const r = el.getBoundingClientRect();
            return (pos === "sticky" || pos === "fixed") && r.top <= 1 && r.height > 0 && r.height < 200;
          });
      const tope = Math.max(0, ...fijos.map((el) => el.getBoundingClientRect().bottom));
      const lista: Marca[] = [];
      for (const e of elementos) {
        const n = numeros[e.firma];
        if (!n || !e.el.isConnected) continue;
        if (abierta ? !abierta.contains(e.el) : e.el.closest("dialog")) continue;
        const r = e.el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > ALTO || r.right < 0 || r.left > ANCHO) continue;
        const arriba = fijos.some((f) => f.contains(e.el)) ? 0 : tope;
        if (r.bottom <= arriba + 4) continue;
        lista.push({ firma: e.firma, n, top: Math.max(arriba, r.top), left: Math.max(0, Math.min(ANCHO - 20, r.left)) });
      }
      setMarcas(lista);
    };
    let cuadro = 0;
    const pedir = () => {
      if (!cuadro)
        cuadro = requestAnimationFrame(() => {
          cuadro = 0;
          ubicar();
        });
    };
    pedir();
    doc.addEventListener("scroll", pedir, { capture: true, passive: true });
    win.addEventListener("resize", pedir);
    const t = setInterval(pedir, 500);
    return () => {
      cancelAnimationFrame(cuadro);
      clearInterval(t);
      doc.removeEventListener("scroll", pedir, { capture: true });
      win.removeEventListener("resize", pedir);
    };
  }, [elementos, numeros, cargada, marco, activo]);

  // Resalta en la página el elemento elegido.
  useEffect(() => {
    const e = elementos.find((x) => x.firma === elegido);
    if (!e) return;
    const el = e.el as HTMLElement;
    const antes = el.style.outline;
    el.style.outline = "3px solid #e11d48";
    el.style.outlineOffset = "2px";
    return () => {
      el.style.outline = antes;
    };
  }, [elegido, elementos]);

  function elegir(firma: string, desdeTabla: boolean) {
    setElegido(firma);
    const e = elementos.find((x) => x.firma === firma);
    if (desdeTabla && e) (e.el as HTMLElement).scrollIntoView({ block: "center", behavior: "instant" });
    if (!desdeTabla) tabla.current?.querySelector(`[data-fila="${CSS.escape(firma)}"]`)?.scrollIntoView({ block: "center" });
  }

  function copiar(e: Elemento) {
    const texto = `${pagina} ${numeros[e.firma]} (${e.nombre})`;
    navigator.clipboard?.writeText(texto).catch(() => {});
    setCopiado(texto);
    setTimeout(() => setCopiado(""), 2500);
  }

  const filas = useMemo(() => {
    const f = filtro.trim().toLowerCase();
    return elementos
      .filter((e) => numeros[e.firma])
      .filter((e) => !ventana || ventana.contains(e.el))
      .filter((e) => !f || String(numeros[e.firma]) === f || e.nombre.toLowerCase().includes(f) || e.parte.toLowerCase().includes(f))
      .sort((a, b) => numeros[a.firma] - numeros[b.firma]);
  }, [elementos, numeros, filtro, ventana]);

  const numerosEnPagina =
    capa && conNumeros && activo
      ? createPortal(
          marcas.map((m) => (
            <button
              key={m.firma}
              type="button"
              onClick={() => elegir(m.firma, false)}
              className={`pointer-events-auto absolute flex h-[18px] min-w-[18px] cursor-pointer items-center justify-center rounded-full px-1 font-mono text-[10px] leading-none font-bold text-white shadow ${
                elegido === m.firma ? "z-10 scale-125 bg-tinta ring-2 ring-white" : "bg-[#e11d48]/90"
              }`}
              style={{ top: m.top, left: m.left }}
              title={elementos.find((e) => e.firma === m.firma)?.nombre}
            >
              {m.n}
            </button>
          )),
          capa,
        )
      : null;

  return (
    <aside className="flex min-h-0 w-[440px] shrink-0 flex-col border-l border-linea bg-white">
      {numerosEnPagina}
      <div className="grid gap-2 border-b border-linea p-3">
        <p className="m-0 text-[13px] leading-snug text-texto-suave">
          Cada elemento de la página tiene un número que no cambia. Para pedir un cambio: <strong className="text-tinta">«{pagina} 37: …»</strong>. Toca un número en la página o en la lista. Los
          botones y enlaces de la página funcionan como en la página real.
        </p>
        <div className="flex items-center gap-2">
          <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar número o texto…" className="h-9 min-w-0 flex-1 rounded-lg border border-linea px-3 text-[14px]" />
          <label className="flex items-center gap-1 text-[13px]">
            <input type="checkbox" checked={conNumeros} onChange={(e) => setConNumeros(e.target.checked)} /> Números
          </label>
        </div>
        <p className="m-0 text-[12px] text-texto-suave">
          {!activo
            ? "Esta página no es de B1: aquí no hay números."
            : ventana
              ? `Ventana abierta: ${filas.length} elementos (solo los de la ventana). Ciérrala para ver los de la página.`
              : `${filas.length} elementos.`}
        </p>
      </div>
      <div ref={tabla} className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {filas.map((e, i) => (
              <Fragment key={e.firma}>
                {(i === 0 || filas[i - 1].parte !== e.parte) && (
                  <tr>
                    <td colSpan={3} className="sticky top-0 bg-white pt-3 pb-1 text-[12px] font-bold text-marino">
                      {e.parte}
                    </td>
                  </tr>
                )}
                <tr data-fila={e.firma} onClick={() => elegir(e.firma, true)} className={`cursor-pointer border-b border-linea ${elegido === e.firma ? "bg-[#fff1f2]" : "hover:bg-niebla"}`}>
                  <td className="w-12 py-1.5 align-top">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e11d48] px-1.5 font-mono text-[11px] font-bold text-white">{numeros[e.firma]}</span>
                  </td>
                  <td className="py-1.5 pr-2 align-top leading-snug">{e.nombre}</td>
                  <td className="w-16 py-1.5 text-right align-top">
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        copiar(e);
                      }}
                      className="h-7 cursor-pointer rounded-md border border-linea px-2 text-[12px]"
                    >
                      Copiar
                    </button>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {copiado && <p className="m-0 border-t border-linea bg-tinta px-3 py-2 text-[13px] font-semibold text-white">Copiado: {copiado}</p>}
    </aside>
  );
}
