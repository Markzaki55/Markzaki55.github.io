# Mark Zaki Portfolio

A static, project-first portfolio for gameplay and multiplayer systems work.

## Local preview

Serve the repository from its root so project links, media, and the editor preview work correctly:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Content editor

The portfolio studio (`admin.html` / `admin.css`) is **local-only**: it is
excluded from git (see `.gitignore`) so it is never deployed to GitHub Pages.
Open `http://localhost:8000/admin.html` to edit:

- Profile, hero copy, engineering focus, core tools, and contact copy
- Social, email, resume, and project links
- Shared site colors
- Projects, media galleries, write-ups, tags, and featured status
- Drafts and file-based publishing bundles

Images uploaded in the editor are stored as files under `assets/media/` and
referenced by path in `data.js` (never embedded as base64), so `data.js`
stays small and the site loads fast.

Uploaded files are stored as Blobs in IndexedDB while editing. The local live
preview (`?studio=1`) resolves them from that browser. Ordinary public visits
use only committed `data.js` and media paths, so saved editor drafts do not
change the published site or slow it down.

## Publishing

Drafts are saved in the current browser. Public content is generated from
`data.js`; unfinished projects named “New Project” stay available in the editor
but are omitted from the public project list until they contain publishable content.

To publish:

1. In the admin **Publish** tab, click **Download site bundle (.zip)**.
2. Extract the bundle into the repo root. It contains `data.js`, referenced
   media under `assets/media/`, and publishing instructions.
3. Preview locally, then commit and push `data.js` and the media files.
   GitHub Pages serves everything directly; no paid host or backend is needed.

Use **Data only (.js)** for text-only changes when every media asset already
has a committed path. New uploads require the bundle so files are included.
Legacy embedded images are extracted into separate files during export.

## Videos and hover previews

- Upload MP4 (H.264) or WebM directly in a gallery or video-cover editor.
- A poster is captured automatically; upload a custom image or capture another
  frame by entering its time in seconds.
- Under **Card hover preview**, choose a small gallery video or upload a separate
  short preview. Previews must have a known size of at most 3 MB.
- Cards fetch no video until hover/focus. Previews are muted, stop on leave,
  and are disabled for touch-only, reduced-motion, and supported data-saving modes.
- Full gallery videos load only when **Play video** is pressed.

For larger source videos, install FFmpeg locally and run the optional helper:

```powershell
python scripts/optimize-video.py "assets/media/source.mp4" --project voodoo-you-chasing --start 3 --seconds 8
```

Pass `--ffmpeg "path/to/ffmpeg.exe"` if it is not on PATH. The helper produces
an H.264 full video with fast-start metadata, a silent lightweight hover clip,
and a poster. It gives outputs content-hashed filenames and updates that
project in `data.js`. The original source is preserved. Run after extracting
an upload bundle, then reload the editor before making further edits.

Everything produced by the helper is static and works on free GitHub Pages.
FFmpeg is used only on your computer; visitors do not download a transcoder.

The original Voodoo source video and screenshots are retained locally and
ignored by Git. The published project references their optimized MP4/WebP
derivatives, including the separate lightweight hover clip.

## Structure

- `index.html`: featured work and profile
- `projects.html`: complete public project list
- `project.html`: dynamic project case study
- `privacy-policy.html`: privacy information
- `data.js`: editable profile, theme, and project data
- `render.js`: shared rendering and interactions
- `content-migration.js`: versioned content updates for older saved editor drafts
- `media-store.js`: local-only draft asset storage and preview URL lifecycle
- `media-export.js`: file-based export and ZIP publishing bundles
- `studio-media.js`: local editor video inspection and poster capture
- `style.css`: public design system

The site is designed for GitHub Pages and requires no build step.

When releasing changed assets, update the `?v=` token in the HTML asset URLs
so browsers fetch the new files. For copy changes that must supersede saved
drafts, increment `PROFILE.contentVersion` and update `content-migration.js`.

## Checks

```powershell
node scripts/test-content-migration.mjs
node scripts/test-export.mjs
```

The browser integration check uses Playwright (a test-only dependency):

```powershell
node scripts/test-browser.mjs
```

It starts its own local server and checks user-site and project-site paths,
video network behavior, layouts, uploads, draft persistence, ZIP export, and
playback in a clean browser. If Playwright is installed outside the repo, set
`PLAYWRIGHT_MODULE` to its `index.mjs` path. Install its Chromium browser before
running. Optional `PORTFOLIO_TEST_ARTIFACTS` points to an existing directory for
desktop, mobile, and project screenshots.
