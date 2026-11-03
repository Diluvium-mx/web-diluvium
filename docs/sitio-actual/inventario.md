# Inventario de la tienda actual (diluvium.com.mx en Shopify)

Revisado el 31-oct-2026 en la página pública, en la pantalla de pago (sin escribir ningún dato) y en la copia local
del tema (`~/Documents/Diluvium CRM/tienda-tema/prueba-b/`, commit `69d5993` = tema publicado sin cambios).
Esta es la lista de todo lo que la página nueva tiene que hacer igual o mejor.

## Datos de la tienda

| Dato | Valor |
|---|---|
| Plan | Shopify **Basic** |
| Tienda interna | `evita-inundarte-mx.myshopify.com` (id 64793084124) |
| Tema publicado | «Copia de Manuel - Diluvium Updates \| NEW» (id 164909056220), tema **Shine 2.0.0** de SalesHunterThemes (tema de pago) |
| Moneda / país | MXN, envíos solo a México |
| Domicilio fiscal en Shopify | Los Mochis, Sinaloa |
| Contacto en la página | (668) 241 9579 · contacto@diluvium.com.mx |

> **Ojo con el tema:** Shine es un tema de pago con licencia para usarse en Shopify. No se copia su código; la página
> nueva se rehace desde cero con el mismo aspecto. Los textos, fotos y videos sí son de Diluvium y se reutilizan.

## Cómo se paga hoy (lo más importante)

En la pantalla de pago hay tres formas de pagar. **No está activo Shopify Payments** (por eso no aparecen Shop Pay,
Apple Pay ni Google Pay):

1. **Tarjeta de crédito** → la procesa la app **«Mercado Pago Tarjetas»**. El formulario va dentro de la misma
   página: número de tarjeta, vencimiento, código de seguridad, nombre del titular y **«Meses»** (meses sin
   intereses). Acepta Visa, Mastercard y American Express.
2. **Mercado Pago** («Checkout Mercado Pago») → manda al cliente a Mercado Pago (cuenta MP, OXXO, etc.).
3. **PayPal** → también como botón de «Pago exprés» arriba de la pantalla de pago.

También está instalada la app **«Mercado Pago Antifraud Plus»**.

**Comprobado de nuevo el 31-oct (segunda revisión, porque el dueño entendía que se cobra con Shopify Payments):**
- La pantalla de pago enumera exactamente tres pasarelas: «Checkout Mercado Pago», «Mercado Pago Tarjetas» y
  «paypal». Ninguna es Shopify Payments.
- El pedido #1361 (29-oct, Mastercard a 6 meses) trae el id de pago de Mercado Pago, y **Sidekick confirmó que lo
  procesó «Mercado Pago Tarjetas»**.
- Sidekick no pudo ver Configuración → Pagos porque la cuenta `contacto@diluvium.com.mx` no tiene ese permiso. Para
  confirmarlo al 100 %, el propietario de la tienda lo ve en **Configuración → Pagos**.
- Por qué parece que «cobra Shopify»: Shopify **sí cobra en cada venta**. Como la pasarela es externa, el plan Basic
  agrega una **comisión de 2 %** por pedido pagado con Mercado Pago o PayPal. Además, la tarjeta se escribe dentro de
  la pantalla de pago de Shopify.

**Consecuencia de costo:** hoy cada venta paga la comisión de Mercado Pago (o PayPal) **más** el 2 % de Shopify. En la
página nueva ese 2 % y la mensualidad desaparecen. Según el dueño, el 90 % de los pedidos se paga con Mercado Pago y el
10 % con PayPal, así que el 2 % se paga prácticamente en todas las ventas. Cifras en el plan maestro.

**Qué significa «el mismo método de tarjeta»:** el mismo formulario de Mercado Pago con Meses, dentro de nuestra
propia pantalla de pago, con la misma cuenta de Mercado Pago (mismo dinero, mismos depósitos, mismos meses).

