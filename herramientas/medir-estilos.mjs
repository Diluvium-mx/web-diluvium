// Mide la página real (estilos calculados por el navegador, no el código del tema): por cada sección, su caja,
// fondo y los textos, botones, imágenes y videos con letra, tamaño, color y posición. Sirve para construir cada
// pieza igual y para comparar.
//
// Uso: node herramientas/medir-estilos.mjs <url> <nombre> [celular,compu,tableta]
// Salida: docs/sitio-actual/medidas/<nombre>-<vista>.json

import { mkdirSync, writeFileSync } from "node:fs";
import { abrirChrome } from "./cdp.mjs";
import { MEDIR } from "./medir.mjs";

const [url, nombre, vistasArg = "celular,compu"] = process.argv.slice(2);
if (!url || !nombre) {
  console.error("Uso: node herramientas/medir-estilos.mjs <url> <nombre> [vistas]");
  process.exit(1);
}
const SALIDA = "docs/sitio-actual/medidas";
mkdirSync(SALIDA, { recursive: true });


const chrome = await abrirChrome();
try {
  for (const vista of vistasArg.split(",")) {
    const pagina = await chrome.abrirPagina(url, vista);
    const datos = await pagina.evaluar(MEDIR);
    writeFileSync(`${SALIDA}/${nombre}-${vista}.json`, JSON.stringify(datos, null, 1));
    console.log(`${nombre} ${vista}: ${datos.secciones.length} secciones, alto ${datos.altoPagina}`);
    await pagina.cerrar();
  }
} finally {
  await chrome.cerrar();
}
