// MenuScene: Displays the splash image from the first user image, Title, Level Selector, Controls info

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a252f, 0x1a252f, 0x2c3e50, 0x34495e, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative floating clouds
    for (let i = 0; i < 6; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.08);
      const cx = Phaser.Math.Between(0, width);
      const cy = Phaser.Math.Between(40, height - 100);
      cloud.fillRoundedRect(cx, cy, Phaser.Math.Between(80, 160), 28, 14);
      this.tweens.add({
        targets: cloud,
        x: '+=60',
        duration: Phaser.Math.Between(6000, 12000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Hero Splash Artwork (from first user image)
    if (this.textures.exists('menu_splash')) {
      const splash = this.add.image(width / 2, height * 0.38, 'menu_splash');
      // Scale nicely to fit center area
      const maxH = height * 0.42;
      const maxW = width * 0.85;
      const scale = Math.min(maxW / splash.width, maxH / splash.height);
      splash.setScale(scale);

      // Subtle breathing animation
      this.tweens.add({
        targets: splash,
        y: splash.y - 8,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Quad.easeInOut'
      });
    }

    // Game Title
    const titleText = this.add.text(width / 2, height * 0.12, 'PIGGY ESCAPE', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: Math.min(width * 0.09, 52) + 'px',
      color: '#ff6b81',
      stroke: '#2d3436',
      strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 4, color: '#000000', blur: 6, stroke: true, fill: true }
    }).setOrigin(0.5);

    const subTitle = this.add.text(width / 2, height * 0.18, 'FARMER CHASE: VOXEL EDITION', {
      fontFamily: 'monospace',
      fontSize: Math.min(width * 0.038, 18) + 'px',
      color: '#feca57',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Selected Level State
    this.selectedLevelIndex = 0;
    const levels = window.GAME_LEVELS || [];

    // Level Selection Bar
    const levelContainer = this.add.container(width / 2, height * 0.65);

    const levelBox = this.add.graphics();
    levelBox.fillStyle(0x000000, 0.45);
    levelBox.fillRoundedRect(-170, -28, 340, 56, 12);
    levelBox.lineStyle(2, 0xff9f43, 0.8);
    levelBox.strokeRoundedRect(-170, -28, 340, 56, 12);
    levelContainer.add(levelBox);

    const levelTitle = this.add.text(0, -6, `LEVEL 1: ${levels[0]?.name || 'Sunny Pasture'}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    levelContainer.add(levelTitle);

    const levelSub = this.add.text(0, 14, levels[0]?.subtitle || 'Escape the farm!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#c8d6e5'
    }).setOrigin(0.5);
    levelContainer.add(levelSub);

    // Left Level Arrow Button
    const leftArrow = this.add.text(-145, 0, '◀', {
      fontSize: '24px',
      color: '#ff9f43'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    leftArrow.on('pointerdown', () => {
      window.sounds?.playOink();
      this.selectedLevelIndex = (this.selectedLevelIndex - 1 + levels.length) % levels.length;
      updateLevelDisplay();
    });
    levelContainer.add(leftArrow);

    // Right Level Arrow Button
    const rightArrow = this.add.text(145, 0, '▶', {
      fontSize: '24px',
      color: '#ff9f43'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    rightArrow.on('pointerdown', () => {
      window.sounds?.playOink();
      this.selectedLevelIndex = (this.selectedLevelIndex + 1) % levels.length;
      updateLevelDisplay();
    });
    levelContainer.add(rightArrow);

    const updateLevelDisplay = () => {
      const lvl = levels[this.selectedLevelIndex];
      const titlePrefix = lvl.isTraining ? '🎓 LEVEL 0: ' : `LEVEL ${lvl.id}: `;
      levelTitle.setText(`${titlePrefix}${lvl.name}`);
      levelSub.setText(lvl.subtitle);
    };

    // ACTION BUTTONS ROW (Play, Training, Maps)
    const btnW = 140;
    const btnH = 50;
    const btnY = height * 0.78;

    // 1. PLAY BUTTON (Left)
    const playBtnContainer = this.add.container(width / 2 - 160, btnY);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x10ac84, 1);
    btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    btnBg.lineStyle(3, 0x1dd1a1, 1);
    btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    playBtnContainer.add(btnBg);

    const playText = this.add.text(0, 0, 'PLAY ▶', {
      fontFamily: 'Impact, Arial Black',
      fontSize: '20px',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);
    playBtnContainer.add(playText);

    playBtnContainer.setSize(btnW, btnH);
    playBtnContainer.setInteractive({ useHandCursor: true });
    playBtnContainer.on('pointerdown', () => {
      window.sounds?.playOink();
      this.startGame();
    });

    // 2. TRAINING BUTTON (Middle - Highlighted in Blue)
    const trainBtnContainer = this.add.container(width / 2, btnY);
    const trainBg = this.add.graphics();
    trainBg.fillStyle(0x0984e3, 1);
    trainBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    trainBg.lineStyle(3, 0x74b9ff, 1);
    trainBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    trainBtnContainer.add(trainBg);

    const trainText = this.add.text(0, 0, '🎓 PRACTICE', {
      fontFamily: 'Impact, Arial Black',
      fontSize: '18px',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);
    trainBtnContainer.add(trainText);

    trainBtnContainer.setSize(btnW, btnH);
    trainBtnContainer.setInteractive({ useHandCursor: true });
    trainBtnContainer.on('pointerdown', () => {
      window.sounds?.playOink();
      this.scene.start('GameScene', { levelIndex: 0 }); // Launch Training Yard directly!
    });

    // 3. LEVEL MAPS PREVIEW BUTTON (Right - Orange)
    const previewBtnContainer = this.add.container(width / 2 + 160, btnY);
    const prevBg = this.add.graphics();
    prevBg.fillStyle(0xe67e22, 1);
    prevBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    prevBg.lineStyle(3, 0xf39c12, 1);
    prevBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    previewBtnContainer.add(prevBg);

    const prevText = this.add.text(0, 0, '🗺️ MAPS', {
      fontFamily: 'Impact, Arial Black',
      fontSize: '20px',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);
    previewBtnContainer.add(prevText);

    previewBtnContainer.setSize(btnW, btnH);
    previewBtnContainer.setInteractive({ useHandCursor: true });
    previewBtnContainer.on('pointerdown', () => {
      window.sounds?.playOink();
      this.scene.start('LevelPreviewScene', { levelIndex: this.selectedLevelIndex });
    });

    // Keyboard Space or Enter to start
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());

    // Controls Help Footer
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 900);
    const controlsHelp = isMobile
      ? '📱 Touch D-Pad to move | Tap JUMP & DASH'
      : '⌨️ WASD / Arrows = Move | SPACE = Jump | SHIFT / E = Dash';

    this.add.text(width / 2, height * 0.93, controlsHelp, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#a4b0be',
      align: 'center'
    }).setOrigin(0.5);
  }

  startGame() {
    this.scene.start('GameScene', { levelIndex: this.selectedLevelIndex });
  }
}
