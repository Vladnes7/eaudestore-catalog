const SNAPSHOT=/*__SNAPSHOT__*/;
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n)+' ₽';
const number=n=>new Intl.NumberFormat('ru-RU').format(n);
const positions=n=>number(n)+' '+(n%10===1&&n%100!==11?'позиция':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'позиции':'позиций');
let sourceRows=SNAPSHOT.rows,products=[],filtered=[],page=0,view='catalog',busy=false,hasRemote=false;
let requestedView='catalog';
let refreshTimer;
function refreshState(state){
 clearTimeout(refreshTimer);const button=$('#refresh');
 button.disabled=state==='loading';button.setAttribute('aria-busy',String(state==='loading'));
 ['loading','success','error'].forEach(s=>button.classList.toggle('is-'+s,state===s));
 const labels={idle:'Обновить цены',loading:'Проверяем цены…',success:'Цены актуальны',error:'Повторить'};
 buttonContent(button,labels[state]);
 if(state==='success')refreshTimer=setTimeout(()=>refreshState('idle'),2400);
}
let favorites=new Set();try{favorites=new Set(JSON.parse(localStorage.getItem('eaude-favorites')||'[]'));}catch{}
const SIZE=60;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t){$('#toast').textContent=t;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,3500);}
function prepare(rows){products=rows.map(describe);$('#totalCount').textContent=number(rows.length);$('#heroCount').textContent=number(rows.length);$('#favCount').textContent=favorites.size;}
function apply(){
 const terms=normalize($('#search').value).split(' ').filter(Boolean),format=$('#format').value,conc=$('#concentration').value,vol=$('#volume').value,min=Number($('#minPrice').value)||0,max=$('#maxPrice').value===''?Infinity:Number($('#maxPrice').value);
 $('#clearSearch').hidden=!$('#search').value;
 const filterIds=['format','concentration','volume','minPrice','maxPrice'];
 const active=filterIds.filter(id=>$('#'+id).value!=='').length;
 filterIds.forEach(id=>$('#'+id).closest('.control').classList.toggle('has-value',$('#'+id).value!==''));
 $('#filterCount').textContent=active;$('#filterCount').hidden=!active;$('#filterCount').setAttribute('aria-label','Активных фильтров: '+active);
 $('#reset').classList.toggle('has-filters',!!active||!!$('#search').value);
 filtered=products.filter(p=>terms.every(t=>p.search.includes(t))&&p.price>=min&&p.price<=max&&(!format||(format==='tester'?p.tester:!p.tester))&&(!conc||p.conc===conc)&&(!vol||(p.volume!==null&&(vol==='small'?p.volume<=30:vol==='medium'?p.volume>30&&p.volume<=75:vol==='large'?p.volume>75&&p.volume<=125:p.volume>125)))&&(view!=='favorites'||favorites.has(p.key)));
 const sort=$('#sort').value;if(sort==='low')filtered.sort((a,b)=>a.price-b.price);if(sort==='high')filtered.sort((a,b)=>b.price-a.price);if(sort==='az')filtered.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
 page=0;render();
}
function render(){
 $('#resultCount').textContent=positions(filtered.length);
 $('#empty').hidden=!!filtered.length;
 $('#empty strong').textContent=view==='favorites'&&!favorites.size?'Здесь будут ваши ароматы':'Ничего не нашлось';
 $('#empty > span:last-child').textContent=view==='favorites'&&!favorites.size?'Нажмите на сердечко у понравившейся позиции.':'Попробуйте часть названия или сбросьте фильтры.';
 $('#rows').innerHTML=filtered.slice(page*SIZE,(page+1)*SIZE).map(p=>'<tr><td class="namecell"><div class="name">'+escapeHTML(p.name)+'</div><div class="tags">'+(p.tester?'<span class="badge badge-tester">Тестер</span>':'')+(p.conc?'<span class="badge">'+p.conc+'</span>':'')+(p.volume!==null?'<span class="badge">'+p.volume+' мл</span>':'')+'</div></td><td class="vol">'+(p.volume!==null?p.volume+' мл':'—')+'</td><td class="price">'+money(p.price)+'</td><td class="favcell"><button class="fav '+(favorites.has(p.key)?'selected':'')+'" data-index="'+p.index+'" aria-label="'+(favorites.has(p.key)?'Убрать из избранного':'Добавить в избранное')+'" aria-pressed="'+favorites.has(p.key)+'"><svg aria-hidden="true"><use href="#i-heart"/></svg></button></td></tr>').join('');
 $('#range').textContent=filtered.length?number(page*SIZE+1)+'–'+number(Math.min((page+1)*SIZE,filtered.length))+' из '+number(filtered.length):'0 позиций';$('#prev').disabled=page===0;$('#next').disabled=(page+1)*SIZE>=filtered.length;
}
function commitView(next){view=next;$$('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});$('#catalogView').hidden=!['catalog','favorites'].includes(view);$('#updatesView').hidden=view!=='updates';$('#promotionsView').hidden=view!=='promotions';$('#heading').textContent=view==='favorites'?'Ваше избранное':'Каталог парфюмерии';apply();}
function setView(next){if(next===requestedView)return;requestedView=next;const current=$('main > section:not([hidden])');transitionView(current,()=>commitView(next));}
async function db(mode,value){return new Promise((resolve,reject)=>{if(!window.indexedDB){resolve(null);return;}const r=indexedDB.open('eaude-catalog',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const d=r.result,tx=d.transaction('snapshots',mode==='put'?'readwrite':'readonly'),s=tx.objectStore('snapshots'),q=mode==='put'?s.put(value,'latest'):s.get('latest');q.onsuccess=()=>{const v=q.result;tx.oncomplete=()=>{d.close();resolve(v);};};q.onerror=()=>{d.close();reject(q.error);};};});}
async function refresh(){
 if(busy)return;busy=true;refreshState('loading');let finalState='idle';
 if(location.protocol==='file:'){busy=false;refreshState('idle');$('#notice').textContent='Это автономная копия. Для обновления откройте онлайн-каталог или Google-таблицу из раздела «Обновления».';return;}
 try{
  const direct=document.documentElement.dataset.catalogMode==='direct';
  const endpoint=direct?'https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/export?format=csv':'/api/catalog';
  const response=await fetch(endpoint,{credentials:direct?'omit':'same-origin',cache:'no-store',signal:AbortSignal.timeout(25000)});if(!response.ok)throw Error('Источник временно недоступен');
  const data=direct?{...cleanRows(parseCSV(await response.text())),checkedAt:new Date().toISOString(),source:SOURCE}:await response.json();if(!Array.isArray(data.rows)||!data.rows.length||data.rows.some(r=>!Array.isArray(r)||typeof r[0]!=='string'||!Number.isFinite(r[1])||r[1]<=0))throw Error('Источник вернул некорректные данные');
  const changes=diffRows(sourceRows,data.rows);sourceRows=data.rows;prepare(sourceRows);apply();hasRemote=true;
  const date=new Date(data.checkedAt).toLocaleString('ru-RU',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
  $('#lastChecked').textContent='Проверено по источнику · '+date;$('#notice').textContent='';
  const count=changes.changed.length+changes.added.length+changes.removed.length;
  $('#updateSummary').textContent='Проверено '+date+'. '+(count?'Изменились цены: '+changes.changed.length+'. Новые названия: '+changes.added.length+'. Исчезли из прайса: '+changes.removed.length+'.':'Цены и состав прайса не изменились относительно сохранённой версии.');
  $('#changeList').innerHTML=[...changes.changed.slice(0,30).map(([n,a,b])=>'<li>'+escapeHTML(n)+'<br>'+a.map(money).join(' / ')+' → <b>'+b.map(money).join(' / ')+'</b></li>'),...changes.added.slice(0,10).map(([n,p])=>'<li>Добавлено: '+escapeHTML(n)+' · '+p.map(money).join(' / ')+'</li>'),...changes.removed.slice(0,10).map(([n])=>'<li>Исчезло из прайса: '+escapeHTML(n)+'</li>')].join('');
  finalState='success';if(count)toast('Прайс обновлён. Изменения — в разделе «Обновления».');
  try{await db('put',data);}catch{toast('Цены обновлены. Браузер не смог сохранить копию для работы без сети.');}
 }catch(e){finalState='error';$('#notice').textContent='Не удалось проверить источник. Показана сохранённая копия; её дата указана сверху. Повторите обновление позже.';$('#updateSummary').textContent='Последняя попытка обновления не удалась. Сохранённые цены не изменены.';}
 finally{busy=false;refreshState(finalState);}
}
$('#search').addEventListener('input',apply);['format','concentration','volume','sort','minPrice','maxPrice'].forEach(id=>$('#'+id).addEventListener('input',apply));
$('#clearSearch').onclick=()=>{$('#search').value='';apply();$('#search').focus();};$('#reset').onclick=()=>{['search','format','concentration','volume','minPrice','maxPrice'].forEach(id=>$('#'+id).value='');$('#sort').value='source';apply();};
$('#rows').onclick=e=>{const b=e.target.closest('[data-index]');if(!b)return;const p=products[Number(b.dataset.index)];favorites.has(p.key)?favorites.delete(p.key):favorites.add(p.key);try{localStorage.setItem('eaude-favorites',JSON.stringify([...favorites]));}catch{toast('Избранное сохранено только до закрытия вкладки.');}$('#favCount').textContent=favorites.size;if(view==='favorites')apply();else render();};
$('#next').onclick=()=>{page++;render();$('#resultCount').scrollIntoView({block:'start'});};$('#prev').onclick=()=>{page--;render();$('#resultCount').scrollIntoView({block:'start'});};
$$('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('#refresh').onclick=refresh;$$('.sourceLink').forEach(a=>a.href=SOURCE);
$('#export').onclick=()=>{const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';const blob=new Blob(['\uFEFF'+[['НАИМЕНОВАНИЕ','ЦЕНА'],...sourceRows].map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='eaudestore-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const promos=[['Io Non Ho Mani',22850],['Ne il Giorno',20930],['Quando Rapita In Estasi',19190],['Oceano Viola',18780],...['Symphonie Passion','Reliqvia','Lavs','Scusami','Opus 1144','Ennui Noir','Chiudi Gli Occi E Poi Vedi','But Not Today','Lascia Chio Pianga','Rosa Nigra'].map(n=>[n,17900])];
$('#promos').innerHTML=promos.map(([n,p])=>'<article class="promo"><span>FILIPPO SORCINELLI</span><strong>'+escapeHTML(n)+'</strong><b>'+money(p)+'</b></article>').join('');
$('#promoSource').href='https://t.me/eaudestore/1378';
$('#promoSource').textContent='Открыть пост со скидками';
enhanceActions();
prepare(sourceRows);apply();
(async()=>{try{const cached=await db('get');if(cached?.rows?.length&&!hasRemote){sourceRows=cached.rows;prepare(sourceRows);apply();$('#lastChecked').textContent='Сохранённая копия · '+new Date(cached.checkedAt).toLocaleString('ru-RU');}}catch{}await refresh();})();
