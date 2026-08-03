// =============================
// STUMPS CRICKET SIMULATOR
// TEAM GENERATOR ENGINE
// =============================


let teamA = [];
let teamB = [];


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
