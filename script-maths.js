
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
    adaptive: true,
    visualAid: "objects",
    adaptiveLevel: 3,
    consecutiveWrong: 0,
    currentStreak: 0,
    bestStreak: 0,
    currentQuestion: null,
    currentIndex: 0,
    score: 0,
    coinsWon: 0,
    wrongCount: 0,
    questionAttempts: 0,
    sessionMistakes: [],
    answer: "",
    selectedChoice: "",
    locked: false,
    keypadMode: null,
    keypadValue: ""
  };

  const savedMathSettingsV12 = window.LumiKidsMathBridge?.getSettings?.() || {};
  Object.assign(state,{
    operation:["addition","subtraction","comparison","problem","mixed"].includes(savedMathSettingsV12.operation)
      ? savedMathSettingsV12.operation : "addition",
    max:Math.max(1,Math.min(MAX_ALLOWED,Number(savedMathSettingsV12.max)||15)),
    allowMissing:savedMathSettingsV12.allowMissing !== false,
    questionCount:[5,10,20].includes(Number(savedMathSettingsV12.questionCount))
      ? Number(savedMathSettingsV12.questionCount) : 10,
    adaptive:savedMathSettingsV12.adaptive !== false,
    visualAid:["objects","fingers","numberLine","dots","none"].includes(savedMathSettingsV12.visualAid)
      ? savedMathSettingsV12.visualAid : "objects"
  });

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
    saveMathResumeV12(false);
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

        <button class="maths-operation-card mixed" onclick="openMathsOperation('mixed')">
          <span class="maths-operation-symbol">±</span>
          <span>
            <strong>Calculs mélangés</strong>
            <p>Additions, soustractions, cases vides, comparaisons et petits problèmes.</p>
            <em>Entraînement complet</em>
          </span>
        </button>

        <button class="maths-operation-card comparison" onclick="openMathsOperation('comparison')">
          <span class="maths-operation-symbol">≷</span>
          <span>
            <strong>Comparer</strong>
            <p>Choisir &gt;, &lt; ou = et ranger les nombres.</p>
            <em>De 0 à 15</em>
          </span>
        </button>

        <button class="maths-operation-card problem" onclick="openMathsOperation('problem')">
          <span class="maths-operation-symbol">🧩</span>
          <span>
            <strong>Petits problèmes</strong>
            <p>Résoudre de courtes histoires avec Lumi et ses amis.</p>
            <em>Lecture et calcul</em>
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
          <p>${operationDescription()}</p>
        </div>
        <div class="maths-hero-visual">
          <div class="maths-floating-card">${operationExample()}</div>
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
      ${heading(state.operation === "comparison" ? "Choisir un niveau" : state.operation === "problem" || state.operation === "mixed" ? "Choisir une difficulté" : "Choisir un nombre", "backToMathsOperation()", operationLabel())}
      <div class="maths-section-title">
        <small>Cours classés</small>
        <h3>${state.operation === "addition" || state.operation === "subtraction" ? "Travaille avec quel nombre ?" : "Jusqu’à quel nombre veux-tu travailler ?"}</h3>
      </div>
      <div class="maths-number-course-grid">${buttons}</div>`;
  }

  function getCoursePages(){
    const number = state.courseNumber;
    const a = Math.max(0, Math.floor(number / 2));
    const b = Math.max(0, number - a);
    const object = courseObjects[(number - 1) % courseObjects.length];

    if (state.operation === "comparison") {
      const smaller = Math.max(0,number-1);
      return [
        {
          title:"Comparer deux nombres",
          text:"On regarde les deux quantités. Le signe s’ouvre toujours du côté du plus grand nombre.",
          top:number,
          bottom:smaller,
          operator:">",
          equation:`${number} > ${smaller}`,
          object
        },
        {
          title:"Le signe égal",
          text:"Quand les deux côtés ont la même quantité, on utilise le signe <strong>=</strong>.",
          top:number,
          bottom:number,
          operator:"=",
          equation:`${number} = ${number}`,
          object
        },
        {
          title:"Le plus petit nombre",
          text:"Le signe <strong>&lt;</strong> signifie que le nombre de gauche est plus petit.",
          top:smaller,
          bottom:number,
          operator:"<",
          equation:`${smaller} < ${number}`,
          object
        }
      ];
    }

    if (state.operation === "problem") {
      const added = Math.max(1,Math.min(5,Math.ceil(number/3)));
      const start = Math.max(0,number-added);
      return [
        {
          title:"Repérer les nombres",
          text:`Lumi possède <strong>${start}</strong> étoiles et en trouve <strong>${added}</strong>. On cherche combien elle en a maintenant.`,
          top:start,
          bottom:added,
          operator:"+",
          equation:`${start} + ${added} = ${number}`,
          object:"⭐"
        },
        {
          title:"Choisir l’opération",
          text:"Les mots « encore », « gagne » ou « trouve » indiquent souvent qu’il faut ajouter.",
          top:start,
          bottom:added,
          operator:"+",
          equation:`${start} + ${added} = ${number}`,
          object:"⭐"
        },
        {
          title:"Vérifier la réponse",
          text:"On recompte tous les objets pour vérifier que le résultat correspond bien à l’histoire.",
          top:start,
          bottom:added,
          operator:"+",
          equation:`${start} + ${added} = ${number}`,
          object:"⭐"
        }
      ];
    }

    if (state.operation === "mixed") {
      const removed = Math.max(1,Math.min(number,Math.ceil(number/3)));
      return [
        {
          title:"Observer le signe",
          text:"Avant de calculer, regarde si la question demande d’ajouter, d’enlever ou de comparer.",
          top:Math.max(0,number-removed),
          bottom:removed,
          operator:"+",
          equation:`${Math.max(0,number-removed)} + ${removed} = ${number}`,
          object
        },
        {
          title:"Chercher une case vide",
          text:"Une case vide peut se trouver au début, au milieu ou à la fin du calcul.",
          top:number,
          bottom:removed,
          operator:"−",
          equation:`${number} − □ = ${Math.max(0,number-removed)}`,
          object
        },
        {
          title:"Comparer le résultat",
          text:"Après le calcul, vérifie si le résultat est plus petit, plus grand ou égal à un autre nombre.",
          top:number,
          bottom:Math.max(0,number-1),
          operator:">",
          equation:`${number} > ${Math.max(0,number-1)}`,
          object
        }
      ];
    }

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
    const operator = page.operator || (state.operation === "addition" ? "+" : "−");
    const result = operator === "+"
      ? first + second
      : operator === "−"
        ? Math.max(0, first - second)
        : second;
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

        ${["<",">","="].includes(operator) ? "" : `
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
          </div>`}
      </div>`;
  }

  function renderCourse(screen){
    const pages = getCoursePages();
    const page = pages[state.coursePage] || pages[0];
    const isSubtraction = state.operation === "subtraction";

    screen.innerHTML = `
      ${heading(`${operationLabel()} · niveau ${state.courseNumber}`, "openMathsCourseList()", "Mini-cours")}
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
    const missingAvailable = ["addition","subtraction","mixed"].includes(state.operation);
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
            <small>Type de partie</small>
            <strong>Choisis ce que tu veux travailler</strong>
            <div class="maths-choice-row maths-mode-choice-v12">
              ${[
                ["addition","Addition"],
                ["subtraction","Soustraction"],
                ["mixed","Mélangé"],
                ["comparison","Comparer"],
                ["problem","Problèmes"]
              ].map(([key,label]) => `<button class="maths-choice-button ${state.operation===key?"active":""}" onclick="setMathsOperation('${key}')">${label}</button>`).join("")}
            </div>
          </article>

          <article class="maths-setting full ${missingAvailable ? "" : "disabled-v12"}">
            <small>Formes de calcul</small>
            <strong>Résultat, premier nombre, second nombre ou calcul inversé</strong>
            <button class="maths-toggle ${state.allowMissing && missingAvailable ? "active" : ""}" onclick="${missingAvailable ? "toggleMathsMissing()" : "mathsSettingUnavailableV12()"}">
              <span>${missingAvailable ? (state.allowMissing ? "Oui, mélanger toutes les formes" : "Non, résultat uniquement") : "Réglage automatique pour cette activité"}</span>
              <span class="maths-toggle-indicator"></span>
            </button>
          </article>

          <article class="maths-setting full">
            <small>Difficulté adaptative</small>
            <strong>Le jeu s’ajuste selon les réussites et les erreurs</strong>
            <button class="maths-toggle ${state.adaptive ? "active" : ""}" onclick="toggleMathsAdaptiveV12()">
              <span>${state.adaptive ? "Activée : la difficulté évolue pendant la partie" : "Désactivée : difficulté fixe"}</span>
              <span class="maths-toggle-indicator"></span>
            </button>
          </article>

          <article class="maths-setting full">
            <small>Aide visuelle</small>
            <strong>Choisis ce qui accompagne les calculs</strong>
            <div class="maths-visual-aid-grid-v12">
              ${[
                ["objects","🍎","Objets"],
                ["fingers","🖐️","Doigts"],
                ["numberLine","↔","Ligne"],
                ["dots","●","Points"],
                ["none","×","Aucune"]
              ].map(([key,icon,label]) => `<button class="${state.visualAid===key?"active":""}" onclick="setMathsVisualAidV12('${key}')"><span>${icon}</span><strong>${label}</strong></button>`).join("")}
            </div>
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

        <div class="maths-adaptive-preview-v12">
          <span>🎯</span>
          <div><strong>Niveau de départ conseillé</strong><p>Les questions iront jusqu’à ${effectiveMax()}. Une série de 5 bonnes réponses donne 5 pièces bonus.</p></div>
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

    const answerArea = q.answerType === "choice"
      ? `<div class="maths-answer-choices-v12">
          ${q.choices.map(choice => `<button class="${String(state.selectedChoice)===String(choice)?"selected":""}" onclick="selectMathsChoiceV12(decodeURIComponent('${encodeURIComponent(String(choice))}'))">${choice}</button>`).join("")}
        </div>`
      : `<button class="maths-answer-display ${state.answer === "" ? "empty" : ""}" onclick="openMathsKeypad('answer')">
          ${state.answer === "" ? "Appuie ici pour écrire ta réponse" : state.answer}
        </button>`;

    screen.innerHTML = `
      ${heading("À toi de jouer", "confirmQuitMathsGame()", operationLabel(q.operation))}
      <section class="maths-game-card">
        <div class="maths-game-header">
          <div class="maths-progress-track"><span style="width:${progress}%"></span></div>
          <div class="maths-game-stat"><small>Question</small><strong>${Math.min(state.currentIndex + 1,state.questionCount)}/${state.questionCount}</strong></div>
          <div class="maths-game-stat"><small>Premier essai</small><strong>${state.score}</strong></div>
          <div class="maths-game-stat streak-v12"><small>Série</small><strong>🔥 ${state.currentStreak}</strong></div>
        </div>

        <div class="maths-question-box">
          <div>
            <span class="maths-question-label">${q.label}</span>
            ${q.story ? `<p class="maths-problem-story-v12">${q.story}</p>` : ""}
            <div class="maths-question">${q.html}</div>
          </div>
        </div>

        ${renderQuestionVisualV12(q)}
        ${answerArea}

        <div id="mathsFeedback" class="maths-feedback"></div>

        <div class="maths-game-actions">
          <button class="maths-validate" onclick="validateMathsAnswer()">Valider</button>
          <button class="maths-quit" onclick="confirmQuitMathsGame()">Arrêter</button>
        </div>
      </section>`;
  }

  function renderResult(screen){
    const firstTryPercent = state.questionCount
      ? Math.round(state.score/state.questionCount*100)
      : 0;
    const review = [...new Set(state.sessionMistakes.map(item => item.equation || item.prompt).filter(Boolean))];
    const mathsMistakeCount = window.LumiKidsMathBridge?.countMistakes?.("all") || 0;

    screen.innerHTML = `
      ${heading("Partie terminée", "openMathsOperation(state.operation)", operationLabel())}
      <section class="maths-result-card maths-result-v12">
        <div class="maths-result-icon">${state.wrongCount ? "🌟" : "🏆"}</div>
        <h2>${state.wrongCount ? "Belle progression !" : "Série parfaite !"}</h2>
        <div class="maths-result-score">${state.score} / ${state.questionCount}</div>
        <p>${firstTryPercent}% de réponses justes du premier coup.</p>

        <div class="maths-result-details-v12">
          <article><small>Erreurs</small><strong>${state.wrongCount}</strong></article>
          <article><small>Meilleure série</small><strong>🔥 ${state.bestStreak}</strong></article>
          <article><small>Pièces</small><strong>🪙 ${state.coinsWon}</strong></article>
          <article><small>Difficulté finale</small><strong>${effectiveMax()}</strong></article>
        </div>

        <div class="maths-result-review-v12 ${review.length ? "" : "success"}">
          <small>À revoir</small>
          <p>${review.length ? review.slice(0,5).join(" · ") : "Aucun calcul ajouté aux erreurs."}</p>
        </div>

        <div class="maths-result-actions">
          <button class="main" onclick="replayMathsGame()">Rejouer</button>
          ${mathsMistakeCount ? `<button class="secondary accent-v12" onclick="openMathMistakesV12()">Refaire mes erreurs (${mathsMistakeCount})</button>` : ""}
          <button class="secondary" onclick="openMathsSettings()">Modifier les réglages</button>
          <button class="secondary" onclick="backToMathsHome()">Menu maths</button>
        </div>
      </section>`;
  }

  function operationLabel(operation = state.operation){
    return {
      addition:"Les additions",
      subtraction:"Les soustractions",
      mixed:"Les calculs mélangés",
      comparison:"Les comparaisons",
      problem:"Les petits problèmes"
    }[operation] || "Les mathématiques";
  }

  function operationSymbol(operation = state.operation){
    return {
      addition:"+",
      subtraction:"−",
      mixed:"±",
      comparison:"≷",
      problem:"🧩"
    }[operation] || "+";
  }

  function operationDescription(){
    return {
      addition:"Réunis des quantités, trouve des résultats et complète des nombres manquants.",
      subtraction:"Enlève des quantités, trouve ce qui reste et complète des nombres manquants.",
      mixed:"Mélange les additions, les soustractions, les comparaisons et les petits problèmes.",
      comparison:"Compare deux nombres avec les signes plus grand, plus petit ou égal.",
      problem:"Lis une courte histoire puis choisis l’opération qui permet de trouver la réponse."
    }[state.operation] || "Entraîne-toi à ton rythme.";
  }

  function operationExample(){
    return {
      addition:"4 + 2 = 6",
      subtraction:"7 − 3 = 4",
      mixed:"8 − ? = 5",
      comparison:"9 > 6",
      problem:"⭐ 4 + 3 = ?"
    }[state.operation] || "2 + 2 = 4";
  }

  function randomInt(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clampV12(value,min,max){
    return Math.max(min,Math.min(max,value));
  }

  function effectiveMax(){
    const base = clampV12(Number(state.max)||MAX_ALLOWED,1,MAX_ALLOWED);
    if (!state.adaptive) return base;
    const ratio = .45 + clampV12(state.adaptiveLevel,1,5)*.11;
    return clampV12(Math.round(base*ratio),Math.min(5,base),base);
  }

  function shuffleV12(values){
    const copy = [...values];
    for (let i=copy.length-1;i>0;i--) {
      const j = Math.floor(Math.random()*(i+1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
    return copy;
  }

  function numericChoicesV12(correct,max){
    const values = new Set([Number(correct)]);
    const limit = Math.max(3,Number(max)||15);
    const offsets = shuffleV12([-3,-2,-1,1,2,3,4]);
    offsets.forEach(offset => {
      const value = clampV12(Number(correct)+offset,0,limit);
      if (values.size<4) values.add(value);
    });
    while (values.size<4) values.add(randomInt(0,limit));
    return shuffleV12([...values]).slice(0,4);
  }

  function arithmeticQuestionV12(operation,max,forceMissing = false){
    let a,b,result;
    if (operation === "addition") {
      result = randomInt(0,max);
      a = randomInt(0,result);
      b = result-a;
    } else {
      a = randomInt(0,max);
      b = randomInt(0,a);
      result = a-b;
    }

    const forms = state.allowMissing || forceMissing
      ? ["result","first","second","reversed","calculationChoice"]
      : ["result"];
    const form = forms[randomInt(0,forms.length-1)];
    const symbol = operation === "addition" ? "+" : "−";
    let correct = result;
    let html = `${a} ${symbol} ${b} = <span class="maths-empty-box">?</span>`;
    let plain = `${a} ${symbol} ${b} = ?`;
    let label = "Calcule le résultat";
    let answerType = "number";
    let choices = [];

    if (form === "first") {
      correct = a;
      html = `<span class="maths-empty-box">?</span> ${symbol} ${b} = ${result}`;
      plain = `? ${symbol} ${b} = ${result}`;
      label = "Trouve le premier nombre";
    } else if (form === "second") {
      correct = b;
      html = `${a} ${symbol} <span class="maths-empty-box">?</span> = ${result}`;
      plain = `${a} ${symbol} ? = ${result}`;
      label = "Trouve le nombre qui manque";
    } else if (form === "reversed") {
      correct = operation === "addition" ? b : a;
      if (operation === "addition") {
        html = `${result} = ${a} + <span class="maths-empty-box">?</span>`;
        plain = `${result} = ${a} + ?`;
      } else {
        html = `${result} = <span class="maths-empty-box">?</span> − ${b}`;
        plain = `${result} = ? − ${b}`;
      }
      label = "Complète le calcul écrit autrement";
    } else if (form === "calculationChoice") {
      const target = result;
      const correctExpression = `${a} ${symbol} ${b}`;
      const distractors = operation === "addition"
        ? [`${Math.max(0,a-1)} + ${b}`,`${a} + ${Math.min(max,b+1)}`,`${target} + 1`]
        : [`${a} − ${Math.max(0,b-1)}`,`${Math.min(max,a+1)} − ${b}`,`${target} − 1`];
      correct = correctExpression;
      choices = shuffleV12([correctExpression,...distractors]).slice(0,4);
      html = `Quel calcul donne <strong>${target}</strong> ?`;
      plain = `Quel calcul donne ${target} ?`;
      label = "Choisis le bon calcul";
      answerType = "choice";
    }

    return {
      operation,
      questionType:form,
      a,b,result,correct,
      html,
      plain,
      equation:plain,
      prompt:label,
      label,
      answerType,
      choices
    };
  }

  function comparisonQuestionV12(max){
    if (max >= 3 && Math.random() < .32) {
      const values = new Set();
      while (values.size < 3) values.add(randomInt(0,max));
      const numbers = [...values];
      const sorted = [...numbers].sort((a,b) => a-b);
      const correct = sorted.join(" < ");
      const alternatives = shuffleV12([
        correct,
        [...sorted].reverse().join(" < "),
        `${sorted[1]} < ${sorted[0]} < ${sorted[2]}`,
        `${sorted[0]} < ${sorted[2]} < ${sorted[1]}`
      ]).filter((value,index,array) => array.indexOf(value) === index);

      return {
        operation:"comparison",
        questionType:"orderNumbers",
        a:numbers[0],
        b:numbers[1],
        result:numbers[2],
        correct,
        answerType:"choice",
        choices:alternatives,
        label:"Range du plus petit au plus grand",
        prompt:`Range ${numbers.join(", ")} du plus petit au plus grand.`,
        html:numbers.map(number => `<span class="maths-order-number-v12">${number}</span>`).join(" "),
        plain:`Ranger ${numbers.join(", ")}`,
        equation:`${numbers.join(" · ")}`
      };
    }

    const a = randomInt(0,max);
    const b = Math.random()<.22 ? a : randomInt(0,max);
    const correct = a>b ? ">" : a<b ? "<" : "=";
    return {
      operation:"comparison",
      questionType:"comparison",
      a,b,result:null,
      correct,
      answerType:"choice",
      choices:[">","<","="],
      label:"Choisis le bon signe",
      prompt:`Compare ${a} et ${b}.`,
      html:`${a} <span class="maths-empty-box wide-v12">?</span> ${b}`,
      plain:`${a} ? ${b}`,
      equation:`${a} ? ${b}`
    };
  }

  const problemCharactersV12 = [
    ["Lumi","étoiles","⭐"],
    ["Lila","fleurs","🌸"],
    ["Pico","poissons","🐟"],
    ["Noa","lanternes","🏮"],
    ["Aurore","cristaux","💎"]
  ];

  function problemQuestionV12(max){
    const [name,item,emoji] = problemCharactersV12[randomInt(0,problemCharactersV12.length-1)];
    const isAddition = Math.random()<.6;
    let a,b,correct,story,equation;
    if (isAddition) {
      correct = randomInt(1,max);
      a = randomInt(0,correct);
      b = correct-a;
      story = `${name} possède ${a} ${item}. ${name} en trouve ${b} de plus. Combien en a-t-il maintenant ?`;
      equation = `${a} + ${b} = ?`;
    } else {
      a = randomInt(1,max);
      b = randomInt(0,a);
      correct = a-b;
      story = `${name} possède ${a} ${item}. ${name} en utilise ${b}. Combien en reste-t-il ?`;
      equation = `${a} − ${b} = ?`;
    }
    return {
      operation:"problem",
      underlyingOperation:isAddition?"addition":"subtraction",
      questionType:"problem",
      a,b,result:correct,correct,
      answerType:"number",
      choices:[],
      label:"Résous le petit problème",
      prompt:story,
      story,
      emoji,
      html:equation,
      plain:equation,
      equation
    };
  }

  function generateQuestion(){
    const max = effectiveMax();
    let operation = state.operation;
    if (operation === "mixed") {
      const pool = ["addition","subtraction","addition","subtraction","comparison","problem"];
      operation = pool[randomInt(0,pool.length-1)];
    }

    let question;
    if (operation === "comparison") question = comparisonQuestionV12(max);
    else if (operation === "problem") question = problemQuestionV12(max);
    else question = arithmeticQuestionV12(operation,max,state.operation === "mixed");

    question.sourceMode = state.operation;
    state.currentQuestion = question;
    state.answer = "";
    state.selectedChoice = "";
    state.questionAttempts = 0;
    state.locked = false;
    saveMathResumeV12(true);
  }

  function renderDotsV12(count,className=""){
    if (count<=0) return `<span class="maths-zero-v12">0</span>`;
    return `<span class="maths-dot-group-v12 ${className}">${Array.from({length:count},() => "<i></i>").join("")}</span>`;
  }

  function renderObjectsV12(count,emoji="🍎"){
    if (count<=0) return `<span class="maths-zero-v12">0</span>`;
    return `<span class="maths-object-group-v12">${Array.from({length:count},() => `<i>${emoji}</i>`).join("")}</span>`;
  }

  function renderFingersV12(count){
    if (count<=0) return `<span class="maths-zero-v12">0</span>`;
    const hands = Math.floor(count/5);
    const rest = count%5;
    return `<span class="maths-finger-group-v12">${"🖐️".repeat(hands)}${rest ? `<b>+${rest}</b>` : ""}<em>${count}</em></span>`;
  }

  function renderNumberLineV12(q){
    const max = Math.max(effectiveMax(),Number(q.a)||0,Number(q.b)||0,Number(q.result)||0);
    const points = Array.from({length:max+1},(_,number) => {
      const active = [q.a,q.b,q.result].map(Number).includes(number);
      return `<span class="${active?"active":""}"><i></i><b>${number}</b></span>`;
    }).join("");
    return `<div class="maths-number-line-v12">${points}</div>`;
  }

  function renderQuestionVisualV12(q){
    if (state.visualAid === "none") return "";
    if (state.visualAid === "numberLine") {
      return `<section class="maths-visual-help-v12 number-line">${renderNumberLineV12(q)}</section>`;
    }

    const left = Number(q.a)||0;
    const right = Number(q.b)||0;
    const emoji = q.emoji || "🍎";
    const render = state.visualAid === "dots"
      ? count => renderDotsV12(count)
      : state.visualAid === "fingers"
        ? count => renderFingersV12(count)
        : count => renderObjectsV12(count,emoji);
    const symbol = q.operation === "comparison" ? "?" : q.underlyingOperation === "subtraction" || q.operation === "subtraction" ? "−" : "+";

    return `<section class="maths-visual-help-v12">
      <div>${render(left)}<strong>${left}</strong></div>
      <span>${symbol}</span>
      <div>${render(right)}<strong>${right}</strong></div>
    </section>`;
  }

  function awardMathsCoins(amount){
    return window.LumiKidsMathBridge?.recordAnswer?.({
      correct:true,
      coins:amount,
      operation:state.currentQuestion?.operation || state.operation,
      questionType:state.currentQuestion?.questionType,
      a:state.currentQuestion?.a,
      b:state.currentQuestion?.b,
      result:state.currentQuestion?.result,
      correctAnswer:state.currentQuestion?.correct,
      equation:state.currentQuestion?.equation,
      prompt:state.currentQuestion?.prompt
    }) || {streak:state.currentStreak,bestStreak:state.bestStreak,streakBonus:0};
  }

  function recordMathsWrong(givenAnswer){
    return window.LumiKidsMathBridge?.recordAnswer?.({
      correct:false,
      operation:state.currentQuestion?.operation || state.operation,
      questionType:state.currentQuestion?.questionType,
      a:state.currentQuestion?.a,
      b:state.currentQuestion?.b,
      result:state.currentQuestion?.result,
      correctAnswer:state.currentQuestion?.correct,
      equation:state.currentQuestion?.equation,
      prompt:state.currentQuestion?.prompt,
      givenAnswer
    });
  }

  function rememberCurrentMathMistakeV12(givenAnswer){
    const q = state.currentQuestion;
    if (!q) return;
    window.LumiKidsMathBridge?.rememberMistake?.({
      operation:q.operation || state.operation,
      sourceMode:q.sourceMode || state.operation,
      questionType:q.questionType,
      prompt:q.prompt || q.label,
      story:q.story || "",
      equation:q.equation || q.plain || "",
      answerType:q.answerType === "choice" && q.questionType === "comparison" ? "comparison" : q.answerType,
      choices:Array.isArray(q.choices) ? [...q.choices] : null,
      a:q.a,
      b:q.b,
      result:q.result,
      givenAnswer:String(givenAnswer ?? ""),
      correct:String(q.correct ?? ""),
      answer:String(q.correct ?? "")
    });
  }

  function saveMathSettingsV12(){
    window.LumiKidsMathBridge?.saveSettings?.({
      operation:state.operation,
      max:state.max,
      allowMissing:state.allowMissing,
      questionCount:state.questionCount,
      adaptive:state.adaptive,
      visualAid:state.visualAid
    });
  }

  function saveMathResumeV12(inGame=false){
    const session = inGame ? {
      currentIndex:state.currentIndex,
      score:state.score,
      coinsWon:state.coinsWon,
      wrongCount:state.wrongCount,
      questionAttempts:state.questionAttempts,
      currentStreak:state.currentStreak,
      bestStreak:state.bestStreak,
      adaptiveLevel:state.adaptiveLevel,
      consecutiveWrong:state.consecutiveWrong,
      sessionMistakes:state.sessionMistakes,
      currentQuestion:state.currentQuestion,
      answer:state.answer,
      selectedChoice:state.selectedChoice
    } : null;

    window.LumiKidsMathBridge?.saveResume?.({
      operation:state.operation,
      max:state.max,
      allowMissing:state.allowMissing,
      questionCount:state.questionCount,
      adaptive:state.adaptive,
      visualAid:state.visualAid,
      inGame:Boolean(inGame),
      session
    });
  }

  function finishMathsGame(){
    window.LumiKidsMathBridge?.recordSeries?.({
      operation:state.operation,
      total:state.questionCount,
      score:state.score,
      errors:state.wrongCount,
      bestStreak:state.bestStreak
    });
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
    state.operation = ["addition","subtraction","mixed","comparison","problem"].includes(operation)
      ? operation : "addition";
    saveMathSettingsV12();
    saveMathResumeV12(false);
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
    saveMathResumeV12(false);
    renderMaths();
  };

  window.setMathsOperation = function(operation){
    state.operation = ["addition","subtraction","mixed","comparison","problem"].includes(operation)
      ? operation : "addition";
    saveMathSettingsV12();
    renderMaths();
  };

  window.toggleMathsMissing = function(){
    state.allowMissing = !state.allowMissing;
    saveMathSettingsV12();
    renderMaths();
  };

  window.toggleMathsAdaptiveV12 = function(){
    state.adaptive = !state.adaptive;
    saveMathSettingsV12();
    renderMaths();
  };

  window.setMathsVisualAidV12 = function(value){
    state.visualAid = ["objects","fingers","numberLine","dots","none"].includes(value) ? value : "objects";
    saveMathSettingsV12();
    renderMaths();
  };

  window.mathsSettingUnavailableV12 = function(){
    if (typeof showToast === "function") showToast("Ce réglage est automatique pour cette activité.");
  };

  window.setMathsQuestionCount = function(number){
    state.questionCount = [5,10,20].includes(Number(number)) ? Number(number) : 10;
    saveMathSettingsV12();
    renderMaths();
  };

  window.startMathsGame = function(){
    state.currentIndex = 0;
    state.score = 0;
    state.coinsWon = 0;
    state.wrongCount = 0;
    state.currentStreak = 0;
    state.bestStreak = 0;
    state.consecutiveWrong = 0;
    state.adaptiveLevel = 3;
    state.sessionMistakes = [];
    state.answer = "";
    state.selectedChoice = "";
    state.questionAttempts = 0;
    state.locked = false;
    state.currentQuestion = null;
    state.view = "game";
    saveMathSettingsV12();
    saveMathResumeV12(true);
    generateQuestion();
    renderMaths();
  };

  window.replayMathsGame = function(){
    startMathsGame();
  };

  window.selectMathsChoiceV12 = function(value){
    if (state.locked) return;
    state.selectedChoice = String(value);
    saveMathResumeV12(true);
    renderMaths();
  };

  window.validateMathsAnswer = function(){
    if (state.locked || !state.currentQuestion) return;

    const feedback = document.getElementById("mathsFeedback");
    if (!feedback) return;

    const q = state.currentQuestion;
    const rawAnswer = q.answerType === "choice" ? state.selectedChoice : state.answer;
    if (rawAnswer === "") {
      feedback.textContent = "Choisis ou écris une réponse 🙂";
      feedback.className = "maths-feedback bad";
      return;
    }

    const correct = q.answerType === "choice"
      ? String(rawAnswer) === String(q.correct)
      : Number(rawAnswer) === Number(q.correct);

    if (!correct) {
      state.questionAttempts += 1;
      state.wrongCount += 1;
      state.consecutiveWrong += 1;
      state.currentStreak = 0;
      if (state.adaptive && state.consecutiveWrong >= 2) {
        state.adaptiveLevel = clampV12(state.adaptiveLevel-1,1,5);
        state.consecutiveWrong = 0;
      }

      const reviewLabel = q.equation || q.prompt || q.label;
      state.sessionMistakes.push({
        equation:reviewLabel,
        answer:String(rawAnswer),
        expected:String(q.correct)
      });
      rememberCurrentMathMistakeV12(rawAnswer);
      recordMathsWrong(rawAnswer);

      feedback.textContent = "Essaie encore, tu peux y arriver !";
      feedback.className = "maths-feedback bad";
      state.answer = "";
      state.selectedChoice = "";
      saveMathResumeV12(true);
      window.LumiAudio?.playWrong?.();
      setTimeout(renderMaths,700);
      return;
    }

    state.locked = true;
    const firstTry = state.questionAttempts === 0;
    if (firstTry) state.score += 1;
    state.currentStreak += 1;
    state.bestStreak = Math.max(state.bestStreak,state.currentStreak);
    state.consecutiveWrong = 0;
    if (state.adaptive && state.currentStreak > 0 && state.currentStreak % 3 === 0) {
      state.adaptiveLevel = clampV12(state.adaptiveLevel+1,1,5);
    }

    const reward = awardMathsCoins(COINS_PER_CORRECT);
    const totalCoins = COINS_PER_CORRECT + Number(reward.streakBonus||0);
    state.coinsWon += totalCoins;

    feedback.textContent = reward.streakBonus
      ? `Bravo ! Série de ${reward.streak} : +${totalCoins} pièces`
      : firstTry
        ? `Bravo du premier coup ! +${COINS_PER_CORRECT} pièces`
        : `Bravo, tu as trouvé ! +${COINS_PER_CORRECT} pièces`;
    feedback.className = "maths-feedback good";
    window.LumiAudio?.playCorrect?.();

    if (typeof createConfetti === "function" && (!window.gameState?.appSettingsV10?.reducedMotion)) {
      createConfetti();
    } else if (typeof createConfetti === "function") {
      createConfetti();
    }

    setTimeout(() => {
      state.currentIndex += 1;
      if (state.currentIndex >= state.questionCount) {
        finishMathsGame();
      } else {
        generateQuestion();
        renderMaths();
      }
    },900);
  };

  window.openMathMistakesV12 = function(){
    if (typeof showMistakeReview === "function") showMistakeReview();
    setTimeout(() => {
      if (typeof setMistakeFilterV10 === "function") setMistakeFilterV10("math");
    },30);
  };

  window.confirmQuitMathsGame = function(){
    const shouldConfirm = state.view === "game" && state.currentIndex < state.questionCount;
    if (shouldConfirm && !window.confirm("Quitter cette partie de maths en cours ?")) return;
    saveMathResumeV12(false);
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
      saveMathSettingsV12();
    } else if (state.keypadMode === "answer") {
      if (state.keypadValue === "") {
        if (typeof showToast === "function") showToast("Entre une réponse.");
        return;
      }
      state.answer = String(value);
      saveMathResumeV12(true);
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



  window.resumeMathsV12 = function(resume = {}){
    if (resume.operation) state.operation = ["addition","subtraction","mixed","comparison","problem"].includes(resume.operation)
      ? resume.operation : state.operation;
    if (resume.max) state.max = clampV12(Number(resume.max),1,MAX_ALLOWED);
    if (typeof resume.allowMissing === "boolean") state.allowMissing = resume.allowMissing;
    if ([5,10,20].includes(Number(resume.questionCount))) state.questionCount = Number(resume.questionCount);
    if (typeof resume.adaptive === "boolean") state.adaptive = resume.adaptive;
    if (["objects","fingers","numberLine","dots","none"].includes(resume.visualAid)) state.visualAid = resume.visualAid;

    ensureMathsScreen();
    window.hideAllScreens();
    if (resume.inGame && resume.session?.currentQuestion) {
      const session = resume.session;
      state.currentIndex = Math.max(0,Number(session.currentIndex||0));
      state.score = Math.max(0,Number(session.score||0));
      state.coinsWon = Math.max(0,Number(session.coinsWon||0));
      state.wrongCount = Math.max(0,Number(session.wrongCount||0));
      state.questionAttempts = Math.max(0,Number(session.questionAttempts||0));
      state.currentStreak = Math.max(0,Number(session.currentStreak||0));
      state.bestStreak = Math.max(0,Number(session.bestStreak||0));
      state.adaptiveLevel = clampV12(Number(session.adaptiveLevel||3),1,5);
      state.consecutiveWrong = Math.max(0,Number(session.consecutiveWrong||0));
      state.sessionMistakes = Array.isArray(session.sessionMistakes) ? session.sessionMistakes : [];
      state.currentQuestion = session.currentQuestion;
      state.answer = String(session.answer||"");
      state.selectedChoice = String(session.selectedChoice||"");
      state.locked = false;
      state.view = "game";
      renderMaths();
    } else {
      state.view = "settings";
      renderMaths();
    }
  };

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
      /* Le gestionnaire V12 joue lui-même le son correct ou incorrect,
         y compris pour les comparaisons et les choix de calcul. */
      audio()?.playValidation();
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
