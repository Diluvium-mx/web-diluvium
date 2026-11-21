// Busca la respuesta a una pregunta escrita por el cliente (B1-P6, 21-nov-2026, dueño), sin IA y sin servidor:
// todo pasa en el teléfono con un banco de preguntas y respuestas ya escritas (las de la sección más
// preguntas-banco.ts, sacadas solo de lo que la tienda ya publica).
//
// Cómo encuentra la respuesta:
//   1. Limpia lo escrito: minúsculas, sin acentos ni signos, sin palabras de relleno («el», «de», «que»…).
//   2. Junta palabras que significan lo mismo en un «tema» (cuesta, precio, vale, cuánto → precio; mandan, llega,
//      paquetería → envío…). Así «¿cuánto vale?» y «¿qué precio tiene?» encuentran la misma respuesta.
//   3. Perdona faltas de ortografía de una letra en palabras largas («garntia» → garantía).
//   4. Da puntos a cada respuesta por los temas y palabras que comparte con la pregunta y muestra las 3 mejores.
//   5. Si escribe una medida («mi puerta mide 95 cm», «1.20 m»), contesta qué tamaño le queda con el catálogo.
// Si nada se parece lo suficiente, no inventa: ofrece mandar la pregunta por WhatsApp ya escrita (respuesta segura de
// una persona).

export type EntradaBanco = { pregunta: string; respuesta: string; claves?: string; enlace?: { texto: string; href: string } };
export type TamanoBuscador = { nombre: string; medidas: string };

const RELLENO = new Set(
  "a al algo algun alguna ante bien buen buena buenas buenos cada como con cual cuales de del dia donde e el ella en es esa ese eso esta estan este esto fue ha hay hola la las le les lo los mas me mi mis muy necesito ni no nos o oye para pero por porfa porfavor pregunta puede pueden puedo que quiero se sea ser si sin sobre son su sus tal tambien te tenga tengo ti tiene tienen todo tu tus un una unas uno unos usted ustedes y ya favor gracias saber quisiera".split(
    " ",
  ),
);

