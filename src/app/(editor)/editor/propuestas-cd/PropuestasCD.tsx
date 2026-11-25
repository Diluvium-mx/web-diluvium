"use client";

// Ocho maquetas que funcionan para que el dueño elija (25-nov-2026): 4 formas de elegir el tamaño sin escribir la
// medida y 4 formas de mostrar muchas reseñas. Cada cuadro va en <div data-propuesta="T1"…> (de ahí salen las imágenes).

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Tamano } from "@/components/secciones/landing/datos";

export type ResenaP = { id: number; nombre: string; texto: string; estrellas: number; foto: string; temas: string[]; estado: string };

const pesos = (n: number) => `$${n.toLocaleString("en-US")}`;
const TINTA = "text-[#06182f]";
const BOTON = "inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center rounded-2xl bg-boton px-6 font-titulo text-[18px] font-medium text-white";

function Marco({ id, titulo, idea, para, children }: { id: string; titulo: string; idea: string; para: string; children: React.ReactNode }) {
  return (
    <section className="w-[390px] shrink-0">
      <p className="m-0 font-titulo text-[13px] font-semibold tracking-[0.08em] text-boton uppercase">
        {id}, sugerida para {para}
      </p>
      <h2 className="titulo-version m-0 mt-1 text-[21px] text-marino">{titulo}</h2>
      <p className="m-0 mt-1 mb-3 min-h-[60px] text-[14px] leading-snug text-tinta">{idea}</p>
      <div data-propuesta={id} className="overflow-hidden rounded-[22px] border border-linea bg-white shadow-[0_20px_50px_-24px_rgba(12,30,51,0.45)]">
        {children}
      </div>
    </section>
  );
}

