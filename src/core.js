import {PROJECT_ID, TASKS, MATERIAL_SEEDS} from './data.js';

export const MEMBER_IDS = ['a','b','c'];
export const KINDS = ['task_revision','material_revision','offer_revision','session_revision','step_revision','status_revision','material_status_revision','vote','rsvp','worklog','voidlog','expense','member_name','start_date'];
export const PROJECT_SCHEMA = 1;
export const isoNow = () => new Date().toISOString();
export const uid = () => globalThis.crypto?.randomUUID?.() ?? ('id-'+Date.now()+'-'+Math.random().toString(36).slice(2));
const clone = x => JSON.parse(JSON.stringify(x));
export const baseId = (kind,id) => `seed:${kind}:${id}`;
export const seedTask = t => ({id:t.id,title:t.title,section:t.section,week:t.week,room:t.section==='P3'?'Raum 1':t.id==='P4-01'||t.id==='P4-02'?'Hauptwerkstatt':t.id==='P4-03'?'Raum 3':'Alle Räume',priority:t.section==='P1'?'kritisch':'normal',assignees:[...MEMBER_IDS],calendarHours:0,personHours:0,budget:0,due:'',notes:'',expert:!!t.expert,steps:clone(t.steps)});
export const seedMaterial = t => ({id:t.id,title:t.title,phase:t.phase,quantity:1,unit:'Posten',estimate:0,buyer:'',taskId:'',room:'Alle Räume',notes:'',owned:false});
function fixedSessions(){
 const d={};const anchor=new Date('2026-10-26T12:00:00Z');
 for(let week=1;week<=4;week++) for(const [day,label,begin,end,kind] of [[0,'Wochenplanung','', '', 'online'],[1,'Feierabend-Werkstatt','18:30','21:00','werkstatt'],[3,'Feierabend-Werkstatt','18:30','21:00','werkstatt'],[5,'Gemeinsamer Hauptarbeitstag','10:00','16:00','werkstatt']]){
  const when=new Date(anchor);when.setUTCDate(anchor.getUTCDate()+(week-1)*7+day);
  const id=`TER-${week}-${day}`;d[id]={id,title:label,date:when.toISOString().slice(0,10),start:begin,end,kind,week,notes:week===1?'Aufräumen und Bestandsaufnahme':week===2?'Winterfestmachung und Grundbeleuchtung':week===3?'Kleinen Raum renovieren':'Kleinen Raum einrichten'};
 }
 return d;
}
export const allSeeds = {
 task: Object.fromEntries(TASKS.map(t=>[t.id,seedTask(t)])),
 material: Object.fromEntries(MATERIAL_SEEDS.map(t=>[t.id,seedMaterial(t)])),
 session: fixedSessions(),
 offer: {}
};

export function newEvent(kind, entityId, by, data={}, parents=[] , device=''){return {id:uid(),kind,entityId,by,device,at:isoNow(),parents:[...parents],data:clone(data)};}
export function sortEvents(events){return [...events].sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));}
export function entityHeads(events,type,id){
 const kind=`${type}_revision`;
 const revisions=events.filter(e=>e.kind===kind&&e.entityId===id);
 const parentSet = new Set(revisions.flatMap(e=>e.parents));
 const heads = revisions.filter(e=>!parentSet.has(e.id));
 const ids=new Set(revisions.map(e=>e.id));
 const expectedBase=baseId(type,id);
 const missing=[...new Set(revisions.flatMap(e=>e.parents).filter(x=>x!==expectedBase&&!ids.has(x)))];
 if(!revisions.length&&allSeeds[type]?.[id]) return {heads:[{id:expectedBase,data:clone(allSeeds[type][id]),parents:[],at:''}],conflict:false,missing:[]};
 if(!revisions.length) return {heads:[],conflict:false,missing:[]};
 // A branch may be held in a log even if a downstream dependency is missing. Keep it in the conflict queue.
 return {heads:sortEvents(heads),conflict:heads.length!==1||missing.length>0,missing};
}
export function entities(events,type){
 const ids=new Set([...Object.keys(allSeeds[type]||{}),...events.filter(e=>e.kind===`${type}_revision`).map(e=>e.entityId)]);
 return [...ids].map(id=>({id,...entityHeads(events,type,id)})).map(x=>({...x,revision:x.heads.length===1&&!x.missing.length?x.heads[0]:null, data:x.heads.length===1&&!x.missing.length?x.heads[0].data:null})).sort((a,b)=>a.id.localeCompare(b.id));
}
export function latestPerMember(events,kind,entityId,revisionId){
 const map={};for(const e of sortEvents(events.filter(e=>e.kind===kind&&e.entityId===entityId&&(!revisionId||e.data.revisionId===revisionId)))) map[e.by]=e;
 return map;
}
export function votesFor(events,type,entity){
 if(!entity?.revision)return {yes:0,state:'konflikt',votes:{}};
 const votes=latestPerMember(events,'vote',entity.id,entity.revision.id);
 const filtered=Object.fromEntries(Object.entries(votes).filter(([,v])=>v.data.targetType===type));
 const yes=MEMBER_IDS.filter(m=>filtered[m]?.data.choice==='yes').length;
 const no=MEMBER_IDS.some(m=>['no','change'].includes(filtered[m]?.data.choice));
 return {yes,state:no?'rueckfrage':yes===3?'approved':'pending',votes:filtered};
}
export function stepHeads(events,taskId,index){return entityHeads(events,'step',`${taskId}#${index}`);}
export function stepState(events,taskId,index){
 const h=stepHeads(events,taskId,index);if(h.heads.length===0)return {done:false,conflict:false,heads:[]};
 return {done:h.heads.length===1?!!h.heads[0].data.done:false,conflict:h.conflict,heads:h.heads};
}
export function taskStats(events,entity){
 if(!entity.data)return {done:0,total:0,conflict:true};
 const states=entity.data.steps.map((_,i)=>stepState(events,entity.id,i));
 return {done:states.filter(s=>s.done).length,total:states.length,conflict:states.some(s=>s.conflict)};
}
export function recentStatus(events,taskId){
 const heads=entityHeads(events,'status',taskId);
 if(heads.conflict)return 'Konflikt';
 return heads.heads[0]?.data.status??'Offen';
}

