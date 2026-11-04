const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const JSZip=require('../assets/jszip.min.js');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(req.url==='/'?'/index.html':req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.zip':'application/zip'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
let browser;
async function edit(page,side,key,value){await page.locator(`#${side}-fields [data-field="${key}"]`).click();const input=page.locator('.inline-editor');assert.equal(await input.count(),1);await input.fill(value);await input.press('Tab');assert.equal(await input.count(),0);}
async function download(page){const event=page.waitForEvent('download');await page.locator('#download').click();const file=await event;const buffer=fs.readFileSync(await file.path());return{file,buffer,zip:await JSZip.loadAsync(buffer)};}
function pngDimensions(buffer){return[buffer.readUInt32BE(16),buffer.readUInt32BE(20)];}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const launch={headless:true};if(process.platform==='win32')launch.executablePath='C:/Program Files/Google/Chrome/Application/chrome.exe';
 browser=await chromium.launch(launch);const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin=`http://127.0.0.1:${server.address().port}`;
 await page.goto(origin);await page.waitForFunction(()=>document.body.dataset.ready==='true');
 assert.equal(await page.locator('.template').count(),6);assert.equal(await page.locator('form').count(),0);
 const prefixes=['oscorp_richard_parker_id','loki_tva_id','mclovin_driver_license'];
 for(let i=0;i<6;i++){
  await page.locator('.template').nth(i).click();const initial=await page.locator('#front').evaluate(c=>{window.initialPixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return c.toDataURL();});
  if(i===0){const size=await page.locator('#front').boundingBox();assert.ok(size.width<=230&&size.height<=370,'Compact Oscorp size at 100% zoom');}
  const original=await download(page);
  if(i<3){assert.deepEqual(original.buffer,fs.readFileSync(path.join(root,'assets',prefixes[i]+'_cards.zip')),'Unchanged supplied default ZIP');}
  else{assert.ok(original.zip.file('front.png'));assert.ok(original.zip.file('back.png'));}
  await page.locator('#custom-mode').click();assert.equal(await page.locator('form').count(),0);
  if(i!==1)await edit(page,'front','name','Aman Kishor');else await edit(page,'front','number','TVA-123456');
  await page.locator('#front-fields [data-field="photo"]').click();assert.equal(await page.locator('#photo-editor').isVisible(),true);
  const png=await page.locator('#front').evaluate(c=>c.toDataURL().split(',')[1]);
  await page.locator('#photo').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Photo added'));
  await page.locator('#photo-editor .close-popover').click();
  assert.notEqual(await page.locator('#front').evaluate(c=>c.toDataURL()),initial);
  await page.locator('#qr-enabled').check();assert.equal(await page.locator('#qr-link-row').isVisible(),true);await page.locator('#qr-url').fill('https://example.com/aman');
  const custom=await download(page);assert.match(custom.file.suggestedFilename(),/_custom_cards\.zip$/);
  assert.deepEqual(Object.keys(custom.zip.files).sort(),['README.txt','back.png','front.png']);
  const front=await custom.zip.file('front.png').async('nodebuffer'),back=await custom.zip.file('back.png').async('nodebuffer');
  const dimensions=pngDimensions(front);assert.ok(dimensions[0]>=2000,'High-quality export width');assert.deepEqual(dimensions,pngDimensions(back));
  if(i<3)assert.equal(dimensions[0],i===2?2048:3030);
  await page.locator('#return-default').click();const meanDifference=await page.locator('#front').evaluate(c=>{const next=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let total=0;for(let j=0;j<next.length;j++)total+=Math.abs(next[j]-window.initialPixels[j]);return total/next.length;});assert.ok(meanDifference<3,'Reset image pixel difference '+meanDifference+' template '+i);
  await page.locator('#back').click();
 }
 await page.locator('[data-template="fightclub"]').click();
 await page.locator('#custom-mode').click();
 for(const[key,value]of Object.entries({name:'AMAN KISHOR',chinese:'阿曼',grade:'A1',number:'FC-42',age:'29',section:'FIGHT CLUB',serial:'123456',expiry:'28 October 2028'}))await edit(page,'front',key,value);
 const fightBefore=await page.locator('#front').evaluate(c=>c.toDataURL());
 await page.locator('#select-color').click();await page.getByRole('button',{name:'Rose',exact:true}).click();await page.locator('#color-editor .close-popover').click();
 assert.notEqual(await page.locator('#front').evaluate(c=>c.toDataURL()),fightBefore);
 await page.screenshot({path:'test-results/fightclub-custom.png',fullPage:true});
 await page.locator('#back').click();
 await page.locator('[data-template="travel"]').click();
 assert.equal(await page.locator('#select-color').isVisible(),true);
 await page.screenshot({path:'test-results/traveller-default.png',fullPage:true});
 await page.locator('#custom-mode').click();
 const travellerBefore=await page.locator('#front').evaluate(c=>c.toDataURL());
 for(const [key,value]of Object.entries({name:'Aman Kishor',dob:'04/12/2000',place:'India',issue:'11/04/2026',number:'TRAVEL-42',signature:'Aman',heading:'PERMANENT LICENSE OF TRAVEL',license:'MY TRAVEL LICENSE',body:'A new journey starts here.',important:'MY NOTE',note:'Follow your curiosity.',caption:'My travel photo'}))await edit(page,'front',key,value);
 await edit(page,'rear','backHeading','MY NEXT ADVENTURE');
 await edit(page,'rear','backBody','A personal invitation to explore.');
 await page.locator('#select-color').click();assert.equal(await page.locator('#color-editor').isVisible(),true);
 await page.getByRole('button',{name:'Blue',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'Blue',exact:true}).getAttribute('aria-pressed'),'true');
 await page.locator('#color-editor .close-popover').click();
 assert.notEqual(await page.locator('#front').evaluate(c=>c.toDataURL()),travellerBefore);
 // URL import is served by a host allowing cross-origin requests.
 await page.route('https://photos.example.test/cat.png',route=>route.fulfill({status:200,headers:{'access-control-allow-origin':'*','content-type':'image/png'},body:fs.readFileSync(path.join(root,'assets/traveller-cat-default.png'))}));
 await page.locator('#front-fields [data-field="photo"]').click();await page.locator('#photo-url').fill('https://photos.example.test/cat.png');await page.locator('#load-url').click();
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Photo added'));
 await page.locator('#photo-editor .close-popover').click();
 const traveller=await download(page);assert.deepEqual(pngDimensions(await traveller.zip.file('front.png').async('nodebuffer')),[2014,1277]);
 await page.screenshot({path:'test-results/traveller-custom.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('#front-fields [data-field="name"]').click();await page.locator('.inline-editor').fill('Mobile traveller');await page.locator('.inline-editor').press('Enter');
 await page.locator('#select-color').click();const popover=await page.locator('#color-editor').boundingBox();assert.ok(popover.x>=0&&popover.x+popover.width<=390);await page.keyboard.press('Escape');
 await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 await page.locator('#back').click();await page.screenshot({path:'test-results/desktop-gallery-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 console.log('PASS: compact preview, all six default/custom ZIP exports, separate high-resolution PNGs, exact supplied defaults, direct card editing, Traveller fields/cat/color, photo upload/URL, QR, reset, mobile, and no storage.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.closeAllConnections();server.close();});
