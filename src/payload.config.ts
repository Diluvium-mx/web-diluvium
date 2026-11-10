// Administrador de la página (Payload). Guarda el contenido en una base de datos y lo exporta a contenido/*.json, que
// es lo que la página lee al construirse (docs/administrador.md).
//
// Corre en Cloudflare: la base es D1 (SQLite) y las fotos subidas van a R2. En esta Mac se usan copias locales de D1 y
// R2 que crea wrangler (carpeta .wrangler/, fuera del repositorio); con CLOUDFLARE_REMOTO=1 se usan las de la cuenta.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCloudflareContext, type CloudflareContext } from "@opennextjs/cloudflare";
import { sqliteD1Adapter } from "@payloadcms/db-d1-sqlite";
import { r2Storage } from "@payloadcms/storage-r2";
import { es } from "@payloadcms/translations/languages/es";
import { buildConfig } from "payload";
import {
  Articulos,
  Colecciones,
  FichasSeo,
  Medios,
  Paginas,
  Plantillas,
  Politicas,
  Productos,
  Resenas,
  Usuarios,
} from "./payload/colecciones";
import { AjustesTema, CarruselResenas, DatosGoogle, Fuentes, Menus } from "./payload/globales";
import { Correos } from "./payload/correos";
import { AjustesVenta, Descuentos, Pedidos } from "./payload/pedidos";
import { Mensajes, Suscriptores } from "./payload/formularios";

const carpeta = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.PAYLOAD_SECRET) throw new Error("Falta PAYLOAD_SECRET en .env (ver .env.example)");

// Dentro de Cloudflare (la página publicada) la base y las fotos llegan del propio Worker. Fuera (esta Mac, scripts y la
// construcción) las da wrangler: copias locales, o las de la cuenta con CLOUDFLARE_REMOTO=1.
const enCloudflare = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
const cloudflare: CloudflareContext = enCloudflare ? await getCloudflareContext({ async: true }) : await contextoLocal();

export default buildConfig({
  admin: {
    user: Usuarios.slug,
    importMap: { baseDir: path.resolve(carpeta) },
    meta: {
      titleSuffix: " · Administrador Diluvium",
      icons: [{ rel: "icon", type: "image/png", url: "/media/files/Favicon_2aabf220-4641-4694-9dbb-be135ad53af1.png" }],
    },
    // Diseño del CRM de Diluvium (src/app/(payload)/custom.scss), en claro u oscuro con la píldora de la barra.
    theme: "all",
    components: {
      graphics: { Logo: "/payload/componentes/Marca#Logo", Icon: "/payload/componentes/Marca#Icono" },
      // Luz que sigue al cursor e íconos animados del menú, en todo el administrador.
      providers: ["/payload/componentes/BrilloCursor#BrilloCursor", "/payload/componentes/IconosMenu#IconosMenu"],
      // Correo y píldora de tema en la barra de arriba.
      actions: ["/payload/componentes/BarraSuperior#BarraSuperior"],
      beforeLogin: ["/payload/componentes/OjoContrasena#OjoContrasena"],
      beforeDashboard: ["/payload/componentes/Bienvenida#Bienvenida"],
    },
  },
  i18n: { supportedLanguages: { es }, fallbackLanguage: "es" },
  collections: [Pedidos, Descuentos, Mensajes, Suscriptores, Correos, Productos, Resenas, Colecciones, Plantillas, Paginas, Politicas, Articulos, FichasSeo, Medios, Usuarios],
  globals: [AjustesVenta, Menus, CarruselResenas, AjustesTema, DatosGoogle, Fuentes],
  secret: process.env.PAYLOAD_SECRET,
  // D1 no deja que Payload copie la estructura solo («push»): las tablas se crean con migraciones (src/migrations,
  // npm run admin:migrar), como en la plantilla oficial.
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    push: false,
    migrationDir: path.resolve(carpeta, "migrations"),
    // Las secciones de las plantillas (39 tipos) se guardan como JSON: D1 no admite consultas de más de 100 columnas.
    blocksAsJSON: true,
  }),
  // Sin GraphQL: menos puertas abiertas. El administrador usa la API normal (/api/…).
  graphQL: { disable: true },
  plugins: [r2Storage({ bucket: cloudflare.env.R2, collections: { medios: true } })],
  typescript: { outputFile: path.resolve(carpeta, "payload-types.ts") },
});

// wrangler se carga solo fuera de Cloudflare (el nombre armado evita que entre al paquete del Worker), como en la
// plantilla oficial de Payload para Cloudflare.
function contextoLocal(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${"__wrangler".replaceAll("_", "")}`).then(({ getPlatformProxy }) =>
    getPlatformProxy({ environment: process.env.CLOUDFLARE_ENV, remoteBindings: process.env.CLOUDFLARE_REMOTO === "1" }),
  );
}
