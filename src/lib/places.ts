import type { Place } from "@/data/types";
import eatAsian from "@/data/places/eat-asian.json";
import eatGrillWestern from "@/data/places/eat-grill-western.json";
import eatLocalCafe from "@/data/places/eat-local-cafe.json";
import playSights from "@/data/places/play-sights.json";
import playFun from "@/data/places/play-fun.json";

export const PLACES: Place[] = [
  ...eatAsian,
  ...eatGrillWestern,
  ...eatLocalCafe,
  ...playSights,
  ...playFun,
] as unknown as Place[];

export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

export function byRating(a: Place, b: Place) {
  return b.rating - a.rating;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearby(place: Place, limit = 6) {
  return PLACES.filter((p) => p.id !== place.id)
    .map((p) => ({ place: p, km: distanceKm(place, p) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

export function googleMapsUrl(p: Place) {
  const q = encodeURIComponent(`${p.nameEn} Riyadh`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function coordsMapsUrl(p: Place) {
  return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
}
