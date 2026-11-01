
/*
 STUMPS — AUTOMATIC FIXTURE STADIUMS v1.0

 Works alongside:
 - teamGenerator.js
 - tournamentSave.js
 - fixtureScheduler.js

 Does not modify the cricket engine.
*/

(() => {
    "use strict";

    // Existing stadium themes in Stumps
    const STADIUMS = [
        ["chandigarh", "Chandigarh / Mohali"],
        ["chennai", "Chennai"],
        ["mumbai", "Mumbai"],
        ["brisbane", "Brisbane"],
        ["napoli", "Napoli"],
        ["birmingham", "Birmingham"],
        ["london", "London"],
        ["manchester", "Manchester"],
        ["sydney", "Sydney"],
        ["melbourne", "Melbourne"],
        ["abudhabi", "Abu Dhabi"],
        ["dubai", "Dubai"],
        ["milano", "Milano"]
    ];

    const $ = id => document.getElementById(id);

    function getStadiums() {

        // Prefer the simulator's actual stadium options.
        const mainSelect = $("venueSelect");

        if (mainSelect && mainSelect.options.length) {

            return Array.from(mainSelect.options)
                .filter(option => option.value)
                .map(option => [
                    option.value,
                    option.textContent.trim()
                ]);

        }

        return STADIUMS;
    }

    function makeDropdown(input) {

        if (!input || input.tagName !== "INPUT") {
            return;
        }

        const selected = input.value || "";

        const select = document.createElement("select");

        // Preserve the original field's ID.
        select.id = input.id;

        if (input.dataset.field) {
            select.dataset.field = input.dataset.field;
        }

        select.disabled = input.disabled;

        select.style.cssText = input.style.cssText;

        const placeholder = document.createElement("option");

        placeholder.value = "";
        placeholder.textContent = "Select Stadium";

        select.appendChild(placeholder);

        const stadiums = getStadiums();

        stadiums.forEach(([value, label]) => {

            const option = document.createElement("option");

            option.value = value;
            option.textContent = label;

            select.appendChild(option);

        });

        // Preserve previously saved selections.
        const matching = stadiums.find(([value, label]) =>
            value.toLowerCase() === selected.toLowerCase() ||
            label.toLowerCase() === selected.toLowerCase()
        );

        if (matching) {

            select.value = matching[0];

        } else if (selected) {

            // Preserve any older custom stadium name.
            const oldOption = document.createElement("option");

            oldOption.value = selected;
            oldOption.textContent = selected + " (previous selection)";

            select.appendChild(oldOption);
            select.value = selected;

        }

        input.replaceWith(select);
    }

    function upgradeDropdowns() {

        const panel = $("stumpsFixtureScheduler");

        if (!panel) return;

        // Manual fixture creation dropdown.
        makeDropdown($("stumpsSchedulerNewVenue"));

        // Stadium dropdown for every existing fixture.
        panel.querySelectorAll(
            'input[data-field="venue"]'
        ).forEach(makeDropdown);

    }

    function installDropdownWatcher() {

        const panel = $("stumpsFixtureScheduler");

        if (!panel) return false;

        upgradeDropdowns();

        // The scheduler rebuilds its HTML after updates.
        // Upgrade new text inputs whenever that happens.
        const observer = new MutationObserver(() => {

            upgradeDropdowns();

        });

        observer.observe(panel, {
            childList: true,
            subtree: true
        });

        return true;
    }

    function activateFixtureStadium(index) {

        if (
            typeof tournamentFixtures === "undefined" ||
            !Array.isArray(tournamentFixtures)
        ) {
            return;
        }

        const fixture = tournamentFixtures[index];

        if (!fixture || !fixture.scheduleVenue) {
            return;
        }

        const stadium = fixture.scheduleVenue;

        const mainSelect = $("venueSelect");

        if (!mainSelect) {

            console.warn(
                "[STUMPS] Main stadium selector not found."
            );

            return;
        }

        const matchingOption = Array.from(mainSelect.options)
            .find(option =>
                option.value.toLowerCase() === stadium.toLowerCase()
            );

        if (!matchingOption) {

            console.warn(
                "[STUMPS] Unknown stadium:",
                stadium
            );

            return;
        }

        // Change the main stadium selector.
        mainSelect.value = matchingOption.value;

        // Notify any existing venue-change listeners.
        mainSelect.dispatchEvent(
            new Event("change", { bubbles: true })
        );

        // Also support the existing theme function.
        if (typeof applyVenueTheme === "function") {

            applyVenueTheme(matchingOption.value);

        }

        console.log(
            "[STUMPS] Automatic fixture stadium:",
            matchingOption.value
        );

    }

    function installMatchHook() {

        const original = window.playTournamentMatch;

        if (typeof original !== "function") {

            console.warn(
                "[STUMPS] playTournamentMatch not found."
            );

            return;
        }

        window.playTournamentMatch = function(index) {

            // Validate the fixture before switching venues.
            const fixture =
                typeof tournamentFixtures !== "undefined"
                ? tournamentFixtures[index]
                : null;

            if (
                fixture &&
                !fixture.played &&
                fixture.teamA?.players?.length === 11 &&
                fixture.teamB?.players?.length === 11
            ) {

                activateFixtureStadium(index);

            }

            // Continue with the original match engine.
            return original.apply(this, arguments);

        };

    }

    function install() {

        installMatchHook();

        if (installDropdownWatcher()) {
            return;
        }

        // Retry when the scheduler panel is created.
        const observer = new MutationObserver(() => {

            if (installDropdownWatcher()) {
                observer.disconnect();
            }

        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            install
        );

    } else {

        install();

    }

})();
