/**
 * carPhysics.js - VERSÃO FINAL ESTÁVEL
 */

class Car extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, color, isPlayer = false) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuração Física
        this.body.setSize(40, 20);
        this.body.setCollideWorldBounds(true);

        this.hp = 100;
        this.baseColor = color;
        this.isPlayer = isPlayer;
        this.isDead = false;

        // Visual do Carro
        this.rect = scene.add.rectangle(0, 0, 40, 20, color);
        this.rect.setStrokeStyle(2, 0xffffff);
        this.setDepth(100);

        // Sistema de Tiro
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true
        });
        this.lastFired = 0;
    }

    update(time, delta, input) {
        if (this.isDead) return;

        if (this.isPlayer && input) {
            // Rotação
            if (input.left.isDown || input.a.isDown) {
                this.angle -= 4;
            } else if (input.right.isDown || input.d.isDown) {
                this.angle += 4;
            }

            // Movimento
            if (input.up.isDown || input.w.isDown) {
                const angleRad = Phaser.Math.DegToRad(this.angle);
                this.body.velocity.x += Math.cos(angleRad) * 15;
                this.body.velocity.y += Math.sin(angleRad) * 15;
            } else {
                this.body.velocity.scale(0.95); // Drag suave
            }

            // Atirar
            if (input.space.isDown && time > this.lastFired) {
                this.fire();
                this.lastFired = time + 300;
            }
        }

        // Limitar velocidade
        const speed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
        if (speed > 400) {
            this.body.velocity.scale(400 / speed);
        }

        // Sincronizar Retângulo Visual
        this.rect.setPosition(this.x, this.y);
        this.rect.setRotation(this.rotation);
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;

        // Piscar branco ao levar dano
        this.rect.setFillStyle(0xffffff);
        this.scene.time.delayedCall(50, () => {
            this.rect.setFillStyle(this.baseColor);
        });

        if (this.hp <= 0) {
            this.explode();
        }
    }

    explode() {
        this.isDead = true;
        this.setVisible(false);
        this.rect.setVisible(false);
        this.body.setVelocity(0, 0);

        // Respawn após 2 segundos
        this.scene.time.delayedCall(2000, () => {
            this.hp = 100;
            this.isDead = false;
            this.setVisible(true);
            this.rect.setVisible(true);
            this.setPosition(this.isPlayer ? 400 : 600, 300);
        });
    }

    fire() {
        const bullet = this.bullets.get(this.x, this.y);
        if (bullet) {
            bullet.fire(this.x, this.y, Phaser.Math.DegToRad(this.angle));
        }
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.physics.add.existing(this);
        this.rect = scene.add.rectangle(0, 0, 8, 4, 0xffff00);
    }

    fire(x, y, rotation) {
        this.body.reset(x, y);
        this.setActive(true).setVisible(true);
        this.rect.setVisible(true);
        this.rotation = rotation;
        this.body.velocity.x = Math.cos(rotation) * 800;
        this.body.velocity.y = Math.sin(rotation) * 800;

        this.scene.time.delayedCall(1000, () => {
            this.setActive(false).setVisible(false);
            this.rect.setVisible(false);
        });
    }

    preUpdate() {
        this.rect.setPosition(this.x, this.y);
        this.rect.setRotation(this.rotation);
    }
}

window.Car = Car;
window.Bullet = Bullet;
