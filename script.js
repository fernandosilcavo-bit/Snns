// =============================================================================
// Age of History II - European Theater 1936-1945
// Advanced Strategy Game with Historical Accuracy
// =============================================================================

// Game State Management
let gameState = {
    currentYear: 1936,
    turnCounter: 1,
    selectedCountry: null,
    playerCountry: null,
    playerName: "",
    gamePhase: "start", // start, countrySelection, playing
    isPlayerTurn: true,
    gameSpeed: 1000,
    notifications: [],
    warDeclarations: [],
    alliances: {},
    technologies: {},
    economicData: {},
    militaryUnits: {},
    gameSettings: {
        difficulty: "normal",
        historicalAccuracy: true,
        aiAggression: "medium"
    }
};

// Historical Country Data with Leaders, Flags, and Government Types
const countryData = {
    "DEU": {
        name: "Almanya",
        capital: "Berlin",
        population: 69314000,
        economy: 8500,
        military: 3200,
        stability: 85,
        government: "Faşist Diktatörlük",
        leader: "Adolf Hitler",
        leaderImage: "hitler.jpg",
        flag: "🇩🇪",
        color: "#8B4513",
        territories: ["germany_west", "germany_east", "germany_south"],
        historicalInfo: "Nazi Almanyası, 1936'da Avrupa'nın en güçlü askeri gücüne sahip.",
        aiPersonality: {
            aggression: 0.9,
            expansion: 0.95,
            diplomacy: 0.3,
            defense: 0.7
        }
    },
    "FRA": {
        name: "Fransa",
        capital: "Paris",
        population: 41834000,
        economy: 6200,
        military: 2800,
        stability: 70,
        government: "Cumhuriyet",
        leader: "Léon Blum",
        leaderImage: "blum.jpg",
        flag: "🇫🇷",
        color: "#0055A4",
        territories: ["france_north", "france_south"],
        historicalInfo: "Fransa, Maginot Hattı ile savunmasını güçlendirmiş durumda.",
        aiPersonality: {
            aggression: 0.4,
            expansion: 0.3,
            diplomacy: 0.8,
            defense: 0.9
        }
    },
    "GBR": {
        name: "Birleşik Krallık",
        capital: "London",
        population: 47760000,
        economy: 7800,
        military: 3500,
        stability: 90,
        government: "Anayasal Monarşi",
        leader: "Neville Chamberlain",
        leaderImage: "chamberlain.jpg",
        flag: "🇬🇧",
        color: "#C8102E",
        territories: ["england", "scotland", "wales", "northern_ireland"],
        historicalInfo: "Büyük Britanya İmparatorluğu, güçlü donanması ile denizlere hakim.",
        aiPersonality: {
            aggression: 0.5,
            expansion: 0.4,
            diplomacy: 0.9,
            defense: 0.8
        }
    },
    "SOV": {
        name: "Sovyetler Birliği",
        capital: "Moskova",
        population: 162500000,
        economy: 9200,
        military: 5000,
        stability: 75,
        government: "Sosyalist Cumhuriyet",
        leader: "Josef Stalin",
        leaderImage: "stalin.jpg",
        flag: "🚩",
        color: "#CC0000",
        territories: ["russia_west", "russia_central", "russia_east", "russia_siberia", "ukraine", "belarus", "kazakhstan", "caucasus"],
        historicalInfo: "Sovyetler Birliği, Stalin'in liderliğinde hızla sanayileşiyor.",
        aiPersonality: {
            aggression: 0.8,
            expansion: 0.85,
            diplomacy: 0.4,
            defense: 0.9
        }
    },
    "ITA": {
        name: "İtalya",
        capital: "Roma",
        population: 42994000,
        economy: 4500,
        military: 2200,
        stability: 80,
        government: "Faşist Krallık",
        leader: "Benito Mussolini",
        leaderImage: "mussolini.jpg",
        flag: "🇮🇹",
        color: "#009246",
        territories: ["italy_north", "italy_south"],
        historicalInfo: "Mussolini'nin İtalyası, Akdeniz'de etkisini artırmaya çalışıyor.",
        aiPersonality: {
            aggression: 0.7,
            expansion: 0.8,
            diplomacy: 0.5,
            defense: 0.6
        }
    },
    "POL": {
        name: "Polonya",
        capital: "Varşova",
        population: 34849000,
        economy: 2800,
        military: 1500,
        stability: 65,
        government: "Cumhuriyet",
        leader: "Ignacy Mościcki",
        leaderImage: "moscicki.jpg",
        flag: "🇵🇱",
        color: "#DC143C",
        territories: ["poland_west", "poland_east"],
        historicalInfo: "Polonya, Almanya ve Sovyetler arasında kritik konumda.",
        aiPersonality: {
            aggression: 0.6,
            expansion: 0.3,
            diplomacy: 0.7,
            defense: 0.9
        }
    },
    "ESP": {
        name: "İspanya",
        capital: "Madrid",
        population: 25877000,
        economy: 3200,
        military: 1800,
        stability: 45,
        government: "İç Savaş",
        leader: "Francisco Franco",
        leaderImage: "franco.jpg",
        flag: "🇪🇸",
        color: "#AA151B",
        territories: ["spain_north", "spain_south"],
        historicalInfo: "İspanya İç Savaşı devam ediyor, ülke bölünmüş durumda.",
        aiPersonality: {
            aggression: 0.5,
            expansion: 0.2,
            diplomacy: 0.4,
            defense: 0.8
        }
    }
};

