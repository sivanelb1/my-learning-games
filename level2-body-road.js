/* PLAYWISE · Monster Road Rally — chapter-specific 3-lane driving mini-game.
   The car moves automatically; children steer to collect each English body word.
   Obstacles cost hearts; pink ramps launch the car into a safe jump. */
(function(){
'use strict';
const W=480,H=610,LANES=3,MAX_DT=.045;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=(root,sel)=>root.querySelector(sel);
function roadHalf(y){return 60+170*clamp((y-65)/545,0,1)}
function laneX(lane,y){return W/2+(lane-1)*roadHalf(y)*2/3}
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
   const y=72;
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
     if(!collected.has(obj.wi)){collected.add(obj.wi);const w=words[obj.wi];message('✨ '+w.en+' · '+w.he,'#fff4a4');say(w.en);updateHud();if(collected.size===words.length)winTimer=.9;}
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
   if(spawnTimer<=0&&collected.size<words.length){spawnRow();spawnTimer=1.42+rand(0,.24);}
   const speed=150+Math.min(38,roadTime*.5);
   for(const obj of items){obj.y+=speed*dt;if(!obj.hit&&obj.y>=472&&obj.y<=505)collision(obj);}
   items=items.filter(obj=>obj.y<650&&!obj.hit);
   if(winTimer>0){winTimer-=dt;if(winTimer<=0&&state==='running')won();}
 }
 function backdrop(){
   ctx.fillStyle=gradient('sky','#8bd5ff','#d9f7ff');ctx.fillRect(0,0,W,H);
   ctx.fillStyle='#fffdf9';
   for(let i=0;i<5;i++){const x=(i*127+20)%W,y=32+(i%3)*25;ctx.globalAlpha=.72;ctx.beginPath();ctx.ellipse(x,y,25,10,0,0,Math.PI*2);ctx.ellipse(x+15,y-5,18,13,0,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
   ctx.fillStyle='#a6e8bb';ctx.beginPath();ctx.moveTo(0,115);ctx.quadraticCurveTo(80,45,170,118);ctx.quadraticCurveTo(290,44,385,117);ctx.quadraticCurveTo(440,70,480,108);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
   ctx.fillStyle=gradient('grass','#8fdf92','#50b977');ctx.fillRect(0,130,W,H-130);
   for(const d of decorative){
     const y=(d.y+roadTime*95)%660-30,x=d.x+(d.kind%2?randStable(d.kind)*8:-randStable(d.kind)*8);
     ctx.save();ctx.translate(x,y);
     if(d.kind===0||d.kind===1){ctx.fillStyle='#3d9c68';ctx.fillRect(-4,-6,8,25);ctx.fillStyle=d.kind?'#46c48b':'#64ce91';ctx.beginPath();ctx.arc(0,-14,18,0,Math.PI*2);ctx.arc(-12,-3,12,0,Math.PI*2);ctx.arc(11,-3,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0a4';ctx.beginPath();ctx.arc(-4,-14,4,0,Math.PI*2);ctx.fill()}
     else{ctx.fillStyle='#fdf8ab';ctx.font='27px system-ui';ctx.textAlign='center';ctx.fillText(d.kind===2?'🌸':'⭐',0,10)}
     ctx.restore();
   }
 }
 function randStable(n){return Math.sin(n*15.37)}
 function road(){
   const top=65,bottom=H;
   ctx.fillStyle='#fdf3b4';poly(ctx,[[W/2-72,top],[W/2+72,top],[W/2+239,bottom],[W/2-239,bottom]]);ctx.fill();
   ctx.fillStyle=gradient('road','#9d95bd','#777293');poly(ctx,[[W/2-60,top],[W/2+60,top],[W/2+230,bottom],[W/2-230,bottom]]);ctx.fill();
   ctx.strokeStyle='#f7cbe9';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(W/2-60,top);ctx.lineTo(W/2-230,bottom);ctx.moveTo(W/2+60,top);ctx.lineTo(W/2+230,bottom);ctx.stroke();
   const travel=(roadTime*150)%110;
   for(let y=top-110+travel;y<H;y+=110){
     const y1=Math.max(top,y),y2=Math.min(H,y+47+(y/610)*19);if(y2<top||y1>=H)continue;
     for(const k of [-1,1]){
       ctx.strokeStyle='#fff8e7';ctx.lineWidth=2.5+5*(y1/H);ctx.lineCap='round';ctx.beginPath();
       ctx.moveTo(W/2+k*roadHalf(y1)/3,y1);ctx.lineTo(W/2+k*roadHalf(y2)/3,y2);ctx.stroke();
     }
   }
   for(let i=0;i<7;i++){
     const y=(i*119+roadTime*150)%680-30;
     if(y<65||y>H)continue;
     const x=W/2-roadHalf(y)-17;
     ctx.font=(12+y/65)+'px system-ui';ctx.textAlign='center';ctx.fillText(i%2?'🌼':'🌷',x,y);ctx.fillText(i%2?'⭐':'🌸',W-x,y);
   }
 }
 function drawWord(o){
   const t=clamp((o.y-65)/545,0,1),scale=.45+t*.8,x=laneX(o.lane,o.y),y=o.y;
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
   const t=clamp((o.y-65)/545,0,1),scale=.4+t*.9,x=laneX(o.lane,o.y);
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
   const t=clamp((o.y-65)/545,0,1),scale=.4+t*.85,x=laneX(o.lane,o.y);
   ctx.save();ctx.translate(x,o.y);ctx.scale(scale,scale);ctx.shadowColor='#b355e9';ctx.shadowBlur=15;
   ctx.fillStyle='#ed8bfa';poly(ctx,[[-50,34],[-34,-25],[34,-25],[50,34]]);ctx.fill();
   ctx.strokeStyle='#fff6c5';ctx.lineWidth=6;ctx.stroke();
   ctx.shadowBlur=0;ctx.fillStyle='#fff6a4';ctx.font='bold 45px system-ui';ctx.textAlign='center';ctx.fillText('↑',0,19);ctx.restore();
 }
 function car(){
   const x=laneX(visualLane,492),jump=now<jumpUntil?Math.sin(Math.PI*clamp((jumpUntil-now)/1.55,0,1))*44:0;
   const y=490-jump;
   ctx.save();if(now<shakeUntil)ctx.translate(Math.sin(now*80)*7,0);
   ctx.fillStyle='#453e6b44';ctx.beginPath();ctx.ellipse(x,553,54-jump*.15,13,0,0,Math.PI*2);ctx.fill();
   ctx.translate(x,y);
   if(now<shieldUntil){ctx.strokeStyle='#b2f7ff';ctx.lineWidth=4;ctx.setLineDash([9,6]);ctx.beginPath();ctx.ellipse(0,-12,61,84,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
   ctx.fillStyle='#413267';round(ctx,-51,10,19,46,7);ctx.fill();round(ctx,32,10,19,46,7);ctx.fill();
   ctx.fillStyle='#7a56b8';round(ctx,-47,-21,94,86,25);ctx.fill();
   ctx.fillStyle='#e9b5ff';round(ctx,-41,-23,82,70,22);ctx.fill();
   ctx.fillStyle='#9feaff';round(ctx,-34,-17,68,35,13);ctx.fill();
   if(monster.complete&&monster.naturalWidth){ctx.save();ctx.beginPath();ctx.rect(-38,-95,76,100);ctx.clip();ctx.drawImage(monster,-43,-99,86,100);ctx.restore();}
   else{ctx.font='67px system-ui';ctx.textAlign='center';ctx.fillText('👾',0,-22)}
   ctx.fillStyle='#e7a4fa';round(ctx,-46,7,92,55,18);ctx.fill();
   ctx.fillStyle='#b36cde';round(ctx,-46,35,92,24,12);ctx.fill();
   ctx.fillStyle='#ffe48a';round(ctx,-37,47,23,11,5);ctx.fill();round(ctx,14,47,23,11,5);ctx.fill();
   ctx.fillStyle='#fff4b4';ctx.font='27px system-ui';ctx.textAlign='center';ctx.fillText('⭐',0,38);
   ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-28,8,6,0,Math.PI*2);ctx.arc(28,8,6,0,Math.PI*2);ctx.fill();
   if(jump>0){ctx.fillStyle='#fff7ad';ctx.font='28px system-ui';ctx.fillText('✨',-52,12);ctx.fillText('✨',49,-38)}
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