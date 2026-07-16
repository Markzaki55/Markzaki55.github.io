/* =========================================================================
   PORTFOLIO DATA - Mark Zaki
   -------------------------------------------------------------------------
   This is the ONLY file you normally edit.
   - Add a project: copy a { ... } block inside PROJECTS and edit it.
   - Add media:     drop files in /assets/media/ and reference the path.
   - Add a link:    use the helper shape { text: "...", url: "..." } where noted.
   ========================================================================= */

const PROFILE = {
  name: "Mark Zaki",
  // The rotating words after "Multiplayer ." in the hero. Edit freely.
  roleWords: ["Gameplay Systems", "Netcode", "Combat Design", "AI Systems"],
  tagline: "Gameplay & Multiplayer Systems Engineer",

  // Short, personal "about" line shown in the contact section. One or two
  // sentences. Keep it human, not a resume repeat.
  about:
    "I'm a gameplay and multiplayer engineer based in Egypt. I care about how " +
    "a hit feels, whether a fight is fair, and writing code that doesn't fall " +
    "apart when the next feature shows up. I'd rather ship something solid than " +
    "polish something forever.",

  // Short hero paragraph. Keep it punchy.
  intro:
    "I build the systems underneath a game: server-authoritative multiplayer, " +
    "Souls-like combat that feels responsive, and the kind of modular setup " +
    "that lets you add a feature without breaking three others. Most of my work " +
    "lives in Unity and C#, and I like turning rough gameplay ideas into clean " +
    "systems other people can actually build on.",

  // Stat strip under the intro. Keep to 3-4 for balance. Remove if you want.
  stats: [
    { value: "Unity / C#", label: "Core Stack" },
    { value: "Server-Auth", label: "Multiplayer Model" },
    { value: "Souls-like", label: "Combat Focus" },
    { value: "Data-Driven", label: "Architecture" },
  ],

  // What I do - the capability cards. Add/remove freely.
  pillars: [
    {
      title: "Multiplayer Architecture",
      body:
        "Server-authoritative netcode with Photon PUN and Fishnet. Class " +
        "switching, avatar rebinding, weapon reparenting, and state sync that " +
        "holds together when more than a couple of players show up.",
    },
    {
      title: "Combat Systems",
      body:
        "Souls-like and Sekiro-style combat: deflect and clash VFX, hitstop, " +
        "charged attacks, stamina economies, and the small frame-level details " +
        "that decide whether a hit feels good.",
    },
    {
      title: "Enemy AI",
      body:
        "Layered AI built on blackboards and ScriptableObject-driven roles and " +
        "factions, with priority-based decision making, combat-ring slotting, " +
        "and custom steering for enemies that fly.",
    },
    {
      title: "Modular Architecture",
      body:
        "SOLID, inspector-configured, ScriptableObject-heavy systems. Generic " +
        "state machines, event channels, and assembly definitions, set up so " +
        "the next feature drops in without disturbing the last one.",
    },
  ],

  // Hero buttons. Leave a url as "" to hide that button.
  links: {
    github: "https://github.com/MarkZaki",
    resume: "assets/resume.pdf",
    linkedin: "https://linkedin.com/in/yourusername",
    email: "mailto:markzakimalakzaki@gmail.com",
  },

  // Tech tag cloud.
  stack: [
    "Unity", "C#", "Photon PUN", "Fishnet", "Multiplayer Netcode",
    "ScriptableObjects", "State Machines", "Animation Rigging", "Cinemachine 3",
    "NavMesh & Steering", "Unity Input System", "UI Toolkit", "uGUI",
    "Addressables", "Git LFS", "C++", "VR / OpenXR", "Quest 3S",
  ],

  // Footer copyright line. Use {year} as a placeholder for the current year.
  copyright: "© {year} Mark Zaki. Built with vanilla HTML, CSS & JS.",
};

/* -------------------------------------------------------------------------
   THEME — site colours. Edit here, or use admin.html to pick them visually.
   These map onto the CSS variables in style.css at load time, so changing a
   value here re-skins the whole site. (--glow is derived from `accent`.)
   ------------------------------------------------------------------------- */
const THEME = {
  bg:         "#0b0c0d",   // page background
  bg2:        "#0d0e0f",   // alt band background
  surface:    "#121315",   // card surface
  surface2:   "#17191b",   // hover surface
  line:       "#202225",   // hairline borders
  lineSoft:   "#17181a",   // fainter borders
  text:       "#ECECE7",   // primary text
  muted:      "#9a9b95",   // secondary text
  faint:      "#62635e",   // captions / eyebrows
  accent:     "#E8A33D",   // warm amber / ember
  accentSoft: "#f0bd6e",   // lighter amber
  accentDeep: "#a86c1f",   // amber on dark hover
};

