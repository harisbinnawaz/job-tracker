"use client";

import { useTheme } from "next-themes";
import { Check, Moon, Palette, Sunrise } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useState, useTransition } from "react";
import { saveThemePreference } from "@/app/(dashboard)/actions";
import { APP_THEMES, DEFAULT_APP_THEME, type AppTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

const themeOptions: Record<
  AppTheme,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  dark: { label: "Dark", icon: Moon },
  warm: { label: "Warm", icon: Sunrise },
  vibrant: { label: "Vibrant", icon: Palette },
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return <div className={cn("h-9 w-[15rem] max-w-full", className)} />;
  }

  const selectedTheme = APP_THEMES.includes(theme as AppTheme)
    ? (theme as AppTheme)
    : DEFAULT_APP_THEME;

  function handleThemeChange(nextTheme: AppTheme) {
    setTheme(nextTheme);
    startTransition(async () => {
      try {
        await saveThemePreference(nextTheme);
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    });
  }

  return (
    <div
      className={cn(
        "flex w-full md:w-auto md:inline-flex p-1 gap-1 items-center border rounded-2xl",
        "border-[var(--border)] bg-[var(--surface-muted)]",
        className
      )}
      aria-label="Choose site theme"
    >
      {APP_THEMES.map((themeName) => {
        const option = themeOptions[themeName];
        const Icon = option.icon;
        const active = selectedTheme === themeName;

        return (
          <button
            key={themeName}
            type="button"
            onClick={() => handleThemeChange(themeName)}
            disabled={isPending && active}
            aria-pressed={active}
            title={`${option.label} theme`}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center py-2 px-3 md:px-4 rounded-xl text-xs font-medium transition-all min-w-0",
              active
                ? "theme-primary"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline-flex md:ml-2">{option.label}</span>
            {active && <Check className="hidden md:inline-flex md:ml-2 h-3.5 w-3.5 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
