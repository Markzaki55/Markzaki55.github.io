/* =========================================================================
   RENDER LOGIC - reads data.js, builds the pages.
   You normally don't need to edit this file.
   ========================================================================= */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function isExternal(url) { return /^https?:/i.test(url); }

/* Keep unfinished CMS entries private without deleting them from the editor. */
function isPublishableProject(p) {
  if (!p || !p.title || /^new project(?:\s+\d+)?$/i.test(p.title.trim())) return false;
  return Boolean(
    p.tagline ||
    (p.tags && p.tags.length) ||
    (p.media && p.media.length) ||
    (p.sections && p.sections.length)
  );
}

/* ----------------------------------------------------------------------
   DRAFT + THEME
   The admin dashboard (admin.html) saves a working copy of the site data to
   localStorage. If a draft exists we merge it over the data.js defaults, so
   edits show up live in this browser before they are exported and committed.
   ---------------------------------------------------------------------- */
const DRAFT_KEY = "mzPortfolioDraft";

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); }
  catch (e) { return null; }
}

function hydrateFromDraft() {
  const d = loadDraft();
  if (!d) return;
  const themeDefaults = typeof THEME !== "undefined"
    ? JSON.parse(JSON.stringify(THEME))
    : null;
  let useDraftProjects = true;
  if (d.PROFILE && typeof PROFILE !== "undefined") {
    const profileDefaults = JSON.parse(JSON.stringify(PROFILE));
    Object.assign(PROFILE, d.PROFILE);
    if ((d.PROFILE.layoutVersion || 0) < profileDefaults.layoutVersion) {
      ["tagline", "intro", "about", "pillars", "stack", "footerTagline"].forEach((key) => {
        PROFILE[key] = JSON.parse(JSON.stringify(profileDefaults[key]));
      });
      PROFILE.layoutVersion = profileDefaults.layoutVersion;
    }
    if ((d.PROFILE.expertiseVersion || 0) < (profileDefaults.expertiseVersion || 0)) {
      const expertiseReplacements = {
        "Combat, AI & Character Systems": profileDefaults.pillars[1],
        "Technical Leadership & Developer Tools": profileDefaults.pillars[3],
      };
      PROFILE.pillars = (PROFILE.pillars || []).map((pillar) =>
        expertiseReplacements[pillar.title]
          ? JSON.parse(JSON.stringify(expertiseReplacements[pillar.title]))
          : pillar
      );
      PROFILE.expertiseVersion = profileDefaults.expertiseVersion;
    }
    if ((d.PROFILE.projectDataVersion || 0) < profileDefaults.projectDataVersion) {
      useDraftProjects = false;
      PROFILE.projectDataVersion = profileDefaults.projectDataVersion;
    }
  }
  const hasLegacyDefaultPalette =
    d.THEME && (
      (d.THEME.bg === "#0b0c0d" && d.THEME.accent === "#E8A33D") ||
      (d.THEME.bg === "#0f100e" && d.THEME.accent === "#ff643f")
    );
  if (d.THEME && typeof THEME !== "undefined") {
    Object.assign(THEME, d.THEME);
    if (hasLegacyDefaultPalette && themeDefaults) {
      [
        "bg", "bg2", "surface", "surface2", "line", "lineSoft",
        "text", "muted", "faint", "accent", "accentSoft", "accentDeep",
        "heroText", "headingText", "projectTitle", "bodyText"
      ].forEach((key) => { THEME[key] = themeDefaults[key]; });
    }
  }
  if (useDraftProjects && Array.isArray(d.PROJECTS) && typeof PROJECTS !== "undefined") {
    PROJECTS.length = 0;
    d.PROJECTS.forEach((p) => PROJECTS.push(p));
  }
}

/* Map THEME keys -> CSS custom properties, and apply them to :root. */
const THEME_VARS = {
  bg: "--bg", bg2: "--bg-2", surface: "--surface", surface2: "--surface-2",
  line: "--line", lineSoft: "--line-soft", text: "--text", muted: "--muted",
  faint: "--faint", accent: "--accent", accentSoft: "--accent-soft", accentDeep: "--accent-deep",
  fontSans: "--font-sans", fontHeading: "--font-heading", fontMono: "--font-mono",
  heroText: "--hero-text", headingText: "--heading-text",
  projectTitle: "--project-title", bodyText: "--body-text",
};

