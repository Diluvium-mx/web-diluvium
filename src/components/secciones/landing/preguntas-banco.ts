// Banco de preguntas y respuestas para la caja «Escribe tu pregunta» al final de las preguntas frecuentes de B1-P6
// (21-nov-2026). Se suma a las preguntas de la sección (las tarjetas, que salen de la plantilla).
// REGLA: solo lo que Diluvium ya dice a sus clientes; nada inventado. Fuentes:
//   - la base de conocimiento de Angela en el CRM (37 preguntas, respaldo del 11-nov-2026:
//     ~/Documents/Diluvium CRM/notas/respaldos-goal/2026-11-11-faqs-antes-fundas.json), adaptada a la página: de tú y
//     sin «por este chat»;
//   - las preguntas frecuentes publicadas en la tienda de hoy (docs/sitio-actual/paginas/page.contact.md,
//     product.compuerta-estandar-2.md, product.medida-especial.md) y el catálogo (precios, contenido/productos.json).
// {precio}, {precio_antes}, {desde} y {hasta} se llenan con el catálogo; {precio_medida}, con la hecha a la medida.
// «claves»: otras formas en que la gente lo pregunta (ayudan a encontrarla). Este archivo es público (repositorio
// público): nunca datos de clientes ni nada interno.

import type { EntradaBanco } from "./buscarPregunta";

const A_LA_MEDIDA = { texto: "Ver la compuerta hecha a la medida", href: "/products/compuerta-anti-inundaciones-hecha-a-la-medida" };
const TAPON = { texto: "Ver el tapón inflable", href: "/products/tapon-inflable-anti-inundaciones" };

