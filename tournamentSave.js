
/* STUMPS TOURNAMENT SAVE SYSTEM — v1.0
   Local browser storage; save between matches, not during an innings.
   Keep this file loaded AFTER teamGenerator.js.
*/
(() => {
  'use strict';
  const PREFIX = 'stumps:tournament:v1:';
  const ACTIVE = 'stumps:tournament:active:v1';
  const VERSION = 1;
  let activeCode = null;
  let busy = false;
  const $ = id => document.getElementById(id);

  function code() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const token = [...bytes].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    return `STP-${new Date().getFullYear()}-${token}`;
  }

  function capture() {
    if (!Array.isArray(tournamentTeams) || !tournamentTeams.length) {
      throw Error('Create a tournament before saving.');
    }
    const teamIds = new Map(tournamentTeams.map((t, i) => [t, i]));
    const id = t => t == null ? null : teamIds.get(t);
    const fixtures = tournamentFixtures.map(f => ({
      ...f,
      teamA: id(f.teamA),
      teamB: id(f.teamB),
      winner: id(f.winner)
    }));
    if (fixtures.some(f => f.teamA === undefined || f.teamB === undefined || f.winner === undefined)) {
      throw Error('Tournament references are inconsistent. Save cancelled.');
    }
    return {
      version: VERSION,
      code: activeCode,
      updatedAt: new Date().toISOString(),
      state: {
        teams: tournamentTeams,
        fixtures,
        tournamentFormat,
        playoffFormat,
        knockoutStarted,
        qualifierCreated,
        eliminatorCreated,
        semiFinalsCreated,
        thirdPlaceCreated,
        finalCreated,
        champion: id(tournamentChampion),
        runnerUp: id(tournamentRunnerUp),
        thirdPlace: id(tournamentThirdPlace),
        venue: $('venueSelect')?.value || 'melbourne'
      }
    };
  }

  function validate(data) {
    if (!data || data.version !== VERSION || !data.state) throw Error('Unsupported backup version.');
    const s = data.state;
    if (!Array.isArray(s.teams) || s.teams.length < 3 || s.teams.length > 8) throw Error('Invalid tournament teams.');
    if (!Array.isArray(s.fixtures) || s.fixtures.length > 150) throw Error('Invalid fixtures.');
    if (!s.teams.every(t => t && typeof t.name === 'string' && Array.isArray(t.players))) {
      throw Error('Invalid team records.');
    }
    const validId = n => n === null || (Number.isInteger(n) && n >= 0 && n < s.teams.length);
    for (const f of s.fixtures) {
      if (!f || !validId(f.teamA) || !validId(f.teamB) || f.teamA === null || f.teamB === null ||
          !validId(f.winner)) throw Error('Invalid fixture team reference.');
    }
    if (![s.champion, s.runnerUp, s.thirdPlace].every(validId)) throw Error('Invalid winner reference.');
    if (!['oneOff', 'homeAway', ''].includes(s.tournamentFormat)) throw Error('Invalid tournament format.');
    if (!['top3', 'top4', ''].includes(s.playoffFormat)) throw Error('Invalid playoff format.');
  }

  function save(silent = false) {
    if (busy) return;
    try {
      if (!activeCode) activeCode = code();
      const data = capture();
      data.code = activeCode;
      localStorage.setItem(PREFIX + activeCode, JSON.stringify(data));
      localStorage.setItem(ACTIVE, activeCode);
      render();
      if (!silent) notify('Tournament saved successfully.', true);
    } catch (e) {
      notify(e.message || 'Unable to save tournament.', false);
    }
  }

  function restore(data) {
    validate(data);
    if (!matchOver && $('matchArea')?.style.display === 'block') {
      if (!confirm('A match appears to be in progress. Loading will abandon that innings. Continue?')) return;
    }
    busy = true;
    try {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = null;
      }
      matchSession++;
      const s = data.state;
      const teams = JSON.parse(JSON.stringify(s.teams));
      const ref = n => n === null ? null : teams[n];
      tournamentTeams = teams;
      tournamentFixtures = s.fixtures.map(f => ({
        ...f,
        teamA: ref(f.teamA),
        teamB: ref(f.teamB),
        winner: ref(f.winner)
      }));
      tournamentFormat = s.tournamentFormat;
      playoffFormat = s.playoffFormat;
      knockoutStarted = !!s.knockoutStarted;
      qualifierCreated = !!s.qualifierCreated;
      eliminatorCreated = !!s.eliminatorCreated;
      semiFinalsCreated = !!s.semiFinalsCreated;
      thirdPlaceCreated = !!s.thirdPlaceCreated;
      finalCreated = !!s.finalCreated;
      tournamentChampion = ref(s.champion);
      tournamentRunnerUp = ref(s.runnerUp);
      tournamentThirdPlace = ref(s.thirdPlace);
      currentTournamentFixtureIndex = null;
      teamA = [];
      teamB = [];
      matchOver = true;
      $('matchArea').style.display = 'none';
      $('matchSetup').style.display = 'none';
      $('tournamentTeamCount').value = String(teams.length);
      createTeamNameInputs();
      teams.forEach((t, i) => {
        const input = $('tournamentTeam' + (i + 1));
        if (input) input.value = t.name;
      });
      if ($('venueSelect')) {
        $('venueSelect').value = s.venue || 'melbourne';
        if (typeof applyVenueTheme === 'function') applyVenueTheme($('venueSelect').value);
      }
      $('tournamentMessage').innerHTML = '<h3>✅ Saved tournament restored</h3>';
      if (typeof switchStumpsMode === 'function') switchStumpsMode('tournament');
      displayTournamentTeams();
      displayPointsTable();
      displayFixtures();
      activeCode = data.code;
      localStorage.setItem(ACTIVE, activeCode);
      render();
      notify('Tournament restored. Continue from the next unplayed fixture.', true);
    } finally {
      busy = false;
    }
  }

  function load(input) {
    const wanted = String(input || '').trim().toUpperCase();
    if (!wanted) return notify('Enter a tournament code.', false);
    try {
      const raw = localStorage.getItem(PREFIX + wanted);
      if (!raw) throw Error('Code not found in this browser. Import a backup if available.');
      const data = JSON.parse(raw);
      restore(data);
    } catch (e) {
      notify(e.message || 'Unable to load tournament.', false);
    }
  }

  function exportBackup() {
    try {
      if (!activeCode) throw Error('Save a tournament first.');
      save(true);
      const raw = localStorage.getItem(PREFIX + activeCode);
      if (!raw) throw Error('No saved tournament found.');
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeCode}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify('Backup downloaded. Keep it somewhere safe.', true);
    } catch (e) {
      notify(e.message, false);
    }
  }

  async function importBackup(file) {
    if (!file) return;
    try {
      if (file.size > 2000000) throw Error('Backup file is too large.');
      const data = JSON.parse(await file.text());
      validate(data);
      if (!/^STP-\d{4}-[A-F0-9]{16}$/.test(data.code || '')) {
        throw Error('Invalid tournament code.');
      }
      const existing = localStorage.getItem(PREFIX + data.code);
      if (existing && !confirm('This code already exists here. Replace the existing save?')) return;
      localStorage.setItem(PREFIX + data.code, JSON.stringify(data));
      restore(data);
      notify('Backup imported successfully.', true);
    } catch (e) {
      notify(e.message || 'Unable to import backup.', false);
    }
  }

  function notify(message, success) {
    const el = $('stumpsSaveStatus');
    if (el) {
      el.textContent = message;
      el.style.color = success ? 'var(--accent, #24d17b)' : '#ff8b8b';
    }
    if (!success) console.warn('[Stumps Save]', message);
  }

  function render() {
    const el = $('stumpsSaveCode');
    if (el) el.textContent = activeCode || 'No tournament saved yet';
    const list = $('stumpsSavedList');
    if (!list) return;
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      try {
        const data = JSON.parse(localStorage.getItem(key));
        items.push({
          code: data.code,
          date: data.updatedAt || '',
          teams: data.state?.teams?.map(t => t.name).join(', ') || ''
        });
      } catch (_) {}
    }
    items.sort((a, b) => b.date.localeCompare(a.date));
    list.replaceChildren();
    for (const item of items) {
      const row = document.createElement('div');
      row.style.cssText = 'padding:9px 0;border-bottom:1px solid var(--border,#294332)';
      const btn = document.createElement('button');
      btn.textContent = 'Load';
      btn.addEventListener('click', () => load(item.code));
      const label = document.createElement('span');
      label.textContent = ` ${item.code} — ${item.teams}`;
      row.append(btn, label);
      list.append(row);
    }
  }

  function install() {
    const host = $('tournamentSetup');
    if (!host || $('stumpsSavePanel')) return;
    const panel = document.createElement('section');
    panel.id = 'stumpsSavePanel';
    panel.style.cssText = 'padding:20px;margin:20px 0;border:1px solid var(--accent,#24d17b);border-radius:14px;background:rgba(8,14,11,.85)';
    panel.innerHTML = `
      <h3>💾 STUMPS TOURNAMENT SAVES</h3>
      <p>Save between matches. Codes work in this browser; export a backup for long-term safety.</p>
      <p><strong>Current code:</strong> <span id="stumpsSaveCode">No tournament saved yet</span></p>
      <button type="button" id="stumpsSaveNow">💾 Save Now</button>
      <button type="button" id="stumpsSaveExport">⬇️ Export Backup</button>
      <div style="margin-top:12px">
        <input id="stumpsSaveInput" placeholder="STP-2026-..." autocomplete="off" aria-label="Tournament code">
        <button type="button" id="stumpsSaveLoad">📂 Load Code</button>
      </div>
      <div style="margin-top:12px">
        <input type="file" id="stumpsSaveImport" accept=".json,application/json" aria-label="Import tournament backup">
      </div>
      <p id="stumpsSaveStatus" aria-live="polite"></p>
      <details><summary>Saved tournaments in this browser</summary><div id="stumpsSavedList"></div></details>
    `;
    host.insertBefore(panel, host.children[1] || null);
    $('stumpsSaveNow').addEventListener('click', () => save());
    $('stumpsSaveExport').addEventListener('click', exportBackup);
    $('stumpsSaveLoad').addEventListener('click', () => load($('stumpsSaveInput').value));
    $('stumpsSaveImport').addEventListener('change', e => {
      importBackup(e.target.files[0]);
      e.target.value = '';
    });
    activeCode = localStorage.getItem(ACTIVE);
    render();
  }

  // Add save hooks without replacing the cricket engine.
  function hook(name, callback) {
    const original = window[name];
    if (typeof original !== 'function') return;
    window[name] = function (...args) {
      const result = original.apply(this, args);
      try { callback(...args); } catch (e) { console.warn('[Stumps Save]', e); }
      return result;
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    install();
    hook('createTournament', () => {
      activeCode = null;
      if (tournamentTeams.length) save(true);
    });
    hook('selectTournamentFormat', () => save(true));
    hook('selectPlayoffFormat', () => save(true));
    hook('confirmPlayoffFormat', () => save(true));
    hook('generateFixtures', () => save(true));
    hook('generateKnockoutStage', () => save(true));
    hook('confirmTournamentPlayers', () => save(true));
    hook('finishMatch', () => save(true));
    hook('returnToTournament', () => save(true));
    hook('displayFixtures', () => {
      if (activeCode && !busy && matchOver) save(true);
    });
  });
})();
