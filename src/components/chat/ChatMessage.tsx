"use client";

import { motion } from "framer-motion";
import type { AgentMessage, Agent } from "@/lib/types";

interface ChatMessageProps {
  message: AgentMessage;
  agent: Agent | undefined;
  isStreaming?: boolean;
  streamingText?: string;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

export default function ChatMessage({
  message,
  agent,
  isStreaming,
  streamingText,
}: ChatMessageProps) {
  const displayText = isStreaming ? streamingText ?? "" : message.content;
  const agentName = agent?.name ?? "Unknown";
  const agentEmoji = agent?.emoji ?? "?";
  const agentColor = agent?.color ?? "#888";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group flex gap-3 px-5 py-3 hover:bg-[var(--bg-chat-hover)] transition-colors"
    >
      {/* Avatar */}
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: agentColor + "22" }}
        aria-label={`${agentName} avatar`}
      >
        {agentEmoji}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[15px] font-bold"
            style={{ color: agentColor }}
          >
            {agentName}
          </span>
          {agent?.role && (
            <span className="text-xs text-[var(--text-muted)]">
              {agent.role}
            </span>
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className="mt-0.5 text-[15px] leading-[1.46] text-[var(--text-bright)] whitespace-pre-wrap break-words">
          {displayText}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-[var(--text-primary)] ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
