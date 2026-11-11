// Agrega al administrador las plantillas de contenido/tema/ que todavía no tiene (por ejemplo, una versión nueva de la
// portada para pruebas), sin borrar ni cambiar nada de lo que ya hay. Las fotos que ya estaban en «Fotos y videos» se
// reutilizan (por su dirección en la página); solo se suben las que falten.
//
// Uso: npm run admin:agregar-plantillas   (en esta Mac, la copia local; con CLOUDFLARE_REMOTO=1, la de la cuenta)
// Antes: la plantilla en PLANTILLAS (comun.ts), npm run admin:esquema y npm run admin:generar.

import { existsSync } from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import config from "../../payload.config";
import { CONTENIDO, PLANTILLAS, RAIZ, leer } from "./comun";
import { seccionesAdmin, type Dic, type Medio, type SeccionTema } from "./plantillas";

const payload = await getPayload({ config });
console.log(process.env.CLOUDFLARE_REMOTO === "1" ? "Base: la de Cloudflare (cuenta)" : "Base: la copia local de esta Mac");

const existentes = new Set(
  (await payload.find({ collection: "plantillas", pagination: false, depth: 0, select: { archivo: true } })).docs.map((d) => d.archivo as string),
);

const medios = new Map<string, Promise<number>>();
const medio: Medio = async (ruta, alt = "") => {
  if (typeof ruta !== "string" || !ruta) return null;
  const limpia = ruta.split("?")[0];
  if (!medios.has(limpia)) {
    medios.set(
      limpia,
      (async () => {
        const ya = await payload.find({ collection: "medios", where: { ruta: { equals: limpia } }, limit: 1, depth: 0 });
        if (ya.docs[0]) return ya.docs[0].id as number;
        const archivo = path.join(RAIZ, "public", decodeURIComponent(limpia));
        if (!existsSync(archivo)) throw new Error(`No existe el archivo ${archivo}`);
        console.log(`  sube ${limpia}`);
        const doc = await payload.create({ collection: "medios", data: { alt, ruta: limpia }, filePath: archivo });
        return doc.id as number;
      })(),
    );
  }
  return medios.get(limpia)!;
};

const fuentes = { ...(((await payload.findGlobal({ slug: "fuentes" })).datos ?? {}) as Dic) };
const agregadas: string[] = [];
for (const [i, [archivo, titulo]] of Object.entries(PLANTILLAS).entries()) {
  if (existentes.has(archivo) || !existsSync(path.join(CONTENIDO, "tema", `${archivo}.json`))) continue;
  const plantilla = leer<{ fuente: string; secciones: SeccionTema[] }>(`tema/${archivo}.json`);
  const secciones = await seccionesAdmin(plantilla.secciones, medio);
  await payload.create({ collection: "plantillas", data: { titulo, archivo, orden: i, secciones: secciones as never } });
  fuentes[`tema/${archivo}.json`] = plantilla.fuente;
  agregadas.push(archivo);
  console.log(`+ ${titulo} (${archivo})`);
}
if (agregadas.length) await payload.updateGlobal({ slug: "fuentes", data: { datos: fuentes } });

console.log(agregadas.length ? `${agregadas.length} plantillas agregadas.` : "No faltaba ninguna plantilla.");
process.exit(0);
