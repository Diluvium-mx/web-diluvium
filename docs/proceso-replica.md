# Proceso de réplica exacta de diluvium.com.mx

31-oct-2026 · Estado: **paso 1 (réplica visual) terminado el 4-nov-2026** (OK del dueño el 3-nov-2026).

## Resultado del paso 1 (4-nov-2026)

Las **34 páginas** del sitio replicadas en celular (390), tableta (768) y computadora (1440): portada, 7 productos,
7 colecciones y su lista, Nosotros, Contacto, Instalación, Distribuidor, Preguntas frecuentes, Reseñas, Carrito
compartido, blog y 3 artículos, carrito, búsqueda (con resultados), 3 políticas y 404.

- **102 comparaciones, 979 secciones:** 101 de 102 páginas-vista miden lo mismo que en vivo (±2 px) y todas sus
  secciones quedan en ±4 px y ≤ 2 % de píxeles distintos. La única fuera de meta: la lista de 238 reseñas en celular
  (26 px de redondeo en 50,000 px, 0.9 %). Lo que se mueve solo (franjas, logos, carruseles) se revisa lado a lado; los
  videos se comparan congelados en su primer cuadro.
- Resumen de todo: `python3 -I herramientas/resumen-comparaciones.py` (después de correr las comparaciones).

## Después del paso 1: lo que se hizo sin cuentas ni servicios (4-nov-2026)

- **Google y redes igual que en vivo** en las 34 páginas: título, descripción (o su ausencia), dirección canónica,
  Open Graph, Twitter y datos estructurados (Organization en todas, WebSite en la portada, Product con una oferta por
  tamaño, precio, disponibilidad y código de barras, Article en el blog). Los textos salen de `contenido/seo.json`
  (`herramientas/extraer-seo.py`). La ficha Product se arma con el catálogo, para que precio y disponibilidad no se
  desfasen. Se revisa con `node herramientas/comparar-seo.mjs` (34 de 34 iguales).
- **`/sitemap.xml` y `/robots.txt`** en las mismas direcciones: las mismas 25 direcciones que publica hoy la tienda y
  sus reglas para lo que existe aquí. Las reglas propias de Shopify se quitaron.
- **Calificaciones calculadas** con las 238 reseñas publicadas (dan lo mismo que en vivo: 4.94 con 204, 4.82 con 22,
  5 con 10 y 5 con 2). Ya no están escritas a mano.
- Una diferencia a propósito: en vivo la lista de redes de la organización trae huecos vacíos, que Google marca como
  error. Aquí se quitaron (no se ve en la página).
- **Carrito funcionando en el navegador** (igual que en vivo, menos el pago):
  - agregar desde la ficha y desde la búsqueda (con su ventana para elegir tamaño);
  - el carrito lateral y `/cart`, con cantidades, quitar, totales y la barra de envío gratis;
  - el tope de piezas en existencia, con el mismo aviso;
  - comparado con capturas nuevas de la tienda con artículos (`herramientas/capturar-carrito.mjs` y
    `comparar-carrito.mjs`, todo ≤ 2 %).

  Se guarda solo «variante y piezas»; el precio siempre sale del catálogo. «Finalizar compra», PayPal y guardar la
  nota del pedido esperan al paso 3.
- **Revisión de que nada se movió** (portada, 3 productos, colección, búsqueda, blog y reseñas, en las 3 vistas):
  todo en meta. Excepción: la lista de 238 reseñas. Sus tarjetas quedan 1–2 px corridas según cuándo cargan las fotos,
  y la comparación de esa sección da entre 0.5 % y 14 % de una corrida a otra, con el mismo contenido y el mismo
  orden. Ahora se mide el alto de cada tarjeta en píxeles enteros, como lo hace la app en vivo.

## Avance del paso 1 (3-nov-2026)

