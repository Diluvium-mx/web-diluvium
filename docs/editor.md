# Editor de la página (solo en esta Mac)

20-nov-2026 · rehecho el 21-nov como «directo en la página» (opción B que eligió el dueño). Para cambiar fotos y
textos de B1 sin pedirlos uno por uno. **No se sube a Cloudflare** (no gasta nada
del plan): vive en esta Mac, igual que el administrador.

## Cómo abrirlo
- **Lo más fácil:** doble clic en **«Abrir editor.command»** (en la carpeta del proyecto; se puede arrastrar al Dock o
  al Escritorio). Enciende el editor y lo abre en Google Chrome. **Deja abierta esa ventana de Terminal** mientras lo
  usas: si la cierras, el editor se apaga y Chrome dice «localhost rechazó la conexión».
- A mano: en la Terminal, dentro de la carpeta del proyecto, `npm run dev`, y en Chrome `http://localhost:3100/editor`.
- Con el editor encendido también se ven las versiones en Chrome: `http://localhost:3100/v` (lista),
  `http://localhost:3100/v/b1` (portada) y `http://localhost:3100/v/b1/products/compuerta-anti-inundaciones` (producto).

Desde otra computadora o celular de la casa **no abre** (a propósito): solo funciona en esta Mac.

## Qué se puede hacer
Arriba: **Portada / Producto** de B1 (un punto • avisa que hay cambios sin guardar) y **Fotos / Mapa / Textos** (en ese
orden, pedido del dueño el 21-nov-2026). Las tres pestañas usan **la misma página de en medio**: cambiar de pestaña no
la vuelve a cargar.

**Los botones y enlaces de la página funcionan como en la real**, en las tres pestañas: el carrito se abre, «¿Cómo
medir?» abre su ventana y un enlace lleva a su página (por ejemplo, Producto 80 lleva a la compuerta hecha a la
medida). Si un enlace lleva a la otra página de B1 (Portada ↔ Producto), la pestaña de arriba cambia sola. Si lleva a
otra página (la de A, la hecha a la medida…), sale un aviso amarillo «Estás viendo otra página» con **«← Volver»**;
ahí no hay fotos ni números que editar.

### Fotos (directo en la página)
1. Toca cualquier foto o video de la página de en medio (galería, antes y después, portada, reseñas, comparación,
   beneficios, pasos). Se marca con un **marco rojo**. Los botones chicos encima de una foto (flechas de la galería, la
   línea del antes y después) siguen funcionando; el botón que cubre todo el video, en cambio, elige el video.
2. **Arrastra la foto dentro del marco** hasta que quede bien acomodada; **«Acercar»** la agranda. Se ve al momento.
   **«Alejar»** deja ver más de la foto; si ya se ve completa (una foto cuadrada en un marco cuadrado, la tabla de Mini,
   las fotos de los artículos), la achica dentro de su marco (hasta 80 %) y el espacio alrededor toma el color de su
   orilla si es claro (blanco en las fotos de producto).
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
   - **Blog (24-nov-2026):** la foto de cada tarjeta se cambia en la pestaña **Blog**; la foto de arriba de cada
     artículo y las de dentro de su texto, en **Artículo** (para ir a otro artículo, toca su título en el Blog o en
     «Sigue leyendo»: el editor se queda en la pestaña Artículo). Son independientes: cambiar la foto del artículo no
     cambia la de su tarjeta. «Sigue leyendo» muestra la foto de arriba de cada artículo. Estas fotos se cambian o
     acomodan, no se quitan ni se agregan.
   - **Logos:** el de arriba y el de abajo se cambian en **Portada** (y en **Producto**, que tiene los suyos); las demás
     páginas usan los de la Portada. También se cambian ahí los de «Visto en» y «Encuéntranos en», y en cada producto
     los de Mercado Libre y Amazon.
   - Lo que todavía no se cambia en el editor: la ventana «¿Cómo medir?» (su video, la foto de la puerta y la tabla de
     tamaños son los mismos en todas las páginas) y las miniaturas de la galería, que repiten la foto grande.
4. **Listo** (o doble clic en el marco) suelta la foto. Se puede bajar la página y deslizar la galería como siempre:
   el marco sigue a la foto.