function Estrellas({ n, clase = "size-5" }: { n: number; clase?: string }) {
  return (
    <span className="flex text-estrella" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={clase} fill="currentColor">
          <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Resultado({ t }: { t?: Tamano }) {
  if (!t) return null;
  return (
    <div className="mt-4 rounded-2xl bg-[#e3f5e8] p-4 text-[#14532d]">
      <p className="m-0 text-[17px]">
        Elegiste la <strong>{t.nombre}</strong> ({t.medidas})
      </p>
      <p className="m-0 mt-1 font-titulo text-[30px] font-semibold text-[#06182f]">
        {pesos(t.precio)} {t.precioAntes && <s className="text-[17px] font-normal text-[#45566a]">{pesos(t.precioAntes)}</s>}
      </p>
      <button type="button" className={`${BOTON} mt-3`}>
        Añadir al carrito
      </button>
    </div>
  );
}

// ─────────────── T1 · Tabla de precios ───────────────
function T1({ tamanos }: { tamanos: Tamano[] }) {
  const [id, setId] = useState<number | null>(null);
  return (
    <div className="p-5">
      <p className={`m-0 font-titulo text-[20px] font-medium ${TINTA}`}>Tabla de tamaños y precios</p>
      <p className="m-0 mt-1 text-[16px] text-[#45566a]">Busca el ancho de tu entrada y toca «Elegir».</p>
      <table className="mt-3 w-full border-collapse text-left text-[16px]">
        <thead>
          <tr className="bg-[#06182f] text-white">
            <th className="rounded-tl-xl px-3 py-2.5 font-titulo font-medium">Ancho</th>
            <th className="px-3 py-2.5 font-titulo font-medium">Precio</th>
            <th className="rounded-tr-xl px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {tamanos.map((t, i) => (
            <tr key={t.id} className={`${t.id === id ? "bg-[#e3f5e8]" : i % 2 ? "bg-[#f3f8fd]" : "bg-white"}`}>
              <td className="px-3 py-3">
                <strong className={`block text-[17px] ${TINTA}`}>{t.medidas}</strong>
                <span className="text-[14px] text-[#45566a]">{t.nombre}</span>
              </td>
              <td className={`px-3 py-3 font-titulo text-[18px] font-semibold ${TINTA}`}>{pesos(t.precio)}</td>
              <td className="px-2 py-2 text-right">
                <button type="button" onClick={() => setId(t.id)} className={`min-h-12 cursor-pointer rounded-xl px-3.5 text-[16px] font-bold ${t.id === id ? "bg-[#1a7f37] text-white" : "border-2 border-[#06182f] text-[#06182f]"}`}>
                  {t.id === id ? "✓ Elegida" : "Elegir"}
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-white">
            <td className="px-3 py-3" colSpan={2}>
              <strong className={`block text-[17px] ${TINTA}`}>Más de 120 cm</strong>
              <span className="text-[14px] text-[#45566a]">Te la hacemos a la medida</span>
            </td>
            <td className="px-2 py-2 text-right">
              <button type="button" className="min-h-12 cursor-pointer rounded-xl bg-[#1a7f37] px-3.5 text-[16px] font-bold text-white">
                Cotizar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <Resultado t={tamanos.find((t) => t.id === id)} />
    </div>
  );
}

// ─────────────── T2 · Asistente de 3 preguntas ───────────────
function T2({ tamanos }: { tamanos: Tamano[] }) {
  const [paso, setPaso] = useState(0);
  const [id, setId] = useState<number | null>(null);
  const opciones = [
    { t: "Puerta de mi casa", i: "🚪" },
    { t: "Cochera o local ancho", i: "🚗" },
    { t: "Entrada de negocio", i: "🏪" },
  ];
  return (
    <div className="p-5">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i <= paso ? "bg-[#1663a8]" : "bg-[#dbe7f3]"}`} />
        ))}
      </div>
      <p className="m-0 mt-4 text-[15px] font-semibold text-[#45566a]">Paso {Math.min(paso + 1, 3)} de 3</p>
      {paso === 0 && (
        <>
          <p className={`m-0 mt-1 font-titulo text-[22px] font-medium ${TINTA}`}>¿Dónde la vas a poner?</p>
          <div className="mt-3 grid gap-2.5">
            {opciones.map((o) => (
              <button key={o.t} type="button" onClick={() => setPaso(1)} className="flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-[2.5px] border-[#dbe7f3] px-4 text-left text-[18px] font-bold text-[#06182f]">
                <span className="text-[26px]">{o.i}</span>
                {o.t}
              </button>
            ))}
          </div>
        </>
      )}
      {paso === 1 && (
        <>
          <p className={`m-0 mt-1 font-titulo text-[22px] font-medium ${TINTA}`}>¿Qué tan ancha es tu entrada?</p>
          <p className="m-0 text-[15px] text-[#45566a]">De marco a marco. Toca la que corresponda.</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {tamanos.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setId(t.id);
                  setPaso(2);
                }}
                className="min-h-16 cursor-pointer rounded-2xl border-[2.5px] border-[#dbe7f3] px-3 text-[18px] font-bold text-[#06182f]"
              >
                {t.medidas}
              </button>
            ))}
            <button type="button" className="min-h-16 cursor-pointer rounded-2xl border-[2.5px] border-dashed border-[#dbe7f3] px-3 text-[16px] font-bold text-[#1663a8]">
              Más de 120 cm
            </button>
          </div>
        </>
      )}
      {paso === 2 && (
        <>
          <p className={`m-0 mt-1 font-titulo text-[22px] font-medium ${TINTA}`}>¡Listo! Esta es la tuya</p>
          <Resultado t={tamanos.find((t) => t.id === id)} />
          <button type="button" onClick={() => setPaso(0)} className="mt-2 min-h-11 w-full cursor-pointer text-[16px] font-semibold text-[#1663a8] underline">
            Volver a empezar
          </button>
        </>
      )}
    </div>
  );
}

// ─────────────── T3 · Puertas dibujadas a escala ───────────────
function T3({ tamanos }: { tamanos: Tamano[] }) {
  const [id, setId] = useState<number | null>(null);
  const max = 120;
  return (
    <div className="p-5">
      <p className={`m-0 font-titulo text-[20px] font-medium ${TINTA}`}>¿Cuál se parece a tu entrada?</p>
      <p className="m-0 mt-1 text-[16px] text-[#45566a]">Cada puerta está dibujada a su tamaño real.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {tamanos.map((t) => {
          const hasta = Number(t.medidas.match(/(\d+)\D+(\d+)/)?.[2] ?? 100);
          const si = t.id === id;
          return (
            <button key={t.id} type="button" onClick={() => setId(t.id)} className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[2.5px] p-3 ${si ? "border-[#1663a8] bg-[#eaf4fd]" : "border-[#dbe7f3]"}`}>
              <svg viewBox="0 0 100 110" className="h-24 w-full" aria-hidden="true">
                <rect x={50 - (hasta / max) * 42} y="6" width={(hasta / max) * 84} height="98" fill="#f4e6d7" stroke="#06182f" strokeWidth="3" rx="2" />
                <circle cx={50 + (hasta / max) * 30} cy="50" r="2.5" fill="#06182f" />
                <rect x="0" y="92" width="100" height="18" fill="#9fd2fb" opacity="0.7" />
                <rect x={50 - (hasta / max) * 44} y="74" width={(hasta / max) * 88} height="32" fill="#06182f" rx="3" />
                <line x1="0" y1="106" x2="100" y2="106" stroke="#06182f" strokeWidth="2" />
              </svg>
              <span className="text-[17px] font-bold text-[#06182f]">{t.medidas}</span>
              <span className="font-titulo text-[17px] font-semibold text-[#06182f]">{pesos(t.precio)}</span>
            </button>
          );
        })}
        <button type="button" className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[2.5px] border-dashed border-[#1a7f37] p-3 text-[#14632f]">
          <span className="text-[17px] font-bold">Más de 120 cm</span>
          <span className="text-[15px] leading-snug">Te la hacemos a la medida. Toca para cotizar por WhatsApp.</span>
        </button>
      </div>
      <Resultado t={tamanos.find((t) => t.id === id)} />
    </div>
  );
}

