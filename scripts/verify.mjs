import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { verifyUpdates } from './verify-updates.mjs';
import { verifyViewport } from './verify-viewport.mjs';
import { verifyRestoration } from './verify-restoration.mjs';
import { verifyHero } from './verify-hero.mjs';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], {
  windowsHide: true, stdio: 'pipe', env: { ...process.env, VITE_EMAILJS_SERVICE_ID: 'service_portfolio_test', VITE_EMAILJS_TEMPLATE_ID: 'template_portfolio_test', VITE_EMAILJS_PUBLIC_KEY: 'portfolio_test_key' },
});
let output = '', failures = 0, browser;
server.stdout.on('data', data => { output += data; });
server.stderr.on('data', data => { output += data; });
const url = 'http://127.0.0.1:4175';
const artifacts = path.join(os.tmpdir(), 'portfolio-oct23');
fs.mkdirSync(artifacts, { recursive: true });
const selectedCheck = process.argv.find(arg => arg.startsWith("--check="))?.slice(8);
const check = async (name, run) => {
  if (selectedCheck && !selectedCheck.split("|").some(part => name.includes(part))) return;
  try { await run(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.stack}`); }
};
const ids = ['home', 'about', 'skills', 'projects', 'experience', 'testimonials', 'contact'];
const routeFor = id => id === 'home' ? '/' : `/${id}`;
const settle = page => page.waitForTimeout(750);
const panel = page => page.locator(`.section-viewport[data-section-index="${ids.indexOf(new URL(page.url()).pathname.slice(1) || 'home')}"]`);
const visit = async (page, id) => {
  await page.goto(url + routeFor(id));
  await page.locator(`#${id}`).waitFor({ timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
};
const go = async (page, index) => {
  await page.evaluate(index => window.__fullPageGoTo(index), index);
  await page.waitForURL(url + routeFor(ids[index]));
  await page.locator(`#${ids[index]}`).waitFor();
  await settle(page);
};
const edge = (page, direction) => panel(page).evaluate((el, dir) => { el.scrollTop = dir > 0 ? el.scrollHeight : 0; }, direction);
const wheel = async (page, delta) => { await page.mouse.move(400, 400); await page.mouse.wheel(0, delta); };
const swipe = async (page, from, to) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from[0], y: from[1] }] });
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from[0] + (to[0] - from[0]) * i / 12, y: from[1] + (to[1] - from[1]) * i / 12 }] });
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(100);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
};

