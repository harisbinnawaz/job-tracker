"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { APP_THEMES, DEFAULT_APP_THEME } from "@/lib/themes";

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_APP_THEME,
  enableSystem = false,
  themes = [...APP_THEMES],
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      themes={themes}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
