// ============================================================
// El Filibusterismo - Stage 6: The Lamp
// ============================================================
// Simoun infiltrates the reception of Paulita Gomez and
// Juanito Pelaez, and places his lamp bomb. Ends with the
// player choosing which ending path to take.
// ============================================================

class Stage6_Reception extends Phaser.Scene {

    constructor() {
        super('Stage6_Reception');
    }

    create() {
        var self = this;
        this.WORLD_WIDTH = 100 * TILE;
        this.WORLD_HEIGHT = 17 * TILE;
        this.gameStarted = false;
        this.lastGroundPos = { x: 0, y: 0 };
        this.goalReached = false;
        this.midwayDialogueDone = false;

        // Background - night city
        this.createBackground();

        // Level
        this.levelBuilder = new LevelBuilder(this);
        var mapData = this.levelBuilder.createPlatformsFromString(this.getLevelMap(), 'tile_stone');
        this.platforms = mapData.platforms;

        // Add reception floor tiles in the venue area
        for (var rx = 65; rx < 98; rx++) {
            for (var ry = 13; ry < 14; ry++) {
                this.add.image(rx * TILE + TILE / 2, ry * TILE + TILE / 2, 'tile_reception_floor').setDepth(-1);
            }
        }

        // Player - Simoun
        var pStart = mapData.playerStart || { x: 80, y: 400 };
        this.player = this.levelBuilder.createPlayer(pStart.x, pStart.y, 'sprite_simoun', {
            health: 5, speed: PLAYER_SPEED, jumpForce: PLAYER_JUMP
        });
        this.player.setDepth(500);
        this.lastGroundPos.x = pStart.x;
        this.lastGroundPos.y = pStart.y;

        this.physics.add.collider(this.player, this.platforms);
        this.abilities = this.levelBuilder.applyPlayerAbilities(this.player, this);

        // Enemies
        this.enemies = this.levelBuilder.createEnemies(
            mapData.enemies, 'sprite_guardia',
            { health: 3, speed: 55, patrol: true, patrolDistance: 100 }
        );
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyContact, null, this);
        this.physics.add.overlap(this.abilities.fireballs, this.enemies, this.onFireballHitEnemy, null, this);

        // Treasures
        this.treasureCounter = this.levelBuilder.createTreasureCounter();
        this.treasures = this.levelBuilder.createTreasures(mapData.treasures, 'sprite_treasure');
        this.physics.add.collider(this.treasures, this.platforms);
        this.physics.add.overlap(this.player, this.treasures, this.collectTreasure, null, this);

        // NPCs - Paulita and Juanito at the end
        if (mapData.npcs && mapData.npcs.length >= 2) {
            this.paulitaSprite = this.add.sprite(mapData.npcs[0].x, mapData.npcs[0].y, 'sprite_paulita').setDepth(500);
            this.juanitoSprite = this.add.sprite(mapData.npcs[1].x, mapData.npcs[1].y, 'sprite_juanito').setDepth(500);
        }

