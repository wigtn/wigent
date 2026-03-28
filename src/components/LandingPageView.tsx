"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface LandingPageViewProps {
  html: string;
  title?: string;
  onNewDebate: () => void;
  onViewChat?: () => void;
  onBack?: () => void;
}

export function LandingPageView({
  html,
  title = "Landing Page",
  onNewDebate,
  onViewChat,
  onBack,
}: LandingPageViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, title }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("코드 추출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setExporting(false);
    }
  }, [html, title]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc) {
          const height = doc.documentElement.scrollHeight;
          iframe.style.height = `${Math.max(height, 600)}px`;
        }
      } catch {
        iframe.style.height = "100vh";
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [html]);

  return (
    <div className="relative w-full min-h-screen">
      <iframe
        ref={iframeRef}
        srcDoc={html}
        sandbox="allow-scripts"
        title="생성된 랜딩페이지"
        className="w-full border-0"
        style={{ height: "100vh" }}
      />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full bg-[#1a1d21] border border-[#383a3e] px-5 py-3 text-sm font-medium text-[#d1d2d3] shadow-lg transition-all hover:bg-[#222529] hover:scale-105"
            aria-label="돌아가기"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            돌아가기
          </button>
        )}
        {onViewChat && (
          <button
            onClick={onViewChat}
            className="flex items-center gap-2 rounded-full bg-[#2c2d30] border border-[#383a3e] px-5 py-3 text-sm font-medium text-[#d1d2d3] shadow-lg transition-all hover:bg-[#35373b] hover:scale-105"
            aria-label="토론 다시보기"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M2 3h12v8H4l-2 2V3z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            토론 다시보기
          </button>
        )}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-full bg-[#2ea043] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#3fb950] hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
          aria-label="코드 추출"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M8 1v10M4 8l4 4 4-4M2 14h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {exporting ? "추출 중..." : "Next.js 코드 추출"}
        </button>
        <button
          onClick={onNewDebate}
          className="flex items-center gap-2 rounded-full bg-[#1264a3] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#1574b8] hover:scale-105"
          aria-label="새 토론 시작"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M8 1v14M1 8h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          새 토론 시작
        </button>
      </div>
    </div>
  );
}
