/* Refresh this release's copy in older editor drafts without discarding other edits. */
function migratePortfolioContent(profile, projects, defaults, savedVersion) {
  // Local FFmpeg processing can update published media independently of copy releases.
  for (const published of defaults.PROJECTS) {
    const draft = projects.find((project) => project.id === published.id);
    if (!draft || (draft.mediaVersion || 0) >= (published.mediaVersion || 0)) continue;
    draft.media = draft.media || [];
    for (const media of published.media || []) {
      const existing = draft.media.find((item) => item.mediaId === media.mediaId || item.src === media.src);
      if (existing) {
        for (const key of ["type", "mediaId", "src", "poster", "bytes"]) {
          if (media[key] != null) existing[key] = media[key];
        }
        delete existing._file;
      } else draft.media.push(JSON.parse(JSON.stringify(media)));
    }
    if (published.cardPreview) draft.cardPreview = JSON.parse(JSON.stringify(published.cardPreview));
    draft.mediaVersion = published.mediaVersion;
  }
  if ((savedVersion || 0) >= (defaults.PROFILE.contentVersion || 0)) return;

  const cloneContent = (value) => JSON.parse(JSON.stringify(value));
  profile.intro = defaults.PROFILE.intro;
  if ((savedVersion || 0) < 2) profile.pillars = cloneContent(defaults.PROFILE.pillars);

  if ((savedVersion || 0) < 1) {
    ["stack", "stats", "roleWords"].forEach((key) => {
      profile[key] = cloneContent(defaults.PROFILE[key]);
    });
    projects.forEach((project, index) => {
      // Standardize the old Photon product labels in existing project copy.
      projects[index] = JSON.parse(JSON.stringify(project).replace(
        /\bPhoton (?:PUN(?: 2)?|Fusion)\b/g, "Photon"
      ));
      const updated = projects[index];
      if (updated.id === "ruf") {
        const framework = defaults.PROJECTS.find((item) => item.id === "ruf");
        if (framework) {
          updated.sections = cloneContent(framework.sections);
          updated.techStack = framework.techStack;
        }
      }
      if (updated.id === "repel-all-ets") updated.featured = false;
    });
  }

  if ((savedVersion || 0) < 2) {
    const voodoo = projects.find((project) => project.id === "voodoo-you-chasing");
    const published = defaults.PROJECTS.find((project) => project.id === "voodoo-you-chasing");
    if (voodoo && published) {
      voodoo.media = voodoo.media || [];
      for (const media of published.media) {
        if (!voodoo.media.some((existing) => existing.mediaId === media.mediaId || existing.src === media.src)) {
          voodoo.media.push(cloneContent(media));
        }
      }
      voodoo.cardPreview = cloneContent(published.cardPreview);
    }
  }

  profile.contentVersion = defaults.PROFILE.contentVersion;
}
