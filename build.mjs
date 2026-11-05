import fs from 'node:fs/promises';
const root=new URL('.',import.meta.url);
const read=p=>fs.readFile(new URL(p,root),'utf8');
const core=await read('catalog-core.mjs');
const snapshot=JSON.parse(await read('catalog.json'));
const coreInline=core.replace(/^export /gm,'');
const application='(()=>{\n'+coreInline+'\n'+(await read('app.js')).replace('/*__SNAPSHOT__*/',()=>JSON.stringify(snapshot).replace(/</g,'\\u003c'))+'\n})();';
const paletteCSS=`
.searchbox input::-webkit-search-cancel-button{display:none}
/* User palette: Capri blue, Sand #D8D3B3, Terra #984A39, Mist #B1B7BE. */
:root{color:#263e4b;background:#f3f1e8;--line:#d5d5c8;--green:#365d73;--muted:#65717a}
.sidebar{background:#d8d3b3}.brand span{color:#365d73}.nav button.active{background:#365d73;color:#fff}.sidebar .eyebrow,.sidefoot{color:#455d67}.main{color:#263e4b}.searchbox{border-color:#9cabb1;background:#fffef9}.searchbox svg{color:#365d73}.searchbox:focus-within{border-color:#365d73;box-shadow:0 0 0 2px #365d7315}.filter select,.filter input{background:#fffef9}.filter select,.filter input,button{color:#263e4b}.tablewrap,.panel,.promo{background:#fffef9}.tablewrap{border-color:#c7cbbf}th{background:#365d73;color:#fff}td{border-color:#e6e5d9}tbody tr:hover{background:#f1f2ed}.tags .badge{background:#e6eaeb;color:#465e6b}.price{color:#365d73}.fav.selected{color:#984a39}#refresh{background:#984a39;border-color:#984a39;color:#fff}.status-dot{background:#365d73}.notice{background:#ece9d9;border-color:#d8d3b3;color:#5c5541}.primary{background:#365d73;color:white;border-color:#365d73}.toast{background:#365d73}.topline button:hover{background:#823e30}button:hover{border-color:#8a9ca4}.empty strong{color:#263e4b}.sourceLink{color:#365d73}.promo{border-top:3px solid #b1b7be}.promo b{color:#984a39}.promo span{color:#65717a}.promos{margin-top:24px}
@media(max-width:720px){.sidebar{background:#d8d3b3}.nav button.active{background:#365d73;color:white}}
`;
const html=(await read('page.html')).replace('/*__APPLICATION__*/',()=>application).replace('</style>',()=>paletteCSS+'</style>');
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
console.log(JSON.stringify({positions:snapshot.rows.length,htmlBytes:Buffer.byteLength(html),workerBytes:Buffer.byteLength(server)}));
