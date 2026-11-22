/* PLAYWISE · Human Body Kingdom: learn → monster hospital → boy matching ×3 + finale */
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
const stages=['learn','hospital','match'];
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
function stepNav(){const labels=[['📚','לומדים','LEARN'],['👾','מצילים','HOSPITAL'],['🎯','מחברים','MATCH']];$('stepper').innerHTML=labels.map((a,i)=>'<button type="button" class="step '+(stages[i]===phase?'current':i<stages.indexOf(phase)?'done':'')+'" data-step="'+i+'" '+(i>maxStep[chapter]&&!awards.chapters[chapter]?'disabled':'')+'><span>'+a[0]+'</span> '+(i+1)+'. '+a[1]+' <small lang="en">'+a[2]+'</small></button>').join('<span class="step-arrow">←</span>');$('stepper').querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.step);if(i<=maxStep[chapter]||awards.chapters[chapter])goStep(stages[i])})}
function openChapter(i){chapter=i;phase='learn';selected=-1;seen[i]=new Set();matched[i]=new Set();maxStep[i]=awards.chapters[i]?2:0;render()}
function goStep(next){phase=next;selected=-1;maxStep[chapter]=Math.max(maxStep[chapter],stages.indexOf(next));render()}
function render(){chapterNav();$('chapterTag').textContent=CHAPTERS[chapter].emoji+' פרק '+(chapter+1)+' · '+CHAPTERS[chapter].title;$('chapterCount').textContent=CHAPTERS[chapter].words.length+' מילים';stepNav();if(phase==='learn')renderLearn();else if(phase==='match')renderMatch();else if(phase==='hospital')startHospital(false);else if(phase==='done')renderDone();else if(phase==='final')renderFinal();else if(phase==='worldDone')renderWorldDone()}
function bindSpots(mode){$('bodyStage').querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.target);if(mode==='learn')learnWord(i);else matchTarget(i)})}
function learnWord(i){const w=CHAPTERS[chapter].words[i];seen[chapter].add(i);$('spoken').innerHTML='🔊 <strong lang="en">'+w[0]+'</strong> · '+w[1];$('learnCount').textContent='הכרנו '+seen[chapter].size+' מתוך '+CHAPTERS[chapter].words.length+' מילים';$('diagramDots').innerHTML=CHAPTERS[chapter].words.map((_,j)=>'<span class="diagram-dot '+(seen[chapter].has(j)?'on':'')+'"></span>').join('');$('learnCards').querySelectorAll('[data-learn]').forEach(b=>b.classList.toggle('seen',seen[chapter].has(Number(b.dataset.learn))));$('bodyStage').querySelectorAll('[data-target]').forEach(b=>b.classList.toggle('active',Number(b.dataset.target)===i));$('bodyStage').querySelectorAll('[data-line]').forEach(b=>b.classList.toggle('arrow-active',Number(b.dataset.line)===i));speak(w[0])}
function renderLearn(){const c=CHAPTERS[chapter];$('activity').innerHTML=heading('📚 תחנת הלמידה','מכירים את חלקי הגוף!','החצים הכחולים יוצאים מאיברי הגוף אל המילים שמסביב. לחצו על שם איבר או על כרטיסייה כדי לשמוע את ההגייה באנגלית.')+'<div class="learn-layout"><div class="avatar-panel"><div class="avatar-caption">🌟 עקבו אחרי החצים ולחצו על המילים מסביב לדמות!</div>'+avatar('learn')+'<div class="spoken" id="spoken" aria-live="polite">👆 לחצו על מילה כדי לשמוע אותה!</div><div class="diagram-toolbar"><a class="diagram-back" href="adventure-map.html">⬅ חזרה</a><div class="diagram-dots" id="diagramDots" aria-label="מילים שכבר שמענו">'+c.words.map((_,i)=>'<span class="diagram-dot '+(seen[chapter].has(i)?'on':'')+'"></span>').join('')+'</div><button class="diagram-next" id="nextMatchBoard" type="button">המשך ➜</button></div></div><div class="learn-side"><h3>📖 אוצר המילים שלנו</h3><div class="learn-cards" id="learnCards">'+c.words.map((w,i)=>'<button class="learn-card '+(seen[chapter].has(i)?'seen':'')+'" data-learn="'+i+'"><span class="picture">'+w[2]+'</span><strong lang="en">'+w[0]+'</strong><small>'+w[1]+'</small><span>🔊</span></button>').join('')+'</div><p class="learn-progress" id="learnCount">הכרנו '+seen[chapter].size+' מתוך '+c.words.length+' מילים</p><button type="button" class="big-button" id="nextMatch">👾 למדנו! בואו נציל מפלצות</button></div></div>';$('learnCards').querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>learnWord(Number(b.dataset.learn)));bindSpots('learn');$('nextMatch').onclick=()=>goStep('hospital');$('nextMatchBoard').onclick=()=>goStep('hospital')}
function renderMatch(){const c=CHAPTERS[chapter];$('activity').innerHTML=heading('🎯 תחנת ההתאמה','איפה נמצא כל איבר?','המילים נמצאות למעלה! בחרו מילה באנגלית, ואז לחצו על סימן השאלה בקצה החץ שמצביע על האיבר הנכון.')+'<div class="match-status"><span>🧩 <b id="matchCount">'+matched[chapter].size+' / '+c.words.length+'</b></span><span>⭐ <b id="matchStars">'+matched[chapter].size+'</b></span></div><div class="match-layout"><div class="match-side match-words-top"><h3>🧩 בחרו מילה ולחצו על סימן השאלה המתאים</h3><div class="word-chips" id="wordChips">'+c.words.map((w,i)=>matched[chapter].has(i)?'':'<button type="button" class="chip '+(selected===i?'selected':'')+'" data-chip="'+i+'" draggable="true" lang="en">'+w[0]+'</button>').join('')+'</div></div><div class="match-stage">'+avatar('match')+'</div><div class="match-footer"><div class="match-feedback" id="matchFeedback" aria-live="polite">👆 בחרו מילה למעלה, ואז לחצו על סימן השאלה ליד הילד</div><button class="big-button" id="nextHospital" type="button" '+(matched[chapter].size===c.words.length?'':'hidden')+'>🏆 כל הכבוד! סיימנו את הפרק</button></div></div>';
bindSpots('match');$('wordChips').querySelectorAll('[data-chip]').forEach(b=>{b.onclick=()=>selectChip(Number(b.dataset.chip));b.ondragstart=e=>{selected=Number(b.dataset.chip);if(e.dataTransfer)e.dataTransfer.setData('text/plain',String(selected))}});$('bodyStage').querySelectorAll('[data-target]').forEach(b=>{b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();matchTarget(Number(b.dataset.target))}});$('nextHospital').onclick=()=>finishChapter()}
function selectChip(i){selected=i;$('wordChips').querySelectorAll('[data-chip]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.chip)===i));$('matchFeedback').textContent='עכשיו מצאו את המקום של '+CHAPTERS[chapter].words[i][0]+' על הדמות!';speak(CHAPTERS[chapter].words[i][0])}
function matchTarget(i){if(phase!=='match'||selected<0||matched[chapter].has(i))return;const feedback=$('matchFeedback');if(i!==selected){feedback.textContent='אופס, לא בדיוק! נסו שוב 💜';feedback.className='match-feedback bad';speak(CHAPTERS[chapter].words[selected][0]);return}const w=CHAPTERS[chapter].words[i];matched[chapter].add(i);selected=-1;renderMatch();$('matchFeedback').textContent='⭐ נהדר! '+w[0]+' = '+w[1];$('matchFeedback').className='match-feedback good';speak(w[0])}
function hospitalCases(final){return shuffle(final?ALL:CHAPTERS[chapter].words)}
function startHospital(final){caseFinal=final;caseList=hospitalCases(final);caseIndex=0;caseStars=0;caseLocked=false;renderCase()}
/* Every patient actually LACKS the requested part until the correct answer is chosen.
   SVG groups let the missing part pop onto the character instead of merely showing a success message. */
function monsterIllustration(word){
 // This is the actual approved 3D monster image, not a hand-drawn SVG imitation.
 // A separate mask hides the requested anatomical part until the correct answer.
 const missing=word[0];
 const src='assets/playwise-monster-3d.svg?v=approved3d1';
 const shapes={
  HEAD:'<path d="M10 0H210V176H10Z"/>',
  HAIR:'<ellipse cx="112" cy="27" rx="52" ry="32"/>',
  EYES:'<ellipse cx="79" cy="107" rx="32" ry="35"/><ellipse cx="145" cy="107" rx="32" ry="35"/>',
  EARS:'<ellipse cx="20" cy="126" rx="24" ry="26"/><ellipse cx="201" cy="126" rx="24" ry="26"/>',
  NOSE:'<ellipse cx="112" cy="125" rx="18" ry="12"/>',
  MOUTH:'<ellipse cx="112" cy="152" rx="36" ry="26"/>',
  HAND:'<ellipse cx="198" cy="193" rx="24" ry="28"/>',
  ARM:'<path d="M165 153 Q188 160 208 183 L219 209 L197 219 Q173 201 161 172 Z"/>',
  FINGER:'<ellipse cx="205" cy="204" rx="11" ry="13"/>',
  LEG:'<ellipse cx="159" cy="231" rx="46" ry="28"/>',
  FOOT:'<ellipse cx="159" cy="231" rx="43" ry="26"/>',
  TEETH:'<ellipse cx="95" cy="146" rx="11" ry="8"/><ellipse cx="126" cy="146" rx="11" ry="8"/>',
  TONGUE:'<ellipse cx="112" cy="167" rx="21" ry="11"/>',
  HEART:'<path d="M84 201 Q76 188 91 185 Q105 184 112 193 Q122 183 135 187 Q152 193 139 207 L112 230 Z"/>',
  BRAIN:'<ellipse cx="112" cy="60" rx="26" ry="21"/>',
  BONE:'<rect x="99" y="207" width="27" height="14" rx="7"/>'
 };
 const markers={
  HEAD:[111,97],HAIR:[112,29],EYES:[112,107],EARS:[110,126],NOSE:[112,125],
  MOUTH:[112,152],HAND:[199,196],ARM:[189,182],FINGER:[205,206],
  LEG:[160,233],FOOT:[160,233],TEETH:[111,146],TONGUE:[112,166],
  HEART:[112,207],BRAIN:[112,57],BONE:[112,216]
 };
 const xy=markers[missing]||[112,126];
 const patches={
  EYES:'<ellipse cx="79" cy="107" rx="32" ry="35" fill="url(#pwSoftBlue)"/><ellipse cx="145" cy="107" rx="32" ry="35" fill="url(#pwSoftBlue)"/>',
  NOSE:'<ellipse cx="112" cy="125" rx="18" ry="12" fill="url(#pwSoftBlue)"/>',
  MOUTH:'<ellipse cx="112" cy="152" rx="36" ry="26" fill="url(#pwSoftBlue)"/>',
  TEETH:'<ellipse cx="95" cy="146" rx="11" ry="8" fill="#6b1635"/><ellipse cx="126" cy="146" rx="11" ry="8" fill="#6b1635"/>',
  TONGUE:'<ellipse cx="112" cy="167" rx="21" ry="11" fill="#761c39"/>',
  HEART:'<path d="M84 201 Q76 188 91 185 Q105 184 112 193 Q122 183 135 187 Q152 193 139 207 L112 230 Z" fill="#f6fdff"/>',
  HAIR:'<ellipse cx="112" cy="46" rx="48" ry="26" fill="url(#pwSoftBlue)"/>',
  BRAIN:'<ellipse cx="112" cy="60" rx="26" ry="21" fill="url(#pwSoftBlue)"/>',
  BONE:'<rect x="99" y="207" width="27" height="14" rx="7" fill="#47bdf4"/>'
 };
 const bonus=missing==='BRAIN'?'<text x="112" y="68" text-anchor="middle" font-size="32">🧠</text>':
             missing==='BONE'?'<text x="112" y="226" text-anchor="middle" font-size="27">🦴</text>':'';
 return '<svg class="monster-svg monster-3d-svg" viewBox="0 0 220 256" role="img" aria-label="מפלצת תלת־ממדית כחולה וחמודה, עם איבר חסר" xmlns="http://www.w3.org/2000/svg">'+
 '<defs><radialGradient id="pwSoftBlue"><stop stop-color="#81e9ff"/><stop offset=".7" stop-color="#4fc6f8"/><stop offset="1" stop-color="#31b5ef"/></radialGradient>'+
 '<mask id="pwMissingMask"><rect width="220" height="256" fill="white"/><g fill="black">'+shapes[missing]+'</g></mask>'+
 '</defs>'+
 '<g class="monster-soft-patches">'+(patches[missing]||'')+'</g>'+
 '<image class="monster-base-image" href="'+src+'" width="220" height="256" preserveAspectRatio="xMidYMid meet" mask="url(#pwMissingMask)"/>'+
 '<g class="monster-part needs-repair" data-part="'+missing+'"><image href="'+src+'" width="220" height="256" preserveAspectRatio="xMidYMid meet"/>'+bonus+'</g>'+
 '<g class="repair-placeholder" aria-hidden="true"><circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="'+(missing==='HEAD'?30:missing==='EYES'?13:10)+'" fill="#fff7cb" stroke="#ffc957" stroke-width="2.5" stroke-dasharray="4 4" opacity=".87"/><text x="'+xy[0]+'" y="'+(xy[1]+6)+'" text-anchor="middle" font-size="20" font-weight="900" fill="#9b64c8">?</text></g>'+
 '<g class="repair-sparkles" aria-hidden="true"><path d="M25 70 L30 83 L43 88 L30 93 L25 106 L20 93 L7 88 L20 83 Z M195 37 L200 50 L213 55 L200 60 L195 73 L190 60 L177 55 L190 50 Z" fill="#fff2a2"/><circle cx="207" cy="175" r="4" fill="#ffd66b"/></g></svg>';
}
function renderCase(){caseLocked=false;const w=caseList[caseIndex],colors=['#66d2f9','#67cbf5','#7edcf9','#53c4f4','#78d6ff'];const color=colors[caseIndex%colors.length];const wrong=shuffle(ALL.filter(x=>x!==w&&x[0]!==w[0])).slice(0,2),choices=shuffle([w,...wrong]);$('activity').innerHTML=heading(caseFinal?'🏆 אתגר הסיום הגדול':'🏥 בית החולים הקסום',caseFinal?'מצילים את כל המפלצות!':'מצילים את המפלצות!','למפלצת באמת חסר איבר בגוף! הקשיבו למילה באנגלית, בחרו את התמונה הנכונה וראו איך האיבר חוזר אליה בקסם!')+'<div class="hospital-hud"><span>💗 מטופל <b>'+(caseIndex+1)+' / '+caseList.length+'</b></span><span>⭐ כוכבים <b>'+caseStars+'</b></span></div><div class="hospital-room"><div class="hospital-decoration">✨　💊　🌈　🩹　🧸　✨</div><div class="clinic-scene" aria-hidden="true"><div class="clinic-sign">✚</div><div class="clinic-cabinet"><span>🧴</span><span>🧪</span><span>🩹</span></div><div class="clinic-plant">🪴</div><div class="clinic-bed"><div class="clinic-pillow"></div></div><div class="clinic-window">☁️</div></div><div class="monster-wrap"><div class="monster monster-illustrated" id="monster" data-missing="'+w[0]+'" style="--monster:'+color+'" aria-label="מפלצת שחסר לה '+w[1]+'">'+monsterIllustration(w)+'</div><div class="monster-speech" lang="en">Oh no! My '+w[0]+'!</div></div><div class="case-prompt">איזה איבר חסר למפלצת? <button class="listen-case" id="listenCase" type="button">🔊 לשמוע שוב</button></div><div class="case-choices" id="caseChoices">'+choices.map((v,i)=>'<button type="button" class="case-choice" data-choice="'+i+'" aria-label="תמונה '+(i+1)+'" title="בחרו תמונה">'+v[2]+'</button>').join('')+'</div><div class="case-feedback" id="caseFeedback" aria-live="polite">בחרו את התמונה הנכונה — וראו מה יקרה למפלצת! ✨</div></div>';$('listenCase').onclick=()=>speak(w[0]);$('caseChoices').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>chooseCase(choices[Number(b.dataset.choice)],w,b));speak(w[0])}
function chooseCase(choice,correct,button){if(caseLocked)return;if(choice!==correct){button.classList.add('wrong');$('caseFeedback').textContent='כמעט! הקשיבו שוב ונסו תמונה אחרת 💜';$('caseFeedback').className='case-feedback bad';speak(correct[0]);return}caseLocked=true;caseStars++;button.classList.add('right');$('monster').classList.add('repaired','happy');$('monster').setAttribute('aria-label','מפלצת שמחה — הוספנו לה '+correct[1]);$('caseFeedback').textContent='✨ קסם! '+correct[0]+' = '+correct[1]+' · האיבר הופיע על המפלצת!';$('caseFeedback').className='case-feedback good';speak(correct[0]);setTimeout(()=>{caseIndex++;if(caseIndex<caseList.length)renderCase();else finishHospital()},1850)}
function finishHospital(){if(caseFinal){awards.final=true;saveAwards();try{localStorage.setItem(COMPLETE,'complete')}catch(e){}phase='worldDone';render();return}phase='match';maxStep[chapter]=Math.max(maxStep[chapter],stages.indexOf('match'));render()}
function finishChapter(){if(matched[chapter].size!==CHAPTERS[chapter].words.length)return;awards.chapters[chapter]=true;saveAwards();phase='done';render()}
function renderDone(){const c=CHAPTERS[chapter];$('activity').innerHTML='<div class="celebration"><div class="big-trophy">🏆🎉</div><h2>הצלתם את המפלצות והתאמתם את כל המילים!</h2><p>למדתם '+c.words.length+' מילים באנגלית, עזרתם למפלצות ואז חיברתם את המילים לגוף הילד! מדהימים!</p><div class="celebration-stars">⭐ ⭐ ⭐</div><button class="big-button" id="goNext">'+(chapter===2?'👑 לאתגר הסיום הגדול!':'✨ לפרק הבא')+'</button><button class="soft-button" id="replayChapter">🔄 לשחק בפרק שוב</button></div>';$('goNext').onclick=()=>{if(chapter===2){phase='final';render()}else openChapter(chapter+1)};$('replayChapter').onclick=()=>openChapter(chapter)}
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