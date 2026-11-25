// Sección «d-especificaciones»: la ficha técnica, como en las tiendas grandes: una tabla de dos columnas (qué y
// cuánto) en renglones grandes con un renglón sí y otro no en gris. Piezas «spec»: dato y valor. Abajo, una nota.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { datosVenta, textoVersion } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoD, EtiquetaD, TituloD } from "./comun";

export function EspecificacionesD({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const venta = datosVenta(texto(a, "producto") || producto?.nombre || undefined);
  const datos = seccion.bloques.filter((b) => b.tipo === "spec" && texto(b.ajustes, "label"));
  if (!datos.length) return null;
  return (
    <section data-seccion="d-especificaciones" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoD(texto(a, "fondo") || "blanco")} py-12 md:py-20`}>
      <div className="marco-version max-w-[900px]">
        <EtiquetaD>{formato(textoVersion(a, "subheading", venta))}</EtiquetaD>
        <TituloD id={`titulo-${seccion.id}`}>{formato(textoVersion(a, "heading", venta))}</TituloD>
        <table className="mt-7 w-full border-collapse overflow-hidden rounded-xl text-left text-[17px] ring-1 ring-[#dde2e8] md:text-[18px]">
          <tbody>
            {datos.map((b, i) => (
              <tr key={b.id} data-pieza={b.id} className={i % 2 ? "bg-white" : "bg-[#f4f6f8]"}>
                <th scope="row" className="w-[42%] px-4 py-4 align-top font-titulo font-semibold text-[#0b2545] md:px-6">
                  {textoVersion(b.ajustes, "label", venta)}
                </th>
                <td className="px-4 py-4 align-top leading-[1.5] text-[#1f2a37] md:px-6">{formato(textoVersion(b.ajustes, "value", venta))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {texto(a, "note") && <p className="m-0 mt-4 text-[16px] leading-[1.5] text-[#4a5568]">{formato(textoVersion(a, "note", venta))}</p>}
      </div>
    </section>
  );
}
