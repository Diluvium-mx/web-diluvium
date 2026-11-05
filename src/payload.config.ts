// Administrador de la página (Payload). Guarda el contenido en una base de datos y lo exporta a contenido/*.json, que
// es lo que la página lee al construirse (docs/administrador.md). En esta Mac la base es un archivo SQLite
// (datos/admin.db, fuera del repositorio); al publicar se cambia por la base del hosting.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { es } from "@payloadcms/translations/languages/es";
import { buildConfig } from "payload";
import sharp from "sharp";
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

const carpeta = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.PAYLOAD_SECRET) throw new Error("Falta PAYLOAD_SECRET en .env (ver .env.example)");

export default buildConfig({
  admin: {
    user: Usuarios.slug,
    importMap: { baseDir: path.resolve(carpeta) },
    meta: { titleSuffix: " · Administrador Diluvium" },
  },
  i18n: { supportedLanguages: { es }, fallbackLanguage: "es" },
  collections: [Productos, Resenas, Colecciones, Plantillas, Paginas, Politicas, Articulos, FichasSeo, Medios, Usuarios],
  globals: [Menus, CarruselResenas, AjustesTema, DatosGoogle, Fuentes],
  secret: process.env.PAYLOAD_SECRET,
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URL || "file:./datos/admin.db" } }),
  // Sin GraphQL: menos puertas abiertas. El administrador usa la API normal (/api/…).
  graphQL: { disable: true },
  sharp,
  typescript: { outputFile: path.resolve(carpeta, "payload-types.ts") },
});
