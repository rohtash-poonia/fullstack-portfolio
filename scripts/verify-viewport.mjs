import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import { chromium } from 'playwright';
import {pathToFileURL} from 'node:url';
export async function verifyViewport({page,url,check,artifacts}) {
 const visit=async(route,w=1440,h=900)=>{await page.setViewportSize({width:w,height:h});if(page.url().startsWith(url)){await page.evaluate(route=>window.__fullPageGoTo(['/', '/about','/skills','/projects','/experience','/testimonials','/contact'].indexOf(route)),route);await page.waitForURL(url+route);}else await page.goto(url+route);await page.locator('#'+route.slice(1)).waitFor({timeout:30000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);};
 for(const route of ['/about','/experience','/testimonials']) await check(route==='/experience'?route+' fits exactly one viewport across screen sizes':route+' keeps its original layout with reachable content',async()=>{
  const failures=[];
  for(const [w,h] of (process.argv.includes("--boundary-only") ? [[1024,840],[1366,840],[768,740],[390,740]] : process.argv.includes("--landscape-only") ? [[667,375],[640,360]] : [[320,568],[390,600],[390,740],[390,844],[768,740],[768,1024],[1024,768],[1024,840],[1366,768],[1366,840],[1440,900],[844,390],[667,375],[640,360]])) {
   await visit(route,w,h);
   if(route!=='/experience')await page.locator('.section-viewport').last().evaluate(el=>el.scrollTop=0);
   const geometry=()=>page.locator('#'+route.slice(1)).evaluate(el=>{
    const box=el.getBoundingClientRect(),panel=el.closest('.section-viewport');
    const nodes=[...el.querySelectorAll('h2,h3,p,a,button,img')].filter(n=>!n.closest('[aria-hidden="true"]'));
    return {height:box.height,scroll:panel.scrollHeight-panel.clientHeight,bad:nodes.filter(n=>{const r=n.getBoundingClientRect();return r.top<58||r.bottom>(el.id==='experience'?innerHeight-2:box.bottom)||r.left<0||r.right>innerWidth;}).map(n=>({text:n.textContent?.slice(0,30)||n.alt,box:n.getBoundingClientRect().toJSON()}))};
   });
   for(let i=0;i<(route==='/testimonials'?6:1);i++) {
    if(artifacts && i===0 && [320,390,844,1366,1440].includes(w)) await page.screenshot({path:path.join(artifacts,'fit-'+route.slice(1)+'-'+w+'x'+h+'.png')});
    const g=await geometry();if((route!=='/experience'?g.height<h-1:Math.abs(g.height-h)>1||g.scroll>1)||g.bad.length)failures.push({w,h,i,...g});
    if(route!=='/experience'&&g.scroll>1){await page.locator('.section-viewport').last().evaluate(el=>el.scrollTop=el.scrollHeight);const last=await page.locator(route==='/about'?'.about-extra p':'.testimonial-controls').boundingBox();assert.ok(last.y>=58&&last.y+last.height<=h,'Original section content must remain reachable');}
    if(route==='/testimonials'){await page.getByRole('button',{name:'Next testimonial',exact:true}).click();await page.waitForTimeout(700);await page.locator('.section-viewport').last().evaluate(el=>el.scrollTop=0);}
   }
  }
  assert.equal(failures.length,0,JSON.stringify(failures));
 });
 await check('mouse swipes change testimonials and preserve selectable quote text',async()=>{
  await visit('/testimonials');
  await page.evaluate(()=>{window.testPointerTrace=[];for(const type of ['pointerdown','pointerup','pointercancel'])addEventListener(type,e=>window.testPointerTrace.push({type,id:e.pointerId,x:e.clientX,y:e.clientY,target:e.target.tagName,active:e.target.closest('[data-active]')?.dataset.active}),{capture:true});});
  const card=()=>page.locator('[data-active="true"]');
  const drag=async(dx)=>{const r=await card().locator('img').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+dx,r.y+r.height/2,{steps:12});await page.mouse.up();await page.waitForTimeout(700);};
  await drag(-120);assert.match(await card().locator('h3').innerText(),/Soumya/,JSON.stringify(await page.evaluate(()=>window.testPointerTrace)));
  await drag(120);assert.match(await card().locator('h3').innerText(),/Astha/);
  // Vertical and cancelled mouse gestures must not advance the deck.
  let r=await card().locator('img').boundingBox();await page.mouse.move(r.x+20,r.y+20);await page.mouse.down();await page.mouse.move(r.x+25,r.y+150,{steps:10});await page.mouse.up();assert.match(await card().locator('h3').innerText(),/Astha/);
  await page.mouse.move(r.x+20,r.y+20);await page.mouse.down();await page.locator('[data-testimonial-deck]').dispatchEvent('pointercancel',{pointerType:'mouse',pointerId:1});await page.mouse.move(r.x-120,r.y+20,{steps:10});await page.mouse.up();assert.match(await card().locator('h3').innerText(),/Astha/);
  const q=await card().locator('p').first().boundingBox();await page.mouse.move(q.x+10,q.y+10);await page.mouse.down();await page.mouse.move(q.x+160,q.y+10,{steps:10});await page.mouse.up();assert.ok(await page.evaluate(()=>getSelection().toString().length>0));assert.match(await card().locator('h3').innerText(),/Astha/);
 });
 await check('Node.js and NestJS share a desktop typewriter line',async()=>{
  await visit('/about');await page.goto(url+'/');await page.locator('#home').waitFor({timeout:30000});
  await page.waitForFunction(()=>[...document.querySelectorAll('#home .grid > span')].some(s=>!s.hasAttribute('aria-hidden')&&s.textContent.includes('Node.js Developer')&&s.textContent.includes('NestJS Developer')),{},{timeout:20000});
  for(const width of [1024,1366,1440,1920]){await page.setViewportSize({width,height:900});const g=await page.locator('#home .grid > span').last().evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight),width:el.clientWidth,scroll:el.scrollWidth}));assert.ok(g.height<=Math.max(g.line,40)+8&&g.scroll<=g.width+1,JSON.stringify({width,...g}));}
 });
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){let failures=0;const artifacts=path.join(os.tmpdir(),'portfolio-viewport');fs.mkdirSync(artifacts,{recursive:true});const url='http://127.0.0.1:4177';const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4177','--strictPort'],{windowsHide:true,stdio:'ignore'});for(let i=0;;i++){try{await fetch(url);break;}catch{if(i>100)throw new Error('Preview unavailable');await new Promise(r=>setTimeout(r,100));}}const b=await chromium.launch({headless:true});try{const page=await b.newPage({reducedMotion:'reduce'});await verifyViewport({page,url,artifacts,check:async(name,fn)=>{if((process.argv.includes("--landscape-only")||process.argv.includes("--boundary-only"))&&!name.includes("viewport")&&!name.startsWith("About"))return;if(process.argv.includes("--mouse-only")&&!name.startsWith("mouse"))return;try{await fn();console.log('PASS',name);}catch(e){failures++;console.error('FAIL',name,e.message);}}});}finally{await b.close();server.kill();}if(failures)process.exitCode=1;}
