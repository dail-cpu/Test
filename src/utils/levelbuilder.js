// ============================================================
// El Filibusterismo - Level Builder Utilities
// ============================================================
// Provides helper functions for building levels, creating
// platforms, spawning enemies, and managing common gameplay
// elements. Expects constants.js to be loaded first.
// ============================================================

class LevelBuilder {

    constructor(scene) {
        this.scene = scene;
    }

    // --------------------------------------------------------
    // 1. createPlatforms(layout, tileTexture)
    //    layout: 2D array of 0s and 1s
    //    tileTexture: string key for tile sprite
    //    Returns: Phaser static physics group
    // --------------------------------------------------------
    createPlatforms(layout, tileTexture) {
        var group = this.scene.physics.add.staticGroup();

        for (var row = 0; row < layout.length; row++) {
            for (var col = 0; col < layout[row].length; col++) {
                if (layout[row][col] === 1) {
                    var x = col * TILE + TILE / 2;
                    var y = row * TILE + TILE / 2;
                    group.create(x, y, tileTexture);
                }
            }
        }

        group.refresh();
        return group;
    }

    // --------------------------------------------------------
    // 2. createPlatformsFromString(mapString, tileTexture)
    //    mapString: multiline string using # . T E B P G N
    //    Returns: { platforms, treasures, enemies, boss,
    //               playerStart, goal, npcs }
    // --------------------------------------------------------
    createPlatformsFromString(mapString, tileTexture) {
        var lines = mapString.trim().split('\n');
        var group = this.scene.physics.add.staticGroup();
        var treasures = [];
        var enemies = [];
        var boss = null;
        var playerStart = null;
        var goal = null;
        var npcs = [];

        for (var row = 0; row < lines.length; row++) {
            var line = lines[row];
            for (var col = 0; col < line.length; col++) {
                var ch = line[col];
                var x = col * TILE + TILE / 2;
                var y = row * TILE + TILE / 2;

                switch (ch) {
                    case '#':
                        group.create(x, y, tileTexture);
                        break;
                    case 'T':
                        treasures.push({ x: x, y: y });
                        break;
                    case 'E':
                        enemies.push({ x: x, y: y });
                        break;
                    case 'B':
                        boss = { x: x, y: y };
                        break;
                    case 'P':
                        playerStart = { x: x, y: y };
                        break;
                    case 'G':
                        goal = { x: x, y: y };
                        break;
                    case 'N':
                        npcs.push({ x: x, y: y });
                        break;
                    // '.' and anything else are empty
                }
            }
        }

        group.refresh();

        return {
            platforms: group,
            treasures: treasures,
            enemies: enemies,
            boss: boss,
            playerStart: playerStart,
            goal: goal,
            npcs: npcs
        };
    }

    // --------------------------------------------------------
    // 3. createPlayer(x, y, spriteKey, config)
    //    Creates an arcade-physics player sprite with custom
    //    gameplay properties.
    // --------------------------------------------------------
    createPlayer(x, y, spriteKey, config) {
        config = config || {};
        var health = config.health !== undefined ? config.health : 5;
        var speed = config.speed !== undefined ? config.speed : PLAYER_SPEED;
        var jumpForce = config.jumpForce !== undefined ? config.jumpForce : PLAYER_JUMP;

        var player = this.scene.physics.add.sprite(x, y, spriteKey);
        player.setCollideWorldBounds(true);
        player.body.setGravityY(GRAVITY);

        if (config.bodyWidth && config.bodyHeight) {
            player.body.setSize(config.bodyWidth, config.bodyHeight);
        } else {
            player.body.setSize(20, 28);
        }

        // Custom gameplay properties
        player.health = health;
        player.maxHealth = health;
        player.speed = speed;
        player.jumpForce = jumpForce;
        player.isInvincible = false;
        player.isDashing = false;
        player.canDash = true;
        player.dashCooldownTimer = null;
        player.facingRight = true;

        // Double jump
        player.canDoubleJump = true;
        player.hasDoubleJumped = false;
        player.jumpCount = 0;
        player.maxJumps = 2;

        // Walk animation state
        player.walkTimer = 0;
        player.isMoving = false;

        return player;
    }

