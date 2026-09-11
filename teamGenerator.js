// ===============================
// STUMPS CRICKET SIMULATOR
// TEAM + MATCH ENGINE
// ===============================


// TEAMS
let teamA = [];
let teamB = [];


// MATCH VARIABLES
let score = 0;
let wickets = 0;
let balls = 0;

let firstInningsBalls = 0;
let secondInningsBalls = 0;

let firstInningsWickets = 0;
let secondInningsWickets = 0;

let target = 0;
let firstInningsScore = 0;
let secondInnings = false;
let matchOver = false;

let battingTeam = [];
let bowlingTeam = [];

let currentFirstInningsTeam = null;
let currentSecondInningsTeam = null;

let striker;
let nonStriker;
let currentBowler;
let bowlerIndex = 0;

let batsmanStats = {};
let newBatsmanSettling = false;
let bowlerStats = {};
let commentary = "";

let autoPlayTimer = null;
let matchSession = 0;

// ===============================
// RANDOM FUNCTIONS
// ===============================


function shuffle(array){

    return array.sort(() => Math.random() - 0.5);

}


function pickPlayers(list, amount){

    return shuffle([...list]).slice(0, amount);

}



// ===============================
// TEAM GENERATOR
// ===============================


function createBalancedTeam(pool){


    let team = [];


    let keepers = pool.filter(
        p => p.role === "Wicketkeeper"
    );


    let batsmen = pool.filter(
        p => p.role === "Batsman"
    );


    let allRounders = pool.filter(
        p => p.role === "All Rounder"
    );


    let bowlers = pool.filter(
        p => p.role === "Bowler" || p.role === "All Rounder"
    );



    team.push(...pickPlayers(keepers,1));

    team.push(...pickPlayers(batsmen,4));

    team.push(...pickPlayers(allRounders,3));

    team.push(...pickPlayers(bowlers,3));



    // safety if less than 11

    while(team.length < 11){

        let extra = pool.find(
            p => !team.includes(p)
        );

        if(extra){
            team.push(extra);
        }
        else{
            break;
        }

    }


    return team;

}





function displayTeam(name,team){


    let html = `<h2>${name}</h2>`;


    team.forEach((player,index)=>{


        html += 
        `${index+1}. ${player.name} 
        (${player.role})<br>`;

    });



    html += `<br>
    Squad Size: ${team.length}
    `;


    return html;

}





// ===============================
// CREATE TEAMS BUTTON
// ===============================


function showTeams(){


    let pool = shuffle([...players]);



    teamA = createBalancedTeam(pool);



    let remaining = pool.filter(
        p => !teamA.includes(p)
    );



    teamB = createBalancedTeam(remaining);



    document.getElementById("teams").innerHTML =

    displayTeam("🏏 TEAM A",teamA)

    +

    "<hr>"

    +

    displayTeam("🏏 TEAM B",teamB);



    document.getElementById("matchSetup").style.display="block";



    console.log(teamA);
    console.log(teamB);


}





// ===============================
// TOSS SYSTEM
// ===============================


function tossWinner(team){

    let winnerName;

    if(
        currentTournamentFixtureIndex !== null &&
        tournamentFixtures[currentTournamentFixtureIndex]
    ){

        let fixture =
            tournamentFixtures[currentTournamentFixtureIndex];

        winnerName =
            team === "A"
            ? fixture.teamA.name
            : fixture.teamB.name;

    }

    else{

        winnerName =
            team === "A"
            ? "Team A"
            : "Team B";

    }


    let message =
        `🪙 ${winnerName} won the toss!`;


    document.getElementById("batBowlChoice").innerHTML =

    `
    <h3>${message}</h3>

    <button onclick="chooseDecision('Bat','${team}')">
    🏏 Bat First
    </button>

    <button onclick="chooseDecision('Bowl','${team}')">
    ⚾ Bowl First
    </button>
    `;

}





function randomToss(){

    let winner =
    Math.random()<0.5
    ?
    "A"
    :
    "B";


    tossWinner(winner);

}





function chooseDecision(choice,winner){


    if(choice==="Bat"){


        battingTeam =
        winner==="A"
        ?
        teamA
        :
        teamB;



        bowlingTeam =
        winner==="A"
        ?
        teamB
        :
        teamA;


    }


    else{


        battingTeam =
        winner==="A"
        ?
        teamB
        :
        teamA;



        bowlingTeam =
        winner==="A"
        ?
        teamA
        :
        teamB;


    }



    document.getElementById("batBowlChoice").innerHTML =

    `
    <h3>
    ${choice==="Bat"
    ?
    "🏏 Batting First!"
    :
    "⚾ Bowling First!"}
    </h3>


    <button onclick="startMatch()">
    🚀 Start Match
    </button>

    `;


}






// ===============================
// START MATCH
// ===============================


