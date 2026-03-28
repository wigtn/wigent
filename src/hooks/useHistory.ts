"use client";

import { useState, useCallback, useEffect } from "react";
import type { HistoryEntry } from "@/lib/types";

const STORAGE_KEY = "agent-arena-history";
const MAX_ENTRIES = 20;

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch {
      // corrupted data — reset
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const save = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: `h-${Date.now()}`,
        timestamp: Date.now(),
      };
      setEntries((prev) => {
        const next = [newEntry, ...prev].slice(0, MAX_ENTRIES);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // localStorage full — drop oldest
          const trimmed = next.slice(0, 5);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        }
        return next;
      });
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { entries, save, remove, clear };
}
