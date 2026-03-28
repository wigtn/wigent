"use client";

import { motion } from "framer-motion";
import type { SystemMessage as SystemMessageType, Agent } from "@/lib/types";

interface SystemMessageProps {
  message: SystemMessageType;
  agent?: Agent;
}

export default function SystemMessage({ message, agent }: SystemMessageProps) {
  if (message.type === "round_divider") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 px-5 py-3 my-2"
        role="separator"
      >
        <div className="flex-1 h-px bg-[var(--divider)]" />
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {message.content}
        </span>
        <div className="flex-1 h-px bg-[var(--divider)]" />
      </motion.div>
    );
  }

  if (message.type === "agent_join" || message.type === "agent_leave") {
    const isJoin = message.type === "agent_join";
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 px-5 py-1.5"
      >
        <span className="text-xs">
          {isJoin ? "➡️" : "⬅️"}
        </span>
        <span className="text-[13px] text-[var(--system-msg)]">
          {agent && (
            <span style={{ color: agent.color }} className="font-medium">
              {agent.emoji} {agent.name}
            </span>
          )}
          {!agent && <span className="font-medium">{message.content}</span>}
          {agent && (isJoin ? "님이 채널에 참여했습니다" : "님이 채널을 나갔습니다")}
        </span>
      </motion.div>
    );
  }

  if (message.type === "debate_complete" || message.type === "generating") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center py-3 my-2"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-surface)] px-4 py-1.5 text-[13px] text-[var(--text-secondary)]">
          {message.type === "generating" && (
            <span className="inline-block w-3 h-3 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--text-bright)] animate-spin" />
          )}
          {message.content}
        </span>
      </motion.div>
    );
  }

  return null;
}
