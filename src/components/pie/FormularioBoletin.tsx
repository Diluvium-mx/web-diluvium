"use client";

// Suscripción al boletín del pie. Como en vivo: guarda el correo (aquí en el administrador, Ventas › Suscriptores) y
// abajo sale «Gracias por suscribirse» con la palomita verde, o el aviso en rojo si el correo no sirve.

import { useState, useTransition } from "react";
import { IconoExistencias } from "@/components/producto/ficha/Iconos";
import { suscribir } from "@/lib/formularios/acciones";
import { useTrampa } from "@/components/comunes/Trampa";

export function FormularioBoletin({ boton }: { boton: string }) {
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [enviando, iniciar] = useTransition();
  const { CampoTrampa, datos } = useTrampa();

  return (
    <form
      className="relative mt-2"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const forma = e.currentTarget;
        const correo = String(new FormData(forma).get("contact[email]") ?? "");
        iniciar(async () => {
          const r = await suscribir(correo, "pie", datos());
          setAviso(r.ok ? { ok: true, texto: "Gracias por suscribirse" } : { ok: false, texto: r.error });
          if (r.ok) forma.reset();
        });
      }}
    >
      {CampoTrampa}
      <div className="flex flex-col gap-3 md:flex-row xl:flex-col">
        <label className="sr-only" htmlFor="boletin-correo">
          Correo electrónico
        </label>
        <input
          id="boletin-correo"
          name="contact[email]"
          type="email"
          required
          autoComplete="email"
          placeholder="Introduce su dirección de correo electrónico"
          aria-invalid={aviso && !aviso.ok ? true : undefined}
          aria-describedby={aviso ? "boletin-aviso" : undefined}
          className="h-10 rounded-full border md:flex-1 min-[1025px]:h-11 xl:flex-none border-white/30 bg-transparent px-4 text-base text-white placeholder:text-white/60 focus:border-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={enviando}
          className="h-10 shrink-0 border border-naranja bg-naranja px-6 py-1.5 min-[1025px]:h-11 font-titulo text-base font-medium leading-6 text-[#ededed]"
        >
          {boton}
        </button>
      </div>
      {aviso && (
        <div id="boletin-aviso" role={aviso.ok ? "status" : "alert"} className="mt-4 flex items-center">
          <span className={`flex size-8 shrink-0 items-center justify-center ${aviso.ok ? "bg-[#04943d]" : "bg-[#eb544a]"}`}>
            <IconoExistencias tipo={aviso.ok ? "hay" : "agotado"} />
          </span>
          <span className="ml-2 text-sm">{aviso.texto}</span>
        </div>
      )}
    </form>
  );
}
