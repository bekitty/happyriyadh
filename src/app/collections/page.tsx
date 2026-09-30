import type { Metadata } from "next";
import Link from "next/link";
import { COLLECTIONS, collectionPlaces } from "@/lib/collections";

export const metadata: Metadata = { title: "专题" };

export default function CollectionsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">📚 专题</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {COLLECTIONS.map((c) => {
          const list = collectionPlaces(c);
          return (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="rounded-2xl border border-sand-200 bg-white p-5 transition hover:shadow-md"
            >
              <div className="text-3xl">{c.icon}</div>
              <h2 className="mt-2 text-lg font-semibold">{c.title}</h2>
              <p className="mt-1 text-sm text-muted">{c.intro}</p>
              <p className="mt-3 truncate text-xs text-muted">
                {list.length} 个 · {list.slice(0, 4).map((p) => p.name).join("、")}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
