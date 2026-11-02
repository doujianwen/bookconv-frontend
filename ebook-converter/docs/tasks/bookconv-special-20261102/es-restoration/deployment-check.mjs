import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ProxyAgent,setGlobalDispatcher } from 'undici';
setGlobalDispatcher(new ProxyAgent('http://127.0.0.1:12450'));
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const root=`https://api.github.com/repos/doujianwen/bookconv-frontend`;
const output='E:/一人公司/电子书格式转换站/ebook-converter/docs/tasks/bookconv-special-20261102/es-restoration';
const data={sha,checkedAt:new Date().toISOString()};
for (const [name,url] of [['status',`${root}/commits/${sha}/status`],['checks',`${root}/commits/${sha}/check-runs`],['runs',`${root}/actions/runs?head_sha=${sha}`]]) {
 try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});data[name]={http:r.status,data:await r.json()};}catch(e){data[name]={error:e.message};}
}
fs.writeFileSync(`${output}/deployment.json`,JSON.stringify(data,null,2));
console.log(JSON.stringify({sha,status:data.status?.data?.state,statuses:data.status?.data?.statuses?.map(s=>({state:s.state,url:s.target_url,description:s.description})),checks:data.checks?.data?.check_runs?.map(c=>({name:c.name,status:c.status,conclusion:c.conclusion,url:c.html_url})),runs:data.runs?.data?.workflow_runs?.map(r=>({name:r.name,status:r.status,conclusion:r.conclusion,url:r.html_url}))},null,2));
