// ============================================================
// El Filibusterismo - Stage 3: The Academy of Spanish
// ============================================================
// A dialogue-driven level where Isagani walks through the
// school convincing faculty to support the Spanish academy.
// No combat — interaction with NPCs drives the narrative.
// ============================================================

class Stage3_School extends Phaser.Scene {

    constructor() {
        super('Stage3_School');
    }

    create() {
        var self = this;

        // -- State tracking --
        this.supportersGained = 0;
        this.totalSupportersNeeded = 3;
        this.npcTalkedTo = [false, false, false, false, false]; // professor, placido, dean, basilio, rector
        this.dialogueActive = false;
        this.stageComplete = false;
        this.interactPrompt = null;
        this.nearbyNPC = null;

        // -- Level builder --
        this.lb = new LevelBuilder(this);

        // -- World dimensions --
        this.worldWidth = 80 * TILE;  // 2560px
        this.worldHeight = 17 * TILE; // 544px

        // -- Build the level map --
        this.buildLevel();

        // -- Create player (Isagani) --
        var ps = this.mapData.playerStart;
        this.player = this.lb.createPlayer(ps.x, ps.y, 'sprite_isagani', {
            health: 5,
            speed: PLAYER_SPEED,
            jumpForce: PLAYER_JUMP
        });

        // -- Physics: player collides with platforms --
        this.physics.add.collider(this.player, this.mapData.platforms);

        // -- Camera --
        this.lb.setupCamera(this.player, this.worldWidth, this.worldHeight);

        // -- Create NPC sprites --
        this.createNPCs();

        // -- Create interaction prompt (hidden) --
        this.interactPrompt = this.add.text(0, 0, 'Press SPACE to talk', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffd700',
            stroke: '#1a1a2e',
            strokeThickness: 3,
            align: 'center'
        });
        this.interactPrompt.setOrigin(0.5);
        this.interactPrompt.setDepth(800);
        this.interactPrompt.setVisible(false);

        // -- Dialogue manager --
        this.dm = new DialogueManager(this);

        // -- Objective UI --
        this.objective = this.lb.createObjective('Convince 3 faculty members to support the Academy');

        // -- No health UI needed for this peaceful stage --

        // -- Input --
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // -- Background decoration --
        this.createBackground();

        // -- Stage title + opening narration --
        this.player.setVelocity(0, 0);
        this.dialogueActive = true;

