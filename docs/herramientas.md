# Herramientas de la réplica

Todo corre en esta Mac con Chrome sin ventana (sin dependencias nuevas) e ImageMagick (`magick`, ya instalado).
Los comandos se corren desde la raíz del proyecto.

| Para qué | Comando | Sale en |
|---|---|---|
| Fichas de cada página del tema (secciones, textos, medios) | `python3 -I herramientas/extraer-tema.py` | `docs/sitio-actual/paginas/`, `diseno.md`, `medios.md` |
| Contenido del tema como datos para la página | `npm run contenido` | `contenido/tema/*.json` |
| Videos del tema → archivo real | (a mano, ver `herramientas/videos-tema.json`) | `herramientas/videos-tema.json` |
| Fotos y videos de la tienda | `npm run medios` | `public/media/…`, `herramientas/mapa-medios.json` |
| Catálogo de productos (fichas públicas) | `node herramientas/catalogo.mjs` | `contenido/productos.json` |
| Textos de páginas y políticas (del HTML capturado) | `python3 -I herramientas/extraer-paginas.py` | `contenido/paginas.json`, `contenido/politicas.json` |
| Artículos del blog | `python3 -I herramientas/extraer-articulos.py` | `contenido/blog.json` |
| Reseñas publicadas (Trustoo) | `python3 -I herramientas/extraer-resenas-blog.py` | `contenido/resenas.json`, `public/media/resenas/` |
| Colecciones · respuestas del buscador | `python3 -I herramientas/extraer-colecciones.py` · `extraer-busquedas.py` | `contenido/colecciones.json` · `contenido/busquedas.json` |
| Capturas de página completa del sitio en vivo | `node herramientas/capturar-sitio.mjs <carpeta> [paginas] [vistas]` | `docs/sitio-actual/capturas/<fecha>/` |
| Medidas reales (letras, tamaños, colores, posiciones) | `node herramientas/medir-estilos.mjs <url> <nombre> [vistas]` | `docs/sitio-actual/medidas/<nombre>-<vista>.json` |
| Ver en corto una sección (y su recorte) | `python3 -I herramientas/ver-seccion.py <pagina> <indices> [vistas] [carpeta]` | pantalla + recortes |
| Correr JavaScript en una página (en vivo o réplica) | `node herramientas/inspeccionar.mjs <url> <vista> '<expresión>'` | pantalla |
| Lo que leen Google y las redes (título, descripción, fichas) | `python3 -I herramientas/extraer-seo.py` | `contenido/seo.json` |
| Comparar eso mismo contra el sitio en vivo | `node herramientas/comparar-seo.mjs [paginas]` | pantalla |
| **Comparar la réplica contra el sitio en vivo** | `npm run comparar -- <pagina> <ruta> [vistas] [indices]` | `comparaciones/` |
| Capturas y medidas del carrito **con productos** en vivo (agrega como visitante, sin analítica) | `node herramientas/capturar-carrito.mjs [vistas]` | `docs/sitio-actual/capturas/2026-11-04/`, `docs/sitio-actual/medidas/carrito-*` |
| Comparar el carrito lateral y /cart con productos | `node herramientas/comparar-carrito.mjs [vistas]` | `comparaciones/carrito/` |
| Capturas y medidas de la pantalla de pago en vivo (solo mira; no escribe datos ni paga) | `node herramientas/capturar-pago.mjs [vistas]` | `docs/sitio-actual/capturas/2026-11-06/`, `docs/sitio-actual/medidas/pago-*` |
| Comparar /checkout (tarjeta, PayPal, Mercado Pago, resumen abierto) | `node herramientas/comparar-pago.mjs [vistas] [estados]` | `comparaciones/pago/` |

Vistas: `celular` (390 px), `tableta` (768 px), `compu` (1440 px).

## Scripts que hacen algo en el sitio en vivo

Si un script hace algo más que mirar (por ejemplo, agregar al carrito), abre las páginas con
`abrirPagina(url, vista, { bloquear: BLOQUEAR_ANALITICA })` (`herramientas/cdp.mjs`): bloquea analítica, píxeles de
anuncios y telemetría también dentro de iframes y trabajadores, para no ensuciar las métricas de la tienda. Nunca
iniciar sesión, ir al pago ni enviar formularios.

## Cómo se lee la comparación

- Empareja las secciones en orden (las del sitio en vivo contra las `data-seccion` de la réplica).
- Por sección dice el % de píxeles distintos (tolerancia de color 12 %) y el alto en vivo contra el de la réplica.
- En `comparaciones/<pagina>-<vista>/<n>.jpg` queda la imagen lado a lado: izquierda en vivo, derecha réplica.
- Meta por sección: alto igual (±4 px) y ≤ 2 %. Lo que se mueve solo (franjas, carruseles) se revisa a ojo.
- `COMPARAR_SALIDA=comparaciones/<nombre>` separa la salida cuando trabajan varios a la vez.
- `comparaciones/` no va al repositorio (se regenera).

## Reglas para construir una sección

1. Cada tipo de sección del tema es un archivo en `src/components/secciones/` (ya registrado en `registro.tsx`).
2. El elemento de afuera lleva `data-seccion="<tipo del tema>"`; nada adentro lo lleva.
3. Textos, fotos y enlaces salen de `contenido/`; los estilos, de las medidas (nunca del código del tema Shine).
4. Si en el sitio en vivo algo se esconde en una vista, en la réplica también (para que el orden cuadre).
