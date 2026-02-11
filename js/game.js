window.addEventListener("load", function (event) {
    const btn = document.getElementById("button");
    const scoreDis = document.getElementById("scoreDisplay");

    const gameState = {
        souls: 0,
        soulsPerClick: 1,

        autoClickSpeed: 0,
        autoClickTimerID: null,

        upgrades: {
            //Increases click value
            scythe: {
                name: "Scythe",
                cost: 10,
                multiplier: 2,
                count: 0
            },

            //Auto CLickers
            Charon: {
                name: "Summon Charon",
                cost: 100,
                count: 0,
                level: 0
            }
        },

        achievments: [
            { id: 'first100', threshold: 100, name: "You yearn for the souls", unlocked: false },
            { id: 'first1000', threshold: 1000, name: "your still here? Thanks!", unlocked: false }
        ]
    }

    btn.addEventListener("click", function () {

        gameState.souls = gameState.souls + 1;
        scoreDis.innerHTML = gameState.souls;

    });



})

