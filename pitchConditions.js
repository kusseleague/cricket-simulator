/*
=====================================
KWICK KRICK SIM
SEASON 9 - PITCH CONDITIONS
=====================================
*/

function createPitch(
    name,
    averageFirstInnings,
    battingFriendly,
    paceAssistance,
    swingAssistance,
    spinAssistance,
    chasingAdvantage,
    scoringMultiplier,
    wicketMultiplier,
    paceEconomyMultiplier,
    spinEconomyMultiplier
) {

    return {
        name,
        averageFirstInnings,
        battingFriendly,
        paceAssistance,
        swingAssistance,
        spinAssistance,
        chasingAdvantage,
        scoringMultiplier,
        wicketMultiplier,
        paceEconomyMultiplier,
        spinEconomyMultiplier
    };

}


// =====================================
// VENUE PROFILES
// =====================================

const pitchConditions = {

    chandigarh: createPitch(
        "Chandigarh",
        178, 65, 55, 45, 45,
        1.03, 1.02, 0.98,
        0.97, 1.00
    ),

    chennai: createPitch(
        "Chennai",
        163, 45, 30, 25, 85,
        0.98, 0.94, 1.08,
        1.03, 0.95
    ),

    hyderabad: createPitch(
        "Hyderabad",
        196, 95, 30, 25, 30,
        1.04, 1.13, 0.88,
        1.05, 1.04
    ),

    bengaluru: createPitch(
        "Bengaluru",
        192, 90, 35, 30, 30,
        1.05, 1.11, 0.91,
        1.05, 1.05
    ),

    kolkata: createPitch(
        "Kolkata",
        183, 75, 40, 35, 65,
        1.04, 1.05, 0.97,
        1.02, 0.96
    ),

    mumbai: createPitch(
        "Mumbai",
        185, 80, 65, 50, 35,
        1.06, 1.07, 0.96,
        0.98, 1.03
    ),

    brisbane: createPitch(
        "Brisbane",
        166, 50, 85, 65, 25,
        1.01, 0.96, 1.08,
        0.95, 1.03
    ),

    napoli: createPitch(
        "Napoli",
        170, 55, 50, 45, 50,
        1.02, 0.98, 1.02,
        1.05, 1.03
    ),

    birmingham: createPitch(
        "Birmingham",
        172, 60, 70, 75, 40,
        1.02, 0.99, 1.05,
        0.96, 1.01
    ),

    london: createPitch(
        "London - Lord's",
        160, 45, 75, 90, 30,
        1.01, 0.92, 1.13,
        0.95, 1.03
    ),

    manchester: createPitch(
        "Manchester",
        165, 50, 75, 80, 40,
        1.02, 0.95, 1.10,
        0.96, 1.01
    ),

    adelaide: createPitch(
        "Adelaide",
        178, 70, 50, 40, 50,
        1.02, 1.03, 0.98,
        1.02, 0.98
    ),

    sydney: createPitch(
        "Sydney",
        169, 55, 45, 35, 75,
        0.99, 0.97, 1.06,
        1.02, 0.95
    ),

    melbourne: createPitch(
        "Melbourne",
        165, 50, 75, 55, 45,
        1.01, 0.95, 1.07,
        0.96, 0.98
    ),

    abudhabi: createPitch(
        "Abu Dhabi",
        163, 45, 40, 30, 70,
        1.03, 0.94, 1.08,
        0.98, 0.96
    ),

    dubai: createPitch(
        "Dubai",
        171, 60, 55, 45, 55,
        1.07, 0.99, 1.02,
        0.97, 0.98
    ),

    milano: createPitch(
        "Milano",
        175, 65, 45, 40, 50,
        1.03, 1.01, 1.00,
        1.01, 1.00
    ),

    londonoval: createPitch(
        "London - The Oval",
        181, 75, 50, 45, 50,
        1.02, 1.04, 0.97,
        1.02, 0.98
    ),

    capetown: createPitch(
        "Cape Town",
        168, 55, 80, 65, 35,
        1.02, 0.97, 1.08,
        0.95, 1.02
    ),

    auckland: createPitch(
        "Auckland",
        188, 85, 50, 55, 30,
        1.04, 1.09, 0.94,
        1.05, 1.04
    ),

    newyork: createPitch(
        "New York",
        135, 30, 90, 75, 45,
        1.02, 0.83, 1.18,
        0.95, 0.98
    ),

    gospeloak: createPitch(
        "Gospel Oak",
        145, 40, 75, 70, 40,
        1.04, 0.88, 1.15,
        0.95, 1.01
    ),

    vale: createPitch(
        "The Vale",
        135, 35, 70, 60, 35,
        1.06, 0.85, 1.12,
        0.95, 1.02
    )

};


// =====================================
// DEFAULT NEUTRAL PITCH
// =====================================

const defaultPitchConditions = createPitch(
    "Neutral Venue",
    175, 60, 50, 50, 50,
    1.00, 1.00, 1.00,
    1.00, 1.00
);


// =====================================
// GET PITCH CONDITIONS
// =====================================

function getPitchConditions(venue) {

    const key = String(venue || "")
        .toLowerCase()
        .replace(/[\s_-]/g, "");

    return pitchConditions[key]
        || defaultPitchConditions;

}


// =====================================
// VENUE-ADJUSTED BOWLING ECONOMY
// =====================================

function getVenueAdjustedEconomy(bowler, venue) {

    const pitch = getPitchConditions(venue);

    const style = String(
        bowler.bowlingStyle || ""
    ).toLowerCase().trim();

    const economy = bowler.economy ?? 10;

    let multiplier = 1.00;

    if (style === "pace") {

        multiplier = pitch.paceEconomyMultiplier;

    }

    else if (style === "spin") {

        multiplier = pitch.spinEconomyMultiplier;

    }

    return economy * multiplier;

}
