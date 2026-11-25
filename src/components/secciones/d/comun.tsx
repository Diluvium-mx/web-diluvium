// Piezas comunes de la versión D (25-nov-2026): una tienda que te guía paso a paso, basada en cómo vende
// andafacil.com (docs/estudio-andafacil.md), sin el recuadro «Lo que ves es lo que pagas» ni la calculadora de pagos
// (dueño). Para el mismo cliente ideal (40 a 60 años, casi siempre en el celular): letra de 18 px o más, botones de
// 56 px de alto o más y mucho contraste. Se le habla de «tú». Formas de pago: las de B (tarjeta de crédito o débito con
// hasta 6 meses sin intereses, PayPal, y transferencia o depósito por WhatsApp); no hay pago contra entrega.
//
// Aspecto propio de D (distinto de C, que usa franjas azul claro y tarjetas muy redondas): fondo blanco y gris muy
// claro, azul marino profundo, una rayita amarilla bajo cada título, tarjetas con borde fino y sombra suave, el naranja
// de la marca para comprar y el verde para WhatsApp. Nunca el carácter «·»: si se dicen dos cosas, cada una en su
// renglón con su ícono.

export const MARINO_D = "#0b2545";

/** Botón para comprar: naranja de la marca, grande, a todo lo ancho en el celular. */
export const BOTON_D =
  "inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-boton px-7 text-center font-titulo text-[19px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(248,160,29,0.9)] transition-colors hover:bg-boton-encima active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

/** Botón azul marino lleno (la otra acción importante). */
export const BOTON_D_MARINO =
  "inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0b2545] px-7 text-center font-titulo text-[18px] font-semibold text-white transition-colors hover:bg-[#13345e] sm:w-auto";

/** Botón de contorno azul marino. */
export const BOTON_D_CONTORNO =
  "inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#0b2545] bg-white px-7 text-center font-titulo text-[18px] font-semibold text-[#0b2545] transition-colors hover:bg-[#0b2545] hover:text-white sm:w-auto";

/** Botón verde de WhatsApp (letra blanca, contraste alto). */
export const BOTON_D_WHATSAPP =
  "inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#15803d] px-7 text-center font-titulo text-[18px] font-semibold text-white transition-colors hover:bg-[#116932] sm:w-auto";

/** Tarjeta de D: blanca, borde fino y sombra suave. */
export const TARJETA_D = "rounded-xl border border-[#dde2e8] bg-white shadow-[0_10px_28px_-20px_rgba(11,37,69,0.45)]";

/** Fondo de una parte de D: «blanco» (por omisión), «gris» (gris muy claro) o «marino». */
export function claseFondoD(fondo: unknown): string {
  return fondo === "marino" ? "bg-[#0b2545] text-white" : fondo === "gris" ? "bg-[#f4f6f8] text-[#1f2a37]" : "bg-white text-[#1f2a37]";
}

/** Etiqueta pequeña arriba del título (en mayúsculas pequeñas, con su color). */
export function EtiquetaD({ children, oscuro = false }: { children: React.ReactNode; oscuro?: boolean }) {
  if (!children) return null;
  return <p className={`m-0 font-titulo text-[15px] font-bold tracking-[0.06em] uppercase ${oscuro ? "text-[#ffc83d]" : "text-[#9a6700]"}`}>{children}</p>;
}

/** Título de cada parte de D con su rayita amarilla debajo. */
export function TituloD({ id, children, oscuro = false, centrado = false }: { id?: string; children: React.ReactNode; oscuro?: boolean; centrado?: boolean }) {
  return (
    <>
      <h2 id={id} className={`titulo-version m-0 mt-1.5 text-[30px] leading-[1.15] md:text-[40px] ${oscuro ? "text-white" : "text-[#0b2545]"} ${centrado ? "text-center" : ""}`}>
        {children}
      </h2>
      <span className={`mt-3 block h-1.5 w-16 rounded-full bg-[#ffc83d] ${centrado ? "mx-auto" : ""}`} aria-hidden="true" />
    </>
  );
}

/** Una estrella llena. */
export function EstrellaD({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
    </svg>
  );
}

