import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const paths=['/','/about','/skills','/projects','/experience','/testimonials','/contact'];
export async function verifyRestoration({page,url,check}) {
 const go=async(index,width=1440,height=900)=>{
  await page.setViewportSize({width,height});
  if(!page.url().startsWith(url)){await page.goto(url+paths[index]);await page.locator('#'+(index?paths[index].slice(1):'home')).waitFor({timeout:30000});}
  else {await page.evaluate(index=>window.__fullPageGoTo(index),index);await page.waitForURL(url+paths[index]);}
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
 };
 const size=selector=>page.locator(selector).first().evaluate(el=>({width:el.getBoundingClientRect().width,font:parseFloat(getComputedStyle(el).fontSize),padding:parseFloat(getComputedStyle(el).paddingTop)}));
 await check('original Education proportions on desktop',async()=>{
  await go(4);assert.ok((await size('.education-timeline')).width>=1000);assert.ok((await size('.education-card h3')).font>=20);assert.ok((await size('.education-card')).padding>=24);assert.ok((await size('.education-heading')).font>=36);
 });
 await check('original testimonial proportions on desktop',async()=>{
  await go(5);assert.equal(Math.round((await size('[data-active="true"]')).width),450);assert.equal((await size('.testimonial-quote')).font,20);assert.equal(Math.round((await size('[data-active="true"] img')).width),96);
 });
 await check('readable original-like proportions on tall phones',async()=>{
  await go(1,390,844);assert.ok((await size('.about-portrait')).width>=138);assert.ok((await size('#about h2')).font>=36);assert.ok((await size('.about-stats > div > div:last-child')).font>=14);
  await go(4,390,844);assert.ok((await size('.education-card h3')).font>=18);assert.ok((await size('.education-card')).padding>=20);
  await go(5,390,844);assert.ok((await size('.testimonial-quote')).font>=16);assert.ok((await size('[data-active="true"] img')).width>=72);
 });
 await check('one wheel or key gesture leaves each viewport section without internal scrolling',async()=>{
  for(const [width,height] of [[1440,900],[390,600]])for(const index of (width>=768?[1,4]:[4]))for(const dir of [-1,1])for(const input of ['wheel','key']){
   await go(index,width,height);
   const panel=page.locator('[data-section-index="'+index+'"]');assert.equal(await panel.evaluate(el=>getComputedStyle(el).overflowY),index===1?'auto':'hidden');assert.equal(await panel.evaluate(el=>el.scrollTop),0);
   if(input==='wheel'){await page.mouse.move(width/2,height/2);await page.mouse.wheel(0,dir*100);}else await page.keyboard.press(dir>0?'PageDown':'PageUp');
   await page.waitForURL(url+paths[index+dir],{timeout:3000});
  }
 });
 await check('one vertical touch swipe leaves each viewport section in both directions',async()=>{
  const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const phone=await context.newPage();const cdp=await context.newCDPSession(phone);
  try{await phone.goto(url+'/about');await phone.locator('#about').waitFor({timeout:30000});for(const index of [4])for(const dir of [-1,1]){
   await phone.evaluate(i=>window.__fullPageGoTo(i),index);await phone.waitForURL(url+paths[index]);await phone.waitForTimeout(800);
   const from=dir>0?650:250,to=dir>0?250:650;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:30,y:from}]});
   for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:30,y:from+(to-from)*i/8}]});await phone.waitForTimeout(20);}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.waitForURL(url+paths[index+dir],{timeout:3000});
  }}finally{await cdp.detach();await context.close();}
 });
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){let failures=0;const url='http://127.0.0.1:4180';const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4180','--strictPort'],{windowsHide:true,stdio:'ignore'});let browser;try{for(let i=0;;i++){try{await fetch(url);break;}catch{if(i>100)throw new Error('Preview unavailable');await new Promise(r=>setTimeout(r,100));}}browser=await chromium.launch({headless:true});const page=await browser.newPage({reducedMotion:'reduce'});await verifyRestoration({page,url,check:async(name,run)=>{if(process.argv.includes('--scale-only')&&name.startsWith('one '))return;try{await run();console.log('PASS',name);}catch(e){failures++;console.error('FAIL',name,e.message);}}});}finally{await browser?.close();server.kill();}if(failures)process.exitCode=1;}
