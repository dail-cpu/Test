// ============================================================
// El Filibusterismo - Constants & Configuration
// ============================================================

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const TILE = 32;
const PIXEL_SCALE = 2;

// Physics
const GRAVITY = 800;
const PLAYER_SPEED = 200;
const PLAYER_JUMP = -380;
const PLAYER_DASH_SPEED = 450;
const PLAYER_DASH_DURATION = 180;
const PLAYER_DASH_COOLDOWN = 600;
const PLAYER_DOUBLE_JUMP = -320;
const MELEE_RANGE = 48;
const MELEE_DAMAGE = 2;
const FIRE_SPEED = 350;
const FIRE_DAMAGE = 3;
const FIRE_COOLDOWN = 500;

// Colors - Philippine-era palette
const COLORS = {
    SKIN_BROWN: 0x8B6914,
    SKIN_LIGHT: 0xC6A664,
    SKIN_MESTIZA: 0xD4A574,
    HAIR_BLACK: 0x1a1a1a,
    HAIR_WHITE: 0xcccccc,
    BEARD_DARK: 0x2a2a2a,
    SUIT_DARK: 0x1a1a2e,
    SUIT_VEST: 0x2d2d44,
    GLASSES_BLUE: 0x4488cc,
    BARONG_WHITE: 0xe8e0d0,
    BARONG_CREAM: 0xd4c8a8,
    FRIAR_BROWN: 0x5c3a1e,
    FRIAR_WHITE: 0xe8e8e0,
    CASSOCK_BLACK: 0x1a1a1a,
    DRESS_PINK: 0xd4728c,
    DRESS_RED: 0xaa3344,
    SASH_GOLD: 0xd4a830,
    TAPIS_STRIPE: 0x8b4513,
    CAMISA_WHITE: 0xf0ead6,
    PANUELO_WHITE: 0xfaf0e6,
    GOLD: 0xffd700,
    TREASURE_GLOW: 0xffe066,
    SKY_DAY: 0x5588bb,
    SKY_NIGHT: 0x0a0a2e,
    SKY_SUNSET: 0xcc6633,
    GROUND_EARTH: 0x5c4033,
    GROUND_GRASS: 0x3a7a3a,
    WATER_RIVER: 0x2266aa,
    STONE_GRAY: 0x666666,
    WOOD_BROWN: 0x6b4226,
    UI_BG: 0x1a1a2e,
    UI_BORDER: 0x8b7355,
    UI_TEXT: 0xf0ead6,
    HEALTH_RED: 0xcc3333,
    HEALTH_BG: 0x333333,
};

// Character IDs
const CHAR = {
    SIMOUN: 'simoun',
    BASILIO: 'basilio',
    ISAGANI: 'isagani',
    PADRE_FLORENTINO: 'florentino',
    PAULITA: 'paulita',
    CABESANG_TALES: 'tales',
    PLACIDO: 'placido',
    JULI: 'juli',
    PADRE_CAMORRA: 'camorra',
    PADRE_IRENE: 'irene',
    PADRE_SIBYLA: 'sibyla',
    JUANITO: 'juanito',
    CAPTAIN_TIAGO: 'tiago',
    GUARDIA_CIVIL: 'guardia',
    BANDIT: 'bandit',
    NARRATOR: 'narrator',
};

// Stage names
const STAGES = {
    BOOT: 'BootScene',
    TITLE: 'TitleScene',
    STAGE1: 'Stage1_Intro',
    STAGE2: 'Stage2_Graveyard',
    STAGE3: 'Stage3_School',
    STAGE4: 'Stage4_Tales',
    STAGE5: 'Stage5_Trial',
    STAGE6: 'Stage6_Reception',
    STAGE7A: 'Stage7A_Isagani',
    STAGE7B: 'Stage7B_Simoun',
    ENDING: 'EndingScene',
};
