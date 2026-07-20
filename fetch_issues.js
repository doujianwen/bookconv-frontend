const { execFileSync } = require('child_process');
const issues = [];
for(let i=31;i<=44;i++){
  const key = 'EBO-'+i;
  try{
    const r = execFileSync('multica',['issue','get',key,'--output','json'],{encoding:'utf8',windowsHide:true});
    const j = JSON.parse(r);
    issues.push({id:key,title:j.title,desc:(j.description||'').substring(0,500),priority:j.priority});
  }catch(e){
    issues.push({id:key,error:e.message.split('\n')[0]});
  }
}
issues.forEach(i=>console.log(JSON.stringify(i)));
