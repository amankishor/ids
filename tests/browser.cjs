const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/'));
 assert.equal(await page.locator('.template').count(),4);
 for(let i=0;i<4;i++){
  await page.locator('.template').nth(i).click();
  const original=await page.locator('#front').evaluate(c=>c.toDataURL());
  const download=page.waitForEvent('download');await page.locator('#download').click();
  assert.match((await download).suggestedFilename(),/original\.png$/);
  await page.locator('#custom-mode').click();
  await page.locator('#person-name').fill('Aman Kishor');
  await page.locator('#download').click();assert.match(await page.locator('#status').innerText(),/Add your photo/);
  const png=await page.locator('#hero-card').evaluate(c=>c.toDataURL().split(',')[1]);
  await page.locator('#photo').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Photo added'));
  await page.locator('#qr-url').fill('https://example.com/aman');
  assert.notEqual(await page.locator('#front').evaluate(c=>c.toDataURL()),original);
  const customDownload=page.waitForEvent('download');await page.locator('#download').click();
  assert.match((await customDownload).suggestedFilename(),/custom\.png$/);
  await page.locator('#default-mode').click();
  assert.equal(await page.locator('#front').evaluate(c=>c.toDataURL()),original);
  await page.locator('#back').click();
 }
 await page.screenshot({path:'test-results/desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('.template').first().click();await page.locator('#custom-mode').click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS: all four original/custom exports, photo uploads, QR rendering, reset consistency, and mobile overflow.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
