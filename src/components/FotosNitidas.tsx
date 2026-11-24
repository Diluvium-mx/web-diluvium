"use client";

// Fotos nítidas (Contacto 5, dueño 24-nov-2026). El navegador elige qué tamaño de una foto bajar con «sizes», que dice
// qué tan ancho es su marco. Pero una foto que llena su marco («object-cover») se ve más ancha que él cuando no tiene
// su misma forma (oficina.jpg, casi 2 a 1, en un marco 4:3 se ve 1.4 veces más ancha) y el acercamiento del editor la
// agranda todavía más (1.1 en Contacto): bajaba una copia del ancho del marco, el navegador la estiraba 1.6 veces y se
// veía borrosa. Aquí se mide qué tan ancha se ve de verdad cada foto en esta pantalla y, si es bastante más que su
// marco, se le dice al navegador con «sizes» para que baje una copia de ese tamaño. Se vuelve a medir al cargar una
// foto, al cambiar el tamaño de la pantalla y cuando el editor mueve el acercamiento.

import { useEffect } from "react";

/** Qué tan ancha se ve la foto (px de la página), con su forma, cómo llena el marco y su acercamiento. */
function anchoVisto(img: HTMLImageElement): number | null {
  const W = img.clientWidth;
  const H = img.clientHeight;
  // Con «srcset», naturalWidth y naturalHeight vienen divididos entre la densidad, pero su forma es la real.
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!W || !H || !w || !h) return null;
  const estilo = getComputedStyle(img);
  let ancho = W;
  if (estilo.objectFit === "cover") ancho = Math.max(W, (H * w) / h);
  else if (estilo.objectFit === "contain" || estilo.objectFit === "scale-down") ancho = Math.min(W, (H * w) / h);
  // Acercamiento del editor (scale) o lo que crece una foto alejada (--alejar-escala, AlejarFotos.tsx).
  const m = estilo.transform.match(/^matrix\(([-\d.e]+),\s*([-\d.e]+)/);
  const escala = m ? Math.hypot(Number(m[1]), Number(m[2])) : 1;
  return ancho * escala;
}

function ajustar(img: HTMLImageElement) {
  if (!img.srcset || !img.getAttribute("sizes")) return;
  const visto = anchoVisto(img);
  if (!visto) return;
  const original = img.dataset.sizesOriginal;
  if (visto > img.clientWidth * 1.1) {
    const nuevo = `${Math.ceil(visto)}px`;
    const actual = parseFloat(img.getAttribute("sizes") ?? "");
    // Solo si cambia bastante (que no se pida otra copia por unos pocos píxeles).
    if (original !== undefined && actual && Math.abs(actual - visto) / visto < 0.1) return;
    if (original === undefined) img.dataset.sizesOriginal = img.getAttribute("sizes") ?? "";
    img.setAttribute("sizes", nuevo);
  } else if (original !== undefined) {
    img.setAttribute("sizes", original);
    delete img.dataset.sizesOriginal;
  }
}

export function FotosNitidas() {
  useEffect(() => {
    const todas = () => document.querySelectorAll<HTMLImageElement>("img[srcset]").forEach(ajustar);
    todas();
    const alCargar = (e: Event) => {
      if (e.target instanceof HTMLImageElement) ajustar(e.target);
    };
    document.addEventListener("load", alCargar, true);
    let cuadro = 0;
    const alCambiarTamano = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(todas);
    };
    window.addEventListener("resize", alCambiarTamano);
    // El editor cambia el estilo de la foto (acercamiento, encuadre) al moverlo.
    const vigia = new MutationObserver((cambios) => {
      for (const c of cambios) if (c.target instanceof HTMLImageElement) ajustar(c.target);
    });
    vigia.observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });
    return () => {
      document.removeEventListener("load", alCargar, true);
      window.removeEventListener("resize", alCambiarTamano);
      cancelAnimationFrame(cuadro);
      vigia.disconnect();
    };
  }, []);
  return null;
}
