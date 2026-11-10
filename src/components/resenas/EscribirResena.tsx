"use client";

// «Escriba un comentario»: la ventana de la app de reseñas en vivo (Trustoo), rehecha igual con las capturas del
// 10-nov-2026 (docs/sitio-actual/capturas/2026-11-10/resena-1-*.jpg). En computadora y tableta va centrada (462 px);
// en celular ocupa toda la pantalla.
// Campos: estrellas, opinión (hasta 2,000 letras), hasta 5 fotos y nombre. Al enviarla, la reseña queda guardada en
// el administrador como NO publicada, para que el dueño la revise (src/lib/formularios/acciones.ts › enviarResena).
// El aviso de privacidad nombra a Diluvium y enlaza sus políticas: en vivo nombra a la empresa de la app (CWILL),
// que aquí ya no procesa los datos.

import Image from "next/image";
import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { enviarResena } from "@/lib/formularios/acciones";
import { useTrampa } from "@/components/comunes/Trampa";

type ProductoResena = { nombre: string; titulo: string; imagen: string | null };

const Contexto = createContext<ProductoResena | null>(null);

/** Dice a los botones «Escriba un comentario» de adentro a qué producto va la reseña. */
export function ProveedorProductoResena({ producto, children }: { producto: ProductoResena; children: ReactNode }) {
  return <Contexto.Provider value={producto}>{children}</Contexto.Provider>;
}

const BOTON =
  "cursor-pointer rounded-[10px] border border-[rgb(143_143_143/0.8)] bg-azul-oscuro text-white " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-oscuro";

/** «Escriba un comentario». Abre la ventana para mandar una reseña (del producto, o de la tienda si no hay producto). */
export function BotonEscribir({ className = "", texto = "Escriba un comentario" }: { className?: string; texto?: string }) {
  const producto = useContext(Contexto);
  const [abierta, setAbierta] = useState(false);
  return (
    <>
      <button type="button" className={`${BOTON} ${className}`} onClick={() => setAbierta(true)}>
        {texto}
      </button>
      {abierta && <VentanaResena producto={producto} cerrar={() => setAbierta(false)} />}
    </>
  );
}

