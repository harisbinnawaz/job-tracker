import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2 rounded-md font-medium",
          "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === "primary" && [
            "bg-zinc-100 text-zinc-900",
            "hover:bg-zinc-200",
          ],
          variant === "secondary" && [
            "border border-zinc-700",
            "bg-zinc-900",
            "text-zinc-300",
            "hover:bg-zinc-800",
          ],
          variant === "ghost" && [
            "text-zinc-400",
            "hover:bg-zinc-800",
          ],
          variant === "destructive" && [
            "bg-red-600 text-white hover:bg-red-700",
          ],
          // Sizes
          size === "sm" && "h-7 px-3 text-xs",
          size === "md" && "h-9 px-4 text-sm",
          size === "lg" && "h-10 px-6 text-sm",
          size === "icon" && "h-9 w-9",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
