# QIW Internal Ops Dashboard

The daily board the founders run sales from — QIW-branded (Heraldic Green · Crest Red · Ink Black · Cinzel + Inter), starts **blank**, and you add your own leads.

> **Internal only.** Every page is `noindex,nofollow`. Don't put it on the public marketing site.

---

## The file to use: `QIW-Dashboard.html`

**`QIW-Dashboard.html` is one self-contained file** — all the styling and code are baked in, nothing else needed. Open it, pick your name (Chase / Aidan / Hayden), and you get your own board. It remembers you on that device. Switch names any time from the top bar.

This is the file you **email to the team** or drop on a host.

### How each person uses it daily
1. Open the file → pick your name on the **"Who is using this board?"** screen.
2. Hit **+ Add lead** to add a business you're working (name, owner, stage, hook, $/mo, preview link, notes).
3. Work it: **Log touch**, **Book call**, change the **stage**, **Copy preview link** to paste into a text/email.
4. Your daily **motor** meter tracks touches + bookings against your goal.
5. Below the pipeline you get your role tools: Chase → close queue + delivery checklist + locked pricing + GitHub workflow; Aidan → first-touch queue + previews + follow-up cadence + cold-call script; Hayden → La Porte field board + previews + cold-call script.
6. Want to see how a full board looks? **Sync / Export → Load sample leads** drops in 25 demo leads. **Clear all leads** wipes back to blank.

---

## Two ways to share it

**A) Email it (simplest).** Attach `QIW-Dashboard.html` to an email to Chase, Aidan, and Hayden. Each person downloads it, opens it in their browser, and bookmarks it. Each person's board lives **in their own browser** on their own computer — so everyone keeps their own leads.
- Note: Gmail sometimes warns on `.html` attachments. If it gets blocked, zip the file first, or use option B.

**B) Host it once + email the link (best for a shared board).** Drag this whole `ops-dashboard/` folder onto <https://app.netlify.com/drop> (free, no card), or push it to a private GitHub Pages repo under `github.com/quantumintelligenceworks`. Email everyone the **link**. Now it opens on any phone or laptop, no attachment hassle — and everyone hitting the same URL on the same device shares one board.

### Keeping everyone on one board

**Live team sync (recommended).** Connect every device to one shared backend so all three see the same leads, auto-refreshing every ~15 seconds:
1. Deploy `cloud-sync.gs` once — a Google Apps Script that turns a Google Sheet into the sync server (3 clicks; steps are at the top of that file).
2. In the dashboard: **Sync / Export → Connect team sync**, paste the Web App URL + token. Do it once per device. The chip in the pipeline header flips to **Team sync on**.

It's token-protected, merges by lead so nobody clobbers anyone, and writes a readable **Leads** tab in your Sheet. If sync isn't connected the board just runs locally — nothing breaks.

**CSV fallback.** **Sync / Export → Export for Google Sheet (CSV)** dumps the board; **Import master CSV** pulls it back. (Backup JSON is there too.)

---

## What's in the folder

| File | What it is |
| --- | --- |
| **`QIW-Dashboard.html`** | **The one to use/email.** Self-contained, blank-start, with the name picker. |
| `index.html` | Hosted landing — the name picker (remembers you). |
| `chase.html` · `aidan.html` · `hayden.html` | Hosted deep-links — open straight to that person's board. |
| `qiw-ops.css` · `qiw-ops.js` | Source styling + engine (the hosted pages load these; the single file inlines them). |
| `cloud-sync.gs` | Google Apps Script for the live shared board — paste into Apps Script. |
| `DEPLOY.md` | How to host it (GitHub Pages or Netlify). |

To rebuild `QIW-Dashboard.html` after editing the source, re-inline `qiw-ops.css` + `qiw-ops.js` into the template (read both as UTF-8, e.g. `[System.IO.File]::ReadAllText(path,[Text.Encoding]::UTF8)` — PowerShell's `Get-Content` mangles the `·`/`—`/`Ψ` characters).

To change the people, their roles, pricing, scripts, or links, edit the `PEOPLE`, `PRICING`, `SOPS`, and `LINKS` blocks at the top of `qiw-ops.js`.

---

## Notes
- **Blank by default** — no leads until you add them (or load the sample set).
- **One shared pipeline per device** — all three names read/write the same board on a given browser; the name you pick just sets your view + tools.
- **Works offline** when opened directly (fonts fall back to system serif/sans without internet; everything else is inline).
