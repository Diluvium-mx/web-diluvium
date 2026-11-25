"use client";

// Botón «Abrir todas» / «Cerrar todas» de las dudas de D (como el «Expandir todas» de Andafacil): abre o cierra todas
// las preguntas de su lista de una vez.

import { useState } from "react";

export function AbrirTodasD({ lista, abrir, cerrar }: { lista: string; abrir: string; cerrar: string }) {
  const [abiertas, setAbiertas] = useState(false);
  return (
    <button
      type="button"
      aria-controls={lista}
      onClick={() => {
        const todas = !abiertas;
        for (const d of document.getElementById(lista)?.querySelectorAll("details") ?? []) {
          // Sin «name» para que puedan quedar abiertas varias a la vez.
          d.removeAttribute("name");
          d.open = todas;
        }
        setAbiertas(todas);
      }}
      className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-[#0b2545] bg-white px-4 text-[17px] font-semibold text-[#0b2545] hover:bg-[#0b2545] hover:text-white"
    >
      <span aria-hidden="true" className="text-[22px] leading-none">
        {abiertas ? "−" : "+"}
      </span>
      {abiertas ? cerrar : abrir}
    </button>
  );
}
