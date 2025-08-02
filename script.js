// ============================================================================
// Sabitler ve Global Değişkenler
// ============================================================================
const WAR_CHANCE_BASE = 0.15; // AI'nın savaş ilan etme temel şansı
const UNIT_COST = 20;
const INCOME_PER_REGION = 10;
const INITIAL_PLAYER_COINS = 150;
const INITIAL_AI_COINS = 100;
const STARTING_UNITS_PER_REGION = 2; // Başlangıçta her bölgede 2 birim var

// AI Personality Types - Age of History tarzı
const AI_PERSONALITIES = {
    AGGRESSIVE: { warChance: 0.3, expansionFocus: 0.8, defenseFocus: 0.2 },
    DEFENSIVE: { warChance: 0.1, expansionFocus: 0.3, defenseFocus: 0.7 },
    BALANCED: { warChance: 0.2, expansionFocus: 0.5, defenseFocus: 0.5 },
    EXPANSIONIST: { warChance: 0.25, expansionFocus: 0.9, defenseFocus: 0.1 }
};

let playerName = '';
let playerCountryId = '';
let playerCountryName = '';
let currentTurn = 1;
let gameMapObject;
let svgDoc; // SVG dökümanına erişim için

// Savaş ve diplomasi sistemi
let currentAttackMode = false;
let selectedAttackingRegionNutsId = null;
let targetCountryIdForWar = null;
let warDeclarations = {}; // Aktif savaşlar

// Age of History tarzı game state
let gamePhase = 'setup'; // setup, playing, ended
let victoryConditions = {
    territoryControl: 0.6, // %60 toprak kontrolü
    economicDominance: 10000 // 10000 coin
};

// ============================================================================
// DOM Elementleri - Gelişmiş Sistem
// ============================================================================
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const playerNameInput = document.getElementById('playerNameInput');
const startGameButton = document.getElementById('startGameButton');
const welcomeMessage = document.getElementById('welcomeMessage');
const turnCounter = document.getElementById('turnCounter');
const playerCoinElement = document.getElementById('playerCoin');
const playerUnitsReadyElement = document.getElementById('playerUnitsReady');
const playerCountryNameElement = document.getElementById('playerCountryName');
const buyUnitButton = document.getElementById('buyUnitButton');
const nextTurnButton = document.getElementById('nextTurnButton');
const mapContainer = document.getElementById('mapContainer');
const gameMapSVG = document.getElementById('gameMapObject');
const unitCountsOverlay = document.getElementById('unitCountsOverlay');
const notificationsList = document.getElementById('notificationList');

const countrySelectionModal = document.getElementById('countrySelectionModal');
const countryListDiv = document.getElementById('countryList');
const selectCountryButton = document.getElementById('selectCountryButton');

const targetCountrySelect = document.getElementById('targetCountrySelect');
const declareWarButton = document.getElementById('declareWarButton');

// Yeni Modal Elementleri
const countryInfoModal = document.getElementById('countryInfoModal');
const closeCountryInfoButton = document.getElementById('closeCountryInfoButton');
const governmentChangeModal = document.getElementById('governmentChangeModal');

// Global Variables for Enhanced Features
let selectedCountryForInfo = null;
let currentGovernmentChangeCountry = null;
let territoryClickEnabled = true;

// ============================================================================
// Gelişmiş Ülke Bilgi Sistemi
// ============================================================================

function showCountryInfo(countryId) {
    const country = countriesData[countryId];
    if (!country) return;

    selectedCountryForInfo = countryId;
    
    // Temel bilgileri doldur
    document.getElementById('countryInfoTitle').textContent = `🏛️ ${country.name}`;
    document.getElementById('countryFullName').textContent = country.name;
    document.getElementById('countryLeader').textContent = country.leader || 'Bilinmiyor';
    document.getElementById('countryGovernment').textContent = country.governmentType || 'Bilinmiyor';
    document.getElementById('countryIdeology').textContent = country.ideology || 'Bilinmiyor';
    document.getElementById('countryCapital').textContent = getCapitalName(country.capital) || 'Bilinmiyor';
    document.getElementById('countryPopulation').textContent = formatNumber(country.population) || 'Bilinmiyor';
    document.getElementById('countryCoins').textContent = country.coins || 0;
    document.getElementById('countryUnits').textContent = getTotalUnitsForCountry(countryId);
    document.getElementById('countryEra').textContent = country.era || '1936';
    
    // İstatistikleri güncelle
    updateCountryStats(country);
    
    // Güç seviyesini göster
    const powerLevel = document.getElementById('powerLevel');
    powerLevel.textContent = getPowerLevelText(country.type);
    powerLevel.className = `power-${country.type}`;
    
    // Bayrak ve lider portresini ayarla
    setupCountryVisuals(country);
    
    // Toprakları listele
    displayCountryTerritories(country);
    
    // Eylem butonlarını ayarla
    setupCountryActions(countryId);
    
    countryInfoModal.style.display = 'block';
}

function updateCountryStats(country) {
    // İstatistik barlarını güncelle
    const stats = [
        { id: 'stability', value: country.stability || 50 },
        { id: 'warSupport', value: country.warSupport || 50 },
        { id: 'industry', value: country.industry || 50 },
        { id: 'military', value: country.military || 50 }
    ];
    
    stats.forEach(stat => {
        const bar = document.getElementById(stat.id + 'Bar');
        const valueSpan = document.getElementById(stat.id + 'Value');
        
        if (bar && valueSpan) {
            setTimeout(() => {
                bar.style.width = stat.value + '%';
                valueSpan.textContent = stat.value + '%';
            }, 300);
        }
    });
}

function getPowerLevelText(type) {
    const levels = {
        'superpower': 'Süper Güç',
        'major_power': 'Büyük Güç',
        'regional_power': 'Bölgesel Güç',
        'minor_power': 'Küçük Güç'
    };
    return levels[type] || 'Bilinmiyor';
}

function getCapitalName(capitalId) {
    // Başkent isimlerini döndür (basitleştirilmiş)
    const capitals = {
        'RU3': 'Moskova',
        'DE30': 'Berlin',
        'UKI1': 'Londra',
        'FR10': 'Paris',
        'ITE4': 'Roma',
        'PL12': 'Varşova',
        'TR10': 'Ankara'
        // Daha fazla başkent eklenebilir
    };
    return capitals[capitalId] || capitalId;
}

function formatNumber(num) {
    if (!num) return '0';
    return num.toLocaleString('tr-TR');
}

function setupCountryVisuals(country) {
    const flagDiv = document.getElementById('countryFlag');
    const portraitDiv = document.getElementById('leaderPortrait');
    
    // Bayrak (placeholder)
    flagDiv.innerHTML = `<div style="color: ${country.color}; font-size: 24px;">🏳️</div>`;
    
    // Lider portresi (placeholder)
    portraitDiv.innerHTML = `<div style="color: #d4af37; font-size: 14px; text-align: center;">${country.leader || 'Lider'}</div>`;
}

function displayCountryTerritories(country) {
    const territoriesDiv = document.getElementById('countryTerritories');
    territoriesDiv.innerHTML = '';
    
    country.nuts2.forEach(territoryId => {
        const territoryDiv = document.createElement('div');
        territoryDiv.className = 'territory-item';
        territoryDiv.textContent = `${territoryId} (${regionUnits[territoryId] || 0} birim)`;
        territoriesDiv.appendChild(territoryDiv);
    });
}

function setupCountryActions(countryId) {
    const declareWarBtn = document.getElementById('declareWarFromInfo');
    const changeGovBtn = document.getElementById('changeGovernmentType');
    
    // Savaş ilan etme butonu
    declareWarBtn.onclick = () => {
        if (countryId !== playerCountryId) {
            targetCountryIdForWar = countryId;
            executeWarDeclaration();
            countryInfoModal.style.display = 'none';
        }
    };
    
    // Hükümet değiştirme butonu (sadece oyuncu ülkesi için)
    if (countryId === playerCountryId) {
        changeGovBtn.style.display = 'block';
        changeGovBtn.onclick = () => {
            showGovernmentChangeModal(countryId);
        };
    } else {
        changeGovBtn.style.display = 'none';
    }
}

// ============================================================================
// Hükümet Değiştirme Sistemi
// ============================================================================

function showGovernmentChangeModal(countryId) {
    currentGovernmentChangeCountry = countryId;
    governmentChangeModal.style.display = 'block';
    
    // Mevcut hükümeti vurgula
    const currentGov = countriesData[countryId].governmentType;
    document.querySelectorAll('.government-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.type === currentGov) {
            option.classList.add('selected');
        }
    });
}

function changeGovernment(newGovType, cost) {
    const country = countriesData[currentGovernmentChangeCountry];
    
    if (country.coins < cost) {
        addNotification(`❌ Hükümet değişikliği için yeterli altın yok! (${cost} altın gerekli)`);
        return false;
    }
    
    const oldGov = country.governmentType;
    country.governmentType = newGovType;
    country.coins -= cost;
    
    // Hükümet tipine göre bonuslar uygula
    applyGovernmentBonuses(country, newGovType);
    
    addNotification(`🏛️ ${country.name} hükümeti ${oldGov}'den ${newGovType}'e değişti!`);
    updateUI();
    
    return true;
}

function applyGovernmentBonuses(country, govType) {
    // Eski bonusları temizle (basitleştirilmiş)
    
    // Yeni bonusları uygula
    switch(govType) {
        case 'Democracy':
            country.stability = Math.min(100, (country.stability || 50) + 15);
            country.warSupport = Math.max(0, (country.warSupport || 50) - 10);
            break;
        case 'Monarchy':
            country.stability = Math.min(100, (country.stability || 50) + 10);
            break;
        case 'Fascism':
            country.military = Math.min(100, (country.military || 50) + 20);
            country.stability = Math.max(0, (country.stability || 50) - 5);
            break;
        case 'Communism':
            country.industry = Math.min(100, (country.industry || 50) + 15);
            break;
    }
}

// ============================================================================
// Gelişmiş Harita Etkileşimi
// ============================================================================

function setupMapInteraction() {
    gameMapSVG.addEventListener('load', function() {
        const svgDoc = gameMapSVG.contentDocument;
        if (!svgDoc) return;
        
        // Tüm path elementlerine click event ekle
        const paths = svgDoc.querySelectorAll('path');
        paths.forEach(path => {
            path.style.cursor = 'pointer';
            path.addEventListener('click', function(e) {
                if (!territoryClickEnabled) return;
                
                const regionId = this.getAttribute('data-nuts2') || this.getAttribute('id');
                if (regionId) {
                    handleTerritoryClick(regionId, e);
                }
            });
            
            // Hover efektleri
            path.addEventListener('mouseenter', function() {
                if (territoryClickEnabled) {
                    this.style.filter = 'brightness(1.3)';
                }
            });
            
            path.addEventListener('mouseleave', function() {
                this.style.filter = 'brightness(1)';
            });
        });
    });
}

function handleTerritoryClick(regionId, event) {
    // Hangi ülkeye ait olduğunu bul
    const countryId = findCountryByRegion(regionId);
    
    if (countryId) {
        // Sağ tık ile ülke bilgilerini göster
        if (event.button === 2 || event.ctrlKey) {
            event.preventDefault();
            showCountryInfo(countryId);
            return;
        }
        
        // Sol tık ile savaş modu
        if (currentAttackMode && selectedAttackingRegionNutsId) {
            handleAttackOnRegion(regionId);
        } else {
            // Normal tık ile ülke seçimi veya bilgi
            showCountryInfo(countryId);
        }
    }
}

function findCountryByRegion(regionId) {
    for (const [countryId, country] of Object.entries(countriesData)) {
        if (country.nuts2.includes(regionId)) {
            return countryId;
        }
    }
    return null;
}

// ============================================================================
// Gelişmiş AI Sistemi
// ============================================================================

// AI Kişilik Tipleri - Geliştirilmiş
const AI_PERSONALITIES_ENHANCED = {
    AGGRESSIVE: { 
        warChance: 0.35, 
        expansionFocus: 0.9, 
        defenseFocus: 0.2,
        diplomacyFocus: 0.1,
        economicFocus: 0.3
    },
    DEFENSIVE: { 
        warChance: 0.1, 
        expansionFocus: 0.2, 
        defenseFocus: 0.8,
        diplomacyFocus: 0.6,
        economicFocus: 0.5
    },
    BALANCED: { 
        warChance: 0.2, 
        expansionFocus: 0.5, 
        defenseFocus: 0.5,
        diplomacyFocus: 0.4,
        economicFocus: 0.6
    },
    EXPANSIONIST: { 
        warChance: 0.3, 
        expansionFocus: 0.95, 
        defenseFocus: 0.1,
        diplomacyFocus: 0.2,
        economicFocus: 0.4
    }
};

// Gelişmiş AI karar verme sistemi
function makeAdvancedAIDecisions(countryId) {
    const country = countriesData[countryId];
    const personality = AI_PERSONALITIES_ENHANCED[country.personality] || AI_PERSONALITIES_ENHANCED.BALANCED;
    
    const decisions = {
        economic: [],
        military: [],
        diplomatic: []
    };
    
    // Ekonomik kararlar
    if (Math.random() < personality.economicFocus) {
        if (country.coins >= UNIT_COST * 2) {
            decisions.economic.push('buyUnit');
        }
        if (country.coins >= UNIT_COST * 5 && Math.random() < 0.3) {
            decisions.economic.push('developIndustry');
        }
    }
    
    // Askeri kararlar
    if (Math.random() < personality.warChance) {
        const potentialTargets = findPotentialTargets(countryId);
        if (potentialTargets.length > 0) {
            const target = selectBestTarget(countryId, potentialTargets);
            if (target) {
                decisions.military.push({
                    type: 'declareWar',
                    target: target,
                    priority: calculateWarPriority(countryId, target)
                });
            }
        }
    }
    
    return decisions;
}

function findPotentialTargets(countryId) {
    const country = countriesData[countryId];
    const targets = [];
    
    // Komşu ülkeleri bul
    const neighbors = findNeighboringCountries(countryId);
    
    for (const neighborId of neighbors) {
        if (neighborId !== countryId && !warDeclarations[countryId]?.includes(neighborId)) {
            const neighbor = countriesData[neighborId];
            const strength = calculateCountryStrength(neighborId);
            const myStrength = calculateCountryStrength(countryId);
            
            // Sadece daha zayıf ülkelere saldır (AI daha akıllı)
            if (myStrength > strength * 1.2) {
                targets.push({
                    id: neighborId,
                    strength: strength,
                    attractiveness: calculateTargetAttractiveness(countryId, neighborId)
                });
            }
        }
    }
    
    return targets.sort((a, b) => b.attractiveness - a.attractiveness);
}

function calculateCountryStrength(countryId) {
    const country = countriesData[countryId];
    const totalUnits = getTotalUnitsForCountry(countryId);
    const territoryCount = country.nuts2.length;
    const economicPower = country.coins / 100;
    const militaryBonus = (country.military || 50) / 100;
    
    return (totalUnits * 2 + territoryCount + economicPower) * militaryBonus;
}

