"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MLMap, MapLayerMouseEvent } from "maplibre-gl";
import type * as GeoJSON from "geojson";
import type { Place } from "@/data/types";
import { CATEGORY_MAP } from "@/lib/categories";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const RIYADH: [number, number] = [46.675, 24.72];

type Props = {
  places: Place[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** 单点模式：只显示一个地点，不聚合 */
  single?: boolean;
  className?: string;
};

function toGeoJSON(places: Place[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: places.map((p) => ({
      type: "Feature",
      id: p.id,
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        name: p.name,
        rating: p.rating,
        icon: CATEGORY_MAP[p.category]?.icon ?? "📍",
        color: CATEGORY_MAP[p.category]?.color ?? "#555",
        label: CATEGORY_MAP[p.category]?.label ?? "",
      },
    })),
  };
}

/** 把底图标注换成中文优先 */
function localizeLabels(map: MLMap) {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "symbol") continue;
    const field = map.getLayoutProperty(layer.id, "text-field");
    if (!field) continue;
    map.setLayoutProperty(layer.id, "text-field", [
      "coalesce",
      ["get", "name:zh-Hans"],
      ["get", "name:zh"],
      ["get", "name:en"],
      ["get", "name_en"],
      ["get", "name"],
    ]);
  }
}

function fitTo(map: MLMap, places: Place[]) {
  if (!places.length) return;
  if (places.length === 1) {
    map.easeTo({ center: [places[0].lng, places[0].lat], zoom: 14 });
    return;
  }
  const b = new maplibregl.LngLatBounds();
  places.forEach((p) => b.extend([p.lng, p.lat]));
  map.fitBounds(b, { padding: 50, maxZoom: 14, duration: 600 });
}

export default function MapView({ places, selectedId, onSelect, single, className }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const placesRef = useRef(places);
  const onSelectRef = useRef(onSelect);
  placesRef.current = places;
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: STYLE_URL,
      center: single && places[0] ? [places[0].lng, places[0].lat] : RIYADH,
      zoom: single ? 14 : 10,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }),
      "top-right",
    );

    map.on("load", () => {
      localizeLabels(map);
      map.addSource("places", {
        type: "geojson",
        data: toGeoJSON(placesRef.current),
        cluster: !single,
        clusterRadius: 40,
        clusterMaxZoom: 12,
      });
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "places",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#b4541f",
          "circle-opacity": 0.9,
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 30, 26],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#fff",
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "places",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 13,
        },
        paint: { "text-color": "#fff" },
      });
      map.addLayer({
        id: "points",
        type: "circle",
        source: "places",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 11, 7],
          "circle-stroke-width": ["case", ["boolean", ["feature-state", "selected"], false], 4, 2],
          "circle-stroke-color": "#fff",
        },
      });
      map.addLayer({
        id: "point-labels",
        type: "symbol",
        source: "places",
        filter: ["!", ["has", "point_count"]],
        minzoom: 12,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: { "text-color": "#231d16", "text-halo-color": "#fff", "text-halo-width": 1.5 },
      });

      map.on("click", "clusters", async (e: MapLayerMouseEvent) => {
        const f = e.features?.[0];
        if (!f) return;
        const src = map.getSource("places") as GeoJSONSource;
        const zoom = await src.getClusterExpansionZoom(f.properties.cluster_id);
        map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
      });
      map.on("click", "points", (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) onSelectRef.current?.(id);
      });
      for (const layer of ["clusters", "points"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }
      if (!single) fitTo(map, placesRef.current);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 数据变化
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const src = map.getSource("places") as GeoJSONSource | undefined;
      if (!src) return;
      src.setData(toGeoJSON(places));
      if (!single) fitTo(map, places);
    };
    if (map.isStyleLoaded() && map.getSource("places")) update();
    else map.once("idle", update);
  }, [places, single]);

  // 选中高亮 + 弹窗
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (!map.getSource("places")) return;
      map.removeFeatureState({ source: "places" });
      popupRef.current?.remove();
      const p = places.find((x) => x.id === selectedId);
      if (!p) return;
      map.setFeatureState({ source: "places", id: p.id }, { selected: true });
      const cat = CATEGORY_MAP[p.category];
      const html = `<a href="/place/${p.id}" style="display:block;min-width:160px">
          <div style="font-weight:600">${cat?.icon ?? ""} ${escapeHtml(p.name)}</div>
          <div style="font-size:12px;color:#6f6556;margin-top:2px">★ ${p.rating.toFixed(1)} · ${escapeHtml(
            cat?.label ?? "",
          )} · ${escapeHtml(p.district)}</div>
          <div style="font-size:12px;color:#b4541f;margin-top:4px">查看详情 →</div>
        </a>`;
      popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: false })
        .setLngLat([p.lng, p.lat])
        .setHTML(html)
        .addTo(map);
      if (!single && !map.getBounds().contains([p.lng, p.lat])) {
        map.easeTo({ center: [p.lng, p.lat], duration: 500 });
      }
    };
    if (map.isStyleLoaded() && map.getSource("places")) apply();
    else map.once("idle", apply);
  }, [selectedId, places, single]);

  return <div ref={container} className={className} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
