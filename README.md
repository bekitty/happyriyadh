# 乐在利雅得 · 吃喝玩乐指南

利雅得吃喝玩乐中文指南，个人自用。编辑评分、中文翻译菜单，列表和地图一起看。

- **技术**：Next.js（App Router）+ Tailwind CSS + MapLibre GL JS，底图用 [OpenFreeMap](https://openfreemap.org)（免费、无需 API Key），部署在 Vercel
- **数据**：全部在 `src/data/places/*.json`，一个地点一个对象，字段定义见 `src/data/types.ts`

## 页面

| 路径 | 内容 |
|---|---|
| `/` | 首页：搜索、分类入口、专题、高分榜 |
| `/explore` | 列表 + 地图联动，可按吃喝/玩乐、分类、标签、评分、价格筛选；支持 `?kind=eat`、`?cat=bbq`、`?q=卡布萨` |
| `/place/[id]` | 详情：介绍、必点/必玩、中文翻译菜单、贴士、地图导航、附近推荐 |
| `/top` | 各分类编辑评分前五 |
| `/collections/[slug]` | 专题（首次必去、迪拉伊耶一日、带娃、冬季限定、约会、平价、中餐、有中文菜单） |

## 数据文件

| 文件 | 内容 |
|---|---|
| `eat-asian.json` | 中餐、日料、韩餐、东南亚/印度 |
| `eat-grill-western.json` | 美式烤肉/汉堡、牛排、西餐 |
| `eat-local-cafe.json` | 沙特/中东菜、咖啡甜品 |
| `play-sights.json` | 景点、郊野沙漠、农家乐露营 |
| `play-fun.json` | 游乐城、公园、商场、季节活动 |

新增或修改地点后运行 `npm run validate` 检查（`npm run build` 前会自动运行）。
专题的筛选规则在 `src/lib/collections.ts`，分类和颜色在 `src/lib/categories.ts`。

**评分**：1.0–5.0 编辑主观评分。**价位**：0 免费，1–4 对应人均 <60 / 60–150 / 150–300 / 300+ SAR。
**菜单来源** `menuSource`：`official` 官方菜单、`reported` 外卖平台/点评整理、`typical` 菜系常见菜参考。价格只填有来源的。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## 部署到 Vercel

在 [vercel.com/new](https://vercel.com/new) 导入 GitHub 仓库 `bekitty/happyriyadh`，框架自动识别为 Next.js，不需要任何环境变量，直接 Deploy。之后每次 push 到生产分支会自动重新部署。
