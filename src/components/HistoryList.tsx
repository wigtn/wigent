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
    <div className="w-full max-w-xl mx-auto mt-14">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#232429] to-transparent" />
        <span className="text-[11px] font-semibold text-[#4a4b52] uppercase tracking-[0.15em]">
          이전 토론
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#232429] to-transparent" />
      </div>
      <div className="space-y-1">
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelect(entry)}
              className="card-shine group flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#1c1d22] transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/8 border border-indigo-500/10 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {entry.topic}
                </p>
                {entry.result?.idea?.title && (
                  <p className="text-xs text-[#4a4b52] truncate mt-0.5">
                    {entry.result.idea.title}
                  </p>
                )}
              </div>
              <span className="text-[11px] text-[#3a3b42] shrink-0 font-mono">
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
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 transition-all text-[#4a4b52] hover:text-red-400"
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
