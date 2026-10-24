const $ = (s) => document.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
const IMG = "../images/";
let mood = null, queue = [], pos = -1, history = [], timer = null, paused = false, shown = 0, bgFlip = 0;

/* ---------- حال‌ها (دکمه‌های بالا) ---------- */
$("#moods").innerHTML = MOODS.map((m) => `<button class="chip" data-id="${m.id}"><span>${m.icon}</span>${m.name}</button>`).join("");
$("#moods").addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) setMood(b.dataset.id); });

const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- پس‌زمینه (عکس‌ها) ---------- */
function setBg(file) {
  const layers = [$("#bgA"), $("#bgB")];
  const next = layers[bgFlip = 1 - bgFlip], prev = layers[1 - bgFlip];
  const url = IMG + file, im = new Image();
  im.onload = im.onerror = () => { next.style.backgroundImage = `url("${url}")`; next.classList.add("on"); prev.classList.remove("on"); };
  im.src = url;
}

/* ---------- جمله‌ها ---------- */
function showLine(line, instant) {
  const q = $("#q");
  const apply = () => {
    $("#qt").textContent = line.t; $("#qa").textContent = line.by ? "— " + line.by : "";
    q.classList.toggle("poem", !!line.poem);
    requestAnimationFrame(() => q.classList.add("show"));
  };
  q.classList.remove("show");
  instant ? apply() : setTimeout(apply, reduce ? 150 : 1000);
  // هر دو جمله یه بار عکس عوض می‌شه
  if (shown++ % 2 === 0 && mood) setBg(mood.photos[Math.floor(shown / 2) % mood.photos.length]);
  schedule(line);
}
function schedule(line) {
  clearTimeout(timer);
  if (paused) return;
  const ms = Math.min(16000, Math.max(6500, 4500 + line.t.length * 70));
  timer = setTimeout(() => go(1), ms);
}
function go(d) {
  if (!mood) return;
  if (d > 0) {
    if (pos + 1 >= queue.length) { queue = shuffle(mood.lines.map((_, i) => i)); if (queue[0] === history[history.length - 1] && queue.length > 1) queue.push(queue.shift()); pos = -1; }
    pos++; history.push(queue[pos]);
  } else {
    if (history.length < 2) return;
    history.pop(); const prev = history[history.length - 1]; pos = Math.max(-1, pos - 1);
    return showLine(mood.lines[prev]);
  }
  showLine(mood.lines[queue[pos]]);
}
function setMood(id, first) {
  const m = MOODS.find((x) => x.id === id) || MOODS[0];
  mood = m; queue = []; pos = -1; history = []; shown = 0;
  document.body.style.setProperty("--c", m.color);
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c.dataset.id === m.id));
  $("#moodName").textContent = m.name;
  try { localStorage.setItem("amirali-mood", m.id); } catch (_) {}
  FX.set(m.fx, m.color);
  m.photos.slice(1).forEach((f) => { new Image().src = IMG + f; });
  go(1);
}

/* ---------- کنترل‌ها ---------- */
$("#next").addEventListener("click", (e) => { e.stopPropagation(); go(1); });
$("#prev").addEventListener("click", (e) => { e.stopPropagation(); go(-1); });
$("#pp").addEventListener("click", (e) => { e.stopPropagation(); togglePause(); });
$("#stage").addEventListener("click", () => go(1));
function togglePause() {
  paused = !paused; $("#pp").textContent = paused ? "▶" : "Ⅱ";
  if (paused) clearTimeout(timer); else go(1);
}
addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") go(1);
  else if (e.key === "ArrowRight") go(-1);
  else if (e.key === " ") { e.preventDefault(); togglePause(); }
  else if (/^[1-9]$/.test(e.key) && MOODS[+e.key - 1]) setMood(MOODS[+e.key - 1].id);
});

/* ---------- افکت‌ها (ستاره، جرقه، باران) ---------- */
const FX = (() => {
  const c = $("#fx"), x = c.getContext("2d");
  let w = 0, h = 0, dpr = 1, type = "stars", col = "#fff", P = [], raf = 0, last = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function size() { dpr = Math.min(devicePixelRatio || 1, 1.5); w = innerWidth; h = innerHeight; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function make() {
    const n = Math.round(Math.min(160, (w * h) / 9000));
    P = [];
    for (let i = 0; i < n; i++) {
      if (type === "stars") P.push({ x: rnd(0, w), y: rnd(0, h), r: rnd(.4, 1.6), t: rnd(0, 6.3), s: rnd(.4, 1.4), v: rnd(.01, .05) });
      else if (type === "embers") P.push({ x: rnd(0, w), y: rnd(0, h), r: rnd(1, 3.2), v: rnd(.15, .6), t: rnd(0, 6.3), sw: rnd(.2, .8), a: rnd(.3, .9) });
      else P.push({ x: rnd(0, w), y: rnd(-h, h), l: rnd(10, 26), v: rnd(6, 13), a: rnd(.08, .3) });
    }
  }
  function draw(dt) {
    x.clearRect(0, 0, w, h);
    for (const p of P) {
      if (type === "stars") {
        p.t += dt * .002 * p.s; p.y -= p.v * dt * .06; if (p.y < -2) { p.y = h + 2; p.x = rnd(0, w); }
        x.globalAlpha = .25 + .75 * Math.abs(Math.sin(p.t)); x.fillStyle = "#dfe8ff";
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.3); x.fill();
      } else if (type === "embers") {
        p.t += dt * .0015; p.y -= p.v * dt * .06; p.x += Math.sin(p.t) * p.sw * dt * .03;
        if (p.y < -10) { p.y = h + 10; p.x = rnd(0, w); }
        const al = p.a * Math.min(1, p.y / (h * .35)) ;
        const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, col); g.addColorStop(1, "transparent");
        x.globalAlpha = Math.max(0, al); x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, p.r * 5, 0, 6.3); x.fill();
      } else {
        p.y += p.v * dt * .06; p.x -= p.v * .25 * dt * .06;
        if (p.y > h + 30) { p.y = -30; p.x = rnd(0, w + 60); }
        x.globalAlpha = p.a; x.strokeStyle = "#bfeadf"; x.lineWidth = 1;
        x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.l * .25, p.y + p.l); x.stroke();
      }
    }
    x.globalAlpha = 1;
  }
  function loop(t) { const dt = Math.min(50, t - last || 16); last = t; draw(dt); raf = requestAnimationFrame(loop); }
  function run() { cancelAnimationFrame(raf); if (reduce) { draw(0); return; } last = 0; raf = requestAnimationFrame(loop); }
  addEventListener("resize", () => { size(); make(); if (reduce) draw(0); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else run(); });
  size();
  return { set(t, color) { type = t; col = color; make(); run(); } };
})();

/* ---------- شروع ---------- */
let start = MOODS[0].id;
try { const s = localStorage.getItem("amirali-mood"); if (MOODS.some((m) => m.id === s)) start = s; } catch (_) {}
setMood(start, true);
