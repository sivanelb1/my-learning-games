/* PLAYWISE · עולם 2 · סרגל ניווט בין ארבעת המיני-משחקים */
(function(){
'use strict';
const stages=[
{url:'level2-letter-gate.html',emoji:'🍄',name:'כדורים פורחים',short:'פטריות'},
{url:'level2-abc-puzzle.html',emoji:'🧩',name:'פאזל ABC',short:'פאזל'},
{url:'level2-vowel-gems.html',emoji:'🔮',name:'אבני הניקוד',short:'אבנים'},
{url:'level2-vowel-gems-b.html',emoji:'💎',name:'הצלת הקריסטלים',short:'קריסטלים'}
];
const page=decodeURIComponent(location.pathname.split('/').pop()||'');
const current=stages.findIndex(s=>s.url===page);
if(current<0)return;
const style=document.createElement('style');
style.textContent=`
.pw-mini-nav{direction:rtl;position:relative;z-index:22;max-width:1080px;margin:13px auto 16px;padding:8px 12px 10px;border:2px solid #ffe3a2;border-radius:19px;background:linear-gradient(110deg,#28124fe8,#623292ee,#28124fe8);box-shadow:0 7px 24px #150627a8;color:#fff;font-family:Arial,sans-serif}
.pw-mini-title{display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:900;color:#ffe6a7;font-size:clamp(11px,1.5vw,15px);margin:0 2px 6px}
.pw-mini-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;direction:rtl}
.pw-mini-step{position:relative;min-width:0;display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;text-align:center;padding:8px 5px;border:1.5px solid #aa80d4;border-radius:11px;background:#2b1553;color:#f1dffb;font-size:clamp(10px,1.4vw,14px);font-weight:800;white-space:nowrap;transition:transform .15s,background .15s;outline-offset:2px}
.pw-mini-step:hover{background:#7843a5;transform:translateY(-2px)}
.pw-mini-step.current{border:2px solid #ffe18c;background:linear-gradient(120deg,#ac5ee0,#6934a3);color:#fff7ce;box-shadow:0 0 13px #f5c4ff99}
.pw-mini-step.complete{border-color:#b9f2cb;background:#2c655a;color:#f3fff3}
.pw-mini-step .pw-mini-emoji{font-size:clamp(14px,1.8vw,21px);flex-shrink:0}
.pw-mini-step .pw-mini-index{opacity:.75;font-size:11px}
.pw-mini-step .pw-mini-check{color:#c8ffcf;font-weight:900}
.pw-mini-nav.pw-mini-gate{position:absolute;top:94px;left:50%;transform:translateX(-50%);width:min(1000px,95vw);margin:0;z-index:18;padding:5px 10px 7px}
.pw-mini-gate .pw-mini-title{margin-bottom:4px}
.pw-mini-gate .pw-mini-step{padding:5px 4px}
@media(max-width:620px){.pw-mini-nav{padding:7px 6px}.pw-mini-title{font-size:11px}.pw-mini-steps{gap:4px}.pw-mini-step{padding:7px 2px;flex-direction:column;gap:1px;white-space:normal;line-height:1.1;font-size:10px}.pw-mini-step .pw-mini-emoji{font-size:17px}.pw-mini-step .pw-mini-index{display:none}.pw-mini-nav.pw-mini-gate{top:86px;width:98vw;padding:5px 4px}.pw-mini-gate .pw-mini-step{padding:4px 2px}}
@media(max-height:640px){.pw-mini-nav.pw-mini-gate{top:73px}.pw-mini-gate .pw-mini-title{font-size:10px}.pw-mini-gate .pw-mini-step{padding:3px}}
`;
document.head.appendChild(style);
const nav=document.createElement('nav');
nav.className='pw-mini-nav'+(current===0?' pw-mini-gate':'');
nav.setAttribute('aria-label','מסלול ארבעת המיני-משחקים בעולם 2');
let completed=[false,false,false,false];
try{
const quest=JSON.parse(localStorage.getItem('playwise-level2-royal-quest-v1')||'[]');
completed[0]=Array.isArray(quest)&&quest.includes(0);
completed[1]=localStorage.getItem('playwise-level2-abc-puzzle-v1')==='complete';
completed[2]=localStorage.getItem('playwise-level2-vowels-intro-v1')==='complete';
completed[3]=localStorage.getItem('playwise-level2-vowels-rescue-v1')==='complete';
}catch(e){}
const title=document.createElement('div');title.className='pw-mini-title';
const label=document.createElement('span');label.textContent='🗺️ המסלול הקסום · מיני־משחק '+(current+1)+' מתוך 4';
const progress=document.createElement('span');progress.textContent=completed.filter(Boolean).length+' / 4 הושלמו';
title.append(label,progress);nav.appendChild(title);
const steps=document.createElement('div');steps.className='pw-mini-steps';
stages.forEach((s,i)=>{
const a=document.createElement('a');a.href=s.url;a.className='pw-mini-step'+(i===current?' current':completed[i]?' complete':'');
if(i===current)a.setAttribute('aria-current','step');
a.setAttribute('aria-label','מיני־משחק '+(i+1)+': '+s.name+(completed[i]?' — הושלם':''));
const emoji=document.createElement('span');emoji.className='pw-mini-emoji';emoji.textContent=s.emoji;
const text=document.createElement('span');text.textContent=s.name;
const n=document.createElement('span');n.className='pw-mini-index';n.textContent=(i+1)+'/4';
a.append(emoji,text,n);
if(completed[i]){const check=document.createElement('span');check.className='pw-mini-check';check.textContent='✓';a.append(check)}
steps.appendChild(a)
});
nav.appendChild(steps);
const anchor=document.querySelector(current===0?'.top':'.top, .nav');
if(anchor)anchor.insertAdjacentElement('afterend',nav);
else document.body.prepend(nav);
})();