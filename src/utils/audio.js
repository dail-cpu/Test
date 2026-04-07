// ============================================================
// El Filibusterismo - Procedural Audio System
// Uses Web Audio API to generate all sound effects and music
// ============================================================

var AudioManager = (function () {
    var ctx = null;
    var masterGain = null;
    var musicGain = null;
    var sfxGain = null;
    var musicPlaying = false;
    var musicOscillators = [];

    function init() {
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.5;
            masterGain.connect(ctx.destination);

            musicGain = ctx.createGain();
            musicGain.gain.value = 0.25;
            musicGain.connect(masterGain);

            sfxGain = ctx.createGain();
            sfxGain.gain.value = 0.6;
            sfxGain.connect(masterGain);
        } catch (e) {
            console.warn('Web Audio not available');
        }
    }

    function ensureContext() {
        if (!ctx) init();
        if (ctx && ctx.state === 'suspended') ctx.resume();
        return !!ctx;
    }

    // Play a simple tone
    function playTone(freq, duration, type, gainVal, detune) {
        if (!ensureContext()) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq;
        if (detune) osc.detune.value = detune;
        gain.gain.value = gainVal || 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    // Play noise burst
    function playNoise(duration, gainVal) {
        if (!ensureContext()) return;
        var bufferSize = ctx.sampleRate * duration;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        var gain = ctx.createGain();
        gain.gain.value = gainVal || 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(sfxGain);
        source.start();
    }

    // === SOUND EFFECTS ===

    function sfxJump() {
        playTone(250, 0.15, 'square', 0.12);
        playTone(400, 0.1, 'square', 0.08);
        // Ascending sweep
        if (!ensureContext()) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    function sfxDoubleJump() {
        if (!ensureContext()) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
        gain.gain.value = 0.12;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    function sfxMelee() {
        playNoise(0.08, 0.15);
        playTone(150, 0.1, 'sawtooth', 0.12);
    }

    function sfxFire() {
        playNoise(0.12, 0.08);
        playTone(800, 0.08, 'sawtooth', 0.1);
        playTone(600, 0.15, 'sine', 0.08);
    }

    function sfxDash() {
        if (!ensureContext()) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    }

    function sfxCollect() {
        playTone(523, 0.08, 'square', 0.1);
        setTimeout(function () { playTone(659, 0.08, 'square', 0.1); }, 60);
        setTimeout(function () { playTone(784, 0.12, 'square', 0.08); }, 120);
    }

    function sfxHit() {
        playNoise(0.1, 0.2);
        playTone(100, 0.15, 'square', 0.15);
    }

    function sfxEnemyDeath() {
        playTone(300, 0.05, 'square', 0.1);
        playTone(200, 0.1, 'square', 0.08);
        playTone(100, 0.15, 'sawtooth', 0.06);
    }

    function sfxDialogue() {
        var freq = 200 + Math.random() * 200;
        playTone(freq, 0.04, 'square', 0.06);
    }

    function sfxExplosion() {
        playNoise(0.5, 0.3);
        playTone(60, 0.4, 'sawtooth', 0.15);
        playTone(40, 0.6, 'sine', 0.1);
    }

    function sfxStageComplete() {
        var notes = [523, 659, 784, 1047];
        notes.forEach(function (n, i) {
            setTimeout(function () { playTone(n, 0.2, 'square', 0.1); }, i * 150);
        });
    }

    function sfxGameOver() {
        var notes = [400, 350, 300, 200];
        notes.forEach(function (n, i) {
            setTimeout(function () { playTone(n, 0.3, 'square', 0.1); }, i * 200);
        });
    }

    // === MUSIC ===
    // Simple looping melody using oscillators
    function startMusic(stage) {
        if (!ensureContext() || musicPlaying) return;
        musicPlaying = true;

        // Different melodies per stage type
        var melodies = {
            title: [262, 294, 330, 349, 330, 294, 262, 0, 349, 330, 294, 262, 294, 330, 262, 0],
            day: [330, 349, 392, 349, 330, 294, 262, 0, 294, 330, 349, 392, 440, 392, 349, 0],
            night: [220, 262, 247, 220, 196, 220, 247, 0, 220, 196, 175, 196, 220, 247, 220, 0],
            action: [330, 330, 0, 330, 0, 262, 330, 0, 392, 0, 0, 0, 196, 0, 0, 0],
            boss: [196, 0, 196, 220, 0, 196, 0, 175, 196, 0, 196, 262, 247, 0, 0, 0]
        };

        var melody = melodies[stage] || melodies.day;
        var noteIndex = 0;
        var bpm = 140;
        var noteLength = 60000 / bpm / 2; // 16th notes at ~140bpm

        function playNote() {
            if (!musicPlaying) return;
            var freq = melody[noteIndex % melody.length];
            if (freq > 0) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.value = 0.08;
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + noteLength / 1000 * 0.8);
                osc.connect(gain);
                gain.connect(musicGain);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + noteLength / 1000);

                // Bass note (root)
                var bass = ctx.createOscillator();
                var bassGain = ctx.createGain();
                bass.type = 'sine';
                bass.frequency.value = freq / 2;
                bassGain.gain.value = 0.06;
                bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + noteLength / 1000);
                bass.connect(bassGain);
                bassGain.connect(musicGain);
                bass.start(ctx.currentTime);
                bass.stop(ctx.currentTime + noteLength / 1000);
            }
            noteIndex++;
            setTimeout(playNote, noteLength);
        }

        playNote();
    }

    function stopMusic() {
        musicPlaying = false;
    }

    function setMusicVolume(vol) {
        if (musicGain) musicGain.gain.value = vol;
    }

    function setSfxVolume(vol) {
        if (sfxGain) sfxGain.gain.value = vol;
    }

    return {
        init: init,
        sfxJump: sfxJump,
        sfxDoubleJump: sfxDoubleJump,
        sfxMelee: sfxMelee,
        sfxFire: sfxFire,
        sfxDash: sfxDash,
        sfxCollect: sfxCollect,
        sfxHit: sfxHit,
        sfxEnemyDeath: sfxEnemyDeath,
        sfxDialogue: sfxDialogue,
        sfxExplosion: sfxExplosion,
        sfxStageComplete: sfxStageComplete,
        sfxGameOver: sfxGameOver,
        startMusic: startMusic,
        stopMusic: stopMusic,
        setMusicVolume: setMusicVolume,
        setSfxVolume: setSfxVolume
    };
})();
