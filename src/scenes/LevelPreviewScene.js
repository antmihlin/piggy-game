// LevelPreviewScene: Full 2.5D Isometric Map Inspector and Level Browser

class LevelPreviewScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelPreviewScene' });
  }

  init(data) {
    this.currentLevelIndex = data?.levelIndex || 0;
    this.difficulty = data?.difficulty || 'normal';
    this.levels = window.GAME_LEVELS || [];
    this.tileWidth = 64;
    this.tileHeight = 32;
    this.elevationStep = 18;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background gradient
    const bg = this.add.graphics().setScrollFactor(0);
    bg.fillGradientStyle(0x131d27, 0x131d27, 0x1e272e, 0x2d3436, 1);
    bg.fillRect(0, 0, width, height);

    // World Map Container (holds isometric tiles and entities)
    this.mapContainer = this.add.container(0, 0);

    // Render the initial selected level
    this.renderLevelMap(this.currentLevelIndex);

    // Setup interactive panning & zooming
    this.setupCameraControls();

    // Create UI Overlay (Tabs, Stats Card, Play & Back Buttons)
    this.createUIOverlay(width, height);

    window.sounds?.playOink();
  }

  gridToIso(gx, gy, gz = 0) {
    const isoX = (gx - gy) * (this.tileWidth / 2);
    const isoY = (gx + gy) * (this.tileHeight / 2) - (gz * this.elevationStep);
    return { x: isoX, y: isoY };
  }

  renderLevelMap(index) {
    this.currentLevelIndex = index;
    const lvl = this.levels[index];
    if (!lvl) return;

    // Clear previous map objects
    this.mapContainer.removeAll(true);

    const gw = lvl.gridWidth;
    const gh = lvl.gridHeight;
    const pathX = lvl.pathX || Math.floor(gw / 2);

    // 1. Render Foundation Tiles
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const isPath = Math.abs(x - pathX) <= 1;
        const tileKey = isPath ? 'tile_dirt' : 'tile_grass';
        const z = (x === 0 || x === gw - 1) ? 1 : 0;

        const iso = this.gridToIso(x, y, z);
        const tile = this.add.image(iso.x, iso.y, tileKey);
        tile.setOrigin(0.5, 0.35);
        tile.setDepth(iso.y - 100);
        this.mapContainer.add(tile);
      }
    }

    // 2. Obstacles
    (lvl.obstacles || []).forEach(obs => {
      const iso = this.gridToIso(obs.x, obs.y, obs.z || 0);
      const sprite = this.add.image(iso.x, iso.y, obs.type);
      sprite.setOrigin(0.5, 0.7);
      sprite.setDepth(iso.y);
      this.mapContainer.add(sprite);
    });

    // 3. Collectibles
    (lvl.items || []).forEach(item => {
      const iso = this.gridToIso(item.x, item.y, item.z || 0);
      const sprite = this.add.image(iso.x, iso.y - 8, item.type);
      sprite.setOrigin(0.5, 0.7);
      sprite.setDepth(iso.y + 5);
      this.mapContainer.add(sprite);
    });

    // 4. Scenery (Barn, Trees, Fences)
    (lvl.scenery || []).forEach(sc => {
      const iso = this.gridToIso(sc.x, sc.y, sc.z || 0);
      const sprite = this.add.image(iso.x, iso.y, sc.type);
      sprite.setOrigin(0.5, 0.85);
      sprite.setDepth(iso.y + (sc.type === 'barn' ? 40 : 0));
      this.mapContainer.add(sprite);
    });

    // 5. Hero & Farmer Spawn Markers
    const pStart = lvl.piggyStart || { x: 5, y: 3, z: 0 };
    const pIso = this.gridToIso(pStart.x, pStart.y, pStart.z);
    const pig = this.add.image(pIso.x, pIso.y, 'piggy');
    pig.setOrigin(0.5, 0.85);
    pig.setDepth(pIso.y + 15);
    this.mapContainer.add(pig);

    // Floating Pin for Piggy
    const pBadge = this.createPinBadge(pIso.x, pIso.y - 48, '🐷 START', 0x10ac84);
    this.mapContainer.add(pBadge);

    const fStart = lvl.farmerStart || { x: 5, y: -2, z: 0 };
    const fIso = this.gridToIso(fStart.x, fStart.y, fStart.z);
    const farmer = this.add.image(fIso.x, fIso.y, 'farmer');
    farmer.setOrigin(0.5, 0.85);
    farmer.setDepth(fIso.y + 15);
    this.mapContainer.add(farmer);

    // Floating Pin for Farmer
    const fBadge = this.createPinBadge(fIso.x, fIso.y - 58, '👨‍🌾 CHASER', 0xd63031);
    this.mapContainer.add(fBadge);

    // Goal Marker (The Barn)
    const goal = lvl.goal || { x: pathX, y: gh - 2 };
    const gIso = this.gridToIso(goal.x, goal.y, 0);
    const gBadge = this.createPinBadge(gIso.x, gIso.y - 85, '🏡 GOAL (BARN)', 0xf1c40f, 0x000000);
    this.mapContainer.add(gBadge);

    // Center camera on middle of map
    const midIso = this.gridToIso(gw / 2, gh / 2, 0);
    this.cameras.main.centerOn(midIso.x, midIso.y);

    // Update stats card text
    if (this.statsText) {
      this.updateStatsCard(lvl);
    }
  }

  createPinBadge(x, y, text, bgColor, textColorHex = 0xffffff) {
    const cont = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 0.95);
    bg.fillRoundedRect(-42, -12, 84, 24, 6);
    bg.lineStyle(1.5, 0xffffff, 0.8);
    bg.strokeRoundedRect(-42, -12, 84, 24, 6);
    cont.add(bg);

    const colorStr = textColorHex === 0x000000 ? '#000000' : '#ffffff';
    const txt = this.add.text(0, 0, text, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: colorStr,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    cont.add(txt);
    cont.setDepth(9999);

    // Idle bob
    this.tweens.add({
      targets: cont,
      y: y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return cont;
  }

  setupCameraControls() {
    const cam = this.cameras.main;
    cam.setZoom(0.85);

    // Drag to pan
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    this.input.on('pointerdown', (pointer) => {
      // Don't drag if clicking UI buttons at top or bottom
      if (pointer.y < 80 || pointer.y > this.cameras.main.height - 110) return;
      isDragging = true;
      dragStartX = pointer.x;
      dragStartY = pointer.y;
    });

    this.input.on('pointermove', (pointer) => {
      if (isDragging) {
        cam.scrollX -= (pointer.x - dragStartX) / cam.zoom;
        cam.scrollY -= (pointer.y - dragStartY) / cam.zoom;
        dragStartX = pointer.x;
        dragStartY = pointer.y;
      }
    });

    this.input.on('pointerup', () => {
      isDragging = false;
    });

    // Mouse wheel zoom
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const newZoom = Phaser.Math.Clamp(cam.zoom - deltaY * 0.001, 0.5, 1.6);
      cam.setZoom(newZoom);
    });
  }

  createUIOverlay(width, height) {
    // 1. Top Bar Background
    const topBar = this.add.graphics().setScrollFactor(0);
    topBar.fillStyle(0x000000, 0.75);
    topBar.fillRect(0, 0, width, 70);

    // Title
    this.add.text(24, 18, '🗺️ LEVEL MAP PREVIEW', {
      fontFamily: 'Impact, Arial Black',
      fontSize: '22px',
      color: '#feca57',
      letterSpacing: 1
    }).setScrollFactor(0);

    this.add.text(24, 44, 'Drag with mouse or touch to pan | Scroll to zoom', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#a4b0be'
    }).setScrollFactor(0);

    // Level Selector Tabs in Top Bar
    this.tabButtons = [];
    const tabSpacing = 92;
    const totalTabsW = this.levels.length * tabSpacing;
    const tabStartX = width - totalTabsW - 10;
    this.levels.forEach((lvl, idx) => {
      const label = lvl.isTraining ? '🎓 YARD' : `LVL ${lvl.id}`;
      const tab = this.createTabButton(tabStartX + idx * tabSpacing + 42, 35, label, idx === this.currentLevelIndex, () => {
        window.sounds?.playOink();
        this.selectLevel(idx);
      });
      this.tabButtons.push(tab);
    });

    // 2. Bottom Stats Card
    const cardW = Math.min(380, width * 0.9);
    const cardH = 92;
    const cardX = (width - cardW) / 2;
    const cardY = height - 104;

    const cardBg = this.add.graphics().setScrollFactor(0);
    cardBg.fillStyle(0x1a252f, 0.92);
    cardBg.fillRoundedRect(cardX, cardY, cardW, cardH, 14);
    cardBg.lineStyle(2, 0x1dd1a1, 0.8);
    cardBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 14);

    this.statsTitle = this.add.text(cardX + 16, cardY + 12, '', {
      fontFamily: 'Impact, Arial Black',
      fontSize: '18px',
      color: '#ffffff'
    }).setScrollFactor(0);

    this.statsSubtitle = this.add.text(cardX + 16, cardY + 34, '', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#a4b0be'
    }).setScrollFactor(0);

    this.statsDetails = this.add.text(cardX + 16, cardY + 54, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setScrollFactor(0);

    this.updateStatsCard(this.levels[this.currentLevelIndex]);

    // 3. Action Buttons: "PLAY THIS LEVEL" & "BACK"
    // Play Button (Right)
    const playBtnX = cardX + cardW - 75;
    const playBtn = this.add.container(playBtnX, cardY + cardH / 2).setScrollFactor(0);
    const pBg = this.add.graphics();
    pBg.fillStyle(0x10ac84, 1);
    pBg.fillRoundedRect(-55, -24, 110, 48, 12);
    pBg.lineStyle(2, 0xffffff, 0.6);
    pBg.strokeRoundedRect(-55, -24, 110, 48, 12);
    playBtn.add(pBg);

    const pText = this.add.text(0, 0, 'PLAY ▶', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);
    playBtn.add(pText);

    playBtn.setSize(110, 48);
    playBtn.setInteractive({ useHandCursor: true });
    playBtn.on('pointerdown', () => {
      window.sounds?.playOink();
      this.scene.start('GameScene', { levelIndex: this.currentLevelIndex, difficulty: this.difficulty });
    });

    // Back to Menu Button (Left Bottom)
    const backBtn = this.add.container(cardX - 60, cardY + cardH / 2).setScrollFactor(0);
    const bBg = this.add.graphics();
    bBg.fillStyle(0x34495e, 1);
    bBg.fillRoundedRect(-45, -20, 90, 40, 10);
    bBg.lineStyle(1.5, 0xffffff, 0.4);
    bBg.strokeRoundedRect(-45, -20, 90, 40, 10);
    backBtn.add(bBg);

    const bText = this.add.text(0, 0, '◀ BACK', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ecf0f1'
    }).setOrigin(0.5);
    backBtn.add(bText);

    backBtn.setSize(90, 40);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      window.sounds?.playOink();
      this.scene.start('MenuScene', { levelIndex: this.currentLevelIndex, difficulty: this.difficulty });
    });

    // Zoom Buttons (+ / -) in bottom-right corner
    this.createZoomButton(width - 40, height - 85, '+', 0.2);
    this.createZoomButton(width - 40, height - 45, '−', -0.2);
  }

  createZoomButton(x, y, symbol, deltaZoom) {
    const btn = this.add.container(x, y).setScrollFactor(0);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.6);
    g.fillCircle(0, 0, 16);
    g.lineStyle(1.5, 0xffffff, 0.6);
    g.strokeCircle(0, 0, 16);
    btn.add(g);

    const txt = this.add.text(0, -1, symbol, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    btn.add(txt);

    btn.setSize(32, 32);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      const cam = this.cameras.main;
      cam.setZoom(Phaser.Math.Clamp(cam.zoom + deltaZoom, 0.5, 1.8));
    });
  }

  createTabButton(x, y, label, isActive, onClick) {
    const btn = this.add.container(x, y).setScrollFactor(0);
    const bg = this.add.graphics();
    btn.bg = bg;

    this.styleTabBg(bg, isActive);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black',
      fontSize: '13px',
      color: isActive ? '#ffffff' : '#bdc3c7'
    }).setOrigin(0.5);
    btn.text = text;
    btn.add(bg);
    btn.add(text);

    btn.setSize(100, 36);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', onClick);

    return btn;
  }

  styleTabBg(bg, isActive) {
    bg.clear();
    if (isActive) {
      bg.fillStyle(0xff9f43, 1);
      bg.fillRoundedRect(-50, -18, 100, 36, 10);
      bg.lineStyle(2, 0xffffff, 0.9);
      bg.strokeRoundedRect(-50, -18, 100, 36, 10);
    } else {
      bg.fillStyle(0x2c3e50, 0.8);
      bg.fillRoundedRect(-50, -18, 100, 36, 10);
      bg.lineStyle(1, 0xffffff, 0.3);
      bg.strokeRoundedRect(-50, -18, 100, 36, 10);
    }
  }

  selectLevel(index) {
    this.currentLevelIndex = index;
    this.tabButtons.forEach((tab, i) => {
      const active = i === index;
      this.styleTabBg(tab.bg, active);
      tab.text.setColor(active ? '#ffffff' : '#bdc3c7');
    });
    this.renderLevelMap(index);
  }

  updateStatsCard(lvl) {
    if (!lvl) return;
    const titlePrefix = lvl.isTraining ? '🎓 LEVEL 0: ' : `LEVEL ${lvl.id}: `;
    this.statsTitle.setText(`${titlePrefix}${lvl.name}`);
    this.statsSubtitle.setText(lvl.subtitle);

    const itemCount = lvl.items ? lvl.items.length : 0;
    const obsCount = lvl.obstacles ? lvl.obstacles.length : 0;
    const farmerDesc = lvl.isTraining ? 'ASLEEP 💤' : `${lvl.farmerSpeed}`;
    this.statsDetails.setText(`🍎 Items: ${itemCount} | ⚠️ Traps: ${obsCount} | ⏱️ ${lvl.timeLimit}s | 🌾 Farmer: ${farmerDesc}`);
  }
}

