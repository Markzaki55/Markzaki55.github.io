/* =========================================================================
   RENDER LOGIC — reads data.js, builds the pages.
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
      const f = document.createElement("iframe");
      f.src = `https://www.youtube.com/embed/${m.id}`;
      f.title = "Video"; f.allowFullscreen = true;
      f.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      return f;
    }
    case "text":
    default:
      return el("div", "ph",
        `<span class="ph__label">${esc(m.label || "")}</span>` +
        (m.sub ? `<span class="ph__sub">${esc(m.sub)}</span>` : ""));
  }
}

function makeLink(text, url, cls) {
  const a = el("a", cls, esc(text));
  a.href = url;
  if (isExternal(url)) { a.target = "_blank"; a.rel = "noopener"; }
  return a;
}

/* Brand lives in the shared header; only fill the name span if empty. */
function setBrand() {
  const name = document.querySelector(".brand__name");
  if (name && !name.innerHTML.trim()) name.innerHTML = `Mark <b>Zaki</b>`;
}

/* mobile nav toggle (shared) */
function initMobileNav() {
  const head = document.getElementById("site-head");
  const toggle = document.getElementById("nav-toggle");
  if (!head || !toggle) return;
  const setOpen = (open) => {
    head.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };
  toggle.addEventListener("click", () => setOpen(!head.classList.contains("is-open")));
  // close after choosing a destination
  head.querySelectorAll(".nav a").forEach((a) =>
    a.addEventListener("click", () => setOpen(false)));
  // close when resizing back to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setOpen(false);
  });
}

/* scroll reveal */
function observeReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
}

/* ======================================================================
   HOME
   ====================================================================== */
function renderHome() {
  document.title = `${PROFILE.name} — ${PROFILE.tagline}`;
  setBrand();
  document.getElementById("name").textContent = PROFILE.name;
  document.getElementById("intro").textContent = PROFILE.intro;

  // rotating role
  const rot = document.getElementById("rotator");
  let i = 0;
  rot.textContent = PROFILE.roleWords[0];
  if (PROFILE.roleWords.length > 1) {
    setInterval(() => {
      i = (i + 1) % PROFILE.roleWords.length;
      rot.textContent = PROFILE.roleWords[i];
    }, 2200);
  }

  // stats
  const stats = document.getElementById("stats");
  (PROFILE.stats || []).forEach((s) => {
    const st = el("div", "stat");
    st.appendChild(el("div", "stat__value", esc(s.value)));
    st.appendChild(el("div", "stat__label", esc(s.label)));
    stats.appendChild(st);
  });
  if (!(PROFILE.stats || []).length) stats.style.display = "none";

  // buttons
  const actions = document.getElementById("actions");
  const L = PROFILE.links;
  if (L.github)   actions.appendChild(makeLink("GitHub ↗", L.github, "btn"));
  if (L.resume)   actions.appendChild(makeLink("Resume / CV", L.resume, "btn btn--accent"));
  if (L.linkedin) actions.appendChild(makeLink("LinkedIn ↗", L.linkedin, "btn"));
  if (L.email)    actions.appendChild(makeLink("Email", L.email, "btn"));

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
  PROFILE.stack.forEach((s) => stack.appendChild(el("span", null, esc(s))));

  // projects — only featured ones on the home page
  const grid = document.getElementById("projects");
  const featured = PROJECTS.filter((p) => p.featured);
  featured.forEach((p) => grid.appendChild(projectCard(p)));

  // "All projects" link if there are more beyond the featured set
  const more = document.getElementById("all-projects");
  if (more && PROJECTS.length > featured.length) {
    more.style.display = "";
  }

  observeReveals();
}

function projectCard(p) {
  const card = el("a", "pcard reveal" + (p.featured ? " pcard--featured" : ""));
  card.href = `project.html?id=${encodeURIComponent(p.id)}`;
  card.setAttribute("aria-label", p.title);

  const m = el("div", "pcard__media");
  m.appendChild(media(p.cover));
  if (p.featured) m.appendChild(el("span", "pcard__badge", "Featured"));
  card.appendChild(m);

  const body = el("div", "pcard__body");
  if (p.tags && p.tags.length)
    body.appendChild(el("div", "pcard__tags", p.tags.map((t) => `<span>${esc(t)}</span>`).join("")));
  body.appendChild(el("div", "pcard__title", esc(p.title)));
  if (p.tagline) body.appendChild(el("div", "pcard__tagline", esc(p.tagline)));
  body.appendChild(el("div", "pcard__cta", `View project <span class="arrow">→</span>`));
  card.appendChild(body);
  return card;
}

/* ======================================================================
   ALL PROJECTS PAGE
   ====================================================================== */
