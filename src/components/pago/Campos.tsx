"use client";

// Piezas de formulario de la pantalla de pago, con las medidas de la pantalla en vivo: cajas de 49 px con borde gris y
// esquinas de 12 px; la etiqueta sube dentro de la caja (12 px) en cuanto el campo tiene algo y, vacío, se ve como
// texto de ayuda (14 px). Con error: borde rojo y el mensaje debajo, ligado al campo para lectores de pantalla.

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { IconoAyuda, IconoError, IconoFlecha, IconoPalomita } from "./Iconos";

const CAJA =
  "h-[49px] w-full rounded-[12px] border bg-white px-[10px] text-[14px] leading-[18.9px] text-black outline-none transition-[border-color,box-shadow] duration-100 placeholder:text-tenue focus:border-acento focus:shadow-[0_0_0_1px_var(--color-acento)]";
const CON_ERROR = "border-error shadow-[0_0_0_1px_var(--color-error)] focus:border-error focus:shadow-[0_0_0_1px_var(--color-error)]";
const ETIQUETA = "pointer-events-none absolute top-[7px] left-[11px] max-w-[calc(100%-22px)] truncate text-[12px] leading-[16.2px] text-tenue transition-opacity duration-100";

/** Mensaje de error debajo de un campo («Ingresa un nombre»). */
export function MensajeError({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} className="mt-[6px] flex items-start gap-[5px] text-[12px] leading-[16.2px] text-error">
      <IconoError className="mt-[1px] size-3.5 shrink-0" />
      <span>{texto}</span>
    </p>
  );
}

/** Ícono «?» con su globo de ayuda (al pasar el ratón o con el teclado). */
export function Ayuda({ etiqueta, texto }: { etiqueta: string; texto: string }) {
  const id = useId();
  return (
    <span className="group absolute top-1/2 right-[11px] flex -translate-y-1/2 text-tenue">
      <span role="img" aria-label={etiqueta} tabIndex={0} aria-describedby={id} className="flex rounded-full outline-acento focus-visible:outline-2">
        <IconoAyuda />
      </span>
      <span
        id={id}
        role="tooltip"
        className="invisible absolute right-[-8px] bottom-[calc(100%+8px)] z-10 w-max max-w-[240px] rounded-[8px] bg-black px-[10px] py-[7px] text-[12px] leading-[16.2px] text-white opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {texto}
      </span>
    </span>
  );
}

type PropsCampo = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
  /** Algo a la derecha dentro de la caja (el «?» de ayuda). */
  accesorio?: ReactNode;
  className?: string;
};

/** Campo de texto con la etiqueta que sube al escribir. */
export function Campo({ etiqueta, valor, alCambiar, error, accesorio, className = "", id: idDado, ...resto }: PropsCampo) {
  const idPropio = useId();
  const id = idDado ?? idPropio;
  const lleno = valor !== "";
  return (
    <div className={className}>
      <div className="relative">
        <label htmlFor={id} className={`${ETIQUETA} ${lleno ? "opacity-100" : "opacity-0"}`}>
          {etiqueta}
        </label>
        <input
          id={id}
          value={valor}
          placeholder={etiqueta}
          onChange={(e) => alCambiar(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${CAJA} ${error ? CON_ERROR : "border-borde"} ${lleno ? "pt-[21.05px] pb-[6.05px]" : "pt-[12.55px] pb-[14.55px]"} ${accesorio ? "pr-[40px]" : ""}`}
          {...resto}
        />
        {accesorio}
      </div>
      <MensajeError id={`${id}-error`} texto={error} />
    </div>
  );
}

type PropsSelector = {
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  opciones: { valor: string; texto: string }[];
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
  /** Atributos extra (p. ej. el lugar de los campos seguros de Mercado Pago). */
  datos?: Record<`data-${string}`, string>;
};

/** Lista desplegable con la etiqueta arriba (vacía, la etiqueta se ve como texto de ayuda). */
export function Selector({ etiqueta, valor, alCambiar, opciones, error, className = "", id: idDado, datos, ...resto }: PropsSelector) {
  const idPropio = useId();
  const id = idDado ?? idPropio;
  const lleno = valor !== "" || !opciones.some((o) => o.valor === "");
  return (
    <div className={className} {...datos}>
      <div className="relative">
        <label htmlFor={id} className={`${ETIQUETA} ${lleno ? "opacity-100" : "opacity-0"}`}>
          {etiqueta}
        </label>
        <select
          id={id}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${CAJA} cursor-pointer appearance-none pr-[30px] ${error ? CON_ERROR : "border-borde"} ${lleno ? "pt-[21.05px] pb-[6.05px]" : "py-[13.55px] text-tenue"}`}
          {...resto}
        >
          {opciones.map((o) =>
            o.valor === "" ? (
              <option key="" value="" disabled hidden>
                {o.texto}
              </option>
            ) : (
              <option key={o.valor} value={o.valor} className="text-black">
                {o.texto}
              </option>
            ),
          )}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-[16px] flex -translate-y-1/2 text-tenue">
          <IconoFlecha />
        </span>
      </div>
      <MensajeError id={`${id}-error`} texto={error} />
    </div>
  );
}

/** Casilla cuadrada de 20 px con palomita blanca sobre azul al marcarla. */
export function Casilla({
  etiqueta,
  marcada,
  alCambiar,
  id: idDado,
  name,
  className = "",
}: {
  etiqueta: string;
  marcada: boolean;
  alCambiar: (v: boolean) => void;
  id?: string;
  name?: string;
  className?: string;
}) {
  const idPropio = useId();
  const id = idDado ?? idPropio;
  return (
    <div className={`flex items-start ${className}`}>
      <span className="relative flex size-5 shrink-0">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={marcada}
          onChange={(e) => alCambiar(e.target.checked)}
          className="peer size-5 cursor-pointer appearance-none rounded-[6px] border border-borde bg-white outline-acento checked:border-acento checked:bg-acento focus-visible:outline-2 focus-visible:outline-offset-1"
        />
        <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-white peer-checked:flex">
          <IconoPalomita />
        </span>
      </span>
      <label htmlFor={id} className="mt-px cursor-pointer pl-[8px] text-[14px] leading-[18.9px]">
        {etiqueta}
      </label>
    </div>
  );
}

/** Botón redondo de 18 px: gris sin marcar, azul con centro blanco marcado. Con flechas se cambia de opción. */
export function Redondo({ id, name, marcado, alElegir }: { id: string; name: string; marcado: boolean; alElegir: () => void }) {
  return (
    <input
      id={id}
      name={name}
      type="radio"
      checked={marcado}
      onChange={alElegir}
      className="size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-borde bg-white outline-acento checked:border-[6px] checked:border-acento focus-visible:outline-2 focus-visible:outline-offset-2"
    />
  );
}
