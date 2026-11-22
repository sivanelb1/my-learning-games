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
function avatarSvg(){return `<svg class="pw-boy" viewBox="0 0 320 460" role="img" aria-label="ילד מצויר וחייכן, עם ראש עגול, גוף פרופורציונלי, ידיים פתוחות, חולצה כחולה ונעלי ספורט" xmlns="http://www.w3.org/2000/svg">
<defs>
 <radialGradient id="kidSkin" cx="37%" cy="25%" r="83%"><stop stop-color="#fff1d4"/><stop offset=".56" stop-color="#ffd5aa"/><stop offset="1" stop-color="#f3a47e"/></radialGradient>
 <linearGradient id="kidShirt" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffefa"/><stop offset=".75" stop-color="#e9f5ff"/><stop offset="1" stop-color="#c9dff8"/></linearGradient>
 <linearGradient id="kidBlue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#53baff"/><stop offset=".5" stop-color="#288de7"/><stop offset="1" stop-color="#285fc2"/></linearGradient>
 <linearGradient id="kidHair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b66a34"/><stop offset=".46" stop-color="#8c471e"/><stop offset="1" stop-color="#5a2c20"/></linearGradient>
 <linearGradient id="kidShorts" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2c98ee"/><stop offset="1" stop-color="#225cbd"/></linearGradient>
 <radialGradient id="kidIris"><stop stop-color="#184c9b"/><stop offset=".65" stop-color="#218ad6"/><stop offset="1" stop-color="#12426f"/></radialGradient>
 <filter id="kidShadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<ellipse cx="161" cy="442" rx="104" ry="11" fill="#7c6ba6" opacity=".24" filter="url(#kidShadow)"/>
<!-- symmetrical, child-sized legs -->
<path d="M124 315 L123 382 Q126 398 140 398 L149 397 Q158 392 158 381 L160 334 L166 334 L168 382 Q169 396 181 398 L192 397 Q204 392 202 381 L198 314 Z" fill="url(#kidSkin)" stroke="#e8a285" stroke-width="2.3"/>
<path d="M125 379 L157 380 L157 408 L124 408 Z M169 380 L201 380 L201 408 L168 408 Z" fill="#f8f8ff"/>
<path d="M126 382 L156 382 M170 383 L199 383" stroke="#83a5ec" stroke-width="3"/>
<!-- shoes: balanced, blue, white rubber soles -->
<path d="M122 402 Q112 401 102 415 Q97 430 114 434 L157 434 Q166 428 159 415 L150 406 Z" fill="url(#kidBlue)" stroke="#3773c1" stroke-width="2.5"/>
<path d="M171 405 Q163 419 171 433 L210 434 Q226 431 218 417 Q208 402 198 402 Z" fill="url(#kidBlue)" stroke="#3773c1" stroke-width="2.5"/>
<path d="M103 425 Q132 432 160 426 M169 427 Q194 433 220 425" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
<path d="M125 410 L151 413 M124 417 L153 420 M177 413 L202 410 M175 421 L206 417" stroke="#e9f7ff" stroke-width="4" stroke-linecap="round"/>
<!-- blue shorts -->
<path d="M117 292 Q160 287 205 293 L207 344 Q185 353 165 347 L160 327 L155 347 Q135 353 114 343 Z" fill="url(#kidShorts)" stroke="#2865ba" stroke-width="2.5"/>
<path d="M117 337 Q135 345 154 340 M168 340 Q186 346 205 338" fill="none" stroke="#8ccaff" stroke-width="2.5" stroke-linecap="round"/>
<!-- arms proportionate to torso, palms open -->
<path d="M119 207 Q104 205 94 223 L66 279 Q59 289 66 298 Q75 305 83 294 L119 249 Z" fill="url(#kidSkin)" stroke="#e8a285" stroke-width="2.4"/>
<path d="M204 207 Q219 205 229 223 L258 279 Q265 289 257 298 Q248 305 241 294 L203 249 Z" fill="url(#kidSkin)" stroke="#e8a285" stroke-width="2.4"/>
<path d="M67 278 Q57 273 50 279 L42 287 Q34 293 39 299 Q43 303 49 297 L43 305 Q39 312 45 315 Q51 317 55 309 Q52 321 60 321 Q66 321 68 311 Q70 323 77 318 Q82 315 78 305 Q89 308 91 300 Q93 293 79 289 Z" fill="url(#kidSkin)" stroke="#e8a285" stroke-width="2.3" stroke-linejoin="round"/>
<path d="M256 278 Q266 273 273 279 L281 287 Q289 293 284 299 Q280 303 274 297 L280 305 Q284 312 278 315 Q272 317 268 309 Q271 321 263 321 Q257 321 255 311 Q253 323 246 318 Q241 315 245 305 Q234 308 232 300 Q230 293 244 289 Z" fill="url(#kidSkin)" stroke="#e8a285" stroke-width="2.3" stroke-linejoin="round"/>
<path d="M48 289 L56 283 M270 284 L277 290" stroke="#fff3d9" stroke-width="2.5" stroke-linecap="round"/>
<!-- T-shirt with bright blue sleeves and golden star -->
<path d="M126 201 Q142 193 161 195 Q182 193 199 201 L223 226 L208 249 L198 242 L202 298 Q161 309 118 298 L124 242 L112 249 L98 226 Z" fill="url(#kidShirt)" stroke="#a9c6eb" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M126 201 L111 212 Q101 219 98 226 L112 249 L130 238 Z" fill="url(#kidBlue)" stroke="#377dc7" stroke-width="2"/>
<path d="M199 201 L213 211 Q220 219 223 226 L208 249 L193 238 Z" fill="url(#kidBlue)" stroke="#377dc7" stroke-width="2"/>
<path d="M145 196 Q161 213 178 196" fill="none" stroke="#368ad3" stroke-width="6" stroke-linecap="round"/>
<path d="M160 238 L169 256 L190 259 L175 272 L178 292 L160 283 L141 292 L145 272 L129 259 L151 256 Z" fill="#ffd44d" stroke="#f3a829" stroke-width="2.5"/>
<path d="M157 248 L160 242 L163 249" stroke="#fff7bb" stroke-width="3" stroke-linecap="round"/>
<!-- neck, ears and very round friendly face -->
<path d="M146 174 L146 200 Q161 212 176 199 L176 175" fill="url(#kidSkin)" stroke="#e8a285" stroke-width="2.3"/>
<ellipse cx="97" cy="123" rx="16" ry="22" fill="url(#kidSkin)" stroke="#e6a080" stroke-width="2.5"/>
<ellipse cx="225" cy="123" rx="16" ry="22" fill="url(#kidSkin)" stroke="#e6a080" stroke-width="2.5"/>
<path d="M93 122 Q102 114 103 132 M230 122 Q220 114 219 132" fill="none" stroke="#e5a28a" stroke-width="3" stroke-linecap="round"/>
<path d="M101 99 Q103 48 160 43 Q218 46 220 101 L216 143 Q206 185 163 193 Q117 187 106 144 Z" fill="url(#kidSkin)" stroke="#e6a080" stroke-width="2.7"/>
<ellipse cx="121" cy="151" rx="15" ry="8" fill="#ff9da0" opacity=".55"/>
<ellipse cx="201" cy="151" rx="15" ry="8" fill="#ff9da0" opacity=".55"/>
<!-- soft, thick auburn locks -->
<path d="M103 117 Q89 95 96 68 Q100 45 120 42 Q118 24 145 29 Q151 10 177 26 Q197 16 207 40 Q233 43 228 69 Q239 87 217 116 L214 90 Q205 78 194 78 Q177 95 157 78 Q137 100 116 89 L105 109 Z" fill="url(#kidHair)" stroke="#774123" stroke-width="2.7" stroke-linejoin="round"/>
<path d="M106 83 Q120 57 149 59 Q155 33 182 38 M148 64 Q171 73 198 51 M191 64 Q213 68 220 83" fill="none" stroke="#d99558" stroke-width="7" stroke-linecap="round" opacity=".68"/>
<path d="M126 37 Q120 25 128 18 Q142 14 150 26 M171 31 Q178 17 193 23" fill="none" stroke="#a76335" stroke-width="9" stroke-linecap="round"/>
<!-- warm eyebrows, big round blue eyes -->
<path d="M120 117 Q132 107 147 115 M176 115 Q190 107 203 117" fill="none" stroke="#83482b" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="136" cy="132" rx="16" ry="20" fill="#fffdfa" stroke="#e4b3a3" stroke-width="1.5"/>
<ellipse cx="187" cy="132" rx="16" ry="20" fill="#fffdfa" stroke="#e4b3a3" stroke-width="1.5"/>
<ellipse cx="138" cy="135" rx="10" ry="14" fill="url(#kidIris)"/>
<ellipse cx="189" cy="135" rx="10" ry="14" fill="url(#kidIris)"/>
<ellipse cx="140" cy="136" rx="5.7" ry="9" fill="#14263e"/>
<ellipse cx="191" cy="136" rx="5.7" ry="9" fill="#14263e"/>
<circle cx="142" cy="128" r="4.5" fill="#fff"/><circle cx="193" cy="128" r="4.5" fill="#fff"/>
<circle cx="133" cy="143" r="2.3" fill="#d1f1ff"/><circle cx="184" cy="143" r="2.3" fill="#d1f1ff"/>
<path d="M159 138 Q155 145 161 148" stroke="#e09a80" stroke-width="2.7" fill="none" stroke-linecap="round"/>
<!-- happy open smile, teeth and pink tongue -->
<path d="M139 161 Q160 180 182 160 Q178 184 161 184 Q146 184 139 161 Z" fill="#77344b" stroke="#ae5b65" stroke-width="2"/>
<path d="M143 164 Q161 173 179 164 L175 170 Q160 175 146 169 Z" fill="#fff"/>
<ellipse cx="161" cy="180" rx="10" ry="4" fill="#f58a9a"/>
<g fill="#cb805f" opacity=".65"><circle cx="117" cy="151" r="1.5"/><circle cx="124" cy="155" r="1.5"/><circle cx="204" cy="151" r="1.5"/><circle cx="197" cy="155" r="1.5"/></g>
</svg>`}
/* Each arrow begins at the actual illustrated body part and ends at a label OUTSIDE the figure.
   The 600 × 460 diagram scales as one unit on phones and desktop. */
