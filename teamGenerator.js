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
let target = 0;
let firstInningsScore = 0;
let secondInnings = false;
let matchOver = false;

let battingTeam = [];
let bowlingTeam = [];

let striker;
let nonStriker;
let currentBowler;
let bowlerIndex = 0;

let batsmanStats = {};
let bowlerStats = {};
let commentary = "";


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
        p => p.role === "Bowler"
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


    let message =
    team==="A"
    ?
    "🪙 Team A won the toss!"
    :
    "🪙 Team B won the toss!";



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


    score=0;
    wickets=0;
    balls=0;
    bowlerIndex = 0;


    document.getElementById("matchSetup").style.display="none";

    document.getElementById("matchArea").style.display="block";



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
    p => p.role === "Bowler"
);

currentBowler = bowlers[0];

bowlingTeam.forEach(player => {

    if(player.role === "Bowler"){

        bowlerStats[player.name] = {

            balls: 0,
            runs: 0,
            wickets: 0

        };

    }

});

    updateScoreboard(
        "Match Started!"
    );


}





// ===============================
// NEXT BALL
// ===============================


function nextBall(){

    // rest of nextBall()...

    if(secondInnings && score >= target){

    document.getElementById("scoreboard").innerHTML =
    `
    <h2>🏆 MATCH WON!</h2>

    Chased ${target} runs

    <br>

    Score:
    ${score}/${wickets}

    `;

    document.querySelector("button[onclick='nextBall()']").style.display="none";

    return;
}



    let battingPower = striker.bat;

    let bowlingPower = currentBowler.bowl;



    let difference =
    battingPower - bowlingPower;



    let chance =
    Math.random()*100;



    let result;



    if(chance < 8){

        result="W";

    }

    else if(chance < 20 + difference/2){

        result=6;

    }

    else if(chance < 45 + difference/2){

        result=4;

    }

    else if(chance < 70){

        result=1;

    }

    else if(chance < 85){

        result=2;

    }

    else{

        result=0;

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



        striker =
battingTeam[wickets+1] || null;


    }



    else{


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

// CHECK TEAM B WIN

if(secondInnings && score >= target){

    document.getElementById("scoreboard").innerHTML =
    `
    <h2>🏆 MATCH WON!</h2>

    Chased ${target} runs

    <br>

    Score:
    ${score}/${wickets}

    `;

    document.querySelector("button[onclick='nextBall()']").style.display="none";

    return;

}


// CHECK INNINGS END

if(wickets >= 10 || balls >= 120){
    if(!secondInnings){

        firstInningsScore = score;
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
            p => p.role === "Bowler"
        );

        currentBowler = bowlers[0];


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
document.getElementById("scoreboard").innerHTML =
    `
    <h2>🏆 MATCH RESULT</h2>

    Team A wins!

    <br><br>

    Final Score:
    ${score}/${wickets}

    <br>

    Needed:
    ${target-score} more runs

    `;


    document.querySelector("button[onclick='nextBall()']").style.display="none";


    return;
}

    if(balls%6===0){


        let temp=striker;

        striker=nonStriker;

        nonStriker=temp;
bowlerIndex++;

let bowlers = bowlingTeam.filter(
    p => p.role === "Bowler"
);

currentBowler = bowlers[
    bowlerIndex % bowlers.length
];

    }



    updateScoreboard(
        commentary
    );


}






// ===============================
// DISPLAY
// ===============================


function updateScoreboard(message){


    let overs =
    Math.floor(balls/6)
    +
    "."
    +
    balls%6;



    document.getElementById("scoreboard").innerHTML =


    `
    <h2>🏏 LIVE MATCH</h2>


    Score:
    ${score}/${wickets}


    <br>


    Overs:
    ${overs}


    <br><br>


   🏏 Batting:

<br><br>

${striker ? striker.name : "ALL OUT"}
${striker && batsmanStats[striker.name] 
? batsmanStats[striker.name].runs + " (" + batsmanStats[striker.name].balls + ")"
: ""}

⭐

<br>

${nonStriker ? nonStriker.name : "-"}
${nonStriker && batsmanStats[nonStriker.name]
? batsmanStats[nonStriker.name].runs + " (" + batsmanStats[nonStriker.name].balls + ")"
: ""}


    <br>


    ⚾ Bowler:
    ${currentBowler ? currentBowler.name : "-"}


    <br><br>


    🗣 Commentary:

    <br>

    ${message}


    `;


}
