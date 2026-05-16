"use client";
import { useReveal } from "@/hooks/useReveal";
import { useScrollBar } from "@/hooks/useScrollBar";

export function PageEffects() {
  useReveal();
  useScrollBar();
  return null;
}
