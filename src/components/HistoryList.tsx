"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { HistoryEntry } from "@/lib/types";

interface HistoryListProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function HistoryList({ entries, onSelect, onDelete }: HistoryListProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="flex items-center gap-3 mb-3 px-2">
        <div className="flex-1 h-px bg-[var(--divider)]" />
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          이전 토론
        </span>
        <div className="flex-1 h-px bg-[var(--divider)]" />
      </div>
      <div className="space-y-0.5">
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelect(entry)}
              className="group flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--bg-chat-hover)] transition-colors cursor-pointer"
            >
              <span className="text-base shrink-0">💬</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {entry.topic}
                </p>
                {entry.result?.idea?.title && (
                  <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                    → {entry.result.idea.title}
                  </p>
                )}
              </div>
              <span className="text-xs text-[var(--text-muted)] shrink-0">
                {timeAgo(entry.timestamp)}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entry.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    onDelete(entry.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-[var(--bg-surface)] transition-all text-[var(--text-muted)] hover:text-red-400"
                aria-label="삭제"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 4h9M5 4V2.5h4V4M3.5 4v7.5a1 1 0 001 1h5a1 1 0 001-1V4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
