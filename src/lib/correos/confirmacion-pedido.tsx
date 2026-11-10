// «Confirmación de pedido» para el cliente, cuando el pago queda confirmado. Igual que la notificación en español de
// Shopify: «¡Gracias por tu compra!», «Ver tu pedido», resumen con totales e «Información del cliente».

import { documento } from "./html";
import {
  Articulos,
  Bloque,
  Boton,
  InformacionCliente,
  LINEA_TEXTO,
  Marco,
  Parrafo,
  SITIO,
  Subtitulo,
  Titulo,
  Totales,
  enlacePedido,
  renglonesDireccion,
  textoArticulos,
  textoMetodoPago,
  textoPie,
  textoTotales,
  type Correo,
  type PedidoCorreo,
} from "./comun";

export function confirmacionPedido(p: PedidoCorreo, sitio = SITIO): Correo {
  const asunto = `Pedido #${p.numero} confirmado`;
  const saludo = p.nombre ? `Hola ${p.nombre}, estamos` : "Estamos";
  const intro = `${saludo} preparando tu pedido para el envío. Te avisaremos cuando esté en camino.`;
  const ver = enlacePedido(p, sitio);

  const html = documento(
    <Marco etiqueta={`Pedido #${p.numero}`} sitio={sitio}>
      <Bloque>
        <Titulo>¡Gracias por tu compra!</Titulo>
        <Parrafo>{intro}</Parrafo>
        {ver ? (
          <Boton href={ver} secundario={{ href: sitio, texto: "Visita nuestra tienda" }}>
            Ver tu pedido
          </Boton>
        ) : (
          <Boton href={sitio}>Visita nuestra tienda</Boton>
        )}
      </Bloque>
      <Bloque separador>
        <Subtitulo>Resumen del pedido</Subtitulo>
        <Articulos lineas={p.lineas} sitio={sitio} />
        <Totales p={p} />
      </Bloque>
      <Bloque separador abajo={8}>
        <Subtitulo>Información del cliente</Subtitulo>
        <InformacionCliente p={p} />
      </Bloque>
    </Marco>,
    { titulo: asunto, preencabezado: intro },
  );

  const texto = [
    `PEDIDO #${p.numero}`,
    "",
    "¡Gracias por tu compra!",
    intro,
    ver ? `\nVer tu pedido: ${ver}` : "",
    "",
    LINEA_TEXTO,
    "Resumen del pedido",
    "",
    textoArticulos(p.lineas),
    "",
    textoTotales(p),
    "",
    LINEA_TEXTO,
    "Información del cliente",
    "",
    "Dirección de envío:",
    ...renglonesDireccion(p.entrega),
    "",
    "Dirección de facturación:",
    ...renglonesDireccion(p.facturacion),
    "",
    `Método de envío: ${p.metodoEnvio || "Envío"}`,
    `Método de pago: ${textoMetodoPago(p.metodoPago, p.meses)}`,
    "",
    textoPie(),
  ].join("\n");

  return { asunto, html, texto };
}
