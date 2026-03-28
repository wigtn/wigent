"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import type { HistoryEntry } from "@/lib/types";

const STORAGE_KEY = "agent-arena-history";
const MAX_ENTRIES = 20;

/** localStorage에서 초기 히스토리를 읽는 헬퍼 */
function readStoredEntries(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

// SSR에서는 빈 배열 반환
function getServerSnapshot(): HistoryEntry[] {
  return [];
}

export function useHistory() {
  // useSyncExternalStore로 localStorage 초기 로딩 (SSR-safe, lint 통과)
  const initialEntries = useSyncExternalStore(
    // subscribe — localStorage는 외부에서 변경되지 않으므로 noop
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    readStoredEntries,
    getServerSnapshot,
  );

  const [entries, setEntries] = useState<HistoryEntry[]>(initialEntries);

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
