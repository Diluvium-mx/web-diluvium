// Lo que comparten la pantalla de pago (navegador) y el servidor. La pantalla manda solo «qué variante y cuántas
// piezas», los datos del cliente y la forma de pago; el precio, el descuento, el envío y el total los calcula SIEMPRE el
// servidor con el catálogo publicado (docs/seguridad.md §2). Nada de lo que diga el navegador sobre precios cuenta.

export type LineaPedido = { id: number; cantidad: number };

export type Direccion = {
  /** Solo México, como hoy en la tienda. */
  pais: "MX";
  nombre: string;
  apellidos: string;
  direccion: string;
  /** «Casa, apartamento, etc. (opcional)». */
  interior: string;
  codigoPostal: string;
  ciudad: string;
  /** Clave del estado (p. ej. «SIN» para Sinaloa), de ESTADOS. */
  estado: string;
  telefono: string;
};

export type MetodoPago = "tarjeta" | "paypal" | "mercadopago";

export type DatosPago = {
  correo: string;
  /** «Enviarme novedades y ofertas por correo electrónico». */
  novedades: boolean;
  entrega: Direccion;
  /** «Guardar mi información y consultar más rápidamente la próxima vez» (se guarda solo en este navegador). */
  guardarInfo: boolean;
  metodo: MetodoPago;
  /** Con tarjeta: «Usar la dirección de envío como dirección de facturación». Con PayPal o Mercado Pago: la opción
   * «La misma dirección de envío» / «Usar una dirección de facturación distinta». */
  facturacionIgual: boolean;
  facturacion?: Direccion;
  codigoDescuento?: string;
  lineas: LineaPedido[];
  /** Con tarjeta: lo que entregan los campos seguros de Mercado Pago (la tarjeta nunca pasa por nuestro servidor). */
  tarjeta?: { token: string; metodoPagoId: string; emisorId?: string; meses: number };
};

export type LineaResumen = {
  id: number;
  titulo: string;
  /** Tamaño; null si el producto no tiene opciones. */
  opcion: string | null;
  cantidad: number;
  precio: number;
  imagen: string | null;
};

export type Resumen = {
  lineas: LineaResumen[];
  piezas: number;
  subtotal: number;
  descuento: { codigo: string; monto: number } | null;
  /** null mientras no hay dirección completa («Introducir la dirección de envío»). */
  envio: { nombre: string; costo: number } | null;
  total: number;
  /** Variantes que se quitaron o ajustaron por existencias (con el mismo aviso del carrito). */
  avisos: string[];
};

export type ErrorCampo =
  | "correo"
  | "nombre"
  | "apellidos"
  | "direccion"
  | "codigoPostal"
  | "ciudad"
  | "estado"
  | "telefono"
  | "tarjeta"
  | "codigoDescuento"
  | "facturacion";

export type ResultadoPedido =
  | { ok: true; pedido: number; siguiente: { tipo: "gracias"; url: string } | { tipo: "redirigir"; url: string } }
  | { ok: false; errores: Partial<Record<ErrorCampo, string>>; mensaje?: string };

// Estados de México (clave de 3 letras y nombre), en el orden en que los lista la tienda.
export const ESTADOS: { clave: string; nombre: string }[] = [
  { clave: "AGU", nombre: "Aguascalientes" },
  { clave: "BCN", nombre: "Baja California" },
  { clave: "BCS", nombre: "Baja California Sur" },
  { clave: "CAM", nombre: "Campeche" },
  { clave: "CHP", nombre: "Chiapas" },
  { clave: "CHH", nombre: "Chihuahua" },
  { clave: "DIF", nombre: "Ciudad de México" },
  { clave: "COA", nombre: "Coahuila" },
  { clave: "COL", nombre: "Colima" },
  { clave: "DUR", nombre: "Durango" },
  { clave: "MEX", nombre: "Estado de México" },
  { clave: "GUA", nombre: "Guanajuato" },
  { clave: "GRO", nombre: "Guerrero" },
  { clave: "HID", nombre: "Hidalgo" },
  { clave: "JAL", nombre: "Jalisco" },
  { clave: "MIC", nombre: "Michoacán" },
  { clave: "MOR", nombre: "Morelos" },
  { clave: "NAY", nombre: "Nayarit" },
  { clave: "NLE", nombre: "Nuevo León" },
  { clave: "OAX", nombre: "Oaxaca" },
  { clave: "PUE", nombre: "Puebla" },
  { clave: "QUE", nombre: "Querétaro" },
  { clave: "ROO", nombre: "Quintana Roo" },
  { clave: "SLP", nombre: "San Luis Potosí" },
  { clave: "SIN", nombre: "Sinaloa" },
  { clave: "SON", nombre: "Sonora" },
  { clave: "TAB", nombre: "Tabasco" },
  { clave: "TAM", nombre: "Tamaulipas" },
  { clave: "TLA", nombre: "Tlaxcala" },
  { clave: "VER", nombre: "Veracruz" },
  { clave: "YUC", nombre: "Yucatán" },
  { clave: "ZAC", nombre: "Zacatecas" },
];
