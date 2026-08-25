import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Copy, Eraser, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { BulletList, EmptyState, ResultBlock, ResultSkeleton } from "@/components/ResultBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MeetingResult } from "@/lib/ai-types";
import { generateMeetingSummary } from "@/lib/ai.functions";
import { bullets, copyText } from "@/lib/copy";
import { useSavedItems } from "@/lib/saved";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI WorkMate" },
      {
        name: "description",
        content:
          "Paste raw meeting notes and get a summary, key discussion points, decisions, action items with owners, and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Turn long meeting notes into clear decisions and action items.",
      },
    ],
  }),
  component: MeetingsPage,
});

function asText(r: MeetingResult) {
  return (
    `${r.title}\n\nSUMMARY\n${r.summary}\n\n` +
    bullets("KEY DISCUSSION POINTS", r.discussionPoints) +
    bullets("DECISIONS", r.decisions) +
    bullets(
      "ACTION ITEMS",
      (r.actionItems ?? []).map((a) =>
        [a.task, a.owner && `owner: ${a.owner}`, a.due && `due: ${a.due}`]
          .filter(Boolean)
          .join(" — "),
      ),
    ) +
    bullets("DEADLINES", (r.deadlines ?? []).map((d) => `${d.what} — ${d.when}`))
  ).trim();
}

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<MeetingResult | null>(null);
  const run = useServerFn(generateMeetingSummary);
  const { save } = useSavedItems();

  const mutation = useMutation({
    mutationFn: () =>
      run({ data: { notes: notes.trim(), title: title.trim() || undefined } }),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Summary ready");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't summarize the notes"),
  });

  const submit = () => {
    if (notes.trim().length < 20) {
      toast.error("Paste a bit more of the meeting notes first.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Meeting Summarizer"
        title="From messy notes to clear actions"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setNotes("");
                setTitle("");
                setResult(null);
              }}
            >
              <Eraser className="size-4" /> Clear
            </Button>
            <Button onClick={submit} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : result ? (
                <RefreshCw className="size-4" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {result ? "Summarize again" : "Summarize notes"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="mtitle" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Meeting title (optional)
            </Label>
            <Input
              id="mtitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q3 Product Sync"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Raw meeting notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste transcripts or bullet points here…"
              className="min-h-72 resize-none rounded-xl leading-relaxed"
            />
          </div>
          <Button className="w-full" onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Summarizing…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Summarize
              </>
            )}
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {mutation.isPending
                ? "Summarizing"
                : result
                  ? `${result.actionItems?.length ?? 0} action items found`
                  : "Awaiting notes"}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!result}
                onClick={() => result && copyText(asText(result))}
              >
                <Copy className="size-4" /> Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!result}
                onClick={() => {
                  if (!result) return;
                  save("meeting", result.title || title || "Meeting summary", asText(result));
                  toast.success("Saved to this browser");
                }}
              >
                <Save className="size-4" /> Save
              </Button>
              <Button variant="ghost" size="sm" disabled={!result} onClick={() => setResult(null)}>
                <Eraser className="size-4" /> Clear
              </Button>
            </div>
          </div>

          <div className="p-6">
            {mutation.isPending ? (
              <ResultSkeleton />
            ) : result ? (
              <div className="space-y-8">
                <div className="animate-reveal">
                  <h2 className="font-display text-xl font-semibold">{result.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {result.summary}
                  </p>
                </div>
                <ResultBlock label="Key discussion points">
                  <BulletList items={result.discussionPoints} />
                </ResultBlock>
                <ResultBlock label="Decisions">
                  <BulletList items={result.decisions} />
                </ResultBlock>
                <ResultBlock label="Action items">
                  {result.actionItems?.length ? (
                    <div className="space-y-3">
                      {result.actionItems.map((a, i) => (
                        <div
                          key={i}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background p-3"
                        >
                          <span className="text-sm">{a.task}</span>
                          <div className="flex items-center gap-2">
                            {a.due ? (
                              <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {a.due}
                              </span>
                            ) : null}
                            {a.owner ? (
                              <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">
                                {a.owner}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No action items mentioned.</p>
                  )}
                </ResultBlock>
                <ResultBlock label="Deadlines">
                  {result.deadlines?.length ? (
                    <ul className="space-y-2">
                      {result.deadlines.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CalendarClock className="size-4 text-primary" aria-hidden />
                          <span className="font-medium">{d.when}</span>
                          <span className="text-muted-foreground">— {d.what}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No deadlines mentioned.</p>
                  )}
                </ResultBlock>
              </div>
            ) : (
              <EmptyState message="Paste your meeting notes on the left to get a summary, decisions, action items with owners, and deadlines." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
