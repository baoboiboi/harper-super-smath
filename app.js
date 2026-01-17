/* ================= SETTINGS ================= */
let settings = JSON.parse(localStorage.getItem("settings")) || {
  goal: 100,
  difficulty: "normal",
  sound: true
};

/* ================= DATE ================= */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
const today = todayKey();

/* ================= STORAGE ================= */
let progress = JSON.parse(localStorage.getItem("progress")) || {};
let stars = Number(localStorage.getItem("stars")) || 0;
let soundOn = settings.sound;
let currentTheme = localStorage.getItem("theme") || "rainbow";

if (!progress[today]) progress[today] = { done: 0 };

/* ================= THEMES ================= */
const themes = {
  animals: { button: "#FFB74D", mascot: "🐶" },
  space: { button: "#1B9AAA", mascot: "🚀" },
  rainbow: { button: "#BA68C8", mascot: "🌈" }
};

function applyTheme(name) {
  const t = themes[name];
  document.querySelector(".mascot").textContent = t.mascot;
  document.querySelectorAll(".answers button").forEach(b => {
    b.style.background = t.button;
  });
  currentTheme = name;
  localStorage.setItem("theme", name);
}

/* ================= DOM ================= */
const question = document.getElementById("question");
const answers = document.getElementById("answers");
const msg = document.getElementById("msg");
const starsEl = document.getElementById("stars");
const todayDone = document.getElementById("todayDone");
const goalNum = document.getElementById("goalNum");
const muteBtn = document.getElementById("muteBtn");

/* Parent Panel */
const parentPanel = document.getElementById("parentPanel");
const parentGoal = document.getElementById("parentGoal");
const parentDifficulty = document.getElementById("parentDifficulty");
const parentSound = document.getElementById("parentSound");
const closeParentBtn = document.getElementById("closeParent");
const resetProgressBtn = document.getElementById("resetProgress");

/* Sounds */
const correctSound = document.getElementById("sound-correct");
const wrongSound = document.getElementById("sound-wrong");

/* ================= SAFE SOUND ================= */
function playSound(audio) {
  if (!soundOn) return;
  try {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {}
}

/* ================= UI INIT ================= */
goalNum.textContent = settings.goal;
starsEl.textContent = stars;
todayDone.textContent = progress[today].done;
muteBtn.textContent = soundOn ? "🔊" : "🔇";

/* ================= SOUND TOGGLE ================= */
muteBtn.onclick = () => {
  soundOn = !soundOn;
  settings.sound = soundOn;
  localStorage.setItem("settings", JSON.stringify(settings));
  muteBtn.textContent = soundOn ? "🔊" : "🔇";
};

/* ================= UTIL ================= */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ================= MATH ================= */
function generateProblem() {
  let a, b, ans, op;

  if (settings.difficulty === "easy") {
    a = rand(1, 20);
    b = rand(1, 20);
    ans = a + b;
    op = "+";
  }

  if (settings.difficulty === "normal") {
    const t = rand(1, 4);
    if (t === 1) { a = rand(10,99); b = rand(10,99); ans = a + b; op = "+"; }
    if (t === 2) { a = rand(30,99); b = rand(10,a); ans = a - b; op = "-"; }
    if (t === 3) { a = rand(2,9); b = rand(2,9); ans = a * b; op = "×"; }
    if (t === 4) { b = rand(2,9); ans = rand(2,9); a = b * ans; op = "÷"; }
  }

  if (settings.difficulty === "hard") {
    a = rand(20,200);
    b = rand(10,20);
    ans = a * b;
    op = "×";
  }

  return { q: `${a} ${op} ${b} = ?`, a: ans };
}

function choices(ans) {
  const set = new Set([ans]);
  while (set.size < 4) set.add(ans + rand(-10, 10));
  return [...set].sort(() => Math.random() - 0.5);
}

/* ================= GAME ================= */
function load() {
  if (progress[today].done >= settings.goal) {
    progress[today].done = 0;
  }

  const { q, a } = generateProblem();
  question.textContent = q;
  msg.textContent = "";
  answers.innerHTML = "";

  choices(a).forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c;
    btn.onclick = () => {
      if (c === a) {
        playSound(correctSound);
        stars++;
        progress[today].done++;
        localStorage.setItem("stars", stars);
        localStorage.setItem("progress", JSON.stringify(progress));
        starsEl.textContent = stars;
        todayDone.textContent = progress[today].done;
        load();
      } else {
        playSound(wrongSound);
        msg.textContent = "💛 Try again!";
      }
    };
    answers.appendChild(btn);
  });

  applyTheme(currentTheme);
}

/* ================= PARENT MODE ================= */
let taps = 0;
document.getElementById("appTitle").onclick = () => {
  taps++;
  if (taps >= 5) {
    parentPanel.classList.remove("hidden");
    parentGoal.value = settings.goal;
    parentDifficulty.value = settings.difficulty;
    parentSound.value = settings.sound ? "on" : "off";
    taps = 0;
  }
};

closeParentBtn.onclick = () => {
  settings.goal = Number(parentGoal.value);
  settings.difficulty = parentDifficulty.value;
  settings.sound = parentSound.value === "on";
  soundOn = settings.sound;

  localStorage.setItem("settings", JSON.stringify(settings));

  goalNum.textContent = settings.goal;
  muteBtn.textContent = soundOn ? "🔊" : "🔇";

  parentPanel.classList.add("hidden");
  load();
};

resetProgressBtn.onclick = () => {
  if (!confirm("Reset all progress?")) return;

  progress = {};
  progress[today] = { done: 0 };
  stars = 0;

  localStorage.removeItem("progress");
  localStorage.removeItem("stars");

  starsEl.textContent = 0;
  todayDone.textContent = 0;

  parentPanel.classList.add("hidden");
  load();
};

/* ================= START ================= */
load();
