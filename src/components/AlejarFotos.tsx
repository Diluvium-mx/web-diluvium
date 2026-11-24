"use client";

// Fotos alejadas en el editor (acercamiento abajo de 1, Portada 92, dueño 24-nov-2026). estiloFoto las deja
// «contenidas» (se ve la foto completa) con «--alejar» = cuánto se alejó (0.5 a 1). Aquí se calcula, con el tamaño
// real del marco en esta pantalla, cuánto crecerla para que el paso sea parejo: en 0.5 la foto completa, en 1 igual
// que sin alejar (llenando el marco). Lo que queda libre alrededor se pinta con el color de la orilla de la foto
// (blanco en las fotos con fondo blanco), para que no se vean franjas de otro color. Se recalcula si cambia el
// tamaño de la pantalla o si el editor mueve el ajuste.

import { useEffect } from "react";

const MINIMO = 0.5;

/** Color de la orilla de la foto (la mediana del borde exterior), para el espacio libre alrededor: en una foto con
 *  fondo blanco sale blanco aunque cerca de la orilla haya otras cosas. */
function colorOrilla(img: HTMLImageElement): string | null {
  try {
    const lado = 64;
    const lienzo = document.createElement("canvas");
    lienzo.width = lado;
    lienzo.height = lado;
    const ctx = lienzo.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, lado, lado);
    const { data } = ctx.getImageData(0, 0, lado, lado);
    const canales: [number[], number[], number[]] = [[], [], []];
    for (let y = 0; y < lado; y++) {
      for (let x = 0; x < lado; x++) {
        if (x !== 0 && y !== 0 && x !== lado - 1 && y !== lado - 1) continue;
        const k = (y * lado + x) * 4;
        canales[0].push(data[k]);
        canales[1].push(data[k + 1]);
        canales[2].push(data[k + 2]);
      }
    }
    const mediana = (v: number[]) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)];
    return `rgb(${mediana(canales[0])}, ${mediana(canales[1])}, ${mediana(canales[2])})`;
  } catch {
    return null;
  }
}

function ajustar(img: HTMLImageElement) {
  const z = parseFloat(img.style.getPropertyValue("--alejar"));
  if (!(z >= MINIMO && z < 1)) {
    if (img.dataset.alejada) {
      img.style.removeProperty("--alejar-escala");
      img.style.removeProperty("background-color");
      delete img.dataset.alejada;
    }
    return;
  }
  const W = img.clientWidth;
  const H = img.clientHeight;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!W || !H || !w || !h) return;
  // Cuánto más grande es «llenar el marco» que «foto completa» en este marco.
  const llenar = Math.max(W / w, H / h) / Math.min(W / w, H / h);
  const escala = (1 + (llenar - 1) * ((z - MINIMO) / (1 - MINIMO))).toFixed(4);
  if (img.style.getPropertyValue("--alejar-escala") !== escala) img.style.setProperty("--alejar-escala", escala);
  if (!img.dataset.alejada) {
    img.dataset.alejada = "1";
    const color = colorOrilla(img);
    if (color) img.style.backgroundColor = color;
  }
}

export function AlejarFotos() {
  useEffect(() => {
    const todas = () => document.querySelectorAll<HTMLImageElement>("img").forEach((img) => (img.style.getPropertyValue("--alejar") || img.dataset.alejada) && ajustar(img));
    todas();
    // Una foto nueva (o cambiada en el editor) vuelve a tomar el color de su orilla.
    const alCargar = (e: Event) => {
      if (!(e.target instanceof HTMLImageElement)) return;
      delete e.target.dataset.alejada;
      ajustar(e.target);
    };
    document.addEventListener("load", alCargar, true);
    window.addEventListener("resize", todas);
    // El editor cambia el estilo de la foto al mover el ajuste: se vuelve a calcular.
    const vigia = new MutationObserver((cambios) => {
      for (const c of cambios) if (c.target instanceof HTMLImageElement) ajustar(c.target);
    });
    vigia.observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });
    return () => {
      document.removeEventListener("load", alCargar, true);
      window.removeEventListener("resize", todas);
      vigia.disconnect();
    };
  }, []);
  return null;
}
