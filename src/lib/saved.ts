import { useCallback, useEffect, useState } from "react";

import type { SavedItem, SavedKind } from "./ai-types";

const KEY = "workmate.saved.v1";
const EVENT = "workmate:saved-changed";

function read(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function useSavedItems() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((kind: SavedKind, title: string, content: string) => {
    const item: SavedItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      title: title || "Untitled",
      createdAt: Date.now(),
      content,
    };
    write([item, ...read()].slice(0, 100));
    return item;
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => write([]), []);

  return { items, save, remove, clearAll };
}