function hexToRgba(hex, a) {
  const h = String(hex).replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  if (isNaN(n) || f.length !== 6) return `rgba(211,164,101,${a})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function applyTheme() {
  if (typeof THEME === "undefined" || !THEME) return;
  const root = document.documentElement.style;
  Object.entries(THEME_VARS).forEach(([k, varName]) => {
    if (THEME[k]) root.setProperty(varName, THEME[k]);
  });
  if (THEME.accent) root.setProperty("--glow", hexToRgba(THEME.accent, 0.1));
  if (THEME.bg) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = THEME.bg;
  }
}

/* ----------------------------------------------------------------------
   YOUTUBE IFRAME API
   We load the official API once and create players programmatically. This
   gives YouTube the "API Client identification" it needs. If the API fails
   to load within 3s or returns Error 153, we fall back to a static iframe.
   ---------------------------------------------------------------------- */
let ytApiState = "none"; // none | loading | ready | error
let ytApiQueue = [];
let ytApiTimeout = null;

function initYouTubePlayers() {
  clearTimeout(ytApiTimeout);
  ytApiState = "ready";
  ytApiQueue.forEach((cb) => cb());
  ytApiQueue = [];
}

function loadYouTubeApi() {
  if (ytApiState === "ready" || ytApiState === "loading") return;
  ytApiState = "loading";
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  // Fallback to static iframe if API doesn't load within 3s
  ytApiTimeout = setTimeout(() => {
    if (ytApiState !== "ready") {
      ytApiState = "error";
      ytApiQueue.forEach((cb) => cb({ fallback: true }));
      ytApiQueue = [];
    }
  }, 3000);
}

window.onYouTubeIframeAPIReady = initYouTubePlayers;

/* Build a static iframe fallback for YouTube */
function makeYouTubeIframe(id, label) {
  const f = document.createElement("iframe");
  f.title = label || "Video";
  f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share";
  f.allowFullscreen = true;
  f.referrerPolicy = "strict-origin-when-cross-origin";
  f.onerror = function () {
    // If iframe also fails, show thumbnail with play button
    const thumb = document.createElement("div");
    thumb.className = "yt-fallback";
    const img = document.createElement("img");
    img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    img.alt = label || "Video thumbnail";
    const a = document.createElement("a");
    a.href = `https://www.youtube.com/watch?v=${id}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "yt-play";
    a.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg> Watch on YouTube';
    thumb.appendChild(img);
    thumb.appendChild(a);
    this.parentNode.replaceWith(thumb);
  };
  // Try origin parameter if available
  const origin = window.location.origin;
  const originParam = (origin && /^https?:\/\//.test(origin)) ? `&origin=${encodeURIComponent(origin)}` : "";
  f.src = `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1${originParam}`;
  return f;
}

function createYouTubePlayer(container, videoId, label) {
  const fallback = { fallback: false };
  const start = (opts) => {
    if (opts && opts.fallback) {
      // API did not load in time. Use the static iframe fallback.
      const iframe = makeYouTubeIframe(videoId, label);
      container.replaceWith(iframe);
      return;
    }
    new YT.Player(container, {
      width: "100%",
      height: "100%",
      videoId: videoId,
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onError: (event) => {
          // Error 153. Use the static iframe fallback.
          if (event.data === 153 || event.data === 150) {
            const iframe = makeYouTubeIframe(videoId, label);
            container.replaceWith(iframe);
          } else {
            console.error("YouTube player error:", event.data);
          }
        },
      },
    });
  };
  if (ytApiState === "ready") start(fallback);
  else { ytApiQueue.push(start); loadYouTubeApi(); }
}

