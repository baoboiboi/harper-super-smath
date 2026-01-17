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
let currentTheme = localStorage.getItem("theme") || "rainbow";

if (!progress[today]) {
  progress[today] = { done: 0 };
}

/* THEMES */
const themes = {
  animals: { bg: "#FFF3E0", button: "#FFB74D" },
  space: { bg: "#0D1B2A", button: "#1B9AAA" },
  rainbow: { bg: "#FCE4EC", button: "#BA68C8" }
};

function applyTheme(name) {
  const t = themes[name];
  document.body.style.background = t.bg;
  document.querySelectorAll(".answers button").forEach(b => {
    b.style.background = t.button;
  });
  localStorage.setItem("theme", name);
}

/* UTIL */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* MATH */
function generateProblem() {
  const type = randomInt(1, 4);
  let a, b, answer;

  if (type === 1) { a = randomInt(10,99); b = randomInt(10,99); answer = a+b; }
  if (type === 2) { a = randomInt(30,99); b = randomInt(10,a); answer = a-b; }
  if (type === 3) { a = randomInt(2,9); b = randomInt(2,9); answer = a*b; }
  if (type === 4) { b = randomInt(2,9); answer = randomInt(2,9); a = b*answer; }

  return { question: `${a} ${["+","-","×","÷"][type-1]} ${b} = ?`, answer };
}

function generateChoices(correct) {
  const set = new Set([correct]);
  while (set.size < 4) set.add(correct + randomInt(-10,10));
  return [...set].sort(() => Math.random() - 0.5);
}

/* UI */
function updateUI() {
  document.getElementById("stars").textContent = stars;
  document.getElementById("todayDone").textContent = progress[today].done;
}

/* CELEBRATION */
function showCelebration() {
  document.getElementById("celebration").classList.remove("hidden");
  startConfetti();

  setTimeout(() => {
    document.getElementById("celebration").classList.add("hidden");
    progress[today].done = 0;
    localStorage.setItem("progress", JSON.stringify(progress));
    loadQuestion();
  }, 5000);
}

/* CONFETTI */
function startConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const confetti = Array.from({length:150},()=>({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    r:Math.random()*6+4,
    c:`hsl(${Math.random()*360},100%,60%)`,
    s:Math.random()*3+2
  }));

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    confetti.forEach(p=>{
      p.y+=p.s;
      if(p.y>canvas.height)p.y=-10;
      ctx.fillStyle=p.c;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* MAIN */
function loadQuestion() {
  if (progress[today].done >= DAILY_GOAL) {
    showCelebration();
    return;
  }

  const { question, answer } = generateProblem();
  document.getElementById("question").textContent = question;
  document.getElementById("msg").textContent = "";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  generateChoices(answer).forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => {
      if (choice === answer) {
        stars++;
        progress[today].done++;
        localStorage.setItem("stars", stars);
        localStorage.setItem("progress", JSON.stringify(progress));
        updateUI();
        loadQuestion();
      } else {
        document.getElementById("msg").textContent = "💛 Try again!";
      }
    };
    answersDiv.appendChild(btn);
  });

  applyTheme(currentTheme);
}

/* INIT */
updateUI();
loadQuestion();