    // --------------------------------------------------------
    // 4. createHealthUI(player)
    //    Row of heart sprites at top-left, fixed to camera.
    //    Returns: { hearts, update() }
    // --------------------------------------------------------
    createHealthUI(player) {
        var scene = this.scene;
        var hearts = [];
        var startX = 20;
        var startY = 20;
        var spacing = 28;

        for (var i = 0; i < player.maxHealth; i++) {
            var heart = scene.add.image(startX + i * spacing, startY, 'sprite_heart');
            heart.setScrollFactor(0);
            heart.setDepth(900);
            heart.setScale(1.5);
            hearts.push(heart);
        }

        return {
            hearts: hearts,
            update: function () {
                for (var i = 0; i < hearts.length; i++) {
                    if (i < player.health) {
                        hearts[i].setAlpha(1);
                        hearts[i].setTint(0xff3333);
                    } else {
                        hearts[i].setAlpha(0.3);
                        hearts[i].clearTint();
                    }
                }
            }
        };
    }

    // --------------------------------------------------------
    // 5. createTreasures(positions, textureKey)
    //    Creates a dynamic physics group of treasure sprites
    //    with a bobbing tween animation.
    // --------------------------------------------------------
    createTreasures(positions, textureKey) {
        var scene = this.scene;
        var group = scene.physics.add.group({ allowGravity: false });

        for (var i = 0; i < positions.length; i++) {
            var pos = positions[i];
            var treasure = group.create(pos.x, pos.y, textureKey);
            treasure.body.setAllowGravity(false);

            scene.tweens.add({
                targets: treasure,
                y: pos.y - 6,
                duration: 800 + Math.random() * 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        return group;
    }

    // --------------------------------------------------------
    // 6. createEnemies(positions, spriteKey, config)
    //    Creates enemy sprites with simple patrol AI.
    // --------------------------------------------------------
    createEnemies(positions, spriteKey, config) {
        config = config || {};
        var enemyHealth = config.health !== undefined ? config.health : 2;
        var enemySpeed = config.speed !== undefined ? config.speed : 60;
        var patrol = config.patrol !== undefined ? config.patrol : true;
        var patrolDistance = config.patrolDistance !== undefined ? config.patrolDistance : 100;

        var scene = this.scene;
        var group = scene.physics.add.group();

        for (var i = 0; i < positions.length; i++) {
            var pos = positions[i];
            var enemy = group.create(pos.x, pos.y, spriteKey);

            enemy.health = enemyHealth;
            enemy.maxHealth = enemyHealth;
            enemy.speed = enemySpeed;
            enemy.patrolLeft = pos.x - patrolDistance / 2;
            enemy.patrolRight = pos.x + patrolDistance / 2;
            enemy.patrolDirection = 1;
            enemy.isPatrolling = patrol;
            enemy.originX = pos.x;

            enemy.body.setGravityY(GRAVITY);
            enemy.body.setCollideWorldBounds(true);

            if (config.bodyWidth && config.bodyHeight) {
                enemy.body.setSize(config.bodyWidth, config.bodyHeight);
            }
        }

        // Add patrol update logic
        scene.events.on('update', function () {
            group.getChildren().forEach(function (enemy) {
                if (!enemy.active || !enemy.isPatrolling) return;

                enemy.setVelocityX(enemy.speed * enemy.patrolDirection);

                if (enemy.patrolDirection === 1 && enemy.x >= enemy.patrolRight) {
                    enemy.patrolDirection = -1;
                    enemy.setFlipX(false);
                } else if (enemy.patrolDirection === -1 && enemy.x <= enemy.patrolLeft) {
                    enemy.patrolDirection = 1;
                    enemy.setFlipX(true);
                }
            });
        });

        return group;
    }

    // --------------------------------------------------------
    // 7. createTreasureCounter()
    //    UI element showing treasure count at top-right.
    // --------------------------------------------------------
    createTreasureCounter() {
        var scene = this.scene;
        var x = GAME_WIDTH - 80;
        var y = 20;

        var icon = scene.add.image(x, y, 'sprite_treasure');
        icon.setScrollFactor(0);
        icon.setDepth(900);
        icon.setScale(1.2);

        var text = scene.add.text(x + 18, y - 8, 'x 0', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        });
        text.setScrollFactor(0);
        text.setDepth(900);

        var counter = {
            count: 0,
            increment: function () {
                counter.count++;
                text.setText('x ' + counter.count);
                if (typeof AudioManager !== 'undefined') AudioManager.sfxCollect();
            },
            getText: function () {
                return 'x ' + counter.count;
            }
        };

        return counter;
    }

    // --------------------------------------------------------
    // 8. createStageTitle(title, subtitle)
    //    Large centered title that fades in, holds, fades out.
    //    Returns a Promise that resolves when the animation
    //    is complete (~3 seconds).
    // --------------------------------------------------------
    createStageTitle(title, subtitle) {
        var scene = this.scene;
        var centerX = GAME_WIDTH / 2;
        var centerY = GAME_HEIGHT / 2 - 30;

        var titleText = scene.add.text(centerX, centerY, title, {
            fontFamily: 'serif',
            fontSize: '42px',
            color: '#f0ead6',
            stroke: '#1a1a2e',
            strokeThickness: 6,
            align: 'center'
        });
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);
        titleText.setDepth(950);
        titleText.setAlpha(0);

        var subtitleText = scene.add.text(centerX, centerY + 50, subtitle || '', {
            fontFamily: 'serif',
            fontSize: '20px',
            color: '#d4c8a8',
            stroke: '#1a1a2e',
            strokeThickness: 4,
            align: 'center'
        });
        subtitleText.setOrigin(0.5);
        subtitleText.setScrollFactor(0);
        subtitleText.setDepth(950);
        subtitleText.setAlpha(0);

        return new Promise(function (resolve) {
            // Fade in over 600ms
            scene.tweens.add({
                targets: [titleText, subtitleText],
                alpha: 1,
                duration: 600,
                ease: 'Power2',
                onComplete: function () {
                    // Hold for 1800ms, then fade out over 600ms
                    scene.time.delayedCall(1800, function () {
                        scene.tweens.add({
                            targets: [titleText, subtitleText],
                            alpha: 0,
                            duration: 600,
                            ease: 'Power2',
                            onComplete: function () {
                                titleText.destroy();
                                subtitleText.destroy();
                                resolve();
                            }
                        });
                    });
                }
            });
        });
    }

    // --------------------------------------------------------
    // 9. setupCamera(player, worldWidth, worldHeight)
    //    Configures the main camera to follow the player with
    //    smooth scrolling and deadzone.
    // --------------------------------------------------------
    setupCamera(player, worldWidth, worldHeight) {
        var camera = this.scene.cameras.main;

        camera.setBounds(0, 0, worldWidth, worldHeight);
        camera.startFollow(player, true, 0.08, 0.08);
        camera.setDeadzone(80, 50);

        this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        return camera;
    }

    // --------------------------------------------------------
    // 10. createTimer(seconds, x, y)
    //     Visible countdown timer in MM:SS format.
    //     Returns: { start(), stop(), getRemaining(),
    //                onExpire: callback }
    // --------------------------------------------------------
    createTimer(seconds, x, y) {
        var scene = this.scene;
        x = x !== undefined ? x : GAME_WIDTH / 2;
        y = y !== undefined ? y : 18;

        var remaining = seconds;
        var running = false;
        var timerEvent = null;

        function formatTime(sec) {
            var m = Math.floor(sec / 60);
            var s = sec % 60;
            return (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s);
        }

        var text = scene.add.text(x, y, formatTime(remaining), {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#f0ead6',
            stroke: '#1a1a2e',
            strokeThickness: 4,
            align: 'center'
        });
        text.setOrigin(0.5, 0);
        text.setScrollFactor(0);
        text.setDepth(900);

        var timer = {
            onExpire: null,

            start: function () {
                if (running) return;
                running = true;
                timerEvent = scene.time.addEvent({
                    delay: 1000,
                    repeat: remaining - 1,
                    callback: function () {
                        remaining--;
                        text.setText(formatTime(remaining));

                        // Flash red when low on time
                        if (remaining <= 10) {
                            text.setColor('#ff3333');
                        }

                        if (remaining <= 0) {
                            running = false;
                            if (timer.onExpire) {
                                timer.onExpire();
                            }
                        }
                    }
                });
            },

            stop: function () {
                running = false;
                if (timerEvent) {
                    timerEvent.remove(false);
                    timerEvent = null;
                }
            },

            getRemaining: function () {
                return remaining;
            }
        };

        return timer;
    }

    // --------------------------------------------------------
    // 11. createObjective(text)
    //     Shows current objective at top-center of screen.
    //     Returns: { update(newText), complete() }
    // --------------------------------------------------------
    createObjective(objectiveText) {
        var scene = this.scene;
        var centerX = GAME_WIDTH / 2;

        var bg = scene.add.rectangle(centerX, 50, 320, 30, 0x1a1a2e, 0.7);
        bg.setScrollFactor(0);
        bg.setDepth(890);
        bg.setStrokeStyle(1, 0x8b7355);

        var label = scene.add.text(centerX, 50, objectiveText, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#f0ead6',
            align: 'center'
        });
        label.setOrigin(0.5);
        label.setScrollFactor(0);
        label.setDepth(891);

        return {
            update: function (newText) {
                label.setText(newText);
                // Resize background to fit new text
                bg.setSize(Math.max(320, label.width + 40), 30);
            },

            complete: function () {
                label.setText('\u2713 ' + label.text);
                label.setColor('#66ff66');
                scene.tweens.add({
                    targets: [label, bg],
                    alpha: 0,
                    duration: 1500,
                    delay: 800,
                    ease: 'Power2'
                });
            }
        };
    }

