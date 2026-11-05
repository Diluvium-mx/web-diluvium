"use client";

// Ojito para ver u ocultar la contraseña en la pantalla de entrada, igual que el del CRM (crm-diluvium › sign-in).
// Payload arma el formulario solo, así que el botón se agrega dentro del cuadro de la contraseña (#field-password).

import { useEffect } from "react";

const OJO =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
const OJO_TACHADO =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>';

function ponerOjo() {
  const campo = document.querySelector<HTMLInputElement>("input#field-password");
  const caja = campo?.parentElement;
  if (!campo || !caja || caja.querySelector(".ojo-contrasena")) return;
  caja.classList.add("con-ojo");
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "ojo-contrasena";
  boton.setAttribute("data-no-glow", "");
  const pintar = () => {
    const visible = campo.type === "text";
    boton.innerHTML = visible ? OJO_TACHADO : OJO;
    boton.setAttribute("aria-label", visible ? "Ocultar contraseña" : "Mostrar contraseña");
    boton.setAttribute("aria-pressed", String(visible));
    boton.title = visible ? "Ocultar contraseña" : "Mostrar contraseña";
  };
  boton.addEventListener("click", () => {
    campo.type = campo.type === "password" ? "text" : "password";
    pintar();
    campo.focus();
  });
  pintar();
  caja.appendChild(boton);
}

/** Va antes del formulario de entrada; espera a que Payload pinte el cuadro de la contraseña. */
export function OjoContrasena() {
  useEffect(() => {
    ponerOjo();
    const observador = new MutationObserver(ponerOjo);
    observador.observe(document.body, { childList: true, subtree: true });
    return () => observador.disconnect();
  }, []);
  return null;
}
