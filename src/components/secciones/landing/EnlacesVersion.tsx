"use client";

// Dentro de una versión (/v/<clave>…), los enlaces se quedan en la versión: «/products/compuerta-anti-inundaciones»
// lleva a la ficha de esa versión y el logo («/») a su portada. Así el contenido guarda las direcciones de la tienda
// (las mismas que en Shopify, para poder pasar una versión tal cual) y la prueba no se sale de la versión a la mitad.

import { useEffect } from "react";
import { PRODUCTOS_VERSION } from "@/lib/versiones";

export function EnlacesVersion({ clave }: { clave: string }) {
  useEffect(() => {
    const base = `/v/${clave}`;
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const href = a.getAttribute("href") ?? "";
      const [ruta, resto = ""] = href.split(/(?=[?#])/);
      if (ruta === "/") a.setAttribute("href", base + resto);
      else {
        const m = ruta.match(/^\/(?:collections\/[^/]+\/)?products\/([^/]+)$/);
        if (m && PRODUCTOS_VERSION.includes(m[1])) a.setAttribute("href", `${base}/products/${m[1]}${resto}`);
      }
    }
  }, [clave]);
  return null;
}
