/* PLAYWISE · Monster Road Rally — chapter-specific 3-lane driving mini-game.
   The car moves automatically; children steer to collect each English body word.
   Obstacles cost hearts; pink ramps launch the car into a safe jump. */
(function(){
'use strict';
const W=720,H=540,LANES=3,MAX_DT=.045,MIN_DRIVE_SECONDS=43;
// Comfort-first camera: stationary landscape, fixed horizon, even road speed.
const DRIVE_SPEED=195,ROW_INTERVAL=1.34,COLLISION_Y=432;
// A five-row cycle keeps pickups special: most rows require a safe-lane decision.
const ROW_PATTERNS=['single-clear','double-clear','double-ramp','single-ramp','double-word'];
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=(root,sel)=>root.querySelector(sel);
// Perspective road narrows toward the visible horizon.
const HORIZON=128;
function roadHalf(y){return 105+202*clamp((y-HORIZON)/(H-HORIZON),0,1)}
function laneX(lane,y){return W/2+(lane-1)*roadHalf(y)*2/3}
function objectScale(y){return .43+.62*clamp((y-HORIZON)/(H-HORIZON),0,1)}
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function poly(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath()}
function mount(opts){
 const root=opts.element,words=opts.words.map(w=>({en:w[0],he:w[1],emoji:w[2]}));
 root.innerHTML='<div class="activity-heading"><div class="mini-pill">🏎️ מירוץ המכונית הקסומה · MAGIC ROAD RALLY</div><h2>יוצאים למירוץ הקסום!</h2><p>המכונית נוסעת לבד לעבר האופק! בחרו נתיב בטוח, קפצו על הרמפות ואספו מילים. יש 3 לבבות — אחרי שלוש פגיעות מתחילים את המסלול מחדש. 🚧🏎️</p></div>'+
 '<section class="road-game" aria-label="משחק נהיגה בשלושה נתיבים">'+
 '<div class="road-hud"><div class="road-hearts" id="roadHearts" aria-label="לבבות">❤️ ❤️ ❤️</div><div class="road-score">🧩 <b id="roadScore">0 / '+words.length+'</b></div><div class="road-timer" aria-label="זמן נסיעה">⏱️ <b id="roadTimer">0:00</b></div><button class="road-pause" type="button" id="roadPause" aria-label="השהיית המשחק">⏸️</button></div>'+
 '<div class="road-screen"><canvas id="roadCanvas" width="720" height="540" role="img" aria-label="כביש עם אופק, מכונית סגולה, שלושה נתיבים, איברי גוף לאיסוף, מכשולים ורמפות קופצות"></canvas>'+
 '<div class="road-float" id="roadFloat" aria-live="polite"></div>'+
 '<div class="road-overlay" id="roadOverlay"><div class="road-overlay-inner"><div class="road-overlay-emoji">🚙🌈⭐</div><h3 id="roadOverlayTitle">מוכנים להרפתקה?</h3><p id="roadOverlayText">התכוננו למסלול ארוך ומאתגר! לא בכל שורה יש מילה. מצאו את הנתיב הפנוי והתחמקו ממכשולים. רמפה ורודה מקפיצה את המכונית גבוה באוויר! יש 3 לבבות, ואם הם נגמרים מתחילים מחדש.</p><button class="road-primary" type="button" id="roadAction">🚦 יוצאים לדרך!</button></div></div></div>'+
 '<div class="road-controls" dir="ltr"><button class="road-steer" id="roadLeft" type="button" aria-label="לנתיב השמאלי">⬅️ <span>שמאלה</span></button><div class="road-control-tip">🎯 אוספים מילים<br>🚧 מתחמקים<br>🌈 קופצים!</div><button class="road-steer" id="roadRight" type="button" aria-label="לנתיב הימני"><span>ימינה</span> ➡️</button></div>'+
 '<div class="road-inventory"><h3>🎒 האיברים שאספנו · <span lang="en">BODY WORDS</span></h3><div class="road-word-list" id="roadWords"></div></div>'+
 '<div class="road-help">💡 מחשב: ← → או A / D · טלפון: לחצו על החצים או החליקו על הכביש</div></section>';
 const canvas=$(root,'#roadCanvas'),ctx=canvas.getContext('2d'),screen=$(root,'.road-screen');
 const hearts=$(root,'#roadHearts'),score=$(root,'#roadScore'),timer=$(root,'#roadTimer'),inventory=$(root,'#roadWords');
 const overlay=$(root,'#roadOverlay'),overlayTitle=$(root,'#roadOverlayTitle'),overlayText=$(root,'#roadOverlayText');
 const action=$(root,'#roadAction'),pause=$(root,'#roadPause'),float=$(root,'#roadFloat');
 const left=$(root,'#roadLeft'),right=$(root,'#roadRight');
 let state='ready',lane=1,visualLane=1,lives=3,items=[],collected=new Set(),spawnCount=words.map(()=>0),rowIndex=0;
 let roadTime=0,spawnTimer=.5,anim=0,last=0,now=0,jumpUntil=0,jumpStart=0,shieldUntil=0,shakeUntil=0,flashUntil=0,flashText='',flashColor='#fff',disposed=false,winTimer=0,restartCountdown=0;
 function updateHud(){
   hearts.textContent='❤️ '.repeat(lives)+'🤍 '.repeat(3-lives);
   score.textContent=collected.size+' / '+words.length;
   inventory.innerHTML=words.map((w,i)=>'<span class="road-word '+(collected.has(i)?'found':'')+'" lang="en">'+(collected.has(i)?w.emoji:'🔒')+' '+w.en+(collected.has(i)?' ✓':'')+'</span>').join('');
 }
 function say(en){if(typeof opts.speak==='function')opts.speak(en)}
 function message(t,color){flashText=t;flashColor=color||'#fff';flashUntil=now+1.5;float.textContent=t;float.classList.add('visible');float.style.color=flashColor}
 function showOverlay(title,description,buttonText){overlayTitle.textContent=title;overlayText.textContent=description;action.textContent=buttonText;overlay.hidden=false}
 function hideOverlay(){overlay.hidden=true}
 function steer(d){if(state!=='running')return;lane=clamp(lane+d,0,2)}
 function spawnRow(){
   // The player can always pass safely: never fill all three lanes with hazards.
   // Each five-row set contains only ONE word; other rows are tactical challenges.
   const pattern=ROW_PATTERNS[rowIndex++%ROW_PATTERNS.length];
   const all=[0,1,2],main=Math.floor(rand(0,LANES));
   const other=all.filter(l=>l!==main);
   const y=HORIZON+3;
   const obstacle=l=>items.push({type:'hazard',lane:l,y,variant:Math.floor(rand(0,3)),hit:false});
   const ramp=l=>items.push({type:'ramp',lane:l,y,hit:false});
   if(pattern==='single-clear'){obstacle(main);return}
   if(pattern==='single-ramp'){obstacle(main);ramp(other[Math.floor(rand(0,2))]);return}
   // A single open lane, ramp, or word is flanked by two hazards.
   obstacle(other[0]);obstacle(other[1]);
   if(pattern==='double-ramp'){ramp(main);return}
   if(pattern==='double-word'&&collected.size<words.length){
     const missing=words.map((_,i)=>i).filter(i=>!collected.has(i));
     const fewest=Math.min(...missing.map(i=>spawnCount[i]));
     const pool=missing.filter(i=>spawnCount[i]===fewest);
     const wi=pool[Math.floor(rand(0,pool.length))];
     spawnCount[wi]++;
     items.push({type:'word',lane:main,y,wi,hit:false});
   }
 }
 function resetTraffic(){
   items=[];lane=1;visualLane=1;spawnTimer=.4;jumpUntil=0;jumpStart=0;
   shieldUntil=now+1.6;shakeUntil=0;winTimer=0;
 }
 function resetRun(){
   // Third hit means a fresh attempt: reset words, row pattern, distance and timer.
   collected=new Set();spawnCount=words.map(()=>0);rowIndex=0;
   roadTime=0;now=0;restartCountdown=0;flashUntil=0;
   lives=3;timer.textContent='0:00';resetTraffic();updateHud();
 }
 function start(){
   if(state==='ready')resetRun();
   state='running';pause.textContent='⏸️';pause.setAttribute('aria-label','השהיית המשחק');
   hideOverlay();last=0;updateHud();
 }
 function pauseGame(){if(state==='running'){state='paused';pause.textContent='▶️';showOverlay('עצירה קטנה 💜','המכונית מחכה לכם! מוכנים להמשיך בנסיעה?','▶️ ממשיכים לנסוע');}else if(state==='paused'){state='running';pause.textContent='⏸️';hideOverlay();last=0}}
 function won(){
   state='won';items=[];say('Great job!');showOverlay('🏆 אספנו את כל האיברים!','איזו נהיגה נהדרת! עכשיו המפלצת מוכנה לבית החולים הקסום, שבו נחזיר את האיברים החסרים.','👾 לבית החולים הקסום!');
 }
 function lost(){state='restarting';restartCountdown=2.6;showOverlay('💜 נגמרו שלושת הלבבות!','מתחילים מחדש: כל המילים, הזמן והמסלול מתאפסים. יוצאים שוב לדרך בעוד רגע!','🔄 מתחילים מחדש עכשיו!')}
 function collision(obj){
   if(obj.hit||obj.lane!==lane)return;
   obj.hit=true;
   if(obj.type==='word'){
     if(!collected.has(obj.wi)){collected.add(obj.wi);const w=words[obj.wi];message('✨ '+w.en+' · '+w.he,'#fff4a4');say(w.en);updateHud();if(collected.size===words.length){shieldUntil=now+1.5;}}
   }else if(obj.type==='ramp'){
     jumpStart=now;jumpUntil=now+1.65;shieldUntil=Math.max(shieldUntil,jumpUntil);message('🌈 וואו! המכונית קופצת!','#ffffff');say('Jump!');
   }else if(obj.type==='hazard'&&now>jumpUntil&&now>shieldUntil){
     lives--;shieldUntil=now+1.5;shakeUntil=0;message('💗 זהירות!','#ffe8a1');updateHud();if(lives<=0)lost();
   }
 }
 function update(dt){
   if(state==='restarting'){
     restartCountdown-=dt;
     if(restartCountdown<=0){resetRun();start()}
     return;
   }
   if(state!=='running')return;
   now+=dt;roadTime+=dt;
   // Smooth lane change, with a stable camera and no sideways screen movement.
   visualLane+=(lane-visualLane)*Math.min(1,dt*8);
   spawnTimer-=dt;
   if(spawnTimer<=0&&(collected.size<words.length||roadTime<MIN_DRIVE_SECONDS)){
     spawnRow();spawnTimer=ROW_INTERVAL;
   }
   const seconds=Math.floor(roadTime);
   const clock=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
   if(timer.textContent!==clock)timer.textContent=clock;
   // Constant velocity: no acceleration, pulses, or zooming of the camera.
   for(const obj of items){obj.y+=DRIVE_SPEED*dt;if(!obj.hit&&obj.y>=COLLISION_Y-12&&obj.y<=COLLISION_Y+13)collision(obj);}
   items=items.filter(obj=>obj.y<H+75&&!obj.hit);
   if(collected.size===words.length&&roadTime>=MIN_DRIVE_SECONDS){
     if(!winTimer){winTimer=1.1;message('🏁 קו הסיום!','#fff4a4')}
     else{winTimer-=dt;if(winTimer<=0&&state==='running')won()}
   }
 }
 function backdrop(){
   // Completely STATIONARY scenery: no flowers/trees rushing at the player.
   ctx.fillStyle='#a5e4ff';ctx.fillRect(0,0,W,H);
   ctx.fillStyle='#f8fdff';ctx.globalAlpha=.85;
   for(const [x,y,w] of [[95,47,52],[242,83,38],[535,51,52],[666,94,38]]){
     ctx.beginPath();ctx.ellipse(x,y,w,13,0,0,Math.PI*2);ctx.fill();
     ctx.beginPath();ctx.ellipse(x-10,y-8,w*.47,16,0,0,Math.PI*2);ctx.fill();
   }
   ctx.globalAlpha=1;
   ctx.fillStyle='#b5eab7';
   ctx.beginPath();ctx.moveTo(0,HORIZON+34);
   ctx.bezierCurveTo(100,94,177,95,270,HORIZON+26);
   ctx.bezierCurveTo(388,83,466,96,548,HORIZON+25);
   ctx.bezierCurveTo(626,102,675,114,W,HORIZON+20);
   ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
   ctx.fillStyle='#83d69a';ctx.fillRect(0,HORIZON+45,W,H-HORIZON-45);
   // Static garden ornaments beside the track. Never wrap, bob, or scroll.
   for(const [x,y,kind,size] of [[38,245,0,.85],[678,270,0,.8],[24,460,0,1.15],[692,465,0,1.15],[78,354,1,.8],[647,380,2,.85],[95,196,2,.58],[628,207,1,.65]]){
     ctx.save();ctx.translate(x,y);ctx.scale(size,size);
     if(kind===0){
       ctx.fillStyle='#448e66';round(ctx,-4,-1,8,35,4);ctx.fill();
       ctx.fillStyle='#49b978';ctx.beginPath();ctx.arc(0,-17,22,0,Math.PI*2);ctx.fill();
       ctx.fillStyle='#91e9a7';ctx.beginPath();ctx.arc(-6,-24,10,0,Math.PI*2);ctx.fill();
     }else{ctx.font='28px system-ui';ctx.textAlign='center';ctx.fillText(kind===1?'🌷':'🌼',0,8)}
     ctx.restore();
   }
 }
 function road(){
   const top=roadHalf(HORIZON),bottom=roadHalf(H);
   ctx.fillStyle='#fff0b5';
   poly(ctx,[[W/2-top-7,HORIZON],[W/2+top+7,HORIZON],[W/2+bottom+8,H],[W/2-bottom-8,H]]);ctx.fill();
   ctx.fillStyle='#9b92b5';
   poly(ctx,[[W/2-top,HORIZON],[W/2+top,HORIZON],[W/2+bottom,H],[W/2-bottom,H]]);ctx.fill();
   ctx.fillStyle='#8f87aa';
   poly(ctx,[[W/2-top+5,HORIZON],[W/2+top-5,HORIZON],[W/2+bottom-7,H],[W/2-bottom+7,H]]);ctx.fill();
   ctx.strokeStyle='#eab2ee';ctx.lineWidth=4;
   ctx.beginPath();ctx.moveTo(W/2-top,HORIZON);ctx.lineTo(W/2-bottom,H);
   ctx.moveTo(W/2+top,HORIZON);ctx.lineTo(W/2+bottom,H);ctx.stroke();
   // Only a few lane dashes, scrolling gently at exactly the same speed as objects.
   const gap=142,dash=65,offset=(roadTime*DRIVE_SPEED)%gap;
   ctx.strokeStyle='#fff8e5';ctx.lineCap='round';
   for(let y=HORIZON-gap+offset;y<H;y+=gap){
     const y1=Math.max(HORIZON,y),y2=Math.min(H,y+dash);
     if(y2<=HORIZON)continue;
     for(const k of [-1,1]){
       ctx.lineWidth=3+2*clamp((y2-HORIZON)/(H-HORIZON),0,1);
       ctx.beginPath();ctx.moveTo(W/2+k*roadHalf(y1)/3,y1);
       ctx.lineTo(W/2+k*roadHalf(y2)/3,y2);ctx.stroke();
     }
   }
 }
 function drawWord(o){
   const scale=objectScale(o.y),x=laneX(o.lane,o.y),y=o.y;
   ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
   ctx.shadowColor='#ffef86';ctx.shadowBlur=22;
   ctx.fillStyle='#fff1a9';ctx.beginPath();ctx.ellipse(0,0,58,48,0,0,Math.PI*2);ctx.fill();
   ctx.shadowBlur=0;ctx.strokeStyle='#f5a849';ctx.lineWidth=5;ctx.stroke();
   ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,-4,49,39,0,0,Math.PI*2);ctx.fill();
   ctx.font='31px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(words[o.wi].emoji,0,-13);
   ctx.fillStyle='#5b3886';ctx.font='900 15px system-ui';ctx.fillText(words[o.wi].en,0,20);
   ctx.restore();
 }
 function drawHazard(o){
   const scale=objectScale(o.y),x=laneX(o.lane,o.y);
   ctx.save();ctx.translate(x,o.y);ctx.scale(scale,scale);
   ctx.shadowColor='#4d36547a';ctx.shadowBlur=10;ctx.shadowOffsetY=6;
   if(o.variant===0){
     ctx.fillStyle='#ff963c';poly(ctx,[[-38,32],[0,-49],[38,32]]);ctx.fill();
     ctx.fillStyle='#fff9e2';poly(ctx,[[-22,1],[22,1],[29,16],[-29,16]]);ctx.fill();
     ctx.fillStyle='#aa5671';round(ctx,-43,30,86,13,5);ctx.fill();
   }else if(o.variant===1){
     ctx.fillStyle='#ae7b57';round(ctx,-38,-37,76,76,10);ctx.fill();ctx.strokeStyle='#ffe0a2';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-27,-25);ctx.lineTo(27,25);ctx.moveTo(27,-25);ctx.lineTo(-27,25);ctx.stroke();
   }else{
     ctx.fillStyle='#6bc6ef';ctx.beginPath();ctx.ellipse(0,10,48,25,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d5f8ff';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#f6ffff';ctx.beginPath();ctx.ellipse(-14,3,15,5,-.3,0,Math.PI*2);ctx.fill();
   }
   ctx.restore();
 }
 function drawRamp(o){
   const scale=objectScale(o.y),x=laneX(o.lane,o.y);
   ctx.save();ctx.translate(x,o.y);ctx.scale(scale,scale);ctx.shadowColor='#b355e9';ctx.shadowBlur=15;
   ctx.fillStyle='#ed8bfa';poly(ctx,[[-50,34],[-34,-25],[34,-25],[50,34]]);ctx.fill();
   ctx.strokeStyle='#fff6c5';ctx.lineWidth=6;ctx.stroke();
   ctx.shadowBlur=0;ctx.fillStyle='#fff6a4';ctx.font='bold 45px system-ui';ctx.textAlign='center';ctx.fillText('↑',0,19);ctx.restore();
 }
 function car(){
   // Cheerful purple rear-view car, facing forward toward the horizon.
   const x=laneX(visualLane,COLLISION_Y);
   const duration=1.65;
   const progress=clamp((now-jumpStart)/duration,0,1);
   const airborne=now<jumpUntil&&now>=jumpStart;
   // Parabolic flight: the car visibly takes off, soars and lands.
   const lift=airborne?Math.sin(Math.PI*progress)*68:0;
   const grow=airborne?1+Math.sin(Math.PI*progress)*.09:1;
   const y=448-lift;
   ctx.save();
   // The car stays visually steady even when a heart is lost.
   // The shadow stays ON THE ROAD as the car rises above it.
   ctx.fillStyle='rgba(58,37,94,'+(.32-lift/700)+')';
   ctx.beginPath();ctx.ellipse(x,503,48-lift*.17,14-lift*.035,0,0,Math.PI*2);ctx.fill();
   if(airborne&&lift>12){
     ctx.save();ctx.textAlign='center';ctx.font='23px system-ui';
     ctx.globalAlpha=.8;ctx.fillText('✨',x-38,y+80);ctx.fillText('✨',x+38,y+105);
     ctx.globalAlpha=.55;ctx.fillText('💨',x,y+105);ctx.restore();
   }
   ctx.translate(x,y);ctx.scale(grow,grow);
   // Keep the vehicle upright throughout the jump (no camera tilt).
   if(now<shieldUntil){
     ctx.strokeStyle='#d1ffff';ctx.lineWidth=4;ctx.setLineDash([9,6]);
     ctx.beginPath();ctx.ellipse(0,8,58,79,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
   }
   // Side wheels, rounded body and bright back window.
   ctx.fillStyle='#44375c';
   for(const xx of [-51,37])for(const yy of [-32,34]){round(ctx,xx,yy,14,31,6);ctx.fill()}
   ctx.shadowColor='#59348688';ctx.shadowBlur=12;ctx.shadowOffsetY=7;
   ctx.fillStyle='#7d4fc5';round(ctx,-47,-59,94,123,27);ctx.fill();
   ctx.shadowBlur=0;ctx.shadowOffsetY=0;
   ctx.fillStyle='#c987f2';round(ctx,-40,-54,80,111,23);ctx.fill();
   ctx.fillStyle='#895bc3';round(ctx,-34,-50,68,65,20);ctx.fill();
   ctx.fillStyle='#a7e8ff';round(ctx,-30,-43,60,33,13);ctx.fill();
   ctx.fillStyle='#e4b7fb';round(ctx,-28,-1,56,30,13);ctx.fill();
   ctx.fillStyle='#ffdf72';ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText('⭐',0,47);
   ctx.fillStyle='#fff2a1';round(ctx,-37,-56,20,11,5);ctx.fill();round(ctx,17,-56,20,11,5);ctx.fill();
   ctx.fillStyle='#ff8cb8';round(ctx,-36,52,20,9,4);ctx.fill();round(ctx,16,52,20,9,4);ctx.fill();
   if(airborne&&lift>25){ctx.font='25px system-ui';ctx.fillText('✦',-61,-38);ctx.fillText('✦',55,26)}
   ctx.restore();
 }
 function paint(){
   if(!ctx)return;
   ctx.clearRect(0,0,W,H);backdrop();road();
   items.sort((a,b)=>a.y-b.y).forEach(o=>{if(o.type==='word')drawWord(o);else if(o.type==='ramp')drawRamp(o);else drawHazard(o)});
   car();
   if(state==='running'&&flashUntil>now){ctx.save();ctx.globalAlpha=Math.min(1,(flashUntil-now)*2);ctx.textAlign='center';ctx.font='900 26px system-ui';ctx.shadowColor='#613e93';ctx.shadowBlur=8;ctx.fillStyle=flashColor;ctx.fillText(flashText,W/2,176);ctx.restore();}
 }
 function frame(t){if(disposed)return;if(!last)last=t;const dt=clamp((t-last)/1000,0,MAX_DT);last=t;if(!document.hidden)update(dt);paint();anim=requestAnimationFrame(frame)}
 function onKey(e){if(!root.isConnected||state!=='running')return;const k=e.key;if(['ArrowLeft','ArrowRight','a','A','d','D'].includes(k)){e.preventDefault();steer(k==='ArrowLeft'||k==='a'||k==='A'?-1:1)}}
 let startTouch=null;
 function pointerStart(e){startTouch={x:e.clientX,y:e.clientY}}
 function pointerEnd(e){if(!startTouch)return;const dx=e.clientX-startTouch.x;startTouch=null;if(state!=='running')return;if(Math.abs(dx)>20)steer(dx<0?-1:1);else{const rect=canvas.getBoundingClientRect();steer(e.clientX<rect.left+rect.width/2?-1:1)}}
 function visibility(){if(document.hidden&&state==='running')pauseGame()}
 function actionClick(){if(state==='won'){if(typeof opts.onComplete==='function')opts.onComplete();return}if(state==='restarting'){resetRun();start();return}if(state==='paused')pauseGame();else start()}
 function destroy(){disposed=true;cancelAnimationFrame(anim);document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',pointerStart);canvas.removeEventListener('pointerup',pointerEnd);left.onclick=null;right.onclick=null;action.onclick=null;pause.onclick=null}
 action.onclick=actionClick;pause.onclick=pauseGame;left.onclick=()=>steer(-1);right.onclick=()=>steer(1);
 canvas.addEventListener('pointerdown',pointerStart);canvas.addEventListener('pointerup',pointerEnd);
 document.addEventListener('keydown',onKey);document.addEventListener('visibilitychange',visibility);
 updateHud();anim=requestAnimationFrame(frame);
 return {destroy,getState:()=>({state,lane,lives,collected:collected.size,total:words.length,rowIndex,roadTime,jumpRemaining:Math.max(0,jumpUntil-now),items:items.map(o=>({type:o.type,lane:o.lane,wi:o.wi,y:o.y}))})};
}
window.PlaywiseBodyRoad={mount};
})();