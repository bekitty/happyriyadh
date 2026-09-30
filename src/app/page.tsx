import Link from "next/link";
import { PLACES, byRating } from "@/lib/places";
import { CATEGORIES, KIND_LABEL } from "@/lib/categories";
import { COLLECTIONS, collectionPlaces } from "@/lib/collections";
import { PlaceCard } from "@/components/PlaceCard";
import type { Kind } from "@/data/types";

function seasonNote(month: number) {
  if (month >= 10 || month <= 3)
    return { icon: "🌤️", text: "现在是利雅得最舒服的季节（10–3 月）：郊野、沙漠露营、户外夜市和利雅得季都安排上。" };
  if (month >= 6 && month <= 8)
    return { icon: "🥵", text: "盛夏 45°C+：白天去商场、室内乐园和博物馆，户外活动放到日落后。" };
  return { icon: "🌡️", text: "换季时节：早晚去户外，中午躲进室内。" };
}

export const revalidate = 86400;

export default function Home() {
  const month = new Date().getMonth() + 1;
  const season = seasonNote(month);
  const count = (kind: Kind) => PLACES.filter((p) => p.kind === kind).length;
  const topEat = PLACES.filter((p) => p.kind === "eat").sort(byRating).slice(0, 6);
  const topPlay = PLACES.filter((p) => p.kind === "play").sort(byRating).slice(0, 6);
  const menuCount = PLACES.filter((p) => p.menu?.length).length;

  return (
    <main>
      <section className="border-b border-sand-200 bg-gradient-to-b from-sand-100 to-sand-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">利雅得吃喝玩乐</h1>
          <p className="mt-3 max-w-2xl text-muted sm:text-lg">
            {PLACES.length} 个精选地点 · 编辑评分 · {menuCount} 家餐厅有中文翻译菜单 · 列表 + 地图一起看
          </p>
          <form action="/explore" className="mt-6 flex max-w-xl gap-2">
            <input
              name="q"
              placeholder="想吃什么、想去哪？如 火锅、烤肉、迪拉伊耶"
              className="min-w-0 flex-1 rounded-xl border border-sand-200 bg-white px-4 py-3 outline-none focus:border-accent"
            />
            <button className="rounded-xl bg-accent px-5 font-medium text-white hover:bg-accent-dark">搜索</button>
          </form>
          <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-ink/80">
            <span>{season.icon}</span>
            <span>{season.text}</span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-10">
        {(["eat", "play"] as const).map((kind) => (
          <section key={kind}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-bold">
                {kind === "eat" ? "🍽️" : "🎡"} {KIND_LABEL[kind]}
                <span className="ml-2 text-sm font-normal text-muted">{count(kind)} 个</span>
              </h2>
              <Link href={`/explore?kind=${kind}`} className="text-sm text-accent hover:underline">
                全部看地图 →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {CATEGORIES.filter((c) => c.kind === kind).map((c) => {
                const n = PLACES.filter((p) => p.category === c.id).length;
                return (
                  <Link
                    key={c.id}
                    href={`/explore?cat=${c.id}`}
                    className="rounded-2xl border border-sand-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="text-3xl">{c.icon}</div>
                    <div className="mt-2 font-semibold">
                      {c.label} <span className="text-xs font-normal text-muted">{n}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{c.blurb}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-4 text-xl font-bold">📚 专题推荐</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="rounded-2xl bg-ink p-4 text-white transition hover:bg-ink/85"
              >
                <div className="text-2xl">{c.icon}</div>
                <div className="mt-2 font-semibold">{c.title}</div>
                <div className="mt-1 text-xs text-white/60">{collectionPlaces(c).length} 个地点</div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          {[
            { title: "🏆 高分餐厅", list: topEat },
            { title: "🏆 高分玩乐", list: topPlay },
          ].map(({ title, list }) => (
            <section key={title}>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-xl font-bold">{title}</h2>
                <Link href="/top" className="text-sm text-accent hover:underline">完整榜单 →</Link>
              </div>
              <div className="space-y-2">
                {list.map((p) => (
                  <PlaceCard key={p.id} place={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