function calculateTargetAttractiveness(attackerId, targetId) {
    const target = countriesData[targetId];
    const attacker = countriesData[attackerId];
    
    let score = 0;
    
    // Toprak değeri
    score += target.nuts2.length * 10;
    
    // Ekonomik değer
    score += target.coins / 10;
    
    // Stratejik değer (büyük güçler daha çekici)
    if (target.type === 'major_power') score += 50;
    if (target.type === 'superpower') score += 100;
    
    // Zayıflık bonusu
    const targetStrength = calculateCountryStrength(targetId);
    const attackerStrength = calculateCountryStrength(attackerId);
    if (attackerStrength > targetStrength) {
        score += (attackerStrength - targetStrength) / 10;
    }
    
    return score;
}

function selectBestTarget(countryId, targets) {
    if (targets.length === 0) return null;
    
    // En çekici hedefi seç
    return targets[0].id;
}

function calculateWarPriority(attackerId, targetId) {
    return calculateTargetAttractiveness(attackerId, targetId);
}

// ============================================================================
// Event Listeners - Gelişmiş Sistem
// ============================================================================

// Ülke bilgi modalı kapatma
closeCountryInfoButton.addEventListener('click', () => {
    countryInfoModal.style.display = 'none';
});

// Hükümet değiştirme modal event'leri
document.querySelectorAll('.government-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.government-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
    });
});

document.getElementById('confirmGovernmentChange').addEventListener('click', () => {
    const selectedOption = document.querySelector('.government-option.selected');
    if (selectedOption && currentGovernmentChangeCountry) {
        const govType = selectedOption.dataset.type;
        const costs = { Democracy: 500, Monarchy: 300, Fascism: 400, Communism: 600 };
        
        if (changeGovernment(govType, costs[govType])) {
            governmentChangeModal.style.display = 'none';
            // Ülke bilgi modalını güncelle
            if (selectedCountryForInfo === currentGovernmentChangeCountry) {
                showCountryInfo(currentGovernmentChangeCountry);
            }
        }
    }
});

document.getElementById('cancelGovernmentChange').addEventListener('click', () => {
    governmentChangeModal.style.display = 'none';
});

// Modal dışına tıklayınca kapatma
window.addEventListener('click', (event) => {
    if (event.target === countryInfoModal) {
        countryInfoModal.style.display = 'none';
    }
    if (event.target === governmentChangeModal) {
        governmentChangeModal.style.display = 'none';
    }
});

// Sağ tık menüsünü engelle (kendi context menümüz için)
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('#mapContainer')) {
        e.preventDefault();
    }
});

// Harita etkileşimini başlat
document.addEventListener('DOMContentLoaded', () => {
    setupMapInteraction();
});

// ============================================================================
// Gelişmiş Komşuluk Sistemi
// ============================================================================

function findNeighboringCountries(countryId) {
    const country = countriesData[countryId];
    const neighbors = new Set();
    
    // Bu basitleştirilmiş bir yaklaşım - gerçekte SVG'den komşuluk bilgisi alınmalı
    for (const [otherCountryId, otherCountry] of Object.entries(countriesData)) {
        if (otherCountryId !== countryId) {
            // Coğrafi yakınlık kontrolü (basitleştirilmiş)
            if (areCountriesNeighbors(country, otherCountry)) {
                neighbors.add(otherCountryId);
            }
        }
    }
    
    return Array.from(neighbors);
}

function areCountriesNeighbors(country1, country2) {
    // Basit komşuluk kontrolü - gerçekte daha sofistike olmalı
    const regions1 = country1.nuts2;
    const regions2 = country2.nuts2;
    
    // Avrupa ülkeleri için basit komşuluk mantığı
    const neighboringPairs = [
        ['USSR', 'POLAND'], ['USSR', 'FINLAND'], ['USSR', 'ROMANIA'],
        ['GERMAN_REICH', 'POLAND'], ['GERMAN_REICH', 'CZECHOSLOVAKIA'], ['GERMAN_REICH', 'FRENCH_REPUBLIC'],
        ['BRITISH_EMPIRE', 'FRENCH_REPUBLIC'], ['FRENCH_REPUBLIC', 'GERMAN_REICH'], ['FRENCH_REPUBLIC', 'KINGDOM_OF_ITALY'],
        ['KINGDOM_OF_ITALY', 'GERMAN_REICH'], ['POLAND', 'CZECHOSLOVAKIA'], ['ROMANIA', 'HUNGARY'],
        // Daha fazla komşuluk ilişkisi eklenebilir
    ];
    
    const country1Id = Object.keys(countriesData).find(id => countriesData[id] === country1);
    const country2Id = Object.keys(countriesData).find(id => countriesData[id] === country2);
    
    return neighboringPairs.some(pair => 
        (pair[0] === country1Id && pair[1] === country2Id) ||
        (pair[1] === country1Id && pair[0] === country2Id)
    );
}

// ============================================================================
// DOM Elementleri
// ============================================================================
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const playerNameInput = document.getElementById('playerNameInput');
const startGameButton = document.getElementById('startGameButton');
const welcomeMessage = document.getElementById('welcomeMessage');
const turnCounter = document.getElementById('turnCounter');
const playerCoinElement = document.getElementById('playerCoin');
const playerUnitsReadyElement = document.getElementById('playerUnitsReady');
const playerCountryNameElement = document.getElementById('playerCountryName');
const buyUnitButton = document.getElementById('buyUnitButton');
const nextTurnButton = document.getElementById('nextTurnButton');
const mapContainer = document.getElementById('mapContainer');
const gameMapSVG = document.getElementById('gameMapObject');
const unitCountsOverlay = document.getElementById('unitCountsOverlay');
const notificationsList = document.getElementById('notificationList');

const countrySelectionModal = document.getElementById('countrySelectionModal');
const countryListDiv = document.getElementById('countryList');
const selectCountryButton = document.getElementById('selectCountryButton');

const targetCountrySelect = document.getElementById('targetCountrySelect');
const declareWarButton = document.getElementById('declareWarButton');

