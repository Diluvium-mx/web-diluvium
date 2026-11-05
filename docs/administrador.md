# Administrador (paso 2)

5-nov-2026 · Estado: **funciona en esta Mac**. Falta publicarlo, que necesita la base de datos del hosting (cuenta del
dueño).

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

## Comandos
| Para qué | Comando |
|---|---|
| Cargar todo el contenido actual al administrador (base vacía) | `npm run admin:sembrar` |
| Borrar la base local y cargar todo de nuevo | `npm run admin:sembrar -- --desde-cero` |
| Pasar lo del administrador a `contenido/` | `npm run admin:exportar` |
| Exportar a otra carpeta (para comparar) | `npm run admin:exportar -- --en <carpeta>` |
| Volver a generar campos si cambian las secciones del tema | `npm run admin:esquema` y después `npm run admin:generar` |
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
- Local y fuera del repositorio: `datos/admin.db` (la base) y `public/media/admin/` (copias de las fotos para el
  administrador). Se regeneran con `npm run admin:sembrar -- --desde-cero`.

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
- Dependencias: Payload 3.92.1 (la 3.93 tenía 1 día; regla de una semana), sharp 0.35.5 (corrige una falla alta de la
  0.35.4), DOMPurify forzado a 3.4.17 (el editor de código del administrador traía la 3.4.15, con una falla crítica).
  El editor de texto con formato (Lexical) no se instaló porque trae `happy-dom` con fallas altas. Quedan avisos
  bajos y moderados de herramientas internas (`npm audit`).

## Lo que falta
1. **Publicar** (necesita al dueño):
   - base de datos del hosting (Neon/Postgres, o Turso, que usa el mismo formato que esta Mac);
   - almacenamiento de fotos (Vercel Blob);
   - construcción automática al guardar.
2. **Texto con formato** cómodo: hoy las descripciones se editan como HTML (`<p>`, `<strong>`). El editor visual se
   agrega cuando Payload traiga la versión sin fallas.
3. **Vista previa** de la página mientras se edita.
4. Pedidos, clientes y correos: paso 3.