const ARROWS={
 HAIR:[159,51,78,56], HEAD:[208,94,524,60], EYES:[188,135,524,157],
 EARS:[97,123,78,166], NOSE:[160,145,524,255], MOUTH:[160,169,78,263],
 HAND:[256,295,524,313], ARM:[225,250,524,196], FINGER:[53,301,78,305],
 LEG:[143,369,78,395], FOOT:[194,422,524,405],
 TEETH:[160,166,78,260], TONGUE:[160,178,524,265],
 HEART:[160,260,78,350], BRAIN:[161,84,524,65], BONE:[185,370,524,395]
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
/* Every patient actually LACKS the requested part until the correct answer is chosen.
   SVG groups let the missing part pop onto the character instead of merely showing a success message. */
function monsterIllustration(word){
 const missing=word[0];
 const part=(name,art)=>'<g class="monster-part '+(missing===name?'needs-repair':'')+'" data-part="'+name+'">'+art+'</g>';
 const skin='#ffe3ca',line='#815f92';
 const legLeft='<path d="M94 200 Q88 215 92 230 L110 230 Q116 215 115 201" fill="var(--monster)" stroke="'+line+'" stroke-width="3"/>';
 const footLeft='<ellipse cx="99" cy="232" rx="23" ry="11" fill="#ffb6c6" stroke="'+line+'" stroke-width="3"/>';
 const legRight=part('LEG','<path d="M128 202 Q126 216 130 230 L149 230 Q156 215 152 202" fill="var(--monster)" stroke="'+line+'" stroke-width="3"/>'+part('FOOT','<ellipse cx="148" cy="232" rx="23" ry="11" fill="#ffb6c6" stroke="'+line+'" stroke-width="3"/>'));
 const leftArm='<path d="M78 153 Q56 151 48 174 L41 187" fill="none" stroke="var(--monster)" stroke-width="24" stroke-linecap="round"/><circle cx="40" cy="189" r="14" fill="'+skin+'" stroke="'+line+'" stroke-width="3"/>';
 const rightArm=part('ARM','<path d="M166 153 Q190 151 199 174 L203 187" fill="none" stroke="var(--monster)" stroke-width="24" stroke-linecap="round"/>'+part('HAND','<circle cx="203" cy="190" r="15" fill="'+skin+'" stroke="'+line+'" stroke-width="3"/>'+part('FINGER','<path d="M210 180 L221 170 M215 188 L228 181 M215 196 L227 196" stroke="'+skin+'" stroke-width="8" stroke-linecap="round"/><path d="M210 180 L221 170 M215 188 L228 181 M215 196 L227 196" stroke="'+line+'" stroke-width="1.6" stroke-linecap="round"/>')));
 const ears=part('EARS','<ellipse cx="57" cy="91" rx="16" ry="23" fill="'+skin+'" stroke="'+line+'" stroke-width="3"/><ellipse cx="183" cy="91" rx="16" ry="23" fill="'+skin+'" stroke="'+line+'" stroke-width="3"/><path d="M55 87 Q63 83 63 97 M185 87 Q177 83 177 97" stroke="#e9a8a3" stroke-width="3" fill="none"/>');
 const hair=part('HAIR','<path d="M76 49 Q70 24 87 30 L96 40 Q100 11 117 22 L124 38 Q143 12 155 30 L151 45 Q171 30 174 53 Q136 41 112 53 Q90 47 76 49 Z" fill="#66528d" stroke="'+line+'" stroke-width="3" stroke-linejoin="round"/>');
 const eyes=part('EYES','<ellipse cx="97" cy="91" rx="14" ry="18" fill="white"/><ellipse cx="143" cy="91" rx="14" ry="18" fill="white"/><ellipse cx="99" cy="94" rx="7" ry="10" fill="#493a68"/><ellipse cx="145" cy="94" rx="7" ry="10" fill="#493a68"/><circle cx="102" cy="90" r="3.5" fill="white"/><circle cx="148" cy="90" r="3.5" fill="white"/>');
 const nose=part('NOSE','<ellipse cx="120" cy="112" rx="7" ry="5" fill="#ec9ea4"/><circle cx="117" cy="111" r="1.5" fill="#a97183"/><circle cx="123" cy="111" r="1.5" fill="#a97183"/>');
 const mouth=part('MOUTH','<ellipse cx="120" cy="131" rx="22" ry="15" fill="#754a78" stroke="'+line+'" stroke-width="2"/>'+part('TEETH','<path d="M103 122 Q120 117 137 122 L135 129 L105 129 Z" fill="#fffef7"/>')+part('TONGUE','<ellipse cx="120" cy="139" rx="12" ry="5" fill="#f79bad"/>'));
 const brain=part('BRAIN','<path d="M107 63 Q95 57 101 49 Q105 44 112 48 Q116 37 123 45 Q134 39 138 49 Q150 49 142 60 Q134 67 123 64 Q114 69 107 63 Z" fill="#f5b5da" stroke="#c37ea8" stroke-width="2"/><path d="M117 47 Q114 54 122 57 M132 46 Q127 53 133 58" fill="none" stroke="#c37ea8" stroke-width="2"/>');
 const head=part('HEAD','<circle cx="120" cy="88" r="65" fill="'+skin+'" stroke="'+line+'" stroke-width="4"/>'+ears+hair+brain+eyes+nose+mouth+'<ellipse cx="77" cy="113" rx="11" ry="5" fill="#f8a8b7" opacity=".5"/><ellipse cx="164" cy="113" rx="11" ry="5" fill="#f8a8b7" opacity=".5"/>');
 const heart=part('HEART','<path d="M113 172 C97 155 91 174 120 193 C149 174 143 155 127 172 L120 178 Z" fill="#ff8fa7" stroke="#fff0ef" stroke-width="3"/>');
 const bone=part('BONE','<path d="M103 209 Q96 204 94 211 Q88 211 90 218 Q92 223 98 219 L107 228 Q112 235 116 230 Q123 231 123 225 Q123 220 117 222 L107 212 Q109 205 103 209 Z" fill="#fff9e8" stroke="#d2b6c5" stroke-width="2"/>');
 const markers={
 HEAD:'<circle cx="120" cy="88" r="64"/>',HAIR:'<path d="M75 49 Q92 9 122 30 Q154 10 173 50"/>',
 EYES:'<ellipse cx="97" cy="91" rx="14" ry="18"/><ellipse cx="143" cy="91" rx="14" ry="18"/>',
 EARS:'<ellipse cx="57" cy="91" rx="16" ry="23"/><ellipse cx="183" cy="91" rx="16" ry="23"/>',
 NOSE:'<ellipse cx="120" cy="112" rx="9" ry="7"/>',MOUTH:'<ellipse cx="120" cy="131" rx="22" ry="15"/>',
 TEETH:'<rect x="103" y="120" width="34" height="9" rx="4"/>',TONGUE:'<ellipse cx="120" cy="139" rx="12" ry="6"/>',
 HAND:'<circle cx="203" cy="190" r="15"/>',ARM:'<path d="M166 153 Q190 151 199 174 L203 187" stroke-width="23"/>',
 FINGER:'<path d="M210 180 L221 170 M215 188 L228 181 M215 196 L227 196" stroke-width="7"/>',
 LEG:'<path d="M128 202 Q126 216 130 230 L149 230 Q156 215 152 202 Z"/>',
 FOOT:'<ellipse cx="148" cy="232" rx="23" ry="11"/>',
 HEART:'<path d="M113 172 C97 155 91 174 120 193 C149 174 143 155 127 172 L120 178 Z"/>',
 BRAIN:'<path d="M107 63 Q95 57 101 49 Q105 44 112 48 Q116 37 123 45 Q134 39 138 49 Q150 49 142 60 Q134 67 123 64 Q114 69 107 63 Z"/>',
 BONE:'<path d="M103 209 Q96 204 94 211 Q88 211 90 218 Q92 223 98 219 L107 228 Q112 235 116 230 Q123 231 123 225 Q123 220 117 222 L107 212 Q109 205 103 209 Z"/>'
 };
 return '<svg class="monster-svg" viewBox="0 0 240 250" role="img" aria-label="מפלצת מצוירת שחסר לה איבר אחד" xmlns="http://www.w3.org/2000/svg">'+
 '<ellipse cx="120" cy="244" rx="92" ry="6" fill="#8f70a1" opacity=".18"/>'+
 legLeft+footLeft+legRight+leftArm+rightArm+
 '<rect x="69" y="139" width="102" height="76" rx="37" fill="var(--monster)" stroke="'+line+'" stroke-width="4"/>'+
 '<path d="M88 169 Q120 189 152 169" fill="none" stroke="#fff" stroke-width="6" opacity=".32" stroke-linecap="round"/>'+
 heart+bone+head+
 '<g class="repair-placeholder" fill="none" stroke="#f3f6ff" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round">'+markers[missing]+'</g>'+
 '<g class="repair-sparkles" fill="#ffe77e"><path d="M30 90 L35 104 L49 109 L35 114 L30 128 L25 114 L11 109 L25 104 Z"/><path d="M206 49 L210 60 L222 64 L210 68 L206 80 L202 68 L190 64 L202 60 Z"/><circle cx="215" cy="151" r="6"/><circle cx="32" cy="168" r="5"/></g>'+
 '</svg>';
}
function renderCase(){caseLocked=false;const w=caseList[caseIndex],colors=['#b78beb','#85d9c5','#f4a4b2','#f5c87b','#91baf0'];const color=colors[caseIndex%colors.length];const wrong=shuffle(ALL.filter(x=>x!==w&&x[0]!==w[0])).slice(0,2),choices=shuffle([w,...wrong]);$('activity').innerHTML=heading(caseFinal?'🏆 אתגר הסיום הגדול':'🏥 בית החולים הקסום',caseFinal?'מצילים את כל המפלצות!':'מצילים את המפלצות!','למפלצת באמת חסר איבר בגוף! הקשיבו למילה באנגלית, בחרו את התמונה הנכונה וראו איך האיבר חוזר אליה בקסם!')+'<div class="hospital-hud"><span>💗 מטופל <b>'+(caseIndex+1)+' / '+caseList.length+'</b></span><span>⭐ כוכבים <b>'+caseStars+'</b></span></div><div class="hospital-room"><div class="hospital-decoration">🪟　🌈　🧪　💊　✨</div><div class="monster-wrap"><div class="monster monster-illustrated" id="monster" data-missing="'+w[0]+'" style="--monster:'+color+'" aria-label="מפלצת שחסר לה '+w[1]+'">'+monsterIllustration(w)+'</div><div class="monster-speech" lang="en">Oh no! My '+w[0]+'!</div></div><div class="case-prompt">איזה איבר חסר למפלצת? <button class="listen-case" id="listenCase" type="button">🔊 לשמוע שוב</button></div><div class="case-choices" id="caseChoices">'+choices.map((v,i)=>'<button type="button" class="case-choice" data-choice="'+i+'" aria-label="תמונה '+(i+1)+'" title="בחרו תמונה">'+v[2]+'</button>').join('')+'</div><div class="case-feedback" id="caseFeedback" aria-live="polite">בחרו את התמונה הנכונה — וראו מה יקרה למפלצת! ✨</div></div>';$('listenCase').onclick=()=>speak(w[0]);$('caseChoices').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>chooseCase(choices[Number(b.dataset.choice)],w,b));speak(w[0])}
function chooseCase(choice,correct,button){if(caseLocked)return;if(choice!==correct){button.classList.add('wrong');$('caseFeedback').textContent='כמעט! הקשיבו שוב ונסו תמונה אחרת 💜';$('caseFeedback').className='case-feedback bad';speak(correct[0]);return}caseLocked=true;caseStars++;button.classList.add('right');$('monster').classList.add('repaired','happy');$('monster').setAttribute('aria-label','מפלצת שמחה — הוספנו לה '+correct[1]);$('caseFeedback').textContent='✨ קסם! '+correct[0]+' = '+correct[1]+' · האיבר הופיע על המפלצת!';$('caseFeedback').className='case-feedback good';speak(correct[0]);setTimeout(()=>{caseIndex++;if(caseIndex<caseList.length)renderCase();else finishHospital()},1850)}
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