// ============================================================================
// Gelişmiş Ülke Verileri - Age of History Tarzı Büyük Güçler
// ============================================================================
let countriesData = {
    // SOVYET SOSYALİST CUMHURİYETLER BİRLİĞİ - Devasa Toprak
    'USSR': { 
        name: 'Sovyet Sosyalist Cumhuriyetler Birliği', 
        nuts2: [
            // Rusya'nın Batı Bölgeleri
            'RU1', 'RU2', 'RU3', 'RU4', 'RU5', 'RU6', 'RU7', 'RU8', 'RU9', 'RU10',
            // Sibirya ve Uzak Doğu
            'RU11', 'RU12', 'RU13', 'RU14', 'RU15', 'RU16', 'RU17', 'RU18', 'RU19', 'RU20',
            // Ukrayna SSR
            'UA01', 'UA02', 'UA03', 'UA04', 'UA05', 'UA06', 'UA07',
            // Belarus SSR
            'BY01', 'BY02', 'BY03', 'BY04',
            // Baltık SSR'leri
            'EE00', 'LV00', 'LT00',
            // Kafkasya SSR'leri
            'GE01', 'GE02', 'AM01', 'AZ01', 'AZ02',
            // Orta Asya SSR'leri
            'KZ01', 'KZ02', 'KZ03', 'UZ01', 'UZ02', 'TM01', 'KG01', 'TJ01',
            // Moldova SSR
            'MD01',
            // Finlandiya'dan alınan topraklar
            'FI13', 'FI18', 'FI19', 'FI1A', 'FI20'
        ],
        isPlayer: false, 
        color: '#CC0000', 
        coins: INITIAL_AI_COINS * 3, // En büyük güç
        units: 0,
        personality: 'AGGRESSIVE',
        capital: 'RU3', // Moskova
        era: '1936',
        type: 'superpower',
        governmentType: 'Communist State',
        ideology: 'Marxism-Leninism',
        leader: 'Joseph Stalin',
        flagUrl: 'flags/ussr.png',
        leaderPortrait: 'leaders/stalin.png',
        stability: 85,
        warSupport: 70,
        population: 170000000,
        industry: 90,
        military: 95
    },
    
    // ALMAN REICH - Nazi Almanya
    'GERMAN_REICH': { 
        name: 'Deutsches Reich', 
        nuts2: [
            // Almanya
            'DE11', 'DE12', 'DE13', 'DE14', 'DE21', 'DE22', 'DE23', 'DE24', 'DE25', 'DE26', 'DE27', 
            'DE30', 'DE42', 'DE41', 'DE50', 'DE60', 'DE71', 'DE72', 'DE73', 'DE80', 'DE91', 'DE92', 
            'DE93', 'DE94', 'DEA1', 'DEA2', 'DEA3', 'DEA4', 'DEA5', 'DEB1', 'DEB2', 'DEB3', 'DEC0', 
            'DED1', 'DED2', 'DED3', 'DEE0', 'DEF0', 'DEG0',
            // Avusturya (Anschluss 1938)
            'AT11', 'AT12', 'AT13', 'AT21', 'AT22', 'AT31', 'AT32', 'AT33', 'AT34',
            // Sudetenland
            'CZ01', 'CZ02'
        ],
        isPlayer: false, 
        color: '#444444', 
        coins: INITIAL_AI_COINS * 2.5, 
        units: 0,
        personality: 'AGGRESSIVE',
        capital: 'DE30', // Berlin
        era: '1936',
        type: 'major_power',
        governmentType: 'Fascist State',
        ideology: 'National Socialism',
        leader: 'Adolf Hitler',
        flagUrl: 'flags/nazi_germany.png',
        leaderPortrait: 'leaders/hitler.png',
        stability: 90,
        warSupport: 85,
        population: 80000000,
        industry: 85,
        military: 90
    },
    
    // BÜYÜK BRİTANYA İMPARATORLUĞU
    'BRITISH_EMPIRE': { 
        name: 'British Empire', 
        nuts2: [
            // İngiltere
            'UKC1', 'UKC2', 'UKD1', 'UKD2', 'UKD3', 'UKD4', 'UKD5', 'UKE1', 'UKE2', 'UKE3', 'UKE4', 
            'UKF1', 'UKF2', 'UKF3', 'UKG1', 'UKG2', 'UKG3', 'UKH1', 'UKH2', 'UKH3', 'UKI1', 'UKI2', 
            'UKJ1', 'UKJ2', 'UKJ3', 'UKJ4', 'UKK1', 'UKK2', 'UKK3', 'UKK4', 'UKL1', 'UKL2', 'UKM2', 
            'UKM3', 'UKM5', 'UKM6', 'UKN0',
            // İrlanda
            'IE01', 'IE02'
        ],
        isPlayer: false, 
        color: '#000080', 
        coins: INITIAL_AI_COINS * 2.5, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'UKI1', // London
        era: '1936',
        type: 'major_power',
        governmentType: 'Constitutional Monarchy',
        ideology: 'Democracy',
        leader: 'King George VI',
        flagUrl: 'flags/uk.png',
        leaderPortrait: 'leaders/george_vi.png',
        stability: 95,
        warSupport: 60,
        population: 47000000,
        industry: 80,
        military: 85
    },
    
    // FRANSIZ CUMHURİYETİ
    'FRENCH_REPUBLIC': { 
        name: 'République française', 
        nuts2: [
            // Fransa
            'FR10', 'FR21', 'FR22', 'FR23', 'FR24', 'FR25', 'FR26', 'FR30', 'FR41', 'FR42', 'FR43', 
            'FR51', 'FR52', 'FR53', 'FR61', 'FR62', 'FR63', 'FR71', 'FR72', 'FR81', 'FR82', 'FR83'
        ],
        isPlayer: false, 
        color: '#0066CC', 
        coins: INITIAL_AI_COINS * 2, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'FR10', // Paris
        era: '1936',
        type: 'major_power',
        governmentType: 'Republic',
        ideology: 'Democracy',
        leader: 'Albert Lebrun',
        flagUrl: 'flags/france.png',
        leaderPortrait: 'leaders/lebrun.png',
        stability: 70,
        warSupport: 50,
        population: 42000000,
        industry: 70,
        military: 75
    },
    
    // İTALYAN KRALLIĞI
    'KINGDOM_OF_ITALY': { 
        name: 'Regno d\'Italia', 
        nuts2: [
            'ITC1', 'ITC2', 'ITC3', 'ITC4', 'ITD1', 'ITD2', 'ITD3', 'ITD4', 'ITD5', 
            'ITE1', 'ITE2', 'ITE3', 'ITE4', 'ITF1', 'ITF2', 'ITF3', 'ITF4', 'ITF5', 'ITF6', 'ITG1', 'ITG2'
        ],
        isPlayer: false, 
        color: '#008000', 
        coins: INITIAL_AI_COINS * 1.5, 
        units: 0,
        personality: 'EXPANSIONIST',
        capital: 'ITE4', // Roma
        era: '1936',
        type: 'major_power',
        governmentType: 'Fascist Kingdom',
        ideology: 'Fascism',
        leader: 'Benito Mussolini',
        flagUrl: 'flags/italy.png',
        leaderPortrait: 'leaders/mussolini.png',
        stability: 80,
        warSupport: 75,
        population: 44000000,
        industry: 60,
        military: 70
    },
    
    // JAPONYA İMPARATORLUĞU
    'EMPIRE_OF_JAPAN': { 
        name: '大日本帝国', 
        nuts2: ['JP01', 'JP02', 'JP03', 'JP04', 'JP05'], // Sembolik Japonya bölgeleri
        isPlayer: false, 
        color: '#8B0000', 
        coins: INITIAL_AI_COINS * 2, 
        units: 0,
        personality: 'AGGRESSIVE',
        capital: 'JP01', // Tokyo
        era: '1936',
        type: 'major_power',
        governmentType: 'Military Empire',
        ideology: 'Militarism',
        leader: 'Emperor Hirohito',
        flagUrl: 'flags/japan.png',
        leaderPortrait: 'leaders/hirohito.png',
        stability: 90,
        warSupport: 80,
        population: 70000000,
        industry: 75,
        military: 85
    },
    
    // POLONYA CUMHURİYETİ
    'POLAND': { 
        name: 'Rzeczpospolita Polska', 
        nuts2: ['PL11', 'PL12', 'PL21', 'PL22', 'PL31', 'PL32', 'PL33', 'PL34', 'PL41', 'PL42', 'PL43', 'PL51', 'PL52', 'PL61', 'PL62', 'PL63'],
        isPlayer: false, 
        color: '#DC143C', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'PL12', // Warszawa
        era: '1936',
        type: 'minor_power',
        governmentType: 'Republic',
        ideology: 'Democracy',
        leader: 'Ignacy Mościcki',
        flagUrl: 'flags/poland.png',
        leaderPortrait: 'leaders/moscicki.png',
        stability: 75,
        warSupport: 70,
        population: 35000000,
        industry: 40,
        military: 55
    },
    
    // ÇEKOSLOVAKYA CUMHURİYETİ
    'CZECHOSLOVAKIA': { 
        name: 'Československá republika', 
        nuts2: ['CZ03', 'CZ04', 'CZ05', 'CZ06', 'CZ07', 'CZ08', 'SK01', 'SK02', 'SK03', 'SK04'],
        isPlayer: false, 
        color: '#4169E1', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'CZ03', // Praha
        era: '1936',
        type: 'minor_power',
        governmentType: 'Republic',
        ideology: 'Democracy',
        leader: 'Edvard Beneš',
        flagUrl: 'flags/czechoslovakia.png',
        leaderPortrait: 'leaders/benes.png',
        stability: 70,
        warSupport: 60,
        population: 15000000,
        industry: 50,
        military: 45
    },
    
    // ROMANYA KRALLIĞI
    'ROMANIA': { 
        name: 'Regatul României', 
        nuts2: ['RO11', 'RO12', 'RO21', 'RO22', 'RO31', 'RO32', 'RO41', 'RO42'],
        isPlayer: false, 
        color: '#FFD700', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'BALANCED',
        capital: 'RO32', // București
        era: '1936',
        type: 'minor_power',
        governmentType: 'Kingdom',
        ideology: 'Authoritarianism',
        leader: 'King Carol II',
        flagUrl: 'flags/romania.png',
        leaderPortrait: 'leaders/carol_ii.png',
        stability: 65,
        warSupport: 55,
        population: 20000000,
        industry: 35,
        military: 40
    },
    
    // MACARISTAN KRALLIĞI
    'HUNGARY': { 
        name: 'Magyar Királyság', 
        nuts2: ['HU10', 'HU21', 'HU22', 'HU23', 'HU31', 'HU32', 'HU33'],
        isPlayer: false, 
        color: '#228B22', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'BALANCED',
        capital: 'HU10', // Budapest
        era: '1936',
        type: 'minor_power',
        governmentType: 'Kingdom',
        ideology: 'Authoritarianism',
        leader: 'Miklós Horthy',
        flagUrl: 'flags/hungary.png',
        leaderPortrait: 'leaders/horthy.png',
        stability: 70,
        warSupport: 60,
        population: 9000000,
        industry: 40,
        military: 45
    },
    
    // YUGOSLAVYA KRALLIĞI
    'YUGOSLAVIA': { 
        name: 'Kraljevina Jugoslavija', 
        nuts2: ['HR01', 'HR02', 'HR03', 'SI01', 'SI02', 'MK00', 'BG31', 'BG32'],
        isPlayer: false, 
        color: '#6B8E23', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'HR01', // Beograd
        era: '1936',
        type: 'minor_power',
        governmentType: 'Kingdom',
        ideology: 'Authoritarianism',
        leader: 'King Peter II',
        flagUrl: 'flags/yugoslavia.png',
        leaderPortrait: 'leaders/peter_ii.png',
        stability: 60,
        warSupport: 50,
        population: 16000000,
        industry: 30,
        military: 40
    },
    
    // BULGARİSTAN KRALLIĞI
    'BULGARIA': { 
        name: 'Царство България', 
        nuts2: ['BG33', 'BG34', 'BG41', 'BG42'],
        isPlayer: false, 
        color: '#8FBC8F', 
        coins: INITIAL_AI_COINS * 0.8, 
        units: 0,
        personality: 'BALANCED',
        capital: 'BG34', // Sofia
        era: '1936',
        type: 'minor_power',
        governmentType: 'Kingdom',
        ideology: 'Authoritarianism',
        leader: 'King Boris III',
        flagUrl: 'flags/bulgaria.png',
        leaderPortrait: 'leaders/boris_iii.png',
        stability: 70,
        warSupport: 55,
        population: 6000000,
        industry: 25,
        military: 35
    },
    
    // YUNANİSTAN KRALLIĞI
    'GREECE': { 
        name: 'Βασίλειον τῆς Ἑλλάδος', 
        nuts2: ['GR11', 'GR12', 'GR13', 'GR14', 'GR21', 'GR22', 'GR23', 'GR24', 'GR25', 'GR30', 'GR41', 'GR42', 'GR43'],
        isPlayer: false, 
        color: '#4682B4', 
        coins: INITIAL_AI_COINS * 0.7, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'GR30', // Athina
        era: '1936',
        type: 'minor_power',
        governmentType: 'Kingdom',
        ideology: 'Authoritarianism',
        leader: 'King George II',
        flagUrl: 'flags/greece.png',
        leaderPortrait: 'leaders/george_ii.png',
        stability: 65,
        warSupport: 70,
        population: 7000000,
        industry: 20,
        military: 35
    },
    
    // TÜRKİYE CUMHURİYETİ
    'TURKEY': { 
        name: 'Türkiye Cumhuriyeti', 
        nuts2: ['TR10', 'TR21', 'TR22', 'TR31', 'TR32', 'TR33', 'TR41', 'TR42', 'TR51', 'TR52', 'TR61', 'TR62', 'TR63', 'TR71', 'TR72', 'TR81', 'TR82', 'TR83', 'TR90', 'TRA1', 'TRA2', 'TRB1', 'TRB2', 'TRC1', 'TRC2', 'TRC3'],
        isPlayer: false, 
        color: '#B22222', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'BALANCED',
        capital: 'TR10', // Ankara
        era: '1936',
        type: 'regional_power',
        governmentType: 'Republic',
        ideology: 'Kemalism',
        leader: 'Mustafa Kemal Atatürk',
        flagUrl: 'flags/turkey.png',
        leaderPortrait: 'leaders/ataturk.png',
        stability: 85,
        warSupport: 65,
        population: 17000000,
        industry: 35,
        military: 50
    },
    
    // FİNLANDİYA
    'FINLAND': { 
        name: 'Suomen tasavalta', 
        nuts2: ['FI11', 'FI12', 'FI14', 'FI15', 'FI16', 'FI17'],
        isPlayer: false, 
        color: '#87CEEB', 
        coins: INITIAL_AI_COINS * 0.6, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'FI11', // Helsinki
        era: '1936',
        type: 'minor_power',
        governmentType: 'Republic',
        ideology: 'Democracy',
        leader: 'Kyösti Kallio',
        flagUrl: 'flags/finland.png',
        leaderPortrait: 'leaders/kallio.png',
        stability: 80,
        warSupport: 85,
        population: 4000000,
        industry: 30,
        military: 40
    },
    
    // İSVEÇ KRALLIĞI
    'SWEDEN': { 
        name: 'Konungariket Sverige', 
        nuts2: ['SE11', 'SE12', 'SE21', 'SE22', 'SE23', 'SE31', 'SE32', 'SE33'],
        isPlayer: false, 
        color: '#FFD700', 
        coins: INITIAL_AI_COINS * 0.8, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'SE11', // Stockholm
        era: '1936',
        type: 'minor_power',
        governmentType: 'Constitutional Monarchy',
        ideology: 'Neutrality',
        leader: 'King Gustaf V',
        flagUrl: 'flags/sweden.png',
        leaderPortrait: 'leaders/gustaf_v.png',
        stability: 90,
        warSupport: 30,
        population: 6000000,
        industry: 45,
        military: 35
    },
    
    // NORVEÇ KRALLIĞI
    'NORWAY': { 
        name: 'Kongeriket Norge', 
        nuts2: ['NO01', 'NO02', 'NO03', 'NO04', 'NO05', 'NO06', 'NO07'],
        isPlayer: false, 
        color: '#B0C4DE', 
        coins: INITIAL_AI_COINS * 0.6, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'NO01', // Oslo
        era: '1936',
        type: 'minor_power',
        governmentType: 'Constitutional Monarchy',
        ideology: 'Democracy',
        leader: 'King Haakon VII',
        flagUrl: 'flags/norway.png',
        leaderPortrait: 'leaders/haakon_vii.png',
        stability: 85,
        warSupport: 40,
        population: 3000000,
        industry: 35,
        military: 30
    },
    
    // DANİMARKA KRALLIĞI
    'DENMARK': { 
        name: 'Kongeriget Danmark', 
        nuts2: ['DK01', 'DK02', 'DK03', 'DK04', 'DK05'],
        isPlayer: false, 
        color: '#CD5C5C', 
        coins: INITIAL_AI_COINS * 0.5, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'DK01', // København
        era: '1936',
        type: 'minor_power',
        governmentType: 'Constitutional Monarchy',
        ideology: 'Democracy',
        leader: 'King Christian X',
        flagUrl: 'flags/denmark.png',
        leaderPortrait: 'leaders/christian_x.png',
        stability: 85,
        warSupport: 25,
        population: 4000000,
        industry: 40,
        military: 25
    },
    
    // HOLLANDA KRALLIĞI
    'NETHERLANDS': { 
        name: 'Koninkrijk der Nederlanden', 
        nuts2: ['NL11', 'NL12', 'NL13', 'NL21', 'NL22', 'NL23', 'NL31', 'NL32', 'NL33', 'NL34', 'NL41', 'NL42'],
        isPlayer: false, 
        color: '#FF8C00', 
        coins: INITIAL_AI_COINS * 0.8, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'NL32', // Amsterdam
        era: '1936',
        type: 'minor_power',
        governmentType: 'Constitutional Monarchy',
        ideology: 'Democracy',
        leader: 'Queen Wilhelmina',
        flagUrl: 'flags/netherlands.png',
        leaderPortrait: 'leaders/wilhelmina.png',
        stability: 80,
        warSupport: 35,
        population: 9000000,
        industry: 55,
        military: 30
    },
    
    // BELÇİKA KRALLIĞI
    'BELGIUM': { 
        name: 'Royaume de Belgique', 
        nuts2: ['BE10', 'BE21', 'BE22', 'BE23', 'BE24', 'BE25', 'BE31', 'BE32', 'BE33', 'BE34', 'BE35'],
        isPlayer: false, 
        color: '#000000', 
        coins: INITIAL_AI_COINS * 0.7, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'BE10', // Bruxelles
        era: '1936',
        type: 'minor_power',
        governmentType: 'Constitutional Monarchy',
        ideology: 'Democracy',
        leader: 'King Leopold III',
        flagUrl: 'flags/belgium.png',
        leaderPortrait: 'leaders/leopold_iii.png',
        stability: 75,
        warSupport: 40,
        population: 8000000,
        industry: 60,
        military: 35
    },
    
    // İSVİÇRE
    'SWITZERLAND': { 
        name: 'Schweizerische Eidgenossenschaft', 
        nuts2: ['CH01', 'CH02', 'CH03', 'CH04', 'CH05', 'CH06', 'CH07'],
        isPlayer: false, 
        color: '#DC143C', 
        coins: INITIAL_AI_COINS * 0.6, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'CH02', // Bern
        era: '1936',
        type: 'minor_power',
        governmentType: 'Federal Republic',
        ideology: 'Neutrality',
        leader: 'Rudolf Minger',
        flagUrl: 'flags/switzerland.png',
        leaderPortrait: 'leaders/minger.png',
        stability: 95,
        warSupport: 20,
        population: 4000000,
        industry: 50,
        military: 40
    },
    
    // PORTEKIZ CUMHURİYETİ
    'PORTUGAL': { 
        name: 'República Portuguesa', 
        nuts2: ['PT11', 'PT15', 'PT16', 'PT17', 'PT18', 'PT20', 'PT30'],
        isPlayer: false, 
        color: '#228B22', 
        coins: INITIAL_AI_COINS * 0.5, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'PT17', // Lisboa
        era: '1936',
        type: 'minor_power',
        governmentType: 'Authoritarian Republic',
        ideology: 'Authoritarianism',
        leader: 'António Salazar',
        flagUrl: 'flags/portugal.png',
        leaderPortrait: 'leaders/salazar.png',
        stability: 80,
        warSupport: 45,
        population: 7000000,
        industry: 25,
        military: 30
    },
    
    // İSPANYA CUMHURİYETİ
    'SPAIN': { 
        name: 'Segunda República Española', 
        nuts2: ['ES11', 'ES12', 'ES13', 'ES21', 'ES22', 'ES23', 'ES24', 'ES30', 'ES41', 'ES42', 'ES43', 'ES51', 'ES52', 'ES53', 'ES61', 'ES62', 'ES70'],
        isPlayer: false, 
        color: '#FFD700', 
        coins: INITIAL_AI_COINS * 0.8, 
        units: 0,
        personality: 'BALANCED',
        capital: 'ES30', // Madrid
        era: '1936',
        type: 'regional_power',
        governmentType: 'Republic',
        ideology: 'Democracy',
        leader: 'Manuel Azaña',
        flagUrl: 'flags/spain.png',
        leaderPortrait: 'leaders/azana.png',
        stability: 45, // İç savaş öncesi
        warSupport: 60,
        population: 26000000,
        industry: 35,
        military: 40
    }
};

