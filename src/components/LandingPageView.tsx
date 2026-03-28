"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface LandingPageViewProps {
  html: string;
  title?: string;
  onNewDebate: () => void;
  onReject?: () => void;
  onViewChat?: () => void;
  onBack?: () => void;
}

export function LandingPageView({
  html,
  title = "Landing Page",
  onNewDebate,
  onReject,
  onViewChat,
  onBack,
}: LandingPageViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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
      setDownloaded(true);
    } catch {
      alert("코드 추출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setExporting(false);
    }
  }, [html, title]);

  const openModal = useCallback(() => {
    setDownloaded(false);
    setShowModal(true);
  }, []);

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

  // Close modal on Escape
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showModal]);

  const slug = title.replace(/\s+/g, "-").toLowerCase();

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

      {/* ── Floating Buttons ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full bg-[#1a1d21] border border-[#383a3e] px-5 py-3 text-sm font-medium text-[#d1d2d3] shadow-lg transition-all hover:bg-[#222529] hover:scale-105"
            aria-label="돌아가기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M2 3h12v8H4l-2 2V3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            토론 다시보기
          </button>
        )}
        {onReject && (
          <button
            onClick={onReject}
            className="flex items-center gap-2 rounded-full bg-[#dc2626] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#ef4444] hover:scale-105"
            aria-label="결과 반려"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            결과 반려
          </button>
        )}
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-full bg-[#2ea043] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#3fb950] hover:scale-105"
          aria-label="코드 추출"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M8 1v10M4 8l4 4 4-4M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Next.js 코드 추출
        </button>
        <button
          onClick={onNewDebate}
          className="flex items-center gap-2 rounded-full bg-[#16a34a] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#22c55e] hover:scale-105"
          aria-label="결과 만족"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          결과 만족
        </button>
      </div>

      {/* ── Export Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-[#35373b] bg-[#1a1d21] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#35373b]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2ea043]/20">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1v10M4 8l4 4 4-4M2 14h12" stroke="#2ea043" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[#d1d2d3]">Next.js 프로젝트 추출</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#696b6f] hover:text-[#d1d2d3] transition-colors"
                aria-label="닫기"
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* What you get */}
              <div>
                <h3 className="text-sm font-medium text-[#ababad] mb-3">포함된 파일</h3>
                <div className="rounded-lg bg-[#111315] border border-[#2a2c30] p-4 font-mono text-sm text-[#8b949e] space-y-1">
                  <p className="text-[#d1d2d3]">{slug}/</p>
                  <p className="pl-4">package.json</p>
                  <p className="pl-4">tsconfig.json</p>
                  <p className="pl-4">next.config.mjs</p>
                  <p className="pl-4">postcss.config.mjs</p>
                  <p className="pl-4 text-[#d1d2d3]">src/app/page.tsx <span className="text-[#2ea043]">← 랜딩페이지</span></p>
                  <p className="pl-4">src/app/layout.tsx</p>
                  <p className="pl-4">src/app/globals.css</p>
                  <p className="pl-4">README.md</p>
                </div>
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-sm font-medium text-[#ababad] mb-3">사용 방법</h3>
                <div className="space-y-3">
                  <Step num={1} text="zip 파일을 다운로드하고 압축 해제" />
                  <Step num={2} text="터미널에서 해당 폴더로 이동" code={`cd ${slug}`} />
                  <Step num={3} text="의존성 설치" code="npm install" />
                  <Step num={4} text="개발 서버 실행" code="npm run dev" />
                  <Step num={5} text="브라우저에서 확인" code="http://localhost:3000" />
                </div>
              </div>

              {/* Note */}
              <p className="text-xs text-[#696b6f] leading-relaxed">
                Next.js 15 + React 19 + Tailwind CSS 4 기반 프로젝트입니다.
                page.tsx를 수정하여 자유롭게 커스터마이징하세요.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-[#35373b] bg-[#161819]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-[#35373b] px-4 py-2.5 text-sm font-medium text-[#d1d2d3] transition-colors hover:bg-[#222529]"
              >
                닫기
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#2ea043] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#3fb950] disabled:opacity-50 disabled:cursor-wait"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    추출 중...
                  </>
                ) : downloaded ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    다시 다운로드
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1v10M4 8l4 4 4-4M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    다운로드 (.zip)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ num, text, code }: { num: number; text: string; code?: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-[#2ea043]/20 text-[#2ea043] text-xs font-bold">
        {num}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#d1d2d3]">{text}</p>
        {code && (
          <code className="mt-1 block rounded-md bg-[#111315] border border-[#2a2c30] px-3 py-1.5 text-xs text-[#8b949e] font-mono">
            {code}
          </code>
        )}
      </div>
    </div>
  );
}
