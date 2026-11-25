// Sección «d-encabezado»: la franja de avisos y el encabezado blanco de D (EncabezadoDCliente). Avisos: piezas «notice»
// (ícono y texto). Menú: piezas «link» (texto, dirección y grupo: «productos» va bajo «Productos» en el menú; los demás
// también salen arriba en la computadora).

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { marcaEditar } from "@/lib/mapa";
import { conMensaje, textoVersion, tx } from "../landing/datos";
import { EncabezadoDCliente } from "./EncabezadoDCliente";

export function EncabezadoD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <EncabezadoDCliente
      logo={texto(a, "logo")}
      logoMarca={marcaEditar(seccion.id, "", "logo")}
      avisos={seccion.bloques.filter((b) => b.tipo === "notice" && texto(b.ajustes, "text")).map((b) => ({ id: b.id, icono: texto(b.ajustes, "icon"), texto: textoVersion(b.ajustes, "text") }))}
      enlaces={seccion.bloques
        .filter((b) => b.tipo === "link" && texto(b.ajustes, "text") && texto(b.ajustes, "url"))
        .map((b) => ({ id: b.id, texto: textoVersion(b.ajustes, "text"), url: texto(b.ajustes, "url"), grupo: texto(b.ajustes, "group") }))}
      whatsapp={whatsapp ? conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, vi su página, ¿me pueden dar información sobre la compuerta anti-inundaciones?")) : ""}
      textos={{
        menu: tx(a, "menu_text", "Menú"),
        cerrar: tx(a, "close_text", "Cerrar"),
        whatsapp: tx(a, "whatsapp_text", "WhatsApp"),
        whatsappMenu: tx(a, "whatsapp_menu_text", "Escríbenos por WhatsApp"),
        productos: tx(a, "products_heading", "Productos"),
        ayuda: tx(a, "pages_heading", "Diluvium"),
      }}
    />
  );
}
