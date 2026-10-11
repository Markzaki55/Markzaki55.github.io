import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";

// Install Playwright separately from the static site, or pass its index.mjs path.
const modulePath = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const root = process.cwd();
const dataContext = vm.createContext({});
vm.runInContext(fs.readFileSync("data.js", "utf8") + "\nglobalThis.projects=PROJECTS;", dataContext);
const voodoo = dataContext.projects.find(project => project.id === "voodoo-you-chasing");
const clip = path.join(root, voodoo.cardPreview.video.src);
const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".mp4": "video/mp4", ".webm": "video/webm", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".pdf": "application/pdf" };
const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  let relative = decodeURIComponent(url.pathname).replace(/^\/portfolio\//, "").replace(/^\//, "");
  if (!relative || relative.endsWith("/")) relative += "index.html";
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404); response.end("Not found"); return;
  }
  const size = fs.statSync(file).size;
  const headers = { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Accept-Ranges": "bytes", "Cache-Control": "no-cache" };
  const range = request.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if (range) {
    const start = Number(range[1]), end = Math.min(size - 1, range[2] ? Number(range[2]) : size - 1);
    response.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    fs.createReadStream(file, { start, end }).pipe(response);
  } else {
    response.writeHead(200, { ...headers, "Content-Length": size });
    fs.createReadStream(file).pipe(response);
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/portfolio/`;
const browser = await chromium.launch({ headless: true });
const errors = [];
async function makeContext(options = {}) {
  const { dataSaving, ...browserOptions } = options;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true, ...browserOptions });
  if (dataSaving) await context.addInitScript(() => {
    Object.defineProperty(navigator, "connection", { value: { saveData: true, effectiveType: "4g" }, configurable: true });
  });
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" || /(?:fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) return route.continue();
    return route.abort();
  });
  context.on("page", page => page.on("pageerror", error => errors.push(error.message)));
  return context;
}
async function screenshot(page, name) {
  const dir = process.env.PORTFOLIO_TEST_ARTIFACTS;
  if (!dir) return;
  assert.equal(fs.statSync(dir).isDirectory(), true);
  // Load offscreen still images for a useful full-page capture; videos remain untouched.
  await page.locator("img").evaluateAll(images => images.forEach(image => { image.loading = "eager"; }));
  await page.waitForFunction(() => Array.from(document.images).every(image => image.complete && image.naturalWidth > 0));
  await page.evaluate(() => Promise.all(Array.from(document.images).map(image => image.decode())));
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let top = 0; top < height; top += 800) {
    await page.evaluate(value => scrollTo({ top: value, behavior: "instant" }), top);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: path.join(dir, name), fullPage: true });
}
function zipEntries(buffer) {
  const end = buffer.length - 22;
  assert.equal(buffer.readUInt32LE(end), 0x06054b50);
  let offset = buffer.readUInt32LE(end + 16);
  const entries = new Map();
  for (let i = 0; i < buffer.readUInt16LE(end + 10); i++) {
    const length = buffer.readUInt16LE(offset + 28);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + length);
    const local = buffer.readUInt32LE(offset + 42);
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    entries.set(name, buffer.subarray(start, start + buffer.readUInt32LE(offset + 24)));
    offset += 46 + length + buffer.readUInt16LE(offset + 30) + buffer.readUInt16LE(offset + 32);
  }
  return entries;
}

try {
  const context = await makeContext();
  await context.addInitScript(() => {
    if (location.hostname !== "127.0.0.1") return;
    localStorage.setItem("mzPortfolioDraft", JSON.stringify({ PROFILE: { name: "Stale draft name" } }));
    localStorage.setItem("mzPortfolioDraftTheme", JSON.stringify({ bg: "#ff0000" }));
  });
  const page = await context.newPage();
  const videos = [];
  page.on("request", request => { if (/\.(mp4|webm)(?:\?|$)/.test(request.url())) videos.push(request.url()); });
  await page.goto(base);
  await page.locator(".pcard").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("#name").textContent(), "Mark Zaki");
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(16, 16, 16)");
  assert.equal(await page.locator('.pcard[href*="repel-all-ets"]').count(), 0);
  assert.equal(videos.length, 0, "No video should be requested on the initial homepage");
  assert.equal(await page.locator('script[src*="media-store"]').count(), 0);
  assert.equal(await page.locator(".pcard__preview-label").count(), 0);
  const centered = await page.locator(".hero__statement").evaluate(element => {
    const rect = element.getBoundingClientRect();
    return Math.abs(rect.left + rect.width / 2 - innerWidth / 2) < 1;
  });
  assert.ok(centered);
  await screenshot(page, "portfolio-desktop.png");
  await page.locator(".pcard").first().hover();
  await page.waitForSelector(".pcard__media.is-previewing", { timeout: 15000 });
  assert.ok(videos.every(url => url.includes("preview-")), "Hover must fetch the small clip, not the full trailer");
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => !document.querySelector(".pcard__preview").hasAttribute("src"));
  assert.equal(await page.locator(".pcard__preview").evaluate(video => video.paused), true);
  await page.locator(".pcard").first().focus();
  await page.waitForSelector(".pcard__media.is-previewing");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector(".pcard__preview").hasAttribute("src"));

  const beforeArchive = videos.length;
  await page.goto(base.replace("/portfolio/", "/"));
  await page.locator(".pcard").first().waitFor();
  assert.equal(videos.length, beforeArchive, "Root-hosted GitHub user sites must also remain poster-first");
  await page.goto(base + "projects.html");
  await page.locator(".pcard").first().waitFor();
  assert.equal(videos.length, beforeArchive);
  assert.equal(await page.locator('.pcard[href*="repel-all-ets"]').count(), 1);

  await page.goto(base + "project.html?id=voodoo-you-chasing");
  await page.locator(".video-player__play").waitFor();
  assert.equal(videos.length, beforeArchive, "The project video must remain unloaded until Play");
  assert.equal(await page.locator(".thumb").count(), 3);
  await screenshot(page, "portfolio-project.png");
  await page.locator(".video-player__play").click();
  await page.waitForFunction(() => document.querySelector(".video-player video")?.currentTime > 0);
  assert.ok(videos.some(url => url.includes("gameplay-")));
  await page.locator(".thumb").nth(1).click();
  assert.equal(await page.locator(".video-player").count(), 0);
  await page.locator(".mediabox__expand").click();
  await page.locator(".lb").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".lb").count(), 0);

  for (const width of [320, 360, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base);
    await page.locator(".pcard").first().waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Layout overflow at ${width}px`);
    await screenshot(page, `portfolio-${width}.png`);
  }
  await context.close();

  for (const options of [{ reducedMotion: "reduce" }, { dataSaving: true }, { isMobile: true, hasTouch: true, viewport: { width: 375, height: 812 } }]) {
    const limited = await makeContext(options);
    const p = await limited.newPage();
    let requests = 0;
    p.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) requests++; });
    await p.goto(base);
    await p.locator(".pcard").first().hover();
    await p.waitForTimeout(450);
    assert.equal(requests, 0, "Reduced-motion/touch visits must keep static posters");
    await limited.close();
  }

  const studio = await makeContext();
  const editor = await studio.newPage();
  await editor.goto(base + "admin.html");
  await editor.locator("#side button", { hasText: /^Projects$/ }).click();
  await editor.locator('button[title="Edit"]').first().click();
  await editor.getByRole("button", { name: "+ Video", exact: true }).click();
  const item = editor.locator(".media-item").last();
  await item.locator(".media-item__toggle").click();
  await item.getByLabel(/Media card name/).fill("Uploaded gameplay test");
  await item.locator('input[type="file"][accept*="video/mp4"]').setInputFiles(clip);
  await item.getByText("Uploaded video", { exact: true }).waitFor({ timeout: 30000 });
  assert.ok((await item.locator("video").getAttribute("src")).startsWith("blob:"));
  const hoverPanel = editor.locator(".panel", { has: editor.locator("h3", { hasText: /^Card hover preview$/ }) });
  await hoverPanel.locator('input[type="file"]').setInputFiles(clip);
  await hoverPanel.locator('input[type="file"]:not([disabled])').waitFor();
  await hoverPanel.getByText(/Ready for hover preview/).waitFor({ timeout: 30000 });
  await hoverPanel.locator('input[type="file"]').setInputFiles({ name: "large-preview.mp4", mimeType: "video/mp4", buffer: Buffer.alloc(3 * 1048576 + 1) });
  await hoverPanel.getByText(/Use a preview clip smaller than 3 MB/).waitFor();
  await editor.locator("#btn-save").click();
  await editor.locator("#status.saved").waitFor();
  await editor.reload();
  await editor.locator("#side button", { hasText: /^Projects$/ }).click();
  await editor.locator('button[title="Edit"]').first().click();
  await editor.locator(".media-item__title", { hasText: /^Uploaded gameplay test$/ }).waitFor();
  const saved = await editor.evaluate(async () => {
    const db = await PortfolioMedia.openDb();
    return new Promise(resolve => {
      const tx = db.transaction("drafts", "readonly");
      const request = tx.objectStore("drafts").get("mzPortfolioDraft");
      request.onsuccess = () => resolve(request.result);
      tx.oncomplete = () => db.close();
    });
  });
  const uploadedProject = saved.PROJECTS.find(project => project.id === "voodoo-you-chasing");
  const uploadedVideo = uploadedProject.media.find(media => media.name === "Uploaded gameplay test");
  assert.ok(uploadedVideo.src.startsWith("upload:"));
  assert.ok(uploadedVideo.poster.startsWith("upload:"));
  assert.doesNotMatch(JSON.stringify(saved), /data:video|blob:/);
  const previewPage = await studio.newPage();
  await previewPage.goto(base + "?studio=1");
  await previewPage.locator(".pcard").first().hover();
  await previewPage.waitForSelector(".is-previewing", { timeout: 15000 });
  assert.ok((await previewPage.locator(".pcard__preview").getAttribute("src")).startsWith("blob:"));
  await previewPage.close();

  const downloadPromise = editor.waitForEvent("download", { timeout: 60000 });
  await editor.locator("#btn-data-js").click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "portfolio-publish.zip");
  const entries = zipEntries(fs.readFileSync(await download.path()));
  const publishedData = entries.get("data.js").toString();
  assert.doesNotMatch(publishedData, /upload:|blob:|data:video|data:image|_file/);
  const output = vm.createContext({});
  vm.runInContext(publishedData + "\nglobalThis.projects=PROJECTS;", output);
  const exportedVideo = output.projects[0].media.find(media => media.name === "Uploaded gameplay test");
  assert.equal(entries.get(exportedVideo.src).length, uploadedVideo.bytes);
  assert.equal(entries.get(output.projects[0].cardPreview.video.src).length, uploadedVideo.bytes);

  const clean = await makeContext();
  await clean.route("**/data.js?*", route => route.fulfill({ body: publishedData, contentType: "application/javascript" }));
  await clean.route("**/assets/media/**", route => {
    const name = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/portfolio\//, "");
    if (!entries.has(name)) return route.continue();
    return route.fulfill({ body: entries.get(name), contentType: types[path.extname(name)] });
  });
  const published = await clean.newPage();
  let cleanVideoRequests = 0;
  published.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) cleanVideoRequests++; });
  await published.goto(base);
  await published.locator(".pcard").first().waitFor();
  assert.equal(cleanVideoRequests, 0);
  await published.locator(".pcard").first().hover();
  await published.waitForSelector(".is-previewing", { timeout: 15000 });
  assert.equal(await published.locator('script[src*="media-store"]').count(), 0);
  await clean.close();
  const unusedRef = await editor.evaluate(async () => {
    const asset = await PortfolioMedia.storeFile(new Blob(["unused upload"], { type: "image/png" }), "unused.png");
    return asset.ref;
  });
  await editor.locator("#side button", { hasText: /^Publish$/ }).click();
  await editor.getByRole("button", { name: "Remove unused uploads", exact: true }).click();
  await editor.locator("#status").filter({ hasText: /unused uploads removed/ }).waitFor();
  assert.equal(await editor.evaluate(async ref => Boolean(await PortfolioMedia.getAsset(ref)), unusedRef), false);
  assert.equal(await editor.evaluate(async ref => Boolean(await PortfolioMedia.getAsset(ref)), uploadedVideo.src), true);
  await studio.close();
  assert.deepEqual(errors, []);
  console.log("Passed: GitHub-style subpath hosting, zero initial video requests, hover playback, galleries, mobile layouts, reduced motion, uploads/posters, persistence, live preview, export, and clean published playback.");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
