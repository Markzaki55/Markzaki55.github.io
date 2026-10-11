/* Portfolio data — local video assets prepared with scripts/optimize-video.py. */

const PROFILE = {
  "name": "Mark Zaki",
  "roleWords": [
    "Gameplay Systems",
    "FishNet",
    "Photon",
    "Combat Design",
    "AI Systems"
  ],
  "tagline": "Gameplay & Multiplayer Systems Programmer",
  "about": "I like people who care about the details as much as I do. If you're building something fun and think I could help, reach out — I always make time for a good conversation.",
  "intro": "Game systems and multiplayer programmer with 3 years of studio and freelance experience. I build scalable gameplay systems that bring your ideas to life and stay reliable as your game grows.",
  "stats": [
    {
      "value": "Unity / C#",
      "label": "Core Stack"
    },
    {
      "value": "Server-Auth",
      "label": "Multiplayer Model"
    },
    {
      "value": "Action Combat",
      "label": "Combat Focus"
    },
    {
      "value": "Data-Driven",
      "label": "Architecture"
    },
    {
      "value": "MVP / MVC",
      "label": "UI Architecture"
    }
  ],
  "pillars": [
    {
      "title": "Multiplayer Systems",
      "body": "I build server-authoritative gameplay with FishNet and Photon, from abilities and inventories to lobbies and match rules. My focus is clear ownership of game state and systems that work reliably across players."
    },
    {
      "title": "Gameplay Architecture",
      "body": "I design combat, AI, and character systems around reusable state machines and ScriptableObject configuration. Designers can tune behavior and compose features while the underlying systems stay modular and easy to extend."
    },
    {
      "title": "Backend & Live Systems",
      "body": "I connect Unity games to player accounts, purchases, leaderboards, and moderation services. My work includes live reporting and purchase-delivery flows used by active player communities."
    },
    {
      "title": "UI Frameworks & Tools",
      "body": "I build MVP and MVC interfaces that separate screen presentation from game logic, with reusable navigation and data binding. Alongside editor tools and UniTask-powered async workflows, these frameworks make everyday development easier."
    }
  ],
  "links": {
    "github": "https://github.com/Markzaki55",
    "resume": "assets/MARK_ZAKI_Resume.pdf",
    "linkedin": "https://www.linkedin.com/in/markzakimalak",
    "email": "mailto:markzakimalakzaki@gmail.com"
  },
  "stack": [
    "Unity",
    "C#",
    "FishNet",
    "Photon",
    "UniTask",
    "OpenXR",
    "XR Interaction Toolkit",
    "ScriptableObjects",
    "Animation Rigging",
    "Cinemachine 3",
    "Backend Integration",
    "UGUI",
    "UI Toolkit",
    "PlayFab",
    "Git",
    "Custom .NET Backend",
    "Performance Optimization",
    "REST APIs",
    "MVC / MVP"
  ],
  "copyright": "@ 2026 Mark Zaki",
  "layoutVersion": 4,
  "expertiseVersion": 1,
  "projectDataVersion": 1,
  "copyVersion": 3,
  "contentVersion": 4,
  "footerTagline": "Always happy to talk game systems.",
  "typeVersion": 2,
  "themeFoundationVersion": 1
};

const THEME = {
  "bg": "#101010",
  "bg2": "#101010",
  "surface": "#1b1b1b",
  "surface2": "#232323",
  "line": "#383838",
  "lineSoft": "#292929",
  "text": "#f2f2f2",
  "muted": "#ababab",
  "faint": "#7c7c7c",
  "accent": "#d0d0d0",
  "accentSoft": "#ececec",
  "accentDeep": "#777777",
  "fontSans": "\"DM Sans\", Arial, sans-serif",
  "fontHeading": "\"DM Sans\", Arial, sans-serif",
  "heroText": "#ffffff",
  "headingText": "#f2f2f2",
  "projectTitle": "#f2f2f2",
  "bodyText": "#ababab"
};

