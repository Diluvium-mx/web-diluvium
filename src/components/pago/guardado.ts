// «Guardar mi información y consultar más rápidamente la próxima vez»: el correo, la casilla de novedades y la
// dirección de entrega quedan SOLO en este navegador (localStorage) para llenar la pantalla la próxima vez. Nunca se
// guarda nada del pago. Todo acceso al almacenamiento va con try/catch (modo privado, almacenamiento bloqueado).

import type { Direccion } from "@/lib/pago/tipos";

const CLAVE = "diluvium-pago-datos";

export type DatosGuardados = { correo: string; novedades: boolean; entrega: Direccion };

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export function leerGuardado(): DatosGuardados | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const d = JSON.parse(crudo) as { correo?: unknown; novedades?: unknown; entrega?: Partial<Record<keyof Direccion, unknown>> };
    const e = d.entrega ?? {};
    return {
      correo: texto(d.correo, 160),
      novedades: d.novedades === true,
      entrega: {
        pais: "MX",
        nombre: texto(e.nombre, 80),
        apellidos: texto(e.apellidos, 80),
        direccion: texto(e.direccion, 160),
        interior: texto(e.interior, 120),
        codigoPostal: texto(e.codigoPostal, 5),
        ciudad: texto(e.ciudad, 80),
        estado: texto(e.estado, 3),
        telefono: texto(e.telefono, 20),
      },
    };
  } catch {
    return null;
  }
}

export function guardar(datos: DatosGuardados) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento: no se guarda, la compra sigue igual.
  }
}

export function olvidar() {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento: no había nada guardado.
  }
}
