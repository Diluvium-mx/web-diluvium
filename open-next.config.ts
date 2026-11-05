// Configuración de OpenNext (lo que convierte la página de Next.js en un Worker de Cloudflare). Sin cambios: la página
// es casi toda estática y el contenido se escribe antes de construir, así que no hace falta caché extra.
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({});
