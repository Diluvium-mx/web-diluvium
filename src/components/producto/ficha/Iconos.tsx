// Íconos de la ficha de producto, dibujados para Diluvium (trazos simples). No son los del tema ni los de las apps.

import type { ReactNode } from "react";

type Props = { className?: string; ancho?: number; alto?: number };

/** Ícono de trazo en una caja de 25×24, como los del tema (se escala al ancho y alto que se pidan). */
function Trazo({ className, ancho = 24, alto, children }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 25 24"
      width={ancho}
      height={alto ?? ancho}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconoCamion = (p: Props) => (
  <Trazo {...p}>
    <path d="M2.5 6h11v10h-11z" />
    <path d="M13.5 9h4l3.5 3.5V16h-7.5" />
    <circle cx="6.5" cy="17.5" r="1.8" fill="white" />
    <circle cx="17" cy="17.5" r="1.8" fill="white" />
    <path d="M4.5 9.5h4M4.5 12.5h6" />
  </Trazo>
);

export const IconoEstrella = (p: Props) => (
  <Trazo {...p}>
    <path d="m12.5 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2-4.5-4.4 6.2-.9z" />
  </Trazo>
);

export const IconoPalomaCirculo = (p: Props) => (
  <Trazo {...p}>
    <circle cx="12.5" cy="12" r="9" />
    <path d="m8.5 12.2 2.8 2.8 5.2-5.5" />
  </Trazo>
);

export const IconoMas = (p: Props) => (
  <Trazo {...p}>
    <path d="M12.5 5v14M5.5 12h14" />
  </Trazo>
);

export const IconoMenos = (p: Props) => (
  <Trazo {...p}>
    <path d="M5.5 12h14" />
  </Trazo>
);

export const IconoEtiqueta = (p: Props) => (
  <Trazo {...p}>
    <path d="M13.5 3.5h7v7l-9.5 9.5a1.4 1.4 0 0 1-2 0L4 15a1.4 1.4 0 0 1 0-2z" />
    <circle cx="16.8" cy="7.2" r="1" />
  </Trazo>
);

export const IconoBarras = (p: Props) => (
  <Trazo {...p}>
    <path d="M7.5 5v14M12.5 5v14M17.5 5v14" />
  </Trazo>
);

export const IconoFlechaAbajo = (p: Props) => (
  <Trazo {...p}>
    <path d="m6.5 9 6 6 6-6" />
  </Trazo>
);

export const IconoFlechaDerecha = (p: Props) => (
  <Trazo {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Trazo>
);

export const IconoLupa = (p: Props) => (
  <Trazo {...p}>
    <circle cx="11" cy="10.5" r="6.5" />
    <path d="m16 15.5 4.5 4.5M11 7.5v6M8 10.5h6" />
  </Trazo>
);

export const IconoPlay = (p: Props) => (
  <Trazo {...p}>
    <path d="M8.5 5v14l11-7z" />
  </Trazo>
);

export const IconoCerrar = (p: Props) => (
  <Trazo {...p}>
    <path d="m6.5 6 12 12M18.5 6l-12 12" />
  </Trazo>
);

/** Palomita dentro de un círculo verde, de la lista de ventajas (16 px). */
export function IconoPalomaVerde({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} className={className} aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.9" fill="none" stroke="#53a537" strokeWidth="1.2" />
      <path d="m5.2 8.2 1.9 1.9 3.7-3.9" fill="none" stroke="#53a537" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Íconos blancos del aviso de existencias: palomita, admiración y tache. */
export function IconoExistencias({ tipo }: { tipo: "hay" | "pocas" | "agotado" }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true" focusable="false">
      {tipo === "hay" && <path d="m2.5 8.3 3.6 3.4 7.4-7.4" strokeLinejoin="round" />}
      {tipo === "pocas" && (
        <>
          <path d="M8 3.5v6" />
          <circle cx="8" cy="12.5" r=".6" fill="white" />
        </>
      )}
      {tipo === "agotado" && <path d="m4 4 8 8M12 4l-8 8" />}
    </svg>
  );
}

export function LogoWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.8c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.3.9 2.5 1 2.7.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}

/** Íconos blancos de los pasos de la entrega estimada: pedido, en ruta y entrega (20×21). */
export function IconoPaso({ paso }: { paso: 0 | 1 | 2 }) {
  return (
    <svg viewBox="0 0 20 21" width={20} height={21} fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paso === 0 && (
        <>
          <rect x="4" y="4" width="12" height="14" rx="2" />
          <path d="M7.5 3h5v2.5h-5zM7.5 11.5l1.8 1.8 3.4-3.6" />
        </>
      )}
      {paso === 1 && (
        <>
          <path d="M2 6h9.5v8H2zM11.5 8.5h3.5l3 3V14h-6.5" />
          <circle cx="5.5" cy="15" r="1.6" />
          <circle cx="14.5" cy="15" r="1.6" />
        </>
      )}
      {paso === 2 && (
        <>
          <path d="M3.5 9.5 10 4l6.5 5.5V17h-13z" />
          <path d="M8 17v-4.5h4V17" />
        </>
      )}
    </svg>
  );
}
