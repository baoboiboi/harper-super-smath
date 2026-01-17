const DAILY_GOAL = 100;

/* DATE */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
const today = todayKey();

/* STORAGE */
let progress = JSON.parse(localStorage.getItem("progress")) || {};
let stars = Number(localStorage.getItem("stars")) || 0;
let theme = localStorage.getItem("theme") || "rainbow";

if (!progress[today]) progress[today] = { done: 0 };

/* DOM */
const qEl = document.getElementById("question");
const aEl = document.getElementById("answers");
const msgEl = document.getElementById("message");
const starsEl = document.getElementById("stars");
const todayEl = document.getElementById("todayDone");
const goalEl = document.getElementById("goal");

goalEl.textContent = DAILY_GOAL;
starsEl.textContent = stars;
todayEl.textContent = progress[today].done;

/* THEME */
function setTheme(name) {
  theme = name;
  localStorage.setItem("theme", name);
  document.body.style.background =
    name === "animals" ? "linear-gradient(#fff3e0,#ffe0b2)" :
    name === "space" ? "linear-gradient(#0d47a1,#1976d2)" :
    "linear-gradient(#fce4ec,#e3f2fd)";
}
setTheme(theme);

/* UTIL */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* MATH */
function newProblem() {
  let type = rand(1, 4);
  let a, b, ans, text;

  if (type === 1) { a = rand(10, 99); b = rand(10, 99); ans = a + b; text = `${a} + ${b}`; }
  if (type === 2) { a = rand(30, 99); b = rand(10, a); ans = a - b; text = `${a} - ${b}`; }
  if (type === 3) { a = rand(2, 9); b = rand(2, 9); ans = a * b; text = `${a} × ${b}`; }
  if (type === 4) { b = rand(2, 9); ans = rand(2, 9); a = b * ans; text = `${a} ÷ ${b}`; }

  qEl.textContent = `${text} = ?`;
  showAnswers(ans);
}

/* ANSWERS */
function showAnswers(correct) {
  aEl.innerHTML = "";
  msgEl.textContent = "";

  let opts = new Set([correct]);
  while (opts.size < 4) opts.add(correct + rand(-10, 10));

  [...opts].sort(() => Math.random() - 0.5).forEach(v => {
    let btn = document.createElement("button");
    btn.textContent = v;
    btn.onclick = () => {
      if (v === correct) {
        stars++;
        progress[today].done++;
        localStorage.setItem("stars", stars);
        localStorage.setItem("progress", JSON.stringify(progress));
        starsEl.textContent = stars;
        todayEl.textContent = progress[today].done;
        msgEl.textContent = "🎉 Great job!";
        setTimeout(newProblem, 500);
      } else {
        msgEl.textContent = "💛 Try again!";
      }
    };
    aEl.appendChild(btn);
  });
}

/* START */
newProblem();
