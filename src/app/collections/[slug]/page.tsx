import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COLLECTIONS, collectionPlaces, getCollection } from "@/lib/collections";
import { PlaceCard } from "@/components/PlaceCard";
import CollectionMap from "@/components/CollectionMap";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = getCollection((await params).slug);
  return c ? { title: c.title, description: c.intro } : {};
}

export default async function CollectionPage({ params }: Params) {
  const c = getCollection((await params).slug);
  if (!c) notFound();
  const list = collectionPlaces(c);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/collections" className="text-sm text-muted hover:text-ink">← 全部专题</Link>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{c.icon} {c.title}</h1>
      <p className="mt-2 text-muted">{c.intro}</p>
      {list.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-sand-200">
          <CollectionMap places={list} />
        </div>
      )}
      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {list.map((p) => (
          <li key={p.id}>
            <PlaceCard place={p} />
          </li>
        ))}
      </ol>
      {!list.length && <p className="py-12 text-center text-muted">这个专题还在整理中。</p>}
    </main>
  );
}
