// Sección «landing-encabezado»: encabezado de las versiones B (sin las 2 barras de arriba de la tienda). Los enlaces
// «En esta página» son las piezas de la sección; los de la tienda salen del menú principal (contenido/menus.json).

import menus from "@contenido/menus.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { TEXTOS_CARRITO, type TextosCarrito } from "./textos";
import { tx } from "./datos";
import { EncabezadoCliente } from "./EncabezadoCliente";

// Clave de cada texto del carrito en la plantilla (se editan en la pestaña Textos del editor).
const CLAVES_CARRITO: Record<keyof TextosCarrito, string> = {
  titulo: "cart_title",
  agregado: "cart_added",
  envio: "cart_shipping",
  gratis: "cart_free",
  total: "cart_total",
  nota: "cart_note",
  pagar: "cart_pay",
  seguir: "cart_continue",
  quitar: "cart_remove",
  vacio: "cart_empty",
  vacioBoton: "cart_empty_button",
};

export function EncabezadoVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const enPagina = seccion.bloques
    .filter((b) => b.tipo === "link" && texto(b.ajustes, "text") && texto(b.ajustes, "url"))
    .map((b) => ({ texto: texto(b.ajustes, "text"), url: texto(b.ajustes, "url") }));
  return (
    <EncabezadoCliente
      logo={texto(a, "logo")}
      botonTexto={texto(a, "button_text")}
      botonEnlace={texto(a, "button_link")}
      menuTexto={texto(a, "menu_text")}
      whatsapp={texto(a, "whatsapp_link")}
      enPagina={enPagina}
      tienda={menus.principal.enlaces}
      textosCarrito={Object.fromEntries(Object.entries(CLAVES_CARRITO).map(([k, c]) => [k, tx(a, c, TEXTOS_CARRITO[k as keyof TextosCarrito])])) as TextosCarrito}
      textoEnPagina={tx(a, "menu_page_heading", "En esta página")}
      textoTienda={tx(a, "menu_store_heading", "Tienda")}
    />
  );
}