Los acomodos y las fotos cambiadas se ven al momento; las fotos agregadas, quitadas o movidas, al guardar.

### Textos
Cada parte con su nombre del mapa y el título que se ve en la página («B1-P6 · «Antes de comprar»»), y **todos sus
textos** para escribirlos ahí mismo (los que llevan formato aceptan `<p>`, `<strong>`, `<a href="…">`). Se ven en la
página de la derecha al guardar. Desde el 21-nov-2026 también los que estaban fijos en el código: la ventana «¿Cómo
medir?» (títulos, botones y pasos), la tabla de tamaños, el resultado de la medida, «Ahorras», «Agotado», la pista del
antes y después, las reseñas («Ver más», el contador y la reseña en grande), la caja de preguntas, el carrito, el
menú y el pie. En algunos van datos que se llenan solos: {n} y {total} (reseñas), {tamano} y {medidas} (resultado de
la medida), además de {precio}, {calificacion}, etc.
- **Formato (23-nov-2026):** cada texto trae una barrita: **Negrita** (se guarda como `**así**`), **Naranja**
  (`==así==`, el naranja de la marca, como las palabras resaltadas de la tienda de hoy) y **Salto de línea**. En la
  caja, Enter o Shift+Enter también hacen otro renglón y ⌘B pone negrita. Debajo se ve «Así se ve». Los enlaces,
  direcciones y textos alternativos de fotos no llevan formato. La página lo pinta con `formato()`
  (`src/components/secciones/landing/formato.tsx`); un texto sin marcas se ve igual que siempre. Las respuestas que da la caja de preguntas (el banco, que trae la
guía de Angela) todavía viven en el código: `src/components/secciones/landing/preguntas-banco.ts`.

### Mapa (números de cada elemento)
La pestaña **Mapa** (entre Fotos y Textos) muestra la página con un **número sobre cada elemento** (títulos, textos,
botones, enlaces, tamaños, campos, fotos, videos, íconos, tablas) y la tabla con el número, qué es, en qué parte está y
qué dice. Para pedir un cambio: **«Producto 37: …»** o **«Portada 21: …»**. «Copiar» copia el número con su nombre.
- Sale al instante: los números guardados se piden al abrir el editor y la página ya está cargada.
- **Ventanas:** si abres una ventana en la página (el carrito, «¿Cómo medir?», el menú), solo se ven los números de esa
  ventana, en la página y en la tabla. Al cerrarla vuelven los de la página.
- Lo que aparece al tocar (una ventana, los pasos clave, lo que hay en el carrito, un aviso) toma número solo, sin
  botón de «Volver a leer».
- Los números de lo que pasa por debajo del encabezado fijo no se encimen en el encabezado.
- Las reseñas que aparecen con «Ver más» (B1-P3) no llevan número (serían cientos): solo las 6 elegidas de la sección,
  el botón «Ver más» y la reseña en grande. En el código: `data-sin-numero` deja fuera del mapa a un elemento y todo lo
  que tiene adentro.
- Los números **no cambian**: al cambiar un texto o mover fotos, cada elemento conserva su número. Lo nuevo toma el
  siguiente número libre y un número quitado no se vuelve a usar (como en el mapa del CRM).

- La página de en medio se ve sin la barra de desplazamiento de la computadora (como en un teléfono): Chrome la ponía a
  la derecha, tapaba la orilla de las olas y hacía ver la página 15 px más angosta.

### Guardar y publicar
- **Importante: nada queda hasta presionar «Guardar».** Si cierras o recargas el editor sin guardar, los ajustes se
  pierden (el navegador avisa antes de cerrar).
- **Guardar** escribe los cambios en la página y en el administrador al mismo tiempo y deja una copia de la versión
  anterior en `.editor-respaldos/` (fuera de git), por si hay que regresar. Solo aplica lo que cambiaste en el editor:
  si mientras lo tenías abierto se cambió algo de la página desde el código, eso no se pierde al guardar.
- **Publicar en la prueba publica lo guardado**: primero «Guardar» (si hay cambios sin guardar, el botón lo avisa).
- **Descartar cambios** regresa a lo último guardado.
- **Publicar en la prueba** sube la copia de prueba a Cloudflare (unos minutos) y dice el peso (límite 3 MB).

