"use client";

// Dentro de una versión (/v/<clave>…), los enlaces se quedan en la versión: «/products/compuerta-anti-inundaciones»
// lleva a la ficha de esa versión y el logo («/») a su portada. Así el contenido guarda las direcciones de la tienda
// (las mismas que en Shopify, para poder pasar una versión tal cual) y la prueba no se sale de la versión a la mitad.
// Las versiones con páginas propias (B1, 23-nov-2026) también se quedan en su Contacto, Nosotros, Blog y Productos.

import { useEffect } from "react";
import { PAGINAS_VERSION, PRODUCTOS_VERSION } from "@/lib/versiones";

export function EnlacesVersion({ clave, conPaginas = false }: { clave: string; conPaginas?: boolean }) {
  useEffect(() => {
    const base = `/v/${clave}`;
    for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const href = a.getAttribute("href") ?? "";
      const [ruta, resto = ""] = href.split(/(?=[?#])/);
      if (ruta === "/") a.setAttribute("href", base + resto);
      else if (conPaginas && (Object.hasOwn(PAGINAS_VERSION, ruta) || /^\/blogs\/blog\/[\w-]+$/.test(ruta))) a.setAttribute("href", base + ruta + resto);
      else {
        const m = ruta.match(/^\/(?:collections\/[^/]+\/)?products\/([^/]+)$/);
        if (m && PRODUCTOS_VERSION.includes(m[1])) a.setAttribute("href", `${base}/products/${m[1]}${resto}`);
      }
    }
  }, [clave, conPaginas]);
  return null;
}
