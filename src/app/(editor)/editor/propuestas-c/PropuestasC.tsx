"use client";

// Seis partes nuevas para la versión C (ninguna está en A ni en B1), armadas como maquetas que funcionan para que el
// dueño las pruebe y elija. Cada una va en <section data-propuesta="N"> (de ahí salen las imágenes para el chat).

import Image from "next/image";
import { useMemo, useState } from "react";

type Producto = { titulo: string; precio: number; imagen: string };
export type DatosPropuestas = {
  catalogo: Record<string, Producto>;
  estados: Record<string, { n: number; cita: string; nombre: string }>;
  totalResenas: number;
};

const pesos = (n: number) => `$${n.toLocaleString("en-US")}`;
const BOTON = "inline-flex min-h-13 w-full cursor-pointer items-center justify-center rounded-xl bg-boton px-6 font-titulo text-[17px] font-medium text-white";

function Marco({ n, titulo, idea, children }: { n: number; titulo: string; idea: string; children: React.ReactNode }) {
  return (
    <section className="w-[390px] shrink-0">
      <p className="m-0 font-titulo text-[13px] font-semibold tracking-[0.08em] text-boton uppercase">Propuesta C-{n}</p>
      <h2 className="titulo-version m-0 mt-1 text-[21px] text-marino">{titulo}</h2>
      <p className="m-0 mt-1 mb-3 min-h-[60px] text-[14px] leading-snug text-tinta">{idea}</p>
      <div data-propuesta={n} className="overflow-hidden rounded-[22px] border border-linea bg-white shadow-[0_20px_50px_-24px_rgba(12,30,51,0.45)]">
        {children}
      </div>
    </section>
  );
}

// ───────────── C-1 · «¿Qué protección necesitas?» (3 preguntas y la recomendación) ─────────────

type Respuestas = { donde?: "puerta" | "cochera" | "coladera"; altura?: "poca" | "media" | "mucha"; ancho?: number };

function recomendar(r: Respuestas): { nombre: string; porque: string } {
  if (r.donde === "coladera") return { nombre: "tapon-inflable-anti-inundaciones", porque: "El agua sube por el drenaje: el tapón inflable sella la coladera o la regadera por dentro." };
  if (r.altura === "mucha" || r.donde === "cochera" || (r.ancho ?? 0) > 120)
    return { nombre: "compuerta-anti-inundaciones-hecha-a-la-medida", porque: "Para entradas anchas (hasta 2.5 m) o agua más alta: la XXL se hace a tu medida, con 60 cm de alto." };
  if (r.altura === "poca") return { nombre: "mini-compuerta", porque: "Para encharcamientos y filtraciones ligeras: la Mini (30 cm de alto) es suficiente y cuesta menos." };
  return { nombre: "compuerta-anti-inundaciones", porque: "Para la entrada de tu casa: detiene hasta 50 cm de agua y la pones en 10 minutos, sin obras." };
}