    // --------------------------------------------------------
    // 12. applyPlayerAbilities(player, scene)
    //     Adds melee, ranged, and dash abilities to the player.
    //     Returns: { melee(), fire(), dash(), fireballs }
    // --------------------------------------------------------
    applyPlayerAbilities(player, scene) {
        scene = scene || this.scene;

        var canMelee = true;
        var canFire = true;
        var fireballs = scene.physics.add.group({ allowGravity: false });

        // Track melee hitbox for external collision checks
        var meleeHitbox = null;

        // --- Melee (walking stick) ---
        function melee() {
            if (!canMelee || !player.active) return;
            canMelee = false;
            if (typeof AudioManager !== 'undefined') AudioManager.sfxMelee();
            player.isMeleeing = true;
            scene.time.delayedCall(200, function () { player.isMeleeing = false; });

            var direction = player.facingRight ? 1 : -1;
            var hitX = player.x + direction * MELEE_RANGE;
            var hitY = player.y;

            // Create temporary hitbox
            meleeHitbox = scene.add.rectangle(hitX, hitY, MELEE_RANGE, 24, 0xffffff, 0);
            scene.physics.add.existing(meleeHitbox, false);
            meleeHitbox.body.setAllowGravity(false);
            meleeHitbox.damage = MELEE_DAMAGE;

            // Swing visual - a short stick sprite that rotates
            var stick = scene.add.rectangle(
                player.x + direction * 12, player.y - 4,
                MELEE_RANGE, 4, 0x6b4226
            );
            stick.setDepth(500);
            stick.setOrigin(direction > 0 ? 0 : 1, 0.5);

            scene.tweens.add({
                targets: stick,
                angle: direction > 0 ? 60 : -60,
                duration: 150,
                yoyo: true,
                onComplete: function () {
                    stick.destroy();
                }
            });

            // Remove hitbox after a short window
            scene.time.delayedCall(150, function () {
                if (meleeHitbox) {
                    meleeHitbox.destroy();
                    meleeHitbox = null;
                }
            });

            // Cooldown
            scene.time.delayedCall(300, function () {
                canMelee = true;
            });
        }

        // --- Ranged (lantern fire) ---
        function fire() {
            if (!canFire || !player.active) return;
            canFire = false;
            if (typeof AudioManager !== 'undefined') AudioManager.sfxFire();

            var direction = player.facingRight ? 1 : -1;
            var fireball = fireballs.create(
                player.x + direction * 16,
                player.y - 4,
                'sprite_lantern_fire'
            );

            fireball.body.setAllowGravity(false);
            fireball.setVelocityX(FIRE_SPEED * direction);
            fireball.damage = FIRE_DAMAGE;
            fireball.spawnX = fireball.x;
            fireball.maxDistance = 600;
            fireball.direction = direction;

            // Flip sprite if going left
            if (direction < 0) {
                fireball.setFlipX(true);
            }

            // Cooldown
            scene.time.delayedCall(FIRE_COOLDOWN, function () {
                canFire = true;
            });
        }

        // Update loop: destroy fireballs that exceed travel distance
        scene.events.on('update', function () {
            fireballs.getChildren().forEach(function (fb) {
                if (!fb.active) return;
                var traveled = Math.abs(fb.x - fb.spawnX);
                if (traveled >= fb.maxDistance) {
                    fb.destroy();
                }
            });
        });

        // --- Dash ---
        function dash() {
            if (!player.canDash || player.isDashing || !player.active) return;
            player.canDash = false;
            player.isDashing = true;
            player.isInvincible = true;
            if (typeof AudioManager !== 'undefined') AudioManager.sfxDash();

            var direction = player.facingRight ? 1 : -1;
            player.setVelocityX(PLAYER_DASH_SPEED * direction);

            // Afterimage trail - 3 fading copies
            for (var i = 0; i < 3; i++) {
                (function (index) {
                    scene.time.delayedCall(index * 50, function () {
                        if (!player.active) return;
                        var ghost = scene.add.sprite(player.x, player.y, player.texture.key);
                        ghost.setAlpha(0.5 - index * 0.15);
                        ghost.setTint(0x4488cc);
                        ghost.setDepth(player.depth - 1);
                        ghost.setFlipX(!player.facingRight);

                        scene.tweens.add({
                            targets: ghost,
                            alpha: 0,
                            duration: 250,
                            onComplete: function () {
                                ghost.destroy();
                            }
                        });
                    });
                })(i);
            }

            // End dash after duration
            scene.time.delayedCall(PLAYER_DASH_DURATION, function () {
                player.isDashing = false;
                player.isInvincible = false;
            });

            // Dash cooldown
            player.dashCooldownTimer = scene.time.delayedCall(PLAYER_DASH_COOLDOWN, function () {
                player.canDash = true;
                player.dashCooldownTimer = null;
            });
        }

        // --- Key bindings ---
        var keys = scene.input.keyboard.addKeys({
            meleeX: Phaser.Input.Keyboard.KeyCodes.X,
            meleeJ: Phaser.Input.Keyboard.KeyCodes.J,
            fireC: Phaser.Input.Keyboard.KeyCodes.C,
            fireK: Phaser.Input.Keyboard.KeyCodes.K,
            dashShift: Phaser.Input.Keyboard.KeyCodes.SHIFT
        });

        scene.input.keyboard.on('keydown-X', melee);
        scene.input.keyboard.on('keydown-J', melee);
        scene.input.keyboard.on('keydown-C', fire);
        scene.input.keyboard.on('keydown-K', fire);
        scene.input.keyboard.on('keydown-SHIFT', dash);

        return {
            melee: melee,
            fire: fire,
            dash: dash,
            fireballs: fireballs
        };
    }