/* -------------------------------------------------------------------------
   PROJECTS
   -------------------------------------------------------------------------
   Required per project: id, title, tagline, tags, cover.
   id        - unique, url-safe (used in link: project.html?id=THIS)
   subtitle  - faint eyebrow above the big title (optional)
   tagline   - one line shown on the card
   tags      - small labels on card + detail page
   cover     - card thumbnail: a media object OR a "text" placeholder

   Detail page also uses: role, timeline, techStack, media, sections,
   and optional links (buttons like GitHub / Play / Watch).

   ---- MEDIA OBJECT shapes (use anywhere media is accepted) ----
     { type: "image",   src: "assets/media/shot.png", alt: "..." }
     { type: "video",   src: "assets/media/clip.mp4", poster: "assets/media/poster.png" }
     { type: "youtube", id: "VIDEO_ID" }
     { type: "embed",   src: "https://itch.io/embed/...", title: "Play" }   // any iframe URL
     { type: "text",    label: "RUF", sub: "Radiant Undead Framework" }

   ---- MEDIA GALLERY (Unity Asset Store style) ----
     Add a `media: [ ... ]` array to a project to get a big main viewer with a
     thumbnail strip below it (featured video + extra videos, images, embeds).
       media: [
         { type: "youtube", id: "VIDEO_ID", featured: true, label: "Combat Demo" },
         { type: "image",   src: "assets/media/shot1.png", alt: "Boss fight" },
         { type: "video",   src: "assets/media/clip.mp4", poster: "assets/media/poster.png", label: "AI" },
         { type: "embed",   src: "https://...", title: "Playable build" },
       ]
     - `featured: true` marks the item shown first (otherwise the first item is).
     - `label` is the short caption under the main viewer / on hover (optional).
     - If you don't add `media`, the page falls back to `hero` + `gallery` below.

   ---- SECTION shapes (inside sections: []) ----
     { heading: "The Goal", body: "paragraph...\n\nsecond paragraph..." }
     { heading: "Features", list: ["point one", "point two", "point three"] }
     A section may ALSO carry its own media:  media: { type:"image", src:"..." }

   ---- LINKS (hero buttons on the detail page, optional) ----
     links: [ { text: "View on GitHub", url: "https://..." },
              { text: "Watch Demo", url: "https://...", accent: true } ]

   ---- FEATURED ----
     featured: true   -> shows on the home page (Selected Work) + the All
                        Projects page, with a "Featured" badge.
     featured: false  -> only appears on the All Projects page.
                        Omitting the field is the same as false.
   ------------------------------------------------------------------------- */