function C1Quiz({ catalogo }: { catalogo: Record<string, Producto> }) {
  const [paso, setPaso] = useState(0);
  const [r, setR] = useState<Respuestas>({ donde: "puerta", altura: "media", ancho: 95 });
  const preguntas = [
    {
      titulo: "¿Por dónde se te mete el agua?",
      opciones: [
        { v: "puerta", t: "Por la puerta de la casa", i: "🚪" },
        { v: "cochera", t: "Por la cochera o un local ancho", i: "🚗" },
        { v: "coladera", t: "Sube por coladeras o la regadera", i: "🕳️" },
      ],
      clave: "donde" as const,
    },
    {
      titulo: "¿Hasta dónde ha llegado el agua?",
      opciones: [
        { v: "poca", t: "Se encharca (menos de 30 cm)", i: "💧" },
        { v: "media", t: "Hasta la rodilla (30 a 50 cm)", i: "🌊" },
        { v: "mucha", t: "Más de 50 cm", i: "⚠️" },
      ],
      clave: "altura" as const,
    },
  ];
  const fin = paso >= 2;
  const rec = recomendar(r);
  const p = catalogo[rec.nombre];
  return (
    <div className="p-5">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= paso ? "bg-marino" : "bg-linea"}`} />
        ))}
      </div>
      {!fin ? (
        <>
          <p className="m-0 mt-4 text-[13px] font-semibold text-texto-suave">Pregunta {paso + 1} de 2</p>
          <h3 className="titulo-version m-0 mt-1 text-[22px] text-marino">{preguntas[paso].titulo}</h3>
          <div className="mt-4 grid gap-2.5">
            {preguntas[paso].opciones.map((o) => {
              const elegida = r[preguntas[paso].clave] === o.v;
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => {
                    setR({ ...r, [preguntas[paso].clave]: o.v });
                    setPaso(paso + 1);
                  }}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-left text-[16px] font-semibold ${elegida ? "border-marino bg-niebla text-marino" : "border-linea text-tinta"}`}
                >
                  <span className="text-[22px]" aria-hidden="true">
                    {o.i}
                  </span>
                  {o.t}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="m-0 mt-4 text-[13px] font-semibold text-[#1a7f37]">Tu protección ideal</p>
          <div className="mt-2 flex items-center gap-4 rounded-2xl bg-niebla p-3">
            {p?.imagen && <Image src={p.imagen} alt="" width={84} height={84} className="size-[84px] shrink-0 rounded-xl object-cover" />}
            <div>
              <p className="m-0 font-titulo text-[17px] leading-tight font-medium text-marino">{p?.titulo.replace(/ - .*$/, "").replace(/\s*\(.*\)$/, "")}</p>
              <p className="m-0 mt-1 font-titulo text-[22px] font-semibold text-marino">{p ? pesos(p.precio) : ""}</p>
            </div>
          </div>
          <p className="m-0 mt-3 text-[15px] leading-[1.5] text-tinta">{rec.porque}</p>
          <button type="button" className={`${BOTON} mt-4`}>
            Ver mi protección →
          </button>
          <button type="button" onClick={() => setPaso(0)} className="mt-2 w-full cursor-pointer py-2 text-[14px] font-semibold text-marino underline">
            Volver a empezar
          </button>
        </>
      )}
    </div>
  );
}

// ───────────── C-2 · Simulador: «¿Hasta dónde te protege?» (sube el agua) ─────────────

const ALTOS = [
  { nombre: "Mini", alto: 30 },
  { nombre: "Compuerta", alto: 50 },
  { nombre: "XXL", alto: 60 },
];

