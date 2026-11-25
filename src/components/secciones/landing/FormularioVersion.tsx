"use client";

// Formulario de contacto de B1 (página Contacto). Hace lo mismo que el de la tienda de hoy
// (PreguntasFrecuentesFormulario): nombre, correo y mensaje, los tres obligatorios; al enviarlo sale el aviso de gracias
// (o el de campos obligatorios), el formulario queda limpio y el mensaje se guarda en el administrador (Ventas ›
// Mensajes) y avisa a la tienda. Solo cambia el aspecto, con el de las versiones B.

import { useState, useTransition, type FormEvent } from "react";
import { enviarMensaje } from "@/lib/formularios/acciones";
import { useTrampa } from "@/components/comunes/Trampa";
import { CLASE_BOTON, IconoPalomita } from "./piezas";

export type TextosFormulario = {
  nombre: string;
  correo: string;
  mensaje: string;
  boton: string;
  enviando: string;
  gracias: string;
  faltan: string;
};

const CAMPO =
  "block w-full rounded-xl border border-linea bg-white px-4 text-[17px] text-marino placeholder:text-texto-suave/70 focus:border-marino focus:outline-2 focus:outline-offset-1 focus:outline-marino";

function Campo({ id, texto, children, clase }: { id: string; texto: string; children: React.ReactNode; clase?: string }) {
  return (
    <div>
      <label htmlFor={id} className={clase ?? "mb-1.5 block text-[15px] font-semibold"}>
        {texto} <span aria-hidden="true" className="text-boton">*</span>
      </label>
      {children}
    </div>
  );
}

/** «clases»: el aspecto de C y D (25-nov-2026): campos, etiquetas y botón más grandes. Sin «clases», el de B. */
export type ClasesFormulario = { campo: string; etiqueta: string; boton: string };

export function FormularioVersion({ textos, prueba = false, clases }: { textos: TextosFormulario; prueba?: boolean; clases?: ClasesFormulario }) {
  const [estado, setEstado] = useState<"" | "ok" | "error">("");
  const [mensajeError, setMensajeError] = useState("");
  const [enviando, iniciar] = useTransition();
  const { CampoTrampa, datos } = useTrampa();

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const forma = e.currentTarget;
    const f = new FormData(forma);
    // En la copia de prueba las páginas de B son archivos fijos: el mensaje no tiene a dónde ir (docs/despliegue.md).
    if (prueba) {
      setEstado("error");
      setMensajeError("Esta es la copia de prueba de la página: aquí los mensajes no se envían. Escríbenos por WhatsApp.");
      return;
    }
    iniciar(async () => {
      let r: Awaited<ReturnType<typeof enviarMensaje>>;
      try {
        r = await enviarMensaje(
        "contacto",
        {
          nombre: String(f.get("nombre") ?? ""),
          correo: String(f.get("correo") ?? ""),
          mensaje: String(f.get("mensaje") ?? ""),
          pagina: location.pathname,
        },
        datos(),
      );
      } catch {
        setEstado("error");
        setMensajeError("No se pudo enviar tu mensaje. Revisa tu conexión e inténtalo de nuevo.");
        return;
      }
      setEstado(r.ok ? "ok" : "error");
      // El aviso de campos obligatorios es el de la plantilla; los del correo («no es válido»…) son los de Shopify.
      setMensajeError(r.ok ? "" : r.campo === "nombre" || r.campo === "mensaje" ? textos.faltan : r.error);
      if (r.ok) forma.reset();
    });
  };

  return (
    <form onSubmit={enviar} acceptCharset="UTF-8" className="relative grid gap-4">
      {CampoTrampa}
      {estado === "ok" && (
        <p role="status" className="m-0 flex items-start gap-3 rounded-xl bg-[#e7f6ec] px-4 py-3 text-[15.5px] font-semibold text-[#14632f]">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1a7f37] text-white">
            <IconoPalomita className="size-4" />
          </span>
          {textos.gracias}
        </p>
      )}
      {estado === "error" && (
        <p role="alert" className="m-0 rounded-xl bg-[#fdecea] px-4 py-3 text-[15.5px] font-semibold text-[#b42318]">
          {mensajeError}
        </p>
      )}
      <Campo id="contacto-b-nombre" texto={textos.nombre} clase={clases?.etiqueta}>
        <input id="contacto-b-nombre" name="nombre" type="text" autoComplete="name" required className={clases ? `${clases.campo} min-h-14` : `${CAMPO} min-h-13`} />
      </Campo>
      <Campo id="contacto-b-correo" texto={textos.correo} clase={clases?.etiqueta}>
        <input id="contacto-b-correo" name="correo" type="email" autoComplete="email" inputMode="email" required className={clases ? `${clases.campo} min-h-14` : `${CAMPO} min-h-13`} />
      </Campo>
      <Campo id="contacto-b-mensaje" texto={textos.mensaje} clase={clases?.etiqueta}>
        <textarea id="contacto-b-mensaje" name="mensaje" rows={5} required className={clases ? `${clases.campo} py-3` : `${CAMPO} py-3`} />
      </Campo>
      <button type="submit" disabled={enviando} className={clases ? `${clases.boton} mt-1 w-full sm:w-full` : `${CLASE_BOTON} mt-1 w-full`}>
        {enviando ? textos.enviando : textos.boton}
      </button>
    </form>
  );
}
