import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "乐在利雅得 · 吃喝玩乐指南", template: "%s · 乐在利雅得" },
  description: "利雅得吃喝玩乐中文指南：餐厅编辑评分、中文翻译菜单、景点、农家乐、游乐城与地图。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcfaf6",
};

const NAV = [
  { href: "/explore?kind=eat", label: "吃喝" },
  { href: "/explore?kind=play", label: "玩乐" },
  { href: "/explore", label: "地图" },
  { href: "/top", label: "高分榜" },
  { href: "/collections", label: "专题" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh">
        <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
            <Link href="/" className="flex items-center gap-2 font-bold whitespace-nowrap">
              <span className="text-xl">🌴</span>
              <span>乐在利雅得</span>
            </Link>
            <nav className="scrollbar-none -mr-4 flex flex-1 items-center gap-1 overflow-x-auto pr-4 text-sm sm:justify-end">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-full px-3 py-1.5 whitespace-nowrap text-muted hover:bg-sand-100 hover:text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-16 border-t border-sand-200 py-8 text-center text-xs text-muted">
          <p>评分为编辑主观评分；营业时间、价格与活动档期请以商家官方信息为准。</p>
          <p className="mt-1">地图数据 © OpenStreetMap 贡献者 · 底图 OpenFreeMap</p>
        </footer>
      </body>
    </html>
  );
}
