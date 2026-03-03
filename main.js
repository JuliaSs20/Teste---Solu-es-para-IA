/**
 * Arquivo Principal do Jogo
 * Gerencia a configuração do Phaser, cenas e integração entre módulos.
 */

class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene');
    }

    init(data) {
        this.playerUpgrades = (data && data.upgrades) ? data.upgrades : { engine: 1, armor: 1, weapon: 1 };
        this.trackData = null;
        this.lapCount = 0;
        this.maxLaps = 3;
        this.isGameOver = false;
        console.log("Scene Init - Upgrades:", this.playerUpgrades);
    }

    preload() {
        // Carregar fontes ou outros assets externos se necessário
        // Vamos gerar os placeholders no create para garantir que o renderizador esteja pronto
    }

    create() {
        this.generateSimpleTextures();

        // 1. Gerar Pista Procedural
        const trackGen = new TrackGenerator(this, { width: 4000, height: 4000, pointCount: 15 });
        this.trackData = trackGen.generate();

        // 2. Visualizar Pista
        const graphics = this.add.graphics();
        trackGen.drawTrack(graphics, this.trackData);

        // 3. Criar Carros
        const startPoint = this.trackData.curve.getPoint(0);
        const startTangent = this.trackData.curve.getTangent(0);

        // Criar Jogador - Forçar visibilidade com profundidade alta
        this.player = new Car(this, startPoint.x, startPoint.y, 'car', this.playerUpgrades);
        this.player.setRotation(Math.atan2(startTangent.y, startTangent.x));
        this.player.setDepth(100);
        this.player.setVisible(true);

        // 4. Inimigo
        this.enemy = new Car(this, startPoint.x + 60, startPoint.y + 60, 'enemy_car', { engine: 1, armor: 1, weapon: 1 });
        this.enemy.pathT = 0.01;
        this.enemy.setDepth(90);

        // 5. Configurar Câmera - Seguir jogador imediatamente
        this.cameras.main.setBounds(0, 0, 4000, 4000);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(this.player.x, this.player.y);

        // 6. Controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // 7. Colisões
        this.physics.add.overlap(this.player.bullets, this.enemy, (enemy, bullet) => {
            enemy.takeDamage(bullet.damage);
            bullet.kill();
        });

        this.physics.add.overlap(this.enemy.bullets, this.player, (player, bullet) => {
            player.takeDamage(bullet.damage);
            bullet.kill();
        });

        this.physics.add.collider(this.player, this.enemy);

        // HUD Texto
        this.hudText = this.add.text(20, 20, '', {
            fontSize: '24px',
            fontFamily: 'Orbitron',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(100);

        console.log("Corrida iniciada! Jogador em:", startPoint.x, startPoint.y);
    }

    generateSimpleTextures() {
        // Se a textura já existir, não criar de novo
        if (this.textures.exists('car')) return;

        let g = this.make.graphics();

        // Jogador - ROSA NEON PARA TESTE (Impossível não ver)
        g.fillStyle(0xff00ff);
        g.fillRect(0, 0, 40, 20);
        g.lineStyle(2, 0xffffff);
        g.strokeRect(0, 0, 40, 20);
        g.generateTexture('car', 40, 20);
        g.clear();

        // Inimigo - AZUL
        g.fillStyle(0x00ffff);
        g.fillRect(0, 0, 40, 20);
        g.lineStyle(2, 0x000000);
        g.strokeRect(0, 0, 40, 20);
        g.generateTexture('enemy_car', 40, 20);
        g.clear();

        // Bala
        g.fillStyle(0xffff00);
        g.fillCircle(4, 4, 4);
        g.generateTexture('bullet', 8, 8);
        g.destroy();
        console.log("Texturas Geradas com Sucesso!");
    }

    update(time, delta) {
        if (this.isGameOver) return;

        this.player.update(time, delta, this.cursors);
        this.updateEnemyAI(time, delta);
        this.checkCheckpoints();

        // Atualizar HUD
        this.hudText.setText(`LAP: ${this.lapCount}/${this.maxLaps} | HP: ${Math.round(this.player.hp)}/${this.player.maxHP}`);
    }

    updateEnemyAI(time, delta) {
        // IA simples: Segue o caminho em 'T'
        this.enemy.pathT += 0.0001 * delta;
        if (this.enemy.pathT > 1) this.enemy.pathT = 0;

        const pt = this.trackData.curve.getPoint(this.enemy.pathT);
        const nextPt = this.trackData.curve.getPoint((this.enemy.pathT + 0.01) % 1);

        this.enemy.setPosition(pt.x, pt.y);
        this.enemy.setRotation(Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x));

        // Tenta atirar no player se estiver perto (Exemplo simples)
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
        if (dist < 400 && time > this.enemy.lastFired) {
            const rotToPlayer = Math.atan2(this.player.y - this.enemy.y, this.player.x - this.enemy.x);
            this.enemy.fire(); // Dispara na direção que está olhando
            this.enemy.lastFired = time + 1000;
        }
    }

    checkCheckpoints() {
        const distToCP = Phaser.Math.Distance.Between(this.player.x, this.player.y,
            this.trackData.checkpoints[this.player.checkpointIndex].x,
            this.trackData.checkpoints[this.player.checkpointIndex].y);

        if (distToCP < 150) {
            this.player.checkpointIndex++;
            if (this.player.checkpointIndex >= this.trackData.checkpoints.length) {
                this.player.checkpointIndex = 0;
                this.lapCount++;
                console.log("LAP CONCLUÍDA!", this.lapCount);

                if (this.lapCount >= this.maxLaps) {
                    this.finishRace();
                }
            }
        }
    }

    finishRace() {
        this.isGameOver = true;
        this.player.setVelocity(0, 0);

        // Calcular prêmio
        const prize = 500; // Base fixa ou baseada em tempo/pos
        window.addMoney(prize);

        // Mostrar Tela de Resultado
        const resultScreen = document.getElementById('result-screen');
        resultScreen.classList.remove('hidden');
        document.getElementById('result-money').textContent = `Prêmio Final: $${prize}`;
    }
}

// Configuração do Game
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#002200',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [RaceScene]
};

// Instância Global do Jogo
let game;

// Funções de Interface vinculadas ao HTML
window.gameStart = function () {
    document.getElementById('main-menu').classList.add('hidden');
    if (!game) {
        game = new Phaser.Game(config);
    } else {
        game.scene.start('RaceScene', { upgrades: playerState.upgrades });
    }
};

window.openGarage = function () {
    window.loadPlayerState();
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

window.addEventListener('resize', () => {
    if (game) game.scale.resize(window.innerWidth, window.innerHeight);
});
