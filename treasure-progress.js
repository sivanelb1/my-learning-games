(()=>{"use strict";
const KEY="playwise-palace-treasure-v1";
function get(){try{let a=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(a)?a.filter(x=>Number.isInteger(x)&&x>=1&&x<=4):[]}catch{return[]}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch{}}
const css=`
.pw-map-wrap{width:min(100%,430px);margin:12px auto 15px;direction:rtl;text-align:center;font-family:Georgia,Arial,sans-serif;color:#69431f}
.pw-map-title{font-weight:900;font-size:clamp(17px,3vw,23px);margin:8px 0 5px;color:#72491d}
.pw-map-desc{font-size:13px;margin:5px 0 12px;color:#805f3a}
.pw-map-grid{width:min(100%,340px);aspect-ratio:1.4;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:3px;margin:0 auto;direction:ltr;filter:drop-shadow(0 8px 8px #49311e48)}
.pw-fragment{position:relative;min-width:0;min-height:0;overflow:hidden;isolation:isolate;clip-path:polygon(0 0,20% 3%,39% 0,61% 3%,81% 0,100% 0,97% 20%,100% 39%,97% 60%,100% 82%,100% 100%,79% 97%,60% 100%,39% 97%,19% 100%,0 100%,3% 79%,0 60%,3% 40%,0 21%);background:#a98251}
.pw-fragment:nth-child(2){clip-path:polygon(0 0,21% 2%,42% 0,62% 3%,82% 0,100% 0,97% 23%,100% 43%,97% 64%,100% 82%,100% 100%,79% 97%,61% 100%,39% 97%,20% 100%,0 100%,3% 79%,0 61%,3% 41%,0 20%)}
.pw-fragment:nth-child(3){clip-path:polygon(0 0,20% 3%,40% 0,61% 3%,80% 0,100% 0,97% 21%,100% 41%,97% 60%,100% 80%,100% 100%,80% 97%,60% 100%,40% 97%,20% 100%,0 100%,3% 81%,0 59%,3% 39%,0 20%)}
.pw-fragment:nth-child(4){clip-path:polygon(0 0,20% 3%,41% 0,61% 3%,80% 0,100% 0,97% 21%,100% 40%,97% 60%,100% 80%,100% 100%,80% 97%,60% 100%,40% 97%,20% 100%,0 100%,3% 80%,0 60%,3% 40%,0 20%)}
.pw-parchment{position:absolute;inset:0;background-image:radial-gradient(ellipse at 25% 25%,#f6dc9d 0%,#d8b879 47%,#a87c46 100%);box-shadow:inset 0 0 20px #6d431a70}
.pw-art{position:absolute;inset:0;width:200%;height:200%;max-width:none;pointer-events:none}
.pw-fragment:nth-child(1) .pw-art{left:0;top:0}.pw-fragment:nth-child(2) .pw-art{left:-100%;top:0}.pw-fragment:nth-child(3) .pw-art{left:0;top:-100%}.pw-fragment:nth-child(4) .pw-art{left:-100%;top:-100%}
.pw-fog{position:absolute;inset:0;z-index:2;background:radial-gradient(ellipse at center,#dad7d0e8 0%,#aaa6a1f7 90%);backdrop-filter:grayscale(1) blur(5px);display:grid;place-items:center;color:#766e66;font-size:30px;text-shadow:0 2px 3px #fff9;transition:opacity 2.3s ease,filter 2.3s ease}
.pw-fragment.revealed .pw-fog{opacity:0;filter:blur(13px);pointer-events:none}
.pw-fragment.newly .pw-fog{opacity:1;filter:blur(0)}
.pw-fragment.newly.revealed .pw-fog{opacity:0;filter:blur(15px)}
.pw-map-counter{font-size:14px;font-weight:800;color:#765029;margin:10px 0 0}
.pw-map-wrap .pw-map-note{font-size:12px;color:#7e6548}
@media(max-height:680px){.pw-map-grid{width:min(100%,245px)}.pw-map-wrap{margin:5px auto}.pw-map-title{margin:3px}.pw-map-desc{margin:2px}}
`;
const art=`<svg class="pw-art" viewBox="0 0 440 310" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="#6d4b29" stroke-width="3" opacity=".8"><path d="M20 70Q80 28 120 80T220 76T330 65T420 40" stroke-dasharray="5 8"/><path d="M32 255Q85 195 145 235T260 210T410 245" stroke-dasharray="5 8"/><path d="M52 35Q62 115 150 125T250 170T385 150" stroke-width="5" stroke="#537c75" opacity=".65"/></g>
<g fill="#866037" stroke="#573c25" stroke-width="2"><path d="M175 107L175 65L197 65L197 46L212 46L212 65L229 65L229 42L244 42L244 66L263 66L263 107Z" fill="#b68d55"/><path d="M187 107V82H207V107M226 107V82H249V107" fill="#e7c58b"/><path d="M211 107V89Q219 78 229 89V107Z" fill="#684626"/><path d="M193 46V27L204 35L193 40M234 42V23L246 30L234 36" fill="#874b37"/></g>
<g stroke="#6b4a29" stroke-width="2" fill="none"><circle cx="74" cy="214" r="25"/><path d="M74 184V244M44 214H104M74 214L91 196"/><path d="M343 215l15-22 15 22-15 23Z" fill="#a36c44"/><path d="M350 205l8 10 8-10M350 226l8-11 8 11"/></g>
<g fill="#65482c" font-family="Georgia,serif" font-size="18" font-weight="bold" opacity=".9"><text x="147" y="132">PALACE</text><text x="37" y="170">FOREST</text><text x="315" y="270">SECRET</text></g>
<g stroke="#774c29" stroke-width="5"><path d="M335 65l35 35m0-35l-35 35"/><circle cx="353" cy="82" r="28" stroke-width="2" stroke-dasharray="4 5" fill="none"/></g>
<g fill="#6d5336" opacity=".55"><path d="M10 105l15-18 12 18M33 113l12-22 12 22M91 274l15-23 16 23M118 274l15-20 16 20M303 135l16-25 17 25M328 139l16-25 17 25"/></g>
<rect x="8" y="8" width="424" height="294" fill="none" stroke="#6c4525" stroke-width="3" stroke-dasharray="3 6" opacity=".55"/></svg>`;
function build(n){const owned=get();let wrap=document.createElement("section");wrap.className="pw-map-wrap";wrap.setAttribute("aria-label","מפת האוצר שנאספה");wrap.innerHTML='<div class="pw-map-title">🗺️ מפת האוצר של הארמון</div><div class="pw-map-desc">כל שלב חושף חלק נוסף מהמפה העתיקה</div><div class="pw-map-grid">'+[1,2,3,4].map(i=>'<div class="pw-fragment '+(owned.includes(i)&&i!==n?"revealed":"")+(i===n?" newly":"")+'" data-part="'+i+'"><div class="pw-parchment"></div>'+art+'<div class="pw-fog" aria-label="חלק מפה חסר">✦</div></div>').join("")+'</div><div class="pw-map-counter">נאספו '+owned.length+' מתוך 4 חלקי מפה</div><div class="pw-map-note">החלקים האפורים עדיין מסתתרים בערפל ✨</div>';return wrap}
function award(n){if(!Number.isInteger(n)||n<1||n>4)return;let a=get(),newly=!a.includes(n);if(newly){a.push(n);save(a)}const dialog=document.querySelector("#success .success-card")||document.querySelector("#success .game-over-card")||document.querySelector("#overlay .dialog");if(!dialog)return;dialog.style.maxHeight="94dvh";dialog.style.overflowY="auto";dialog.querySelector(".pw-map-wrap")?.remove();let map=build(newly?n:0);let actions=dialog.querySelector(".success-actions,.win-links");if(actions)actions.before(map);else dialog.append(map);if(newly){setTimeout(()=>{map.querySelector('.pw-fragment[data-part="'+n+'"]')?.classList.add("revealed")},380)}}
window.PlaywiseTreasure={award,get};
const st=document.createElement("style");st.textContent=css;document.head.append(st);
})();