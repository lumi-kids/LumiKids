
/* =========================================================
   LUMIKIDS — UNIVERS MATHS
   Module additionnel chargé APRÈS script.js.
   Il ne retire ni ne modifie le code Lecture.
========================================================= */
(function(){
  "use strict";

  const MATH_SCREEN_ID = "mathsAddonScreen";
  const MATH_KEYPAD_ID = "mathsKeypadOverlay";
  const MAX_ALLOWED = 15;
  const COINS_PER_CORRECT = 3;

  const state = {
    view: "home",
    operation: "addition",
    courseNumber: 1,
    coursePage: 0,
    max: 15,
    allowMissing: true,
    questionCount: 10,
    currentQuestion: null,
    currentIndex: 0,
    score: 0,
    coinsWon: 0,
    answer: "",
    locked: false,
    keypadMode: null,
    keypadValue: ""
  };

  const courseObjects = [
    "🍎",  // 1
    "🍌",  // 2
    "🍐",  // 3
    "🍓",  // 4
    "🫐",  // 5
    "🍊",  // 6
    "🍋",  // 7
    "🍉",  // 8
    "🍇",  // 9
    "🍒",  // 10
    "🥝",  // 11
    "🍑",  // 12
    "🥭",  // 13
    "🍍",  // 14
    "🫐"   // 15
  ];

  const oldHideAllScreens = window.hideAllScreens;
  window.hideAllScreens = function(){
    if (typeof oldHideAllScreens === "function") oldHideAllScreens();
    const screen = document.getElementById(MATH_SCREEN_ID);
    if (screen) screen.classList.add("hidden");
    closeMathsKeypad();
  };

  window.showMath = function(){
    ensureMathsScreen();
    window.hideAllScreens();
    state.view = "home";
    renderMaths();
  };

  function ensureMathsScreen(){
    if (document.getElementById(MATH_SCREEN_ID)) return;

    const oldMathScreen = document.getElementById("mathGame");
    if (oldMathScreen) oldMathScreen.classList.add("hidden");

    const screen = document.createElement("div");
    screen.id = MATH_SCREEN_ID;
    screen.className = "screen maths-addon-screen hidden";

    const shell = document.querySelector(".game-shell");
    if (!shell) throw new Error("Conteneur .game-shell introuvable.");

    shell.appendChild(screen);
    ensureMathsKeypad();
  }

  function renderMaths(){
    const screen = document.getElementById(MATH_SCREEN_ID);
    if (!screen) return;

    screen.classList.remove("hidden");

    if (state.view === "home") renderMathsHome(screen);
    else if (state.view === "operation") renderOperationMenu(screen);
    else if (state.view === "course-list") renderCourseList(screen);
    else if (state.view === "course") renderCourse(screen);
    else if (state.view === "settings") renderSettings(screen);
    else if (state.view === "game") renderGame(screen);
    else if (state.view === "result") renderResult(screen);
  }

  function heading(title, backAction, eyebrow = "Univers maths"){
    return `
      <div class="page-heading">
        <button class="back-btn" onclick="${backAction}">← Retour</button>
        <div>
          <p class="eyebrow">${eyebrow}</p>
          <h2>${title}</h2>
        </div>
      </div>`;
  }

  function renderMathsHome(screen){
    screen.innerHTML = `
      ${heading("Les mathématiques", "showHome()", "Un nouvel univers")}
      <section class="maths-hero">
        <div class="maths-hero-copy">
          <p class="eyebrow">Comprendre, manipuler, réussir</p>
          <h2>Les nombres deviennent un jeu !</h2>
          <p>Choisis une opération, découvre le cours avec des exemples concrets, puis entraîne-toi à ton rythme.</p>
        </div>
        <div class="maths-hero-visual">
          <div class="maths-floating-card">6 + 3 = 9</div>
        </div>
      </section>

      <div class="maths-section-title">
        <small>Choisis une notion</small>
        <h3>Que veux-tu apprendre ?</h3>
      </div>

      <div class="maths-operation-grid">
        <button class="maths-operation-card addition" onclick="openMathsOperation('addition')">
          <span class="maths-operation-symbol">+</span>
          <span>
            <strong>Additions</strong>
            <p>Ajouter, réunir et trouver le nombre manquant.</p>
            <em>De 0 à 15</em>
          </span>
        </button>

        <button class="maths-operation-card subtraction" onclick="openMathsOperation('subtraction')">
          <span class="maths-operation-symbol">−</span>
          <span>
            <strong>Soustractions</strong>
            <p>Enlever, comparer et trouver ce qui manque.</p>
            <em>De 0 à 15</em>
          </span>
        </button>

        <button class="maths-operation-card locked" onclick="mathsComingSoon()">
          <span class="maths-operation-symbol">×</span>
          <span>
            <strong>Multiplications</strong>
            <p>Cette notion arrivera dans une prochaine mise à jour.</p>
            <em>Bientôt</em>
          </span>
        </button>

        <button class="maths-operation-card locked" onclick="mathsComingSoon()">
          <span class="maths-operation-symbol">÷</span>
          <span>
            <strong>Divisions</strong>
            <p>Cette notion arrivera dans une prochaine mise à jour.</p>
            <em>Bientôt</em>
          </span>
        </button>
      </div>`;
  }

  function renderOperationMenu(screen){
    const label = operationLabel();
    const symbol = operationSymbol();

    screen.innerHTML = `
      ${heading(label, "backToMathsHome()")}
      <section class="maths-hero">
        <div class="maths-hero-copy">
          <p class="eyebrow">${label}</p>
          <h2>${symbol} Apprendre puis s’entraîner</h2>
          <p>Commence par un cours imagé, ou configure directement une partie adaptée à ton niveau.</p>
        </div>
        <div class="maths-hero-visual">
          <div class="maths-floating-card">${state.operation === "addition" ? "4 + 2 = 6" : "7 − 3 = 4"}</div>
        </div>
      </section>

      <div class="maths-section-title">
        <small>${label}</small>
        <h3>Choisis ton activité</h3>
      </div>

      <div class="maths-submenu-grid">
        <button class="maths-submenu-card course" onclick="openMathsCourseList()">
          <span class="maths-submenu-icon">📖</span>
          <strong>Le cours</strong>
          <p>Des flèches, des objets et des exemples expliqués de 1 à 15.</p>
        </button>

        <button class="maths-submenu-card exercise" onclick="openMathsSettings()">
          <span class="maths-submenu-icon">🎮</span>
          <strong>Les exercices</strong>
          <p>Choisis le nombre maximum, les cases vides et la durée de la partie.</p>
        </button>
      </div>`;
  }

  function renderCourseList(screen){
    const buttons = Array.from({length:15},(_,index) => {
      const number = index + 1;
      return `<button class="maths-number-course-button" onclick="openMathsCourse(${number})">${number}</button>`;
    }).join("");

    screen.innerHTML = `
      ${heading("Choisir un nombre", "backToMathsOperation()", operationLabel())}
      <div class="maths-section-title">
        <small>Cours classés</small>
        <h3>Travaille avec quel nombre ?</h3>
      </div>
      <div class="maths-number-course-grid">${buttons}</div>`;
  }

  function getCoursePages(){
    const number = state.courseNumber;
    const a = Math.max(0, Math.floor(number / 2));
    const b = Math.max(0, number - a);
    const object = courseObjects[(number - 1) % courseObjects.length];

    if (state.operation === "addition") {
      return [
        {
          title:`Ajouter jusqu’à ${number}`,
          text:`Une addition sert à <strong>réunir</strong> plusieurs groupes.`,
          top:a,
          bottom:b,
          equation:`${a} + ${b} = ${number}`,
          object
        },
        {
          title:"Le signe +",
          text:"Le signe <strong>+</strong> veut dire : j’ajoute quelque chose au premier groupe.",
          top:Math.max(0, number - 1),
          bottom:1,
          equation:`${Math.max(0, number - 1)} + 1 = ${number}`,
          object
        },
        {
          title:"Trouver la case vide",
          text:`Dans <strong>□ + ${b} = ${number}</strong>, on cherche combien il faut ajouter à ${b} pour arriver à ${number}.`,
          top:a,
          bottom:b,
          equation:`□ + ${b} = ${number}  →  □ = ${a}`,
          object
        }
      ];
    }

    const start = Math.min(15, Math.max(number, number + Math.max(1, Math.floor(number / 3))));
    const removed = start - number;

    return [
      {
        title:`Retirer pour obtenir ${number}`,
        text:"Une soustraction sert à <strong>enlever</strong> une quantité.",
        top:start,
        bottom:removed,
        equation:`${start} − ${removed} = ${number}`,
        object
      },
      {
        title:"Le signe −",
        text:"Le signe <strong>−</strong> veut dire : j’enlève une partie du groupe.",
        top:Math.min(15, number + 1),
        bottom:1,
        equation:`${Math.min(15, number + 1)} − 1 = ${number}`,
        object
      },
      {
        title:"Trouver la case vide",
        text:`Dans <strong>${start} − □ = ${number}</strong>, on cherche combien il faut retirer pour obtenir ${number}.`,
        top:start,
        bottom:removed,
        equation:`${start} − □ = ${number}  →  □ = ${removed}`,
        object
      }
    ];
  }

  function objects(count, symbol){
    if (count <= 0) return '<span class="maths-object">0</span>';
    return Array.from({length:count},() => `<span class="maths-object">${symbol}</span>`).join("");
  }

  function fruitColumnCount(count, maximum){
    const safeCount = Math.max(1, Number(count) || 1);
    return Math.min(safeCount, maximum);
  }

  function renderIllustratedOperation(page){
    const first = Number(page.top) || 0;
    const second = Number(page.bottom) || 0;
    const result = state.operation === "addition"
      ? first + second
      : Math.max(0, first - second);

    const operator = state.operation === "addition" ? "+" : "−";
    const firstColumns = fruitColumnCount(first, 3);
    const secondColumns = fruitColumnCount(second, 3);
    const resultColumns = fruitColumnCount(result, 5);

    return `
      <div class="maths-illustrated-equation" aria-label="${first} ${operator} ${second} égale ${result}">
        <div class="maths-illustrated-term">
          <div class="maths-fruit-group maths-fruit-group-operand"
               style="--fruit-columns:${firstColumns}">
            ${objects(first,page.object)}
          </div>
          <div class="maths-term-label">${first}</div>
        </div>

        <div class="maths-illustrated-operator">
          <div class="maths-operator-top">${operator}</div>
          <div class="maths-operator-bottom">${operator}</div>
        </div>

        <div class="maths-illustrated-term">
          <div class="maths-fruit-group maths-fruit-group-operand"
               style="--fruit-columns:${secondColumns}">
            ${objects(second,page.object)}
          </div>
          <div class="maths-term-label">${second}</div>
        </div>

        <div class="maths-illustrated-operator">
          <div class="maths-operator-top">=</div>
          <div class="maths-operator-bottom">=</div>
        </div>

        <div class="maths-illustrated-term result">
          <div class="maths-fruit-group maths-fruit-group-result"
               style="--fruit-columns:${resultColumns}">
            ${objects(result,page.object)}
          </div>
          <div class="maths-term-label">${result}</div>
        </div>
      </div>`;
  }

  function renderCourse(screen){
    const pages = getCoursePages();
    const page = pages[state.coursePage] || pages[0];
    const isSubtraction = state.operation === "subtraction";

    screen.innerHTML = `
      ${heading(`Cours avec ${state.courseNumber}`, "openMathsCourseList()", operationLabel())}
      <article class="maths-course-card">
        <div class="maths-course-top">
          <div>
            <p class="eyebrow">Étape ${state.coursePage + 1} sur ${pages.length}</p>
            <h3>${page.title}</h3>
            <p>Regarde les objets et suis la transformation.</p>
          </div>
          <button class="maths-listen-button" onclick="listenMathsCourse()" aria-label="Écouter le cours">🔊</button>
        </div>

        <div class="maths-course-visual maths-course-visual-horizontal">
          ${renderIllustratedOperation(page)}
        </div>

        <div class="maths-course-explanation">${page.text}</div>

        <div class="maths-course-pagination">
          ${state.coursePage > 0
            ? '<button class="secondary" onclick="previousMathsCoursePage()">← Précédent</button>'
            : ""}
          ${state.coursePage < pages.length - 1
            ? '<button class="main" onclick="nextMathsCoursePage()">Continuer →</button>'
            : '<button class="main" onclick="openMathsSettings()">Faire des exercices →</button>'}
        </div>
      </article>`;
  }

  function renderSettings(screen){
    screen.innerHTML = `
      ${heading("Préparer une partie", "backToMathsOperation()", operationLabel())}
      <section class="maths-settings-card">
        <div class="maths-settings-grid">
          <article class="maths-setting">
            <small>Nombre minimum</small>
            <strong>Toujours 0</strong>
            <button class="maths-number-field" disabled>0</button>
          </article>

          <article class="maths-setting">
            <small>Nombre maximum</small>
            <strong>Choisis entre 1 et 15</strong>
            <button class="maths-number-field ${state.max ? "" : "placeholder"}" onclick="openMathsKeypad('max')">
              ${state.max || "Exemple : 15"}
            </button>
          </article>

          <article class="maths-setting full">
            <small>Type de calcul</small>
            <strong>Opération sélectionnée</strong>
            <div class="maths-choice-row">
              <button class="maths-choice-button ${state.operation === "addition" ? "active" : ""}" onclick="setMathsOperation('addition')">Addition</button>
              <button class="maths-choice-button ${state.operation === "subtraction" ? "active" : ""}" onclick="setMathsOperation('subtraction')">Soustraction</button>
            </div>
          </article>

          <article class="maths-setting full">
            <small>Cases vides</small>
            <strong>Ajouter des nombres mystères</strong>
            <button class="maths-toggle ${state.allowMissing ? "active" : ""}" onclick="toggleMathsMissing()">
              <span>${state.allowMissing ? "Oui, mélanger les cases vides" : "Non, résultat uniquement"}</span>
              <span class="maths-toggle-indicator"></span>
            </button>
          </article>

          <article class="maths-setting full">
            <small>Durée</small>
            <strong>Nombre de questions</strong>
            <div class="maths-choice-row">
              ${[5,10,20].map(number => `
                <button class="maths-choice-button ${state.questionCount === number ? "active" : ""}"
                        onclick="setMathsQuestionCount(${number})">${number}</button>
              `).join("")}
            </div>
          </article>
        </div>

        <button class="maths-start-button" onclick="startMathsGame()">Commencer la partie →</button>
      </section>`;
  }

  function renderGame(screen){
    const q = state.currentQuestion;
    if (!q) {
      generateQuestion();
      return renderGame(screen);
    }

    const progress = state.questionCount
      ? Math.round(state.currentIndex / state.questionCount * 100)
      : 0;

    screen.innerHTML = `
      ${heading("À toi de jouer", "confirmQuitMathsGame()", operationLabel())}
      <section class="maths-game-card">
        <div class="maths-game-header">
          <div class="maths-progress-track"><span style="width:${progress}%"></span></div>
          <div class="maths-game-stat"><small>Question</small><strong>${Math.min(state.currentIndex + 1,state.questionCount)}/${state.questionCount}</strong></div>
          <div class="maths-game-stat"><small>Score</small><strong>${state.score}</strong></div>
        </div>

        <div class="maths-question-box">
          <div>
            <span class="maths-question-label">${q.label}</span>
            <div class="maths-question">${q.html}</div>
          </div>
        </div>

        <button class="maths-answer-display ${state.answer === "" ? "empty" : ""}" onclick="openMathsKeypad('answer')">
          ${state.answer === "" ? "Appuie ici pour écrire ta réponse" : state.answer}
        </button>

        <div id="mathsFeedback" class="maths-feedback"></div>

        <div class="maths-game-actions">
          <button class="maths-validate" onclick="validateMathsAnswer()">Valider</button>
          <button class="maths-quit" onclick="confirmQuitMathsGame()">Arrêter</button>
        </div>
      </section>`;
  }

  function renderResult(screen){
    screen.innerHTML = `
      ${heading("Partie terminée", "openMathsOperation(state.operation)", operationLabel())}
      <section class="maths-result-card">
        <div class="maths-result-icon">🏆</div>
        <h2>Bravo !</h2>
        <div class="maths-result-score">${state.score} / ${state.questionCount}</div>
        <p>Tu as gagné <strong>🪙 ${state.coinsWon} pièces</strong>.<br>Les exercices de maths ne donnent pas d’étoiles.</p>
        <div class="maths-result-actions">
          <button class="main" onclick="replayMathsGame()">Rejouer</button>
          <button class="secondary" onclick="openMathsSettings()">Modifier les réglages</button>
          <button class="secondary" onclick="backToMathsHome()">Menu maths</button>
        </div>
      </section>`;
  }

  function operationLabel(){
    return state.operation === "addition" ? "Les additions" : "Les soustractions";
  }

  function operationSymbol(){
    return state.operation === "addition" ? "+" : "−";
  }

  function randomInt(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateQuestion(){
    const max = Math.max(1,Math.min(MAX_ALLOWED,Number(state.max) || MAX_ALLOWED));
    let a = 0;
    let b = 0;
    let result = 0;

    if (state.operation === "addition") {
      result = randomInt(0,max);
      a = randomInt(0,result);
      b = result - a;
    } else {
      a = randomInt(0,max);
      b = randomInt(0,a);
      result = a - b;
    }

    let blankType = "result";
    if (state.allowMissing) {
      const choices = state.operation === "addition"
        ? ["result","first","second"]
        : ["result","first","second"];
      blankType = choices[randomInt(0,choices.length - 1)];
    }

    let correct = result;
    let left = String(a);
    let right = String(b);
    let resultHtml = '<span class="maths-empty-box">?</span>';

    if (blankType === "first") {
      correct = a;
      left = '<span class="maths-empty-box">?</span>';
      resultHtml = String(result);
    } else if (blankType === "second") {
      correct = b;
      right = '<span class="maths-empty-box">?</span>';
      resultHtml = String(result);
    }

    state.currentQuestion = {
      a,b,result,correct,blankType,
      html:`${left} ${operationSymbol()} ${right} = ${resultHtml}`,
      label:blankType === "result"
        ? "Calcule le résultat"
        : "Trouve le nombre qui manque"
    };
    state.answer = "";
    state.locked = false;
  }

  function awardMathsCoins(amount){
    if (!window.gameState) return;
    gameState.coins = Number(gameState.coins || 0) + amount;
    gameState.correctAnswers = Number(gameState.correctAnswers || 0) + 1;
    gameState.totalAnswers = Number(gameState.totalAnswers || 0) + 1;
    gameState.lastActivity = "math";
    if (typeof incrementDailyChallenge === "function") incrementDailyChallenge(1);
    if (typeof saveGameState === "function") saveGameState();
    if (typeof updateGameUi === "function") updateGameUi();
  }

  function recordMathsWrong(){
    if (!window.gameState) return;
    gameState.totalAnswers = Number(gameState.totalAnswers || 0) + 1;
    if (typeof saveGameState === "function") saveGameState();
    if (typeof updateGameUi === "function") updateGameUi();
  }

  function finishMathsGame(){
    state.view = "result";
    state.currentQuestion = null;
    renderMaths();
  }

  function ensureMathsKeypad(){
    if (document.getElementById(MATH_KEYPAD_ID)) return;

    const overlay = document.createElement("div");
    overlay.id = MATH_KEYPAD_ID;
    overlay.className = "maths-keypad-overlay hidden";
    overlay.setAttribute("aria-hidden","true");
    overlay.innerHTML = `
      <section class="maths-keypad-modal" role="dialog" aria-modal="true" aria-labelledby="mathsKeypadTitle">
        <button class="maths-keypad-close" onclick="closeMathsKeypad()" aria-label="Fermer">×</button>
        <small>Clavier numérique</small>
        <h3 id="mathsKeypadTitle">Entre un nombre</h3>
        <div id="mathsKeypadValue" class="maths-keypad-value">0</div>
        <div class="maths-keypad">
          ${["1","2","3","4","5","6","7","8","9"].map(digit =>
            `<button onclick="mathsKeypadDigit('${digit}')">${digit}</button>`
          ).join("")}
          <button class="clear" onclick="mathsKeypadClear()">Effacer</button>
          <button onclick="mathsKeypadDigit('0')">0</button>
          <button class="maths-keypad-confirm-button" onclick="mathsKeypadConfirm()"><span>Valider</span></button>
        </div>
      </section>`;

    overlay.addEventListener("click",event => {
      if (event.target === overlay) closeMathsKeypad();
    });

    document.body.appendChild(overlay);
  }

  window.openMathsOperation = function(operation){
    state.operation = operation === "subtraction" ? "subtraction" : "addition";
    state.view = "operation";
    renderMaths();
  };

  window.backToMathsHome = function(){
    state.view = "home";
    renderMaths();
  };

  window.backToMathsOperation = function(){
    state.view = "operation";
    renderMaths();
  };

  window.openMathsCourseList = function(){
    state.view = "course-list";
    renderMaths();
  };

  window.openMathsCourse = function(number){
    state.courseNumber = Math.max(1,Math.min(15,Number(number) || 1));
    state.coursePage = 0;
    state.view = "course";
    renderMaths();
  };

  window.previousMathsCoursePage = function(){
    state.coursePage = Math.max(0,state.coursePage - 1);
    renderMaths();
  };

  window.nextMathsCoursePage = function(){
    state.coursePage = Math.min(getCoursePages().length - 1,state.coursePage + 1);
    renderMaths();
  };

  window.listenMathsCourse = function(){
    const page = getCoursePages()[state.coursePage];
    if (!page) return;

    const clean = `${page.title}. ${page.text.replace(/<[^>]+>/g," ")}. ${page.equation.replace("→","donc")}`;
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "fr-FR";
      utterance.rate = .86;
      speechSynthesis.speak(utterance);
    }
  };

  window.openMathsSettings = function(){
    state.view = "settings";
    renderMaths();
  };

  window.setMathsOperation = function(operation){
    state.operation = operation === "subtraction" ? "subtraction" : "addition";
    renderMaths();
  };

  window.toggleMathsMissing = function(){
    state.allowMissing = !state.allowMissing;
    renderMaths();
  };

  window.setMathsQuestionCount = function(number){
    state.questionCount = [5,10,20].includes(Number(number)) ? Number(number) : 10;
    renderMaths();
  };

  window.startMathsGame = function(){
    state.currentIndex = 0;
    state.score = 0;
    state.coinsWon = 0;
    state.answer = "";
    state.locked = false;
    state.currentQuestion = null;
    state.view = "game";
    generateQuestion();
    renderMaths();
  };

  window.replayMathsGame = function(){
    startMathsGame();
  };

  window.validateMathsAnswer = function(){
    if (state.locked) return;

    const feedback = document.getElementById("mathsFeedback");
    if (!feedback) return;

    if (state.answer === "") {
      feedback.textContent = "Écris une réponse 🙂";
      feedback.className = "maths-feedback bad";
      return;
    }

    const answer = Number(state.answer);
    if (answer !== state.currentQuestion.correct) {
      feedback.textContent = "Essaie encore, tu peux y arriver !";
      feedback.className = "maths-feedback bad";
      state.answer = "";
      recordMathsWrong();
      setTimeout(renderMaths,650);
      return;
    }

    state.locked = true;
    state.score += 1;
    state.coinsWon += COINS_PER_CORRECT;
    awardMathsCoins(COINS_PER_CORRECT);

    feedback.textContent = `Bravo ! +${COINS_PER_CORRECT} pièces`;
    feedback.className = "maths-feedback good";

    if (typeof createConfetti === "function") createConfetti();

    setTimeout(() => {
      state.currentIndex += 1;
      if (state.currentIndex >= state.questionCount) {
        finishMathsGame();
      } else {
        generateQuestion();
        renderMaths();
      }
    },800);
  };

  window.confirmQuitMathsGame = function(){
    state.view = "settings";
    state.currentQuestion = null;
    renderMaths();
  };

  window.mathsComingSoon = function(){
    if (typeof showToast === "function") showToast("Cette notion arrive bientôt !");
  };

  window.openMathsKeypad = function(mode){
    ensureMathsKeypad();
    state.keypadMode = mode;
    state.keypadValue = mode === "answer" ? state.answer : "";
    updateKeypadDisplay();

    const overlay = document.getElementById(MATH_KEYPAD_ID);
    const title = document.getElementById("mathsKeypadTitle");

    if (title) {
      title.textContent = mode === "max"
        ? "Choisis le nombre maximum"
        : "Entre ta réponse";
    }

    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden","false");
  };

  window.closeMathsKeypad = function(){
    const overlay = document.getElementById(MATH_KEYPAD_ID);
    if (!overlay) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden","true");
    state.keypadMode = null;
    state.keypadValue = "";
  };

  window.mathsKeypadDigit = function(digit){
    if (!/^\d$/.test(String(digit))) return;
    if (state.keypadValue.length >= 2) return;
    state.keypadValue = (state.keypadValue + digit).replace(/^0+(?=\d)/,"");
    updateKeypadDisplay();
  };

  window.mathsKeypadClear = function(){
    state.keypadValue = "";
    updateKeypadDisplay();
  };

  window.mathsKeypadConfirm = function(){
    const value = Number(state.keypadValue);

    if (state.keypadMode === "max") {
      if (!Number.isInteger(value) || value < 1 || value > MAX_ALLOWED) {
        if (typeof showToast === "function") showToast("Choisis un nombre entre 1 et 15.");
        return;
      }
      state.max = value;
    } else if (state.keypadMode === "answer") {
      if (state.keypadValue === "") {
        if (typeof showToast === "function") showToast("Entre une réponse.");
        return;
      }
      state.answer = String(value);
    }

    closeMathsKeypad();
    renderMaths();
  };

  function updateKeypadDisplay(){
    const display = document.getElementById("mathsKeypadValue");
    if (display) display.textContent = state.keypadValue || "0";
  }

  document.addEventListener("keydown",event => {
    const overlay = document.getElementById(MATH_KEYPAD_ID);
    if (!overlay || overlay.classList.contains("hidden")) return;

    if (/^\d$/.test(event.key)) mathsKeypadDigit(event.key);
    else if (event.key === "Backspace") {
      state.keypadValue = state.keypadValue.slice(0,-1);
      updateKeypadDisplay();
    } else if (event.key === "Enter") mathsKeypadConfirm();
    else if (event.key === "Escape") closeMathsKeypad();
  });



  /* =========================================================
     LUMIKIDS — CONNEXION AUDIO DU MODULE MATHS
  ========================================================= */
  (function connectMathsAudio(){
    const audio = () => window.LumiAudio;

    function wrapPublic(name, before, after){
      const original = window[name];
      if (typeof original !== "function" || original.__lumiMathAudioWrapped) return;

      const wrapped = function(...args){
        if (typeof before === "function") before.apply(this,args);
        const result = original.apply(this,args);
        if (typeof after === "function") after.apply(this,args);
        return result;
      };

      wrapped.__lumiMathAudioWrapped = true;
      window[name] = wrapped;
    }

    // Les menus et réglages de maths gardent la musique générale.
    [
      "showMath",
      "openMathsOperation",
      "backToMathsHome",
      "backToMathsOperation",
      "openMathsCourseList",
      "openMathsSettings",
      "confirmQuitMathsGame"
    ].forEach(name => wrapPublic(name, null, () => audio()?.playMenu()));

    // Le cours reste silencieux pour bien entendre sa lecture.
    wrapPublic("openMathsCourse", () => audio()?.stopBackground(true));
    wrapPublic("listenMathsCourse", () => audio()?.stopBackground(true));

    // Une partie de maths coupe toute musique de fond.
    wrapPublic("startMathsGame", () => audio()?.stopBackground(true));
    wrapPublic("replayMathsGame", () => audio()?.stopBackground(true));

    wrapPublic("validateMathsAnswer", () => {
      audio()?.playValidation();
      const correctBefore = state.currentQuestion?.correct;
      const answerBefore = Number(state.answer);
      setTimeout(() => {
        if (state.answer === "" && answerBefore !== correctBefore) {
          audio()?.playWrong();
        } else if (answerBefore === correctBefore) {
          audio()?.playCorrect();
        }
      }, 0);
    });

    // Le résultat final réactive la musique du menu après le son de fin.
    const originalRenderResult = renderResult;
    renderResult = function(screen){
      audio()?.playExerciseComplete();
      setTimeout(() => audio()?.playMenu(), 650);
      return originalRenderResult(screen);
    };
  })();

  ensureMathsScreen();
})();