        // Goal - the gift table
        if (mapData.goal) {
            this.goalZone = this.add.rectangle(mapData.goal.x, mapData.goal.y, TILE * 2, TILE * 2, 0xff8833, 0.3);
            this.physics.add.existing(this.goalZone, true);
            this.tweens.add({ targets: this.goalZone, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });
            // Lamp visual at the goal
            this.lampIcon = this.add.sprite(mapData.goal.x, mapData.goal.y - 16, 'sprite_lamp').setDepth(510).setScale(2);
            this.tweens.add({ targets: this.lampIcon, y: mapData.goal.y - 20, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.physics.add.overlap(this.player, this.goalZone, this.onReachGoal, null, this);
        }

        // UI
        this.healthUI = this.levelBuilder.createHealthUI(this.player);
        this.objective = this.levelBuilder.createObjective('Reach the wedding reception');

        // Camera
        this.levelBuilder.setupCamera(this.player, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // Dialogue
        this.dialogueManager = new DialogueManager(this);

        // Opening
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;

        this.levelBuilder.createStageTitle('Chapter VI: The Lamp', "Simoun's terrible gift").then(function () {
            self.dialogueManager.startDialogue([
                { speaker: 'narrator', name: 'Narrator', text: "The wedding reception of Paulita Gomez and Juanito Pelaez was to be the grandest event of the season. And Simoun had prepared a very special gift..." },
                { speaker: 'simoun', name: 'Simoun', text: "Tonight, the lamp will light more than just a party. It will light the fuse of revolution." }
            ], function () {
                self.gameStarted = true;
                self.player.body.moves = true;
            });
        });
    }

    getLevelMap() {
        return [
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '..........E..........................................................E..............................',
            '..........##.....####.........##.........E.............####......##....####.........................',
            '.......................##............##........##.......................T......N.N...................',
            '..T........T......E.......T......##.......T........E.......T...............##.####..........T....G',
            '...####.......##......##.......E.....##.......##........##......##.............T....................',
            '..............T.........................................................T...........................',
            '..........E.....##..........##..........##.......##.E.......##.......##.............................',
            '....................................................................................................',
            '..P.......T...............................T........................................................',
            '....................................................................................................',
            '##############.###.####.###.####.###.####.###.##############################################.####',
            '######################################################################################################',
            '######################################################################################################',
            '######################################################################################################'
        ].join('\n');
    }

    createBackground() {
        var g = this.add.graphics();
        for (var i = 0; i < GAME_HEIGHT; i++) {
            var t = i / GAME_HEIGHT;
            var r = Math.floor(0x0a + (0x14 - 0x0a) * t);
            var gr2 = Math.floor(0x0a + (0x10 - 0x0a) * t);
            var b = Math.floor(0x2e + (0x1a - 0x2e) * t);
            g.fillStyle((r << 16) | (gr2 << 8) | b, 1);
            g.fillRect(0, i, GAME_WIDTH, 1);
        }
        g.setScrollFactor(0);
        g.setDepth(-100);

        // Stars
        for (var s = 0; s < 40; s++) {
            var star = this.add.rectangle(
                Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT * 0.5,
                2, 2, 0xffffff, 0.5 + Math.random() * 0.5
            );
            star.setScrollFactor(0.05);
            star.setDepth(-90);
            this.tweens.add({ targets: star, alpha: 0.2, duration: 1000 + Math.random() * 2000, yoyo: true, repeat: -1 });
        }
    }

    collectTreasure(player, treasure) {
        treasure.destroy();
        this.treasureCounter.increment();
    }

    onPlayerEnemyContact(player, enemy) {
        if (player.isInvincible) return;
        player.health--;
        this.healthUI.update();
        if (player.health <= 0) { this.playerDeath(); return; }
        player.isInvincible = true;
        this.tweens.add({
            targets: player, alpha: 0.3, duration: 100, yoyo: true, repeat: 7,
            onComplete: function () { player.alpha = 1; player.isInvincible = false; }
        });
        var knockDir = player.x < enemy.x ? -1 : 1;
        player.setVelocity(knockDir * 200, -200);
    }

    onFireballHitEnemy(fireball, enemy) {
        fireball.destroy();
        enemy.health = (enemy.health || 2) - FIRE_DAMAGE;
        this.tweens.add({ targets: enemy, alpha: 0.3, duration: 80, yoyo: true, repeat: 2 });
        if (enemy.health <= 0) enemy.destroy();
    }

    playerDeath() {
        this.gameStarted = false;
        this.player.body.moves = false;
        this.cameras.main.shake(300, 0.02);
        var self = this;
        this.cameras.main.fade(1000, 0, 0, 0, false, function (cam, progress) {
            if (progress === 1) self.scene.restart();
        });
    }

    onReachGoal() {
        if (this.goalReached) return;
        this.goalReached = true;
        this.gameStarted = false;
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;

        var self = this;
        this.dialogueManager.startDialogue([
            { speaker: 'paulita', name: 'Paulita Gomez', text: "Ah, Don Simoun! How generous of you to attend our celebration!" },
            { speaker: 'juanito', name: 'Juanito Pelaez', text: "And what a magnificent lamp you've brought! It will be the centerpiece!" },
            { speaker: 'simoun', name: 'Simoun', text: "Consider it a wedding gift. I trust it will... make an impression." },
            { speaker: 'narrator', name: 'Narrator', text: "Simoun placed the lamp at the center of the reception. Inside it: enough nitroglycerin to destroy everyone in the building." },
            { speaker: 'simoun', name: 'Simoun', text: "When the wick burns down, justice will be served. The corrupt, the complicit, the oppressors — all of them, gone in one flash." },
            { speaker: 'narrator', name: 'Narrator', text: "But fate had other plans. For at that very moment, a young poet named Isagani was racing toward the reception..." }
        ], function () {
            self.showEndingChoice();
        });
    }

    showEndingChoice() {
        // Save progress - unlock both endings
        var unlocked = JSON.parse(localStorage.getItem('elfili_unlocked') || '["Stage1_Intro"]');
        if (unlocked.indexOf('Stage7A_Isagani') === -1) unlocked.push('Stage7A_Isagani');
        if (unlocked.indexOf('Stage7B_Simoun') === -1) unlocked.push('Stage7B_Simoun');
        localStorage.setItem('elfili_unlocked', JSON.stringify(unlocked));

        // Dark overlay
        var overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
        overlay.setScrollFactor(0).setDepth(2000);

        // Title
        var title = this.add.text(GAME_WIDTH / 2, 100, 'CHOOSE YOUR PATH', {
            fontSize: '28px', fontFamily: 'monospace', color: '#ffd700',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

        // Option A
        var optA = this.add.text(GAME_WIDTH / 2, 220, '> A) Play as Isagani — Save the innocents\n   (Original Ending - 30 second time limit)', {
            fontSize: '18px', fontFamily: 'monospace', color: '#f0ead6', align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true });

        // Option B
        var optB = this.add.text(GAME_WIDTH / 2, 340, '> B) Play as Simoun — Let the revolution begin\n   (Alternate Ending - Full action)', {
            fontSize: '18px', fontFamily: 'monospace', color: '#aaaaaa', align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true });

        var selectedIndex = 0;
        var options = [optA, optB];
        var scenes = [STAGES.STAGE7A, STAGES.STAGE7B];

        var self = this;

        function updateSelection() {
            options.forEach(function (o, i) {
                o.setColor(i === selectedIndex ? '#ffd700' : '#aaaaaa');
            });
        }

        this.input.keyboard.on('keydown-UP', function () { selectedIndex = 0; updateSelection(); });
        this.input.keyboard.on('keydown-DOWN', function () { selectedIndex = 1; updateSelection(); });
        this.input.keyboard.on('keydown-W', function () { selectedIndex = 0; updateSelection(); });
        this.input.keyboard.on('keydown-S', function () { selectedIndex = 1; updateSelection(); });

        this.input.keyboard.on('keydown-ENTER', function () {
            self.cameras.main.fade(1000, 0, 0, 0, false, function (cam, p) {
                if (p === 1) self.scene.start(scenes[selectedIndex]);
            });
        });
        this.input.keyboard.on('keydown-SPACE', function () {
            self.cameras.main.fade(1000, 0, 0, 0, false, function (cam, p) {
                if (p === 1) self.scene.start(scenes[selectedIndex]);
            });
        });

        optA.on('pointerdown', function () {
            self.cameras.main.fade(1000, 0, 0, 0, false, function (cam, p) {
                if (p === 1) self.scene.start(STAGES.STAGE7A);
            });
        });
        optB.on('pointerdown', function () {
            self.cameras.main.fade(1000, 0, 0, 0, false, function (cam, p) {
                if (p === 1) self.scene.start(STAGES.STAGE7B);
            });
        });

        optA.on('pointerover', function () { selectedIndex = 0; updateSelection(); });
        optB.on('pointerover', function () { selectedIndex = 1; updateSelection(); });
    }

    update(time, delta) {
        if (this.dialogueManager.isActive) {
            this.dialogueManager.update();
            this.player.setVelocityX(0);
            return;
        }
        if (!this.gameStarted) return;

        // Midway dialogue
        if (!this.midwayDialogueDone && this.player.x > 50 * TILE) {
            this.midwayDialogueDone = true;
            this.gameStarted = false;
            this.player.setVelocityX(0);
            this.player.body.moves = false;
            var self = this;
            this.dialogueManager.startDialogue([
                { speaker: 'simoun', name: 'Simoun', text: "The fools celebrate while the country bleeds. Their laughter will turn to screams." }
            ], function () {
                self.gameStarted = true;
                self.player.body.moves = true;
                self.objective.update('Place the lamp at the reception');
            });
            return;
        }

        var speed = this.player.isDashing ? PLAYER_DASH_SPEED : PLAYER_SPEED;
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.player.setVelocityX(-speed);
            this.player.facingRight = false;
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.player.setVelocityX(speed);
            this.player.facingRight = true;
            this.player.setFlipX(false);
        } else if (!this.player.isDashing) {
            this.player.setVelocityX(0);
        }

        if ((this.cursors.up.isDown || this.cursors.space.isDown || this.keyW.isDown) && this.player.body.onFloor()) {
            this.player.setVelocityY(PLAYER_JUMP);
        }

        if (this.player.body.onFloor()) {
            this.lastGroundPos.x = this.player.x;
            this.lastGroundPos.y = this.player.y;
        }

        if (this.player.y > this.WORLD_HEIGHT + 50) {
            this.player.health--;
            this.healthUI.update();
            if (this.player.health <= 0) { this.playerDeath(); return; }
            this.player.setPosition(this.lastGroundPos.x, this.lastGroundPos.y - 20);
            this.player.setVelocity(0, 0);
        }
    }
}
