// ============================================================
// El Filibusterismo - Stage 7B: Revolution
// ============================================================
// ALTERNATE ENDING: Play as Simoun in full-on action,
// fighting through the reception. Ends with Isagani boss
// fight. Leads to a successful revolution ending.
// ============================================================

class Stage7B_Simoun extends Phaser.Scene {

    constructor() {
        super('Stage7B_Simoun');
    }

    create() {
        var self = this;
        this.WORLD_WIDTH = 100 * TILE;
        this.WORLD_HEIGHT = 17 * TILE;
        this.gameStarted = false;
        this.lastGroundPos = { x: 0, y: 0 };
        this.goalReached = false;
        this.bossStarted = false;
        this.bossDefeated = false;

        // Background - fiery night
        this.createBackground();

        // Level
        this.levelBuilder = new LevelBuilder(this);
        var mapData = this.levelBuilder.createPlatformsFromString(this.getLevelMap(), 'tile_reception_floor');
        this.platforms = mapData.platforms;

        // Player - Simoun (powered up)
        var pStart = mapData.playerStart || { x: 80, y: 400 };
        this.player = this.levelBuilder.createPlayer(pStart.x, pStart.y, 'sprite_simoun', {
            health: 8, speed: PLAYER_SPEED, jumpForce: PLAYER_JUMP
        });
        this.player.setDepth(500);
        this.lastGroundPos.x = pStart.x;
        this.lastGroundPos.y = pStart.y;

        this.physics.add.collider(this.player, this.platforms);
        this.abilities = this.levelBuilder.applyPlayerAbilities(this.player, this);

        // Enemies - HEAVY presence, it's a gauntlet
        this.enemies = this.levelBuilder.createEnemies(
            mapData.enemies, 'sprite_guardia',
            { health: 2, speed: 65, patrol: true, patrolDistance: 80 }
        );
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyContact, null, this);
        this.physics.add.overlap(this.abilities.fireballs, this.enemies, this.onFireballHitEnemy, null, this);
        this.abilities.registerEnemies(this.enemies);

        // Also add some friars as enemies
        if (mapData.npcs && mapData.npcs.length > 0) {
            this.friarEnemies = this.levelBuilder.createEnemies(
                mapData.npcs, 'sprite_friar',
                { health: 3, speed: 40, patrol: true, patrolDistance: 60 }
            );
            this.physics.add.collider(this.friarEnemies, this.platforms);
            this.physics.add.overlap(this.player, this.friarEnemies, this.onPlayerEnemyContact, null, this);
            this.physics.add.overlap(this.abilities.fireballs, this.friarEnemies, this.onFireballHitEnemy, null, this);
            this.abilities.registerEnemies(this.friarEnemies);
        }

        // BOSS: Isagani at the end
        this.createBoss(mapData.boss || { x: 90 * TILE, y: 12 * TILE });

        // Treasures
        this.treasureCounter = this.levelBuilder.createTreasureCounter();
        this.treasures = this.levelBuilder.createTreasures(mapData.treasures, 'sprite_treasure');
        this.physics.add.collider(this.treasures, this.platforms);
        this.physics.add.overlap(this.player, this.treasures, this.collectTreasure, null, this);

        // UI
        this.healthUI = this.levelBuilder.createHealthUI(this.player);
        this.objective = this.levelBuilder.createObjective('Fight through the reception!');

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

        // Action music for the gauntlet
        if (typeof AudioManager !== 'undefined') AudioManager.startMusic('action');

