/**
 * main.js - VERSÃO COM PISTA NEON E CORES FIXAS
 */

class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene');
    }

    create() {
        // 1. PISTA NEON (Impossível não ver)
        const trackGraphics = this.add.graphics();
        trackGraphics.lineStyle(120, 0x333333); // Asfalto
        trackGraphics.strokeRect(200, 200, 3600, 3600);
        trackGraphics.lineStyle(10, 0x00ff00); // Borda Neon
        trackGraphics.strokeRect(140, 140, 3720, 3720);

        // 2. JOGADOR (VERMELHO)
        this.player = new Car(this, 500, 500, 0xff0000, true);

        // 3. INIMIGO (VERDE)
        this.enemy = new Car(this, 700, 500, 0x00ff00, false);

        // 4. CÂMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(0.8);

        // 5. CONTROLES
        this.cursors = this.input.keyboard.createCursorKeys();

        // 6. HUD
        this.add.text(20, 20, 'USE AS SETAS | ESPAÇO PARA ATIRAR', {
            fontSize: '30px',
            fill: '#fff',
            backgroundColor: '#ff0000'
        }).setScrollFactor(0).setDepth(2000);
    }

    update(time, delta) {
        this.player.update(time, delta, this.cursors);

        // IA Simples pro Inimigo não ficar parado
        this.enemy.angle += 1;
        this.enemy.body.setVelocity(
            Math.cos(Phaser.Math.DegToRad(this.enemy.angle)) * 100,
            Math.sin(Phaser.Math.DegToRad(this.enemy.angle)) * 100
        );
        this.enemy.update(time, delta, null);
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [RaceScene]
};

let game;
window.gameStart = function () {
    document.getElementById('main-menu').classList.add('hidden');
    if (!game) game = new Phaser.Game(config);
    else game.scene.restart();
};
