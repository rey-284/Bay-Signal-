import { readdir, mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { extname } from "node:path";

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const assets = Object.fromEntries(await Promise.all(
  (await readdir("dist", { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && types[extname(entry.name)])
    .map(async (entry) => {
      const path = entry.parentPath + "/" + entry.name;
      return ["/" + path.slice("dist/".length), [
        types[extname(entry.name)] + "; charset=utf-8", await readFile(path, "utf8"),
      ]];
    }),
));
await mkdir("dist/server", { recursive: true });
await writeFile("dist/server/assets.js", "export default " + JSON.stringify(assets));
await copyFile("hosting/worker.mjs", "dist/server/index.js");
await copyFile("hosting/weather.mjs", "dist/server/weather.mjs");
