// Fecha estimada de entrega, con las mismas reglas que tiene configuradas la app de la tienda (NestScale, leídas en
// vivo el 3-nov-2026): se prepara en 2 a 6 días hábiles (lunes a viernes), la entrega tarda 0 días más, sin días
// festivos ni hora de corte, y se cuenta con la hora del navegador del cliente.

const DIAS_PREPARACION = { min: 2, max: 6 };
const DIAS_ENTREGA = { min: 0, max: 0 };
const DIAS_HABILES = new Set([1, 2, 3, 4, 5]); // lunes a viernes
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function sumarHabiles(desde: Date, dias: number): Date {
  const fecha = new Date(desde);
  let faltan = dias;
  while (faltan > 0) {
    fecha.setDate(fecha.getDate() + 1);
    if (DIAS_HABILES.has(fecha.getDay())) faltan--;
  }
  // Con 0 días, si cae en fin de semana se recorre al siguiente día hábil.
  while (!DIAS_HABILES.has(fecha.getDay())) fecha.setDate(fecha.getDate() + 1);
  return fecha;
}

/** «nov 03», como el formato «MMM DD» de la app. */
export function fechaCorta(fecha: Date): string {
  return `${MESES[fecha.getMonth()]} ${String(fecha.getDate()).padStart(2, "0")}`;
}

/** Fechas de los tres pasos: pedido (hoy), en ruta (rango de preparación) y entrega (la más tardía). */
export function fechasEntrega(hoy: Date = new Date()) {
  const listoMin = sumarHabiles(hoy, DIAS_PREPARACION.min);
  const listoMax = sumarHabiles(hoy, DIAS_PREPARACION.max);
  const entrega = DIAS_ENTREGA.max > 0 ? sumarHabiles(listoMax, DIAS_ENTREGA.max) : listoMax;
  return {
    pedido: fechaCorta(hoy),
    enRuta: `${fechaCorta(listoMin)} - ${fechaCorta(listoMax)}`,
    entrega: fechaCorta(entrega),
  };
}
