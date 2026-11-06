"use server";

// Acciones del servidor de la pantalla de pago: «cotizar» (el resumen con descuento y envío) y «crearPedido».
// Todo el precio se calcula aquí (docs/seguridad.md §2). El cobro se conecta en el paso 3 con las llaves de prueba de
// Mercado Pago y PayPal: mientras no estén, el pedido queda guardado como «pendiente» y no se cobra nada.

import { randomBytes } from "node:crypto";
import { getPayload } from "payload";
import config from "@payload-config";
import { calcularResumen, direccionCompleta, limpiarLineas, type AjustesEnvio, type Descuento } from "./calcular";
import { ESTADOS, type DatosPago, type Direccion, type ErrorCampo, type LineaPedido, type Resumen, type ResultadoPedido } from "./tipos";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function ajustesEnvio(): Promise<AjustesEnvio> {
  const payload = await getPayload({ config });
  const g = (await payload.findGlobal({ slug: "ajustes-venta", depth: 0 })) as { envio?: Partial<AjustesEnvio> };
  return {
    nombre: g.envio?.nombre || "Terrestre 3–5 días",
    gratisDesde: Number(g.envio?.gratisDesde ?? 499),
    costo: Number(g.envio?.costo ?? 0),
  };
}

/** Busca un código vigente (sin importar mayúsculas). Devuelve null si no existe, venció o se acabó. */
async function buscarDescuento(codigo: string | undefined): Promise<Descuento | null> {
  const limpio = String(codigo ?? "").trim().slice(0, 60);
  if (!limpio) return null;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: "descuentos", depth: 0, limit: 50, where: { activo: { equals: true } } });
  const ahora = Date.now();
  const d = docs.find((x) => String(x.codigo).toLowerCase() === limpio.toLowerCase());
  if (!d) return null;
  if (d.desde && Date.parse(String(d.desde)) > ahora) return null;
  if (d.hasta && Date.parse(String(d.hasta)) < ahora) return null;
  if (d.usosMaximos && Number(d.usos ?? 0) >= Number(d.usosMaximos)) return null;
  return { codigo: String(d.codigo), tipo: d.tipo as Descuento["tipo"], valor: Number(d.valor), minimo: d.minimo as number | null };
}

/** Resumen del pedido para la pantalla: precios del catálogo, descuento y envío (este último, con dirección completa). */
export async function cotizar(
  lineas: LineaPedido[],
  codigo?: string,
  direccion?: Partial<Direccion>,
): Promise<Resumen & { codigoInvalido: boolean }> {
  const limpias = limpiarLineas(lineas);
  const descuento = await buscarDescuento(codigo);
  const resumen = calcularResumen(limpias.lineas, {
    descuento,
    envio: await ajustesEnvio(),
    conDireccion: direccionCompleta(direccion),
    avisos: limpias.avisos,
  });
  return { ...resumen, codigoInvalido: Boolean(String(codigo ?? "").trim()) && !resumen.descuento };
}

function validarDireccion(d: Partial<Direccion> | undefined, errores: Partial<Record<ErrorCampo, string>>) {
  const t = (v: unknown) => String(v ?? "").trim();
  if (!t(d?.nombre)) errores.nombre = "Ingresa un nombre";
  if (!t(d?.apellidos)) errores.apellidos = "Ingresa un apellido";
  if (!t(d?.direccion)) errores.direccion = "Ingresa una dirección";
  if (!t(d?.codigoPostal)) errores.codigoPostal = "Ingresa un código postal";
  else if (!/^\d{5}$/.test(t(d?.codigoPostal))) errores.codigoPostal = "Ingresa un código postal válido";
  if (!t(d?.ciudad)) errores.ciudad = "Ingresa una ciudad";
  if (!ESTADOS.some((e) => e.clave === d?.estado)) errores.estado = "Selecciona un estado";
  const tel = t(d?.telefono).replace(/[\s()+-]/g, "");
  if (!tel) errores.telefono = "Ingresa un número de teléfono";
  else if (!/^(52)?\d{10}$/.test(tel)) errores.telefono = "Ingresa un número de teléfono válido";
}

const recorte = (d: Partial<Direccion> | undefined): Direccion => ({
  pais: "MX",
  nombre: String(d?.nombre ?? "").trim().slice(0, 80),
  apellidos: String(d?.apellidos ?? "").trim().slice(0, 80),
  direccion: String(d?.direccion ?? "").trim().slice(0, 160),
  interior: String(d?.interior ?? "").trim().slice(0, 120),
  codigoPostal: String(d?.codigoPostal ?? "").trim().slice(0, 5),
  ciudad: String(d?.ciudad ?? "").trim().slice(0, 80),
  estado: String(d?.estado ?? ""),
  telefono: String(d?.telefono ?? "").trim().slice(0, 20),
});

