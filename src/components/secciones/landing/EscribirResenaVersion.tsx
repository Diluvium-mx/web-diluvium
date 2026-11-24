"use client";

// Tarjeta «¿Ya tienes tu compuerta Diluvium?» del muro de reseñas de B1 (dueño, 24-nov-2026): va en el hueco que queda
// abajo de la columna más corta (MuroResenas.tsx la acomoda) y abre la ventana para escribir una reseña.
// La ventana es la misma de la página vieja (Trustoo; en la tienda rehecha: src/components/resenas/EscribirResena.tsx)
// con el aspecto de B1: estrellas, comentario (hasta 2,000 letras), hasta 5 fotos y nombre. Al enviarla queda guardada
// en el administrador como NO publicada (Reseñas), para que el dueño la revise; la misma acción del servidor que la
// tienda (src/lib/formularios/acciones.ts › enviarResena), con su trampa contra robots.
// Mejoras sobre la vieja: ventana nativa (<dialog>: el foco no se sale y Escape la cierra), en celular a pantalla
// completa, la estrella elegida dice qué significa y el botón de enviar es el naranja de B1.

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { enviarResena } from "@/lib/formularios/acciones";
import { useTrampa } from "@/components/comunes/Trampa";
import { CLASE_BOTON, IconoTache } from "./piezas";
import type { TextosResenaNueva } from "./textos";

export type ProductoResena = { nombre: string; titulo: string; imagen: string | null };

const MAX_FOTOS = 5;
const MAX_TEXTO = 2000;
const SIGNIFICA = ["Mala", "Regular", "Buena", "Muy buena", "Excelente"];

function Estrella({ llena, tamano = 32 }: { llena: boolean; tamano?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tamano} height={tamano} aria-hidden="true" focusable="false">
      <path
        d="m12 2.6 2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5L2.6 9.4l6.5-.8z"
        fill={llena ? "#f2b01e" : "none"}
        stroke="#f2b01e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** La tarjeta del hueco del muro. */
export function TarjetaInvitar({ producto, textos, prueba = false }: { producto: ProductoResena; textos: TextosResenaNueva; prueba?: boolean }) {
  const [abierta, setAbierta] = useState(false);
  return (
    // data-pieza fija: los números del mapa de sus textos no cambian aunque se mueva de columna.
    <li data-invitar="" data-pieza="invitar" className="rounded-xl border-2 border-dashed border-marino/25 bg-white px-4 pt-4 pb-4 text-center md:px-5 md:pt-5">
      <span className="flex justify-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Estrella key={n} llena tamano={22} />
        ))}
      </span>
      <p className="titulo-version m-0 mt-2.5 text-[17px] text-marino md:text-[19px]">{textos.invitarTitulo}</p>
      <p className="m-0 mt-1.5 text-[14.5px] leading-[1.45] text-texto-suave">{textos.invitarTexto}</p>
      <button
        type="button"
        data-evento="abre_resena"
        aria-haspopup="dialog"
        onClick={() => setAbierta(true)}
        className="mt-3.5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-marino bg-white px-3 font-titulo text-[15.5px] font-medium text-marino transition-colors hover:bg-marino hover:text-white"
      >
        {textos.invitarBoton}
      </button>
      {abierta && <VentanaResenaVersion producto={producto} textos={textos} prueba={prueba} cerrar={() => setAbierta(false)} />}
    </li>
  );
}