// NUTS Bölgeleri ve Komşulukları (Tüm Ülkeler ve UK Dahil)
// LÜTFEN BU KOMŞULUKLARI KENDİ SVG'NİZDEKİ HARİTA SINIRLARINA GÖRE TEKRAR KONTROL EDİN VE GEREKİRSE DÜZELTİN!
const nutsNeighbors = {
    // Türkiye NUTS2 komşulukları (örnek, kendi SVG'nize göre doldurun)
    'TR10': ['TR21', 'TR41', 'BG34', 'EL43'], // Bulgaristan ve Yunanistan ile komşu
    'TR21': ['TR10', 'TR22', 'TR31'],
    'TR22': ['TR21', 'TR31', 'TR41'],
    'TR31': ['TR21', 'TR22', 'TR32', 'TR41', 'TR42'],
    'TR32': ['TR31', 'TR33', 'TR51'],
    'TR33': ['TR32', 'TR51', 'TR52', 'TR61'],
    'TR41': ['TR10', 'TR22', 'TR31', 'TR42', 'TR90'],
    'TR42': ['TR31', 'TR41', 'TR51', 'TR52', 'TR61', 'TR62', 'TR90'],
    'TR51': ['TR32', 'TR33', 'TR42', 'TR52', 'TR61', 'TR71'],
    'TR52': ['TR33', 'TR42', 'TR51', 'TR61', 'TR62', 'TR63'],
    'TR61': ['TR33', 'TR42', 'TR51', 'TR52', 'TR71', 'TR81'],
    'TR62': ['TR42', 'TR52', 'TR61', 'TR63', 'TR81', 'TR82'],
    'TR63': ['TR52', 'TR62', 'TR71', 'TR82', 'TR83', 'TRC1', 'CY00'], // CY00: Kıbrıs ile denizden komşu varsayımı
    'TR71': ['TR51', 'TR61', 'TR63', 'TR81', 'TR90'],
    'TR72': ['TR71', 'BG34'], // BG34 ile komşu
    'TR81': ['TR61', 'TR62', 'TR71', 'TR82', 'TR90', 'TRA1'],
    'TR82': ['TR62', 'TR63', 'TR81', 'TR83', 'TRA1', 'TRA2'],
    'TR83': ['TR63', 'TR82', 'TRB1', 'TRC1', 'TRA2'],
    'TR90': ['TR41', 'TR42', 'TR71', 'TR81', 'TRB2'],
    'TRA1': ['TR81', 'TR82', 'TRA2', 'TRB1', 'TRB2', 'TRC1'],
    'TRA2': ['TR82', 'TR83', 'TRA1', 'TRB1', 'TRC1'],
    'TRB1': ['TR83', 'TRA1', 'TRA2', 'TRB2', 'TRC1', 'TRC2'],
    'TRB2': ['TR90', 'TRA1', 'TRB1', 'TRC2', 'TRC3'],
    'TRC1': ['TR63', 'TR83', 'TRA1', 'TRA2', 'TRB1', 'TRC2'],
    'TRC2': ['TRB1', 'TRB2', 'TRC1', 'TRC3'],
    'TRC3': ['TRB2', 'TRC2'],

    // Avusturya Komşulukları
    'AT11': ['AT12', 'AT13', 'CZ01', 'DE14', 'DE21', 'SK01'],
    'AT12': ['AT11', 'AT21', 'DE21'],
    'AT13': ['AT11', 'AT21', 'AT31'],
    'AT21': ['AT12', 'AT13', 'AT22', 'AT31', 'ITD4', 'SI03'],
    'AT22': ['AT21', 'AT31', 'HU10', 'SK01'],
    'AT31': ['AT13', 'AT21', 'AT22', 'AT32', 'AT33', 'AT34', 'CH01', 'DEG0', 'ITG2', 'SI03'],
    'AT32': ['AT31', 'AT33'],
    'AT33': ['AT31', 'AT32', 'DEG0'],
    'AT34': ['AT31', 'SI03'],

    // Belçika Komşulukları
    'BE10': ['BE21', 'BE22', 'BE23', 'NL11', 'FR10', 'UKD1', 'UKD6'], // UK ile deniz komşuluğu eklenmiştir
    'BE21': ['BE10', 'BE22', 'BE31', 'NL13', 'LU00', 'FRB0'],
    'BE22': ['BE10', 'BE21', 'BE23', 'BE24', 'BE31', 'NL13'],
    'BE23': ['BE10', 'BE22', 'BE24', 'BE31', 'NL13'],
    'BE24': ['BE22', 'BE23', 'BE32'],
    'BE25': ['BE34'], // İç bölge
    'BE31': ['BE21', 'BE22', 'BE23', 'BE32', 'BE33', 'FRB0', 'DEB1', 'DEB2', 'DEB3', 'LU00'],
    'BE32': ['BE24', 'BE31', 'BE33'],
    'BE33': ['BE31', 'BE32', 'BE34', 'DEB3'],
    'BE34': ['BE25', 'BE33', 'DEB3'],
    'BE35': ['BE24'], // İç bölge

    // Bulgaristan Komşulukları
    'BG31': ['BG32', 'RO42', 'RS12'],
    'BG32': ['BG31', 'BG33', 'RO42'],
    'BG33': ['BG32', 'BG34', 'EL41', 'MK00'],
    'BG34': ['BG33', 'EL41', 'TR72', 'TR10'],
    'BG41': ['BG42', 'RS21'],
    'BG42': ['BG41', 'RO42', 'RS12', 'MK00'],

    // İsviçre Komşulukları
    'CH01': ['CH02', 'CH03', 'DEG0', 'FRC1', 'ITG2', 'AT31'],
    'CH02': ['CH01', 'CH04', 'FRC1', 'ITG2'],
    'CH03': ['CH01', 'CH05', 'DEG0'],
    'CH04': ['CH02', 'CH06', 'ITG2'],
    'CH05': ['CH03', 'CH07', 'DEG0'],
    'CH06': ['CH04', 'CH07', 'ITG2'],
    'CH07': ['CH05', 'CH06', 'ITG2'],

    // Kıbrıs Komşulukları
    'CY00': ['TR63'], // Deniz komşuluğu varsayımı

    // Çekya Komşulukları
    'CZ01': ['CZ02', 'DE14', 'DE21', 'DE22', 'DE23', 'DE24', 'AT11'],
    'CZ02': ['CZ01', 'CZ03', 'DE14', 'DE21', 'AT11'],
    'CZ03': ['CZ02', 'CZ04', 'PL82', 'PL84', 'DE14', 'DE21'],
    'CZ04': ['CZ03', 'CZ05', 'PL84', 'SK04'],
    'CZ05': ['CZ04', 'CZ06', 'SK04'],
    'CZ06': ['CZ05', 'CZ07', 'DE91'],
    'CZ07': ['CZ06', 'CZ08', 'DE91'],
    'CZ08': ['CZ07', 'AT11', 'DE91'],

    // Almanya Komşulukları (Tüm komşulukları doldurmak yerine, genel mantığı ve çapraz sınırları belirtilmiştir)
    'DE11': ['DE12', 'DK01', 'NL11'],
    'DE12': ['DE11', 'DE13', 'DK01', 'DK02', 'NL11', 'NL12'],
    'DE13': ['DE12', 'DE14', 'DK02', 'NL12', 'NL13'],
    'DE14': ['DE13', 'DE21', 'PL92', 'CZ01'],
    'DE21': ['DE14', 'DE22', 'DE23', 'CZ01', 'CZ02', 'PL91', 'PL92'],
    'DE22': ['DE21', 'DE23', 'AT11', 'CZ01'],
    'DE23': ['DE21', 'DE22', 'AT11', 'CZ01'],
    'DE24': ['DE21', 'CZ01'], // Örnek olarak birkaç tane
    'DE25': ['DE26', 'NL21', 'NL22', 'NL23', 'BE10'],
    'DE26': ['DE25', 'NL23'],
    'DE27': ['DE26', 'FRD1', 'FRD2', 'LU00', 'BE31'],
    'DE30': ['DE40', 'DE50', 'DE60', 'CZ01', 'CZ02', 'PL84', 'PL91'],
    'DE40': ['DE30', 'CZ01', 'CZ02', 'CZ03', 'PL84', 'CH01'],
    'DE50': ['DE25', 'DE26', 'DE27', 'DE30', 'DE60', 'FRF1', 'FRF2', 'FRF3', 'LU00', 'BE31'],
    'DE60': ['DE30', 'DE50', 'FRF1', 'LU00'],
    'DE71': ['DE27', 'BE31', 'LU00', 'FRF3', 'FRD1', 'FRD2'],
    'DE72': ['DE71', 'FRF3'],
    'DE73': ['DE72', 'CH01'],
    'DE80': ['AT11', 'AT12', 'AT13', 'AT21', 'AT31'], // Genel Bavyera bölgesi komşulukları
    'DE91': ['DE92', 'CZ06', 'CZ07', 'CZ08', 'PL81'],
    'DE92': ['DE91', 'DE93', 'PL81', 'PL82', 'LT01', 'PL92', 'RU00'], // Kaliningrad ile RU00
    'DE93': ['DE92', 'DE94', 'PL82'],
    'DE94': ['DE93', 'CZ03', 'PL84'],
    'DEA1': ['DEA2', 'DEA3', 'DEB1', 'NL31', 'NL32'],
    'DEA2': ['DEA1', 'DEA3', 'DEB1'],
    'DEA3': ['DEA1', 'DEA2', 'DEB1', 'NL31'],
    'DEA4': ['DEA5', 'DEB2', 'LU00', 'FRC1'],
    'DEA5': ['DEA4', 'DEB2', 'FRC1', 'BE31'],
    'DEB1': ['DEB2', 'DEB3', 'LU00', 'FRC1'],
    'DEB2': ['DEB1', 'DEB3', 'LU00', 'FRC1'],
    'DEB3': ['DEB1', 'DEB2', 'FRC1', 'BE31', 'BE33', 'BE34'],
    'DEC0': ['DE40', 'PL91', 'PL92', 'CZ01'],
    'DED2': ['DED4', 'DED5', 'DED6'], // İç
    'DED4': ['DED2', 'DED5', 'DED6'],
    'DED5': ['DED2', 'DED4', 'DED6'],
    'DED6': ['DED2', 'DED4', 'DED5'],
    'DEG0': ['DE71', 'DE72', 'DE73', 'FRC2', 'CH01', 'ITG2'], // Baden-Württemberg

    // Danimarka Komşulukları
    'DK01': ['DK02', 'DE11', 'DE12'],
    'DK02': ['DK01', 'DK03', 'DE12', 'DE13'],
    'DK03': ['DK02', 'DK04'],
    'DK04': ['DK03', 'DK05'],
    'DK05': ['DK04', 'SE21', 'SE23'], // İsveç ile denizden veya karadan bağlılık

    // Estonya Komşulukları
    'EE00': ['LV00', 'RU00'],

    // İspanya Komşulukları
    'ES11': ['ES12', 'ES21', 'PT11', 'PT15'],
    'ES12': ['ES11', 'ES13', 'ES21', 'PT15', 'PT16'],
    'ES13': ['ES12', 'ES22', 'PT16'],
    'ES21': ['ES11', 'ES12', 'ES22', 'ES23', 'FRE2'], // FRE2 ile komşu
    'ES22': ['ES13', 'ES21', 'ES23', 'ES24', 'FRE2', 'FRF1'],
    'ES23': ['ES21', 'ES22', 'ES24', 'FRF1'],
    'ES24': ['ES22', 'ES23', 'ES30', 'FRF1'],
    'ES30': ['ES24', 'ES41', 'ES42', 'ES43', 'FRF2', 'FRF3'],
    'ES41': ['ES30', 'ES42', 'ES51'],
    'ES42': ['ES30', 'ES41', 'ES43', 'ES51', 'ES52', 'ES53'],
    'ES43': ['ES30', 'ES42', 'ES53'],
    'ES51': ['ES41', 'ES42', 'ES52', 'ES61'],
    'ES52': ['ES42', 'ES51', 'ES53', 'ES61', 'ES62', 'ES63'],
    'ES53': ['ES42', 'ES43', 'ES52', 'ES63', 'ES64'],
    'ES61': ['ES51', 'ES52', 'ES62', 'PT17'],
    'ES62': ['ES52', 'ES61', 'ES63', 'PT17'],
    'ES63': ['ES52', 'ES53', 'ES62', 'ES64', 'PT17', 'PT18'],
    'ES64': ['ES53', 'ES63', 'PT18'],
    'ES70': [], // Adalar

    // Finlandiya Komşulukları
    'FI19': ['FI1B', 'FI1C', 'NO08', 'SE33', 'RU00'],
    'FI1B': ['FI19', 'FI1C'],
    'FI1C': ['FI19', 'FI1B', 'FI20', 'RU00'],
    'FI20': ['FI1C', 'RU00'],

    // Fransa Komşulukları
    'FR10': ['FRB0', 'FRC1', 'BE10', 'UKD6', 'UKE1'], // UK ile deniz komşuluğu eklenmiştir
    'FRB0': ['FR10', 'FRC1', 'FRD1', 'BE21', 'BE31', 'DEB1', 'DEB2', 'DEB3', 'LU00', 'UKD6'], // UK ile deniz komşuluğu eklenmiştir
    'FRC1': ['FR10', 'FRB0', 'FRC2', 'FRD1', 'DEB1', 'DEB2', 'DEA4', 'DEA5'],
    'FRC2': ['FRC1', 'FRD1', 'FRD2', 'DEG0', 'CH01'],
    'FRD1': ['FRB0', 'FRC1', 'FRC2', 'FRD2', 'FRE1', 'DEG0', 'DE27', 'DE50', 'DE60', 'DE71'],
    'FRD2': ['FRD1', 'FRE1', 'FRE2', 'FRF1', 'FRF2', 'FRF3', 'DEG0', 'DE71'],
    'FRE1': ['FRD1', 'FRD2', 'FRE2', 'FRF1', 'FRF2'],
    'FRE2': ['FRD2', 'FRE1', 'FRF1', 'FRF2', 'ES21', 'ES22'],
    'FRF1': ['FRD2', 'FRE1', 'FRE2', 'FRF2', 'FRF3', 'ITG1', 'ITG2', 'ES22', 'ES23', 'ES24'],
    'FRF2': ['FRD2', 'FRE1', 'FRE2', 'FRF1', 'FRF3', 'ES30'],
    'FRF3': ['FRD2', 'FRF1', 'FRF2', 'ITF5', 'ES30'], // Korsika (deniz komşusu)

    // Yunanistan Komşulukları
    'EL30': ['EL41', 'EL42', 'MK00', 'AL00'],
    'EL41': ['EL30', 'EL42', 'EL43', 'BG33', 'BG34', 'MK00'],
    'EL42': ['EL30', 'EL41', 'EL51'],
    'EL43': ['EL41', 'EL51', 'EL52', 'TR10'],
    'EL51': ['EL42', 'EL43', 'EL52', 'EL53'],
    'EL52': ['EL43', 'EL51', 'EL53', 'EL54'],
    'EL53': ['EL51', 'EL52', 'EL54'],
    'EL54': ['EL52', 'EL53'],

    // Hırvatistan Komşulukları
    'HR03': ['HR04', 'SI03', 'SI04', 'HU31', 'BA01', 'RS11'],
    'HR04': ['HR03', 'HU31', 'BA01', 'BA02', 'ME00', 'RS11'],

    // Macaristan Komşulukları
    'HU10': ['HU21', 'HU22', 'AT22', 'SK01'],
    'HU21': ['HU10', 'HU22', 'HU23', 'SK02', 'RO11'],
    'HU22': ['HU10', 'HU21', 'HU23', 'AT22', 'RO11', 'RS11'],
    'HU23': ['HU21', 'HU22', 'SK02', 'RO12'],
    'HU31': ['HU32', 'HR03', 'HR04', 'RS11', 'RS12'],
    'HU32': ['HU31', 'HU33', 'RS22', 'RO12'],
    'HU33': ['HU32', 'UA30', 'RO12'],

    // İzlanda Komşulukları
    'IS00': [],

    // İrlanda Komşulukları
    'IE04': ['IE05', 'UKN0'],
    'IE05': ['IE04', 'IE06'],
    'IE06': ['IE05'],

    // İtalya Komşulukları
    'ITC1': ['ITC2', 'ITD1', 'FRF1', 'CH01', 'AT31'],
    'ITC2': ['ITC1', 'ITC3', 'ITD1', 'ITD2'],
    'ITC3': ['ITC2', 'ITC4', 'ITD2', 'ITD3'],
    'ITC4': ['ITC3', 'ITC5', 'ITD3', 'ITD4', 'SI03'],
    'ITC5': ['ITC4', 'ITD4', 'SI03'],
    'ITD1': ['ITC1', 'ITC2', 'ITD2', 'ITF1', 'FRF3'],
    'ITD2': ['ITC2', 'ITC3', 'ITD1', 'ITD3', 'ITF1', 'ITF2'],
    'ITD3': ['ITC3', 'ITC4', 'ITD2', 'ITD4', 'ITF2', 'ITF3'],
    'ITD4': ['ITC4', 'ITC5', 'ITD3', 'AT21', 'AT31', 'SI03', 'SI04'],
    'ITE1': ['ITE2', 'ITE3', 'ITF1', 'ITF2', 'ITG1'],
    'ITE2': ['ITE1', 'ITE3', 'ITF1', 'ITF2', 'ITF3', 'ITG1'],
    'ITE3': ['ITE1', 'ITE2', 'ITE4', 'ITF3', 'ITF4'],
    'ITE4': ['ITE3', 'ITF4', 'ITF5'],
    'ITF1': ['ITD1', 'ITD2', 'ITE1', 'ITE2', 'ITF2'],
    'ITF2': ['ITD2', 'ITD3', 'ITE1', 'ITE2', 'ITE3', 'ITF1', 'ITF3'],
    'ITF3': ['ITD3', 'ITE2', 'ITE3', 'ITE4', 'ITF2', 'ITF4', 'FRF3', 'SI04'],
    'ITF4': ['ITE3', 'ITE4', 'ITF3', 'ITF5', 'FRF3'],
    'ITF5': ['ITE4', 'ITF4', 'FRF3'], // Korsika (deniz komşusu)
    'ITG1': ['ITG2', 'ITE1', 'ITE2', 'CH01', 'CH02', 'CH04', 'CH06', 'CH07'],
    'ITG2': ['ITG1', 'CH01', 'CH02', 'CH04', 'CH06', 'CH07', 'AT31', 'SI03', 'SI04'],

    // Letonya Komşulukları
    'LV00': ['EE00', 'LT01', 'BY00', 'RU00'],

    // Litvanya Komşulukları
    'LT01': ['LT02', 'LV00', 'BY00', 'PL92', 'RU00'],
    'LT02': ['LT01', 'PL92', 'RU00'], // Kaliningrad bölgesi ile RU00 komşu varsayıldı

    // Lüksemburg Komşulukları
    'LU00': ['BE21', 'BE31', 'FRB0', 'FRC1', 'DEB1', 'DEB2', 'DE60', 'DE27'],

    // Karadağ Komşulukları
    'ME00': ['BA01', 'BA02', 'RS22', 'AL00'],

    // Malta Komşulukları
    'MT00': [],

    // Kuzey Makedonya Komşulukları
    'MK00': ['AL00', 'EL41', 'BG33', 'BG42', 'RS22'],

    // Hollanda Komşulukları
    'NL11': ['NL12', 'BE10', 'DE11'],
    'NL12': ['NL11', 'NL13', 'DE11', 'DE12'],
    'NL13': ['NL12', 'NL21', 'NL22', 'DE12', 'DE13', 'BE21', 'BE22', 'BE23', 'UKD1', 'UKD6'], // UK ile deniz komşuluğu eklenmiştir
    'NL21': ['NL13', 'NL22', 'BE10', 'DE25'],
    'NL22': ['NL13', 'NL21', 'NL23', 'DE25'],
    'NL23': ['NL22', 'DE25', 'DE26'],
    'NL31': ['NL32', 'NL33', 'DEA1', 'DEA2', 'DEA3'],
    'NL32': ['NL31', 'NL33', 'DEA1', 'DEA2', 'DEA3'],
    'NL33': ['NL31', 'NL32', 'NL34', 'DEA1'],
    'NL34': ['NL33', 'DEA1'],

    // Norveç Komşulukları
    'NO01': ['NO02', 'SE11', 'SE12'],
    'NO02': ['NO01', 'NO03', 'SE11', 'SE12', 'SE21'],
    'NO03': ['NO02', 'NO04', 'SE21', 'SE22'],
    'NO04': ['NO03', 'NO05', 'SE22', 'SE23'],
    'NO05': ['NO04', 'NO06', 'SE23', 'SE31'],
    'NO06': ['NO05', 'NO07', 'SE31', 'SE32'],
    'NO07': ['NO06', 'NO08', 'SE32', 'SE33'],
    'NO08': ['NO07', 'SE33', 'FI19'],

    // Polonya Komşulukları
    'PL21': ['PL22', 'DE14', 'DE27', 'CZ03', 'PL41'],
    'PL22': ['PL21', 'PL41', 'PL42', 'DE27'],
    'PL41': ['PL21', 'PL22', 'PL42', 'PL43', 'PL51', 'BY00', 'UA30'],
    'PL42': ['PL41', 'PL43', 'PL52', 'PL61', 'PL62', 'UA30'],
    'PL43': ['PL41', 'PL42', 'PL52', 'PL61', 'UA30'],
    'PL51': ['PL41', 'PL52', 'PL61', 'PL71', 'PL81', 'CZ03'],
    'PL52': ['PL42', 'PL43', 'PL51', 'PL61', 'PL62', 'PL72', 'PL81', 'CZ03'],
    'PL61': ['PL42', 'PL43', 'PL51', 'PL52', 'PL62', 'PL71', 'UA30'],
    'PL62': ['PL42', 'PL52', 'PL61', 'PL63', 'PL72', 'UA30'],
    'PL63': ['PL62', 'UA30', 'UA40', 'BY00'],
    'PL71': ['PL51', 'PL61', 'PL72', 'PL81', 'PL82', 'CZ03'],
    'PL72': ['PL52', 'PL62', 'PL71', 'PL82', 'PL84', 'CZ04'],
    'PL81': ['PL51', 'PL52', 'PL71', 'PL72', 'PL82', 'CZ06', 'CZ07'],
    'PL82': ['PL52', 'PL71', 'PL72', 'PL81', 'PL84', 'CZ03', 'CZ04'],
    'PL84': ['PL72', 'PL82', 'CZ03', 'CZ04', 'SK04'],
    'PL91': ['PL92', 'DE91', 'DE92', 'DE93', 'CZ01'],
    'PL92': ['PL91', 'DE14', 'DE21', 'DE92', 'DE93', 'LT01', 'LT02', 'BY00', 'RU00'],

    // Portekiz Komşulukları
    'PT11': ['PT15', 'ES11', 'ES12'],
    'PT15': ['PT11', 'PT16', 'ES11', 'ES12'],
    'PT16': ['PT15', 'PT17', 'ES12', 'ES13', 'ES21'],
    'PT17': ['PT16', 'PT18', 'PT20', 'ES61', 'ES62', 'ES63'],
    'PT18': ['PT17', 'PT20', 'ES63', 'ES64'],
    'PT20': ['PT17', 'PT18', 'ES61'], // Madeira - denizaşırı
    'PT30': [], // Azorlar - denizaşırı

    // Romanya Komşulukları
    'RO11': ['RO12', 'HU21', 'HU22', 'UA30', 'MD00'],
    'RO12': ['RO11', 'HU23', 'HU32', 'HU33', 'MD00', 'UA30', 'UA40'],
    'RO21': ['RO22', 'RO31', 'BG31', 'RS12'],
    'RO22': ['RO21', 'RO31', 'RO32', 'BG31'],
    'RO31': ['RO21', 'RO22', 'RO32', 'RO41', 'RO42', 'BG31'],
    'RO32': ['RO22', 'RO31', 'RO41', 'RO42', 'BG31', 'BG32'],
    'RO41': ['RO31', 'RO32', 'RO42', 'MD00', 'UA40', 'UA50'],
    'RO42': ['RO31', 'RO32', 'RO41', 'BG31', 'BG32', 'MD00', 'UA50'],

    // Sırbistan Komşulukları
    'RS11': ['RS12', 'RS21', 'HR03', 'HR04', 'HU22', 'HU31', 'BA01', 'BA02', 'ME00', 'MK00'],
    'RS12': ['RS11', 'BG31', 'BG42', 'RO21', 'HU31'],
    'RS21': ['RS11', 'RS22', 'BG41', 'MK00'],
    'RS22': ['RS11', 'RS21', 'HU32', 'BA02', 'ME00', 'MK00'],

    // Slovakya Komşulukları
    'SK01': ['SK02', 'HU10', 'AT22', 'CZ05', 'PL84'],
    'SK02': ['SK01', 'SK03', 'HU21', 'HU22', 'HU23', 'PL84'],
    'SK03': ['SK02', 'SK04', 'PL84', 'UA30'],
    'SK04': ['SK03', 'CZ04', 'CZ05', 'PL84', 'UA30', 'HU33'],

    // Slovenya Komşulukları
    'SI03': ['SI04', 'HR03', 'AT21', 'AT31', 'ITC4', 'ITC5', 'ITG2'],
    'SI04': ['SI03', 'HR03', 'ITD4', 'ITF3'],

    // İsveç Komşulukları
    'SE11': ['SE12', 'NO01', 'NO02'],
    'SE12': ['SE11', 'SE21', 'NO01', 'NO02'],
    'SE21': ['SE12', 'SE22', 'NO02', 'NO03', 'DK05'],
    'SE22': ['SE21', 'SE23', 'NO03', 'NO04'],
    'SE23': ['SE22', 'SE31', 'NO04', 'NO05', 'DK05'],
    'SE31': ['SE23', 'SE32', 'NO05', 'NO06'],
    'SE32': ['SE31', 'SE33', 'NO06', 'NO07'],
    'SE33': ['SE32', 'NO07', 'NO08', 'FI19'],

    // YENİ EKLENEN: Birleşik Krallık NUTS2 komşulukları
    // Bu komşuluklar varsayımsaldır ve gerçek coğrafi haritanıza göre ayarlanmalıdır.
    // Özellikle kıta Avrupası'ndaki ülkelerle olan deniz komşulukları önemlidir.
    'UKC1': ['UKC2', 'UKD1'],
    'UKC2': ['UKC1', 'UKD1', 'UKD3'],
    'UKD1': ['UKC1', 'UKC2', 'UKD3', 'UKD4', 'UKD6', 'NL13', 'BE10'], // Hollanda ve Belçika ile deniz komşuluğu
    'UKD3': ['UKC2', 'UKD1', 'UKD4', 'UKD6'],
    'UKD4': ['UKD1', 'UKD3', 'UKD6', 'UKD7'],
    'UKD6': ['UKD1', 'UKD3', 'UKD4', 'UKD7', 'UKE1', 'FR10', 'FRB0', 'NL13'], // Fransa ile deniz komşuluğu, NL, BE
    'UKD7': ['UKD4', 'UKD6', 'UKE1', 'UKE2'],
    'UKE1': ['UKD6', 'UKD7', 'UKE2', 'UKE3', 'UKF1', 'FR10'], // Fransa ile deniz komşuluğu
    'UKE2': ['UKD7', 'UKE1', 'UKE3', 'UKE4'],
    'UKE3': ['UKE1', 'UKE2', 'UKE4', 'UKF1', 'UKF2'],
    'UKE4': ['UKE2', 'UKE3', 'UKF2', 'UKF3'],
    'UKF1': ['UKE1', 'UKE3', 'UKF2', 'UKG1'],
    'UKF2': ['UKE3', 'UKE4', 'UKF1', 'UKF3', 'UKG1', 'UKG2'],
    'UKF3': ['UKE4', 'UKF2', 'UKG2', 'UKG3'],
    'UKG1': ['UKF1', 'UKF2', 'UKG2', 'UKH1'],
    'UKG2': ['UKF2', 'UKF3', 'UKG1', 'UKG3', 'UKH1', 'UKH2'],
    'UKG3': ['UKF3', 'UKG2', 'UKH2', 'UKH3'],
    'UKH1': ['UKG1', 'UKG2', 'UKH2', 'UKI1'],
    'UKH2': ['UKG2', 'UKG3', 'UKH1', 'UKH3', 'UKI1', 'UKI2'],
    'UKH3': ['UKG3', 'UKH2', 'UKI2'],
    'UKI1': ['UKH1', 'UKH2', 'UKI2', 'UKJ1', 'UKJ2'],
    'UKI2': ['UKH2', 'UKH3', 'UKI1', 'UKJ2', 'UKJ3', 'UKJ4'],
    'UKJ1': ['UKI1', 'UKJ2', 'UKK1'],
    'UKJ2': ['UKI1', 'UKI2', 'UKJ1', 'UKJ3', 'UKK1', 'UKK2'],
    'UKJ3': ['UKI2', 'UKJ2', 'UKJ4', 'UKK2', 'UKK3'],
    'UKJ4': ['UKI2', 'UKJ3', 'UKK3', 'UKK4'],
    'UKK1': ['UKJ1', 'UKJ2', 'UKK2', 'UKL1'],
    'UKK2': ['UKJ2', 'UKJ3', 'UKK1', 'UKK3', 'UKL1', 'UKL2'],
    'UKK3': ['UKJ3', 'UKJ4', 'UKK2', 'UKK4', 'UKL2', 'UKM2'],
    'UKK4': ['UKJ4', 'UKK3', 'UKM2', 'UKM3'],
    'UKL1': ['UKK1', 'UKK2', 'UKL2', 'UKM2'],
    'UKL2': ['UKK2', 'UKK3', 'UKL1', 'UKM2', 'UKM3', 'UKM5'],
    'UKM2': ['UKK3', 'UKK4', 'UKL1', 'UKL2', 'UKM3', 'UKM5', 'UKM6'],
    'UKM3': ['UKK4', 'UKM2', 'UKM5', 'UKM6'],
    'UKM5': ['UKL2', 'UKM2', 'UKM3', 'UKM6'],
    'UKM6': ['UKM2', 'UKM3', 'UKM5'],
    'UKN0': ['IE04'], // Kuzey İrlanda'nın İrlanda ile tek komşusu

    // Bosna-Hersek Komşulukları
    'BA01': ['BA02', 'HR03', 'HR04', 'RS11', 'ME00'],
    'BA02': ['BA01', 'HR04', 'ME00', 'RS11', 'RS22'],

    // Kuzey Makedonya Komşulukları
    'MK00': ['AL00', 'EL30', 'EL41', 'BG33', 'BG42', 'RS11', 'RS21', 'RS22'],

    // Eklenen diğer ülkeler ve varsayımsal komşulukları
    'AL00': ['EL30', 'EL41', 'MK00', 'ME00'],
    'MD00': ['RO11', 'RO12', 'RO41', 'RO42', 'UA30', 'UA40'],
    'UA30': ['UA40', 'MD00', 'RO11', 'HU33', 'SK03', 'SK04', 'PL41', 'PL42', 'PL43', 'PL61', 'PL62', 'PL63', 'BY00', 'RU00'],
    'UA40': ['UA30', 'UA50', 'MD00', 'RO11', 'RO12'],
    'UA50': ['UA40', 'RO41', 'RO42', 'RU00'],
    'BY00': ['LT01', 'LV00', 'PL41', 'PL63', 'PL92', 'UA30', 'RU00'],
    'RU00': ['EE00', 'LV00', 'LT01', 'LT02', 'FI19', 'FI1C', 'FI20', 'NO08', 'BY00', 'UA30', 'UA50', 'PL92'],
};

