import QRCode from "qrcode";
import "./style.css";
import {
  STORAGE_KEY,
  emptyState,
  readState,
  completeMission,
  progress,
  validateAllocation,
} from "./state.mjs";

const $ = (selector, root = document) => root.querySelector(selector);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let state;
try {
  state = readState(localStorage.getItem(STORAGE_KEY));
} catch {
  state = emptyState();
}
let toastTimer,
  shareGeneration = 0;
const dialog = $("#action-dialog");
const icons = {
  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  diagonal:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 18 18 6M6 6h12v12"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>',
  sparkle:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m16 2 3.7 10.3L30 16l-10.3 3.7L16 30l-3.7-10.3L2 16l10.3-3.7Z"/></svg>',
  logo: '<svg viewBox="0 0 40 40" fill="none"><path d="m20 4 13 16-13 16L7 20Z" fill="currentColor"/><circle cx="20" cy="19" r="4" fill="#15121c"/><path d="m25 26 10 10" stroke="currentColor" stroke-width="4"/></svg>',
};
const missions = [
  {
    id: "signal",
    number: "01",
    category: "CAST YOUR SIGNAL",
    title: "Back the next big idea.",
    description:
      "Three tiny startups. One vote. Which one would you actually use?",
    time: "30 sec",
    xp: 100,
    class: "signal",
    art: '<div class="signal-rings"><i></i><i></i><i></i><b>↗</b></div>',
  },
  {
    id: "remix",
    number: "02",
    category: "MAKE IT YOURS",
    title: "Remix the experience.",
    description: "You have 100 points. Design the event you wish existed.",
    time: "45 sec",
    xp: 150,
    class: "remix",
    art: '<div class="mix-bars"><i></i><i></i><i></i><span>100</span></div>',
  },
  {
    id: "spark",
    number: "03",
    category: "LEAVE A SPARK",
    title: "A thought worth keeping.",
    description: "Tell us what worked—and what would make you come back.",
    time: "45 sec",
    xp: 200,
    class: "spark",
    art: '<div class="spark-shape">✳</div>',
  },
];

