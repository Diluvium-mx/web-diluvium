// Sección «c-encabezado»: encabezado blanco de C con logo a color, carrito y «Menú» escrito (EncabezadoCCliente).

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
      whatsapp={texto(a, "whatsapp_link")}
      telefono={texto(a, "phone_link")}
      textoTelefono={tx(a, "phone_text", "Llámanos al (668) 241 9579")}
      textoMenu={tx(a, "menu_text", "Menú")}
      paginas={menus.principal.enlaces.map((e) => ({ texto: e.texto, url: e.url }))}
    />
  );
}