// Government Types and Their Effects
const governmentTypes = {
    "Faşist Diktatörlük": {
        militaryBonus: 1.3,
        economyPenalty: 0.9,
        stabilityEffect: -10,
        recruitmentSpeed: 1.5,
        description: "Güçlü askeri, zayıf ekonomi"
    },
    "Sosyalist Cumhuriyet": {
        militaryBonus: 1.2,
        economyBonus: 1.1,
        stabilityEffect: -5,
        recruitmentSpeed: 1.3,
        description: "Dengeli güç, orta istikrar"
    },
    "Cumhuriyet": {
        militaryBonus: 1.0,
        economyBonus: 1.1,
        stabilityEffect: 10,
        recruitmentSpeed: 1.0,
        description: "Dengeli sistem, yüksek istikrar"
    },
    "Anayasal Monarşi": {
        militaryBonus: 1.1,
        economyBonus: 1.2,
        stabilityEffect: 15,
        recruitmentSpeed: 0.9,
        description: "Güçlü ekonomi, istikrarlı sistem"
    },
    "Askeri Diktatörlük": {
        militaryBonus: 1.4,
        economyPenalty: 0.8,
        stabilityEffect: -15,
        recruitmentSpeed: 1.6,
        description: "Çok güçlü askeri, zayıf ekonomi"
    }
};

// Advanced AI System
class AdvancedAI {
    constructor(countryCode) {
        this.country = countryCode;
        this.personality = countryData[countryCode]?.aiPersonality || {
            aggression: 0.5,
            expansion: 0.5,
            diplomacy: 0.5,
            defense: 0.5
        };
        this.memory = {
            lastActions: [],
            threats: [],
            opportunities: [],
            relationships: {}
        };
        this.strategy = this.determineStrategy();
    }

    determineStrategy() {
        const country = countryData[this.country];
        if (!country) return "defensive";

        if (country.military > 3000 && this.personality.aggression > 0.7) {
            return "aggressive_expansion";
        } else if (country.economy > 6000 && this.personality.diplomacy > 0.7) {
            return "diplomatic_economic";
        } else if (this.personality.defense > 0.8) {
            return "defensive_buildup";
        } else {
            return "balanced";
        }
    }

    makeDecision() {
        const strategy = this.strategy;
        const availableActions = this.getAvailableActions();
        
        switch (strategy) {
            case "aggressive_expansion":
                return this.aggressiveExpansionLogic(availableActions);
            case "diplomatic_economic":
                return this.diplomaticEconomicLogic(availableActions);
            case "defensive_buildup":
                return this.defensiveBuildupLogic(availableActions);
            default:
                return this.balancedLogic(availableActions);
        }
    }

    aggressiveExpansionLogic(actions) {
        // Prioritize military buildup and attacking weak neighbors
        const militaryActions = actions.filter(a => a.type === 'military');
        const attackActions = actions.filter(a => a.type === 'attack');
        
        if (attackActions.length > 0) {
            // Attack the weakest neighbor
            const weakestTarget = attackActions.reduce((weakest, current) => {
                const currentStrength = this.evaluateTargetStrength(current.target);
                const weakestStrength = this.evaluateTargetStrength(weakest.target);
                return currentStrength < weakestStrength ? current : weakest;
            });
            return weakestTarget;
        }
        
        if (militaryActions.length > 0) {
            return militaryActions[0];
        }
        
        return actions[Math.floor(Math.random() * actions.length)];
    }

