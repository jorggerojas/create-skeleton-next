import type { Router } from "@/core/context";

export const TEMPLATES: Record<Router, string> = {
  app: "jorggerojas/next-skeleton-app",
  pages: "jorggerojas/next-skeleton-page",
} as const;