/* Build media element from a media object. */
function media(m) {
  if (!m) return el("div", "ph", `<span class="ph__sub">No media yet</span>`);
  switch (m.type) {
    case "image": {
      const img = document.createElement("img");
      img.src = m.src; img.alt = m.alt || ""; img.loading = "lazy";
      return img;
    }
    case "video": {
      const v = document.createElement("video");
      v.src = m.src; if (m.poster) v.poster = m.poster;
      v.controls = true; v.preload = "metadata"; v.playsInline = true;
      return v;
    }
    case "youtube": {
      if (!m.id) return el("div", "ph", `<span class="ph__sub">Missing YouTube ID</span>`);
      const wrap = document.createElement("div");
      wrap.className = "ytplayer";
      wrap.title = m.label || "Video";
      createYouTubePlayer(wrap, m.id, m.label || "Video");
      return wrap;
    }
    case "embed": {
      const f = document.createElement("iframe");
      f.src = m.src;
      f.title = m.title || m.label || "Embed"; f.allowFullscreen = true;
      f.loading = "lazy";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture";
      f.referrerPolicy = "strict-origin-when-cross-origin";
      return f;
    }
    case "text":
    default:
      return el("div", "ph",
        `<span class="ph__label">${esc(m.label || "")}</span>` +
        (m.sub ? `<span class="ph__sub">${esc(m.sub)}</span>` : ""));
  }
}

/* ----------------------------------------------------------------------
   MEDIA GALLERY (Unity Asset Store style)
   A big main stage + a strip of clickable thumbnails. Featured item first.
   ---------------------------------------------------------------------- */

/* Build a small thumbnail preview for a media object. */
function mediaThumb(m) {
  switch (m.type) {
    case "image": {
      const img = document.createElement("img");
      img.src = m.src; img.alt = m.alt || ""; img.loading = "lazy";
      return img;
    }
    case "video": {
      if (m.poster) {
        const img = document.createElement("img");
        img.src = m.poster; img.alt = m.label || ""; img.loading = "lazy";
        return img;
      }
      return el("div", "thumb__ph", `<span>${esc(m.label || "Video")}</span>`);
    }
    case "youtube": {
      const img = document.createElement("img");
      img.src = `https://img.youtube.com/vi/${m.id}/hqdefault.jpg`;
      img.alt = m.label || "Video"; img.loading = "lazy";
      return img;
    }
    case "embed":
      return el("div", "thumb__ph", `<span>${esc(m.label || m.title || "Embed")}</span>`);
    case "text":
    default:
      return el("div", "thumb__ph", `<span>${esc(m.label || "Media")}</span>`);
  }
}

const PLAY_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
const EXPAND_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9V4h5v2H6v3H4zm14 0V6h-3V4h5v5h-2zM6 15v3h3v2H4v-5h2zm12 0h2v5h-5v-2h3v-3z"/></svg>';

function isPlayable(m) { return m.type === "video" || m.type === "youtube" || m.type === "embed"; }
function mediaLabel(m, i) { return m.label2 || m.label || m.alt || (i != null ? `Media ${i + 1}` : ""); }

/* featured item first, otherwise original order */
function orderMedia(items) {
  const fi = items.findIndex((m) => m.featured);
  return fi > 0
    ? [items[fi], ...items.slice(0, fi), ...items.slice(fi + 1)]
    : items.slice();
}

