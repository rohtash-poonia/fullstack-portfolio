import assert from "node:assert/strict";
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function verifyHero({ browser, url, check, artifacts }) {
  await check(
    "mobile hero has no empty robot panel or unnecessary 3D download",
    async () => {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      const page = await context.newPage();
      const requests = [];
      page.on("request", (request) => {
        if (/splinecode|react-spline/.test(request.url()))
          requests.push(request.url());
      });
      try {
        await page.goto(url);
        await page.locator("#home").waitFor({ timeout: 30000 });
        await page.evaluate(() => document.fonts.ready);
        for (const [width, height] of [
          [390, 844],
          [320, 568],
          [768, 1024],
          [844, 390],
        ]) {
          await page.setViewportSize({ width, height });
          await page.waitForTimeout(200);
          const geometry = await page.locator("#home").evaluate((section) => {
            const copy = section
              .querySelector(".hero-copy")
              .getBoundingClientRect();
            const box = section.getBoundingClientRect();
            return {
              height: box.height,
              copyBottom: copy.bottom - box.top,
              width: box.width,
              scrollWidth: section.scrollWidth,
            };
          });
          assert.ok(
            geometry.height <= Math.max(height, geometry.copyBottom + 128) + 2,
            JSON.stringify({ width, height, ...geometry }),
          );
          assert.equal(
            await page
              .getByRole("region", { name: "Interactive robot" })
              .count(),
            0,
          );
          assert.ok(
            geometry.scrollWidth <= width + 1,
            "Hero overflows horizontally",
          );
        }
        assert.deepEqual(
          requests,
          [],
          "Mobile downloaded the disabled 3D scene",
        );
        if (artifacts) {
          await page.setViewportSize({ width: 390, height: 844 });
          await page.screenshot({
            path: path.join(artifacts, "hero-mobile.png"),
          });
        }
      } finally {
        await context.close();
      }
    },
  );

  await check(
    "desktop robot starts downloading during the intro, including refresh",
    async () => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: "no-preference",
      });
      const page = await context.newPage();
      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          const request = page.waitForRequest(
            (request) => request.url().endsWith("/scene.splinecode"),
            { timeout: 30000 },
          );
          if (attempt) await page.reload({ waitUntil: "domcontentloaded" });
          else await page.goto(url, { waitUntil: "domcontentloaded" });
          await page.evaluate(() => {
            window.introGreetings = [];
            const recordGreeting = () => {
              const text = document.querySelector(
                '[class*="z-[9999]"] h1',
              )?.textContent;
              if (text && !window.introGreetings.includes(text))
                window.introGreetings.push(text);
            };
            recordGreeting();
            new MutationObserver(recordGreeting).observe(document.body, {
              childList: true,
              subtree: true,
              characterData: true,
            });
          });
          await request;
          const introVisible = await page
            .locator(".fixed.z-\\[9999\\]")
            .count();
          assert.equal(
            introVisible,
            1,
            "Robot request waited for the intro to finish",
          );
          await page
            .locator("#home")
            .waitFor({ state: "attached", timeout: 30000 });
          assert.equal(
            await page.locator(".fixed.z-\\[9999\\]").count(),
            1,
            "Hero initialization waited for the intro to finish",
          );
          await page.keyboard.press("PageDown");
          await page.mouse.wheel(0, 100);
          assert.equal(
            new URL(page.url()).pathname,
            "/",
            "Intro input navigated away before the hero was revealed",
          );
          await page.locator("#home").waitFor({ timeout: 30000 });
          await page
            .locator(".fixed.z-\\[9999\\]")
            .waitFor({ state: "detached", timeout: 7000 });
          assert.ok(
            (await page.evaluate(() => window.introGreetings)).length >= 3,
            "Intro greeting sequence stopped early",
          );
        }
      } finally {
        await context.close();
      }
    },
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const url = "http://127.0.0.1:4182";
  const artifacts = path.join(os.tmpdir(), "portfolio-hero-fix");
  fs.mkdirSync(artifacts, { recursive: true });
  const server = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      "4182",
      "--strictPort",
    ],
    { windowsHide: true, stdio: "pipe" },
  );
  let output = "",
    browser,
    failures = 0;
  server.stdout.on("data", (data) => (output += data));
  server.stderr.on("data", (data) => (output += data));
  try {
    for (let i = 0; ; i++) {
      try {
        await fetch(url);
        break;
      } catch {
        if (i > 100 || server.exitCode !== null) throw new Error(output);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    browser = await chromium.launch({ headless: true });
    await verifyHero({
      browser,
      url,
      artifacts,
      check: async (name, run) => {
        try {
          await run();
          console.log("PASS", name);
        } catch (error) {
          failures++;
          console.error("FAIL", name, error.message);
        }
      },
    });
  } finally {
    await browser?.close();
    server.kill();
  }
  if (failures) process.exitCode = 1;
}
