// «c-contacto» y «d-contacto»: las formas de contacto y el formulario (página Contacto de C y D). Cada canal es una pieza
// «channel» con su ícono (whatsapp, telefono, correo, ubicacion u horario), título, texto y enlace. El formulario hace lo
// mismo que el de la tienda de hoy (FormularioVersion), con campos y botón grandes.
// C: los canales como renglones grandes a todo lo ancho (WhatsApp verde), y abajo el formulario.
// D: los canales en tarjetas de dos en dos y el formulario en una tarjeta con su franja azul arriba.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp, esWhatsapp } from "../landing/piezas";
import { FormularioVersion } from "../landing/FormularioVersion";
import { Arriba, Raya, claseFondo, clasesFormulario, ESTILOS, Flecha, type Estilo } from "./estilo";

const TRAZOS: Record<string, string> = {
  telefono: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  correo: "M3 6h18v12H3zM3 7l9 6 9-6",
  ubicacion: "M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  horario: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
};

function IconoCanal({ nombre, className = "size-7" }: { nombre: string; className?: string }) {
  if (nombre === "whatsapp") return <IconoWhatsapp className={className} />;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={TRAZOS[nombre] ?? TRAZOS.correo} />
    </svg>
  );
}

export function ContactoCD({ seccion, estilo }: PropsSeccion & { estilo: Estilo }) {
  const a = seccion.ajustes;
  const e = ESTILOS[estilo];
  const d = estilo === "d";
  const canales = seccion.bloques.filter((b) => b.tipo === "channel");
  return (
    <section id="contacto" data-seccion={seccion.tipo} aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondo(estilo, texto(a, "fondo") || "blanco")} ${e.seccion}`}>
      <div className="marco-version grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
        <div>
          <Arriba estilo={estilo}>{texto(a, "subheading") ? formato(textoVersion(a, "subheading")) : null}</Arriba>
          <h2 id={`titulo-${seccion.id}`} className={e.h2}>
            {formato(textoVersion(a, "heading"))}
          </h2>
          <Raya estilo={estilo} />
          {texto(a, "text") && <p className={`m-0 mt-3 max-w-[38rem] ${e.texto}`}>{formato(textoVersion(a, "text"))}</p>}
          <ul className={`m-0 mt-7 grid list-none p-0 ${d ? "gap-4 sm:grid-cols-2" : "gap-3"}`}>
            {canales.map((b) => {
              const ba = b.ajustes;
              const enlace = texto(ba, "url");
              const icono = texto(ba, "icon");
              const wa = icono === "whatsapp";
              const contenido = (
                <>
                  <span className={`flex shrink-0 items-center justify-center rounded-full ${d ? "size-14" : "size-14"} ${wa ? "bg-[#e3f5e8] text-[#1a7f37]" : e.icono}`}>
                    <IconoCanal nombre={icono} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-titulo text-[20px] leading-tight font-semibold text-[#06182f]">{formato(textoVersion(ba, "heading"))}</span>
                    <span className={`mt-1 block text-[17px] leading-[1.45] break-words ${e.suave}`}>{formato(textoVersion(ba, "text"))}</span>
                  </span>
                  {enlace && !d && <Flecha className="size-6 shrink-0 text-[#06182f]" />}
                </>
              );
              const clase = `flex h-full gap-4 p-5 ${d ? "flex-col items-start" : "items-center"} ${wa && !d ? "rounded-3xl border-[2.5px] border-[#1a7f37] bg-white" : e.borde}`;
              return (
                <li key={b.id} data-pieza={b.id}>
                  {enlace ? (
                    <a
                      href={enlace}
                      {...(esWhatsapp(enlace) ? { "data-evento": "toca_whatsapp" } : {})}
                      {...(/^https?:/.test(enlace) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`${clase} transition-shadow hover:shadow-[0_16px_36px_-24px_rgba(12,30,51,0.6)]`}
                    >
                      {contenido}
                    </a>
                  ) : (
                    <div className={clase}>{contenido}</div>
                  )}
                </li>
              );
            })}
          </ul>
          {texto(a, "faq_link_text") && (
            <a href="#preguntas" className={`mt-6 inline-flex min-h-12 items-center gap-2 text-[18px] ${e.enlace}`}>
              {formato(textoVersion(a, "faq_link_text"))}
              <Flecha className="size-5 rotate-90" />
            </a>
          )}
        </div>
        <div className={`overflow-hidden ${e.tarjeta} ${d ? "" : "p-6 md:p-8"}`}>
          {d && (
            <p className="m-0 bg-[#0b2545] px-6 py-4 font-titulo text-[20px] font-semibold text-white">
              <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#ffc83d]" aria-hidden="true" />
              {formato(tx(a, "form_band", "Escríbenos"))}
            </p>
          )}
          <div className={d ? "p-6 md:p-8" : ""}>
            <h3 className="m-0 font-titulo text-[26px] leading-tight font-semibold text-[#06182f]">{formato(tx(a, "form_heading", "Contáctanos"))}</h3>
            {texto(a, "form_text") && <p className={`m-0 mt-2 mb-6 text-[17px] leading-[1.5] ${e.suave}`}>{formato(textoVersion(a, "form_text"))}</p>}
            <FormularioVersion
              prueba={process.env.SITIO_PRUEBA === "1"}
              clases={clasesFormulario(estilo)}
              textos={{
                nombre: tx(a, "name_label", "Tu nombre"),
                correo: tx(a, "email_label", "Tu correo"),
                mensaje: tx(a, "message_label", "Tu mensaje"),
                boton: tx(a, "button_label", "Enviar"),
                enviando: tx(a, "sending_text", "Enviando…"),
                gracias: tx(a, "thanks_text", "Gracias por escribirnos. Te contestamos lo antes posible."),
                faltan: tx(a, "required_text", "Por favor, llena los campos obligatorios"),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
