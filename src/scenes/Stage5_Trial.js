// ============================================================
// El Filibusterismo - Stage 5: The Crackdown
// ============================================================
// Mock trial, Placido's humiliation, student arrests.
// Phase 1: Dialogue in the classroom.
// Phase 2: Escape as Isagani from the Guardia Civil.
// ============================================================

class Stage5_Trial extends Phaser.Scene {

    constructor() {
        super('Stage5_Trial');
    }

    create() {
        var self = this;
        this.WORLD_WIDTH = 100 * TILE;
        this.WORLD_HEIGHT = 17 * TILE;
        this.gameStarted = false;
        this.phase = 1; // 1 = classroom dialogue, 2 = escape action
        this.lastGroundPos = { x: 0, y: 0 };
        this.goalReached = false;

        // Background
        this.createBackground();

        // Level
        this.levelBuilder = new LevelBuilder(this);
        var mapData = this.levelBuilder.createPlatformsFromString(this.getLevelMap(), 'tile_stone');
        this.platforms = mapData.platforms;

        // Player - Isagani
        var pStart = mapData.playerStart || { x: 80, y: 400 };
        this.player = this.levelBuilder.createPlayer(pStart.x, pStart.y, 'sprite_isagani', {
            health: 4, speed: PLAYER_SPEED, jumpForce: PLAYER_JUMP
        });
        this.player.setDepth(500);
        this.lastGroundPos.x = pStart.x;
        this.lastGroundPos.y = pStart.y;

        this.physics.add.collider(this.player, this.platforms);
        this.abilities = this.levelBuilder.applyPlayerAbilities(this.player, this);

        // Enemies - start invisible, appear in phase 2
        this.enemies = this.levelBuilder.createEnemies(
            mapData.enemies, 'sprite_guardia',
            { health: 2, speed: 60, patrol: true, patrolDistance: 80 }
        );
        this.enemies.getChildren().forEach(function (e) { e.setVisible(false); e.body.enable = false; });
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyContact, null, this);
        this.physics.add.overlap(this.abilities.fireballs, this.enemies, this.onFireballHitEnemy, null, this);

        // Goal
        if (mapData.goal) {
            this.goalZone = this.add.rectangle(mapData.goal.x, mapData.goal.y, TILE * 2, TILE * 2, 0x44ff44, 0.25);
            this.physics.add.existing(this.goalZone, true);
            this.tweens.add({ targets: this.goalZone, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });
            this.physics.add.overlap(this.player, this.goalZone, this.onReachGoal, null, this);
        }

        // UI
        this.healthUI = this.levelBuilder.createHealthUI(this.player);
        this.objective = this.levelBuilder.createObjective('Listen to the proceedings');

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

        // Night music for the crackdown
        if (typeof AudioManager !== 'undefined') AudioManager.startMusic('night');