**Portada terminada** en celular (390), tableta (768) y computadora (1440): las 27 secciones (encabezado, 23 de la
portada y pie) miden lo mismo que en vivo (±1 px) y quedan entre 0.0 % y 1.6 % de píxeles distintos. Lo que se mueve
solo (franjas, logos, carruseles de reseñas, el video del collage) se revisó lado a lado. Alto total en computadora:
13,760 px en vivo y en la réplica. Comparación completa: `comparaciones/portada-*.md` (se regenera con
`npm run comparar -- portada / celular,tableta,compu`).

Medidas que se descubrieron y ya están en `globals.css`: el tema pasa a diseño de computadora desde **1025 px**
(márgenes de 64 px), el menú en línea y el pie de 4 columnas desde **1200 px**.

**Diferencias a propósito:** sin «Tecnología de Shopify» en el pie y sin «Powered by SeedGrow» en la ventanita de
WhatsApp.

**Decisiones del dueño (3-nov-2026):**
- **Todo funciona exactamente como en vivo.** Si una función necesita un servicio del paso 3, se deja idéntica en
  aspecto y se conecta en el paso 3; no se inventa otro comportamiento mientras tanto.
- Las **reseñas publicadas** (nombre como se muestra, estrellas, texto y fotos) son excepción a la regla de datos de
  clientes: ya son públicas en la tienda.

**Funciones que esperan al paso 3 (aspecto listo, conexión pendiente):**

**El carrito ya funciona (4-nov-2026)** en el navegador, igual que en vivo: «Añadir al carrito» en la ficha y «Quick add»
en la búsqueda (con su ventana de tamaños) lo agregan y abren el carrito lateral; número en la bolsa, piezas, quitar,
totales, barra de envío gratis, tope de existencias con su aviso y la página /cart. Se guarda en el navegador solo
como «variante y piezas»; precio, título y foto salen siempre del catálogo. Referencia: capturas y medidas del
4-nov-2026 (`herramientas/capturar-carrito.mjs`, `comparar-carrito.mjs`). Del carrito solo esperan el pago y guardar la nota del pedido.

| Función | Qué hace en vivo | Qué falta |
|---|---|---|
| Formulario «¡Hola!» (portada) | Manda los datos al correo de la tienda y muestra «gracias» | Servicio de correos + Turnstile |
| Suscripción del pie | Guarda el correo como suscriptor | Base de datos + Turnstile |
| Pago («Finalizar compra» y PayPal en el carrito) | Lleva al pago de Shopify | Pago con Mercado Pago, precio calculado en el servidor |
| Notas del pedido (carrito) | Guarda la nota con el carrito | Se guarda con el pedido en el servidor |
| Búsqueda (lupa del encabezado) | Abre el buscador | Se construye con las páginas |

**Sigue:** páginas de producto (compuerta, XXL, mini, tapón, accesorios), después páginas, blog y carrito.

Objetivo: tener la página **idéntica** a la de hoy, pero en código propio, para manipularla fácilmente con Claude Code y
dejar de pagar Shopify. Este documento dice exactamente qué se replica, de dónde sale cada cosa, en qué orden y cómo
se comprueba que quedó igual.

## 1. Qué significa «exacta» (cómo se mide)

Una página cuenta como replicada solo si cumple las 7 cosas:

| # | Criterio | Cómo se comprueba |
|---|---|---|
| 1 | **Mismas direcciones** (las 25 de hoy) | Lista de direcciones del mapa del sitio; cada una abre la página nueva o redirige con 301 |
| 2 | **Mismo contenido**: textos, fotos, videos, precios, tamaños | Se toman del tema publicado y del catálogo, no se reescriben a mano |
| 3 | **Mismo aspecto** en celular (390 px), tableta (768 px) y computadora (1440 px) | Captura de página completa de la nueva contra la de referencia, sección por sección. Meta: ≤ 2 % de píxeles distintos por sección (sin contar lo que se mueve solo: franjas que corren, carruseles, videos) |
| 4 | **Mismo comportamiento** (sección 5) | Lista de interacciones probada una por una en celular y computadora |
| 5 | **Mismos datos para Google**: título, descripción, imagen para compartir, datos de producto, precio y reseñas, mapa del sitio | Comparación del HTML de la página vieja y la nueva |
| 6 | **Igual de rápida o más** (hoy 96/100 en celular) | PageSpeed / Lighthouse |
| 7 | **El dueño la aprueba** viendo las dos lado a lado | Vista previa |

