/** Optional UI regressions: install Playwright in your test environment, build/start
 * native-site locally, then run CHROMIUM_PATH=/path/to/chromium node scripts/verify-halloween.cjs.
 * NATIVE_SITE_TEST_URL defaults to http://127.0.0.1:3011. API responses are mocked.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || undefined,headless:true,args:['--no-sandbox']});
 try{
  let enabled=true;
  const cfg={ok:true,serverTime:Date.now(),launch:{at:Date.now()+86400000,prelaunch:true,launched:false,lockStore:true,lockDownloads:true,founderPick:true,founderCapes:[],headline:'Native is almost here.',subline:''},maintenance:{enabled:false,message:'',until:null},announcement:{enabled:false,text:'',href:'',cta:''},beta:{open:true,closesAt:null},theme:{halloween:true},offers:[]};
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('theme','light');localStorage.setItem('native.halloween.off','1');});
  await page.route('**/api/site',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({...cfg,theme:{halloween:enabled}})}));
  await page.goto(`${process.env.NATIVE_SITE_TEST_URL || 'http://127.0.0.1:3011'}/support`,{waitUntil:'domcontentloaded'});
  await page.locator('body[data-halloween="on"]').waitFor();
  const left=page.locator('.hw-spider-left button'),right=page.locator('.hw-spider-right button');
  await left.waitFor();assert.equal(await page.locator('.hw-spider').count(),2);
  await page.waitForFunction(() => document.querySelectorAll('[data-theme-control]').length === 0);
  assert.equal(await page.locator('[data-theme-control]').count(),0);assert.equal(await page.getByRole('button',{name:'Switch theme'}).count(),0);
  assert.equal(await page.locator('.v-nav .v-roll, .v-nav .v-magnetic').count(),0);
  await page.locator('.v-nav-plus').hover();assert.equal(await page.locator('.v-nav-plus .nx-plus-icon').evaluate(e=>getComputedStyle(e).transform),'none');
  await left.click();assert.equal(await left.getAttribute('aria-pressed'),'true');await page.waitForTimeout(850);
  const thread=await page.locator('.hw-spider-left .hw-thread').evaluate(e=>e.getBoundingClientRect().height);assert.ok(thread>150);
  await left.press('Escape');assert.equal(await left.getAttribute('aria-pressed'),'false');await page.waitForTimeout(850);
  await right.focus();await right.press('Space');assert.equal(await right.getAttribute('aria-pressed'),'true');await right.press('Space');assert.equal(await right.getAttribute('aria-pressed'),'false');
  const rect=await left.boundingBox();await page.mouse.move(rect.x+rect.width/2+10,rect.y+rect.height/2);await page.waitForTimeout(50);assert.notEqual(await left.evaluate(e=>e.style.getPropertyValue('--peek')),'');
  const pumpkin=page.locator('.hw-pumpkin').first();await pumpkin.focus();await pumpkin.press('Enter');assert.equal(await page.locator('.hw-burst i').count(),16);
  const burst=await page.locator('.hw-burst').evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));assert.ok(burst.x>0&&burst.y>0);await page.waitForTimeout(1400);assert.equal(await page.locator('.hw-burst').count(),0);
  await page.mouse.move(700,700);
  const anchor = () => page.evaluate(() => ({
    navBottom: document.querySelector('.v-nav').getBoundingClientRect().bottom,
    threadTop: document.querySelector('.hw-spider-left .hw-thread').getBoundingClientRect().top
  }));
  let position = await anchor();assert.ok(Math.abs(position.navBottom-position.threadTop)<=1, 'thread attaches directly to navbar');
  // A dropped spider must fully leave the viewport, not hang below a hidden bar.
  await left.click();await page.waitForTimeout(850);
  await page.evaluate(()=>window.scrollTo(0,600));await page.locator('.v-nav.is-hidden').waitFor();await page.waitForFunction(()=>getComputedStyle(document.querySelector('.hw-spider-left')).opacity==='0');
  assert.equal(await page.locator('.hw-spiders').getAttribute('inert'), '');
  assert.equal(await left.evaluate(e=>getComputedStyle(e.closest('.hw-spider')).opacity), '0');
  assert.ok((await left.boundingBox()).y+(await left.boundingBox()).height<=1, 'spider retracts fully above viewport');
  await page.evaluate(()=>window.scrollTo(0,200));await page.waitForFunction(()=>!document.querySelector('.v-nav').classList.contains('is-hidden'));await page.waitForTimeout(700);
  position = await anchor();assert.ok(Math.abs(position.navBottom-position.threadTop)<=1, 'thread stays anchored when navbar returns');
  await left.press('Escape');await page.waitForTimeout(850);await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(700);
  await page.setViewportSize({width:390,height:844});assert.equal(await left.isVisible(),true);assert.equal(await right.isVisible(),false);const touchBox=await left.boundingBox();assert.ok(touchBox.width>=44&&touchBox.height>=44);
  position = await anchor();assert.ok(Math.abs(position.navBottom-position.threadTop)<=1, 'mobile thread attaches to navbar');
  await page.getByRole('button',{name:'Open menu',exact:true}).click();assert.equal(await page.locator('.hw-spiders').getAttribute('inert'), '');assert.equal(await page.locator('[data-theme-control]').count(),0);await page.getByRole('button',{name:'Close menu',exact:true}).click();await page.waitForTimeout(750);
  enabled=false;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>!document.body.hasAttribute('data-halloween'));assert.equal(await page.locator('.hw-spider').count(),0);assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.setViewportSize({width:1440,height:1000});assert.equal(await page.locator('.v-nav').getByRole('button',{name:'Switch theme'}).isVisible(),true);
  enabled=true;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await left.waitFor();assert.equal(await page.locator('[data-theme-control]').count(),0);
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await left.locator('svg').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await page.locator('.hw-spider-left .hw-thread').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await left.click();assert.equal(await left.getAttribute('aria-pressed'),'true');await left.click();assert.equal(await left.getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[]);console.log('PASS: no empty theme boxes; still nav hovers; desktop/mobile spiders; click, Space, Escape and hover reactions; keyboard candy bursts; live theme on/off; light theme restoration; reduced-motion behavior; navbar-anchored threads and scroll hide/show.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
