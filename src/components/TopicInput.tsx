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
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-xl border border-[#35373b] bg-[#222529] transition-colors focus-within:border-[#1264a3]">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="어떤 주제로 AI 에이전트들이 토론할까요? (5자 이상)"
          rows={3}
          className="w-full resize-none rounded-xl bg-transparent px-4 pt-4 pb-12 text-[#d1d2d3] placeholder-[#696b6f] outline-none disabled:opacity-50"
          aria-label="토론 주제 입력"
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          {value.trim().length > 0 && (
            <span className="text-xs text-[#696b6f]">
              {value.trim().length}/200
            </span>
          )}
          <button
            onClick={handleSubmit}
            disabled={isDisabled || !isValid}
            className="rounded-lg bg-[#1264a3] px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-[#1574b8] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="토론 시작"
          >
            시작
          </button>
        </div>
      </div>
    </div>
  );
}
