// =====================================
// STUMPS CRICKET SIMULATOR
// TEAM GENERATOR + MATCH SETUP ENGINE
// =====================================


// TEAMS
let teamA = [];
let teamB = [];


// MATCH VARIABLES
let battingTeam = [];
let bowlingTeam = [];

let striker;
let nonStriker;
let currentBowler;


// SCORE
let score = 0;
let wickets = 0;
let balls = 0;

let commentary = "";


// =====================================
// SHUFFLE
// =====================================

function shuffle(array){

    return array.sort(() => Math.random() - 0.5);

}


// =====================================
// PICK PLAYERS
// =====================================

function pickPlayers(list, amount){

    return shuffle([...list]).slice(0, amount);

}



// =====================================
// CREATE BALANCED XI
// =====================================

function createBalancedTeam(playersPool){


    let team = [];


    let keepers = playersPool.filter(
        p => p.role === "Wicketkeeper"
    );


    let batsmen = playersPool.filter(
        p => p.role === "Batsman"
    );


    let allRounders = playersPool.filter(
        p => p.role === "All Rounder"
    );


    let bowlers = playersPool.filter(
        p => p.role === "Bowler"
    );



    team.push(...pickPlayers(keepers,1));

    team.push(...pickPlayers(batsmen,4));

    team.push(...pickPlayers(allRounders,3));

    team.push(...pickPlayers(bowlers,3));



    // safety fill if short

    while(team.length < 11){

        let extra = playersPool.find(
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





// =====================================
// TEAM RATING
// =====================================

function calculateRating(team){

    let bat = 0;
    let bowl = 0;
    let stamina = 0;


    team.forEach(player=>{

        bat += player.bat;

        bowl += player.bowl;

        stamina += player.stamina;

    });



    return {

        batting: Math.round(bat/team.length),

        bowling: Math.round(bowl/team.length),

        stamina: Math.round(stamina/team.length),

        overall:
        Math.round(
            (bat+bowl+stamina)/(team.length*3)
        )

    };


}





// =====================================
// DISPLAY TEAM
// =====================================

function displayTeam(name,team){


    let rating = calculateRating(team);


    let output = `

    <h2>${name}</h2>

    `;



    team.forEach((player,index)=>{


        output +=

        `${index+1}. 
        ${player.name}
        (${player.role})
        <br>`;


    });



    output += `

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


    return output;

}





// =====================================
// CREATE TEAMS BUTTON
// =====================================

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





// =====================================
// TOSS
// =====================================

function tossWinner(team){


    let message =
    team==="A"
    ?
    "🪙 Team A won toss!"
    :
    "🪙 Team B won toss!";



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





// =====================================
// BAT OR BOWL DECISION
// =====================================


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

    ${
    choice==="Bat"
    ?
    "🏏 Batting first!"
    :
    "⚾ Bowling first!"
    }

    </h3>



    <button onclick="startMatch()">

    🚀 Start Match

    </button>


    `;


}





// =====================================
// START MATCH
// =====================================


function startMatch(){


    document.getElementById("matchSetup").style.display="none";


    document.getElementById("matchArea").style.display="block";



    score = 0;
    wickets = 0;
    balls = 0;



    striker = battingTeam[0];

    nonStriker = battingTeam[1];



    currentBowler =
    bowlingTeam.find(
        p=>p.role==="Bowler"
    );
// =============================
// BALL SIMULATION ENGINE
// =============================

let score = 0;
let wickets = 0;
let balls = 0;
let commentary = "";


function nextBall(){


    if(!striker || !currentBowler){

        alert("Match not started properly!");
        return;

    }


    let batsmanStrength = striker.bat;
    let bowlerStrength = currentBowler.bowl;


    let difference = batsmanStrength - bowlerStrength;

    let chance = Math.random()*100;


    let result;


    let wicketChance = 8 - (difference/20);


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
        `💥 OUT! ${striker.name} is dismissed by ${currentBowler.name}`;


        striker = battingTeam[wickets+1] || null;


    }


    else{


        score += result;


        if(result === 0){

            commentary =
            `⚪ Dot ball by ${currentBowler.name}`;

        }


        else if(result === 4){

            commentary =
            `🔥 FOUR! ${striker.name} hits the boundary`;

        }


        else if(result === 6){

            commentary =
            `🚀 SIX! ${striker.name} launches it!`;

        }


        else{

            commentary =
            `${striker.name} scores ${result} run(s)`;

        }

    }



    balls++;


    if(balls % 6 === 0){

        let temp = striker;
        striker = nonStriker;
        nonStriker = temp;

    }



    let overs =
    Math.floor(balls/6) + "." + (balls%6);



    document.getElementById("scoreboard").innerHTML =

    `

    <h2>🏏 LIVE MATCH</h2>

    Score:
    ${score}/${wickets}

    <br><br>

    Overs:
    ${overs}


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


    🎙 Commentary:

    <br>

    ${commentary}

    `;


}


    document.getElementById("scoreboard").innerHTML =


    `

    <h2>🏏 LIVE MATCH</h2>


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


    Ready for first ball!


    `;


}





// =====================================
// NEXT BALL
// =====================================


function nextBall(){


    let bat = striker.bat;

    let bowl = currentBowler.bowl;


    let chance = Math.random()*100;


    let difference = bat-bowl;


    let result;



    if(chance < 8){

        result="W";

    }

    else if(chance < 20+difference/2){

        result=6;

    }

    else if(chance < 45+difference/2){

        result=4;

    }

    else if(chance < 75){

        result=1;

    }

    else if(chance < 90){

        result=2;

    }

    else{

        result=0;

    }



    if(result==="W"){


        wickets++;


        commentary =
        `💥 OUT! ${striker.name} dismissed by ${currentBowler.name}`;


        striker =
        battingTeam[wickets+1] || null;


    }


    else{


        score += result;



        commentary =
        `${striker.name} scores ${result} run(s)`;


    }



    balls++;



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


    🏏 Striker:
    ${striker ? striker.name:"ALL OUT"}


    <br>


    ⚾ Bowler:
    ${currentBowler.name}


    <br><br>


    Commentary:

    ${commentary}


    `;


}

// =====================================
// NEXT BALL ENGINE
// =====================================

function nextBall(){


    if(!striker || !currentBowler){

        alert("Match not started!");
        return;

    }



    let battingStrength = striker.bat;

    let bowlingStrength = currentBowler.bowl;



    let difference = battingStrength - bowlingStrength;


    let chance = Math.random()*100;


    let result;



    if(chance < 8){

        result = "W";

    }

    else if(chance < 25 + difference/3){

        result = 6;

    }

    else if(chance < 50 + difference/3){

        result = 4;

    }

    else if(chance < 75){

        result = 1;

    }

    else if(chance < 90){

        result = 2;

    }

    else{

        result = 0;

    }





    if(result === "W"){


        wickets++;


        commentary =
        `💥 WICKET! ${striker.name} is out to ${currentBowler.name}`;



        striker =
        battingTeam[wickets+1] || null;


    }


    else{


        score += result;



        if(result === 0){

            commentary =
            `${currentBowler.name} bowls a dot ball!`;

        }

        else{

            commentary =
            `${striker.name} scores ${result} run(s)!`;

        }


    }



    balls++;



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


    🏏 Striker:
    ${striker ? striker.name : "ALL OUT"}


    <br>


    🏏 Non-Striker:
    ${nonStriker ? nonStriker.name : "-"}


    <br>


    ⚾ Bowler:
    ${currentBowler.name}


    <br><br>


    🗣 Commentary:

    ${commentary}


    `;



}
function nextBall(){
    alert("NEXT BALL WORKS!");
}
