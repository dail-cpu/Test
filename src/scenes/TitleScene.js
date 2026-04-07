// ============================================================
// El Filibusterismo - Title / Main Menu Scene
// ============================================================

class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
        this.menuItems = [];
        this.selectedIndex = 0;
        this.showingControls = false;
        this.showingStageSelect = false;
    }

    create() {
        // Reset state
        this.selectedIndex = 0;
        this.showingControls = false;
        this.showingStageSelect = false;

        // Start title music
        if (typeof AudioManager !== 'undefined') { AudioManager.stopMusic(); AudioManager.startMusic('title'); }

        // -- Background: dark night sky gradient --
        this.createBackground();

        // -- Twinkling stars --
        this.createStars();

        // -- Firefly / ember particles floating up --
        this.createFireflies();

        // -- Simoun silhouette with lantern glow --
        this.createSimounDisplay();

        // -- Title text --
        this.createTitleText();

        // -- Menu --
        this.createMenu();

        // -- Bottom attribution --
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'Based on the novel by Jos\u00e9 Rizal', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888877'
        }).setOrigin(0.5);

        // -- Controls overlay (hidden by default) --
        this.createControlsOverlay();

        // -- Stage select overlay (hidden by default) --
        this.createStageSelectOverlay();

        // -- Input --
        this.setupInput();
    }

    // -------------------------------------------------------
    // Background
    // -------------------------------------------------------
    createBackground() {
        var bg = this.add.graphics();
        var steps = 32;
        var stripH = Math.ceil(GAME_HEIGHT / steps);
        for (var i = 0; i < steps; i++) {
            var t = i / (steps - 1);
            // Interpolate from deep blue (top) to near-black (bottom)
            var r = Math.floor(10 * (1 - t));
            var g = Math.floor(10 * (1 - t) + 5 * (1 - t));
            var b = Math.floor(46 * (1 - t) + 10 * t);
            var color = (r << 16) | (g << 8) | b;
            bg.fillStyle(color, 1);
            bg.fillRect(0, i * stripH, GAME_WIDTH, stripH + 1);
        }
    }

    // -------------------------------------------------------
    // Twinkling stars
    // -------------------------------------------------------
    createStars() {
        this.stars = [];
        for (var i = 0; i < 60; i++) {
            var sx = Phaser.Math.Between(0, GAME_WIDTH);
            var sy = Phaser.Math.Between(0, GAME_HEIGHT * 0.6);
            var size = Phaser.Math.Between(1, 2);
            var star = this.add.rectangle(sx, sy, size, size, 0xffffff);
            star.setAlpha(Phaser.Math.FloatBetween(0.2, 0.8));
            this.stars.push(star);

            // Twinkling tween
            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.1, 0.4),
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    // -------------------------------------------------------
    // Firefly / ember particles
    // -------------------------------------------------------
    createFireflies() {
        // Use particle_fire texture as small embers floating upward
        if (this.textures.exists('particle_fire')) {
            this.fireflyEmitter = this.add.particles(0, 0, 'particle_fire', {
                x: { min: 0, max: GAME_WIDTH },
                y: GAME_HEIGHT + 10,
                lifespan: { min: 4000, max: 7000 },
                speedY: { min: -30, max: -15 },
                speedX: { min: -10, max: 10 },
                scale: { start: 0.8, end: 0.2 },
                alpha: { start: 0.6, end: 0 },
                frequency: 600,
                quantity: 1,
                blendMode: 'ADD',
                tint: [0xffd700, 0xff8800, 0xffaa33]
            });
        }
    }

    // -------------------------------------------------------
    // Simoun silhouette with lantern glow
    // -------------------------------------------------------
    createSimounDisplay() {
        var centerX = GAME_WIDTH / 2;
        var charY = GAME_HEIGHT * 0.52;

        // Lantern glow (orange circle behind the character, pulsing)
        this.lanternGlow = this.add.circle(centerX, charY - 10, 60, 0xff8800, 0.12);
        this.lanternGlow.setBlendMode('ADD');

        this.tweens.add({
            targets: this.lanternGlow,
            alpha: 0.06,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Simoun sprite scaled up 4x
        if (this.textures.exists('sprite_simoun')) {
            this.simounSprite = this.add.image(centerX, charY, 'sprite_simoun');
            this.simounSprite.setScale(4);
            // Pixelated rendering since we are scaling up pixel art
            this.simounSprite.setTexture('sprite_simoun');
        } else {
            // Fallback silhouette if sprite not yet generated
            var fallback = this.add.graphics();
            fallback.fillStyle(0x1a1a2e, 1);
            fallback.fillRect(centerX - 16, charY - 32, 32, 64);
            fallback.fillStyle(0x4488cc, 0.7);
            fallback.fillCircle(centerX, charY - 28, 6);
        }
    }

    // -------------------------------------------------------
    // Title text with glow
    // -------------------------------------------------------
    createTitleText() {
        var centerX = GAME_WIDTH / 2;

        // Title with shadow/glow effect
        this.add.text(centerX, 60, 'EL FILIBUSTERISMO', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ffd700',
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ffd700',
                blur: 12,
                fill: true,
                stroke: true
            }
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(centerX, 100, 'The Jeweler\'s Revenge', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#f0ead6'
        }).setOrigin(0.5);
    }

    // -------------------------------------------------------
    // Menu options
    // -------------------------------------------------------
    createMenu() {
        var centerX = GAME_WIDTH / 2;
        var startY = GAME_HEIGHT - 140;
        var spacing = 30;
        var labels = ['New Game', 'Stage Select', 'Controls'];

        this.menuItems = [];
        this.menuGroup = this.add.group();

        for (var i = 0; i < labels.length; i++) {
            var txt = this.add.text(centerX, startY + i * spacing, labels[i], {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#f0ead6'
            }).setOrigin(0.5);

            txt.setInteractive({ useHandCursor: true });
            txt.menuIndex = i;

            // Click handler
            txt.on('pointerdown', this.onMenuClick, this);
            txt.on('pointerover', function () {
                this.scene.selectMenuItem(this.menuIndex);
            });

            this.menuItems.push(txt);
            this.menuGroup.add(txt);
        }

        this.updateMenuHighlight();
    }

    selectMenuItem(index) {
        this.selectedIndex = index;
        this.updateMenuHighlight();
    }

    updateMenuHighlight() {
        for (var i = 0; i < this.menuItems.length; i++) {
            if (i === this.selectedIndex) {
                this.menuItems[i].setColor('#ffd700');
                this.menuItems[i].setText('> ' + this.getMenuLabel(i) + ' <');
            } else {
                this.menuItems[i].setColor('#f0ead6');
                this.menuItems[i].setText(this.getMenuLabel(i));
            }
        }
    }

    getMenuLabel(index) {
        var labels = ['New Game', 'Stage Select', 'Controls'];
        return labels[index] || '';
    }

    // -------------------------------------------------------
    // Controls overlay
    // -------------------------------------------------------
    createControlsOverlay() {
        this.controlsGroup = this.add.group();

        // Dimmed background
        var dimBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8);
        this.controlsGroup.add(dimBg);

        // Border box
        var boxW = 500;
        var boxH = 340;
        var boxX = GAME_WIDTH / 2;
        var boxY = GAME_HEIGHT / 2;

        var border = this.add.rectangle(boxX, boxY, boxW, boxH, 0x1a1a2e, 1);
        border.setStrokeStyle(2, 0x8b7355);
        this.controlsGroup.add(border);

        // Title
        var titleTxt = this.add.text(boxX, boxY - boxH / 2 + 25, 'CONTROLS', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffd700'
        }).setOrigin(0.5);
        this.controlsGroup.add(titleTxt);

        // Control lines
        var controls = [
            ['Arrow Keys / WASD', 'Move'],
            ['SPACE / W / UP', 'Jump (press twice for double jump)'],
            ['SHIFT', 'Dash'],
            ['X / J', 'Melee Attack (Walking Stick)'],
            ['C / K', 'Ranged Attack (Lantern Fire)'],
            ['SPACE', 'Advance Dialogue'],
            ['ESC', 'Pause']
        ];

        var lineY = boxY - boxH / 2 + 65;
        var lineSpacing = 34;

        for (var i = 0; i < controls.length; i++) {
            var keyText = this.add.text(boxX - boxW / 2 + 40, lineY + i * lineSpacing, controls[i][0], {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffd700'
            });
            this.controlsGroup.add(keyText);

            var descText = this.add.text(boxX + 40, lineY + i * lineSpacing, controls[i][1], {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#f0ead6'
            });
            this.controlsGroup.add(descText);
        }

        // Back hint
        var backTxt = this.add.text(boxX, boxY + boxH / 2 - 20, 'Press ESC or ENTER to go back', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888877'
        }).setOrigin(0.5);
        this.controlsGroup.add(backTxt);

        // Hide initially
        this.controlsGroup.setVisible(false);
    }

    // -------------------------------------------------------
    // Stage select overlay
    // -------------------------------------------------------
    createStageSelectOverlay() {
        this.stageSelectGroup = this.add.group();
        this.stageItems = [];
        this.stageSelectedIndex = 0;

        // Dimmed background
        var dimBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8);
        this.stageSelectGroup.add(dimBg);

        // Border box
        var boxW = 600;
        var boxH = 420;
        var boxX = GAME_WIDTH / 2;
        var boxY = GAME_HEIGHT / 2;

        var border = this.add.rectangle(boxX, boxY, boxW, boxH, 0x1a1a2e, 1);
        border.setStrokeStyle(2, 0x8b7355);
        this.stageSelectGroup.add(border);

        // Title
        var titleTxt = this.add.text(boxX, boxY - boxH / 2 + 25, 'STAGE SELECT', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffd700'
        }).setOrigin(0.5);
        this.stageSelectGroup.add(titleTxt);

        // Stage definitions
        this.stageList = [
            { key: STAGES.STAGE1, name: 'Stage 1: The Jeweler Arrives', desc: 'Simoun returns to the Philippines aboard the steamship.' },
            { key: STAGES.STAGE2, name: 'Stage 2: The Graveyard', desc: 'Basilio visits his mother\'s grave at night.' },
            { key: STAGES.STAGE3, name: 'Stage 3: The School', desc: 'Students fight for a Spanish academy.' },
            { key: STAGES.STAGE4, name: 'Stage 4: Tales of the Forest', desc: 'Cabesang Tales takes to the mountains.' },
            { key: STAGES.STAGE5, name: 'Stage 5: The Trial', desc: 'Corruption and injustice in the courts.' },
            { key: STAGES.STAGE6, name: 'Stage 6: The Reception', desc: 'The lamp at the wedding feast.' },
            { key: STAGES.STAGE7A, name: 'Stage 7A: Isagani\'s Choice', desc: 'Love triumphs over revolution.' },
            { key: STAGES.STAGE7B, name: 'Stage 7B: Simoun\'s End', desc: 'The jeweler\'s final confession.' },
            { key: STAGES.ENDING, name: 'Ending', desc: 'The sea claims the treasure.' }
        ];

        var lineY = boxY - boxH / 2 + 60;
        var lineSpacing = 36;

        // Load unlocked stages from localStorage
        var unlockedRaw = null;
        try {
            unlockedRaw = localStorage.getItem('elfili_unlocked');
        } catch (e) {
            // localStorage unavailable
        }
        var unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [STAGES.STAGE1];

        for (var i = 0; i < this.stageList.length; i++) {
            var stage = this.stageList[i];
            var isUnlocked = unlocked.indexOf(stage.key) !== -1;

            var nameTxt = this.add.text(boxX - boxW / 2 + 40, lineY + i * lineSpacing, stage.name, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: isUnlocked ? '#f0ead6' : '#555555'
            });
            this.stageSelectGroup.add(nameTxt);

            var descTxt = this.add.text(boxX - boxW / 2 + 40, lineY + i * lineSpacing + 16, isUnlocked ? stage.desc : 'LOCKED', {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: isUnlocked ? '#888877' : '#444444'
            });
            this.stageSelectGroup.add(descTxt);

            this.stageItems.push({
                nameTxt: nameTxt,
                descTxt: descTxt,
                key: stage.key,
                unlocked: isUnlocked
            });
        }

        // Back hint
        var backTxt = this.add.text(boxX, boxY + boxH / 2 - 16, 'Press ESC to go back  |  ENTER to play', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888877'
        }).setOrigin(0.5);
        this.stageSelectGroup.add(backTxt);

        // Hide initially
        this.stageSelectGroup.setVisible(false);
    }

    updateStageSelectHighlight() {
        for (var i = 0; i < this.stageItems.length; i++) {
            var item = this.stageItems[i];
            if (i === this.stageSelectedIndex) {
                item.nameTxt.setColor(item.unlocked ? '#ffd700' : '#666655');
            } else {
                item.nameTxt.setColor(item.unlocked ? '#f0ead6' : '#555555');
            }
        }
    }

    // -------------------------------------------------------
    // Input handling
    // -------------------------------------------------------
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.keyEnter.on('down', this.onConfirm, this);
        this.keySpace.on('down', this.onConfirm, this);
        this.keyEsc.on('down', this.onBack, this);

        this.cursors.up.on('down', this.onUp, this);
        this.cursors.down.on('down', this.onDown, this);
        this.keyW.on('down', this.onUp, this);
        this.keyS.on('down', this.onDown, this);
    }

    onUp() {
        if (this.showingControls) return;

        if (this.showingStageSelect) {
            this.stageSelectedIndex--;
            if (this.stageSelectedIndex < 0) this.stageSelectedIndex = this.stageList.length - 1;
            this.updateStageSelectHighlight();
        } else {
            this.selectedIndex--;
            if (this.selectedIndex < 0) this.selectedIndex = this.menuItems.length - 1;
            this.updateMenuHighlight();
        }
    }

    onDown() {
        if (this.showingControls) return;

        if (this.showingStageSelect) {
            this.stageSelectedIndex++;
            if (this.stageSelectedIndex >= this.stageList.length) this.stageSelectedIndex = 0;
            this.updateStageSelectHighlight();
        } else {
            this.selectedIndex++;
            if (this.selectedIndex >= this.menuItems.length) this.selectedIndex = 0;
            this.updateMenuHighlight();
        }
    }

    onConfirm() {
        if (this.showingControls) {
            this.hideControls();
            return;
        }

        if (this.showingStageSelect) {
            var item = this.stageItems[this.stageSelectedIndex];
            if (item && item.unlocked) {
                this.scene.start(item.key);
            }
            return;
        }

        // Main menu selection
        this.activateMenuItem(this.selectedIndex);
    }

    onBack() {
        if (this.showingControls) {
            this.hideControls();
        } else if (this.showingStageSelect) {
            this.hideStageSelect();
        }
    }

    onMenuClick(pointer, localX, localY, event) {
        this.selectedIndex = this.menuIndex;
        this.updateMenuHighlight();
        this.scene.activateMenuItem(this.menuIndex);
    }

    activateMenuItem(index) {
        switch (index) {
            case 0: // New Game
                if (typeof AudioManager !== 'undefined') { AudioManager.stopMusic(); AudioManager.startMusic('day'); }
                this.scene.start(STAGES.STAGE1);
                break;
            case 1: // Stage Select
                this.showStageSelect();
                break;
            case 2: // Controls
                this.showControls();
                break;
        }
    }

    showControls() {
        this.showingControls = true;
        this.controlsGroup.setVisible(true);
        this.menuGroup.setVisible(false);
    }

    hideControls() {
        this.showingControls = false;
        this.controlsGroup.setVisible(false);
        this.menuGroup.setVisible(true);
    }

    showStageSelect() {
        this.showingStageSelect = true;
        this.stageSelectedIndex = 0;
        this.stageSelectGroup.setVisible(true);
        this.menuGroup.setVisible(false);
        this.updateStageSelectHighlight();
    }

    hideStageSelect() {
        this.showingStageSelect = false;
        this.stageSelectGroup.setVisible(false);
        this.menuGroup.setVisible(true);
    }
}
