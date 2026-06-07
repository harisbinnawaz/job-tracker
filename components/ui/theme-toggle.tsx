"use client";

import { useTheme } from "next-themes";
import { Moon, Palette, Sunrise } from "lucide-react";
import { useEffect, useState } from "react";
import { APP_THEMES, DEFAULT_APP_THEME, type AppTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  if (!mounted) return <div className="h-9 w-9" />;

  const selectedTheme = APP_THEMES.includes(theme as AppTheme)
    ? (theme as AppTheme)
    : DEFAULT_APP_THEME;
  const selectedIndex = APP_THEMES.indexOf(selectedTheme);
  const nextTheme = APP_THEMES[(selectedIndex + 1) % APP_THEMES.length];
  const Icon =
    selectedTheme === "dark" ? Moon : selectedTheme === "vibrant" ? Palette : Sunrise;

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]",
        "transition-colors duration-150",
        className
      )}
      aria-label="Cycle theme"
      title={`Switch to ${nextTheme} theme`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