// ============================================================================
// Yardımcı Fonksiyonlar
// ============================================================================

function addNotification(message) {
    const listItem = document.createElement('li');
    listItem.textContent = message;
    notificationsList.prepend(listItem); // En yeni üste gelsin
    if (notificationsList.children.length > 10) { // Çok fazla birikmesin
        notificationsList.removeChild(notificationsList.lastChild);
    }
}

function updateUI() {
    turnCounter.textContent = currentTurn;
    
    // Oyuncu ülkesinin hala var olup olmadığını kontrol et
    if (countriesData[playerCountryId]) {
        playerCoinElement.textContent = countriesData[playerCountryId].coins;
        playerUnitsReadyElement.textContent = countriesData[playerCountryId].unitsReady || 0;
        playerCountryNameElement.textContent = playerCountryName;
        buyUnitButton.disabled = countriesData[playerCountryId].coins < UNIT_COST;
    } else {
        // Oyuncu elendiyse UI'ı devre dışı bırak
        playerCoinElement.textContent = 'N/A';
        playerUnitsReadyElement.textContent = 'N/A';
        playerCountryNameElement.textContent = 'Elendiniz';
        buyUnitButton.disabled = true;
        declareWarButton.disabled = true;
        nextTurnButton.disabled = true;
    }

    updateTargetCountrySelect();
    renderUnitCounts(); // Her UI güncellemesinde birim sayılarını yeniden çiz
}