function Estrella({ llena }: { llena: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true">
      <path
        d="m12 2.6 2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5L2.6 9.4l6.5-.8z"
        fill={llena ? "#f6a823" : "none"}
        stroke="#f6a823"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MAX_FOTOS = 5;
const MAX_TEXTO = 2000;

function VentanaResena({ producto, cerrar }: { producto: ProductoResena | null; cerrar: () => void }) {
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
  const ventana = useRef<HTMLDivElement>(null);

  // Cierra con Escape, bloquea el desplazamiento de atrás y libera las vistas previas de las fotos al cerrar.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    ventana.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tecla);
    };
  }, [cerrar]);
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
    setError("");
    const f = new FormData();
    f.set("calificacion", String(estrellas));
    f.set("texto", texto);
    f.set("nombre", nombre);
    if (producto) f.set("producto", producto.nombre);
    const t = datos();
    f.set("sitio", t.sitio ?? "");
    if (t.abierto) f.set("abierto", String(t.abierto));
    fotos.forEach((x) => f.append("fotos", x.archivo));
    iniciar(async () => {
      const r = await enviarResena(f);
      if (r.ok) setEnviada(true);
      else setError(r.error);
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 font-texto text-[#222] md:items-center" onClick={cerrar}>
      <div
        ref={ventana}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resena-titulo"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative h-full w-full overflow-y-auto bg-white px-4 pt-4 pb-6 outline-none md:h-auto md:max-h-[calc(100vh-40px)] md:w-[462px] md:px-5 md:pt-5 md:pb-5"
      >
        <h2 id="resena-titulo" className="m-0 text-center text-[20px] leading-7 font-normal">
          Escriba un comentario
        </h2>
        <button type="button" aria-label="Cerrar" onClick={cerrar} className="absolute top-4 right-4 flex size-7 cursor-pointer items-center justify-center md:top-[21px] md:right-[21px]">
          <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="#333" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {enviada ? (
          <div role="status" className="flex flex-col items-center px-2 pt-10 pb-6 text-center">
            <svg viewBox="0 0 50 50" width={50} height={50} aria-hidden="true">
              <circle cx="25" cy="25" r="23.5" fill="none" stroke="#04943d" strokeWidth="2" />
              <path d="m15.5 25.5 6.5 6.5 13-14" fill="none" stroke="#04943d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-4 text-[18px] leading-6">¡Gracias por su comentario!</p>
            <p className="mt-2 text-sm text-[#666]">Lo revisaremos y aparecerá en la página muy pronto.</p>
            <button type="button" onClick={cerrar} className="mt-6 h-9 w-full cursor-pointer bg-azul-oscuro text-sm text-white">
              Cerrar
            </button>
          </div>
        ) : (
          <form
            className="relative"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            {CampoTrampa}
            <div className="mt-4 flex items-center gap-4 md:mt-5">
              {producto?.imagen ? (
                <Image src={producto.imagen} alt="" width={48} height={48} loading="eager" className="size-12 object-cover" />
              ) : (
                <Image src="/media/files/Favicon_2aabf220-4641-4694-9dbb-be135ad53af1.png" alt="" width={48} height={48} loading="eager" className="size-12 object-contain" />
              )}
              <p className="m-0 text-base leading-[22px]">{producto?.titulo ?? "Diluvium"}</p>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="mb-2 p-0 text-sm leading-5">Tu clasificación</legend>
              <div className="flex gap-1" onMouseLeave={() => setEncima(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                    aria-pressed={estrellas === n}
                    onMouseEnter={() => setEncima(n)}
                    onClick={() => setEstrellas(n)}
                    className="cursor-pointer p-0"
                  >
                    <Estrella llena={(encima || estrellas) >= n} />
                  </button>
                ))}
              </div>
            </fieldset>

            <label htmlFor="resena-texto" className="mt-5 block text-sm leading-5">
              Comentario
            </label>
            <div className="relative mt-2">
              <textarea
                id="resena-texto"
                value={texto}
                maxLength={MAX_TEXTO}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Su opinión"
                className="block h-[120px] w-full resize-none rounded-[3px] border border-[#8f8f8f] px-2.5 py-2.5 pb-6 text-sm text-[#222] outline-none placeholder:text-[#a3a3a3] focus:border-[#333]"
              />
              <span className="pointer-events-none absolute right-2 bottom-1.5 text-xs text-[#a3a3a3]">
                {texto.length}/{MAX_TEXTO}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {fotos.map((f, i) => (
                <div key={f.vista} className="relative size-[95px]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) antes de subirla */}
                  <img src={f.vista} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Quitar la foto ${i + 1}`}
                    onClick={() => setFotos((antes) => antes.filter((x) => x !== f))}
                    className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              {fotos.length < MAX_FOTOS && (
                <button
                  type="button"
                  onClick={() => archivos.current?.click()}
                  className="flex size-[95px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#8f8f8f] text-center text-xs leading-[14px] text-[#222]"
                >
                  <span className="mb-1 text-[22px] leading-6">+</span>
                  Añadir una
                  <br />
                  foto
                  <span className="mt-1">
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

            <label htmlFor="resena-nombre" className="mt-5 block text-sm leading-5">
              Su nombre
            </label>
            <input
              id="resena-nombre"
              value={nombre}
              maxLength={80}
              autoComplete="name"
              onChange={(e) => setNombre(e.target.value)}
              className="mt-2 block h-9 w-full rounded-[3px] border border-[#8f8f8f] px-2.5 text-sm text-[#222] outline-none focus:border-[#333]"
            />

            <p className="mt-5 mb-0 text-[13px] leading-4 text-[#333]">
              Al enviar esta reseña, aceptas la{" "}
              <Link href="/policies/privacy-policy" className="underline">
                Política de Privacidad
              </Link>{" "}
              y los{" "}
              <Link href="/policies/terms-of-service" className="underline">
                Términos
              </Link>{" "}
              de Diluvium con respecto al procesamiento de tus datos personales.
            </p>

            {error && (
              <p role="alert" className="mt-3 mb-0 text-sm text-[#eb544a]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!lista || enviando}
              className={`mt-5 h-9 w-full text-sm text-white ${lista ? "cursor-pointer bg-azul-oscuro" : "cursor-not-allowed bg-[#999]"}`}
            >
              {enviando ? "Enviando…" : "Envíe un comentario"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
