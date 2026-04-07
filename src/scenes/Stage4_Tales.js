// ============================================================
// El Filibusterismo - Stage 4: The Stolen Land
// ============================================================
// Cabesang Tales defends his stolen land, fights through the
// jungle, and joins the bandits as Matanglawin.
// ============================================================

class Stage4_Tales extends Phaser.Scene {

    constructor() {
        super('Stage4_Tales');
    }

    create() {
        var self = this;
        this.WORLD_WIDTH = 100 * TILE;
        this.WORLD_HEIGHT = 17 * TILE;
        this.gameStarted = false;
        this.lastGroundPos = { x: 0, y: 0 };
        this.juliTalked = false;

        // Background - rural sunset
        this.createBackground();

        // Level
        this.levelBuilder = new LevelBuilder(this);
        var mapData = this.levelBuilder.createPlatformsFromString(this.getLevelMap(), 'tile_grass');
        this.platforms = mapData.platforms;

        // Player - Cabesang Tales
        var pStart = mapData.playerStart || { x: 80, y: 400 };
        this.player = this.levelBuilder.createPlayer(pStart.x, pStart.y, 'sprite_tales', {
            health: 6, speed: PLAYER_SPEED, jumpForce: PLAYER_JUMP
        });
        this.player.setDepth(500);
        this.lastGroundPos.x = pStart.x;
        this.lastGroundPos.y = pStart.y;

        this.physics.add.collider(this.player, this.platforms);
        this.abilities = this.levelBuilder.applyPlayerAbilities(this.player, this);

        // Treasures
        this.treasureCounter = this.levelBuilder.createTreasureCounter();
        this.treasures = this.levelBuilder.createTreasures(mapData.treasures, 'sprite_treasure');
        this.physics.add.collider(this.treasures, this.platforms);
        this.physics.add.overlap(this.player, this.treasures, this.collectTreasure, null, this);

        // Enemies - guardia early, bandits later
        this.enemies = this.levelBuilder.createEnemies(
            mapData.enemies, 'sprite_guardia',
            { health: 3, speed: 55, patrol: true, patrolDistance: 100 }
        );
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyContact, null, this);
        this.physics.add.overlap(this.abilities.fireballs, this.enemies, this.onFireballHitEnemy, null, this);

        // Juli NPC near start
        if (mapData.npcs && mapData.npcs.length > 0) {
            var juliPos = mapData.npcs[0];
            this.juliSprite = this.add.sprite(juliPos.x, juliPos.y, 'sprite_juli').setDepth(500);
            this.physics.add.existing(this.juliSprite, true);
            // Interaction indicator
            this.juliIndicator = this.add.text(juliPos.x - 4, juliPos.y - 30, '!', {
                fontSize: '20px', fontFamily: 'monospace', color: '#ffd700'
            }).setDepth(600);
            this.tweens.add({ targets: this.juliIndicator, y: juliPos.y - 36, duration: 600, yoyo: true, repeat: -1 });
        }

        // Goal
        if (mapData.goal) {
            this.goalZone = this.add.rectangle(mapData.goal.x, mapData.goal.y, TILE * 2, TILE * 3, 0xff6600, 0.2);
            this.physics.add.existing(this.goalZone, true);
            this.tweens.add({ targets: this.goalZone, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });
            this.physics.add.overlap(this.player, this.goalZone, this.onReachGoal, null, this);
        }

        // Campfire visuals in bandit camp area
        this.createCampfires();

        // UI
        this.healthUI = this.levelBuilder.createHealthUI(this.player);
        this.objective = this.levelBuilder.createObjective('Fight through the soldiers guarding your land');

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

        // Action music for Tales' stage
        if (typeof AudioManager !== 'undefined') AudioManager.startMusic('action');

