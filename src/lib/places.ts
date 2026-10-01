import type { Place } from "@/data/types";
import { nearbyFrom } from "./geo";
export { coordsMapsUrl, googleMapsUrl } from "./geo";
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

export function nearby(place: Place, limit = 6) {
  return nearbyFrom(PLACES, place, limit);
}
