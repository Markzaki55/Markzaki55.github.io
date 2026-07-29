# Mark Zaki Portfolio

A static, project-first portfolio for gameplay and multiplayer systems work.

## Local preview

Serve the repository from its root so project links, media, and the editor preview work correctly:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Content editor

Open `http://localhost:8000/admin.html` to edit:

- Profile, hero copy, engineering focus, core tools, and contact copy
- Social, email, résumé, and project links
- Shared site colors
- Projects, media galleries, write-ups, tags, and featured status
- Drafts, JSON backups, `data.js` exports, and GitHub publishing

Drafts are saved in the current browser. Public content is generated from
`data.js`; unfinished projects named “New Project” stay available in the editor
but are omitted from the public project list until they contain publishable content.

## Structure

- `index.html`: featured work and profile
- `projects.html`: complete public project list
- `project.html`: dynamic project case study
- `privacy-policy.html`: privacy information
- `admin.html` / `admin.css`: portfolio studio
- `data.js`: editable profile, theme, and project data
- `render.js`: shared rendering and interactions
- `style.css`: public design system

The site is designed for GitHub Pages and requires no build step.
