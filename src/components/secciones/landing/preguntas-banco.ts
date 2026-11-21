// Banco de preguntas y respuestas para la caja «Escribe tu pregunta» (B1-P6, 21-nov-2026). Se suma a las preguntas de
// la sección (las del acordeón, que salen de la plantilla). REGLA: solo lo que la tienda ya publica; nada inventado.
// Fuentes: preguntas frecuentes de la página de contacto y de la ficha de hoy (docs/sitio-actual/paginas/
// page.contact.md, product.compuerta-estandar-2.md, product.medida-especial.md), el pie (dirección y teléfono) y el
// catálogo (precios, contenido/productos.json). {precio}, {precio_antes} y {hasta} se llenan con el catálogo;
// {precio_medida} con el de la hecha a la medida.
// «claves»: otras formas en que la gente lo pregunta (ayudan a encontrarla).

import type { EntradaBanco } from "./buscarPregunta";

export const BANCO_EXTRA: EntradaBanco[] = [
  {
    pregunta: "¿Cuánto cuesta?",
    respuesta: "Todos los tamaños estándar cuestan {precio} (antes {precio_antes}), con envío gratis a todo México. Con tarjeta de crédito, hasta 6 meses sin intereses.",
    claves: "precio cuánto vale costo",
  },
  {
    pregunta: "¿La hacen a la medida para una entrada más ancha?",
    respuesta:
      "Sí. Si tu entrada mide más de {hasta} cm, la hacemos a la medida (hasta 2.5 m de ancho) por {precio_medida}. Se fabrica en unas tres semanas: para empezarla se paga el 50 % y el resto cuando está lista para enviarse.",
    claves: "más ancha portón cochera garage especial xxl grande dos metros",
    enlace: { texto: "Ver la compuerta hecha a la medida", href: "/products/compuerta-anti-inundaciones-hecha-a-la-medida" },
  },
  {
    pregunta: "¿Sirve para mi negocio o mi cochera?",
    respuesta:
      "Sí: funciona en cualquier entrada con un marco firme donde la compuerta haga presión, de casa, local o negocio. Si mide más de {hasta} cm, la hacemos a la medida.",
    claves: "negocio local comercial cochera casa oficina bodega funciona sirve",
  },
  {
    pregunta: "¿Hacen compuertas más altas?",
    respuesta:
      "Por ahora no: la presión del agua aumenta mucho con más altura y solo vendemos lo que hemos probado a fondo. La compuerta detiene hasta 50 cm de agua.",
    claves: "más alta altura más de 50 cm",
  },
  {
    pregunta: "¿Hay compuertas más bajas?",
    respuesta: "Sí: la Mini Compuerta, de 30 cm de altura, para inundaciones de menos agua.",
    claves: "más baja chica pequeña mini 30 cm",
    enlace: { texto: "Ver la Mini Compuerta", href: "/products/mini-compuerta" },
  },
  {
    pregunta: "¿Envían a todo México? ¿Llega a mi ciudad?",
    respuesta: "Sí, enviamos a todo México por paquetería de confianza y el envío es gratis. Llega en 3 a 5 días hábiles (puede variar en zona extendida).",
    claves: "envío ciudad estado llega mandan paquetería domicilio",
  },
  {
    pregunta: "¿Mandan fuera de México?",
    respuesta:
      "Normalmente no, porque el envío internacional suele costar más que la compuerta. Si te interesa, escríbenos por WhatsApp y revisamos tu caso.",
    claves: "extranjero estados unidos internacional otro país",
  },
  {
    pregunta: "¿Tienen tienda física? ¿Dónde están?",
    respuesta:
      "Vendemos en línea y las fabricamos en Los Mochis, Sinaloa (Calle Morelos #254, Col. Centro). Si estás en la ciudad, puedes recogerla en nuestra oficina: escríbenos para coordinar la entrega.",
    claves: "tienda física oficina recoger dirección ubicación sucursal",
  },
  {
    pregunta: "¿Ustedes la instalan?",
    respuesta: "No la instalamos nosotros, pero es muy fácil: se coloca a presión en unos 10 minutos, sin perforar ni hacer obra. Mira el video de instalación.",
    claves: "instalación instalar colocar quién la pone",
    enlace: { texto: "Ver cómo se instala", href: "/pages/instalacion" },
  },
  {
    pregunta: "¿Es permanente o la puedo quitar?",
    respuesta: "Se coloca en unos 10 minutos y la puedes quitar cuando quieras o dejarla puesta por meses sin ningún problema.",
    claves: "quitar retirar permanente dejarla puesta guardar",
  },
  {
    pregunta: "¿De qué material está hecha?",
    respuesta: "Es de acero, con una tira de hule y una funda de neopreno impermeable que no deja pasar el agua. Es reutilizable.",
    claves: "material acero resistente hule neopreno",
  },
  {
    pregunta: "¿Cuánto dura? ¿Se puede usar varias veces?",
    respuesta: "Sí, es reutilizable: la usas las veces que necesites. Su vida útil es de 5 a 7 años.",
    claves: "dura vida útil reutilizable veces años",
  },
  {
    pregunta: "¿Cómo cambio o cancelo mi pedido?",
    respuesta:
      "Escríbenos lo antes posible, de preferencia antes de que se envíe: si se cancela a tiempo te devolvemos todo. Si ya salió, el reembolso se hace cuando la compuerta regresa a nuestro almacén.",
    claves: "cancelar modificar pedido orden cambiar",
  },
  {
    pregunta: "¿Venden la funda o la tira de hule de repuesto?",
    respuesta: "Sí: funda de repuesto ($699), tira de hule de repuesto ($559) y plastilina de secado rápido ($49).",
    claves: "repuesto refacción funda tira hule plastilina",
    enlace: { texto: "Ver la funda de repuesto", href: "/products/funda-de-repuesto-compuerta-anti-inundaciones" },
  },
  {
    pregunta: "¿Tienen algo para la coladera?",
    respuesta: "Sí: el Tapón Inflable Anti-Inundaciones ($749) tapa la coladera o el desagüe para que el agua no se regrese por ahí.",
    claves: "coladera desagüe drenaje tapón registro",
    enlace: { texto: "Ver el tapón inflable", href: "/products/tapon-inflable-anti-inundaciones" },
  },
  {
    pregunta: "Tengo varias entradas, ¿cuántas necesito?",
    respuesta: "Una por cada entrada. Mide cada una, agrega cada tamaño al carrito y el envío sigue siendo gratis.",
    claves: "varias dos tres entradas puertas cuántas",
  },
  {
    pregunta: "¿Cómo los contacto?",
    respuesta: "Por WhatsApp al (668) 241 9579 o al correo contacto@diluvium.com.mx.",
    claves: "whatsapp teléfono número correo contacto hablar asesor",
  },
];
