# Plan maestro: diluvium.com.mx sin Shopify

31-oct-2026 · Estado: **propuesta, espera el OK del dueño.** Nada se ha instalado ni se han creado cuentas.

> **Prioridad del dueño (31-oct):** primero la **réplica exacta** de la página en código; el pago, las facturas y la
> mudanza van después. El proceso detallado de la réplica está en `docs/proceso-replica.md`.

Base de este plan: el inventario de la tienda actual (`docs/sitio-actual/inventario.md`), el plan de seguridad
(`docs/seguridad.md`) y dos investigaciones del 31-oct (repos de GitHub y precios oficiales en México).

## 1. Lo que encontramos (en corto)

1. **La tarjeta de hoy la procesa Mercado Pago dentro de la pantalla de pago de Shopify.** El formulario con «Meses»
   es la app «Mercado Pago Tarjetas» (comprobado dos veces el 31-oct, la segunda con Sidekick sobre el pedido #1361;
   detalle en `docs/sitio-actual/inventario.md`). Shopify cobra en cada venta: **2 % extra** por usar una pasarela
   externa (≈ $110 por compuerta de $5,500), además de la comisión de Mercado Pago o PayPal. Al salir de Shopify ese
   2 % y la mensualidad desaparecen y el cliente ve el mismo formulario.
2. **Ya tenemos el «plano» de la página.** La copia local del tema publicado trae cada sección, texto y ajuste de
   cada página. Con eso y una herramienta de clonado, la réplica visual sale fiel.
3. **El repo para replicar la página:** `JCodesMore/ai-website-cloner-template` (38 k estrellas, licencia MIT,
   activo en oct-2026). Está hecho para Claude Code: con `/clone-website https://www.diluvium.com.mx` revisa la
   página en computadora y celular y la rehace en Next.js 16 + Tailwind + shadcn, sección por sección, comparando
   capturas. **Solo copia lo visual**: carrito, pago y administrador los ponemos nosotros.
4. **El repo para la tienda completa:** **Payload 3** con su plantilla de e-commerce (45 k estrellas, MIT). Es una
   sola app Next.js con administrador incluido (productos, tamaños, páginas por bloques, blog, fotos, pedidos,
   clientes, redirecciones, SEO). Usa el mismo tipo de base de datos y herramientas que el CRM.

Repos descartados y por qué: `firecrawl/open-lovable` (pide cuentas de pago y genera otro tipo de proyecto),
`abi/screenshot-to-code` (solo una pantalla suelta), `vercel/commerce` (archivado; su sucesor solo funciona con
Shopify), Medusa / Vendure / Saleor (pensados para tiendas grandes: piden 2 o 3 servidores encendidos todo el día y
no traen editor de páginas).

## 2. Cómo queda armada la página

```
Cliente ──► diluvium.com.mx (Vercel: firewall, anti-DDoS, HTTPS)
              │
              ├─ Tienda (Next.js 16): portada, productos, páginas, blog, carrito, pago
              ├─ Administrador (Payload) en /admin: editar todo sin código, ver pedidos
              │
              ├─► Base de datos Postgres (Neon) ── respaldo diario + copia propia cifrada
              ├─► Fotos y videos (Vercel Blob)
              ├─► Mercado Pago: formulario de tarjeta con Meses, OXXO y cuenta MP
              ├─► Correos de pedido (Resend)
              ├─► Clarity (mapa de calor), Google Analytics/Ads, píxel de Meta y TikTok
              └─► CRM Diluvium (fase 7): cada pedido llega como contacto
```

## 3. Servicios de terceros (recomendación)

