// Chrome sin ventana manejado por CDP, sin dependencias (WebSocket de Node). Lo usan los scripts de captura,
// medición y comparación. Cada llamada a abrirChrome() usa un perfil temporal que se borra al cerrar.

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const VISTAS = {
  celular: {
    width: 390, height: 844, mobile: true,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
  tableta: {
    width: 768, height: 1024, mobile: true,
    ua: "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
  // Computadora chica: entre el corte de 1025 px del tema y 1200 px.
  compu1100: {
    width: 1100, height: 900, mobile: false,
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  },
  compu: {
    width: 1440, height: 900, mobile: false,
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  },
};

// Analítica, píxeles de anuncios y telemetría que la tienda en vivo dispara al ver páginas y al agregar al carrito.
// Se pasan en abrirPagina(url, vista, { bloquear: BLOQUEAR_ANALITICA }) cuando el script hace algo más que mirar.
export const BLOQUEAR_ANALITICA = [
  "*facebook*", "*fbcdn*", "*google-analytics*", "*googletagmanager*", "*doubleclick*", "*googleadservices*",
  "*tiktok*", "*clarity.ms*", "*bing*",
  "*/api/collect*", "*monorail*", "*/.well-known/shopify/*", "*shopify.com/s/*", "*trekkie*", "*web-pixels*",
  // Telemetría de Shopify, huellas antifraude de Mercado Pago / Mercado Libre y otras mediciones de las apps.
  "*shopifysvc.com*", "*mercadolibre.com/jms*", "*mercadopago.com*/jms/*", "*api.mercadopago.com/ppcore*",
  "*mercadopago.com/v2/security*", "*ipinfo.io*", "*cdn-cgi/trace*", "*/reviews/collect*",
];

export const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export const CONGELAR_VIDEOS = `(async()=>{const vs=[...document.querySelectorAll('video')];await Promise.all(vs.map(v=>new Promise(r=>{v.pause();v.autoplay=false;if(v.readyState===0){r();return}if(v.currentTime===0){r();return}v.addEventListener('seeked',()=>r(),{once:true});v.currentTime=0;setTimeout(r,3000)})));await new Promise(r=>setTimeout(r,500))})()`;

export async function abrirChrome() {
  const perfil = mkdtempSync(join(tmpdir(), "chrome-diluvium-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio", "--no-first-run",
    "--autoplay-policy=no-user-gesture-required", `--user-data-dir=${perfil}`, "--remote-debugging-port=0",
    "about:blank",
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
  // Quien quiera oír los eventos de CDP (no las respuestas): recibe el mensaje completo, con su sessionId.
  const oyentes = new Set();
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method) for (const oir of oyentes) oir(msg);
    if (msg.id && pendientes.has(msg.id)) {
      const { resolve, reject } = pendientes.get(msg.id);
      pendientes.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  const cdp = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pendientes.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

  // bloquear: direcciones que el navegador no debe pedir (p. ej. analítica y píxeles de anuncios del sitio en vivo),
  // con comodines «*» como en Network.setBlockedURLs. Se aplican antes de navegar.
  // oir: función que recibe los eventos de CDP de la pestaña desde antes de navegar (p. ej. para anotar las peticiones).
  async function abrirPagina(url, vista, { esperaMs = 6000, bloquear = null, oir = null } = {}) {
    const v = VISTAS[vista];
    const { targetId } = await cdp("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp("Target.attachToTarget", { targetId, flatten: true });
    const s = (m, p) => cdp(m, p, sessionId);
    await s("Page.enable");
    await s("Emulation.setDeviceMetricsOverride", { width: v.width, height: v.height, deviceScaleFactor: 1, mobile: v.mobile });
    await s("Emulation.setTouchEmulationEnabled", { enabled: v.mobile });
    await s("Network.setUserAgentOverride", { userAgent: v.ua });
    // Sesiones de esta pestaña: la página y lo que cuelga de ella (marcos de otro proceso, trabajadores).
    const sesiones = new Set([sessionId]);
    const delaPestana = (msg) => sesiones.has(msg.sessionId) && oir?.(msg);
    if (oir) oyentes.add(delaPestana);
    let quitarOyente = () => oyentes.delete(delaPestana);
    if (bloquear?.length) {
      // El bloqueo de CDP vale por sesión: cada marco de otro proceso o trabajador que abra la página se engancha
      // en pausa, recibe el mismo bloqueo y hasta entonces arranca. Así ningún píxel se escapa por un iframe.
      const aplicar = async (sid) => {
        await cdp("Network.enable", {}, sid).catch(() => {});
        await cdp("Network.setBlockedURLs", { urls: bloquear }, sid).catch(() => {});
        await cdp("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: true, flatten: true }, sid).catch(() => {});
        await cdp("Runtime.runIfWaitingForDebugger", {}, sid).catch(() => {});
      };
      const alEngancharse = (msg) => {
        if (msg.method !== "Target.attachedToTarget" || !sesiones.has(msg.sessionId)) return;
        sesiones.add(msg.params.sessionId);
        aplicar(msg.params.sessionId);
      };
      oyentes.add(alEngancharse);
      quitarOyente = () => {
        oyentes.delete(alEngancharse);
        oyentes.delete(delaPestana);
      };
      await aplicar(sessionId);
    }
    await s("Page.navigate", { url });
    await espera(esperaMs);
    const evaluar = async (expression) => {
      const { result, exceptionDetails } = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
      return result.value;
    };
    // Baja poco a poco, espera a que terminen las imágenes diferidas (hasta 8 s) y regresa arriba.
    await evaluar(`(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,300))}const t=Date.now();while([...document.images].some(i=>!i.complete)&&Date.now()-t<8000){await new Promise(r=>setTimeout(r,250))}scrollTo(0,0);await new Promise(r=>setTimeout(r,1500))})()`);
    return {
      evaluar,
      // Acceso directo a CDP en esta pestaña (navegar, capturar solo la pantalla, etc.).
      cdp: s,
      /** Oye los eventos de CDP de esta pestaña y de sus marcos y trabajadores; regresa la función para dejar de oír. */
      escuchar(fn) {
        const oir = (msg) => sesiones.has(msg.sessionId) && fn(msg);
        oyentes.add(oir);
        return () => oyentes.delete(oir);
      },
      async capturar({ calidad = 70, alto = null } = {}) {
        // Videos que corren solos: se congelan en su primer cuadro para que la captura no dependa del momento.
        await evaluar(CONGELAR_VIDEOS);
        const { cssContentSize } = await s("Page.getLayoutMetrics");
        const h = alto ?? Math.min(Math.ceil(cssContentSize.height), 30000);
        const { data } = await s("Page.captureScreenshot", {
          format: "jpeg", quality: calidad, captureBeyondViewport: true,
          clip: { x: 0, y: 0, width: v.width, height: h, scale: 1 },
        });
        return { buffer: Buffer.from(data, "base64"), alto: h };
      },
      cerrar: () => {
        quitarOyente();
        return cdp("Target.closeTarget", { targetId });
      },
    };
  }

  return {
    abrirPagina,
    async cerrar() {
      ws.close();
      const salio = new Promise((r) => chrome.once("exit", r));
      chrome.kill();
      await Promise.race([salio, espera(5000)]);
      try {
        rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
      } catch {
        // El perfil está en la carpeta temporal del sistema; si queda algo, macOS lo limpia solo.
      }
    },
  };
}
