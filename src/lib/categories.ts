import type { Category, Kind } from "@/data/types";

export type CategoryInfo = {
  id: Category;
  kind: Kind;
  label: string;
  icon: string;
  color: string;
  blurb: string;
};

export const CATEGORIES: CategoryInfo[] = [
  { id: "chinese", kind: "eat", label: "中餐", icon: "🥢", color: "#dc2626", blurb: "川湘粤、火锅面馆，想家时的去处" },
  { id: "japanese", kind: "eat", label: "日料", icon: "🍣", color: "#e11d48", blurb: "寿司、居酒屋、拉面" },
  { id: "korean", kind: "eat", label: "韩餐", icon: "🥘", color: "#db2777", blurb: "韩式烤肉、炸鸡、石锅拌饭" },
  { id: "asian", kind: "eat", label: "东南亚·印度", icon: "🍛", color: "#ea580c", blurb: "泰餐、越南粉、印度咖喱" },
  { id: "bbq", kind: "eat", label: "美式烤肉·汉堡", icon: "🍖", color: "#b45309", blurb: "低温慢烟熏、牛胸肉、汉堡" },
  { id: "steak", kind: "eat", label: "牛排馆", icon: "🥩", color: "#991b1b", blurb: "干式熟成、和牛、战斧" },
  { id: "western", kind: "eat", label: "西餐", icon: "🍝", color: "#7c3aed", blurb: "意大利、法餐、地中海" },
  { id: "saudi", kind: "eat", label: "沙特·中东", icon: "🫓", color: "#15803d", blurb: "卡布萨、曼迪、黎巴嫩菜" },
  { id: "cafe", kind: "eat", label: "咖啡·甜品", icon: "☕", color: "#a16207", blurb: "精品咖啡、早午餐、椰枣与阿拉伯咖啡" },
  { id: "attraction", kind: "play", label: "景点", icon: "🏛️", color: "#0369a1", blurb: "古城、博物馆、地标" },
  { id: "outdoor", kind: "play", label: "郊野·沙漠", icon: "🏜️", color: "#c2410c", blurb: "世界边缘、红沙丘、一日游" },
  { id: "farm", kind: "play", label: "农家乐·露营", icon: "🐪", color: "#65a30d", blurb: "沙漠营地、农场、骑马骑骆驼" },
  { id: "themepark", kind: "play", label: "游乐城", icon: "🎢", color: "#9333ea", blurb: "主题乐园、室内游乐、卡丁车" },
  { id: "park", kind: "play", label: "城市公园", icon: "🌳", color: "#16a34a", blurb: "散步、野餐、遛娃" },
  { id: "mall", kind: "play", label: "商场·街区", icon: "🛍️", color: "#0891b2", blurb: "购物、影院、夜里逛街" },
  { id: "show", kind: "play", label: "季节活动", icon: "🎆", color: "#be185d", blurb: "利雅得季、演出、赛事" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  Category,
  CategoryInfo
>;

export const KIND_LABEL: Record<Kind, string> = { eat: "吃喝", play: "玩乐" };

export const PRICE_LABEL = ["免费", "¥", "¥¥", "¥¥¥", "¥¥¥¥"] as const;
export const PRICE_HINT = [
  "免费",
  "人均 60 SAR 以下",
  "人均 60–150 SAR",
  "人均 150–300 SAR",
  "人均 300 SAR 以上",
] as const;