        this.levelBuilder.createStageTitle('Chapter IV: The Stolen Land', "Cabesang Tales' desperate stand").then(function () {
            self.dialogueManager.startDialogue([
                { speaker: 'narrator', name: 'Narrator', text: "In the countryside, Cabesang Tales — once a proud landowner — watched helplessly as the friars seized his ancestral land through corrupt courts." },
                { speaker: 'tales', name: 'Cabesang Tales', text: "I worked this land with my own hands. My father worked it before me. And now they say it belongs to the church?" }
            ], function () {
                self.gameStarted = true;
                self.player.body.moves = true;
            });
        });
    }

    getLevelMap() {
        // DESIGN: Farmland → jungle → bandit camp. Ground at rows 12-13.
        // Max platform step: 2 tiles. NPC Juli near start. Goal at far right.
        return [
            '.....................................................................................................',
            '.....................................................................................................',
            '.....................................................................................................',
            '.....................................................................................................',
            '.....................................................................................................',
            '.....................................................................................................',
            '.....................................................................................................',
            '..............................................T...............................T........................',
            '.............................T........####.......T.........T.....####........###.......T..............',
            '....................T.....####......######..E..####.....####....######..E..#####.....####............',
            '...........T....####....######....########...######...######..########...######....######.......T..G',
            '..P..N...#####.######..########.T########..########.########.#########..########.########....####..',
            '########.####################################################.###.#############################.##',
            '########.####################################################.###.#############################.##',
            '############################################################################################################',
            '############################################################################################################',
            '############################################################################################################'
        ].join('\n');
    }

    createBackground() {
        // Sunset gradient
        var g = this.add.graphics();
        for (var i = 0; i < GAME_HEIGHT; i++) {
            var t = i / GAME_HEIGHT;
            var r = Math.floor(0x33 + (0xcc - 0x33) * (1 - t));
            var gr = Math.floor(0x55 + (0x66 - 0x55) * (1 - t));
            var b = Math.floor(0x22 + (0x33 - 0x22) * (1 - t));
            g.fillStyle((r << 16) | (gr << 8) | b, 1);
            g.fillRect(0, i, GAME_WIDTH, 1);
        }
        g.setScrollFactor(0);
        g.setDepth(-100);

        // Sun
        var sun = this.add.circle(GAME_WIDTH - 120, 80, 40, 0xff8833, 0.8);
        sun.setScrollFactor(0.1);
        sun.setDepth(-90);
    }

    createCampfires() {
        // Add orange glow circles in the bandit camp area (tiles 70-95)
        for (var i = 0; i < 3; i++) {
            var cx = (75 + i * 8) * TILE;
            var cy = 12 * TILE;
            var fire = this.add.circle(cx, cy, 20, 0xff6600, 0.3).setDepth(100);
            this.tweens.add({ targets: fire, alpha: 0.15, scaleX: 0.8, scaleY: 0.8, duration: 400 + i * 100, yoyo: true, repeat: -1 });
            // Core
            var core = this.add.circle(cx, cy, 8, 0xffaa33, 0.6).setDepth(101);
            this.tweens.add({ targets: core, alpha: 0.3, duration: 300, yoyo: true, repeat: -1 });
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
        if (typeof AudioManager !== 'undefined') AudioManager.sfxHit();
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
        if (enemy.health <= 0) {
            if (typeof AudioManager !== 'undefined') AudioManager.sfxEnemyDeath();
            enemy.destroy();
        }
    }

    playerDeath() {
        if (typeof AudioManager !== 'undefined') AudioManager.sfxGameOver();
        this.gameStarted = false;
        this.player.body.moves = false;
        this.cameras.main.shake(300, 0.02);
        var self = this;
        this.cameras.main.fade(1000, 0, 0, 0, false, function (cam, progress) {
            if (progress === 1) { self.scene.restart(); }
        });
    }

    onReachGoal() {
        if (this.goalReached) return;
        this.goalReached = true;
        if (typeof AudioManager !== 'undefined') AudioManager.sfxStageComplete();
        this.gameStarted = false;
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;

        var self = this;
        this.dialogueManager.startDialogue([
            { speaker: 'narrator', name: 'Narrator', text: "Driven to desperation, Tales found the bandits' camp in the mountains." },
            { speaker: 'narrator', name: 'Bandit Leader', text: "So, the farmer comes to us at last. We heard what the friars did to you." },
            { speaker: 'tales', name: 'Cabesang Tales', text: "I have nothing left. No land, no justice, no hope." },
            { speaker: 'narrator', name: 'Bandit Leader', text: "Then take what they refuse to give. Join us. Become Matanglawin — the sharp-eyed one." },
            { speaker: 'tales', name: 'Cabesang Tales', text: "...If this is the only way to fight back, then so be it." },
            { speaker: 'narrator', name: 'Narrator', text: "Cabesang Tales became Matanglawin — the bandit chief. Another soul claimed by the cruelty of colonial rule." }
        ], function () {
            // Save progress
            var unlocked = JSON.parse(localStorage.getItem('elfili_unlocked') || '["Stage1_Intro"]');
            if (unlocked.indexOf('Stage5_Trial') === -1) unlocked.push('Stage5_Trial');
            localStorage.setItem('elfili_unlocked', JSON.stringify(unlocked));
            self.cameras.main.fade(1500, 0, 0, 0, false, function (cam, p) {
                if (p === 1) self.scene.start(STAGES.STAGE5);
            });
        });
    }

    update(time, delta) {
        if (this.dialogueManager.isActive) {
            this.dialogueManager.update();
            this.player.setVelocityX(0);
            return;
        }
        if (!this.gameStarted) return;

        // Juli interaction
        if (this.juliSprite && !this.juliTalked) {
            var dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.juliSprite.x, this.juliSprite.y);
            if (dist < 50 && Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
                this.juliTalked = true;
                if (this.juliIndicator) this.juliIndicator.destroy();
                this.gameStarted = false;
                this.player.setVelocityX(0);
                this.player.body.moves = false;
                var self = this;
                this.dialogueManager.startDialogue([
                    { speaker: 'juli', name: 'Juli', text: "Father, please! Don't do anything rash!" },
                    { speaker: 'tales', name: 'Cabesang Tales', text: "They took everything, Juli. Our land, our livelihood. What choice do I have?" },
                    { speaker: 'juli', name: 'Juli', text: "There must be another way... Basilio said—" },
                    { speaker: 'tales', name: 'Cabesang Tales', text: "Basilio's words won't fill our stomachs. I must act." }
                ], function () {
                    self.gameStarted = true;
                    self.player.body.moves = true;
                    self.objective.update('Survive the jungle and find the bandits');
                });
                return;
            }
        }

        // Movement
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

        // Jump
        // Jump (with double jump)
        var jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.keyW);
        LevelBuilder.handleJump(this.player, jumpPressed);

        // Walk animation
        LevelBuilder.updateWalkAnimation(this.player, time);

        // Track ground position + reset double jump
        if (this.player.body.onFloor()) {
            this.player.jumpCount = 0;
            this.player.hasDoubleJumped = false;
            this.lastGroundPos.x = this.player.x;
            this.lastGroundPos.y = this.player.y;
        }

        // Fall death
        if (this.player.y > this.WORLD_HEIGHT + 50) {
            this.player.health--;
            this.healthUI.update();
            if (this.player.health <= 0) { this.playerDeath(); return; }
            this.player.setPosition(this.lastGroundPos.x, this.lastGroundPos.y - 20);
            this.player.setVelocity(0, 0);
        }

        // Update objective at midpoint
        if (this.player.x > 50 * TILE && !this.objectiveUpdated) {
            this.objectiveUpdated = true;
            this.objective.update('Find the bandit camp in the mountains');
        }
    }
}
