// ============================================================
// El Filibusterismo - Stage 7A: The Race Against Time
// ============================================================
// CANONICAL ENDING: Play as Isagani with a 30-second timer.
// Reach the lamp bomb and throw it into the river.
// ============================================================

class Stage7A_Isagani extends Phaser.Scene {

    constructor() {
        super('Stage7A_Isagani');
    }

    create() {
        var self = this;
        this.WORLD_WIDTH = 80 * TILE;
        this.WORLD_HEIGHT = 17 * TILE;
        this.gameStarted = false;
        this.lastGroundPos = { x: 0, y: 0 };
        this.lampReached = false;
        this.lampGrabbed = false;
        this.goalReached = false;
        this.timerExpired = false;

        // Background - urgent night, red-tinged
        this.createBackground();

        // Level
        this.levelBuilder = new LevelBuilder(this);
        var mapData = this.levelBuilder.createPlatformsFromString(this.getLevelMap(), 'tile_stone');
        this.platforms = mapData.platforms;

        // Player - Isagani (slightly faster)
        var pStart = mapData.playerStart || { x: 80, y: 400 };
        this.player = this.levelBuilder.createPlayer(pStart.x, pStart.y, 'sprite_isagani', {
            health: 3, speed: 220, jumpForce: PLAYER_JUMP - 20
        });
        this.player.setDepth(500);
        this.lastGroundPos.x = pStart.x;
        this.lastGroundPos.y = pStart.y;

        this.physics.add.collider(this.player, this.platforms);
        this.abilities = this.levelBuilder.applyPlayerAbilities(this.player, this);

        // Enemies - lighter presence, focus on speed
        this.enemies = this.levelBuilder.createEnemies(
            mapData.enemies, 'sprite_guardia',
            { health: 2, speed: 50, patrol: true, patrolDistance: 80 }
        );
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyContact, null, this);
        this.physics.add.overlap(this.abilities.fireballs, this.enemies, this.onFireballHitEnemy, null, this);

        // Lamp pickup (at roughly tile 55)
        this.lampPickup = this.add.sprite(55 * TILE, 12 * TILE, 'sprite_lamp').setScale(2).setDepth(510);
        this.physics.add.existing(this.lampPickup, true);
        // Ominous glow
        this.lampGlow = this.add.circle(55 * TILE, 12 * TILE, 30, 0xff4400, 0.3).setDepth(505);
        this.tweens.add({ targets: this.lampGlow, alpha: 0.1, scaleX: 1.3, scaleY: 1.3, duration: 400, yoyo: true, repeat: -1 });
        this.physics.add.overlap(this.player, this.lampPickup, this.onGrabLamp, null, this);

        // River / goal at the end
        if (mapData.goal) {
            this.riverZone = this.add.rectangle(mapData.goal.x, mapData.goal.y, TILE * 3, TILE * 4, 0x2266aa, 0.3);
            this.physics.add.existing(this.riverZone, true);
            this.physics.add.overlap(this.player, this.riverZone, this.onReachRiver, null, this);
        }
        // Water visuals at end
        for (var wx = 74; wx < 80; wx++) {
            for (var wy = 10; wy < 17; wy++) {
                this.add.image(wx * TILE + TILE / 2, wy * TILE + TILE / 2, 'tile_water').setDepth(-1);
            }
        }

        // UI
        this.healthUI = this.levelBuilder.createHealthUI(this.player);
        this.objective = this.levelBuilder.createObjective('Reach the lamp! HURRY!');

        // Timer - created but not started yet
        this.countdownTimer = this.levelBuilder.createTimer(30, GAME_WIDTH / 2, 40);

        // Camera
        this.levelBuilder.setupCamera(this.player, this.WORLD_WIDTH, this.WORLD_HEIGHT);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // Dialogue
        this.dialogueManager = new DialogueManager(this);

        // Opening - quick, urgent
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;

        // Action music - urgent
        if (typeof AudioManager !== 'undefined') AudioManager.startMusic('action');

