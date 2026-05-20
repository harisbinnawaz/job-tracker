import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { createClient } from "@/lib/supabase/server";
import { APP_THEMES, getUserTheme } from "@/lib/themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobTracker — Manage Your Applications",
  description: "A premium, minimal job application tracking tool.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialTheme = "dark";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    initialTheme = getUserTheme(user?.user_metadata?.theme);
  } catch {
    initialTheme = "dark";
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${geistMono.variable} antialiased relative min-h-screen bg-[var(--background)] text-[var(--foreground)]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={initialTheme}
          themes={[...APP_THEMES]}
          enableSystem={false}
          storageKey="job-tracker-theme"
          disableTransitionOnChange
        >
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--ambient-primary)] blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--ambient-secondary)] blur-[120px]" />
          </div>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
