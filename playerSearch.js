
/*
========================================
STUMPS PLAYER SEARCH v1.0
Standalone Player Search Add-on
========================================

FEATURES:
- Live player search
- 1vs1 Team A search
- 1vs1 Team B search
- Tournament Playing XI search
- Search by player name or role
- Preserve original player indexes
- Preserve selected players
- No changes to cricket match engine
========================================
*/

(function () {

    'use strict';

    // ===============================
    // SEARCH BAR STYLING
    // ===============================

    const style = document.createElement('style');

    style.textContent = `

        .stumps-player-search {
            display: block;
            width: min(100%, 460px);
            margin: 9px 0 13px;
            padding: 12px 15px;

            border: 1px solid var(--accent, #24d17b);
            border-radius: 10px;

            background: #0b140e;
            color: #ffffff;

            font: inherit;
        }

        .stumps-player-search:focus {
            outline: 2px solid var(--accent, #24d17b);
            outline-offset: 2px;
        }

        .stumps-search-note {
            font-size: 12px;
            color: var(--muted, #a4b5a9);
            margin: 0 0 10px;
        }

    `;

    document.head.appendChild(style);


    // ===============================
    // SEARCH HELPERS
    // ===============================

    const normalize = value =>
        String(value || '')
            .toLocaleLowerCase()
            .trim();

    const matches = (player, term) =>
        normalize(
            player.name + ' ' + player.role
        ).includes(normalize(term));


    // ===============================
    // 1vs1 PLAYER SEARCH
    // ===============================

    function filterOneVsOne(side) {

        const input = document.getElementById(
            'stumpsSearch' + side
        );

        const select = document.getElementById(
            'playerSelect' + side
        );

        if (
            !input ||
            !select ||
            !Array.isArray(window.players)
        ) {
            return;
        }

        const previous = select.value;
        const term = input.value;

        const fragment =
            document.createDocumentFragment();

        const placeholder =
            document.createElement('option');

        placeholder.value = '';
        placeholder.textContent =
            'Select a player';

        fragment.appendChild(placeholder);

        let count = 0;

        window.players.forEach((player, index) => {

            if (!matches(player, term)) {
                return;
            }

            const option =
                document.createElement('option');

            // Keep original database index
            option.value = String(index);

            option.textContent =
                `${player.name} (${player.role})`;

            fragment.appendChild(option);

            count++;

        });

        select.replaceChildren(fragment);

        // Preserve previous selection
        if (
            previous &&
            [...select.options].some(
                option => option.value === previous
            )
        ) {
            select.value = previous;
        }

        const note = document.getElementById(
            'stumpsSearchCount' + side
        );

        if (note) {
            note.textContent =
                `${count} matching players`;
        }

    }


    // ===============================
    // INSTALL 1vs1 SEARCH BARS
    // ===============================

    function installOneVsOne() {

        for (const side of ['A', 'B']) {

            const select = document.getElementById(
                'playerSelect' + side
            );

            if (
                !select ||
                document.getElementById(
                    'stumpsSearch' + side
                )
            ) {
                continue;
            }

            const input =
                document.createElement('input');

            input.type = 'search';

            input.id =
                'stumpsSearch' + side;

            input.className =
                'stumps-player-search';

            input.placeholder =
                `🔎 Search Team ${side} players...`;

            input.autocomplete = 'off';

            input.setAttribute(
                'aria-label',
                `Search Team ${side} players`
            );

            const note =
                document.createElement('p');

            note.id =
                'stumpsSearchCount' + side;

            note.className =
                'stumps-search-note';

            select.before(input, note);

            input.addEventListener(
                'input',
                () => filterOneVsOne(side)
            );

            filterOneVsOne(side);

        }

    }


    // ===============================
    // TOURNAMENT PLAYER SEARCH
    // ===============================

    function filterTournament() {

        const input = document.getElementById(
            'stumpsTournamentSearch'
        );

        const list = document.getElementById(
            'tournamentPlayerList'
        );

        if (
            !input ||
            !list ||
            !Array.isArray(window.players)
        ) {
            return;
        }

        let count = 0;

        list.querySelectorAll(
            'button[onclick^="toggleTournamentPlayer("]'
        ).forEach(button => {

            const match = button
                .getAttribute('onclick')
                .match(
                    /toggleTournamentPlayer\((\d+)\)/
                );

            if (!match) {
                return;
            }

            const player =
                window.players[Number(match[1])];

            const visible =
                !!player &&
                matches(player, input.value);

            const row = button.parentElement;

            if (row) {
                row.style.display =
                    visible ? '' : 'none';
            }

            if (visible) {
                count++;
            }

        });

        const note = document.getElementById(
            'stumpsTournamentSearchCount'
        );

        if (note) {
            note.textContent =
                `${count} matching players`;
        }

    }


    // ===============================
    // INSTALL TOURNAMENT SEARCH
    // ===============================

    function installTournament() {

        const list = document.getElementById(
            'tournamentPlayerList'
        );

        if (
            !list ||
            document.getElementById(
                'stumpsTournamentSearch'
            )
        ) {
            return;
        }

        const input =
            document.createElement('input');

        input.type = 'search';

        input.id =
            'stumpsTournamentSearch';

        input.className =
            'stumps-player-search';

        input.placeholder =
            '🔎 Search players by name or role...';

        input.autocomplete = 'off';

        input.setAttribute(
            'aria-label',
            'Search tournament players'
        );

        const note =
            document.createElement('p');

        note.id =
            'stumpsTournamentSearchCount';

        note.className =
            'stumps-search-note';

        list.before(input, note);

        input.addEventListener(
            'input',
            filterTournament
        );

        filterTournament();

    }


    // ===============================
    // CONNECT TO EXISTING FUNCTIONS
    // ===============================

    function installHooks() {

        // 1vs1 dropdown loading

        if (
            typeof window.loadPlayerDropdowns ===
            'function'
        ) {

            const original =
                window.loadPlayerDropdowns;

            window.loadPlayerDropdowns =
                function (...args) {

                    const result =
                        original.apply(this, args);

                    installOneVsOne();

                    filterOneVsOne('A');
                    filterOneVsOne('B');

                    return result;

                };

        }


        // Tournament XI selection

        if (
            typeof window.startTournamentTeamSelection ===
            'function'
        ) {

            const original =
                window.startTournamentTeamSelection;

            window.startTournamentTeamSelection =
                function (...args) {

                    const result =
                        original.apply(this, args);

                    installTournament();

                    return result;

                };

        }


        // Tournament player list updates

        if (
            typeof window.displayTournamentPlayers ===
            'function'
        ) {

            const original =
                window.displayTournamentPlayers;

            window.displayTournamentPlayers =
                function (...args) {

                    const result =
                        original.apply(this, args);

                    installTournament();

                    // Preserve search after re-render
                    filterTournament();

                    return result;

                };

        }


        // Initial installation

        installOneVsOne();
        installTournament();

    }


    // ===============================
    // INITIALISE AFTER PAGE LOAD
    // ===============================

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            installHooks,
            { once: true }
        );

    } else {

        installHooks();

    }

})();
