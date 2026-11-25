// Piezas propias de la versión D (25-nov-2026): portada, ficha, asistente para elegir el tamaño, reseñas por páginas,
// las 12 dudas, confianza, ficha técnica, otros productos, encabezado, pie y WhatsApp flotante.

import type { ComponentType } from "react";
import type { PropsSeccion } from "../registro";
import { EncabezadoD } from "./EncabezadoD";
import { PortadaD } from "./PortadaD";
import { AsistenteD } from "./AsistenteD";
import { FichaD } from "./FichaD";
import { ResenasD } from "./ResenasD";
import { DudasD } from "./DudasD";
import { ConfianzaD } from "./ConfianzaD";
import { EspecificacionesD } from "./EspecificacionesD";
import { OtrosD } from "./OtrosD";
import { PagosD } from "./PagosD";
import { CierreD } from "./CierreD";
import { PieD } from "./PieD";
import { BarraD } from "./BarraD";

export const PIEZAS_D: Record<string, ComponentType<PropsSeccion>> = {
  "d-encabezado": EncabezadoD,
  "d-portada": PortadaD,
  "d-asistente": AsistenteD,
  "d-ficha": FichaD,
  "d-resenas": ResenasD,
  "d-dudas": DudasD,
  "d-confianza": ConfianzaD,
  "d-especificaciones": EspecificacionesD,
  "d-otros": OtrosD,
  "d-pagos": PagosD,
  "d-cierre": CierreD,
  "d-pie": PieD,
  "d-barra": BarraD,
};
