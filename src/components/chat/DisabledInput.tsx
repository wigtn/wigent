"use client";

interface DisabledInputProps {
  channelName: string;
}

export default function DisabledInput({ channelName }: DisabledInputProps) {
  return (
    <div className="px-5 py-3 border-t border-[var(--border-subtle)]">
      <div className="flex items-center rounded-lg bg-[var(--bg-input)] border border-[var(--border-default)] px-4 py-2.5">
        <span className="text-[15px] text-[var(--text-muted)] select-none">
          {channelName} 에서 에이전트들이 토론 중입니다...
        </span>
      </div>
    </div>
  );
}
