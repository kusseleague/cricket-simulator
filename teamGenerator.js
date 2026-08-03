// =============================
// STUMPS CRICKET SIMULATOR
// TEAM GENERATOR ENGINE
// =============================
console.log("TEAM GENERATOR LOADED");

let battingTeam = [];
let bowlingTeam = [];

let striker;
let nonStriker;
let currentBowler;

let batsmanStats = {};
let bowlerStats = {};


// Shuffle players
function shuffle(array){

    return array.sort(() => Math.random() - 0.5);

}


// Pick random players
function pickPlayers(list, amount){

    return shuffle([...list]).slice(0, amount);

}



// Create balanced XI
function createBalancedTeam(playerPool){


    let team = [];


    let wicketkeepers = playerPool.filter(
        p => p.role === "Wicketkeeper"
    );


    let batsmen = playerPool.filter(
        p => p.role === "Batsman"
    );


    let allRounders = playerPool.filter(
        p => p.role === "All Rounder"
    );


    let bowlers = playerPool.filter(
        p => p.role === "Bowler"
    );



    // 1 wicketkeeper
    team.push(
        ...pickPlayers(wicketkeepers,1)
    );


    // 4 batsmen
    team.push(
        ...pickPlayers(batsmen,4)
    );


    // 3 all rounders
    team.push(
        ...pickPlayers(allRounders,3)
    );


    // 3 bowlers
    team.push(
        ...pickPlayers(bowlers,3)
    );



    return team;

}




// Team rating

function calculateRating(team){

    let bat = 0;
    let bowl = 0;
    let stamina = 0;


    team.forEach(player => {

        bat += player.bat;
        bowl += player.bowl;
        stamina += player.stamina;

    });



    return {

        batting: Math.round(bat / 11),
        bowling: Math.round(bowl / 11),
        stamina: Math.round(stamina / 11),

        overall:
        Math.round(
            (bat+bowl+stamina)/33
        )

    };

}





// Display team

function displayTeam(name,team){


    let rating = calculateRating(team);


    let html = `
    <h2>${name}</h2>
    `;


    team.forEach((player,index)=>{


        html += `
        ${index+1}. 
        ${player.name}
        (${player.role})
        <br>
        `;


    });



    html += `

    <br>

    🏏 Batting:
    ${rating.batting}%


    <br>

    ⚾ Bowling:
    ${rating.bowling}%


    <br>

    💪 Stamina:
    ${rating.stamina}%


    <br>

    ⭐ Overall:
    ${rating.overall}%

    `;



    return html;

}





// Button function

function showTeams(){


    let pool = shuffle([...players]);



    teamA = createBalancedTeam(pool);



    let remaining = pool.filter(
        p => !teamA.includes(p)
    );



    teamB = createBalancedTeam(remaining);




    document.getElementById("teams").innerHTML =

    displayTeam(
        "🏏 TEAM A",
        teamA
    )

    +

    "<hr>"

    +

    displayTeam(
        "🏏 TEAM B",
        teamB
    );



    document.getElementById("matchSetup").style.display="block";



    console.log("TEAM A",teamA);

    console.log("TEAM B",teamB);


}

// =============================
// MATCH SETUP ENGINE
// =============================

function tossWinner(team){


    let message =
    team === "A"
    ? "🪙 Team A won the toss!"
    : "🪙 Team B won the toss!";


    document.getElementById("batBowlChoice").innerHTML =

    `

    <h3>${message}</h3>

    <p>Choose decision:</p>


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
    Math.random() < 0.5
    ? "A"
    : "B";


    tossWinner(winner);

}





function chooseDecision(choice,winner){



    if(choice==="Bat"){


        battingTeam =
        winner==="A"
        ? teamA
        : teamB;


        bowlingTeam =
        winner==="A"
        ? teamB
        : teamA;


    }

    else{


        battingTeam =
        winner==="A"
        ? teamB
        : teamA;


        bowlingTeam =
        winner==="A"
        ? teamA
        : teamB;


    }



    document.getElementById("batBowlChoice").innerHTML =

    `

    <h3>
    ${
    choice==="Bat"
    ?"🏏 They chose to bat first!"
    :"⚾ They chose to bowl first!"
    }

    </h3>


    <button onclick="startMatch()">

    🚀 Start Match

    </button>

    `;



}





function startMatch(){



    document.getElementById("matchSetup").style.display="none";


    document.getElementById("matchArea").style.display="block";



    striker = battingTeam[0];

    nonStriker = battingTeam[1];
battingTeam.forEach(player => {

    batsmanStats[player.name] = {
        runs:0,
        balls:0
    };

});


bowlingTeam.forEach(player => {

    bowlerStats[player.name] = {
        balls:0,
        runs:0,
        wickets:0
    };

});


    currentBowler =
    bowlingTeam.find(
        p=>p.role==="Bowler"
    );



    document.getElementById("scoreboard").innerHTML =

    `

    <h2>🏏 LIVE MATCH</h2>


    Score:
    0/0


    <br><br>


    Overs:
    0.0


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


    Ready for first ball!

    `;

}
console.log("TEAM GENERATOR LOADED");
