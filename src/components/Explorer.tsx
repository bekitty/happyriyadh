"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, Kind, Place } from "@/data/types";
import { CATEGORIES, KIND_LABEL, PRICE_LABEL } from "@/lib/categories";
import { PlaceCard } from "./PlaceCard";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-sand-100" />,
});

type Sort = "rating" | "price-asc" | "price-desc";

type Props = {
  places: Place[];
  initialKind?: Kind | null;
  initialCategory?: Category | null;
  initialQuery?: string;
};

const QUICK_TAGS = ["家庭友好", "亲子", "需预约", "适合约会", "户外座位", "深夜营业", "免费", "室内", "季节限定"];

export default function Explorer({ places, initialKind, initialCategory, initialQuery }: Props) {
  const [kind, setKind] = useState<Kind | null>(initialKind ?? null);
  const [category, setCategory] = useState<Category | null>(initialCategory ?? null);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [tags, setTags] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [menuOnly, setMenuOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("rating");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const listRef = useRef<HTMLDivElement>(null);

  // 同步到 URL，方便分享和返回
  useEffect(() => {
    const sp = new URLSearchParams();
    if (kind) sp.set("kind", kind);
    if (category) sp.set("cat", category);
    if (query) sp.set("q", query);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `/explore?${qs}` : "/explore");
  }, [kind, category, query]);

  const cats = CATEGORIES.filter((c) => !kind || c.kind === kind);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = places.filter((p) => {
      if (kind && p.kind !== kind) return false;
      if (category && p.category !== category) return false;
      if (p.rating < minRating) return false;
      if (menuOnly && !p.menu?.length) return false;
      if (tags.length && !tags.every((t) => p.tags.includes(t))) return false;
      if (q) {
        const hay = [
          p.name,
          p.nameEn,
          p.nameAr ?? "",
          p.district,
          p.summary,
          p.tags.join(" "),
          ...(p.menu?.flatMap((s) => s.items.map((i) => `${i.name} ${i.original}`)) ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price || b.rating - a.rating;
      if (sort === "price-desc") return b.price - a.price || b.rating - a.rating;
      return b.rating - a.rating;
    });
  }, [places, kind, category, query, tags, minRating, menuOnly, sort]);

  const availableTags = useMemo(() => {
    const set = new Set(places.filter((p) => !kind || p.kind === kind).flatMap((p) => p.tags));
    return QUICK_TAGS.filter((t) => set.has(t));
  }, [places, kind]);

  function selectFromMap(id: string) {
    setSelectedId(id);
    const el = listRef.current?.querySelector(`[data-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm whitespace-nowrap transition ${
      active ? "border-ink bg-ink text-white" : "border-sand-200 bg-white hover:border-sand-300"
    }`;

  return (
    <div className="mx-auto flex max-w-7xl flex-col lg:h-[calc(100dvh-3.5rem)] lg:flex-row">
      {/* 左侧：筛选 + 列表 */}
      <section
        className={`flex min-h-0 flex-col lg:w-[460px] lg:shrink-0 lg:border-r lg:border-sand-200 ${
          mobileView === "map" ? "hidden lg:flex" : ""
        }`}
      >
        <div className="space-y-3 border-b border-sand-200 p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索店名、菜名、区域… 如 卡布萨、Olaya、烤肉"
            className="w-full rounded-xl border border-sand-200 bg-white px-4 py-2.5 outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            {([null, "eat", "play"] as const).map((k) => (
              <button
                key={k ?? "all"}
                className={chip(kind === k)}
                onClick={() => {
                  setKind(k);
                  setCategory(null);
                  setTags([]);
                }}
              >
                {k ? KIND_LABEL[k] : "全部"}
              </button>
            ))}
          </div>
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
            <button className={chip(!category)} onClick={() => setCategory(null)}>
              全部分类
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                className={chip(category === c.id)}
                onClick={() => {
                  setCategory(category === c.id ? null : c.id);
                  if (!kind) setKind(c.kind);
                }}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <div className="scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 text-xs">
            {availableTags.map((t) => (
              <button
                key={t}
                className={`rounded-md border px-2 py-1 whitespace-nowrap ${
                  tags.includes(t) ? "border-accent bg-accent/10 text-accent" : "border-sand-200 bg-white text-muted"
                }`}
                onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}
              >
                {t}
              </button>
            ))}
            {kind !== "play" && (
              <button
                className={`rounded-md border px-2 py-1 whitespace-nowrap ${
                  menuOnly ? "border-accent bg-accent/10 text-accent" : "border-sand-200 bg-white text-muted"
                }`}
                onClick={() => setMenuOnly(!menuOnly)}
              >
                📖 有中文菜单
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <span>{filtered.length} 个地点</span>
            <div className="flex items-center gap-2">
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="rounded-md border border-sand-200 bg-white px-2 py-1"
              >
                <option value={0}>不限评分</option>
                <option value={4}>4.0 分以上</option>
                <option value={4.5}>4.5 分以上</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-md border border-sand-200 bg-white px-2 py-1"
              >
                <option value="rating">评分最高</option>
                <option value="price-asc">价格从低到高</option>
                <option value="price-desc">价格从高到低</option>
              </select>
            </div>
          </div>
        </div>
        <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              data-id={p.id}
              onMouseEnter={() => setSelectedId(p.id)}
              className={`rounded-2xl ${selectedId === p.id ? "ring-2 ring-accent" : ""}`}
            >
              <PlaceCard place={p} />
            </div>
          ))}
          {!filtered.length && (
            <p className="py-16 text-center text-muted">没有符合条件的地点，换个筛选试试。</p>
          )}
          <p className="pt-2 text-center text-xs text-muted">
            价位：{PRICE_LABEL.slice(1).join(" / ")} 分别为人均 &lt;60 / 60–150 / 150–300 / 300+ SAR
          </p>
        </div>
      </section>

      {/* 右侧：地图 */}
      <section
        className={`relative h-[calc(100dvh-3.5rem)] flex-1 lg:h-auto ${mobileView === "list" ? "hidden lg:block" : ""}`}
      >
        <MapView
          places={filtered}
          selectedId={selectedId}
          onSelect={selectFromMap}
          className="absolute inset-0"
        />
      </section>

      {/* 手机端切换 */}
      <button
        onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
        className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg lg:hidden"
      >
        {mobileView === "list" ? "🗺️ 地图" : "📋 列表"}
      </button>
    </div>
  );
}
