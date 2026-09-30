// MapLibre v6 的 worker 是独立的 ES 模块文件，打包器不会自动产出；复制到 public/ 并用 setWorkerUrl 指向它
import { copyFileSync, mkdirSync } from "node:fs";

const src = "node_modules/maplibre-gl/dist";
const dest = "public/maplibre";
mkdirSync(dest, { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) copyFileSync(`${src}/${f}`, `${dest}/${f}`);
