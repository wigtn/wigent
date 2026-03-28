"use client";

import { useRef, useEffect } from "react";

interface LandingPageViewProps {
  html: string;
  onNewDebate: () => void;
}

export function LandingPageView({ html, onNewDebate }: LandingPageViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Auto-resize iframe to match content height
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
        // sandbox blocks access — fallback to fixed height
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

      <button
        onClick={onNewDebate}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#1264a3] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#1574b8] hover:scale-105"
        aria-label="새 토론 시작"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
  );
}
