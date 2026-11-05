# Plan de ciberseguridad de la página nueva

31-oct-2026 · Estado: **propuesta**, espera el OK del dueño junto con el plan maestro.

Al salir de Shopify, todo lo que Shopify cuidaba por nosotros pasa a ser trabajo nuestro. Este documento dice qué
cuidaba, cómo lo vamos a cuidar y qué se revisa antes de abrir la tienda.

## 1. Qué cuidaba Shopify y quién lo cuida ahora

| Riesgo | Antes (Shopify) | Ahora |
|---|---|---|
| Datos de tarjetas (PCI DSS) | Shopify + Mercado Pago | **Mercado Pago**: el formulario de tarjeta vive en sus marcos seguros; la tarjeta nunca pasa por nuestro servidor |
| Ataques que tiran la página (DDoS) | Shopify | El hosting (Vercel: protección DDoS incluida) |
| Bots y tráfico malicioso | Shopify | Firewall del hosting + reglas propias + Cloudflare Turnstile |
| Bots que prueban tarjetas robadas | Shopify + Mercado Pago | **Nosotros** (sección 3) + antifraude de Mercado Pago |
| Fallas de seguridad del código | Shopify | **Nosotros**: revisiones, pruebas y actualizaciones (secciones 6 y 9) |
| Respaldos | Shopify | Respaldos automáticos + copia propia cifrada (sección 11) |
| Cuentas del equipo | Shopify | 2FA obligatoria en todos los servicios (sección 4) |
| Certificado HTTPS | Shopify | El hosting (automático) |

## 2. Pagos: las reglas que nunca se rompen

1. **Nunca tocamos datos de tarjeta.** Se usa el formulario seguro de Mercado Pago (Bricks / Secure Fields): los
   campos son marcos de Mercado Pago dentro de nuestra página. Nuestro servidor solo recibe un «token» de un solo
   uso. Así quedamos en el nivel más simple de PCI (SAQ A) y no guardamos nada que valga la pena robar.
2. **El precio lo calcula el servidor**, nunca el navegador. Del navegador solo llega «qué producto, qué tamaño y
   cuántos»; el servidor busca el precio en la base de datos, aplica descuentos válidos y cobra ese total.
3. **Un pedido se marca «pagado» solo cuando Mercado Pago lo confirma**: llega su aviso (webhook) con firma válida
   y, además, el servidor consulta el pago en la API de Mercado Pago y compara monto, moneda y pedido. Si algo no
   cuadra, el pedido queda en revisión y avisa.
4. **Cada aviso se procesa una sola vez** (idempotencia): si Mercado Pago repite el aviso, no se duplica el pedido
   ni el correo.
5. **Llaves con el menor poder posible:** la llave pública va en la página; la privada solo en el servidor. Llaves
   distintas para pruebas y producción. Las pruebas usan las credenciales de prueba de Mercado Pago.
6. **3-D Secure y antifraude de Mercado Pago encendidos**, y se manda el identificador de dispositivo que pide
   Mercado Pago para que su antifraude funcione igual que hoy.

## 3. Bots que prueban tarjetas robadas (el ataque más común a tiendas chicas)

Bots usan la pantalla de pago para probar miles de tarjetas robadas. Resultado: contracargos, comisiones y
Mercado Pago puede castigar o cerrar la cuenta. Defensas:

- **Cloudflare Turnstile** (captcha invisible, gratis) antes de crear el pago.
- **Límites por IP, por correo y por dispositivo:** pocos intentos de pago por hora; después de varios rechazos
  seguidos se bloquea ese origen por un tiempo.
- **Reglas del firewall** del hosting contra tráfico automatizado en `/api/pago` y en el formulario.
- **Alerta inmediata** al dueño si los rechazos de una hora pasan de lo normal.
- Interruptor en el administrador para **pausar los pagos con tarjeta** en un clic si hay un ataque (WhatsApp sigue
  funcionando).

## 4. Cuentas y accesos

- **2FA en todo**, de preferencia con app de códigos o llave física (no SMS): GitHub, hosting, base de datos,
  Mercado Pago, PayPal, registrador del dominio, DNS, correo, Clarity y Google.
- Las cuentas son **de la empresa** (correo de Diluvium), no personales, y se anotan en una lista de accesos
  (sin contraseñas) para saber quién entra a qué.
- **Administrador de la tienda:** sin registro público; solo usuarios que crea el dueño; 2FA obligatoria; sesiones
  que caducan; roles (dueño, vendedor, contenido). Cada cambio de precio, producto, pedido o usuario queda en un
  **registro de auditoría** (quién, qué, cuándo).
- El administrador puede vivir en una dirección propia (por ejemplo `admin.diluvium.com.mx`) con reglas más duras
  del firewall.
- **Hecho en esta Mac (5-nov-2026, `docs/administrador.md`):**
  - la API del administrador solo responde con sesión (sin sesión, 403);
  - 5 intentos fallidos bloquean la cuenta 15 minutos;
  - sin GraphQL.

  **Falta antes de publicar:** 2FA, roles, registro de auditoría y crear el usuario del dueño en cuanto exista la
  base del hosting (mientras no hay usuarios, `/admin` deja crear el primero).

## 5. Llaves y secretos

- **Nunca en el código ni en el chat.** Viven en las variables del hosting, separadas por entorno (producción,
  pruebas). Las versiones de prueba nunca tienen llaves de producción.
- **Repositorio público** en GitHub (`Diluvium-mx/web-diluvium`, decisión del dueño del 3-nov-2026). Por ser público,
  GitHub da gratis el escaneo de secretos y el bloqueo de «push» si alguien sube una llave por error; quedan activados.
  Nada que no pueda ser público entra al repositorio (ver `CLAUDE.md`). Recomendación al terminar: pasarlo a privado
  (gratis) en vez de borrarlo, porque Vercel publica desde ahí y borrarlo no quita las copias que ya existan.
