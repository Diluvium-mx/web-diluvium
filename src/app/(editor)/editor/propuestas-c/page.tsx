import { headers } from "next/headers";
import { notFound } from "next/navigation";
import resenas from "@contenido/resenas.json";
import productos from "@contenido/productos.json";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { PropuestasC, type DatosPropuestas } from "./PropuestasC";

// Propuestas para la versión C (dueño, 24-nov-2026): partes completamente nuevas, que no están en la tienda de hoy (A)
// ni en B1. Solo en esta Mac: http://localhost:3100/editor/propuestas-c. Usan datos reales: precios y fotos del
// catálogo y los estados que mencionan las reseñas publicadas.

export const dynamic = "force-dynamic";

// Palabras de cada estado que aparecen en las reseñas publicadas (ciudades y nombres del estado).
const ESTADOS: Record<string, string[]> = {
  VER: ["veracruz", "coatzacoalcos", "xalapa", "boca del río", "poza rica", "tuxpan"],
  NL: ["monterrey", "nuevo león", "nuevo leon", "apodaca", "san nicolás"],
  TAB: ["tabasco", "villahermosa"],
  CDMX: ["cdmx", "ciudad de méxico", "ciudad de mexico"],
  YUC: ["mérida", "merida", "yucatán", "yucatan"],
  SIN: ["mazatlán", "mazatlan", "culiacán", "culiacan", "los mochis", "sinaloa"],
  GRO: ["acapulco", "guerrero"],
  SON: ["hermosillo", "sonora", "obregón", "guaymas"],
  JAL: ["guadalajara", "zapopan", "jalisco"],
  TAMPS: ["tampico", "reynosa", "matamoros", "tamaulipas", "madero"],
  QROO: ["cancún", "cancun", "playa del carmen", "chetumal"],
  CAMP: ["campeche", "ciudad del carmen"],
  CHIS: ["tuxtla", "tapachula", "chiapas"],
  OAX: ["oaxaca"],
  PUE: ["puebla"],
  MEX: ["ecatepec", "naucalpan", "toluca", "estado de méxico"],
};

type Resena = { nombre: string; calificacion: number | string; texto: string };

function porEstado() {
  const lista = (resenas.pagina as Resena[]).filter((r) => Number(r.calificacion) >= 4);
  const salida: Record<string, { n: number; cita: string; nombre: string }> = {};
  for (const r of lista) {
    const t = ` ${r.texto.toLowerCase()} `;
    for (const [estado, palabras] of Object.entries(ESTADOS)) {
      if (!palabras.some((p) => new RegExp(`\\b${p}\\b`).test(t))) continue;
      const e = (salida[estado] ??= { n: 0, cita: "", nombre: "" });
      e.n += 1;
      // La cita más corta que se entiende sola.
      if (!e.cita || (r.texto.length < e.cita.length && r.texto.length > 40)) {
        e.cita = r.texto.trim();
        e.nombre = r.nombre;
      }
    }
  }
  return salida;
}

export default async function PaginaPropuestasC() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  type P = { nombre: string; titulo: string; variantes: { precio: number }[]; imagenes: { src: string }[] };
  const catalogo = Object.fromEntries(
    (productos.productos as P[]).map((p) => [p.nombre, { titulo: p.titulo, precio: Math.min(...p.variantes.map((v) => v.precio)), imagen: p.imagenes[0]?.src ?? "" }]),
  );
  const datos: DatosPropuestas = { catalogo, estados: porEstado(), totalResenas: resenas.pagina.length };
  return <PropuestasC datos={datos} />;
}