## Productos (7)

| Producto | Opciones | Precio (antes) |
|---|---|---|
| Compuerta Anti-Inundaciones | 5 tamaños: Extra Chica 69–78 · Chica 79–90 · Mediana 91–100 · Grande 101–110 · Extra Grande 111–120 cm | $5,500 ($5,999) |
| Compuerta XXL – Hecha a la medida | única | $7,000 |
| Mini Compuerta (30 cm de altura) | 7 tamaños: A 62–70 … G 116–123 cm | $3,000 ($3,499) |
| Tapón inflable (coladeras) | 2", 3", 4" | $749 / $799 / $849 |
| Funda de repuesto | 5 tamaños | $699 ($999) |
| Tira de hule de repuesto | única | $559 ($599) |
| Plastilina de secado rápido | única | $49 |

Colecciones (6): `all-products`, `a-compuerta`, `coleccion-para-escritorio`, `coleccion-para-mobile`, `frontpage`,
`los-mas-vendidos`. Cada producto tiene su propia plantilla (compuerta estándar, medida especial, mini, tapón).

Para migrar: exportar el **CSV de productos** desde el administrador de Shopify (trae fotos, SEO y variantes).

## Páginas y direcciones (hay que conservarlas para no perder Google)

- Portada `/`
- Productos `/products/<nombre>` (7) y colecciones `/collections/<nombre>` (6)
- Páginas: `/pages/nosotros`, `/pages/contact` (con preguntas frecuentes), `/pages/preguntas-frecuentes`,
  `/pages/instalacion` (videos), `/pages/distribuidor`, `/pages/reviews`, `/pages/share-cart`
- Blog `/blogs/blog` con 3 artículos (preparación para inundaciones, por qué aumentan, kit de evacuación)
- Políticas: `/policies/terms-of-service`, `/policies/refund-policy`, `/policies/privacy-policy`
- Carrito `/cart` y cuentas de cliente `/account` (plantillas del tema; revisar si alguien las usa)

Toda dirección vieja que cambie lleva **redirección 301** a la nueva.

## Secciones de la portada (en orden)

Barra de mensajes que corre → encabezado (menú: Productos, Contacto, Nosotros, Blog) → banner principal → logos →
collage con texto → video con texto → franja que corre → collage de contenido → producto destacado («Lo más
vendido 🔥») → pestañas de productos → íconos con texto → antes/después («De improvisar con sacos… a una protección
segura») → reseñas de clientes → «Protege tu hogar en 3 pasos» → «No necesitas confiar en nosotros, confía en ellos»
→ logos que se mueven (medios / Shark Tank) → formulario de WhatsApp («¡Hola!») → «Tips de prevención» (blog) →
carrusel de reseñas (Trustoo) → pie de página.

## Página de producto (compuerta)

Migas de pan, galería (10 fotos), botones de tamaño, precio con «antes», «Añadir al carrito», botón de WhatsApp,
cuadros de Amazon y Mercado Libre, íconos de confianza, «Cualidades que nos distinguen», antes/después («Olvídate de
los pesados sacos de arena»), video con texto, reseñas, «Protege tu hogar en 3 pasos», productos recomendados.
Carrito lateral con aviso de envío gratis.

## Apps y herramientas instaladas (todo esto se reemplaza)

