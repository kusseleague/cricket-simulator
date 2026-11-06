
/* STUMPS Custom Team Logos v1.0 — standalone add-on */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'stumps:team-logos:v1';
  const logos = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
  let matchup = null;

  const css = document.createElement('style');
  css.textContent = `
    .stumps-logo-picker {display:block;margin:3px 0 14px;color:var(--muted);font-size:12px}
    .stumps-logo-picker input {display:block;max-width:100%;font-size:12px}
    #stumpsLogoMatchup {display:flex;align-items:center;justify-content:center;gap:clamp(12px,4vw,50px);margin:20px auto;max-width:850px;text-align:center}
    .stumps-logo-team {flex:1;min-width:0;display:flex;align-items:center;flex-direction:column;gap:7px}
    .stumps-logo-team img {width:clamp(70px,10vw,125px);height:clamp(70px,10vw,125px);object-fit:contain}
    .stumps-logo-placeholder {width:clamp(70px,10vw,125px);height:clamp(70px,10vw,125px);display:grid;place-items:center;border:1px dashed var(--accent);border-radius:12px;font-size:30px}
    .stumps-logo-name {font-family:Orbitron,sans-serif;font-size:clamp(10px,1.3vw,15px);overflow-wrap:anywhere;color:var(--white);font-weight:700}
    .stumps-logo-vs {font-family:Orbitron,sans-serif;font-size:clamp(18px,3vw,30px);font-weight:800;color:var(--accent)}
  `;
  document.head.appendChild(css);

  const keyFor = name => String(name || '').trim().toLocaleLowerCase();

  function getTeams() {
    try {
      return typeof tournamentTeams !== 'undefined' &&
        Array.isArray(tournamentTeams) ? tournamentTeams : [];
    } catch {
      return [];
    }
  }

  function getFixture(index) {
    try {
      return typeof tournamentFixtures !== 'undefined'
        ? tournamentFixtures[index] : null;
    } catch {
      return null;
    }
  }

  function storeLogo(name, data) {
    const key = keyFor(name);
    if (!key) return;

    if (data) logos[key] = data;
    else delete logos[key];

    try {
      localStorage.setItem(KEY, JSON.stringify(logos));
    } catch (error) {
      alert('Logo storage is full. Try a smaller image.');
      console.warn(error);
    }
  }

  function compress(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(
          1,
          220 / Math.max(img.naturalWidth, img.naturalHeight)
        );

        canvas.width = Math.max(
          1,
          Math.round(img.naturalWidth * scale)
        );

        canvas.height = Math.max(
          1,
          Math.round(img.naturalHeight * scale)
        );

        canvas.getContext('2d').drawImage(
          img, 0, 0, canvas.width, canvas.height
        );

        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Cannot read image'));
      };

      img.src = url;
    });
  }

  function addPickers() {
    const area = $('teamNameInputs');
    if (!area) return;

    area.querySelectorAll('input[id^="tournamentTeam"]').forEach(input => {
      if (
        !/^tournamentTeam\d+$/.test(input.id) ||
        input.dataset.logoPicker
      ) return;

      input.dataset.logoPicker = 'yes';

      const label = document.createElement('label');
      label.className = 'stumps-logo-picker';
      label.textContent = '🛡️ Optional team logo: ';

      const file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/png,image/jpeg,image/webp';

      label.appendChild(file);
      input.insertAdjacentElement('afterend', label);

      file.addEventListener('change', async () => {
        const chosen = file.files?.[0];
        if (!chosen) return;

        if (!input.value.trim()) {
          alert('Enter the team name first, then choose its logo.');
          file.value = '';
          return;
        }

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(chosen.type)) {
          alert('Use PNG, JPG or WebP.');
          return;
        }

        try {
          storeLogo(input.value, await compress(chosen));
          label.firstChild.textContent = '✅ Logo saved: ';
        } catch {
          alert('Could not load that image.');
        }
      });
    });
  }

  function makeTeam(name) {
    const side = document.createElement('div');
    side.className = 'stumps-logo-team';

    const src = logos[keyFor(name)];
    const visual = document.createElement(src ? 'img' : 'div');

    if (src) {
      visual.src = src;
      visual.alt = name + ' logo';
    } else {
      visual.className = 'stumps-logo-placeholder';
      visual.textContent = '🛡️';
    }

    const title = document.createElement('div');
    title.className = 'stumps-logo-name';
    title.textContent = name;

    side.append(visual, title);
    return side;
  }

  function showMatchup(a, b) {
    if (!a || !b) return;

    matchup = [a, b];

    const controls = document.querySelector(
      '#matchArea .stumpsMatchControls'
    );

    if (!controls) return;

    let panel = $('stumpsLogoMatchup');

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'stumpsLogoMatchup';
      controls.before(panel);
    }

    const vs = document.createElement('div');
    vs.className = 'stumps-logo-vs';
    vs.textContent = 'VS';

    panel.replaceChildren(
      makeTeam(a),
      vs,
      makeTeam(b)
    );
  }

  function wrap(name, after) {
    const original = window[name];

    if (typeof original !== 'function') return;

    window[name] = function (...args) {
      const result = original.apply(this, args);
      after(...args);
      return result;
    };
  }

  function init() {
    addPickers();

    wrap('createTeamNameInputs', addPickers);

    wrap('playTournamentMatch', index => {
      const f = getFixture(index);

      if (
        f?.teamA?.players?.length === 11 &&
        f?.teamB?.players?.length === 11
      ) {
        matchup = [f.teamA.name, f.teamB.name];
      }
    });

    wrap('startMatch', () => {
      if (matchup) {
        showMatchup(...matchup);
      } else {
        showMatchup('Team 1', 'Team 2');
      }
    });

    wrap('startTeamSelection', () => {
      matchup = null;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
