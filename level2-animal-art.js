(function(){
"use strict";
const colors={
DOG:["#bc8153","#f7d2a1","#875741"],CAT:["#e5a16b","#ffe3b0","#ad7655"],RABBIT:["#d8d6e2","#fff9f4","#b9a3bd"],FISH:["#f3a55c","#ffe7ab","#dc7865"],TURTLE:["#80b98b","#c4e7ad","#568568"],
COW:["#e9e9e7","#fffdf6","#85818d"],HORSE:["#b98361","#eec59d","#82554b"],SHEEP:["#f5eee2","#fffdf7","#c6b4b6"],DUCK:["#e8c967","#fff3a9","#b98d5c"],CHICKEN:["#f5e8d8","#fff9e7","#bda09a"],
LION:["#d9a05c","#ffe0a3","#a76e45"],ZEBRA:["#f4f0e7","#ffffff","#777784"],MONKEY:["#a87960","#e8b895","#76534d"],ELEPHANT:["#9ca9bb","#d4dbe8","#778397"],GIRAFFE:["#e9b66f","#ffe2a5","#bd895c"],
FOX:["#dc885b","#ffd4aa","#a05c49"],BEAR:["#a98068","#e9c3a1","#7a584d"],BIRD:["#86bbd6","#d0ecf3","#588ba7"],OWL:["#b89c7b","#ead3ae","#78685e"],SQUIRREL:["#c28c63","#f3c597","#946046"],
DOLPHIN:["#7eafcf","#c7e6f2","#5b88a6"],SHARK:["#92aabb","#d2e4ea","#687e93"],WHALE:["#8aa6d0","#c8def4","#6b83a7"],OCTOPUS:["#b595ce","#e8cef2","#886da3"],CRAB:["#e88c7a","#ffbfad","#bb6467"]
};
function svg(word){
word=String(word).toUpperCase();const [base,light,dark]=colors[word]||colors.DOG;
const sea=["FISH","DOLPHIN","SHARK","WHALE","OCTOPUS","CRAB"].includes(word);
const bird=["DUCK","CHICKEN","BIRD","OWL"].includes(word);
const e=(x,y,rx,ry,fill,extra="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" '+extra+'/>';
const p=(d,fill,extra="")=>'<path d="'+d+'" fill="'+fill+'" '+extra+'/>';
const c=(x,y,r,fill)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
const eye=(x,y)=>e(x,y,7,9,"#fff")+e(x+1,y+1,4,6,"#26314a")+e(x-1,y-3,2,2,"#fff");
const smile=p("M 101 90 Q 110 99 119 90","none",'stroke="#765668" stroke-width="3" stroke-linecap="round"');
const face=eye(90,68)+eye(130,68)+e(78,84,9,5,"#f4b2b3",'opacity=".7"')+e(142,84,9,5,"#f4b2b3",'opacity=".7"')+e(110,82,6,4,"#84596b")+smile;
const defs='<defs><linearGradient id="fur" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="'+light+'"/><stop offset=".55" stop-color="'+base+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient><linearGradient id="cream" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffdf5"/><stop offset="1" stop-color="'+light+'"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#4c4966" flood-opacity=".32"/></filter></defs>';
let ears="",body="",head="",tail="",feet="",detail="";
if(sea){
 if(word==="OCTOPUS"){
 tail='<g class="pw-tail">'+[0,1,2,3,4,5].map(i=>p('M '+(75+i*14)+' 112 Q '+(25+i*29)+' 163 '+(22+i*32)+' '+(138+(i%2)*10),"none",'stroke="'+base+'" stroke-width="13" stroke-linecap="round"')).join("")+'</g>';
 body=e(110,94,56,49,"url(#fur)",'stroke="'+dark+'" stroke-width="3"');head=face;
 }else if(word==="CRAB"){
 tail='<g class="pw-tail">'+p("M 72 105 Q 36 67 24 82","none",'stroke="'+dark+'" stroke-width="10"')+p("M 148 105 Q 184 67 196 82","none",'stroke="'+dark+'" stroke-width="10"')+e(25,79,16,17,"url(#fur)")+e(195,79,16,17,"url(#fur)")+'</g>';
 feet=[0,1,2].map(i=>p('M 76 '+(113+i*9)+' L 34 '+(119+i*10)+' M 145 '+(113+i*9)+' L 185 '+(119+i*10),"none",'stroke="'+dark+'" stroke-width="5" stroke-linecap="round"')).join("");
 body=e(110,111,63,39,"url(#fur)",'stroke="'+dark+'" stroke-width="3"');head=face;
 }else{
 tail='<g class="pw-tail">'+p("M 65 94 L 24 68 Q 12 101 25 125 L 65 110 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"')+'</g>';
 body=p("M 43 100 Q 71 54 131 65 Q 177 73 188 101 Q 162 143 107 141 Q 67 136 43 100 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"')+p("M 75 122 Q 120 149 165 115 Q 141 144 95 139 Z","url(#cream)");
 if(word==="SHARK")detail+=p("M 98 69 L 116 29 L 132 71 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"');
 if(word==="DOLPHIN")detail+=p("M 100 68 L 114 40 L 129 70 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"')+p("M 171 96 Q 202 84 197 103 L 174 109 Z","url(#fur)");
 if(word==="WHALE")detail+=p("M 120 69 Q 117 38 126 32 M 127 59 Q 138 34 147 36","none",'stroke="#8be5f2" stroke-width="6" stroke-linecap="round"');
 head=e(144,91,6,8,"#29354c")+e(142,87,2,2,"#fff")+e(151,109,10,5,"#f8b3b6")+p("M 146 121 Q 155 127 163 120","none",'stroke="#6e6677" stroke-width="3"');
 }
}else if(bird){
 tail='<g class="pw-tail">'+p("M 69 117 Q 35 90 45 68 Q 62 73 82 98 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"')+'</g>';
 feet=p("M 94 137 L 88 157 L 73 161 M 88 157 L 100 162 M 126 137 L 131 157 L 146 161 M 131 157 L 120 162","none",'stroke="#cc925b" stroke-width="5" stroke-linecap="round"');
 body=e(110,114,55,41,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+e(110,122,29,26,"url(#cream)");
 if(word==="OWL")ears=p("M 77 56 L 64 25 L 99 43 M 141 56 L 155 25 L 120 43","url(#fur)",'stroke="'+dark+'" stroke-width="3"');
 if(word==="CHICKEN")ears=p("M 95 44 Q 85 20 103 30 Q 112 11 120 31 Q 139 22 127 45","#d9666e");
 head=e(110,69,39,34,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+face;
 detail=p("M 109 80 L 132 86 L 109 93 Z","#e9a45e",'stroke="#b9865d" stroke-width="2"')+e(76,113,18,24,"url(#fur)",'stroke="'+dark+'" stroke-width="2"');
}else{
 tail='<g class="pw-tail">'+(word==="SQUIRREL"?p("M 145 112 Q 203 129 189 69 Q 171 42 154 70 Q 181 81 160 104 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"'):p("M 153 120 Q 192 115 184 86","none",'stroke="'+dark+'" stroke-width="9" stroke-linecap="round"'))+'</g>';
 feet=[76,98,125,146].map(x=>p('M '+(x-9)+' 121 L '+(x-8)+' 151 Q '+(x-8)+' 158 '+(x+5)+' 156 L '+(x+6)+' 121 Z',"url(#fur)",'stroke="'+dark+'" stroke-width="2"')).join("");
 body=e(110,116,58,39,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+e(110,120,30,25,"url(#cream)",'opacity=".8"');
 if(word==="TURTLE"){
 body=e(110,113,62,43,"#6b9c72",'stroke="#4e7c5d" stroke-width="4"')+e(110,107,51,35,"#a5bd77",'stroke="#557f5f" stroke-width="4"')+p("M 90 78 L 133 78 L 156 108 L 134 138 L 90 138 L 65 108 Z","none",'stroke="#6a946c" stroke-width="4"')+p("M 110 79 L 110 138 M 65 108 L 155 108","none",'stroke="#6a946c" stroke-width="3"');
 head=e(167,108,30,29,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+eye(175,102)+p("M 173 121 Q 180 127 188 119","none",'stroke="#765668" stroke-width="3"');
 feet=e(73,148,18,11,"url(#fur)")+e(141,148,18,11,"url(#fur)");
 }else{
 if(word==="RABBIT")ears='<g class="pw-ear">'+e(88,23,13,38,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+e(132,23,13,38,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+e(88,23,6,27,"#efb7c4")+e(132,23,6,27,"#efb7c4")+'</g>';
 else if(["CAT","FOX"].includes(word))ears='<g class="pw-ear">'+p("M 77 55 L 65 16 L 100 42 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"')+p("M 143 55 L 155 16 L 120 42 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"')+'</g>';
 else if(word==="DOG")ears='<g class="pw-ear">'+e(72,65,18,30,dark,'transform="rotate(22 72 65)"')+e(148,65,18,30,dark,'transform="rotate(-22 148 65)"')+'</g>';
 else if(word==="ELEPHANT")ears=e(71,70,30,35,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+e(149,70,30,35,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+e(71,70,19,23,"#e8bac8")+e(149,70,19,23,"#e8bac8");
 else if(word==="LION")ears=e(110,64,51,46,"#bd8149",'stroke="#a66c42" stroke-width="3"');
 else if(word==="SHEEP")ears=[0,1,2,3,4,5,6,7].map(i=>e(110+37*Math.cos(i*Math.PI/4),64+32*Math.sin(i*Math.PI/4),19,19,"#fffaf0",'stroke="#d6c9c7" stroke-width="2"')).join("");
 else if(word==="COW")ears=e(72,54,24,13,"url(#fur)")+e(148,54,24,13,"url(#fur)");
 else if(word==="GIRAFFE")ears=p("M 93 47 L 91 21 M 127 47 L 129 21","none",'stroke="'+dark+'" stroke-width="6"')+e(91,21,7,7,dark)+e(129,21,7,7,dark);
 else if(["BEAR","MONKEY","SQUIRREL"].includes(word))ears=e(78,46,17,18,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+e(142,46,17,18,"url(#fur)",'stroke="'+dark+'" stroke-width="3"');
 else ears=e(78,50,16,17,"url(#fur)")+e(142,50,16,17,"url(#fur)");
 if(["GIRAFFE","HORSE"].includes(word))body+=p("M 127 109 L 124 50 Q 141 34 152 52 L 155 113 Z","url(#fur)",'stroke="'+dark+'" stroke-width="3"');
 head=e(110,69,39,35,"url(#fur)",'stroke="'+dark+'" stroke-width="3"')+face;
 if(word==="ELEPHANT")detail+=p("M 107 85 Q 105 126 120 128 Q 136 129 131 112","none",'stroke="'+base+'" stroke-width="18" stroke-linecap="round"');
 if(word==="COW")detail+=e(110,91,23,14,"#eebac2",'stroke="#bd8e9d" stroke-width="2"')+e(100,90,3,4,"#ad7e8e")+e(120,90,3,4,"#ad7e8e")+e(82,111,13,14,"#77717e")+e(143,106,12,12,"#77717e");
 if(word==="ZEBRA")detail+=p("M 80 43 L 100 51 L 90 60 L 74 51 Z M 130 43 L 119 53 L 128 60 L 146 48 Z M 68 99 L 95 112 L 86 123 L 62 111 Z M 139 100 L 160 111 L 146 122 L 130 111 Z","#595966");
 if(word==="GIRAFFE")detail+=e(76,110,12,12,"#bc8657")+e(141,114,12,13,"#bc8657")+e(144,89,8,8,"#bc8657");
 if(word==="SHEEP")detail+=[0,1,2,3].map(i=>e(73+i*23,108+(i%2)*14,18,17,"#fffdf5",'stroke="#d9ceca" stroke-width="2"')).join("");
 if(word==="CAT")detail+=p("M 81 90 L 61 83 M 81 96 L 61 100 M 139 90 L 159 83 M 139 96 L 159 100","none",'stroke="#775b6c" stroke-width="2"');
 if(word==="FOX")detail+=p("M 84 84 L 110 105 L 136 84 Q 110 113 84 84","url(#cream)");
 if(word==="HORSE")detail+=p("M 92 36 Q 102 12 117 35 L 131 45 L 106 42 Z",dark);
 }
}
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180" aria-label="'+word+'" role="img">'+defs+e(110,166,74,8,"#233b53",'opacity=".18"')+'<g filter="url(#shadow)">'+tail+feet+body+ears+head+detail+'</g>'+e(90,47,12,5,"#fff",'opacity=".18"')+'</svg>';
}
function house(i){
const palette=[["#e8a5b8","#af739a"],["#b8b3e5","#8071b8"],["#b5e0bd","#69ab9a"],["#f0ce98","#c49473"],["#d6b5dd","#9d7caf"]];
const [wall,roof]=palette[i%5];
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 200"><defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff8e6"/><stop offset=".5" stop-color="'+wall+'"/><stop offset="1" stop-color="'+roof+'"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity=".3"/></filter></defs><g filter="url(#s)"><path d="M 42 87 L 110 35 L 180 87 L 180 177 Q 110 192 42 177 Z" fill="url(#wall)" stroke="#fff2d3" stroke-width="7"/><path d="M 25 89 L 110 13 L 196 89 L 182 104 L 110 40 L 39 104 Z" fill="'+roof+'" stroke="#806483" stroke-width="5" stroke-linejoin="round"/><path d="M 83 178 L 83 126 Q 83 99 110 99 Q 138 99 138 126 L 138 178 Z" fill="#705987" stroke="#fce5bb" stroke-width="6"/><path d="M 90 177 L 90 126 Q 90 110 110 110 Q 131 110 131 126 L 131 177 Z" fill="#3e426e"/><circle cx="123" cy="145" r="4" fill="#ffe8a3"/><rect x="48" y="110" width="28" height="28" rx="4" fill="#a9e3ee" stroke="#fff6dc" stroke-width="5"/><rect x="144" y="110" width="28" height="28" rx="4" fill="#a9e3ee" stroke="#fff6dc" stroke-width="5"/><path d="M 62 110 L 62 138 M 158 110 L 158 138" stroke="#fff6dc" stroke-width="3"/><path d="M 20 179 Q 39 142 57 178 Q 71 152 83 178 M 143 178 Q 161 142 178 178 Q 191 152 202 178" fill="none" stroke="#76ad8d" stroke-width="10"/><circle cx="34" cy="166" r="7" fill="#ffb5c9"/><circle cx="185" cy="163" r="7" fill="#ffe3a6"/></g></svg>';
}
function scenery(theme){
const t={pets:["#76b5df","#f8c6db","#73aa90"],farm:["#8dc7e9","#fce0b2","#9abf7f"],wild:["#eab97e","#ffe0aa","#acba75"],forest:["#78aaa9","#d4d6ac","#5b997a"],sea:["#7ebfdb","#bde6e8","#7dbba9"]}[theme]||["#76b5df","#f8c6db","#73aa90"];
const flower=(x,y)=>'<g transform="translate('+x+' '+y+')"><path d="M 0 0 L 0 17" stroke="#5b946f" stroke-width="3"/><circle cx="-7" cy="-4" r="7" fill="#ffe7ac"/><circle cx="7" cy="-4" r="7" fill="#f8b6ca"/><circle cx="0" cy="-11" r="7" fill="#f8b6ca"/><circle cx="0" cy="1" r="5" fill="#f9d678"/></g>';
const tree=(x,y,k)=>'<g transform="translate('+x+' '+y+') scale('+k+')"><path d="M -12 0 L -9 -110 L 11 -110 L 15 0 Z" fill="#9e776e"/><circle cx="-20" cy="-127" r="53" fill="#6da78c"/><circle cx="23" cy="-142" r="56" fill="#83b99d"/><circle cx="-10" cy="-166" r="40" fill="#acd3a7" opacity=".7"/></g>';
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+t[0]+'"/><stop offset="1" stop-color="'+t[1]+'"/></linearGradient><linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+t[2]+'"/><stop offset="1" stop-color="#3b7976"/></linearGradient></defs><rect width="1200" height="520" fill="url(#sky)"/><circle cx="1040" cy="73" r="43" fill="#fff1c4" opacity=".8"/><path d="M 0 288 Q 145 165 292 271 Q 464 176 626 259 Q 806 170 990 272 Q 1111 193 1200 259 L 1200 520 L 0 520 Z" fill="#668f96" opacity=".4"/><path d="M 0 312 Q 250 255 480 303 Q 700 240 930 300 Q 1085 265 1200 300 L 1200 520 L 0 520 Z" fill="url(#grass)"/>'+tree(70,320,1.2)+tree(1130,325,1.25)+tree(215,304,.75)+tree(995,306,.72)+
'<g opacity=".93"><rect x="508" y="160" width="184" height="122" rx="6" fill="#c6b4c9" stroke="#9280aa" stroke-width="7"/><rect x="473" y="142" width="46" height="140" fill="#b4a4c1" stroke="#8b78a4" stroke-width="6"/><rect x="682" y="142" width="46" height="140" fill="#b4a4c1" stroke="#8b78a4" stroke-width="6"/><path d="M 455 146 L 496 80 L 538 146 Z M 663 146 L 705 80 L 747 146 Z" fill="#9b75ac" stroke="#755e95" stroke-width="5"/><path d="M 492 160 L 600 94 L 710 160 Z" fill="#9c79b0" stroke="#755e95" stroke-width="6"/><path d="M 572 282 L 572 227 Q 600 183 628 227 L 628 282 Z" fill="#665982" stroke="#fff1d2" stroke-width="7"/><rect x="534" y="183" width="26" height="31" fill="#a4d8e2" stroke="#fff1d2" stroke-width="5"/><rect x="642" y="183" width="26" height="31" fill="#a4d8e2" stroke="#fff1d2" stroke-width="5"/></g>'+
'<path d="M 536 281 Q 600 274 664 281 L 814 520 L 386 520 Z" fill="#d5bdab" opacity=".78"/><path d="M 501 320 Q 600 304 699 320 M 469 378 Q 600 360 730 378 M 427 457 Q 600 435 774 457" stroke="#fff3df" stroke-width="5" fill="none" opacity=".55"/>'+
Array.from({length:16},(_,i)=>flower((i*177+45)%1200,375+(i*41)%112)).join("")+
'<g fill="#fff" opacity=".65"><ellipse cx="229" cy="83" rx="84" ry="22"/><ellipse cx="263" cy="67" rx="55" ry="27"/><ellipse cx="969" cy="111" rx="76" ry="20"/><ellipse cx="933" cy="94" rx="49" ry="24"/></g></svg>';
}
function uri(svg){return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}
window.PWAnimalArt={animalSVG:svg,houseSVG:house,scenerySVG:scenery,uri:uri};
})();