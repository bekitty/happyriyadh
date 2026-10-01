import type { Place } from "@/data/types";

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type Nearby = { place: Place; km: number };

export function nearbyFrom(places: Place[], place: Place, limit = 6): Nearby[] {
  return places
    .filter((p) => p.id !== place.id)
    .map((p) => ({ place: p, km: distanceKm(place, p) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

export function formatKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function googleMapsUrl(p: Place) {
  const q = encodeURIComponent(`${p.nameEn} Riyadh`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function coordsMapsUrl(p: Place) {
  return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
}
