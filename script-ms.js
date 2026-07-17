/* =========================================================
   LUMIKIDS V17 — MOYENNE SECTION FINALISÉE
   Module chargé après les scripts historiques et l'interface V14.
========================================================= */
(function installLumiKidsClassesV15(){
  "use strict";
  if (window.__lumikidsClassesV15Installed) return;
  window.__lumikidsClassesV15Installed = true;

  const CLASS_KEY = "lumikids-school-level-v15";
  const MS_SERIES_LENGTH = 5;
  const CLASS_INFO = {
    ps:{key:"ps",short:"PS",label:"Petite Section",icon:"🧸",available:true},
    ms:{key:"ms",short:"MS",label:"Moyenne Section",icon:"🎨",available:true},
    "gs-cp":{key:"gs-cp",short:"GS / CP",label:"Grande Section / début CP",icon:"📚",available:true}
  };

  let originalsV15 = {};
  let currentDomainV15 = "language";
  let currentActivityV15 = null;
  let currentQuestionsV15 = [];
  let currentQuestionIndexV15 = 0;
  let currentSeriesCorrectV15 = 0;
  let currentSeriesErrorsV15 = 0;
  let currentSelectionsV15 = [];
  let currentOrderV15 = [];
  let currentQuestionLockedV15 = false;
  let correctionMistakeIndexV15 = null;
  let lastQuestionSnapshotV15 = null;
  let memoryStateV15 = null;
  let autoReadTimerV15 = 0;

  const WORDS_V15 = [
    {word:"moto",icon:"🏍️",syllables:2,initial:"m",rhyme:"o"},
    {word:"maison",icon:"🏠",syllables:2,initial:"m",rhyme:"on"},
    {word:"maman",icon:"👩",syllables:2,initial:"m",rhyme:"an"},
    {word:"ballon",icon:"⚽",syllables:2,initial:"b",rhyme:"on"},
    {word:"banane",icon:"🍌",syllables:3,initial:"b",rhyme:"ane"},
    {word:"bateau",icon:"⛵",syllables:2,initial:"b",rhyme:"o"},
    {word:"chat",icon:"🐱",syllables:1,initial:"ch",rhyme:"a"},
    {word:"chapeau",icon:"🎩",syllables:2,initial:"ch",rhyme:"o"},
    {word:"chocolat",icon:"🍫",syllables:3,initial:"ch",rhyme:"a"},
    {word:"lapin",icon:"🐰",syllables:2,initial:"l",rhyme:"in"},
    {word:"lune",icon:"🌙",syllables:1,initial:"l",rhyme:"une"},
    {word:"livre",icon:"📘",syllables:1,initial:"l",rhyme:"ivre"},
    {word:"souris",icon:"🐭",syllables:2,initial:"s",rhyme:"i"},
    {word:"salade",icon:"🥗",syllables:3,initial:"s",rhyme:"ade"},
    {word:"soleil",icon:"☀️",syllables:2,initial:"s",rhyme:"eil"},
    {word:"tomate",icon:"🍅",syllables:3,initial:"t",rhyme:"ate"},
    {word:"tortue",icon:"🐢",syllables:2,initial:"t",rhyme:"ue"},
    {word:"tapis",icon:"🧶",syllables:2,initial:"t",rhyme:"i"},
    {word:"vélo",icon:"🚲",syllables:2,initial:"v",rhyme:"o"},
    {word:"vache",icon:"🐮",syllables:1,initial:"v",rhyme:"ache"},
    {word:"valise",icon:"🧳",syllables:3,initial:"v",rhyme:"ise"},
    {word:"rat",icon:"🐀",syllables:1,initial:"r",rhyme:"a"},
    {word:"riz",icon:"🍚",syllables:1,initial:"r",rhyme:"i"},
    {word:"jardin",icon:"🌻",syllables:2,initial:"j",rhyme:"in"},
    {word:"gâteau",icon:"🎂",syllables:2,initial:"g",rhyme:"o"},
    {word:"dune",icon:"🏜️",syllables:1,initial:"d",rhyme:"une"},
    {word:"abeille",icon:"🐝",syllables:2,initial:"a",rhyme:"eil"},
    {word:"girafe",icon:"🦒",syllables:2,initial:"j",rhyme:"afe"},
    {word:"papa",icon:"👨",syllables:2,initial:"p",rhyme:"a"},
    {word:"pirate",icon:"🏴‍☠️",syllables:2,initial:"p",rhyme:"ate"},
    {word:"pomme",icon:"🍎",syllables:1,initial:"p",rhyme:"omme"},
    {word:"fourmi",icon:"🐜",syllables:2,initial:"f",rhyme:"i"},
    {word:"fusée",icon:"🚀",syllables:2,initial:"f",rhyme:"é"},
    {word:"forêt",icon:"🌲",syllables:2,initial:"f",rhyme:"è"},
    {word:"crocodile",icon:"🐊",syllables:3,initial:"k",rhyme:"ile"},
    {word:"camion",icon:"🚚",syllables:2,initial:"k",rhyme:"on"},
    {word:"cadeau",icon:"🎁",syllables:2,initial:"k",rhyme:"o"}
  ];

  const RHYME_PAIRS_V15 = [
    ["chat","rat"],["bateau","gâteau"],["souris","riz"],
    ["lapin","jardin"],["maison","ballon"],["lune","dune"],
    ["soleil","abeille"],["moto","vélo"]
  ];

  const SHAPES_V15 = [
    {name:"rond",symbol:"●",color:"#ef6f6c"},
    {name:"carré",symbol:"■",color:"#5c86df"},
    {name:"triangle",symbol:"▲",color:"#f2b448"},
    {name:"rectangle",symbol:"▬",color:"#55bd7d"}
  ];

  const COLORS_V15 = ["🔴","🔵","🟡","🟢","🟣"];
  const SHAPE_SYMBOLS_V15 = ["●","■","▲","◆","★"];

  function escapeV15(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function randomV15(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
  }

  function pickV15(array){
    return array[Math.floor(Math.random()*array.length)];
  }

  function shuffleV15(array){
    const result=[...array];
    for(let i=result.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }

  function uniqueV15(array){
    return [...new Set(array)];
  }

  function choiceV15(value,label,extra={}){
    return {value:String(value),label:String(label),...extra};
  }

  function stateV15(){
    try { return typeof gameState !== "undefined" ? gameState : null; }
    catch { return null; }
  }

  function saveV15(){
    try { window.saveGameState?.(); }
    catch {
      try { localStorage.setItem("lumikids-state",JSON.stringify(stateV15())); } catch {}
    }
  }

  function todayV15(){
    const d=new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  }

  function defaultMsProgressV15(){
    return {
      xp:0,
      stars:0,
      coins:0,
      correct:0,
      total:0,
      seriesCompleted:0,
      perfectSeries:0,
      correctedMistakes:0,
      activities:{},
      mistakes:[],
      lastActivity:null,
      recent:[],
      daily:{date:"",correct:0,target:10,claimed:false},
      createdAt:Date.now()
    };
  }

  function ensureStateV15(){
    const state=stateV15();
    if(!state) return null;
    if(!state.classProfilesV15) state.classProfilesV15={};
    if(!state.classProfilesV15.ms) state.classProfilesV15.ms=defaultMsProgressV15();
    const ms=state.classProfilesV15.ms;
    const defaults=defaultMsProgressV15();
    Object.keys(defaults).forEach(key=>{
      if(ms[key]===undefined || ms[key]===null) ms[key]=defaults[key];
    });
    if(!ms.activities) ms.activities={};
    if(!Array.isArray(ms.mistakes)) ms.mistakes=[];
    if(!Array.isArray(ms.recent)) ms.recent=[];
    if(!ms.daily) ms.daily=defaults.daily;

    if(!state.schoolLevelV15){
      try {
        const saved=localStorage.getItem(CLASS_KEY);
        if(saved && CLASS_INFO[saved]?.available) state.schoolLevelV15=saved;
      } catch {}
    }
    return state;
  }

  function msStateV15(){
    return ensureStateV15()?.classProfilesV15?.ms || defaultMsProgressV15();
  }

  function selectedClassV15(){
    return ensureStateV15()?.schoolLevelV15 || "";
  }

  function isMsV15(){
    return selectedClassV15()==="ms";
  }

  function classInfoV15(){
    return CLASS_INFO[selectedClassV15()] || CLASS_INFO["gs-cp"];
  }

  function setTextV15(id,value){
    const element=document.getElementById(id);
    if(element) element.textContent=String(value);
  }

  function speakV15(text){
    clearTimeout(autoReadTimerV15);
    if(!text) return;
    try {
      if(window.LumiVoiceV17?.speak?.(String(text),"ms")) return;
      if(typeof window.speak==="function") return window.speak(String(text));
      if("speechSynthesis" in window){
        speechSynthesis.cancel();
        const utterance=new SpeechSynthesisUtterance(String(text));
        utterance.lang="fr-FR";
        utterance.rate=.78;
        speechSynthesis.speak(utterance);
      }
    } catch {}
  }

  function autoSpeakV15(text){
    clearTimeout(autoReadTimerV15);
    autoReadTimerV15=setTimeout(()=>speakV15(text),380);
  }

  function msLevelV15(){
    return Math.floor(Number(msStateV15().xp||0)/100)+1;
  }

  function ensureMsDailyV15(){
    const ms=msStateV15();
    const today=todayV15();
    if(ms.daily.date!==today){
      ms.daily={date:today,correct:0,target:10,claimed:false};
      saveV15();
    }
    return ms.daily;
  }

  function addMsDailyCorrectV15(amount=1){
    const daily=ensureMsDailyV15();
    if(daily.claimed) return;
    daily.correct=Math.min(daily.target,Number(daily.correct||0)+amount);
  }

  function activityStatV15(id){
    const ms=msStateV15();
    if(!ms.activities[id]){
      ms.activities[id]={plays:0,best:0,stars:0,correct:0,total:0,completed:false,lastPlayedAt:0};
    }
    return ms.activities[id];
  }

  function domainActivitiesV15(domain){
    return ACTIVITIES_V15.filter(activity=>activity.domain===domain);
  }

  function domainProgressV15(domain){
    const list=domainActivitiesV15(domain);
    const completed=list.filter(activity=>activityStatV15(activity.id).completed).length;
    const mastered=list.filter(activity=>activityStatV15(activity.id).best>=80).length;
    const stars=list.reduce((sum,activity)=>sum+Number(activityStatV15(activity.id).stars||0),0);
    return {total:list.length,completed,mastered,stars};
  }

  function overallProgressV15(){
    const total=ACTIVITIES_V15.length;
    const completed=ACTIVITIES_V15.filter(activity=>activityStatV15(activity.id).completed).length;
    const mastered=ACTIVITIES_V15.filter(activity=>activityStatV15(activity.id).best>=80).length;
    return {total,completed,mastered,percent:total?Math.round(mastered/total*100):0};
  }

  function wordByNameV15(name){
    return WORDS_V15.find(item=>item.word===name);
  }

  function choicesWithAnswerV15(answer,pool,count=4){
    const candidates=shuffleV15(uniqueV15(pool.filter(value=>String(value)!==String(answer))));
    return shuffleV15([String(answer),...candidates.slice(0,count-1)]);
  }

  function objectRowV15(icon,count){
    return `<div class="ms-emoji-row-v15">${Array.from({length:count},()=>`<span>${icon}</span>`).join("")}</div>`;
  }

  function makeSingleV15(activity,prompt,instruction,visual,choices,answer,speech,explanation=""){
    return {activityId:activity.id,domain:activity.domain,mode:"single",prompt,instruction,visual,choices,answer:String(answer),speech:speech||`${instruction} ${prompt}`,explanation};
  }

  function makeMultiV15(activity,prompt,instruction,visual,choices,answers,speech,explanation=""){
    return {activityId:activity.id,domain:activity.domain,mode:"multi",prompt,instruction,visual,choices,answer:answers.map(String),speech:speech||`${instruction} ${prompt}`,explanation};
  }

  function makeOrderV15(activity,prompt,instruction,visual,choices,answers,speech,explanation=""){
    return {activityId:activity.id,domain:activity.domain,mode:"order",prompt,instruction,visual,choices,answer:answers.map(String),speech:speech||`${instruction} ${prompt}`,explanation};
  }

  const ACTIVITIES_V15 = [
    /* Langage */
    {
      id:"same-letter",domain:"language",icon:"AA",title:"Les lettres jumelles",
      description:"Associer deux lettres capitales identiques.",color:"#7258d5",soft:"#ede9ff",
      generator(activity){
        const letters="ABCDEFGHILMNOPRSTUV".split("");
        const target=pickV15(letters);
        const values=choicesWithAnswerV15(target,letters,4);
        return makeSingleV15(activity,"Retrouve exactement la même lettre.","Observe la grande lettre.",`<div class="ms-big-symbol-v15">${target}</div>`,values.map(value=>choiceV15(value,value)),target,`Observe la lettre ${target}. Retrouve exactement la même lettre.`);
      }
    },
    {
      id:"find-letter",domain:"language",icon:"🔎",title:"Cherche la lettre",
      description:"Retrouver une lettre capitale parmi plusieurs.",color:"#8064df",soft:"#eeeaff",
      generator(activity){
        const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const target=pickV15(letters);
        const values=choicesWithAnswerV15(target,letters,6);
        return makeSingleV15(activity,`Où est la lettre ${target} ?`,`Écoute puis cherche la bonne lettre.`,`<div class="ms-big-symbol-v15">🔎</div>`,values.map(value=>choiceV15(value,value)),target,`Où est la lettre ${target} ?`);
      }
    },
    {
      id:"symbol-family",domain:"language",icon:"A1",title:"Lettre, chiffre ou dessin ?",
      description:"Distinguer les lettres, les nombres et les images.",color:"#5a78d4",soft:"#e8efff",
      generator(activity){
        const family=pickV15(["lettre","chiffre","dessin"]);
        const value=family==="lettre"?pickV15("ABCDEFGHLMRST".split("")):family==="chiffre"?String(randomV15(1,9)):pickV15(["🐱","🍎","🚲","⭐","🏠"]);
        const labels={lettre:"Une lettre",chiffre:"Un chiffre",dessin:"Un dessin"};
        return makeSingleV15(activity,"Qu'est-ce que tu vois ?","Choisis la bonne famille.",`<div class="ms-big-symbol-v15">${value}</div>`,shuffleV15(Object.keys(labels)).map(key=>choiceV15(key,labels[key])),family,`Qu'est-ce que tu vois ? Est-ce une lettre, un chiffre ou un dessin ?`);
      }
    },
    {
      id:"my-name",domain:"language",icon:"👤",title:"Mon prénom",
      description:"Reconnaître son prénom parmi plusieurs mots.",color:"#e17fa7",soft:"#ffe9f2",
      generator(activity){
        const own=String(stateV15()?.childName||"Champion").trim()||"Champion";
        const pool=["Lila","Noa","Sami","Milo","Zoé","Lina","Pico","Aurore"].filter(name=>name.toLowerCase()!==own.toLowerCase());
        const values=shuffleV15([own,...shuffleV15(pool).slice(0,3)]);
        return makeSingleV15(activity,"Touche ton prénom.","Regarde bien chaque prénom.",`<div class="ms-big-symbol-v15">👋</div>`,values.map(value=>choiceV15(value,value)),own,`Touche ton prénom. Ton prénom est ${own}.`);
      }
    },
    {
      id:"listen-word",domain:"language",icon:"🔊",title:"Le mot entendu",
      description:"Écouter un mot et retrouver son image.",color:"#4c9fbe",soft:"#e5f7fb",
      generator(activity){
        const target=pickV15(WORDS_V15);
        const others=shuffleV15(WORDS_V15.filter(word=>word.word!==target.word)).slice(0,3);
        const values=shuffleV15([target,...others]);
        return makeSingleV15(activity,"Quelle image correspond au mot entendu ?","Appuie sur le haut-parleur si tu veux réécouter.",`<div class="ms-big-symbol-v15">🔊</div>`,values.map(item=>choiceV15(item.word,item.icon,{small:item.word})),target.word,`Écoute. ${target.word}. Quelle image correspond au mot ${target.word} ?`);
      }
    },
    {
      id:"count-syllables",domain:"language",icon:"👏",title:"Les syllabes",
      description:"Compter les morceaux entendus dans un mot.",color:"#df8b4a",soft:"#fff0e0",
      generator(activity){
        const target=pickV15(WORDS_V15.filter(word=>word.syllables<=3));
        return makeSingleV15(activity,`Combien de syllabes entends-tu dans « ${target.word} » ?`,`Dis le mot en frappant dans tes mains.`,`<div class="ms-big-symbol-v15">${target.icon}</div>`,[1,2,3].map(number=>choiceV15(number,number,{small:number===1?"syllabe":"syllabes"})),target.syllables,`${target.word}. Frappe dans tes mains pour chaque syllabe. Combien de syllabes entends-tu ?`);
      }
    },
    {
      id:"same-initial",domain:"language",icon:"M…",title:"Même début",
      description:"Trouver deux mots qui commencent pareil.",color:"#5eae78",soft:"#e5f8eb",
      generator(activity){
        const initials=uniqueV15(WORDS_V15.map(word=>word.initial)).filter(initial=>WORDS_V15.filter(word=>word.initial===initial).length>=2);
        const initial=pickV15(initials);
        const group=shuffleV15(WORDS_V15.filter(word=>word.initial===initial));
        const target=group[0];
        const answer=group[1];
        const others=shuffleV15(WORDS_V15.filter(word=>word.initial!==initial)).slice(0,3);
        return makeSingleV15(activity,`Quel mot commence comme « ${target.word} » ?`,`Écoute le début des mots.`,`<div class="ms-emoji-row-v15"><span>${target.icon}</span><strong>${escapeV15(target.word)}</strong></div>`,shuffleV15([answer,...others]).map(item=>choiceV15(item.word,item.icon,{small:item.word})),answer.word,`${target.word}. Quel mot commence comme ${target.word} ?`);
      }
    },
    {
      id:"rhymes",domain:"language",icon:"🎵",title:"Les mots qui riment",
      description:"Reconnaître deux mots qui finissent pareil.",color:"#c775cc",soft:"#f8e8fa",
      generator(activity){
        const pair=pickV15(RHYME_PAIRS_V15);
        const target=wordByNameV15(pair[0]);
        const answer=wordByNameV15(pair[1]);
        const others=shuffleV15(WORDS_V15.filter(word=>word.word!==target.word&&word.word!==answer.word&&word.rhyme!==target.rhyme)).slice(0,3);
        return makeSingleV15(activity,`Quel mot rime avec « ${target.word} » ?`,`Cherche le mot qui finit presque pareil.`,`<div class="ms-emoji-row-v15"><span>${target.icon}</span><strong>${escapeV15(target.word)}</strong></div>`,shuffleV15([answer,...others]).map(item=>choiceV15(item.word,item.icon,{small:item.word})),answer.word,`${target.word}. Quel mot rime avec ${target.word} ?`);
      }
    },
    {
      id:"initial-group",domain:"language",icon:"🧺",title:"Le panier des sons",
      description:"Choisir plusieurs mots qui commencent par le même son.",color:"#56a98e",soft:"#e4f7f0",
      generator(activity){
        const initials=uniqueV15(WORDS_V15.map(word=>word.initial)).filter(initial=>WORDS_V15.filter(word=>word.initial===initial).length>=3);
        const initial=pickV15(initials);
        const matches=shuffleV15(WORDS_V15.filter(word=>word.initial===initial)).slice(0,2);
        const others=shuffleV15(WORDS_V15.filter(word=>word.initial!==initial)).slice(0,2);
        const choices=shuffleV15([...matches,...others]);
        return makeMultiV15(activity,`Choisis les deux mots qui commencent par le son « ${initial} ».`,`Tu peux sélectionner deux images.`,`<div class="ms-big-symbol-v15">${initial.toUpperCase()}</div>`,choices.map(item=>choiceV15(item.word,item.icon,{small:item.word})),matches.map(item=>item.word),`Choisis les deux mots qui commencent par le son ${initial}.`);
      }
    },

    {
      id:"first-syllable",domain:"language",icon:"MA",title:"Le début du mot",
      description:"Reconnaître la première syllabe de mots familiers.",color:"#d276a8",soft:"#fdeaf4",
      generator(activity){
        const items=[
          {word:"moto",icon:"🏍️",first:"MO"},{word:"maison",icon:"🏠",first:"MA"},{word:"banane",icon:"🍌",first:"BA"},
          {word:"bateau",icon:"⛵",first:"BA"},{word:"tomate",icon:"🍅",first:"TO"},{word:"tapis",icon:"🧶",first:"TA"},
          {word:"salade",icon:"🥗",first:"SA"},{word:"valise",icon:"🧳",first:"VA"},{word:"girafe",icon:"🦒",first:"GI"}
        ];
        const target=pickV15(items),syllables=uniqueV15(items.map(item=>item.first));
        const values=choicesWithAnswerV15(target.first,syllables,4);
        return makeSingleV15(activity,`Par quelle syllabe commence « ${target.word} » ?`,`Dis le mot lentement.`,`<div class="ms-emoji-row-v15"><span>${target.icon}</span><strong>${escapeV15(target.word)}</strong></div>`,values.map(value=>choiceV15(value,value)),target.first,`${target.word}. Par quelle syllabe commence ${target.word} ?`);
      }
    },
    {
      id:"compare-word-length",domain:"language",icon:"👏👏",title:"Le mot le plus long",
      description:"Comparer deux mots grâce au nombre de syllabes.",color:"#62a282",soft:"#e6f7ed",
      generator(activity){
        let short=pickV15(WORDS_V15.filter(word=>word.syllables===1));
        let long=pickV15(WORDS_V15.filter(word=>word.syllables===3));
        const askLong=Math.random()>.5,target=askLong?long:short;
        return makeSingleV15(activity,askLong?"Quel mot a le plus de syllabes ?":"Quel mot a le moins de syllabes ?","Frappe les mots dans tes mains.",`<div class="ms-big-symbol-v15">👏</div>`,shuffleV15([short,long]).map(item=>choiceV15(item.word,item.icon,{small:item.word})),target.word,askLong?"Quel mot a le plus de syllabes ?":"Quel mot a le moins de syllabes ?");
      }
    },

    /* Mathématiques */
    {
      id:"hear-number",domain:"math",icon:"🔢",title:"Le nombre entendu",
      description:"Écouter puis reconnaître les nombres de 1 à 10.",color:"#5687df",soft:"#e9f0ff",
      generator(activity){
        const target=randomV15(1,10);
        const values=choicesWithAnswerV15(target,Array.from({length:10},(_,i)=>i+1),4);
        return makeSingleV15(activity,"Quel nombre as-tu entendu ?","Écoute puis choisis le bon chiffre.",`<div class="ms-big-symbol-v15">🔊</div>`,values.map(value=>choiceV15(value,value)),target,`Écoute. Le nombre ${target}. Touche le nombre ${target}.`);
      }
    },
    {
      id:"number-quantity",domain:"math",icon:"5🍎",title:"Chiffre et quantité",
      description:"Associer un chiffre à la bonne collection.",color:"#4d9fc6",soft:"#e4f7fc",
      generator(activity){
        const target=randomV15(1,10);
        const icon=pickV15(["🍎","⭐","🐟","🟣","🚗"]);
        const counts=choicesWithAnswerV15(target,Array.from({length:10},(_,i)=>i+1),4).map(Number);
        return makeSingleV15(activity,`Quelle collection montre ${target} objets ?`,`Compte les objets de chaque collection.`,`<div class="ms-big-symbol-v15">${target}</div>`,counts.map(count=>choiceV15(count,objectRowV15(icon,count),{html:true})),target,`Quelle collection montre ${target} objets ?`);
      }
    },
    {
      id:"count-objects",domain:"math",icon:"👆",title:"Je compte",
      description:"Compter une collection de 1 à 10 objets.",color:"#4bae83",soft:"#e3f8eb",
      generator(activity){
        const target=randomV15(1,10);
        const icon=pickV15(["🍓","🐞","🌟","🧁","⚽"]);
        const values=choicesWithAnswerV15(target,Array.from({length:10},(_,i)=>i+1),4);
        return makeSingleV15(activity,"Combien y a-t-il d'objets ?","Pointe chaque objet en comptant.",objectRowV15(icon,target),values.map(value=>choiceV15(value,value)),target,`Compte les objets. Combien y en a-t-il ?`);
      }
    },
    {
      id:"complete-collection",domain:"math",icon:"＋1",title:"Complète la collection",
      description:"Ajouter ce qui manque pour atteindre une quantité.",color:"#e29b42",soft:"#fff0dc",
      generator(activity){
        const target=randomV15(3,10);
        const shown=randomV15(1,target-1);
        const missing=target-shown;
        const icon=pickV15(["🍏","⭐","🐥","🌸"]);
        const values=choicesWithAnswerV15(missing,Array.from({length:9},(_,i)=>i+1),4);
        return makeSingleV15(activity,`Combien faut-il ajouter pour en avoir ${target} ?`,`Compte les objets puis cherche ce qui manque.`,`${objectRowV15(icon,shown)}<div class="ms-big-symbol-v15" style="font-size:34px">${shown} + ? = ${target}</div>`,values.map(value=>choiceV15(value,value)),missing,`Il y a ${shown} objets. Combien faut-il en ajouter pour en avoir ${target} ?`);
      }
    },
    {
      id:"compare-collections",domain:"math",icon:"⚖️",title:"Plus, moins ou autant",
      description:"Comparer deux collections.",color:"#d2768d",soft:"#fdeaf0",
      generator(activity){
        const relation=pickV15(["plus","moins","autant"]);
        const left=randomV15(1,8);
        let right=left;
        if(relation==="plus") right=randomV15(1,left);
        if(relation==="plus" && right===left) right=Math.max(1,left-1);
        if(relation==="moins") right=randomV15(left,10);
        if(relation==="moins" && right===left) right=Math.min(10,left+1);
        const actual=left>right?"plus":left<right?"moins":"autant";
        const icon=pickV15(["🟡","🍎","🐟"]);
        const visual=`<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:15px;align-items:center;width:100%"><div class="ms-quantity-box-v15">${objectRowV15(icon,left)}</div><strong>et</strong><div class="ms-quantity-box-v15">${objectRowV15(icon,right)}</div></div>`;
        return makeSingleV15(activity,"À gauche, y en a-t-il plus, moins ou autant ?","Compare les deux collections.",visual,[choiceV15("plus","Plus"),choiceV15("moins","Moins"),choiceV15("autant","Autant")],actual,"Compare les deux collections. À gauche, y en a-t-il plus, moins ou autant ?");
      }
    },
    {
      id:"order-numbers",domain:"math",icon:"1 2 3",title:"Dans le bon ordre",
      description:"Ranger trois nombres du plus petit au plus grand.",color:"#6a63cf",soft:"#eceaff",
      generator(activity){
        const values=shuffleV15(uniqueV15(Array.from({length:6},()=>randomV15(1,10))));
        while(values.length<3) values.push(randomV15(1,10));
        const three=uniqueV15(values).slice(0,3);
        while(three.length<3){const n=randomV15(1,10);if(!three.includes(n))three.push(n);}
        const answer=[...three].sort((a,b)=>a-b).map(String);
        return makeOrderV15(activity,"Range les nombres du plus petit au plus grand.","Touche les nombres dans le bon ordre.",`<div class="ms-big-symbol-v15" style="font-size:45px">↗</div>`,shuffleV15(three).map(value=>choiceV15(value,value)),answer,"Range les nombres du plus petit au plus grand.");
      }
    },
    {
      id:"add-one",domain:"math",icon:"➕",title:"J'ajoute",
      description:"Résoudre de petits ajouts avec des objets.",color:"#48a875",soft:"#e4f8eb",
      generator(activity){
        const a=randomV15(1,6),b=randomV15(1,Math.min(3,10-a)),answer=a+b;
        const icon=pickV15(["🍎","⭐","🐸","🚗"]);
        const values=choicesWithAnswerV15(answer,Array.from({length:10},(_,i)=>i+1),4);
        return makeSingleV15(activity,`Il y en a ${a}. On en ajoute ${b}. Combien y en a-t-il maintenant ?`,`Réunis les deux groupes.`,`${objectRowV15(icon,a)}<div style="font-size:30px;font-weight:950;margin:8px">+ ${b}</div>`,values.map(value=>choiceV15(value,value)),answer,`Il y en a ${a}. On en ajoute ${b}. Combien y en a-t-il maintenant ?`);
      }
    },
    {
      id:"remove-one",domain:"math",icon:"➖",title:"J'enlève",
      description:"Résoudre de petits retraits avec des objets.",color:"#df7f65",soft:"#fff0eb",
      generator(activity){
        const a=randomV15(3,10),b=randomV15(1,Math.min(3,a-1)),answer=a-b;
        const icon=pickV15(["🍪","🐟","🌸","🎈"]);
        const values=choicesWithAnswerV15(answer,Array.from({length:10},(_,i)=>i),4);
        return makeSingleV15(activity,`Il y en a ${a}. On en enlève ${b}. Combien en reste-t-il ?`,`Imagine que tu retires les objets.`,`${objectRowV15(icon,a)}<div style="font-size:30px;font-weight:950;margin:8px">− ${b}</div>`,values.map(value=>choiceV15(value,value)),answer,`Il y en a ${a}. On en enlève ${b}. Combien en reste-t-il ?`);
      }
    },
    {
      id:"shapes",domain:"math",icon:"▲",title:"Les formes",
      description:"Reconnaître rond, carré, triangle et rectangle.",color:"#e5a43f",soft:"#fff2d9",
      generator(activity){
        const target=pickV15(SHAPES_V15);
        return makeSingleV15(activity,"Comment s'appelle cette forme ?","Observe les côtés et les coins.",`<div class="ms-big-symbol-v15" style="color:${target.color}">${target.symbol}</div>`,shuffleV15(SHAPES_V15).map(shape=>choiceV15(shape.name,shape.name)),target.name,`Comment s'appelle cette forme ? ${target.name}.`);
      }
    },
    {
      id:"space",domain:"math",icon:"📦",title:"Je me repère",
      description:"Comprendre dessus, dessous, dedans et dehors.",color:"#4d94c4",soft:"#e5f4fc",
      generator(activity){
        const answer=pickV15(["dessus","dessous","dedans","dehors"]);
        const positions={
          dessus:"left:50%;top:15px;transform:translateX(-50%)",
          dessous:"left:50%;bottom:2px;transform:translateX(-50%)",
          dedans:"left:50%;top:78px;transform:translateX(-50%);font-size:34px",
          dehors:"right:20px;top:82px"
        };
        const visual=`<div class="ms-spatial-stage-v15"><div class="ms-spatial-ground-v15"></div><span class="ms-spatial-box-v15">📦</span><span class="ms-spatial-object-v15" style="${positions[answer]}">🐭</span></div>`;
        return makeSingleV15(activity,"Où se trouve la souris par rapport à la boîte ?","Observe bien la scène.",visual,["dessus","dessous","dedans","dehors"].map(value=>choiceV15(value,value.charAt(0).toUpperCase()+value.slice(1))),answer,"Où se trouve la souris par rapport à la boîte ?");
      }
    },

    {
      id:"missing-number",domain:"math",icon:"?",title:"Le nombre caché",
      description:"Compléter une suite de nombres jusqu'à 10.",color:"#5b8ddd",soft:"#eaf1ff",
      generator(activity){
        const start=randomV15(1,6),missingIndex=randomV15(0,3),sequence=Array.from({length:4},(_,i)=>start+i),answer=sequence[missingIndex];
        const visual=sequence.map((value,index)=>index===missingIndex?"❓":String(value)).join("  ");
        return makeSingleV15(activity,"Quel nombre est caché ?","Compte dans l'ordre.",`<div class="ms-big-symbol-v15" style="font-size:42px">${visual}</div>`,choicesWithAnswerV15(answer,Array.from({length:10},(_,i)=>i+1),4).map(value=>choiceV15(value,value)),answer,`Quel nombre est caché dans la suite ? ${visual.replace("❓","un nombre caché")}`);
      }
    },
    {
      id:"before-after",domain:"math",icon:"↔",title:"Avant ou après",
      description:"Trouver le nombre juste avant ou juste après.",color:"#6a74d1",soft:"#eceeff",
      generator(activity){
        const askAfter=Math.random()>.5,target=randomV15(askAfter?1:2,askAfter?9:10),answer=askAfter?target+1:target-1;
        return makeSingleV15(activity,askAfter?`Quel nombre vient juste après ${target} ?`:`Quel nombre vient juste avant ${target} ?`,`Récite les nombres dans l'ordre.`,`<div class="ms-big-symbol-v15">${askAfter?target+" → ?":"? ← "+target}</div>`,choicesWithAnswerV15(answer,Array.from({length:10},(_,i)=>i+1),4).map(value=>choiceV15(value,value)),answer,askAfter?`Quel nombre vient juste après ${target} ?`:`Quel nombre vient juste avant ${target} ?`);
      }
    },
    {
      id:"picture-problems",domain:"math",icon:"💭",title:"Les petits problèmes",
      description:"Résoudre une situation illustrée d'ajout ou de retrait.",color:"#d78954",soft:"#fff0e3",
      generator(activity){
        const add=Math.random()>.5,a=add?randomV15(1,6):randomV15(3,9),b=randomV15(1,Math.min(3,add?10-a:a-1)),answer=add?a+b:a-b,icon=pickV15(["🐞","🍎","⭐","🐟"]);
        const prompt=add?`${a} ${icon} sont là. ${b} arrivent. Combien y en a-t-il ?`:`${a} ${icon} sont là. ${b} partent. Combien en reste-t-il ?`;
        return makeSingleV15(activity,prompt,"Imagine la petite histoire.",`${objectRowV15(icon,a)}<div class="ms-big-symbol-v15" style="font-size:32px">${add?"+":"−"} ${b}</div>`,choicesWithAnswerV15(answer,Array.from({length:11},(_,i)=>i),4).map(value=>choiceV15(value,value)),answer,prompt);
      }
    },

    /* Logique et jeux */
    {
      id:"color-pattern",domain:"logic",icon:"🔴",title:"La suite de couleurs",
      description:"Compléter une alternance de couleurs.",color:"#e47e63",soft:"#fff0ea",
      generator(activity){
        const a=pickV15(COLORS_V15),b=pickV15(COLORS_V15.filter(color=>color!==a));
        const answer=pickV15([a,b]);
        const pattern=answer===a?[a,b,a,b,"❓"]:[b,a,b,a,"❓"];
        return makeSingleV15(activity,"Quelle couleur vient ensuite ?","Observe ce qui se répète.",`<div class="ms-emoji-row-v15">${pattern.map(value=>`<span>${value}</span>`).join("")}</div>`,shuffleV15([a,b,...shuffleV15(COLORS_V15.filter(c=>c!==a&&c!==b)).slice(0,2)]).map(value=>choiceV15(value,value)),answer,"Quelle couleur vient ensuite dans la suite ?");
      }
    },
    {
      id:"shape-pattern",domain:"logic",icon:"●■",title:"La suite de formes",
      description:"Compléter une suite simple de formes.",color:"#6b68d1",soft:"#ecebff",
      generator(activity){
        const a=pickV15(SHAPE_SYMBOLS_V15),b=pickV15(SHAPE_SYMBOLS_V15.filter(shape=>shape!==a));
        const pattern=[a,a,b,a,a,b,"?"];
        return makeSingleV15(activity,"Quelle forme vient ensuite ?","Cherche le groupe qui se répète.",`<div class="ms-big-symbol-v15" style="font-size:43px;letter-spacing:9px">${pattern.join(" ")}</div>`,shuffleV15([a,b,...shuffleV15(SHAPE_SYMBOLS_V15.filter(s=>s!==a&&s!==b)).slice(0,2)]).map(value=>choiceV15(value,value)),a,"Quelle forme vient ensuite dans la suite ?");
      }
    },
    {
      id:"intruder",domain:"logic",icon:"👀",title:"Trouve l'intrus",
      description:"Repérer l'image qui n'appartient pas au groupe.",color:"#d18a43",soft:"#fff0de",
      generator(activity){
        const groups=[
          {same:["🍎","🍌","🍓"],odd:"🚗",name:"fruits"},
          {same:["🐱","🐶","🐰"],odd:"🏠",name:"animaux"},
          {same:["🚗","🚌","🚲"],odd:"🍰",name:"véhicules"},
          {same:["👕","👗","🧦"],odd:"🐟",name:"vêtements"},
          {same:["●","■","▲"],odd:"🍎",name:"formes"}
        ];
        const group=pickV15(groups);
        const values=shuffleV15([...group.same,group.odd]);
        return makeSingleV15(activity,"Quelle image est l'intrus ?","Trois images vont ensemble, une est différente.",`<div class="ms-big-symbol-v15">👀</div>`,values.map(value=>choiceV15(value,value)),group.odd,"Trouve l'image qui ne va pas avec les autres.");
      }
    },
    {
      id:"size-order",domain:"logic",icon:"🐘",title:"Du plus petit au plus grand",
      description:"Ranger trois objets selon leur taille.",color:"#5f9d70",soft:"#e8f7ec",
      generator(activity){
        const sizes=[1,2,3];
        const labels={1:"Petit",2:"Moyen",3:"Grand"};
        return makeOrderV15(activity,"Range les animaux du plus petit au plus grand.","Touche d'abord le plus petit.",`<div class="ms-big-symbol-v15">↗</div>`,shuffleV15(sizes).map(size=>choiceV15(size,`<span style="font-size:${22+size*16}px">🐘</span><small>${labels[size]}</small>`,{html:true})),sizes.map(String),"Range les animaux du plus petit au plus grand.");
      }
    },
    {
      id:"story-order",domain:"logic",icon:"📖",title:"L'histoire en images",
      description:"Remettre trois étapes d'une histoire dans l'ordre.",color:"#52a47d",soft:"#e6f7ed",
      generator(activity){
        const stories=[
          [{value:"seed",label:"🌱",small:"La graine"},{value:"sprout",label:"🌿",small:"La pousse"},{value:"flower",label:"🌸",small:"La fleur"}],
          [{value:"egg",label:"🥚",small:"L'œuf"},{value:"chick",label:"🐣",small:"Le poussin"},{value:"hen",label:"🐔",small:"La poule"}],
          [{value:"dough",label:"🥣",small:"On prépare"},{value:"oven",label:"♨️",small:"On fait cuire"},{value:"cake",label:"🎂",small:"Le gâteau"}]
        ];
        const story=pickV15(stories);
        return makeOrderV15(activity,"Remets l'histoire dans le bon ordre.","Touche d'abord le début, puis la suite.",`<div class="ms-big-symbol-v15">➡️</div>`,shuffleV15(story).map(item=>choiceV15(item.value,item.label,{small:item.small})),story.map(item=>item.value),"Remets les trois images de l'histoire dans le bon ordre.");
      }
    },
    {
      id:"memory",domain:"logic",icon:"🃏",title:"Le memory",
      description:"Retrouver six paires de cartes identiques.",color:"#8b63cf",soft:"#f0e8ff",special:"memory"
    }
  ];

  function activityByIdV15(id){
    return ACTIVITIES_V15.find(activity=>activity.id===id);
  }

  function domainInfoV15(domain){
    return {
      language:{label:"Langage et sons",short:"Langage",icon:"Aa",className:"language",subtitle:"Lettres, mots, syllabes et rimes",description:"Écoute, observe et joue avec les mots pour préparer l'entrée dans la lecture."},
      math:{label:"Nombres et formes",short:"Nombres",icon:"＋",className:"math",subtitle:"Quantités, formes et premiers problèmes",description:"Compte, compare et manipule les nombres jusqu'à 10 grâce à de petits défis."},
      logic:{label:"Logique et jeux",short:"Logique",icon:"🧩",className:"logic",subtitle:"Suites, intrus, classement et mémoire",description:"Observe, réfléchis et développe ta concentration avec de vrais petits jeux."}
    }[domain];
  }

  function ensureScreensV15(){
    const shell=document.querySelector(".game-shell");
    if(!shell) return;
    [
      ["msLanguageScreenV15","reading","reading"],
      ["msMathScreenV15","math","math"],
      ["msLogicScreenV15","reading","reading"],
      ["msActivityScreenV15","reading","reading"],
      ["msProgressScreenV15","map","map"],
      ["msMistakesScreenV15","errors","errors"]
    ].forEach(([id,section,route])=>{
      if(document.getElementById(id)) return;
      const screen=document.createElement("div");
      screen.id=id;
      screen.className="screen ms-screen-v15 hidden";
      screen.dataset.gameSection=section;
      screen.dataset.gameRoute=route;
      shell.appendChild(screen);
    });
  }

  function hideMsScreensV15(){
    ["msLanguageScreenV15","msMathScreenV15","msLogicScreenV15","msActivityScreenV15","msProgressScreenV15","msMistakesScreenV15"].forEach(id=>document.getElementById(id)?.classList.add("hidden"));
  }

  function showOnlyMsScreenV15(id){
    try { originalsV15.hideAllScreens?.(); } catch {}
    hideMsScreensV15();
    const screen=document.getElementById(id);
    screen?.classList.remove("hidden");
    window.GameNavigationV14?.sync?.({delay:5});
    window.GameUiV14?.refresh?.();
    updateMsHudV15();
  }

  function activityCardV15(activity){
    const stat=activityStatV15(activity.id);
    const status=stat.best>=80?"Maîtrisé":stat.plays>0?"En cours":"À découvrir";
    const statusClass=stat.best>=80?"mastered":stat.plays>0?"started":"";
    const tier=stat.best>=80?"Défi":stat.plays>0?"Consolidation":"Découverte";
    const stars="★".repeat(Number(stat.stars||0))+"☆".repeat(Math.max(0,3-Number(stat.stars||0)));
    return `<button class="ms-activity-card-v15" data-early-activity="${escapeV15(activity.id)}" style="--card-color:${activity.color};--card-soft:${activity.soft}" onclick="startMsActivityV15('${escapeV15(activity.id)}')">
      <span class="early-tier-v17">${tier}</span><span class="ms-card-icon-v15">${activity.icon}</span>
      <strong>${escapeV15(activity.title)}</strong>
      <p>${escapeV15(activity.description)}</p>
      <div class="ms-activity-card-footer-v15"><span class="ms-activity-status-v15 ${statusClass}">${status}</span><span class="ms-card-stars-v15">${stars}</span></div>
      <div class="ms-card-progress-v15"><span style="width:${Number(stat.best||0)}%"></span></div>
    </button>`;
  }

  function renderDomainV15(domain){
    currentDomainV15=domain;
    const info=domainInfoV15(domain);
    const id=domain==="language"?"msLanguageScreenV15":domain==="math"?"msMathScreenV15":"msLogicScreenV15";
    const screen=document.getElementById(id);
    if(!screen) return;
    screen.dataset.gameSection=domain==="math"?"math":"reading";
    screen.dataset.gameRoute=domain==="math"?"math":"reading";
    screen.dataset.gameLabel=`${info.short} — Moyenne Section`;
    const progress=domainProgressV15(domain);
    screen.innerHTML=`
      <div class="ms-page-heading-v15">
        <button class="back-btn" onclick="showHome()">← Accueil</button>
        <div><small>Moyenne Section</small><h2>${escapeV15(info.label)}</h2><p>${escapeV15(info.subtitle)}</p></div>
      </div>
      <section class="ms-domain-hero-v15 ${info.className}">
        <div><small>Programme complet MS</small><h3>${escapeV15(info.short)}</h3><p>${escapeV15(info.description)}</p>
          <div class="ms-domain-summary-v15"><span>✓ ${progress.completed}/${progress.total} activités</span><span>🏅 ${progress.mastered} maîtrisées</span><span>⭐ ${progress.stars}</span></div>
        </div><span class="ms-domain-hero-icon-v15">${info.icon}</span>
      </section>
      <div class="ms-section-title-v15"><div><small>Choisis une activité</small><h3>On joue à quoi ?</h3></div><span>5 à 6 questions par série</span></div>
      <div class="ms-activity-grid-v15">${domainActivitiesV15(domain).map(activityCardV15).join("")}</div>
      <div class="ms-section-title-v15"><div><small>Changer d'univers</small><h3>Continuer ailleurs</h3></div></div>
      <div class="ms-progress-domain-grid-v15">
        ${["language","math","logic"].filter(key=>key!==domain).map(key=>{
          const other=domainInfoV15(key);
          return `<button class="ms-progress-domain-v15" onclick="showMsDomainV15('${key}')"><span>${other.icon}</span><strong>${escapeV15(other.label)}</strong><small>${escapeV15(other.subtitle)}</small></button>`;
        }).join("")}
      </div>`;
    showOnlyMsScreenV15(id);
  }

  window.showMsDomainV15=function(domain){
    if(!isMsV15()) return originalsV15.showReadingHome?.();
    renderDomainV15(["language","math","logic"].includes(domain)?domain:"language");
  };

  function adaptMsQuestionV17(question,stat){
    if(!question) return question;
    const tier=Number(stat.best||0)>=80?"Défi":Number(stat.plays||0)>0?"Consolidation":"Découverte";
    question.difficulty=tier;
    if(question.mode==="single"&&Array.isArray(question.choices)&&question.choices.length>3&&Number(stat.plays||0)===0){
      const answer=String(question.answer),correct=question.choices.find(item=>String(item.value)===answer);
      const others=shuffleV15(question.choices.filter(item=>String(item.value)!==answer));
      question.choices=shuffleV15([correct,...others.slice(0,2)].filter(Boolean));
    }
    return question;
  }
  function msQuestionSignatureV17(question){return [question?.activityId,question?.prompt,question?.visual,JSON.stringify(question?.answer)].join("|")}
  function buildSeriesV15(activity){
    if(activity.special==="memory") return [];
    const stat=activityStatV15(activity.id),length=Number(stat.best||0)>=80?6:MS_SERIES_LENGTH;
    const questions=[],seen=new Set();let attempts=0;
    while(questions.length<length&&attempts<length*15){
      attempts++;
      const question=adaptMsQuestionV17(activity.generator(activity),stat),signature=msQuestionSignatureV17(question);
      if(seen.has(signature)&&attempts<length*10) continue;
      seen.add(signature);questions.push(question);
    }
    while(questions.length<length) questions.push(adaptMsQuestionV17(activity.generator(activity),stat));
    return questions;
  }

  window.startMsActivityV15=function(activityId,options={}){
    const activity=activityByIdV15(activityId);
    if(!activity) return;
    currentActivityV15=activity;
    currentDomainV15=activity.domain;
    currentQuestionIndexV15=0;
    currentSeriesCorrectV15=0;
    currentSeriesErrorsV15=0;
    currentSelectionsV15=[];
    currentOrderV15=[];
    currentQuestionLockedV15=false;
    correctionMistakeIndexV15=Number.isInteger(options.correctionIndex)?options.correctionIndex:null;
    currentQuestionsV15=options.question?[options.question]:buildSeriesV15(activity);
    msStateV15().lastActivity={activityId,at:Date.now()};
    saveV15();
    if(activity.special==="memory") return startMemoryV15();
    renderCurrentQuestionV15();
  };

  function renderChoiceLabelV15(item){
    if(item.html) return item.label;
    const looksEmoji=/[\u{1F300}-\u{1FAFF}]/u.test(item.label);
    return `${looksEmoji?`<span>${item.label}</span>`:escapeV15(item.label)}${item.small?`<small>${escapeV15(item.small)}</small>`:""}`;
  }

  function questionAnswerTextV15(question){
    if(Array.isArray(question.answer)) return question.answer.join(" puis ");
    return String(question.answer);
  }

  function renderCurrentQuestionV15(){
    const question=currentQuestionsV15[currentQuestionIndexV15];
    if(!question) return finishMsSeriesV15();
    lastQuestionSnapshotV15=JSON.parse(JSON.stringify(question));
    currentSelectionsV15=[];
    currentOrderV15=[];
    currentQuestionLockedV15=false;
    const screen=document.getElementById("msActivityScreenV15");
    if(!screen) return;
    screen.dataset.gameSection=question.domain==="math"?"math":"reading";
    screen.dataset.gameRoute=question.domain==="math"?"math":"reading";
    screen.dataset.gameLabel=currentActivityV15.title;
    const total=currentQuestionsV15.length;
    const progress=Math.round(currentQuestionIndexV15/total*100);
    const choiceClass=question.choices.length>=5?"three":"";
    screen.innerHTML=`<section class="ms-activity-shell-v15">
      <header class="ms-activity-top-v15">
        <button onclick="quitMsActivityV15()" aria-label="Quitter">×</button>
        <div class="ms-activity-title-v15"><small>${escapeV15(domainInfoV15(question.domain).short)} · Moyenne Section · ${escapeV15(question.difficulty||"Découverte")}</small><strong>${escapeV15(currentActivityV15.title)}</strong></div>
        <span class="ms-question-count-v15">${currentQuestionIndexV15+1} / ${total}</span>
        <div class="ms-series-track-v15"><span style="width:${progress}%"></span></div>
      </header>
      <div class="ms-question-card-v15">
        <div class="ms-instruction-line-v15"><button onclick="repeatMsInstructionV15()" aria-label="Écouter la consigne">🔊</button><span class="ms-instruction-v15">${escapeV15(question.instruction)}</span></div>
        <h2 class="ms-prompt-v15">${escapeV15(question.prompt)}</h2>
        <div class="ms-visual-v15">${question.visual||""}</div>
        ${question.mode==="order"?'<div id="msOrderAnswerV15" class="ms-order-answer-v15">Touche les éléments dans l’ordre.</div>':""}
        <div id="msChoicesV15" class="ms-choices-v15 ${choiceClass}">${question.choices.map((item,index)=>`
          <button class="ms-choice-v15" data-ms-value="${escapeV15(item.value)}" onclick="selectMsChoiceV15(${index})">${renderChoiceLabelV15(item)}</button>`).join("")}</div>
        <div id="msFeedbackV15" class="ms-feedback-v15">Choisis ta réponse.</div>
        <div class="ms-activity-actions-v15">
          <button id="msValidateButtonV15" class="ms-main-action-v15" onclick="validateMsAnswerV15()">Valider</button>
          ${question.mode==="order"?'<button class="ms-secondary-action-v15" onclick="clearMsOrderV15()">Recommencer l’ordre</button>':""}
          <button id="msContinueButtonV15" class="ms-main-action-v15 hidden" onclick="continueMsQuestionV15()">Continuer →</button>
        </div>
      </div>
    </section>`;
    showOnlyMsScreenV15("msActivityScreenV15");
    autoSpeakV15(question.speech||`${question.instruction} ${question.prompt}`);
  }

  window.repeatMsInstructionV15=function(){
    const question=currentQuestionsV15[currentQuestionIndexV15];
    if(question) speakV15(question.speech||`${question.instruction} ${question.prompt}`);
  };

  window.selectMsChoiceV15=function(index){
    if(currentQuestionLockedV15) return;
    const question=currentQuestionsV15[currentQuestionIndexV15];
    const item=question?.choices?.[index];
    if(!item) return;
    const buttons=[...document.querySelectorAll("#msChoicesV15 .ms-choice-v15")];
    if(question.mode==="single"){
      currentSelectionsV15=[item.value];
      buttons.forEach((button,buttonIndex)=>button.classList.toggle("selected",buttonIndex===index));
    }else if(question.mode==="multi"){
      const existing=currentSelectionsV15.indexOf(item.value);
      if(existing>=0) currentSelectionsV15.splice(existing,1);
      else currentSelectionsV15.push(item.value);
      buttons[index]?.classList.toggle("selected",currentSelectionsV15.includes(item.value));
    }else if(question.mode==="order"){
      if(currentOrderV15.includes(item.value)) return;
      currentOrderV15.push(item.value);
      buttons[index]?.classList.add("selected");
      buttons[index].disabled=true;
      renderOrderAnswerV15();
    }
  };

  function renderOrderAnswerV15(){
    const box=document.getElementById("msOrderAnswerV15");
    if(!box) return;
    box.innerHTML=currentOrderV15.length
      ?currentOrderV15.map(value=>`<span class="ms-order-token-v15">${escapeV15(value)}</span>`).join("")
      :"Touche les éléments dans l’ordre.";
  }

  window.clearMsOrderV15=function(){
    if(currentQuestionLockedV15) return;
    currentOrderV15=[];
    document.querySelectorAll("#msChoicesV15 .ms-choice-v15").forEach(button=>{button.disabled=false;button.classList.remove("selected")});
    renderOrderAnswerV15();
  };

  function arraysEqualV15(a,b){
    return a.length===b.length&&a.every((value,index)=>String(value)===String(b[index]));
  }

  function setsEqualV15(a,b){
    return a.length===b.length&&a.every(value=>b.includes(value));
  }

  function selectedAnswerV15(question){
    if(question.mode==="order") return [...currentOrderV15];
    if(question.mode==="multi") return [...currentSelectionsV15].sort();
    return currentSelectionsV15[0]??"";
  }

  function correctAnswerV15(question){
    const answer=selectedAnswerV15(question);
    if(question.mode==="order") return arraysEqualV15(answer,question.answer);
    if(question.mode==="multi") return setsEqualV15(answer,[...question.answer].sort());
    return String(answer)===String(question.answer);
  }

  function recordMsMistakeV15(question,given){
    const ms=msStateV15();
    const signature=`${question.activityId}|${question.prompt}|${JSON.stringify(question.answer)}`;
    const existing=ms.mistakes.find(item=>item.signature===signature);
    const snapshot={
      signature,
      activityId:question.activityId,
      domain:question.domain,
      prompt:question.prompt,
      instruction:question.instruction,
      visual:question.visual,
      choices:question.choices,
      answer:question.answer,
      mode:question.mode,
      speech:question.speech,
      explanation:question.explanation,
      given:Array.isArray(given)?given.join(", "):String(given||"Aucune réponse"),
      count:Number(existing?.count||0)+1,
      at:Date.now()
    };
    if(existing) Object.assign(existing,snapshot);
    else ms.mistakes.unshift(snapshot);
    ms.mistakes=ms.mistakes.slice(0,80);
  }

  window.validateMsAnswerV15=function(){
    if(currentQuestionLockedV15) return;
    const question=currentQuestionsV15[currentQuestionIndexV15];
    if(!question) return;
    const answer=selectedAnswerV15(question);
    const empty=Array.isArray(answer)?answer.length===0:String(answer)==="";
    if(empty){
      const feedback=document.getElementById("msFeedbackV15");
      if(feedback){feedback.className="ms-feedback-v15 bad";feedback.textContent="Choisis d'abord une réponse 🙂";}
      return;
    }
    if(question.mode==="order"&&answer.length!==question.answer.length){
      const feedback=document.getElementById("msFeedbackV15");
      if(feedback){feedback.className="ms-feedback-v15 bad";feedback.textContent="Place tous les éléments avant de valider.";}
      return;
    }
    currentQuestionLockedV15=true;
    const correct=correctAnswerV15(question);
    const ms=msStateV15();
    ms.total=Number(ms.total||0)+1;
    if(correct){
      currentSeriesCorrectV15++;
      ms.correct=Number(ms.correct||0)+1;
      ms.xp=Number(ms.xp||0)+10;
      addMsDailyCorrectV15(1);
      if(correctionMistakeIndexV15!==null){
        ms.mistakes.splice(correctionMistakeIndexV15,1);
        ms.correctedMistakes=Number(ms.correctedMistakes||0)+1;
        ms.coins=Number(ms.coins||0)+1;
        correctionMistakeIndexV15=-1;
      }
    }else{
      currentSeriesErrorsV15++;
      recordMsMistakeV15(question,answer);
    }
    const feedback=document.getElementById("msFeedbackV15");
    if(feedback){
      feedback.className=`ms-feedback-v15 ${correct?"good":"bad"}`;
      feedback.innerHTML=correct
        ?"✓ Bravo, c'est la bonne réponse !"
        :`Presque ! La bonne réponse était <strong>${escapeV15(questionAnswerTextV15(question))}</strong>.`;
    }
    const buttons=[...document.querySelectorAll("#msChoicesV15 .ms-choice-v15")];
    buttons.forEach(button=>{
      const value=button.dataset.msValue;
      const isCorrect=Array.isArray(question.answer)?question.answer.map(String).includes(String(value)):String(value)===String(question.answer);
      const wasSelected=question.mode==="order"?currentOrderV15.includes(value):currentSelectionsV15.includes(value);
      if(isCorrect) button.classList.add("correct");
      else if(wasSelected) button.classList.add("wrong");
      button.disabled=true;
    });
    document.getElementById("msValidateButtonV15")?.classList.add("hidden");
    document.getElementById("msContinueButtonV15")?.classList.remove("hidden");
    saveV15();
    updateMsInterfaceV15();
    speakV15(correct?"Bravo, c'est la bonne réponse !":`La bonne réponse était ${questionAnswerTextV15(question)}.`);
  };

  window.continueMsQuestionV15=function(){
    if(correctionMistakeIndexV15!==null){
      if(correctionMistakeIndexV15===-1) return window.showMsMistakesV15();
      currentQuestionLockedV15=false;
      currentSelectionsV15=[];
      currentOrderV15=[];
      return renderCurrentQuestionV15();
    }
    currentQuestionIndexV15++;
    renderCurrentQuestionV15();
  };

  window.quitMsActivityV15=function(){
    const message=currentQuestionIndexV15>0?"Quitter cette série ? La série ne sera pas comptée.":"Quitter cette activité ?";
    if(window.confirm(message)) renderDomainV15(currentDomainV15);
  };

  function starsForPercentV15(percent){
    if(percent===100) return 3;
    if(percent>=80) return 2;
    if(percent>=60) return 1;
    return 0;
  }

  function finishMsSeriesV15(memoryResult=null){
    const ms=msStateV15();
    const total=memoryResult?.total??currentQuestionsV15.length;
    const correct=memoryResult?.correct??currentSeriesCorrectV15;
    const errors=memoryResult?.errors??currentSeriesErrorsV15;
    const percent=total?Math.round(correct/total*100):0;
    const stars=starsForPercentV15(percent);
    const coins=percent===100?5:percent>=80?3:percent>=60?2:1;
    const stat=activityStatV15(currentActivityV15.id);
    stat.plays=Number(stat.plays||0)+1;
    stat.best=Math.max(Number(stat.best||0),percent);
    stat.stars=Math.max(Number(stat.stars||0),stars);
    stat.correct=Number(stat.correct||0)+correct;
    stat.total=Number(stat.total||0)+total;
    stat.completed=true;
    stat.lastPlayedAt=Date.now();
    ms.seriesCompleted=Number(ms.seriesCompleted||0)+1;
    if(percent===100) ms.perfectSeries=Number(ms.perfectSeries||0)+1;
    ms.stars=Number(ms.stars||0)+stars;
    ms.coins=Number(ms.coins||0)+coins;
    ms.xp=Number(ms.xp||0)+15;
    ms.lastActivity={activityId:currentActivityV15.id,at:Date.now(),completed:true};
    ms.recent.unshift({activityId:currentActivityV15.id,title:currentActivityV15.title,domain:currentActivityV15.domain,percent,at:Date.now()});
    ms.recent=ms.recent.slice(0,20);
    saveV15();
    updateMsInterfaceV15();

    const screen=document.getElementById("msActivityScreenV15");
    const perfect=percent===100;
    screen.innerHTML=`<section class="ms-result-v15">
      <div class="ms-result-icon-v15">${perfect?"🏆":percent>=80?"🌟":percent>=60?"👏":"🌱"}</div>
      <small>Série terminée</small>
      <h2>${perfect?"Parfait !":percent>=80?"Très beau travail !":percent>=60?"Tu progresses !":"Continue à t'entraîner !"}</h2>
      <p>${escapeV15(currentActivityV15.title)} · ${escapeV15(domainInfoV15(currentActivityV15.domain).short)}</p>
      <div class="ms-result-stars-v15">${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</div>
      <div class="ms-result-stats-v15">
        <article><strong>${correct}/${total}</strong><span>bonnes réponses</span></article>
        <article><strong>${percent}%</strong><span>réussite</span></article>
        <article><strong>+${coins}</strong><span>pièces</span></article>
      </div>
      ${currentActivityV15.special==="memory"
        ?`<p>${memoryStateV15?.moves||0} mouvements pour retrouver les six paires.</p>`
        :errors?`<p>${errors} réponse${errors>1?"s":""} à revoir a été ajoutée au carnet.</p>`:"<p>Aucune erreur dans cette série. Bravo !</p>"}
      <div class="ms-activity-actions-v15">
        <button class="ms-main-action-v15" onclick="startMsActivityV15('${currentActivityV15.id}')">Rejouer</button>
        <button class="ms-secondary-action-v15" onclick="showMsDomainV15('${currentActivityV15.domain}')">Autres activités</button>
        ${errors&&currentActivityV15.special!=="memory"?'<button class="ms-secondary-action-v15" onclick="showMsMistakesV15()">Revoir mes erreurs</button>':""}
      </div>
    </section>`;
    showOnlyMsScreenV15("msActivityScreenV15");
    if(perfect){try{window.createConfetti?.()}catch{}}
    speakV15(perfect?"Parfait ! Tu as réussi toute la série.":`Série terminée. Tu as ${correct} bonnes réponses sur ${total}.`);
  }

  /* Memory */
  function startMemoryV15(){
    const symbols=shuffleV15(["🐱","🐶","🐰","🍎","🚗","⭐","🌸","🐟","🎈","🍓"]).slice(0,6);
    const cards=shuffleV15(symbols.flatMap((symbol,pair)=>[
      {id:`${pair}-a`,pair,symbol,revealed:false,matched:false},
      {id:`${pair}-b`,pair,symbol,revealed:false,matched:false}
    ]));
    memoryStateV15={cards,flipped:[],moves:0,matched:0,locked:false,startAt:Date.now()};
    renderMemoryV15(true);
  }

  function renderMemoryV15(shouldSpeak=false){
    const screen=document.getElementById("msActivityScreenV15");
    screen.dataset.gameSection="reading";
    screen.dataset.gameRoute="reading";
    screen.dataset.gameLabel="Memory — Moyenne Section";
    screen.innerHTML=`<section class="ms-activity-shell-v15">
      <header class="ms-activity-top-v15">
        <button onclick="quitMsActivityV15()">×</button>
        <div class="ms-activity-title-v15"><small>Logique · Moyenne Section</small><strong>Le memory</strong></div>
        <span class="ms-question-count-v15">${memoryStateV15.matched}/6 paires</span>
        <div class="ms-series-track-v15"><span style="width:${memoryStateV15.matched/6*100}%"></span></div>
      </header>
      <div class="ms-question-card-v15">
        <div class="ms-instruction-line-v15"><button onclick="speakV15Public('Retourne deux cartes et retrouve les paires identiques.')">🔊</button><span class="ms-instruction-v15">Retourne deux cartes et retrouve les paires identiques.</span></div>
        <h2 class="ms-prompt-v15">Où sont les deux mêmes images ?</h2>
        <div class="ms-memory-grid-v15">${memoryStateV15.cards.map((card,index)=>`<button class="ms-memory-card-v15 ${card.revealed?"revealed":""} ${card.matched?"matched":""}" onclick="flipMemoryCardV15(${index})">${card.symbol}</button>`).join("")}</div>
        <div id="msFeedbackV15" class="ms-feedback-v15">Mouvements : ${memoryStateV15.moves}</div>
      </div>
    </section>`;
    showOnlyMsScreenV15("msActivityScreenV15");
    if(shouldSpeak) autoSpeakV15("Retourne deux cartes et retrouve les paires identiques.");
  }

  window.flipMemoryCardV15=function(index){
    const memory=memoryStateV15;
    const card=memory?.cards?.[index];
    if(!memory||memory.locked||!card||card.revealed||card.matched) return;
    card.revealed=true;
    memory.flipped.push(index);
    renderMemoryV15(false);
    if(memory.flipped.length<2) return;
    memory.moves++;
    const [aIndex,bIndex]=memory.flipped;
    const a=memory.cards[aIndex],b=memory.cards[bIndex];
    memory.locked=true;
    if(a.pair===b.pair){
      a.matched=b.matched=true;
      memory.matched++;
      memory.flipped=[];
      memory.locked=false;
      if(memory.matched===6){
        const correct=memory.moves<=8?5:memory.moves<=11?4:3;
        const errors=5-correct;
        setTimeout(()=>finishMsSeriesV15({total:5,correct,errors}),550);
      }else setTimeout(()=>renderMemoryV15(false),350);
    }else{
      setTimeout(()=>{
        a.revealed=false;b.revealed=false;
        memory.flipped=[];memory.locked=false;
        renderMemoryV15(false);
      },750);
    }
  };

  window.speakV15Public=function(text){speakV15(text)};

  /* Progression et erreurs */
  const BADGES_V15=[
    {icon:"👋",title:"Première activité",text:"Terminer une série",test:()=>msStateV15().seriesCompleted>=1},
    {icon:"Aa",title:"Ami des lettres",text:"Maîtriser 5 activités de langage",test:()=>domainProgressV15("language").mastered>=5},
    {icon:"👏",title:"Roi des syllabes",text:"Maîtriser Les syllabes",test:()=>activityStatV15("count-syllables").best>=80},
    {icon:"🎵",title:"Oreille musicale",text:"Maîtriser les rimes",test:()=>activityStatV15("rhymes").best>=80},
    {icon:"🔢",title:"Ami des nombres",text:"Maîtriser 5 activités de maths",test:()=>domainProgressV15("math").mastered>=5},
    {icon:"⚖️",title:"Grand comparateur",text:"Maîtriser les comparaisons",test:()=>activityStatV15("compare-collections").best>=80},
    {icon:"🧩",title:"Petit détective",text:"Maîtriser 3 jeux de logique",test:()=>domainProgressV15("logic").mastered>=3},
    {icon:"💯",title:"Sans faute",text:"Réussir une série parfaite",test:()=>msStateV15().perfectSeries>=1},
    {icon:"↻",title:"Je corrige",text:"Corriger 5 erreurs",test:()=>msStateV15().correctedMistakes>=5},
    {icon:"🏆",title:"Champion de MS",text:"Maîtriser tout le programme",test:()=>overallProgressV15().mastered>=overallProgressV15().total}
  ];

  window.showMsProgressV15=function(){
    const screen=document.getElementById("msProgressScreenV15");
    const overall=overallProgressV15();
    const ms=msStateV15();
    screen.innerHTML=`
      <div class="ms-page-heading-v15"><button class="back-btn" onclick="showHome()">← Accueil</button><div><small>Moyenne Section</small><h2>Mon parcours</h2><p>Tout ce que tu as déjà découvert et maîtrisé.</p></div></div>
      <section class="ms-progress-hero-v15"><div><small>Progression générale</small><h2>${overall.mastered} activité${overall.mastered>1?"s":""} maîtrisée${overall.mastered>1?"s":""}</h2><p>Continue à jouer pour remplir toute ta carte de compétences.</p></div><div class="ms-progress-total-v15" style="--progress:${overall.percent}%"><div><strong>${overall.percent}%</strong><span>maîtrisé</span></div></div></section>
      <div class="ms-progress-domain-grid-v15">${["language","math","logic"].map(domain=>{
        const info=domainInfoV15(domain),progress=domainProgressV15(domain);
        return `<button class="ms-progress-domain-v15" onclick="showMsDomainV15('${domain}')"><span>${info.icon}</span><strong>${info.short}</strong><small>${progress.mastered}/${progress.total} maîtrisées · ⭐ ${progress.stars}</small></button>`;
      }).join("")}</div>
      <div class="ms-section-title-v15"><div><small>Mes récompenses</small><h3>Autocollants de Moyenne Section</h3></div><span>${BADGES_V15.filter(badge=>badge.test()).length}/${BADGES_V15.length}</span></div>
      <div class="ms-badge-grid-v15">${BADGES_V15.map(badge=>`<article class="ms-badge-v15 ${badge.test()?"":"locked"}"><span>${badge.icon}</span><strong>${escapeV15(badge.title)}</strong><small>${escapeV15(badge.text)}</small></article>`).join("")}</div>
      <div class="ms-section-title-v15"><div><small>Mes ressources MS</small><h3>Ce que tu as gagné</h3></div></div>
      <div class="ms-progress-domain-grid-v15"><article class="ms-progress-domain-v15"><span>⭐</span><strong>${ms.stars}</strong><small>étoiles de MS</small></article><article class="ms-progress-domain-v15"><span>🪙</span><strong>${ms.coins}</strong><small>pièces de MS</small></article><article class="ms-progress-domain-v15"><span>🏅</span><strong>${ms.seriesCompleted}</strong><small>séries terminées</small></article></div>`;
    showOnlyMsScreenV15("msProgressScreenV15");
  };

  window.showMsMistakesV15=function(){
    const screen=document.getElementById("msMistakesScreenV15");
    const mistakes=msStateV15().mistakes;
    screen.innerHTML=`
      <div class="ms-page-heading-v15"><button class="back-btn" onclick="showHome()">← Accueil</button><div><small>Moyenne Section</small><h2>Mon carnet à revoir</h2><p>Chaque erreur corrigée fait grandir ton cerveau.</p></div></div>
      <section class="ms-mistake-summary-v15"><span>↻</span><div><strong>${mistakes.length} erreur${mistakes.length>1?"s":""} à revoir</strong><p>Une bonne réponse retire l'erreur et rapporte une pièce.</p></div>${mistakes.length?'<button onclick="redoFirstMsMistakeV15()">Commencer</button>':""}</section>
      <div class="ms-mistake-list-v15">${mistakes.length?mistakes.map((mistake,index)=>{
        const activity=activityByIdV15(mistake.activityId);
        return `<article class="ms-mistake-card-v15"><span>${activity?.icon||"?"}</span><div><strong>${escapeV15(activity?.title||"Activité")}</strong><p>${escapeV15(mistake.prompt)}</p><small>Ta réponse : ${escapeV15(mistake.given)} · ${mistake.count>1?`${mistake.count} essais`:"1 essai"}</small></div><button onclick="redoMsMistakeV15(${index})">Corriger</button></article>`;
      }).join(""):'<section class="ms-empty-v15"><span>🌟</span><h3>Tout est corrigé !</h3><p>Ton carnet est vide. Bravo !</p></section>'}</div>`;
    showOnlyMsScreenV15("msMistakesScreenV15");
  };

  window.redoMsMistakeV15=function(index){
    const mistake=msStateV15().mistakes[index];
    if(!mistake) return window.showMsMistakesV15();
    const activity=activityByIdV15(mistake.activityId)||ACTIVITIES_V15[0];
    const question={...mistake,activityId:activity.id,domain:activity.domain};
    window.startMsActivityV15(activity.id,{question,correctionIndex:index});
  };
  window.redoFirstMsMistakeV15=function(){window.redoMsMistakeV15(0)};

  /* Choix de classe — V16.2 : sélecteur statique et indépendant */
  function ensureClassChoiceV15(){
    return document.getElementById("classChoiceOverlayV15");
  }

  function bindClassChoiceButtonsV15(){
    /* Les clics sont capturés par le sélecteur indépendant placé dans index.html. */
  }

  window.openClassChoiceV15=function(allowClose=true){
    if(typeof window.LumiKidsOpenClassSelectorV162==="function"){
      window.LumiKidsOpenClassSelectorV162(Boolean(allowClose));
      return;
    }
    const overlay=ensureClassChoiceV15();
    overlay?.classList.remove("hidden");
    document.body.classList.add("class-choice-open-v15");
  };

  window.closeClassChoiceV15=function(){
    if(!selectedClassV15()) return;
    const overlay=document.getElementById("classChoiceOverlayV15");
    overlay?.classList.add("hidden");
    if(overlay) overlay.style.display="";
    document.body.classList.remove("class-choice-open-v15");
  };

  window.classComingSoonV15=function(){};

  window.chooseSchoolLevelV15=function(level){
    if(typeof window.LumiKidsSelectClassV162==="function"){
      return window.LumiKidsSelectClassV162(level);
    }
    if(!CLASS_INFO[level]?.available) return;
    const state=ensureStateV15();
    if(!state) return;
    state.schoolLevelV15=level;
    try { localStorage.setItem(CLASS_KEY,level); } catch {}
    saveV15();
    window.location.reload();
  };

  function classLabelV15(){return classInfoV15().label}

  function ensureClassBadgeV15(){
    const identity=document.querySelector(".game-hud-identity-v14>div:first-child");
    if(identity&&!document.getElementById("gameClassBadgeV15")) identity.insertAdjacentHTML("beforeend",'<span id="gameClassBadgeV15" class="game-class-badge-v15"></span>');
  }

  function ensureProfileClassButtonV15(){
    const grid=document.querySelector("#gameProfileOverlayV14 .game-profile-grid-v14");
    if(!grid) return;
    if(!document.getElementById("gameProfileClassV15")){
      grid.insertAdjacentHTML("afterbegin",`<button id="gameProfileClassV15" class="game-profile-class-v15" onclick="closeGameProfileV14();showParentDashboard()"><span>🎓</span><strong id="gameProfileClassTitleV15">Classe</strong><small id="gameProfileClassTextV15">Choisir le niveau</small></button>`);
    }
    const storyButton=[...grid.querySelectorAll("button")].find(button=>button.textContent.includes("Grand Livre"));
    if(storyButton) storyButton.id="gameProfileStoryButtonV15";
  }

  function ensureParentClassUiV15(){
    const parent=document.getElementById("parentScreen");
    const profile=parent?.querySelector(".parent-profile");
    if(profile&&!document.getElementById("parentClassCardV15")){
      profile.insertAdjacentHTML("afterend",`<section id="parentClassCardV15" class="parent-class-card-v15"><span id="parentClassIconV15">🎓</span><div><strong id="parentClassTitleV15">Classe actuelle</strong><p id="parentClassDescriptionV15">Le contenu visible par l'enfant est adapté à ce niveau.</p></div><button onclick="openClassChoiceV15(true)">Changer la classe</button></section>`);
    }
    if(parent&&!document.getElementById("parentMsSummaryV15")){
      parent.insertAdjacentHTML("beforeend",`<section id="parentMsSummaryV15" class="parent-ms-summary-v15"><header><div><small>Programme Moyenne Section</small><h3>Progression MS</h3></div><span id="parentMsPercentV15">0 %</span></header><div class="parent-ms-grid-v15"><article><strong id="parentMsLanguageV15">0/9</strong><small>langage maîtrisé</small></article><article><strong id="parentMsMathV15">0/10</strong><small>maths maîtrisées</small></article><article><strong id="parentMsLogicV15">0/5</strong><small>logique maîtrisée</small></article><article><strong id="parentMsErrorsV15">0</strong><small>erreurs à revoir</small></article></div></section>`);
    }
  }

  function renderParentClassV15(){
    ensureParentClassUiV15();
    const info=classInfoV15();
    setTextV15("parentClassIconV15",info.icon);
    setTextV15("parentClassTitleV15",`Classe actuelle : ${info.label}`);
    setTextV15("parentClassDescriptionV15",isMsV15()?"Le jeu affiche le programme complet de Moyenne Section.":"Le jeu affiche l'aventure complète de Grande Section et début CP.");
    const overall=overallProgressV15();
    const language=domainProgressV15("language"),math=domainProgressV15("math"),logic=domainProgressV15("logic");
    setTextV15("parentMsPercentV15",`${overall.percent} %`);
    setTextV15("parentMsLanguageV15",`${language.mastered}/${language.total}`);
    setTextV15("parentMsMathV15",`${math.mastered}/${math.total}`);
    setTextV15("parentMsLogicV15",`${logic.mastered}/${logic.total}`);
    setTextV15("parentMsErrorsV15",msStateV15().mistakes.length);
    if(isMsV15()){
      const ms=msStateV15();
      const accuracy=ms.total?Math.round(Number(ms.correct||0)/Number(ms.total||1)*100):0;
      setTextV15("parentTotalStars",ms.stars);
      setTextV15("parentCorrect",ms.correct);
      setTextV15("parentQuestions",ms.total);
      setTextV15("parentLettersMastered",`${overall.mastered} / ${overall.total}`);
      setTextV15("parentAccuracy",`${accuracy}%`);
      setTextV15("parentEncouragement",accuracy>=85?"Excellent travail en Moyenne Section !":accuracy>=65?"Belle progression en Moyenne Section !":"Les activités à revoir aideront à progresser.");
      const accuracyBar=document.getElementById("parentAccuracyBar");
      if(accuracyBar) accuracyBar.style.width=`${accuracy}%`;
      setTextV15("parentExercisesV10",ms.seriesCompleted);
      setTextV15("parentCorrectedV10",ms.correctedMistakes);
      setTextV15("parentSoundsMasteredV10",language.mastered);
    }
  }

  function renderMsDailyHomeV15(){
    const daily=ensureMsDailyV15();
    const card=document.getElementById("dailyChallengeCard");
    if(!card) return;
    card.setAttribute("onclick","claimMsDailyV15()");
    setTextV15("dailyChallengeText","Réussis 10 questions de Moyenne Section");
    setTextV15("dailyChallengeStatus",daily.claimed?"Récompense récupérée":`${daily.correct}/${daily.target}`);
    setTextV15("dailyChallengeAction",daily.claimed?"Récupéré":daily.correct>=daily.target?"Récupérer":"En cours");
    setTextV15("dailyRewardBadge",daily.claimed?"✓":"🪙 5");
    const bar=document.getElementById("dailyChallengeBar");
    if(bar) bar.style.width=`${Math.min(100,daily.correct/daily.target*100)}%`;
    card.classList.toggle("claimable",!daily.claimed&&daily.correct>=daily.target);
    card.classList.toggle("claimed",daily.claimed);
  }

  window.claimMsDailyV15=function(){
    const daily=ensureMsDailyV15();
    if(daily.claimed) return window.showToast?.("Défi déjà récupéré aujourd'hui.");
    if(daily.correct<daily.target) return window.showToast?.(`Encore ${daily.target-daily.correct} bonne${daily.target-daily.correct>1?"s":""} réponse${daily.target-daily.correct>1?"s":""} !`);
    daily.claimed=true;
    msStateV15().coins=Number(msStateV15().coins||0)+5;
    saveV15();
    updateMsInterfaceV15();
    try{window.createConfetti?.()}catch{}
    window.showToast?.("Défi MS terminé : +5 pièces !");
  };

  function injectLogicHomeCardV15(){
    const grid=document.querySelector("#homeScreen .activity-grid-v3");
    if(!grid||document.getElementById("msHomeLogicV15")) return;
    const maths=grid.querySelector(".maths-v3");
    maths?.insertAdjacentHTML("afterend",`<button id="msHomeLogicV15" class="activity-v3 ms-home-logic-v15 hidden" onclick="showMsDomainV15('logic')"><span class="activity-symbol">🧩</span><span><small>Univers logique</small><strong>Logique et jeux</strong><em>Suites, intrus, classement et mémoire</em></span><b>→</b></button>`);
  }

  function setActivityCopyV15(selector,small,strong,em){
    const card=document.querySelector(selector);
    if(!card) return;
    const smallEl=card.querySelector("small"),strongEl=card.querySelector("strong"),emEl=card.querySelector("em");
    if(smallEl) smallEl.textContent=small;
    if(strongEl) strongEl.textContent=strong;
    if(emEl) emEl.textContent=em;
  }

  function renderHomeForClassV15(){
    injectLogicHomeCardV15();
    ensureClassBadgeV15();
    ensureProfileClassButtonV15();
    const info=classInfoV15();
    setTextV15("gameClassBadgeV15",`${info.icon} ${info.short}`);
    setTextV15("gameProfileClassTitleV15",info.label);
    setTextV15("gameProfileClassTextV15","Modifier depuis l'espace Parents");
    const logic=document.getElementById("msHomeLogicV15");
    logic?.classList.toggle("hidden",!isMsV15());
    const story=document.getElementById("storyBookButton");
    const profileStory=document.getElementById("gameProfileStoryButtonV15");
    if(isMsV15()){
      story?.classList.add("hidden");
      profileStory?.classList.add("hidden");
    }else{
      profileStory?.classList.remove("hidden");
    }
    document.querySelectorAll('[data-game-route="map"] small').forEach(element=>element.textContent=isMsV15()?"Parcours":"Carte");
    document.querySelectorAll('[data-game-route="errors"] small').forEach(element=>element.textContent=isMsV15()?"À revoir":"Erreurs");
    document.querySelectorAll('[data-game-route="rewards"] small').forEach(element=>element.textContent=isMsV15()?"Progrès":"Récompenses");

    const hero=document.querySelector("#homeScreen .hero-copy");
    if(isMsV15()){
      document.body.classList.add("class-ms-v15");
      document.body.classList.remove("class-gs-cp-v15");
      if(hero){
        const h2=hero.querySelector("h2"),p=hero.querySelector(":scope>p:not(.eyebrow):not(.resume-hint-v10)");
        if(h2) h2.innerHTML="Prêt pour une nouvelle<br>journée de Moyenne Section ?";
        if(p) p.textContent="Joue avec les lettres, les nombres, les formes et la logique.";
      }
      setActivityCopyV15(".reading-v3","Langage et sons","Langage","Lettres, mots, syllabes et rimes");
      setActivityCopyV15(".maths-v3","Nombres et formes","Nombres","Compter, comparer et résoudre de petits problèmes");
      setActivityCopyV15(".rewards-v3","Ma progression MS","Autocollants","Voir les activités maîtrisées");
      setActivityCopyV15(".mistakes-v3","Mon carnet","À revoir","Corriger mes réponses de Moyenne Section");
      setActivityCopyV15(".world-map-v3","Mon programme","Parcours MS","Voir toutes les compétences");
      setTextV15("resumeHintV10",msStateV15().lastActivity?"Reprends ta dernière activité de Moyenne Section.":"Choisis une première activité de Moyenne Section.");
      const mistakeCount=msStateV15().mistakes.length;
      setTextV15("homeMistakeCount",`${mistakeCount} erreur${mistakeCount>1?"s":""}`);
      setTextV15("dailyMilestoneV10","Objectif conseillé : 10 à 15 minutes");
      renderMsDailyHomeV15();
    }else{
      document.body.classList.remove("class-ms-v15");
      document.body.classList.add("class-gs-cp-v15");
      if(hero){
        const h2=hero.querySelector("h2"),p=hero.querySelector(":scope>p:not(.eyebrow):not(.resume-hint-v10)");
        if(h2) h2.innerHTML="Prêt à apprendre<br>en t’amusant ?";
        if(p) p.textContent="Choisis une activité, gagne des étoiles et progresse de niveau.";
      }
      setActivityCopyV15(".reading-v3","Univers lecture","Lecture","Lettres, sons, syllabes et mots");
      setActivityCopyV15(".maths-v3","Univers maths","Calculs","Additions, soustractions et problèmes");
      setActivityCopyV15(".rewards-v3","Ma collection","Récompenses","Succès, trophées et trésors");
      setActivityCopyV15(".mistakes-v3","Je progresse","Refaire mes erreurs","Corriger les réponses difficiles");
      setActivityCopyV15(".world-map-v3","Mon aventure","Carte des royaumes","Voir toute ma progression");
      const card=document.getElementById("dailyChallengeCard");
      card?.setAttribute("onclick","claimDailyChallenge()");
      try{window.renderDailyChallenge?.()}catch{}
      try{window.updateStoryBookButton?.()}catch{}
    }
    updateMsHudV15();
  }

  function updateMsHudV15(){
    ensureClassBadgeV15();
    const info=classInfoV15();
    setTextV15("gameClassBadgeV15",`${info.icon} ${info.short}`);
    if(!isMsV15()) return;
    const ms=msStateV15();
    const level=msLevelV15();
    setTextV15("globalStars",ms.stars);
    setTextV15("globalCoins",ms.coins);
    setTextV15("homeLevel",level);
    setTextV15("homeXpText",`${ms.xp%100} / 100 XP`);
    setTextV15("homeProgressPercent",`${ms.xp%100}%`);
    const homeBar=document.getElementById("homeXpBar");if(homeBar)homeBar.style.width=`${ms.xp%100}%`;
    setTextV15("gameHudLevelV14",level);
    const hudBar=document.getElementById("gameHudXpFillV14");if(hudBar)hudBar.style.width=`${ms.xp%100}%`;
  }

  function updateMsInterfaceV15(){
    renderHomeForClassV15();
    renderParentClassV15();
  }

  function applyClassModeV15(){
    const selected=selectedClassV15();
    document.body.dataset.schoolLevel=selected||"unselected";
    document.body.classList.toggle("class-ms-v15",selected==="ms");
    document.body.classList.toggle("class-gs-cp-v15",selected==="gs-cp");
    updateMsInterfaceV15();
  }

  function installWrappersV15(){
    originalsV15={
      hideAllScreens:window.hideAllScreens,
      showHome:window.showHome,
      showReadingHome:window.showReadingHome,
      showMath:window.showMath,
      showRewards:window.showRewards,
      showMistakeReview:window.showMistakeReview,
      showWorldMap:window.showWorldMap,
      showParentDashboard:window.showParentDashboard,
      continueLearning:window.continueLearning,
      updateGameUi:window.updateGameUi
    };

    window.hideAllScreens=function(...args){
      const result=typeof originalsV15.hideAllScreens==="function"?originalsV15.hideAllScreens.apply(this,args):undefined;
      hideMsScreensV15();
      return result;
    };

    window.showHome=function(...args){
      const result=typeof originalsV15.showHome==="function"?originalsV15.showHome.apply(this,args):undefined;
      renderHomeForClassV15();
      return result;
    };

    window.showReadingHome=function(...args){
      if(isMsV15()) return renderDomainV15("language");
      return originalsV15.showReadingHome?.apply(this,args);
    };

    window.showMath=function(...args){
      if(isMsV15()) return renderDomainV15("math");
      return originalsV15.showMath?.apply(this,args);
    };

    window.showRewards=function(...args){
      if(isMsV15()) return window.showMsProgressV15();
      return originalsV15.showRewards?.apply(this,args);
    };

    window.showMistakeReview=function(...args){
      if(isMsV15()) return window.showMsMistakesV15();
      return originalsV15.showMistakeReview?.apply(this,args);
    };

    window.showWorldMap=function(...args){
      if(isMsV15()) return window.showMsProgressV15();
      return originalsV15.showWorldMap?.apply(this,args);
    };

    window.showParentDashboard=function(...args){
      const result=originalsV15.showParentDashboard?.apply(this,args);
      setTimeout(renderParentClassV15,30);
      return result;
    };

    window.continueLearning=function(...args){
      if(isMsV15()){
        const last=msStateV15().lastActivity;
        if(last?.activityId&&activityByIdV15(last.activityId)) return window.startMsActivityV15(last.activityId);
        return renderDomainV15("language");
      }
      return originalsV15.continueLearning?.apply(this,args);
    };

    window.updateGameUi=function(...args){
      const result=originalsV15.updateGameUi?.apply(this,args);
      updateMsInterfaceV15();
      return result;
    };
    try{updateGameUi=window.updateGameUi}catch{}
  }

  function initV15(){
    ensureStateV15();
    ensureScreensV15();
    ensureClassChoiceV15();
    injectLogicHomeCardV15();
    ensureClassBadgeV15();
    ensureProfileClassButtonV15();
    ensureParentClassUiV15();
    installWrappersV15();
    applyClassModeV15();
    if(!selectedClassV15()) setTimeout(()=>openClassChoiceV15(false),250);
    else renderHomeForClassV15();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initV15,{once:true});
  else initV15();

  window.LumiClassesV15={
    get selected(){return selectedClassV15()},
    get msProgress(){return msStateV15()},
    activities:ACTIVITIES_V15,
    openSelector:window.openClassChoiceV15,
    showDomain:window.showMsDomainV15,
    generateQuestion(activityId){const activity=activityByIdV15(activityId);return activity?.special?{special:activity.special}:activity?.generator(activity)},
    generateSeries(activityId){const activity=activityByIdV15(activityId);return activity?buildSeriesV15(activity):[]}
  };
})();
