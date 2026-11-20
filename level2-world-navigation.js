/* PLAYWISE · shared navigation for all World 2 stations and mini-games */
(function(){
'use strict';
const stages=[
['🍄','שער האותיות','level2-letter-gate.html'],
['🛡️','מגיני האבירים','level2-knight-shields.html'],
['🦄','יער החרוזים','level2-rhyming-forest.html'],
['🪞','מראת התנועות','level2-vowel-gems.html'],
['🐉','מערת הדרקון','level2-quest.html?stage=5'],
['🏹','חיצי האביר','level2-quest.html?stage=6'],
['🧙‍♀️','שיקויי הפיה','level2-quest.html?stage=7'],
['🏰','גשר הטירה','level2-quest.html?stage=8'],
['🗝️','מפתחות האוצר','level2-quest.html?stage=9'],
['👑','הכתר האבוד','level2-quest.html?stage=10']
];
const mini=[
['🍄','שער האותיות','level2-letter-gate.html'],
['🧩','פאזל ABC','level2-abc-puzzle.html'],
['🔮','אבני הקסם','level2-vowel-gems.html'],
['💎','הצלת הקריסטלים','level2-vowel-gems-b.html'],
['🪞','מראת התנועות','level2-vowel-mirror.html']
];
const path=decodeURIComponent(location.pathname.split('/').pop()||'');
const params=new URLSearchParams(location.search);
const isMap=path==='adventure-map.html';
const isQuest=path==='level2-quest.html';
const activeMini=mini.findIndex(m=>m[2]===path||(path==='level2-magic-vowels.html'&&m[2]==='level2-vowel-gems.html'));
const activeStage=isMap?-1:isQuest?Math.max(0,Math.min(9,(Number(params.get('stage'))||1)-1)):activeMini===0||activeMini===1?0:activeMini>=2?3:path==='level2-knight-shields.html'?1:path==='level2-rhyming-forest.html'?2:-1;
if(activeStage<0&&!isMap)return;
const css=document.createElement('style');css.id='pw-world-navigation-style';
css.textContent='.pw-worldbar,.pw-worldbar *{box-sizing:border-box}.pw-worldbar{direction:rtl;position:sticky;top:0;z-index:900;width:100%;padding:7px clamp(7px,1.5vw,19px) 8px;background:linear-gradient(105deg,#231043f5,#4a2477fa,#261048f5);border-bottom:3px solid #f5d58e;color:#fff5db;font-family:Arial,"Noto Sans Hebrew",sans-serif;box-shadow:0 6px 24px #14072d9c;isolation:isolate}.pw-worldbar .pw-worldtop{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 6px}.pw-worldbar .pw-worldreturn{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:4px;background:linear-gradient(#ffedbd,#ffca7c);border:2px solid #fff2c8;color:#472364;border-radius:11px;padding:6px 12px;text-decoration:none;font-size:clamp(11px,1.5vw,14px);font-weight:900;box-shadow:0 2px 7px #12072b7d}.pw-worldbar .pw-worldreturn:hover,.pw-worldbar .pw-worldreturn:focus-visible{background:#fff8d7;outline:2px solid #fff}.pw-worldbar .pw-worldtitle{font-size:clamp(11px,1.65vw,16px);font-weight:900;color:#ffe7a9;text-align:center;min-width:0}.pw-worldbar .pw-worldcount{flex:none;text-align:center;background:#241044;border:1px solid #d9b17d;border-radius:11px;padding:5px 9px;font-weight:900;font-size:clamp(10px,1.4vw,13px);white-space:nowrap}.pw-worldbar .pw-worldrail,.pw-worldbar .pw-minirail{display:flex;align-items:stretch;gap:5px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:#cda7f2 #2b154d;padding:2px 1px 5px;direction:rtl}.pw-worldbar .pw-worldrail{justify-content:safe center}.pw-worldbar .pw-stage{flex:1 0 80px;max-width:130px;min-width:77px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:5px 3px;border-radius:11px;background:#35205a;border:1.5px solid #886ca8;color:#f8e9ff;text-decoration:none;text-align:center;line-height:1.1;transition:background .2s,transform .2s;position:relative}.pw-worldbar .pw-stage:hover{background:#75429e;transform:translateY(-2px)}.pw-worldbar .pw-stage.active{border:2px solid #ffe2a1;background:#8852b5;color:#fff7cb;box-shadow:0 0 13px #f6ccff99}.pw-worldbar .pw-stage.done{background:#236453;border-color:#abffdb;color:#f0ffed}.pw-worldbar .pw-stage.done.active{background:#397d70;border-color:#ffe5a1}.pw-worldbar .pw-stageicon{font-size:clamp(16px,2.2vw,22px);line-height:1}.pw-worldbar .pw-stagetext{font-size:clamp(9px,1.05vw,12px);font-weight:900;white-space:nowrap}.pw-worldbar .pw-stagecheck{position:absolute;top:2px;left:3px;font-size:10px;color:#c4ffe3}.pw-worldbar .pw-miniline{display:flex;align-items:center;gap:7px;margin-top:2px}.pw-worldbar .pw-minilabel{flex:none;font-size:clamp(10px,1.4vw,13px);color:#ffdf9e;font-weight:900;white-space:nowrap}.pw-worldbar .pw-minirail{flex:1;gap:6px;padding-bottom:2px}.pw-worldbar .pw-mini{flex:1 0 112px;max-width:210px;min-width:112px;display:flex;justify-content:center;align-items:center;gap:4px;padding:5px 6px;border-radius:10px;border:1px solid #9379b3;background:#2c184f;color:#fff0ff;text-decoration:none;text-align:center;font-size:clamp(10px,1.15vw,13px);font-weight:900;white-space:nowrap}.pw-worldbar .pw-mini:hover{background:#75469e}.pw-worldbar .pw-mini.active{background:#8c50b8;border:2px solid #ffe3a3;color:#fff6cf}.pw-worldbar .pw-mini.done{background:#256756;border-color:#b7ffe0}.pw-worldbar .pw-mini.done.active{border-color:#ffe3a3}.pw-worldbar .pw-minicheck{font-size:11px;color:#c8ffe0}body.pw-world-withbar .pw-mini-nav,body.pw-world-withbar .mirror-route,body.pw-world-withbar .pw-legacy-worldback{display:none!important}body.pw-world-withbar.pw-world-gate .world{height:calc(100dvh - var(--pw-worldbar-height,138px));min-height:0}body.pw-world-withbar.pw-world-map .home{display:none!important}body.pw-world-withbar.pw-world-map .map-window{height:calc(100dvh - var(--pw-worldbar-height,138px))}body.pw-world-withbar.pw-world-map #treasure-story{top:calc(var(--pw-worldbar-height,138px) + 6px)!important}@media(max-width:850px){.pw-worldbar .pw-worldrail{justify-content:flex-start}.pw-worldbar .pw-stage{flex:0 0 83px}.pw-worldbar .pw-minilabel{font-size:10px}.pw-worldbar .pw-mini{flex:0 0 auto}.pw-worldbar .pw-worldtitle{font-size:12px}}@media(max-width:530px){.pw-worldbar{padding:5px 6px}.pw-worldbar .pw-worldtop{gap:4px;margin-bottom:4px}.pw-worldbar .pw-worldreturn{padding:6px;font-size:10px}.pw-worldbar .pw-worldcount{font-size:9px;padding:5px}.pw-worldbar .pw-worldtitle{font-size:10px}.pw-worldbar .pw-stage{min-width:76px;flex-basis:76px;padding:4px 2px}.pw-worldbar .pw-miniline{gap:5px}.pw-worldbar .pw-minilabel{font-size:9px}.pw-worldbar .pw-mini{font-size:10px;padding:5px}}@media(prefers-reduced-motion:reduce){.pw-worldbar *{transition:none!important}}';
document.head.append(css);
function readDone(){
let royal=[];try{royal=JSON.parse(localStorage.getItem('playwise-level2-royal-quest-v1')||'[]');if(!Array.isArray(royal))royal=[]}catch(e){}
const miniDone=[
royal.includes(0),
localStorage.getItem('playwise-level2-abc-puzzle-v1')==='complete',
localStorage.getItem('playwise-level2-vowels-intro-v1')==='complete',
localStorage.getItem('playwise-level2-vowels-rescue-v1')==='complete',
royal.includes(3)||localStorage.getItem('playwise-level2-vowel-mirror-v1')==='complete'
];
const stageDone=stages.map((_,i)=>i===0?miniDone[0]&&miniDone[1]:i===3?miniDone[2]&&miniDone[3]&&miniDone[4]:royal.includes(i)||i===1&&localStorage.getItem('playwise-level2-knight-shields-v1')==='complete'||i===2&&localStorage.getItem('playwise-level2-rhyming-forest-v1')==='complete');
const totalGames=miniDone.filter(Boolean).length+stageDone.slice(1,3).filter(Boolean).length+stageDone.slice(4).filter(Boolean).length;
return {miniDone,stageDone,totalGames}
}
const bar=document.createElement('nav');bar.className='pw-worldbar';bar.id='pw-world-navigation';bar.setAttribute('aria-label','ניווט עולם 2: עשר תחנות וחמישה מיני־משחקים');
const back=isMap?'index.html':'adventure-map.html';
bar.innerHTML='<div class="pw-worldtop"><a class="pw-worldreturn" href="'+back+'">'+(isMap?'🏠 לכל העולמות':'🗺️ חזרה לעולם')+'</a><span class="pw-worldtitle">🏰 PLAYWISE · מסע הממלכה הקסומה</span><span class="pw-worldcount" id="pw-worldcount">💎 0/10 · 🎮 0/13</span></div>'+
'<div class="pw-worldrail" aria-label="כל עשר התחנות">'+stages.map((s,i)=>'<a class="pw-stage'+(activeStage===i?' active':'')+'" data-world-stage="'+i+'" href="'+s[2]+'"'+(activeStage===i?' aria-current="location"':'')+' title="תחנה '+(i+1)+': '+s[1]+'"><span class="pw-stageicon">'+s[0]+'</span><span class="pw-stagetext">'+(i+1)+'. '+s[1]+'</span><span class="pw-stagecheck" hidden>✓</span></a>').join('')+'</div>'+
'<div class="pw-miniline"><span class="pw-minilabel">✨ מיני־משחקים</span><div class="pw-minirail" aria-label="מיני־משחקים של תחנות 1 ו־4">'+mini.map((m,i)=>'<a class="pw-mini'+(activeMini===i?' active':'')+'" data-world-mini="'+i+'" href="'+m[2]+'"'+(activeMini===i?' aria-current="step"':'')+'><span>'+m[0]+'</span><span>'+m[1]+'</span><span class="pw-minicheck" hidden>✓</span></a>').join('')+'</div></div>';
document.body.prepend(bar);document.body.classList.add('pw-world-withbar');
if(path==='level2-letter-gate.html')document.body.classList.add('pw-world-gate');
if(isMap)document.body.classList.add('pw-world-map');
function refresh(){try{const d=readDone();bar.querySelectorAll('[data-world-stage]').forEach(el=>{const done=d.stageDone[Number(el.dataset.worldStage)];el.classList.toggle('done',done);el.querySelector('.pw-stagecheck').hidden=!done});bar.querySelectorAll('[data-world-mini]').forEach(el=>{const done=d.miniDone[Number(el.dataset.worldMini)];el.classList.toggle('done',done);el.querySelector('.pw-minicheck').hidden=!done});bar.querySelector('#pw-worldcount').textContent='💎 '+d.stageDone.filter(Boolean).length+'/10 · 🎮 '+d.totalGames+'/13'}catch(e){}}
refresh();window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});setInterval(()=>{if(!document.hidden)refresh()},2000);
function measure(){document.body.style.setProperty('--pw-worldbar-height',Math.ceil(bar.getBoundingClientRect().height)+'px')}
measure();window.addEventListener('resize',measure);
})();
