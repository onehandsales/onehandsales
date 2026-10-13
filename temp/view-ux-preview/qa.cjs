const {chromium,expect}=require(require.resolve('@playwright/test',{paths:[process.cwd()+'/FE/user-web']}));
const root=process.cwd()+'/temp/view-ux-preview/';
const key='onehandcrm-view-ux-preview-v1';
const reports=[];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:940},deviceScaleFactor:1});
 const page=await context.newPage();
 page.setDefaultTimeout(8000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const snapshot=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 const reset=async()=>{await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.locator('[data-action="reset"]').click();await expect(page.locator('.deal-card')).toHaveCount(11);};
 const table=()=>page.locator('.view-tab[data-id="view_table"]').click();
 const recordCount=n=>expect(page.locator('.data-table tbody tr')).toHaveCount(n);
 const test=async(name,fn)=>{try{await fn();reports.push({name,pass:true});}catch(e){reports.push({name,pass:false,error:e.message.slice(0,500)});await page.screenshot({path:root+'failure-'+reports.length+'.png'});await page.keyboard.press('Escape');await page.keyboard.press('Escape');}console.log(JSON.stringify(reports.at(-1)));};
 await page.goto('http://127.0.0.1:8766/',{waitUntil:'networkidle'});
 await test('기본 칸반 및 새 보기',async()=>{
  await expect(page.locator('.deal-card')).toHaveCount(11);await expect(page.locator('.board-column')).toHaveCount(5);
  await page.locator('[data-action="new-view"]').click();await page.getByLabel('보기 이름',{exact:true}).fill('나의 영업 보드');
  await page.locator('.layout-option[data-layout="board"]').click();await page.getByRole('button',{name:'보기 만들기',exact:true}).click();
  await expect(page.locator('.view-tab.active')).toHaveText('나의 영업 보드');await expect(page.locator('.deal-card')).toHaveCount(11);
 });
 await test('셀 수정, 저장 및 숨기기',async()=>{
  await reset();await table();await recordCount(11);
  await page.locator('[data-action="edit-cell"][data-id="d1"][data-field="amount"]').click();
  await page.locator('.cell-editor').fill('27000000');await page.locator('.cell-editor').press('Enter');
  expect((await snapshot()).deals.find(d=>d.id==='d1').amount).toBe(27000000);
  await page.reload();await recordCount(11);await expect(page.locator('[data-id="d1"][data-field="amount"]')).toHaveText('27,000,000원');
  await page.locator('[data-action="settings"]').click();await page.locator('.popover [data-action="properties"]').click();
  await page.getByLabel('영업 단계 표시',{exact:true}).uncheck();await page.keyboard.press('Escape');
  await expect(page.locator('th[data-field-id="stage"]')).toHaveCount(0);
 });
 await test('중첩 AND / OR 필터',async()=>{
  await reset();await table();await page.locator('#toolbar [data-action="filter"]').click();
  await page.locator('.filter-group:not(.nested) > .filter-actions [data-action="add-filter"]').click();await recordCount(10);
  await page.locator('.filter-value').fill('20000000');await page.locator('.filter-value').press('Tab');await recordCount(3);
  await page.locator('.filter-group:not(.nested) > .filter-actions [data-action="add-filter-group"]').click();await recordCount(2);
  await page.locator('.filter-group.nested .filter-value').selectOption('negotiation');await recordCount(1);
  await page.locator('.filter-group.nested [data-action="add-filter"]').click();
  await page.locator('.filter-group.nested .filter-field').last().selectOption('stage');
  await page.locator('.filter-group.nested .filter-value').last().selectOption('proposal');await recordCount(3);
  await page.keyboard.press('Escape');
 });
 await test('속성 및 기록 추가',async()=>{
  await reset();await table();await page.locator('thead [data-action="new-field"]').click();
  await page.getByLabel('정보 이름').fill('다음 연락일');await page.getByLabel('정보 유형').selectOption('date');
  await page.locator('#dialog').getByRole('button',{name:'정보 추가',exact:true}).click();await expect(page.locator('thead')).toContainText('다음 연락일');
  const field=(await snapshot()).fields.find(f=>f.label==='다음 연락일').id;
  await page.locator(`[data-action="edit-cell"][data-id="d1"][data-field="${field}"]`).click();await page.locator('.cell-editor').fill('2026-10-22');await page.locator('.cell-editor').press('Enter');
  expect((await snapshot()).deals.find(d=>d.id==='d1')[field]).toBe('2026-10-22');
  await page.locator('#view-bar [data-action="new-record"]').click();await page.getByLabel('영업 기회명').fill('새봄 파일럿');await page.getByLabel('예상 매출 · 원').fill('5000000');
  await page.getByRole('button',{name:'추가',exact:true}).click();await recordCount(12);
 });
 await test('카드 이동, 열 접기 및 숨기기',async()=>{
  await reset();await page.locator('.deal-card[data-record-drag="d3"]').dragTo(page.locator('.board-column[data-stage="proposal"] .column-header'));
  expect((await snapshot()).deals.find(d=>d.id==='d3').stage).toBe('proposal');
  await page.getByLabel('신규 열 설정',{exact:true}).click();await page.locator('.popover [data-action="fold-group"]').click();
  await expect(page.locator('.board-column[data-stage="new"]')).toHaveClass(/folded/);await page.getByLabel('신규 펼치기').click();
  await page.getByLabel('보류 열 설정',{exact:true}).click();await page.locator('.popover [data-action="hide-group"]').click();
  await expect(page.locator('.board-column[data-stage="hold"]')).toHaveCount(0);
  await page.getByRole('button',{name:'숨긴 열 보기',exact:true}).click();
  await page.locator('[data-action="group-visibility"][data-stage="hold"]').check();await page.keyboard.press('Escape');
  await expect(page.locator('.board-column[data-stage="hold"]')).toHaveCount(1);
 });
 await test('대시보드 추가 및 배치',async()=>{
  await reset();await page.locator('[data-action="dashboard"]').click();await expect(page.locator('.widget')).toHaveCount(3);
  await page.locator('[data-action="add-widget"]').click();await page.getByLabel('표시할 보기').selectOption('view_companies');
  await page.getByLabel('대시보드에서 사용할 제목').fill('고객사 목록');await page.getByRole('button',{name:'추가',exact:true}).click();await expect(page.locator('.widget')).toHaveCount(4);
  const before=(await snapshot()).widgets.map(w=>w.id);
  await page.setViewportSize({width:1440,height:1500});
  await page.locator(`[data-widget-drag="${before[3]}"]`).dragTo(page.locator(`.widget[data-widget="${before[0]}"] .widget-head`));
  expect((await snapshot()).widgets[0].id).toBe(before[3]);
  await page.locator('.widget').first().getByLabel('위젯 너비 변경').click();await expect(page.locator('.widget').first()).toHaveClass(/wide/);
  await page.setViewportSize({width:1440,height:940});
 });
 await test('일정과 선행 업무 연결',async()=>{
  await reset();await page.locator('.view-tab[data-id="view_timeline"]').click();
  await page.locator('[data-action="detail"][data-id="d7"]').first().click();await page.locator('[data-action="add-dependency"]').click();
  await page.getByLabel('선행 업무',{exact:true}).selectOption('d1');await page.getByLabel('종료 후 시간 간격').fill('2');await page.getByRole('button',{name:'연결',exact:true}).click();
  expect((await snapshot()).dependencies.some(d=>d.sourceId==='d1'&&d.targetId==='d7'&&d.offset===2)).toBe(true);
  await expect(page.locator('.dependency-chip')).toContainText('모노랩 연간 CRM 도입');await page.getByLabel('상세 닫기').click();
 });
 await test('회사 차트 및 검색',async()=>{
  await reset();await page.locator('[data-action="source"][data-id="companies"]').click();await recordCount(8);
  await page.locator('[data-action="new-view"]').click();await page.getByLabel('보기 이름',{exact:true}).fill('업종별 고객사');await page.locator('.layout-option[data-layout="chart"]').click();await page.getByRole('button',{name:'보기 만들기'}).click();
  await expect(page.locator('.chart-container h3')).toHaveText('업종별 회사 수');await page.locator('[data-action="chart-industry"][data-value="IT"]').click();await recordCount(3);
  await page.locator('[data-action="quick-search"]').click();await page.getByLabel('전체 기록 검색').fill('아틀라스');await page.locator('.search-result').first().click();await expect(page.locator('.detail-title')).toHaveValue('아틀라스 신규 파트너십');
 });
 await reset();await page.screenshot({path:root+'board-desktop.png'});
 await table();await page.screenshot({path:root+'table-desktop.png'});
 await page.locator('[data-action="dashboard"]').click();await page.screenshot({path:root+'dashboard-desktop.png'});
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});mobile.on('pageerror',e=>errors.push(e.message));
 await test('모바일 화면 및 메뉴',async()=>{
  await mobile.goto('http://127.0.0.1:8766/',{waitUntil:'networkidle'});await expect(mobile.locator('.board-column')).toHaveCount(5);
  expect(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await mobile.getByLabel('메뉴 열기').click();await expect(mobile.locator('#sidebar')).toBeVisible();await mobile.locator('[data-action="source"][data-id="companies"]').click();await expect(mobile.locator('.data-table tbody tr')).toHaveCount(8);
  await mobile.locator('[data-action="reset"]').click();await mobile.screenshot({path:root+'board-mobile.png'});
 });
 reports.push({name:'브라우저 JavaScript 오류',pass:errors.length===0,errors});
 console.log(JSON.stringify(reports,null,2));await browser.close();if(reports.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
