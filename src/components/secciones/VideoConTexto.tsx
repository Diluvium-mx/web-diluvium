// Video con texto (sección «video-with-text»): bloque de texto junto a un video de YouTube. Primero se ve la portada
// con el botón de reproducir; al darle clic se cambia por el reproductor de YouTube, que arranca solo y sin sonido
// (como en la tienda). Se arma con <details> para no mandar JavaScript: el reproductor está dentro y, como es
// diferido, el navegador no lo baja hasta que se abre.

import Image from "next/image";
import type { Seccion } from "@/lib/contenido";
import { esquema, numero, siNo, texto } from "@/lib/contenido";
import { BloqueTexto, ordenDeContenido } from "./CollageImagenTexto";

/** Saca el identificador del video de un enlace de YouTube (watch?v=…, youtu.be/…, /embed/…, /shorts/…). */
function idYoutube(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function IconoReproducir({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path d="M9.6 18.2 7.8 19.3V4.7L19.2 12l-7.5 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

// Botón cuadrado blanco con filo azul tenue; al pasar el mouse por la portada se llena de azul desde arriba.
const BOTON_REPRODUCIR =
  "relative isolate inline-flex h-10 w-10 items-center justify-center overflow-hidden bg-white text-azul " +
  "shadow-[inset_0_0_0_1px_rgba(10,85,154,0.12)] transition-colors duration-[400ms] after:absolute after:inset-x-0 " +
  "after:top-0 after:bottom-full after:-z-10 after:bg-azul after:transition-[bottom] after:duration-[400ms] " +
  "after:ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:text-white group-hover:after:bottom-0 " +
  "group-focus-visible:text-white group-focus-visible:after:bottom-0 min-[1025px]:h-11 min-[1025px]:w-11";

export function VideoConTexto({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const url = texto(a, "video");
  const id = idYoutube(url);
  const portada = texto(a, "video_thumbnail");
  const proporcion = (texto(a, "video_ratio") || "16/9").replace("/", " / ");
  const anchoVideo = numero(a, "video_with", 8.4) / 12;
  const parametros = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0" });
  if (siNo(a, "enable_video_mute") || !siNo(a, "enable_autoplay")) parametros.set("mute", "1");
  if (siNo(a, "enable_video_loop") && id) {
    parametros.set("loop", "1");
    parametros.set("playlist", id);
  }
  const estilo = { "--ancho-video": anchoVideo, "--proporcion": proporcion } as React.CSSProperties;

  return (
    <section className={esquema(a)} data-seccion="video-with-text">
      <div className="contenedor py-[var(--aire)]">
        <div className={`flex justify-center gap-[var(--hueco)] min-[1025px]:gap-[28.8px] ${ordenDeContenido(seccion)}`} style={estilo}>
          <BloqueTexto bloques={seccion.bloques} className="min-w-0 min-[1025px]:flex-1" />
          <div className="min-w-0 shrink-0 min-[1025px]:w-[calc((100%_-_28.8px)_*_var(--ancho-video))]">
            <details className="group/video relative block aspect-[var(--proporcion)] overflow-hidden rounded-2xl bg-black md:rounded-3xl min-[1025px]:rounded-[32px]">
              <summary
                className="group absolute inset-0 block cursor-pointer list-none overflow-hidden bg-[#efefef] group-open/video:hidden [&::-webkit-details-marker]:hidden"
                aria-label="Reproducir video"
              >
                {portada && (
                  <Image
                    src={portada}
                    alt=""
                    fill
                    sizes="(min-width: 1025px) 62vw, 100vw"
                    className="object-cover transition-transform duration-150 group-hover:scale-110"
                  />
                )}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className={BOTON_REPRODUCIR}>
                    <IconoReproducir className="h-5 w-5 min-[1025px]:h-6 min-[1025px]:w-6" />
                  </span>
                </span>
              </summary>
              {id && (
                <iframe
                  src={`https://www.youtube.com/embed/${id}?${parametros.toString()}`}
                  title="Video de YouTube"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
