import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PLACES, coordsMapsUrl, getPlace, googleMapsUrl, nearby } from "@/lib/places";
import { CATEGORY_MAP, KIND_LABEL, PRICE_HINT, PRICE_LABEL } from "@/lib/categories";
import { CategoryIcon, PlaceCard, RatingBadge } from "@/components/PlaceCard";
import MiniMap from "@/components/MiniMap";
import Menu from "@/components/Menu";

export function generateStaticParams() {
  return PLACES.map((p) => ({ id: p.id }));
}

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getPlace((await params).id);
  return p ? { title: p.name, description: p.summary } : {};
}

export default async function PlacePage({ params }: Params) {
  const place = getPlace((await params).id);
  if (!place) notFound();
  const cat = CATEGORY_MAP[place.category];
  const near = nearby(place);

  const facts: [string, React.ReactNode][] = [
    ["区域", place.district],
    ["地址", place.address],
    ["营业时间", place.hours],
    ["价格", place.priceNote ?? `${PRICE_LABEL[place.price]}（${PRICE_HINT[place.price]}）`],
    ["建议时长", place.duration],
    ["最佳季节", place.season],
    [
      "链接",
      (place.website || place.instagram) && (
        <span className="flex flex-wrap gap-x-3">
          {place.website && (
            <a href={place.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              官网
            </a>
          )}
          {place.instagram && (
            <a
              href={place.instagram.startsWith("http") ? place.instagram : `https://instagram.com/${place.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              Instagram
            </a>
          )}
        </span>
      ),
    ],
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-ink">首页</Link>
        {" / "}
        <Link href={`/explore?kind=${place.kind}`} className="hover:text-ink">{KIND_LABEL[place.kind]}</Link>
        {" / "}
        <Link href={`/explore?cat=${place.category}`} className="hover:text-ink">{cat?.label}</Link>
      </nav>

      <header className="flex gap-4">
        <CategoryIcon place={place} className="size-20 text-5xl" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">{place.name}</h1>
          <p className="mt-0.5 text-muted">
            {place.nameEn}
            {place.nameAr && <span dir="rtl" lang="ar" className="ml-2">{place.nameAr}</span>}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <RatingBadge rating={place.rating} size="lg" />
            <span className="rounded-md px-2 py-1" style={{ background: `${cat?.color}1a`, color: cat?.color }}>
              {cat?.icon} {cat?.label}
            </span>
            <span className="text-muted">{PRICE_LABEL[place.price]} · {place.district}</span>
          </div>
        </div>
      </header>

      <p className="mt-5 text-lg font-medium">{place.summary}</p>
      {place.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {place.tags.map((t) => (
            <span key={t} className="rounded-md bg-sand-100 px-2 py-0.5 text-xs text-muted">{t}</span>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section>
            <p className="leading-relaxed text-ink/90">{place.description}</p>
          </section>

          {place.highlights.length > 0 && (
            <section className="rounded-2xl border border-sand-200 bg-white p-5">
              <h2 className="mb-3 font-semibold">
                {place.kind === "eat" ? "👍 推荐理由 / 必点" : "👍 必玩必看"}
              </h2>
              <ul className="space-y-2">
                {place.highlights.map((h) => (
                  <li key={h} className="flex gap-2"><span className="text-accent">•</span><span>{h}</span></li>
                ))}
              </ul>
            </section>
          )}

          {place.menu && place.menu.length > 0 && <Menu sections={place.menu} source={place.menuSource} />}

          {place.tips && place.tips.length > 0 && (
            <section className="rounded-2xl bg-sand-100 p-5">
              <h2 className="mb-3 font-semibold">💡 实用贴士</h2>
              <ul className="space-y-2 text-sm">
                {place.tips.map((t) => (
                  <li key={t} className="flex gap-2"><span>–</span><span>{t}</span></li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
            <MiniMap place={place} />
            <div className="grid grid-cols-2 gap-2 p-3 text-sm">
              <a href={googleMapsUrl(place)} target="_blank" rel="noreferrer"
                className="rounded-lg bg-ink py-2 text-center font-medium text-white hover:bg-ink/85">
                Google 地图导航
              </a>
              <a href={coordsMapsUrl(place)} target="_blank" rel="noreferrer"
                className="rounded-lg border border-sand-200 py-2 text-center hover:bg-sand-100">
                按坐标打开
              </a>
            </div>
          </div>
          <dl className="space-y-2 rounded-2xl border border-sand-200 bg-white p-4 text-sm">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-16 shrink-0 text-muted">{k}</dt>
                <dd className="min-w-0 break-words">{v}</dd>
              </div>
            ))}
          </dl>
          {place.sources && place.sources.length > 0 && (
            <div className="text-xs text-muted">
              <p className="mb-1">参考来源</p>
              <ul className="space-y-0.5">
                {place.sources.map((s) => (
                  <li key={s} className="truncate">
                    <a href={s} target="_blank" rel="noreferrer" className="hover:text-accent">{s.replace(/^https?:\/\/(www\.)?/, "")}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">📍 附近还有</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {near.map(({ place: p, km }) => (
            <div key={p.id} className="relative">
              <PlaceCard place={p} compact />
              <span className="absolute right-3 bottom-2 text-xs text-muted">{km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
