// Textos editables con datos adentro: «Viendo {n} de {total} reseñas» → «Viendo 12 de 238 reseñas». Sin dependencias:
// sirve en las piezas del teléfono y en las del servidor.

export const conValores = (t: string, valores: Record<string, string | number>) =>
  t.replace(/\{(\w+)\}/g, (todo, k: string) => (k in valores ? String(valores[k]) : todo));

// Textos de siempre de las piezas de B1 (los que estaban fijos en el código). Van aquí, en un archivo común, porque las
// partes del servidor (que leen la plantilla) y las del teléfono (que los muestran) los usan las dos.

export type TextosCarrito = {
  titulo: string;
  agregado: string;
  envio: string;
  gratis: string;
  total: string;
  nota: string;
  pagar: string;
  seguir: string;
  quitar: string;
  vacio: string;
  vacioBoton: string;
};
export const TEXTOS_CARRITO: TextosCarrito = {
  titulo: "Tu carrito",
  agregado: "Se agregó a tu carrito",
  envio: "Envío",
  gratis: "Gratis",
  total: "Total",
  nota: "IVA incluido · hasta 6 meses sin intereses",
  pagar: "Pagar ahora",
  seguir: "Seguir viendo",
  quitar: "Quitar",
  vacio: "Tu carrito está vacío.",
  vacioBoton: "Ver la compuerta",
};

export type TextosMuro = { verMas: string; viendo: string; leerMas: string; resena: string; anterior: string; siguiente: string; verSeisMas: string };
export const TEXTOS_MURO: TextosMuro = {
  verMas: "Ver más",
  viendo: "{n} de {total} reseñas",
  leerMas: "… Mostrar más",
  resena: "Reseña {n} de {total}",
  anterior: "Anterior",
  siguiente: "Siguiente",
  verSeisMas: "Ver 6 más",
};

/** Tarjeta «¿Ya tienes tu compuerta?» del muro de reseñas y su ventana para escribir una (24-nov-2026). Cada texto se
 *  edita en la pestaña Textos (clave entre paréntesis en Resenas.tsx). */
export type TextosResenaNueva = {
  invitarTitulo: string;
  invitarTexto: string;
  invitarBoton: string;
  titulo: string;
  calificacion: string;
  comentario: string;
  comentarioEjemplo: string;
  fotos: string;
  nombre: string;
  enviar: string;
  gracias: string;
  graciasTexto: string;
};

export const TEXTOS_RESENA_NUEVA: TextosResenaNueva = {
  invitarTitulo: "¿Ya tienes tu compuerta Diluvium?",
  invitarTexto: "Cuéntanos cómo te fue, tu reseña ayuda a otras familias.",
  invitarBoton: "Escribir mi reseña",
  titulo: "Escribe tu reseña",
  calificacion: "Tu calificación",
  comentario: "Tu comentario",
  comentarioEjemplo: "¿Cómo te fue con tu compuerta?",
  fotos: "Agrega fotos de tu compuerta instalada",
  nombre: "Tu nombre",
  enviar: "Enviar mi reseña",
  gracias: "¡Gracias por tu reseña!",
  graciasTexto: "La revisamos y aparecerá en la página muy pronto.",
};

/** Textos fijos de la compra que se editan en la pestaña Textos (con su valor de siempre). */
export type TextosCompra = {
  placeholder: string;
  teQueda: string;
  masAncha: string;
  masAnchaEnlace: string;
  masAngosta: string;
  masAngostaEnlace: string;
  agotado: string;
  whatsapp: string;
  /** Mensaje ya escrito de «Escríbenos y vemos tu caso» ({cm} = la medida que escribió). */
  mensajeAngosta: string;
};
export const TEXTOS_COMPRA: TextosCompra = {
  placeholder: "Ej. 95",
  teQueda: "Te queda la {tamano} ({medidas}). Ya está elegida.",
  masAncha: "Tu entrada es más ancha:",
  masAnchaEnlace: "la hacemos a la medida",
  masAngosta: "Tu entrada es más angosta.",
  masAngostaEnlace: "Escríbenos y vemos tu caso",
  agotado: "Agotado",
  whatsapp: "Pregúntanos por WhatsApp",
  mensajeAngosta: "Hola, mi entrada mide {cm} cm, ¿qué compuerta me recomiendan?",
};

export type TextosComoMedir = {
  tituloVideo: string;
  botonPasos: string;
  tituloPasos: string;
  botonVolver: string;
  pasos: [string, string, string];
  columnas: [string, string];
  tocaParaOir: string;
};
export const TEXTOS_COMO_MEDIR: TextosComoMedir = {
  tituloVideo: "¿Cómo medir tu entrada?",
  botonPasos: "Ver pasos clave",
  tituloPasos: "3 pasos clave",
  botonVolver: "Volver al video",
  pasos: ["Mide el ancho de tu entrada", "Elige tu tamaño", "Recíbela y colócala"],
  columnas: ["Tamaño", "Ancho de entrada"],
  tocaParaOir: "Toca para oír",
};
