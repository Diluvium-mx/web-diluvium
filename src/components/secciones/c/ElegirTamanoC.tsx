"use client";

// Elegir el tamaño en C (dueño, 25-nov-2026: propuesta T3 «Puertas dibujadas a su tamaño»; escribir la medida quedó
// solo para B). Cada tamaño es una puerta dibujada a su ancho real (más angosta o más ancha), con la compuerta puesta
// y su logo, la medida y el precio; se toca la que se parece a tu entrada. Al elegir salen lo que eligió, el precio y
// «Añadir al carrito». El último cuadro («¿Más de 120cm?…») lleva a WhatsApp; abajo, si la entrada es más angosta,
// también WhatsApp. Productos sin medidas (funda, tapón): los mismos cuadros sin dibujo. Un solo tamaño: solo el
// precio y el botón.

import { useRef, useState } from "react";
import { abrirCarrito, agregar, avisoExistencias } from "@/components/carrito/estado";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_C } from "./comun";

export type TamanoC = { id: number; nombre: string; medidas: string; precio: number; precioAntes: number | null; existencias: number | null };
export type TextosTamano = {
  pregunta: string;
  ayuda: string;
  elegida: string;
  teQueda: string;
  lista: string;
  anadir: string;
  agotado: string;
  masAncha: string;
  masAngosta: string;
  masAngostaEnlace: string;
};

const pesos = (n: number) => `$${n.toLocaleString("en-US")}`;
const rango = (m: string) => {
  const r = m.match(/(\d+)\D+(\d+)/);
  return r ? ([Number(r[1]), Number(r[2])] as const) : null;
};

/** La puerta de un tamaño dibujada a escala: una puerta de 2.10 m de alto con el ancho más grande de su rango, la
 *  compuerta negra puesta abajo (60 cm de alto; la Mini, 30) con su logo como viene en la compuerta real (una tercera
 *  parte de su ancho, arriba al centro), el agua afuera y una línea de medida arriba. */
function PuertaC({ ancho: cm, alto = 60, logo }: { ancho: number; alto?: number; logo?: string }) {
  const escala = 126 / 210;
  const ancho = cm * escala;
  const x = 50 - ancho / 2;
  const suelo = 140;
  const compuerta = { alto: alto * escala, ancho: ancho - 3 };
  const arriba = suelo - compuerta.alto;
  const logoAncho = compuerta.ancho * 0.37;
  const logoAlto = logoAncho / 3.57;
  return (
    <svg viewBox="0 0 100 146" className="h-32 w-full" aria-hidden="true" focusable="false">
      {/* Línea de medida */}
      <line x1={x} y1="6" x2={x + ancho} y2="6" stroke="#1663a8" strokeWidth="1.5" />
      <path d={`M${x} 6l4.5-3v6zM${x + ancho} 6l-4.5-3v6z`} fill="#1663a8" />
      {/* Marco y puerta */}
      <rect x={x} y={suelo - 126} width={ancho} height="126" fill="#f4e6d7" stroke="#06182f" strokeWidth="2.6" rx="1.2" />
      <rect x={x + 5} y={suelo - 119} width={Math.max(ancho - 10, 4)} height="46" fill="none" stroke="#06182f" strokeOpacity="0.16" strokeWidth="1.4" rx="1" />
      <circle cx={x + ancho - 7} cy={suelo - 62} r="2.2" fill="#06182f" />
      {/* Agua afuera, a media compuerta */}
      <rect x="0" y={suelo - compuerta.alto * 0.55} width="100" height={compuerta.alto * 0.55 + 6} fill="#9fd2fb" opacity="0.7" />
      {/* La compuerta, dentro del marco, con su logo */}
      <rect x={50 - compuerta.ancho / 2} y={arriba} width={compuerta.ancho} height={compuerta.alto} fill="#0d1117" rx="1.5" />
      {logo && <image href={logo} x={50 - logoAncho / 2} y={arriba + compuerta.alto * 0.1} width={logoAncho} height={logoAlto} preserveAspectRatio="xMidYMid meet" />}
      <line x1="0" y1={suelo} x2="100" y2={suelo} stroke="#06182f" strokeWidth="2" />
    </svg>
  );
}