Lo que **no** se replica a propósito: las secciones que hoy están ocultas en el tema, las funciones del tema que no se
usan (mega menú, selector de idioma y de país, tarjetas de regalo, vista rápida) y el código del tema Shine (es de
pago; se rehace el aspecto, no se copia su código).

## 2. De dónde sale cada cosa (fuentes de verdad)

| Qué | Fuente | Dónde está |
|---|---|---|
| Secciones de cada página, en orden, con todos sus textos, botones, enlaces, fotos y videos | Tema publicado (copia local, commit `69d5993`) | `docs/sitio-actual/paginas/` (25 fichas, generadas con `herramientas/extraer-tema.py`) |
| Colores, fuentes, bordes, estilos de tarjetas y botones | Ajustes del tema | `docs/sitio-actual/diseno.md` |
| Cómo se ve de verdad | Capturas de página completa del 31-oct, celular y computadora, y el HTML de cada página | `docs/sitio-actual/capturas/2026-10-31/` (generadas con `herramientas/capturar-sitio.mjs`) |
| Fotos, videos, logos e íconos | CDN de Shopify | Lista de 191 archivos en `docs/sitio-actual/medios.md`; se descargan en la fase 1 |
| Productos, tamaños, precios, fotos, SEO | Catálogo de Shopify | CSV de productos (lo exporta el dueño) + fichas públicas |
| Reseñas (≈204–238) | App Trustoo | CSV de Trustoo (lo exporta el dueño) |
| Códigos de descuento | Administrador → Descuentos | 2 activos hoy (los códigos se consultan en el administrador; no se escriben aquí porque el repositorio es público) |
| Correos a clientes | Administrador → Notificaciones | Se copian los textos de «Confirmación de pedido», «Confirmación de envío» y «Actualización de envío» |
| Políticas (privacidad, reembolso, términos) | `/policies/…` | Capturas y HTML guardados |
| Dudas de cómo funciona algo en Shopify | Sidekick (asistente de Shopify) | Se le pregunta cuando haga falta |

**Si dos fuentes no coinciden, manda la página en vivo** (capturas del 31-oct): la copia local del tema es del 28-oct y
alguien pudo editar la tienda después. Varias «tablas» de la página (por ejemplo «¿Por qué somos tu mejor opción?»)
son imágenes, no texto: se reutiliza la imagen tal cual.

**Diseño global (del tema):** letra del texto **Instrument Sans**, títulos **Archivo** (peso 500), títulos grandes
**Bevan**; azul `#0A559A` / `#004288`, naranja de botones `#F8A01D`, verde `#28A625` en la franja; esquinas rectas
(0 px). Las tres letras son de Google Fonts (gratis).

## 3. Desglose de páginas

| Página | Dirección | Secciones visibles |
|---|---|---|
| Encabezado (todas las páginas) | — | 3: franja que corre, barra de datos de contacto, menú |
| Pie (todas las páginas) | — | 1: datos de la tienda, menú, suscripción «Suscríbete para ofertas y descuentos» |
| Portada | `/` | 23 |
| Compuerta | `/products/compuerta-anti-inundaciones` | 20 |
| Compuerta XXL a la medida | `/products/compuerta-anti-inundaciones-hecha-a-la-medida` | 16 |
| Mini compuerta | `/products/mini-compuerta` | 19 |
| Tapón inflable | `/products/tapon-inflable-anti-inundaciones` | 14 |
| Funda, tira de hule, plastilina | `/products/…` (plantilla general) | 8 |
| Colección de productos | `/collections/all-products` (y 5 colecciones más) | 2 |
| Nosotros | `/pages/nosotros` | 19 |
| Contacto + preguntas frecuentes | `/pages/contact`, `/pages/preguntas-frecuentes` | 4 |
| Instalación (videos) | `/pages/instalacion` | 5 |
| Distribuidor | `/pages/distribuidor` | 13 |
| Reseñas | `/pages/reviews` | 1 + reseñas |
| Blog y 3 artículos | `/blogs/blog`, `/blogs/blog/…` | 2 cada una |
| Carrito | `/cart` (y carrito lateral) | 1 |
| Búsqueda, 404, políticas | `/search`, cualquier dirección mala, `/policies/…` | 1–3 |

