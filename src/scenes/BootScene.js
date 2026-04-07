// ============================================================
// El Filibusterismo - Boot / Preload Scene
// Generates all procedural textures (no external assets)
// ============================================================

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.createLoadingBar();
    }

    create() {
        // Generate all sprite textures from helper modules
        if (typeof createPortraits === 'function') {
            createPortraits(this);
        }
        if (typeof createCharacterSprites === 'function') {
            createCharacterSprites(this);
        }

        // Generate particle textures used by various effects
        this.createParticleTextures();

        // Initialize audio system
        if (typeof AudioManager !== 'undefined') AudioManager.init();

        // Proceed to the title screen
        this.scene.start('TitleScene');
    }

    createLoadingBar() {
        var centerX = GAME_WIDTH / 2;
        var centerY = GAME_HEIGHT / 2;

        this.add.text(centerX, centerY, 'Loading...', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#f0ead6'
        }).setOrigin(0.5);
    }

    createParticleTextures() {
        // --- particle_dust: 4x4 white square ---
        var dust = this.make.graphics({ x: 0, y: 0, add: false });
        dust.fillStyle(0xffffff, 1);
        dust.fillRect(0, 0, 4, 4);
        dust.generateTexture('particle_dust', 4, 4);
        dust.destroy();

        // --- particle_fire: 4x4 orange-yellow with bright core ---
        var fire = this.make.graphics({ x: 0, y: 0, add: false });
        fire.fillStyle(0xff8800, 1);
        fire.fillRect(0, 0, 4, 4);
        fire.fillStyle(0xffdd44, 1);
        fire.fillRect(1, 1, 2, 2);
        fire.generateTexture('particle_fire', 4, 4);
        fire.destroy();

        // --- particle_spark: 2x2 gold ---
        var spark = this.make.graphics({ x: 0, y: 0, add: false });
        spark.fillStyle(0xffd700, 1);
        spark.fillRect(0, 0, 2, 2);
        spark.generateTexture('particle_spark', 2, 2);
        spark.destroy();

        // --- particle_blood: 3x3 red ---
        var blood = this.make.graphics({ x: 0, y: 0, add: false });
        blood.fillStyle(0xcc3333, 1);
        blood.fillRect(0, 0, 3, 3);
        blood.generateTexture('particle_blood', 3, 3);
        blood.destroy();

        // --- particle_water: 3x3 blue ---
        var water = this.make.graphics({ x: 0, y: 0, add: false });
        water.fillStyle(0x2266aa, 1);
        water.fillRect(0, 0, 3, 3);
        water.generateTexture('particle_water', 3, 3);
        water.destroy();
    }
}
