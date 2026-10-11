// UIScene: Heads-up display, Tension Radar, Touch Controls connector, Score & Dialogs

class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  init(data) {
    this.levelIndex = (data && data.levelIndex !== undefined) ? data.levelIndex : 0;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.gameScene = this.scene.get('GameScene');

    // UI Container
    this.score = 0;
    this.levelTime = 60;

    // Top HUD Bar Background
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.4);
    hudBg.fillRoundedRect(16, 12, width - 32, 54, 14);

    // Score Display
    this.scoreText = this.add.text(32, 24, '⭐ SCORE: 0', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f1c40f',
      fontStyle: 'bold'
    });

    // Time Display
    this.timeText = this.add.text(width / 2, 24, '⏱️ TIME: 60', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // Dash / Boost Meter
    this.dashText = this.add.text(width - 32, 24, '⚡ DASH: READY [SHIFT/E]', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // Tension Radar Bar: Shows Farmer -> Piggy -> Barn Goal
    this.createTensionRadar(width);

    // Connect Touch Controls
    this.setupTouchControls();

    // Listen to GameScene Events
    this.gameScene.events.on('updateScore', (score) => {
      this.score = score;
      this.scoreText.setText(`⭐ SCORE: ${this.score}`);
    });

    this.gameScene.events.on('updateTime', (timeLeft) => {
      this.timeText.setText(`⏱️ TIME: ${Math.max(0, Math.ceil(timeLeft))}`);
      if (timeLeft < 10) {
        this.timeText.setColor('#e74c3c');
      } else {
        this.timeText.setColor('#ffffff');
      }
    });

    this.gameScene.events.on('updateDash', (ready) => {
      if (ready) {
        this.dashText.setText('⚡ DASH: READY [SHIFT/E]');
        this.dashText.setColor('#2ecc71');
      } else {
        this.dashText.setText('⚡ DASH: COOLING');
        this.dashText.setColor('#95a5a6');
      }
    });

    this.gameScene.events.on('updateDistance', (distFarmer, distGoal) => {
      this.updateTensionRadar(distFarmer, distGoal);
    });

    this.gameScene.events.on('gameOver', (reason) => {
      this.showGameOverModal(reason);
    });

    this.gameScene.events.on('levelWon', (data) => {
      this.showLevelWonModal(data);
    });

    this.events.on('shutdown', () => {
      if (this.gameScene) {
        this.gameScene.events.off('updateScore');
        this.gameScene.events.off('updateTime');
        this.gameScene.events.off('updateDash');
        this.gameScene.events.off('updateDistance');
        this.gameScene.events.off('gameOver');
        this.gameScene.events.off('levelWon');
      }
    });
  }

  createTensionRadar(width) {
    const barW = Math.min(320, width * 0.7);
    const barH = 14;
    const barX = (width - barW) / 2;
    const barY = 74;

    this.radarBg = this.add.graphics();
    this.radarBg.fillStyle(0x222222, 0.75);
    this.radarBg.fillRoundedRect(barX, barY, barW, barH, 7);
    this.radarBg.lineStyle(1.5, 0xffffff, 0.4);
    this.radarBg.strokeRoundedRect(barX, barY, barW, barH, 7);

    // Icons on radar
    this.farmerIcon = this.add.text(barX, barY - 14, '👨‍🌾', { fontSize: '16px' }).setOrigin(0.5);
    this.piggyIcon = this.add.text(barX + barW * 0.3, barY - 14, '🐷', { fontSize: '18px' }).setOrigin(0.5);
    this.goalIcon = this.add.text(barX + barW, barY - 14, '🏡', { fontSize: '18px' }).setOrigin(0.5);

    this.radarBarX = barX;
    this.radarBarW = barW;
  }

  updateTensionRadar(distFarmer, distGoal) {
    // Total stretch = farmer to goal
    const totalDist = distFarmer + distGoal;
    if (totalDist <= 0) return;

    // Relative positions along the bar:
    // Farmer is 0, Piggy is distFarmer / totalDist, Goal is 1
    const pigRatio = Phaser.Math.Clamp(distFarmer / Math.max(1, totalDist), 0.05, 0.95);
    this.piggyIcon.x = this.radarBarX + this.radarBarW * pigRatio;

    // Flash Piggy Icon if Farmer is dangerously close!
    if (distFarmer < 3.2) {
      this.piggyIcon.setScale(1.25);
      if (Math.floor(Date.now() / 250) % 2 === 0) {
        this.radarBg.lineStyle(2, 0xe74c3c, 1);
      }
    } else {
      this.piggyIcon.setScale(1.0);
    }
  }

  setupTouchControls() {
    const touchEl = document.getElementById('touch-controls');
    if (!touchEl) return;

    // Show touch controls on touch devices or screens smaller than 1024px
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch || window.innerWidth <= 900) {
      touchEl.classList.remove('hidden');
    }

    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    const btnDash = document.getElementById('btn-dash');

    const bindTouch = (el, pressAction, releaseAction) => {
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        pressAction();
      });
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        releaseAction();
      });
      el.addEventListener('mousedown', (e) => {
        pressAction();
      });
      el.addEventListener('mouseup', (e) => {
        releaseAction();
      });
    };

    if (this.gameScene) {
      bindTouch(btnUp, () => { this.gameScene.touchInput.up = true; }, () => { this.gameScene.touchInput.up = false; });
      bindTouch(btnDown, () => { this.gameScene.touchInput.down = true; }, () => { this.gameScene.touchInput.down = false; });
      bindTouch(btnLeft, () => { this.gameScene.touchInput.left = true; }, () => { this.gameScene.touchInput.left = false; });
      bindTouch(btnRight, () => { this.gameScene.touchInput.right = true; }, () => { this.gameScene.touchInput.right = false; });
      bindTouch(btnJump, () => { this.gameScene.requestJump(); }, () => {});
      bindTouch(btnDash, () => { this.gameScene.requestDash(); }, () => {});
    }
  }

  showGameOverModal(reason) {
    window.sounds?.playHurt();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    const modal = this.add.container(width / 2, height / 2);

    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-180, -140, 360, 280, 20);
    bg.lineStyle(3, 0xe74c3c, 1);
    bg.strokeRoundedRect(-180, -140, 360, 280, 20);
    modal.add(bg);

    const title = this.add.text(0, -90, 'CAUGHT BY FARMER!', {
      fontFamily: 'Impact, Arial Black',
      fontSize: '28px',
      color: '#e74c3c'
    }).setOrigin(0.5);
    modal.add(title);

    const desc = this.add.text(0, -45, reason || 'The farmer grabbed Piggy with his pitchfork!', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ecf0f1',
      align: 'center',
      wordWrap: { width: 300 }
    }).setOrigin(0.5);
    modal.add(desc);

    const scoreInfo = this.add.text(0, 5, `FINAL SCORE: ${this.score}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    modal.add(scoreInfo);

    // Retry Button
    const retryBtn = this.createButton(modal, -80, 75, 'RETRY', 0x27ae60, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameScene', { levelIndex: this.levelIndex });
    });

    // Menu Button
    const menuBtn = this.createButton(modal, 80, 75, 'MENU', 0x34495e, () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });
  }

  showLevelWonModal(data) {
    window.sounds?.playWin();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    const modal = this.add.container(width / 2, height / 2);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a252f, 0.95);
    bg.fillRoundedRect(-180, -150, 360, 300, 20);
    bg.lineStyle(3, 0x2ecc71, 1);
    bg.strokeRoundedRect(-180, -150, 360, 300, 20);
    modal.add(bg);

    const isTraining = this.gameScene?.levelData?.isTraining;
    const titleText = isTraining ? 'TRAINING COMPLETE! 🎓' : 'ESCAPED TO THE BARN! 🎉';
    const descText = isTraining
      ? 'You mastered navigation, jumping, dashing & bouncing!\nReady to face the real farmer in Level 1?'
      : 'Safe inside! The farmer was left in the dust!';

    const title = this.add.text(0, -100, titleText, {
      fontFamily: 'Impact, Arial Black',
      fontSize: isTraining ? '24px' : '26px',
      color: '#2ecc71'
    }).setOrigin(0.5);
    modal.add(title);

    const desc = this.add.text(0, -55, descText, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ecf0f1',
      align: 'center',
      wordWrap: { width: 310 }
    }).setOrigin(0.5);
    modal.add(desc);

    const finalScore = this.score + Math.max(0, Math.ceil(data.timeLeft) * 20);
    const scoreInfo = this.add.text(0, 5, `PRACTICE SCORE: ${finalScore}\nItems Collected!`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f1c40f',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    modal.add(scoreInfo);

    const hasNext = isTraining ? true : (data.levelIndex + 1 < (window.GAME_LEVELS?.length || 0));
    const nextIdx = isTraining ? 1 : data.levelIndex + 1;
    const nextLabel = isTraining ? 'START LEVEL 1 ▶' : 'NEXT LEVEL ❯';

    if (hasNext) {
      this.createButton(modal, -80, 85, nextLabel, 0x27ae60, () => {
        this.scene.stop('UIScene');
        this.scene.start('GameScene', { levelIndex: nextIdx });
      });
    }

    this.createButton(modal, hasNext ? 80 : 0, 85, 'MENU', 0x34495e, () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });
  }

  createButton(container, x, y, label, color, onClick) {
    const btn = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-60, -20, 120, 40, 10);
    g.lineStyle(2, 0xffffff, 0.4);
    g.strokeRoundedRect(-60, -20, 120, 40, 10);
    btn.add(g);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    btn.add(text);

    btn.setSize(120, 40);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      window.sounds?.playOink();
      onClick();
    });
    container.add(btn);
    return btn;
  }
}
