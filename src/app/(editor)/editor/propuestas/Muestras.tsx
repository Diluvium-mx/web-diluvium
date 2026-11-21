// Muestras para elegir (editor local, /editor/propuestas). Solo dibujos fijos a tamaño de celular: nada aquí se publica.
// 21-nov-2026: 3 diseños para los botones «Ver pasos clave» (217) y «Volver al video» (224), y 6 diseños de carrito.

import Image from "next/image";
import type { ReactNode } from "react";

// ───────────────────────── Botones 217 y 224 ─────────────────────────

/** Flecha dibujada (no es un carácter del texto): derecha para avanzar, izquierda para regresar. */
function Flecha({ lado, className = "size-6" }: { lado: "derecha" | "izquierda"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {lado === "derecha" ? <path d="M4 12h15M13 6l6 6-6 6" /> : <path d="M20 12H5M11 6l-6 6 6 6" />}
    </svg>
  );
}

const ICONO_PASOS = (
  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false">
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const ICONO_VIDEO = (
  <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M8 5.5v13l10.5-6.5L8 5.5z" />
  </svg>
);

type Boton = { texto: string; lado: "derecha" | "izquierda"; icono: ReactNode };
export const BOTONES: Boton[] = [
  { texto: "Ver pasos clave", lado: "derecha", icono: ICONO_PASOS },
  { texto: "Volver al video", lado: "izquierda", icono: ICONO_VIDEO },
];

/** 1 · Botón azul lleno: texto blanco y, debajo, la flecha que se mueve suave hacia donde lleva. */
export function BotonAzul({ b }: { b: Boton }) {
  return (
    <span className="flex min-h-[64px] w-full flex-col items-center justify-center gap-0.5 rounded-2xl bg-marino px-5 py-2.5 font-titulo text-[18px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(10,85,154,0.8)]">
      {b.texto}
      <Flecha lado={b.lado} className={`size-6 ${b.lado === "derecha" ? "animate-[empuje-der_1.4s_ease-in-out_infinite]" : "animate-[empuje-izq_1.4s_ease-in-out_infinite]"}`} />
    </span>
  );
}

/** 2 · Botón blanco con borde azul: la flecha va debajo, dentro de un círculo azul. */
export function BotonBorde({ b }: { b: Boton }) {
  return (
    <span className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-[2.5px] border-marino bg-white px-5 py-3 font-titulo text-[18px] font-bold text-marino">
      {b.texto}
      <span className="flex size-8 items-center justify-center rounded-full bg-marino text-white">
        <Flecha lado={b.lado} className="size-5" />
      </span>
    </span>
  );
}

/** 3 · Tarjeta-botón: un dibujo de lo que se va a ver (lista de pasos o video), el texto y la flecha debajo. */
export function BotonTarjeta({ b }: { b: Boton }) {
  return (
    <span className="flex w-full items-center gap-4 rounded-2xl bg-niebla p-3.5 text-marino shadow-[inset_0_0_0_1.5px_var(--color-linea)]">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white text-boton shadow-sm">{b.icono}</span>
      <span className="flex flex-1 flex-col items-start gap-0.5 font-titulo text-[18px] leading-tight font-bold">
        {b.texto}
        <Flecha lado={b.lado} className={`size-6 text-boton ${b.lado === "derecha" ? "animate-[empuje-der_1.4s_ease-in-out_infinite]" : "animate-[empuje-izq_1.4s_ease-in-out_infinite]"}`} />
      </span>
    </span>
  );
}

// ───────────────────────── Carrito ─────────────────────────

const FOTO = "/media/files/Frame697.jpg";
const PRODUCTO = "Compuerta Anti-Inundaciones";
const TAMANO = "Mediana · 91–100 cm";

function Cantidad({ grande = false }: { grande?: boolean }) {
  const t = grande ? "size-12 text-[22px]" : "size-10 text-[20px]";
  return (
    <span className="inline-flex items-center rounded-xl border-2 border-linea bg-white">
      <span className={`flex items-center justify-center font-bold text-marino ${t}`}>−</span>
      <span className={`flex items-center justify-center font-bold text-tinta ${grande ? "w-10 text-[20px]" : "w-8 text-[17px]"}`}>1</span>
      <span className={`flex items-center justify-center font-bold text-marino ${t}`}>+</span>
    </span>
  );
}

function Articulo({ foto = 76, conQuitar = true, grande = false }: { foto?: number; conQuitar?: boolean; grande?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="relative shrink-0 overflow-hidden rounded-xl bg-niebla" style={{ width: foto, height: foto }}>
        <Image src={FOTO} alt="" fill sizes={`${foto}px`} className="object-cover" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`m-0 font-titulo leading-tight font-bold text-marino ${grande ? "text-[19px]" : "text-[16px]"}`}>{PRODUCTO}</p>
        <p className={`m-0 mt-0.5 text-texto-suave ${grande ? "text-[17px]" : "text-[14.5px]"}`}>{TAMANO}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <Cantidad grande={grande} />
          <span className="text-right">
            <s className="block text-[13px] text-texto-suave">$5,999</s>
            <strong className={`text-tinta ${grande ? "text-[20px]" : "text-[17px]"}`}>$5,500</strong>
          </span>
        </div>
        {conQuitar && <span className="mt-1 inline-block text-[13.5px] font-semibold text-texto-suave underline underline-offset-2">Quitar</span>}
      </div>
    </div>
  );
}

