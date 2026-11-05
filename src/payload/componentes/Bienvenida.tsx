// Inicio del administrador, al estilo del Dashboard del CRM (crm-diluvium › inicio): título, tarjetas con números
// grandes y avisos. Los números salen de la base al abrir el panel: productos, piezas en existencia (con los tamaños
// que se están acabando), reseñas publicadas con su promedio y páginas editables. Abajo quedan las secciones de Payload.

import type { Payload } from "payload";

const POCAS = 3;

type Variante = { titulo?: string | null; existencias?: number | null };
type Producto = { id: number | string; titulo: string; variantes?: Variante[] | null };

export async function Bienvenida({ payload }: { payload: Payload }) {
  const [productos, resenas, plantillas, paginas] = await Promise.all([
    payload.find({ collection: "productos", pagination: false, depth: 0, select: { titulo: true, variantes: true } }),
    payload.find({ collection: "resenas", pagination: false, depth: 0, where: { publicada: { equals: true } }, select: { calificacion: true } }),
    payload.count({ collection: "plantillas" }),
    payload.count({ collection: "paginas" }),
  ]);

  const lista = productos.docs as unknown as Producto[];
  const conControl = lista.flatMap((p) => (p.variantes ?? []).filter((v) => typeof v.existencias === "number").map((v) => ({ p, v })));
  const piezas = conControl.reduce((s, { v }) => s + (v.existencias ?? 0), 0);
  const agotados = conControl.filter(({ v }) => (v.existencias ?? 0) <= 0);
  const pocas = conControl.filter(({ v }) => (v.existencias ?? 0) > 0 && (v.existencias ?? 0) <= POCAS);
  const estrellas = resenas.docs.map((r) => Number((r as { calificacion?: number }).calificacion) || 0);
  const promedio = estrellas.length ? estrellas.reduce((a, b) => a + b, 0) / estrellas.length : 0;

  const tarjetas = [
    { titulo: "Productos", numero: lista.length, nota: `${conControl.length} tamaños con inventario`, href: "/admin/collections/productos" },
    { titulo: "Piezas en existencia", numero: piezas, nota: `${agotados.length} agotados · ${pocas.length} por acabarse`, href: "/admin/collections/productos", alerta: pocas.length + agotados.length > 0 },
    { titulo: "Reseñas publicadas", numero: estrellas.length, nota: `${promedio.toFixed(1)} estrellas de promedio`, href: "/admin/collections/resenas" },
    { titulo: "Páginas editables", numero: plantillas.totalDocs + paginas.totalDocs, nota: `${plantillas.totalDocs} plantillas · ${paginas.totalDocs} páginas`, href: "/admin/collections/plantillas" },
  ];
  const avisos = [...agotados.map((x) => ({ ...x, tipo: "Agotado" })), ...pocas.map((x) => ({ ...x, tipo: `Quedan ${x.v.existencias}` }))];

  return (
    <section className="tablero">
      <div className="tablero__cabecera">
        <div>
          <h1 className="tablero__titulo">Inicio</h1>
          <p className="tablero__sub">Lo que guardes aquí se publica en diluvium.com.mx.</p>
        </div>
        <a className="btn btn--style-primary tablero__ver" href="/" target="_blank" rel="noopener">
          Ver la página
        </a>
      </div>

      <div className="tablero__tarjetas">
        {tarjetas.map((t) => (
          <a key={t.titulo} href={t.href} className={`tablero__tarjeta${t.alerta ? " tablero__tarjeta--alerta" : ""}`} data-glow>
            <span className="tablero__tarjeta-titulo">{t.titulo}</span>
            <span className="tablero__numero">{t.numero.toLocaleString("es-MX")}</span>
            <span className="tablero__nota">{t.nota}</span>
          </a>
        ))}
      </div>

      {avisos.length > 0 && (
        <div className="tablero__avisos">
          <h2 className="tablero__avisos-titulo">Inventario por revisar</h2>
          <ul>
            {avisos.map(({ p, v, tipo }) => (
              <li key={`${p.id}-${v.titulo}`}>
                <a href={`/admin/collections/productos/${p.id}`} data-glow>
                  <span>
                    <strong>{p.titulo}</strong> · {v.titulo === "Default Title" ? "Único" : v.titulo}
                  </span>
                  <span className={`tablero__etiqueta${tipo === "Agotado" ? " tablero__etiqueta--agotado" : ""}`}>{tipo}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
