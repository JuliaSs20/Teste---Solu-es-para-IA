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
        this.acceleration = 600; // Aumentado para resposta rápida
        this.isPlayer = isPlayer;

        // Criar o retângulo visual diretamente
        this.rect = scene.add.rectangle(0, 0, 45, 25, color);
        this.rect.setStrokeStyle(3, 0xffffff);
        this.setDepth(1000);

        this.bullets = scene.physics.add.group({ classType: Bullet, maxSize: 5 });
        this.lastFired = 0;
    }

    update(time, delta, input) {
        if (this.isPlayer && input) {
            // Rotação (Esquerda/Direita)
            if (input.left.isDown || input.a.isDown) {
                this.angle -= 5;
            } else if (input.right.isDown || input.d.isDown) {
                this.angle += 5;
            }

            // Aceleração (Cima/Baixo ou W/S)
            if (input.up.isDown || input.w.isDown) {
                const angleRad = Phaser.Math.DegToRad(this.angle);
                this.body.velocity.x += Math.cos(angleRad) * this.acceleration * delta / 1000;
                this.body.velocity.y += Math.sin(angleRad) * this.acceleration * delta / 1000;
            } else if (input.down.isDown || input.s.isDown) {
                const angleRad = Phaser.Math.DegToRad(this.angle);
                this.body.velocity.x -= Math.cos(angleRad) * (this.acceleration / 2) * delta / 1000;
                this.body.velocity.y -= Math.sin(angleRad) * (this.acceleration / 2) * delta / 1000;
            } else {
                // Atrito (Drag) - Parar o carro se nada for apertado
                this.body.velocity.scale(0.95);
            }

            // Tiro (Espaço)
            if (input.space.isDown && time > this.lastFired) {
                this.fire();
                this.lastFired = time + 250;
            }
        }

        // Limitar velocidade máxima
        const curVel = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
        if (curVel.length() > this.maxSpeed) {
            curVel.setLength(this.maxSpeed);
            this.body.setVelocity(curVel.x, curVel.y);
        }

        // Sincronizar visual (Retângulo segue o corpo físico)
        this.rect.setPosition(this.x, this.y);
        this.rect.setRotation(this.rotation);
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
