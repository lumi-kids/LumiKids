/* ÉCRANS */

const homeScreen = document.getElementById("homeScreen");
const mathGame = document.getElementById("mathGame");
const readingHome = document.getElementById("readingHome");
const lettersHome = document.getElementById("lettersHome");
const soundsHome = document.getElementById("soundsHome");
const lessonScreen = document.getElementById("lessonScreen");
const lessonContent = document.getElementById("lessonContent");
const lessonTitle = document.getElementById("lessonTitle");
const lessonSubtitle = document.getElementById("lessonSubtitle");
const lessonImage = document.getElementById("lessonImage");
const lessonTabs = document.getElementById("lessonTabs");
const lettersGrid = document.getElementById("lettersGrid");
const soundsGrid = document.getElementById("soundsGrid");
const rewardsScreen = document.getElementById("rewardsScreen");
const parentScreen = document.getElementById("parentScreen");
const worldMapScreen = document.getElementById("worldMapScreen");
const levelUpModal = document.getElementById("levelUpModal");
const toast = document.getElementById("toast");
const lessonTitleMirror = document.getElementById("lessonTitleMirror");


const DEFAULT_GAME_STATE = {
  childName: "Champion",
  xp: 0,
  stars: 0,
  coins: 0,
  streak: 1,
  correctAnswers: 0,
  totalAnswers: 0,
  dailyProgress: 0,
  dailyChallenge: {
    date: "",
    progress: 0,
    target: 5,
    rewardType: "coins",
    rewardAmount: 5,
    completed: false,
    claimed: false
  },
  lastActivity: "",
  lessonScores: {},
  achievements: {},
  unlockedStories: {},
  seenChapterTransitions: {},
  unlockedStories: {},
  viewedStories: {},
  seenKingdomWelcomes: {},
  openedChapterChests: {},
  openedSecondChapterChests: {},
  finalCinematic: { unlocked: false, completed: false, seenOnce: false, currentScene: 1, starsGiven: 0 }
};

let gameState = loadGameState();
if (!gameState.unlockedStories) gameState.unlockedStories = {};
if (!gameState.viewedStories) gameState.viewedStories = {};
if (!gameState.seenKingdomWelcomes) gameState.seenKingdomWelcomes = {};
if (!gameState.openedChapterChests) gameState.openedChapterChests = {};
if (!gameState.openedSecondChapterChests) gameState.openedSecondChapterChests = {};
if (!gameState.finalCinematic) gameState.finalCinematic = { unlocked: false, completed: false, seenOnce: false, currentScene: 1, starsGiven: 0 };

function ensureLearningProgress() {
  if (!gameState.learningProgress) {
    gameState.learningProgress = { letters: {}, sounds: {}, lastUnlocked: null };
  }

  if (!gameState.learningProgress.letters) gameState.learningProgress.letters = {};
  if (!gameState.learningProgress.sounds) gameState.learningProgress.sounds = {};

  activeLetters.forEach((letter, index) => {
    if (!gameState.learningProgress.letters[letter]) {
      gameState.learningProgress.letters[letter] = {
        unlocked: index === 0,
        completed: false,
        step: 0,
        exercise1Done: false,
        exercise2Done: false,
        exercise1Stars: 0,
        exercise2Stars: 0
      };
    }
  });

  soundKeys.forEach((sound, index) => {
    if (!gameState.learningProgress.sounds[sound]) {
      gameState.learningProgress.sounds[sound] = {
        unlocked: index === 0 && areAllLettersCompleted(),
        completed: false,
        step: 0,
        exercise1Done: false,
        exercise1Stars: 0
      };
    }
  });
}

function areAllLettersCompleted() {
  if (!gameState.learningProgress || !gameState.learningProgress.letters) return false;
  return activeLetters.every(letter => gameState.learningProgress.letters[letter]?.completed);
}

function loadGameState() {
  try {
    return { ...DEFAULT_GAME_STATE, ...JSON.parse(localStorage.getItem("lumikids-state") || "{}") };
  } catch {
    return { ...DEFAULT_GAME_STATE };
  }
}

function saveGameState() {
  if (window.__lumikidsResetting === true) return;
  localStorage.setItem("lumikids-state", JSON.stringify(gameState));
}

function getTodayKey() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth()+1).padStart(2,"0"), String(now.getDate()).padStart(2,"0")].join("-");
}

function ensureDailyChallenge() {
  const today = getTodayKey();

  if (!gameState.dailyChallenge || gameState.dailyChallenge.date !== today) {
    const variants = [
      { rewardType: "coins", rewardAmount: 5 },
      { rewardType: "stars", rewardAmount: 2 },
      { rewardType: "coins", rewardAmount: 8 }
    ];
    const variant = variants[Math.floor(Math.random()*variants.length)];

    gameState.dailyChallenge = {
      date: today,
      progress: 0,
      target: 5,
      rewardType: variant.rewardType,
      rewardAmount: variant.rewardAmount,
      completed: false,
      claimed: false
    };
  }

  gameState.dailyChallenge.progress = Math.min(gameState.dailyChallenge.progress || 0, gameState.dailyChallenge.target || 5);
  gameState.dailyChallenge.completed = gameState.dailyChallenge.progress >= gameState.dailyChallenge.target;
}

function incrementDailyChallenge(amount=1) {
  ensureDailyChallenge();
  const challenge = gameState.dailyChallenge;
  if (challenge.completed) return;

  challenge.progress = Math.min(challenge.progress + amount, challenge.target);
  challenge.completed = challenge.progress >= challenge.target;

  if (challenge.completed) {
    showToast("Défi du jour terminé ! Récompense disponible.");
  }
}

function renderDailyChallenge() {
  ensureDailyChallenge();

  const challenge = gameState.dailyChallenge;
  const card = document.getElementById("dailyChallengeCard");
  const badge = document.getElementById("dailyRewardBadge");
  const status = document.getElementById("dailyChallengeStatus");
  const action = document.getElementById("dailyChallengeAction");

  setWidth("dailyChallengeBar", challenge.progress / challenge.target * 100);

  if (!card || !badge || !status || !action) return;

  card.classList.remove("claimable","claimed");
  const rewardLabel = challenge.rewardType === "stars" ? "⭐ " + challenge.rewardAmount : "🪙 " + challenge.rewardAmount;

  if (challenge.claimed) {
    card.classList.add("claimed");
    badge.textContent = "✓";
    status.textContent = "Défi validé pour aujourd’hui";
    action.textContent = "Récupéré";
    return;
  }

  badge.textContent = rewardLabel;
  status.textContent = challenge.progress + "/" + challenge.target;

  if (challenge.completed) {
    card.classList.add("claimable");
    status.textContent = "Défi terminé";
    action.textContent = "Récupérer";
  } else {
    action.textContent = "En cours";
  }
}

function claimDailyChallenge() {
  ensureDailyChallenge();
  const challenge = gameState.dailyChallenge;
  if (!challenge.completed || challenge.claimed) return;

  challenge.claimed = true;

  if (challenge.rewardType === "stars") gameState.stars += challenge.rewardAmount;
  else gameState.coins += challenge.rewardAmount;

  saveGameState();
  updateGameUi();
  animateRewardToCounter(challenge.rewardType, challenge.rewardAmount);
  showToast("Récompense récupérée !");
}

function animateRewardToCounter(type, amount) {
  const source = document.getElementById("dailyRewardBadge");
  const target = document.getElementById(type === "stars" ? "globalStars" : "globalCoins");
  const layer = document.getElementById("rewardAnimationLayer");
  if (!source || !target || !layer) return;

  const a = source.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const symbol = type === "stars" ? "⭐" : "🪙";
  const count = Math.min(Math.max(amount,3),8);

  for (let i=0;i<count;i++) {
    const particle = document.createElement("span");
    particle.className = "flying-reward";
    particle.textContent = symbol;
    particle.style.left = a.left+a.width/2+"px";
    particle.style.top = a.top+a.height/2+"px";
    layer.appendChild(particle);

    setTimeout(() => {
      particle.style.left = b.left+b.width/2+(Math.random()*18-9)+"px";
      particle.style.top = b.top+b.height/2+(Math.random()*12-6)+"px";
      particle.style.transform = "translate(-50%,-50%) scale(.45)";
      particle.style.opacity = "0";
    }, 60+i*55);

    setTimeout(() => particle.remove(), 1050+i*55);
  }

  const counter = target.closest(".top-resources span") || target;
  setTimeout(() => {
    counter.classList.add("counter-bump");
    setTimeout(() => counter.classList.remove("counter-bump"),500);
  },720);
}


function levelInfo() {
  return {
    level: Math.floor(gameState.xp / 100) + 1,
    currentXp: gameState.xp % 100
  };
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setWidth(id, value) {
  const el = document.getElementById(id);
  if (el) el.style.width = Math.max(0, Math.min(Number(value) || 0, 100)) + "%";
}

function updateGameUi() {
  const info = levelInfo();
  const xpPercent = info.currentXp;

  setText("globalStars", gameState.stars);
  setText("globalCoins", gameState.coins);
  updateStoryBookButton();
  setText("childNameHome", gameState.childName);
  setText("homeLevel", info.level);
  setText("homeXpText", info.currentXp + " / 100 XP");
  setText("homeProgressPercent", xpPercent + "%");
  setText("homeStreak", gameState.streak);
  setWidth("homeXpBar", xpPercent);

  renderDailyChallenge();

  setText("rewardsCoins", gameState.coins);
  setText("rewardsStars", gameState.stars);

  setText("parentChildName", gameState.childName);
  setText("parentLevel", info.level);
  setText("parentStreak", gameState.streak);
  setText("parentTotalStars", gameState.stars);
  setText("parentCorrect", gameState.correctAnswers);
  setText("parentQuestions", gameState.totalAnswers);

  const accuracy = gameState.totalAnswers
    ? Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100)
    : 0;

  setText("parentAccuracy", accuracy + "%");
  setText("parentEncouragement", accuracy >= 80 ? "Excellent travail !" : accuracy >= 55 ? "Belle progression !" : "Continue comme ça !");
  setWidth("parentAccuracyBar", accuracy);

  const mastered = Object.values(gameState.lessonScores).filter(v => v >= 5).length;
  setText("lettersProgressText", mastered + (mastered > 1 ? " lettres maîtrisées" : " lettre maîtrisée"));
  setText("parentLettersMastered", mastered + " / " + activeLetters.length);
  setWidth("lettersProgressBar", (mastered / activeLetters.length) * 100);

  renderAchievements();
}

function rewardPlayer(xp, stars, coins, lessonKey) {
  const oldLevel = levelInfo().level;

  gameState.xp += xp;
  gameState.stars += stars;
  gameState.coins += coins;
  gameState.correctAnswers += 1;
  gameState.totalAnswers += 1;
  incrementDailyChallenge(1);

  if (lessonKey) {
    gameState.lessonScores[lessonKey] = (gameState.lessonScores[lessonKey] || 0) + 1;
  }

  gameState.lastActivity = currentLesson
    ? JSON.stringify({ type: currentLessonType, key: currentLesson.key })
    : "math";

  unlockAchievements();
  saveGameState();
  updateGameUi();
  showToast("+" + xp + " XP · +" + stars + " ⭐ · +" + coins + " pièces");

  const newLevel = levelInfo().level;
  if (newLevel > oldLevel) {
    setText("newLevelValue", newLevel);
    levelUpModal.classList.remove("hidden");
    createConfetti();
  }
}

function recordWrongAnswer() {
  gameState.totalAnswers += 1;
  saveGameState();
  updateGameUi();
}

function unlockAchievements() {
  if (gameState.correctAnswers >= 1) gameState.achievements.first = true;
  if (gameState.correctAnswers >= 10) gameState.achievements.ten = true;
  if (gameState.correctAnswers >= 50) gameState.achievements.fifty = true;
  if (gameState.stars >= 100) gameState.achievements.stars = true;
  if (Object.values(gameState.lessonScores).filter(v => v >= 5).length >= 3) {
    gameState.achievements.reader = true;
  }
}

function renderAchievements() {
  const grid = document.getElementById("achievementsGrid");
  if (!grid) return;

  const list = [
    ["first", "★", "Premier pas", "Réussir un premier exercice"],
    ["ten", "10", "Bien lancé", "Réussir 10 exercices"],
    ["fifty", "50", "Super élève", "Réussir 50 exercices"],
    ["stars", "★", "Collectionneur", "Gagner 100 étoiles"],
    ["reader", "Aa", "Petit lecteur", "Maîtriser 3 lettres"],
    ["streak", "🔥", "Régulier", "Revenir plusieurs jours"]
  ];

  grid.innerHTML = list.map(([key, icon, title, text]) => {
    const unlocked = key === "streak" ? gameState.streak >= 3 : gameState.achievements[key];
    return `<article class="achievement ${unlocked ? "" : "locked"}">
      <div class="achievement-icon">${icon}</div>
      <strong>${title}</strong>
      <p>${text}</p>
    </article>`;
  }).join("");
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2100);
}

function closeLevelUp() {
  levelUpModal.classList.add("hidden");
}

function continueLearning() {
  if (!gameState.lastActivity) return showReadingHome();
  if (gameState.lastActivity === "math") return showMath();

  try {
    const last = JSON.parse(gameState.lastActivity);
    openLesson(last.key, last.type);
  } catch {
    showReadingHome();
  }
}

function showRewards() {
  hideAllScreens();
  rewardsScreen.classList.remove("hidden");
  updateGameUi();
}

function showParentDashboard() {
  hideAllScreens();
  parentScreen.classList.remove("hidden");
  updateGameUi();
}

function editChildName() {
  const name = prompt("Prénom de l'enfant :", gameState.childName);
  if (!name) return;
  gameState.childName = name.trim().slice(0, 18) || "Champion";
  saveGameState();
  updateGameUi();
}

let currentLesson = null;
let currentLessonType = "letter";
let readingSequenceId = 0;

function stopAllAudio() {
  readingSequenceId++;
  stopSpeech();
  removeActiveSounds();
}

function hideAllScreens() {
  const activeWelcome = document.getElementById("kingdomWelcome");
  if (activeWelcome && !activeWelcome.classList.contains("hidden")) {
    activeWelcome.classList.add("hidden");
    activeWelcome.classList.remove(
      "can-skip",
      "welcome-enter",
      "welcome-exit"
    );
  }

  homeScreen.classList.add("hidden");
  mathGame.classList.add("hidden");
  readingHome.classList.add("hidden");
  lettersHome.classList.add("hidden");
  soundsHome.classList.add("hidden");
  lessonScreen.classList.add("hidden");
  rewardsScreen.classList.add("hidden");
  parentScreen.classList.add("hidden");
  if (worldMapScreen) worldMapScreen.classList.add("hidden");
  stopAllAudio();
}

function showHome() {
  hideAllScreens();
  homeScreen.classList.remove("hidden");
  updateGameUi();
}

function showMath() {
  hideAllScreens();
  mathGame.classList.remove("hidden");
  if (gameStopped) mathGame.classList.add("math-finished");
}

function showReadingHome() {
  hideAllScreens();
  readingHome.classList.remove("hidden");
}

function showLettersHome() {
  hideAllScreens();
  lettersHome.classList.remove("hidden");

  if (!isLetterChapterUnlocked(currentLetterChapter)) {
    currentLetterChapter = 1;
  }

  renderLettersGrid();
}

function showSoundsHome() {
  hideAllScreens();
  soundsHome.classList.remove("hidden");
  renderSoundsGrid();
}

function backToLessonList() {
  currentLessonType === "sound" ? showSoundsHome() : showLettersHome();
}

/* CALCULS */

let number1;
let number2;
let correctAnswer;
let questionType;
let score = 0;
let total = 0;
let gameStopped = false;

const questionElement = document.getElementById("question");
const answerInput = document.getElementById("answer");
const messageElement = document.getElementById("message");
const scoreElement = document.getElementById("score");
const totalElement = document.getElementById("total");
const finalResultElement = document.getElementById("finalResult");
const progressBar = document.getElementById("progressBar");
const confettiBox = document.getElementById("confettiBox");

const validateBtn = document.getElementById("validateBtn");
const stopBtn = document.getElementById("stopBtn");
const replayBtn = document.getElementById("replayBtn");
const questionZone = document.getElementById("questionZone");
const questionLabel = document.getElementById("questionLabel");
const mathActionButtons = document.getElementById("mathActionButtons");

function randomNumber() {
  return Math.floor(Math.random() * 15) + 1;
}

function generateNumbers() {
  number1 = randomNumber();
  number2 = randomNumber();

  while (number1 >= 10 && number2 >= 10) {
    number1 = randomNumber();
    number2 = randomNumber();
  }
}

function newQuestion() {
  if (gameStopped) return;

  generateNumbers();
  questionType = Math.floor(Math.random() * 3);

  if (questionType === 0) {
    correctAnswer = number1 + number2;
    questionElement.textContent = number1 + " + " + number2 + " = ?";
  }

  if (questionType === 1) {
    correctAnswer = number2;
    questionElement.innerHTML = number1 + ' + <span class="blank"></span> = ' + (number1 + number2);
  }

  if (questionType === 2) {
    correctAnswer = number1;
    questionElement.innerHTML = '<span class="blank"></span> + ' + number2 + ' = ' + (number1 + number2);
  }

  answerInput.value = "";
  messageElement.textContent = "";
  messageElement.className = "message";
}

function checkAnswer() {
  if (gameStopped) return;

  const userAnswer = Number(answerInput.value);

  if (answerInput.value === "") {
    messageElement.textContent = "Écris une réponse 🙂";
    messageElement.className = "message bad";
    return;
  }

  total++;

  if (userAnswer === correctAnswer) {
    score++;
    messageElement.textContent = "Bravo !";
    messageElement.className = "message good";
    createConfetti();
    rewardPlayer(10, 2, 4, null);
  } else {
    messageElement.textContent = "Presque ! La réponse était " + correctAnswer;
    messageElement.className = "message bad";
    recordWrongAnswer();
  }

  scoreElement.textContent = score;
  totalElement.textContent = total;
  progressBar.style.width = total > 0 ? Math.round((score / total) * 100) + "%" : "0%";

  setTimeout(newQuestion, 900);
}

function stopGame() {
  gameStopped = true;
  questionElement.textContent = "Partie terminée !";
  answerInput.disabled = true;
  validateBtn.disabled = true;
  stopBtn.disabled = true;

  mathGame.classList.add("math-finished");
  replayBtn.classList.remove("hidden");

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  finalResultElement.innerHTML =
    "<strong>" + score + " / " + total + "</strong><br>" +
    "Réussite : " + percentage + "%";
}

function replayGame() {
  score = 0;
  total = 0;
  gameStopped = false;

  scoreElement.textContent = "0";
  totalElement.textContent = "0";
  progressBar.style.width = "0%";

  finalResultElement.innerHTML = "";
  messageElement.textContent = "";
  answerInput.disabled = false;
  validateBtn.disabled = false;
  stopBtn.disabled = false;
  mathGame.classList.remove("math-finished");
  replayBtn.classList.add("hidden");

  newQuestion();
updateGameUi();
}

answerInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") checkAnswer();
});

/* DONNÉES LECTURE */

const activeLetters = ["A", "B", "C", "D", "E", "I", "U", "F", "J", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "Z"];

const syllableAudioFixes = {
  pa: "pas",
  ba: "bas",
  ca: "ca",
  co: "co",
  cu: "cu",
  da: "da",
  fa: "fa",
  fe: "fe",
  fo: "fo",
  fu: "fu",
  ja: "ja",
  jo: "jo",
  la: "là",
  lo: "lot",
  pa: "pas",
  ro: "rot",
  se: "ce",
  va: "va",
  ve: "veux",
  vi: "vie",
  vo: "veau",
  be: "beurre",
  me: "meu",
  te: "teu",
  de: "de",
  pe: "peu",
  qa: "ka",
  qe: "ke",
  qi: "ki",
  qo: "ko",
  qu: "ku"
};

function audioFor(text) {
  return syllableAudioFixes[text] || text;
}

function makeWord(word, cut) {
  return { word, cut };
}

const letterLessons = {
  A: makeLetterLesson("A", "a", ["ma", "pa", "la", "sa"], [
    makeWord("maman", "ma / man"),
    makeWord("papa", "pa / pa"),
    makeWord("salade", "sa / la / de"),
    makeWord("cabane", "ca / ba / ne")
  ], [
    "Papa a une cabane.",
    "Maman a une salade."
  ]),

  B: makeLetterLesson("B", "b", ["ba", "be", "bé", "bi", "bo", "bu"], [
    makeWord("bébé", "bé / bé"),
    makeWord("balle", "bal / le"),
    makeWord("banane", "ba / na / ne"),
    makeWord("robe", "ro / be")
  ], [
    "Bébé a une balle.",
    "La robe est belle."
  ]),

  C: makeLetterLesson("C", "c", ["ca", "co", "cu"], [
    makeWord("cabane", "ca / ba / ne"),
    makeWord("cacao", "ca / ca / o"),
    makeWord("cube", "cu / be"),
    makeWord("café", "ca / fé")
  ], [
    "La cabane est là.",
    "Papa a du cacao."
  ]),

  D: makeLetterLesson("D", "d", ["da", "de", "dé", "di", "do", "du"], [
    makeWord("dame", "da / me"),
    makeWord("dodo", "do / do"),
    makeWord("domino", "do / mi / no"),
    makeWord("mardi", "mar / di")
  ], [
    "La dame lit.",
    "Dodo est dans le lit."
  ]),

  E: makeLetterLesson("E", "e", ["me", "pe", "le", "se"], [
    makeWord("été", "é / té"),
    makeWord("épi", "é / pi"),
    makeWord("école", "é / co / le"),
    makeWord("elle", "el / le"),
    makeWord("étoile", "é / toi / le")
  ], [
    "Elle a un épi.",
    "Léo est ici."
  ]),

  I: makeLetterLesson("I", "i", ["mi", "pi", "li", "si"], [
    makeWord("ici", "i / ci"),
    makeWord("île", "île"),
    makeWord("image", "i / ma / ge"),
    makeWord("iris", "i / ris"),
    makeWord("idée", "i / dée")
  ], [
    "Iris lit ici.",
    "Lila a une idée."
  ]),

  U: makeLetterLesson("U", "u", ["lu", "mu", "nu", "ru"], [
    makeWord("usine", "u / si / ne"),
    makeWord("une", "u / ne"),
    makeWord("lune", "lu / ne"),
    makeWord("plume", "plu / me"),
    makeWord("tortue", "tor / tue")
  ], [
    "Lulu a une plume.",
    "La tortue nage."
  ]),

  F: makeLetterLesson("F", "f", ["fa", "fe", "fé", "fi", "fo", "fu"], [
    makeWord("fumée", "fu / mée"),
    makeWord("farine", "fa / ri / ne"),
    makeWord("fée", "fée"),
    makeWord("fil", "fil")
  ], [
    "La fumée monte.",
    "La fée file."
  ]),

  J: makeLetterLesson("J", "j", ["ja", "je", "ji", "jo", "ju"], [
    makeWord("jupe", "ju / pe"),
    makeWord("joli", "jo / li"),
    makeWord("jambe", "jam / be"),
    makeWord("jour", "jour")
  ], [
    "Julie a une jolie jupe.",
    "Le jour arrive."
  ]),

  L: makeLetterLesson("L", "l", ["la", "le", "lé", "li", "lo", "lu"], [
    makeWord("lune", "lu / ne"),
    makeWord("lit", "lit"),
    makeWord("lama", "la / ma"),
    makeWord("vélo", "vé / lo")
  ], [
    "La lune luit.",
    "Léo lit."
  ]),

  M: makeLetterLesson("M", "m", ["ma", "me", "mé", "mi", "mo", "mu"], [
    makeWord("maman", "ma / man"),
    makeWord("moto", "mo / to"),
    makeWord("minute", "mi / nu / te"),
    makeWord("numéro", "nu / mé / ro"),
    makeWord("rame", "ra / me"),
    makeWord("mari", "ma / ri")
  ], [
    "Maman lit.",
    "Sami a une moto.",
    "Milo rame."
  ]),

  N: makeLetterLesson("N", "n", ["na", "ne", "né", "ni", "no", "nu"], [
    makeWord("nuit", "nuit"),
    makeWord("nez", "nez"),
    makeWord("numéro", "nu / mé / ro"),
    makeWord("animal", "a / ni / mal")
  ], [
    "La nuit arrive.",
    "Nino a un numéro."
  ]),

  P: makeLetterLesson("P", "p", ["pa", "pe", "pé", "pi", "po", "pu"], [
    makeWord("papa", "pa / pa"),
    makeWord("pirate", "pi / ra / te"),
    makeWord("poule", "pou / le"),
    makeWord("panier", "pa / nier")
  ], [
    "Papa a un panier.",
    "Le pirate rit."
  ]),

  Q: makeLetterLesson("Q", "q", ["qua", "que", "qui", "quo"], [
    makeWord("quatre", "qua / tre"),
    makeWord("quille", "quil / le"),
    makeWord("coq", "coq"),
    makeWord("requin", "re / quin")
  ], [
    "Le coq chante.",
    "Le requin nage."
  ]),

  R: makeLetterLesson("R", "r", ["ra", "re", "ré", "ri", "ro", "ru"], [
    makeWord("rat", "rat"),
    makeWord("rue", "rue"),
    makeWord("rame", "ra / me"),
    makeWord("renard", "re / nard")
  ], [
    "Le rat sort.",
    "Le renard est dans la rue."
  ]),

  S: makeLetterLesson("S", "s", ["sa", "se", "sé", "si", "so", "su"], [
    makeWord("salade", "sa / la / de"),
    makeWord("Sami", "Sa / mi"),
    makeWord("souris", "sou / ris"),
    makeWord("assis", "as / sis")
  ], [
    "Sami est assis.",
    "La souris sort."
  ]),

  T: makeLetterLesson("T", "t", ["ta", "te", "té", "ti", "to", "tu"], [
    makeWord("tomate", "to / ma / te"),
    makeWord("tapis", "ta / pis"),
    makeWord("tortue", "tor / tue"),
    makeWord("moto", "mo / to")
  ], [
    "Tomi a une tomate.",
    "La tortue est sur le tapis."
  ]),

  V: makeLetterLesson("V", "v", ["va", "ve", "vé", "vi", "vo", "vu"], [
    makeWord("vélo", "vé / lo"),
    makeWord("vache", "va / che"),
    makeWord("valise", "va / li / se"),
    makeWord("lavabo", "la / va / bo")
  ], [
    "Vivi va au vélo.",
    "La vache va vite."
  ]),

  W: makeLetterLesson("W", "w", ["wa", "we", "wi", "wo"], [
    makeWord("wagon", "wa / gon"),
    makeWord("wapiti", "wa / pi / ti"),
    makeWord("kiwi", "ki / wi"),
    makeWord("western", "wes / tern")
  ], [
    "Le wagon roule.",
    "Le wapiti marche."
  ]),

  Z: makeLetterLesson("Z", "z", ["za", "ze", "zi", "zo", "zu"], [
    makeWord("zèbre", "zè / bre"),
    makeWord("zoo", "zo / o"),
    makeWord("zéro", "zé / ro"),
    makeWord("lézard", "lé / zard")
  ], [
    "Le zèbre court.",
    "Zoé va au zoo."
  ])
};

function makeLetterLesson(key, letter, syllables, words, phrases) {
  return {
    type: "letter",
    key,
    title: "Lettre " + key,
    subtitle: "On apprend la lettre " + key + ".",
    image: "images/Lettre/lettre " + key + ".png",
    letter,
    syllables: syllables.map(s => ({
      syllable: s,
      audio: audioFor(s),
      vowel: s.replace(letter, "")
    })),
    words,
    phrases
  };
}

const soundKeys = ["an", "en", "in", "on", "ou", "ch", "eau", "ph", "ç", "oi", "un", "ai"];

const soundAudioFixes = {
  an: "enfant",
  en: "enfant",
  in: "lapin",
  on: "ballon",
  ou: "roue",
  ch: "chat",
  eau: "bateau",
  ph: "phare",
  "ç": "serpent",
  oi: "moi",
  un: "lundi",
  ai: "maison"
};

const soundLessons = {};
soundKeys.forEach(sound => {
  soundLessons[sound] = {
    type: "sound",
    key: sound,
    title: "Son " + sound,
    subtitle: "On travaille le son " + sound + ".",
    image: "images/sons/son " + sound + ".png",
    letter: sound,
    soundAudio: soundAudioFixes[sound],
    words: getSoundWords(sound),
    phrases: getSoundPhrases(sound)
  };
});

function getSoundWords(sound) {
  const data = {
    an: [
      makeWord("maman", "ma / man"),
      makeWord("orange", "o / range"),
      makeWord("gant", "gant")
    ],
    en: [
      makeWord("vent", "vent"),
      makeWord("dent", "dent"),
      makeWord("enfant", "en / fant")
    ],
    in: [
      makeWord("lapin", "la / pin"),
      makeWord("matin", "ma / tin"),
      makeWord("jardin", "jar / din")
    ],
    on: [
      makeWord("ballon", "bal / lon"),
      makeWord("maison", "mai / son"),
      makeWord("bonbon", "bon / bon")
    ],
    ou: [
      makeWord("roue", "roue"),
      makeWord("poule", "pou / le"),
      makeWord("souris", "sou / ris")
    ],
    ch: [
      makeWord("chat", "chat"),
      makeWord("cheval", "che / val"),
      makeWord("chapeau", "cha / peau")
    ],
    eau: [
      makeWord("bateau", "ba / teau"),
      makeWord("château", "châ / teau"),
      makeWord("cadeau", "ca / deau")
    ],
    ph: [
      makeWord("phare", "pha / re"),
      makeWord("photo", "pho / to"),
      makeWord("phoque", "phoque")
    ],
    "ç": [
      makeWord("garçon", "gar / çon"),
      makeWord("leçon", "le / çon"),
      makeWord("façon", "fa / çon")
    ],
    oi: [
      makeWord("poire", "poi / re"),
      makeWord("oiseau", "oi / seau"),
      makeWord("voiture", "voi / tu / re")
    ],
    un: [
      makeWord("lundi", "lun / di"),
      makeWord("brun", "brun"),
      makeWord("parfum", "par / fum")
    ],
    ai: [
      makeWord("maison", "mai / son"),
      makeWord("balai", "ba / lai"),
      makeWord("aimer", "ai / mer")
    ]
  };

  return data[sound];
}

function getSoundPhrases(sound) {
  const data = {
    an: ["Maman a un gant."],
    en: ["L’enfant sent le vent."],
    in: ["Le lapin va au jardin."],
    on: ["Le ballon est rond."],
    ou: ["La poule voit la roue."],
    ch: ["Le chat est sous le chapeau."],
    eau: ["Le bateau est beau."],
    ph: ["La photo est près du phare."],
    "ç": ["Le garçon lit la leçon."],
    oi: ["La poire est sur la table."],
    un: ["Lundi, le lapin est brun."],
    ai: ["La maison a un balai."]
  };

  return data[sound];
}

/* GRILLES */

function renderLettersGrid() {
  lettersGrid.innerHTML = "";

  activeLetters.forEach(letter => {
    const lesson = letterLessons[letter];

    lettersGrid.innerHTML += `
      <div class="lesson-card ${(gameState.lessonScores["letter-" + letter] || 0) >= 5 ? "mastered" : ""}" onclick="openLesson('${letter}', 'letter')">
        <div class="lesson-icon">
          <img src="${lesson.image}" alt="">
        </div>
        <h2>${lesson.title}</h2>
        <p>${lesson.syllables.map(s => s.syllable).join(" · ")}</p>
      </div>
    `;
  });
}

function renderSoundsGrid() {
  soundsGrid.innerHTML = "";

  soundKeys.forEach(sound => {
    const lesson = soundLessons[sound];

    soundsGrid.innerHTML += `
      <div class="lesson-card ${(gameState.lessonScores["sound-" + sound] || 0) >= 5 ? "mastered" : ""}" onclick="openLesson('${sound}', 'sound')">
        <div class="lesson-icon">
          <img src="${lesson.image}" alt="">
        </div>
        <h2>${lesson.title}</h2>
        <p>${lesson.words.map(w => w.word).join(" · ")}</p>
      </div>
    `;
  });
}

function openLesson(id, type) {
  hideAllScreens();

  currentLessonType = type;
  currentLesson = type === "sound" ? soundLessons[id] : letterLessons[id];

  lessonScreen.classList.remove("hidden");
  lessonTitle.textContent = currentLesson.title;
  lessonSubtitle.textContent = currentLesson.subtitle;
  lessonImage.src = currentLesson.image;
  if (lessonTitleMirror) lessonTitleMirror.textContent = currentLesson.title;

  updateLessonTabs();
  updateLessonMastery();
  showLessonPart("letters");
}

function updateLessonMastery() {
  if (!currentLesson) return;
  const key = currentLesson.type + "-" + currentLesson.key;
  const score = gameState.lessonScores[key] || 0;
  setText("lessonMastery", Math.min(score * 20, 100) + "%");
}

function updateLessonTabs() {
  if (currentLesson.type === "sound") {
    lessonTabs.innerHTML = `
      <button onclick="showLessonPart('letters')">Son</button>
      <button onclick="showLessonPart('words')">Mots</button>
      <button onclick="showLessonPart('phrases')">Phrases</button>
      <button onclick="showLessonPart('exercise')">Exercices</button>
    `;
  } else {
    lessonTabs.innerHTML = `
      <button onclick="showLessonPart('letters')">Sons</button>
      <button onclick="showLessonPart('syllables')">Syllabes</button>
      <button onclick="showLessonPart('words')">Mots</button>
      <button onclick="showLessonPart('phrases')">Phrases</button>
      <button onclick="showLessonPart('exercise')">Exercices</button>
    `;
  }
}

/* CONTENU LEÇONS */

function showLessonPart(part) {
  stopAllAudio();

  if (part === "letters") showLettersPart();
  if (part === "syllables") showSyllablesPart();
  if (part === "words") showWordsPart();
  if (part === "phrases") showPhrasesPart();
  if (part === "exercise") showExerciseMenu();
}

function showLettersPart() {
  if (currentLesson.type === "sound") {
    lessonContent.innerHTML = `
      <div class="lesson-box">
        <div class="big-letter">${currentLesson.key}</div>
        <p class="subtitle">Écoute un mot exemple pour entendre le son.</p>
        <button class="btn primary" onclick="speak('${currentLesson.soundAudio}')">Écouter</button>
        <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
        <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="lesson-box">
      <div class="big-letter">${currentLesson.letter}</div>
      <p class="subtitle">Associe la lettre avec les voyelles. Tu peux écouter une ligne ou tout lire.</p>
  `;

  currentLesson.syllables.forEach((item, index) => {
    html += `
      <div class="sound-row syllable-line" id="syllableLine${index}">
        <button class="sound-btn" onclick="highlightAndSpeak(${index}, '${item.audio}', 'syllableLine')">Écouter</button>
        <div class="arrow-line">${currentLesson.letter} + ${item.vowel} → <b>${item.syllable}</b></div>
      </div>
    `;
  });

  html += `
      <br>
      <button class="btn primary" onclick="readAllSyllablesWithLight()">Tout lire</button>
      <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
      <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    </div>
  `;

  lessonContent.innerHTML = html;
}

function showSyllablesPart() {
  if (currentLesson.type === "sound") {
    showWordsPart();
    return;
  }

  let html = `
    <div class="lesson-box">
      <p class="subtitle">Clique sur une syllabe pour l’écouter.</p>
      <div class="syllable-grid">
  `;

  currentLesson.syllables.forEach((item, index) => {
    html += `
      <div class="sound-row syllable-line" id="syllableListen${index}">
        <button class="sound-btn" onclick="highlightAndSpeak(${index}, '${item.audio}', 'syllableListen')">Écouter</button>
        <div class="syllable-item">${item.syllable}</div>
      </div>
    `;
  });

  html += `
      </div>
      <br>
      <button class="btn primary" onclick="readAllSyllablesWithLight()">Tout lire</button>
      <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
      <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    </div>
  `;

  lessonContent.innerHTML = html;
}

function showWordsPart() {
  let html = `
    <div class="lesson-box">
      <p class="subtitle">Lis les mots, regarde les syllabes en couleur, puis écoute.</p>
      <div class="word-grid">
  `;

  currentLesson.words.forEach((item, index) => {
    html += `
      <div class="sound-row word-line" id="wordLine${index}">
        <button class="sound-btn" onclick="highlightAndSpeakWord(${index}, '${escapeJS(item.word)}')">Écouter</button>
        <div class="word-item">
          ${item.word}
          <br>
          <small>${colorizeCut(item.cut)}</small>
        </div>
      </div>
    `;
  });

  html += `
      </div>
      <br>
      <button class="btn primary" onclick="readAllWords()">Tout lire</button>
      <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
      <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    </div>
  `;

  lessonContent.innerHTML = html;
}

function showPhrasesPart() {
  let html = `
    <div class="lesson-box">
      <p class="subtitle">Lis les phrases. Les syllabes sont en couleur pour aider.</p>
  `;

  currentLesson.phrases.forEach((phrase, index) => {
    html += `
      <div class="sound-row phrase-line" id="phraseLine${index}">
        <button class="sound-btn" onclick="highlightAndSpeakPhrase(${index}, '${escapeJS(phrase)}')">Écouter</button>
        <div class="phrase-item">${colorizePhrase(phrase)}</div>
      </div>
      <br>
    `;
  });

  html += `
      <button class="btn primary" onclick="readAllPhrases()">Tout lire</button>
      <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
      <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    </div>
  `;

  lessonContent.innerHTML = html;
}

function showExerciseMenu() {
  lessonContent.innerHTML = `
    <div class="lesson-box">
      <p class="subtitle">Choisis un exercice.</p>
      <button class="section-btn" onclick="showListenAndChooseExercise()">Écoute et choisis</button>
      ${currentLesson.type === "letter" ? '<button class="section-btn" onclick="showMatchExercise()">Relie son et syllabe</button>' : ""}
    </div>
  `;
}

/* EXERCICES */

let selectedAnswer = "";
let selectedSound = "";
let selectedSyllable = "";
let remainingMatchItems = [];

function showListenAndChooseExercise() {
  stopAllAudio();
  selectedAnswer = "";

  const good = currentLesson.words[Math.floor(Math.random() * currentLesson.words.length)];
  const others = currentLesson.words.filter(w => w.word !== good.word).sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [good, ...others].sort(() => Math.random() - 0.5);

  let html = `
    <div class="lesson-box">
      <p class="subtitle">Écoute le mot, puis choisis la bonne réponse.</p>
      <button class="btn primary" onclick="speak('${escapeJS(good.word)}')"><img src="images/interface/listen.png" class="inline-listen-icon" alt=""> Écouter le mot</button>

      <div class="choice-grid" style="margin-top:15px;">
  `;

  choices.forEach((choice, index) => {
    html += `
      <div class="sound-row">
        <button class="sound-btn" onclick="speak('${escapeJS(choice.word)}')">Écouter</button>
        <button class="choice-item" onclick="selectExerciseAnswer(this, '${escapeJS(choice.word)}')">${choice.word}</button>
      </div>
    `;
  });

  html += `
      </div>
      <button class="btn primary" style="margin-top:15px;" onclick="validateExerciseAnswer('${escapeJS(good.word)}')">Valider</button>
      <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
      <div id="exerciseMessage" class="message"></div>
      <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    </div>
  `;

  lessonContent.innerHTML = html;
}

function selectExerciseAnswer(button, choice) {
  selectedAnswer = choice;
  document.querySelectorAll(".choice-item").forEach(btn => btn.classList.remove("selected"));
  button.classList.add("selected");

  // Exercice 1 : le même clic sélectionne la réponse et lit le mot.
  // Aucun bouton ou élément visuel supplémentaire n'est ajouté.
  speak(choice);
}

function validateExerciseAnswer(goodAnswer) {
  const msg = document.getElementById("exerciseMessage");

  if (selectedAnswer === "") {
    msg.textContent = "Choisis une réponse 🙂";
    msg.className = "message bad";
    return;
  }

  if (selectedAnswer === goodAnswer) {
    msg.textContent = "Bravo !";
    msg.className = "message good";
    createConfetti();
    rewardPlayer(12, 3, 5, currentLesson.type + "-" + currentLesson.key);
    updateLessonMastery();
    setTimeout(showListenAndChooseExercise, 1300);
  } else {
    msg.textContent = "Essaie encore";
    msg.className = "message bad";
    recordWrongAnswer();
  }
}

function showMatchExercise() {
  stopAllAudio();
  remainingMatchItems = [...currentLesson.syllables];
  renderMatchExercise();
}

function renderMatchExercise() {
  selectedSound = "";
  selectedSyllable = "";

  const shuffledSounds = [...remainingMatchItems].sort(() => Math.random() - 0.5);
  const shuffledSyllables = [...remainingMatchItems].sort(() => Math.random() - 0.5);

  let html = `
    <div class="lesson-box">
      <p class="subtitle">Écoute à gauche, puis choisis la syllabe à droite.</p>
      <div class="match-area"><div>
  `;

  shuffledSounds.forEach(item => {
    html += `<button class="sound-choice" onclick="selectSound(this, '${item.syllable}', '${item.audio}')">Écouter</button>`;
  });

  html += `</div><div>`;

  shuffledSyllables.forEach(item => {
    html += `<button class="syllable-choice" onclick="selectSyllable(this, '${item.syllable}')">${item.syllable}</button>`;
  });

  html += `
      </div></div>
      <button class="btn primary" style="margin-top:15px;" onclick="validateMatchExercise()">Valider</button>
      <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
      <div id="matchMessage" class="message"></div>
      <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    </div>
  `;

  lessonContent.innerHTML = html;
}

function selectSound(button, syllable, audio) {
  selectedSound = syllable;
  document.querySelectorAll(".sound-choice").forEach(btn => btn.classList.remove("selected"));
  button.classList.add("selected");
  speak(audio);
}

function selectSyllable(button, syllable) {
  selectedSyllable = syllable;
  document.querySelectorAll(".syllable-choice").forEach(btn => btn.classList.remove("selected"));
  button.classList.add("selected");
}

function validateMatchExercise() {
  const msg = document.getElementById("matchMessage");

  if (selectedSound === "" || selectedSyllable === "") {
    msg.textContent = "Choisis les deux 🙂";
    msg.className = "message bad";
    return;
  }

  if (selectedSound === selectedSyllable) {
    msg.textContent = "Bravo !";
    msg.className = "message good";
    createConfetti();
    rewardPlayer(8, 2, 3, currentLesson.type + "-" + currentLesson.key);
    updateLessonMastery();

    remainingMatchItems = remainingMatchItems.filter(item => item.syllable !== selectedSound);

    setTimeout(() => {
      if (remainingMatchItems.length === 0) {
        lessonContent.innerHTML = `
          <div class="lesson-box">
            <h2>Bravo ! 🎉</h2>
            <p class="subtitle">Tu as retrouvé toutes les syllabes.</p>
            <button class="btn primary" onclick="showMatchExercise()">Rejouer</button>
          </div>
        `;
      } else {
        renderMatchExercise();
      }
    }, 1200);
  } else {
    msg.textContent = "Essaie encore";
    msg.className = "message bad";
    recordWrongAnswer();
  }
}

/* LECTURE AUDIO */


/* FONCTIONS DE LECTURE DES SONS, MOTS ET PHRASES */

function highlightAndSpeak(index, audioText, prefix) {
  removeActiveSounds();

  const element = document.getElementById(prefix + index);

  if (element) {
    element.classList.add("active-sound");
  }

  speak(audioText, function() {
    setTimeout(removeActiveSounds, 300);
  });
}

function highlightAndSpeakWord(index, word) {
  removeActiveSounds();

  const element = document.getElementById("wordLine" + index);

  if (element) {
    element.classList.add("active-sound");
  }

  speak(word, function() {
    setTimeout(removeActiveSounds, 300);
  });
}

function highlightAndSpeakPhrase(index, phrase) {
  removeActiveSounds();

  const element = document.getElementById("phraseLine" + index);

  if (element) {
    element.classList.add("active-sound");
  }

  speak(phrase, function() {
    setTimeout(removeActiveSounds, 300);
  });
}

function readAllSyllablesWithLight() {
  stopAllAudio();

  const mySequence = ++readingSequenceId;
  let index = 0;

  function next() {
    if (mySequence !== readingSequenceId) return;

    if (!currentLesson || !currentLesson.syllables || index >= currentLesson.syllables.length) {
      removeActiveSounds();
      return;
    }

    removeActiveSounds();

    const line1 = document.getElementById("syllableLine" + index);
    const line2 = document.getElementById("syllableListen" + index);

    if (line1) line1.classList.add("active-sound");
    if (line2) line2.classList.add("active-sound");

    speak(currentLesson.syllables[index].audio, function() {
      if (mySequence !== readingSequenceId) return;

      setTimeout(function() {
        removeActiveSounds();
        index++;

        setTimeout(function() {
          next();
        }, 700);
      }, 200);
    });
  }

  next();
}

function readAllWords() {
  stopAllAudio();

  const mySequence = ++readingSequenceId;
  let index = 0;

  function next() {
    if (mySequence !== readingSequenceId) return;

    if (!currentLesson || !currentLesson.words || index >= currentLesson.words.length) {
      removeActiveSounds();
      return;
    }

    removeActiveSounds();

    const line = document.getElementById("wordLine" + index);

    if (line) {
      line.classList.add("active-sound");
    }

    speak(currentLesson.words[index].word, function() {
      if (mySequence !== readingSequenceId) return;

      setTimeout(function() {
        removeActiveSounds();
        index++;

        setTimeout(function() {
          next();
        }, 700);
      }, 200);
    });
  }

  next();
}

function readAllPhrases() {
  stopAllAudio();

  const mySequence = ++readingSequenceId;
  let index = 0;

  function next() {
    if (mySequence !== readingSequenceId) return;

    if (!currentLesson || !currentLesson.phrases || index >= currentLesson.phrases.length) {
      removeActiveSounds();
      return;
    }

    removeActiveSounds();

    const line = document.getElementById("phraseLine" + index);

    if (line) {
      line.classList.add("active-sound");
    }

    speak(currentLesson.phrases[index], function() {
      if (mySequence !== readingSequenceId) return;

      setTimeout(function() {
        removeActiveSounds();
        index++;

        setTimeout(function() {
          next();
        }, 900);
      }, 200);
    });
  }

  next();
}

let soundProgressInterval;
let currentRecordedAudio = null;

/*
  TES MP3 SONT UTILISÉS UNIQUEMENT POUR LES LEÇONS A ET B.

  Le dossier est exactement :
  son/

  Exemples de fichiers :
  son/ma.mp3
  son/pa.mp3
  son/bébé.mp3
  son/bébé a une balle.mp3

  Pour toutes les autres lettres et tous les autres sons,
  l'application conserve la voix du navigateur.
*/
const recordedAudioFiles = {
  /* Lettre A : le code envoyait parfois "pas" et "là" à la voix IA. */
  "ma": "ma",
  "pas": "pa",
  "là": "la",
  "sa": "sa",

  "maman": "maman",
  "papa": "papa",
  "salade": "salade",
  "cabane": "cabane",

  "papa a une cabane": "papa a une cabane",
  "maman a une salade": "maman a une salade",

  /* Lettre B : le code envoyait "bas" et "beurre" à la voix IA. */
  "bas": "ba",
  "beurre": "be",
  "bé": "bé",
  "bi": "bi",
  "bo": "bo",
  "bu": "bu",

  "bébé": "bébé",
  "balle": "balle",
  "banane": "banane",
  "robe": "robe",

  "bébé a une balle": "bébé a une balle",
  "la robe est belle": "la robe est belle",

  /* Lettre C */
  "ca": "ca",
  "co": "co",
  "cu": "cu",

  /*
    cabane.mp3 existait déjà pour la lettre A :
    il est donc réutilisé automatiquement pour C.
  */
  "cacao": "cacao",
  "café": "café",
  "cube": "cube",

  /*
    Le texte de l'application contient « là » avec accent,
    mais ton fichier s'appelle « la cabane est la.mp3 ».
  */
  "la cabane est là": "la cabane est la",
  "papa a du cacao": "papa a du cacao",

  /* Lettre D */
  "da": "da",
  "de": "de",
  "dé": "dé",
  "di": "di",
  "do": "do",
  "du": "du",

  "dame": "dame",
  "dodo": "dodo",
  "domino": "domino",
 "mardi": "mardi",
 
  "la dame lit": "la dame lit",
  "dodo est dans le lit": "dodo est dans le lit",

  /* Lettre F */
  "fa": "fa",
  "fe": "fe",
  "fé": "fé",
  "fi": "fi",
  "fo": "fo",
  "fu": "fu",

  "fumée": "fumée",
  "farine": "farine",
  "fée": "fée",
  "fil": "fil",

  "la fumée monte": "la fumée monte",

  /*
    Dans l'application la phrase est « La fée file. »,
    mais ton MP3 s'appelle « la fée fil.mp3 ».
  */
  "la fée file": "la fée fil",

  /* Lettre J */
  "ja": "ja",
  "je": "je",
  "ji": "ji",
  "jo": "jo",
  "ju": "ju",

  "jambe": "jambe",
  "joli": "jolie",
  "jour": "jour",
  "jupe": "jupe",

  "julie a une jolie jupe": "julie a une jolie jupe",
  "le jour arrive": "le jour arrive",

  /* Lettre E */
  "e": "e",
  "meu": "me",
  "peu": "pe",
  "ce": "se",
  "é": "é",
  "è": "è",
  "été": "été",
  "épi": "épi",
  "école": "école",
  "elle": "elle",
  "étoile": "étoile",
  "elle a un épi": "elle a un épi",
  "léo est ici": "léo est ici",

  /* Lettre I */
  "i": "i",
  "mi": "mi",
  "pi": "pi",
  "li": "li",
  "si": "si",
  "ici": "ici",
  "île": "ile",
  "image": "image",
  "iris": "iris",
  "idée": "idée",
  "iris lit ici": "iris lit ici",
  "lila a une idée": "lila a une idée",

  /* Lettre U */
  "u": "u",
  "lu": "lu",
  "mu": "mu",
  "nu": "nu",
  "ru": "ru",
  "usine": "usine",
  "une": "une",
  "lune": "lune",
  "plume": "plume",
  "tortue": "tortue",
  "lulu a une plume": "lulu a une plume",
  "la tortue nage": "la tortue nage",

  /* Lettre L */
  "la": "la",
  "le": "le",
  "lé": "lé",
  "lo": "lo",
  "lot": "lo",
  "lama": "lama",
  "lit": "lit",
  "vélo": "vélo",
  "la lune luit": "la lune luit",
  "léo lit": "léo lit",

  /* Lettre M */
  "ma": "ma",
  "me": "me",
  "mé": "mé",
  "mo": "mo",
  "maman": "maman",
  "mari": "mari",
  "moto": "moto",
  "minute": "minute",
  "numéro": "numéro",
  "rame": "rame",
  "maman lit": "maman lit",
  /* Chaque phrase pointe bien vers son propre fichier MP3. */
  "milo rame": "milo rame",
  "sami a une moto": "sami a une moto"
};

function normalizeAudioKey(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/[.!?,;:…]+$/g, "")
    .replace(/’/g, "'");
}

function speak(text, callback) {
  stopSpeech();

  const key = normalizeAudioKey(text);
  const recordedFileName = recordedAudioFiles[key];

  if (recordedFileName) {
    playRecordedAudio(recordedFileName, text, callback);
  } else {
    speakWithBrowserVoice(text, callback);
  }
}

function playRecordedAudio(fileName, originalText, callback) {
  const soundBar = document.getElementById("soundBar");
  const audioPath = encodeURI("./son/" + fileName + ".mp3") + "?v=audio-fix-20260711";
  const audio = new Audio(audioPath);
  audio.volume = Math.max(0, Math.min(1, Number(gameState.appSettingsV10?.voiceVolume ?? 0.9)));

  currentRecordedAudio = audio;

  audio.addEventListener("timeupdate", function() {
    if (!soundBar || !audio.duration) return;

    const percentage = Math.min(
      (audio.currentTime / audio.duration) * 100,
      100
    );

    soundBar.style.width = percentage + "%";
  });

  audio.addEventListener("ended", function() {
    if (currentRecordedAudio !== audio) return;

    if (soundBar) {
      soundBar.style.width = "100%";

      setTimeout(function() {
        if (soundBar) soundBar.style.width = "0%";
      }, 250);
    }

    currentRecordedAudio = null;

    if (callback) callback();
  });

  audio.addEventListener("error", function() {
    if (currentRecordedAudio !== audio) return;

    currentRecordedAudio = null;
    speakWithBrowserVoice(originalText, callback);
  });

  const playPromise = audio.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(function() {
      if (currentRecordedAudio !== audio) return;

      currentRecordedAudio = null;
      speakWithBrowserVoice(originalText, callback);
    });
  }
}

function speakWithBrowserVoice(text, callback) {
  speechSynthesis.cancel();

  const phrase = new SpeechSynthesisUtterance(text);
  phrase.lang = "fr-FR";
  phrase.rate = 0.75;
  phrase.pitch = 1.05;
  phrase.volume = Math.max(0, Math.min(1, Number(gameState.appSettingsV10?.voiceVolume ?? 0.9)));

  const soundBar = document.getElementById("soundBar");
  const fakeDuration = Math.max(900, String(text).length * 280);
  const startTime = Date.now();

  if (soundBar) {
    soundProgressInterval = setInterval(function() {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min(
        (elapsed / fakeDuration) * 100,
        100
      );

      soundBar.style.width = percentage + "%";

      if (percentage >= 100) {
        clearInterval(soundProgressInterval);
      }
    }, 50);
  }

  phrase.onend = function() {
    if (soundBar) {
      soundBar.style.width = "100%";

      setTimeout(function() {
        if (soundBar) soundBar.style.width = "0%";
      }, 250);
    }

    clearInterval(soundProgressInterval);

    if (callback) callback();
  };

  phrase.onerror = function() {
    clearInterval(soundProgressInterval);
  };

  speechSynthesis.speak(phrase);
}

function stopSpeech() {
  if (currentRecordedAudio) {
    currentRecordedAudio.pause();
    currentRecordedAudio.currentTime = 0;
    currentRecordedAudio = null;
  }

  speechSynthesis.cancel();

  if (soundProgressInterval) {
    clearInterval(soundProgressInterval);
    soundProgressInterval = null;
  }

  const soundBar = document.getElementById("soundBar");

  if (soundBar) {
    soundBar.style.width = "0%";
  }
}

function removeActiveSounds() {
  document.querySelectorAll(".active-sound").forEach(el => el.classList.remove("active-sound"));
}

/* COULEURS SYLLABES */

function colorizeCut(cut) {
  return cut
    .split("/")
    .map((part, index) => {
      return `<span class="syl syl-${index % 5}">${part.trim()}</span>`;
    })
    .join(" ");
}

function colorizePhrase(phrase) {
  let result = phrase;

  currentLesson.words.forEach(item => {
    const colored = colorizeCut(item.cut);
    const regex = new RegExp("\\b" + escapeRegex(item.word) + "\\b", "gi");
    result = result.replace(regex, colored);
  });

  return result;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeJS(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/* CONFETTIS */

function createConfetti() {
  const emojis = ["⭐", "✨", "◆", "●"];

  for (let i = 0; i < 12; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = 1 + Math.random() * 1 + "s";

    confettiBox.appendChild(confetti);

    setTimeout(() => confetti.remove(), 2000);
  }
}

newQuestion();

/* =========================================================
   LUMIKIDS — PARCOURS GUIDÉ ET DÉBLOCAGES
========================================================= */

const LETTER_GUIDED_STEPS = ["letters", "syllables", "words", "phrases", "exercise1", "exercise2"];
const SOUND_GUIDED_STEPS = ["letters", "words", "phrases", "exercise1"];

let guidedExerciseCorrect = 0;
let guidedExerciseErrors = 0;
let guidedExerciseTarget = 5;
let pendingUnlockId = null;

function getProgress(type, key) {
  ensureLearningProgress();
  return type === "letter"
    ? gameState.learningProgress.letters[key]
    : gameState.learningProgress.sounds[key];
}

function getGuidedSteps(type) {
  return type === "letter" ? LETTER_GUIDED_STEPS : SOUND_GUIDED_STEPS;
}

function isLessonCompleted(type, key) {
  return Boolean(getProgress(type, key)?.completed);
}

function isLessonUnlocked(type, key) {
  if (type === "sound" && !areAllLettersCompleted()) return false;
  return Boolean(getProgress(type, key)?.unlocked);
}

function currentGuidedPart(type, key) {
  const progress = getProgress(type, key);
  const steps = getGuidedSteps(type);
  return steps[Math.min(progress.step, steps.length - 1)];
}

function saveLearningProgress() {
  saveGameState();
  updateGameUi();
}

function calculateExerciseStars(errors) {
  if (errors === 0) return 3;
  if (errors <= 2) return 2;
  return 1;
}

function getTotalLessonStars(type, key) {
  const p = getProgress(type, key);
  return type === "letter"
    ? (p.exercise1Stars || 0) + (p.exercise2Stars || 0)
    : (p.exercise1Stars || 0);
}

function updateGameUi() {
  const info = levelInfo();
  const xpPercent = info.currentXp;

  setText("globalStars", gameState.stars);
  setText("globalCoins", gameState.coins);
  setText("childNameHome", gameState.childName);
  setText("homeLevel", info.level);
  setText("homeXpText", info.currentXp + " / 100 XP");
  setText("homeProgressPercent", xpPercent + "%");
  setText("homeStreak", gameState.streak);
  setWidth("homeXpBar", xpPercent);
  renderDailyChallenge();
  setText("rewardsCoins", gameState.coins);
  setText("rewardsStars", gameState.stars);
  setText("parentChildName", gameState.childName);
  setText("parentLevel", info.level);
  setText("parentStreak", gameState.streak);
  setText("parentTotalStars", gameState.stars);
  setText("parentCorrect", gameState.correctAnswers);
  setText("parentQuestions", gameState.totalAnswers);

  const accuracy = gameState.totalAnswers
    ? Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100)
    : 0;

  setText("parentAccuracy", accuracy + "%");
  setText("parentEncouragement", accuracy >= 80 ? "Excellent travail !" : accuracy >= 55 ? "Belle progression !" : "Continue comme ça !");
  setWidth("parentAccuracyBar", accuracy);

  const completedLetters = activeLetters.filter(letter => isLessonCompleted("letter", letter)).length;
  setText("lettersProgressText", completedLetters + (completedLetters > 1 ? " lettres maîtrisées" : " lettre maîtrisée"));
  setText("parentLettersMastered", completedLetters + " / " + activeLetters.length);
  setWidth("lettersProgressBar", (completedLetters / activeLetters.length) * 100);
  setText("soundsUnlockText", completedLetters + " / " + activeLetters.length + " lettres");
  setWidth("soundsUnlockBar", (completedLetters / activeLetters.length) * 100);

  renderAchievements();
}

let currentLetterChapter = 1;

const letterChapters = {
  1: {
    letters: ["A", "B", "C", "D"],
    name: "La Clairière des Premières Lettres",
    shortName: "Clairière",
    background: "images/chap1/fond_chapitre_01.png",
    soundButton: "images/chap1/btn_son.png",
    musicButton: "images/chap1/btn_musique.png",
    chestClosed: "images/chap1/coffre_fermé_02.png",
    chestOpen: "images/chap1/coffre_ouvert_02.png",
    chestReward: 25,
    bottomSign: "images/chap1/panneau_coffre_01.png"
  },
  2: {
    letters: ["E", "I", "U"],
    name: "Les Jardins des Voyelles",
    shortName: "Jardins",
    background: "images/chap2/fond_chapitre_02.png",
    soundButton: "images/chap2/btn_son.png",
    musicButton: "images/chap2/btn_musique.png",
    chestClosed: "images/chap2/coffre_fermé_02.png",
    chestOpen: "images/chap2/coffre_ouvert_02.png",
    chestReward: 25,
    bottomSign: ""
  },
  3: {
    letters: ["F", "J", "L", "M"],
    name: "La Vallée des Échos",
    shortName: "Vallée",
    background: "images/chap3/fond_chapitre_03.png",
    soundButton: "images/chap3/btn_son.png",
    musicButton: "images/chap3/btn_musique.png",
    chestClosed: "images/chap3/coffre_fermé_02.png",
    chestOpen: "images/chap3/coffre_ouvert_02.png",
    chestReward: 25,
    bottomSign: ""
  },
  4: {
    letters: ["N", "P", "Q", "R", "S", "T"],
    name: "La Forêt des Lucioles",
    shortName: "Lucioles",
    background: "images/chap4/fond_chapitre_04.png",
    soundButton: "images/chap4/btn_son.png",
    musicButton: "images/chap4/btn_musique.png",
    chestClosed: "images/chap4/coffre_fermé_02.png",
    chestOpen: "images/chap4/coffre_ouvert_02.png",
    chestReward: 30,
    bottomSign: ""
  },
  5: {
    letters: ["V", "W", "Z"],
    name: "Le Royaume des Étoiles",
    shortName: "Étoiles",
    background: "images/chap5/fond_chapitre_05.png",
    soundButton: "images/chap5/btn_son.png",
    musicButton: "images/chap5/btn_musique.png",
    chestClosed: "images/chap5/coffre_fermé_02.png",
    chestOpen: "images/chap5/coffre_ouvert_02.png",
    chestReward: 40,
    secondChestReward: 40,
    bottomSign: ""
  }
};

function isChapterOneCompleted() {
  return letterChapters[1].letters.every(letter =>
    isLessonCompleted("letter", letter)
  );
}

function isLetterChapterUnlocked(chapterNumber) {
  if (chapterNumber === 1) return true;
  const previousChapter = letterChapters[chapterNumber - 1];
  if (!previousChapter) return false;
  return previousChapter.letters.every(letter => isLessonCompleted("letter", letter));
}

function showLetterChapter(chapterNumber) {
  if (!isLetterChapterUnlocked(chapterNumber)) {
    const previous = letterChapters[chapterNumber - 1];
    showToast(previous
      ? `Termine ${previous.letters.join(", ")} pour débloquer le chapitre ${chapterNumber}.`
      : "Ce chapitre est encore verrouillé.");
    return;
  }

  currentLetterChapter = chapterNumber;
  renderLettersGrid();
}

function showFutureChapterMessage() {
  showToast("Ce chapitre arrivera bientôt.");
}

function updateChapterRail() {
  [1, 2, 3, 4, 5].forEach(chapterNumber => {
    const tab = document.getElementById(`chapterTab${chapterNumber}`);
    if (!tab) return;
    const unlocked = isLetterChapterUnlocked(chapterNumber);
    tab.classList.toggle("locked", !unlocked);
    tab.classList.toggle("active", currentLetterChapter === chapterNumber);
    tab.classList.toggle("unlocked", unlocked);
  });
}

function applyLetterChapterTheme(chapterNumber) {
  const chapter = letterChapters[chapterNumber];
  const map = document.getElementById("chapterOneMap");
  const background = document.getElementById("chapterBackground");
  const soundImage = document.getElementById("chapterSoundImage");
  const musicImage = document.getElementById("chapterMusicImage");
  const chestImage = document.getElementById("chapterChestImage");
  const bottomSign = document.getElementById("chapterBottomSign");

  if (!chapter || !map) return;

  map.classList.toggle("chapter-one-active", chapterNumber === 1);
  map.classList.toggle("chapter-two-active", chapterNumber === 2);
  map.classList.toggle("chapter-three-active", chapterNumber === 3);
  map.classList.toggle("chapter-four-active", chapterNumber === 4);
  map.classList.toggle("chapter-five-active", chapterNumber === 5);

  setText("chapterHeadingNumber", `Chapitre ${chapterNumber}`);
  setText("chapterHeadingTitle", chapter.name);

  if (background) {
    background.style.backgroundImage = `url("${chapter.background}")`;
  }

  if (soundImage) soundImage.src = chapter.soundButton;
  if (musicImage) musicImage.src = chapter.musicButton;

  if (bottomSign) {
    if (chapter.bottomSign) {
      bottomSign.src = chapter.bottomSign;
      bottomSign.classList.remove("hidden");
    } else {
      bottomSign.classList.add("hidden");
    }
  }
}

function renderLettersGrid() {
  ensureLearningProgress();

  const chapter = letterChapters[currentLetterChapter];
  if (!chapter) return;

  applyLetterChapterTheme(currentLetterChapter);
  updateChapterRail();

  lettersGrid.className = "chapter3d-nodes";
  lettersGrid.innerHTML = "";

  chapter.letters.forEach((letter, index) => {
    const lesson = letterLessons[letter];
    const progress = getProgress("letter", letter);

    const stateClass = progress.completed
      ? "completed"
      : progress.unlocked
        ? "current"
        : "locked";

    const previousLetter = chapter.letters[Math.max(0, index - 1)];

    const stateText = progress.completed
      ? getTotalLessonStars("letter", letter) + " / 6 étoiles"
      : progress.unlocked
        ? "À toi de jouer"
        : "Disponible après " + previousLetter;

    const clickAction = progress.unlocked
      ? `openLesson('${letter}', 'letter')`
      : `showLockedLessonMessage('${previousLetter}')`;

    lettersGrid.innerHTML += `
      <div class="chapter3d-node ${stateClass}" data-letter="${letter}">
        <button onclick="${clickAction}">
          <div class="chapter3d-node-orb">
            <img src="${lesson.image}" alt="${lesson.title}">
          </div>
          <span class="chapter3d-node-label">${lesson.title}</span>
          <span class="chapter3d-node-state">${stateText}</span>
        </button>
      </div>
    `;
  });

  const completedCount = chapter.letters.filter(letter =>
    isLessonCompleted("letter", letter)
  ).length;

  setText(
    "lettersProgressText",
    completedCount +
      (completedCount > 1
        ? ` lettres maîtrisées sur ${chapter.letters.length}`
        : ` lettre maîtrisée sur ${chapter.letters.length}`)
  );

  setWidth(
    "lettersProgressBar",
    chapter.letters.length
      ? (completedCount / chapter.letters.length) * 100
      : 0
  );

  const dotsContainer = document.getElementById("chapterProgressDots");
  if (dotsContainer) {
    dotsContainer.innerHTML = chapter.letters
      .map((_, index) =>
        `<span class="${index < completedCount ? "done" : ""}"></span>`
      )
      .join("");
  }

  const chapterCompleted = completedCount === chapter.letters.length;

  if (currentLetterChapter >= 1 && currentLetterChapter <= 4 && chapterCompleted) {
    unlockStoryChapter(currentLetterChapter);
  }

  updateChapterChestState(currentLetterChapter, chapterCompleted, completedCount);
  updateSecondChapterChestState(currentLetterChapter, chapterCompleted, completedCount);

  const nextButton = document.getElementById("nextChapterButton");
  if (nextButton) {
    const destinationChapter = currentLetterChapter + 1;
    const destination = letterChapters[destinationChapter];
    const showNext = Boolean(destination && chapterCompleted && isLetterChapterUnlocked(destinationChapter));

    nextButton.classList.toggle("hidden", !showNext);
    if (showNext) {
      nextButton.onclick = () => enterChapterWithStory(destinationChapter);
      const strong = nextButton.querySelector("strong");
      if (strong) strong.textContent = `Entrer dans ${destination.name}`;
    }
  }

  animatePendingUnlock();
}
function renderSoundsGrid() {
  ensureLearningProgress();

  const lockPanel = document.getElementById("soundsLockPanel");
  const allLettersDone = areAllLettersCompleted();

  if (!allLettersDone) {
    lockPanel?.classList.remove("hidden");
    soundsGrid.className = "lesson-grid";
    soundsGrid.innerHTML = "";
    updateGameUi();
    return;
  }

  lockPanel?.classList.add("hidden");
  soundsGrid.className = "lesson-grid path-grid";
  soundsGrid.innerHTML = "";

  soundKeys.forEach((sound, index) => {
    const lesson = soundLessons[sound];
    const progress = getProgress("sound", sound);
    const stateClass = progress.completed ? "completed" : progress.unlocked ? "current" : "locked";
    const stateText = progress.completed ? "Terminé" : progress.unlocked ? "À jouer" : "Bloqué";
    const click = progress.unlocked ? `openLesson('${sound}', 'sound')` : `showLockedLessonMessage('${soundKeys[index - 1] || sound}')`;

    soundsGrid.innerHTML += `
      <div class="path-node ${stateClass}" data-path-id="sound-${sound}">
        <span class="path-state">${stateText}</span>
        <div class="lesson-card ${progress.completed ? "mastered" : ""}" onclick="${click}">
          <div class="lesson-icon"><img src="${lesson.image}" alt=""></div>
          <h2>${lesson.title}</h2>
          <p>${progress.completed ? getTotalLessonStars("sound", sound) + " / 3 étoiles" : lesson.words.map(w => w.word).join(" · ")}</p>
        </div>
      </div>
    `;
  });

  animatePendingUnlock();
}

function showSoundsHome() {
  hideAllScreens();
  soundsHome.classList.remove("hidden");
  renderSoundsGrid();
}

function showLockedLessonMessage(previous) {
  showToast("Termine d’abord " + previous + " pour débloquer cette étape.");
}

function animatePendingUnlock() {
  if (!gameState.learningProgress.lastUnlocked) return;

  const id = gameState.learningProgress.lastUnlocked;
  requestAnimationFrame(() => {
    const node = document.querySelector(`[data-path-id="${id}"]`);
    if (node) {
      node.classList.add("unlock-flash");
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => node.classList.remove("unlock-flash"), 1500);
    }
  });

  gameState.learningProgress.lastUnlocked = null;
  saveGameState();
}

function openLesson(id, type) {
  if (!isLessonUnlocked(type, id)) {
    showLockedLessonMessage("la leçon précédente");
    return;
  }

  hideAllScreens();
  currentLessonType = type;
  currentLesson = type === "sound" ? soundLessons[id] : letterLessons[id];
  currentLessonActivePart = null;

  lessonScreen.classList.remove("hidden");
  lessonTitle.textContent = currentLesson.title;
  lessonSubtitle.textContent = currentLesson.subtitle;
  lessonImage.src = currentLesson.image;
  if (lessonTitleMirror) lessonTitleMirror.textContent = currentLesson.title;

  updateLessonTabs();
  updateLessonMastery();

  const progress = getProgress(type, id);
  if (progress.completed) {
    showLessonPart(type === "letter" ? "letters" : "letters", true);
  } else {
    showLessonPart(currentGuidedPart(type, id), true);
  }
}

function updateLessonMastery() {
  if (!currentLesson) return;
  const stars = getTotalLessonStars(currentLesson.type, currentLesson.key);
  const max = currentLesson.type === "letter" ? 6 : 3;
  setText("lessonMastery", stars + " / " + max + " ★");
}

function stepLabel(part) {
  const labels = {
    letters: currentLesson?.type === "sound" ? "Découvrir le son" : "Découvrir les sons",
    syllables: "Lire les syllabes",
    words: "Lire les mots",
    phrases: "Lire les phrases",
    exercise1: "Écoute et choisis",
    exercise2: "Relie les syllabes"
  };
  return labels[part] || part;
}

let currentLessonActivePart = null;

function updateLessonTabs() {
  const progress = getProgress(currentLesson.type, currentLesson.key);
  const completed = progress.completed;
  const steps = getGuidedSteps(currentLesson.type);
  const visibleTabs = currentLesson.type === "letter"
    ? [["letters","Sons"],["syllables","Syllabes"],["words","Mots"],["phrases","Phrases"],["exercise1","Exercice 1"],["exercise2","Exercice 2"]]
    : [["letters","Son"],["words","Mots"],["phrases","Phrases"],["exercise1","Exercice"]];

  lessonTabs.innerHTML = visibleTabs.map(([part, label]) => {
    const index = steps.indexOf(part);
    const locked = !completed && index > progress.step;
    const done = completed || index < progress.step;
    const defaultActivePart = steps[Math.min(progress.step, steps.length - 1)];
    const activePart = currentLessonActivePart || defaultActivePart;
    const active = part === activePart;
    return `<button
      class="${locked ? "tab-locked" : ""} ${done ? "tab-done" : ""} ${active ? "tab-active" : ""}"
      ${locked ? "disabled" : ""}
      onclick="showLessonPart('${part}')">${label}</button>`;
  }).join("");
}

function showLessonPart(part, force = false) {
  stopAllAudio();

  const progress = getProgress(currentLesson.type, currentLesson.key);
  const completed = progress.completed;
  const steps = getGuidedSteps(currentLesson.type);
  const targetIndex = steps.indexOf(part);

  if (!force && !completed && targetIndex > progress.step) {
    showToast("Termine d’abord l’étape en cours.");
    return;
  }

  currentLessonActivePart = part;
  updateLessonTabs();

  if (part === "letters") showLettersPart();
  if (part === "syllables") showSyllablesPart();
  if (part === "words") showWordsPart();
  if (part === "phrases") showPhrasesPart();
  if (part === "exercise" || part === "exercise1") startGuidedExerciseOne();
  if (part === "exercise2") showMatchExercise();
}

function guidedHeader(part) {
  const progress = getProgress(currentLesson.type, currentLesson.key);
  if (progress.completed) return "";

  const steps = getGuidedSteps(currentLesson.type);
  const index = steps.indexOf(part);

  return `<div class="guided-banner">
    <span class="step-number">${index + 1}</span>
    <div>
      <strong>${stepLabel(part)}</strong>
      <small>Étape ${index + 1} sur ${steps.length}</small>
    </div>
  </div>`;
}

function guidedContinueButton(part) {
  const progress = getProgress(currentLesson.type, currentLesson.key);
  if (progress.completed) return "";

  const steps = getGuidedSteps(currentLesson.type);
  const index = steps.indexOf(part);

  if (index < 0 || part.startsWith("exercise")) return "";

  return `<div class="guided-actions">
    <button class="btn primary guided-next" onclick="completeLearningStep('${part}')">
      Continuer vers ${stepLabel(steps[index + 1])} →
    </button>
  </div>`;
}

function completeLearningStep(part) {
  const progress = getProgress(currentLesson.type, currentLesson.key);
  if (progress.completed) return;

  const steps = getGuidedSteps(currentLesson.type);
  const index = steps.indexOf(part);

  if (index !== progress.step) return;

  progress.step += 1;
  saveLearningProgress();
  updateLessonTabs();
  showLessonPart(steps[progress.step], true);
  showToast("Nouvelle étape débloquée !");
}

function showLettersPart() {
  const header = guidedHeader("letters");

  if (currentLesson.type === "sound") {
    lessonContent.innerHTML = `
      ${header}
      <div class="lesson-box">
        <div class="big-letter">${currentLesson.key}</div>
        <p class="subtitle">Écoute un mot exemple pour entendre le son.</p>
        <button class="btn primary" onclick="speak('${currentLesson.soundAudio}')">Écouter</button>
        <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
        <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
        ${guidedContinueButton("letters")}
      </div>`;
    return;
  }

  let html = `${header}<div class="lesson-box">
      <div class="big-letter">${currentLesson.letter}</div>
      <p class="subtitle">Associe la lettre avec les voyelles. Tu peux écouter une ligne ou tout lire.</p>`;

  currentLesson.syllables.forEach((item, index) => {
    html += `<div class="sound-row syllable-line" id="syllableLine${index}">
      <button class="sound-btn" onclick="highlightAndSpeak(${index}, '${item.audio}', 'syllableLine')">Écouter</button>
      <div class="arrow-line">${currentLesson.letter} + ${item.vowel} → <b>${item.syllable}</b></div>
    </div>`;
  });

  html += `<br>
    <button class="btn primary" onclick="readAllSyllablesWithLight()">Tout lire</button>
    <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
    <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    ${guidedContinueButton("letters")}
  </div>`;

  lessonContent.innerHTML = html;
}

function showSyllablesPart() {
  if (currentLesson.type === "sound") return showWordsPart();

  let html = `${guidedHeader("syllables")}<div class="lesson-box">
    <p class="subtitle">Clique sur une syllabe pour l’écouter.</p>
    <div class="syllable-grid">`;

  currentLesson.syllables.forEach((item, index) => {
    html += `<div class="sound-row syllable-line" id="syllableListen${index}">
      <button class="sound-btn" onclick="highlightAndSpeak(${index}, '${item.audio}', 'syllableListen')">Écouter</button>
      <div class="syllable-item">${item.syllable}</div>
    </div>`;
  });

  html += `</div><br>
    <button class="btn primary" onclick="readAllSyllablesWithLight()">Tout lire</button>
    <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
    <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    ${guidedContinueButton("syllables")}
  </div>`;

  lessonContent.innerHTML = html;
}

function showWordsPart() {
  let html = `${guidedHeader("words")}<div class="lesson-box">
    <p class="subtitle">Lis les mots, regarde les syllabes en couleur, puis écoute.</p>
    <div class="word-grid">`;

  currentLesson.words.forEach((item, index) => {
    html += `<div class="sound-row word-line" id="wordLine${index}">
      <button class="sound-btn" onclick="highlightAndSpeakWord(${index}, '${escapeJS(item.word)}')">Écouter</button>
      <div class="word-item">${item.word}<br><small>${colorizeCut(item.cut)}</small></div>
    </div>`;
  });

  html += `</div><br>
    <button class="btn primary" onclick="readAllWords()">Tout lire</button>
    <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
    <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    ${guidedContinueButton("words")}
  </div>`;

  lessonContent.innerHTML = html;
}

function showPhrasesPart() {
  let html = `${guidedHeader("phrases")}<div class="lesson-box">
    <p class="subtitle">Lis les phrases. Les syllabes sont en couleur pour aider.</p>`;

  currentLesson.phrases.forEach((phrase, index) => {
    html += `<div class="sound-row phrase-line" id="phraseLine${index}">
      <button class="sound-btn" onclick="highlightAndSpeakPhrase(${index}, '${escapeJS(phrase)}')">Écouter</button>
      <div class="phrase-item">${colorizePhrase(phrase)}</div>
    </div><br>`;
  });

  html += `<button class="btn primary" onclick="readAllPhrases()">Tout lire</button>
    <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
    <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
    ${guidedContinueButton("phrases")}
  </div>`;

  lessonContent.innerHTML = html;
}

function showExerciseMenu() {
  const progress = getProgress(currentLesson.type, currentLesson.key);

  if (!progress.completed) {
    return showLessonPart(currentLesson.type === "letter" ? "exercise1" : "exercise1", true);
  }

  lessonContent.innerHTML = `
    <div class="lesson-box">
      <p class="subtitle">Choisis un exercice pour t’entraîner à nouveau.</p>
      <button class="section-btn" onclick="startGuidedExerciseOne(true)">Écoute et choisis</button>
      ${currentLesson.type === "letter" ? '<button class="section-btn" onclick="showMatchExercise(true)">Relie son et syllabe</button>' : ""}
    </div>`;
}

let guidedExerciseQueue = [];
let guidedExerciseRoundIndex = 0;
let lastExerciseWord = "";

function shuffleArray(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function buildGuidedExerciseQueue() {
  const availableWords = [...currentLesson.words];

  if (availableWords.length === 0) {
    return [];
  }

  let shuffled = shuffleArray(availableWords);

  /*
    Lorsque plusieurs mots sont disponibles, le premier mot du nouvel
    exercice ne peut pas être le même que le dernier mot entendu lors
    de l'exercice précédent.
  */
  if (shuffled.length > 1 && shuffled[0].word === lastExerciseWord) {
    const replacementIndex = shuffled.findIndex((item, index) =>
      index > 0 && item.word !== lastExerciseWord
    );

    if (replacementIndex > 0) {
      [shuffled[0], shuffled[replacementIndex]] =
        [shuffled[replacementIndex], shuffled[0]];
    }
  }

  /*
    Maximum 5 questions.
    S'il n'y a que 4 mots, il y aura 4 questions.
    Chaque mot n'apparaît qu'une seule fois dans la même partie.
  */
  return shuffled.slice(0, Math.min(5, shuffled.length));
}

function startGuidedExerciseOne(replay = false) {
  guidedExerciseCorrect = 0;
  guidedExerciseErrors = 0;
  guidedExerciseRoundIndex = 0;
  guidedExerciseQueue = buildGuidedExerciseQueue();
  guidedExerciseTarget = guidedExerciseQueue.length;

  if (guidedExerciseTarget === 0) {
    lessonContent.innerHTML = `
      <div class="lesson-box">
        <p class="subtitle">Aucun mot n'est disponible pour cet exercice.</p>
      </div>`;
    return;
  }

  showListenAndChooseExerciseRound(replay);
}

function showListenAndChooseExercise() {
  startGuidedExerciseOne(
    getProgress(currentLesson.type, currentLesson.key).completed
  );
}

function buildChoicesForWord(good) {
  const otherWords = currentLesson.words.filter(
    item => item.word !== good.word
  );

  /*
    On garde jusqu'à trois propositions au total.
    Leur position est mélangée à chaque question.
  */
  const distractors = shuffleArray(otherWords).slice(0, 2);
  return shuffleArray([good, ...distractors]);
}

function showListenAndChooseExerciseRound(replay = false) {
  stopAllAudio();
  selectedAnswer = "";

  const good = guidedExerciseQueue[guidedExerciseRoundIndex];

  if (!good) {
    finishGuidedExerciseOne(replay);
    return;
  }

  const choices = buildChoicesForWord(good);

  let html = `${guidedHeader("exercise1")}<div class="lesson-box">
    <div class="exercise-progress-v3">
      Question ${guidedExerciseRoundIndex + 1} sur ${guidedExerciseTarget}
    </div>

    <p class="subtitle">
      Écoute le mot, puis choisis la bonne réponse.
    </p>

    <button class="btn primary" onclick="speak('${escapeJS(good.word)}')">
      <img src="images/interface/listen.png" class="inline-listen-icon" alt=""> Écouter le mot
    </button>

    <div class="choice-grid" style="margin-top:15px;">`;

  choices.forEach(choice => {
    html += `<div class="sound-row">
      <button
        class="choice-item"
        onclick="selectExerciseAnswer(this, '${escapeJS(choice.word)}')">
        ${choice.word}
      </button>
    </div>`;
  });

  html += `</div>
    <button
      class="btn primary"
      style="margin-top:15px;"
      onclick="validateGuidedExerciseOne('${escapeJS(good.word)}', ${replay})">
      Valider
    </button>

    <button class="btn stop" onclick="stopAllAudio()">
      Stop lecture
    </button>

    <div id="exerciseMessage" class="message"></div>
    <div class="sound-bar-box">
      <div id="soundBar" class="sound-bar"></div>
    </div>
  </div>`;

  lessonContent.innerHTML = html;

  /*
    Le son est joué automatiquement après l'affichage de la question,
    tout en restant réécoutable avec le bouton.
  */
  setTimeout(() => {
    if (
      guidedExerciseQueue[guidedExerciseRoundIndex] &&
      guidedExerciseQueue[guidedExerciseRoundIndex].word === good.word
    ) {
      speak(good.word);
    }
  }, 180);
}

function validateGuidedExerciseOne(goodAnswer, replay) {
  const msg = document.getElementById("exerciseMessage");

  if (!selectedAnswer) {
    msg.textContent = "Choisis une réponse";
    msg.className = "message bad";
    return;
  }

  if (selectedAnswer !== goodAnswer) {
    guidedExerciseErrors += 1;
    msg.textContent = "Essaie encore";
    msg.className = "message bad";
    recordWrongAnswer();
    return;
  }

  guidedExerciseCorrect += 1;
  lastExerciseWord = goodAnswer;

  msg.textContent = "Bravo !";
  msg.className = "message good";

  createConfetti();
  rewardPlayer(7, 0, 2, null);

  guidedExerciseRoundIndex += 1;

  if (guidedExerciseRoundIndex >= guidedExerciseTarget) {
    setTimeout(() => finishGuidedExerciseOne(replay), 650);
    return;
  }

  setTimeout(() => showListenAndChooseExerciseRound(replay), 650);
}

function finishGuidedExerciseOne(replay) {
  const stars = calculateExerciseStars(guidedExerciseErrors);
  const progress = getProgress(currentLesson.type, currentLesson.key);

  if (!replay && !progress.completed) {
    progress.exercise1Done = true;
    progress.exercise1Stars = Math.max(
      progress.exercise1Stars || 0,
      stars
    );

    if (currentLesson.type === "letter") {
      progress.step = 5;
      saveLearningProgress();
      updateLessonTabs();

      setTimeout(() => {
        showLessonPart("exercise2", true);
      }, 450);
    } else {
      completeCurrentLesson(stars);
    }

    return;
  }

  gameState.stars += stars;
  saveLearningProgress();
  showExerciseReplayResult(stars);
}

function showMatchExercise(replay = false) {
  stopAllAudio();

  if (currentLesson.type !== "letter") return;

  guidedExerciseErrors = 0;
  remainingMatchItems = [...currentLesson.syllables];
  renderMatchExerciseGuided(replay);
}

function renderMatchExerciseGuided(replay) {
  selectedSound = "";
  selectedSyllable = "";

  const shuffledSounds = [...remainingMatchItems].sort(() => Math.random() - 0.5);
  const shuffledSyllables = [...remainingMatchItems].sort(() => Math.random() - 0.5);

  let html = `${guidedHeader("exercise2")}<div class="lesson-box">
    <div class="exercise-progress-v3">${currentLesson.syllables.length - remainingMatchItems.length} association(s) sur ${currentLesson.syllables.length}</div>
    <p class="subtitle">Écoute à gauche, puis choisis la syllabe à droite.</p>
    <div class="match-area"><div>`;

  shuffledSounds.forEach(item => {
    html += `<button class="sound-choice" onclick="selectSound(this, '${item.syllable}', '${item.audio}')">Écouter</button>`;
  });

  html += `</div><div>`;

  shuffledSyllables.forEach(item => {
    html += `<button class="syllable-choice" onclick="selectSyllable(this, '${item.syllable}')">${item.syllable}</button>`;
  });

  html += `</div></div>
    <button class="btn primary" style="margin-top:15px;" onclick="validateGuidedMatch(${replay})">Valider</button>
    <button class="btn stop" onclick="stopAllAudio()">Stop lecture</button>
    <div id="matchMessage" class="message"></div>
    <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
  </div>`;

  lessonContent.innerHTML = html;
}

function validateGuidedMatch(replay) {
  const msg = document.getElementById("matchMessage");

  if (!selectedSound || !selectedSyllable) {
    msg.textContent = "Choisis les deux";
    msg.className = "message bad";
    return;
  }

  if (selectedSound !== selectedSyllable) {
    guidedExerciseErrors += 1;
    msg.textContent = "Essaie encore";
    msg.className = "message bad";
    recordWrongAnswer();
    return;
  }

  msg.textContent = "Bravo !";
  msg.className = "message good";
  rewardPlayer(5, 0, 2, null);
  remainingMatchItems = remainingMatchItems.filter(item => item.syllable !== selectedSound);

  if (remainingMatchItems.length === 0) {
    const stars = calculateExerciseStars(guidedExerciseErrors);
    const progress = getProgress("letter", currentLesson.key);

    if (!replay && !progress.completed) {
      progress.exercise2Done = true;
      progress.exercise2Stars = Math.max(progress.exercise2Stars || 0, stars);
      completeCurrentLesson(stars);
    } else {
      gameState.stars += stars;
      saveLearningProgress();
      showExerciseReplayResult(stars);
    }
    return;
  }

  setTimeout(() => renderMatchExerciseGuided(replay), 650);
}

function completeCurrentLesson(lastExerciseStars) {
  const type = currentLesson.type;
  const key = currentLesson.key;
  const progress = getProgress(type, key);

  progress.completed = true;
  progress.step = getGuidedSteps(type).length;
  gameState.stars += lastExerciseStars;

  const list = type === "letter" ? activeLetters : soundKeys;
  const index = list.indexOf(key);
  const next = list[index + 1];

  if (next) {
    const nextProgress = getProgress(type, next);
    nextProgress.unlocked = true;
    gameState.learningProgress.lastUnlocked = `${type}-${next}`;
  } else if (type === "letter") {
    const firstSound = getProgress("sound", soundKeys[0]);
    firstSound.unlocked = true;
    gameState.learningProgress.lastUnlocked = `sound-${soundKeys[0]}`;
  }

  saveLearningProgress();
  updateLessonMastery();
  createConfetti();

  const nextLabel = next
    ? (type === "letter" ? "la lettre " : "le son ") + next
    : type === "letter"
      ? "le parcours des sons composés"
      : "la fin du parcours";

  lessonContent.innerHTML = `
    <div class="completion-panel">
      <div class="completion-badge">★</div>
      <h2>${currentLesson.title} terminée !</h2>
      <p>Tu as débloqué ${nextLabel}.</p>
      <strong>${getTotalLessonStars(type, key)} étoile(s) gagnée(s) sur ${type === "letter" ? 6 : 3}</strong>
      <div class="guided-actions" style="justify-content:center">
        <button class="btn primary guided-next" onclick="returnToPathAfterCompletion()">Voir la suite →</button>
      </div>
    </div>`;
}

function returnToPathAfterCompletion() {
  currentLesson.type === "letter" ? showLettersHome() : showSoundsHome();
}

function showExerciseReplayResult(stars) {
  createConfetti();
  lessonContent.innerHTML = `
    <div class="completion-panel">
      <div class="completion-badge">★</div>
      <h2>Exercice terminé !</h2>
      <p>Tu as gagné ${stars} étoile(s).</p>
      <div class="guided-actions" style="justify-content:center">
        <button class="btn primary" onclick="showExerciseMenu()">Choisir un exercice</button>
      </div>
    </div>`;
}

function showExerciseMenu() {
  const progress = getProgress(currentLesson.type, currentLesson.key);

  if (!progress.completed) {
    return showLessonPart(currentGuidedPart(currentLesson.type, currentLesson.key), true);
  }

  lessonContent.innerHTML = `
    <div class="lesson-box">
      <p class="subtitle">Cette leçon est terminée. Tu peux rejouer directement à l’activité de ton choix.</p>
      <button class="section-btn" onclick="startGuidedExerciseOne(true)">Écoute et choisis</button>
      ${currentLesson.type === "letter" ? '<button class="section-btn" onclick="showMatchExercise(true)">Relie son et syllabe</button>' : ""}
    </div>`;
}

/* Migration douce : les anciennes leçons ayant déjà beaucoup de points ne sont
   pas automatiquement terminées, afin que le nouveau parcours puisse être testé. */
ensureLearningProgress();
ensureDailyChallenge();
saveGameState();
updateGameUi();



/* =========================================================
   GRAND LIVRE — AJOUT UNIQUEMENT
========================================================= */

let storyTransitionMode = "replay";
let storyDestinationChapter = null;
let currentStoryChapter = 1;
let storyTransitionTimers = [];

function clearStoryTransitionTimers() {
  storyTransitionTimers.forEach(timer => clearTimeout(timer));
  storyTransitionTimers = [];
}

function storyLater(callback, delay) {
  const timer = setTimeout(callback, delay);
  storyTransitionTimers.push(timer);
  return timer;
}

function getChapterEarnedStars(chapterNumber) {
  const chapter = letterChapters[chapterNumber];
  if (!chapter) return 0;

  return chapter.letters.reduce((total, letter) => {
    return total + getTotalLessonStars("letter", letter);
  }, 0);
}

function getChapterMaximumStars(chapterNumber) {
  const chapter = letterChapters[chapterNumber];
  return chapter ? chapter.letters.length * 6 : 0;
}

function getChapterOneStory(stars) {
  if (stars >= 24) {
    return [
      "Grâce à toi, Lumi a retrouvé les vingt-quatre étoiles de la Clairière. Leur lumière danse de nouveau entre les arbres et fait scintiller la rivière.",
      "Son sac déborde de magie. Au loin, un chemin rose et violet vient de s’illuminer : il mène vers les mystérieux Jardins des Voyelles.",
      "Lumi reprend son sac, regarde une dernière fois la Clairière restaurée, puis se met en route pour poursuivre l’aventure."
    ];
  }

  if (stars >= 17) {
    return [
      `Grâce à toi, Lumi a déjà retrouvé ${stars} étoiles sur 24. La Clairière brille presque comme autrefois et les arbres murmurent de nouveau doucement.`,
      "Quelques étoiles manquent encore, mais elles ne sont pas perdues : tu pourras revenir les chercher quand tu le souhaiteras.",
      "Un nouveau chemin vient de s’ouvrir. Lumi pose son sac un instant, puis se prépare à rejoindre les Jardins des Voyelles."
    ];
  }

  if (stars >= 9) {
    return [
      `Lumi a placé ${stars} étoiles sur 24 dans son sac. Une douce lumière revient peu à peu dans la Clairière.`,
      "Il reste encore des étoiles à retrouver, mais chaque progrès a déjà rendu le Royaume plus lumineux.",
      "Au loin, une lueur rose apparaît entre les arbres. Lumi sourit : les Jardins des Voyelles l’attendent."
    ];
  }

  return [
    `Lumi a retrouvé ${stars} étoile${stars > 1 ? "s" : ""} sur 24. Même une petite lumière suffit pour montrer le chemin dans la forêt.`,
    "La Clairière a encore besoin de toi, et tu pourras revenir t’entraîner pour récupérer les étoiles manquantes.",
    "Pour l’instant, un passage magique s’est ouvert vers les Jardins des Voyelles. Lumi prend courage et continue son voyage."
  ];
}

function getChapterTwoStory(stars) {
  const childName = (gameState.childName || "Champion").trim() || "Champion";

  if (stars >= 18) {
    return [
      `Bravo ${childName} ! Grâce à tes 18 étoiles sur 18, les Jardins des Voyelles brillent de nouveau de toute leur magie.`,
      "Lila a rempli son sac d’étoiles. Les fleurs se sont réveillées et le lac reflète à nouveau leur lumière.",
      "Mais au loin, d’autres étoiles sont tombées dans les montagnes enneigées. Lila montre la route vers la Vallée des Échos, où un jeune pingouin attend de l’aide."
    ];
  }

  if (stars >= 13) {
    return [
      `Bravo ${childName} ! Grâce à tes ${stars} étoiles sur 18, Lila a rendu une grande partie de leur magie aux Jardins des Voyelles.`,
      "Quelques étoiles restent encore à retrouver, et tu pourras revenir les chercher plus tard.",
      "Au loin, une lumière traverse les sommets enneigés. Elle mène vers la Vallée des Échos, où un petit pingouin cherche lui aussi les étoiles perdues."
    ];
  }

  if (stars >= 7) {
    return [
      `Bravo ${childName} ! Lila a déjà placé ${stars} étoiles sur 18 dans son sac. Les premières fleurs magiques commencent à se réveiller.`,
      "Chaque étoile retrouvée redonne de la couleur au jardin, et les autres pourront être récupérées plus tard.",
      "Une lueur apparaît maintenant dans les montagnes. La prochaine aventure attend dans la Vallée des Échos."
    ];
  }

  return [
    `Bravo ${childName} ! Tu as aidé Lila à retrouver ${stars} étoile${stars > 1 ? "s" : ""} sur 18. Même une petite lumière peut réveiller la magie.`,
    "Les Jardins ont encore besoin de toi, et tu pourras revenir t’entraîner pour compléter le sac de Lila.",
    "Un passage s’est tout de même ouvert vers la Vallée des Échos, où un jeune pingouin attend ton aide."
  ];
}


function getChapterThreeStory(stars) {
  const childName = (gameState.childName || "Champion").trim() || "Champion";
  const max = 24;
  const intro = stars >= max
    ? `Bravo ${childName} ! Grâce à tes ${max} étoiles sur ${max}, toute la Vallée des Échos résonne à nouveau.`
    : `Bravo ${childName} ! Grâce à tes ${stars} étoiles sur ${max}, la lumière revient peu à peu dans la Vallée des Échos.`;

  return [
    intro,
    "Pico a rempli son sac d’étoiles. La neige scintille, les lanternes se rallument et les chemins de montagne sont de nouveau visibles.",
    "Au loin, une forêt sombre s’illumine de milliers de petites lueurs. Pico se met en route vers la Forêt des Lucioles, où Noa le hibou attend de l’aide."
  ];
}

function getChapterFourStory(stars) {
  const childName = (gameState.childName || "Champion").trim() || "Champion";
  const max = 36;
  const intro = stars >= max
    ? `Bravo ${childName} ! Grâce à tes ${max} étoiles sur ${max}, toutes les lucioles éclairent de nouveau la forêt.`
    : `Bravo ${childName} ! Grâce à tes ${stars} étoiles sur ${max}, Noa a déjà rallumé une grande partie de la Forêt des Lucioles.`;

  return [
    intro,
    "Noa serre précieusement le sac d’étoiles contre lui. Les champignons brillent, les lanternes se réveillent et le chemin apparaît entre les arbres.",
    "Très loin au-dessus des nuages, un château s’illumine. Noa s’envole vers le Royaume des Étoiles, où Aurore la biche protège le dernier passage vers Orion."
  ];
}

function renderStoryChapter(chapterNumber) {
  currentStoryChapter = chapterNumber;
  const stars = getChapterEarnedStars(chapterNumber);
  const maxStars = getChapterMaximumStars(chapterNumber);
  const starsLine = document.getElementById("storybookStarsLine");
  const text = document.getElementById("storybookText");
  const title = document.getElementById("storybookTitle");
  const image = document.getElementById("storybookPageBackground");
  const miniTitle = document.getElementById("storybookMiniTitle");
  const miniStars = document.getElementById("storybookMiniStars");
  const miniText = document.getElementById("storybookMiniText");

  const storyData = {
    1: {
      title: "La Clairière retrouvée",
      image: "images/livre/histoire_chap1.png",
      alt: "Lumi quitte la Clairière avec son sac d’étoiles",
      paragraphs: getChapterOneStory(stars)
    },
    2: {
      title: "Les Jardins réveillés",
      image: "images/livre/histoire_chap2.png",
      alt: "Lila dans les Jardins des Voyelles, face aux montagnes enneigées",
      paragraphs: getChapterTwoStory(stars)
    },
    3: {
      title: "La Vallée résonne à nouveau",
      image: "images/livre/histoire_chap3.png",
      alt: "Pico quitte la vallée enneigée vers la Forêt des Lucioles",
      paragraphs: getChapterThreeStory(stars)
    },
    4: {
      title: "Les Lucioles montrent la route",
      image: "images/livre/histoire_chap4.png",
      alt: "Noa quitte la forêt lumineuse vers le Royaume des Étoiles",
      paragraphs: getChapterFourStory(stars)
    }
  }[chapterNumber];

  if (!storyData) return;
  const starsSentence = `${stars} étoile${stars > 1 ? "s" : ""} retrouvée${stars > 1 ? "s" : ""} sur ${maxStars}`;
  const paragraphsHtml = storyData.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join("");

  if (starsLine) starsLine.textContent = starsSentence;
  if (title) title.textContent = storyData.title;
  if (image) {
    image.src = storyData.image;
    image.alt = storyData.alt;
  }
  if (text) text.innerHTML = paragraphsHtml;

  /* La page droite garde maintenant une version miniature du récit,
     tandis que le grand texte lisible reste affiché sous le livre sur mobile. */
  if (miniTitle) miniTitle.textContent = storyData.title;
  if (miniStars) miniStars.textContent = starsSentence;
  if (miniText) miniText.innerHTML = paragraphsHtml;

  updateStoryPageNavigation();
}

function updateStoryBookButton() {
  const button = document.getElementById("storyBookButton");
  if (!button) return;
  button.classList.toggle("hidden", getUnlockedStoryChapters().length === 0);
}

function unlockStoryChapter(chapterNumber) {
  if (!gameState.unlockedStories) gameState.unlockedStories = {};
  gameState.unlockedStories[chapterNumber] = true;
  saveGameState();
  updateStoryBookButton();
}

function getUnlockedStoryChapters() {
  return [1, 2, 3, 4].filter(chapterNumber =>
    gameState.unlockedStories?.[chapterNumber] ||
    letterChapters[chapterNumber]?.letters.every(letter => isLessonCompleted("letter", letter))
  );
}

function openUnlockedStoryBookPages() {
  const unlocked = getUnlockedStoryChapters();
  if (!unlocked.length) {
    showToast("Termine le chapitre 1 pour débloquer sa page.");
    return;
  }

  storyTransitionMode = "replay";
  storyDestinationChapter = null;
  openStoryBookSequence(unlocked[unlocked.length - 1]);
}

function updateStoryPageNavigation() {
  const unlocked = getUnlockedStoryChapters();
  const previous = document.getElementById("storybookPreviousPage");
  const next = document.getElementById("storybookNextPage");
  const indicator = document.getElementById("storybookPageIndicator");
  const position = Math.max(0, unlocked.indexOf(currentStoryChapter));

  if (previous) previous.disabled = position <= 0;
  if (next) next.disabled = position < 0 || position >= unlocked.length - 1;
  if (indicator) indicator.textContent = unlocked.length
    ? `Page ${position + 1} / ${unlocked.length}`
    : "Page 0 / 0";
}

function changeStoryPage(direction) {
  const unlocked = getUnlockedStoryChapters();
  const currentIndex = unlocked.indexOf(currentStoryChapter);
  const target = unlocked[currentIndex + direction];
  if (!target) return;

  const pages = document.getElementById("storybookPages");
  if (pages) pages.classList.add(direction > 0 ? "turn-next" : "turn-previous");

  setTimeout(() => {
    renderStoryChapter(target);
    if (pages) {
      pages.classList.remove("turn-next", "turn-previous");
      pages.classList.add("turn-arrive");
      setTimeout(() => pages.classList.remove("turn-arrive"), 420);
    }
  }, 330);
}

function enterChapterWithStory(destinationChapter) {
  const storyChapter = destinationChapter - 1;

  if (!isLetterChapterUnlocked(destinationChapter)) {
    const previous = letterChapters[storyChapter];
    showToast(previous
      ? `Termine ${previous.letters.join(", ")} pour continuer.`
      : "Ce royaume est encore verrouillé.");
    return;
  }

  if (!gameState.seenChapterTransitions) gameState.seenChapterTransitions = {};

  if (gameState.seenChapterTransitions[storyChapter]) {
    showLetterChapter(destinationChapter);
    showKingdomWelcome(destinationChapter);
    return;
  }

  startChapterStoryTransition(storyChapter, destinationChapter);
}

function startChapterStoryTransition(storyChapter, destinationChapter) {
  const chapter = letterChapters[storyChapter];
  const completed = chapter?.letters.every(letter => isLessonCompleted("letter", letter));

  if (!completed) {
    showToast("Termine le chapitre avant de continuer.");
    return;
  }

  if (!gameState.seenChapterTransitions) gameState.seenChapterTransitions = {};

  if (gameState.seenChapterTransitions[storyChapter]) {
    showLetterChapter(destinationChapter);
    showKingdomWelcome(destinationChapter);
    return;
  }

  unlockStoryChapter(storyChapter);
  storyTransitionMode = "chapter-change";
  storyDestinationChapter = destinationChapter;
  openStoryBookSequence(storyChapter);
}

function openStoryBookSequence(chapterNumber) {
  const overlay = document.getElementById("storybookTransition");
  if (!overlay) return;

  clearStoryTransitionTimers();
  stopAllAudio();
  renderStoryChapter(chapterNumber);

  overlay.className = "storybook-transition";
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    overlay.classList.add("is-covering", "clouds-in");
  });

  storyLater(() => overlay.classList.add("show-closed"), 1050);
  storyLater(() => overlay.classList.add("show-open"), 2050);
  storyLater(() => overlay.classList.add("pages-visible"), 3000);
}

function getCurrentStoryPlainText() {
  const text = document.getElementById("storybookText");
  const starsLine = document.getElementById("storybookStarsLine");
  return [starsLine?.textContent || "", text?.innerText || ""].filter(Boolean).join(". ");
}

function readCurrentStory() {
  stopAllAudio();
  const button = document.getElementById("storybookReadButton");
  if (button) button.textContent = "⏸ Lecture en cours";

  speak(getCurrentStoryPlainText(), () => {
    if (button) button.textContent = "▶ Écouter";
  });
}

function continueFromStoryBook() {
  closeStoryBook(true);
}

function closeStoryBook(goToNextChapter = false) {
  const overlay = document.getElementById("storybookTransition");
  if (!overlay) return;

  clearStoryTransitionTimers();
  stopAllAudio();
  overlay.classList.remove("pages-visible");

  storyLater(() => {
    overlay.classList.remove("show-open");
    overlay.classList.add("show-closed");
  }, 500);

  storyLater(() => {
    overlay.classList.remove("show-closed");
  }, 1250);

  storyLater(() => {
    overlay.classList.remove("clouds-in", "is-covering");
  }, 1600);

  storyLater(() => {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (goToNextChapter && storyTransitionMode === "chapter-change" && storyDestinationChapter) {
      if (!gameState.seenChapterTransitions) {
        gameState.seenChapterTransitions = {};
      }

      gameState.seenChapterTransitions[currentStoryChapter] = true;
      saveGameState();

      showLetterChapter(storyDestinationChapter);
      showKingdomWelcome(storyDestinationChapter);
    }

    storyTransitionMode = "replay";
    storyDestinationChapter = null;
  }, 2800);
}

let kingdomWelcomeUnlockTimer = null;
let kingdomWelcomeCloseTimer = null;

function hideKingdomWelcome(event) {
  const welcome = document.getElementById("kingdomWelcome");
  if (!welcome || welcome.classList.contains("hidden")) return;

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!welcome.classList.contains("can-skip")) return;

  clearTimeout(kingdomWelcomeUnlockTimer);
  clearTimeout(kingdomWelcomeCloseTimer);

  welcome.classList.remove("can-skip", "welcome-enter");
  welcome.classList.add("welcome-exit");

  kingdomWelcomeCloseTimer = setTimeout(() => {
    welcome.classList.add("hidden");
    welcome.classList.remove("welcome-exit");
  }, 500);
}

function showKingdomWelcome(chapterNumber) {
  const welcome = document.getElementById("kingdomWelcome");
  if (!welcome) return;

  if (!gameState.seenKingdomWelcomes) {
    gameState.seenKingdomWelcomes = {};
  }

  if (gameState.seenKingdomWelcomes[chapterNumber]) {
    return;
  }

  const welcomeData = {
    2: {
      small: "🌸 Bienvenue dans 🌸",
      title: "Les Jardins des Voyelles",
      text: "🐰 Viens aider <b>Lila la lapine</b> à retrouver les étoiles tombées dans son royaume et à réveiller les fleurs magiques ! ✨⭐",
      effect: "images/effets/petales_roses.png",
      className: "welcome-gardens"
    },
    3: {
      small: "❄️ Bienvenue dans ❄️",
      title: "La Vallée des Échos",
      text: "🐧 Viens aider <b>Pico le pingouin</b> à retrouver les étoiles perdues dans les montagnes et à rendre leur lumière à la vallée ! ⭐🏔️",
      effect: "",
      className: "welcome-valley"
    },
    4: {
      small: "✨ Bienvenue dans ✨",
      title: "La Forêt des Lucioles",
      text: "🦉 Viens aider <b>Noa le hibou</b> à retrouver les étoiles et à rallumer toutes les lucioles de la forêt ! 🌲💛",
      effect: "",
      className: "welcome-fireflies"
    },
    5: {
      small: "🌙 Bienvenue dans 🌙",
      title: "Le Royaume des Étoiles",
      text: "🦌 Viens aider <b>Aurore la biche</b> à retrouver les dernières étoiles et à ouvrir le chemin vers Orion ! 🏰✨",
      effect: "",
      className: "welcome-stars"
    }
  }[chapterNumber];

  if (!welcomeData) return;

  const small = document.getElementById("kingdomWelcomeSmall");
  const title = document.getElementById("kingdomWelcomeTitle");
  const text = document.getElementById("kingdomWelcomeText");
  const effect = document.getElementById("kingdomWelcomeEffect");

  if (small) small.textContent = welcomeData.small;
  if (title) title.textContent = welcomeData.title;
  if (text) text.innerHTML = welcomeData.text;

  if (effect) {
    if (welcomeData.effect) {
      effect.src = welcomeData.effect;
      effect.style.display = "";
    } else {
      effect.removeAttribute("src");
      effect.style.display = "none";
    }
  }

  gameState.seenKingdomWelcomes[chapterNumber] = true;
  saveGameState();

  welcome.classList.remove("welcome-gardens", "welcome-valley", "welcome-fireflies", "welcome-stars");
  welcome.classList.add(welcomeData.className);

  clearTimeout(kingdomWelcomeUnlockTimer);
  clearTimeout(kingdomWelcomeCloseTimer);
  welcome.classList.remove("hidden", "can-skip", "welcome-exit", "welcome-enter");
  void welcome.offsetWidth;
  welcome.classList.add("welcome-enter");

  kingdomWelcomeUnlockTimer = setTimeout(() => {
    welcome.classList.add("can-skip");
    welcome.focus({ preventScroll: true });
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const welcome = document.getElementById("kingdomWelcome");
  if (!welcome || welcome.dataset.clickReady === "true") return;

  welcome.dataset.clickReady = "true";

  welcome.addEventListener("click", hideKingdomWelcome);

  welcome.addEventListener("pointerdown", event => {
    /*
      Bloque le geste dès son commencement afin qu’il ne puisse
      jamais atteindre une lettre ou un bouton placé derrière.
    */
    event.stopPropagation();
  });

  welcome.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    hideKingdomWelcome(event);
  });
});

/* =========================================================
   REMISE À ZÉRO POUR LES BÊTA-TESTS
========================================================= */

async function clearLumiKidsDataAndReload() {
  window.__lumikidsResetting = true;
  try { stopAllAudio(); } catch {}
  try { window.LumiAudio?.stopBackground?.(true); } catch {}

  /* L'accès administrateur reste actif : le bouton de bêta-test doit rester
     disponible après la remise à zéro. Toutes les autres données LumiKids,
     y compris les réglages audio, sont supprimées. */
  const adminAccess = localStorage.getItem("lumikids-temp-admin-access");
  localStorage.clear();
  if (adminAccess === "granted") {
    localStorage.setItem("lumikids-temp-admin-access", "granted");
  }
  try { sessionStorage.clear(); } catch {}

  /* Supprime aussi les anciennes versions gardées par le service worker. */
  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.allSettled(names.map(name => caches.delete(name)));
    }
  } catch {}

  /* Certains navigateurs sauvegardent encore les statistiques pendant
     l'événement pagehide. Cette dernière sécurité efface de nouveau les
     données juste avant de quitter la page. */
  window.addEventListener("pagehide", () => {
    localStorage.removeItem("lumikids-state");
    localStorage.removeItem("lumikids-audio-settings-v1");
  }, { once:true });

  const cleanUrl = window.location.href.split("#")[0].split("?")[0];
  window.location.replace(`${cleanUrl}?reset=${Date.now()}`);
}
window.clearLumiKidsDataAndReload = clearLumiKidsDataAndReload;

function resetBetaProgress() {
  const confirmed = window.confirm(
    "Réinitialiser toute la progression, les étoiles, les pièces, les erreurs et les statistiques ?"
  );
  if (!confirmed) return;
  clearLumiKidsDataAndReload();
}


/* =========================================================
   INTERACTIONS DE LA CARTE 3D
========================================================= */

let chapterSoundEnabled = true;
let chapterMusicEnabled = true;
let chapterParallaxInitialized = false;

function toggleChapterSound() {
  chapterSoundEnabled = !chapterSoundEnabled;
  const button = document.getElementById("chapterSoundBtn");
  if (button) button.classList.toggle("muted", !chapterSoundEnabled);

  if (!chapterSoundEnabled) stopAllAudio();

  showToast(
    chapterSoundEnabled
      ? "Sons activés"
      : "Sons désactivés"
  );
}

function toggleChapterMusic() {
  chapterMusicEnabled = !chapterMusicEnabled;
  const button = document.getElementById("chapterMusicBtn");
  if (button) button.classList.toggle("muted", !chapterMusicEnabled);

  showToast(
    chapterMusicEnabled
      ? "Musique activée"
      : "Musique désactivée"
  );
}

function isChapterChestOpened(chapterNumber) {
  return Boolean(gameState.openedChapterChests?.[chapterNumber]);
}

function updateChapterChestState(chapterNumber, chapterCompleted = null, completedCount = null) {
  const chapter = letterChapters[chapterNumber];
  const chest = document.getElementById("chapterChestZone");
  const chestButton = chest?.querySelector(".chapter3d-chest-button");
  const chestImage = document.getElementById("chapterChestImage");
  const chestText = document.getElementById("chapterChestText");

  if (!chapter || !chest || !chestImage) return;

  if (chapterCompleted === null) {
    completedCount = chapter.letters.filter(letter =>
      isLessonCompleted("letter", letter)
    ).length;
    chapterCompleted = completedCount === chapter.letters.length;
  }

  const opened = isChapterChestOpened(chapterNumber);

  chest.classList.toggle("ready", chapterCompleted && !opened);
  chest.classList.toggle("opened", opened);

  chestImage.src = opened ? chapter.chestOpen : chapter.chestClosed;
  chestImage.alt = opened
    ? "Coffre ouvert et vide"
    : chapterCompleted
      ? "Coffre prêt à être ouvert"
      : "Coffre verrouillé";

  if (chestButton) {
    chestButton.disabled = opened;
    chestButton.setAttribute("aria-disabled", opened ? "true" : "false");
  }

  if (chestText) {
    if (opened) {
      chestText.textContent = "";
      chestText.classList.add("hidden");
    } else {
      chestText.classList.remove("hidden");
      chestText.textContent = chapterCompleted
        ? "Le coffre est prêt à être ouvert !"
        : "Encore " + (chapter.letters.length - completedCount) + " lettre(s) à terminer.";
    }
  }
}

function animateChapterChestCoins(amount) {
  const chestButton = document.querySelector("#chapterChestZone .chapter3d-chest-button");
  const coinCounter = document.getElementById("globalCoins");
  const layer = document.getElementById("rewardAnimationLayer");

  if (!chestButton || !coinCounter || !layer) {
    createConfetti();
    return;
  }

  const source = chestButton.getBoundingClientRect();
  const target = coinCounter.getBoundingClientRect();
  const count = Math.min(Math.max(Math.round(amount / 4), 7), 12);

  for (let i = 0; i < count; i++) {
    const coin = document.createElement("span");
    coin.className = "chapter-chest-flying-coin";
    coin.textContent = "🪙";
    coin.style.left = source.left + source.width / 2 + (Math.random() * 70 - 35) + "px";
    coin.style.top = source.top + source.height / 2 + (Math.random() * 40 - 20) + "px";
    layer.appendChild(coin);

    setTimeout(() => {
      coin.style.left = target.left + target.width / 2 + (Math.random() * 14 - 7) + "px";
      coin.style.top = target.top + target.height / 2 + (Math.random() * 10 - 5) + "px";
      coin.style.opacity = "0";
      coin.style.transform = "translate(-50%, -50%) scale(.35) rotate(420deg)";
    }, 120 + i * 55);

    setTimeout(() => coin.remove(), 1250 + i * 55);
  }

  setTimeout(() => {
    const counterBox = coinCounter.closest(".top-resources span") || coinCounter;
    counterBox.classList.add("counter-bump");
    setTimeout(() => counterBox.classList.remove("counter-bump"), 500);
  }, 820);
}

function openChapterChest() {
  const chapter = letterChapters[currentLetterChapter];
  const chest = document.getElementById("chapterChestZone");
  const chestImage = document.getElementById("chapterChestImage");

  if (!chapter || !chest) return;

  if (isChapterChestOpened(currentLetterChapter)) {
    return;
  }

  const chapterCompleted = chapter.letters.every(letter =>
    isLessonCompleted("letter", letter)
  );

  if (!chapterCompleted || !chest.classList.contains("ready")) {
    showToast("Termine toutes les lettres de ce chapitre pour ouvrir le coffre.");
    return;
  }

  if (!gameState.openedChapterChests) {
    gameState.openedChapterChests = {};
  }

  const reward = chapter.chestReward || 25;

  /* On enregistre avant l'animation : même en cas d'actualisation immédiate,
     la récompense ne pourra jamais être récupérée deux fois. */
  gameState.openedChapterChests[currentLetterChapter] = true;
  gameState.coins += reward;
  saveGameState();

  chest.classList.add("opening");
  if (chestImage) chestImage.src = chapter.chestOpen;

  animateChapterChestCoins(reward);
  createConfetti();
  updateGameUi();
  showToast("+" + reward + " pièces récupérées !");

  setTimeout(() => {
    chest.classList.remove("opening");
    updateChapterChestState(currentLetterChapter, true, chapter.letters.length);
  }, 900);
}


function isSecondChapterChestOpened(chapterNumber) {
  return Boolean(gameState.openedSecondChapterChests?.[chapterNumber]);
}

function updateSecondChapterChestState(chapterNumber, chapterCompleted = null, completedCount = null) {
  const chapter = letterChapters[chapterNumber];
  const chest = document.getElementById("chapterSecondChestZone");
  const chestButton = chest?.querySelector(".chapter3d-chest-button");
  const chestImage = document.getElementById("chapterSecondChestImage");
  const chestText = document.getElementById("chapterSecondChestText");

  if (!chest || !chestImage) return;

  const isFinalChapter = chapterNumber === 5;
  chest.classList.toggle("hidden", !isFinalChapter);

  if (!isFinalChapter || !chapter) return;

  if (chapterCompleted === null) {
    completedCount = chapter.letters.filter(letter =>
      isLessonCompleted("letter", letter)
    ).length;
    chapterCompleted = completedCount === chapter.letters.length;
  }

  const opened = isSecondChapterChestOpened(chapterNumber);

  chest.classList.toggle("ready", chapterCompleted && !opened);
  chest.classList.toggle("opened", opened);

  chestImage.src = opened ? chapter.chestOpen : chapter.chestClosed;
  chestImage.alt = opened
    ? "Deuxième coffre ouvert et vide"
    : chapterCompleted
      ? "Deuxième coffre prêt à être ouvert"
      : "Deuxième coffre verrouillé";

  if (chestButton) {
    chestButton.disabled = opened;
    chestButton.setAttribute("aria-disabled", opened ? "true" : "false");
  }

  if (chestText) {
    if (opened) {
      chestText.textContent = "";
      chestText.classList.add("hidden");
    } else {
      chestText.classList.remove("hidden");
      chestText.textContent = chapterCompleted
        ? "Le deuxième coffre est prêt à être ouvert !"
        : "Encore " + (chapter.letters.length - completedCount) + " lettre(s) à terminer.";
    }
  }
}

function animateSecondChapterChestCoins(amount) {
  const chestButton = document.querySelector("#chapterSecondChestZone .chapter3d-chest-button");
  const coinCounter = document.getElementById("globalCoins");
  const layer = document.getElementById("rewardAnimationLayer");

  if (!chestButton || !coinCounter || !layer) {
    createConfetti();
    return;
  }

  const source = chestButton.getBoundingClientRect();
  const target = coinCounter.getBoundingClientRect();
  const count = Math.min(Math.max(Math.round(amount / 4), 7), 12);

  for (let i = 0; i < count; i++) {
    const coin = document.createElement("span");
    coin.className = "chapter-chest-flying-coin";
    coin.textContent = "🪙";
    coin.style.left = source.left + source.width / 2 + (Math.random() * 70 - 35) + "px";
    coin.style.top = source.top + source.height / 2 + (Math.random() * 40 - 20) + "px";
    layer.appendChild(coin);

    setTimeout(() => {
      coin.style.left = target.left + target.width / 2 + (Math.random() * 14 - 7) + "px";
      coin.style.top = target.top + target.height / 2 + (Math.random() * 10 - 5) + "px";
      coin.style.opacity = "0";
      coin.style.transform = "translate(-50%, -50%) scale(.35) rotate(420deg)";
    }, 120 + i * 55);

    setTimeout(() => coin.remove(), 1250 + i * 55);
  }
}

function openSecondChapterChest() {
  const chapterNumber = currentLetterChapter;
  const chapter = letterChapters[chapterNumber];
  const chest = document.getElementById("chapterSecondChestZone");
  const chestImage = document.getElementById("chapterSecondChestImage");

  if (chapterNumber !== 5 || !chapter || !chest) return;
  if (isSecondChapterChestOpened(chapterNumber)) return;

  const chapterCompleted = chapter.letters.every(letter =>
    isLessonCompleted("letter", letter)
  );

  if (!chapterCompleted || !chest.classList.contains("ready")) {
    showToast("Termine V, W et Z pour ouvrir ce coffre.");
    return;
  }

  if (!gameState.openedSecondChapterChests) {
    gameState.openedSecondChapterChests = {};
  }

  const reward = chapter.secondChestReward || chapter.chestReward || 40;

  gameState.openedSecondChapterChests[chapterNumber] = true;
  gameState.coins += reward;

  /* La grande fin commence toujours depuis la scène 1
     immédiatement après l'ouverture de ce deuxième coffre. */
  ensureFinalCinematicState();
  gameState.finalCinematic.unlocked = true;
  gameState.finalCinematic.completed = false;
  gameState.finalCinematic.currentScene = 1;

  unlockFinalCinematic();
  saveGameState();

  chest.classList.add("opening");
  if (chestImage) chestImage.src = chapter.chestOpen;

  animateSecondChapterChestCoins(reward);
  createConfetti();
  updateGameUi();
  showToast("+" + reward + " pièces récupérées dans le deuxième coffre !");

  setTimeout(() => {
    chest.classList.remove("opening");
    updateSecondChapterChestState(chapterNumber, true, chapter.letters.length);

    /* Pas de condition supplémentaire : ouvrir le deuxième coffre final
       déclenche forcément la cinématique. */
    startFinalCinematic(false);
  }, 1100);
}

function initChapterParallax() {
  const scene = document.querySelector(".chapter3d-scene");
  if (!scene) return;

  scene.classList.remove("parallax-active");

  const bg = scene.querySelector(".chapter3d-bg");
  const progress = scene.querySelector(".chapter3d-progress");
  const nodes = [...scene.querySelectorAll(".chapter3d-node")];
  const chests = [...scene.querySelectorAll(".chapter3d-chest")];

  if (bg) bg.style.transform = "none";
  if (progress) progress.style.transform = "none";
  nodes.forEach(node => node.style.transform = "none");
  chests.forEach(chest => chest.style.transform = "none");
}


/* =========================================================
   CINÉMATIQUE FINALE — RETOUR DES ÉTOILES
========================================================= */
const FINAL_BACKGROUND_PATH = scene => `images/Fin/image ${scene}.png`;
const FINAL_CHARACTER_PATHS = {
  lumi: "images/personnages/lumi/",
  lila: "images/personnages/lila/",
  pico: "images/personnages/Pico/",
  noa: "images/personnages/noa/",
  aurore: "images/personnages/Aurore/",
  orion: "images/personnages/Orion/"
};

const FINAL_SCENES = {
  1: { speaker: "Narrateur", text: "Les cinq amis arrivent enfin au Royaume des Étoiles…" },
  2: { speaker: "Orion", text: "Bienvenue, courageux voyageurs. Je vous attendais." },
  3: { speaker: "Orion", text: "Approchez du cercle. Ensemble, nous pouvons rendre sa lumière au ciel." },
  4: { speaker: "Narrateur", text: "Au-dessus du royaume, le ciel reste silencieux et sans étoiles." },
  5: { speaker: "Narrateur", text: "Une première lueur apparaît… mais le ciel a encore besoin de vous." },
  6: { speaker: "Orion", text: "Confiez-moi les étoiles retrouvées pendant votre aventure." },
  7: { speaker: "Narrateur", text: "La magie d’Orion traverse le cercle et emporte les étoiles vers le ciel !" },
  8: { speaker: "Narrateur", text: "Toutes les étoiles brillent à nouveau. Le royaume est sauvé !" },
  9: { speaker: "Narrateur", text: "Et depuis ce soir-là, leur lumière accompagne chaque nouvel apprentissage…" }
};

let finalSceneNumber = 1;
let finalAnimationTimers = [];
let finalWalkIntervals = [];
let finalIsTransitioning = false;
let finalDonationInProgress = false;

function ensureFinalCinematicState() {
  if (!gameState.finalCinematic) {
    gameState.finalCinematic = { unlocked:false, completed:false, seenOnce:false, currentScene:1, starsGiven:0 };
  }
  gameState.finalCinematic.starsGiven = Number(gameState.finalCinematic.starsGiven) || 0;
  if (gameState.openedSecondChapterChests?.[5]) gameState.finalCinematic.unlocked = true;
}

function unlockFinalCinematic() {
  ensureFinalCinematicState();
  gameState.finalCinematic.unlocked = true;
  saveGameState();
  updateStoryBookButton();
}

function isFinalCinematicUnlocked() {
  ensureFinalCinematicState();
  return Boolean(gameState.finalCinematic.unlocked || gameState.openedSecondChapterChests?.[5]);
}

function openUnlockedStoryBook() {
  if (!isFinalCinematicUnlocked()) return openUnlockedStoryBookPages();
  const hub = document.getElementById("storyHub");
  const finalButton = document.getElementById("storyHubFinalButton");
  if (finalButton) finalButton.disabled = !isFinalCinematicUnlocked();
  if (hub) hub.classList.remove("hidden");
}

function closeStoryHub() {
  document.getElementById("storyHub")?.classList.add("hidden");
}

function openStoryBookFromHub() {
  closeStoryHub();
  openUnlockedStoryBookPages();
}

function clearFinalAnimations() {
  finalAnimationTimers.forEach(clearTimeout);
  finalWalkIntervals.forEach(clearInterval);
  finalAnimationTimers = [];
  finalWalkIntervals = [];
  document.getElementById("finalStarsLayer")?.replaceChildren();
}

function finalCharacterElement(name) {
  return document.getElementById("final" + name.charAt(0).toUpperCase() + name.slice(1));
}

function setFinalCharacter(name, pose, visible=true) {
  const el = finalCharacterElement(name);
  if (!el) return;
  el.classList.remove("walking","magic");
  if (!visible) {
    el.classList.remove("visible");
    el.removeAttribute("src");
    return;
  }
  el.src = FINAL_CHARACTER_PATHS[name] + pose + ".png";
  el.classList.add("visible");
}

function hideAllFinalCharacters() {
  ["lumi","lila","pico","noa","aurore","orion"].forEach(name => setFinalCharacter(name,"face",false));
}

function animateFinalWalk(name, frames, duration=2800) {
  const el = finalCharacterElement(name);
  if (!el || !frames.length) return;
  let index = 0;
  setFinalCharacter(name, frames[0]);
  el.classList.add("walking");
  const interval = setInterval(() => {
    index = (index + 1) % frames.length;
    el.src = FINAL_CHARACTER_PATHS[name] + frames[index] + ".png";
  }, 250);
  finalWalkIntervals.push(interval);
  finalAnimationTimers.push(setTimeout(() => {
    clearInterval(interval);
    el.classList.remove("walking");
    el.src = FINAL_CHARACTER_PATHS[name] + "trois_quarts.png";
  }, duration));
}

function createFinalStars(count=18, sourceX=50, sourceY=64, fast=false) {
  const layer = document.getElementById("finalStarsLayer");
  if (!layer) return;
  for (let i=0;i<count;i++) {
    const star = document.createElement("span");
    star.className = "final-star-particle";
    star.textContent = i % 4 === 0 ? "✦" : "★";
    star.style.left = sourceX + (Math.random()*8-4) + "%";
    star.style.top = sourceY + (Math.random()*6-3) + "%";
    star.style.setProperty("--drift", (Math.random()*500-250) + "px");
    star.style.setProperty("--rise", (55+Math.random()*40) + "vh");
    star.style.setProperty("--duration", (fast ? 1.3+Math.random()*.8 : 2.2+Math.random()*1.5) + "s");
    star.style.animationDelay = (i*.06) + "s";
    layer.appendChild(star);
    finalAnimationTimers.push(setTimeout(() => star.remove(), 4300+i*70));
  }
}

function setupFinalSceneCharacters(scene) {
  hideAllFinalCharacters();
  const glow = document.getElementById("finalMagicGlow");
  glow?.classList.remove("active");

  if (scene === 1) {
    animateFinalWalk("lumi",["marche_1","marche_2","marche_3"],3000);
    animateFinalWalk("lila",["marche_1","marche_2","marche_3"],3200);
    animateFinalWalk("pico",["marche_1","marche_2","marche_3"],3400);
    animateFinalWalk("noa",["marche_1","marche_2"],3600);
    animateFinalWalk("aurore",["marche_1","marche_2","marche_3"],3800);
  }
  if (scene === 2) {
    setFinalCharacter("orion","serein");
    ["lumi","lila","pico","noa","aurore"].forEach(name => setFinalCharacter(name,"trois_quarts"));
  }
  if (scene === 3) setFinalCharacter("orion","concentration");
  if (scene === 6) {
    setFinalCharacter("orion","fier");
    setFinalCharacter("lumi","porte_sac");
    setFinalCharacter("lila","porte_sac");
    setFinalCharacter("pico","porte_sac");
    setFinalCharacter("noa","porte_sac");
    setFinalCharacter("aurore","porte_sac");
  }
  if (scene === 7) {
    setFinalCharacter("orion","concentration");
    finalCharacterElement("orion")?.classList.add("magic");
    glow?.classList.add("active");
    createFinalStars(55,50,70,true);
  }
  if (scene === 8 || scene === 9) {
    setFinalCharacter("lumi","dos_2");
    setFinalCharacter("lila","dos_2");
    setFinalCharacter("pico","dos_2");
    setFinalCharacter("noa","dos_2");
    setFinalCharacter("aurore","dos_2");
    setFinalCharacter("orion","dos_2");
  }
}

function updateFinalDonationPanel() {
  ensureFinalCinematicState();
  setText("finalAvailableStars", gameState.stars || 0);
  setText("finalDonationTotal", gameState.finalCinematic.starsGiven + " étoile(s) confiée(s) à Orion");
  const button = document.getElementById("finalDonateButton");
  if (button) {
    button.disabled = finalDonationInProgress;
    button.textContent = gameState.stars > 0 ? "Donner mes " + gameState.stars + " étoile(s) à Orion" : "Aucune nouvelle étoile à donner";
  }
}

function renderFinalScene(scene, immediate=false) {
  clearFinalAnimations();
  finalSceneNumber = Math.max(1,Math.min(Number(scene)||1,9));
  ensureFinalCinematicState();
  gameState.finalCinematic.currentScene = finalSceneNumber;
  saveGameState();

  const wrapper = document.getElementById("finalScene");
  const background = document.getElementById("finalBackground");
  const fade = document.getElementById("finalFade");
  const data = FINAL_SCENES[finalSceneNumber];
  const donation = document.getElementById("finalDonationPanel");
  const next = document.getElementById("finalNextButton");

  if (!wrapper || !background) return;
  wrapper.className = "final-scene final-scene-" + finalSceneNumber + " scene-zoom";
  background.src = FINAL_BACKGROUND_PATH(finalSceneNumber);
  setText("finalSpeaker", data.speaker);
  setText("finalDialogueText", data.text);
  donation?.classList.toggle("hidden", finalSceneNumber !== 6);
  if (next) {
    next.disabled = finalSceneNumber === 6 && (gameState.stars > 0 || finalDonationInProgress);
    next.innerHTML = finalSceneNumber === 9 ? "Terminer <span>✓</span>" : "Continuer <span>→</span>";
  }
  updateFinalDonationPanel();
  setupFinalSceneCharacters(finalSceneNumber);
  if (!immediate) {
    fade?.classList.add("active");
    requestAnimationFrame(() => requestAnimationFrame(() => fade?.classList.remove("active")));
  }
}

function startFinalCinematic(replay=false) {
  ensureFinalCinematicState();
  if (!isFinalCinematicUnlocked()) {
    showToast("Termine le Royaume des Étoiles pour débloquer la grande fin.");
    return;
  }
  closeStoryHub();
  hideAllScreens();
  document.getElementById("finalCinematic")?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  gameState.finalCinematic.seenOnce = true;
  const startScene = replay ? 1 : Math.max(1,Math.min(gameState.finalCinematic.currentScene || 1,9));
  saveGameState();
  renderFinalScene(startScene,true);
}

function closeFinalCinematic() {
  clearFinalAnimations();
  document.getElementById("finalCinematic")?.classList.add("hidden");
  document.body.style.overflow = "";
  showLettersHome();
}

function skipFinalCinematic() {
  ensureFinalCinematicState();
  gameState.finalCinematic.completed = true;
  gameState.finalCinematic.currentScene = 9;
  saveGameState();
  showFinalFinishedCard();
}

function nextFinalScene() {
  if (finalIsTransitioning) return;
  if (finalSceneNumber === 6 && gameState.stars > 0) {
    showToast("Donne d’abord tes étoiles à Orion.");
    return;
  }
  if (finalSceneNumber >= 9) {
    ensureFinalCinematicState();
    gameState.finalCinematic.completed = true;
    gameState.finalCinematic.currentScene = 1;
    saveGameState();
    showFinalFinishedCard();
    return;
  }
  finalIsTransitioning = true;
  const fade = document.getElementById("finalFade");
  fade?.classList.add("active");
  finalAnimationTimers.push(setTimeout(() => {
    renderFinalScene(finalSceneNumber+1,true);
    fade?.classList.remove("active");
    finalIsTransitioning = false;
  },400));
}

function donateStarsToOrion() {
  if (finalDonationInProgress) return;
  ensureFinalCinematicState();
  const amount = Math.max(0,Number(gameState.stars)||0);
  if (!amount) {
    showToast("Tu pourras revenir donner les prochaines étoiles à Orion.");
    document.getElementById("finalNextButton").disabled = false;
    return;
  }
  finalDonationInProgress = true;
  document.getElementById("finalNextButton").disabled = true;
  ["lumi","lila","pico","noa","aurore"].forEach(name => setFinalCharacter(name,"pose_sac"));
  createFinalStars(Math.min(48,Math.max(18,amount)),50,63,false);
  const batches = 10;
  let given = 0;
  for (let i=1;i<=batches;i++) {
    finalAnimationTimers.push(setTimeout(() => {
      const target = i === batches ? amount : Math.floor(amount*i/batches);
      const delta = target-given;
      given=target;
      gameState.stars = Math.max(0,gameState.stars-delta);
      gameState.finalCinematic.starsGiven += delta;
      saveGameState();
      updateGameUi();
      updateFinalDonationPanel();
    },i*150));
  }
  finalAnimationTimers.push(setTimeout(() => {
    finalDonationInProgress=false;
    updateFinalDonationPanel();
    document.getElementById("finalNextButton").disabled=false;
    showToast(amount+" étoile(s) confiée(s) à Orion !");
  },1900));
}

function showFinalFinishedCard() {
  clearFinalAnimations();
  const scene = document.getElementById("finalScene");
  if (!scene) return;
  scene.querySelector(".final-finished-card")?.remove();
  const card = document.createElement("div");
  card.className = "final-finished-card";
  card.innerHTML = `<h2>Le ciel brille à nouveau ✨</h2><p>Bravo ${gameState.childName || "Champion"} ! Grâce à toi, les étoiles ont retrouvé leur place.</p><button onclick="finishFinalCinematic()">Retourner au jeu</button>`;
  scene.appendChild(card);
}

function finishFinalCinematic() {
  document.querySelector(".final-finished-card")?.remove();
  closeFinalCinematic();
}

// Rattrapage pour les anciennes sauvegardes où le deuxième coffre final était déjà ouvert.
ensureFinalCinematicState();
if (gameState.openedSecondChapterChests?.[5]) {
  gameState.finalCinematic.unlocked = true;
  saveGameState();
}


/* =========================================================
   ÉTOILES UNIQUES + MÉMOIRE DES ERREURS
   Ajout isolé : ne modifie pas les chapitres, coffres ou cinématiques.
========================================================= */

(function installUniqueStarsAndMistakes(){
  const MAX_EXERCISE_STARS = 3;

  function ensureUniqueRewardState(){
    if (!gameState.uniqueRewards) gameState.uniqueRewards = {};
    if (!gameState.mistakes) gameState.mistakes = {};
    if (!Number.isFinite(gameState.totalStarsEarned)) {
      gameState.totalStarsEarned = Number(gameState.stars || 0) + Number(gameState.finalCinematic?.starsGiven || 0);
    }
    if (!Number.isFinite(gameState.mistakesRecovered)) gameState.mistakesRecovered = 0;

    ensureLearningProgress();
    [...activeLetters].forEach(letter => migrateProgressEntry(getProgress("letter", letter), "letter", letter));
    [...soundKeys].forEach(sound => migrateProgressEntry(getProgress("sound", sound), "sound", sound));
  }

  function migrateProgressEntry(progress, type, key){
    if (!progress) return;
    if (!progress.exerciseRewards) progress.exerciseRewards = {};

    // On reprend les anciennes étoiles comme déjà gagnées pour éviter tout doublon après mise à jour.
    if (!Number.isFinite(progress.exerciseRewards.exercise1)) {
      progress.exerciseRewards.exercise1 = Math.min(MAX_EXERCISE_STARS, Number(progress.exercise1Stars || 0));
    }
    if (type === "letter" && !Number.isFinite(progress.exerciseRewards.exercise2)) {
      progress.exerciseRewards.exercise2 = Math.min(MAX_EXERCISE_STARS, Number(progress.exercise2Stars || 0));
    }
  }

  function makeExerciseRewardKey(type, lessonKey, exerciseName){
    return `lesson:${type}:${lessonKey}:${exerciseName}`;
  }

  function grantUniqueExerciseStars(type, lessonKey, exerciseName, desiredTotal){
    ensureUniqueRewardState();
    const progress = getProgress(type, lessonKey);
    migrateProgressEntry(progress, type, lessonKey);

    const oldTotal = Math.min(MAX_EXERCISE_STARS, Number(progress.exerciseRewards[exerciseName] || 0));
    const newTotal = Math.min(MAX_EXERCISE_STARS, Math.max(oldTotal, Number(desiredTotal || 0)));
    const gained = newTotal - oldTotal;

    progress.exerciseRewards[exerciseName] = newTotal;
    if (exerciseName === "exercise1") progress.exercise1Stars = newTotal;
    if (exerciseName === "exercise2") progress.exercise2Stars = newTotal;

    const rewardKey = makeExerciseRewardKey(type, lessonKey, exerciseName);
    gameState.uniqueRewards[rewardKey] = newTotal;

    if (gained > 0) {
      gameState.stars += gained;
      gameState.totalStarsEarned += gained;
    }

    saveGameState();
    return gained;
  }

  function mistakeId(type, lessonType, lessonKey, answer){
    return `${type}:${lessonType || "general"}:${lessonKey || "general"}:${String(answer).toLowerCase()}`;
  }

  function rememberMistake(data){
    ensureUniqueRewardState();
    const id = data.id || mistakeId(data.kind, data.lessonType, data.lessonKey, data.answer);
    const previous = gameState.mistakes[id] || {};
    gameState.mistakes[id] = {
      ...previous,
      ...data,
      id,
      attempts: Number(previous.attempts || 0) + 1,
      createdAt: previous.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    saveGameState();
    refreshMistakeUi();
    return id;
  }

  /* Rend la fonction disponible aux correctifs chargés plus loin
     dans ce même fichier. Sans cela, leur bloc try/catch masquait
     une ReferenceError et l'erreur n'était jamais sauvegardée. */
  window.rememberMistake = rememberMistake;

  function resolveMistake(id){
    ensureUniqueRewardState();
    const mistake = gameState.mistakes[id];
    if (!mistake) return 0;

    let gained = 0;
    if (mistake.exerciseName && mistake.lessonType && mistake.lessonKey) {
      const progress = getProgress(mistake.lessonType, mistake.lessonKey);
      migrateProgressEntry(progress, mistake.lessonType, mistake.lessonKey);
      const current = Number(progress.exerciseRewards[mistake.exerciseName] || 0);
      gained = grantUniqueExerciseStars(
        mistake.lessonType,
        mistake.lessonKey,
        mistake.exerciseName,
        Math.min(MAX_EXERCISE_STARS, current + 1)
      );
    } else {
      const rewardKey = `mistake:${id}`;
      if (!gameState.uniqueRewards[rewardKey]) {
        gameState.uniqueRewards[rewardKey] = 1;
        gameState.stars += 1;
        gameState.totalStarsEarned += 1;
        gained = 1;
      }
    }

    delete gameState.mistakes[id];
    gameState.mistakesRecovered += 1;
    saveGameState();
    updateGameUi();
    return gained;
  }

  function getMistakes(){
    ensureUniqueRewardState();
    return Object.values(gameState.mistakes).sort((a,b) => Number(a.createdAt||0) - Number(b.createdAt||0));
  }

  function refreshMistakeUi(){
    const count = getMistakes().length;
    setText("homeMistakeCount", `${count} erreur${count > 1 ? "s" : ""}`);
    setText("mistakeReviewCount", `${count} erreur${count > 1 ? "s" : ""}`);
    setText("mistakeRecoveredCount", gameState.mistakesRecovered || 0);
    const button = document.getElementById("mistakeReviewHomeButton");
    if (button) button.classList.toggle("no-mistakes", count === 0);
  }

  // L'écran est ajouté au système d'écrans existant sans changer les autres.
  const originalHideAllScreens = hideAllScreens;
  hideAllScreens = function(){
    originalHideAllScreens();
    document.getElementById("mistakeReviewScreen")?.classList.add("hidden");
  };

  let activeMistakeId = null;
  let selectedMistakeAnswer = "";

  window.showMistakeReview = function(){
    /* L'enfant doit entendre clairement les mots et les sons à corriger :
       aucune musique de fond ne joue sur cet écran. */
    window.LumiAudio?.stopBackground?.(true);
    hideAllScreens();
    document.getElementById("mistakeReviewScreen")?.classList.remove("hidden");
    renderMistakeList();
  };

  function labelForMistake(m){
    if (m.kind === "math") return "Calcul";
    if (m.kind === "match") return `Lettre ${m.lessonKey}`;
    if (m.lessonType === "sound") return `Son ${m.lessonKey}`;
    return `Lettre ${m.lessonKey || ""}`.trim();
  }

  function descriptionForMistake(m){
    if (m.kind === "math") return m.prompt || "Calcul à corriger";
    if (m.kind === "match") return `Associer le son « ${m.answer} » à la bonne syllabe`;
    return `Reconnaître le mot « ${m.answer} »`;
  }

  function renderMistakeList(){
    activeMistakeId = null;
    selectedMistakeAnswer = "";
    refreshMistakeUi();
    const content = document.getElementById("mistakeReviewContent");
    if (!content) return;
    const mistakes = getMistakes();

    if (!mistakes.length) {
      content.innerHTML = `<div class="mistake-empty">
        <div class="mistake-empty-icon">✓</div>
        <h3>Tout est corrigé !</h3>
        <p>Tu n'as plus aucune erreur à refaire. Bravo !</p>
      </div>`;
      return;
    }

    content.innerHTML = mistakes.map((m,index) => `<article class="mistake-card">
      <div class="mistake-card-icon">${m.kind === "math" ? "＋" : m.kind === "match" ? "♫" : "Aa"}</div>
      <div>
        <small>${labelForMistake(m)}</small>
        <strong>${descriptionForMistake(m)}</strong>
        <p>${m.attempts || 1} essai${(m.attempts || 1) > 1 ? "s" : ""}</p>
      </div>
      <button onclick="openMistakeQuestion('${escapeJS(m.id)}')">Corriger</button>
    </article>`).join("");
  }

  window.openMistakeQuestion = function(id){
    const mistake = gameState.mistakes?.[id];
    if (!mistake) return renderMistakeList();
    activeMistakeId = id;
    selectedMistakeAnswer = "";
    renderActiveMistake(mistake);
  };

  function buildMistakeChoices(m){
    if (m.kind === "match") {
      const lesson = letterLessons[m.lessonKey];
      const values = lesson?.syllables?.map(item => item.syllable) || [m.answer];
      return shuffleArray([...new Set([m.answer, ...values])]).slice(0,4);
    }
    const lesson = m.lessonType === "sound" ? soundLessons[m.lessonKey] : letterLessons[m.lessonKey];
    const values = lesson?.words?.map(item => item.word) || [m.answer];
    const distractors = shuffleArray(values.filter(v => v !== m.answer)).slice(0,2);
    return shuffleArray([m.answer, ...distractors]);
  }

  function renderActiveMistake(m){
    const content = document.getElementById("mistakeReviewContent");
    if (!content) return;

    if (m.kind === "math") {
      content.innerHTML = `<section class="mistake-question-panel">
        <div class="mistake-question-top"><small>${labelForMistake(m)}</small><span>Une étoile à récupérer</span></div>
        <h3 class="mistake-question-title">${m.prompt}</h3>
        <input id="mistakeMathAnswer" type="number" inputmode="numeric" placeholder="Ta réponse">
        <div id="mistakeMessage" class="message"></div>
        <div class="mistake-review-actions">
          <button onclick="validateMistakeAnswer()">Valider</button>
          <button class="secondary" onclick="renderMistakeList()">Retour à la liste</button>
        </div>
      </section>`;
      document.getElementById("mistakeMathAnswer")?.addEventListener("keydown", e => {
        if (e.key === "Enter") validateMistakeAnswer();
      });
      return;
    }

    const choices = buildMistakeChoices(m);
    content.innerHTML = `<section class="mistake-question-panel">
      <div class="mistake-question-top"><small>${labelForMistake(m)}</small><span>Une étoile à récupérer</span></div>
      <h3 class="mistake-question-title">${m.kind === "match" ? "Écoute puis choisis la bonne syllabe" : "Écoute puis choisis le bon mot"}</h3>
      <button class="btn primary" onclick="speak('${escapeJS(m.audio || m.answer)}')">
        <img src="images/interface/listen.png" class="inline-listen-icon" alt=""> Écouter
      </button>
      <div class="mistake-review-choices" style="margin-top:15px;">
        ${choices.map(choice => `<button onclick="selectMistakeAnswer(this,'${escapeJS(choice)}')">${choice}</button>`).join("")}
      </div>
      <div id="mistakeMessage" class="message"></div>
      <div class="mistake-review-actions">
        <button onclick="validateMistakeAnswer()">Valider</button>
        <button class="secondary" onclick="renderMistakeList()">Retour à la liste</button>
      </div>
    </section>`;
    setTimeout(() => speak(m.audio || m.answer), 180);
  }

  window.selectMistakeAnswer = function(button, answer){
    selectedMistakeAnswer = answer;
    document.querySelectorAll(".mistake-review-choices button").forEach(btn => btn.classList.remove("selected"));
    button?.classList.add("selected");
  };

  window.validateMistakeAnswer = function(){
    const mistake = gameState.mistakes?.[activeMistakeId];
    if (!mistake) return renderMistakeList();
    const msg = document.getElementById("mistakeMessage");
    const answer = mistake.kind === "math"
      ? String(document.getElementById("mistakeMathAnswer")?.value ?? "")
      : selectedMistakeAnswer;

    if (!answer) {
      if (msg) { msg.textContent = "Choisis une réponse"; msg.className = "message bad"; }
      return;
    }

    if (String(answer).toLowerCase() !== String(mistake.answer).toLowerCase()) {
      mistake.attempts = Number(mistake.attempts || 0) + 1;
      mistake.updatedAt = Date.now();
      saveGameState();
      if (msg) { msg.textContent = "Essaie encore"; msg.className = "message bad"; }
      return;
    }

    const gained = resolveMistake(activeMistakeId);
    createConfetti();
    const content = document.getElementById("mistakeReviewContent");
    if (content) content.innerHTML = `<section class="mistake-question-panel mistake-corrected">
      <div class="big-star">★</div>
      <h3>Erreur corrigée !</h3>
      <p>${gained > 0 ? `Tu récupères ${gained} étoile${gained > 1 ? "s" : ""}.` : "Cette question est maintenant maîtrisée."}</p>
      <div class="mistake-review-actions">
        <button onclick="renderMistakeList()">Continuer</button>
        <button class="secondary" onclick="showHome()">Accueil</button>
      </div>
    </section>`;
  };

  window.renderMistakeList = renderMistakeList;

  // On complète l'interface après chaque mise à jour générale.
  const originalUpdateGameUi = updateGameUi;
  updateGameUi = function(){
    originalUpdateGameUi();
    refreshMistakeUi();
    setText("parentTotalStars", gameState.totalStarsEarned || gameState.stars);
  };

  // CALCULS : une même question exacte ne redonne jamais deux fois ses étoiles.
  let currentUniqueMathKey = "";
  const originalNewQuestion = newQuestion;
  newQuestion = function(){
    originalNewQuestion();
    currentUniqueMathKey = `math:${questionType}:${number1}:${number2}:${correctAnswer}`;
  };

  checkAnswer = function(){
    if (gameStopped) return;
    const userAnswer = Number(answerInput.value);
    if (answerInput.value === "") {
      messageElement.textContent = "Écris une réponse 🙂";
      messageElement.className = "message bad";
      return;
    }

    total++;
    if (userAnswer === correctAnswer) {
      score++;
      messageElement.textContent = "Bravo !";
      messageElement.className = "message good";
      createConfetti();

      ensureUniqueRewardState();
      const alreadyEarned = Boolean(gameState.uniqueRewards[currentUniqueMathKey]);
      if (!alreadyEarned) {
        gameState.uniqueRewards[currentUniqueMathKey] = 2;
        gameState.totalStarsEarned += 2;
      }
      rewardPlayer(10, alreadyEarned ? 0 : 2, 4, null);
      if (gameState.mistakes[currentUniqueMathKey]) delete gameState.mistakes[currentUniqueMathKey];
      saveGameState();
      if (alreadyEarned) showToast("Bonne réponse · étoiles déjà récupérées");
    } else {
      messageElement.textContent = "Presque ! La réponse était " + correctAnswer;
      messageElement.className = "message bad";
      rememberMistake({
        id: currentUniqueMathKey,
        kind: "math",
        prompt: questionElement.textContent || `${number1} + ${number2} = ?`,
        answer: String(correctAnswer)
      });
      recordWrongAnswer();
    }

    scoreElement.textContent = score;
    totalElement.textContent = total;
    progressBar.style.width = total > 0 ? Math.round((score / total) * 100) + "%" : "0%";
    setTimeout(newQuestion, 900);
  };

  // EXERCICE 1 : enregistre le mot raté et ne crédite que l'amélioration du score.
  validateGuidedExerciseOne = function(goodAnswer, replay){
    const msg = document.getElementById("exerciseMessage");
    if (!selectedAnswer) {
      msg.textContent = "Choisis une réponse";
      msg.className = "message bad";
      return;
    }

    if (selectedAnswer !== goodAnswer) {
      guidedExerciseErrors += 1;
      msg.textContent = "Essaie encore";
      msg.className = "message bad";
      rememberMistake({
        kind: "word",
        lessonType: currentLesson.type,
        lessonKey: currentLesson.key,
        exerciseName: "exercise1",
        answer: goodAnswer,
        audio: goodAnswer
      });
      recordWrongAnswer();
      return;
    }

    guidedExerciseCorrect += 1;
    lastExerciseWord = goodAnswer;
    msg.textContent = "Bravo !";
    msg.className = "message good";
    createConfetti();
    rewardPlayer(7, 0, 2, null);
    guidedExerciseRoundIndex += 1;

    if (guidedExerciseRoundIndex >= guidedExerciseTarget) {
      setTimeout(() => finishGuidedExerciseOne(replay), 650);
      return;
    }
    setTimeout(() => showListenAndChooseExerciseRound(replay), 650);
  };

  finishGuidedExerciseOne = function(replay){
    const desiredStars = calculateExerciseStars(guidedExerciseErrors);
    const progress = getProgress(currentLesson.type, currentLesson.key);
    const gained = grantUniqueExerciseStars(currentLesson.type, currentLesson.key, "exercise1", desiredStars);

    progress.exercise1Done = true;
    if (!replay && !progress.completed) {
      if (currentLesson.type === "letter") {
        progress.step = 5;
        saveLearningProgress();
        updateLessonTabs();
        setTimeout(() => showLessonPart("exercise2", true), 450);
      } else {
        completeCurrentLesson(0);
      }
      return;
    }
    showExerciseReplayResult(gained, desiredStars, "exercise1");
  };

  // EXERCICE 2 : chaque mauvaise association reste dans « Mes erreurs ».
  validateGuidedMatch = function(replay){
    const msg = document.getElementById("matchMessage");
    if (!selectedSound || !selectedSyllable) {
      msg.textContent = "Choisis les deux";
      msg.className = "message bad";
      return;
    }

    if (selectedSound !== selectedSyllable) {
      guidedExerciseErrors += 1;
      msg.textContent = "Essaie encore";
      msg.className = "message bad";
      const audioItem = currentLesson.syllables.find(item => item.syllable === selectedSound);
      rememberMistake({
        kind: "match",
        lessonType: "letter",
        lessonKey: currentLesson.key,
        exerciseName: "exercise2",
        answer: selectedSound,
        audio: audioItem?.audio || selectedSound
      });
      recordWrongAnswer();
      return;
    }

    msg.textContent = "Bravo !";
    msg.className = "message good";
    rewardPlayer(5, 0, 2, null);
    remainingMatchItems = remainingMatchItems.filter(item => item.syllable !== selectedSound);

    if (remainingMatchItems.length === 0) {
      const desiredStars = calculateExerciseStars(guidedExerciseErrors);
      const progress = getProgress("letter", currentLesson.key);
      const gained = grantUniqueExerciseStars("letter", currentLesson.key, "exercise2", desiredStars);
      progress.exercise2Done = true;

      if (!replay && !progress.completed) completeCurrentLesson(0);
      else showExerciseReplayResult(gained, desiredStars, "exercise2");
      return;
    }
    setTimeout(() => renderMatchExerciseGuided(replay), 650);
  };

  showExerciseReplayResult = function(gained, score){
    if (gained > 0) createConfetti();
    lessonContent.innerHTML = `<div class="completion-panel">
      <div class="completion-badge">★</div>
      <h2>Exercice terminé !</h2>
      <p>${gained > 0 ? `Tu as récupéré ${gained} nouvelle${gained > 1 ? "s" : ""} étoile${gained > 1 ? "s" : ""}.` : "Tu avais déjà récupéré les étoiles de cet exercice."}</p>
      <strong>Meilleur résultat : ${score || 0} / ${MAX_EXERCISE_STARS} étoiles</strong>
      <div class="guided-actions" style="justify-content:center">
        <button class="btn primary" onclick="showExerciseMenu()">Choisir un exercice</button>
        ${getMistakes().length ? '<button class="btn stop" onclick="showMistakeReview()">Refaire mes erreurs</button>' : ""}
      </div>
    </div>`;
  };

  // Empêche completeCurrentLesson de recréditer une deuxième fois les étoiles.
  completeCurrentLesson = function(lastExerciseStars){
    const type = currentLesson.type;
    const key = currentLesson.key;
    const progress = getProgress(type, key);
    progress.completed = true;
    progress.step = getGuidedSteps(type).length;

    const list = type === "letter" ? activeLetters : soundKeys;
    const index = list.indexOf(key);
    const next = list[index + 1];
    if (next) {
      const nextProgress = getProgress(type, next);
      nextProgress.unlocked = true;
      gameState.learningProgress.lastUnlocked = `${type}-${next}`;
    } else if (type === "letter") {
      const firstSound = getProgress("sound", soundKeys[0]);
      firstSound.unlocked = true;
      gameState.learningProgress.lastUnlocked = `sound-${soundKeys[0]}`;
    }

    saveLearningProgress();
    updateLessonMastery();
    createConfetti();
    const nextLabel = next
      ? (type === "letter" ? "la lettre " : "le son ") + next
      : type === "letter" ? "le parcours des sons composés" : "la fin du parcours";

    lessonContent.innerHTML = `<div class="completion-panel">
      <div class="completion-badge">★</div>
      <h2>${currentLesson.title} terminée !</h2>
      <p>Tu as débloqué ${nextLabel}.</p>
      <strong>${getTotalLessonStars(type,key)} étoile(s) gagnée(s) sur ${type === "letter" ? 6 : 3}</strong>
      <div class="guided-actions" style="justify-content:center">
        <button class="btn primary guided-next" onclick="returnToPathAfterCompletion()">Voir la suite →</button>
        ${getMistakes().length ? '<button class="btn stop" onclick="showMistakeReview()">Refaire mes erreurs</button>' : ""}
      </div>
    </div>`;
  };

  ensureUniqueRewardState();
  saveGameState();
  updateGameUi();
})();


/* =========================================================
   CORRECTIF EXERCICES + CARTE DES ROYAUMES
========================================================= */
(function(){
  function getExerciseReplayAction(exerciseName){
    if (exerciseName === "exercise2") {
      return {
        label: "Refaire l’exercice 2",
        action: "showMatchExercise(true)",
        nextLabel: "Continuer",
        nextAction: "returnToPathAfterCompletion()"
      };
    }

    return {
      label: currentLesson?.type === "sound"
        ? "Refaire l’exercice"
        : "Refaire l’exercice 1",
      action: "startGuidedExerciseOne(true)",
      nextLabel: currentLesson?.type === "letter"
        ? "Passer à l’exercice 2"
        : "Continuer",
      nextAction: currentLesson?.type === "letter"
        ? "showLessonPart('exercise2', true)"
        : "returnToPathAfterCompletion()"
    };
  }

  // Remplace le bouton ambigu « Choisir un exercice ».
  showExerciseReplayResult = function(gained, score, exerciseName = "exercise1"){
    const action = getExerciseReplayAction(exerciseName);
    if (gained > 0) createConfetti();

    lessonContent.innerHTML = `<div class="completion-panel">
      <div class="completion-badge">★</div>
      <h2>Exercice terminé !</h2>
      <p>${gained > 0
        ? `Tu as récupéré ${gained} nouvelle${gained > 1 ? "s" : ""} étoile${gained > 1 ? "s" : ""}.`
        : "Tu avais déjà récupéré les étoiles de cet exercice."}</p>
      <strong>Meilleur résultat : ${score || 0} / ${MAX_EXERCISE_STARS} étoiles</strong>
      <p class="exercise-result-label">${exerciseName === "exercise2"
        ? "Tu viens de terminer l’exercice des syllabes à relier."
        : "Tu viens de terminer l’exercice d’écoute et de mots."}</p>
      <div class="guided-actions" style="justify-content:center">
        <button class="btn primary" onclick="${action.action}">${action.label}</button>
        <button class="btn guided-next" onclick="${action.nextAction}">${action.nextLabel} →</button>
        ${getMistakes().length
          ? '<button class="btn stop" onclick="showMistakeReview()">Corriger mes erreurs</button>'
          : ""}
      </div>
    </div>`;
  };

  function getChapterUniqueStars(chapter){
    if (!chapter) return 0;
    return chapter.letters.reduce((total, letter) => {
      const progress = getProgress("letter", letter);
      const ex1 = Number(progress?.exerciseRewards?.exercise1 ?? progress?.exercise1Stars ?? 0);
      const ex2 = Number(progress?.exerciseRewards?.exercise2 ?? progress?.exercise2Stars ?? 0);
      return total + Math.min(3, ex1) + Math.min(3, ex2);
    }, 0);
  }

  function getChapterCompletion(chapter){
    if (!chapter) return {completed:0,total:0,percent:0};
    const completed = chapter.letters.filter(letter =>
      isLessonCompleted("letter", letter)
    ).length;
    return {
      completed,
      total: chapter.letters.length,
      percent: chapter.letters.length
        ? Math.round(completed / chapter.letters.length * 100)
        : 0
    };
  }

  function getGlobalUniqueStars(){
    return Object.values(letterChapters).reduce(
      (sum, chapter) => sum + getChapterUniqueStars(chapter),
      0
    );
  }

  function getOrionStars(){
    return Number(
      gameState.finalCinematic?.starsGiven ??
      gameState.starsGivenToOrion ??
      0
    );
  }

  function renderWorldMap(){
    const path = document.getElementById("worldMapPath");
    if (!path) return;

    const completedWorlds = Object.values(letterChapters).filter(chapter =>
      chapter.letters.every(letter => isLessonCompleted("letter", letter))
    ).length;

    const mistakes = typeof getMistakes === "function" ? getMistakes().length : 0;
    const uniqueStars = getGlobalUniqueStars();

    setText("worldMapStars", gameState.stars || 0);
    setText("worldMapCompleted", completedWorlds + " / 5");
    setText("worldMapUniqueStars", uniqueStars);
    setText("worldMapMistakes", mistakes);
    setText("worldMapOrionStars", getOrionStars());

    path.innerHTML = Object.values(letterChapters).map(chapter => {
      const unlocked = isLetterChapterUnlocked(chapter.number);
      const progress = getChapterCompletion(chapter);
      const stars = getChapterUniqueStars(chapter);
      const maxStars = chapter.letters.length * 6;
      const completed = progress.completed === progress.total;
      const current = unlocked && !completed;
      const classes = [
        "world-map-card",
        !unlocked ? "locked" : "",
        completed ? "completed" : "",
        current ? "current" : ""
      ].filter(Boolean).join(" ");

      const action = unlocked
        ? `onclick="openWorldFromMap(${chapter.number})"`
        : `onclick="showToast('Termine le royaume précédent pour le débloquer.')"`;


      return `<button class="${classes}" ${action}>
        <div class="world-map-image" style="background-image:url('${chapter.background}')"></div>
        <div class="world-map-copy">
          <small>Chapitre ${chapter.number}</small>
          <h3>${chapter.title}</h3>
          <p>${unlocked
            ? completed
              ? "Royaume terminé ! Tu peux y retourner quand tu veux."
              : "Continue l’aventure et récupère les étoiles manquantes."
            : "Ce royaume est encore verrouillé."}</p>
          <div class="world-map-progress">
            <span style="width:${progress.percent}%"></span>
          </div>
          <div class="world-map-meta">
            <span>✓ ${progress.completed}/${progress.total} lettres</span>
            <span>⭐ ${stars}/${maxStars}</span>
            <span>${completed ? "Terminé" : unlocked ? "En cours" : "Verrouillé"}</span>
          </div>
        </div>
      </button>`;
    }).join("");
  }

  window.showWorldMap = function(){
    hideAllScreens();
    if (!worldMapScreen) return;
    worldMapScreen.classList.remove("hidden");
    renderWorldMap();
  };

  window.openWorldFromMap = function(chapterNumber){
    if (!isLetterChapterUnlocked(chapterNumber)) {
      showToast("Ce royaume est encore verrouillé.");
      return;
    }
    currentLetterChapter = chapterNumber;
    showLettersHome();
    showLetterChapter(chapterNumber);
  };

  // La carte se met à jour avec les nouvelles étoiles et erreurs.
  const previousUpdateGameUiForMap = updateGameUi;
  updateGameUi = function(){
    previousUpdateGameUiForMap();
    if (worldMapScreen && !worldMapScreen.classList.contains("hidden")) {
      renderWorldMap();
    }
  };
})();


/* =========================================================
   CORRECTIFS V2 — FIN DES EXERCICES, CONTINUER, CARTE
   Ajouté à la fin pour remplacer proprement les anciennes fonctions.
========================================================= */
(function(){
  function chapterNumberForLetter(letter){
    for (const [number, chapter] of Object.entries(letterChapters)) {
      if (chapter.letters.includes(letter)) return Number(number);
    }
    return 1;
  }

  function hasLetterStarted(letter){
    const p = getProgress("letter", letter);
    return Boolean(
      p &&
      (
        Number(p.step || 0) > 0 ||
        p.exercise1Done ||
        p.exercise2Done ||
        Number(p.exercise1Stars || 0) > 0 ||
        Number(p.exercise2Stars || 0) > 0
      )
    );
  }

  function getNextLetterToLearn(){
    return activeLetters.find(letter => !isLessonCompleted("letter", letter)) || null;
  }

  function openLetterMap(chapterNumber){
    currentLetterChapter = chapterNumber;
    showLettersHome();
    showLetterChapter(chapterNumber);
  }

  /* ---------------------------------------------------------
     BOUTON CONTINUER
     - lettre commencée : ouvre directement la lettre ;
     - lettre pas encore commencée : ouvre son royaume ;
     - après la dernière lettre : ouvre le Royaume des Étoiles.
  --------------------------------------------------------- */
  continueLearning = function(){
    ensureLearningProgress();

    const nextLetter = getNextLetterToLearn();

    if (nextLetter) {
      const chapterNumber = chapterNumberForLetter(nextLetter);

      if (hasLetterStarted(nextLetter)) {
        openLesson(nextLetter, "letter");
      } else {
        openLetterMap(chapterNumber);
      }
      return;
    }

    // Toutes les lettres sont terminées.
    openLetterMap(5);
  };

  function exerciseResultHtml({
    gained = 0,
    score = 0,
    exerciseName = "exercise1",
    lessonCompleted = false
  }){
    const isExerciseTwo = exerciseName === "exercise2";
    const mistakesButton = getMistakes().length
      ? '<button class="btn stop" onclick="showMistakeReview()">Corriger mes erreurs</button>'
      : "";

    let actions = "";

    if (!isExerciseTwo) {
      actions = `
        <button class="btn primary" onclick="startGuidedExerciseOne(true)">Refaire l’exercice 1</button>
        <button class="btn guided-next" onclick="showLessonPart('exercise2', true)">Passer à l’exercice 2 →</button>
        ${mistakesButton}`;
    } else {
      actions = `
        <button class="btn primary" onclick="showMatchExercise(true)">Refaire l’exercice 2</button>
        <button class="btn guided-next" onclick="returnToPathAfterCompletion()">Continuer →</button>
        ${mistakesButton}`;
    }

    return `<div class="completion-panel">
      <div class="completion-badge">★</div>
      <h2>${lessonCompleted ? `${currentLesson.title} terminée !` : "Exercice terminé !"}</h2>
      <p>${gained > 0
        ? `Tu as récupéré ${gained} nouvelle${gained > 1 ? "s" : ""} étoile${gained > 1 ? "s" : ""}.`
        : "Les étoiles déjà gagnées restent enregistrées."}</p>
      <strong>Résultat : ${score || 0} / ${MAX_EXERCISE_STARS} étoiles</strong>
      <p class="exercise-result-label">${isExerciseTwo
        ? "L’exercice des syllabes à relier est terminé."
        : "L’exercice d’écoute et de mots est terminé."}</p>
      <div class="exercise-finish-actions">${actions}</div>
    </div>`;
  }

  showExerciseReplayResult = function(gained, score, exerciseName = "exercise1"){
    if (gained > 0) createConfetti();
    lessonContent.innerHTML = exerciseResultHtml({
      gained,
      score,
      exerciseName,
      lessonCompleted: exerciseName === "exercise2" &&
        Boolean(getProgress("letter", currentLesson.key)?.completed)
    });
  };

  /* ---------------------------------------------------------
     FIN EXERCICE 1
     Toujours afficher les boutons. Plus de passage silencieux.
  --------------------------------------------------------- */
  finishGuidedExerciseOne = function(replay){
    const desiredStars = calculateExerciseStars(guidedExerciseErrors);
    const progress = getProgress(currentLesson.type, currentLesson.key);
    const gained = grantUniqueExerciseStars(
      currentLesson.type,
      currentLesson.key,
      "exercise1",
      desiredStars
    );

    progress.exercise1Done = true;
    progress.exercise1Stars = Math.max(
      Number(progress.exercise1Stars || 0),
      desiredStars
    );

    if (currentLesson.type === "letter") {
      progress.step = Math.max(Number(progress.step || 0), 5);
    }

    saveLearningProgress();
    showExerciseReplayResult(gained, desiredStars, "exercise1");
  };

  /* ---------------------------------------------------------
     FIN EXERCICE 2
     Termine la lettre puis affiche toujours les deux boutons.
  --------------------------------------------------------- */
  validateGuidedMatch = function(replay){
    const msg = document.getElementById("matchMessage");
    if (!selectedSound || !selectedSyllable) {
      if (msg) {
        msg.textContent = "Choisis les deux";
        msg.className = "message bad";
      }
      return;
    }

    if (selectedSound !== selectedSyllable) {
      guidedExerciseErrors += 1;
      if (msg) {
        msg.textContent = "Essaie encore";
        msg.className = "message bad";
      }

      const audioItem = currentLesson.syllables.find(
        item => item.syllable === selectedSound
      );

      rememberMistake({
        kind: "match",
        lessonType: "letter",
        lessonKey: currentLesson.key,
        exerciseName: "exercise2",
        answer: selectedSound,
        audio: audioItem?.audio || selectedSound
      });

      selectedSound = null;
      selectedSyllable = null;
      recordWrongAnswer();
      setTimeout(() => renderMatchExerciseGuided(replay), 450);
      return;
    }

    if (msg) {
      msg.textContent = "Bravo !";
      msg.className = "message good";
    }

    rewardPlayer(5, 0, 2, null);
    remainingMatchItems = remainingMatchItems.filter(
      item => item.syllable !== selectedSound
    );

    selectedSound = null;
    selectedSyllable = null;

    if (remainingMatchItems.length > 0) {
      setTimeout(() => renderMatchExerciseGuided(replay), 550);
      return;
    }

    const desiredStars = calculateExerciseStars(guidedExerciseErrors);
    const progress = getProgress("letter", currentLesson.key);
    const gained = grantUniqueExerciseStars(
      "letter",
      currentLesson.key,
      "exercise2",
      desiredStars
    );

    progress.exercise2Done = true;
    progress.exercise2Stars = Math.max(
      Number(progress.exercise2Stars || 0),
      desiredStars
    );

    if (!progress.completed) {
      progress.completed = true;
      progress.step = getGuidedSteps("letter").length;

      const index = activeLetters.indexOf(currentLesson.key);
      const nextLetter = activeLetters[index + 1];

      if (nextLetter) {
        const nextProgress = getProgress("letter", nextLetter);
        nextProgress.unlocked = true;
        gameState.learningProgress.lastUnlocked = `letter-${nextLetter}`;
      } else {
        const firstSound = getProgress("sound", soundKeys[0]);
        if (firstSound) firstSound.unlocked = true;
      }
    }

    saveLearningProgress();
    updateLessonMastery();
    createConfetti();

    setTimeout(() => {
      showExerciseReplayResult(gained, desiredStars, "exercise2");
    }, 500);
  };

  /* ---------------------------------------------------------
     CONTINUER APRÈS EXERCICE 2
     Retourne sur le royaume de la prochaine lettre.
     Si cette lettre est déjà commencée, elle s’ouvre directement.
  --------------------------------------------------------- */
  returnToPathAfterCompletion = function(){
    if (!currentLesson || currentLesson.type !== "letter") {
      showSoundsHome();
      return;
    }

    const currentIndex = activeLetters.indexOf(currentLesson.key);
    const nextLetter = activeLetters[currentIndex + 1];

    if (!nextLetter) {
      openLetterMap(5);
      return;
    }

    const chapterNumber = chapterNumberForLetter(nextLetter);

    if (hasLetterStarted(nextLetter)) {
      openLesson(nextLetter, "letter");
    } else {
      openLetterMap(chapterNumber);
    }
  };

  /* ---------------------------------------------------------
     CARTE DES ROYAUMES
  --------------------------------------------------------- */
  function isChapterCompletedByNumber(chapterNumber){
    const chapter = letterChapters[chapterNumber];
    return Boolean(
      chapter &&
      chapter.letters.every(letter => isLessonCompleted("letter", letter))
    );
  }

  function isChapterUnlockedForMap(chapterNumber){
    if (chapterNumber === 1) return true;
    return isChapterCompletedByNumber(chapterNumber - 1);
  }

  function chapterUniqueStars(chapter){
    return chapter.letters.reduce((sum, letter) => {
      const p = getProgress("letter", letter);
      const ex1 = Number(
        p?.exerciseRewards?.exercise1 ??
        p?.exercise1Stars ??
        0
      );
      const ex2 = Number(
        p?.exerciseRewards?.exercise2 ??
        p?.exercise2Stars ??
        0
      );
      return sum + Math.min(3, ex1) + Math.min(3, ex2);
    }, 0);
  }

  function chapterProgressData(chapter){
    const completed = chapter.letters.filter(
      letter => isLessonCompleted("letter", letter)
    ).length;

    return {
      completed,
      total: chapter.letters.length,
      percent: chapter.letters.length
        ? Math.round(completed / chapter.letters.length * 100)
        : 0
    };
  }

  renderWorldMap = function(){
    const path = document.getElementById("worldMapPath");
    if (!path) return;

    const entries = Object.entries(letterChapters);
    const completedWorlds = entries.filter(
      ([number]) => isChapterCompletedByNumber(Number(number))
    ).length;

    const uniqueStars = entries.reduce(
      (sum, [, chapter]) => sum + chapterUniqueStars(chapter),
      0
    );

    setText("worldMapStars", gameState.stars || 0);
    setText("worldMapCompleted", `${completedWorlds} / ${entries.length}`);
    setText("worldMapUniqueStars", uniqueStars);
    setText(
      "worldMapMistakes",
      typeof getMistakes === "function" ? getMistakes().length : 0
    );
    setText(
      "worldMapOrionStars",
      Number(
        gameState.finalCinematic?.starsGiven ??
        gameState.starsGivenToOrion ??
        0
      )
    );

    path.innerHTML = entries.map(([numberText, chapter]) => {
      const chapterNumber = Number(numberText);
      const unlocked = isChapterUnlockedForMap(chapterNumber);
      const completed = isChapterCompletedByNumber(chapterNumber);
      const progress = chapterProgressData(chapter);
      const stars = chapterUniqueStars(chapter);
      const maxStars = chapter.letters.length * 6;

      const classes = [
        "world-map-card",
        unlocked ? "" : "locked",
        completed ? "completed" : "",
        unlocked && !completed ? "current" : ""
      ].filter(Boolean).join(" ");

      const click = unlocked
        ? `onclick="confirmWorldTravel(${chapterNumber})"`
        : `onclick="showToast('Termine le royaume précédent pour débloquer celui-ci.')"`;


      return `<button class="${classes}" ${click}>
        <div class="world-map-image"
             style="background-image:url('${chapter.background}')"></div>
        <div class="world-map-copy">
          <small>Royaume ${chapterNumber}</small>
          <h3>${chapter.name}</h3>
          <p>${completed
            ? "Royaume terminé. Tu peux y retourner librement."
            : unlocked
              ? "Royaume en cours. Continue ton aventure."
              : "Ce royaume est encore verrouillé."}</p>

          <div class="world-map-progress">
            <span style="width:${progress.percent}%"></span>
          </div>

          <div class="world-map-meta">
            <span>✓ ${progress.completed}/${progress.total} lettres</span>
            <span>⭐ ${stars}/${maxStars}</span>
            <span>${completed ? "Terminé" : unlocked ? "En cours" : "Verrouillé"}</span>
          </div>
        </div>
      </button>`;
    }).join("");
  };

  window.confirmWorldTravel = function(chapterNumber){
    const chapter = letterChapters[chapterNumber];
    if (!chapter) return;

    if (!isChapterUnlockedForMap(chapterNumber)) {
      showToast("Ce royaume est encore verrouillé.");
      return;
    }

    const accepted = window.confirm(
      `Es-tu sûr de vouloir aller dans « ${chapter.name} » ?`
    );

    if (!accepted) return;

    openLetterMap(chapterNumber);
  };

  window.openWorldFromMap = function(chapterNumber){
    window.confirmWorldTravel(chapterNumber);
  };

  window.showWorldMap = function(){
    hideAllScreens();
    if (!worldMapScreen) return;
    worldMapScreen.classList.remove("hidden");
    renderWorldMap();
  };

  saveGameState();
  updateGameUi();
})();


/* =========================================================
   CORRECTIF V3 — FIN D’EXERCICE FIABLE + POP-UP LUMIKIDS
========================================================= */
(function(){
  let guidedValidationLockedV3 = false;
  let finalScreenScheduledV3 = false;
  let pendingWorldNumberV3 = null;

  function lockCurrentValidateButton(){
    const buttons = lessonContent?.querySelectorAll("button");
    if (!buttons) return;

    buttons.forEach(button => {
      const text = (button.textContent || "").trim().toLowerCase();
      if (text === "valider") {
        button.disabled = true;
        button.classList.add("guided-validate-locked");
      }
    });
  }

  function unlockValidationV3(){
    guidedValidationLockedV3 = false;
    finalScreenScheduledV3 = false;
  }

  function showFinalExerciseScreenV3(exerciseName, gained, score){
    unlockValidationV3();

    const isExerciseTwo = exerciseName === "exercise2";
    const mistakesButton = getMistakes().length
      ? '<button class="btn stop" onclick="showMistakeReview()">Corriger mes erreurs</button>'
      : "";

    lessonContent.innerHTML = `<div class="completion-panel">
      <div class="completion-badge">★</div>
      <h2>${isExerciseTwo ? `${currentLesson.title} terminée !` : "Exercice terminé !"}</h2>
      <p>${gained > 0
        ? `Tu as récupéré ${gained} nouvelle${gained > 1 ? "s" : ""} étoile${gained > 1 ? "s" : ""}.`
        : "Tes étoiles déjà récupérées restent enregistrées."}</p>
      <strong>Résultat : ${score || 0} / ${MAX_EXERCISE_STARS} étoiles</strong>
      <div class="exercise-finish-actions">
        <button class="btn primary" onclick="${
          isExerciseTwo ? "showMatchExercise(true)" : "startGuidedExerciseOne(true)"
        }">Refaire l’exercice ${isExerciseTwo ? "2" : "1"}</button>

        <button class="btn guided-next" onclick="${
          isExerciseTwo
            ? "returnToPathAfterCompletion()"
            : "showLessonPart('exercise2', true)"
        }">${isExerciseTwo ? "Continuer" : "Passer à l’exercice 2"} →</button>

        ${mistakesButton}
      </div>
    </div>`;
  }

  validateGuidedExerciseOne = function(goodAnswer, replay){
    if (guidedValidationLockedV3) return;

    const msg = document.getElementById("exerciseMessage");
    if (!msg) return;

    if (!selectedAnswer) {
      msg.textContent = "Choisis une réponse";
      msg.className = "message bad";
      return;
    }

    if (selectedAnswer !== goodAnswer) {
      guidedExerciseErrors += 1;
      msg.textContent = "Essaie encore";
      msg.className = "message bad";

      rememberMistake({
        kind: "word",
        lessonType: currentLesson.type,
        lessonKey: currentLesson.key,
        exerciseName: "exercise1",
        answer: goodAnswer,
        audio: goodAnswer
      });

      selectedAnswer = "";
      recordWrongAnswer();
      return;
    }

    guidedValidationLockedV3 = true;
    lockCurrentValidateButton();

    guidedExerciseCorrect += 1;
    lastExerciseWord = goodAnswer;
    msg.textContent = "Bravo !";
    msg.className = "message good";

    createConfetti();
    rewardPlayer(7, 0, 2, null);
    guidedExerciseRoundIndex += 1;

    if (guidedExerciseRoundIndex >= guidedExerciseTarget) {
      if (finalScreenScheduledV3) return;
      finalScreenScheduledV3 = true;

      setTimeout(() => {
        const desiredStars = calculateExerciseStars(guidedExerciseErrors);
        const progress = getProgress(currentLesson.type, currentLesson.key);
        const gained = grantUniqueExerciseStars(
          currentLesson.type,
          currentLesson.key,
          "exercise1",
          desiredStars
        );

        progress.exercise1Done = true;
        progress.exercise1Stars = Math.max(
          Number(progress.exercise1Stars || 0),
          desiredStars
        );

        if (currentLesson.type === "letter") {
          progress.step = Math.max(Number(progress.step || 0), 5);
        }

        saveLearningProgress();
        showFinalExerciseScreenV3("exercise1", gained, desiredStars);
      }, 550);

      return;
    }

    setTimeout(() => {
      unlockValidationV3();
      showListenAndChooseExerciseRound(replay);
    }, 550);
  };

  validateGuidedMatch = function(replay){
    if (guidedValidationLockedV3) return;

    const msg = document.getElementById("matchMessage");
    if (!msg) return;

    if (!selectedSound || !selectedSyllable) {
      msg.textContent = "Choisis les deux";
      msg.className = "message bad";
      return;
    }

    if (selectedSound !== selectedSyllable) {
      guidedExerciseErrors += 1;
      msg.textContent = "Essaie encore";
      msg.className = "message bad";

      const audioItem = currentLesson.syllables.find(
        item => item.syllable === selectedSound
      );

      rememberMistake({
        kind: "match",
        lessonType: "letter",
        lessonKey: currentLesson.key,
        exerciseName: "exercise2",
        answer: selectedSound,
        audio: audioItem?.audio || selectedSound
      });

      selectedSound = "";
      selectedSyllable = "";
      recordWrongAnswer();
      return;
    }

    guidedValidationLockedV3 = true;
    lockCurrentValidateButton();

    msg.textContent = "Bravo !";
    msg.className = "message good";
    rewardPlayer(5, 0, 2, null);

    remainingMatchItems = remainingMatchItems.filter(
      item => item.syllable !== selectedSound
    );

    selectedSound = "";
    selectedSyllable = "";

    if (remainingMatchItems.length === 0) {
      if (finalScreenScheduledV3) return;
      finalScreenScheduledV3 = true;

      setTimeout(() => {
        const desiredStars = calculateExerciseStars(guidedExerciseErrors);
        const progress = getProgress("letter", currentLesson.key);
        const gained = grantUniqueExerciseStars(
          "letter",
          currentLesson.key,
          "exercise2",
          desiredStars
        );

        progress.exercise2Done = true;
        progress.exercise2Stars = Math.max(
          Number(progress.exercise2Stars || 0),
          desiredStars
        );

        if (!progress.completed) {
          progress.completed = true;
          progress.step = getGuidedSteps("letter").length;

          const currentIndex = activeLetters.indexOf(currentLesson.key);
          const nextLetter = activeLetters[currentIndex + 1];

          if (nextLetter) {
            getProgress("letter", nextLetter).unlocked = true;
            gameState.learningProgress.lastUnlocked = `letter-${nextLetter}`;
          }
        }

        saveLearningProgress();
        updateLessonMastery();
        createConfetti();
        showFinalExerciseScreenV3("exercise2", gained, desiredStars);
      }, 550);

      return;
    }

    setTimeout(() => {
      unlockValidationV3();
      renderMatchExerciseGuided(replay);
    }, 550);
  };

  const oldStartGuidedExerciseOneV3 = startGuidedExerciseOne;
  startGuidedExerciseOne = function(replay = false){
    unlockValidationV3();
    return oldStartGuidedExerciseOneV3(replay);
  };

  const oldShowMatchExerciseV3 = showMatchExercise;
  showMatchExercise = function(replay = false){
    unlockValidationV3();
    return oldShowMatchExerciseV3(replay);
  };

  function ensureWorldTravelDialogV3(){
    let overlay = document.getElementById("worldTravelDialog");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "worldTravelDialog";
    overlay.className = "lumikids-dialog-overlay hidden";
    overlay.innerHTML = `
      <section class="lumikids-dialog" role="dialog" aria-modal="true" aria-labelledby="worldTravelTitle">
        <div id="worldTravelImage" class="lumikids-dialog-image"></div>
        <div class="lumikids-dialog-content">
          <small>Voyager vers un royaume</small>
          <h3 id="worldTravelTitle">Le royaume</h3>
          <p>Veux-tu vraiment voyager vers ce royaume ?</p>
          <div class="lumikids-dialog-actions">
            <button class="lumikids-dialog-cancel" onclick="closeWorldTravelDialog()">Annuler</button>
            <button class="lumikids-dialog-confirm" onclick="acceptWorldTravel()">Oui, j’y vais !</button>
          </div>
        </div>
      </section>`;

    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeWorldTravelDialog();
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  window.confirmWorldTravel = function(chapterNumber){
    const chapter = letterChapters[chapterNumber];
    if (!chapter) return;

    const unlocked = chapterNumber === 1 ||
      letterChapters[chapterNumber - 1].letters.every(
        letter => isLessonCompleted("letter", letter)
      );

    if (!unlocked) {
      showToast("Termine le royaume précédent pour débloquer celui-ci.");
      return;
    }

    pendingWorldNumberV3 = chapterNumber;
    const overlay = ensureWorldTravelDialogV3();
    const image = document.getElementById("worldTravelImage");
    const title = document.getElementById("worldTravelTitle");

    if (image) image.style.backgroundImage = `url('${chapter.background}')`;
    if (title) title.textContent = chapter.name;

    overlay.classList.remove("hidden");
  };

  window.closeWorldTravelDialog = function(){
    const overlay = document.getElementById("worldTravelDialog");
    if (overlay) overlay.classList.add("hidden");
    pendingWorldNumberV3 = null;
  };

  window.acceptWorldTravel = function(){
    const chapterNumber = pendingWorldNumberV3;
    closeWorldTravelDialog();

    if (!chapterNumber) return;

    currentLetterChapter = chapterNumber;
    showLettersHome();
    showLetterChapter(chapterNumber);
  };

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeWorldTravelDialog();
  });
})();


/* =========================================================
   CORRECTIF V4 — AFFICHAGE GARANTI À LA FIN DES EXERCICES
========================================================= */
(function(){
  let exerciseFinishLockV4 = false;

  function finishScreenV4(exerciseName, score){
    const isExerciseTwo = exerciseName === "exercise2";
    const mistakesButton =
      typeof getMistakes === "function" && getMistakes().length
        ? '<button class="btn stop" onclick="showMistakeReview()">Corriger mes erreurs</button>'
        : "";

    lessonContent.innerHTML = `<div class="completion-panel">
      <div class="completion-badge">★</div>
      <h2>${isExerciseTwo ? "Lettre terminée !" : "Exercice terminé !"}</h2>
      <p>Bravo, tu as terminé cet exercice.</p>
      <strong>Résultat : ${score || 0} / 3 étoiles</strong>

      <div class="exercise-finish-actions">
        <button class="btn primary" onclick="${
          isExerciseTwo
            ? "showMatchExercise(true)"
            : "startGuidedExerciseOne(true)"
        }">
          Refaire l’exercice ${isExerciseTwo ? "2" : "1"}
        </button>

        <button class="btn guided-next" onclick="${
          isExerciseTwo
            ? "returnToPathAfterCompletion()"
            : "showLessonPart('exercise2', true)"
        }">
          ${isExerciseTwo ? "Continuer" : "Passer à l’exercice 2"} →
        </button>

        ${mistakesButton}
      </div>
    </div>`;

    exerciseFinishLockV4 = false;
  }

  function safelySaveExerciseOneV4(score){
    try{
      const progress = getProgress(currentLesson.type, currentLesson.key);

      if (typeof grantUniqueExerciseStars === "function") {
        grantUniqueExerciseStars(
          currentLesson.type,
          currentLesson.key,
          "exercise1",
          score
        );
      }

      progress.exercise1Done = true;
      progress.exercise1Stars = Math.max(
        Number(progress.exercise1Stars || 0),
        Number(score || 0)
      );

      if (currentLesson.type === "letter") {
        progress.step = Math.max(Number(progress.step || 0), 5);
      }

      saveLearningProgress();
      updateLessonTabs();
      updateGameUi();
    }catch(error){
      console.error("Sauvegarde exercice 1 :", error);
    }
  }

  function safelySaveExerciseTwoV4(score){
    try{
      const progress = getProgress("letter", currentLesson.key);

      if (typeof grantUniqueExerciseStars === "function") {
        grantUniqueExerciseStars(
          "letter",
          currentLesson.key,
          "exercise2",
          score
        );
      }

      progress.exercise2Done = true;
      progress.exercise2Stars = Math.max(
        Number(progress.exercise2Stars || 0),
        Number(score || 0)
      );
      progress.completed = true;
      progress.step = getGuidedSteps("letter").length;

      const currentIndex = activeLetters.indexOf(currentLesson.key);
      const nextLetter = activeLetters[currentIndex + 1];

      if (nextLetter) {
        getProgress("letter", nextLetter).unlocked = true;
        gameState.learningProgress.lastUnlocked = `letter-${nextLetter}`;
      }

      saveLearningProgress();
      updateLessonMastery();
      updateLessonTabs();
      updateGameUi();
    }catch(error){
      console.error("Sauvegarde exercice 2 :", error);
    }
  }

  validateGuidedExerciseOne = function(goodAnswer, replay){
    if (exerciseFinishLockV4) return;

    const msg = document.getElementById("exerciseMessage");
    if (!msg) return;

    if (!selectedAnswer) {
      msg.textContent = "Choisis une réponse";
      msg.className = "message bad";
      return;
    }

    if (selectedAnswer !== goodAnswer) {
      guidedExerciseErrors += 1;
      msg.textContent = "Essaie encore";
      msg.className = "message bad";

      try{
        rememberMistake({
          kind: "word",
          lessonType: currentLesson.type,
          lessonKey: currentLesson.key,
          exerciseName: "exercise1",
          answer: goodAnswer,
          audio: goodAnswer
        });
      }catch(error){}

      selectedAnswer = "";
      recordWrongAnswer();
      return;
    }

    exerciseFinishLockV4 = true;

    const validateButton = [...lessonContent.querySelectorAll("button")]
      .find(button => button.textContent.trim().toLowerCase() === "valider");

    if (validateButton) validateButton.disabled = true;

    guidedExerciseCorrect += 1;
    lastExerciseWord = goodAnswer;
    guidedExerciseRoundIndex += 1;

    msg.textContent = "Bravo !";
    msg.className = "message good";

    createConfetti();
    rewardPlayer(7, 0, 2, null);

    if (guidedExerciseRoundIndex >= guidedExerciseTarget) {
      const score = calculateExerciseStars(guidedExerciseErrors);

      // L’écran final est affiché en premier : aucune erreur de sauvegarde
      // ne peut désormais empêcher son apparition.
      setTimeout(() => {
        finishScreenV4("exercise1", score);
        safelySaveExerciseOneV4(score);
      }, 450);

      return;
    }

    setTimeout(() => {
      exerciseFinishLockV4 = false;
      showListenAndChooseExerciseRound(replay);
    }, 550);
  };

  validateGuidedMatch = function(replay){
    if (exerciseFinishLockV4) return;

    const msg = document.getElementById("matchMessage");
    if (!msg) return;

    if (!selectedSound || !selectedSyllable) {
      msg.textContent = "Choisis les deux";
      msg.className = "message bad";
      return;
    }

    if (selectedSound !== selectedSyllable) {
      guidedExerciseErrors += 1;
      msg.textContent = "Essaie encore";
      msg.className = "message bad";

      try{
        const audioItem = currentLesson.syllables.find(
          item => item.syllable === selectedSound
        );

        window.rememberMistake?.({
          kind: "match",
          lessonType: "letter",
          lessonKey: currentLesson.key,
          exerciseName: "exercise2",
          answer: selectedSound,
          audio: audioItem?.audio || selectedSound
        });
      }catch(error){}

      selectedSound = "";
      selectedSyllable = "";
      recordWrongAnswer();
      return;
    }

    exerciseFinishLockV4 = true;

    const validateButton = [...lessonContent.querySelectorAll("button")]
      .find(button => button.textContent.trim().toLowerCase() === "valider");

    if (validateButton) validateButton.disabled = true;

    msg.textContent = "Bravo !";
    msg.className = "message good";

    rewardPlayer(5, 0, 2, null);

    remainingMatchItems = remainingMatchItems.filter(
      item => item.syllable !== selectedSound
    );

    selectedSound = "";
    selectedSyllable = "";

    if (remainingMatchItems.length === 0) {
      const score = calculateExerciseStars(guidedExerciseErrors);

      setTimeout(() => {
        finishScreenV4("exercise2", score);
        safelySaveExerciseTwoV4(score);
        createConfetti();
      }, 450);

      return;
    }

    setTimeout(() => {
      exerciseFinishLockV4 = false;
      renderMatchExerciseGuided(replay);
    }, 550);
  };

  const startExerciseOneBeforeV4 = startGuidedExerciseOne;
  startGuidedExerciseOne = function(replay = false){
    exerciseFinishLockV4 = false;
    return startExerciseOneBeforeV4(replay);
  };

  const startExerciseTwoBeforeV4 = showMatchExercise;
  showMatchExercise = function(replay = false){
    exerciseFinishLockV4 = false;
    return startExerciseTwoBeforeV4(replay);
  };
})();


/* =========================================================
   OUTILS ADMINISTRATEUR TEMPORAIRES
   CODE : 0607
   À SUPPRIMER OU DÉSACTIVER AVANT LA SORTIE PUBLIQUE
========================================================= */
(function(){
  const TEMP_ADMIN_CODE = "0607";
  const ADMIN_ACCESS_KEY = "lumikids-temp-admin-access";
  let adminEnteredCode = "";

  function adminHasAccess(){
    return localStorage.getItem(ADMIN_ACCESS_KEY) === "granted";
  }

  function updateAdminToolsUi(){
    const locked = document.getElementById("adminLockedActions");
    const unlocked = document.getElementById("adminUnlockedActions");
    const status = document.getElementById("adminToolsStatus");
    const badge = document.getElementById("adminLockBadge");

    if (!locked || !unlocked || !status || !badge) return;

    if (adminHasAccess()) {
      locked.classList.add("hidden");
      unlocked.classList.remove("hidden");
      status.textContent = "Accès administrateur actif sur cet appareil.";
      badge.textContent = "🔓";
    } else {
      locked.classList.remove("hidden");
      unlocked.classList.add("hidden");
      status.textContent = "Accès verrouillé — code requis.";
      badge.textContent = "🔒";
    }
  }

  function updateAdminCodeDots(){
    const dots = document.querySelectorAll("#adminCodeDots span");
    dots.forEach((dot, index) => {
      dot.classList.toggle("filled", index < adminEnteredCode.length);
    });
  }

  function setAdminCodeMessage(message, type = ""){
    const box = document.getElementById("adminCodeMessage");
    if (!box) return;
    box.textContent = message;
    box.className = "admin-code-message" + (type ? " " + type : "");
  }

  window.openAdminCodeModal = function(){
    adminEnteredCode = "";
    updateAdminCodeDots();
    setAdminCodeMessage("");

    const modal = document.getElementById("adminCodeModal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  };

  window.closeAdminCodeModal = function(){
    const modal = document.getElementById("adminCodeModal");
    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    adminEnteredCode = "";
    updateAdminCodeDots();
  };

  window.adminTypeDigit = function(digit){
    if (adminEnteredCode.length >= 4) return;
    adminEnteredCode += String(digit);
    updateAdminCodeDots();
    setAdminCodeMessage("");

    if (adminEnteredCode.length === 4) {
      setTimeout(adminValidateCode, 120);
    }
  };

  window.adminClearCode = function(){
    adminEnteredCode = "";
    updateAdminCodeDots();
    setAdminCodeMessage("");
  };

  window.adminValidateCode = function(){
    if (adminEnteredCode === TEMP_ADMIN_CODE) {
      localStorage.setItem(ADMIN_ACCESS_KEY, "granted");
      setAdminCodeMessage("Accès accepté !", "accepted");
      updateAdminToolsUi();

      setTimeout(() => {
        closeAdminCodeModal();
        showToast("Outils administrateur déverrouillés.");
      }, 550);
      return;
    }

    setAdminCodeMessage("Accès refusé.", "denied");
    adminEnteredCode = "";
    updateAdminCodeDots();
  };

  window.adminRevokeAccess = function(){
    localStorage.removeItem(ADMIN_ACCESS_KEY);
    updateAdminToolsUi();
    showToast("Droits administrateur retirés.");
  };

  function requireAdminAccess(){
    if (adminHasAccess()) return true;
    openAdminCodeModal();
    return false;
  }

  function getAdminCurrentChapterNumber(){
    if (
      typeof currentLetterChapter === "number" &&
      letterChapters[currentLetterChapter]
    ) {
      return currentLetterChapter;
    }

    for (const [number, chapter] of Object.entries(letterChapters)) {
      const unfinished = chapter.letters.some(
        letter => !isLessonCompleted("letter", letter)
      );
      if (unfinished) return Number(number);
    }

    return 5;
  }

  function adminGrantExerciseStars(type, key, exerciseName, target = 3){
    const progress = getProgress(type, key);
    if (!progress.exerciseRewards) progress.exerciseRewards = {};

    const oldValue = Number(
      progress.exerciseRewards[exerciseName] ??
      progress[exerciseName + "Stars"] ??
      0
    );

    const newValue = Math.max(oldValue, target);
    const gained = Math.max(0, newValue - oldValue);

    progress.exerciseRewards[exerciseName] = newValue;
    progress[exerciseName + "Stars"] = newValue;

    gameState.stars = Number(gameState.stars || 0) + gained;
    return gained;
  }

  function adminCompleteLetter(letter){
    const progress = getProgress("letter", letter);

    adminGrantExerciseStars("letter", letter, "exercise1", 3);
    adminGrantExerciseStars("letter", letter, "exercise2", 3);

    progress.unlocked = true;
    progress.completed = true;
    progress.exercise1Done = true;
    progress.exercise2Done = true;
    progress.exercise1Stars = 3;
    progress.exercise2Stars = 3;
    progress.step = getGuidedSteps("letter").length;

    gameState.lessonScores[letter] = Math.max(
      Number(gameState.lessonScores[letter] || 0),
      5
    );
  }

  function adminUnlockFirstLetterOfNextChapter(chapterNumber){
    const nextChapter = letterChapters[chapterNumber + 1];
    if (!nextChapter || !nextChapter.letters.length) return;

    const firstLetter = nextChapter.letters[0];
    getProgress("letter", firstLetter).unlocked = true;
    gameState.learningProgress.lastUnlocked = `letter-${firstLetter}`;
  }

  function adminSaveAndRefresh(message){
    saveLearningProgress();
    saveGameState();
    updateGameUi();

    if (
      typeof renderWorldMap === "function" &&
      typeof worldMapScreen !== "undefined" &&
      worldMapScreen &&
      !worldMapScreen.classList.contains("hidden")
    ) {
      renderWorldMap();
    }

    if (
      typeof lettersHome !== "undefined" &&
      lettersHome &&
      !lettersHome.classList.contains("hidden")
    ) {
      renderLettersGrid();
    }

    showToast(message);
    createConfetti();
  }

  window.adminCompleteCurrentWorld = function(){
    if (!requireAdminAccess()) return;

    const chapterNumber = getAdminCurrentChapterNumber();
    const chapter = letterChapters[chapterNumber];
    if (!chapter) return;

    chapter.letters.forEach(adminCompleteLetter);
    adminUnlockFirstLetterOfNextChapter(chapterNumber);

    adminSaveAndRefresh(
      `Royaume ${chapterNumber} validé. Tu peux maintenant tester la suite.`
    );
  };

  window.adminCompleteAllWorlds = function(){
    if (!requireAdminAccess()) return;

    Object.values(letterChapters).forEach(chapter => {
      chapter.letters.forEach(adminCompleteLetter);
    });

    // Le premier son est également débloqué, comme après une progression normale.
    if (typeof soundKeys !== "undefined" && soundKeys.length) {
      const firstSoundProgress = getProgress("sound", soundKeys[0]);
      if (firstSoundProgress) firstSoundProgress.unlocked = true;
    }

    gameState.learningProgress.lastUnlocked = "letter-Z";

    adminSaveAndRefresh(
      "Tous les royaumes et toutes les lettres ont été validés."
    );
  };

  document.addEventListener("keydown", event => {
    const modal = document.getElementById("adminCodeModal");
    if (!modal || modal.classList.contains("hidden")) return;

    if (/^[0-9]$/.test(event.key)) {
      adminTypeDigit(event.key);
    } else if (event.key === "Backspace") {
      adminEnteredCode = adminEnteredCode.slice(0, -1);
      updateAdminCodeDots();
      setAdminCodeMessage("");
    } else if (event.key === "Escape") {
      closeAdminCodeModal();
    } else if (event.key === "Enter") {
      adminValidateCode();
    }
  });

  const adminModal = document.getElementById("adminCodeModal");
  if (adminModal) {
    adminModal.addEventListener("click", event => {
      if (event.target === adminModal) closeAdminCodeModal();
    });
  }

  updateAdminToolsUi();
})();

/* =========================================================
   LUMIKIDS — GESTIONNAIRE AUDIO V1.5
   Volumes persistants, paramètres, bouton musique corrigé.
========================================================= */
(function initLumiKidsAudio(){
  "use strict";

  const AUDIO_PATHS = Object.freeze({
    music: {
      menu: "audio/musiques/menu.mp3",
      final: "audio/musiques/fin.mp3"
    },
    ambience: {
      clairiere: "audio/ambiance/clairiere/ambiance.mp3",
      vallee: "audio/ambiance/vallee/ambiance.mp3",
      lucioles: "audio/ambiance/lucioles/ambiance.mp3",
      etoiles: "audio/ambiance/etoiles/ambiance.mp3"
    },
    effects: {
      chestOpen: "audio/effets/coffres/ouverture.mp3",
      chestReward: "audio/effets/coffres/recompense.mp3",
      starCollect: "audio/effets/etoiles/collecte.mp3",
      correct: "audio/effets/exercices/bonne_reponse.mp3",
      wrong: "audio/effets/exercices/mauvaise_reponse.mp3",
      exerciseComplete: "audio/effets/exercices/exercice_termine.mp3",
      levelComplete: "audio/effets/exercices/niveau_termine.mp3",
      validate: "audio/effets/exercices/validation.mp3",
      bookClose: "audio/effets/interface/livre_ferme.mp3",
      bookOpen: "audio/effets/interface/livre_ouvre.mp3",
      page: "audio/effets/interface/page.mp3",
      back: "audio/effets/interface/retour.mp3",
      transition: "audio/effets/interface/transition.mp3",
      footsteps: "audio/effets/personnages/pas.mp3",
      bagDrop: "audio/effets/personnages/sac_depose.mp3",
      starsRise: "audio/effets/magie/etoiles_envol.mp3",
      orionCircle: "audio/effets/magie/cercle_orion.mp3",
      lightExplosion: "audio/effets/magie/explosion_lumiere.mp3",
      starsToSky: "audio/effets/magie/etoiles_vers_ciel.mp3",
      skyRestored: "audio/effets/magie/ciel_restaure.mp3",
      calmReturn: "audio/effets/cinematique/retour_calme.mp3"
    }
  });

  const SETTINGS_KEY = "lumikids-audio-settings-v1";
  const defaults = {
    menuVolume: 0.22,
    worldVolume: 0.28,
    effectsVolume: 0.72,
    backgroundMuted: false,
    chapterMuted: {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false
    }
  };

  function loadSettings(){
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return {
        ...defaults,
        ...saved,
        chapterMuted: {
          ...defaults.chapterMuted,
          ...(saved.chapterMuted || {})
        }
      };
    } catch {
      return {
        ...defaults,
        chapterMuted: { ...defaults.chapterMuted }
      };
    }
  }

  const settings = loadSettings();
  const background = new Audio();
  background.loop = true;
  background.preload = "auto";

  let desiredBackground = null;
  let currentCategory = null;
  let currentChapterNumber = null;
  let audioUnlocked = false;
  let backgroundFadeTimer = null;
  const effectCooldowns = new Map();

  function clamp(value){
    return Math.max(0, Math.min(Number(value) || 0, 1));
  }

  function saveSettings(){
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    syncSettingsUI();
    syncChapterMusicButton();
  }

  function categoryVolume(category){
    return (category === "world" || category === "cinematic")
      ? clamp(settings.worldVolume)
      : clamp(settings.menuVolume);
  }

  function isCurrentBackgroundMuted(){
    if (settings.backgroundMuted) return true;

    if (currentCategory === "world" && currentChapterNumber) {
      return Boolean(settings.chapterMuted?.[currentChapterNumber]);
    }

    return false;
  }

  function clearFade(){
    if (backgroundFadeTimer) {
      clearInterval(backgroundFadeTimer);
      backgroundFadeTimer = null;
    }
  }

  function tryPlay(audio){
    const result = audio.play();
    if (result && typeof result.catch === "function") result.catch(() => {});
  }

  function applyBackgroundVolume(){
    background.volume = isCurrentBackgroundMuted() ? 0 : categoryVolume(currentCategory);
  }

  function setBackground(src, category = "menu", loop = true){
    desiredBackground = { src, category, loop: Boolean(loop) };
    currentCategory = category;
    clearFade();

    if (background.src && background.src.endsWith(src)) {
      background.loop = Boolean(loop);
      applyBackgroundVolume();
      if (!isCurrentBackgroundMuted() && (audioUnlocked || !background.paused)) tryPlay(background);
      return;
    }

    background.pause();
    background.currentTime = 0;
    background.src = src;
    background.loop = Boolean(loop);
    applyBackgroundVolume();
    background.load();

    if (audioUnlocked && !isCurrentBackgroundMuted()) tryPlay(background);
  }

  function stopBackground(immediate = false){
    desiredBackground = null;
    currentCategory = null;
    currentChapterNumber = null;
    clearFade();

    if (immediate || background.paused) {
      background.pause();
      background.currentTime = 0;
      return;
    }

    const startVolume = background.volume;
    let step = 0;
    backgroundFadeTimer = setInterval(() => {
      step += 1;
      background.volume = Math.max(0, startVolume * (1 - step / 6));
      if (step >= 6) {
        clearFade();
        background.pause();
        background.currentTime = 0;
        background.volume = startVolume;
      }
    }, 35);
  }

  function playEffect(src, options = {}){
    if (!src || clamp(settings.effectsVolume) === 0) return null;

    const cooldown = Math.max(0, Number(options.cooldown) || 0);
    const now = Date.now();
    const previous = effectCooldowns.get(src) || 0;
    if (cooldown && now - previous < cooldown) return;
    effectCooldowns.set(src, now);

    const effect = new Audio(src);
    effect.preload = "auto";
    const localVolume = options.volume == null ? 1 : clamp(options.volume);
    effect.volume = clamp(settings.effectsVolume) * localVolume;
    effect.playbackRate = Math.max(0.5, Math.min(Number(options.rate) || 1, 2));
    tryPlay(effect);
    return effect;
  }

  function playMenu(){
    currentChapterNumber = null;
    setBackground(AUDIO_PATHS.music.menu, "menu", true);
  }

  function playChapter(chapterNumber){
    currentChapterNumber = Number(chapterNumber) || 1;

    const chapterAmbience = {
      1: AUDIO_PATHS.ambience.clairiere,
      2: AUDIO_PATHS.ambience.clairiere,
      3: AUDIO_PATHS.ambience.vallee,
      4: AUDIO_PATHS.ambience.lucioles,
      5: AUDIO_PATHS.ambience.etoiles
    }[currentChapterNumber];

    if (chapterAmbience) {
      setBackground(chapterAmbience, "world", true);
    } else {
      stopBackground();
      currentChapterNumber = Number(chapterNumber) || 1;
    }

    syncChapterMusicButton();
  }

  function playFinalMusic(){
    currentChapterNumber = null;
    setBackground(AUDIO_PATHS.music.final, "cinematic", false);
  }

  function stopFinalMusic(){
    if (currentCategory === "cinematic") stopBackground(true);
  }

  function setVolume(type, value){
    const normalized = clamp(Number(value) / 100);
    if (type === "menu") settings.menuVolume = normalized;
    if (type === "world") settings.worldVolume = normalized;
    if (type === "effects") settings.effectsVolume = normalized;
    applyBackgroundVolume();
    saveSettings();
  }

  function setBackgroundMuted(muted){
    settings.backgroundMuted = Boolean(muted);
    applyBackgroundVolume();

    if (isCurrentBackgroundMuted()) {
      background.pause();
    } else if (desiredBackground) {
      audioUnlocked = true;
      tryPlay(background);
    }

    saveSettings();
    showToast(settings.backgroundMuted ? "Toutes les musiques de fond sont coupées" : "Toutes les musiques de fond sont activées");
  }

  function setChapterMuted(chapterNumber, muted){
    const chapter = Number(chapterNumber) || 1;
    settings.chapterMuted[chapter] = Boolean(muted);

    if (currentCategory === "world" && currentChapterNumber === chapter) {
      applyBackgroundVolume();

      if (settings.chapterMuted[chapter] || settings.backgroundMuted) {
        background.pause();
      } else if (desiredBackground) {
        audioUnlocked = true;
        tryPlay(background);
      }
    }

    saveSettings();
    syncChapterMusicButton();

    showToast(
      settings.chapterMuted[chapter]
        ? "Ambiance de ce royaume coupée"
        : "Ambiance de ce royaume activée"
    );
  }

  function toggleCurrentChapterMuted(){
    const chapter = Number(currentChapterNumber || window.currentLetterChapter || 1);
    const nextValue = !Boolean(settings.chapterMuted?.[chapter]);
    setChapterMuted(chapter, nextValue);
    return nextValue;
  }

  function toggleBackgroundMuted(){
    setBackgroundMuted(!settings.backgroundMuted);
    return settings.backgroundMuted;
  }

  function unlockAudio(){
    audioUnlocked = true;
    if (desiredBackground && !isCurrentBackgroundMuted()) {
      setBackground(
        desiredBackground.src,
        desiredBackground.category,
        desiredBackground.loop
      );
    }
  }

  function percent(value){
    return Math.round(clamp(value) * 100);
  }

  function syncSettingsUI(){
    const menuSlider = document.getElementById("menuVolumeSlider");
    const worldSlider = document.getElementById("worldVolumeSlider");
    const effectsSlider = document.getElementById("effectsVolumeSlider");

    if (menuSlider) menuSlider.value = percent(settings.menuVolume);
    if (worldSlider) worldSlider.value = percent(settings.worldVolume);
    if (effectsSlider) effectsSlider.value = percent(settings.effectsVolume);

    const menuValue = document.getElementById("menuVolumeValue");
    const worldValue = document.getElementById("worldVolumeValue");
    const effectsValue = document.getElementById("effectsVolumeValue");

    if (menuValue) menuValue.textContent = percent(settings.menuVolume) + " %";
    if (worldValue) worldValue.textContent = percent(settings.worldVolume) + " %";
    if (effectsValue) effectsValue.textContent = percent(settings.effectsVolume) + " %";

    const toggle = document.getElementById("globalMusicToggle");
    if (toggle) {
      toggle.classList.toggle("is-muted", settings.backgroundMuted);
      toggle.textContent = settings.backgroundMuted
        ? "Réactiver toutes les musiques de fond"
        : "Couper toutes les musiques de fond";
    }
  }

  function syncChapterMusicButton(){
    const button = document.getElementById("chapterMusicBtn");
    if (!button) return;

    const chapter = Number(currentChapterNumber || window.currentLetterChapter || 1);
    const chapterIsMuted = Boolean(settings.chapterMuted?.[chapter]);
    const visuallyMuted = settings.backgroundMuted || chapterIsMuted;

    button.classList.toggle("muted", visuallyMuted);
    button.setAttribute(
      "aria-label",
      chapterIsMuted
        ? "Réactiver l’ambiance de ce royaume"
        : "Couper l’ambiance de ce royaume"
    );
    button.setAttribute(
      "title",
      chapterIsMuted
        ? "Réactiver l’ambiance de ce royaume"
        : "Couper l’ambiance de ce royaume"
    );
  }

  ["pointerdown", "touchstart", "keydown"].forEach(eventName => {
    document.addEventListener(eventName, unlockAudio, { once: true, passive: true });
  });

  /* Safari iPhone peut continuer à jouer le son lorsque l'utilisateur change
     d'onglet ou quitte le navigateur. On suspend donc explicitement la musique,
     puis on la reprend seulement lorsque la page redevient réellement visible. */
  let backgroundSuspendedByPage = false;

  function suspendBackgroundForPage(){
    if (!background.paused && desiredBackground) {
      backgroundSuspendedByPage = true;
      background.pause();
    }
  }

  function resumeBackgroundForPage(){
    if (
      backgroundSuspendedByPage &&
      desiredBackground &&
      !isCurrentBackgroundMuted() &&
      document.visibilityState === "visible"
    ) {
      backgroundSuspendedByPage = false;
      audioUnlocked = true;
      applyBackgroundVolume();
      tryPlay(background);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") suspendBackgroundForPage();
    else resumeBackgroundForPage();
  });

  window.addEventListener("pagehide", suspendBackgroundForPage);
  window.addEventListener("blur", suspendBackgroundForPage);
  window.addEventListener("pageshow", resumeBackgroundForPage);
  window.addEventListener("focus", resumeBackgroundForPage);

  window.LumiAudio = {
    paths: AUDIO_PATHS,
    settings,
    playMenu,
    playChapter,
    playFinalMusic,
    stopFinalMusic,
    stopBackground,
    playEffect,
    setVolume,
    setBackgroundMuted,
    toggleBackgroundMuted,
    setChapterMuted,
    toggleCurrentChapterMuted,
    syncSettingsUI,
    syncChapterMusicButton,
    playCorrect: () => playEffect(AUDIO_PATHS.effects.correct, { cooldown: 120 }),
    playWrong: () => playEffect(AUDIO_PATHS.effects.wrong, { cooldown: 120 }),
    playValidation: () => playEffect(AUDIO_PATHS.effects.validate, { volume: 0.67, cooldown: 80 }),
    playExerciseComplete: () => playEffect(AUDIO_PATHS.effects.exerciseComplete, { cooldown: 500 }),
    playLevelComplete: () => playEffect(AUDIO_PATHS.effects.levelComplete, { cooldown: 700 }),
    playStarCollect: () => playEffect(AUDIO_PATHS.effects.starCollect, { cooldown: 120 }),
    playChestOpen: () => playEffect(AUDIO_PATHS.effects.chestOpen, { cooldown: 500 }),
    playChestReward: () => playEffect(AUDIO_PATHS.effects.chestReward, { cooldown: 500 }),
    playBookOpen: () => playEffect(AUDIO_PATHS.effects.bookOpen, { cooldown: 350 }),
    playBookClose: () => playEffect(AUDIO_PATHS.effects.bookClose, { cooldown: 350 }),
    playPage: () => playEffect(AUDIO_PATHS.effects.page, { cooldown: 180 }),
    playBack: () => playEffect(AUDIO_PATHS.effects.back, { volume: 0.62, cooldown: 100 }),
    playTransition: () => playEffect(AUDIO_PATHS.effects.transition, { cooldown: 450 }),
    playFootsteps: () => playEffect(AUDIO_PATHS.effects.footsteps, { volume: 0.78, cooldown: 900 }),
    playBagDrop: () => playEffect(AUDIO_PATHS.effects.bagDrop, { volume: 0.85, cooldown: 700 }),
    playStarsRise: () => playEffect(AUDIO_PATHS.effects.starsRise, { cooldown: 900 }),
    playOrionCircle: () => playEffect(AUDIO_PATHS.effects.orionCircle, { cooldown: 900 }),
    playLightExplosion: () => playEffect(AUDIO_PATHS.effects.lightExplosion, { volume: 0.92, cooldown: 900 }),
    playStarsToSky: () => playEffect(AUDIO_PATHS.effects.starsToSky, { cooldown: 900 }),
    playSkyRestored: () => playEffect(AUDIO_PATHS.effects.skyRestored, { cooldown: 900 }),
    playCalmReturn: () => playEffect(AUDIO_PATHS.effects.calmReturn, { volume: 0.82, cooldown: 900 })
  };

  window.openSettingsPanel = function(){
    syncSettingsUI();
    document.getElementById("settingsPanel")?.classList.remove("hidden");
  };

  window.closeSettingsPanel = function(){
    document.getElementById("settingsPanel")?.classList.add("hidden");
  };

  window.changeLumiVolume = function(type, value){
    setVolume(type, value);
  };

  window.toggleAllBackgroundMusic = function(){
    toggleBackgroundMuted();
  };

  window.openAccountPanel = function(){
    const panel = document.getElementById("accountPanel");
    const input = document.getElementById("accountNameInput");
    if (input) input.value = gameState.childName || "Champion";
    setText("accountLevelValue", gameState.level || 1);
    setText("accountStarsValue", gameState.stars || 0);
    setText("accountCoinsValue", gameState.coins || 0);
    panel?.classList.remove("hidden");
  };

  window.closeAccountPanel = function(){
    document.getElementById("accountPanel")?.classList.add("hidden");
  };

  window.saveAccountName = function(){
    const input = document.getElementById("accountNameInput");
    const value = (input?.value || "").trim().slice(0, 18);
    gameState.childName = value || "Champion";
    saveGame();
    updateAllUI();
    showToast("Pseudo enregistré");
    closeAccountPanel();
  };

  // Clic sur l'arrière-plan pour fermer les fenêtres.
  ["settingsPanel", "accountPanel"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", event => {
      if (event.target.id === id) event.currentTarget.classList.add("hidden");
    });
  });

  function wrap(name, before, after){
    const original = window[name];
    if (typeof original !== "function" || original.__lumiAudioWrapped) return;
    const wrapped = function(...args){
      if (typeof before === "function") {
        try { before.apply(this, args); } catch (error) { console.warn("Audio before:", name, error); }
      }
      const result = original.apply(this, args);
      if (typeof after === "function") {
        try { after.apply(this, args); } catch (error) { console.warn("Audio after:", name, error); }
      }
      return result;
    };
    wrapped.__lumiAudioWrapped = true;
    window[name] = wrapped;
  }

  ["showHome", "showReadingHome", "showRewards", "showParentDashboard", "showWorldMap"]
    .forEach(name => wrap(name, null, playMenu));

  wrap("showLettersHome", null, () => playChapter(window.currentLetterChapter || 1));
  wrap("showLetterChapter", null, chapterNumber => playChapter(chapterNumber));
  wrap("enterChapterWithStory", () => stopBackground());
  wrap("showSoundsHome", () => stopBackground());
  wrap("openLesson", () => stopBackground(true));
  wrap("continueLearning", () => stopBackground());

  wrap("backToLessonList", null, () => {
    if (window.currentLessonType === "sound") stopBackground();
    else playChapter(window.currentLetterChapter || 1);
  });

  wrap("rewardPlayer", null, (xp, stars) => {
    if (Number(stars) > 0) setTimeout(() => window.LumiAudio.playStarCollect(), 170);
  });

  wrap("openChapterChest", () => window.LumiAudio.playChestOpen(), () => {
    setTimeout(() => window.LumiAudio.playChestReward(), 260);
  });

  wrap("openSecondChapterChest", () => window.LumiAudio.playChestOpen(), () => {
    setTimeout(() => window.LumiAudio.playChestReward(), 260);
  });

  wrap("claimDailyChallenge", null, () => window.LumiAudio.playChestReward());

  wrap("checkAnswer", () => window.LumiAudio.playValidation(), () => {
    const message = document.getElementById("message");
    if (message?.classList.contains("good")) window.LumiAudio.playCorrect();
    else if (message?.classList.contains("bad")) window.LumiAudio.playWrong();
  });

  wrap("validateGuidedExerciseOne", () => window.LumiAudio.playValidation(), goodAnswer => {
    if (typeof selectedAnswer !== "undefined" && selectedAnswer === goodAnswer) window.LumiAudio.playCorrect();
    else window.LumiAudio.playWrong();
  });

  // Exercice 2 : on doit lire le résultat AVANT l'appel original.
  // La validation remet ensuite selectedSound et selectedSyllable à vide,
  // ce qui faisait auparavant jouer mauvaise_reponse même après une réussite.
  (function wrapGuidedMatchAudio(){
    const original = window.validateGuidedMatch;
    if (typeof original !== "function" || original.__lumiAudioWrapped) return;

    const wrapped = function(...args){
      const hadBothChoices = Boolean(
        typeof selectedSound !== "undefined" &&
        typeof selectedSyllable !== "undefined" &&
        selectedSound &&
        selectedSyllable
      );
      const wasCorrect = hadBothChoices && selectedSound === selectedSyllable;

      window.LumiAudio.playValidation();
      const result = original.apply(this, args);

      if (hadBothChoices) {
        if (wasCorrect) window.LumiAudio.playCorrect();
        else window.LumiAudio.playWrong();
      }

      return result;
    };

    wrapped.__lumiAudioWrapped = true;
    window.validateGuidedMatch = wrapped;
  })();

  wrap("validateMistakeAnswer", () => window.LumiAudio.playValidation(), () => {
    const message = document.getElementById("mistakeMessage");
    const corrected = document.querySelector(".mistake-corrected");
    if (corrected) window.LumiAudio.playCorrect();
    else if (message?.classList.contains("bad")) window.LumiAudio.playWrong();
  });

  wrap("finishGuidedExerciseOne", null, () => window.LumiAudio.playExerciseComplete());
  wrap("showExerciseReplayResult", null, () => window.LumiAudio.playExerciseComplete());
  wrap("completeCurrentLesson", null, () => window.LumiAudio.playLevelComplete());

  wrap("openStoryBookSequence", () => {
    stopBackground(true);
    window.LumiAudio.playTransition();
    setTimeout(() => window.LumiAudio.playBookOpen(), 1850);
  });

  wrap("openUnlockedStoryBook", () => {
    stopBackground(true);
    window.LumiAudio.playBookOpen();
  });

  wrap("openUnlockedStoryBookPages", () => {
    stopBackground(true);
    window.LumiAudio.playBookOpen();
  });

  wrap("closeStoryBook", () => window.LumiAudio.playBookClose());

  [
    "changeStoryPage",
    "showPreviousStoryBookPage",
    "showNextStoryBookPage",
    "previousStoryBookPage",
    "nextStoryBookPage",
    "goToPreviousStoryPage",
    "goToNextStoryPage"
  ].forEach(name => wrap(name, () => window.LumiAudio.playPage()));

  /* ---------------------------------------------------------
     AUDIO DE LA CINÉMATIQUE FINALE
     Scène 1 : pas
     Scène 3 : cercle magique
     Scène 6 : sacs + étoiles au moment du don
     Scène 7 : explosion + envol vers le ciel
     Scène 8 : ciel restauré
     Scène 9 : retour au calme
  --------------------------------------------------------- */
  let finalAudioTimers = [];
  let activeFinalFootsteps = null;

  function stopFinalFootsteps(){
    if (!activeFinalFootsteps) return;

    try {
      activeFinalFootsteps.pause();
      activeFinalFootsteps.currentTime = 0;
    } catch {}

    activeFinalFootsteps = null;
  }

  function clearFinalAudioTimers(){
    finalAudioTimers.forEach(clearTimeout);
    finalAudioTimers = [];
    stopFinalFootsteps();
  }

  function scheduleFinalAudio(callback, delay){
    const timer = setTimeout(callback, delay);
    finalAudioTimers.push(timer);
  }

  function playFinalSceneAudio(scene){
    clearFinalAudioTimers();
    const number = Number(scene) || 1;

    if (number === 1) {
      /* Les cinq animations de marche durent jusqu'à 3,8 secondes.
         Le bruit est coupé exactement lorsque le dernier personnage
         cesse de marcher, même si le fichier audio est plus long. */
      scheduleFinalAudio(() => {
        stopFinalFootsteps();
        activeFinalFootsteps = window.LumiAudio.playFootsteps();
      }, 80);

      scheduleFinalAudio(() => {
        stopFinalFootsteps();
      }, 3800);
    }

    if (number === 3) {
      scheduleFinalAudio(() => window.LumiAudio.playOrionCircle(), 220);
    }

    if (number === 7) {
      scheduleFinalAudio(() => window.LumiAudio.playLightExplosion(), 180);
      scheduleFinalAudio(() => window.LumiAudio.playStarsToSky(), 620);
    }

    if (number === 8) {
      scheduleFinalAudio(() => window.LumiAudio.playSkyRestored(), 260);
    }

    if (number === 9) {
      scheduleFinalAudio(() => window.LumiAudio.playCalmReturn(), 250);
    }
  }

  wrap(
    "startFinalCinematic",
    () => {
      /* Coupe immédiatement l'ambiance du Royaume des Étoiles avant
         d'afficher la première image de la cinématique. */
      clearFinalAudioTimers();
      stopBackground(true);
    },
    () => {
      /* La musique fin.mp3 est la seule musique de fond de la cinématique. */
      playFinalMusic();
    }
  );

  wrap("renderFinalScene", null, scene => playFinalSceneAudio(scene));

  wrap("donateStarsToOrion", () => {
    const amount = Math.max(0, Number(gameState.stars) || 0);
    if (!amount || finalDonationInProgress) return;

    window.LumiAudio.playBagDrop();
    scheduleFinalAudio(() => window.LumiAudio.playStarsRise(), 320);
  });

  wrap("closeFinalCinematic", () => {
    clearFinalAudioTimers();
    stopFinalMusic();
  });

  wrap("finishFinalCinematic", () => {
    clearFinalAudioTimers();
    stopFinalMusic();
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const text = (button.textContent || "").trim().toLowerCase();
    const onclick = button.getAttribute("onclick") || "";
    const isBackButton =
      button.classList.contains("back-btn") ||
      text.startsWith("←") ||
      /\b(back|retour|showhome|showreadinghome|backto)\b/i.test(onclick);
    if (isBackButton) window.LumiAudio.playBack();
  });

  // Le bouton présent dans un royaume ne coupe que l’ambiance de ce royaume.
  // La coupure générale reste disponible dans la fenêtre Paramètres.
  window.toggleChapterMusic = function(){
    toggleCurrentChapterMuted();
  };

  document.addEventListener("DOMContentLoaded", () => {
    syncSettingsUI();
    syncChapterMusicButton();
  });

  playMenu();
})();


/* =========================================================
   LUMIKIDS — MISE À JOUR EXERCICES V9
   - 3e exercice dans l'histoire : lettre manquante avec audio
   - barème 2 / 1 / 0 étoile
   - parcours Exercices : 26 lettres + sons composés
========================================================= */
(function installReadingExercisesV9(){
  "use strict";

  const HISTORY_MAX_STARS_V9 = 2;
  const FULL_ALPHABET_V9 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const PRACTICE_TYPES_V9 = [
    { id:"hear", icon:"👂", title:"J’entends ou je n’entends pas", text:"Écoute un mot et indique si le son est présent." },
    { id:"intruder", icon:"🔎", title:"Trouve l’intrus", text:"Repère le mot qui ne contient pas la lettre ou le son." },
    { id:"position", icon:"📍", title:"Où entends-tu le son ?", text:"Au début, au milieu ou à la fin du mot." },
    { id:"orderSyllables", icon:"🧩", title:"Remets les syllabes dans l’ordre", text:"Reconstruis le mot avec ses syllabes." },
    { id:"missingSyllable", icon:"✏️", title:"Retrouve la syllabe manquante", text:"Choisis la partie qui complète correctement le mot." },
    { id:"buildWord", icon:"🔊", title:"Construis le mot entendu", text:"Écoute puis sélectionne les syllabes dans le bon ordre." },
    { id:"spelling", icon:"✅", title:"Choisis la bonne écriture", text:"Écoute et retrouve le mot correctement écrit." },
    { id:"dictation", icon:"⌨️", title:"Écris le mot entendu", text:"Une petite dictée avec le clavier." },
    { id:"orderSentence", icon:"🔀", title:"Remets la phrase dans l’ordre", text:"Replace tous les mots pour reformer la phrase." },
    { id:"missingWord", icon:"💬", title:"Retrouve le mot manquant", text:"Complète une phrase avec le bon mot." },
    { id:"chooseSentence", icon:"📖", title:"Choisis la bonne phrase", text:"Écoute puis sélectionne la phrase entendue." }
  ];

  /* ---------------------------------------------------------
     DONNÉES DES SIX LETTRES ABSENTES DE L'HISTOIRE
     Elles existent uniquement dans le parcours d'entraînement.
  --------------------------------------------------------- */
  const supplementalLetterLessonsV9 = {
    G: makeLetterLesson("G", "g", ["ga","ge","gi","go","gu"], [
      makeWord("gare","ga / re"),
      makeWord("gomme","gom / me"),
      makeWord("gâteau","gâ / teau"),
      makeWord("girafe","gi / ra / fe")
    ], [
      "La girafe regarde la gare.",
      "Gaston mange un gâteau."
    ]),
    H: makeLetterLesson("H", "h", ["ha","he","hi","ho","hu"], [
      makeWord("hibou","hi / bou"),
      makeWord("hôtel","hô / tel"),
      makeWord("histoire","his / toi / re"),
      makeWord("herbe","her / be")
    ], [
      "Le hibou écoute une histoire.",
      "Hugo est devant l’hôtel."
    ]),
    K: makeLetterLesson("K", "k", ["ka","ke","ki","ko","ku"], [
      makeWord("kiwi","ki / wi"),
      makeWord("koala","ko / a / la"),
      makeWord("kayak","ka / yak"),
      makeWord("képi","ké / pi")
    ], [
      "Le koala mange un kiwi.",
      "Kimi avance en kayak."
    ]),
    O: makeLetterLesson("O", "o", ["mo","po","lo","so"], [
      makeWord("orange","o / ran / ge"),
      makeWord("moto","mo / to"),
      makeWord("domino","do / mi / no"),
      makeWord("vélo","vé / lo")
    ], [
      "Oscar a une orange.",
      "La moto roule."
    ]),
    X: makeLetterLesson("X", "x", ["xa","xe","xi","xo"], [
      makeWord("xylophone","xy / lo / pho / ne"),
      makeWord("taxi","ta / xi"),
      makeWord("boxe","bo / xe"),
      makeWord("six","six")
    ], [
      "Max joue du xylophone.",
      "Le taxi passe."
    ]),
    Y: makeLetterLesson("Y", "y", ["ya","ye","yi","yo"], [
      makeWord("yaourt","ya / ourt"),
      makeWord("yacht","yacht"),
      makeWord("yoga","yo / ga"),
      makeWord("stylo","sty / lo")
    ], [
      "Yasmine mange un yaourt.",
      "Le yacht avance."
    ])
  };

  Object.entries(supplementalLetterLessonsV9).forEach(([key, lesson]) => {
    if (!letterLessons[key]) letterLessons[key] = lesson;
  });

  /* ---------------------------------------------------------
     MIGRATION DU BARÈME
     Ancien système : 2 exercices x 3 étoiles.
     Nouveau système : 3 exercices x 2 étoiles.
     Les anciennes lettres terminées conservent donc leurs 6 étoiles.
  --------------------------------------------------------- */
  function ensureHistoryEntryV9(letter){
    const progress = getProgress("letter", letter);
    if (!progress.exerciseRewards) progress.exerciseRewards = {};

    if (!Number.isFinite(Number(progress.exerciseRewards.exercise1))) {
      progress.exerciseRewards.exercise1 = Number(progress.exercise1Stars || 0);
    }
    if (!Number.isFinite(Number(progress.exerciseRewards.exercise2))) {
      progress.exerciseRewards.exercise2 = Number(progress.exercise2Stars || 0);
    }
    if (!Number.isFinite(Number(progress.exerciseRewards.exercise3))) {
      progress.exerciseRewards.exercise3 = Number(progress.exercise3Stars || 0);
    }

    if (typeof progress.exercise3Done !== "boolean") {
      progress.exercise3Done = Boolean(progress.completed && progress.exercise3Stars);
    }
    return progress;
  }

  function setHistoryRewardV9(progress, exerciseName, value){
    const safe = Math.max(0, Math.min(HISTORY_MAX_STARS_V9, Number(value || 0)));
    progress.exerciseRewards[exerciseName] = safe;
    progress[exerciseName + "Stars"] = safe;
    progress[exerciseName + "Done"] = safe >= 0 && Boolean(
      progress[exerciseName + "Done"] || safe > 0
    );
    return safe;
  }

  function normalizeHistoryRewardsV9(preserveCompleted = true){
    let excessToRemove = 0;
    activeLetters.forEach(letter => {
      const progress = ensureHistoryEntryV9(letter);
      const old1 = Number(progress.exerciseRewards.exercise1 || 0);
      const old2 = Number(progress.exerciseRewards.exercise2 || 0);
      const old3 = Number(progress.exerciseRewards.exercise3 || 0);

      const new1 = Math.min(2, old1);
      const new2 = Math.min(2, old2);
      let new3 = Math.min(2, old3);

      if (preserveCompleted && progress.completed && new3 < 2) {
        new3 = 2;
        progress.exercise3Done = true;
      } else if (!progress.completed) {
        excessToRemove += Math.max(0, old1 - new1) + Math.max(0, old2 - new2) + Math.max(0, old3 - new3);
      }

      setHistoryRewardV9(progress, "exercise1", new1);
      setHistoryRewardV9(progress, "exercise2", new2);
      setHistoryRewardV9(progress, "exercise3", new3);

      if (progress.completed) {
        progress.exercise1Done = true;
        progress.exercise2Done = true;
        progress.exercise3Done = true;
      }

      if (gameState.uniqueRewards) {
        gameState.uniqueRewards[`lesson:letter:${letter}:exercise1`] = new1;
        gameState.uniqueRewards[`lesson:letter:${letter}:exercise2`] = new2;
        gameState.uniqueRewards[`lesson:letter:${letter}:exercise3`] = new3;
      }
    });

    if (excessToRemove > 0) {
      gameState.stars = Math.max(0, Number(gameState.stars || 0) - excessToRemove);
      if (Number.isFinite(Number(gameState.totalStarsEarned))) {
        gameState.totalStarsEarned = Math.max(0, Number(gameState.totalStarsEarned || 0) - excessToRemove);
      }
    }
  }

  if (!gameState.historyScoringV9Migrated) {
    normalizeHistoryRewardsV9(true);
    gameState.historyScoringV9Migrated = true;
    saveGameState();
  } else {
    normalizeHistoryRewardsV9(true);
  }

  function historyRewardTotalV9(letter, exerciseName){
    const progress = ensureHistoryEntryV9(letter);
    return Math.min(2, Number(progress.exerciseRewards[exerciseName] || 0));
  }

  function grantHistoryStarsV9(letter, exerciseName, desiredTotal){
    const progress = ensureHistoryEntryV9(letter);
    const oldTotal = historyRewardTotalV9(letter, exerciseName);
    const newTotal = Math.min(2, Math.max(oldTotal, Number(desiredTotal || 0)));
    const gained = Math.max(0, newTotal - oldTotal);

    setHistoryRewardV9(progress, exerciseName, newTotal);

    if (!gameState.uniqueRewards) gameState.uniqueRewards = {};
    gameState.uniqueRewards[`lesson:letter:${letter}:${exerciseName}`] = newTotal;

    if (gained > 0) {
      gameState.stars = Number(gameState.stars || 0) + gained;
      if (!Number.isFinite(Number(gameState.totalStarsEarned))) {
        gameState.totalStarsEarned = Number(gameState.stars || 0);
      } else {
        gameState.totalStarsEarned += gained;
      }
    }

    saveGameState();
    updateGameUi();
    return gained;
  }

  /* Nouveau barème demandé : 0 faute = 2, 1 faute = 1, 2+ fautes = 0. */
  calculateExerciseStars = function(errors){
    const count = Math.max(0, Number(errors || 0));
    if (count === 0) return 2;
    if (count === 1) return 1;
    return 0;
  };

  if (!LETTER_GUIDED_STEPS.includes("exercise3")) {
    LETTER_GUIDED_STEPS.push("exercise3");
  }
  if (!SOUND_GUIDED_STEPS.includes("exercise2")) SOUND_GUIDED_STEPS.push("exercise2");
  if (!SOUND_GUIDED_STEPS.includes("exercise3")) SOUND_GUIDED_STEPS.push("exercise3");

  function ensureSoundHistoryEntryV9(sound){
    const progress = getProgress("sound",sound);
    if (!progress.exerciseRewards) progress.exerciseRewards = {};
    ["exercise1","exercise2","exercise3"].forEach(name => {
      if (!Number.isFinite(Number(progress.exerciseRewards[name]))) {
        progress.exerciseRewards[name] = Number(progress[name + "Stars"] || 0);
      }
      progress[name + "Stars"] = Math.min(2,Number(progress.exerciseRewards[name] || 0));
      progress.exerciseRewards[name] = progress[name + "Stars"];
      if (typeof progress[name + "Done"] !== "boolean") {
        progress[name + "Done"] = Boolean(progress[name + "Stars"]);
      }
    });
    return progress;
  }

  if (!gameState.soundScoringV9Migrated) {
    let soundDelta = 0;
    soundKeys.forEach(sound => {
      const raw = getProgress("sound",sound);
      const rawRewards = raw.exerciseRewards || {};
      const oldTotal = ["exercise1","exercise2","exercise3"].reduce((sum,name) => {
        return sum + Number(rawRewards[name] ?? raw[name + "Stars"] ?? 0);
      },0);

      const progress = ensureSoundHistoryEntryV9(sound);
      if (progress.completed) {
        ["exercise1","exercise2","exercise3"].forEach(name => {
          progress.exerciseRewards[name] = 2;
          progress[name + "Stars"] = 2;
          progress[name + "Done"] = true;
        });
        soundDelta += Math.max(0,6 - oldTotal);
      }
    });

    if (soundDelta > 0) {
      const oldStars = Number(gameState.stars || 0);
      const oldTotalEarned = Number.isFinite(Number(gameState.totalStarsEarned))
        ? Number(gameState.totalStarsEarned)
        : oldStars;
      gameState.stars = oldStars + soundDelta;
      gameState.totalStarsEarned = oldTotalEarned + soundDelta;
    }
    gameState.soundScoringV9Migrated = true;
    saveGameState();
  }

  function soundRewardTotalV9(sound,exerciseName){
    const progress = ensureSoundHistoryEntryV9(sound);
    return Math.min(2,Number(progress.exerciseRewards[exerciseName] || 0));
  }

  function grantSoundHistoryStarsV9(sound,exerciseName,desiredTotal){
    const progress = ensureSoundHistoryEntryV9(sound);
    const oldTotal = soundRewardTotalV9(sound,exerciseName);
    const newTotal = Math.min(2,Math.max(oldTotal,Number(desiredTotal || 0)));
    const gained = Math.max(0,newTotal - oldTotal);

    progress.exerciseRewards[exerciseName] = newTotal;
    progress[exerciseName + "Stars"] = newTotal;
    progress[exerciseName + "Done"] = true;

    if (!gameState.uniqueRewards) gameState.uniqueRewards = {};
    gameState.uniqueRewards[`lesson:sound:${sound}:${exerciseName}`] = newTotal;

    if (gained > 0) {
      const oldStars = Number(gameState.stars || 0);
      gameState.stars = oldStars + gained;
      gameState.totalStarsEarned = Number.isFinite(Number(gameState.totalStarsEarned))
        ? Number(gameState.totalStarsEarned) + gained
        : oldStars + gained;
    }
    saveGameState();
    updateGameUi();
    return gained;
  }

  function normalizeSoundRewardsV9(){
    let excess = 0;
    soundKeys.forEach(sound => {
      const progress = getProgress("sound",sound);
      if (!progress.exerciseRewards) progress.exerciseRewards = {};
      ["exercise1","exercise2","exercise3"].forEach(name => {
        const raw = Number(progress.exerciseRewards[name] ?? progress[name + "Stars"] ?? 0);
        const safe = Math.min(2,Math.max(0,raw));
        excess += Math.max(0,raw - safe);
        progress.exerciseRewards[name] = safe;
        progress[name + "Stars"] = safe;
      });
    });
    if (excess > 0) {
      gameState.stars = Math.max(0,Number(gameState.stars || 0) - excess);
      if (Number.isFinite(Number(gameState.totalStarsEarned))) {
        gameState.totalStarsEarned = Math.max(0,Number(gameState.totalStarsEarned) - excess);
      }
    }
  }

  const previousGetTotalLessonStarsV9 = getTotalLessonStars;
  getTotalLessonStars = function(type,key){
    if (type === "letter") {
      return ["exercise1","exercise2","exercise3"]
        .reduce((sum,name) => sum + historyRewardTotalV9(key,name),0);
    }
    if (type === "sound") {
      return ["exercise1","exercise2","exercise3"]
        .reduce((sum,name) => sum + soundRewardTotalV9(key,name),0);
    }
    return previousGetTotalLessonStarsV9(type,key);
  };

  updateLessonMastery = function(){
    if (!currentLesson) return;
    const stars = getTotalLessonStars(currentLesson.type,currentLesson.key);
    const max = (currentLesson.type === "letter" || currentLesson.type === "sound") ? 6 : 3;
    setText("lessonMastery", `${stars} / ${max} ★`);
  };

  const previousStepLabelV9 = stepLabel;
  stepLabel = function(part){
    if (part === "exercise3") return "Complète le mot";
    return previousStepLabelV9(part);
  };

  updateLessonTabs = function(){
    if (!currentLesson) return;
    const progress = getProgress(currentLesson.type, currentLesson.key);
    const completed = progress.completed;
    const steps = getGuidedSteps(currentLesson.type);
    const visibleTabs = currentLesson.type === "letter"
      ? [
          ["letters","Sons"],
          ["syllables","Syllabes"],
          ["words","Mots"],
          ["phrases","Phrases"],
          ["exercise1","Exercice 1"],
          ["exercise2","Exercice 2"],
          ["exercise3","Exercice 3"]
        ]
      : [
          ["letters","Son"],
          ["words","Mots"],
          ["phrases","Phrases"],
          ["exercise1","Exercice 1"],
          ["exercise2","Exercice 2"],
          ["exercise3","Exercice 3"]
        ];

    lessonTabs.innerHTML = visibleTabs.map(([part,label]) => {
      const index = steps.indexOf(part);
      const locked = !completed && index > Number(progress.step || 0);
      const done = completed || index < Number(progress.step || 0);
      const defaultPart = steps[Math.min(Number(progress.step || 0), steps.length - 1)];
      const active = part === (currentLessonActivePart || defaultPart);
      return `<button
        class="${locked ? "tab-locked" : ""} ${done ? "tab-done" : ""} ${active ? "tab-active" : ""}"
        ${locked ? "disabled" : ""}
        onclick="showLessonPart('${part}')">${label}</button>`;
    }).join("");
  };

  const previousShowLessonPartV9 = showLessonPart;
  showLessonPart = function(part,force = false){
    if (currentLesson?.type === "sound" && part === "exercise2") {
      const progress = getProgress("sound",currentLesson.key);
      const index = getGuidedSteps("sound").indexOf("exercise2");
      if (!force && !progress.completed && index > Number(progress.step || 0)) {
        showToast("Termine d’abord l’exercice 1.");
        return;
      }
      return showSoundSpellingExerciseV9(false);
    }

    if (part === "exercise3") {
      const progress = getProgress(currentLesson.type,currentLesson.key);
      const index = getGuidedSteps(currentLesson.type).indexOf("exercise3");
      if (!force && !progress.completed && index > Number(progress.step || 0)) {
        showToast("Termine d’abord l’exercice 2.");
        return;
      }
      return showHistoryMissingLetterExerciseV9(false);
    }
    return previousShowLessonPartV9(part,force);
  };

  showExerciseMenu = function(){
    const progress = getProgress(currentLesson.type, currentLesson.key);
    if (!progress.completed) {
      return showLessonPart(currentGuidedPart(currentLesson.type, currentLesson.key), true);
    }

    lessonContent.innerHTML = `
      <div class="lesson-box">
        <p class="subtitle">Cette leçon est terminée. Tu peux rejouer à l’activité de ton choix.</p>
        <button class="section-btn" onclick="startGuidedExerciseOne(true)">Exercice 1 · Écoute et choisis</button>
        ${currentLesson.type === "letter"
          ? `<button class="section-btn" onclick="showMatchExercise(true)">Exercice 2 · Relie son et syllabe</button>`
          : `<button class="section-btn" onclick="showSoundSpellingExerciseV9(true)">Exercice 2 · Choisis la bonne écriture</button>`}
        <button class="section-btn" onclick="showHistoryMissingLetterExerciseV9(true)">Exercice 3 · Complète le mot</button>
      </div>`;
  };

  /* ---------------------------------------------------------
     FINALISATION DES TROIS EXERCICES DE L'HISTOIRE
  --------------------------------------------------------- */
  let historyValidationLockedV9 = false;

  function unlockNextStoryLessonV9(){
    const type = currentLesson.type;
    const list = type === "letter" ? activeLetters : soundKeys;
    const index = list.indexOf(currentLesson.key);
    const next = list[index + 1];

    if (next) {
      getProgress(type,next).unlocked = true;
      gameState.learningProgress.lastUnlocked = `${type}-${next}`;
    } else if (type === "letter" && soundKeys.length) {
      const firstSound = getProgress("sound",soundKeys[0]);
      if (firstSound) firstSound.unlocked = true;
      gameState.learningProgress.lastUnlocked = `sound-${soundKeys[0]}`;
    }
  }

  function renderHistoryResultV9(exerciseName, gained, score){
    const number = exerciseName.replace("exercise","");
    const completed = exerciseName === "exercise3";
    let actions = "";

    if (exerciseName === "exercise1") {
      actions = `
        <button class="btn primary" onclick="startGuidedExerciseOne(true)">Refaire l’exercice 1</button>
        <button class="btn guided-next" onclick="showLessonPart('exercise2',true)">Passer à l’exercice 2 →</button>`;
    } else if (exerciseName === "exercise2") {
      actions = `
        <button class="btn primary" onclick="${currentLesson.type === "letter" ? "showMatchExercise(true)" : "showSoundSpellingExerciseV9(true)"}">Refaire l’exercice 2</button>
        <button class="btn guided-next" onclick="showHistoryMissingLetterExerciseV9(false)">Passer à l’exercice 3 →</button>`;
    } else {
      actions = `
        <button class="btn primary" onclick="showHistoryMissingLetterExerciseV9(true)">Refaire l’exercice 3</button>
        <button class="btn guided-next" onclick="returnToPathAfterCompletion()">Continuer l’aventure →</button>`;
    }

    if (typeof getMistakes === "function" && getMistakes().length) {
      actions += `<button class="btn stop" onclick="showMistakeReview()">Corriger mes erreurs</button>`;
    }

    lessonContent.innerHTML = `
      <div class="completion-panel">
        <div class="completion-badge">★</div>
        <h2>${completed ? `${currentLesson.title} terminée !` : `Exercice ${number} terminé !`}</h2>
        <p>${gained > 0
          ? `Tu as gagné ${gained} nouvelle${gained > 1 ? "s" : ""} étoile${gained > 1 ? "s" : ""}.`
          : "Ton meilleur résultat est déjà enregistré."}</p>
        <span class="history-result-score-v9">Résultat : ${score} / 2 étoiles</span>
        <div class="exercise-finish-actions">${actions}</div>
      </div>`;
  }

  function finishHistoryExerciseV9(exerciseName,score){
    const type = currentLesson.type;
    const progress = type === "letter"
      ? ensureHistoryEntryV9(currentLesson.key)
      : ensureSoundHistoryEntryV9(currentLesson.key);

    const gained = type === "letter"
      ? grantHistoryStarsV9(currentLesson.key,exerciseName,score)
      : grantSoundHistoryStarsV9(currentLesson.key,exerciseName,score);

    progress[exerciseName + "Done"] = true;
    progress[exerciseName + "Stars"] = Math.max(
      Number(progress[exerciseName + "Stars"] || 0),
      Number(score || 0)
    );

    const steps = getGuidedSteps(type);
    if (exerciseName === "exercise1") {
      progress.step = Math.max(Number(progress.step || 0),steps.indexOf("exercise2"));
    } else if (exerciseName === "exercise2") {
      progress.step = Math.max(Number(progress.step || 0),steps.indexOf("exercise3"));
    } else {
      progress.step = steps.length;
      progress.completed = true;
      progress.exercise3Done = true;
      unlockNextStoryLessonV9();
    }

    saveLearningProgress();
    updateLessonTabs();
    updateLessonMastery();
    if (gained > 0) createConfetti();

    if (exerciseName === "exercise3") {
      window.LumiAudio?.playLevelComplete?.();
    } else {
      window.LumiAudio?.playExerciseComplete?.();
    }

    renderHistoryResultV9(exerciseName,gained,score);
  }

  validateGuidedExerciseOne = function(goodAnswer, replay){
    if (historyValidationLockedV9) return;
    const msg = document.getElementById("exerciseMessage");
    if (!msg) return;

    window.LumiAudio?.playValidation?.();

    if (!selectedAnswer) {
      msg.textContent = "Choisis une réponse";
      msg.className = "message bad";
      return;
    }

    if (selectedAnswer !== goodAnswer) {
      guidedExerciseErrors += 1;
      msg.textContent = "Essaie encore";
      msg.className = "message bad";
      window.LumiAudio?.playWrong?.();

      window.rememberMistake?.({
        kind:"word",
        lessonType:currentLesson.type,
        lessonKey:currentLesson.key,
        exerciseName:"exercise1",
        answer:goodAnswer,
        audio:goodAnswer
      });

      selectedAnswer = "";
      document.querySelectorAll(".choice-item").forEach(btn => btn.classList.remove("selected"));
      recordWrongAnswer();
      return;
    }

    historyValidationLockedV9 = true;
    msg.textContent = "Bravo !";
    msg.className = "message good";
    window.LumiAudio?.playCorrect?.();

    guidedExerciseCorrect += 1;
    guidedExerciseRoundIndex += 1;
    rewardPlayer(7,0,2,null);
    createConfetti();

    if (guidedExerciseRoundIndex >= guidedExerciseTarget) {
      const score = calculateExerciseStars(guidedExerciseErrors);
      setTimeout(() => {
        historyValidationLockedV9 = false;
        finishHistoryExerciseV9("exercise1",score);
      },450);
      return;
    }

    setTimeout(() => {
      historyValidationLockedV9 = false;
      showListenAndChooseExerciseRound(replay);
    },550);
  };

  validateGuidedMatch = function(replay){
    if (historyValidationLockedV9) return;
    const msg = document.getElementById("matchMessage");
    if (!msg) return;

    window.LumiAudio?.playValidation?.();

    if (!selectedSound || !selectedSyllable) {
      msg.textContent = "Choisis les deux";
      msg.className = "message bad";
      return;
    }

    if (selectedSound !== selectedSyllable) {
      guidedExerciseErrors += 1;
      msg.textContent = "Essaie encore";
      msg.className = "message bad";
      window.LumiAudio?.playWrong?.();

      const audioItem = currentLesson.syllables.find(
        item => item.syllable === selectedSound
      );

      window.rememberMistake?.({
        kind:"match",
        lessonType:"letter",
        lessonKey:currentLesson.key,
        exerciseName:"exercise2",
        answer:selectedSound,
        audio:audioItem?.audio || selectedSound
      });

      selectedSound = "";
      selectedSyllable = "";
      document.querySelectorAll(".sound-choice,.syllable-choice").forEach(btn => btn.classList.remove("selected"));
      recordWrongAnswer();
      return;
    }

    historyValidationLockedV9 = true;
    msg.textContent = "Bravo !";
    msg.className = "message good";
    window.LumiAudio?.playCorrect?.();
    rewardPlayer(5,0,2,null);

    remainingMatchItems = remainingMatchItems.filter(
      item => item.syllable !== selectedSound
    );

    selectedSound = "";
    selectedSyllable = "";

    if (!remainingMatchItems.length) {
      const score = calculateExerciseStars(guidedExerciseErrors);
      setTimeout(() => {
        historyValidationLockedV9 = false;
        finishHistoryExerciseV9("exercise2",score);
      },450);
      return;
    }

    setTimeout(() => {
      historyValidationLockedV9 = false;
      renderMatchExerciseGuided(replay);
    },550);
  };

  const oldStartGuidedExerciseOneV9 = startGuidedExerciseOne;
  startGuidedExerciseOne = function(replay = false){
    historyValidationLockedV9 = false;
    return oldStartGuidedExerciseOneV9(replay);
  };

  const oldShowMatchExerciseV9 = showMatchExercise;
  showMatchExercise = function(replay = false){
    historyValidationLockedV9 = false;
    return oldShowMatchExerciseV9(replay);
  };

  /* ---------------------------------------------------------
     EXERCICE 2 DES SONS : CHOISIR LA BONNE ÉCRITURE
  --------------------------------------------------------- */
  let soundSpellingQueueV9 = [];
  let soundSpellingIndexV9 = 0;
  let soundSpellingErrorsV9 = 0;
  let soundSpellingSelectedV9 = "";

  function shuffleSoundV9(items){
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
    return copy;
  }

  function wrongSoundSpellingsV9(word,sound){
    const lower = word.toLocaleLowerCase("fr");
    const target = sound.toLocaleLowerCase("fr");
    const index = lower.indexOf(target);
    const alternatives = shuffleSoundV9(soundKeys.filter(item => item !== sound));
    const wrong = [];

    alternatives.forEach(replacement => {
      if (wrong.length >= 2) return;
      let candidate;
      if (index >= 0) {
        candidate = word.slice(0,index) + replacement + word.slice(index + target.length);
      } else {
        candidate = replacement + word.slice(Math.min(1,word.length));
      }
      if (candidate !== word && !wrong.includes(candidate)) wrong.push(candidate);
    });

    while (wrong.length < 2) wrong.push(word + (wrong.length ? "e" : "s"));
    return wrong;
  }

  window.showSoundSpellingExerciseV9 = function(replay = false){
    if (!currentLesson || currentLesson.type !== "sound") return;
    stopAllAudio();
    window.LumiAudio?.stopBackground?.(true);
    historyValidationLockedV9 = false;
    currentLessonActivePart = "exercise2";
    updateLessonTabs();

    const target = currentLesson.key.toLocaleLowerCase("fr");
    let words = currentLesson.words.filter(item =>
      item.word.toLocaleLowerCase("fr").includes(target)
    );
    if (!words.length) words = [...currentLesson.words];

    soundSpellingQueueV9 = shuffleSoundV9(words).slice(0,Math.min(4,words.length));
    soundSpellingIndexV9 = 0;
    soundSpellingErrorsV9 = 0;
    soundSpellingSelectedV9 = "";
    renderSoundSpellingRoundV9(replay);
  };

  function renderSoundSpellingRoundV9(replay){
    const item = soundSpellingQueueV9[soundSpellingIndexV9];
    if (!item) {
      finishHistoryExerciseV9("exercise2",calculateExerciseStars(soundSpellingErrorsV9));
      return;
    }

    const choices = shuffleSoundV9([
      item.word,
      ...wrongSoundSpellingsV9(item.word,currentLesson.key)
    ]);

    lessonContent.innerHTML = `
      ${guidedHeader("exercise2")}
      <div class="lesson-box">
        <div class="exercise-progress-v3">Question ${soundSpellingIndexV9 + 1} sur ${soundSpellingQueueV9.length}</div>
        <p class="subtitle">Écoute puis choisis la bonne écriture du mot.</p>
        <div class="practice-prompt-v9">
          <p>Quel mot as-tu entendu ?</p>
          <strong>Son « ${escapeHtmlV9(currentLesson.key)} »</strong>
          <button class="practice-audio-v9" onclick="speak(decodeURIComponent('${encV9(item.word)}'))">🔊 Écouter le mot</button>
        </div>
        <div class="practice-choices-v9">
          ${choices.map(choice => `
            <button class="practice-choice-v9" onclick="selectSoundSpellingV9(this,decodeURIComponent('${encV9(choice)}'))">${escapeHtmlV9(choice)}</button>
          `).join("")}
        </div>
        <div id="soundSpellingMessageV9" class="practice-message-v9"></div>
        <div class="practice-actions-v9">
          <button class="primary" onclick="validateSoundSpellingV9(${Boolean(replay)})">Valider</button>
          <button class="secondary" onclick="stopAllAudio()">Stop lecture</button>
        </div>
        <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
      </div>`;

    setTimeout(() => speak(item.word),180);
  }

  window.selectSoundSpellingV9 = function(button,value){
    soundSpellingSelectedV9 = value;
    document.querySelectorAll(".practice-choice-v9").forEach(btn => btn.classList.remove("selected"));
    button?.classList.add("selected");
  };

  window.validateSoundSpellingV9 = function(replay = false){
    if (historyValidationLockedV9) return;
    const item = soundSpellingQueueV9[soundSpellingIndexV9];
    const msg = document.getElementById("soundSpellingMessageV9");
    if (!item || !msg) return;

    window.LumiAudio?.playValidation?.();

    if (!soundSpellingSelectedV9) {
      msg.textContent = "Choisis un mot";
      msg.className = "practice-message-v9 bad";
      return;
    }

    if (soundSpellingSelectedV9 !== item.word) {
      soundSpellingErrorsV9 += 1;
      msg.textContent = "Essaie encore";
      msg.className = "practice-message-v9 bad";
      window.LumiAudio?.playWrong?.();
      window.rememberMistake?.({
        kind:"word",
        lessonType:"sound",
        lessonKey:currentLesson.key,
        exerciseName:"exercise2",
        answer:item.word,
        audio:item.word
      });
      soundSpellingSelectedV9 = "";
      document.querySelectorAll(".practice-choice-v9").forEach(btn => btn.classList.remove("selected"));
      recordWrongAnswer();
      return;
    }

    historyValidationLockedV9 = true;
    msg.textContent = "Bravo !";
    msg.className = "practice-message-v9 good";
    window.LumiAudio?.playCorrect?.();
    rewardPlayer(7,0,2,null);
    createConfetti();
    soundSpellingIndexV9 += 1;

    if (soundSpellingIndexV9 >= soundSpellingQueueV9.length) {
      const score = calculateExerciseStars(soundSpellingErrorsV9);
      setTimeout(() => {
        historyValidationLockedV9 = false;
        finishHistoryExerciseV9("exercise2",score);
      },500);
      return;
    }

    setTimeout(() => {
      historyValidationLockedV9 = false;
      soundSpellingSelectedV9 = "";
      renderSoundSpellingRoundV9(replay);
    },550);
  };

  /* ---------------------------------------------------------
     EXERCICE 3 DE L'HISTOIRE : LETTRE MANQUANTE + AUDIO
  --------------------------------------------------------- */
  let historyMissingQueueV9 = [];
  let historyMissingIndexV9 = 0;
  let historyMissingErrorsV9 = 0;
  let historyMissingSelectedV9 = "";
  let historyMissingReplayV9 = false;

  function shuffleV9(items){
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
    return copy;
  }

  function escapeHtmlV9(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function encV9(value){
    return encodeURIComponent(String(value ?? ""));
  }

  function blankTargetV9(word,target){
    const lower = String(word).toLocaleLowerCase("fr");
    const wanted = String(target).toLocaleLowerCase("fr");
    const index = lower.indexOf(wanted);
    if (index < 0) return `□${escapeHtmlV9(word)}`;
    return escapeHtmlV9(word.slice(0,index)) +
      `<span class="missing-slot-v9">${"□".repeat(Math.max(1,wanted.length))}</span>` +
      escapeHtmlV9(word.slice(index + wanted.length));
  }

  window.showHistoryMissingLetterExerciseV9 = function(replay = false){
    stopAllAudio();
    window.LumiAudio?.stopBackground?.(true);
    historyValidationLockedV9 = false;
    currentLessonActivePart = "exercise3";
    updateLessonTabs();

    const target = currentLesson.key.toLocaleLowerCase("fr");
    let words = currentLesson.words.filter(item =>
      item.word.toLocaleLowerCase("fr").includes(target)
    );
    if (!words.length) words = [...currentLesson.words];

    historyMissingQueueV9 = shuffleV9(words).slice(0,Math.min(4,words.length));
    historyMissingIndexV9 = 0;
    historyMissingErrorsV9 = 0;
    historyMissingSelectedV9 = "";
    historyMissingReplayV9 = Boolean(replay);
    renderHistoryMissingRoundV9();
  };

  function renderHistoryMissingRoundV9(){
    const item = historyMissingQueueV9[historyMissingIndexV9];
    if (!item) {
      finishHistoryExerciseV9("exercise3",calculateExerciseStars(historyMissingErrorsV9));
      return;
    }

    const answer = currentLesson.key.toUpperCase();
    const pool = currentLesson.type === "sound"
      ? soundKeys.map(sound => sound.toUpperCase()).filter(sound => sound !== answer)
      : FULL_ALPHABET_V9.filter(letter => letter !== answer);
    const distractors = shuffleV9(pool).slice(0,2);
    const choices = shuffleV9([answer,...distractors]);

    lessonContent.innerHTML = `
      ${guidedHeader("exercise3")}
      <div class="lesson-box">
        <div class="exercise-progress-v3">Question ${historyMissingIndexV9 + 1} sur ${historyMissingQueueV9.length}</div>
        <p class="subtitle">Écoute le mot puis choisis ${currentLesson.type === "sound" ? "le son" : "la lettre"} manquant.</p>

        <div class="practice-prompt-v9">
          <p>Quel caractère manque dans ce mot ?</p>
          <strong class="history-missing-word-v9">${blankTargetV9(item.word,currentLesson.key)}</strong>
          <button class="practice-audio-v9" onclick="speak(decodeURIComponent('${encV9(item.word)}'))">🔊 Écouter le mot</button>
        </div>

        <div class="practice-choices-v9 history-choice-grid-v9">
          ${choices.map(choice => `
            <button class="practice-choice-v9" onclick="selectHistoryMissingV9(this,'${choice}')">${choice}</button>
          `).join("")}
        </div>

        <div id="historyMissingMessageV9" class="practice-message-v9"></div>
        <div class="practice-actions-v9">
          <button class="primary" onclick="validateHistoryMissingV9()">Valider</button>
          <button class="secondary" onclick="stopAllAudio()">Stop lecture</button>
        </div>
        <div class="sound-bar-box"><div id="soundBar" class="sound-bar"></div></div>
      </div>`;

    setTimeout(() => speak(item.word),180);
  }

  window.selectHistoryMissingV9 = function(button,value){
    historyMissingSelectedV9 = value;
    document.querySelectorAll(".history-choice-grid-v9 .practice-choice-v9")
      .forEach(btn => btn.classList.remove("selected"));
    button?.classList.add("selected");
  };

  window.validateHistoryMissingV9 = function(){
    if (historyValidationLockedV9) return;
    const msg = document.getElementById("historyMissingMessageV9");
    const correct = currentLesson.key.toUpperCase();
    window.LumiAudio?.playValidation?.();

    if (!historyMissingSelectedV9) {
      if (msg) {
        msg.textContent = currentLesson.type === "sound" ? "Choisis un son" : "Choisis une lettre";
        msg.className = "practice-message-v9 bad";
      }
      return;
    }

    if (historyMissingSelectedV9 !== correct) {
      historyMissingErrorsV9 += 1;
      if (msg) {
        msg.textContent = "Essaie encore";
        msg.className = "practice-message-v9 bad";
      }
      window.LumiAudio?.playWrong?.();
      historyMissingSelectedV9 = "";
      document.querySelectorAll(".history-choice-grid-v9 .practice-choice-v9")
        .forEach(btn => btn.classList.remove("selected"));
      recordWrongAnswer();
      return;
    }

    historyValidationLockedV9 = true;
    if (msg) {
      msg.textContent = "Bravo !";
      msg.className = "practice-message-v9 good";
    }
    window.LumiAudio?.playCorrect?.();
    rewardPlayer(7,0,2,null);
    createConfetti();
    historyMissingIndexV9 += 1;

    if (historyMissingIndexV9 >= historyMissingQueueV9.length) {
      const score = calculateExerciseStars(historyMissingErrorsV9);
      setTimeout(() => {
        historyValidationLockedV9 = false;
        finishHistoryExerciseV9("exercise3",score);
      },500);
      return;
    }

    setTimeout(() => {
      historyValidationLockedV9 = false;
      historyMissingSelectedV9 = "";
      renderHistoryMissingRoundV9();
    },550);
  };

  /* ---------------------------------------------------------
     PARCOURS D'ENTRAÎNEMENT COMPLÉMENTAIRE
  --------------------------------------------------------- */
  let practiceModeV9 = "letter";
  let practiceKeyV9 = "A";
  let practiceExerciseTypeV9 = "";
  let practiceQuestionV9 = null;
  let practiceSelectedV9 = "";
  let practiceBuiltV9 = [];
  let practiceErrorsV9 = 0;

  const practiceScreenV9 = document.getElementById("readingExercisesScreen");
  const previousHideAllScreensV9 = hideAllScreens;
  hideAllScreens = function(){
    previousHideAllScreensV9();
    practiceScreenV9?.classList.add("hidden");
  };

  function practiceLessonV9(mode,key){
    return mode === "sound" ? soundLessons[key] : letterLessons[key];
  }

  function normalizeTextV9(value){
    return String(value ?? "")
      .toLocaleLowerCase("fr")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[’']/g," ")
      .replace(/[^\p{L}\p{N}\s]/gu,"")
      .replace(/\s+/g," ")
      .trim();
  }

  function targetV9(){
    return practiceModeV9 === "sound"
      ? practiceKeyV9.toLocaleLowerCase("fr")
      : practiceKeyV9.toLocaleLowerCase("fr");
  }

  function wordHasTargetV9(word,target = targetV9()){
    return String(word).toLocaleLowerCase("fr").includes(String(target).toLocaleLowerCase("fr"));
  }

  function allPracticeLessonsV9(){
    return [
      ...FULL_ALPHABET_V9.map(key => letterLessons[key]).filter(Boolean),
      ...soundKeys.map(key => soundLessons[key]).filter(Boolean)
    ];
  }

  function allWordsV9(){
    const seen = new Set();
    return allPracticeLessonsV9()
      .flatMap(lesson => lesson.words || [])
      .filter(item => {
        const key = normalizeTextV9(item.word);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function allPhrasesV9(){
    return [...new Set(
      allPracticeLessonsV9().flatMap(lesson => lesson.phrases || [])
    )];
  }

  function currentWordsV9(){
    return practiceLessonV9(practiceModeV9,practiceKeyV9)?.words || [];
  }

  function currentPhrasesV9(){
    return practiceLessonV9(practiceModeV9,practiceKeyV9)?.phrases || [];
  }

  function syllablePartsV9(item){
    const cut = String(item?.cut || item?.word || "");
    const parts = cut.split(/\s*\/\s*/).map(part => part.trim()).filter(Boolean);
    return parts.length ? parts : [String(item?.word || "")];
  }

  function positiveWordsV9(){
    const local = currentWordsV9().filter(item => wordHasTargetV9(item.word));
    const global = allWordsV9().filter(item => wordHasTargetV9(item.word));
    return local.length ? local : global;
  }

  function negativeWordsV9(){
    return allWordsV9().filter(item => !wordHasTargetV9(item.word));
  }

  function uniqueItemsV9(items,keyFn){
    const seen = new Set();
    return items.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function randomItemV9(items,fallback = null){
    if (!items?.length) return fallback;
    return items[Math.floor(Math.random() * items.length)];
  }

  function courseDescriptionV9(mode,key){
    if (mode === "sound") {
      return `Le groupe de lettres « ${key} » forme un son. Écoute les exemples avant de commencer les activités.`;
    }
    if (key === "H") {
      return "La lettre H est souvent muette en français. On apprend surtout à la reconnaître dans les mots.";
    }
    return `La lettre ${key} peut se combiner avec les voyelles pour former des syllabes. Écoute les exemples puis entraîne-toi.`;
  }

  window.showReadingExercisesHome = function(mode = practiceModeV9){
    practiceModeV9 = mode === "sound" ? "sound" : "letter";
    hideAllScreens();
    practiceScreenV9?.classList.remove("hidden");
    document.getElementById("practiceChooserV9")?.classList.remove("hidden");
    document.getElementById("practiceLessonPanelV9")?.classList.add("hidden");
    renderPracticeChooserV9();
    window.LumiAudio?.playMenu?.();
  };

  window.setPracticeModeV9 = function(mode){
    practiceModeV9 = mode === "sound" ? "sound" : "letter";
    document.getElementById("practiceChooserV9")?.classList.remove("hidden");
    document.getElementById("practiceLessonPanelV9")?.classList.add("hidden");
    renderPracticeChooserV9();
  };

  function renderPracticeChooserV9(){
    const letterTab = document.getElementById("practiceLettersTabV9");
    const soundTab = document.getElementById("practiceSoundsTabV9");
    const title = document.getElementById("practiceChooserTitleV9");
    const text = document.getElementById("practiceChooserTextV9");
    const badge = document.getElementById("practiceChooserBadgeV9");
    const grid = document.getElementById("practiceLessonsGridV9");

    letterTab?.classList.toggle("active",practiceModeV9 === "letter");
    soundTab?.classList.toggle("active",practiceModeV9 === "sound");

    if (title) title.textContent = practiceModeV9 === "letter"
      ? "Toutes les lettres de A à Z"
      : "Tous les sons composés";
    if (text) text.textContent = practiceModeV9 === "letter"
      ? "Les six lettres absentes de l’histoire sont aussi disponibles ici."
      : "Relis le rappel de cours puis choisis une activité complémentaire.";
    if (badge) badge.textContent = practiceModeV9 === "letter" ? "Aa" : "ch";

    const keys = practiceModeV9 === "letter" ? FULL_ALPHABET_V9 : soundKeys;
    if (!grid) return;
    grid.innerHTML = keys.map(key => {
      const lesson = practiceLessonV9(practiceModeV9,key);
      const count = Number(gameState.practiceProgress?.[`${practiceModeV9}:${key}`] || 0);
      return `<button class="practice-letter-card-v9 ${practiceModeV9 === "sound" ? "sound" : ""}"
        onclick="openPracticeLessonV9('${practiceModeV9}','${escapeHtmlV9(key)}')">
        <strong>${escapeHtmlV9(practiceModeV9 === "letter" ? key : key)}</strong>
        <small>${count ? `${count} exercice${count > 1 ? "s" : ""} réussi${count > 1 ? "s" : ""}` : "À découvrir"}</small>
      </button>`;
    }).join("");
  }

  window.openPracticeLessonV9 = function(mode,key){
    practiceModeV9 = mode === "sound" ? "sound" : "letter";
    practiceKeyV9 = key;
    practiceExerciseTypeV9 = "";
    window.LumiAudio?.stopBackground?.(true);
    document.getElementById("practiceChooserV9")?.classList.add("hidden");
    document.getElementById("practiceLessonPanelV9")?.classList.remove("hidden");
    renderPracticeLessonV9();
  };

  window.closePracticeLessonV9 = function(){
    stopAllAudio();
    document.getElementById("practiceChooserV9")?.classList.remove("hidden");
    document.getElementById("practiceLessonPanelV9")?.classList.add("hidden");
    renderPracticeChooserV9();
    window.LumiAudio?.playMenu?.();
  };

  function renderPracticeLessonV9(){
    const content = document.getElementById("practiceLessonContentV9");
    const lesson = practiceLessonV9(practiceModeV9,practiceKeyV9);
    if (!content || !lesson) return;

    const symbol = practiceModeV9 === "letter"
      ? practiceKeyV9
      : practiceKeyV9;
    const chips = practiceModeV9 === "letter"
      ? (lesson.syllables || []).map(item => item.syllable)
      : [lesson.soundAudio || practiceKeyV9];
    const examples = (lesson.words || []).slice(0,5);

    content.innerHTML = `
      <section class="practice-course-v9">
        <div class="practice-course-symbol-v9">${escapeHtmlV9(symbol)}</div>
        <div>
          <small>Petit rappel de cours</small>
          <h2>${practiceModeV9 === "letter" ? `La lettre ${escapeHtmlV9(practiceKeyV9)}` : `Le son ${escapeHtmlV9(practiceKeyV9)}`}</h2>
          <p>${courseDescriptionV9(practiceModeV9,practiceKeyV9)}</p>
          <div class="practice-course-chips-v9">
            ${chips.map(chip => `<button onclick="practiceSpeakV9(decodeURIComponent('${encV9(chip)}'))">${escapeHtmlV9(chip)}</button>`).join("")}
          </div>
          <div class="practice-examples-v9">
            ${examples.map(item => `<button onclick="practiceSpeakV9(decodeURIComponent('${encV9(item.word)}'))">🔊 ${escapeHtmlV9(item.word)}</button>`).join("")}
          </div>
        </div>
      </section>

      <div class="practice-exercise-heading-v9">
        <small>Exercices complémentaires</small>
        <h3>Choisis une activité</h3>
      </div>

      <div class="practice-exercise-grid-v9">
        ${PRACTICE_TYPES_V9.map(exercise => `
          <button class="practice-exercise-card-v9" onclick="startPracticeExerciseV9('${exercise.id}')">
            <span>${exercise.icon}</span>
            <span><strong>${exercise.title}</strong><em>${exercise.text}</em></span>
            <b>→</b>
          </button>
        `).join("")}
      </div>`;
  }

  window.practiceSpeakV9 = function(text){
    stopAllAudio();
    speak(text);
  };

  function makeWrongSpellingsV9(word){
    const target = targetV9();
    const alternatives = practiceModeV9 === "letter"
      ? shuffleV9(FULL_ALPHABET_V9.filter(letter => letter.toLocaleLowerCase("fr") !== target)).slice(0,6)
      : shuffleV9(soundKeys.filter(sound => sound !== target)).slice(0,6);
    const lower = word.toLocaleLowerCase("fr");
    const index = lower.indexOf(target);
    const wrong = [];

    alternatives.forEach(replacement => {
      if (wrong.length >= 2) return;
      let candidate;
      if (index >= 0) {
        candidate = word.slice(0,index) + replacement.toLocaleLowerCase("fr") + word.slice(index + target.length);
      } else {
        candidate = replacement.toLocaleLowerCase("fr") + word.slice(1);
      }
      if (normalizeTextV9(candidate) !== normalizeTextV9(word) && !wrong.includes(candidate)) {
        wrong.push(candidate);
      }
    });

    while (wrong.length < 2) {
      wrong.push(word + (wrong.length ? "e" : "s"));
    }
    return wrong;
  }

  function chooseWordWithPartsV9(minParts = 2){
    const candidates = currentWordsV9().filter(item => syllablePartsV9(item).length >= minParts);
    return randomItemV9(candidates,currentWordsV9()[0]);
  }

  function makePracticeQuestionV9(type){
    const positive = positiveWordsV9();
    const negative = negativeWordsV9();
    const lesson = practiceLessonV9(practiceModeV9,practiceKeyV9);

    if (type === "hear") {
      const shouldContain = Math.random() >= .5;
      const item = randomItemV9(shouldContain ? positive : negative,randomItemV9(positive));
      return {
        type,
        title:"J’entends ou je n’entends pas",
        prompt:`Écoute le mot « ${item.word} ».`,
        display:item.word,
        audio:item.word,
        choices:["J’entends","Je n’entends pas"],
        answer:shouldContain ? "J’entends" : "Je n’entends pas"
      };
    }

    if (type === "intruder") {
      const positives = uniqueItemsV9(shuffleV9(positive),item => normalizeTextV9(item.word)).slice(0,3);
      while (positives.length < 3 && positive.length) positives.push(randomItemV9(positive));
      const intruder = randomItemV9(negative,randomItemV9(allWordsV9()));
      const choices = shuffleV9([...positives.map(item => item.word),intruder.word]);
      return {
        type,
        title:"Trouve l’intrus",
        prompt:`Un seul mot ne contient pas ${practiceModeV9 === "letter" ? "la lettre" : "le son"} « ${practiceKeyV9} ».`,
        display:"Quel est l’intrus ?",
        choices,
        answer:intruder.word
      };
    }

    if (type === "position") {
      const item = randomItemV9(positive,currentWordsV9()[0]);
      const lower = item.word.toLocaleLowerCase("fr");
      const target = targetV9();
      const index = Math.max(0,lower.indexOf(target));
      const end = index + target.length;
      const answer = index === 0 ? "Au début" : end >= lower.length ? "À la fin" : "Au milieu";
      return {
        type,
        title:"Où entends-tu le son ?",
        prompt:`Écoute le mot « ${item.word} ».`,
        display:item.word,
        audio:item.word,
        choices:["Au début","Au milieu","À la fin"],
        answer
      };
    }

    if (type === "orderSyllables" || type === "buildWord") {
      const item = chooseWordWithPartsV9(2);
      const parts = syllablePartsV9(item);
      return {
        type,
        title:type === "buildWord" ? "Construis le mot entendu" : "Remets les syllabes dans l’ordre",
        prompt:type === "buildWord" ? "Écoute puis reconstruis le mot." : `Reconstruis le mot « ${item.word} ».`,
        display:type === "buildWord" ? "🔊 Mot à écouter" : item.word,
        audio:item.word,
        tokens:shuffleV9(parts.map((value,index) => ({ id:`${index}-${Math.random()}`,value }))),
        answer:parts
      };
    }

    if (type === "missingSyllable") {
      const item = chooseWordWithPartsV9(2);
      const parts = syllablePartsV9(item);
      const missingIndex = Math.floor(Math.random() * parts.length);
      const answer = parts[missingIndex];
      const displayParts = parts.map((part,index) => index === missingIndex ? "□" : part);
      const otherParts = allWordsV9().flatMap(syllablePartsV9).filter(part => normalizeTextV9(part) !== normalizeTextV9(answer));
      const choices = shuffleV9([answer,...shuffleV9([...new Set(otherParts)]).slice(0,2)]);
      return {
        type,
        title:"Retrouve la syllabe manquante",
        prompt:`Complète le mot « ${item.word} ».`,
        display:displayParts.join(" / "),
        audio:item.word,
        choices,
        answer
      };
    }

    if (type === "spelling") {
      const item = randomItemV9(positive,currentWordsV9()[0]);
      const wrong = makeWrongSpellingsV9(item.word);
      return {
        type,
        title:"Choisis la bonne écriture",
        prompt:"Écoute le mot et retrouve son écriture.",
        display:"Quel mot est bien écrit ?",
        audio:item.word,
        choices:shuffleV9([item.word,...wrong]),
        answer:item.word
      };
    }

    if (type === "dictation") {
      const item = randomItemV9(positive,currentWordsV9()[0]);
      return {
        type,
        title:"Écris le mot entendu",
        prompt:"Écoute attentivement puis écris le mot.",
        display:"Petite dictée",
        audio:item.word,
        input:true,
        answer:item.word
      };
    }

    if (type === "orderSentence") {
      const phrase = randomItemV9(currentPhrasesV9(),randomItemV9(allPhrasesV9(),"Lumi apprend en jouant."));
      const clean = phrase.replace(/[.!?]+$/,"");
      const words = clean.split(/\s+/).filter(Boolean);
      return {
        type,
        title:"Remets la phrase dans l’ordre",
        prompt:"Replace les mots dans le bon ordre.",
        display:"Construis la phrase.",
        tokens:shuffleV9(words.map((value,index) => ({ id:`${index}-${Math.random()}`,value }))),
        answer:words
      };
    }

    if (type === "missingWord") {
      const phrase = randomItemV9(currentPhrasesV9(),randomItemV9(allPhrasesV9(),"Lumi regarde les étoiles."));
      const cleanWords = phrase.replace(/[.!?]+$/,"").split(/\s+/).filter(Boolean);
      const targetWords = cleanWords.filter(word => normalizeTextV9(word).length > 2);
      const answer = randomItemV9(targetWords,cleanWords[cleanWords.length - 1]);
      let replaced = false;
      const display = cleanWords.map(word => {
        if (!replaced && normalizeTextV9(word) === normalizeTextV9(answer)) {
          replaced = true;
          return "□";
        }
        return word;
      }).join(" ") + ".";
      const distractors = shuffleV9(allWordsV9().map(item => item.word)
        .filter(word => normalizeTextV9(word) !== normalizeTextV9(answer))).slice(0,2);
      return {
        type,
        title:"Retrouve le mot manquant",
        prompt:"Quel mot complète correctement la phrase ?",
        display,
        choices:shuffleV9([answer,...distractors]),
        answer
      };
    }

    if (type === "chooseSentence") {
      const phrase = randomItemV9(currentPhrasesV9(),randomItemV9(allPhrasesV9(),"Lumi apprend en jouant."));
      const distractors = shuffleV9(allPhrasesV9().filter(value => value !== phrase)).slice(0,2);
      return {
        type,
        title:"Choisis la bonne phrase",
        prompt:"Écoute puis sélectionne la phrase entendue.",
        display:"Quelle phrase as-tu entendue ?",
        audio:phrase,
        choices:shuffleV9([phrase,...distractors]),
        answer:phrase
      };
    }

    return makePracticeQuestionV9("hear");
  }

  window.startPracticeExerciseV9 = function(type){
    practiceExerciseTypeV9 = type;
    practiceErrorsV9 = 0;
    window.LumiAudio?.stopBackground?.(true);
    renderNextPracticeQuestionV9();
  };

  function renderNextPracticeQuestionV9(){
    practiceQuestionV9 = makePracticeQuestionV9(practiceExerciseTypeV9);
    practiceSelectedV9 = "";
    practiceBuiltV9 = [];
    renderPracticeQuestionV9();
  }

  function renderPracticeQuestionV9(){
    const content = document.getElementById("practiceLessonContentV9");
    const q = practiceQuestionV9;
    if (!content || !q) return;

    let answerArea = "";

    if (q.tokens) {
      answerArea = `
        <div id="practiceBuiltAnswerV9" class="practice-built-answer-v9 empty">Clique sur les éléments dans le bon ordre.</div>
        <div class="practice-choices-v9">
          ${q.tokens.map(token => `
            <button id="practiceToken-${escapeHtmlV9(token.id)}" class="practice-choice-v9 token"
              onclick="practiceAddTokenV9('${escapeHtmlV9(token.id)}')">${escapeHtmlV9(token.value)}</button>
          `).join("")}
        </div>`;
    } else if (q.input) {
      answerArea = `<input id="practiceInputV9" class="practice-input-v9" autocomplete="off" placeholder="Écris ta réponse">`;
    } else {
      answerArea = `<div class="practice-choices-v9 ${q.choices?.length === 3 ? "history-choice-grid-v9" : ""}">
        ${(q.choices || []).map(choice => `
          <button class="practice-choice-v9"
            onclick="practiceSelectV9(this,decodeURIComponent('${encV9(choice)}'))">${escapeHtmlV9(choice)}</button>
        `).join("")}
      </div>`;
    }

    content.innerHTML = `
      <section class="practice-stage-v9">
        <div class="practice-stage-top-v9">
          <div>
            <small>${practiceModeV9 === "letter" ? `Lettre ${escapeHtmlV9(practiceKeyV9)}` : `Son ${escapeHtmlV9(practiceKeyV9)}`}</small>
            <h3>${escapeHtmlV9(q.title)}</h3>
          </div>
          <button onclick="renderPracticeLessonV9()">Changer d’exercice</button>
        </div>

        <div class="practice-prompt-v9">
          <p>${escapeHtmlV9(q.prompt)}</p>
          <strong>${escapeHtmlV9(q.display)}</strong>
          ${q.audio ? `<button class="practice-audio-v9" onclick="practiceSpeakV9(decodeURIComponent('${encV9(q.audio)}'))">🔊 Écouter</button>` : ""}
        </div>

        ${answerArea}
        <div id="practiceMessageV9" class="practice-message-v9"></div>
        <div class="practice-actions-v9">
          <button class="primary" onclick="validatePracticeV9()">Valider</button>
          ${q.tokens
            ? `<button class="secondary" onclick="undoPracticeTokenV9()">Effacer le dernier</button>`
            : q.audio
              ? `<button class="secondary" onclick="practiceSpeakV9(decodeURIComponent('${encV9(q.audio)}'))">Réécouter</button>`
              : `<button class="secondary" onclick="renderPracticeLessonV9()">Voir le rappel</button>`}
        </div>
      </section>`;

    if (q.input) {
      document.getElementById("practiceInputV9")?.addEventListener("keydown",event => {
        if (event.key === "Enter") validatePracticeV9();
      });
    }

    /* Lecture automatique cohérente : la consigne est lue dans tous les
       exercices. Lorsqu'un mot ou une phrase doit être écouté, il est annoncé
       juste après la consigne dans la même lecture afin d'éviter que deux voix
       se coupent mutuellement. */
    const autoReadEnabledV11 = gameState.appSettingsV10?.autoRead !== false;
    if (autoReadEnabledV11) {
      const spokenV11 = q.audio
        ? `${q.prompt} ${q.audio}`
        : q.prompt;
      if (spokenV11) setTimeout(() => speak(spokenV11),220);
    } else if (q.audio) {
      setTimeout(() => speak(q.audio),220);
    }
  }

  window.practiceSelectV9 = function(button,value){
    practiceSelectedV9 = value;
    document.querySelectorAll(".practice-choice-v9").forEach(btn => btn.classList.remove("selected"));
    button?.classList.add("selected");
  };

  window.practiceAddTokenV9 = function(id){
    const token = practiceQuestionV9?.tokens?.find(item => item.id === id);
    if (!token) return;
    const button = document.getElementById(`practiceToken-${id}`);
    if (button?.disabled) return;
    practiceBuiltV9.push(token);
    if (button) button.disabled = true;
    updatePracticeBuiltAnswerV9();
  };

  window.undoPracticeTokenV9 = function(){
    const token = practiceBuiltV9.pop();
    if (token) {
      const button = document.getElementById(`practiceToken-${token.id}`);
      if (button) button.disabled = false;
    }
    updatePracticeBuiltAnswerV9();
  };

  function updatePracticeBuiltAnswerV9(){
    const box = document.getElementById("practiceBuiltAnswerV9");
    if (!box) return;
    box.textContent = practiceBuiltV9.length
      ? practiceBuiltV9.map(item => item.value).join(" ")
      : "Clique sur les éléments dans le bon ordre.";
    box.classList.toggle("empty",practiceBuiltV9.length === 0);
  }

  function practiceAnswerV9(){
    if (practiceQuestionV9?.input) {
      return document.getElementById("practiceInputV9")?.value || "";
    }
    if (practiceQuestionV9?.tokens) {
      return practiceBuiltV9.map(item => item.value);
    }
    return practiceSelectedV9;
  }

  function answersMatchV9(answer,expected){
    if (Array.isArray(expected)) {
      if (!Array.isArray(answer) || answer.length !== expected.length) return false;
      return answer.every((value,index) =>
        normalizeTextV9(value) === normalizeTextV9(expected[index])
      );
    }
    return normalizeTextV9(answer) === normalizeTextV9(expected);
  }

  function rememberPracticeMistakeV11(question){
    if (!question || typeof window.rememberMistake !== "function") return;
    const expected = Array.isArray(question.answer)
      ? question.answer.join(" ")
      : String(question.answer ?? "");
    const stableAnswer = normalizeTextV9(expected) || normalizeTextV9(question.display) || "question";

    window.rememberMistake({
      id: `practice:${practiceModeV9}:${practiceKeyV9}:${question.type}:${stableAnswer}`,
      kind: "practice",
      lessonType: practiceModeV9,
      lessonKey: practiceKeyV9,
      practiceType: question.type,
      practiceTitle: question.title,
      prompt: question.prompt,
      display: question.display,
      audio: question.audio || "",
      answer: expected,
      correct: expected,
      choices: Array.isArray(question.choices) ? [...question.choices] : null,
      tokens: Array.isArray(question.tokens) ? question.tokens.map(token => token.value) : null,
      input: Boolean(question.input)
    });
  }

  window.validatePracticeV9 = function(){
    const msg = document.getElementById("practiceMessageV9");
    const answer = practiceAnswerV9();
    const empty = Array.isArray(answer) ? !answer.length : !String(answer || "").trim();

    window.LumiAudio?.playValidation?.();

    if (empty) {
      if (msg) {
        msg.textContent = "Choisis ou écris une réponse.";
        msg.className = "practice-message-v9 bad";
      }
      return;
    }

    if (!answersMatchV9(answer,practiceQuestionV9.answer)) {
      practiceErrorsV9 += 1;
      if (msg) {
        msg.textContent = "Essaie encore.";
        msg.className = "practice-message-v9 bad";
      }
      window.LumiAudio?.playWrong?.();
      rememberPracticeMistakeV11(practiceQuestionV9);
      recordWrongAnswer();
      return;
    }

    window.LumiAudio?.playCorrect?.();
    createConfetti();
    rewardPlayer(5,0,1,null);

    if (!gameState.practiceProgress) gameState.practiceProgress = {};
    const key = `${practiceModeV9}:${practiceKeyV9}`;
    gameState.practiceProgress[key] = Number(gameState.practiceProgress[key] || 0) + 1;
    saveGameState();

    const content = document.getElementById("practiceLessonContentV9");
    if (content) {
      content.innerHTML = `
        <section class="practice-result-v9">
          <div class="icon">✓</div>
          <h3>Bravo !</h3>
          <p>Exercice réussi${practiceErrorsV9 ? ` après ${practiceErrorsV9} erreur${practiceErrorsV9 > 1 ? "s" : ""}` : " sans erreur"}.</p>
          <p>Tu gagnes 5 XP et 1 pièce. Les étoiles de l’histoire restent réservées au parcours principal.</p>
          <div class="practice-actions-v9">
            <button class="primary" onclick="nextPracticeQuestionV9()">Question suivante</button>
            <button class="secondary" onclick="renderPracticeLessonV9()">Choisir un autre exercice</button>
          </div>
        </section>`;
    }
  };

  window.nextPracticeQuestionV9 = function(){
    practiceErrorsV9 = 0;
    renderNextPracticeQuestionV9();
  };

  window.renderPracticeLessonV9 = renderPracticeLessonV9;

  /* Après correction d'une ancienne erreur, empêcher l'ancien plafond de 3
     de recréditer une étoile supplémentaire. */
  const previousValidateMistakeV9 = window.validateMistakeAnswer;
  if (typeof previousValidateMistakeV9 === "function") {
    window.validateMistakeAnswer = function(...args){
      const result = previousValidateMistakeV9.apply(this,args);
      setTimeout(() => {
        normalizeHistoryRewardsV9(false);
        normalizeSoundRewardsV9();
        saveGameState();
        updateGameUi();
      },0);
      return result;
    };
  }

  /* Les outils administrateur restent compatibles avec le nouveau 2+2+2. */
  ["adminCompleteCurrentWorld","adminCompleteAllWorlds"].forEach(name => {
    const original = window[name];
    if (typeof original !== "function") return;
    window[name] = function(...args){
      const result = original.apply(this,args);
      normalizeHistoryRewardsV9(true);
      saveGameState();
      updateGameUi();
      return result;
    };
  });

  /* Les cartes du parcours des sons affichent maintenant le nouveau maximum 6. */
  renderSoundsGrid = function(){
    ensureLearningProgress();
    const lockPanel = document.getElementById("soundsLockPanel");
    const allLettersDone = areAllLettersCompleted();

    if (!allLettersDone) {
      lockPanel?.classList.remove("hidden");
      soundsGrid.className = "lesson-grid";
      soundsGrid.innerHTML = "";
      updateGameUi();
      return;
    }

    lockPanel?.classList.add("hidden");
    soundsGrid.className = "lesson-grid path-grid";
    soundsGrid.innerHTML = "";

    soundKeys.forEach(sound => {
      const lesson = soundLessons[sound];
      const progress = getProgress("sound",sound);
      const stateClass = progress.completed ? "completed" : progress.unlocked ? "current" : "locked";
      const stateText = progress.completed ? "Terminé" : progress.unlocked ? "À jouer" : "Bloqué";
      const click = progress.unlocked
        ? `openLesson('${sound}','sound')`
        : `showLockedLessonMessage('${sound}')`;

      soundsGrid.innerHTML += `
        <div class="path-node ${stateClass}" data-path-id="sound-${sound}">
          <span class="path-state">${stateText}</span>
          <div class="lesson-card ${progress.completed ? "mastered" : ""}" onclick="${click}">
            <div class="lesson-icon"><img src="${lesson.image}" alt=""></div>
            <h2>${lesson.title}</h2>
            <p>${progress.completed
              ? `${getTotalLessonStars("sound",sound)} / 6 étoiles`
              : lesson.words.map(word => word.word).join(" · ")}</p>
          </div>
        </div>`;
    });

    animatePendingUnlock();
  };

  updateGameUi();
})();


/* =========================================================
   LUMIKIDS — GROSSE MISE À JOUR PROGRESSION V10
   1. Parcours d'entraînement finalisé
   2. Étoiles 2 + 2 + 2 synchronisées partout
   3. Refaire mes erreurs enrichi
   4. Tableau de bord Parents détaillé
   5. Défis quotidiens et séries
   6. Récompenses et nouveaux succès
   7. Paramètres d'accessibilité et voix
   8. Reprise intelligente
   9. Résultats détaillés
========================================================= */
(function installLumiKidsProgressionV10(){
  "use strict";

  const VERSION = "11.0";
  const PRACTICE_TYPES_V10 = [
    ["hear","J’entends / je n’entends pas"],
    ["intruder","Trouve l’intrus"],
    ["position","Position du son"],
    ["orderSyllables","Syllabes dans l’ordre"],
    ["missingSyllable","Syllabe manquante"],
    ["buildWord","Construis le mot"],
    ["spelling","Bonne écriture"],
    ["dictation","Petite dictée"],
    ["orderSentence","Phrase dans l’ordre"],
    ["missingWord","Mot manquant"],
    ["chooseSentence","Bonne phrase"]
  ];
  const ALL_LETTERS_V10 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const practiceContextV10 = {
    mode: "letter",
    key: "A",
    type: "",
    coinsAtStart: 0,
    resultHandled: false
  };
  const historyContextV10 = {
    type: "letter",
    key: "A",
    exercise: "exercise1",
    correct: 0,
    errors: 0,
    coinsAtStart: 0,
    resultHandled: false
  };
  let mistakeFilterV10 = "all";
  let mathMistakeOperationFilterV12 = "all";
  let activeMistakeV10 = null;
  let selectedMistakeV10 = "";
  let selectedMistakeTokensV10 = [];
  let correctionQueueV10 = false;
  let previousVisitV10 = 0;

  function now(){ return Date.now(); }
  function escapeV10(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }
  function encV10(value){ return encodeURIComponent(String(value ?? "")); }
  function normalizeV10(value){
    return String(value ?? "")
      .toLocaleLowerCase("fr")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[’']/g," ")
      .replace(/[^a-z0-9]+/g," ")
      .trim();
  }
  function dayKeyV10(date = new Date()){
    return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
  }
  function yesterdayKeyV10(){
    const date = new Date();
    date.setDate(date.getDate()-1);
    return dayKeyV10(date);
  }
  function formatDurationV10(seconds){
    const total = Math.max(0,Math.round(Number(seconds)||0));
    if (total < 60) return `${total} s`;
    const minutes = Math.floor(total/60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes/60);
    const rest = minutes%60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }
  function safeSaveV10(){
    try { saveGameState(); } catch {}
  }

  function ensureV10State(){
    if (!gameState.analyticsV10) {
      gameState.analyticsV10 = {
        version: VERSION,
        sessions: 0,
        sessionSeconds: 0,
        exercisesCompleted: 0,
        historyCompleted: 0,
        practiceCompleted: 0,
        perfectExercises: 0,
        lastVisit: 0,
        activityLog: []
      };
    }
    const analytics = gameState.analyticsV10;
    if (!Array.isArray(analytics.activityLog)) analytics.activityLog = [];
    ["sessions","sessionSeconds","exercisesCompleted","historyCompleted","practiceCompleted","perfectExercises"]
      .forEach(key => analytics[key] = Number(analytics[key] || 0));

    if (!gameState.practiceStatsV10) gameState.practiceStatsV10 = {};
    if (!gameState.appSettingsV10) {
      gameState.appSettingsV10 = {
        voiceVolume: .9,
        textScale: 1,
        reducedMotion: false,
        autoRead: true,
        confirmExit: true
      };
    }
    gameState.appSettingsV10.voiceVolume = Math.max(0,Math.min(1,Number(gameState.appSettingsV10.voiceVolume ?? .9)));
    gameState.appSettingsV10.textScale = [0.92,1,1.12].includes(Number(gameState.appSettingsV10.textScale))
      ? Number(gameState.appSettingsV10.textScale) : 1;
    gameState.appSettingsV10.reducedMotion = Boolean(gameState.appSettingsV10.reducedMotion);
    gameState.appSettingsV10.autoRead = gameState.appSettingsV10.autoRead !== false;
    gameState.appSettingsV10.confirmExit = gameState.appSettingsV10.confirmExit !== false;

    if (!gameState.dailyStreakV10) {
      gameState.dailyStreakV10 = { count:0, lastClaimDate:"", milestones:{} };
    }
    if (!gameState.dailyStreakV10.milestones) gameState.dailyStreakV10.milestones = {};
    if (!gameState.achievementNotifiedV10) gameState.achievementNotifiedV10 = {};
    if (!gameState.resumeV10) gameState.resumeV10 = null;
    if (!gameState.mistakes) gameState.mistakes = {};
    if (!gameState.achievements) gameState.achievements = {};
    if (!Number.isFinite(Number(gameState.mistakesRecovered))) gameState.mistakesRecovered = 0;
  }

  previousVisitV10 = Number(gameState.analyticsV10?.lastVisit || 0);
  ensureV10State();
  gameState.analyticsV10.sessions += 1;
  gameState.analyticsV10.lastVisit = now();
  safeSaveV10();

  function logActivityV10(kind,title,detail,meta = {}){
    ensureV10State();
    gameState.analyticsV10.activityLog.unshift({
      id:`${now()}-${Math.random().toString(36).slice(2,7)}`,
      kind,
      title,
      detail,
      at:now(),
      ...meta
    });
    gameState.analyticsV10.activityLog = gameState.analyticsV10.activityLog.slice(0,30);
    safeSaveV10();
  }

  function setResumeV10(data){
    ensureV10State();
    gameState.resumeV10 = data ? {...data,updatedAt:now()} : null;
    safeSaveV10();
    updateResumeUiV10();
  }

  function resumeLabelV10(resume){
    if (!resume) return "Commence une activité pour retrouver ta progression ici.";
    if (resume.kind === "practice") {
      const label = resume.mode === "sound" ? `son ${resume.key}` : `lettre ${resume.key}`;
      const exercise = PRACTICE_TYPES_V10.find(item => item[0] === resume.exercise)?.[1] || "entraînement";
      return `Reprendre : ${label} · ${exercise}`;
    }
    if (resume.kind === "history") {
      const label = resume.type === "sound" ? `Son ${resume.key}` : `Lettre ${resume.key}`;
      const step = resume.part?.startsWith("exercise") ? ` · exercice ${resume.part.replace("exercise","")}` : "";
      return `Reprendre l’aventure : ${label}${step}`;
    }
    if (resume.kind === "math") {
      const labels = {
        addition:"les additions",
        subtraction:"les soustractions",
        comparison:"les comparaisons",
        problem:"les petits problèmes",
        mixed:"les calculs mélangés"
      };
      return `Reprendre ${labels[resume.operation] || "les maths"}${resume.inGame ? " · partie en cours" : ""}`;
    }
    return "Continuer là où tu t’es arrêté";
  }

  function updateResumeUiV10(){
    const resume = gameState.resumeV10;
    const hint = document.getElementById("resumeHintV10");
    const button = document.getElementById("continueLearningButtonV10");
    if (hint) hint.textContent = resumeLabelV10(resume);
    if (button) {
      const text = resume ? "Reprendre" : "Continuer";
      button.innerHTML = `${text} <span>→</span>`;
    }
  }

  /* ---------------------------------------------------------
     TEMPS D'APPRENTISSAGE
  --------------------------------------------------------- */
  let sessionTickV10 = now();
  function commitSessionTimeV10(){
    if (document.visibilityState !== "visible") {
      sessionTickV10 = now();
      return;
    }
    const elapsed = Math.min(60,Math.max(0,(now()-sessionTickV10)/1000));
    sessionTickV10 = now();
    if (elapsed >= 1) {
      gameState.analyticsV10.sessionSeconds += Math.round(elapsed);
      gameState.analyticsV10.lastVisit = now();
      safeSaveV10();
    }
  }
  setInterval(commitSessionTimeV10,30000);
  document.addEventListener("visibilitychange",() => {
    commitSessionTimeV10();
    if (document.visibilityState === "visible") sessionTickV10 = now();
  });
  window.addEventListener("pagehide",commitSessionTimeV10);

  /* ---------------------------------------------------------
     PARAMÈTRES ET ACCESSIBILITÉ
  --------------------------------------------------------- */
  function applyAppSettingsV10(){
    const settings = gameState.appSettingsV10;
    document.documentElement.style.setProperty("--v10-text-scale",String(settings.textScale));
    document.body.classList.toggle("v10-reduced-motion",settings.reducedMotion);
    document.body.dataset.v10TextSize = String(settings.textScale).replace(".","-");

    const voice = document.getElementById("voiceVolumeSliderV10");
    const voiceValue = document.getElementById("voiceVolumeValueV10");
    if (voice) voice.value = Math.round(settings.voiceVolume*100);
    if (voiceValue) voiceValue.textContent = `${Math.round(settings.voiceVolume*100)} %`;
    const reduced = document.getElementById("reducedMotionToggleV10");
    const autoRead = document.getElementById("autoReadToggleV10");
    const confirmExit = document.getElementById("confirmExitToggleV10");
    if (reduced) reduced.checked = settings.reducedMotion;
    if (autoRead) autoRead.checked = settings.autoRead;
    if (confirmExit) confirmExit.checked = settings.confirmExit;
    document.querySelectorAll(".text-size-buttons-v10 button").forEach(button => {
      button.classList.toggle("active",Number(button.dataset.scale) === Number(settings.textScale));
    });
  }

  window.changeVoiceVolumeV10 = function(value){
    gameState.appSettingsV10.voiceVolume = Math.max(0,Math.min(1,Number(value)/100));
    safeSaveV10();
    applyAppSettingsV10();
  };
  window.setTextScaleV10 = function(value){
    gameState.appSettingsV10.textScale = [0.92,1,1.12].includes(Number(value)) ? Number(value) : 1;
    safeSaveV10();
    applyAppSettingsV10();
  };
  window.toggleReducedMotionV10 = function(value){
    gameState.appSettingsV10.reducedMotion = Boolean(value);
    safeSaveV10();
    applyAppSettingsV10();
  };
  window.toggleAutoReadV10 = function(value){
    gameState.appSettingsV10.autoRead = Boolean(value);
    safeSaveV10();
  };
  window.toggleConfirmExitV10 = function(value){
    gameState.appSettingsV10.confirmExit = Boolean(value);
    safeSaveV10();
  };
  window.clearAllMistakesV10 = function(){
    const count = Object.keys(gameState.mistakes || {}).length;
    if (!count) return showToast("Il n’y a aucune erreur à effacer.");
    if (!confirm(`Effacer les ${count} erreur${count>1?"s":""} enregistrée${count>1?"s":""} ?`)) return;
    gameState.mistakes = {};
    safeSaveV10();
    refreshMistakeCountsV10();
    if (!document.getElementById("mistakeReviewScreen")?.classList.contains("hidden")) renderMistakeListV10();
    showToast("Les erreurs ont été effacées.");
  };
  window.resetAllProgressFromSettingsV10 = function(){
    if (!confirm("Réinitialiser toute la progression, les étoiles, les pièces, les erreurs et les statistiques ?")) return;
    return window.clearLumiKidsDataAndReload?.();
  };

  const previousOpenSettingsV10 = window.openSettingsPanel;
  if (typeof previousOpenSettingsV10 === "function") {
    window.openSettingsPanel = function(...args){
      const result = previousOpenSettingsV10.apply(this,args);
      applyAppSettingsV10();
      return result;
    };
  }
  applyAppSettingsV10();

  function activeExerciseVisibleV10(){
    const lessonVisible = !document.getElementById("lessonScreen")?.classList.contains("hidden");
    const practiceVisible = !document.getElementById("practiceLessonPanelV9")?.classList.contains("hidden");
    return Boolean(
      (lessonVisible && document.querySelector("#lessonContent .exercise-layout, #lessonContent .match-exercise, #lessonContent .practice-stage-v9, #lessonContent .history-missing-word-v9")) ||
      (practiceVisible && document.querySelector("#practiceLessonContentV9 .practice-stage-v9"))
    );
  }
  function mayLeaveExerciseV10(){
    if (!gameState.appSettingsV10.confirmExit || !activeExerciseVisibleV10()) return true;
    return confirm("Quitter cet exercice en cours ? La question actuelle devra être recommencée.");
  }

  const oldBackToLessonListV10 = window.backToLessonList;
  if (typeof oldBackToLessonListV10 === "function") {
    window.backToLessonList = function(...args){
      if (!mayLeaveExerciseV10()) return;
      return oldBackToLessonListV10.apply(this,args);
    };
  }
  const oldClosePracticeLessonV10 = window.closePracticeLessonV9;
  if (typeof oldClosePracticeLessonV10 === "function") {
    window.closePracticeLessonV9 = function(...args){
      if (!mayLeaveExerciseV10()) return;
      return oldClosePracticeLessonV10.apply(this,args);
    };
  }

  /* ---------------------------------------------------------
     DÉFIS QUOTIDIENS ET SÉRIES
  --------------------------------------------------------- */
  const DAILY_VARIANTS_V10 = [
    {kind:"exercise",target:3,text:"Termine 3 séries d’exercices",reward:12},
    {kind:"perfect",target:2,text:"Réussis 2 séries sans faute",reward:16},
    {kind:"practice",target:3,text:"Réussis 3 exercices complémentaires",reward:12},
    {kind:"mistake",target:2,text:"Corrige 2 erreurs enregistrées",reward:18}
  ];

  function ensureDailyChallengeV10(){
    ensureV10State();
    const today = dayKeyV10();
    if (!gameState.dailyChallenge || gameState.dailyChallenge.date !== today || gameState.dailyChallenge.version !== VERSION) {
      let variants = [...DAILY_VARIANTS_V10];
      if (!Object.keys(gameState.mistakes || {}).length) variants = variants.filter(item => item.kind !== "mistake");
      const hash = today.split("-").join("").split("").reduce((sum,n) => sum+Number(n),0);
      const chosen = variants[hash % variants.length];
      gameState.dailyChallenge = {
        version:VERSION,
        date:today,
        kind:chosen.kind,
        progress:0,
        target:chosen.target,
        text:chosen.text,
        rewardType:"coins",
        rewardAmount:chosen.reward,
        completed:false,
        claimed:false
      };
      safeSaveV10();
    }
    gameState.dailyChallenge.progress = Math.max(0,Math.min(
      Number(gameState.dailyChallenge.progress||0),
      Number(gameState.dailyChallenge.target||1)
    ));
    gameState.dailyChallenge.completed = gameState.dailyChallenge.progress >= gameState.dailyChallenge.target;
    return gameState.dailyChallenge;
  }

  function advanceDailyV10(kind,amount=1){
    const challenge = ensureDailyChallengeV10();
    if (challenge.claimed || challenge.kind !== kind) return;
    challenge.progress = Math.min(challenge.target,challenge.progress + Math.max(0,Number(amount)||0));
    challenge.completed = challenge.progress >= challenge.target;
    safeSaveV10();
    renderDailyChallenge();
    if (challenge.completed) showToast("Défi du jour terminé ! La récompense est disponible.");
  }

  ensureDailyChallenge = ensureDailyChallengeV10;
  incrementDailyChallenge = function(){ /* Les anciennes réponses unitaires ne comptent plus comme une série. */ };
  renderDailyChallenge = function(){
    const challenge = ensureDailyChallengeV10();
    const card = document.getElementById("dailyChallengeCard");
    const badge = document.getElementById("dailyRewardBadge");
    const status = document.getElementById("dailyChallengeStatus");
    const action = document.getElementById("dailyChallengeAction");
    const label = document.getElementById("dailyChallengeText");
    const milestone = document.getElementById("dailyMilestoneV10");
    setWidth("dailyChallengeBar",challenge.target ? challenge.progress/challenge.target*100 : 0);
    if (label) label.textContent = challenge.text;
    if (badge) badge.textContent = challenge.claimed ? "✓" : `🪙 ${challenge.rewardAmount}`;
    if (status) status.textContent = challenge.claimed ? "Récompense récupérée" : `${challenge.progress}/${challenge.target}`;
    if (action) action.textContent = challenge.claimed ? "Récupéré" : challenge.completed ? "Récupérer" : "En cours";
    if (milestone) {
      const count = Number(gameState.dailyStreakV10.count||0);
      const next = [3,7,14].find(value => value>count) || 14;
      milestone.textContent = `Série : ${count} jour${count>1?"s":""} · prochain bonus à ${next} jours`;
    }
    card?.classList.toggle("claimable",challenge.completed && !challenge.claimed);
    card?.classList.toggle("claimed",challenge.claimed);
  };

  claimDailyChallenge = function(){
    const challenge = ensureDailyChallengeV10();
    if (!challenge.completed || challenge.claimed) return;
    challenge.claimed = true;
    gameState.coins = Number(gameState.coins||0) + Number(challenge.rewardAmount||0);

    const streak = gameState.dailyStreakV10;
    const today = dayKeyV10();
    if (streak.lastClaimDate === yesterdayKeyV10()) streak.count = Number(streak.count||0)+1;
    else if (streak.lastClaimDate !== today) streak.count = 1;
    streak.lastClaimDate = today;

    let bonus = 0;
    const milestoneRewards = {3:15,7:35,14:80};
    if (milestoneRewards[streak.count] && !streak.milestones[streak.count]) {
      bonus = milestoneRewards[streak.count];
      streak.milestones[streak.count] = true;
      gameState.coins += bonus;
    }

    logActivityV10("daily","Défi quotidien terminé",`${challenge.text} · +${challenge.rewardAmount + bonus} pièces`);
    safeSaveV10();
    updateGameUi();
    animateRewardToCounter("coins",challenge.rewardAmount+bonus);
    showToast(bonus
      ? `Défi récupéré ! Bonus de série : +${bonus} pièces.`
      : `Défi récupéré : +${challenge.rewardAmount} pièces.`);
    checkAchievementsV10(true);
  };

  /* ---------------------------------------------------------
     PARCOURS D'ENTRAÎNEMENT : PROGRESSION ET REPRISE
  --------------------------------------------------------- */
  function practiceKeyIdV10(mode,key){ return `${mode}:${key}`; }
  function practiceStatsV10(mode,key){
    ensureV10State();
    const id = practiceKeyIdV10(mode,key);
    if (!gameState.practiceStatsV10[id]) {
      gameState.practiceStatsV10[id] = {
        completedTypes:{},
        totalCompleted:0,
        bestScore:0,
        totalErrors:0,
        lastExercise:"",
        lastPlayedAt:0
      };
    }
    return gameState.practiceStatsV10[id];
  }
  function completedPracticeTypesV10(mode,key){
    return Object.keys(practiceStatsV10(mode,key).completedTypes || {}).length;
  }
  function currentPracticeModeFromDomV10(){
    return document.getElementById("practiceSoundsTabV9")?.classList.contains("active") ? "sound" : "letter";
  }

  function decoratePracticeChooserV10(){
    const mode = currentPracticeModeFromDomV10();
    practiceContextV10.mode = mode;
    const keys = mode === "letter" ? ALL_LETTERS_V10 : [...soundKeys];
    const grid = document.getElementById("practiceLessonsGridV9");
    if (!grid) return;

    let summary = document.getElementById("practiceSummaryV10");
    if (!summary) {
      summary = document.createElement("section");
      summary.id = "practiceSummaryV10";
      summary.className = "practice-summary-v10";
      document.querySelector("#practiceChooserV9 .practice-intro-v9")?.after(summary);
    }
    const mastered = keys.filter(key => completedPracticeTypesV10(mode,key) === PRACTICE_TYPES_V10.length).length;
    const totalDone = keys.reduce((sum,key) => sum + completedPracticeTypesV10(mode,key),0);
    const resume = gameState.resumeV10?.kind === "practice" && gameState.resumeV10.mode === mode
      ? gameState.resumeV10 : null;
    summary.innerHTML = `
      <div><small>Progression du parcours</small><strong>${mastered} leçon${mastered>1?"s":""} maîtrisée${mastered>1?"s":""}</strong><span>${totalDone} activité${totalDone>1?"s":""} découverte${totalDone>1?"s":""}</span></div>
      <div class="practice-summary-track-v10"><i style="width:${keys.length ? mastered/keys.length*100 : 0}%"></i></div>
      ${resume ? `<button onclick="resumePracticeV10()">Reprendre ${escapeV10(resume.mode === "sound" ? `le son ${resume.key}` : `la lettre ${resume.key}`)} →</button>` : ""}`;

    [...grid.querySelectorAll(".practice-letter-card-v9")].forEach((card,index) => {
      const key = keys[index];
      if (!key) return;
      const stats = practiceStatsV10(mode,key);
      const done = completedPracticeTypesV10(mode,key);
      const status = done === PRACTICE_TYPES_V10.length ? "Maîtrisé" : done ? "En cours" : "À commencer";
      card.classList.toggle("v10-mastered",done === PRACTICE_TYPES_V10.length);
      card.classList.toggle("v10-started",done>0 && done<PRACTICE_TYPES_V10.length);
      card.querySelector(".practice-card-details-v10")?.remove();
      const detail = document.createElement("span");
      detail.className = "practice-card-details-v10";
      detail.innerHTML = `<b>${status}</b><em>${done}/${PRACTICE_TYPES_V10.length}</em><i><u style="width:${done/PRACTICE_TYPES_V10.length*100}%"></u></i>${stats.bestScore ? `<small>Meilleur : ${stats.bestScore}%</small>` : ""}`;
      card.appendChild(detail);
    });
  }

  function decoratePracticeLessonV10(){
    const content = document.getElementById("practiceLessonContentV9");
    if (!content || !content.querySelector(".practice-course-v9")) return;
    const stats = practiceStatsV10(practiceContextV10.mode,practiceContextV10.key);
    const done = completedPracticeTypesV10(practiceContextV10.mode,practiceContextV10.key);
    let panel = content.querySelector(".practice-lesson-progress-v10");
    if (!panel) {
      panel = document.createElement("section");
      panel.className = "practice-lesson-progress-v10";
      content.querySelector(".practice-course-v9")?.after(panel);
    }
    panel.innerHTML = `
      <div><small>Progression de cette leçon</small><strong>${done} / ${PRACTICE_TYPES_V10.length} activités</strong><span>${done === PRACTICE_TYPES_V10.length ? "Toutes les activités sont maîtrisées." : "Avance à ton rythme et améliore tes scores."}</span></div>
      <div class="practice-lesson-actions-v10">
        <button onclick="continuePracticeSeriesV10()">Continuer la série</button>
        <button class="secondary" onclick="restartPracticeSeriesV10()">Recommencer</button>
      </div>`;

    [...content.querySelectorAll(".practice-exercise-card-v9")].forEach((card,index) => {
      const type = PRACTICE_TYPES_V10[index]?.[0];
      if (!type) return;
      const result = stats.completedTypes?.[type];
      card.classList.toggle("completed-v10",Boolean(result));
      card.querySelector(".practice-exercise-status-v10")?.remove();
      const badge = document.createElement("span");
      badge.className = "practice-exercise-status-v10";
      badge.textContent = result ? `✓ ${result.bestScore}%` : "À faire";
      card.appendChild(badge);
    });
  }

  window.continuePracticeSeriesV10 = function(){
    const stats = practiceStatsV10(practiceContextV10.mode,practiceContextV10.key);
    const last = gameState.resumeV10?.kind === "practice" &&
      gameState.resumeV10.mode === practiceContextV10.mode &&
      gameState.resumeV10.key === practiceContextV10.key
        ? gameState.resumeV10.exercise : stats.lastExercise;
    const type = last || PRACTICE_TYPES_V10.find(item => !stats.completedTypes?.[item[0]])?.[0] || PRACTICE_TYPES_V10[0][0];
    startPracticeExerciseV9(type);
  };
  window.restartPracticeSeriesV10 = function(){
    if (!confirm("Recommencer la progression complémentaire de cette lettre ou de ce son ?")) return;
    gameState.practiceStatsV10[practiceKeyIdV10(practiceContextV10.mode,practiceContextV10.key)] = {
      completedTypes:{},totalCompleted:0,bestScore:0,totalErrors:0,lastExercise:"",lastPlayedAt:0
    };
    safeSaveV10();
    renderPracticeLessonV9();
    setTimeout(decoratePracticeLessonV10,0);
  };
  window.resumePracticeV10 = function(){
    const resume = gameState.resumeV10;
    if (!resume || resume.kind !== "practice") return showReadingExercisesHome("letter");
    showReadingExercisesHome(resume.mode);
    setTimeout(() => {
      openPracticeLessonV9(resume.mode,resume.key);
      setTimeout(() => resume.exercise && startPracticeExerciseV9(resume.exercise),40);
    },40);
  };

  function wrapV10(name,before,after){
    const original = window[name];
    if (typeof original !== "function" || original.__v10Wrapped) return;
    const wrapped = function(...args){
      let beforeResult;
      if (before) beforeResult = before.apply(this,args);
      if (beforeResult === false) return;
      const result = original.apply(this,args);
      if (after) after.call(this,result,args);
      return result;
    };
    wrapped.__v10Wrapped = true;
    wrapped.__v10Original = original;
    window[name] = wrapped;
  }

  wrapV10("showReadingExercisesHome",null,() => setTimeout(decoratePracticeChooserV10,0));
  wrapV10("setPracticeModeV9",function(mode){ practiceContextV10.mode = mode === "sound" ? "sound" : "letter"; },() => setTimeout(decoratePracticeChooserV10,0));
  wrapV10("openPracticeLessonV9",function(mode,key){
    practiceContextV10.mode = mode === "sound" ? "sound" : "letter";
    practiceContextV10.key = key;
  },() => setTimeout(decoratePracticeLessonV10,0));
  wrapV10("renderPracticeLessonV9",null,() => setTimeout(decoratePracticeLessonV10,0));
  wrapV10("closePracticeLessonV9",null,() => setTimeout(decoratePracticeChooserV10,0));
  wrapV10("startPracticeExerciseV9",function(type){
    practiceContextV10.type = type;
    practiceContextV10.coinsAtStart = Number(gameState.coins||0);
    practiceContextV10.resultHandled = false;
    const stats = practiceStatsV10(practiceContextV10.mode,practiceContextV10.key);
    stats.lastExercise = type;
    stats.lastPlayedAt = now();
    setResumeV10({kind:"practice",mode:practiceContextV10.mode,key:practiceContextV10.key,exercise:type});
    safeSaveV10();
  },null);

  function finalizePracticeResultV10(){
    const result = document.querySelector("#practiceLessonContentV9 .practice-result-v9");
    if (!result || result.dataset.v10Detailed === "true" || practiceContextV10.resultHandled) return;
    result.dataset.v10Detailed = "true";
    practiceContextV10.resultHandled = true;
    const text = result.textContent || "";
    const match = text.match(/après\s+(\d+)\s+erreur/i);
    const errors = match ? Number(match[1]) : 0;
    const score = Math.max(20,100-errors*20);
    const stats = practiceStatsV10(practiceContextV10.mode,practiceContextV10.key);
    const old = stats.completedTypes?.[practiceContextV10.type];
    stats.completedTypes[practiceContextV10.type] = {
      attempts:Number(old?.attempts||0)+1,
      bestErrors:old ? Math.min(Number(old.bestErrors??999),errors) : errors,
      bestScore:Math.max(Number(old?.bestScore||0),score),
      lastErrors:errors,
      completedAt:now()
    };
    stats.totalCompleted += 1;
    stats.totalErrors += errors;
    stats.bestScore = Math.max(Number(stats.bestScore||0),score);
    stats.lastExercise = practiceContextV10.type;
    stats.lastPlayedAt = now();

    gameState.analyticsV10.exercisesCompleted += 1;
    gameState.analyticsV10.practiceCompleted += 1;
    if (errors === 0) gameState.analyticsV10.perfectExercises += 1;
    const label = practiceContextV10.mode === "sound" ? `Son ${practiceContextV10.key}` : `Lettre ${practiceContextV10.key}`;
    const exerciseLabel = PRACTICE_TYPES_V10.find(item => item[0] === practiceContextV10.type)?.[1] || "Exercice";
    logActivityV10("practice",`${label} · ${exerciseLabel}`,`${score}% · ${errors} erreur${errors>1?"s":""}`);
    advanceDailyV10("exercise",1);
    advanceDailyV10("practice",1);
    if (errors === 0) advanceDailyV10("perfect",1);
    safeSaveV10();

    const detailed = document.createElement("div");
    detailed.className = "result-details-v10";
    detailed.innerHTML = `
      <article><small>Résultat</small><strong>${score}%</strong></article>
      <article><small>Erreurs</small><strong>${errors}</strong></article>
      <article><small>XP</small><strong>+5</strong></article>
      <article><small>Pièces</small><strong>+1</strong></article>`;
    result.querySelector(".practice-actions-v9")?.before(detailed);
    checkAchievementsV10(true);
    renderRewardsOverviewV10();
  }

  wrapV10("validatePracticeV9",null,() => setTimeout(finalizePracticeResultV10,0));
  wrapV10("nextPracticeQuestionV9",function(){ practiceContextV10.resultHandled = false; },null);

  /* ---------------------------------------------------------
     RÉSULTATS DÉTAILLÉS DU PARCOURS HISTOIRE
  --------------------------------------------------------- */
  function startHistoryContextV10(exercise){
    historyContextV10.type = currentLesson?.type || "letter";
    historyContextV10.key = currentLesson?.key || "A";
    historyContextV10.exercise = exercise;
    historyContextV10.correct = 0;
    historyContextV10.errors = 0;
    historyContextV10.coinsAtStart = Number(gameState.coins||0);
    historyContextV10.resultHandled = false;
    setResumeV10({kind:"history",type:historyContextV10.type,key:historyContextV10.key,part:exercise});
  }
  function countHistoryValidationV10(messageId){
    const message = document.getElementById(messageId);
    if (!message) return;
    if (message.classList.contains("good")) historyContextV10.correct += 1;
    if (message.classList.contains("bad") && /essaie encore/i.test(message.textContent||"")) historyContextV10.errors += 1;
  }

  wrapV10("startGuidedExerciseOne",function(){ startHistoryContextV10("exercise1"); });
  wrapV10("showMatchExercise",function(){ startHistoryContextV10("exercise2"); });
  wrapV10("showSoundSpellingExerciseV9",function(){ startHistoryContextV10("exercise2"); });
  wrapV10("showHistoryMissingLetterExerciseV9",function(){ startHistoryContextV10("exercise3"); });
  wrapV10("validateGuidedExerciseOne",null,() => countHistoryValidationV10("exerciseMessage"));
  wrapV10("validateGuidedMatch",null,() => countHistoryValidationV10("matchMessage"));
  wrapV10("validateSoundSpellingV9",null,() => countHistoryValidationV10("soundSpellingMessageV9"));

  const originalValidateMissingV10 = window.validateHistoryMissingV9;
  if (typeof originalValidateMissingV10 === "function") {
    window.validateHistoryMissingV9 = function(...args){
      const selected = document.querySelector("#lessonContent .history-choice-grid-v9 .practice-choice-v9.selected")?.textContent?.trim() || "";
      const audioButton = document.querySelector("#lessonContent .practice-prompt-v9 .practice-audio-v9");
      const onclick = audioButton?.getAttribute("onclick") || "";
      const encoded = onclick.match(/decodeURIComponent\('([^']+)'\)/)?.[1] || "";
      let word = "";
      try { word = decodeURIComponent(encoded); } catch { word = ""; }
      const result = originalValidateMissingV10.apply(this,args);
      countHistoryValidationV10("historyMissingMessageV9");
      const message = document.getElementById("historyMissingMessageV9");
      if (selected && message?.classList.contains("bad") && /essaie encore/i.test(message.textContent||"")) {
        window.rememberMistake?.({
          kind:"missing",
          lessonType:currentLesson.type,
          lessonKey:currentLesson.key,
          exerciseName:"exercise3",
          answer:String(currentLesson.key).toUpperCase(),
          word:word || currentLesson.words?.[0]?.word || "",
          audio:word || currentLesson.key
        });
      }
      return result;
    };
  }

  function lessonMistakesV10(type,key){
    return Object.values(gameState.mistakes||{}).filter(m => m.lessonType === type && m.lessonKey === key);
  }

  function decorateHistoryResultV10(){
    const panel = document.querySelector("#lessonContent .completion-panel");
    if (!panel || panel.dataset.v10Detailed === "true" || historyContextV10.resultHandled) return;
    panel.dataset.v10Detailed = "true";
    historyContextV10.resultHandled = true;
    const scoreText = panel.querySelector(".history-result-score-v9")?.textContent || panel.textContent || "";
    const score = Number(scoreText.match(/Résultat\s*:\s*(\d+)/i)?.[1] || 0);
    const errors = Math.max(0,historyContextV10.errors);
    const correct = Math.max(0,historyContextV10.correct);
    const coins = Math.max(0,Number(gameState.coins||0)-historyContextV10.coinsAtStart);
    const review = lessonMistakesV10(historyContextV10.type,historyContextV10.key);

    const details = document.createElement("section");
    details.className = "history-result-details-v10";
    details.innerHTML = `
      <div class="result-details-v10">
        <article><small>Bonnes réponses</small><strong>${correct}</strong></article>
        <article><small>Erreurs</small><strong>${errors}</strong></article>
        <article><small>Étoiles</small><strong>${score}/2</strong></article>
        <article><small>Pièces</small><strong>+${coins}</strong></article>
      </div>
      ${review.length ? `<div class="result-review-v10"><small>À revoir</small><p>${review.slice(0,4).map(m => escapeV10(m.word || m.answer)).join(" · ")}</p></div>` : `<div class="result-review-v10 success"><small>À revoir</small><p>Aucun mot ajouté aux erreurs.</p></div>`}`;
    panel.querySelector(".exercise-finish-actions")?.before(details);

    gameState.analyticsV10.exercisesCompleted += 1;
    gameState.analyticsV10.historyCompleted += 1;
    if (errors === 0) gameState.analyticsV10.perfectExercises += 1;
    const label = historyContextV10.type === "sound" ? `Son ${historyContextV10.key}` : `Lettre ${historyContextV10.key}`;
    logActivityV10("history",`${label} · ${historyContextV10.exercise.replace("exercise","Exercice ")}`,`${score}/2 étoiles · ${errors} erreur${errors>1?"s":""}`);
    advanceDailyV10("exercise",1);
    if (errors === 0) advanceDailyV10("perfect",1);

    const nextPart = historyContextV10.exercise === "exercise1" ? "exercise2" : historyContextV10.exercise === "exercise2" ? "exercise3" : null;
    if (nextPart) setResumeV10({kind:"history",type:historyContextV10.type,key:historyContextV10.key,part:nextPart});
    else setResumeV10(null);
    safeSaveV10();
    checkAchievementsV10(true);
  }

  const lessonContentV10 = document.getElementById("lessonContent");
  if (lessonContentV10) {
    new MutationObserver(() => setTimeout(decorateHistoryResultV10,0))
      .observe(lessonContentV10,{childList:true,subtree:true});
  }

  /* ---------------------------------------------------------
     REFAIRE MES ERREURS — FILTRES, CORRECTION GROUPÉE, AUDIO
  --------------------------------------------------------- */
  function mistakesV10(){
    return Object.values(gameState.mistakes||{}).sort((a,b) => Number(a.createdAt||0)-Number(b.createdAt||0));
  }
  function mistakeCategoryV10(m){
    if (m.kind === "math") return "math";
    if (m.kind === "word" || m.kind === "missing" || m.kind === "phrase") return "word";
    if (m.lessonType === "sound") return "sound";
    return "letter";
  }
  function filteredMistakesV10(){
    const list = mistakesV10();
    let filtered = mistakeFilterV10 === "all"
      ? list
      : list.filter(m => mistakeCategoryV10(m) === mistakeFilterV10);

    if (mistakeFilterV10 === "math" && mathMistakeOperationFilterV12 !== "all") {
      filtered = filtered.filter(m => mathMistakeOperationFilterV12 === "mixed"
        ? String(m.sourceMode || "") === "mixed"
        : String(m.operation || "mixed") === mathMistakeOperationFilterV12);
    }
    return filtered;
  }
  function mistakeLabelV10(m){
    if (m.kind === "math") {
      const labels = {
        addition:"Addition",
        subtraction:"Soustraction",
        comparison:"Comparaison",
        problem:"Petit problème",
        mixed:"Calcul mélangé"
      };
      return labels[String(m.operation || "mixed")] || "Calcul";
    }
    return m.lessonType === "sound" ? `Son ${m.lessonKey}` : `Lettre ${m.lessonKey}`;
  }
  function mistakeDescriptionV10(m){
    if (m.kind === "math") {
      const detail = m.story || m.equation || m.prompt || "Calcul à corriger";
      return `${detail}${m.givenAnswer !== undefined && m.givenAnswer !== "" ? ` · réponse donnée : ${m.givenAnswer}` : ""}`;
    }
    if (m.kind === "practice") {
      const detail = m.display || m.answer || "Question à refaire";
      return `${m.practiceTitle || "Exercice complémentaire"} · ${detail}`;
    }
    if (m.kind === "match") return `Associer le son « ${m.answer} » à la bonne syllabe`;
    if (m.kind === "missing") return `Compléter « ${m.word || "le mot"} » avec ${m.answer}`;
    if (m.kind === "phrase") return `Reconnaître la phrase « ${m.answer} »`;
    return `Reconnaître le mot « ${m.answer} »`;
  }
  function mistakeIconV10(m){
    if (m.kind === "math") {
      if (m.operation === "subtraction") return "−";
      if (m.operation === "comparison") return "≷";
      if (m.operation === "problem") return "🧩";
      if (m.operation === "mixed") return "±";
      return "＋";
    }
    if (m.kind === "practice") return "🎯";
    if (m.kind === "match") return "♫";
    if (m.kind === "missing") return "□";
    if (m.kind === "phrase") return "💬";
    return "Aa";
  }

  function refreshMistakeCountsV10(){
    const count = mistakesV10().length;
    setText("homeMistakeCount",`${count} erreur${count>1?"s":""}`);
    setText("mistakeReviewCount",`${count} erreur${count>1?"s":""}`);
    setText("mistakeRecoveredCount",Number(gameState.mistakesRecovered||0));
    const button = document.getElementById("mistakeReviewHomeButton");
    button?.classList.toggle("no-mistakes",count===0);
  }

  window.setMistakeFilterV10 = function(filter){
    mistakeFilterV10 = ["all","letter","sound","word","math"].includes(filter) ? filter : "all";
    if (mistakeFilterV10 !== "math") mathMistakeOperationFilterV12 = "all";
    document.querySelectorAll(".mistake-filters-v10 button").forEach(button => {
      button.classList.toggle("active",button.dataset.filter === mistakeFilterV10);
    });
    renderMistakeListV10();
  };

  window.setMathMistakeOperationFilterV12 = function(filter){
    const allowed = ["all","addition","subtraction","comparison","problem","mixed"];
    mathMistakeOperationFilterV12 = allowed.includes(filter) ? filter : "all";
    document.querySelectorAll("#mathMistakeFiltersV12 button").forEach(button => {
      button.classList.toggle("active",button.dataset.operation === mathMistakeOperationFilterV12);
    });
    renderMistakeListV10();
  };

  function renderMistakeListV10(){
    activeMistakeV10 = null;
    selectedMistakeV10 = "";
    refreshMistakeCountsV10();
    const content = document.getElementById("mistakeReviewContent");
    const list = filteredMistakesV10();
    const allCount = mistakesV10().length;
    const correctAll = document.getElementById("correctAllMistakesV10");
    if (correctAll) correctAll.disabled = allCount === 0;
    if (!content) return;

    let mathFilters = document.getElementById("mathMistakeFiltersV12");
    if (mistakeFilterV10 === "math") {
      if (!mathFilters) {
        mathFilters = document.createElement("div");
        mathFilters.id = "mathMistakeFiltersV12";
        mathFilters.className = "math-mistake-filters-v12";
        content.parentElement?.insertBefore(mathFilters,content);
      }
      const operations = [
        ["all","Tous les calculs"],
        ["addition","Additions"],
        ["subtraction","Soustractions"],
        ["comparison","Comparaisons"],
        ["problem","Problèmes"],
        ["mixed","Mélangés"]
      ];
      mathFilters.innerHTML = operations.map(([key,label]) =>
        `<button data-operation="${key}" class="${mathMistakeOperationFilterV12===key?"active":""}" onclick="setMathMistakeOperationFilterV12('${key}')">${label}</button>`
      ).join("");
      mathFilters.classList.remove("hidden");
    } else if (mathFilters) {
      mathFilters.classList.add("hidden");
    }

    if (!list.length) {
      content.innerHTML = `<div class="mistake-empty">
        <div class="mistake-empty-icon">✓</div>
        <h3>${allCount ? "Aucune erreur dans ce filtre" : "Tout est corrigé !"}</h3>
        <p>${allCount ? "Choisis un autre filtre pour voir les erreurs restantes." : "Tu n’as plus aucune erreur à refaire. Bravo !"}</p>
      </div>`;
      return;
    }
    content.innerHTML = list.map(m => `<article class="mistake-card v10-mistake-card" data-kind="${escapeV10(mistakeCategoryV10(m))}">
      <div class="mistake-card-icon">${mistakeIconV10(m)}</div>
      <div><small>${escapeV10(mistakeLabelV10(m))}</small><strong>${escapeV10(mistakeDescriptionV10(m))}</strong><p>${Number(m.attempts||1)} essai${Number(m.attempts||1)>1?"s":""}</p></div>
      <button onclick="openMistakeQuestion('${escapeV10(m.id)}')">Corriger</button>
    </article>`).join("");
  }

  function lessonForMistakeV10(m){
    return m.lessonType === "sound" ? soundLessons[m.lessonKey] : letterLessons[m.lessonKey];
  }
  function choicesWithAnswerV11(answer,pool,maxChoices=4){
    const expected = String(answer ?? "");
    const seen = new Set([normalizeV10(expected)]);
    const distractors = [];
    shuffleArray([...(pool || [])]).forEach(value => {
      const normalized = normalizeV10(value);
      if (!normalized || seen.has(normalized) || distractors.length >= maxChoices-1) return;
      seen.add(normalized);
      distractors.push(String(value));
    });
    return shuffleArray([expected,...distractors]);
  }
  function buildMistakeChoicesV10(m){
    if (m.kind === "practice") {
      return choicesWithAnswerV11(m.answer,Array.isArray(m.choices) ? m.choices : [],4);
    }
    if (m.kind === "match") {
      const values = lessonForMistakeV10(m)?.syllables?.map(item => item.syllable) || [];
      return choicesWithAnswerV11(m.answer,values,4);
    }
    if (m.kind === "missing") {
      const pool = m.lessonType === "sound" ? [...soundKeys].map(String) : [...ALL_LETTERS_V10];
      return choicesWithAnswerV11(m.answer,pool,4);
    }
    if (m.kind === "phrase") {
      const phrases = lessonForMistakeV10(m)?.phrases || [];
      return choicesWithAnswerV11(m.answer,phrases,4);
    }
    const words = lessonForMistakeV10(m)?.words?.map(item => item.word) || [];
    const globalWords = Object.values(letterLessons).flatMap(lesson => lesson.words||[]).map(item => item.word);
    return choicesWithAnswerV11(m.answer,[...words,...globalWords],4);
  }
  function blankMistakeWordV10(word,target){
    const raw = String(word||"");
    const lower = raw.toLocaleLowerCase("fr");
    const wanted = String(target||"").toLocaleLowerCase("fr");
    const index = lower.indexOf(wanted);
    if (index<0) return `□${escapeV10(raw)}`;
    return `${escapeV10(raw.slice(0,index))}<span>${"□".repeat(Math.max(1,wanted.length))}</span>${escapeV10(raw.slice(index+wanted.length))}`;
  }

  window.openMistakeQuestion = function(id){
    const mistake = gameState.mistakes?.[id];
    if (!mistake) return renderMistakeListV10();
    activeMistakeV10 = mistake;
    selectedMistakeV10 = "";
    selectedMistakeTokensV10 = [];
    const content = document.getElementById("mistakeReviewContent");
    if (!content) return;

    if (mistake.kind === "math") {
      const isChoice = mistake.answerType === "choice" || mistake.answerType === "comparison";
      const choices = mistake.answerType === "comparison"
        ? [">","<","="]
        : Array.isArray(mistake.choices) && mistake.choices.length
          ? choicesWithAnswerV11(mistake.correct ?? mistake.answer,mistake.choices,4)
          : [];
      const questionText = mistake.story || mistake.prompt || "Résous ce calcul.";
      const equation = mistake.equation
        ? `<div class="math-mistake-equation-v12">${escapeV10(mistake.equation)}</div>`
        : "";
      const answerArea = isChoice
        ? `<div class="mistake-review-choices math-choice-review-v12">${choices.map(choice => `<button onclick="selectMistakeAnswerV10(this,decodeURIComponent('${encV10(choice)}'))">${escapeV10(choice)}</button>`).join("")}</div>`
        : `<input id="mistakeMathAnswerV10" type="number" inputmode="numeric" placeholder="Ta réponse">`;

      content.innerHTML = `<section class="mistake-question-panel v10-question-panel math-mistake-question-v12">
        <div class="mistake-question-top"><small>${escapeV10(mistakeLabelV10(mistake))}</small><span>À corriger</span></div>
        <h3 class="mistake-question-title">${escapeV10(questionText)}</h3>
        ${equation}
        ${answerArea}
        <div id="mistakeMessageV10" class="message"></div>
        <div class="mistake-review-actions"><button onclick="validateMistakeAnswer()">Valider</button><button class="secondary" onclick="renderMistakeListV10()">Retour à la liste</button></div>
      </section>`;
      document.getElementById("mistakeMathAnswerV10")?.addEventListener("keydown",event => event.key==="Enter" && validateMistakeAnswer());
      if (gameState.appSettingsV10.autoRead && questionText) setTimeout(() => speak(questionText),180);
      return;
    }

    if (mistake.kind === "practice") {
      const tokenValues = Array.isArray(mistake.tokens) ? mistake.tokens : [];
      const choices = buildMistakeChoicesV10(mistake);
      let answerArea = "";
      if (mistake.input) {
        answerArea = `<input id="mistakePracticeInputV10" class="practice-input-v9" autocomplete="off" placeholder="Écris ta réponse">`;
      } else if (tokenValues.length) {
        answerArea = `<div id="mistakeBuiltAnswerV10" class="practice-built-answer-v9 empty">Clique sur les éléments dans le bon ordre.</div>
          <div class="mistake-review-choices practice-token-choices-v11">${shuffleArray(tokenValues.map(String)).map((value,index) => `<button onclick="selectMistakeTokenV10(this,decodeURIComponent('${encV10(value)}'))" data-token-index="${index}">${escapeV10(value)}</button>`).join("")}</div>
          <button class="secondary" onclick="undoMistakeTokenV10()">Effacer le dernier</button>`;
      } else {
        answerArea = `<div class="mistake-review-choices">${choices.map(choice => `<button onclick="selectMistakeAnswerV10(this,decodeURIComponent('${encV10(choice)}'))">${escapeV10(choice)}</button>`).join("")}</div>`;
      }

      content.innerHTML = `<section class="mistake-question-panel v10-question-panel">
        <div class="mistake-question-top"><small>${escapeV10(mistakeLabelV10(mistake))}</small><span>Exercice complémentaire</span></div>
        <h3 class="mistake-question-title">${escapeV10(mistake.practiceTitle || "Exercice à refaire")}</h3>
        <p>${escapeV10(mistake.prompt || "Réponds à la question.")}</p>
        ${mistake.display ? `<div class="mistake-missing-word-v10">${escapeV10(mistake.display)}</div>` : ""}
        ${mistake.audio ? `<button class="btn primary" onclick="speak(decodeURIComponent('${encV10(mistake.audio)}'))">🔊 Écouter</button>` : ""}
        ${answerArea}
        <div id="mistakeMessageV10" class="message"></div>
        <div class="mistake-review-actions"><button onclick="validateMistakeAnswer()">Valider</button><button class="secondary" onclick="renderMistakeListV10()">Retour à la liste</button></div>
      </section>`;
      document.getElementById("mistakePracticeInputV10")?.addEventListener("keydown",event => event.key==="Enter" && validateMistakeAnswer());
      if (gameState.appSettingsV10.autoRead) {
        const spoken = mistake.audio ? `${mistake.prompt || ""} ${mistake.audio}` : (mistake.prompt || "");
        if (spoken.trim()) setTimeout(() => speak(spoken),180);
      }
      return;
    }

    const choices = buildMistakeChoicesV10(mistake);
    const prompt = mistake.kind === "match" ? "Écoute puis choisis la bonne syllabe"
      : mistake.kind === "missing" ? "Écoute puis complète le mot"
      : mistake.kind === "phrase" ? "Écoute puis choisis la bonne phrase"
      : "Écoute puis choisis le bon mot";
    const display = mistake.kind === "missing"
      ? `<div class="mistake-missing-word-v10">${blankMistakeWordV10(mistake.word,mistake.answer)}</div>` : "";
    content.innerHTML = `<section class="mistake-question-panel v10-question-panel">
      <div class="mistake-question-top"><small>${escapeV10(mistakeLabelV10(mistake))}</small><span>Une étoile à récupérer</span></div>
      <h3 class="mistake-question-title">${escapeV10(prompt)}</h3>
      ${display}
      <button class="btn primary" onclick="speak(decodeURIComponent('${encV10(mistake.audio||mistake.word||mistake.answer)}'))">🔊 Écouter</button>
      <div class="mistake-review-choices">${choices.map(choice => `<button onclick="selectMistakeAnswerV10(this,decodeURIComponent('${encV10(choice)}'))">${escapeV10(choice)}</button>`).join("")}</div>
      <div id="mistakeMessageV10" class="message"></div>
      <div class="mistake-review-actions"><button onclick="validateMistakeAnswer()">Valider</button><button class="secondary" onclick="renderMistakeListV10()">Retour à la liste</button></div>
    </section>`;
    if (gameState.appSettingsV10.autoRead) setTimeout(() => speak(mistake.audio||mistake.word||mistake.answer),180);
  };

  window.selectMistakeAnswerV10 = function(button,value){
    selectedMistakeV10 = value;
    document.querySelectorAll(".mistake-review-choices button").forEach(item => item.classList.remove("selected"));
    button?.classList.add("selected");
  };

  function updateMistakeBuiltAnswerV10(){
    const box = document.getElementById("mistakeBuiltAnswerV10");
    if (!box) return;
    box.textContent = selectedMistakeTokensV10.length
      ? selectedMistakeTokensV10.map(item => item.value).join(" ")
      : "Clique sur les éléments dans le bon ordre.";
    box.classList.toggle("empty",selectedMistakeTokensV10.length === 0);
  }
  window.selectMistakeTokenV10 = function(button,value){
    if (!button || button.disabled) return;
    selectedMistakeTokensV10.push({value,button});
    button.disabled = true;
    updateMistakeBuiltAnswerV10();
  };
  window.undoMistakeTokenV10 = function(){
    const last = selectedMistakeTokensV10.pop();
    if (last?.button) last.button.disabled = false;
    updateMistakeBuiltAnswerV10();
  };

  function recoverMistakeRewardV10(mistake){
    let gainedStars = 0;
    let gainedCoins = 0;
    if (mistake.kind === "math") {
      gameState.coins = Number(gameState.coins||0)+1;
      gainedCoins = 1;
    } else if (mistake.exerciseName && mistake.lessonType && mistake.lessonKey) {
      const progress = getProgress(mistake.lessonType,mistake.lessonKey);
      if (!progress.exerciseRewards) progress.exerciseRewards = {};
      const current = Math.max(0,Math.min(2,Number(progress.exerciseRewards[mistake.exerciseName]||0)));
      if (current < 2) {
        progress.exerciseRewards[mistake.exerciseName] = current+1;
        progress[mistake.exerciseName+"Stars"] = current+1;
        gameState.stars = Number(gameState.stars||0)+1;
        gameState.totalStarsEarned = Number(gameState.totalStarsEarned||0)+1;
        gainedStars = 1;
      }
    }
    return {gainedStars,gainedCoins};
  }

  window.validateMistakeAnswer = function(){
    const mistake = activeMistakeV10;
    if (!mistake) return renderMistakeListV10();
    const message = document.getElementById("mistakeMessageV10");
    let answer = selectedMistakeV10;
    if (mistake.kind === "math" && mistake.answerType !== "choice" && mistake.answerType !== "comparison") {
      answer = document.getElementById("mistakeMathAnswerV10")?.value || "";
    }
    if (mistake.kind === "practice" && mistake.input) {
      answer = document.getElementById("mistakePracticeInputV10")?.value || "";
    } else if (mistake.kind === "practice" && Array.isArray(mistake.tokens) && mistake.tokens.length) {
      answer = selectedMistakeTokensV10.map(item => item.value).join(" ");
    }
    if (!String(answer).trim()) {
      if (message) { message.textContent="Choisis ou écris une réponse."; message.className="message bad"; }
      return;
    }
    const expected = mistake.correct ?? mistake.answer;
    const mathAnswerMatches = mistake.kind === "math"
      ? (mistake.answerType === "comparison"
          ? String(answer).trim() === String(expected).trim()
          : mistake.answerType === "choice"
            ? normalizeV10(answer) === normalizeV10(expected)
            : Number(answer) === Number(expected))
      : normalizeV10(answer) === normalizeV10(expected);
    if (!mathAnswerMatches) {
      mistake.attempts = Number(mistake.attempts||0)+1;
      mistake.updatedAt = now();
      safeSaveV10();
      window.LumiAudio?.playWrong?.();
      if (message) { message.textContent="Essaie encore."; message.className="message bad"; }
      return;
    }

    const reward = recoverMistakeRewardV10(mistake);
    delete gameState.mistakes[mistake.id];
    gameState.mistakesRecovered = Number(gameState.mistakesRecovered||0)+1;
    logActivityV10("mistake","Erreur corrigée",mistakeDescriptionV10(mistake));
    advanceDailyV10("mistake",1);
    safeSaveV10();
    updateGameUi();
    window.LumiAudio?.playCorrect?.();
    if (!gameState.appSettingsV10.reducedMotion) createConfetti();
    refreshMistakeCountsV10();

    const content = document.getElementById("mistakeReviewContent");
    const remaining = filteredMistakesV10();
    if (content) content.innerHTML = `<section class="mistake-corrected-v10">
      <div>✓</div><h3>Erreur corrigée !</h3>
      <p>${mistake.kind === "practice" ? "Cette erreur complémentaire est retirée de ta liste." : reward.gainedStars ? "Tu récupères 1 étoile." : reward.gainedCoins ? "Tu gagnes 1 pièce." : "Ton meilleur résultat était déjà complet."}</p>
      <div class="mistake-review-actions">
        ${remaining.length ? `<button onclick="openMistakeQuestion('${escapeV10(remaining[0].id)}')">Corriger l’erreur suivante</button>` : ""}
        <button class="secondary" onclick="renderMistakeListV10()">Retour à la liste</button>
      </div>
    </section>`;
    const notice = document.getElementById("mistakeRecoveryNoticeV10");
    if (notice) {
      notice.textContent = mistake.kind === "practice" ? "Erreur complémentaire corrigée" : reward.gainedStars ? "+1 étoile récupérée" : reward.gainedCoins ? "+1 pièce" : "Erreur supprimée";
      notice.classList.remove("hidden");
      setTimeout(() => notice.classList.add("hidden"),1800);
    }
    activeMistakeV10 = null;
    selectedMistakeV10 = "";
    selectedMistakeTokensV10 = [];
    if (correctionQueueV10 && remaining.length) {
      setTimeout(() => openMistakeQuestion(remaining[0].id),650);
    } else if (!remaining.length) correctionQueueV10 = false;
    checkAchievementsV10(true);
  };

  window.renderMistakeListV10 = renderMistakeListV10;
  window.correctAllMistakesV10 = function(){
    const list = filteredMistakesV10();
    if (!list.length) return showToast("Aucune erreur dans cette liste.");
    correctionQueueV10 = true;
    openMistakeQuestion(list[0].id);
  };
  window.showMistakeReview = function(){
    window.LumiAudio?.stopBackground?.(true);
    hideAllScreens();
    document.getElementById("mistakeReviewScreen")?.classList.remove("hidden");
    correctionQueueV10 = false;
    renderMistakeListV10();
  };

  /* ---------------------------------------------------------
     TABLEAU DE BORD PARENTS
  --------------------------------------------------------- */
  function completedLettersV10(){ return activeLetters.filter(letter => isLessonCompleted("letter",letter)).length; }
  function completedSoundsV10(){ return soundKeys.filter(sound => isLessonCompleted("sound",sound)).length; }
  function completedWorldsV10(){
    return Object.values(letterChapters).filter(chapter => chapter.letters.every(letter => isLessonCompleted("letter",letter))).length;
  }
  function difficultyDataV10(){
    const groups = new Map();
    mistakesV10().forEach(m => {
      const mathOperation = m.kind === "math" ? String(m.operation || "mixed") : "";
      const key = m.kind === "math"
        ? `math:${mathOperation}`
        : `${m.lessonType||"general"}:${m.lessonKey||"?"}`;
      const mathLabels = {
        addition:"Additions",
        subtraction:"Soustractions",
        comparison:"Comparaisons",
        problem:"Petits problèmes",
        mixed:"Calculs mélangés"
      };
      const label = m.kind === "math"
        ? (mathLabels[mathOperation] || "Calculs")
        : m.lessonType === "sound" ? `Son ${m.lessonKey}` : `Lettre ${m.lessonKey}`;
      const old = groups.get(key) || {label,count:0,examples:[]};
      old.count += Number(m.attempts||1);
      const example = m.kind === "math" ? (m.equation || m.prompt || m.answer) : m.answer;
      if (example && !old.examples.includes(example)) old.examples.push(example);
      groups.set(key,old);
    });
    Object.entries(gameState.practiceStatsV10||{}).forEach(([key,stats]) => {
      const errors = Number(stats.totalErrors||0);
      if (!errors) return;
      const [mode,value] = key.split(":");
      const label = mode === "sound" ? `Son ${value}` : `Lettre ${value}`;
      const old = groups.get(key) || {label,count:0,examples:[]};
      old.count += Math.min(errors,10);
      groups.set(key,old);
    });
    return [...groups.values()].sort((a,b) => b.count-a.count).slice(0,4);
  }
  function relativeTimeV10(timestamp){
    const diff = Math.max(0,now()-Number(timestamp||0));
    const min = Math.floor(diff/60000);
    if (min<1) return "à l’instant";
    if (min<60) return `il y a ${min} min`;
    const hours = Math.floor(min/60);
    if (hours<24) return `il y a ${hours} h`;
    const days = Math.floor(hours/24);
    return `il y a ${days} jour${days>1?"s":""}`;
  }

  function renderParentDashboardV10(){
    ensureV10State();
    setText("parentPlayTimeV10",formatDurationV10(gameState.analyticsV10.sessionSeconds));
    setText("parentExercisesV10",gameState.analyticsV10.exercisesCompleted);
    setText("parentCorrectedV10",Number(gameState.mistakesRecovered||0));
    setText("parentSoundsMasteredV10",`${completedSoundsV10()} / ${soundKeys.length}`);

    const difficulties = document.getElementById("parentDifficultiesV10");
    const data = difficultyDataV10();
    if (difficulties) difficulties.innerHTML = data.length ? data.map((item,index) => `<article>
      <span>${index+1}</span><div><strong>${escapeV10(item.label)}</strong><p>${item.examples.length ? `À retravailler : ${item.examples.slice(0,3).map(escapeV10).join(" · ")}` : "Plusieurs essais ont été nécessaires."}</p></div><b>${item.count}</b>
    </article>`).join("") : `<div class="parent-empty-v10">Aucune difficulté importante détectée pour le moment.</div>`;

    const recent = document.getElementById("parentRecentActivitiesV10");
    const activities = gameState.analyticsV10.activityLog.slice(0,7);
    if (recent) recent.innerHTML = activities.length ? activities.map(item => `<article>
      <span>${item.kind === "mistake" ? "↻" : item.kind === "practice" ? "★" : item.kind === "daily" ? "🔥" : "✓"}</span>
      <div><strong>${escapeV10(item.title)}</strong><p>${escapeV10(item.detail)}</p></div><time>${relativeTimeV10(item.at)}</time>
    </article>`).join("") : `<div class="parent-empty-v10">Les prochaines activités apparaîtront ici.</div>`;

    const kingdoms = document.getElementById("parentKingdomProgressV10");
    if (kingdoms) kingdoms.innerHTML = Object.entries(letterChapters).map(([chapterNumber,chapter]) => {
      const completed = chapter.letters.filter(letter => isLessonCompleted("letter",letter)).length;
      const stars = chapter.letters.reduce((sum,letter) => sum + Number(getTotalLessonStars("letter",letter)||0),0);
      const max = chapter.letters.length*6;
      return `<article><div><small>Royaume ${escapeV10(chapterNumber)}</small><strong>${escapeV10(chapter.name || chapter.shortName || `Royaume ${chapterNumber}`)}</strong><span>${completed}/${chapter.letters.length} lettres · ${stars}/${max} étoiles</span></div><i><u style="width:${chapter.letters.length ? completed/chapter.letters.length*100 : 0}%"></u></i></article>`;
    }).join("");
    renderParentMathV12();
  }


  /* ---------------------------------------------------------
     MATHS V12 — ÉTAT, STATISTIQUES, REPRISE ET ESPACE PARENTS
  --------------------------------------------------------- */
  const MATH_OPERATION_LABELS_V12 = {
    addition:"Additions",
    subtraction:"Soustractions",
    comparison:"Comparaisons",
    problem:"Petits problèmes",
    mixed:"Calculs mélangés"
  };

  function ensureMathStatsV12(){
    if (!gameState.mathStatsV12) {
      gameState.mathStatsV12 = {
        version:"12.0",
        totalQuestions:0,
        correct:0,
        wrong:0,
        seriesCompleted:0,
        perfectSeries:0,
        bestStreak:0,
        currentStreak:0,
        streakBonuses:0,
        byOperation:{},
        difficultNumbers:{},
        recentErrors:[]
      };
    }
    const stats = gameState.mathStatsV12;
    ["totalQuestions","correct","wrong","seriesCompleted","perfectSeries","bestStreak","currentStreak","streakBonuses"]
      .forEach(key => stats[key] = Number(stats[key] || 0));
    if (!stats.byOperation) stats.byOperation = {};
    if (!stats.difficultNumbers) stats.difficultNumbers = {};
    if (!Array.isArray(stats.recentErrors)) stats.recentErrors = [];

    ["addition","subtraction","comparison","problem","mixed"].forEach(operation => {
      if (!stats.byOperation[operation]) {
        stats.byOperation[operation] = {
          questions:0,correct:0,wrong:0,series:0,bestScore:0,lastPlayedAt:0
        };
      }
      const item = stats.byOperation[operation];
      ["questions","correct","wrong","series","bestScore","lastPlayedAt"]
        .forEach(key => item[key] = Number(item[key] || 0));
    });

    if (!gameState.mathSettingsV12) {
      gameState.mathSettingsV12 = {
        operation:"addition",
        max:15,
        allowMissing:true,
        questionCount:10,
        adaptive:true,
        visualAid:"objects"
      };
    }
    return stats;
  }

  function mathOperationStatsV12(operation){
    const stats = ensureMathStatsV12();
    const key = MATH_OPERATION_LABELS_V12[operation] ? operation : "mixed";
    return stats.byOperation[key];
  }

  function mathAccuracyV12(item){
    return item?.questions ? Math.round(Number(item.correct||0)/Number(item.questions||1)*100) : 0;
  }

  function recordMathAnswerV12(payload = {}){
    const stats = ensureMathStatsV12();
    const operation = MATH_OPERATION_LABELS_V12[payload.operation] ? payload.operation : "mixed";
    const item = mathOperationStatsV12(operation);
    const correct = Boolean(payload.correct);
    const coins = correct ? Math.max(0,Number(payload.coins||0)) : 0;

    stats.totalQuestions += 1;
    item.questions += 1;
    item.lastPlayedAt = now();
    gameState.totalAnswers = Number(gameState.totalAnswers||0)+1;

    let streakBonus = 0;
    if (correct) {
      stats.correct += 1;
      item.correct += 1;
      stats.currentStreak += 1;
      stats.bestStreak = Math.max(stats.bestStreak,stats.currentStreak);
      gameState.correctAnswers = Number(gameState.correctAnswers||0)+1;
      gameState.coins = Number(gameState.coins||0)+coins;

      if (stats.currentStreak > 0 && stats.currentStreak % 5 === 0) {
        streakBonus = 5;
        stats.streakBonuses += 1;
        gameState.coins += streakBonus;
      }
    } else {
      stats.wrong += 1;
      item.wrong += 1;
      stats.currentStreak = 0;
      const numbers = [payload.a,payload.b,payload.result,payload.correctAnswer]
        .map(Number).filter(Number.isFinite);
      numbers.forEach(number => {
        stats.difficultNumbers[number] = Number(stats.difficultNumbers[number]||0)+1;
      });
      stats.recentErrors.unshift({
        operation,
        prompt:String(payload.prompt||payload.equation||"Calcul"),
        equation:String(payload.equation||""),
        givenAnswer:String(payload.givenAnswer??""),
        expected:String(payload.correctAnswer??""),
        at:now()
      });
      stats.recentErrors = stats.recentErrors.slice(0,20);
    }

    gameState.lastActivity = "math";
    safeSaveV10();
    updateGameUi();
    return {
      streak:stats.currentStreak,
      bestStreak:stats.bestStreak,
      streakBonus
    };
  }

  function recordMathSeriesV12(summary = {}){
    const stats = ensureMathStatsV12();
    const operation = MATH_OPERATION_LABELS_V12[summary.operation] ? summary.operation : "mixed";
    const item = mathOperationStatsV12(operation);
    const total = Math.max(1,Number(summary.total||1));
    const score = Math.max(0,Number(summary.score||0));
    const percent = Math.round(score/total*100);

    stats.seriesCompleted += 1;
    item.series += 1;
    item.bestScore = Math.max(item.bestScore,percent);
    if (Number(summary.errors||0) === 0) stats.perfectSeries += 1;

    gameState.analyticsV10.exercisesCompleted += 1;
    if (Number(summary.errors||0) === 0) gameState.analyticsV10.perfectExercises += 1;
    logActivityV10(
      "math",
      `${MATH_OPERATION_LABELS_V12[operation]} · série terminée`,
      `${score}/${total} du premier coup · ${Number(summary.errors||0)} erreur${Number(summary.errors||0)>1?"s":""}`
    );
    advanceDailyV10("exercise",1);
    if (Number(summary.errors||0) === 0) advanceDailyV10("perfect",1);
    setResumeV10(null);
    safeSaveV10();
    checkAchievementsV10(true);
  }

  function saveMathSettingsV12(settings = {}){
    ensureMathStatsV12();
    gameState.mathSettingsV12 = {
      ...gameState.mathSettingsV12,
      ...settings
    };
    safeSaveV10();
    return {...gameState.mathSettingsV12};
  }

  function saveMathResumeV12(data = {}){
    setResumeV10({kind:"math",...data});
  }

  function rememberMathMistakeV12(data = {}){
    const correct = data.correct ?? data.answer;
    const operation = MATH_OPERATION_LABELS_V12[data.operation] ? data.operation : "mixed";
    const stable = normalizeV10(data.equation || data.story || data.prompt || `${operation}-${correct}`);
    return window.rememberMistake?.({
      ...data,
      id:data.id || `math:${operation}:${data.questionType||"calculation"}:${stable}`,
      kind:"math",
      operation,
      answer:String(correct ?? ""),
      correct:String(correct ?? "")
    });
  }

  window.LumiKidsMathBridge = {
    getSettings(){
      ensureMathStatsV12();
      return {...gameState.mathSettingsV12};
    },
    saveSettings:saveMathSettingsV12,
    saveResume:saveMathResumeV12,
    rememberMistake:rememberMathMistakeV12,
    recordAnswer:recordMathAnswerV12,
    recordSeries:recordMathSeriesV12,
    getStats(){
      ensureMathStatsV12();
      return JSON.parse(JSON.stringify(gameState.mathStatsV12));
    },
    countMistakes(operation = "all"){
      return mistakesV10().filter(m => {
        if (m.kind !== "math") return false;
        if (operation === "all") return true;
        if (operation === "mixed") return String(m.sourceMode||"") === "mixed";
        return String(m.operation||"mixed") === operation;
      }).length;
    }
  };

  function renderParentMathV12(){
    ensureMathStatsV12();
    const parent = document.getElementById("parentScreen");
    if (!parent) return;

    let section = document.getElementById("parentMathProgressV12");
    if (!section) {
      section = document.createElement("section");
      section.id = "parentMathProgressV12";
      section.className = "parent-section-v10 parent-math-section-v12";
      const kingdomSection = document.getElementById("parentKingdomProgressV10")?.closest(".parent-section-v10");
      if (kingdomSection) kingdomSection.before(section);
      else parent.appendChild(section);
    }

    const stats = gameState.mathStatsV12;
    const overall = stats.totalQuestions ? Math.round(stats.correct/stats.totalQuestions*100) : 0;
    const difficult = Object.entries(stats.difficultNumbers||{})
      .sort((a,b) => Number(b[1])-Number(a[1]))
      .slice(0,5);

    section.innerHTML = `
      <div class="parent-section-title-v10">
        <div><small>Univers maths</small><h3>Progression en calcul</h3></div>
        <span class="parent-math-overall-v12">${overall}% de réussite</span>
      </div>
      <div class="parent-math-summary-v12">
        <article><span>🧮</span><strong>${stats.totalQuestions}</strong><small>questions répondues</small></article>
        <article><span>🏁</span><strong>${stats.seriesCompleted}</strong><small>séries terminées</small></article>
        <article><span>🔥</span><strong>${stats.bestStreak}</strong><small>meilleure série</small></article>
        <article><span>✓</span><strong>${stats.perfectSeries}</strong><small>séries sans faute</small></article>
      </div>
      <div class="parent-math-operations-v12">
        ${Object.entries(MATH_OPERATION_LABELS_V12).map(([key,label]) => {
          const item = stats.byOperation[key];
          const accuracy = mathAccuracyV12(item);
          return `<article>
            <div><strong>${label}</strong><span>${item.correct}/${item.questions} · meilleur score ${item.bestScore}%</span></div>
            <i><u style="width:${accuracy}%"></u></i><b>${accuracy}%</b>
          </article>`;
        }).join("")}
      </div>
      <div class="parent-math-difficult-v12">
        <small>Nombres qui demandent le plus d’attention</small>
        <div>${difficult.length
          ? difficult.map(([number,count]) => `<span><b>${escapeV10(number)}</b><em>${count} difficulté${Number(count)>1?"s":""}</em></span>`).join("")
          : "<p>Aucune difficulté marquée pour le moment.</p>"}
        </div>
      </div>`;
  }

  const oldShowParentV10 = window.showParentDashboard;
  if (typeof oldShowParentV10 === "function") {
    window.showParentDashboard = function(...args){
      const result = oldShowParentV10.apply(this,args);
      renderParentDashboardV10();
      return result;
    };
  }

  /* ---------------------------------------------------------
     SUCCÈS ET RÉCOMPENSES
  --------------------------------------------------------- */
  const ACHIEVEMENTS_V10 = [
    {key:"first",icon:"★",title:"Premier pas",text:"Réussir un premier exercice",test:() => Number(gameState.correctAnswers||0)>=1},
    {key:"ten",icon:"10",title:"Bien lancé",text:"Terminer 10 séries",test:() => Number(gameState.analyticsV10.exercisesCompleted||0)>=10},
    {key:"fifty",icon:"50",title:"Super élève",text:"Terminer 50 séries",test:() => Number(gameState.analyticsV10.exercisesCompleted||0)>=50},
    {key:"stars",icon:"⭐",title:"Collectionneur",text:"Gagner 100 étoiles",test:() => Number(gameState.totalStarsEarned||gameState.stars||0)>=100},
    {key:"reader",icon:"Aa",title:"Petit lecteur",text:"Maîtriser 3 lettres",test:() => completedLettersV10()>=3},
    {key:"streak",icon:"🔥",title:"Régulier",text:"Atteindre une série de 3 jours",test:() => Number(gameState.dailyStreakV10.count||0)>=3},
    {key:"perfect",icon:"✓",title:"Sans faute",text:"Réussir 5 séries sans erreur",test:() => Number(gameState.analyticsV10.perfectExercises||0)>=5},
    {key:"corrector",icon:"↻",title:"Grand correcteur",text:"Corriger 10 erreurs",test:() => Number(gameState.mistakesRecovered||0)>=10},
    {key:"explorer",icon:"🗺️",title:"Explorateur",text:"Terminer les 5 royaumes",test:() => completedWorldsV10()>=5},
    {key:"grandReader",icon:"📚",title:"Grand lecteur",text:"Maîtriser toutes les lettres de l’histoire",test:() => completedLettersV10()>=activeLetters.length},
    {key:"soundMaster",icon:"ch",title:"Maître des sons",text:"Maîtriser tous les sons composés",test:() => completedSoundsV10()>=soundKeys.length},
    {key:"trainer",icon:"🎯",title:"Entraîneur",text:"Découvrir 25 exercices complémentaires",test:() => Number(gameState.analyticsV10.practiceCompleted||0)>=25}
  ];

  function showAchievementToastV10(item){
    const toast = document.getElementById("achievementToastV10");
    if (!toast) return;
    toast.innerHTML = `<span>${item.icon}</span><div><small>Nouveau succès</small><strong>${escapeV10(item.title)}</strong><p>${escapeV10(item.text)}</p></div>`;
    toast.classList.remove("hidden");
    clearTimeout(showAchievementToastV10.timer);
    showAchievementToastV10.timer = setTimeout(() => toast.classList.add("hidden"),4200);
    window.LumiAudio?.playChestReward?.();
  }

  function checkAchievementsV10(showNotice=false){
    ensureV10State();
    const newly = [];
    ACHIEVEMENTS_V10.forEach(item => {
      const unlocked = Boolean(item.test());
      if (unlocked && !gameState.achievements[item.key]) {
        gameState.achievements[item.key] = true;
        newly.push(item);
      }
    });
    safeSaveV10();
    if (showNotice) {
      const item = newly.find(value => !gameState.achievementNotifiedV10[value.key]);
      if (item) {
        gameState.achievementNotifiedV10[item.key] = true;
        safeSaveV10();
        showAchievementToastV10(item);
      }
    }
    return newly;
  }

  const oldUnlockAchievementsV10 = window.unlockAchievements;
  unlockAchievements = function(){
    if (typeof oldUnlockAchievementsV10 === "function") oldUnlockAchievementsV10();
    checkAchievementsV10(false);
  };

  renderAchievements = function(){
    checkAchievementsV10(false);
    const grid = document.getElementById("achievementsGrid");
    if (!grid) return;
    grid.innerHTML = ACHIEVEMENTS_V10.map(item => {
      const unlocked = Boolean(gameState.achievements[item.key]);
      return `<article class="achievement ${unlocked?"":"locked"}"><div class="achievement-icon">${item.icon}</div><strong>${escapeV10(item.title)}</strong><p>${escapeV10(item.text)}</p>${unlocked?'<span class="achievement-unlocked-v10">Débloqué</span>':''}</article>`;
    }).join("");
  };

  function renderRewardsOverviewV10(){
    checkAchievementsV10(false);
    const unlocked = ACHIEVEMENTS_V10.filter(item => gameState.achievements[item.key]).length;
    setText("rewardUnlockedCountV10",`${unlocked} / ${ACHIEVEMENTS_V10.length}`);
    setText("rewardPerfectCountV10",Number(gameState.analyticsV10.perfectExercises||0));
    setText("rewardCorrectedCountV10",Number(gameState.mistakesRecovered||0));
    const streak = Number(gameState.dailyStreakV10.count||0);
    setText("rewardDailyStreakV10",`${streak} jour${streak>1?"s":""}`);
  }
  const oldShowRewardsV10 = window.showRewards;
  if (typeof oldShowRewardsV10 === "function") {
    window.showRewards = function(...args){
      const result = oldShowRewardsV10.apply(this,args);
      renderRewardsOverviewV10();
      renderAchievements();
      return result;
    };
  }

  /* ---------------------------------------------------------
     REPRISE INTELLIGENTE
  --------------------------------------------------------- */
  const oldOpenLessonV10 = window.openLesson;
  if (typeof oldOpenLessonV10 === "function") {
    window.openLesson = function(key,type,...rest){
      const result = oldOpenLessonV10.call(this,key,type,...rest);
      setResumeV10({kind:"history",type:type||"letter",key,part:null});
      return result;
    };
  }

  const fallbackContinueV10 = window.continueLearning;
  continueLearning = function(){
    const resume = gameState.resumeV10;
    if (resume?.kind === "practice") return resumePracticeV10();
    if (resume?.kind === "history" && resume.key) {
      openLesson(resume.key,resume.type||"letter");
      if (resume.part) setTimeout(() => showLessonPart(resume.part,true),80);
      return;
    }
    if (resume?.kind === "math") {
      if (typeof window.resumeMathsV12 === "function") return window.resumeMathsV12(resume);
      if (typeof showMath === "function") return showMath();
    }
    return typeof fallbackContinueV10 === "function" ? fallbackContinueV10() : showReadingHome();
  };

  /* ---------------------------------------------------------
     SYNCHRONISATION GLOBALE DE L'INTERFACE
  --------------------------------------------------------- */
  const oldUpdateGameUiV10 = updateGameUi;
  updateGameUi = function(){
    const result = oldUpdateGameUiV10();
    refreshMistakeCountsV10();
    updateResumeUiV10();
    renderDailyChallenge();
    renderRewardsOverviewV10();
    if (!document.getElementById("parentScreen")?.classList.contains("hidden")) renderParentDashboardV10();
    return result;
  };

  // La copie miniature du texte du livre n'est plus utilisée sur aucun écran.
  document.querySelector(".storybook-mini-copy")?.remove();

  ensureMathStatsV12();
  refreshMistakeCountsV10();
  updateResumeUiV10();
  renderDailyChallenge();
  renderRewardsOverviewV10();
  applyAppSettingsV10();
  checkAchievementsV10(false);
  safeSaveV10();

  // Message de retour après une absence significative.
  if (previousVisitV10 && now()-previousVisitV10 > 2*60*60*1000) {
    const message = gameState.resumeV10 ? `Bon retour ${gameState.childName||"Champion"} ! ${resumeLabelV10(gameState.resumeV10)}.` : `Bon retour ${gameState.childName||"Champion"} !`;
    setTimeout(() => showToast(message),700);
  }
})();


/* =========================================================
   LUMIKIDS V13 — AVENTURE COMPLÈTE
========================================================= */
(function installLumiKidsAdventureV13(){
  "use strict";
  if (window.__lumikidsAdventureV13Installed) return;
  window.__lumikidsAdventureV13Installed = true;

  const VERSION = "13.0";
  const ALL_LETTERS_V13 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const PRACTICE_TYPES_COUNT_V13 = 11;
  let achievementFilterV13 = "all";

  const escV13 = value => String(value ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

  function dayKeyV13(date = new Date()){
    return [
      date.getFullYear(),
      String(date.getMonth()+1).padStart(2,"0"),
      String(date.getDate()).padStart(2,"0")
    ].join("-");
  }

  function saveV13(){
    try { saveGameState(); } catch {}
  }

  function ensureV13State(){
    if (!gameState.achievements) gameState.achievements = {};
    if (!gameState.achievementNotifiedV13) gameState.achievementNotifiedV13 = {};
    if (!gameState.dailyChestV13) {
      gameState.dailyChestV13 = {
        date:"",
        claimed:false,
        amount:0,
        openedCount:0,
        lastClaimAt:0
      };
    }
    gameState.dailyChestV13.openedCount = Number(gameState.dailyChestV13.openedCount||0);
    if (!gameState.guardianV13) {
      gameState.guardianV13 = {
        unlocked:false,
        shown:false,
        completedAt:0
      };
    }
    if (!gameState.v13) gameState.v13 = {version:VERSION};
    gameState.v13.version = VERSION;
  }

  function chapterEntriesV13(){
    return Object.entries(letterChapters || {}).map(([number,chapter]) => [Number(number),chapter]);
  }

  function lessonCompletedV13(type,key){
    try { return Boolean(isLessonCompleted(type,key)); }
    catch { return Boolean(gameState.learningProgress?.[type === "sound" ? "sounds" : "letters"]?.[key]?.completed); }
  }

  function completedLettersV13(){
    return activeLetters.filter(letter => lessonCompletedV13("letter",letter)).length;
  }
  function completedSoundsV13(){
    return soundKeys.filter(sound => lessonCompletedV13("sound",sound)).length;
  }
  function completedWorldsV13(){
    return chapterEntriesV13().filter(([,chapter]) =>
      chapter.letters.every(letter => lessonCompletedV13("letter",letter))
    ).length;
  }

  function chapterStarsV13(chapter){
    return chapter.letters.reduce((sum,letter) => {
      const p = gameState.learningProgress?.letters?.[letter] || {};
      const rewards = p.exerciseRewards || {};
      return sum + ["exercise1","exercise2","exercise3"].reduce((subtotal,name) => {
        return subtotal + Math.max(0,Math.min(2,Number(rewards[name] ?? p[name+"Stars"] ?? 0)));
      },0);
    },0);
  }

  function practiceCompletedCountV13(mode,key){
    const stats = gameState.practiceStatsV10?.[`${mode}:${key}`];
    return Object.keys(stats?.completedTypes || {}).length;
  }

  function practiceMasteryV13(){
    const letterDone = ALL_LETTERS_V13.filter(key =>
      practiceCompletedCountV13("letter",key) >= PRACTICE_TYPES_COUNT_V13
    ).length;
    const soundDone = soundKeys.filter(key =>
      practiceCompletedCountV13("sound",key) >= PRACTICE_TYPES_COUNT_V13
    ).length;
    return {
      mastered:letterDone+soundDone,
      total:ALL_LETTERS_V13.length+soundKeys.length,
      completedActivities:[
        ...ALL_LETTERS_V13.map(key => practiceCompletedCountV13("letter",key)),
        ...soundKeys.map(key => practiceCompletedCountV13("sound",key))
      ].reduce((sum,value)=>sum+value,0),
      totalActivities:(ALL_LETTERS_V13.length+soundKeys.length)*PRACTICE_TYPES_COUNT_V13
    };
  }

  function mathModesV13(){
    const stats = gameState.mathStatsV12?.byOperation || {};
    const keys = ["addition","subtraction","comparison","problem","mixed"];
    return {
      completed:keys.filter(key => Number(stats[key]?.series||0)>0).length,
      total:keys.length
    };
  }

  function analyticsV13(){
    return gameState.analyticsV10 || {
      exercisesCompleted:0,perfectExercises:0,practiceCompleted:0,
      sessionSeconds:0,activityLog:[]
    };
  }

  function guardianRequirementsV13(){
    const practice = practiceMasteryV13();
    const math = mathModesV13();
    const requirements = [
      {
        key:"worlds",
        label:"Les 5 royaumes sont terminés",
        value:completedWorldsV13(),
        target:chapterEntriesV13().length || 5
      },
      {
        key:"sounds",
        label:"Tous les sons composés sont maîtrisés",
        value:completedSoundsV13(),
        target:soundKeys.length
      },
      {
        key:"practice",
        label:"Toutes les leçons complémentaires sont maîtrisées",
        value:practice.mastered,
        target:practice.total
      },
      {
        key:"math",
        label:"Chaque mode de maths a été terminé",
        value:math.completed,
        target:math.total
      },
      {
        key:"finale",
        label:"La grande cinématique est terminée",
        value:gameState.finalCinematic?.completed ? 1 : 0,
        target:1
      }
    ];
    requirements.forEach(item => item.done = item.value >= item.target);
    return requirements;
  }

  function guardianEligibleV13(){
    return guardianRequirementsV13().every(item => item.done);
  }

  const ACHIEVEMENTS_V13 = [
    {key:"first",category:"lecture",icon:"★",title:"Premier pas",text:"Réussir une première question",test:()=>Number(gameState.correctAnswers||0)>=1},
    {key:"firstLetterV13",category:"lecture",icon:"A",title:"Première lettre",text:"Terminer une première lettre",test:()=>completedLettersV13()>=1},
    {key:"firstChapterV13",category:"aventure",icon:"📖",title:"Premier chapitre",text:"Terminer le premier royaume",test:()=>completedWorldsV13()>=1},
    {key:"reader",category:"lecture",icon:"Aa",title:"Petit lecteur",text:"Maîtriser 3 lettres",test:()=>completedLettersV13()>=3},
    {key:"grandReader",category:"lecture",icon:"📚",title:"Grand lecteur",text:"Maîtriser toutes les lettres de l’histoire",test:()=>completedLettersV13()>=activeLetters.length},
    {key:"soundMaster",category:"lecture",icon:"ch",title:"Maître des sons",text:"Maîtriser tous les sons composés",test:()=>completedSoundsV13()>=soundKeys.length},
    {key:"trainer",category:"lecture",icon:"🎯",title:"Entraîneur",text:"Terminer 25 exercices complémentaires",test:()=>Number(analyticsV13().practiceCompleted||0)>=25},
    {key:"practiceMasterV13",category:"lecture",icon:"🏅",title:"Maître de l’entraînement",text:"Maîtriser toutes les leçons complémentaires",test:()=>practiceMasteryV13().mastered>=practiceMasteryV13().total},
    {key:"ten",category:"progression",icon:"10",title:"Bien lancé",text:"Terminer 10 séries",test:()=>Number(analyticsV13().exercisesCompleted||0)>=10},
    {key:"fifty",category:"progression",icon:"50",title:"Super élève",text:"Terminer 50 séries",test:()=>Number(analyticsV13().exercisesCompleted||0)>=50},
    {key:"stars",category:"progression",icon:"⭐",title:"Collectionneur",text:"Gagner 100 étoiles",test:()=>Number(gameState.totalStarsEarned||gameState.stars||0)>=100},
    {key:"stars300V13",category:"progression",icon:"🌟",title:"Ciel étincelant",text:"Gagner 300 étoiles",test:()=>Number(gameState.totalStarsEarned||gameState.stars||0)>=300},
    {key:"coins100V13",category:"progression",icon:"💰",title:"Petit trésor",text:"Posséder 100 pièces",test:()=>Number(gameState.coins||0)>=100},
    {key:"perfect",category:"progression",icon:"✓",title:"Sans faute",text:"Réussir 5 séries sans erreur",test:()=>Number(analyticsV13().perfectExercises||0)>=5},
    {key:"perfect10V13",category:"progression",icon:"💯",title:"Précision parfaite",text:"Réussir 10 séries sans erreur",test:()=>Number(analyticsV13().perfectExercises||0)>=10},
    {key:"corrector",category:"progression",icon:"↻",title:"Grand correcteur",text:"Corriger 10 erreurs",test:()=>Number(gameState.mistakesRecovered||0)>=10},
    {key:"streak",category:"quotidien",icon:"🔥",title:"Régulier",text:"Atteindre une série de 3 jours",test:()=>Number(gameState.dailyStreakV10?.count||0)>=3},
    {key:"streak7V13",category:"quotidien",icon:"7",title:"Une semaine magique",text:"Atteindre une série de 7 jours",test:()=>Number(gameState.dailyStreakV10?.count||0)>=7},
    {key:"dailyTreasureV13",category:"quotidien",icon:"🎁",title:"Chercheur de trésors",text:"Ouvrir 7 coffres quotidiens",test:()=>Number(gameState.dailyChestV13?.openedCount||0)>=7},
    {key:"explorer",category:"aventure",icon:"🗺️",title:"Explorateur",text:"Terminer les 5 royaumes",test:()=>completedWorldsV13()>=5},
    {key:"orionV13",category:"aventure",icon:"🦌",title:"Ami d’Orion",text:"Terminer la grande cinématique",test:()=>Boolean(gameState.finalCinematic?.completed)},
    {key:"mathStarterV13",category:"maths",icon:"➕",title:"Premier calcul",text:"Terminer une série de maths",test:()=>Number(gameState.mathStatsV12?.seriesCompleted||0)>=1},
    {key:"additionV13",category:"maths",icon:"+",title:"Champion des additions",text:"Obtenir au moins 80 % en additions",test:()=>Number(gameState.mathStatsV12?.byOperation?.addition?.bestScore||0)>=80},
    {key:"subtractionV13",category:"maths",icon:"−",title:"Champion des soustractions",text:"Obtenir au moins 80 % en soustractions",test:()=>Number(gameState.mathStatsV12?.byOperation?.subtraction?.bestScore||0)>=80},
    {key:"comparisonV13",category:"maths",icon:">",title:"Grand comparateur",text:"Obtenir au moins 80 % en comparaisons",test:()=>Number(gameState.mathStatsV12?.byOperation?.comparison?.bestScore||0)>=80},
    {key:"problemV13",category:"maths",icon:"🧩",title:"Résolveur de problèmes",text:"Obtenir au moins 80 % aux petits problèmes",test:()=>Number(gameState.mathStatsV12?.byOperation?.problem?.bestScore||0)>=80},
    {key:"mathExplorerV13",category:"maths",icon:"🔢",title:"Explorateur des nombres",text:"Terminer chaque mode de maths",test:()=>mathModesV13().completed>=mathModesV13().total},
    {key:"guardianV13",category:"aventure",icon:"👑",title:"Gardien des Étoiles",text:"Terminer toute l’aventure LumiKids",test:()=>guardianEligibleV13()}
  ];

  function showAchievementToastV13(item){
    const toast = document.getElementById("achievementToastV10");
    if (!toast) return;
    toast.innerHTML = `<span>${item.icon}</span><div><small>Nouveau succès</small><strong>${escV13(item.title)}</strong><p>${escV13(item.text)}</p></div>`;
    toast.classList.remove("hidden");
    clearTimeout(showAchievementToastV13.timer);
    showAchievementToastV13.timer = setTimeout(()=>toast.classList.add("hidden"),4400);
    window.LumiAudio?.playChestReward?.();
  }

  function checkAchievementsV13(showNotice=false){
    ensureV13State();
    const newly = [];
    ACHIEVEMENTS_V13.forEach(item => {
      if (item.test() && !gameState.achievements[item.key]) {
        gameState.achievements[item.key] = true;
        newly.push(item);
      }
    });
    saveV13();
    if (showNotice) {
      const item = newly.find(entry => !gameState.achievementNotifiedV13[entry.key]);
      if (item) {
        gameState.achievementNotifiedV13[item.key] = true;
        saveV13();
        showAchievementToastV13(item);
      }
    }
    return newly;
  }

  window.setAchievementFilterV13 = function(filter){
    achievementFilterV13 = ["all","lecture","maths","aventure","progression","quotidien"].includes(filter) ? filter : "all";
    document.querySelectorAll(".achievement-toolbar-v13 button").forEach(button => {
      button.classList.toggle("active",button.dataset.filter === achievementFilterV13);
    });
    renderAchievements();
  };

  renderAchievements = function(){
    ensureV13State();
    checkAchievementsV13(false);
    const grid = document.getElementById("achievementsGrid");
    if (!grid) return;

    let toolbar = document.getElementById("achievementToolbarV13");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = "achievementToolbarV13";
      toolbar.className = "achievement-toolbar-v13";
      toolbar.innerHTML = [
        ["all","Tout"],["lecture","Lecture"],["maths","Maths"],
        ["aventure","Aventure"],["progression","Progression"],["quotidien","Quotidien"]
      ].map(([key,label]) => `<button data-filter="${key}" onclick="setAchievementFilterV13('${key}')">${label}</button>`).join("");
      grid.before(toolbar);
    }

    let progress = document.getElementById("achievementProgressV13");
    if (!progress) {
      progress = document.createElement("section");
      progress.id = "achievementProgressV13";
      progress.className = "achievement-progress-v13";
      toolbar.before(progress);
    }

    const unlocked = ACHIEVEMENTS_V13.filter(item => gameState.achievements[item.key]).length;
    progress.innerHTML = `<div><span>Collection de succès</span><strong>${unlocked} / ${ACHIEVEMENTS_V13.length}</strong></div><i><span style="width:${unlocked/ACHIEVEMENTS_V13.length*100}%"></span></i>`;
    setText("rewardUnlockedCountV10",`${unlocked} / ${ACHIEVEMENTS_V13.length}`);

    document.querySelectorAll(".achievement-toolbar-v13 button").forEach(button => {
      button.classList.toggle("active",button.dataset.filter === achievementFilterV13);
    });

    const visible = ACHIEVEMENTS_V13.filter(item =>
      achievementFilterV13 === "all" || item.category === achievementFilterV13
    );
    grid.innerHTML = visible.map(item => {
      const isUnlocked = Boolean(gameState.achievements[item.key]);
      const isNew = isUnlocked && !gameState.achievementNotifiedV13[item.key];
      return `<article class="achievement ${isUnlocked?"":"locked"} ${isNew?"v13-new":""}">
        <div class="achievement-icon">${item.icon}</div>
        <strong>${escV13(item.title)}</strong>
        <p>${escV13(item.text)}</p>
        ${isUnlocked?'<span class="achievement-unlocked-v10">Débloqué</span>':""}
      </article>`;
    }).join("");
  };

  /* ---------------------------------------------------------
     COFFRE QUOTIDIEN
  --------------------------------------------------------- */
  function ensureDailyChestV13(){
    ensureV13State();
    const today = dayKeyV13();
    const chest = gameState.dailyChestV13;
    if (chest.date !== today) {
      const seed = today.replace(/\D/g,"").split("").reduce((sum,value)=>sum+Number(value),0);
      const rewards = [10,12,15,18,20,25];
      chest.date = today;
      chest.claimed = false;
      chest.amount = rewards[seed % rewards.length];
      chest.lastClaimAt = 0;
      saveV13();
    }
    return chest;
  }

  function ensureDailyChestUiV13(){
    const daily = document.getElementById("dailyChallengeCard");
    if (daily && !document.getElementById("dailyChestCardV13")) {
      daily.insertAdjacentHTML("afterend",`
        <button id="dailyChestCardV13" class="daily-chest-v13" onclick="openDailyChestV13()">
          <span class="daily-chest-icon-v13">🎁</span>
          <span><strong>Coffre quotidien</strong><p id="dailyChestTextV13">Un nouveau trésor t’attend.</p></span>
          <b id="dailyChestStatusV13">Ouvrir</b>
        </button>`);
    }
    if (!document.getElementById("dailyChestOverlayV13")) {
      document.body.insertAdjacentHTML("beforeend",`
        <div id="dailyChestOverlayV13" class="v13-overlay hidden">
          <section class="daily-chest-modal-v13" role="dialog" aria-modal="true" aria-labelledby="dailyChestTitleV13">
            <button class="v13-close" onclick="closeDailyChestV13()" aria-label="Fermer">×</button>
            <div id="dailyChestBigV13" class="daily-chest-big-v13">🎁</div>
            <small>Récompense du jour</small>
            <h2 id="dailyChestTitleV13">Ton coffre est prêt !</h2>
            <p id="dailyChestDescriptionV13">Ouvre-le pour découvrir ton trésor.</p>
            <div id="dailyChestRewardV13" class="daily-chest-reward-v13 hidden"></div>
            <button id="dailyChestClaimV13" class="primary" onclick="claimDailyChestV13()">Ouvrir le coffre</button>
          </section>
        </div>`);
    }
  }

  function renderDailyChestV13(){
    ensureDailyChestUiV13();
    const chest = ensureDailyChestV13();
    const card = document.getElementById("dailyChestCardV13");
    const text = document.getElementById("dailyChestTextV13");
    const status = document.getElementById("dailyChestStatusV13");
    card?.classList.toggle("claimed",chest.claimed);
    card?.classList.toggle("claimable",!chest.claimed);
    if (text) text.textContent = chest.claimed ? "Reviens demain pour un nouveau trésor." : "Un nouveau trésor t’attend aujourd’hui.";
    if (status) status.textContent = chest.claimed ? "Récupéré ✓" : "Ouvrir";
  }

  window.openDailyChestV13 = function(){
    ensureDailyChestUiV13();
    const chest = ensureDailyChestV13();
    const overlay = document.getElementById("dailyChestOverlayV13");
    const reward = document.getElementById("dailyChestRewardV13");
    const button = document.getElementById("dailyChestClaimV13");
    const title = document.getElementById("dailyChestTitleV13");
    const description = document.getElementById("dailyChestDescriptionV13");
    overlay?.classList.remove("hidden");
    if (reward) {
      reward.classList.toggle("hidden",!chest.claimed);
      reward.textContent = chest.claimed ? `🪙 ${chest.amount} pièces récupérées` : "";
    }
    if (button) {
      button.disabled = chest.claimed;
      button.textContent = chest.claimed ? "Déjà récupéré aujourd’hui" : "Ouvrir le coffre";
    }
    if (title) title.textContent = chest.claimed ? "Coffre déjà ouvert" : "Ton coffre est prêt !";
    if (description) description.textContent = chest.claimed
      ? "Ton prochain trésor arrivera demain."
      : "Ouvre-le pour découvrir ton trésor.";
  };

  window.closeDailyChestV13 = function(){
    document.getElementById("dailyChestOverlayV13")?.classList.add("hidden");
  };

  window.claimDailyChestV13 = function(){
    const chest = ensureDailyChestV13();
    if (chest.claimed) return;
    const icon = document.getElementById("dailyChestBigV13");
    const button = document.getElementById("dailyChestClaimV13");
    icon?.classList.add("opening");
    if (button) button.disabled = true;
    window.LumiAudio?.playChestOpen?.();

    setTimeout(() => {
      chest.claimed = true;
      chest.openedCount = Number(chest.openedCount||0)+1;
      chest.lastClaimAt = Date.now();
      gameState.coins = Number(gameState.coins||0)+Number(chest.amount||0);
      saveV13();
      updateGameUi();
      const reward = document.getElementById("dailyChestRewardV13");
      reward?.classList.remove("hidden");
      if (reward) reward.textContent = `🪙 ${chest.amount} pièces gagnées !`;
      document.getElementById("dailyChestTitleV13").textContent = "Trésor récupéré !";
      document.getElementById("dailyChestDescriptionV13").textContent = "Reviens demain pour ouvrir un nouveau coffre.";
      if (button) button.textContent = "Récupéré ✓";
      window.LumiAudio?.playChestReward?.();
      if (!document.body.classList.contains("v10-reduced-motion")) createConfetti();
      animateRewardToCounter?.("coins",chest.amount);
      renderDailyChestV13();
      checkAchievementsV13(true);
    },800);
  };

  /* ---------------------------------------------------------
     CARTE DES ROYAUMES
  --------------------------------------------------------- */
  renderWorldMap = function(){
    const path = document.getElementById("worldMapPath");
    if (!path) return;
    const entries = chapterEntriesV13();
    const completed = completedWorldsV13();
    const uniqueStars = entries.reduce((sum,[,chapter])=>sum+chapterStarsV13(chapter),0);
    setText("worldMapStars",Number(gameState.stars||0));
    setText("worldMapCompleted",`${completed} / ${entries.length}`);
    setText("worldMapUniqueStars",uniqueStars);
    setText("worldMapMistakes",Object.keys(gameState.mistakes||{}).length);
    setText("worldMapOrionStars",Number(gameState.finalCinematic?.starsGiven||0));

    path.classList.add("v13-map");
    path.innerHTML = entries.map(([number,chapter]) => {
      const doneCount = chapter.letters.filter(letter => lessonCompletedV13("letter",letter)).length;
      const percent = chapter.letters.length ? Math.round(doneCount/chapter.letters.length*100) : 0;
      const done = doneCount === chapter.letters.length;
      let unlocked = true;
      try { unlocked = Boolean(isLetterChapterUnlocked(number)); } catch {}
      const stars = chapterStarsV13(chapter);
      const max = chapter.letters.length*6;
      const click = unlocked
        ? `onclick="confirmWorldTravel(${number})"`
        : `onclick="showToast('Termine le royaume précédent pour le débloquer.')"`; 
      return `<button class="world-map-card-v13 ${done?"completed":""} ${unlocked?"":"locked"}" ${click}>
        <span class="world-map-node-v13">${done?"✓":number}</span>
        <div class="world-map-image-v13" style="background-image:url('${escV13(chapter.background)}')"></div>
        <div class="world-map-copy-v13">
          <small>Royaume ${number}</small>
          <h3>${escV13(chapter.name || chapter.shortName || `Royaume ${number}`)}</h3>
          <p>${done
            ? "Royaume restauré : toutes les lettres sont maîtrisées."
            : unlocked
              ? "Poursuis l’aventure et retrouve les étoiles restantes."
              : "Ce royaume sera révélé après le précédent."}</p>
          <div class="world-map-progress-v13"><span style="width:${percent}%"></span></div>
          <div class="world-map-meta-v13">
            <span>✓ ${doneCount}/${chapter.letters.length} lettres</span>
            <span>⭐ ${stars}/${max}</span>
            <span>${done?"Royaume terminé":unlocked?"En cours":"Verrouillé"}</span>
          </div>
        </div>
      </button>`;
    }).join("");
    revealActiveScreenV13();
  };

  /* ---------------------------------------------------------
     PARENTS++ ET RAPPORT PDF
  --------------------------------------------------------- */
  function lastSevenDaysV13(){
    const result = [];
    const log = analyticsV13().activityLog || [];
    for (let offset=6;offset>=0;offset--) {
      const date = new Date();
      date.setHours(0,0,0,0);
      date.setDate(date.getDate()-offset);
      const key = dayKeyV13(date);
      const count = log.filter(item => dayKeyV13(new Date(Number(item.at||0))) === key).length;
      result.push({
        key,
        label:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][date.getDay()],
        count
      });
    }
    return result;
  }

  function ensureParentV13Ui(){
    const parent = document.getElementById("parentScreen");
    if (!parent || document.getElementById("parentActionsV13")) return;
    const profile = parent.querySelector(".parent-profile");
    profile?.insertAdjacentHTML("afterend",`
      <div id="parentActionsV13" class="parent-actions-v13">
        <button class="report" onclick="printParentReportV13()">🖨️ Imprimer / enregistrer le rapport PDF</button>
        <button id="parentCertificateButtonV13" class="certificate" onclick="printCertificateV13()">🏅 Diplôme LumiKids</button>
      </div>`);
    parent.insertAdjacentHTML("beforeend",`
      <section id="parentWeekChartV13" class="parent-chart-v13"></section>
      <section id="parentMasteryChartV13" class="parent-chart-v13"></section>`);
  }

  function percentV13(value,total){
    return total ? Math.max(0,Math.min(100,Math.round(value/total*100))) : 0;
  }

  function renderParentV13(){
    ensureParentV13Ui();
    const week = lastSevenDaysV13();
    const max = Math.max(1,...week.map(item=>item.count));
    const totalWeek = week.reduce((sum,item)=>sum+item.count,0);
    const best = [...week].sort((a,b)=>b.count-a.count)[0];
    const weekBox = document.getElementById("parentWeekChartV13");
    if (weekBox) {
      weekBox.innerHTML = `
        <header><div><small>Activité des 7 derniers jours</small><strong>${totalWeek} activité${totalWeek>1?"s":""}</strong></div><span>Meilleur jour : ${best?.label||"—"}</span></header>
        <div class="parent-week-bars-v13">${week.map(item => `
          <div><i style="height:${Math.max(8,item.count/max*125)}px" title="${item.count} activité(s)"></i><b>${item.label}</b></div>
        `).join("")}</div>`;
    }

    const practice = practiceMasteryV13();
    const math = gameState.mathStatsV12 || {};
    const mathsAccuracy = math.totalQuestions ? Math.round(Number(math.correct||0)/Number(math.totalQuestions||1)*100) : 0;
    const rows = [
      ["Lettres",completedLettersV13(),activeLetters.length],
      ["Sons",completedSoundsV13(),soundKeys.length],
      ["Entraînement",practice.completedActivities,practice.totalActivities],
      ["Maths",mathsAccuracy,100],
      ["Royaumes",completedWorldsV13(),chapterEntriesV13().length]
    ];
    const mastery = document.getElementById("parentMasteryChartV13");
    if (mastery) {
      mastery.innerHTML = `
        <header><div><small>Vue d’ensemble</small><strong>Maîtrise par domaine</strong></div><span>${Math.round(rows.reduce((sum,row)=>sum+percentV13(row[1],row[2]),0)/rows.length)} % global</span></header>
        <div class="parent-mastery-v13">${rows.map(([label,value,total]) => {
          const pct = percentV13(value,total);
          return `<div class="parent-mastery-row-v13"><span>${label}</span><i><u style="width:${pct}%"></u></i><b>${pct}%</b></div>`;
        }).join("")}</div>`;
    }
    const certificate = document.getElementById("parentCertificateButtonV13");
    if (certificate) {
      certificate.disabled = !gameState.guardianV13?.unlocked;
      certificate.title = certificate.disabled ? "Termine toute l’aventure pour débloquer le diplôme." : "Imprimer le diplôme";
    }
  }

  function reportHtmlV13(){
    const accuracy = gameState.totalAnswers
      ? Math.round(Number(gameState.correctAnswers||0)/Number(gameState.totalAnswers||1)*100) : 0;
    const practice = practiceMasteryV13();
    const math = gameState.mathStatsV12 || {};
    const week = lastSevenDaysV13();
    const difficult = Object.entries(math.difficultNumbers||{}).sort((a,b)=>b[1]-a[1]).slice(0,8);
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport LumiKids</title>
      <style>
        body{font-family:Arial,sans-serif;color:#23342b;margin:35px}
        header{padding:24px;border-radius:20px;background:#eaf8ef}
        h1{margin:0;color:#29945a} h2{margin-top:28px}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        .card{padding:15px;border:1px solid #dce8e1;border-radius:14px}
        .card strong{display:block;font-size:24px}
        table{width:100%;border-collapse:collapse}
        th,td{padding:10px;border-bottom:1px solid #e5ebe7;text-align:left}
        .bar{height:10px;background:#e7ede9;border-radius:99px;overflow:hidden}
        .bar span{display:block;height:100%;background:#43bd79}
        footer{margin-top:35px;color:#738078;font-size:12px}
        @media print{button{display:none}}
      </style></head><body>
      <header><small>Rapport pédagogique LumiKids</small><h1>${escV13(gameState.childName||"Champion")}</h1><p>Généré le ${new Date().toLocaleDateString("fr-FR")}</p></header>
      <h2>Résumé</h2><div class="grid">
        <div class="card"><small>Niveau</small><strong>${Math.floor(Number(gameState.xp||0)/100)+1}</strong></div>
        <div class="card"><small>Réussite globale</small><strong>${accuracy}%</strong></div>
        <div class="card"><small>Étoiles gagnées</small><strong>${Number(gameState.totalStarsEarned||gameState.stars||0)}</strong></div>
        <div class="card"><small>Erreurs corrigées</small><strong>${Number(gameState.mistakesRecovered||0)}</strong></div>
      </div>
      <h2>Progression</h2><table>
        <tr><th>Domaine</th><th>Progression</th><th></th></tr>
        <tr><td>Lettres de l’histoire</td><td>${completedLettersV13()} / ${activeLetters.length}</td><td><div class="bar"><span style="width:${percentV13(completedLettersV13(),activeLetters.length)}%"></span></div></td></tr>
        <tr><td>Sons composés</td><td>${completedSoundsV13()} / ${soundKeys.length}</td><td><div class="bar"><span style="width:${percentV13(completedSoundsV13(),soundKeys.length)}%"></span></div></td></tr>
        <tr><td>Royaumes</td><td>${completedWorldsV13()} / ${chapterEntriesV13().length}</td><td><div class="bar"><span style="width:${percentV13(completedWorldsV13(),chapterEntriesV13().length)}%"></span></div></td></tr>
        <tr><td>Activités complémentaires</td><td>${practice.completedActivities} / ${practice.totalActivities}</td><td><div class="bar"><span style="width:${percentV13(practice.completedActivities,practice.totalActivities)}%"></span></div></td></tr>
        <tr><td>Maths</td><td>${Number(math.correct||0)} bonnes réponses / ${Number(math.totalQuestions||0)}</td><td><div class="bar"><span style="width:${math.totalQuestions?Math.round(Number(math.correct||0)/Number(math.totalQuestions||1)*100):0}%"></span></div></td></tr>
      </table>
      <h2>Activité des 7 derniers jours</h2>
      <table><tr>${week.map(item=>`<th>${item.label}</th>`).join("")}</tr><tr>${week.map(item=>`<td>${item.count}</td>`).join("")}</tr></table>
      <h2>Nombres à revoir</h2><p>${difficult.length ? difficult.map(([number,count])=>`${escV13(number)} (${count})`).join(" · ") : "Aucune difficulté particulière enregistrée."}</p>
      <footer>LumiKids — Apprendre en jouant. Ce rapport est généré localement à partir de la progression enregistrée sur cet appareil.</footer>
      <script>setTimeout(()=>window.print(),250)<\/script></body></html>`;
  }

  window.printParentReportV13 = function(){
    const popup = window.open("","_blank");
    if (!popup) return showToast("Autorise les fenêtres contextuelles pour imprimer le rapport.");
    popup.document.open();
    popup.document.write(reportHtmlV13());
    popup.document.close();
  };

  /* ---------------------------------------------------------
     ÉCRAN FINAL ET CERTIFICAT
  --------------------------------------------------------- */
  function ensureGuardianScreenV13(){
    const shell = document.querySelector(".game-shell");
    if (!shell || document.getElementById("guardianScreenV13")) return;
    shell.insertAdjacentHTML("beforeend",`
      <div id="guardianScreenV13" class="screen guardian-screen-v13 hidden">
        <section class="guardian-card-v13">
          <div class="guardian-crown-v13">👑</div>
          <small>Grande aventure terminée</small>
          <h2>Gardien des Étoiles</h2>
          <p id="guardianMessageV13"></p>
          <div id="guardianStatsV13" class="guardian-stats-v13"></div>
          <div id="guardianRequirementsV13" class="guardian-requirements-v13"></div>
          <div class="guardian-actions-v13">
            <button class="primary" onclick="printCertificateV13()">🏅 Mon diplôme</button>
            <button class="secondary" onclick="startFinalCinematic(true)">🎬 Revoir la grande fin</button>
            <button class="ghost" onclick="showHome()">Retour à l’accueil</button>
          </div>
        </section>
      </div>`);
  }

  function renderGuardianV13(forcePreview=false){
    ensureGuardianScreenV13();
    const eligible = guardianEligibleV13();
    const requirements = guardianRequirementsV13();
    const message = document.getElementById("guardianMessageV13");
    if (message) message.textContent = eligible
      ? `Bravo ${gameState.childName||"Champion"} ! Tu as restauré tous les royaumes, maîtrisé la lecture et relevé les défis de maths.`
      : `Aperçu administrateur : certaines étapes restent encore à terminer avant le vrai couronnement.`;

    const stats = document.getElementById("guardianStatsV13");
    if (stats) stats.innerHTML = `
      <article><strong>${Number(gameState.totalStarsEarned||gameState.stars||0)}</strong><span>étoiles gagnées</span></article>
      <article><strong>${Number(analyticsV13().exercisesCompleted||0)}</strong><span>séries terminées</span></article>
      <article><strong>${Number(gameState.mistakesRecovered||0)}</strong><span>erreurs corrigées</span></article>
      <article><strong>${Number(gameState.mathStatsV12?.correct||0)}</strong><span>calculs réussis</span></article>`;

    const list = document.getElementById("guardianRequirementsV13");
    if (list) list.innerHTML = requirements.map(item =>
      `<div class="${item.done?"done":""}">${item.done?"✓":"○"} ${escV13(item.label)} <b>${item.value}/${item.target}</b></div>`
    ).join("");
  }

  window.showGuardianFinaleV13 = function(forcePreview=false){
    ensureV13State();
    if (!guardianEligibleV13() && !forcePreview) {
      return showToast("Le titre de Gardien sera débloqué lorsque toute l’aventure sera terminée.");
    }
    ensureGuardianScreenV13();
    hideAllScreens();
    renderGuardianV13(forcePreview);
    document.getElementById("guardianScreenV13")?.classList.remove("hidden");
    if (!document.body.classList.contains("v10-reduced-motion")) createConfetti();
  };

  function checkGuardianUnlockV13(showNotice=false){
    ensureV13State();
    const eligible = guardianEligibleV13();
    if (eligible && !gameState.guardianV13.unlocked) {
      gameState.guardianV13.unlocked = true;
      gameState.guardianV13.completedAt = Date.now();
      saveV13();
      checkAchievementsV13(true);
      if (showNotice) showToast("Titre débloqué : Gardien des Étoiles !");
    }
    renderGuardianHomeBannerV13();
    return eligible;
  }

  function ensureGuardianHomeBannerV13(){
    const home = document.getElementById("homeScreen");
    if (!home || document.getElementById("guardianHomeBannerV13")) return;
    const target = home.querySelector(".activity-grid-v3") || home.firstElementChild;
    target?.insertAdjacentHTML("beforebegin",`
      <section id="guardianHomeBannerV13" class="guardian-home-banner-v13 hidden">
        <span>👑</span>
        <div><strong>Gardien des Étoiles</strong><p>Toute l’aventure LumiKids est terminée.</p></div>
        <button onclick="showGuardianFinaleV13()">Voir mon couronnement</button>
      </section>`);
  }

  function renderGuardianHomeBannerV13(){
    ensureGuardianHomeBannerV13();
    document.getElementById("guardianHomeBannerV13")?.classList.toggle("hidden",!gameState.guardianV13?.unlocked);
  }

  window.printCertificateV13 = function(forcePreview=false){
    ensureV13State();
    if (!gameState.guardianV13.unlocked && !forcePreview) {
      return showToast("Le diplôme sera disponible après avoir terminé toute l’aventure.");
    }
    const popup = window.open("","_blank");
    if (!popup) return showToast("Autorise les fenêtres contextuelles pour imprimer le diplôme.");
    const date = gameState.guardianV13.completedAt
      ? new Date(gameState.guardianV13.completedAt).toLocaleDateString("fr-FR")
      : new Date().toLocaleDateString("fr-FR");
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Diplôme LumiKids</title>
      <style>
        @page{size:A4 landscape;margin:0}
        *{box-sizing:border-box}
        body{margin:0;font-family:Georgia,serif;background:#eef7f1}
        .page{width:297mm;height:210mm;padding:15mm;display:grid;place-items:center}
        .certificate{width:100%;height:100%;position:relative;padding:18mm;text-align:center;
          border:7px double #d6aa36;border-radius:8mm;background:
          radial-gradient(circle at 15% 18%,rgba(255,224,104,.28),transparent 22%),
          radial-gradient(circle at 85% 82%,rgba(139,112,222,.20),transparent 25%),
          linear-gradient(135deg,#fffef6,#f1fff5)}
        .stars{font-size:20px;letter-spacing:8px;color:#d5a82e}
        small{display:block;margin-top:8mm;letter-spacing:.35em;text-transform:uppercase;color:#4f7760;font-weight:bold}
        h1{margin:5mm 0 2mm;font-size:23mm;line-height:1;color:#2e9b61}
        h2{margin:3mm 0;font-size:11mm;color:#503e75}
        p{font-size:6mm;line-height:1.5;color:#4d5c53}
        .name{display:inline-block;min-width:130mm;padding:2mm 5mm;border-bottom:2px solid #b48a2b;font-size:12mm;color:#694c18}
        .stats{margin:8mm auto;display:flex;justify-content:center;gap:12mm;font-family:Arial,sans-serif}
        .stats div{padding:4mm 7mm;border-radius:4mm;background:rgba(255,255,255,.76)}
        .stats strong{display:block;font-size:7mm;color:#4f67bd}.stats span{font-size:3.5mm;color:#6f7c75}
        footer{position:absolute;left:18mm;right:18mm;bottom:12mm;display:flex;justify-content:space-between;color:#7b887f;font-family:Arial,sans-serif;font-size:3.5mm}
        @media print{body{background:white}}
      </style></head><body><main class="page"><section class="certificate">
        <div class="stars">★ ★ ★ ★ ★</div>
        <small>Diplôme officiel LumiKids</small>
        <h1>Gardien des Étoiles</h1>
        <p>Ce diplôme certifie que</p>
        <div class="name">${escV13(gameState.childName||"Champion")}</div>
        <h2>a terminé la grande aventure LumiKids</h2>
        <p>et a aidé Lumi et ses amis à restaurer les cinq royaumes.</p>
        <div class="stats">
          <div><strong>${Number(gameState.totalStarsEarned||gameState.stars||0)}</strong><span>étoiles</span></div>
          <div><strong>${Number(analyticsV13().exercisesCompleted||0)}</strong><span>séries</span></div>
          <div><strong>${Number(gameState.mistakesRecovered||0)}</strong><span>erreurs corrigées</span></div>
        </div>
        <footer><span>Décerné le ${date}</span><span>Orion, Gardien du ciel ✦</span></footer>
      </section></main><script>setTimeout(()=>window.print(),300)<\/script></body></html>`);
    popup.document.close();
  };

  /* ---------------------------------------------------------
     ANIMATIONS ET OUTILS ADMIN
  --------------------------------------------------------- */
  function installMagicLayerV13(){
    if (document.querySelector(".v13-magic-layer")) return;
    const layer = document.createElement("div");
    layer.className = "v13-magic-layer";
    const symbols = ["✦","★","✧","•"];
    layer.innerHTML = Array.from({length:18},(_,index) => {
      const left = (index*37)%100;
      const duration = 10+(index%7)*1.4;
      const delay = -(index%9)*1.25;
      const drift = -45+(index%10)*10;
      return `<span style="left:${left}%;--duration:${duration}s;--delay:${delay}s;--drift:${drift}px">${symbols[index%symbols.length]}</span>`;
    }).join("");
    document.body.appendChild(layer);
  }

  function revealActiveScreenV13(){
    const screen = [...document.querySelectorAll(".screen")].find(item => !item.classList.contains("hidden"));
    if (!screen) return;
    screen.classList.remove("v13-screen-reveal");
    void screen.offsetWidth;
    screen.classList.add("v13-screen-reveal");
  }

  document.addEventListener("pointerdown",event => {
    const button = event.target.closest("button");
    if (!button || document.body.classList.contains("v10-reduced-motion")) return;
    button.classList.remove("v13-tap-burst");
    void button.offsetWidth;
    button.classList.add("v13-tap-burst");
    setTimeout(()=>button.classList.remove("v13-tap-burst"),380);
  },{passive:true});

  function ensureAdminV13(){
    const actions = document.getElementById("adminUnlockedActions");
    if (!actions || document.getElementById("adminPreviewGuardianV13")) return;
    actions.insertAdjacentHTML("beforeend",`
      <button id="adminPreviewGuardianV13" class="admin-v13-button" onclick="showGuardianFinaleV13(true)">👑 Tester l’écran Gardien</button>
      <button class="admin-v13-button" onclick="resetDailyChestForTestsV13()">🎁 Réinitialiser le coffre du jour</button>
      <button class="admin-v13-button" onclick="printCertificateV13(true)">🏅 Tester le diplôme</button>`);
  }

  window.resetDailyChestForTestsV13 = function(){
    ensureV13State();
    gameState.dailyChestV13.date = "";
    gameState.dailyChestV13.claimed = false;
    saveV13();
    renderDailyChestV13();
    openDailyChestV13();
    showToast("Coffre quotidien réinitialisé pour le test.");
  };

  /* ---------------------------------------------------------
     BRANCHEMENTS AUX ÉCRANS EXISTANTS
  --------------------------------------------------------- */
  const previousHideAllScreensV13 = window.hideAllScreens;
  window.hideAllScreens = function(...args){
    const result = typeof previousHideAllScreensV13 === "function"
      ? previousHideAllScreensV13.apply(this,args) : undefined;
    document.getElementById("guardianScreenV13")?.classList.add("hidden");
    return result;
  };

  const previousShowRewardsV13 = window.showRewards;
  window.showRewards = function(...args){
    const result = typeof previousShowRewardsV13 === "function"
      ? previousShowRewardsV13.apply(this,args) : undefined;
    renderAchievements();
    checkGuardianUnlockV13(false);
    revealActiveScreenV13();
    return result;
  };

  const previousShowParentV13 = window.showParentDashboard;
  window.showParentDashboard = function(...args){
    const result = typeof previousShowParentV13 === "function"
      ? previousShowParentV13.apply(this,args) : undefined;
    renderParentV13();
    revealActiveScreenV13();
    return result;
  };

  const previousShowWorldV13 = window.showWorldMap;
  window.showWorldMap = function(...args){
    const result = typeof previousShowWorldV13 === "function"
      ? previousShowWorldV13.apply(this,args) : undefined;
    renderWorldMap();
    return result;
  };

  const previousFinishFinalV13 = window.finishFinalCinematic;
  window.finishFinalCinematic = function(...args){
    const result = typeof previousFinishFinalV13 === "function"
      ? previousFinishFinalV13.apply(this,args) : undefined;
    if (checkGuardianUnlockV13(true)) {
      setTimeout(()=>showGuardianFinaleV13(),350);
    }
    return result;
  };

  const previousUnlockAchievementsV13 = window.unlockAchievements;
  window.unlockAchievements = function(...args){
    const result = typeof previousUnlockAchievementsV13 === "function"
      ? previousUnlockAchievementsV13.apply(this,args) : undefined;
    checkAchievementsV13(false);
    return result;
  };

  const previousUpdateGameUiV13 = updateGameUi;
  updateGameUi = function(){
    const result = previousUpdateGameUiV13();
    ensureV13State();
    renderDailyChestV13();
    renderGuardianHomeBannerV13();
    checkAchievementsV13(false);
    checkGuardianUnlockV13(false);
    if (!document.getElementById("parentScreen")?.classList.contains("hidden")) renderParentV13();
    return result;
  };
  window.updateGameUi = updateGameUi;

  function initV13(){
    ensureV13State();
    ensureDailyChestUiV13();
    ensureParentV13Ui();
    ensureGuardianScreenV13();
    ensureGuardianHomeBannerV13();
    ensureAdminV13();
    installMagicLayerV13();
    renderDailyChestV13();
    checkAchievementsV13(false);
    checkGuardianUnlockV13(false);
    renderGuardianHomeBannerV13();
    saveV13();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",initV13,{once:true});
  } else {
    initV13();
  }
})();
