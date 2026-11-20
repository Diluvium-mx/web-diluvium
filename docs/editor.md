# Editor de la página (solo en esta Mac)

20-nov-2026. Para cambiar fotos y textos de B1 sin pedirlos uno por uno. **No se sube a Cloudflare** (no gasta nada
del plan): vive en esta Mac, igual que el administrador.

## Cómo abrirlo
1. En la Terminal, dentro de la carpeta del proyecto: `npm run dev`.
2. En el navegador de esta Mac: `http://localhost:3100/editor`.

Desde otra computadora o celular de la casa **no abre** (a propósito): solo funciona en esta Mac.

## Qué se puede hacer
- **Pestañas Portada / Producto** de B1. Un punto (•) avisa que hay cambios sin guardar.
- Cada parte sale con su **nombre del mapa** (B1-P2…; ver `docs/mapa-pagina.md`). Tócala para ver:
  - **Textos:** se escriben ahí mismo. Los que llevan formato aceptan `<p>`, `<strong>`, `<a href="…">`.
  - **Fotos y videos:** «Cambiar foto» abre la biblioteca con todo lo que ya tiene la página; «Subir desde la
    computadora» agrega fotos (JPG, PNG o WebP de hasta 8 MB) o videos MP4 (hasta 24 MB). Lo que se sube queda en
    `public/media/editor/` y es **público**: nada de datos de clientes.
  - **Encuadre:** toca en la foto el punto importante (la compuerta, la cara del cliente) y ese punto nunca se corta
    en el celular. Al lado se ve cómo queda.
  - **Piezas** (fotos de la galería, reseñas, beneficios, pasos, preguntas…): arrástralas o usa ▲ ▼ para cambiar el
    orden; «Duplicar» hace otra igual para editarla; «Quitar» la saca; «+ Agregar foto» suma una foto a la galería.
  - **Diseño:** colores y tamaños, guardados aparte para no moverlos sin querer.
- **Guardar** escribe los cambios en la página y en el administrador al mismo tiempo (no se desacomodan entre sí) y
  deja una copia de la versión anterior en `.editor-respaldos/` (fuera de git), por si hay que regresar.
- **Descartar cambios** regresa a lo último guardado.
- **Vista de celular** (a la derecha, en pantallas anchas): la página tal como quedó guardada, con o sin mapa.
- **Publicar en la prueba** sube la copia de prueba a Cloudflare (unos minutos) y dice el peso (límite 3 MB).

## Cómo está hecho (para Claude)
- Página: `src/app/(editor)/editor/` (`page.tsx`, `Editor.tsx`) con su propio diseño raíz.
- Guardar: `api/guardar` revisa la forma (mismas secciones, piezas de tipos permitidos, valores simples), escribe
  `contenido/tema/<archivo>.json` con respaldo y corre `npm run admin:agregar-plantillas -- --reemplazar=<archivo>`.
- Subir: `api/subir` (tipo y peso revisados, nombre limpio) y vuelve a medir las fotos (`medidas-imagenes.mjs`).
- Publicar: `api/publicar` lanza `herramientas/publicar-prueba.mjs --publicar` aparte y responde cómo va.
- Seguridad (`src/lib/editor/guardia.ts`): solo con `npm run dev`, solo con dirección `localhost` y los cambios solo
  desde la misma página (Origin). En producción responde 404 y `publicar-prueba.mjs` lo quita de la copia.
- Las páginas que se editan están en `PAGINAS_MAPA` (`src/lib/mapa.ts`). Para C1 y D1: agregarlas ahí.
- La galería de B1 vive en la plantilla (piezas `image`/`video` de la ficha, `include_product_media: false`) para
  poder ordenarla y encuadrarla. El encuadre se guarda como `focal` («x% y%») y lo leen la galería, el antes y
  después y la foto de la portada.
