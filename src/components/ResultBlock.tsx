import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function ResultBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="animate-reveal">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      {children}
    </section>
  );
}

export function BulletList({ items }: { items?: string[] }) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">Nothing found.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ResultSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-8/12" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-9/12" />
        <Skeleton className="h-4 w-7/12" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-9/12" />
        <Skeleton className="h-4 w-6/12" />
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
