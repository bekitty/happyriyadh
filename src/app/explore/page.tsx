import type { Metadata } from "next";
import Explorer from "@/components/Explorer";
import { PLACES } from "@/lib/places";
import { CATEGORY_MAP } from "@/lib/categories";
import type { Category, Kind } from "@/data/types";

export const metadata: Metadata = { title: "列表 + 地图" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const kindParam = str(sp.kind);
  const catParam = str(sp.cat);
  const kind: Kind | null = kindParam === "eat" || kindParam === "play" ? kindParam : null;
  const category = catParam && catParam in CATEGORY_MAP ? (catParam as Category) : null;

  return (
    <Explorer
      places={PLACES}
      initialKind={kind ?? (category ? CATEGORY_MAP[category].kind : null)}
      initialCategory={category}
      initialQuery={str(sp.q) ?? ""}
      initialOpenId={str(sp.id) ?? null}
    />
  );
}
