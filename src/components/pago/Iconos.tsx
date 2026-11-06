// Íconos y logotipos de la pantalla de pago, dibujados aquí (nada se pide a otro sitio). Los íconos usan el color del
// texto; los logotipos de tarjetas y pasarelas van en 38 × 24 px, como en vivo.

type PropsIcono = { className?: string };

const TRAZO = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function IconoBolsa({ className = "size-6" }: PropsIcono) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true" focusable="false">
      <path {...TRAZO} d="M2.6 4.6h8.8l-.5 6.9a1.2 1.2 0 0 1-1.2 1.1H4.3a1.2 1.2 0 0 1-1.2-1.1z" />
      <path {...TRAZO} d="M4.9 6.4V3.6a2.1 2.1 0 0 1 4.2 0v2.8" />
    </svg>
  );
}

export function IconoFlecha({ className = "size-2.5", arriba = false }: PropsIcono & { arriba?: boolean }) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true" focusable="false">
      <path {...TRAZO} strokeWidth={1.6} d={arriba ? "M2.5 9.5 7 5l4.5 4.5" : "M2.5 4.5 7 9l4.5-4.5"} />
    </svg>
  );
}

export function IconoAyuda({ className = "size-[18px]" }: PropsIcono) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true" focusable="false">
      <circle {...TRAZO} strokeWidth={1.1} cx="7" cy="7" r="5.9" />
      <path {...TRAZO} strokeWidth={1.1} d="M5.4 5.5a1.65 1.65 0 0 1 3.2.5c0 1.1-1.6 1.4-1.6 2.3" />
      <circle cx="7" cy="10.1" r=".65" fill="currentColor" />
    </svg>
  );
}

export function IconoPalomita({ className = "size-2.5" }: PropsIcono) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true" focusable="false">
      <path {...TRAZO} strokeWidth={2.2} d="m2.5 7.4 3 3 6-6.4" />
    </svg>
  );
}

export function IconoCandado({ className = "size-[18px]" }: PropsIcono) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true" focusable="false">
      <rect {...TRAZO} strokeWidth={1.1} x="2.6" y="6" width="8.8" height="6.4" rx="1.3" />
      <path {...TRAZO} strokeWidth={1.1} d="M4.6 6V4.3a2.4 2.4 0 0 1 4.8 0V6" />
    </svg>
  );
}

export function IconoEtiqueta({ className = "size-3.5" }: PropsIcono) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true" focusable="false">
      <path {...TRAZO} d="M7.6 1.5h4.1c.4 0 .8.4.8.8v4.1L6.6 12.3a1 1 0 0 1-1.4 0L1.7 8.8a1 1 0 0 1 0-1.4z" />
      <circle cx="10" cy="4" r=".9" fill="currentColor" />
    </svg>
  );
}

export function IconoError({ className = "size-3.5" }: PropsIcono) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="6.3" fill="currentColor" />
      <path d="M7 3.8v3.8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="10" r=".85" fill="#fff" />
    </svg>
  );
}

const LOGO = "h-6 w-[38px] shrink-0";

export function LogoVisa({ className = LOGO }: PropsIcono) {
  return (
    <svg viewBox="0 0 38 24" className={className} role="img" aria-label="Visa">
      <rect width="38" height="24" rx="3" fill="#0e2ed8" />
      <text x="19" y="16.6" textAnchor="middle" fill="#fff" fontSize="11.5" fontWeight="800" fontStyle="italic" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-.3">
        VISA
      </text>
    </svg>
  );
}

export function LogoMastercard({ className = LOGO }: PropsIcono) {
  return (
    <svg viewBox="0 0 38 24" className={className} role="img" aria-label="Mastercard">
      <rect width="38" height="24" rx="3" fill="#1b1f1f" />
      <circle cx="15" cy="12" r="7" fill="#ff0207" />
      <circle cx="23" cy="12" r="7" fill="#ff9a00" />
      <path d="M19 6.3a7 7 0 0 1 0 11.4 7 7 0 0 1 0-11.4z" fill="#ff5f00" />
    </svg>
  );
}

export function LogoAmex({ className = LOGO }: PropsIcono) {
  return (
    <svg viewBox="0 0 38 24" className={className} role="img" aria-label="American Express">
      <rect width="38" height="24" rx="3" fill="#0472d1" />
      <g fill="none" stroke="#fff" strokeWidth=".9" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="10.5" textAnchor="middle">
        <text x="25" y="11">AM</text>
        <text x="27" y="21.5">EX</text>
      </g>
    </svg>
  );
}

export function LogoMercadoPago({ className = LOGO }: PropsIcono) {
  return (
    <svg viewBox="0 0 38 24" className={className} role="img" aria-label="Mercado Pago">
      <rect width="38" height="24" rx="3" fill="#ffe508" />
      <ellipse cx="19" cy="12" rx="11" ry="7.2" fill="#0b3b8c" />
      <ellipse cx="19" cy="12" rx="9.6" ry="5.9" fill="#4fc3f7" />
      <path d="M10.5 11.2c2.2-1.6 4.6-2.4 6.4-1.4l2.3 1.2 2-1.3c1.7-.9 4.3-.4 6.3 1.4-1.6 2.6-5.3 4.2-8.4 4.2s-6.9-1.5-8.6-4.1z" fill="#fff" />
      <path d="M14.2 12.6 16 14M16.4 11.8l2 1.7M18.6 11.2l1.9 1.6" stroke="#0b3b8c" strokeWidth=".6" strokeLinecap="round" />
    </svg>
  );
}

/** «PayPal» en sus dos azules (el botón del carrito lo dibuja igual, con letra). */
export function LogoPaypal({ className = "text-[15px]" }: PropsIcono) {
  return (
    <span
      className={`leading-none font-bold tracking-[-0.4px] italic [font-family:Verdana,Helvetica,Arial,sans-serif] ${className}`}
      role="img"
      aria-label="PayPal"
    >
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009cde]">Pal</span>
    </span>
  );
}