    diplomaticEconomicLogic(actions) {
        // Focus on economic development and diplomacy
        const economicActions = actions.filter(a => a.type === 'economic');
        const diplomaticActions = actions.filter(a => a.type === 'diplomatic');
        
        if (Math.random() < 0.6 && economicActions.length > 0) {
            return economicActions[0];
        }
        
        if (diplomaticActions.length > 0) {
            return diplomaticActions[0];
        }
        
        return actions[Math.floor(Math.random() * actions.length)];
    }

    defensiveBuildupLogic(actions) {
        // Focus on defense and infrastructure
        const defenseActions = actions.filter(a => a.type === 'defense');
        const infrastructureActions = actions.filter(a => a.type === 'infrastructure');
        
        if (defenseActions.length > 0) {
            return defenseActions[0];
        }
        
        if (infrastructureActions.length > 0) {
            return infrastructureActions[0];
        }
        
        return actions[Math.floor(Math.random() * actions.length)];
    }

    balancedLogic(actions) {
        // Balanced approach based on current situation
        const weights = {
            military: 0.3,
            economic: 0.3,
            diplomatic: 0.2,
            defense: 0.2
        };
        
        const weightedActions = actions.map(action => ({
            ...action,
            weight: weights[action.type] || 0.1
        }));
        
        const totalWeight = weightedActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of weightedActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        
        return actions[0];
    }

    evaluateTargetStrength(target) {
        const targetData = countryData[target];
        if (!targetData) return 1000;
        
        return targetData.military + (targetData.economy * 0.5) + (targetData.stability * 10);
    }

    getAvailableActions() {
        // This would be populated based on the current game state
        return [
            { type: 'military', action: 'recruit_units', priority: 0.7 },
            { type: 'economic', action: 'develop_economy', priority: 0.6 },
            { type: 'diplomatic', action: 'negotiate', priority: 0.5 },
            { type: 'defense', action: 'build_fortifications', priority: 0.4 }
        ];
    }
}

// Country Menu System
class CountryMenu {
    constructor() {
        this.currentCountry = null;
        this.menuElement = null;
        this.createMenuElement();
    }

    createMenuElement() {
        this.menuElement = document.createElement('div');
        this.menuElement.id = 'countryMenu';
        this.menuElement.className = 'country-menu';
        this.menuElement.style.display = 'none';
        document.body.appendChild(this.menuElement);
    }

    show(countryCode, x, y) {
        this.currentCountry = countryCode;
        const country = countryData[countryCode];
        
        if (!country) return;

        this.menuElement.innerHTML = this.generateMenuHTML(country, countryCode);
        this.menuElement.style.left = `${x}px`;
        this.menuElement.style.top = `${y}px`;
        this.menuElement.style.display = 'block';
        
        this.attachEventListeners(countryCode);
    }

    hide() {
        this.menuElement.style.display = 'none';
        this.currentCountry = null;
    }

