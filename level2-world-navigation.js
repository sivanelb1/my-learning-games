/* PLAYWISE · embedded navigation per station, not on the world map */
(function(){
'use strict';
const filename=decodeURIComponent(location.pathname.split('/').pop()||'');
if(filename==='adventure-map.html')return;
const qs=new URLSearchParams(location.search);
const stations=[
 {title:'שער האותיות',emoji:'🍄',parts:[['🍄','שער האותיות','level2-letter-gate.html'],['🧩','פאזל ABC','level2-abc-puzzle.html']]},
 {title:'מגיני האבירים',emoji:'🛡️',parts:[['🛡️','מגיני האבירים','level2-knight-shields.html']]},
 {title:'יער החרוזים',emoji:'🦄',parts:[['🍄','להעיר את הפיות','level2-rhyming-forest.html']]},
 {title:'מראת התנועות',emoji:'🪞',parts:[['🔮','אבני הקסם','level2-vowel-gems.html'],['💎','הצלת הקריסטלים','level2-vowel-gems-b.html'],['🪞','מראת התנועות','level2-vowel-mirror.html']]},
 {title:'מערת הדרקון',emoji:'🐉',parts:[]},
 {title:'חיצי האביר',emoji:'🏹',parts:[]},
 {title:'שיקויי הפיה',emoji:'🧙‍♀️',parts:[]},
 {title:'גשר הטירה',emoji:'🏰',parts:[]},
 {title:'מפתחות האוצר',emoji:'🗝️',parts:[]},
 {title:'הכתר האבוד',emoji:'👑',parts:[]}
];
const files={
 'level2-letter-gate.html':[0,0],
 'level2-abc-puzzle.html':[0,1],
 'level2-knight-shields.html':[1,0],
 'level2-rhyming-forest.html':[2,0],
 'level2-vowel-gems.html':[3,0],
 'level2-magic-vowels.html':[3,0],
 'level2-vowel-gems-b.html':[3,1],
 'level2-vowel-mirror.html':[3,2]
};
let station=-1,part=0;
const quest=filename==='level2-quest.html';
if(quest){station=Math.max(0,Math.min(9,(Number(qs.get('stage'))||5)-1));}
else if(files[filename]){station=files[filename][0];part=files[filename][1];}
if(station<0)return;
const style=document.createElement('style');
style.id='pw-embedded-stage-style';
style.textContent="\n.pw-stage-return{position:absolute;top:10px;right:clamp(8px,1.6vw,20px);z-index:65;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:10px 17px;border:1.5px solid #c5b4f9;border-radius:26px;background:#29205edc;box-shadow:0 4px 18px #130b2d7d;color:#fff5da!important;font:bold clamp(12px,1.5vw,15px) Arial,sans-serif;text-decoration:none!important;direction:rtl;transition:background .18s}\n.pw-stage-return:hover,.pw-stage-return:focus-visible{background:#7646ae;outline:2px solid #ffe7a5;outline-offset:2px}\n.pw-embedded-nav{direction:rtl;position:relative;z-index:45;width:min(1020px,96%);margin:9px auto 19px;padding:0 4px;color:#fff;text-align:center;font-family:Arial,\"Noto Sans Hebrew\",sans-serif}\n.pw-embedded-nav .pw-embedded-label{display:inline-block;background:linear-gradient(120deg,#6541a7,#9650cc);color:#fff8e7;border-radius:15px;padding:7px 16px;font-size:clamp(12px,1.55vw,15px);font-weight:900;box-shadow:0 3px 14px #180a3c77;margin:0 auto 9px}\n.pw-embedded-nav .pw-embedded-steps{display:flex;align-items:stretch;justify-content:center;flex-wrap:wrap;gap:9px}\n.pw-embedded-nav .pw-embedded-step{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:43px;padding:10px 17px;border:2px solid #8c70bc;border-radius:18px;background:#38215dbf;color:#fff5fa;text-decoration:none;font-size:clamp(12px,1.5vw,15px);font-weight:900;box-shadow:0 3px 11px #1007265c;transition:background .18s,transform .18s}\n.pw-embedded-nav a.pw-embedded-step:hover{background:#6842a0;transform:translateY(-2px)}\n.pw-embedded-nav .pw-embedded-step.active{background:linear-gradient(115deg,#9a59e7,#b66bf4);border-color:#fff2b2;color:white;box-shadow:0 0 0 2px #bda1f27d,0 4px 15px #9c5add88}\n.pw-embedded-nav .pw-embedded-step.done{background:#236956cf;border-color:#9fe8ce}\n.pw-embedded-nav .pw-embedded-step.done.active{background:linear-gradient(115deg,#8352b9,#ac69e2);border-color:#ffe4a1}\n.pw-embedded-nav .pw-embedded-check{color:#d4ffe4;font-size:12px}\n.pw-embedded-nav .pw-embedded-step[aria-current]{cursor:default}\n.pw-embedded-nav .pw-embedded-step.pw-task{min-width:98px}\n.pw-embedded-nav .pw-embedded-step.pw-task.future{opacity:.76}\nbody.pw-stage-embedded .pw-mini-nav,body.pw-stage-embedded .mirror-route,body.pw-stage-embedded .route,body.pw-stage-embedded .pw-legacy-worldback{display:none!important}\nbody.pw-stage-embedded.pw-stage-gate .pw-embedded-nav{position:absolute;top:51px;left:50%;transform:translateX(-50%);width:min(900px,96vw);margin:0;z-index:25}\nbody.pw-stage-embedded.pw-stage-gate .pw-embedded-label{padding:4px 12px;margin-bottom:5px;font-size:12px}\nbody.pw-stage-embedded.pw-stage-gate .pw-embedded-step{min-height:33px;padding:6px 15px;border-radius:12px;font-size:13px}\nbody.pw-stage-embedded.pw-stage-quest .pw-embedded-nav{margin:0 auto 17px}\nbody.pw-stage-embedded.pw-stage-quest #game:not(.show) .pw-embedded-nav{display:none}\nbody.pw-stage-embedded:not(.pw-stage-gate)>header{padding-top:57px}\nbody.pw-stage-embedded .top .status,body.pw-stage-embedded .nav .count,body.pw-stage-embedded .nav .counter{margin-right:auto}\n@media(max-width:620px){\n.pw-stage-return{top:6px;right:6px;padding:7px 9px;font-size:11px}\n.pw-embedded-nav{width:99%;margin:7px auto 13px;padding:0}\n.pw-embedded-nav .pw-embedded-label{font-size:11px;padding:6px 11px;margin-bottom:7px}\n.pw-embedded-nav .pw-embedded-steps{gap:5px}\n.pw-embedded-nav .pw-embedded-step{font-size:11px;min-height:36px;padding:7px 8px;border-radius:12px}\n.pw-embedded-nav .pw-embedded-step.pw-task{min-width:48px;flex:1 0 48px}\nbody.pw-stage-embedded.pw-stage-gate .pw-embedded-nav{top:48px}\nbody.pw-stage-embedded.pw-stage-gate .pw-embedded-step{padding:5px 10px;min-height:30px;font-size:11px}\n}\n@media(max-height:640px){\nbody.pw-stage-embedded.pw-stage-gate .pw-embedded-nav{top:46px}\nbody.pw-stage-embedded.pw-stage-gate .pw-embedded-label{display:none}\nbody.pw-stage-embedded.pw-stage-gate .pw-embedded-step{min-height:29px;padding:4px 10px}\n}\n@media(prefers-reduced-motion:reduce){.pw-embedded-nav *, .pw-stage-return{transition:none!important}}\n";

document.head.append(style);
document.body.classList.add('pw-stage-embedded');
if(filename==='level2-letter-gate.html')document.body.classList.add('pw-stage-gate');
if(quest)document.body.classList.add('pw-stage-quest');
const returnLink=document.createElement('a');
returnLink.className='pw-stage-return';
returnLink.href='adventure-map.html';
returnLink.textContent='🗺️ חזרה לעולם';
document.body.append(returnLink);
const nav=document.createElement('nav');nav.className='pw-embedded-nav';nav.id='pw-embedded-navigation';nav.setAttribute('aria-label','מיני־משחקים של התחנה הנוכחית');
function isDone(st,p){
 try{
 const done=JSON.parse(localStorage.getItem('playwise-level2-royal-quest-v1')||'[]');
 const royal=Array.isArray(done)?done:[];
 if(st===0)return p===0?royal.includes(0):localStorage.getItem('playwise-level2-abc-puzzle-v1')==='complete';
 if(st===1)return localStorage.getItem('playwise-level2-knight-shields-v1')==='complete'||royal.includes(1);
 if(st===2)return localStorage.getItem('playwise-level2-rhyming-forest-v1')==='complete'||royal.includes(2);
 if(st===3)return p===0?localStorage.getItem('playwise-level2-vowels-intro-v1')==='complete':p===1?localStorage.getItem('playwise-level2-vowels-rescue-v1')==='complete':localStorage.getItem('playwise-level2-vowel-mirror-v1')==='complete'||royal.includes(3);
 return royal.includes(st);
 }catch(e){return false}
}
function currentQuestStage(){
 const heading=document.getElementById('title');
 const name=heading&&heading.textContent;
 if(name){const found=stations.findIndex(s=>name.startsWith(s.title));if(found>=0)return found}
 return station;
}
function update(){
 if(quest)station=currentQuestStage();
 const st=stations[station];
 if(!st)return;
 const isTasks=st.parts.length===0;
 const count=isTasks?5:st.parts.length;
 let taskIndex=0;
 if(isTasks){const match=(document.getElementById('counter')?.textContent||'').match(/(\d+)\s*\/\s*5/);taskIndex=match?Math.max(0,Math.min(4,Number(match[1])-1)):0;if(document.getElementById('win')&&!document.getElementById('win').classList.contains('hidden'))taskIndex=5;}
 nav.setAttribute('aria-label','תחנה '+(station+1)+' · '+st.title+' · '+(isTasks?'משימות':'מיני־משחקים'));
 nav.innerHTML='<div class="pw-embedded-label">'+st.emoji+' תחנה '+(station+1)+' · '+st.title+' · '+(isTasks?'5 משימות':count+' מיני־משחק'+(count>1?'ים':''))+'</div><div class="pw-embedded-steps">'+
 (isTasks?Array.from({length:5},(_,i)=>'<span class="pw-embedded-step pw-task'+(i===taskIndex?' active':i<taskIndex?' done':' future')+'"'+(i===taskIndex?' aria-current="step"':'')+'>'+(i<taskIndex?'✓ ':'')+'✨ '+(i+1)+'</span>').join(''):
 st.parts.map((m,i)=>'<a class="pw-embedded-step'+(i===part?' active':'')+(isDone(station,i)?' done':'')+'" href="'+m[2]+'"'+(i===part?' aria-current="step"':'')+'>'+m[0]+' '+m[1]+(isDone(station,i)?' <span class="pw-embedded-check">✓</span>':'')+'</a>').join(''))+
 '</div>';
}
let anchor;
if(quest){anchor=document.getElementById('game');if(anchor)anchor.prepend(nav);}
else if(filename==='level2-letter-gate.html'){anchor=document.querySelector('main.world');if(anchor)anchor.append(nav);}
else{
 const main=document.querySelector('main');
 if(main){
 const innerHeader=main.querySelector(':scope > header');
 if(innerHeader)innerHeader.after(nav);
 else main.prepend(nav);
 anchor=main;
 }
}
if(!anchor){returnLink.remove();return}
update();
window.addEventListener('storage',update);
window.addEventListener('focus',update);
if(quest){
 const title=document.getElementById('title'),counter=document.getElementById('counter');
 if(title)new MutationObserver(update).observe(title,{childList:true,characterData:true,subtree:true});
 if(counter)new MutationObserver(update).observe(counter,{childList:true,characterData:true,subtree:true});
}
})();
