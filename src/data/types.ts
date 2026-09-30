export type Kind = "eat" | "play";

export type EatCategory =
  | "chinese" // 中餐
  | "japanese" // 日料
  | "korean" // 韩餐
  | "asian" // 东南亚 / 印度 / 其他亚洲
  | "bbq" // 美式烤肉 / 汉堡
  | "steak" // 牛排馆
  | "western" // 西餐（意、法、地中海等）
  | "saudi" // 沙特 / 中东本地菜
  | "cafe"; // 咖啡 / 甜品 / 早午餐

export type PlayCategory =
  | "attraction" // 景点 / 历史文化
  | "outdoor" // 郊野 / 沙漠 / 一日游
  | "farm" // 农家乐 / 休闲农场 / 露营
  | "themepark" // 游乐城 / 乐园
  | "park" // 城市公园
  | "mall" // 商场 / 街区
  | "show"; // 季节活动 / 演出

export type Category = EatCategory | PlayCategory;

export type MenuItem = {
  /** 中文菜名 */
  name: string;
  /** 菜单原文（英文或阿拉伯文） */
  original: string;
  /** 价格（SAR），只填有来源的价格 */
  price?: number;
  /** 中文说明：是什么、怎么做、口味 */
  desc?: string;
  tags?: ("招牌" | "推荐" | "辣" | "素" | "分享")[];
};

export type MenuSection = {
  title: string;
  titleEn?: string;
  items: MenuItem[];
};

export type Place = {
  /** kebab-case 英文 slug，全站唯一 */
  id: string;
  /** 中文显示名 */
  name: string;
  nameEn: string;
  nameAr?: string;
  kind: Kind;
  category: Category;
  /** 标签，如 家庭友好 / 需预约 / 景观位 / 深夜营业 / 户外座位 / 亲子 */
  tags: string[];
  /** 编辑评分 1.0-5.0 */
  rating: number;
  /** 价位 1: <60 SAR, 2: 60-150, 3: 150-300, 4: 300+（人均）；免费景点为 0 */
  price: 0 | 1 | 2 | 3 | 4;
  /** 价格说明，如 人均约 120 SAR / 门票 50 SAR */
  priceNote?: string;
  /** 中文区域名，如 奥拉亚 Olaya */
  district: string;
  address?: string;
  lat: number;
  lng: number;
  /** 一句话亮点，≤ 30 字 */
  summary: string;
  /** 2-4 句中文介绍 */
  description: string;
  /** 推荐理由 / 必点 / 必玩 */
  highlights: string[];
  /** 实用贴士 */
  tips?: string[];
  hours?: string;
  website?: string;
  instagram?: string;
  /** 建议游玩时长（玩乐） */
  duration?: string;
  /** 最佳季节 / 开放季（玩乐） */
  season?: string;
  /** 翻译菜单（非中餐） */
  menu?: MenuSection[];
  /** 菜单来源说明：official 官方菜单 / reported 点评或媒体报道 / typical 该类菜系常见菜 */
  menuSource?: "official" | "reported" | "typical";
  /** 参考来源 URL */
  sources?: string[];
};