function renderUnitCounts() {
    if (!svgDoc || !unitCountsOverlay) {
        console.warn("renderUnitCounts: SVG dökümanı veya overlay elementi hazır değil.");
        return;
    }

    unitCountsOverlay.innerHTML = ''; // Mevcut sayıları temizle

    // Harita SVG'sini kapsayan container'ın boyutlarını al
    const mapContainerRect = mapContainer.getBoundingClientRect();

    // SVG'nin kendisinin `viewBox` değerlerini al
    const svgViewBox = svgDoc.rootElement.viewBox.baseVal;
    const svgWidthInViewBox = svgViewBox.width;
    const svgHeightInViewBox = svgViewBox.height;

    for (const countryId in countriesData) {
        if (countriesData.hasOwnProperty(countryId)) {
            const country = countriesData[countryId];
            if (country.nuts2 && country.regions) { // regions objesi olduğundan emin ol
                country.nuts2.forEach(nutsId => {
                    const regionPath = svgDoc.querySelector(`path[data-nuts-id="${nutsId}"]`) || svgDoc.querySelector(`path#${nutsId}`);
                    if (regionPath) {
                        const region = country.regions[nutsId];
                        if (region && region.units > 0) {
                            try {
                                // getBBox() çağırmadan önce path'in görüntüde olduğundan emin ol
                                if (regionPath.getBBox) {
                                    const bbox = regionPath.getBBox(); // SVG elementinin bounding box'ı (SVG koordinat sisteminde)

                                    // Bölgenin merkezini hesapla (SVG koordinat sisteminde)
                                    const centerX = bbox.x + bbox.width / 2;
                                    const centerY = bbox.y + bbox.height / 2;

                                    // SVG koordinat sisteminden, HTML / CSS (pixel) koordinat sistemine dönüştürme
                                    // Bu dönüşüm, SVG'nin viewBox'ına ve harita container'ının gerçek boyutlarına göre ölçeklenir.
                                    const overlayX = (centerX / svgWidthInViewBox) * mapContainerRect.width;
                                    const overlayY = (centerY / svgHeightInViewBox) * mapContainerRect.height;

                                    const unitCountDiv = document.createElement('div');
                                    unitCountDiv.className = 'unit-count';
                                    unitCountDiv.textContent = region.units;
                                    unitCountDiv.style.left = `${overlayX}px`;
                                    unitCountDiv.style.top = `${overlayY}px`;
                                    unitCountDiv.style.transform = 'translate(-50%, -50%)'; // Metni merkeze hizala

                                    unitCountsOverlay.appendChild(unitCountDiv);
                                } else {
                                    console.warn(`RegionPath ${nutsId} does not support getBBox.`);
                                }
                            } catch (e) {
                                console.error(`Birim sayısı render edilirken hata oluştu (${nutsId}):`, e);
                            }
                        }
                    } else {
                        // console.warn(`Haritada bulunamayan NUTS ID: ${nutsId} (Birim Sayısı render edilirken) - Lütfen SVG ve script.js'teki ID'leri eşleştirin.`);
                    }
                });
            }
        }
    }
}


function getCountryIdFromNutsId(nutsId) {
    for (const countryId in countriesData) {
        if (countriesData[countryId].nuts2 && countriesData[countryId].nuts2.includes(nutsId)) {
            return countryId;
        }
    }
    return null;
}

// ============================================================================
// Oyun Akışı Fonksiyonları
// ============================================================================

function initializeGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Lütfen adınızı girin!");
        return;
    }
    startScreen.style.display = 'none';
    countrySelectionModal.style.display = 'flex';
    populateCountrySelectionModal();
}

function populateCountrySelectionModal() {
    countryListDiv.innerHTML = '';
    for (const countryId in countriesData) {
        const country = countriesData[countryId];
        // Sadece nuts2 bölgeleri olan ülkeleri listele
        if (country.nuts2 && country.nuts2.length > 0) {
            const countryOption = document.createElement('div');
            countryOption.classList.add('country-option');
            countryOption.textContent = country.name;
            countryOption.dataset.countryId = countryId;
            countryOption.style.backgroundColor = country.color;
            countryOption.style.color = getContrastColor(country.color); // Metin rengini ayarla

            countryOption.addEventListener('click', () => {
                document.querySelectorAll('.country-option').forEach(opt => opt.classList.remove('selected'));
                countryOption.classList.add('selected');
                playerCountryId = countryId;
                playerCountryName = country.name;
            });
            countryListDiv.appendChild(countryOption);
        }
    }
}

function getContrastColor(hexcolor) {
    if (!hexcolor || hexcolor.length < 7) return '#000000'; // Geçersiz renk
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const y = (r * 299 + g * 587 + b * 114) / 1000;
    return (y >= 128) ? '#000000' : '#FFFFFF';
}

function startGame() {
    if (!playerCountryId) {
        alert("Lütfen bir ülke seçin!");
        return;
    }

    countrySelectionModal.style.display = 'none';
    gameScreen.style.display = 'grid'; // Grid display'e geç

    welcomeMessage.textContent = `${playerName}, ${playerCountryName} ülkesine hoş geldiniz!`;
    countriesData[playerCountryId].isPlayer = true;
    countriesData[playerCountryId].coins = INITIAL_PLAYER_COINS; // Oyuncuya başlangıç coini ver

    loadMapAndInitializeRegions(); // Haritayı yükle ve bölgeleri hazırla
}

function loadMapAndInitializeRegions() {
    // gameMapSVG'nin yüklendiğinden emin olun
    if (gameMapSVG.contentDocument) {
        svgDoc = gameMapSVG.contentDocument;
        console.log("SVG Yüklendi! SVG Document:", svgDoc);
        initializeRegions();
    } else {
        gameMapSVG.addEventListener('load', () => {
            svgDoc = gameMapSVG.contentDocument;
            if (svgDoc) { // Event listener tetiklendiğinde de kontrol et
                console.log("SVG Yüklendi (Event Listener)! SVG Document:", svgDoc);
                initializeRegions();
            } else {
                console.error("SVG dökümanına event listener ile erişilemiyor. Dosya yolu veya içeriği sorunlu olabilir.");
            }
        });
        // Eğer SVG zaten yüklüyse (readyState kontrolü güvenilir olmayabilir, ama bir şans verelim)
        // Bu kısım, bazı tarayıcılarda `load` event'inin beklenen şekilde tetiklenmeyebileceği durumlar içindir.
        if (gameMapSVG.contentDocument && !svgDoc) { // SVG zaten yüklü ama `svgDoc` hala null ise
            svgDoc = gameMapSVG.contentDocument;
            console.log("SVG Yüklendi (Immediate Check)! SVG Document:", svgDoc);
            initializeRegions();
        } else if (!gameMapSVG.contentDocument && (gameMapSVG.readyState === "complete" || gameMapSVG.readyState === "interactive")) {
             // Eğer hala contentDocument yoksa ve doküman hazırsa, bir gecikme ile tekrar dene
             setTimeout(() => {
                if (gameMapSVG.contentDocument && !svgDoc) {
                    svgDoc = gameMapSVG.contentDocument;
                    console.log("SVG Yüklendi (Fallback Timeout)! SVG Document:", svgDoc);
                    initializeRegions();
                } else if (!svgDoc) {
                    console.error("SVG dökümanına hala erişilemiyor. Lütfen gameMap.svg dosyasının doğru yolu ve içeriği olduğundan emin olun.");
                }
            }, 500); // 500ms gecikme
        }
    }
}

function initializeRegions() {
    // Tüm NUTS ID'lerini konsola yazdır (SVG'nizdeki ID'leri görmek için)
    console.log("SVG'den bulunan tüm NUTS ID'leri:");
    const svgNutsIds = new Set();
    svgDoc.querySelectorAll('path').forEach(path => {
        const nutsId = path.getAttribute('data-nuts-id');
        if (nutsId) {
            svgNutsIds.add(nutsId);
            // console.log(nutsId); // Hata ayıklama için her birini de yazdır
        }
    });
    console.log("Toplam SVG NUTS ID sayısı:", svgNutsIds.size);

    // Her ülkeye başlangıç birimleri ata ve bölgeleri haritada renklendir
    for (const countryId in countriesData) {
        const country = countriesData.hasOwnProperty(countryId) ? countriesData[countryId] : null; // Burayı düzelttim: countriesData[countryId] olmalı
        if (country) {
            country.regions = {}; // Her ülkenin sahip olduğu bölgeleri tutacak obje

            if (country.nuts2 && country.nuts2.length > 0) {
                country.nuts2.forEach(nutsId => {
                    // Hem ID hem de data-nuts-id ile aramayı dene
                    let regionPath = svgDoc.querySelector(`path#${nutsId}`); 
                    if (!regionPath) {
                        regionPath = svgDoc.querySelector(`path[data-nuts-id="${nutsId}"]`); 
                    }
                    
                    if (regionPath && regionPath.style) {
                        // Rengi ayarla ve !important ile diğer CSS kurallarını geçersiz kıl
                        regionPath.style.setProperty('fill', country.color, 'important');
                        country.regions[nutsId] = { units: STARTING_UNITS_PER_REGION }; // Her bölgeye başlangıç birimi

                        // Bölgeye tıklama olayını ekle
                        regionPath.addEventListener('click', () => onRegionClick(nutsId));
                    } else {
                        console.warn(`Haritada bulunamayan NUTS ID: ${nutsId} (Ülke: ${country.name}) - Lütfen SVG ve script.js'teki ID'leri eşleştirin.`);
                    }
                });
            } else {
                console.warn(`Ülke ${country.name} için tanımlı NUTS2 bölgesi bulunamadı veya boş. Bu ülke oyuna dahil edilmeyecek.`);
            }
        }
    }

    updateUI(); // Başlangıç UI güncellemesi (birim sayıları da burada render edilecek)
    addNotification("Oyun başladı! Birim satın alıp ülkenizi güçlendirin.");
}


function onRegionClick(nutsId) {
    const clickedRegionPath = svgDoc.querySelector(`path[data-nuts-id="${nutsId}"]`) || svgDoc.querySelector(`path#${nutsId}`);
    const regionCountryId = getCountryIdFromNutsId(nutsId);

    if (!clickedRegionPath || !regionCountryId) {
        addNotification(`Hata: Tıklanan bölge (${nutsId}) haritada bulunamadı veya bir ülkeye ait değil.`);
        return;
    }

    // Birim yerleştirme aşaması
    if (countriesData[playerCountryId].unitsReady > 0) {
        if (regionCountryId === playerCountryId) {
            if (!countriesData[playerCountryId].regions[nutsId]) {
                countriesData[playerCountryId].regions[nutsId] = { units: 0 };
            }
            countriesData[playerCountryId].regions[nutsId].units++;
            countriesData[playerCountryId].unitsReady--;
            addNotification(`${nutsId} bölgesine 1 birim yerleştirildi. Kalan hazır birim: ${countriesData[playerCountryId].unitsReady}`);
            updateUI();
        } else {
            addNotification("Birimleri sadece kendi bölgelerinize yerleştirebilirsiniz.");
        }
        return;
    }

    // Saldırı modu
    if (currentAttackMode && targetCountryIdForWar) {
        // Eğer tıklanan bölge, kendi bölgemiz ise (saldırı başlangıcı için)
        if (regionCountryId === playerCountryId) {
            if (countriesData[playerCountryId].regions[nutsId] && countriesData[playerCountryId].regions[nutsId].units > 0) {
                // Önceki parlamaları kaldır
                clearHighlights();

                // Yeni saldıran bölgeyi ayarla
                selectedAttackingRegionNutsId = nutsId;
                
                // Komşu düşman bölgeleri parlat
                highlightEnemyNeighbors(nutsId, targetCountryIdForWar);
                addNotification(`${nutsId} bölgesinden saldırı başlatmak için hazır. Hedef ülkeye ait parlayan bir komşu bölgeye tıklayın.`);
            } else {
                addNotification("Saldırmak için seçtiğiniz bölgede birimleriniz olmalı.");
            }
        } else if (regionCountryId === targetCountryIdForWar && selectedAttackingRegionNutsId) {
            // Eğer tıklanan bölge hedef ülkeye ait ve seçili saldırı bölgesine komşu ise
            const neighborsOfAttacker = nutsNeighbors[selectedAttackingRegionNutsId] || [];
            if (!neighborsOfAttacker.includes(nutsId)) {
                addNotification("Seçtiğiniz düşman bölgesi, saldırı başlattığınız bölgeye komşu değil.");
                return;
            }

            const defendingRegionNutsId = nutsId;
            const attackingCountry = countriesData[playerCountryId];
            const defendingCountry = countriesData[targetCountryIdForWar];

            const attackingUnits = attackingCountry.regions[selectedAttackingRegionNutsId].units;
            const defendingUnits = defendingCountry.regions[defendingRegionNutsId] ? defendingCountry.regions[defendingRegionNutsId].units : 0;

            if (attackingUnits === 0) {
                addNotification("Saldırmak için seçtiğiniz bölgede birim kalmadı!");
                resetAttackMode();
                return;
            }
            
            // Show war modal instead of directly resolving combat
            showWarModal(selectedAttackingRegionNutsId, defendingRegionNutsId, attackingUnits, defendingUnits);

        } else {
            addNotification("Lütfen birim yerleştirmek için kendi bölgelerinize, saldırı için ise parlayan düşman bölgelerine tıklayın.");
        }
    } else {
        // Normal modda bölgeye tıklama
        if (regionCountryId === playerCountryId) {
            const regionUnits = countriesData[playerCountryId].regions[nutsId] ? countriesData[playerCountryId].regions[nutsId].units : 0;
            addNotification(`Kendi bölgeniz: ${nutsId}. Birim sayısı: ${regionUnits}.`);
        } else { // Eğer tıklanan bölge kendi ülkemize ait değilse
            const regionUnits = countriesData[regionCountryId].regions[nutsId] ? countriesData[regionCountryId].regions[nutsId].units : 0;
            addNotification(`Düşman bölgesi: ${nutsId} (${countriesData[regionCountryId].name}). Birim sayısı: ${regionUnits}.`);
        }
    }
}

