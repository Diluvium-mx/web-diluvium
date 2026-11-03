import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";

export default function Portada() {
  return <Secciones secciones={plantilla("portada").secciones} />;
}
