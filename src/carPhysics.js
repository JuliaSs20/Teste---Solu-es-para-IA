/**
 * carPhysics.js - VERSÃO SEM ERRO
 */

class Car extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, color, isPlayer = false) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.hp = 100;
        this.maxSpeed = 400;
        this.acceleration = 300;
        this.isPlayer = isPlayer;

        // Criar o retângulo visual diretamente
        this.rect = scene.add.rectangle(0, 0, 45, 25, color);
        this.rect.setStrokeStyle(3, 0xffffff);
        this.setDepth(1000);

        // Direção
        this.direction = new Phaser.Math.Vector2(1, 0);

        this.bullets = scene.physics.add.group({ classType: Bullet, maxSize: 5 });
        this.lastFired = 0;
    }

    update(time, delta, cursors) {
        if (this.isPlayer && cursors) {
            // Rotação
            if (cursors.left.isDown) this.angle -= 4;
            else if (cursors.right.isDown) this.angle += 4;

            // Aceleração
            if (cursors.up.isDown) {
                const angleRad = Phaser.Math.DegToRad(this.angle);
                this.body.velocity.x += Math.cos(angleRad) * this.acceleration * delta / 1000;
                this.body.velocity.y += Math.sin(angleRad) * this.acceleration * delta / 1000;
            } else {
                this.body.velocity.scale(0.96); // Drag
            }

            if (cursors.space.isDown && time > this.lastFired) {
                this.fire();
                this.lastFired = time + 300;
            }
        }

        // Limitar velocidade
        const curVel = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
        if (curVel.length() > this.maxSpeed) {
            curVel.setLength(this.maxSpeed);
            this.body.setVelocity(curVel.x, curVel.y);
        }

        // Sincronizar visual
        this.rect.setPosition(this.x, this.y);
        this.rect.setRotation(this.rotation);

        // Garantir que não saia do mundo
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
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
        this.rect = scene.add.rectangle(0, 0, 10, 5, 0xffff00);
    }
    fire(x, y, rot) {
        this.body.reset(x, y);
        this.setActive(true).setVisible(true);
        this.rect.setVisible(true);
        const speed = 800;
        this.body.setVelocity(Math.cos(rot) * speed, Math.sin(rot) * speed);
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