const Palomita = ({ className = "size-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

function Total({ grande = false }: { grande?: boolean }) {
  return (
    <div className={`grid gap-1.5 ${grande ? "text-[18px]" : "text-[15.5px]"}`}>
      <p className="m-0 flex justify-between text-tinta">
        <span>Envío</span>
        <strong className="text-[#13834a]">Gratis</strong>
      </p>
      <p className="m-0 flex items-baseline justify-between text-tinta">
        <span className="font-bold">Total</span>
        <strong className={grande ? "text-[30px]" : "text-[24px]"}>$5,500</strong>
      </p>
      <p className="m-0 text-right text-[13px] text-texto-suave">IVA incluido · hasta 6 meses sin intereses</p>
    </div>
  );
}

function Pagar({ texto = "Pagar ahora", grande = false }: { texto?: string; grande?: boolean }) {
  return (
    <span className={`flex w-full items-center justify-center rounded-2xl bg-boton font-titulo font-bold text-white shadow-[0_8px_20px_-10px_rgba(248,160,29,0.9)] ${grande ? "min-h-16 text-[21px]" : "min-h-14 text-[18px]"}`}>
      {texto}
    </span>
  );
}

function Pantalla({ children, fondo = true }: { children: ReactNode; fondo?: boolean }) {
  // Celular de 375 × 740 con la página de atrás oscurecida.
  return (
    <div className="relative h-[740px] w-[375px] overflow-hidden rounded-[28px] border-[7px] border-tinta bg-[#d8dee6]">
      <div className="absolute inset-0 bg-[linear-gradient(#fff_0_64px,#eef2f6_64px_100%)]" />
      {fondo && <div className="absolute inset-0 bg-tinta/55" />}
      {children}
    </div>
  );
}

const Cerrar = () => <span className="flex size-11 items-center justify-center rounded-full text-[26px] leading-none text-marino">×</span>;

/** 1 · Lateral claro: entra desde la derecha; artículo, envío gratis, total grande y un solo botón. */
export function CarritoLateral() {
  return (
    <Pantalla>
      <div className="absolute inset-y-0 right-0 flex w-[92%] flex-col bg-white">
        <div className="flex items-center justify-between border-b border-linea py-2 pr-2 pl-5">
          <strong className="font-titulo text-[20px] text-marino">Tu carrito (1)</strong>
          <Cerrar />
        </div>
        <div className="flex-1 p-5">
          <Articulo />
        </div>
        <div className="grid gap-3 border-t border-linea p-5">
          <Total />
          <Pagar />
          <p className="m-0 text-center text-[14px] font-semibold text-marino underline underline-offset-2">Seguir viendo</p>
        </div>
      </div>
    </Pantalla>
  );
}

/** 2 · Hoja desde abajo: sube desde abajo hasta donde llega el pulgar; confirma lo agregado con una palomita. */
export function CarritoHoja() {
  return (
    <Pantalla>
      <div className="absolute inset-x-0 bottom-0 rounded-t-[26px] bg-white px-5 pt-2.5 pb-6 shadow-[0_-12px_40px_-12px_rgba(12,30,51,0.5)]">
        <span className="mx-auto block h-1.5 w-12 rounded-full bg-linea" />
        <p className="m-0 mt-4 flex items-center gap-2 font-titulo text-[18px] font-bold text-[#13834a]">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#13834a] text-white">
            <Palomita className="size-4" />
          </span>
          Se agregó a tu carrito
        </p>
        <div className="mt-4">
          <Articulo foto={68} conQuitar={false} />
        </div>
        <div className="mt-4 border-t border-linea pt-4">
          <Total />
        </div>
        <div className="mt-4 grid gap-2.5">
          <Pagar />
          <span className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-marino font-titulo text-[17px] font-bold text-marino">Seguir viendo</span>
        </div>
      </div>
    </Pantalla>
  );
}

/** 3 · Confirmación grande: toda la pantalla dice «¡Listo!», con la foto grande y la opción de agregar otra puerta. */
export function CarritoConfirmacion() {
  return (
    <Pantalla fondo={false}>
      <div className="absolute inset-0 flex flex-col bg-white px-6 pt-5 pb-6">
        <div className="flex justify-end">
          <Cerrar />
        </div>
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e6f6ea] text-[#13834a]">
          <Palomita className="size-9" />
        </span>
        <p className="m-0 mt-3 text-center font-titulo text-[24px] leading-tight font-bold text-marino">¡Listo! Ya está en tu carrito</p>
        <div className="relative mx-auto mt-5 size-[180px] overflow-hidden rounded-2xl bg-niebla">
          <Image src={FOTO} alt="" fill sizes="180px" className="object-cover" />
        </div>
        <p className="m-0 mt-3 text-center font-titulo text-[18px] font-bold text-marino">{PRODUCTO}</p>
        <p className="m-0 text-center text-[16px] text-texto-suave">{TAMANO} · 1 pieza</p>
        <p className="m-0 mt-2 text-center text-[26px] font-bold text-tinta">
          $5,500 <span className="text-[15px] font-semibold text-[#13834a]">· envío gratis</span>
        </p>
        <div className="mt-auto grid gap-2.5">
          <Pagar texto="Ir a pagar" />
          <span className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-marino font-titulo text-[17px] font-bold text-marino">+ Agregar otra puerta</span>
        </div>
      </div>
    </Pantalla>
  );
}

/** 4 · Con lo que incluye: debajo del artículo, la lista de lo que la persona gana al comprar y cómo puede pagar. */
export function CarritoBeneficios() {
  const lista = ["Envío gratis a todo México", "Llega en 3 a 5 días hábiles", "1 año de garantía", "Hasta 6 meses sin intereses"];
  return (
    <Pantalla>
      <div className="absolute inset-y-0 right-0 flex w-[92%] flex-col bg-white">
        <div className="flex items-center justify-between border-b border-linea py-2 pr-2 pl-5">
          <strong className="font-titulo text-[20px] text-marino">Tu carrito (1)</strong>
          <Cerrar />
        </div>
        <div className="flex-1 overflow-hidden p-5">
          <Articulo />
          <ul className="m-0 mt-5 grid list-none gap-2 rounded-2xl bg-niebla p-4">
            {lista.map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[15.5px] font-semibold text-tinta">
                <span className="text-[#13834a]">
                  <Palomita />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3 border-t border-linea p-5">
          <Total />
          <Pagar />
          <p className="m-0 flex flex-wrap justify-center gap-1.5 text-[11.5px] font-bold text-texto-suave">
            {["VISA", "Mastercard", "Mercado Pago", "PayPal"].map((m) => (
              <span key={m} className="rounded-md border border-linea px-2 py-1">
                {m}
              </span>
            ))}
          </p>
        </div>
      </div>
    </Pantalla>
  );
}

/** 5 · Pago rápido: arriba los botones para pagar en un toque con la cuenta que ya tienen; abajo, con tarjeta. */
export function CarritoRapido() {
  return (
    <Pantalla>
      <div className="absolute inset-y-0 right-0 flex w-[92%] flex-col bg-white">
        <div className="flex items-center justify-between border-b border-linea py-2 pr-2 pl-5">
          <strong className="font-titulo text-[20px] text-marino">Tu carrito (1)</strong>
          <Cerrar />
        </div>
        <div className="flex-1 p-5">
          <Articulo />
          <div className="mt-5 border-t border-linea pt-4">
            <Total />
          </div>
        </div>
        <div className="grid gap-2.5 border-t border-linea p-5">
          <p className="m-0 text-center text-[13.5px] font-semibold text-texto-suave">Paga en un toque con tu cuenta</p>
          <span className="flex min-h-13 items-center justify-center rounded-2xl bg-[#009ee3] font-titulo text-[17px] font-bold text-white">Pagar con Mercado Pago</span>
          <span className="flex min-h-13 items-center justify-center rounded-2xl bg-[#ffc439] font-titulo text-[17px] font-bold text-[#123c74]">Pagar con PayPal</span>
          <p className="m-0 flex items-center gap-2 text-[13px] text-texto-suave">
            <span className="h-px flex-1 bg-linea" /> o <span className="h-px flex-1 bg-linea" />
          </p>
          <Pagar texto="Pagar con tarjeta" />
        </div>
      </div>
    </Pantalla>
  );
}

/** 6 · Letra grande y ayuda a la mano: todo más grande, un solo botón enorme y WhatsApp por si hay dudas. */
export function CarritoGrande() {
  return (
    <Pantalla>
      <div className="absolute inset-x-0 bottom-0 top-10 flex flex-col rounded-t-[26px] bg-white">
        <div className="flex items-center justify-between py-2 pr-2 pl-5">
          <strong className="font-titulo text-[23px] text-marino">Tu compra</strong>
          <Cerrar />
        </div>
        <div className="flex-1 px-5">
          <Articulo foto={92} grande conQuitar={false} />
          <div className="mt-6 border-t-2 border-linea pt-5">
            <Total grande />
          </div>
        </div>
        <div className="grid gap-3 p-5">
          <Pagar texto="Pagar $5,500" grande />
          <span className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#1f9d55] font-titulo text-[18px] font-bold text-[#1f7a45]">¿Dudas? Escríbenos por WhatsApp</span>
        </div>
      </div>
    </Pantalla>
  );
}

export const CARRITOS = [
  { id: "1", nombre: "1 · Lateral claro", idea: "Entra desde la derecha, como el de hoy pero limpio: el artículo, «Envío gratis», el total grande y un solo botón naranja. Sin notas de pedido ni letras chiquitas.", Muestra: CarritoLateral },
  { id: "2", nombre: "2 · Hoja desde abajo", idea: "Sube desde abajo como en las apps de Mercado Libre o Amazon: los botones quedan donde llega el pulgar y una palomita verde confirma que sí se agregó.", Muestra: CarritoHoja },
  { id: "3", nombre: "3 · Confirmación grande", idea: "Toda la pantalla dice «¡Listo!» con la foto grande. Pensado para quien duda si sí se agregó; trae «+ Agregar otra puerta» para quien protege varias entradas.", Muestra: CarritoConfirmacion },
  { id: "4", nombre: "4 · Con lo que incluye", idea: "Debajo del artículo, la lista de lo que gana al comprar (envío gratis, 3 a 5 días, garantía, meses sin intereses) y las formas de pago: quita miedo justo antes de pagar.", Muestra: CarritoBeneficios },
  { id: "5", nombre: "5 · Pago rápido", idea: "Botones para pagar en un toque con la cuenta de Mercado Pago o PayPal que ya tienen (sin escribir la tarjeta). Es lo que más usan las tiendas grandes hoy; para 30–50 años puede ser una opción de más.", Muestra: CarritoRapido },
  { id: "6", nombre: "6 · Letra grande y ayuda", idea: "Todo más grande (para leer sin lentes), un solo botón enorme con el precio y WhatsApp a la mano por si tienen una duda antes de pagar.", Muestra: CarritoGrande },
];
