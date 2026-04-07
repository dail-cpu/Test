// ============================================================
// El Filibusterismo - In-Game Character & Tile Sprites
// Procedurally drawn gameplay sprites
// ============================================================

function createCharacterSprites(scene) {
    function makeTex(key, w, h, drawFn) {
        var g = scene.make.graphics({ x: 0, y: 0, add: false });
        drawFn(g);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    // Create a spritesheet with 4 frames: idle, walk1, walk2, jump (each 24x32)
    function makeAnimatedChar(key, skin, hairColor, shirtColor, pantsColor, extras) {
        var frameW = 24, frameH = 32, frames = 4;
        var g = scene.make.graphics({ x: 0, y: 0, add: false });

        for (var f = 0; f < frames; f++) {
            var ox = f * frameW; // x offset for this frame
            drawHumanoidFrame(g, ox, skin, hairColor, shirtColor, pantsColor, extras, f);
        }

        g.generateTexture(key + '_sheet', frameW * frames, frameH);
        g.destroy();

        // Add spritesheet to texture manager
        scene.textures.get(key + '_sheet').add(0, 0, 0, 0, frameW, frameH);    // idle
        scene.textures.get(key + '_sheet').add(1, 0, frameW, 0, frameW, frameH);    // walk1
        scene.textures.get(key + '_sheet').add(2, 0, frameW * 2, 0, frameW, frameH); // walk2
        scene.textures.get(key + '_sheet').add(3, 0, frameW * 3, 0, frameW, frameH); // jump

        // Create animations
        scene.anims.create({
            key: key + '_idle',
            frames: [{ key: key + '_sheet', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });
        scene.anims.create({
            key: key + '_walk',
            frames: [
                { key: key + '_sheet', frame: 1 },
                { key: key + '_sheet', frame: 0 },
                { key: key + '_sheet', frame: 2 },
                { key: key + '_sheet', frame: 0 }
            ],
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: key + '_jump',
            frames: [{ key: key + '_sheet', frame: 3 }],
            frameRate: 1,
            repeat: 0
        });

        // Also create the static sprite for backward compatibility
        var g2 = scene.make.graphics({ x: 0, y: 0, add: false });
        drawHumanoidFrame(g2, 0, skin, hairColor, shirtColor, pantsColor, extras, 0);
        g2.generateTexture(key, frameW, frameH);
        g2.destroy();
    }

    // Draw a humanoid at x-offset ox, with frame variation for legs/arms
    // frame: 0=idle, 1=walk_left_forward, 2=walk_right_forward, 3=jump
    function drawHumanoidFrame(g, ox, skin, hairColor, shirtColor, pantsColor, extras, frame) {
        extras = extras || {};
        frame = frame || 0;

        // Leg positions vary by frame
        var leftLegX, rightLegX, leftLegH, rightLegH, bodyY;
        if (frame === 0) { // idle
            leftLegX = 7; rightLegX = 13; leftLegH = 8; rightLegH = 8; bodyY = 0;
        } else if (frame === 1) { // walk - left leg forward
            leftLegX = 5; rightLegX = 14; leftLegH = 8; rightLegH = 7; bodyY = -1;
        } else if (frame === 2) { // walk - right leg forward
            leftLegX = 8; rightLegX = 12; leftLegH = 7; rightLegH = 8; bodyY = -1;
        } else { // jump - legs tucked
            leftLegX = 8; rightLegX = 12; leftLegH = 6; rightLegH = 6; bodyY = -2;
        }

        // Legs/pants
        g.fillStyle(pantsColor, 1);
        g.fillRect(ox + leftLegX, 24 + bodyY, 4, leftLegH);
        g.fillRect(ox + rightLegX, 24 + bodyY, 4, rightLegH);
        // Shoes
        g.fillStyle(0x333333, 1);
        g.fillRect(ox + leftLegX - 1, 30 + bodyY, 5, 2);
        g.fillRect(ox + rightLegX, 30 + bodyY, 5, 2);
        // Body/shirt
        g.fillStyle(shirtColor, 1);
        g.fillRect(ox + 6, 14 + bodyY, 12, 11);
        // Arms - swing with walk
        var leftArmY = (frame === 1) ? 13 : (frame === 2) ? 15 : 14;
        var rightArmY = (frame === 2) ? 13 : (frame === 1) ? 15 : 14;
        g.fillRect(ox + 3, leftArmY + bodyY, 4, 9);
        g.fillRect(ox + 17, rightArmY + bodyY, 4, 9);
        // Hands
        g.fillStyle(skin, 1);
        g.fillRect(ox + 3, leftArmY + 7 + bodyY, 4, 3);
        g.fillRect(ox + 17, rightArmY + 7 + bodyY, 4, 3);
        // Head
        g.fillStyle(skin, 1);
        g.fillRoundedRect(ox + 6, 2 + bodyY, 12, 13, 3);
        // Hair
        g.fillStyle(hairColor, 1);
        g.fillRect(ox + 5, 1 + bodyY, 14, 5);
        if (extras.longHair) {
            g.fillRect(ox + 4, 4 + bodyY, 3, 8);
            g.fillRect(ox + 17, 4 + bodyY, 3, 8);
        }
        // Eyes
        g.fillStyle(0x111111, 1);
        g.fillRect(ox + 8, 7 + bodyY, 2, 2);
        g.fillRect(ox + 14, 7 + bodyY, 2, 2);
        // extras
        if (extras.glasses) {
            g.fillStyle(0x4488cc, 0.8);
            g.fillRect(ox + 7, 6 + bodyY, 4, 3);
            g.fillRect(ox + 13, 6 + bodyY, 4, 3);
            g.lineStyle(1, 0x333333, 1);
            g.strokeRect(ox + 7, 6 + bodyY, 4, 3);
            g.strokeRect(ox + 13, 6 + bodyY, 4, 3);
        }
        if (extras.beard) {
            g.fillStyle(0x2a2a2a, 1);
            g.fillRect(ox + 7, 11 + bodyY, 10, 4);
        }
        if (extras.collar) {
            g.fillStyle(0xffffff, 1);
            g.fillRect(ox + 8, 14 + bodyY, 8, 2);
        }
        if (extras.bandana) {
            g.fillStyle(0xcc2222, 1);
            g.fillRect(ox + 5, 1 + bodyY, 14, 3);
        }
        if (extras.hat) {
            g.fillStyle(extras.hatColor || 0x1a1a44, 1);
            g.fillRect(ox + 3, 0 + bodyY, 18, 4);
            g.fillRect(ox + 6, -1 + bodyY, 12, 2);
        }
        if (extras.fat) {
            g.fillStyle(shirtColor, 1);
            g.fillRect(ox + 4, 14 + bodyY, 16, 13);
        }
        if (extras.tonsure) {
            g.fillStyle(0xeeddcc, 1);
            g.fillRect(ox + 8, 1 + bodyY, 8, 3);
        }
        if (extras.whiteHair) {
            g.fillStyle(0xcccccc, 1);
            g.fillRect(ox + 5, 1 + bodyY, 14, 5);
        }
    }

    // Legacy static humanoid (for NPCs and enemies that don't animate)
    function drawHumanoid(g, skin, hairColor, shirtColor, pantsColor, extras) {
        drawHumanoidFrame(g, 0, skin, hairColor, shirtColor, pantsColor, extras, 0);
    }

    // ========== PLAYABLE CHARACTERS (animated spritesheets) ==========

    // Simoun - dark suit, blue glasses, beard
    makeAnimatedChar('sprite_simoun', 0x8B6914, 0x1a1a1a, 0x1a1a2e, 0x1a1a2e,
        { glasses: true, beard: true, longHair: true, collar: true });

    // Isagani - barong tagalog, young
    makeAnimatedChar('sprite_isagani', 0xC6A664, 0x1a1a1a, 0xd4c8a8, 0x3a3a3a, {});

    // Cabesang Tales - farmer
    makeAnimatedChar('sprite_tales', 0x8B6914, 0x444444, 0x6b5a3a, 0x4a3a2a, {});

    // Cabesang Tales as bandit
    makeAnimatedChar('sprite_tales_bandit', 0x8B6914, 0x444444, 0x3a2a1a, 0x2a2a2a, { bandana: true });

    // ========== ENEMIES ==========

    // Guardia Civil
    makeTex('sprite_guardia', 24, 32, function(g) {
        drawHumanoid(g, 0xddbbaa, 0x1a1a1a, 0x2244aa, 0x2244aa,
            { hat: true, hatColor: 0x1a1a44 });
    });

    // Generic friar
    makeTex('sprite_friar', 24, 32, function(g) {
        drawHumanoid(g, 0xddbbaa, 0x3a2a1a, 0x5c3a1e, 0x5c3a1e,
            { fat: true, tonsure: true });
    });

    // Bandit / tulisan
    makeTex('sprite_bandit', 24, 32, function(g) {
        drawHumanoid(g, 0x8B6914, 0x1a1a1a, 0x2a2a2a, 0x1a1a1a, { bandana: true });
        // Bolo in hand
        g.fillStyle(0x888888, 1);
        g.fillRect(19, 16, 2, 10);
        g.fillStyle(0x6b4226, 1);
        g.fillRect(19, 22, 2, 4);
    });

    // ========== NPCs ==========

    makeTex('sprite_basilio', 24, 32, function(g) {
        drawHumanoid(g, 0xC6A664, 0x1a1a1a, 0xe8e0d0, 0x4a4a3a, {});
    });

    makeTex('sprite_placido', 24, 32, function(g) {
        drawHumanoid(g, 0xC6A664, 0x1a1a1a, 0xddd8c0, 0x3a3a3a, {});
    });

    makeTex('sprite_paulita', 24, 32, function(g) {
        drawHumanoid(g, 0xD4A574, 0x1a1a1a, 0xd4728c, 0xd4728c, { longHair: true });
    });

    makeTex('sprite_juanito', 24, 32, function(g) {
        drawHumanoid(g, 0xD4A574, 0x1a1a1a, 0x2a2a3a, 0x2a2a3a, { collar: true });
    });

    makeTex('sprite_juli', 24, 32, function(g) {
        drawHumanoid(g, 0xC6A664, 0x1a1a1a, 0xf0ead6, 0x8b4513, { longHair: true });
    });

    makeTex('sprite_florentino', 24, 32, function(g) {
        drawHumanoid(g, 0xC6A664, 0xcccccc, 0x1a1a1a, 0x1a1a1a,
            { collar: true, whiteHair: true });
    });

    // ========== OBJECTS ==========

    // Treasure - golden gem
    makeTex('sprite_treasure', 16, 16, function(g) {
        g.fillStyle(0xffd700, 1);
        g.fillRect(4, 2, 8, 12);
        g.fillRect(2, 4, 12, 8);
        g.fillStyle(0xffee66, 1);
        g.fillRect(5, 4, 4, 4);
        g.fillStyle(0xcc9900, 1);
        g.fillRect(8, 8, 4, 4);
        // Sparkle
        g.fillStyle(0xffffff, 1);
        g.fillRect(6, 3, 2, 2);
    });

    // Lantern fire projectile
    makeTex('sprite_lantern_fire', 8, 8, function(g) {
        g.fillStyle(0xff6600, 1);
        g.fillRect(1, 1, 6, 6);
        g.fillStyle(0xffaa00, 1);
        g.fillRect(2, 2, 4, 4);
        g.fillStyle(0xffee44, 1);
        g.fillRect(3, 3, 2, 2);
    });

    // Walking stick for melee visual
    makeTex('sprite_walking_stick', 6, 20, function(g) {
        g.fillStyle(0x6b4226, 1);
        g.fillRect(2, 0, 2, 20);
        g.fillStyle(0x8b5a36, 1);
        g.fillRect(0, 0, 6, 4);
    });

    // Simoun's lamp
    makeTex('sprite_lamp', 16, 20, function(g) {
        // Base
        g.fillStyle(0x8b7355, 1);
        g.fillRect(4, 14, 8, 6);
        // Body
        g.fillStyle(0xddaa33, 1);
        g.fillRect(3, 6, 10, 10);
        // Glass
        g.fillStyle(0xffcc44, 0.5);
        g.fillRect(5, 8, 6, 6);
        // Top
        g.fillStyle(0x8b7355, 1);
        g.fillRect(5, 2, 6, 5);
        // Handle
        g.fillRect(7, 0, 2, 3);
        // Glow
        g.fillStyle(0xffee88, 0.6);
        g.fillCircle(8, 10, 4);
    });

    // Heart
    makeTex('sprite_heart', 12, 12, function(g) {
        g.fillStyle(0xcc3333, 1);
        g.fillCircle(4, 4, 3);
        g.fillCircle(8, 4, 3);
        g.fillRect(2, 4, 8, 4);
        g.fillStyle(0xcc3333, 1);
        // Triangle bottom
        g.fillRect(3, 7, 6, 2);
        g.fillRect(4, 9, 4, 2);
        g.fillRect(5, 10, 2, 2);
    });

    // Bolo / machete enemy projectile
    makeTex('sprite_bolo', 16, 16, function(g) {
        g.fillStyle(0xaaaaaa, 1);
        g.fillRect(4, 1, 3, 10);
        g.fillRect(3, 1, 5, 2);
        g.fillStyle(0x6b4226, 1);
        g.fillRect(4, 10, 3, 5);
    });

    // Bullet for guardia
    makeTex('sprite_bullet', 6, 4, function(g) {
        g.fillStyle(0xddddaa, 1);
        g.fillRect(0, 1, 6, 2);
        g.fillStyle(0xffffcc, 1);
        g.fillRect(4, 0, 2, 4);
    });

    // Crate (breakable)
    makeTex('sprite_crate', 32, 32, function(g) {
        g.fillStyle(0x8b6b3a, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x6b4b2a, 1);
        g.fillRect(0, 0, 32, 2);
        g.fillRect(0, 30, 32, 2);
        g.fillRect(0, 0, 2, 32);
        g.fillRect(30, 0, 2, 32);
        g.fillRect(14, 0, 4, 32);
        g.fillRect(0, 14, 32, 4);
    });

    // Sign post
    makeTex('sprite_sign', 32, 32, function(g) {
        // Post
        g.fillStyle(0x6b4226, 1);
        g.fillRect(14, 16, 4, 16);
        // Sign board
        g.fillStyle(0xd4c8a8, 1);
        g.fillRect(2, 2, 28, 16);
        g.fillStyle(0x8b7355, 1);
        g.fillRect(2, 2, 28, 2);
        g.fillRect(2, 16, 28, 2);
        g.fillRect(2, 2, 2, 16);
        g.fillRect(28, 2, 2, 16);
    });

    // ========== TILES (32x32) ==========

    // Ground / earth
    makeTex('tile_ground', 32, 32, function(g) {
        g.fillStyle(0x5c4033, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x4a3428, 1);
        g.fillRect(4, 8, 6, 3);
        g.fillRect(18, 4, 4, 3);
        g.fillRect(8, 20, 5, 3);
        g.fillRect(22, 24, 6, 3);
    });

    // Grass-topped ground
    makeTex('tile_grass', 32, 32, function(g) {
        g.fillStyle(0x5c4033, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x3a7a3a, 1);
        g.fillRect(0, 0, 32, 6);
        g.fillStyle(0x4a8a4a, 1);
        g.fillRect(2, 0, 4, 3);
        g.fillRect(10, 0, 6, 4);
        g.fillRect(20, 0, 4, 3);
        g.fillRect(26, 0, 4, 2);
    });

    // Stone
    makeTex('tile_stone', 32, 32, function(g) {
        g.fillStyle(0x666666, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x555555, 1);
        g.fillRect(0, 15, 32, 2);
        g.fillRect(15, 0, 2, 32);
        g.fillStyle(0x777777, 1);
        g.fillRect(2, 2, 12, 12);
        g.fillRect(18, 18, 12, 12);
    });

    // Wood platform
    makeTex('tile_wood', 32, 32, function(g) {
        g.fillStyle(0x6b4226, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x7b5236, 1);
        g.fillRect(0, 0, 32, 8);
        g.fillRect(0, 12, 32, 8);
        g.fillRect(0, 24, 32, 8);
        g.fillStyle(0x5b3216, 1);
        g.fillRect(0, 8, 32, 1);
        g.fillRect(0, 20, 32, 1);
    });

    // Water
    makeTex('tile_water', 32, 32, function(g) {
        g.fillStyle(0x2266aa, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x3377bb, 1);
        g.fillRect(2, 6, 10, 2);
        g.fillRect(18, 14, 12, 2);
        g.fillRect(6, 24, 8, 2);
        g.fillStyle(0x1155aa, 1);
        g.fillRect(14, 10, 8, 2);
        g.fillRect(0, 20, 10, 2);
    });

    // Gravestone
    makeTex('tile_grave', 32, 32, function(g) {
        // Dark ground
        g.fillStyle(0x3a2a20, 1);
        g.fillRect(0, 20, 32, 12);
        // Stone
        g.fillStyle(0x777777, 1);
        g.fillRect(8, 4, 16, 18);
        g.fillRoundedRect(8, 2, 16, 8, 4);
        // Cross
        g.fillStyle(0x999999, 1);
        g.fillRect(14, 6, 4, 12);
        g.fillRect(10, 9, 12, 3);
    });

    // Ship deck
    makeTex('tile_ship_deck', 32, 32, function(g) {
        g.fillStyle(0x8b7355, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x9b8365, 1);
        g.fillRect(0, 0, 7, 32);
        g.fillRect(10, 0, 7, 32);
        g.fillRect(20, 0, 7, 32);
        g.fillStyle(0x6b5335, 1);
        g.fillRect(7, 0, 1, 32);
        g.fillRect(17, 0, 1, 32);
        g.fillRect(27, 0, 1, 32);
    });

    // School wall
    makeTex('tile_school_wall', 32, 32, function(g) {
        g.fillStyle(0xc8b898, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0xb8a888, 1);
        g.fillRect(0, 15, 32, 2);
        g.fillRect(15, 0, 2, 32);
        // Window hint
        g.fillStyle(0x88aacc, 1);
        g.fillRect(4, 4, 8, 10);
        g.fillStyle(0x8b7355, 1);
        g.fillRect(4, 4, 8, 1);
        g.fillRect(4, 13, 8, 1);
        g.fillRect(4, 4, 1, 10);
        g.fillRect(11, 4, 1, 10);
        g.fillRect(7, 4, 1, 10);
    });

    // Reception floor - fancy tiles
    makeTex('tile_reception_floor', 32, 32, function(g) {
        g.fillStyle(0xc8a878, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0xb89868, 1);
        g.fillRect(0, 0, 16, 16);
        g.fillRect(16, 16, 16, 16);
        g.fillStyle(0x8b7355, 1);
        g.fillRect(0, 0, 32, 1);
        g.fillRect(0, 0, 1, 32);
        g.fillRect(15, 0, 2, 32);
        g.fillRect(0, 15, 32, 2);
    });

    // Dark earth for graveyard
    makeTex('tile_dark_ground', 32, 32, function(g) {
        g.fillStyle(0x3a2a20, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x2a1a10, 1);
        g.fillRect(6, 6, 4, 3);
        g.fillRect(20, 12, 5, 3);
        g.fillRect(10, 22, 6, 3);
    });

    // Farmland
    makeTex('tile_farmland', 32, 32, function(g) {
        g.fillStyle(0x5c4033, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x3a7a3a, 1);
        g.fillRect(0, 0, 32, 4);
        // Crop rows
        g.fillStyle(0x4a8a2a, 1);
        for (var i = 0; i < 4; i++) {
            g.fillRect(4 + i * 8, 0, 3, 6);
        }
    });
}
