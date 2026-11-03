// Sección de código propio del tema (sección «custom-liquid»): subtítulo, título y texto centrados (o a la izquierda,
// según «content_align_*»). En Diluvium solo se usa el título como encabezado de lo que sigue; el «liquid_code» va
// vacío en todas las plantillas, así que no se dibuja (código del tema que no se copia).

import type { PropsSeccion } from "./registro";
import { esquema, texto } from "@/lib/contenido";
import { TextoRico, Titulo } from "@/components/comunes/Texto";
import { clasesAire } from "./aire";

const TAMANOS: Record<string, string> = {
  h1: "text-[length:var(--h1)]!",
  h2: "text-[length:var(--h2)]!",
  h3: "text-[length:var(--h3)]!",
  h4: "text-[length:var(--h4)]!",
};

export function CodigoPropio({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const subtitulo = texto(a, "subheading");
  const titulo = texto(a, "heading");
  const descripcion = texto(a, "description");
  const centradoCel = texto(a, "content_align_mobile") !== "ta-left";
  const centradoCompu = texto(a, "content_align_desktop") !== "ta-left-md";
  const alineacion = `${centradoCel ? "text-center items-center" : "text-left items-start"} ${
    centradoCompu ? "md:text-center md:items-center" : "md:text-left md:items-start"
  }`;
  if (!subtitulo && !titulo && !descripcion) return <div data-seccion="custom-liquid" className={esquema(a)} />;

  return (
    <section className={esquema(a)} data-seccion="custom-liquid">
      <div className={`contenedor ${clasesAire(seccion, producto)}`}>
        <div className={`flex flex-col ${alineacion}`}>
          {subtitulo && <div className="mb-3 font-titulo text-[19.2px] leading-6 font-medium">{subtitulo}</div>}
          <Titulo texto={titulo} className={`break-words ${TAMANOS[texto(a, "heading_size")] ?? TAMANOS.h2}`} />
          {descripcion && <TextoRico html={descripcion} className="mt-6 max-w-[650px]" />}
        </div>
      </div>
    </section>
  );
}
