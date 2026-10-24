import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

export async function verifyUpdates({ page, url, check, artifacts }) {
  const visit = async (route, width=1440, height=900) => {
    await page.setViewportSize({width,height});
    await page.goto(url+route);
    await page.locator('.section-viewport').waitFor({timeout:30000});
    await page.locator(route==='/' ? '#home' : route.replace('/','#')).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(750);
  };
  const active = () => page.locator('.section-viewport').last();
  const bottom = () => active().evaluate(el=>{el.scrollTop=el.scrollHeight;});
  const burst = async (count, delta, interval=60) => {
    for(let i=0;i<count;i++){await page.mouse.wheel(0,delta);await page.waitForTimeout(interval);}
  };
  await check('one continuous wheel gesture cannot skip past About', async()=>{
    await visit('/'); await bottom(); await page.mouse.move(400,400);
    // Schedule the continuous input in the page so protocol round trips cannot
    // turn this single gesture into several gestures separated by idle gaps.
    await page.evaluate(async()=>{
      for(let i=0;i<22;i++){
        document.querySelector('main').dispatchEvent(new WheelEvent('wheel',{deltaY:60,bubbles:true,cancelable:true}));
        await new Promise(resolve=>setTimeout(resolve,60));
      }
    });
    assert.equal(new URL(page.url()).pathname,'/about','momentum skipped the section');
  });
  await check('momentum cannot scroll the new About panel during its entrance',async()=>{
    await visit('/',390,600);await bottom();await page.mouse.move(180,300);
    await page.mouse.wheel(0,60); await page.waitForURL(url+'/about');
    await burst(10,24,40); await page.waitForTimeout(750);
    assert.equal(new URL(page.url()).pathname,'/about');
    assert.equal(await active().evaluate(el=>el.scrollTop),0,'residual wheel input hid incoming content');
  });
  await check('menu navigation from Contact reveals the top of About',async()=>{
    await visit('/contact',390,600);
    await page.getByRole('button',{name:/Open (menu|pages)/i}).click();
    await page.getByRole('dialog').getByRole('link',{name:'About',exact:true}).click();
    await page.waitForURL(url+'/about');await page.waitForTimeout(1000);
    assert.equal(await active().evaluate(el=>el.scrollTop),0,'explicit navigation incorrectly entered at the bottom');
    const heading=await page.locator('#about h2').boundingBox();
    assert.ok(heading.y>=60 && heading.y+heading.height<=600,JSON.stringify(heading));
  });
  await check('Contact and its footer do not move from the previous gesture tail',async()=>{
    await visit('/testimonials',390,600);await bottom();await page.mouse.move(180,300);
    await page.mouse.wheel(0,60);await page.waitForURL(url+'/contact');
    await burst(10,24,40);await page.waitForTimeout(750);
    assert.equal(await active().evaluate(el=>el.scrollTop),0,'contact was scrolled before the next gesture');
    const card=await page.locator('.contact-card').boundingBox();
    const footer=await page.locator('footer').boundingBox();
    assert.ok(footer.y>=card.y+card.height,'footer overlaps the contact form');
    assert.ok((await page.locator('#contact-title').boundingBox()).y>=60,'contact title is hidden');
    await page.screenshot({path:path.join(artifacts,'contact-arrival.png')});
  });
  await check('desktop education fits and original testimonial controls remain reachable',async()=>{
    await visit('/experience',1366,768);
    const bottomOfCard=await page.locator('#experience h3').last().evaluate(el=>el.parentElement.getBoundingClientRect().bottom);
    assert.ok(bottomOfCard<=768,`last education card ends at ${bottomOfCard}`);
    await page.screenshot({path:path.join(artifacts,'education-1366.png')});
    await visit('/testimonials',1366,768);
    await bottom();
    const button=await page.getByRole('button',{name:'Next testimonial',exact:true}).boundingBox();
    assert.ok(button.y>=58 && button.y+button.height<=768,`testimonial controls end at ${button.y+button.height}`);
    await page.screenshot({path:path.join(artifacts,'testimonials-1366.png')});
  });
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  let failures=0;
  const artifacts=path.join(os.tmpdir(),'portfolio-oct23');fs.mkdirSync(artifacts,{recursive:true});
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    page.on('pageerror',error=>{failures++;console.error('RUNTIME',error.message);});
    await verifyUpdates({page,url:process.env.PORTFOLIO_TEST_URL||'http://127.0.0.1:4176',artifacts,
      check:async(name,run)=>{if(process.argv.includes('--scroll-only')&&name.startsWith('desktop education'))return;try{await run();console.log('PASS',name);}catch(error){failures++;console.error('FAIL',name+':',error.message);}}});
  }finally{await browser.close();}
  if(failures)process.exitCode=1;
}
