// 校验 src/data/places/*.json：id 唯一、分类合法、评分/坐标范围、必填字段
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/data/places";
const EAT = ["chinese", "japanese", "korean", "asian", "bbq", "steak", "western", "saudi", "cafe"];
const PLAY = ["attraction", "outdoor", "farm", "themepark", "park", "mall", "show"];
const REQUIRED = ["id", "name", "nameEn", "kind", "category", "tags", "rating", "price", "district", "lat", "lng", "summary", "description", "highlights"];

const errors = [];
const ids = new Set();
let total = 0;

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  let list;
  try {
    list = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  } catch (e) {
    errors.push(`${file}: JSON 解析失败 ${e.message}`);
    continue;
  }
  for (const p of list) {
    total++;
    const at = `${file} › ${p.id ?? "(无 id)"}`;
    for (const k of REQUIRED) if (p[k] === undefined || p[k] === "") errors.push(`${at}: 缺少 ${k}`);
    if (ids.has(p.id)) errors.push(`${at}: id 重复`);
    ids.add(p.id);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id ?? "")) errors.push(`${at}: id 需为 kebab-case`);
    const cats = p.kind === "eat" ? EAT : p.kind === "play" ? PLAY : [];
    if (!cats.includes(p.category)) errors.push(`${at}: kind/category 不匹配 (${p.kind}/${p.category})`);
    if (!(p.rating >= 1 && p.rating <= 5)) errors.push(`${at}: rating 超出 1-5`);
    if (![0, 1, 2, 3, 4].includes(p.price)) errors.push(`${at}: price 需为 0-4`);
    if (!(p.lat > 20 && p.lat < 28 && p.lng > 43 && p.lng < 50)) errors.push(`${at}: 坐标不在利雅得周边 (${p.lat}, ${p.lng})`);
    for (const s of p.menu ?? []) for (const i of s.items ?? []) {
      if (!i.name || !i.original) errors.push(`${at}: 菜单项缺少 name/original`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n✗ ${errors.length} 个问题`);
  process.exit(1);
}
console.log(`✓ ${total} 个地点校验通过`);