// Cada tema con las palabras (ya limpias, sin acentos) que lo dicen. Las que terminan en «*» cuentan como inicio.
const TEMAS: Record<string, string[]> = {
  precio: ["precio*", "cuest*", "costo*", "cost*", "vale", "valen", "pesos", "barat*", "caro", "cara", "descuento*", "oferta*"],
  envio: ["envi*", "mand*", "llega*", "llegar", "paqueteria", "entrega*", "flete", "domicilio", "ciudad", "estado", "monterrey", "guadalajara", "cdmx", "veracruz", "tabasco", "sinaloa", "yucatan", "merida", "cancun", "acapulco", "tampico", "villahermosa", "reciba", "recibo", "recibir"],
  tiempo: ["tard*", "dias", "cuando", "demor*", "tiempo", "rapid*", "pronto", "semana*", "hora*"],
  medida: ["medida*", "mide", "miden", "medir", "ancho*", "anchura", "tamano*", "talla*", "cm", "centimetro*", "metro*", "mts", "queda", "quedara", "cabe", "angost*", "chica", "chico", "grande"],
  amedida: ["especial", "xxl", "porton*", "cochera*", "garage", "garaje", "zaguan", "bodega", "ancha", "anchas", "amplia*", "doble", "fabrican"],
  altura: ["altura", "alta", "altas", "alto", "altos", "nivel", "sube", "subir", "baja", "bajas", "bajo", "mini"],
  instalar: ["instal*", "coloc*", "poner", "pongo", "pone", "armar", "arma", "perfor*", "taladr*", "obra", "albanil*", "herramienta*", "tornillo*", "pegar", "fij*", "quitar", "quito", "retir*", "permanente", "video"],
  agua: ["agua", "filtr*", "pasa", "pase", "sell*", "fuga*", "inund*", "lluvia*", "huracan*", "tormenta*", "funciona", "sirve", "aguanta", "detiene", "resiste"],
  material: ["material*", "acero", "hule", "neopreno", "hecha", "hecho", "fabricad*", "metal", "plastico", "lona", "durable", "resistente", "oxida", "aluminio"],
  chueco: ["chuec*", "desnivel*", "irregular*", "disparej*", "grieta*", "inclinad*", "torcid*", "piso", "marco*", "escalon*", "rampa"],
  garantia: ["garantia*", "devol*", "devuel*", "reembols*", "cambio", "cambiar", "regres*", "convence", "satisfech*", "defect*", "falla*"],
  pago: ["pag*", "tarjeta*", "meses", "msi", "paypal", "transferencia*", "deposito*", "efectivo", "oxxo", "credito", "debito", "mercado"],
  factura: ["factur*", "cfdi", "fiscal*", "rfc", "constancia"],
  incluye: ["incluye*", "trae", "traen", "viene", "vienen", "contiene", "partes", "piezas", "caja", "accesorio*", "llave"],
  fuera: ["extranjero", "usa", "unidos", "eu", "eua", "internacional*", "fuera", "pais", "guatemala", "canada"],
  tienda: ["tienda*", "fisica", "oficina*", "recoger", "recojo", "sucursal*", "ubica*", "direccion", "visitar", "local"],
  cancelar: ["cancel*", "modific*", "pedido*", "orden", "compre", "equivoque"],
  durar: ["dura", "duran", "durar", "vida", "util", "reutiliz*", "veces", "anos"],
  repuesto: ["repuesto*", "refaccion*", "funda", "tira", "plastilina", "reponer", "nueva", "nuevo"],
  coladera: ["coladera*", "desague*", "drenaje", "tapon*", "registro", "alcantarilla", "regadera", "bano"],
  contacto: ["whatsapp", "telefono*", "numero", "llamar", "llamo", "correo", "email", "contacto", "hablar", "asesor*", "persona"],
  cuantas: ["cuantas", "varias", "dos", "tres", "puertas", "entradas"],
};
// Temas que casi toda pregunta trae: valen poco por sí solos.
const DEBILES = new Set(["medida", "tiempo"]);

const quitarAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** «¿Cuánto tardan en llegar a Mérida?» → ["cuanto", "tardan", "llegar", "merida"]. */
export function palabras(texto: string): string[] {
  return quitarAcentos(texto.toLowerCase())
    .replace(/[^a-z0-9ñ.,\s]/g, " ")
    .replace(/(\d)[.,](\d)/g, "$1.$2")
    .replace(/[,]/g, " ")
    .split(/\s+/)
    .map((p) => p.replace(/^\.+|\.+$/g, ""))
    .filter((p) => p && !RELLENO.has(p));
}

/** Raíz sencilla: «puertas» y «puerta» cuentan igual. */
const raiz = (p: string) => (p.length > 4 ? p.replace(/(es|s)$/, "") : p);

function parecidas(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  // Una letra de diferencia (cambiada, de más o de menos).
  let i = 0;
  let j = 0;
  let dif = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++dif > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return dif + (a.length - i) + (b.length - j) <= 1;
}

function temaDe(p: string): string | null {
  // Primero lo exacto (o el inicio de la palabra) en todos los temas; solo si nada coincide, con una falta de letra.
  for (const [tema, lista] of Object.entries(TEMAS)) {
    for (const w of lista) if (w.endsWith("*") ? p.startsWith(w.slice(0, -1)) : p === w) return tema;
  }
  if (p.length < 5) return null;
  for (const [tema, lista] of Object.entries(TEMAS)) {
    for (const w of lista) {
      const base = w.endsWith("*") ? w.slice(0, -1) : w;
      if (base.length >= 5 && (parecidas(p, base) || (w.endsWith("*") && parecidas(p.slice(0, base.length + 1), base)))) return tema;
    }
  }
  return null;
}

