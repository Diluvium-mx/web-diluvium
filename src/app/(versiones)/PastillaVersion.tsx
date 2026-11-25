import Link from "next/link";

/** «Versión B1 | cambiar» (sin «·», dueño 25-nov-2026): lleva a la lista de versiones. Solo para revisar; no forma parte de la versión. En
 * computadora flota abajo a la izquierda; en celular y tableta va al final, para no tapar el botón ni la barra. */
export function PastillaVersion({ etiqueta }: { etiqueta: string }) {
  const contenido = (
    <>
      Versión {etiqueta}
      <span aria-hidden="true" className="opacity-60">|</span>
      <span className="underline underline-offset-2">cambiar</span>
    </>
  );
  return (
    <>
      <Link
        href="/v"
        className="fixed bottom-4 left-4 z-[35] hidden min-h-9 items-center gap-1.5 rounded-full bg-tinta/85 px-3.5 text-[13px] font-semibold text-white shadow-lg backdrop-blur hover:bg-tinta lg:inline-flex"
      >
        {contenido}
      </Link>
      <div className="bg-tinta pb-24 text-center md:pb-4 lg:hidden">
        <Link href="/v" className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-white">
          {contenido}
        </Link>
      </div>
    </>
  );
}
