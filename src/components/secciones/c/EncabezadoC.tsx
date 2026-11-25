// Sección «c-encabezado»: barra oscura y delgada con el logo blanco, el carrito y «Comprar». El menú abre un panel a
// pantalla completa con las páginas en letra grande (nada parecido al encabezado blanco de B ni al de la tienda).

import menus from "@contenido/menus.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { marcaEditar } from "@/lib/mapa";
import { tx } from "../landing/datos";
import { EncabezadoCCliente } from "./EncabezadoCCliente";

export function EncabezadoC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  return (
    <EncabezadoCCliente
      logo={texto(a, "logo")}
      logoMarca={marcaEditar(seccion.id, "", "logo")}
      boton={tx(a, "button_text", "Comprar")}
      enlaceBoton={tx(a, "button_link", "/products/compuerta-anti-inundaciones")}
      whatsapp={texto(a, "whatsapp_link")}
      textoMenu={tx(a, "menu_text", "Menú")}
      paginas={menus.principal.enlaces.map((e) => ({ texto: e.texto, url: e.url }))}
    />
  );
}
