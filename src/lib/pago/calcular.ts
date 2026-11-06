// Cuentas del pedido, del lado del servidor: precio, existencias, descuento, envío y total salen del catálogo publicado
// (contenido/productos.json) y de los ajustes del administrador, nunca de lo que mande el navegador.

import { articulo } from "@/components/carrito/catalogo";
import type { Direccion, LineaPedido, Resumen } from "./tipos";

export type Descuento = { codigo: string; tipo: "porcentaje" | "monto"; valor: number; minimo?: number | null };
export type AjustesEnvio = { nombre: string; gratisDesde: number; costo: number };

// El mismo aviso del carrito (src/components/carrito/estado.ts), que es solo del navegador.
function avisoExistencias(tope: number): string {
  return tope === 1
    ? "Debido a la disponibilidad, solo se añadió un artículo al carrito."
    : `Debido a la disponibilidad, solo se añadieron ${tope} artículos al carrito.`;
}

const MAX_LINEAS = 50;
const MAX_PIEZAS = 999;

/** Deja solo variantes del catálogo, sin repetir, con piezas enteras y dentro de las existencias. */
export function limpiarLineas(lineas: unknown): { lineas: LineaPedido[]; avisos: string[] } {
  const avisos: string[] = [];
  const salida: LineaPedido[] = [];
  if (!Array.isArray(lineas)) return { lineas: salida, avisos };
  for (const l of lineas.slice(0, MAX_LINEAS)) {
    const id = Number((l as LineaPedido)?.id);
    const cantidad = Math.min(MAX_PIEZAS, Math.floor(Number((l as LineaPedido)?.cantidad)));
    const a = articulo(id);
    if (!a || !(cantidad > 0) || salida.some((x) => x.id === id)) continue;
    if (a.existencias !== null && cantidad > a.existencias) {
      if (a.existencias > 0) {
        salida.push({ id, cantidad: a.existencias });
        avisos.push(avisoExistencias(a.existencias));
      } else {
        avisos.push(`${a.titulo}${a.opcion ? ` (${a.opcion})` : ""} está agotado y se quitó del pedido.`);
      }
      continue;
    }
    salida.push({ id, cantidad });
  }
  return { lineas: salida, avisos };
}

export function direccionCompleta(d: Partial<Direccion> | undefined): boolean {
  return Boolean(d && /^\d{5}$/.test(String(d.codigoPostal ?? "").trim()) && String(d.estado ?? "") && String(d.ciudad ?? "").trim());
}

/** Monto del descuento para un subtotal (redondeado a centavos y nunca mayor al subtotal). */
export function montoDescuento(d: Descuento, subtotal: number): number {
  if (d.minimo && subtotal < d.minimo) return 0;
  const bruto = d.tipo === "porcentaje" ? (subtotal * Math.min(100, Math.max(0, d.valor))) / 100 : Math.max(0, d.valor);
  return Math.round(Math.min(subtotal, bruto) * 100) / 100;
}

export function calcularResumen(
  lineas: LineaPedido[],
  { descuento, envio, conDireccion, avisos = [] }: { descuento: Descuento | null; envio: AjustesEnvio; conDireccion: boolean; avisos?: string[] },
): Resumen {
  const detalle = lineas.map((l) => {
    const a = articulo(l.id)!;
    return { id: a.id, titulo: a.titulo, opcion: a.opcion, cantidad: l.cantidad, precio: a.precio, imagen: a.imagen?.src ?? null };
  });
  const subtotal = detalle.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const monto = descuento ? montoDescuento(descuento, subtotal) : 0;
  const despues = subtotal - monto;
  const costoEnvio = despues >= envio.gratisDesde ? 0 : envio.costo;
  return {
    lineas: detalle,
    piezas: detalle.reduce((s, l) => s + l.cantidad, 0),
    subtotal,
    descuento: descuento && monto > 0 ? { codigo: descuento.codigo, monto } : null,
    envio: conDireccion ? { nombre: envio.nombre, costo: costoEnvio } : null,
    total: Math.round((despues + (conDireccion ? costoEnvio : 0)) * 100) / 100,
    avisos,
  };
}