    generateMenuHTML(country, countryCode) {
        const isPlayerCountry = countryCode === gameState.playerCountry;
        const governmentOptions = Object.keys(governmentTypes).map(gov => 
            `<option value="${gov}" ${country.government === gov ? 'selected' : ''}>${gov}</option>`
        ).join('');

        return `
            <div class="country-menu-header">
                <div class="country-flag">${country.flag}</div>
                <div class="country-info">
                    <h3>${country.name}</h3>
                    <p class="capital">Başkent: ${country.capital}</p>
                </div>
                <button class="close-menu" onclick="countryMenu.hide()">×</button>
            </div>
            
            <div class="leader-section">
                <div class="leader-portrait">
                    <img src="images/leaders/${country.leaderImage}" alt="${country.leader}" 
                         onerror="this.src='images/leaders/default.jpg'">
                </div>
                <div class="leader-info">
                    <h4>${country.leader}</h4>
                    <p class="government-type">${country.government}</p>
                </div>
            </div>
            
            <div class="country-stats">
                <div class="stat-row">
                    <span class="stat-label">👥 Nüfus:</span>
                    <span class="stat-value">${country.population.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">💰 Ekonomi:</span>
                    <span class="stat-value">${country.economy}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">⚔️ Askeri Güç:</span>
                    <span class="stat-value">${country.military}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">📊 İstikrar:</span>
                    <span class="stat-value">${country.stability}%</span>
                </div>
            </div>
            
            ${isPlayerCountry ? `
                <div class="government-section">
                    <label for="governmentSelect">Yönetim Biçimi:</label>
                    <select id="governmentSelect" onchange="changeGovernment('${countryCode}', this.value)">
                        ${governmentOptions}
                    </select>
                    <div class="government-effects">
                        ${this.getGovernmentEffectsHTML(country.government)}
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button onclick="recruitUnits('${countryCode}')" class="action-btn recruit-btn">
                        🪖 Asker Topla
                    </button>
                    <button onclick="developEconomy('${countryCode}')" class="action-btn economy-btn">
                        🏭 Ekonomi Geliştir
                    </button>
                    <button onclick="buildFortifications('${countryCode}')" class="action-btn defense-btn">
                        🏰 Savunma Yap
                    </button>
                    <button onclick="openDiplomacy('${countryCode}')" class="action-btn diplomacy-btn">
                        🤝 Diplomasi
                    </button>
                </div>
            ` : `
                <div class="action-buttons">
                    <button onclick="declareWar('${countryCode}')" class="action-btn war-btn">
                        ⚔️ Savaş İlan Et
                    </button>
                    <button onclick="openDiplomacy('${countryCode}')" class="action-btn diplomacy-btn">
                        🤝 Diplomasi
                    </button>
                    <button onclick="viewIntelligence('${countryCode}')" class="action-btn intel-btn">
                        🕵️ İstihbarat
                    </button>
                </div>
            `}
            
            <div class="historical-info">
                <h4>Tarihsel Bilgi</h4>
                <p>${country.historicalInfo}</p>
            </div>
        `;
    }

    getGovernmentEffectsHTML(governmentType) {
        const effects = governmentTypes[governmentType];
        if (!effects) return '';

        let html = '<div class="effects-list">';
        
        if (effects.militaryBonus && effects.militaryBonus !== 1.0) {
            const bonus = Math.round((effects.militaryBonus - 1) * 100);
            html += `<div class="effect ${bonus > 0 ? 'positive' : 'negative'}">
                ⚔️ Askeri: ${bonus > 0 ? '+' : ''}${bonus}%
            </div>`;
        }
        
        if (effects.economyBonus && effects.economyBonus !== 1.0) {
            const bonus = Math.round((effects.economyBonus - 1) * 100);
            html += `<div class="effect ${bonus > 0 ? 'positive' : 'negative'}">
                💰 Ekonomi: ${bonus > 0 ? '+' : ''}${bonus}%
            </div>`;
        }
        
        if (effects.stabilityEffect !== 0) {
            html += `<div class="effect ${effects.stabilityEffect > 0 ? 'positive' : 'negative'}">
                📊 İstikrar: ${effects.stabilityEffect > 0 ? '+' : ''}${effects.stabilityEffect}%
            </div>`;
        }
        
        html += '</div>';
        return html;
    }

    attachEventListeners(countryCode) {
        // Event listeners are handled by onclick attributes in the HTML
        // This method can be used for additional complex event handling
    }
}

// Game Initialization and Event Handlers
let countryMenu;
let aiControllers = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

function initializeGame() {
    console.log('🎮 Age of History: European Theater başlatılıyor...');
    
    // Initialize systems
    countryMenu = new CountryMenu();
    
    // Initialize AI controllers for all countries
    Object.keys(countryData).forEach(countryCode => {
        aiControllers[countryCode] = new AdvancedAI(countryCode);
    });
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI
    updateUI();
    
    console.log('✅ Oyun başarıyla başlatıldı!');
}

function setupEventListeners() {
    // Start game button
    const startButton = document.getElementById('startGameButton');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    // Country selection
    const selectCountryButton = document.getElementById('selectCountryButton');
    if (selectCountryButton) {
        selectCountryButton.addEventListener('click', selectPlayerCountry);
    }
    
    // Game controls
    const nextTurnButton = document.getElementById('nextTurnButton');
    if (nextTurnButton) {
        nextTurnButton.addEventListener('click', nextTurn);
    }
    
    // Map interaction
    setupMapInteraction();
    
    // Close menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.country-menu') && !e.target.closest('[data-iso]')) {
            countryMenu.hide();
        }
    });
}