function notify(text) {
  clearTimeout(toastTimer);
  $("#toast").textContent = text;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3600);
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    notify(
      "Progress is available for this visit. Browser storage is unavailable.",
    );
    return false;
  }
}
function emit(type) {
  document.dispatchEvent(
    new CustomEvent("questpass:action", { detail: { type } }),
  );
}
function openDialog(body, className = "") {
  shareGeneration++;
  dialog.className = className;
  dialog.innerHTML = `<button type="button" class="close" data-action="close" aria-label="Close dialog">×</button>${body}`;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  const title = $("#dialog-title");
  title.tabIndex = -1;
  title.focus({ preventScroll: true });
}
function explore() {
  $("#missions").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
}
function render() {
  const p = progress(state),
    handle = state.pass ? escape(state.pass.handle) : "YOUR NAME HERE";
  $("#app").innerHTML = `
    <div class="ambient ambient-a"></div><div class="ambient ambient-b"></div>
    <header class="site-header"><a class="brand" href="#" aria-label="QuestPass home">${icons.logo}<span>quest<span>pass</span><sup>✳</sup></span></a>
      <nav aria-label="Main navigation"><a class="active" href="#missions">Explore missions</a><button class="nav-pass" data-action="passport">Your passport</button></nav>
      <button class="header-cta" data-action="${state.pass ? "passport" : "create"}">${state.pass ? `${escape(state.pass.handle)} <span class="avatar">${escape(state.pass.handle.slice(0, 1).toUpperCase())}</span>` : `Get your pass ${icons.diagonal}`}</button>
    </header>
    <main>
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy"><div class="eyebrow"><span class="pulse-dot"></span> THE BUILDER EDITION <span class="divider">/</span> SINGAPORE</div>
          <h1 id="hero-title">Be part of<br>what’s <span class="next">next<svg viewBox="0 0 240 18" aria-hidden="true"><path d="M3 13Q94-4 236 9"/></svg></span><span class="period">.</span></h1>
          <p>A little curiosity. A few bold choices.<br>Turn your next event into a story worth collecting.</p>
          <div class="hero-actions"><button class="primary" data-action="${state.pass ? "explore" : "create"}">${state.pass ? "Find your next mission" : "Start your adventure"} ${icons.arrow}</button><span class="small-note">No wallet. No friction.<br>Just show up curious.</span></div>
          <div class="hero-meta"><span>${icons.sparkle} 3 short missions</span><span class="dot-separator">·</span><span>One passport that’s yours.</span></div>
        </div>
        <div class="passport-stage" aria-label="Your interactive event passport"><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><span class="orbit-label">GOOD IDEAS START WITH YOU</span><span class="floating-star star-a">✳</span><span class="floating-star star-b">✧</span>
          <div class="pass-ticket" data-tilt><div class="ticket-grain"></div><div class="ticket-top"><span>QUESTPASS™<small>BUILDER EDITION / 001</small></span>${icons.logo}</div>
            <div class="ticket-center"><span class="ticket-spark">✳</span><span class="ticket-orbit"></span><span class="ticket-orbit second"></span><div class="ticket-word">STAY<br><i>CURIOUS.</i></div></div>
            <div class="ticket-bottom"><div><small>ADMIT ONE CURIOUS HUMAN</small><strong>${handle}</strong></div><span class="ticket-code">SG<br>001</span></div><div class="ticket-tear"></div><div class="ticket-stub"><span>${state.pass ? `QP-${state.pass.id.toUpperCase()}` : "YOUR NEXT CHAPTER STARTS HERE"}</span><div class="barcode"></div></div>
          </div><div class="floating-pill">${icons.check}<span>${state.pass ? `${p.count} of 3 stamps collected` : "Your curiosity is the entry ticket"}</span></div>
        </div>
      </section>
      <section class="progress-strip" aria-label="Your progress"><div class="progress-intro"><span class="status-mark">${state.pass ? "↗" : "✧"}</span><div><strong>${state.pass ? `Your story is ${p.finished ? "complete" : "just getting started"}.` : "Every great connection starts with a small action."}</strong><span>${state.pass ? `${p.count} missions completed · ${p.xp} XP earned on this device` : "Create a pass. Pick a mission. Make your mark."}</span></div></div><div class="stamp-progress">${missions.map((m) => `<span class="mini-stamp ${state.completed[m.id] ? "collected" : ""}" aria-label="Mission ${m.number} ${state.completed[m.id] ? "completed" : "not completed"}">${state.completed[m.id] ? icons.check : m.number}</span>`).join("")}<span class="progress-count">${p.count}<small>/ 3</small></span></div></section>
      <section id="missions" class="missions-section" aria-labelledby="missions-title"><div class="section-heading"><div><div class="eyebrow muted">LESS SCROLLING. MORE DOING.</div><h2 id="missions-title">Small missions. <span>Real moments.</span></h2></div><span class="section-label"><span class="pulse-dot"></span> OPEN TO EVERYONE</span></div>
        <div class="mission-grid">${missions.map((m) => `<article class="mission-card ${m.class} ${state.completed[m.id] ? "is-complete" : ""}"><div class="card-art"><div class="art-grid"></div>${m.art}<span class="card-number">/${m.number}</span><span class="reward-pill">${state.completed[m.id] ? "✓ COLLECTED" : `+${m.xp} XP`}</span></div><div class="card-copy"><div class="card-category">${m.category}</div><h3>${m.title}</h3><p>${m.description}</p><div class="card-footer"><span class="duration"><span>◷</span> ${m.time}</span><button class="mission-link" data-action="mission" data-mission="${m.id}">${state.completed[m.id] ? "View your stamp" : "Take the mission"} ${state.completed[m.id] ? icons.check : icons.diagonal}</button></div></div></article>`).join("")}</div>
      </section>
      <section class="passport-banner"><div class="banner-icon">✳</div><div><div class="eyebrow muted">YOUR NEXT FLEX</div><h2>${p.finished ? "You showed up. You made your mark." : "Don’t collect swag. Collect stories."}</h2><p>${p.finished ? "Your Builder Edition passport is ready. Download it and take the story with you." : "Complete all three missions to unlock your own Builder Edition passport."}</p></div><button class="secondary" data-action="passport">${p.finished ? "Reveal your passport" : "Preview your passport"} ${icons.arrow}</button></section>
      <section class="how-section"><span class="eyebrow muted">A BETTER WAY TO SHOW UP</span><div><span>01</span><h3>Make it yours.</h3><p>A handle and a little curiosity. That’s all you need.</p></div><div><span>02</span><h3>Follow the spark.</h3><p>Explore ideas, make choices, leave something useful.</p></div><div><span>03</span><h3>Keep the story.</h3><p>Unlock a passport that celebrates your participation.</p></div></section>
    </main><footer><a class="brand footer-brand" href="#">${icons.logo}<span>quest<span>pass</span></span></a><p>An independent product experiment.<br>Progress is saved on this device. XP and stamps have no monetary value.</p><div><a href="https://launchlab.stardive.xyz/" target="_blank" rel="noopener">Built to launch with LaunchLab ${icons.diagonal}</a><button class="text-button" data-action="reset">Reset my demo</button></div></footer>`;
  const tilt = $("[data-tilt]");
  if (
    matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)")
      .matches
  ) {
    tilt.addEventListener("pointermove", (e) => {
      const r = tilt.getBoundingClientRect();
      tilt.style.transform = `rotateY(${((e.clientX - r.left) / r.width - 0.5) * 12}deg) rotateX(${(0.5 - (e.clientY - r.top) / r.height) * 10}deg) rotate(-8deg)`;
    });
    tilt.addEventListener("pointerleave", () => {
      tilt.style.transform = "";
    });
  }
}

