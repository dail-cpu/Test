// ============================================================
// El Filibusterismo - Game Over Scene
// ============================================================

class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.stageName = (data && data.stageName) || STAGES.STAGE1;
    }

    create() {
        if (typeof AudioManager !== 'undefined') AudioManager.stopMusic();

        var self = this;
        this.selectedIndex = 0;

        // Background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 1);

        // Vignette edges
        var vig = this.add.graphics();
        vig.fillStyle(0x220000, 0.3);
        vig.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Red flicker at top
        var redGlow = this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 120, 0x440000, 0.3);
        this.tweens.add({ targets: redGlow, alpha: 0.1, duration: 1500, yoyo: true, repeat: -1 });

        // "GAME OVER" text
        var goText = this.add.text(GAME_WIDTH / 2, 140, 'GAME OVER', {
            fontSize: '48px', fontFamily: 'serif', color: '#cc2222',
            shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 20, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: goText, alpha: 1, duration: 1200, ease: 'Power2' });

        // Novel quote
        var quotes = [
            '"I die without seeing the dawn..." — Simoun',
            '"The just and the unjust suffer alike." — Padre Florentino',
            '"There are no tyrants where there are no slaves." — José Rizal',
            '"He who does not know how to look back will never reach his destination."',
            '"The glory of saving a country is not for one who helped destroy it."'
        ];
        var quote = quotes[Math.floor(Math.random() * quotes.length)];

        var quoteText = this.add.text(GAME_WIDTH / 2, 220, quote, {
            fontSize: '14px', fontFamily: 'serif', color: '#887766', fontStyle: 'italic',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: quoteText, alpha: 0.8, duration: 1000, delay: 800 });

        // Divider
        var divider = this.add.text(GAME_WIDTH / 2, 270, '— — — — —', {
            fontSize: '14px', fontFamily: 'monospace', color: '#444444'
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: divider, alpha: 1, duration: 500, delay: 1200 });

        // Menu options
        this.menuOptions = [];
        var labels = ['Try Again', 'Main Menu'];
        var startY = 320;

        for (var i = 0; i < labels.length; i++) {
            var bg = this.add.rectangle(GAME_WIDTH / 2, startY + i * 55, 260, 40, 0x1a1a2e, 0.8);
            bg.setStrokeStyle(1, 0x8b7355);
            bg.setAlpha(0);

            var txt = this.add.text(GAME_WIDTH / 2, startY + i * 55, labels[i], {
                fontSize: '20px', fontFamily: 'monospace', color: '#f0ead6'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({ targets: [bg, txt], alpha: 1, duration: 500, delay: 1500 + i * 200 });

            txt.setInteractive({ useHandCursor: true });
            txt.menuIndex = i;
            txt.on('pointerdown', function () { self.confirm(this.menuIndex); });
            txt.on('pointerover', function () { self.selectedIndex = this.menuIndex; self.updateHighlight(); });

            this.menuOptions.push({ bg: bg, txt: txt });
        }

        this.updateHighlight();

        // Input (delayed to prevent accidental skip)
        this.time.delayedCall(1500, function () {
            self.input.keyboard.on('keydown-UP', function () {
                self.selectedIndex = 0; self.updateHighlight();
            });
            self.input.keyboard.on('keydown-DOWN', function () {
                self.selectedIndex = 1; self.updateHighlight();
            });
            self.input.keyboard.on('keydown-W', function () {
                self.selectedIndex = 0; self.updateHighlight();
            });
            self.input.keyboard.on('keydown-S', function () {
                self.selectedIndex = 1; self.updateHighlight();
            });
            self.input.keyboard.on('keydown-ENTER', function () { self.confirm(self.selectedIndex); });
            self.input.keyboard.on('keydown-SPACE', function () { self.confirm(self.selectedIndex); });
        });
    }

    updateHighlight() {
        for (var i = 0; i < this.menuOptions.length; i++) {
            var opt = this.menuOptions[i];
            if (i === this.selectedIndex) {
                opt.txt.setColor('#ffd700');
                opt.txt.setText('\u25ba ' + (i === 0 ? 'Try Again' : 'Main Menu'));
                opt.bg.setStrokeStyle(2, 0xffd700);
            } else {
                opt.txt.setColor('#f0ead6');
                opt.txt.setText(i === 0 ? 'Try Again' : 'Main Menu');
                opt.bg.setStrokeStyle(1, 0x8b7355);
            }
        }
    }

    confirm(index) {
        if (this._confirmed) return;
        this._confirmed = true;
        var self = this;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', function () {
            if (index === 0) {
                self.scene.start(self.stageName);
            } else {
                self.scene.start(STAGES.TITLE);
            }
        });
    }
}
