// Preguntas frecuentes (sección «faqs»; en vivo se llama «Contact Form Section»): título y una lista de preguntas que
// se abren y cierran. Con «one_item_expand» abrir una cierra la anterior; «open_first_item» deja la primera abierta.
// Con «enable_contact_form» (página Contacto) va además el formulario de contacto en un recuadro: arriba en celular,
// a la izquierda desde tableta. El título se alinea según «heading_alignment_mobile» y «heading_alignment_desktop».

import type { PropsSeccion } from "./registro";
import { esquema, siNo, texto } from "@/lib/contenido";
import { limpiarHtml, TextoRico, Titulo } from "@/components/comunes/Texto";
import { clasesAire } from "./aire";
import { Acordeon } from "./PreguntasFrecuentesAcordeon";
import { FormularioContacto } from "./PreguntasFrecuentesFormulario";

const TAMANOS: Record<string, string> = {
  h1: "text-[length:var(--h1)]!",
  h2: "text-[length:var(--h2)]!",
  h3: "text-[length:var(--h3)]!",
  h4: "text-[length:var(--h4)]!",
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
  const conFormulario = siNo(a, "enable_contact_form");
  const izquierdaCel = (texto(a, "heading_alignment_mobile") || "ta-center").includes("ta-left");
  const izquierdaCompu = (texto(a, "heading_alignment_desktop") || "ta-center-md").includes("ta-left");
  const alinear = `${izquierdaCel ? "items-start text-left" : "items-center text-center"} ${
    izquierdaCompu ? "md:items-start md:text-left" : "md:items-center md:text-center"
  }`;
  const acordeon = (
    <Acordeon preguntas={preguntas} unaALaVez={siNo(a, "one_item_expand")} primeraAbierta={siNo(a, "open_first_item")} />
  );

  return (
    <section className={esquema(a)} data-seccion="faqs">
      <div className={`contenedor grid gap-[var(--hueco)] ${clasesAire(seccion, producto)}`}>
        {(titulo || subtitulo || descripcion) && (
          <div className={`flex flex-col ${alinear}`}>
            {subtitulo && <div className="mb-3 font-titulo text-[19.2px] leading-6 font-medium">{subtitulo}</div>}
            <Titulo texto={titulo} className={`break-words ${TAMANOS[texto(a, "heading_size")] ?? TAMANOS.h2}`} />
            {descripcion && <TextoRico html={descripcion} className="mt-[27px] max-w-[650px] md:mt-[28.8px]" />}
          </div>
        )}
        {conFormulario ? (
          <div className="flex flex-col-reverse gap-[var(--hueco)] md:flex-row-reverse">
            <div className="md:w-[calc((100%_-_var(--hueco))/2_-_9px)] md:shrink-0">{acordeon}</div>
            <div
              className="min-w-0 rounded-2xl border border-[rgba(10,85,154,0.12)] p-4 md:flex-1"
              style={{
                backgroundColor: texto(a, "color_custom_form_background") || "#ecf0f3",
                color: texto(a, "color_custom_form_content") || "#1c1c6b",
              }}
            >
              <div>
                <Titulo
                  texto={texto(a, "heading_contact_form")}
                  className={`mb-4! break-words md:mb-6! min-[1025px]:mb-8! ${TAMANOS[texto(a, "heading_size_contact_form")] ?? TAMANOS.h4}`}
                />
                <TextoRico html={texto(a, "description_contact_form")} className="mb-6 md:mb-9 min-[1025px]:mb-12" />
              </div>
              <FormularioContacto boton={texto(a, "button_label") || "Enviar"} />
            </div>
          </div>
        ) : (
          acordeon
        )}
      </div>
    </section>
  );
}
