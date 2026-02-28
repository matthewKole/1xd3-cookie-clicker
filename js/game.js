
/* Author Caden Chan, Matthew Kolesnik  

    Date: February 27th 2026


    



*/





window.addEventListener("load", function () {

    // ==================== MODEL ====================

    let souls = 0;
    let soulsPerClick = 1;
    let autoIntervalId = null;

    // ==================== UPGRADES ====================

    const upgrades = [
        {
            id: "scythe",
            name: "Rusty Scythe",
            basePrice: 10,
            growth: 1.25,
            owned: 0,
            effect: 1,
            type: "click"
        },
        {
            id: "spectral",
            name: "Spectral Blade",
            basePrice: 50,
            growth: 1.3,
            owned: 0,
            effect: 5,
            type: "click"
        },
        {
            id: "pact",
            name: "Dark Pact",
            basePrice: 200,
            growth: 1.35,
            owned: 0,
            effect: 20,
            type: "click"
        },
        {
            id: "rift",
            name: "Soul Minion",
            basePrice: 100,
            growth: 1.4,
            owned: 0,
            effect: 4,
            type: "auto"
        }
    ];

    // ==================== 5 ACHIEVEMENTS ====================

    const achievements = [
        { name: "First Soul", requirement: 10, earned: false },
        { name: "Novice Harvester", requirement: 100, earned: false },
        { name: "Automation Begins", requirement: 4, type: "auto", earned: false },
        { name: "Soul Collector", requirement: 1000, earned: false },
        { name: "Soul King", requirement: 5000, earned: false }
    ];

    // ==================== HELPERS ====================

    function calculateCost(upgrade) {
        return Math.floor(
            upgrade.basePrice * Math.pow(upgrade.growth, upgrade.owned)
        );
    }

    function getTotalUpgrades() {
        return upgrades.reduce((sum, u) => sum + u.owned, 0);
    }

    // ==================== GAME LOGIC ====================

    function handleClick() {
        souls += soulsPerClick;
        updateDisplay();
        checkAchievements();
    }

    function buyUpgrade(id) {
        const upgrade = upgrades.find(u => u.id === id);
        const cost = calculateCost(upgrade);

        if (souls >= cost) {
            souls -= cost;
            upgrade.owned++;

            if (upgrade.type === "click") {
                soulsPerClick += upgrade.effect;
            }

            if (upgrade.type === "auto") {
                const autoUpgrade = upgrades.find(u => u.type === "auto");
                // current auto rate = soulsPerClick * number of auto upgrades
                autoSoulsPerSecond = soulsPerClick * autoUpgrade.owned;
                startAutoSystem();
            }

            updateDisplay();
            checkAchievements();
        }
    }

    function startAutoSystem() {
        if (autoIntervalId) clearInterval(autoIntervalId); // reset timer

        const autoUpgrade = upgrades.find(u => u.type === "auto");
        if (autoUpgrade.owned === 0) return;

        // Base interval = 1000ms (1 sec)
        // Each level reduces interval slightly to make it faster
        const interval = Math.max(200, 1000 - (autoUpgrade.owned - 1) * 100);

        autoIntervalId = setInterval(() => {
            // Total auto clicks = current soulsPerClick × number of auto upgrades
            souls += soulsPerClick * autoUpgrade.owned;
            updateDisplay();
            checkAchievements();
        }, interval);
    }

    // ==================== ACHIEVEMENTS ====================

    function checkAchievements() {
        achievements.forEach(function (ach) {

            if (!ach.earned) {

                if (ach.type === "auto") {
                    const autoUpgrade = upgrades.find(u => u.type === "auto");
                    // Check if total auto clicks per interval meets requirement
                    if (autoUpgrade && autoUpgrade.owned * soulsPerClick >= ach.requirement) {
                        ach.earned = true;
                        showCongrats(ach.name + " Unlocked!");
                    }
                } else {
                    if (souls >= ach.requirement) {
                        ach.earned = true;
                        showCongrats(ach.name + " Unlocked!");
                    }
                }
            }
        });

        renderAchievements();
    }

    // ==================== VIEW ====================

    function updateDisplay() {
        document.getElementById("scoreDisplay").textContent = souls;
        document.getElementById("soulsPerClickDisplay").textContent = soulsPerClick;
        document.getElementById("totalUpgradesDisplay").textContent = getTotalUpgrades();

        renderUpgrades();
    }

    function renderUpgrades() {
        upgrades.forEach(function (upgrade) {
            const card = document.getElementById("upgrade-" + upgrade.id);
            const cost = calculateCost(upgrade);

            const costSpan = card.querySelector(".cost");
            const levelTag = card.querySelector(".level-tag");

            costSpan.textContent = "Cost: " + cost;
            levelTag.textContent = "Lv " + upgrade.owned;

            if (souls >= cost) {
                card.classList.remove("locked");
                card.classList.add("available");
            } else {
                card.classList.remove("available");
                card.classList.add("locked");
            }
        });
    }

    function renderAchievements() {
        const container = document.getElementById("achievementsContainer");
        container.innerHTML = "";

        achievements.forEach(function (ach) {
            const div = document.createElement("div");
            div.className = "achievement-card";

            // Add achievement name on top and description below
            div.innerHTML = `
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-description">
                ${ach.type === "auto" ? "Buy Flock of Ravens" : `Souls needed: ${ach.requirement}`}
            </div>
            ${ach.earned ? '<div class="earned-check">✔</div>' : ''}
        `;

            container.appendChild(div);
        });
    }



    function showCongrats(message) {
        const popup = document.getElementById("congratsPopup");
        popup.textContent = message;
        popup.classList.remove("hidden");

        setTimeout(function () {
            popup.classList.add("hidden");
        }, 2500);
    }

    // ==================== EVENT LISTENERS ====================

    document.getElementById("clickArea")
        .addEventListener("click", handleClick);

    document.getElementById("reapButton")
        .addEventListener("click", handleClick);

    upgrades.forEach(function (upgrade) {
        const card = document.getElementById("upgrade-" + upgrade.id);
        card.addEventListener("click", function () {
            buyUpgrade(upgrade.id);
        });
    });

    // Initial render
    renderAchievements();
    updateDisplay();




    // ==================== HELP OVERLAY FUNCTIONALITY ====================

    const helpButton = document.getElementById("helpButton");
    const helpOverlay = document.getElementById("helpOverlay");
    const closeHelp = document.getElementById("closeHelp");

    // Show the help overlay
    helpButton.addEventListener("click", function () {
        helpOverlay.classList.remove("hidden");
    });

    // Hide the help overlay
    closeHelp.addEventListener("click", function () {
        helpOverlay.classList.add("hidden");
    });


});
