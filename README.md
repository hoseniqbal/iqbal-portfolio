# Iqbal Hossen portfolio

Static site on Vercel. All content lives in `data/content.json`; `tools/build.mjs` turns it into `dist/` on every deploy.

## Edit content
- Easiest: open `/admin/` on the live site and sign in with a GitHub personal access token. Saving commits to this repo and Vercel redeploys in about a minute.
- Or edit `data/content.json` directly on GitHub.

Local build: `node tools/build.mjs`
