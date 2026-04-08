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
        this.selectedIndex = 0;
        this.showingControls = false;
        this.showingStageSelect = false;

        if (typeof AudioManager !== 'undefined') { AudioManager.stopMusic(); AudioManager.startMusic('title'); }

        this.createBackground();
        this.createLandscape();
        this.createWater();
        this.createStars();
        this.createMoon();
        this.createFireflies();
        this.createSimounDisplay();
        this.createTitleText();
        this.createMenu();

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 16, 'Based on the novel by Jos\u00e9 Rizal (1891)', {
            fontSize: '11px', fontFamily: 'serif', color: '#665544', fontStyle: 'italic'
        }).setOrigin(0.5).setAlpha(0.8);

        this.createControlsOverlay();
        this.createStageSelectOverlay();
        this.setupInput();
    }

    // -------------------------------------------------------
    // Background - rich night sky
    // -------------------------------------------------------
    createBackground() {
        var bg = this.add.graphics();
        var steps = 40;
        var stripH = Math.ceil(GAME_HEIGHT / steps);
        for (var i = 0; i < steps; i++) {
            var t = i / (steps - 1);
            var r = Math.floor(8 * (1 - t) + 2 * t);
            var g = Math.floor(6 * (1 - t) + 4 * t);
            var b = Math.floor(35 * (1 - t) + 12 * t);
            bg.fillStyle((r << 16) | (g << 8) | b, 1);
            bg.fillRect(0, i * stripH, GAME_WIDTH, stripH + 1);
        }
    }

    // -------------------------------------------------------
    // Philippine landscape silhouette
    // -------------------------------------------------------
    createLandscape() {
        var g = this.add.graphics();
        var groundY = GAME_HEIGHT - 80;

        // Distant mountains
        g.fillStyle(0x0a0a18, 1);
        g.beginPath();
        g.moveTo(0, groundY + 20);
        g.lineTo(60, groundY - 40); g.lineTo(140, groundY - 80); g.lineTo(220, groundY - 30);
        g.lineTo(300, groundY - 60); g.lineTo(380, groundY - 100); g.lineTo(460, groundY - 50);
        g.lineTo(540, groundY - 70); g.lineTo(620, groundY - 90); g.lineTo(700, groundY - 45);
        g.lineTo(780, groundY - 65); g.lineTo(860, groundY - 35); g.lineTo(GAME_WIDTH, groundY + 20);
        g.lineTo(GAME_WIDTH, GAME_HEIGHT); g.lineTo(0, GAME_HEIGHT);
        g.closePath(); g.fill();

        // Church tower silhouette
        g.fillStyle(0x080810, 1);
        g.fillRect(700, groundY - 110, 20, 110);
        g.fillRect(695, groundY - 120, 30, 12);
        g.fillRect(704, groundY - 135, 12, 18);
        // Cross on top
        g.fillRect(708, groundY - 145, 4, 14);
        g.fillRect(704, groundY - 140, 12, 3);

        // Palm trees
        var palmPositions = [120, 280, 520, 850];
        palmPositions.forEach(function (px) {
            g.fillStyle(0x060610, 1);
            g.fillRect(px, groundY - 55, 4, 55);
            // Fronds
            for (var f = -3; f <= 3; f++) {
                var fx = px + 2 + f * 14;
                var fy = groundY - 55 - Math.abs(f) * 3;
                g.beginPath();
                g.moveTo(px + 2, groundY - 55);
                g.lineTo(fx, fy - 8);
                g.lineTo(fx + (f > 0 ? 4 : -4), fy);
                g.closePath(); g.fill();
            }
        });

        // Nipa huts
        g.fillStyle(0x0c0c14, 1);
        g.fillRect(380, groundY - 20, 30, 20);
        g.beginPath(); g.moveTo(375, groundY - 20); g.lineTo(395, groundY - 38); g.lineTo(415, groundY - 20); g.closePath(); g.fill();
        g.fillRect(160, groundY - 16, 22, 16);
        g.beginPath(); g.moveTo(156, groundY - 16); g.lineTo(171, groundY - 30); g.lineTo(186, groundY - 16); g.closePath(); g.fill();

        // Foreground ground strip
        g.fillStyle(0x060610, 1);
        g.fillRect(0, groundY + 15, GAME_WIDTH, GAME_HEIGHT - groundY);
    }

    // -------------------------------------------------------
    // Animated water (Pasig river)
    // -------------------------------------------------------
    createWater() {
        var waterY = GAME_HEIGHT - 65;
        var g = this.add.graphics();
        g.fillStyle(0x0a1a30, 0.7);
        g.fillRect(0, waterY, GAME_WIDTH, 20);

        // Shimmering reflections
        for (var i = 0; i < 15; i++) {
            var rx = Phaser.Math.Between(20, GAME_WIDTH - 20);
            var rw = Phaser.Math.Between(20, 60);
            var ref = this.add.rectangle(rx, waterY + Phaser.Math.Between(2, 16), rw, 1, 0x2244aa, 0.2);
            this.tweens.add({
                targets: ref, alpha: 0.05, x: rx + Phaser.Math.Between(-10, 10),
                duration: Phaser.Math.Between(2000, 4000), yoyo: true, repeat: -1
            });
        }
    }

    // -------------------------------------------------------
    // Stars with variety
    // -------------------------------------------------------
    createStars() {
        for (var i = 0; i < 100; i++) {
            var sx = Phaser.Math.Between(0, GAME_WIDTH);
            var sy = Phaser.Math.Between(0, GAME_HEIGHT * 0.55);
            var size = Phaser.Math.Between(1, 3);
            var brightness = Phaser.Math.FloatBetween(0.15, 0.9);
            var tints = [0xffffff, 0xffeedd, 0xddddff, 0xffddaa];
            var tint = tints[Math.floor(Math.random() * tints.length)];
            var star = this.add.rectangle(sx, sy, size, size, tint);
            star.setAlpha(brightness);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.05, brightness * 0.4),
                duration: Phaser.Math.Between(800, 3000),
                yoyo: true, repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }

        // Occasional shooting star
        var scene = this;
        function shootingStar() {
            var sx2 = Phaser.Math.Between(100, GAME_WIDTH - 100);
            var sy2 = Phaser.Math.Between(20, 150);
            var ss = scene.add.rectangle(sx2, sy2, 3, 1, 0xffffff, 0.9);
            scene.tweens.add({
                targets: ss, x: sx2 + 120, y: sy2 + 60, alpha: 0, scaleX: 6,
                duration: 400, onComplete: function () { ss.destroy(); }
            });
            scene.time.delayedCall(Phaser.Math.Between(5000, 12000), shootingStar);
        }
        this.time.delayedCall(3000, shootingStar);
    }

    // -------------------------------------------------------
    // Moon with craters and glow
    // -------------------------------------------------------
    createMoon() {
        var mx = GAME_WIDTH - 140, my = 80;
        // Outer glow layers
        this.add.circle(mx, my, 60, 0x8899bb, 0.04);
        this.add.circle(mx, my, 45, 0x99aacc, 0.06);
        this.add.circle(mx, my, 32, 0xaabbdd, 0.08);
        // Moon body
        var moon = this.add.circle(mx, my, 24, 0xddeeff, 0.8);
        // Craters
        this.add.circle(mx - 6, my - 4, 4, 0xbbccdd, 0.5);
        this.add.circle(mx + 8, my + 3, 3, 0xbbccdd, 0.4);
        this.add.circle(mx - 2, my + 8, 2, 0xccddee, 0.3);
        // Soft pulse
        var glow = this.add.circle(mx, my, 35, 0x8899bb, 0.05);
        this.tweens.add({ targets: glow, scaleX: 1.2, scaleY: 1.2, alpha: 0.02, duration: 3000, yoyo: true, repeat: -1 });
    }

    // -------------------------------------------------------
    // Firefly / ember particles
    // -------------------------------------------------------
    createFireflies() {
        if (this.textures.exists('particle_fire')) {
            this.add.particles(0, 0, 'particle_fire', {
                x: { min: 0, max: GAME_WIDTH },
                y: GAME_HEIGHT + 10,
                lifespan: { min: 4000, max: 8000 },
                speedY: { min: -25, max: -10 },
                speedX: { min: -8, max: 8 },
                scale: { start: 0.7, end: 0.1 },
                alpha: { start: 0.5, end: 0 },
                frequency: 400, quantity: 1,
                blendMode: 'ADD',
                tint: [0xffd700, 0xff8800, 0xffaa33, 0xff6600]
            });
        }
    }

    // -------------------------------------------------------
    // Simoun silhouette - dramatic figure on hill
    // -------------------------------------------------------
    createSimounDisplay() {
        var cx = GAME_WIDTH / 2, cy = GAME_HEIGHT * 0.52;
        var g = this.add.graphics();

        // Hill/cliff under Simoun
        g.fillStyle(0x0a0a14, 1);
        g.beginPath();
        g.moveTo(cx - 80, cy + 50);
        g.lineTo(cx - 30, cy + 10);
        g.lineTo(cx + 30, cy + 10);
        g.lineTo(cx + 80, cy + 50);
        g.lineTo(cx + 80, GAME_HEIGHT);
        g.lineTo(cx - 80, GAME_HEIGHT);
        g.closePath(); g.fill();

        // Lantern warm glow (large, atmospheric)
        var glow1 = this.add.circle(cx + 14, cy - 14, 80, 0xff6600, 0.06);
        glow1.setBlendMode('ADD');
        var glow2 = this.add.circle(cx + 14, cy - 14, 45, 0xff8800, 0.1);
        glow2.setBlendMode('ADD');
        var glow3 = this.add.circle(cx + 14, cy - 14, 20, 0xffaa33, 0.15);
        glow3.setBlendMode('ADD');

        this.tweens.add({ targets: [glow1, glow2, glow3], alpha: '-=0.03', scaleX: 1.1, scaleY: 1.1, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Light rays from lantern
        var rayG = this.add.graphics();
        rayG.setAlpha(0.04);
        rayG.fillStyle(0xffaa44, 1);
        for (var r = 0; r < 5; r++) {
            var angle = -60 + r * 30;
            var rad = angle * Math.PI / 180;
            rayG.beginPath();
            rayG.moveTo(cx + 14, cy - 14);
            rayG.lineTo(cx + 14 + Math.cos(rad) * 120, cy - 14 + Math.sin(rad) * 120);
            rayG.lineTo(cx + 14 + Math.cos(rad + 0.15) * 120, cy - 14 + Math.sin(rad + 0.15) * 120);
            rayG.closePath(); rayG.fill();
        }
        this.tweens.add({ targets: rayG, alpha: 0.02, duration: 2000, yoyo: true, repeat: -1 });

        // Simoun figure (dark silhouette, larger and more detailed)
        var s = this.add.graphics();
        s.fillStyle(0x0a0a12, 1);
        // Hat (wide brim)
        s.fillRect(cx - 16, cy - 34, 32, 4);
        s.fillRect(cx - 10, cy - 40, 20, 7);
        // Head
        s.fillRoundedRect(cx - 8, cy - 30, 16, 16, 3);
        // Blue glasses glint
        s.fillStyle(0x4488cc, 0.6);
        s.fillRect(cx - 6, cy - 25, 4, 3);
        s.fillRect(cx + 2, cy - 25, 4, 3);
        // Body/coat
        s.fillStyle(0x0a0a12, 1);
        s.fillRect(cx - 10, cy - 14, 20, 22);
        // Cape/coat tails
        s.beginPath();
        s.moveTo(cx - 10, cy - 14);
        s.lineTo(cx - 18, cy + 8);
        s.lineTo(cx - 10, cy + 8);
        s.closePath(); s.fill();
        s.beginPath();
        s.moveTo(cx + 10, cy - 14);
        s.lineTo(cx + 18, cy + 8);
        s.lineTo(cx + 10, cy + 8);
        s.closePath(); s.fill();
        // Arm holding lantern (right arm extended)
        s.fillRect(cx + 8, cy - 10, 12, 4);
        // Lantern
        s.fillStyle(0xffaa33, 0.9);
        s.fillRect(cx + 18, cy - 18, 6, 8);
        s.fillStyle(0xffdd66, 1);
        s.fillRect(cx + 19, cy - 16, 4, 4);
        // Legs
        s.fillStyle(0x0a0a12, 1);
        s.fillRect(cx - 7, cy + 8, 6, 12);
        s.fillRect(cx + 1, cy + 8, 6, 12);
    }

    // -------------------------------------------------------
    // Title text - ornate with decorative elements
    // -------------------------------------------------------
    createTitleText() {
        var cx = GAME_WIDTH / 2;

        // Shadow layer
        this.add.text(cx + 2, 52, 'EL FILIBUSTERISMO', {
            fontSize: '36px', fontFamily: 'serif', color: '#1a1000',
            letterSpacing: 4
        }).setOrigin(0.5);

        // Main title
        this.add.text(cx, 50, 'EL FILIBUSTERISMO', {
            fontSize: '36px', fontFamily: 'serif', color: '#ffd700',
            shadow: { offsetX: 0, offsetY: 0, color: '#ffd700', blur: 16, fill: true, stroke: true },
            letterSpacing: 4
        }).setOrigin(0.5);

        // Decorative line
        var dg = this.add.graphics();
        dg.lineStyle(1, 0x8b7355, 0.6);
        dg.moveTo(cx - 180, 78); dg.lineTo(cx - 40, 78);
        dg.moveTo(cx + 40, 78); dg.lineTo(cx + 180, 78);
        dg.strokePath();
        // Diamond ornament center
        dg.fillStyle(0xffd700, 0.7);
        dg.beginPath(); dg.moveTo(cx, 74); dg.lineTo(cx + 6, 78); dg.lineTo(cx, 82); dg.lineTo(cx - 6, 78); dg.closePath(); dg.fill();
        // Small dots
        dg.fillCircle(cx - 30, 78, 1.5);
        dg.fillCircle(cx + 30, 78, 1.5);

        // Subtitle with delay
        var sub = this.add.text(cx, 94, 'The Jeweler\'s Revenge', {
            fontSize: '16px', fontFamily: 'serif', color: '#d4c8a8', fontStyle: 'italic'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: sub, alpha: 1, duration: 1200, delay: 600 });
    }

    // -------------------------------------------------------
    // Menu options
    // -------------------------------------------------------
    createMenu() {
        var centerX = GAME_WIDTH / 2;
        var startY = GAME_HEIGHT - 155;
        var spacing = 38;
        var labels = ['New Game', 'Stage Select', 'Controls'];

        this.menuItems = [];
        this.menuBgs = [];
        this.menuGroup = this.add.group();

        // Menu container background
        var menuBg = this.add.rectangle(centerX, startY + spacing, 240, spacing * 3 + 20, 0x0a0a1e, 0.6);
        menuBg.setStrokeStyle(1, 0x8b7355, 0.4);
        this.menuGroup.add(menuBg);

        for (var i = 0; i < labels.length; i++) {
            var bg = this.add.rectangle(centerX, startY + i * spacing, 200, 30, 0x1a1a2e, 0);
            bg.setStrokeStyle(1, 0x8b7355, 0);
            this.menuBgs.push(bg);
            this.menuGroup.add(bg);

            var txt = this.add.text(centerX, startY + i * spacing, labels[i], {
                fontSize: '18px', fontFamily: 'serif', color: '#f0ead6'
            }).setOrigin(0.5);

            txt.setInteractive({ useHandCursor: true });
            txt.menuIndex = i;
            txt.on('pointerdown', this.onMenuClick, this);
            txt.on('pointerover', function () { this.scene.selectMenuItem(this.menuIndex); });

            this.menuItems.push(txt);
            this.menuGroup.add(txt);
        }

        // Animated cursor arrow
        this.menuCursor = this.add.text(centerX - 110, startY, '\u25ba', {
            fontSize: '18px', fontFamily: 'serif', color: '#ffd700'
        }).setOrigin(0.5);
        this.menuGroup.add(this.menuCursor);

        this.updateMenuHighlight();
    }

    selectMenuItem(index) {
        this.selectedIndex = index;
        this.updateMenuHighlight();
    }

    updateMenuHighlight() {
        var labels = ['New Game', 'Stage Select', 'Controls'];
        var startY = GAME_HEIGHT - 155;
        var spacing = 38;

        for (var i = 0; i < this.menuItems.length; i++) {
            if (i === this.selectedIndex) {
                this.menuItems[i].setColor('#ffd700');
                this.menuItems[i].setText(labels[i]);
                this.menuBgs[i].setFillStyle(0x1a1a2e, 0.5);
                this.menuBgs[i].setStrokeStyle(1, 0xffd700, 0.4);
            } else {
                this.menuItems[i].setColor('#f0ead6');
                this.menuItems[i].setText(labels[i]);
                this.menuBgs[i].setFillStyle(0x1a1a2e, 0);
                this.menuBgs[i].setStrokeStyle(1, 0x8b7355, 0);
            }
        }

        // Move cursor
        if (this.menuCursor) {
            this.tweens.add({
                targets: this.menuCursor,
                y: startY + this.selectedIndex * spacing,
                duration: 100, ease: 'Power2'
            });
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