    // --------------------------------------------------------
    // 13. handleJump(player, jumpKeys)
    //     Handles single + double jump logic.
    //     Call from scene update(). jumpKeys = { up, space, w }
    //     Returns true if a jump was triggered.
    // --------------------------------------------------------
    static handleJump(player, isJumpPressed) {
        if (!isJumpPressed) return false;

        if (player.body.onFloor()) {
            player.setVelocityY(player.jumpForce || PLAYER_JUMP);
            player.jumpCount = 1;
            player.hasDoubleJumped = false;
            if (typeof AudioManager !== 'undefined') AudioManager.sfxJump();
            return true;
        } else if (player.jumpCount < player.maxJumps && !player.hasDoubleJumped) {
            player.setVelocityY((player.jumpForce || PLAYER_JUMP) * 0.85);
            player.jumpCount = 2;
            player.hasDoubleJumped = true;
            if (typeof AudioManager !== 'undefined') AudioManager.sfxDoubleJump();
            return true;
        }
        return false;
    }

    // --------------------------------------------------------
    // 14. updateWalkAnimation(player, time)
    //     Plays proper frame-based walk/idle/jump animations.
    //     Requires animated spritesheet created by makeAnimatedChar.
    // --------------------------------------------------------
    static updateWalkAnimation(player, time) {
        if (!player || !player.active) return;

        var moving = Math.abs(player.body.velocity.x) > 10;
        var onFloor = player.body.onFloor();
        var texKey = player.texture.key.replace('_sheet', '');

        // Try to use spritesheet animations
        var walkAnim = texKey + '_walk';
        var idleAnim = texKey + '_idle';
        var jumpAnim = texKey + '_jump';

        var hasAnims = player.scene.anims.exists(walkAnim);

        if (hasAnims) {
            if (!onFloor) {
                // In air
                if (player.anims.currentAnim && player.anims.currentAnim.key !== jumpAnim) {
                    player.play(jumpAnim, true);
                }
            } else if (moving) {
                // Walking on ground
                if (!player.anims.currentAnim || player.anims.currentAnim.key !== walkAnim) {
                    player.play(walkAnim, true);
                }
            } else {
                // Idle on ground
                if (!player.anims.currentAnim || player.anims.currentAnim.key !== idleAnim) {
                    player.play(idleAnim, true);
                }
            }
        }

        // Keep scale normal
        player.setScale(1, 1);
    }
}
