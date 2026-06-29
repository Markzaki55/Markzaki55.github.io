# Mark Zaki — Portfolio

A minimal, dark, static portfolio. No build step — plain HTML/CSS/JS. Hosts
free on GitHub Pages. Theme: charcoal + warm amber, mono technical labels,
blueprint detailing.

## Files

| File           | What it is                                                      |
|----------------|-----------------------------------------------------------------|
| `data.js`      | **The only file you normally edit** — your profile + projects. |
| `index.html`   | Home page shell.                                               |
| `project.html` | One detail page that serves every project via `?id=`.         |
| `style.css`    | All styling. Theme colors live at the top under `:root`.       |
| `render.js`    | Builds the pages from `data.js`. Rarely needs touching.       |
| `assets/`      | Put images / videos / your `resume.pdf` here.                 |

## Add a project

Open `data.js`, copy a `{ ... }` block inside `PROJECTS`, and edit it.
Only `id`, `title`, `tagline`, `tags`, `cover` are required.

### Media (images, video, YouTube, placeholder)
Use these anywhere a media object is accepted (cover, hero, gallery, or a section):
```js
{ type: "image",   src: "assets/media/shot.png", alt: "Combat" }
{ type: "video",   src: "assets/media/clip.mp4", poster: "assets/media/poster.png" }
{ type: "youtube", id: "VIDEO_ID" }
{ type: "text",    label: "RUF", sub: "Radiant Undead Framework" }
```

### Sections (detail-page content)
```js
{ heading: "The Goal", body: "para one\n\npara two" }     // paragraphs
{ heading: "Features", list: ["point one", "point two"] }  // bullet list
// any section can also carry:  media: { type:"image", src:"..." }
```

### Hyperlinks / buttons on a project
```js
links: [
  { text: "View on GitHub", url: "https://github.com/you/repo" },
  { text: "Watch Demo",     url: "https://youtu.be/xyz", accent: true },
]
```

### Hero & footer links
Edit `PROFILE.links` in `data.js` (github, resume, linkedin, email).
Leave any url as `""` to hide that button.

## Re-skin

Change the variables at the top of `style.css` (`:root`) — e.g. `--accent`
for the amber, `--bg` for the background.

## Run locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Push these files to a repo's `main` branch.
2. Settings → Pages → Source: Deploy from a branch → `main` / (root).
3. Live at `https://<username>.github.io/<repo>/`.

The `.nojekyll` file makes Pages serve everything as-is.
