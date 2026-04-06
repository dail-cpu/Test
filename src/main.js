// ============================================================
// El Filibusterismo - Main Game Configuration
// ============================================================
// Phaser 3 game initialization and launch
// ============================================================

var config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    backgroundColor: '#0a0a0a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GRAVITY },
            debug: false,
            tileBias: 16
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 480,
            height: 270
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    scene: [
        BootScene,
        TitleScene,
        Stage1_Intro,
        Stage2_Graveyard,
        Stage3_School,
        Stage4_Tales,
        Stage5_Trial,
        Stage6_Reception,
        Stage7A_Isagani,
        Stage7B_Simoun,
        EndingScene
    ]
};

var game = new Phaser.Game(config);
