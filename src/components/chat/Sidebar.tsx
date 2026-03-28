"use client";

import type { Agent } from "@/lib/types";

interface SidebarProps {
  channelName: string;
  agents: Agent[];
  retiredAgents: Agent[];
}

export default function Sidebar({
  channelName,
  agents,
  retiredAgents,
}: SidebarProps) {
  const onlineAgents = agents.filter((a) => a.status === "online");
  const offlineAgents = [
    ...agents.filter((a) => a.status === "offline"),
    ...retiredAgents,
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] shrink-0 select-none">
      {/* Workspace header */}
      <div className="flex items-center h-12 px-4 border-b border-[var(--border-subtle)]">
        <h1 className="text-[15px] font-bold text-[var(--text-bright)] truncate">
          Wigent
        </h1>
      </div>

      {/* Channel */}
      <div className="px-3 pt-4">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
          Channels
        </p>
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[var(--bg-accent)] text-[var(--text-bright)]">
          <span className="text-sm opacity-70">#</span>
          <span className="text-[14px] truncate">{channelName}</span>
        </div>
      </div>

      {/* Online agents */}
      <div className="px-3 pt-5 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
          Online — {onlineAgents.length}
        </p>
        <ul className="space-y-0.5">
          {onlineAgents.map((agent) => (
            <li key={agent.id}>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--bg-surface)] transition-colors">
                <span className="relative">
                  <span className="text-base">{agent.emoji}</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--agent-online)] border border-[var(--bg-sidebar)]" />
                </span>
                <span className="text-[14px] text-[var(--text-primary)] truncate">
                  {agent.name}
                </span>
                {agent.isFixed && (
                  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface)] px-1 py-0.5 rounded">
                    PM
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Offline / Retired agents */}
        {offlineAgents.length > 0 && (
          <>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mt-4 mb-2 px-1">
              Offline — {offlineAgents.length}
            </p>
            <ul className="space-y-0.5">
              {offlineAgents.map((agent) => (
                <li key={agent.id}>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md opacity-50">
                    <span className="relative">
                      <span className="text-base">{agent.emoji}</span>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--agent-offline)] border border-[var(--bg-sidebar)]" />
                    </span>
                    <span className="text-[14px] text-[var(--text-secondary)] truncate line-through">
                      {agent.name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
