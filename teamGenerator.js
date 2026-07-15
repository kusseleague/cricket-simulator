function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}


function createTeam() {

    let shuffledPlayers = shuffle([...players]);

    return shuffledPlayers.slice(0, 11);

}


function showTeams() {

    let teamA = createTeam();
    let teamBPlayers = players.filter(
        player => !teamA.includes(player)
    );

    let teamB = shuffle(teamBPlayers).slice(0, 11);


    let output = "<h2>TEAM A</h2>";

    teamA.forEach((player, index) => {
        output += (index + 1) + ". " + player.name + 
        " (" + player.role + ")<br>";
    });


    output += "<h2>TEAM B</h2>";

    teamB.forEach((player, index) => {
        output += (index + 1) + ". " + player.name + 
        " (" + player.role + ")<br>";
    });


    document.getElementById("teams").innerHTML = output;

}
