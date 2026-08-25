export type ResearchResult = {
  title: string;
  summary: string;
  keyFindings: string[];
  importantPoints: string[];
  insights: string[];
  recommendations: string[];
  suggestedQuestions: string[];
};

export type EmailResult = {
  subject: string;
  body: string;
};

export type MeetingResult = {
  title: string;
  summary: string;
  discussionPoints: string[];
  decisions: string[];
  actionItems: Array<{ task: string; owner: string; due: string }>;
  deadlines: Array<{ what: string; when: string }>;
};

export type SavedKind = "research" | "meeting" | "email";

export type SavedItem = {
  id: string;
  kind: SavedKind;
  title: string;
  createdAt: number;
  content: string;
};

export const TONES = [
  "Formal",
  "Friendly",
  "Persuasive",
  "Professional",
  "Apologetic",
] as const;

export type Tone = (typeof TONES)[number];
