/**
 * main.js - VERSÃO DE EMERGÊNCIA (MODO SEGURO)
 */

class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene');
    }

    init(data) {
        this.playerUpgrades = (data && data.upgrades) ? data.upgrades : { engine: 1, armor: 1, weapon: 1 };
        this.lapCount = 0;
        this.maxLaps = 3;
        this.isGameOver = false;
        console.log("Corrida Inicializada!");
    }

    preload() {
        // Criar texturas via código IMEDIATAMENTE
        let g = this.make.graphics();

        // Jogador (Rosa)
        g.fillStyle(0xff00ff);
        g.fillRect(0, 0, 40, 20);
        g.generateTexture('car', 40, 20);
        g.clear();

        // Inimigo (Ciano)
        g.fillStyle(0x00ffff);
        g.fillRect(0, 0, 40, 20);
        g.generateTexture('enemy_car', 40, 20);
        g.clear();

        // Bala
        g.fillStyle(0xffff00);
        g.fillCircle(4, 4, 4);
        g.generateTexture('bullet', 8, 8);
        g.destroy();
    }

    create() {
        // 1. Gerar Pista
        try {
            const trackGen = new TrackGenerator(this, { width: 4000, height: 4000, pointCount: 12 });
            this.trackData = trackGen.generate();
            const g = this.add.graphics();
            trackGen.drawTrack(g, this.trackData);
        } catch (e) {
            console.error("Erro na Pista, usando fallback:", e);
        }

        // 2. Criar Carros no Ponto Zero da Pista ou no Centro se falhar
        const startX = (this.trackData) ? this.trackData.curve.getPoint(0).x : 400;
        const startY = (this.trackData) ? this.trackData.curve.getPoint(0).y : 300;

        this.player = new Car(this, startX, startY, 'car', this.playerUpgrades);
        this.enemy = new Car(this, startX + 50, startY + 50, 'enemy_car', { engine: 1 }, true);
        this.enemy.pathT = 0.05;

        // 3. Câmera
        this.cameras.main.startFollow(this.player, true, 0.2, 0.2);
        this.cameras.main.setZoom(1);

        // 4. Controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // 5. HUD de Debug
        this.debugText = this.add.text(10, 10, 'JOGO RODANDO - USE AS SETAS', {
            fontSize: '20px',
            fill: '#00ff00',
            backgroundColor: '#000'
        }).setScrollFactor(0).setDepth(2000);

        // Colisões básicas
        this.physics.add.collider(this.player, this.enemy);
    }

    update(time, delta) {
        if (this.isGameOver) return;

        this.player.update(time, delta, this.cursors);
        this.updateEnemyAI(time, delta);

        this.debugText.setText(`HP: ${Math.round(this.player.hp)} | VOLTAS: ${this.lapCount}/3`);

        // Se a volta concluir
        if (this.trackData) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y,
                this.trackData.checkpoints[this.player.checkpointIndex].x,
                this.trackData.checkpoints[this.player.checkpointIndex].y);

            if (dist < 150) {
                this.player.checkpointIndex = (this.player.checkpointIndex + 1) % this.trackData.checkpoints.length;
                if (this.player.checkpointIndex === 0) {
                    this.lapCount++;
                    if (this.lapCount >= this.maxLaps) this.finishRace();
                }
            }
        }
    }

    updateEnemyAI(time, delta) {
        if (!this.trackData) return;
        this.enemy.pathT += 0.0001 * delta;
        if (this.enemy.pathT > 1) this.enemy.pathT = 0;
        const pt = this.trackData.curve.getPoint(this.enemy.pathT);
        this.enemy.setPosition(pt.x, pt.y);
        this.enemy.update(time, delta, null);
    }

    finishRace() {
        this.isGameOver = true;
        window.addMoney(500);
        document.getElementById('result-screen').classList.remove('hidden');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#111',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [RaceScene]
};

let game;
window.gameStart = function () {
    document.getElementById('main-menu').classList.add('hidden');
    if (!game) game = new Phaser.Game(config);
    else game.scene.start('RaceScene');
};

window.openGarage = function () {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('garage-menu').classList.remove('hidden');
};
window.closeGarage = function () {
    document.getElementById('garage-menu').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
};
window.closeResults = function () {
    document.getElementById('result-screen').classList.add('hidden');
    window.openGarage();
};
