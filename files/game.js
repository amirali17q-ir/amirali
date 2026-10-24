const $ = (s) => document.querySelector(s);
const E = ["✊", "✋", "✌️"], N = ["سنگ", "کاغذ", "قیچی"], sc = { w: 0, d: 0, l: 0 };
$("#t1").onclick = () => tab(1); $("#t2").onclick = () => tab(2);
function tab(n) { $("#g1").hidden = n !== 1; $("#g2").hidden = n !== 2; $("#t1").classList.toggle("on", n === 1); $("#t2").classList.toggle("on", n === 2); }
document.querySelectorAll(".pick button").forEach((b) => b.onclick = () => {
  const p = +b.dataset.p, c = Math.floor(Math.random() * 3), r = (p - c + 3) % 3; // 0 مساوی، 1 برد، 2 باخت
  const k = r === 0 ? "d" : r === 1 ? "w" : "l"; sc[k]++;
  const msg = r === 0 ? "مساوی شد" : r === 1 ? "بردی 🔥" : "باختی 💀";
  $("#r1").innerHTML = `${E[p]} ${N[p]} در برابر ${E[c]} ${N[c]}<br><span class="${r === 1 ? "win" : r === 2 ? "lose" : ""}">${msg}</span>`;
  $("#w").textContent = sc.w; $("#d").textContent = sc.d; $("#l").textContent = sc.l;
});
let secret, left, over;
function start() { secret = 1 + Math.floor(Math.random() * 100); left = 7; over = false; $("#left").textContent = left; $("#num").value = ""; $("#r2").textContent = "یه عدد بین ۱ تا ۱۰۰ تو ذهنمه. ۷ بار فرصت داری."; }
function guess() {
  if (over) return;
  const v = parseInt($("#num").value, 10);
  if (!(v >= 1 && v <= 100)) { $("#r2").textContent = "یه عدد بین ۱ تا ۱۰۰ وارد کن."; return; }
  left--; $("#left").textContent = left; $("#num").value = "";
  if (v === secret) { over = true; $("#r2").innerHTML = `<span class="win">درسته! عدد ${secret} بود 🎉</span>`; }
  else if (left === 0) { over = true; $("#r2").innerHTML = `<span class="lose">تموم شد. عدد ${secret} بود.</span>`; }
  else $("#r2").textContent = v < secret ? "بالاتر برو ⬆️" : "پایین‌تر بیا ⬇️";
}
$("#go").onclick = guess; $("#again").onclick = start;
$("#num").addEventListener("keydown", (e) => { if (e.key === "Enter") guess(); });
start();
