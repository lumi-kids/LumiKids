/* =========================================================
   LUMIKIDS V14 — NAVIGATION DE JEU
   Navigation latérale/inférieure, historique, thèmes et reprise.
========================================================= */
(function installGameNavigationV14(){
  "use strict";
  if (window.__lumikidsGameNavigationV14) return;
  window.__lumikidsGameNavigationV14 = true;

  const STORAGE_KEY = "lumikids-ui-v14";
  const routeStack = [];
  let currentScreenId = "homeScreen";
  let currentSection = "home";
  let navigatingBack = false;
  let syncTimer = 0;
  let lastStoredScreen = "";

  const screenMeta = {
    homeScreen:{section:"home",route:"home",label:"Camp de Lumi",icon:"⌂"},
    readingHome:{section:"reading",route:"reading",label:"Bibliothèque",icon:"📚"},
    lettersHome:{section:"reading",route:"reading",label:"Lettres",icon:"Aa"},
    soundsHome:{section:"reading",route:"reading",label:"Sons",icon:"ch"},
    readingExercisesScreen:{section:"reading",route:"reading",label:"Entraînement",icon:"★"},
    lessonScreen:{section:"reading",route:"reading",label:"Leçon",icon:"📖",focus:true},
    mathGame:{section:"math",route:"math",label:"Maths",icon:"＋",focus:true},
    mathsAddonScreen:{section:"math",route:"math",label:"Laboratoire des nombres",icon:"＋"},
    rewardsScreen:{section:"rewards",route:"rewards",label:"Salle des trophées",icon:"🏆"},
    mistakeReviewScreen:{section:"errors",route:"errors",label:"Carnet des erreurs",icon:"↻",focus:true},
    worldMapScreen:{section:"map",route:"map",label:"Carte",icon:"🗺️"},
    parentScreen:{section:"parents",route:"profile",label:"Parents",icon:"↗"},
    guardianScreenV13:{section:"rewards",route:"rewards",label:"Gardien des Étoiles",icon:"👑"}
  };

  const routeActions = {
    home:()=>window.showHome?.(),
    reading:()=>window.showReadingHome?.(),
    math:()=>window.showMath?.(),
    map:()=>window.showWorldMap?.(),
    errors:()=>window.showMistakeReview?.(),
    rewards:()=>window.showRewards?.(),
    parents:()=>window.showParentDashboard?.()
  };

  function safeState(){
    try { return typeof gameState !== "undefined" ? gameState : null; }
    catch { return null; }
  }

  function readUiState(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"); }
    catch { return {}; }
  }

  function writeUiState(patch={}){
    const previous = readUiState();
    const next = {...previous,...patch,updatedAt:Date.now()};
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(next)); } catch {}
    const state = safeState();
    if (state) {
      state.uiResumeV14 = {
        ...(state.uiResumeV14||{}),
        screenId:next.screenId||currentScreenId,
        section:next.section||currentSection,
        route:next.route||screenMeta[currentScreenId]?.route||"home",
        updatedAt:next.updatedAt
      };
      try { window.saveGameState?.(); } catch {}
    }
  }

  function injectNavigation(){
    document.body.classList.add("game-ui-v14");
    if (!document.querySelector(".game-backdrop-v14")) {
      document.body.insertAdjacentHTML("afterbegin",'<div class="game-backdrop-v14" aria-hidden="true"></div>');
    }

    if (!document.getElementById("gameSideNavV14")) {
      document.body.insertAdjacentHTML("afterbegin",`
        <aside id="gameSideNavV14" class="game-side-nav-v14" aria-label="Navigation principale">
          <div class="game-nav-mark-v14" aria-hidden="true">L</div>
          <button data-game-route="home" onclick="navigateGameV14('home')" aria-label="Accueil"><span>⌂</span><small>Accueil</small></button>
          <button data-game-route="reading" onclick="navigateGameV14('reading')" aria-label="Lecture"><span>📚</span><small>Lecture</small></button>
          <button data-game-route="math" onclick="navigateGameV14('math')" aria-label="Maths"><span>＋</span><small>Maths</small></button>
          <button data-game-route="map" onclick="navigateGameV14('map')" aria-label="Carte"><span>🗺️</span><small>Carte</small></button>
          <button data-game-route="errors" onclick="navigateGameV14('errors')" aria-label="Erreurs"><span>↻</span><small>Erreurs</small></button>
          <button data-game-route="rewards" onclick="navigateGameV14('rewards')" aria-label="Récompenses"><span>🏆</span><small>Récompenses</small></button>
          <div class="game-nav-spacer-v14"></div>
          <button class="game-nav-profile-v14" data-game-route="profile" onclick="openGameProfileV14()" aria-label="Profil"><span>👤</span><small>Profil</small></button>
        </aside>`);
    }

    if (!document.getElementById("gameBottomNavV14")) {
      document.body.insertAdjacentHTML("beforeend",`
        <nav id="gameBottomNavV14" class="game-bottom-nav-v14" aria-label="Navigation mobile">
          <button data-game-route="home" onclick="navigateGameV14('home')"><span>⌂</span><small>Accueil</small></button>
          <button data-game-route="reading" onclick="navigateGameV14('reading')"><span>📚</span><small>Lecture</small></button>
          <button data-game-route="math" onclick="navigateGameV14('math')"><span>＋</span><small>Maths</small></button>
          <button data-game-route="map" onclick="navigateGameV14('map')"><span>🗺️</span><small>Carte</small></button>
          <button data-game-route="profile" onclick="openGameProfileV14()"><span>👤</span><small>Profil</small></button>
        </nav>`);
    }

    if (!document.getElementById("gameProfileOverlayV14")) {
      document.body.insertAdjacentHTML("beforeend",`
        <div id="gameProfileOverlayV14" class="game-profile-overlay-v14 hidden" role="dialog" aria-modal="true" aria-labelledby="gameProfileTitleV14">
          <section class="game-profile-drawer-v14">
            <header class="game-profile-header-v14">
              <div class="game-profile-avatar-v14">🦊</div>
              <div><small>Profil de jeu</small><strong id="gameProfileTitleV14">Champion</strong></div>
              <button onclick="closeGameProfileV14()" aria-label="Fermer">×</button>
            </header>
            <div class="game-profile-grid-v14">
              <button onclick="closeGameProfileV14();showRewards()"><span>🏆</span><strong>Récompenses</strong><small>Succès et trophées</small></button>
              <button onclick="closeGameProfileV14();showMistakeReview()"><span>↻</span><strong>Mes erreurs</strong><small>Continuer à progresser</small></button>
              <button onclick="closeGameProfileV14();showParentDashboard()"><span>📊</span><strong>Parents</strong><small>Statistiques détaillées</small></button>
              <button onclick="closeGameProfileV14();openSettingsPanel()"><span>⚙️</span><strong>Paramètres</strong><small>Audio et accessibilité</small></button>
              <button onclick="closeGameProfileV14();openAccountPanel()"><span>👤</span><strong>Mon profil</strong><small>Pseudo et progression</small></button>
              <button onclick="closeGameProfileV14();openUnlockedStoryBook()"><span>📖</span><strong>Grand Livre</strong><small>Revoir les histoires</small></button>
            </div>
          </section>
        </div>`);
    }

    if (!document.getElementById("gameTransitionV14")) {
      document.body.insertAdjacentHTML("beforeend",`
        <div id="gameTransitionV14" class="game-transition-v14" aria-hidden="true">
          <div><span id="gameTransitionIconV14">✦</span><strong id="gameTransitionTextV14">Chargement</strong></div>
        </div>`);
    }
  }

  function visibleScreen(){
    const candidates = [...document.querySelectorAll(".screen")];
    const visible = candidates.find(element => {
      if (element.classList.contains("hidden")) return false;
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    return visible || document.getElementById("homeScreen");
  }

  function updateNavActive(route){
    document.querySelectorAll("[data-game-route]").forEach(button => {
      button.classList.toggle("active",button.dataset.gameRoute === route);
    });
  }

  function updateBodyClasses(meta,screenId){
    const body = document.body;
    body.dataset.gameScreen = screenId;
    body.dataset.gameSection = meta.section;
    body.classList.toggle("ui-focus-mode",Boolean(meta.focus));
    body.classList.remove("ui-theme-home","ui-theme-reading","ui-theme-math","ui-theme-errors","ui-theme-map","ui-theme-rewards","ui-theme-parents");
    body.classList.add(`ui-theme-${meta.section}`);
  }

  function screenRoute(screenId){
    return screenMeta[screenId]?.route || "home";
  }

  function storeRoute(screenId,meta){
    if (screenId === lastStoredScreen) return;
    lastStoredScreen = screenId;
    writeUiState({
      screenId,
      section:meta.section,
      route:meta.route,
      label:meta.label
    });
  }

  function syncActiveScreen(options={}){
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const screen = visibleScreen();
      if (!screen) return;
      const nextId = screen.id || "homeScreen";
      const meta = screenMeta[nextId] || {section:"home",route:"home",label:"LumiKids",icon:"✦"};
      const previousId = currentScreenId;
      currentScreenId = nextId;
      currentSection = meta.section;
      updateBodyClasses(meta,nextId);
      updateNavActive(meta.route);
      storeRoute(nextId,meta);
      document.dispatchEvent(new CustomEvent("lumikids:screenchange",{detail:{screenId:nextId,previousId,meta,options}}));
    },options.delay ?? 0);
  }

  function pushScreen(screenId){
    if (!screenId || screenId === "homeScreen") return;
    const last = routeStack[routeStack.length-1];
    if (last !== screenId) routeStack.push(screenId);
    if (routeStack.length > 30) routeStack.shift();
  }

  function executeRoute(route){
    const action = routeActions[route];
    if (typeof action !== "function") return;
    action();
  }

  window.navigateGameV14 = function(route){
    closeGameProfileV14();
    const currentRoute = screenRoute(currentScreenId);
    if (currentRoute === route && route !== "home") return syncActiveScreen();
    if (!navigatingBack) pushScreen(currentScreenId);
    showGameTransitionV14(route);
    executeRoute(route);
    syncActiveScreen({delay:20});
  };

  window.goBackGameV14 = function(){
    closeGameProfileV14();
    navigatingBack = true;
    let targetId = routeStack.pop();
    while (targetId === currentScreenId && routeStack.length) targetId = routeStack.pop();
    const route = targetId ? screenRoute(targetId) : "home";
    showGameTransitionV14(route);
    executeRoute(route);
    setTimeout(() => {
      navigatingBack = false;
      syncActiveScreen();
    },30);
  };

  window.openGameProfileV14 = function(){
    const overlay = document.getElementById("gameProfileOverlayV14");
    const state = safeState();
    const title = document.getElementById("gameProfileTitleV14");
    if (title) title.textContent = state?.childName || "Champion";
    overlay?.classList.remove("hidden");
    updateNavActive("profile");
  };

  window.closeGameProfileV14 = function(){
    document.getElementById("gameProfileOverlayV14")?.classList.add("hidden");
    updateNavActive(screenRoute(currentScreenId));
  };

  window.showGameTransitionV14 = function(routeOrLabel="Chargement"){
    if (document.body.classList.contains("v10-reduced-motion")) return;
    const meta = Object.values(screenMeta).find(item => item.route === routeOrLabel);
    const overlay = document.getElementById("gameTransitionV14");
    const icon = document.getElementById("gameTransitionIconV14");
    const text = document.getElementById("gameTransitionTextV14");
    if (icon) icon.textContent = meta?.icon || "✦";
    if (text) text.textContent = meta?.label || String(routeOrLabel);
    overlay?.classList.add("active");
    clearTimeout(window.showGameTransitionV14.timer);
    window.showGameTransitionV14.timer = setTimeout(()=>overlay?.classList.remove("active"),230);
  };

  function wrapNavigationFunction(name,{push=true,transition=false}={}){
    const original = window[name];
    if (typeof original !== "function" || original.__gameNavV14Wrapped) return;
    function wrapped(...args){
      if (push && !navigatingBack) pushScreen(currentScreenId);
      if (transition) showGameTransitionV14(name.replace(/^show|^open|V\d+$/g,"")||"Chargement");
      const result = original.apply(this,args);
      syncActiveScreen({delay:18});
      setTimeout(()=>syncActiveScreen(),90);
      return result;
    }
    wrapped.__gameNavV14Wrapped = true;
    wrapped.__gameNavV14Original = original;
    window[name] = wrapped;
  }

  function installFunctionWrappers(){
    [
      "showHome","showReadingHome","showLettersHome","showSoundsHome",
      "showReadingExercisesHome","showMath","showRewards","showMistakeReview",
      "showWorldMap","showParentDashboard","showGuardianFinaleV13"
    ].forEach(name=>wrapNavigationFunction(name,{push:name!=="showHome"}));

    ["openLesson","openPracticeLessonV9","startPracticeExerciseV9","startMathsGame"].forEach(name=>{
      wrapNavigationFunction(name,{push:false});
    });
  }

  function updateViewportMode(){
    const width = window.innerWidth;
    const height = window.innerHeight;
    document.body.classList.toggle("ui-phone",width < 680);
    document.body.classList.toggle("ui-tablet",width >= 680 && width < 1024);
    document.body.classList.toggle("ui-desktop",width >= 1024);
    document.body.classList.toggle("ui-landscape",width > height);
    document.body.classList.toggle("ui-portrait",height >= width);
  }

  function observeScreens(){
    const observer = new MutationObserver(mutations => {
      const relevant = mutations.some(mutation => {
        if (mutation.type === "attributes") {
          return mutation.target instanceof Element && mutation.target.classList.contains("screen");
        }
        return [...mutation.addedNodes].some(node =>
          node instanceof Element && (node.classList.contains("screen") || node.querySelector?.(".screen"))
        );
      });
      if (relevant) syncActiveScreen({delay:4});
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","style"]});
  }

  document.addEventListener("click",event => {
    if (event.target === document.getElementById("gameProfileOverlayV14")) closeGameProfileV14();
  });
  document.addEventListener("keydown",event => {
    if (event.key === "Escape") {
      if (!document.getElementById("gameProfileOverlayV14")?.classList.contains("hidden")) closeGameProfileV14();
      else if (currentScreenId !== "homeScreen") goBackGameV14();
    }
  });

  function init(){
    injectNavigation();
    installFunctionWrappers();
    updateViewportMode();
    observeScreens();
    syncActiveScreen();
    window.addEventListener("resize",updateViewportMode,{passive:true});
    window.addEventListener("orientationchange",()=>setTimeout(updateViewportMode,100),{passive:true});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();

  window.GameNavigationV14 = {
    get currentScreenId(){return currentScreenId;},
    get currentSection(){return currentSection;},
    sync:syncActiveScreen,
    goBack:window.goBackGameV14,
    navigate:window.navigateGameV14,
    state:readUiState
  };
})();
