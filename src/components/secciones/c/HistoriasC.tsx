// Sección «c-historias»: «Así funciona» como historias de Instagram (formato que no está en A ni en B): una foto a
// pantalla de tarjeta con su barra de avance arriba; pasa sola cada 5 s, se toca a la derecha o a la izquierda para
// avanzar o regresar y se detiene mientras se deja el dedo encima. Piezas «slide»: foto, título y texto.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { textoVersion } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoC, Etiqueta } from "./comun";
import { HistoriasCCliente } from "./HistoriasCCliente";

export function HistoriasC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "claro";
  const historias = seccion.bloques
    .filter((b) => b.tipo === "slide" && texto(b.ajustes, "image"))
    .map((b) => ({
      id: b.id,
      foto: texto(b.ajustes, "image"),
      alt: texto(b.ajustes, "alt"),
      titulo: textoVersion(b.ajustes, "heading"),
      texto: textoVersion(b.ajustes, "text"),
      estilo: estiloFoto(b.ajustes),
      marca: marcaEditar(seccion.id, b.id, "image"),
    }));
  return (
    <section data-seccion="c-historias" id="historias" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-14 md:py-20`}>
      <div className="marco-version grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-16">
        <div>
          <Etiqueta oscuro={fondo === "noche"}>{formato(textoVersion(a, "subheading"))}</Etiqueta>
          <h2 id={`titulo-${seccion.id}`} className={`titulo-version m-0 mt-2 text-[32px] md:text-[44px] ${fondo === "noche" ? "text-white" : "text-[#06182f]"}`}>
            {formato(textoVersion(a, "heading"))}
          </h2>
          {texto(a, "text") && <p className={`m-0 mt-3 max-w-[30rem] text-[17px] leading-[1.55] ${fondo === "noche" ? "text-white/75" : "text-texto-suave"}`}>{formato(textoVersion(a, "text"))}</p>}
        </div>
        <HistoriasCCliente historias={historias} />
      </div>
    </section>
  );
}
