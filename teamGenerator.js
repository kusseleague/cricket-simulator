let teamA = [];
let teamB = [];

let score = 0;
let wickets = 0;
let balls = 0;

let battingTeam = [];
let bowlingTeam = [];

let striker;
let nonStriker;
let currentBowler;
let commentary = "";
console.log(players.length);
console.log(players.map(player => player.role));

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}


function pickPlayers(list, amount) {
    return shuffle([...list]).slice(0, amount);
}


function createBalancedTeam(availablePlayers) {

    let wicketkeepers = availablePlayers.filter(
        player => player.role === "Wicketkeeper"
    );

    let batters = availablePlayers.filter(
        player => player.role === "Batsman"
    );

    let allRounders = availablePlayers.filter(
        player => player.role === "All Rounder"
    );

    let bowlers = availablePlayers.filter(
        player => player.role === "Bowler"
    );


    let team = [];

    team.push(...pickPlayers(wicketkeepers, 1));
    team.push(...pickPlayers(batters, 4));
    team.push(...pickPlayers(allRounders, 3));
    team.push(...pickPlayers(bowlers, 3));


    return team;
}


function calculateRating(team) {

    let batting = 0;
    let bowling = 0;
    let stamina = 0;


    team.forEach(player => {

        batting += player.bat;
        bowling += player.bowl;
        stamina += player.stamina;

    });


    return {

        batting: Math.round(batting / team.length),
        bowling: Math.round(bowling / team.length),
        stamina: Math.round(stamina / team.length),

        overall: Math.round(
            (batting + bowling + stamina) / (team.length * 3)
        )

    };

}


function displayTeam(name, team) {

    let rating = calculateRating(team);

    let output = `<h2>${name}</h2>`;


    team.forEach((player, index) => {

        output += 
        `${index + 1}. ${player.name} 
        (${player.role}) 
        - Bat: ${player.bat}% 
        Bowl: ${player.bowl}% 
        Stamina: ${player.stamina}%<br>`;

    });


    output += `
    <br>
    <b>Batting:</b> ${rating.batting}%<br>
    <b>Bowling:</b> ${rating.bowling}%<br>
    <b>Stamina:</b> ${rating.stamina}%<br>
    <b>Overall:</b> ${rating.overall}%<br>
    `;


    return output;
}



function showTeams() {


    let shuffledPool = shuffle([...players]);


    teamA = createBalancedTeam(shuffledPool);


    let remainingPlayers = shuffledPool.filter(
        player => !teamA.includes(player)
    );


  teamB = createBalancedTeam(remainingPlayers);


    let output = "";

    output += displayTeam("🏏 TEAM A", teamA);

    output += "<hr>";

    output += displayTeam("🏏 TEAM B", teamB);


    document.getElementById("teams").innerHTML = output;

    document.getElementById("matchSetup").style.display = "block";

}

function tossWinner(team) {

    let message = "";

    if(team === "A"){
        message = "🪙 Team A won the toss!";
    }
    else{
        message = "🪙 Team B won the toss!";
    }

    document.getElementById("batBowlChoice").innerHTML =
    `
    <h3>${message}</h3>

    <p>What do they choose?</p>

    <button onclick="chooseDecision('Bat')">
    🏏 Bat First
    </button>

    <button onclick="chooseDecision('Bowl')">
    ⚾ Bowl First
    </button>
    `;
}



function randomToss(){

    let winner = Math.random() < 0.5 ? "A" : "B";

    tossWinner(winner);

}


function chooseDecision(choice){

    document.getElementById("batBowlChoice").innerHTML +=
    `
    <h3>
    ${choice === "Bat" ? "🏏 They chose to Bat First!" : "⚾ They chose to Bowl First!"}
    </h3>

    <button onclick="startMatch()">
    🚀 Start Match
    </button>
    `;

}


function startMatch(){

    document.getElementById("matchSetup").style.display = "none";

    document.getElementById("matchArea").style.display = "block";


    // Temporary setup:
    // Team A bats, Team B bowls

    battingTeam = teamA;
    bowlingTeam = teamB;


    striker = battingTeam[0];
    nonStriker = battingTeam[1];

    currentBowler = bowlingTeam.find(
        player => player.role === "Bowler"
    );
console.log("Team A:", teamA);
console.log("Team B:", teamB);
console.log("Batting:", battingTeam);
console.log("Bowling:", bowlingTeam);
console.log("Striker:", striker);
console.log("Bowler:", currentBowler);

    document.getElementById("scoreboard").innerHTML =
    `
    <h3>🏏 LIVE MATCH</h3>

    Score: 0/0

    <br>

    Overs: 0.0

    <br><br>

    🏏 Striker:
    ${striker.name}

    <br>

    🏏 Non-Striker:
    ${nonStriker.name}

    <br>

    ⚾ Bowler:
    ${currentBowler.name}

    <br><br>

    Ready for the first ball!
    `;

}



function nextBall(){

    let batsmanStrength = striker.bat;
    let bowlerStrength = currentBowler.bowl;


    let chance = Math.random()*100;


    let result;


    let difference = batsmanStrength - bowlerStrength;


    // wicket chance increases against strong bowlers
    let wicketChance = 8 - (difference/15);


    if(chance < wicketChance){

        result = "W";

    }

    else if(chance < 20 + difference/2){

        result = 6;

    }

    else if(chance < 45 + difference/2){

        result = 4;

    }

    else if(chance < 70){

        result = 1;

    }

    else if(chance < 85){

        result = 2;

    }

    else{

        result = 0;

    }


if(result === "W"){

    wickets++;

    commentary =
    `💥 OUT! ${striker.name} is dismissed by ${currentBowler.name}!`;

   striker = battingTeam[2 + wickets] || null;

}

else{

    score += result;


    if(result === 0){

        commentary =
        `${currentBowler.name} bowls a dot ball. ${striker.name} cannot score.`;

    }

    else if(result === 4){

        commentary =
        `🔥 FOUR! ${striker.name} finds the boundary off ${currentBowler.name}!`;

    }

    else if(result === 6){

        commentary =
        `🚀 SIX! ${striker.name} smashes ${currentBowler.name} into the stands!`;

    }

    else{

        commentary =
        `${striker.name} takes ${result} run${result > 1 ? "s" : ""}.`;

    }

}


    balls++;


    // change striker every over
    if(balls % 6 === 0){

        let temp = striker;

        striker = nonStriker;

        nonStriker = temp;

    }


    let overs = Math.floor(balls/6) + "." + (balls%6);



    document.getElementById("scoreboard").innerHTML =
    `

    <h3>🏏 LIVE MATCH</h3>

    Score: ${score}/${wickets}

    <br>

    Overs: ${overs}

    <br><br>

    🏏 Striker:
    ${striker ? striker.name : "ALL OUT"}

    <br>

    🏏 Non-Striker:
    ${nonStriker ? nonStriker.name : "-"}

    <br>

    ⚾ Bowler:
    ${currentBowler.name}

    <br><br>

   Commentary:

${commentary}

    `;

}
