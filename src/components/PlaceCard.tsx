import Link from "next/link";
import type { Place } from "@/data/types";
import { CATEGORY_MAP, PRICE_LABEL } from "@/lib/categories";

export function RatingBadge({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const tone = rating >= 4.5 ? "bg-accent" : rating >= 4.0 ? "bg-palm" : "bg-muted";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md font-semibold text-white ${tone} ${
        size === "lg" ? "px-2.5 py-1 text-lg" : "px-1.5 py-0.5 text-xs"
      }`}
      title="编辑评分"
    >
      ★ {rating.toFixed(1)}
    </span>
  );
}

export function CategoryIcon({ place, className = "" }: { place: Place; className?: string }) {
  const cat = CATEGORY_MAP[place.category];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{ background: `${cat?.color ?? "#888"}1a` }}
      aria-hidden
    >
      <span>{cat?.icon ?? "📍"}</span>
    </div>
  );
}

export function PlaceCard({ place, compact = false }: { place: Place; compact?: boolean }) {
  const cat = CATEGORY_MAP[place.category];
  return (
    <Link
      href={`/place/${place.id}`}
      className="group flex gap-3 rounded-2xl border border-sand-200 bg-white p-3 transition hover:border-sand-300 hover:shadow-md"
    >
      <CategoryIcon place={place} className={compact ? "size-12 text-2xl" : "size-16 text-3xl"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold group-hover:text-accent">{place.name}</h3>
          <RatingBadge rating={place.rating} />
        </div>
        <p className="truncate text-xs text-muted">
          <span style={{ color: cat?.color }}>{cat?.label}</span> · {place.district} ·{" "}
          {PRICE_LABEL[place.price]}
          {place.menu?.length ? " · 📖 中文菜单" : ""}
        </p>
        {!compact && <p className="mt-1 line-clamp-2 text-sm text-ink/80">{place.summary}</p>}
      </div>
    </Link>
  );
}