        this.lb.createStageTitle(
            'Chapter III: The Academy of Spanish',
            'Isagani fights for education'
        ).then(function () {
            self.startOpeningDialogue();
        });
    }

    // --------------------------------------------------------
    // Build level from string map
    // --------------------------------------------------------
    buildLevel() {
        // 80 tiles wide x 17 tiles tall
        // Layout: school interior with hallways and rooms
        // '#' = solid wall/floor, '.' = empty, 'P' = player, 'N' = NPC, 'G' = goal
        //
        // Rooms are separated by wall columns with door gaps.
        // Floor is at row 15 (second to last), walls at row 16 (bottom).
        // Ceiling at row 0-1.
        var mapString = [
            '################################################################################',
            '#..............................................................................#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#..............#..............#..........#..............#..........#.............#',
            '#...P..........#.....N.......#...N......#......N......#...N......#......N...G..#',
            '################################################################################',
            '################################################################################'
        ].join('\n');

        // Use school wall tiles for structure
        this.mapData = this.lb.createPlatformsFromString(mapString, 'tile_school_wall');

        // Add floor layer with reception floor tiles over the walkable area
        this.createFloorDecoration();
    }

    // --------------------------------------------------------
    // Floor decoration overlay
    // --------------------------------------------------------
    createFloorDecoration() {
        // Add reception floor tiles along the walking row (row 14)
        // and wooden door frames at room entrances
        var floorGroup = this.physics.add.staticGroup();

        // Wooden door frames between rooms (decorative, on the wall columns)
        var doorPositions = [
            { col: 15, rows: [12, 13, 14] },
            { col: 30, rows: [12, 13, 14] },
            { col: 40, rows: [12, 13, 14] },
            { col: 55, rows: [12, 13, 14] },
            { col: 65, rows: [12, 13, 14] }
        ];

        for (var d = 0; d < doorPositions.length; d++) {
            var door = doorPositions[d];
            for (var r = 0; r < door.rows.length; r++) {
                var dx = door.col * TILE + TILE / 2;
                var dy = door.rows[r] * TILE + TILE / 2;
                var doorTile = this.add.image(dx, dy, 'tile_wood');
                doorTile.setDepth(1);
            }
        }
    }

    // --------------------------------------------------------
    // Background visuals (warm school interior)
    // --------------------------------------------------------
    createBackground() {
        // Warm interior gradient background behind everything
        var bg = this.add.graphics();
        bg.setDepth(-10);
        bg.setScrollFactor(0.1); // Slight parallax

        // Warm brownish interior gradient
        var steps = 16;
        var stripH = Math.ceil(this.worldHeight / steps);
        for (var i = 0; i < steps; i++) {
            var t = i / (steps - 1);
            var r = Math.floor(60 + 30 * (1 - t));
            var g = Math.floor(40 + 20 * (1 - t));
            var b = Math.floor(25 + 10 * (1 - t));
            var color = (r << 16) | (g << 8) | b;
            bg.fillStyle(color, 1);
            bg.fillRect(0, i * stripH, this.worldWidth, stripH + 1);
        }

        // Add some window-light rectangles in the background for atmosphere
        for (var w = 0; w < 6; w++) {
            var windowLight = this.add.rectangle(
                120 + w * 420, 100,
                60, 80,
                0xccaa66, 0.15
            );
            windowLight.setDepth(-5);
            windowLight.setScrollFactor(0.2);
        }
    }

    // --------------------------------------------------------
    // Create NPC sprites at map positions
    // --------------------------------------------------------
    createNPCs() {
        var npcPositions = this.mapData.npcs;
        this.npcSprites = [];

        // NPC definitions in order of map placement (left to right):
        // 0: Professor (Room 1, ~col 20)
        // 1: Placido (Hallway, ~col 33)
        // 2: Dean (Room 2, ~col 46)
        // 3: Basilio (Hallway, ~col 58)
        // 4: Rector (Room 3, ~col 71)
        var npcDefs = [
            { name: 'Professor', sprite: 'sprite_friar', tint: 0xd4c8a8, scale: 1 },
            { name: 'Placido', sprite: 'sprite_placido', tint: null, scale: 1 },
            { name: 'Dean', sprite: 'sprite_friar', tint: 0xc6a664, scale: 1 },
            { name: 'Basilio', sprite: 'sprite_basilio', tint: null, scale: 1 },
            { name: 'Rector', sprite: 'sprite_friar', tint: 0xe8e0d0, scale: 1 }
        ];

        for (var i = 0; i < npcPositions.length && i < npcDefs.length; i++) {
            var pos = npcPositions[i];
            var def = npcDefs[i];

            var npc = this.physics.add.sprite(pos.x, pos.y, def.sprite);
            npc.body.setAllowGravity(true);
            npc.body.setGravityY(GRAVITY);
            npc.body.setImmovable(true);
            npc.body.setCollideWorldBounds(true);
            npc.setDepth(100);

            if (def.tint) {
                npc.setTint(def.tint);
            }

            npc.npcIndex = i;
            npc.npcName = def.name;

            // Collide NPC with platforms
            this.physics.add.collider(npc, this.mapData.platforms);

            // Exclamation mark indicator above NPC
            var indicator = this.add.text(pos.x, pos.y - 30, '!', {
                fontFamily: 'serif',
                fontSize: '22px',
                color: '#ffd700',
                stroke: '#1a1a2e',
                strokeThickness: 4
            });
            indicator.setOrigin(0.5);
            indicator.setDepth(150);
            npc.indicator = indicator;

            // Bobbing animation on the indicator
            this.tweens.add({
                targets: indicator,
                y: pos.y - 38,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.npcSprites.push(npc);
        }
    }

    // --------------------------------------------------------
    // Opening narration dialogue
    // --------------------------------------------------------
    startOpeningDialogue() {
        var self = this;

        var dialogue = [
            {
                speaker: 'narrator',
                name: 'Narrator',
                text: 'While Simoun plotted in the shadows, the students waged their own battle \u2014 to establish an academy where Filipinos could learn Spanish, the language of law and government.'
            },
            {
                speaker: 'isagani',
                name: 'Isagani',
                text: 'If we can speak their language, they can no longer hide injustice behind words we do not understand.'
            }
        ];

        this.dm.startDialogue(dialogue, function () {
            self.dialogueActive = false;
        });
    }

    // --------------------------------------------------------
    // NPC dialogue sequences
    // --------------------------------------------------------
    getNPCDialogue(npcIndex) {
        var self = this;

        switch (npcIndex) {
            // NPC 0: Professor (Room 1)
            case 0:
                return {
                    dialogue: [
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'Professor, we have gathered signatures from the students. Will you support our petition for the Spanish academy?'
                        },
                        {
                            speaker: 'narrator',
                            name: 'Professor',
                            text: 'The idea has merit, Isagani. But you must understand the political difficulties...'
                        },
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'We understand the risks. But education should not be a privilege reserved for Spaniards!'
                        },
                        {
                            speaker: 'narrator',
                            name: 'Professor',
                            text: 'Very well. You have my support. But be careful \u2014 the friars will not take kindly to this.'
                        }
                    ],
                    onComplete: function () {
                        self.supportersGained++;
                        self.objective.update('Supporters: ' + self.supportersGained + '/' + self.totalSupportersNeeded);
                    }
                };

            // NPC 1: Placido (Hallway)
            case 1:
                return {
                    dialogue: [
                        {
                            speaker: 'placido',
                            name: 'Placido',
                            text: 'Isagani! Have you heard? The friars are already trying to block the academy.'
                        },
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'Let them try. Justice and reason are on our side.'
                        },
                        {
                            speaker: 'placido',
                            name: 'Placido',
                            text: 'I wish I had your optimism. The system is designed to crush us.'
                        }
                    ],
                    onComplete: function () {
                        // Placido is not a faculty supporter, just story
                    }
                };

            // NPC 2: Dean (Room 2)
            case 2:
                return {
                    dialogue: [
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'Dean, we request your formal endorsement for the Academy of Spanish.'
                        },
                        {
                            speaker: 'narrator',
                            name: 'Dean',
                            text: 'Isagani, you put me in a difficult position. The Archbishop himself has expressed... concerns.'
                        },
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'With respect, sir, the students have a right to learn the language of their own government.'
                        },
                        {
                            speaker: 'narrator',
                            name: 'Dean',
                            text: '... I will consider it. But I make no promises.'
                        }
                    ],
                    onComplete: function () {
                        self.supportersGained++;
                        self.objective.update('Supporters: ' + self.supportersGained + '/' + self.totalSupportersNeeded);
                    }
                };

            // NPC 3: Basilio (Hallway)
            case 3:
                return {
                    dialogue: [
                        {
                            speaker: 'basilio',
                            name: 'Basilio',
                            text: 'Any luck with the dean?'
                        },
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'He\'s wavering. We need one more voice.'
                        },
                        {
                            speaker: 'basilio',
                            name: 'Basilio',
                            text: 'Try the old rector. He\'s been sympathetic before.'
                        }
                    ],
                    onComplete: function () {
                        // Basilio is not a faculty supporter, just story
                    }
                };

            // NPC 4: Rector (Room 3) — triggers the climax
            case 4:
                return {
                    dialogue: [
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'Rector, the students and two faculty members support the Academy. We need your final approval.'
                        },
                        {
                            speaker: 'narrator',
                            name: 'Rector',
                            text: 'Isagani, I have always believed in the power of education...'
                        },
                        // Friars burst in
                        {
                            speaker: 'sibyla',
                            name: 'Padre Sibyla',
                            text: 'ENOUGH! This academy is nothing but a scheme to breed subversion!'
                        },
                        {
                            speaker: 'irene',
                            name: 'Padre Irene',
                            text: 'The natives have no need for Spanish. Let them learn their catechism and be content.'
                        },
                        {
                            speaker: 'camorra',
                            name: 'Padre Camorra',
                            text: 'Who put these ideas into your heads? Was it that jeweler... Simoun?'
                        },
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'This is about EDUCATION, not politics!'
                        },
                        {
                            speaker: 'sibyla',
                            name: 'Padre Sibyla',
                            text: 'Everything is politics, boy. The academy will NOT be permitted.'
                        },
                        {
                            speaker: 'narrator',
                            name: 'Rector',
                            text: 'I... I\'m sorry, Isagani. My hands are tied.'
                        },
                        {
                            speaker: 'isagani',
                            name: 'Isagani',
                            text: 'Then we will find another way. The truth cannot be silenced forever.'
                        },
                        {
                            speaker: 'narrator',
                            name: 'Narrator',
                            text: 'The Academy of Spanish was denied. But the seeds of resistance had been planted in the hearts of the students.'
                        }
                    ],
                    onComplete: function () {
                        self.supportersGained++;
                        self.objective.update('Supporters: ' + self.supportersGained + '/' + self.totalSupportersNeeded);
                        self.objective.complete();
                        self.completeStage();
                    }
                };

            default:
                return null;
        }
    }

    // --------------------------------------------------------
    // Trigger NPC dialogue
    // --------------------------------------------------------
    triggerNPCDialogue(npcIndex) {
        if (this.npcTalkedTo[npcIndex]) return;
        if (this.dialogueActive) return;

        var data = this.getNPCDialogue(npcIndex);
        if (!data) return;

        var self = this;
        this.dialogueActive = true;
        this.npcTalkedTo[npcIndex] = true;

        // Hide the indicator on this NPC
        var npc = this.npcSprites[npcIndex];
        if (npc && npc.indicator) {
            npc.indicator.setVisible(false);
        }

        // Hide interact prompt during dialogue
        this.interactPrompt.setVisible(false);

        this.dm.startDialogue(data.dialogue, function () {
            self.dialogueActive = false;
            if (data.onComplete) {
                data.onComplete();
            }
        });
    }

    // --------------------------------------------------------
    // Stage completion — save progress and transition
    // --------------------------------------------------------
    completeStage() {
        if (this.stageComplete) return;
        this.stageComplete = true;

        var self = this;

        // Save progress to localStorage
        try {
            var unlockedRaw = localStorage.getItem('elfili_unlocked');
            var unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [STAGES.STAGE1];

            if (unlocked.indexOf('Stage4_Tales') === -1) {
                unlocked.push('Stage4_Tales');
            }

            localStorage.setItem('elfili_unlocked', JSON.stringify(unlocked));
        } catch (e) {
            // localStorage unavailable
        }

        // Fade out and transition to Stage 4
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', function () {
            self.dm.destroy();
            self.scene.start(STAGES.STAGE4);
        });
    }

    // --------------------------------------------------------
    // Update loop
    // --------------------------------------------------------
    update(time, delta) {
        // Update dialogue manager (handles typewriter + input)
        if (this.dm) {
            this.dm.update();
        }

        // If dialogue is active, freeze player movement
        if (this.dialogueActive || this.stageComplete) {
            this.player.setVelocityX(0);
            return;
        }

        // -- Player movement --
        var speed = this.player.speed;
        var onFloor = this.player.body.onFloor();

        // Horizontal movement
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            this.player.facingRight = false;
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            this.player.facingRight = true;
        } else {
            this.player.setVelocityX(0);
        }

        // Jump (only on floor, minimal platforming)
        if ((this.cursors.up.isDown || this.keyW.isDown) && onFloor) {
            this.player.setVelocityY(this.player.jumpForce);
        }

        // -- NPC proximity check --
        this.nearbyNPC = null;
        var interactDistance = 50;

        for (var i = 0; i < this.npcSprites.length; i++) {
            if (this.npcTalkedTo[i]) continue;

            var npc = this.npcSprites[i];
            var dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                npc.x, npc.y
            );

            if (dist < interactDistance) {
                this.nearbyNPC = i;
                break;
            }
        }

        // -- Show/hide interaction prompt --
        if (this.nearbyNPC !== null) {
            var targetNPC = this.npcSprites[this.nearbyNPC];
            this.interactPrompt.setPosition(targetNPC.x, targetNPC.y - 48);
            this.interactPrompt.setVisible(true);

            // Check for interact input (SPACE or X)
            if (Phaser.Input.Keyboard.JustDown(this.keySpace) ||
                Phaser.Input.Keyboard.JustDown(this.keyX)) {
                this.triggerNPCDialogue(this.nearbyNPC);
            }
        } else {
            this.interactPrompt.setVisible(false);
        }

        // -- Update NPC indicators to follow their sprites --
        for (var j = 0; j < this.npcSprites.length; j++) {
            var npcSprite = this.npcSprites[j];
            if (npcSprite.indicator && npcSprite.indicator.visible) {
                npcSprite.indicator.setX(npcSprite.x);
            }
        }
    }
}
