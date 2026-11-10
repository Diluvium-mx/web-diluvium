# Web Diluvium — reglas para Claude

## Qué es
Rehacer **diluvium.com.mx** (hoy en Shopify Basic, tema Shine) como página propia: diseño, catálogo, carrito,
pago con tarjeta (mismo formulario de Mercado Pago con Meses que hoy), administrador para editar todo sin código,
mapa de calor (Clarity), píxeles de anuncios y conexión con el CRM. Objetivo: dejar de pagar Shopify sin perder
ventas, posicionamiento en Google ni seguridad.

Todo lo de este proyecto vive en esta carpeta (`~/Documents/web-diluvium`).

## Documentos (leer solo el del tema que se va a tocar)
| Tema | Doc |
|---|---|
| **Proceso de réplica exacta** (qué se replica, fuentes, método, criterios) | `docs/proceso-replica.md` |
| Plan general, servicios, costos y fases | `docs/plan-maestro.md` |
| **Costo mensual real** Shopify contra página propia, edición y pruebas A/B | `docs/costos-y-comparacion.md` |
| Ficha de cada página del tema (secciones, textos, medios) | `docs/sitio-actual/paginas/<plantilla>.md` |
| Colores y letras del tema · lista de fotos y videos | `docs/sitio-actual/diseno.md` · `docs/sitio-actual/medios.md` |
| Capturas de referencia (celular, tableta y computadora) | `docs/sitio-actual/capturas/2026-11-03/` (las 34 páginas; videos en su primer cuadro) |
| Medidas reales del sitio en vivo · herramientas | `docs/sitio-actual/medidas/` · `docs/herramientas.md` |
| Ciberseguridad (reglas de pagos, llaves, revisiones) | `docs/seguridad.md` |
| **Administrador** (Payload: qué se edita, cómo llega a la página, comandos) | `docs/administrador.md` |
| **Publicar en Cloudflare** (dirección de prueba sin indexar, pasos del dueño y comandos) | `docs/despliegue.md` |
| Qué tiene la tienda actual (páginas, productos, apps, pagos) | `docs/sitio-actual/inventario.md` |

## Código (paso 1 terminado el 4-nov-2026 · paso 2, administrador, funcionando en esta Mac el 5-nov-2026)
Next.js **16.4.3** (App Router; las APIs cambiaron: leer `node_modules/next/dist/docs/` antes de usarlas) · React
19.2 · Tailwind 4 · TypeScript estricto. Mismas versiones que el CRM, fijas.
- `src/app/(sitio)/`: la tienda · `src/app/(payload)/`: el administrador (`/admin`) · `src/app/global-not-found.tsx`: 404.
- `src/app/(sitio)/globals.css`: medidas del sitio en vivo (colores, letras, márgenes `--margen`, aire `--aire`, escala `--h1…`,
  esquemas `.esquema-1…6`, `.contenedor`).
- `contenido/`: lo que la página muestra (tema, productos, menús). Lo escribe el administrador con
  `npm run admin:exportar`; la página nunca lee la base de datos (`docs/administrador.md`).
- `src/components/secciones/<Pieza>.tsx`: una pieza por tipo de sección del tema, registrada en `registro.tsx`.
- `herramientas/`: captura, medición y **comparación** contra el sitio en vivo (`docs/herramientas.md`).
- Comandos: `npm run dev` (puerto 3100) · `npm run typecheck` · `npm run lint` · `npm run check` ·
  `npm run comparar -- portada / celular,compu`.

## Reglas duras
- **Estado (5-nov-2026):** el dueño aprobó el **paso 1** (réplica visual) y pidió el **administrador** (paso 2), que se
  construye en esta Mac con base local. El resto sigue **propuesto**: no se crean cuentas de servicios ni se conecta
  nada de pago sin su OK.
- **Pagos:** nunca tocar datos de tarjeta; precio siempre calculado en el servidor; un pedido se marca pagado solo
  con aviso firmado de Mercado Pago **y** consulta a su API (`docs/seguridad.md` §2).
- **Repositorio PÚBLICO** (`Diluvium-mx/web-diluvium`, decisión del dueño 3-nov-2026; se piensa cerrar al publicar la
  página). Todo lo que entra al repo es público para siempre: nunca secretos ni llaves (tampoco en el chat), ni códigos
  de descuento, ni ventas o datos del negocio (`docs/costos-y-comparacion.md` está fuera de git), ni datos de clientes
  (salvo las reseñas publicadas).
- **Datos de clientes** (nombres, teléfonos, correos, pedidos) nunca en el repo ni en `docs/`. **Excepción** (dueño,
  3-nov-2026): las reseñas ya publicadas en la tienda (nombre como se muestra, estrellas, texto, fotos) en
  `contenido/resenas.json`.
- **Igual que en vivo:** toda función se replica exactamente como en el sitio actual. Si necesita un servicio del paso 3
  (correo, base de datos, carrito, pago), queda idéntica en aspecto y se conecta en el paso 3; nunca un comportamiento
  distinto mientras tanto. Lista en `docs/proceso-replica.md` › Funciones que esperan al paso 3.
- **Tema Shine:** es de pago; no se copia su código (CSS/JS/Liquid). Se rehace el aspecto con Tailwind. Textos,
  fotos y videos de Diluvium sí se reutilizan. Referencia local del tema: `~/Documents/Diluvium CRM/tienda-tema/`.
- **Direcciones:** se conservan las de Shopify (`/products/…`, `/collections/…`, `/pages/…`, `/blogs/blog/…`) o
  llevan redirección 301.
- La tienda actual de Shopify **no se toca** desde este proyecto.
- Comandos con scripts de npm, nunca `npx` (misma regla que el CRM).
- **cyber-neo** antes de cada salida a producción.

## Tareas del dueño
La tarea vive en la tabla «Carlos» de Notion (regla del `~/.claude/CLAUDE.md`): al terminar cada sesión, resumen
sencillo en su página y se actualizan Avance, Progreso y Siguiente paso.
