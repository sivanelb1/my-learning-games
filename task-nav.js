const workshopTaskUrl = (index,task) => workshopUrl(index)+(task==='learn'?'':'&task='+task);
function mountTaskNavigation(activeTask){
 const nav=document.getElementById('taskNavigation');
 if(!nav)return ()=>{};
 const header=document.createElement('div');
 header.className='task-heading';
 const title=document.createElement('strong');
 title.textContent='כל משימות רכבת הצלילים';
 const arrows=document.createElement('div');
 arrows.className='task-arrows';
 const strip=document.createElement('div');
 strip.className='task-strip';
 const links=[];
 for(const [index,group] of alphabetGroups.entries()){
  const row=document.createElement('div');
  row.className='task-group';
  const range=stationRange(group);
  for(const [task,label] of [['run','רכבת'],['learn','הסבר אותיות'],['game',index%2?'מתיחת קווים':'זיכרון'],['write','כתיבה'],...(index>0?[['review','משחק סיכום']]:[])]]){
   const link=document.createElement('a');
   link.href=task==='run'?runnerUrl(index):task==='review'?'train-review.html'+(index?'?'+stationQuery(index):''):workshopTaskUrl(index,task);
   const letters=document.createElement('bdi');
   letters.textContent=range;
   letters.dir='ltr';
   const caption=document.createElement('small');
   caption.textContent=label;
   link.append(letters,caption);
   row.append(link);
   links.push({index,task,link});
  }
  strip.append(row);
 }
 for(const [direction,icon,label] of [[1,'◀','למשימות הבאות'],[-1,'▶','למשימות הקודמות']]){
  const button=document.createElement('button');
  button.type='button';
  button.textContent=icon;
  button.setAttribute('aria-label',label);
  button.onclick=()=>strip.scrollBy({left:-direction*strip.clientWidth*.8,behavior:'smooth'});
  arrows.append(button);
 }
 header.append(title,arrows);
 nav.append(header,strip);
 nav.hidden=false;
 const select=task=>{
  for(const entry of links){
   if(entry.index===station&&entry.task===task){
    entry.link.setAttribute('aria-current','step');
    const item=entry.link.getBoundingClientRect();
    const area=strip.getBoundingClientRect();
    if(item.left<area.left||item.right>area.right){
     strip.scrollLeft+=(item.left+item.right-area.left-area.right)/2;
    }
   }else entry.link.removeAttribute('aria-current');
  }
 };
 select(activeTask);
 return select;
}
