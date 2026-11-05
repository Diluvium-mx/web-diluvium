"use client";

// Íconos del menú lateral, como los del CRM (crm-diluvium › nav-icons.tsx): cada sección lleva su dibujo y, al pasar
// el cursor o llegar con Tab, hace su gesto UNA vez (las piezas que se mueven llevan data-nav-anim; las animaciones
// están en app/(payload)/custom.scss › «Íconos del menú»). Payload arma el menú solo, así que aquí se agrega el ícono
// a cada enlace por su id («nav-<colección>» o «nav-global-<global>»). Con «reducir movimiento», nada se mueve.
// Dibujos de Lucide (licencia ISC, la misma familia que usa el CRM).

import { useEffect } from "react";

const d = (ms: number) => ` style="animation-delay:${ms}ms"`;

const ICONOS: Record<string, string> = {
  // La caja da un brinco.
  productos: `<g data-nav-anim="shake"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/></g>`,
  // La estrella da un giro.
  resenas: `<path data-nav-anim="spin" d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>`,
  // Las capas aparecen una sobre otra.
  colecciones: `<path data-nav-anim="pop" d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path data-nav-anim="pop"${d(90)} d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path data-nav-anim="pop"${d(180)} d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>`,
  // Los puntitos de la reseña brincan.
  "carrusel-resenas": `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle data-nav-anim="bob" cx="8" cy="10" r="0.6"/><circle data-nav-anim="bob"${d(80)} cx="12" cy="10" r="0.6"/><circle data-nav-anim="bob"${d(160)} cx="16" cy="10" r="0.6"/>`,
  // Los cuatro cuadros de la plantilla aparecen uno por uno.
  plantillas: `<rect data-nav-anim="pop" x="3" y="3" width="7" height="9" rx="1"/><rect data-nav-anim="pop"${d(80)} x="14" y="3" width="7" height="5" rx="1"/><rect data-nav-anim="pop"${d(160)} x="14" y="12" width="7" height="9" rx="1"/><rect data-nav-anim="pop"${d(240)} x="3" y="16" width="7" height="5" rx="1"/>`,
  // Los colores de la paleta parpadean.
  "ajustes-tema": `<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle data-nav-anim="twinkle" cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle data-nav-anim="twinkle"${d(80)} cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle data-nav-anim="twinkle"${d(160)} cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle data-nav-anim="twinkle"${d(240)} cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>`,
  // Se escriben los renglones de la página.
  paginas: `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path data-nav-anim="draw" pathLength="1" d="M10 9H8"/><path data-nav-anim="draw"${d(90)} pathLength="1" d="M16 13H8"/><path data-nav-anim="draw"${d(180)} pathLength="1" d="M16 17H8"/>`,
  // Se dibuja la palomita del escudo.
  politicas: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path data-nav-anim="draw" pathLength="1" d="m9 12 2 2 4-4"/>`,
  // Se escriben las líneas del periódico.
  articulos: `<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect data-nav-anim="pop" width="8" height="4" x="10" y="6" rx="1"/><path data-nav-anim="draw"${d(120)} pathLength="1" d="M18 14h-8"/><path data-nav-anim="draw"${d(200)} pathLength="1" d="M15 18h-5"/>`,
  // Sale el sol de la foto.
  medios: `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle data-nav-anim="pop" cx="9" cy="9" r="2"/><path data-nav-anim="draw"${d(100)} pathLength="1" d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`,
  // Las tres rayas del menú se dibujan.
  menus: `<path data-nav-anim="draw" pathLength="1" d="M4 6h16"/><path data-nav-anim="draw"${d(80)} pathLength="1" d="M4 12h16"/><path data-nav-anim="draw"${d(160)} pathLength="1" d="M4 18h16"/>`,
  // La lupa se sacude.
  "fichas-seo": `<g data-nav-anim="shake"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></g>`,
  // El globo aparece.
  "datos-google": `<circle cx="12" cy="12" r="10"/><path data-nav-anim="draw" pathLength="1" d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path data-nav-anim="draw"${d(120)} pathLength="1" d="M2 12h20"/>`,
  // Las dos personas brincan.
  usuarios: `<g data-nav-anim="bob"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></g><g data-nav-anim="bob"${d(100)}><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></g>`,
};

function ponerIconos() {
  for (const enlace of document.querySelectorAll<HTMLElement>(".nav__link[id^='nav-']")) {
    if (enlace.querySelector("[data-nav-icon]")) continue;
    const nombre = enlace.id.replace(/^nav-(global-)?/, "");
    const dibujo = ICONOS[nombre];
    if (!dibujo) continue;
    enlace.setAttribute("data-nav-item", "");
    enlace.setAttribute("data-glow", "light");
    enlace.insertAdjacentHTML(
      "afterbegin",
      `<svg data-nav-icon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dibujo}</svg>`,
    );
  }
}

/** Va en los «providers» del administrador: pone los íconos y los vuelve a poner si Payload redibuja el menú. */
export function IconosMenu({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    ponerIconos();
    const observador = new MutationObserver(ponerIconos);
    observador.observe(document.body, { childList: true, subtree: true });
    return () => observador.disconnect();
  }, []);
  return <>{children}</>;
}
