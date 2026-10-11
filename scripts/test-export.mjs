import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const uploaded = new Map();
const requested = [];
const sandbox = vm.createContext({
  Blob, TextEncoder, Uint8Array, DataView, console, crypto: webcrypto,
  fetch: async (url) => {
    if (url.startsWith("data:")) return fetch(url);
    requested.push(url);
    return new Response(new Blob(["existing file"]), { status: 200 });
  },
});
vm.runInContext(fs.readFileSync("media-store.js", "utf8"), sandbox);
vm.runInContext(fs.readFileSync("media-export.js", "utf8"), sandbox);
sandbox.PortfolioMedia.getAsset = async (ref) => uploaded.get(ref);
const video = await sandbox.PortfolioMedia.assetFromBlob(new Blob(["video bytes"], { type: "video/mp4" }), "Gameplay Clip.mp4");
const poster = await sandbox.PortfolioMedia.assetFromBlob(new Blob(["poster bytes"], { type: "image/jpeg" }), "Poster.jpg");
uploaded.set(video.ref, video);
uploaded.set(poster.ref, poster);
const original = {
  PROFILE: { name: "Test" }, THEME: {}, PROJECTS: [{
    id: "demo", title: "Demo", cover: { type: "image", src: "assets/media/existing image.png" },
    media: [{ type: "video", src: video.ref, poster: poster.ref, bytes: video.size, _file: { name: video.name } }],
    cardPreview: { enabled: true, video: { type: "video", src: video.ref, poster: poster.ref, bytes: video.size } },
  }],
};
const result = await sandbox.PortfolioExport.bundle(original);
assert.ok(result.blob.size > 0);
assert.equal(result.assets.size, 3, "Shared video/poster references are deduplicated");
assert.equal(requested.length, 1);
assert.doesNotMatch(result.text, /upload:|blob:|data:image|_file/);
assert.equal(original.PROJECTS[0].media[0].src, video.ref, "Export must not mutate the draft");

const bytes = Buffer.from(await result.blob.arrayBuffer());
const end = bytes.length - 22;
assert.equal(bytes.readUInt32LE(end), 0x06054b50);
let central = bytes.readUInt32LE(end + 16);
const entries = new Map();
for (let i = 0; i < bytes.readUInt16LE(end + 10); i++) {
  assert.equal(bytes.readUInt32LE(central), 0x02014b50);
  const length = bytes.readUInt16LE(central + 28);
  const name = bytes.toString("utf8", central + 46, central + 46 + length);
  const local = bytes.readUInt32LE(central + 42);
  assert.equal(bytes.readUInt32LE(local), 0x04034b50);
  const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
  const content = bytes.subarray(start, start + bytes.readUInt32LE(central + 24));
  assert.equal(sandbox.PortfolioExport.crc32(content), bytes.readUInt32LE(central + 16));
  entries.set(name, content);
  central += 46 + length + bytes.readUInt16LE(central + 30) + bytes.readUInt16LE(central + 32);
}
assert.equal(entries.get(video.path).toString(), "video bytes");
assert.equal(entries.get(poster.path).toString(), "poster bytes");
assert.equal(entries.get("data.js").toString(), result.text);
assert.ok(entries.has("PUBLISH.txt"));

uploaded.delete(video.ref);
await assert.rejects(sandbox.PortfolioExport.bundle(original), /missing/);
const legacy = structuredClone(original);
legacy.PROJECTS = [{ id: "legacy", media: [{ type: "image", src: "data:image/png;base64,aGVsbG8=" }] }];
const migrated = await sandbox.PortfolioExport.collect(legacy, false);
assert.equal(migrated.assets.size, 1);
assert.doesNotMatch(migrated.text, /data:image/);
assert.equal(Buffer.from(await [...migrated.assets.values()][0].arrayBuffer()).toString(), "hello");
console.log("Passed: file-based export, video bytes, posters, ZIP offsets/CRC, deduplication, missing assets, and legacy image conversion.");
