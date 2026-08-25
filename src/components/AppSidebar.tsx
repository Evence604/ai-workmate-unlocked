import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Mail, NotebookPen, Search, Settings, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="grid size-9 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
          W
        </div>
        <div>
          <div className="font-display text-base font-semibold leading-none">AI WorkMate</div>
          <div className="mt-1 text-[11px] font-medium text-muted-foreground">Productivity suite</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-accent font-semibold text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl bg-foreground p-4 text-background">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4" aria-hidden />
          No account needed
        </div>
        <p className="mt-1 text-xs leading-relaxed opacity-70">
          Every tool is ready the moment you arrive. Saved work stays in this browser.
        </p>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <SidebarNav />
    </aside>
  );
}
