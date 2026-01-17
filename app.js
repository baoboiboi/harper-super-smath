const DAILY_GOAL = 100;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

let today = todayKey();
let progress = JSON.parse(localStorage.getItem("progress")) || {};

if (!progress[today]) {
  progress[today] = { done: 0 };
}

let stars = 0;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

function loadQuestion() {
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
        stars++;
        document.getElementById("stars").textContent = stars;
        setTimeout(loadQuestion, 800);
      } else {
        msg.textContent = "💛 Try again!";
      }
    };
    answersDiv.appendChild(btn);
  });
}

loadQuestion();
