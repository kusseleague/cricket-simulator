
/* STUMPS FIXTURE CONTROL CENTRE v1.0
   Load after teamGenerator.js and tournamentSave.js.
   Edits group-stage fixtures only; does not change the match engine.
*/
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let editing = false;
  let statusText = '';
  let lastSignature = '';
  let refreshQueued = false;

  function teams() { return typeof tournamentTeams === 'undefined' ? [] : tournamentTeams; }
  function fixtures() { return typeof tournamentFixtures === 'undefined' ? [] : tournamentFixtures; }
  function group() { return fixtures().filter(f => f.stage === 'group'); }
  function locked() {
    return fixtures().some(f => f.played) ||
      (typeof currentTournamentFixtureIndex !== 'undefined' && currentTournamentFixtureIndex !== null) ||
      (typeof knockoutStarted !== 'undefined' && knockoutStarted);
  }
  function validSetup() { return teams().length >= 3 && Array.isArray(fixtures()); }
  function alertStatus(s, bad=false) {
    statusText = s;
    const el = $('stumpsSchedulerStatus');
    if (el) { el.textContent=s; el.style.color=bad?'#ff9b9b':'#81edb2'; }
  }
  function persist() {
    // Use the existing save-system button; it captures the actual fixture array.
    const saveButton = $('stumpsSaveNow');
    if (saveButton) saveButton.click();
    else alertStatus('Changes are in memory. Use Save Now when the save system becomes available.',true);
  }
  function redraw() {
    if (typeof displayFixtures === 'function') displayFixtures();
    render();
  }
  function commit(message) {
    redraw();
    persist();
    alertStatus(message);
  }
  function checkEditable() {
    if (!validSetup()) { alertStatus('Create your tournament first.',true); return false; }
    if (locked()) { alertStatus('Scheduling is locked after a match starts, a result is recorded, or knockouts begin.',true); return false; }
    return true;
  }
  function swap(a,b) {
    if (!checkEditable()) return;
    const arr=fixtures();
    if (!arr[a] || !arr[b] || arr[a].stage!=='group' || arr[b].stage!=='group') return;
    [arr[a],arr[b]]=[arr[b],arr[a]];
    commit('Fixture order updated and saved.');
  }
  function update(index, field, value) {
    if (!checkEditable()) return;
    const f=fixtures()[index];
    if (!f || f.stage!=='group') return;
    if (field==='date') {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return alertStatus('Invalid date.',true);
      f.scheduleDate=value;
    } else if (field==='time') {
      if (value && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return alertStatus('Invalid time.',true);
      f.scheduleTime=value;
    } else if (field==='venue') {
      f.scheduleVenue=String(value).trim().slice(0,100);
    }
    persist();
    alertStatus('Fixture details saved.');
  }
  function addFixture() {
    if (!checkEditable()) return;
    const a=Number($('stumpsSchedulerHome')?.value), b=Number($('stumpsSchedulerAway')?.value);
    if (!Number.isInteger(a)||!Number.isInteger(b)||!teams()[a]||!teams()[b]||a===b) {
      return alertStatus('Choose two different teams.',true);
    }
    const f={teamA:teams()[a],teamB:teams()[b],stage:'group',played:false,scoreA:null,scoreB:null,
      scheduleDate:$('stumpsSchedulerNewDate')?.value||'',
      scheduleTime:$('stumpsSchedulerNewTime')?.value||'',
      scheduleVenue:($('stumpsSchedulerNewVenue')?.value||'').trim().slice(0,100)};
    const firstKnockout=fixtures().findIndex(x=>x.stage!=='group');
    if (firstKnockout<0) fixtures().push(f); else fixtures().splice(firstKnockout,0,f);
    commit('Manual fixture added and saved.');
  }
  function removeFixture(index) {
    if (!checkEditable()) return;
    if (!fixtures()[index] || fixtures()[index].stage!=='group') return;
    if (!confirm('Remove this unplayed fixture from the schedule?')) return;
    fixtures().splice(index,1);
    commit('Fixture removed and saved.');
  }
  function manualMode() {
    if (!checkEditable()) return;
    if (!confirm('Switch to a blank manual group-stage schedule? Existing unplayed group fixtures will be removed. Your teams and Playing XIs will remain.')) return;
    tournamentFixtures = fixtures().filter(f=>f.stage!=='group');
    commit('Manual scheduling enabled. Add your first fixture.');
  }
  function autoMode() {
    if (!checkEditable()) return;
    if (!confirm('Regenerate automatic group fixtures? This replaces your current unplayed group schedule.')) return;
    const previous=fixtures().filter(f=>f.stage!=='group');
    const next=[];
    for(let i=0;i<teams().length;i++) for(let j=i+1;j<teams().length;j++) {
      next.push({teamA:teams()[i],teamB:teams()[j],stage:'group',played:false,scoreA:null,scoreB:null});
      if(tournamentFormat==='homeAway') next.push({teamA:teams()[j],teamB:teams()[i],stage:'group',played:false,scoreA:null,scoreB:null});
    }
    tournamentFixtures=[...next,...previous];
    commit('Automatic group fixtures regenerated and saved.');
  }
  function options(selected=0) {
    return teams().map((t,i)=>`<option value="${i}" ${i===selected?'selected':''}>${escapeHTML(t.name)}</option>`).join('');
  }
  function render() {
    const host=$('stumpsFixtureScheduler');
    if (!host) return;
    const available=validSetup();
    const isLocked=locked();
    const arr=fixtures();
    const groups=arr.map((f,i)=>({f,i})).filter(x=>x.f.stage==='group');
    const disabled=isLocked?'disabled':'';
    const rows=groups.map(({f,i},j)=>{
      const a=arr[i-1]?.stage==='group';
      const b=arr[i+1]?.stage==='group';
      return `<div class="stumps-sched-fixture" data-index="${i}">
        <div class="stumps-sched-heading"><strong>Match ${j+1}: ${escapeHTML(f.teamA?.name)} vs ${escapeHTML(f.teamB?.name)}</strong><span>${f.played?'✅ Played':'⏳ Unplayed'}</span></div>
        <div class="stumps-sched-fields">
          <label>Date <input data-field="date" type="date" value="${escapeHTML(f.scheduleDate||'')}" ${disabled}></label>
          <label>Time <input data-field="time" type="time" value="${escapeHTML(f.scheduleTime||'')}" ${disabled}></label>
          <label>Stadium <input data-field="venue" type="text" maxlength="100" placeholder="e.g. Mohali" value="${escapeHTML(f.scheduleVenue||'')}" ${disabled}></label>
        </div>
        <div class="stumps-sched-actions">
          <button type="button" data-action="up" ${disabled||!a?'disabled':''}>↑ Earlier</button>
          <button type="button" data-action="down" ${disabled||!b?'disabled':''}>↓ Later</button>
          <button type="button" data-action="delete" ${disabled}>✕ Remove</button>
        </div>
      </div>`;
    }).join('');
    host.innerHTML=`<div class="stumps-sched-title"><h2>🗓️ STUMPS FIXTURE CONTROL CENTRE</h2><span>${groups.length} group fixtures</span></div>
      <p>Reorder automatic fixtures, or build a fully manual schedule. Date, time and stadium travel with the tournament backup.</p>
      ${isLocked?'<p class="stumps-sched-warning">🔒 Scheduling locked: a match has started, a result exists, or knockouts have begun. Your existing fixtures are safe.</p>':''}
      ${!available?'<p>Create your tournament first to start scheduling.</p>':`
      <div class="stumps-sched-actions">
        <button type="button" data-global="auto" ${disabled}>🔄 Generate Automatic Fixtures</button>
        <button type="button" data-global="manual" ${disabled}>✍️ Start Manual Schedule</button>
      </div>
      <details ${editing?'open':''} id="stumpsSchedulerAdd"><summary>➕ Add a manual fixture</summary>
        <div class="stumps-sched-fields">
          <label>Home team <select id="stumpsSchedulerHome" ${disabled}>${options(0)}</select></label>
          <label>Away team <select id="stumpsSchedulerAway" ${disabled}>${options(Math.min(1,teams().length-1))}</select></label>
          <label>Date <input type="date" id="stumpsSchedulerNewDate" ${disabled}></label>
          <label>Time <input type="time" id="stumpsSchedulerNewTime" ${disabled}></label>
        <label>Stadium
  <select id="stumpsSchedulerNewVenue" ${disabled}>
    <option value="">Select Stadium</option>
    <option value="chandigarh">Chandigarh</option>
    <option value="chennai">Chennai</option>
    <option value="mumbai">Mumbai</option>
    <option value="brisbane">Brisbane</option>
    <option value="napoli">Napoli</option>
    <option value="birmingham">Birmingham</option>
    <option value="london">London</option>
    <option value="manchester">Manchester</option>
    <option value="sydney">Sydney</option>
    <option value="melbourne">Melbourne</option>
    <option value="abudhabi">Abu Dhabi</option>
    <option value="dubai">Dubai</option>
    <option value="milano">Milano</option>
  </select>
</label>
        </div><button type="button" data-global="add" ${disabled}>➕ Add Fixture</button>
      </details>
      <div class="stumps-sched-list">${rows||'<p>No group fixtures yet. Add one manually or generate automatically.</p>'}</div>`}
      <p id="stumpsSchedulerStatus" role="status">${escapeHTML(statusText)}</p>`;
    host.querySelector('#stumpsSchedulerAdd')?.addEventListener('toggle',e=>{editing=e.target.open;});
  }
  function appendFixtureDetails() {
    const area=$('fixtureArea');
    if (!area || !Array.isArray(fixtures())) return;
    // Attach schedule labels to the existing fixture blocks without changing play buttons.
    const children=[...area.children].filter(el=>el.tagName==='DIV');
    fixtures().forEach((f,i)=>{
      const div=children[i];
      if(!div) return;
      div.querySelector('.stumps-schedule-label')?.remove();
      const parts=[];
      if(f.scheduleDate) parts.push('📅 '+f.scheduleDate);
      if(f.scheduleTime) parts.push('🕒 '+f.scheduleTime);
      if(f.scheduleVenue) parts.push('🏟️ '+f.scheduleVenue);
      if(parts.length){
        const label=document.createElement('p');
        label.className='stumps-schedule-label';
        label.textContent=parts.join('  |  ');
        label.style.cssText='color:#9ee8c2;font-size:13px;margin:8px 0';
        div.insertBefore(label,div.querySelector('button')||div.querySelector('hr'));
      }
    });
  }
  function scheduleRefresh() {
    if(refreshQueued)return;
    refreshQueued=true;
    queueMicrotask(()=>{refreshQueued=false;render();appendFixtureDetails();});
  }
  function install() {
    const anchor=$('fixtureArea');
    if(!anchor || $('stumpsFixtureScheduler')) return;
    const style=document.createElement('style');
    style.textContent=`#stumpsFixtureScheduler{border:1px solid #299c6a;border-radius:14px;padding:18px;margin:20px 0;background:rgba(10,25,20,.93);color:#e9fff2}#stumpsFixtureScheduler *{box-sizing:border-box}#stumpsFixtureScheduler .stumps-sched-title{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}#stumpsFixtureScheduler .stumps-sched-title h2{margin:0;font-size:19px}#stumpsFixtureScheduler p{font-size:13px}#stumpsFixtureScheduler .stumps-sched-warning{color:#ffcf88}#stumpsFixtureScheduler .stumps-sched-fixture{padding:13px;margin:10px 0;border:1px solid #285b45;border-radius:10px;background:rgba(17,41,31,.85)}#stumpsFixtureScheduler .stumps-sched-heading{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}#stumpsFixtureScheduler .stumps-sched-fields{display:flex;flex-wrap:wrap;gap:12px;margin:12px 0}#stumpsFixtureScheduler .stumps-sched-fields label{display:flex;flex-direction:column;gap:5px;font-size:12px;flex:1 1 160px}#stumpsFixtureScheduler input,#stumpsFixtureScheduler select{width:100%;min-width:0;padding:8px;border:1px solid #477761;border-radius:7px;background:#112b20;color:#fff;color-scheme:dark}#stumpsFixtureScheduler .stumps-sched-actions{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}#stumpsFixtureScheduler button{padding:8px 12px;cursor:pointer}#stumpsFixtureScheduler button:disabled{opacity:.4;cursor:not-allowed}#stumpsFixtureScheduler details{margin:14px 0;padding:12px;border:1px dashed #477761;border-radius:10px}#stumpsFixtureScheduler summary{cursor:pointer;font-weight:bold}`;
    document.head.appendChild(style);
    const host=document.createElement('section');host.id='stumpsFixtureScheduler';
    anchor.parentNode.insertBefore(host,anchor);
    host.addEventListener('click',e=>{
      const button=e.target.closest('button');if(!button)return;
      const global=button.dataset.global;
      if(global==='auto')return autoMode();
      if(global==='manual')return manualMode();
      if(global==='add')return addFixture();
      const row=button.closest('[data-index]');if(!row)return;
      const i=Number(row.dataset.index);
      if(button.dataset.action==='up')swap(i,i-1);
      if(button.dataset.action==='down')swap(i,i+1);
      if(button.dataset.action==='delete')removeFixture(i);
    });
    host.addEventListener('change',e=>{
      const row=e.target.closest('[data-index]');
      if(row && e.target.dataset.field)update(Number(row.dataset.index),e.target.dataset.field,e.target.value);
    });
    // Wrap the existing renderer. The engine still owns all play-match buttons.
    const original=window.displayFixtures;
    if(typeof original==='function')window.displayFixtures=function(...args){
      const result=original.apply(this,args);
      scheduleRefresh();
      return result;
    };
    render();appendFixtureDetails();
    // The save system restores fixture data then calls displayFixtures(), so
    // the wrapper above refreshes the planner on cross-device imports too.
    ['createTournament','confirmPlayoffFormat','returnToTournament'].forEach(name=>{
      const original=window[name];if(typeof original!=='function')return;
      window[name]=function(...args){const result=original.apply(this,args);scheduleRefresh();return result;};
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
