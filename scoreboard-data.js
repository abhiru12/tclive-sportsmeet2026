// ========================================
// TCLIVE SPORTS - SCOREBOARD DATA
// ========================================
// Edit scores below to update the live scoreboard
// Changes will automatically reflect on the website

// ========================================
// HOUSE SCORES CONFIGURATION
// ========================================
const SCOREBOARD_DATA = {
    // ADVI HOUSE (BLUE)
    advi: {
        name: 'ADVI',
        color: '#3b82f6',
        sports: {
            Elle: 88,
            Cricket: 92,
            Volleyball: 78,
            Football: 88,
            Badminton: 95
        }
    },
    
    // ANUPA HOUSE (YELLOW)
    anupa: {
        name: 'ANUPA',
        color: '#fbbf24',
        sports: {
            Elle: 87,
            Cricket: 80,
            Volleyball: 93,
            Football: 85,
            Badminton: 91
        }
    },
    
    // AGRA HOUSE (GREEN)
    agra: {
        name: 'AGRA',
        color: '#10b981',
        sports: {
            Elle: 88,
            Cricket: 84,
            Volleyball: 86,
            Football: 90,
            Badminton: 82
        }
    },
    
    // ANABI HOUSE (RED)
    anabi: {
        name: 'ANABI',
        color: '#e8001e',
        sports: {
            Elle: 92,
            Cricket: 89,
            Volleyball: 91,
            Football: 87,
            Badminton: 88
        }
    }
};

