// MenuScene: Displays the clean voxel artwork background, animated 3D pixel title logo,
// pixelated level selector, 3-tier difficulty selector (Easy, Normal, Hard), and chunky arcade buttons.

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  init(data) {
    this.selectedLevelIndex = (data && data.levelIndex !== undefined) ? data.levelIndex : 1; // Default to Level 1: Sunny Pasture
    this.selectedDifficulty = (data && data.difficulty) ? data.difficulty : 'normal'; // 'easy', 'normal', 'hard'
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const levels = window.GAME_LEVELS || [];

    // Fallback Background gradient (sunset theme matching the art)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2d112c, 0x2d112c, 0xf39c12, 0xd35400, 1);
    bg.fillRect(0, 0, width, height);

    // Clean Menu Artwork (from user upload)
    if (this.textures.exists('menu_bg_v2')) {
      const splash = this.add.image(width / 2, height / 2, 'menu_bg_v2');
      const scale = Math.max(width / splash.width, height / splash.height);
      splash.setScale(scale);
    } else if (this.textures.exists('menu_splash')) {
      const splash = this.add.image(width / 2, height * 0.4, 'menu_splash');
      splash.setScale(Math.min(width * 0.8 / splash.width, height * 0.45 / splash.height));
    }

    // Gentle bottom gradient shadow to make lower pixel buttons and level bar pop with high contrast
    const lowerBacking = this.add.graphics();
    lowerBacking.fillGradientStyle(0x000000, 0x000000, 0x0a1017, 0x0a1017, 0, 0, 0.6, 0.6);
    lowerBacking.fillRect(0, height * 0.48, width, height * 0.52);

    // ==========================================
    // 0. ANIMATED 3D PIXEL TITLE LOGO
    // ==========================================
    const titleContainer = this.add.container(width / 2, height * 0.13);

    // Title base / extrusion shadow
    const titleShadow = this.add.text(0, 5, 'PIGGY ESCAPE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: Math.min(width * 0.048, 38) + 'px',
      color: '#1e272e',
      stroke: '#0c1014',
      strokeThickness: 8
    }).setOrigin(0.5);
    titleContainer.add(titleShadow);

    // Title main face
    const titleMain = this.add.text(0, 0, 'PIGGY ESCAPE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: Math.min(width * 0.048, 38) + 'px',
      color: '#ff4757',
      stroke: '#2f3542',
      strokeThickness: 6
    }).setOrigin(0.5);
    titleContainer.add(titleMain);

    // Highlight text overlay for 3D retro arcade pop
    const titleHighlight = this.add.text(-2, -2, 'PIGGY ESCAPE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: Math.min(width * 0.048, 38) + 'px',
      color: '#ff6b81'
    }).setOrigin(0.5);
    titleContainer.add(titleHighlight);

    // Subtitle Ribbon
    const subTitle = this.add.text(0, 36, 'FARMER CHASE: VOXEL EDITION', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: Math.min(width * 0.016, 12) + 'px',
      color: '#feca57',
      stroke: '#1e272e',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
    }).setOrigin(0.5);
    titleContainer.add(subTitle);

    // Subtle gentle floating breathing animation on Title
    this.tweens.add({
      targets: titleContainer,
      y: height * 0.13 - 6,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ==========================================
    // 1. PIXELATED LEVEL SELECTOR
    // ==========================================
    const levelBarY = height * 0.585;
    const levelContainer = this.add.container(width / 2, levelBarY);

    const barW = Math.min(width * 0.72, 480);
    const barH = 50;

    const levelBg = this.add.graphics();
    this.drawPixelBox(levelBg, 0, 0, barW, barH, 0x1a252f, 0x34495e, 0x0e171b, 0xf39c12, 3);
    levelContainer.add(levelBg);

    const levelTitle = this.add.text(0, -7, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);
    levelContainer.add(levelTitle);

    const levelSub = this.add.text(0, 13, '', {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '10px',
      color: '#feca57'
    }).setOrigin(0.5);
    levelContainer.add(levelSub);

    // Pixel Left Arrow Button
    const leftArrow = this.createPixelArrowBtn(levelContainer, -barW / 2 + 25, 0, '◀', () => {
      window.sounds?.playOink();
      this.selectedLevelIndex = (this.selectedLevelIndex - 1 + levels.length) % levels.length;
      updateLevelDisplay();
    });

    // Pixel Right Arrow Button
    const rightArrow = this.createPixelArrowBtn(levelContainer, barW / 2 - 25, 0, '▶', () => {
      window.sounds?.playOink();
      this.selectedLevelIndex = (this.selectedLevelIndex + 1) % levels.length;
      updateLevelDisplay();
    });

    const updateLevelDisplay = () => {
      const lvl = levels[this.selectedLevelIndex] || levels[0];
      const titlePrefix = lvl.isTraining ? '🎓 LEVEL 0: ' : `LEVEL ${lvl.id}: `;
      levelTitle.setText(`${titlePrefix}${lvl.name}`);
      levelSub.setText(lvl.subtitle || 'Escape the farm!');
    };
    updateLevelDisplay();

    // ==========================================
    // 2. PIXELATED DIFFICULTY SELECTOR (3 Tiers)
    // ==========================================
    const diffBarY = height * 0.71;
    const diffContainer = this.add.container(width / 2, diffBarY);

    const diffHeader = this.add.text(0, -18, '⚔️ DIFFICULTY:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ecf0f1'
    }).setOrigin(0.5);
    diffContainer.add(diffHeader);

    const diffOptions = [
      { id: 'easy', label: '🟢 EASY', col: 0x27ae60, high: 0x2ecc71, desc: 'CHILL PACE: Farmer -20% speed | 3.5s Stun duration' },
      { id: 'normal', label: '🟡 NORMAL', col: 0xd35400, high: 0xf39c12, desc: 'BALANCED RUN: Standard chase & obstacle density' },
      { id: 'hard', label: '🔴 HARD', col: 0xc0392b, high: 0xe74c3c, desc: 'FRENZY: Farmer +25% speed | Extra barriers & mud traps!' }
    ];

    this.diffButtons = [];
    const diffBtnW = 120;
    const diffBtnH = 30;
    const diffSpacing = 135;

    const diffInfoText = this.add.text(0, 24, '', {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '9px',
      color: '#feca57'
    }).setOrigin(0.5);
    diffContainer.add(diffInfoText);

    diffOptions.forEach((opt, idx) => {
      const bx = (idx - 1) * diffSpacing;
      const btn = this.add.container(bx, 0);
      const bgG = this.add.graphics();
      btn.add(bgG);

      const label = this.add.text(0, 0, opt.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#ffffff'
      }).setOrigin(0.5);
      btn.add(label);

      btn.setSize(diffBtnW, diffBtnH);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        window.sounds?.playOink();
        this.selectedDifficulty = opt.id;
        refreshDifficultyUI();
      });

      this.diffButtons.push({ opt, btn, bgG, label });
      diffContainer.add(btn);
    });

    const refreshDifficultyUI = () => {
      this.diffButtons.forEach(item => {
        const isSelected = item.opt.id === this.selectedDifficulty;
        item.bgG.clear();
        if (isSelected) {
          this.drawPixelBox(item.bgG, 0, 0, diffBtnW, diffBtnH, item.opt.col, item.opt.high, 0x111111, 0xffffff, 3);
          item.label.setColor('#ffffff');
          item.label.setScale(1.05);
          diffInfoText.setText(item.opt.desc);
        } else {
          this.drawPixelBox(item.bgG, 0, 0, diffBtnW, diffBtnH, 0x2c3e50, 0x34495e, 0x111111, 0x7f8c8d, 2);
          item.label.setColor('#95a5a6');
          item.label.setScale(1.0);
        }
      });
    };
    refreshDifficultyUI();

    // ==========================================
    // 3. PIXELATED ACTION BUTTONS (PLAY, PRACTICE, MAPS)
    // ==========================================
    const btnY = height * 0.84;
    const btnW = Math.min(width * 0.24, 150);
    const btnH = 46;
    const btnGap = btnW + 24;

    // 1. PLAY BUTTON (Green)
    this.createPixelActionButton(
      width / 2 - btnGap,
      btnY,
      btnW,
      btnH,
      'PLAY ▶',
      0x27ae60, // base
      0x2ecc71, // highlight
      0x145a32, // shadow
      0x0e3a1f, // border
      () => {
        window.sounds?.playOink();
        this.startGame();
      }
    );

    // 2. PRACTICE BUTTON (Blue)
    this.createPixelActionButton(
      width / 2,
      btnY,
      btnW + 20,
      btnH,
      '🎓 PRACTICE',
      0x2980b9, // base
      0x3498db, // highlight
      0x1b4f72, // shadow
      0x154360, // border
      () => {
        window.sounds?.playOink();
        this.scene.start('GameScene', { levelIndex: 0, difficulty: this.selectedDifficulty });
      }
    );

    // 3. MAPS BUTTON (Orange)
    this.createPixelActionButton(
      width / 2 + btnGap,
      btnY,
      btnW,
      btnH,
      '🗺️ MAPS',
      0xd35400, // base
      0xe67e22, // highlight
      0x78281f, // shadow
      0x641e16, // border
      () => {
        window.sounds?.playOink();
        this.scene.start('LevelPreviewScene', { levelIndex: this.selectedLevelIndex, difficulty: this.selectedDifficulty });
      }
    );

    // Fullscreen Toggle Button (Top Right)
    const fsBtn = this.add.container(width - 45, 30);
    const fsG = this.add.graphics();
    this.drawPixelBox(fsG, 0, 0, 36, 36, 0x2c3e50, 0x34495e, 0x111111, 0x7f8c8d, 2);
    fsBtn.add(fsG);
    const fsTxt = this.add.text(0, -1, '⛶', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    fsBtn.add(fsTxt);
    fsBtn.setSize(36, 36);
    fsBtn.setInteractive({ useHandCursor: true });
    fsBtn.on('pointerdown', () => {
      window.sounds?.playOink();
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Keyboard Space or Enter to start
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());

    // ==========================================
    // 4. PIXEL CONTROLS FOOTER
    // ==========================================
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 900);
    const controlsHelp = isMobile
      ? '📱 DRAG JOYSTICK TO MOVE | TAP JUMP & DASH'
      : '⌨️ WASD/ARROWS: MOVE | SPACE: JUMP | SHIFT: DASH | R: INVENTORY';

    this.add.text(width / 2, height * 0.945, controlsHelp, {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '10px',
      color: '#dcdde1',
      align: 'center'
    }).setOrigin(0.5);
  }

  // Draw an authentic stepped-corner arcade voxel pixel box
  drawPixelBox(g, x, y, w, h, baseCol, highCol, shadowCol, borderCol, borderThick = 2) {
    const hw = w / 2;
    const hh = h / 2;
    const step = 4; // 4px pixel cut on corners

    // 1. Dark outer border with stepped pixel corners
    g.fillStyle(borderCol, 1);
    g.fillRect(x - hw + step, y - hh, w - step * 2, h);
    g.fillRect(x - hw, y - hh + step, w, h - step * 2);

    // 2. Shadow depth at bottom & right
    g.fillStyle(shadowCol, 1);
    g.fillRect(x - hw + borderThick, y - hh + borderThick, w - borderThick * 2, h - borderThick * 2);

    // 3. Bevel Highlight at top & left
    g.fillStyle(highCol, 1);
    g.fillRect(x - hw + borderThick, y - hh + borderThick, w - borderThick * 2 - 3, h - borderThick * 2 - 4);

    // 4. Face fill in middle
    g.fillStyle(baseCol, 1);
    g.fillRect(x - hw + borderThick + 2, y - hh + borderThick + 3, w - borderThick * 2 - 6, h - borderThick * 2 - 7);
  }

  createPixelArrowBtn(parent, x, y, symbol, onClick) {
    const btn = this.add.container(x, y);
    const g = this.add.graphics();
    this.drawPixelBox(g, 0, 0, 32, 32, 0x2c3e50, 0xf39c12, 0x111111, 0xf39c12, 2);
    btn.add(g);

    const txt = this.add.text(0, 0, symbol, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);
    btn.add(txt);

    btn.setSize(32, 32);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => btn.setScale(1.1));
    btn.on('pointerout', () => btn.setScale(1.0));
    parent.add(btn);
    return btn;
  }

  createPixelActionButton(x, y, w, h, label, baseCol, highCol, shadowCol, borderCol, onClick) {
    const btn = this.add.container(x, y);
    const g = this.add.graphics();
    this.drawPixelBox(g, 0, 0, w, h, baseCol, highCol, shadowCol, borderCol, 3);
    btn.add(g);

    const txt = this.add.text(0, -1, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);
    btn.add(txt);

    btn.setSize(w, h);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setScale(1.04);
    });
    btn.on('pointerout', () => {
      btn.setScale(1.0);
      btn.y = y;
    });
    btn.on('pointerdown', () => {
      btn.y = y + 2; // Mechanical press feedback
    });
    btn.on('pointerup', () => {
      btn.y = y;
      onClick();
    });

    return btn;
  }

  startGame() {
    this.scene.start('GameScene', {
      levelIndex: this.selectedLevelIndex,
      difficulty: this.selectedDifficulty
    });
  }
}
