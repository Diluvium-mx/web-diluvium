// Expresión que se ejecuta dentro de la página para medirla (la usan medir-estilos.mjs y comparar.mjs).
// Selector de secciones: las de Shopify en el sitio en vivo o [data-seccion] en la réplica.

// medirCon(selector) mide otras piezas como si fueran secciones (p. ej. el carrito lateral, que no es sección).
const SECCIONES = "[data-seccion], main .shopify-section, body > .shopify-section, .shopify-section-group-header-group, .shopify-section-group-footer-group";

export const medirCon = (selector) => String.raw`(() => {
  const local = (u) => {
    if (!u) return u;
    const m = u.match(/\/cdn\/shop\/(files|products|videos|articles|collections)\/(.+?)(\?|$)/);
    return m ? "/media/" + m[1] + "/" + decodeURIComponent(m[2].split("/").pop()) : u;
  };
  const px = (v) => (v && v !== "normal" ? v : undefined);
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 1 && r.height > 1 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.01;
  };
  const caja = (el, y0) => {
    const r = el.getBoundingClientRect();
    return [Math.round(r.left), Math.round(r.top + scrollY - y0), Math.round(r.width), Math.round(r.height)];
  };
  const textoPropio = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
  const secciones = [...document.querySelectorAll(${JSON.stringify(selector)})]
    .filter((s, i, arr) => !arr.some((o) => o !== s && o.contains(s)))
    .filter(visible);
  return {
    url: location.href,
    ancho: innerWidth,
    altoPagina: document.documentElement.scrollHeight,
    secciones: secciones.map((sec) => {
      const y0 = sec.getBoundingClientRect().top + scrollY;
      const cs = getComputedStyle(sec);
      const elementos = [];
      const layouts = [];
      for (const el of sec.querySelectorAll("*")) {
        if (elementos.length > 220) break;
        if (!visible(el)) continue;
        const e = getComputedStyle(el);
        const tag = el.tagName.toLowerCase();
        if ((e.display === "flex" || e.display === "grid") && el.children.length > 1 && el.getBoundingClientRect().width > 120) {
          if (layouts.length < 40) layouts.push({ tag, cls: (el.className?.baseVal ?? el.className ?? "").toString().slice(0, 60), caja: caja(el, y0),
            display: e.display, dir: e.flexDirection, gap: e.gap, cols: e.gridTemplateColumns !== "none" ? e.gridTemplateColumns : undefined,
            justify: e.justifyContent, align: e.alignItems, pad: e.padding, maxW: e.maxWidth !== "none" ? e.maxWidth : undefined });
        }
        const propio = textoPropio(el);
        const esMedio = tag === "img" || tag === "video" || tag === "iframe" || tag === "svg";
        const esControl = tag === "a" || tag === "button" || tag === "input" || tag === "select" || tag === "textarea";
        if (!propio && !esMedio && !(esControl && el.innerText?.trim())) continue;
        if (tag === "path" || el.closest("svg") && tag !== "svg") continue;
        const item = { tag, caja: caja(el, y0) };
        if (propio || esControl) {
          item.texto = (propio || el.innerText || el.value || "").replace(/\s+/g, " ").trim().slice(0, 140);
          Object.assign(item, { font: e.fontFamily.split(",")[0].replace(/["']/g, ""), size: e.fontSize, weight: e.fontWeight,
            lh: px(e.lineHeight), ls: px(e.letterSpacing), color: e.color, transform: e.textTransform !== "none" ? e.textTransform : undefined,
            align: e.textAlign, deco: e.textDecorationLine !== "none" ? e.textDecorationLine : undefined });
        }
        if (e.backgroundColor !== "rgba(0, 0, 0, 0)") item.bg = e.backgroundColor;
        if (e.borderRadius !== "0px") item.radius = e.borderRadius;
        if (e.borderTopWidth !== "0px") item.border = e.borderTopWidth + " " + e.borderTopStyle + " " + e.borderTopColor;
        if (esControl) item.pad = e.padding;
        if (tag === "a") item.href = el.getAttribute("href");
        if (tag === "img") Object.assign(item, { src: local(el.currentSrc || el.src), alt: el.alt, natural: [el.naturalWidth, el.naturalHeight], fit: e.objectFit, pos: e.objectPosition });
        if (tag === "video") Object.assign(item, { src: local(el.currentSrc || el.querySelector("source")?.src), poster: local(el.poster), autoplay: el.autoplay, loop: el.loop, muted: el.muted, controls: el.controls, fit: e.objectFit });
        if (tag === "iframe") item.src = el.src;
        if (tag === "svg") item.viewBox = el.getAttribute("viewBox");
        elementos.push(item);
      }
      return {
        id: sec.id, tipo: sec.dataset.seccion ?? sec.querySelector("[data-ui-component]")?.dataset.uiComponent ?? "",
        caja: caja(sec, 0), bg: cs.backgroundColor, layouts, elementos,
      };
    }),
  };
})()`;

export const MEDIR = medirCon(SECCIONES);
