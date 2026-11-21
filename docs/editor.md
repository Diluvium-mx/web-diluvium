# Editor de la página (solo en esta Mac)

20-nov-2026 · rehecho el 21-nov como «directo en la página» (opción B que eligió el dueño). Para cambiar fotos y
textos de B1 sin pedirlos uno por uno. **No se sube a Cloudflare** (no gasta nada
del plan): vive en esta Mac, igual que el administrador.

## Cómo abrirlo
1. En la Terminal, dentro de la carpeta del proyecto: `npm run dev`.
2. En el navegador de esta Mac: `http://localhost:3100/editor`.

Desde otra computadora o celular de la casa **no abre** (a propósito): solo funciona en esta Mac.

## Qué se puede hacer
Arriba: **Portada / Producto** de B1 (un punto • avisa que hay cambios sin guardar) y **Fotos / Textos**.

### Fotos (directo en la página)
1. Toca cualquier foto o video de la página de en medio (galería, antes y después, portada, reseñas, comparación,
   beneficios, pasos). Se marca con un **marco rojo**.
2. **Arrastra la foto dentro del marco** hasta que quede bien acomodada; **«Acercar»** la agranda. Se ve al momento.
3. Sus botones:
   - **Cambiar foto / Cambiar video:** biblioteca con todo lo que ya tiene la página, o **«Subir desde la
     computadora»** (JPG, PNG o WebP de hasta 8 MB; MP4 de hasta 24 MB). Lo que se sube queda en
     `public/media/editor/` y es **público**: nada de datos de clientes. En el muro de reseñas solo se pueden elegir
     fotos de reseñas publicadas.
   - **Centrar:** regresa la foto al centro y sin acercar.
   - **+ Agregar otra:** pone otra foto justo después (en la galería, otra foto; en beneficios o pasos, otra pieza
     igual con esa foto, para luego cambiar su texto en Textos).
   - **Quitar** y **◀ Antes / Después ▶** (mover de lugar).
   - Las fotos fijas del diseño (por ejemplo, la comparación) se pueden cambiar o acomodar, pero no quitar.
4. **Listo** (o doble clic en el marco) suelta la foto. Se puede bajar la página y deslizar la galería como siempre:
   el marco sigue a la foto.

Los acomodos y las fotos cambiadas se ven al momento; las fotos agregadas, quitadas o movidas, al guardar.

### Textos
Cada parte con su nombre del mapa y sus textos para escribirlos ahí mismo (los que llevan formato aceptan `<p>`,
`<strong>`, `<a href="…">`). Se ven en la página de la derecha al guardar.

### Mapa (números de cada elemento)
La pestaña **Mapa** (a la derecha de Textos) muestra la página con un **número sobre cada elemento** (títulos, textos,
botones, enlaces, tamaños, campos, fotos, videos, íconos) y la tabla con el número, qué es, en qué parte está y qué
dice. Para pedir un cambio: **«Producto 37: …»** o **«Portada 21: …»**. «Copiar» copia el número con su nombre.
- Los números **no cambian**: al cambiar un texto o mover fotos, cada elemento conserva su número. Lo nuevo toma el
  siguiente número libre y un número quitado no se vuelve a usar (como en el mapa del CRM).
- El menú, el carrito y la guía de tamaños también llevan número; si los abres en la página, «Volver a leer» numera
  lo que aparezca.

### Guardar y publicar
- **Importante: nada queda hasta presionar «Guardar».** Si cierras o recargas el editor sin guardar, los ajustes se
  pierden (el navegador avisa antes de cerrar).
- **Guardar** escribe los cambios en la página y en el administrador al mismo tiempo y deja una copia de la versión
  anterior en `.editor-respaldos/` (fuera de git), por si hay que regresar.
- **Descartar cambios** regresa a lo último guardado.
- **Publicar en la prueba** sube la copia de prueba a Cloudflare (unos minutos) y dice el peso (límite 3 MB).

## Cómo está hecho (para Claude)
- Página: `src/app/(editor)/editor/` (`page.tsx`, `Editor.tsx`) con su propio diseño raíz.
- Guardar: `api/guardar` revisa la forma (mismas secciones, piezas de tipos permitidos, valores simples), escribe
  `contenido/tema/<archivo>.json` con respaldo y corre `npm run admin:agregar-plantillas -- --reemplazar=<archivo>`.
- Subir: `api/subir` (tipo y peso revisados, nombre limpio) y vuelve a medir las fotos (`medidas-imagenes.mjs`).
- Publicar: `api/publicar` lanza `herramientas/publicar-prueba.mjs --publicar` aparte y responde cómo va.
- Seguridad (`src/lib/editor/guardia.ts`): solo con `npm run dev`, solo con dirección `localhost` y los cambios solo
  desde la misma página (Origin). En producción responde 404 y `publicar-prueba.mjs` lo quita de la copia.
- Mapa de elementos: `src/lib/elementos.ts` (`escanear`) lee la página y arma la firma de cada elemento: sección |
  pieza (`data-pieza`, en las piezas que se repiten) | tipo@camino (su lugar exacto dentro de la pieza, p. ej.
  `Texto@div2>p1`). Las fotos van por su campo (`data-editar`) y `data-el` fija la firma a mano. La firma no depende
  del texto, y quitar un elemento no mueve a los demás.
- `api/elementos` decide el número: misma firma → mismo número; firma nueva pero en la misma parte y pieza
  desapareció uno con el mismo texto → hereda su número (así sobreviven a cambios de código); si no, el siguiente
  libre. Un número quitado queda apartado. Todo en `contenido/mapa-elementos.json`. Para ubicar «Producto 37»:
  buscar `"n": 37` en `product.b1`. **Al rehacer una pieza, abrir la pestaña Mapa y comparar que los números sigan
  en su lugar** (si cambió el texto y la firma a la vez, devolver el número a mano en ese archivo).
- Las páginas que se editan están en `PAGINAS_MAPA` (`src/lib/mapa.ts`). Para C1 y D1: agregarlas ahí.
- Cada foto de la página lleva `data-editar="sección|pieza|campo"` (`marcaEditar` en `src/lib/mapa.ts`): así el
  editor sabe qué campo tocaste. El encuadre se guarda como `focal` («x% y%») y el acercamiento como `zoom` (1 a 3);
  para `image_before` son `focal_before` / `zoom_before`, para `video` son `focal_video` / `zoom_video`
  (`clavesEncuadre`). Los aplica `estiloFoto` en la galería, el antes y después, la portada, beneficios, pasos,
  comparación y reseñas; el marco de cada foto lleva `overflow-hidden` para que lo acercado no se salga.
- La galería de B1 vive en la plantilla (piezas `image`/`video` de la ficha, `include_product_media: false`).
