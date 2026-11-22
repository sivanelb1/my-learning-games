/* PLAYWISE · Monster Road Rally — chapter-specific 3-lane driving mini-game.
   The car moves automatically; children steer to collect each English body word.
   Obstacles cost hearts; pink ramps launch the car into a safe jump. */
(function(){
'use strict';
const W=480,H=610,LANES=3,MAX_DT=.045,MIN_DRIVE_SECONDS=43;
// A five-row cycle keeps pickups special: most rows require a safe-lane decision.
const ROW_PATTERNS=['single-clear','double-clear','double-ramp','single-ramp','double-word'];
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=(root,sel)=>root.querySelector(sel);
// Perspective road narrows toward the visible horizon.
const HORIZON=143;
function roadHalf(y){return 73+159*clamp((y-HORIZON)/(H-HORIZON),0,1)}
function laneX(lane,y){return W/2+(lane-1)*roadHalf(y)*2/3}
function objectScale(y){return .35+.62*clamp((y-HORIZON)/(H-HORIZON),0,1)}
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function poly(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath()}
function mount(opts){
 const root=opts.element,words=opts.words.map(w=>({en:w[0],he:w[1],emoji:w[2]}));
 root.innerHTML='<div class="activity-heading"><div class="mini-pill">🏎️ מירוץ המכונית הקסומה · MAGIC ROAD RALLY</div><h2>יוצאים למירוץ הקסום!</h2><p>המכונית נוסעת לבד! בחרו את הנתיב הבטוח: לפעמים יש שני מכשולים, לפעמים רמפה, ורק מדי כמה שורות מופיעה מילה לאיסוף. 🚧🏎️</p></div>'+
 '<section class="road-game" aria-label="משחק נהיגה בשלושה נתיבים">'+
 '<div class="road-hud"><div class="road-hearts" id="roadHearts" aria-label="לבבות">❤️ ❤️ ❤️</div><div class="road-score">🧩 <b id="roadScore">0 / '+words.length+'</b></div><div class="road-timer" aria-label="זמן נסיעה">⏱️ <b id="roadTimer">0:00</b></div><button class="road-pause" type="button" id="roadPause" aria-label="השהיית המשחק">⏸️</button></div>'+
 '<div class="road-screen"><canvas id="roadCanvas" width="480" height="610" role="img" aria-label="כביש עם אופק, מכונית סגולה, שלושה נתיבים, איברי גוף לאיסוף, מכשולים ורמפות קופצות"></canvas>'+
 '<div class="road-float" id="roadFloat" aria-live="polite"></div>'+
 '<div class="road-overlay" id="roadOverlay"><div class="road-overlay-inner"><div class="road-overlay-emoji">🚙🌈⭐</div><h3 id="roadOverlayTitle">מוכנים להרפתקה?</h3><p id="roadOverlayText">התכוננו למסלול ארוך ומאתגר! לא בכל שורה יש מילה. הסתכלו קדימה, מצאו את הנתיב הפנוי, התחמקו משני מכשולים וקפצו על רמפות ורודות. אספו את כל איברי הגוף!</p><button class="road-primary" type="button" id="roadAction">🚦 יוצאים לדרך!</button></div></div></div>'+
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
     lives--;shieldUntil=now+1.5;shakeUntil=now+.4;message('💗 זהירות!','#ffe8a1');updateHud();if(lives<=0)lost();
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
   visualLane+=(lane-visualLane)*Math.min(1,dt*11);
   spawnTimer-=dt;
   if(spawnTimer<=0&&(collected.size<words.length||roadTime<MIN_DRIVE_SECONDS)){
     spawnRow();spawnTimer=1.26+rand(0,.12);
   }
   const seconds=Math.floor(roadTime);
   const clock=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
   if(timer.textContent!==clock)timer.textContent=clock;
   const speed=265+Math.min(45,roadTime*.8);
   for(const obj of items){obj.y+=speed*dt;if(!obj.hit&&obj.y>=472&&obj.y<=505)collision(obj);}
   items=items.filter(obj=>obj.y<650&&!obj.hit);
   if(collected.size===words.length&&roadTime>=MIN_DRIVE_SECONDS){
     if(!winTimer){winTimer=1.1;message('🏁 קו הסיום!','#fff4a4')}
     else{winTimer-=dt;if(winTimer<=0&&state==='running')won()}
   }
 }
 function backdrop(){
   // Bird's-eye parkland: no horizon, no shrinking scenery.
   ctx.fillStyle='#8ddf98';ctx.fillRect(0,0,W,H);
   ctx.fillStyle='#69c985';ctx.fillRect(0,0,ROAD_LEFT,H);
   ctx.fillRect(ROAD_RIGHT,0,W-ROAD_RIGHT,H);
   ctx.fillStyle='#c4efaa';
   for(let i=0;i<14;i++){
     const y=(i*68+roadTime*140)%760-75;
     const x=i%2?26:453;
     ctx.save();ctx.translate(x,y);
     if(i%3===0){
       ctx.fillStyle='#4ab876';ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.fill();
       ctx.fillStyle='#83e5a2';ctx.beginPath();ctx.arc(-6,-6,11,0,Math.PI*2);ctx.fill();
       ctx.fillStyle='#f8f3a7';ctx.beginPath();ctx.arc(4,-3,3.5,0,Math.PI*2);ctx.fill();
     }else{
       ctx.font='22px system-ui';ctx.textAlign='center';
       ctx.fillText(i%3===1?'🌼':'🌸',0,8);
     }
     ctx.restore();
   }
   // Repeated ground dashes reinforce the car's forward movement.
   ctx.fillStyle='#e7ffe3';ctx.globalAlpha=.58;
   for(let i=0;i<16;i++){
     const y=(i*63+roadTime*250)%670-30;
     ctx.fillRect(7,y,4,23);ctx.fillRect(W-11,y,4,23);
   }
   ctx.globalAlpha=1;
 }
 function road(){
   // Parallel borders and parallel lane dividers: fully top-down track.
   ctx.fillStyle='#ffe4a1';ctx.fillRect(ROAD_LEFT-7,0,ROAD_RIGHT-ROAD_LEFT+14,H);
   ctx.fillStyle='#8e86ad';ctx.fillRect(ROAD_LEFT,0,ROAD_RIGHT-ROAD_LEFT,H);
   ctx.fillStyle='#9e95b9';ctx.fillRect(ROAD_LEFT+8,0,ROAD_RIGHT-ROAD_LEFT-16,H);
   ctx.fillStyle='#eab7f4';ctx.fillRect(ROAD_LEFT+1,0,5,H);ctx.fillRect(ROAD_RIGHT-6,0,5,H);
   // Flat road markings scroll at the same speed as pickups and hazards.
   const offset=(roadTime*280)%104;
   ctx.fillStyle='#fff6d9';
   for(let y=-104+offset;y<H;y+=104){
     for(let k=1;k<=2;k++){
       round(ctx,ROAD_LEFT+LANE_WIDTH*k-3,y,6,51,3);ctx.fill();
     }
   }
   // Little speed flecks on the tarmac, intentionally subtle.
   ctx.fillStyle='#d7c7ee';ctx.globalAlpha=.33;
   for(let i=0;i<17;i++){
     const y=(i*57+roadTime*280)%670-30;
     const x=ROAD_LEFT+17+(i*71)%(ROAD_RIGHT-ROAD_LEFT-34);
     round(ctx,x,y,3,15,2);ctx.fill();
   }
   ctx.globalAlpha=1;
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
   // Closed-roof toy car, viewed from DIRECTLY overhead. No front-facing character.
   const x=laneX(visualLane,492);
   const jump=now<jumpUntil?Math.sin(Math.PI*clamp((jumpUntil-now)/1.55,0,1))*42:0;
   const y=490-jump;
   ctx.save();
   if(now<shakeUntil)ctx.translate(Math.sin(now*80)*7,0);
   ctx.fillStyle='#3e2f6655';ctx.beginPath();ctx.ellipse(x,508,42-jump*.15,72-jump*.2,0,0,Math.PI*2);ctx.fill();
   ctx.translate(x,y);
   if(now<shieldUntil){ctx.strokeStyle='#b5ffff';ctx.lineWidth=4;ctx.setLineDash([9,6]);ctx.beginPath();ctx.ellipse(0,0,54,86,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
   // Four symmetric wheels.
   ctx.fillStyle='#41345e';
   for(const xx of [-47,35])for(const yy of [-51,35]){round(ctx,xx,yy,12,36,6);ctx.fill()}
   ctx.shadowColor='#513b8d77';ctx.shadowBlur=13;ctx.shadowOffsetY=6;
   ctx.fillStyle='#8052c7';round(ctx,-42,-74,84,148,28);ctx.fill();
   ctx.shadowBlur=0;ctx.shadowOffsetY=0;
   ctx.fillStyle='#d6a1fb';round(ctx,-36,-69,72,138,25);ctx.fill();
   // Front bonnet and headlights at the TOP of the car.
   ctx.fillStyle='#ecb9fa';round(ctx,-32,-66,64,34,12);ctx.fill();
   ctx.fillStyle='#fff5a6';round(ctx,-33,-64,16,10,4);ctx.fill();round(ctx,17,-64,16,10,4);ctx.fill();
   // Windshield, roof, and rear window: unmistakable bird's-eye silhouette.
   ctx.fillStyle='#7550b5';round(ctx,-33,-30,66,87,21);ctx.fill();
   ctx.fillStyle='#99e6ff';round(ctx,-29,-27,58,29,10);ctx.fill();
   ctx.fillStyle='#d6a1fb';round(ctx,-28,6,56,34,13);ctx.fill();
   ctx.fillStyle='#fff2b1';ctx.font='26px system-ui';ctx.textAlign='center';ctx.fillText('⭐',0,33);
   ctx.fillStyle='#a3e6fb';round(ctx,-27,43,54,15,7);ctx.fill();
   ctx.fillStyle='#ff86b3';round(ctx,-32,62,17,8,3);ctx.fill();round(ctx,15,62,17,8,3);ctx.fill();
   // Highlights along both sides add depth without tilting the view.
   ctx.strokeStyle='#fff0ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-34,-48);ctx.lineTo(-34,41);ctx.moveTo(34,-48);ctx.lineTo(34,41);ctx.stroke();
   if(jump>0){ctx.font='27px system-ui';ctx.fillText('✨',-55,-26);ctx.fillText('✨',49,36)}
   ctx.restore();
 }
 function paint(){
   if(!ctx)return;
   ctx.clearRect(0,0,W,H);backdrop();road();
   items.sort((a,b)=>a.y-b.y).forEach(o=>{if(o.type==='word')drawWord(o);else if(o.type==='ramp')drawRamp(o);else drawHazard(o)});
   car();
   if(state==='running'&&flashUntil>now){ctx.save();ctx.globalAlpha=Math.min(1,(flashUntil-now)*2);ctx.textAlign='center';ctx.font='900 27px system-ui';ctx.shadowColor='#613e93';ctx.shadowBlur=8;ctx.fillStyle=flashColor;ctx.fillText(flashText,W/2,183);ctx.restore();}
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