/** Revisa los datos, recalcula el total y guarda el pedido. El cobro llega con las llaves de prueba (paso 3). */
export async function crearPedido(datos: DatosPago): Promise<ResultadoPedido> {
  const errores: Partial<Record<ErrorCampo, string>> = {};
  const correo = String(datos?.correo ?? "").trim().slice(0, 160);
  if (!correo) errores.correo = "Ingresa un correo electrónico";
  else if (!CORREO.test(correo)) errores.correo = "Ingresa un correo electrónico válido";
  validarDireccion(datos?.entrega, errores);
  if (datos?.facturacionIgual === false) {
    const f: Partial<Record<ErrorCampo, string>> = {};
    validarDireccion(datos.facturacion, f);
    if (Object.keys(f).length) errores.facturacion = "Revisa la dirección de facturación";
  }
  const metodo = datos?.metodo;
  if (!["tarjeta", "paypal", "mercadopago"].includes(metodo)) return { ok: false, errores, mensaje: "Elige una forma de pago" };

  const limpias = limpiarLineas(datos?.lineas);
  if (!limpias.lineas.length) return { ok: false, errores, mensaje: "Tu carrito está vacío" };
  if (Object.keys(errores).length) return { ok: false, errores };

  const codigo = String(datos.codigoDescuento ?? "").trim();
  const descuento = await buscarDescuento(codigo);
  if (codigo && !descuento) return { ok: false, errores: { codigoDescuento: "Ingresa un código de descuento válido" } };
  const entrega = recorte(datos.entrega);
  const resumen = calcularResumen(limpias.lineas, { descuento, envio: await ajustesEnvio(), conDireccion: true });

  // Paso 3: con tarjeta, cobrar con el token de los campos seguros de Mercado Pago (POST /v1/payments, con
  // X-Idempotency-Key = número de pedido); con Mercado Pago, crear la preferencia de Checkout Pro y redirigir; con
  // PayPal, crear la orden y redirigir. El pedido se marca «pagado» SOLO con el aviso firmado de la pasarela y
  // consultando su API (docs/seguridad.md §2). Mientras no haya llaves, se guarda como pendiente sin cobrar.

  const payload = await getPayload({ config });
  const ajustes = (await payload.findGlobal({ slug: "ajustes-venta", depth: 0 })) as { siguienteNumero?: number };
  const { docs: ultimo } = await payload.find({ collection: "pedidos", depth: 0, limit: 1, sort: "-numero", select: { numero: true } });
  const numero = Math.max(Number(ajustes.siguienteNumero ?? 1362), Number(ultimo[0]?.numero ?? 0) + 1);

  const clave = randomBytes(18).toString("hex");
  await payload.create({
    collection: "pedidos",
    data: {
      titulo: `#${numero}`,
      numero,
      clave,
      estadoPago: "pendiente",
      estadoPreparacion: "no-preparado",
      articulos: resumen.lineas.map((l) => ({ titulo: l.titulo, opcion: l.opcion, cantidad: l.cantidad, precio: l.precio, idVariante: l.id })),
      totales: {
        subtotal: resumen.subtotal,
        descuento: resumen.descuento?.monto ?? 0,
        codigoDescuento: resumen.descuento?.codigo ?? "",
        envio: resumen.envio?.costo ?? 0,
        metodoEnvio: resumen.envio?.nombre ?? "",
      },
      total: resumen.total,
      pago: { metodo, meses: datos.tarjeta?.meses ?? null, idPago: "", detalle: null },
      cliente: `${entrega.nombre} ${entrega.apellidos}`.trim(),
      correo,
      novedades: Boolean(datos.novedades),
      entrega,
      facturacion: datos.facturacionIgual === false ? recorte(datos.facturacion) : entrega,
      historial: [{ fecha: new Date().toISOString(), evento: "Pedido creado en la página (pago pendiente: falta conectar la pasarela)" }],
    } as never,
  });

  return { ok: true, pedido: numero, siguiente: { tipo: "gracias", url: `/checkout/gracias?pedido=${numero}&clave=${clave}` } };
}

/** Lo que muestra la página de «gracias»: solo con el número Y la clave correcta del pedido. */
export async function pedidoConfirmado(numero: number, clave: string) {
  if (!Number.isInteger(numero) || !/^[a-f0-9]{36}$/.test(clave)) return null;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: "pedidos", depth: 0, limit: 1, where: { and: [{ numero: { equals: numero } }, { clave: { equals: clave } }] } });
  const p = docs[0];
  if (!p) return null;
  return {
    numero: p.numero as number,
    nombre: (p.entrega as { nombre?: string } | undefined)?.nombre ?? "",
    correo: String(p.correo ?? ""),
    entrega: p.entrega as Direccion,
    facturacion: (p.facturacion as Direccion | undefined) ?? (p.entrega as Direccion),
    metodo: (p.pago as { metodo?: string } | undefined)?.metodo ?? "",
    articulos: (p.articulos as { titulo: string; opcion: string | null; cantidad: number; precio: number; idVariante: number }[]) ?? [],
    totales: p.totales as { subtotal: number; descuento: number; codigoDescuento: string; envio: number; metodoEnvio: string },
    total: Number(p.total),
    estadoPago: String(p.estadoPago),
  };
}
