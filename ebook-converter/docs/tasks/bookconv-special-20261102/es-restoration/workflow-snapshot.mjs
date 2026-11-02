import fs from 'node:fs';
import { ProxyAgent,setGlobalDispatcher } from 'undici';
setGlobalDispatcher(new ProxyAgent('http://127.0.0.1:12450'));
const out='docs/tasks/bookconv-special-20261102/es-restoration';
const runs={CI:41404861704,QA:41404861528,Deploy:41404862407};
const results=[];
for (const [name,id] of Object.entries(runs)) {
 const url=`https://github.com/doujianwen/bookconv-frontend/actions/runs/${id}?check=${Date.now()}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 const html=await response.text();fs.writeFileSync(`${out}/github-${name}.html`,html);
 const text=html.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 const at=text.lastIndexOf('Status ');results.push({name,url,http:response.status,statusText:at>=0?text.slice(at,at+90):'not parsed'});
}
fs.writeFileSync(`${out}/workflow-status.json`,JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
console.log(JSON.stringify(results));
