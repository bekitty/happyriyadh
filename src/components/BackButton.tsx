"use client";

import { useRouter } from "next/navigation";
import { canGoBack } from "./NavTracker";

/** 站内跳转过来就回到上一页（保留列表/地图状态），直接打开链接则去 fallback */
export default function BackButton({ fallback, label = "返回" }: { fallback: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (canGoBack()) router.back();
        else router.push(fallback);
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-ink hover:bg-sand-100"
    >
      <span aria-hidden>←</span> {label}
    </button>
  );
}
