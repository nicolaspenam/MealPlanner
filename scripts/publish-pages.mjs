import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";

const dist = "dist";
if (!existsSync(dist)) {
  throw new Error("dist/ is missing. Run the Vite build first.");
}

mkdirSync("assets", { recursive: true });
cpSync(path.join(dist, "assets"), "assets", { recursive: true });

const rootFiles = [
  "404.html",
  "favicon.svg",
  "apple-touch-icon.png",
  "pwa-192.png",
  "pwa-512.png",
  "manifest.webmanifest",
  "sw.js",
  ".nojekyll",
];

for (const name of rootFiles) {
  const from = path.join(dist, name);
  if (existsSync(from)) {
    copyFileSync(from, name);
  }
}

for (const name of readdirSync(".")) {
  if (name.startsWith("workbox-") && name.endsWith(".js")) {
    unlinkSync(name);
  }
}

for (const name of readdirSync(dist)) {
  if (name.startsWith("workbox-") && name.endsWith(".js")) {
    copyFileSync(path.join(dist, name), name);
  }
}
