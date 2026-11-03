// Íconos con texto (sección «icon-with-text»): envío gratis, garantía, compra segura. En celular y tableta van en
// carrusel que se desliza (uno y dos por vista); en computadora, en 3 columnas.

import type { ReactNode } from "react";
import type { Seccion } from "@/lib/contenido";
import { esquema, texto } from "@/lib/contenido";
import { TextoRico } from "@/components/comunes/Texto";

// Íconos dibujados para Diluvium con la idea de los de la biblioteca del tema (no son su código).
const ICONOS: Record<string, ReactNode> = {
  truck: (
    <>
      <path d="M3 6.5h12.5v11" />
      <path d="M15.5 9.5h3.8l2.7 3.6v4.4h-1.2" />
      <path d="M3 17.5h1.6M10.1 17.5h5.4" />
      <path d="M3 9.8h6.5M3 13.2h4.5" />
      <circle cx="7.4" cy="18" r="2.2" />
      <circle cx="18.2" cy="18" r="2.2" />
    </>
  ),
  "check-circle": (
    <>
      <path d="M15.6 20.5A9 9 0 1 1 19.4 17.8" />
      <path d="m8.8 12.3 2.6 2.6 4.9-5" />
    </>
  ),
  storefront: (
    <>
      <path d="M5 4h15l1.6 4.6a2.6 2.6 0 0 1-4.8 1.6 2.6 2.6 0 0 1-4.3 0 2.6 2.6 0 0 1-4.3 0A2.6 2.6 0 0 1 3.4 8.6z" />
      <path d="M5.4 12v8h14.2v-8" />
      <path d="M9.5 15h6v2.2h-6z" />
    </>
  ),
};

function Icono({ nombre }: { nombre: string }) {
  return (
    <svg
      viewBox="0 0 25 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="round"
      className="size-full"
      aria-hidden="true"
      focusable="false"
    >
      {ICONOS[nombre] ?? ICONOS["check-circle"]}
    </svg>
  );
}

export function IconosConTexto({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const tamano = texto(a, "icon_size") || "64px";

  return (
    <div className={`${esquema(a)} overflow-hidden`} data-seccion="icon-with-text">
      <div className="contenedor py-[var(--aire)] min-[1025px]:py-[30px]">
        <div className="-mx-[var(--margen)] flex snap-x snap-mandatory gap-[min(3.6vw,24px)] overflow-x-auto scroll-px-[var(--margen)] px-[var(--margen)] [scrollbar-width:none] min-[1025px]:mx-0 min-[1025px]:grid min-[1025px]:grid-cols-3 min-[1025px]:gap-[2vw] min-[1025px]:overflow-visible min-[1025px]:px-0 [&::-webkit-scrollbar]:hidden">
          {seccion.bloques.map((b) => {
            const titulo = texto(b.ajustes, "heading");
            const descripcion = texto(b.ajustes, "description");
            return (
              <div
                key={b.id}
                className="flex min-w-0 shrink-0 basis-full snap-start flex-col items-center gap-3 py-4 text-center md:basis-[calc((100%-24px)/2)] min-[1025px]:py-6"
              >
                <div className="pr-1" style={{ width: tamano, height: tamano }}>
                  {texto(b.ajustes, "icon_source") === "html" ? null : <Icono nombre={texto(b.ajustes, "options_icon")} />}
                </div>
                <div className="flex flex-col gap-2">
                  {titulo && <h3 style={{ fontSize: "19.2px", lineHeight: "24px" }}>{titulo}</h3>}
                  <TextoRico html={descripcion} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
