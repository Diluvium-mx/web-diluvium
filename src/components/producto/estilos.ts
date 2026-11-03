// Clases de los botones como se ven en la tienda: al pasar el mouse, un relleno baja desde arriba (0.4 s) y el
// texto cambia de color. Se usan en las secciones de producto y en las tarjetas.

// Sin «position»: el botón la pone (relative o absolute) para que el relleno quede dentro.
const RELLENO =
  "isolate overflow-hidden transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 " +
  "after:bottom-full after:-z-10 after:transition-[bottom] after:duration-[400ms] after:ease-[cubic-bezier(0.7,0,0.3,1)] " +
  "hover:after:bottom-0 focus-visible:after:bottom-0 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-azul";

/** Botón naranja («btn-primary»): fondo naranja, al pasar el mouse se llena de blanco y el texto queda naranja. */
export const BOTON_PRIMARIO =
  `${RELLENO} relative inline-flex items-center justify-center border border-naranja bg-naranja font-titulo font-medium ` +
  "leading-6 text-white after:bg-white hover:text-naranja focus-visible:text-naranja disabled:pointer-events-none " +
  "disabled:opacity-50";

/** Tamaño grande: 40 px de alto (44 px en computadora), letra de 16 px. */
export const BOTON_GRANDE = "min-h-10 px-6 py-1.5 text-base min-[1025px]:min-h-11";

/** Tamaño chico de las tarjetas: 40 px de alto, letra de 12 px (16 px en computadora). */
export const BOTON_CHICO = "min-h-10 px-5 py-1.5 text-xs min-[1025px]:text-base";

/** Botón cuadrado con ícono («btn-outline»): blanco con filo azul tenue; al pasar el mouse se llena de azul. */
export const BOTON_ICONO =
  `${RELLENO} inline-flex items-center justify-center bg-white text-azul shadow-[inset_0_0_0_1px_rgba(10,85,154,0.12)] ` +
  "after:bg-azul hover:text-white focus-visible:text-white";
