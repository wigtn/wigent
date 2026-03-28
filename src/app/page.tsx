"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDebate } from "@/hooks/useDebate";
import ChatLayout from "@/components/chat/ChatLayout";
import { TopicInput } from "@/components/TopicInput";
import { PresetButtons } from "@/components/PresetButtons";
import { LandingPageView } from "@/components/LandingPageView";

export default function Home() {
  const { state, startDebate, reset } = useDebate();

  const isChat =
    state.status === "debating" ||
    state.status === "creating" ||
    state.status === "retiring" ||
    state.status === "spawning" ||
    state.status === "generating_landing";

  const isLanding = state.status === "landing";
  const isIdle = state.status === "idle";
  const isError = state.status === "error";

  return (
    <main className="h-full">
      <AnimatePresence mode="wait">
        {isIdle && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full px-4"
          >
            <h1 className="text-4xl font-bold text-[#d1d2d3] mb-2">
              Agent Arena
            </h1>
            <p className="text-[#696b6f] mb-8 text-center">
              AI 에이전트들이 토론하고, 아이디어를 웹페이지로 만들어 드립니다
            </p>
            <TopicInput onSubmit={startDebate} isDisabled={false} />
            <PresetButtons onSelect={startDebate} isDisabled={false} />
          </motion.div>
        )}

        {isChat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ChatLayout state={state} />
          </motion.div>
        )}

        {isLanding && state.landingPageHtml && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <LandingPageView html={state.landingPageHtml} onNewDebate={reset} />
          </motion.div>
        )}

        {isError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full px-4 gap-4"
          >
            <p className="text-red-400 text-lg">{state.error}</p>
            <button
              onClick={reset}
              className="rounded-lg bg-[#1264a3] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1574b8] transition-colors"
            >
              새 토론 시작
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
