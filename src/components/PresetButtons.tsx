"use client";

import { PRESETS } from "@/lib/types";

interface PresetButtonsProps {
  onSelect: (topic: string) => void;
  isDisabled: boolean;
}

export function PresetButtons({ onSelect, isDisabled }: PresetButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.topic)}
          disabled={isDisabled}
          className="group flex items-center gap-2 rounded-lg border border-[#35373b] bg-[#1a1d21] px-4 py-2.5 text-sm text-[#d1d2d3] transition-all hover:border-[#1264a3] hover:bg-[#222529] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`프리셋: ${preset.label}`}
        >
          <span className="text-lg">{preset.icon}</span>
          <span className="font-medium">{preset.label}</span>
        </button>
      ))}
    </div>
  );
}
