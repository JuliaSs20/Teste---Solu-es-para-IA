/**
 * Sistema de Garagem e Loja de Upgrades
 * Gerencia a economia e o estado do jogador via localStorage.
 */

const GARAGE_STORAGE_KEY = 'racing_game_save_v1';

// Estado default
let playerState = {
    money: 1000, // Dinheiro inicial para testes rápidos
    upgrades: {
        engine: 1, // Velocidade: 1 a 10
        armor: 1,  // HP: 1 a 10
        weapon: 1  // Dano: 1 a 10
    },
    unlockedItems: []
};

// Configuração de upgrades (Preços e Valores)
const UPGRADE_CONFIG = {
    engine: { name: "Motor", basePrice: 150, multiplier: 1.5, statMultiplier: 1.1 },
    armor: { name: "Blindagem", basePrice: 100, multiplier: 1.4, statMultiplier: 1.15 },
    weapon: { name: "Armamento", basePrice: 200, multiplier: 1.6, statMultiplier: 1.2 }
};

// Funções globais expostas para o menu (acessíveis via window)
window.loadPlayerState = function () {
    const saved = localStorage.getItem(GARAGE_STORAGE_KEY);
    if (saved) {
        playerState = JSON.parse(saved);
        console.log("Estado carregado:", playerState);
    }
    updateGarageUI();
};

window.savePlayerState = function () {
    localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(playerState));
};

window.addMoney = function (amount) {
    playerState.money += amount;
    window.savePlayerState();
    updateGarageUI();
};

window.buyUpgrade = function (type) {
    const level = playerState.upgrades[type];
    const config = UPGRADE_CONFIG[type];

    if (level >= 10) {
        alert("Nível máximo atingido!");
        return;
    }

    const price = Math.round(config.basePrice * Math.pow(config.multiplier, level - 1));

    if (playerState.money >= price) {
        playerState.money -= price;
        playerState.upgrades[type]++;
        window.savePlayerState();
        updateGarageUI();
        console.log(`Comprado upgrade ${type} para o nível ${playerState.upgrades[type]}`);
    } else {
        alert("Saldo Insuficiente!");
    }
};

function updateGarageUI() {
    const moneyDisplay = document.getElementById('money-display');
    if (moneyDisplay) moneyDisplay.textContent = playerState.money;

    const upgradeTypes = ['engine', 'armor', 'weapon'];
    upgradeTypes.forEach(type => {
        const level = playerState.upgrades[type];
        const config = UPGRADE_CONFIG[type];
        const nextPrice = Math.round(config.basePrice * Math.pow(config.multiplier, level - 1));

        const btn = document.getElementById(`buy-${type}`);
        if (btn) {
            btn.textContent = level >= 10 ? "MAX" : `Subir Nível ($${nextPrice})`;
            if (level >= 10) btn.disabled = true;
        }
    });
}

// Inicializar estado ao carregar script
window.loadPlayerState();
