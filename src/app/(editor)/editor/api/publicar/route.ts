// Publica la copia de prueba (herramientas/publicar-prueba.mjs --publicar) desde el editor local y dice cómo va.
// Tarda unos minutos: se lanza aparte y la página pregunta cada pocos segundos (GET).

import { spawn } from "node:child_process";
import { existsSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { revisarPedido } from "@/lib/editor/guardia";
import { RAIZ } from "@/lib/editor/archivos";

export const dynamic = "force-dynamic";

const BITACORA = path.join(tmpdir(), "diluvium-editor-publicar.log");
const ESTADO = path.join(tmpdir(), "diluvium-editor-publicar.json");

function estado() {
  const e = existsSync(ESTADO) ? (JSON.parse(readFileSync(ESTADO, "utf8")) as { inicio: number }) : null;
  const texto = existsSync(BITACORA) ? readFileSync(BITACORA, "utf8") : "";
  const fin = texto.match(/__FIN__ (\d+)/);
  const peso = texto.match(/Peso: Total Upload: .*?gzip: ([\d.]+ KiB)/)?.[1] ?? null;
  const direccion = texto.match(/https:\/\/[\w.-]+\.workers\.dev/)?.[0] ?? null;
  return {
    corriendo: Boolean(e) && !fin,
    inicio: e?.inicio ?? null,
    ok: fin ? fin[1] === "0" : null,
    peso,
    direccion,
    ultimas: texto.replace(/__FIN__ \d+/, "").trim().split("\n").filter(Boolean).slice(-6),
  };
}

export async function GET(request: Request) {
  const bloqueo = revisarPedido(request);
  if (bloqueo) return bloqueo;
  return Response.json(estado());
}

export async function POST(request: Request) {
  const bloqueo = revisarPedido(request, { cambia: true });
  if (bloqueo) return bloqueo;
  if (estado().corriendo) return Response.json({ ok: false, mensaje: "Ya se está publicando." }, { status: 409 });
  writeFileSync(BITACORA, "");
  writeFileSync(ESTADO, JSON.stringify({ inicio: Date.now() }));
  const salida = openSync(BITACORA, "a");
  const hijo = spawn("sh", ["-c", `"${process.execPath}" herramientas/publicar-prueba.mjs --publicar; echo "__FIN__ $?"`], {
    cwd: RAIZ,
    detached: true,
    stdio: ["ignore", salida, salida],
  });
  hijo.unref();
  return Response.json({ ok: true });
}
