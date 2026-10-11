/* File-based publishing: a small data.js plus separate images, posters and videos. */
(function (root) {
  "use strict";
  const encoder = new TextEncoder();

  function dataJs(state) {
    return "/* Portfolio data — exported by Portfolio Studio. */\n\n" +
      ["PROFILE", "THEME", "PROJECTS"].map((key) => `const ${key} = ${JSON.stringify(state[key], null, 2)};\n`).join("\n");
  }

  async function collect(state, includeExisting = true) {
    const assets = new Map();
    const sources = new Map();
    async function source(value) {
      if (sources.has(value)) return sources.get(value);
      let asset;
      if (root.PortfolioMedia.isUpload(value)) {
        asset = await root.PortfolioMedia.getAsset(value);
        if (!asset) throw new Error("An uploaded asset is missing. Re-upload it before exporting.");
      } else if (/^data:(?:image|video)\//.test(value)) {
        const response = await fetch(value);
        asset = await root.PortfolioMedia.assetFromBlob(await response.blob(), "legacy-media");
      } else if (/^assets\/media\/[^?#]+(?:\?[^#]*)?$/.test(value) && !value.split("/").includes("..")) {
        if (!includeExisting) return value;
        const response = await fetch(value);
        if (!response.ok) throw new Error(`Could not export ${value} (${response.status}).`);
        asset = { path: value.split("?")[0], blob: await response.blob() };
      } else if (value.startsWith("blob:")) {
        throw new Error("A temporary preview URL cannot be published. Upload the original file again.");
      } else return value;
      assets.set(asset.path, asset.blob);
      sources.set(value, asset.path);
      return asset.path;
    }
    async function walk(value) {
      if (Array.isArray(value)) {
        const result = [];
        for (const item of value) result.push(await walk(item));
        return result;
      }
      if (!value || typeof value !== "object") return value;
      const result = {};
      // Sequential traversal avoids re-reading large files referenced more than once.
      for (const [key, item] of Object.entries(value)) {
        if (key.startsWith("_")) continue;
        result[key] = (key === "src" || key === "poster") && typeof item === "string"
          ? await source(item) : await walk(item);
      }
      return result;
    }
    const output = { PROFILE: state.PROFILE, THEME: state.THEME, PROJECTS: [] };
    for (const project of state.PROJECTS) output.PROJECTS.push(await walk(project));
    const text = dataJs(output);
    return { text, assets, state: output };
  }

  const crcTable = Array.from({ length: 256 }, (_, index) => {
    let crc = index;
    for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    return crc >>> 0;
  });
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  async function zip(entries) {
    const files = [], directory = [];
    const now = new Date();
    const date = ((Math.max(1980, Math.min(2107, now.getFullYear())) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    let offset = 0, directorySize = 0;
    for (const [path, blob] of entries) {
      const name = encoder.encode(path);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const crc = crc32(bytes);
      const local = new Uint8Array(30 + name.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true); lv.setUint16(6, 0x800, true);
      lv.setUint16(10, time, true); lv.setUint16(12, date, true);
      lv.setUint32(14, crc, true); lv.setUint32(18, bytes.length, true); lv.setUint32(22, bytes.length, true);
      lv.setUint16(26, name.length, true); local.set(name, 30);
      files.push(local, bytes);
      const central = new Uint8Array(46 + name.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x800, true);
      cv.setUint16(12, time, true); cv.setUint16(14, date, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, bytes.length, true); cv.setUint32(24, bytes.length, true);
      cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); central.set(name, 46);
      directory.push(central);
      directorySize += central.length;
      offset += local.length + bytes.length;
      if (offset + directorySize > 0xffffffff) throw new Error("The publishing bundle is too large for this ZIP format.");
    }
    const end = new Uint8Array(22);
    const view = new DataView(end.buffer);
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(8, directory.length, true); view.setUint16(10, directory.length, true);
    view.setUint32(12, directorySize, true); view.setUint32(16, offset, true);
    return new Blob([...files, ...directory, end], { type: "application/zip" });
  }

  async function bundle(state) {
    const result = await collect(state);
    const entries = new Map([["data.js", new Blob([result.text], { type: "application/javascript" })], ...result.assets]);
    entries.set("PUBLISH.txt", new Blob(["Extract this bundle into the portfolio repository root, preserving assets/media/. Preview locally, then commit and push data.js and the media files.\n"]));
    return { ...result, blob: await zip(entries) };
  }
  root.PortfolioExport = { dataJs, collect, zip, bundle, crc32 };
})(globalThis);
