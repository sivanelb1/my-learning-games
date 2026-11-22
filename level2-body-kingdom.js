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
function avatarSvg(){return '<img class="pw-boy-3d" src="assets/playwise-body-boy-3d.svg?v=boy1" alt="ילד תלת־ממדי מחייך עם שיער חום, עיניים כחולות, חולצה עם כוכב ומכנסיים כחולים" draggable="false" decoding="async" />'}
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
 const label=mode==='learn'?'<span class="label-audio" aria-hidden="true">🔊</span><span class="label-copy"><strong lang="en">'+w[0]+'</strong><small>'+w[1]+'</small></span>':yes?'<strong lang="en">'+w[0]+'</strong>':'<strong>?</strong>';
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
function learnWord(i){const w=CHAPTERS[chapter].words[i];seen[chapter].add(i);$('spoken').innerHTML='🔊 <strong lang="en">'+w[0]+'</strong> · '+w[1];$('learnCount').textContent='הכרנו '+seen[chapter].size+' מתוך '+CHAPTERS[chapter].words.length+' מילים';$('diagramDots').innerHTML=CHAPTERS[chapter].words.map((_,j)=>'<span class="diagram-dot '+(seen[chapter].has(j)?'on':'')+'"></span>').join('');$('learnCards').querySelectorAll('[data-learn]').forEach(b=>b.classList.toggle('seen',seen[chapter].has(Number(b.dataset.learn))));$('bodyStage').querySelectorAll('[data-target]').forEach(b=>b.classList.toggle('active',Number(b.dataset.target)===i));$('bodyStage').querySelectorAll('[data-line]').forEach(b=>b.classList.toggle('arrow-active',Number(b.dataset.line)===i));speak(w[0])}
function renderLearn(){const c=CHAPTERS[chapter];$('activity').innerHTML=heading('📚 תחנת הלמידה','מכירים את חלקי הגוף!','החצים הכחולים יוצאים מאיברי הגוף אל המילים שמסביב. לחצו על שם איבר או על כרטיסייה כדי לשמוע את ההגייה באנגלית.')+'<div class="learn-layout"><div class="avatar-panel"><div class="avatar-caption">🌟 עקבו אחרי החצים ולחצו על המילים מסביב לדמות!</div>'+avatar('learn')+'<div class="spoken" id="spoken" aria-live="polite">👆 לחצו על מילה כדי לשמוע אותה!</div><div class="diagram-toolbar"><a class="diagram-back" href="adventure-map.html">⬅ חזרה</a><div class="diagram-dots" id="diagramDots" aria-label="מילים שכבר שמענו">'+c.words.map((_,i)=>'<span class="diagram-dot '+(seen[chapter].has(i)?'on':'')+'"></span>').join('')+'</div><button class="diagram-next" id="nextMatchBoard" type="button">המשך ➜</button></div></div><div class="learn-side"><h3>📖 אוצר המילים שלנו</h3><div class="learn-cards" id="learnCards">'+c.words.map((w,i)=>'<button class="learn-card '+(seen[chapter].has(i)?'seen':'')+'" data-learn="'+i+'"><span class="picture">'+w[2]+'</span><strong lang="en">'+w[0]+'</strong><small>'+w[1]+'</small><span>🔊</span></button>').join('')+'</div><p class="learn-progress" id="learnCount">הכרנו '+seen[chapter].size+' מתוך '+c.words.length+' מילים</p><button type="button" class="big-button" id="nextMatch">🎯 למדנו! בואו נחבר מילים</button></div></div>';$('learnCards').querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>learnWord(Number(b.dataset.learn)));bindSpots('learn');$('nextMatch').onclick=()=>goStep('match');$('nextMatchBoard').onclick=()=>goStep('match')}
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
 const paws=part('FOOT',`<g><ellipse cx="153" cy="225" rx="28" ry="14" fill="url(#pwPurplePaw)" stroke="#8450a9" stroke-width="2"/><path d="M141 220 L139 231 M153 219 L152 233 M165 220 L166 231" stroke="#b787e4" stroke-width="3" stroke-linecap="round"/></g>`);
 const leg=part('LEG',`<path d="M133 198 Q133 220 144 225 Q166 233 173 210 L168 190 Z" fill="url(#pwBlueFur)" stroke="#42a7e5" stroke-width="2"/>${paws}`);
 const hand=part('HAND',`<g><path d="M203 166 Q222 164 225 178 Q235 184 226 193 Q229 205 216 207 Q205 217 196 203 Q189 192 195 180 Z" fill="url(#pwBlueFur)" stroke="#44a7e0" stroke-width="2"/>${part('FINGER','<path d="M216 190 Q223 195 220 202 M207 194 Q214 204 208 209" fill="none" stroke="#3da9e8" stroke-width="4" stroke-linecap="round"/>')}</g>`);
 const arm=part('ARM',`<path d="M174 142 Q199 138 212 162 L217 178 Q219 194 205 195 Q193 195 189 181 L172 171 Z" fill="url(#pwBlueFur)" stroke="#3ea6e0" stroke-width="2"/>${hand}`);
 const ears=part('EARS',`<g><path d="M55 98 Q28 76 26 103 Q24 129 58 131 Z" fill="url(#pwBlueFur)" stroke="#2999d6" stroke-width="3"/><path d="M185 98 Q211 76 214 103 Q217 129 182 131 Z" fill="url(#pwBlueFur)" stroke="#2999d6" stroke-width="3"/><path d="M49 102 Q35 91 36 108 Q38 117 51 120 M192 102 Q207 91 204 108 Q202 117 189 120" fill="#e8a5ec" stroke="#b976d3" stroke-width="2"/></g>`);
 const hair=part('HAIR',`<g fill="url(#pwPurpleFur)" stroke="#8550b6" stroke-width="1.8"><path d="M91 52 Q77 27 98 26 Q105 11 119 27 Q128 6 141 25 Q160 18 157 38 Q173 35 167 54 Q130 45 91 52 Z"/><path d="M108 30 Q101 14 112 10 Q127 13 124 29 M136 31 Q148 8 157 17 Q158 29 147 39"/></g>`);
 const eyes=part('EYES',`<g><ellipse cx="96" cy="106" rx="19" ry="23" fill="#fffdfd" stroke="#d4b7e7" stroke-width="1.8"/><ellipse cx="146" cy="106" rx="19" ry="23" fill="#fffdfd" stroke="#d4b7e7" stroke-width="1.8"/><ellipse cx="100" cy="108" rx="12" ry="16" fill="url(#pwIrisPurple)"/><ellipse cx="150" cy="108" rx="12" ry="16" fill="url(#pwIrisPurple)"/><ellipse cx="101" cy="110" rx="6" ry="11" fill="#221744"/><ellipse cx="151" cy="110" rx="6" ry="11" fill="#221744"/><circle cx="103" cy="100" r="5" fill="#fff"/><circle cx="153" cy="100" r="5" fill="#fff"/><circle cx="95" cy="115" r="2.4" fill="#d4c6ff"/><circle cx="145" cy="115" r="2.4" fill="#d4c6ff"/><path d="M78 89 L73 84 M82 85 L80 79 M158 84 L163 79 M164 89 L170 85" stroke="#72429c" stroke-width="2.7" stroke-linecap="round"/></g>`);
 const nose=part('NOSE',`<path d="M116 126 Q121 122 126 126 Q130 132 121 134 Q113 132 116 126 Z" fill="#79a7f2" stroke="#398dcb" stroke-width="1.5"/>`);
 const teeth=part('TEETH',`<path d="M104 142 L111 143 L111 152 L107 154 Q103 150 104 142 Z M135 142 L142 141 L139 152 L136 154 Z" fill="#fffdf8" stroke="#e6dcf8" stroke-width="1.4"/>`);
 const tongue=part('TONGUE',`<path d="M108 159 Q120 148 133 159 Q128 169 119 169 Q111 169 108 159 Z" fill="#ff94ad"/>`);
 const mouth=part('MOUTH',`<g><path d="M97 141 Q120 132 147 140 Q143 168 122 170 Q104 169 97 141 Z" fill="#603c85" stroke="#8650a2" stroke-width="2.5"/>${teeth}${tongue}</g>`);
 const brain=part('BRAIN',`<g><path d="M103 64 Q97 56 103 50 Q111 47 115 53 Q121 42 129 51 Q140 47 141 58 Q149 66 139 72 Q128 79 118 71 Q107 77 103 64 Z" fill="#f6b1d7" stroke="#d77cad" stroke-width="2"/><path d="M116 52 Q111 60 120 65 M132 51 Q126 60 134 68" stroke="#d77cad" stroke-width="2" fill="none"/></g>`);
 const head=part('HEAD',`<g>
 <!-- fuzzy, cloudlike silhouette and glossy shading -->
 <path d="M55 111 Q41 103 53 87 Q44 70 62 62 Q57 47 77 45 Q85 31 104 39 Q122 24 139 37 Q157 31 170 48 Q190 44 192 64 Q208 74 196 90 Q206 105 192 119 Q193 145 174 155 Q158 170 138 164 Q121 176 102 166 Q80 169 70 150 Q49 145 55 127 Q43 120 55 111 Z" fill="url(#pwBlueFur)" stroke="#329edc" stroke-width="2.5"/>
 <path d="M66 80 Q87 50 120 48 Q156 43 180 76" fill="none" stroke="#dcf8ff" stroke-width="7" opacity=".44" stroke-linecap="round"/>
 ${ears}${hair}${brain}${eyes}${nose}${mouth}
 <ellipse cx="71" cy="134" rx="13" ry="7" fill="#ff8eae" opacity=".7"/><ellipse cx="173" cy="134" rx="13" ry="7" fill="#ff8eae" opacity=".7"/>
 <g fill="#a174dc" opacity=".83"><circle cx="64" cy="78" r="5"/><circle cx="176" cy="71" r="5"/><circle cx="181" cy="140" r="4"/></g>
 </g>`);
 const heart=part('HEART',`<g><path d="M105 177 C86 156 77 183 120 210 C163 183 154 156 135 177 L120 187 Z" fill="#fffaf9" stroke="#e5e5ff" stroke-width="2.5"/><path d="M109 182 C94 169 92 187 120 201 C148 187 146 169 131 182 L120 190 Z" fill="#ff78b5"/><path d="M108 178 Q113 177 117 181" stroke="#ffd3ec" stroke-width="3" fill="none" stroke-linecap="round"/></g>`);
 const bone=part('BONE',`<g transform="translate(113 207) rotate(-15)"><path d="M-10 -4 Q-18 -12 -22 -5 Q-28 -3 -23 3 Q-19 7 -14 4 L6 8 Q11 14 17 8 Q24 9 23 2 Q21 -3 15 -2 L-6 -7 Q-8 -12 -14 -10 Z" fill="#fffdf4" stroke="#d4b7d8" stroke-width="2"/></g>`);
 const markers={
 HEAD:'<path d="M55 111 Q41 103 53 87 Q44 70 62 62 Q57 47 77 45 Q85 31 104 39 Q122 24 139 37 Q157 31 170 48 Q190 44 192 64 Q208 74 196 90 Q206 105 192 119 Q193 145 174 155 Q158 170 138 164 Q121 176 102 166 Q80 169 70 150 Q49 145 55 127 Q43 120 55 111 Z"/>',
 HAIR:'<path d="M91 52 Q77 27 98 26 Q105 11 119 27 Q128 6 141 25 Q160 18 157 38 Q173 35 167 54"/>',
 EYES:'<ellipse cx="96" cy="106" rx="19" ry="23"/><ellipse cx="146" cy="106" rx="19" ry="23"/>',
 EARS:'<ellipse cx="39" cy="109" rx="18" ry="23"/><ellipse cx="202" cy="109" rx="18" ry="23"/>',
 NOSE:'<ellipse cx="121" cy="130" rx="10" ry="7"/>',
 MOUTH:'<ellipse cx="121" cy="151" rx="26" ry="18"/>',
 TEETH:'<path d="M104 142 L111 143 L111 152 L107 154 Z M135 142 L142 141 L139 152 L136 154 Z"/>',
 TONGUE:'<ellipse cx="120" cy="159" rx="12" ry="7"/>',
 HAND:'<ellipse cx="211" cy="192" rx="18" ry="20"/>',
 ARM:'<path d="M174 142 Q199 138 212 162 L217 178 Q219 194 205 195 Q193 195 189 181 L172 171 Z"/>',
 FINGER:'<path d="M216 190 Q223 195 220 202 M207 194 Q214 204 208 209"/>',
 LEG:'<path d="M133 198 Q133 220 144 225 Q166 233 173 210 L168 190 Z"/>',
 FOOT:'<ellipse cx="153" cy="225" rx="28" ry="14"/>',
 HEART:'<path d="M105 177 C86 156 77 183 120 210 C163 183 154 156 135 177 L120 187 Z"/>',
 BRAIN:'<path d="M103 64 Q97 56 103 50 Q111 47 115 53 Q121 42 129 51 Q140 47 141 58 Q149 66 139 72 Q128 79 118 71 Q107 77 103 64 Z"/>',
 BONE:'<path d="M93 203 L134 217"/>'
 };
 return `<svg class="monster-svg" viewBox="0 0 240 250" role="img" aria-label="מפלצת כחולה, רכה וחמודה, עם איבר חסר" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <radialGradient id="pwBlueFur" cx="30%" cy="22%" r="85%"><stop stop-color="#b4f7ff"/><stop offset=".45" stop-color="#64d5fa"/><stop offset=".82" stop-color="#31b3ef"/><stop offset="1" stop-color="#2798d5"/></radialGradient>
  <linearGradient id="pwPurplePaw" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d1a0ff"/><stop offset="1" stop-color="#8453cf"/></linearGradient>
  <linearGradient id="pwPurpleFur" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d7a0ff"/><stop offset="1" stop-color="#9155cc"/></linearGradient>
  <radialGradient id="pwIrisPurple"><stop stop-color="#28194e"/><stop offset=".6" stop-color="#8650c6"/><stop offset="1" stop-color="#a873e4"/></radialGradient>
  <linearGradient id="pwHorn" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff7b4"/><stop offset=".45" stop-color="#ffda5a"/><stop offset="1" stop-color="#ee9c29"/></linearGradient>
 </defs>
 <ellipse cx="120" cy="241" rx="91" ry="6" fill="#8565ab" opacity=".18"/>
 <!-- cute yellow horns behind head -->
 <path d="M75 58 Q55 37 64 9 Q82 18 91 51 Z M151 51 Q159 16 179 10 Q188 36 168 58 Z" fill="url(#pwHorn)" stroke="#d99b38" stroke-width="2.5"/>
 <path d="M70 23 L80 30 M171 25 L163 32" stroke="#fff1a3" stroke-width="3" stroke-linecap="round"/>
 <!-- fuzzy round body -->
 <path d="M64 146 Q55 155 59 168 Q47 182 59 192 Q52 211 70 216 Q78 233 98 224 Q118 238 136 227 Q157 234 168 217 Q190 211 182 192 Q195 181 181 165 Q181 144 163 136 Q117 124 75 137 Z" fill="url(#pwBlueFur)" stroke="#329dd7" stroke-width="2.5"/>
 <path d="M75 157 Q86 145 105 143" stroke="#e3faff" stroke-width="7" stroke-linecap="round" opacity=".4" fill="none"/>
 <g fill="#a676e1" opacity=".95"><ellipse cx="80" cy="182" rx="12" ry="15" transform="rotate(-18 80 182)"/><ellipse cx="164" cy="178" rx="13" ry="15" transform="rotate(20 164 178)"/><circle cx="91" cy="209" r="5"/></g>
 <!-- left arm, left foot, repairable right limbs -->
 <path d="M68 145 Q47 144 34 163 Q24 180 36 191 Q49 197 59 183 L76 166 Z" fill="url(#pwBlueFur)" stroke="#40a7e1" stroke-width="2"/>
 <path d="M39 175 Q25 176 24 188 Q20 201 35 204 Q50 208 54 194" fill="url(#pwBlueFur)" stroke="#40a7e1" stroke-width="2"/>
 ${arm}
 <ellipse cx="93" cy="225" rx="27" ry="14" fill="url(#pwPurplePaw)" stroke="#8450a9" stroke-width="2"/>
 <path d="M83 219 L81 231 M93 218 L93 232 M104 219 L105 231" stroke="#b787e4" stroke-width="3" stroke-linecap="round"/>
 ${leg}
 ${heart}${bone}${head}
 <g class="repair-placeholder" fill="none" stroke="#fffefa" stroke-width="3.6" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round">${markers[missing]}</g>
 <g class="repair-sparkles" fill="#ffed8b"><path d="M29 84 L35 98 L49 104 L35 110 L29 125 L23 110 L9 104 L23 98 Z"/><path d="M206 39 L211 52 L224 57 L211 62 L206 76 L201 62 L188 57 L201 52 Z"/><circle cx="220" cy="150" r="6"/><circle cx="24" cy="161" r="5"/></g>
 </svg>`;
}
function renderCase(){caseLocked=false;const w=caseList[caseIndex],colors=['#66d2f9','#67cbf5','#7edcf9','#53c4f4','#78d6ff'];const color=colors[caseIndex%colors.length];const wrong=shuffle(ALL.filter(x=>x!==w&&x[0]!==w[0])).slice(0,2),choices=shuffle([w,...wrong]);$('activity').innerHTML=heading(caseFinal?'🏆 אתגר הסיום הגדול':'🏥 בית החולים הקסום',caseFinal?'מצילים את כל המפלצות!':'מצילים את המפלצות!','למפלצת באמת חסר איבר בגוף! הקשיבו למילה באנגלית, בחרו את התמונה הנכונה וראו איך האיבר חוזר אליה בקסם!')+'<div class="hospital-hud"><span>💗 מטופל <b>'+(caseIndex+1)+' / '+caseList.length+'</b></span><span>⭐ כוכבים <b>'+caseStars+'</b></span></div><div class="hospital-room"><div class="hospital-decoration">✨　💊　🌈　🩹　🧸　✨</div><div class="clinic-scene" aria-hidden="true"><div class="clinic-sign">✚</div><div class="clinic-cabinet"><span>🧴</span><span>🧪</span><span>🩹</span></div><div class="clinic-plant">🪴</div><div class="clinic-bed"><div class="clinic-pillow"></div></div><div class="clinic-window">☁️</div></div><div class="monster-wrap"><div class="monster monster-illustrated" id="monster" data-missing="'+w[0]+'" style="--monster:'+color+'" aria-label="מפלצת שחסר לה '+w[1]+'">'+monsterIllustration(w)+'</div><div class="monster-speech" lang="en">Oh no! My '+w[0]+'!</div></div><div class="case-prompt">איזה איבר חסר למפלצת? <button class="listen-case" id="listenCase" type="button">🔊 לשמוע שוב</button></div><div class="case-choices" id="caseChoices">'+choices.map((v,i)=>'<button type="button" class="case-choice" data-choice="'+i+'" aria-label="תמונה '+(i+1)+'" title="בחרו תמונה">'+v[2]+'</button>').join('')+'</div><div class="case-feedback" id="caseFeedback" aria-live="polite">בחרו את התמונה הנכונה — וראו מה יקרה למפלצת! ✨</div></div>';$('listenCase').onclick=()=>speak(w[0]);$('caseChoices').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>chooseCase(choices[Number(b.dataset.choice)],w,b));speak(w[0])}
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