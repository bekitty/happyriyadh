import type { Metadata } from "next";
import Link from "next/link";
import { PLACES, byRating } from "@/lib/places";
import { CATEGORIES, KIND_LABEL, PRICE_LABEL } from "@/lib/categories";
import { RatingBadge } from "@/components/PlaceCard";

export const metadata: Metadata = { title: "高分榜" };

export default function TopPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">🏆 高分榜</h1>
      <p className="mt-1 text-sm text-muted">每个分类编辑评分前五名。</p>
      {(["eat", "play"] as const).map((kind) => (
        <section key={kind} className="mt-8">
          <h2 className="mb-4 text-xl font-bold">{KIND_LABEL[kind]}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.filter((c) => c.kind === kind).map((c) => {
              const list = PLACES.filter((p) => p.category === c.id).sort(byRating).slice(0, 5);
              if (!list.length) return null;
              return (
                <div key={c.id} className="rounded-2xl border border-sand-200 bg-white p-4">
                  <Link href={`/explore?cat=${c.id}`} className="mb-2 flex items-center justify-between font-semibold hover:text-accent">
                    <span>{c.icon} {c.label}</span>
                    <span className="text-xs font-normal text-muted">地图 →</span>
                  </Link>
                  <ol className="space-y-1.5">
                    {list.map((p, i) => (
                      <li key={p.id}>
                        <Link href={`/place/${p.id}`} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-sand-50">
                          <span className={`w-5 text-center text-sm font-bold ${i < 3 ? "text-accent" : "text-muted"}`}>{i + 1}</span>
                          <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                          <span className="text-xs text-muted">{PRICE_LABEL[p.price]}</span>
                          <RatingBadge rating={p.rating} />
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
