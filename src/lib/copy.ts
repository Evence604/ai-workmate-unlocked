import { toast } from "sonner";

export async function copyText(text: string, label = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Couldn't copy — please copy manually.");
  }
}

export function bullets(title: string, items: string[]) {
  if (!items?.length) return "";
  return `${title}\n${items.map((i) => `- ${i}`).join("\n")}\n\n`;
}
