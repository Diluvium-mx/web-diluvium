"""Arma el esquema del administrador para las secciones del tema: qué tipos de sección y de pieza existen, qué campos
tiene cada uno (texto, texto con formato, foto, video, sí/no, número) y su nombre en español. Sale de los datos reales
(contenido/tema/*.json), no del código del tema Shine.

Uso: python3 -I herramientas/esquema-secciones.py
Sale: src/payload/esquema-secciones.json (lo lee src/payload/secciones.ts para armar los bloques del administrador)
"""

import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TEMA = RAIZ / "contenido/tema"
SALIDA = RAIZ / "src/payload/esquema-secciones.json"

IMAGEN = re.compile(r"^/media/.+\.(jpe?g|png|webp|gif|svg|avif)$", re.I)
VIDEO = re.compile(r"^/media/.+\.(mp4|webm|mov)$", re.I)
HTML = re.compile(r"<[a-z][^>]*>", re.I)

# Palabras de los nombres de ajustes → español (para el nombre que ve el dueño).
PALABRAS = {
    "action": "acción", "add": "agregar", "after": "después", "aligment": "alineación", "align": "alineación",
    "alignment": "alineación", "all": "todo", "and": "y", "article": "artículo", "author": "autor", "auto": "automático",
    "autoplay": "reproducir solo", "avatar": "avatar", "back": "atrás", "background": "fondo", "badge": "etiqueta",
    "base": "base", "before": "antes", "bg": "fondo", "bgc": "color de fondo", "block": "pieza", "blog": "blog",
    "blogs": "blogs", "blurry": "difuminado", "body": "texto", "bottom": "abajo", "builder": "constructor",
    "button": "botón", "buttons": "botones", "buy": "comprar", "card": "tarjeta", "carousel": "carrusel",
    "cart": "carrito", "change": "cambiar", "checkmark": "palomita", "checkout": "pago", "code": "código",
    "collage": "collage", "collection": "colección", "color": "color", "column": "columna", "columns": "columnas",
    "common": "común", "component": "componente", "contact": "contacto", "container": "contenedor",
    "content": "contenido", "corner": "esquina", "currency": "moneda", "custom": "personalizado", "date": "fecha",
    "decimal": "decimal", "default": "predeterminado", "description": "descripción", "desktop": "computadora",
    "direction": "dirección", "disable": "desactivar", "drawer": "panel", "dynamic": "dinámico", "email": "correo",
    "empty": "vacío", "enable": "activar", "enabled": "activo", "excerpt": "resumen", "expand": "expandir",
    "external": "externo", "facebook": "Facebook", "faq": "pregunta", "favicon": "ícono de pestaña",
    "featured": "destacado", "filter": "filtro", "first": "primero", "follow": "seguir", "font": "letra",
    "footer": "pie", "for": "para", "form": "formulario", "free": "gratis", "full": "completo",
    "fullwidth": "ancho completo", "gift": "regalo", "gradient": "degradado", "guide": "guía", "header": "encabezado",
    "heading": "título", "height": "alto", "highlight": "resaltado", "highlighted": "resaltado", "hosted": "propio",
    "hover": "al pasar", "html": "HTML", "icon": "ícono", "icons": "íconos", "image": "imagen", "img": "imagen",
    "in": "en", "information": "información", "instagram": "Instagram", "item": "elemento", "items": "elementos",
    "label": "texto", "language": "idioma", "large": "grande", "layout": "diseño", "library": "biblioteca",
    "link": "enlace", "linkedin": "LinkedIn", "liquid": "código", "list": "lista", "load": "cargar", "logo": "logo",
    "loop": "repetir", "low": "bajo", "main": "principal", "margin": "margen", "mask": "máscara", "max": "máximo",
    "media": "medio", "menu": "menú", "message": "mensaje", "method": "método", "methods": "métodos",
    "minimum": "mínimo", "mobile": "celular", "moving": "en movimiento", "mute": "silenciar", "names": "nombres",
    "new": "nuevo", "newsletter": "boletín", "notification": "aviso", "number": "número", "on": "en", "one": "uno",
    "opacity": "opacidad", "open": "abrir", "option": "opción", "options": "opciones", "order": "pedido",
    "ordering": "orden", "out": "fuera", "overlay": "capa", "padding": "relleno", "page": "página",
    "pause": "pausa", "payment": "pago", "per": "por", "phone": "teléfono", "picker": "selector", "places": "lugares",
    "play": "reproducir", "policy": "política", "popover": "ventana", "position": "posición", "price": "precio",
    "primary": "principal", "product": "producto", "products": "productos", "prominent": "destacado",
    "promotion": "promoción", "publish": "publicar", "published": "publicada", "quantity": "cantidad",
    "quaternary": "cuarto", "quick": "rápido", "quickshop": "compra rápida", "radius": "redondeo",
    "rating": "calificación", "ratio": "proporción", "recipient": "destinatario", "remove": "quitar",
    "result": "resultado", "reverse": "invertido", "row": "fila", "rss": "RSS", "sale": "oferta", "scheme": "esquema",
    "schemes": "esquemas", "search": "búsqueda", "second": "segundo", "secondary": "secundario", "section": "sección",
    "selected": "elegido", "selection": "selección", "selector": "selector", "shipping": "envío", "shop": "tienda",
    "show": "mostrar", "size": "tamaño", "slides": "diapositivas", "social": "redes", "socical": "redes",
    "sold": "agotado", "sort": "ordenar", "source": "origen", "speed": "velocidad", "star": "estrella",
    "state": "estado", "static": "fijo", "sticky": "fijo", "stock": "existencias", "style": "estilo",
    "sub": "sub", "subheading": "subtítulo", "submit": "enviar", "subtitle": "subtítulo", "success": "éxito",
    "swatch": "muestra", "swatches": "muestras", "tabs": "pestañas", "tags": "etiquetas", "tax": "impuestos",
    "tertiary": "tercero", "text": "texto", "theme": "tema", "thickness": "grosor", "threshold": "umbral",
    "thumbnail": "miniatura", "thumbnails": "miniaturas", "time": "tiempo", "title": "título", "to": "a",
    "top": "arriba", "trigger": "activador", "type": "tipo", "underline": "subrayado", "url": "dirección",
    "using": "usando", "variant": "tamaño", "vendor": "proveedor", "video": "video", "view": "vista",
    "when": "cuando", "width": "ancho", "with": "con", "youtube": "YouTube", "zoom": "zoom",
}

