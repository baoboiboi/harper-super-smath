/***********************
 * CONFIG
 ***********************/
const SESSION_SIZE = 100;

const PARENTS = [
  { name: "Dylan", code: "7391" },
  { name: "Mom", code: "2468" },
  { name: "Dad", code: "1357" }
];

/***********************
 * STATE
 ***********************/
let session = JSON.parse(localStorage.getItem("session")) || {
  current: 0,
  correct: 0
};

let sessionEnded = false;

/***********************
 * DOM
 ***********************/
const qEl = document.getElementById("question");
const aEl = document.getElementById("answers");
const msgEl = document.getElementById("message");
const currentEl = document.getElementById("current");
const totalEl = document.getElementById("total");
const parentResetLink = document.getElementById("parentResetLink");

totalEl.textContent = SESSION_SIZE;
currentEl.textContent = session.current;

/***********************
 * THEME
 ***********************/
document.querySelectorAll(".themes button").forEach(btn => {
  btn.onclick = () => {
    const t = btn.dataset.theme;
    document.body.style.background =
      t === "animals" ? "linear-gradient(#fff3e0,#ffe0b2)" :
      t === "space" ? "linear-gradient(#0d47a1,#1976d2)" :
      "linear-gradient(#fce4ec,#e3f2fd)";
  };
});

/***********************
 * UTIL
 ***********************/
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/***********************
 * GAME LOGIC
 ***********************/
function newProblem() {
  if (sessionEnded) return;

  let type = rand(1, 4);
  let a, b, correct, text;

  if (type === 1) { a = rand(10,99); b = rand(10,99); correct = a + b; text = `${a} + ${b}`; }
  if (type === 2) { a = rand(30,99); b = rand(10,a); correct = a - b; text = `${a} - ${b}`; }
  if (type === 3) { a = rand(2,9); b = rand(2,9); correct = a * b; text = `${a} × ${b}`; }
  if (type === 4) { b = rand(2,9); correct = rand(2,9); a = b * correct; text = `${a} ÷ ${b}`; }

  qEl.textContent = `${text} = ?`;
  renderAnswers(correct);
}

function renderAnswers(correct) {
  aEl.innerHTML = "";
  msgEl.textContent = "";

  const opts = new Set([correct]);
  while (opts.size < 4) opts.add(correct + rand(-10, 10));

  [...opts].sort(() => Math.random() - 0.5).forEach(v => {
    const btn = document.createElement("button");
    btn.textContent = v;

    btn.onclick = () => {
      if (sessionEnded) return;

      document.querySelectorAll(".answers button")
        .forEach(b => b.disabled = true);

      const isCorrect = v === correct;
      session.current++;
      if (isCorrect) session.correct++;

      localStorage.setItem("session", JSON.stringify(session));
      currentEl.textContent = session.current;

      msgEl.textContent = isCorrect ? "🎉 Great!" : "❌ Oops!";

      setTimeout(nextOrEnd, 500);
    };

    aEl.appendChild(btn);
  });
}

function nextOrEnd() {
  if (session.current >= SESSION_SIZE) {
    endSession();
  } else {
    newProblem();
  }
}

/***********************
 * SESSION END / RESET
 ***********************/
function endSession() {
  sessionEnded = true;

  qEl.textContent = "📊 Session Complete";
  aEl.innerHTML = "";
  msgEl.textContent = "";

  const summary = document.createElement("p");
  summary.textContent = `Correct: ${session.correct} / ${SESSION_SIZE}`;

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Parent name";

  const codeInput = document.createElement("input");
  codeInput.placeholder = "Reset code";
  codeInput.type = "password";

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset Session";

  resetBtn.onclick = () => {
    const name = nameInput.value.trim();
    const code = codeInput.value.trim();

    const ok = PARENTS.find(p => p.name === name && p.code === code);
    if (!ok) {
      alert("Incorrect parent name or code");
      return;
    }

    session = { current: 0, correct: 0 };
    sessionEnded = false;
    localStorage.removeItem("session");
    currentEl.textContent = 0;

    newProblem();
  };

  aEl.append(summary, nameInput, codeInput, resetBtn);
}

parentResetLink.onclick = () => {
  endSession();
};

/***********************
 * START
 ***********************/
if (session.current >= SESSION_SIZE) {
  endSession();
} else {
  newProblem();
}
