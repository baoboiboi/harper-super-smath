/***********************
 * CONFIG
 ***********************/
const DAILY_GOAL = 100;

/***********************
 * DATE & STORAGE
 ***********************/
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const today = todayKey();

let progress = JSON.parse(localStorage.getItem("progress")) || {};
let stars = Number(localStorage.getItem("stars")) || 0;
let currentTheme = localStorage.getItem("theme") || "rainbow";

if (!progress[today]) {
  progress[today] = { done: 0 };
}

/***********************
 * THEMES
 ***********************/
const themes = {
  animals: {
    bg: "#FFF3E0",
    button: "#FFB74D",
    emoji: "🐶"
  },
  space: {
    bg: "#0D1B2A",
    button: "#1B9AAA",
    emoji: "🚀"
  },
  rainbow: {
    bg: "#FCE4EC",
    button: "#BA68C8",
    emoji: "🌈"
  }
};

function applyTheme(name) {
  const t = themes[name];
  if (!t) return;

  document.body.style.background = t.bg;

  document.querySelectorAll("button").forEach(b => {
    b.style.background = t.button;
  });

  currentTheme = name;
  localStorage.setItem("theme", name);
}

/***********************
 * UTILITIES
 ***********************/
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/***********************
 * MATH GENERATOR
 ***********************/
function generateProblem() {
  const type = randomInt(1, 4);
  let a, b, question, answer;

  if (type === 1) {
    a = randomInt(10, 99);
    b = randomInt(10, 99);
    answer = a + b;
    question = `${a} + ${b} = ?`;
  }

  if (type === 2) {
    a = randomInt(30, 99);
    b = randomInt(10, a);
    answer = a - b;
    question = `${a} - ${b} = ?`;
  }

  if (type === 3) {
    a = randomInt(2, 9);
    b = randomInt(2, 9);
    answer = a * b;
    question = `${a} × ${b} = ?`;
  }

  if (type === 4) {
    b = randomInt(2, 9);
    answer = randomInt(2, 9);
    a = b * answer;
    question = `${a} ÷ ${b} = ?`;
  }

  return { question, answer };
}

function generateChoices(correct) {
  const choices = new Set([correct]);
  while (choices.size < 4) {
    choices.add(correct + randomInt(-10, 10));
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

/***********************
 * UI UPDATE
 ***********************/
function showCelebration() {
  const overlay = document.getElementById("celebration");
  overlay.classList.remove("hidden");
  startConfetti();
}
function updateProgressUI() {
  document.getElementById("stars").textContent = stars;

  const todayDone = document.getElementById("todayDone");
  if (todayDone) {
    todayDone.textContent = progress[today].done;
  }
}

/***********************
 * MAIN FLOW
 ***********************/
function loadQuestion() {
  // Stop if daily goal reached
  if (progress[today].done >= DAILY_GOAL) {
  showCelebration();
  return;
}

  const { question, answer } = generateProblem();

  document.getElementById("question").textContent = question;
  const answersDiv = document.getElementById("answers");
  const msg = document.getElementById("msg");

  answersDiv.innerHTML = "";
  msg.textContent = "";

  generateChoices(answer).forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;

    btn.onclick = () => {
      if (choice === answer) {
        msg.textContent = "🎉 Great job, Harper!";

        // Update progress
        progress[today].done++;
        stars++;

        localStorage.setItem("progress", JSON.stringify(progress));
        localStorage.setItem("stars", stars);

        updateProgressUI();

        setTimeout(loadQuestion, 600);
      } else {
        msg.textContent = "💛 Try again!";
      }
    };

    answersDiv.appendChild(btn);
  });

  applyTheme(currentTheme);
}


/***********************
 * INIT
 ***********************/
updateProgressUI();
applyTheme(currentTheme);
loadQuestion();
function startConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 150 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 6 + 4,
    c: `hsl(${Math.random() * 360},100%,60%)`,
    s: Math.random() * 3 + 2
  }));

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.s;
      if (p.y > canvas.height) p.y = -10;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(update);
  }

  update();
}