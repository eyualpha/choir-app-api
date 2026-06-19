import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "violet",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "violet" | "blue" | "emerald" | "amber";
  className?: string;
}) {
  const accents = {
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
  };

  return (
    <div className={cn("surface-card flex items-center gap-4 p-4 sm:p-5", className)}>
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl",
          accents[accent]
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