# Ajustes de forma (no de contenido): van juntos en un grupo «Diseño» que se abre aparte.
DISENO = re.compile(
    r"align|aligment|position|ordering|scheme|ratio|padding|margin|radius|thickness|opacity|direction|layout|"
    r"width|height|columns|column|size|style|color|gradient|overlay|speed|mask|corner|font|bg|background|spacing|"
    r"carousel|per_row|alignment"
)

SECCIONES = {
    "apps": "Apps (reseñas)", "before-after-images": "Antes y después", "blog-post-list": "Lista del blog",
    "breadcrumb": "Migas de pan", "content-collage": "Collage de contenido", "custom-liquid": "Código propio",
    "customer-reviews": "Reseñas de clientes", "extra-info-header": "Barra de contacto", "faqs": "Preguntas frecuentes",
    "featured-product": "Producto destacado", "footer": "Pie de página", "header": "Encabezado",
    "icon-with-text": "Íconos con texto", "image-banner": "Banner con imagen", "image-collage-with-text":
    "Collage de imagen con texto", "image-gallery": "Galería de imágenes", "info-tab": "Pestañas de información",
    "logos": "Logos", "main-404": "Página no encontrada", "main-article": "Artículo", "main-blog": "Blog",
    "main-cart": "Carrito", "main-collection-products": "Productos de la colección",
    "main-list-collections": "Lista de colecciones", "main-page": "Contenido de la página",
    "main-password": "Contraseña", "main-product": "Ficha del producto", "main-product-quick-add": "Agregar rápido",
    "main-product-quick-view": "Vista rápida", "main-search": "Búsqueda", "media-with-text-columns":
    "Columnas de medios con texto", "multiple-product-tabs": "Pestañas de productos",
    "product-recommendation": "Productos recomendados", "running-content": "Franja que corre",
    "scrolling-logos": "Logos que se desplazan", "spacer": "Espacio", "text": "Texto", "video-with-text":
    "Video con texto", "whatsapp-form": "Formulario de WhatsApp",
    # Secciones propias de las versiones de prueba de la portada (/v/<versión>).
    "landing-encabezado": "Versión: encabezado", "landing-portada": "Versión: primera pantalla",
    "landing-resenas": "Versión: muro de reseñas", "landing-comparacion": "Versión: lo de siempre contra Diluvium",
    "landing-beneficios": "Versión: beneficios", "landing-pasos": "Versión: cómo funciona (pasos)",
    "landing-preguntas": "Versión: preguntas frecuentes", "landing-cierre": "Versión: cierre",
    "landing-pie": "Versión: pie de página",
}

