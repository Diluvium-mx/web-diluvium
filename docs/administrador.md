# Administrador (paso 2)

5-nov-2026 · Estado: **funciona en esta Mac, ya armado para Cloudflare** (probado con el motor de Cloudflare en esta
Mac, rama `cloudflare`). Falta publicarlo, que necesita la cuenta de Cloudflare del dueño.

## Qué es
Un panel en `/admin` (Payload 3.92.1, en español) para editar la página sin código, como el editor de Shopify:

| Grupo | Qué se edita |
|---|---|
| **Tienda** | Productos (nombre, descripción, tamaños, precios, precio tachado, **piezas en existencia**, código de barras, fotos y videos de la galería), Reseñas (estrellas, texto, fotos, producto, publicada sí/no), Colecciones (productos y orden), Carrusel de reseñas de la portada |
| **Diseño de páginas** | Plantillas: las secciones de cada página en orden (25 plantillas, 39 tipos de sección, 69 tipos de pieza), con sus textos, fotos, botones y enlaces. Lo de forma (alineación, márgenes, colores) va en «Diseño», plegado. Ajustes generales del tema |
| **Contenido** | Páginas, Políticas, Blog, Menús, Fotos y videos |
| **Google** | Fichas para Google de cada página (título, descripción, imagen al compartir) y los datos fijos de la empresa |

## Cómo llega a la página
La página **no lee la base de datos** cuando alguien la visita. El administrador guarda todo en su base y el
**exportador** lo escribe en los mismos archivos de siempre (`contenido/*.json`). La página se construye con esos archivos.
Así sigue igual de rápida y segura, y queda **idéntica** (se comprobó: cargar todo y exportarlo da los mismos 34 archivos,
byte por byte).

```
Administrador (/admin) → base de datos → exportar → contenido/*.json → construir la página
```

- **En esta Mac:** se edita en `http://localhost:3100/admin`; `npm run admin:exportar` pasa los cambios a la página.
- **Al publicar (pendiente):** cada cambio guardado lanza una construcción nueva en el hosting (1–2 minutos), que
  primero exporta. Las fotos que se suban irán al almacenamiento del hosting, no a esta Mac.

## Cloudflare (dónde vive)
Página y administrador corren en **Cloudflare Workers** (plan de pago, USD 5/mes) con OpenNext, igual que la plantilla
oficial de Payload para Cloudflare (`templates/with-cloudflare-d1`, versión 3.92):

- **Base del administrador:** D1 (SQLite).
  - Las tablas se crean con migraciones (`src/migrations`), porque D1 no deja que Payload las copie solo.
  - Las secciones de las plantillas se guardan como JSON (`blocksAsJSON`), porque D1 no admite consultas de más de
    100 columnas.
- **Fotos subidas:** R2. Sin recortes en el administrador, porque Cloudflare no tiene `sharp`.
- **Fotos de la página:** las optimiza Cloudflare Images (5,000 transformaciones únicas gratis al mes).
- **En esta Mac:** wrangler guarda copias locales de D1 y R2 en `.wrangler/` (fuera del repositorio). Con
  `CLOUDFLARE_REMOTO=1` los scripts usan las de la cuenta.
- **Lo que cambió en el código para Cloudflare:**
  - los tamaños de las fotos se calculan al construir (`herramientas/medidas-imagenes.mjs` →
    `contenido/medidas-imagenes.json`), porque en Cloudflare no se pueden leer archivos al momento de la visita;
  - la construcción usa webpack (`next build --webpack`), como la plantilla;
  - un tipo en la fecha de entrega.

  Las piezas de la página no cambiaron.
- **Prueba (5-nov-2026):**
  - el paquete pesa 3.7 MB comprimido (el límite del plan de pago es 10 MB);
  - las 15 vistas comparadas contra el sitio en vivo quedaron en meta, y lo de Google, 34 de 34;
  - la API sin sesión da 403;
  - la carga y la exportación con D1 dan los mismos 34 archivos, byte por byte.

## Comandos
| Para qué | Comando |
|---|---|
| Crear o actualizar las tablas (migraciones) | `npm run admin:migrar` · nueva: `npm run admin:migrar -- --nueva <nombre>` |
| Armar la página para Cloudflare | `npm run cf:construir` |
| Correrla con el motor de Cloudflare en esta Mac (puerto 8788) | `npm run cf:local` |
| Cargar todo el contenido actual al administrador (base vacía) | `npm run admin:sembrar` |
| Borrar la base local y cargar todo de nuevo | `npm run admin:sembrar -- --desde-cero` |
| Pasar lo del administrador a `contenido/` | `npm run admin:exportar` |
| Exportar a otra carpeta (para comparar) | `npm run admin:exportar -- --en <carpeta>` |
| Volver a generar campos si cambian las secciones del tema | `npm run admin:esquema`, `npm run admin:generar` y una migración nueva |
| Generar el mapa del administrador y los tipos (después de cambiar colecciones) | `npm run admin:generar` |