        this.levelBuilder.createStageTitle('Chapter VII: The Race Against Time', "Isagani's desperate choice").then(function () {
            self.dialogueManager.startDialogue([
                { speaker: 'isagani', name: 'Isagani', text: "Paulita is in there! I have to stop that lamp before it's too late!" }
            ], function () {
                self.gameStarted = true;
                self.player.body.moves = true;
                // START THE 30 SECOND TIMER
                self.countdownTimer.start();
                self.countdownTimer.onExpire = function () {
                    self.onTimerExpired();
                };
            });
        });
    }

    getLevelMap() {
        // DESIGN: Speed-run level. Flat/fast with low obstacles. Lamp pickup at tile 55.
        // River (goal) at far right. Must be completable in 30 seconds at speed 220.
        return [
            '..................................................................................',
            '..................................................................................',
            '..................................................................................',
            '..................................................................................',
            '..................................................................................',
            '..................................................................................',
            '..................................................................................',
            '..................................................................................',
            '..............T..............T...............T..............T...................T...',
            '.........E...###.....E......###......E......###.....E......###..........E....###..G',
            '..T....####.#####..####...#####...####....#####...####...#####..T....####..#####..',
            '.P...#####.######.######.######..######..######..######.######..###.######.######.',
            '####.####################################################.###.###################',
            '####.####################################################.###.###################',
            '######################################################################################################',
            '######################################################################################################',
            '######################################################################################################'
        ].join('\n');
    }

    createBackground() {
        var g = this.add.graphics();
        for (var i = 0; i < GAME_HEIGHT; i++) {
            var t = i / GAME_HEIGHT;
            var r = Math.floor(0x1a + (0x33 - 0x1a) * t);
            var gr2 = Math.floor(0x08 + (0x0a - 0x08) * t);
            var b = Math.floor(0x0a + (0x1a - 0x0a) * t);
            g.fillStyle((r << 16) | (gr2 << 8) | b, 1);
            g.fillRect(0, i, GAME_WIDTH, 1);
        }
        g.setScrollFactor(0).setDepth(-100);
    }

    onGrabLamp() {
        if (this.lampGrabbed) return;
        this.lampGrabbed = true;
        this.lampPickup.destroy();
        this.lampGlow.destroy();

        // Visual - lamp follows player
        this.carriedLamp = this.add.sprite(0, 0, 'sprite_lamp').setScale(1.5).setDepth(510);
        this.objective.update('Throw the lamp into the river!');
    }

    onReachRiver() {
        if (this.goalReached) return;
        if (!this.lampGrabbed) return; // Must have the lamp first
        this.goalReached = true;
        this.gameStarted = false;
        this.countdownTimer.stop();
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;
        if (this.carriedLamp) this.carriedLamp.destroy();

        // Explosion in water effect
        if (typeof AudioManager !== 'undefined') { AudioManager.sfxExplosion(); AudioManager.sfxStageComplete(); }
        this.cameras.main.flash(500, 255, 200, 100);
        this.cameras.main.shake(800, 0.03);

        var self = this;
        this.time.delayedCall(1000, function () {
            self.dialogueManager.startDialogue([
                { speaker: 'narrator', name: 'Narrator', text: "With seconds to spare, Isagani seized the lamp and hurled it into the river!" },
                { speaker: 'isagani', name: 'Isagani', text: "Paulita... everyone... they're safe." },
                { speaker: 'narrator', name: 'Narrator', text: "The explosion sent a column of water into the night sky, but no one was harmed." },
                { speaker: 'narrator', name: 'Narrator', text: "Simoun's grand plan had failed. Wounded and betrayed, he fled to the coast, to the home of the old priest Padre Florentino." },
                { speaker: 'simoun', name: 'Simoun', text: "It is over, Padre. My revolution... my revenge... all for nothing." },
                { speaker: 'florentino', name: 'Padre Florentino', text: "God did not will it, Simoun. Perhaps violence was never the answer." },
                { speaker: 'simoun', name: 'Simoun', text: "Then what was the answer, old man? Prayer? Patience? While they steal and murder?" },
                { speaker: 'florentino', name: 'Padre Florentino', text: "The answer is in the youth, Simoun. Not in bombs and fire, but in education, in truth, in the slow work of justice." },
                { speaker: 'narrator', name: 'Narrator', text: "Simoun died that night, clutching the jewels that could never buy him the justice he sought." },
                { speaker: 'florentino', name: 'Padre Florentino', text: "May God forgive you... Crisostomo Ibarra." },
                { speaker: 'narrator', name: 'Narrator', text: "Padre Florentino cast Simoun's jewels into the sea, praying that one day they would be found by a generation worthy of wielding their power — not for revenge, but for true liberation." }
            ], function () {
                var unlocked = JSON.parse(localStorage.getItem('elfili_unlocked') || '["Stage1_Intro"]');
                if (unlocked.indexOf('EndingScene') === -1) unlocked.push('EndingScene');
                localStorage.setItem('elfili_unlocked', JSON.stringify(unlocked));
                self.scene.start(STAGES.ENDING, { ending: 'canonical' });
            });
        });
    }

    onTimerExpired() {
        if (this.goalReached) return;
        this.timerExpired = true;
        this.gameStarted = false;
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;

        // Explosion
        if (typeof AudioManager !== 'undefined') { AudioManager.sfxExplosion(); AudioManager.sfxGameOver(); }
        this.cameras.main.flash(2000, 255, 100, 0);
        this.cameras.main.shake(2000, 0.05);

        var self = this;
        this.time.delayedCall(2000, function () {
            // Game over screen
            var overlay = self.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.9);
            overlay.setScrollFactor(0).setDepth(3000);

            self.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'THE LAMP EXPLODED', {
                fontSize: '32px', fontFamily: 'monospace', color: '#ff4444',
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

            self.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'Everyone at the reception perished.', {
                fontSize: '16px', fontFamily: 'monospace', color: '#cccccc'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

            var retry = self.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '[ Press SPACE to retry ]', {
                fontSize: '18px', fontFamily: 'monospace', color: '#ffd700'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

            self.tweens.add({ targets: retry, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

            self.input.keyboard.once('keydown-SPACE', function () {
                self.scene.restart();
            });
        });
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
        if (enemy.health <= 0) {
            if (typeof AudioManager !== 'undefined') AudioManager.sfxEnemyDeath();
            enemy.destroy();
        }
    }

    playerDeath() {
        if (typeof AudioManager !== 'undefined') AudioManager.sfxGameOver();
        this.gameStarted = false;
        this.player.body.moves = false;
        this.countdownTimer.stop();
        this.cameras.main.shake(300, 0.02);
        var self = this;
        this.cameras.main.fade(1000, 0, 0, 0, false, function (cam, progress) {
            if (progress === 1) self.scene.restart();
        });
    }

    update(time, delta) {
        if (this.dialogueManager.isActive) {
            this.dialogueManager.update();
            this.player.setVelocityX(0);
            return;
        }
        if (!this.gameStarted || this.timerExpired) return;

        // Carried lamp follows player
        if (this.carriedLamp && this.carriedLamp.active) {
            this.carriedLamp.setPosition(this.player.x + 10, this.player.y - 16);
        }

        // Screen pulse when timer < 10s
        if (this.countdownTimer && this.countdownTimer.getRemaining() < 10 && this.countdownTimer.getRemaining() > 0) {
            var pulse = Math.sin(time / 100) * 0.15;
            this.cameras.main.setAlpha(1 - Math.abs(pulse));
        }

        var speed = this.player.isDashing ? PLAYER_DASH_SPEED : 220;
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

        var jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.keyW);
        LevelBuilder.handleJump(this.player, jumpPressed);
        LevelBuilder.updateWalkAnimation(this.player, time);

        if (this.player.body.onFloor()) {
            this.player.jumpCount = 0;
            this.player.hasDoubleJumped = false;
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
