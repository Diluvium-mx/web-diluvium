import type { Metadata } from "next";
import { editorDe } from "../editorDe";

// Editor · D (25-nov-2026): todas las páginas de la versión D1. Solo en esta Mac: http://localhost:3100/editor/d.

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editor · D" };

export default async function EditorVersionD() {
  return editorDe("D1");
}