Los comandos usan `tsx` directo: la herramienta `payload` choca con Node 26 (carga dos veces una pieza interna).

## Archivos
- `src/payload.config.ts`: configuración (base, idioma, colecciones). Sin GraphQL.
- `src/payload/colecciones.ts` y `globales.ts`: qué se edita y cómo se llama cada campo.
- `src/payload/esquema-secciones.json`: campos de cada tipo de sección. Lo genera `herramientas/esquema-secciones.py`
  a partir de los datos (no del código del tema Shine), con nombres en español.
- `src/payload/secciones.ts`: arma los bloques del administrador con ese esquema.
- `src/payload/scripts/`: `sembrar.ts` (cargar), `exportar.ts` (escribir), `generar.ts` (mapa y tipos).
- `src/app/(payload)/`: rutas del administrador (copiadas de la plantilla oficial de Payload). La tienda vive en
  `src/app/(sitio)/`, y la página 404 general en `src/app/global-not-found.tsx`.
- `wrangler.jsonc`, `open-next.config.ts` y `cloudflare-env.d.ts`: configuración de Cloudflare. `.dev.vars` (fuera
  del repositorio) lleva la llave del Worker en esta Mac.
- **Diseño del administrador = el del CRM** (`crm-diluvium › app/globals.css`), en `src/app/(payload)/custom.scss` y
  `src/payload/componentes/`:
  - mismos colores y letra Helvetica, en claro y oscuro;
  - barra lateral azul con degradado e íconos que hacen su gesto al pasar el mouse (`IconosMenu.tsx`);
  - barra de arriba azul con el correo y la píldora de sol y luna, cuyo cambio de tema se extiende en círculo
    (`BarraSuperior.tsx`);
  - luz que sigue al cursor y pulsación al presionar (`BrilloCursor.tsx`);
  - «Guardar» en naranja;
  - inicio con números reales (productos, piezas, inventario por revisar, reseñas y páginas; `Bienvenida.tsx`).

  La pantalla de entrada no cambió; solo ganó el ojito para ver la contraseña (`OjoContrasena.tsx`).
- Local y fuera del repositorio: `.wrangler/` (copias locales de D1 y R2). Se regeneran con
  `npm run admin:sembrar -- --desde-cero`. La base anterior (`datos/admin.db`) queda solo como respaldo.

## Lo que pasó de código a datos (ahora se edita)
Las piezas en existencia, los códigos de barras, los videos de la galería y el proveedor de cada producto estaban
escritos a mano en el código. Ahora están en `contenido/productos.json` y se editan en Productos.

## Seguridad
- La API (`/api/…`) solo responde con sesión iniciada: sin sesión, todo da 403 (comprobado).
- 5 intentos de entrada fallidos bloquean la cuenta 15 minutos.
- Llave de sesiones (`PAYLOAD_SECRET`) en `.env`, fuera del repositorio. Hay un `.env.example` sin valores.
- **Antes de publicar:**
  - crear el usuario del dueño en cuanto exista la base del hosting (mientras no hay usuarios, `/admin` deja crear el
    primero a quien llegue);
  - agregar la segunda verificación al entrar (2FA);
  - revisar con cyber-neo.
- Las alertas altas de `glob` vienen de la herramienta que arma el paquete para Cloudflare (OpenNext). Solo corren
  al construir, nunca en la página. Se revisan antes de publicar.
- Dependencias: Payload 3.92.1 (la 3.93 tenía 1 día; regla de una semana), (sharp ya no se usa: Cloudflare no lo tiene), DOMPurify forzado a 3.4.17 (el editor de código del administrador traía la 3.4.15, con una falla crítica).
  El editor de texto con formato (Lexical) no se instaló porque trae `happy-dom` con fallas altas. Quedan avisos
  bajos y moderados de herramientas internas (`npm audit`).

## Lo que falta
1. **Publicar** (necesita la cuenta de Cloudflare del dueño, con 2FA):
   - crear D1 y R2 y poner sus datos en `wrangler.jsonc`;
   - cargar el contenido;
   - construcción automática al guardar (GitHub Actions: migrar, exportar de D1, construir y subir);
   - Cloudflare Access en `/admin`;
   - pasar el DNS a Cloudflare.
2. **Texto con formato** cómodo: hoy las descripciones se editan como HTML (`<p>`, `<strong>`). El editor visual se
   agrega cuando Payload traiga la versión sin fallas.
3. **Vista previa** de la página mientras se edita.
4. Pedidos, clientes y correos: paso 3.