/** Calificación de D: el número primero, luego las estrellas y el texto (dueño, 25-nov-2026). */
export function CalificacionD({ numero, texto, oscuro = false }: { numero: string; texto: string; oscuro?: boolean }) {
  return (
    <p className={`m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[17px] font-semibold ${oscuro ? "text-white" : "text-[#0b2545]"}`}>
      <strong className="font-titulo text-[22px] leading-none">{numero}</strong>
      <span className="flex text-estrella" role="img" aria-label={`${numero} de 5 estrellas`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <EstrellaD key={i} />
        ))}
      </span>
      {texto && <span className={oscuro ? "text-white/90" : "text-[#4a5568]"}>{texto}</span>}
    </p>
  );
}

const TRAZOS: Record<string, string> = {
  envio: "M3 6h11v9H3zM14 9h4l3 3v3h-7zM6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  meses: "M3 6h18v12H3zM3 10h18M7 15h4",
  garantia: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM8.5 12l2.5 2.5 4.5-5",
  pago: "M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5zM12 15v2",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  agua: "M2 15c2 0 2-1.5 4-1.5S8 15 10 15s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 19c2 0 2-1.5 4-1.5S8 19 10 19s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M12 3v8M8.5 7.5L12 11l3.5-3.5",
  gota: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  coladera: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 9h8M7 12h10M8 15h8",
  ancho: "M3 12h18M6 8l-4 4 4 4M18 8l4 4-4 4M3 4v16M21 4v16",
  herramienta: "M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5zM5 3l3 3-2 2-3-3",
  casa: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6",
  medida: "M3 17l14-14 4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2",
  devolucion: "M4 10h11a5 5 0 0 1 0 10h-3M4 10l4-4M4 10l4 4",
  factura: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
  banco: "M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18",
  palomita: "M5 12.5l4.5 4.5L19 7.5",
};

/** Ícono de línea de D por su nombre (envio, meses, garantia, pago, reloj, agua, gota, coladera, ancho, herramienta,
 *  casa, medida, devolucion, factura, banco o palomita). */
export function IconoD({ nombre, className = "size-6" }: { nombre: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={TRAZOS[nombre] ?? TRAZOS.palomita} />
    </svg>
  );
}

/** Datos cortos con su ícono, cada uno en su renglón (en lugar de separarlos con «·»). */
export function ChipsD({ datos, className = "", oscuro = false }: { datos: { id: string; icono: string; texto: string }[]; className?: string; oscuro?: boolean }) {
  const lista = datos.filter((d) => d.texto);
  if (!lista.length) return null;
  return (
    <ul className={`m-0 grid list-none gap-2 p-0 ${className}`}>
      {lista.map((d) => (
        <li key={d.id} data-pieza={d.id} className={`flex items-center gap-3 text-[17px] font-semibold ${oscuro ? "text-white" : "text-[#0b2545]"}`}>
          <span className={`flex size-9 items-center justify-center rounded-full ${oscuro ? "bg-white/10 text-[#ffc83d]" : "bg-[#fff4d1] text-[#7a5200]"}`}>
            <IconoD nombre={d.icono} className="size-5" />
          </span>
          {d.texto}
        </li>
      ))}
    </ul>
  );
}

/** Franja de 3 datos grandes (como la de Andafacil: peso, envío gratis, IVA incluido). */
export function DatosGrandesD({ datos, className = "" }: { datos: { id: string; valor: string; texto: string }[]; className?: string }) {
  const lista = datos.filter((d) => d.valor);
  if (!lista.length) return null;
  return (
    <ul className={`m-0 grid list-none grid-cols-3 divide-x divide-[#dde2e8] rounded-xl border border-[#dde2e8] bg-white p-0 ${className}`}>
      {lista.map((d) => (
        <li key={d.id} data-pieza={d.id} className="px-2 py-4 text-center">
          <span className="block font-titulo text-[24px] leading-none font-bold text-[#0b2545] md:text-[30px]">{d.valor}</span>
          <span className="mt-1.5 block text-[15px] leading-snug text-[#4a5568] md:text-[16px]">{d.texto}</span>
        </li>
      ))}
    </ul>
  );
}

/** «-8%»: cuánto se descuenta del precio de antes (redondeado). */
export function descuento(precio: number, antes: number | null): number | null {
  return antes && antes > precio ? Math.round(((antes - precio) / antes) * 100) : null;
}
