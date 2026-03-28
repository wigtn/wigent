"use client";

import { PRESETS } from "@/lib/types";

interface PresetButtonsProps {
  onSelect: (topic: string) => void;
  isDisabled: boolean;
}

export function PresetButtons({ onSelect, isDisabled }: PresetButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 mt-8">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.topic)}
          disabled={isDisabled}
          className="card-shine group flex items-center gap-2.5 rounded-xl border border-[#232429] bg-[#16171b]/60 backdrop-blur-sm px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-all duration-200 hover:border-indigo-500/25 hover:text-[var(--text-primary)] hover:bg-[#1c1d22] hover:shadow-[0_0_15px_rgba(99,102,241,0.06)] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`프리셋: ${preset.label}`}
        >
          <span className="text-base transition-transform duration-200 group-hover:scale-110">{preset.icon}</span>
          <span className="font-medium">{preset.label}</span>
        </button>
      ))}
    </div>
  );
}