| Qué hace | Hoy | En la página nueva |
|---|---|---|
| Pago con tarjeta + Meses | Mercado Pago Tarjetas | Mercado Pago (formulario dentro de nuestra página) |
| Pago con cuenta MP / OXXO | Checkout Mercado Pago | Mercado Pago (mismo formulario, otras opciones) |
| PayPal | PayPal | PayPal (opcional, según cuánto se use) |
| Antifraude | Mercado Pago Antifraud Plus | Antifraude de Mercado Pago + protecciones propias |
| Reseñas (≈204–238) | **Trustoo** | Reseñas propias en la base de datos (exportar las de Trustoo) |
| Paquetes / descuentos por cantidad | **Pumper Bundles** | Descuentos propios en el administrador |
| Botón de WhatsApp | app «WhatsApp chat» | Botón propio (sin app) |
| Mapa de calor y grabaciones | **Microsoft Clarity** (proyecto `ri7st5vqrh`, en el código del tema) | Clarity (mismo proyecto) |
| Analítica y anuncios de Google | app Google & YouTube: GA4 `G-DXKGTCTT8B`, Google Ads `AW-10838141622` | Las mismas etiquetas, sin app |
| Píxel de Meta | app Facebook & Instagram (píxel `294658158873269`) | Píxel + API de conversiones propia |
| Píxel de TikTok | app TikTok (`D2ADPDRC77U4I5MEOLGG`) | Píxel de TikTok |
| Google Tag Manager | píxel personalizado | Opcional |
| Captcha en formularios | Shopify | Cloudflare Turnstile |
| Correos de pedido y de carrito abandonado | Shopify | Correos propios (Resend) |
| Catálogo para IA (ChatGPT, etc.) | «agentic discovery» de Shopify | Datos estructurados (schema.org) y feed propio |

Otras apps que aparecen dentro de las páginas: **NestScale Estimated Delivery** (fecha estimada de entrega en el
producto) y **Pumper Bundles quantity breaks** (descuento por cantidad).

## Administrador de Shopify: lo que se usa (revisado el 31-oct)

- **Pedidos** (lo que más se usa): columnas Pedido, Fecha, Cliente, Canal, Total, Destino, Estado del pago, Estado de
  preparación, Artículos, Estado de la entrega, Forma de entrega y Etiquetas. Último pedido visto: #1361.
- **Flujo de envío:** la guía se hace en Envia; en el pedido se pone el número de guía (paquetería «Otro», a veces dos
  guías) en «Preparar artículos», se marca notificar al cliente y le llega el correo «Confirmación de envío». El
  pedido queda «Preparado» y se archiva; después se puede «Marcar como entregado».
- **En el detalle del pedido:** «Información adicional» que escribe la app de Mercado Pago (id del pago, tipo, tarjeta,
  meses, monto, direcciones), nivel de riesgo, cliente, dirección, comentarios internos e historial.
- **Descuentos:** 10 códigos; 2 activos hoy (un porcentaje con compra mínima y un monto fijo, ambos en la compuerta; los códigos se consultan en el administrador, no se escriben aquí porque el repositorio es público). Los demás vencidos.
- **Correos a clientes:** confirmación de pedido, confirmación y actualización de envío, cancelación, reembolso,
  recordatorio de carrito, entre otros. El dominio de correo tiene pendiente configurar DMARC (aviso de Shopify).
- Menú lateral también con Borradores, Etiquetas de envío y Pedidos abandonados.

## Respuestas del dueño (31-oct)

- Pagos: 90 % de los pedidos de la web con Mercado Pago y 10 % con PayPal.
- Se factura cada venta de la tienda (público en general o factura), pero no es prioridad ahora.
- El dominio está en **GoDaddy**.
- El envío se maneja aparte, todo desde **Envia**.
- La plataforma de pago no se configura todavía: primero la réplica exacta de la página.

## Archivos de esta carpeta

- `paginas/` — ficha de cada plantilla del tema: secciones en orden con textos, fotos, videos y enlaces.
- `diseno.md` — colores, letras y estilos del tema. `medios.md` — los 191 archivos de fotos y videos.
- `capturas/2026-10-31/` — capturas de página completa (celular y computadora) y HTML de cada página.
- `datos/home.html` — la portada tal como la entrega Shopify (31-oct). Sin datos de clientes.
- `datos/sitemaps-todas.xml`, `datos/sitemap.xml`, `datos/meta.json` — mapa del sitio y datos públicos de la tienda.
- `datos/productos/compuerta-anti-inundaciones.json` — ficha pública de la compuerta.
