// ============================================================
// El Filibusterismo - Dialogue System
// ============================================================

var DialogueManager = (function () {

    var DIALOGUE_MARGIN = 40;
    var DIALOGUE_HEIGHT = 140;
    var PORTRAIT_SIZE = 64;
    var PORTRAIT_PADDING = 12;
    var TYPEWRITER_SPEED = 30; // characters per second
    var PROMPT_BLINK_RATE = 500; // ms per toggle
    var TEXT_WRAP_WIDTH = 500;
    var BASE_DEPTH = 1000;

    function DialogueManager(scene) {
        this.scene = scene;
        this._isActive = false;
        this._dialogueData = [];
        this._currentIndex = 0;
        this._onComplete = null;

        // Typewriter state
        this._fullText = '';
        this._displayedLength = 0;
        this._typewriterTimer = 0;
        this._isTyping = false;

        // Prompt blink state
        this._promptVisible = true;
        this._promptTimer = 0;

        // UI elements (created on first use)
        this._container = null;
        this._bgGraphics = null;
        this._portrait = null;
        this._nameText = null;
        this._bodyText = null;
        this._promptText = null;

        // Input
        this._spaceKey = null;
        this._boundPointerHandler = null;

        this._createUI();
        this._setupInput();
    }

    // --------------------------------------------------------
    // UI Creation
    // --------------------------------------------------------

    DialogueManager.prototype._createUI = function () {
        var scene = this.scene;
        var boxX = DIALOGUE_MARGIN;
        var boxY = GAME_HEIGHT - DIALOGUE_HEIGHT - 20;
        var boxW = GAME_WIDTH - DIALOGUE_MARGIN * 2;
        var boxH = DIALOGUE_HEIGHT;

        // Semi-transparent background with gold border
        this._bgGraphics = scene.add.graphics();
        this._bgGraphics.setScrollFactor(0);
        this._bgGraphics.setDepth(BASE_DEPTH);
        this._drawBox(boxX, boxY, boxW, boxH);

        // Portrait image (placeholder; updated per line)
        this._portrait = scene.add.image(
            boxX + PORTRAIT_PADDING + PORTRAIT_SIZE / 2,
            boxY + boxH / 2,
            'portrait_narrator'
        );
        this._portrait.setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE);
        this._portrait.setScrollFactor(0);
        this._portrait.setDepth(BASE_DEPTH + 1);

        // Speaker name
        var textStartX = boxX + PORTRAIT_PADDING + PORTRAIT_SIZE + PORTRAIT_PADDING;
        this._nameText = scene.add.text(textStartX, boxY + 10, '', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        this._nameText.setScrollFactor(0);
        this._nameText.setDepth(BASE_DEPTH + 2);

        // Dialogue body text
        this._bodyText = scene.add.text(textStartX, boxY + 32, '', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#f0ead6',
            wordWrap: { width: TEXT_WRAP_WIDTH, useAdvancedWrap: true }
        });
        this._bodyText.setScrollFactor(0);
        this._bodyText.setDepth(BASE_DEPTH + 2);

        // "Press SPACE to continue" prompt (bottom-right of box)
        this._promptText = scene.add.text(
            boxX + boxW - 14,
            boxY + boxH - 22,
            'Press SPACE to continue',
            {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#aaaaaa'
            }
        );
        this._promptText.setOrigin(1, 0);
        this._promptText.setScrollFactor(0);
        this._promptText.setDepth(BASE_DEPTH + 2);

        // Start hidden
        this._setVisible(false);
    };

    DialogueManager.prototype._drawBox = function (x, y, w, h) {
        var g = this._bgGraphics;
        g.clear();
        // Dark fill
        g.fillStyle(0x1a1a2e, 0.92);
        g.fillRect(x, y, w, h);
        // Gold border
        g.lineStyle(2, 0x8b7355, 1);
        g.strokeRect(x, y, w, h);
    };

    DialogueManager.prototype._setVisible = function (visible) {
        this._bgGraphics.setVisible(visible);
        this._portrait.setVisible(visible);
        this._nameText.setVisible(visible);
        this._bodyText.setVisible(visible);
        this._promptText.setVisible(visible);
    };

    // --------------------------------------------------------
    // Input Setup
    // --------------------------------------------------------

    DialogueManager.prototype._setupInput = function () {
        var self = this;

        // Keyboard: SPACE
        if (this.scene.input && this.scene.input.keyboard) {
            this._spaceKey = this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.SPACE
            );
        }

        // Mouse / touch: click anywhere on the dialogue box area
        this._boundPointerHandler = function (pointer) {
            if (!self._isActive) return;
            var boxY = GAME_HEIGHT - DIALOGUE_HEIGHT - 20;
            if (pointer.y >= boxY && pointer.y <= GAME_HEIGHT - 20) {
                self.advance();
            }
        };
        if (this.scene.input) {
            this.scene.input.on('pointerdown', this._boundPointerHandler);
        }
    };

    // --------------------------------------------------------
    // Public API
    // --------------------------------------------------------

    DialogueManager.prototype.startDialogue = function (dialogueData, onComplete) {
        if (!dialogueData || dialogueData.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        this._dialogueData = dialogueData;
        this._currentIndex = 0;
        this._onComplete = onComplete || null;
        this._isActive = true;
        this._setVisible(true);
        this._showLine(0);
    };

    DialogueManager.prototype.advance = function () {
        if (!this._isActive) return;

        if (this._isTyping) {
            // Show the full text immediately
            this._displayedLength = this._fullText.length;
            this._bodyText.setText(this._fullText);
            this._isTyping = false;
        } else {
            // Move to next line
            this._currentIndex++;
            if (this._currentIndex >= this._dialogueData.length) {
                this._endDialogue();
            } else {
                this._showLine(this._currentIndex);
            }
        }
    };

    DialogueManager.prototype.update = function () {
        if (!this._isActive) return;

        var time = this.scene.time.now;
        var delta = this.scene.game.loop.delta;

        // Check SPACE key (just pressed this frame)
        if (this._spaceKey && Phaser.Input.Keyboard.JustDown(this._spaceKey)) {
            this.advance();
        }

        // Typewriter effect
        if (this._isTyping) {
            this._typewriterTimer += delta;
            var charsToShow = Math.floor(this._typewriterTimer / (1000 / TYPEWRITER_SPEED));
            if (charsToShow > this._displayedLength) {
                var prevLength = this._displayedLength;
                this._displayedLength = Math.min(charsToShow, this._fullText.length);
                this._bodyText.setText(this._fullText.substring(0, this._displayedLength));
                // Play dialogue blip sound for newly revealed characters
                if (this._displayedLength > prevLength && typeof AudioManager !== 'undefined') {
                    AudioManager.sfxDialogue();
                }
                if (this._displayedLength >= this._fullText.length) {
                    this._isTyping = false;
                }
            }
        }

        // Blink the "Press SPACE" prompt when text is fully shown
        if (!this._isTyping) {
            this._promptTimer += delta;
            if (this._promptTimer >= PROMPT_BLINK_RATE) {
                this._promptTimer -= PROMPT_BLINK_RATE;
                this._promptVisible = !this._promptVisible;
                this._promptText.setVisible(this._promptVisible);
            }
        } else {
            // Hide prompt while typing
            this._promptText.setVisible(false);
            this._promptVisible = false;
            this._promptTimer = 0;
        }
    };

    DialogueManager.prototype.destroy = function () {
        this._isActive = false;

        // Remove input listeners
        if (this._boundPointerHandler && this.scene.input) {
            this.scene.input.off('pointerdown', this._boundPointerHandler);
        }
        if (this._spaceKey) {
            this._spaceKey.destroy();
            this._spaceKey = null;
        }

        // Destroy UI elements
        if (this._bgGraphics) { this._bgGraphics.destroy(); this._bgGraphics = null; }
        if (this._portrait) { this._portrait.destroy(); this._portrait = null; }
        if (this._nameText) { this._nameText.destroy(); this._nameText = null; }
        if (this._bodyText) { this._bodyText.destroy(); this._bodyText = null; }
        if (this._promptText) { this._promptText.destroy(); this._promptText = null; }

        this._dialogueData = [];
        this._onComplete = null;
    };

    Object.defineProperty(DialogueManager.prototype, 'isActive', {
        get: function () {
            return this._isActive;
        }
    });

    // --------------------------------------------------------
    // Internal
    // --------------------------------------------------------

    DialogueManager.prototype._showLine = function (index) {
        var entry = this._dialogueData[index];
        if (!entry) return;

        var speaker = entry.speaker || 'narrator';
        var name = entry.name || '';
        var text = entry.text || '';

        // Update portrait
        var portraitKey = 'portrait_' + speaker;
        if (this.scene.textures.exists(portraitKey)) {
            this._portrait.setTexture(portraitKey);
            this._portrait.setVisible(true);
        } else {
            // If texture is missing, hide portrait gracefully
            this._portrait.setVisible(false);
        }

        // Update speaker name
        this._nameText.setText(name);

        // Start typewriter
        this._fullText = text;
        this._displayedLength = 0;
        this._typewriterTimer = 0;
        this._isTyping = true;
        this._bodyText.setText('');

        // Reset prompt blink
        this._promptVisible = false;
        this._promptTimer = 0;
        this._promptText.setVisible(false);
    };

    DialogueManager.prototype._endDialogue = function () {
        this._isActive = false;
        this._setVisible(false);
        this._dialogueData = [];
        this._currentIndex = 0;

        var cb = this._onComplete;
        this._onComplete = null;
        if (cb) cb();
    };

    return DialogueManager;
})();
