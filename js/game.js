
/* Author Caden Chan, Matthew Kolesnik  

    Date: February 27th 2026

    Description: This is the JavaScript file for our clicker game "Soul Harvester". It contains the core game logic, including the model for tracking souls,
    upgrades, and achievements, as well as the view functions to update the display and handle user interactions. The game allows players to click to earn souls, 
    purchase upgrades to increase their soul harvesting, and unlock achievements based on their progress. The code is structured to be modular 
    and maintainable, with clear separation between the game logic and the user interface.
*/

window.addEventListener("load", function () {

    // ==================== MODEL ====================

    let souls = 0;
    let totalSoulsCollected = 0;
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

    /**
     * Calculates the current cost to buy the next level of an upgrade based on base price, growth rate, and number already owned.
     *
     * @param {Object} upgrade - The upgrade object with basePrice, growth, and owned properties
     * @returns {Number} The integer cost in souls for the next purchase
     */
    function calculateCost(upgrade) {
        return Math.floor(
            upgrade.basePrice * Math.pow(upgrade.growth, upgrade.owned)
        );
    }

    /**
     * Returns the total number of upgrade levels owned across all upgrade types.
     *
     * @returns {Number} Total count of all owned upgrade levels
     */
    function getTotalUpgrades() {
        return upgrades.reduce((sum, u) => sum + u.owned, 0);
    }

    // ==================== GAME LOGIC ====================

    /**
     * Handles a click on the reap/cookie area: adds souls per click to total souls, then updates the display and checks achievements.
     *
     * @returns {void}
     */
    function handleClick() {
        souls += soulsPerClick;
        totalSoulsCollected += soulsPerClick;
        updateDisplay();
        checkAchievements();
    }

    /**
     * Attempts to purchase one level of an upgrade by id. Deducts souls, increments owned count, applies click or auto effect, and updates display/achievements if affordable.
     *
     * @param {String} id - The upgrade id (e.g. "scythe", "spectral", "pact", "rift")
     * @returns {void}
     */
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

    /**
     * Starts or restarts the auto soul-generation timer. Clears any existing interval, then sets a new one based on owned auto upgrades (interval shortens with more levels).
     *
     * @returns {void}
     */
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
            totalSoulsCollected += soulsPerClick * autoUpgrade.owned;
            updateDisplay();
            checkAchievements();
        }, interval);
    }

    // ==================== ACHIEVEMENTS ====================

    /**
     * Checks all achievements; marks any newly met as earned, shows a congrats popup, and re-renders the achievements list.
     *
     * @returns {void}
     */
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

    /**
     * Updates the main game display: score, souls per click, total upgrades count, and the upgrade cards.
     *
     * @returns {void}
     */
    function updateDisplay() {
        document.getElementById("scoreDisplay").textContent = souls;
        document.getElementById("totalSoulsCollected").textContent = "Total Souls Collected: " + totalSoulsCollected;
        document.getElementById("soulsPerClickDisplay").textContent = soulsPerClick;
        document.getElementById("soulsPerSecond").textContent = soulsPerClick * upgrades.find(u => u.type === "auto").owned;
        document.getElementById("totalUpgradesDisplay").textContent = getTotalUpgrades();

        renderUpgrades();
    }

    /**
     * Renders all upgrade cards in the DOM: updates cost, level, and locked/available styling based on current souls.
     *
     * @returns {void}
     */
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

    /**
     * Rebuilds the achievements list in the DOM: creates a card for each achievement with name, description, and earned state.
     *
     * @returns {void}
     */
    function renderAchievements() {
        const container = document.getElementById("achievementsContainer");
        container.innerHTML = "";

        achievements.forEach(function (ach) {
            const div = document.createElement("div");
            div.className = "achievement-card";

            div.className = "achievement-card";
            if (ach.earned) {
                div.style.opacity = "1";
            }

            // Add achievement name on top and description below
            div.innerHTML = `
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-description">
                ${ach.type === "auto" ? "Buy Flock of Ravens" : `Souls needed: ${ach.requirement}`}
            </div>
            ${ach.earned ? '<div class="earned-check">✔</div>' : ''}`;

            container.appendChild(div);
        });
    }

    /**
     * Shows a congratulations popup with the given message, then hides it after 2.5 seconds.
     *
     * @param {String} message - The text to display in the popup (e.g. "First Soul Unlocked!")
     * @returns {void}
     */
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
