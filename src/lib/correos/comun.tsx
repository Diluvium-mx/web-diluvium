// Piezas que comparten todos los correos de la tienda: marco de 600 px con el logo, títulos, párrafos, botón naranja,
// lista de artículos, totales y direcciones, más su versión en texto simple. Hecho con tablas y estilos en línea, que es
// lo único que todos los programas de correo (Gmail, Outlook, Apple Mail) muestran igual. Modelado en las
// notificaciones en español de Shopify.

/* eslint-disable @next/next/no-img-element -- en un correo solo sirve <img> con dirección completa (no next/image). */

import type { CSSProperties, ReactNode } from "react";
import { articulo } from "@/components/carrito/catalogo";
import { ESTADOS, type Direccion } from "@/lib/pago/tipos";

/** Dirección pública de la tienda: fotos y enlaces de los correos siempre apuntan aquí. */
export const SITIO = "https://www.diluvium.com.mx";
export const LOGO = "/media/files/Logo_Diluvium_horizontal_sin_fondo.png";
export const AZUL = "#0a559a";
/** Solo para el botón principal. */
export const NARANJA = "#f8a01d";
const TEXTO = "#333333";
const TENUE = "#777777";
const LINEA = "#e5e5e5";
export const FUENTE = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const correoTienda = () => process.env.CORREO_TIENDA || "contacto@diluvium.com.mx";

/** Lo que devuelve cada plantilla: listo para enviarCorreo(). */
export type Correo = { asunto: string; html: string; texto: string };