| Para qué | Servicio recomendado | Costo | Por qué este |
|---|---|---|---|
| Hospedar la página | **Vercel Pro** | USD 20/mes (≈ $373) | El mejor lugar para Next.js; firewall con 40 reglas, protección de bots (BotID) y DDoS incluidos. El plan gratis **prohíbe** tiendas. Además separa la tienda de Railway (donde está el CRM y donde hubo el incidente del 21-oct) |
| Base de datos | **Neon** (plan Launch, se contrata dentro de Vercel) | Por uso; para esta tienda se estima USD 3–10/mes | Postgres normal, se paga solo lo que se usa. Supabase Pro cuesta USD 25 fijos por cosas que Payload ya trae (usuarios, archivos) y su plan gratis se pausa a la semana |
| Fotos y videos | **Vercel Blob** | Centavos al mes (entra en el crédito de Pro) | Adaptador oficial de Payload |
| **Cobro con tarjeta** | **Mercado Pago** (Checkout API con Bricks) | Igual que hoy: ≈ 3.49 % + IVA (según el plazo de liberación que tenga la cuenta) | **Mismo método que hoy**: misma cuenta, mismos Meses, mismo dinero y depósitos. El formulario va dentro de nuestra página en marcos seguros de Mercado Pago |
| OXXO y cuenta de Mercado Pago | Mercado Pago (mismo formulario) | ≈ 3.19 % + $4 + IVA | Ya lo ofrecen hoy |
| PayPal | PayPal (opcional) | 3.95 % + $4 + IVA (la más cara) | Solo si de verdad se usa; se decide con los datos de pedidos |
| Correos de pedido | **Resend** | Gratis (3,000 al mes) | Fácil y confiable; se manda desde un subdominio para no tocar el correo de Zoho |
| Captcha | **Cloudflare Turnstile** | Gratis | Invisible para el cliente; frena bots en el pago |
| Límites anti-abuso | **Upstash Redis** | Gratis (500 mil operaciones) | Cuenta intentos de pago por IP y por correo |
| Mapa de calor y grabaciones | **Microsoft Clarity** (el mismo proyecto de hoy) | Gratis | Ya está en uso; se conserva el historial |
| Analítica y anuncios | Google Analytics 4, Google Ads, píxel de Meta, píxel de TikTok (mismas cuentas) | Gratis | Se quitan las apps de Shopify; los códigos van directo |
| Errores del sitio | **Sentry** | Gratis | Avisa cuando algo falla |
| Dominio y DNS | El registrador actual (o Cloudflare DNS, gratis) | Igual que hoy | Se agrega candado y DNSSEC |
| Facturas (CFDI) automáticas | Facturapi (opcional) | $299/mes + $0.60 por factura | Solo si hoy se factura cada venta de la tienda |
| Guías de envío | Envia.com (ya aprobado para el CRM) | Saldo por guía | Fase 7 |

**¿Y Stripe?** Es el procesador detrás de Shopify Payments y funciona muy bien (3.6 % + $3 + IVA; Meses de 5 % a
12.5 % extra). Pero cambiar a Stripe sería **cambiar de método**: cuenta nueva, verificación nueva y otros depósitos.
Como el pedido es conservar el mismo método, la recomendación es **Mercado Pago**. Stripe queda como opción futura
(Apple Pay / Google Pay o respaldo si Mercado Pago retiene dinero).

**¿Y Supabase?** Funcionaría, pero cobraría USD 25 fijos por funciones que no usaríamos. Si el dueño lo prefiere, se
cambia Neon por Supabase sin tocar el resto del plan.

**Alternativa más barata:** Railway Hobby (USD 5) en lugar de Vercel. No se recomienda para la tienda: su firewall es
más limitado, describe ese plan como «para proyectos personales» y pondría tienda y CRM en el mismo proveedor.

## 4. Cuánto cuesta y cuánto se ahorra

> **Actualizado el 3-nov con las ventas reales y los precios de las 14 apps: `docs/costos-y-comparacion.md` manda
> sobre esta sección.** Resultado: Shopify hoy ≈ $2,240 al mes (plan + 2 % + apps) contra ≈ $490 de la página propia;
> ahorro ≈ $1,750 al mes (≈ $21,000 al año). Las cifras de abajo eran la primera estimación (31-oct).

**Hoy (Shopify):** plan Basic $399/mes (o $299 pagando el año) + apps (Trustoo, Pumper Bundles, NestScale, WhatsApp;
falta saber cuánto cuestan) + **2 % de cada venta pagada con Mercado Pago o PayPal**, que según el dueño son el 90 % y
el 10 % de los pedidos: prácticamente todas las ventas pagan ese 2 %.

**Página nueva:** ≈ **$470–560/mes** fijos (Vercel + Neon; todo lo demás en planes gratis). Más IVA si el proveedor
lo cobra. Facturapi aparte, solo si se quiere.

La comisión de Mercado Pago es la misma en los dos casos, así que la diferencia real es esta:

| Ventas con tarjeta al mes (≈ $5,500) | Shopify (plan + 2 %) | Página nueva | Ahorro al mes |
|---|---|---|---|
| 5 | $949 + apps | ≈ $520 | ≈ $430 + apps |
| 10 | $1,499 + apps | ≈ $520 | ≈ $980 + apps |
| 20 | $2,599 + apps | ≈ $520 | ≈ $2,080 + apps |

Además del ahorro: control total del diseño y del pago, pruebas A/B sin límites del plan, pedidos que entran
directo al CRM y nada de apps que pesan en la página.

**Costo de construcción:** sesiones de Claude Code (el clonado gasta muchos tokens) y el tiempo del dueño para revisar.
No hay licencias que comprar.

## 5. Fases

