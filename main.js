/**
 * main.js - VERSÃO COM TECLADO CORRIGIDO E FOCO AUTOMÁTICO
 */

class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene');
    }

    create() {
        // 1. PISTA NEON
        const trackGraphics = this.add.graphics();
        trackGraphics.lineStyle(200, 0x333333); // Asfalto mais largo
        trackGraphics.strokeRect(500, 500, 3000, 3000);
        trackGraphics.lineStyle(10, 0x00ff00); // Borda
        trackGraphics.strokeRect(400, 400, 3200, 3200);

        // 2. JOGADOR (VERMELHO)
        this.player = new Car(this, 1000, 1000, 0xff0000, true);

        // 3. INIMIGO (VERDE)
        this.enemy = new Car(this, 1200, 1000, 0x00ff00, false);

        // 4. CÂMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(0.7);

        // 5. CONTROLES (Setas + WASD)
        this.inputManager = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };

        // 6. HUD
        this.add.text(20, 20, 'CONTROLES: SETAS ou WASD | ESPAÇO ATIRA', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: 10
        }).setScrollFactor(0).setDepth(2000);

        // Forçar foco no jogo
        this.input.keyboard.enabled = true;
    }

    update(time, delta) {
        this.player.update(time, delta, this.inputManager);

        // IA Simples
        this.enemy.angle += 0.5;
        const rot = Phaser.Math.DegToRad(this.enemy.angle);
        this.enemy.body.setVelocity(Math.cos(rot) * 150, Math.sin(rot) * 150);
        this.enemy.update(time, delta, null);
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#111',
    physics: {
        default: 'arcade',
        arcade: { debug: false, gravity: { y: 0 } }
    },
    scene: [RaceScene]
};

let game;
window.gameStart = function () {
    document.getElementById('main-menu').classList.add('hidden');
    if (!game) {
        game = new Phaser.Game(config);
        // Garantir foco no teclado
        window.focus();
    } else {
        game.scene.scenes[0].scene.restart();
    }
};
