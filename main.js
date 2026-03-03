/**
 * main.js - VERSÃO FINAL ESTÁVEL
 */

class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene');
    }

    create() {
        // 1. PISTA (Circuito Simples para não bugar)
        const g = this.add.graphics();
        g.lineStyle(80, 0x444444);
        g.strokeRoundedRect(100, 100, 1000, 500, 50);
        g.lineStyle(5, 0x00ff00);
        g.strokeRoundedRect(95, 95, 1010, 510, 50);

        // 2. JOGADOR (VERMELHO)
        this.player = new Car(this, 300, 300, 0xff0000, true);

        // 3. INIMIGO (VERDE)
        this.enemy = new Car(this, 500, 300, 0x00ff00, false);

        // 4. CÂMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);

        // 5. TECLADO
        this.keys = {
            up: this.input.keyboard.addKey('UP'),
            down: this.input.keyboard.addKey('DOWN'),
            left: this.input.keyboard.addKey('LEFT'),
            right: this.input.keyboard.addKey('RIGHT'),
            w: this.input.keyboard.addKey('W'),
            s: this.input.keyboard.addKey('S'),
            a: this.input.keyboard.addKey('A'),
            d: this.input.keyboard.addKey('D'),
            space: this.input.keyboard.addKey('SPACE')
        };

        // 6. COLISÕES
        this.physics.add.collider(this.player, this.enemy);

        // Tiros Player -> Inimigo
        this.physics.add.overlap(this.player.bullets, this.enemy, (enemy, bullet) => {
            bullet.setActive(false).setVisible(false);
            enemy.takeDamage(20);
        });

        // Tiros Inimigo -> Player
        this.physics.add.overlap(this.enemy.bullets, this.player, (player, bullet) => {
            bullet.setActive(false).setVisible(false);
            player.takeDamage(10);
        });

        this.add.text(20, 20, 'Vovozinha, use as SETAS para dirigir e ESPAÇO para atirar!', {
            fontSize: '24px',
            fill: '#00ff00',
            backgroundColor: '#000',
            padding: 10
        }).setScrollFactor(0).setDepth(1000);
    }

    update(time, delta) {
        // Atualizar Jogador
        this.player.update(time, delta, this.keys);

        // IA do Inimigo (Persegue se estiver longe, atira se estiver perto)
        if (!this.enemy.isDead) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);

            if (dist > 250) {
                const angle = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);
                this.enemy.rotation = angle;
                this.enemy.body.velocity.x = Math.cos(angle) * 150;
                this.enemy.body.velocity.y = Math.sin(angle) * 150;
            } else {
                this.enemy.body.velocity.scale(0.9);
                if (time > this.enemy.lastFired) {
                    this.enemy.fire();
                    this.enemy.lastFired = time + 1200;
                }
            }
            this.enemy.update(time, delta, null);
        }
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
    else game.scene.scenes[0].scene.restart();
};
