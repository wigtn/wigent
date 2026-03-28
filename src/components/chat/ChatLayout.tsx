"use client";

import type { DebateState } from "@/lib/types";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

interface ChatLayoutProps {
  state: DebateState;
}

export default function ChatLayout({ state }: ChatLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        channelName={state.channelName}
        agents={state.agents}
        retiredAgents={state.retiredAgents}
      />
      <ChatArea
        channelName={state.channelName}
        agents={[...state.agents, ...state.retiredAgents]}
        chatItems={state.chatItems}
        currentRound={state.currentRound}
        activeAgentId={state.activeAgentId}
        streamingText={state.streamingText}
      />
    </div>
  );
}
