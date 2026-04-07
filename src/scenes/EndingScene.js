// ============================================================
// El Filibusterismo - Ending Scene
// ============================================================
// Displays the ending based on the player's choice:
// 'canonical' - Isagani saves everyone, Simoun dies
// 'revolution' - Simoun's revolution succeeds
// ============================================================

class EndingScene extends Phaser.Scene {

    constructor() {
        super('EndingScene');
    }

    init(data) {
        this.ending = (data && data.ending) || 'canonical';
    }

    create() {
        var self = this;

        // Gentle title music for the ending
        if (typeof AudioManager !== 'undefined') AudioManager.startMusic('title');

        // Full black background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 1);

        if (this.ending === 'canonical') {
            this.showCanonicalEnding();
        } else {
            this.showRevolutionEnding();
        }
    }

    showCanonicalEnding() {
        var self = this;
        var lines = [
            { text: 'EL FILIBUSTERISMO', style: { fontSize: '32px', color: '#ffd700' }, y: 60, delay: 0 },
            { text: 'The Original Ending', style: { fontSize: '18px', color: '#cccccc' }, y: 100, delay: 500 },
            { text: '', style: { fontSize: '14px', color: '#f0ead6' }, y: 140, delay: 0 },
            { text: 'Isagani saved the innocents at the reception,', style: { fontSize: '14px', color: '#f0ead6' }, y: 170, delay: 1500 },
            { text: 'throwing the lamp bomb into the river.', style: { fontSize: '14px', color: '#f0ead6' }, y: 190, delay: 2000 },
            { text: '', style: { fontSize: '14px', color: '#f0ead6' }, y: 210, delay: 0 },
            { text: 'Simoun, wounded and broken, fled to Padre Florentino.', style: { fontSize: '14px', color: '#aaaaaa' }, y: 230, delay: 3000 },
            { text: 'He confessed his sins and died in the old priest\'s arms.', style: { fontSize: '14px', color: '#aaaaaa' }, y: 250, delay: 3500 },
            { text: '', style: { fontSize: '14px', color: '#f0ead6' }, y: 270, delay: 0 },
            { text: '"I die without seeing the dawn..."', style: { fontSize: '16px', color: '#ffd700', fontStyle: 'italic' }, y: 300, delay: 4500 },
            { text: '— Simoun (Crisostomo Ibarra)', style: { fontSize: '12px', color: '#888888' }, y: 325, delay: 5000 },
            { text: '', style: { fontSize: '14px', color: '#f0ead6' }, y: 345, delay: 0 },
            { text: 'Padre Florentino cast his jewels into the sea, praying:', style: { fontSize: '14px', color: '#cccccc' }, y: 365, delay: 6000 },
            { text: '"May these be found by a generation worthy of freedom —', style: { fontSize: '14px', color: '#f0ead6' }, y: 390, delay: 7000 },
            { text: 'not through violence, but through virtue and sacrifice."', style: { fontSize: '14px', color: '#f0ead6' }, y: 410, delay: 7500 },
        ];

        this.displayLines(lines);

        // Credits after delay
        this.time.delayedCall(10000, function () {
            self.showCredits();
        });
    }

    showRevolutionEnding() {
        var self = this;
        var lines = [
            { text: 'EL FILIBUSTERISMO', style: { fontSize: '32px', color: '#ff4444' }, y: 60, delay: 0 },
            { text: 'The Alternate Ending: Revolution', style: { fontSize: '18px', color: '#ff8844' }, y: 100, delay: 500 },
            { text: '', style: {}, y: 130, delay: 0 },
            { text: 'Simoun\'s lamp fulfilled its terrible purpose.', style: { fontSize: '14px', color: '#f0ead6' }, y: 160, delay: 1500 },
            { text: 'The corrupt officials and complicit friars perished.', style: { fontSize: '14px', color: '#f0ead6' }, y: 180, delay: 2000 },
            { text: '', style: {}, y: 200, delay: 0 },
            { text: 'From the ashes, Simoun emerged as a revolutionary leader.', style: { fontSize: '14px', color: '#ff8844' }, y: 220, delay: 3000 },
            { text: 'The people, long oppressed, rallied to his banner.', style: { fontSize: '14px', color: '#ff8844' }, y: 240, delay: 3500 },
            { text: '', style: {}, y: 260, delay: 0 },
            { text: '"The Philippines will be free, Maria Clara.', style: { fontSize: '16px', color: '#ffd700', fontStyle: 'italic' }, y: 290, delay: 5000 },
            { text: 'I kept my promise."', style: { fontSize: '16px', color: '#ffd700', fontStyle: 'italic' }, y: 315, delay: 5500 },
            { text: '— Simoun', style: { fontSize: '12px', color: '#888888' }, y: 340, delay: 6000 },
            { text: '', style: {}, y: 360, delay: 0 },
            { text: 'But at what cost? And would the revolution bring', style: { fontSize: '14px', color: '#aaaaaa' }, y: 380, delay: 7000 },
            { text: 'true freedom, or merely replace one tyranny with another?', style: { fontSize: '14px', color: '#aaaaaa' }, y: 400, delay: 7500 },
            { text: 'That is a story yet to be written...', style: { fontSize: '14px', color: '#cccccc' }, y: 425, delay: 8000 },
        ];

        this.displayLines(lines);

        this.time.delayedCall(10000, function () {
            self.showCredits();
        });
    }

    displayLines(lines) {
        var self = this;
        lines.forEach(function (line) {
            if (!line.text) return;
            var style = Object.assign({ fontFamily: 'monospace' }, line.style);
            var txt = self.add.text(GAME_WIDTH / 2, line.y, line.text, style)
                .setOrigin(0.5).setAlpha(0);
            self.tweens.add({
                targets: txt, alpha: 1, duration: 800, delay: line.delay
            });
        });
    }

    showCredits() {
        var self = this;

        // Separator
        var sep = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 110, '— — —', {
            fontSize: '14px', fontFamily: 'monospace', color: '#555555'
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: sep, alpha: 1, duration: 500 });

        // Credits
        var credits = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'Based on the novel "El Filibusterismo" by Jose Rizal (1891)', {
            fontSize: '12px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: credits, alpha: 1, duration: 500, delay: 300 });

        var thanks = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 55, 'Thank you for playing.', {
            fontSize: '14px', fontFamily: 'monospace', color: '#f0ead6'
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: thanks, alpha: 1, duration: 500, delay: 600 });

        // Return to title
        var ret = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 25, '[ Press SPACE to return to title ]', {
            fontSize: '14px', fontFamily: 'monospace', color: '#ffd700'
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: ret, alpha: 1, duration: 500, delay: 1000 });
        this.tweens.add({ targets: ret, alpha: 0.3, duration: 800, yoyo: true, repeat: -1, delay: 1500 });

        this.input.keyboard.on('keydown-SPACE', function () {
            self.scene.start(STAGES.TITLE);
        });
        this.input.on('pointerdown', function () {
            self.scene.start(STAGES.TITLE);
        });
    }
}
