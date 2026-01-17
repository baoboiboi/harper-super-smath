/***********************
 * CONFIG
 ***********************/
const SESSION_SIZE = 100;

// Hardcoded parents
const PARENTS = [
  { name: "Dylan", code: "7391" },
  { name: "Mom", code: "2468" },
  { name: "Dad", code: "1357" }
];

/***********************
 * DATE
 ***********************/
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/***********************
 * SESSION STATE
 ***********************/
let session = JSON.parse(localStorage.getItem("session")) || {
  current: 0,
  correct: 0
};

/***********************
 * DOM
 ***********************/
const qEl = document.getElementById("question");
const aEl = document.getElementById("answers");
const msgEl = document.getElementById("message");
const currentEl = document.getElementById("current");
const totalEl = document.getElementById("total");

totalEl.textContent = SESSION_SIZE;
currentEl.textContent = session.current;

/***********************
 * THEME
 ***********************/
function setTheme(name) {
  document.body.style.background =
    name === "animals" ? "linear-gradient(#fff3e0,#ffe0b2)" :
    name === "space" ? "linear-gradient(#0d47a1,#1976d2)" :
    "linear-gradient(#fce4ec,#e3f2fd)";
}

/***********************
 * UTIL
 ***********************/
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/***********************
 * MATH PROBLEM
 ***********************/
function newProblem() {
  let type = rand(1, 4);
  let a, b, correct, text;

  if (type === 1) {
    a = rand(10, 99);
    b = rand(10, 99);
    correct = a + b;
    text = `${a} + ${b}`;
  }

  if (type === 2) {
    a = rand(30, 99);
    b = rand(10, a);
    correct = a - b;
    text = `${a} - ${b}`;
  }

  if (type === 3) {
    a = rand(2, 9);
    b = rand(2, 9);
    correct = a * b;
    text = `${a} × ${b}`;
  }

  if (type === 4) {
    b = rand(2, 9);
    correct = rand(2, 9);
    a = b * correct;
    text = `${a} ÷ ${b}`;
  }

  qEl.textContent = `${text} = ?`;
  showAnswers(correct);
}

/***********************
 * ANSWERS (ONE ATTEMPT)
 ***********************/
function showAnswers(correct) {
  aEl.innerHTML = "";
  msgEl.textContent = "";

  let options = new Set([correct]);
  while (options.size < 4) {
    options.add(correct + rand(-10, 10));
  }

  [...options].sort(() => Math.random() - 0.5).forEach(v => {
    const btn = document.createElement("button");
    btn.textContent = v;

    btn.onclick = () => {
      // Lock all buttons
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

/***********************
 * NEXT OR END
 ***********************/
function nextOrEnd() {
  if (session.current >= SESSION_SIZE) {
    showResult();
  } else {
    newProblem();
  }
}

/***********************
 * RESULT SCREEN
 ***********************/
function showResult() {
  qEl.textContent = "📊 Session Complete";
  aEl.innerHTML = `
    <p>Correct: ${session.correct} / ${SESSION_SIZE}</p>

    <input id="parentName" placeholder="Parent name">
    <input id="parentCode" placeholder="Reset code" type="password">

    <button onclick="resetSession()">Reset Session</button>
  `;
  msgEl.textContent = "";
}

/***********************
 * RESET SESSION
 ***********************/
function resetSession() {
  const name = document.getElementById("parentName").value.trim();
  const code = document.getElementById("parentCode").value.trim();

  const valid = PARENTS.find(
    p => p.name === name && p.code === code
  );

  if (!valid) {
    alert("Incorrect parent name or code");
    return;
  }

  session = { current: 0, correct: 0 };
  localStorage.removeItem("session");

  currentEl.textContent = 0;
  msgEl.textContent = "✅ Session reset!";

  setTimeout(newProblem, 500);
}

/***********************
 * START
 ***********************/
if (session.current >= SESSION_SIZE) {
  showResult();
} else {
  newProblem();
}