function C2Simulador() {
  const [nivel, setNivel] = useState(42);
  const [modelo, setModelo] = useState(1);
  const alto = ALTOS[modelo].alto;
  const PISO = 232;
  const CM = 2; // 1 cm = 2 px
  const yAgua = PISO - nivel * CM;
  const pasa = nivel > alto;
  return (
    <div className="p-5">
      <div className="flex gap-1.5 rounded-xl bg-niebla p-1">
        {ALTOS.map((a, i) => (
          <button key={a.nombre} type="button" onClick={() => setModelo(i)} className={`flex h-12 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg leading-tight ${i === modelo ? "bg-white text-marino shadow" : "text-texto-suave"}`}>
            <span className="text-[14.5px] font-semibold">{a.nombre}</span>
            <span className="text-[12px]">{a.alto} cm de alto</span>
          </button>
        ))}
      </div>
      <svg viewBox="0 0 320 250" className="mt-3 w-full" role="img" aria-label={`Agua a ${nivel} cm con la ${ALTOS[modelo].nombre} de ${alto} cm`}>
        {/* Regla */}
        {[20, 40, 60, 80, 100].map((cm) => (
          <g key={cm}>
            <line x1="18" x2="28" y1={PISO - cm * CM} y2={PISO - cm * CM} stroke="#45566a" strokeWidth="1.5" />
            <text x="2" y={PISO - cm * CM + 4} fontSize="10" fill="#45566a">
              {cm}
            </text>
          </g>
        ))}
        {/* Afuera: el agua de la calle */}
        <rect x="30" y={yAgua} width="110" height={PISO - yAgua} fill="#5aa0e6" opacity="0.75" />
        {/* Marco y puerta */}
        <rect x="140" y="20" width="120" height={PISO - 20} fill="#f2f5f9" stroke="#0c1e33" strokeWidth="3" />
        <rect x="150" y="30" width="100" height={PISO - 30} fill="#c98b4e" opacity="0.35" />
        {/* Adentro: seco o con agua */}
        <rect x="260" y={pasa ? PISO - Math.min(nivel - alto, 30) * CM : PISO} width="60" height={pasa ? Math.min(nivel - alto, 30) * CM : 0} fill="#5aa0e6" opacity="0.75" />
        {/* La compuerta */}
        <rect x="134" y={PISO - alto * CM} width="132" height={alto * CM} rx="4" fill="#111c2b" />
        <text x="200" y={PISO - alto * CM + 18} fontSize="11" fill="#fff" textAnchor="middle" fontWeight="600">
          Diluvium
        </text>
        <line x1="0" x2="320" y1={PISO} y2={PISO} stroke="#0c1e33" strokeWidth="3" />
        <text x="62" y="245" fontSize="11" fill="#45566a">
          Calle
        </text>
        <text x="270" y="245" fontSize="11" fill="#45566a">
          Tu casa
        </text>
      </svg>
      <label className="mt-2 block text-[14.5px] font-semibold text-tinta">
        Sube el agua: <span className="text-marino tabular-nums">{nivel} cm</span>
        <input type="range" min={0} max={90} value={nivel} onChange={(e) => setNivel(Number(e.target.value))} className="mt-2 w-full accent-[#0a559a]" />
      </label>
      <p className={`m-0 mt-3 rounded-xl px-4 py-3 text-[15.5px] font-semibold ${pasa ? "bg-[#fdecea] text-[#b42318]" : "bg-[#e3f5e8] text-[#1a7f37]"}`}>
        {pasa ? `El agua pasa por encima: necesitas más de ${alto} cm. ${modelo < 2 ? "Prueba la XXL." : "Escríbenos y la hacemos a tu medida."}` : `Tu casa sigue seca: la ${ALTOS[modelo].nombre} detiene hasta ${alto} cm.`}
      </p>
    </div>
  );
}

// ───────────── C-3 · «Conoce cada pieza» (foto con puntos que se tocan) ─────────────

const PIEZAS = [
  { x: 80, y: 26, nombre: "Funda de neopreno impermeable", texto: "Cubre la compuerta completa: el agua no la atraviesa y se lava con agua y jabón." },
  { x: 52, y: 60, nombre: "Gato mecánico", texto: "Al girarlo, la compuerta se abre a presión contra el marco de tu puerta. Sin taladro ni tornillos." },
  { x: 16, y: 70, nombre: "Marco de acero", texto: "De alta resistencia: aguanta el empuje del agua y los golpes de lo que arrastra la corriente." },
  { x: 88, y: 88, nombre: "Tira de hule en el contorno", texto: "Sella la orilla contra el piso y el marco para que no se cuele el agua." },
];

