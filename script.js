// =============================================================================
// Age of History II - European Theater Game Engine
// Comprehensive Strategy Game with Historical Accuracy
// =============================================================================

class AgeOfHistoryGame {
    constructor() {
        this.gameYear = 1936;
        this.turnCounter = 1;
        this.playerName = "";
        this.playerCountry = null;
        this.selectedCountry = null;
        this.gameMap = null;
        this.isWarMode = false;
        this.attackingRegion = null;
        this.defendingRegion = null;
        
        // Game state
        this.countries = new Map();
        this.wars = new Set();
        this.alliances = new Map();
        
        this.initializeGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.initializeCountries();
        this.loadMapData();
    }

    setupEventListeners() {
        // Start screen events
        document.getElementById('startGameButton').addEventListener('click', () => {
            this.startGame();
        });

        // Game control events
        document.getElementById('buyUnitButton').addEventListener('click', () => {
            this.buyUnit();
        });

        document.getElementById('declareWarButton').addEventListener('click', () => {
            this.declareWar();
        });

        document.getElementById('nextTurnButton').addEventListener('click', () => {
            this.nextTurn();
        });

        // Modal events
        document.getElementById('selectCountryButton').addEventListener('click', () => {
            this.selectPlayerCountry();
        });

        document.getElementById('conductAttackButton').addEventListener('click', () => {
            this.conductAttack();
        });

        document.getElementById('closeWarModalButton').addEventListener('click', () => {
            this.closeWarModal();
        });

        // Map zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.zoomMap(1.2);
        });

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.zoomMap(0.8);
        });

        document.getElementById('resetZoomBtn').addEventListener('click', () => {
            this.resetMapZoom();
        });
    }

    // Enhanced country data with detailed Russian territories and Soviet Union
    initializeCountries() {
        const countryData = {
            // Major Powers
            'germany': {
                name: 'Alman İmparatorluğu',
                flag: '🇩🇪',
                color: '#8B4513',
                government: 'Faşist Diktatörlük',
                leader: 'Adolf Hitler',
                leaderPortrait: 'hitler.jpg',
                population: 69300000,
                economy: 85,
                military: 90,
                technology: 88,
                stability: 75,
                territories: ['germany_main', 'austria', 'sudetenland'],
                capital: 'Berlin',
                gold: 1000,
                units: 25,
                isPlayer: false,
                aiPersonality: 'aggressive'
            },
            
            'soviet_union': {
                name: 'Sovyetler Birliği',
                flag: '🚩',
                color: '#DC143C',
                government: 'Komünist Tek Parti',
                leader: 'Josef Stalin',
                leaderPortrait: 'stalin.jpg',
                population: 162500000,
                economy: 70,
                military: 85,
                technology: 75,
                stability: 60,
                territories: [
                    // European Russia
                    'moscow_region', 'leningrad_region', 'volga_region', 'ural_region',
                    'central_russia', 'southern_russia', 'northwestern_russia', 'volga_vyatka',
                    'central_black_earth', 'north_caucasus', 'kaliningrad', 'karelia',
                    // Asian Russia
                    'western_siberia', 'eastern_siberia', 'far_east', 'yakutia',
                    'chukotka', 'kamchatka', 'sakhalin', 'primorye', 'khabarovsk',
                    'magadan', 'amur', 'zabaykalye', 'buryatia', 'tuva',
                    'altai', 'kemerovo', 'tomsk', 'novosibirsk', 'omsk',
                    'tyumen', 'kurgan', 'chelyabinsk', 'perm', 'kirov',
                    // Additional territories
                    'ukraine', 'belarus', 'baltic_states', 'moldova', 'georgia',
                    'armenia', 'azerbaijan', 'kazakhstan', 'uzbekistan', 'turkmenistan',
                    'kyrgyzstan', 'tajikistan'
                ],
                capital: 'Moskova',
                gold: 800,
                units: 40,
                isPlayer: false,
                aiPersonality: 'defensive_expansionist'
            },

            // Russian territories (34 regions as requested)
            'moscow_region': {
                name: 'Moskova Bölgesi',
                flag: '🏛️',
                color: '#8B0000',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 8500000,
                economy: 90,
                military: 95,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'leningrad_region': {
                name: 'Leningrad Bölgesi',
                flag: '⚓',
                color: '#4682B4',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 4200000,
                economy: 85,
                military: 88,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'volga_region': {
                name: 'Volga Bölgesi',
                flag: '🌊',
                color: '#228B22',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 6800000,
                economy: 75,
                military: 70,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'ural_region': {
                name: 'Ural Bölgesi',
                flag: '⛰️',
                color: '#8FBC8F',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 5200000,
                economy: 80,
                military: 75,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'central_russia': {
                name: 'Merkezi Rusya',
                flag: '🏰',
                color: '#CD853F',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 7100000,
                economy: 82,
                military: 78,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'southern_russia': {
                name: 'Güney Rusya',
                flag: '🌾',
                color: '#DAA520',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 9200000,
                economy: 78,
                military: 72,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'northwestern_russia': {
                name: 'Kuzeybatı Rusya',
                flag: '🌲',
                color: '#2F4F4F',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 3800000,
                economy: 65,
                military: 68,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'volga_vyatka': {
                name: 'Volga-Vyatka',
                flag: '🏞️',
                color: '#556B2F',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 4500000,
                economy: 70,
                military: 65,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'central_black_earth': {
                name: 'Merkezi Kara Toprak',
                flag: '🚜',
                color: '#8B4513',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 5800000,
                economy: 85,
                military: 70,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'north_caucasus': {
                name: 'Kuzey Kafkasya',
                flag: '🏔️',
                color: '#BC8F8F',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 6200000,
                economy: 72,
                military: 80,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            // Siberian regions (continuing the 34 regions)
            'western_siberia': {
                name: 'Batı Sibirya',
                flag: '❄️',
                color: '#B0C4DE',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 3200000,
                economy: 60,
                military: 55,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'eastern_siberia': {
                name: 'Doğu Sibirya',
                flag: '🐻',
                color: '#778899',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 2800000,
                economy: 55,
                military: 50,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'far_east': {
                name: 'Uzak Doğu',
                flag: '🌅',
                color: '#4169E1',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 2100000,
                economy: 65,
                military: 75,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'yakutia': {
                name: 'Yakutya',
                flag: '💎',
                color: '#E6E6FA',
                government: 'Soviet Republic',
                leader: 'Local Soviet',
                population: 300000,
                economy: 45,
                military: 40,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'chukotka': {
                name: 'Çukotka',
                flag: '🦌',
                color: '#F0F8FF',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 150000,
                economy: 35,
                military: 30,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'kamchatka': {
                name: 'Kamçatka',
                flag: '🌋',
                color: '#FF6347',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 180000,
                economy: 40,
                military: 45,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'sakhalin': {
                name: 'Sahalin',
                flag: '🏝️',
                color: '#20B2AA',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 400000,
                economy: 50,
                military: 55,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'primorye': {
                name: 'Primorye',
                flag: '🦅',
                color: '#32CD32',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 1200000,
                economy: 68,
                military: 72,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'khabarovsk': {
                name: 'Habarovsk',
                flag: '🌉',
                color: '#6495ED',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 800000,
                economy: 62,
                military: 68,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'magadan': {
                name: 'Magadan',
                flag: '⛏️',
                color: '#C0C0C0',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 250000,
                economy: 45,
                military: 40,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'amur': {
                name: 'Amur',
                flag: '🐟',
                color: '#4682B4',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 600000,
                economy: 55,
                military: 60,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'zabaykalye': {
                name: 'Zabaykalye',
                flag: '🏜️',
                color: '#D2B48C',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 700000,
                economy: 50,
                military: 55,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'buryatia': {
                name: 'Buryatya',
                flag: '🐎',
                color: '#DDA0DD',
                government: 'Soviet Republic',
                leader: 'Local Soviet',
                population: 450000,
                economy: 48,
                military: 52,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'tuva': {
                name: 'Tuva',
                flag: '🏕️',
                color: '#F4A460',
                government: 'Soviet Republic',
                leader: 'Local Soviet',
                population: 200000,
                economy: 35,
                military: 40,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'altai': {
                name: 'Altay',
                flag: '🦌',
                color: '#9ACD32',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 380000,
                economy: 42,
                military: 45,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'kemerovo': {
                name: 'Kemerovo',
                flag: '⛏️',
                color: '#696969',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 1100000,
                economy: 75,
                military: 65,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'tomsk': {
                name: 'Tomsk',
                flag: '🎓',
                color: '#4169E1',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 650000,
                economy: 68,
                military: 60,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'novosibirsk': {
                name: 'Novosibirsk',
                flag: '🏭',
                color: '#708090',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 1400000,
                economy: 78,
                military: 70,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'omsk': {
                name: 'Omsk',
                flag: '🚂',
                color: '#B22222',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 900000,
                economy: 65,
                military: 62,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'tyumen': {
                name: 'Tyumen',
                flag: '🛢️',
                color: '#000000',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 750000,
                economy: 85,
                military: 60,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'kurgan': {
                name: 'Kurgan',
                flag: '🌾',
                color: '#F0E68C',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 520000,
                economy: 58,
                military: 55,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'chelyabinsk': {
                name: 'Çelyabinsk',
                flag: '🏭',
                color: '#8B4513',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 1200000,
                economy: 82,
                military: 78,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'perm': {
                name: 'Perm',
                flag: '⚡',
                color: '#FF4500',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 980000,
                economy: 75,
                military: 70,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            'kirov': {
                name: 'Kirov',
                flag: '🌲',
                color: '#228B22',
                government: 'Soviet Oblast',
                leader: 'Local Soviet',
                population: 680000,
                economy: 62,
                military: 58,
                isSubRegion: true,
                parentCountry: 'soviet_union'
            },

            // Other European powers
            'france': {
                name: 'Fransa Cumhuriyeti',
                flag: '🇫🇷',
                color: '#0055A4',
                government: 'Parlamenter Cumhuriyet',
                leader: 'Albert Lebrun',
                leaderPortrait: 'lebrun.jpg',
                population: 41900000,
                economy: 78,
                military: 75,
                technology: 82,
                stability: 65,
                territories: ['france_main', 'corsica', 'algeria'],
                capital: 'Paris',
                gold: 750,
                units: 20,
                isPlayer: false,
                aiPersonality: 'defensive'
            },

            'united_kingdom': {
                name: 'Birleşik Krallık',
                flag: '🇬🇧',
                color: '#012169',
                government: 'Anayasal Monarşi',
                leader: 'George VI',
                leaderPortrait: 'george_vi.jpg',
                population: 47800000,
                economy: 88,
                military: 85,
                technology: 92,
                stability: 85,
                territories: ['england', 'scotland', 'wales', 'northern_ireland', 'india', 'canada', 'australia'],
                capital: 'Londra',
                gold: 1200,
                units: 22,
                isPlayer: false,
                aiPersonality: 'naval_focused'
            },

            'italy': {
                name: 'İtalya Krallığı',
                flag: '🇮🇹',
                color: '#009246',
                government: 'Faşist Krallık',
                leader: 'Benito Mussolini',
                leaderPortrait: 'mussolini.jpg',
                population: 42400000,
                economy: 65,
                military: 70,
                technology: 68,
                stability: 70,
                territories: ['italy_main', 'sicily', 'sardinia', 'libya', 'ethiopia'],
                capital: 'Roma',
                gold: 500,
                units: 18,
                isPlayer: false,
                aiPersonality: 'opportunistic'
            },

            'poland': {
                name: 'Polonya Cumhuriyeti',
                flag: '🇵🇱',
                color: '#DC143C',
                government: 'Otokratik Cumhuriyet',
                leader: 'Ignacy Mościcki',
                leaderPortrait: 'moscicki.jpg',
                population: 34800000,
                economy: 55,
                military: 60,
                technology: 58,
                stability: 60,
                territories: ['poland_main', 'danzig_corridor'],
                capital: 'Varşova',
                gold: 300,
                units: 15,
                isPlayer: false,
                aiPersonality: 'defensive'
            },

            'spain': {
                name: 'İspanya Cumhuriyeti',
                flag: '🇪🇸',
                color: '#AA151B',
                government: 'İç Savaş Durumu',
                leader: 'Manuel Azaña / Francisco Franco',
                leaderPortrait: 'azana_franco.jpg',
                population: 25800000,
                economy: 45,
                military: 55,
                technology: 50,
                stability: 25,
                territories: ['spain_main', 'canary_islands', 'spanish_morocco'],
                capital: 'Madrid',
                gold: 200,
                units: 12,
                isPlayer: false,
                aiPersonality: 'civil_war'
            }
        };

        // Initialize countries map
        for (const [id, data] of Object.entries(countryData)) {
            this.countries.set(id, {
                id,
                ...data,
                relationships: new Map(),
                warWith: new Set(),
                alliedWith: new Set()
            });
        }

        this.populateCountrySelects();
    }

    populateCountrySelects() {
        const countrySelect = document.getElementById('targetCountrySelect');
        const countryList = document.getElementById('countryList');
        
        // Clear existing options
        countrySelect.innerHTML = '<option value="none">-- Devlet Seçiniz --</option>';
        countryList.innerHTML = '';

        // Add major powers to selection (exclude sub-regions)
        this.countries.forEach((country, id) => {
            if (!country.isSubRegion) {
                // Add to war target dropdown
                const option = document.createElement('option');
                option.value = id;
                option.textContent = country.name;
                countrySelect.appendChild(option);

                // Add to country selection modal
                const countryDiv = document.createElement('div');
                countryDiv.className = 'country-option';
                countryDiv.dataset.countryId = id;
                countryDiv.innerHTML = `
                    <div class="country-flag">${country.flag}</div>
                    <div class="country-name">${country.name}</div>
                    <div class="country-info">
                        ${country.government}<br>
                        Lider: ${country.leader}<br>
                        Nüfus: ${country.population?.toLocaleString() || 'Bilinmiyor'}<br>
                        Başkent: ${country.capital || 'Bilinmiyor'}
                    </div>
                `;
                
                countryDiv.addEventListener('click', () => {
                    document.querySelectorAll('.country-option').forEach(el => el.classList.remove('selected'));
                    countryDiv.classList.add('selected');
                    this.selectedCountry = id;
                });
                
                countryList.appendChild(countryDiv);
            }
        });
    }

    loadMapData() {
        const mapObject = document.getElementById('gameMapObject');
        mapObject.addEventListener('load', () => {
            this.gameMap = mapObject.contentDocument;
            this.setupMapInteractions();
            this.colorizeMap();
        });
    }

    setupMapInteractions() {
        if (!this.gameMap) return;

        // Add click handlers to all path elements (countries/territories)
        const paths = this.gameMap.querySelectorAll('path, polygon, circle');
        paths.forEach(path => {
            path.style.cursor = 'pointer';
            path.addEventListener('click', (e) => {
                this.handleTerritoryClick(e.target);
            });
            
            path.addEventListener('mouseover', (e) => {
                this.showTerritoryTooltip(e.target, e);
            });
            
            path.addEventListener('mouseout', () => {
                this.hideTerritoryTooltip();
            });
        });
    }

    handleTerritoryClick(territory) {
        const territoryId = territory.id || territory.getAttribute('data-territory');
        const country = this.getCountryByTerritory(territoryId);
        
        if (country) {
            this.showCountryMenu(country, territory);
        }
    }

    showCountryMenu(country, territoryElement) {
        // Create and show detailed country menu
        const menu = document.createElement('div');
        menu.className = 'country-menu';
        menu.innerHTML = `
            <div class="country-menu-content">
                <div class="country-header">
                    <span class="country-flag-large">${country.flag}</span>
                    <h3>${country.name}</h3>
                    <button class="close-menu" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="country-details">
                    <div class="leader-section">
                        <img src="images/leaders/${country.leaderPortrait || 'default.jpg'}" 
                             alt="${country.leader}" class="leader-portrait" 
                             onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"100\\" height=\\"120\\"><rect width=\\"100\\" height=\\"120\\" fill=\\"%23333\\"/><text x=\\"50\\" y=\\"60\\" text-anchor=\\"middle\\" fill=\\"white\\">👤</text></svg>'">
                        <div class="leader-info">
                            <h4>Lider: ${country.leader}</h4>
                            <p>Yıl: ${this.gameYear}</p>
                        </div>
                    </div>
                    
                    <div class="government-section">
                        <h4>🏛️ Yönetim Biçimi</h4>
                        <select class="government-select" data-country="${country.id}">
                            <option value="democracy" ${country.government.includes('Cumhuriyet') ? 'selected' : ''}>Demokrasi</option>
                            <option value="fascism" ${country.government.includes('Faşist') ? 'selected' : ''}>Faşizm</option>
                            <option value="communism" ${country.government.includes('Komünist') ? 'selected' : ''}>Komünizm</option>
                            <option value="monarchy" ${country.government.includes('Krallık') || country.government.includes('Monarşi') ? 'selected' : ''}>Monarşi</option>
                            <option value="military" ${country.government.includes('Diktatör') ? 'selected' : ''}>Askeri Diktatörlük</option>
                        </select>
                        <button class="change-government" onclick="game.changeGovernment('${country.id}', this.previousElementSibling.value)">Değiştir</button>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-icon">👥</span>
                            <span class="stat-label">Nüfus</span>
                            <span class="stat-value">${country.population?.toLocaleString() || 'Bilinmiyor'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">💰</span>
                            <span class="stat-label">Ekonomi</span>
                            <span class="stat-value">${country.economy || 0}/100</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">⚔️</span>
                            <span class="stat-label">Askeri Güç</span>
                            <span class="stat-value">${country.military || 0}/100</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🔬</span>
                            <span class="stat-label">Teknoloji</span>
                            <span class="stat-value">${country.technology || 0}/100</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🏛️</span>
                            <span class="stat-label">İstikrar</span>
                            <span class="stat-value">${country.stability || 0}/100</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">💰</span>
                            <span class="stat-label">Hazine</span>
                            <span class="stat-value">${country.gold || 0} Altın</span>
                        </div>
                    </div>
                    
                    <div class="actions-section">
                        <h4>🎯 Eylemler</h4>
                        <div class="action-buttons">
                            <button onclick="game.sendDiplomat('${country.id}')" class="action-btn">📜 Diplomat Gönder</button>
                            <button onclick="game.proposeTrade('${country.id}')" class="action-btn">🤝 Ticaret Teklifi</button>
                            <button onclick="game.proposeAlliance('${country.id}')" class="action-btn">🤝 İttifak Teklifi</button>
                            ${country.id !== this.playerCountry?.id ? `<button onclick="game.declareWarOn('${country.id}')" class="action-btn war-btn">⚔️ Savaş İlan Et</button>` : ''}
                        </div>
                    </div>
                    
                    ${country.territories ? `
                    <div class="territories-section">
                        <h4>🗺️ Kontrol Edilen Bölgeler</h4>
                        <div class="territories-list">
                            ${country.territories.slice(0, 10).map(t => `<span class="territory-tag">${this.getTerritoryDisplayName(t)}</span>`).join('')}
                            ${country.territories.length > 10 ? `<span class="territory-tag">+${country.territories.length - 10} daha...</span>` : ''}
                        </div>
                    </div>` : ''}
                </div>
            </div>
        `;

        // Position menu near the clicked territory
        const rect = territoryElement.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.left = Math.min(rect.right + 10, window.innerWidth - 400) + 'px';
        menu.style.top = Math.max(rect.top, 50) + 'px';
        menu.style.zIndex = '10000';

        document.body.appendChild(menu);
    }

    changeGovernment(countryId, newGovernment) {
        const country = this.countries.get(countryId);
        if (!country) return;

        const governmentTypes = {
            'democracy': 'Demokratik Cumhuriyet',
            'fascism': 'Faşist Diktatörlük',
            'communism': 'Komünist Tek Parti',
            'monarchy': 'Anayasal Monarşi',
            'military': 'Askeri Diktatörlük'
        };

        const oldGov = country.government;
        country.government = governmentTypes[newGovernment];
        
        // Government change affects stability and relationships
        country.stability = Math.max(20, country.stability - 15);
        
        // Update relationships based on ideology
        this.updateIdeologicalRelationships(countryId, newGovernment);
        
        this.addNotification(`${country.name} yönetim biçimini değiştirdi: ${oldGov} → ${country.government}`);
        
        // Close the menu and refresh
        document.querySelectorAll('.country-menu').forEach(menu => menu.remove());
    }

    updateIdeologicalRelationships(countryId, ideology) {
        const country = this.countries.get(countryId);
        
        this.countries.forEach((otherCountry, otherId) => {
            if (otherId === countryId) return;
            
            let relationshipChange = 0;
            const otherIdeology = this.getCountryIdeology(otherCountry);
            
            // Similar ideologies improve relations
            if (ideology === otherIdeology) {
                relationshipChange = 20;
            }
            // Opposing ideologies worsen relations
            else if ((ideology === 'fascism' && otherIdeology === 'communism') ||
                     (ideology === 'communism' && otherIdeology === 'fascism') ||
                     (ideology === 'democracy' && (otherIdeology === 'fascism' || otherIdeology === 'communism'))) {
                relationshipChange = -30;
            }
            
            // Update relationship
            const currentRelation = country.relationships.get(otherId) || 0;
            country.relationships.set(otherId, Math.max(-100, Math.min(100, currentRelation + relationshipChange)));
        });
    }

    getCountryIdeology(country) {
        if (country.government.includes('Faşist')) return 'fascism';
        if (country.government.includes('Komünist')) return 'communism';
        if (country.government.includes('Cumhuriyet') || country.government.includes('Demokrasi')) return 'democracy';
        if (country.government.includes('Krallık') || country.government.includes('Monarşi')) return 'monarchy';
        if (country.government.includes('Askeri') || country.government.includes('Diktatör')) return 'military';
        return 'other';
    }

    getTerritoryDisplayName(territoryId) {
        const country = this.countries.get(territoryId);
        if (country) return country.name;
        
        // Fallback display names for territories
        const displayNames = {
            'germany_main': 'Ana Almanya',
            'austria': 'Avusturya',
            'sudetenland': 'Südet Bölgesi',
            'france_main': 'Ana Fransa',
            'corsica': 'Korsika',
            'algeria': 'Cezayir',
            'england': 'İngiltere',
            'scotland': 'İskoçya',
            'wales': 'Galler',
            'northern_ireland': 'Kuzey İrlanda',
            'india': 'Hindistan',
            'canada': 'Kanada',
            'australia': 'Avustralya'
        };
        
        return displayNames[territoryId] || territoryId;
    }

    getCountryByTerritory(territoryId) {
        // First check if it's a direct country
        if (this.countries.has(territoryId)) {
            return this.countries.get(territoryId);
        }
        
        // Then check if it's a territory of a country
        for (const [countryId, country] of this.countries) {
            if (country.territories && country.territories.includes(territoryId)) {
                return country;
            }
        }
        
        return null;
    }

    showTerritoryTooltip(territory, event) {
        const country = this.getCountryByTerritory(territory.id);
        if (!country) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'territory-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-flag">${country.flag}</span>
                <strong>${country.name}</strong>
            </div>
            <div class="tooltip-content">
                <p>👥 Nüfus: ${country.population?.toLocaleString() || 'Bilinmiyor'}</p>
                <p>⚔️ Birlikler: ${country.units || 0}</p>
                <p>💰 Hazine: ${country.gold || 0} Altın</p>
                <p>🏛️ ${country.government}</p>
            </div>
        `;

        tooltip.style.position = 'fixed';
        tooltip.style.left = event.clientX + 10 + 'px';
        tooltip.style.top = event.clientY - 10 + 'px';
        tooltip.style.zIndex = '10001';

        document.body.appendChild(tooltip);
    }

    hideTerritoryTooltip() {
        document.querySelectorAll('.territory-tooltip').forEach(tooltip => tooltip.remove());
    }

    colorizeMap() {
        if (!this.gameMap) return;

        // Color territories based on controlling country
        this.countries.forEach((country, countryId) => {
            if (country.territories) {
                country.territories.forEach(territoryId => {
                    const territory = this.gameMap.getElementById(territoryId);
                    if (territory) {
                        territory.style.fill = country.color;
                        territory.style.stroke = '#000000';
                        territory.style.strokeWidth = '1px';
                    }
                });
            } else if (!country.isSubRegion) {
                // Color the main country territory
                const territory = this.gameMap.getElementById(countryId);
                if (territory) {
                    territory.style.fill = country.color;
                    territory.style.stroke = '#000000';
                    territory.style.strokeWidth = '1px';
                }
            }
        });
    }

    startGame() {
        const playerName = document.getElementById('playerNameInput').value.trim();
        if (!playerName) {
            alert('Lütfen liderinizin adını girin!');
            return;
        }

        this.playerName = playerName;
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('countrySelectionModal').style.display = 'flex';
    }

    selectPlayerCountry() {
        if (!this.selectedCountry) {
            alert('Lütfen bir devlet seçin!');
            return;
        }

        this.playerCountry = this.countries.get(this.selectedCountry);
        this.playerCountry.isPlayer = true;
        
        document.getElementById('countrySelectionModal').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        
        this.updateUI();
        this.addNotification(`${this.playerName}, ${this.playerCountry.name} liderliğini üstlendiniz!`);
        
        // Enhanced AI initialization
        this.initializeAI();
    }

    initializeAI() {
        // Set up AI personalities and initial relationships
        this.countries.forEach((country, countryId) => {
            if (!country.isPlayer && !country.isSubRegion) {
                // Initialize relationships
                country.relationships = new Map();
                
                // Set historical relationships
                this.setHistoricalRelationships(countryId);
                
                // Set AI goals based on personality
                country.aiGoals = this.generateAIGoals(country);
            }
        });
    }

    setHistoricalRelationships(countryId) {
        const country = this.countries.get(countryId);
        const historicalRelations = {
            'germany': {
                'soviet_union': -80,
                'poland': -90,
                'france': -85,
                'united_kingdom': -75,
                'italy': 60
            },
            'soviet_union': {
                'germany': -80,
                'poland': -60,
                'united_kingdom': -20,
                'france': -15
            },
            'united_kingdom': {
                'france': 70,
                'germany': -75,
                'soviet_union': -20
            },
            'france': {
                'united_kingdom': 70,
                'germany': -85,
                'italy': -30
            },
            'italy': {
                'germany': 60,
                'france': -30,
                'united_kingdom': -40
            },
            'poland': {
                'germany': -90,
                'soviet_union': -60,
                'france': 50,
                'united_kingdom': 40
            }
        };

        const relations = historicalRelations[countryId] || {};
        Object.entries(relations).forEach(([otherId, value]) => {
            country.relationships.set(otherId, value);
        });
    }

    generateAIGoals(country) {
        const goals = [];
        
        switch (country.aiPersonality) {
            case 'aggressive':
                goals.push('expand_territory', 'build_military', 'declare_wars');
                break;
            case 'defensive':
                goals.push('build_defenses', 'form_alliances', 'improve_economy');
                break;
            case 'naval_focused':
                goals.push('build_navy', 'protect_trade_routes', 'colonial_expansion');
                break;
            case 'opportunistic':
                goals.push('wait_for_weakness', 'quick_expansion', 'change_sides');
                break;
            case 'defensive_expansionist':
                goals.push('secure_borders', 'gradual_expansion', 'technological_advancement');
                break;
        }
        
        return goals;
    }

    updateUI() {
        if (!this.playerCountry) return;

        document.getElementById('playerCountryName').textContent = this.playerCountry.name;
        document.getElementById('gameYear').textContent = this.gameYear;
        document.getElementById('turnCounter').textContent = this.turnCounter;
        document.getElementById('playerCoin').textContent = this.playerCountry.gold || 0;
        document.getElementById('playerUnitsReady').textContent = this.playerCountry.units || 0;
    }

    buyUnit() {
        if (!this.playerCountry) return;

        const cost = 20;
        if (this.playerCountry.gold < cost) {
            alert('Yetersiz altın! Birlik üretmek için 20 altın gerekiyor.');
            return;
        }

        this.playerCountry.gold -= cost;
        this.playerCountry.units += 1;
        
        this.updateUI();
        this.addNotification(`Yeni birlik üretildi! Toplam birlik sayısı: ${this.playerCountry.units}`);
    }

    declareWar() {
        const targetId = document.getElementById('targetCountrySelect').value;
        if (targetId === 'none') {
            alert('Lütfen savaş ilan edeceğiniz devleti seçin!');
            return;
        }

        this.declareWarOn(targetId);
    }

    declareWarOn(targetId) {
        const target = this.countries.get(targetId);
        if (!target || !this.playerCountry) return;

        // Add to war sets
        this.playerCountry.warWith.add(targetId);
        target.warWith.add(this.playerCountry.id);
        
        // Worsen relationships
        this.playerCountry.relationships.set(targetId, -100);
        target.relationships.set(this.playerCountry.id, -100);
        
        // Remove any alliances
        this.playerCountry.alliedWith.delete(targetId);
        target.alliedWith.delete(this.playerCountry.id);

        this.addNotification(`${this.playerCountry.name}, ${target.name}'a savaş ilan etti!`);
        
        // Trigger diplomatic reactions
        this.triggerDiplomaticReactions('war_declared', this.playerCountry.id, targetId);
    }

    triggerDiplomaticReactions(eventType, actor, target) {
        this.countries.forEach((country, countryId) => {
            if (countryId === actor || countryId === target || country.isSubRegion) return;

            const relationWithActor = country.relationships.get(actor) || 0;
            const relationWithTarget = country.relationships.get(target) || 0;

            switch (eventType) {
                case 'war_declared':
                    // Countries react based on their relationships
                    if (relationWithTarget > 50) {
                        // Ally of target - consider joining war
                        if (Math.random() < 0.3) {
                            country.warWith.add(actor);
                            this.countries.get(actor).warWith.add(countryId);
                            this.addNotification(`${country.name}, ${this.countries.get(target).name} için savaşa katıldı!`);
                        }
                    } else if (relationWithActor > 50) {
                        // Ally of actor - might support
                        if (Math.random() < 0.2) {
                            this.addNotification(`${country.name}, ${this.countries.get(actor).name}'ı destekliyor.`);
                        }
                    }
                    break;
            }
        });
    }

    nextTurn() {
        this.turnCounter++;
        this.gameYear = 1936 + Math.floor((this.turnCounter - 1) / 4); // 4 turns per year
        
        // Player income
        if (this.playerCountry) {
            const income = this.calculateIncome(this.playerCountry);
            this.playerCountry.gold += income;
            this.addNotification(`Gelir: +${income} altın`);
        }

        // AI turns with enhanced logic
        this.processAITurns();
        
        // Random events
        if (Math.random() < 0.15) {
            this.triggerRandomEvent();
        }

        this.updateUI();
    }

    calculateIncome(country) {
        let baseIncome = 50;
        
        // Territory bonuses
        if (country.territories) {
            baseIncome += country.territories.length * 10;
        }
        
        // Economy modifier
        baseIncome = Math.floor(baseIncome * (country.economy / 100));
        
        // Stability modifier
        baseIncome = Math.floor(baseIncome * (country.stability / 100));
        
        return Math.max(10, baseIncome);
    }

    processAITurns() {
        this.countries.forEach((country, countryId) => {
            if (country.isPlayer || country.isSubRegion) return;

            // AI decision making based on personality and goals
            this.executeAIStrategy(country);
        });
    }

    executeAIStrategy(country) {
        // Generate income
        const income = this.calculateIncome(country);
        country.gold = (country.gold || 0) + income;

        // AI decision priorities
        const decisions = [];

        // Military buildup
        if (country.gold >= 20 && country.units < 30) {
            decisions.push({ type: 'build_unit', priority: this.calculateBuildPriority(country) });
        }

        // Declare war
        if (country.aiPersonality === 'aggressive' && country.units >= 15) {
            const target = this.findWarTarget(country);
            if (target) {
                decisions.push({ type: 'declare_war', target: target.id, priority: 0.7 });
            }
        }

        // Form alliances
        if (!country.warWith.size && country.alliedWith.size < 2) {
            const ally = this.findPotentialAlly(country);
            if (ally) {
                decisions.push({ type: 'form_alliance', target: ally.id, priority: 0.5 });
            }
        }

        // Execute highest priority decision
        if (decisions.length > 0) {
            decisions.sort((a, b) => b.priority - a.priority);
            this.executeAIDecision(country, decisions[0]);
        }
    }

    calculateBuildPriority(country) {
        let priority = 0.4;
        
        // Higher priority if at war
        if (country.warWith.size > 0) priority += 0.4;
        
        // Higher priority if aggressive
        if (country.aiPersonality === 'aggressive') priority += 0.2;
        
        // Lower priority if defensive and has enough units
        if (country.aiPersonality === 'defensive' && country.units >= 20) priority -= 0.3;
        
        return Math.max(0, Math.min(1, priority));
    }

    findWarTarget(country) {
        let bestTarget = null;
        let bestScore = -1;

        this.countries.forEach((target, targetId) => {
            if (targetId === country.id || target.isSubRegion || target.isPlayer) return;
            if (country.warWith.has(targetId) || country.alliedWith.has(targetId)) return;

            const relationship = country.relationships.get(targetId) || 0;
            const militaryDifference = country.military - target.military;
            
            let score = 0;
            
            // Prefer weak enemies
            if (militaryDifference > 10) score += 0.3;
            
            // Prefer enemies (bad relationships)
            if (relationship < -50) score += 0.4;
            
            // Historical animosity
            if ((country.id === 'germany' && targetId === 'poland') ||
                (country.id === 'germany' && targetId === 'france') ||
                (country.id === 'soviet_union' && targetId === 'poland')) {
                score += 0.5;
            }

            if (score > bestScore) {
                bestScore = score;
                bestTarget = target;
            }
        });

        return bestScore > 0.6 ? bestTarget : null;
    }

    findPotentialAlly(country) {
        let bestAlly = null;
        let bestScore = -1;

        this.countries.forEach((ally, allyId) => {
            if (allyId === country.id || ally.isSubRegion) return;
            if (country.warWith.has(allyId) || country.alliedWith.has(allyId)) return;

            const relationship = country.relationships.get(allyId) || 0;
            const ideologyMatch = this.getCountryIdeology(country) === this.getCountryIdeology(ally);
            
            let score = 0;
            
            // Prefer friends
            if (relationship > 30) score += 0.4;
            
            // Ideological compatibility
            if (ideologyMatch) score += 0.3;
            
            // Mutual enemies
            let mutualEnemies = 0;
            country.warWith.forEach(enemyId => {
                if (ally.relationships.get(enemyId) < -30) mutualEnemies++;
            });
            score += mutualEnemies * 0.2;

            if (score > bestScore) {
                bestScore = score;
                bestAlly = ally;
            }
        });

        return bestScore > 0.5 ? bestAlly : null;
    }

    executeAIDecision(country, decision) {
        switch (decision.type) {
            case 'build_unit':
                if (country.gold >= 20) {
                    country.gold -= 20;
                    country.units = (country.units || 0) + 1;
                    this.addNotification(`${country.name} yeni birlik üretti.`);
                }
                break;

            case 'declare_war':
                const target = this.countries.get(decision.target);
                if (target) {
                    country.warWith.add(decision.target);
                    target.warWith.add(country.id);
                    country.relationships.set(decision.target, -100);
                    target.relationships.set(country.id, -100);
                    this.addNotification(`${country.name}, ${target.name}'a savaş ilan etti!`);
                }
                break;

            case 'form_alliance':
                const ally = this.countries.get(decision.target);
                if (ally && Math.random() < 0.7) { // 70% acceptance chance
                    country.alliedWith.add(decision.target);
                    ally.alliedWith.add(country.id);
                    country.relationships.set(decision.target, Math.min(100, (country.relationships.get(decision.target) || 0) + 30));
                    ally.relationships.set(country.id, Math.min(100, (ally.relationships.get(country.id) || 0) + 30));
                    this.addNotification(`${country.name} ve ${ally.name} ittifak kurdu!`);
                }
                break;
        }
    }

    triggerRandomEvent() {
        const events = [
            {
                title: "Ekonomik Kriz",
                description: "Küresel ekonomik durgunluk tüm ülkeleri etkiliyor.",
                effect: () => {
                    this.countries.forEach(country => {
                        if (!country.isSubRegion) {
                            country.gold = Math.max(0, (country.gold || 0) - 50);
                            country.stability = Math.max(10, (country.stability || 50) - 10);
                        }
                    });
                }
            },
            {
                title: "Teknolojik İlerleme",
                description: "Askeri teknolojide önemli gelişmeler yaşanıyor.",
                effect: () => {
                    this.countries.forEach(country => {
                        if (!country.isSubRegion && Math.random() < 0.3) {
                            country.technology = Math.min(100, (country.technology || 50) + 15);
                            country.military = Math.min(100, (country.military || 50) + 10);
                        }
                    });
                }
            },
            {
                title: "Diplomatik Kriz",
                description: "Uluslararası gerginlik artıyor.",
                effect: () => {
                    this.countries.forEach(country => {
                        if (!country.isSubRegion) {
                            country.relationships.forEach((value, key) => {
                                if (value < 0) {
                                    country.relationships.set(key, Math.max(-100, value - 10));
                                }
                            });
                        }
                    });
                }
            },
            {
                title: "Büyük Keşif",
                description: "Doğal kaynaklar keşfedildi!",
                effect: () => {
                    const luckyCountries = Array.from(this.countries.values())
                        .filter(c => !c.isSubRegion)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 2);
                    
                    luckyCountries.forEach(country => {
                        country.gold = (country.gold || 0) + 200;
                        country.economy = Math.min(100, (country.economy || 50) + 15);
                    });
                }
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        event.effect();
        this.addNotification(`🌍 ${event.title}: ${event.description}`);
    }

    sendDiplomat(targetId) {
        const target = this.countries.get(targetId);
        if (!target || !this.playerCountry) return;

        const cost = 50;
        if (this.playerCountry.gold < cost) {
            alert('Diplomat göndermek için 50 altın gerekiyor!');
            return;
        }

        this.playerCountry.gold -= cost;
        
        // Improve relationship
        const currentRelation = this.playerCountry.relationships.get(targetId) || 0;
        const improvement = 10 + Math.floor(Math.random() * 15);
        this.playerCountry.relationships.set(targetId, Math.min(100, currentRelation + improvement));
        target.relationships.set(this.playerCountry.id, Math.min(100, (target.relationships.get(this.playerCountry.id) || 0) + improvement));

        this.addNotification(`${target.name}'a diplomat gönderildi. İlişkiler iyileşti! (+${improvement})`);
        this.updateUI();
        
        // Close country menu
        document.querySelectorAll('.country-menu').forEach(menu => menu.remove());
    }

    proposeTrade(targetId) {
        const target = this.countries.get(targetId);
        if (!target || !this.playerCountry) return;

        const tradeAmount = 100;
        if (this.playerCountry.gold < tradeAmount) {
            alert('Ticaret için yeterli altın yok!');
            return;
        }

        // Simple trade: gold for relationship improvement
        this.playerCountry.gold -= tradeAmount;
        target.gold = (target.gold || 0) + tradeAmount;
        
        const relationImprovement = 20;
        this.playerCountry.relationships.set(targetId, Math.min(100, (this.playerCountry.relationships.get(targetId) || 0) + relationImprovement));
        target.relationships.set(this.playerCountry.id, Math.min(100, (target.relationships.get(this.playerCountry.id) || 0) + relationImprovement));

        this.addNotification(`${target.name} ile ticaret anlaşması yapıldı! İlişkiler gelişti.`);
        this.updateUI();
        
        // Close country menu
        document.querySelectorAll('.country-menu').forEach(menu => menu.remove());
    }

    proposeAlliance(targetId) {
        const target = this.countries.get(targetId);
        if (!target || !this.playerCountry) return;

        const currentRelation = this.playerCountry.relationships.get(targetId) || 0;
        
        if (currentRelation < 30) {
            alert('İlişkiler ittifak için yeterince iyi değil! (En az 30 gerekli)');
            return;
        }

        if (this.playerCountry.alliedWith.has(targetId)) {
            alert('Zaten bu ülke ile ittifakınız var!');
            return;
        }

        // Alliance success chance based on relationship
        const successChance = Math.min(0.9, (currentRelation + 50) / 100);
        
        if (Math.random() < successChance) {
            this.playerCountry.alliedWith.add(targetId);
            target.alliedWith.add(this.playerCountry.id);
            
            // Further improve relationships
            this.playerCountry.relationships.set(targetId, Math.min(100, currentRelation + 25));
            target.relationships.set(this.playerCountry.id, Math.min(100, (target.relationships.get(this.playerCountry.id) || 0) + 25));
            
            this.addNotification(`${target.name} ile ittifak kuruldu! 🤝`);
        } else {
            this.addNotification(`${target.name} ittifak teklifini reddetti.`);
        }

        this.updateUI();
        
        // Close country menu
        document.querySelectorAll('.country-menu').forEach(menu => menu.remove());
    }

    conductAttack() {
        // This would handle the actual battle mechanics
        // For now, simplified version
        if (!this.attackingRegion || !this.defendingRegion) return;

        const attackPower = this.attackingRegion.units * (1 + Math.random() * 0.5);
        const defensePower = this.defendingRegion.units * (1.2 + Math.random() * 0.3); // Defender advantage

        if (attackPower > defensePower) {
            // Attacker wins
            const losses = Math.floor(this.attackingRegion.units * 0.3);
            this.attackingRegion.units -= losses;
            this.defendingRegion.units = 0;
            
            this.addNotification(`Saldırı başarılı! ${losses} birlik kaybedildi.`);
        } else {
            // Defender wins
            const losses = Math.floor(this.attackingRegion.units * 0.5);
            this.attackingRegion.units -= losses;
            
            this.addNotification(`Saldırı başarısız! ${losses} birlik kaybedildi.`);
        }

        this.closeWarModal();
        this.updateUI();
    }

    closeWarModal() {
        document.getElementById('warModal').style.display = 'none';
        this.isWarMode = false;
        this.attackingRegion = null;
        this.defendingRegion = null;
    }

    addNotification(message) {
        const notificationList = document.getElementById('notificationList');
        const li = document.createElement('li');
        li.textContent = `[Tur ${this.turnCounter}] ${message}`;
        notificationList.insertBefore(li, notificationList.firstChild);

        // Keep only last 10 notifications
        while (notificationList.children.length > 10) {
            notificationList.removeChild(notificationList.lastChild);
        }
    }

    // Map zoom functionality
    zoomMap(factor) {
        if (!this.gameMap) return;
        
        const mapObject = document.getElementById('gameMapObject');
        const currentTransform = mapObject.style.transform || 'scale(1)';
        const currentScale = parseFloat(currentTransform.match(/scale\(([^)]+)\)/)?.[1] || 1);
        const newScale = Math.max(0.5, Math.min(3, currentScale * factor));
        
        mapObject.style.transform = `scale(${newScale})`;
        mapObject.style.transformOrigin = 'center center';
        mapObject.style.transition = 'transform 0.3s ease';
    }

    resetMapZoom() {
        const mapObject = document.getElementById('gameMapObject');
        mapObject.style.transform = 'scale(1)';
        mapObject.style.transition = 'transform 0.3s ease';
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new AgeOfHistoryGame();
});

// Add enhanced CSS for new features
const additionalCSS = `
/* Country Menu Styles */
.country-menu {
    position: fixed;
    background: linear-gradient(145deg, #2d2d2d, #3a3a3a);
    border: 2px solid #d4af37;
    border-radius: 15px;
    padding: 0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 10000;
    font-family: 'Crimson Text', serif;
}

.country-menu-content {
    padding: 20px;
}

.country-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #555;
}

.country-flag-large {
    font-size: 2rem;
    margin-right: 10px;
}

.country-header h3 {
    color: #d4af37;
    font-family: 'Cinzel', serif;
    margin: 0;
    flex-grow: 1;
}

.close-menu {
    background: #8b0000;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    margin: 0;
}

.leader-section {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(26, 26, 26, 0.5);
    border-radius: 8px;
}

.leader-portrait {
    width: 60px;
    height: 72px;
    border-radius: 8px;
    margin-right: 15px;
    border: 2px solid #d4af37;
    object-fit: cover;
}

.leader-info h4 {
    color: #d4af37;
    margin: 0 0 5px 0;
    font-family: 'Cinzel', serif;
}

.leader-info p {
    color: #cccccc;
    margin: 0;
}

.government-section {
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(26, 26, 26, 0.5);
    border-radius: 8px;
}

.government-section h4 {
    color: #d4af37;
    margin-bottom: 10px;
    font-family: 'Cinzel', serif;
}

.government-select {
    width: 70%;
    padding: 8px;
    margin-right: 10px;
    background: #3a3a3a;
    color: white;
    border: 1px solid #555;
    border-radius: 4px;
}

.change-government {
    padding: 8px 15px;
    background: #d4af37;
    color: #1a1a1a;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
}

.stat-item {
    display: flex;
    align-items: center;
    padding: 10px;
    background: rgba(26, 26, 26, 0.5);
    border-radius: 6px;
    border-left: 3px solid #d4af37;
}

.stat-icon {
    font-size: 1.2rem;
    margin-right: 8px;
}

.stat-label {
    flex-grow: 1;
    color: #cccccc;
    font-size: 0.9rem;
}

.stat-value {
    color: #d4af37;
    font-weight: bold;
}

.actions-section {
    margin-bottom: 20px;
}

.actions-section h4 {
    color: #d4af37;
    margin-bottom: 10px;
    font-family: 'Cinzel', serif;
}

.action-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.action-btn {
    padding: 8px 12px;
    background: linear-gradient(145deg, #3a3a3a, #2d2d2d);
    color: white;
    border: 1px solid #555;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.3s ease;
}

.action-btn:hover {
    background: linear-gradient(145deg, #d4af37, #b8941f);
    color: #1a1a1a;
    border-color: #d4af37;
}

.war-btn {
    background: linear-gradient(145deg, #8b0000, #a00000);
    border-color: #ff4444;
}

.war-btn:hover {
    background: linear-gradient(145deg, #ff4444, #cc0000);
}

.territories-section h4 {
    color: #d4af37;
    margin-bottom: 10px;
    font-family: 'Cinzel', serif;
}

.territories-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.territory-tag {
    background: rgba(212, 175, 55, 0.2);
    color: #d4af37;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    border: 1px solid #d4af37;
}

/* Territory Tooltip */
.territory-tooltip {
    background: linear-gradient(145deg, #2d2d2d, #3a3a3a);
    border: 1px solid #d4af37;
    border-radius: 8px;
    padding: 10px;
    color: white;
    font-size: 0.9rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.7);
    pointer-events: none;
}

.tooltip-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid #555;
}

.tooltip-flag {
    font-size: 1.2rem;
    margin-right: 8px;
}

.tooltip-content p {
    margin: 3px 0;
    color: #cccccc;
}

/* Enhanced map styling */
#mapContainer {
    position: relative;
    min-height: 600px;
    background: #1a1a1a;
    border: 3px solid #d4af37;
    border-radius: 15px;
    overflow: hidden;
}

#gameMapObject {
    width: 100%;
    height: 100%;
    min-height: 600px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .country-menu {
        max-width: 95vw;
        left: 2.5vw !important;
        right: 2.5vw !important;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .action-buttons {
        grid-template-columns: 1fr;
    }
    
    .leader-section {
        flex-direction: column;
        text-align: center;
    }
    
    .leader-portrait {
        margin-right: 0;
        margin-bottom: 10px;
    }
}
`;

// Add the CSS to the page
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);