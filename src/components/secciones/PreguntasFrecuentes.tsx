// Preguntas frecuentes (sección «faqs»; en vivo se llama «Contact Form Section»): título centrado y una lista de
// preguntas que se abren y cierran. Con «one_item_expand» abrir una cierra la anterior; «open_first_item» deja la
// primera abierta. El formulario de contacto opcional («enable_contact_form») está apagado en todas las plantillas.

import type { PropsSeccion } from "./registro";
import { esquema, siNo, texto } from "@/lib/contenido";
import { limpiarHtml, Titulo } from "@/components/comunes/Texto";
import { clasesAire } from "./aire";
import { Acordeon } from "./PreguntasFrecuentesAcordeon";

const TAMANOS: Record<string, string> = {
  h1: "text-[length:var(--h1)]!",
  h2: "text-[length:var(--h2)]!",
  h3: "text-[length:var(--h3)]!",
};

export function PreguntasFrecuentes({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const preguntas = seccion.bloques
    .filter((b) => b.tipo === "faq_item")
    .map((b) => ({
      id: b.id,
      pregunta: texto(b.ajustes, "heading_faq_item"),
      respuestaHtml: limpiarHtml(texto(b.ajustes, "description_faq_item")),
    }))
    .filter((p) => p.pregunta);
  const titulo = texto(a, "heading_text");
  const subtitulo = texto(a, "subheading");
  const descripcion = texto(a, "description_text");

  return (
    <section className={esquema(a)} data-seccion="faqs">
      <div className={`contenedor grid gap-[var(--hueco)] ${clasesAire(seccion, producto)}`}>
        {(titulo || subtitulo || descripcion) && (
          <div className="flex flex-col items-center text-center">
            {subtitulo && <div className="mb-3 font-titulo text-[19.2px] leading-6 font-medium">{subtitulo}</div>}
            <Titulo texto={titulo} className={`break-words ${TAMANOS[texto(a, "heading_size")] ?? TAMANOS.h2}`} />
            {descripcion && <div className="mt-6 max-w-[650px]">{descripcion}</div>}
          </div>
        )}
        <Acordeon preguntas={preguntas} unaALaVez={siNo(a, "one_item_expand")} primeraAbierta={siNo(a, "open_first_item")} />
      </div>
    </section>
  );
}
