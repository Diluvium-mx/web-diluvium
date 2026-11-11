# Publicar la página en Cloudflare

10-nov-2026 · Estado: **lista para publicar en una dirección de prueba**. Falta la cuenta de Cloudflare (la crea el
dueño).

## Copia ligera de prueba (plan GRATIS) — publicada el 11-nov-2026
Para revisar versiones en línea mientras la tienda sigue en Shopify, sin pagar Workers:
- **Dirección:** `https://diluvium-prueba.web-diluvium.workers.dev` (el Worker «diluvium-prueba»; el dominio no se
  toca).
- **Qué es:** la misma página, pero sin el administrador, sin base de datos y sin fotos subidas. El pago y los
  formularios avisan que es una copia de prueba y no guardan nada.
- **Peso:** 1.3 MB comprimido (el plan gratis admite 3 MB; la página completa pesa 3.7 MB por el administrador).
- **No se indexa:** se construye con `SITIO_PRUEBA=1`.
- **Comandos:**
  - `npm run prueba:medir` arma la copia y dice cuánto pesa;
  - `npm run prueba:publicar` la arma y la publica (con los archivos de ahora);
  - `node herramientas/publicar-prueba.mjs --desde=<rama> --publicar` la arma con lo guardado en una rama de git.
- **Cómo se arma:** `herramientas/publicar-prueba.mjs` hace una copia temporal y le quita el administrador. No
  cambia nada del proyecto.

La página completa (administrador, pedidos, correos) se publica con el plan de pago cuando llegue la mudanza; los
pasos están abajo.

## Por qué primero una dirección de prueba
- La copia se publica en `diluvium.<cuenta>.workers.dev` (o en `nueva.diluvium.com.mx` cuando el DNS esté en
  Cloudflare).
- **No toca la tienda de Shopify ni el dominio.**
- Se construye con `SITIO_PRUEBA=1`: el robots.txt bloquea todo, cada página lleva `noindex` y todo lo que se sirve
  lleva `X-Robots-Tag: noindex`. Así Google no la indexa ni la compara con la tienda (contenido repetido).
- Mientras no esté conectado el cobro, la pantalla de pago guarda el pedido como «pendiente» y no cobra. Para una
  prueba con clientes reales hay que decidir qué ve el cliente al pagar.

## Lo que hace el dueño (una sola vez)
1. Crear la cuenta de Cloudflare con el correo de la empresa (no personal) y activar la verificación en dos pasos.
2. Contratar **Workers Paid (USD 5 al mes)**: Workers & Pages › Plans. Es necesario: el paquete pesa 3.7 MB y el
   plan gratis admite 3 MB.
3. En esta Mac, en la Terminal, dentro de la carpeta del proyecto: `npm run cf:entrar`. Se abre el navegador y el
   dueño autoriza a wrangler con su cuenta (Claude no entra con contraseñas). La autorización queda guardada en esta
   Mac.

## Lo que hace Claude después (comandos ya listos)
| Paso | Comando |
|---|---|
| Crear la base y el almacenamiento de fotos | `npm run cf:crear` (D1 «diluvium» y R2 «diluvium-medios»); el id de la base va a `wrangler.jsonc` |
| Guardar la llave de sesiones del administrador en Cloudflare | `npm run cf:llave` (se genera al azar y nunca se muestra) |
| Crear las tablas en la base de Cloudflare | `CLOUDFLARE_REMOTO=1 npm run admin:migrar` |
| Cargar el contenido | `CLOUDFLARE_REMOTO=1 npm run admin:sembrar` |
| Publicar la copia de prueba | `npm run cf:desplegar-prueba` |
| Crear el usuario del dueño | Lo crea el dueño en `/admin` justo después de publicar (antes de compartir la dirección) |

## Después
- **Proteger `/admin` con Cloudflare Access** (código por correo, gratis hasta 50 usuarios).
- **Publicación automática** al guardar en el administrador.
- **Dominio:** pasar el DNS a Cloudflare para usar `nueva.diluvium.com.mx` y, al final, `www.diluvium.com.mx`.
