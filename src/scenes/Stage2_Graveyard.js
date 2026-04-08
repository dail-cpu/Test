// ============================================================
// El Filibusterismo - Stage 2: Sisa's Grave
// The graveyard at midnight - Simoun reveals his identity
// ============================================================

class Stage2_Graveyard extends Phaser.Scene {
    constructor() {
        super('Stage2_Graveyard');
    }

    create() {
        // -------------------------------------------------------
        // World dimensions
        // -------------------------------------------------------
        this.worldWidth = 100 * TILE;   // 3200px
        this.worldHeight = 17 * TILE;   // 544px

        // -------------------------------------------------------
        // Night sky background
        // -------------------------------------------------------
        this.createNightBackground();

        // -------------------------------------------------------
        // Level builder
        // -------------------------------------------------------
        this.lb = new LevelBuilder(this);

        // -------------------------------------------------------
        // Parse level map
        // -------------------------------------------------------
        var mapData = this.lb.createPlatformsFromString(this.getLevelMap(), 'tile_dark_ground');

        this.platforms = mapData.platforms;

        // Add grave-tile decoration platforms on top of some areas
        this.gravePlatforms = this.lb.createPlatformsFromString(this.getGraveOverlay(), 'tile_grave').platforms;
        this.stonePlatforms = this.lb.createPlatformsFromString(this.getStoneOverlay(), 'tile_stone').platforms;

        // Environment decorations
        this.lb.drawEnvironmentDecor('graveyard', this.worldWidth);

        // -------------------------------------------------------
        // Player
        // -------------------------------------------------------
        var startPos = mapData.playerStart || { x: 80, y: 400 };
        this.player = this.lb.createPlayer(startPos.x, startPos.y, 'sprite_simoun', {
            health: 5,
            speed: PLAYER_SPEED,
            jumpForce: PLAYER_JUMP
        });

        // -------------------------------------------------------
        // Collisions: player vs all platform layers
        // -------------------------------------------------------
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.gravePlatforms);
        this.physics.add.collider(this.player, this.stonePlatforms);

        // -------------------------------------------------------
        // Player abilities (melee, fire, dash)
        // -------------------------------------------------------
        this.abilities = this.lb.applyPlayerAbilities(this.player, this);

        // -------------------------------------------------------
        // Enemies: mix of guardia and bandits
        // -------------------------------------------------------
        this.setupEnemies(mapData.enemies);

        // -------------------------------------------------------
        // Treasures
        // -------------------------------------------------------
        if (mapData.treasures.length > 0) {
            this.treasures = this.lb.createTreasures(mapData.treasures, 'sprite_treasure');
            this.physics.add.collider(this.treasures, this.platforms);
            this.physics.add.collider(this.treasures, this.gravePlatforms);
            this.physics.add.collider(this.treasures, this.stonePlatforms);
            this.physics.add.overlap(this.player, this.treasures, this.collectTreasure, null, this);
        }

        this.treasureCounter = this.lb.createTreasureCounter();

        // -------------------------------------------------------
        // Basilio NPC at Sisa's grave
        // -------------------------------------------------------
        this.basilioTriggered = false;
        if (mapData.npcs.length > 0) {
            var npcPos = mapData.npcs[0];
            this.basilioNPC = this.physics.add.sprite(npcPos.x, npcPos.y, 'sprite_basilio');
            this.basilioNPC.body.setAllowGravity(true);
            this.basilioNPC.body.setGravityY(GRAVITY);
            this.basilioNPC.body.setImmovable(true);
            this.basilioNPC.setFlipX(true);
            this.basilioNPC.setDepth(500);

            this.physics.add.collider(this.basilioNPC, this.platforms);
            this.physics.add.collider(this.basilioNPC, this.gravePlatforms);
            this.physics.add.collider(this.basilioNPC, this.stonePlatforms);

            // Big "!" indicator above Basilio
            this.basilioIndicator = this.add.text(npcPos.x - 4, npcPos.y - 40, '!', {
                fontSize: '24px', fontFamily: 'monospace', color: '#ffd700',
                shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 3, fill: true }
            }).setDepth(600);
            this.tweens.add({ targets: this.basilioIndicator, y: npcPos.y - 48, duration: 600, yoyo: true, repeat: -1 });

