const DAILY_GOAL = 100;

/* Date */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
const today = todayKey();

/* Storage */
let progress = JSON.parse(localStorage.getItem("progress")) || {};
let stars = Number(localStorage.getItem("stars")) || 0;
let soundOn = localStorage.getItem("soundOn") !== "false";
let currentTheme = localStorage.getItem("theme") || "rainbow";

if (!progress[today]) progress[today] = { done: 0 };

/* Themes */
const themes = {
  animals: { button: "#FFB74D", mascot: "🐶" },
  space: { button: "#1B9AAA", mascot: "🚀" },
  rainbow: { button: "#BA68C8", mascot: "🌈" }
};

function applyTheme(name) {
  const t = themes[name];
  document.querySelector(".mascot").textContent = t.mascot;
  document.querySelectorAll(".answers button").forEach(b => b.style.background = t.button);
  localStorage.setItem("theme", name);
}

/* Sounds */
const correctSound = document.getElementById("sound-correct");
const wrongSound = document.getElementById("sound-wrong");
const muteBtn = document.getElementById("muteBtn");

function play(sound) {
  if (!soundOn) return;
  sound.currentTime = 0;
  sound.play();
}

muteBtn.onclick = () => {
  soundOn = !soundOn;
  localStorage.setItem("soundOn", soundOn);
  muteBtn.textContent = soundOn ? "🔊" : "🔇";
};
muteBtn.textContent = soundOn ? "🔊" : "🔇";

/* Utils */
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/* Math */
function generateProblem() {
  const type = rand(1,4);
  let a,b,ans,op;
  if(type===1){a=rand(10,99);b=rand(10,99);ans=a+b;op="+";}
  if(type===2){a=rand(30,99);b=rand(10,a);ans=a-b;op="-";}
  if(type===3){a=rand(2,9);b=rand(2,9);ans=a*b;op="×";}
  if(type===4){b=rand(2,9);ans=rand(2,9);a=b*ans;op="÷";}
  return {q:`${a} ${op} ${b} = ?`, a:ans};
}

function choices(ans){
  const s=new Set([ans]);
  while(s.size<4)s.add(ans+rand(-10,10));
  return [...s].sort(()=>Math.random()-0.5);
}

/* UI */
function updateUI(){
  starsEl.textContent = stars;
  todayDone.textContent = progress[today].done;
}

/* Sparkle */
function sparkle(){
  const s=document.createElement("div");
  s.className="sparkle";
  s.textContent="✨";
  s.style.left=Math.random()*innerWidth+"px";
  s.style.top=Math.random()*innerHeight+"px";
  document.body.appendChild(s);
  setTimeout(()=>s.remove(),800);
}

/* Celebration */
function showCelebration(){
  celebration.classList.remove("hidden");
  startConfetti();
  setTimeout(()=>{
    celebration.classList.add("hidden");
    progress[today].done=0;
    localStorage.setItem("progress",JSON.stringify(progress));
    load();
  },5000);
}

/* Confetti */
function startConfetti(){
  const ctx=confetti.getContext("2d");
  confetti.width=innerWidth;
  confetti.height=innerHeight;
  const pcs=Array.from({length:150},()=>({
    x:Math.random()*confetti.width,
    y:Math.random()*confetti.height,
    r:Math.random()*6+4,
    c:`hsl(${Math.random()*360},100%,60%)`,
    s:Math.random()*3+2
  }));
  (function draw(){
    ctx.clearRect(0,0,confetti.width,confetti.height);
    pcs.forEach(p=>{
      p.y+=p.s;
      if(p.y>confetti.height)p.y=-10;
      ctx.fillStyle=p.c;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

/* Main */
function load(){
  if(progress[today].done>=DAILY_GOAL){showCelebration();return;}
  const {q,a}=generateProblem();
  question.textContent=q;
  msg.textContent="";
  answers.innerHTML="";
  choices(a).forEach(c=>{
    const b=document.createElement("button");
    b.textContent=c;
    b.onclick=()=>{
      if(c===a){
        play(correctSound);
        sparkle();
        stars++;
        progress[today].done++;
        localStorage.setItem("stars",stars);
        localStorage.setItem("progress",JSON.stringify(progress));
        updateUI();
        load();
      }else{
        play(wrongSound);
        msg.textContent="💛 Try again!";
      }
    };
    answers.appendChild(b);
  });
  applyTheme(currentTheme);
}

const question=document.getElementById("question");
const answers=document.getElementById("answers");
const msg=document.getElementById("msg");
const starsEl=document.getElementById("stars");
const todayDone=document.getElementById("todayDone");
const celebration=document.getElementById("celebration");
const confetti=document.getElementById("confetti");

updateUI();
load();
