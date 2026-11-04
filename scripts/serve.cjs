const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const port=Number(process.env.PORT||5500);
http.createServer((req,res)=>{
 let file;
 try{file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));}catch{res.writeHead(400);res.end('Bad request');return;}
 if(!file.startsWith(root+path.sep)||!['index.html','style.css','app.js'].includes(path.relative(root,file))&&!file.startsWith(path.join(root,'assets')+path.sep)){res.writeHead(404);res.end('Not found');return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.zip':'application/zip'})[path.extname(file)]||'application/octet-stream');res.end(data);});
}).listen(port,'127.0.0.1',()=>console.log(`Card studio: http://localhost:${port}`));