            // "Basilio" name label
            this.basilioLabel = this.add.text(npcPos.x, npcPos.y - 28, 'Basilio', {
                fontSize: '10px', fontFamily: 'monospace', color: '#f0ead6',
                shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true }
            }).setOrigin(0.5).setDepth(600);

            // Gravestone decoration next to Basilio (Sisa's grave)
            var graveX = npcPos.x + 30;
            var graveY = npcPos.y + 4;
            this.sisaGrave = this.add.image(graveX, graveY, 'tile_grave').setDepth(100).setScale(1.5);
            // "Sisa" text on the grave
            this.add.text(graveX, graveY - 20, 'SISA', {
                fontSize: '8px', fontFamily: 'monospace', color: '#999999'
            }).setOrigin(0.5).setDepth(101);
            // Candle glow near grave
            var candle = this.add.circle(graveX - 10, graveY + 10, 6, 0xffaa33, 0.4).setDepth(99);
            this.tweens.add({ targets: candle, alpha: 0.15, scaleX: 0.7, scaleY: 0.7, duration: 500, yoyo: true, repeat: -1 });

            // Overlap zone to trigger dialogue
            this.physics.add.overlap(this.player, this.basilioNPC, this.onReachBasilio, null, this);

            // Direction arrow pointing toward Basilio (updates in update loop)
            this.dirArrow = this.add.text(GAME_WIDTH - 60, GAME_HEIGHT / 2, '>>>', {
                fontSize: '16px', fontFamily: 'monospace', color: '#ffd700'
            }).setScrollFactor(0).setDepth(800).setAlpha(0.7);
            this.tweens.add({ targets: this.dirArrow, x: GAME_WIDTH - 50, duration: 500, yoyo: true, repeat: -1 });
        }

        // -------------------------------------------------------
        // UI
        // -------------------------------------------------------
        this.healthUI = this.lb.createHealthUI(this.player);
        this.objective = this.lb.createObjective('Find Basilio at Sisa\'s grave');

        // -------------------------------------------------------
        // Camera
        // -------------------------------------------------------
        this.lb.setupCamera(this.player, this.worldWidth, this.worldHeight);

        // -------------------------------------------------------
        // Firefly particles for atmosphere
        // -------------------------------------------------------
        this.createFireflies();

        // -------------------------------------------------------
        // Fog / mist layer
        // -------------------------------------------------------
        this.createMist();

        // -------------------------------------------------------
        // Input
        // -------------------------------------------------------
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // -------------------------------------------------------
        // Dialogue manager
        // -------------------------------------------------------
        this.dialogue = new DialogueManager(this);

        // -------------------------------------------------------
        // Death / respawn state
        // -------------------------------------------------------
        this.respawnX = startPos.x;
        this.respawnY = startPos.y;
        this.isDead = false;

        // -------------------------------------------------------
        // Stage title + opening narration
        // -------------------------------------------------------
        this.playerControlEnabled = false;

        // Night music for graveyard
        if (typeof AudioManager !== 'undefined') AudioManager.startMusic('night');

        var self = this;
        this.lb.createStageTitle('Chapter II: Sisa\'s Grave', 'The graveyard at midnight').then(function () {
            self.dialogue.startDialogue([
                {
                    speaker: 'narrator',
                    name: 'Narrator',
                    text: 'Under the cover of night, Simoun made his way to the old cemetery, seeking the young man named Basilio...'
                }
            ], function () {
                self.playerControlEnabled = true;
            });
        });
    }

    // ===========================================================
    // LEVEL MAP (100 x 17)
    // '#'=solid, '.'=empty, 'T'=treasure, 'E'=enemy,
    // 'P'=player start, 'G'=goal, 'N'=NPC
    // ===========================================================
    getLevelMap() {
        // DESIGN: Graveyard at night. Ground at row 12-13.
        // Basilio NPC clearly at far right on solid ground with path to him.
        // Gradual left-to-right progression, stepping up 1-2 tiles max.
        return [
            '....................................................................................................', // 0
            '....................................................................................................', // 1
            '....................................................................................................', // 2
            '....................................................................................................', // 3
            '....................................................................................................', // 4
            '....................................................................................................', // 5
            '....................................................................................................', // 6
            '....................................................................................................', // 7
            '...........................T.........................................T...............................', // 8
            '...................T....####...E.....T........T......####...E.....T.....####........................', // 9
            '..........T.E....###..######.......####.....####....######......####...######.......T...............', // 10
            '..P.....#####...#####.######..T..######...######...########...######..########....#####....N.......', // 11
            '######.######..######.######.###.########.########.########..########.########...######.#####.#####', // 12
            '######.######.#######.######.###.########.########.########.#########.########..#######.###########', // 13
            '############################################################################################################', // 14
            '############################################################################################################', // 15
            '############################################################################################################'  // 16
        ].join('\n');
    }

    // Grave decoration overlay (tile_grave placed at thematic spots)
    getGraveOverlay() {
        return [
            '....................................................................................................', // 0
            '....................................................................................................', // 1
            '....................................................................................................', // 2
            '....................................................................................................', // 3
            '....................................................................................................', // 4
            '....................................................................................................', // 5
            '....................................................................................................', // 6
            '....................................................................................................', // 7
            '....................................................................................................', // 8
            '....................................................................................................', // 9
            '....................................................................................................', // 10
            '....................................................................................................', // 11
            '....................................................................................................', // 12
            '....................................................................................................', // 13
            '........#....#........#.......#........#.......#........#......#........#..........####............', // 14
            '....................................................................................................', // 15
            '....................................................................................................'  // 16
        ].join('\n');
    }

    // Stone overlay (tile_stone for pillars and mausoleum walls)
    getStoneOverlay() {
        return [
            '....................................................................................................', // 0
            '....................................................................................................', // 1
            '....................................................................................................', // 2
            '....................................................................................................', // 3
            '....................................................................................................', // 4
            '#...............................................................................#..................', // 5
            '#...............................................................................#..................', // 6
            '#..............................#....................................................................', // 7
            '#..............................#..................................#.................................', // 8
            '#..............................#..................................#.................................', // 9
            '...............................#..................................#.................................', // 10
            '...............................#...................................................................',  // 11
            '....................................................................................................', // 12
            '....................................................................................................', // 13
            '....................................................................................................', // 14
            '....................................................................................................', // 15
            '....................................................................................................'  // 16
        ].join('\n');
    }

    // ===========================================================
    // Night background with gradient
    // ===========================================================
    createNightBackground() {
        var bg = this.add.graphics();
        bg.setScrollFactor(0.05, 0); // slow parallax
        var steps = 32;
        var stripH = Math.ceil(this.worldHeight / steps);

        for (var i = 0; i < steps; i++) {
            var t = i / (steps - 1);
            // Deep blue at top, near-black at bottom
            var r = Math.floor(5 * (1 - t));
            var g = Math.floor(5 * (1 - t));
            var b = Math.floor(40 * (1 - t) + 8 * t);
            var color = (r << 16) | (g << 8) | b;
            bg.fillStyle(color, 1);
            bg.fillRect(0, i * stripH, this.worldWidth, stripH + 1);
        }

        // Moon
        var moonX = 780;
        var moonY = 40;
        var moon = this.add.circle(moonX, moonY, 22, 0xddeeff, 0.7);
        moon.setScrollFactor(0.02, 0);
        var moonGlow = this.add.circle(moonX, moonY, 50, 0x8899bb, 0.1);
        moonGlow.setScrollFactor(0.02, 0);

        // Distant stars
        for (var s = 0; s < 50; s++) {
            var sx = Phaser.Math.Between(0, this.worldWidth);
            var sy = Phaser.Math.Between(0, this.worldHeight * 0.4);
            var sz = Phaser.Math.Between(1, 2);
            var star = this.add.rectangle(sx, sy, sz, sz, 0xffffff);
            star.setAlpha(Phaser.Math.FloatBetween(0.15, 0.6));
            star.setScrollFactor(0.03, 0);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.05, 0.3),
                duration: Phaser.Math.Between(1200, 3500),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    // ===========================================================
    // Firefly particles
    // ===========================================================
    createFireflies() {
        if (!this.textures.exists('particle_fire')) return;

        this.fireflyEmitter = this.add.particles(0, 0, 'particle_fire', {
            x: { min: 0, max: this.worldWidth },
            y: { min: this.worldHeight * 0.3, max: this.worldHeight * 0.9 },
            lifespan: { min: 3000, max: 6000 },
            speedY: { min: -12, max: -5 },
            speedX: { min: -8, max: 8 },
            scale: { start: 0.6, end: 0.1 },
            alpha: { start: 0.5, end: 0 },
            frequency: 400,
            quantity: 1,
            blendMode: 'ADD',
            tint: [0x88ff88, 0xaaff66, 0x66ffaa]
        });
    }

    // ===========================================================
    // Ground mist effect (simple tween-based)
    // ===========================================================
    createMist() {
        this.mistSprites = [];
        for (var i = 0; i < 12; i++) {
            var mx = Phaser.Math.Between(0, this.worldWidth);
            var my = this.worldHeight - Phaser.Math.Between(50, 100);
            var mist = this.add.ellipse(mx, my, Phaser.Math.Between(120, 250), Phaser.Math.Between(20, 40), 0x667788, 0.08);
            mist.setDepth(5);
            this.mistSprites.push(mist);

            this.tweens.add({
                targets: mist,
                x: mx + Phaser.Math.Between(-40, 40),
                alpha: Phaser.Math.FloatBetween(0.03, 0.12),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    // ===========================================================
    // Enemies setup: alternate between guardia and bandits
    // ===========================================================
    setupEnemies(enemyPositions) {
        if (!enemyPositions || enemyPositions.length === 0) return;

        // Split positions: even-indexed become guardia, odd become bandits
        var guardiaPos = [];
        var banditPos = [];
        for (var i = 0; i < enemyPositions.length; i++) {
            if (i % 2 === 0) {
                guardiaPos.push(enemyPositions[i]);
            } else {
                banditPos.push(enemyPositions[i]);
            }
        }

        this.guardiaEnemies = this.lb.createEnemies(guardiaPos, 'sprite_guardia', {
            health: 3,
            speed: 70,
            patrol: true,
            patrolDistance: 120
        });

        this.banditEnemies = this.lb.createEnemies(banditPos, 'sprite_bandit', {
            health: 2,
            speed: 85,
            patrol: true,
            patrolDistance: 100
        });

        // Collide enemies with platforms
        this.physics.add.collider(this.guardiaEnemies, this.platforms);
        this.physics.add.collider(this.guardiaEnemies, this.gravePlatforms);
        this.physics.add.collider(this.guardiaEnemies, this.stonePlatforms);
        this.physics.add.collider(this.banditEnemies, this.platforms);
        this.physics.add.collider(this.banditEnemies, this.gravePlatforms);
        this.physics.add.collider(this.banditEnemies, this.stonePlatforms);

        // Player vs enemies
        this.physics.add.overlap(this.player, this.guardiaEnemies, this.onPlayerHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.banditEnemies, this.onPlayerHitEnemy, null, this);

        // Register enemies for melee hits
        this.abilities.registerEnemies(this.guardiaEnemies);
        this.abilities.registerEnemies(this.banditEnemies);

        // Fireball vs enemies
        if (this.abilities && this.abilities.fireballs) {
            this.physics.add.overlap(this.abilities.fireballs, this.guardiaEnemies, this.onFireballHitEnemy, null, this);
            this.physics.add.overlap(this.abilities.fireballs, this.banditEnemies, this.onFireballHitEnemy, null, this);
        }
    }

    // ===========================================================
    // UPDATE LOOP
    // ===========================================================
    update(time, delta) {
        // Dialogue takes priority
        if (this.dialogue && this.dialogue.isActive) {
            this.dialogue.update();
            if (this.player && this.player.body) {
                this.player.setVelocityX(0);
            }
            return;
        }

        if (this.isDead || !this.playerControlEnabled) return;

        if (!this.player || !this.player.active) return;

        // -------------------------------------------------------
        // Player movement
        // -------------------------------------------------------
        var onGround = this.player.body.blocked.down;

        if (!this.player.isDashing) {
            var moveX = 0;

            if (this.cursors.left.isDown || this.keyA.isDown) {
                moveX = -this.player.speed;
                this.player.facingRight = false;
                this.player.setFlipX(true);
            } else if (this.cursors.right.isDown || this.keyD.isDown) {
                moveX = this.player.speed;
                this.player.facingRight = true;
                this.player.setFlipX(false);
            }

            this.player.setVelocityX(moveX);
        }

        // Jump (with double jump)
        var jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.keyW);
        LevelBuilder.handleJump(this.player, jumpPressed);

        // Walk animation
        LevelBuilder.updateWalkAnimation(this.player, time);

        // Hide direction arrow when near Basilio
        if (this.dirArrow && this.basilioNPC) {
            if (Math.abs(this.player.x - this.basilioNPC.x) < 200) {
                this.dirArrow.setVisible(false);
            }
        }

        // Reset jump count on ground
        if (onGround) {
            this.player.jumpCount = 0;
            this.player.hasDoubleJumped = false;
        }

        // -------------------------------------------------------
        // Update UI
        // -------------------------------------------------------
        if (this.healthUI) {
            this.healthUI.update();
        }

        // -------------------------------------------------------
        // Check death by falling off the world
        // -------------------------------------------------------
        if (this.player.y > this.worldHeight + 50) {
            this.onPlayerDeath();
        }
    }

    // ===========================================================
    // TREASURE COLLECTION
    // ===========================================================
    collectTreasure(player, treasure) {
        if (!treasure.active) return;
        treasure.destroy();
        this.treasureCounter.increment();

        // Gold sparkle effect
        if (this.textures.exists('particle_spark')) {
            var particles = this.add.particles(treasure.x, treasure.y, 'particle_spark', {
                speed: { min: 30, max: 80 },
                angle: { min: 0, max: 360 },
                lifespan: 400,
                quantity: 8,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD',
                tint: 0xffd700,
                emitting: false
            });
            particles.explode(8);
            this.time.delayedCall(500, function () { particles.destroy(); });
        }
    }

    // ===========================================================
    // PLAYER-ENEMY COLLISION
    // ===========================================================
    onPlayerHitEnemy(player, enemy) {
        if (!player.active || !enemy.active) return;

        // Stomping: player falling onto enemy from above
        if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
            enemy.health--;
            player.setVelocityY(PLAYER_JUMP * 0.5);

            if (enemy.health <= 0) {
                this.destroyEnemy(enemy);
            } else {
                this.flashSprite(enemy);
            }
            return;
        }

        // Player takes damage
        if (player.isInvincible) return;
        player.health--;
        player.isInvincible = true;
        if (typeof AudioManager !== 'undefined') AudioManager.sfxHit();

        // Knockback
        var knockDir = (player.x < enemy.x) ? -1 : 1;
        player.setVelocityX(180 * knockDir);
        player.setVelocityY(-150);

        // Flash invincibility
        this.tweens.add({
            targets: player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: function () {
                player.setAlpha(1);
            }
        });

        var self = this;
        this.time.delayedCall(1200, function () {
            if (player.active) player.isInvincible = false;
        });

        if (player.health <= 0) {
            this.onPlayerDeath();
        }
    }

    // ===========================================================
    // FIREBALL-ENEMY COLLISION
    // ===========================================================
    onFireballHitEnemy(fireball, enemy) {
        if (!fireball.active || !enemy.active) return;

        enemy.health -= fireball.damage || FIRE_DAMAGE;
        fireball.destroy();

        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        } else {
            this.flashSprite(enemy);
        }
    }

    // ===========================================================
    // ENEMY DESTRUCTION
    // ===========================================================
    destroyEnemy(enemy) {
        // Death particles
        if (this.textures.exists('particle_dust')) {
            var particles = this.add.particles(enemy.x, enemy.y, 'particle_dust', {
                speed: { min: 20, max: 60 },
                angle: { min: 0, max: 360 },
                lifespan: 350,
                quantity: 6,
                scale: { start: 1, end: 0 },
                tint: 0x888888,
                emitting: false
            });
            particles.explode(6);
            this.time.delayedCall(400, function () { particles.destroy(); });
        }
        if (typeof AudioManager !== 'undefined') AudioManager.sfxEnemyDeath();
        enemy.destroy();
    }

    // ===========================================================
    // FLASH SPRITE (damage feedback)
    // ===========================================================
    flashSprite(sprite) {
        sprite.setTintFill(0xffffff);
        var self = this;
        this.time.delayedCall(100, function () {
            if (sprite.active) sprite.clearTint();
        });
    }

    // ===========================================================
    // PLAYER DEATH / RESPAWN
    // ===========================================================
    onPlayerDeath() {
        if (this.isDead) return;
        this.isDead = true;
        if (typeof AudioManager !== 'undefined') AudioManager.sfxGameOver();

        this.player.setVelocity(0, 0);
        this.player.body.setAllowGravity(false);

        // Death fade -> game over
        var self = this;
        this.cameras.main.fade(800, 0, 0, 0, false, function (cam, progress) {
            if (progress >= 1) {
                self.scene.start(STAGES.GAMEOVER, { stageName: 'Stage2_Graveyard' });
            }
        });
    }

    respawnPlayer() {
        this.player.setPosition(this.respawnX, this.respawnY);
        this.player.health = this.player.maxHealth;
        this.player.body.setAllowGravity(true);
        this.player.setAlpha(1);
        this.player.isInvincible = false;
        this.isDead = false;

        // Brief invincibility on respawn
        this.player.isInvincible = true;
        this.tweens.add({
            targets: this.player,
            alpha: 0.4,
            duration: 150,
            yoyo: true,
            repeat: 4,
            onComplete: function () {
                this.targets[0].setAlpha(1);
            }
        });

        var self = this;
        this.time.delayedCall(1000, function () {
            if (self.player.active) self.player.isInvincible = false;
        });
    }

    // ===========================================================
    // REACH BASILIO - Trigger identity reveal dialogue
    // ===========================================================
    onReachBasilio(player, npc) {
        if (this.basilioTriggered) return;
        this.basilioTriggered = true;

        this.playerControlEnabled = false;
        player.setVelocityX(0);
        player.setVelocityY(0);

        this.objective.complete();
        if (typeof AudioManager !== 'undefined') AudioManager.sfxStageComplete();

        var self = this;
        this.dialogue.startDialogue([
            {
                speaker: 'basilio',
                name: 'Basilio',
                text: 'Who goes there? This is hallowed ground.'
            },
            {
                speaker: 'simoun',
                name: 'Simoun',
                text: 'Do not be afraid, Basilio. I mean you no harm.'
            },
            {
                speaker: 'basilio',
                name: 'Basilio',
                text: 'How do you know my name? Who are you?'
            },
            {
                speaker: 'simoun',
                name: 'Simoun',
                text: 'You knew me once... thirteen years ago. I am Crisostomo Ibarra.'
            },
            {
                speaker: 'basilio',
                name: 'Basilio',
                text: 'Ibarra?! But... they said you were dead!'
            },
            {
                speaker: 'simoun',
                name: 'Simoun',
                text: 'The man you knew IS dead. I am Simoun now. And I need your help.'
            },
            {
                speaker: 'basilio',
                name: 'Basilio',
                text: 'Help? For what?'
            },
            {
                speaker: 'simoun',
                name: 'Simoun',
                text: 'To bring justice to this land. The friars destroyed my life, your mother\'s life. They took everything from us. Will you stand with me?'
            },
            {
                speaker: 'basilio',
                name: 'Basilio',
                text: 'I... I need to think. But if what you say is true... tell me your plan.'
            },
            {
                speaker: 'narrator',
                name: 'Narrator',
                text: 'And so, at the grave of his beloved mother, Basilio learned the terrible truth \u2014 and the even more terrible plan that Simoun had set in motion.'
            }
        ], function () {
            self.onStageComplete();
        });
    }

    // ===========================================================
    // STAGE COMPLETE
    // ===========================================================
    onStageComplete() {
        // Save progress: unlock Stage3_School
        try {
            var raw = localStorage.getItem('elfili_unlocked');
            var unlocked = raw ? JSON.parse(raw) : [STAGES.STAGE1];

            if (unlocked.indexOf(STAGES.STAGE2) === -1) {
                unlocked.push(STAGES.STAGE2);
            }
            if (unlocked.indexOf(STAGES.STAGE3) === -1) {
                unlocked.push(STAGES.STAGE3);
            }

            localStorage.setItem('elfili_unlocked', JSON.stringify(unlocked));
        } catch (e) {
            // localStorage unavailable; continue silently
        }

        // Fade out and transition to Stage 3
        var self = this;
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', function () {
            if (self.dialogue) {
                self.dialogue.destroy();
            }
            self.scene.start(STAGES.STAGE3);
        });
    }
}
