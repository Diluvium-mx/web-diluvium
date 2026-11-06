// Estado que se propone en «Entrega» antes de que el cliente elija, como hace la pantalla en vivo: la región
// aproximada por IP con el mismo servicio que ya usa la ficha (ipinfo.io, src/components/producto/ficha/
// EntregaEstimada.tsx). Si no responde o no es de México, el estado queda sin elegir.

import { ESTADOS } from "@/lib/pago/tipos";

const sinAcentos = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// Nombres que da ipinfo (a veces en inglés o con el nombre oficial largo) que no son iguales a los de la tienda.
const OTROS_NOMBRES: Record<string, string> = {
  "mexico city": "DIF",
  "ciudad de mexico": "DIF",
  cdmx: "DIF",
  "distrito federal": "DIF",
  "state of mexico": "MEX",
  mexico: "MEX",
  "estado de mexico": "MEX",
  "coahuila de zaragoza": "COA",
  "michoacan de ocampo": "MIC",
  "veracruz de ignacio de la llave": "VER",
  "veracruz-llave": "VER",
  "queretaro de arteaga": "QUE",
};

/** Nombre de región → clave del estado (ESTADOS), o "" si no se reconoce. */
export function claveDeRegion(region: string): string {
  const limpio = sinAcentos(region);
  if (!limpio) return "";
  const directo = ESTADOS.find((e) => sinAcentos(e.nombre) === limpio);
  return directo?.clave ?? OTROS_NOMBRES[limpio] ?? "";
}

/** Pregunta la región por IP; regresa la clave del estado o "" (nunca falla). */
export async function estadoPorIp(senal: AbortSignal): Promise<string> {
  try {
    const r = await fetch("https://ipinfo.io/json", { signal: senal, credentials: "omit", referrerPolicy: "no-referrer" });
    if (!r.ok) return "";
    const d = (await r.json()) as { region?: unknown; country?: unknown };
    if (d.country !== "MX" || typeof d.region !== "string") return "";
    return claveDeRegion(d.region);
  } catch {
    return "";
  }
}
