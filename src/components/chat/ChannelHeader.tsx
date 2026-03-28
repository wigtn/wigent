"use client";

import type { Agent } from "@/lib/types";

interface ChannelHeaderProps {
  channelName: string;
  agents: Agent[];
  currentRound: number;
  totalRounds?: number;
}

export default function ChannelHeader({
  channelName,
  agents,
  currentRound,
}: ChannelHeaderProps) {
  const onlineAgents = agents.filter((a) => a.status === "online");

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-[var(--border-default)] bg-[var(--bg-chat)] shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-bold text-[var(--text-bright)]">
          # {channelName}
        </span>
        {currentRound > 0 && (
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full">
            Round {currentRound}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--agent-online)]" />
          <span className="text-xs text-[var(--text-secondary)]">
            {onlineAgents.length}명 참여 중
          </span>
        </div>
        <div className="flex -space-x-1.5">
          {onlineAgents.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs border border-[var(--bg-chat)]"
              style={{ backgroundColor: a.color + "33" }}
              title={a.name}
            >
              {a.emoji}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