export const BANCO_EXTRA: EntradaBanco[] = [
  // ── Precio y pago ──
  {
    pregunta: "¿Cuánto cuesta?",
    respuesta: "Todos los tamaños estándar cuestan {precio} (antes {precio_antes}), con envío gratis a todo México y el IVA incluido. Con tarjeta de crédito, hasta 6 meses sin intereses.",
    claves: "precio cuánto vale costo",
  },
  {
    pregunta: "¿Tienen meses sin intereses?",
    respuesta: "Sí, hasta 6 meses sin intereses con tarjeta de crédito en las compuertas estándar. La mini compuerta y la hecha a la medida no tienen meses sin intereses.",
    claves: "meses sin intereses msi a meses plazos tarjeta de crédito",
  },
  {
    pregunta: "¿El precio incluye IVA?",
    respuesta: "Sí, todos los precios ya incluyen IVA y te damos factura.",
    claves: "iva impuestos incluido",
  },
  {
    pregunta: "Se me hace cara",
    respuesta: "Es una inversión en seguridad que puedes usar cada vez que llueva, con una vida útil de 5 a 7 años. Las compuertas estándar tienen hasta 6 meses sin intereses con tarjeta de crédito.",
    claves: "cara caro mucho elevado costoso barato descuento",
  },
  // ── Medidas y modelos ──
  {
    pregunta: "¿Hacen compuertas a la medida?",
    respuesta:
      "Sí, para entradas de 121 a 250 cm de ancho. Las tenemos en {precio_medida} con envío incluido y tardamos unas tres semanas en tenerlas listas: se paga el 50 % para empezarla y el resto cuando está lista.",
    claves: "a la medida más ancha especial xxl grande dos metros",
    enlace: A_LA_MEDIDA,
  },
  {
    pregunta: "¿Tienen para cochera o zaguán?",
    respuesta: "Depende del ancho de la entrada: las estándar son para entradas de {desde} a {hasta} cm y las hechas a la medida, de 121 a 250 cm. Mide de lado a lado en centímetros para saber cuál te sirve.",
    claves: "cochera zaguán portón garage garaje bodega",
    enlace: A_LA_MEDIDA,
  },
  {
    pregunta: "¿También es para negocios?",
    respuesta: "Sí: funciona en cualquier entrada con un marco firme donde la compuerta haga presión, de casa, local o negocio. Si mide más de {hasta} cm, la hacemos a la medida.",
    claves: "negocio local comercial oficina",
  },
  {
    pregunta: "¿Hacen compuertas más altas?",
    respuesta: "Por ahora la altura máxima que manejamos es de 60 cm: la presión del agua aumenta mucho con más altura y solo vendemos lo que hemos probado a fondo.",
    claves: "más alta altura más de 60 cm un metro",
  },
  {
    pregunta: "¿Hay compuertas más bajas?",
    respuesta: "Sí: la Mini Compuerta, de 30 cm de altura, para inundaciones de menos agua. Se fija con tornillos.",
    claves: "más baja chica pequeña mini 30 cm",
    enlace: { texto: "Ver la Mini Compuerta", href: "/products/mini-compuerta" },
  },
  {
    pregunta: "¿Qué incluye la mini compuerta?",
    respuesta: "Todo el kit listo para instalarse: la compuerta, la tira de hule para el contorno, plastilina de secado rápido para las esquinas, una llave (matraca) para girar los tornillos y su instructivo.",
    claves: "mini incluye kit",
  },
  {
    pregunta: "¿Es ajustable?",
    respuesta: "Sí, dentro del rango de su tamaño: el gato la abre hasta ajustarla a tu entrada. Por eso se elige el tamaño según el ancho.",
    claves: "ajustable ajusta se abre gato expandible",
  },
  {
    pregunta: "¿Cuánto pesa?",
    respuesta: "Las estándar pesan alrededor de 13 kg; las hechas a la medida pueden llegar a 16 o 17 kg, según qué tan anchas sean.",
    claves: "peso pesa kilos pesada",
  },
  {
    pregunta: "¿Qué grosor tiene?",
    respuesta: "Tiene 4 cm de grosor.",
    claves: "grosor grueso ancho de la compuerta espesor",
  },
  // ── Material y sellado ──
  {
    pregunta: "¿De qué material está hecha?",
    respuesta: "De acero, para resistir la presión del agua y el impacto de las olas, cubierta con una funda impermeable de neopreno que sella el contorno de la entrada.",
    claves: "material acero resistente neopreno se oxida",
  },
  {
    pregunta: "¿De qué es la tira que sella?",
    respuesta: "La tira de hule (empaque) es parecida a la del contorno de las puertas de los carros: hace que no entre el agua por las orillas. Viene incluida sin costo.",
    claves: "tira hule empaque sello orillas incluida",
  },
  {
    pregunta: "¿Sella por completo? ¿Garantizan que no entra agua?",
    respuesta: "Bien colocada, con la tira y la plastilina en las esquinas, sella el contorno y no entra agua, siempre que el agua no rebase la altura de la compuerta.",
    claves: "hermética sella completo no entra agua garantizan filtra",
  },
  {
    pregunta: "¿Para qué es la plastilina?",
    respuesta: "La plastilina de secado rápido se pone en las esquinas antes de la tira de hule: se amolda y sella las grietas para que el agua no se filtre por ahí.",
    claves: "plastilina plastiloka esquinas",
  },
  {
    pregunta: "¿La plastilina se reutiliza?",
    respuesta:
      "Se pone una sola vez y sirve todas las veces que uses la compuerta, porque al secarse queda firme en las esquinas. Muchos clientes la dejan puesta y la pintan del color del piso o del marco.",
    claves: "plastilina reutiliza una vez queda",
  },
  // ── Instalación ──
  {
    pregunta: "¿Dónde se coloca?",
    respuesta:
      "Si la puerta abre hacia adentro, la compuerta se coloca afuera; si abre hacia afuera, adentro. Solo revisa que haya un marco firme de al menos 4 cm de grosor donde la compuerta haga presión.",
    claves: "dónde se pone adentro afuera lado marco",
  },
  {
    pregunta: "¿En qué entradas se puede instalar?",
    respuesta:
      "En entradas con un marco firme y plano de al menos 4 cm; si hay zoclo, conviene retirarlo. En rejas, escalones, rampas, ventanales, puertas corredizas, de seguridad o de dos hojas depende de cada caso: mándanos por WhatsApp una foto de frente donde se vean el piso y los dos lados, y te decimos.",
    whatsapp: "Hola, quiero saber si la compuerta se puede poner en mi entrada, ¿les mando una foto de frente donde se vean el piso y los dos lados?",
    claves: "reja escalón rampa ventanal ventana corrediza dos hojas zoclo vidrio",
  },
  {
    pregunta: "¿Puedo cerrar la puerta con la compuerta puesta?",
    respuesta: "Sí, y se recomienda: la compuerta va en el marco, del lado contrario hacia donde abre la puerta, así que la puerta cierra normal. Depende de tu marco; con una foto lo revisamos.",
    claves: "cerrar la puerta puesta",
  },
  {
    pregunta: "¿Ustedes la instalan?",
    respuesta: "No la instalamos nosotros, pero es muy fácil: está hecha para colocarse en unos 10 minutos cuando va a llover y quitarse en 5 cuando pasa la lluvia. Mira el video de instalación.",
    claves: "instalación instalar colocar quién la pone",
    enlace: { texto: "Ver cómo se instala", href: "/pages/instalacion" },
  },
  {
    pregunta: "¿Miden o instalan a domicilio?",
    respuesta: "Fuera de Los Mochis no medimos ni instalamos a domicilio: tú nos das la medida y la colocas fácil con su instructivo. En Los Mochis, un asesor puede revisarlo contigo.",
    claves: "domicilio medir vienen técnico",
  },
  {
    pregunta: "¿Cuánto tarda en colocarse?",
    respuesta: "Se coloca en unos 10 minutos y se retira en 5. Es muy sencillo.",
    claves: "tarda colocar instalar minutos rápido",
  },
  {
    pregunta: "¿Es fija o se puede quitar?",
    respuesta: "Es removible: la colocas en 10 minutos cuando va a llover, la dejas el tiempo que necesites y, en cuanto pasa la lluvia, la retiras en 5 minutos para guardarla.",
    claves: "quitar retirar permanente fija dejarla puesta guardar",
  },
  {
    pregunta: "¿Cuánto dura? ¿Se puede usar varias veces?",
    respuesta: "Sí, es reutilizable: la usas cada vez que llueva. Su vida útil es de 5 a 7 años.",
    claves: "dura vida útil reutilizable veces años",
  },
  {
    pregunta: "Tengo varias entradas, ¿cuántas necesito?",
    respuesta: "Una por cada entrada. Mide cada una, agrega cada tamaño al carrito y el envío sigue siendo gratis.",
    claves: "varias dos tres entradas puertas cuántas",
  },
  // ── Repuestos y tapón ──
  {
    pregunta: "¿Venden tira o funda de repuesto?",
    respuesta:
      "Sí, con envío incluido y entrega de 3 a 5 días hábiles: tira de hule de repuesto, $559 (tamaño Extra Grande, 2.40 m), y funda de repuesto, $699 (solo la funda, en el tamaño de tu compuerta). La funda se recomienda reponer cada 4 a 5 años, según el uso.",
    claves: "repuesto refacción funda tira hule reponer",
    enlace: { texto: "Ver la funda de repuesto", href: "/products/funda-de-repuesto-compuerta-anti-inundaciones" },
  },
  {
    pregunta: "¿Tienen algo para la coladera?",
    respuesta: "Sí: el tapón inflable tapa la coladera o el desagüe para que el agua no se regrese por ahí. Hay de 2, 3 y 4 pulgadas (lo que miden las tuberías en México): $749, $799 y $849, con envío incluido.",
    claves: "coladera desagüe drenaje tapón inflable tubería pulgadas precio",
    enlace: TAPON,
  },
  {
    pregunta: "¿El tapón tiene garantía?",
    respuesta: "Sí, el tapón inflable tiene 3 meses de garantía.",
    claves: "tapón garantía",
    enlace: TAPON,
  },
  {
    pregunta: "¿Puedo inflar el tapón con compresor?",
    respuesta: "No: usa una bomba manual pequeña, porque un compresor puede reventar el tapón.",
    claves: "tapón compresor inflar bomba",
  },
  {
    pregunta: "¿Puedo usar el tapón en el baño?",
    respuesta: "Sí, en el WC también, siempre y cuando esté seco.",
    claves: "tapón wc baño taza inodoro",
  },
  // ── Garantía ──
  {
    pregunta: "¿La hecha a la medida y la mini tienen garantía?",
    respuesta: "Las compuertas estándar y las mini tienen 1 año de garantía por defectos de fabricación; las hechas a la medida, 30 días. Su vida útil es de 5 a 7 años.",
    claves: "garantía a la medida mini defectos",
  },
  // ── Envío ──
  {
    pregunta: "¿Cuánto tarda el envío?",
    respuesta:
      "Si el pago se confirma en la mañana, sale ese mismo día por la tarde; si es en la noche, sale al día siguiente. Ya en camino, tarda de 3 a 5 días hábiles (en zona extendida, un poco más).",
    claves: "tarda envío días llega cuándo sale hoy mismo día",
  },
  {
    pregunta: "¿Envían a mi ciudad? ¿Cobran la zona extendida?",
    respuesta: "Sí, el envío es gratis a todo México, también a zona extendida. Ahí puede tardar un poco más de los 3 a 5 días hábiles.",
    claves: "envío ciudad estado llega mandan zona extendida costo de envío domicilio",
  },
  {
    pregunta: "¿Con qué paquetería envían?",
    respuesta: "Por Paquetexpress o Estafeta, según la zona. Después del pago te pedimos tus datos de envío y te mandamos el número de guía por WhatsApp cuando sale, para que la rastrees.",
    claves: "paquetería paquetexpress estafeta guía rastrear número de guía mandan envían con qué",
  },
  {
    pregunta: "¿Hacen envíos fuera de México?",
    respuesta: "Solo enviamos a domicilios dentro de México. Si tienes una dirección en México (de un familiar, un conocido o tu paquetería), te la enviamos ahí y tú te encargas del envío a tu país.",
    claves: "extranjero estados unidos internacional otro país fuera de méxico",
  },
  // ── Tienda, horario y contacto ──
  {
    pregunta: "¿Dónde la compro?",
    respuesta: "Aquí mismo: elige tu tamaño arriba y toca «Añadir al carrito». También nos encuentras en Mercado Libre y Amazon, o cómprala por WhatsApp.",
    whatsapp: "Hola, quiero comprar una compuerta por WhatsApp, ¿cómo le hago?",
    claves: "comprar compro compra pedir dónde la consigo mercado libre amazon",
  },
  {
    pregunta: "¿Dónde están? ¿Tienen tienda física?",
    respuesta:
      "Estamos en la calle José María Morelos y Pavón #254, colonia Centro, en Los Mochis, Sinaloa, donde se fabrican. Vendemos en línea a todo el país; si estás en la ciudad, puedes recogerla en la oficina: escríbenos para coordinar.",
    whatsapp: "Hola, estoy en Los Mochis, ¿puedo recoger mi compuerta en su oficina?",
    claves: "tienda física oficina recoger dirección ubicación sucursal dónde están",
  },
  {
    pregunta: "¿Qué horarios tienen?",
    respuesta: "De lunes a viernes de 9 a 6 de la tarde, corrido; sábado de 9 a 1, y domingo cerrado.",
    claves: "horario abren cierran hora sábado domingo",
  },
  {
    pregunta: "¿Cómo cambio o cancelo mi pedido?",
    respuesta: "Escríbenos lo antes posible, de preferencia antes de que se envíe: si se cancela a tiempo, te devolvemos todo. Si ya salió, el reembolso se hace cuando la compuerta regresa a nuestro almacén.",
    whatsapp: "Hola, quiero cambiar o cancelar mi pedido, ¿me pueden ayudar?",
    claves: "cancelar modificar pedido orden cambiar",
  },
  {
    pregunta: "¿Cómo los contacto?",
    respuesta: "Por WhatsApp al (668) 241 9579 o al correo contacto@diluvium.com.mx.",
    whatsapp: "Hola, quiero hablar con alguien de Diluvium, ¿me pueden atender?",
    claves: "whatsapp teléfono número correo contacto hablar asesor",
  },
];
