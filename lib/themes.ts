export const APP_THEMES = ["dark", "warm", "light", "vibrant"] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === "string" && APP_THEMES.includes(value as AppTheme);
}

export function getUserTheme(value: unknown): AppTheme {
  return isAppTheme(value) ? value : "dark";
}