function createPass() {
  openDialog(
    `<div class="modal-icon lime">${icons.sparkle}</div><div class="eyebrow muted">FIRST, MAKE IT YOURS</div><h2 id="dialog-title">One pass.<br>Endless possibility.</h2><p class="dialog-subtitle">Pick a handle. No email, wallet or account needed.</p><form id="create-pass"><label for="handle">What should we call you?</label><input id="handle" name="handle" autocomplete="off" placeholder="Your handle" minlength="2" maxlength="24" pattern="[A-Za-z0-9 _-]{2,24}" required aria-describedby="handle-help"><small id="handle-help">2–24 letters, numbers, spaces, underscores or dashes.</small><fieldset><legend>Your energy today</legend><div class="choice-row role-choices">${["Builder", "Explorer", "Connector"].map((r, i) => `<label class="radio-chip"><input type="radio" name="role" value="${r}" ${i === 0 ? "checked" : ""}><span>${["↗", "✳", "◎"][i]} ${r}</span></label>`).join("")}</div></fieldset><button class="primary full" type="submit">Create my pass ${icons.arrow}</button><p class="form-footnote">Saved on this device. You can reset it at any time.</p></form>`,
  );
  $("#create-pass").onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget),
      handle = data.get("handle").trim();
    if (!/^[A-Za-z0-9 _-]{2,24}$/.test(handle)) {
      $("#handle").setCustomValidity(
        "Use 2–24 letters, numbers, spaces, underscores or dashes.",
      );
      $("#handle").reportValidity();
      return;
    }
    state = {
      ...emptyState(),
      pass: {
        handle,
        role: data.get("role"),
        id: crypto.randomUUID().replaceAll("-", "").slice(0, 8),
      },
    };
    persist();
    emit("pass_created");
    dialog.close();
    render();
    celebrate(false);
    notify(`You’re in, ${handle}. Pick your first mission.`);
    explore();
  };
  $("#handle").oninput = () => $("#handle").setCustomValidity("");
}

