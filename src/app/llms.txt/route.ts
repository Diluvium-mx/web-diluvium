import { producto, resumenPrecio } from "@/components/producto/catalogo";
import { calificacionTienda, redondear } from "@/components/resenas/calificaciones";
import { articulosBlog } from "@/components/secciones/Articulo";
import { BANCO_EXTRA } from "@/components/secciones/landing/preguntas-banco";
import { pesos, rellenar } from "@/components/secciones/landing/datos";
import { SITIO } from "@/lib/seo";

// /llms.txt (plan de SEO y chats de IA, 25-nov-2026; docs/seo-y-chats-ia.md, fuera de git): lo que leen ChatGPT,
// Claude, Gemini y Perplexity para contestar sobre Diluvium. En palabras sencillas: qué vendemos, medidas y precios
// (del catálogo, siempre al día), cómo elegir el tamaño, envío, garantía, formas de pago, confianza, preguntas
// frecuentes (las mismas de la página) y contacto. REGLA: solo lo que Diluvium ya dice a sus clientes; nada inventado.
// Hoy, en Shopify, este archivo lo pone Shopify y solo explica cómo comprar con un agente; el nuestro explica el producto.

export const dynamic = "force-static";

const PRODUCTOS: { nombre: string; para: string }[] = [
  { nombre: "compuerta-anti-inundaciones", para: "Para puertas de casa o negocio de 69 a 120 cm de ancho. Detiene hasta 50 cm de agua, se ajusta a presión en 10 minutos sin modificaciones costosas a la entrada y se guarda cuando pasa la lluvia." },
  { nombre: "compuerta-anti-inundaciones-hecha-a-la-medida", para: "Para entradas de más de 120 cm de ancho: se fabrica a la medida, hasta 2.5 m de ancho y 60 cm de alto. Se pide por WhatsApp con foto y medida de la entrada." },
  { nombre: "mini-compuerta", para: "Compuerta de 30 cm de alto para encharcamientos y filtraciones ligeras, en entradas de 62 a 124 cm." },
  { nombre: "tapon-inflable-anti-inundaciones", para: "Tapón de goma que se infla dentro de la tubería para que el drenaje no regrese el agua por coladeras de regaderas o inodoros." },
  { nombre: "funda-de-repuesto-compuerta-anti-inundaciones", para: "Funda de repuesto para la compuerta, en los mismos tamaños." },
  { nombre: "accesorio-tira-de-hule-de-repuesto", para: "Tira de hule de repuesto para el sello de la compuerta." },
  { nombre: "accesorio-plastilina-de-secado-rapido", para: "Plastilina para sellar las esquinas de abajo al poner la compuerta." },
];

function lineaProducto({ nombre, para }: { nombre: string; para: string }): string {
  const p = producto(nombre);
  if (!p) return "";
  const precio = resumenPrecio(p);
  const tamanos = p.variantes.length > 1 ? `\n  - Tamaños: ${p.variantes.map((v) => `${v.titulo.replace(/\((\d+)cm a (\d+)cm\)/, "($1 a $2 cm)")} ${pesos(v.precio)}`).join("; ")}.` : "";
  return `- [${p.titulo}](${SITIO}/products/${p.nombre}): ${precio.desde ? "desde " : ""}${pesos(precio.precio)} MXN${precio.antes ? ` (antes ${pesos(precio.antes)})` : ""}. ${para}${tamanos}`;
}

function texto(): string {
  const tienda = calificacionTienda();
  const medida = producto("compuerta-anti-inundaciones-hecha-a-la-medida");
  const precioMedida = medida?.variantes[0] ? pesos(medida.variantes[0].precio) : "un precio según la medida";
  const preguntas = BANCO_EXTRA.map((e) => `### ${e.pregunta}\n${rellenar(e.respuesta).replace("{precio_medida}", precioMedida)}`).join("\n\n");
  return `# Diluvium: compuertas anti-inundaciones para puertas (México)

> Diluvium fabrica en Los Mochis, Sinaloa, compuertas anti-inundaciones que se ponen en la puerta de una casa o negocio para que no entre el agua de la lluvia: detienen hasta 50 cm de agua, se colocan en 10 minutos y se ajustan a presión contra el marco, sin modificaciones costosas a la entrada, y se guardan cuando pasa la lluvia. Envío gratis a todo México. Calificación de los clientes: ${redondear(tienda.promedio, 1)} de 5 con ${tienda.total} reseñas publicadas.

## Productos y precios (MXN, IVA incluido)
${PRODUCTOS.map(lineaProducto).filter(Boolean).join("\n")}

## Cómo elegir el tamaño
- Se mide el ancho de la entrada de marco a marco (o de pared a pared), en centímetros. La compuerta necesita un marco firme de al menos 4 cm donde hacer presión.
- Compuerta estándar: Extra Chica 69 a 78 cm, Chica 79 a 90 cm, Mediana 91 a 100 cm, Grande 101 a 110 cm, Extra Grande 111 a 120 cm. Todas cuestan lo mismo.
- Más de 120 cm: la compuerta XXL hecha a la medida (hasta 2.5 m), o escribir por WhatsApp con la medida.
- Para filtraciones ligeras (poca agua): la Mini Compuerta de 30 cm de alto.
- Si hay dudas, por WhatsApp ayudan a medir y a elegir: ${SITIO}/pages/contact

## Envío, garantía y pagos
- Envío gratis a todo México; llega en 3 a 5 días hábiles. Repuestos y accesorios: envío gratis en pedidos desde $499.
- La compuerta hecha a la medida se fabrica bajo pedido (unas 3 semanas) y se envía en 3 a 5 días cuando está lista.
- Garantía: 1 año en la compuerta estándar y la Mini (por defectos de fábrica); 30 días en la hecha a la medida; 3 meses en el tapón inflable. Vida útil de la compuerta: 5 a 7 años.
- Formas de pago: tarjeta de crédito o débito con Mercado Pago (hasta 6 meses sin intereses con tarjeta de crédito en las compuertas estándar; la Mini y la hecha a la medida no tienen meses sin intereses), PayPal, y transferencia o depósito por WhatsApp. No hay pago contra entrega. Se da factura.

## Por qué confiar
- Salimos en la temporada 10 de Shark Tank México.
- Premio Oro y Plata a la Calidad (a nivel nacional); ganadores del premio «Acelera y Envía» (Wortev y Estafeta); primer lugar en Innovación Estatal (Instituto Sinaloense de la Juventud).
- También se vende en Mercado Libre, con reseñas de compradores.
- Reseñas de clientes con fotos de su compuerta puesta: ${SITIO}/pages/reviews

## Preguntas frecuentes
${preguntas}

## Contacto
- WhatsApp y teléfono: +52 668 241 9579 (contesta una persona del equipo).
- Correo: contacto@diluvium.com.mx
- Dirección: Calle Morelos #254, Los Mochis, Sinaloa, México.
- Página de contacto: ${SITIO}/pages/contact

## Más información
- Todos los productos: ${SITIO}/collections/all-products
- Nosotros (historia y premios): ${SITIO}/pages/nosotros
- Instalación (videos): ${SITIO}/pages/instalacion
- Blog con consejos para la temporada de lluvias:
${articulosBlog()
  .map((a) => `  - [${a.titulo}](${SITIO}/blogs/blog/${a.slug})`)
  .join("\n")}
`;
}

export function GET() {
  return new Response(texto(), { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
