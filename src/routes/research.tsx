import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Eraser, Loader2, RotateCcw, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { BulletList, EmptyState, ResultBlock, ResultSkeleton } from "@/components/ResultBlock";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResearchResult } from "@/lib/ai-types";
import { generateResearch } from "@/lib/ai.functions";
import { bullets, copyText } from "@/lib/copy";
import { useSavedItems } from "@/lib/saved";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI WorkMate" },
      {
        name: "description",
        content:
          "Enter any topic or question and get a research summary, key findings, insights, recommendations, and follow-up questions.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content: "Research summaries, key findings and recommendations in seconds.",
      },
    ],
  }),
  component: ResearchPage,
});

function asText(r: ResearchResult) {
  return (
    `${r.title}\n\nSUMMARY\n${r.summary}\n\n` +
    bullets("KEY FINDINGS", r.keyFindings) +
    bullets("IMPORTANT POINTS", r.importantPoints) +
    bullets("INSIGHTS", r.insights) +
    bullets("RECOMMENDATIONS", r.recommendations) +
    bullets("SUGGESTED RESEARCH QUESTIONS", r.suggestedQuestions)
  ).trim();
}

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const run = useServerFn(generateResearch);
  const { save } = useSavedItems();
  const { settings } = useSettings();

  const mutation = useMutation({
    mutationFn: (value: string) =>
      run({ data: { topic: value, depth: settings.researchDepth } }),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Research ready");
    },
    onError: (err: Error) => toast.error(err.message || "Research failed"),
  });

  const submit = () => {
    if (topic.trim().length < 3) {
      toast.error("Enter a topic or question first.");
      return;
    }
    mutation.mutate(topic.trim());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Research Assistant"
        title="Understand any topic, fast"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setTopic("");
              }}
            >
              <RotateCcw className="size-4" /> New research
            </Button>
            <Button onClick={submit} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {result ? "Research again" : "Run research"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Topic or question
            </Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How is edge AI changing retail operations?"
              className="min-h-48 resize-none rounded-xl"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Depth: <span className="font-medium text-foreground">{settings.researchDepth}</span> —
            change it in Settings.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button className="flex-1" onClick={submit} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Researching…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setTopic("")}>
              <Eraser className="size-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {mutation.isPending ? "Generating" : result ? "Result" : "Awaiting input"}
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
                  save("research", result.title || topic, asText(result));
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
                <ResultBlock label="Key findings">
                  <BulletList items={result.keyFindings} />
                </ResultBlock>
                <ResultBlock label="Important points">
                  <BulletList items={result.importantPoints} />
                </ResultBlock>
                <ResultBlock label="Insights">
                  <BulletList items={result.insights} />
                </ResultBlock>
                <ResultBlock label="Recommendations">
                  <BulletList items={result.recommendations} />
                </ResultBlock>
                <ResultBlock label="Suggested research questions">
                  <BulletList items={result.suggestedQuestions} />
                </ResultBlock>
              </div>
            ) : (
              <EmptyState message="Enter a topic on the left and run the research to see summaries, findings, insights and recommendations here." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
