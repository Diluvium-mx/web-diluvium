// «Pedido entregado» para el cliente, con la invitación a dejar su reseña: cada producto lleva a la sección de reseñas
// de su página (/products/<nombre>#resenas-producto). Como «Tu pedido fue entregado» de Shopify.

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
  correoTienda,
  textoArticulos,
  textoPie,
  type Correo,
  type LineaCorreo,
  type PedidoCorreo,
} from "./comun";

/** Sección de reseñas de la página del producto (el ancla de ProductoPrincipal). */
export function enlaceResena(l: LineaCorreo, sitio = SITIO): string | null {
  return l.producto ? `${sitio}/products/${l.producto}#resenas-producto` : null;
}

export function pedidoEntregado(p: PedidoCorreo, sitio = SITIO): Correo {
  const asunto = `Tu pedido #${p.numero} fue entregado`;
  const intro = `${p.nombre ? `Hola ${p.nombre}, tu` : "Tu"} pedido fue entregado. ¿No lo recibiste? Responde este correo y lo revisamos.`;
  // Sin repetir productos (dos tamaños del mismo producto van a la misma página).
  const conPagina = p.lineas.filter((l, i, todas) => l.producto && todas.findIndex((x) => x.producto === l.producto) === i);
  const primera = conPagina[0] ? enlaceResena(conPagina[0], sitio) : null;

  const html = documento(
    <Marco etiqueta={`Pedido #${p.numero}`} sitio={sitio}>
      <Bloque>
        <Titulo>Tu pedido fue entregado</Titulo>
        <Parrafo>{intro}</Parrafo>
      </Bloque>
      <Bloque separador>
        <Subtitulo>¿Qué te pareció?</Subtitulo>
        <Parrafo>
          Tu opinión ayuda a otras familias a proteger su casa de las inundaciones. Cuéntanos cómo te fue: solo toma un minuto.
        </Parrafo>
        {primera && <Boton href={primera}>Dejar mi reseña</Boton>}
        {conPagina.length > 1 &&
          conPagina.map((l, i) => (
            <p key={i} style={{ fontFamily: FUENTE, fontSize: 15, lineHeight: "22px", margin: i ? "6px 0 0" : "20px 0 0" }}>
              <a href={enlaceResena(l, sitio) ?? sitio} style={{ color: AZUL }}>
                Reseña de {l.titulo}
              </a>
            </p>
          ))}
      </Bloque>
      <Bloque separador>
        <Subtitulo>Artículos entregados</Subtitulo>
        <Articulos lineas={p.lineas} sitio={sitio} conPrecio={false} />
      </Bloque>
    </Marco>,
    { titulo: asunto, preencabezado: "Tu pedido fue entregado. ¿Qué te pareció? Deja tu reseña." },
  );

  const texto = [
    `PEDIDO #${p.numero}`,
    "",
    "Tu pedido fue entregado",
    intro.replace("Responde este correo", `Responde este correo o escribe a ${correoTienda()}`),
    "",
    LINEA_TEXTO,
    "¿Qué te pareció?",
    "Tu opinión ayuda a otras familias a proteger su casa de las inundaciones. Cuéntanos cómo te fue: solo toma un minuto.",
    "",
    ...conPagina.map((l) => `Reseña de ${l.titulo}: ${enlaceResena(l, sitio)}`),
    "",
    LINEA_TEXTO,
    "Artículos entregados",
    "",
    textoArticulos(p.lineas, false),
    "",
    textoPie(),
  ].join("\n");

  return { asunto, html, texto };
}
