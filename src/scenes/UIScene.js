// UIScene: Heads-up display, Tension Radar, Inventory System, Active Buffs, Touch Controls & Dialogs

class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  init(data) {
    this.levelIndex = (data && data.levelIndex !== undefined) ? data.levelIndex : 0;
    this.difficulty = (data && data.difficulty) ? data.difficulty : 'normal';
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.gameScene = this.scene.get('GameScene');

    // UI State
    this.score = 0;
    this.levelTime = 60;
    this.inventory = [];
    this.isInventoryOpen = false;

    // 1. Top HUD Bar Background
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.55);
    hudBg.fillRoundedRect(12, 10, width - 24, 56, 10);
    hudBg.lineStyle(2, 0x57606f, 0.8);
    hudBg.strokeRoundedRect(12, 10, width - 24, 56, 10);

    // 2. Main Menu Button (Top Left)
    this.createHudButton(24, 20, 84, 36, '🏠 MENU', 0x2f3542, () => {
      window.sounds?.playOink();
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MenuScene', { levelIndex: this.levelIndex, difficulty: this.difficulty });
    });

    // 3. Score Display
    this.scoreText = this.add.text(125, 28, '⭐ 0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f1c40f'
    });

    // 4. Time Display
    this.timeText = this.add.text(width / 2 - 35, 28, '⏱️ 60s', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    // 4b. Difficulty Badge in HUD
    const diffLabel = this.difficulty === 'hard' ? '🔴 HARD' : (this.difficulty === 'easy' ? '🟢 EASY' : '🟡 NORMAL');
    const diffColor = this.difficulty === 'hard' ? '#ff4757' : (this.difficulty === 'easy' ? '#2ed573' : '#ffa502');
    this.diffBadge = this.add.text(width / 2 + 55, 28, diffLabel, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: diffColor
    }).setOrigin(0.5, 0);

    // 5. Inventory Bag Button (Top Right area)
    this.bagBtn = this.createHudButton(width - 250, 20, 115, 36, '🎒 BAG [R] (0)', 0x6c5ce7, () => {
      this.toggleInventory();
    });

    // 6. Dash / Boost Meter
    this.dashText = this.add.text(width - 24, 28, '⚡ DASH', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#2ecc71'
    }).setOrigin(1, 0);

    // 7. Tension Radar Bar: Shows Farmer -> Piggy -> Barn Goal
    this.createTensionRadar(width);

    // 8. Active Buffs Floating Bar
    this.createBuffsBar(width);

    // 9. Interactive Inventory Modal Container
    this.createInventoryModal(width, height);

    // 10. Connect Touch Controls
    this.setupTouchControls();

    // Listen to GameScene Events
    this.gameScene.events.on('updateScore', (score) => {
      this.score = score;
      this.scoreText.setText(`⭐ SCORE: ${this.score}`);
    });

    this.gameScene.events.on('updateTime', (timeLeft) => {
      this.timeText.setText(`⏱️ ${Math.max(0, Math.ceil(timeLeft))}s`);
      if (timeLeft < 10) {
        this.timeText.setColor('#e74c3c');
      } else {
        this.timeText.setColor('#ffffff');
      }
    });

    this.gameScene.events.on('updateDash', (ready) => {
      if (ready) {
        this.dashText.setText('⚡ DASH [SHIFT]');
        this.dashText.setColor('#2ecc71');
      } else {
        this.dashText.setText('⚡ COOLING');
        this.dashText.setColor('#95a5a6');
      }
    });

    this.gameScene.events.on('updateInventory', (inv) => {
      this.inventory = inv || [];
      if (this.bagBtn && this.bagBtn.label) {
        this.bagBtn.label.setText(`🎒 BAG [R] (${this.inventory.length})`);
      }
      if (this.isInventoryOpen) {
        this.refreshInventoryDisplay();
      }
    });

    this.gameScene.events.on('updateBuffs', (buffs) => {
      this.updateBuffsDisplay(buffs);
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

    // Keyboard ESC or R to toggle/close inventory
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.isInventoryOpen) this.toggleInventory();
    });

    this.events.on('shutdown', () => {
      if (this.gameScene) {
        this.gameScene.events.off('updateScore');
        this.gameScene.events.off('updateTime');
        this.gameScene.events.off('updateDash');
        this.gameScene.events.off('updateInventory');
        this.gameScene.events.off('updateBuffs');
        this.gameScene.events.off('updateDistance');
        this.gameScene.events.off('gameOver');
        this.gameScene.events.off('levelWon');
      }
    });
  }

  createHudButton(x, y, w, h, text, color, onClick) {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.9);
    bg.fillRoundedRect(0, 0, w, h, 8);
    bg.lineStyle(1.5, 0xffffff, 0.6);
    bg.strokeRoundedRect(0, 0, w, h, 8);
    btn.add(bg);

    const label = this.add.text(w / 2, h / 2, text, {
      fontFamily: 'Impact, Arial Black',
      fontSize: '12px',
      color: '#ffffff',
      letterSpacing: 0.5
    }).setOrigin(0.5);
    btn.add(label);
    btn.label = label;
    btn.bg = bg;

    btn.setSize(w, h);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', onClick);
    return btn;
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
    const isTraining = this.gameScene?.levelData?.isTraining;
    this.farmerIcon = this.add.text(barX, barY - 14, isTraining ? '💤' : '👨‍🌾', { fontSize: '16px' }).setOrigin(0.5);
    this.piggyIcon = this.add.text(barX + barW * 0.3, barY - 14, '🐷', { fontSize: '18px' }).setOrigin(0.5);
    this.goalIcon = this.add.text(barX + barW, barY - 14, '🏡', { fontSize: '18px' }).setOrigin(0.5);

    this.radarBarX = barX;
    this.radarBarW = barW;
  }

  updateTensionRadar(distFarmer, distGoal) {
    const totalDist = distFarmer + distGoal;
    if (totalDist <= 0) return;

    const pigRatio = Phaser.Math.Clamp(distFarmer / Math.max(1, totalDist), 0.05, 0.95);
    this.piggyIcon.x = this.radarBarX + this.radarBarW * pigRatio;

    if (distFarmer < 3.2 && !this.gameScene?.levelData?.isTraining) {
      this.piggyIcon.setScale(1.25);
      if (Math.floor(Date.now() / 250) % 2 === 0) {
        this.radarBg.lineStyle(2, 0xe74c3c, 1);
      }
    } else {
      this.piggyIcon.setScale(1.0);
    }
  }

  createBuffsBar(width) {
    this.buffsContainer = this.add.container(width / 2, 102);
    this.buffText = this.add.text(0, 0, '', {
      fontFamily: 'Impact, Arial Black',
      fontSize: '13px',
      color: '#feca57',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.buffsContainer.add(this.buffText);
  }

  updateBuffsDisplay(buffs) {
    if (!buffs) return;
    const parts = [];
    if (buffs.speed > 0) parts.push(`🌶️ SPEED: ${buffs.speed.toFixed(1)}s`);
    if (buffs.jump > 0) parts.push(`🪽 JUMP: ${buffs.jump.toFixed(1)}s`);
    if (buffs.invis > 0) parts.push(`👻 INVIS: ${buffs.invis.toFixed(1)}s`);
    if (buffs.clone > 0) parts.push(`🐷 CLONE: ${buffs.clone.toFixed(1)}s`);

    this.buffText.setText(parts.join('  |  '));
  }

  createInventoryModal(width, height) {
    this.inventoryModal = this.add.container(width / 2, height / 2);
    this.inventoryModal.setVisible(false);
    this.inventoryModal.setDepth(5000);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(-width / 2, -height / 2, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    this.inventoryModal.add(overlay);

    const modalW = 460;
    const modalH = 350;
    const box = this.add.graphics();
    box.fillStyle(0x1a252f, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 12);
    box.lineStyle(3, 0x9b59b6, 1);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 12);
    this.inventoryModal.add(box);

    const title = this.add.text(0, -modalH / 2 + 24, '🎒 ARTIFACT INVENTORY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f1c40f'
    }).setOrigin(0.5);
    this.inventoryModal.add(title);

    // Bullet-time Slow Motion Banner
    const slowMoBanner = this.add.text(0, -modalH / 2 + 48, '⏳ BULLET TIME: 0.18x SLOW-MO ACTIVATED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#00d2d3'
    }).setOrigin(0.5);
    this.inventoryModal.add(slowMoBanner);

    const sub = this.add.text(0, -modalH / 2 + 68, 'Time is slowed! Press [1-5] or click USE to activate | [R] or [ESC] to close', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#bdc3c7'
    }).setOrigin(0.5);
    this.inventoryModal.add(sub);

    // Close Button (X)
    const closeBtn = this.add.text(modalW / 2 - 25, -modalH / 2 + 15, '✖', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#e74c3c'
    }).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleInventory());
    this.inventoryModal.add(closeBtn);

    // Item Slots Container
    this.slotsContainer = this.add.container(0, 10);
    this.inventoryModal.add(this.slotsContainer);
  }

  toggleInventory() {
    this.isInventoryOpen = !this.isInventoryOpen;
    this.inventoryModal.setVisible(this.isInventoryOpen);

    // Notify GameScene to engage or disengage bullet-time slow motion!
    this.gameScene?.events.emit('inventoryToggled', this.isInventoryOpen);

    if (this.isInventoryOpen) {
      window.sounds?.playOink();
      this.refreshInventoryDisplay();
    }
  }

  refreshInventoryDisplay() {
    this.slotsContainer.removeAll(true);
    const inv = this.inventory || [];

    if (inv.length === 0) {
      const emptyText = this.add.text(0, 0, 'No artifacts collected yet!\nFind glowing Peppers, Wings, Cloaks, Decoys or Mud on the map!', {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#95a5a6',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5);
      this.slotsContainer.add(emptyText);
      return;
    }

    const startY = -65;
    const rowH = 46;

    inv.forEach((item, idx) => {
      const rowY = startY + idx * rowH;
      const row = this.add.container(0, rowY);

      // Slot background
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x2c3e50, 0.85);
      slotBg.fillRoundedRect(-195, -18, 390, 40, 8);
      slotBg.lineStyle(1.5, 0x34495e, 1);
      slotBg.strokeRoundedRect(-195, -18, 390, 40, 8);
      row.add(slotBg);

      // Icon & Name
      const nameText = this.add.text(-185, 0, `${item.icon} [${idx + 1}] ${item.name}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#ffffff'
      }).setOrigin(0, 0.5);
      row.add(nameText);

      // Description
      const descText = this.add.text(-25, 0, item.desc, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#feca57'
      }).setOrigin(0, 0.5);
      row.add(descText);

      // Use Button
      const useBtn = this.add.container(148, 0);
      const uBg = this.add.graphics();
      uBg.fillStyle(0x27ae60, 1);
      uBg.fillRoundedRect(-36, -14, 72, 28, 4);
      uBg.lineStyle(1.5, 0x2ecc71, 1);
      uBg.strokeRoundedRect(-36, -14, 72, 28, 4);
      useBtn.add(uBg);

      const uLabel = this.add.text(0, 0, `USE [${idx + 1}]`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffffff'
      }).setOrigin(0.5);
      useBtn.add(uLabel);

      useBtn.setSize(70, 28);
      useBtn.setInteractive({ useHandCursor: true });
      useBtn.on('pointerdown', () => {
        if (this.gameScene) {
          this.gameScene.events.emit('useArtifact', idx);
        }
        this.toggleInventory();
      });

      row.add(useBtn);
      this.slotsContainer.add(row);
    });
  }

  setupTouchControls() {
    const touchEl = document.getElementById('touch-controls');
    if (!touchEl) return;

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
    this.createButton(modal, -80, 75, 'RETRY', 0x27ae60, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameScene', { levelIndex: this.levelIndex });
    });

    // Menu Button
    this.createButton(modal, 80, 75, 'MENU', 0x34495e, () => {
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
      fontSize: '13px',
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
