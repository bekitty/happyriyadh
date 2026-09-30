import type { Place } from "@/data/types";
import { PLACES, byRating } from "./places";

export type Collection = {
  slug: string;
  title: string;
  icon: string;
  intro: string;
  filter: (p: Place) => boolean;
  limit?: number;
};

const hasTag = (p: Place, ...tags: string[]) => tags.some((t) => p.tags.includes(t));

export const COLLECTIONS: Collection[] = [
  {
    slug: "first-time",
    title: "第一次来利雅得必去",
    icon: "⭐",
    intro: "刚到利雅得不知道从哪开始？先把这些高分景点和本地菜打卡了。",
    filter: (p) =>
      (p.kind === "play" && ["attraction", "outdoor"].includes(p.category) && p.rating >= 4.3) ||
      (p.category === "saudi" && p.rating >= 4.4),
    limit: 14,
  },
  {
    slug: "diriyah",
    title: "一天玩转德拉伊耶",
    icon: "🏰",
    intro: "沙特王国的发源地：白天逛土坯古城 At-Turaif，傍晚去 Bujairi Terrace 吃饭看夜景。",
    filter: (p) => /diriyah|德拉伊耶|bujairi/i.test(`${p.district} ${p.nameEn} ${p.address ?? ""}`),
  },
  {
    slug: "family",
    title: "周末带娃去哪",
    icon: "👨‍👩‍👧",
    intro: "亲子友好的乐园、公园和餐厅，室内项目适合夏天。",
    filter: (p) => hasTag(p, "亲子", "家庭友好") && p.rating >= 4.0,
    limit: 18,
  },
  {
    slug: "winter",
    title: "凉快季节限定（10–3 月）",
    icon: "🏕️",
    intro: "利雅得夏天 45°C+，郊野、沙漠露营和户外活动都留到冬天。",
    filter: (p) =>
      ["outdoor", "farm", "show"].includes(p.category) || hasTag(p, "季节限定"),
  },
  {
    slug: "date-night",
    title: "约会 / 纪念日晚餐",
    icon: "🕯️",
    intro: "环境好、出品稳定的餐厅，大部分建议提前预约。",
    filter: (p) => p.kind === "eat" && (hasTag(p, "适合约会", "景观位") || (p.price >= 3 && p.rating >= 4.5)),
    limit: 14,
  },
  {
    slug: "cheap-eats",
    title: "平价好吃",
    icon: "💰",
    intro: "人均 60 SAR 以内也能吃得很好。",
    filter: (p) => p.kind === "eat" && p.price <= 1 && p.rating >= 4.0,
  },
  {
    slug: "homesick",
    title: "想家了：中餐合集",
    icon: "🥟",
    intro: "在利雅得找一口家乡味。",
    filter: (p) => p.category === "chinese",
  },
  {
    slug: "menu-translated",
    title: "有中文翻译菜单的餐厅",
    icon: "📖",
    intro: "看不懂阿拉伯文和英文菜单？这些店我们都把菜单翻好了，点菜不慌。",
    filter: (p) => !!p.menu?.length,
  },
];

export function collectionPlaces(c: Collection) {
  const list = PLACES.filter(c.filter).sort(byRating);
  return c.limit ? list.slice(0, c.limit) : list;
}

export function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}
