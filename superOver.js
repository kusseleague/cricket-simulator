/*
========================================
KWICK KRICK SIM
SUPER OVER MODE
INDEPENDENT MATCH ENGINE
========================================
*/

(function () {

let teams = [[], []];
let innings = 0;
let runs = [0, 0];
let wickets = [0, 0];
let balls = [0, 0];

let striker = null;
let nonStriker = null;
let bowler = null;
let dismissed = [];
let matchStarted = false;
let inningsFinished = false;

const getPlayers = () =>
    typeof players !== "undefined" ? players : [];

const panel = document.createElement("div");

panel.id = "superOverPanel";
panel.style.display = "none";
panel.style.margin = "25px 0";
panel.style.padding = "24px";
panel.style.background = "#101b17";
panel.style.border = "1px solid var(--accent)";
panel.style.borderRadius = "16px";

document.getElementById("stumpsModeNav")
    .insertAdjacentElement("afterend", panel);


// =====================================
// HELPERS
// =====================================

function playerOptions(list) {
    return list.map(p =>
        `<option value="${p.name}">${p.name}
        (BAT ${p.bat} / BOWL ${p.bowl})</option>`
    ).join("");
}

function findPlayer(name) {
    return getPlayers().find(p => p.name === name);
}

function teamName(index) {
    return document.getElementById(
        "superTeamName" + index
    )?.value.trim() || "Team " + (index + 1);
}

function battingTeam() {
    return innings;
}

function bowlingTeam() {
    return 1 - innings;
}

function scoreText(i) {
    return `${runs[i]}/${wickets[i]} (${balls[i]}/6)`;
}


// =====================================
// OPEN SUPER OVER
// =====================================

window.openSuperOver = function () {

    document.querySelectorAll(
        "#stumpsOneVsOne, #tournamentSetup, " +
        "#matchSetup, #matchArea"
    ).forEach(el => el.style.display = "none");

    panel.style.display = "block";

    panel.innerHTML = `
        <h2>⚡ SUPER OVER MODE</h2>

        <p>
        Independent Match • 4 Players Per Team
        • 6 Balls • 2 Wickets
        </p>

        <button onclick="superOverNewMatch()">
            🔄 New Super Over
        </button>

        <div id="superContent"></div>
    `;

    if (!matchStarted) {
        showTeamSetup();
    } else {
        showScoreboard();
    }

    panel.scrollIntoView({ behavior: "smooth" });
};


// =====================================
// TEAM SELECTION
// =====================================

function showTeamSetup() {

    teams = [[], []];
    innings = 0;
    runs = [0, 0];
    wickets = [0, 0];
    balls = [0, 0];

    striker = null;
    nonStriker = null;
    bowler = null;
    dismissed = [];

    matchStarted = false;
    inningsFinished = false;

    const area = document.getElementById(
        "superContent"
    );

    area.innerHTML = `
        <h3>🏏 Select Your Teams</h3>

        <p>Select exactly 4 players for each team.</p>

        <div id="superTeam0"></div>

        <hr>

        <div id="superTeam1"></div>

        <hr>

        <button onclick="superConfirmTeams()">
            ✅ Confirm Teams
        </button>

        <p id="superMessage"></p>
    `;

    renderTeamSelectors();
}

function renderTeamSelectors() {

    for (let t = 0; t < 2; t++) {

        const area = document.getElementById(
            "superTeam" + t
        );

        const existingName =
            document.getElementById(
                "superTeamName" + t
            )?.value || "Team " + (t + 1);

        const used = teams.flat().map(p => p.name);

        const available = getPlayers().filter(
            p => !used.includes(p.name)
        );

        area.innerHTML = `
            <h3>TEAM ${t === 0 ? "A" : "B"}</h3>

            <input
                id="superTeamName${t}"
                placeholder="Team Name"
                value="${existingName.replace(/"/g, "&quot;")}"
            >

            <p>${teams[t].length}/4 Players</p>

            <select id="superSelect${t}">
                <option value="">Choose Player</option>
                ${playerOptions(available)}
            </select>

            <button onclick="superAddPlayer(${t})">
                ➕ Add Player
            </button>

            <div>
                ${teams[t].map((p, i) => `
                    <p>
                        ${i + 1}. ${p.name}
                        <button onclick="superRemovePlayer(${t},${i})">
                            ✕
                        </button>
                    </p>
                `).join("")}
            </div>
        `;
    }
}

window.superAddPlayer = function (t) {

    if (teams[t].length >= 4) {
        alert("Maximum 4 players per team!");
        return;
    }

    const name = document.getElementById(
        "superSelect" + t
    ).value;

    const player = findPlayer(name);

    if (!player) return;

    const names = [
        document.getElementById("superTeamName0").value,
        document.getElementById("superTeamName1").value
    ];

    teams[t].push(player);

    renderTeamSelectors();

    names.forEach((name, i) => {
        document.getElementById(
            "superTeamName" + i
        ).value = name;
    });
};

window.superRemovePlayer = function (t, i) {

    const names = [
        document.getElementById("superTeamName0").value,
        document.getElementById("superTeamName1").value
    ];

    teams[t].splice(i, 1);

    renderTeamSelectors();

    names.forEach((name, i) => {
        document.getElementById(
            "superTeamName" + i
        ).value = name;
    });
};


// =====================================
// CONFIRM TEAMS
// =====================================

let names = ["Team A", "Team B"];

window.superConfirmTeams = function () {

    if (teams[0].length !== 4 ||
        teams[1].length !== 4) {

        document.getElementById(
            "superMessage"
        ).textContent =
            "Both teams must have exactly 4 players!";

        return;
    }

    names = [
        teamName(0),
        teamName(1)
    ];

    matchStarted = true;

    showInningsSetup();
};


// =====================================
// INNINGS SETUP
// =====================================

function showInningsSetup() {

    inningsFinished = false;
    dismissed = [];

    striker = null;
    nonStriker = null;
    bowler = null;

    const bat = teams[battingTeam()];
    const bowl = teams[bowlingTeam()];

    const area = document.getElementById(
        "superContent"
    );

    area.innerHTML = `
        <h2>🏏 Innings ${innings + 1}</h2>

        <h3>${names[battingTeam()]} Batting</h3>

        <p>Select your opening batters and bowler.</p>

        <label>Striker</label>
        <select id="superStriker">
            ${playerOptions(bat)}
        </select>

        <br>

        <label>Non-Striker</label>
        <select id="superNonStriker">
            ${playerOptions(bat)}
        </select>

        <br>

        <label>Bowler — ${names[bowlingTeam()]}</label>
        <select id="superBowler">
            ${playerOptions(bowl)}
        </select>

        <br><br>

        <button onclick="superStartInnings()">
            ▶ Start Innings
        </button>
    `;
}

window.superStartInnings = function () {

    striker = findPlayer(
        document.getElementById(
            "superStriker"
        ).value
    );

    nonStriker = findPlayer(
        document.getElementById(
            "superNonStriker"
        ).value
    );

    bowler = findPlayer(
        document.getElementById(
            "superBowler"
        ).value
    );

    if (striker.name === nonStriker.name) {
        alert("Choose two different opening batters!");
        return;
    }

    showScoreboard();
};


// =====================================
// SCOREBOARD
// =====================================

function showScoreboard(message = "") {

    const area = document.getElementById(
        "superContent"
    );

    area.innerHTML = `
        <h2>⚡ SUPER OVER LIVE</h2>

        <h3>${names[0]} — ${scoreText(0)}</h3>
        <h3>${names[1]} — ${scoreText(1)}</h3>

        <hr>

        <h3>Innings ${innings + 1}</h3>

        <h2>
            ${names[battingTeam()]}
            ${runs[innings]}/${wickets[innings]}
        </h2>

        <p>Overs: 0.${balls[innings]}</p>

        ${
            innings === 1
                ? `<p>Target: ${runs[0] + 1}</p>`
                : ""
        }

        <p>🏏 Striker: ${striker?.name || "-"}</p>
        <p>🏏 Non-Striker: ${nonStriker?.name || "-"}</p>
        <p>🎯 Bowler: ${bowler?.name || "-"}</p>

        <h3>${message}</h3>

        <div id="superActions"></div>
    `;

    const actions = document.getElementById(
        "superActions"
    );

    if (inningsFinished) {

        if (innings === 0) {
            actions.innerHTML = `
                <button onclick="superNextInnings()">
                    ▶ Start Second Innings
                </button>
            `;
        } else {
            showResult();
        }

        return;
    }

    if (!striker || !nonStriker) {
        actions.innerHTML = `
            <p>Waiting for batter selection...</p>
        `;
        return;
    }

    actions.innerHTML = `
        <button onclick="superNextBall()">
            🏏 Next Ball
        </button>
    `;
}


// =====================================
// BALL ENGINE
// =====================================

window.superNextBall = function () {

    if (inningsFinished || !striker || !bowler) {
        return;
    }

    const difference = striker.bat - bowler.bowl;

    const chance = Math.random() * 100;

    let result;

    if (chance < 8) {
        result = "W";
    }
    else if (chance < 20 + difference / 2) {
        result = 6;
    }
    else if (chance < 45 + difference / 2) {
        result = 4;
    }
    else if (chance < 70) {
        result = 1;
    }
    else if (chance < 85) {
        result = 2;
    }
    else {
        result = 0;
    }

    balls[innings]++;

    let message = "";

    if (result === "W") {

        wickets[innings]++;

        dismissed.push(striker.name);

        message = `💥 WICKET! ${striker.name} OUT!`;

        striker = null;

        if (wickets[innings] < 2) {

            if (balls[innings] < 6) {
                chooseNextBatter(message);
                return;
            }
        }

    } else {

        runs[innings] += result;

        message =
            result === 6 ? "💥 SIX!" :
            result === 4 ? "🔥 FOUR!" :
            `${result} RUN${result === 1 ? "" : "S"}`;

        if (result % 2 === 1) {
            [striker, nonStriker] =
                [nonStriker, striker];
        }
    }

    if (
        wickets[innings] >= 2 ||
        balls[innings] >= 6 ||
        (innings === 1 && runs[1] > runs[0])
    ) {
        inningsFinished = true;
    }

    showScoreboard(message);
};


// =====================================
// CHOOSE REPLACEMENT BATTER
// =====================================

function chooseNextBatter(message) {

    showScoreboard(message);

    const available = teams[battingTeam()].filter(
        p =>
            !dismissed.includes(p.name) &&
            p.name !== nonStriker.name
    );

    document.getElementById(
        "superActions"
    ).innerHTML = `
        <h3>Choose Next Batter</h3>

        <select id="superReplacement">
            ${playerOptions(available)}
        </select>

        <button onclick="superConfirmBatter()">
            ✅ Send Batter In
        </button>
    `;
}

window.superConfirmBatter = function () {

    const name = document.getElementById(
        "superReplacement"
    ).value;

    striker = findPlayer(name);

    if (!striker) return;

    showScoreboard();
};


// =====================================
// SECOND INNINGS
// =====================================

window.superNextInnings = function () {

    if (innings !== 0 || !inningsFinished) return;

    innings = 1;

    showInningsSetup();
};


// =====================================
// MATCH RESULT
// =====================================

function showResult() {

    let result;

    if (runs[0] > runs[1]) {
        result = `🏆 ${names[0]} WIN!`;
    }
    else if (runs[1] > runs[0]) {
        result = `🏆 ${names[1]} WIN!`;
    }
    else {
        result = "🤝 SUPER OVER TIED!";
    }

    document.getElementById(
        "superActions"
    ).innerHTML = `
        <h2>${result}</h2>

        <p>
            ${names[0]}: ${runs[0]}/${wickets[0]}
        </p>

        <p>
            ${names[1]}: ${runs[1]}/${wickets[1]}
        </p>

        <button onclick="superOverNewMatch()">
            🔄 Play Another Super Over
        </button>
    `;
}


// =====================================
// NEW MATCH
// =====================================

window.superOverNewMatch = function () {

    showTeamSetup();
};

})();
