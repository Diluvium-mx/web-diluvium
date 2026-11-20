"use client";

// Pestaña «Mapa» del editor: la página con un número fijo sobre cada elemento (como el mapa del CRM) y la tabla de
// números. Para pedir un cambio: «Producto 37: …». Los números los guarda /editor/api/elementos
// (contenido/mapa-elementos.json) y no cambian aunque cambie el texto o el orden de las fotos.

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { escanear, type Elemento } from "@/lib/elementos";
import { PAGINAS_MAPA, type ArchivoMapa, type SeccionMapa } from "@/lib/mapa";

type Props = { archivo: ArchivoMapa; secciones: SeccionMapa[]; ruta: string; vista: number };
type Marca = { firma: string; n: number; top: number; left: number };

const ALTO = 844;

export function MapaElementos({ archivo, secciones, ruta, vista }: Props) {
  const marco = useRef<HTMLIFrameElement>(null);
  const tabla = useRef<HTMLDivElement>(null);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [numeros, setNumeros] = useState<Record<string, number>>({});
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [elegido, setElegido] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [conNumeros, setConNumeros] = useState(true);
  const [copiado, setCopiado] = useState("");
  const [leyendo, setLeyendo] = useState(false);
  const pagina = PAGINAS_MAPA[archivo].nombre;

  /** Lee todos los elementos de la página y pide sus números (los nuevos toman el siguiente libre). */
  const leer = useCallback(async () => {
    const doc = marco.current?.contentDocument;
    if (!doc) return;
    setLeyendo(true);
    const lista = escanear(doc, secciones);
    setElementos(lista);
    const r = await fetch("/editor/api/elementos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ archivo, elementos: lista.map(({ firma, nombre, parte }) => ({ firma, nombre, parte })) }),
    });
    const j = (await r.json().catch(() => ({}))) as { numeros?: Record<string, number> };
    if (j.numeros) setNumeros(j.numeros);
    setLeyendo(false);
  }, [archivo, secciones]);

  // Los números siguen a los elementos al bajar la página o deslizar la galería (solo los que están a la vista).
  const ubicar = useCallback(() => {
    const lista: Marca[] = [];
    for (const e of elementos) {
      const n = numeros[e.firma];
      if (!n || !e.el.isConnected) continue;
      const r = e.el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > ALTO || r.right < 0 || r.left > 390) continue;
      lista.push({ firma: e.firma, n, top: Math.max(0, r.top), left: Math.max(0, Math.min(370, r.left)) });
    }
    setMarcas(lista);
  }, [elementos, numeros]);

  useEffect(() => {
    const doc = marco.current?.contentDocument;
    const win = marco.current?.contentWindow;
    if (!doc || !win) return;
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
    const t = setInterval(pedir, 1000);
    // En el mapa se puede tocar la página (abrir el menú, la guía de tamaños…) pero los enlaces no la sacan de aquí.
    const sinSalir = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("a")) e.preventDefault();
    };
    doc.addEventListener("click", sinSalir, true);
    return () => {
      cancelAnimationFrame(cuadro);
      clearInterval(t);
      doc.removeEventListener("scroll", pedir, { capture: true });
      win.removeEventListener("resize", pedir);
      doc.removeEventListener("click", sinSalir, true);
    };
  }, [ubicar, elementos]);

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
      .filter((e) => !f || String(numeros[e.firma]) === f || e.nombre.toLowerCase().includes(f) || e.parte.toLowerCase().includes(f))
      .sort((a, b) => numeros[a.firma] - numeros[b.firma]);
  }, [elementos, numeros, filtro]);

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-niebla p-4">
        <div className="relative shrink-0 overflow-hidden rounded-[28px] border-[8px] border-tinta bg-white" style={{ width: 406, height: ALTO + 16 }}>
          <iframe ref={marco} key={`${archivo}-${vista}`} title="Página" src={ruta} onLoad={() => setTimeout(leer, 900)} style={{ width: 390, height: ALTO }} />
          {conNumeros && (
            <div className="pointer-events-none absolute inset-0">
              {marcas.map((m) => (
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
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="flex min-h-0 w-[440px] shrink-0 flex-col border-l border-linea bg-white">
        <div className="grid gap-2 border-b border-linea p-3">
          <p className="m-0 text-[13px] leading-snug text-texto-suave">
            Cada elemento de la página tiene un número que no cambia. Para pedir un cambio: <strong className="text-tinta">«{pagina} 37: …»</strong>. Toca un número en la página o en la lista.
          </p>
          <div className="flex items-center gap-2">
            <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar número o texto…" className="h-9 min-w-0 flex-1 rounded-lg border border-linea px-3 text-[14px]" />
            <label className="flex items-center gap-1 text-[13px]">
              <input type="checkbox" checked={conNumeros} onChange={(e) => setConNumeros(e.target.checked)} /> Números
            </label>
            <button type="button" onClick={leer} disabled={leyendo} title="Después de abrir el menú, el carrito o la guía de tamaños en la página" className="h-9 cursor-pointer rounded-lg border border-linea px-2 text-[13px] disabled:opacity-50">
              {leyendo ? "Leyendo…" : "Volver a leer"}
            </button>
          </div>
          <p className="m-0 text-[12px] text-texto-suave">
            {filas.length} elementos. Si abres el menú, el carrito o la guía de tamaños en la página, «Volver a leer» numera lo que aparece.
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
    </div>
  );
}
