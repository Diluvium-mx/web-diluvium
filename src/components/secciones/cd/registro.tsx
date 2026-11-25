// Piezas de las páginas secundarias de C y D (25-nov-2026): título de la página, productos, contacto, historia,
// premios, mensaje con firma, blog y artículo. Cada pieza es una sola con dos estilos («c» o «d», estilo.tsx),
// registrada con su tipo propio en cada versión (c-titulo, d-titulo…).

import type { ComponentType } from "react";
import type { PropsSeccion } from "../registro";
import type { Estilo } from "./estilo";
import { TituloCD } from "./TituloCD";
import { ProductosCD } from "./ProductosCD";
import { ContactoCD } from "./ContactoCD";
import { CitaCD, HistoriaCD, PremiosCD } from "./NosotrosCD";
import { ArticuloCD, BlogCD } from "./BlogCD";

type PiezaCD = ComponentType<PropsSeccion & { estilo: Estilo }>;

const PIEZAS: Record<string, PiezaCD> = {
  titulo: TituloCD,
  productos: ProductosCD,
  contacto: ContactoCD,
  historia: HistoriaCD,
  premios: PremiosCD,
  cita: CitaCD,
  blog: BlogCD,
  articulo: ArticuloCD,
};

function conEstilo(Pieza: PiezaCD, estilo: Estilo): ComponentType<PropsSeccion> {
  function PiezaConEstilo(props: PropsSeccion) {
    return <Pieza {...props} estilo={estilo} />;
  }
  return PiezaConEstilo;
}

export const PIEZAS_CD: Record<string, ComponentType<PropsSeccion>> = Object.fromEntries(
  (["c", "d"] as const).flatMap((estilo) => Object.entries(PIEZAS).map(([nombre, Pieza]) => [`${estilo}-${nombre}`, conEstilo(Pieza, estilo)])),
);
