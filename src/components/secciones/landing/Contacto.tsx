// Sección «landing-contacto»: las formas de contacto de Diluvium (página Contacto de B1). A la izquierda (arriba en el
// celular) cada canal en su tarjeta, que se toca para escribir, llamar o ver el mapa; a la derecha el formulario, que
// hace lo mismo que el de la tienda de hoy (FormularioVersion). Los canales son piezas «channel» con su ícono
// (whatsapp, telefono, correo, ubicacion u horario), título, texto y enlace.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { textoVersion, tx } from "./datos";
import { formato } from "./formato";
import { claseFondo, fondoPropio } from "./Olas";
import { IconoFlecha, IconoWhatsapp, esWhatsapp } from "./piezas";
import { FormularioVersion } from "./FormularioVersion";

const TRAZOS: Record<string, string> = {
  telefono: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  correo: "M3 6h18v12H3zM3 7l9 6 9-6",
  ubicacion: "M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  horario: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
};

function IconoCanal({ nombre }: { nombre: string }) {
  if (nombre === "whatsapp") return <IconoWhatsapp className="size-6" />;
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={TRAZOS[nombre] ?? TRAZOS.correo} />
    </svg>
  );
}

export function ContactoVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = fondoPropio(a, "niebla");
  const canales = seccion.bloques.filter((b) => b.tipo === "channel");
  return (
    <section id="contacto" data-seccion="landing-contacto" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondo(fondo)} py-14 md:py-20`}>
      <div className="marco-version grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
        <div>
          <h2 id={`titulo-${seccion.id}`} className="titulo-version m-0 max-w-[36rem] text-[28px] md:text-[38px]">
            {formato(textoVersion(a, "heading"))}
          </h2>
          {texto(a, "text") && <p className="m-0 mt-3 max-w-[36rem] text-[17px] leading-[1.55] text-tinta">{formato(textoVersion(a, "text"))}</p>}
          <ul className="m-0 mt-7 grid list-none gap-3 p-0 sm:grid-cols-2">
            {canales.map((b) => {
              const ba = b.ajustes;
              const enlace = texto(ba, "url");
              const icono = texto(ba, "icon");
              const contenido = (
                <>
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-full ${icono === "whatsapp" ? "bg-[#e7f6ec] text-[#1a7f37]" : "bg-niebla text-marino"}`}
                  >
                    <IconoCanal nombre={icono} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-titulo text-[18px] leading-tight font-medium">{formato(textoVersion(ba, "heading"))}</span>
                    <span className="mt-1 block text-[15.5px] leading-[1.45] break-words text-texto-suave">{formato(textoVersion(ba, "text"))}</span>
                  </span>
                </>
              );
              const clase = "flex h-full items-start gap-4 rounded-2xl bg-white p-5 text-marino ring-1 ring-linea";
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
            <a href="#preguntas" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-2 underline-offset-4 hover:decoration-4">
              {formato(textoVersion(a, "faq_link_text"))}
              <IconoFlecha className="size-[18px] rotate-90" />
            </a>
          )}
        </div>
        <div className="rounded-3xl bg-white p-6 text-marino shadow-[0_24px_60px_-34px_rgba(12,30,51,0.55)] ring-1 ring-linea md:p-8">
          <h3 className="m-0 font-titulo text-[24px] leading-tight font-medium">{formato(tx(a, "form_heading", "Contáctanos"))}</h3>
          {texto(a, "form_text") && <p className="m-0 mt-2 mb-6 text-[16px] leading-[1.5] text-texto-suave">{formato(textoVersion(a, "form_text"))}</p>}
          <FormularioVersion
            textos={{
              nombre: tx(a, "name_label", "Tu nombre"),
              correo: tx(a, "email_label", "Tu correo"),
              mensaje: tx(a, "message_label", "Tu mensaje"),
              boton: tx(a, "button_label", "Enviar"),
              enviando: tx(a, "sending_text", "Enviando…"),
              gracias: tx(a, "thanks_text", "Gracias por contactarnos. Nos pondremos en contacto con usted lo antes posible."),
              faltan: tx(a, "required_text", "Por favor, rellena campos obligatorios"),
            }}
          />
        </div>
      </div>
    </section>
  );
}
