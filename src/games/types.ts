import type { ComponentType } from "react";

export type LiveGame = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  Component: ComponentType;
};
