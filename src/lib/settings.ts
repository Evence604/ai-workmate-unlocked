import { useCallback, useEffect, useState } from "react";

import type { Tone } from "./ai-types";

export type Settings = {
  defaultTone: Tone;
  researchDepth: "brief" | "standard" | "deep";
  emailLength: "short" | "medium" | "long";
  theme: "light" | "dark";
};

export const DEFAULT_SETTINGS: Settings = {
  defaultTone: "Professional",
  researchDepth: "standard",
  emailLength: "medium",
  theme: "light",
};

const KEY = "workmate.settings.v1";
const EVENT = "workmate:settings-changed";

export function readSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function applyTheme(theme: Settings["theme"]) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const sync = () => {
      const next = readSettings();
      setSettings(next);
      applyTheme(next.theme);
    };
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...readSettings(), ...patch };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    applyTheme(next.theme);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { settings, update };
}
