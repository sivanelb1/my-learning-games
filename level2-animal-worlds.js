/* PLAYWISE animal worlds · five themed landscapes and 25 illustrated destinations.
   SVG illustrations are original, self-contained, scalable and work without external assets. */
(function(){
"use strict";
const esc=s=>encodeURIComponent(s);
const uri=s=>"data:image/svg+xml;charset=utf-8,"+esc(s);
const ell=(x,y,rx,ry,fill,extra="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" '+extra+'/>';
const path=(d,fill,extra="")=>'<path d="'+d+'" fill="'+fill+'" '+extra+'/>';
const circ=(x,y,r,fill,extra="")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" '+extra+'/>';
const rect=(x,y,w,h,fill,extra="")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" '+extra+'/>';
const flower=(x,y,s=1,color="#ffc6d7")=>'<g transform="translate('+x+' '+y+') scale('+s+')">'+path("M0 0V18","none",'stroke="#5e966c" stroke-width="3"')+[0,72,144,216,288].map(a=>'<ellipse cx="'+(Math.cos(a*Math.PI/180)*8).toFixed(2)+'" cy="'+(Math.sin(a*Math.PI/180)*8).toFixed(2)+'" rx="7" ry="5" fill="'+color+'" transform="rotate('+a+' '+(Math.cos(a*Math.PI/180)*8).toFixed(2)+' '+(Math.sin(a*Math.PI/180)*8).toFixed(2)+')"/>').join("")+circ(0,0,5,"#ffe9a0")+'</g>';
const leaf=(x,y,s=1)=>'<g transform="translate('+x+' '+y+') scale('+s+')">'+path("M0 0Q-30 -35 -10 -72Q25 -49 0 0Z","#6fa877")+path("M0 0Q30 -35 10 -72Q-25 -49 0 0Z","#89b887")+path("M0 0Q-44 -14 -51 -46Q-13 -49 0 0Z","#4b906f")+path("M0 0Q44 -14 51 -46Q13 -49 0 0Z","#519875")+'</g>';
const clouds='<g fill="#fffaf2" opacity=".73">'+ell(225,98,97,23,"#fffaf2")+ell(196,83,49,31,"#fffaf2")+ell(265,87,50,27,"#fffaf2")+ell(1010,116,97,21,"#fffaf2")+ell(977,101,48,27,"#fffaf2")+ell(1047,101,47,28,"#fffaf2")+'</g>';
const commonDefs='<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#82b9df"/><stop offset="1" stop-color="#f8d9aa"/></linearGradient><linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a6ca87"/><stop offset="1" stop-color="#53937c"/></linearGradient><linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0c48e"/><stop offset=".55" stop-color="#b57a57"/><stop offset="1" stop-color="#805c55"/></linearGradient><linearGradient id="ocean" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#73d9e9"/><stop offset=".43" stop-color="#349fcb"/><stop offset="1" stop-color="#16538d"/></linearGradient><linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f7e4b3"/><stop offset="1" stop-color="#d3b48c"/></linearGradient><linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f8e5db"/><stop offset="1" stop-color="#e7c9d5"/></linearGradient><radialGradient id="glow"><stop stop-color="#fff7d2" stop-opacity=".85"/><stop offset="1" stop-color="#fff7d2" stop-opacity="0"/></radialGradient><filter id="shade"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#344a5a" flood-opacity=".28"/></filter></defs>';
const svg=(body)=>'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="550" viewBox="0 0 1200 550" preserveAspectRatio="xMidYMid slice">'+commonDefs+body+'</svg>';
function pets(){
const planks=Array.from({length:17},(_,i)=>path('M'+(i*85-250)+' 550L'+(i*40+300)+' 318',"none",'stroke="#ae827e" stroke-width="3" opacity=".22"')).join("");
const stars=Array.from({length:22},(_,i)=>circ((i*137+40)%1200,35+(i*79)%250,2+(i%3),"#fff9eb",'opacity=".65"')).join("");
const books=Array.from({length:14},(_,i)=>rect(80+(i%7)*16,151+Math.floor(i/7)*73,12,48,["#bf8fa8","#9fb4b7","#e6b784","#a9a1c4"][i%4],'rx="2"')).join("");
const toys=Array.from({length:5},(_,i)=>circ(275+i*34,453+(i%2)*18,13,["#ffbbce","#b2d5f2","#ffe5a3"][i%3],'stroke="#fff9e7" stroke-width="3"')).join("");
return svg(rect(0,0,1200,350,"url(#room)")+rect(0,325,1200,225,"#d5b0a1")+rect(0,337,1200,213,"#e5c3ae")+planks+
rect(0,315,1200,19,"#fff7e6")+
'<g filter="url(#shade)">'+rect(375,35,450,275,"#fff7e9",'rx="95" stroke="#c89aa8" stroke-width="14"')+rect(392,52,416,242,"#bde5ef",'rx="82"')+circ(706,118,44,"#fff0ad")+path("M395 255Q520 173 614 244Q711 179 808 238V294H395Z","#9cc8a2")+path("M395 266Q542 230 640 262Q740 220 808 260V294H395Z","#6fae9c")+rect(590,50,16,247,"#fff8ec")+rect(395,180,413,14,"#fff8ec")+rect(357,292,489,21,"#e9c9bf",'rx="8"')+'</g>'+
rect(42,115,218,242,"#b98993",'rx="18" stroke="#fff2d9" stroke-width="9"')+rect(57,133,190,212,"#fff2de",'rx="8"')+rect(65,215,174,11,"#b98993")+rect(65,288,174,11,"#b98993")+books+
'<g filter="url(#shade)">'+rect(912,252,252,137,"#9a9dbd",'rx="48"')+rect(930,231,220,100,"#b8bad2",'rx="42"')+rect(931,338,220,55,"#a58cbd",'rx="18"')+rect(947,383,19,30,"#b08778",'rx="5"')+rect(1114,383,19,30,"#b08778",'rx="5"')+'</g>'+
ell(601,477,304,60,"#f3dfc3",'stroke="#fff5e5" stroke-width="13"')+ell(600,477,246,40,"#e4a9ac",'opacity=".5"')+
'<g filter="url(#shade)">'+rect(965,100,138,119,"#fff7e4",'rx="14" stroke="#d1a0a9" stroke-width="9"')+path("M1015 165Q1033 125 1055 164Q1074 133 1092 163","none",'stroke="#a7b9a0" stroke-width="8"')+circ(1051,139,12,"#f5c8d0")+'</g>'+
leaf(1112,357,1.15)+rect(1085,356,60,44,"#d69a81",'rx="9"')+toys+stars);
}
function farm(){
const fence=Array.from({length:19},(_,i)=>rect(i*68-5,320,12,83,"#e9d7ad",'rx="5" stroke="#ae936c" stroke-width="2"')+rect(i*68-7,340,75,11,"#f5dfb7",'rx="3"')).join("");
const hay=Array.from({length:3},(_,i)=>'<g transform="translate('+(190+i*355)+' '+(400+(i%2)*20)+')">'+rect(-64,-27,127,65,"#e8c66b",'rx="19" stroke="#c8a75e" stroke-width="5"')+path("M-56 -6Q0 -23 55 -4M-48 17Q0 2 49 18","none",'stroke="#fff0b0" stroke-width="5"')+'</g>').join("");
return svg(rect(0,0,1200,550,"url(#sky)")+circ(934,92,62,"#fff0b2",'opacity=".88"')+clouds+
path("M0 285Q145 204 309 277Q473 194 625 281Q808 215 981 282Q1085 238 1200 278V550H0Z","#a5b99b")+
path("M0 321Q185 268 378 327Q566 269 758 330Q1003 267 1200 326V550H0Z","#86b38a")+
rect(0,351,1200,199,"url(#green)")+fence+
'<g filter="url(#shade)">'+rect(454,177,285,196,"#d9826f",'stroke="#fff0c7" stroke-width="8"')+path("M418 181L597 83L777 181Z","#95546c",'stroke="#f3d9b5" stroke-width="10" stroke-linejoin="round"')+rect(543,243,111,132,"#81515a",'rx="50" stroke="#f9dba7" stroke-width="9"')+path("M600 246V369M543 308H655","none",'stroke="#e6ac89" stroke-width="8"')+rect(571,148,56,53,"#f7e3ba",'rx="6" stroke="#b8837a" stroke-width="5"')+path("M599 148V202M571 175H627","none",'stroke="#b8837a" stroke-width="5"')+'</g>'+
'<g transform="translate(164 271)"><path d="M0 0V-139" stroke="#f2e6c8" stroke-width="13"/><circle cy="-139" r="17" fill="#b9908b"/>'+[0,90,180,270].map(a=>'<path d="M0 -139Q-28 -192 0 -231Q32 -188 0 -139Z" fill="#f6e9d3" stroke="#cdbba5" stroke-width="4" transform="rotate('+a+' 0 -139)"/>').join("")+'</g>'+
hay+Array.from({length:22},(_,i)=>flower((i*113+23)%1200,391+(i*47)%137,.42+(i%4)*.16,i%2?"#ffe3a6":"#ffc9c6")).join("")+
leaf(1094,422,.8)+leaf(91,441,.7));
}
function jungle(){
const vine=Array.from({length:11},(_,i)=>path("M"+(i*118+20)+" 0Q"+(i*118-35)+" 75 "+(i*118+40)+" "+(112+(i%4)*20),"none",'stroke="#3d795b" stroke-width="'+(7+i%3*3)+'" stroke-linecap="round"'));
const canopy=Array.from({length:16},(_,i)=>ell((i*92+19)%1300-30,6+(i%3)*13,72+(i%4)*15,47,["#367a68","#4c9772","#6cad75"][i%3],'opacity=".94"')).join("");
const stones=Array.from({length:15},(_,i)=>ell((i*143+31)%1200,452+(i*43)%97,22+(i%4)*9,9+(i%3)*4,["#8a9f88","#c7b69a","#668f8a"][i%3],'opacity=".68"')).join("");
return svg(rect(0,0,1200,550,"#7ac8ba")+rect(0,0,1200,290,"url(#sky)")+
path("M0 266Q160 163 290 251Q440 174 600 253Q768 155 927 253Q1063 181 1200 250V550H0Z","#79a995")+
path("M0 301Q120 235 251 301Q400 226 546 299Q703 212 869 302Q1041 224 1200 300V550H0Z","#4b987d")+
rect(0,321,1200,229,"#75ac80")+
'<g filter="url(#shade)">'+path("M875 179Q933 154 999 186L983 549H841Z","#719a9b")+path("M902 192Q944 167 976 198L951 550H866Z","#a5e8e3",'opacity=".88"')+path("M903 198Q924 231 902 270Q941 322 901 366Q936 416 906 469","none",'stroke="#f5ffff" stroke-width="13" opacity=".42"')+ell(917,494,157,42,"#73c6bc",'opacity=".7"')+'</g>'+
'<g filter="url(#shade)">'+rect(465,223,218,128,"#b7a88a",'rx="6" stroke="#8a937e" stroke-width="8"')+path("M439 224L574 142L710 224Z","#8a9986",'stroke="#c5c7a3" stroke-width="9"')+rect(536,262,77,89,"#536e6d",'rx="33"')+rect(491,253,28,34,"#6b8c7f")+rect(627,253,28,34,"#6b8c7f")+'</g>'+
'<g transform="translate(70 357)">'+rect(-12,-172,39,184,"url(#wood)",'rx="9"')+ell(4,-179,113,67,"#3b8b65")+ell(-65,-176,76,60,"#4b9870")+ell(69,-189,80,62,"#65aa74")+'</g>'+
'<g transform="translate(1160 362)">'+rect(-14,-169,37,184,"url(#wood)",'rx="9"')+ell(5,-186,126,73,"#438e6d")+ell(-67,-176,71,61,"#57a473")+ell(71,-182,80,66,"#76b67e")+'</g>'+
vine.join("")+canopy+leaf(214,444,1.5)+leaf(1104,449,1.4)+leaf(370,460,.75)+leaf(751,459,.8)+stones+
Array.from({length:19},(_,i)=>flower((i*157+44)%1200,370+(i*61)%155,.38+(i%3)*.2,["#f9b5a7","#ffd8b3","#e9c2ef"][i%3])).join(""));
}
function forest(){
const trees=Array.from({length:9},(_,i)=>{
const x=i*151-15,base=358+(i%3)*18,scale=.7+(i%4)*.12;
return '<g transform="translate('+x+' '+base+') scale('+scale+')">'+rect(-16,-210,32,233,"#8c695e",'rx="10"')+path("M-114 -112L0 -332L114 -112Z","#407f70",'stroke="#4e8c79" stroke-width="8"')+path("M-94 -162L0 -369L94 -162Z","#56977b",'stroke="#639e85" stroke-width="7"')+path("M-71 -217L0 -400L71 -217Z","#6ca78b",'stroke="#7db697" stroke-width="6"')+'</g>';
}).join("");
const mush=Array.from({length:12},(_,i)=>{const x=(i*151+42)%1200,y=396+(i*49)%139;return '<g transform="translate('+x+' '+y+')">'+rect(-5,-17,10,19,"#fff3d5",'rx="4"')+path("M-21 -14Q-19 -43 0 -43Q19 -43 21 -14Z",["#e4a5ad","#b2a1d0","#e7bd88"][i%3])+circ(-8,-24,3,"#fff2de")+circ(8,-28,3,"#fff2de")+'</g>'}).join("");
return svg(rect(0,0,1200,550,"#b4c9b5")+rect(0,0,1200,295,"url(#sky)")+
circ(949,108,59,"#ffeab3",'opacity=".7"')+clouds+
path("M0 295Q165 219 317 284Q475 206 632 284Q806 221 963 283Q1080 225 1200 277V550H0Z","#a7b4a2")+
path("M0 344Q200 279 401 346Q606 281 797 339Q1014 281 1200 346V550H0Z","#7aa68e")+
rect(0,357,1200,193,"#82aa81")+
trees+path("M567 345Q639 337 687 350Q780 430 871 550H351Q451 430 567 345Z","#d2b995",'opacity=".72"')+
path("M0 495Q192 450 338 487Q483 469 590 514L590 550H0Z","#5b9b88",'opacity=".65"')+
'<g filter="url(#shade)">'+ell(1047,401,133,64,"#9d9e89")+ell(1045,394,103,50,"#a9aa99")+path("M1001 429Q1006 352 1052 352Q1097 355 1104 429Z","#4d6d68")+'</g>'+
mush+leaf(97,466,1.25)+leaf(1155,481,1.15)+Array.from({length:24},(_,i)=>flower((i*131+25)%1200,409+(i*37)%120,.38+(i%3)*.17,i%2?"#d4c6f0":"#ffdfac")).join(""));
}
function sea(){
const rays=Array.from({length:8},(_,i)=>path('M'+(i*160-80)+' -20L'+(i*140+55)+' 390L'+(i*140+115)+' 390Z',"#c4faff",'opacity=".09"')).join("");
const bubbles=Array.from({length:40},(_,i)=>circ((i*211+35)%1200,36+(i*73)%472,3+(i%5)*2,"none",'stroke="#d2ffff" stroke-width="2" opacity="'+(.2+(i%4)*.14)+'"')).join("");
const coral=Array.from({length:17},(_,i)=>{const x=(i*137+37)%1200,y=494+(i%4)*10;return '<g transform="translate('+x+' '+y+')">'+path('M0 0V-56M0 -25Q-27 -35 -28 -65M0 -37Q31 -40 34 -79',"none",'stroke="'+["#f49d9e","#f3c47d","#b4a4d7","#7ec6b9"][i%4]+'" stroke-width="'+(8+i%3*3)+'" stroke-linecap="round"')+'</g>'}).join("");
const fish=Array.from({length:14},(_,i)=>{const x=(i*193+55)%1200,y=72+(i*83)%316,scale=.55+(i%3)*.23;return '<g transform="translate('+x+' '+y+') scale('+scale+')" opacity=".62">'+ell(0,0,21,12,["#f7e3a2","#ffb9b6","#b7e9f3"][i%3])+path("M-17 0L-39 -16L-39 16Z",["#f7e3a2","#ffb9b6","#b7e9f3"][i%3])+circ(12,-3,2,"#385e86")+'</g>'}).join("");
const kelp=Array.from({length:15},(_,i)=>{const x=(i*97+17)%1200,h=64+(i%4)*24;return '<g transform="translate('+x+' 550)">'+path("M0 0Q-35 -35 -5 -"+h+"M0 0Q35 -40 16 -"+(h+25),"none",'stroke="'+(i%2?"#5db69a":"#7ec6a2")+'" stroke-width="13" stroke-linecap="round"')+'</g>'}).join("");
return svg(rect(0,0,1200,550,"url(#ocean)")+rays+
path("M0 0Q190 17 383 0Q572 23 760 0Q981 19 1200 0V33Q1002 53 804 32Q596 54 400 33Q194 53 0 33Z","#d4ffff",'opacity=".28"')+
ell(280,493,316,99,"#3b8b9e",'opacity=".4"')+ell(1047,480,317,105,"#276b96",'opacity=".5"')+
path("M0 475Q205 432 404 483Q599 440 783 475Q1025 432 1200 477V550H0Z","#e4d0a7")+
path("M0 506Q239 469 440 509Q638 475 822 508Q1043 473 1200 507V550H0Z","#e6d6b4")+
'<g filter="url(#shade)">'+ell(151,494,112,51,"#638a9b")+ell(1062,495,130,63,"#5b8496")+'</g>'+
kelp+coral+fish+bubbles+
Array.from({length:13},(_,i)=>'<g transform="translate('+((i*139+72)%1200)+' '+(513+(i%3)*9)+')">'+path("M-16 0Q-13 -26 0 -30Q13 -26 16 0Z",["#f7b5ad","#edcc8f","#bdafdf"][i%3])+path("M-13 -5L13 -5","none",'stroke="#fff1d5" stroke-width="2"')+'</g>').join(""));
}
const backgrounds={pets:pets(),farm:farm(),wild:jungle(),forest:forest(),sea:sea()};
const cache={};
function background(theme){return cache[theme]||(cache[theme]=uri(backgrounds[theme]||backgrounds.pets))}
const palette=["#ef9fb0","#9bb9e5","#a5d7b1","#f3ca89","#c5abe4"];
function destination(theme,i,word){
const color=palette[i%5],roof=["#c87691","#688ec8","#77aa8a","#c99861","#a17ac0"][i%5];
const defs='<defs><linearGradient id="face" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff8e5"/><stop offset=".4" stop-color="'+color+'"/><stop offset="1" stop-color="'+roof+'"/></linearGradient><linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffecc1"/><stop offset="1" stop-color="#b88b75"/></linearGradient><filter id="ds"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#243d52" flood-opacity=".3"/></filter></defs>';
const wrap=inner=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 165" role="img" aria-label="'+word+'">'+defs+ell(100,151,80,10,"#344e5b",'opacity=".18"')+'<g filter="url(#ds)">'+inner+'</g></svg>';
if(theme==="pets"){
 if(word==="DOG")return wrap(path("M19 78L100 19L181 78V145H19Z","url(#face)",'stroke="#fff3cf" stroke-width="7"')+path("M8 82L100 8L192 82L175 91L100 35L25 91Z",roof,'stroke="#fff3d5" stroke-width="4"')+path("M61 146V102Q61 65 100 65Q139 65 139 102V146Z","#6b5675",'stroke="#fff1c5" stroke-width="7"')+circ(125,105,5,"#ffe49a")+circ(100,54,13,"#fff5d6")+circ(85,48,5,roof)+circ(114,48,5,roof)+circ(100,62,5,roof));
 if(word==="FISH")return wrap(rect(21,35,158,110,"#8dd5eb",'rx="23" stroke="#fff5d7" stroke-width="10"')+path("M30 125Q73 111 106 126Q147 115 170 126V136H30Z","#e6d8a7")+leaf(53,127,.43)+leaf(149,125,.4)+Array.from({length:7},(_,j)=>circ(70+j*13,49+(j%3)*19,3+j%2,"#fff",'opacity=".7"')).join("")+rect(17,26,166,16,roof,'rx="7"')+rect(34,138,132,10,roof,'rx="5"'));
 if(word==="TURTLE")return wrap(rect(24,68,152,76,"#c9ae89",'rx="19" stroke="#fff2d3" stroke-width="7"')+rect(33,75,134,59,"#96c5a3",'rx="11"')+ell(100,125,54,12,"#f1d7a9")+path("M49 110Q60 84 71 110M93 111Q105 85 118 112M133 110Q143 91 154 109","none",'stroke="#6d9f83" stroke-width="7"')+rect(17,55,166,17,roof,'rx="7"'));
 if(word==="RABBIT")return wrap(ell(100,129,81,22,"#f3e4ce",'stroke="#fff8e9" stroke-width="6"')+path("M24 128Q24 55 100 55Q176 55 176 128Z","url(#face)",'stroke="#fff4e4" stroke-width="6"')+path("M39 103Q100 73 161 103","none",'stroke="#f5e9d9" stroke-width="9"')+ell(100,128,57,11,"#fff8e6")+path("M64 52Q52 31 63 22M134 52Q148 32 137 20","none",'stroke="'+roof+'" stroke-width="8" stroke-linecap="round"'));
 return wrap(ell(100,132,85,24,"#f6dfd2",'stroke="#fff8e8" stroke-width="7"')+ell(100,123,77,20,"url(#face)")+ell(100,125,59,13,"#fff4e6")+path("M28 116Q32 76 52 78M172 116Q168 76 148 78","none",'stroke="'+roof+'" stroke-width="11" stroke-linecap="round"')+circ(100,125,9,"#e8b7b2"));
}
if(theme==="farm")return wrap(rect(18,75,164,72,"url(#face)",'rx="9" stroke="#fff0cf" stroke-width="6"')+path("M7 77L100 18L193 77L177 90L100 42L23 90Z",roof,'stroke="#fff1d3" stroke-width="6"')+rect(61,88,78,59,"#644e62",'rx="29" stroke="#ffedc3" stroke-width="7"')+path("M100 91V145","none",'stroke="#e6b792" stroke-width="6"')+rect(29,93,20,22,"#a4d7d3",'rx="3" stroke="#fff2d3" stroke-width="4"')+rect(151,93,20,22,"#a4d7d3",'rx="3" stroke="#fff2d3" stroke-width="4"')+path("M31 127H50M150 127H169","none",'stroke="'+roof+'" stroke-width="5"'));
if(theme==="wild"){
const shapes=[
path("M28 123Q28 53 100 53Q172 53 172 123Z","#c6ad8e",'stroke="#f7e4bd" stroke-width="7"')+path("M65 139V101Q100 70 135 101V139Z","#536d5d"),
ell(100,133,87,21,"#a6d1b1")+path("M38 127Q63 69 100 96Q132 66 162 127Z","#78b5ab")+path("M47 128Q100 115 153 128","none",'stroke="#e3f5db" stroke-width="5"'),
rect(27,74,146,70,"#a7b88d",'rx="18"')+path("M9 78L100 21L191 78Z","#4c9a74",'stroke="#a7d5a1" stroke-width="7"')+path("M65 144V101Q100 78 135 101V144Z","#55785c"),
ell(100,134,86,22,"#9dd2d0")+path("M45 138Q60 96 100 101Q140 96 155 138","none",'stroke="#e2f6e9" stroke-width="12"')+leaf(100,112,.53),
path("M33 142L40 85L100 43L160 85L167 142Z","#b2c58d",'stroke="#e4e8b0" stroke-width="6"')+path("M66 142V105Q100 78 134 105V142Z","#688d68")+leaf(47,105,.38)+leaf(154,105,.38)
];
return wrap(shapes[i%5]+leaf(34,135,.45)+leaf(169,136,.45));
}
if(theme==="forest"){
const cave=path("M19 145Q21 58 100 48Q178 60 181 145Z","url(#face)",'stroke="#d6d4ae" stroke-width="7"')+path("M59 145V113Q100 66 141 113V145Z","#48665e",'stroke="#b4c7a6" stroke-width="6"');
return wrap(cave+(i%2===0?path("M17 85Q100 14 183 85","none",'stroke="#719f77" stroke-width="17" stroke-linecap="round"'):path("M40 64Q100 10 160 64","none",'stroke="#bca58d" stroke-width="14"'))+leaf(35,140,.42)+leaf(163,140,.44)+[0,1,2].map(j=>circ(67+j*34,69+(j%2)*10,6,["#ffdfaa","#f6c2c8","#e4c2f4"][j])).join(""));
}
if(theme==="sea"){
const shell=path("M24 138Q11 90 48 52Q100 8 152 52Q189 90 176 138Z","url(#face)",'stroke="#fff0db" stroke-width="7"')+path("M48 138Q100 99 152 138Z","#5c85a6",'stroke="#f8e8d1" stroke-width="5"')+
Array.from({length:7},(_,j)=>path("M100 35Q"+(28+j*24)+" 74 "+(26+j*24)+" 129","none",'stroke="#fff7e5" stroke-width="3" opacity=".8"')).join("");
return wrap(shell+ell(100,139,79,11,"#f7d4bb")+circ(100,130,7,"#ffecbc")+[0,1,2].map(j=>circ(35+j*64,111+(j%2)*18,4,"#e6ffff",'opacity=".8"')).join(""));
}
return wrap(circ(100,100,65,color));
}
window.PWAnimalWorlds={background,destination,uri,themes:Object.keys(backgrounds)};
})();