function startMatch(){

    // Stop any Auto Play from the previous match
    if(autoPlayTimer){
        clearTimeout(autoPlayTimer);
        autoPlayTimer = null;
    }

    matchSession++;

    // RESET MATCH COMPLETELY
    bowlerStats = {};

    score = 0;
    wickets = 0;
    balls = 0;

    target = 0;
    firstInningsScore = 0;

    secondInnings = false;
    matchOver = false;

    newBatsmanSettling = false;

    bowlerIndex = 0;

    // ===============================
    // IDENTIFY TOURNAMENT TEAMS
    // ===============================

    if(
        currentTournamentFixtureIndex !== null &&
        tournamentFixtures[currentTournamentFixtureIndex]
    ){

        let fixture =
            tournamentFixtures[currentTournamentFixtureIndex];

        currentFirstInningsTeam =
            battingTeam === teamA
            ? fixture.teamA
            : fixture.teamB;

        currentSecondInningsTeam =
            battingTeam === teamA
            ? fixture.teamB
            : fixture.teamA;
    }


    document.getElementById("matchSetup").style.display="none";

    document.getElementById("matchArea").style.display="block";

 document.querySelector(
    "button[onclick='nextBall()']"
).style.display = "inline-block";

let autoButton =
    document.querySelector(
        "button[onclick='autoPlayMatch()']"
    );

if(autoButton){
    autoButton.style.display = "inline-block";
}

    striker = battingTeam[0];

    nonStriker = battingTeam[1];
battingTeam.forEach(player => {

    batsmanStats[player.name] = {

        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        out: false

    };

});


let bowlers = bowlingTeam.filter(
    p => p.role === "Bowler" || p.role === "All Rounder"
);

currentBowler = bowlers[0];

bowlingTeam.forEach(player => {

    if(
        player.role === "Bowler" ||
        player.role === "All Rounder"
    ){

        bowlerStats[player.name] = {
            
    balls: 0,
    runs: 0,
    wickets: 0,
    overs: 0
       };

    }

});


    updateScoreboard(
        "Match Started!"
    );


}

// ===============================
// FINISH MATCH
// ===============================

