import type { Metadata } from "next";
import { METADATOS_SITIO, MarcoSitio } from "@/components/MarcoSitio";
import "./globals.css";

// Diseño de la tienda (todas las páginas públicas). El administrador vive aparte en app/(payload).

export const metadata: Metadata = METADATOS_SITIO;

export default function DisenoSitio({ children }: { children: React.ReactNode }) {
  return <MarcoSitio>{children}</MarcoSitio>;
}
