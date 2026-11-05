// Genera los archivos que Payload necesita: el mapa de componentes del administrador y los tipos de TypeScript.
// Se corre con tsx directo (npm run admin:generar) porque la herramienta «payload» choca con Node 26 (carga dos veces
// una pieza interna, undici).

import { generateImportMap } from "payload";
import { generateTypes } from "payload/node";
import configPromesa from "../../payload.config";

const config = await configPromesa;
await generateImportMap(config, { force: true, log: true });
await generateTypes(config, { log: true });

process.exit(0);
