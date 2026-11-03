// Íconos dibujados para Diluvium (trazos simples de 24×24). No son los del tema Shine.

type Props = { className?: string; tamano?: number };

function Svg({ className, tamano = 24, children, relleno = false }: Props & { children: React.ReactNode; relleno?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamano}
      height={tamano}
      className={className}
      fill={relleno ? "currentColor" : "none"}
      stroke={relleno ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconoBuscar = (p: Props) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Svg>
);

export const IconoBolsa = (p: Props) => (
  <Svg {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" />
  </Svg>
);

export const IconoMenu = (p: Props) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconoCerrar = (p: Props) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconoFlechaArriba = (p: Props) => (
  <Svg {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Svg>
);

export const IconoTelefono = (p: Props) => (
  <Svg {...p} relleno>
    <path d="M6.6 2.4 9.4 5.3c.6.6.6 1.5.1 2.1L8.1 9a13.4 13.4 0 0 0 6.9 6.9l1.6-1.4c.6-.5 1.5-.5 2.1.1l2.9 2.8c.6.6.6 1.6 0 2.2l-1.4 1.5c-.9.9-2.3 1.2-3.5.7A21 21 0 0 1 1.2 6.4C.7 5.2 1 3.8 1.9 2.9L3.4 1.5c.6-.6 1.6-.6 2.2 0l1 .9Z" />
  </Svg>
);

export const IconoPuntos = (p: Props) => (
  <Svg {...p} relleno>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </Svg>
);

export const IconoFacebook = (p: Props) => (
  <Svg {...p} relleno>
    <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
  </Svg>
);

export const IconoYoutube = (p: Props) => (
  <Svg {...p} relleno>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3-5.2 3Z" />
  </Svg>
);

export const IconoInstagram = (p: Props) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </Svg>
);

export const IconoLinkedin = (p: Props) => (
  <Svg {...p} relleno>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5Z" />
  </Svg>
);

export const IconoPalomita = (p: Props) => (
  <Svg {...p}>
    <path d="m5 12 5 5 9-10" />
  </Svg>
);

export const IconoEstrella = (p: Props) => (
  <Svg {...p} relleno>
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" />
  </Svg>
);

export const IconoPlay = (p: Props) => (
  <Svg {...p} relleno>
    <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
  </Svg>
);