| Fase | Qué se hace | Quién | Resultado |
|---|---|---|---|
| **0. Cuentas y datos** | OK a este plan. Crear cuentas a nombre de Diluvium con 2FA (GitHub privado, Vercel Pro, Neon, Resend, Cloudflare, Sentry); credenciales de **prueba** de Mercado Pago (panel de desarrolladores de la misma cuenta); acceso a Clarity; exportar de Shopify el CSV de productos y, de Trustoo, el CSV de reseñas | Dueño, guiado por Claude | Todo listo para construir |
| **1. Clon visual** | `ai-website-cloner-template` en una carpeta aparte: portada, compuerta, páginas y blog en computadora y celular, comparando capturas. Estilos reescritos en Tailwind (no se copia el código del tema Shine) | Claude | Copia visual fiel para revisar |
| **2. Tienda base** (funciona en esta Mac desde el 5-nov-2026; ver `docs/administrador.md`) | Payload + Next.js + Postgres. Cada sección del clon pasa a ser un **bloque editable** en el administrador (banner, logos, video, antes/después, reseñas, 3 pasos, WhatsApp, blog…). Se cargan los 7 productos, tamaños, fotos, páginas, blog y reseñas. Administrador con roles y 2FA | Claude | Página navegable con contenido real |
| **3. Carrito y pago** | Carrito, pantalla de pago (datos y dirección), Mercado Pago (tarjeta con Meses, OXXO, cuenta MP), PayPal si se decide, códigos de descuento, envío gratis, pedidos en el administrador, avisos de pago firmados, correos de confirmación | Claude | Se puede comprar en modo de prueba |
| **4. Medición** | Clarity (mismo proyecto, con enmascarado y etiquetas A/B), GA4 y conversiones de Google Ads, píxel de Meta + API de conversiones, TikTok, banner de cookies. Se pasa el reparto A/B de la prueba B | Claude | Las mismas cifras que hoy, o mejores |
| **5. Seguridad y pruebas** | Todo `docs/seguridad.md`: cyber-neo, encabezados, Turnstile, límites, alertas, respaldos, pruebas de pago (aprobado, rechazado, reembolso, aviso repetido, monto alterado), revisión adversarial | Claude + dueño | Lista de apertura en verde |
| **6. Mudanza** | Vista previa en `nueva.diluvium.com.mx` para que el dueño la revise; redirecciones 301; cambio del dominio en hora de poco tráfico; Search Console; compra real de prueba con reembolso. Shopify se queda **un mes de respaldo** antes de cancelar (y antes se exportan pedidos y clientes) | Dueño + Claude | Tienda nueva en vivo |
| **7. Después** | Pedidos al CRM, guías automáticas con Envia, facturas automáticas, correos de carrito abandonado | Claude | Todo conectado |

## 6. Riesgos y cómo se manejan

- **La plantilla de e-commerce de Payload está en beta** y Payload 4 viene en camino. Se fijan versiones, se usa
  Payload 3 (estable) y el carrito y el cobro con Mercado Pago se escriben a la medida (son 7 productos), usando la
  plantilla solo como guía. Hay un fallo conocido de inventario por tamaño: aquí no se lleva inventario por tamaño.
- **Mercado Pago no tiene adaptador oficial para Payload**: se escribe uno (crear pago y confirmar pedido) con
  pruebas completas.
- **Posicionamiento en Google**: se conservan las mismas direcciones y se ponen 301 en las que cambien.
- **Licencia del tema Shine**: no se copia su código; solo se replica el aspecto.
- **Seguridad**: es el cambio más grande respecto a Shopify; se trata en `docs/seguridad.md` y se revisa antes de abrir.
- **Prueba A/B en Shopify (tarea «Pruebas ABC»)**: puede seguir mientras se construye; lo que enseñe Clarity sirve
  para el diseño nuevo.

## 7. Lo que se necesita del dueño

1. **OK al proceso de réplica** (`docs/proceso-replica.md`) y después a este plan (o cambios: Supabase en lugar de
   Neon, Stripe en lugar de Mercado Pago, Railway en lugar de Vercel).
2. Acceso a Clarity (proyecto `ri7st5vqrh`) — ya estaba pendiente para la prueba B.

Respondido el 31-oct: 90 % Mercado Pago y 10 % PayPal (PayPal se queda); se factura cada venta, pero no es prioridad;
dominio en GoDaddy; envíos desde Envia; el pago se configura después de la réplica.

## Fuentes principales

- Clonado: github.com/JCodesMore/ai-website-cloner-template · Tienda: github.com/payloadcms/payload/tree/main/templates/ecommerce
- Shopify: shopify.com/mx/precios (Basic $399/$299, comisión de 2 % por otras pasarelas)
- Mercado Pago: mercadopago.com.mx/herramientas-para-vender/check-out · PCI de Bricks:
  mercadopago.com.mx/developers/es/docs/checkout-bricks/additional-content/security/pci
- Stripe: stripe.com/es-mx/pricing · docs.stripe.com/payments/mx-installments
- Vercel: vercel.com/pricing y vercel.com/docs/limits/fair-use-guidelines · Neon: neon.com/pricing ·
  Supabase: supabase.com/pricing · Resend: resend.com/pricing · Clarity: learn.microsoft.com/en-us/clarity/faq ·
  Facturapi: facturapi.io/pricing
- Tipo de cambio: 18.65 MXN/USD (FIX Banxico, 28-oct-2026)

Pendiente de confirmar: el porcentaje exacto de Meses de Mercado Pago (solo se ve dentro del panel de la cuenta) y el
plazo de liberación de dinero que tiene configurado la cuenta de Diluvium.
