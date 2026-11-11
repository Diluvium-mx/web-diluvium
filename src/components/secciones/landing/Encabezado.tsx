// Sección «landing-encabezado»: encabezado de las versiones B (sin las 2 barras de arriba de la tienda). Los enlaces
// «En esta página» son las piezas de la sección; los de la tienda salen del menú principal (contenido/menus.json).

import menus from "@contenido/menus.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { EncabezadoCliente } from "./EncabezadoCliente";

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
    />
  );
}
