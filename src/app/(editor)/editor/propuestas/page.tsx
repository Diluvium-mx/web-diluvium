import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { Comparador } from "@/components/secciones/landing/Comparador";
import { COLOR, Ola, type Fondo, type FormaOla } from "@/components/secciones/landing/Olas";

// Propuestas para que el dueño elija (editor local; solo en esta Mac: http://localhost:3100/editor/propuestas).
// 23-nov-2026 (tercera tanda):
//   - Foto de antes y después del producto (B1-P2): la de hoy contra la nueva, hecha en Arcads con las fotos reales.
//   - Olas entre partes: 9 diseños con su fondo y cómo se verían al bajar por el producto y la portada (dueño: «si no se
//     distingue un cambio, ese diseño de la ola, como es repetible, no transmite ninguna diferencia»).
// Ya elegidos y puestos antes: pasos clave A, botones 217/224 diseño 1, carrito 2, barra del video 2 y preguntas 1.

export const dynamic = "force-dynamic";

const DISENOS: { n: number; forma: FormaOla; nombre: string; idea: string; abajo: Fondo }[] = [
  { n: 1, forma: "corta", nombre: "Ola doble", idea: "La de la tienda de hoy: dos olas y media con la línea azul.", abajo: "niebla" },
  { n: 2, forma: "larga", nombre: "Ola larga", idea: "La de la tienda de hoy: una sola ola que sube a la derecha.", abajo: "niebla" },
  { n: 3, forma: "capas", nombre: "Marea en capas", idea: "Dos olas encimadas, la de atrás en azul muy claro. Sin línea.", abajo: "niebla" },
  { n: 4, forma: "rizos", nombre: "Olas pequeñas", idea: "Doce rizos iguales, como el agua que empieza a subir.", abajo: "niebla" },
  { n: 5, forma: "curva", nombre: "Colina", idea: "Una sola curva amplia que sube al centro. Sin línea.", abajo: "niebla" },
  { n: 6, forma: "inclinada", nombre: "Pendiente", idea: "Baja suave de izquierda a derecha, como el agua que escurre.", abajo: "niebla" },
  { n: 7, forma: "espuma", nombre: "Ola con espuma", idea: "Tres olas con una segunda línea fina encima.", abajo: "niebla" },
  { n: 8, forma: "lluvia", nombre: "Gotas", idea: "Una ola larga con tres gotas que caen sobre ella.", abajo: "niebla" },
  { n: 9, forma: "pie", nombre: "Ola del pie", idea: "La de la tienda de hoy, con su filo gris: siempre antes del cierre azul.", abajo: "marino" },
];

const NOMBRE_FONDO: Record<Fondo, string> = { blanco: "blanco", niebla: "gris claro", cielo: "azul claro", marino: "azul marino" };
const NUMERO = Object.fromEntries(DISENOS.map((d) => [d.forma, d.n])) as Record<FormaOla, number>;

const PARTES_PRODUCTO = ["Ficha · P2", "Reseñas · P3", "Antes y después · P4", "3 pasos clave · P5", "Preguntas · P6", "Cierre · P7"];
const PARTES_PORTADA = ["Portada · I2", "Reseñas · I3", "Lo de siempre contra Diluvium · I4", "Beneficios · I5", "3 pasos clave · I6", "Preguntas · I7", "Cierre · I8"];

const COMBINACIONES: { titulo: string; partes: string[]; fondos: Fondo[]; olas: FormaOla[] }[] = [
  { titulo: "Producto A", partes: PARTES_PRODUCTO, fondos: ["blanco", "niebla", "blanco", "niebla", "blanco", "marino"], olas: ["capas", "corta", "rizos", "larga", "pie"] },
  { titulo: "Producto B", partes: PARTES_PRODUCTO, fondos: ["blanco", "cielo", "blanco", "niebla", "blanco", "marino"], olas: ["curva", "espuma", "inclinada", "larga", "pie"] },
  {
    titulo: "Portada A",
    partes: PARTES_PORTADA,
    fondos: ["blanco", "niebla", "blanco", "niebla", "blanco", "niebla", "marino"],
    olas: ["capas", "corta", "rizos", "inclinada", "larga", "pie"],
  },
  {
    titulo: "Portada B",
    partes: PARTES_PORTADA,
    fondos: ["blanco", "cielo", "blanco", "niebla", "blanco", "cielo", "marino"],
    olas: ["curva", "espuma", "lluvia", "inclinada", "larga", "pie"],
  },
];

const FOTOS = [
  {
    titulo: "Hoy",
    idea: "La puerta queda a la izquierda: con la línea al centro, casi toda la compuerta se esconde detrás del «antes».",
    antes: "/media/files/Antes_2.jpg",
    despues: "/media/files/Despues_2.jpg",
  },
  {
    titulo: "Nueva (Arcads con las fotos reales)",
    idea:
      "Las mismas dos fotos reales de esa entrada, con la vista ampliada hacia la izquierda en Arcads para que la puerta quede al centro. La compuerta, el logo, la puerta y los costales son los de las fotos reales; Arcads solo hizo la franja de la izquierda (la ventana y la orilla de los costales).",
    antes: "/media/files/Antes_producto_b1.jpg",
    despues: "/media/files/Despues_producto_b1.jpg",
    // Encuadre que llevaría en la ficha: un poco más abajo, para que se vean los costales completos.
    foco: "50% 75%",
  },
] as { titulo: string; idea: string; antes: string; despues: string; foco?: string }[];