try {
  for (let i = 0; ; i++) {
    try { await fetch(url); break; }
    catch { if (i > 100 || server.exitCode !== null) throw new Error(output); await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    const originalArc = CanvasRenderingContext2D.prototype.arc;
    const originalFill = CanvasRenderingContext2D.prototype.fillRect;
    window.starFrames = [];
    CanvasRenderingContext2D.prototype.arc = function(...args) {
      (this.testArcs ??= []).push(args.slice(0, 3));
      return originalArc.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.fillRect = function(...args) {
      if (this.testArcs?.length >= 130) {
        window.starFrames.push(this.testArcs);
        if (window.starFrames.length > 10) window.starFrames.shift();
      }
      this.testArcs = [];
      return originalFill.apply(this, args);
    };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('BROWSER', error.message); });
  await visit(page, 'home');

  await check('original hero and full-screen composition', async () => {
    assert.equal(await page.locator('#home').count(), 1);
    assert.equal(await page.locator('#home img[src*="astra"], #home img[src*="Astra"]').count(), 0);
    assert.equal(await page.locator('[aria-label="Interactive robot"]').count(), 1);
    assert.equal(await page.locator('.section-viewport').count(), 1);
    assert.equal(Math.round((await panel(page).boundingBox()).height), 900);
    assert.equal(await page.evaluate(() => scrollY), 0);
    await page.screenshot({ path: path.join(artifacts, 'desktop-home.png') });
  });
  await check('original stars respond to both cursor directions and cursor follows', async () => {
    const velocity = async x => {
      await page.mouse.move(x, 450);
      await page.waitForTimeout(300);
      return page.evaluate(() => {
        const frames = window.starFrames;
        if (frames.length < 2) throw new Error('No animated star frames');
        const a = frames.at(-2).slice(80), b = frames.at(-1).slice(80);
        return { count: frames.at(-1).length, dx: b.reduce((sum, p, i) => {
          let d = p[0] - a[i][0]; if (d > innerWidth / 2) d -= innerWidth; if (d < -innerWidth / 2) d += innerWidth; return sum + d;
        }, 0) / b.length };
      });
    };
    const right = await velocity(1300), left = await velocity(100);
    assert.equal(right.count, 130);
    assert.ok(right.dx > 1 && left.dx < -1, JSON.stringify({ right, left }));
    await page.mouse.move(700, 420);
    await page.waitForFunction(() => {
      const cursor = document.querySelector('.mix-blend-difference.fixed');
      return cursor && Math.abs(new DOMMatrix(getComputedStyle(cursor).transform).m41 - 700) < 2;
    }, {}, { timeout: 5000 });
  });
  await check('small wheel deltas advance and reversal interrupts a page transition', async () => {
    await edge(page, 1);
    for (let i = 0; i < 4; i++) await wheel(page, 12);
    await page.waitForURL(url + '/about');
    await wheel(page, -60);
    await page.waitForURL(url + '/');
    await settle(page);
    assert.equal(await page.locator('.section-viewport').count(), 1);
  });
  await check('every section is reachable down and back up', async () => {
    for (const index of [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0]) {
      const current = ids.indexOf(new URL(page.url()).pathname.slice(1) || 'home');
      const dir = Math.sign(index - current);
      for (let attempt = 0; attempt < 4 && new URL(page.url()).pathname !== routeFor(ids[index]); attempt++) {
        await edge(page, dir); await wheel(page, dir * 100); await settle(page);
      }
      assert.equal(new URL(page.url()).pathname, routeFor(ids[index]));
      assert.equal(Math.round((await panel(page).boundingBox()).height), 900);
    }
  });
  await check('backward entry into the scrollable About section can reverse', async () => {
    await page.setViewportSize({ width: 390, height: 600 });
    await go(page, 2);
    await page.mouse.move(180, 300);
    await page.mouse.wheel(0, -100);
    await page.waitForURL(url + '/about');
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-section-index="1"]');
      return el && Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) <= 1;
    });
    await page.mouse.wheel(0, 100);
    await page.waitForURL(url + '/skills');
    await settle(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });
  await check('three projects preserve fades, immediate reversal, dots and boundaries', async () => {
    await go(page, 3);
    assert.equal(await page.locator('#projects h3').innerText(), 'IcyTales');
    assert.equal(await page.getByRole('link', { name: 'Live Demo', exact: true }).getAttribute('href'), 'https://icylates.vercel.app/');
    await wheel(page, 100);
    await page.waitForTimeout(80);
    await wheel(page, -100);
    await page.waitForTimeout(400);
    assert.equal(await page.locator('#projects h3').innerText(), 'IcyTales');
    assert.equal(new URL(page.url()).pathname, '/projects');
    await settle(page); await wheel(page, 100); await page.waitForTimeout(300);
    assert.equal(await page.locator('#projects h3').innerText(), 'Task Master');
    await page.waitForTimeout(450); await wheel(page, 100); await page.waitForTimeout(300);
    assert.equal(await page.locator('#projects h3').innerText(), 'Portfolio Website');
    await page.getByRole('button', { name: 'Show IcyTales', exact: true }).click();
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#projects h3').innerText(), 'IcyTales');
    await wheel(page, -100); await page.waitForURL(url + '/skills'); await settle(page);
  });
  await check('skills marquee moves continuously and cards retain their stacked swiper', async () => {
    const track = page.locator('[data-skills-track]');
    const before = await track.evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(350);
    assert.notEqual(await track.evaluate(el => getComputedStyle(el).transform), before);
    assert.equal(await track.locator(':scope > div').count(), 32);
    await page.screenshot({ path: path.join(artifacts, 'desktop-skills.png') });
    await go(page, 5);
    assert.equal(await page.locator('[data-testimonial-deck] > div').count(), 6);
    await page.getByRole('button', { name: 'Next testimonial', exact: true }).click();
    await settle(page);
    assert.match(await page.locator('[data-active="true"] h3').innerText(), /Soumya/);
    await page.getByRole('button', { name: 'Previous testimonial', exact: true }).click();
    await settle(page);
    assert.match(await page.locator('[data-active="true"] h3').innerText(), /Astha/);
    await page.screenshot({ path: path.join(artifacts, 'desktop-testimonials.png') });
  });
  await check('original menu animation, focus, route links and browser history', async () => {
    await page.getByRole('button', { name: 'Open Pages', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await page.getByRole('button', { name: 'Open Pages', exact: true }).evaluate(el => el === document.activeElement), true);
    await page.getByRole('button', { name: 'Open Pages', exact: true }).click();
    await dialog.getByRole('link', { name: 'Contact', exact: true }).click();
    await page.waitForURL(url + '/contact'); await settle(page);
    await page.goBack(); await page.waitForURL(url + '/testimonials'); await settle(page);
  });
  await check('short landscape menu keeps the first and last links reachable', async () => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.getByRole('button', { name: 'Open Pages', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await settle(page);
    await dialog.evaluate(el => { el.scrollTop = 0; });
    assert.ok((await dialog.getByRole('link', { name: 'Home', exact: true }).boundingBox()).y >= 0);
    await dialog.getByRole('link', { name: 'Contact', exact: true }).scrollIntoViewIfNeeded();
    const last = await dialog.getByRole('link', { name: 'Contact', exact: true }).boundingBox();
    assert.ok(last.y >= 0 && last.y + last.height <= 391);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    await page.setViewportSize({ width: 1440, height: 900 });
  });
  await check('contact layout, footer, editable keys and delivery states', async () => {
    await go(page, 6);
    assert.equal(await page.locator('#contact .astra-image').count(), 1);
    assert.equal(await page.locator('footer').count(), 1);
    await page.getByLabel('Full Name', { exact: true }).fill('Portfolio test');
    await page.keyboard.press('ArrowUp');
    assert.equal(new URL(page.url()).pathname, '/contact');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Service', { exact: true }).selectOption('Web Development');
    await page.getByLabel('Message', { exact: true }).fill('Intercepted local test, never delivered.');
    let sends = 0;
    await page.route('https://api.emailjs.com/**', async route => {
      sends++; await new Promise(resolve => setTimeout(resolve, 150));
      await route.fulfill({ status: 200, body: 'OK' });
    });
    await page.locator('form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
    await page.getByRole('status').filter({ hasText: 'Message sent!' }).waitFor();
    assert.equal(sends, 1);
    await page.unroute('https://api.emailjs.com/**');
    await page.route('https://api.emailjs.com/**', route => route.fulfill({ status: 500, body: 'Test failure' }));
    await page.getByLabel('Full Name', { exact: true }).fill('Portfolio test');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Service', { exact: true }).selectOption('Web Development');
    await page.getByLabel('Message', { exact: true }).fill('Intercepted failure.');
    await page.getByRole('button', { name: 'Send Message', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'could not be sent' }).waitFor();
    await page.screenshot({ path: path.join(artifacts, 'desktop-contact.png') });
  });
  await check('responsive sections keep content reachable without horizontal overflow', async () => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 600 : 900 });
      for (let i = 0; i < ids.length; i++) {
        await go(page, i);
        const geometry = await panel(page).evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth, height: el.clientHeight, scrollHeight: el.scrollHeight }));
        assert.ok(geometry.scrollWidth <= geometry.width + 1, `${width}/${ids[i]} horizontal overflow ${JSON.stringify(geometry)}`);
        if (width === 390) { await edge(page, -1); await page.screenshot({ path: path.join(artifacts, `mobile-${ids[i]}.png`) }); }
        await edge(page, 1);
        assert.ok(await panel(page).evaluate(el => Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) <= 1), `${ids[i]} bottom unreachable`);

      }
    }
  });
  await check('mobile swipes navigate projects once, reverse, and leave at boundaries', async () => {
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const phone = await mobile.newPage();
    phone.on('pageerror', error => errors.push(error.message));
    await visit(phone, 'projects');
    await swipe(phone, [190, 650], [190, 250]); await settle(phone);
    assert.equal(new URL(phone.url()).pathname, '/projects');
    assert.equal(await phone.locator('#projects h3').innerText(), 'Task Master');
    await swipe(phone, [190, 250], [190, 650]); await settle(phone);
    assert.equal(await phone.locator('#projects h3').innerText(), 'IcyTales');
    await swipe(phone, [190, 250], [190, 650]); await phone.waitForURL(url + '/skills'); await settle(phone);
    await swipe(phone, [190, 650], [190, 250]); await phone.waitForURL(url + '/projects'); await settle(phone);
    await swipe(phone, [190, 650], [190, 250]); await settle(phone);
    await swipe(phone, [190, 650], [190, 250]); await settle(phone);
    assert.equal(await phone.locator('#projects h3').innerText(), 'Portfolio Website');
    await swipe(phone, [190, 650], [190, 250]); await phone.waitForURL(url + '/experience'); await settle(phone);
    await go(phone, 5);
    await swipe(phone, [330, 400], [60, 400]); await settle(phone);
    assert.match(await phone.locator('[data-active="true"] h3').innerText(), /Soumya/);
    assert.equal(new URL(phone.url()).pathname, '/testimonials');
    // A native scroll inside tall Contact must not also change sections.
    await phone.setViewportSize({ width: 390, height: 600 });
    await go(phone, 6);
    await edge(phone, -1);
    // Wait for the transition and browser hit-testing before the native pan.
    await phone.waitForFunction(() => {
      const panel = document.querySelector('[data-section-index="6"]');
      return panel && document.querySelectorAll('.section-viewport').length === 1 &&
        Math.abs(panel.getBoundingClientRect().top) < 1 && panel.scrollHeight > panel.clientHeight &&
        document.elementFromPoint(10, 500)?.closest('.section-viewport') === panel;
    });
    await swipe(phone, [10, 500], [10, 180]); await settle(phone);
    assert.equal(new URL(phone.url()).pathname, '/contact');
    await phone.waitForFunction(() => document.querySelector('[data-section-index="6"]').scrollTop > 0);
    await mobile.close();
  });
  await check('resume and runtime errors', async () => {
    assert.equal((await page.request.get(url + '/resume.pdf')).status(), 200);
    assert.deepEqual(errors, []);
  });
  await verifyUpdates({ page, url, check, artifacts });
  await verifyViewport({ page, url, check, artifacts });
  await verifyRestoration({ page, url, check });
  await verifyHero({ browser, url, check, artifacts });
  assert.deepEqual(errors, []);
  await context.close();
} finally {
  await browser?.close();
  server.kill();
}
console.log(`Screenshots: ${artifacts}`);
if (failures) process.exitCode = 1;
