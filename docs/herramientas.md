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
| Capturas de página completa del sitio en vivo | `node herramientas/capturar-sitio.mjs <carpeta> [paginas] [vistas]` | `docs/sitio-actual/capturas/<fecha>/` |
| Medidas reales (letras, tamaños, colores, posiciones) | `node herramientas/medir-estilos.mjs <url> <nombre> [vistas]` | `docs/sitio-actual/medidas/<nombre>-<vista>.json` |
| Ver en corto una sección (y su recorte) | `python3 -I herramientas/ver-seccion.py <pagina> <indices> [vistas] [carpeta]` | pantalla + recortes |
| Correr JavaScript en una página (en vivo o réplica) | `node herramientas/inspeccionar.mjs <url> <vista> '<expresión>'` | pantalla |
| **Comparar la réplica contra el sitio en vivo** | `npm run comparar -- <pagina> <ruta> [vistas] [indices]` | `comparaciones/` |

Vistas: `celular` (390 px), `tableta` (768 px), `compu` (1440 px).

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
