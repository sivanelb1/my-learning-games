/* PLAYWISE · Monster Road Rally — chapter-specific 3-lane driving mini-game.
   The car moves automatically; children steer to collect each English body word.
   Obstacles cost hearts; pink ramps launch the car into a safe jump. */
(function(){
'use strict';
const W=480,H=610,LANES=3,MAX_DT=.045;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=(root,sel)=>root.querySelector(sel);
// True overhead view: equal-width lanes and objects at every depth.
const ROAD_LEFT=51,ROAD_RIGHT=429,LANE_WIDTH=(ROAD_RIGHT-ROAD_LEFT)/3;
function laneX(lane,y){return ROAD_LEFT+LANE_WIDTH*(lane+.5)}
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function poly(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath()}
function mount(opts){
 const root=opts.element,words=opts.words.map(w=>({en:w[0],he:w[1],emoji:w[2]}));
 root.innerHTML='<div class="activity-heading"><div class="mini-pill">🏎️ מירוץ המפלצת · MONSTER ROAD RALLY</div><h2>המפלצת יוצאת למסע!</h2><p>המכונית נוסעת לבד! זזים ימינה ושמאלה, מתחמקים ממכשולים, קופצים ברמפות ואוספים את כל איברי הגוף באנגלית.</p></div>'+
 '<section class="road-game" aria-label="משחק נהיגה בשלושה נתיבים">'+
 '<div class="road-hud"><div class="road-hearts" id="roadHearts" aria-label="לבבות">❤️ ❤️ ❤️</div><div class="road-score">🧩 <b id="roadScore">0 / '+words.length+'</b></div><button class="road-pause" type="button" id="roadPause" aria-label="השהיית המשחק">⏸️</button></div>'+
 '<div class="road-screen"><canvas id="roadCanvas" width="480" height="610" role="img" aria-label="כביש שלושה נתיבים עם מכונית המפלצת, איברי גוף לאיסוף, מכשולים ורמפות"></canvas>'+
 '<div class="road-float" id="roadFloat" aria-live="polite"></div>'+
 '<div class="road-overlay" id="roadOverlay"><div class="road-overlay-inner"><div class="road-overlay-emoji">🚙👾🌈</div><h3 id="roadOverlayTitle">מוכנים להרפתקה?</h3><p id="roadOverlayText">אספו את כל המילים! זוזו עם החצים במקלדת או עם הכפתורים. היזהרו מהמכשולים, וקפצו על הרמפות הוורודות!</p><button class="road-primary" type="button" id="roadAction">🚦 יוצאים לדרך!</button></div></div></div>'+
 '<div class="road-controls" dir="ltr"><button class="road-steer" id="roadLeft" type="button" aria-label="לנתיב השמאלי">⬅️ <span>שמאלה</span></button><div class="road-control-tip">🎯 אוספים מילים<br>🚧 מתחמקים<br>🌈 קופצים!</div><button class="road-steer" id="roadRight" type="button" aria-label="לנתיב הימני"><span>ימינה</span> ➡️</button></div>'+
 '<div class="road-inventory"><h3>🎒 האיברים שאספנו · <span lang="en">BODY WORDS</span></h3><div class="road-word-list" id="roadWords"></div></div>'+
 '<div class="road-help">💡 מחשב: ← → או A / D · טלפון: לחצו על החצים או החליקו על הכביש</div></section>';
 const canvas=$(root,'#roadCanvas'),ctx=canvas.getContext('2d'),screen=$(root,'.road-screen');
 const hearts=$(root,'#roadHearts'),score=$(root,'#roadScore'),inventory=$(root,'#roadWords');
 const overlay=$(root,'#roadOverlay'),overlayTitle=$(root,'#roadOverlayTitle'),overlayText=$(root,'#roadOverlayText');
 const action=$(root,'#roadAction'),pause=$(root,'#roadPause'),float=$(root,'#roadFloat');
 const left=$(root,'#roadLeft'),right=$(root,'#roadRight');
 let state='ready',lane=1,visualLane=1,lives=3,items=[],collected=new Set(),spawnCount=words.map(()=>0);
 let roadTime=0,spawnTimer=.5,anim=0,last=0,now=0,jumpUntil=0,shieldUntil=0,shakeUntil=0,flashUntil=0,flashText='',flashColor='#fff',disposed=false,winTimer=0;
 const monster=new Image();monster.src='assets/playwise-monster-3d.svg?v=approved3d1';
 const decorative=Array.from({length:16},(_,i)=>({x:i%2?455:25,y:(i*103)%610,kind:i%4}));
 const gradients={};
 function gradient(name,top,bottom){let g=gradients[name];if(!g){g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bottom);gradients[name]=g}return g}
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
   const missing=words.map((_,i)=>i).filter(i=>!collected.has(i));
   if(!missing.length)return;
   const fewest=Math.min(...missing.map(i=>spawnCount[i]));
   const pool=missing.filter(i=>spawnCount[i]===fewest);
   const wi=pool[Math.floor(Math.random()*pool.length)];
   spawnCount[wi]++;
   const pickupLane=Math.floor(rand(0,3));
   const rest=[0,1,2].filter(i=>i!==pickupLane);
   const hazardLane=rest[Math.floor(rand(0,2))];
   const rampLane=rest.find(i=>i!==hazardLane);
   const y=-55;
   items.push({type:'word',lane:pickupLane,y,wi,hit:false});
   if(roadTime>3||collected.size>0)items.push({type:'hazard',lane:hazardLane,y,variant:Math.floor(rand(0,3)),hit:false});
   if(Math.random()<.45)items.push({type:'ramp',lane:rampLane,y,hit:false});
 }
 function resetTraffic(){items=[];lane=1;visualLane=1;spawnTimer=.25;jumpUntil=0;shieldUntil=now+1.5;winTimer=0}
 function start(){
   if(state==='lost'){lives=3;resetTraffic();message('💜 ממשיכים לאסוף!','#fff');}
   else if(state==='ready'){lives=3;resetTraffic();}
   state='running';pause.textContent='⏸️';pause.setAttribute('aria-label','השהיית המשחק');hideOverlay();last=0;updateHud();
 }
 function pauseGame(){if(state==='running'){state='paused';pause.textContent='▶️';showOverlay('עצירה קטנה 💜','המפלצת מחכה לכם! מוכנים להמשיך בנסיעה?','▶️ ממשיכים לנסוע');}else if(state==='paused'){state='running';pause.textContent='⏸️';hideOverlay();last=0}}
 function won(){
   state='won';items=[];say('Great job!');showOverlay('🏆 אספנו את כל האיברים!','איזו נהיגה נהדרת! עכשיו המפלצת מוכנה לבית החולים הקסום, שבו נחזיר את האיברים החסרים.','👾 לבית החולים הקסום!');
 }
 function lost(){state='lost';showOverlay('💜 אופס, נגמרו הלבבות!','אל דאגה! כל המילים שאספתם נשמרו. אפשר להמשיך מהן עם שלושה לבבות חדשים.','🔄 ממשיכים לנסוע!')}
 function collision(obj){
   if(obj.hit||obj.lane!==lane)return;
   obj.hit=true;
   if(obj.type==='word'){
     if(!collected.has(obj.wi)){collected.add(obj.wi);const w=words[obj.wi];message('✨ '+w.en+' · '+w.he,'#fff4a4');say(w.en);updateHud();if(collected.size===words.length){winTimer=.9;shieldUntil=now+2;}}
   }else if(obj.type==='ramp'){
     jumpUntil=now+1.55;message('🌈 קפיצה קסומה!','#ffffff');say('Jump!');
   }else if(obj.type==='hazard'&&now>jumpUntil&&now>shieldUntil){
     lives--;shieldUntil=now+1.5;shakeUntil=now+.4;message('💗 זהירות!','#ffe8a1');updateHud();if(lives<=0)lost();
   }
 }
 function update(dt){
   if(state!=='running')return;
   now+=dt;roadTime+=dt;
   visualLane+=(lane-visualLane)*Math.min(1,dt*11);
   spawnTimer-=dt;
   if(spawnTimer<=0&&collected.size<words.length){spawnRow();spawnTimer=1.22+rand(0,.18);}
   const speed=265+Math.min(45,roadTime*.8);
   for(const obj of items){obj.y+=speed*dt;if(!obj.hit&&obj.y>=472&&obj.y<=505)collision(obj);}
   items=items.filter(obj=>obj.y<650&&!obj.hit);
   if(winTimer>0){winTimer-=dt;if(winTimer<=0&&state==='running')won();}
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
   const scale=.84,x=laneX(o.lane,o.y),y=o.y;
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
   const scale=.84,x=laneX(o.lane,o.y);
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
   const scale=.84,x=laneX(o.lane,o.y);
   ctx.save();ctx.translate(x,o.y);ctx.scale(scale,scale);ctx.shadowColor='#b355e9';ctx.shadowBlur=15;
   ctx.fillStyle='#ed8bfa';poly(ctx,[[-50,34],[-34,-25],[34,-25],[50,34]]);ctx.fill();
   ctx.strokeStyle='#fff6c5';ctx.lineWidth=6;ctx.stroke();
   ctx.shadowBlur=0;ctx.fillStyle='#fff6a4';ctx.font='bold 45px system-ui';ctx.textAlign='center';ctx.fillText('↑',0,19);ctx.restore();
 }
 function car(){
   // Top-down convertible: symmetric proportions, monster sitting inside.
   const x=laneX(visualLane,492);
   const jump=now<jumpUntil?Math.sin(Math.PI*clamp((jumpUntil-now)/1.55,0,1))*44:0;
   const y=490-jump;
   ctx.save();
   if(now<shakeUntil)ctx.translate(Math.sin(now*80)*7,0);
   ctx.fillStyle='#4c3b7355';ctx.beginPath();ctx.ellipse(x,506,42-jump*.13,69-jump*.16,0,0,Math.PI*2);ctx.fill();
   ctx.translate(x,y);
   if(now<shieldUntil){ctx.strokeStyle='#b5ffff';ctx.lineWidth=4;ctx.setLineDash([9,6]);ctx.beginPath();ctx.ellipse(0,0,54,85,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
   // Four wheels, seen from above.
   ctx.fillStyle='#453b63';
   for(const xx of [-46,34])for(const yy of [-48,37]){round(ctx,xx,yy,12,34,6);ctx.fill()}
   ctx.shadowColor='#62428c77';ctx.shadowBlur=12;ctx.shadowOffsetY=7;
   ctx.fillStyle='#9156d3';round(ctx,-42,-72,84,147,28);ctx.fill();
   ctx.shadowBlur=0;ctx.shadowOffsetY=0;
   ctx.fillStyle='#d5a1f5';round(ctx,-37,-67,74,138,23);ctx.fill();
   // Bonnet and dashboard, both clearly viewed from above.
   ctx.fillStyle='#f2c5ff';round(ctx,-33,-64,66,31,13);ctx.fill();
   ctx.fillStyle='#b1edff';round(ctx,-31,-27,62,42,15);ctx.fill();
   ctx.fillStyle='#6b489c';round(ctx,-31,6,62,36,17);ctx.fill();
   ctx.fillStyle='#ffe2ff';round(ctx,-27,9,54,30,14);ctx.fill();
   // The approved blue monster is visible as the driver.
   if(monster.complete&&monster.naturalWidth){
     ctx.save();ctx.beginPath();ctx.ellipse(0,7,33,40,0,0,Math.PI*2);ctx.clip();
     ctx.drawImage(monster,-36,-40,72,84);ctx.restore();
   }else{ctx.font='47px system-ui';ctx.textAlign='center';ctx.fillText('👾',0,20)}
   ctx.fillStyle='#b878e0';round(ctx,-34,41,68,27,12);ctx.fill();
   ctx.fillStyle='#fff3b0';ctx.font='25px system-ui';ctx.textAlign='center';ctx.fillText('⭐',0,63);
   ctx.fillStyle='#fff7c7';round(ctx,-35,-62,17,9,4);ctx.fill();round(ctx,18,-62,17,9,4);ctx.fill();
   ctx.fillStyle='#ff9cb7';round(ctx,-33,64,17,6,3);ctx.fill();round(ctx,16,64,17,6,3);ctx.fill();
   if(jump>0){ctx.font='27px system-ui';ctx.fillText('✨',-54,-25);ctx.fillText('✨',48,36)}
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
 function actionClick(){if(state==='won'){if(typeof opts.onComplete==='function')opts.onComplete();return}if(state==='paused')pauseGame();else start()}
 function destroy(){disposed=true;cancelAnimationFrame(anim);document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',pointerStart);canvas.removeEventListener('pointerup',pointerEnd);left.onclick=null;right.onclick=null;action.onclick=null;pause.onclick=null}
 action.onclick=actionClick;pause.onclick=pauseGame;left.onclick=()=>steer(-1);right.onclick=()=>steer(1);
 canvas.addEventListener('pointerdown',pointerStart);canvas.addEventListener('pointerup',pointerEnd);
 document.addEventListener('keydown',onKey);document.addEventListener('visibilitychange',visibility);
 updateHud();anim=requestAnimationFrame(frame);
 return {destroy,getState:()=>({state,lane,lives,collected:collected.size,total:words.length})};
}
window.PlaywiseBodyRoad={mount};
})();