/**
 * Física e Movimentação do Carro
 * Gerencia a lógica de movimentação, o sistema de tiro e colisões.
 */

class Car extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Atributos de Performance (vêem dos upgrades da Garagem)
        this.speedMultiplier = 1 + (config.engine || 1) * 0.1;
        this.maxHP = 100 + (config.armor || 1) * 15;
        this.hp = this.maxHP;
        this.damage = 10 + (config.weapon || 1) * 5;

        // Propriedades de Movimento
        this.maxSpeed = 300 * this.speedMultiplier;
        this.accelerationIncrement = 200 * this.speedMultiplier;
        this.drag = 0.95; // Simular fricção
        this.angularDrag = 0.92;
        this.steeringSpeed = 150;

        // Estado do Carro
        this.velocity = new Phaser.Math.Vector2(0, 0);
        this.isRespawning = false;
        this.currentLap = 0;
        this.checkpointIndex = 0;

        // Projéteis
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true
        });

        this.lastFired = 0;
        this.fireRate = 500; // ms

        // Visual
        this.setScale(1.2);
        this.setCollideWorldBounds(true);
    }

    update(time, delta, cursors) {
        if (this.isRespawning) {
            this.setVelocity(0, 0);
            return;
        }

        // Lógica de Steering (Direção)
        if (cursors.left.isDown) {
            this.setAngularVelocity(-this.steeringSpeed);
        } else if (cursors.right.isDown) {
            this.setAngularVelocity(this.steeringSpeed);
        } else {
            this.setAngularVelocity(this.angularVelocity * this.angularDrag);
        }

        // Aceleração Baseada no Ângulo
        if (cursors.up.isDown) {
            const rot = this.rotation;
            const forceX = Math.cos(rot) * this.accelerationIncrement * delta / 1000;
            const forceY = Math.sin(rot) * this.accelerationIncrement * delta / 1000;

            this.velocity.x += forceX;
            this.velocity.y += forceY;
        }

        // Aplicar Drag e Limitar Velocidade
        this.velocity.scale(this.drag);
        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.setLength(this.maxSpeed);
        }

        this.setVelocity(this.velocity.x, this.velocity.y);

        // Atirar
        if (cursors.space.isDown && time > this.lastFired) {
            this.fire();
            this.lastFired = time + this.fireRate;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0 && !this.isRespawning) {
            this.respawn();
        }
    }

    respawn() {
        this.isRespawning = true;
        this.hp = this.maxHP;
        this.setAlpha(0.5);
        this.setVelocity(0, 0);
        this.velocity.set(0, 0);

        console.log("CARRO DESTRUÍDO! Respawn em 3 segundos...");

        this.scene.time.delayedCall(3000, () => {
            this.isRespawning = false;
            this.setAlpha(1);
        });
    }

    fire() {
        const bullet = this.bullets.get(this.x, this.y);
        if (bullet) {
            bullet.fire(this.x, this.y, this.rotation, this.damage);
        }
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(x, y, rotation, damage) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.damage = damage;

        const speed = 600;
        this.setVelocity(Math.cos(rotation) * speed, Math.sin(rotation) * speed);
        this.setRotation(rotation);

        this.scene.time.delayedCall(2000, () => {
            this.kill();
        });
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
    }
}

window.Car = Car;
window.Bullet = Bullet;