// ─────────────── T4 · Lista desplegable grande ───────────────
function T4({ tamanos }: { tamanos: Tamano[] }) {
  const [id, setId] = useState<number | null>(null);
  const [medida, setMedida] = useState(false);
  return (
    <div className="p-5">
      <label htmlFor="t4" className={`block font-titulo text-[20px] font-medium ${TINTA}`}>
        Elige el ancho de tu entrada
      </label>
      <p className="m-0 mt-1 text-[16px] text-[#45566a]">Al tocar se abre la lista del teléfono.</p>
      <select
        id="t4"
        value={medida ? "medida" : (id ?? "")}
        onChange={(e) => {
          setMedida(e.target.value === "medida");
          setId(Number(e.target.value) || null);
        }}
        className="mt-3 h-16 w-full cursor-pointer rounded-2xl border-[2.5px] border-[#06182f] bg-white px-4 text-[19px] font-semibold text-[#06182f]"
      >
        <option value="">Selecciona una medida…</option>
        {tamanos.map((t) => (
          <option key={t.id} value={t.id}>
            {t.medidas}, {t.nombre}, {pesos(t.precio)}
          </option>
        ))}
        <option value="medida">Más de 120 cm (a la medida, por WhatsApp)</option>
      </select>
      <Resultado t={tamanos.find((t) => t.id === id)} />
      {medida && (
        <p className="m-0 mt-4 rounded-2xl bg-[#e3f5e8] p-4 text-[17px] text-[#14532d]">Te la hacemos a la medida. Escríbenos por WhatsApp con el ancho de tu entrada.</p>
      )}
      {!id && !medida && <p className="m-0 mt-4 rounded-2xl bg-[#f3f8fd] p-4 text-[16px] text-[#45566a]">Todas cuestan {tamanos[0] ? pesos(tamanos[0].precio) : ""}, con envío gratis.</p>}
    </div>
  );
}

