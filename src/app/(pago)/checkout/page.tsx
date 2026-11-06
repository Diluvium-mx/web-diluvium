import type { Metadata } from "next";
import { PantallaPago } from "@/components/pago/PantallaPago";

// /checkout: la pantalla de pago. El carrito vive en el navegador, así que la pantalla se arma allá
// (src/components/pago/PantallaPago.tsx); los precios los calcula siempre el servidor (src/lib/pago/acciones.ts).

export const metadata: Metadata = {
  title: { absolute: "Pantalla de pago – Diluvium" },
  robots: { index: false, follow: false },
};

export default function PaginaPago() {
  return <PantallaPago />;
}
