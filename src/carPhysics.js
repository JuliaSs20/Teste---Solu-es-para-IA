/**
 * carPhysics.js - VERSÃO COM CONTROLES CORRIGIDOS
 */

class Car extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, color, isPlayer = false) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // CORREÇÃO CRÍTICA: Definir o tamanho do corpo físico (já que não temos imagem/texture)
        this.body.setSize(45, 25);
        this.body.setCollideWorldBounds(true);

        this.hp = 100;
        this.maxSpeed = 400;
        this.acceleration = 600;
        this.isPlayer = isPlayer;
        this.baseColor = color;
        this.hitTimer = 0;

        // Criar o retângulo visual diretamente
        this.rect = scene.add.rectangle(0, 0, 45, 25, color);
        this.rect.setStrokeStyle(3, 0xffffff);
        this.setDepth(1000);

        this.bullets = scene.physics.add.group({ classType: Bullet, maxSize: 5 });
        this.lastFired = 0;
    }

    update(time, delta, input) {
        if (this.isPlayer && input) {
            // ... (controles existentes)
            if (input.left.isDown || input.a.isDown) this.angle -= 5;
            else if (input.right.isDown || input.d.isDown) this.angle += 5;

            if (input.up.isDown || input.w.isDown) {
                const angleRad = Phaser.Math.DegToRad(this.angle);
                this.body.velocity.x += Math.cos(angleRad) * this.acceleration * delta / 1000;
                this.body.velocity.y += Math.sin(angleRad) * this.acceleration * delta / 1000;
            } else if (input.down.isDown || input.s.isDown) {
                const angleRad = Phaser.Math.DegToRad(this.angle);
                this.body.velocity.x -= Math.cos(angleRad) * (this.acceleration / 2) * delta / 1000;
                this.body.velocity.y -= Math.sin(angleRad) * (this.acceleration / 2) * delta / 1000;
            } else {
                this.body.velocity.scale(0.95);
            }

            if (input.space.isDown && time > this.lastFired) {
                this.fire();
                this.lastFired = time + 250;
            }
        }

        const curVel = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
        if (curVel.length() > this.maxSpeed) {
            curVel.setLength(this.maxSpeed);
            this.body.setVelocity(curVel.x, curVel.y);
        }

        this.rect.setPosition(this.x, this.y);
        this.rect.setRotation(this.rotation);

        // Feedback visual de dano (piscar branco)
        if (this.hitTimer > 0) {
            this.hitTimer -= delta;
            this.rect.setFillStyle(0xffffff);
        } else {
            this.rect.setFillStyle(this.baseColor);
        }
    }

    takeDamage(amount) {
        if (this.isRespawning) return;

        this.hp -= amount;
        this.hitTimer = 100; // Piscar por 100ms

        console.log(`${this.isPlayer ? 'Player' : 'Inimigo'} HP: ${this.hp}`);

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.isRespawning = true;
        this.setVisible(false);
        this.rect.setVisible(false);
        this.body.enable = false;

        // Efeito de explosão simples
        const particles = this.scene.add.particles(this.x, this.y, null, {
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            quantity: 20
        });

        this.scene.time.delayedCall(3000, () => {
            this.hp = 100;
            this.isRespawning = false;
            this.setVisible(true);
            this.rect.setVisible(true);
            this.body.enable = true;
            this.setPosition(this.isPlayer ? 1000 : 1200, 1000);
            particles.destroy();
        });
    }

    fire() {
        const bullet = this.bullets.get(this.x, this.y);
        if (bullet) {
            const rot = Phaser.Math.DegToRad(this.angle);
            bullet.fire(this.x, this.y, rot);
        }
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.physics.add.existing(this);
        this.rect = scene.add.rectangle(0, 0, 10, 5, 0xffff00);
        this.rect.setDepth(999);
    }
    fire(x, y, rot) {
        this.body.reset(x, y);
        this.setActive(true).setVisible(true);
        this.rect.setVisible(true);
        const speed = 1000;
        this.body.setVelocity(Math.cos(rot) * speed, Math.sin(rot) * speed);
        this.rotation = rot;
        this.scene.time.delayedCall(1000, () => this.destroyBullet());
    }
    destroyBullet() {
        this.setActive(false).setVisible(false);
        this.rect.setVisible(false);
        this.body.stop();
    }
    preUpdate() {
        this.rect.setPosition(this.x, this.y);
        this.rect.setRotation(this.rotation);
    }
}

window.Car = Car;
window.Bullet = Bullet;
