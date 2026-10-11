import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const data = fs.readFileSync("data.js", "utf8");
const migration = fs.readFileSync("content-migration.js", "utf8");
const render = fs.readFileSync("render.js", "utf8");
const hydration = render.slice(0, render.indexOf("/* Map THEME keys"));

async function checkDraft(currentVersion) {
  const context = vm.createContext({ console, URLSearchParams, location: { search: "?studio=1" } });
  vm.runInContext(data + "\n" + migration + "\n" + hydration, context);
  await vm.runInContext(`(async () => {
    const defaults = JSON.parse(JSON.stringify({ PROFILE, PROJECTS }));
    const draft = JSON.parse(JSON.stringify({ PROFILE, PROJECTS, THEME }));
    draft.PROFILE.contentVersion = ${typeof currentVersion === "number" ? currentVersion : currentVersion ? "PROFILE.contentVersion" : "0"};
    draft.PROFILE.intro = "My draft introduction";
    draft.PROFILE.pillars = [{ title: "Draft expertise", body: "Draft body" }];
    draft.PROFILE.about = "Keep my contact edit";
    draft.PROJECTS.find(p => p.id === "ruf").sections = [
      { heading: "Overview", body: "Inspired by Elden Ring and Sekiro" }
    ];
    draft.PROJECTS.find(p => p.id === "repel-all-ets").featured = true;
    draft.PROJECTS.find(p => p.id === "faraque").techStack = "Unity, Photon Fusion";
    draft.PROJECTS.find(p => p.id === "al-molazem").title = "Keep my project edit";
    draft.PROJECTS.push({ id: "custom-draft", title: "Keep my new project" });
    draft.PROJECTS.find(p => p.id === "voodoo-you-chasing").media = [
      { type: "image", src: "assets/media/custom.png", mediaId: "keep-custom" }
    ];
    loadDraft = async () => draft;
    await hydrateFromDraft();
    globalThis.result = JSON.parse(JSON.stringify({ PROFILE, PROJECTS, defaults }));
  })()`, context);
  return context.result;
}

const old = await checkDraft(false);
assert.equal(old.PROFILE.intro, old.defaults.PROFILE.intro);
assert.deepEqual(old.PROFILE.pillars, old.defaults.PROFILE.pillars);
assert.equal(old.PROFILE.stack.indexOf("FishNet") < old.PROFILE.stack.indexOf("Photon"), true);
assert.equal(old.PROFILE.stack.includes("UniTask"), true);
assert.equal(old.PROJECTS.find(p => p.id === "repel-all-ets").featured, false);
assert.deepEqual(old.PROJECTS.find(p => p.id === "ruf").sections,
  old.defaults.PROJECTS.find(p => p.id === "ruf").sections);
assert.equal(old.PROJECTS.find(p => p.id === "faraque").techStack, "Unity, Photon");
assert.equal(old.PROFILE.about, "Keep my contact edit");
assert.equal(old.PROJECTS.find(p => p.id === "al-molazem").title, "Keep my project edit");
assert.ok(old.PROJECTS.find(p => p.id === "custom-draft"));
const voodoo = old.PROJECTS.find(p => p.id === "voodoo-you-chasing");
assert.equal(voodoo.media.length, 4);
assert.ok(voodoo.media.find(item => item.mediaId === "keep-custom"));
assert.equal(voodoo.cardPreview.video.bytes <= 3 * 1048576, true);

const current = await checkDraft(true);
assert.equal(current.PROFILE.intro, "My draft introduction");
assert.equal(current.PROJECTS.find(p => p.id === "repel-all-ets").featured, true);

const previousRelease = await checkDraft(2);
assert.equal(previousRelease.PROFILE.intro, previousRelease.defaults.PROFILE.intro);
assert.equal(previousRelease.PROFILE.pillars[0].title, "Draft expertise");
assert.equal(previousRelease.PROJECTS.find(p => p.id === "voodoo-you-chasing").media.length, 1);

assert.doesNotMatch(data, /Photon (?:PUN|Fusion)|Elden Ring|Sekiro|Dark Souls/);
for (const page of ["index.html", "projects.html", "project.html", "privacy-policy.html"]) {
  const html = fs.readFileSync(page, "utf8");
  for (const asset of ["theme-init.js", "style.css", "data.js", "content-migration.js", "render.js"]) {
    const version = "20261011-6";
    assert.ok(html.includes(`${asset}?v=${version}`), `${page}: missing version for ${asset}`);
  }
  assert.ok(html.indexOf('src="content-migration.js') < html.indexOf('src="render.js'));
}
console.log("Passed: stale draft migration, current draft preservation, copy, and asset versions.");
