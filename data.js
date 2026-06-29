/* =========================================================================
   PORTFOLIO DATA — Mark Zaki
   -------------------------------------------------------------------------
   This is the ONLY file you normally edit.
   • Add a project: copy a { ... } block inside PROJECTS and edit it.
   • Add media:     drop files in /assets/media/ and reference the path.
   • Add a link:    use the helper shape { text: "...", url: "..." } where noted.
   ========================================================================= */

const PROFILE = {
  name: "Mark Zaki",
  // The rotating words after "Multiplayer ·" in the hero. Edit freely.
  roleWords: ["Gameplay Systems", "Netcode", "Combat Design", "AI Systems"],
  tagline: "Gameplay & Multiplayer Systems Engineer",

  // Short, personal "about" line shown in the contact section. One or two
  // sentences — keep it human, not a résumé repeat.
  about:
    "Gameplay & multiplayer engineer based in Egypt. I care about the feel " +
    "of a hit, the fairness of an encounter, and code that survives the next " +
    "feature. Always happier shipping than perfecting.",

  // Short hero paragraph. Keep it punchy.
  intro:
    "I build the systems that make games feel alive — server-authoritative " +
    "multiplayer, responsive Souls-like combat, and the modular, data-driven " +
    "architecture that holds it all together. I specialize in turning messy " +
    "gameplay ideas into clean, extensible C# systems in Unity.",

  // Stat strip under the intro. Keep to 3–4 for balance. Remove if you want.
  stats: [
    { value: "Unity / C#", label: "Core Stack" },
    { value: "Server-Auth", label: "Multiplayer Model" },
    { value: "Souls-like", label: "Combat Focus" },
    { value: "Data-Driven", label: "Architecture" },
  ],

  // What I do — the capability cards. Add/remove freely.
  pillars: [
    {
      title: "Multiplayer Architecture",
      body:
        "Server-authoritative netcode with Photon PUN and Fishnet — class " +
        "switching, avatar rebinding, weapon reparenting, and state sync that " +
        "stays consistent under load.",
    },
    {
      title: "Combat Systems",
      body:
        "Souls-like and Sekiro-style combat: deflect/clash VFX, hitstop, " +
        "charged attacks, stamina economies, and the frame-feel that makes a " +
        "hit land right.",
    },
    {
      title: "Enemy AI",
      body:
        "Layered AI frameworks — blackboards, ScriptableObject-driven roles " +
        "and factions, priority decision evaluators, combat-ring slotting, and " +
        "custom steering for flying enemies.",
    },
    {
      title: "Modular Architecture",
      body:
        "SOLID, inspector-configured, ScriptableObject-heavy systems. Generic " +
        "state machines, event channels, assembly definitions — built so the " +
        "next feature drops in without breaking the last.",
    },
  ],

  // Hero buttons. Leave a url as "" to hide that button.
  links: {
    github: "https://github.com/yourusername",
    resume: "assets/resume.pdf",
    linkedin: "https://linkedin.com/in/yourusername",
    email: "mailto:you@example.com",
  },

  // Tech tag cloud.
  stack: [
    "Unity", "C#", "Photon PUN", "Fishnet", "Multiplayer Netcode",
    "ScriptableObjects", "State Machines", "Animation Rigging", "Cinemachine 3",
    "NavMesh & Steering", "Unity Input System", "UI Toolkit", "uGUI",
    "Addressables", "Git LFS", "C++", "VR / OpenXR", "Quest 3S",
  ],
};

/* -------------------------------------------------------------------------
   PROJECTS
   -------------------------------------------------------------------------
   Required per project: id, title, tagline, tags, cover.
   id        — unique, url-safe (used in link: project.html?id=THIS)
   subtitle  — faint eyebrow above the big title (optional)
   tagline   — one line shown on the card
   tags      — small labels on card + detail page
   cover     — card thumbnail: a media object OR a "text" placeholder

   Detail page also uses: role, timeline, techStack, hero, sections, gallery,
   and optional links (buttons like GitHub / Play / Watch).

   ---- MEDIA OBJECT shapes (use anywhere media is accepted) ----
     { type: "image",   src: "assets/media/shot.png", alt: "..." }
     { type: "video",   src: "assets/media/clip.mp4", poster: "assets/media/poster.png" }
     { type: "youtube", id: "VIDEO_ID" }
     { type: "text",    label: "RUF", sub: "Radiant Undead Framework" }

   ---- SECTION shapes (inside sections: []) ----
     { heading: "The Goal", body: "paragraph...\n\nsecond paragraph..." }
     { heading: "Features", list: ["point one", "point two", "point three"] }
     A section may ALSO carry its own media:  media: { type:"image", src:"..." }

   ---- LINKS (hero buttons on the detail page, optional) ----
     links: [ { text: "View on GitHub", url: "https://..." },
              { text: "Watch Demo", url: "https://...", accent: true } ]

   ---- FEATURED ----
     featured: true   → shows on the home page (Selected Work) + the All
                        Projects page, with a "Featured" badge.
     featured: false  → only appears on the All Projects page.
                        Omitting the field is the same as false.
   ------------------------------------------------------------------------- */

