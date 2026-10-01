import type { Place } from "@/data/types";
import { CATEGORY_MAP, PRICE_HINT, PRICE_LABEL } from "@/lib/categories";
import { coordsMapsUrl, formatKm, googleMapsUrl, type Nearby } from "@/lib/geo";
import { CategoryIcon, PlaceCard, RatingBadge } from "./PlaceCard";
import MiniMap from "./MiniMap";
import Menu from "./Menu";

type Props = {
  place: Place;
  nearby: Nearby[];
  /** page：独立详情页（双栏 + 小地图）；panel：探索页侧滑面板（单栏，用主地图） */
  layout: "page" | "panel";
  /** panel 模式下，点击附近地点在面板内打开 */
  onOpen?: (id: string) => void;
};

function Header({ place, compact }: { place: Place; compact: boolean }) {
  const cat = CATEGORY_MAP[place.category];
  return (
    <>
      <header className="flex gap-4">
        <CategoryIcon place={place} className={compact ? "size-16 text-4xl" : "size-20 text-5xl"} />
        <div className="min-w-0">
          <h1 className={`font-bold ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>{place.name}</h1>
          <p className="mt-0.5 text-sm text-muted">
            {place.nameEn}
            {place.nameAr && (
              <span dir="rtl" lang="ar" className="ml-2">
                {place.nameAr}
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <RatingBadge rating={place.rating} size="lg" />
            <span className="rounded-md px-2 py-1" style={{ background: `${cat?.color}1a`, color: cat?.color }}>
              {cat?.icon} {cat?.label}
            </span>
            <span className="text-muted">
              {PRICE_LABEL[place.price]} · {place.district}
            </span>
          </div>
        </div>
      </header>
      <p className={`mt-4 font-medium ${compact ? "" : "text-lg"}`}>{place.summary}</p>
      {place.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {place.tags.map((t) => (
            <span key={t} className="rounded-md bg-sand-100 px-2 py-0.5 text-xs text-muted">
              {t}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function Body({ place }: { place: Place }) {
  return (
    <div className="min-w-0 space-y-6">
      <p className="leading-relaxed text-ink/90">{place.description}</p>

      {place.highlights.length > 0 && (
        <section className="rounded-2xl border border-sand-200 bg-white p-5">
          <h2 className="mb-3 font-semibold">{place.kind === "eat" ? "👍 推荐理由 / 必点" : "👍 必玩必看"}</h2>
          <ul className="space-y-2">
            {place.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="text-accent">•</span>
                <span>{h}</span>
              </li>
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
              <li key={t} className="flex gap-2">
                <span>–</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function NavButtons({ place }: { place: Place }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <a
        href={googleMapsUrl(place)}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg bg-ink py-2.5 text-center font-medium text-white hover:bg-ink/85"
      >
        Google 地图导航
      </a>
      <a
        href={coordsMapsUrl(place)}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-sand-200 bg-white py-2.5 text-center hover:bg-sand-100"
      >
        按坐标打开
      </a>
    </div>
  );
}

function Facts({ place }: { place: Place }) {
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
              href={
                place.instagram.startsWith("http")
                  ? place.instagram
                  : `https://instagram.com/${place.instagram.replace(/^@/, "")}`
              }
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
    <>
      <dl className="space-y-2 rounded-2xl border border-sand-200 bg-white p-4 text-sm">
        {facts
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-16 shrink-0 text-muted">{k}</dt>
              <dd className="min-w-0 break-words">{v}</dd>
            </div>
          ))}
      </dl>
      {place.sources && place.sources.length > 0 && (
        <div className="min-w-0 text-xs text-muted">
          <p className="mb-1">参考来源</p>
          <ul className="space-y-0.5">
            {place.sources.map((s) => (
              <li key={s} className="truncate">
                <a href={s} target="_blank" rel="noreferrer" className="hover:text-accent">
                  {s.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function NearbyList({ nearby, onOpen, cols }: { nearby: Nearby[]; onOpen?: (id: string) => void; cols: string }) {
  if (!nearby.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">📍 附近还有</h2>
      <div className={`grid gap-3 ${cols}`}>
        {nearby.map(({ place: p, km }) => (
          <div key={p.id}>
            <p className="mb-1 text-xs text-muted">直线距离 {formatKm(km)}</p>
            <PlaceCard place={p} compact onOpen={onOpen} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PlaceDetail({ place, nearby, layout, onOpen }: Props) {
  if (layout === "panel") {
    return (
      <div className="space-y-6">
        <div>
          <Header place={place} compact />
        </div>
        <NavButtons place={place} />
        <Body place={place} />
        <Facts place={place} />
        <NearbyList nearby={nearby} onOpen={onOpen} cols="grid-cols-1" />
      </div>
    );
  }

  return (
    <>
      <Header place={place} compact={false} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Body place={place} />
        <aside className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
            <MiniMap place={place} />
            <div className="p-3">
              <NavButtons place={place} />
            </div>
          </div>
          <Facts place={place} />
        </aside>
      </div>
      <div className="mt-10">
        <NearbyList nearby={nearby} cols="sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    </>
  );
}
