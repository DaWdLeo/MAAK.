import test from 'node:test';
import assert from 'node:assert/strict';
import {allSeeds,entities,votesFor,newEvent,transfer,parseTransfer,reconcile,offerTotal,sortedOffers,isKleinanzeigenUrl,approvalRequest,checkApprovalRequest,conflictingEntities,validateEvent} from '../src/core.js';

const sample=(id,price,shipping=0,materialId='MAT-001')=>({id,title:'Werkbank '+id,url:'https://www.kleinanzeigen.de/s-anzeige/werkbank/'+id,price,shipping,materialId,seller:'Köln',availability:'Angeboten',notes:''});
const add=(x)=>newEvent('offer_revision',x.id,'a',x,[]);

test('Kleinanzeigen: HTTPS-Domäne validieren; Fremdseiten und JavaScript ablehnen',()=>{
 assert.equal(isKleinanzeigenUrl('https://www.kleinanzeigen.de/s-anzeige/test/123'),true);
 assert.equal(isKleinanzeigenUrl('javascript:alert(1)'),false);
 assert.equal(isKleinanzeigenUrl('https://kleinanzeigen.de.evil.net/test'),false);
 assert.equal(isKleinanzeigenUrl('https://evil.example/kleinanzeigen.de'),false);
 assert.equal(isKleinanzeigenUrl('http://www.kleinanzeigen.de/s'),false);
});
test('Angebote nach Endpreis (Preis + Versand/Fahrt) ranken',()=>{
 const e=[add(sample('ANG-1',65,15)),add(sample('ANG-2',72,0)),add(sample('ANG-3',50,30))];
 const sorted=sortedOffers(e);
 assert.deepEqual(sorted.map(x=>x.id),['ANG-2','ANG-1','ANG-3']);
 assert.equal(offerTotal(sorted[0].data),72);
 assert.ok(e.every(validateEvent));
});
test('Nicht verfügbare Anzeigen sortieren zuletzt',()=>{
 const disabled={...sample('ANG-N',4,0),availability:'Nicht verfügbar'};
 const sorted=sortedOffers([add(disabled),add(sample('ANG-J',50,0))]);
 assert.deepEqual(sorted.map(x=>x.id),['ANG-J','ANG-N']);
});
test('3/3-Freigabe für unveränderte Angebotsversion erforderlich',()=>{
 const ev=add(sample('ANG-Z',120,10));let es=[ev];const x=entities(es,'offer')[0];const req=approvalRequest('offer',x,'b');
 assert.equal(checkApprovalRequest(req,x),true);
 assert.equal(checkApprovalRequest({...req,revisionId:'alterStand'},x),false);
 for(const member of ['a','b'])es.push(newEvent('vote','ANG-Z',member,{targetType:'offer',revisionId:ev.id,choice:'yes'}));
 assert.equal(votesFor(es,'offer',entities(es,'offer')[0]).state,'pending');
 es.push(newEvent('vote','ANG-Z','c',{targetType:'offer',revisionId:ev.id,choice:'yes'}));
 assert.equal(votesFor(es,'offer',entities(es,'offer')[0]).state,'approved');
 const revision=newEvent('offer_revision','ANG-Z','a',{...sample('ANG-Z',125,10)},[ev.id]);es.push(revision);
 assert.equal(votesFor(es,'offer',entities(es,'offer')[0]).state,'pending');
 assert.equal(checkApprovalRequest(req,entities(es,'offer')[0]),false);
});
test('JSON-Austausch von Kleinanzeigen und Votes idempotent und konfliktbewusst',()=>{
 const o=add(sample('ANG-X',60,5));const voteA=newEvent('vote','ANG-X','a',{targetType:'offer',revisionId:o.id,choice:'yes'});
 const voteB=newEvent('vote','ANG-X','b',{targetType:'offer',revisionId:o.id,choice:'yes'});
 const obj=parseTransfer(JSON.stringify(transfer([o,voteA,voteB],'changes','telefon')));
 const c=reconcile([o,voteA],obj.events);
 assert.equal(c.added,1);assert.equal(c.duplicates,2);
 assert.equal(reconcile(c.events,obj.events).added,0);
 const r1=newEvent('offer_revision','ANG-X','b',{...sample('ANG-X',60,10)},[o.id]);
 const r2=newEvent('offer_revision','ANG-X','c',{...sample('ANG-X',62,3)},[o.id]);
 assert.equal(conflictingEntities([o,r1,r2]).some(x=>x.type==='offer'),true);
});