BLOQUES = {
    "button": "Botón", "buy_buttons": "Botones de compra", "checkmarks": "Palomitas", "collapsible_item": "Acordeón",
    "content": "Contenido", "custom_text": "Texto propio", "description": "Descripción", "faq_item": "Pregunta",
    "featured_image": "Imagen destacada", "header-card": "Tarjeta", "heading": "Título", "icon": "Ícono",
    "icon_with_text": "Ícono con texto", "image": "Imagen", "item": "Elemento", "logo": "Logo",
    "newsletter": "Boletín", "popup_content": "Ventana emergente", "price": "Precio", "review": "Reseña",
    "search": "Búsqueda", "single_menu": "Menú", "social": "Redes sociales", "store_information": "Datos de la tienda",
    "subheading": "Subtítulo", "tab": "Pestaña", "text": "Texto", "title": "Título", "variant": "Tamaños",
    "video": "Video", "view_detail": "Ver detalles", "whatsapp-button": "Botón de WhatsApp",
    # Piezas de las versiones de prueba.
    "link": "Enlace del menú", "before_after": "Foto de antes y después", "sizes": "Tamaños con «Añadir al carrito»",
    "before": "Punto de «lo de siempre»", "after": "Punto de «con Diluvium»", "benefit": "Beneficio", "step": "Paso",
    "question": "Pregunta", "point": "Viñeta",
}


def etiqueta_bloque(tipo: str) -> str:
    if tipo.startswith("shopify://apps/"):
        app = tipo.split("/")[3]
        pieza = tipo.split("/")[5]
        nombre = {"star-rating-widget": "estrellas", "barrage-carousel": "carrusel", "nestscale_edd_product":
                  "fecha de entrega", "app-block-bundle": "paquetes", "app-block-qb": "descuento por cantidad"}
        return f"App: {nombre.get(pieza, pieza)} ({app.split('-')[0]})"
    return BLOQUES.get(tipo, tipo.replace("_", " ").replace("-", " ").capitalize())


# Nombres armados a mano para los ajustes más comunes.
FIJAS = {
    "color_scheme": "Esquema de color", "heading": "Título", "subheading": "Subtítulo", "description": "Descripción",
    "heading_size": "Tamaño del título", "button_text": "Texto del botón", "button_label": "Texto del botón",
    "button_link": "Enlace del botón", "link": "Enlace", "text": "Texto", "title": "Título", "image": "Imagen",
    "content": "Contenido", "label": "Texto", "url": "Dirección", "video_url": "Dirección del video",
    # Ajustes de las versiones de prueba. En los textos se pueden usar {precio}, {precio_antes}, {desde}, {hasta},
    # {tamanos} y {calificacion}: salen del catálogo y de las reseñas publicadas.
    "alt": "Texto alternativo (para quien no ve la foto)", "alt_before": "Texto alternativo de antes",
    "alt_after": "Texto alternativo de después", "label_before": "Etiqueta de antes", "label_after": "Etiqueta de después",
    "heading_before": "Título de «lo de siempre»", "heading_after": "Título de «con Diluvium»",
    "image_before": "Foto de antes", "image_after": "Foto de después", "rating_text": "Calificación ({calificacion} = 4.9)",
    "price_note": "Nota del precio", "guarantees": "Quita-miedos junto al botón", "media_caption": "Pie de la foto",
    "producto": "Producto (su dirección, sin /products/)", "menu_text": "Texto del menú",
    "whatsapp_link": "Enlace de WhatsApp", "whatsapp_text": "Texto del enlace de WhatsApp",
    "measure_text": "Texto de «¿Cómo medir?»", "custom_text": "Pregunta de la medida especial",
    "custom_link_text": "Texto del enlace a la medida especial", "custom_link": "Enlace a la medida especial",
    "error_text": "Aviso si no eligen tamaño", "name": "Nombre junto al logo",
}
# Lo que dice en qué pantalla aplica va al final: «Imagen (celular)».
PANTALLAS = {"desktop": "computadora", "mobile": "celular", "md": "computadora", "xs": "celular"}


def etiqueta(clave: str) -> str:
    if clave in FIJAS:
        return FIJAS[clave]
    partes = clave.split("_")
    pantalla = [PANTALLAS[p] for p in partes if p in PANTALLAS]
    resto = [p for p in partes if p not in PANTALLAS]
    base = FIJAS.get("_".join(resto)) or " ".join(PALABRAS.get(p, p) for p in resto)
    texto = base + (f" ({pantalla[0]})" if pantalla else "")
    return texto[:1].upper() + texto[1:]