function Bloque({ nombre, fondo }: { nombre: string; fondo: Fondo }) {
  const oscuro = fondo === "marino";
  return (
    <div className={`px-4 py-5 ${oscuro ? "text-white" : "text-marino"}`} style={{ background: COLOR[fondo] }}>
      <p className="m-0 font-titulo text-[15px] font-medium">{nombre}</p>
      <div className="mt-2 h-2 w-3/4 rounded-full bg-current opacity-15" />
      <div className="mt-1.5 h-2 w-1/2 rounded-full bg-current opacity-15" />
      <p className={`m-0 mt-2 text-[11.5px] ${oscuro ? "text-white/75" : "text-texto-suave"}`}>Fondo {NOMBRE_FONDO[fondo]}</p>
    </div>
  );
}

export default async function Propuestas() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();

  return (
    <main className="version min-h-dvh bg-[#e9edf2] px-6 py-8 text-marino">
      <h1 className="titulo-version m-0 text-[30px]">Propuestas para elegir</h1>
      <p className="m-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-tinta">
        Dime cuál de cada una, por ejemplo «Foto nueva» y «Olas: Producto A y Portada B». También puedes armar la tuya con los números: «P2 a P3 la 5».
      </p>

      <section aria-labelledby="t-fotos" className="mt-10">
        <h2 id="t-fotos" className="titulo-version m-0 text-[24px]">
          Antes y después del producto (B1-P2)
        </h2>
        <p className="m-0 mt-1 mb-5 max-w-3xl text-[15px] text-tinta">
          Se ven del tamaño del celular, con la línea al centro, como queda quieta. Puedes arrastrarla para comparar.
        </p>
        <div className="flex flex-wrap items-start gap-8">
          {FOTOS.map((f) => (
            <figure key={f.titulo} className="m-0 w-[375px]">
              <figcaption className="mb-2 min-h-[120px]">
                <strong className="block font-titulo text-[19px] font-medium">{f.titulo}</strong>
                <span className="text-[14px] text-tinta">{f.idea}</span>
              </figcaption>
              <Comparador
                antes={{ src: f.antes, alt: "Antes: entrada con costales", etiqueta: "Antes: costales", estilo: f.foco ? { objectPosition: f.foco } : undefined }}
                despues={{ src: f.despues, alt: "Después: la misma entrada con la compuerta Diluvium", etiqueta: "Después: Diluvium", estilo: f.foco ? { objectPosition: f.foco } : undefined }}
                sizes="375px"
                forma="aspect-[4/3] rounded-2xl"
              />
            </figure>
          ))}
        </div>
      </section>

      <section aria-labelledby="t-olas" className="mt-14">
        <h2 id="t-olas" className="titulo-version m-0 text-[24px]">
          Olas entre las partes: 9 diseños
        </h2>
        <p className="m-0 mt-1 mb-5 max-w-3xl text-[15px] text-tinta">
          Cada ola separa dos fondos distintos (ya no hay olas sobre el mismo color), así se nota el cambio de parte. La 1, la 2 y la 9 son las de la tienda de hoy.
        </p>
        <div className="grid max-w-[1200px] grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
          {DISENOS.map((d) => (
            <figure key={d.forma} className="m-0 overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-24px_rgba(12,30,51,0.45)]">
              <figcaption className="px-4 pt-3 pb-2">
                <strong className="font-titulo text-[18px] font-medium">
                  {d.n} · {d.nombre}
                </strong>
                <span className="block text-[13.5px] text-tinta">{d.idea}</span>
              </figcaption>
              <div className="h-14 bg-white" />
              <Ola arriba="blanco" abajo={d.abajo} forma={d.forma} />
              <div className="h-14" style={{ background: COLOR[d.abajo] }} />
            </figure>
          ))}
        </div>
      </section>

      <section aria-labelledby="t-bajando" className="mt-14">
        <h2 id="t-bajando" className="titulo-version m-0 text-[24px]">
          Cómo se vería al bajar (celular)
        </h2>
        <p className="m-0 mt-1 mb-5 max-w-3xl text-[15px] text-tinta">
          Cada parte con su fondo y, entre cada dos, una ola distinta. En las cuatro se quedan como hoy la ola larga antes de las preguntas y la del pie antes del cierre.
        </p>
        <div className="flex flex-wrap items-start gap-8">
          {COMBINACIONES.map((c) => (
            <figure key={c.titulo} className="m-0 w-[300px]">
              <figcaption className="mb-2">
                <strong className="font-titulo text-[19px] font-medium">{c.titulo}</strong>
                <span className="block text-[13px] text-tinta">Olas: {c.olas.map((o) => NUMERO[o]).join(" · ")}</span>
              </figcaption>
              <div className="overflow-hidden rounded-[28px] border-[6px] border-tinta bg-white shadow-[0_20px_50px_-20px_rgba(12,30,51,0.5)]">
                {c.partes.map((p, i) => (
                  <div key={p}>
                    {i > 0 && <Ola arriba={c.fondos[i - 1]} abajo={c.fondos[i]} forma={c.olas[i - 1]} />}
                    <Bloque nombre={p} fondo={c.fondos[i]} />
                  </div>
                ))}
              </div>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
