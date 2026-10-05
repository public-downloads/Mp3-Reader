"use strict";

// Point the download links at this site's GitHub repository. On https://OWNER.github.io/REPO/ the
// repository is read from the address; on a custom domain, set <meta name="github-repo" content="owner/repo">.
// The app download always goes to the newest release (github.com/OWNER/REPO/releases/latest/download/…).
(function () {
  function findRepo() {
    const meta = document.querySelector('meta[name="github-repo"]');
    if (meta && /^[\w.-]+\/[\w.-]+$/.test(meta.content)) return meta.content;
    const host = location.hostname;
    if (!host.endsWith(".github.io")) return null;
    const owner = host.slice(0, -".github.io".length);
    const first = location.pathname.split("/").filter(Boolean)[0];
    return `${owner}/${first || host}`;
  }

  const repo = findRepo();
  if (repo) {
    const base = `https://github.com/${repo}`;
    for (const link of document.querySelectorAll("[data-release]")) {
      link.href = `${base}/releases/latest/download/${link.dataset.release}`;
    }
    for (const link of document.querySelectorAll("[data-repo-path]")) {
      link.href = base + link.dataset.repoPath;
    }
  }

  // The extension installs straight from this page in Firefox; other browsers would only download the file.
  if (!/firefox/i.test(navigator.userAgent)) {
    const hint = document.getElementById("xpi-hint");
    if (hint) hint.textContent = "Open this page in Firefox (140 or newer) to install the extension.";
  }
})();
