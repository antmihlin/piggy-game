// UIScene: Heads-up display, Tension Radar, Inventory System, Active Buffs, Touch Controls & Dialogs

class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  init(data) {
    this.levelIndex = (data && data.levelIndex !== undefined) ? data.levelIndex : 0;
    this.difficulty = (data && data.difficulty) ? data.difficulty : 'normal';
    this.isDevMode = (data && data.devMode) || (window.isDevMode && this.levelIndex === 0) || false;
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
    this.hudBg = this.add.graphics();
    this.hudBg.fillStyle(0x000000, 0.55);
    this.hudBg.fillRoundedRect(12, 10, width - 24, 56, 10);
    this.hudBg.lineStyle(2, 0x57606f, 0.8);
    this.hudBg.strokeRoundedRect(12, 10, width - 24, 56, 10);

    // 2. Main Menu Button (Top Left)
    this.createHudButton(24, 20, 84, 36, '🏠 MENU', 0x2f3542, () => {
      window.sounds?.playOink();
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MenuScene', { levelIndex: this.levelIndex, difficulty: this.difficulty });
    });

    // 3. Score Display (Top Left, next to Menu button)
    this.scoreText = this.add.text(124, 28, '⭐ 0', {
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

    // 10. Developer Badge and Restock Button if devMode is active
    if (this.isDevMode && this.levelIndex === 0) {
      this.showDevBadge(width);
    }

    // 11. Connect Touch Controls
    this.setupTouchControls();

    // Listen to GameScene Events
    this.gameScene.events.on('updateScore', (score) => {
      this.score = score;
      this.scoreText.setText(`⭐ SCORE: ${this.score}`);
    });

    this.gameScene.events.on('devModeActivated', () => {
      this.isDevMode = true;
      this.showDevBadge(width);
      if (this.isInventoryOpen) {
        this.refreshCharacterPanel();
        this.updateTabButtons();
        if (this.activeTab === 'inventory') this.refreshInventoryDisplay();
        else this.refreshCosmeticsDisplay();
      }
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

    // Responsive resize listener for mobile landscape and window resizing
    this.scale.on('resize', (gameSize) => {
      this.repositionUI(gameSize.width, gameSize.height);
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

    // Modal sizing (scaled nicely for landscape / responsive)
    const modalW = Math.min(width - 32, 680);
    const modalH = Math.min(height - 32, 420);
    this.modalW = modalW;
    this.modalH = modalH;

    // Dim Background Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(-width / 2, -height / 2, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    this.inventoryModal.add(overlay);

    // Main RPG Frame Box
    const box = this.add.graphics();
    box.fillStyle(0x131920, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 14);
    box.lineStyle(3, 0x5a3e7a, 1);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 14);
    // Inner golden accent trim
    box.lineStyle(1.5, 0xf1c40f, 0.6);
    box.strokeRoundedRect(-modalW / 2 + 4, -modalH / 2 + 4, modalW - 8, modalH - 8, 11);
    this.inventoryModal.add(box);

    // Header Title
    const title = this.add.text(0, -modalH / 2 + 22, '⚔️ HERO GEAR & INVENTORY 🎒', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#f1c40f'
    }).setOrigin(0.5);
    this.inventoryModal.add(title);

    // Close Button (✖)
    const closeBtn = this.add.text(modalW / 2 - 25, -modalH / 2 + 15, '✖', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '15px',
      color: '#e74c3c'
    }).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleInventory());
    this.inventoryModal.add(closeBtn);

    // ==========================================
    // LEFT COLUMN: THE CHARACTER (RPG DOLL & STATS)
    // ==========================================
    const charW = 210;
    this.charColX = -modalW / 2 + charW / 2 + 16;
    this.charContainer = this.add.container(this.charColX, 10);
    this.inventoryModal.add(this.charContainer);

    // Character Card Background
    const charCard = this.add.graphics();
    charCard.fillStyle(0x1a232f, 0.9);
    charCard.fillRoundedRect(-charW / 2, -modalH / 2 + 45, charW, modalH - 65, 10);
    charCard.lineStyle(1.5, 0x3d5066, 0.9);
    charCard.strokeRoundedRect(-charW / 2, -modalH / 2 + 45, charW, modalH - 65, 10);
    this.charContainer.add(charCard);

    // Character Name / Label
    const charTitle = this.add.text(0, -modalH / 2 + 58, '🐽 HERO PIGGY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#00d2d3'
    }).setOrigin(0.5);
    this.charContainer.add(charTitle);

    // Character Preview Graphics (Piggy drawn at 2.4x scale)
    this.charPreviewGraphics = this.add.graphics();
    this.charPreviewGraphics.y = -modalH / 2 + 115;
    this.charContainer.add(this.charPreviewGraphics);

    // Idle Bobbing Tween on Piggy preview
    this.tweens.add({
      targets: this.charPreviewGraphics,
      y: this.charPreviewGraphics.y - 4,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Developer Easter Egg: Tapping the Character Doll 5 times unlocks all cosmetics & artifacts!
    const charTapZone = this.add.circle(0, -modalH / 2 + 115, 55, 0x000000, 0.001);
    charTapZone.setInteractive({ useHandCursor: true });
    this.charContainer.add(charTapZone);

    let dollTapCount = 0;
    let dollTapTimer = null;
    charTapZone.on('pointerdown', () => {
      dollTapCount++;
      clearTimeout(dollTapTimer);
      dollTapTimer = setTimeout(() => { dollTapCount = 0; }, 2500);

      this.tweens.add({
        targets: this.charPreviewGraphics,
        scaleY: 0.85,
        scaleX: 1.15,
        duration: 90,
        yoyo: true
      });
      window.sounds?.playOink();

      if (dollTapCount >= 5) {
        dollTapCount = 0;
        window.activateDevMode();
        this.refreshCharacterPanel();
        this.updateTabButtons();
        if (this.activeTab === 'inventory') this.refreshInventoryDisplay();
        else this.refreshCosmeticsDisplay();
      }
    });

    // Equipped Gear Summary Labels Container
    this.gearSlotsContainer = this.add.container(0, -modalH / 2 + 200);
    this.charContainer.add(this.gearSlotsContainer);

    // Active Passives Summary Card Container
    this.passivesContainer = this.add.container(0, modalH / 2 - 62);
    this.charContainer.add(this.passivesContainer);

    // ==========================================
    // RIGHT COLUMN: TABBED INVENTORY & COSMETICS
    // ==========================================
    const rightW = modalW - charW - 46;
    this.rightColX = modalW / 2 - rightW / 2 - 16;
    this.rightW = rightW;
    this.rightContainer = this.add.container(this.rightColX, 10);
    this.inventoryModal.add(this.rightContainer);

    // Tab Buttons (Default is Inventory)
    this.activeTab = 'inventory'; // 'inventory' or 'cosmetics'
    this.cosmeticFilter = 'all';
    this.cosmeticPage = 0;

    const tabBtnW = (rightW - 12) / 2;
    const tabY = -modalH / 2 + 50;

    // 1. INVENTORY TAB BUTTON
    this.tabInvBtn = this.add.container(-rightW / 2 + tabBtnW / 2, tabY);
    this.tabInvBg = this.add.graphics();
    this.tabInvBtn.add(this.tabInvBg);
    this.tabInvText = this.add.text(0, 0, '🎒 INVENTORY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.tabInvBtn.add(this.tabInvText);
    this.tabInvBtn.setSize(tabBtnW, 30);
    this.tabInvBtn.setInteractive({ useHandCursor: true });
    this.tabInvBtn.on('pointerdown', () => this.switchTab('inventory'));
    this.rightContainer.add(this.tabInvBtn);

    // 2. COSMETICS TAB BUTTON
    this.tabCosBtn = this.add.container(rightW / 2 - tabBtnW / 2, tabY);
    this.tabCosBg = this.add.graphics();
    this.tabCosBtn.add(this.tabCosBg);
    this.tabCosText = this.add.text(0, 0, '✨ COSMETICS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.tabCosBtn.add(this.tabCosText);
    this.tabCosBtn.setSize(tabBtnW, 30);
    this.tabCosBtn.setInteractive({ useHandCursor: true });
    this.tabCosBtn.on('pointerdown', () => this.switchTab('cosmetics'));
    this.rightContainer.add(this.tabCosBtn);

    // Tab Content Containers
    this.inventoryTabContent = this.add.container(0, 0);
    this.rightContainer.add(this.inventoryTabContent);

    this.cosmeticsTabContent = this.add.container(0, 0);
    this.rightContainer.add(this.cosmeticsTabContent);

    // Item Slots Container (for Inventory artifacts)
    this.slotsContainer = this.add.container(0, 0);
    this.inventoryTabContent.add(this.slotsContainer);

    // Initial render of tabs
    this.updateTabButtons();
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    window.sounds?.playOink();
    this.updateTabButtons();

    if (this.activeTab === 'inventory') {
      this.inventoryTabContent.setVisible(true);
      this.cosmeticsTabContent.setVisible(false);
      this.refreshInventoryDisplay();
    } else {
      this.inventoryTabContent.setVisible(false);
      this.cosmeticsTabContent.setVisible(true);
      this.refreshCosmeticsDisplay();
    }
  }

  updateTabButtons() {
    const tabBtnW = (this.rightW - 12) / 2;
    const tabBtnH = 30;

    // Inventory Tab
    this.tabInvBg.clear();
    if (this.activeTab === 'inventory') {
      this.tabInvBg.fillStyle(0x6c5ce7, 1);
      this.tabInvBg.fillRoundedRect(-tabBtnW / 2, -tabBtnH / 2, tabBtnW, tabBtnH, 6);
      this.tabInvBg.lineStyle(2, 0xa29bfe, 1);
      this.tabInvBg.strokeRoundedRect(-tabBtnW / 2, -tabBtnH / 2, tabBtnW, tabBtnH, 6);
      this.tabInvText.setColor('#ffffff');
    } else {
      this.tabInvBg.fillStyle(0x212a36, 0.9);
      this.tabInvBg.fillRoundedRect(-tabBtnW / 2, -tabBtnH / 2, tabBtnW, tabBtnH, 6);
      this.tabInvBg.lineStyle(1.5, 0x3d5066, 0.7);
      this.tabInvBg.strokeRoundedRect(-tabBtnW / 2, -tabBtnH / 2, tabBtnW, tabBtnH, 6);
      this.tabInvText.setColor('#95a5a6');
    }
    const invCount = this.inventory ? this.inventory.length : 0;
    this.tabInvText.setText(`🎒 INVENTORY (${invCount})`);

    // Cosmetics Tab
    this.tabCosBg.clear();
    if (this.activeTab === 'cosmetics') {
      this.tabCosBg.fillStyle(0xd35400, 1);
      this.tabCosBg.fillRoundedRect(-tabBtnW / 2, -tabBtnH / 2, tabBtnW, tabBtnH, 6);
      this.tabCosBg.lineStyle(2, 0xf39c12, 1);
      this.tabCosBg.strokeRoundedRect(-tabBtnW / 2, -tabBtnH / 2, tabBtnW, tabBtnH, 6);
      this.tabCosText.setColor('#ffffff');
    } else {
      this.tabCosBg.fillStyle(0x212a36, 0.9);
      this.tabCosBg.fillRoundedRect(-tabBtnW / 2, -tabBtnH / 2, tabBtnW, tabBtnH, 6);
      this.tabCosBg.lineStyle(1.5, 0x3d5066, 0.7);
      this.tabCosBg.strokeRoundedRect(-tabBtnW / 2, -tabBtnH / 2, tabBtnW, tabBtnH, 6);
      this.tabCosText.setColor('#95a5a6');
    }
  }

  toggleInventory() {
    this.isInventoryOpen = !this.isInventoryOpen;
    this.inventoryModal.setVisible(this.isInventoryOpen);

    // Bullet-time slow motion in GameScene
    this.gameScene?.events.emit('inventoryToggled', this.isInventoryOpen);

    if (this.isInventoryOpen) {
      window.sounds?.playOink();
      this.refreshCharacterPanel();
      this.updateTabButtons();

      if (this.activeTab === 'inventory') {
        this.inventoryTabContent.setVisible(true);
        this.cosmeticsTabContent.setVisible(false);
        this.refreshInventoryDisplay();
      } else {
        this.inventoryTabContent.setVisible(false);
        this.cosmeticsTabContent.setVisible(true);
        this.refreshCosmeticsDisplay();
      }
    }
  }

  refreshCharacterPanel() {
    if (!this.charPreviewGraphics) return;

    // 1. Draw Pedestal & Character Doll
    this.charPreviewGraphics.clear();

    // 3D Isometric Pedestal ellipse
    this.charPreviewGraphics.fillStyle(0x0e1318, 0.6);
    this.charPreviewGraphics.fillEllipse(0, 52, 100, 28);
    this.charPreviewGraphics.fillStyle(0x273849, 1);
    this.charPreviewGraphics.fillEllipse(0, 48, 92, 24);
    this.charPreviewGraphics.lineStyle(2, 0x00d2d3, 0.85);
    this.charPreviewGraphics.strokeEllipse(0, 48, 92, 24);

    // Draw Piggy at 2.4x scale with currently equipped cosmetics
    if (window.CosmeticsManager) {
      window.CosmeticsManager.drawPiggyGraphics(this.charPreviewGraphics, -58, -32, 2.4);
    }

    // 2. Equipped Gear Slots Display
    this.gearSlotsContainer.removeAll(true);
    const cm = window.CosmeticsManager;
    const equipped = cm ? cm.getEquipped() : { head: 'head_bandana', costume: 'costume_classic', boots: 'boots_bare' };
    const headItem = cm ? cm.getItemById(equipped.head) : null;
    const costumeItem = cm ? cm.getItemById(equipped.costume) : null;
    const bootsItem = cm ? cm.getItemById(equipped.boots) : null;

    const slots = [
      { slot: 'HEAD', item: headItem, defaultIcon: '🧣' },
      { slot: 'BODY', item: costumeItem, defaultIcon: '🦺' },
      { slot: 'FEET', item: bootsItem, defaultIcon: '🐾' }
    ];

    slots.forEach((s, idx) => {
      const sy = idx * 26;
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x131920, 0.85);
      slotBg.fillRoundedRect(-92, sy - 10, 184, 22, 4);
      slotBg.lineStyle(1, 0x3d5066, 0.8);
      slotBg.strokeRoundedRect(-92, sy - 10, 184, 22, 4);
      this.gearSlotsContainer.add(slotBg);

      const label = `${s.item ? s.item.icon : s.defaultIcon} ${s.slot}: ${s.item ? s.item.name : 'None'}`;
      const txt = this.add.text(-86, sy + 1, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#ffffff'
      }).setOrigin(0, 0.5);
      this.gearSlotsContainer.add(txt);
    });

    // 3. Active Passives Summary Box
    this.passivesContainer.removeAll(true);
    const passBg = this.add.graphics();
    passBg.fillStyle(0x131920, 0.95);
    passBg.fillRoundedRect(-95, -28, 190, 56, 6);
    passBg.lineStyle(1.5, 0xf1c40f, 0.85);
    passBg.strokeRoundedRect(-95, -28, 190, 56, 6);
    this.passivesContainer.add(passBg);

    const passHeader = this.add.text(0, -18, '⚡ PASSIVE BONUSES', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7.5px',
      color: '#f1c40f'
    }).setOrigin(0.5);
    this.passivesContainer.add(passHeader);

    const bonuses = cm ? cm.getActiveBonuses() : {};
    const traits = [];
    if (bonuses.speedMult && bonuses.speedMult > 1.0) traits.push(`Speed +${Math.round((bonuses.speedMult - 1) * 100)}%`);
    if (bonuses.mudImmune) traits.push('Mud Immune');
    if (bonuses.jumpPowerMult && bonuses.jumpPowerMult > 1.0) traits.push(`Jump +${Math.round((bonuses.jumpPowerMult - 1) * 100)}%`);
    if (bonuses.dashCooldownMult && bonuses.dashCooldownMult < 1.0) traits.push(`Dash CD -${Math.round((1 - bonuses.dashCooldownMult) * 100)}%`);
    if (bonuses.hazardImmune) traits.push('Hazard Shield');
    if (bonuses.scoreMult && bonuses.scoreMult > 1.0) traits.push(`Fruit +${Math.round((bonuses.scoreMult - 1) * 100)}%`);
    if (bonuses.stealth && bonuses.stealth > 0) traits.push(`Stealth +${Math.round(bonuses.stealth * 100)}%`);
    if (bonuses.artifactDurationMult && bonuses.artifactDurationMult > 1.0) traits.push(`Artifacts +${Math.round((bonuses.artifactDurationMult - 1) * 100)}%`);

    const traitStr = traits.length > 0 ? traits.slice(0, 3).join(' • ') : 'Equip gear for RPG boosts!';
    const passText = this.add.text(0, 4, traitStr, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#2ecc71',
      align: 'center',
      wordWrap: { width: 180 }
    }).setOrigin(0.5);
    this.passivesContainer.add(passText);
  }