function setupMapInteraction() {
    // Wait for map to load
    const mapObject = document.getElementById('gameMapObject');
    if (mapObject) {
        mapObject.addEventListener('load', function() {
            const svgDoc = mapObject.contentDocument;
            if (svgDoc) {
                const countries = svgDoc.querySelectorAll('[data-iso]');
                countries.forEach(country => {
                    country.style.cursor = 'pointer';
                    country.addEventListener('click', function(e) {
                        const countryCode = this.getAttribute('data-iso');
                        const rect = mapObject.getBoundingClientRect();
                        const x = e.clientX - rect.left + 20;
                        const y = e.clientY - rect.top;
                        
                        if (countryData[countryCode]) {
                            countryMenu.show(countryCode, x, y);
                        }
                    });
                    
                    // Add hover effects
                    country.addEventListener('mouseenter', function() {
                        const countryCode = this.getAttribute('data-iso');
                        if (countryData[countryCode]) {
                            this.style.opacity = '0.8';
                            showTooltip(countryCode, event);
                        }
                    });
                    
                    country.addEventListener('mouseleave', function() {
                        this.style.opacity = '1';
                        hideTooltip();
                    });
                });
            }
        });
    }
}

function startGame() {
    const playerName = document.getElementById('playerNameInput').value.trim();
    if (!playerName) {
        alert('Lütfen bir lider adı girin!');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.gamePhase = 'countrySelection';
    
    // Hide start screen and show country selection
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('countrySelectionModal').style.display = 'flex';
    
    populateCountrySelection();
}

function populateCountrySelection() {
    const countryList = document.getElementById('countryList');
    countryList.innerHTML = '';
    
    Object.entries(countryData).forEach(([code, country]) => {
        const countryOption = document.createElement('div');
        countryOption.className = 'country-option';
        countryOption.setAttribute('data-country', code);
        
        countryOption.innerHTML = `
            <div class="country-flag">${country.flag}</div>
            <div class="country-name">${country.name}</div>
            <div class="country-info">
                <div>👥 ${(country.population / 1000000).toFixed(1)}M</div>
                <div>⚔️ ${country.military}</div>
                <div>💰 ${country.economy}</div>
            </div>
            <div class="leader-info">
                <small>${country.leader}</small>
            </div>
        `;
        
        countryOption.addEventListener('click', function() {
            // Remove previous selection
            document.querySelectorAll('.country-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Select this country
            this.classList.add('selected');
            gameState.selectedCountry = code;
        });
        
        countryList.appendChild(countryOption);
    });
}

function selectPlayerCountry() {
    if (!gameState.selectedCountry) {
        alert('Lütfen bir ülke seçin!');
        return;
    }
    
    gameState.playerCountry = gameState.selectedCountry;
    gameState.gamePhase = 'playing';
    
    // Hide country selection modal and show game screen
    document.getElementById('countrySelectionModal').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'grid';
    
    // Update UI with player country info
    updateUI();
    
    // Add notification
    addNotification(`🎮 ${gameState.playerName}, ${countryData[gameState.playerCountry].name}'nın liderliğini üstlendiniz!`);
    
    // Start game loop
    startGameLoop();
}

function nextTurn() {
    if (!gameState.isPlayerTurn) return;
    
    gameState.turnCounter++;
    gameState.currentYear = 1936 + Math.floor(gameState.turnCounter / 4); // 4 turns per year
    gameState.isPlayerTurn = false;
    
    // Process player turn effects
    processPlayerTurn();
    
    // Process AI turns
    processAITurns();
    
    // Update game state
    updateGameState();
    
    // Update UI
    updateUI();
    
    // Player turn again
    gameState.isPlayerTurn = true;
    
    addNotification(`📅 ${gameState.currentYear} yılı, ${gameState.turnCounter}. tur başladı!`);
}

function processPlayerTurn() {
    const playerCountry = countryData[gameState.playerCountry];
    if (!playerCountry) return;
    
    // Economic growth
    const economicGrowth = Math.floor(playerCountry.economy * 0.02);
    playerCountry.economy += economicGrowth;
    
    // Military maintenance
    const militaryMaintenance = Math.floor(playerCountry.military * 0.01);
    playerCountry.economy = Math.max(0, playerCountry.economy - militaryMaintenance);
    
    // Stability changes based on government
    const govEffects = governmentTypes[playerCountry.government];
    if (govEffects) {
        playerCountry.stability += govEffects.stabilityEffect * 0.1;
        playerCountry.stability = Math.max(0, Math.min(100, playerCountry.stability));
    }
}

function processAITurns() {
    Object.keys(countryData).forEach(countryCode => {
        if (countryCode === gameState.playerCountry) return;
        
        const ai = aiControllers[countryCode];
        if (ai) {
            const decision = ai.makeDecision();
            executeAIDecision(countryCode, decision);
        }
    });
}

function executeAIDecision(countryCode, decision) {
    const country = countryData[countryCode];
    if (!country || !decision) return;
    
    switch (decision.action) {
        case 'recruit_units':
            if (country.economy >= 100) {
                country.military += 50;
                country.economy -= 100;
                if (Math.random() < 0.3) {
                    addNotification(`🪖 ${country.name} askeri güçlerini artırdı!`);
                }
            }
            break;
            
        case 'develop_economy':
            if (country.economy >= 50) {
                country.economy += 75;
                if (Math.random() < 0.3) {
                    addNotification(`🏭 ${country.name} ekonomisini geliştirdi!`);
                }
            }
            break;
            
        case 'build_fortifications':
            if (country.economy >= 150) {
                country.economy -= 150;
                country.stability += 5;
                if (Math.random() < 0.3) {
                    addNotification(`🏰 ${country.name} savunma hatlarını güçlendirdi!`);
                }
            }
            break;
    }
}

function updateGameState() {
    // Check for historical events
    checkHistoricalEvents();
    
    // Update relationships
    updateDiplomaticRelations();
    
    // Check victory conditions
    checkVictoryConditions();
}

function checkHistoricalEvents() {
    // Historical events based on year
    switch (gameState.currentYear) {
        case 1938:
            if (Math.random() < 0.7) {
                addNotification(`📰 Anschluss: Almanya Avusturya'yı ilhak etti!`);
                if (countryData['DEU']) {
                    countryData['DEU'].military += 200;
                    countryData['DEU'].economy += 300;
                }
            }
            break;
            
        case 1939:
            if (Math.random() < 0.8) {
                addNotification(`⚔️ Almanya Polonya'ya saldırdı! II. Dünya Savaşı başladı!`);
                gameState.warDeclarations.push({
                    attacker: 'DEU',
                    defender: 'POL',
                    year: 1939
                });
            }
            break;
            
        case 1940:
            if (Math.random() < 0.6) {
                addNotification(`🇫🇷 Fransa'nın düşüşü! Almanya Fransa'yı işgal etti!`);
            }
            break;
            
        case 1941:
            if (Math.random() < 0.7) {
                addNotification(`❄️ Barbarossa Harekâtı: Almanya Sovyetler Birliği'ne saldırdı!`);
                gameState.warDeclarations.push({
                    attacker: 'DEU',
                    defender: 'SOV',
                    year: 1941
                });
            }
            break;
    }
}

function updateDiplomaticRelations() {
    // This would handle complex diplomatic relationships
    // For now, we'll keep it simple
}

function checkVictoryConditions() {
    const playerCountry = countryData[gameState.playerCountry];
    if (!playerCountry) return;
    
    // Victory conditions
    const totalEuropeanEconomy = Object.values(countryData).reduce((sum, country) => sum + country.economy, 0);
    const playerEconomicShare = (playerCountry.economy / totalEuropeanEconomy) * 100;
    
    if (playerEconomicShare >= 60) {
        showVictoryScreen('economic');
    } else if (playerCountry.economy >= 10000) {
        showVictoryScreen('wealth');
    } else if (gameState.currentYear >= 1945) {
        showVictoryScreen('survival');
    }
}

function showVictoryScreen(type) {
    let message = '';
    switch (type) {
        case 'economic':
            message = '🏆 Ekonomik Zafer! Avrupa\'nın %60\'ını kontrol ediyorsunuz!';
            break;
        case 'wealth':
            message = '💰 Zenginlik Zaferi! 10,000 altın biriktirdiniz!';
            break;
        case 'survival':
            message = '🎖️ Hayatta Kalma Zaferi! Savaşı atlattınız!';
            break;
    }
    
    alert(`${message}\n\nTebrikler ${gameState.playerName}!`);
}

function updateUI() {
    // Update year and turn
    const yearElement = document.getElementById('gameYear');
    if (yearElement) yearElement.textContent = gameState.currentYear;
    
    const turnElement = document.getElementById('turnCounter');
    if (turnElement) turnElement.textContent = gameState.turnCounter;
    
    // Update player country info
    if (gameState.playerCountry) {
        const country = countryData[gameState.playerCountry];
        const countryNameElement = document.getElementById('playerCountryName');
        if (countryNameElement) countryNameElement.textContent = country.name;
        
        const coinElement = document.getElementById('playerCoin');
        if (coinElement) coinElement.textContent = country.economy;
        
        const unitsElement = document.getElementById('playerUnitsReady');
        if (unitsElement) unitsElement.textContent = country.military;
    }
    
    // Update notifications
    updateNotifications();
}

function updateNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    // Keep only last 10 notifications
    if (gameState.notifications.length > 10) {
        gameState.notifications = gameState.notifications.slice(-10);
    }
    
    notificationList.innerHTML = gameState.notifications
        .slice(-5) // Show last 5
        .map(notification => `<li>${notification}</li>`)
        .join('');
}

function addNotification(message) {
    const timestamp = `[${gameState.currentYear}]`;
    gameState.notifications.push(`${timestamp} ${message}`);
    updateNotifications();
}

// Country Action Functions
function changeGovernment(countryCode, newGovernment) {
    const country = countryData[countryCode];
    if (!country) return;
    
    const oldGovernment = country.government;
    country.government = newGovernment;
    
    // Apply government change effects
    const newEffects = governmentTypes[newGovernment];
    const oldEffects = governmentTypes[oldGovernment];
    
    if (newEffects && oldEffects) {
        // Calculate transition effects
        const stabilityChange = (newEffects.stabilityEffect - oldEffects.stabilityEffect) * 0.5;
        country.stability += stabilityChange;
        country.stability = Math.max(0, Math.min(100, country.stability));
    }
    
    addNotification(`🏛️ ${country.name} yönetim biçimini ${newGovernment} olarak değiştirdi!`);
    
    // Update the menu if it's currently showing this country
    if (countryMenu.currentCountry === countryCode) {
        const rect = countryMenu.menuElement.getBoundingClientRect();
        countryMenu.show(countryCode, rect.left, rect.top);
    }
}

function recruitUnits(countryCode) {
    const country = countryData[countryCode];
    if (!country) return;
    
    const cost = 200;
    const units = 100;
    
    if (country.economy >= cost) {
        country.economy -= cost;
        country.military += units;
        addNotification(`🪖 ${country.name} ${units} yeni asker topladı!`);
        updateUI();
    } else {
        alert('Yeterli ekonomik gücünüz yok!');
    }
}

function developEconomy(countryCode) {
    const country = countryData[countryCode];
    if (!country) return;
    
    const cost = 150;
    const growth = 200;
    
    if (country.economy >= cost) {
        country.economy += growth - cost;
        addNotification(`🏭 ${country.name} ekonomisini geliştirdi!`);
        updateUI();
    } else {
        alert('Yeterli ekonomik gücünüz yok!');
    }
}

function buildFortifications(countryCode) {
    const country = countryData[countryCode];
    if (!country) return;
    
    const cost = 300;
    
    if (country.economy >= cost) {
        country.economy -= cost;
        country.stability += 10;
        country.stability = Math.min(100, country.stability);
        addNotification(`🏰 ${country.name} savunma hatlarını güçlendirdi!`);
        updateUI();
    } else {
        alert('Yeterli ekonomik gücünüz yok!');
    }
}

function declareWar(targetCountry) {
    if (!gameState.playerCountry || targetCountry === gameState.playerCountry) return;
    
    const playerCountryData = countryData[gameState.playerCountry];
    const targetCountryData = countryData[targetCountry];
    
    if (!playerCountryData || !targetCountryData) return;
    
    const confirmation = confirm(`${targetCountryData.name}'a savaş ilan etmek istediğinizden emin misiniz?`);
    if (!confirmation) return;
    
    // Declare war
    gameState.warDeclarations.push({
        attacker: gameState.playerCountry,
        defender: targetCountry,
        year: gameState.currentYear
    });
    
    addNotification(`⚔️ ${playerCountryData.name} ${targetCountryData.name}'a savaş ilan etti!`);
    
    // Start combat
    startCombat(gameState.playerCountry, targetCountry);
}

function startCombat(attacker, defender) {
    const attackerData = countryData[attacker];
    const defenderData = countryData[defender];
    
    if (!attackerData || !defenderData) return;
    
    // Simple combat calculation
    const attackerStrength = attackerData.military * (attackerData.stability / 100);
    const defenderStrength = defenderData.military * (defenderData.stability / 100) * 1.2; // Defender bonus
    
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const finalAttackerStrength = attackerStrength * randomFactor;
    
    let result;
    if (finalAttackerStrength > defenderStrength) {
        // Attacker wins
        const losses = Math.floor(attackerData.military * 0.1);
        const defenderLosses = Math.floor(defenderData.military * 0.3);
        
        attackerData.military -= losses;
        defenderData.military -= defenderLosses;
        defenderData.economy = Math.floor(defenderData.economy * 0.7);
        defenderData.stability -= 20;
        
        result = `🎉 ${attackerData.name} zaferi! ${defenderData.name} ağır kayıplar verdi.`;
    } else {
        // Defender wins
        const attackerLosses = Math.floor(attackerData.military * 0.2);
        const defenderLosses = Math.floor(defenderData.military * 0.1);
        
        attackerData.military -= attackerLosses;
        defenderData.military -= defenderLosses;
        attackerData.stability -= 15;
        
        result = `🛡️ ${defenderData.name} savunması başarılı! ${attackerData.name} geri çekildi.`;
    }
    
    addNotification(result);
    updateUI();
    countryMenu.hide();
}

function openDiplomacy(targetCountry) {
    alert(`Diplomasi sistemi geliştiriliyor... ${countryData[targetCountry]?.name} ile görüşmeler yakında!`);
}

function viewIntelligence(targetCountry) {
    const country = countryData[targetCountry];
    if (!country) return;
    
    const intel = `
🕵️ ${country.name} İstihbaratı:
    
👥 Nüfus: ${country.population.toLocaleString()}
💰 Ekonomi: ${country.economy}
⚔️ Askeri Güç: ${country.military}
📊 İstikrar: ${country.stability}%
🏛️ Yönetim: ${country.government}
👑 Lider: ${country.leader}

📍 Stratejik Durum:
${country.historicalInfo}
    `;
    
    alert(intel);
}

// Tooltip system
function showTooltip(countryCode, event) {
    const country = countryData[countryCode];
    if (!country) return;
    
    let tooltip = document.getElementById('countryTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'countryTooltip';
        tooltip.className = 'country-tooltip';
        document.body.appendChild(tooltip);
    }
    
    tooltip.innerHTML = `
        <div class="tooltip-header">
            ${country.flag} ${country.name}
        </div>
        <div class="tooltip-content">
            👑 ${country.leader}<br>
            ⚔️ ${country.military} | 💰 ${country.economy}
        </div>
    `;
    
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY - 10}px`;
    tooltip.style.display = 'block';
}

function hideTooltip() {
    const tooltip = document.getElementById('countryTooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Game loop
function startGameLoop() {
    // This could be used for continuous updates, animations, etc.
    setInterval(() => {
        // Auto-save game state
        localStorage.setItem('ageOfHistoryGameState', JSON.stringify(gameState));
    }, 30000); // Save every 30 seconds
}

// Load saved game
function loadGame() {
    const savedState = localStorage.getItem('ageOfHistoryGameState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            Object.assign(gameState, parsedState);
            updateUI();
            addNotification('🔄 Oyun yüklendi!');
        } catch (error) {
            console.error('Oyun yüklenirken hata:', error);
        }
    }
}

// Export functions for global access
window.changeGovernment = changeGovernment;
window.recruitUnits = recruitUnits;
window.developEconomy = developEconomy;
window.buildFortifications = buildFortifications;
window.declareWar = declareWar;
window.openDiplomacy = openDiplomacy;
window.viewIntelligence = viewIntelligence;
window.countryMenu = countryMenu;

console.log('🎮 Age of History: European Theater - Gelişmiş Strateji Oyunu Yüklendi!');