const PROJECTS = [
  {
    id: "ruf",
    title: "Radiant Undead",
    subtitle: "Action RPG · Combat · AI · Systems Architecture",
    tagline:
      "A modular Souls-like action RPG framework built solo in Unity — combat, AI, IK, and traversal as reusable systems.",
    tags: ["Unity", "C#", "Souls-like", "Systems Design"],
    featured: true,

    cover: { type: "text", label: "RUF", sub: "Radiant Undead Framework" },

    role: "Solo Developer — Systems & Combat",
    timeline: "Ongoing",
    techStack: "Unity, C#, ScriptableObjects, Animation Rigging, Cinemachine 3",

    hero: { type: "text", label: "RADIANT UNDEAD", sub: "Modular Action-RPG Framework" },
    // Swap for a real clip when ready:
    // hero: { type: "video", src: "assets/media/ruf.mp4", poster: "assets/media/ruf.png" },

    links: [
      { text: "View on GitHub", url: "https://github.com/yourusername/ruf" },
    ],

    sections: [
      {
        heading: "Overview",
        body:
          "Radiant Undead is my long-running portfolio project: a modular, " +
          "data-driven Souls-like built from the ground up to be reusable. " +
          "Every major system — combat, enemy AI, procedural IK, traversal — " +
          "is its own self-contained namespace designed to drop into any project.",
      },
      {
        heading: "Combat",
        body:
          "Sekiro-style sword clash and deflect VFX, hitstop on impact, charged " +
          "attacks, and a stamina-driven economy. The goal is weight and " +
          "readability — every exchange should feel deliberate.",
      },
      {
        heading: "Enemy AI",
        list: [
          "Generic EnemyAgent + Blackboard data container",
          "ScriptableObject faction & role hierarchy with relationship database",
          "Priority-based decision evaluator and runner",
          "CombatRing slot system so enemies attack in turns, not swarms",
          "Custom steering (not NavMesh) for open-air flying enemies",
          "Idle behaviours: patrol, guard, box, group patrol with alert states",
        ],
      },
      {
        heading: "Animation & IK",
        body:
          "A procedural FootIK system with clean height-transition handling and " +
          "SmoothDamp enable/disable, plus a HandIK system with reach-clamping " +
          "and per-frame offset control. Animation Rigging multi-aim constraints " +
          "for look-at and aiming.",
      },
    ],

    gallery: [
      // { type: "image", src: "assets/media/ruf-combat.png", alt: "Combat" },
      // { type: "youtube", id: "VIDEO_ID" },
    ],
  },

  {
    id: "hirequest",
    title: "HireQuest",
    subtitle: "VR · AI · Graduation Project",
    tagline:
      "A VR interview simulation built in Unity with an AI backend — practice real interviews on Quest 3S.",
    tags: ["Unity", "VR", "OpenXR", "AI Backend"],
    featured: true,

    cover: { type: "text", label: "HIREQUEST", sub: "VR Interview Simulation" },

    role: "Gameplay & VR Programmer",
    timeline: "Graduation Project",
    techStack: "Unity, C#, OpenXR, Quest 3S, AI Backend",

    hero: { type: "text", label: "HIREQUEST", sub: "VR Interview Simulation · Quest 3S" },

    sections: [
      {
        heading: "The Goal",
        body:
          "HireQuest puts users inside a realistic VR interview, driven by an AI " +
          "backend that asks questions and responds in real time — a safe space " +
          "to practice before the real thing.",
      },
      {
        heading: "What I Built",
        list: [
          "XR Origin setup with Near-Far and Poke interactors",
          "World-Space UI conversion for Quest 3S readability",
          "VRFollowUI and a custom VRKeyboardManager",
          "Resolved OpenXR controller rotation bugs and the OpenGLES3 build fix",
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
      "Documenting enemy AI behaviour from Valheim and Dark Souls and translating it into a reusable state-machine architecture.",
    tags: ["AI Design", "State Machines", "Research"],

    cover: { type: "text", label: "AI STUDY", sub: "Valheim · Dark Souls" },

    role: "Research & Implementation",
    timeline: "Ongoing",
    techStack: "Unity, C#, Behaviour Analysis",

    hero: { type: "text", label: "ENEMY AI", sub: "Behaviour Research → Architecture" },

    sections: [
      {
        heading: "The Idea",
        body:
          "Great enemy AI is mostly readable state transitions. I break down how " +
          "shipped games handle engagement, flanking, and disengagement, then " +
          "codify the patterns into canonical states like Disengage and Breakoff " +
          "for my EnemyAIBlackboard and state machine.",
      },
    ],

    gallery: [],
  },

  {
    id: "foot-ik",
    title: "Procedural Foot IK",
    subtitle: "Animation Rigging · Procedural Animation",
    tagline:
      "A procedural foot-placement system with clean height-transition handling and SmoothDamp enable/disable.",
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
          "Foot IK that plants cleanly on uneven ground without the pop that " +
          "usually comes from enabling/disabling the rig mid-stride. Height " +
          "transitions are smoothed and the rig ramps in with a SmoothDamp " +
          "so contact reads as weight, not a snap.",
      },
    ],

    gallery: [],
  },

  {
    id: "combat-ring",
    title: "Combat Ring Slot System",
    subtitle: "AI · Multiplayer · Encounter Design",
    tagline:
      "A slotting system that keeps enemies attacking in turns instead of swarming — fair, readable encounters.",
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
          "Enemies claim attack slots around a target so only a bounded number " +
          "engage at once. Slots release on disengage or death, keeping group " +
          "combat fair and readable instead of a swarm.",
      },
    ],

    gallery: [],
  },
];
