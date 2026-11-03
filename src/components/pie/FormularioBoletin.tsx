"use client";

// Suscripción al boletín del pie. En el sitio en vivo guarda el correo como cliente suscrito de Shopify. Aquí queda
// igual en aspecto; guardar el correo y mostrar el aviso de Shopify se conecta en el paso 3 (con Turnstile y límite
// de intentos, docs/seguridad.md §3).

export function FormularioBoletin({ boton }: { boton: string }) {
  return (
    <form
      className="mt-2 flex flex-col gap-3 md:flex-row xl:flex-col"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label className="sr-only" htmlFor="boletin-correo">
        Correo electrónico
      </label>
      <input
        id="boletin-correo"
        type="email"
        required
        autoComplete="email"
        placeholder="Introduce su dirección de correo electrónico"
        className="h-10 rounded-full border md:flex-1 min-[1025px]:h-11 xl:flex-none border-white/30 bg-transparent px-4 text-base text-white placeholder:text-white/60 focus:border-white focus:outline-none"
      />
      <button
        type="submit"
        className="h-10 shrink-0 border border-naranja bg-naranja px-6 py-1.5 min-[1025px]:h-11 font-titulo text-base font-medium leading-6 text-[#ededed]"
      >
        {boton}
      </button>
    </form>
  );
}
