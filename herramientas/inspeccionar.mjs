// Corre una expresión de JavaScript en una página (en vivo o la réplica local) con la vista indicada y muestra el
// resultado. Para medir detalles puntuales (bordes, sombras, animaciones) que la medición general no guarda.
//
// Uso: node herramientas/inspeccionar.mjs <url> <celular|tableta|compu> '<expresión JS>'

import { abrirChrome } from "./cdp.mjs";

const [url, vista, expresion] = process.argv.slice(2);
const chrome = await abrirChrome();
try {
  const pagina = await chrome.abrirPagina(url, vista);
  console.log(JSON.stringify(await pagina.evaluar(expresion), null, 1));
  await pagina.cerrar();
} finally {
  await chrome.cerrar();
}
