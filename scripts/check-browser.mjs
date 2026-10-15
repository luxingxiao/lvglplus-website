import {chromium} from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.SITE_URL??'http://127.0.0.1:4321/lvglplus-website/';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
await mkdir('artifacts',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('.load-demo').click();
 await page.waitForFunction(()=>document.querySelector('[data-demo]')?.dataset.ready==='true',{timeout:20000});
 await page.locator('#demo-speed').fill('120');assert.equal(await page.locator('#demo-speed-output').textContent(),'120');
 await page.locator('.demo-offline').click();assert.equal(await page.locator('.demo-offline').getAttribute('aria-pressed'),'true');await page.locator('.demo-offline').click();
 assert.equal(await page.locator('canvas').isVisible(),true);
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
 assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
 for(const width of [375,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow at ${width}`);}
 await page.setViewportSize({width:375,height:850});await page.goto(base);await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
 await page.locator('.mobile-menu').click();assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'),'false');
 await page.goto(base+'docs/architecture/');await page.locator('.language-switch').click();assert.ok(page.url().endsWith('/en/docs/architecture/'));
 await page.goto(base+'en/');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.load-demo').click();await page.waitForFunction(()=>document.querySelector('[data-demo]')?.dataset.ready==='true');assert.equal(await page.locator('#demo-mode').inputValue(),'manual');
 assert.deepEqual(errors,[]);console.log('Browser checks passed: real WASM, controls, a11y, four widths, mobile keyboard, bilingual docs, reduced motion.');
}finally{await browser.close();}
