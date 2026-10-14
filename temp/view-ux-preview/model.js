"use strict";

const STORAGE_KEY = 'onehandcrm-view-ux-preview-v2';
const LEGACY_STORAGE_KEY = 'onehandcrm-view-ux-preview-v1';
// UI 목업의 11종 목록입니다. CSV에 없는 DB enum 이름을 확정하지 않습니다.
const layouts = [
  {id:'table',label:'표',icon:'table',description:'여러 정보를 비교하고 바로 수정해요.'},
  {id:'board',label:'칸반',icon:'board',description:'단계별로 모으고 카드를 옮겨 진행해요.'},
  {id:'list',label:'리스트',icon:'list',description:'중요한 기록을 간결하게 살펴봐요.'},
  {id:'gallery',label:'갤러리',icon:'gallery',description:'매물과 캠페인을 카드로 둘러봐요.'},
  {id:'calendar',label:'캘린더',icon:'date',description:'날짜별 약속과 마감일을 확인해요.'},
  {id:'timeline',label:'타임라인',icon:'timeline',description:'기록별 시작과 끝을 나란히 살펴봐요.'},
  {id:'gantt',label:'간트',icon:'gantt',description:'일정과 선행 업무의 연결을 확인해요.'},
  {id:'chart',label:'차트',icon:'chart',description:'금액과 건수의 분포를 확인해요.'},
  {id:'pivot',label:'피벗',icon:'pivot',description:'두 기준을 교차해 숫자를 집계해요.'},
  {id:'map',label:'지도',icon:'pin',description:'기록의 위치를 지도에서 찾아봐요.'},
  {id:'dashboard',label:'대시보드',icon:'dashboard',description:'필요한 보기를 한 화면에 모아요.'},
];
const chartStyles=[{id:'bar',label:'막대'},{id:'line',label:'선'},{id:'pie',label:'원형'},{id:'donut',label:'도넛'},{id:'area',label:'영역'}];
const newId=prefix=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
const activeWorkspace=store=>store.workspaces.find(w=>w.id===store.activeWorkspaceId)||store.workspaces[0];
const sourceFor=(ws,id)=>ws.sources.find(s=>s.id===id);
const entityFor=(ws,record)=>ws.entities.find(e=>e.id===record.companyId);
const recordFor=(ws,id)=>ws.records.find(r=>r.id===id)||ws.entities.find(e=>e.id===id);
const layoutFor=id=>layouts.find(l=>l.id===id);

