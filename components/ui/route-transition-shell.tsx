"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => Promise<void> | void) => {
    finished: Promise<void>;
  };
};

function isLocalRoutableLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href);

  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return false;
  }

  return true;
}

export function RouteTransitionShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const resolveTransitionRef = useRef<(() => void) | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const routeTone = useMemo(() => {
    if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
      return "auth";
    }

    if (pathname.startsWith("/dashboard")) {
      return "dashboard";
    }

    return "default";
  }, [pathname]);

  useEffect(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    resolveTransitionRef.current?.();
    resolveTransitionRef.current = null;
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor || !isLocalRoutableLink(anchor)) return;

      const viewTransitionDocument = document as ViewTransitionDocument;
      const href = `${anchor.pathname}${anchor.search}${anchor.hash}`;

      if (!viewTransitionDocument.startViewTransition) {
        return;
      }

      event.preventDefault();

      viewTransitionDocument.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolveTransitionRef.current = resolve;
            fallbackTimerRef.current = window.setTimeout(() => {
              resolveTransitionRef.current?.();
              resolveTransitionRef.current = null;
              fallbackTimerRef.current = null;
            }, 1200);
            router.push(href);
          })
      );
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [router]);

  return (
    <div
      key={pathname}
      className={`route-transition route-transition-${routeTone}`}
    >
      {children}
    </div>
  );
}
