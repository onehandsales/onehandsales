const path=require('node:path');
const {chromium,expect}=require(require.resolve('@playwright/test',{paths:[path.resolve(__dirname,'../../FE/user-web')]}));
const fs=require('node:fs');
const previewRoot=__dirname+path.sep;
const previewUrl=require('node:url').pathToFileURL(path.join(__dirname,'OneHand-CRM-UX-preview.html')).href;
const storageKey='onehandcrm-view-ux-preview-v2';
const reports=[];
const types=['table','board','list','gallery','calendar','timeline','gantt','chart','pivot','map','dashboard'];
const workspaceIds=['sales','realestate','marketing','insurance','commerce'];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(7000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const state=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),storageKey);
 const workspace=async(id)=>{await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.getByLabel('워크스페이스 전환',{exact:true}).click();await page.locator(`.workspace-option[data-id="${id}"]`).click();};
 const choose=async(type)=>{await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.locator('.view-explorer').click();await page.locator(`.layout-option[data-layout="${type}"]`).click();};
 const reset=async()=>{await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.locator('[data-action="reset"]').click();};
 const count=n=>expect(page.locator('.data-table tbody tr')).toHaveCount(n);
 const test=async(name,fn)=>{try{await fn();reports.push({name,pass:true});}catch(e){reports.push({name,pass:false,error:e.message.slice(0,800)});await page.screenshot({path:previewRoot+'expanded-failure-'+reports.length+'.png',animations:'disabled'});await page.keyboard.press('Escape');await page.keyboard.press('Escape');}console.log(JSON.stringify(reports.at(-1)));};
 try{
  await page.goto(previewUrl,{waitUntil:'networkidle'});
  await test('5개 워크스페이스 × 11종, 각 공간에 업무 목록 2개',async()=>{
   expect((await state()).workspaces.map(w=>w.id)).toEqual(workspaceIds);
   for(const id of workspaceIds){await workspace(id);for(const type of types){await choose(type);await expect(page.locator('#workspace')).toHaveClass(new RegExp('workspace-'+type));expect(await page.locator('#workspace').innerHTML()).not.toBe('');}expect((await state()).workspaces.find(w=>w.id===id).sources.filter(s=>s.type==='LIST').length).toBe(2);}
  });
  await test('기존 3개 공간의 입력과 보기 설정 보존, 신규 공간 자동 추가',async()=>{
   const original=await state(),stored=structuredClone(original);stored.workspaces=stored.workspaces.filter(w=>['sales','realestate','marketing'].includes(w.id));stored.activeWorkspaceId='marketing';
   const marketing=stored.workspaces.find(w=>w.id==='marketing');marketing.records[0].name='사용자가 수정한 캠페인';marketing.records[0].notes='기존 입력 내용';marketing.views[0].name='사용자 지정 보기';marketing.views[0].filter.rules=[{id:'saved-filter',fieldId:'amount',op:'gte',value:10000000}];marketing.activeView=marketing.views[0].id;
   const preserved=stored.workspaces.map(w=>JSON.stringify(w));
   try{
    await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:storageKey,data:stored});await page.reload();
    const upgraded=await state();expect(upgraded.workspaces.map(w=>w.id)).toEqual(workspaceIds);expect(upgraded.activeWorkspaceId).toBe('marketing');expect(upgraded.workspaces.slice(0,3).map(w=>JSON.stringify(w))).toEqual(preserved);await expect(page.locator('.view-tab.active')).toHaveText('사용자 지정 보기');await expect(page.locator('tbody')).toContainText('사용자가 수정한 캠페인');
    await page.reload();expect((await state()).workspaces).toHaveLength(5);
   }finally{await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:storageKey,data:original});await page.reload();}
  });
  await test('워크스페이스 데이터와 목록 참여 상태 분리',async()=>{
   await workspace('realestate');await reset();await choose('table');await count(12);
   const before=await state(),salesBefore=JSON.stringify(before.workspaces.find(w=>w.id==='sales'));
   await page.locator('[data-action="edit-cell"][data-id="r1"][data-field="amount"]').click();await page.locator('.cell-editor').fill('1500000000');await page.locator('.cell-editor').press('Enter');
   await page.locator('[data-action="edit-cell"][data-id="r1"][data-field="stage"]').click();await page.locator('.cell-editor').selectOption('won');
   const after=await state(),estate=after.workspaces.find(w=>w.id==='realestate');expect(JSON.stringify(after.workspaces.find(w=>w.id==='sales'))).toBe(salesBefore);expect(estate.records.find(r=>r.id==='r1').amount).toBe(1500000000);expect(estate.entries.pipeline.r1.stage).toBe('won');expect(estate.entries.secondary.r1.stage).toBe('proposal');
   await workspace('sales');await choose('table');await count(12);await workspace('realestate');await page.reload();await expect(page.locator('[data-id="r1"][data-field="amount"]')).toHaveText('1,500,000,000원');
  });
  await test('중첩 필터, 정렬, 표시 정보와 별도 보기',async()=>{
   await workspace('sales');await reset();await choose('table');await page.locator('#toolbar [data-action="filter"]').click();await page.locator('.filter-group:not(.nested)>.filter-actions [data-action="add-filter"]').click();await count(11);
   await page.locator('.filter-value').fill('20000000');await page.locator('.filter-value').press('Tab');await count(3);
   await page.locator('.filter-group:not(.nested)>.filter-actions [data-action="add-filter-group"]').click();await count(2);await page.locator('.nested .filter-value').selectOption('negotiation');await count(1);await page.keyboard.press('Escape');
   await reset();await choose('table');await page.locator('thead [data-action="field-menu"][data-field="amount"]').click();await page.locator('.popover [data-action="sort-field"][data-direction="ASC"]').click();await expect(page.locator('tbody tr').first()).toContainText('넥스트웨이브 기술 검토');
   await page.getByLabel('보기 설정',{exact:true}).click();await page.locator('.popover [data-action="properties"]').click();await page.getByLabel('영업 단계 표시',{exact:true}).uncheck();await page.keyboard.press('Escape');await expect(page.locator('th[data-field-id="stage"]')).toHaveCount(0);
   await page.getByLabel('보기 추가',{exact:true}).click();await page.getByLabel('보기 이름',{exact:true}).fill('나의 담당 영업');await page.locator('.layout-option[data-layout="list"]').click();await page.locator('#dialog button[type="submit"]').click();await expect(page.locator('.view-tab.active')).toHaveText('나의 담당 영업');
  });
  await test('기록 추가와 목록 전용 정보 추가',async()=>{
   await workspace('realestate');await reset();await choose('table');await page.locator('#view-bar [data-action="new-record"]').click();await page.getByLabel('매물 이름').fill('반포 테스트 매물');await page.getByLabel('매물 금액 · 원').fill('980000000');await page.getByLabel('매물 주소').fill('서울 서초구 반포동');await page.locator('#dialog button[type="submit"]').click();await count(13);
   await page.locator('thead [data-action="new-field"]').click();await page.getByLabel('정보 이름').fill('다음 방문일');await page.getByLabel('정보 유형').selectOption('date');await page.getByLabel('어디에 저장할까요?').selectOption('LIST_ENTRY');await page.locator('#dialog button[type="submit"]').click();await expect(page.locator('thead')).toContainText('다음 방문일');
   const estate=(await state()).workspaces.find(w=>w.id==='realestate'),field=estate.fields.find(f=>f.label==='다음 방문일');expect(field.scopes).toEqual(['pipeline']);await page.locator(`[data-action="edit-cell"][data-id="r1"][data-field="${field.id}"]`).click();await page.locator('.cell-editor').fill('2026-10-24');await page.locator('.cell-editor').press('Enter');expect((await state()).workspaces.find(w=>w.id==='realestate').entries.pipeline.r1[field.id]).toBe('2026-10-24');
  });
  await test('칸반 이동, 열 접기·숨기기',async()=>{
   await workspace('sales');await reset();await choose('board');await page.locator('[data-record-drag="d3"]').dragTo(page.locator('.board-column[data-stage="proposal"] .column-header'));expect((await state()).workspaces.find(w=>w.id==='sales').entries.pipeline.d3.stage).toBe('proposal');
   await page.getByLabel('신규 열 설정',{exact:true}).click();await page.locator('.popover [data-action="fold-group"]').click();await expect(page.locator('.board-column[data-stage="new"]')).toHaveClass(/folded/);await page.getByLabel('신규 펼치기').click();await page.getByLabel('보류 열 설정',{exact:true}).click();await page.locator('.popover [data-action="hide-group"]').click();await expect(page.locator('.board-column[data-stage="hold"]')).toHaveCount(0);await page.getByRole('button',{name:'숨긴 열 보기',exact:true}).click();await page.getByLabel('보류 열 표시',{exact:true}).check();await page.keyboard.press('Escape');await expect(page.locator('.board-column[data-stage="hold"]')).toHaveCount(1);
  });
  await test('캘린더 날짜 이동과 간트 선행 업무',async()=>{
   await workspace('marketing');await reset();await choose('calendar');await page.locator('[data-record-drag="m1"]').dragTo(page.locator('.calendar-day[data-calendar-day="2026-10-21"] header'));expect((await state()).workspaces.find(w=>w.id==='marketing').records.find(r=>r.id==='m1').end).toBe('2026-10-21');
   await choose('gantt');await expect(page.locator('.dependency-overlay>path')).toHaveCount(1);await page.locator('[data-action="detail"][data-id="m3"]').first().click();await page.locator('[data-action="add-dependency"]').click();await page.getByLabel('선행 업무',{exact:true}).selectOption('m1');await page.getByLabel('완료 후 시간 간격').fill('-1');await page.getByLabel('단위').selectOption('HOUR');await page.locator('#dialog button[type="submit"]').click();await expect(page.locator('.dependency-chip')).toContainText('오브제 가을 컬렉션 런칭');const result=(await state()).workspaces.find(w=>w.id==='marketing');expect(result.dependencies.some(d=>d.sourceId==='m1'&&d.targetId==='m3'&&d.offset===-1&&d.unit==='HOUR')).toBe(true);expect(result.records.find(r=>r.id==='m3').start).toBe('2026-10-13');
  });
  await test('차트 5종과 집계 드릴다운',async()=>{
   await workspace('marketing');await reset();await choose('chart');const total=(await state()).workspaces.find(w=>w.id==='marketing').records.reduce((n,r)=>n+r.amount,0);await expect(page.locator('.metric-value').first()).toContainText((total/100000000).toLocaleString('ko-KR',{maximumFractionDigits:2})+'억');
   for(const style of ['bar','line','area','pie','donut']){await page.getByLabel('차트 형태').selectOption(style);await expect(page.locator(['pie','donut'].includes(style)?'.pie-chart':'.data-chart')).toHaveCount(1);}
   await page.locator('.chart-legend [data-action="chart-drill"][data-group="negotiation"]').click();await count(3);await expect(page.locator('tbody')).toContainText('그린테이블 정기 구독 광고');
  });
  await test('피벗 교차 집계와 지도 상세',async()=>{
   await workspace('realestate');await reset();await choose('pivot');await expect(page.locator('.pivot-table tfoot td').last()).toHaveText('12건');await page.locator('[data-action="pivot-drill"][data-row="아파트"][data-col="proposal"]').click();await count(2);
   await choose('map');await expect(page.locator('.map-result')).toHaveCount(12);await page.locator('.map-result[data-id="r1"]').click();await expect(page.locator('.map-selected-card')).toContainText('한강뷰 리버파크');await page.getByLabel('지도 확대').click();expect((await state()).workspaces.find(w=>w.id==='realestate').views.find(v=>v.layout==='map').mapZoom).toBe(1.25);await page.locator('.map-selected-card [data-action="detail"]').click();await expect(page.getByLabel('기록 이름')).toHaveValue('한강뷰 리버파크 84㎡');
  });
  await test('대시보드 연결·순서·너비·되돌리기',async()=>{
   await workspace('sales');await reset();await choose('dashboard');await expect(page.locator('.widget')).toHaveCount(3);await page.locator('[data-action="add-widget"]').click();await page.getByLabel('표시할 보기').selectOption('sales_gallery');await page.getByLabel('대시보드에서 사용할 제목').fill('관심 고객 기회');await page.locator('#dialog button[type="submit"]').click();await expect(page.locator('.widget')).toHaveCount(4);const last=(await state()).workspaces.find(w=>w.id==='sales').views.find(v=>v.layout==='dashboard').widgets.at(-1).id;await page.locator(`.widget[data-widget="${last}"] [data-action="widget-move"][data-step="-1"]`).click();expect((await state()).workspaces.find(w=>w.id==='sales').views.find(v=>v.layout==='dashboard').widgets[2].id).toBe(last);await page.locator(`.widget[data-widget="${last}"] [data-action="widget-size"]`).click();await expect(page.locator(`.widget[data-widget="${last}"]`)).toHaveClass(/wide/);await page.locator(`.widget[data-widget="${last}"] [data-action="remove-widget"]`).click();await expect(page.locator('.widget')).toHaveCount(3);await page.locator('#status-bar [data-action="undo"]').click();await expect(page.locator('.widget')).toHaveCount(4);
  });
  await test('워크스페이스 내부 검색',async()=>{
   await workspace('marketing');await page.locator('[data-action="quick-search"]').click();await page.getByLabel('워크스페이스 기록 검색').fill('오브제');await expect(page.locator('.search-results')).not.toContainText('오브제웍스 B2B 공급');await page.locator('.search-result[data-id="m1"]').click();await expect(page.getByLabel('기록 이름')).toHaveValue('오브제 가을 컬렉션 런칭');
  });
  await test('보험·금융 상담 추가, 다음 할 일 편집과 갱신일 캘린더',async()=>{
   await workspace('insurance');await reset();await expect(page.locator('.list-row')).toHaveCount(5);await expect(page.locator('.record-list')).toContainText('첫 상담 시간 확정하기');await choose('table');await count(8);await expect(page.locator('thead')).toContainText('만기·갱신일');
   await page.locator('#view-bar [data-action="new-record"]').click();await page.getByLabel('상담 건 이름').fill('신규 고객 보장 상담');await page.getByLabel('월 예상 납입액 · 원').fill('95000');await page.getByLabel('상담 유형',{exact:true}).fill('보장 상담');await page.getByLabel('상담 상품',{exact:true}).fill('보장 플랜 예시');await page.getByLabel('다음 할 일',{exact:true}).fill('다음 주 상담 확정');await page.getByLabel('만기·갱신일',{exact:true}).fill('2027-10-25');await page.locator('#dialog button[type="submit"]').click();await count(9);
   const added=(await state()).workspaces.find(w=>w.id==='insurance').records.find(r=>r.name==='신규 고객 보장 상담');expect(added.nextAction).toBe('다음 주 상담 확정');expect(added.renewal).toBe('2027-10-25');expect(added.amount).toBe(95000);
   await page.locator('[data-action="detail"][data-id="i1"]').first().click();await page.locator('#detail-root').getByLabel('다음 할 일',{exact:true}).fill('고객 회신 확인하기');await page.locator('#detail-root').getByLabel('다음 할 일',{exact:true}).press('Tab');expect((await state()).workspaces.find(w=>w.id==='insurance').records.find(r=>r.id==='i1').nextAction).toBe('고객 회신 확인하기');await page.keyboard.press('Escape');
   await page.locator('[data-action="source"][data-id="secondary"]').click();await expect(page.locator('.deal-card')).toHaveCount(4);await page.getByRole('button',{name:'만기·갱신 관리 일정',exact:true}).click();await expect(page.getByLabel('캘린더 날짜 기준')).toHaveValue('renewal');await expect(page.locator('.calendar-event')).toHaveCount(4);
   await page.locator('[data-record-drag="i9"]').dragTo(page.locator('.calendar-day[data-calendar-day="2026-10-21"] header'));const moved=(await state()).workspaces.find(w=>w.id==='insurance').records.find(r=>r.id==='i9');expect(moved.renewal).toBe('2026-10-21');expect(moved.end).toBe('2026-10-16');
   await page.locator('.calendar-day[data-calendar-day="2026-10-22"]').hover();await page.getByLabel('2026-10-22 기록 추가',{exact:true}).click();const form=page.locator('#dialog');await expect(form.getByLabel('만기·갱신일',{exact:true})).toHaveValue('2026-10-22');await form.getByLabel('상담 건 이름',{exact:true}).fill('새 만기 확인 상담');await form.getByLabel('다음 연락일',{exact:true}).fill('2026-10-15');await form.locator('button[type="submit"]').click();await expect(page.locator('.calendar-event')).toHaveCount(5);const calendarAdded=(await state()).workspaces.find(w=>w.id==='insurance').records.find(r=>r.name==='새 만기 확인 상담');expect(calendarAdded.renewal).toBe('2026-10-22');expect(calendarAdded.end).toBe('2026-10-15');
  });
  await test('커머스 구매 이력 입력, 고객 추가와 문의 목록 검색·수정',async()=>{
   const insuranceBefore=JSON.stringify((await state()).workspaces.find(w=>w.id==='insurance'));await workspace('commerce');await reset();await count(8);await expect(page.locator('thead')).toContainText('최근 구매일');await expect(page.locator('thead')).toContainText('구매 횟수');
   await page.locator('[data-action="edit-cell"][data-id="e2"][data-field="orderCount"]').click();await page.locator('.cell-editor').fill('7');await page.locator('.cell-editor').press('Enter');expect((await state()).workspaces.find(w=>w.id==='commerce').records.find(r=>r.id==='e2').orderCount).toBe(7);
   await page.locator('#view-bar [data-action="new-record"]').click();await page.getByLabel('고객관리 건 이름').fill('새 고객 재구매 안내');await page.getByLabel('관리 유형',{exact:true}).fill('재구매');await page.getByLabel('관심 상품',{exact:true}).fill('리빙 세트');await page.getByLabel('다음 할 일',{exact:true}).fill('사용 경험 확인');await page.getByLabel('최근 구매일',{exact:true}).fill('2026-10-10');await page.getByLabel('구매 횟수',{exact:true}).fill('3');await page.getByLabel('유입 채널',{exact:true}).fill('자사몰');await page.locator('#dialog button[type="submit"]').click();await count(9);const added=(await state()).workspaces.find(w=>w.id==='commerce').records.find(r=>r.name==='새 고객 재구매 안내');expect(added.lastOrder).toBe('2026-10-10');expect(added.orderCount).toBe(3);expect(added.channel).toBe('자사몰');
   await page.locator('[data-action="source"][data-id="companies"]').click();await page.locator('#view-bar [data-action="new-record"]').click();await page.getByLabel('고객 이름',{exact:true}).fill('테스트 고객');await page.getByLabel('고객 메모',{exact:true}).fill('채팅 응대 선호');await page.locator('#dialog button[type="submit"]').click();await count(9);
   await page.locator('[data-action="source"][data-id="secondary"]').click();await expect(page.locator('.deal-card')).toHaveCount(4);await page.locator('[data-action="quick-search"]').click();await page.getByLabel('워크스페이스 기록 검색').fill('배송 일정 문의');await page.locator('.search-result[data-id="e9"]').click();await page.getByLabel('문의 상태',{exact:true}).selectOption('won');const commerce=(await state()).workspaces.find(w=>w.id==='commerce');expect(commerce.entries.secondary.e9.stage).toBe('won');expect(commerce.entries.pipeline.e9).toBeUndefined();expect(JSON.stringify((await state()).workspaces.find(w=>w.id==='insurance'))).toBe(insuranceBefore);await page.keyboard.press('Escape');
  });
  await test('새 공간의 원본 기록 추가와 업무 목록 참여 상태 분리',async()=>{
   for(const id of ['insurance','commerce']){
    await workspace(id);const before=(await state()).workspaces.find(w=>w.id===id),entriesBefore=JSON.stringify(before.entries);await page.locator('[data-action="source"][data-id="records"]').click();await count(before.records.length);
    await page.locator('#view-bar [data-action="new-record"]').click();const form=page.locator('#dialog');await expect(form.locator('[name="category"]')).toHaveCount(1);await form.getByLabel(`${before.labels.record} 이름`,{exact:true}).fill('목록 배정 전 새 기록');await form.getByLabel(before.labels.category,{exact:true}).fill('신규 문의');await form.getByLabel('다음 할 일',{exact:true}).fill('담당 목록 정하기');await form.locator('button[type="submit"]').click();await count(before.records.length+1);
    const after=(await state()).workspaces.find(w=>w.id===id),added=after.records.find(r=>r.name==='목록 배정 전 새 기록');expect(added.category).toBe('신규 문의');expect(added.nextAction).toBe('담당 목록 정하기');expect(JSON.stringify(after.entries)).toBe(entriesBefore);await page.reload();await count(before.records.length+1);
   }
  });
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.setDefaultTimeout(7000);mobile.on('pageerror',e=>errors.push(e.message));
  await test('모바일 5개 공간 전환 및 55종 화면 폭',async()=>{
   await mobile.goto(previewUrl,{waitUntil:'networkidle'});
   for(const id of workspaceIds){await mobile.getByLabel('메뉴 열기').click();await mobile.getByLabel('워크스페이스 전환',{exact:true}).click();await expect(mobile.locator('.workspace-option')).toHaveCount(5);await mobile.locator(`.workspace-option[data-id="${id}"]`).click();for(const type of types){await mobile.getByLabel('11가지 보기 선택').click();await mobile.locator(`.layout-option[data-layout="${type}"]`).click();expect(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}}
   for(const [id,type]of [['realestate','gallery'],['insurance','list'],['commerce','gallery']]){await mobile.getByLabel('메뉴 열기').click();await mobile.getByLabel('워크스페이스 전환',{exact:true}).click();await mobile.locator(`.workspace-option[data-id="${id}"]`).click();await mobile.getByLabel('11가지 보기 선택').click();await mobile.locator(`.layout-option[data-layout="${type}"]`).click();await mobile.screenshot({path:previewRoot+id+'-mobile.png',animations:'disabled'});}
  });
  for(const id of workspaceIds){await workspace(id);await reset();await page.screenshot({path:previewRoot+id+'-workspace.png',animations:'disabled'});}
  await page.locator('.view-explorer').click();await page.screenshot({path:previewRoot+'view-types-eleven.png',animations:'disabled'});
  reports.push({name:'브라우저 JavaScript 오류',pass:!errors.length,errors});
  fs.writeFileSync(previewRoot+'qa-results.json',JSON.stringify(reports,null,2));console.log(JSON.stringify({passed:reports.filter(r=>r.pass).length,total:reports.length,errors}));
 }finally{await browser.close();}
 if(reports.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
