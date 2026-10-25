(() => {
'use strict';
const miniGlassStyle=document.createElement('style');
miniGlassStyle.id='geo-v97-mini-glass';
miniGlassStyle.textContent="\n#geo-last-preview.geo-mini-glass-v97{\n  z-index:15020!important;right:auto!important;bottom:auto!important;transform:none!important;\n  width:min(380px,88vw)!important;max-height:min(430px,70dvh)!important;\n  background:linear-gradient(155deg,rgba(10,32,56,.75),rgba(14,47,70,.66))!important;\n  border:1px solid rgba(147,221,241,.52)!important;border-radius:18px!important;\n  box-shadow:0 15px 42px rgba(0,17,39,.35),inset 0 1px rgba(255,255,255,.16)!important;\n  backdrop-filter:blur(14px) saturate(140%)!important;\n  -webkit-backdrop-filter:blur(14px) saturate(140%)!important;\n}\n#geo-last-preview.geo-mini-glass-v97 .geo-preview-head{\n  background:rgba(20,53,77,.47)!important;\n  border-color:rgba(154,223,247,.28)!important;\n  touch-action:none!important;user-select:none!important;-webkit-user-select:none!important;cursor:grab;\n}\n#geo-last-preview.geo-mini-glass-v97 .geo-preview-head::before{content:'⠿';font-size:19px;color:#92e8fb;font-weight:900;line-height:1;}\n#geo-last-preview.geo-mini-glass-v97.geo-mini-moving .geo-preview-head{cursor:grabbing;}\n#geo-last-preview.geo-mini-glass-v97 .geo-preview-close{touch-action:manipulation!important;cursor:pointer!important;}\n#geo-last-preview.geo-mini-glass-v97 .geo-preview-foot{\n  background:rgba(20,53,77,.47)!important;border-color:rgba(154,223,247,.28)!important;\n}\n#geo-last-preview.geo-mini-glass-v97 .geo-preview-iframe-wrap{\n  background:rgba(6,30,51,.31)!important;color:#f4faff!important;\n}\n#geo-last-preview.geo-mini-glass-v97 .geo-mini-local{background:transparent!important;}\nhtml[data-geo-theme=\"normal\"] #geo-last-preview.geo-mini-glass-v97{\n  color:#15334a!important;\n  background:linear-gradient(150deg,rgba(244,252,255,.78),rgba(214,236,249,.69))!important;\n  border-color:rgba(64,153,182,.46)!important;\n  box-shadow:0 15px 36px rgba(30,82,116,.23),inset 0 1px rgba(255,255,255,.68)!important;\n}\nhtml[data-geo-theme=\"normal\"] #geo-last-preview.geo-mini-glass-v97 .geo-preview-head,\nhtml[data-geo-theme=\"normal\"] #geo-last-preview.geo-mini-glass-v97 .geo-preview-foot{\n  background:rgba(235,248,255,.49)!important;border-color:rgba(61,143,184,.25)!important;\n}\nhtml[data-geo-theme=\"normal\"] #geo-last-preview.geo-mini-glass-v97 .geo-preview-iframe-wrap{\n  background:rgba(244,252,255,.38)!important;color:#15334a!important;\n}\nhtml[data-geo-theme=\"normal\"] #geo-last-preview.geo-mini-glass-v97 .geo-preview-head::before{color:#237ca3;}\n@media(max-width:640px){#geo-last-preview.geo-mini-glass-v97{width:min(340px,84vw)!important;max-height:min(390px,65dvh)!important;}}\n@media(prefers-reduced-transparency:reduce){\n  #geo-last-preview.geo-mini-glass-v97{background:rgba(8,27,47,.94)!important;}\n  html[data-geo-theme=\"normal\"] #geo-last-preview.geo-mini-glass-v97{background:rgba(244,252,255,.96)!important;}\n}";
document.head.appendChild(miniGlassStyle);
const panel=document.getElementById('geo-last-preview');
const bar=panel?.querySelector('.geo-preview-head');
if(!panel||!bar)return;
const KEY='geo_pulse_preview_position_v97';
const ver=document.getElementById('geo-version-value');if(ver)ver.textContent='v97';
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