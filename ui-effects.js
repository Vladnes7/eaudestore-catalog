// React renders the CSS-only component once at build time. This adapter keeps
// existing native buttons/links, their IDs, event handlers and keyboard semantics.
const BUTTON_MARKUP=/*__BUTTON_MARKUP__*/;
const buttonTemplate=document.createElement('template');buttonTemplate.innerHTML=BUTTON_MARKUP;
function buttonContent(element,text){
 const label=String(text).replace(/[↗→]/g,'').trim();
 element.classList.add('interactive-hover','group');
 element.dataset.buttonText=label;
 const contents=buttonTemplate.content.firstElementChild.cloneNode(true);
 contents.querySelector('.hover-rest').textContent=label;
 contents.querySelector('.hover-copy span').textContent=label;
 element.replaceChildren(...contents.childNodes);
}
function enhanceActions(){
 document.querySelectorAll('.btn,.actions a,#promoSource,#reset').forEach(element=>{
  if(element.tagName==='A')element.classList.add('resource-button');
  if(!element.classList.contains('interactive-hover'))buttonContent(element,element.textContent);
 });
}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let effectsEnabled=true;
try{effectsEnabled=localStorage.getItem('eaude-effects')!=='off';}catch{}
function motionAllowed(){return effectsEnabled&&!reducedMotion.matches;}
function syncEffects(){
 const enabled=motionAllowed();document.documentElement.dataset.effects=enabled?'on':'off';
 const button=document.querySelector('#motionToggle');if(!button)return;
 document.documentElement.dataset.motion=enabled?'':'off';
 button.disabled=reducedMotion.matches;
 button.setAttribute('aria-pressed',String(enabled));
 const label=reducedMotion.matches?'Анимации отключены в настройках устройства':enabled?'Отключить анимацию':'Включить анимацию';
 button.setAttribute('aria-label',label);button.title=label;
 button.querySelector('use').setAttribute('href',enabled?'#i-pause':'#i-play');
}
syncEffects();
document.querySelector('#motionToggle').addEventListener('click',()=>{
 effectsEnabled=!motionAllowed();try{localStorage.setItem('eaude-effects',effectsEnabled?'on':'off');}catch{}
 syncEffects();
});
reducedMotion.addEventListener('change',syncEffects);
let transitionRun=0,viewAnimations=[];
async function transitionView(section,change){
 const run=++transitionRun;viewAnimations.forEach(a=>a.cancel());viewAnimations=[];
 if(!motionAllowed()){change();return;}
 const out=section.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-4px)'}],{duration:110,easing:'ease-in'});
 viewAnimations.push(out);await out.finished.catch(()=>{});if(run!==transitionRun)return;
 change();const incoming=document.querySelector('main > section:not([hidden])');
 const enter=incoming.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'});
 viewAnimations=[enter];await enter.finished.catch(()=>{});if(run===transitionRun)viewAnimations=[];
}
