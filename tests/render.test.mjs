import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import * as data from '../src/data.js';
import * as core from '../src/core.js';
const folder=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=fs.readFileSync(resolve(folder,'src/app.js'),'utf8').replace(/^import\s.*?from\s.*?;\s*$/gm,'').split('init().catch(')[0];
const ctx=vm.createContext({...data,...core,console,Intl,Date,Math,JSON,Number,Array,Object,Set,Map,String,localStorage:{getItem:()=>null}});
vm.runInContext(src+'\n globalThis.testRender={renderDashboard,renderTasks,renderCalendar,renderVotes,renderMaterials,renderLogs,renderSync,renderOffers};',ctx);
for(const name of ['renderDashboard','renderTasks','renderCalendar','renderVotes','renderMaterials','renderLogs','renderSync','renderOffers']){
 test(`${name} stellt eine HTML-Oberfläche bereit`,()=>{
  const html=ctx.testRender[name]();
  assert.equal(typeof html,'string');
  assert.ok(html.length>500);
  assert.match(html,/class="pageheader"|class="hero"/);
 });
}