function renderProjects() {
  setBrand();
  document.title = `All Projects — ${PROFILE.name}`;

  const featured = PROJECTS.filter((p) => p.featured);
  const other = PROJECTS.filter((p) => !p.featured);

  const count = document.getElementById("proj-count");
  if (count) {
    const total = PROJECTS.length;
    count.textContent =
      `${total} project${total === 1 ? "" : "s"} — ${featured.length} featured, ${other.length} archived`;
  }

  const fg = document.getElementById("featured-group");
  if (fg) {
    fg.appendChild(groupHead("Featured", featured.length));
    const grid = el("div", "projgrid");
    featured.forEach((p) => grid.appendChild(projectCard(p)));
    fg.appendChild(grid);
  }

  const og = document.getElementById("other-group");
  if (og && other.length) {
    og.appendChild(groupHead("More Work", other.length));
    const grid = el("div", "projgrid");
    other.forEach((p) => grid.appendChild(projectCard(p)));
    og.appendChild(grid);
  }

  observeReveals();
}

function groupHead(label, count) {
  const wrap = el("div", "projgroup__head reveal");
  wrap.appendChild(el("span", "mono", `${label}`));
  wrap.appendChild(el("span", "projgroup__count", String(count).padStart(2, "0")));
  return wrap;
}

/* ======================================================================
   PROJECT DETAIL
   ====================================================================== */
function renderProject() {
  const id = new URLSearchParams(location.search).get("id");
  const p = PROJECTS.find((x) => x.id === id);
  const root = document.getElementById("detail");

  setBrand();

  if (!p) {
    root.appendChild(makeLink("← Back to projects", "index.html", "back"));
    root.appendChild(el("h1", "detail__title", "Project not found"));
    return;
  }
  document.title = `${p.title} — ${PROFILE.name}`;

  root.appendChild(makeLink("← Back to projects", "index.html", "back"));

  if (p.subtitle) root.appendChild(el("p", "detail__eyebrow", esc(p.subtitle)));
  root.appendChild(el("h1", "detail__title", esc(p.title)));
  if (p.tags && p.tags.length)
    root.appendChild(el("div", "detail__tags", p.tags.map((t) => `<span>${esc(t)}</span>`).join("")));

  const body = el("div", "detail__body");
  const main = el("div");

  const hero = el("div", "detail__hero");
  hero.appendChild(media(p.hero || p.cover));
  main.appendChild(hero);

  // optional hero action links
  if (p.links && p.links.length) {
    const lw = el("div", "detail__links");
    p.links.forEach((l) => lw.appendChild(makeLink(l.text, l.url, "btn" + (l.accent ? " btn--accent" : ""))));
    main.appendChild(lw);
  }

  (p.sections || []).forEach((sec) => {
    const s = el("div", "dsection");
    const head = el("div", "dsection__head");
    head.appendChild(el("span", "dsection__bar"));
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

  body.appendChild(main);

  // info sidebar
  const info = el("aside", "info");
  [["Role", p.role], ["Timeline", p.timeline], ["Tech Stack", p.techStack]]
    .filter(([, v]) => v)
    .forEach(([label, val]) => {
      const row = el("div", "info__row");
      row.appendChild(el("div", "info__label", esc(label)));
      row.appendChild(el("div", "info__value", esc(val)));
      info.appendChild(row);
    });
  body.appendChild(info);

  root.appendChild(body);
}

/* ======================================================================
   CONTACT SECTION (home) — socials + message form
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

  const socials = document.getElementById("socials");
  if (socials) {
    const L = PROFILE.links;
    const items = [
      L.github   && { label: "GitHub",   url: L.github,   icon: SOCIAL_ICONS.github },
      L.linkedin && { label: "LinkedIn", url: L.linkedin, icon: SOCIAL_ICONS.linkedin },
      L.email    && { label: "Email",    url: L.email,    icon: SOCIAL_ICONS.email },
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

  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = document.getElementById("cf-note");
    const setNote = (msg, ok) => {
      if (!note) return;
      note.textContent = msg;
      note.dataset.ok = ok ? "true" : "false";
    };

    const to = (PROFILE.links.email || "").replace(/^mailto:/i, "").trim();
    if (!to) {
      setNote("No contact email is configured yet.", false);
      return;
    }

    const name = document.getElementById("cf-name").value.trim();
    const from = document.getElementById("cf-email").value.trim();
    const msg = document.getElementById("cf-message").value.trim();
    if (!name || !from || !msg) {
      setNote("Please fill in your name, email, and message.", false);
      return;
    }

    const subject = `Portfolio message from ${name}`;
    const body = `${msg}\n\n— ${name}\n${from}`;
    const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setNote("Opening your email app… if nothing happens, email me directly at " + to, true);
    form.reset();
  });
}

/* ======================================================================
   FOOTER (shared)
   ====================================================================== */
function renderFooter() {
  const f = document.getElementById("footer-links");
  if (!f) return;
  const L = PROFILE.links;
  const add = (t, u) => { if (u) f.appendChild(makeLink(t, u, "")); };
  add("GitHub", L.github);
  add("LinkedIn", L.linkedin);
  add("Email", L.email);
  add("Resume", L.resume);
}

/* ======================================================================
   BOOT
   ====================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "home") renderHome();
  if (document.body.dataset.page === "project") renderProject();
  if (document.body.dataset.page === "projects") renderProjects();
  renderContact();
  renderFooter();
  initMobileNav();
});
