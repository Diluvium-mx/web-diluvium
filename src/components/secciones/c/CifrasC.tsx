// Sección «c-cifras»: franja azul marino con 4 números grandes y quietos (+2,000 vendidas, 4.9 de calificación, 1 año
// de garantía, 3 a 5 días). Desde el 25-nov-2026 ya no cuentan desde cero: se leen de inmediato. Piezas «stat».

import type { PropsSeccion } from "../registro";
import { textoVersion } from "../landing/datos";

export function CifrasC({ seccion }: PropsSeccion) {
  const cifras = seccion.bloques.filter((b) => b.tipo === "stat");
  return (
    <section data-seccion="c-cifras" aria-label={textoVersion(seccion.ajustes, "heading") || "Diluvium en números"} className="bg-[#06182f] py-10 text-white md:py-14">
      <dl className="marco-version m-0 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
        {cifras.map((b) => (
          <div key={b.id} data-pieza={b.id}>
            <dt className="font-titulo text-[40px] leading-none font-semibold text-[#9fd2fb] md:text-[52px]">{textoVersion(b.ajustes, "number")}</dt>
            <dd className="m-0 mt-2 text-[17px] leading-snug text-white">{textoVersion(b.ajustes, "label")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
