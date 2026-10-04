// Restores binary assets (images, fonts) from base64 packs in ./assets-packs.
// Packs exist because this repo was first pushed through a text-only API.
// Runs automatically before `dev` / `build`; safe to re-run.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const dir = "assets-packs";
if (!existsSync(dir)) process.exit(0);
// A file lives in exactly one pack. When a later pack (sorted by name) carries the same
// path again, it replaces the earlier version, so updated images can ship as a new pack.
const parts = new Map();
const owner = new Map();
for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const pack = JSON.parse(readFileSync(join(dir, f), "utf8"));
  for (const [key, chunk] of Object.entries(pack)) {
    const [path, idx] = key.split("#");
    if (owner.get(path) !== f) {
      owner.set(path, f);
      parts.set(path, []);
    }
    parts.get(path)[Number(idx)] = chunk;
  }
}
let n = 0;
for (const [path, chunks] of parts) {
  if (existsSync(path)) continue;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.from(chunks.join(""), "base64"));
  n++;
}
if (n) console.log(`restored ${n} asset(s)`);