### Propuestas
`http://localhost:3100/editor/propuestas`: diseños para elegir antes de ponerlos en la página, a tamaño de celular.
Ahora (21-nov-2026, segunda tanda): 6 barras de avance para el video de «¿Cómo medir?» (214/215) y 4 cajas de preguntas
para el final de B1-P6, todas para probar ahí mismo. Ya elegidos y puestos: pasos clave A, botones 217/224 (diseño 1)
y carrito 2 (hoja desde abajo con ×).
- Un módulo con «use client» solo puede pasarle componentes a la página del servidor, no listas: los nombres y textos
  de cada propuesta van en `page.tsx`.

## Cómo está hecho (para Claude)
- Página: `src/app/(editor)/editor/` (`page.tsx`, `Editor.tsx`) con su propio diseño raíz.
- Una sola página de en medio (`<iframe>`) para las tres pestañas; `carga` solo cambia (y la recarga) al elegir
  Portada/Producto, al guardar o al descartar. `revisarDireccion` (al cargar y cada 0.7 s, por los enlaces que no
  recargan) cambia la pestaña si la página es la otra de B1 o muestra el aviso «Estás viendo otra página».
- En Fotos, un toque elige la foto que está debajo salvo que sea un control chico encima (menos del 60 % de la foto) o
  un control que no la cubre; los enlaces no se detienen (`CONTROLES` en `Editor.tsx`).
- Guardar: `api/guardar` revisa la forma (mismas secciones, piezas de tipos permitidos, valores simples), escribe
  `contenido/tema/<archivo>.json` con respaldo y corre `npm run admin:agregar-plantillas -- --reemplazar=<archivo>`.
  El editor manda también `base` (la plantilla que tenía al abrirse o al último guardado) y `combinarConBase`
  (`src/lib/editor/archivos.ts`) aplica sobre el archivo solo lo que el editor cambió (clave por clave; si agregó,
  quitó o movió piezas, manda su orden). Así un editor abierto desde antes no regresa cambios hechos en el código.
- Subir: `api/subir` (tipo y peso revisados, nombre limpio) y vuelve a medir las fotos (`medidas-imagenes.mjs`).
- Publicar: `api/publicar` lanza `herramientas/publicar-prueba.mjs --publicar` aparte y responde cómo va
  (bitácora en `$TMPDIR/diluvium-editor-publicar.log`). El script construye con un entorno limpio: lanzado desde
  `npm run dev` heredaba `TURBOPACK=1` y `NODE_ENV=development`, y `next build --webpack` se negaba («Multiple bundler
  flags set»; arreglado el 21-nov-2026).
- Seguridad (`src/lib/editor/guardia.ts`): solo con `npm run dev`, solo con dirección `localhost` y los cambios solo
  desde la misma página (Origin). En producción responde 404 y `publicar-prueba.mjs` lo quita de la copia.
- Textos: cada pieza lee los suyos con `tx(ajustes, clave, porDefecto)` (`landing/datos.ts`); los valores de siempre
  están en `landing/textos.ts` (archivo común: las piezas del servidor y las del teléfono los usan) y sus nombres en
  español en `herramientas/esquema-secciones.py` (FIJAS). Clave nueva en la plantilla → `npm run admin:esquema`,
  `npm run admin:generar` y `npm run admin:agregar-plantillas -- --reemplazar=<archivo>`.
- Mapa de elementos: `src/lib/elementos.ts` (`escanear`) lee la página y arma la firma de cada elemento: sección |
  pieza (`data-pieza`, en las piezas que se repiten) | tipo@camino (su lugar exacto dentro de la pieza, p. ej.
  `Texto@div2>p1`). Las fotos van por su campo (`data-editar`) y `data-el` fija la firma a mano. La firma no depende
  del texto, y quitar un elemento no mueve a los demás.
- `MapaElementos.tsx` pone sus números en la capa encima de la página (portal) y usa el `<iframe>` del editor.
  `GET api/elementos?archivo=` da los números guardados (se piden al abrir el editor); la pestaña lee la página al
  instante y solo hace `POST` si hay firmas nuevas o nombres cambiados. Un `MutationObserver` (hijos y atributo
  `open`) vuelve a leer 0.25 s después de cada cambio. Con una ventana abierta (`dialog[open]` o
  `[role=dialog][aria-modal=true]` visible) solo se ven sus elementos.
