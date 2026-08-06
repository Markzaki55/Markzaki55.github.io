import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("admin.html", "utf8");

function extract(name) {
  const start = html.indexOf(`function ${name}(`);
  const close = html.indexOf("\n    function ", start + 1);
  return html.slice(start, close === -1 ? html.length : close);
}

let code = "var MEDIA_PREFIX = 'assets/media/';\n";
for (const fn of ["extFromDataUrl","b64FromDataUrl","collectEmbeddedMedia","collectExport","buildDataJs","b64ToBytes","crc32","concatBytes","buildZip","zipExport","slug","clone"]) {
  const i = html.indexOf(`function ${fn}(`);
  if (i === -1) throw new Error("missing " + fn);
  const close = html.indexOf("\n    function ", i + 1);
  code += html.slice(i, close === -1 ? html.indexOf("\n    }", i + 1) + 5 : close) + "\n";
}

const sandbox = {
  console,
  TextEncoder,
  Blob,
  Uint8Array,
  DataView,
  atob: (s) => Buffer.from(s, "base64").toString("binary"),
  Date,
  h: () => ({}),
  clone: (o) => JSON.parse(JSON.stringify(o)),
  slug: (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project",
  state: {
    PROFILE: { name: "T" },
    THEME: {},
    PROJECTS: [{
      id: "demo-project",
      title: "Demo Project",
      cover: { type: "image", src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" },
      media: [
        { type: "image", src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" },
        { type: "youtube", id: "abc" },
        { type: "image", src: "assets/media/existing.png" }
      ],
      gallery: []
    }]
  }
};

vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const ex = sandbox.collectExport();
console.log("media:", JSON.stringify(ex.media.map((m) => m.path)));
console.log("has path in src:", ex.text.includes("assets/media/demo-project-cover.png"));
console.log("no data: urls in export:", !ex.text.includes("data:image"));

const zip = sandbox.zipExport();
console.log("zip type:", zip.type, "size:", zip.size);

const buf = Buffer.from(await zip.arrayBuffer());
const eocdMagic = buf.readUInt32LE(buf.length - 22);
const localMagic = buf.readUInt32LE(0);
const centralCount = buf.readUInt16LE(buf.length - 12);
console.log("EOCD magic ok:", eocdMagic === 0x06054b50, "| local header ok:", localMagic === 0x04034b50, "| entries:", centralCount);

const names = [];
for (let i = 0; i < centralCount; i++) {
  const off = buf.readUInt32LE(buf.length - 22 + 16) + i * 46;
  const len = buf.readUInt16LE(off + 28);
  names.push(buf.toString("utf8", off + 46, off + 46 + len));
}
console.log("entries:", JSON.stringify(names));
console.log("has data.js:", names.includes("data.js"), "| has media:", names.includes("assets/media/demo-project-cover.png"));
fs.writeFileSync("scripts/_test.zip", buf);
console.log("wrote scripts/_test.zip");
