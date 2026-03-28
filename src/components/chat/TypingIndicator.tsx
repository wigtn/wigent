"use client";

import { motion } from "framer-motion";
import type { Agent } from "@/lib/types";

interface TypingIndicatorProps {
  agent: Agent;
}

export default function TypingIndicator({ agent }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2 px-5 py-1"
    >
      <span className="text-sm" style={{ color: agent.color }}>
        {agent.emoji}
      </span>
      <span className="text-[13px] text-[var(--text-muted)]">
        <span className="font-medium" style={{ color: agent.color }}>
          {agent.name}
        </span>
        {" 입력 중"}
      </span>
      <span className="flex gap-0.5">
        <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
        <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
        <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
      </span>
    </motion.div>
  );
}