// ========================================
// AUTO-UPDATE CONFIGURATION
// ========================================
const AUTO_UPDATE_CONFIG = {
    // Enable/disable live updates
    enabled: true,
    
    // Update interval in milliseconds (5000 = 5 seconds)
    interval: 5000,
    
    // Show update notifications
    showNotifications: true,
    
    // Last update timestamp
    lastUpdate: new Date().toISOString()
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get total points for a house
 * @param {string} house - House name (advi, anupa, agra, anabi)
 * @returns {number} Total points
 */
function getHouseTotal(house) {
    if (!SCOREBOARD_DATA[house]) return 0;
    const scores = Object.values(SCOREBOARD_DATA[house].sports);
    return scores.reduce((sum, score) => sum + score, 0);
}

/**
 * Get all house totals
 * @returns {Object} Object with house totals
 */
function getAllTotals() {
    return {
        advi: getHouseTotal('advi'),
        anupa: getHouseTotal('anupa'),
        agra: getHouseTotal('agra'),
        anabi: getHouseTotal('anabi')
    };
}

/**
 * Get house rankings
 * @returns {Array} Sorted array of houses by total points
 */
function getHouseRankings() {
    const totals = getAllTotals();
    return Object.entries(totals)
        .map(([house, total]) => ({
            house: SCOREBOARD_DATA[house].name,
            key: house,
            total: total,
            color: SCOREBOARD_DATA[house].color
        }))
        .sort((a, b) => b.total - a.total);
}

/**
 * Get score for a specific sport and house
 * @param {string} house - House name
 * @param {string} sport - Sport name
 * @returns {number} Score
 */
function getScore(house, sport) {
    if (!SCOREBOARD_DATA[house] || !SCOREBOARD_DATA[house].sports[sport]) {
        return 0;
    }
    return SCOREBOARD_DATA[house].sports[sport];
}

/**
 * Update score for a specific sport and house
 * @param {string} house - House name
 * @param {string} sport - Sport name
 * @param {number} newScore - New score value
 * @returns {boolean} Success status
 */
function updateScore(house, sport, newScore) {
    if (!SCOREBOARD_DATA[house] || !SCOREBOARD_DATA[house].sports[sport]) {
        console.error(`Invalid house "${house}" or sport "${sport}"`);
        return false;
    }
    
    SCOREBOARD_DATA[house].sports[sport] = newScore;
    AUTO_UPDATE_CONFIG.lastUpdate = new Date().toISOString();
    
    console.log(`✅ Updated ${house.toUpperCase()} ${sport}: ${newScore} points`);
    return true;
}

/**
 * Get last update time
 * @returns {string} ISO timestamp
 */
function getLastUpdateTime() {
    return AUTO_UPDATE_CONFIG.lastUpdate;
}

// ========================================
// QUICK UPDATE FUNCTIONS
// ========================================

/**
 * Quick update for ADVI house
 */
function updateAdvi(elle, cricket, volleyball, football, badminton) {
    SCOREBOARD_DATA.advi.sports = {
        Elle: elle,
        Cricket: cricket,
        Volleyball: volleyball,
        Football: football,
        Badminton: badminton
    };
    AUTO_UPDATE_CONFIG.lastUpdate = new Date().toISOString();
    console.log('✅ ADVI scores updated');
}

/**
 * Quick update for ANUPA house
 */
function updateAnupa(elle, cricket, volleyball, football, badminton) {
    SCOREBOARD_DATA.anupa.sports = {
        Elle: elle,
        Cricket: cricket,
        Volleyball: volleyball,
        Football: football,
        Badminton: badminton
    };
    AUTO_UPDATE_CONFIG.lastUpdate = new Date().toISOString();
    console.log('✅ ANUPA scores updated');
}

/**
 * Quick update for AGRA house
 */
function updateAgra(elle, cricket, volleyball, football, badminton) {
    SCOREBOARD_DATA.agra.sports = {
        Elle: elle,
        Cricket: cricket,
        Volleyball: volleyball,
        Football: football,
        Badminton: badminton
    };
    AUTO_UPDATE_CONFIG.lastUpdate = new Date().toISOString();
    console.log('✅ AGRA scores updated');
}

/**
 * Quick update for ANABI house
 */
function updateAnabi(elle, cricket, volleyball, football, badminton) {
    SCOREBOARD_DATA.anabi.sports = {
        Elle: elle,
        Cricket: cricket,
        Volleyball: volleyball,
        Football: football,
        Badminton: badminton
    };
    AUTO_UPDATE_CONFIG.lastUpdate = new Date().toISOString();
    console.log('✅ ANABI scores updated');
}

// ========================================
// EXPORT DATA
// ========================================
if (typeof module !== 'undefined' && module.exports) {
    // Node.js export
    module.exports = {
        SCOREBOARD_DATA,
        AUTO_UPDATE_CONFIG,
        getHouseTotal,
        getAllTotals,
        getHouseRankings,
        getScore,
        updateScore,
        getLastUpdateTime,
        updateAdvi,
        updateAnupa,
        updateAgra,
        updateAnabi
    };
}

// ========================================
// USAGE EXAMPLES
// ========================================

/*

// Example 1: Update individual sport score
updateScore('advi', 'Cricket', 95);

// Example 2: Update all scores for a house
updateAdvi(88, 94, 80, 90, 96);

// Example 3: Get house total
const adviTotal = getHouseTotal('advi');
console.log('ADVI Total:', adviTotal);

// Example 4: Get all totals
const allTotals = getAllTotals();
console.log('All Totals:', allTotals);

// Example 5: Get rankings
const rankings = getHouseRankings();
console.log('Rankings:', rankings);

// Example 6: Get specific score
const adviCricket = getScore('advi', 'Cricket');
console.log('ADVI Cricket Score:', adviCricket);

*/

// ========================================
// CONSOLE MESSAGE
// ========================================
console.log('🏆 TCLive Sports - Scoreboard Data Loaded');
console.log('📊 Current Rankings:');
getHouseRankings().forEach((house, index) => {
    console.log(`${index + 1}. ${house.house}: ${house.total} points`);
});
console.log('⏰ Last Update:', AUTO_UPDATE_CONFIG.lastUpdate);
console.log('');
console.log('💡 Quick Update Commands:');
console.log('updateAdvi(elle, cricket, volleyball, football, badminton)');
console.log('updateAnupa(elle, cricket, volleyball, football, badminton)');
console.log('updateAgra(elle, cricket, volleyball, football, badminton)');
console.log('updateAnabi(elle, cricket, volleyball, football, badminton)');