function openMission(id) {
  if (!state.pass) {
    createPass();
    return;
  }
  if (state.completed[id]) {
    passport();
    return;
  }
  emit("mission_opened");
  if (id === "signal") {
    openDialog(
      `<div class="eyebrow muted">MISSION 01 / +100 XP</div><h2 id="dialog-title">Which idea<br>gets your signal?</h2><p class="dialog-subtitle">These are concepts, not live services. Pick the one you would actually try.</p><form id="signal-form"><div class="concept-list">${[
        [
          "splitwave",
          "↗",
          "Splitwave",
          "Split a group bill. See who owes whom. Settle in USDT.",
          "MONEY, WITHOUT THE AWKWARD",
        ],
        [
          "linkdrop",
          "◈",
          "Linkdrop",
          "One payment link for a creator’s digital drops.",
          "SMALL CREATORS. BIG IDEAS.",
        ],
        [
          "localperks",
          "◎",
          "Local Perks",
          "A neighborhood passport for independent shops and shared rewards.",
          "YOUR CITY, MORE CONNECTED",
        ],
      ]
        .map(
          ([id, icon, title, description, tag]) =>
            `<label class="concept-option"><input type="radio" name="concept" value="${id}" required><span class="concept-icon">${icon}</span><span><small>${tag}</small><strong>${title}</strong><span>${description}</span></span><span class="radio-dot"></span></label>`,
        )
        .join(
          "",
        )}</div><button class="primary full" type="submit">Cast my signal ${icons.arrow}</button></form>`,
    );
    $("#signal-form").onsubmit = (e) => {
      e.preventDefault();
      finish("signal", new FormData(e.currentTarget).get("concept"));
    };
  } else if (id === "remix") {
    openDialog(
      `<div class="eyebrow muted">MISSION 02 / +150 XP</div><h2 id="dialog-title">Your event.<br>Your rules.</h2><p class="dialog-subtitle">Spend exactly 100 points on the things that matter to you. There’s no right answer.</p><form id="remix-form"><div class="budget"><span>POINTS TO SPEND</span><strong id="budget-left">0</strong><small id="budget-note">Perfect. That’s your 100-point mix.</small></div><div class="sliders">${[
        [
          "Demos that actually work",
          "See it. Try it. Ask the hard questions.",
          40,
        ],
        ["People worth meeting", "Less small talk. More shared ambition.", 35],
        [
          "Room to recharge",
          "Good food, music and unplanned conversations.",
          25,
        ],
      ]
        .map(
          ([label, note, value], i) =>
            `<label class="slider-row" for="mix-${i}"><span><strong>${label}</strong><small>${note}</small></span><output for="mix-${i}" id="mix-value-${i}">${value}</output><input type="range" id="mix-${i}" min="0" max="100" step="5" value="${value}"></label>`,
        )
        .join(
          "",
        )}</div><button class="primary full" type="submit" id="save-mix">Lock in my mix ${icons.arrow}</button><p class="error-line" id="mix-error" role="status"></p></form>`,
    );
    const values = () => [0, 1, 2].map((i) => Number($(`#mix-${i}`).value));
    $(".sliders").oninput = () => {
      const amounts = values(),
        left = 100 - amounts.reduce((a, b) => a + b, 0);
      amounts.forEach((n, i) => ($(`#mix-value-${i}`).textContent = n));
      $("#budget-left").textContent = left;
      $(".budget").classList.toggle("over", left < 0);
      $("#budget-note").textContent =
        left === 0
          ? "Perfect. That’s your 100-point mix."
          : left > 0
            ? "Keep going. Put every point to work."
            : `You’re ${-left} points over. Adjust your mix.`;
      $("#mix-error").textContent = "";
    };
    $("#remix-form").onsubmit = (e) => {
      e.preventDefault();
      const amounts = values();
      if (!validateAllocation(amounts)) {
        $("#mix-error").textContent =
          "Allocate exactly 100 points before collecting your stamp.";
        return;
      }
      finish("remix", amounts);
    };
  } else if (id === "spark") {
    openDialog(
      `<div class="eyebrow muted">MISSION 03 / +200 XP</div><h2 id="dialog-title">Leave a little<br>spark behind.</h2><p class="dialog-subtitle">Honest criticism counts just as much as enthusiasm.</p><form id="spark-form"><fieldset><legend>Would you use a passport like this at an event?</legend><div class="choice-row">${[
        ["yes", "Absolutely"],
        ["maybe", "Maybe"],
        ["no", "Not for me"],
      ]
        .map(
          ([v, label]) =>
            `<label class="radio-chip"><input type="radio" name="intent" value="${v}" required><span>${label}</span></label>`,
        )
        .join(
          "",
        )}</div></fieldset><label for="spark-comment">What would make this worth your time?</label><textarea id="spark-comment" name="comment" rows="4" minlength="8" maxlength="500" required placeholder="A perk, a better mission, something we missed…"></textarea><div class="text-meta"><small>Keep personal information out of your response.</small><span id="characters">0 / 500</span></div><button class="primary full" type="submit">Save my spark ${icons.sparkle}</button><p class="form-footnote">Your response is saved to this device’s demo pass.</p></form>`,
    );
    $("#spark-comment").oninput = () => {
      $("#spark-comment").setCustomValidity("");
      $("#characters").textContent =
        `${$("#spark-comment").value.length} / 500`;
    };
    $("#spark-form").onsubmit = (e) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget),
        comment = data.get("comment").trim();
      if (comment.length < 8) {
        $("#spark-comment").setCustomValidity(
          "Add at least 8 characters of feedback.",
        );
        $("#spark-comment").reportValidity();
        return;
      }
      finish("spark", { intent: data.get("intent"), comment });
    };
  }
}