function VentanaResenaVersion({ producto, textos, prueba, cerrar }: { producto: ProductoResena; textos: TextosResenaNueva; prueba: boolean; cerrar: () => void }) {
  const [estrellas, setEstrellas] = useState(0);
  const [encima, setEncima] = useState(0);
  const [texto, setTexto] = useState("");
  const [nombre, setNombre] = useState("");
  const [fotos, setFotos] = useState<{ archivo: File; vista: string }[]>([]);
  const [error, setError] = useState("");
  const [enviada, setEnviada] = useState(false);
  const [enviando, iniciar] = useTransition();
  const { CampoTrampa, datos } = useTrampa();
  const archivos = useRef<HTMLInputElement>(null);
  const ventana = useRef<HTMLDialogElement>(null);

  // Se abre como ventana del navegador (el foco se queda adentro) y lo de atrás no se desplaza mientras está abierta.
  useEffect(() => {
    const v = ventana.current;
    v?.showModal();
    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = "hidden";
    return () => {
      raiz.style.overflow = antes;
      v?.close();
    };
  }, []);
  useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.vista)), [fotos]);

  const lista = estrellas > 0 && texto.trim().length > 0 && nombre.trim().length > 0;

  const agregarFotos = (nuevas: FileList | null) => {
    if (!nuevas) return;
    const espacio = MAX_FOTOS - fotos.length;
    const elegidas = [...nuevas].filter((f) => f.type.startsWith("image/")).slice(0, espacio);
    setFotos((antes) => [...antes, ...elegidas.map((archivo) => ({ archivo, vista: URL.createObjectURL(archivo) }))]);
  };

  const enviar = () => {
    if (!lista || enviando) return;
    // En la copia de prueba las páginas de B son archivos fijos: no hay a dónde mandar la reseña (docs/despliegue.md).
    if (prueba) {
      setError("Esta es la copia de prueba de la página: aquí las reseñas no se guardan.");
      return;
    }
    setError("");
    const f = new FormData();
    f.set("calificacion", String(estrellas));
    f.set("texto", texto);
    f.set("nombre", nombre);
    f.set("producto", producto.nombre);
    const t = datos();
    f.set("sitio", t.sitio ?? "");
    if (t.abierto) f.set("abierto", String(t.abierto));
    fotos.forEach((x) => f.append("fotos", x.archivo));
    iniciar(async () => {
      try {
        const r = await enviarResena(f);
        if (r.ok) setEnviada(true);
        else setError(r.error);
      } catch {
        setError("No se pudo enviar tu reseña. Revisa tu conexión e inténtalo de nuevo.");
      }
    });
  };

  const campo = "block w-full rounded-xl border border-linea bg-white px-3.5 text-[16px] text-tinta outline-none placeholder:text-texto-suave/70 focus:border-marino";

  return (
    <dialog
      ref={ventana}
      aria-labelledby="resena-nueva-titulo"
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
      onClick={(e) => e.target === e.currentTarget && cerrar()}
      className="version m-0 h-full max-h-none w-full max-w-none bg-white p-0 text-left text-tinta backdrop:bg-tinta/70 md:m-auto md:h-auto md:max-h-[calc(100dvh-40px)] md:w-[480px] md:rounded-2xl"
    >
      <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-linea bg-white py-2.5 pr-2 pl-5">
        <h2 id="resena-nueva-titulo" className="titulo-version m-0 text-[20px] text-marino">
          {textos.titulo}
        </h2>
        <button type="button" onClick={cerrar} aria-label="Cerrar" className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-niebla">
          <IconoTache className="size-6" />
        </button>
      </div>

      {enviada ? (
        <div role="status" className="flex flex-col items-center px-6 pt-12 pb-8 text-center">
          <svg viewBox="0 0 50 50" width={56} height={56} aria-hidden="true" focusable="false">
            <circle cx="25" cy="25" r="23.5" fill="#e3f5e8" stroke="#1a7f37" strokeWidth="2" />
            <path d="m15.5 25.5 6.5 6.5 13-14" fill="none" stroke="#1a7f37" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="titulo-version m-0 mt-4 text-[22px] text-marino">{textos.gracias}</p>
          <p className="m-0 mt-2 text-[16px] text-texto-suave">{textos.graciasTexto}</p>
          <button type="button" onClick={cerrar} className={`${CLASE_BOTON} mt-7 w-full`}>
            Cerrar
          </button>
        </div>
      ) : (
        <form
          className="relative px-5 pt-4 pb-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          {CampoTrampa}
          <div className="flex items-center gap-3 rounded-xl bg-niebla p-2.5">
            {producto.imagen && <Image src={producto.imagen} alt="" width={48} height={48} className="size-12 shrink-0 rounded-lg object-cover" />}
            <p className="m-0 text-[15.5px] leading-snug font-semibold text-marino">{producto.titulo}</p>
          </div>

          <fieldset className="mt-5 border-0 p-0">
            <legend className="mb-2 p-0 text-[15px] font-semibold">{textos.calificacion}</legend>
            <div className="flex items-center gap-3">
              <div className="flex gap-1" onMouseLeave={() => setEncima(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}: ${SIGNIFICA[n - 1]}`}
                    aria-pressed={estrellas === n}
                    onMouseEnter={() => setEncima(n)}
                    onClick={() => setEstrellas(n)}
                    className="flex size-11 cursor-pointer items-center justify-center rounded-lg p-0"
                  >
                    <Estrella llena={(encima || estrellas) >= n} />
                  </button>
                ))}
              </div>
              {(encima || estrellas) > 0 && <span className="text-[15px] font-semibold text-texto-suave">{SIGNIFICA[(encima || estrellas) - 1]}</span>}
            </div>
          </fieldset>

          <label htmlFor="resena-nueva-texto" className="mt-5 block text-[15px] font-semibold">
            {textos.comentario}
          </label>
          <div className="relative mt-2">
            <textarea
              id="resena-nueva-texto"
              value={texto}
              maxLength={MAX_TEXTO}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={textos.comentarioEjemplo}
              className={`${campo} h-[132px] resize-none py-3 pb-7`}
            />
            <span className="pointer-events-none absolute right-3 bottom-2 text-[12.5px] text-texto-suave tabular-nums">
              {texto.length}/{MAX_TEXTO}
            </span>
          </div>

          <p className="m-0 mt-5 text-[15px] font-semibold">{textos.fotos}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {fotos.map((f, i) => (
              <div key={f.vista} className="relative size-[88px] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) antes de subirla */}
                <img src={f.vista} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  aria-label={`Quitar la foto ${i + 1}`}
                  onClick={() => setFotos((antes) => antes.filter((x) => x !== f))}
                  className="absolute top-1 right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-tinta/70 text-[15px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {fotos.length < MAX_FOTOS && (
              <button
                type="button"
                onClick={() => archivos.current?.click()}
                className="flex size-[88px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-marino/30 text-center text-[12.5px] leading-tight font-semibold text-marino hover:bg-niebla"
              >
                <span className="text-[24px] leading-6" aria-hidden="true">
                  +
                </span>
                Agregar foto
                <span className="mt-0.5 font-normal text-texto-suave tabular-nums">
                  {fotos.length}/{MAX_FOTOS}
                </span>
              </button>
            )}
            <input
              ref={archivos}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              className="hidden"
              onChange={(e) => {
                agregarFotos(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <label htmlFor="resena-nueva-nombre" className="mt-5 block text-[15px] font-semibold">
            {textos.nombre}
          </label>
          <input
            id="resena-nueva-nombre"
            value={nombre}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => setNombre(e.target.value)}
            className={`${campo} mt-2 h-12`}
          />

          <p className="m-0 mt-5 text-[13px] leading-[1.45] text-texto-suave">
            Al enviar esta reseña, aceptas la{" "}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/policies/privacy-policy" className="underline">
              Política de Privacidad
            </a>{" "}
            y los{" "}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/policies/terms-of-service" className="underline">
              Términos
            </a>{" "}
            de Diluvium con respecto al procesamiento de tus datos personales.
          </p>

          {error && (
            <p role="alert" className="m-0 mt-3 text-[15px] font-semibold text-[#b42318]">
              {error}
            </p>
          )}

          <button type="submit" disabled={!lista || enviando} className={`${CLASE_BOTON} mt-5 w-full`}>
            {enviando ? "Enviando…" : textos.enviar}
          </button>
        </form>
      )}
    </dialog>
  );
}