def tipo_campo(clave: str, valores: list) -> str:
    if all(isinstance(v, bool) for v in valores):
        return "siNo"
    if all(isinstance(v, (int, float)) and not isinstance(v, bool) for v in valores):
        return "numero"
    if any(isinstance(v, (list, dict)) for v in valores):
        return "json"
    textos = [v for v in valores if isinstance(v, str) and v]
    if textos and all(IMAGEN.match(v) for v in textos):
        return "imagen"
    # Sin ningún valor lleno: se decide por el nombre (una foto que hoy está vacía sigue siendo foto).
    if not textos and re.search(r"(^|_)(image|img|logo|avatar|thumbnail)(_|$)", clave):
        return "imagen"
    if textos and all(VIDEO.match(v) for v in textos):
        return "video"
    if any(HTML.search(v) for v in textos):
        return "html"
    if any(len(v) > 90 or "\n" in v for v in textos):
        return "textoLargo"
    return "texto"


def campos(muestras: dict[str, list]) -> list[dict]:
    salida = []
    for clave, valores in muestras.items():
        salida.append({"clave": clave, "tipo": tipo_campo(clave, valores), "etiqueta": etiqueta(clave),
                       "diseno": bool(DISENO.search(clave))})
    return salida


def main() -> None:
    secciones: dict[str, dict] = {}
    for archivo in sorted(TEMA.glob("*.json")):
        datos = json.loads(archivo.read_text())
        for s in datos.get("secciones", []):
            sec = secciones.setdefault(s["tipo"], {"muestras": {}, "bloques": {}})
            for k, v in s["ajustes"].items():
                sec["muestras"].setdefault(k, []).append(v)
            for b in s.get("bloques", []):
                blq = sec["bloques"].setdefault(b["tipo"], {})
                for k, v in b["ajustes"].items():
                    blq.setdefault(k, []).append(v)

    # Números estables: cada tipo de sección y de pieza conserva el número que ya tenía (las piezas guardadas en el
    # administrador se reconocen por él, «s05-b02»). Los tipos nuevos toman el siguiente número libre, al final.
    previos: dict[str, int] = {}
    previos_bloques: dict[tuple[str, str], int] = {}
    if SALIDA.exists():
        for s in json.loads(SALIDA.read_text()).get("secciones", []):
            previos[s["tipo"]] = int(s["dbName"][1:])
            for b in s["bloques"]:
                previos_bloques[(s["tipo"], b["tipo"])] = int(b["dbName"].split("b")[-1])

    numeros: dict[str, int] = {}
    for tipo in sorted(secciones):
        if tipo in previos:
            numeros[tipo] = previos[tipo]
    for tipo in sorted(secciones):
        if tipo not in numeros:
            numeros[tipo] = max([*numeros.values(), *previos.values(), -1]) + 1

    esquema = {"secciones": []}
    for tipo in sorted(secciones, key=lambda t: numeros[t]):
        sec = secciones[tipo]
        n = numeros[tipo]
        numeros_bloques: dict[str, int] = {}
        for bt in sorted(sec["bloques"]):
            if (tipo, bt) in previos_bloques:
                numeros_bloques[bt] = previos_bloques[(tipo, bt)]
        for bt in sorted(sec["bloques"]):
            if bt not in numeros_bloques:
                usados = [*numeros_bloques.values(), *(m for (t, _), m in previos_bloques.items() if t == tipo), -1]
                numeros_bloques[bt] = max(usados) + 1
        esquema["secciones"].append({
            "tipo": tipo,
            "slug": tipo,
            "dbName": f"s{n:02d}",
            "etiqueta": SECCIONES.get(tipo, tipo),
            "campos": campos(sec["muestras"]),
            "bloques": [
                {"tipo": bt, "slug": f"s{n:02d}-b{m:02d}", "dbName": f"s{n:02d}b{m:02d}", "etiqueta": etiqueta_bloque(bt),
                 "campos": campos(sec["bloques"][bt])}
                for bt, m in sorted(numeros_bloques.items(), key=lambda x: x[1])
            ],
        })
    ajustes = json.loads((TEMA / "ajustes.json").read_text())
    esquema["ajustesTema"] = campos({k: [v] for k, v in ajustes.items()})

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(esquema, ensure_ascii=False, indent=1) + "\n")
    total_bloques = sum(len(s["bloques"]) for s in esquema["secciones"])
    total_campos = sum(len(s["campos"]) + sum(len(b["campos"]) for b in s["bloques"]) for s in esquema["secciones"])
    print(f"{len(esquema['secciones'])} secciones, {total_bloques} tipos de pieza, {total_campos} campos → "
          f"{SALIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
