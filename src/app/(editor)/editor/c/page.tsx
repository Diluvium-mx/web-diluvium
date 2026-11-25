import type { Metadata } from "next";
import { editorDe } from "../editorDe";

// Editor · C (25-nov-2026): todas las páginas de la versión C1. Solo en esta Mac: http://localhost:3100/editor/c.

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editor · C" };

export default async function EditorVersionC() {
  return editorDe("C1");
}
