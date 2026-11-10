// Avisos internos para el buzón de la tienda (CORREO_TIENDA): «Pedido nuevo #…» cuando se confirma un pago y «Mensaje
// nuevo» cuando alguien llena un formulario de contacto. Solo los lee la tienda; no se mandan a clientes.

import { documento } from "./html";
import {
  Articulos,
  Bloque,
  Boton,
  Datos,
  InformacionCliente,
  LINEA_TEXTO,
  Marco,
  Parrafo,
  SITIO,
  Titulo,
  Totales,
  dinero,
  renglonesDireccion,
  textoArticulos,
  textoMetodoPago,
  textoTotales,
  type Correo,
  type PedidoCorreo,
} from "./comun";

/** Ficha del pedido en el administrador. */
const enlaceAdmin = (id: number | string | null, sitio: string) => (id ? `${sitio}/admin/collections/pedidos/${id}` : `${sitio}/admin/collections/pedidos`);

export function avisoPedidoNuevo(p: PedidoCorreo, idPedido: number | string | null, sitio = SITIO): Correo {
  const asunto = `Pedido nuevo #${p.numero} · ${dinero(p.total)} MXN`;
  const cliente = renglonesDireccion(p.entrega)[0] || p.nombre;
  const intro = `${cliente || "Un cliente"} hizo un pedido de ${dinero(p.total)} MXN y el pago quedó confirmado.`;
  const admin = enlaceAdmin(idPedido, sitio);

  const html = documento(
    <Marco etiqueta={`Pedido #${p.numero}`} sitio={sitio} pie={false}>
      <Bloque>
        <Titulo>Pedido nuevo #{p.numero}</Titulo>
        <Parrafo>{intro}</Parrafo>
        <Boton href={admin}>Ver el pedido en el administrador</Boton>
      </Bloque>
      <Bloque separador>
        <Datos
          filas={[
            ["Cliente", cliente],
            ["Correo", p.correo],
            ["Teléfono", p.entrega?.telefono || "—"],
            ["Pago", textoMetodoPago(p.metodoPago, p.meses)],
          ]}
        />
      </Bloque>
      <Bloque separador>
        <Articulos lineas={p.lineas} sitio={sitio} />
        <Totales p={p} />
      </Bloque>
      <Bloque separador abajo={24}>
        <InformacionCliente p={p} />
      </Bloque>
    </Marco>,
    { titulo: asunto, preencabezado: intro },
  );

  const texto = [
    `Pedido nuevo #${p.numero}`,
    intro,
    "",
    `Cliente: ${cliente}`,
    `Correo: ${p.correo}`,
    `Teléfono: ${p.entrega?.telefono || "—"}`,
    `Pago: ${textoMetodoPago(p.metodoPago, p.meses)}`,
    "",
    LINEA_TEXTO,
    textoArticulos(p.lineas),
    "",
    textoTotales(p),
    "",
    "Dirección de envío:",
    ...renglonesDireccion(p.entrega),
    "",
    `Ver el pedido: ${admin}`,
  ].join("\n");

  return { asunto, html, texto };
}

export type MensajeNuevo = {
  /** Qué formulario se llenó: «hola» (el de WhatsApp / «Hola») o «contacto». */
  formulario: "hola" | "contacto" | (string & {});
  nombre?: string | null;
  correo?: string | null;
  telefono?: string | null;
  mensaje?: string | null;
};

const NOMBRE_FORMULARIO: Record<string, string> = { hola: "Formulario «Hola»", contacto: "Formulario de contacto" };

export function avisoMensaje(m: MensajeNuevo, sitio = SITIO): Correo {
  const quien = String(m.nombre ?? "").trim() || "Alguien";
  const formulario = NOMBRE_FORMULARIO[m.formulario] ?? `Formulario «${m.formulario}»`;
  const asunto = `Mensaje nuevo de ${quien} · ${formulario}`;
  const filas: [string, string][] = [
    ["Formulario", formulario],
    ["Nombre", String(m.nombre ?? "").trim() || "—"],
    ["Correo", String(m.correo ?? "").trim() || "—"],
    ["Teléfono", String(m.telefono ?? "").trim() || "—"],
    ["Mensaje", String(m.mensaje ?? "").trim() || "—"],
  ];

  const html = documento(
    <Marco etiqueta="Mensaje nuevo" sitio={sitio} pie={false}>
      <Bloque>
        <Titulo>Mensaje nuevo</Titulo>
        <Parrafo>
          {quien} escribió desde el {formulario.charAt(0).toLowerCase() + formulario.slice(1)} de la página.
          {m.correo ? " Responde este correo para contestarle directo." : ""}
        </Parrafo>
      </Bloque>
      <Bloque abajo={40}>
        <Datos filas={filas} />
      </Bloque>
    </Marco>,
    { titulo: asunto, preencabezado: String(m.mensaje ?? "").slice(0, 120) },
  );

  const texto = ["Mensaje nuevo", "", ...filas.map(([k, v]) => `${k}: ${v}`)].join("\n");
  return { asunto, html, texto };
}
