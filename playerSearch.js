
/*
========================================
STUMPS PLAYER SEARCH v1.1
FIXED PLAYER DATABASE ACCESS
========================================

- Live search for 1vs1 Team A and B
- Live search for tournament Playing XIs
- Preserves original player indexes
- Preserves XI selections
- Preserves already-used player restrictions
- No match engine modifications
========================================
*/

(function () {
    "use strict";

    // ===============================
    // STYLING
    // ===============================

    const style = document.createElement("style");

    style.textContent = `
        .stumps-player-search {
            display: block;
            width: min(100%, 460px);
            padding: 12px 15px;
            margin: 10px 0;

            background: #0b140e;
            color: white;

            border: 1px solid var(--accent, #24d17b);
            border-radius: 10px;

            font: inherit;
        }

        .stumps-player-search:focus {
            outline: 2px solid var(--accent, #24d17b);
            outline-offset: 2px;
        }

        .stumps-search-note {
            color: var(--muted, #a4b5a9);
            font-size: 12px;
            margin: 0 0 12px;
        }
    `;

    document.head.appendChild(style);

    // ===============================
    // DATABASE ACCESS
    // ===============================

    function getPlayers() {
        // Access the original global lexical variable.
        // This works with const players and let players.

        if (typeof players !== "undefined" &&
            Array.isArray(players)) {
            return players;
        }

        return [];
    }

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .trim();
    }

    function matches(player, query) {
        return normalize(
            player.name + " " + player.role
        ).includes(normalize(query));
    }

    // ===============================
    // 1VS1 SEARCH
    // ===============================

    function filterOneVsOne(side) {

        const input = document.getElementById(
            "stumpsSearch" + side
        );

        const select = document.getElementById(
            "playerSelect" + side
        );

        if (!input || !select) return;

        const database = getPlayers();
        const previousValue = select.value;

        const fragment =
            document.createDocumentFragment();

        const placeholder =
            document.createElement("option");

        placeholder.value = "";
        placeholder.textContent = "Select a player";

        fragment.appendChild(placeholder);

        let count = 0;

        database.forEach((player, index) => {

            if (!matches(player, input.value)) {
                return;
            }

            const option =
                document.createElement("option");

            // Original database index is preserved.
            option.value = String(index);

            option.textContent =
                `${player.name} (${player.role})`;

            fragment.appendChild(option);

            count++;
        });

        select.replaceChildren(fragment);

        // Restore selection if it still matches.
        if (
            previousValue !== "" &&
            [...select.options].some(
                option => option.value === previousValue
            )
        ) {
            select.value = previousValue;
        } else {
            select.value = "";
        }

        const note = document.getElementById(
            "stumpsSearchCount" + side
        );

        if (note) {
            note.textContent =
                `${count} matching players`;
        }
    }

    function installOneVsOne() {

        ["A", "B"].forEach(side => {

            const select = document.getElementById(
                "playerSelect" + side
            );

            if (!select) return;

            if (!document.getElementById(
                "stumpsSearch" + side
            )) {

                const input =
                    document.createElement("input");

                input.type = "search";
                input.id = "stumpsSearch" + side;
                input.className =
                    "stumps-player-search";

                input.placeholder =
                    `🔎 Search Team ${side} players...`;

                input.autocomplete = "off";

                const note =
                    document.createElement("p");

                note.id =
                    "stumpsSearchCount" + side;

                note.className =
                    "stumps-search-note";

                select.before(input, note);

                input.addEventListener(
                    "input",
                    () => filterOneVsOne(side)
                );
            }

            filterOneVsOne(side);
        });
    }

    // ===============================
    // TOURNAMENT SEARCH
    // ===============================

    function filterTournament() {

        const input = document.getElementById(
            "stumpsTournamentSearch"
        );

        const list = document.getElementById(
            "tournamentPlayerList"
        );

        if (!input || !list) return;

        const database = getPlayers();
        let count = 0;

        const buttons = list.querySelectorAll(
            'button[onclick^="toggleTournamentPlayer("]'
        );

        buttons.forEach(button => {

            const onclick =
                button.getAttribute("onclick") || "";

            const match = onclick.match(
                /toggleTournamentPlayer\(\s*(\d+)\s*\)/
            );

            if (!match) return;

            const index = Number(match[1]);
            const player = database[index];

            const visible =
                !!player &&
                matches(player, input.value);

            const row = button.parentElement;

            if (row) {
                row.style.display =
                    visible ? "" : "none";
            }

            if (visible) count++;
        });

        const note = document.getElementById(
            "stumpsTournamentSearchCount"
        );

        if (note) {
            note.textContent =
                `${count} matching players`;
        }
    }

    function installTournament() {

        const list = document.getElementById(
            "tournamentPlayerList"
        );

        if (!list) return;

        if (!document.getElementById(
            "stumpsTournamentSearch"
        )) {

            const input =
                document.createElement("input");

            input.type = "search";
            input.id = "stumpsTournamentSearch";

            input.className =
                "stumps-player-search";

            input.placeholder =
                "🔎 Search cricketers by name or role...";

            input.autocomplete = "off";

            const note =
                document.createElement("p");

            note.id =
                "stumpsTournamentSearchCount";

            note.className =
                "stumps-search-note";

            list.before(input, note);

            input.addEventListener(
                "input",
                filterTournament
            );
        }

        filterTournament();
    }

    // ===============================
    // WRAP ORIGINAL FUNCTIONS
    // ===============================

    function wrapFunction(name, callback) {

        const original = window[name];

        if (typeof original !== "function") {
            return;
        }

        if (original.stumpsSearchWrapped) {
            return;
        }

        const wrapped = function (...args) {

            const result =
                original.apply(this, args);

            callback();

            return result;
        };

        wrapped.stumpsSearchWrapped = true;

        window[name] = wrapped;
    }

    // ===============================
    // INITIALISATION
    // ===============================

    function initialise() {

        // Preserve original 1vs1 dropdown loading.
        wrapFunction(
            "loadPlayerDropdowns",
            installOneVsOne
        );

        // Install search whenever an XI is opened.
        wrapFunction(
            "startTournamentTeamSelection",
            installTournament
        );

        // Reapply search when tournament
        // player buttons are rebuilt.
        wrapFunction(
            "displayTournamentPlayers",
            installTournament
        );

        // Initial search bars.
        installOneVsOne();
        installTournament();

        console.log(
            "🏏 STUMPS Player Search v1.1 loaded",
            getPlayers().length,
            "players available"
        );
    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initialise,
            { once: true }
        );

    } else {
        initialise();
    }

})();
