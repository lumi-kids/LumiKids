/* =========================================================
   LUMIKIDS V17 — PETITE SECTION FINALISÉE
   Module chargé après script-ms.js.
========================================================= */
(function installLumiKidsPsV16(){
  "use strict";
  if(window.__lumikidsPsV16Installed) return;
  window.__lumikidsPsV16Installed=true;

  const CLASS_KEY="lumikids-school-level-v15";
  const PS_SERIES_LENGTH=4;
  const MASTERED_SCORE=75;

  let originalsV16={};
  let currentDomainV16="language";
  let currentActivityV16=null;
  let currentQuestionsV16=[];
  let currentQuestionIndexV16=0;
  let currentSeriesCorrectV16=0;
  let currentSeriesErrorsV16=0;
  let currentSelectionsV16=[];
  let currentOrderV16=[];
  let currentQuestionLockedV16=false;
  let correctionMistakeIndexV16=null;
  let memoryStateV16=null;
  let autoReadTimerV16=0;

  const ANIMALS_V16=[
    {name:"chat",icon:"🐱"},{name:"chien",icon:"🐶"},{name:"lapin",icon:"🐰"},
    {name:"vache",icon:"🐮"},{name:"cochon",icon:"🐷"},{name:"mouton",icon:"🐑"},
    {name:"poule",icon:"🐔"},{name:"canard",icon:"🦆"},{name:"poisson",icon:"🐟"},
    {name:"papillon",icon:"🦋"},{name:"abeille",icon:"🐝"},{name:"escargot",icon:"🐌"}
  ];
  const FOODS_V16=[
    {name:"pomme",icon:"🍎"},{name:"banane",icon:"🍌"},{name:"fraise",icon:"🍓"},
    {name:"carotte",icon:"🥕"},{name:"tomate",icon:"🍅"},{name:"pain",icon:"🍞"},
    {name:"fromage",icon:"🧀"},{name:"œuf",icon:"🥚"},{name:"gâteau",icon:"🎂"}
  ];
  const CLOTHES_V16=[
    {name:"tee-shirt",icon:"👕"},{name:"pantalon",icon:"👖"},{name:"robe",icon:"👗"},
    {name:"chaussette",icon:"🧦"},{name:"chaussure",icon:"👟"},{name:"chapeau",icon:"🧢"},
    {name:"manteau",icon:"🧥"},{name:"écharpe",icon:"🧣"}
  ];
  const HOUSE_V16=[
    {name:"lit",icon:"🛏️"},{name:"chaise",icon:"🪑"},{name:"lampe",icon:"💡"},
    {name:"clé",icon:"🔑"},{name:"savon",icon:"🧼"},{name:"brosse à dents",icon:"🪥"},
    {name:"cuillère",icon:"🥄"},{name:"télévision",icon:"📺"}
  ];
  const SCHOOL_V16=[
    {name:"crayon",icon:"✏️"},{name:"livre",icon:"📘"},{name:"cartable",icon:"🎒"},
    {name:"ciseaux",icon:"✂️"},{name:"colle",icon:"🧴"},{name:"règle",icon:"📏"},
    {name:"peinture",icon:"🎨"},{name:"puzzle",icon:"🧩"}
  ];
  const BODY_V16=[
    {name:"main",icon:"✋"},{name:"pied",icon:"🦶"},{name:"œil",icon:"👁️"},
    {name:"oreille",icon:"👂"},{name:"nez",icon:"👃"},{name:"bouche",icon:"👄"},
    {name:"bras",icon:"💪"},{name:"tête",icon:"🙂"}
  ];
  const ACTIONS_V16=[
    {name:"courir",icon:"🏃"},{name:"dormir",icon:"😴"},{name:"manger",icon:"😋"},
    {name:"boire",icon:"🥤"},{name:"lire",icon:"📖"},{name:"dessiner",icon:"🖍️"},
    {name:"danser",icon:"💃"},{name:"se laver",icon:"🧼"}
  ];
  const COLORS_V16=[
    {name:"rouge",symbol:"🔴",hex:"#ef6a67"},{name:"bleu",symbol:"🔵",hex:"#5b8de3"},
    {name:"jaune",symbol:"🟡",hex:"#f1c84e"},{name:"vert",symbol:"🟢",hex:"#55b978"},
    {name:"violet",symbol:"🟣",hex:"#8b6bc9"},{name:"orange",symbol:"🟠",hex:"#ef9a4d"}
  ];
  const SHAPES_V16=[
    {name:"rond",symbol:"●"},{name:"carré",symbol:"■"},{name:"triangle",symbol:"▲"}
  ];
  const SIMPLE_ICONS_V16=["⭐","🍎","🐟","🚗","🌸","🎈","🟣","🧸"];

  function escapeV16(value){
    return String(value??"")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }
  function randomV16(min,max){return Math.floor(Math.random()*(max-min+1))+min}
  function pickV16(array){return array[Math.floor(Math.random()*array.length)]}
  function shuffleV16(array){
    const result=[...array];
    for(let i=result.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }
  function uniqueV16(array){return [...new Set(array)]}
  function choiceV16(value,label,extra={}){return {value:String(value),label:String(label),...extra}}
  function stateV16(){
    try{return typeof gameState!=="undefined"?gameState:null}catch{return null}
  }
  function saveV16(){
    try{window.saveGameState?.()}
    catch{try{localStorage.setItem("lumikids-state",JSON.stringify(stateV16()))}catch{}}
  }
  function todayV16(){
    const d=new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  }
  function defaultPsProgressV16(){
    return {
      xp:0,stickers:0,coins:0,correct:0,total:0,seriesCompleted:0,perfectSeries:0,
      correctedMistakes:0,activities:{},mistakes:[],lastActivity:null,recent:[],
      daily:{date:"",correct:0,target:6,claimed:false},createdAt:Date.now()
    };
  }
  function ensureStateV16(){
    const state=stateV16();
    if(!state) return null;
    if(!state.classProfilesV15) state.classProfilesV15={};
    if(!state.classProfilesV15.ps) state.classProfilesV15.ps=defaultPsProgressV16();
    const ps=state.classProfilesV15.ps;
    const defaults=defaultPsProgressV16();
    Object.keys(defaults).forEach(key=>{if(ps[key]===undefined||ps[key]===null) ps[key]=defaults[key]});
    if(!ps.activities) ps.activities={};
    if(!Array.isArray(ps.mistakes)) ps.mistakes=[];
    if(!Array.isArray(ps.recent)) ps.recent=[];
    if(!ps.daily) ps.daily=defaults.daily;
    return state;
  }
  function psStateV16(){return ensureStateV16()?.classProfilesV15?.ps||defaultPsProgressV16()}
  function selectedClassV16(){
    const state=ensureStateV16();
    if(state?.schoolLevelV15) return state.schoolLevelV15;
    try{return localStorage.getItem(CLASS_KEY)||""}catch{return ""}
  }
  function isPsV16(){return selectedClassV16()==="ps"}
  function setTextV16(id,value){const element=document.getElementById(id);if(element) element.textContent=String(value)}
  function speakV16(text){
    clearTimeout(autoReadTimerV16);
    if(!text) return;
    try{
      if(window.LumiVoiceV17?.speak?.(String(text),"ps")) return;
      if(typeof window.speak==="function") return window.speak(String(text));
      if("speechSynthesis" in window){
        speechSynthesis.cancel();
        const utterance=new SpeechSynthesisUtterance(String(text));
        utterance.lang="fr-FR";
        utterance.rate=.70;
        utterance.pitch=1.08;
        speechSynthesis.speak(utterance);
      }
    }catch{}
  }
  function autoSpeakV16(text){
    clearTimeout(autoReadTimerV16);
    autoReadTimerV16=setTimeout(()=>speakV16(text),420);
  }
  function psLevelV16(){return Math.floor(Number(psStateV16().xp||0)/80)+1}
  function ensurePsDailyV16(){
    const ps=psStateV16(),today=todayV16();
    if(ps.daily.date!==today){ps.daily={date:today,correct:0,target:6,claimed:false};saveV16()}
    return ps.daily;
  }
  function addPsDailyCorrectV16(amount=1){
    const daily=ensurePsDailyV16();
    if(!daily.claimed) daily.correct=Math.min(daily.target,Number(daily.correct||0)+amount);
  }
  function activityStatV16(id){
    const ps=psStateV16();
    if(!ps.activities[id]) ps.activities[id]={plays:0,best:0,stars:0,correct:0,total:0,completed:false,lastPlayedAt:0};
    return ps.activities[id];
  }
  function domainActivitiesV16(domain){return ACTIVITIES_V16.filter(activity=>activity.domain===domain)}
  function domainProgressV16(domain){
    const list=domainActivitiesV16(domain);
    const completed=list.filter(activity=>activityStatV16(activity.id).completed).length;
    const mastered=list.filter(activity=>activityStatV16(activity.id).best>=MASTERED_SCORE).length;
    const stars=list.reduce((sum,activity)=>sum+Number(activityStatV16(activity.id).stars||0),0);
    return {total:list.length,completed,mastered,stars};
  }
  function overallProgressV16(){
    const total=ACTIVITIES_V16.length;
    const completed=ACTIVITIES_V16.filter(activity=>activityStatV16(activity.id).completed).length;
    const mastered=ACTIVITIES_V16.filter(activity=>activityStatV16(activity.id).best>=MASTERED_SCORE).length;
    return {total,completed,mastered,percent:total?Math.round(mastered/total*100):0};
  }
  function choicesWithAnswerV16(answer,pool,count=3){
    const candidates=shuffleV16(uniqueV16(pool.filter(value=>String(value)!==String(answer))));
    return shuffleV16([String(answer),...candidates.slice(0,count-1)]);
  }
  function objectRowV16(icon,count){
    return `<div class="ps-object-row-v16">${Array.from({length:count},()=>`<span>${icon}</span>`).join("")}</div>`;
  }
  function makeSingleV16(activity,prompt,instruction,visual,choices,answer,speech,explanation=""){
    return {activityId:activity.id,domain:activity.domain,mode:"single",prompt,instruction,visual,choices,answer:String(answer),speech:speech||`${instruction} ${prompt}`,explanation};
  }
  function makeOrderV16(activity,prompt,instruction,visual,choices,answers,speech,explanation=""){
    return {activityId:activity.id,domain:activity.domain,mode:"order",prompt,instruction,visual,choices,answer:answers.map(String),speech:speech||`${instruction} ${prompt}`,explanation};
  }
  function heardPictureQuestionV16(activity,pool,category){
    const target=pickV16(pool);
    const choices=shuffleV16([target,...shuffleV16(pool.filter(item=>item.name!==target.name)).slice(0,2)]);
    return makeSingleV16(
      activity,"Touche la bonne image.","Écoute le mot puis regarde les images.",
      `<div class="ps-big-listen-v16">🔊</div>`,
      choices.map(item=>choiceV16(item.name,item.icon,{small:item.name})),target.name,
      `Écoute. ${target.name}. Touche l'image qui montre : ${target.name}.`,category
    );
  }

  const ACTIVITIES_V16=[
    /* Langage et vocabulaire */
    {id:"ps-animals",domain:"language",icon:"🐱",title:"Les animaux",description:"Écouter et reconnaître les animaux.",color:"#ef8b63",soft:"#fff0e8",generator(activity){return heardPictureQuestionV16(activity,ANIMALS_V16,"animaux")}},
    {id:"ps-foods",domain:"language",icon:"🍎",title:"À table !",description:"Reconnaître les aliments du quotidien.",color:"#e96f72",soft:"#ffebeb",generator(activity){return heardPictureQuestionV16(activity,FOODS_V16,"aliments")}},
    {id:"ps-clothes",domain:"language",icon:"👕",title:"Je m'habille",description:"Retrouver les vêtements entendus.",color:"#8b74d7",soft:"#f0edff",generator(activity){return heardPictureQuestionV16(activity,CLOTHES_V16,"vêtements")}},
    {id:"ps-house",domain:"language",icon:"🏠",title:"Dans la maison",description:"Nommer les objets de la maison.",color:"#d28c4d",soft:"#fff1df",generator(activity){return heardPictureQuestionV16(activity,HOUSE_V16,"maison")}},
    {id:"ps-school",domain:"language",icon:"🎒",title:"À l'école",description:"Reconnaître les objets de la classe.",color:"#5b8fe0",soft:"#eaf1ff",generator(activity){return heardPictureQuestionV16(activity,SCHOOL_V16,"école")}},
    {id:"ps-body",domain:"language",icon:"✋",title:"Mon corps",description:"Retrouver les parties du corps.",color:"#e581ab",soft:"#ffeaf2",generator(activity){return heardPictureQuestionV16(activity,BODY_V16,"corps")}},
    {id:"ps-actions",domain:"language",icon:"🏃",title:"Que fait-il ?",description:"Comprendre des verbes d'action simples.",color:"#55aa83",soft:"#e9f8ef",generator(activity){return heardPictureQuestionV16(activity,ACTIONS_V16,"actions")}},
    {id:"ps-same-picture",domain:"language",icon:"👀",title:"Les images jumelles",description:"Retrouver deux images exactement identiques.",color:"#55a8bd",soft:"#e7f8fb",generator(activity){
      const target=pickV16([...ANIMALS_V16,...FOODS_V16,...SCHOOL_V16]);
      const pool=[...ANIMALS_V16,...FOODS_V16,...SCHOOL_V16].filter(item=>item.name!==target.name);
      const choices=shuffleV16([target,...shuffleV16(pool).slice(0,2)]);
      return makeSingleV16(activity,"Touche exactement la même image.","Regarde bien le modèle.",`<div class="ps-model-v16">${target.icon}</div>`,choices.map(item=>choiceV16(item.name,item.icon)),target.name,"Regarde le modèle. Touche exactement la même image.");
    }},
    {id:"ps-my-name",domain:"language",icon:"👤",title:"Mon prénom",description:"Reconnaître son prénom parmi trois choix.",color:"#ef9b6d",soft:"#fff0e8",generator(activity){
      const own=String(stateV16()?.childName||"Champion").trim()||"Champion";
      const pool=["Lila","Noa","Sami","Milo","Zoé","Lina","Pico","Aurore"].filter(name=>name.toLowerCase()!==own.toLowerCase());
      const values=shuffleV16([own,...shuffleV16(pool).slice(0,2)]);
      return makeSingleV16(activity,"Touche ton prénom.","Regarde les trois étiquettes.",`<div class="ps-model-v16">👋</div>`,values.map(value=>choiceV16(value,value)),own,`Ton prénom est ${own}. Touche ton prénom.`);
    }},
    {id:"ps-colors",domain:"language",icon:"🌈",title:"Les couleurs",description:"Écouter et reconnaître les couleurs.",color:"#b66ac4",soft:"#f7eafa",generator(activity){
      const target=pickV16(COLORS_V16);
      const choices=shuffleV16([target,...shuffleV16(COLORS_V16.filter(item=>item.name!==target.name)).slice(0,2)]);
      return makeSingleV16(activity,`Touche le rond ${target.name}.`,`Écoute le nom de la couleur.`,`<div class="ps-big-listen-v16">🌈</div>`,choices.map(item=>choiceV16(item.name,`<span class="ps-color-disc-v16" style="--ps-color:${item.hex}"></span>`,{html:true,small:item.name})),target.name,`Touche le rond ${target.name}.`);
    }},

    {id:"ps-find-family",domain:"language",icon:"🧺",title:"La bonne famille",description:"Retrouver un animal, un aliment ou un vêtement.",color:"#58a582",soft:"#e7f8ee",generator(activity){
      const families=[{name:"animal",items:ANIMALS_V16},{name:"aliment",items:FOODS_V16},{name:"vêtement",items:CLOTHES_V16}];
      const family=pickV16(families),target=pickV16(family.items);
      const others=families.filter(item=>item.name!==family.name).map(item=>pickV16(item.items));
      const choices=shuffleV16([target,...others]);
      return makeSingleV16(activity,`Touche ${family.name==="animal"?"l'animal":family.name==="aliment"?"l'aliment":"le vêtement"}.`,`Regarde les trois images.`,`<div class="ps-model-v16">🧺</div>`,choices.map(item=>choiceV16(item.name,item.icon,{small:item.name})),target.name,`Touche ${family.name==="animal"?"l'animal":family.name==="aliment"?"l'aliment":"le vêtement"}.`);
    }},
    {id:"ps-two-instructions",domain:"language",icon:"1️⃣2️⃣",title:"Deux petites consignes",description:"Écouter puis toucher deux images dans le bon ordre.",color:"#6a86d8",soft:"#edf1ff",generator(activity){
      const pool=shuffleV16([...ANIMALS_V16,...FOODS_V16,...SCHOOL_V16]).slice(0,3);
      const first=pool[0],second=pool[1];
      return makeOrderV16(activity,`D'abord ${first.name}, puis ${second.name}.`,`Écoute les deux consignes.`,`<div class="ps-big-listen-v16">👂</div>`,shuffleV16(pool).map(item=>choiceV16(item.name,item.icon,{small:item.name})),[first.name,second.name],`Touche d'abord ${first.name}, puis ${second.name}.`);
    }},

    /* Premiers nombres, grandeurs et espace */
    {id:"ps-count-three",domain:"math",icon:"3⭐",title:"Je compte jusqu'à 3",description:"Compter de très petites collections.",color:"#5b8fe0",soft:"#eaf1ff",generator(activity){
      const count=randomV16(1,3),icon=pickV16(SIMPLE_ICONS_V16);
      return makeSingleV16(activity,"Combien y en a-t-il ?","Touche chaque image avec ton doigt.",objectRowV16(icon,count),[1,2,3].map(value=>choiceV16(value,value)),count,"Compte les images. Combien y en a-t-il ?");
    }},
    {id:"ps-count-five",domain:"math",icon:"5🍎",title:"Je compte jusqu'à 5",description:"Compter des collections jusqu'à cinq.",color:"#4f9ebc",soft:"#e7f7fb",generator(activity){
      const count=randomV16(1,5),icon=pickV16(SIMPLE_ICONS_V16);
      const values=choicesWithAnswerV16(count,[1,2,3,4,5],3);
      return makeSingleV16(activity,"Combien y en a-t-il ?","Compte doucement les images.",objectRowV16(icon,count),values.map(value=>choiceV16(value,value)),count,`Compte les images. Combien y en a-t-il ?`);
    }},
    {id:"ps-hear-quantity",domain:"math",icon:"🔊",title:"La quantité entendue",description:"Montrer une quantité demandée de 1 à 5.",color:"#6f86d8",soft:"#edf0ff",generator(activity){
      const target=randomV16(1,5),icon=pickV16(SIMPLE_ICONS_V16);
      const counts=choicesWithAnswerV16(target,[1,2,3,4,5],3).map(Number);
      return makeSingleV16(activity,`Où vois-tu ${target} objets ?`,`Écoute le nombre puis compte.`,`<div class="ps-big-listen-v16">🔊</div>`,counts.map(count=>choiceV16(count,objectRowV16(icon,count),{html:true})),target,`Montre ${target} objets. Où vois-tu ${target} objets ?`);
    }},
    {id:"ps-same-quantity",domain:"math",icon:"＝",title:"Autant d'objets",description:"Associer deux collections de même quantité.",color:"#55aa83",soft:"#e9f8ef",generator(activity){
      const target=randomV16(1,5),modelIcon=pickV16(SIMPLE_ICONS_V16),choiceIcon=pickV16(SIMPLE_ICONS_V16.filter(icon=>icon!==modelIcon));
      const counts=choicesWithAnswerV16(target,[1,2,3,4,5],3).map(Number);
      return makeSingleV16(activity,"Trouve la collection qui en a autant.","Compte le modèle puis les réponses.",objectRowV16(modelIcon,target),counts.map(count=>choiceV16(count,objectRowV16(choiceIcon,count),{html:true})),target,"Trouve la collection qui a le même nombre d'objets.");
    }},
    {id:"ps-complete-three",domain:"math",icon:"＋",title:"Complète jusqu'à 3",description:"Ajouter ce qui manque pour obtenir trois.",color:"#e69a4d",soft:"#fff1df",generator(activity){
      const current=randomV16(1,2),missing=3-current,icon=pickV16(SIMPLE_ICONS_V16);
      return makeSingleV16(activity,"Combien faut-il ajouter pour en avoir 3 ?","Regarde ce qui est déjà là.",`${objectRowV16(icon,current)}<div class="ps-target-badge-v16">Objectif : 3</div>`,[1,2,3].map(value=>choiceV16(value,value)),missing,`Il y en a ${current}. Combien faut-il ajouter pour en avoir trois ?`);
    }},
    {id:"ps-many-few",domain:"math",icon:"⚖️",title:"Beaucoup ou peu",description:"Comparer deux collections très différentes.",color:"#e27c75",soft:"#ffebeb",generator(activity){
      const askMany=Math.random()>.5,icon=pickV16(SIMPLE_ICONS_V16),few=randomV16(1,2),many=randomV16(4,5);
      const options=shuffleV16([{value:"few",count:few},{value:"many",count:many}]);
      return makeSingleV16(activity,askMany?"Où y en a-t-il beaucoup ?":"Où y en a-t-il peu ?","Regarde les deux collections.",`<div class="ps-model-v16">${askMany?"🙌":"🤏"}</div>`,options.map(item=>choiceV16(item.value,objectRowV16(icon,item.count),{html:true})),askMany?"many":"few",askMany?"Touche la collection où il y en a beaucoup.":"Touche la collection où il y en a peu.");
    }},
    {id:"ps-big-small",domain:"math",icon:"🐘",title:"Grand ou petit",description:"Comparer la taille de deux objets.",color:"#8a73d6",soft:"#f0edff",generator(activity){
      const askBig=Math.random()>.5,icon=pickV16(["🐘","🐻","🚗","⭐","🍎"]);
      const options=shuffleV16([{value:"small",size:42},{value:"big",size:92}]);
      return makeSingleV16(activity,askBig?"Touche le grand.":"Touche le petit.","Compare les deux tailles.",`<div class="ps-model-v16">${askBig?"GRAND":"petit"}</div>`,options.map(item=>choiceV16(item.value,`<span class="ps-sized-icon-v16" style="font-size:${item.size}px">${icon}</span>`,{html:true})),askBig?"big":"small",askBig?"Touche le grand objet.":"Touche le petit objet.");
    }},
    {id:"ps-long-short",domain:"math",icon:"📏",title:"Long ou court",description:"Comparer deux longueurs visibles.",color:"#4fa4a2",soft:"#e7f8f6",generator(activity){
      const askLong=Math.random()>.5;
      const options=shuffleV16([{value:"short",width:68},{value:"long",width:170}]);
      return makeSingleV16(activity,askLong?"Touche ce qui est long.":"Touche ce qui est court.","Compare les deux bandes.",`<div class="ps-model-v16">📏</div>`,options.map(item=>choiceV16(item.value,`<span class="ps-length-bar-v16" style="width:${item.width}px"></span>`,{html:true})),askLong?"long":"short",askLong?"Touche la longue bande.":"Touche la courte bande.");
    }},
    {id:"ps-shapes",domain:"math",icon:"▲",title:"Les formes",description:"Reconnaître rond, carré et triangle.",color:"#df8e4d",soft:"#fff0df",generator(activity){
      const target=pickV16(SHAPES_V16);
      return makeSingleV16(activity,`Touche le ${target.name}.`,`Regarde la forme demandée.`,`<div class="ps-big-listen-v16">${target.symbol}</div>`,shuffleV16(SHAPES_V16).map(item=>choiceV16(item.name,`<span class="ps-shape-symbol-v16">${item.symbol}</span>`,{html:true,small:item.name})),target.name,`Touche le ${target.name}.`);
    }},
    {id:"ps-position",domain:"math",icon:"📦",title:"Où est l'ourson ?",description:"Comprendre dedans, dehors, dessus et dessous.",color:"#5d88d6",soft:"#eaf1ff",generator(activity){
      const positions=[
        {value:"dedans",phrase:"dans",label:'<span class="ps-position-scene-v16"><b>📦</b><i class="inside">🧸</i></span>'},
        {value:"dehors",phrase:"à côté de",label:'<span class="ps-position-scene-v16"><b>📦</b><i class="outside">🧸</i></span>'},
        {value:"dessus",phrase:"sur",label:'<span class="ps-position-scene-v16"><b>📦</b><i class="above">🧸</i></span>'},
        {value:"dessous",phrase:"sous",label:'<span class="ps-position-scene-v16"><b>📦</b><i class="below">🧸</i></span>'}
      ];
      const target=pickV16(positions);
      return makeSingleV16(activity,`Où l'ourson est-il ${target.phrase} la boîte ?`,`Écoute le mot de position.`,`<div class="ps-big-listen-v16">🧸</div>`,shuffleV16(positions).map(item=>choiceV16(item.value,item.label,{html:true})),target.value,`Touche l'image où l'ourson est ${target.phrase} la boîte.`);
    }},

    {id:"ps-one-more",domain:"math",icon:"＋1",title:"Encore un",description:"Trouver la quantité obtenue en ajoutant un objet.",color:"#4fa97d",soft:"#e7f8ed",generator(activity){
      const current=randomV16(1,4),answer=current+1,icon=pickV16(SIMPLE_ICONS_V16);
      return makeSingleV16(activity,"On ajoute encore un. Combien y en a-t-il maintenant ?","Compte les images puis ajoute un.",`${objectRowV16(icon,current)}<div class="ps-target-badge-v16">+ 1 ${icon}</div>`,choicesWithAnswerV16(answer,[1,2,3,4,5],3).map(value=>choiceV16(value,value)),answer,`Il y en a ${current}. On en ajoute encore un. Combien y en a-t-il maintenant ?`);
    }},
    {id:"ps-one-less",domain:"math",icon:"−1",title:"J'en enlève un",description:"Trouver ce qui reste après avoir enlevé un objet.",color:"#dd7d70",soft:"#ffedeb",generator(activity){
      const current=randomV16(2,5),answer=current-1,icon=pickV16(SIMPLE_ICONS_V16);
      return makeSingleV16(activity,"On en enlève un. Combien en reste-t-il ?","Compte puis enlève un dans ta tête.",`${objectRowV16(icon,current)}<div class="ps-target-badge-v16">− 1 ${icon}</div>`,choicesWithAnswerV16(answer,[0,1,2,3,4,5],3).map(value=>choiceV16(value,value)),answer,`Il y en a ${current}. On en enlève un. Combien en reste-t-il ?`);
    }},

    /* Logique et premiers classements */
    {id:"ps-same-color",domain:"logic",icon:"🔴",title:"Même couleur",description:"Associer deux éléments de même couleur.",color:"#bc6dcc",soft:"#f7eafa",generator(activity){
      const target=pickV16(COLORS_V16),shape=pickV16(SHAPES_V16);
      const options=shuffleV16([target,...shuffleV16(COLORS_V16.filter(item=>item.name!==target.name)).slice(0,2)]);
      return makeSingleV16(activity,"Touche la même couleur.","Regarde le modèle coloré.",`<div class="ps-color-model-v16" style="--ps-color:${target.hex}">${shape.symbol}</div>`,options.map(item=>choiceV16(item.name,`<span class="ps-color-shape-v16" style="--ps-color:${item.hex}">${shape.symbol}</span>`,{html:true})),target.name,"Touche exactement la même couleur.");
    }},
    {id:"ps-same-shape",domain:"logic",icon:"●■",title:"Même forme",description:"Associer deux formes identiques.",color:"#4e9ebc",soft:"#e7f7fb",generator(activity){
      const target=pickV16(SHAPES_V16),color=pickV16(COLORS_V16);
      return makeSingleV16(activity,"Touche la même forme.","Regarde le modèle.",`<div class="ps-color-model-v16" style="--ps-color:${color.hex}">${target.symbol}</div>`,shuffleV16(SHAPES_V16).map(item=>choiceV16(item.name,`<span class="ps-color-shape-v16" style="--ps-color:${color.hex}">${item.symbol}</span>`,{html:true})),target.name,"Touche exactement la même forme.");
    }},
    {id:"ps-color-sequence",domain:"logic",icon:"🔴🔵",title:"La suite de couleurs",description:"Continuer une alternance de deux couleurs.",color:"#e68a59",soft:"#fff0e7",generator(activity){
      const pair=shuffleV16(COLORS_V16).slice(0,2),length=randomV16(3,5);
      const pattern=Array.from({length},(_,index)=>pair[index%2]);
      const answer=pair[length%2];
      const options=shuffleV16([answer,...shuffleV16(COLORS_V16.filter(item=>!pair.includes(item))).slice(0,2)]);
      return makeSingleV16(activity,"Quelle couleur vient après ?","Regarde la suite.",`<div class="ps-pattern-v16">${pattern.map(item=>`<span style="--ps-color:${item.hex}"></span>`).join("")}<b>?</b></div>`,options.map(item=>choiceV16(item.name,`<span class="ps-color-disc-v16" style="--ps-color:${item.hex}"></span>`,{html:true})),answer.name,"Regarde la suite de couleurs. Quelle couleur vient après ?");
    }},
    {id:"ps-intruder",domain:"logic",icon:"👀",title:"L'intrus",description:"Trouver l'image qui n'appartient pas à la famille.",color:"#e27878",soft:"#ffebeb",generator(activity){
      const groups=[ANIMALS_V16,FOODS_V16,CLOTHES_V16,SCHOOL_V16];
      const main=pickV16(groups),other=pickV16(groups.filter(group=>group!==main));
      const same=shuffleV16(main).slice(0,3),intruder=pickV16(other),options=shuffleV16([...same,intruder]);
      return makeSingleV16(activity,"Quelle image ne va pas avec les autres ?","Observe toute la famille.",`<div class="ps-model-v16">👀</div>`,options.map(item=>choiceV16(item.name,item.icon,{small:item.name})),intruder.name,"Trouve l'intrus. Quelle image ne va pas avec les autres ?");
    }},
    {id:"ps-story-order",domain:"logic",icon:"🌱",title:"Dans le bon ordre",description:"Remettre trois images d'une petite histoire en ordre.",color:"#55aa83",soft:"#e9f8ef",generator(activity){
      const stories=pickV16([
        [{value:"1",icon:"🌰"},{value:"2",icon:"🌱"},{value:"3",icon:"🌻"}],
        [{value:"1",icon:"🥚"},{value:"2",icon:"🐣"},{value:"3",icon:"🐔"}],
        [{value:"1",icon:"☁️"},{value:"2",icon:"🌧️"},{value:"3",icon:"🌈"}],
        [{value:"1",icon:"🧼"},{value:"2",icon:"🫧"},{value:"3",icon:"✨"}]
      ]);
      return makeOrderV16(activity,"Remets les images dans l'ordre.","Touche d'abord la première, puis la deuxième, puis la troisième.",`<div class="ps-model-v16">1 → 2 → 3</div>`,shuffleV16(stories).map(item=>choiceV16(item.value,item.icon)),stories.map(item=>item.value),"Remets les trois images dans l'ordre. Touche la première, la deuxième puis la troisième.");
    }},
    {id:"ps-size-order",domain:"logic",icon:"🐻",title:"Du petit au grand",description:"Classer trois images selon leur taille.",color:"#8b73d6",soft:"#f0edff",generator(activity){
      const icon=pickV16(["🐻","🐘","🚗","⭐","🍎"]),items=[{value:"petit",size:38},{value:"moyen",size:62},{value:"grand",size:88}];
      return makeOrderV16(activity,"Range du plus petit au plus grand.","Touche le petit, puis le moyen, puis le grand.",`<div class="ps-model-v16">petit → grand</div>`,shuffleV16(items).map(item=>choiceV16(item.value,`<span class="ps-sized-icon-v16" style="font-size:${item.size}px">${icon}</span>`,{html:true})),["petit","moyen","grand"],"Range les images du plus petit au plus grand.");
    }},
    {id:"ps-friends",domain:"logic",icon:"🤝",title:"Les objets amis",description:"Associer deux objets qui vont ensemble.",color:"#d18c4e",soft:"#fff1df",generator(activity){
      const pairs=[
        [{name:"chaussure",icon:"👟"},{name:"chaussette",icon:"🧦"}],
        [{name:"crayon",icon:"✏️"},{name:"dessin",icon:"🖼️"}],
        [{name:"cuillère",icon:"🥄"},{name:"assiette",icon:"🍽️"}],
        [{name:"brosse à dents",icon:"🪥"},{name:"dentifrice",icon:"🧴"}],
        [{name:"pluie",icon:"🌧️"},{name:"parapluie",icon:"☂️"}]
      ];
      const pair=pickV16(pairs),model=pair[0],answer=pair[1];
      const distractors=shuffleV16(pairs.filter(item=>item!==pair).map(item=>item[1])).slice(0,2);
      return makeSingleV16(activity,"Quel objet va bien avec le modèle ?","Cherche les deux objets amis.",`<div class="ps-model-v16">${model.icon}<small>${model.name}</small></div>`,shuffleV16([answer,...distractors]).map(item=>choiceV16(item.name,item.icon,{small:item.name})),answer.name,`Quel objet va bien avec ${model.name} ?`);
    }},
    {id:"ps-day-order",domain:"logic",icon:"🌞",title:"Ma petite journée",description:"Remettre trois moments simples dans l'ordre.",color:"#5b91c8",soft:"#e9f4ff",generator(activity){
      const stories=[
        [{value:"wake",label:"🌅",small:"Je me réveille"},{value:"eat",label:"🥣",small:"Je déjeune"},{value:"school",label:"🎒",small:"Je vais à l'école"}],
        [{value:"wash",label:"🧼",small:"Je me lave"},{value:"dress",label:"👕",small:"Je m'habille"},{value:"go",label:"🚪",small:"Je sors"}],
        [{value:"seed",label:"🌱",small:"La graine"},{value:"sprout",label:"🌿",small:"La pousse"},{value:"flower",label:"🌸",small:"La fleur"}]
      ];
      const story=pickV16(stories);
      return makeOrderV16(activity,"Remets les images dans le bon ordre.","Touche ce qui arrive d'abord, puis ensuite.",`<div class="ps-model-v16">➡️</div>`,shuffleV16(story).map(item=>choiceV16(item.value,item.label,{small:item.small})),story.map(item=>item.value),"Remets les trois images dans le bon ordre.");
    }},
    {id:"ps-memory",domain:"logic",icon:"🃏",title:"Le petit memory",description:"Retrouver quatre paires d'images.",color:"#d28c4d",soft:"#fff1df",special:"memory"}
  ];

  function activityByIdV16(id){return ACTIVITIES_V16.find(activity=>activity.id===id)}
  function domainInfoV16(domain){
    return {
      language:{label:"Langage et vocabulaire",short:"Je parle",subtitle:"Animaux, objets, corps, actions et couleurs",description:"Écoute des mots, regarde de grandes images et enrichis ton vocabulaire.",icon:"💬",className:"language"},
      math:{label:"Premiers nombres",short:"Je compte",subtitle:"Quantités jusqu'à 5, tailles, formes et espace",description:"Compte de petites collections, compare et découvre les premières formes.",icon:"🔢",className:"math"},
      logic:{label:"Logique et jeux",short:"Je réfléchis",subtitle:"Couleurs, formes, suites, intrus et mémoire",description:"Observe, classe, remets dans l'ordre et retrouve les images identiques.",icon:"🧩",className:"logic"}
    }[domain]||{};
  }

  function ensureScreensV16(){
    const shell=document.getElementById("gameShell")||document.body;
    [
      ["psLanguageScreenV16","reading","reading"],["psMathScreenV16","math","math"],
      ["psLogicScreenV16","reading","reading"],["psActivityScreenV16","reading","reading"],
      ["psProgressScreenV16","map","map"],["psMistakesScreenV16","errors","errors"]
    ].forEach(([id,section,route])=>{
      if(document.getElementById(id)) return;
      const screen=document.createElement("div");
      screen.id=id;
      screen.className="screen ms-screen-v15 ps-screen-v16 hidden";
      screen.dataset.gameSection=section;
      screen.dataset.gameRoute=route;
      shell.appendChild(screen);
    });
  }
  function hidePsScreensV16(){
    ["psLanguageScreenV16","psMathScreenV16","psLogicScreenV16","psActivityScreenV16","psProgressScreenV16","psMistakesScreenV16"].forEach(id=>document.getElementById(id)?.classList.add("hidden"));
  }
  function showOnlyPsScreenV16(id){
    try{originalsV16.hideAllScreens?.()}catch{}
    hidePsScreensV16();
    document.getElementById(id)?.classList.remove("hidden");
    window.GameNavigationV14?.sync?.({delay:5});
    window.GameUiV14?.refresh?.();
    updatePsHudV16();
  }
  function activityCardV16(activity){
    const stat=activityStatV16(activity.id);
    const status=stat.best>=MASTERED_SCORE?"Maîtrisé":stat.plays>0?"À continuer":"À découvrir";
    const statusClass=stat.best>=MASTERED_SCORE?"mastered":stat.plays>0?"started":"";
    const tier=stat.best>=MASTERED_SCORE?"Petit défi":stat.plays>0?"Je m'entraîne":"Je découvre";
    const stars="★".repeat(Number(stat.stars||0))+"☆".repeat(Math.max(0,3-Number(stat.stars||0)));
    return `<button class="ms-activity-card-v15 ps-activity-card-v16" data-early-activity="${escapeV16(activity.id)}" style="--card-color:${activity.color};--card-soft:${activity.soft}" onclick="startPsActivityV16('${escapeV16(activity.id)}')">
      <span class="early-tier-v17">${tier}</span><span class="ms-card-icon-v15">${activity.icon}</span><strong>${escapeV16(activity.title)}</strong><p>${escapeV16(activity.description)}</p>
      <div class="ms-activity-card-footer-v15"><span class="ms-activity-status-v15 ${statusClass}">${status}</span><span class="ms-card-stars-v15">${stars}</span></div>
      <div class="ms-card-progress-v15"><span style="width:${Number(stat.best||0)}%"></span></div>
    </button>`;
  }
  function renderDomainV16(domain){
    currentDomainV16=domain;
    const info=domainInfoV16(domain);
    const id=domain==="language"?"psLanguageScreenV16":domain==="math"?"psMathScreenV16":"psLogicScreenV16";
    const screen=document.getElementById(id);
    if(!screen) return;
    screen.dataset.gameSection=domain==="math"?"math":"reading";
    screen.dataset.gameRoute=domain==="math"?"math":"reading";
    screen.dataset.gameLabel=`${info.short} — Petite Section`;
    const progress=domainProgressV16(domain);
    screen.innerHTML=`
      <div class="ms-page-heading-v15 ps-page-heading-v16"><button class="back-btn" onclick="showHome()">← Accueil</button><div><small>Petite Section</small><h2>${escapeV16(info.label)}</h2><p>${escapeV16(info.subtitle)}</p></div></div>
      <section class="ms-domain-hero-v15 ps-domain-hero-v16 ${info.className}"><div><small>Des jeux courts et très visuels</small><h3>${escapeV16(info.short)}</h3><p>${escapeV16(info.description)}</p><div class="ms-domain-summary-v15"><span>✓ ${progress.completed}/${progress.total} jeux essayés</span><span>🏅 ${progress.mastered} réussis</span><span>⭐ ${progress.stars}</span></div></div><span class="ms-domain-hero-icon-v15">${info.icon}</span></section>
      <div class="ms-section-title-v15"><div><small>Choisis un jeu</small><h3>On joue à quoi ?</h3></div><span>4 à 5 petites questions</span></div>
      <div class="ms-activity-grid-v15 ps-activity-grid-v16">${domainActivitiesV16(domain).map(activityCardV16).join("")}</div>
      <div class="ms-section-title-v15"><div><small>Changer d'univers</small><h3>Continuer ailleurs</h3></div></div>
      <div class="ms-progress-domain-grid-v15">${["language","math","logic"].filter(key=>key!==domain).map(key=>{const other=domainInfoV16(key);return `<button class="ms-progress-domain-v15" onclick="showPsDomainV16('${key}')"><span>${other.icon}</span><strong>${escapeV16(other.short)}</strong><small>${escapeV16(other.subtitle)}</small></button>`}).join("")}</div>`;
    showOnlyPsScreenV16(id);
  }
  window.showPsDomainV16=function(domain){
    if(!isPsV16()) return originalsV16.showReadingHome?.();
    renderDomainV16(["language","math","logic"].includes(domain)?domain:"language");
  };

  function adaptPsQuestionV17(question,stat){
    if(!question) return question;
    const tier=Number(stat.best||0)>=MASTERED_SCORE?"Petit défi":Number(stat.plays||0)>0?"Je m'entraîne":"Je découvre";
    question.difficulty=tier;
    if(question.mode==="single"&&Array.isArray(question.choices)&&question.choices.length>2){
      const desired=Number(stat.plays||0)===0?2:3;
      const answer=String(question.answer);
      const correct=question.choices.find(item=>String(item.value)===answer);
      const others=shuffleV16(question.choices.filter(item=>String(item.value)!==answer));
      question.choices=shuffleV16([correct,...others.slice(0,Math.max(1,desired-1))].filter(Boolean));
    }
    return question;
  }
  function psQuestionSignatureV17(question){
    return [question?.activityId,question?.prompt,question?.visual,JSON.stringify(question?.answer)].join("|");
  }
  function buildSeriesV16(activity){
    if(activity.special==="memory") return [];
    const stat=activityStatV16(activity.id);
    const length=Number(stat.best||0)>=MASTERED_SCORE?5:PS_SERIES_LENGTH;
    const questions=[],seen=new Set();
    let attempts=0;
    while(questions.length<length&&attempts<length*15){
      attempts++;
      const question=adaptPsQuestionV17(activity.generator(activity),stat);
      const signature=psQuestionSignatureV17(question);
      if(seen.has(signature)&&attempts<length*10) continue;
      seen.add(signature);questions.push(question);
    }
    while(questions.length<length) questions.push(adaptPsQuestionV17(activity.generator(activity),stat));
    return questions;
  }
  window.startPsActivityV16=function(activityId,options={}){
    const activity=activityByIdV16(activityId);
    if(!activity) return;
    currentActivityV16=activity;
    currentDomainV16=activity.domain;
    currentQuestionIndexV16=0;
    currentSeriesCorrectV16=0;
    currentSeriesErrorsV16=0;
    currentSelectionsV16=[];
    currentOrderV16=[];
    currentQuestionLockedV16=false;
    correctionMistakeIndexV16=Number.isInteger(options.correctionIndex)?options.correctionIndex:null;
    currentQuestionsV16=options.question?[options.question]:buildSeriesV16(activity);
    psStateV16().lastActivity={activityId,at:Date.now()};
    saveV16();
    if(activity.special==="memory") return startMemoryV16();
    renderCurrentQuestionV16();
  };
  function renderChoiceLabelV16(item){
    if(item.html) return `${item.label}${item.small?`<small>${escapeV16(item.small)}</small>`:""}`;
    const looksEmoji=/[\u{1F300}-\u{1FAFF}]/u.test(item.label);
    return `${looksEmoji?`<span>${item.label}</span>`:escapeV16(item.label)}${item.small?`<small>${escapeV16(item.small)}</small>`:""}`;
  }
  function questionAnswerTextV16(question){return Array.isArray(question.answer)?question.answer.join(" puis "):String(question.answer)}
  function renderCurrentQuestionV16(){
    const question=currentQuestionsV16[currentQuestionIndexV16];
    if(!question) return finishPsSeriesV16();
    currentSelectionsV16=[];
    currentOrderV16=[];
    currentQuestionLockedV16=false;
    const screen=document.getElementById("psActivityScreenV16");
    if(!screen) return;
    screen.dataset.gameSection=question.domain==="math"?"math":"reading";
    screen.dataset.gameRoute=question.domain==="math"?"math":"reading";
    screen.dataset.gameLabel=currentActivityV16.title;
    const total=currentQuestionsV16.length,progress=Math.round(currentQuestionIndexV16/total*100);
    const choiceClass=question.choices.length>=4?"three":"";
    screen.innerHTML=`<section class="ms-activity-shell-v15 ps-activity-shell-v16">
      <header class="ms-activity-top-v15 ps-activity-top-v16"><button onclick="quitPsActivityV16()" aria-label="Quitter">×</button><div class="ms-activity-title-v15"><small>${escapeV16(domainInfoV16(question.domain).short)} · Petite Section · ${escapeV16(question.difficulty||"Je découvre")}</small><strong>${escapeV16(currentActivityV16.title)}</strong></div><span class="ms-question-count-v15">${currentQuestionIndexV16+1} / ${total}</span><div class="ms-series-track-v15"><span style="width:${progress}%"></span></div></header>
      <div class="ms-question-card-v15 ps-question-card-v16">
        <div class="ms-instruction-line-v15"><button onclick="repeatPsInstructionV16()" aria-label="Écouter la consigne">🔊</button><span class="ms-instruction-v15">${escapeV16(question.instruction)}</span></div>
        <h2 class="ms-prompt-v15 ps-prompt-v16">${escapeV16(question.prompt)}</h2>
        <div class="ms-visual-v15 ps-visual-v16">${question.visual||""}</div>
        ${question.mode==="order"?'<div id="psOrderAnswerV16" class="ms-order-answer-v15 ps-order-answer-v16">Touche les images dans l’ordre.</div>':""}
        <div id="psChoicesV16" class="ms-choices-v15 ps-choices-v16 ${choiceClass}">${question.choices.map((item,index)=>`<button class="ms-choice-v15 ps-choice-v16" data-ps-value="${escapeV16(item.value)}" onclick="selectPsChoiceV16(${index})">${renderChoiceLabelV16(item)}</button>`).join("")}</div>
        <div id="psFeedbackV16" class="ms-feedback-v15 ps-feedback-v16">Touche une réponse.</div>
        <div class="ms-activity-actions-v15"><button id="psValidateButtonV16" class="ms-main-action-v15 ps-main-action-v16" onclick="validatePsAnswerV16()">C'est ma réponse</button>${question.mode==="order"?'<button class="ms-secondary-action-v15" onclick="clearPsOrderV16()">Recommencer</button>':""}<button id="psContinueButtonV16" class="ms-main-action-v15 ps-main-action-v16 hidden" onclick="continuePsQuestionV16()">Continuer →</button></div>
      </div></section>`;
    showOnlyPsScreenV16("psActivityScreenV16");
    autoSpeakV16(question.speech||`${question.instruction} ${question.prompt}`);
  }
  window.repeatPsInstructionV16=function(){
    const question=currentQuestionsV16[currentQuestionIndexV16];
    if(question) speakV16(question.speech||`${question.instruction} ${question.prompt}`);
  };
  window.selectPsChoiceV16=function(index){
    if(currentQuestionLockedV16) return;
    const question=currentQuestionsV16[currentQuestionIndexV16],item=question?.choices?.[index];
    if(!item) return;
    const buttons=[...document.querySelectorAll("#psChoicesV16 .ps-choice-v16")];
    if(question.mode==="single"){
      currentSelectionsV16=[item.value];
      buttons.forEach((button,buttonIndex)=>button.classList.toggle("selected",buttonIndex===index));
    }else if(question.mode==="order"){
      if(currentOrderV16.includes(item.value)) return;
      currentOrderV16.push(item.value);
      buttons[index]?.classList.add("selected");
      buttons[index].disabled=true;
      renderOrderAnswerV16();
    }
  };
  function renderOrderAnswerV16(){
    const box=document.getElementById("psOrderAnswerV16");
    if(!box) return;
    box.innerHTML=currentOrderV16.length?currentOrderV16.map((value,index)=>`<span class="ms-order-token-v15">${index+1}</span>`).join(""):"Touche les images dans l’ordre.";
  }
  window.clearPsOrderV16=function(){
    if(currentQuestionLockedV16) return;
    currentOrderV16=[];
    document.querySelectorAll("#psChoicesV16 .ps-choice-v16").forEach(button=>{button.disabled=false;button.classList.remove("selected")});
    renderOrderAnswerV16();
  };
  function arraysEqualV16(a,b){return a.length===b.length&&a.every((value,index)=>String(value)===String(b[index]))}
  function selectedAnswerV16(question){return question.mode==="order"?[...currentOrderV16]:currentSelectionsV16[0]??""}
  function correctAnswerV16(question){
    const answer=selectedAnswerV16(question);
    return question.mode==="order"?arraysEqualV16(answer,question.answer):String(answer)===String(question.answer);
  }
  function recordPsMistakeV16(question,given){
    const ps=psStateV16(),signature=`${question.activityId}|${question.prompt}|${JSON.stringify(question.answer)}`;
    const existing=ps.mistakes.find(item=>item.signature===signature);
    const snapshot={signature,activityId:question.activityId,domain:question.domain,prompt:question.prompt,instruction:question.instruction,visual:question.visual,choices:question.choices,answer:question.answer,mode:question.mode,speech:question.speech,explanation:question.explanation,given:Array.isArray(given)?given.join(", "):String(given||"Aucune réponse"),count:Number(existing?.count||0)+1,at:Date.now()};
    if(existing) Object.assign(existing,snapshot); else ps.mistakes.unshift(snapshot);
    ps.mistakes=ps.mistakes.slice(0,60);
  }
  window.validatePsAnswerV16=function(){
    if(currentQuestionLockedV16) return;
    const question=currentQuestionsV16[currentQuestionIndexV16];
    if(!question) return;
    const answer=selectedAnswerV16(question),empty=Array.isArray(answer)?answer.length===0:String(answer)==="";
    if(empty){const feedback=document.getElementById("psFeedbackV16");if(feedback){feedback.className="ms-feedback-v15 ps-feedback-v16 bad";feedback.textContent="Touche d'abord une réponse 🙂"}return}
    if(question.mode==="order"&&answer.length!==question.answer.length){const feedback=document.getElementById("psFeedbackV16");if(feedback){feedback.className="ms-feedback-v15 ps-feedback-v16 bad";feedback.textContent="Touche les trois images avant de valider."}return}
    currentQuestionLockedV16=true;
    const correct=correctAnswerV16(question),ps=psStateV16();
    ps.total=Number(ps.total||0)+1;
    if(correct){
      currentSeriesCorrectV16++;ps.correct=Number(ps.correct||0)+1;ps.xp=Number(ps.xp||0)+8;addPsDailyCorrectV16(1);
      if(correctionMistakeIndexV16!==null){ps.mistakes.splice(correctionMistakeIndexV16,1);ps.correctedMistakes=Number(ps.correctedMistakes||0)+1;ps.coins=Number(ps.coins||0)+1;correctionMistakeIndexV16=-1}
    }else{currentSeriesErrorsV16++;recordPsMistakeV16(question,answer)}
    const feedback=document.getElementById("psFeedbackV16");
    if(feedback){feedback.className=`ms-feedback-v15 ps-feedback-v16 ${correct?"good":"bad"}`;feedback.innerHTML=correct?"✓ Bravo ! Tu as trouvé !":`On regarde ensemble : <strong>${escapeV16(questionAnswerTextV16(question))}</strong>.`}
    [...document.querySelectorAll("#psChoicesV16 .ps-choice-v16")].forEach(button=>{
      const value=button.dataset.psValue,isCorrect=Array.isArray(question.answer)?question.answer.map(String).includes(String(value)):String(value)===String(question.answer),wasSelected=question.mode==="order"?currentOrderV16.includes(value):currentSelectionsV16.includes(value);
      if(isCorrect) button.classList.add("correct"); else if(wasSelected) button.classList.add("wrong");
      button.disabled=true;
    });
    document.getElementById("psValidateButtonV16")?.classList.add("hidden");
    document.getElementById("psContinueButtonV16")?.classList.remove("hidden");
    saveV16();updatePsInterfaceV16();
    speakV16(correct?"Bravo ! Tu as trouvé !":`Regarde, la bonne réponse est ${questionAnswerTextV16(question)}.`);
  };
  window.continuePsQuestionV16=function(){
    if(correctionMistakeIndexV16!==null){
      if(correctionMistakeIndexV16===-1) return window.showPsMistakesV16();
      currentQuestionLockedV16=false;currentSelectionsV16=[];currentOrderV16=[];return renderCurrentQuestionV16();
    }
    currentQuestionIndexV16++;renderCurrentQuestionV16();
  };
  window.quitPsActivityV16=function(){
    const message=currentQuestionIndexV16>0?"Quitter ce petit jeu ? La série ne sera pas comptée.":"Quitter ce jeu ?";
    if(window.confirm(message)) renderDomainV16(currentDomainV16);
  };
  function starsForPercentV16(percent){if(percent===100)return 3;if(percent>=75)return 2;if(percent>=50)return 1;return 0}
  function finishPsSeriesV16(memoryResult=null){
    const ps=psStateV16(),total=memoryResult?.total??currentQuestionsV16.length,correct=memoryResult?.correct??currentSeriesCorrectV16,errors=memoryResult?.errors??currentSeriesErrorsV16;
    const percent=total?Math.round(correct/total*100):0,stars=starsForPercentV16(percent),coins=percent===100?4:percent>=75?3:percent>=50?2:1;
    const stat=activityStatV16(currentActivityV16.id);
    stat.plays=Number(stat.plays||0)+1;stat.best=Math.max(Number(stat.best||0),percent);stat.stars=Math.max(Number(stat.stars||0),stars);stat.correct=Number(stat.correct||0)+correct;stat.total=Number(stat.total||0)+total;stat.completed=true;stat.lastPlayedAt=Date.now();
    ps.seriesCompleted=Number(ps.seriesCompleted||0)+1;if(percent===100)ps.perfectSeries=Number(ps.perfectSeries||0)+1;ps.stickers=Number(ps.stickers||0)+stars;ps.coins=Number(ps.coins||0)+coins;ps.xp=Number(ps.xp||0)+12;
    ps.lastActivity={activityId:currentActivityV16.id,at:Date.now(),completed:true};ps.recent.unshift({activityId:currentActivityV16.id,title:currentActivityV16.title,domain:currentActivityV16.domain,percent,at:Date.now()});ps.recent=ps.recent.slice(0,20);
    saveV16();updatePsInterfaceV16();
    const screen=document.getElementById("psActivityScreenV16"),perfect=percent===100;
    screen.innerHTML=`<section class="ms-result-v15 ps-result-v16"><div class="ms-result-icon-v15">${perfect?"🏆":percent>=75?"🌟":percent>=50?"👏":"🌱"}</div><small>Petit jeu terminé</small><h2>${perfect?"Bravo, tout est juste !":percent>=75?"Super travail !":percent>=50?"Tu apprends bien !":"Bravo d'avoir essayé !"}</h2><p>${escapeV16(currentActivityV16.title)} · ${escapeV16(domainInfoV16(currentActivityV16.domain).short)}</p><div class="ms-result-stars-v15">${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</div><div class="ms-result-stats-v15"><article><strong>${correct}/${total}</strong><span>réponses trouvées</span></article><article><strong>${percent}%</strong><span>réussite</span></article><article><strong>+${coins}</strong><span>petites pièces</span></article></div>${currentActivityV16.special==="memory"?`<p>${memoryStateV16?.moves||0} mouvements pour retrouver les quatre paires.</p>`:errors?`<p>${errors} image à revoir a été gardée dans le carnet.</p>`:"<p>Tu as tout trouvé. Bravo !</p>"}<div class="ms-activity-actions-v15"><button class="ms-main-action-v15 ps-main-action-v16" onclick="startPsActivityV16('${currentActivityV16.id}')">Rejouer</button><button class="ms-secondary-action-v15" onclick="showPsDomainV16('${currentActivityV16.domain}')">Autres jeux</button>${errors&&currentActivityV16.special!=="memory"?'<button class="ms-secondary-action-v15" onclick="showPsMistakesV16()">Revoir ensemble</button>':""}</div></section>`;
    showOnlyPsScreenV16("psActivityScreenV16");
    if(perfect){try{window.createConfetti?.()}catch{}}
    speakV16(perfect?"Bravo ! Tu as tout trouvé !":`Le jeu est terminé. Tu as trouvé ${correct} réponses sur ${total}.`);
  }

  function startMemoryV16(){
    const symbols=shuffleV16(["🐱","🐶","🐰","🍎","🚗","⭐","🌸","🐟","🎈","🍓"]).slice(0,4);
    const cards=shuffleV16(symbols.flatMap((symbol,pair)=>[{id:`${pair}-a`,pair,symbol,revealed:false,matched:false},{id:`${pair}-b`,pair,symbol,revealed:false,matched:false}]));
    memoryStateV16={cards,flipped:[],moves:0,matched:0,locked:false,startAt:Date.now()};
    renderMemoryV16(true);
  }
  function renderMemoryV16(shouldSpeak=false){
    const screen=document.getElementById("psActivityScreenV16");
    screen.dataset.gameSection="reading";screen.dataset.gameRoute="reading";screen.dataset.gameLabel="Petit memory — Petite Section";
    screen.innerHTML=`<section class="ms-activity-shell-v15 ps-activity-shell-v16"><header class="ms-activity-top-v15 ps-activity-top-v16"><button onclick="quitPsActivityV16()">×</button><div class="ms-activity-title-v15"><small>Je réfléchis · Petite Section</small><strong>Le petit memory</strong></div><span class="ms-question-count-v15">${memoryStateV16.matched}/4 paires</span><div class="ms-series-track-v15"><span style="width:${memoryStateV16.matched/4*100}%"></span></div></header><div class="ms-question-card-v15 ps-question-card-v16"><div class="ms-instruction-line-v15"><button onclick="speakPsV16Public('Retourne deux cartes et retrouve les mêmes images.')">🔊</button><span class="ms-instruction-v15">Retourne deux cartes et retrouve les mêmes images.</span></div><h2 class="ms-prompt-v15 ps-prompt-v16">Où sont les deux mêmes images ?</h2><div class="ms-memory-grid-v15 ps-memory-grid-v16">${memoryStateV16.cards.map((card,index)=>`<button class="ms-memory-card-v15 ps-memory-card-v16 ${card.revealed?"revealed":""} ${card.matched?"matched":""}" onclick="flipPsMemoryCardV16(${index})">${card.symbol}</button>`).join("")}</div><div class="ms-feedback-v15 ps-feedback-v16">Mouvements : ${memoryStateV16.moves}</div></div></section>`;
    showOnlyPsScreenV16("psActivityScreenV16");
    if(shouldSpeak) autoSpeakV16("Retourne deux cartes et retrouve les mêmes images.");
  }
  window.flipPsMemoryCardV16=function(index){
    const memory=memoryStateV16,card=memory?.cards?.[index];
    if(!memory||memory.locked||!card||card.revealed||card.matched) return;
    card.revealed=true;memory.flipped.push(index);renderMemoryV16(false);
    if(memory.flipped.length<2) return;
    memory.moves++;
    const [aIndex,bIndex]=memory.flipped,a=memory.cards[aIndex],b=memory.cards[bIndex];
    memory.locked=true;
    if(a.pair===b.pair){
      a.matched=b.matched=true;memory.matched++;memory.flipped=[];memory.locked=false;
      if(memory.matched===4){const correct=memory.moves<=6?4:memory.moves<=9?3:2;setTimeout(()=>finishPsSeriesV16({total:4,correct,errors:4-correct}),550)}
      else setTimeout(()=>renderMemoryV16(false),300);
    }else setTimeout(()=>{a.revealed=false;b.revealed=false;memory.flipped=[];memory.locked=false;renderMemoryV16(false)},700);
  };
  window.speakPsV16Public=function(text){speakV16(text)};

  const BADGES_V16=[
    {icon:"👋",title:"Mon premier jeu",text:"Terminer une première série",test:()=>psStateV16().seriesCompleted>=1},
    {icon:"🐱",title:"Ami des animaux",text:"Réussir le jeu des animaux",test:()=>activityStatV16("ps-animals").best>=MASTERED_SCORE},
    {icon:"✋",title:"Je connais mon corps",text:"Réussir le jeu du corps",test:()=>activityStatV16("ps-body").best>=MASTERED_SCORE},
    {icon:"🌈",title:"Arc-en-ciel",text:"Réussir le jeu des couleurs",test:()=>activityStatV16("ps-colors").best>=MASTERED_SCORE},
    {icon:"3⭐",title:"Je compte jusqu'à 3",text:"Maîtriser les petites quantités",test:()=>activityStatV16("ps-count-three").best>=MASTERED_SCORE},
    {icon:"5🍎",title:"Je compte jusqu'à 5",text:"Maîtriser les quantités jusqu'à cinq",test:()=>activityStatV16("ps-count-five").best>=MASTERED_SCORE},
    {icon:"▲",title:"Ami des formes",text:"Reconnaître les trois formes",test:()=>activityStatV16("ps-shapes").best>=MASTERED_SCORE},
    {icon:"🧩",title:"Petit détective",text:"Réussir trois jeux de logique",test:()=>domainProgressV16("logic").mastered>=3},
    {icon:"💯",title:"Sans faute",text:"Réussir une série parfaite",test:()=>psStateV16().perfectSeries>=1},
    {icon:"🏆",title:"Champion de Petite Section",text:"Réussir tout le programme",test:()=>overallProgressV16().mastered>=overallProgressV16().total}
  ];
  window.showPsProgressV16=function(){
    const screen=document.getElementById("psProgressScreenV16"),overall=overallProgressV16(),ps=psStateV16();
    screen.innerHTML=`<div class="ms-page-heading-v15 ps-page-heading-v16"><button class="back-btn" onclick="showHome()">← Accueil</button><div><small>Petite Section</small><h2>Mon carnet d'autocollants</h2><p>Chaque jeu essayé fait grandir ta collection.</p></div></div><section class="ms-progress-hero-v15 ps-progress-hero-v16"><div><small>Progression générale</small><h2>${overall.mastered} jeu${overall.mastered>1?"x":""} réussi${overall.mastered>1?"s":""}</h2><p>Continue tranquillement pour découvrir toutes les activités.</p></div><div class="ms-progress-total-v15" style="--progress:${overall.percent}%"><div><strong>${overall.percent}%</strong><span>réussi</span></div></div></section><div class="ms-progress-domain-grid-v15">${["language","math","logic"].map(domain=>{const info=domainInfoV16(domain),progress=domainProgressV16(domain);return `<button class="ms-progress-domain-v15" onclick="showPsDomainV16('${domain}')"><span>${info.icon}</span><strong>${info.short}</strong><small>${progress.mastered}/${progress.total} réussis · ⭐ ${progress.stars}</small></button>`}).join("")}</div><div class="ms-section-title-v15"><div><small>Mes récompenses</small><h3>Autocollants de Petite Section</h3></div><span>${BADGES_V16.filter(badge=>badge.test()).length}/${BADGES_V16.length}</span></div><div class="ms-badge-grid-v15">${BADGES_V16.map(badge=>`<article class="ms-badge-v15 ${badge.test()?"":"locked"}"><span>${badge.icon}</span><strong>${escapeV16(badge.title)}</strong><small>${escapeV16(badge.text)}</small></article>`).join("")}</div><div class="ms-section-title-v15"><div><small>Ma petite collection</small><h3>Ce que j'ai gagné</h3></div></div><div class="ms-progress-domain-grid-v15"><article class="ms-progress-domain-v15"><span>⭐</span><strong>${ps.stickers}</strong><small>autocollants gagnés</small></article><article class="ms-progress-domain-v15"><span>🪙</span><strong>${ps.coins}</strong><small>petites pièces</small></article><article class="ms-progress-domain-v15"><span>🎮</span><strong>${ps.seriesCompleted}</strong><small>jeux terminés</small></article></div>`;
    showOnlyPsScreenV16("psProgressScreenV16");
  };
  window.showPsMistakesV16=function(){
    const screen=document.getElementById("psMistakesScreenV16"),mistakes=psStateV16().mistakes;
    screen.innerHTML=`<div class="ms-page-heading-v15 ps-page-heading-v16"><button class="back-btn" onclick="showHome()">← Accueil</button><div><small>Petite Section</small><h2>On revoit ensemble</h2><p>Pas de mauvaise note : on regarde encore une fois.</p></div></div><section class="ms-mistake-summary-v15 ps-mistake-summary-v16"><span>🌱</span><div><strong>${mistakes.length} image${mistakes.length>1?"s":""} à revoir</strong><p>Une bonne réponse retire l'image du carnet.</p></div>${mistakes.length?'<button onclick="redoFirstPsMistakeV16()">Commencer</button>':""}</section><div class="ms-mistake-list-v15">${mistakes.length?mistakes.map((mistake,index)=>{const activity=activityByIdV16(mistake.activityId);return `<article class="ms-mistake-card-v15"><span>${activity?.icon||"?"}</span><div><strong>${escapeV16(activity?.title||"Petit jeu")}</strong><p>${escapeV16(mistake.prompt)}</p><small>On peut la refaire tranquillement.</small></div><button onclick="redoPsMistakeV16(${index})">Revoir</button></article>`}).join(""):'<section class="ms-empty-v15"><span>🌟</span><h3>Tout est revu !</h3><p>Le carnet est vide. Bravo !</p></section>'}</div>`;
    showOnlyPsScreenV16("psMistakesScreenV16");
  };
  window.redoPsMistakeV16=function(index){
    const mistake=psStateV16().mistakes[index];
    if(!mistake) return window.showPsMistakesV16();
    const activity=activityByIdV16(mistake.activityId)||ACTIVITIES_V16[0];
    window.startPsActivityV16(activity.id,{question:{...mistake,activityId:activity.id,domain:activity.domain},correctionIndex:index});
  };
  window.redoFirstPsMistakeV16=function(){window.redoPsMistakeV16(0)};

  function patchClassSelectorV16(){}
  function choosePsLevelV16(){
    if(typeof window.LumiKidsSelectClassV162==="function") return window.LumiKidsSelectClassV162("ps");
  }
  function ensureParentPsUiV16(){
    const parent=document.getElementById("parentScreen");
    if(parent&&!document.getElementById("parentPsSummaryV16")) parent.insertAdjacentHTML("beforeend",`<section id="parentPsSummaryV16" class="parent-ms-summary-v15 parent-ps-summary-v16 hidden"><header><div><small>Programme Petite Section</small><h3>Progression PS</h3></div><span id="parentPsPercentV16">0 %</span></header><div class="parent-ms-grid-v15"><article><strong id="parentPsLanguageV16">0/10</strong><small>vocabulaire réussi</small></article><article><strong id="parentPsMathV16">0/10</strong><small>nombres réussis</small></article><article><strong id="parentPsLogicV16">0/7</strong><small>logique réussie</small></article><article><strong id="parentPsErrorsV16">0</strong><small>images à revoir</small></article></div></section>`);
  }
  function renderParentPsV16(){
    ensureParentPsUiV16();
    const psPanel=document.getElementById("parentPsSummaryV16"),msPanel=document.getElementById("parentMsSummaryV15");
    psPanel?.classList.toggle("hidden",!isPsV16());
    if(isPsV16()) msPanel?.classList.add("hidden"); else msPanel?.classList.remove("hidden");
    if(!isPsV16()) return;
    setTextV16("parentClassIconV15","🧸");setTextV16("parentClassTitleV15","Classe actuelle : Petite Section");setTextV16("parentClassDescriptionV15","Le jeu affiche de grandes images, des consignes courtes et des séries adaptées aux 3-4 ans.");
    const overall=overallProgressV16(),language=domainProgressV16("language"),math=domainProgressV16("math"),logic=domainProgressV16("logic"),ps=psStateV16(),accuracy=ps.total?Math.round(Number(ps.correct||0)/Number(ps.total||1)*100):0;
    setTextV16("parentPsPercentV16",`${overall.percent} %`);setTextV16("parentPsLanguageV16",`${language.mastered}/${language.total}`);setTextV16("parentPsMathV16",`${math.mastered}/${math.total}`);setTextV16("parentPsLogicV16",`${logic.mastered}/${logic.total}`);setTextV16("parentPsErrorsV16",ps.mistakes.length);
    setTextV16("parentTotalStars",ps.stickers);setTextV16("parentCorrect",ps.correct);setTextV16("parentQuestions",ps.total);setTextV16("parentLettersMastered",`${overall.mastered} / ${overall.total}`);setTextV16("parentAccuracy",`${accuracy}%`);setTextV16("parentEncouragement",accuracy>=85?"Très belle aisance en Petite Section !":accuracy>=60?"Belle découverte du programme de Petite Section !":"Les jeux courts et répétés aideront progressivement.");
    const bar=document.getElementById("parentAccuracyBar");if(bar) bar.style.width=`${accuracy}%`;
    setTextV16("parentExercisesV10",ps.seriesCompleted);setTextV16("parentCorrectedV10",ps.correctedMistakes);setTextV16("parentSoundsMasteredV10",language.mastered);
  }
  function renderPsDailyHomeV16(){
    const daily=ensurePsDailyV16(),card=document.getElementById("dailyChallengeCard");
    if(!card) return;
    card.setAttribute("onclick","claimPsDailyV16()");
    setTextV16("dailyChallengeText","Trouve 6 bonnes réponses de Petite Section");setTextV16("dailyChallengeStatus",daily.claimed?"Petit cadeau récupéré":`${daily.correct}/${daily.target}`);setTextV16("dailyChallengeAction",daily.claimed?"Récupéré":daily.correct>=daily.target?"Récupérer":"En cours");setTextV16("dailyRewardBadge",daily.claimed?"✓":"🪙 4");
    const bar=document.getElementById("dailyChallengeBar");if(bar) bar.style.width=`${Math.min(100,daily.correct/daily.target*100)}%`;
    card.classList.toggle("claimable",!daily.claimed&&daily.correct>=daily.target);card.classList.toggle("claimed",daily.claimed);
  }
  window.claimPsDailyV16=function(){
    const daily=ensurePsDailyV16();
    if(daily.claimed) return window.showToast?.("Petit défi déjà récupéré aujourd'hui.");
    if(daily.correct<daily.target) return window.showToast?.(`Encore ${daily.target-daily.correct} bonne${daily.target-daily.correct>1?"s":""} réponse${daily.target-daily.correct>1?"s":""} !`);
    daily.claimed=true;psStateV16().coins=Number(psStateV16().coins||0)+4;saveV16();updatePsInterfaceV16();try{window.createConfetti?.()}catch{}window.showToast?.("Défi PS terminé : +4 pièces !");
  };
  function setActivityCopyV16(selector,small,strong,em){
    const card=document.querySelector(selector);if(!card) return;
    const smallEl=card.querySelector("small"),strongEl=card.querySelector("strong"),emEl=card.querySelector("em");
    if(smallEl)smallEl.textContent=small;if(strongEl)strongEl.textContent=strong;if(emEl)emEl.textContent=em;
  }
  function renderPsHomeV16(){
    if(!isPsV16()) return;
    document.body.classList.add("class-ps-v16");document.body.classList.remove("class-ms-v15","class-gs-cp-v15");document.body.dataset.schoolLevel="ps";
    setTextV16("gameClassBadgeV15","🧸 PS");setTextV16("gameProfileClassTitleV15","Petite Section");setTextV16("gameProfileClassTextV15","Modifier depuis l'espace Parents");
    const logic=document.getElementById("msHomeLogicV15");
    if(logic){logic.classList.remove("hidden");logic.setAttribute("onclick","showPsDomainV16('logic')");const small=logic.querySelector("small"),strong=logic.querySelector("strong"),em=logic.querySelector("em");if(small)small.textContent="Jeux d'observation";if(strong)strong.textContent="Logique et jeux";if(em)em.textContent="Couleurs, formes, intrus, ordre et memory"}
    document.getElementById("storyBookButton")?.classList.add("hidden");document.getElementById("gameProfileStoryButtonV15")?.classList.add("hidden");
    document.querySelectorAll('[data-game-route="map"] small').forEach(element=>element.textContent="Parcours");document.querySelectorAll('[data-game-route="errors"] small').forEach(element=>element.textContent="À revoir");document.querySelectorAll('[data-game-route="rewards"] small').forEach(element=>element.textContent="Autocollants");
    const hero=document.querySelector("#homeScreen .hero-copy");
    if(hero){const h2=hero.querySelector("h2"),p=hero.querySelector(":scope>p:not(.eyebrow):not(.resume-hint-v10)");if(h2)h2.innerHTML="Prêt pour de nouveaux<br>petits jeux de Petite Section ?";if(p)p.textContent="Écoute, observe, touche et découvre à ton rythme."}
    setActivityCopyV16(".reading-v3","Mots et images","Je parle","Animaux, objets, corps, actions et couleurs");
    setActivityCopyV16(".maths-v3","Petites quantités","Je compte","Nombres jusqu'à 5, tailles, formes et positions");
    setActivityCopyV16(".rewards-v3","Ma collection PS","Autocollants","Voir tous les petits jeux réussis");
    setActivityCopyV16(".mistakes-v3","Sans mauvaise note","On revoit ensemble","Regarder encore les images difficiles");
    setActivityCopyV16(".world-map-v3","Mon programme","Parcours PS","Découvrir toutes les compétences");
    const last=psStateV16().lastActivity;setTextV16("resumeHintV10",last?"Reprends ton dernier petit jeu.":"Choisis ton premier petit jeu de Petite Section.");
    const mistakes=psStateV16().mistakes.length;setTextV16("homeMistakeCount",`${mistakes} image${mistakes>1?"s":""}`);setTextV16("dailyMilestoneV10","Objectif conseillé : 5 à 8 minutes");
    renderPsDailyHomeV16();updatePsHudV16();
  }
  function restoreNonPsHomeV16(){
    if(isPsV16()) return;
    document.body.classList.remove("class-ps-v16");
    const logic=document.getElementById("msHomeLogicV15");
    if(selectedClassV16()==="ms"&&logic){logic.setAttribute("onclick","showMsDomainV15('logic')");const small=logic.querySelector("small"),strong=logic.querySelector("strong"),em=logic.querySelector("em");if(small)small.textContent="Univers logique";if(strong)strong.textContent="Logique et jeux";if(em)em.textContent="Suites, intrus, classement et mémoire"}
    document.getElementById("parentPsSummaryV16")?.classList.add("hidden");
  }
  function updatePsHudV16(){
    if(!isPsV16()) return;
    const ps=psStateV16(),level=psLevelV16();
    setTextV16("globalStars",ps.stickers);setTextV16("globalCoins",ps.coins);setTextV16("homeLevel",level);setTextV16("homeXpText",`${ps.xp%80} / 80 XP`);setTextV16("homeProgressPercent",`${Math.round(ps.xp%80/80*100)}%`);
    const homeBar=document.getElementById("homeXpBar");if(homeBar)homeBar.style.width=`${ps.xp%80/80*100}%`;
    setTextV16("gameHudLevelV14",level);const hudBar=document.getElementById("gameHudXpFillV14");if(hudBar)hudBar.style.width=`${ps.xp%80/80*100}%`;
  }
  function updatePsInterfaceV16(){if(isPsV16())renderPsHomeV16();renderParentPsV16()}
  function applyPsModeV16(){
    const selected=selectedClassV16();
    document.body.dataset.schoolLevel=selected||"unselected";document.body.classList.toggle("class-ps-v16",selected==="ps");
    if(selected!=="ps") restoreNonPsHomeV16();
    updatePsInterfaceV16();
  }

  function installWrappersV16(){
    originalsV16={
      hideAllScreens:window.hideAllScreens,showHome:window.showHome,showReadingHome:window.showReadingHome,showMath:window.showMath,showRewards:window.showRewards,showMistakeReview:window.showMistakeReview,showWorldMap:window.showWorldMap,showParentDashboard:window.showParentDashboard,continueLearning:window.continueLearning,updateGameUi:window.updateGameUi,chooseSchoolLevel:window.chooseSchoolLevelV15
    };
    window.hideAllScreens=function(...args){const result=typeof originalsV16.hideAllScreens==="function"?originalsV16.hideAllScreens.apply(this,args):undefined;hidePsScreensV16();return result};
    window.showHome=function(...args){const result=typeof originalsV16.showHome==="function"?originalsV16.showHome.apply(this,args):undefined;if(isPsV16())renderPsHomeV16();else restoreNonPsHomeV16();return result};
    window.showReadingHome=function(...args){if(isPsV16())return renderDomainV16("language");return originalsV16.showReadingHome?.apply(this,args)};
    window.showMath=function(...args){if(isPsV16())return renderDomainV16("math");return originalsV16.showMath?.apply(this,args)};
    window.showRewards=function(...args){if(isPsV16())return window.showPsProgressV16();return originalsV16.showRewards?.apply(this,args)};
    window.showMistakeReview=function(...args){if(isPsV16())return window.showPsMistakesV16();return originalsV16.showMistakeReview?.apply(this,args)};
    window.showWorldMap=function(...args){if(isPsV16())return window.showPsProgressV16();return originalsV16.showWorldMap?.apply(this,args)};
    window.showParentDashboard=function(...args){const result=originalsV16.showParentDashboard?.apply(this,args);setTimeout(renderParentPsV16,35);return result};
    window.continueLearning=function(...args){if(isPsV16()){const last=psStateV16().lastActivity;if(last?.activityId&&activityByIdV16(last.activityId))return window.startPsActivityV16(last.activityId);return renderDomainV16("language")}return originalsV16.continueLearning?.apply(this,args)};
    window.updateGameUi=function(...args){const result=originalsV16.updateGameUi?.apply(this,args);if(isPsV16())updatePsInterfaceV16();else restoreNonPsHomeV16();return result};
    /* Le choix de classe V16.2 est géré indépendamment dans index.html. */
    try{updateGameUi=window.updateGameUi}catch{}
  }
  function initV16(){
    ensureStateV16();ensureScreensV16();patchClassSelectorV16();ensureParentPsUiV16();installWrappersV16();applyPsModeV16();if(isPsV16())renderPsHomeV16();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initV16,{once:true});else initV16();

  window.LumiPsV16={
    get selected(){return selectedClassV16()},get progress(){return psStateV16()},activities:ACTIVITIES_V16,chooseLevel:choosePsLevelV16,showDomain:window.showPsDomainV16,
    generateQuestion(activityId){const activity=activityByIdV16(activityId);return activity?.special?{special:activity.special}:activity?.generator(activity)},
    generateSeries(activityId){const activity=activityByIdV16(activityId);return activity?buildSeriesV16(activity):[]}
  };
})();
