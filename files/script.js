const $ = (s) => document.querySelector(s);
const toastBox = $("#toast"), entryModal = $("#entryModal"), video = $("#backgroundVideo"),
  videoBtn = $("#videoBtn"), soundBtn = $("#soundBtn"), videoStatus = $("#videoStatus");
let toastTimer;

// دو ویدیوی پس‌زمینه؛ هر بار که ویدیو روشن می‌شه یکی‌شون تصادفی انتخاب می‌شه.
const VIDEOS = ["media/video/god.mp4", "media/video/god2.mp4"];

function showToast(msg) {
  toastBox.textContent = msg;
  toastBox.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastBox.classList.remove("show"), 3200);
}

const isOn = () => document.body.classList.contains("video-mode");

function pickVideo() {
  let last = -1;
  try { last = +sessionStorage.getItem("amirali-last-video"); } catch (_) {}
  let i = Math.floor(Math.random() * VIDEOS.length);
  if (VIDEOS.length > 1 && i === last) i = (i + 1) % VIDEOS.length; // دو بار پشت هم تکراری نیاد
  try { sessionStorage.setItem("amirali-last-video", String(i)); } catch (_) {}
  return VIDEOS[i];
}

function updateDock() {
  const on = isOn();
  videoBtn.classList.toggle("on", on);
  videoBtn.setAttribute("aria-pressed", String(on));
  videoBtn.title = on ? "خاموش کردن ویدیو" : "روشن کردن ویدیو";
  soundBtn.disabled = !on;
  soundBtn.textContent = video.muted ? "🔇" : "🔊";
  soundBtn.title = video.muted ? "روشن کردن صدا" : "قطع صدا";
  videoStatus.textContent = !on ? "خاموش · برای روشن کردن بزن" : video.muted ? "روشن · بدون صدا" : "روشن · با صدای ویدیو";
}

async function setVideo(on) {
  document.body.classList.toggle("video-mode", on);
  if (!on) { video.pause(); updateDock(); return; }
  // هر بار که روشن می‌شه یه ویدیوی تصادفی
  video.src = pickVideo();
  video.muted = false;               // صدای خود ویدیو (این تابع از کلیک کاربر صدا زده می‌شه، پس مرورگر اجازه می‌ده)
  try {
    await video.play();
  } catch (_) {
    // اگه مرورگر صدا رو نذاشت، بی‌صدا شروع کن و بگو چطور صدا رو روشن کنه
    video.muted = true;
    try { await video.play(); showToast("برای شنیدن صدا، دکمه 🔇 پایین صفحه رو بزن."); }
    catch (_) { showToast("ویدیو اجرا نشد؛ فایل‌های داخل media/video رو چک کن."); }
  }
  updateDock();
}

video.addEventListener("error", () => {
  if (!isOn()) return;
  const other = VIDEOS.find((v) => !video.src.endsWith(v));
  if (other && !video.dataset.retried) { video.dataset.retried = "1"; video.src = other; video.play().catch(() => {}); }
  else showToast("ویدیو پیدا نشد؛ فایل‌های داخل media/video رو چک کن.");
});
video.addEventListener("playing", () => { delete video.dataset.retried; });

// وقتی تب مخفی می‌شه، ویدیو (و صداش) متوقف بشه
document.addEventListener("visibilitychange", () => {
  if (!isOn()) return;
  if (document.hidden) video.pause(); else video.play().catch(() => {});
});

async function chooseExperience(withVideo) {
  entryModal.classList.add("hidden");
  await setVideo(withVideo);
}
$("#withVideo").addEventListener("click", () => chooseExperience(true));
$("#withoutVideo").addEventListener("click", () => chooseExperience(false));
videoBtn.addEventListener("click", () => setVideo(!isOn()));
soundBtn.addEventListener("click", () => { video.muted = !video.muted; updateDock(); });

$("#menuToggle").addEventListener("click", () => {
  const open = $("#mainNav").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav-link").forEach((l) => l.addEventListener("click", () => {
  document.querySelectorAll(".nav-link").forEach((i) => i.classList.remove("active"));
  l.classList.add("active");
  $("#mainNav").classList.remove("open");
}));

$("#themeToggle").addEventListener("click", () => {
  const light = document.body.classList.toggle("light");
  try { localStorage.setItem("amirali-theme", light ? "light" : "dark"); } catch (_) {}
  showToast(light ? "تم روشن فعال شد." : "تم تیره فعال شد.");
});
try { if (localStorage.getItem("amirali-theme") === "light") document.body.classList.add("light"); } catch (_) {}

$("#copyId").addEventListener("click", async () => {
  const id = "@amir_ali_17q";
  try { await navigator.clipboard.writeText(id); showToast("آیدی کپی شد: " + id); }
  catch (_) { showToast("آیدی من: " + id); }
});
$("#year").textContent = new Date().getFullYear();
updateDock();
