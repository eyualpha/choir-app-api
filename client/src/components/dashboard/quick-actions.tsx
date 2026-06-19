import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const chipStyles = [
  "chip-pastel-lavender",
  "chip-pastel-mint",
  "chip-pastel-peach",
  "chip-pastel-sky",
];

export function QuickActions({
  actions,
}: {
  actions: Array<{ href: string; label: string; description: string; icon: LucideIcon }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            "group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-sm",
            chipStyles[i % chipStyles.length]
          )}
        >
          <action.icon className="size-4" strokeWidth={1.75} />
          <span>{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
