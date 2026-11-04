// Captura de página completa (celular y computadora) del sitio actual, para tener la referencia exacta.
// Sin dependencias: abre Chrome sin ventana con un perfil temporal y lo maneja por CDP (WebSocket de Node).
//
// Uso: node herramientas/capturar-sitio.mjs [carpeta-de-salida] [paginas=portada,compuerta…] [vistas=celular,compu,tableta]
// Salida: <carpeta>/<pagina>-celular.jpg, <pagina>-compu.jpg y <pagina>.html

import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = "https://www.diluvium.com.mx";
const PAGINAS = {
  portada: "/",
  "compuerta": "/products/compuerta-anti-inundaciones",
  "compuerta-xxl-medida": "/products/compuerta-anti-inundaciones-hecha-a-la-medida",
  "mini-compuerta": "/products/mini-compuerta",
  "tapon-inflable": "/products/tapon-inflable-anti-inundaciones",
  "funda-repuesto": "/products/funda-de-repuesto-compuerta-anti-inundaciones",
  "tira-hule": "/products/accesorio-tira-de-hule-de-repuesto",
  "plastilina": "/products/accesorio-plastilina-de-secado-rapido",
  "coleccion-todos": "/collections/all-products",
  "coleccion-all": "/collections/all",
  "coleccion-compuerta": "/collections/a-compuerta",
  "coleccion-escritorio": "/collections/coleccion-para-escritorio",
  "coleccion-mobile": "/collections/coleccion-para-mobile",
  "coleccion-frontpage": "/collections/frontpage",
  "coleccion-mas-vendidos": "/collections/los-mas-vendidos",
  colecciones: "/collections",
  nosotros: "/pages/nosotros",
  contacto: "/pages/contact",
  "preguntas-frecuentes": "/pages/preguntas-frecuentes",
  instalacion: "/pages/instalacion",
  distribuidor: "/pages/distribuidor",
  resenas: "/pages/reviews",
  "compartir-carrito": "/pages/share-cart",
  busqueda: "/search",
  "busqueda-compuerta": "/search?q=compuerta",
  blog: "/blogs/blog",
  "blog-prepararse": "/blogs/blog/como-prepararse-para-una-inundacion-en-temporada-de-lluvias",
  "blog-kit-evacuacion": "/blogs/blog/como-prepararse-para-una-inundacion-en-temporada-de-lluvias-parte-4",
  "blog-por-que-aumentan": "/blogs/blog/por-que-aumentan-las-inundaciones-en-nuestras-ciudades",
  carrito: "/cart",
  "no-existe-404": "/pages/esta-pagina-no-existe",
  "politica-privacidad": "/policies/privacy-policy",
  "politica-reembolso": "/policies/refund-policy",
  "terminos": "/policies/terms-of-service",
};
const VISTAS = {
  celular: {
    width: 390, height: 844, deviceScaleFactor: 1, mobile: true,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
  tableta: {
    width: 768, height: 1024, deviceScaleFactor: 1, mobile: true,
    ua: "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
  compu: {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  },
};
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const salida = process.argv[2] ?? "docs/sitio-actual/capturas";
const soloPaginas = process.argv[3] ? new Set(process.argv[3].split(",")) : null;
const soloVistas = process.argv[4] ? new Set(process.argv[4].split(",")) : null;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(salida, { recursive: true });
const perfil = mkdtempSync(join(tmpdir(), "captura-diluvium-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio", "--no-first-run",
  `--user-data-dir=${perfil}`, "--remote-debugging-port=0", "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

const wsUrl = await new Promise((resolve, reject) => {
  let buffer = "";
  chrome.stderr.on("data", (d) => {
    buffer += d;
    const m = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  });
  setTimeout(() => reject(new Error("Chrome no abrió el puerto de depuración")), 15000);
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pendientes = new Map();
const eventos = [];
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pendientes.has(msg.id)) {
    const { resolve, reject } = pendientes.get(msg.id);
    pendientes.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    eventos.push(msg);
  }
});
const cdp = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pendientes.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

try {
  for (const [nombre, ruta] of Object.entries(PAGINAS)) {
    if (soloPaginas && !soloPaginas.has(nombre)) continue;
    for (const [vista, v] of Object.entries(VISTAS)) {
      if (soloVistas ? !soloVistas.has(vista) : vista === "tableta") continue;
      const { targetId } = await cdp("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp("Target.attachToTarget", { targetId, flatten: true });
      const s = (m, p) => cdp(m, p, sessionId);
      await s("Page.enable");
      await s("Emulation.setDeviceMetricsOverride", {
        width: v.width, height: v.height, deviceScaleFactor: v.deviceScaleFactor, mobile: v.mobile,
      });
      await s("Emulation.setTouchEmulationEnabled", { enabled: v.mobile });
      await s("Network.setUserAgentOverride", { userAgent: v.ua });
      await s("Page.navigate", { url: BASE + ruta });
      await espera(6000);
      // Bajar poco a poco, esperar a que terminen las imágenes diferidas (hasta 8 s) y regresar arriba.
      await s("Runtime.evaluate", {
        awaitPromise: true,
        expression: `(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,300))}const t=Date.now();while([...document.images].some(i=>!i.complete)&&Date.now()-t<8000){await new Promise(r=>setTimeout(r,250))}scrollTo(0,0);await new Promise(r=>setTimeout(r,1500))})()`,
      });
      const { cssContentSize } = await s("Page.getLayoutMetrics");
      const alto = Math.min(Math.ceil(cssContentSize.height), 30000);
      const { data } = await s("Page.captureScreenshot", {
        format: "jpeg", quality: 70, captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: v.width, height: alto, scale: 1 },
      });
      writeFileSync(join(salida, `${nombre}-${vista}.jpg`), Buffer.from(data, "base64"));
      if (vista === "compu") {
        const { result } = await s("Runtime.evaluate", { expression: "document.documentElement.outerHTML" });
        writeFileSync(join(salida, `${nombre}.html`), result.value);
      }
      await cdp("Target.closeTarget", { targetId });
      console.log(`${nombre} ${vista}: ${v.width}x${alto}`);
      await espera(2000);
    }
  }
} finally {
  ws.close();
  await new Promise((r) => { chrome.once("exit", r); chrome.kill(); setTimeout(r, 5000); });
  try {
    rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    // Perfil temporal: si queda algo, macOS lo limpia solo.
  }
}