        this.levelBuilder.createStageTitle('Chapter VII: Revolution', 'Simoun unleashed').then(function () {
            self.dialogueManager.startDialogue([
                { speaker: 'simoun', name: 'Simoun', text: "No more hiding. No more scheming in the shadows. Tonight, the revolution begins with FIRE." },
                { speaker: 'narrator', name: 'Narrator', text: "Simoun drew his walking stick and lantern. If the lamp would do its work, he would make sure no one stopped it." }
            ], function () {
                self.gameStarted = true;
                self.player.body.moves = true;
            });
        });
    }

    getLevelMap() {
        // DESIGN: Action gauntlet through reception. Heavy enemies. Boss (Isagani) at tile 90.
        // Ground at row 12. Plenty of platforms for combat variety.
        return [
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '..........................T.......................T.......................T..........................',
            '..............T.........###...E.....T...........###...E......T..........###...E......T..............',
            '..........E..###.......#####......####..E......#####......####..E.....#####.......####......B......',
            '..T.N...####.#####.E.######..N..######.......######.....######......########....######...####.....',
            '.P....#####.######..########...########.E...########...########....#########...########.######....',
            '####.#####.########.########.###.########.###.########.###.########.###.########.###.##.#########.',
            '####.#####.########.########.###.########.###.########.###.########.###.########.###.##.##########',
            '############################################################################################################',
            '############################################################################################################',
            '############################################################################################################'
        ].join('\n');
    }

    createBackground() {
        var g = this.add.graphics();
        for (var i = 0; i < GAME_HEIGHT; i++) {
            var t = i / GAME_HEIGHT;
            var r = Math.floor(0x2a + (0x44 - 0x2a) * t);
            var gr2 = Math.floor(0x08 + (0x11 - 0x08) * t);
            var b = Math.floor(0x08 + (0x0a - 0x08) * t);
            g.fillStyle((r << 16) | (gr2 << 8) | b, 1);
            g.fillRect(0, i, GAME_WIDTH, 1);
        }
        g.setScrollFactor(0).setDepth(-100);

        // Fire particles in background
        for (var p = 0; p < 20; p++) {
            var ember = this.add.circle(
                Math.random() * GAME_WIDTH, GAME_HEIGHT + Math.random() * 50,
                2 + Math.random() * 2, 0xff6600, 0.6
            );
            ember.setScrollFactor(0).setDepth(-80);
            this.tweens.add({
                targets: ember,
                y: -20, x: ember.x + (Math.random() - 0.5) * 100,
                alpha: 0, duration: 3000 + Math.random() * 4000,
                repeat: -1, delay: Math.random() * 3000
            });
        }
    }

    createBoss(pos) {
        // Isagani as boss
        this.boss = this.physics.add.sprite(pos.x, pos.y, 'sprite_isagani').setDepth(500);
        this.boss.setCollideWorldBounds(false);
        this.boss.health = 12;
        this.boss.maxHealth = 12;
        this.boss.isActive = false;
        this.boss.attackTimer = 0;
        this.boss.facingRight = false;

        this.physics.add.collider(this.boss, this.platforms);

        // Boss health bar (hidden initially)
        this.bossHealthBg = this.add.rectangle(GAME_WIDTH / 2, 70, 200, 12, 0x333333, 0.8)
            .setScrollFactor(0).setDepth(900).setVisible(false);
        this.bossHealthBar = this.add.rectangle(GAME_WIDTH / 2 - 98, 70, 196, 8, 0x44cc44, 1)
            .setScrollFactor(0).setDepth(901).setOrigin(0, 0.5).setVisible(false);
        this.bossNameText = this.add.text(GAME_WIDTH / 2, 56, 'ISAGANI', {
            fontSize: '12px', fontFamily: 'monospace', color: '#ffd700'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(902).setVisible(false);

        // Boss collision with player
        this.physics.add.overlap(this.player, this.boss, this.onBossContact, null, this);
        // Boss collision with fireballs
        this.physics.add.overlap(this.abilities.fireballs, this.boss, this.onFireballHitBoss, null, this);
    }

    onBossContact(player, boss) {
        if (!boss.isActive || player.isInvincible) return;
        player.health--;
        this.healthUI.update();
        if (player.health <= 0) { this.playerDeath(); return; }
        player.isInvincible = true;
        this.tweens.add({
            targets: player, alpha: 0.3, duration: 100, yoyo: true, repeat: 7,
            onComplete: function () { player.alpha = 1; player.isInvincible = false; }
        });
        var knockDir = player.x < boss.x ? -1 : 1;
        player.setVelocity(knockDir * 250, -250);
    }

    onFireballHitBoss(fireball, boss) {
        if (!boss.isActive) return;
        fireball.destroy();
        boss.health -= FIRE_DAMAGE;
        this.tweens.add({ targets: boss, alpha: 0.3, duration: 80, yoyo: true, repeat: 3 });
        this.updateBossHealthBar();
        if (boss.health <= 0) {
            this.onBossDefeated();
        }
    }

    updateBossHealthBar() {
        var ratio = Math.max(0, this.boss.health / this.boss.maxHealth);
        this.bossHealthBar.setScale(ratio, 1);
        if (ratio < 0.3) this.bossHealthBar.setFillStyle(0xcc3333, 1);
        else if (ratio < 0.6) this.bossHealthBar.setFillStyle(0xccaa33, 1);
    }

    startBossFight() {
        if (this.bossStarted) return;
        this.bossStarted = true;
        this.gameStarted = false;
        this.player.setVelocityX(0);
        this.player.body.moves = false;

        var self = this;
        this.dialogueManager.startDialogue([
            { speaker: 'isagani', name: 'Isagani', text: "SIMOUN! I won't let you do this! Those are innocent people!" },
            { speaker: 'simoun', name: 'Simoun', text: "Innocent? The collaborators? The complicit? They feast while the people starve!" },
            { speaker: 'isagani', name: 'Isagani', text: "Paulita is in there! I will stop you, even if it costs me my life!" },
            { speaker: 'simoun', name: 'Simoun', text: "Then stand aside or face the consequences, boy." }
        ], function () {
            // Switch to boss music
            if (typeof AudioManager !== 'undefined') AudioManager.startMusic('boss');
            self.gameStarted = true;
            self.player.body.moves = true;
            self.boss.isActive = true;
            self.bossHealthBg.setVisible(true);
            self.bossHealthBar.setVisible(true);
            self.bossNameText.setVisible(true);
            self.objective.update('Defeat Isagani!');

            // Lock camera to boss arena
            self.cameras.main.setBounds(85 * TILE, 0, 15 * TILE, self.WORLD_HEIGHT);
        });
    }

    onBossDefeated() {
        this.bossDefeated = true;
        this.boss.isActive = false;
        if (typeof AudioManager !== 'undefined') { AudioManager.sfxExplosion(); AudioManager.sfxStageComplete(); AudioManager.stopMusic(); }
        this.gameStarted = false;
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;

        // Boss falls
        this.boss.setVelocity(0, 0);
        this.tweens.add({ targets: this.boss, alpha: 0.5, duration: 500 });

        var self = this;
        this.dialogueManager.startDialogue([
            { speaker: 'isagani', name: 'Isagani', text: "You... you've won. But at what cost, Simoun?" },
            { speaker: 'simoun', name: 'Simoun', text: "The cost of freedom is never too high." },
            { speaker: 'narrator', name: 'Narrator', text: "The lamp exploded. The reception was destroyed. The corrupt officials, the complicit friars — all gone in an instant." },
            { speaker: 'narrator', name: 'Narrator', text: "In the chaos that followed, Simoun emerged not as a jeweler, but as a revolutionary leader. The people, long oppressed, rallied to his cause." },
            { speaker: 'simoun', name: 'Simoun', text: "Maria Clara... I kept my promise. The Philippines will be free." },
            { speaker: 'narrator', name: 'Narrator', text: "Whether Simoun's revolution would bring true freedom or merely new tyranny... that is a story yet to be told." }
        ], function () {
            var unlocked = JSON.parse(localStorage.getItem('elfili_unlocked') || '["Stage1_Intro"]');
            if (unlocked.indexOf('EndingScene') === -1) unlocked.push('EndingScene');
            localStorage.setItem('elfili_unlocked', JSON.stringify(unlocked));
            self.scene.start(STAGES.ENDING, { ending: 'revolution' });
        });
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
            if (progress === 1) self.scene.start(STAGES.GAMEOVER, { stageName: 'Stage7B_Simoun' });
        });
    }

    updateBossAI(time) {
        if (!this.boss || !this.boss.isActive || this.bossDefeated) return;

        var boss = this.boss;
        var player = this.player;
        var dist = Phaser.Math.Distance.Between(boss.x, boss.y, player.x, player.y);

        // Face the player
        boss.facingRight = player.x > boss.x;
        boss.setFlipX(!boss.facingRight);

        // Movement - chase player
        if (dist > 60) {
            var dir = player.x > boss.x ? 1 : -1;
            boss.setVelocityX(dir * 120);
        } else {
            boss.setVelocityX(0);
        }

        // Jump if player is above
        if (player.y < boss.y - 50 && boss.body.onFloor()) {
            boss.setVelocityY(PLAYER_JUMP);
        }

        // Attack: throw projectile every 1.5 seconds
        boss.attackTimer = (boss.attackTimer || 0) + 1;
        if (boss.attackTimer > 90) {
            boss.attackTimer = 0;
            // Create a projectile
            var dir2 = boss.facingRight ? 1 : -1;
            var proj = this.physics.add.sprite(boss.x + dir2 * 16, boss.y - 4, 'sprite_lantern_fire');
            proj.setVelocityX(dir2 * 200);
            proj.setDepth(490);
            this.physics.add.overlap(this.player, proj, function (p, pr) {
                if (p.isInvincible) { pr.destroy(); return; }
                pr.destroy();
                p.health--;
                this.healthUI.update();
                if (p.health <= 0) this.playerDeath();
                p.isInvincible = true;
                this.tweens.add({
                    targets: p, alpha: 0.3, duration: 100, yoyo: true, repeat: 5,
                    onComplete: function () { p.alpha = 1; p.isInvincible = false; }
                });
            }, null, this);
            // Auto-destroy after 3 seconds
            this.time.delayedCall(3000, function () { if (proj.active) proj.destroy(); });
        }
    }

    update(time, delta) {
        if (this.dialogueManager.isActive) {
            this.dialogueManager.update();
            this.player.setVelocityX(0);
            return;
        }
        if (!this.gameStarted) return;

        // Trigger boss fight when player reaches tile 85
        if (!this.bossStarted && this.player.x > 85 * TILE) {
            this.startBossFight();
            return;
        }

        // Boss AI
        this.updateBossAI(time);

        // Melee hit on boss
        if (this.boss && this.boss.isActive && !this.bossDefeated) {
            var bDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
            // Check if melee ability was used recently (approximation - check stick sprite)
            if (bDist < MELEE_RANGE + 10 && this.player.isMeleeing) {
                this.boss.health -= MELEE_DAMAGE;
                this.updateBossHealthBar();
                this.tweens.add({ targets: this.boss, alpha: 0.3, duration: 80, yoyo: true, repeat: 2 });
                this.player.isMeleeing = false;
                if (this.boss.health <= 0) this.onBossDefeated();
            }
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
