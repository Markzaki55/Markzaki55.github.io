/* Apply the small admin draft theme before CSS paints the page. */
(function () {
  "use strict";

  var THEME_KEY = "mzPortfolioDraftTheme";
  var THEME_VARS = {
    bg: "--bg",
    surface: "--surface",
    surface2: "--surface-2",
    line: "--line",
    text: "--text",
    muted: "--muted",
    faint: "--faint",
    accent: "--accent",
    accentSoft: "--accent-soft",
    accentDeep: "--accent-deep",
    fontSans: "--font-sans",
    fontHeading: "--font-heading",
    heroText: "--hero-text",
    headingText: "--heading-text",
    projectTitle: "--project-title",
    bodyText: "--body-text"
  };

  try {
    var theme = JSON.parse(localStorage.getItem(THEME_KEY) || "null");
    if (!theme || typeof theme !== "object") return;

    var root = document.documentElement.style;
    Object.keys(THEME_VARS).forEach(function (key) {
      if (typeof theme[key] === "string" && theme[key].trim()) {
        root.setProperty(THEME_VARS[key], theme[key]);
      }
    });

    if (typeof theme.bg === "string") {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = theme.bg;
    }
  } catch (_) {
    try { localStorage.removeItem(THEME_KEY); } catch (_) {}
  }
})();
