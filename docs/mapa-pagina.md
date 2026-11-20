# Mapa de la página (para pedir cambios en una línea)

> **Desde el 21-nov-2026 lo principal es la pestaña Mapa del editor** (`docs/editor.md`): un número fijo por cada
> elemento, «Producto 37: …». Esta guía es el mapa por partes y campos (`?mapa` en la página publicada).

20-nov-2026. Igual que el mapa del CRM, pero **vivo**: los nombres salen solos del contenido de la página, así que
nunca se quedan viejos y no hay capturas que actualizar.

## Cómo verlo
Agrega `?mapa` al final de la dirección de cualquier página de B1:
- Portada: `https://diluvium-prueba.web-diluvium.workers.dev/v/b1?mapa`
- Producto: `https://diluvium-prueba.web-diluvium.workers.dev/v/b1/products/compuerta-anti-inundaciones?mapa`

Cada parte de la página sale con un recuadro rojo y su nombre. Al tocar el nombre se abre la lista de lo que tiene
esa parte (textos, fotos, piezas) con su propio nombre y lo que dice hoy. Al tocar un renglón, se señala en la página
y **su nombre se copia** para pegarlo en el chat. «Ocultar» quita los recuadros.

## Cómo se leen los nombres
| Nombre | Qué es |
|---|---|
| `B1-P2` | Versión B1 › **P**roducto › parte 2 contando desde arriba (el encabezado es la 1) |
| `B1-I3` | Versión B1 › **I**nicio (la portada) › parte 3 |
| `B1-P2.4` | El campo 4 de esa parte (un texto, una foto, un enlace…) |
| `B1-P2.b5` | La pieza 5 de esa parte (una foto de la galería, una reseña, un beneficio, un paso…) |
| `B1-P2.b5.1` | El campo 1 de esa pieza |

## Cómo pedir un cambio
> **Nombre › qué quiero**

Ejemplos:
1. «B1-P2.5: que diga "Protege tu entrada en 10 minutos".»
2. «B1-P2.b6: cambia esta foto por la de la puerta café.»
3. «B1-I2.9: el botón que diga "Quiero mi compuerta".»
4. «B1-P3: quita esta parte del producto.»

Los números se recalculan si se agrega o se quita una parte: usa siempre el mapa de ese momento.

## Para Claude
`B1-P2.b5.1` → `contenido/tema/product.b1.json` › `secciones[1]` › `bloques[4]` › la 1.ª clave de `ajustes`
(en el orden del archivo). `I` = `index.b1.json`. Lo calcula `src/lib/mapa.ts` (`mapaPlantilla`); la superposición
está en `src/components/mapa/`. Solo se carga con `?mapa`: la página normal no pesa más.
