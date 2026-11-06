
/*
 STUMPS CUSTOM TEAM LOGOS v1.1
 Logo upload during Playing XI selection
 Standalone add-on — does not modify teamGenerator.js
*/

(() => {
    "use strict";

    const STORAGE_KEY = "stumps:team-logos:v1";

    let savedLogos = {};

    try {
        savedLogos =
            JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
        savedLogos = {};
    }

    let currentMatchTeams = null;

    function logoKey(name) {
        return String(name || "").trim().toLowerCase();
    }

    function getLogo(name) {
        return savedLogos[logoKey(name)] || "";
    }

    function getTournamentTeam(index) {
        try {
            return tournamentTeams[index];
        } catch (error) {
            return null;
        }
    }

    // =====================================
    // LOGO UPLOAD STYLING
    // =====================================

    const style = document.createElement("style");

    style.textContent = `

        .stumpsLogoUpload {
            text-align: center;
            padding: 15px;
            margin: 15px auto 20px;
            max-width: 450px;
            border: 1px solid var(--accent, #22c55e);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.25);
        }

        .stumpsLogoUpload input {
            max-width: 100%;
            margin: 12px auto;
        }

        .stumpsLogoPreview {
            width: 90px;
            height: 90px;
            object-fit: contain;
            display: block;
            margin: 10px auto;
        }

        #stumpsLogoMatchup {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: clamp(12px, 4vw, 50px);
            margin: 22px auto;
            max-width: 850px;
            text-align: center;
        }

        .stumpsLogoTeam {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            flex-direction: column;
            gap: 8px;
        }

        .stumpsLogoTeam img {
            width: clamp(70px, 10vw, 120px);
            height: clamp(70px, 10vw, 120px);
            object-fit: contain;
        }

        .stumpsLogoPlaceholder {
            width: 90px;
            height: 90px;
            display: grid;
            place-items: center;
            font-size: 35px;
            border: 1px dashed var(--accent, #22c55e);
            border-radius: 12px;
        }

        .stumpsLogoName {
            font-family: Orbitron, sans-serif;
            font-size: clamp(10px, 1.5vw, 15px);
            font-weight: bold;
            overflow-wrap: anywhere;
        }

        .stumpsLogoVS {
            font-family: Orbitron, sans-serif;
            font-size: clamp(20px, 3vw, 32px);
            font-weight: bold;
            color: var(--accent, #22c55e);
        }

    `;

    document.head.appendChild(style);

    // =====================================
    // COMPRESS UPLOADED IMAGE
    // =====================================

    function compressLogo(file) {

        return new Promise((resolve, reject) => {

            const image = new Image();
            const url = URL.createObjectURL(file);

            image.onload = () => {

                const canvas = document.createElement("canvas");

                const scale = Math.min(
                    1,
                    220 / Math.max(
                        image.naturalWidth,
                        image.naturalHeight
                    )
                );

                canvas.width = Math.max(
                    1,
                    Math.round(image.naturalWidth * scale)
                );

                canvas.height = Math.max(
                    1,
                    Math.round(image.naturalHeight * scale)
                );

                canvas.getContext("2d").drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                URL.revokeObjectURL(url);

                resolve(canvas.toDataURL("image/png"));

            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Invalid image"));
            };

            image.src = url;

        });

    }

    // =====================================
    // SAVE LOGO
    // =====================================

    function saveLogo(teamName, imageData) {

        const key = logoKey(teamName);

        if (!key) return false;

        const previous = savedLogos[key];

        savedLogos[key] = imageData;

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(savedLogos)
            );

            return true;

        } catch (error) {

            if (previous === undefined) {
                delete savedLogos[key];
            } else {
                savedLogos[key] = previous;
            }

            alert("Logo storage is full. Try a smaller image.");
            return false;

        }

    }

    // =====================================
    // SHOW LOGO UPLOAD DURING XI SELECTION
    // =====================================

    function showSquadLogoUpload(index) {

        const team = getTournamentTeam(index);

        const playerList =
            document.getElementById("tournamentPlayerList");

        if (!team || !playerList) return;

        const existing =
            document.getElementById("stumpsSquadLogoUpload");

        if (existing) existing.remove();

        const box = document.createElement("div");

        box.id = "stumpsSquadLogoUpload";
        box.className = "stumpsLogoUpload";

        const heading = document.createElement("h3");
        heading.textContent = "🛡️ TEAM LOGO";

        const description = document.createElement("p");
        description.textContent =
            "Upload a logo for " + team.name;

        const preview = document.createElement("img");
        preview.className = "stumpsLogoPreview";
        preview.alt = team.name + " logo";

        const existingLogo = getLogo(team.name);

        if (existingLogo) {
            preview.src = existingLogo;
        } else {
            preview.style.display = "none";
        }

        const input = document.createElement("input");

        input.type = "file";
        input.accept = "image/png,image/jpeg,image/webp";

        const status = document.createElement("p");
        status.textContent = existingLogo
            ? "✅ Logo already saved"
            : "Optional — PNG, JPG or WebP";

        input.addEventListener("change", async () => {

            const file = input.files[0];

            if (!file) return;

            if (![
                "image/png",
                "image/jpeg",
                "image/webp"
            ].includes(file.type)) {

                alert("Please upload a PNG, JPG or WebP image.");
                input.value = "";
                return;

            }

            try {

                status.textContent = "Uploading logo...";

                const imageData = await compressLogo(file);

                if (saveLogo(team.name, imageData)) {

                    preview.src = imageData;
                    preview.style.display = "block";

                    status.textContent = "✅ Logo saved!";

                } else {

                    status.textContent = "❌ Could not save logo.";

                }

            } catch (error) {

                status.textContent = "❌ Invalid image.";

            }

        });

        box.append(
            heading,
            description,
            preview,
            input,
            status
        );

        playerList.before(box);

    }

    // =====================================
    // LIVE MATCH LOGO DISPLAY
    // =====================================

    function createTeamDisplay(name) {

        const container = document.createElement("div");
        container.className = "stumpsLogoTeam";

        const imageData = getLogo(name);

        let visual;

        if (imageData) {

            visual = document.createElement("img");
            visual.src = imageData;
            visual.alt = name + " logo";

        } else {

            visual = document.createElement("div");
            visual.className = "stumpsLogoPlaceholder";
            visual.textContent = "🛡️";

        }

        const title = document.createElement("div");
        title.className = "stumpsLogoName";
        title.textContent = name;

        container.append(visual, title);

        return container;

    }

    function showMatchLogos(teamA, teamB) {

        if (!teamA || !teamB) return;

        const controls = document.querySelector(
            "#matchArea .stumpsMatchControls"
        );

        if (!controls) return;

        let panel = document.getElementById(
            "stumpsLogoMatchup"
        );

        if (!panel) {

            panel = document.createElement("div");
            panel.id = "stumpsLogoMatchup";

            controls.before(panel);

        }

        const vs = document.createElement("div");
        vs.className = "stumpsLogoVS";
        vs.textContent = "VS";

        panel.replaceChildren(
            createTeamDisplay(teamA),
            vs,
            createTeamDisplay(teamB)
        );

    }

    // =====================================
    // CONNECT TO EXISTING FUNCTIONS
    // =====================================

    function wrapFunction(name, callback) {

        const original = window[name];

        if (typeof original !== "function") return;

        window[name] = function (...args) {

            const result = original.apply(this, args);

            callback(...args);

            return result;

        };

    }

    function initialiseLogos() {

        // Upload logos when selecting Playing XI

        wrapFunction(
            "startTournamentTeamSelection",
            index => showSquadLogoUpload(index)
        );

        // Identify current tournament fixture

        wrapFunction(
            "playTournamentMatch",
            index => {

                try {

                    const fixture = tournamentFixtures[index];

                    if (!fixture) return;

                    const nameA =
                        fixture.teamA?.name || fixture.teamA;

                    const nameB =
                        fixture.teamB?.name || fixture.teamB;

                    if (
                        typeof nameA === "string" &&
                        typeof nameB === "string"
                    ) {

                        currentMatchTeams = [nameA, nameB];

                        showMatchLogos(nameA, nameB);

                    }

                } catch (error) {

                    console.warn(
                        "STUMPS: Could not identify fixture",
                        error
                    );

                }

            }
        );

        // Refresh display when match starts

        wrapFunction(
            "startMatch",
            () => {

                if (currentMatchTeams) {

                    showMatchLogos(
                        currentMatchTeams[0],
                        currentMatchTeams[1]
                    );

                }

            }
        );

    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initialiseLogos,
            { once: true }
        );

    } else {

        initialiseLogos();

    }

})();
