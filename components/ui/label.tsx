import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-[var(--muted-strong)] leading-none",
        className
      )}
      {...props}
    />
  );
}
