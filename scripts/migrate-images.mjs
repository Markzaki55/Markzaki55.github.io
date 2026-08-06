#!/usr/bin/env node
/* =========================================================================
   MIGRATION SCRIPT - extract embedded (base64) images from data.js
   -------------------------------------------------------------------------
   Reads data.js, finds every image stored as a data: URL inside the
   PROJECTS array, writes the bytes to assets/media/ as real files, and
   rewrites each src/poster to point at the file path.

   Filenames follow the same scheme the admin panel uses for new uploads:

     assets/media/<projectId>-cover.<ext>
     assets/media/<projectId>-media-<n>.<ext>
     assets/media/<projectId>-gallery-<n>.<ext>

   Run once (Node 18+):

     node scripts/migrate-images.mjs

   The original files are byte-for-byte identical (no re-encoding).
   ========================================================================= */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "data.js");
const mediaDir = path.join(root, "assets", "media");

function slug(s) {
  return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}

function extFromDataUrl(dataUrl) {
  const mime = (dataUrl.slice(0, dataUrl.indexOf(";")) || "").split("/")[1] || "";
  return mime.split("+")[0] || "png";
}

function b64FromDataUrl(dataUrl) {
  const i = dataUrl.indexOf(",");
  return i > -1 ? dataUrl.slice(i + 1) : "";
}

function parseProjectBlock(src) {
  const startIdx = src.indexOf("const PROJECTS");
  if (startIdx === -1) throw new Error("Could not find `const PROJECTS` in data.js");
  const open = src.indexOf("[", startIdx);
  const close = src.lastIndexOf("]");
  if (open === -1 || close <= open) throw new Error("Could not find the PROJECTS array in data.js");
  return { open, close, projects: JSON.parse(src.slice(open, close + 1)) };
}

const src = fs.readFileSync(dataPath, "utf8");
const { open, close, projects } = parseProjectBlock(src);

let extracted = 0;
let leftover = 0;

function take(holder, key, id, kind, index) {
  const val = holder && holder[key];
  if (typeof val !== "string" || val.indexOf("data:image/") !== 0) return;
  const ext = extFromDataUrl(val);
  const name = `assets/media/${id}-${kind}${kind === "cover" ? "" : "-" + index}.${ext}`;
  const bytes = Buffer.from(b64FromDataUrl(val), "base64");
  fs.writeFileSync(path.join(root, name), bytes);
  holder[key] = name;
  extracted++;
  console.log(`  wrote ${name} (${(bytes.length / 1024).toFixed(0)} KB)`);
}

for (const p of projects) {
  const id = slug(p.id || p.title);
  if (p.cover) take(p.cover, "src", id, "cover", 0);
  (p.media || []).forEach((m, i) => {
    if (!m) return;
    if (typeof m.src === "string" && m.src.indexOf("data:") === 0 && m.src.indexOf("data:image/") !== 0) leftover++;
    take(m, "src", id, "media", i);
    take(m, "poster", id, "media", i);
  });
  (p.gallery || []).forEach((g, i) => {
    if (!g) return;
    take(g, "src", id, "gallery", i);
    take(g, "poster", id, "gallery", i);
  });
}

if (extracted === 0) {
  console.log("No embedded images found in data.js. Nothing to do.");
  process.exit(0);
}

const newDataJs = src.slice(0, open) + JSON.stringify(projects, null, 2) + src.slice(close + 1);
fs.writeFileSync(dataPath, newDataJs);

console.log(`\nExtracted ${extracted} image(s) into assets/media/ (repo-relative path).`);
console.log(`data.js: ${(src.length / 1024 / 1024).toFixed(2)} MB -> ${(newDataJs.length / 1024).toFixed(0)} KB`);
if (leftover) console.warn(`Note: ${leftover} non-image data: URL(s) were left untouched.`);
