/* Local studio assets. Published pages use ordinary asset paths, not this store. */
(function (root) {
  "use strict";
  const DB_NAME = "mzPortfolioStudio";
  const DB_VERSION = 2;
  const urls = new Map();

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!root.indexedDB) { reject(new Error("Local media storage is unavailable.")); return; }
      const request = root.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const name of ["drafts", "assets"]) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
        }
      };
      request.onerror = () => reject(request.error || new Error("Could not open media storage."));
      request.onblocked = () => reject(new Error("Close older portfolio editor tabs, then try again."));
      request.onsuccess = () => resolve(request.result);
    });
  }

  async function transaction(mode, action) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("assets", mode);
      const request = action(tx.objectStore("assets"));
      let result;
      request.onsuccess = () => { result = request.result; };
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error("Media storage failed.")); };
    });
  }

  const isUpload = (value) => typeof value === "string" && value.startsWith("upload:");
  const slug = (value) => String(value || "media").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "media";

  async function fingerprint(blob) {
    const digest = await root.crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function assetFromBlob(blob, name) {
    const hash = await fingerprint(blob);
    const extensions = { "video/mp4": "mp4", "video/webm": "webm", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };
    const ext = extensions[blob.type] || String(name).split(".").pop().toLowerCase();
    const base = slug(String(name || "media").replace(/\.[^.]+$/, ""));
    return { blob, name, mime: blob.type, size: blob.size, ref: `upload:${hash}`, path: `assets/media/${base}-${hash.slice(0, 12)}.${ext}` };
  }

  async function storeFile(blob, name = blob.name || "media") {
    const asset = await assetFromBlob(blob, name);
    const existing = await getAsset(asset.ref);
    if (!existing) await transaction("readwrite", (store) => store.put(asset, asset.ref));
    return existing || asset;
  }

  async function getAsset(ref) {
    return transaction("readonly", (store) => store.get(ref));
  }

  async function resolve(ref) {
    if (!isUpload(ref)) return ref || "";
    if (urls.has(ref)) return urls.get(ref);
    const asset = await getAsset(ref);
    if (!asset || !asset.blob) throw new Error("An uploaded file is missing from this browser. Upload it again before publishing.");
    // Another concurrent resolver may already have created the URL.
    if (!urls.has(ref)) urls.set(ref, root.URL.createObjectURL(asset.blob));
    return urls.get(ref);
  }

  function releaseUrls() {
    for (const url of urls.values()) root.URL.revokeObjectURL(url);
    urls.clear();
  }

  function refsIn(value, refs = new Set()) {
    if (isUpload(value)) refs.add(value);
    else if (Array.isArray(value)) value.forEach((item) => refsIn(item, refs));
    else if (value && typeof value === "object") Object.values(value).forEach((item) => refsIn(item, refs));
    return refs;
  }

  async function removeUnused(value) {
    const used = refsIn(value);
    const keys = await transaction("readonly", (store) => store.getAllKeys());
    for (const key of keys) {
      if (used.has(key)) continue;
      await transaction("readwrite", (store) => store.delete(key));
      if (urls.has(key)) { root.URL.revokeObjectURL(urls.get(key)); urls.delete(key); }
    }
    return keys.filter((key) => !used.has(key)).length;
  }

  root.addEventListener?.("pagehide", (event) => { if (!event.persisted) releaseUrls(); });
  root.PortfolioMedia = { openDb, isUpload, fingerprint, assetFromBlob, storeFile, getAsset, resolve, refsIn, removeUnused, releaseUrls };
})(globalThis);
