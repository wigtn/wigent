"use client";

import { useState, useCallback } from "react";

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isDisabled: boolean;
}

export function TopicInput({ onSubmit, isDisabled }: TopicInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed.length < 5 || trimmed.length > 200) return;
    onSubmit(trimmed);
    setValue("");
  }, [value, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isValid = value.trim().length >= 5 && value.trim().length <= 200;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="input-border-glow rounded-2xl border border-[#232429] transition-all focus-within:border-transparent">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="어떤 주제로 AI 에이전트들이 토론할까요?"
          rows={3}
          className="relative z-10 w-full resize-none rounded-2xl bg-[#16171b] px-5 pt-4 pb-14 text-[var(--text-primary)] placeholder-[#4a4b52] outline-none disabled:opacity-50 text-[15px] leading-relaxed"
          aria-label="토론 주제 입력"
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-3 z-20">
          {value.trim().length > 0 && (
            <span className="text-xs text-[#4a4b52] tabular-nums">
              {value.trim().length}/200
            </span>
          )}
          <button
            onClick={handleSubmit}
            disabled={isDisabled || !isValid}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
            aria-label="토론 시작"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