**Piezas que hay que construir:** 38 tipos de sección distintos. Los más usados: banner con imagen (29 veces), collage de
imagen con texto (26), franja que corre (14), texto (13), íconos con texto (11), video con texto (9), columnas de
medios (7), reseñas, antes/después, pestañas de información, collage de contenido y preguntas frecuentes (6 cada uno).
Cada tipo se construye **una vez** como pieza reutilizable y se llena con el contenido de cada ficha.

**Apps dentro de las páginas que también se rehacen:**
- **Trustoo** (reseñas): estrellas junto al título, lista de reseñas con fotos y carrusel en la portada.
- **NestScale Estimated Delivery** (fecha estimada de entrega en la página de producto).
- **Pumper Bundles** (descuento por cantidad).
- Botón flotante de **WhatsApp** y botón de WhatsApp con mensaje prellenado bajo «Añadir al carrito».

## 4. Cómo se construye (método)

1. **Proyecto base.** Next.js 16 + TypeScript + Tailwind, con las tres letras y los colores del tema como variables.
   Repositorio privado `Diluvium-mx/web-diluvium`.
2. **Medios.** Se descargan los 191 archivos del CDN de Shopify a la carpeta del proyecto (optimizados para web).
3. **Clonado página por página** con `ai-website-cloner-template` (`/clone-website`), en este orden: encabezado y pie →
   portada → compuerta → demás productos → páginas → blog → carrito. La herramienta mide los estilos reales en el
   navegador; los textos y fotos se toman de las fichas (no se adivinan). Regla: los estilos se escriben en Tailwind
   desde cero; nada del CSS/JS del tema Shine.
4. **Comparación automática.** El mismo capturador saca la página nueva en 390, 768 y 1440 px y la compara contra la
   referencia sección por sección. Sale un reporte con las diferencias; se corrige hasta quedar dentro de la meta.
5. **Interacciones.** Se prueba la lista de la sección 5 en celular y computadora.
6. **Revisión del dueño** con las dos versiones lado a lado.
7. **Hacerla editable.** Cada pieza pasa a ser un **bloque del administrador** con los mismos campos que hoy tiene en el
   editor de temas de Shopify (título, texto, imagen, botón, enlace, color). Así el dueño edita igual que hoy, y
   Claude Code puede cambiar cualquier cosa directo en el código.

## 5. Comportamientos que se replican

- Franjas de texto que corren (encabezado y secciones) y logos que se desplazan.
- Menú de celular que se abre y cierra; encabezado fijo al bajar.
- **Carrito lateral** con aviso de envío gratis y botones de cantidad; página de carrito.
- Página de producto: galería con miniaturas y zoom, **botones de tamaño** que cambian el precio (con precio «antes»
  tachado) y la foto, ventana emergente con la **tabla de medidas**, palomitas de beneficios, «Añadir al carrito»,
  botón de **WhatsApp con mensaje prellenado**, cuadros de **Amazon** y **Mercado Libre**, fecha estimada de entrega,
  íconos de confianza y acordeones de información.
- Antes/después con barra deslizante; videos de YouTube y videos propios con imagen de portada; pestañas de
  información («Protege tu hogar en 3 pasos»); preguntas frecuentes que se abren y cierran.
- Reseñas: estrellas, promedio, lista con fotos y carrusel.
- Formulario de WhatsApp («¡Hola!») y suscripción al boletín del pie.
- Botón flotante de WhatsApp.
- Búsqueda de productos y página 404.

## 6. Carrito, pago y pedidos (después de la réplica visual)

