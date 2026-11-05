// Franja de bienvenida arriba del panel: saludo, para qué sirve cada parte y accesos directos a lo que más se edita.

const ACCESOS = [
  { texto: "Precios y existencias", href: "/admin/collections/productos", detalle: "Tamaños, piezas y fotos de cada producto" },
  { texto: "Secciones de la portada", href: "/admin/collections/plantillas", detalle: "Textos, fotos y botones de cada página" },
  { texto: "Reseñas", href: "/admin/collections/resenas", detalle: "Publicar u ocultar lo que dicen los clientes" },
  { texto: "Ver la página", href: "/", detalle: "Abre la tienda en otra pestaña", nueva: true },
];

export function Bienvenida() {
  return (
    <section className="diluvium-bienvenida">
      <div>
        <p className="diluvium-bienvenida__saludo">Administrador de diluvium.com.mx</p>
        <h1 className="diluvium-bienvenida__titulo">¿Qué quieres cambiar hoy?</h1>
        <p className="diluvium-bienvenida__texto">
          Lo que guardes aquí se publica en la página. Cada sección de la izquierda es una parte de la tienda.
        </p>
      </div>
      <ul className="diluvium-bienvenida__accesos">
        {ACCESOS.map((a) => (
          <li key={a.href}>
            <a href={a.href} {...(a.nueva ? { target: "_blank", rel: "noopener" } : {})}>
              <strong>{a.texto}</strong>
              <span>{a.detalle}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
