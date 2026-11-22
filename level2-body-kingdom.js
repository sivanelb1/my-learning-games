/* PLAYWISE · Human Body Kingdom: learn → match → monster hospital ×3 + finale */
(function(){
'use strict';
const CHAPTERS=[
 {title:'סודות הפנים',emoji:'😊',en:'Face Secrets',words:[
  ['HEAD','ראש','🧑',50,22],['HAIR','שיער','💇',50,11],['EYES','עיניים','👀',39,28],['EARS','אוזניים','👂',23,29],['NOSE','אף','👃',52,31],['MOUTH','פה','👄',50,38]]},
 {title:'הגוף בתנועה',emoji:'🙌',en:'Move Your Body',words:[
  ['HAND','יד','✋',17,60],['ARM','זרוע','💪',24,48],['FINGER','אצבע','☝️',13,66],['LEG','רגל','🦵',39,81],['FOOT','כף רגל','🦶',37,94]]},
 {title:'מעבדת הגוף',emoji:'🧪',en:'Magic Body Lab',words:[
  ['TEETH','שיניים','🦷',50,36],['TONGUE','לשון','👅',58,39],['HEART','לב','❤️',43,56],['BRAIN','מוח','🧠',51,19],['BONE','עצם','🦴',61,77]]}
];
const ALL=CHAPTERS.flatMap(c=>c.words);
const AWARDS='playwise-body-kingdom-awards-v1';
const COMPLETE='playwise-world-body-complete-v1';
const $=id=>document.getElementById(id);
let awards={chapters:[false,false,false],final:false};
try{const saved=JSON.parse(localStorage.getItem(AWARDS)||'{}');if(Array.isArray(saved.chapters))awards.chapters=awards.chapters.map((_,i)=>saved.chapters[i]===true);awards.final=saved.final===true}catch(e){}
let chapter=0,phase='learn',sound=true,selected=-1,seen=[new Set(),new Set(),new Set()],matched=[new Set(),new Set(),new Set()],maxStep=[0,0,0],caseList=[],caseIndex=0,caseStars=0,caseFinal=false,caseLocked=false,activePointer=null;
const stages=['learn','match','hospital'];
function saveAwards(){try{localStorage.setItem(AWARDS,JSON.stringify(awards))}catch(e){}}
function speak(word){if(!sound||!('speechSynthesis' in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(word);u.lang='en-US';u.rate=.79;u.pitch=1.07;speechSynthesis.speak(u)}catch(e){}}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function avatarSvg(){return `<svg viewBox="0 0 320 460" role="img" aria-label="ילד מצויר חייכן עם גוף מאוזן ואיברים ברורים" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="pwSkin" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#ffe6c6"/><stop offset="1" stop-color="#f5b995"/></linearGradient>
<linearGradient id="pwShirt" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a2e5d9"/><stop offset="1" stop-color="#65c5ba"/></linearGradient>
<linearGradient id="pwHair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#79558d"/><stop offset="1" stop-color="#4c386b"/></linearGradient>
</defs>
<ellipse cx="160" cy="440" rx="98" ry="11" fill="#9b80bd" opacity=".2"/>
<!-- legs: matching lengths and natural width -->
<path d="M122 307 L122 391 Q122 404 135 407 L148 407 Q156 402 157 389 L159 335 L164 335 L165 389 Q167 405 179 408 L193 407 Q204 401 202 389 L199 307 Z" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3" stroke-linejoin="round"/>
<path d="M121 308 Q158 301 200 308 L202 344 Q184 350 166 346 L160 331 L154 346 Q135 350 120 344 Z" fill="#8272d1" stroke="#6c5eb7" stroke-width="3" stroke-linejoin="round"/>
<path d="M121 341 Q139 348 155 344 M166 345 Q184 348 202 342" stroke="#b3a8ee" stroke-width="3" fill="none"/>
<!-- socks and friendly sneakers -->
<path d="M123 391 L155 391 L155 408 L121 408 Z M167 391 L199 391 L199 408 L166 408 Z" fill="#fff8e9"/>
<path d="M122 402 Q112 402 107 418 Q106 429 124 432 L155 432 Q165 427 158 414 L152 405 Z" fill="#ffb2b8" stroke="#c87d9b" stroke-width="3"/>
<path d="M167 414 Q166 427 175 432 L206 432 Q223 429 215 417 Q210 405 198 402 L173 405 Z" fill="#ffb2b8" stroke="#c87d9b" stroke-width="3"/>
<path d="M111 423 L157 423 M171 423 L213 423" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
<!-- arms behind shirt, slightly outstretched -->
<path d="M116 205 Q96 205 88 224 L61 289 Q55 304 68 310 Q81 314 88 300 L119 247 Z" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3"/>
<path d="M205 205 Q225 205 233 224 L259 289 Q266 305 252 310 Q239 314 232 300 L201 247 Z" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3"/>
<!-- open mitten hands with small visible fingers -->
<path d="M63 289 Q50 285 47 294 L45 309 Q42 320 49 324 Q54 327 58 318 Q58 333 66 333 Q72 333 73 323 Q76 333 82 327 Q87 323 83 313 Q90 315 91 307 Q89 299 78 297 Z" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3" stroke-linejoin="round"/>
<path d="M257 289 Q270 285 273 294 L275 309 Q278 320 271 324 Q266 327 262 318 Q262 333 254 333 Q248 333 247 323 Q244 333 238 327 Q233 323 237 313 Q230 315 229 307 Q231 299 242 297 Z" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3" stroke-linejoin="round"/>
<!-- balanced T-shirt -->
<path d="M125 198 Q140 190 159 191 Q181 190 197 198 L218 217 L204 253 L195 247 L202 314 Q160 326 118 314 L125 247 L116 253 L101 217 Z" fill="url(#pwShirt)" stroke="#4baca6" stroke-width="3" stroke-linejoin="round"/>
<path d="M145 194 Q158 215 177 194" fill="none" stroke="#fff8e6" stroke-width="7" stroke-linecap="round"/>
<path d="M158 249 L164 259 L176 260 L167 269 L170 281 L159 275 L148 281 L151 269 L142 260 L154 259 Z" fill="#fff5ad" stroke="#e8c66d" stroke-width="2"/>
<!-- neck and ears -->
<path d="M146 178 L146 202 Q160 212 175 202 L174 178 Z" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3"/>
<ellipse cx="100" cy="128" rx="15" ry="21" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3"/>
<ellipse cx="220" cy="128" rx="15" ry="21" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3"/>
<path d="M98 126 Q108 118 107 137 M223 126 Q214 119 213 138" stroke="#e5a59c" stroke-width="3" fill="none" stroke-linecap="round"/>
<!-- smaller, rounded face; soft expression -->
<path d="M104 99 Q105 55 159 52 Q213 54 216 99 L213 143 Q207 181 162 188 Q115 183 108 146 Z" fill="url(#pwSkin)" stroke="#d69b92" stroke-width="3"/>
<!-- soft side-parted hair, no heavy scary eyebrows -->
<path d="M104 119 Q93 84 109 63 Q120 45 144 43 Q160 28 179 43 Q207 40 218 68 Q231 92 216 116 L210 94 Q201 76 189 76 Q160 94 136 76 Q120 93 109 92 Z" fill="url(#pwHair)" stroke="#584270" stroke-width="3" stroke-linejoin="round"/>
<path d="M130 57 Q156 68 179 54" stroke="#9b7bad" stroke-width="6" fill="none" stroke-linecap="round" opacity=".65"/>
<!-- friendly eyes, balanced with head -->
<path d="M125 118 Q137 111 149 118 M173 118 Q185 111 197 118" fill="none" stroke="#694c79" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="138" cy="131" rx="10" ry="12" fill="#fffdf7"/>
<ellipse cx="184" cy="131" rx="10" ry="12" fill="#fffdf7"/>
<ellipse cx="139" cy="133" rx="5.7" ry="7.4" fill="#5e8d9f"/>
<ellipse cx="185" cy="133" rx="5.7" ry="7.4" fill="#5e8d9f"/>
<circle cx="141" cy="130" r="2.5" fill="#fff"/><circle cx="187" cy="130" r="2.5" fill="#fff"/>
<ellipse cx="120" cy="150" rx="11" ry="5" fill="#f4a3ab" opacity=".5"/>
<ellipse cx="202" cy="150" rx="11" ry="5" fill="#f4a3ab" opacity=".5"/>
<path d="M160 139 Q157 146 162 148" fill="none" stroke="#d69290" stroke-width="2.5" stroke-linecap="round"/>
<path d="M146 160 Q161 173 177 160" fill="none" stroke="#ac6b83" stroke-width="3.5" stroke-linecap="round"/>
</svg>`}
/* Each arrow begins at the actual illustrated body part and ends at a label OUTSIDE the figure.
   The 600 × 460 diagram scales as one unit on phones and desktop. */
const ARROWS={
 HAIR:[157,61,78,56], HEAD:[204,94,524,60], EYES:[184,132,524,157],
 EARS:[100,128,78,166], NOSE:[160,144,524,255], MOUTH:[161,164,78,263],
 HAND:[259,310,524,313], ARM:[235,253,524,196], FINGER:[53,318,78,305],
 LEG:[143,367,78,395], FOOT:[192,422,524,405],
 TEETH:[160,162,78,260], TONGUE:[162,167,524,265],
 HEART:[160,253,78,350], BRAIN:[160,79,524,65], BONE:[189,371,524,395]
};
function diagramLines(mode){
 return '<svg class="diagram-lines" viewBox="0 0 600 460" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+
 CHAPTERS[chapter].words.map((w,i)=>{
   const p=ARROWS[w[0]],x=140+p[0],y=p[1],endX=p[2]<300?139:461;
   const done=mode==='match'&&matched[chapter].has(i);
   return '<g class="diagram-arrow '+(done?'arrow-done':'')+'" data-line="'+i+'">'+
   '<path d="M'+x+' '+y+' L'+endX+' '+p[3]+'" fill="none" stroke="'+(done?'#3eb88c':'#169fdd')+'" stroke-width="3.8" stroke-linecap="round"/>'+
   '<circle cx="'+x+'" cy="'+y+'" r="5" fill="'+(done?'#3eb88c':'#169fdd')+'" stroke="#fff" stroke-width="2"/>'+
   '</g>'
 }).join('')+'</svg>'
}
function spots(mode){return CHAPTERS[chapter].words.map((w,i)=>{
 const p=ARROWS[w[0]],yes=matched[chapter].has(i),active=seen[chapter].has(i);
 const label=mode==='learn'?'<strong lang="en">'+w[0]+'</strong><small>'+w[1]+'</small>':yes?'<strong lang="en">'+w[0]+'</strong>':'<strong>?</strong>';
 return '<button type="button" class="spot diagram-label '+(yes?'matched':active&&mode==='learn'?'active':'')+
 '" data-target="'+i+'" style="--x:'+(p[2]/6)+'%;--y:'+(p[3]/4.6)+'%" aria-label="'+
 (mode==='learn'?w[0]+' · '+w[1]:yes?w[0]:'מיקום איבר '+(i+1))+'">'+label+'</button>'
 }).join('')}
function avatar(mode){return '<div class="body-stage diagram-board" id="bodyStage"><div class="diagram-person">'+avatarSvg()+'</div>'+diagramLines(mode)+spots(mode)+'</div>'}
function heading(pill,title,desc){return '<div class="activity-heading"><div class="mini-pill">'+pill+'</div><h2>'+title+'</h2><p>'+desc+'</p></div>'}
function chapterNav(){const wrap=$('chapters');wrap.innerHTML=CHAPTERS.map((c,i)=>'<button type="button" class="chapter '+(i===chapter?'selected':'')+'" data-chapter="'+i+'"><span class="emoji">'+c.emoji+'</span><strong>פרק '+(i+1)+' · '+c.title+'</strong><small lang="en">'+c.en+' · '+c.words.length+' words</small><span class="award">'+(awards.chapters[i]?'🏆':'')+'</span></button>').join('');wrap.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>openChapter(Number(b.dataset.chapter)))}
function stepNav(){const labels=[['📚','לומדים','LEARN'],['🎯','מחברים','MATCH'],['👾','מצילים','HOSPITAL']];$('stepper').innerHTML=labels.map((a,i)=>'<button type="button" class="step '+(stages[i]===phase?'current':i<stages.indexOf(phase)?'done':'')+'" data-step="'+i+'" '+(i>maxStep[chapter]&&!awards.chapters[chapter]?'disabled':'')+'><span>'+a[0]+'</span> '+(i+1)+'. '+a[1]+' <small lang="en">'+a[2]+'</small></button>').join('<span class="step-arrow">←</span>');$('stepper').querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.step);if(i<=maxStep[chapter]||awards.chapters[chapter])goStep(stages[i])})}
function openChapter(i){chapter=i;phase='learn';selected=-1;seen[i]=new Set();matched[i]=new Set();maxStep[i]=awards.chapters[i]?2:0;render()}
function goStep(next){phase=next;selected=-1;maxStep[chapter]=Math.max(maxStep[chapter],stages.indexOf(next));render()}
function render(){chapterNav();$('chapterTag').textContent=CHAPTERS[chapter].emoji+' פרק '+(chapter+1)+' · '+CHAPTERS[chapter].title;$('chapterCount').textContent=CHAPTERS[chapter].words.length+' מילים';stepNav();if(phase==='learn')renderLearn();else if(phase==='match')renderMatch();else if(phase==='hospital')startHospital(false);else if(phase==='done')renderDone();else if(phase==='final')renderFinal();else if(phase==='worldDone')renderWorldDone()}
function bindSpots(mode){$('bodyStage').querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.target);if(mode==='learn')learnWord(i);else matchTarget(i)})}
function learnWord(i){const w=CHAPTERS[chapter].words[i];seen[chapter].add(i);$('spoken').innerHTML='🔊 <strong lang="en">'+w[0]+'</strong> · '+w[1];$('learnCount').textContent='הכרנו '+seen[chapter].size+' מתוך '+CHAPTERS[chapter].words.length+' מילים';$('learnCards').querySelectorAll('[data-learn]').forEach(b=>b.classList.toggle('seen',seen[chapter].has(Number(b.dataset.learn))));$('bodyStage').querySelectorAll('[data-target]').forEach(b=>b.classList.toggle('active',Number(b.dataset.target)===i));$('bodyStage').querySelectorAll('[data-line]').forEach(b=>b.classList.toggle('arrow-active',Number(b.dataset.line)===i));speak(w[0])}
function renderLearn(){const c=CHAPTERS[chapter];$('activity').innerHTML=heading('📚 תחנת הלמידה','מכירים את חלקי הגוף!','החצים הכחולים יוצאים מאיברי הגוף אל המילים שמסביב. לחצו על שם איבר או על כרטיסייה כדי לשמוע את ההגייה באנגלית.')+'<div class="learn-layout"><div class="avatar-panel"><div class="avatar-caption">🌟 עקבו אחרי החצים ולחצו על המילים מסביב לדמות!</div>'+avatar('learn')+'<div class="spoken" id="spoken" aria-live="polite">👆 בחרו חלק גוף!</div></div><div class="learn-side"><h3>📖 אוצר המילים שלנו</h3><div class="learn-cards" id="learnCards">'+c.words.map((w,i)=>'<button class="learn-card '+(seen[chapter].has(i)?'seen':'')+'" data-learn="'+i+'"><span class="picture">'+w[2]+'</span><strong lang="en">'+w[0]+'</strong><small>'+w[1]+'</small><span>🔊</span></button>').join('')+'</div><p class="learn-progress" id="learnCount">הכרנו '+seen[chapter].size+' מתוך '+c.words.length+' מילים</p><button type="button" class="big-button" id="nextMatch">🎯 למדנו! בואו נחבר מילים</button></div></div>';$('learnCards').querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>learnWord(Number(b.dataset.learn)));bindSpots('learn');$('nextMatch').onclick=()=>goStep('match')}
function renderMatch(){const c=CHAPTERS[chapter];$('activity').innerHTML=heading('🎯 תחנת ההתאמה','איפה נמצא כל איבר?','החצים מצביעים על איברי הגוף! גררו כל מילה באנגלית לקצה החץ המתאים. בטלפון אפשר גם ללחוץ על מילה ואז על סימן השאלה.')+'<div class="match-status"><span>🧩 <b id="matchCount">'+matched[chapter].size+' / '+c.words.length+'</b></span><span>⭐ <b id="matchStars">'+matched[chapter].size+'</b></span></div><div class="match-layout"><div class="match-stage">'+avatar('match')+'</div><div class="match-side"><h3>🧩 כרטיסיות המילים</h3><div class="word-chips" id="wordChips">'+c.words.map((w,i)=>matched[chapter].has(i)?'':'<button type="button" class="chip '+(selected===i?'selected':'')+'" data-chip="'+i+'" draggable="true" lang="en">'+w[0]+'</button>').join('')+'</div><div class="match-feedback" id="matchFeedback" aria-live="polite">גררו כרטיסייה אל קצה החץ או לחצו על מילה ואז על ?</div><button class="big-button" id="nextHospital" type="button" '+(matched[chapter].size===c.words.length?'':'hidden')+'>👾 כל הכבוד! לבית החולים</button></div></div>';
bindSpots('match');$('wordChips').querySelectorAll('[data-chip]').forEach(b=>{b.onclick=()=>selectChip(Number(b.dataset.chip));b.ondragstart=e=>{selected=Number(b.dataset.chip);if(e.dataTransfer)e.dataTransfer.setData('text/plain',String(selected))}});$('bodyStage').querySelectorAll('[data-target]').forEach(b=>{b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();matchTarget(Number(b.dataset.target))}});$('nextHospital').onclick=()=>goStep('hospital')}
function selectChip(i){selected=i;$('wordChips').querySelectorAll('[data-chip]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.chip)===i));$('matchFeedback').textContent='עכשיו מצאו את המקום של '+CHAPTERS[chapter].words[i][0]+' על הדמות!';speak(CHAPTERS[chapter].words[i][0])}
function matchTarget(i){if(phase!=='match'||selected<0||matched[chapter].has(i))return;const feedback=$('matchFeedback');if(i!==selected){feedback.textContent='אופס, לא בדיוק! נסו שוב 💜';feedback.className='match-feedback bad';speak(CHAPTERS[chapter].words[selected][0]);return}const w=CHAPTERS[chapter].words[i];matched[chapter].add(i);selected=-1;renderMatch();$('matchFeedback').textContent='⭐ נהדר! '+w[0]+' = '+w[1];$('matchFeedback').className='match-feedback good';speak(w[0])}
function hospitalCases(final){return shuffle(final?ALL:CHAPTERS[chapter].words)}
function startHospital(final){caseFinal=final;caseList=hospitalCases(final);caseIndex=0;caseStars=0;caseLocked=false;renderCase()}
function renderCase(){caseLocked=false;const w=caseList[caseIndex],colors=['#b78beb','#85d9c5','#f4a4b2','#f5c87b','#91baf0'];const color=colors[caseIndex%colors.length];const wrong=shuffle(ALL.filter(x=>x!==w&&x[0]!==w[0])).slice(0,2),choices=shuffle([w,...wrong]);$('activity').innerHTML=heading(caseFinal?'🏆 אתגר הסיום הגדול':'🏥 בית החולים הקסום',caseFinal?'מצילים את כל המפלצות!':'מצילים את המפלצות!','המפלצת צריכה עזרה! הקשיבו למילה באנגלית ובחרו את האיבר הנכון מתוך התמונות.')+'<div class="hospital-hud"><span>💗 מטופל <b>'+(caseIndex+1)+' / '+caseList.length+'</b></span><span>⭐ כוכבים <b>'+caseStars+'</b></span></div><div class="hospital-room"><div class="hospital-decoration">🪟　🌈　🧪　💊　✨</div><div class="monster-wrap"><div class="monster sad" id="monster" style="--monster:'+color+'"><div class="monster-horns"><i></i><i></i></div><div class="monster-body"><div class="monster-eyes"><i></i><i></i></div><div class="monster-mouth"></div></div><div class="monster-feet"><i></i><i></i></div></div><div class="monster-speech" lang="en">Oh no! My '+w[0]+'!</div></div><div class="case-prompt">איזה איבר חסר למפלצת? <button class="listen-case" id="listenCase" type="button">🔊 לשמוע שוב</button></div><div class="case-choices" id="caseChoices">'+choices.map((v,i)=>'<button type="button" class="case-choice" data-choice="'+i+'" aria-label="תמונה '+(i+1)+'" title="בחרו תמונה">'+v[2]+'</button>').join('')+'</div><div class="case-feedback" id="caseFeedback" aria-live="polite">בחרו את התמונה הנכונה</div></div>';$('listenCase').onclick=()=>speak(w[0]);$('caseChoices').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>chooseCase(choices[Number(b.dataset.choice)],w,b));speak(w[0])}
function chooseCase(choice,correct,button){if(caseLocked)return;if(choice!==correct){button.classList.add('wrong');$('caseFeedback').textContent='כמעט! הקשיבו שוב ונסו תמונה אחרת 💜';$('caseFeedback').className='case-feedback bad';speak(correct[0]);return}caseLocked=true;caseStars++;button.classList.add('right');$('monster').className='monster happy';$('caseFeedback').textContent='🎉 יש! '+correct[0]+' = '+correct[1]+' · המפלצת שוב שמחה!';$('caseFeedback').className='case-feedback good';speak(correct[0]);setTimeout(()=>{caseIndex++;if(caseIndex<caseList.length)renderCase();else finishHospital()},1000)}
function finishHospital(){if(caseFinal){awards.final=true;saveAwards();try{localStorage.setItem(COMPLETE,'complete')}catch(e){}phase='worldDone';render();return}awards.chapters[chapter]=true;saveAwards();phase='done';render()}
function renderDone(){const c=CHAPTERS[chapter];$('activity').innerHTML='<div class="celebration"><div class="big-trophy">🏆🎉</div><h2>הצלתם את המפלצות!</h2><p>למדתם '+c.words.length+' מילים באנגלית, חיברתם אותן לגוף ועזרתם למפלצות! מדהימים!</p><div class="celebration-stars">⭐ ⭐ ⭐</div><button class="big-button" id="goNext">'+(chapter===2?'👑 לאתגר הסיום הגדול!':'✨ לפרק הבא')+'</button><button class="soft-button" id="replayChapter">🔄 לשחק בפרק שוב</button></div>';$('goNext').onclick=()=>{if(chapter===2){phase='final';render()}else openChapter(chapter+1)};$('replayChapter').onclick=()=>openChapter(chapter)}
function renderFinal(){$('activity').innerHTML=heading('🌟 אתגר הסיום הגדול','בית החולים נפתח לכולם!','כל 16 המילים חוזרות בהרפתקת סיום אחת! בחרו את האיבר הנכון לכל מפלצת והפכו לאלופי הגוף.')+'<div class="final-start"><p class="final-progress">👾 16 מטופלים מחכים לכם</p><button type="button" class="big-button" id="startFinal">👑 מתחילים את אתגר הסיום!</button></div>';$('startFinal').onclick=()=>startHospital(true)}
function renderWorldDone(){$('activity').innerHTML='<div class="celebration"><div class="big-trophy">👑🧠🏆</div><h2>אתם אלופי ממלכת גוף האדם!</h2><p>הצלתם את כל המפלצות, למדתם 16 מילים והשלמתם את שלושת הפרקים ואת אתגר הסיום!</p><div class="celebration-stars">🌟 ⭐ 🌟 ⭐ 🌟</div><a class="big-button" href="level2-world-food.html">🍎 לעולם הבא — ממלכת האוכל</a><a class="soft-button" href="adventure-map.html">🗺️ חזרה למפת העולמות</a><button class="soft-button" id="replayAll">🔄 לשחק שוב מההתחלה</button></div>';$('replayAll').onclick=()=>openChapter(0)}
// Dragging works with pointer events on touchscreens and mice; clicking a chip then a target also works.
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.chip');if(!b||phase!=='match')return;const i=Number(b.dataset.chip);selected=i;activePointer={id:e.pointerId,x:e.clientX,y:e.clientY,index:i,ghost:null};/* Keep normal tap-to-select behavior on touch devices. */});
document.addEventListener('pointermove',e=>{if(!activePointer||e.pointerId!==activePointer.id)return;const p=activePointer;if(!p.ghost&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>8){const ghost=document.createElement('div');ghost.className='drag-ghost';ghost.textContent=CHAPTERS[chapter].words[p.index][0];document.body.append(ghost);p.ghost=ghost}if(p.ghost){p.ghost.style.left=e.clientX+'px';p.ghost.style.top=e.clientY+'px'}});
document.addEventListener('pointerup',e=>{if(!activePointer||e.pointerId!==activePointer.id)return;const p=activePointer;activePointer=null;if(p.ghost){p.ghost.remove();const el=document.elementFromPoint(e.clientX,e.clientY);const target=el&&el.closest&&el.closest('[data-target]');if(target){selected=p.index;matchTarget(Number(target.dataset.target))}}});
document.addEventListener('pointercancel',()=>{if(activePointer&&activePointer.ghost)activePointer.ghost.remove();activePointer=null});
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'🔊 צליל פועל':'🔇 צליל כבוי';if(!sound&&'speechSynthesis'in window)speechSynthesis.cancel()};
openChapter(0);
})();