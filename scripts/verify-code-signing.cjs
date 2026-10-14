/** Manual browser regression; Playwright is supplied by the test environment. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || undefined,headless:true,args:['--no-sandbox']});
 try{
  let prelaunch=true;
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/site',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,launch:{at:Date.now()+86400000,prelaunch,launched:!prelaunch,lockStore:prelaunch,lockDownloads:prelaunch,founderPick:prelaunch,founderCapes:[],headline:'Native is almost here.',subline:''},maintenance:{enabled:false},theme:{halloween:true},offers:[]})}));
  const base=process.env.NATIVE_SITE_TEST_URL || 'http://127.0.0.1:3022';
  const urls=['https://about.signpath.io','https://signpath.org','https://github.com/atlas-thedev/native-client#code-signing-policy'];
  const expected='Free code signing provided by SignPath.io, certificate by SignPath Foundation. Code signing policy';
  await page.goto(`${base}/download`,{waitUntil:'domcontentloaded'});
  await page.locator('main [data-code-signing-credit]').waitFor();
  const check=async()=>{
   const paragraphs=page.locator('[data-code-signing-credit]');assert.equal(await paragraphs.count(),2);
   for(const p of await paragraphs.all()){
    assert.equal((await p.innerText()).replace(/\s+/g,' ').trim(),expected);
    assert.deepEqual(await p.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),urls);
    for(const a of await p.locator('a').all()){assert.equal(await a.getAttribute('target'),'_blank');assert.match(await a.getAttribute('rel'),/noopener/);}
   }
   assert.equal(await page.locator('.hw-pixel-waves').count(),0);
  };
  await check();
  prelaunch=false;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(800);await check();
  const out=process.env.NATIVE_SITE_SCREENSHOTS_DIR;if(out)fs.mkdirSync(out,{recursive:true});
  for(const [label,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   await page.setViewportSize({width,height});
   for(const [location,selector] of [['download','main'],['footer','footer']]){
    const p=page.locator(`${selector} [data-code-signing-credit]`);await p.scrollIntoViewIfNeeded();await page.waitForTimeout(400);
    const box=await p.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);
    assert.ok(await p.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
    if(out)await p.screenshot({path:path.join(out,`${label}-${location}-credit.png`)});
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  }
  await page.goto(`${base}/support`,{waitUntil:'domcontentloaded'});assert.equal(await page.locator('footer [data-code-signing-credit]').count(),1);
  assert.deepEqual(errors,[]);console.log('PASS: exact SignPath copy/links on download and global footer; pre-launch and launched states; desktop/mobile bounds; no pixel-wave changes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
