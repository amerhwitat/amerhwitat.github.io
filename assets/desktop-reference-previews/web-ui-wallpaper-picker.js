(()=>{'use strict';
const data=window.WEB_UI_BACKGROUNDS;
if(!data||!data.concept_only)return;
const desktop=document.documentElement.dataset.webuiDesktop||document.body.dataset.webuiDesktop;
if(!desktop)return;
const group=data.groups.find(g=>g.id===desktop);
if(!group)return;
const records=data.forDesktop(desktop);
if(!records.length)return;
const target=document.querySelector('[data-wallpaper-target]');
const button=document.querySelector('[data-wallpaper-button]');
const options=document.querySelector('[data-wallpaper-options]');
if(!target||!button||!options)return;
let status=document.querySelector('[data-wallpaper-toast]');
if(!status){status=document.createElement('div');status.className='webui-wallpaper-toast';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.body.appendChild(status)}
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sectionLabels={chimera:'Chimera primary',octavian:'Octavian primary',shared:'Shared across editions'};
const sections=[...new Set(records.map(record=>record.primary_edition))];
options.innerHTML=sections.map(primary=>{
  const list=records.filter(record=>record.primary_edition===primary);
  return '<div class="webui-wallpaper-section">'+esc(sectionLabels[primary]||primary)+'</div>'+list.map(record=>'<button type="button" data-wallpaper="'+esc(record.id)+'" aria-pressed="false"><img loading="lazy" src="'+esc(record.asset)+'" alt=""><span>'+esc(record.label)+'</span></button>').join('');
}).join('');
function notify(message){status.textContent=message;status.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>status.classList.remove('show'),2200)}
function apply(record,announce){
  target.style.backgroundImage='url("'+record.asset+'")';
  options.querySelectorAll('[data-wallpaper]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.wallpaper===record.id)));
  if(announce)notify('Concept background: '+record.label+' · no native session claim');
}
button.setAttribute('aria-expanded','false');
button.addEventListener('click',()=>{
  const opening=options.hasAttribute('hidden');
  if(opening)options.removeAttribute('hidden');else options.setAttribute('hidden','');
  button.setAttribute('aria-expanded',String(opening));
});
options.addEventListener('click',event=>{
  const choice=event.target.closest('[data-wallpaper]');
  if(!choice)return;
  const record=records.find(item=>item.id===choice.dataset.wallpaper);
  if(!record)return;
  apply(record,true);
  options.setAttribute('hidden','');
  button.setAttribute('aria-expanded','false');
});
document.addEventListener('click',event=>{
  if(!event.target.closest('.webui-wallpaper-picker')){
    options.setAttribute('hidden','');
    button.setAttribute('aria-expanded','false');
  }
});
apply(records.find(record=>record.id===group.default)||records[0],false);
})();
