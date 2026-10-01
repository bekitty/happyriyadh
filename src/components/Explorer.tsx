"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Category, Kind, Place } from "@/data/types";
import { CATEGORIES, KIND_LABEL, PRICE_LABEL } from "@/lib/categories";
import { nearbyFrom } from "@/lib/geo";
import { PlaceCard } from "./PlaceCard";
import PlaceDetail from "./PlaceDetail";

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
  initialOpenId?: string | null;
};

const QUICK_TAGS = ["家庭友好", "亲子", "需预约", "适合约会", "户外座位", "深夜营业", "免费", "室内", "季节限定"];

/** 当前筛选 + 打开的地点 → URL，返回/分享时能还原 */
function buildUrl(kind: Kind | null, category: Category | null, query: string, openId: string | null) {
  const sp = new URLSearchParams();
  if (kind) sp.set("kind", kind);
  if (category) sp.set("cat", category);
  if (query) sp.set("q", query);
  if (openId) sp.set("id", openId);
  const qs = sp.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

export default function Explorer({ places, initialKind, initialCategory, initialQuery, initialOpenId }: Props) {
  const [kind, setKind] = useState<Kind | null>(initialKind ?? null);
  const [category, setCategory] = useState<Category | null>(initialCategory ?? null);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [tags, setTags] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [menuOnly, setMenuOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("rating");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(
    initialOpenId && places.some((p) => p.id === initialOpenId) ? initialOpenId : null,
  );
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** 面板是不是本页 pushState 打开的（是则关闭时 history.back()） */
  const pushedRef = useRef(false);

  const byId = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);
  const openPlace = openId ? byId.get(openId) ?? null : null;

  // 筛选变化：替换当前历史记录
  useEffect(() => {
    window.history.replaceState(window.history.state, "", buildUrl(kind, category, query, openId));
    // openId 的变化由 open/close 自己处理历史记录
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, category, query]);

  // 浏览器返回/前进：根据 URL 同步面板
  useEffect(() => {
    const onPop = () => {
      const id = new URLSearchParams(location.search).get("id");
      pushedRef.current = false;
      setOpenId(id && byId.has(id) ? id : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [byId]);

  const openDetail = useCallback(
    (id: string) => {
      if (id === openId) return;
      const url = buildUrl(kind, category, query, id);
      if (openId) {
        // 面板内跳到另一个地点：替换，返回键直接回列表
        window.history.replaceState(window.history.state, "", url);
      } else {
        window.history.pushState(window.history.state, "", url);
        pushedRef.current = true;
      }
      setOpenId(id);
      setSelectedId(id);
      panelRef.current?.scrollTo({ top: 0 });
    },
    [openId, kind, category, query],
  );

  const closeDetail = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back(); // popstate 会把 openId 置空
    } else {
      window.history.replaceState(window.history.state, "", buildUrl(kind, category, query, null));
      setOpenId(null);
    }
  }, [kind, category, query]);

  // Esc 关闭面板
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDetail();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, closeDetail]);

  const cats = CATEGORIES.filter(
    (c) => (!kind || c.kind === kind) && places.some((p) => p.category === c.id),
  );

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

  // 从「附近」打开的地点可能不在筛选结果里，地图上也要显示
  const mapPlaces = useMemo(
    () => (openPlace && !filtered.includes(openPlace) ? [...filtered, openPlace] : filtered),
    [filtered, openPlace],
  );

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
    `shrink-0 rounded-full border px-3 py-1 text-sm whitespace-nowrap transition ${
      active ? "border-ink bg-ink text-white" : "border-sand-200 bg-white hover:border-sand-300"
    }`;
  const tagChip = (active: boolean) =>
    `shrink-0 rounded-md border px-2 py-1 whitespace-nowrap ${
      active ? "border-accent bg-accent/10 text-accent" : "border-sand-200 bg-white text-muted"
    }`;
  // 手机端横向滑动，桌面端换行，避免被地图挡住
  const chipRow =
    "scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_85%,transparent)] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:[mask-image:none]";

  return (
    <div className="relative mx-auto flex max-w-7xl flex-col lg:h-[calc(100dvh-3.5rem)] lg:flex-row">
      {/* 左侧：筛选 + 列表 */}
      <section
        className={`flex min-h-0 flex-col lg:w-[460px] lg:shrink-0 lg:border-r lg:border-sand-200 ${
          mobileView === "map" ? "hidden lg:flex" : ""
        }`}
      >
        <div className="space-y-3 border-b border-sand-200 p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜店名、菜名、区域，如 卡布萨"
            className="w-full rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-base outline-none focus:border-accent"
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
          <div className={chipRow}>
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
          <div className={`${chipRow} text-xs`}>
            {availableTags.map((t) => (
              <button
                key={t}
                className={tagChip(tags.includes(t))}
                onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}
              >
                {t}
              </button>
            ))}
            {kind !== "play" && (
              <button className={tagChip(menuOnly)} onClick={() => setMenuOnly(!menuOnly)}>
                📖 有中文菜单
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 text-sm text-muted">
            <span className="whitespace-nowrap">{filtered.length} 个地点</span>
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
        <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 pb-24 lg:pb-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              data-id={p.id}
              onMouseEnter={() => setSelectedId(p.id)}
              className={`rounded-2xl ${selectedId === p.id ? "ring-2 ring-accent" : ""}`}
            >
              <PlaceCard place={p} onOpen={openDetail} />
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

      {/* 详情面板：桌面端盖住左栏（地图保持可见），手机端从底部滑出全屏 */}
      {openPlace && (
        <aside
          key={openPlace.id}
          className="animate-panel-in fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col bg-sand-50 lg:absolute lg:top-0 lg:right-auto lg:z-20 lg:w-[460px] lg:border-r lg:border-sand-200 lg:shadow-xl"
          aria-label={`${openPlace.name} 详情`}
        >
          <div className="flex items-center gap-2 border-b border-sand-200 bg-sand-50/95 px-4 py-2.5 backdrop-blur">
            <button
              onClick={closeDetail}
              className="inline-flex items-center gap-1 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-sm hover:bg-sand-100"
            >
              <span aria-hidden>←</span> 返回列表
            </button>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{openPlace.name}</span>
            <button
              onClick={() => {
                setMobileView("map");
                closeDetail();
                setSelectedId(openPlace.id);
              }}
              className="rounded-full px-2 py-1.5 text-sm text-accent lg:hidden"
            >
              地图
            </button>
            <Link href={`/place/${openPlace.id}`} className="hidden text-sm text-accent hover:underline lg:inline">
              完整页面 ↗
            </Link>
          </div>
          <div ref={panelRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-10">
            <PlaceDetail
              place={openPlace}
              nearby={nearbyFrom(places, openPlace, 4)}
              layout="panel"
              onOpen={openDetail}
            />
          </div>
        </aside>
      )}

      {/* 右侧：地图 */}
      <section
        className={`relative h-[calc(100dvh-3.5rem)] lg:h-auto lg:flex-1 ${mobileView === "list" ? "hidden lg:block" : ""}`}
      >
        <MapView
          places={mapPlaces}
          selectedId={openId ?? selectedId}
          focusId={openId}
          onSelect={selectFromMap}
          onOpen={openDetail}
          className="h-full w-full"
        />
      </section>

      {/* 手机端切换 */}
      {!openPlace && (
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg lg:hidden"
        >
          {mobileView === "list" ? "🗺️ 地图" : "📋 列表"}
        </button>
      )}
    </div>
  );
}
