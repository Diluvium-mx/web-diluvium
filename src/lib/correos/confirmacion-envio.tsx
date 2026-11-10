// «Confirmación de envío» para el cliente, cuando en el pedido se agrega un número de guía con «Notificar al cliente».
// Como la de Shopify: «Tu pedido está en camino», el número de seguimiento con su enlace y los artículos enviados.
// Las guías se hacen en Envía: el enlace de seguimiento es el de Envía para cualquier paquetería, salvo «Otro».

import type { CSSProperties } from "react";
import { documento } from "./html";
import {
  AZUL,
  Articulos,
  Bloque,
  Boton,
  FUENTE,
  LINEA_TEXTO,
  Marco,
  Parrafo,
  SITIO,
  Subtitulo,
  Titulo,
  enlacePedido,
  renglonesDireccion,
  textoArticulos,
  textoPie,
  type Correo,
  type PedidoCorreo,
} from "./comun";

export type Guia = { guia: string; paqueteria: string | null };

/** Página de seguimiento de Envía; null con «Otro» (no sabemos dónde se rastrea). */
export function enlaceSeguimiento(g: Guia): string | null {
  if (!g.guia || g.paqueteria === "Otro") return null;
  return `https://envia.com/es-MX/tracking?label=${encodeURIComponent(g.guia)}`;
}

const nombrePaqueteria = (g: Guia) => (g.paqueteria && g.paqueteria !== "Otro" ? g.paqueteria : "la paquetería");

export function confirmacionEnvio(p: PedidoCorreo, guias: Guia[], sitio = SITIO): Correo {
  const asunto = `Tu pedido #${p.numero} está en camino`;
  const intro = "Tu pedido está en camino. Sigue tu envío para ver el estado de la entrega.";
  const principal = guias.map(enlaceSeguimiento).find(Boolean) ?? null;
  const ver = enlacePedido(p, sitio);
  const letra: CSSProperties = { fontFamily: FUENTE, fontSize: 16, lineHeight: "24px", color: "#333333", margin: "16px 0 0" };

  const html = documento(
    <Marco etiqueta={`Pedido #${p.numero}`} sitio={sitio}>
      <Bloque>
        <Titulo>Tu pedido está en camino</Titulo>
        <Parrafo>{intro}</Parrafo>
        {principal ? (
          <Boton href={principal} secundario={ver ? { href: ver, texto: "Ver tu pedido" } : { href: sitio, texto: "Visita nuestra tienda" }}>
            Rastrear tu envío
          </Boton>
        ) : (
          ver && <Boton href={ver}>Ver tu pedido</Boton>
        )}
        {guias.map((g, i) => {
          const enlace = enlaceSeguimiento(g);
          return (
            <p key={i} style={letra}>
              Número de seguimiento de {nombrePaqueteria(g)}:{" "}
              {enlace ? (
                <a href={enlace} style={{ color: AZUL, fontWeight: 600 }}>
                  {g.guia}
                </a>
              ) : (
                <strong>{g.guia}</strong>
              )}
            </p>
          );
        })}
      </Bloque>
      <Bloque separador>
        <Subtitulo>Artículos en este envío</Subtitulo>
        <Articulos lineas={p.lineas} sitio={sitio} conPrecio={false} />
      </Bloque>
      {p.entrega && (
        <Bloque separador abajo={24}>
          <Subtitulo>Dirección de envío</Subtitulo>
          <Parrafo>
            {renglonesDireccion(p.entrega).map((r, i) => (
              <span key={i} style={{ display: "block" }}>
                {r}
              </span>
            ))}
          </Parrafo>
        </Bloque>
      )}
    </Marco>,
    { titulo: asunto, preencabezado: intro },
  );

  const texto = [
    `PEDIDO #${p.numero}`,
    "",
    "Tu pedido está en camino",
    intro,
    "",
    ...guias.map((g) => {
      const enlace = enlaceSeguimiento(g);
      return `Número de seguimiento de ${nombrePaqueteria(g)}: ${g.guia}${enlace ? `\nRastrear: ${enlace}` : ""}`;
    }),
    ver ? `\nVer tu pedido: ${ver}` : "",
    "",
    LINEA_TEXTO,
    "Artículos en este envío",
    "",
    textoArticulos(p.lineas, false),
    "",
    ...(p.entrega ? ["Dirección de envío:", ...renglonesDireccion(p.entrega), ""] : []),
    textoPie(),
  ].join("\n");

  return { asunto, html, texto };
}
