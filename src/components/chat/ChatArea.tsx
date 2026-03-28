"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import type { ChatItem, Agent } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import SystemMessage from "./SystemMessage";
import TypingIndicator from "./TypingIndicator";
import DisabledInput from "./DisabledInput";
import ChannelHeader from "./ChannelHeader";

interface ChatAreaProps {
  channelName: string;
  agents: Agent[];
  chatItems: ChatItem[];
  currentRound: number;
  activeAgentId: string | null;
  streamingText: string;
}

export default function ChatArea({
  channelName,
  agents,
  chatItems,
  currentRound,
  activeAgentId,
  streamingText,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatItems.length, streamingText]);

  const activeAgent = activeAgentId
    ? agents.find((a) => a.id === activeAgentId)
    : null;

  return (
    <section className="flex flex-col flex-1 min-w-0 bg-[var(--bg-chat)]">
      <ChannelHeader
        channelName={channelName}
        agents={agents}
        currentRound={currentRound}
      />

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto py-2"
        role="log"
        aria-label="Chat messages"
      >
        {chatItems.map((item) => {
          if (item.kind === "message") {
            const agent = agents.find((a) => a.id === item.data.agentId);
            const isCurrentStreaming =
              activeAgentId === item.data.agentId &&
              chatItems.indexOf(item) === chatItems.length - 1 &&
              streamingText.length > 0;

            return (
              <ChatMessage
                key={item.data.id}
                message={item.data}
                agent={agent}
                isStreaming={isCurrentStreaming}
                streamingText={isCurrentStreaming ? streamingText : undefined}
              />
            );
          }

          if (item.kind === "system") {
            const agent = item.data.agentId
              ? agents.find((a) => a.id === item.data.agentId)
              : undefined;
            return (
              <SystemMessage
                key={item.data.id}
                message={item.data}
                agent={agent}
              />
            );
          }

          return null;
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {activeAgent && streamingText.length > 0 && (
            <TypingIndicator agent={activeAgent} />
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <DisabledInput channelName={channelName} />
    </section>
  );
}
