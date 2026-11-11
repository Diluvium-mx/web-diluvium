// Datos que las secciones de las versiones sacan del catálogo y de las reseñas publicadas, para que precio, tamaños y
// calificación nunca se escriban a mano: el administrador sigue siendo quien manda (contenido/productos.json y
// contenido/resenas.json). Los textos pueden llevar {precio}, {precio_antes}, {desde}, {hasta}, {tamanos} y
// {calificacion}, que se cambian por los datos reales.

import { producto as buscarProducto } from "@/components/producto/catalogo";
import { articulo } from "@/components/carrito/catalogo";
import { calificacionTienda, redondear } from "@/components/resenas/calificaciones";
import type { Ajustes } from "@/lib/contenido";
import { texto } from "@/lib/contenido";

/** Producto que venden las versiones si la sección no dice otro. */
export const PRODUCTO_PRINCIPAL = "compuerta-anti-inundaciones";

export type Tamano = {
  id: number;
  /** «Extra Chica». */
  nombre: string;
  /** «69–78 cm», o vacío si el tamaño no trae medidas. */
  medidas: string;
  precio: number;
  precioAntes: number | null;
  /** Piezas en existencia (null: sin control). */
  existencias: number | null;
};

export type DatosVenta = {
  nombre: string;
  enlace: string;
  precio: number;
  precioAntes: number | null;
  desde: number | null;
  hasta: number | null;
  tamanos: Tamano[];
};

/** 5500 → «$5,500», como se vende por WhatsApp y en los anuncios. */
export function pesos(cantidad: number): string {
  return `$${cantidad.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const MEDIDAS = /^(.*?)\s*\((\d+)\s*cm a (\d+)\s*cm\)\s*$/i;

/** Precio, precio anterior y tamaños del producto (por su nombre en la dirección). */
export function datosVenta(nombre: string = PRODUCTO_PRINCIPAL): DatosVenta | null {
  const p = buscarProducto(nombre || PRODUCTO_PRINCIPAL);
  if (!p || p.variantes.length === 0) return null;
  const tamanos: Tamano[] = p.variantes.map((v) => {
    const m = v.titulo.match(MEDIDAS);
    return {
      id: v.id,
      nombre: m ? m[1] : v.titulo,
      medidas: m ? `${m[2]}–${m[3]} cm` : "",
      precio: v.precio,
      precioAntes: v.precioAntes && v.precioAntes > v.precio ? v.precioAntes : null,
      existencias: articulo(v.id)?.existencias ?? null,
    };
  });
  const rangos = p.variantes.map((v) => v.titulo.match(MEDIDAS)).filter((m): m is RegExpMatchArray => Boolean(m));
  const precio = Math.min(...tamanos.map((t) => t.precio));
  const antes = tamanos.filter((t) => t.precio === precio).map((t) => t.precioAntes ?? 0);
  return {
    nombre: p.titulo,
    enlace: `/products/${p.nombre}`,
    precio,
    precioAntes: Math.max(...antes) > precio ? Math.max(...antes) : null,
    desde: rangos.length ? Math.min(...rangos.map((m) => Number(m[2]))) : null,
    hasta: rangos.length ? Math.max(...rangos.map((m) => Number(m[3]))) : null,
    tamanos,
  };
}

/** Calificación de la tienda con 1 decimal («4.9»), calculada con todas las reseñas publicadas. */
export function calificacion(): string {
  return redondear(calificacionTienda().promedio, 1).toFixed(1);
}

/** Cambia {precio}, {desde}… por los datos reales. Lo que no se conoce se deja tal cual para que se note. */
export function rellenar(plantillaTexto: string, venta: DatosVenta | null = datosVenta()): string {
  const valores: Record<string, string | null> = {
    precio: venta ? pesos(venta.precio) : null,
    precio_antes: venta?.precioAntes ? pesos(venta.precioAntes) : null,
    desde: venta?.desde != null ? String(venta.desde) : null,
    hasta: venta?.hasta != null ? String(venta.hasta) : null,
    tamanos: venta ? String(venta.tamanos.length) : null,
    calificacion: calificacion(),
  };
  return plantillaTexto.replace(/\{(\w+)\}/g, (todo, clave: string) => valores[clave] ?? todo);
}

/** Texto de un ajuste ya rellenado. */
export function textoVersion(ajustes: Ajustes, clave: string, venta?: DatosVenta | null): string {
  return rellenar(texto(ajustes, clave), venta === undefined ? datosVenta() : venta);
}
