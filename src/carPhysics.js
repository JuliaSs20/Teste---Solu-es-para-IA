/**
 * Física e Movimentação do Carro - VERSÃO À PROVA DE FALHAS
 */

class Car extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config = {}, isEnemy = false) {
        // Tenta usar a textura, se não der, usa um fallback
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Atributos de Performance
        this.speedMultiplier = 1 + (config.engine || 1) * 0.1;
        this.maxHP = 100 + (config.armor || 1) * 15;
        this.hp = this.maxHP;
        this.damage = 10 + (config.weapon || 1) * 5;

        // Propriedades de Movimento
        this.maxSpeed = 300 * this.speedMultiplier;
        this.accelerationIncrement = 250 * this.speedMultiplier;
        this.drag = 0.95;
        this.angularDrag = 0.92;
        this.steeringSpeed = 180;

        this.velocity = new Phaser.Math.Vector2(0, 0);
        this.isRespawning = false;
        this.checkpointIndex = 0;

        // Sistema de Tiro
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true
        });

        this.lastFired = 0;
        this.fireRate = 400;

        // VISUAL: Se por algum motivo o sprite sumir, desenha um retângulo em cima dele
        this.debugRect = scene.add.rectangle(0, 0, 40, 20, isEnemy ? 0x00ffff : 0xff00ff);
        this.debugRect.setStrokeStyle(2, 0xffffff);
        this.setDepth(100);

        console.log(`Carro ${isEnemy ? 'Inimigo' : 'Player'} criado em: ${x}, ${y}`);
    }

    update(time, delta, cursors) {
        if (this.isRespawning) {
            this.setVelocity(0, 0);
            this.debugRect.setPosition(this.x, this.y);
            this.debugRect.setRotation(this.rotation);
            return;
        }

        if (cursors) {
            if (cursors.left.isDown) this.setAngularVelocity(-this.steeringSpeed);
            else if (cursors.right.isDown) this.setAngularVelocity(this.steeringSpeed);
            else this.setAngularVelocity(this.angularVelocity * this.angularDrag);

            if (cursors.up.isDown) {
                const rot = this.rotation;
                this.velocity.x += Math.cos(rot) * this.accelerationIncrement * delta / 1000;
                this.velocity.y += Math.sin(rot) * this.accelerationIncrement * delta / 1000;
            }

            if (cursors.space.isDown && time > this.lastFired) {
                this.fire();
                this.lastFired = time + this.fireRate;
            }
        }

        this.velocity.scale(this.drag);
        if (this.velocity.length() > this.maxSpeed) this.velocity.setLength(this.maxSpeed);

        this.setVelocity(this.velocity.x, this.velocity.y);

        // Atualizar posição do retângulo de debug (nosso backup visual)
        this.debugRect.setPosition(this.x, this.y);
        this.debugRect.setRotation(this.rotation);
        this.debugRect.setVisible(true);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0 && !this.isRespawning) this.respawn();
    }

    respawn() {
        this.isRespawning = true;
        this.hp = this.maxHP;
        this.setAlpha(0.5);
        this.debugRect.setAlpha(0.5);
        this.scene.time.delayedCall(3000, () => {
            this.isRespawning = false;
            this.setAlpha(1);
            this.debugRect.setAlpha(1);
        });
    }

    fire() {
        const bullet = this.bullets.get(this.x, this.y);
        if (bullet) bullet.fire(this.x, this.y, this.rotation, this.damage);
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        scene.add.existing(this);
    }
    fire(x, y, rotation, damage) {
        this.body.reset(x, y);
        this.setActive(true).setVisible(true);
        this.damage = damage;
        const speed = 700;
        this.setVelocity(Math.cos(rotation) * speed, Math.sin(rotation) * speed);
        this.scene.time.delayedCall(1500, () => { this.setActive(false).setVisible(false); });
    }
}

window.Car = Car;
window.Bullet = Bullet;
