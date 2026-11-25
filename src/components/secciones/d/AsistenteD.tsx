// Sección «d-asistente» (portada de D): «¿Qué tamaño necesito?». El asistente de 3 pasos (AsistenteDCliente) dentro de
// una tarjeta y, a un lado en la computadora, una foto de la compuerta puesta; abajo, la ayuda para medir por
// WhatsApp. Cada respuesta del paso 1 es una pieza «option»: ícono, texto, texto chico y el producto al que lleva
// (sus tamaños salen del catálogo) o, si va a otra página, su enlace.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { conMensaje, datosVenta, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { claseFondoD, EtiquetaD, TARJETA_D, TituloD } from "./comun";
import { AsistenteDCliente, type OpcionAsistente, type TextosAsistente } from "./AsistenteDCliente";

/** Los textos del asistente y de los botones de tamaño (también los usa la ficha de D). */
export function textosAsistente(a: Record<string, unknown>): TextosAsistente {
  return {
    paso: tx(a, "step_text", "Paso {n} de 3"),
    pregunta1: tx(a, "question_1", "¿Qué pasa en tu casa cuando llueve fuerte?"),
    pregunta: tx(a, "size_question", "¿Qué tan ancha es tu entrada?"),
    ayuda: tx(a, "size_help", "Mídela de marco a marco, en centímetros. Toca la que corresponda."),
    masAncha: tx(a, "wider_text", "Más de {hasta} cm"),
    masAnchaTexto: tx(a, "wider_subtext", "Te la hacemos a la medida"),
    resultado: tx(a, "result_heading", "¡Listo! Esta es la tuya"),
    recomendamos: tx(a, "result_text", "Te recomendamos la"),
    elegiste: tx(a, "chosen_text", "Tamaño:"),
    anadir: tx(a, "add_button", "Añadir al carrito"),
    agotado: tx(a, "sold_out", "Agotado"),
    falta: tx(a, "missing_text", "Primero elige tu tamaño."),
    empezar: tx(a, "restart_text", "Volver a empezar"),
    atras: tx(a, "back_text", "Atrás"),
  };
}

export function AsistenteD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const opciones: OpcionAsistente[] = seccion.bloques
    .filter((b) => b.tipo === "option" && texto(b.ajustes, "text"))
    .map((b) => {
      const venta = texto(b.ajustes, "producto") ? datosVenta(texto(b.ajustes, "producto")) : null;
      return {
        id: b.id,
        icono: texto(b.ajustes, "icon") || "agua",
        texto: textoVersion(b.ajustes, "text"),
        subtexto: textoVersion(b.ajustes, "subtext"),
        enlace: !venta ? texto(b.ajustes, "link") || undefined : undefined,
        producto: venta ? { nombre: venta.nombre, tamanos: venta.tamanos } : undefined,
      };
    });
  const foto = texto(a, "image");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="d-asistente" id="asistente" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoD(texto(a, "fondo") || "gris")} scroll-mt-24 py-12 md:py-20`}>
      <div className="marco-version grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
        <div>
          <EtiquetaD>{formato(textoVersion(a, "subheading"))}</EtiquetaD>
          <TituloD id={`titulo-${seccion.id}`}>{formato(textoVersion(a, "heading"))}</TituloD>
          {texto(a, "text") && <p className="m-0 mt-4 text-[18px] leading-[1.6]">{formato(textoVersion(a, "text"))}</p>}
          {foto && (
            <div className="relative mt-6 hidden aspect-[4/3] overflow-hidden rounded-xl lg:block">
              <Image src={foto} alt={texto(a, "alt")} fill sizes="560px" className="object-cover" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} />
            </div>
          )}
        </div>
        <div>
          <div className={`${TARJETA_D} p-5 md:p-7`}>
            <AsistenteDCliente opciones={opciones} textos={textosAsistente(a)} enlaceMasAncha={texto(a, "wider_link") || undefined} />
          </div>
          {whatsapp && (
            <a
              href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, ¿me ayudan a medir mi entrada para elegir el tamaño de la compuerta?"))}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="toca_whatsapp"
              className="mt-4 inline-flex min-h-12 items-center gap-2.5 text-[18px] font-semibold text-[#0b2545] underline underline-offset-4"
            >
              <IconoWhatsapp className="size-6 text-[#15803d]" />
              {tx(a, "whatsapp_text", "¿No sabes cómo medir? Te ayudamos por WhatsApp")}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