function resetAttackMode() {
    currentAttackMode = false;
    selectedAttackingRegionNutsId = null;
    targetCountryIdForWar = null;
    clearHighlights(); // Parlamaları kaldır
}

function clearHighlights() {
    svgDoc.querySelectorAll('.highlight-target').forEach(path => {
        path.classList.remove('highlight-target');
        path.style.stroke = ''; // Sınır rengini sıfırla
        path.style.strokeWidth = ''; // Sınır kalınlığını sıfırla
    });
    svgDoc.querySelectorAll('.active-attack-origin').forEach(path => { // Saldıran bölgenin de vurgusunu kaldır
        path.classList.remove('active-attack-origin');
        path.style.stroke = '';
        path.style.strokeWidth = '';
    });
}

function highlightEnemyNeighbors(playerNutsId, enemyCountryId) {
    const neighbors = nutsNeighbors[playerNutsId];
    if (neighbors) {
        neighbors.forEach(neighborNutsId => {
            const neighborCountryId = getCountryIdFromNutsId(neighborNutsId);
            // Sadece komşu olan ve savaş ilan edilen ülkeye ait olan bölgeleri parlat
            if (neighborCountryId === enemyCountryId) {
                const neighborPath = svgDoc.querySelector(`path[data-nuts-id="${neighborNutsId}"]`) || svgDoc.querySelector(`path#${neighborNutsId}`);
                if (neighborPath) {
                    neighborPath.classList.add('highlight-target'); // CSS ile kenarlık verilecek
                }
            }
        });
    }
    // Saldıran bölgeyi de özel olarak vurgula
    const attackingRegionPath = svgDoc.querySelector(`path[data-nuts-id="${playerNutsId}"]`) || svgDoc.querySelector(`path#${playerNutsId}`);
    if (attackingRegionPath) {
        attackingRegionPath.classList.add('active-attack-origin'); // CSS ile farklı kenarlık verilecek
    }
}


function buyUnit() {
    const player = countriesData[playerCountryId];
    if (!player) {
        addNotification("Hata: Oyuncu ülkesi bulunamadı.");
        return;
    }

    if (player.coins >= UNIT_COST) {
        player.coins -= UNIT_COST;
        player.unitsReady = (player.unitsReady || 0) + 1;
        addNotification(`1 birim satın alındı. Kalan coin: ${player.coins}.`);
        addNotification("Lütfen birim yerleştirmek istediğiniz bir bölgeye tıklayın. (Sadece kendi bölgeleriniz)");
    } else {
        addNotification("Yeterli coininiz yok!");
    }
    updateUI();
}

function declareWar() {
    targetCountryIdForWar = targetCountrySelect.value;
    if (!targetCountryIdForWar || targetCountryIdForWar === 'none') {
        addNotification("Lütfen savaş ilan etmek için bir ülke seçin.");
        return;
    }

    if (targetCountryIdForWar === playerCountryId) {
        addNotification("Kendinize savaş ilan edemezsiniz!");
        return;
    }

    const targetCountry = countriesData[targetCountryIdForWar];
    if (!targetCountry || !targetCountry.nuts2 || targetCountry.nuts2.length === 0) {
        addNotification(`${targetCountry ? targetCountry.name : "Seçilen ülke"} oyun dışı veya toprağı yok.`);
        return;
    }

    addNotification(`${targetCountry.name} ülkesine savaş ilan edildi!`);
    addNotification(`Saldırı başlatmak için, kendi birimli bölgelerinizden birine tıklayın. Sonra düşman bölgesini seçin.`);
    currentAttackMode = true; // Saldırı modunu aktif et
    selectedAttackingRegionNutsId = null; // Saldıracak bölgeyi sıfırla
    clearHighlights(); // Önceki vurguları temizle
    
    updateUI();
}


function resolveCombat(
    attackingCountryId, attackingRegionNutsId, attackingUnits,
    defendingCountryId, defendingRegionNutsId, defendingUnits
) {
    const attackingCountry = countriesData[attackingCountryId];
    const defendingCountry = countriesData[defendingCountryId];

    if (!attackingCountry || !defendingCountry || !attackingCountry.regions[attackingRegionNutsId]) {
        addNotification("Savaş için gerekli bölgeler veya ülkeler bulunamadı. Hata!");
        return;
    }
    
    // Savunan bölge objesini oluştur (eğer yoksa, birimleri 0 olacak)
    if (!defendingCountry.regions[defendingRegionNutsId]) {
        defendingCountry.regions[defendingRegionNutsId] = { units: 0 };
    }

    addNotification(`Savaş: ${attackingCountry.name}'nin ${attackingRegionNutsId} (${attackingUnits} birim) vs ${defendingCountry.name}'nin ${defendingRegionNutsId} (${defendingUnits} birim)`);

    let attackerLosses = 0;
    let defenderLosses = 0;

    // Basit savaş mantığı: saldıranın birimi fazlaysa veya düşmanın birimi yoksa fetheder
    if (attackingUnits > defendingUnits || defendingUnits === 0) {
        // Saldıran kazandı
        addNotification(`${attackingCountry.name} savaşı kazandı ve ${defendingRegionNutsId} bölgesini fethetti!`);
        
        // Kayıplar
        attackerLosses = Math.min(attackingUnits, Math.floor(defendingUnits * 0.5)); // Kazananın kaybı
        
        attackingCountry.regions[attackingRegionNutsId].units -= attackerLosses;
        if (attackingCountry.regions[attackingRegionNutsId].units < 0) {
            attackingCountry.regions[attackingRegionNutsId].units = 0;
        }

        // Fethettiği bölgeyi kendi ülkesine dahil et
        const conqueredRegionPath = svgDoc.querySelector(`path[data-nuts-id="${defendingRegionNutsId}"]`) || svgDoc.querySelector(`path#${defendingRegionNutsId}`);
        if (conqueredRegionPath) {
            // Eski sahibinden bölgeyi çıkar
            defendingCountry.nuts2 = defendingCountry.nuts2.filter(id => id !== defendingRegionNutsId);
            delete defendingCountry.regions[defendingRegionNutsId];

            // Saldıran ülkeye bölgeyi ekle
            attackingCountry.nuts2.push(defendingRegionNutsId);
            
            // Fethedilen bölgeye saldırı yapan bölgeden birim aktar (minimum 1, yarısı kadar)
            const unitsToMove = Math.max(1, Math.floor(attackingCountry.regions[attackingRegionNutsId].units * 0.5)); 
            
            // Eğer saldıran bölgede yeterli birim yoksa, kalan tüm birimleri aktar
            if (attackingCountry.regions[attackingRegionNutsId].units < unitsToMove) {
                attackingCountry.regions[defendingRegionNutsId] = { units: attackingCountry.regions[attackingRegionNutsId].units };
                attackingCountry.regions[attackingRegionNutsId].units = 0;
            } else {
                attackingCountry.regions[defendingRegionNutsId] = { units: unitsToMove };
                attackingCountry.regions[attackingRegionNutsId].units -= unitsToMove;
            }

            // Bölgenin rengini yeni sahibine göre güncelle
            conqueredRegionPath.style.setProperty('fill', attackingCountry.color, 'important'); // !important burada da önemli
        }

    } else {
        // Savunan kazandı (saldıranın birimi az veya eşitse)
        addNotification(`${defendingCountry.name} savunmayı başardı. ${attackingCountry.name} geri çekildi.`);
        attackerLosses = Math.min(attackingUnits, Math.floor(attackingUnits * 0.8)); // Saldıranın kaybı
        defenderLosses = Math.min(defendingUnits, Math.floor(attackingUnits * 0.2)); // Savunanın kaybı (saldıran birimine göre)

        attackingCountry.regions[attackingRegionNutsId].units -= attackerLosses;
        if (attackingCountry.regions[attackingRegionNutsId].units < 0) {
            attackingCountry.regions[attackingRegionNutsId].units = 0;
        }
        defendingCountry.regions[defendingRegionNutsId].units -= defenderLosses;
        if (defendingCountry.regions[defendingRegionNutsId].units < 0) {
            defendingCountry.regions[defendingRegionNutsId].units = 0;
        }
    }

    checkCountryElimination(defendingCountryId); // Savunan ülkenin elendiğini kontrol et
    checkCountryElimination(attackingCountryId); // Saldıran ülkenin elendiğini kontrol et (eğer tüm bölgelerini kaybetti ise)
    updateUI();
}


function checkCountryElimination(countryId) {
    const country = countriesData[countryId];
    if (country && country.nuts2.length === 0) {
        addNotification(`${country.name} tüm topraklarını kaybetti ve oyundan elendi!`);
        
        // Elenen ülkenin harita üzerindeki tüm bölgelerinin rengini gri yap
        if (svgDoc) {
            svgDoc.querySelectorAll(`path[data-nuts-id]`).forEach(path => {
                const pathNutsId = path.getAttribute('data-nuts-id');
                // Eğer bu nutsId'nin sahibi hala elenen ülke olarak görünüyorsa
                // (getCountryIdFromNutsId çağrısı, `nuts2` listesi güncellendiği için doğru sonucu vermeli)
                const currentOwnerId = getCountryIdFromNutsId(pathNutsId);
                if (currentOwnerId === null || currentOwnerId === countryId) { // Eğer zaten sahibi yoksa veya elenen ülke ise
                     path.style.setProperty('fill', '#888888', 'important'); // Griye çevir, !important ile
                }
            });
        }
        delete countriesData[countryId]; // Ülkeyi ülkeler listesinden sil
        
        // Eğer elenen ülke oyuncunun ülkesi ise oyun biter.
        if (countryId === playerCountryId) {
            alert("Oyun Bitti! Tüm topraklarınızı kaybettiniz.");
            location.reload(); // Oyunu yeniden başlat
        }
        // Hedef ülke seçicisini güncelle
        updateTargetCountrySelect();
    }
}

function updateTargetCountrySelect() {
    targetCountrySelect.innerHTML = '<option value="none">Ülke Seçin</option>';
    const availableCountries = Object.keys(countriesData).filter(id => 
        countriesData.hasOwnProperty(id) && 
        id !== playerCountryId && 
        countriesData[id].nuts2 && // nuts2 dizisi var mı
        countriesData[id].nuts2.length > 0 // en az bir bölgesi var mı
    );

    if (availableCountries.length === 0) {
        const option = document.createElement('option');
        option.value = 'none';
        option.textContent = 'Savaşacak ülke kalmadı!';
        targetCountrySelect.appendChild(option);
        declareWarButton.disabled = true;
    } else {
        declareWarButton.disabled = false;
        availableCountries.forEach(countryId => {
            const option = document.createElement('option');
            option.value = countryId;
            option.textContent = countriesData[countryId].name;
            targetCountrySelect.appendChild(option);
        });
    }
}


function nextTurn() {
    currentTurn++;
    addNotification(`--- Tur ${currentTurn} başladı! ---`);

    // Oyuncu gelirini hesapla
    const player = countriesData[playerCountryId];
    if (player) { // Player nesnesinin hala var olup olmadığını kontrol edin (elenmiş olabilir)
        const playerIncome = player.nuts2.length * INCOME_PER_REGION;
        player.coins += playerIncome;
        addNotification(`Ülkeniz ${playerIncome} coin gelir elde etti. Toplam coin: ${player.coins}.`);
        player.unitsReady = 0; // Hazır birimleri sıfırla
    } else {
        addNotification("Ülkeniz elendiği için gelir elde edemedi. Oyun bitti.");
        // Oyun bittiyse bir sonraki tura geçmeyi engelle
        nextTurnButton.disabled = true;
        buyUnitButton.disabled = true;
        declareWarButton.disabled = true;
        return; 
    }
    
    resetAttackMode(); // Her tur sonunda saldırı modunu sıfırla

    // Gelişmiş AI hareketleri - Age of History tarzı
    performAdvancedAI();

    updateUI();
}