// ─────────────── R1 · Muro de fotos de clientes ───────────────
function R1({ resenas }: { resenas: ResenaP[] }) {
  const conFoto = resenas.filter((r) => r.foto);
  const [cuantas, setCuantas] = useState(12);
  const [abierta, setAbierta] = useState<ResenaP | null>(null);
  return (
    <div className="p-5">
      <p className={`m-0 font-titulo text-[22px] leading-tight font-medium ${TINTA}`}>{conFoto.length} clientes nos mandaron foto de su compuerta</p>
      <p className="m-0 mt-1 text-[16px] text-[#45566a]">Toca una foto para leer lo que dijo.</p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {conFoto.slice(0, cuantas).map((r) => (
          <button key={r.id} type="button" onClick={() => setAbierta(r)} className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-[#f3f8fd]">
            <Image src={r.foto} alt={`Foto de ${r.nombre}`} fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
      {cuantas < conFoto.length && (
        <button type="button" onClick={() => setCuantas((c) => c + 12)} className="mt-3 min-h-14 w-full cursor-pointer rounded-2xl border-[2.5px] border-[#06182f] font-titulo text-[17px] font-medium text-[#06182f]">
          Ver 12 fotos más ({conFoto.length - cuantas} faltan)
        </button>
      )}
      {abierta && (
        <div className="mt-3 rounded-2xl bg-[#f3f8fd] p-4">
          <Estrellas n={abierta.estrellas} />
          <p className="m-0 mt-2 text-[17px] leading-[1.5] text-[#1f2d3d]">«{abierta.texto}»</p>
          <p className={`m-0 mt-2 text-[16px] font-bold ${TINTA}`}>{abierta.nombre}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────── R2 · Reseñas por tema ───────────────
function R2({ resenas, temas }: { resenas: ResenaP[]; temas: string[] }) {
  const [tema, setTema] = useState<string | null>(null);
  const [cuantas, setCuantas] = useState(4);
  const lista = useMemo(() => (tema ? resenas.filter((r) => r.temas.includes(tema)) : resenas), [tema, resenas]);
  return (
    <div className="p-5">
      <p className={`m-0 font-titulo text-[22px] font-medium ${TINTA}`}>Lo que más dicen nuestros clientes</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTema(null)} className={`min-h-11 cursor-pointer rounded-full border-2 px-3.5 text-[15.5px] font-bold ${!tema ? "border-[#06182f] bg-[#06182f] text-white" : "border-[#dbe7f3] text-[#06182f]"}`}>
          Todas ({resenas.length})
        </button>
        {temas.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTema(t);
              setCuantas(4);
            }}
            className={`min-h-11 cursor-pointer rounded-full border-2 px-3.5 text-[15.5px] font-bold ${tema === t ? "border-[#06182f] bg-[#06182f] text-white" : "border-[#dbe7f3] text-[#06182f]"}`}
          >
            {t} ({resenas.filter((r) => r.temas.includes(t)).length})
          </button>
        ))}
      </div>
      <ul className="m-0 mt-4 grid list-none gap-3 p-0">
        {lista.slice(0, cuantas).map((r) => (
          <li key={r.id} className="rounded-2xl border-2 border-[#dbe7f3] p-4">
            <Estrellas n={r.estrellas} />
            <p className="m-0 mt-2 text-[17px] leading-[1.5] text-[#1f2d3d]">«{r.texto.length > 220 ? `${r.texto.slice(0, 210).replace(/\s+\S*$/, "")}…` : r.texto}»</p>
            <p className={`m-0 mt-2 text-[16px] font-bold ${TINTA}`}>{r.nombre}</p>
          </li>
        ))}
      </ul>
      {cuantas < lista.length && (
        <button type="button" onClick={() => setCuantas((c) => c + 10)} className="mt-3 min-h-14 w-full cursor-pointer rounded-2xl border-[2.5px] border-[#06182f] font-titulo text-[17px] font-medium text-[#06182f]">
          Ver 10 más ({lista.length - cuantas} faltan)
        </button>
      )}
    </div>
  );
}

// ─────────────── R3 · Todas las reseñas, por páginas ───────────────
function R3({ resenas }: { resenas: ResenaP[] }) {
  const [filtro, setFiltro] = useState<"todas" | "foto" | "5">("todas");
  const [pagina, setPagina] = useState(1);
  const lista = resenas.filter((r) => (filtro === "foto" ? r.foto : filtro === "5" ? r.estrellas === 5 : true));
  const POR = 5;
  const paginas = Math.ceil(lista.length / POR);
  const cinco = resenas.filter((r) => r.estrellas === 5).length;
  return (
    <div className="p-5">
      <div className="flex items-center gap-4 rounded-2xl bg-[#f3f8fd] p-4">
        <span className={`font-titulo text-[46px] leading-none font-semibold ${TINTA}`}>4.9</span>
        <div>
          <Estrellas n={5} clase="size-6" />
          <p className="m-0 mt-1 text-[16px] text-[#45566a]">{resenas.length} reseñas</p>
          <p className="m-0 text-[16px] text-[#45566a]">{cinco} de 5 estrellas</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(
          [
            ["todas", "Todas"],
            ["foto", "Con foto"],
            ["5", "5 estrellas"],
          ] as const
        ).map(([v, t]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setFiltro(v);
              setPagina(1);
            }}
            className={`min-h-12 cursor-pointer rounded-xl border-2 text-[15.5px] font-bold ${filtro === v ? "border-[#06182f] bg-[#06182f] text-white" : "border-[#dbe7f3] text-[#06182f]"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="m-0 mt-3 grid list-none gap-3 p-0">
        {lista.slice((pagina - 1) * POR, pagina * POR).map((r) => (
          <li key={r.id} className="flex gap-3 border-b border-[#dbe7f3] pb-3">
            {r.foto && (
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={r.foto} alt="" fill sizes="64px" className="object-cover" />
              </span>
            )}
            <span>
              <Estrellas n={r.estrellas} clase="size-4" />
              <span className="mt-1 block text-[16px] leading-[1.45] text-[#1f2d3d]">«{r.texto.length > 140 ? `${r.texto.slice(0, 130).replace(/\s+\S*$/, "")}…` : r.texto}»</span>
              <span className={`mt-1 block text-[15px] font-bold ${TINTA}`}>{r.nombre}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button type="button" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)} className="min-h-12 cursor-pointer rounded-xl border-2 border-[#06182f] px-2 text-[16px] font-bold whitespace-nowrap text-[#06182f] disabled:opacity-30">
          ← Anterior
        </button>
        <span className="text-center text-[16px] leading-tight font-semibold whitespace-nowrap text-[#45566a]">
          {pagina} de {paginas}
        </span>
        <button type="button" disabled={pagina === paginas} onClick={() => setPagina((p) => p + 1)} className="min-h-12 cursor-pointer rounded-xl border-2 border-[#06182f] px-2 text-[16px] font-bold whitespace-nowrap text-[#06182f] disabled:opacity-30">
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ─────────────── R4 · Reseñas por estado ───────────────
function R4({ resenas, estados }: { resenas: ResenaP[]; estados: string[] }) {
  const conLugar = estados.map((e) => ({ e, lista: resenas.filter((r) => r.estado === e) })).filter((x) => x.lista.length);
  const [elegido, setElegido] = useState(conLugar[0]?.e ?? "");
  const lista = conLugar.find((x) => x.e === elegido)?.lista ?? [];
  return (
    <div className="p-5">
      <p className={`m-0 font-titulo text-[22px] leading-tight font-medium ${TINTA}`}>Familias protegidas en todo México</p>
      <p className="m-0 mt-1 text-[16px] text-[#45566a]">Elige un estado y lee a tus vecinos.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {conLugar.map((x) => (
          <button key={x.e} type="button" onClick={() => setElegido(x.e)} className={`min-h-11 cursor-pointer rounded-full border-2 px-3.5 text-[15.5px] font-bold ${elegido === x.e ? "border-[#1663a8] bg-[#1663a8] text-white" : "border-[#dbe7f3] text-[#06182f]"}`}>
            📍 {x.e} ({x.lista.length})
          </button>
        ))}
      </div>
      <ul className="m-0 mt-4 grid list-none gap-3 p-0">
        {lista.slice(0, 3).map((r) => (
          <li key={r.id} className="rounded-2xl bg-[#f3f8fd] p-4">
            <p className="m-0 text-[14px] font-bold text-[#1663a8]">📍 {r.estado}</p>
            <Estrellas n={r.estrellas} />
            <p className="m-0 mt-2 text-[17px] leading-[1.5] text-[#1f2d3d]">«{r.texto.length > 200 ? `${r.texto.slice(0, 190).replace(/\s+\S*$/, "")}…` : r.texto}»</p>
            <p className={`m-0 mt-2 text-[16px] font-bold ${TINTA}`}>{r.nombre}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PropuestasCD({ resenas, tamanos, temas, estados }: { resenas: ResenaP[]; tamanos: Tamano[]; temas: string[]; estados: string[] }) {
  return (
    <main className="version min-h-dvh bg-[#e9edf2] px-6 py-8 text-marino">
      <h1 className="titulo-version m-0 text-[30px]">Propuestas para C y D: tamaño y reseñas</h1>
      <p className="m-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-tinta">
        Ninguna pide escribir la medida (eso quedó solo para B). Todas funcionan: tócalas. Dime cuál quieres en cada versión, por ejemplo «C con T1 y R2, D con T2 y R3».
      </p>
      <h2 className="titulo-version m-0 mt-8 text-[24px]">Elegir el tamaño</h2>
      <div className="mt-4 flex flex-wrap items-start gap-8">
        <Marco id="T1" para="C" titulo="Tabla de tamaños y precios" idea="Como una lista de precios: cada renglón con el ancho, el nombre, el precio y su botón «Elegir». Se entiende de un vistazo.">
          <T1 tamanos={tamanos} />
        </Marco>
        <Marco id="T2" para="D" titulo="Asistente de 3 pasos" idea="Como el recomendador de Andafacil: ¿dónde la vas a poner?, ¿qué tan ancha es tu entrada? (botones grandes con cada medida) y la recomendación con precio.">
          <T2 tamanos={tamanos} />
        </Marco>
        <Marco id="T3" para="C o D" titulo="Puertas dibujadas a su tamaño" idea="Cada tamaño es una puerta dibujada más angosta o más ancha, con su medida y su precio. Se elige con la vista.">
          <T3 tamanos={tamanos} />
        </Marco>
        <Marco id="T4" para="D" titulo="Lista desplegable grande" idea="Un solo botón grande que abre la lista del teléfono con cada medida y su precio, como en las tiendas en línea.">
          <T4 tamanos={tamanos} />
        </Marco>
      </div>
      <h2 className="titulo-version m-0 mt-12 text-[24px]">Reseñas (muchas a la vez)</h2>
      <div className="mt-4 flex flex-wrap items-start gap-8">
        <Marco id="R1" para="C" titulo="Muro de fotos de clientes" idea={`Las ${resenas.filter((r) => r.foto).length} fotos que mandaron los clientes en cuadrícula; al tocar una se lee su reseña. Se ve de un golpe cuánta gente ya la tiene.`}>
          <R1 resenas={resenas} />
        </Marco>
        <Marco id="R2" para="C" titulo="Reseñas por tema" idea="Botones con lo que más dicen y cuántos lo dicen («Fácil de poner (48)», «Buena calidad (48)»…); al tocar uno salen esas reseñas, de 10 en 10.">
          <R2 resenas={resenas} temas={temas} />
        </Marco>
        <Marco id="R3" para="D" titulo="Todas las reseñas, por páginas" idea={`Resumen (4.9, ${resenas.length} reseñas), filtros (todas, con foto, 5 estrellas) y la lista completa por páginas con «Anterior» y «Siguiente».`}>
          <R3 resenas={resenas} />
        </Marco>
        <Marco id="R4" para="D" titulo="Reseñas por estado" idea={`Botones con cada estado y cuántas reseñas hay; al tocar uno salen las de ese lugar. Ojo: solo ${resenas.filter((r) => r.estado).length} reseñas dicen de dónde son, así que iría junto con otra opción.`}>
          <R4 resenas={resenas} estados={estados} />
        </Marco>
      </div>
    </main>
  );
}
