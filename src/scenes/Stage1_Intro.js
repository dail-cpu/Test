// ============================================================
// El Filibusterismo - Stage 1: The Return (Tutorial / Intro)
// ============================================================
// Simoun arrives in the Philippines, collects treasures across
// a coastal town, and boards the Steamship Tabo.
// ============================================================

class Stage1_Intro extends Phaser.Scene {

    constructor() {
        super('Stage1_Intro');
    }

    create() {
        var self = this;

        // -------------------------------------------------------
        // Constants for this stage
        // -------------------------------------------------------
        this.WORLD_WIDTH = 125 * TILE;   // 4000px
        this.WORLD_HEIGHT = 17 * TILE;   // 544px
        this.REQUIRED_TREASURES = 15;

        // State
        this.treasuresCollected = 0;
        this.gameStarted = false;
        this.isPaused = false;
        this.lastGroundPos = { x: 0, y: 0 };
        this.goalReached = false;

        // -------------------------------------------------------
        // Background layers
        // -------------------------------------------------------
        this.createSkyBackground();
        this.createParallaxClouds();
        this.createWaterLayer();

        // -------------------------------------------------------
        // Level builder
        // -------------------------------------------------------
        this.levelBuilder = new LevelBuilder(this);

        // -------------------------------------------------------
        // Parse the level map
        // -------------------------------------------------------
        var mapData = this.levelBuilder.createPlatformsFromString(
            this.getLevelMap(), 'tile_grass'
        );

        this.platforms = mapData.platforms;

        // Add variety tiles on top of grass base — stone and wood platforms
        this.addTileVariety();

        // Environment decorations
        this.levelBuilder.drawEnvironmentDecor('coastal', this.WORLD_WIDTH);

        // -------------------------------------------------------
        // Player
        // -------------------------------------------------------
        var pStart = mapData.playerStart || { x: 80, y: 400 };
        this.player = this.levelBuilder.createPlayer(pStart.x, pStart.y, 'sprite_simoun', {
            health: 5,
            speed: PLAYER_SPEED,
            jumpForce: PLAYER_JUMP
        });
        this.player.setDepth(500);
        this.lastGroundPos.x = pStart.x;
        this.lastGroundPos.y = pStart.y;

        // Player-platform collision
        this.physics.add.collider(this.player, this.platforms);

        // -------------------------------------------------------
        // Abilities
        // -------------------------------------------------------
        this.abilities = this.levelBuilder.applyPlayerAbilities(this.player, this);

        // -------------------------------------------------------
        // Treasures
        // -------------------------------------------------------
        this.treasures = this.levelBuilder.createTreasures(
            mapData.treasures, 'sprite_treasure'
        );
        this.physics.add.collider(this.treasures, this.platforms);
        this.physics.add.overlap(
            this.player, this.treasures,
            this.collectTreasure, null, this
        );

        // -------------------------------------------------------
        // Enemies
        // -------------------------------------------------------
        this.enemies = this.levelBuilder.createEnemies(
            mapData.enemies, 'sprite_guardia',
            { health: 2, speed: 50, patrol: true, patrolDistance: 120 }
        );
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(
            this.player, this.enemies,
            this.onPlayerEnemyContact, null, this
        );

        // Register enemies for melee hits
        this.abilities.registerEnemies(this.enemies);

        // Fireball-enemy collision
        this.physics.add.overlap(
            this.abilities.fireballs, this.enemies,
            this.onFireballHitEnemy, null, this
        );

        // -------------------------------------------------------
        // Goal zone
        // -------------------------------------------------------
        if (mapData.goal) {
            this.goalZone = this.add.rectangle(
                mapData.goal.x, mapData.goal.y,
                TILE * 2, TILE * 2, 0xffd700, 0.25
            );
            this.physics.add.existing(this.goalZone, true);

            // Pulsing glow on goal
            this.tweens.add({
                targets: this.goalZone,
                alpha: 0.5,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.physics.add.overlap(
                this.player, this.goalZone,
                this.onReachGoal, null, this
            );
        }

        // -------------------------------------------------------
        // Tutorial signs
        // -------------------------------------------------------
        this.createTutorialSigns();

        // -------------------------------------------------------
        // UI
        // -------------------------------------------------------
        this.healthUI = this.levelBuilder.createHealthUI(this.player);
        this.treasureCounter = this.levelBuilder.createTreasureCounter();
        this.objective = this.levelBuilder.createObjective(
            'Collect 15 treasures and reach the Steamship Tabo'
        );

        // -------------------------------------------------------
        // Camera
        // -------------------------------------------------------
        this.levelBuilder.setupCamera(
            this.player, this.WORLD_WIDTH, this.WORLD_HEIGHT
        );

        // -------------------------------------------------------
        // Input
        // -------------------------------------------------------
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // -------------------------------------------------------
        // Dialogue manager
        // -------------------------------------------------------
        this.dialogueManager = new DialogueManager(this);

        // -------------------------------------------------------
        // Opening sequence: title card then dialogue
        // -------------------------------------------------------
        this.gameStarted = false;
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;

        // Start stage music
        if (typeof AudioManager !== 'undefined') AudioManager.startMusic('day');

        this.levelBuilder.createStageTitle(
            'Chapter I: The Return',
            'Simoun arrives in the Philippines'
        ).then(function () {
            self.dialogueManager.startDialogue([
                {
                    speaker: 'narrator',
                    name: 'Narrator',
                    text: 'After thirteen years in exile, Crisostomo Ibarra has returned... not as the idealist who left, but as Simoun \u2014 a mysterious jeweler with a dark purpose.'
                },
                {
                    speaker: 'simoun',
                    name: 'Simoun',
                    text: 'The time has come. They will pay for what they did to this country... to Maria Clara.'
                }
            ], function () {
                self.gameStarted = true;
                self.player.body.moves = true;
            });
        });
    }

    // ===========================================================
    // LEVEL MAP
    // ===========================================================
    getLevelMap() {
        // 125 columns x 17 rows
        // Legend: # = solid, . = air, T = treasure, E = enemy,
        //         P = player start, G = goal
        //
        // Sections:
        //   Cols  0-24  : Tutorial zone (flat ground, basic gaps)
        //   Cols 25-79  : Coastal town (multi-height, water, enemies)
        //   Cols 80-124 : Steamship Tabo (ship structure, goal)

        // DESIGN RULES:
        // - Single jump reaches ~3 tiles high, double jump ~5 tiles
        // - Max gap width without dash: 4 tiles. With dash: 6 tiles.
        // - Every treasure must be on or 1-2 tiles above a reachable platform
        // - Stepping stones bridge height differences > 3 tiles
        // - Ground is rows 12-13, player starts row 11
        return [
            //         0000000000111111111122222222223333333333444444444455555555556666666666777777777788888888889999999999000000000011111111112222
            //         0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123
            /* 0  */  '.............................................................................................................................',
            /* 1  */  '.............................................................................................................................',
            /* 2  */  '.............................................................................................................................',
            /* 3  */  '.............................................................................................................................',
            /* 4  */  '.............................................................................................................................',
            /* 5  */  '.............................................................................................................................',
            /* 6  */  '..................................................T...................T...............................T........................',
            /* 7  */  '.................................................###.........T.....###.....T...................T......###..........T.........',
            /* 8  */  '.............................T.......T..........#####..E....###....#####...###.....T...........###..#####...E....###........',
            /* 9  */  '....................T.......###.....###....E...######.....#####...######..#####...###...E....#####.######.....#####........',
            /* 10 */  '...........T......####....#####...#####......#######....######..#######.######..#####......######.#######...######........',
            /* 11 */  '..P.T....####...T#####..T######..######....########...#######.########.#######.######....#######.########.########.....G.',
            /* 12 */  '###########################################################################.###.########################################.',
            /* 13 */  '###########################################################################.###.########################################.',
            /* 14 */  '###########################################################################.###.##########################################',
            /* 15 */  '##############################################################################################################.##########',
            /* 16 */  '#############################################################################################################################'
        ].join('\n');
    }

    // ===========================================================
    // TILE VARIETY — overlay stone/wood textures on specific areas
    // ===========================================================
    addTileVariety() {
        var scene = this;

        // Stone platforms in the coastal town area (cols 30-75)
        // Add stone overlay on raised platforms
        var stonePositions = [
            // Raised platforms in coastal section
            { col: 35, row: 7, w: 2, h: 1 },
            { col: 41, row: 7, w: 2, h: 1 },
            { col: 48, row: 7, w: 4, h: 1 },
            { col: 60, row: 3, w: 2, h: 1 },
            { col: 65, row: 3, w: 2, h: 1 },
            { col: 73, row: 6, w: 2, h: 1 }
        ];

        stonePositions.forEach(function (p) {
            for (var c = 0; c < p.w; c++) {
                for (var r = 0; r < p.h; r++) {
                    var x = (p.col + c) * TILE + TILE / 2;
                    var y = (p.row + r) * TILE + TILE / 2;
                    if (scene.textures.exists('tile_stone')) {
                        scene.add.image(x, y, 'tile_stone').setDepth(10);
                    }
                }
            }
        });

        // Wood platforms (bridges, walkways)
        var woodPositions = [
            { col: 18, row: 9, w: 3, h: 1 },
            { col: 27, row: 10, w: 2, h: 1 },
            { col: 55, row: 8, w: 3, h: 1 }
        ];

        woodPositions.forEach(function (p) {
            for (var c = 0; c < p.w; c++) {
                for (var r = 0; r < p.h; r++) {
                    var x = (p.col + c) * TILE + TILE / 2;
                    var y = (p.row + r) * TILE + TILE / 2;
                    if (scene.textures.exists('tile_wood')) {
                        scene.add.image(x, y, 'tile_wood').setDepth(10);
                    }
                }
            }
        });

        // Ship deck tiles (cols 85-124)
        for (var col = 85; col < 125; col++) {
            for (var row = 10; row < 16; row++) {
                var x = col * TILE + TILE / 2;
                var y = row * TILE + TILE / 2;
                if (scene.textures.exists('tile_ship_deck')) {
                    scene.add.image(x, y, 'tile_ship_deck').setDepth(10);
                }
            }
        }
    }

    // ===========================================================
    // SKY BACKGROUND (gradient)
    // ===========================================================
    createSkyBackground() {
        var bg = this.add.graphics();
        bg.setScrollFactor(0);
        bg.setDepth(-100);

        var steps = 20;
        var stripH = Math.ceil(GAME_HEIGHT / steps);

        for (var i = 0; i < steps; i++) {
            var t = i / (steps - 1);
            // Light blue at top to deeper blue at bottom
            var r = Math.floor(100 + 55 * (1 - t));
            var g = Math.floor(160 + 40 * (1 - t));
            var b = Math.floor(220 + 35 * (1 - t));
            r = Math.min(255, r);
            g = Math.min(255, g);
            b = Math.min(255, b);
            var color = (r << 16) | (g << 8) | b;
            bg.fillStyle(color, 1);
            bg.fillRect(0, i * stripH, GAME_WIDTH, stripH + 1);
        }
    }

    // ===========================================================
    // PARALLAX CLOUDS
    // ===========================================================
    createParallaxClouds() {
        this.clouds = [];
        var cloudColors = [0xffffff, 0xeeeeff, 0xddddee];

        for (var i = 0; i < 8; i++) {
            var cx = Phaser.Math.Between(0, this.WORLD_WIDTH || 4000);
            var cy = Phaser.Math.Between(20, 120);
            var cw = Phaser.Math.Between(60, 140);
            var ch = Phaser.Math.Between(16, 30);
            var color = Phaser.Utils.Array.GetRandom(cloudColors);

            var cloud = this.add.rectangle(cx, cy, cw, ch, color, 0.6);
            cloud.setDepth(-90);
            cloud.setScrollFactor(0.2, 0);

            // Additional lobe to make cloud shape
            var lobe = this.add.rectangle(
                cx + Phaser.Math.Between(-20, 20),
                cy - ch * 0.3,
                cw * 0.6, ch * 0.7,
                color, 0.5
            );
            lobe.setDepth(-90);
            lobe.setScrollFactor(0.2, 0);

            cloud.speedX = Phaser.Math.FloatBetween(0.1, 0.4);
            lobe.speedX = cloud.speedX;

            this.clouds.push(cloud);
            this.clouds.push(lobe);
        }
    }

    // ===========================================================
    // WATER LAYER at bottom with wave animation
    // ===========================================================
    createWaterLayer() {
        // Water fills the very bottom of the world
        var waterY = 16 * TILE;  // row 16

        this.waterGraphics = this.add.graphics();
        this.waterGraphics.setDepth(5);

        // Draw base water across entire world width
        this.waterGraphics.fillStyle(COLORS.WATER_RIVER, 0.8);
        this.waterGraphics.fillRect(0, waterY, this.WORLD_WIDTH || 4000, TILE * 2);

        // Lighter wave line on top
        this.waterGraphics.fillStyle(0x4499cc, 0.5);
        this.waterGraphics.fillRect(0, waterY, this.WORLD_WIDTH || 4000, 4);

        // Wave surface rectangles for animation
        this.waves = [];
        for (var wx = 0; wx < (this.WORLD_WIDTH || 4000); wx += 40) {
            var wave = this.add.rectangle(
                wx + 20, waterY - 2,
                30, 4, 0x66bbdd, 0.6
            );
            wave.setDepth(6);
            wave.originWX = wx + 20;

            this.tweens.add({
                targets: wave,
                y: waterY + 2,
                duration: 1200 + Math.random() * 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Math.random() * 1000
            });

            this.waves.push(wave);
        }
    }

    // ===========================================================
    // TUTORIAL SIGNS (floating text hints)
    // ===========================================================
    createTutorialSigns() {
        var signs = [
            { x: 3 * TILE, y: 9 * TILE, text: 'Arrow Keys: Move' },
            { x: 8 * TILE, y: 8 * TILE, text: 'SPACE: Jump (x2!)' },
            { x: 14 * TILE, y: 7 * TILE, text: 'SHIFT: Dash' },
            { x: 19 * TILE, y: 8 * TILE, text: 'X: Melee Attack' },
            { x: 23 * TILE, y: 8 * TILE, text: 'C: Ranged Fire' }
        ];

        var scene = this;
        signs.forEach(function (s) {
            // Sign post sprite if available
            if (scene.textures.exists('sprite_sign')) {
                var signSprite = scene.add.image(s.x, s.y + TILE, 'sprite_sign');
                signSprite.setDepth(50);
            }

            // Floating tutorial text
            var txt = scene.add.text(s.x, s.y - 8, s.text, {
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#ffd700',
                backgroundColor: '#1a1a2ecc',
                padding: { x: 6, y: 3 },
                stroke: '#000000',
                strokeThickness: 1
            });
            txt.setOrigin(0.5);
            txt.setDepth(100);

            // Gentle bob
            scene.tweens.add({
                targets: txt,
                y: s.y - 14,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    // ===========================================================
    // TREASURE COLLECTION
    // ===========================================================
    collectTreasure(player, treasure) {
        if (!treasure.active) return;

        treasure.destroy();
        this.treasuresCollected++;
        this.treasureCounter.increment();

        // Brief flash on player
        this.tweens.add({
            targets: player,
            alpha: 0.5,
            duration: 80,
            yoyo: true
        });

        // Update objective text when close to goal
        if (this.treasuresCollected >= this.REQUIRED_TREASURES) {
            this.objective.update('Go to the Steamship Tabo!');
        } else {
            var remaining = this.REQUIRED_TREASURES - this.treasuresCollected;
            this.objective.update(
                'Collect ' + remaining + ' more treasure' +
                (remaining !== 1 ? 's' : '') + ' to reach the Tabo'
            );
        }
    }

    // ===========================================================
    // ENEMY CONTACT
    // ===========================================================
    onPlayerEnemyContact(player, enemy) {
        if (!player.active || !enemy.active) return;
        if (player.isInvincible) return;

        this.damagePlayer(1);
    }

    onFireballHitEnemy(fireball, enemy) {
        if (!fireball.active || !enemy.active) return;

        fireball.destroy();

        enemy.health -= FIRE_DAMAGE;
        if (enemy.health <= 0) {
            if (typeof AudioManager !== 'undefined') AudioManager.sfxEnemyDeath();
            // Death flash
            this.tweens.add({
                targets: enemy,
                alpha: 0,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                onComplete: function () {
                    enemy.destroy();
                }
            });
        } else {
            // Hit flash
            enemy.setTint(0xff0000);
            var scene = this;
            this.time.delayedCall(150, function () {
                if (enemy.active) enemy.clearTint();
            });
        }
    }

    // ===========================================================
    // PLAYER DAMAGE & DEATH
    // ===========================================================
    damagePlayer(amount) {
        if (this.player.isInvincible || !this.player.active) return;

        this.player.health -= amount;
        this.player.isInvincible = true;
        this.healthUI.update();
        if (typeof AudioManager !== 'undefined') AudioManager.sfxHit();

        // Knockback
        var kbDir = this.player.facingRight ? -1 : 1;
        this.player.setVelocityX(150 * kbDir);
        this.player.setVelocityY(-150);

        // Invincibility flash for 1.5 seconds
        var flashTween = this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 7
        });

        var self = this;
        this.time.delayedCall(1500, function () {
            if (self.player.active) {
                self.player.isInvincible = false;
                self.player.setAlpha(1);
            }
        });

        // Check death
        if (this.player.health <= 0) {
            this.onPlayerDeath();
        }
    }

    onPlayerDeath() {
        if (typeof AudioManager !== 'undefined') AudioManager.sfxGameOver();
        this.player.active = false;
        this.player.body.moves = false;
        this.player.setAlpha(0.4);

        var self = this;
        this.cameras.main.fade(800, 0, 0, 0, false, function (cam, progress) {
            if (progress >= 1) {
                self.scene.start(STAGES.GAMEOVER, { stageName: 'Stage1_Intro' });
            }
        });
    }

    respawnPlayer() {
        this.player.setPosition(this.lastGroundPos.x, this.lastGroundPos.y - TILE);
        this.player.setVelocity(0, 0);
        this.damagePlayer(1);
    }

    // ===========================================================
    // GOAL REACHED
    // ===========================================================
    onReachGoal(player, goalZone) {
        if (this.goalReached) return;

        if (this.treasuresCollected < this.REQUIRED_TREASURES) {
            // Show a brief hint — not enough treasures
            if (!this._goalHintShown) {
                this._goalHintShown = true;
                var hintText = this.add.text(
                    goalZone.x, goalZone.y - 40,
                    'Need ' + (this.REQUIRED_TREASURES - this.treasuresCollected) + ' more treasures!',
                    {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#ff6666',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                );
                hintText.setOrigin(0.5);
                hintText.setDepth(800);

                var self = this;
                this.time.delayedCall(2000, function () {
                    hintText.destroy();
                    self._goalHintShown = false;
                });
            }
            return;
        }

        // Stage complete!
        this.goalReached = true;
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;
        this.objective.complete();
        if (typeof AudioManager !== 'undefined') AudioManager.sfxStageComplete();

        var self = this;

        this.dialogueManager.startDialogue([
            {
                speaker: 'simoun',
                name: 'Simoun',
                text: 'The Tabo will carry me up the Pasig River... and closer to my revenge.'
            },
            {
                speaker: 'narrator',
                name: 'Narrator',
                text: 'Aboard the steamship, Simoun began to weave his web of conspiracy...'
            }
        ], function () {
            // Save progress
            try {
                localStorage.setItem('elfili_unlocked',
                    JSON.stringify(['Stage1_Intro', 'Stage2_Graveyard'])
                );
            } catch (e) {
                // localStorage may be unavailable
            }

            // Transition to next stage
            self.cameras.main.fade(1000, 0, 0, 0, false, function (cam, progress) {
                if (progress >= 1) {
                    self.scene.start('Stage2_Graveyard');
                }
            });
        });
    }

    // ===========================================================
    // UPDATE LOOP
    // ===========================================================
    update(time, delta) {
        // --- Dialogue takes priority ---
        if (this.dialogueManager && this.dialogueManager.isActive) {
            this.dialogueManager.update();
            // Freeze player during dialogue
            if (this.player.active && this.player.body) {
                this.player.setVelocityX(0);
            }
            return;
        }

        // --- Don't process input until game has started ---
        if (!this.gameStarted || !this.player.active) return;

        // --- Pause toggle ---
        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.isPaused = !this.isPaused;
            this.physics.world.isPaused = this.isPaused;
            // Could show pause overlay here
        }
        if (this.isPaused) return;

        // --- Movement ---
        var onGround = this.player.body.blocked.down;
        var speed = this.player.speed || PLAYER_SPEED;

        if (!this.player.isDashing) {
            // Horizontal
            if (this.cursors.left.isDown || this.keyA.isDown) {
                this.player.setVelocityX(-speed);
                this.player.facingRight = false;
                this.player.setFlipX(true);
            } else if (this.cursors.right.isDown || this.keyD.isDown) {
                this.player.setVelocityX(speed);
                this.player.facingRight = true;
                this.player.setFlipX(false);
            } else {
                this.player.setVelocityX(0);
            }

            // Jump (with double jump)
            var jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                Phaser.Input.Keyboard.JustDown(this.keyW);
            LevelBuilder.handleJump(this.player, jumpPressed);
        }

        // Walk animation
        LevelBuilder.updateWalkAnimation(this.player, time);

        // Reset jump count on ground
        if (onGround) {
            this.player.jumpCount = 0;
            this.player.hasDoubleJumped = false;
        }

        // --- Track last safe ground position ---
        if (onGround) {
            this.lastGroundPos.x = this.player.x;
            this.lastGroundPos.y = this.player.y;
        }

        // --- Falling below world → respawn ---
        if (this.player.y > this.WORLD_HEIGHT + TILE) {
            this.respawnPlayer();
        }

        // --- Update health UI ---
        this.healthUI.update();

        // --- Parallax cloud drift ---
        if (this.clouds) {
            for (var i = 0; i < this.clouds.length; i++) {
                this.clouds[i].x += this.clouds[i].speedX;
                if (this.clouds[i].x > GAME_WIDTH + 200) {
                    this.clouds[i].x = -200;
                }
            }
        }
    }
}