        this.levelBuilder.createStageTitle('Chapter V: The Crackdown', 'The death of the academy dream').then(function () {
            self.startPhase1Dialogue();
        });
    }

    getLevelMap() {
        // Phase 1 (tiles 0-40): school interior, mostly flat
        // Phase 2 (tiles 40-100): escape through streets and rooftops
        // DESIGN: Phase 1 (tiles 0-40) flat school, Phase 2 (40+) escape through streets.
        // Ground at row 12. Escape section has rooftop platforming (row 8-10).
        return [
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '....................................................................................................',
            '...................................................T.............................T...................',
            '.................................................####...E......T.....####......####.........T.......',
            '........................................T.......######.......####....######....######...E...####.....',
            '..................................E...####..E..########....######...########..########.....######..G.',
            '..P...........................######.######...########...########.#########.#########....########...',
            '############################################.###.####.###.####.###.####.###.####.###.##.#########.',
            '############################################.###.####.###.####.###.####.###.####.###.##.##########',
            '############################################################################################################',
            '############################################################################################################',
            '############################################################################################################'
        ].join('\n');
    }

    createBackground() {
        var g = this.add.graphics();
        // Interior lighting for phase 1, dark streets for phase 2
        for (var i = 0; i < GAME_HEIGHT; i++) {
            var t = i / GAME_HEIGHT;
            var r = Math.floor(0x1a + (0x2a - 0x1a) * t);
            var gr = Math.floor(0x1a + (0x22 - 0x1a) * t);
            var b = Math.floor(0x2e + (0x3e - 0x2e) * t);
            g.fillStyle((r << 16) | (gr << 8) | b, 1);
            g.fillRect(0, i, GAME_WIDTH, 1);
        }
        g.setScrollFactor(0);
        g.setDepth(-100);
    }

    startPhase1Dialogue() {
        var self = this;
        this.dialogueManager.startDialogue([
            { speaker: 'narrator', name: 'Narrator', text: "In the university, the students' hope for change was about to be crushed — not by argument, but by power." },
            { speaker: 'camorra', name: 'Padre Camorra', text: "Ah, Señor Penitente! Perhaps you can explain to the class why you dare question the Church's authority?" },
            { speaker: 'placido', name: 'Placido Penitente', text: "I only asked why we cannot study Spanish properly, Padre." },
            { speaker: 'camorra', name: 'Padre Camorra', text: "INSOLENCE! You want to learn Spanish so you can write seditious pamphlets, is that it?" },
            { speaker: 'placido', name: 'Placido Penitente', text: "I want to learn Spanish so I can understand the laws that govern my own country!" },
            { speaker: 'camorra', name: 'Padre Camorra', text: "Get out of my classroom! You are suspended!" },
            { speaker: 'narrator', name: 'Narrator', text: "Placido Penitente was expelled from the university. But worse was yet to come." },
            { speaker: 'irene', name: 'Padre Irene', text: "The Governor-General has denied the petition for the Academy of Spanish." },
            { speaker: 'isagani', name: 'Isagani', text: "On what grounds?!" },
            { speaker: 'irene', name: 'Padre Irene', text: "On the grounds that it is not needed. The natives have their own dialects. That should suffice." },
            { speaker: 'sibyla', name: 'Padre Sibyla', text: "Furthermore, we have evidence that the student organizers are connected to a subversive movement." },
            { speaker: 'isagani', name: 'Isagani', text: "That is a LIE!" },
            { speaker: 'guardia', name: 'Guardia Civil', text: "By order of the Governor-General, all students involved in the academy petition are under arrest!" },
            { speaker: 'isagani', name: 'Isagani', text: "We have to run! They'll throw us in prison without trial!" },
            { speaker: 'basilio', name: 'Basilio', text: "Go, Isagani! I'll try to reason with them!" },
            { speaker: 'narrator', name: 'Narrator', text: "As the Guardia Civil descended on the university, the students scattered into the streets of Manila." }
        ], function () {
            self.startPhase2();
        });
    }

    startPhase2() {
        this.phase = 2;
        this.gameStarted = true;
        this.player.body.moves = true;
        this.objective.update('Escape the Guardia Civil!');
        // Switch to action music for escape
        if (typeof AudioManager !== 'undefined') AudioManager.startMusic('action');

        // Enable enemies
        this.enemies.getChildren().forEach(function (e) {
            e.setVisible(true);
            e.body.enable = true;
        });

        // Camera shake for urgency
        this.cameras.main.shake(500, 0.01);
    }

    collectTreasure(player, treasure) {
        treasure.destroy();
        if (this.treasureCounter) this.treasureCounter.increment();
    }

    onPlayerEnemyContact(player, enemy) {
        if (player.isInvincible || this.phase !== 2) return;
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
            if (progress === 1) self.scene.restart();
        });
    }

    onReachGoal() {
        if (this.goalReached || this.phase !== 2) return;
        this.goalReached = true;
        if (typeof AudioManager !== 'undefined') AudioManager.sfxStageComplete();
        this.gameStarted = false;
        this.player.setVelocity(0, 0);
        this.player.body.moves = false;

        var self = this;
        this.dialogueManager.startDialogue([
            { speaker: 'isagani', name: 'Isagani', text: "I made it... but how many were not so lucky?" },
            { speaker: 'narrator', name: 'Narrator', text: "Many students were arrested that night. The dream of the Academy of Spanish was dead. Basilio was among those taken, his medical studies destroyed." },
            { speaker: 'narrator', name: 'Narrator', text: "But in the shadows, Simoun smiled. Every act of injustice brought his plan closer to fruition." }
        ], function () {
            var unlocked = JSON.parse(localStorage.getItem('elfili_unlocked') || '["Stage1_Intro"]');
            if (unlocked.indexOf('Stage6_Reception') === -1) unlocked.push('Stage6_Reception');
            localStorage.setItem('elfili_unlocked', JSON.stringify(unlocked));
            self.cameras.main.fade(1500, 0, 0, 0, false, function (cam, p) {
                if (p === 1) self.scene.start(STAGES.STAGE6);
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