function runAILogic() {
    // AI listesini sadece mevcut ve toprakları olan ülkelerden oluştur
    const aiCountryIds = Object.keys(countriesData).filter(id => 
        !countriesData[id].isPlayer && 
        countriesData[id] && 
        countriesData[id].nuts2 && 
        countriesData[id].nuts2.length > 0
    );

    // AI'ları rastgele sırada hareket ettir
    shuffleArray(aiCountryIds).forEach(aiId => {
        const aiCountry = countriesData[aiId];
        if (!aiCountry || aiCountry.nuts2.length === 0) return; // Ülke elenmiş olabilir veya toprağı yok

        // AI gelir elde etsin
        const aiIncome = aiCountry.nuts2.length * INCOME_PER_REGION;
        aiCountry.coins += aiIncome;
        addNotification(`${aiCountry.name} ${aiIncome} coin gelir elde etti.`);

        // AI birim satın alsın (basit strateji: parası yettiği kadar)
        while (aiCountry.coins >= UNIT_COST) {
            aiCountry.coins -= UNIT_COST;
            aiCountry.unitsReady = (aiCountry.unitsReady || 0) + 1;
            addNotification(`${aiCountry.name} 1 birim satın aldı.`);
        }

        // AI birimlerini yerleştirsin (rastgele kendi bölgelerine)
        if (aiCountry.unitsReady > 0 && aiCountry.nuts2.length > 0) {
            let ownedRegionsToPlaceUnits = aiCountry.nuts2.filter(nutsId => aiCountry.regions[nutsId]);
            // Eğer hiç birim olan bölge yoksa veya yeni bölge eklenmişse, tüm bölgeleri hedefle
            if (ownedRegionsToPlaceUnits.length === 0 && aiCountry.nuts2.length > 0) {
                 ownedRegionsToPlaceUnits = aiCountry.nuts2;
            } else if (ownedRegionsToPlaceUnits.length === 0) {
                 // Hiç bölgesi yoksa birim yerleştiremez
                 aiCountry.unitsReady = 0;
                 return;
            }

            const targetRegionForPlacement = ownedRegionsToPlaceUnits[Math.floor(Math.random() * ownedRegionsToPlaceUnits.length)];

            if (targetRegionForPlacement) {
                if (!aiCountry.regions[targetRegionForPlacement]) { // Bölge objesi yoksa oluştur
                    aiCountry.regions[targetRegionForPlacement] = { units: 0 };
                }
                aiCountry.regions[targetRegionForPlacement].units += aiCountry.unitsReady;
                addNotification(`${aiCountry.name} ${aiCountry.unitsReady} birimi ${targetRegionForPlacement} bölgesine yerleştirdi.`);
                aiCountry.unitsReady = 0;
            }
        }

        // AI savaş ilan etsin (basit rastgele strateji)
        if (Math.random() < WAR_CHANCE_BASE) {
            const potentialTargets = Object.keys(countriesData).filter(id => 
                id !== aiId && 
                countriesData[id].nuts2 && 
                countriesData[id].nuts2.length > 0
            );
            
            if (potentialTargets.length > 0) {
                const targetCountryId = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                const targetCountry = countriesData[targetCountryId];

                const aiAvailableRegions = aiCountry.nuts2.filter(nutsId => aiCountry.regions[nutsId] && aiCountry.regions[nutsId].units > 0);

                let attackInitiated = false;
                shuffleArray(aiAvailableRegions).forEach(attackingRegionNutsId => {
                    if (attackInitiated) return; // Zaten saldırı başlatıldıysa çık

                    const possibleDefendingRegions = (nutsNeighbors[attackingRegionNutsId] || []).filter(neighborNutsId => {
                        return getCountryIdFromNutsId(neighborNutsId) === targetCountryId && 
                               (targetCountry.regions[neighborNutsId] && targetCountry.regions[neighborNutsId].units >= 0); 
                    });

                    if (possibleDefendingRegions.length > 0) {
                        const defendingRegionNutsId = possibleDefendingRegions[Math.floor(Math.random() * possibleDefendingRegions.length)];

                        const attackingUnits = aiCountry.regions[attackingRegionNutsId].units;
                        const defendingUnits = targetCountry.regions[defendingRegionNutsId] ? targetCountry.regions[defendingRegionNutsId].units : 0;

                        // AI saldırıyı başlatmak için en az 1 birimi olmalı ve hedef bölgede birim olmalı
                        // Veya AI'nın birimi hedeften fazla olmalı (basit AI kuralı)
                        if (attackingUnits > 0 && 
                            (defendingUnits === 0 || attackingUnits > defendingUnits)) {
                            
                            addNotification(`${aiCountry.name} ülkesi, ${targetCountry.name} ülkesine savaş ilan etti!`);
                            resolveCombat(
                                aiId, attackingRegionNutsId, attackingUnits,
                                targetCountryId, defendingRegionNutsId, defendingUnits
                            );
                            attackInitiated = true; // Bu tur bu AI için saldırı yapıldı
                        }
                    }
                });
            }
        }
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ============================================================================
// War Modal Functions
// ============================================================================
function showWarModal(attackingRegionId, defendingRegionId, attackingUnits, defendingUnits) {
    const attackingCountry = countriesData[playerCountryId];
    const defendingCountryId = getCountryIdFromNutsId(defendingRegionId);
    const defendingCountry = countriesData[defendingCountryId];
    
    document.getElementById('warModalTitle').textContent = `${attackingCountry.name} vs ${defendingCountry.name}`;
    document.getElementById('attackingRegionInfo').textContent = `${attackingRegionId} (${attackingUnits} birim)`;
    document.getElementById('defendingRegionInfo').textContent = `${defendingRegionId} (${defendingUnits} birim)`;
    
    // Store battle data for later use
    window.currentBattle = {
        attackingRegionId,
        defendingRegionId,
        attackingUnits,
        defendingUnits,
        attackingCountryId: playerCountryId,
        defendingCountryId
    };
    
    document.getElementById('warModal').style.display = 'block';
}

function conductAttack() {
    if (!window.currentBattle) return;
    
    const { attackingRegionId, defendingRegionId, attackingUnits, defendingUnits, attackingCountryId, defendingCountryId } = window.currentBattle;
    
    resolveCombat(attackingCountryId, attackingRegionId, attackingUnits, defendingCountryId, defendingRegionId, defendingUnits);
    
    closeWarModal();
    resetAttackMode();
    addNotification("Saldırı tamamlandı!");
}

function closeWarModal() {
    document.getElementById('warModal').style.display = 'none';
    window.currentBattle = null;
}

// ============================================================================
// Olay Dinleyicileri
// ============================================================================
startGameButton.addEventListener('click', initializeGame);
selectCountryButton.addEventListener('click', startGame);
buyUnitButton.addEventListener('click', buyUnit);
nextTurnButton.addEventListener('click', nextTurn);
declareWarButton.addEventListener('click', declareWar);

// War modal event listeners (check if elements exist first)
if (document.getElementById('conductAttackButton')) {
    document.getElementById('conductAttackButton').addEventListener('click', conductAttack);
}
if (document.getElementById('closeWarModalButton')) {
    document.getElementById('closeWarModalButton').addEventListener('click', closeWarModal);
}

// ============================================================================
// Gelişmiş AI Management - Age of History Tarzı
// ============================================================================

// AI stratejik değerlendirme fonksiyonu
function evaluateStrategicSituation(countryId) {
    const country = countriesData[countryId];
    const personality = AI_PERSONALITIES[country.personality];
    
    return {
        territoryCount: country.nuts2.length,
        economicPower: country.coins,
        militaryStrength: getTotalUnitsForCountry(countryId),
        threats: getThreateningNeighbors(countryId),
        opportunities: getWeakNeighbors(countryId),
        personality: personality
    };
}

// Tehdit oluşturan komşuları bulma
function getThreateningNeighbors(countryId) {
    const neighbors = getNeighboringCountries(countryId);
    const myStrength = getTotalUnitsForCountry(countryId);
    
    return neighbors.filter(neighborId => {
        const neighborStrength = getTotalUnitsForCountry(neighborId);
        return neighborStrength > myStrength * 1.2; // %20 daha güçlü olanlar tehdit
    });
}

// Zayıf komşuları bulma (fırsat)
function getWeakNeighbors(countryId) {
    const neighbors = getNeighboringCountries(countryId);
    const myStrength = getTotalUnitsForCountry(countryId);
    
    return neighbors.filter(neighborId => {
        const neighborStrength = getTotalUnitsForCountry(neighborId);
        return neighborStrength < myStrength * 0.8; // %20 daha zayıf olanlar hedef
    });
}

// Gelişmiş AI karar verme sistemi
function makeAIDecisions(countryId) {
    const country = countriesData[countryId];
    const situation = evaluateStrategicSituation(countryId);
    const personality = situation.personality;
    
    // 1. Ekonomik kararlar (birim satın alma)
    const economicDecision = makeEconomicDecisions(countryId, situation);
    
    // 2. Askeri kararlar (savaş, savunma)
    const militaryDecision = makeMilitaryDecisions(countryId, situation);
    
    return {
        economic: economicDecision,
        military: militaryDecision
    };
}

// Ekonomik karar verme
function makeEconomicDecisions(countryId, situation) {
    const country = countriesData[countryId];
    const decisions = [];
    
    // Birim satın alma stratejisi
    const maxAffordableUnits = Math.floor(country.coins / UNIT_COST);
    const territoryRatio = situation.territoryCount / 10; // Toprak sayısına göre normalize
    const threatLevel = situation.threats.length;
    
    let targetUnits = 0;
    
    if (situation.personality.defenseFocus > 0.6 && threatLevel > 0) {
        // Savunma odaklı: Tehdit varsa birim al
        targetUnits = Math.min(maxAffordableUnits, threatLevel * 2);
    } else if (situation.personality.expansionFocus > 0.7) {
        // Genişleme odaklı: Sürekli birim al
        targetUnits = Math.min(maxAffordableUnits, Math.floor(territoryRatio * 3));
    } else {
        // Dengeli: Orta düzeyde birim al
        targetUnits = Math.min(maxAffordableUnits, Math.floor(territoryRatio * 2));
    }
    
    for (let i = 0; i < targetUnits; i++) {
        decisions.push('buyUnit');
    }
    
    return decisions;
}

// Askeri karar verme
function makeMilitaryDecisions(countryId, situation) {
    const decisions = [];
    
    // Savaş ilanı değerlendirmesi
    if (situation.opportunities.length > 0 && Math.random() < situation.personality.warChance) {
        // En zayıf komşuyu hedef al
        const targetCountry = situation.opportunities[0];
        decisions.push({
            type: 'declareWar',
            target: targetCountry,
            reason: 'expansion'
        });
    }
    
    // Savunma pozisyonları güçlendirme
    if (situation.threats.length > 0) {
        decisions.push({
            type: 'reinforceDefenses',
            priority: 'high'
        });
    }
    
    return decisions;
}

// Komşu ülkeleri bulma fonksiyonu
function getNeighboringCountries(countryId) {
    const neighbors = new Set();
    const myRegions = countriesData[countryId].nuts2;
    
    for (const myRegion of myRegions) {
        if (regionsNeighbors[myRegion]) {
            for (const neighborRegion of regionsNeighbors[myRegion]) {
                const neighborCountry = getCountryIdFromNutsId(neighborRegion);
                if (neighborCountry && neighborCountry !== countryId) {
                    neighbors.add(neighborCountry);
                }
            }
        }
    }
    
    return Array.from(neighbors);
}

// Ülkenin toplam asker sayısını hesaplama
function getTotalUnitsForCountry(countryId) {
    const regions = countriesData[countryId].nuts2;
    let totalUnits = 0;
    
    for (const regionId of regions) {
        if (regionUnits[regionId]) {
            totalUnits += regionUnits[regionId];
        }
    }
    
    return totalUnits;
}

// Ana AI tur fonksiyonu
function performAdvancedAI() {
    console.log("🤖 AI Turn Phase Started - Age of History Style");
    
    const aiCountries = Object.keys(countriesData).filter(id => !countriesData[id].isPlayer);
    
    for (const countryId of aiCountries) {
        performAdvancedAIActions(countryId);
    }
    
    // Zafer koşullarını kontrol et
    checkVictoryConditions();
}

// Gelişmiş AI eylem sistemi
function performAdvancedAIActions(countryId) {
    const country = countriesData[countryId];
    console.log(`🎯 ${country.name} (${country.personality}) thinking...`);
    
    // Gelir elde et
    const income = country.nuts2.length * INCOME_PER_REGION;
    country.coins += income;
    
    // Stratejik kararlar al
    const decisions = makeAIDecisions(countryId);
    
    // Ekonomik kararları uygula
    for (const decision of decisions.economic) {
        if (decision === 'buyUnit' && country.coins >= UNIT_COST) {
            // En az birimli bölgeyi güçlendir
            const weakestRegion = findWeakestRegion(countryId);
            if (weakestRegion) {
                regionUnits[weakestRegion] = (regionUnits[weakestRegion] || 0) + 1;
                country.coins -= UNIT_COST;
                console.log(`💰 ${country.name} bought unit for ${weakestRegion}`);
            }
        }
    }
    
    // Askeri kararları uygula
    for (const decision of decisions.military) {
        if (decision.type === 'declareWar') {
            executeAIWarDeclaration(countryId, decision.target);
        }
    }
}

// AI savaş ilanı
function executeAIWarDeclaration(attackerCountryId, defenderCountryId) {
    const attacker = countriesData[attackerCountryId];
    const defender = countriesData[defenderCountryId];
    
    if (!warDeclarations[attackerCountryId]) {
        warDeclarations[attackerCountryId] = [];
    }
    
    if (!warDeclarations[attackerCountryId].includes(defenderCountryId)) {
        warDeclarations[attackerCountryId].push(defenderCountryId);
        
        addNotification(`⚔️ ${attacker.name}, ${defender.name}'a savaş ilan etti!`);
        console.log(`⚔️ WAR: ${attacker.name} vs ${defender.name}`);
        
        // Otomatik saldırı başlat
        setTimeout(() => {
            executeAIAttack(attackerCountryId, defenderCountryId);
        }, 1000);
    }
}

// AI saldırısı gerçekleştir
function executeAIAttack(attackerCountryId, defenderCountryId) {
    const attackerRegions = countriesData[attackerCountryId].nuts2;
    const defenderRegions = countriesData[defenderCountryId].nuts2;
    
    // En güçlü saldırı bölgesini bul
    let bestAttackRegion = null;
    let maxAttackPower = 0;
    
    for (const regionId of attackerRegions) {
        const units = regionUnits[regionId] || 0;
        if (units > maxAttackPower) {
            maxAttackPower = units;
            bestAttackRegion = regionId;
        }
    }
    
    // En zayıf savunma bölgesini bul
    let bestTargetRegion = null;
    let minDefensePower = Infinity;
    
    for (const regionId of defenderRegions) {
        const units = regionUnits[regionId] || 0;
        if (units < minDefensePower) {
            minDefensePower = units;
            bestTargetRegion = regionId;
        }
    }
    
    if (bestAttackRegion && bestTargetRegion && maxAttackPower > 0) {
        console.log(`🎯 AI Attack: ${bestAttackRegion} -> ${bestTargetRegion}`);
        resolveCombat(attackerCountryId, bestAttackRegion, maxAttackPower, defenderCountryId, bestTargetRegion, minDefensePower);
    }
}

// En zayıf bölgeyi bulma
function findWeakestRegion(countryId) {
    const regions = countriesData[countryId].nuts2;
    let weakestRegion = null;
    let minUnits = Infinity;
    
    for (const regionId of regions) {
        const units = regionUnits[regionId] || 0;
        if (units < minUnits) {
            minUnits = units;
            weakestRegion = regionId;
        }
    }
    
    return weakestRegion;
}

// Zafer koşullarını kontrol etme
function checkVictoryConditions() {
    if (!playerCountryId || !countriesData[playerCountryId]) return;
    
    const playerTerritoryCount = countriesData[playerCountryId].nuts2.length;
    const totalTerritories = Object.values(countriesData).reduce((sum, country) => sum + country.nuts2.length, 0);
    const playerTerritoryRatio = playerTerritoryCount / totalTerritories;
    
    if (playerTerritoryRatio >= victoryConditions.territoryControl) {
        endGame('territorial_victory');
    } else if (countriesData[playerCountryId].coins >= victoryConditions.economicDominance) {
        endGame('economic_victory');
    }
    
    // AI zafer kontrolü
    for (const [countryId, country] of Object.entries(countriesData)) {
        if (!country.isPlayer) {
            const aiTerritoryRatio = country.nuts2.length / totalTerritories;
            if (aiTerritoryRatio >= victoryConditions.territoryControl) {
                endGame('ai_victory', countryId);
                break;
            }
        }
    }
}

// Oyun sonu
function endGame(victoryType, winnerId = null) {
    gamePhase = 'ended';
    
    let message = '';
    switch (victoryType) {
        case 'territorial_victory':
            message = `🏆 TEBRİKLER! Toprakların %${Math.round(victoryConditions.territoryControl * 100)}'ini kontrol ederek zafer kazandınız!`;
            break;
        case 'economic_victory':
            message = `💰 TEBRİKLER! Ekonomik hakimiyetinizle zafer kazandınız!`;
            break;
        case 'ai_victory':
            const winner = countriesData[winnerId];
            message = `😔 ${winner.name} Avrupa'yı ele geçirdi! Oyun sona erdi.`;
            break;
    }
    
    addNotification(message);
    
    // Oyun kontrolleri devre dışı bırak
    nextTurnButton.disabled = true;
    buyUnitButton.disabled = true;
    declareWarButton.disabled = true;
}

// ============================================================================
// İlk yüklemede UI'ı gizle
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    gameScreen.style.display = 'none';
    countrySelectionModal.style.display = 'none';
});