/** 5500 → «$5,500.00», como los montos de la pantalla de pago y de los correos de Shopify. */
export function dinero(cantidad: number): string {
  return `$${Number(cantidad || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Datos de un pedido, como los necesitan los correos ──────────────────────────────────────────────────────────────

export type LineaCorreo = {
  titulo: string;
  /** Tamaño; null si el producto no tiene opciones. */
  opcion: string | null;
  cantidad: number;
  precio: number;
  /** Ruta de la foto en la página (/media/…), o null. */
  imagen: string | null;
  /** Nombre del producto en la dirección: /products/<nombre>. */
  producto: string | null;
};

export type PedidoCorreo = {
  numero: number;
  /** Clave de la página de «gracias» (estado del pedido); sin ella no hay botón «Ver tu pedido». */
  clave: string | null;
  nombre: string;
  correo: string;
  lineas: LineaCorreo[];
  subtotal: number;
  descuento: number;
  codigoDescuento: string;
  envio: number;
  metodoEnvio: string;
  total: number;
  metodoPago: string;
  meses: number | null;
  entrega: Direccion | null;
  facturacion: Direccion | null;
};

type DocPedido = Record<string, unknown> & {
  numero?: number | null;
  clave?: string | null;
  correo?: string | null;
  cliente?: string | null;
  total?: number | null;
  articulos?: { titulo?: string | null; opcion?: string | null; cantidad?: number | null; precio?: number | null; idVariante?: number | null }[] | null;
  totales?: { subtotal?: number | null; descuento?: number | null; codigoDescuento?: string | null; envio?: number | null; metodoEnvio?: string | null } | null;
  pago?: { metodo?: string | null; meses?: number | null } | null;
  entrega?: Partial<Direccion> | null;
  facturacion?: Partial<Direccion> | null;
};

const direccionDe = (d: Partial<Direccion> | null | undefined): Direccion | null =>
  d && (d.nombre || d.direccion)
    ? {
        pais: "MX",
        nombre: d.nombre ?? "",
        apellidos: d.apellidos ?? "",
        direccion: d.direccion ?? "",
        interior: d.interior ?? "",
        codigoPostal: d.codigoPostal ?? "",
        ciudad: d.ciudad ?? "",
        estado: d.estado ?? "",
        telefono: d.telefono ?? "",
      }
    : null;

/** Pasa un pedido guardado (colección «pedidos») a lo que usan los correos. Foto y enlace salen del catálogo. */
export function pedidoDesdeDoc(doc: DocPedido): PedidoCorreo {
  const entrega = direccionDe(doc.entrega);
  return {
    numero: Number(doc.numero),
    clave: doc.clave ? String(doc.clave) : null,
    nombre: entrega?.nombre || String(doc.cliente ?? "").split(" ")[0] || "",
    correo: String(doc.correo ?? ""),
    lineas: (doc.articulos ?? []).map((a) => {
      const c = a.idVariante ? articulo(Number(a.idVariante)) : undefined;
      return {
        titulo: String(a.titulo ?? c?.titulo ?? ""),
        opcion: a.opcion || null,
        cantidad: Number(a.cantidad ?? 1),
        precio: Number(a.precio ?? 0),
        imagen: c?.imagen?.src ?? null,
        producto: c?.producto ?? null,
      };
    }),
    subtotal: Number(doc.totales?.subtotal ?? 0),
    descuento: Number(doc.totales?.descuento ?? 0),
    codigoDescuento: String(doc.totales?.codigoDescuento ?? ""),
    envio: Number(doc.totales?.envio ?? 0),
    metodoEnvio: String(doc.totales?.metodoEnvio ?? ""),
    total: Number(doc.total ?? 0),
    metodoPago: String(doc.pago?.metodo ?? ""),
    meses: doc.pago?.meses ? Number(doc.pago.meses) : null,
    entrega,
    facturacion: direccionDe(doc.facturacion) ?? entrega,
  };
}

export function textoMetodoPago(metodo: string, meses: number | null): string {
  if (metodo === "tarjeta") return meses && meses > 1 ? `Tarjeta de crédito o débito · ${meses} meses sin intereses` : "Tarjeta de crédito o débito";
  if (metodo === "mercadopago") return "Mercado Pago";
  if (metodo === "paypal") return "PayPal";
  return "Pendiente";
}

/** Página del estado del pedido (la misma de «gracias»), que pide número y clave. */
export function enlacePedido(p: PedidoCorreo, sitio = SITIO): string | null {
  return p.clave ? `${sitio}/checkout/gracias?pedido=${p.numero}&clave=${p.clave}` : null;
}

const nombreEstado = (clave: string) => ESTADOS.find((e) => e.clave === clave)?.nombre ?? clave;

/** Renglones de una dirección, como la página de «gracias». */
export function renglonesDireccion(d: Direccion | null): string[] {
  if (!d) return [];
  return [
    `${d.nombre} ${d.apellidos}`.trim(),
    d.direccion,
    d.interior,
    `${`${d.codigoPostal} ${d.ciudad}`.trim()}${d.estado ? `, ${nombreEstado(d.estado)}` : ""}`,
    "México",
    d.telefono,
  ].filter(Boolean);
}

// ── Piezas del correo (HTML) ────────────────────────────────────────────────────────────────────────────────────────

const tabla = { role: "presentation", cellPadding: 0, cellSpacing: 0, border: 0 } as const;
const base: CSSProperties = { fontFamily: FUENTE, color: TEXTO };

/** Marco de todos los correos: logo a la izquierda, la etiqueta (p. ej. «PEDIDO #1362») a la derecha y el pie para
 * clientes (los avisos internos de la tienda van sin él). */
export function Marco({ etiqueta, sitio = SITIO, pie = true, children }: { etiqueta?: string; sitio?: string; pie?: boolean; children: ReactNode }) {
  return (
    <table {...tabla} width="100%" style={{ backgroundColor: "#ffffff" }}>
      <tbody>
        <tr>
          <td align="center" style={{ padding: "0 16px" }}>
            <table {...tabla} width="100%" style={{ maxWidth: 600, width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "32px 0 24px" }}>
                    <table {...tabla} width="100%">
                      <tbody>
                        <tr>
                          <td valign="middle">
                            <a href={sitio} style={{ textDecoration: "none" }}>
                              <img src={`${sitio}${LOGO}`} width={170} alt="Diluvium" style={{ display: "block", width: 170, height: "auto", border: 0 }} />
                            </a>
                          </td>
                          {etiqueta && (
                            <td valign="middle" align="right" style={{ ...base, fontSize: 14, color: TENUE, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              {etiqueta}
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                {children}
                {pie && (
                <tr>
                  <td style={{ ...base, borderTop: `1px solid ${LINEA}`, padding: "24px 0 40px", fontSize: 14, lineHeight: "21px", color: TENUE }}>
                    Si tienes alguna pregunta, responde este correo electrónico o escríbenos a{" "}
                    <a href={`mailto:${correoTienda()}`} style={{ color: AZUL }}>
                      {correoTienda()}
                    </a>
                    .
                  </td>
                </tr>
                )}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Un bloque del cuerpo (una fila del marco). */
export function Bloque({ children, separador = false, abajo = 32 }: { children: ReactNode; separador?: boolean; abajo?: number }) {
  return (
    <tr>
      <td style={{ ...base, padding: `${separador ? 32 : 0}px 0 ${abajo}px`, borderTop: separador ? `1px solid ${LINEA}` : undefined }}>{children}</td>
    </tr>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return <h2 style={{ ...base, margin: "0 0 12px", fontSize: 24, lineHeight: "30px", fontWeight: 600, color: AZUL }}>{children}</h2>;
}

export function Subtitulo({ children }: { children: ReactNode }) {
  return <h3 style={{ ...base, margin: "0 0 20px", fontSize: 20, lineHeight: "26px", fontWeight: 600, color: AZUL }}>{children}</h3>;
}

export function Parrafo({ children, tenue = true }: { children: ReactNode; tenue?: boolean }) {
  return <p style={{ ...base, margin: "0 0 16px", fontSize: 16, lineHeight: "24px", color: tenue ? TENUE : TEXTO }}>{children}</p>;
}

/** Botón principal (naranja) y, si se da, el enlace secundario «o Visita nuestra tienda». */
export function Boton({ href, children, secundario }: { href: string; children: ReactNode; secundario?: { href: string; texto: string } }) {
  return (
    <table {...tabla} style={{ marginTop: 8 }}>
      <tbody>
        <tr>
          <td align="center" style={{ backgroundColor: NARANJA, borderRadius: 4 }}>
            <a
              href={href}
              style={{ ...base, display: "inline-block", padding: "16px 24px", fontSize: 16, fontWeight: 600, color: "#ffffff", textDecoration: "none", borderRadius: 4 }}
            >
              {children}
            </a>
          </td>
          {secundario && (
            <td style={{ ...base, paddingLeft: 20, fontSize: 16, color: TENUE }}>
              o{" "}
              <a href={secundario.href} style={{ color: AZUL, textDecoration: "none" }}>
                {secundario.texto}
              </a>
            </td>
          )}
        </tr>
      </tbody>
    </table>
  );
}

/** Lista de artículos con foto, tamaño, piezas y precio (el precio se puede ocultar, p. ej. en el envío). */
export function Articulos({ lineas, sitio = SITIO, conPrecio = true }: { lineas: LineaCorreo[]; sitio?: string; conPrecio?: boolean }) {
  return (
    <table {...tabla} width="100%">
      <tbody>
        {lineas.map((l, i) => (
          <tr key={i}>
            <td width={76} valign="middle" style={{ padding: i ? "16px 0 0" : 0 }}>
              {l.imagen ? (
                <img
                  src={`${sitio}${l.imagen}`}
                  width={60}
                  height={60}
                  alt={l.titulo}
                  style={{ display: "block", width: 60, height: 60, objectFit: "cover", border: `1px solid ${LINEA}`, borderRadius: 8 }}
                />
              ) : (
                <div style={{ width: 60, height: 60, border: `1px solid ${LINEA}`, borderRadius: 8 }} />
              )}
            </td>
            <td valign="middle" style={{ ...base, padding: i ? "16px 0 0" : 0, fontSize: 16, lineHeight: "22px" }}>
              <span style={{ fontWeight: 600 }}>
                {l.titulo} × {l.cantidad}
              </span>
              {l.opcion && <span style={{ display: "block", fontSize: 14, color: TENUE }}>{l.opcion}</span>}
            </td>
            {conPrecio && (
              <td valign="middle" align="right" style={{ ...base, padding: i ? "16px 0 0 12px" : "0 0 0 12px", fontSize: 16, fontWeight: 600, whiteSpace: "nowrap" }}>
                {dinero(l.precio * l.cantidad)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Subtotal, descuento, envío y total, alineados a la derecha como en Shopify. */
export function Totales({ p }: { p: PedidoCorreo }) {
  const renglon = (etiqueta: ReactNode, valor: string, fuerte = false) => (
    <tr>
      <td style={{ ...base, padding: "4px 0", fontSize: fuerte ? 16 : 16, color: fuerte ? TEXTO : TENUE }}>{etiqueta}</td>
      <td align="right" style={{ ...base, padding: "4px 0", fontSize: fuerte ? 24 : 16, fontWeight: fuerte ? 600 : 400, whiteSpace: "nowrap" }}>
        {valor}
      </td>
    </tr>
  );
  return (
    <table {...tabla} width="100%" style={{ marginTop: 24, borderTop: `1px solid ${LINEA}` }}>
      <tbody>
        <tr>
          <td width="40%" />
          <td style={{ paddingTop: 16 }}>
            <table {...tabla} width="100%">
              <tbody>
                {renglon("Subtotal", dinero(p.subtotal))}
                {p.descuento > 0 &&
                  renglon(
                    <>
                      Descuento{p.codigoDescuento && <span style={{ display: "block", fontSize: 12, textTransform: "uppercase" }}>{p.codigoDescuento}</span>}
                    </>,
                    `−${dinero(p.descuento)}`,
                  )}
                {renglon("Envío", p.envio > 0 ? dinero(p.envio) : "Gratis")}
                <tr>
                  <td colSpan={2} style={{ borderTop: `2px solid ${LINEA}`, paddingTop: 8 }} />
                </tr>
                {renglon("Total", `${dinero(p.total)} MXN`, true)}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** «Información del cliente»: direcciones, forma de entrega y de pago, en dos columnas. */
export function InformacionCliente({ p }: { p: PedidoCorreo }) {
  const celda = (titulo: string, renglones: string[]) => (
    <td width="50%" valign="top" style={{ ...base, padding: "0 12px 24px 0", fontSize: 14, lineHeight: "21px", color: TENUE }}>
      <h4 style={{ ...base, margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: TEXTO }}>{titulo}</h4>
      {renglones.map((r, i) => (
        <span key={i} style={{ display: "block" }}>
          {r}
        </span>
      ))}
    </td>
  );
  return (
    <table {...tabla} width="100%">
      <tbody>
        <tr>
          {celda("Dirección de envío", renglonesDireccion(p.entrega))}
          {celda("Dirección de facturación", renglonesDireccion(p.facturacion))}
        </tr>
        <tr>
          {celda("Método de envío", [p.metodoEnvio || "Envío"])}
          {celda("Método de pago", [`${textoMetodoPago(p.metodoPago, p.meses)} — ${dinero(p.total)}`])}
        </tr>
      </tbody>
    </table>
  );
}

/** Tabla de «dato: valor» para los avisos internos de la tienda. */
export function Datos({ filas }: { filas: [string, ReactNode][] }) {
  return (
    <table {...tabla} width="100%" style={{ border: `1px solid ${LINEA}`, borderRadius: 8 }}>
      <tbody>
        {filas.map(([k, v], i) => (
          <tr key={k}>
            <td width={140} valign="top" style={{ ...base, padding: "10px 14px", fontSize: 14, color: TENUE, borderTop: i ? `1px solid ${LINEA}` : undefined }}>
              {k}
            </td>
            <td valign="top" style={{ ...base, padding: "10px 14px", fontSize: 15, lineHeight: "22px", whiteSpace: "pre-wrap", borderTop: i ? `1px solid ${LINEA}` : undefined }}>
              {v}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Versión en texto simple ─────────────────────────────────────────────────────────────────────────────────────────

export const LINEA_TEXTO = "────────────────────────────────────────";

export function textoArticulos(lineas: LineaCorreo[], conPrecio = true): string {
  return lineas
    .map((l) => `• ${l.titulo}${l.opcion ? ` · ${l.opcion}` : ""} × ${l.cantidad}${conPrecio ? ` — ${dinero(l.precio * l.cantidad)}` : ""}`)
    .join("\n");
}

export function textoTotales(p: PedidoCorreo): string {
  return [
    `Subtotal: ${dinero(p.subtotal)}`,
    p.descuento > 0 ? `Descuento${p.codigoDescuento ? ` (${p.codigoDescuento})` : ""}: −${dinero(p.descuento)}` : "",
    `Envío: ${p.envio > 0 ? dinero(p.envio) : "Gratis"}`,
    `Total: ${dinero(p.total)} MXN`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function textoPie(): string {
  return `${LINEA_TEXTO}\nSi tienes alguna pregunta, responde este correo electrónico o escríbenos a ${correoTienda()}.\nDiluvium · ${SITIO}`;
}