const PROJECTS = [
  {
    id: "ruf",
    title: "Radiant Undead",
    subtitle: "Action RPG · Combat · AI · Systems Architecture",
    tagline:
      "A modular Souls-like action RPG framework I'm building solo in Unity, with combat, AI, IK, and traversal designed as reusable systems.",
    tags: ["Unity", "C#", "Souls-like", "Systems Design"],
    featured: true,

    cover: { type: "text", label: "RUF", sub: "Radiant Undead Framework" },

    role: "Solo Developer - Systems & Combat",
    timeline: "Ongoing",
    techStack: "Unity, C#, ScriptableObjects, Animation Rigging, Cinemachine 3",

    // Unity Asset Store style media gallery. Drop real files in /assets/media/
    // and a YouTube id below, then this turns into a featured viewer + thumbs.
    media: [
      { type: "text", label: "RADIANT UNDEAD", sub: "Featured combat reel goes here", featured: true, label2: "Combat Reel" },
      { type: "text", label: "AI", sub: "Enemy AI breakdown clip" },
      { type: "text", label: "IK", sub: "Procedural foot & hand IK" },
      { type: "text", label: "SHOT", sub: "Screenshot" },
      // Real examples once you have footage:
      // { type: "youtube", id: "VIDEO_ID", featured: true, label: "Combat Reel" },
      // { type: "video",   src: "assets/media/ruf-ai.mp4", poster: "assets/media/ruf-ai.png", label: "Enemy AI" },
      // { type: "image",   src: "assets/media/ruf-boss.png", alt: "Boss fight" },
    ],

    links: [
      { text: "View on GitHub", url: "https://github.com/MarkZaki/ruf" },
    ],

    sections: [
      {
        heading: "Overview",
        body:
          "Radiant Undead is my long-running portfolio project: a modular, " +
          "data-driven Souls-like that I built to be reused. Every major " +
          "system, whether it's combat, enemy AI, procedural IK, or traversal, " +
          "lives in its own self-contained namespace so I can drop it into " +
          "another project without dragging the whole game along with it.",
      },
      {
        heading: "Combat",
        body:
          "Sekiro-style sword clash and deflect VFX, hitstop on impact, charged " +
          "attacks, and a stamina economy that actually limits you. I was going " +
          "for weight and readability, so every exchange reads clearly and feels " +
          "like a decision rather than button mashing.",
      },
      {
        heading: "Enemy AI",
        list: [
          "Generic EnemyAgent plus a Blackboard data container",
          "ScriptableObject faction and role hierarchy with a relationship database",
          "Priority-based decision evaluator and runner",
          "CombatRing slot system so enemies attack in turns instead of swarming",
          "Custom steering (not NavMesh) for open-air flying enemies",
          "Idle behaviours: patrol, guard, box, and group patrol with alert states",
        ],
      },
      {
        heading: "Animation & IK",
        body:
          "A procedural FootIK system that handles height transitions cleanly " +
          "and ramps in and out with SmoothDamp, plus a HandIK system with " +
          "reach clamping and per-frame offset control. Animation Rigging " +
          "multi-aim constraints handle look-at and aiming on top of that.",
      },
    ],

    gallery: [],
  },

  {
    id: "hirequest",
    title: "HireQuest",
    subtitle: "VR · AI · Graduation Project",
    tagline:
      "A VR interview simulator built in Unity with an AI backend, so you can practice real interviews on a Quest 3S before the real thing.",
    tags: ["Unity", "VR", "OpenXR", "AI Backend"],
    featured: true,

    cover: { type: "text", label: "HIREQUEST", sub: "VR Interview Simulation" },

    role: "Gameplay & VR Programmer",
    timeline: "Graduation Project",
    techStack: "Unity, C#, OpenXR, Quest 3S, AI Backend",

    media: [
      { type: "text", label: "HIREQUEST", sub: "VR walkthrough video", featured: true, label2: "Walkthrough" },
      { type: "text", label: "UI", sub: "World-space UI on Quest 3S" },
      { type: "text", label: "SHOT", sub: "In-headset capture" },
    ],

    sections: [
      {
        heading: "The Goal",
        body:
          "HireQuest drops you into a realistic VR interview run by an AI " +
          "backend that asks questions and reacts in real time. The idea was a " +
          "low-stakes place to practice, so you can get the nerves out before " +
          "you're sitting across from an actual person.",
      },
      {
        heading: "What I Built",
        list: [
          "XR Origin setup with Near-Far and Poke interactors",
          "World-space UI conversion so text stays readable on Quest 3S",
          "VRFollowUI and a custom VRKeyboardManager",
          "Fixes for the OpenXR controller rotation bug and the OpenGLES3 build issue",
        ],
      },
    ],

    gallery: [],
  },

  {
    id: "valheim-ai-study",
    title: "Enemy AI Research",
    subtitle: "AI Behaviour · Reverse-Engineering · Documentation",
    tagline:
      "Notes and breakdowns of enemy AI from Valheim and Dark Souls, turned into a reusable state-machine architecture.",
    tags: ["AI Design", "State Machines", "Research"],

    cover: { type: "text", label: "AI STUDY", sub: "Valheim · Dark Souls" },

    role: "Research & Implementation",
    timeline: "Ongoing",
    techStack: "Unity, C#, Behaviour Analysis",

    hero: { type: "text", label: "ENEMY AI", sub: "Behaviour Research into Architecture" },

    sections: [
      {
        heading: "The Idea",
        body:
          "Good enemy AI is mostly just readable state transitions. I pull apart " +
          "how shipped games handle engaging, flanking, and backing off, then " +
          "boil those patterns down into named states like Disengage and Breakoff " +
          "that feed my EnemyAIBlackboard and state machine.",
      },
    ],

    gallery: [],
  },

  {
    id: "foot-ik",
    title: "Procedural Foot IK",
    subtitle: "Animation Rigging · Procedural Animation",
    tagline:
      "A procedural foot-placement system that handles height transitions cleanly and ramps in and out with SmoothDamp.",
    tags: ["Unity", "C#", "Animation Rigging", "IK"],
    featured: false,

    cover: { type: "text", label: "FOOT IK", sub: "Procedural Placement" },

    role: "Systems Programmer",
    timeline: "Sub-system of Radiant Undead",
    techStack: "Unity, C#, Animation Rigging",

    hero: { type: "text", label: "FOOT IK", sub: "Procedural Foot Placement" },

    sections: [
      {
        heading: "Overview",
        body:
          "Foot IK that plants cleanly on uneven ground without the pop you " +
          "usually get when the rig enables or disables mid-stride. Height " +
          "transitions are smoothed and the rig ramps in with a SmoothDamp, so " +
          "contact reads as weight instead of a snap.",
      },
    ],

    gallery: [],
  },

  {
    id: "combat-ring",
    title: "Combat Ring Slot System",
    subtitle: "AI · Multiplayer · Encounter Design",
    tagline:
      "A slot system that keeps enemies attacking in turns instead of all piling on at once, for fights that stay fair and readable.",
    tags: ["Unity", "C#", "AI", "Combat Design"],
    featured: false,

    cover: { type: "text", label: "COMBAT RING", sub: "AI Slot System" },

    role: "Systems Programmer",
    timeline: "Sub-system of Radiant Undead",
    techStack: "Unity, C#, AI Framework",

    hero: { type: "text", label: "COMBAT RING", sub: "Enemy Attack Slotting" },

    sections: [
      {
        heading: "Overview",
        body:
          "Enemies claim attack slots around a target, so only a set number can " +
          "engage at any one time. Slots free up when an enemy disengages or " +
          "dies, which keeps group fights fair and readable instead of turning " +
          "into a pile-on.",
      },
    ],

    gallery: [],
  },
];
