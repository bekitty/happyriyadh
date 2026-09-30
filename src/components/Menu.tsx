import type { MenuSection, Place } from "@/data/types";

const SOURCE_NOTE: Record<NonNullable<Place["menuSource"]>, string> = {
  official: "根据餐厅官方菜单翻译",
  reported: "根据外卖平台 / 点评中的菜单整理翻译",
  typical: "该菜系常见菜品参考，店内实际菜单可能不同",
};

const TAG_STYLE: Record<string, string> = {
  招牌: "bg-accent text-white",
  推荐: "bg-palm text-white",
  辣: "bg-red-100 text-red-700",
  素: "bg-green-100 text-green-700",
  分享: "bg-sand-200 text-ink",
};

export default function Menu({ sections, source }: { sections: MenuSection[]; source?: Place["menuSource"] }) {
  const count = sections.reduce((n, s) => n + s.items.length, 0);
  return (
    <section className="rounded-2xl border border-sand-200 bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-sand-200 px-5 py-4">
        <h2 className="font-semibold">📖 中文翻译菜单 <span className="text-sm font-normal text-muted">{count} 道</span></h2>
        {source && <span className="text-xs text-muted">{SOURCE_NOTE[source]}</span>}
      </div>
      {sections.map((s) => (
        <details key={s.title} open className="group border-b border-sand-100 last:border-0">
          <summary className="flex cursor-pointer list-none items-center justify-between bg-sand-50 px-5 py-2 text-sm font-medium">
            <span>
              {s.title}
              {s.titleEn && <span className="ml-2 text-muted">{s.titleEn}</span>}
            </span>
            <span className="text-muted transition group-open:rotate-180">⌄</span>
          </summary>
          <ul className="divide-y divide-sand-100">
            {s.items.map((i) => (
              <li key={i.original + i.name} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {i.name}
                      {i.tags?.map((t) => (
                        <span key={t} className={`ml-1.5 rounded px-1.5 py-0.5 align-middle text-[10px] ${TAG_STYLE[t] ?? "bg-sand-100"}`}>
                          {t}
                        </span>
                      ))}
                    </p>
                    <p className="text-sm text-muted" dir="auto">{i.original}</p>
                  </div>
                  {i.price != null && <span className="shrink-0 text-sm font-medium tabular-nums">{i.price} SAR</span>}
                </div>
                {i.desc && <p className="mt-1 text-sm text-ink/75">{i.desc}</p>}
              </li>
            ))}
          </ul>
        </details>
      ))}
      <p className="px-5 py-3 text-xs text-muted">价格仅供参考，以店内为准。点菜时把「原文」给服务员看即可。</p>
    </section>
  );
}
