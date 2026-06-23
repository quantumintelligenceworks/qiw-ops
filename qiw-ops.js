/* QIW Internal Ops — shared engine + data
   One pipeline, three role-tailored views (chase/aidan/hayden).
   Data persists in localStorage (shared across the 3 pages on the same host)
   with a window.storage fallback for sandboxed hosts. Export CSV to sync the Google Sheet. */
(function () {
  "use strict";

  // ---------------- company facts (from QIW source-of-truth docs) ----------------
  var LINKS = {
    site: "https://quantumintelligenceworks.github.io/QIW---Site",
    github: "https://github.com/quantumintelligenceworks",
    previews: "https://qiw-previews.netlify.app",
    email: "quantumintelligenceworks@gmail.com",
    book: "https://calendly.com/quantumintelligenceworks",
    tracker: "",
    stripe: "https://dashboard.stripe.com/payments",
    phone1: "(219) 314-9939",
    phone2: "(219) 323-5295",
    addr: "2271 Longcommon Rd, Portage, IN 46368"
  };

  var PRICING = {
    rows: [
      ["Website Build — Starter", "$1,500"],
      ["Website Build — Standard (default)", "$3,000"],
      ["Website Build — Plus", "$5,000"],
      ["Tech Infrastructure — Audit + Roadmap", "$1,500"],
      ["Tech Infrastructure — + Implement-3", "$7,500"],
      ["AI Automation Agent", "$2,500+"],
      ["Retainer — Starter / Growth / Scale", "$500 / $1,250 / $2,500 /mo"]
    ],
    terms: "50% deposit to start · Stripe links · annual prepay = 2 months free · discount on scope, never on rate.",
    deprecated: "Never quote the old $200 / $250 / $500 tiers."
  };

  var SOPS = {
    leadWith: "Lead with a free first build → one ask = the 15-minute call → then flag the team.",
    firstTouch: [
      "One business per email. One ask per message: a 15-minute call.",
      "Under 120 words. First line personalized to that business.",
      "No emojis. No exclamation marks. No hype. Quote deliverables, never price.",
      "Any reply → stop the sequence, respond personally, book the call."
    ],
    cadence: [
      ["Day 0", "First touch — personalized opener, one ask (the 15-min call)."],
      ["Day 3", "Bump — short. “Resurfacing this in case it got buried.”"],
      ["Day 7", "Offer a free one-page breakdown of what we’d change."],
      ["Day 14", "Breakup — releases pressure, highest reply rate of the sequence."]
    ],
    coldcall: {
      opener: "Hi, this is {me} with QIW — we build websites and simple business systems for local companies. I’ll be quick: we just shipped a website + AI assistant for a senior-care business in Valparaiso, and I had a specific idea for {business}. Is the website side something you’ve been meaning to get to?",
      interested: "Great — can I grab you 15 minutes with Chase, our founder, this week? He’ll show you exactly what we’d build.",
      voicemail: "Hi, this is {me} with QIW — we build websites and systems for local businesses and I had an idea for {business}. I’ll follow up by email; you can also reach us at " + LINKS.phone2 + ". Thanks.",
      objections: [
        ["“How much?”", "Depends on scope — that’s what the 15 minutes is for. One flat number after, no surprises."],
        ["“We already have a site / a guy.”", "Totally fair. Want a free one-page breakdown of what we’d change? If it’s better, great; if not, no harm."],
        ["“Who are you?”", "Engineering-led studio out of Valparaiso with a live build in the field. You own everything we make — fixed scope, no lock-in."],
        ["“Not right now.”", "No problem — I’ll send a quick one-pager so it’s ready whenever you are."]
      ]
    },
    launch: {
      "1 · Close the Sale": ["Initial call / preview pitched", "Preview link sent (post-call template)", "15-minute walkthrough held", "Price quoted on the call (never in email)", "Proposal + agreement + intake sent same day", "Signed agreement received", "Deposit received — work begins"],
      "2 · Personalize the Build": ["Intake form reviewed; gaps filled by phone", "Logo / photos received (or graphics fallback)", "Trust signals added (license #, insurance, hours, story)", "Draft v2 personalized and sent", "Review call held — feedback captured", "Revision rounds done (2 max)", "Final approval in writing"],
      "3 · Launch": ["Domain confirmed / registered", "Hosting set up (GitHub Pages / Vercel)", "Quote form tested — lead lands at owner’s email/phone", "Click-to-call tested on mobile", "Google Business Profile claimed + linked", "Mobile / tablet / desktop final check", "Site live — owner walkthrough done"],
      "4 · After Launch": ["Final invoice sent + paid", "Portfolio screenshots saved", "Review requested (Google + Facebook)", "Referral ask — “who else needs this?”", "30-day check-in scheduled", "Upsell check: maintenance / AI automations"]
    }
  };

  // ---------------- seeded pipeline (real leads + clients, June 2026) ----------------
  var P = "https://qiw-previews.netlify.app/";
  var SAMPLES = [
    mk("Assisting Seniors", "Chase", "Senior Care", "Valparaiso IN", "Kelly Staubus", "", "", "Live", "Site + Gmail AI assistant live — anchor case study", "Retainer", 1500, 250, "Won", "Capture case-study metrics", "", "Active client — proof point"),
    mk("Quantum Engineering Innovations", "Chase", "Engineering", "Valparaiso IN", "Terrence Wolf", "(219) 714-7149", "", "Decent", "Engineer-to-engineer digital systems build", "Flat Build", 3000, 0, "Discovery Done", "Send scoped proposal", P + "01-quantum-engineering-innovations.html", "Open deal #2 — Chase-owned"),
    mk("JJ's Grime Time Solutions", "Aidan", "Pressure Washing", "NW Indiana", "J. Stevens", "(219) 510-2788", "jaidanstevens45@gmail.com", "Verify", "One-page site — agreement QIW-AGR-2026-17 / invoice QIW-2026-017", "Flat Build", 0, 0, "Proposal", "Collect deposit + intake", P + "17-jjs-grime-time-solutions.html", "Agreement + invoice drafted"),
    mk("Cats Eye – Vintage & Modern", "Hayden", "Boutique", "Beverly Shores IN", "Owner", "(219) 707-0066", "", "Verify", "Preview built; 4.9★ shop — proposal sent", "Setup + Retainer", 0, 199, "Proposal", "Get signed agreement + photos", "", "Proposal + intake sent"),
    mk("Standing On Business Protection Unit", "Hayden", "Security", "Michigan City IN", "Owner", "(219) 728-7233", "", "Verify", "Security firm — preview + intake sent", "Flat Build", 600, 0, "Proposal", "Confirm scope + deposit", "", "404 Greeley Ave"),
    mk("Cozy Cleaners", "Hayden", "Cleaning", "La Porte IN", "", "", "", "Verify", "In progress — confirm scope & next step", "Free to Monthly", 0, 199, "Contacted", "Confirm next step", "", "EXISTING — in progress"),
    mk("Dawson's Auto Care", "Hayden", "Auto Repair", "Westville IN", "Front desk", "(219) 299-7602", "dawsonsautocare8079@gmail.com", "FB-only", "670+ FB followers, no website — invisible on Google", "Free to Monthly", 0, 249, "Discovery Booked", "Swing back with preview", P + "02-dawsons-auto-care.html", "Preview built"),
    mk("Kaiser Auto LLC", "Hayden", "Auto Repair", "La Porte IN", "", "", "", "FB-only", "FB-only (2 shops), no website — Google can't find them", "Free to Monthly", 0, 249, "New", "Walk-in", "", "LA PORTE TARGET"),
    mk("Anderson's Automotive", "Aidan", "Auto Repair", "La Porte IN", "", "(219) 326-7015", "", "Verify", "NAPA care center — check for real site beyond directory", "Free to Monthly", 0, 249, "New", "Call AM", "", "LA PORTE TARGET"),
    mk("Novak's Auto Repair", "Chase", "Auto Repair", "La Porte IN", "", "(219) 210-3211", "", "Verify", "Small shop, likely weak/no site", "Free to Monthly", 0, 249, "New", "Call", "", "LA PORTE TARGET"),
    mk("Dave Jelke's Auto Repair", "Hayden", "Auto Repair", "La Porte IN", "", "(219) 362-1642", "", "Verify", "Independent shop — check web presence", "Free to Monthly", 0, 249, "New", "Swing by", "", "LA PORTE TARGET"),
    mk("Pine Lake Service Center", "Aidan", "Auto / Transmission", "La Porte IN", "", "", "", "Verify", "Serving LaPorte since 1971 — likely no modern site", "Free to Monthly", 0, 249, "New", "Call", "", "LA PORTE TARGET"),
    mk("Round the Clock Restaurant", "Chase", "Restaurant", "La Porte IN", "", "", "", "Outdated", "Site © 2012, no online ordering — rebuild + ordering", "Free to Monthly", 0, 249, "New", "Call", "", "LA PORTE TARGET"),
    mk("The Soul Food Bistro", "Hayden", "Restaurant", "La Porte IN", "", "", "", "Decent", "Has site — add online ordering + AI FAQ assistant", "Setup + Retainer", 0, 249, "New", "Walk-in", "", "LA PORTE — upsell AI"),
    mk("Stella Beauty", "Aidan", "Salon", "La Porte IN", "", "", "", "Verify", "Premier salon — many are FB/IG only, check", "Free to Monthly", 0, 199, "New", "Walk-in", "", "LA PORTE TARGET"),
    mk("Salon Chic", "Chase", "Salon", "La Porte IN", "", "", "", "Verify", "Likely social-only", "Free to Monthly", 0, 199, "New", "Walk-in", "", "LA PORTE TARGET"),
    mk("Generations Hair Salon", "Hayden", "Salon", "La Porte IN", "", "", "", "Verify", "Check site / online booking", "Free to Monthly", 0, 199, "New", "Walk-in", "", "LA PORTE TARGET"),
    mk("Salon Rogue", "Aidan", "Salon", "La Porte IN", "", "", "", "Verify", "Online booking opportunity", "Free to Monthly", 0, 199, "New", "Walk-in", "", "LA PORTE TARGET"),
    mk("Running with Scissors Salon", "Chase", "Salon", "La Porte IN", "", "", "", "Verify", "Check web presence", "Free to Monthly", 0, 199, "New", "Walk-in", "", "LA PORTE TARGET"),
    mk("Westville Printing Inc.", "Aidan", "Printing", "Westville IN", "Scott", "", "westvilleprinting-scott@mediacombb.net", "Verify", "Preview built — send + book", "Free to Monthly", 0, 199, "Contacted", "Send preview", P + "03-westville-printing.html", "Preview ready"),
    mk("L4M Architecture", "Aidan", "Architecture", "NW Indiana", "Don", "", "don@l4marchitecture.com", "Verify", "Preview built — send + book", "Flat Build", 0, 0, "Contacted", "Send preview", P + "04-l4m-architecture.html", "Preview ready"),
    mk("Chadam Consultants Inc", "Aidan", "Consulting", "NW Indiana", "Sales", "", "sales@chadam.net", "Verify", "Preview built — send + book", "Flat Build", 0, 0, "Contacted", "Send preview", P + "05-chadam-consultants.html", "Preview ready"),
    mk("Auto Detailing by Leslie", "Aidan", "Auto Detailing", "NW Indiana", "Leslie", "", "autodetailingbyleslie@yahoo.com", "Verify", "Preview built — send + book", "Free to Monthly", 0, 199, "Contacted", "Send preview", P + "16-auto-detailing-by-leslie.html", "Preview ready"),
    mk("The Palm Locals", "Aidan", "Local Media", "West Palm Beach FL", "", "", "hello@thepalmlocals.com", "Verify", "Preview built — send + book", "Flat Build", 0, 0, "Nurture", "Send preview", P + "11-the-palm-locals.html", "Preview ready — FL"),
    mk("Moving Places Movers", "Aidan", "Movers", "NW Indiana", "N. Husiar", "", "nhusiar@movingplaces.org", "Verify", "Preview built — send + book", "Free to Monthly", 0, 199, "Nurture", "Send preview", P + "13-moving-places-movers.html", "Preview ready")
  ];

  function mk(business, owner, industry, city, contact, phone, email, presence, hook, model, oneTime, monthly, stage, nextAction, preview, notes) {
    return { id: "L" + (SAMPLES ? (SAMPLES.length + 1) : 0), owner: owner, business: business, industry: industry, city: city, contact: contact, phone: phone, email: email, presence: presence, hook: hook, model: model, oneTime: oneTime, monthly: monthly, stage: stage, nextAction: nextAction, preview: preview, notes: notes, dateAdded: "2026-06-20", lastTouch: "", log: [] };
  }
  // assign stable ids
  SAMPLES.forEach(function (l, i) { l.id = "L" + String(i + 1).padStart(3, "0"); });

  var OWNERS = ["Chase", "Aidan", "Hayden", "Juice", "Other"];
  var STAGES = ["New", "Contacted", "Discovery Booked", "Discovery Done", "Proposal", "Won", "Lost", "Nurture"];
  var SOURCES = ["Cold Call", "Walk-in", "Referral", "Network", "Web", "Email", "Event"];
  var PRESENCE = ["None", "FB-only", "Dead site", "Outdated", "Decent", "Verify", "Live"];
  var MODELS = ["Free to Monthly", "Setup + Retainer", "Flat Build", "Retainer", "AI Agent"];
  var OPEN_STAGES = ["Contacted", "Discovery Booked", "Discovery Done", "Proposal"];

  var PEOPLE = {
    chase: { key: "chase", name: "Chase", role: "Founder · Build & Close", accent: "red", tag: "Aidan opens, you close.", defaultTab: "Chase", motor: { lab: "CLOSE & SHIP · TODAY", metric: "discovery calls held + builds moved", goal: 5 }, modules: ["close", "deliver", "clients", "pricing", "build", "playbook", "links"] },
    aidan: { key: "aidan", name: "Aidan", role: "Partner · Outreach & Booking", accent: "green", tag: "You open, Chase closes.", defaultTab: "Aidan", motor: { lab: "OUTREACH · TODAY", metric: "first-touches sent + calls booked", goal: 20 }, modules: ["outreach", "previews", "cadence", "coldcall", "clients", "pricing", "links"] },
    hayden: { key: "hayden", name: "Hayden", role: "Field Sales · Walk-ins & Previews", accent: "steel", tag: "Knock doors. Send previews. Book the call.", defaultTab: "Hayden", motor: { lab: "FIELD PUSH · TODAY", metric: "doors worked + previews sent", goal: 15 }, modules: ["field", "previews", "coldcall", "clients", "pricing", "links"] }
  };

  function ownClass(o) { return ({ Chase: "chase", Aidan: "aidan", Hayden: "hayden" })[o] || ""; }
  function ownColor(o) { return ({ Chase: "#C01F2E", Aidan: "#1f6f49", Hayden: "#9aa39c", Juice: "#6b736c" })[o] || "#6b736c"; }
  function ownText(o) { return o === "Hayden" ? "#0A0A0A" : "#E7EDE9"; }

  // ---------------- state + storage ----------------
  var ME = null, state = { leads: [], goal: 12, tab: "All", checks: {} }, editing = null;
  var $ = function (id) { return document.getElementById(id); };
  var today = function () { return new Date().toISOString().slice(0, 10); };
  var uid = function () { return "L" + Date.now().toString(36).slice(-5).toUpperCase(); };
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var Store = {
    key: "qiw_ops_v1",
    load: function () {
      try { if (window.storage && window.storage.get) { /* sandbox host */ } } catch (e) {}
      try { var v = localStorage.getItem(this.key); if (v) return JSON.parse(v); } catch (e) {}
      return null;
    },
    save: function (s) {
      try { localStorage.setItem(this.key, JSON.stringify(s)); } catch (e) {}
    }
  };
  function saveLocal() { Store.save({ leads: state.leads, goal: state.goal, checks: state.checks, deleted: state.deleted || [] }); }

  var Cloud = {
    cfg: function () { try { return JSON.parse(localStorage.getItem("qiw_ops_cloud") || "null"); } catch (e) { return null; } },
    on: function () { var c = this.cfg(); return !!(c && c.url && c.token); },
    set: function (url, token) { try { localStorage.setItem("qiw_ops_cloud", JSON.stringify({ url: url, token: token })); } catch (e) {} },
    clear: function () { try { localStorage.removeItem("qiw_ops_cloud"); } catch (e) {} },
    _poll: null, _pushT: null, _n: 0,
    pull: function (done) {
      var c = this.cfg(); if (!c) { if (done) done(null); return; }
      var cb = "qiwcb" + (++this._n), s = document.createElement("script");
      var timer = setTimeout(function () { clean(); if (done) done(null); }, 12000);
      function clean() { try { delete window[cb]; } catch (e) { window[cb] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); clearTimeout(timer); }
      window[cb] = function (data) { clean(); if (done) done(data); };
      s.onerror = function () { clean(); if (done) done(null); };
      s.src = c.url + (c.url.indexOf("?") < 0 ? "?" : "&") + "action=get&token=" + encodeURIComponent(c.token) + "&callback=" + cb + "&t=" + Date.now();
      document.body.appendChild(s);
    },
    push: function () {
      var c = this.cfg(); if (!c) return;
      var payload = JSON.stringify({ token: c.token, leads: state.leads, deleted: state.deleted || [], ts: Date.now() });
      try { fetch(c.url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: payload }); } catch (e) {}
      setCloudStatus("syncing"); var self = this;
      setTimeout(function () { if (self.on()) setCloudStatus("on"); }, 1400);
    },
    schedulePush: function () { var self = this; clearTimeout(this._pushT); this._pushT = setTimeout(function () { self.push(); }, 1200); },
    merge: function (remote) {
      if (!remote || remote.error || !remote.leads) return false;
      var changed = false, byId = {};
      state.deleted = state.deleted || [];
      state.leads.forEach(function (l) { byId[l.id] = l; });
      var delAt = {}; state.deleted.forEach(function (d) { var id = d.id || d; delAt[id] = Math.max(delAt[id] || 0, d.at || 1); });
      (remote.deleted || []).forEach(function (d) { var id = d.id || d, at = d.at || 1; if (at > (delAt[id] || 0)) { delAt[id] = at; state.deleted.push({ id: id, at: at }); } });
      remote.leads.forEach(function (r) {
        if (delAt[r.id] && (r.updatedAt || 0) <= delAt[r.id]) return;
        var cur = byId[r.id];
        if (!cur) { state.leads.push(r); byId[r.id] = r; changed = true; }
        else if ((r.updatedAt || 0) > (cur.updatedAt || 0)) { for (var k in r) cur[k] = r[k]; changed = true; }
      });
      var before = state.leads.length;
      state.leads = state.leads.filter(function (l) { return !(delAt[l.id] && (l.updatedAt || 0) <= delAt[l.id]); });
      if (state.leads.length !== before) changed = true;
      return changed;
    },
    start: function () {
      if (!this.on()) return; var self = this; setCloudStatus("syncing");
      this.pull(function (remote) { self.merge(remote); self.push(); saveLocal(); render(); setCloudStatus("on"); });
      clearInterval(this._poll);
      this._poll = setInterval(function () { self.pull(function (remote) { if (self.merge(remote)) { saveLocal(); render(); } }); }, 15000);
    },
    stop: function () { clearInterval(this._poll); this._poll = null; }
  };
  function setCloudStatus(s) {
    var el = document.getElementById("cloudStatus"); if (!el) return;
    el.textContent = s === "on" ? "Team sync on" : s === "syncing" ? "Syncing…" : "Local only";
    el.className = "cloudchip " + (s === "off" ? "off" : "onx");
  }
  function loadSamplesData() { var now = Date.now(); state.leads = SAMPLES.map(function (s) { return Object.assign({ log: [], updatedAt: now }, s); }); }
  function find(id) { return state.leads.find(function (l) { return l.id === id; }); }

  function countsToday() { var t = today(), w = 0, b = 0; state.leads.forEach(function (l) { (l.log || []).forEach(function (e) { if (e.t.slice(0, 10) === t) { if (e.a === "touch") w++; if (e.a === "booked") b++; } }); }); return { w: w, b: b }; }
  function repToday(o) { var t = today(), w = 0, b = 0; state.leads.filter(function (l) { return l.owner === o; }).forEach(function (l) { (l.log || []).forEach(function (e) { if (e.t.slice(0, 10) === t) { if (e.a === "touch") w++; if (e.a === "booked") b++; } }); }); return { w: w, b: b }; }

  // ---------------- render ----------------
  function mark() {
    return '<span class="mark"><svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">' +
      '<circle cx="17" cy="17" r="15" fill="none" stroke="#143D28" stroke-width="2"/>' +
      '<ellipse cx="17" cy="17" rx="15" ry="6" fill="none" stroke="#2f7d56" stroke-width="1.3" transform="rotate(32 17 17)"/>' +
      '<circle cx="30" cy="9" r="2.2" fill="#C01F2E"/>' +
      '<text x="17" y="23" font-family="Cinzel,Georgia,serif" font-size="15" font-weight="700" fill="#E7EDE9" text-anchor="middle">Ψ</text>' +
      '</svg><span class="lock"><span class="wm">QIW</span><span class="org">QUANTUM INTELLIGENCE WORKS</span></span></span>';
  }
  function nav() {
    var pages = [["chase", "Chase"], ["aidan", "Aidan"], ["hayden", "Hayden"]];
    var cls = ME.accent === "green" ? "g" : ME.accent === "steel" ? "s" : "";
    var inner = pages.map(function (p) {
      var here = p[0] === ME.key ? " here " + cls : "";
      return '<a class="np' + here + '" href="#" role="button" onclick="QIW.switchUser(\'' + p[0] + '\');return false;">' + p[1] + '</a>';
    }).join("");
    var ext = '<a href="' + LINKS.site + '" target="_blank" rel="noopener">Public site ↗</a>' +
      '<a href="mailto:' + LINKS.email + '">Company email</a>' +
      '<a href="' + LINKS.github + '" target="_blank" rel="noopener">GitHub</a>' +
      '<a href="' + LINKS.previews + '" target="_blank" rel="noopener">Previews</a>' +
      '<a href="' + LINKS.book + '" target="_blank" rel="noopener">Book a call</a>';
    return '<nav class="bar" aria-label="Switch your board and company links"><span class="navlab">Your board</span><div class="seg">' + inner + '</div><div class="ext">' + ext + '</div></nav>';
  }
  function shell() {
    $("app").innerHTML =
      '<header class="top">' + mark() +
      '<span class="tagline">Engineering the Future of Intelligence.</span>' +
      '<div class="whoami"><div class="nm"><span class="chip" style="background:' + ownColor(ME.name) + '"></span>' + esc(ME.name) + '</div><div class="rl">' + esc(ME.role) + '</div></div>' +
      '</header>' + nav() +
      '<main id="main">' +
      '<section class="mod" id="motorMod"></section>' +
      '<section class="mod" id="pipeMod"></section>' +
      '<div id="roleMods"></div>' +
      '</main>' +
      '<footer class="foot"><span>' + esc(ME.tag) + '</span><span>' + SOPS.leadWith + '</span><span>' + LINKS.phone2 + ' · ' + LINKS.email + '</span></footer>';
  }

  function renderPicker() {
    var card = function (k, p) {
      return '<button class="pick ' + k + '" onclick="QIW.switchUser(\'' + k + '\')">' +
        '<span class="pk-name">' + p.name + '</span>' +
        '<span class="pk-role">' + esc(p.role) + '</span>' +
        '<span class="pk-go">Open my board →</span></button>';
    };
    $("app").innerHTML =
      '<div class="picker"><header class="top">' + mark() +
      '<span class="tagline">Engineering the Future of Intelligence.</span></header>' +
      '<div class="pickbody"><p class="pickkick">Internal ops · daily board</p>' +
      '<h1 class="pickh1">Who is using this board?</h1>' +
      '<p class="picksub">Pick your name — this device remembers you, and you can switch any time from the top bar.</p>' +
      '<div class="pickgrid">' + card("chase", PEOPLE.chase) + card("aidan", PEOPLE.aidan) + card("hayden", PEOPLE.hayden) + '</div>' +
      '<p class="picknote">One shared pipeline · add your own leads · export to the team sheet to sync.</p>' +
      '</div></div>';
  }

  function render() {
    renderMotor(); renderPipe(); renderRoleMods();
  }

  function renderMotor() {
    var c = countsToday(), goal = state.goal || 12, pct = Math.min(100, Math.round(c.w / goal * 100));
    var st = "Cold start. Make the first move.";
    if (c.w >= goal) st = "Goal smashed — keep stacking.";
    else if (pct >= 70) st = "High motor — closing on the goal.";
    else if (pct >= 30) st = "Steady grind. Keep pressing.";
    else if (c.w > 0) st = "Warming up — fill the board.";
    if (c.b > 0) st += "  ·  " + c.b + " call" + (c.b > 1 ? "s" : "") + " booked today.";
    var reps = ["Chase", "Aidan", "Hayden"].map(function (o) { var r = repToday(o); return '<div class="repchip ' + ownClass(o) + '"><div class="n">' + o + (o === ME.name ? " • you" : "") + '</div><div class="s">' + r.w + " worked · " + r.b + " booked today</div></div>"; }).join("");
    var stats = statStrip();
    $("motorMod").innerHTML =
      '<div class="panel"><div class="motor">' +
      '<div class="big">' + (c.b >= 2 ? "◉" : "◎") + '</div>' +
      '<div class="mid"><div class="lab">' + esc(ME.motor.lab) + '</div><div class="state">' + esc(st) + '</div>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="goalrow">Daily goal <input class="goal" id="goal" type="number" min="1" value="' + goal + '"> ' + esc(ME.motor.metric) + '<span style="margin-left:auto;color:var(--red)">' + c.w + "/" + goal + '</span></div></div>' +
      '<div class="counts"><div><b>' + c.w + '</b><span>WORKED TODAY</span></div><div><b style="color:var(--red-lift)">' + c.b + '</b><span>BOOKED</span></div></div>' +
      '</div><div class="reps">' + reps + '</div></div>' + stats;
    $("goal").onchange = function () { state.goal = Math.max(1, +$("goal").value || 12); persist(); };
  }
  function statStrip() {
    var L = state.leads;
    var total = L.length;
    var booked = L.filter(function (l) { return ["Discovery Booked", "Discovery Done", "Proposal", "Won"].indexOf(l.stage) >= 0; }).length;
    var open = L.filter(function (l) { return OPEN_STAGES.indexOf(l.stage) >= 0; }).length;
    var laporte = L.filter(function (l) { return l.stage === "New"; }).length;
    var mrr = L.filter(function (l) { return l.stage !== "Lost"; }).reduce(function (a, l) { return a + (+l.monthly || 0); }, 0);
    return '<div class="stats">' +
      '<div class="stat"><div class="k">Leads in board</div><div class="v">' + total + '</div></div>' +
      '<div class="stat hot"><div class="k">In discovery / proposal</div><div class="v">' + booked + '</div></div>' +
      '<div class="stat"><div class="k">Open / working</div><div class="v">' + open + '</div></div>' +
      '<div class="stat"><div class="k">Targets left (New)</div><div class="v">' + laporte + '</div></div>' +
      '<div class="stat live"><div class="k">MRR in pipeline</div><div class="v">$' + mrr.toLocaleString() + '</div></div>' +
      '</div>';
  }

  function renderPipe() {
    var cls = ME.accent === "green" ? "g" : ME.accent === "steel" ? "s" : "";
    var tabs = ["All", "Chase", "Aidan", "Hayden"].map(function (o) {
      var n = o === "All" ? state.leads.length : state.leads.filter(function (l) { return l.owner === o; }).length;
      return '<button class="tab ' + (state.tab === o ? "active " + cls : "") + '" onclick="QIW.setTab(\'' + o + '\')">' + o + (o !== "All" ? " (" + n + ")" : "") + '</button>';
    }).join("");
    $("pipeMod").innerHTML =
      '<div class="modhead"><span class="kick">START HERE — SALES</span><h2>Pipeline</h2><span class="note">your tab is pre-selected · <span id="cloudStatus" class="cloudchip off" role="button" tabindex="0" onclick="QIW.connectSync()">Local only</span></span></div><hr class="rule">' +
      '<div class="toolbar"><div class="tabs">' + tabs + '</div></div>' +
      '<div class="toolbar"><input class="search" id="search" placeholder="Search business, hook, city…" value="' + esc(state._q || "") + '">' +
      '<select id="fStage"><option value="">All stages</option>' + STAGES.map(function (s) { return '<option' + (state._fs === s ? " selected" : "") + '>' + s + '</option>'; }).join("") + '</select>' +
      '<button class="btn primary" onclick="QIW.openModal()">+ Add lead</button>' +
      '<div class="menu" id="menu"><button class="btn" onclick="QIW.toggleMenu(event)">Sync / Export ▾</button><div class="pop">' +
      '<button onclick="QIW.connectSync()">Connect team sync…</button>' +
      '<button onclick="QIW.disconnectSync()">Disconnect sync</button>' +
      '<button onclick="QIW.exportCSV()">Export for Google Sheet (CSV)</button>' +
      '<button onclick="QIW.exportJSON()">Backup (JSON)</button>' +
      '<button onclick="QIW.importPrompt()">Import master CSV…</button>' +
      '<button onclick="QIW.loadSamples()">Load sample leads</button>' +
      '<button style="color:var(--red)" onclick="QIW.clearAll()">Clear all leads</button>' +
      '</div></div><input type="file" id="fileInput" accept=".csv" style="display:none"></div>' +
      '<div id="list"></div>';
    $("search").oninput = function () { state._q = this.value; renderList(); };
    $("fStage").onchange = function () { state._fs = this.value; renderList(); };
    $("fileInput").onchange = function (e) { if (e.target.files[0]) importCSV(e.target.files[0]); e.target.value = ""; };
    renderList();
    setCloudStatus(Cloud.on() ? "on" : "off");
  }
  function filtered() {
    var q = (state._q || "").trim().toLowerCase(), fs = state._fs || "";
    var rows = state.leads.filter(function (l) {
      if (state.tab !== "All" && l.owner !== state.tab) return false;
      if (fs && l.stage !== fs) return false;
      if (q) { var blob = (l.business + " " + l.hook + " " + l.city + " " + (l.contact || "") + " " + (l.notes || "")).toLowerCase(); if (blob.indexOf(q) < 0) return false; }
      return true;
    });
    rows.sort(function (a, b) { var an = a.stage === "New" ? 0 : 1, bn = b.stage === "New" ? 0 : 1; if (an !== bn) return an - bn; return a.business.localeCompare(b.business); });
    return rows;
  }
  function renderList() {
    var rows = filtered();
    if (!rows.length) { $("list").innerHTML = '<div class="empty"><h3>No leads yet</h3><p>Hit <b>+ Add lead</b> to start your board — or pull the demo set from <b>Sync / Export → Load sample leads</b>.</p></div>'; return; }
    $("list").innerHTML = '<div class="grid">' + rows.map(card).join("") + "</div>";
  }
  function card(l) {
    var sc = "s-" + (l.stage || "New").replace(/ /g, "");
    var tags = [l.model, l.monthly ? "$" + l.monthly + "/mo" : "", l.presence].filter(Boolean).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("");
    var lp = (l.notes || "").indexOf("LA PORTE") >= 0 ? '<span class="tag lp">LA PORTE</span>' : "";
    var pv = l.preview ? '<span class="tag prev">PREVIEW</span>' : "";
    var prevBtn = l.preview ? '<button class="btn prev" onclick="QIW.copyPreview(\'' + l.id + '\')">Copy preview link</button>' : "";
    return '<div class="card ' + ownClass(l.owner) + '"><div class="ch"><div><div class="biz">' + esc(l.business) + '</div><div class="csub">' + esc(l.industry || "") + (l.city ? " · " + esc(l.city) : "") + '</div></div><span class="pill ' + sc + '">' + esc(l.stage) + "</span></div>" +
      '<div style="margin:6px 0"><span class="ownbadge" style="background:' + ownColor(l.owner) + ';color:' + ownText(l.owner) + '">' + esc(l.owner || "—") + "</span> " + lp + " " + pv + "</div>" +
      '<div class="hook">' + esc(l.hook || "") + '</div><div class="tags">' + tags + "</div>" +
      '<div class="meta">' + esc(l.phone || l.email || "") + (l.nextAction ? " · " + esc(l.nextAction) : "") + "</div>" +
      '<div class="acts"><button class="btn" onclick="QIW.logTouch(\'' + l.id + '\')">Log touch</button><button class="btn book" onclick="QIW.bookCall(\'' + l.id + '\')">Book call</button>' + prevBtn + "</div>" +
      '<div class="statusrow">' + statusSelect(l) + "</div></div>";
  }

  function statusSelect(l) {
    return '<select onchange="QIW.setStatus(\'' + l.id + '\',this.value)">' + STAGES.map(function (s) { return "<option" + (s === l.stage ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select>" +
      '<button class="iconbtn" onclick="QIW.openModal(\'' + l.id + '\')">edit</button><button class="iconbtn" onclick="QIW.del(\'' + l.id + '\')">del</button>';
  }

  // ---------------- role modules ----------------
  function renderRoleMods() {
    var html = (ME.modules || []).map(function (m) { return (MOD[m] ? MOD[m]() : ""); }).join("");
    $("roleMods").innerHTML = html;
    // wire checklist toggles
    Array.prototype.forEach.call(document.querySelectorAll("[data-check]"), function (el) {
      el.onclick = function () { var k = el.getAttribute("data-check"); state.checks[k] = !state.checks[k]; persist(); };
    });
  }
  function head(kick, title, note) { return '<div class="modhead"><span class="kick">' + kick + '</span><h2>' + title + '</h2>' + (note ? '<span class="note">' + note + "</span>" : "") + '</div><hr class="rule">'; }
  function miniList(filterFn, kick, title, note) {
    var rows = state.leads.filter(filterFn);
    rows.sort(function (a, b) { return a.business.localeCompare(b.business); });
    var body = rows.length ? '<div class="grid">' + rows.map(card).join("") + "</div>" : '<div class="empty"><h3>Clear</h3><p>Nothing in this view right now.</p></div>';
    return '<section class="mod">' + head(kick, title, note + " · " + rows.length) + body + "</section>";
  }

  var MOD = {
    close: function () { return miniList(function (l) { return ["Discovery Booked", "Discovery Done", "Proposal"].indexOf(l.stage) >= 0; }, "YOUR JOB — CLOSE", "Close queue", "discovery → proposal → signed"); },
    deliver: function () {
      var builds = state.leads.filter(function (l) { return l.stage === "Won" || l.stage === "Proposal"; });
      var list = builds.map(card).join("");
      var phases = Object.keys(SOPS.launch).map(function (ph) {
        var items = SOPS.launch[ph].map(function (it, i) {
          var k = "chk:" + ph + ":" + i, done = state.checks[k];
          return '<label class="checkitem ' + (done ? "done" : "") + '" data-check="' + esc(k) + '"><input type="checkbox" ' + (done ? "checked" : "") + '>' + esc(it) + "</label>";
        }).join("");
        return '<div class="phase">' + esc(ph) + "</div>" + items;
      }).join("");
      return '<section class="mod">' + head("YOUR JOB — SHIP", "Build &amp; deliver", "current builds + sale-to-launch") +
        (builds.length ? '<div class="grid">' + list + "</div>" : "") +
        '<div class="refcard" style="margin-top:12px"><h3><span class="t">SALE-TO-LAUNCH</span>Delivery checklist (current build)</h3>' + phases + "</div></section>";
    },
    outreach: function () { return miniList(function (l) { return l.owner === "Aidan" && ["New", "Contacted"].indexOf(l.stage) >= 0; }, "YOUR JOB — OPEN", "First-touch queue", "personalize line one, one ask"); },
    previews: function () {
      var rows = state.leads.filter(function (l) { return l.preview; });
      var body = rows.map(function (l) {
        return '<div class="refcard"><h3><span class="t">' + esc(l.owner) + " · " + esc(l.stage) + '</span>' + esc(l.business) + "</h3>" +
          '<p>' + esc(l.email || l.phone || "") + "</p>" +
          '<div class="acts"><button class="btn prev" onclick="QIW.copyPreview(\'' + l.id + '\')">Copy link</button><a class="btn" href="' + esc(l.preview) + '" target="_blank" rel="noopener">Open</a></div></div>';
      }).join("");
      return '<section class="mod">' + head("SEND AFTER CALLS", "Previews ready to send", rows.length + " built") +
        '<div class="refcard" style="margin-bottom:12px"><p class="q">“Great talking with you — here’s the preview I mentioned. Open it on any phone or computer: [LINK]. Everything you see gets finalized with you before launch.”</p></div>' +
        '<div class="cards2">' + body + "</div></section>";
    },
    field: function () {
      return miniList(function (l) { return l.stage === "New"; }, "TODAY — KNOCK DOORS", "Field push — La Porte", "walk in, pitch the free preview, book the call");
    },
    coldcall: function () {
      var cc = SOPS.coldcall, me = ME.name;
      var rep = function (s) { return esc(s.replace(/{me}/g, me).replace(/{business}/g, "{business}")); };
      var obj = cc.objections.map(function (o) { return "<li><b>" + esc(o[0]) + "</b><br>" + esc(o[1]) + "</li>"; }).join("");
      return '<section class="mod">' + head("SCRIPT", "Cold call", "current pricing · swap {business}") +
        '<div class="cards2"><div class="refcard"><h3><span class="t">OPENER</span>First 15 seconds</h3><p class="q">' + rep(cc.opener) + "</p>" +
        '<h3 style="margin-top:12px"><span class="t">INTERESTED</span>Book it</h3><p class="q">' + rep(cc.interested) + "</p>" +
        '<h3 style="margin-top:12px"><span class="t">VOICEMAIL</span>Leave this</h3><p class="q">' + rep(cc.voicemail) + "</p></div>" +
        '<div class="refcard"><h3><span class="t">OBJECTIONS</span>Handle &amp; move</h3><ul>' + obj + "</ul></div></div></section>";
    },
    cadence: function () {
      var rows = SOPS.cadence.map(function (c) { return '<div class="kv"><b>' + esc(c[0]) + "</b><span>" + esc(c[1]) + "</span></div>"; }).join("");
      var rules = SOPS.firstTouch.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("");
      return '<section class="mod">' + head("OUTREACH", "Follow-up cadence", "3 touches, then pause 30 days") +
        '<div class="cards2"><div class="refcard"><h3><span class="t">SEQUENCE</span>After first touch</h3>' + rows + "</div>" +
        '<div class="refcard"><h3><span class="t">FIRST-TOUCH RULES</span>Every message</h3><ul>' + rules + "</ul></div></div></section>";
    },
    pricing: function () {
      var rows = PRICING.rows.map(function (r) { return '<div class="kv"><span>' + esc(r[0]) + "</span><b>" + esc(r[1]) + "</b></div>"; }).join("");
      return '<section class="mod">' + head("LOCKED RATE CARD", "Pricing", "never lead with price — quote deliverables") +
        '<div class="refcard"><h3><span class="t">QUOTE THESE</span>Tier 1A + retainers</h3>' + rows +
        '<p style="margin-top:11px">' + esc(PRICING.terms) + '</p><div class="kv"><span class="deprecated">' + esc(PRICING.deprecated) + "</span><b style=\"color:var(--bad)\">deprecated</b></div></div></section>";
    },
    playbook: function () {
      var rules = SOPS.firstTouch.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("");
      var ph = Object.keys(SOPS.launch).map(function (p) { return "<li>" + esc(p) + " — " + SOPS.launch[p].length + " steps</li>"; }).join("");
      return '<section class="mod">' + head("PLAYBOOK", "How we sell", SOPS.leadWith) +
        '<div class="cards2"><div class="refcard"><h3><span class="t">FIRST-TOUCH RULES</span>Cold outreach</h3><ul>' + rules + "</ul></div>" +
        '<div class="refcard"><h3><span class="t">SALE-TO-LAUNCH</span>4 phases per client</h3><ul>' + ph + '</ul><p style="margin-top:8px">Full interactive checklist lives on Chase’s board.</p></div></div></section>';
    },
    clients: function () {
      var rows = state.leads.filter(function (l) { return ["Won", "Proposal", "Discovery Done"].indexOf(l.stage) >= 0; });
      rows.sort(function (a, b) { return (a.stage === "Won" ? 0 : 1) - (b.stage === "Won" ? 0 : 1); });
      var body = rows.map(function (l) {
        return '<div class="kv"><span><b>' + esc(l.business) + "</b> · " + esc(l.industry) + "<br><span class=\"mono\" style=\"font-size:11px;color:var(--dim)\">" + esc(l.phone || l.email || l.city) + "</span></span><span class=\"pill s-" + l.stage.replace(/ /g, "") + "\">" + esc(l.stage) + "</span></div>";
      }).join("");
      return '<section class="mod">' + head("ROSTER", "Active clients &amp; live deals", rows.length) + '<div class="refcard">' + body + "</div></section>";
    },
    build: function () {
      return '<section class="mod">' + head("DELIVERY", "Build &amp; launch workflow", "design in Claude → ship in Claude Code") +
        '<div class="cards2"><div class="refcard"><h3><span class="t">REPEATABLE LAUNCH</span>Per client</h3><ul>' +
        "<li>Clone <span class=\"mono\">qiw-client-template</span> → <span class=\"mono\">client-&lt;name&gt;</span></li>" +
        "<li>Design in Claude; harden + ship in Claude Code</li>" +
        "<li>Push to a private repo under the QIW GitHub org (main = production)</li>" +
        "<li>Deploy: static → GitHub Pages · apps → Vercel; attach domain</li>" +
        "<li>Hand off: client repo access + live URL. “You own the code.”</li></ul></div>" +
        '<div class="refcard"><h3><span class="t">LINKS</span>Ship surface</h3><div class="linkgrid">' +
        '<a href="' + LINKS.github + '" target="_blank" rel="noopener"><div class="l">GitHub org</div><div class="u">quantumintelligenceworks</div></a>' +
        '<a href="' + LINKS.site + '" target="_blank" rel="noopener"><div class="l">Live site</div><div class="u">QIW---Site</div></a>' +
        '<a href="' + LINKS.previews + '" target="_blank" rel="noopener"><div class="l">Previews</div><div class="u">qiw-previews.netlify.app</div></a>' +
        "</div></div></div></section>";
    },
    links: function () {
      function a(href, l, u, badge) { return '<a href="' + href + '"' + (href.indexOf("mailto") < 0 ? ' target="_blank" rel="noopener"' : "") + '><div class="l">' + l + (badge ? ' <span class="badge">' + badge + "</span>" : "") + '</div><div class="u">' + u + "</div></a>"; }
      var grid = a(LINKS.site, "Public site", "QIW---Site (GitHub Pages)") +
        a("mailto:" + LINKS.email, "Company email", LINKS.email) +
        a(LINKS.github, "GitHub org", "github.com/quantumintelligenceworks") +
        a(LINKS.previews, "Client previews", "qiw-previews.netlify.app") +
        a(LINKS.book, "Booking", "Calendly", "confirm link") +
        a(LINKS.stripe, "Stripe", "payment links + deposits", "confirm") +
        a("tel:+12193149939", "Phone", LINKS.phone1 + " · " + LINKS.phone2);
      return '<section class="mod">' + head("LINKS", "Everything, linked", LINKS.addr) + '<div class="refcard"><div class="linkgrid">' + grid + "</div></div></section>";
    }
  };

  // ---------------- actions ----------------
  function persist() { render(); saveLocal(); if (Cloud.on()) Cloud.schedulePush(); }
  function toast(m, bw) { var t = $("toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); } t.innerHTML = bw ? '<span class="bw">' + bw + "</span> " + m : m; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2600); }

  var API = {
    setTab: function (o) { state.tab = o; renderPipe(); },
    logTouch: function (id) { var l = find(id); l.log = l.log || []; l.log.push({ a: "touch", t: new Date().toISOString() }); if (l.stage === "New") l.stage = "Contacted"; l.lastTouch = today(); l.updatedAt = Date.now(); persist(); toast("Touch logged — next one."); },
    bookCall: function (id) { var l = find(id); l.stage = "Discovery Booked"; l.log = l.log || []; l.log.push({ a: "booked", t: new Date().toISOString() }); l.updatedAt = Date.now(); persist(); toast("Flag the team — put it on Chase’s calendar.", "BOOKED."); },
    setStatus: function (id, v) { var l = find(id); var was = l.stage; l.stage = v; if (v === "Discovery Booked" && was !== "Discovery Booked") { l.log = l.log || []; l.log.push({ a: "booked", t: new Date().toISOString() }); toast("Booked — nice.", "BOOKED."); } l.updatedAt = Date.now(); persist(); },
    del: function (id) { if (confirm("Remove this lead from the board?")) { state.deleted = state.deleted || []; state.deleted.push({ id: id, at: Date.now() }); state.leads = state.leads.filter(function (l) { return l.id !== id; }); persist(); } },
    copyPreview: function (id) { var l = find(id); if (!l.preview) return; var snip = "Great talking with you — here’s the preview I mentioned. Open it on any phone or computer: " + l.preview + " . Everything you see gets finalized with you before launch."; copy(snip); toast("Preview message copied — paste + send."); },
    toggleMenu: function (e) { e.stopPropagation(); $("menu").classList.toggle("open"); },
    openModal: function (id) { openModal(id); },
    exportCSV: function () { exportCSV(); },
    exportJSON: function () { dl("QIW_ops_backup.json", JSON.stringify({ leads: state.leads }, null, 2), "application/json"); },
    importPrompt: function () { $("fileInput").click(); },
    loadSamples: function () { if (confirm("Load the 25 sample leads? This replaces the current board.")) { loadSamplesData(); state.checks = {}; persist(); } },
    clearAll: function () { if (confirm("Clear ALL leads from the board? This cannot be undone.")) { state.leads = []; state.checks = {}; persist(); } },
    connectSync: function () {
      var c = Cloud.cfg() || {};
      var url = prompt("Paste your QIW team-sync Web App URL (from the Google Apps Script deploy — it ends in /exec):", c.url || "");
      if (url === null) return; url = url.trim();
      if (!url) { Cloud.stop(); Cloud.clear(); setCloudStatus("off"); toast("Team sync disconnected (local only)."); return; }
      var token = prompt("Paste the sync token (the TOKEN you set in the script):", c.token || "");
      if (token === null) return;
      Cloud.set(url, token.trim()); toast("Connecting team sync…"); Cloud.start();
    },
    disconnectSync: function () { Cloud.stop(); Cloud.clear(); setCloudStatus("off"); toast("Team sync disconnected (local only)."); }
  };

  function copy(t) { try { navigator.clipboard.writeText(t); } catch (e) { var a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); } catch (e2) {} a.remove(); } }

  // modal
  function openModal(id) {
    editing = id || null;
    var l = id ? find(id) : {};
    var opt = function (arr, v) { return arr.map(function (o) { return '<option' + (o === v ? " selected" : "") + ">" + o + "</option>"; }).join(""); };
    $("scrim").innerHTML = '<div class="modal"><h2>' + (id ? "Edit lead" : "Add lead") + '</h2><div class="fgrid">' +
      fld("business", "Business", l.business) + fldSel("owner", "Owner", OWNERS, l.owner || ME.name) +
      fld("industry", "Industry", l.industry) + fld("city", "City / Region", l.city || "La Porte IN") +
      fld("contact", "Contact", l.contact) + fld("phone", "Phone", l.phone) +
      fld("email", "Email", l.email) + fldSel("presence", "Online presence", PRESENCE, l.presence || "Verify") +
      fldSel("source", "Channel", SOURCES, l.source || "Walk-in") + fldSel("model", "Model", MODELS, l.model || "Free to Monthly") +
      '<div class="field full"><label>Problem / hook</label><input id="f_hook" value="' + esc(l.hook || "") + '"></div>' +
      fld("monthly", "Monthly $", l.monthly || 0, "number") + fldSel("stage", "Stage", STAGES, l.stage || "New") +
      '<div class="field full"><label>Preview link</label><input id="f_preview" value="' + esc(l.preview || "") + '"></div>' +
      '<div class="field full"><label>Next action</label><input id="f_next" value="' + esc(l.nextAction || "") + '"></div>' +
      '<div class="field full"><label>Notes</label><textarea id="f_notes">' + esc(l.notes || "") + '</textarea></div>' +
      '</div><div class="foot"><button class="btn" onclick="QIW.closeModal()">Cancel</button><button class="btn primary" onclick="QIW.saveLead()">Save lead</button></div></div>';
    $("scrim").classList.add("open");
    function fld(k, lab, v, type) { return '<div class="field"><label>' + lab + '</label><input id="f_' + k + '" ' + (type ? 'type="' + type + '"' : "") + ' value="' + esc(v == null ? "" : v) + '"></div>'; }
    function fldSel(k, lab, arr, v) { return '<div class="field"><label>' + lab + '</label><select id="f_' + k + '">' + opt(arr, v) + "</select></div>"; }
  }
  API.closeModal = function () { $("scrim").classList.remove("open"); };
  API.saveLead = function () {
    var g = function (k) { var e = $("f_" + k); return e ? e.value : ""; };
    if (!g("business").trim()) { $("f_business").focus(); return; }
    var d = { business: g("business"), owner: g("owner"), industry: g("industry"), city: g("city"), contact: g("contact"), phone: g("phone"), email: g("email"), presence: g("presence"), source: g("source"), model: g("model"), hook: g("hook"), monthly: +g("monthly") || 0, stage: g("stage"), preview: g("preview"), nextAction: g("next"), notes: g("notes") };
    d.updatedAt = Date.now();
    if (editing) { Object.assign(find(editing), d); } else { state.leads.unshift(Object.assign({ id: uid(), dateAdded: today(), log: [], oneTime: 0, lastTouch: "" }, d)); }
    $("scrim").classList.remove("open"); persist(); toast("Lead saved.");
  };

  // CSV
  var COLS = ["ID", "Date Added", "Owner", "Source", "Business", "Industry", "City", "Contact", "Phone", "Email", "Presence", "Hook", "Model", "One-Time $", "Monthly $", "Stage", "Last Touch", "Next Action", "Preview", "Notes"];
  var KEYS = ["id", "dateAdded", "owner", "source", "business", "industry", "city", "contact", "phone", "email", "presence", "hook", "model", "oneTime", "monthly", "stage", "lastTouch", "nextAction", "preview", "notes"];
  function csvCell(v) { v = v == null ? "" : String(v); return '"' + v.replace(/"/g, '""') + '"'; }
  function exportCSV() { var lines = [COLS.join(",")]; state.leads.forEach(function (l) { lines.push(KEYS.map(function (k) { return csvCell(l[k]); }).join(",")); }); dl("QIW_board_" + today() + ".csv", lines.join("\n"), "text/csv"); toast("Exported — paste rows into the Google Sheet."); }
  function dl(n, t, m) { var b = new Blob([t], { type: m }), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = n; a.click(); URL.revokeObjectURL(u); }
  function parseCSV(t) { var rows = [], i = 0, f = "", row = [], q = false; while (i < t.length) { var c = t[i]; if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; } else { if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; if (f !== "" || row.length) { row.push(f); rows.push(row); row = []; f = ""; } } else f += c; } i++; } if (f !== "" || row.length) { row.push(f); rows.push(row); } return rows; }
  function importCSV(file) { var r = new FileReader(); r.onload = function () { try { var rows = parseCSV(r.result); if (!rows.length) return; var hdr = rows[0].map(function (h) { return h.trim(); }), idx = {}; COLS.forEach(function (c, n) { idx[KEYS[n]] = hdr.indexOf(c); }); var out = []; for (var i = 1; i < rows.length; i++) { var rr = rows[i]; if (!rr.length || !rr[idx.business]) continue; var o = { log: [] }; KEYS.forEach(function (k) { o[k] = idx[k] >= 0 ? (rr[idx[k]] || "") : ""; }); o.monthly = +o.monthly || 0; if (!o.id) o.id = uid(); out.push(o); } if (out.length && confirm("Load " + out.length + " leads from the master CSV? This replaces the current board.")) { state.leads = out; persist(); toast("Imported " + out.length + " leads."); } } catch (e) { toast("Could not read that CSV."); } }; r.readAsText(file); }

  document.addEventListener("click", function (e) { var m = $("menu"); if (m && !m.contains(e.target)) m.classList.remove("open"); });

  // expose
  window.QIW = Object.assign({
    init: function (me) {
      ME = me;
      var saved = Store.load();
      if (saved && saved.leads && saved.leads.length) { state.leads = saved.leads; state.goal = saved.goal || me.motor.goal; state.checks = saved.checks || {}; }
      else { state.leads = []; state.goal = me.motor.goal; }
      state.deleted = (saved && saved.deleted) || [];
      state.tab = me.defaultTab || "All";
      shell(); render();
      if (Cloud.on()) Cloud.start();
    },
    boot: function (force) {
      var key = force; if (!key) { try { key = localStorage.getItem("qiw_ops_me"); } catch (e) {} }
      if (key && PEOPLE[key]) { this.init(PEOPLE[key]); } else { renderPicker(); }
    },
    switchUser: function (key) {
      if (!PEOPLE[key]) return;
      try { localStorage.setItem("qiw_ops_me", key); } catch (e) {}
      this.init(PEOPLE[key]);
    }
  }, API);
})();
