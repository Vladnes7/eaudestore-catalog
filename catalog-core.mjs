export const SHEET_ID='1oBChZo1L0iVX8IZy4ia8n74nJBjBrX0v099Q8Lpd5KI';
export const SOURCE='https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/edit';
export function parseCSV(text){
  const rows=[];let row=[],value='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else if(quoted||value==='')quoted=!quoted;else value+=c;}
    else if(!quoted&&(c===','||c==='\n'||c==='\r')){row.push(value);value='';if(c!==','){rows.push(row);row=[];if(c==='\r'&&text[i+1]==='\n')i++;}}
    else value+=c;
  }
  if(quoted)throw Error('Незакрытая кавычка в CSV');
  if(value||row.length){row.push(value);rows.push(row);}
  return rows;
}
export function cleanRows(input){
  let empty=0,duplicates=0;const rows=[],seen=new Set();
  if(!input.length||!String(input[0][0]).replace(/^\uFEFF/,'').toUpperCase().includes('НАИМЕНОВАНИЕ')||!String(input[0][1]).toUpperCase().includes('ЦЕНА'))throw Error('Изменились колонки источника. Нужна проверка структуры.');
  for(const r of input.slice(1)){
    if(r.every(v=>!String(v??'').trim())){empty++;continue;}
    const name=String(r[0]??'').trim(),raw=String(r[1]??'').replace(/[\s₽]/g,'').replace(',','.');
    const price=raw!==''?Number(raw):NaN;
    if(!name||!Number.isFinite(price)||price<=0)throw Error('Не удалось прочитать цену: '+name.slice(0,80));
    const key=JSON.stringify([name,price]);if(seen.has(key)){duplicates++;continue;}seen.add(key);rows.push([name,price]);
  }
  if(!rows.length)throw Error('Пустой прайс не заменяет сохранённый каталог');
  return {rows,empty,duplicates};
}
export function normalize(value){
  const map={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'i','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ы':'y','э':'e','ю':'yu','я':'ya','ь':'','ъ':''};
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[а-яё]/g,c=>map[c]).replace(/[^a-z0-9]+/g,' ').trim();
}
export function describe(row,index){
  const [name,price]=row;
  const volume=name.match(/(\d+(?:[.,]\d+)?)\s*(?:ml|мл)(?=$|[^a-zа-я])/i);
  const rawConc=name.match(/\b(edp|edt|edc|extrait|parfume?|perfume)\b/i)?.[1].toUpperCase()||'';
  const conc=/PARFUM|PERFUME/.test(rawConc)?'PARFUM':rawConc;
  const tester=/\btester\b|тестер/i.test(name);
  return {name,price,index,key:name,search:normalize(name),volume:volume?Number(volume[1].replace(',','.')):null,conc,tester};
}
export function diffRows(before,after){
  const group=rows=>{const m=new Map();for(const [n,p] of rows){if(!m.has(n))m.set(n,[]);m.get(n).push(p);}for(const v of m.values())v.sort((a,b)=>a-b);return m;};
  const a=group(before),b=group(after);const changed=[],added=[],removed=[];
  for(const [n,p] of b){if(!a.has(n))added.push([n,p]);else if(JSON.stringify(a.get(n))!==JSON.stringify(p))changed.push([n,a.get(n),p]);}
  for(const [n,p] of a)if(!b.has(n))removed.push([n,p]);
  return {changed,added,removed};
}
