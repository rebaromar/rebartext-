// Add the route below inside fetch(), after assertEnvironment and before other routes:
// if(request.method==='POST'&&path==='/api/admin/records/check-duplicates'){
//  if(!(await isAdminRequest(request,env)))return json({error:'Unauthorized'},401,cors);
//  return handleAdminDuplicateCheck(request,env,cors);
// }
// Requires the existing loadRecord, readJson, RECORD_PREFIX and json helpers.
function duplicateEmailKey(v){return String(v||'').trim().toLowerCase()}
function duplicateLinkKey(v){const text=String(v||'').trim();try{return new URL(text).toString()}catch{return text}}
async function handleAdminDuplicateCheck(request,env,cors){
 const body=await readJson(request);
 if(typeof body.email!=='string'||typeof body.targetLink!=='string'||body.email.length>512||body.targetLink.length>8192||typeof body.cursor!=='string'||body.cursor.length>4096)return json({error:'Invalid search'},400,cors);
 const email=duplicateEmailKey(body.email),link=duplicateLinkKey(body.targetLink);
 if(!email&&!link)return json({ok:true,emailCount:0,linkCount:0,unreadable:0,done:true,cursor:''},200,cors);
 const page=await env.REBAR_KV.list({prefix:RECORD_PREFIX,limit:40,...(body.cursor?{cursor:body.cursor}:{})});
 let emailCount=0,linkCount=0,unreadable=0;
 for(const item of page.keys){try{const record=await loadRecord(env,item.name.slice(RECORD_PREFIX.length));if(!record)continue;if(email&&duplicateEmailKey(record.email)===email)emailCount++;if(link&&duplicateLinkKey(record.targetLink)===link)linkCount++}catch{unreadable++}}
 return json({ok:true,emailCount,linkCount,unreadable,done:page.list_complete===true,cursor:page.list_complete?'':page.cursor},200,cors);
}
