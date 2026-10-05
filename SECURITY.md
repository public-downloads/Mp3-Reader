# Security

## What gets downloaded, and how it's checked

Audio Grabber bundles software made by others. Each piece is pinned and checked before it's used.

| Component | Source | Integrity | Authenticity |
|---|---|---|---|
| ffmpeg 9.0, LGPL shared build | github.com/BtbN/FFmpeg-Builds | SHA-256 pinned in `packaging/vendor.lock.json` | Built and uploaded by the project's GitHub Actions (not by hand). Not code-signed; the project doesn't sign builds. |
| Deno 2.9.7 | github.com/denoland/deno | SHA-256 pinned in `packaging/vendor.lock.json` | Code-signed by **Deno Land Inc.**, with GitHub's signed release attestation |
| Python packages (yt-dlp, Flask, …) | PyPI | Exact versions + SHA-256 in `requirements.lock`, installed with `--require-hashes` | yt-dlp, yt-dlp-ejs, Flask/Werkzeug/Jinja2, requests, urllib3, certifi and others carry PyPI provenance records naming their official GitHub repositories |
| Python runtime | python.org (your install) | | Code-signed by the Python Software Foundation |

Checks run on 2026-10-05:
- **Python packages:** all 27 installed packages matched their recorded file hashes (about 3,700 files).
- **Known vulnerabilities:** none of the installed versions has an entry in the OSV database.
- **Antivirus:** Bitdefender's real-time protection was active and up to date while every file was downloaded and unpacked, and flagged nothing. An explicit right-click scan of the folder is still worth doing.

The build refuses any tool or package whose checksum differs from the pinned one, even if the upstream project replaces the file. Updating the pins is a deliberate step:
- `packaging/build.py --refresh-vendor` only accepts files uploaded by the project's own CI.
- `packaging/lock_requirements.py` re-locks the Python packages.

## Updating yt-dlp

**Update yt-dlp** contacts PyPI only when you choose it. A release is installed only if:
1. its SHA-256 matches PyPI's listing, **and**
2. PyPI's provenance record shows it was published by **github.com/yt-dlp/yt-dlp** (and **yt-dlp/ejs** for the YouTube solver) through Trusted Publishing.

A release uploaded with a stolen token, or a look-alike package, is refused. In the packaged app, updates go to `%APPDATA%\AudioGrabber\packages` and are used only if they're newer than the bundled copy.

## Running untrusted content safely

- **YouTube's challenge code** runs in **Deno** with no permissions (no files, network or programs), or in **Node 22+** with its permission model. QuickJS was dropped because it has no sandbox.
- **File names** come from the website. They're sanitized, playlist folder names are cleaned separately, and any finished file outside the download folder is deleted. This was tested against titles like `..`, `C:\Windows\…`, `../../`, `CON` and NUL bytes.
- **Links:** only `http(s)` links are accepted (`file://`, `javascript:` and others are refused).
- **Media files** are processed by ffmpeg. Keep it current by rebuilding with newer pinned builds now and then.

## The parts that listen for commands

- **Desktop app:** opens no network port.
- **Web app** (`--web` / `start-webapp.bat`):
  - binds to `127.0.0.1` only;
  - rejects other host names (DNS rebinding) and other websites' origins;
  - accepts only JSON POSTs, which blocks cross-site form submissions;
  - serves only files from its own downloads.
- **Firefox helper:**
  - Firefox only lets the extension with ID `audio-grabber@public-downloads` start it. That ID is registered to the publisher's Mozilla account, so no other add-on can be signed with it.
  - Even so, it accepts only harmless setting changes (format, quality, playlist, cover art). The download folder and program paths can be changed only in the app itself, so a rogue add-on can't make it run another program.
  - Messages over 1 MB are refused.

## Known limits

- The bundled ffmpeg isn't code-signed. Its trust rests on the pinned checksum and the project's public CI.
- `AudioGrabber.exe` itself is unsigned, so Windows SmartScreen may warn on first start. Code-signing it requires buying a certificate.
- Settings and yt-dlp updates live in your user profile. Any program already running as your Windows user could change them, as with any desktop app.

## Reporting

If you find a security problem, please open a private security advisory on the repository rather than a public issue.
