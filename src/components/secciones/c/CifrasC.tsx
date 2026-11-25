// Sección «c-cifras» (la parte del servidor): toma las piezas «stat» de la plantilla y las pasa al contador.

import type { PropsSeccion } from "../registro";
import { textoVersion } from "../landing/datos";
import { CifrasCCliente } from "./CifrasCCliente";

export function CifrasC({ seccion }: PropsSeccion) {
  const cifras = seccion.bloques
    .filter((b) => b.tipo === "stat")
    .map((b) => ({ id: b.id, numero: textoVersion(b.ajustes, "number"), texto: textoVersion(b.ajustes, "label") }));
  return <CifrasCCliente cifras={cifras} titulo={textoVersion(seccion.ajustes, "heading")} />;
}
