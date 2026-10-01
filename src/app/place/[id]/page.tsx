import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PLACES, getPlace, nearby } from "@/lib/places";
import { CATEGORY_MAP, KIND_LABEL } from "@/lib/categories";
import PlaceDetail from "@/components/PlaceDetail";
import BackButton from "@/components/BackButton";

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

  return (
    <main className="animate-page-in mx-auto max-w-5xl px-4 py-5">
      <nav className="mb-4 flex items-center gap-3 text-sm text-muted">
        <BackButton fallback={`/explore?cat=${place.category}`} />
        <span className="truncate">
          <Link href={`/explore?kind=${place.kind}`} className="hover:text-ink">
            {KIND_LABEL[place.kind]}
          </Link>
          {" / "}
          <Link href={`/explore?cat=${place.category}`} className="hover:text-ink">
            {cat?.label}
          </Link>
        </span>
      </nav>
      <PlaceDetail place={place} nearby={nearby(place)} layout="page" />
    </main>
  );
}