function mediaGallery(items) {
  const box = el("div", "mediabox");
  box.tabIndex = 0;
  const ordered = orderMedia(items);
  let idx = 0;

  const stage = el("div", "mediabox__stage");
  const frame = el("div", "mediabox__frame");
  const count = el("span", "mediabox__count");
  const expand = el("button", "mediabox__expand", EXPAND_ICON);
  expand.type = "button";
  expand.setAttribute("aria-label", "Open fullscreen");
  stage.appendChild(frame);
  stage.appendChild(count);
  stage.appendChild(expand);

  const cap = el("p", "mediabox__cap");
  const thumbs = el("div", "mediabox__thumbs");

  const goto = (n) => {
    idx = (n + ordered.length) % ordered.length;
    const m = ordered[idx];
    frame.innerHTML = "";
    frame.appendChild(media(m));
    const label = mediaLabel(m);
    cap.textContent = label;
    cap.style.display = label ? "" : "none";
    count.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(ordered.length).padStart(2, "0")}`;
    thumbs.querySelectorAll(".thumb").forEach((x, i) => x.classList.toggle("is-active", i === idx));
  };

  box.appendChild(stage);
  box.appendChild(cap);

  if (ordered.length > 1) {
    if (ordered.length <= 5) {
      thumbs.classList.add("mediabox__thumbs--grid");
      thumbs.style.setProperty("--media-count", ordered.length);
    }
    ordered.forEach((m, i) => {
      const t = el("button", "thumb");
      t.type = "button";
      t.setAttribute("aria-label", mediaLabel(m, i));
      t.appendChild(mediaThumb(m));
      t.appendChild(el("span", "thumb__index", String(i + 1).padStart(2, "0")));
      if (isPlayable(m)) t.appendChild(el("span", "thumb__play", PLAY_ICON));
      t.addEventListener("click", () => goto(i));
      thumbs.appendChild(t);
    });
    box.appendChild(thumbs);
  }

  expand.addEventListener("click", () => openLightbox(ordered, idx));
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goto(idx + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goto(idx - 1); }
  });

  goto(0);
  return box;
}

/* ----------------------------------------------------------------------
   LIGHTBOX: fullscreen viewer with previous, next, and keyboard control
   ---------------------------------------------------------------------- */
function openLightbox(items, startIndex) {
  let i = startIndex || 0;
  const previousOverflow = document.body.style.overflow;

  const ov = el("div", "lb");
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-label", "Project media viewer");
  const frame = el("div", "lb__frame");
  const cap = el("p", "lb__cap");
  const prev = el("button", "lb__nav lb__nav--prev", "‹");
  const next = el("button", "lb__nav lb__nav--next", "›");
  const close = el("button", "lb__close", "×");
  [prev, next, close].forEach((b) => (b.type = "button"));
  prev.setAttribute("aria-label", "Previous");
  next.setAttribute("aria-label", "Next");
  close.setAttribute("aria-label", "Close");

  const single = items.length < 2;
  if (single) { prev.style.display = "none"; next.style.display = "none"; }

  const show = () => {
    i = (i + items.length) % items.length;
    frame.innerHTML = "";
    frame.appendChild(media(items[i]));
    const label = mediaLabel(items[i], i);
    cap.textContent = single ? label : `${label}  ·  ${i + 1} / ${items.length}`;
  };
  const done = () => {
    document.removeEventListener("keydown", onKey);
    document.body.style.overflow = previousOverflow;
    ov.remove();
  };
  const onKey = (e) => {
    if (e.key === "Escape") done();
    else if (e.key === "ArrowRight" && !single) { i++; show(); }
    else if (e.key === "ArrowLeft" && !single) { i--; show(); }
  };

  prev.addEventListener("click", () => { i--; show(); });
  next.addEventListener("click", () => { i++; show(); });
  close.addEventListener("click", done);
  ov.addEventListener("click", (e) => { if (e.target === ov) done(); });

  ov.append(close, prev, frame, next, cap);
  document.body.appendChild(ov);
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", onKey);
  requestAnimationFrame(() => ov.classList.add("in"));
  close.focus();
  show();
}

function makeLink(text, url, cls) {
  const a = el("a", cls, esc(text));
  a.href = url;
  if (isExternal(url)) { a.target = "_blank"; a.rel = "noopener"; }
  return a;
}

/* ======================================================================
   HOME
   ====================================================================== */
function renderHome() {
  document.title = `${PROFILE.name} | ${PROFILE.tagline}`;
  document.getElementById("name").textContent = PROFILE.name;
  document.getElementById("tagline").textContent = PROFILE.tagline;
  document.getElementById("intro").textContent = PROFILE.intro;

  // Keep the hero actions focused on the work and direct contact.
  const actions = document.getElementById("actions");
  const L = PROFILE.links;
  actions.appendChild(makeLink("View work", "#work", "btn btn--accent"));
  if (L.resume) actions.appendChild(makeLink("Résumé", L.resume, "btn"));
  else if (L.email) actions.appendChild(makeLink("Email me", L.email.trim(), "btn"));

  // pillars
  const pillars = document.getElementById("pillars");
  PROFILE.pillars.forEach((p, idx) => {
    const card = el("div", "pillar");
    card.appendChild(el("div", "pillar__num", String(idx + 1).padStart(2, "0")));
    card.appendChild(el("div", "pillar__title", esc(p.title)));
    card.appendChild(el("div", "pillar__body", esc(p.body)));
    pillars.appendChild(card);
  });

  // stack
  const stack = document.getElementById("stacklist");
  PROFILE.stack.forEach((s, idx) => {
    const tag = el("span", null, esc(s));
    tag.style.setProperty("--n", idx);
    stack.appendChild(tag);
  });

  // projects - only featured ones on the home page
  const grid = document.getElementById("projects");
  const publicProjects = PROJECTS.filter(isPublishableProject);
  const featured = publicProjects.filter((p) => p.featured);
  featured.forEach((p) => grid.appendChild(projectCard(p)));

  // Keep a clear route to the complete project list.
  const more = document.getElementById("all-projects");
  if (more && publicProjects.length) {
    more.style.display = "";
  }

}

function projectSource() {
  const currentPage = document.body.dataset.page;
  if (currentPage === "home") return "home";
  if (currentPage === "projects") return "projects";

  const explicitSource = new URLSearchParams(location.search).get("from");
  if (explicitSource === "home" || explicitSource === "projects") return explicitSource;

  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === location.origin) {
      const page = referrer.pathname.split("/").pop();
      if (!page || page === "index.html") return "home";
      if (page === "projects.html") return "projects";
    }
  } catch (_) {
    // Direct visits do not always include a usable referrer.
  }

  return "projects";
}

function projectHref(id, source = projectSource()) {
  return `project.html?id=${encodeURIComponent(id)}&from=${encodeURIComponent(source)}`;
}

function projectCard(p) {
  const card = el("a", "pcard");
  card.href = projectHref(p.id);
  card.setAttribute("aria-label", p.title);
  card.dataset.tags = (p.tags || []).map((t) => t.toLowerCase()).join("|");

  const m = el("div", "pcard__media");
  const cover = media(p.cover);
  if (cover.tagName === "VIDEO") {
    cover.controls = false;
    cover.autoplay = true;
    cover.muted = true;
    cover.loop = true;
    cover.playsInline = true;
    cover.setAttribute("aria-hidden", "true");
  }
  m.appendChild(cover);
  card.appendChild(m);

  const body = el("div", "pcard__body");
  const cardMeta = [p.role, p.timeline].filter(Boolean);
  if (cardMeta.length) {
    body.appendChild(el(
      "div",
      "pcard__meta",
      cardMeta.slice(0, 2).map((item) => `<span>${esc(item)}</span>`).join("")
    ));
  }
  const heading = el("div", "pcard__heading");
  heading.appendChild(el("h3", "pcard__title", esc(p.title)));
  heading.appendChild(el("span", "pcard__arrow", "View ↗"));
  body.appendChild(heading);
  if (p.tagline) body.appendChild(el("p", "pcard__tagline", esc(p.tagline)));
  card.appendChild(body);
  return card;
}

/* ======================================================================
   ALL PROJECTS PAGE
   ====================================================================== */
function renderProjects() {
  document.title = `All Projects | ${PROFILE.name}`;

  const publicProjects = PROJECTS.filter(isPublishableProject);

  const count = document.getElementById("proj-count");
  if (count) {
    const total = publicProjects.length;
    count.textContent = `${total} project${total === 1 ? "" : "s"}`;
  }

  const grid = document.getElementById("all-projects-grid");
  if (grid) publicProjects.forEach((p) => grid.appendChild(projectCard(p)));
}

/* ======================================================================
   PROJECT DETAIL
   ====================================================================== */
function renderProject() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = PROJECTS.find((x) => x.id === id);
  const root = document.getElementById("detail");
  const source = projectSource();
  const returnLink = source === "home"
    ? { label: "← Back to home", href: "index.html#work" }
    : { label: "← All projects", href: "projects.html" };

  if (!p) {
    const topbar = el("div", "detail__topbar");
    topbar.appendChild(makeLink(returnLink.label, returnLink.href, "back"));
    root.appendChild(topbar);
    const header = el("header", "detail__header");
    header.appendChild(el("p", "detail__eyebrow", "Project"));
    header.appendChild(el("h1", "detail__title", "Project not found"));
    header.appendChild(el("p", "detail__lead", "This project may have moved or is not published yet."));
    root.appendChild(header);
    return;
  }
  document.title = `${p.title} | ${PROFILE.name}`;
  const description = p.tagline || p.subtitle || `A project by ${PROFILE.name}.`;
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement("meta");
    descMeta.name = "description";
    document.head.appendChild(descMeta);
  }
  descMeta.content = description;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogTitle) ogTitle.content = `${p.title} | ${PROFILE.name}`;
  if (ogDescription) ogDescription.content = description;

  const publicProjects = PROJECTS.filter(isPublishableProject);
  const projectIndex = publicProjects.findIndex((item) => item.id === p.id);

  const topbar = el("div", "detail__topbar");
  topbar.appendChild(makeLink(returnLink.label, returnLink.href, "back"));
  if (projectIndex > -1) {
    topbar.appendChild(el(
      "span",
      "detail__position",
      `Project ${String(projectIndex + 1).padStart(2, "0")} / ${String(publicProjects.length).padStart(2, "0")}`
    ));
  }
  root.appendChild(topbar);

  const intro = el("section", "detail__intro");
  const summary = el("header", "detail__summary");
  if (p.subtitle) summary.appendChild(el("p", "detail__eyebrow", esc(p.subtitle)));
  summary.appendChild(el("h1", "detail__title", esc(p.title)));
  if (p.tagline) summary.appendChild(el("p", "detail__lead", esc(p.tagline)));
  if (p.tags && p.tags.length) {
    summary.appendChild(el(
      "div",
      "detail__tags",
      p.tags.slice(0, 4).map((t) => `<span>${esc(t)}</span>`).join("")
    ));
  }

  // Keep project facts beside the title so the introduction stays compact.
  const info = el("aside", "info");
  [["Role", p.role], ["Timeline", p.timeline], ["Built with", p.techStack]]
    .filter(([, v]) => v)
    .forEach(([label, val]) => {
      const row = el("div", "info__row");
      row.appendChild(el("div", "info__label", esc(label)));
      row.appendChild(el("div", "info__value", esc(val)));
      info.appendChild(row);
    });

  if (p.links && p.links.length) {
    const row = el("div", "info__row info__row--links");
    p.links.forEach((l) =>
      row.appendChild(makeLink(l.text, l.url, "btn btn--block" + (l.accent ? " btn--accent" : ""))));
    info.appendChild(row);
  }
  summary.appendChild(info);

  const visual = el("div", "detail__visual");
  if (p.media && p.media.length) {
    const hero = el("div", "detail__hero detail__hero--gallery");
    hero.appendChild(mediaGallery(p.media));
    visual.appendChild(hero);
  } else {
    const hero = el("div", "detail__hero");
    hero.appendChild(media(p.hero || p.cover));
    visual.appendChild(hero);
  }

  intro.append(summary, visual);
  root.appendChild(intro);

  const main = el("div", "detail__main");
  (p.sections || []).forEach((sec, sectionIndex) => {
    const s = el("div", "dsection");
    const head = el("div", "dsection__head");
    head.appendChild(el("span", "dsection__num", String(sectionIndex + 1).padStart(2, "0")));
    head.appendChild(el("h2", null, esc(sec.heading)));
    s.appendChild(head);

    if (sec.body) String(sec.body).split("\n\n").forEach((para) => s.appendChild(el("p", null, esc(para))));
    if (sec.list && sec.list.length) {
      const ul = el("ul");
      sec.list.forEach((li) => ul.appendChild(el("li", null, esc(li))));
      s.appendChild(ul);
    }
    if (sec.media) {
      const mw = el("div", "dsection__media");
      mw.appendChild(media(sec.media));
      s.appendChild(mw);
    }
    main.appendChild(s);
  });

  if (p.gallery && p.gallery.length) {
    const g = el("div", "gallery");
    p.gallery.forEach((m) => {
      const item = el("div", "gallery__item");
      item.appendChild(media(m));
      g.appendChild(item);
    });
    main.appendChild(g);
  }
  root.appendChild(main);

  const projectNav = el("nav", "projectnav");
  projectNav.setAttribute("aria-label", "Project navigation");
  projectNav.appendChild(makeLink("All projects", "projects.html", "projectnav__all"));
  const projectNavLinks = el("div", "projectnav__links");
  const previous = projectIndex > 0 ? publicProjects[projectIndex - 1] : null;
  const next = projectIndex > -1 && projectIndex < publicProjects.length - 1
    ? publicProjects[projectIndex + 1]
    : null;
  if (previous) {
    const previousLink = makeLink("", projectHref(previous.id, source), "projectnav__project projectnav__project--prev");
    previousLink.append(
      el("span", "projectnav__label", "Previous"),
      el("strong", "projectnav__title", `← ${esc(previous.title)}`)
    );
    projectNavLinks.appendChild(previousLink);
  }
  if (next) {
    const nextLink = makeLink("", projectHref(next.id, source), "projectnav__project projectnav__project--next");
    nextLink.append(
      el("span", "projectnav__label", "Next"),
      el("strong", "projectnav__title", `${esc(next.title)} →`)
    );
    projectNavLinks.appendChild(nextLink);
  }
  projectNav.appendChild(projectNavLinks);
  root.appendChild(projectNav);
}

/* ======================================================================
   CONTACT SECTION (home)
   ====================================================================== */
const SOCIAL_ICONS = {
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 5 18 5.3 18 5.3c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V8h3v11zM6.5 6.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM19 19h-3v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V19h-3V8h2.9v1.5h.04a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.7V19z"/></svg>',
  email:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  doc:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3.5h8V18H8v-1.5z"/></svg>',
};

function renderContact() {
  const about = document.getElementById("about-text");
  if (about && PROFILE.about) about.textContent = PROFILE.about;

  const email = document.getElementById("contact-email");
  if (email) {
    if (PROFILE.links.email) email.href = PROFILE.links.email.trim();
    else email.style.display = "none";
  }

  const socials = document.getElementById("socials");
  if (socials) {
    const L = PROFILE.links;
    const items = [
      L.github   && { label: "GitHub",   url: L.github,   icon: SOCIAL_ICONS.github },
      L.linkedin && { label: "LinkedIn", url: L.linkedin, icon: SOCIAL_ICONS.linkedin },
      L.resume   && { label: "Resume",   url: L.resume,   icon: SOCIAL_ICONS.doc },
    ].filter(Boolean);
    items.forEach((it) => {
      const a = el("a", "social");
      a.href = it.url;
      a.innerHTML = it.icon + `<span>${esc(it.label)}</span>`;
      if (isExternal(it.url)) { a.target = "_blank"; a.rel = "noopener"; }
      socials.appendChild(a);
    });
  }
}

/* ======================================================================
   FOOTER (shared)
   ====================================================================== */
function renderFooter() {
  const f = document.getElementById("footer-links");
  if (!f) return;
  const brand = document.querySelector(".footer__brand");
  if (brand && !brand.querySelector(".footer__mark")) {
    const mark = document.createElement("img");
    mark.className = "footer__mark";
    mark.src = "assets/mz-mark.svg";
    mark.alt = "";
    mark.setAttribute("aria-hidden", "true");
    brand.prepend(mark);
  }
  const L = PROFILE.links;
  const add = (t, u) => { if (u) f.appendChild(makeLink(t, u, "")); };
  add("GitHub", L.github);
  add("LinkedIn", L.linkedin);
  add("Email", L.email);
  add("Resume", L.resume);

  // footer tagline
  const ft = document.querySelector(".footer__tagline");
  if (ft && PROFILE.footerTagline) ft.textContent = PROFILE.footerTagline;

  // copyright line
  if (PROFILE.copyright) {
    const copy = el("div", "footer__copy",
      esc(PROFILE.copyright).replace(/\{year\}/g, new Date().getFullYear()));
    f.closest(".footer").appendChild(copy);
  }
}

/* ======================================================================
   BOOT
   ====================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  hydrateFromDraft();
  applyTheme();
  if (document.body.dataset.page === "home") renderHome();
  if (document.body.dataset.page === "project") renderProject();
  if (document.body.dataset.page === "projects") renderProjects();
  renderContact();
  renderFooter();
});
