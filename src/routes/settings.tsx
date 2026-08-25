import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TONES, type Tone } from "@/lib/ai-types";
import { useSavedItems } from "@/lib/saved";
import { useSettings, type Settings } from "@/lib/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI WorkMate" },
      {
        name: "description",
        content:
          "Set your default email tone, research depth, email length, appearance, and manage work saved in this browser.",
      },
      { property: "og:title", content: "AI WorkMate Settings" },
      {
        property: "og:description",
        content: "Tune defaults for research depth, email tone and length.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update } = useSettings();
  const { items, clearAll } = useSavedItems();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Preferences" />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-base font-semibold">Defaults</h2>

          <div className="space-y-2">
            <Label>Default email tone</Label>
            <Select
              value={settings.defaultTone}
              onValueChange={(v) => update({ defaultTone: v as Tone })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Research depth</Label>
            <Select
              value={settings.researchDepth}
              onValueChange={(v) => update({ researchDepth: v as Settings["researchDepth"] })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deep">Deep</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Email length</Label>
            <Select
              value={settings.emailLength}
              onValueChange={(v) => update({ emailLength: v as Settings["emailLength"] })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-base font-semibold">Appearance & data</h2>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
            <div>
              <div className="text-sm font-medium">Dark mode</div>
              <p className="text-xs text-muted-foreground">Switch the interface to a dark theme.</p>
            </div>
            <Switch
              checked={settings.theme === "dark"}
              onCheckedChange={(checked) => update({ theme: checked ? "dark" : "light" })}
              aria-label="Toggle dark mode"
            />
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="text-sm font-medium">Saved work</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {items.length} item{items.length === 1 ? "" : "s"} stored in this browser only. Nothing
              is sent to an account — there are no accounts.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              disabled={items.length === 0}
              onClick={() => {
                clearAll();
                toast.success("All saved items deleted");
              }}
            >
              <Trash2 className="size-4" /> Delete all saved items
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
