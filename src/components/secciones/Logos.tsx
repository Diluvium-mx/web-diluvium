// Fila de logos con texto (sección «logos»: envíos, Shark Tank, premios). Corre sola hacia la izquierda: cada 3 s
// avanza un logo con un frenado suave, sin pausa, como el carrusel de la tienda. Caben 2.5 logos (60 px entre ellos)
// en celular y tableta, y 5 (40 px) desde 1025 px. Solo CSS: la pista repite los logos y la animación vuelve al
// inicio cuando ya avanzó una vuelta completa, así no se nota el corte.

import Image from "next/image";
import type { Seccion } from "@/lib/contenido";
import { bloquesDe, texto } from "@/lib/contenido";
import { TextoRico } from "@/components/comunes/Texto";
import { medidasImagen } from "./ImagenBanner";

const COPIAS = 3;
const SEGUNDOS_POR_LOGO = 3;

export function Logos({ seccion }: { seccion: Seccion }) {
  const logos = bloquesDe(seccion, "logo").filter((b) => texto(b.ajustes, "logo") || texto(b.ajustes, "logo_text"));
  if (logos.length === 0) return <div data-seccion="logos" />;
  const n = logos.length;
  const animacion = `logos-${seccion.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  // Un paso por logo; el frenado («ease-out») se aplica a cada tramo.
  const pasos = Array.from({ length: n + 1 }, (_, i) => `${((i / n) * 100).toFixed(4)}%{transform:translateX(calc(var(--paso) * -${i}))}`).join("");

  const tarjetas = (copia: number) =>
    logos.map((b) => {
      const src = texto(b.ajustes, "logo");
      const m = src ? medidasImagen(src) : null;
      return (
        <div key={`${copia}-${b.id}`} className="w-[var(--ancho-logo)] shrink-0 mr-[var(--hueco-logos)]" aria-hidden={copia > 0 || undefined}>
          {src && m && (
            <Image
              src={src}
              alt=""
              width={m.ancho}
              height={m.alto}
              sizes="(min-width: 1025px) 230px, 40vw"
              className="block h-auto max-h-[100px] w-full object-contain"
            />
          )}
          <TextoRico
            html={texto(b.ajustes, "logo_text")}
            className="text-center text-[16px] leading-[1.1] text-[#7e7e7e]"
          />
        </div>
      );
    });

  return (
    <section className="px-[var(--margen)] py-[var(--aire)]" data-seccion="logos">
      <style>{`@keyframes ${animacion}{${pasos}}`}</style>
      <div className="overflow-hidden [container-type:inline-size] [--hueco-logos:60px] [--por-vista:2.5] min-[1025px]:[--hueco-logos:40px] min-[1025px]:[--por-vista:5]">
        <div
          className="flex w-max [--ancho-logo:calc((100cqw_-_var(--hueco-logos)_*_(var(--por-vista)_-_1))_/_var(--por-vista))] [--paso:calc(var(--ancho-logo)_+_var(--hueco-logos))] motion-reduce:animate-none!"
          style={{ animation: `${animacion} ${n * SEGUNDOS_POR_LOGO}s ease-out infinite` }}
        >
          {Array.from({ length: COPIAS }, (_, i) => tarjetas(i))}
        </div>
      </div>
    </section>
  );
}
