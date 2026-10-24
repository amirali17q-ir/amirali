const $ = (s) => document.querySelector(s), K = "amirali-friends";
const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let local = []; try { local = JSON.parse(localStorage.getItem(K) || "[]"); } catch (_) {}
const edit = location.hash === "#edit"; if (edit) { $("#form").classList.add("show"); document.body.classList.add("edit"); }
function save() { try { localStorage.setItem(K, JSON.stringify(local)); } catch (_) {} }
function render() {
  const all = FRIENDS.map((f) => ({ ...f, l: -1 })).concat(local.map((f, i) => ({ ...f, l: i })));
  $("#grid").innerHTML = all.length ? all.map((f) => `<article class="card f"><i>❄</i><h2>${esc(f.name)}</h2><p>${esc(f.note)}</p><small>${esc(f.years)}</small>${f.l >= 0 ? `<button class="btn x" data-i="${f.l}">حذف</button>` : ""}</article>`).join("")
    : '<p class="empty">هنوز اسمی اضافه نشده.</p>';
}
$("#form").addEventListener("submit", (e) => { e.preventDefault(); local.push({ name: $("#n").value.trim(), note: $("#nt").value.trim(), years: $("#y").value.trim() }); save(); e.target.reset(); render(); });
$("#grid").addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) { local.splice(+b.dataset.i, 1); save(); render(); } });
render();
