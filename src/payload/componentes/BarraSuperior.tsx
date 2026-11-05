"use client";

// Lado derecho de la barra de arriba, como en el CRM: el correo de quien entró y el interruptor de tema (píldora con
// sol o luna; en claro flotan nubes y en oscuro titilan estrellas). Al tocarlo, el tema nuevo se extiende en círculo
// desde el botón (View Transitions), igual que crm-diluvium › theme-toggle.tsx y theme-circle-transition.ts.

import { useAuth, useTheme } from "@payloadcms/ui";

const NUBES = ["c1", "c2", "c3"];
const ESTRELLAS = [
  { clave: "s1", chispa: true },
  { clave: "s2", chispa: false },
  { clave: "s3", chispa: false },
  { clave: "s4", chispa: true },
  { clave: "s5", chispa: false },
];

function cambiarConCirculo(origen: HTMLElement, aplicar: () => void) {
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducir || typeof document.startViewTransition !== "function") {
    aplicar();
    return;
  }
  const caja = origen.getBoundingClientRect();
  const x = caja.left + caja.width / 2;
  const y = caja.top + caja.height / 2;
  const radio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const raiz = document.documentElement;
  raiz.dataset.themeCircle = "";
  const transicion = document.startViewTransition(aplicar);
  transicion.ready
    .then(() => {
      raiz.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
  const fin = () => delete raiz.dataset.themeCircle;
  transicion.finished.then(fin, fin);
}

export function BarraSuperior() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const oscuro = theme === "dark";

  const alternar = (e: React.MouseEvent<HTMLButtonElement>) => {
    const siguiente = oscuro ? "light" : "dark";
    cambiarConCirculo(e.currentTarget, () => {
      // El tema se pone en ese instante (la transición toma la foto del tema nuevo) y luego Payload lo guarda.
      document.documentElement.dataset.theme = siguiente;
      setTheme(siguiente);
    });
  };

  return (
    <div className="barra-superior">
      {user?.email && <span className="barra-superior__correo">{String(user.email)}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={oscuro}
        aria-label="Tema oscuro"
        title="Cambiar entre tema claro y oscuro"
        onClick={alternar}
        className="theme-pill"
        data-no-glow
      >
        {NUBES.map((c) => (
          <span key={c} aria-hidden="true" className={`theme-pill-cloud ${c}`}>
            <span />
          </span>
        ))}
        {ESTRELLAS.map(({ clave, chispa }) => (
          <span key={clave} aria-hidden="true" className={`theme-pill-star ${clave}`}>
            <span className={chispa ? "spark" : undefined} />
          </span>
        ))}
        <span aria-hidden="true" className="theme-pill-knob">
          <svg className="theme-pill-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg className="theme-pill-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
