/*
=====================================
KWICK KRICK SIM
SEASON 9 - PROBABILITY ENGINE
VERSION 1.0
=====================================
*/


// =====================================
// UTILITY FUNCTIONS
// =====================================

function s9Clamp(value, min, max) {

    return Math.max(min, Math.min(max, value));

}


function s9Stat(value, fallback) {

    return Number.isFinite(value)
        ? value
        : fallback;

}

// =====================================
// PLAYER FORM AND CONSISTENCY
// =====================================

const s9PlayerForm = new Map();

function s9ResetPlayerForm() {

    s9PlayerForm.clear();

}

function s9GetPlayerForm(player) {

    if (!s9PlayerForm.has(player.name)) {

        const consistency = s9Clamp(
            s9Stat(player.consistency, 75),
            0, 100
        );

        const variation =
            0.04 + (100 - consistency) * 0.003;

        const form =
            1 + (Math.random() * 2 - 1) * variation;

        s9PlayerForm.set(player.name, form);

    }

    return s9PlayerForm.get(player.name);

}
// =====================================
// BOWLING STYLE DATABASE
// =====================================

const s9SpinBowlers = new Set([

    "Rashid Khan",
    "Sunil Narine",
    "Ravindra Jadeja",
    "Ravichandran Ashwin",
    "Yuzvendra Chahal",
    "Kuldeep Yadav",
    "VC Varun",
    "Adam Zampa",
    "Nathan Lyon",
    "Keshav Maharaj",
    "Tabraiz Shamsi",
    "Adil Rashid",
    "Wanindu Hasaranga",
    "Maheesh Theekshana",
    "Akeal Hosein",
    "Glenn Maxwell",
    "Shakib Al Hasan",
    "Liam Livingstone",
    "Mohammad Nabi",
    "Moeen Ali",
    "Sikandar Raza",
    "Axar Patel",
    "Washington Sundar",
    "Abhishek Sharma",
    "Rachin Ravindra",
    "Michael Bracewell",
    "Glenn Phillips",
    "Will Jacks",
    "Noor Ahmed",
    "Krunal Pandya",
    "Shahid Afridi",
    "Rahul Chahar",
    "Mitchell Santner",
    "Imran Tahir",
    "Cooper Connolly",
    "Iftikhar Ahmed",
    "Joe Root",
    "Aiden Markram",
    "Chris Gayle",
    "Travis Head",
    "Steve Smith",
    "Marnus Labuschagne",
    "Kane Williamson",
    "Tilak Varma",
    "Naman Dhir",
    "Suresh Raina",
    "Rohit Sharma",
    "Rinku Singh"

]);


function s9GetBowlingStyle(player) {

    if (player.bowlingStyle) {

        return player.bowlingStyle.toLowerCase();

    }

    if (s9SpinBowlers.has(player.name)) {

        return "spin";

    }

    if ((player.bowl ?? 0) >= 50) {

        return "pace";

    }

    return "unknown";

}


// =====================================
// PLAYER BATTING PROFILE
// =====================================

function s9GetBattingProfile(player) {

    const rating = s9Stat(player.bat, 60);

    return {

        rating: rating,

        average: s9Clamp(
            s9Stat(
                player.battingAverage,
                3 + rating * 0.32
            ),
            2, 80
        ),

        runsPerBall: s9Clamp(
            s9Stat(
                player.runsPerBall,
                0.45 + rating * 0.01
            ),
            0.3, 2.8
        ),

        aggression: s9Clamp(
            s9Stat(player.aggression, 60),
            0, 100
        ),

        consistency: s9Clamp(
            s9Stat(player.consistency, 75),
            0, 100
        ),

        stamina: s9Clamp(
            s9Stat(player.stamina, 80),
            0, 100
        )

    };

}


// =====================================
// PLAYER BOWLING PROFILE
// =====================================

function s9GetBowlingProfile(player, venue) {

    const rating = s9Stat(player.bowl, 40);

    const style = s9GetBowlingStyle(player);

    const baseEconomy = s9Stat(
        player.economy,
        13 - rating * 0.055
    );

    const adjustedEconomy =
        getVenueAdjustedEconomy(
            {
                ...player,
                economy: baseEconomy,
                bowlingStyle: style
            },
            venue
        );

    return {

        rating: rating,

        style: style,

        economy: s9Clamp(
            adjustedEconomy,
            4, 18
        ),

        average: s9Clamp(
            s9Stat(
                player.bowlingAverage,
                65 - rating * 0.45
            ),
            10, 100
        ),

        strikeRate: s9Clamp(
            s9Stat(
                player.bowlingStrikeRate,
                48 - rating * 0.32
            ),
            8, 80
        ),

        accuracy: s9Clamp(
            s9Stat(player.accuracy, rating),
            0, 100
        ),

        wicketTaking: s9Clamp(
            s9Stat(player.wicketTaking, rating),
            0, 100
        ),

        stamina: s9Clamp(
            s9Stat(player.stamina, 80),
            0, 100
        )

    };

}


// =====================================
// MATCH PHASES
// =====================================

