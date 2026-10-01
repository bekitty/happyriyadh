"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** 记录本标签页内的站内跳转次数，供返回按钮判断能否 history.back() */
export default function NavTracker() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const n = Number(sessionStorage.getItem("nav-count") ?? 0);
      sessionStorage.setItem("nav-count", String(n + 1));
    } catch {}
  }, [pathname]);
  return null;
}

export function canGoBack() {
  try {
    return Number(sessionStorage.getItem("nav-count") ?? 0) > 1 && history.length > 1;
  } catch {
    return false;
  }
}