function C3Piezas() {
  const [activa, setActiva] = useState(1);
  return (
    <div className="p-5">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        <Image src="/media/files/1.Compuertarecta.jpg" alt="Compuerta Diluvium por delante y por detrás" fill sizes="350px" className="object-contain" />
        {PIEZAS.map((p, i) => (
          <button
            key={p.nombre}
            type="button"
            onClick={() => setActiva(i)}
            aria-label={p.nombre}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className={`absolute flex size-9 -translate-1/2 cursor-pointer items-center justify-center rounded-full border-[3px] border-white font-titulo text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(12,30,51,0.45)] ${i === activa ? "bg-boton ring-4 ring-boton/30" : "bg-marino"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-niebla p-4">
        <p className="m-0 font-titulo text-[18px] font-medium text-marino">
          {activa + 1}. {PIEZAS[activa].nombre}
        </p>
        <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-tinta">{PIEZAS[activa].texto}</p>
        <div className="mt-3 flex gap-1.5">
          {PIEZAS.map((p, i) => (
            <button key={p.nombre} type="button" onClick={() => setActiva(i)} aria-label={`Ver ${p.nombre}`} className={`h-1.5 flex-1 cursor-pointer rounded-full ${i === activa ? "bg-marino" : "bg-linea"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────── C-4 · Mapa: «Familias protegidas en todo México» ─────────────

const MAPA: [string, string, number, number][] = [
  ["BC", "Baja California", 0, 0], ["SON", "Sonora", 1, 0], ["CHIH", "Chihuahua", 2, 0], ["COAH", "Coahuila", 3, 0], ["NL", "Nuevo León", 4, 0],
  ["BCS", "Baja California Sur", 0, 1], ["SIN", "Sinaloa", 1, 1], ["DGO", "Durango", 2, 1], ["ZAC", "Zacatecas", 3, 1], ["SLP", "San Luis Potosí", 4, 1], ["TAMPS", "Tamaulipas", 5, 1],
  ["NAY", "Nayarit", 1, 2], ["JAL", "Jalisco", 2, 2], ["AGS", "Aguascalientes", 3, 2], ["GTO", "Guanajuato", 4, 2], ["QRO", "Querétaro", 5, 2], ["VER", "Veracruz", 6, 2],
  ["COL", "Colima", 2, 3], ["MICH", "Michoacán", 3, 3], ["MEX", "Edo. de México", 4, 3], ["HGO", "Hidalgo", 5, 3], ["PUE", "Puebla", 6, 3], ["YUC", "Yucatán", 9, 3],
  ["GRO", "Guerrero", 3, 4], ["MOR", "Morelos", 4, 4], ["CDMX", "Ciudad de México", 5, 4], ["TLAX", "Tlaxcala", 6, 4], ["TAB", "Tabasco", 7, 4], ["CAMP", "Campeche", 8, 4], ["QROO", "Quintana Roo", 9, 4],
  ["OAX", "Oaxaca", 5, 5], ["CHIS", "Chiapas", 7, 5],
];

function C4Mapa({ estados }: { estados: DatosPropuestas["estados"] }) {
  const conResenas = Object.entries(estados).sort((a, b) => b[1].n - a[1].n);
  const [elegido, setElegido] = useState(conResenas[0]?.[0] ?? "VER");
  const e = estados[elegido];
  const nombre = MAPA.find((m) => m[0] === elegido)?.[1] ?? elegido;
  return (
    <div className="p-5">
      <p className="m-0 font-titulo text-[30px] leading-none font-semibold text-marino">
        {conResenas.length} estados
        <span className="block pt-1 text-[15px] font-normal text-texto-suave">nos cuentan cómo les fue (de las reseñas publicadas)</span>
      </p>
      <div className="relative mt-4 grid grid-cols-10 gap-[3px]" style={{ gridTemplateRows: "repeat(6, 1fr)" }}>
        {MAPA.map(([id, n, c, f]) => {
          const datos = estados[id];
          return (
            <button
              key={id}
              type="button"
              disabled={!datos}
              onClick={() => setElegido(id)}
              title={n}
              style={{ gridColumn: c + 1, gridRow: f + 1 }}
              className={`relative flex aspect-square items-center justify-center rounded-[6px] text-[8.5px] font-bold ${
                id === elegido ? "bg-boton text-white" : datos ? "cursor-pointer bg-marino text-white" : "bg-[#dfe7f0] text-[#8aa0b8]"
              }`}
            >
              {id}
              {datos && <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-white text-[9px] text-marino shadow">{datos.n}</span>}
            </button>
          );
        })}
      </div>
      {e && (
        <figure className="m-0 mt-4 rounded-2xl bg-niebla p-4">
          <p className="m-0 text-[13px] font-semibold text-boton uppercase">{nombre} · {e.n} {e.n === 1 ? "reseña" : "reseñas"}</p>
          <blockquote className="m-0 mt-1.5 text-[15px] leading-[1.5] text-tinta">«{e.cita.length > 170 ? `${e.cita.slice(0, 167).replace(/\s+\S*$/, "")}…` : e.cita}»</blockquote>
          <figcaption className="mt-2 text-[14px] font-bold text-marino">{e.nombre}</figcaption>
        </figure>
      )}
    </div>
  );
}

// ───────────── C-5 · «¿Cuánto te cuesta una inundación?» ─────────────

// Precios de referencia para comparar (el dueño los cambia en el editor). No son de ninguna fuente: aproximados.
const COSAS = [
  { nombre: "Refrigerador", costo: 12000, i: "🧊" },
  { nombre: "Sala", costo: 15000, i: "🛋️" },
  { nombre: "Colchón y base", costo: 8000, i: "🛏️" },
  { nombre: "Lavadora", costo: 9000, i: "🫧" },
  { nombre: "Piso y pintura", costo: 10000, i: "🧱" },
  { nombre: "Muebles de madera", costo: 7000, i: "🪑" },
];

function C5Costo({ precio }: { precio: number }) {
  const [marcadas, setMarcadas] = useState<number[]>([0, 1, 4]);
  const total = useMemo(() => marcadas.reduce((t, i) => t + COSAS[i].costo, 0), [marcadas]);
  const veces = total ? Math.max(1, Math.round(total / precio)) : 0;
  return (
    <div className="p-5">
      <p className="m-0 text-[15px] font-semibold text-tinta">Marca lo que se te podría mojar:</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {COSAS.map((c, i) => {
          const si = marcadas.includes(i);
          return (
            <button
              key={c.nombre}
              type="button"
              aria-pressed={si}
              onClick={() => setMarcadas(si ? marcadas.filter((x) => x !== i) : [...marcadas, i])}
              className={`flex min-h-[68px] cursor-pointer flex-col items-start justify-center rounded-xl border-2 px-3 text-left ${si ? "border-marino bg-niebla" : "border-linea"}`}
            >
              <span className="text-[14.5px] font-semibold text-tinta">
                {c.i} {c.nombre}
              </span>
              <span className="text-[13px] text-texto-suave tabular-nums">~{pesos(c.costo)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid gap-2">
        <div>
          <div className="flex justify-between text-[14px] font-semibold">
            <span className="text-[#b42318]">Lo que podrías perder</span>
            <span className="text-[#b42318] tabular-nums">{pesos(total)}</span>
          </div>
          <div className="mt-1 h-3 rounded-full bg-[#fdecea]">
            <div className="h-3 rounded-full bg-[#e5484d]" style={{ width: "100%" }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[14px] font-semibold">
            <span className="text-[#1a7f37]">Tu compuerta Diluvium</span>
            <span className="text-[#1a7f37] tabular-nums">{pesos(precio)}</span>
          </div>
          <div className="mt-1 h-3 rounded-full bg-[#e3f5e8]">
            <div className="h-3 rounded-full bg-[#1a7f37]" style={{ width: `${total ? Math.max(4, Math.min(100, (precio / total) * 100)) : 0}%` }} />
          </div>
        </div>
      </div>
      {total > 0 && (
        <p className="m-0 mt-4 rounded-xl bg-marino px-4 py-3 text-center font-titulo text-[17px] font-medium text-white">
          Una sola inundación te costaría {veces > 1 ? `${veces} veces` : "más que"} lo que cuesta tu compuerta.
        </p>
      )}
      <p className="m-0 mt-2 text-center text-[12px] text-texto-suave">Precios aproximados de referencia.</p>
    </div>
  );
}

// ───────────── C-6 · «Prepárate antes de que empiece» (temporada de lluvias) ─────────────

const MESES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function C6Temporada() {
  const hoy = new Date();
  const anio = hoy.getMonth() >= 10 || (hoy.getMonth() === 4 && hoy.getDate() > 15) ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const inicio = new Date(anio, 4, 15); // 15 de mayo: empieza la temporada de huracanes del Pacífico
  const dias = Math.max(0, Math.ceil((inicio.getTime() - hoy.getTime()) / 86400000));
  const mesHoy = hoy.getMonth();
  return (
    <div className="p-5">
      <div className="rounded-2xl bg-marino p-5 text-white">
        <p className="m-0 text-[14px] font-semibold text-white/80">Faltan</p>
        <p className="m-0 font-titulo text-[54px] leading-none font-semibold tabular-nums">{dias} días</p>
        <p className="m-0 mt-1.5 text-[15px] text-white/85">para que empiece la temporada de huracanes {anio} (15 de mayo, en el Pacífico).</p>
      </div>
      <div className="mt-5">
        <div className="grid grid-cols-12 gap-1">
          {MESES.map((m, i) => {
            const lluvia = i >= 5 && i <= 9; // junio a octubre
            const huracan = i >= 4 && i <= 10; // mayo a noviembre
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`flex h-24 w-full items-end overflow-hidden rounded-md ${huracan ? "bg-[#dbe9f8]" : "bg-niebla"}`}>
                  <div className={`w-full rounded-md ${lluvia ? "bg-[#5aa0e6]" : huracan ? "bg-[#a9cdf2]" : "bg-[#e6ecf3]"}`} style={{ height: lluvia ? "90%" : huracan ? "35%" : "12%" }} />
                </div>
                <span className={`text-[12px] font-bold ${i === mesHoy ? "text-boton" : "text-texto-suave"}`}>{m}</span>
                {i === mesHoy && <span className="-mt-1 text-[10px] font-bold text-boton">hoy</span>}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-texto-suave">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-[#5aa0e6]" /> Lluvias fuertes (junio a octubre)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-[#a9cdf2]" /> Huracanes (mayo a noviembre)
          </span>
        </div>
      </div>
      <p className="m-0 mt-4 text-[15px] leading-[1.5] text-tinta">Compra con calma: llega en 3 a 5 días y la pruebas antes de la primera tormenta.</p>
      <button type="button" className={`${BOTON} mt-3`}>
        Protegerme antes de mayo
      </button>
    </div>
  );
}

export function PropuestasC({ datos }: { datos: DatosPropuestas }) {
  const precio = datos.catalogo["compuerta-anti-inundaciones"]?.precio ?? 5500;
  return (
    <main className="version min-h-dvh bg-[#e9edf2] px-6 py-8 text-marino">
      <h1 className="titulo-version m-0 text-[30px]">Propuestas para la versión C</h1>
      <p className="m-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-tinta">
        Partes completamente nuevas: ninguna está en la tienda de hoy (A) ni en B1. Todas funcionan: tócalas. Dime cuáles quieres en C, por ejemplo «C-1, C-2 y C-5».
      </p>
      <div className="mt-8 flex flex-wrap items-start gap-8">
        <Marco n={1} titulo="¿Qué protección necesitas?" idea="Dos preguntas y le dice qué producto le sirve (Compuerta, Mini, XXL o Tapón), con su foto y su precio.">
          <C1Quiz catalogo={datos.catalogo} />
        </Marco>
        <Marco n={2} titulo="¿Hasta dónde te protege?" idea="Sube el agua con el dedo y ve si la Mini (30 cm), la Compuerta (50 cm) o la XXL (60 cm) la detienen.">
          <C2Simulador />
        </Marco>
        <Marco n={3} titulo="Conoce cada pieza" idea="La foto de la compuerta con puntos: al tocar cada uno explica la pieza (funda, gato, marco y tira de hule).">
          <C3Piezas />
        </Marco>
        <Marco n={4} titulo="Familias protegidas en todo México" idea={`Mapa con los estados que mencionan las reseñas publicadas (de ${datos.totalResenas}); al tocar uno sale lo que dijo esa persona.`}>
          <C4Mapa estados={datos.estados} />
        </Marco>
        <Marco n={5} titulo="¿Cuánto te cuesta una inundación?" idea="Marca lo que se te podría mojar y compara lo que perderías contra lo que cuesta la compuerta.">
          <C5Costo precio={precio} />
        </Marco>
        <Marco n={6} titulo="Prepárate antes de que empiece" idea="Cuenta los días para la temporada de huracanes y muestra en qué meses llueve más, para que compren con tiempo.">
          <C6Temporada />
        </Marco>
      </div>
    </main>
  );
}
