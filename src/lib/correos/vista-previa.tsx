// Página de vista previa de los correos (/correos/<tipo>, la sirve src/app/(payload)/correos/[tipo]/route.ts): botones
// para cambiar de correo, el asunto, el correo en un marco aislado (iframe con srcDoc, así nada de la página lo cambia)
// y su versión en texto simple. Datos inventados (muestras.ts).

/* eslint-disable @next/next/no-html-link-for-pages -- es HTML suelto (lo arma aHtml), no una página de Next: <Link> no aplica. */

import { aHtml } from "./html";
import { correoMuestra, TIPOS_CORREO } from "./muestras";

const borde = "1px solid #d6dbe1";

/** HTML completo de la vista previa, o null si el tipo no existe. */
export function paginaVistaPrevia(tipo: string, sitio: string): string | null {
  const correo = correoMuestra(tipo, sitio);
  if (!correo) return null;
  const actual = TIPOS_CORREO.find((t) => t.tipo === tipo)!;

  const cuerpo = (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 16px 64px" }}>
      <p style={{ margin: "0 0 8px" }}>
        <a href="/admin" style={{ color: "#0a559a" }}>
          ← Volver al administrador
        </a>
      </p>
      <h1 style={{ margin: "0 0 4px", fontSize: 28, color: "#0a559a" }}>Correos de la tienda</h1>
      <p style={{ margin: "0 0 20px", color: "#5b6573" }}>
        Vista previa con datos de prueba (pedido #1362, Cliente de Prueba). Así le llega al {actual.para === "Tienda" ? "buzón de la tienda" : "cliente"}.
      </p>
      <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {TIPOS_CORREO.map((t) => (
          <a
            key={t.tipo}
            href={`/correos/${t.tipo}`}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: borde,
              textDecoration: "none",
              color: t.tipo === tipo ? "#ffffff" : "#1f2933",
              background: t.tipo === tipo ? "#0a559a" : "#ffffff",
              fontSize: 14,
            }}
          >
            {t.nombre}
          </a>
        ))}
      </nav>
      <p style={{ margin: "0 0 12px" }}>
        <strong>Asunto:</strong> {correo.asunto}
      </p>
      <iframe
        title={`Vista previa: ${actual.nombre}`}
        srcDoc={correo.html}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        style={{ display: "block", width: "100%", height: 1150, border: borde, borderRadius: 8, background: "#ffffff" }}
      />
      <h2 style={{ margin: "32px 0 8px", fontSize: 20, color: "#0a559a" }}>Versión en texto simple</h2>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0, padding: 16, borderRadius: 8, border: borde, background: "#ffffff", fontSize: 14, lineHeight: 1.5 }}>
        {correo.texto}
      </pre>
    </main>
  );

  return (
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="robots" content="noindex, nofollow"><title>Correos · Administrador Diluvium</title></head>` +
    `<body style="margin:0;background:#f3f5f7;color:#1f2933;font-family:Helvetica, Arial, sans-serif">${aHtml(cuerpo)}</body></html>`
  );
}
