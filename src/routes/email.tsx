import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Eraser, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ResultSkeleton } from "@/components/ResultBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TONES, type Tone } from "@/lib/ai-types";
import { generateEmail } from "@/lib/ai.functions";
import { copyText } from "@/lib/copy";
import { useSavedItems } from "@/lib/saved";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI WorkMate" },
      {
        name: "description",
        content:
          "Describe the purpose of your email, pick a tone, and get an AI-written subject line and editable professional email.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Professional emails with a matching subject line, in five tones.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hasResult, setHasResult] = useState(false);

  const run = useServerFn(generateEmail);
  const { save } = useSavedItems();
  const { settings } = useSettings();

  useEffect(() => {
    setTone(settings.defaultTone);
  }, [settings.defaultTone]);

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          purpose: purpose.trim(),
          details: details.trim() || undefined,
          recipient: recipient.trim() || undefined,
          tone,
          length: settings.emailLength,
        },
      }),
    onSuccess: (data) => {
      setSubject(data.subject);
      setBody(data.body);
      setHasResult(true);
      toast.success("Email drafted");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't generate the email"),
  });

  const submit = () => {
    if (purpose.trim().length < 3) {
      toast.error("Describe the purpose of the email first.");
      return;
    }
    mutation.mutate();
  };

  const clearAll = () => {
    setPurpose("");
    setDetails("");
    setRecipient("");
    setSubject("");
    setBody("");
    setHasResult(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Email Generator"
        title="Write the right email, first time"
        actions={
          <>
            <Button variant="outline" onClick={clearAll}>
              <Eraser className="size-4" /> Clear
            </Button>
            <Button onClick={submit} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : hasResult ? (
                <RefreshCw className="size-4" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {hasResult ? "Regenerate" : "Generate email"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Purpose
            </Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Follow up on the Q3 timeline proposal and ask for sign-off"
              className="min-h-28 resize-none rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recipient (optional)
            </Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Michael, Head of Operations"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Details to include (optional)
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Dates, numbers, links, context…"
              className="min-h-28 resize-none rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tone
            </span>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  aria-pressed={tone === t}
                  className={
                    tone === t
                      ? "rounded-full border border-primary bg-accent px-3 py-1.5 text-xs font-semibold text-primary"
                      : "rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Writing…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Generate email
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col rounded-2xl border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {mutation.isPending ? "Drafting" : hasResult ? `${tone} draft` : "Awaiting input"}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasResult}
                onClick={() => copyText(`Subject: ${subject}\n\n${body}`)}
              >
                <Copy className="size-4" /> Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasResult}
                onClick={() => {
                  save("email", subject || purpose, `Subject: ${subject}\n\n${body}`);
                  toast.success("Saved to this browser");
                }}
              >
                <Save className="size-4" /> Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasResult || mutation.isPending}
                onClick={submit}
              >
                <RefreshCw className="size-4" /> Regenerate
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6">
            {mutation.isPending ? (
              <ResultSkeleton />
            ) : hasResult ? (
              <div className="animate-reveal space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Subject line
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email (editable)
                  </Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-80 rounded-xl leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              <EmptyState message="Describe the purpose, choose a tone, and your subject line and email draft will appear here — fully editable." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
