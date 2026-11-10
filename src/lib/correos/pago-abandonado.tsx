// «Recordatorio de pago abandonado» para el cliente que llenó la pantalla de pago y no terminó. Como el de Shopify:
// los artículos y el botón «Completar compra». Por ahora solo la plantilla y su vista previa: cuándo se manda se define
// después (necesita guardar el carrito del cliente, que hoy vive solo en su navegador).

import { documento } from "./html";
import {
  Articulos,
  Bloque,
  Boton,
  LINEA_TEXTO,
  Marco,
  Parrafo,
  SITIO,
  Subtitulo,
  Titulo,
  dinero,
  textoArticulos,
  textoPie,
  type Correo,
  type LineaCorreo,
} from "./comun";

export type PagoAbandonado = { nombre: string; lineas: LineaCorreo[] };

export function pagoAbandonado(d: PagoAbandonado, sitio = SITIO): Correo {
  const asunto = "Tu compra te está esperando";
  const intro = `${d.nombre ? `Hola ${d.nombre}, ¿aún` : "¿Aún"} te interesa? Tus artículos siguen apartados en tu carrito. Completa tu compra antes de que se agoten.`;
  const enlace = `${sitio}/checkout`;
  const subtotal = d.lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);

  const html = documento(
    <Marco sitio={sitio}>
      <Bloque>
        <Titulo>Olvidaste algo en tu carrito</Titulo>
        <Parrafo>{intro}</Parrafo>
        <Boton href={enlace} secundario={{ href: sitio, texto: "Visita nuestra tienda" }}>
          Completar compra
        </Boton>
      </Bloque>
      <Bloque separador>
        <Subtitulo>Resumen del carrito</Subtitulo>
        <Articulos lineas={d.lineas} sitio={sitio} />
        <Parrafo tenue={false}>
          <span style={{ display: "block", marginTop: 20, textAlign: "right" }}>
            Subtotal: <strong>{dinero(subtotal)} MXN</strong>
          </span>
        </Parrafo>
      </Bloque>
    </Marco>,
    { titulo: asunto, preencabezado: intro },
  );

  const texto = [
    "Olvidaste algo en tu carrito",
    intro,
    "",
    `Completar compra: ${enlace}`,
    "",
    LINEA_TEXTO,
    "Resumen del carrito",
    "",
    textoArticulos(d.lineas),
    "",
    `Subtotal: ${dinero(subtotal)} MXN`,
    "",
    textoPie(),
  ].join("\n");

  return { asunto, html, texto };
}
