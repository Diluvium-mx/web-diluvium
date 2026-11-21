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
- **Páginas de revisión como archivos fijos (12-nov-2026):** el plan gratis da 10 ms de procesador por visita y armar
  una página dentro del Worker a veces se pasaba (error 1102, «Worker exceeded resource limits»). Las páginas de `/v…`
  se suben como archivos fijos y Cloudflare las entrega sin pasar por el Worker; los encabezados de seguridad y «no
  indexar» van en `_headers`. El resto de la tienda sigue por el Worker, porque un archivo fijo no recibe POST y las
  acciones del servidor (total de la pantalla de pago, formularios) lo usan. En `/v/a` (tienda de hoy) el boletín y
  «Escribir reseña» no responden en esta copia.
- **Videos por partes (18-nov-2026):** los archivos fijos de Cloudflare siempre mandan el video completo y Safari del
  iPhone exige pedazos (206). `cloudflare/worker.js` es la entrada del Worker: atiende `/media/videos/*`
  («run_worker_first») y lo demás lo pasa a OpenNext. Medido con `wrangler tail`: 1 a 7 ms de procesador por pedido
  (límite del plan gratis: 10 ms). Desde el 21-nov-2026 el pedazo se manda mientras se lee (antes esperaba los 6 MB
  completos en cada pedazo): necesita el peso de cada video, `cloudflare/tamanos-videos.json`, que
  `publicar-prueba.mjs` vuelve a escribir al publicar (un video nuevo en `public/media/videos/` entra solo; si no está
  en la lista, el Worker hace lo de antes).
- **Aviso de seguridad de Next.js:** si la construcción se detiene con «SecurityFatalError», `publicar-prueba.mjs`
  reintenta una vez (Next deja seguir así) y lo dice en pantalla. La actualización de Next la decide el dueño.
- **Medir cada cambio:** el peso sale al publicar (límite 3 MB comprimido) y `node herramientas/medir-fluidez.mjs`
  mide la fluidez en celular.
- **Vista en celular de la lista /v:** `node herramientas/capturar-versiones.mjs [dirección]` vuelve a tomar la primera
  pantalla de cada portada (`public/media/versiones/`).

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