function fieldsFor(seed){
 const l=seed.labels,scopes=['records','pipeline','secondary'];
 const field=(id,label,type,icon='text',extra={})=>({id,label,type,icon,source:'기본 정보',scopes,...extra});
 const fields=[
  field('name',l.record,'text'),field('company',l.entity,'relation',seed.entityIcon||'company',{source:`연결된 ${l.entity} 정보`}),
  field('industry',l.entityCategory,'multiselect','layers',{source:`연결된 ${l.entity} 정보`}),
  field('amount',l.amount,'currency','number'),field('category',l.category,'text','layers'),
  field('stage',l.stage,'status','board',{scopes:['pipeline','secondary'],source:'이 목록의 정보',scope:'LIST_ENTRY',options:seed.stages}),
  field('owner','담당자','person','people',{scopes:['pipeline','secondary'],source:'이 목록의 정보',scope:'LIST_ENTRY',options:seed.owners}),
  field('start','시작일','date','date'),field('end',l.end,'date','date'),
  field('progress','진행률','number','progress'),field('priority','우선순위','text','flag'),
  field('location',l.location,'text','pin'),field('lat','위도','number','pin'),field('lng','경도','number','pin'),field('tags','태그','multiselect','tag'),
  field('companyName',l.entity,'text',seed.entityIcon||'company',{scopes:['companies'],source:`${l.entity} 정보`}),
  field('domain',l.entityNote||(seed.id==='realestate'?'고객 메모':'웹사이트'),'text',l.entityNote?'text':'link',{scopes:['companies']}),
  field('companyIndustry',l.entityTags||(seed.id==='realestate'?'관심 유형':seed.id==='marketing'?'브랜드 분야':'업종'),'multiselect','layers',{scopes:['companies']}),
  field('contact',l.entityContact||(seed.id==='realestate'?'상담 요청':'연락 담당자'),'text','people',{scopes:['companies']}),
 ];
 if(seed.id==='realestate')fields.push(field('dealType','거래 유형','text','tag'),field('area','전용 면적 · ㎡','number','area'),field('rooms','방 수','number'),field('floor','층수','text','home'),field('deposit','보증금','currency','number'),field('monthlyRent','월세','currency','number'));
 if(seed.id==='marketing')fields.push(field('spend','집행 금액','currency','number'),field('impressions','노출 수','number','eye'),field('leads','리드 수','number','people'));
 fields.push(...(seed.extraFields||[]).map(f=>field(f.id,f.label,f.type,f.icon)));
 return fields;
}
function getField(ws,id,sourceId){const field=ws.fields.find(f=>f.id===id);if(!field)return null;const source=sourceFor(ws,sourceId);return source?.fieldOverrides?.[id]?{...field,...source.fieldOverrides[id]}:field;}
const getFields=(ws,view)=>ws.fields.filter(f=>f.scopes.includes(view.sourceId)).map(f=>getField(ws,f.id,view.sourceId));
function value(ws,record,fieldId,sourceId){
 if(fieldId==='company')return entityFor(ws,record)?.companyName||'';
 if(fieldId==='industry')return entityFor(ws,record)?.companyIndustry||[];
 const field=getField(ws,fieldId,sourceId);
 if(field?.scope==='LIST_ENTRY'&&sourceFor(ws,sourceId)?.type==='LIST')return ws.entries[sourceId]?.[record.id]?.[fieldId]??'';
 return record[fieldId]??'';
}
function labelValue(ws,record,fieldId,sourceId){const raw=value(ws,record,fieldId,sourceId),field=getField(ws,fieldId,sourceId);if(field?.options)return field.options.find(o=>o.id===raw)?.label||'미지정';return Array.isArray(raw)?raw.join(', '):String(raw);}
function setValue(ws,record,fieldId,raw,sourceId){
 if(fieldId==='company'){record.companyId=raw;return;}
 if(fieldId==='industry'){const related=entityFor(ws,record);if(related)related.companyIndustry=String(raw).split(',').map(s=>s.trim()).filter(Boolean);return;}
 const field=getField(ws,fieldId,sourceId);
 const target=field?.scope==='LIST_ENTRY'&&sourceFor(ws,sourceId)?.type==='LIST'?(ws.entries[sourceId][record.id]||={}):record;
 if(['currency','number'].includes(field?.type))target[fieldId]=raw===''?null:Number(raw);
 else if(field?.type==='multiselect')target[fieldId]=String(raw).split(',').map(s=>s.trim()).filter(Boolean);
 else target[fieldId]=raw;
}
function makeView(ws,name,layout,sourceId){
 const available=ws.fields.filter(f=>f.scopes.includes(sourceId)).map(f=>f.id);
 let ids=sourceId==='companies'?['companyName','domain','companyIndustry','contact']:ws.tableFields||['name','company','amount',...(ws.id==='realestate'?['category','area']:[]),'stage','owner','end'];
 if(sourceId!=='companies'&&['board','gallery','list'].includes(layout))ids=ws.cardFields||['name','company','amount',...(ws.id==='realestate'?['area','location']:ws.id==='marketing'?['category']:[]),'end'];
 return {id:newId('view'),name,layout,sourceId:layout==='dashboard'?null:sourceId,
  props:ids.filter(id=>available.includes(id)).map((fieldId,i)=>({fieldId,hidden:false,role:i===0?'TITLE':'BODY',width:i===0?280:fieldId==='location'?240:170})),
  filter:{id:newId('group'),operator:'AND',rules:[]},sorts:[],groupBy:'stage',groupOrder:ws.stages.map(s=>s.id),groupSettings:{},
  dateField:'end',startField:'start',endField:'end',chartStyle:'bar',chartGroup:'stage',measure:'amount',aggregate:'sum',
  pivotRow:'owner',pivotColumn:'stage',mapZoom:1,showLabels:false,widgets:[]};
}
function createWorkspace(seed){
 const ws={...structuredClone(seed),records:structuredClone(seed.records),entities:structuredClone(seed.entities),fields:fieldsFor(seed),sources:[],entries:{},views:[],activeView:null};
 ws.sources=[
  {id:'records',name:seed.labels.mainObject,type:'OBJECT',icon:seed.icon},
  {id:'companies',name:seed.labels.entity,type:'OBJECT',icon:seed.entityIcon||(seed.id==='realestate'?'people':'company')},
  {id:'pipeline',name:seed.labels.primaryList,type:'LIST',icon:'layers'},
  {id:'secondary',name:seed.labels.secondaryList,type:'LIST',icon:'check',fieldOverrides:{stage:{label:seed.labels.secondaryStage,options:stageOptions(seed.labels.secondaryStages)}}},
 ];
 ws.entries.pipeline=Object.fromEntries(ws.records.filter(r=>!seed.primaryIds||seed.primaryIds.includes(r.id)).map(r=>[r.id,{stage:r.stage,owner:r.owner}]));
 ws.entries.secondary=Object.fromEntries(seed.secondaryIds.map((id,i)=>[id,{stage:['proposal','negotiation','new','won'][i%4],owner:ws.records.find(r=>r.id===id)?.owner||'jason'}]));
 ws.views=layouts.map(layout=>{
  const view=makeView(ws,seed.viewNames[layout.id],layout.id,'pipeline');view.id=`${seed.id}_${layout.id}`;
  if(['board','gallery'].includes(layout.id))view.sorts=[{id:newId('sort'),fieldId:'amount',direction:'DESC'}];
  if(seed.id==='realestate'&&['chart','pivot'].includes(layout.id)){view.aggregate='count';view.chartGroup='category';view.pivotRow='category';}
  if(seed.id==='marketing'&&layout.id==='pivot')view.pivotRow='category';
  if(seed.id==='sales'&&layout.id==='list')view.filter.rules=[{id:newId('condition'),fieldId:'end',op:'gte',value:'2026-10-12'},{id:newId('condition'),fieldId:'end',op:'lte',value:'2026-10-18'},{id:newId('condition'),fieldId:'stage',op:'neq',value:'won'}];
  const defaults=seed.viewDefaults?.[layout.id];
  if(defaults){const {conditions,sorts,...settings}=defaults;Object.assign(view,structuredClone(settings));if(sorts)view.sorts=sorts.map(s=>({id:newId('sort'),...s}));if(conditions)view.filter.rules=conditions.map(r=>({id:newId('condition'),...r}));}
  return view;
 });
 ws.views.push(makeView(ws,`전체 ${seed.labels.mainObject}`,'table','records'),makeView(ws,`전체 ${seed.labels.entity}`,'table','companies'),makeView(ws,seed.labels.secondaryList,'board','secondary'),makeView(ws,`${seed.labels.secondaryList} 일정`,'calendar','secondary'));
 if(seed.secondaryDateField)ws.views.find(v=>v.sourceId==='secondary'&&v.layout==='calendar').dateField=seed.secondaryDateField;
 const dashboard=ws.views.find(v=>v.layout==='dashboard');
 dashboard.widgets=[{id:newId('widget'),viewId:`${seed.id}_board`,title:seed.id==='marketing'?'현재 캠페인 진행 상황':seed.labels.primaryList,wide:true},{id:newId('widget'),viewId:`${seed.id}_chart`,title:seed.viewNames.chart,wide:false},{id:newId('widget'),viewId:`${seed.id}_list`,title:'다음 일정',wide:false}];
 ws.activeView=`${seed.id}_${seed.defaultLayout}`;return ws;
}
function initialStore(){return {version:2,activeWorkspaceId:'sales',workspaces:workspaceSeeds.map(createWorkspace)};}
function loadStore(){
 try{
  const stored=JSON.parse(localStorage.getItem(STORAGE_KEY));
  if(stored?.version===2&&Array.isArray(stored.workspaces)&&stored.workspaces.length){
   // 워크스페이스가 늘어나도 기존 기록과 사용자 보기 설정은 그대로 이어갑니다.
   for(const seed of workspaceSeeds)if(!stored.workspaces.some(w=>w.id===seed.id))stored.workspaces.push(createWorkspace(seed));
   if(!stored.workspaces.some(w=>w.id===stored.activeWorkspaceId))stored.activeWorkspaceId=stored.workspaces[0].id;
   return stored;
  }
 }catch{}
 const store=initialStore();
 // 기존 목업에서 입력한 영업 데이터와 보기 설정을 새 영업 공간으로 옮깁니다.
 try{const old=JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));if(old?.version===1&&Array.isArray(old.deals)){
  const ws=store.workspaces[0];ws.records=old.deals.map(r=>({...ws.records.find(seed=>seed.id===r.id),...r}));ws.entities=old.companies||ws.entities;
  ws.entries.pipeline=Object.fromEntries(ws.records.map(r=>[r.id,{stage:r.stage,owner:r.owner}]));
  ws.entries.secondary=Object.fromEntries(Object.entries(ws.entries.secondary).filter(([id])=>ws.records.some(r=>r.id===id)));
  for(const field of old.fields||[]){
   const index=ws.fields.findIndex(f=>f.id===field.id),existing=index>=0?ws.fields[index]:{};
   const migrated={...existing,...field,scopes:[...new Set([...(existing.scopes||[]),...(field.scopes||['pipeline']).map(s=>s==='sales'?'records':s)])]};
   if(index>=0)ws.fields[index]=migrated;else ws.fields.push(migrated);
  }
  for(const view of old.views||[]){if(!layouts.some(l=>l.id===view.layout))continue;const sourceId=view.sourceId==='sales'?'records':view.sourceId;const migrated={...makeView(ws,view.name,view.layout,sourceId),...view,sourceId};const index=ws.views.findIndex(v=>v.layout===view.layout&&v.sourceId===sourceId);if(index>=0)ws.views[index]=migrated;else ws.views.push(migrated);}
  if(old.dependencies)ws.dependencies=old.dependencies;
  const dashboard=ws.views.find(v=>v.layout==='dashboard');dashboard.widgets=(old.widgets||[]).filter(w=>ws.views.some(v=>v.id===w.viewId)).map(w=>({...w}));
  if(old.activeView==='dashboard')ws.activeView=dashboard.id;
  else if(ws.views.some(v=>v.id===old.activeView))ws.activeView=old.activeView;
 }}catch{}
 return store;
}
function ruleMatches(ws,record,rule,sourceId){
 if(rule.rules)return !rule.rules.length||(rule.operator==='OR'?rule.rules.some(r=>ruleMatches(ws,record,r,sourceId)):rule.rules.every(r=>ruleMatches(ws,record,r,sourceId)));
 const raw=value(ws,record,rule.fieldId,sourceId),compare=x=>{const a=String(x??'').toLocaleLowerCase(),b=String(rule.value??'').toLocaleLowerCase();if(rule.op==='empty')return !a;if(rule.op==='notempty')return !!a;if(rule.op==='gte')return getField(ws,rule.fieldId)?.type==='date'?a>=b:Number(x)>=Number(rule.value);if(rule.op==='lte')return getField(ws,rule.fieldId)?.type==='date'?a<=b:Number(x)<=Number(rule.value);if(rule.op==='contains')return a.includes(b);if(rule.op==='neq')return a!==b;return a===b;};
 return Array.isArray(raw)?rule.matchMode==='ALL'?raw.length>0&&raw.every(compare):raw.some(compare):compare(raw);
}
function recordsFor(ws,view,search=''){
 if(!view||view.layout==='dashboard')return [];
 const source=sourceFor(ws,view.sourceId),base=view.sourceId==='companies'?ws.entities:source?.type==='LIST'?ws.records.filter(r=>r.id in(ws.entries[view.sourceId]||{})):ws.records;
 const records=base.filter(r=>ruleMatches(ws,r,view.filter,view.sourceId)).filter(r=>!search||[r.name,r.companyName,entityFor(ws,r)?.companyName,r.location].some(v=>String(v||'').toLocaleLowerCase().includes(search.toLocaleLowerCase())));
 return [...records].sort((a,b)=>{for(const sort of view.sorts){const f=getField(ws,sort.fieldId,view.sourceId),av=value(ws,a,sort.fieldId,view.sourceId),bv=value(ws,b,sort.fieldId,view.sourceId),n=['number','currency'].includes(f?.type)?Number(av||0)-Number(bv||0):labelValue(ws,a,sort.fieldId,view.sourceId).localeCompare(labelValue(ws,b,sort.fieldId,view.sourceId),'ko');if(n)return sort.direction==='DESC'?-n:n;}return a.id.localeCompare(b.id);});
}
function groupsFor(ws,view){
 const f=getField(ws,view.groupBy,view.sourceId),records=recordsFor(ws,view),options=f?.options?[...f.options]:[...new Set(records.map(r=>value(ws,r,view.groupBy,view.sourceId)||'미지정'))].map((id,i)=>({id,label:id,color:['#94a3b8','#e5a82e','#8b70db','#28a382'][i%4],tint:'#f4f6fa'}));
 const ordered=[...view.groupOrder.filter(id=>options.some(o=>o.id===id)),...options.map(o=>o.id).filter(id=>!view.groupOrder.includes(id))];
 if(records.some(r=>!value(ws,r,view.groupBy,view.sourceId))&&!options.some(o=>o.id==='')){options.push({id:'',label:'미지정',color:'#94a3b8',tint:'#f1f4f8'});ordered.push('');}
 return ordered.map(id=>({...options.find(o=>o.id===id),...(view.groupSettings[id]||{})}));
}
function findRule(group,id){if(group.id===id)return group;for(const r of group.rules||[]){if(r.id===id)return r;if(r.rules){const f=findRule(r,id);if(f)return f;}}return null;}
function removeRule(group,id){group.rules=group.rules.filter(r=>r.id!==id);group.rules.forEach(r=>{if(r.rules)removeRule(r,id);});}
const ruleCount=group=>(group.rules||[]).reduce((n,r)=>n+(r.rules?ruleCount(r):1),0);
function addRecord(ws,sourceId,data){
 const id=newId(sourceId==='companies'?'entity':'record');
 if(sourceId==='companies')ws.entities.push({id,companyName:data.name,domain:data.domain||'',companyIndustry:[],contact:'',initial:data.name[0],color:'#e8ebf6'});
 else{const record={id,name:data.name,companyId:data.companyId||ws.entities[0]?.id,amount:Number(data.amount)||0,category:data.category||'',start:data.start||'2026-10-13',end:data.end||'2026-10-27',notes:'',tags:[],progress:0};ws.records.push(record);if(sourceFor(ws,sourceId)?.type==='LIST')ws.entries[sourceId][id]={stage:data.stage||'new',owner:data.owner||'jason'};for(const field of ws.extraFields||[])if(data[field.id]!==undefined)setValue(ws,record,field.id,data[field.id],sourceId);}
 return id;
}
