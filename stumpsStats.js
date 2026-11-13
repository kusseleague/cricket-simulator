
/* STUMPS stats add-on. No tournament save or match-engine changes. */
(function () {
  'use strict';
  let tab = 'comparison';
  let history = [[], []];
  let cards = [null, null];
  let names = ['First innings', 'Second innings'];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = v => JSON.parse(JSON.stringify(v || {}));
  const overs = n => `${Math.floor(n / 6)}.${n % 6}`;
  function record(i, b, r) {
    if (!Number.isFinite(b) || !Number.isFinite(r)) return;
    const h = history[i];
    if (!h.length || h[h.length - 1].balls !== b || h[h.length - 1].runs !== r) h.push({ balls: b, runs: r });
  }
  function capture(i, b, r, w) {
    record(i, b, r);
    cards[i] = { balls: b, runs: r, wickets: w, batters: clone(batsmanStats), bowlers: clone(bowlerStats), lineup: battingTeam.map(p => p.name), bowlLineup: bowlingTeam.map(p => p.name) };
  }
  function refresh() {
    const panel = document.getElementById('stumpsStatsPanel');
    if (!panel || panel.hidden) return;
    panel.querySelectorAll('[data-stumps-tab]').forEach(b => b.classList.toggle('active', b.dataset.stumpsTab === tab));
    document.getElementById('stumpsStatsContent').innerHTML = tab === 'comparison' ? comparison() : scoreboard();
  }
  function comparison() {
    const all = history.flat();
    const ymax = Math.max(30, ...all.map(p => p.runs));
    const ceiling = Math.ceil(ymax / 30) * 30;
    const x = b => 46 + (b / 120) * 604;
    const y = r => 240 - (r / ceiling) * 205;
    const colours = ['#38bdf8', '#f472b6'];
    let svg = `<svg viewBox="0 0 680 275" role="img" aria-label="Cumulative runs against overs for both innings">`;
    for (let t = 0; t <= 4; t++) {
      const val = ceiling * t / 4;
      svg += `<line x1="46" y1="${y(val)}" x2="650" y2="${y(val)}" stroke="#3b5147" stroke-dasharray="3 5"/><text x="39" y="${y(val)+4}" text-anchor="end" fill="#d1e5da" font-size="12">${Math.round(val)}</text>`;
    }
    for (let o = 0; o <= 20; o += 2) svg += `<text x="${x(o*6)}" y="261" text-anchor="middle" fill="#d1e5da" font-size="12">${o}</text>`;
    history.forEach((h, i) => {
      if (!h.length) return;
      svg += `<polyline points="${h.map(p => `${x(p.balls)},${y(p.runs)}`).join(' ')}" fill="none" stroke="${colours[i]}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
      const p = h[h.length-1];
      svg += `<circle cx="${x(p.balls)}" cy="${y(p.runs)}" r="5" fill="${colours[i]}"/>`;
    });
    svg += `</svg>`;
    return `<h3>RUN COMPARISON</h3>${svg}<div style="display:flex;gap:20px;flex-wrap:wrap"><span style="color:${colours[0]}">● ${esc(names[0])}: ${cards[0] ? cards[0].runs + '/' + cards[0].wickets : '0/0'}</span><span style="color:${colours[1]}">● ${esc(names[1])}: ${cards[1] ? cards[1].runs + '/' + cards[1].wickets : 'Yet to bat'}</span></div><p style="font-size:12px">Overs along the bottom · Cumulative runs vertically</p>`;
  }
  function scoreboard() {
    return cards.map((c, i) => {
      if (!c) return `<h3>${esc(names[i])} — Yet to bat</h3>`;
      const batRows = c.lineup.map(n => {
        const s = c.batters[n] || {};
        return `<tr><td>${esc(n)}${s.out ? ' †' : ''}</td><td>${s.runs || 0}</td><td>${s.balls || 0}</td><td>${s.fours || 0}</td><td>${s.sixes || 0}</td></tr>`;
      }).join('');
      const bowlRows = c.bowlLineup.filter(n => c.bowlers[n] && c.bowlers[n].balls > 0).map(n => {
        const s = c.bowlers[n];
        return `<tr><td>${esc(n)}</td><td>${overs(s.balls || 0)}</td><td>${s.runs || 0}</td><td>${s.wickets || 0}</td></tr>`;
      }).join('');
      return `<h3>${esc(names[i])} — ${c.runs}/${c.wickets} (${overs(c.balls)} overs)</h3><table><thead><tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th></tr></thead><tbody>${batRows}</tbody></table><h3>Bowling</h3><table><thead><tr><th>Bowler</th><th>Overs</th><th>Runs</th><th>Wickets</th></tr></thead><tbody>${bowlRows || '<tr><td colspan="4">No deliveries yet</td></tr>'}</tbody></table>`;
    }).join('');
  }
  window.stumpsOpenStats = function () {
    const panel = document.getElementById('stumpsStatsPanel');
    if (!panel) return;
    panel.hidden = false;
    refresh();
  };
  window.stumpsCloseStats = function () {
    const panel = document.getElementById('stumpsStatsPanel');
    if (panel) panel.hidden = true;
  };
  window.stumpsStatsTab = function (next) {
    if (next !== 'comparison' && next !== 'scoreboard') return;
    tab = next;
    refresh();
  };
  // Wrap rather than modify the existing engine. This preserves all tournament logic.
  const originalStart = window.startMatch;
  window.startMatch = function (...args) {
    history = [[{balls:0,runs:0}], []];
    cards = [null, null];
    const result = originalStart.apply(this, args);
    names = [currentFirstInningsTeam?.name || 'Team batting first', currentSecondInningsTeam?.name || 'Team batting second'];
    capture(0, 0, 0, 0);
    window.stumpsCloseStats();
    return result;
  };
  const originalNext = window.nextBall;
  window.nextBall = function (...args) {
    if (matchOver) return;
    const wasSecond = secondInnings;
    const beforeB = balls, beforeR = score, beforeW = wickets;
    const result = originalNext.apply(this, args);
    if (!wasSecond && secondInnings) {
      record(0, firstInningsBalls, firstInningsScore);
      if (cards[0]) { cards[0].balls = firstInningsBalls; cards[0].runs = firstInningsScore; cards[0].wickets = firstInningsWickets; }
      capture(1, balls, score, wickets);
    } else if (!wasSecond) {
      capture(0, balls, score, wickets);
    } else {
      capture(1, balls, score, wickets);
    }
    refresh();
    return result;
  };
})();
