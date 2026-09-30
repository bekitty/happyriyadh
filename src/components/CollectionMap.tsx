"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Place } from "@/data/types";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse bg-sand-100" />,
});

export default function CollectionMap({ places }: { places: Place[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  return <MapView places={places} selectedId={selected} onSelect={setSelected} className="h-80 w-full" />;
}
