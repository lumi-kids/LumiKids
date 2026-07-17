/* =========================================================
   LUMIKIDS V17 — FINALISATION PS / MS
   Statistiques de semaine, parcours conseillé et préparation voix.
========================================================= */
(function installEarlyYearsV17(){
  "use strict";
  if(window.__lumikidsEarlyYearsV17) return;
  window.__lumikidsEarlyYearsV17=true;

  const STATS_KEY="lumikids-early-years-stats-v17";
  const VOICE_KEY="lumikids-voice-phrases-v17";
  const CLASS_KEY="lumikids-school-level-v15";
  let lastActiveAt=Date.now();
  let lastResultSignature="";
  let parentRenderQueuedV17=false;

  function safeParse(value,fallback){try{return JSON.parse(value)}catch{return fallback}}
  function loadStats(){
    const value=safeParse(localStorage.getItem(STATS_KEY),null);
    return value&&typeof value==="object"?value:{days:{},sessions:[],lastActivity:null};
  }
  function saveStats(stats){try{localStorage.setItem(STATS_KEY,JSON.stringify(stats))}catch{}}
  function dateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
  function selectedLevel(){
    try{return localStorage.getItem(CLASS_KEY)||window.LumiPsV16?.selected||window.LumiClassesV15?.selected||""}catch{return ""}
  }
  function profile(level=selectedLevel()){
    try{return window.gameState?.classProfilesV15?.[level]||null}catch{return null}
  }
  function day(stats,key=dateKey()){
    if(!stats.days[key]) stats.days[key]={seconds:0,answers:0,correct:0,series:0,activities:{}};
    return stats.days[key];
  }
  function recordAnswer(level,activityId,correct){
    const stats=loadStats(),entry=day(stats);entry.answers++;if(correct)entry.correct++;
    if(activityId){if(!entry.activities[activityId])entry.activities[activityId]={answers:0,correct:0};entry.activities[activityId].answers++;if(correct)entry.activities[activityId].correct++}
    stats.lastActivity={level,activityId,at:Date.now()};saveStats(stats);renderParentStats();
  }
  function beginActivity(level,activityId){
    const stats=loadStats();stats.lastActivity={level,activityId,at:Date.now()};
    stats.sessions.unshift({level,activityId,startAt:Date.now(),completed:false});stats.sessions=stats.sessions.slice(0,50);saveStats(stats);
  }
  function recordSeries(level,activityId,percent,at){
    const signature=`${level}|${activityId}|${at||0}|${percent}`;
    if(signature===lastResultSignature)return;lastResultSignature=signature;
    const stats=loadStats(),entry=day(stats);entry.series++;
    const session=stats.sessions.find(item=>item.level===level&&item.activityId===activityId&&!item.completed);
    if(session){session.completed=true;session.endAt=Date.now();session.percent=percent}
    saveStats(stats);renderParentStats();
  }

  function fnv(text){let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)}return (hash>>>0).toString(36)}
  function slug(text){return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,38)||"phrase"}
  function voiceId(text,level){return `${level}-${slug(text)}-${fnv(String(text))}`}
  function rememberVoice(text,level,id){
    const catalog=safeParse(localStorage.getItem(VOICE_KEY),{});catalog[id]={id,level,text:String(text),path:`audio/voix/${level}/${id}.mp3`};
    try{localStorage.setItem(VOICE_KEY,JSON.stringify(catalog))}catch{}
  }
  const playingAudio=new Audio();
  window.LumiVoiceV17={
    idFor:voiceId,
    phrases(){return safeParse(localStorage.getItem(VOICE_KEY),{})},
    clearPhrases(){localStorage.removeItem(VOICE_KEY)},
    speak(text,level="commun"){
      const id=voiceId(text,level);rememberVoice(text,level,id);
      const catalog=window.LUMIKIDS_RECORDED_VOICE_CATALOG_V17||{};
      const source=catalog[id];if(!source)return false;
      try{playingAudio.pause();playingAudio.src=typeof source==="string"?source:source.path;playingAudio.currentTime=0;playingAudio.play().catch(()=>{});return true}catch{return false}
    }
  };

  function wrapStart(name,level){
    const original=window[name];if(typeof original!=="function"||original.__v17)return;
    const wrapped=function(activityId,...args){beginActivity(level,activityId);return original.call(this,activityId,...args)};
    wrapped.__v17=true;window[name]=wrapped;
  }
  function wrapValidate(name,level){
    const original=window[name];if(typeof original!=="function"||original.__v17)return;
    const wrapped=function(...args){
      const before=profile(level),beforeTotal=Number(before?.total||0),beforeCorrect=Number(before?.correct||0),activityId=loadStats().lastActivity?.activityId||"";
      const result=original.apply(this,args);
      const after=profile(level),afterTotal=Number(after?.total||0),afterCorrect=Number(after?.correct||0);
      if(afterTotal>beforeTotal)recordAnswer(level,activityId,afterCorrect>beforeCorrect);
      return result;
    };
    wrapped.__v17=true;window[name]=wrapped;
  }
  function installWrappers(){wrapStart("startPsActivityV16","ps");wrapStart("startMsActivityV15","ms");wrapValidate("validatePsAnswerV16","ps");wrapValidate("validateMsAnswerV15","ms")}

  function weekKeys(){
    const result=[];for(let offset=6;offset>=0;offset--){const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-offset);result.push({key:dateKey(date),label:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][date.getDay()]})}return result;
  }
  function renderParentStats(){
    const parent=document.getElementById("parentScreen");if(!parent)return;
    let panel=document.getElementById("earlyParentV17");
    if(!panel){
      panel=document.createElement("section");panel.id="earlyParentV17";panel.className="early-parent-v17";
      const anchor=parent.querySelector(".parent-progress-card");anchor?.insertAdjacentElement("afterend",panel);
    }
    const stats=loadStats(),keys=weekKeys();let seconds=0,answers=0,correct=0,series=0,activeDays=0;
    keys.forEach(item=>{const value=stats.days[item.key]||{};seconds+=Number(value.seconds||0);answers+=Number(value.answers||0);correct+=Number(value.correct||0);series+=Number(value.series||0);if(Number(value.seconds||0)>0||Number(value.answers||0)>0)activeDays++});
    const minutes=Math.max(0,Math.round(seconds/60)),accuracy=answers?Math.round(correct/answers*100):0;
    const html=`<header><div><small>Petite et Moyenne Section</small><h3>Les 7 derniers jours</h3></div><span class="early-week-goal-v17">${activeDays}/5 jours conseillés</span></header>
      <div class="early-week-grid-v17">
        <article><span>⏱️</span><strong>${minutes} min</strong><small>temps actif</small></article>
        <article><span>✓</span><strong>${correct}/${answers}</strong><small>bonnes réponses</small></article>
        <article><span>🎯</span><strong>${accuracy}%</strong><small>réussite</small></article>
        <article><span>🎮</span><strong>${series}</strong><small>séries finies</small></article>
      </div>
      <div class="early-week-days-v17">${keys.map(item=>{const value=stats.days[item.key]||{},active=Number(value.seconds||0)>0||Number(value.answers||0)>0;return `<div class="${active?"active":""}"><b>${item.label}</b><small>${Math.round(Number(value.seconds||0)/60)} min<br>${Number(value.correct||0)} ✓</small></div>`}).join("")}</div>`;
    if(panel.dataset.snapshot!==html){panel.dataset.snapshot=html;panel.innerHTML=html}
    const play=document.getElementById("parentPlayTimeV10");
    const playText=`${minutes} min`;
    if(play&&["ps","ms"].includes(selectedLevel())&&play.textContent!==playText) play.textContent=playText;
  }

  function scheduleParentRenderV17(){
    if(parentRenderQueuedV17)return;
    parentRenderQueuedV17=true;
    requestAnimationFrame(()=>{
      parentRenderQueuedV17=false;
      const parent=document.getElementById("parentScreen");
      if(parent&&!parent.classList.contains("hidden"))renderParentStats();
    });
  }

  function inferResult(){
    const result=document.querySelector(".ms-result-v15:not([data-v17-enhanced])");if(!result)return;
    result.dataset.v17Enhanced="true";
    const isPs=result.classList.contains("ps-result-v16"),level=isPs?"ps":"ms";
    const replay=result.querySelector('button[onclick*="startPsActivityV16"],button[onclick*="startMsActivityV15"]');
    const match=replay?.getAttribute("onclick")?.match(/start(?:PsActivityV16|MsActivityV15)\('([^']+)'\)/);if(!match)return;
    const id=match[1],list=isPs?window.LumiPsV16?.activities:window.LumiClassesV15?.activities;
    const activity=list?.find(item=>item.id===id),domainList=list?.filter(item=>item.domain===activity?.domain)||[];
    const index=domainList.findIndex(item=>item.id===id),next=domainList[(index+1+domainList.length)%domainList.length];
    const recent=profile(level)?.recent?.[0];recordSeries(level,id,Number(recent?.percent||0),Number(recent?.at||0));
    if(next&&next.id!==id){
      const box=document.createElement("div");box.className="early-result-next-v17";box.innerHTML=`<small>Suite conseillée : ${next.title}</small><button type="button">Continuer le parcours →</button>`;
      box.querySelector("button").addEventListener("click",()=>isPs?window.startPsActivityV16(next.id):window.startMsActivityV15(next.id));
      result.appendChild(box);
    }
  }

  function tickActiveTime(){
    const now=Date.now(),delta=Math.min(35,Math.max(0,(now-lastActiveAt)/1000));lastActiveAt=now;
    if(document.hidden||!["ps","ms"].includes(selectedLevel()))return;
    const visible=document.querySelector(".screen:not(.hidden)");if(!visible)return;
    const stats=loadStats();day(stats).seconds+=delta;saveStats(stats);
  }
  function init(){
    installWrappers();renderParentStats();
    new MutationObserver(()=>{installWrappers();inferResult();scheduleParentRenderV17()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
    window.addEventListener("lumikids:parent-opened-v17",scheduleParentRenderV17);
    setInterval(tickActiveTime,30000);document.addEventListener("visibilitychange",()=>{lastActiveAt=Date.now()});
    window.addEventListener("beforeunload",tickActiveTime);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  window.LumiEarlyYearsV17={stats:loadStats,renderParent:renderParentStats,voice:window.LumiVoiceV17};
})();
