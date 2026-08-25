import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { EmailResult, MeetingResult, ResearchResult } from "./ai-types";

const ResearchInput = z.object({
  topic: z.string().min(3).max(4000),
  depth: z.enum(["brief", "standard", "deep"]).default("standard"),
});

const EmailInput = z.object({
  purpose: z.string().min(3).max(4000),
  details: z.string().max(6000).optional(),
  recipient: z.string().max(200).optional(),
  tone: z.enum(["Formal", "Friendly", "Persuasive", "Professional", "Apologetic"]),
  length: z.enum(["short", "medium", "long"]).default("medium"),
});

const MeetingInput = z.object({
  notes: z.string().min(20).max(20000),
  title: z.string().max(200).optional(),
});

export const generateResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }): Promise<ResearchResult> => {
    const { generateJson } = await import("./ai.server");
    const system = `You are a rigorous research assistant. Respond ONLY with JSON matching:
{"title":string,"summary":string,"keyFindings":string[],"importantPoints":string[],"insights":string[],"recommendations":string[],"suggestedQuestions":string[]}
Write clear, factual, non-repetitive prose. Depth: ${data.depth}. ${
      data.depth === "brief"
        ? "Keep the summary to 2-3 sentences and 3 items per list."
        : data.depth === "deep"
          ? "Give a thorough 2-paragraph summary and 5-7 items per list."
          : "Give a solid one-paragraph summary and 4-5 items per list."
    }`;
    return generateJson<ResearchResult>(system, `Topic or question: ${data.topic}`);
  });

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }): Promise<EmailResult> => {
    const { generateJson } = await import("./ai.server");
    const system = `You are an expert business writer. Respond ONLY with JSON matching:
{"subject":string,"body":string}
The body is the full email including greeting and sign-off, plain text with blank lines between paragraphs. Do not include the subject inside the body. Tone: ${data.tone}. Length: ${data.length}.`;
    const user = [
      `Purpose: ${data.purpose}`,
      data.recipient ? `Recipient: ${data.recipient}` : "",
      data.details ? `Details to include: ${data.details}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    return generateJson<EmailResult>(system, user);
  });

export const generateMeetingSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }): Promise<MeetingResult> => {
    const { generateJson } = await import("./ai.server");
    const system = `You summarize meeting notes. Respond ONLY with JSON matching:
{"title":string,"summary":string,"discussionPoints":string[],"decisions":string[],"actionItems":[{"task":string,"owner":string,"due":string}],"deadlines":[{"what":string,"when":string}]}
Use "" for owner or due when the notes don't mention one. Never invent names or dates.`;
    const user = [data.title ? `Meeting: ${data.title}` : "", `Notes:\n${data.notes}`]
      .filter(Boolean)
      .join("\n");
    return generateJson<MeetingResult>(system, user);
  });