function finish(id, response) {
  state = completeMission(state, id, response);
  persist();
  emit(`${id}_completed`);
  render();
  const p = progress(state);
  celebrate(p.finished);
  openDialog(
    `<div class="stamp-reveal ${p.finished ? "all-done" : ""}"><span class="stamp-big">${p.finished ? "✳" : "✓"}</span><div class="eyebrow">${p.finished ? "ALL THREE. ALL YOU." : "A LITTLE ACTION. A NEW CHAPTER."}</div><h2 id="dialog-title">${p.finished ? "You made<br>your mark." : "Stamp collected."}</h2><p>${p.finished ? "Your Builder Edition passport is unlocked. Take your story with you." : `${p.count} of 3 missions complete. Your next spark is waiting.`}</p><span class="xp-award">+${missions.find((m) => m.id === id).xp} XP</span><button class="primary full" data-action="${p.finished ? "passport" : "next"}">${p.finished ? "Reveal my passport" : "On to the next"} ${icons.arrow}</button></div>`,
    "celebration-dialog",
  );
}

function passport() {
  if (!state.pass) {
    createPass();
    return;
  }
  const p = progress(state);
  openDialog(
    `<div class="eyebrow muted">YOUR BUILDER EDITION</div><h2 id="dialog-title">A story you<br>can keep.</h2><div class="passport-preview"><div class="passport-top"><span>QUESTPASS™</span><span>SINGAPORE / 001</span></div><div class="passport-center">✳<small>${p.finished ? "CURIOUS. CONNECTED. COMPLETE." : "THE STORY IS STILL UNFOLDING."}</small></div><strong class="passport-name">${escape(state.pass.handle)}</strong><div class="passport-detail"><span>${escape(state.pass.role)} · QP-${state.pass.id.toUpperCase()}</span><span>${p.xp} XP</span></div><div class="passport-stamps">${missions.map((m) => `<div class="${state.completed[m.id] ? "stamped" : ""}"><span>${state.completed[m.id] ? ["↗", "≋", "✳"][Number(m.number) - 1] : "○"}</span><small>${m.category}</small></div>`).join("")}</div></div><p class="passport-note">${p.finished ? "All missions complete. Download your commemorative pass." : "Collect all three stamps to unlock the downloadable pass."} This is a demo keepsake, not a ticket, token or onchain credential.</p><div class="passport-actions"><button class="primary" data-action="${p.finished ? "download" : "next"}">${p.finished ? "Download passport" : "Keep exploring"} ${icons.arrow}</button><button class="secondary" data-action="share" aria-label="Share QuestPass">Share ${icons.diagonal}</button></div>`,
    "passport-dialog",
  );
}

async function share() {
  const publicUrl = new URL(location.pathname, location.origin).href;
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  openDialog(
    `<div class="eyebrow muted">GOOD THINGS ARE BETTER SHARED</div><h2 id="dialog-title">Bring someone<br>curious.</h2><p class="dialog-subtitle">${local ? "This preview is running on this computer. A scannable event link becomes available once it is published." : "Scan to start your own adventure. Everyone gets their own pass."}</p><div class="share-code" id="share-code">${local ? '<span class="share-placeholder">↗</span>' : "Preparing your QR code…"}</div><label for="share-url">${local ? "Local preview address" : "Event link"}</label><input id="share-url" readonly value="${escape(publicUrl)}"><button class="primary full" data-action="copy">Copy link ${icons.arrow}</button>`,
  );
  const generation = shareGeneration;
  if (!local) {
    try {
      const url = await QRCode.toDataURL(publicUrl, {
        width: 250,
        margin: 2,
        color: { dark: "#17131e", light: "#ffffff" },
      });
      if (dialog.open && generation === shareGeneration) {
        const img = new Image();
        img.src = url;
        img.alt = "QR code linking to this QuestPass event";
        $("#share-code").replaceChildren(img);
      }
    } catch {
      if (dialog.open && generation === shareGeneration)
        $("#share-code").textContent = "QR unavailable. Use the link below.";
    }
  }
}

