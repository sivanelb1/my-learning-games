(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var canvas=$("gameCanvas"),ctx=canvas.getContext("2d"),screen=$("gameScreen");
if(!ctx){$("gameStatus").textContent="הדפדפן אינו תומך במשחק הזה.";return}
var STORAGE="playwise-family-magic-progress-v1";
var group=new URLSearchParams(location.search).get("set")==="2"?2:1;
var TOWER_KEY="playwise-family-gift-tower-"+(group===1?"first":"second")+"-v1";
var SETS=[
[["MOTHER","אמא","Maya","מאיה","👩","1f469"],["FATHER","אבא","Daniel","דניאל","👨","1f468"],["SISTER","אחות","Noa","נועה","👧","1f467"],["BROTHER","אח","Leo","לאו","👦","1f466"],["BABY","תינוק","Tom","תום","👶","1f476"],["SON","בן","Ben","בן","🧒","1f9d2"],["DAUGHTER","בת","Ella","אלה","👧","1f467"],["PARENTS","הורים","Maya & Daniel","מאיה ודניאל","👨‍👩","1f468-200d-1f469"]],
[["GRANDMA","סבתא","Ruth","רות","👵","1f475"],["GRANDPA","סבא","David","דוד","👴","1f474"],["GRANDMOTHER","סבתא","Sara","שרה","👵","1f475"],["GRANDFATHER","סבא","Jacob","יעקב","👴","1f474"],["AUNT","דודה","Leah","לאה","👩‍🦰","1f469-200d-1f9b0"],["UNCLE","דוד","Ron","רון","👨‍🦱","1f468-200d-1f9b1"],["COUSIN","בן או בת דוד/ה","Mika","מיקה","🧑","1f9d1"],["FAMILY","משפחה","The Bloom Family","משפחת בלום","👨‍👩‍👧‍👦","1f468-200d-1f469-200d-1f467-200d-1f466"]]
];
var PEOPLE=SETS[group-1].map(function(a){return {en:a[0],he:a[1],name:a[2],nameHe:a[3],face:a[4],code:a[5]}});
var GIFTS=[
{color:"#ef9ac4",ribbon:"#fff1aa",item:"🧸",en:"TEDDY BEAR",he:"דובי"},
{color:"#a6b1ef",ribbon:"#fff0b5",item:"📚",en:"BOOKS",he:"ספרים"},
{color:"#87d5ba",ribbon:"#fff3bd",item:"🛴",en:"SCOOTER",he:"קורקינט"},
{color:"#f6bc78",ribbon:"#ffe3ec",item:"🎨",en:"PAINT SET",he:"ערכת ציור"},
{color:"#ed9ed9",ribbon:"#fff5b6",item:"🚂",en:"TOY TRAIN",he:"רכבת צעצוע"},
{color:"#92c7ef",ribbon:"#ffe7b0",item:"⚽",en:"FOOTBALL",he:"כדורגל"},
{color:"#a7df9c",ribbon:"#fff3c7",item:"🪁",en:"KITE",he:"עפיפון"},
{color:"#f6b28e",ribbon:"#fff3b4",item:"🎂",en:"BIRTHDAY CAKE",he:"עוגת יום הולדת"}
];
var state={awake:[[],[],[],[]],party:[],final:[],placements:{}},delivered=[],difficulty=0;

function load(){try{var s=JSON.parse(localStorage.getItem(STORAGE)||"{}");if(s&&Array.isArray(s.awake)&&s.awake.length===4){state.awake=s.awake;state.party=Array.isArray(s.party)?s.party.filter(function(i){return Number.isInteger(i)&&i>=0&&i<4}):[];state.final=Array.isArray(s.final)?s.final:[];state.placements=s.placements&&typeof s.placements==="object"?s.placements:{}}}catch(e){}}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));if(delivered.length===8)localStorage.setItem(TOWER_KEY,JSON.stringify(delivered))}catch(e){}}
var stage=0,playing=false,paused=false,muted=false,overlayMode="intro",last=0,elapsed=0,cameraY=0,keys={left:false,right:false},jumpBuffer=0,particles=[],platforms=[],blackHoles=[],checkpoint=0,finishLock=false,frame=0,pressSince=0,hasMoved=false,voice=null,audio=null,failureReason="";
var player={x:450,y:512,w:60,h:59,vx:0,vy:0,onGround:false,coyote:0,walk:0,face:1,spin:0,angle:0};
var W=900,H=620,GRAVITY=1720,SPEED=385,JUMP=-755,MAX_FALL=1030;
function setStatus(msg){$("gameStatus").textContent=msg}
function sound(type){if(muted)return;try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audio)audio=new AC();if(audio.state==="suspended")audio.resume();var now=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type="sine";var notes=type==="jump"?[370,520]:type==="win"?[660,880]:type==="bad"?[220,170]:[540,700];o.frequency.setValueAtTime(notes[0],now);o.frequency.exponentialRampToValueAtTime(notes[1],now+.12);g.gain.setValueAtTime(.055,now);g.gain.exponentialRampToValueAtTime(.001,now+.18);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+.19)}catch(e){}}
function speak(word){if(muted||!("speechSynthesis" in window))return;try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(word);u.lang="en-US";u.rate=.78;u.pitch=1.06;speechSynthesis.speak(u)}catch(e){}}
function rand(a,b){return a+Math.random()*(b-a)}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),v=a[i];a[i]=a[j];a[j]=v}return a}
// Difficulty increases across each eight-gift adventure. Tower 2 begins
// around the difficulty of the later levels of Tower 1, not at beginner level.
var LEVELS=[
[{moving:0,spikes:0,holes:0},{moving:1,spikes:0,holes:0},
 {moving:2,spikes:0,holes:0},{moving:2,spikes:1,holes:0},
 {moving:3,spikes:1,holes:1},{moving:3,spikes:2,holes:1},
 {moving:4,spikes:2,holes:2},{moving:5,spikes:3,holes:2}],
[{moving:4,spikes:2,holes:1},{moving:5,spikes:2,holes:2},
 {moving:5,spikes:3,holes:2},{moving:6,spikes:3,holes:2},
 {moving:6,spikes:3,holes:3},{moving:6,spikes:4,holes:3},
 {moving:7,spikes:4,holes:3},{moving:7,spikes:4,holes:3}]
];
var profile=LEVELS[group-1][0];
// The main path is always reachable. The only rows with two trampolines
// are rows with a black hole BETWEEN them, providing a safe choice.
var MAIN_CENTERS=[450,490,550,490,430,470,520,480,430,490,530];
var HOLE_ROWS=[[],[5],[3,7],[2,5,8]];
function makePlatforms(){
var result=[],holeRows=HOLE_ROWS[profile.holes],movingCandidates=[2,4,6,8,3,7,9,1,5].filter(function(i){return !holeRows.includes(i)});
var movingRows=movingCandidates.slice(0,profile.moving);
var speedBoost=(group===2?.32:0)+stage*.055;
for(var i=0;i<MAIN_CENTERS.length;i++){
var w=i===0?900:i===10?230:190,center=MAIN_CENTERS[i];
var x=i===0?0:center-w/2,moving=movingRows.includes(i);
var amp=moving?28+Math.min(31,stage*3)+(group===2?7:0):0;
result.push({x:x,baseX:x,y:570-i*95,w:w,h:20,index:i,moving:moving,amp:amp,speed:.82+speedBoost+i*.035,phase:i*1.12,bounce:0,gold:(group===1?stage>=6:stage>=3)&&[3,6,9].includes(i),hazard:false});
}
// A fork is *always* paired with a hole. No hole means only one platform.
holeRows.forEach(function(i){
var main=result[i],safeCenter=main.baseX+main.w/2;
var side=safeCenter>=475?-1:1,otherCenter=safeCenter+side*300;
otherCenter=Math.max(105,Math.min(795,otherCenter));
var w=170,otherX=otherCenter-w/2;
result.push({x:otherX,baseX:otherX,y:main.y,w:w,h:20,index:i,moving:false,amp:0,speed:0,phase:0,bounce:0,gold:false,hazard:false,fork:true});
});
// Spike patches sit on the EDGES of existing platforms; they do not
// introduce a third route or create an impossible full-width spike row.
var spikeCandidates=[4,7,2,9,6,3,8,5].filter(function(i){return !holeRows.includes(i)});
spikeCandidates.slice(0,profile.spikes).forEach(function(i,j){
var parent=result[i],width=43,left=(j+stage)%2===0,offset=left?8:parent.w-width-8;
result.push({x:parent.x+offset,baseX:parent.baseX+offset,y:parent.y,w:width,h:20,index:i,hazard:true,spikePatch:true,parentIndex:i,offset:offset,moving:false,bounce:0});
});
return result
}
function makeBlackHoles(){
var holes=[];
HOLE_ROWS[profile.holes].forEach(function(i){
var safe=platforms[i],other=platforms.find(function(p){return p.fork&&p.index===i});
if(!other)return;
var safeCenter=safe.baseX+safe.w/2,otherCenter=other.baseX+other.w/2;
holes.push({x:safeCenter+(otherCenter-safeCenter)*.6,y:safe.y-67,r:28+(group===2?3:0),pull:group===2?112:100,row:i});
});
return holes
}
function movePlatforms(){
for(var i=0;i<platforms.length;i++){var p=platforms[i];if(p.moving)p.x=p.baseX+Math.sin(elapsed*p.speed+p.phase)*p.amp}
for(var j=0;j<platforms.length;j++){var patch=platforms[j];if(patch.spikePatch)patch.x=platforms[patch.parentIndex].x+patch.offset}
}
function resetPlayer(atCheckpoint){var p=platforms[atCheckpoint?checkpoint:0];player.x=p.x+p.w/2;player.y=p.y-player.h;player.vx=0;player.vy=JUMP;player.onGround=false;player.coyote=0;player.face=1;player.spin=0;player.angle=0;cameraY=Math.min(0,player.y-320);jumpBuffer=0}
function setupStage(n){stage=n;difficulty=Math.min(3,Math.floor((n+1)/2));profile=LEVELS[group-1][n];elapsed=0;platforms=makePlatforms();blackHoles=makeBlackHoles();checkpoint=0;particles=[];finishLock=false;resetPlayer(false);setHud();$("worldLabel").textContent=(group===2?"⚡ מגדל האתגרים · ":"🎁 מגדל המתנות · ")+(n+1)+" / 8";$("floatingHint").classList.remove("faded");hasMoved=false;setStatus(profile.holes?"🕳️ חור שחור! רק כאן יש שני מסלולים — בחרו את הצד הבטוח!":profile.spikes?"⚠️ דוקרנים על שולי הטרמפולינות! נחתו במרכז.":"🎁 קפצו בין הטרמפולינות עד לפסגה!")}
function setHud(){$("hudRecipient").textContent="🎁 מי הביא אותה?";$("hudFloor").textContent=(stage+1)+" / 8";$("stageDots").innerHTML="";for(var i=0;i<8;i++){var dot=document.createElement("i");dot.className=delivered.includes(i)?"done":i===stage?"current":"";$("stageDots").append(dot)}}
function showHeight(){var h=Math.round(Math.max(0,Math.min(100,(570-(player.y+player.h))/950*100)));$("hudHeight").textContent=h+"%"}
function spawn(x,y,count,color){for(var i=0;i<count;i++)particles.push({x:x,y:y,vx:rand(-145,145),vy:rand(-180,-35),life:rand(.35,.85),age:0,size:rand(3,8),color:color||["#ffe2a0","#fff","#f7a7d0","#a5edc7"][i%4]})}
function setOverlay(mode){overlayMode=mode;playing=false;keys.left=false;keys.right=false;var oldReplay=$("overlayActions").querySelector(".tower-replay");if(oldReplay)oldReplay.remove();$("gameOverlay").hidden=false;$("wordPreview").innerHTML="";$("quizOptions").hidden=true;$("quizOptions").innerHTML="";$("giftReveal").hidden=true;$("giftReveal").innerHTML="";$("overlayActions").hidden=false;$("overlayPrimary").hidden=false;
var icon=$("overlayIcon"),tag=$("overlayTag"),title=$("overlayTitle"),desc=$("overlayText"),btn=$("overlayPrimary"),gift=GIFTS[stage];
if(mode==="intro"){icon.textContent="🎂🎈🎁";tag.textContent="MY BIRTHDAY SURPRISE · הפתעת יום ההולדת";title.textContent="כולם הגיעו לחגוג את יום ההולדת שלי!";desc.textContent="כולם הביאו לי מתנות! במשחק הזה נגלה שמונה מתנות של "+(group===1?"המשפחה הקרובה, ההורים והילדים":"הסבים, הסבתות וקרובי המשפחה")+". בכל פסגה נגלה מי הביא את המתנה ומה מסתתר בפנים! המתנה קופצת לבד — אתם מכוונים אותה בחצים ימינה ושמאלה.";btn.textContent="🎁 בואו נגלה את ההפתעות!";btn.onclick=function(){closeOverlay()}}
else if(mode==="failed"){icon.textContent=failureReason==="hole"?"🕳️💫":"⚠️💥";tag.textContent="GAME OVER · הסיבוב נפסל";title.textContent=failureReason==="hole"?"החור השחור שאב את המתנה!":failureReason==="spikes"?"אוי! נחתתם על הדוקרנים!":"המתנה נפלה מהמגדל!";desc.textContent="הסיבוב הסתיים. חוזרים לתחילת המתנה הנוכחית, בלי נקודות שמירה. המתנות שכבר גיליתם נשמרות! בחרו מסלול אחר והיזהרו מהמכשולים.";btn.textContent="🔄 לנסות את המתנה שוב";btn.onclick=function(){setupStage(stage);closeOverlay()}}
else if(mode==="between"){icon.textContent="🎉"+gift.item+"✨";tag.textContent="SURPRISE FOUND · מצאנו מתנה!";title.textContent="איזו הפתעה!";desc.textContent="גילינו מי הביא את המתנה ומה היה בתוכה! מוכנים לגלות מי הביא את המתנה הבאה?";btn.textContent="⬆️ למתנה המסתורית הבאה!";btn.onclick=function(){setupStage(Math.min(7,stage+1));setOverlay("chapter")}}
else if(mode==="chapter"){icon.textContent="🎁✨";tag.textContent="MYSTERY GIFT "+(stage+1)+" / 8";title.textContent="מי הביא את המתנה הזאת?";desc.textContent="המתנה הבאה בצבע "+["ורוד","סגול","ירוק","כתום","ורוד","כחול","ירוק","כתום"][stage]+"! "+(profile.holes?"יש "+(profile.holes===1?"חור שחור אחד":profile.holes+" חורים שחורים")+"! בכל שורה שיש בה חור שחור יש שתי טרמפולינות, אחת מכל צד. בחרו מסלול בטוח. ":"אין חורים שחורים בשלב הזה, ולכן יש רק טרמפולינה אחת בכל שורה. ")+(profile.spikes?"דוקרנים נמצאים בשולי חלק מהטרמפולינות, ונגיעה בהם פוסלת את הסיבוב. ":"")+(profile.moving?"חלק מהטרמפולינות זזות מצד לצד — תזמנו את הנחיתה. ":"")+" הגיעו לפסגה, גלו מי הביא את המתנה ומה מסתתר בתוכה!";btn.textContent="🌀 קופצים לגלות!";btn.onclick=function(){closeOverlay()}}
else if(mode==="quiz"){icon.textContent="🎁🔍";tag.textContent="MYSTERY SOLVED · גילינו רמז!";title.textContent="מי הביא את המתנה?";desc.textContent="הגעתם לפסגה! עכשיו התג שעל המתנה נחשף. קראו את הרמז באנגלית ובחרו את בן המשפחה שהביא אותה:";var sign=document.createElement("button");sign.type="button";sign.className="sender-sign";sign.textContent="🔊 FROM: "+PEOPLE[stage].en;sign.onclick=function(){speak(PEOPLE[stage].en)};$("wordPreview").append(sign);$("overlayActions").hidden=true;renderQuiz();speak(PEOPLE[stage].en)}
else if(mode==="reveal"){icon.textContent="🎊✨";tag.textContent="GIFT UNBOXED · ההפתעה נפתחה!";title.textContent="וואו! מה היה בתוך המתנה?";desc.textContent=PEOPLE[stage].name+" ("+PEOPLE[stage].nameHe+") הביא/ה לי מתנה!";var panel=$("giftReveal");panel.hidden=false;panel.style.setProperty("--gift-color",gift.color);var from=document.createElement("div");from.className="from-sign";from.textContent="FROM: "+PEOPLE[stage].en+" · "+PEOPLE[stage].he;panel.append(from);var box=document.createElement("div");box.className="gift-unbox";var base=document.createElement("div"),lid=document.createElement("div");base.className="box-base";lid.className="box-lid";var item=document.createElement("span");item.className="gift-content";item.textContent=gift.item;box.append(base,lid,item);panel.append(box);var name=document.createElement("div");name.className="gift-name";name.textContent=gift.en+" · "+gift.he;panel.append(name);var confetti=document.createElement("div");confetti.className="confetti";confetti.textContent="✨ 🎉 ⭐ 🎈 ✨";panel.append(confetti);btn.textContent=stage===7?"🎂 לסיום המסיבה!":"🎁 למתנה הבאה!";btn.onclick=function(){if(stage===7){setOverlay("complete")}else setOverlay("between")};speak(gift.en);sound("win")}
else if(mode==="complete"){icon.textContent="🏆🎂🎈";tag.textContent="HAPPY BIRTHDAY · יום הולדת שמח!";title.textContent="כל שמונה מתנות יום ההולדת נפתחו!";desc.textContent=group===1?"איזה כיף! גילינו את כל שמונה המתנות של המשפחה הקרובה, ההורים והילדים! עכשיו נמשיך לעץ סבא וסבתא.":"איזה כיף! גילינו את כל שמונה המתנות של הסבים, הסבתות וקרובי המשפחה! עכשיו מחכה לנו עץ המשפחה הגדול!";var recap=$("wordPreview");GIFTS.forEach(function(g,i){var c=document.createElement("div");c.className="word-card";var emoji=document.createElement("span");emoji.className="face";emoji.textContent=g.item;var name=document.createElement("strong");name.className="en";name.textContent=g.en;var who=document.createElement("span");who.className="he";who.textContent=PEOPLE[i].en+" · "+PEOPLE[i].he;c.append(emoji,name,who);recap.append(c)});btn.textContent=group===1?"🌺 לעץ סבא וסבתא!":"🌳 לעץ המשפחה הגדול!";btn.onclick=function(){location.href=group===1?"level2-family-tree.html?activity=grandparents":"level2-family-tree.html?activity=final"};var extra=document.createElement("button");extra.type="button";extra.className="secondary-action tower-replay";extra.textContent="🔄 לשחק שוב במגדל";extra.onclick=function(){delivered=[];setupStage(0);setOverlay("intro")};$("overlayActions").append(extra)}
}
function closeOverlay(){$("gameOverlay").hidden=true;playing=true;paused=false;last=0;setStatus("🎁 המתנה קופצת אוטומטית! ⬅️ ➡️ כוונו לטרמפולינה הבאה");$("gameScreen").focus&&$("gameScreen").focus()}
function makeFace(person){var span=document.createElement("span");span.className="face";var img=document.createElement("img");img.className="face-img";img.alt="";img.src="https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/"+person.code+"_3d.png";img.onerror=function(){span.textContent=person.face};span.append(img);return span}
function renderPreview(items){items.forEach(function(p){var b=document.createElement("button");b.type="button";b.className="word-card";b.append(makeFace(p));var en=document.createElement("strong");en.className="en";en.textContent=p.en;b.append(en);var he=document.createElement("span");he.className="he";he.textContent=p.he;b.append(he);var person=document.createElement("span");person.className="person";person.textContent=p.name+" · "+p.nameHe;b.append(person);var listen=document.createElement("span");listen.className="sound";listen.textContent="🔊 לשמוע";b.append(listen);b.onclick=function(){speak(p.en)};$("wordPreview").append(b)})}
function renderQuiz(){var opts=$("quizOptions");opts.hidden=false;var wrong=shuffle([0,1,2,3,4,5,6,7].filter(function(i){return i!==stage})).slice(0,2),order=shuffle([stage].concat(wrong));order.forEach(function(i){var p=PEOPLE[i],b=document.createElement("button");b.type="button";b.className="quiz-option";b.append(makeFace(p));var n=document.createElement("strong");n.textContent=p.name.toUpperCase();b.append(n);var h=document.createElement("small");h.textContent=p.nameHe;b.append(h);b.onclick=function(){if(finishLock)return;if(i===stage){finishLock=true;b.classList.add("correct");sound("win");speak(p.en);spawn(player.x,player.y,24);setStatus("🎉 נכון! "+p.en+" · "+p.he+" הביא/ה את המתנה!");state.party=Array.from(new Set(state.party.concat([stage]))).sort();delivered=Array.from(new Set(delivered.concat([stage]))).sort();save();setHud();setTimeout(function(){finishLock=false;setOverlay("reveal")},650)}else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");sound("bad");setStatus("💜 נסו שוב! הקשיבו לרמז FROM על המתנה ובחרו את בן המשפחה.")}};opts.append(b)})}
function failStage(reason){if(!playing||finishLock)return;failureReason=reason;finishLock=true;spawn(player.x+player.w/2,player.y+player.h/2,30,reason==="hole"?"#a68dff":"#ff9eaf");sound("bad");setStatus(reason==="hole"?"🕳️ החור השחור שאב את המתנה!":reason==="spikes"?"⚠️ הדוקרנים פסלו את הסיבוב!":"💥 המתנה נפלה מהמגדל!");setOverlay("failed");finishLock=false}
function reachTop(){if(finishLock)return;finishLock=true;playing=false;sound("win");spawn(player.x,player.y,35);setStatus("🎁 הגעתם לשער! מי יקבל את המתנה?");setTimeout(function(){setOverlay("quiz");finishLock=false},550)}
function jump(){/* Jumping is automatic after each trampoline landing. */}
function input(){var left=$("leftBtn"),right=$("rightBtn");function hold(el,key){el.addEventListener("pointerdown",function(e){e.preventDefault();if(el.setPointerCapture)el.setPointerCapture(e.pointerId);keys[key]=true;el.classList.add("pressed");hasMoved=true;$("floatingHint").classList.add("faded")});["pointerup","pointercancel","lostpointercapture"].forEach(function(t){el.addEventListener(t,function(){keys[key]=false;el.classList.remove("pressed")})})}hold(left,"left");hold(right,"right");
window.addEventListener("keydown",function(e){var k=e.key;if(["ArrowLeft","ArrowRight"," ","a","A","d","D"].includes(k))e.preventDefault();if(k==="ArrowLeft"||k==="a"||k==="A")keys.left=true;if(k==="ArrowRight"||k==="d"||k==="D")keys.right=true;if(k==="ArrowLeft"||k==="ArrowRight"){hasMoved=true;$("floatingHint").classList.add("faded")}});window.addEventListener("keyup",function(e){var k=e.key;if(k==="ArrowLeft"||k==="a"||k==="A")keys.left=false;if(k==="ArrowRight"||k==="d"||k==="D")keys.right=false});window.addEventListener("blur",function(){keys.left=false;keys.right=false;paused=true;$("pauseNotice").hidden=!playing});window.addEventListener("focus",function(){paused=false;$("pauseNotice").hidden=true;last=0});document.addEventListener("visibilitychange",function(){paused=document.hidden;$("pauseNotice").hidden=!paused||!playing;last=0});
$("soundBtn").onclick=function(){muted=!muted;$("soundBtn").textContent=muted?"🔇 צלילים כבויים":"🔊 צלילים פועלים";if(muted&&"speechSynthesis" in window)speechSynthesis.cancel()};
$("restartBtn").onclick=function(){finishLock=false;checkpoint=0;resetPlayer(false);setStatus("🔄 מתחילים לקפוץ שוב!");if(!$("gameOverlay").hidden&&overlayMode==="quiz")setOverlay("chapter")};
}
function step(dt){
if(!playing||paused)return;
elapsed+=dt;frame++;movePlatforms();
var p=player,desiredV=(keys.right?SPEED:0)-(keys.left?SPEED:0);
p.vx+=(desiredV-p.vx)*Math.min(1,dt*12);if(Math.abs(p.vx)<.4)p.vx=0;if(p.vx)p.face=p.vx>0?1:-1;
p.spin=Math.min(1,p.spin+dt/.64);p.angle=p.spin*Math.PI*2;
var prevBottom=p.y+p.h;p.vy=Math.min(MAX_FALL,p.vy+GRAVITY*dt);
// Nearby black holes pull the gift toward the vortex; reaching the core is fatal.
for(var bh=0;bh<blackHoles.length;bh++){var hole=blackHoles[bh],dx=hole.x-(p.x+p.w/2),dy=hole.y-(p.y+p.h/2),dist=Math.hypot(dx,dy);if(dist<hole.pull){var strength=Math.pow(1-dist/hole.pull,1.3);p.vx+=dx/Math.max(1,dist)*3400*strength*dt;p.vy+=dy/Math.max(1,dist)*4100*strength*dt;if(dist<hole.r+8){failStage("hole");return}}}
p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.x<-p.w/2)p.x=W+p.w/2;if(p.x>W+p.w/2)p.x=-p.w/2;
// Spikes kill on any contact, including when moving upward or sideways.
for(var hi=0;hi<platforms.length;hi++){var hazard=platforms[hi];if(hazard.hazard&&p.vy>=0&&prevBottom<=hazard.y-13&&p.x+p.w*.42>hazard.x+4&&p.x-p.w*.42<hazard.x+hazard.w-4&&p.y+p.h>hazard.y-37&&p.y+p.h<hazard.y+18){failStage("spikes");return}}
if(p.vy>=0){
for(var i=0;i<platforms.length;i++){
var f=platforms[i];
if(prevBottom<=f.y+12&&p.y+p.h>=f.y&&p.x+p.w*.36>f.x&&p.x-p.w*.36<f.x+f.w){
if(f.hazard){failStage("spikes");return}
p.y=f.y-p.h;
if(f.index===10){reachTop();return}
p.vy=JUMP*(f.gold?1.25:f.index%3===0&&f.index>0?1.13:1);
p.spin=0;p.angle=0;sound(f.gold?"win":"jump");
spawn(p.x,f.y,f.gold?27:16,f.gold?"#ffe4a3":["#ffe1a4","#ffd3ed","#a6f6e4"][f.index%3]);f.bounce=1;
if(f.index>=5&&f.index>checkpoint){checkpoint=f.index;setStatus("⭐ יפה! המשיכו לטפס — היזהרו מהמכשולים!")}
else if(f.gold)setStatus("⚡ טרמפולינה זהובה! קפיצה גבוהה במיוחד!");
break
}
}
}
if(p.y>650){failStage("fall");return}
var desired=Math.min(0,p.y-295);cameraY+=(desired-cameraY)*Math.min(1,dt*6);showHeight();
for(var j=particles.length-1;j>=0;j--){var v=particles[j];v.age+=dt;v.x+=v.vx*dt;v.y+=v.vy*dt;v.vy+=260*dt;if(v.age>v.life)particles.splice(j,1)}
for(var k=0;k<platforms.length;k++)if(platforms[k].bounce)platforms[k].bounce=Math.max(0,platforms[k].bounce-dt*4);
}
function pathRound(x,y,w,h,r){var rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
function rounded(x,y,w,h,r,fill,stroke,lw){pathRound(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw||2;ctx.strokeStyle=stroke;ctx.stroke()}}
function ellipse(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
function text(t,x,y,size,color,align,weight){ctx.font=(weight||"900")+" "+size+"px Arial";ctx.textAlign=align||"center";ctx.textBaseline="middle";ctx.fillStyle=color;ctx.fillText(t,x,y)}
function star(x,y,r,color){ctx.save();ctx.translate(x,y);ctx.beginPath();for(var i=0;i<10;i++){var a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.47:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.restore()}
function cloud(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ellipse(0,8,69,22,"#ffffffa9");ellipse(-32,-5,38,27,"#ffffffc4");ellipse(6,-14,45,34,"#ffffffdc");ellipse(43,-3,33,25,"#ffffffc4");ctx.restore()}
function balloon(x,y,color,t){var bob=Math.sin(t*1.4+x*.02)*7;ctx.save();ctx.translate(x,y+bob);ctx.strokeStyle="#fff5e5";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,23);ctx.quadraticCurveTo(9,55,-4,88);ctx.stroke();var g=ctx.createRadialGradient(-8,-13,1,0,0,31);g.addColorStop(0,"#fff8ee");g.addColorStop(.18,color);g.addColorStop(1,color);ellipse(0,0,24,31,g);ctx.beginPath();ctx.moveTo(0,29);ctx.lineTo(-5,36);ctx.lineTo(5,36);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.restore()}
function drawBackground(){var palette=[["#91d5fa","#d7f3fd","#fff2d1"],["#b9a8f4","#f6d1e7","#ffe6c2"],["#f6a7bc","#ffd4b6","#ffe3bb"],["#34327e","#7268a8","#c3a0cb"]],colors=palette[Math.max(0,Math.min(3,difficulty))]||palette[0],g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,colors[0]);g.addColorStop(.58,colors[1]);g.addColorStop(1,colors[2]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
var sun=ctx.createRadialGradient(720,135,12,720,135,190);sun.addColorStop(0,difficulty===3?"#ffdfad":"#fff9d9");sun.addColorStop(.3,difficulty===3?"#fff1b180":"#fff9d880");sun.addColorStop(1,"#fff9d900");ctx.fillStyle=sun;ctx.fillRect(510,0,420,370);ellipse(720,135,difficulty===3?37:49,difficulty===3?37:49,difficulty===3?"#ffe0b8":"#fff6cf");
for(var i=0;i<7;i++)cloud(((i*191+Math.sin(elapsed*.11+i)*20+60)%1120)-90,50+i%3*97,.52+(i%3)*.19);
if(difficulty===3){for(var j=0;j<50;j++){var sx=(j*197+27)%W,sy=(j*113+17)%460;star(sx,sy,2+(j%3),j%3?"#fff6d5aa":"#fff8e8")}}
ctx.fillStyle=stage===3?"#6d699f":stage===2?"#d7a4ad":"#9ac7b3";ctx.beginPath();ctx.moveTo(0,425);for(var x=0;x<=900;x+=25)ctx.lineTo(x,365+Math.sin(x*.011+stage)*42+Math.sin(x*.025)*15);ctx.lineTo(900,620);ctx.lineTo(0,620);ctx.fill();
ctx.fillStyle=stage===3?"#57548c":stage===2?"#b78d9b":"#75bba3";ctx.beginPath();ctx.moveTo(0,490);for(var xx=0;xx<=900;xx+=25)ctx.lineTo(xx,435+Math.sin(xx*.012+1.6)*38);ctx.lineTo(900,620);ctx.lineTo(0,620);ctx.fill();
drawCastle(155,385,.7);drawCastle(780,440,.46);
for(var k=0;k<12;k++){var fx=35+k*79,fy=stage===3?550:565+Math.sin(k*3)*18;ctx.strokeStyle="#8d8f9d";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx,fy-27);ctx.stroke();star(fx,fy-28,6,k%2?"#ffe9ad":"#f9c3df")}
balloon(64,100,stage===3?"#f9d3b2":"#f29cbb",elapsed);balloon(837,200,stage===1?"#ad9ef1":"#8bd8be",elapsed+1);balloon(788,72,"#f9d89b",elapsed+.5);
ctx.save();ctx.strokeStyle="#fff6e6bb";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,36);ctx.quadraticCurveTo(450,85,900,34);ctx.stroke();for(var f=0;f<18;f++){var bx=f*54+5,by=38+Math.sin(f/17*Math.PI)*18;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+19,by+35);ctx.lineTo(bx+38,by);ctx.closePath();ctx.fillStyle=["#ffd7a3","#e7a9d7","#a5e4c6","#c2b4f4"][f%4];ctx.fill()}ctx.restore();
}
function drawCastle(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=.62;rounded(-88,-85,176,145,12,"#fff3dc");rounded(-114,-128,53,188,9,"#f6cde4");rounded(62,-128,53,188,9,"#f6cde4");ctx.beginPath();ctx.moveTo(-125,-126);ctx.lineTo(-88,-184);ctx.lineTo(-50,-126);ctx.closePath();ctx.fillStyle="#b89ed8";ctx.fill();ctx.beginPath();ctx.moveTo(51,-126);ctx.lineTo(88,-184);ctx.lineTo(126,-126);ctx.closePath();ctx.fill();rounded(-24,-17,48,77,24,"#9a7dba");for(var i=-1;i<=1;i++){rounded(i*43-10,-63,20,28,10,"#b3e4e7")}ctx.restore()}
function drawBlackHole(hole){var x=hole.x,y=hole.y-cameraY;if(y<-140||y>H+140)return;ctx.save();ctx.translate(x,y);var pulse=Math.sin(elapsed*3+hole.x)*3;var glow=ctx.createRadialGradient(0,0,4,0,0,hole.pull);glow.addColorStop(0,"#190d35df");glow.addColorStop(.32,"#6030b5b9");glow.addColorStop(.68,"#935df03b");glow.addColorStop(1,"#9855fa00");ctx.fillStyle=glow;ctx.fillRect(-hole.pull,-hole.pull,hole.pull*2,hole.pull*2);
ctx.rotate(elapsed*1.8);for(var j=0;j<4;j++){ctx.beginPath();ctx.arc(0,0,hole.r+8+j*9,Math.PI*j/2+elapsed*.4,Math.PI*j/2+3.9+elapsed*.4);ctx.lineWidth=6-j*.8;ctx.strokeStyle=["#a67eff","#f5a8ff","#7460e9","#d6c1ff"][j];ctx.stroke()}
var disk=ctx.createRadialGradient(-9,-11,1,0,0,hole.r+7);disk.addColorStop(0,"#02020d");disk.addColorStop(.63,"#0d0a23");disk.addColorStop(.83,"#47217e");disk.addColorStop(1,"#d8a9ff");ellipse(0,0,hole.r+pulse*.22,hole.r+pulse*.22,disk);ctx.rotate(-elapsed*3);for(var k=0;k<6;k++){var a=elapsed*2.7+k*Math.PI/3,rr=hole.r+16+Math.sin(elapsed*2+k)*8;star(Math.cos(a)*rr,Math.sin(a)*rr,3,"#f1c6ff")}ctx.restore()}
function drawPlatform(f){
var y=f.y-cameraY;if(y>H+80||y<-100)return;
var isGoal=f.index===10,isBase=f.index===0;
ctx.save();
if(f.spikePatch){
ctx.shadowColor="#d24c7b99";ctx.shadowBlur=12;ctx.shadowOffsetY=2;
rounded(f.x,y-13,f.w,11,4,"#d95372","#ffe0e2",2);
for(var q=0;q<3;q++){var bx=f.x+7+q*14;ctx.beginPath();ctx.moveTo(bx-7,y-11);ctx.lineTo(bx,y-36-(q%2)*4);ctx.lineTo(bx+7,y-11);ctx.closePath();ctx.fillStyle="#fff2ed";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#9e436b";ctx.stroke()}
ctx.restore();return
}
var spring=f.bounce||0,top=y+spring*8,center=f.x+f.w/2;
ctx.shadowColor=f.gold?"#ffdc75ad":"#41366b70";ctx.shadowBlur=f.gold?22:14;ctx.shadowOffsetY=9;
rounded(f.x+9,top+5,f.w-18,19,10,f.gold?"#b77d55":"#70579d");
ctx.shadowBlur=0;ctx.shadowOffsetY=0;
for(var k=0;k<5;k++){var sx=f.x+21+k*(f.w-42)/4;ctx.beginPath();ctx.moveTo(sx,top+11);ctx.lineTo(sx+6,top+25-spring*5);ctx.lineTo(sx-3,top+31-spring*5);ctx.lineTo(sx+6,top+37-spring*5);ctx.strokeStyle=f.gold?"#fff1ac":"#ffe9bd";ctx.lineWidth=3;ctx.stroke()}
var frame=ctx.createLinearGradient(0,top-15,0,top+10);frame.addColorStop(0,isGoal||f.gold?"#ffdf87":"#f9c6db");frame.addColorStop(1,isGoal||f.gold?"#f5a66c":"#a687d2");
rounded(f.x,top-15,f.w,27,14,frame,"#fff8e8",4);
var mat=ctx.createLinearGradient(0,top-10,0,top+7);mat.addColorStop(0,isGoal||f.gold?"#ffed9f":["#b3f6e1","#ffb7d5","#c5b2fa"][stage%3]);mat.addColorStop(1,isGoal||f.gold?"#f7c86b":["#72cbb6","#df89b6","#8f83d8"][stage%3]);
rounded(f.x+10,top-10,f.w-20,16,8,mat);
for(var j=0;j<Math.min(5,Math.floor(f.w/42));j++)star(f.x+26+j*39,top-2,4,"#fff7ce");
if(f.index===5){text("⭐",center,top-35,20,"#fff7ca")}
else if(f.gold){text("⚡",center,top-36,27,"#fff4b3")}
else if(f.moving){text("↔",center,top-36,28,"#fff9e3")}
else if(!isBase&&!isGoal){ctx.save();ctx.translate(center,top-28);ctx.rotate(Math.sin(elapsed*2+f.index)*.12);star(0,0,9,["#fff2b3","#f9c8e5","#bbffdf"][f.index%3]);ctx.restore()}
if(isGoal)drawGoal(center,top-20);
ctx.restore()
}
function drawGoal(x,y){var pulse=Math.sin(elapsed*3)*.1+1;ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);var glow=ctx.createRadialGradient(0,-62,10,0,-62,115);glow.addColorStop(0,"#fff2a1c9");glow.addColorStop(1,"#fff2a100");ctx.fillStyle=glow;ctx.fillRect(-125,-180,250,190);
rounded(-67,-129,134,125,17,"#ffefcf","#e2b9c5",7);ctx.beginPath();ctx.moveTo(-76,-129);ctx.lineTo(0,-190);ctx.lineTo(76,-129);ctx.closePath();ctx.fillStyle="#d996c0";ctx.fill();ctx.lineWidth=6;ctx.strokeStyle="#fff4d8";ctx.stroke();rounded(-38,-91,76,89,36,"#9d78bb","#fff7d3",5);ellipse(23,-42,4,4,"#fff2b2");text("?",-2,-111,32,"#fff");text("🏠",0,-154,30,"#fff");star(-73,-79,12,"#ffe6a0");star(77,-98,11,"#fff3bb");ctx.restore()}
function drawPlayer(){var p=player,sy=p.y-cameraY;if(sy>H+120||sy<-120)return;
var gift=GIFTS[stage],cy=sy+p.h/2;
ctx.save();ctx.globalAlpha=.3;ellipse(p.x,cy+40,30,8,"#6e4e9c");ctx.globalAlpha=1;ctx.restore();
ctx.save();ctx.translate(p.x,cy);ctx.rotate(p.angle);
ctx.shadowColor="#51427c8c";ctx.shadowBlur=14;ctx.shadowOffsetY=7;
var g=ctx.createLinearGradient(-31,-29,31,29);g.addColorStop(0,"#fff2ed");g.addColorStop(.13,gift.color);g.addColorStop(1,gift.color);
rounded(-30,-28,60,59,9,g,"#fff9e5",4);
ctx.shadowBlur=0;ctx.shadowOffsetY=0;
rounded(-7,-28,14,59,2,gift.ribbon);rounded(-30,-6,60,14,2,gift.ribbon);
rounded(-35,-34,70,14,5,gift.color,"#fff8dd",3);
ctx.beginPath();ctx.moveTo(-1,-34);ctx.bezierCurveTo(-27,-44,-23,-63,-9,-57);ctx.bezierCurveTo(1,-54,0,-40,0,-34);ctx.moveTo(1,-34);ctx.bezierCurveTo(27,-44,23,-63,9,-57);ctx.bezierCurveTo(-1,-54,0,-40,0,-34);ctx.strokeStyle=gift.ribbon;ctx.lineWidth=7;ctx.stroke();
rounded(-17,8,34,20,6,"#fff9e7","#e9d6ad",2);text("?",0,19,18,"#7d5c95");
ctx.restore();
if(p.vy<0&&Math.abs(p.vy)>160){star(p.x-34,cy+36,5,"#fff3a9");star(p.x+33,cy+29,4,"#fff9de")}
}
function drawParticles(){particles.forEach(function(p){var y=p.y-cameraY;ctx.globalAlpha=Math.max(0,1-p.age/p.life);ellipse(p.x,y,p.size,p.size,p.color)});ctx.globalAlpha=1}
function draw(){ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.clearRect(0,0,W,H);drawBackground();blackHoles.forEach(drawBlackHole);platforms.forEach(drawPlatform);drawPlayer();drawParticles()}
function resize(){var r=canvas.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}draw()}
function loop(t){requestAnimationFrame(loop);if(!last){last=t;draw();return}var dt=Math.min(.033,(t-last)/1000);last=t;var parts=Math.max(1,Math.ceil(dt/.012));for(var i=0;i<parts;i++)step(dt/parts);draw()}
function init(){load();delivered=[];input();setupStage(0);setOverlay("intro");if(window.ResizeObserver)new ResizeObserver(resize).observe(screen);window.addEventListener("resize",resize);resize();requestAnimationFrame(loop)}
init();
})();