type Indice = { entrada: EntradaBanco; temas: Set<string>; raices: string[] };

export function indexar(banco: EntradaBanco[]): Indice[] {
  return banco.map((entrada) => {
    const ps = palabras(`${entrada.pregunta} ${entrada.claves ?? ""}`);
    return { entrada, temas: new Set(ps.map(temaDe).filter((t): t is string => Boolean(t))), raices: ps.map(raiz) };
  });
}

/** Las mejores respuestas (hasta 3) para lo que escribió; vacío si ninguna se parece lo suficiente. */
export function buscar(indice: Indice[], texto: string): EntradaBanco[] {
  const ps = palabras(texto);
  if (!ps.length) return [];
  const temas = new Set(ps.map(temaDe).filter((t): t is string => Boolean(t)));
  const raices = ps.map(raiz);
  const puntos = indice.map((x) => {
    let p = 0;
    let fuerte = false;
    for (const t of temas) {
      if (!x.temas.has(t)) continue;
      p += DEBILES.has(t) ? 0.6 : 2;
      if (!DEBILES.has(t)) fuerte = true;
    }
    for (const r of raices) {
      if (r.length < 3) continue;
      // Palabra igual; con una letra de diferencia solo en palabras largas (para que «Mérida» no sea «medida»).
      if (x.raices.some((y) => y === r || (r.length >= 7 && parecidas(r, y)))) {
        p += 1;
        if (r.length >= 5) fuerte = true;
      }
    }
    return { x, p: fuerte ? p : 0 };
  });
  const mejores = puntos.filter((y) => y.p >= 2).sort((a, b) => b.p - a.p);
  if (!mejores.length) return [];
  // Solo las que están cerca de la mejor (para no mostrar respuestas que no tienen que ver).
  return mejores
    .filter((y) => y.p >= mejores[0].p * 0.6)
    .slice(0, 3)
    .map((y) => y.x.entrada);
}

/** Si escribió una medida («95 cm», «1.20 m», «mide 1.30», «mide 130»), su ancho en cm; si no, null. */
export function medidaEscrita(texto: string): number | null {
  const t = quitarAcentos(texto.toLowerCase()).replace(/(\d),(\d)/g, "$1.$2");
  // No es el ancho: la altura del agua o de la compuerta.
  if (/agua|altura|alto|alta/.test(t)) return null;
  const m = t.match(/(\d+(?:\.\d+)?)\s*(cm|cms|centimetros?|m|mt|mts|metros?)?(?![a-z0-9])/);
  if (!m) return null;
  const n = Number(m[1]);
  const unidad = m[2] ?? "";
  // Sin unidad, solo si habla de medir (para no tomar un código postal o una cantidad como medida).
  if (!unidad && !/mide|medida|ancho|puerta|entrada|porton|cochera/.test(t)) return null;
  const cm = /^m/.test(unidad) || (!unidad && n < 10) ? n * 100 : n;
  return cm >= 30 && cm <= 600 ? Math.round(cm) : null;
}

const RANGO = /(\d+)\s*[–-]\s*(\d+)/;

/** Qué tamaño le queda a una entrada de «cm» de ancho (los rangos van seguidos: 78.5 cm todavía es el primero). */
export function tamanoPara(cm: number, tamanos: TamanoBuscador[]): { tamano: TamanoBuscador } | { fuera: "chica" | "grande" } {
  const rangos = tamanos
    .map((t) => ({ t, m: t.medidas.match(RANGO) }))
    .filter((x): x is { t: TamanoBuscador; m: RegExpMatchArray } => Boolean(x.m))
    .map((x) => ({ t: x.t, desde: Number(x.m[1]), hasta: Number(x.m[2]) }));
  if (!rangos.length || cm < rangos[0].desde) return { fuera: "chica" };
  for (const r of rangos) if (cm < r.hasta + 1) return { tamano: r.t };
  return { fuera: "grande" };
}
