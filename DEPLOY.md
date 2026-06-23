# Deploy the QIW Ops Dashboard

Self-contained static site — no build step. Pick one hosting option, then turn on the shared board.

---

## Option A — GitHub Pages (org-hosted)

This folder is already a git repo with one commit on `main`. To publish:

1. Create an **empty private** repo under the org (no README/license):
   `https://github.com/new` → owner `quantumintelligenceworks`, name `qiw-ops`.
2. In a terminal **in this folder**, point it at that repo and push:
   ```
   git remote add origin https://github.com/quantumintelligenceworks/qiw-ops.git
   git push -u origin main
   ```
3. On GitHub: repo **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. ~1 minute later it is live at `https://quantumintelligenceworks.github.io/qiw-ops/`
   - Team landing (name picker): `/`
   - Single-file version: `/QIW-Dashboard.html`

> Pages URLs are public even from a private repo, but the page holds **no** client data — leads live in your token-protected sync sheet and each browser's local storage. Keep the sync URL + token private.

## Option B — Netlify Drop (no git, ~30 seconds)

1. Go to `https://app.netlify.com/drop`
2. Drag this whole `ops-dashboard` folder onto the page.
3. Site settings → Change site name → `qiw-ops`. Live at `https://qiw-ops.netlify.app`.

---

## Then turn on the shared board (one time)

1. Deploy the sync backend — open `cloud-sync.gs` and follow the 5 steps at the top (create a Google Sheet → paste the script → set a token → Deploy as Web app → copy the `/exec` URL).
2. In the dashboard: **Sync / Export → Connect team sync** → paste the Web App URL + token.
3. Do step 2 once on each person's device (or each person on the hosted link). The chip in the pipeline header flips to **Team sync on**, and all three share one live board (auto-refreshes every ~15s).

Email each person the link (Option A/B) or the `QIW-Dashboard.html` file, plus the sync URL + token.
