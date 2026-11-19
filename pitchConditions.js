
/*
=====================================
KWICK KRICK SIM
SEASON 9 - PITCH CONDITIONS
=====================================
*/

const pitchConditions = {

    vale: {

        name: "The Vale",

        // Average first innings score
        averageFirstInnings: 135,

        // Pitch characteristics
        battingFriendly: 35,
        paceAssistance: 70,
        swingAssistance: 60,
        spinAssistance: 35,

        // Chasing is generally favoured
        chasingAdvantage: 1.06,

        // Initial tuning values
        scoringMultiplier: 0.85,
        wicketMultiplier: 1.12

    }

};


// Get pitch conditions by venue
function getPitchConditions(venue) {

    const key = String(venue || "")
        .toLowerCase()
        .replace(/[\s_-]/g, "");

    return pitchConditions[key] || null;

}
