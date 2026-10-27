import {SECTIONS, MILESTONES, RHYTHM} from './data.js';

// Nur Darstellung: Die tatsächliche Wahrheit liegt weiterhin im Ereignisprotokoll.
const phaseMeta = {
  P1: {week:'WOCHE 01', number:'01', kind:'SICHERHEIT', symbol:'01', summary:'Bestand aufnehmen, Risiken und Zuständigkeiten klären.'},
  P2: {week:'WOCHE 02', number:'02', kind:'GRUNDLAGEN', symbol:'02', summary:'Feuchtigkeit stoppen, Räume sichern und Grundlicht schaffen.'},
  P3: {week:'WOCHE 03–04', number:'03', kind:'ERSTER RAUM', symbol:'03', summary:'Den kleinen Raum trocken, warm und nutzbar machen.'},
  P4: {week:'AB WOCHE 05', number:'04', kind:'AUSBAU', symbol:'04', summary:'Hauptwerkstatt, Galerie und dritten Raum fertigstellen.'}
};

const safe = s => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const percentage = (done,total) => total ? Math.round(100*done/total) : 0;
const euros = n => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n)||0);
const decimal = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(Number(n)||0);
const dateLabel = s => {if(!s)return '–';const d = new Date(s+'T12:00:00');return Number.isNaN(d.getTime()) ? '–' : d.toLocaleDateString('de-DE',{day:'2-digit',month:'short'});};
const dateTimeLabel = s => {if(!s)return '–';const d=new Date(s);return Number.isNaN(d.getTime())?'–':d.toLocaleString('de-DE',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});};

export function roadmapModel({tasks,events,sections=SECTIONS,vote,taskStats,tstatus,materials=[],offers=[],sessions=[],hoursFor,costsFor}) {
  const phases = sections.map(phase => {
    const items=tasks.filter(t=>t.data?.section===phase.id);
    const steps=items.reduce((acc,t)=>acc+taskStats(events,t).total,0);
    const complete=items.filter(t=>vote('task',t).state==='approved'&&!t.conflict)
      .reduce((acc,t)=>acc+taskStats(events,t).done,0);
    const finished=items.filter(t=>tstatus(t)==='Erledigt').length;
    const pending=items.filter(t=>t.conflict||vote('task',t).state!=='approved').length;
    const blockers=items.filter(t=>t.conflict||tstatus(t)==='Blockiert'||vote('task',t).state==='rueckfrage').length;
    return {...phase,items,steps,complete,finished,pending,blockers,pct:percentage(complete,steps),isComplete:items.length>0&&finished===items.length};
  });
  const allSteps=phases.reduce((n,p)=>n+p.steps,0),doneSteps=phases.reduce((n,p)=>n+p.complete,0);
  const finished=phases.reduce((n,p)=>n+p.finished,0);
  const activeIndex=Math.max(0,phases.findIndex(p=>!p.isComplete));
  const approvals=[...tasks.map(item=>({item,type:'task'})),...materials.map(item=>({item,type:'material'})),...offers.map(item=>({item,type:'offer'}))]
    .filter(x=>x.item.conflict||vote(x.type,x.item).state!=='approved');
  const plannedHours=tasks.reduce((sum,t)=>sum+Number(t.data?.personHours||0),0);
  const plannedCost=tasks.reduce((sum,t)=>sum+Number(t.data?.budget||0),0)+materials.filter(t=>!t.data?.taskId).reduce((sum,t)=>sum+Number(t.data?.estimate||0),0);
  const nextSessions=sessions.filter(s=>s.data?.date&&s.data.date>=new Date().toISOString().slice(0,10)).sort((a,b)=>(a.data.date+a.data.start).localeCompare(b.data.date+b.data.start)).slice(0,3);
  const milestones=MILESTONES.map(m=>{
    const related=m.groups.map(id=>tasks.find(t=>t.id===id)).filter(Boolean);
    const done=related.filter(t=>tstatus(t)==='Erledigt').length;
    return {...m,done,total:related.length,complete:related.length>0&&done===related.length};
  });
  return {phases,allSteps,doneSteps,finished,approvals,activeIndex,milestones,nextSessions,plannedHours,plannedCost,actualHours:hoursFor(events),actualCost:costsFor(events),pct:percentage(doneSteps,allSteps),lastEvent:events.length?events[events.length-1]:null};
}

