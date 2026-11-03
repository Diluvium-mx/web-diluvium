// Logos que corren sin parar (sección «scrolling-logos»: tiendas y marcas). Movimiento parejo hacia la izquierda,
// un logo cada 3 s, como en la tienda. Caben 2 logos (20 px entre ellos) en celular, 4 (40 px) desde 750 px y
// «desktop_slides_per_view» (20 px) desde 1025 px. Alto de 120 px; 140 px desde 751 px. Solo CSS.

import Image from "next/image";
import type { Seccion } from "@/lib/contenido";
import { bloquesDe, numero, siNo, texto } from "@/lib/contenido";
import { medidasImagen } from "./ImagenBanner";

const COPIAS = 2;
const SEGUNDOS_POR_LOGO = 3;

export function LogosDesplazables({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const logos = bloquesDe(seccion, "logo")
    .map((b) => ({ id: b.id, src: texto(b.ajustes, "image") }))
    .filter((l) => l.src);
  if (logos.length === 0) return <div data-seccion="scrolling-logos" />;
  const n = logos.length;
  const porVista = numero(a, "desktop_slides_per_view", 7);
  const reversa = siNo(a, "reverse_direction");
  const estilo = {
    "--por-vista-compu": porVista,
    backgroundColor: texto(a, "background_color") || "#eaeef1",
  } as React.CSSProperties;

  return (
    <section style={estilo} data-seccion="scrolling-logos">
      <div className="overflow-hidden [container-type:inline-size] [--hueco-logos:20px] [--por-vista:2] min-[750px]:[--hueco-logos:40px] min-[750px]:[--por-vista:4] min-[1025px]:[--hueco-logos:20px] min-[1025px]:[--por-vista:var(--por-vista-compu)]">
        <div
          className="flex h-[120px] w-max [--ancho-logo:calc((100cqw_-_var(--hueco-logos)_*_(var(--por-vista)_-_1))_/_var(--por-vista))] min-[751px]:h-[140px] motion-reduce:animate-none!"
          style={{
            animation: `logos-corren ${n * SEGUNDOS_POR_LOGO}s linear infinite${reversa ? " reverse" : ""}`,
            "--vuelta": `calc((var(--ancho-logo) + var(--hueco-logos)) * -${n})`,
          } as React.CSSProperties}
        >
          {Array.from({ length: COPIAS }, (_, copia) =>
            logos.map((l) => {
              const m = medidasImagen(l.src);
              return (
                <div
                  key={`${copia}-${l.id}`}
                  className="mr-[var(--hueco-logos)] flex h-full w-[var(--ancho-logo)] shrink-0 items-center justify-center"
                  aria-hidden={copia > 0 || undefined}
                >
                  <Image
                    src={l.src}
                    alt=""
                    width={m.ancho}
                    height={m.alto}
                    sizes="170px"
                    className="h-full w-auto max-w-full object-contain"
                  />
                </div>
              );
            }),
          )}
        </div>
      </div>
      <style>{"@keyframes logos-corren{from{transform:translateX(0)}to{transform:translateX(var(--vuelta))}}"}</style>
    </section>
  );
}
