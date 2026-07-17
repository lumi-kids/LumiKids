/* =========================================================
   LUMIKIDS V14 — GAME UI CONTROLLER
   HUD, progression visuelle, notifications, résultats et carnet.
========================================================= */
(function installGameUiV14(){
  "use strict";
  if (window.__lumikidsGameUiV14) return;
  window.__lumikidsGameUiV14 = true;

  const toastQueue = [];
  let toastRunning = false;
  let resultObserver = null;
  let uiRefreshTimer = 0;
  let parentUnlockedV14 = false;
  let parentPendingArgsV14 = [];
  let parentHoldFrameV14 = 0;
  let parentHoldStartedV14 = 0;
  let parentOriginalShowV14 = null;

  function state(){
    try { return typeof gameState !== "undefined" ? gameState : {}; }
    catch { return {}; }
  }

  function number(value){
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function clamp(value,min=0,max=100){
    return Math.max(min,Math.min(max,number(value)));
  }

  function safeText(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/\"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function lessonCompleted(type,key){
    try {
      if (typeof isLessonCompleted === "function") return Boolean(isLessonCompleted(type,key));
    } catch {}
    const progress = state().learningProgress?.[type === "sound" ? "sounds" : "letters"]?.[key];
    return Boolean(progress?.completed);
  }

  function activeLetterList(){
    try { return Array.isArray(activeLetters) ? activeLetters : []; }
    catch { return []; }
  }

  function soundList(){
    try { return Array.isArray(soundKeys) ? soundKeys : []; }
    catch { return []; }
  }

  function chapterList(){
    try { return Object.values(letterChapters||{}); }
    catch { return []; }
  }

  function completedLetters(){
    return activeLetterList().filter(key=>lessonCompleted("letter",key)).length;
  }

  function completedSounds(){
    return soundList().filter(key=>lessonCompleted("sound",key)).length;
  }

  function completedKingdoms(){
    return chapterList().filter(chapter => Array.isArray(chapter.letters) && chapter.letters.every(key=>lessonCompleted("letter",key))).length;
  }

  function practiceStats(){
    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const sounds = soundList();
    const targets = [
      ...allLetters.map(key=>`letter:${key}`),
      ...sounds.map(key=>`sound:${key}`)
    ];
    let completed = 0;
    let possible = targets.length * 11;
    let mastered = 0;
    targets.forEach(target => {
      const data = state().practiceStatsV10?.[target] || {};
      const count = Object.keys(data.completedTypes||{}).length;
      completed += count;
      if (count >= 11) mastered++;
    });
    return {completed,possible,mastered,total:targets.length};
  }

  function mathSummary(){
    const math = state().mathStatsV12 || {};
    const total = number(math.totalQuestions);
    const correct = number(math.correct);
    const accuracy = total ? Math.round(correct/total*100) : 0;
    const series = number(math.seriesCompleted);
    return {total,correct,accuracy,series};
  }

  function achievementsSummary(){
    const unlocked = Object.values(state().achievements||{}).filter(Boolean).length;
    const visibleTotal = 28;
    return {unlocked,total:Math.max(visibleTotal,unlocked)};
  }

  function mistakeSummary(){
    const current = Object.keys(state().mistakes||{}).length;
    const corrected = number(state().mistakesRecovered);
    const total = current + corrected;
    const percent = total ? Math.round(corrected/total*100) : (corrected ? 100 : 0);
    return {current,corrected,total,percent};
  }

  function ensureHud(){
    const header = document.querySelector(".game-header");
    if (!header || document.getElementById("gameHudPlayerV14")) return;
    const resources = header.querySelector(".top-resources");
    const hud = document.createElement("section");
    hud.id = "gameHudPlayerV14";
    hud.className = "game-hud-player-v14";
    hud.setAttribute("aria-label","Progression du joueur");
    hud.innerHTML = `
      <button id="gameHudBackV14" class="game-hud-back-v14" onclick="goBackGameV14()" aria-label="Revenir à l’écran précédent">←</button>
      <div class="game-hud-identity-v14">
        <div><strong id="gameHudNameV14">Champion</strong><small id="gameHudScreenV14">Camp de Lumi</small></div>
        <div class="game-hud-xp-v14"><span id="gameHudXpFillV14"></span></div>
      </div>
      <div class="game-hud-level-v14"><small>Niveau</small><b id="gameHudLevelV14">1</b></div>
      <div class="game-hud-streak-v14"><small>Série</small><b id="gameHudStreakV14">🔥 1</b></div>`;
    header.insertBefore(hud,resources || null);
  }

  function updateHud(screenMeta={}){
    ensureHud();
    const game = state();
    const xp = Math.max(0,number(game.xp));
    const currentXp = xp % 100;
    const level = Math.floor(xp/100)+1;
    const streak = number(game.dailyStreakV10?.count || game.streak || 1);
    const navState = window.GameNavigationV14;
    const screenId = navState?.currentScreenId || document.body.dataset.gameScreen || "homeScreen";
    const labels = {
      homeScreen:"Camp de Lumi",readingHome:"Bibliothèque magique",lettersHome:"Aventure des lettres",
      soundsHome:"Sons composés",readingExercisesScreen:"Salle d’entraînement",lessonScreen:"Leçon en cours",
      mathsAddonScreen:"Laboratoire des nombres",mathGame:"Défi maths",rewardsScreen:"Salle des trophées",
      mistakeReviewScreen:"Carnet des erreurs",worldMapScreen:"Carte des royaumes",parentScreen:"Espace Parents",
      guardianScreenV13:"Gardien des Étoiles"
    };
    const set = (id,value) => { const element=document.getElementById(id); if(element) element.textContent=value; };
    set("gameHudNameV14",game.childName||"Champion");
    set("gameHudScreenV14",screenMeta.label||labels[screenId]||"LumiKids");
    set("gameHudLevelV14",level);
    set("gameHudStreakV14",`🔥 ${streak}`);
    const fill = document.getElementById("gameHudXpFillV14");
    if (fill) fill.style.width = `${clamp(currentXp)}%`;
    const back = document.getElementById("gameHudBackV14");
    if (back) back.hidden = screenId === "homeScreen";
    const profile = document.getElementById("gameProfileTitleV14");
    if (profile) profile.textContent = game.childName||"Champion";
  }

  function setCardProgress(card,percent,label){
    if (!card) return;
    const copy = card.querySelector(":scope > span:nth-child(2)") || card;
    let progress = copy.querySelector(".game-card-progress-v14");
    if (!progress) {
      progress = document.createElement("span");
      progress.className = "game-card-progress-v14";
      progress.innerHTML = "<i></i>";
      copy.appendChild(progress);
      const caption = document.createElement("small");
      caption.className = "game-card-caption-v14";
      copy.appendChild(caption);
    }
    const bar = progress.querySelector("i");
    if (bar) bar.style.width = `${clamp(percent)}%`;
    const caption = copy.querySelector(".game-card-caption-v14");
    if (caption) caption.textContent = label;
  }

  function renderHomeCards(){
    const letters = activeLetterList();
    const sounds = soundList();
    const readingDone = completedLetters()+completedSounds();
    const readingTotal = letters.length+sounds.length;
    const math = mathSummary();
    const mistakes = mistakeSummary();
    const achievements = achievementsSummary();
    const kingdoms = chapterList();

    setCardProgress(document.querySelector("#homeScreen .reading-v3"),readingTotal?readingDone/readingTotal*100:0,`${readingDone}/${readingTotal} leçons maîtrisées`);
    setCardProgress(document.querySelector("#homeScreen .maths-v3"),math.accuracy,math.total?`${math.accuracy}% de réussite · ${math.series} série${math.series>1?"s":""}`:"Commence ton premier défi");
    setCardProgress(document.querySelector("#homeScreen .rewards-v3"),achievements.unlocked/achievements.total*100,`${achievements.unlocked} trophée${achievements.unlocked>1?"s":""} débloqué${achievements.unlocked>1?"s":""}`);
    setCardProgress(document.querySelector("#homeScreen .mistakes-v3"),mistakes.percent,mistakes.current?`${mistakes.current} erreur${mistakes.current>1?"s":""} à corriger`:"Carnet entièrement corrigé");
    setCardProgress(document.querySelector("#homeScreen .world-map-v3"),kingdoms.length?completedKingdoms()/kingdoms.length*100:0,`${completedKingdoms()}/${kingdoms.length||5} royaumes terminés`);
    setCardProgress(document.querySelector("#homeScreen .parents-v3"),100,"Rapport, progrès et conseils");
  }

  function setReadingProgress(button,percent,label){
    if (!button) return;
    const copy = button.querySelector(":scope > span:nth-child(2)") || button;
    let progress = copy.querySelector(".reading-progress-v14");
    if (!progress) {
      progress = document.createElement("span");
      progress.className = "reading-progress-v14";
      progress.innerHTML = "<i><span></span></i><b></b>";
      copy.appendChild(progress);
    }
    progress.querySelector("i span").style.width = `${clamp(percent)}%`;
    progress.querySelector("b").textContent = label;
  }

  function renderReadingCards(){
    const buttons = document.querySelectorAll("#readingHome .reading-menu-v3 button");
    const letters = activeLetterList();
    const sounds = soundList();
    const practice = practiceStats();
    setReadingProgress(buttons[0],letters.length?completedLetters()/letters.length*100:0,`${completedLetters()}/${letters.length} lettres`);
    setReadingProgress(buttons[1],sounds.length?completedSounds()/sounds.length*100:0,`${completedSounds()}/${sounds.length} sons`);
    setReadingProgress(buttons[2],practice.possible?practice.completed/practice.possible*100:0,`${practice.mastered}/${practice.total} maîtrisés`);
  }

  function renderMascotMessage(){
    const bubble = document.querySelector("#homeScreen .hero-mascot span");
    if (!bubble) return;
    const mistakes = mistakeSummary();
    const challenge = state().dailyChallenge;
    const messages = [];
    if (mistakes.current) messages.push(`${mistakes.current} erreur${mistakes.current>1?"s":""} à corriger !`);
    if (challenge?.completed && !challenge?.claimed) messages.push("Ta récompense du jour t’attend !");
    if (state().guardianV13?.unlocked) messages.push("Gardien des Étoiles !");
    if (!messages.length) messages.push(completedLetters()?"On continue l’aventure ?":"Prêt pour ta première étoile ?");
    bubble.textContent = messages[0];
  }

  function renderMistakeProgress(){
    const screen = document.getElementById("mistakeReviewScreen");
    const summary = screen?.querySelector(".mistake-summary-card");
    if (!summary) return;
    let progress = document.getElementById("mistakeProgressV14");
    if (!progress) {
      progress = document.createElement("section");
      progress.id = "mistakeProgressV14";
      progress.className = "mistake-progress-v14";
      progress.innerHTML = "<div><span></span><strong></strong></div><i><span></span></i>";
      summary.insertAdjacentElement("afterend",progress);
    }
    const data = mistakeSummary();
    progress.querySelector("div span").textContent = "Progression du carnet";
    progress.querySelector("div strong").textContent = data.total ? `${data.corrected}/${data.total} corrigées` : "Tout est corrigé";
    progress.querySelector("i span").style.width = `${data.total?data.percent:100}%`;
  }

  function renderResumeHint(){
    const hint = document.getElementById("resumeHintV10");
    if (!hint) return;
    const game = state();
    const ui = game.uiResumeV14 || {};
    const existing = String(hint.textContent||"");
    if (game.lastActivityV10 || game.lastActivity) return;
    if (ui.screenId && ui.screenId !== "homeScreen") hint.textContent = `Reprends exactement depuis ${ui.label||"ta dernière activité"}.`;
    else if (!existing.trim()) hint.textContent = "Commence une activité pour retrouver ta progression ici.";
  }

  function classifyResult(element){
    if (element.classList.contains("maths-result-card")) return "Résultat du laboratoire";
    if (element.classList.contains("mistake-corrected") || element.classList.contains("mistake-corrected-v10")) return "Erreur corrigée";
    if (element.classList.contains("practice-result-v9")) return "Entraînement terminé";
    return "Mission terminée";
  }

  function enhanceResult(element){
    if (!(element instanceof Element) || element.dataset.gameResultV14 === "1") return;
    element.dataset.gameResultV14 = "1";
    const ribbon = document.createElement("div");
    ribbon.className = "game-result-ribbon-v14";
    ribbon.textContent = classifyResult(element);
    element.prepend(ribbon);
  }

  function scanResults(root=document){
    const selectors = [".completion-panel",".practice-result-v9",".maths-result-card",".mistake-corrected",".mistake-corrected-v10"];
    if (root instanceof Element && root.matches(selectors.join(","))) enhanceResult(root);
    root.querySelectorAll?.(selectors.join(",")).forEach(enhanceResult);
  }

  function installResultObserver(){
    if (resultObserver) return;
    resultObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node instanceof Element) scanResults(node);
      }));
    });
    resultObserver.observe(document.body,{subtree:true,childList:true});
    scanResults();
  }

  function showNextToast(){
    if (toastRunning || !toastQueue.length) return;
    const toast = document.getElementById("toast");
    if (!toast) return;
    toastRunning = true;
    const item = toastQueue.shift();
    toast.textContent = item.message;
    toast.classList.remove("hidden");
    const duration = item.duration || 2400;
    setTimeout(() => {
      toast.classList.add("hidden");
      setTimeout(() => {
        toastRunning = false;
        showNextToast();
      },180);
    },duration);
  }

  function installToastQueue(){
    if (window.showToast?.__queuedV14) return;
    const queuedToast = function(message,duration=2400){
      const text = String(message??"").trim();
      if (!text) return;
      const last = toastQueue[toastQueue.length-1];
      if (last?.message === text) return;
      toastQueue.push({message:text,duration});
      showNextToast();
    };
    queuedToast.__queuedV14 = true;
    queuedToast.timer = null;
    window.showToast = queuedToast;
    try { showToast = queuedToast; } catch {}
  }

  function updateGameInterface(meta={}){
    clearTimeout(uiRefreshTimer);
    uiRefreshTimer = setTimeout(() => {
      updateHud(meta);
      renderHomeCards();
      renderReadingCards();
      renderMascotMessage();
      renderMistakeProgress();
      renderResumeHint();
      scanResults();
    },0);
  }

  function wrapUpdateGameUi(){
    const original = window.updateGameUi;
    if (typeof original !== "function" || original.__gameUiV14Wrapped) return;
    function wrapped(...args){
      const result = original.apply(this,args);
      updateGameInterface();
      return result;
    }
    wrapped.__gameUiV14Wrapped = true;
    wrapped.__gameUiV14Original = original;
    window.updateGameUi = wrapped;
    try { updateGameUi = wrapped; } catch {}
  }

  function wrapRenderFunctions(){
    ["renderMistakeList","renderMistakeListV10","renderAchievements","renderParentV10","renderWorldMap"].forEach(name => {
      const original = window[name];
      if (typeof original !== "function" || original.__gameUiV14Wrapped) return;
      function wrapped(...args){
        const result = original.apply(this,args);
        updateGameInterface();
        return result;
      }
      wrapped.__gameUiV14Wrapped = true;
      window[name] = wrapped;
    });
  }

  function installPointerEffects(){
    document.addEventListener("pointerdown",event => {
      const button = event.target.closest("button");
      if (!button || document.body.classList.contains("v10-reduced-motion")) return;
      button.style.setProperty("--tap-x",`${event.clientX}px`);
      button.classList.remove("game-tap-v14");
      void button.offsetWidth;
      button.classList.add("game-tap-v14");
      setTimeout(()=>button.classList.remove("game-tap-v14"),380);
    },{passive:true});
  }

  function installScreenEvents(){
    document.addEventListener("lumikids:screenchange",event => {
      updateGameInterface(event.detail?.meta||{});
      const active = document.getElementById(event.detail?.screenId);
      active?.scrollTo?.({top:0,behavior:document.body.classList.contains("v10-reduced-motion")?"auto":"smooth"});
    });
  }


  function ensureParentGateV14(){
    if (document.getElementById("parentGateOverlayV14")) return;
    document.body.insertAdjacentHTML("beforeend",`
      <div id="parentGateOverlayV14" class="parent-gate-overlay-v14 hidden" role="dialog" aria-modal="true" aria-labelledby="parentGateTitleV14">
        <section class="parent-gate-card-v14">
          <div class="parent-gate-icon-v14">🔒</div>
          <small>Espace réservé aux adultes</small>
          <h2 id="parentGateTitleV14">Accès Parents</h2>
          <p>Maintiens le bouton pendant deux secondes pour ouvrir le tableau de bord.</p>
          <button id="parentHoldButtonV14" class="parent-hold-v14" type="button">
            <i id="parentHoldProgressV14"></i><span>Maintenir pour ouvrir</span>
          </button>
          <button class="parent-gate-cancel-v14" type="button" onclick="closeParentGateV14()">Retour au jeu</button>
        </section>
      </div>`);
    const hold = document.getElementById("parentHoldButtonV14");
    hold?.addEventListener("pointerdown",startParentHoldV14);
    ["pointerup","pointercancel","pointerleave","lostpointercapture"].forEach(name=>hold?.addEventListener(name,cancelParentHoldV14));
  }

  function openParentGateV14(args=[]){
    ensureParentGateV14();
    parentPendingArgsV14 = args;
    document.getElementById("parentGateOverlayV14")?.classList.remove("hidden");
    const progress = document.getElementById("parentHoldProgressV14");
    if (progress) progress.style.width = "0%";
  }

  window.closeParentGateV14 = function(){
    cancelParentHoldV14();
    document.getElementById("parentGateOverlayV14")?.classList.add("hidden");
    window.GameNavigationV14?.sync?.();
  };

  function startParentHoldV14(event){
    event.preventDefault();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch {}
    cancelAnimationFrame(parentHoldFrameV14);
    parentHoldStartedV14 = performance.now();
    const step = now => {
      const elapsed = now-parentHoldStartedV14;
      const percent = clamp(elapsed/1800*100);
      const progress = document.getElementById("parentHoldProgressV14");
      if (progress) progress.style.width = `${percent}%`;
      if (percent >= 100) {
        parentUnlockedV14 = true;
        document.getElementById("parentGateOverlayV14")?.classList.add("hidden");
        const args = parentPendingArgsV14;
        parentPendingArgsV14 = [];
        window.showToast?.("Espace Parents déverrouillé pour cette session.");
        parentOriginalShowV14?.(...args);
        setTimeout(()=>window.GameNavigationV14?.sync?.(),20);
        return;
      }
      parentHoldFrameV14 = requestAnimationFrame(step);
    };
    parentHoldFrameV14 = requestAnimationFrame(step);
  }

  function cancelParentHoldV14(){
    cancelAnimationFrame(parentHoldFrameV14);
    parentHoldFrameV14 = 0;
    parentHoldStartedV14 = 0;
    const progress = document.getElementById("parentHoldProgressV14");
    if (progress) progress.style.width = "0%";
  }

  function installParentGateV14(){
    ensureParentGateV14();
    const original = window.showParentDashboard;
    if (typeof original !== "function" || original.__parentGateV14Wrapped) return;
    parentOriginalShowV14 = original;
    function guarded(...args){
      if (parentUnlockedV14) return original.apply(this,args);
      openParentGateV14(args);
    }
    guarded.__parentGateV14Wrapped = true;
    guarded.__parentGateV14Original = original;
    window.showParentDashboard = guarded;
    try { showParentDashboard = guarded; } catch {}
  }

  function installAdditionalStyles(){
    if (document.getElementById("gameUiRuntimeStyleV14")) return;
    const style = document.createElement("style");
    style.id = "gameUiRuntimeStyleV14";
    style.textContent = `
      .game-tap-v14{animation:gameTapV14 .34s ease!important}
      @keyframes gameTapV14{45%{transform:scale(.965)}75%{transform:scale(1.015)}}
      body.v10-reduced-motion .game-tap-v14{animation:none!important}
    `;
    document.head.appendChild(style);
  }

  function init(){
    document.body.classList.add("game-ui-v14");
    ensureHud();
    installToastQueue();
    installResultObserver();
    installPointerEffects();
    installScreenEvents();
    installAdditionalStyles();
    installParentGateV14();
    wrapUpdateGameUi();
    wrapRenderFunctions();
    updateGameInterface();
    setTimeout(()=>updateGameInterface(),200);
    setTimeout(()=>updateGameInterface(),900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();

  window.GameUiV14 = {
    refresh:updateGameInterface,
    renderMistakes:renderMistakeProgress,
    renderHome:renderHomeCards,
    updateHud
  };
})();
