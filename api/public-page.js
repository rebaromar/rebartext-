const {readFileSync}=require("node:fs");
const {join}=require("node:path");
const template=readFileSync(join(process.cwd(),"index.html"),"utf8");
module.exports=async function handler(req,res){
 res.setHeader("Cache-Control","private, no-store, max-age=0");
 res.setHeader("CDN-Cache-Control","no-store");
 res.setHeader("Vercel-CDN-Cache-Control","no-store");
 res.setHeader("Content-Type","text/html; charset=utf-8");
 res.setHeader("Referrer-Policy","no-referrer");
 res.setHeader("X-Robots-Tag","noindex, nofollow");
 const url=new URL(req.url,"https://rebarit.store");
 const id=url.searchParams.get("id");
 if(!id||!new RegExp("^[A-Za-z0-9_$~_-]{1,128}$").test(id))return res.status(200).send(template);
 try{
  const response=await fetch("https://rebarit-secure-api.rebar4qwrna.workers.dev/api/record/"+encodeURIComponent(id),{cache:"no-store",signal:AbortSignal.timeout(6000)});
  const data=await response.json();
  const payload=JSON.stringify({value:{response:{status:response.status,ok:response.ok},data}}).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
  const bootstrap="<script>window.__rebarPublicFetch=Promise.resolve("+payload+");<"+"/script>";
  return res.status(200).send(template.replace("<title>REBAR IT</title>","<title>REBAR IT</title>"+bootstrap));
 }catch(error){
  console.error("Public page upstream unavailable",error.name);
  return res.status(200).send(template);
 }
};
