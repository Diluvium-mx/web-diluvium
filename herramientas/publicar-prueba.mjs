// Copia LIGERA de la página para revisar versiones en línea con el plan GRATIS de Cloudflare (máximo 3 MB).
// Arma una copia del proyecto en una carpeta temporal (sin tocar el proyecto), le quita lo que pesa y no hace falta para
// revisar diseño, y la publica como el Worker «diluvium-prueba» en la dirección *.workers.dev de la cuenta:
//   - sin el administrador (src/app/(payload)) ni la base de datos ni las fotos subidas (no usa D1 ni R2);
//   - el pago y los formularios no guardan nada: avisan que es una copia de prueba;
//   - construida con SITIO_PRUEBA=1: Google no la indexa (robots, noindex y X-Robots-Tag).
// La página completa (con administrador, pedidos y correos) es la de siempre y se publica con el plan de pago.
//
// Uso: node herramientas/publicar-prueba.mjs                     (arma la copia con los archivos de ahora y dice cuánto pesa)
//      node herramientas/publicar-prueba.mjs --desde=main         (la arma con lo guardado en esa rama de git)
//      node herramientas/publicar-prueba.mjs --publicar           (además la publica)

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const COPIA = join(tmpdir(), "diluvium-prueba-ligera");
const publicar = process.argv.includes("--publicar");
const desde = process.argv.find((a) => a.startsWith("--desde="))?.split("=")[1];
const FUERA = new Set(["node_modules", ".next", ".open-next", ".wrangler", ".git", "comparaciones", "datos"]);

console.log("Armando la copia en", COPIA);
rmSync(COPIA, { recursive: true, force: true });
mkdirSync(COPIA, { recursive: true });
if (desde) {
  // Lo guardado en git (sin cambios a medio hacer); las capturas y la base local no están en git.
  execFileSync("sh", ["-c", `git archive ${JSON.stringify(desde)} | tar -x -C ${JSON.stringify(COPIA)}`], { cwd: RAIZ, stdio: "inherit" });
} else cpSync(RAIZ, COPIA, {
  recursive: true,
  filter: (src) => {
    const rel = src.slice(RAIZ.length);
    const primera = rel.split("/")[0];
    if (FUERA.has(primera)) return false;
    if (rel.startsWith("docs/sitio-actual/capturas") || rel.startsWith("public/media/admin")) return false;
    if (/^\.env|^\.dev\.vars/.test(rel)) return false;
    return true;
  },
});
// Las dependencias se clonan (APFS: instantáneo y sin ocupar espacio extra); un enlace simbólico confunde a OpenNext.
execFileSync("cp", ["-cR", join(RAIZ, "node_modules"), join(COPIA, "node_modules")]);

// Sin administrador, y sin la página de «gracias» (aquí no se toman pedidos).
rmSync(join(COPIA, "src/app/(payload)"), { recursive: true, force: true });
rmSync(join(COPIA, "src/app/(pago)/checkout/gracias"), { recursive: true, force: true });

// Pago: el resumen se calcula igual (catálogo publicado, sin códigos de descuento); no se crean pedidos.
writeFileSync(
  join(COPIA, "src/lib/pago/acciones.ts"),
  `"use server";
// Copia ligera de prueba (herramientas/publicar-prueba.mjs): sin base de datos, no se toman pedidos.
import { calcularResumen, direccionCompleta, limpiarLineas } from "./calcular";
import type { DatosPago, Direccion, LineaPedido, Resumen, ResultadoPedido } from "./tipos";

const ENVIO = { nombre: "Terrestre 3–5 días", gratisDesde: 499, costo: 0 };

export async function cotizar(lineas: LineaPedido[], codigo?: string, direccion?: Partial<Direccion>): Promise<Resumen & { codigoInvalido: boolean }> {
  const l = limpiarLineas(lineas);
  const r = calcularResumen(l.lineas, { descuento: null, envio: ENVIO, conDireccion: direccionCompleta(direccion), avisos: l.avisos });
  return { ...r, codigoInvalido: Boolean(String(codigo ?? "").trim()) };
}

export async function crearPedido(_datos: DatosPago): Promise<ResultadoPedido> {
  void _datos;
  return { ok: false, errores: {}, mensaje: "Esta es una copia de prueba de la página: aquí no se toman pedidos. Compra en diluvium.com.mx." };
}
`,
);

// Formularios: no se guarda nada (y se dice, para que nadie crea que mandó un mensaje).
writeFileSync(
  join(COPIA, "src/lib/formularios/acciones.ts"),
  `"use server";
// Copia ligera de prueba (herramientas/publicar-prueba.mjs): sin base de datos, los formularios no guardan nada.
export type Trampa = { sitio?: string; abierto?: number };
export type RespuestaFormulario = { ok: true } | { ok: false; error: string; campo?: string };
const AVISO = { ok: false as const, error: "Esta es una copia de prueba: este formulario no envía nada. Escríbenos por WhatsApp." };
export async function enviarMensaje(..._args: unknown[]): Promise<RespuestaFormulario> { void _args; return AVISO; }
export async function suscribir(..._args: unknown[]): Promise<RespuestaFormulario> { void _args; return AVISO; }
export async function enviarResena(..._args: unknown[]): Promise<RespuestaFormulario> { void _args; return AVISO; }
`,
);

// Cloudflare: otro Worker, sin base ni fotos subidas; solo la optimización de fotos.
writeFileSync(
  join(COPIA, "wrangler.jsonc"),
  JSON.stringify(
    {
      $schema: "node_modules/wrangler/config-schema.json",
      main: ".open-next/worker.js",
      name: "diluvium-prueba",
      compatibility_date: "2026-10-15",
      compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"],
      assets: { directory: ".open-next/assets", binding: "ASSETS" },
      images: { binding: "IMAGES" },
      // También al momento de la visita (robots.txt y páginas que se arman en el Worker): que Google no la indexe.
      vars: { SITIO_PRUEBA: "1" },
      observability: { enabled: true },
    },
    null,
    2,
  ),
);

const correr = (cmd, args, env = {}) =>
  execFileSync(cmd, args, { cwd: COPIA, stdio: "inherit", env: { ...process.env, SITIO_PRUEBA: "1", ...env } });

console.log("Construyendo (unos minutos)…");
correr(join(COPIA, "node_modules/.bin/opennextjs-cloudflare"), ["build"]);

const medida = execFileSync(join(COPIA, "node_modules/.bin/wrangler"), ["deploy", "--dry-run", "--outdir", join(COPIA, ".medida")], {
  cwd: COPIA,
  encoding: "utf8",
});
const peso = medida.match(/Total Upload:.*$/m)?.[0] ?? "(no se pudo medir)";
console.log("Peso:", peso, "· límite del plan gratis: 3 MB comprimido (gzip)");

if (publicar) {
  correr(join(COPIA, "node_modules/.bin/wrangler"), ["deploy"]);
  console.log("Publicada. La dirección sale arriba (…workers.dev).");
} else if (!existsSync(join(COPIA, ".open-next/worker.js"))) {
  process.exitCode = 1;
}
