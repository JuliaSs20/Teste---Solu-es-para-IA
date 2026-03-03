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

        // 7. Colisões e Combate
        this.physics.add.collider(this.player, this.enemy);

        // Player atira no Inimigo
        this.physics.add.overlap(this.player.bullets, this.enemy, (enemy, bullet) => {
            enemy.takeDamage(20);
            bullet.destroyBullet(); // Função customizada para limpar rastro
        });

        // Inimigo atira no Player
        this.physics.add.overlap(this.enemy.bullets, this.player, (player, bullet) => {
            player.takeDamage(10);
            bullet.destroyBullet();
        });

        // Forçar foco no jogo
        this.input.keyboard.enabled = true;
    }

    update(time, delta) {
        this.player.update(time, delta, this.inputManager);

        // IA Melhorada: Segue o Player se estiver longe, atira se estiver perto
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);

        if (dist > 300) {
            // Persegue
            const angleToPlayer = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);
            this.enemy.rotation = Phaser.Math.Angle.RotateTo(this.enemy.rotation, angleToPlayer, 0.05);
            this.enemy.body.velocity.x = Math.cos(this.enemy.rotation) * 150;
            this.enemy.body.velocity.y = Math.sin(this.enemy.rotation) * 150;
        } else {
            // Atira
            this.enemy.body.velocity.scale(0.9);
            if (time > this.enemy.lastFired) {
                this.enemy.fire();
                this.enemy.lastFired = time + 1000;
            }
        }

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