export function materialStatus(events,id,owned=false){
 const h=entityHeads(events,'material_status',id);
 if(h.conflict)return 'Konflikt';
 return h.heads[0]?.data.status??(owned?'Vorhanden':'Bedarf');
}
export function logsFor(events,id){
 const voidIds=new Set(events.filter(e=>e.kind==='voidlog').map(e=>e.data.logId));
 return sortEvents(events.filter(e=>e.kind==='worklog'&&(!id||e.data.taskId===id)&&!voidIds.has(e.id)));
}
export function hoursFor(events,id){return logsFor(events,id).reduce((s,e)=>s+Number(e.data.hours||0)*e.data.participants.length,0);}
export function costsFor(events,id){
 const logs=logsFor(events,id).reduce((s,e)=>s+Number(e.data.cost||0),0);
 const mat=events.filter(e=>e.kind==='expense'&&(!id||e.data.taskId===id)).reduce((s,e)=>s+Number(e.data.amount||0),0);
 return logs+mat;
}
export function memberNames(events){
 const names={a:'Person A',b:'Person B',c:'Person C'};
 for(const e of sortEvents(events.filter(e=>e.kind==='member_name'))) if(MEMBER_IDS.includes(e.entityId)&&typeof e.data.name==='string')names[e.entityId]=e.data.name.slice(0,50);
 return names;
}
export function isKleinanzeigenUrl(input){try{const u=new URL(input);return u.protocol==='https:'&&(u.hostname==='kleinanzeigen.de'||u.hostname.endsWith('.kleinanzeigen.de'))&&u.username===''&&u.password===''}catch{return false}}
export function offerTotal(o){return Number(o?.price||0)+Number(o?.shipping||0)}
export function sortedOffers(events,materialId=''){return entities(events,'offer').filter(o=>o.data&&(!materialId||o.data.materialId===materialId)).sort((a,b)=>(a.data.availability==='Nicht verfügbar')-(b.data.availability==='Nicht verfügbar')||offerTotal(a.data)-offerTotal(b.data)||a.id.localeCompare(b.id))}
export function approvalRequest(type,entity,to){if(!['task','material','offer'].includes(type)||!MEMBER_IDS.includes(to)||!entity?.revision||entity.conflict)throw new Error('Nicht freigabefähig.');return {type,id:entity.id,revisionId:entity.revision.id,to}}
export function checkApprovalRequest(req,entity){return !!(req&&['task','material','offer'].includes(req.type)&&MEMBER_IDS.includes(req.to)&&typeof req.id==='string'&&typeof req.revisionId==='string'&&entity&&!entity.conflict&&entity.id===req.id&&entity.revision?.id===req.revisionId)}
export function validateEvent(e){
 if(!e||typeof e!=='object'||!KINDS.includes(e.kind)||typeof e.id!=='string'||e.id.length>120||!e.id||!/^[a-zA-Z0-9:._#-]+$/.test(e.id)||typeof e.entityId!=='string'||e.entityId.length>140||!/^[a-zA-Z0-9:._#-]+$/.test(e.entityId)||!MEMBER_IDS.includes(e.by)||typeof e.at!=='string'||e.at.length>40||!Number.isFinite(Date.parse(e.at))||!Array.isArray(e.parents)||e.parents.length>25||e.parents.some(s=>typeof s!=='string'||s.length>140||!/^[a-zA-Z0-9:._#-]+$/.test(s))||!e.data||typeof e.data!=='object'||Array.isArray(e.data))return false;
 if(e.kind==='vote')return ['task','material','offer'].includes(e.data.targetType)&&typeof e.data.revisionId==='string'&&e.data.revisionId.length<140&&['yes','no','change'].includes(e.data.choice)&&(!e.data.comment||(typeof e.data.comment==='string'&&e.data.comment.length<3000));
 if(e.kind==='step_revision')return typeof e.data.done==='boolean'&&/^.+#\d+$/.test(e.entityId);
 if(e.kind==='status_revision')return ['Offen','Material fehlt','In Arbeit','Blockiert'].includes(e.data.status);
 if(e.kind==='material_status_revision')return ['Bedarf','Geplant','Bestellt','Beschafft','Vorhanden'].includes(e.data.status);
 if(e.kind==='task_revision')return typeof e.data.title==='string'&&e.data.title.length<=160&&Array.isArray(e.data.steps)&&e.data.steps.length>=1&&e.data.steps.length<=150&&e.data.steps.every(x=>typeof x==='string'&&x.length<=600)&&Array.isArray(e.data.assignees)&&e.data.assignees.every(x=>MEMBER_IDS.includes(x))&&Number.isFinite(e.data.budget)&&e.data.budget>=0&&Number.isFinite(e.data.calendarHours)&&e.data.calendarHours>=0&&Number.isFinite(e.data.personHours)&&e.data.personHours>=0;
 if(e.kind==='material_revision')return typeof e.data.title==='string'&&e.data.title.length<=160&&Number.isFinite(e.data.estimate)&&e.data.estimate>=0&&Number.isFinite(e.data.quantity)&&e.data.quantity>=0;
 if(e.kind==='offer_revision')return typeof e.data.title==='string'&&e.data.title.trim().length>=2&&e.data.title.length<=160&&typeof e.data.url==='string'&&isKleinanzeigenUrl(e.data.url)&&Number.isFinite(e.data.price)&&e.data.price>0&&Number.isFinite(e.data.shipping)&&e.data.shipping>=0&&typeof e.data.materialId==='string'&&e.data.materialId.length<=140&&typeof e.data.notes==='string'&&e.data.notes.length<=3000&&typeof e.data.availability==='string'&&['Angeboten','Reserviert','Nicht verfügbar'].includes(e.data.availability);
 if(e.kind==='session_revision')return typeof e.data.title==='string'&&e.data.title.length<=160&&typeof e.data.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(e.data.date);
 if(e.kind==='worklog')return typeof e.data.taskId==='string'&&Array.isArray(e.data.participants)&&e.data.participants.every(x=>MEMBER_IDS.includes(x))&&Number.isFinite(e.data.hours)&&e.data.hours>=0&&e.data.hours<1000&&Number.isFinite(e.data.cost)&&e.data.cost>=0;
 if(e.kind==='expense')return Number.isFinite(e.data.amount)&&e.data.amount>=0;
 return true;
}
export function parseTransfer(txt){
 if(txt.length>12_000_000) throw new Error('Datei ist zu groß (max. 12 MB).');
 let x;try{x=JSON.parse(txt)}catch{throw new Error('Ungültiges JSON.');}
 if(!x||x.format!=='werkstatt-events'||x.projectId!==PROJECT_ID||x.schema!==PROJECT_SCHEMA||!['changes','backup'].includes(x.exportType)||!Array.isArray(x.events)||x.events.length>25000)throw new Error('Unpassende oder nicht unterstützte Projektdatei.');
 const ids=new Set();for(const e of x.events){if(!validateEvent(e))throw new Error('Ungültiger Datensatz in Projektdatei.');if(ids.has(e.id))throw new Error('Datei enthält doppelte Ereignis-IDs.');ids.add(e.id)}
 return x;
}
export function transfer(events,exportType,device){return {format:'werkstatt-events',schema:PROJECT_SCHEMA,projectId:PROJECT_ID,exportType,exportedAt:isoNow(),sourceDevice:device,events:sortEvents(events)};}
export function reconcile(current,incoming){
 const map=new Map(current.map(e=>[e.id,e]));let added=0,duplicates=0;
 for(const e of incoming){const old=map.get(e.id);if(old){if(JSON.stringify(old)!==JSON.stringify(e))throw new Error('ID-Kollision mit unterschiedlichen Daten: '+e.id);duplicates++;}else{map.set(e.id,e);added++;}}
 return {events:sortEvents([...map.values()]),added,duplicates};
}
export function conflictingEntities(events){return ['task','material','offer','session','status','material_status'].flatMap(type=>entities(events,type).filter(e=>e.conflict).map(e=>({type,...e}))).concat([...new Set(events.filter(e=>e.kind==='step_revision').map(e=>e.entityId))].map(id=>({type:'step',id,...entityHeads(events,'step',id)})).filter(e=>e.conflict));}