- Lección del incidente de Railway (21-oct): hay que suponer que un proveedor puede filtrarse. Por eso cada llave
  tiene el mínimo poder, los avisos de pago se comprueban con firma **y** consultando a Mercado Pago, y hay una guía
  de cambio de llaves lista para usarse (igual a la del CRM).
- Rotación planeada de llaves cada 6 meses o de inmediato ante cualquier sospecha.

## 6. El código (lo de OWASP en palabras simples)

- **Todo lo que entra se valida** (Zod) en cada formulario, API y aviso de terceros.
- **Base de datos solo con consultas seguras** (ORM con parámetros; nada de armar SQL con texto).
- **Permisos revisados en el servidor** en cada acción del administrador, no solo escondiendo botones.
- **Formularios protegidos contra envíos falsos** desde otros sitios (CSRF) y contra inyección de código (XSS): el
  contenido que se edita en el administrador se limpia antes de mostrarse.
- **Subida de imágenes:** solo tipos permitidos, tamaño máximo, y se vuelven a procesar (se les quitan datos
  ocultos).
- **Errores sin detalles** para el público; el detalle va al registro interno.
- Los datos de clientes nunca van en direcciones (URL) ni a la analítica.

## 7. Encabezados de seguridad del navegador

- **CSP estricta** (lista cerrada de qué sitios pueden cargar scripts: Mercado Pago, PayPal, Clarity, Google, Meta,
  TikTok, Turnstile). Impide que un script ajeno robe datos del formulario.
- **HSTS** (siempre HTTPS), prohibido meter la página en marcos de otros sitios, `Referrer-Policy`,
  `Permissions-Policy` y aislamiento de ventanas.
- Meta: calificación **A o A+** en securityheaders.com y Mozilla Observatory antes de abrir.

## 8. Hosting, dominio y base de datos

- Firewall del hosting con reglas de límite de peticiones y bloqueo de bots en pago, administrador y formularios.
- **Dominio:** candado de transferencia en el registrador, 2FA y DNSSEC. Al cambiar los registros del dominio se
  conservan los del correo (Zoho: MX, SPF, DKIM, DMARC).
- **Base de datos:** sin acceso público abierto, conexión cifrada, contraseña larga, usuario de solo lectura para
  respaldos. La tienda va en **su propia base de datos**, separada del CRM: si una falla, la otra no se expone.

## 9. Dependencias (paquetes de npm)

- Pocas dependencias y conocidas; versiones fijas con archivo de bloqueo; `npm ci` en cada despliegue.
- No se instala un paquete publicado hace menos de una semana (los ataques recientes a npm se descubren en días).
- Avisos automáticos de GitHub (Dependabot) y `npm audit` en cada cambio; acciones de GitHub con permisos mínimos.
- Pendiente (4-nov-2026): alerta moderada de `minimatch` dentro de `typescript-eslint`. Solo afecta al revisor de código
  (`npm run lint`), nunca a la página. La corrección (minimatch 11) salió hace días y `typescript-eslint` todavía pide
  la 10; forzarla rompe la regla de una semana y el rango del paquete. Se actualiza cuando `typescript-eslint` la acepte
  (revisión de cyber-neo antes de abrir).

## 10. Datos personales (ley mexicana)

- **Aviso de privacidad** actualizado (Ley Federal de Protección de Datos Personales en Posesión de los
  Particulares, 2025) y términos y política de devoluciones (PROFECO).
- Se guarda solo lo necesario para entregar y facturar. Nada de tarjetas.
- Clarity con **enmascarado estricto** en pago y formularios (no graba lo que la gente escribe).
- Banner de cookies para los píxeles de anuncios.

## 11. Respaldos y recuperación

- Respaldo automático diario del proveedor de base de datos + **copia propia cifrada** fuera del proveedor (como en
  el CRM, con llave GPG).
- **Prueba de restauración** una vez al mes (un respaldo que no se ha probado no cuenta).
- Plan de incidentes escrito: a quién se avisa, cómo se pausan pagos, cómo se cambian llaves y cómo se regresa a
  una versión anterior de la página en un clic.

## 12. Vigilancia

- Errores del sitio en Sentry; aviso si la página se cae (monitor externo cada minuto).
- Alertas: pago confirmado sin pedido, pedido sin pago por más de 1 hora, rechazos fuera de lo normal, inicio de
  sesión en el administrador desde un lugar nuevo.

## 13. Revisiones antes de abrir y después

- **cyber-neo** (auditoría completa) antes de cada salida a producción.
- **REA** (cuando se instale) para revisar lo que el navegador recibe: que ninguna llave viaje a la página.
- Pruebas de pago completas en el modo de pruebas de Mercado Pago: aprobado, rechazado, en revisión, reembolso,
  aviso repetido, monto alterado.
- Revisión adversarial del flujo de pago (Codex) antes de abrir.
- Repetir cyber-neo cada mes y después de cada cambio grande.

## 14. Lista del día de apertura

- [ ] 2FA confirmada en todas las cuentas
- [ ] Llaves de producción cargadas y las de prueba fuera de producción
- [ ] Encabezados A/A+ y SSL A+
- [ ] Turnstile, límites y alertas de pago funcionando
- [ ] Pago real de prueba con tarjeta (y reembolso) en producción
- [ ] Respaldo y restauración probados
- [ ] Redirecciones 301 de todas las direcciones viejas
- [ ] Aviso de privacidad, términos y devoluciones publicados
- [ ] cyber-neo sin hallazgos críticos ni altos