function finishMatch(winnerTeam, secondInningsFinalScore){

    if(matchOver){
        return;
    }

    if(autoPlayTimer){
        clearTimeout(autoPlayTimer);
        autoPlayTimer = null;
    }

    matchOver = true;

    // ===============================
    // TOURNAMENT MATCH
    // ===============================

    if(
        currentTournamentFixtureIndex !== null &&
        tournamentFixtures[currentTournamentFixtureIndex]
    ){

        let fixture =
            tournamentFixtures[currentTournamentFixtureIndex];

        // Prevent duplicate result processing
        if(!fixture.played){

            let scoreA;
            let scoreB;

            // Work out which tournament team batted first

            if(currentFirstInningsTeam === fixture.teamA){

                scoreA = firstInningsScore;
                scoreB = secondInningsFinalScore;

            }

            else{

                scoreA = secondInningsFinalScore;
                scoreB = firstInningsScore;

            }

            // Save result

           fixture.played = true;

fixture.scoreA = scoreA;
fixture.scoreB = scoreB;

fixture.wicketsA =
    currentFirstInningsTeam === fixture.teamA
    ? firstInningsWickets
    : secondInningsWickets;

fixture.wicketsB =
    currentFirstInningsTeam === fixture.teamA
    ? secondInningsWickets
    : firstInningsWickets;

fixture.oversA =
    currentFirstInningsTeam === fixture.teamA
    ? Math.floor(firstInningsBalls / 6) + "." + (firstInningsBalls % 6)
    : Math.floor(secondInningsBalls / 6) + "." + (secondInningsBalls % 6);

fixture.oversB =
    currentFirstInningsTeam === fixture.teamA
    ? Math.floor(secondInningsBalls / 6) + "." + (secondInningsBalls % 6)
    : Math.floor(firstInningsBalls / 6) + "." + (firstInningsBalls % 6);

fixture.winner = winnerTeam;
// ===============================
// KNOCKOUT MATCH
// ===============================

if(
    fixture.stage === "qualifier" ||
    fixture.stage === "eliminator" ||
    fixture.stage === "third" ||
    fixture.stage === "final"
){

    // ===============================
    // QUALIFIER
    // ===============================

    if(fixture.stage === "qualifier"){

        let qualifierWinner = winnerTeam;

        let qualifierLoser =
            winnerTeam === fixture.teamA
            ? fixture.teamB
            : fixture.teamA;

        // Find the original 3rd place team

        let sortedTeams = [...tournamentTeams].sort((a,b) => {

            if(b.points !== a.points){
                return b.points - a.points;
            }

            if(b.nrr !== a.nrr){
                return b.nrr - a.nrr;
            }

            return b.wins - a.wins;

        });

        let thirdTeam = sortedTeams[2];

        // Create Eliminator

        if(!eliminatorCreated){

            tournamentFixtures.push({

                teamA: qualifierLoser,
                teamB: thirdTeam,

                stage: "eliminator",

                played: false,

                scoreA: null,
                scoreB: null,

                winner: null

            });

            eliminatorCreated = true;

        }

    }


    // ===============================
    // ELIMINATOR
    // ===============================

    else if(fixture.stage === "eliminator"){

        let eliminatorWinner = winnerTeam;

        let eliminatorLoser =
            winnerTeam === fixture.teamA
            ? fixture.teamB
            : fixture.teamA;

        // Find original 4th place team

        let sortedTeams = [...tournamentTeams].sort((a,b) => {

            if(b.points !== a.points){
                return b.points - a.points;
            }

            if(b.nrr !== a.nrr){
                return b.nrr - a.nrr;
            }

            return b.wins - a.wins;

        });

        let fourthTeam = sortedTeams[3];

        // Create 3rd Place Playoff

        if(!thirdPlaceCreated){

            tournamentFixtures.push({

                teamA: eliminatorLoser,
                teamB: fourthTeam,

                stage: "third",

                played: false,

                scoreA: null,
                scoreB: null,

                winner: null

            });

            thirdPlaceCreated = true;

        }

        // Find Qualifier

        let qualifier =
            tournamentFixtures.find(
                f => f.stage === "qualifier"
            );

        // Create Final

        if(!finalCreated){

            tournamentFixtures.push({

                teamA: qualifier.winner,
                teamB: eliminatorWinner,

                stage: "final",

                played: false,

                scoreA: null,
                scoreB: null,

                winner: null

            });

            finalCreated = true;

        }

    }


    // ===============================
    // 3RD PLACE PLAYOFF
    // ===============================

    else if(fixture.stage === "third"){

        tournamentThirdPlace = winnerTeam;

    }


    // ===============================
    // FINAL
    // ===============================

    else if(fixture.stage === "final"){

        tournamentChampion = winnerTeam;

        tournamentRunnerUp =
            winnerTeam === fixture.teamA
            ? fixture.teamB
            : fixture.teamA;

    }


    // ===============================
    // DISPLAY KNOCKOUT RESULT
    // ===============================

    displayFixtures();

    document.getElementById("scoreboard").innerHTML =
    `
    <h2>🏆 MATCH RESULT</h2>

    <h3>🏆 ${winnerTeam.name} WINS!</h3>

    <br>

    ${fixture.teamA.name}:
    ${fixture.scoreA}

    <br>

    ${fixture.teamB.name}:
    ${fixture.scoreB}

    <br><br>

    <button onclick="returnToTournament()">
        🏆 TOURNAMENT
    </button>
    `;

    // Hide Next Ball

    let nextButton =
        document.querySelector(
            "button[onclick='nextBall()']"
        );

    if(nextButton){
        nextButton.style.display = "none";
    }

    // Hide Auto Play

    let autoButton =
        document.querySelector(
            "button[onclick='autoPlayMatch()']"
        );

    if(autoButton){
        autoButton.style.display = "none";
    }

    return;

}
       // Update tournament statistics

            fixture.teamA.played++;
            fixture.teamB.played++;

fixture.teamA.runsFor += scoreA;
fixture.teamB.runsFor += scoreB;

fixture.teamA.runsAgainst += scoreB;
fixture.teamB.runsAgainst += scoreA;

fixture.teamA.ballsFaced +=
    currentFirstInningsTeam === fixture.teamA
    ? firstInningsBalls
    : secondInningsBalls;

fixture.teamB.ballsFaced +=
    currentFirstInningsTeam === fixture.teamA
    ? secondInningsBalls
    : firstInningsBalls;

fixture.teamA.ballsBowled +=
    currentFirstInningsTeam === fixture.teamA
    ? secondInningsBalls
    : firstInningsBalls;

fixture.teamB.ballsBowled +=
    currentFirstInningsTeam === fixture.teamA
    ? firstInningsBalls
    : secondInningsBalls;
            fixture.teamA.nrr =
    (fixture.teamA.runsFor / (fixture.teamA.ballsFaced / 6)) -
    (fixture.teamA.runsAgainst / (fixture.teamA.ballsBowled / 6));

fixture.teamB.nrr =
    (fixture.teamB.runsFor / (fixture.teamB.ballsFaced / 6)) -
    (fixture.teamB.runsAgainst / (fixture.teamB.ballsBowled / 6));
            winnerTeam.wins++;
            winnerTeam.points += 2;

            let loserTeam =
                winnerTeam === fixture.teamA
                ? fixture.teamB
                : fixture.teamA;

            loserTeam.losses++;

            // ===============================
// CHECK GROUP STAGE COMPLETION
// ===============================

let groupFixtures =
    tournamentFixtures.filter(
        fixture => fixture.stage === "group"
    );

let groupStageComplete =
    groupFixtures.length > 0 &&
    groupFixtures.every(
        fixture => fixture.played
    );

console.log(
    "GROUP CHECK:",
    "fixtures =", groupFixtures.length,
    "complete =", groupStageComplete,
    "knockoutStarted =", knockoutStarted
);

if(groupStageComplete && !knockoutStarted){

    console.log("🔥 GENERATING KNOCKOUTS");

    generateKnockoutStage();

}
        
        }
        // Update tournament screens

        displayPointsTable();
        displayFixtures();

        // Calculate final scores again for display

        let finalScoreA;
        let finalScoreB;

        if(currentFirstInningsTeam === fixture.teamA){

            finalScoreA = firstInningsScore;
            finalScoreB = secondInningsFinalScore;

        }

        else{

            finalScoreA = secondInningsFinalScore;
            finalScoreB = firstInningsScore;

        }

        // Show result

        document.getElementById("scoreboard").innerHTML =
        `
        <h2>🏆 MATCH RESULT</h2>

        <h3>🏆 ${winnerTeam.name} WINS!</h3>

        <br>

        ${fixture.teamA.name}:
        ${finalScoreA}

        <br>

        ${fixture.teamB.name}:
        ${finalScoreB}

        <button onclick="returnToTournament()">
            🏆 TOURNAMENT
        </button>
        `;

        document.querySelector(
            "button[onclick='nextBall()']"
        ).style.display = "none";

        let autoButton =
            document.querySelector(
                "button[onclick='autoPlayMatch()']"
            );

        if(autoButton){
            autoButton.style.display = "none";
        }

        return;
    }

    // ===============================
    // NORMAL MATCH
    // ===============================

    document.getElementById("scoreboard").innerHTML =
    `
    <h2>🏆 MATCH RESULT</h2>

    <h3>🏆 ${winnerTeam.name} WINS!</h3>

    <br>

    Final Score:
    ${secondInningsFinalScore}/${wickets}

    `;

    document.querySelector(
        "button[onclick='nextBall()']"
    ).style.display = "none";

    let autoButton =
        document.querySelector(
            "button[onclick='autoPlayMatch()']"
        );

    if(autoButton){
        autoButton.style.display = "none";
    }

}



// ===============================
// NEXT BALL
// ===============================


