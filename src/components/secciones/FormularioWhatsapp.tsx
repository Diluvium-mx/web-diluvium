"use client";

// Formulario «¡Hola!» para cotizar (sección «whatsapp-form»). En el sitio en vivo es el formulario de contacto de
// Shopify: manda los datos al correo de la tienda y muestra el mensaje de gracias. Aquí queda igual en aspecto; el
// envío del correo se conecta en el paso 3 (servicio de correos), como decidió el dueño el 3-nov-2026.
// Celular y tableta: foto de la señora arriba y el formulario en un recuadro gris. Computadora: franja gris con el
// formulario a la izquierda y la foto de la muchacha a la derecha, saliendo por arriba de la franja.

import Image from "next/image";
import type { FormEvent } from "react";
import type { Seccion } from "@/lib/contenido";
import { texto } from "@/lib/contenido";

const FOTO_CELULAR = { src: "/media/files/Diseno_sin_titulo_7_4.webp", ancho: 3536, alto: 1924 };
const FOTO_COMPU = { src: "/media/files/Mujer_1.png", ancho: 1028, alto: 1118 };

const CAMPO =
  "box-border block h-10 w-full rounded-none border border-solid border-[#808080] bg-white py-px pl-[10px] pr-[2px] font-texto text-sm text-black outline-none placeholder:text-[#757575] focus-visible:border-azul";

export function FormularioWhatsapp({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  // Paso 3: mandar los datos al correo de la tienda (con Turnstile y límite de intentos) y después mostrar
  // texto(a, "success_message") en el aviso de abajo, como hace Shopify.
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <section
      className="relative flex items-end min-[1025px]:h-[400px] min-[1025px]:overflow-hidden"
      data-seccion="whatsapp-form"
    >
      <div className="mx-auto grid w-full grid-cols-1 bg-white py-12 min-[1025px]:relative min-[1025px]:h-[340px] min-[1025px]:max-w-[calc(var(--ancho-pagina)+2*var(--margen))] min-[1025px]:bg-[#dae1eb] min-[1025px]:py-0">
        <div className="bg-[#eaeef1] px-[var(--margen)] py-[var(--aire)] min-[1025px]:absolute min-[1025px]:left-[var(--margen)] min-[1025px]:top-[140px] min-[1025px]:w-full min-[1025px]:max-w-[400px] min-[1025px]:-translate-y-[35%] min-[1025px]:bg-transparent min-[1025px]:p-0">
          <form onSubmit={enviar} className="text-black" aria-label="Contacto">
            <h2 className="!mb-[5px] text-black">{texto(a, "title")}</h2>
            <p className="m-0 mb-[10.6667px] leading-[19.2px]">{texto(a, "subtitle")}</p>
            <div className="flex">
              <div className="w-1/2">
                <input className={CAMPO} type="text" name="nombre" placeholder="Nombre" aria-label="Nombre" autoComplete="name" maxLength={200} />
              </div>
              <div className="w-1/2">
                <input className={CAMPO} type="tel" name="telefono" placeholder="Teléfono" aria-label="Teléfono" autoComplete="tel" maxLength={40} />
              </div>
            </div>
            <input className={CAMPO} type="email" name="email" placeholder="Email" aria-label="Email" autoComplete="email" maxLength={200} />
            <button
              type="submit"
              className="relative z-[1] inline-flex h-10 w-full cursor-pointer items-center justify-center border border-solid border-[#0c559a] bg-[#0c559a] px-5 py-1.5 font-titulo text-base font-medium leading-[normal] text-white transition-colors duration-[400ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul"
            >
              {texto(a, "button_text") || "Enviar"}
            </button>
            <p role="status" className="sr-only" />
          </form>
        </div>
        <div className="order-first min-[1025px]:hidden">
          <Image
            src={FOTO_CELULAR.src}
            alt=""
            width={FOTO_CELULAR.ancho}
            height={FOTO_CELULAR.alto}
            sizes="100vw"
            className="relative z-[1] block h-auto w-full translate-y-[18%]"
          />
        </div>
      </div>
      <Image
        src={FOTO_COMPU.src}
        alt=""
        width={FOTO_COMPU.ancho}
        height={FOTO_COMPU.alto}
        sizes="368px"
        className="absolute bottom-0 left-1/2 top-0 hidden h-full w-auto translate-x-1/2 object-contain min-[1025px]:block"
      />
    </section>
  );
}