function download() {
  if (!progress(state).finished) return;
  const handle = escape(state.pass.handle),
    id = escape(state.pass.id.toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#c9ff78"/><stop offset="1" stop-color="#a9dacd"/></linearGradient></defs><rect width="900" height="1200" rx="60" fill="#15121c"/><rect x="40" y="40" width="820" height="1120" rx="40" fill="url(#g)"/><g fill="#17131e" font-family="Arial,sans-serif"><text x="95" y="130" font-size="36" font-weight="bold">QUESTPASS™</text><text x="95" y="175" font-size="16" letter-spacing="4">SINGAPORE · BUILDER EDITION</text><circle cx="450" cy="415" r="158" fill="none" stroke="#17131e" stroke-width="2"/><text x="450" y="478" text-anchor="middle" font-size="215">✳</text><text x="95" y="705" font-size="64" font-weight="bold">STAY CURIOUS.</text><text x="95" y="785" font-size="44" font-weight="bold">${handle}</text><text x="95" y="825" font-size="20">QP-${id} · ${escape(state.pass.role)} · 450 XP</text><path d="M95 860h710" stroke="#17131e"/><text x="95" y="940" font-size="24" font-weight="bold">✓ SIGNAL    ✓ REMIX    ✓ SPARK</text><text x="95" y="1000" font-size="18">Three missions. One story. Yours.</text><text x="95" y="1090" font-size="14">Demo keepsake · no monetary value · not an onchain credential</text></g></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `questpass-${state.pass.id}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  emit("passport_downloaded");
  notify("Your passport is ready to keep.");
}

function celebrate(big) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = $("#celebration");
  layer.replaceChildren();
  for (let i = 0; i < (big ? 65 : 25); i++) {
    const piece = document.createElement("i");
    piece.style.cssText = `--x:${Math.random() * 100}vw;--delay:${Math.random() * 0.45}s;--spin:${Math.random() * 900 - 450}deg;background:${["#c9ff78", "#c8b3ff", "#ff9dc7", "#fff"][i % 4]}`;
    layer.append(piece);
  }
  setTimeout(() => layer.replaceChildren(), 2400);
}

document.addEventListener("click", async (e) => {
  const button = e.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "create") createPass();
  else if (action === "close") dialog.close();
  else if (action === "mission") openMission(button.dataset.mission);
  else if (action === "passport") passport();
  else if (action === "explore") explore();
  else if (action === "next") {
    const next = missions.find((m) => !state.completed[m.id]);
    if (next) openMission(next.id);
    else passport();
  } else if (action === "share") await share();
  else if (action === "copy") {
    try {
      await navigator.clipboard.writeText($("#share-url").value);
      notify("Link copied.");
    } catch {
      $("#share-url").select();
      notify("Select and copy the link above.");
    }
  } else if (action === "download") download();
  else if (action === "reset")
    openDialog(
      `<div class="eyebrow muted">A FRESH START</div><h2 id="dialog-title">Reset this<br>demo pass?</h2><p class="dialog-subtitle">This removes your handle, mission choices and feedback from this device. Download your completed passport first if you want to keep it.</p><div class="passport-actions"><button class="secondary" data-action="close">Keep my pass</button><button class="primary" data-action="confirm-reset">Reset pass</button></div>`,
    );
  else if (action === "confirm-reset") {
    state = emptyState();
    persist();
    dialog.close();
    render();
    notify("A blank page. A new adventure.");
  }
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    state = readState(e.newValue);
    dialog.close();
    render();
  }
});
render();
