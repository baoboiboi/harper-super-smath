const menu = document.getElementById("menu");
const game = document.getElementById("game");
const title = document.getElementById("gameTitle");
const question = document.getElementById("question");
const choices = document.getElementById("choices");
const timerEl = document.getElementById("timer");
const msg = document.getElementById("message");

let timer;
let score = 0;

/* ---------- UTIL ---------- */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showGame(name) {
  menu.classList.add("hidden");
  game.classList.remove("hidden");
  title.textContent = name;
}

function goMenu() {
  clearInterval(timer);
  game.classList.add("hidden");
  menu.classList.remove("hidden");
  timerEl.textContent = "";
  msg.textContent = "";
}

/* ---------- SPEED MATH ---------- */
function speedMath() {
  let time = 30;
  score = 0;
  title.textContent = "⚡ Speed Math";

  timer = setInterval(() => {
    time--;
    timerEl.textContent = `⏱ ${time}s`;
    if (time <= 0) {
      clearInterval(timer);
      question.textContent = `⭐ Score: ${score}`;
      choices.innerHTML = "";
    }
  }, 1000);

  next();
  function next() {
    if (time <= 0) return;
    let a = rand(1, 20);
    let b = rand(1, 20);
    let ans = a + b;
    question.textContent = `${a} + ${b} = ?`;
    renderChoices(ans, next);
  }
}

/* ---------- TARGET PRACTICE ---------- */
function targetGame() {
  title.textContent = "🎯 Target Practice";
  next();
  function next() {
    let a = rand(2, 9);
    let b = rand(2, 9);
    let ans = a * b;
    question.textContent = `${a} × ${b}`;
    renderChoices(ans, next);
  }
}

/* ---------- PUZZLE MODE ---------- */
function puzzleGame() {
  title.textContent = "🧩 Puzzle Mode";
  let a = rand(5, 20);
  let b = rand(1, 10);
  let ans = a - b;
  question.textContent = `${a} - __ = ${ans}`;
  renderChoices(b, puzzleGame);
}

/* ---------- ANIMAL COUNT ---------- */
function animalGame() {
  title.textContent = "🐶 Animal Count";
  let count = rand(3, 10);
  question.textContent = "🐶 ".repeat(count);
  renderChoices(count, animalGame);
}

/* ---------- CHOICES ---------- */
function renderChoices(correct, next) {
  choices.innerHTML = "";
  msg.textContent = "";

  let opts = new Set([correct]);
  while (opts.size < 4) opts.add(correct + rand(-3, 3));

  [...opts].sort(() => Math.random() - 0.5).forEach(v => {
    let b = document.createElement("button");
    b.textContent = v;
    b.onclick = () => {
      if (v === correct) {
        msg.textContent = "🎉 Great!";
        score++;
        setTimeout(next, 600);
      } else {
        msg.textContent = "💛 Try again";
      }
    };
    choices.appendChild(b);
  });
}

/* ---------- START ---------- */
function startGame(type) {
  showGame("");
  if (type === "speed") speedMath();
  if (type === "target") targetGame();
  if (type === "puzzle") puzzleGame();
  if (type === "animals") animalGame();
}
