// ============================================================
// El Filibusterismo - Character Portrait Sprites (64x64)
// Procedurally drawn dialogue portraits
// ============================================================

function createPortraits(scene) {
    // Helper to create a portrait
    function makePortrait(key, drawFn) {
        var g = scene.make.graphics({ x: 0, y: 0, add: false });
        drawFn(g);
        g.generateTexture(key, 64, 64);
        g.destroy();
    }

    // Helper: draw a basic head with skin color
    function drawHead(g, skinColor, x, y, w, h) {
        g.fillStyle(skinColor, 1);
        g.fillRoundedRect(x, y, w, h, 6);
    }

    // Helper: draw eyes
    function drawEyes(g, x, y, color) {
        color = color || 0x111111;
        g.fillStyle(0xffffff, 1);
        g.fillRect(x - 8, y, 6, 5);
        g.fillRect(x + 3, y, 6, 5);
        g.fillStyle(color, 1);
        g.fillRect(x - 6, y + 1, 3, 3);
        g.fillRect(x + 5, y + 1, 3, 3);
    }

    // Helper: draw mouth
    function drawMouth(g, x, y, width) {
        g.fillStyle(0x8b4040, 1);
        g.fillRect(x - Math.floor(width/2), y, width, 2);
    }

    // Helper: draw nose
    function drawNose(g, x, y) {
        g.fillStyle(0x00000, 0.2);
        g.fillRect(x - 1, y, 3, 4);
    }

    // ---- SIMOUN ----
    makePortrait('portrait_simoun', function(g) {
        // Background - dark mysterious
        g.fillStyle(0x0f0f2e, 1);
        g.fillRect(0, 0, 64, 64);
        // Dark suit / shoulders
        g.fillStyle(0x1a1a2e, 1);
        g.fillRect(8, 46, 48, 18);
        // Vest
        g.fillStyle(0x2d2d44, 1);
        g.fillRect(22, 46, 20, 18);
        // White collar
        g.fillStyle(0xddddcc, 1);
        g.fillRect(26, 44, 12, 5);
        // Neck
        g.fillStyle(0x8B6914, 1);
        g.fillRect(27, 40, 10, 8);
        // Head
        drawHead(g, 0x8B6914, 18, 8, 28, 34);
        // Long dark hair
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(16, 6, 32, 10);
        g.fillRect(14, 10, 6, 22);
        g.fillRect(44, 10, 6, 22);
        // Beard
        g.fillStyle(0x2a2a2a, 1);
        g.fillRect(20, 30, 24, 10);
        g.fillRoundedRect(18, 34, 28, 8, 4);
        // Blue-tinted glasses - ICONIC
        g.fillStyle(0x4488cc, 0.85);
        g.fillRect(20, 18, 10, 7);
        g.fillRect(34, 18, 10, 7);
        // Glasses frame
        g.lineStyle(1, 0x333333, 1);
        g.strokeRect(20, 18, 10, 7);
        g.strokeRect(34, 18, 10, 7);
        g.fillStyle(0x333333, 1);
        g.fillRect(30, 20, 4, 2);
        // Nose
        drawNose(g, 31, 24);
        // Mouth hidden by beard
    });

    // ---- BASILIO ----
    makePortrait('portrait_basilio', function(g) {
        // Background
        g.fillStyle(0x1a2a1a, 1);
        g.fillRect(0, 0, 64, 64);
        // White student clothes
        g.fillStyle(0xe8e0d0, 1);
        g.fillRect(10, 46, 44, 18);
        // Neck
        g.fillStyle(0xC6A664, 1);
        g.fillRect(27, 40, 10, 8);
        // Head
        drawHead(g, 0xC6A664, 19, 10, 26, 30);
        // Short black hair
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(17, 6, 30, 10);
        g.fillRect(17, 10, 4, 6);
        g.fillRect(43, 10, 4, 6);
        // Eyes
        drawEyes(g, 32, 22);
        // Nose
        drawNose(g, 31, 27);
        // Mouth - serious
        drawMouth(g, 32, 34, 8);
    });

    // ---- ISAGANI ----
    makePortrait('portrait_isagani', function(g) {
        // Background - warm
        g.fillStyle(0x2a1a0a, 1);
        g.fillRect(0, 0, 64, 64);
        // Barong tagalog
        g.fillStyle(0xd4c8a8, 1);
        g.fillRect(10, 46, 44, 18);
        // Embroidery hint
        g.fillStyle(0xc8bc98, 1);
        g.fillRect(22, 48, 20, 14);
        // Neck
        g.fillStyle(0xC6A664, 1);
        g.fillRect(27, 40, 10, 8);
        // Head
        drawHead(g, 0xC6A664, 19, 10, 26, 30);
        // Wavy dark hair
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(17, 5, 30, 12);
        g.fillRect(15, 8, 5, 14);
        g.fillRect(44, 8, 5, 14);
        g.fillRect(16, 18, 3, 6);
        g.fillRect(45, 18, 3, 6);
        // Eyes - passionate
        drawEyes(g, 32, 22);
        // Eyebrows - determined
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(23, 19, 8, 2);
        g.fillRect(35, 19, 8, 2);
        drawNose(g, 31, 27);
        drawMouth(g, 32, 34, 8);
    });

    // ---- PADRE FLORENTINO ----
    makePortrait('portrait_florentino', function(g) {
        g.fillStyle(0x1a1a2a, 1);
        g.fillRect(0, 0, 64, 64);
        // Black cassock
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(10, 46, 44, 18);
        // White priest collar
        g.fillStyle(0xffffff, 1);
        g.fillRect(24, 44, 16, 5);
        // Neck
        g.fillStyle(0xC6A664, 1);
        g.fillRect(27, 40, 10, 8);
        // Head - older, slightly wider
        drawHead(g, 0xC6A664, 17, 10, 30, 32);
        // White hair
        g.fillStyle(0xcccccc, 1);
        g.fillRect(15, 6, 34, 10);
        g.fillRect(13, 10, 6, 16);
        g.fillRect(45, 10, 6, 16);
        // Wrinkles
        g.fillStyle(0xb09850, 0.3);
        g.fillRect(20, 28, 8, 1);
        g.fillRect(36, 28, 8, 1);
        // Kind eyes
        drawEyes(g, 32, 22);
        drawNose(g, 31, 27);
        // Gentle smile
        g.fillStyle(0x9b5050, 1);
        g.fillRect(28, 34, 8, 2);
        g.fillRect(27, 33, 2, 2);
        g.fillRect(35, 33, 2, 2);
    });

    // ---- PAULITA GOMEZ ----
    makePortrait('portrait_paulita', function(g) {
        g.fillStyle(0x2a1020, 1);
        g.fillRect(0, 0, 64, 64);
        // Pink dress
        g.fillStyle(0xd4728c, 1);
        g.fillRect(8, 46, 48, 18);
        // Panuelo (sheer white shoulder cloth)
        g.fillStyle(0xfaf0e6, 0.7);
        g.fillRect(10, 44, 44, 8);
        // Neck
        g.fillStyle(0xD4A574, 1);
        g.fillRect(27, 38, 10, 10);
        // Head
        drawHead(g, 0xD4A574, 19, 10, 26, 30);
        // Elaborate dark hair pinned up
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(17, 3, 30, 12);
        g.fillRect(20, 0, 24, 6);
        g.fillRect(15, 8, 5, 12);
        g.fillRect(44, 8, 5, 12);
        // Hair ornament
        g.fillStyle(0xffd700, 1);
        g.fillRect(30, 2, 4, 4);
        // Eyes - beautiful
        g.fillStyle(0xffffff, 1);
        g.fillRect(23, 20, 7, 5);
        g.fillRect(34, 20, 7, 5);
        g.fillStyle(0x442211, 1);
        g.fillRect(25, 21, 3, 3);
        g.fillRect(36, 21, 3, 3);
        // Eyelashes
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(23, 19, 7, 1);
        g.fillRect(34, 19, 7, 1);
        drawNose(g, 31, 26);
        // Lips - full
        g.fillStyle(0xcc5555, 1);
        g.fillRect(28, 32, 8, 3);
    });

    // ---- CABESANG TALES ----
    makePortrait('portrait_tales', function(g) {
        g.fillStyle(0x1a1a0a, 1);
        g.fillRect(0, 0, 64, 64);
        // Simple farmer clothes
        g.fillStyle(0x6b5a3a, 1);
        g.fillRect(8, 46, 48, 18);
        // Open collar
        g.fillStyle(0x8B6914, 1);
        g.fillRect(26, 44, 12, 6);
        // Neck - thick
        g.fillStyle(0x8B6914, 1);
        g.fillRect(25, 38, 14, 10);
        // Head - rugged
        drawHead(g, 0x8B6914, 17, 10, 30, 32);
        // Short graying hair
        g.fillStyle(0x444444, 1);
        g.fillRect(15, 6, 34, 8);
        g.fillRect(15, 10, 4, 4);
        g.fillRect(45, 10, 4, 4);
        // Stern eyes
        drawEyes(g, 32, 22);
        g.fillStyle(0x444444, 1);
        g.fillRect(22, 19, 10, 2);
        g.fillRect(34, 19, 10, 2);
        drawNose(g, 31, 27);
        // Firm mouth
        drawMouth(g, 32, 34, 10);
        // Red bandana
        g.fillStyle(0xcc2222, 1);
        g.fillRect(15, 6, 34, 5);
    });

    // ---- PLACIDO PENITENTE ----
    makePortrait('portrait_placido', function(g) {
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(0, 0, 64, 64);
        // White student clothes
        g.fillStyle(0xe8e0d0, 1);
        g.fillRect(10, 46, 44, 18);
        // Neck
        g.fillStyle(0xC6A664, 1);
        g.fillRect(27, 40, 10, 8);
        // Head
        drawHead(g, 0xC6A664, 19, 10, 26, 30);
        // Short dark hair
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(17, 6, 30, 10);
        g.fillRect(17, 10, 4, 4);
        g.fillRect(43, 10, 4, 4);
        // Defiant eyes - furrowed brows
        drawEyes(g, 32, 22);
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(22, 18, 10, 3);
        g.fillRect(34, 18, 10, 3);
        drawNose(g, 31, 27);
        // Frown
        g.fillStyle(0x8b4040, 1);
        g.fillRect(27, 35, 10, 2);
        g.fillRect(26, 34, 2, 2);
        g.fillRect(36, 34, 2, 2);
    });

    // ---- JULI ----
    makePortrait('portrait_juli', function(g) {
        g.fillStyle(0x1a2a1a, 1);
        g.fillRect(0, 0, 64, 64);
        // Camisa (white blouse) and tapis (striped skirt)
        g.fillStyle(0xf0ead6, 1);
        g.fillRect(10, 44, 44, 10);
        g.fillStyle(0x8b4513, 1);
        g.fillRect(10, 54, 44, 10);
        g.fillStyle(0x6b3510, 1);
        for (var i = 0; i < 44; i += 6) {
            g.fillRect(10 + i, 54, 3, 10);
        }
        // Neck
        g.fillStyle(0xC6A664, 1);
        g.fillRect(27, 38, 10, 10);
        // Head - gentle face
        drawHead(g, 0xC6A664, 19, 10, 26, 30);
        // Long black hair
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(17, 4, 30, 12);
        g.fillRect(13, 8, 6, 30);
        g.fillRect(45, 8, 6, 30);
        // Gentle eyes
        g.fillStyle(0xffffff, 1);
        g.fillRect(23, 21, 7, 5);
        g.fillRect(34, 21, 7, 5);
        g.fillStyle(0x332211, 1);
        g.fillRect(25, 22, 3, 3);
        g.fillRect(36, 22, 3, 3);
        drawNose(g, 31, 27);
        // Gentle smile
        g.fillStyle(0xaa6060, 1);
        g.fillRect(28, 33, 8, 2);
    });

    // ---- PADRE CAMORRA ----
    makePortrait('portrait_camorra', function(g) {
        g.fillStyle(0x2a1a0a, 1);
        g.fillRect(0, 0, 64, 64);
        // Brown Franciscan habit
        g.fillStyle(0x5c3a1e, 1);
        g.fillRect(4, 44, 56, 20);
        // Rope belt
        g.fillStyle(0xc8b878, 1);
        g.fillRect(8, 50, 48, 3);
        // Fat neck
        g.fillStyle(0xddbbaa, 1);
        g.fillRect(22, 38, 20, 10);
        // Fat round head
        g.fillStyle(0xddbbaa, 1);
        g.fillRoundedRect(14, 8, 36, 34, 10);
        // Double chin
        g.fillStyle(0xccaa99, 1);
        g.fillRoundedRect(20, 36, 24, 8, 4);
        // Bald top with ring of dark hair (tonsure)
        g.fillStyle(0xeeccbb, 1);
        g.fillCircle(32, 14, 12);
        g.fillStyle(0x3a2a1a, 1);
        g.fillRect(14, 16, 6, 10);
        g.fillRect(44, 16, 6, 10);
        g.fillRect(16, 24, 4, 6);
        g.fillRect(44, 24, 4, 6);
        // Small piggy eyes
        g.fillStyle(0x111111, 1);
        g.fillRect(22, 22, 4, 4);
        g.fillRect(38, 22, 4, 4);
        // Red nose
        g.fillStyle(0xcc8888, 1);
        g.fillRect(30, 27, 5, 4);
        // Crude grin
        g.fillStyle(0x8b4040, 1);
        g.fillRect(24, 33, 16, 3);
    });

    // ---- PADRE IRENE ----
    makePortrait('portrait_irene', function(g) {
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(0, 0, 64, 64);
        // Dominican robes - white over brown
        g.fillStyle(0xe8e8e0, 1);
        g.fillRect(8, 46, 48, 18);
        g.fillStyle(0x5c3a1e, 1);
        g.fillRect(14, 46, 36, 18);
        // Thin neck
        g.fillStyle(0xddbbaa, 1);
        g.fillRect(28, 40, 8, 8);
        // Thin face
        drawHead(g, 0xddbbaa, 20, 10, 24, 32);
        // Dark hair with tonsure
        g.fillStyle(0x2a2a2a, 1);
        g.fillRect(18, 6, 28, 8);
        g.fillRect(18, 10, 4, 10);
        g.fillRect(42, 10, 4, 10);
        // Bald top
        g.fillStyle(0xeeddcc, 1);
        g.fillCircle(32, 10, 8);
        // Calculating narrow eyes
        g.fillStyle(0x111111, 1);
        g.fillRect(24, 22, 6, 3);
        g.fillRect(36, 22, 6, 3);
        // Sly eyebrows - raised
        g.fillStyle(0x2a2a2a, 1);
        g.fillRect(23, 19, 8, 2);
        g.fillRect(35, 19, 8, 2);
        drawNose(g, 31, 26);
        // Thin scheming smile
        g.fillStyle(0x8b5050, 1);
        g.fillRect(27, 34, 10, 2);
    });

    // ---- PADRE SIBYLA ----
    makePortrait('portrait_sibyla', function(g) {
        g.fillStyle(0x0a0a1a, 1);
        g.fillRect(0, 0, 64, 64);
        // Dominican habit - black over white
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(8, 44, 48, 20);
        g.fillStyle(0xe8e8e0, 1);
        g.fillRect(24, 44, 16, 6);
        // Neck
        g.fillStyle(0xddbbaa, 1);
        g.fillRect(28, 40, 8, 6);
        // Angular face
        drawHead(g, 0xddbbaa, 19, 10, 26, 32);
        // Sharp features - angular jaw
        g.fillStyle(0xddbbaa, 1);
        g.fillRect(17, 28, 4, 8);
        g.fillRect(43, 28, 4, 8);
        // Dark hair, tonsure
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(17, 6, 30, 8);
        g.fillRect(17, 10, 4, 8);
        g.fillRect(43, 10, 4, 8);
        // Cold eyes
        g.fillStyle(0x111111, 1);
        g.fillRect(24, 22, 5, 4);
        g.fillRect(37, 22, 5, 4);
        drawNose(g, 31, 27);
        drawMouth(g, 32, 34, 8);
    });

    // ---- JUANITO PELAEZ ----
    makePortrait('portrait_juanito', function(g) {
        g.fillStyle(0x1a1020, 1);
        g.fillRect(0, 0, 64, 64);
        // Expensive European suit
        g.fillStyle(0x2a2a3a, 1);
        g.fillRect(8, 46, 48, 18);
        // Fancy vest
        g.fillStyle(0x4a2a2a, 1);
        g.fillRect(22, 46, 20, 16);
        // White shirt collar
        g.fillStyle(0xffffff, 1);
        g.fillRect(26, 44, 12, 4);
        // Neck
        g.fillStyle(0xD4A574, 1);
        g.fillRect(27, 40, 10, 8);
        // Head
        drawHead(g, 0xD4A574, 19, 10, 26, 30);
        // Slicked-back dark hair
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(17, 5, 30, 10);
        g.fillRect(43, 8, 6, 8);
        // Smug eyes
        drawEyes(g, 32, 22);
        // Raised eyebrow
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(23, 19, 8, 2);
        g.fillRect(36, 18, 8, 2);
        drawNose(g, 31, 27);
        // Arrogant smirk
        g.fillStyle(0x8b5050, 1);
        g.fillRect(29, 33, 8, 2);
        g.fillRect(36, 32, 3, 2);
    });

    // ---- GUARDIA CIVIL ----
    makePortrait('portrait_guardia', function(g) {
        g.fillStyle(0x0a1a2a, 1);
        g.fillRect(0, 0, 64, 64);
        // Blue military uniform
        g.fillStyle(0x2244aa, 1);
        g.fillRect(8, 44, 48, 20);
        // Brass buttons
        g.fillStyle(0xddaa33, 1);
        for (var i = 0; i < 4; i++) {
            g.fillRect(31, 46 + i * 4, 3, 2);
        }
        // Neck
        g.fillStyle(0xddbbaa, 1);
        g.fillRect(28, 40, 8, 6);
        // Head
        drawHead(g, 0xddbbaa, 19, 14, 26, 28);
        // Military cap / tricorn
        g.fillStyle(0x1a1a44, 1);
        g.fillRect(14, 6, 36, 12);
        g.fillRect(18, 4, 28, 4);
        // Cap badge
        g.fillStyle(0xddaa33, 1);
        g.fillRect(29, 8, 6, 4);
        // Stern eyes
        drawEyes(g, 32, 24);
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(22, 22, 10, 2);
        g.fillRect(34, 22, 10, 2);
        drawNose(g, 31, 29);
        drawMouth(g, 32, 35, 8);
    });

    // ---- NARRATOR ----
    makePortrait('portrait_narrator', function(g) {
        // Parchment background
        g.fillStyle(0xd4c8a8, 1);
        g.fillRect(0, 0, 64, 64);
        // Scroll / book shape
        g.fillStyle(0x8b7355, 1);
        g.fillRect(12, 8, 40, 48);
        g.fillStyle(0xf0ead6, 1);
        g.fillRect(14, 10, 36, 44);
        // Text lines on the scroll
        g.fillStyle(0x5c4033, 0.4);
        for (var i = 0; i < 8; i++) {
            var w = 24 + Math.floor(Math.random() * 8);
            g.fillRect(18, 14 + i * 5, w, 2);
        }
        // Scroll curls
        g.fillStyle(0x8b7355, 1);
        g.fillCircle(14, 10, 4);
        g.fillCircle(14, 54, 4);
        g.fillCircle(50, 10, 4);
        g.fillCircle(50, 54, 4);
        // Quill pen
        g.fillStyle(0x4a3020, 1);
        g.fillRect(42, 4, 2, 16);
        g.fillStyle(0xdddddd, 1);
        g.fillRect(40, 2, 6, 4);
    });
}
