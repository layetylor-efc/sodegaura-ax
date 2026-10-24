(() => {
'use strict';
const panel=document.getElementById('geo-last-preview');
const bar=panel?.querySelector('.geo-preview-head');
if(!panel||!bar)return;
const KEY='geo_pulse_preview_position_v97';
let saved=null,drag=null;
try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))saved=p;}catch(_){}
function place(x,y){
const r=panel.getBoundingClientRect();
const p={x:Math.max(6,Math.min(x,innerWidth-r.width-6)),y:Math.max(6,Math.min(y,innerHeight-r.height-6))};
panel.style.setProperty('left',Math.round(p.x)+'px','important');
panel.style.setProperty('top',Math.round(p.y)+'px','important');
panel.style.setProperty('right','auto','important');
panel.style.setProperty('bottom','auto','important');
panel.style.setProperty('transform','none','important');
return p;
}
function open(){
if(panel.hidden)return;
const r=panel.getBoundingClientRect();
panel.classList.add('geo-mini-glass-v97');
place(saved?.x??r.left,saved?.y??r.top);
}
document.addEventListener('geo:mini-preview-opened',open);
bar.addEventListener('pointerdown',e=>{
if(e.button!==0&&e.pointerType==='mouse'||e.target.closest('button,a,input'))return;
const r=panel.getBoundingClientRect();
drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false};
try{bar.setPointerCapture(e.pointerId);}catch(_){}
e.preventDefault();
});
bar.addEventListener('pointermove',e=>{
if(!drag||e.pointerId!==drag.id)return;
const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
if(Math.hypot(dx,dy)>=5)drag.moved=true;
if(drag.moved){panel.classList.add('geo-mini-moving');place(drag.left+dx,drag.top+dy);e.preventDefault();}
});
function stop(e){
if(!drag||e.pointerId!==drag.id)return;
if(drag.moved){
const r=panel.getBoundingClientRect();saved={x:r.left,y:r.top};
try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(_){}
}
drag=null;panel.classList.remove('geo-mini-moving');
try{bar.releasePointerCapture(e.pointerId);}catch(_){}
}
bar.addEventListener('pointerup',stop);
bar.addEventListener('pointercancel',stop);
const resize=()=>{if(!panel.hidden&&!drag){const r=panel.getBoundingClientRect();place(saved?.x??r.left,saved?.y??r.top);}};
window.addEventListener('resize',resize,{passive:true});
window.visualViewport?.addEventListener('resize',resize,{passive:true});
})();