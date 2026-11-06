import fs from 'node:fs/promises';
const root=new URL('.',import.meta.url);
const read=p=>fs.readFile(new URL(p,root),'utf8');
const core=await read('catalog-core.mjs');
const snapshot=JSON.parse(await read('catalog.json'));
const coreInline=core.replace(/^export /gm,'');
const application='(()=>{\n'+coreInline+'\n'+(await read('app.js')).replace('/*__SNAPSHOT__*/',()=>JSON.stringify(snapshot).replace(/</g,'\\u003c'))+'\n})();';
const styles=await read('styles.css');
const motionCSS=await read('assets/motion/motion.css');
const motionJS=(await read('assets/motion/motion.js')).replace(/<\/script/gi,'<\\/script');
const html=(await read('page.html'))
  .replace('/*__APPLICATION__*/',()=>application)
  .replace('/*__STYLES__*/',()=>styles+'\n'+motionCSS)
  .replace('/*__MOTION_JS__*/',()=>motionJS);
const server=`${coreInline}
let recent=null;
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 if(url.pathname==='/api/catalog'){
  try{
   // Coalesce requests briefly; the source itself may also be cached by Google.
   if(!recent||Date.now()-recent.time>60000){
    const r=await fetch('https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/export?format=csv',{signal:AbortSignal.timeout(20000),headers:{'Accept':'text/csv'}});
    if(!r.ok)throw Error('Source HTTP '+r.status);
    const text=await r.text();if(text.length>25000000)throw Error('Source too large');
    const clean=cleanRows(parseCSV(text));
    recent={time:Date.now(),body:JSON.stringify({...clean,checkedAt:new Date().toISOString(),source:SOURCE})};
   }
   return new Response(recent.body,{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
  }catch{return Response.json({error:'Не удалось прочитать актуальную таблицу'},{status:502});}
 }
 if(url.pathname!=='/')return new Response('Not found',{status:404});
 return new Response(${JSON.stringify(html)},{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-cache','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});
}};
`;
await fs.mkdir(new URL('worker/',root),{recursive:true});
await fs.mkdir(new URL('downloads/',root),{recursive:true});
await fs.writeFile(new URL('worker/index.js',root),server);
await fs.writeFile(new URL('downloads/Eaudestore-каталог.html',root),html);
await fs.mkdir(new URL('docs/',root),{recursive:true});
await fs.writeFile(new URL('docs/index.html',root),html.replace('<html lang="ru"','<html lang="ru" data-catalog-mode="direct"'));
await fs.writeFile(new URL('docs/.nojekyll',root),'');
console.log(JSON.stringify({positions:snapshot.rows.length,htmlBytes:Buffer.byteLength(html),workerBytes:Buffer.byteLength(server)}));