  showDevBadge(width) {
    if (this.devRefillBtn) return;
    const w = width || this.cameras.main.width;

    // HUD Dev Pill Badge
    this.devPill = this.add.text(w / 2 + 125, 28, '🛠️ DEV', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#00d2d3'
    }).setOrigin(0.5, 0);

    // HUD Restock Button
    this.devRefillBtn = this.createHudButton(w - 395, 20, 135, 36, '🛠️ RESTOCK [0]', 0x16a085, () => {
      window.sounds?.playPowerup();
      this.gameScene?.refillDevArtifacts();
      if (this.isInventoryOpen && this.activeTab === 'inventory') {
        this.refreshInventoryDisplay();
      }
    });
  }

  refreshInventoryDisplay() {
    this.slotsContainer.removeAll(true);
    const inv = this.inventory || [];
    const rightW = this.rightW;

    // Bullet-Time Banner
    const bannerBox = this.add.graphics();
    bannerBox.fillStyle(0x0e1318, 0.85);
    bannerBox.fillRoundedRect(-rightW / 2 + 10, -this.modalH / 2 + 75, rightW - 20, 32, 6);
    bannerBox.lineStyle(1.5, 0x00d2d3, 0.75);
    bannerBox.strokeRoundedRect(-rightW / 2 + 10, -this.modalH / 2 + 75, rightW - 20, 32, 6);
    this.slotsContainer.add(bannerBox);

    const bannerText = this.add.text(0, -this.modalH / 2 + 84, '⏳ BULLET TIME: 0.18x SLOW-MO ACTIVE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00d2d3'
    }).setOrigin(0.5);
    this.slotsContainer.add(bannerText);

    const subText = this.add.text(0, -this.modalH / 2 + 97, 'Click USE or press [1-5] | [R] or [ESC] to return', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#bdc3c7'
    }).setOrigin(0.5);
    this.slotsContainer.add(subText);

    // Developer Instant Restock Button in Inventory Modal
    if (this.isDevMode) {
      const devRefillBtn = this.add.container(0, -this.modalH / 2 + 118);
      const drBg = this.add.graphics();
      drBg.fillStyle(0xd35400, 1);
      drBg.fillRoundedRect(-125, -12, 250, 24, 4);
      drBg.lineStyle(1.5, 0xf39c12, 1);
      drBg.strokeRoundedRect(-125, -12, 250, 24, 4);
      devRefillBtn.add(drBg);

      const drText = this.add.text(0, 0, '⚡ RESTOCK ALL 5 ARTIFACTS [0]', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7.5px',
        color: '#ffffff'
      }).setOrigin(0.5);
      devRefillBtn.add(drText);

      devRefillBtn.setSize(250, 24);
      devRefillBtn.setInteractive({ useHandCursor: true });
      devRefillBtn.on('pointerdown', () => {
        window.sounds?.playPowerup();
        this.gameScene?.refillDevArtifacts();
        this.refreshInventoryDisplay();
      });
      this.slotsContainer.add(devRefillBtn);
    }

    // Empty state
    if (inv.length === 0) {
      const emptyCont = this.add.container(0, 30);
      const icon = this.add.text(0, -20, '🎒', { fontSize: '32px' }).setOrigin(0.5);
      const msg = this.add.text(0, 20, 'No artifacts in bag!\nPress [0] or click RESTOCK to test all artifacts!', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#95a5a6',
        align: 'center',
        lineSpacing: 6
      }).setOrigin(0.5);
      emptyCont.add(icon);
      emptyCont.add(msg);
      this.slotsContainer.add(emptyCont);
      return;
    }

    // List Artifact Rows (offset slightly if dev restock button is visible)
    const startY = this.isDevMode ? (-this.modalH / 2 + 150) : (-this.modalH / 2 + 130);
    const rowH = this.isDevMode ? 42 : 46;

    inv.forEach((item, idx) => {
      const rowY = startY + idx * rowH;
      const row = this.add.container(0, rowY);

      // Slot background
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x1e2733, 0.9);
      slotBg.fillRoundedRect(-rightW / 2 + 10, -17, rightW - 20, 37, 6);
      slotBg.lineStyle(1.5, 0x3d5066, 1);
      slotBg.strokeRoundedRect(-rightW / 2 + 10, -17, rightW - 20, 37, 6);
      row.add(slotBg);

      // Icon & Name
      const nameText = this.add.text(-rightW / 2 + 20, -5, `${item.icon} [${idx + 1}] ${item.name}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8.5px',
        color: '#ffffff'
      }).setOrigin(0, 0.5);
      row.add(nameText);

      // Description / Bonus
      const descText = this.add.text(-rightW / 2 + 20, 8, item.desc, {
        fontFamily: 'monospace',
        fontSize: '9.5px',
        color: '#feca57'
      }).setOrigin(0, 0.5);
      row.add(descText);

      // USE Button
      const useBtn = this.add.container(rightW / 2 - 50, 0);
      const uBg = this.add.graphics();
      uBg.fillStyle(0x27ae60, 1);
      uBg.fillRoundedRect(-32, -14, 64, 28, 4);
      uBg.lineStyle(1.5, 0x2ecc71, 1);
      uBg.strokeRoundedRect(-32, -14, 64, 28, 4);
      useBtn.add(uBg);

      const uLabel = this.add.text(0, 0, `USE [${idx + 1}]`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffffff'
      }).setOrigin(0.5);
      useBtn.add(uLabel);

      useBtn.setSize(64, 28);
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

  refreshCosmeticsDisplay() {
    this.cosmeticsTabContent.removeAll(true);
    const cm = window.CosmeticsManager;
    if (!cm) return;

    const rightW = this.rightW;

    // Filter Pills Bar (ALL, HEAD, COSTUME, BOOTS)
    const filters = [
      { id: 'all', label: 'ALL' },
      { id: 'head', label: '🧣 HEAD' },
      { id: 'costume', label: '🦺 COSTUME' },
      { id: 'boots', label: '🐾 BOOTS' }
    ];

    const filterCont = this.add.container(0, -this.modalH / 2 + 82);
    const pillW = (rightW - 24) / filters.length;

    filters.forEach((f, idx) => {
      const px = -rightW / 2 + 12 + idx * pillW + pillW / 2;
      const pill = this.add.container(px, 0);
      const isSel = this.cosmeticFilter === f.id;

      const pBg = this.add.graphics();
      pBg.fillStyle(isSel ? 0x9b59b6 : 0x1a232f, 0.95);
      pBg.fillRoundedRect(-pillW / 2 + 2, -12, pillW - 4, 24, 4);
      pBg.lineStyle(1.5, isSel ? 0xdfe6e9 : 0x3d5066, 0.8);
      pBg.strokeRoundedRect(-pillW / 2 + 2, -12, pillW - 4, 24, 4);
      pill.add(pBg);

      const pText = this.add.text(0, 0, f.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7.5px',
        color: isSel ? '#ffffff' : '#95a5a6'
      }).setOrigin(0.5);
      pill.add(pText);

      pill.setSize(pillW - 4, 24);
      pill.setInteractive({ useHandCursor: true });
      pill.on('pointerdown', () => {
        window.sounds?.playOink();
        this.cosmeticFilter = f.id;
        this.cosmeticPage = 0;
        this.refreshCosmeticsDisplay();
      });

      filterCont.add(pill);
    });
    this.cosmeticsTabContent.add(filterCont);

    // Filter items
    let allItems = cm.getAllItems();
    if (this.cosmeticFilter !== 'all') {
      allItems = allItems.filter(i => i.category === this.cosmeticFilter);
    }

    // Pagination: 4 items per page
    const pageSize = 4;
    const totalPages = Math.max(1, Math.ceil(allItems.length / pageSize));
    if (this.cosmeticPage >= totalPages) this.cosmeticPage = 0;
    const pagedItems = allItems.slice(this.cosmeticPage * pageSize, (this.cosmeticPage + 1) * pageSize);

    // List cosmetic items
    const startY = -this.modalH / 2 + 124;
    const cardH = 54;
    const equipped = cm.getEquipped();

    pagedItems.forEach((item, idx) => {
      const cardY = startY + idx * cardH;
      const card = this.add.container(0, cardY);

      const isEquipped = (equipped[item.category] === item.id);
      const isUnlocked = cm.isUnlocked(item.id);

      // Card Background
      const cardBg = this.add.graphics();
      if (isEquipped) {
        cardBg.fillStyle(0x1e382b, 0.95);
        cardBg.fillRoundedRect(-rightW / 2 + 10, -22, rightW - 20, 48, 6);
        cardBg.lineStyle(1.5, 0x2ecc71, 0.9);
        cardBg.strokeRoundedRect(-rightW / 2 + 10, -22, rightW - 20, 48, 6);
      } else if (isUnlocked) {
        cardBg.fillStyle(0x1a232f, 0.9);
        cardBg.fillRoundedRect(-rightW / 2 + 10, -22, rightW - 20, 48, 6);
        cardBg.lineStyle(1.5, 0x3d5066, 0.8);
        cardBg.strokeRoundedRect(-rightW / 2 + 10, -22, rightW - 20, 48, 6);
      } else {
        cardBg.fillStyle(0x12171e, 0.85);
        cardBg.fillRoundedRect(-rightW / 2 + 10, -22, rightW - 20, 48, 6);
        cardBg.lineStyle(1.5, 0x242e3a, 0.8);
        cardBg.strokeRoundedRect(-rightW / 2 + 10, -22, rightW - 20, 48, 6);
      }
      card.add(cardBg);

      // Icon & Name
      const iconTxt = this.add.text(-rightW / 2 + 20, -7, `${item.icon} ${item.name}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8.5px',
        color: isUnlocked ? '#ffffff' : '#7f8c8d'
      }).setOrigin(0, 0.5);
      card.add(iconTxt);

      // Category Tag
      const catBadge = this.add.text(-rightW / 2 + 20, 10, `[${item.category.toUpperCase()}]`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#00d2d3'
      }).setOrigin(0, 0.5);
      card.add(catBadge);

      // Bonus Abilities Text
      const bonusColor = isUnlocked ? '#feca57' : '#57606f';
      const bonusText = isUnlocked ? item.bonusText : (item.unlockDesc || `Beat Level ${item.unlockLevel}`);
      const bTxt = this.add.text(-rightW / 2 + 115, 10, `⚡ ${bonusText}`, {
        fontFamily: 'monospace',
        fontSize: '9.5px',
        color: bonusColor
      }).setOrigin(0, 0.5);
      card.add(bTxt);

      // Equip / Equipped / Locked Button
      const btnX = rightW / 2 - 55;
      const actBtn = this.add.container(btnX, 0);

      const bG = this.add.graphics();
      if (isEquipped) {
        bG.fillStyle(0x27ae60, 1);
        bG.fillRoundedRect(-38, -14, 76, 28, 4);
        bG.lineStyle(1.5, 0x2ecc71, 1);
        bG.strokeRoundedRect(-38, -14, 76, 28, 4);
        actBtn.add(bG);

        const lbl = this.add.text(0, 0, '✓ ON', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#ffffff'
        }).setOrigin(0.5);
        actBtn.add(lbl);
      } else if (isUnlocked) {
        bG.fillStyle(0x2980b9, 1);
        bG.fillRoundedRect(-38, -14, 76, 28, 4);
        bG.lineStyle(1.5, 0x3498db, 1);
        bG.strokeRoundedRect(-38, -14, 76, 28, 4);
        actBtn.add(bG);

        const lbl = this.add.text(0, 0, 'EQUIP', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#ffffff'
        }).setOrigin(0.5);
        actBtn.add(lbl);

        actBtn.setSize(76, 28);
        actBtn.setInteractive({ useHandCursor: true });
        actBtn.on('pointerdown', () => {
          window.sounds?.playOink();
          cm.equip(item.category, item.id);
          this.gameScene?.events.emit('cosmeticsChanged');
          this.refreshCharacterPanel();
          this.refreshCosmeticsDisplay();
        });
      } else {
        bG.fillStyle(0x2c3e50, 0.6);
        bG.fillRoundedRect(-38, -14, 76, 28, 4);
        bG.lineStyle(1.5, 0x34495e, 0.8);
        bG.strokeRoundedRect(-38, -14, 76, 28, 4);
        actBtn.add(bG);

        const lbl = this.add.text(0, 0, '🔒 LOCKED', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: '#95a5a6'
        }).setOrigin(0.5);
        actBtn.add(lbl);
      }

      card.add(actBtn);
      this.cosmeticsTabContent.add(card);
    });

    // Pagination Footer (if multiple pages)
    if (totalPages > 1) {
      const footY = this.modalH / 2 - 38;
      const footCont = this.add.container(0, footY);

      // Prev Button
      const prevBtn = this.add.text(-70, 0, '◀ PREV', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: this.cosmeticPage > 0 ? '#f1c40f' : '#57606f'
      }).setOrigin(0.5);
      if (this.cosmeticPage > 0) {
        prevBtn.setInteractive({ useHandCursor: true });
        prevBtn.on('pointerdown', () => {
          this.cosmeticPage--;
          this.refreshCosmeticsDisplay();
        });
      }
      footCont.add(prevBtn);

      // Page indicator
      const pageTxt = this.add.text(0, 0, `PAGE ${this.cosmeticPage + 1} / ${totalPages}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffffff'
      }).setOrigin(0.5);
      footCont.add(pageTxt);

      // Next Button
      const nextBtn = this.add.text(70, 0, 'NEXT ▶', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: (this.cosmeticPage + 1 < totalPages) ? '#f1c40f' : '#57606f'
      }).setOrigin(0.5);
      if (this.cosmeticPage + 1 < totalPages) {
        nextBtn.setInteractive({ useHandCursor: true });
        nextBtn.on('pointerdown', () => {
          this.cosmeticPage++;
          this.refreshCosmeticsDisplay();
        });
      }
      footCont.add(nextBtn);

      this.cosmeticsTabContent.add(footCont);
    }
  }

  setupTouchControls() {
    // Only display touch controls on mobile or tablet devices
    const isMobileOrTablet = ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      (window.innerWidth <= 900);

    if (!isMobileOrTablet) {
      // Desktop user: no on-screen touch controls needed!
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // ==========================================
    // 1. VIRTUAL JOYSTICK (Bottom-Left Dot Drag)
    // ==========================================
    this.joyBaseX = 100;
    this.joyBaseY = height - 90;
    this.joyMaxRadius = 45;

    this.joystickContainer = this.add.container(this.joyBaseX, this.joyBaseY).setDepth(3000);

    // Outer boundary ring
    const baseG = this.add.graphics();
    baseG.fillStyle(0x000000, 0.4);
    baseG.fillCircle(0, 0, 56);
    baseG.lineStyle(2.5, 0x57606f, 0.85);
    baseG.strokeCircle(0, 0, 56);

    // Directional hint tick marks
    baseG.fillStyle(0xffffff, 0.25);
    baseG.fillRect(-2, -50, 4, 10); // up
    baseG.fillRect(-2, 40, 4, 10);  // down
    baseG.fillRect(-50, -2, 10, 4); // left
    baseG.fillRect(40, -2, 10, 4);  // right
    this.joystickContainer.add(baseG);

    // Center resting dot
    const centerDot = this.add.graphics();
    centerDot.fillStyle(0xffffff, 0.35);
    centerDot.fillCircle(0, 0, 5);
    this.joystickContainer.add(centerDot);

    // Draggable Knob / Stick Dot
    this.joystickKnob = this.add.container(0, 0);
    const knobG = this.add.graphics();
    // 3D Shadow
    knobG.fillStyle(0x000000, 0.4);
    knobG.fillCircle(0, 3, 24);
    // Green face
    knobG.fillStyle(0x2ed573, 0.92);
    knobG.fillCircle(0, 0, 23);
    // Bright highlight rim
    knobG.lineStyle(2.5, 0xffffff, 0.95);
    knobG.strokeCircle(0, 0, 23);
    // Core highlight
    knobG.fillStyle(0x7bed9f, 0.85);
    knobG.fillCircle(-4, -4, 8);
    this.joystickKnob.add(knobG);
    this.joystickContainer.add(this.joystickKnob);

    // Wide hit area for thumb dragging
    const hitZone = this.add.circle(0, 0, 80, 0x000000, 0.001);
    hitZone.setInteractive({ useHandCursor: true });
    this.joystickContainer.add(hitZone);

    let activeTouchId = null;

    const updateKnobPos = (pointer) => {
      const lx = pointer.x - this.joyBaseX;
      const ly = pointer.y - this.joyBaseY;
      const dist = Math.hypot(lx, ly);
      const angle = Math.atan2(ly, lx);
      const clampedDist = Math.min(dist, this.joyMaxRadius);

      const kx = Math.cos(angle) * clampedDist;
      const ky = Math.sin(angle) * clampedDist;

      this.joystickKnob.x = kx;
      this.joystickKnob.y = ky;

      const normX = kx / this.joyMaxRadius;
      const normY = ky / this.joyMaxRadius;

      if (this.gameScene) {
        this.gameScene.touchJoystick = { x: normX, y: normY, active: true };
      }
    };

    const resetKnob = () => {
      activeTouchId = null;
      this.tweens.add({
        targets: this.joystickKnob,
        x: 0,
        y: 0,
        duration: 120,
        ease: 'Back.easeOut'
      });
      if (this.gameScene) {
        this.gameScene.touchJoystick = { x: 0, y: 0, active: false };
      }
    };

    hitZone.on('pointerdown', (pointer) => {
      activeTouchId = pointer.id;
      updateKnobPos(pointer);
    });

    this.input.on('pointermove', (pointer) => {
      if (activeTouchId !== null && pointer.id === activeTouchId) {
        updateKnobPos(pointer);
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (activeTouchId !== null && pointer.id === activeTouchId) {
        resetKnob();
      }
    });

    // ==========================================
    // 2. MOBILE ACTION BUTTONS (Bottom-Right)
    // ==========================================
    // JUMP Button (Right)
    const jumpX = width - 85;
    const jumpY = height - 90;
    this.jumpBtn = this.add.container(jumpX, jumpY).setDepth(3000);

    const jumpG = this.add.graphics();
    jumpG.fillStyle(0x10ac84, 0.9);
    jumpG.fillCircle(0, 0, 36);
    jumpG.lineStyle(2.5, 0x1dd1a1, 1);
    jumpG.strokeCircle(0, 0, 36);
    this.jumpBtn.add(jumpG);

    const jumpText = this.add.text(0, -1, 'JUMP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.jumpBtn.add(jumpText);

    this.jumpBtn.setSize(72, 72);
    this.jumpBtn.setInteractive({ useHandCursor: true });
    this.jumpBtn.on('pointerdown', () => {
      this.jumpBtn.setScale(0.92);
      this.gameScene?.requestJump();
    });
    this.jumpBtn.on('pointerup', () => this.jumpBtn.setScale(1.0));
    this.jumpBtn.on('pointerout', () => this.jumpBtn.setScale(1.0));

    // DASH Button (Left of Jump)
    const dashX = width - 175;
    const dashY = height - 75;
    this.dashBtn = this.add.container(dashX, dashY).setDepth(3000);

    const dashG = this.add.graphics();
    dashG.fillStyle(0xee5253, 0.9);
    dashG.fillCircle(0, 0, 28);
    dashG.lineStyle(2.5, 0xff6b6b, 1);
    dashG.strokeCircle(0, 0, 28);
    this.dashBtn.add(dashG);

    const dashText = this.add.text(0, -1, 'DASH', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.dashBtn.add(dashText);

    this.dashBtn.setSize(56, 56);
    this.dashBtn.setInteractive({ useHandCursor: true });
    this.dashBtn.on('pointerdown', () => {
      this.dashBtn.setScale(0.92);
      this.gameScene?.requestDash();
    });
    this.dashBtn.on('pointerup', () => this.dashBtn.setScale(1.0));
    this.dashBtn.on('pointerout', () => this.dashBtn.setScale(1.0));
  }

  repositionUI(w, h) {
    if (this.hudBg) {
      this.hudBg.clear();
      this.hudBg.fillStyle(0x000000, 0.55);
      this.hudBg.fillRoundedRect(12, 10, w - 24, 56, 10);
      this.hudBg.lineStyle(2, 0x57606f, 0.8);
      this.hudBg.strokeRoundedRect(12, 10, w - 24, 56, 10);
    }
    if (this.timeText) this.timeText.x = w / 2 - 35;
    if (this.diffBadge) this.diffBadge.x = w / 2 + 55;
    if (this.devPill) this.devPill.x = w / 2 + 125;
    if (this.devRefillBtn) this.devRefillBtn.x = w - 395;
    if (this.bagBtn) this.bagBtn.x = w - 250;
    if (this.dashText) this.dashText.x = w - 24;
    if (this.buffsContainer) this.buffsContainer.x = w / 2;
    if (this.inventoryModal) {
      this.inventoryModal.x = w / 2;
      this.inventoryModal.y = h / 2;
    }
    if (this.radarBg) {
      this.radarBg.destroy();
      this.farmerIcon?.destroy();
      this.piggyIcon?.destroy();
      this.goalIcon?.destroy();
      this.createTensionRadar(w);
    }
    if (this.jumpBtn) {
      this.jumpBtn.x = w - 85;
      this.jumpBtn.y = h - 90;
    }
    if (this.dashBtn) {
      this.dashBtn.x = w - 175;
      this.dashBtn.y = h - 75;
    }
    if (this.joystickContainer) {
      this.joyBaseX = 100;
      this.joyBaseY = h - 90;
      this.joystickContainer.setPosition(this.joyBaseX, this.joyBaseY);
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

    const hasUnlocks = (data && data.newUnlocks && data.newUnlocks.length > 0);
    const modalH = hasUnlocks ? 370 : 300;
    const modalW = 380;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a252f, 0.96);
    bg.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 18);
    bg.lineStyle(3, 0x2ecc71, 1);
    bg.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 18);
    // Gold inner border
    bg.lineStyle(1.5, 0xf1c40f, 0.6);
    bg.strokeRoundedRect(-modalW / 2 + 4, -modalH / 2 + 4, modalW - 8, modalH - 8, 14);
    modal.add(bg);

    const isTraining = this.gameScene?.levelData?.isTraining;
    const titleText = isTraining ? 'TRAINING COMPLETE! 🎓' : 'ESCAPED TO THE BARN! 🎉';
    const descText = isTraining
      ? 'You mastered navigation, jumping, dashing & bouncing!\nReady to face the real farmer in Level 1?'
      : 'Safe inside! The farmer was left in the dust!';

    const title = this.add.text(0, -modalH / 2 + 35, titleText, {
      fontFamily: 'Impact, Arial Black',
      fontSize: isTraining ? '24px' : '26px',
      color: '#2ecc71'
    }).setOrigin(0.5);
    modal.add(title);

    const desc = this.add.text(0, -modalH / 2 + 75, descText, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ecf0f1',
      align: 'center',
      wordWrap: { width: 330 }
    }).setOrigin(0.5);
    modal.add(desc);

    const finalScore = this.score + Math.max(0, Math.ceil(data.timeLeft) * 20);
    const scoreInfo = this.add.text(0, -modalH / 2 + 125, `SCORE: ${finalScore} ⭐`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#f1c40f'
    }).setOrigin(0.5);
    modal.add(scoreInfo);

    // Unlocked Cosmetics Showcase Card
    if (hasUnlocks) {
      const unlockCont = this.add.container(0, -modalH / 2 + 185);
      const uBg = this.add.graphics();
      uBg.fillStyle(0x131920, 0.92);
      uBg.fillRoundedRect(-165, -28, 330, 56, 8);
      uBg.lineStyle(1.5, 0xf1c40f, 0.9);
      uBg.strokeRoundedRect(-165, -28, 330, 56, 8);
      unlockCont.add(uBg);

      const uTitle = this.add.text(0, -16, '🎁 NEW COSMETICS UNLOCKED!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#f1c40f'
      }).setOrigin(0.5);
      unlockCont.add(uTitle);

      const unlockLines = data.newUnlocks.map(u => `${u.icon} ${u.name}: ${u.bonusText}`).join('\n');
      const uList = this.add.text(0, 8, unlockLines, {
        fontFamily: 'monospace',
        fontSize: '9.5px',
        color: '#00d2d3',
        align: 'center'
      }).setOrigin(0.5);
      unlockCont.add(uList);
      modal.add(unlockCont);

      const bagHint = this.add.text(0, -modalH / 2 + 235, 'Check Bag [R] to equip your new gear!', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#2ecc71',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      modal.add(bagHint);
    }

    const btnY = modalH / 2 - 40;
    const hasNext = isTraining ? true : (data.levelIndex + 1 < (window.GAME_LEVELS?.length || 0));
    const nextIdx = isTraining ? 1 : data.levelIndex + 1;
    const nextLabel = isTraining ? 'START LEVEL 1 ▶' : 'NEXT LEVEL ❯';

    if (hasNext) {
      this.createButton(modal, -85, btnY, nextLabel, 0x27ae60, () => {
        this.scene.stop('UIScene');
        this.scene.start('GameScene', { levelIndex: nextIdx });
      });
    }

    this.createButton(modal, hasNext ? 85 : 0, btnY, 'MENU', 0x34495e, () => {
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
