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

export const espera = (ms) => new Promise((r) => setTimeout(r, ms));

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
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
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

  async function abrirPagina(url, vista, { esperaMs = 6000 } = {}) {
    const v = VISTAS[vista];
    const { targetId } = await cdp("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp("Target.attachToTarget", { targetId, flatten: true });
    const s = (m, p) => cdp(m, p, sessionId);
    await s("Page.enable");
    await s("Emulation.setDeviceMetricsOverride", { width: v.width, height: v.height, deviceScaleFactor: 1, mobile: v.mobile });
    await s("Emulation.setTouchEmulationEnabled", { enabled: v.mobile });
    await s("Network.setUserAgentOverride", { userAgent: v.ua });
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
      async capturar({ calidad = 70, alto = null } = {}) {
        const { cssContentSize } = await s("Page.getLayoutMetrics");
        const h = alto ?? Math.min(Math.ceil(cssContentSize.height), 30000);
        const { data } = await s("Page.captureScreenshot", {
          format: "jpeg", quality: calidad, captureBeyondViewport: true,
          clip: { x: 0, y: 0, width: v.width, height: h, scale: 1 },
        });
        return { buffer: Buffer.from(data, "base64"), alto: h };
      },
      cerrar: () => cdp("Target.closeTarget", { targetId }),
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
