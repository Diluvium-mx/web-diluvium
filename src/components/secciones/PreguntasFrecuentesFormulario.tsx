"use client";

// Formulario de contacto de la sección de preguntas frecuentes (página Contacto, «enable_contact_form»): nombre,
// correo y mensaje, los tres obligatorios como en la tienda (el navegador avisa si falta alguno).

import type { FormEvent } from "react";
import { BOTON_GRANDE, BOTON_PRIMARIO } from "@/components/producto/estilos";

const CAMPO =
  "block w-full border border-[rgba(28,28,107,0.12)] bg-[#ecf0f3] px-4 text-base text-[#1c1c6b] " +
  "placeholder:text-[rgba(28,28,107,0.4)] focus:outline-2 focus:outline-offset-0 focus:outline-[#1c1c6b]";

function Etiqueta({ para, texto }: { para: string; texto: string }) {
  return (
    <label htmlFor={para} className="relative mb-2 inline-block font-bold md:mb-3 min-[1025px]:mb-4">
      {texto}
      <sup aria-hidden="true" className="absolute top-0 left-full ml-1 text-[13.3333px] leading-5 font-bold text-[#eb544a]">
        *
      </sup>
    </label>
  );
}

export function FormularioContacto({ boton }: { boton: string }) {
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Paso 3: mandar el mensaje por correo (servicio de envío de correos) y mostrar el aviso de «gracias».
  };

  return (
    <form onSubmit={enviar} acceptCharset="UTF-8">
      <div className="mb-5">
        <Etiqueta para="contacto-nombre" texto="Su nombre" />
        <input
          id="contacto-nombre"
          name="contact[Name]"
          type="text"
          autoComplete="name"
          required
          placeholder="Enter your name"
          className={`${CAMPO} h-10 rounded-[64px] py-2 min-[1025px]:h-11`}
        />
      </div>
      <div className="mb-5">
        <Etiqueta para="contacto-correo" texto="Su correo electrónico" />
        <input
          id="contacto-correo"
          name="contact[email]"
          type="email"
          autoComplete="email"
          spellCheck={false}
          autoCapitalize="off"
          required
          aria-required="true"
          placeholder="Enter your email"
          className={`${CAMPO} h-10 rounded-[64px] py-2 min-[1025px]:h-11`}
        />
      </div>
      {/* 6 px abajo: el renglón que deja en vivo el cuadro de texto (va en línea con el texto). */}
      <div className="pb-1.5">
        <Etiqueta para="contacto-mensaje" texto="Su mensaje" />
        <textarea
          id="contacto-mensaje"
          name="contact[Mensaje]"
          rows={5}
          required
          placeholder="Enter your message"
          className={`${CAMPO} h-[120px] rounded-lg pt-2.5 pb-2`}
        />
      </div>
      <div className="mt-6 flex flex-col items-start md:mt-9 min-[1025px]:mt-12">
        <button type="submit" className={`${BOTON_PRIMARIO} ${BOTON_GRANDE} w-full cursor-pointer min-[1025px]:w-auto`}>
          {boton}
        </button>
      </div>
    </form>
  );
}
