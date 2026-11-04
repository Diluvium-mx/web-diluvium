"use client";

// Buscador del encabezado (ajuste del tema «search_type: drawer»): ventana sobre la página con el campo «Buscar...»
// y resultados rápidos mientras se escribe, en pestañas (Productos, Collections, Blog posts, Páginas). Al dar Enter
// abre la página /search como la tienda (type=product, options[prefix]=last).

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SugerenciasJson } from "@/app/search/suggest/route";
import { IconoBuscar } from "@/components/comunes/Iconos";
import { IconoEquis } from "@/components/producto/IconosColeccion";
import { useAparecer } from "./useAparecer";

const PESTANAS = [
  { clave: "productos", texto: "Productos", tipo: "product" },
  { clave: "colecciones", texto: "Collections", tipo: "collection" },
  { clave: "articulos", texto: "Blog posts", tipo: "article" },
  { clave: "paginas", texto: "Páginas", tipo: "page" },
] as const;

type Clave = (typeof PESTANAS)[number]["clave"];

function Flecha() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true" focusable="false">
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function BuscadorRapido({ cerrar }: { cerrar: () => void }) {
  const visible = useAparecer();
  const [consulta, setConsulta] = useState("");
  const [datos, setDatos] = useState<{ q: string; r: SugerenciasJson } | null>(null);
  const [pestana, setPestana] = useState<Clave>("productos");
  const campo = useRef<HTMLInputElement>(null);
  const q = consulta.trim();

  useEffect(() => {
    campo.current?.focus();
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tecla);
    };
  }, [cerrar]);

  // Pide los resultados 300 ms después de la última tecla.
  useEffect(() => {
    if (!q) return;
    const control = new AbortController();
    const espera = setTimeout(() => {
      fetch(`/search/suggest?q=${encodeURIComponent(q)}`, { signal: control.signal })
        .then((r) => r.json() as Promise<SugerenciasJson>)
        .then((r) => setDatos({ q, r }))
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(espera);
      control.abort();
    };
  }, [q]);

  const resultados = q && datos ? datos.r : null;
  const verTodo = (tipo: string) => `/search?type=${tipo}&q=${encodeURIComponent(q)}&options%5Bprefix%5D=last`;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-[rgba(23,22,26,0.5)] p-6 transition-opacity duration-250 md:p-12 min-[1025px]:p-16 ${visible ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar"
      onClick={(e) => e.target === e.currentTarget && cerrar()}
    >
      <form action="/search" method="get" role="search" className="relative z-[1] flex w-full max-w-[900px] flex-col bg-white text-azul">
        <input type="hidden" name="type" value="product" />
        <input type="hidden" name="options[prefix]" value="last" />
        <div className="sticky top-0 flex bg-white py-3 pr-3 pl-6">
          <div className="relative flex w-full">
            <label htmlFor="buscador-rapido" className="sr-only">
              Buscar
            </label>
            <input
              ref={campo}
              id="buscador-rapido"
              type="search"
              name="q"
              autoComplete="off"
              placeholder="Buscar..."
              value={consulta}
              onChange={(e) => {
                setConsulta(e.target.value);
                setPestana("productos");
              }}
              className="h-10 w-full rounded-[64px] border border-azul bg-white px-4 py-2 text-azul shadow-[inset_0_0_0_1px_#0a559a] outline-none placeholder:text-azul/60 min-[1025px]:h-11 [&::-webkit-search-cancel-button]:appearance-none"
            />
            <button type="submit" className="absolute top-0 right-0 mr-2 flex size-10 items-center justify-center" aria-label="Buscar">
              <IconoBuscar className="h-6 w-6" />
            </button>
          </div>
          <button
            type="button"
            className="flex h-10 w-[35px] shrink-0 items-center justify-center min-[1025px]:h-11 min-[1025px]:w-[42px]"
            aria-label="Cerrar Modal"
            onClick={cerrar}
          >
            <IconoEquis className="size-5 min-[1025px]:size-6" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-6 py-3">
          {!q ? (
            <div className="flex h-full items-center justify-center text-center text-azul/60">Introduce palabras clave para ver resultados rápidos</div>
          ) : resultados ? (
            <div className="flex h-full flex-col">
              <ul className="-mx-6 flex shrink-0 gap-4 overflow-x-auto px-6 min-[1025px]:gap-8" role="tablist">
                {PESTANAS.map((p) => (
                  <li key={p.clave}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={pestana === p.clave}
                      onClick={() => setPestana(p.clave)}
                      className={`block py-3 font-titulo text-base leading-5 font-medium whitespace-nowrap ${pestana === p.clave ? "text-naranja" : "text-azul/60"}`}
                    >
                      {p.texto}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 min-h-0 flex-1 overflow-auto">
                <Panel datos={resultados} pestana={pestana} verTodo={verTodo(PESTANAS.find((p) => p.clave === pestana)?.tipo ?? "product")} />
              </div>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function Panel({ datos, pestana, verTodo }: { datos: SugerenciasJson; pestana: Clave; verTodo: string }) {
  const lista = datos[pestana];
  if (lista.length === 0) {
    return <span className="flex h-full items-center justify-center text-azul/60">No se encontraron resultados coincidentes</span>;
  }
  return (
    <div className="flex h-full flex-col">
      <ul className="grid flex-1 content-start gap-x-6 gap-y-3 md:grid-cols-2 md:gap-y-6 min-[1025px]:grid-cols-3" role="listbox">
        {pestana === "productos" &&
          datos.productos.map((p) => (
            <li key={p.enlace} role="option" aria-selected="false" className="flex items-start gap-3">
              <Link href={p.enlace} className="relative block h-[120px] w-20 shrink-0 overflow-hidden rounded-2xl bg-white">
                {p.imagen && <Image src={p.imagen} alt={p.alt} fill sizes="80px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-[13.6px] leading-[17px] break-words text-azul/60">{p.proveedor}</p>
                <Link href={p.enlace} className="block font-bold break-words">
                  {p.titulo}
                </Link>
                <span className="flex flex-wrap items-center gap-2">
                  {p.antes && (
                    <span className="inline-block leading-6">
                      <span className="sr-only">Precio normal</span>
                      <s className="text-[13.6px] leading-[17px] text-[rgba(49,49,49,0.63)]">{p.antes}</s>
                    </span>
                  )}
                  <span className="inline-block leading-6">
                    <span className="sr-only">{p.antes ? "Precio de venta" : "Precio normal"}</span>
                    {p.precio}
                  </span>
                </span>
              </div>
            </li>
          ))}
        {pestana === "colecciones" &&
          datos.colecciones.map((c) => (
            <li key={c.enlace} role="option" aria-selected="false" className="flex items-start gap-3">
              <Link href={c.enlace} className="relative block aspect-[3/2] w-20 shrink-0 overflow-hidden rounded-2xl">
                {c.imagen && <Image src={c.imagen} alt={c.titulo} fill sizes="80px" className="object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col gap-1">
                <Link href={c.enlace} className="block font-bold break-words">
                  {c.titulo}
                </Link>
                <p>{c.cantidad} products</p>
              </div>
            </li>
          ))}
        {pestana === "articulos" &&
          datos.articulos.map((a) => (
            <li key={a.enlace} role="option" aria-selected="false" className="flex items-start gap-3">
              <Link href={a.enlace} className="relative block aspect-[3/2] w-20 shrink-0 overflow-hidden rounded-2xl">
                {a.imagen && <Image src={a.imagen} alt={a.titulo} fill sizes="80px" className="object-cover" />}
              </Link>
              <Link href={a.enlace} className="block flex-1 font-bold break-words">
                {a.titulo}
              </Link>
            </li>
          ))}
        {pestana === "paginas" &&
          datos.paginas.map((p) => (
            <li key={p.enlace} role="option" aria-selected="false">
              <Link href={p.enlace} className="block font-bold break-words">
                {p.titulo}
              </Link>
            </li>
          ))}
      </ul>
      <div className="w-full py-3">
        <Link
          href={verTodo}
          className="flex min-h-10 w-full items-center justify-center gap-2 border border-naranja bg-naranja px-6 py-1.5 font-titulo font-medium text-white min-[1025px]:min-h-11"
        >
          View all results <Flecha />
        </Link>
      </div>
    </div>
  );
}
