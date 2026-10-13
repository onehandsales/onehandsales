export const STORAGE_KEY = 'onehandcrm-view-ux-preview-v1';
export const stages = [
  { id:'new', label:'신규', color:'#98a2b3', tint:'#f2f4f7' },
  { id:'proposal', label:'제안', color:'#f0b429', tint:'#fff8e3' },
  { id:'negotiation', label:'협상', color:'#7f6ae8', tint:'#f2efff' },
  { id:'won', label:'계약', color:'#23a37d', tint:'#e8f7f0' },
  { id:'hold', label:'보류', color:'#e17e88', tint:'#fff0f1' },
];
export const owners = [
  { id:'jason', label:'송재근', initials:'JS', color:'#e7e8fe' },
  { id:'min', label:'김민서', initials:'MK', color:'#ffe9d8' },
  { id:'jun', label:'박준호', initials:'JP', color:'#dff2eb' },
];
export const layouts = [
  { id:'table', label:'표', icon:'table', description:'정보를 한눈에 비교하고 수정해요.' },
  { id:'board', label:'보드', icon:'board', description:'업무의 진행 단계를 살펴봐요.' },
  { id:'chart', label:'차트', icon:'chart', description:'숫자와 흐름을 시각적으로 확인해요.' },
  { id:'timeline', label:'타임라인', icon:'timeline', description:'일정과 업무 사이의 연결을 확인해요.' },
];
const initialFields = [
  { id:'name', label:'영업 기회', type:'text', icon:'text', source:'업무 정보', scopes:['pipeline','sales'] },
  { id:'company', label:'고객사', type:'relation', icon:'company', source:'연결된 회사 정보', scopes:['pipeline','sales'] },
  { id:'industry', label:'고객사 업종', type:'multiselect', icon:'layers', source:'연결된 회사 정보', scopes:['pipeline','sales'] },
  { id:'amount', label:'예상 매출', type:'currency', icon:'number', source:'업무 정보', scopes:['pipeline','sales'] },
  { id:'stage', label:'영업 단계', type:'status', icon:'board', source:'이 목록의 정보', scopes:['pipeline'], options:stages },
  { id:'owner', label:'담당자', type:'person', icon:'people', source:'이 목록의 정보', scopes:['pipeline'], options:owners },
  { id:'start', label:'시작일', type:'date', icon:'date', source:'업무 정보', scopes:['pipeline','sales'] },
  { id:'end', label:'예정일', type:'date', icon:'date', source:'업무 정보', scopes:['pipeline','sales'] },
  { id:'companyName', label:'회사', type:'text', icon:'company', source:'회사 정보', scopes:['companies'] },
  { id:'domain', label:'웹사이트', type:'text', icon:'link', source:'회사 정보', scopes:['companies'] },
  { id:'companyIndustry', label:'업종', type:'multiselect', icon:'layers', source:'회사 정보', scopes:['companies'] },
  { id:'contact', label:'담당 연락처', type:'text', icon:'people', source:'회사 정보', scopes:['companies'] },
];
export const newId = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
const props = ids => ids.map((id,i) => ({ fieldId:id, hidden:false, label:null, role:i === 0 ? 'TITLE' : 'BODY', width:i === 0 ? 280 : 180 }));
const makeView = (id,name,layout,sourceId,fieldIds) => ({
  id,name,layout,sourceId,props:props(fieldIds),filter:{id:newId('group'),operator:'AND',rules:[]},sorts:[],groupBy:'stage',groupOrder:stages.map(s=>s.id),groupSettings:{},
});
export function initialState() {
  const companies = [
    {id:'c1',companyName:'모노랩',domain:'monolab.co',companyIndustry:['SaaS','IT'],contact:'김하윤',color:'#e5e4fa',initial:'M'},
    {id:'c2',companyName:'그린바이트',domain:'greenbyte.kr',companyIndustry:['유통','친환경'],contact:'이서준',color:'#dceee5',initial:'G'},
    {id:'c3',companyName:'아틀라스 스튜디오',domain:'atlas.studio',companyIndustry:['디자인','콘텐츠'],contact:'정소연',color:'#ffe5df',initial:'A'},
    {id:'c4',companyName:'넥스트웨이브',domain:'nextwave.io',companyIndustry:['IT','금융'],contact:'최지우',color:'#e0ecff',initial:'N'},
    {id:'c5',companyName:'오브제웍스',domain:'objet.works',companyIndustry:['제조','리빙'],contact:'박도윤',color:'#f4ead9',initial:'O'},
    {id:'c6',companyName:'스테이폴리오',domain:'stayfolio.com',companyIndustry:['여행','숙박'],contact:'한유진',color:'#f5dfe9',initial:'S'},
    {id:'c7',companyName:'온리그로우',domain:'onlygrow.kr',companyIndustry:['교육','SaaS'],contact:'윤수빈',color:'#e2efda',initial:'O'},
    {id:'c8',companyName:'브릭커머스',domain:'brick.com',companyIndustry:['유통','IT'],contact:'김시우',color:'#e6edf4',initial:'B'},
  ];
  const deals = [
    {id:'d1',name:'모노랩 연간 CRM 도입',companyId:'c1',amount:24000000,stage:'proposal',owner:'jason',start:'2026-10-08',end:'2026-10-20',notes:'업무 팀 3곳에서 함께 사용할 예정입니다. 다음 미팅에서 도입 일정을 확인하세요.'},
    {id:'d2',name:'그린바이트 운영 시스템',companyId:'c2',amount:18000000,stage:'negotiation',owner:'min',start:'2026-10-05',end:'2026-10-17',notes:'최종 견적을 전달했습니다. 담당자의 피드백을 기다리는 중입니다.'},
    {id:'d3',name:'아틀라스 신규 파트너십',companyId:'c3',amount:6500000,stage:'new',owner:'jun',start:'2026-10-13',end:'2026-10-25',notes:''},
    {id:'d4',name:'넥스트웨이브 팀 확장',companyId:'c4',amount:32000000,stage:'proposal',owner:'jason',start:'2026-10-12',end:'2026-10-28',notes:'기존 계약의 확장 건입니다. 연간 계약 조건을 제안했습니다.'},
    {id:'d5',name:'오브제웍스 B2B 공급',companyId:'c5',amount:12000000,stage:'won',owner:'min',start:'2026-10-03',end:'2026-10-12',notes:'계약이 완료되었습니다. 온보딩 일정을 준비하세요.'},
    {id:'d6',name:'스테이폴리오 고객 관리',companyId:'c6',amount:9600000,stage:'proposal',owner:'jun',start:'2026-10-10',end:'2026-10-22',notes:''},
    {id:'d7',name:'온리그로우 시범 도입',companyId:'c7',amount:4800000,stage:'new',owner:'jason',start:'2026-10-14',end:'2026-10-26',notes:''},
    {id:'d8',name:'브릭커머스 연간 갱신',companyId:'c8',amount:21000000,stage:'negotiation',owner:'min',start:'2026-10-07',end:'2026-10-19',notes:''},
    {id:'d9',name:'모노랩 추가 라이선스',companyId:'c1',amount:3800000,stage:'hold',owner:'jun',start:'2026-10-16',end:'2026-10-28',notes:'팀 예산 확정 후 다시 논의하기로 했습니다.'},
    {id:'d10',name:'넥스트웨이브 기술 검토',companyId:'c4',amount:800000,stage:'new',owner:'jason',start:'2026-10-06',end:'2026-10-14',notes:''},
    {id:'d11',name:'온리그로우 정식 계약',companyId:'c7',amount:15000000,stage:'negotiation',owner:'jason',start:'2026-10-20',end:'2026-10-31',notes:''},
  ];
  const views = [
    makeView('view_table','전체 영업','table','pipeline',['name','company','amount','stage','owner','end']),
    makeView('view_board','단계별 보드','board','pipeline',['name','company','amount']),
    makeView('view_chart','매출 분석','chart','pipeline',['name','amount']),
    makeView('view_timeline','영업 일정','timeline','pipeline',['name','company','start','end']),
    makeView('view_companies','전체 회사','table','companies',['companyName','domain','companyIndustry','contact']),
    makeView('view_sales','전체 영업 기회','table','sales',['name','company','amount','start','end']),
  ];
  views[1].sorts=[{id:'sort_amount',fieldId:'amount',direction:'DESC'}];
  return structuredClone({version:1,companies,deals,fields:initialFields,views,activeView:'view_board',sourceId:'pipeline',dependencies:[{id:'dep1',sourceId:'d7',targetId:'d11',type:'FS',offset:0,unit:'DAY'}],widgets:[{id:'w1',viewId:'view_board',title:'지금 진행 중인 영업',wide:true},{id:'w2',viewId:'view_chart',title:'단계별 예상 매출',wide:false},{id:'w3',viewId:'view_table',title:'영업 목록',wide:false}]});
}
export function loadState() {
  try { const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)); if(stored?.version===1 && stored.views?.length) return stored; } catch {}
  return initialState();
}
export function getField(state,id) { return state.fields.find(f=>f.id===id); }
export function getFields(state,view) { return state.fields.filter(f=>f.scopes.includes(view.sourceId)); }
export function companyFor(state,record) { return state.companies.find(c=>c.id===record.companyId); }
export function rawValue(state,record,fieldId) {
  if(fieldId==='company') return companyFor(state,record)?.companyName || '';
  if(fieldId==='industry') return companyFor(state,record)?.companyIndustry || [];
  return record[fieldId] ?? '';
}
export function labelValue(state,record,fieldId) {
  const field=getField(state,fieldId), value=rawValue(state,record,fieldId);
  if(field?.options) return field.options.find(o=>o.id===value)?.label || '';
  if(Array.isArray(value)) return value.join(', ');
  return String(value);
}
export function setValue(state,record,fieldId,value) {
  if(fieldId==='company') { record.companyId=value; return; }
  if(fieldId==='industry') { const company=companyFor(state,record); if(company) company.companyIndustry=Array.isArray(value)?value:String(value).split(',').map(s=>s.trim()).filter(Boolean); return; }
  const field=getField(state,fieldId);
  if(field?.type==='currency'||field?.type==='number') record[fieldId]=value===''?null:Number(value);
  else if(field?.type==='multiselect') record[fieldId]=Array.isArray(value)?value:String(value).split(',').map(s=>s.trim()).filter(Boolean);
  else record[fieldId]=value;
}
export function ruleMatches(state,record,rule) {
  if(rule.rules) {
    if(!rule.rules.length) return true;
    return rule.operator==='OR' ? rule.rules.some(r=>ruleMatches(state,record,r)) : rule.rules.every(r=>ruleMatches(state,record,r));
  }
  const raw=rawValue(state,record,rule.fieldId);
  const compare=value=>{
    const a=String(value??'').toLowerCase(), b=String(rule.value??'').toLowerCase();
    if(rule.op==='empty') return !a;
    if(rule.op==='notempty') return !!a;
    if(rule.op==='gte') return Number(value)>=Number(rule.value);
    if(rule.op==='lte') return Number(value)<=Number(rule.value);
    if(rule.op==='contains') return a.includes(b);
    if(rule.op==='neq') return a!==b;
    return a===b;
  };
  if(Array.isArray(raw)) return rule.matchMode==='ALL'?raw.length>0&&raw.every(compare):raw.some(compare);
  return compare(raw);
}
export function findRule(group,id) {
  if(group.id===id) return group;
  for(const rule of group.rules||[]) { if(rule.id===id) return rule; if(rule.rules) { const found=findRule(rule,id); if(found) return found; } }
  return null;
}
export function removeRule(group,id) {
  group.rules=group.rules.filter(r=>r.id!==id);
  group.rules.forEach(r=>{if(r.rules) removeRule(r,id);});
}
export function ruleCount(group) { return (group.rules||[]).reduce((n,r)=>n+(r.rules?ruleCount(r):1),0); }
export function recordsFor(state,view,search='') {
  let records=(view.sourceId==='companies'?state.companies:state.deals).filter(r=>ruleMatches(state,r,view.filter));
  if(search) records=records.filter(r=>[r.name,r.companyName,companyFor(state,r)?.companyName].some(v=>String(v||'').toLowerCase().includes(search.toLowerCase())));
  return [...records].sort((a,b)=>{
    for(const sort of view.sorts) {
      const field=getField(state,sort.fieldId);
      let av=rawValue(state,a,sort.fieldId),bv=rawValue(state,b,sort.fieldId);
      let result=['currency','number'].includes(field?.type)?Number(av||0)-Number(bv||0):labelValue(state,a,sort.fieldId).localeCompare(labelValue(state,b,sort.fieldId),'ko');
      if(result) return sort.direction==='DESC'?-result:result;
    }
    return 0;
  });
}
export function boardGroups(state,view) {
  const field=getField(state,view.groupBy);
  const options=field?.options||stages;
  const order=[...view.groupOrder.filter(id=>options.some(o=>o.id===id)),...options.map(o=>o.id).filter(id=>!view.groupOrder.includes(id))];
  return order.map(id=>({...options.find(o=>o.id===id),...(view.groupSettings[id]||{})}));
}
export function newView(state,name,layout,sourceId) {
  const ids=sourceId==='companies'?['companyName','domain','companyIndustry','contact']:layout==='board'?['name','company','amount']:['name','company','amount','stage','owner','end'].filter(id=>getField(state,id)?.scopes.includes(sourceId));
  const view=makeView(newId('view'),name,layout,sourceId,ids);
  state.views.push(view);state.activeView=view.id;return view;
}
