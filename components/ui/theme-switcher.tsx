"use client";

import { useTheme } from "next-themes";
import { Check, Moon, Palette, Sun, Sunrise } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useState, useTransition } from "react";
import { saveThemePreference } from "@/app/(dashboard)/actions";
import { APP_THEMES, type AppTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

const themeOptions: Record<
  AppTheme,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  dark: { label: "Dark", icon: Moon },
  warm: { label: "Warm", icon: Sunrise },
  light: { label: "Light", icon: Sun },
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
    return <div className={cn("h-9 w-[19rem] max-w-full", className)} />;
  }

  const selectedTheme = APP_THEMES.includes(theme as AppTheme)
    ? (theme as AppTheme)
    : "dark";

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
        "grid grid-cols-4 gap-1 rounded-lg border p-1",
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
              "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-all",
              active
                ? "theme-primary"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{option.label}</span>
            {active && <Check className="hidden h-3 w-3 shrink-0 sm:block" />}
          </button>
        );
      })}
    </div>
  );
}