export function renderRoadmap(input) {
  const model=roadmapModel(input);
  const {phases,activeIndex,milestones}=model;
  const actor=input.actor;
  const personalPending=model.approvals.filter(({item,type})=>!item.conflict&&!input.vote(type,item).votes?.[actor]);
  const nextTask=phases[activeIndex]?.items.find(t=>input.tstatus(t)!=='Erledigt'&&!t.conflict);
  const lastImport=input.lastImport||'Noch kein JSON-Abgleich';
  const milestonesFor = phase => milestones.filter(m=>m.groups.some(id=>phase.items.some(t=>t.id===id)) && (phase.id==='P3'?m.id==='M1':phase.id==='P4'));
  const currentLabel=phases[activeIndex]?.title||'Alle Etappen';
  return `<div class="rm-page">
    <div class="rm-hero">
      <div class="rm-hero-grid">
        <div class="rm-hero-copy">
          <div class="rm-eyebrow"><span class="rm-live-dot"></span> MAAK. / GEMEINSAMES PROJEKT <span class="rm-version">ROADMAP 01</span></div>
          <h1>Aus Plänen wird <em>Werkstatt.</em></h1>
          <p>Von der Bestandsaufnahme bis zur fertigen Gemeinschaftswerkstatt. Ein Fahrplan für drei Menschen, drei Räume und gemeinsame Entscheidungen.</p>
          <div class="rm-hero-actions">
            ${nextTask?`<button class="rm-action rm-action-primary" data-task="${safe(nextTask.id)}">Nächsten Schritt öffnen <span aria-hidden="true">↗</span></button>`:`<button class="rm-action rm-action-primary" data-roadmap-jump="P4">Meilensteine ansehen <span aria-hidden="true">↗</span></button>`}
            <button class="rm-action rm-action-quiet" data-page="votes">${model.approvals.length} offene Freigaben <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <div class="rm-progress-panel">
          <div class="rm-ring" role="img" aria-label="Gesamtfortschritt ${model.pct} Prozent" style="--rm-progress:${model.pct}%"><div class="rm-ring-center"><b>${model.pct}<span>%</span></b><small>GESAMT</small></div></div>
          <div class="rm-progress-caption"><span>Gemeinsamer Fortschritt</span><strong>${model.doneSteps} / ${model.allSteps} Schritte</strong><small>aus freigegebenen Aufgaben</small></div>
        </div>
      </div>
      <div class="rm-hero-footer"><span>● &nbsp; LOKALER STAND DIESES GERÄTS</span><span>Letzter Import: ${safe(lastImport)}</span><button data-page="sync">Abgleichen ↗</button></div>
    </div>

    <div class="rm-metrics" aria-label="Projektkennzahlen">
      <div class="rm-metric"><div class="rm-metric-icon">▤</div><div><small>ARBEITSPAKETE</small><strong>${model.finished}<span> / ${input.tasks.length}</span></strong><p>vollständig erledigt</p></div></div>
      <div class="rm-metric"><div class="rm-metric-icon">◉</div><div><small>NOCH ZU BESTÄTIGEN</small><strong>${model.approvals.length}</strong><p>${personalPending.length} davon ohne deine Stimme</p></div></div>
      <div class="rm-metric"><div class="rm-metric-icon">◷</div><div><small>ZEITAUFWAND</small><strong>${decimal(model.actualHours)}<span> h</span></strong><p>${model.plannedHours ? `${decimal(model.plannedHours)} h geplant (Personenstunden)`:'Noch keine Zeitbudgets'}</p></div></div>
      <div class="rm-metric"><div class="rm-metric-icon">€</div><div><small>AUSGABEN</small><strong>${euros(model.actualCost)}</strong><p>${model.plannedCost?`${euros(model.plannedCost)} budgetiert`:'Noch keine Kostenbudgets'}</p></div></div>
    </div>

    <div class="rm-layout">
      <div class="rm-main-col">
        <div class="rm-section-heading"><div><div class="rm-kicker">DER WEG ZUM ZIEL</div><h2>Unsere Roadmap<span class="rm-title-dot">.</span></h2><p>Vier Etappen. Fortschritt aus erledigten Einzelschritten. Jede Etappe öffnet die dazugehörigen Aufgaben.</p></div><button class="rm-text-action" data-page="tasks">Alle Aufgaben ↗</button></div>
        <div class="rm-stage-nav" aria-label="Etappe auswählen">${phases.map((p,i)=>`<button class="rm-stage-chip ${i===activeIndex?'active':''} ${p.isComplete?'finished':''}" data-roadmap-jump="${safe(p.id)}"><span>${safe(phaseMeta[p.id]?.number||p.id)}</span> ${safe(p.id)} ${p.isComplete?'✓':''}</button>`).join('')}</div>
        <div class="rm-track">
          ${phases.map((p,i)=>{
            const meta=phaseMeta[p.id]||{week:'SPÄTER',number:String(i+1),kind:'ETAPPE',summary:p.subtitle};
            const state=p.isComplete?'done':i===activeIndex?'current':'future';
            const stateName=p.isComplete?'Abgeschlossen':i===activeIndex?'Aktuelle Etappe':'Geplant';
            const relatedMilestones=milestonesFor(p);
            return `<section id="phase-${safe(p.id)}" class="rm-phase ${state}" aria-labelledby="phase-heading-${safe(p.id)}">
                <div class="rm-track-marker"><span>${p.isComplete?'✓':safe(meta.number)}</span></div>
                <details class="rm-phase-box" ${i===activeIndex?'open':''}>
                  <summary class="rm-phase-head">
                    <div class="rm-phase-top"><span class="rm-phase-week">${safe(meta.week)}</span><span class="rm-phase-type">${safe(meta.kind)}</span><span class="rm-phase-state ${state}">${stateName}</span></div>
                    <div class="rm-phase-title"><div><h3 id="phase-heading-${safe(p.id)}">${safe(p.title)}</h3><p>${safe(meta.summary)}</p></div><span class="rm-chevron">⌄</span></div>
                    <div class="rm-phase-progress"><div class="rm-phase-bar"><span style="width:${p.pct}%"></span></div><strong>${p.pct}%</strong></div>
                    <div class="rm-phase-count"><span>${p.finished}/${p.items.length} Aufgaben erledigt</span><span>${p.complete}/${p.steps} Schritte</span>${p.pending?`<span class="rm-pending-count">${p.pending} Freigaben offen</span>`:''}</div>
                  </summary>
                  <div class="rm-phase-content">
                    <div class="rm-tasklist">${p.items.map(t=>{
                      const st=input.tstatus(t),app=input.vote('task',t),stp=input.taskStats(input.events,t),progress=percentage(stp.done,stp.total);
                      const done=st==='Erledigt';
                      const label=t.conflict?'Konflikt':app.state==='rueckfrage'?'Klärung offen':app.state!=='approved'?`${app.yes}/3 Freigaben`:st;
                      const danger=t.data?.expert;
                      return `<button class="rm-task ${done?'is-done':''}" data-task="${safe(t.id)}" aria-label="${safe(t.data?.title||t.id)} öffnen">
                          <span class="rm-task-check">${done?'✓':stp.done?`${stp.done}`:'○'}</span>
                          <span class="rm-task-copy"><span class="rm-task-name">${safe(t.data?.title||t.id)}</span><span class="rm-task-info">${safe(t.id)} <span aria-hidden="true">·</span> ${stp.done}/${stp.total} Schritte ${danger?'<span class="rm-expert">· Fachprüfung</span>':''}</span></span>
                          <span class="rm-task-end"><span class="rm-task-status ${done?'completed':t.conflict||app.state==='rueckfrage'?'attention':app.state==='approved'?'released':'pending'}">${safe(label)}</span><span class="rm-task-chevron">↗</span></span>
                        </button>`;
                    }).join('')}</div>
                    <div class="rm-phase-actions"><button data-roadmap-filter="${safe(p.id)}">Aufgaben dieser Etappe ansehen ↗</button><button data-page="votes">Freigaben prüfen →</button></div>
                  </div>
                </details>
                ${relatedMilestones.map(m=>`<div class="rm-milestone ${m.complete?'complete':''}"><span class="rm-milestone-glyph">${m.complete?'✓':'◇'}</span><div><small>MEILENSTEIN ${safe(m.id)} ${m.complete?'· ERREICHT':'· OFFEN'}</small><strong>${safe(m.title)}</strong><p>${safe(m.desc)} · ${m.done}/${m.total} Arbeitspakete</p></div></div>`).join('')}
              </section>`;
          }).join('')}
        </div>
        <div class="rm-safety"><span aria-hidden="true">!</span><p><strong>Sicherheit vor Zeitplan.</strong> Feuchtigkeitsursachen, mögliche Schadstoffe, Elektrik und tragende Bauteile müssen fachlich geklärt sein, bevor abhängige Arbeiten beginnen. Die Roadmap zeigt den Stand, ersetzt aber keine Fachfreigaben.</p></div>
      </div>

      <aside class="rm-side-col" aria-label="Projektbegleitung">
        <section class="rm-side-card rm-focus">
          <div class="rm-side-label">JETZT IM FOKUS <span>↗</span></div>
          <div class="rm-focus-index">${safe(phases[activeIndex]?.id||'P1')} <small>/ ${safe(phaseMeta[phases[activeIndex]?.id]?.week||'PLANUNG')}</small></div>
          <h3>${safe(currentLabel)}</h3>
          <p>${safe(phases[activeIndex]?.subtitle||'Gemeinsame Arbeit organisieren')}</p>
          ${nextTask?`<button class="rm-focus-task" data-task="${safe(nextTask.id)}"><span>ALS NÄCHSTES</span><strong>${safe(nextTask.data?.title||nextTask.id)}</strong><small>Aufgabe öffnen ↗</small></button>`:''}
        </section>
        <section class="rm-side-card">
          <div class="rm-side-label">FREIGABEN <button data-page="votes">Alle ↗</button></div>
          <h3>Gemeinsam entscheiden.</h3>
          <p>Ohne drei Zustimmungen keine Umsetzung. Die Stimmen müssen per JSON zwischen den Geräten abgeglichen werden.</p>
          <div class="rm-approval-people">${['a','b','c'].map(a=>`<span title="${safe(input.who(a))}">${safe((input.who(a)||a).slice(0,1).toUpperCase())}</span>`).join('')}<small>3/3 erforderlich</small></div>
          ${personalPending.length?`<div class="rm-approval-queue"><small>DEINE OFFENEN ANTRÄGE</small>${personalPending.slice(0,3).map(x=>`<button data-${x.type==='task'?'task':x.type==='material'?'material':'offer'}="${safe(x.item.id)}"><span>${safe(x.item.data?.title||x.item.id)}</span><b>↗</b></button>`).join('')}</div>`:'<div class="rm-ready">Keine unbeantworteten Freigaben für dieses Mitglied.</div>'}
        </section>
        <section class="rm-side-card">
          <div class="rm-side-label">ARBEITSKALENDER <button data-page="calendar">Planen ↗</button></div>
          <h3>Nächste Einsätze</h3>
          <div class="rm-appointments">${model.nextSessions.length?model.nextSessions.map(s=>`<button data-page="calendar"><span class="rm-appointment-date">${safe(dateLabel(s.data.date))}</span><span><strong>${safe(s.data.title)}</strong><small>${safe(s.data.start||'Zeit offen')}${s.data.end?'–'+safe(s.data.end):''} Uhr</small></span><b>↗</b></button>`).join(''):'<p>Aktuell keine zukünftigen Termine eingetragen.</p>'}</div>
          <div class="rm-week-rhythm"><small>UNSER RHYTHMUS</small>${RHYTHM.filter(x=>x.day==='Dienstag'||x.day==='Donnerstag'||x.day==='Samstag').map(x=>`<div><span>${safe(x.day.slice(0,2).toUpperCase())}</span><strong>${safe(x.time)}</strong></div>`).join('')}<p>Vorschlag – tatsächliche Verfügbarkeit und Ruhezeiten beachten.</p></div>
        </section>
        <section class="rm-side-card rm-sync-card">
          <div class="rm-side-label">GEMEINSAMER STAND</div>
          <h3>Erst abgleichen. Dann weiter.</h3>
          <p>MAAK. arbeitet offline. Protokolle werden in eurer privaten WhatsApp-Gruppe geteilt und auf jedem Gerät importiert.</p>
          <div class="rm-sync-actions"><button data-share-log="changes">↗ JSON-Protokoll teilen</button><button data-page="sync">↓ Datei importieren</button></div>
          <small>Letzte Änderung auf diesem Gerät: ${safe(dateTimeLabel(model.lastEvent?.at))}</small>
        </section>
      </aside>
    </div>
    <div class="rm-footer-line"><span>MAAK. / ZUSAMMEN MACHEN WIR'S.</span><span>ROADMAP · V1 · LOKALE DATEN</span></div>
  </div>`;
}