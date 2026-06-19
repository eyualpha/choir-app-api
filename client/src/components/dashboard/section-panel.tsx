import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function SectionPanel({
  title,
  description,
  href,
  linkLabel = "View all",
  className,
  children,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:mt-0"
          >
            {linkLabel}
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}
