import http from 'node:http';
import worker from '../worker/index.js';
const port=8765;
http.createServer(async(request,response)=>{
  try{
    const result=await worker.fetch(new Request(`http://127.0.0.1:${port}${request.url}`,{method:request.method}),{},{});
    response.writeHead(result.status,Object.fromEntries(result.headers));
    response.end(Buffer.from(await result.arrayBuffer()));
  }catch{
    response.writeHead(500,{'content-type':'text/plain; charset=utf-8'});
    response.end('Не удалось обработать запрос.');
  }
}).listen(port,'127.0.0.1',()=>console.log(`Каталог: http://127.0.0.1:${port}`));