const PROJECTS = [
  {
    "id": "voodoo-you-chasing",
    "mediaVersion": 1,
    "title": "Voodoo You Chasing?",
    "subtitle": "Steam Multiplayer Game · Gameplay & Multiplayer Programmer",
    "tagline": "Voodoo You Chasing? is a freeze tag game but someone brought magic and bad decision-making. Play as a Wizard: collect glyphs to complete the ritual. Or be the Voodoo Hunter: capture them all to protect your mojo.",
    "tags": [
      "Unity",
      "FishNet",
      "Multiplayer",
      "System Design"
    ],
    "featured": true,
    "cover": {
      "type": "image",
      "label": "VOODOO",
      "sub": "You Chasing? · Party PvP",
      "src": "assets/media/voodoo-you-chasing-cover.png"
    },
    "role": "Gameplay & Multiplayer Programmer",
    "timeline": "In Development · Launching 2026",
    "techStack": "Unity, C#, FishNet, FishySteamworks, Steamworks, UniTask, Opus voice chat",
    "media": [
      {
        "type": "video",
        "mediaId": "voodoo-you-chasing-gameplay",
        "label2": "Gameplay",
        "featured": true,
        "src": "assets/media/voodoo-you-chasing-gameplay-9af76bd7b17d.mp4",
        "poster": "assets/media/voodoo-you-chasing-poster-b39d8dee97c8.jpg",
        "bytes": 33426933
      },
      {
        "type": "image",
        "mediaId": "voodoo-you-chasing-glyph-delivery",
        "src": "assets/media/voodoo-you-chasing-glyph-delivery.webp",
        "alt": "Wizards delivering a glyph at the ritual well",
        "label2": "Glyph Delivery"
      },
      {
        "type": "image",
        "mediaId": "voodoo-you-chasing-multiplayer-abilities",
        "src": "assets/media/voodoo-you-chasing-multiplayer-abilities.webp",
        "alt": "Wizards using abilities together during a multiplayer match",
        "label2": "Multiplayer Abilities"
      }
    ],
    "sections": [
      {
        "heading": "Overview",
        "body": "Voodoo You Chasing? is a 3-5 player online party game where wizards race glyphs to complete a ritual while a single Voodoo Hunter tries to catch every one of them. Built with Radiant Undead, where I was the sole programmer — owning gameplay, multiplayer networking, and technical design end to end.",
        "list": [
          "Wizard vs Voodoo Hunter roles",
          "Objective-based gameplay",
          "Permanent elimination — caught wizards spectate as spirits",
          "Match length scales with player count"
        ]
      },
      {
        "heading": "Multiplayer Architecture",
        "body": "Fully server-authoritative multiplayer on FishNet, with FishySteamworks handling Steam transport and friends-list lobby invites. Every gameplay value — movement, ability use, glyph pickups, deliveries, match results — is validated and owned by the server, so no client can influence the outcome."
      },
      {
        "heading": "Networked Ability System",
        "body": "Every ability is a modular, data-driven assembly of reusable modules that replicate over the network. The effect and status-effect systems follow the same pattern, so a single effect can apply to one character and propagate onto others. New abilities and statuses are composed from existing modules and tuned by design rather than written in code."
      },
      {
        "heading": "Generic Match Rules",
        "body": "The entire match loop runs on a generic, configurable rules framework. Round timing, objectives, scoring, and win/lose conditions are defined as rules rather than hard-coded, so the same framework adapts to new modes through tuning instead of new code."
      },
      {
        "heading": "UI Framework",
        "body": "Player-facing UI — menus, HUD, ability feedback, room flow — is built on a reusable MVP framework, with views decoupled from the state logic behind them so screens are quick to add and safe to extend as the game grows."
      },
      {
        "heading": "Voice Chat",
        "body": "Custom in-game voice chat is designed into the networked session. UniTask handles the async audio pipeline while Opus compresses the stream, keeping teams talking without a third-party voice service."
      }
    ],
    "gallery": [],
    "links": [
      {
        "text": "View on Steam",
        "url": "https://store.steampowered.com/app/5235780/Voodoo_You_Chasing/",
        "accent": true
      }
    ],
    "cardPreview": {
      "enabled": true,
      "video": {
        "type": "video",
        "src": "assets/media/voodoo-you-chasing-preview-0aecd9510e0b.mp4",
        "poster": "assets/media/voodoo-you-chasing-poster-b39d8dee97c8.jpg",
        "bytes": 947613
      }
    }
  },
  {
    "id": "al-molazem",
    "title": "Al Molazem Ans",
    "subtitle": "Shipped Mobile Game · Programming Lead",
    "tagline": "A live Saudi Arabian cop simulation game where I led gameplay programming and built scalable systems used by a large active player base.",
    "tags": [
      "Unity",
      "Leadership",
      "Live Systems",
      "Backend"
    ],
    "featured": true,
    "cover": {
      "type": "image",
      "label": "AL MOLAZEM",
      "sub": "Mobile Cop Simulation",
      "src": "assets/media/al-molazem-cover.png"
    },
    "role": "Programming Lead",
    "timeline": "Shipped / Live",
    "techStack": "Unity, C#, backend and web API integration",
    "media": [
      {
        "type": "youtube",
        "label": "GAMEPLAY",
        "sub": "Main gameplay overview or trailer",
        "label2": "Gameplay Overview",
        "featured": true,
        "id": "9RrQcm1aqts"
      },
      {
        "type": "image",
        "label": "REPORTS",
        "sub": "Traffic reporting flow and player interaction",
        "label2": "Traffic Reporting",
        "src": "assets/media/al-molazem-media-1.png"
      },
      {
        "type": "image",
        "label": "DASHBOARD",
        "sub": "Web moderation dashboard and live report data",
        "label2": "Moderation Dashboard",
        "src": "assets/media/al-molazem-media-2.png"
      },
      {
        "type": "image",
        "label": "LIVE OPS",
        "sub": "Live systems, player services, or team workflow",
        "label2": "Report Moderation",
        "src": "assets/media/al-molazem-media-3.png"
      },
      {
        "type": "image",
        "src": "assets/media/al-molazem-media-4.png",
        "label2": "Main Menu"
      }
    ],
    "sections": [
      {
        "heading": "Overview",
        "body": "Al Molazem is a shipped Saudi Arabian cop simulation game with a large active player community. I worked as Programming Lead, owning gameplay architecture while coordinating closely with design, art, backend, and engineering."
      },
      {
        "heading": "Technical Leadership",
        "body": "I led a six-person gameplay programming team, planned and reviewed core systems, mentored teammates, and kept implementation quality consistent as the game continued to grow."
      },
      {
        "heading": "Live Operations",
        "body": "I built an in-game traffic reporting system that processes more than 10,000 reports per day across a 60,000-player user base. Reports feed into a web moderation dashboard so the team can review and act on live player activity."
      },
      {
        "heading": "Commerce & Backend",
        "list": [
          "Integrated secure web purchases using Player ID with instant in-game delivery",
          "Reduced app store commission costs by 30%",
          "Integrated APIs for player accounts, purchases, and game services",
          "Resolved technical issues and optimized gameplay systems as new features were added"
        ]
      }
    ],
    "gallery": [],
    "links": [
      {
        "text": "App Store",
        "url": "https://apps.apple.com/ua/app/%D8%A7%D9%84%D9%85%D9%84%D8%A7%D8%B2%D9%85-%D8%A7%D9%86%D8%B3-%D8%A7%D9%85%D9%86-%D8%A7%D9%84%D8%B7%D8%B1%D9%82/id1636067844",
        "accent": true
      },
      {
        "text": "Google Play",
        "url": "https://play.google.com/store/apps/details?id=com.almulazimanas.almulazimanas&hl=ar"
      },
      {
        "text": "Official Website",
        "url": "https://mlzmanas.com/"
      }
    ]
  },
  {
    "id": "rd3",
    "title": "RD3",
    "subtitle": "Unannounced Multiplayer Third-Person Shooter",
    "tagline": "An unannounced multiplayer shooter with a five-mission campaign and a networked tower defense mode, developed with an 11-person team.",
    "tags": [
      "Unity",
      "Multiplayer",
      "TPS",
      "Game Systems"
    ],
    "featured": true,
    "cover": {
      "type": "image",
      "label": "RD3",
      "sub": "Unannounced Multiplayer TPS",
      "src": "assets/media/rd3-cover.png"
    },
    "role": "Gameplay & Multiplayer Programmer",
    "timeline": "Unannounced",
    "techStack": "Unity, C#, server-authoritative multiplayer, voice and text chat",
    "media": [
      {
        "type": "youtube",
        "label": "GAMEPLAY",
        "sub": "Campaign or multiplayer gameplay reel",
        "label2": "Gameplay Overview",
        "featured": true,
        "id": "YNJnOVU253Q"
      },
      {
        "type": "image",
        "src": "assets/media/rd3-media-1.png",
        "label2": "Main Menu"
      },
      {
        "type": "image",
        "src": "assets/media/rd3-media-2.png",
        "label2": ""
      },
      {
        "type": "youtube",
        "id": "kEcDNcNjdOY",
        "label2": "Network Helicopter Test"
      },
      {
        "type": "image",
        "src": "assets/media/rd3-media-4.png"
      },
      {
        "type": "image",
        "src": "assets/media/rd3-media-5.png",
        "label2": "Character Selection"
      },
      {
        "type": "image",
        "src": "assets/media/rd3-media-6.png",
        "label2": "Mission Selection"
      }
    ],
    "sections": [
      {
        "heading": "Overview",
        "body": "RD3 is an unannounced multiplayer third-person shooter with a five-mission campaign and a wave-based tower defense mode. I worked within an 11-person cross-discipline team to build networked gameplay, reusable UI architecture, and performance improvements."
      },
      {
        "heading": "Tower Defense Mode",
        "body": "I designed and built the networked tower defense mode, including enemy spawning, wave progression, rewards, and synchronized state across six enemy types and 15 increasingly difficult waves."
      },
      {
        "heading": "Multiplayer Systems",
        "list": [
          "Built the networked inventory, item pickup, and player ranking systems",
          "Adapted single-player mechanics for server authority and synchronized multiplayer state",
          "Built character selection and lobby flows with voice and text chat",
          "Implemented additional networked gameplay features, including helicopters"
        ]
      },
      {
        "heading": "UI & Performance",
        "list": [
          "Designed a reusable MVP UI framework that reduced screen-building time by 70%",
          "Streamlined navigation, transitions, and data binding for programmers and designers",
          "Reduced scene load time by 60% through memory and loading optimization"
        ]
      }
    ],
    "gallery": [],
    "links": []
  },
  {
    "id": "ruf",
    "title": "Radiant Undead Framework",
    "subtitle": "Personal Project · Third-Person Action RPG Framework",
    "tagline": "A modular Unity action RPG framework built around reusable combat, AI, traversal, animation, and multiplayer systems.",
    "tags": [
      "Unity",
      "Combat",
      "AI",
      "Architecture"
    ],
    "featured": true,
    "cover": {
      "type": "text",
      "label": "RUF",
      "sub": "Action RPG Framework"
    },
    "role": "Solo Developer / Systems Engineer",
    "timeline": "Personal Project",
    "techStack": "Unity, C#, FishNet, ScriptableObjects, Animation Rigging, Cinemachine 3, Unity Input System",
    "media": [
      {
        "type": "text",
        "label": "",
        "sub": "",
        "label2": "",
        "featured": true
      }
    ],
    "sections": [
      {
        "heading": "Overview",
        "body": "A modular Unity framework for third-person action games. I designed reusable combat, AI, traversal, and character systems around shared state machines and ScriptableObject configuration."
      },
      {
        "heading": "Architecture",
        "list": [
          "Designer-friendly configuration built around ScriptableObjects",
          "Generic StateMachine<TOwner> architecture shared by player, enemy, and UI systems",
          "Decoupled systems designed to remain independently extensible",
          "Data-driven stats, buffs, abilities, and equipment"
        ]
      },
      {
        "heading": "Combat & Character Systems",
        "list": [
          "Configurable charged attacks, parry windows, and stat scaling across seven attributes",
          "Combat feedback through impact VFX and hitstop",
          "Full hand, foot, and head IK with smooth weight transitions",
          "Vault, mantle, climb, and wall-run traversal using Motion Warping"
        ]
      },
      {
        "heading": "AI & Multiplayer",
        "list": [
          "Faction-agnostic enemy AI using blackboards, sensors, layered state machines, and priority-based decisions",
          "Coordinated group combat behavior",
          "FishNet multiplayer",
          "Server-authoritative state synchronization"
        ]
      }
    ],
    "gallery": [],
    "links": []
  },
  {
    "id": "hirequestvr",
    "title": "HireQuestVR",
    "subtitle": "Graduation Project · VR Interview Platform",
    "tagline": "A Meta Quest 3S interview simulator that combines immersive practice, dynamic AI interviews, and a mobile companion app.",
    "tags": [
      "Unity",
      "OpenXR",
      "VR",
      "AI Integration"
    ],
    "featured": true,
    "cover": {
      "type": "image",
      "label": "HIREQUEST",
      "sub": "VR Interview Platform",
      "src": "assets/media/hirequestvr-cover.png"
    },
    "role": "Unity / VR Developer",
    "timeline": "Graduation Project",
    "techStack": "Unity, C#, Meta Quest 3S, OpenXR, XR Interaction Toolkit, Photon, Flutter, DeepSeek LLM, TTS / STT, REST APIs",
    "media": [
      {
        "type": "youtube",
        "label": "VR WALKTHROUGH",
        "sub": "Complete interview flow captured on Quest 3S",
        "label2": "VR Walkthrough",
        "featured": true,
        "id": "LKFkmpykXtw"
      },
      {
        "type": "image",
        "src": "assets/media/hirequestvr-media-1.png",
        "label2": "Interview Selection"
      },
      {
        "type": "image",
        "src": "assets/media/hirequestvr-media-2.png",
        "label2": "OTP",
        "name": "OTP"
      },
      {
        "type": "image",
        "src": "assets/media/hirequestvr-media-3.png",
        "label2": "Media"
      },
      {
        "type": "image",
        "src": "assets/media/hirequestvr-media-4.png",
        "label2": "Media"
      }
    ],
    "sections": [
      {
        "heading": "Overview",
        "body": "HireQuestVR is a multi-team graduation project that combines a Meta Quest 3S application, a Flutter companion app, and an AI-driven backend. The platform gives users a repeatable way to practice interviews across different scenarios before facing a real one."
      },
      {
        "heading": "Unity & VR Experience",
        "list": [
          "Built the complete Unity and VR side of the platform",
          "Implemented World Space UI, XR hand tracking, and custom near, far, and poke interactors",
          "Built a custom VR keyboard manager and readable headset-first interface flows",
          "Structured mission and interview selection using MVC"
        ]
      },
      {
        "heading": "AI, Voice & Pairing",
        "list": [
          "Integrated a fine-tuned DeepSeek LLM backend for dynamic questions, responses, and interviewer behavior",
          "Added TTS and STT for voice-driven interview interaction",
          "Designed OTP authentication to pair the Flutter companion app with the VR headset",
          "Integrated backend services through REST APIs"
        ]
      },
      {
        "heading": "Platform Features",
        "list": [
          "Delivered more than five interview scenarios across multiple environments",
          "Added selectable interviewer personalities and character models",
          "Built leaderboard, scoring, and post-interview feedback systems",
          "Supported Arabic and English layouts with RTL and LTR localization"
        ]
      }
    ],
    "gallery": [],
    "links": []
  },
  {
    "id": "repel-all-ets",
    "title": "Repel All ETs",
    "subtitle": "Passion Project · First-Person Shooter",
    "tagline": "A pre-alpha FPS passion project with horde combat, a shotgun-driven weapon feel, and data-driven systems built with a 7-person team.",
    "tags": [
      "Unity",
      "FPS",
      "AI",
      "Weapon Systems",
      "Architecture"
    ],
    "featured": false,
    "cover": {
      "type": "text",
      "label": "RAE",
      "sub": "First-Person Shooter"
    },
    "role": "Programming Lead & Technical Designer",
    "timeline": "Pre-Alpha",
    "techStack": "Unity, C#, ScriptableObjects, layered state machines, object pooling",
    "media": [
      {
        "type": "text",
        "label": "GAMEPLAY",
        "sub": "Shotgun combat against hordes of enemies",
        "label2": "Gameplay Overview",
        "featured": true
      }
    ],
    "sections": [
      {
        "heading": "Overview",
        "body": "Repel All ETs is a pre-alpha first-person shooter passion project built around horde combat and a shotgun-driven weapon feel. I work as Programming Lead and Technical Designer within a 7-person team of designers, programmers, and artists, establishing the core gameplay foundation."
      },
      {
        "heading": "Programming Lead",
        "list": [
          "Built the layered brain: a set of state machines working together to drive character behavior",
          "Implemented data-driven character configurations and states",
          "Built a fully data-driven weapon and bullet system",
          "Created a generic object pool used across bullets, enemies, VFX, and sound effects"
        ]
      },
      {
        "heading": "Enemy AI",
        "list": [
          "Designed enemies around a priority-based decision-making system",
          "Fully data-driven and extendable for new agent types",
          "Faction-agnostic agent targeting and grouping, so new factions can be added without reworking existing agents"
        ]
      },
      {
        "heading": "Technical Designer",
        "body": "Worked as Technical Designer to bridge the gap between game designers and implementation, turning design intent into concrete, data-driven systems that designers can configure without touching code."
      }
    ],
    "gallery": [],
    "links": []
  },
  {
    "id": "faraque",
    "title": "Faraque",
    "subtitle": "2D Multiplayer Racing Platformer",
    "tagline": "A fast 2D multiplayer racing platformer with character progression, customization, abilities, and monetization systems.",
    "tags": [
      "Unity",
      "Photon",
      "Multiplayer",
      "2D",
      "Firebase"
    ],
    "featured": true,
    "cover": {
      "type": "image",
      "label": "FARAQUE",
      "sub": "Multiplayer Racing Platformer",
      "src": "assets/media/faraque-cover.png"
    },
    "role": "Gameplay & Multiplayer Programmer",
    "timeline": "",
    "techStack": "Unity, C#, Photon, Firebase",
    "media": [
      {
        "type": "youtube",
        "label": "RACE",
        "sub": "Full multiplayer race and platforming gameplay",
        "label2": "Race Gameplay",
        "featured": true,
        "id": "wZNyxJ58oNU"
      },
      {
        "type": "image",
        "label": "MULTIPLAYER",
        "sub": "Photon race synchronization",
        "label2": "Multiplayer Racing",
        "src": "assets/media/faraque-media-1.png"
      },
      {
        "type": "image",
        "label": "ABILITIES",
        "sub": "Ability pickups and race interactions",
        "label2": "Abilities & Pickups",
        "src": "assets/media/faraque-media-2.png"
      },
      {
        "type": "image",
        "label": "CUSTOMIZATION",
        "sub": "Character selection and customization flow",
        "label2": "Character Customization",
        "src": "assets/media/faraque-media-3.png"
      },
      {
        "type": "image",
        "label": "ENVIRONMENTS",
        "sub": "Different race environments and level mechanics",
        "label2": "Race Voting",
        "src": "assets/media/faraque-media-4.png"
      }
    ],
    "sections": [
      {
        "heading": "Overview",
        "body": "Faraque is a 2D multiplayer racing platformer built around competitive races, varied environments, character progression, and ability-driven moment-to-moment play."
      },
      {
        "heading": "Multiplayer Gameplay",
        "list": [
          "Built the multiplayer racing flow using Photon",
          "Created multiple race environments with varied gameplay abilities",
          "Implemented interactive ability pickup boxes during races"
        ]
      },
      {
        "heading": "Progression & Monetization",
        "list": [
          "Implemented character selection and Upgrades",
          "Integrated in-app purchases",
          "Connected progression and customization to the wider race experience"
        ]
      }
    ],
    "gallery": [],
    "links": []
  }
];