function s9GetMatchPhase(balls) {

    // POWERPLAY: OVERS 1-6

    if (balls < 36) {

        return {
            name: "Powerplay",
            scoring: 1.06,
            wicket: 1.08
        };

    }

    // MIDDLE OVERS: OVERS 7-15

    if (balls < 90) {

        return {
            name: "Middle Overs",
            scoring: 0.94,
            wicket: 0.90
        };

    }

    // DEATH OVERS: OVERS 16-20

    return {
        name: "Death Overs",
        scoring: 1.20,
        wicket: 1.30
    };

}


// =====================================
// CALCULATE DELIVERY PROBABILITIES
// =====================================

function s9CalculateProbabilities(
    batsman,
    bowler,
    context = {}
) {

    const bat = s9GetBattingProfile(batsman);

    const bowl = s9GetBowlingProfile(
        bowler,
        context.venue
    );

    const pitch = getPitchConditions(
        context.venue
    );

    const phase = s9GetMatchPhase(
        context.balls ?? 0
    );

    const ballsFaced =
        context.batsmanBalls ?? 0;


    // =================================
    // EXPECTED RUNS PER DELIVERY
    // =================================

    let expectedRuns =

        bat.runsPerBall * 0.55 +

        (bowl.economy / 6) * 0.45;


    // Overall venue conditions

    expectedRuns *= pitch.scoringMultiplier;


    // Match phase

    expectedRuns *= phase.scoring;


    // New batsman settling
    // Boundaries remain possible

    if (ballsFaced < 6) {

        expectedRuns *=
            0.90 + ballsFaced * 0.016;

    }


    // Second innings conditions

    if (context.secondInnings) {

        expectedRuns *= pitch.chasingAdvantage;

    }


    // =================================
    // WICKET PROBABILITY
    // =================================

    const battingDismissalRate =

        bat.runsPerBall / bat.average;


    const bowlingDismissalRate =

        1 / bowl.strikeRate;


    let wicketProbability =

        battingDismissalRate * 0.55 +

        bowlingDismissalRate * 0.45;


    // Pitch and match phase

    wicketProbability *= pitch.wicketMultiplier;

    wicketProbability *= phase.wicket;


    // New batsman vulnerability

    if (ballsFaced < 6) {

        wicketProbability *= 1.12;

    }


    // =================================
    // CHASING PRESSURE
    // =================================

    if (
        context.secondInnings &&
        context.target > 0
    ) {

        const runsNeeded =

            context.target -
            (context.score ?? 0);

        const ballsRemaining =

            Math.max(
                1,
                120 - (context.balls ?? 0)
            );

        const requiredRate =

            runsNeeded / ballsRemaining * 6;


        if (requiredRate > 9) {

            const pressure = s9Clamp(
                (requiredRate - 9) / 20,
                0, 0.30
            );

            expectedRuns *= 1 + pressure;

            wicketProbability *=
                1 + pressure * 1.5;

        }

        else if (requiredRate < 6) {

            expectedRuns *= 0.94;

            wicketProbability *= 0.85;

        }

    }

// =================================
// PLAYER FORM AND CONSISTENCY
// =================================

const battingForm = s9GetPlayerForm(batsman);
const bowlingForm = s9GetPlayerForm(bowler);

// Batting performance

expectedRuns *= battingForm;
wicketProbability /= battingForm;

// Bowling performance

expectedRuns /= bowlingForm;
wicketProbability *= bowlingForm;
    
    // Numerical safety limits
    // These are NOT innings score caps

    expectedRuns = s9Clamp(
        expectedRuns,
        0.20, 3.20
    );

    wicketProbability = s9Clamp(
        wicketProbability,
        0.008, 0.45
    );


    // =================================
    // SCORING DISTRIBUTION
    // =================================

    const aggression = bat.aggression / 100;

    const sixShare =
        0.08 + aggression * 0.20;

    const scoringWeights = {

        1: 0.47,
        2: 0.13,
        3: 0.015,
        4: 0.385 - sixShare,
        6: sixShare

    };


    // Average runs when a scoring
    // delivery occurs

    const scoringMean =

        scoringWeights[1] +

        scoringWeights[2] * 2 +

        scoringWeights[3] * 3 +

        scoringWeights[4] * 4 +

        scoringWeights[6] * 6;


    const scoringProbability = s9Clamp(

        expectedRuns / scoringMean,

        0,

        1 - wicketProbability

    );


    const probabilities = {

        W: wicketProbability,

        0: 1 -
            wicketProbability -
            scoringProbability,

        1: scoringProbability *
            scoringWeights[1],

        2: scoringProbability *
            scoringWeights[2],

        3: scoringProbability *
            scoringWeights[3],

        4: scoringProbability *
            scoringWeights[4],

        6: scoringProbability *
            scoringWeights[6]

    };


    return probabilities;

}


// =====================================
// SIMULATE ONE DELIVERY
// =====================================

function s9SimulateBall(
    batsman,
    bowler,
    context = {}
) {

    const probabilities =
        s9CalculateProbabilities(
            batsman,
            bowler,
            context
        );

    let random = Math.random();

    const outcomes = [

        "W", 0, 1, 2, 3, 4, 6

    ];

    for (const outcome of outcomes) {

        random -= probabilities[outcome];

        if (random < 0) {

            return outcome;

        }

    }

    return 0;

}
