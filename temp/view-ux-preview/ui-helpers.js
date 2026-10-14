"use strict";

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('ko-KR').format(Number(v)||0);
const compact=v=>Math.abs(Number(v))>=100000000?`${(Number(v)/100000000).toLocaleString('ko-KR',{maximumFractionDigits:2})}억`:Math.abs(Number(v))>=10000?`${(Number(v)/10000).toLocaleString('ko-KR',{maximumFractionDigits:1})}만`:money(v);
const shortDate=v=>v?`${Number(String(v).slice(5,7))}.${Number(String(v).slice(8,10))}`:'날짜 없음';
const isoDay=date=>date.toISOString().slice(0,10);
const addDays=(date,days)=>isoDay(new Date(new Date(date+'T00:00:00Z').getTime()+days*86400000));
const daysBetween=(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/86400000);
const visibleProps=(ws,view)=>view.props.filter(p=>!p.hidden&&getField(ws,p.fieldId,view.sourceId));
function avatar(ws,id,large=false){const person=ws.owners.find(o=>o.id===id);return person?`<span class="avatar ${large?'large':''}" style="background:${person.color}" title="${esc(person.label)}">${esc(person.initials)}</span>`:'<span class="avatar unassigned" title="담당자 미지정">—</span>';}
function mark(ws,record,small=false){const entity=record.companyName?record:entityFor(ws,record);return `<span class="company-mark ${small?'small':''}" style="background:${entity?.color||ws.tint}">${esc(entity?.initial||record.name?.[0]||'+')}</span>`;}
function display(ws,record,fieldId,view,prop={}){
 const field=getField(ws,fieldId,view.sourceId),raw=value(ws,record,fieldId,view.sourceId);
 if(fieldId==='company'){const related=entityFor(ws,record);return related?`<span class="company-chip">${mark(ws,related,true)}${esc(related.companyName)}</span>`:'<span class="cell-muted">미지정</span>';}
 if(field?.type==='status'){const option=field.options.find(o=>o.id===raw);return option?`<span class="pill" style="background:${option.tint};color:${option.color}"><span class="stage-dot" style="background:${option.color}"></span>${esc(option.label)}</span>`:'<span class="cell-muted">미지정</span>';}
 if(field?.type==='person')return `${avatar(ws,raw)}<span>${esc(field.options.find(o=>o.id===raw)?.label||'미지정')}</span>`;
 if(field?.type==='multiselect')return `<span class="pills">${(Array.isArray(raw)?raw:[]).map(v=>`<span class="pill tag-pill">${esc(v)}</span>`).join('')||'<span class="cell-muted">—</span>'}</span>`;
 if(field?.type==='currency'){
  if(ws.id==='realestate'&&fieldId==='amount'&&record.monthlyRent)return `<span class="cell-money">보증금 ${compact(record.deposit)} / 월 ${compact(record.monthlyRent)}원</span>`;
  return raw!==''&&raw!=null?`<span class="cell-money">${money(raw)}${prop.decimals?'.00':''}원</span>`:'<span class="cell-muted">—</span>';
 }
 if(field?.type==='date')return raw?`${shortDate(raw)}`:'<span class="cell-muted">날짜 없음</span>';
 if(fieldId==='progress')return `<span class="progress-value"><span style="width:${Math.max(0,Math.min(100,Number(raw)||0))}%"></span></span><span>${money(raw)}%</span>`;
 if(fieldId==='area')return `${money(raw)}㎡`;
 return `<span class="${fieldId==='domain'&&field?.icon==='link'?'cell-link':''}">${esc(labelValue(ws,record,fieldId,view.sourceId))||'<span class="cell-muted">—</span>'}</span>`;
}
function editor(ws,record,fieldId,sourceId,action='detail-value'){
 const field=getField(ws,fieldId,sourceId);if(!field)return '';
 const raw=fieldId==='company'?record.companyId:value(ws,record,fieldId,sourceId);
 const attrs=`data-action="${action}" data-id="${record.id}" data-field="${fieldId}" data-source="${sourceId}" aria-label="${esc(field.label)}"`;
 const items=fieldId==='company'?ws.entities.map(e=>({id:e.id,label:e.companyName})):field.options;
 if(items)return `<select ${attrs}><option value="">미지정</option>${items.map(o=>`<option value="${esc(o.id)}" ${o.id===raw?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
 return `<input ${attrs} type="${['currency','number'].includes(field.type)?'number':field.type==='date'?'date':'text'}" ${field.type==='number'?'step="any"':''} value="${esc(Array.isArray(raw)?raw.join(', '):raw)}">`;
}
const detailButton=(record,sourceId,className='')=>`<button class="${className}" data-action="detail" data-id="${record.id}" data-source="${sourceId}">${esc(record.name||record.companyName)}</button>`;
function coverArt(ws,record){
 const color=entityFor(ws,record)?.color||ws.tint;
 if(['insurance','commerce'].includes(ws.id))return `<div class="customer-cover"><div class="customer-cover-head">${icon(ws.icon,17)}${esc(record.category||ws.labels.record)}</div><strong>${esc(entityFor(ws,record)?.companyName||'새 고객')}</strong><p>${esc(record.product||record.nextAction||ws.description)}</p><small>${esc(record.tags?.join(' · ')||ws.team)}</small></div>`;
 if(ws.id==='realestate'){
  const kind=record.cover||'apartment';
  const windows=Array.from({length:kind==='house'?8:24},(_,i)=>`<rect x="${82+i%6*30}" y="${kind==='house'?96+Math.floor(i/6)*30:54+Math.floor(i/6)*31}" width="15" height="20" rx="1" fill="${i%4===0?'#edddbc':'#9ab3b2'}"/>`).join('');
  return `<svg viewBox="0 0 360 190" class="cover-art" role="img" aria-label="${esc(record.category||'매물')} 예시 일러스트"><rect width="360" height="190" fill="#dce9e7"/><path d="M0 120Q80 90 145 116T360 93V190H0Z" fill="#c4d7c5"/><circle cx="289" cy="40" r="23" fill="#f8eccd"/><path d="M0 173H360" stroke="#b7cac5" stroke-width="30"/><rect x="66" y="${kind==='house'?82:34}" width="208" height="142" fill="#edf0e8"/><path d="M66 ${kind==='house'?82:34}h208l19 18v124h-19V${kind==='house'?82:34}" fill="#c4d1cc"/>${kind==='house'?'<path d="m48 84 122-58 122 58H48Z" fill="#93aaa0"/>':''}${windows}<rect x="166" y="139" width="27" height="37" fill="#a9b9b3"/><path d="M50 58v118M309 102v74" stroke="#869f8b" stroke-width="5"/><circle cx="50" cy="57" r="29" fill="#aac1aa"/><circle cx="309" cy="102" r="24" fill="#b3c8ac"/></svg>`;
 }
 if(ws.id==='marketing')return `<div class="creative-cover creative-${esc(record.cover||'tech')}" style="--creative-tint:${color}"><span>${esc(entityFor(ws,record)?.companyName||'CAMPAIGN')}</span><strong>${esc(record.category||'CREATIVE')}<br><i>${esc(record.tags?.[0]||'New ideas')}</i></strong><div class="creative-orb"></div><span class="creative-caption">${esc(record.tags?.[1]||'2026 · AUTUMN')}</span></div>`;
 return `<div class="opportunity-cover" style="background:${color}"><span>${mark(ws,record)}</span><strong>${esc(entityFor(ws,record)?.companyName||'새로운 기회')}</strong><small>${esc(record.category||'함께 만드는 다음 기회')}</small><div class="cover-circle"></div></div>`;
}
