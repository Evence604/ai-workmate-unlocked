import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail, NotebookPen, Search, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSavedItems } from "@/lib/saved";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI WorkMate" },
      {
        name: "description",
        content:
          "Open the AI WorkMate dashboard and jump straight into research, email drafting, or meeting summaries.",
      },
      { property: "og:title", content: "AI WorkMate Dashboard" },
      {
        property: "og:description",
        content: "Three AI tools, ready instantly: research, emails, meeting summaries.",
      },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    to: "/research" as const,
    tag: "Research",
    icon: Search,
    title: "Research Assistant",
    copy: "Turn a topic into summaries, key findings, and recommended next questions in seconds.",
    cta: "Open tool",
  },
  {
    to: "/email" as const,
    tag: "Writing",
    icon: Mail,
    title: "Email Generator",
    copy: "Describe the purpose and pick a tone to draft a polished, ready-to-send professional email.",
    cta: "Open tool",
  },
  {
    to: "/meetings" as const,
    tag: "Notes",
    icon: NotebookPen,
    title: "Meeting Summarizer",
    copy: "Paste long notes and get a summary, decisions, action items, and named owners.",
    cta: "Open tool",
  },
];

const QUICK_ACTIONS = [
  { to: "/research" as const, icon: Search, label: "New research" },
  { to: "/email" as const, icon: Mail, label: "Draft email" },
  { to: "/meetings" as const, icon: NotebookPen, label: "Summarize notes" },
  { to: "/settings" as const, icon: Sparkles, label: "Preferences" },
];

function timeAgo(ts: number) {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
}

function Dashboard() {
  const { items, remove } = useSavedItems();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="font-display text-3xl font-semibold md:text-4xl">
            Everything you need to get work done, in one place.
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Research topics, draft emails, and summarize meetings — powered by AI, ready the moment
            you arrive.
          </p>
        </div>
        <div className="hidden shrink-0 rounded-xl border border-border bg-card px-4 py-3 text-center md:block">
          <div className="font-display text-2xl font-semibold text-primary">3</div>
          <div className="text-[11px] font-medium text-muted-foreground">active tools</div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.to}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="flex items-start justify-between">
              <div className="grid size-12 place-items-center rounded-xl bg-accent">
                <f.icon className="size-5 text-primary" aria-hidden />
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {f.tag}
              </span>
            </div>
            <h2 className="mt-5 font-display text-lg font-semibold">{f.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.copy}</p>
            <Button asChild className="mt-5 w-full rounded-xl">
              <Link to={f.to}>
                {f.cta} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Quick actions</h2>
            <span className="text-xs font-medium text-muted-foreground">Jump straight in</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary/40 hover:bg-accent"
              >
                <a.icon className="size-4 text-primary" aria-hidden />
                <span className="text-xs font-semibold">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <h2 className="font-display text-base font-semibold">Saved work</h2>
          </div>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nothing saved yet. Research briefs and meeting summaries you save appear here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                    {item.kind === "research" ? (
                      <Search className="size-3.5" aria-hidden />
                    ) : item.kind === "email" ? (
                      <Mail className="size-3.5" aria-hidden />
                    ) : (
                      <NotebookPen className="size-3.5" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.kind} · {timeAgo(item.createdAt)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
