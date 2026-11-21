/* PLAYWISE original scalable safari illustration for animal selection rounds */
(function(){
'use strict';
function tree(x,y,s,flip){
const trunk='<path d="M -12 0 Q -20 -80 -13 -148 L 6 -148 Q 16 -92 14 0 Z" fill="url(#trunk)" stroke="#825d44" stroke-width="3"/><path d="M -7 -102 Q -39 -149 -100 -151 M 5 -114 Q 44 -164 97 -160" fill="none" stroke="#8b684c" stroke-width="13" stroke-linecap="round"/>';
const canopy='<g filter="url(#softshadow)"><ellipse cx="-70" cy="-159" rx="88" ry="28" fill="#496a3b"/><ellipse cx="44" cy="-164" rx="93" ry="31" fill="#4f7943"/><ellipse cx="-21" cy="-177" rx="132" ry="35" fill="#5d8448"/><ellipse cx="-44" cy="-192" rx="91" ry="24" fill="#77995a"/><ellipse cx="39" cy="-188" rx="79" ry="25" fill="#71934e"/><ellipse cx="-27" cy="-199" rx="75" ry="14" fill="#a1b36b" opacity=".68"/></g>';
const leaves=Array.from({length:16},(_,i)=>{const xx=(i*37)%235-113,yy=-185+(i*17)%37;return '<ellipse cx="'+xx+'" cy="'+yy+'" rx="'+(9+i%4*2)+'" ry="'+(3+i%3)+'" fill="'+(i%3===0?'#d2c87a':'#a3b16c')+'" opacity=".45"/>'}).join('');
return '<g transform="translate('+x+' '+y+') scale('+(s*(flip||1))+' '+s+')"><ellipse cy="4" rx="77" ry="11" fill="#3b573d" opacity=".25"/>'+trunk+canopy+leaves+'</g>';
}
const grasses=Array.from({length:82},(_,i)=>{const x=(i*179+37)%1200,y=332+(i*83)%206,scale=.65+(i%5)*.21;return '<g transform="translate('+x+' '+y+') scale('+scale+')" opacity="'+(.28+(i%3)*.14)+'"><path d="M 0 0 Q -7 -15 -10 -23 M 0 0 Q 2 -21 4 -31 M 0 0 Q 14 -16 19 -21" fill="none" stroke="'+(i%4===0?'#f6d585':'#467a4c')+'" stroke-width="3" stroke-linecap="round"/></g>'}).join('');
const flowers=Array.from({length:18},(_,i)=>{const x=(i*233+70)%1200,y=393+(i*37)%145;return '<g transform="translate('+x+' '+y+')" opacity=".7"><path d="M 0 0 L 0 -11" stroke="#598c4e" stroke-width="2"/><circle cx="-3" cy="-13" r="4" fill="#fff1b1"/><circle cx="4" cy="-13" r="4" fill="#f8c29d"/><circle cx="0" cy="-17" r="4" fill="#ffdb9b"/><circle cx="0" cy="-13" r="2.2" fill="#b7785a"/></g>'}).join('');
const stones=Array.from({length:26},(_,i)=>{const x=(i*197+83)%1200,y=367+(i*59)%180;return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+(3+i%5*2)+'" ry="'+(2+i%3*1.5)+'" fill="'+(i%2?'#c9ac7d':'#8a9270')+'" opacity=".45"/>'}).join('');
const svg=[
'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="550" viewBox="0 0 1200 550" preserveAspectRatio="xMidYMid slice">',
'<defs><linearGradient id="sky" x1="0" y1="0" x2=".1" y2="1"><stop stop-color="#6bafdf"/><stop offset=".47" stop-color="#c9e1d5"/><stop offset="1" stop-color="#f9d6a4"/></linearGradient>',
'<radialGradient id="sunGlow"><stop stop-color="#fff8c7" stop-opacity=".95"/><stop offset=".28" stop-color="#fff1b6" stop-opacity=".45"/><stop offset="1" stop-color="#ffe3a2" stop-opacity="0"/></radialGradient>',
'<linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b7b87b"/><stop offset=".4" stop-color="#8baf75"/><stop offset="1" stop-color="#568a68"/></linearGradient>',
'<linearGradient id="path" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#f6dfad"/><stop offset=".5" stop-color="#dcb986"/><stop offset="1" stop-color="#bd986f"/></linearGradient>',
'<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#75513f"/><stop offset=".55" stop-color="#b28b61"/><stop offset="1" stop-color="#735341"/></linearGradient>',
'<linearGradient id="mountain" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9b99a0"/><stop offset="1" stop-color="#b8b49e"/></linearGradient>',
'<filter id="softshadow" x="-20%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#2e4c42" flood-opacity=".24"/></filter>',
'<filter id="haze"><feGaussianBlur stdDeviation="17"/></filter></defs>',
'<rect width="1200" height="550" fill="url(#sky)"/>',
'<circle cx="892" cy="98" r="190" fill="url(#sunGlow)"/><circle cx="893" cy="100" r="48" fill="#fff1bb" opacity=".92"/>',
'<g fill="#fffef0" opacity=".62"><ellipse cx="178" cy="106" rx="111" ry="21"/><ellipse cx="144" cy="93" rx="62" ry="26"/><ellipse cx="229" cy="91" rx="64" ry="27"/><ellipse cx="1064" cy="146" rx="94" ry="18"/><ellipse cx="1031" cy="133" rx="49" ry="24"/><ellipse cx="1110" cy="130" rx="56" ry="24"/></g>',
'<path d="M0 294 L91 268 L155 277 L258 211 L322 255 L392 233 L459 275 L521 243 L578 259 L654 218 L718 255 L775 242 L846 274 L921 233 L1018 275 L1096 252 L1200 288 L1200 365 L0 365 Z" fill="url(#mountain)" opacity=".58"/>',
'<path d="M0 323 Q149 267 283 313 Q391 284 524 310 Q683 263 836 315 Q1030 278 1200 309 L1200 550 L0 550Z" fill="#b4b78a" opacity=".74"/>',
'<path d="M0 346 Q155 303 311 350 Q461 314 590 343 Q730 309 867 349 Q1031 313 1200 343 L1200 550 L0 550Z" fill="url(#land)"/>',
'<path d="M0 381 Q172 343 337 387 Q487 354 646 381 Q826 342 995 382 Q1120 362 1200 386 L1200 550 L0 550Z" fill="#79a16f" opacity=".64"/>',
'<path d="M572 335 Q638 326 676 336 Q729 401 820 550 L390 550 Q479 401 572 335 Z" fill="url(#path)" opacity=".8"/>',
'<path d="M585 335 Q518 441 448 550 M665 336 Q742 450 765 550" fill="none" stroke="#fff1c5" stroke-width="5" opacity=".38"/>',
'<g opacity=".38" filter="url(#haze)"><ellipse cx="602" cy="330" rx="570" ry="26" fill="#fff4d2"/></g>',
tree(101,373,1.16),tree(1117,368,1.24,-1),tree(335,333,.46),tree(875,337,.45,-1),
'<g opacity=".83"><path d="M0 431 Q117 405 229 433 Q346 410 460 443 L460 550 L0 550Z" fill="#659a6b"/><path d="M813 443 Q970 398 1200 429 L1200 550 L813 550Z" fill="#61946b"/></g>',
grasses,stones,flowers,
'<g fill="#fff8df" opacity=".75"><circle cx="350" cy="130" r="2.5"/><circle cx="720" cy="171" r="2"/><circle cx="983" cy="212" r="3"/><circle cx="550" cy="99" r="2"/><circle cx="411" cy="190" r="2.5"/></g>',
'</svg>'
].join('');
window.PWSafariBackground='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
})();