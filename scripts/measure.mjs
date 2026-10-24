import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4180','--strictPort'], {windowsHide:true,stdio:'ignore'});
const url = 'http://127.0.0.1:4180';
let browser;
try {
 for(let i=0;;i++){try{await fetch(url);break}catch(error){if(i>100)throw error;await new Promise(resolve=>setTimeout(resolve,100))}}
 browser = await chromium.launch({headless:true});
 const results = [];
 for(const config of [
   {name:'desktop-reduced-motion',viewport:{width:1440,height:900},reducedMotion:'reduce'},
   {name:'mobile',viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'},
 ]) {
  const {name,...options} = config;
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await page.addInitScript(()=>{
   window.portfolioMetrics = {lcp:0,cls:0,longTasks:0};
   new PerformanceObserver(list=>{for(const entry of list.getEntries())window.portfolioMetrics.lcp=entry.startTime}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.portfolioMetrics.cls+=entry.value}).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>{for(const entry of list.getEntries())window.portfolioMetrics.longTasks+=entry.duration}).observe({type:'longtask',buffered:true});
  });
  const requests=[];
  page.on('request',request=>requests.push(request.url()));
  await page.goto(url,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:(process.env.TEMP||'/tmp')+'/portfolio-final-'+name+'.png'});
  const metrics = await page.evaluate(()=>({...window.portfolioMetrics,domContentLoaded:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,resourceTransferBytes:performance.getEntriesByType('resource').reduce((total,entry)=>total+entry.transferSize,0)}));
  results.push({name,...metrics,resourceRequests:requests.length,heavyRequests:requests.filter(value=>/splinecode|react-spline|song.*mp3/.test(value))});
  await context.close();
 }
 const links = [];
 const request = await browser.newContext();
 for(const target of ['https://github.com/rohtash-poonia/My_Portfolio','https://github.com/rohtash-poonia/Task-Master','https://task-master-one-delta.vercel.app/','https://portfolio-omega-seven-l7y6bvxpew.vercel.app/']){
  try{const response=await request.request.get(target,{timeout:12000});links.push({url:target,status:response.status()})}catch(error){links.push({url:target,error:error.message.split('\n')[0]})}
 }
 const html = await readFile('dist/index.html', 'utf8');
 const entry = /<script[^>]*src="\/assets\/([^"]+\.js)"/.exec(html)?.[1];
 if (!entry) throw new Error('Production entry script not found');
 const bytes = await readFile('dist/assets/'+entry);
 const report = {date:'2026-10-22',method:'Unthrottled local Chromium against production Vite preview; no baseline LCP/CLS or field INP available. Cross-origin transfer sizes may be redacted.',results,mainBundle:{file:entry,bytes:bytes.length,gzipBytes:gzipSync(bytes).length},links};
 await writeFile('docs/performance-results.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();server.kill()}
