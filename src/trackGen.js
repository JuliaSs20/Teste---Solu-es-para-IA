/**
 * Lógica de Geração Procedural de Pistas
 * Gera um circuito fechado (loop) baseado em pontos aleatórios suavizados.
 */

class TrackGenerator {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.width = config.width || 2000;
        this.height = config.height || 2000;
        this.padding = config.padding || 300;
        this.pointCount = config.pointCount || 10;
        this.trackWidth = config.trackWidth || 120;
    }

    generate() {
        // 1. Gerar pontos aleatórios em torno do centro
        const center = { x: this.width / 2, y: this.height / 2 };
        const points = [];
        const radiusBasis = Math.min(this.width, this.height) / 2 - this.padding;

        for (let i = 0; i < this.pointCount; i++) {
            const angle = (i / this.pointCount) * Math.PI * 2;
            const randomRadius = radiusBasis * (0.6 + Math.random() * 0.4);

            const px = center.x + Math.cos(angle) * randomRadius;
            const py = center.y + Math.sin(angle) * randomRadius;

            points.push(new Phaser.Math.Vector2(px, py));
        }

        // 2. Criar a curva suavizada (CatmullRom) e fechar o loop
        const curve = new Phaser.Curves.CatmullRom(points, true);

        // 3. Gerar a geometria da pista (pontos para colisão e renderização)
        const trackData = {
            curve: curve,
            checkpoints: this.generateCheckpoints(curve, 8),
            outerPoints: [],
            innerPoints: []
        };

        return trackData;
    }

    generateCheckpoints(curve, count) {
        const checkpoints = [];
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const point = curve.getPoint(t);
            const tangent = curve.getTangent(t);
            // Perpendicular à tangente para linha de checkpoint
            checkpoints.push({
                x: point.x,
                y: point.y,
                angle: Math.atan2(tangent.y, tangent.x),
                reached: false
            });
        }
        return checkpoints;
    }

    // Método para desenhar a pista visualmente no canvas
    drawTrack(graphics, trackData) {
        graphics.clear();

        // Desenhar Borda da Pista (Grama/Areia)
        graphics.lineStyle(this.trackWidth + 20, 0x111111);
        trackData.curve.draw(graphics, 64);

        // Desenhar Asfalto
        graphics.lineStyle(this.trackWidth, 0x444444);
        trackData.curve.draw(graphics, 64);

        // Linha Central (Opcional)
        graphics.lineStyle(2, 0x666666, 0.5);
        trackData.curve.draw(graphics, 64);

        // Desenhar Checkpoints para Debug
        graphics.fillStyle(0xffff00, 0.3);
        trackData.checkpoints.forEach(cp => {
            graphics.fillCircle(cp.x, cp.y, 20);
        });

        // Linha de Partida
        const startPoint = trackData.curve.getPoint(0);
        const startTangent = trackData.curve.getTangent(0);
        const perp = new Phaser.Math.Vector2(-startTangent.y, startTangent.x).scale(this.trackWidth / 2);

        graphics.lineStyle(10, 0xffffff, 1);
        graphics.lineBetween(
            startPoint.x - perp.x, startPoint.y - perp.y,
            startPoint.x + perp.x, startPoint.y + perp.y
        );
    }
}

window.TrackGenerator = TrackGenerator;
