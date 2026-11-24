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
    r"carousel|per_row|alignment|product_filter"
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
    "landing-pie": "Versión: pie de página", "landing-ficha": "Versión: ficha del producto",
    # Páginas nuevas de B1 (Contacto, Nosotros, Blog, artículo y Productos; 23-nov-2026).
    "landing-titulo": "Versión: título de la página", "landing-productos": "Versión: productos en tarjetas",
    "landing-contacto": "Versión: formas de contacto y formulario", "landing-historia": "Versión: historia por capítulos",
    "landing-premios": "Versión: reconocimientos y premios", "landing-cita": "Versión: mensaje con firma",
    "landing-blog": "Versión: artículos del blog", "landing-articulo": "Versión: artículo del blog",
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
    "question": "Pregunta", "point": "Viñeta", "trust": "Confianza (ícono: envio, garantia, pago, meses, devolucion o factura)",
    "marketplace": "Otra tienda (Mercado Libre, Amazon)",
    "product": "Producto", "channel": "Forma de contacto (ícono: whatsapp, telefono, correo, ubicacion u horario)",
    "chapter": "Capítulo", "award": "Premio",
    "article_card": "Foto de la tarjeta de un artículo", "article_photos": "Fotos de un artículo",
}

# Nombres de campos que dependen de la pieza (24-nov-2026): en «Fotos de un artículo», «image» es la de arriba e
# «image_3» la tercera foto de dentro del texto.
def etiqueta_en_pieza(tipo: str, clave: str) -> str | None:
    if tipo == "article_photos":
        if clave == "image":
            return "Foto de arriba"
        m = re.fullmatch(r"image_(\d+)", clave)
        if m:
            return f"Foto {m.group(1)} del texto"
    return None


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
    # Ficha del producto de las versiones (landing-ficha).
    "sold_text": "Vendidas (junto a las estrellas)", "size_heading": "Título de los tamaños",
    "helper_text": "Ayuda para medir (vacío: no se muestra)", "trust_heading": "Título de confianza (vacío: sin recuadro)",
    "marketplace_text": "Texto antes de las otras tiendas", "gallery_style": "Galería (normal o baja)",
    "include_product_media": "Agregar las fotos del producto", "sticky_bar": "Barra de compra (al_bajar o siempre)",
    "sticky_text": "Texto de la barra si no han elegido tamaño", "poster": "Foto antes de reproducir",
    "icon": "Ícono", "focal": "Encuadre de la foto (x% y%)", "focal_before": "Encuadre de la foto de antes (x% y%)",
    "focal_after": "Encuadre de la foto de después (x% y%)", "video": "Video", "poster": "Foto antes de reproducir",
    # Textos que estaban fijos en el código y ahora se editan (21-nov-2026). {n}, {total}, {tamano} y {medidas} se
    # llenan solos.
    "layout": "Diseño", "whatsapp_icon_end": "Logo de WhatsApp al final del texto",
    "cart_title": "Carrito: título", "cart_added": "Carrito: aviso al agregar", "cart_shipping": "Carrito: «Envío»",
    "cart_free": "Carrito: «Gratis»", "cart_total": "Carrito: «Total»", "cart_note": "Carrito: nota debajo de las formas de pago",
    "cart_pay": "Carrito: botón para pagar", "cart_continue": "Carrito: botón para seguir viendo", "cart_remove": "Carrito: «Quitar»",
    "cart_empty": "Carrito: texto si está vacío", "cart_empty_button": "Carrito: botón si está vacío",
    "menu_page_heading": "Menú: título «En esta página»", "menu_store_heading": "Menú: título «Tienda»",
    "savings_text": "Texto antes del ahorro («Ahorras»)",
    "discount_text": "Descuento junto al precio ({porcentaje} = el % real de descuento)", "measure_placeholder": "Ejemplo dentro del campo de la medida",
    "fit_text": "Resultado de la medida ({tamano} y {medidas})", "wider_text": "Si la entrada es más ancha",
    "wider_link_text": "Enlace si es más ancha", "narrower_text": "Si la entrada es más angosta",
    "narrower_link_text": "Enlace si es más angosta", "sold_out_text": "Tamaño agotado",
    "whatsapp_button_text": "Botón de WhatsApp debajo del de comprar", "drag_hint": "Pista del antes y después",
    "sound_hint": "Aviso del sonido del video", "video_heading": "Ventana «¿Cómo medir?»: título del video",
    "steps_button": "Ventana «¿Cómo medir?»: botón de los pasos", "steps_heading": "Ventana «¿Cómo medir?»: título de los pasos",
    "back_button": "Ventana «¿Cómo medir?»: botón para volver al video", "step_1": "Ventana «¿Cómo medir?»: paso 1",
    "step_2": "Ventana «¿Cómo medir?»: paso 2", "step_3": "Ventana «¿Cómo medir?»: paso 3",
    "table_size": "Tabla: columna del tamaño", "table_width": "Tabla: columna del ancho",
    "table_heading": "Ventana de la tabla: título", "table_note": "Ventana de la tabla: nota",
    # Páginas nuevas de B1 (23-nov-2026).
    "fondo": "Fondo (blanco, niebla, cielo o marino)", "ola": "Ola de arriba (corta, larga, capas, pie o ninguna)",
    "ola_espejo": "Ola volteada", "badge": "Etiqueta sobre la foto", "from_text": "Texto antes del precio («Desde»)",
    "reviews_text": "Texto después del número de reseñas", "faq_link_text": "Enlace a las preguntas",
    "form_heading": "Formulario: título", "form_text": "Formulario: texto", "name_label": "Formulario: nombre",
    "email_label": "Formulario: correo", "message_label": "Formulario: mensaje", "sending_text": "Formulario: mientras se envía",
    "thanks_text": "Formulario: aviso de gracias", "required_text": "Formulario: aviso de campos obligatorios",
    "show_description": "Mostrar la descripción del producto", "description_heading": "Título de la descripción",
    "photo_blur": "Difuminado de las fotos en la reseña en grande (%)", "button_action": "Qué abre el botón (tabla o video)",
    "no_answer_message": "Mensaje de WhatsApp si no hay respuesta ({pregunta} = lo que escribió)",
    "narrow_message": "Mensaje de WhatsApp si la entrada es más angosta ({cm} = su medida)",
    "whatsapp_answer_text": "Texto del enlace de WhatsApp en las respuestas",
    "whatsapp_message": "Mensaje de WhatsApp debajo de la respuesta (vacío: sin enlace)",
    "signature": "Firma", "link_text": "Texto del enlace", "read_more": "Texto para leer el artículo",
    "back_text": "Texto para volver al blog", "author_prefix": "Texto antes del autor", "related_heading": "Título de los otros artículos",
    "more_button": "Botón «Ver más»", "count_text": "Cuántas se ven ({n} de {total})",
    "read_more_text": "Texto para leer la reseña completa", "viewer_title": "Reseña en grande: título ({n} de {total})",
    "prev_button": "Reseña en grande: anterior", "next_button": "Reseña en grande: siguiente",
    "more_six_button": "Reseña en grande: ver más", "search_heading": "Caja de preguntas: título",
    "search_placeholder": "Caja de preguntas: ejemplo dentro (si no hay lista de ejemplos)",
    "search_examples": "Caja de preguntas: ejemplos que van cambiando (uno por renglón)", "search_button": "Caja de preguntas: botón",
    "no_answer_text": "Caja de preguntas: si no hay respuesta", "contact_heading": "Título de contacto",
    "store_heading": "Título de la tienda",
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
                 "campos": [{**c, "etiqueta": etiqueta_en_pieza(bt, c["clave"]) or c["etiqueta"]} for c in campos(sec["bloques"][bt])]}
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
