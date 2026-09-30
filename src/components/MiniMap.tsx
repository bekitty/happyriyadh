"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/data/types";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse bg-sand-100" />,
});

export default function MiniMap({ place }: { place: Place }) {
  return <MapView places={[place]} selectedId={place.id} single className="h-56 w-full" />;
}
