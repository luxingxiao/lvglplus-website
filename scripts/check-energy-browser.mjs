import {chromium} from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.SITE_URL??'http://127.0.0.1:4321/lvglplus-website/';
const route=base+'examples/energy-console/';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
await mkdir('artifacts',{recursive:true});
const ready=page=>page.waitForFunction(()=>document.querySelector('[data-energy]')?.dataset.ready==='true',null,{timeout:30000});
const model=page=>page.locator('[data-energy]').evaluate(el=>({...el.dataset}));
const command=(page,name)=>page.locator('.energy-command[data-command="'+name+'"]');
try{
 const context=await browser.newContext({viewport:{width:1440,height:1100}});
 const page=await context.newPage(),errors=[],downloads=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',req=>{if(/demo\/energy\/.*\.(?:wasm|lvp)$/.test(req.url()))downloads.push(req.url());});
 await page.goto(base);assert.equal(await page.locator('.energy-teaser a').first().getAttribute('href'),new URL(route).pathname);
 assert.equal(downloads.length,0,'Home does not download the energy runtime');
 await page.locator('.energy-teaser').screenshot({path:'artifacts/energy-home.png'});
 await page.goto(route);assert.equal(downloads.length,0,'Preview waits for explicit launch');
 assert(await page.locator('.energy-poster').isVisible());
 await page.locator('.energy-launch').click();await ready(page);
 assert(downloads.some(u=>u.endsWith('.wasm'))&&downloads.some(u=>u.endsWith('.lvp')));
 assert(await page.locator('.energy-canvas').isVisible());
 await command(page,'pause').click();assert.equal((await model(page)).running,'false');
 const clock=(await model(page)).clock;await page.waitForTimeout(350);assert.equal((await model(page)).clock,clock,'C clock freezes while paused');
 const frame=await page.locator('canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(200);assert.equal(await page.locator('canvas').evaluate(c=>c.toDataURL()),frame,'Paused framebuffer stays stable');
 await command(page,'stress').click();assert.equal((await model(page)).stress,'true');assert.equal(await page.locator('[data-reading="temperature"]').textContent(),'86 °C');
 await command(page,'quality').click();assert.equal((await model(page)).economy,'true');
 await command(page,'speed').click();assert.equal((await model(page)).rate,'2');
 await command(page,'reverse').click();assert.equal((await model(page)).direction,'-1');
 await page.locator('canvas').focus();await page.keyboard.press('ArrowDown');assert.equal((await model(page)).economy,'false');
 await page.keyboard.press('Escape');assert.equal((await model(page)).running,'true');assert.equal((await model(page)).stress,'false');
 // Actual LVGL pointer path, distinct from HTML command buttons.
 await page.locator('canvas').scrollIntoViewIfNeeded();const box=await page.locator('canvas').boundingBox();
 await page.mouse.click(box.x+90/1024*box.width,box.y+560/600*box.height);assert.equal((await model(page)).running,'false');
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
 assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
 await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});
 await page.screenshot({path:'artifacts/energy-desktop.png',fullPage:true});
 for(const width of [375,768,1024,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow at '+width);}
 await page.setViewportSize({width:1440,height:1000});await page.locator('.language-switch').click();assert.equal(page.url(),base+'en/examples/energy-console/');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.energy-launch').click();await ready(page);assert.equal((await model(page)).running,'false');
 await page.waitForTimeout(300);assert.equal((await model(page)).clock,'0');
 await page.locator('canvas').focus();await page.keyboard.press('Enter');assert.equal((await model(page)).running,'true','Explicit play works with reduced motion');
 await context.close();
 const mobile=await browser.newContext({viewport:{width:375,height:850},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));await phone.goto(route);await phone.locator('.energy-launch').tap();await ready(phone);
 for(const button of await phone.locator('.energy-command').all()){const b=await button.boundingBox();assert(b.height>=44&&b.width>=44,'Touch target size');}
 await command(phone,'stress').tap();assert.equal((await model(phone)).stress,'true');
 await phone.locator('canvas').scrollIntoViewIfNeeded();const b=await phone.locator('canvas').boundingBox();
 await phone.touchscreen.tap(b.x+750/1024*b.width,b.y+560/600*b.height);assert.equal((await model(phone)).economy,'true','Touch reaches LVGL');
 await phone.screenshot({path:'artifacts/energy-mobile.png',fullPage:true});await mobile.close();
 const failure=await browser.newContext();const failed=await failure.newPage();failed.on('pageerror',e=>errors.push(e.message));
 await failed.route('**/demo/energy/lvp.wasm',r=>r.abort());await failed.goto(route);await failed.locator('.energy-launch').click();await failed.waitForFunction(()=>!!document.querySelector('[data-energy]')?.dataset.error);
 assert(await failed.locator('.energy-poster').isVisible());assert(await failed.locator('.energy-cover').isVisible());assert.equal(await failed.locator('.energy-launch').isEnabled(),true);
 await failed.unroute('**/demo/energy/lvp.wasm');await failed.locator('.energy-launch').click();await ready(failed);await failure.close();
 assert.deepEqual(errors,[]);
 console.log('Energy browser checks passed: real WASM, native canvas pointer/touch, C commands, keyboard, bilingual routes, a11y, four widths, reduced motion, failure fallback and retry.');
}finally{await browser.close();}