- `api/elementos` decide el número: misma firma → mismo número; firma nueva pero en la misma parte y pieza
  desapareció uno con el mismo texto → hereda su número (así sobreviven a cambios de código); si no, el siguiente
  libre. Un número quitado queda apartado. Todo en `contenido/mapa-elementos.json`. Para ubicar «Producto 37»:
  buscar `"n": 37` en `product.b1`. **Al rehacer una pieza, abrir la pestaña Mapa y comparar que los números sigan
  en su lugar** (si cambió el texto y la firma a la vez, devolver el número a mano en ese archivo).
- Las páginas que se editan están en `PAGINAS_MAPA` (`src/lib/mapa.ts`). Para C1 y D1: agregarlas ahí.
  Una plantilla para varias direcciones (los artículos del blog: `article.b1`) va en `PREFIJOS` y `archivoDeRuta` la
  reconoce; `recargar` vuelve a cargar la misma dirección si es de esa pestaña.
- Fotos del blog (24-nov-2026): piezas `article_card` en `blog.b1` y `article_photos` en `article.b1`, con el nombre
  (slug) del artículo como id; en `article_photos`, `image` es la de arriba e `image_1`, `image_2`… las del texto en
  orden (`fotosDelCuerpo` en `ArticuloVersion.tsx` les pone foto, encuadre, marca y un `<picture>` que recorta). No se
  quitan, agregan ni mueven (`PIEZAS_FIJAS` en `Editor.tsx`). Artículo nuevo en el blog → agregarle sus dos piezas.
- Fotos nítidas (24-nov-2026, Contacto 5 borrosa): `src/components/FotosNitidas.tsx` mide qué tan ancha se ve cada
  foto (forma del marco con `object-cover` y acercamiento) y, si es bastante más que su marco, cambia su `sizes` para
  que el navegador baje una copia de ese tamaño. Va en `MarcoVersionB` junto a `AlejarFotos`.
- Muro de reseñas de un solo producto (XXL): ajuste `product_filter` de `landing-resenas` con la dirección del
  producto; {calificacion} y {total} del título salen de esas reseñas.
- Pasos clave con la tabla como foto (Mini): ajuste `table_image` de `landing-pasos` (sale en el paso 2 y en «Ver tabla
  de medidas», y se cambia en el editor); `producto` hace que tamaños y precio sean los de ese producto. Los muros de
  reseñas no muestran las de 1 estrella (`MINIMO_ESTRELLAS` en `Resenas.tsx`).
- Computadora (24-nov-2026): `.marco-version` va en `@layer components` para que las clases de cada parte (por
  ejemplo `max-w-[50rem]` del artículo) le ganen; y en `versiones.css` todos los cortes van en px (`sm` venía en rem y
  sus reglas quedaban después de las de `lg`). Lo de computadora va con `lg:`; para revisar que el celular no se movió:
  comparar lugar y tamaño de cada elemento a 390 px antes y después.
- Un editor abierto desde antes de que se agregara una parte: esa parte no se atenúa como «quitada»; al tocarla pide
  volver a cargar, y guardar no se niega por las secciones nuevas (se quedan como están en el archivo).
- Encabezado y pie que una página toma de la portada (`MarcoVersionB`): van dentro de `data-prestada` y el editor no
  deja tocar sus fotos (su marca es de otra plantilla). Los marcos nuevos alrededor de una foto van como `<picture>`
  cuando hay `<span>` al lado, para no mover los números del mapa de esos textos.
- Cada foto de la página lleva `data-editar="sección|pieza|campo"` (`marcaEditar` en `src/lib/mapa.ts`): así el
  editor sabe qué campo tocaste. El encuadre se guarda como `focal` («x% y%») y el acercamiento como `zoom` (1 a 3);
  para `image_before` son `focal_before` / `zoom_before`, para `video` son `focal_video` / `zoom_video`
  (`clavesEncuadre`). Los aplica `estiloFoto` en la galería, el antes y después, la portada, beneficios, pasos,
  comparación y reseñas; el marco de cada foto lleva `overflow-hidden` para que lo acercado no se salga.
- La galería de B1 vive en la plantilla (piezas `image`/`video` de la ficha, `include_product_media: false`).
