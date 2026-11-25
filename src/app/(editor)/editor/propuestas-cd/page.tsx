import { headers } from "next/headers";
import { notFound } from "next/navigation";
import resenas from "@contenido/resenas.json";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { datosVenta } from "@/components/secciones/landing/datos";
import { PropuestasCD, type ResenaP } from "./PropuestasCD";

// Propuestas para C y D (dueño, 25-nov-2026): cómo elegir el tamaño sin escribir la medida (eso quedó solo para B) y
// cómo mostrar muchas reseñas (tres a la vez no sirve: hay 237). Solo en esta Mac: /editor/propuestas-cd.

export const dynamic = "force-dynamic";

const TEMAS: [string, RegExp][] = [
  ["Fácil de poner", /(f[aá]cil|sencill|se (pone|coloca|instala)|instalaci[oó]n)/],
  ["Buena calidad", /(calidad|resistente|s[oó]lid|firme|reforzad|fuerte|durader)/],
  ["Llegó rápido", /(lleg[oó]|env[ií]o|entrega|r[aá]pido)/],
  ["Tranquilidad", /(tranquil|paz|duerm|dormir|preocup)/],
  ["No pasa el agua", /(no (pas[oó]|entr[oó]|se meti[oó]|entra|pasa)|ni una gota|sell[ao]|funciona|detiene|aguant)/],
  ["Buen servicio", /(atenci[oó]n|servicio|atendi|whatsapp|asesor|respond)/],
];
const ESTADOS: [string, RegExp][] = [
  ["Veracruz", /(veracruz|coatzacoalcos|xalapa|boca del r[ií]o)/],
  ["Nuevo León", /(monterrey|nuevo le[oó]n|apodaca)/],
  ["Tabasco", /(tabasco|villahermosa)/],
  ["CDMX", /(cdmx|ciudad de m[eé]xico)/],
  ["Yucatán", /(m[eé]rida|yucat[aá]n)/],
  ["Sinaloa", /(mazatl[aá]n|culiac[aá]n|mochis|sinaloa)/],
  ["Guerrero", /(acapulco|guerrero)/],
  ["Sonora", /(hermosillo|sonora)/],
  ["Jalisco", /(guadalajara|zapopan|jalisco)/],
  ["Tamaulipas", /(tampico|reynosa|tamaulipas)/],
];

export default async function PaginaPropuestasCD() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  type R = { nombre: string; calificacion: number | string; texto: string; fotos: string[] };
  const lista: ResenaP[] = (resenas.pagina as R[])
    .filter((r) => Number(r.calificacion) >= 2)
    .map((r, i) => {
      const t = r.texto.toLowerCase();
      return {
        id: i,
        nombre: r.nombre,
        texto: r.texto.trim(),
        estrellas: Number(r.calificacion),
        foto: r.fotos[0] ?? "",
        temas: TEMAS.filter(([, rx]) => rx.test(t)).map(([n]) => n),
        estado: ESTADOS.find(([, rx]) => rx.test(t))?.[0] ?? "",
      };
    });
  const venta = datosVenta();
  return <PropuestasCD resenas={lista} tamanos={venta?.tamanos ?? []} temas={TEMAS.map(([n]) => n)} estados={ESTADOS.map(([n]) => n)} />;
}