El dueño indicó que la plataforma de pago se configura después. Lo que se replicará entonces:

**Pantalla de pago (igual a la de Shopify):** correo + casilla «Enviarme novedades» → entrega (país, nombre, apellidos,
dirección, departamento, código postal, ciudad, estado, teléfono) → envío «Terrestre 3–5 días» gratis → pago:
**tarjeta con Meses** (Mercado Pago, 90 % de los pedidos), **Mercado Pago** (cuenta y OXXO) y **PayPal** (10 %) →
código de descuento → resumen → página de «pedido confirmado» y correo de confirmación.

**Administrador de pedidos (réplica de lo que se usa en Shopify):**
- **Lista de pedidos** con las mismas columnas: número, fecha, cliente, canal, total, destino, estado del pago, estado de
  preparación, artículos, estado de la entrega, forma de entrega y etiquetas. Pestañas: todos, no preparados, no
  pagados, abiertos y archivados. Búsqueda y exportar a CSV. Los números siguen desde el último de Shopify (#1362 en
  adelante) para no repetir.
- **Detalle del pedido:** artículos y tamaño; pago (subtotal, envío, total, pagado) con los datos de Mercado Pago (id
  del pago, tarjeta, meses); cliente y contacto; dirección de envío y de facturación; nivel de riesgo; notas; etiquetas;
  comentarios internos e historial con fecha y hora.
- **Preparar artículos (lo que más se usa):** se escribe el **número de guía** (uno o varios) y la paquetería (lista con
  «Otro», como hoy), se marca **«Notificar al cliente»** y se guarda. El cliente recibe el correo **«Confirmación de
  envío»** con su número de guía. Después se puede **«Marcar como entregado»** y el pedido se archiva solo.
- Reembolsar, cancelar, pedidos abandonados (con correo de recordatorio), clientes, descuentos (porcentaje o monto,
  por producto o por pedido, compra mínima, una vez por pedido, vigencia y usos).
- Correos: confirmación de pedido, confirmación de envío, actualización de envío, pedido cancelado, reembolso y
  recordatorio de carrito.

Las guías se siguen haciendo en Envia como hoy; en una fase posterior se puede conectar Envia para que el número de
guía se llene solo.

## 7. Medición (igual que hoy)

Clarity (mismo proyecto `ri7st5vqrh`, con mapa de calor y grabaciones), Google Analytics 4 (`G-DXKGTCTT8B`), Google Ads
(`AW-10838141622`), píxel de Meta (`294658158873269`) y píxel de TikTok, con los mismos eventos de compra. Se agrega el
reparto A/B de la prueba B para que se pueda seguir probando.

## 8. Orden de trabajo y entregables

| Paso | Entregable | Cómo se sabe que está listo |
|---|---|---|
| 1. Réplica visual exacta | Vista previa privada con todas las páginas | Reporte de comparación dentro de la meta + OK del dueño |
| 2. Administrador y contenido editable | Productos, páginas, blog, reseñas y menús editables | El dueño cambia un texto y una foto sin código |
| 3. Carrito, pago y pedidos | Compra completa en modo de prueba; pedidos con «Preparar artículos» y correo de envío | Pruebas de pago (aprobado, rechazado, reembolso) |
| 4. Medición | Clarity, Google, Meta y TikTok funcionando | Eventos vistos en cada panel |
| 5. Seguridad | Todo `docs/seguridad.md` | cyber-neo sin hallazgos críticos ni altos |
| 6. Mudanza | Dominio de GoDaddy apuntando a la página nueva; Shopify un mes de respaldo | Compra real de prueba con reembolso |

## 9. Lo que se necesita para el paso 1

- OK del dueño a este proceso.
- Cuenta de GitHub de Diluvium para el repositorio privado (ya existe la organización `Diluvium-mx`).
- Nada más: la réplica visual se hace con lo que ya está en esta carpeta, sin crear servicios de pago. La vista previa
  puede correr en esta Mac; para verla desde el celular hará falta un lugar de pruebas (se decide en ese momento).