function Palomita() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ElegirTamanoC({
  tamanos,
  textos,
  enlaceMasAncha,
  enlaceWhatsapp,
  logo,
  altoCompuerta = 60,
}: {
  tamanos: TamanoC[];
  textos: TextosTamano;
  /** WhatsApp para entradas más anchas que el tamaño más grande (si no hay, no sale ese cuadro). */
  enlaceMasAncha?: string;
  enlaceWhatsapp?: string;
  /** Logo que va sobre la compuerta del dibujo (blanco, con fondo transparente). */
  logo?: string;
  /** Alto de la compuerta en cm (60 la estándar, 30 la Mini), para dibujarla a escala. */
  altoCompuerta?: number;
}) {
  const [elegido, setElegido] = useState<number | undefined>(tamanos.length === 1 ? tamanos[0].id : undefined);
  const [aviso, setAviso] = useState("");
  const resultado = useRef<HTMLDivElement>(null);
  const conMedidas = tamanos.length > 1 && tamanos.every((t) => rango(t.medidas));
  const t = tamanos.find((x) => x.id === elegido);
  const elegir = (id: number) => {
    setElegido(id);
    // Que se vea lo que eligió y el botón de comprar (en el celular quedan abajo de los cuadros).
    requestAnimationFrame(() => resultado.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };
  const anadir = () => {
    if (!t || t.existencias === 0) return;
    const r = agregar(t.id, 1);
    setAviso(r.tope !== null ? avisoExistencias(r.tope) : "");
    abrirCarrito({ anadido: true });
  };
  return (
    <div className="text-[#06182f]">
      {tamanos.length > 1 && (
        <>
          <p className="m-0 font-titulo text-[21px] leading-snug font-medium">{textos.pregunta}</p>
          {textos.ayuda && <p className="m-0 mt-1 text-[16px] text-[#45566a]">{textos.ayuda}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label={textos.pregunta}>
            {tamanos.map((x) => {
              const si = x.id === elegido;
              const agotado = x.existencias === 0;
              const r = rango(x.medidas);
              return (
                <button
                  key={x.id}
                  type="button"
                  disabled={agotado}
                  aria-pressed={si}
                  onClick={() => elegir(x.id)}
                  className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-[2.5px] bg-white px-2.5 pt-3 pb-3.5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${si ? "border-[#1663a8] bg-[#eaf4fd]" : "border-[#dbe7f3] hover:border-[#9fb3c8]"}`}
                >
                  {si && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#1663a8] px-2 py-0.5 text-[13px] font-bold text-white">
                      <Palomita />
                      {textos.elegida}
                    </span>
                  )}
                  {conMedidas && r && <PuertaC ancho={r[1]} alto={altoCompuerta} logo={logo} />}
                  <span className="text-[18px] leading-tight font-bold">{conMedidas ? x.medidas : x.nombre}</span>
                  {conMedidas && <span className="text-[15px] leading-tight text-[#45566a]">{x.nombre}</span>}
                  <span className="font-titulo text-[19px] font-semibold">{agotado ? textos.agotado : pesos(x.precio)}</span>
                </button>
              );
            })}
            {conMedidas && enlaceMasAncha && textos.masAncha && (
              <a
                href={enlaceMasAncha}
                target="_blank"
                rel="noopener noreferrer"
                data-evento="toca_whatsapp"
                className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-[2.5px] border-dashed border-[#1a7f37] bg-white px-3 py-4 text-center text-[#14632f]"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-[#e3f5e8]">
                  <IconoWhatsapp className="size-7" />
                </span>
                <span className="text-[16.5px] leading-snug font-semibold">{textos.masAncha}</span>
              </a>
            )}
          </div>
          {conMedidas && enlaceWhatsapp && textos.masAngosta && (
            <p className="m-0 mt-3 text-[16px] text-[#45566a]">
              {textos.masAngosta.replace("{desde}", String(rango(tamanos[0].medidas)?.[0] ?? ""))}{" "}
              <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className="font-semibold text-[#06182f] underline underline-offset-2">
                {textos.masAngostaEnlace}
              </a>
            </p>
          )}
        </>
      )}
      <div ref={resultado} className="scroll-mb-6">
        {t && (
          <div className="mt-5 rounded-2xl bg-[#e3f5e8] p-4" role="status">
            {tamanos.length > 1 && (
              <p className="m-0 text-[17px] text-[#14532d]">
                {textos.teQueda} <strong>{t.nombre}</strong>
                {t.medidas ? ` (${t.medidas})` : ""}
              </p>
            )}
            <p className="m-0 mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-titulo text-[34px] leading-none font-semibold">
              {pesos(t.precio)}
              {t.precioAntes && <s className="text-[19px] font-normal text-[#45566a]">{pesos(t.precioAntes)}</s>}
              {t.precioAntes && <span className="rounded-full bg-white px-3 py-1 text-[16px] font-bold text-[#1a7f37]">-{Math.round(((t.precioAntes - t.precio) / t.precioAntes) * 100)}%</span>}
            </p>
          </div>
        )}
        <button type="button" onClick={anadir} disabled={!t || t.existencias === 0} data-evento="anadir_carrito" className={`${BOTON_C} mt-4 sm:w-full`}>
          {t ? textos.anadir : textos.lista}
        </button>
        {aviso && <p className="m-0 mt-2 text-[16px] font-semibold text-[#b42318]">{aviso}</p>}
      </div>
    </div>
  );
}