function nextBall(){


    let battingPower = striker.bat;

    let bowlingPower = currentBowler.bowl;



    let difference =
    battingPower - bowlingPower;



    let chance =
    Math.random()*100;



    let result;



   if(chance < 8){

    result = "W";

}

else if(newBatsmanSettling){

    // New batsman has a 70% chance of NOT hitting a boundary

    let settlingChance = Math.random() * 100;

    if(settlingChance < 70){

        // Safe outcomes only: 0, 1 or 2

        let safeChance = Math.random() * 100;

        if(safeChance < 40){

            result = 0;

        }

        else if(safeChance < 75){

            result = 1;

        }

        else{

            result = 2;

        }

    }

    else{

        // 30% chance: use normal batting ability

        if(chance < 20 + difference/2){

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

    }

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



    if(result==="W"){

    if(striker && batsmanStats[striker.name]){

        batsmanStats[striker.name].out = true;

    }

    wickets++;

    if(currentBowler && bowlerStats[currentBowler.name]){

        bowlerStats[currentBowler.name].wickets++;

    }

    commentary =
        `💥 OUT! ${striker.name} dismissed by ${currentBowler.name}`;

    balls++;
if(secondInnings){
    secondInningsBalls++;
} else {
    firstInningsBalls++;
}
    if(currentBowler && bowlerStats[currentBowler.name]){

        bowlerStats[currentBowler.name].balls++;

    }

    // ===============================
    // ALL OUT
    // ===============================

    if(wickets >= 10){

        striker = null;

        // Let the innings-end section below
        // handle the change of innings.

    }

    else{

        // Normal wicket — bring in a new batsman

        striker = null;
        newBatsmanSettling = true;

        showNextBatsman();

        return;

    }

}



 if(result !== "W"){


        score += result;
if(currentBowler && bowlerStats[currentBowler.name]){

    bowlerStats[currentBowler.name].runs += result;

}
    batsmanStats[striker.name].runs += result;



        if(result===6){
batsmanStats[striker.name].sixes++;
            commentary =
            `🚀 SIX! ${striker.name} hits ${currentBowler.name}`;

        }

        else if(result===4){
batsmanStats[striker.name].fours++;
            commentary =
            `🔥 FOUR! ${striker.name} finds the boundary`;

        }

        else if(result===0){

            commentary =
            `Dot ball by ${currentBowler.name}`;

        }

        else{

            commentary =
            `${striker.name} scores ${result}`;

        }



    }


if(striker && batsmanStats[striker.name]){

    batsmanStats[striker.name].balls++;

}

balls++;
if(currentBowler && bowlerStats[currentBowler.name]){

    bowlerStats[currentBowler.name].balls++;

}

// ===============================
// CHECK SECOND INNINGS CHASE
// ===============================

if(secondInnings && score >= target){

    finishMatch(
        currentSecondInningsTeam,
        score
    );

    return;

}


// CHECK INNINGS END

if(wickets >= 10 || balls >= 120){
    if(!secondInnings){

        firstInningsScore = score;
        
        firstInningsWickets = wickets;
firstInningsBalls = balls;
        
        target = score + 1;

        secondInnings = true;

        score = 0;
        wickets = 0;
        balls = 0;

        let temp = battingTeam;
        battingTeam = bowlingTeam;
        bowlingTeam = temp;


        striker = battingTeam[0];
        nonStriker = battingTeam[1];
battingTeam.forEach(player => {

    batsmanStats[player.name] = {

        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        out: false

    };

});

      let bowlers = bowlingTeam.filter(
    p => p.role === "Bowler" || p.role === "All Rounder"
);

currentBowler = bowlers[0];


// RESET BOWLER STATS FOR SECOND INNINGS

bowlerStats = {};

bowlingTeam.forEach(player => {

    if(player.role === "Bowler"){

        bowlerStats[player.name] = {

            balls: 0,
            runs: 0,
            wickets: 0

        };

    }

});


        document.getElementById("scoreboard").innerHTML =
        `
        <h2>🏏 SECOND INNINGS</h2>

        Target:
        ${target}

        <br><br>

        Score:
        0/0

        <br>

        Overs:
        0.0

        <br><br>

        🏏 ${striker.name}
        <br>
        🏏 ${nonStriker.name}
        <br>
        ⚾ ${currentBowler.name}

        `;


        return;
    }
// ===============================
// SECOND INNINGS FINISHED
// ALL OUT / 20 OVERS
// ===============================
secondInningsWickets = wickets;
secondInningsBalls = balls;
    
finishMatch(
    currentFirstInningsTeam,
    score
);

return;

}

  if(balls % 6 === 0){

    // Swap batsmen at the end of the over

    let temp = striker;

    striker = nonStriker;

    nonStriker = temp;

newBatsmanSettling = false;
      
    // Find bowlers who can bowl

    let availableBowlers = bowlingTeam.filter(player => {

       if(
    player.role !== "Bowler" &&
    player.role !== "All Rounder"
){
    return false;
}

        if(!bowlerStats[player.name]){
            return false;
        }

        // Maximum 4 overs

        if(bowlerStats[player.name].balls >= 24){
            return false;
        }

        // Same bowler cannot bowl consecutive overs

        if(player === currentBowler){
            return false;
        }

        return true;

    });


    chooseNextBowler(availableBowlers);

    return;

}
    updateScoreboard(
        commentary
    );


}


function autoPlayMatch(){

    if(matchOver){
        return;
    }

    const thisSession = matchSession;

    // If there is no striker because of a wicket,
    // automatically bring in the next batsman

    if(striker === null){

        let available = battingTeam.filter(player => {

            return !batsmanStats[player.name].out &&
                   player !== nonStriker;

        });

        if(available.length === 0){
            return;
        }

        striker = available[0];

        newBatsmanSettling = true;
    }

    // Play one ball
    nextBall();

    // Stop if this match has finished
    if(matchOver || thisSession !== matchSession){
        return;
    }

    autoPlayTimer = setTimeout(function(){

        // Make sure this is still the same match
        if(matchOver || thisSession !== matchSession){
            return;
        }

        // If a wicket happened, bring in the next batsman
        if(striker === null){

            let available = battingTeam.filter(player => {

                return !batsmanStats[player.name].out &&
                       player !== nonStriker;

            });

            if(available.length > 0){

                striker = available[0];

                newBatsmanSettling = true;

                autoPlayMatch();

            }

            return;
        }

        // Continue automatically
        autoPlayMatch();

    }, 100);

}


// ===============================
// DISPLAY
// ===============================


function updateScoreboard(message){

    let overs =
        Math.floor(balls / 6)
        +
        "."
        +
        (balls % 6);


    // ===============================
    // RUN RATES
    // ===============================

    let currentRunRate = 0;
    let requiredRunRate = 0;

    if(balls > 0){

        currentRunRate =
            (score / balls) * 6;

    }


    if(secondInnings && balls < 120){

        let runsNeeded =
            Math.max(target - score, 0);

        let ballsRemaining =
            120 - balls;

        if(ballsRemaining > 0){

            requiredRunRate =
                (runsNeeded / ballsRemaining) * 6;

        }

    }


    // ===============================
    // CHASE INFORMATION
    // ===============================

    let chaseInfo = "";

    if(secondInnings){

        let runsNeeded =
            Math.max(target - score, 0);

        let ballsRemaining =
            Math.max(120 - balls, 0);


        if(score < target){

            chaseInfo = `
                <br>

                ${
                    currentFirstInningsTeam === tournamentFixtures[currentTournamentFixtureIndex].teamA
                    ?
                    tournamentFixtures[currentTournamentFixtureIndex].teamB.name
                    :
                    tournamentFixtures[currentTournamentFixtureIndex].teamA.name
                }

                need ${runsNeeded}
                runs from ${ballsRemaining}
                balls

                <br>

                📈 CRR: ${currentRunRate.toFixed(2)}
                |
                📊 RRR: ${requiredRunRate.toFixed(2)}

                <br>
            `;

        }

    }


    document.getElementById("scoreboard").innerHTML =

    `
    <h2>🏏 LIVE MATCH</h2>

    Score:
    ${score}/${wickets}

    <br>

    Overs:
    ${overs}

    ${chaseInfo}

    <br><br>

    🏏 Batting:

    <br><br>

    ${striker ? striker.name : "ALL OUT"}
    ${striker && batsmanStats[striker.name]
    ? batsmanStats[striker.name].runs
        + " ("
        + batsmanStats[striker.name].balls
        + ")"
    : ""}

    ⭐

    <br>

    ${nonStriker ? nonStriker.name : "-"}
    ${nonStriker && batsmanStats[nonStriker.name]
    ? batsmanStats[nonStriker.name].runs
        + " ("
        + batsmanStats[nonStriker.name].balls
        + ")"
    : ""}

    <br>

    ⚾ Bowler:
    ⚾ Bowling:

    <br><br>

    ${currentBowler ? currentBowler.name : "-"}

    <br>

    ${
    currentBowler && bowlerStats[currentBowler.name]
    ?
    Math.floor(
        bowlerStats[currentBowler.name].balls / 6
    )
    +
    "."
    +
    (
        bowlerStats[currentBowler.name].balls % 6
    )
    +
    " overs | "
    +
    bowlerStats[currentBowler.name].runs
    +
    " runs | "
    +
    bowlerStats[currentBowler.name].wickets
    +
    " wickets"
    :
    ""
    }

    <br><br>

    🗣 Commentary:

    <br>

    ${message}

    `;

}
// ===============================
// PLAYER SELECTION SYSTEM
// ===============================

function startTeamSelection(){

    document.getElementById("teamSelection").style.display = "block";

    loadPlayerDropdowns();

}


function loadPlayerDropdowns(){

    let selectA = document.getElementById("playerSelectA");
    let selectB = document.getElementById("playerSelectB");

    selectA.innerHTML = '<option value="">Select a player</option>';
    selectB.innerHTML = '<option value="">Select a player</option>';


    players.forEach((player,index) => {

        let optionA = document.createElement("option");

        optionA.value = index;
        optionA.textContent =
            player.name + " (" + player.role + ")";

        selectA.appendChild(optionA);


        let optionB = document.createElement("option");

        optionB.value = index;
        optionB.textContent =
            player.name + " (" + player.role + ")";

        selectB.appendChild(optionB);

    });

}
// ===============================
// SELECTED TEAM PLAYERS
// ===============================

function addPlayerToTeam(team){

    let select = document.getElementById(
        team === "A" ? "playerSelectA" : "playerSelectB"
    );

    let playerIndex = select.value;

    if(playerIndex === ""){
        return;
    }

    let player = players[playerIndex];

    // Make sure player isn't already selected
    if(teamA.includes(player) || teamB.includes(player)){

        alert("This player is already in a team!");

        return;
    }

    if(team === "A"){

        if(teamA.length >= 11){

            alert("Team A already has 11 players!");

            return;
        }

        teamA.push(player);

    }

    else{

        if(teamB.length >= 11){

            alert("Team B already has 11 players!");

            return;
        }

        teamB.push(player);

    }

    displaySelectedTeams();

    select.value = "";

}


// ===============================
// DISPLAY SELECTED TEAMS
// ===============================

function displaySelectedTeams(){

    let teamAHTML = `
        <h3>🏏 TEAM A — ${teamA.length}/11</h3>
    `;

    teamA.forEach((player,index) => {

        teamAHTML += `
            ${index + 1}. 
            ${player.name}
            (${player.role})
            <br>
        `;

    });


    let teamBHTML = `
        <h3>🏏 TEAM B — ${teamB.length}/11</h3>
    `;

    teamB.forEach((player,index) => {

        teamBHTML += `
            ${index + 1}. 
            ${player.name}
            (${player.role})
            <br>
        `;

    });


    document.getElementById("teamAList").innerHTML =
        teamAHTML;

    document.getElementById("teamBList").innerHTML =
        teamBHTML;

}
// ===============================
// CONFIRM SELECTED TEAMS
// ===============================

function confirmTeams(){

    if(teamA.length !== 11){

        document.getElementById("teamConfirmMessage").innerHTML =
        "❌ Team A needs 11 players.";

        return;
    }

    if(teamB.length !== 11){

        document.getElementById("teamConfirmMessage").innerHTML =
        "❌ Team B needs 11 players.";

        return;
    }


    document.getElementById("teamConfirmMessage").innerHTML =
    "✅ Teams confirmed!";


    document.getElementById("matchSetup").style.display = "block";

    document.getElementById("matchSetup").scrollIntoView({
        behavior: "smooth"
    });

}

function showNextBatsman(){

    let available = battingTeam.filter(player => {

        return !batsmanStats[player.name].out &&
               player !== nonStriker;

    });


    let options = "";

    available.forEach(player => {

        options += `
            <option value="${player.name}">
                ${player.name} (${player.role})
            </option>
        `;

    });


    document.getElementById("scoreboard").innerHTML += `

        <br><br>

        <h3>🏏 Choose Next Batsman</h3>

        <select id="nextBatsman">

            <option value="">
                Select batsman
            </option>

            ${options}

        </select>

        <button onclick="confirmNextBatsman()">
            🏏 Send In
        </button>

    `;

}

function confirmNextBatsman(){

    let selectedName =
        document.getElementById("nextBatsman").value;


    if(!selectedName){

        return;

    }


    striker =
        battingTeam.find(
            player => player.name === selectedName
        );


    updateScoreboard(
        `🏏 ${striker.name} comes to the crease!`
    );

}
// ===============================
// CHOOSE NEXT BOWLER
// ===============================

function chooseNextBowler(availableBowlers){

    let options = "";

    availableBowlers.forEach(player => {

        let stats = bowlerStats[player.name];

        let overs =
            Math.floor(stats.balls / 6)
            +
            "."
            +
            (stats.balls % 6);

        options += `
            <option value="${player.name}">
                ${player.name} — ${overs} overs
            </option>
        `;

    });


    document.getElementById("scoreboard").innerHTML += `

        <br><br>

        <h3>⚾ CHOOSE NEXT BOWLER</h3>

        <select id="nextBowler">

            <option value="">
                Select bowler
            </option>

            ${options}

        </select>

        <button onclick="confirmNextBowler()">
            ⚾ Bowl Over
        </button>

    `;

}

function confirmNextBowler(){

    let selectedName =
        document.getElementById("nextBowler").value;


    if(!selectedName){

        return;

    }


    currentBowler =
        bowlingTeam.find(
            player => player.name === selectedName
        );


    updateScoreboard(
        `⚾ ${currentBowler.name} will bowl the next over!`
    );

}

// ===============================
// TOURNAMENT MODE
// ===============================

let tournamentTeams = [];


// CREATE TEAM NAME BOXES

function createTeamNameInputs(){

    let count =
        Number(
            document.getElementById(
                "tournamentTeamCount"
            ).value
        );


    let container =
        document.getElementById(
            "teamNameInputs"
        );


    container.innerHTML = "";


    for(let i = 1; i <= count; i++){

        container.innerHTML += `

            <label>
                Team ${i} Name:
            </label>

            <input
                type="text"
                id="tournamentTeam${i}"
                placeholder="Enter team name"
            >

            <br><br>

        `;

    }

}

function createTournament(){

    let count =
        Number(
            document.getElementById(
                "tournamentTeamCount"
            ).value
        );


    tournamentTeams = [];
knockoutStarted = false;
semiFinalsCreated = false;
finalCreated = false;
thirdPlaceCreated = false;

tournamentChampion = null;
tournamentRunnerUp = null;
tournamentThirdPlace = null;

    for(let i = 1; i <= count; i++){

        let input =
            document.getElementById(
                "tournamentTeam" + i
            );


        let teamName =
            input.value.trim();


        if(teamName === ""){

            document.getElementById(
                "tournamentMessage"
            ).innerHTML =
                `❌ Please enter a name for Team ${i}.`;

            return;

        }


     tournamentTeams.push({

    name: teamName,

    players: [],

    played: 0,
    wins: 0,
    losses: 0,
    points: 0,
    nrr: 0,

runsFor: 0,
    runsAgainst: 0,
    ballsFaced: 0,
    ballsBowled: 0
         
});

    }


    document.getElementById(
        "tournamentMessage"
    ).innerHTML =

        `
        <h3>✅ Tournament Created!</h3>

        ${tournamentTeams
            .map(team => `🏏 ${team.name}`)
            .join("<br>")}

        `;
    displayTournamentTeams();
displayPointsTable();
generateFixtures();
}
// ===============================
// TOURNAMENT FIXTURE GENERATOR
// ===============================

let tournamentFixtures = [];
let currentTournamentFixtureIndex = null;

// ===============================
// KNOCKOUT STAGE
// ===============================

let knockoutStarted = false;

let qualifierCreated = false;
let eliminatorCreated = false;
let thirdPlaceCreated = false;
let finalCreated = false;

let tournamentChampion = null;
let tournamentRunnerUp = null;
let tournamentThirdPlace = null;

function generateFixtures(){

    tournamentFixtures = [];

    for(let i = 0; i < tournamentTeams.length; i++){

        for(let j = i + 1; j < tournamentTeams.length; j++){

            // FIRST MATCH

            tournamentFixtures.push({

                teamA: tournamentTeams[i],
                teamB: tournamentTeams[j],

                stage: "group",

                played: false,

                scoreA: null,
                scoreB: null

            });


            // REVERSE MATCH

            tournamentFixtures.push({

                teamA: tournamentTeams[j],
                teamB: tournamentTeams[i],

                stage: "group",

                played: false,

                scoreA: null,
                scoreB: null

            });

        }

    }

    displayFixtures();

}

    // ===============================
// CHECK SEMI-FINALS
// ===============================
// ===============================
// GENERATE KNOCKOUT STAGE
// ===============================

function generateKnockoutStage(){

    if(knockoutStarted){
        return;
    }

    knockoutStarted = true;

    // Rank teams using the same points-table rules

    let sortedTeams = [...tournamentTeams].sort((a,b) => {

        if(b.points !== a.points){
            return b.points - a.points;
        }

        if(b.nrr !== a.nrr){
            return b.nrr - a.nrr;
        }

        return b.wins - a.wins;

    });

    let first = sortedTeams[0];
    let second = sortedTeams[1];


    // ===============================
    // QUALIFIER
    // 1st vs 2nd
    // ===============================

    tournamentFixtures.push({

        teamA: first,
        teamB: second,

        stage: "qualifier",

        played: false,

        scoreA: null,
        scoreB: null,

        winner: null

    });

    qualifierCreated = true;

    displayFixtures();

}
  
function displayFixtures(){

    let html = `<h2>📅 TOURNAMENT FIXTURES</h2>`;

    tournamentFixtures.forEach((fixture,index) => {

        let matchTitle = `🏏 MATCH ${index + 1}`;

        if(fixture.stage === "semi"){
            matchTitle =
                fixture.semiNumber === 1
                ? "🥇 SEMI-FINAL 1"
                : "🥈 SEMI-FINAL 2";
        }

        else if(fixture.stage === "third"){
            matchTitle = "🥉 3RD PLACE PLAYOFF";
        }

        else if(fixture.stage === "final"){
            matchTitle = "🏆 FINAL";
        }

        html += `
            <div>

                <h3>${matchTitle}</h3>

                ${fixture.teamA.name}
                vs
                ${fixture.teamB.name}

                <br><br>
        `;

        if(fixture.played){

            html += `
                <strong>✅ PLAYED</strong>

                <br><br>

                ${fixture.teamA.name}:
                ${fixture.scoreA}/${fixture.wicketsA}
                (${fixture.oversA} overs)

                <br>

                ${fixture.teamB.name}:
                ${fixture.scoreB}/${fixture.wicketsB}
                (${fixture.oversB} overs)

                <br><br>

                🏆 Winner:
                ${fixture.winner.name}
            `;

        } else {

            html += `
                <button onclick="playTournamentMatch(${index})">
                    ▶️ PLAY MATCH
                </button>
            `;
        }

        html += `
            <hr>
            </div>
        `;
    });

    document.getElementById("fixtureArea").innerHTML = html;
}
// ===============================
// TOURNAMENT TEAM XI SELECTION
// ===============================

function displayTournamentTeams(){

    let html = `
        <h2>🏏 TOURNAMENT TEAMS</h2>
    `;


    tournamentTeams.forEach((team,index) => {

        html += `

            <div>

                <h3>🏏 ${team.name}</h3>

                <p>
                    Playing XI:
                    ${team.players.length}/11
                </p>

                <button
                    onclick="startTournamentTeamSelection(${index})">

                    👥 CHOOSE PLAYING XI

                </button>

                <hr>

            </div>

        `;

    });


    document.getElementById(
        "tournamentTeamsArea"
    ).innerHTML = html;

}
// ===============================
// TOURNAMENT PLAYING XI SELECTOR
// ===============================

let tournamentSelectingTeam = null;

let tournamentSelectedPlayers = [];


function startTournamentTeamSelection(index){

    tournamentSelectingTeam = index;

    tournamentSelectedPlayers = [];


    let team =
        tournamentTeams[index];


    document.getElementById(
        "tournamentTeamsArea"
    ).innerHTML = `

        <h2>🏏 SELECT PLAYING XI</h2>

        <h3>
            ${team.name}
        </h3>

        <p>
            Selected:
            <span id="tournamentSelectedCount">
                0
            </span>
            /11
        </p>

        <div id="tournamentPlayerList"></div>

        <br>

        <button onclick="confirmTournamentXI()">
            ✅ CONFIRM PLAYING XI
        </button>

        <button onclick="displayTournamentTeams()">
            ❌ CANCEL
        </button>

    `;


    displayTournamentPlayers();

}

function displayTournamentPlayers(){

    let html = "";


    players.forEach((player,index) => {

        let alreadyUsed =
            tournamentTeams.some((team,teamIndex) => {

                if(teamIndex === tournamentSelectingTeam){
                    return false;
                }

                return team.players.some(
                    selected =>
                        selected.name === player.name
                );

            });


        let selected =
            tournamentSelectedPlayers.some(
                selected =>
                    selected.name === player.name
            );


        html += `

            <div>

                <button
                    onclick="toggleTournamentPlayer(${index})"
                    ${alreadyUsed ? "disabled" : ""}>

                    ${selected ? "✅" : "⬜"}

                    ${player.name}

                    (${player.role})

                </button>

            </div>

        `;

    });


    document.getElementById(
        "tournamentPlayerList"
    ).innerHTML = html;

}
function toggleTournamentPlayer(index){

    let player = players[index];


    let alreadySelected =
        tournamentSelectedPlayers.some(
            selected =>
                selected.name === player.name
        );


    if(alreadySelected){

        tournamentSelectedPlayers =
            tournamentSelectedPlayers.filter(
                selected =>
                    selected.name !== player.name
            );

    }

    else{

        if(tournamentSelectedPlayers.length >= 11){

            return;

        }

        tournamentSelectedPlayers.push(player);

    }


    document.getElementById(
        "tournamentSelectedCount"
    ).textContent =
        tournamentSelectedPlayers.length;


    displayTournamentPlayers();

}
function confirmTournamentXI(){

    if(tournamentSelectedPlayers.length !== 11){

        alert(
            "You must select exactly 11 players."
        );

        return;

    }


    tournamentTeams[
        tournamentSelectingTeam
    ].players =
        [...tournamentSelectedPlayers];


    tournamentSelectingTeam = null;

    tournamentSelectedPlayers = [];


    displayTournamentTeams();

}
// ===============================
// PLAY TOURNAMENT MATCH
// ===============================

function playTournamentMatch(index){

    let fixture = tournamentFixtures[index];
currentTournamentFixtureIndex = index;
    if(!fixture){
        return;
    }


    let tournamentTeamA = fixture.teamA;
    let tournamentTeamB = fixture.teamB;


    // Make sure both teams have a Playing XI

    if(
        !tournamentTeamA.players ||
        tournamentTeamA.players.length !== 11
    ){

        alert(
            tournamentTeamA.name +
            " needs a complete Playing XI."
        );

        return;
    }


    if(
        !tournamentTeamB.players ||
        tournamentTeamB.players.length !== 11
    ){

        alert(
            tournamentTeamB.name +
            " needs a complete Playing XI."
        );

        return;
    }


    // Load the tournament XIs

    teamA = [...tournamentTeamA.players];

    teamB = [...tournamentTeamB.players];


    // Show the normal match setup

    document.getElementById(
        "tournamentSetup"
    ).style.display = "none";


    document.getElementById(
        "matchSetup"
    ).style.display = "block";

    document.getElementById("batBowlChoice").innerHTML = `
    <p><b>Who won the toss?</b></p>

   <button onclick="tossWinner('A')">${tournamentTeamA.name}</button>
<button onclick="tossWinner('B')">${tournamentTeamB.name}</button>
    <button onclick="randomToss()">🎲 Random Toss</button>
`;

    document.getElementById(
        "matchSetup"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


// ===============================
// TOURNAMENT POINTS TABLE
// ===============================

function displayPointsTable(){

    let html = `
        <h2>🏆 POINTS TABLE</h2>

        <table border="1" cellpadding="8" cellspacing="0">

            <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>L</th>
                <th>Pts</th>
                <th>NRR</th>
            </tr>
    `;


    // Sort teams by points
    // Then wins as the tie-breaker

    let sortedTeams = [...tournamentTeams].sort((a,b) => {

        if(b.points !== a.points){
            return b.points - a.points;
        }
if(b.nrr !== a.nrr){
    return b.nrr - a.nrr;
}

return b.wins - a.wins;

    });


    sortedTeams.forEach((team,index) => {

        html += `

            <tr>

                <td>${index + 1}</td>

                <td>🏏 ${team.name}</td>

                <td>${team.played}</td>

                <td>${team.wins}</td>

                <td>${team.losses}</td>

                <td><b>${team.points}</b></td>

                <td>${team.nrr.toFixed(3)}</td>
 
            </tr>

        `;

    });


    html += `</table>`;


    document.getElementById(
        "pointsTableArea"
    ).innerHTML = html;

}
// ===============================
// PLAY NEXT TOURNAMENT MATCH
// ===============================

function playNextTournamentMatch(){

    let nextIndex =
        tournamentFixtures.findIndex(
            fixture => !fixture.played
        );

    if(nextIndex === -1){

        document.getElementById("scoreboard").innerHTML =
        `
        <h2>🏆 TOURNAMENT COMPLETE!</h2>

        <p>
        All tournament matches have been played.
        </p>

        <button onclick="returnToTournament()">
            🏆 VIEW TOURNAMENT
        </button>
        `;

        return;
    }

    playTournamentMatch(nextIndex);
}

function returnToTournament(){

    document.getElementById("matchArea").style.display = "none";

    document.getElementById("matchSetup").style.display = "none";

    document.getElementById("tournamentSetup").style.display = "block";

    displayTournamentTeams();
    displayPointsTable();
    displayFixtures();

    document.getElementById("fixtureArea").scrollIntoView({
        behavior: "smooth"
    });
}
// ===============================
// TRI-SERIES MODE
// ===============================

let triSeriesTeams = [];

let triSeriesFixtures = [];

let triSeriesStarted = false;


// ===============================
// CREATE TRI-SERIES
// ===============================

function createTriSeries(){

    // Reset Tri-Series

    triSeriesTeams = [];

    triSeriesFixtures = [];

    triSeriesStarted = true;


    // Clear old Tri-Series areas

    document.getElementById(
        "triSeriesMessage"
    ).innerHTML = "";

    document.getElementById(
        "triSeriesTeamsArea"
    ).innerHTML = "";

    document.getElementById(
        "triSeriesTableArea"
    ).innerHTML = "";

    document.getElementById(
        "triSeriesFixtureArea"
    ).innerHTML = "";


    // Ask for 3 team names

    document.getElementById(
        "triSeriesTeamsArea"
    ).innerHTML = `

        <h3>🏏 Enter Your 3 Teams</h3>

        <input
            type="text"
            id="triTeamName1"
            placeholder="Team 1"
        >

        <br><br>

        <input
            type="text"
            id="triTeamName2"
            placeholder="Team 2"
        >

        <br><br>

        <input
            type="text"
            id="triTeamName3"
            placeholder="Team 3"
        >

        <br><br>

        <button onclick="confirmTriSeriesTeams()">
            ✅ Confirm Teams
        </button>

    `;
}
