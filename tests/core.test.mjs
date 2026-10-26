import test from 'node:test';
import assert from 'node:assert/strict';
import {TASKS} from '../src/data.js';
import {entities,entityHeads,votesFor,newEvent,reconcile,transfer,parseTransfer,conflictingEntities,allSeeds,stepState,baseId,recentStatus,taskStats} from '../src/core.js';
function vote(by,revisionId,choice='yes',id='P1-01'){return newEvent('vote',id,by,{targetType:'task',revisionId,choice})}
const find=(events,id='P1-01')=>entities(events,'task').find(x=>x.id===id);
test('Startbestand: 20 Pakete, 49 Schritte, 10 Materialien, 16 Termine',()=>{
 assert.equal(TASKS.length,20);assert.equal(TASKS.flatMap(t=>t.steps).length,49);assert.equal(Object.keys(allSeeds.material).length,10);assert.equal(Object.keys(allSeeds.session).length,16);
 assert.equal(find([]).revision.id,'seed:task:P1-01');
});
test('Freigabe strikt erst bei 3 von 3 Zustimmungen',()=>{
 const ref=find([]).revision.id;
 const e=[vote('a',ref),vote('b',ref)];assert.equal(votesFor(e,'task',find(e)).state,'pending');
 e.push(vote('c',ref));assert.equal(votesFor(e,'task',find(e)).state,'approved');
});
test('Änderung macht alle bisherigen Stimmen ungültig',()=>{
 const ref=find([]).revision.id;let e=[vote('a',ref),vote('b',ref),vote('c',ref)];
 const next={...find(e).data,budget:140};const rev=newEvent('task_revision','P1-01','a',next,[ref]);e.push(rev);
 assert.equal(votesFor(e,'task',find(e)).yes,0);
 assert.equal(votesFor(e,'task',find(e)).state,'pending');
});
test('Ablehnung sperrt Freigabe auch bei 2 Zustimmungen',()=>{
 const ref=find([]).revision.id,e=[vote('a',ref),vote('b',ref),vote('c',ref,'no')];
 assert.equal(votesFor(e,'task',find(e)).state,'rueckfrage');
});
test('Drei unabhängig exportierte Stimmen zusammenführen, Doppelimporte ignorieren',()=>{
 const ref=find([]).revision.id;const vA=vote('a',ref),vB=vote('b',ref),vC=vote('c',ref);
 const a=reconcile([vA],[vA,vB]);assert.equal(a.added,1);assert.equal(a.duplicates,1);
 const b=reconcile(a.events,[vA,vB,vC]);assert.equal(b.added,1);
 assert.equal(votesFor(b.events,'task',find(b.events)).state,'approved');
 assert.equal(reconcile(b.events,[vA,vB,vC]).added,0);
});
test('Gleichzeitige Änderung derselben Aufgabe wird sichtbar als Konflikt',()=>{
 const b=baseId('task','P1-01'),original=find([]).data;
 const x=newEvent('task_revision','P1-01','a',{...original,budget:100},[b]);
 const y=newEvent('task_revision','P1-01','b',{...original,budget:200},[b]);
 assert.equal(find([x,y]).conflict,true);
 assert.equal(votesFor([x,y],'task',find([x,y])).state,'konflikt');
 assert.equal(conflictingEntities([x,y]).length,1);
 const z=newEvent('task_revision','P1-01','c',{...original,budget:150},[x.id,y.id]);
 assert.equal(find([x,y,z]).conflict,false);
});
test('Schrittfortschritt besitzt eigene Revisionskette',()=>{
 const id='P1-01#0';const x=newEvent('step_revision',id,'a',{done:true},[baseId('step',id)]);
 assert.equal(stepState([x],'P1-01',0).done,true);
 const y=newEvent('step_revision',id,'b',{done:false},[baseId('step',id)]);
 assert.equal(stepState([x,y],'P1-01',0).conflict,true);
 assert.equal(taskStats([x,y],find([x,y])).conflict,true);
});
test('Statuskonflikt wird erkannt und meldet Konflikt',()=>{
 const id='P1-01',root=baseId('status',id);
 const x=newEvent('status_revision',id,'a',{status:'In Arbeit'},[root]);
 const y=newEvent('status_revision',id,'b',{status:'Blockiert'},[root]);
 assert.equal(recentStatus([x,y],id),'Konflikt');
});
test('Export lesbar, fremdes Projekt und fehlerhafte Datei abgewiesen',()=>{
 const e=[vote('a',find([]).revision.id)];const out=transfer(e,'changes','dev1');const parsed=parseTransfer(JSON.stringify(out));
 assert.equal(parsed.events.length,1);
 assert.throws(()=>parseTransfer(JSON.stringify({...out,projectId:'other'})));
 assert.throws(()=>parseTransfer('{ broken'));
 assert.throws(()=>parseTransfer(JSON.stringify({...out,events:[{id:3}]})));
});
test('Beschaffungsstatus darf eine unabhängige Konfliktauflösung besitzen',async()=>{
 const {materialStatus,validateEvent}=await import('../src/core.js');
 const root=baseId('material_status','MAT-001');
 const a=newEvent('material_status_revision','MAT-001','a',{status:'Geplant'},[root]);
 const b=newEvent('material_status_revision','MAT-001','b',{status:'Beschafft'},[root]);
 assert.equal(validateEvent(a),true);
 assert.equal(materialStatus([a],'MAT-001'),'Geplant');
 assert.equal(materialStatus([a,b],'MAT-001'),'Konflikt');
});
