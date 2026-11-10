// GameScene: 2.5D Isometric World, Piggy Controller, Farmer AI, Obstacles, Physics & Camera

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.levelData = (window.GAME_LEVELS && window.GAME_LEVELS[this.levelIndex]) || window.GAME_LEVELS[0];
    this.difficulty = (data && data.difficulty) ? data.difficulty : 'normal'; // 'easy', 'normal', 'hard'
    
    // Isometric metrics matching 64x54 voxel cubes
    this.tileWidth = 64;
    this.tileHeight = 32;
    this.elevationStep = 18;

    // Game state
    this.score = 0;
    this.timeLeft = this.levelData.timeLimit || 60;
    this.isGameOver = false;
    this.isVictory = false;

    // Grace period scaled by difficulty
    if (this.difficulty === 'easy') {
      this.graceTime = 3.6;
    } else if (this.difficulty === 'hard') {
      this.graceTime = 1.6;
    } else {
      this.graceTime = 2.8;
    }

    // Dash state
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashDuration = 0;

    // Jump state (Z axis)
    this.piggyZ = 0;
    this.piggyVZ = 0;
    this.isJumping = false;
    this.waterSplashCooldown = 0;
    this.cactusPrickCooldown = 0;
    this.farmerPathTimer = 0;
    this.farmerNextWaypoint = null;

    // Farmer speed scaled by difficulty (Easy -20%, Hard +25%)
    let speedMult = 1.0;
    if (this.difficulty === 'easy') speedMult = 0.8;
    else if (this.difficulty === 'hard') speedMult = 1.25;

    this.farmerSpeed = (this.levelData.farmerSpeed || 82) * (this.levelData.isTraining ? 0 : speedMult);
    this.farmerMudSlow = 0;
    this.farmerStunTimer = 0;
    this.farmerZ = 0;
    this.farmerVZ = 0;
    this.isFarmerJumping = false;
    this.farmerJumpCooldown = 0;

    // Inventory and Buffs & Time Slow-motion
    this.inventory = [];
    this.isInventoryOpen = false;
    this.buffSpeed = 0;
    this.buffJump = 0;
    this.buffInvis = 0;
    this.buffClone = 0;
    this.cloneGrid = null;
    this.cloneSprite = null;

    // Load active RPG cosmetic bonuses
    this.cosmeticBonuses = window.CosmeticsManager ? window.CosmeticsManager.getActiveBonuses() : {
      speedMult: 1, jumpPowerMult: 1, dashCooldownMult: 1, artifactDurationMult: 1, scoreMult: 1, springBoostMult: 1, stealth: 0, mudImmune: false, hazardImmune: false
    };

    // Developer mode (testing all cosmetics & artifacts)
    this.isDevMode = (data && data.devMode) || (window.isDevMode && this.levelIndex === 0) || false;

    // Touch controls input state & Analog Touch Joystick
    this.touchInput = { up: false, down: false, left: false, right: false };
    this.touchJoystick = { x: 0, y: 0, active: false };
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Developer mode pre-unlock and inventory stocking on Training level
    if (this.isDevMode && this.levelIndex === 0) {
      if (window.CosmeticsManager) {
        window.CosmeticsManager.unlockAll();
        this.inventory = window.CosmeticsManager.getAllArtifacts();
      }
    }

    // Background parallax hills and sky
    this.createBackground();

    // World Containers
    this.tileGroup = this.add.container(0, 0);
    this.sceneryGroup = this.add.container(0, 0);
    this.itemsGroup = this.add.container(0, 0);
    this.obstaclesGroup = this.add.container(0, 0);

    // Build Isometric World from level data
    this.buildIsometricWorld();

    // Create Characters
    this.createCharacters();
    this.applyCosmetics();

    // Particle emitter for running and dashing
    this.createParticleSystems();

    // Camera setup
    this.setupCamera();

    // Keyboard Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      j: Phaser.Input.Keyboard.KeyCodes.J,
      z: Phaser.Input.Keyboard.KeyCodes.Z,
      r: Phaser.Input.Keyboard.KeyCodes.R,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      zero: Phaser.Input.Keyboard.KeyCodes.ZERO,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
      four: Phaser.Input.Keyboard.KeyCodes.FOUR,
      five: Phaser.Input.Keyboard.KeyCodes.FIVE
    });

    // Listen to UI Scene Commands
    this.events.on('useArtifact', (idx) => this.activateArtifact(idx));
    this.events.on('throwDirt', () => this.dropMudPatch());
    this.events.on('refillArtifacts', () => this.refillDevArtifacts());
    this.events.on('cosmeticsChanged', () => this.applyCosmetics());
    this.events.on('inventoryToggled', (isOpen) => {
      this.isInventoryOpen = isOpen;
      this.time.timeScale = isOpen ? 0.2 : 1.0;
      this.tweens.timeScale = isOpen ? 0.2 : 1.0;
    });

    // Launch UI Scene with level & difficulty and devMode flag
    this.scene.launch('UIScene', { levelIndex: this.levelIndex, difficulty: this.difficulty, devMode: this.isDevMode });

    // Initial event dispatch
    this.events.emit('updateScore', this.score);
    this.events.emit('updateTime', this.timeLeft);
    this.events.emit('updateDash', true);
    this.events.emit('updateInventory', this.inventory);
    this.events.emit('updateBuffs', { speed: 0, jump: 0, invis: 0, clone: 0 });

    // Head Start / Training Banner
    let bannerStr = this.levelData.isTraining ? '🎓 TRAINING YARD 🎓\nPractice Movement, Jumping & Dashing!' : 'READY...';
    if (this.isDevMode && this.levelIndex === 0) {
      bannerStr = '🛠️ DEV TESTING YARD 🛠️\nAll Cosmetics & Artifacts Ready!\n[R] Gear/Cosmetics | [0] Restock Bag';
    }
    const bannerSize = (this.isDevMode && this.levelIndex === 0) ? '20px' : (this.levelData.isTraining ? '26px' : '44px');
    const bannerColor = (this.isDevMode && this.levelIndex === 0) ? '#00d2d3' : (this.levelData.isTraining ? '#2ecc71' : '#f1c40f');

    this.countdownText = this.add.text(w / 2, h * 0.35, bannerStr, {
      fontFamily: 'Impact, Arial Black',
      fontSize: bannerSize,
      color: bannerColor,
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      shadow: { offsetX: 2, offsetY: 3, color: '#000', blur: 4, fill: true }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

    // Scene shutdown cleanup to prevent memory leaks and particle frame null errors
    this.events.on('shutdown', () => {
      if (this.dustEmitter) {
        this.dustEmitter.destroy();
        this.dustEmitter = null;
      }
      if (this.cloneSprite) {
        this.cloneSprite.destroy();
        this.cloneSprite = null;
      }
      this.tweens.killAll();
      this.events.off('useArtifact');
      this.events.off('throwDirt');
      this.scene.stop('UIScene');
    });

    // Initial cute pig sound
    window.sounds?.playOink();
  }

  // Convert Grid (gx, gy, gz) to Isometric Screen Coordinates
  gridToIso(gx, gy, gz = 0) {
    const isoX = (gx - gy) * (this.tileWidth / 2);
    const isoY = (gx + gy) * (this.tileHeight / 2) - (gz * this.elevationStep);
    return { x: isoX, y: isoY };
  }

  createBackground() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const theme = this.levelData.theme || 'grass';

    // Distant sky backdrop customized by level theme
    const sky = this.add.graphics().setScrollFactor(0);
    if (theme === 'water_platforms') {
      sky.fillGradientStyle(0x0abde3, 0x0abde3, 0x48dbfb, 0xc7ecee, 1);
    } else if (theme === 'desert_labyrinth') {
      sky.fillGradientStyle(0xff9f43, 0xff9f43, 0xfeca57, 0xffeaa7, 1);
    } else if (theme === 'sky_islands') {
      sky.fillGradientStyle(0x341f97, 0x341f97, 0x54a0ff, 0xc8d6e5, 1);
    } else {
      sky.fillGradientStyle(0x74b9ff, 0x74b9ff, 0xa1c4fd, 0xc2e9fb, 1);
    }
    sky.fillRect(0, 0, Math.max(w, 2500), Math.max(h, 1500));

    // Parallax Mountain / Dune / Cloud Silhouettes
    this.bgHills = this.add.graphics().setScrollFactor(0.08);
    const hillColor = theme === 'desert_labyrinth' ? 0xd35400 : (theme === 'sky_islands' ? 0xffffff : 0x3d6f46);
    const hillAlpha = theme === 'sky_islands' ? 0.35 : 0.45;
    this.bgHills.fillStyle(hillColor, hillAlpha);
    this.bgHills.beginPath();
    this.bgHills.moveTo(-200, 260);
    for (let x = -200; x < 2500; x += 150) {
      const hillH = 180 + Math.sin(x * 0.005) * 45;
      this.bgHills.lineTo(x, hillH);
    }
    this.bgHills.lineTo(2500, 700);
    this.bgHills.lineTo(-200, 700);
    this.bgHills.closePath();
    this.bgHills.fillPath();

    // Silo and farm silhouettes in distance
    this.bgSilos = this.add.graphics().setScrollFactor(0.12);
    const siloCol = theme === 'desert_labyrinth' ? 0x9c5f27 : (theme === 'sky_islands' ? 0x5f27cd : 0x274e2d);
    this.bgSilos.fillStyle(siloCol, 0.45);
    [-50, 400, 900, 1500].forEach(bx => {
      this.bgSilos.fillRect(bx, 280, 50, 90);
      this.bgSilos.fillCircle(bx + 25, 280, 25);
      this.bgSilos.fillRect(bx + 60, 310, 80, 60);
    });
  }

  getTileAt(gx, gy) {
    const gw = this.levelData.gridWidth || 12;
    const gh = this.levelData.gridHeight || 24;
    const ix = Phaser.Math.Clamp(Math.round(gx), 0, gw - 1);
    const iy = Phaser.Math.Clamp(Math.round(gy), 0, gh - 1);
    if (this.tileGrid && this.tileGrid[iy] && this.tileGrid[iy][ix]) {
      return this.tileGrid[iy][ix];
    }
    return { x: ix, y: iy, tileKey: 'tile_grass', z: 0, isWater: false, isPlatform: false, isFloatingIsland: false, isVoid: false };
  }

  buildIsometricWorld() {
    const gw = this.levelData.gridWidth;
    const gh = this.levelData.gridHeight;
    const pathX = this.levelData.pathX || Math.floor(gw / 2);

    this.gridTiles = [];
    this.tileGrid = window.buildLevelTileGrid ? window.buildLevelTileGrid(this.levelData) : [];
    this.platformSprites = {};

    // Lay out isometric foundation (supporting water, jumping platforms, multi-height cubes & floating islands)
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const cell = (this.tileGrid[y] && this.tileGrid[y][x]) || {
          x, y, tileKey: Math.abs(x - pathX) <= 1 ? 'tile_dirt' : 'tile_grass',
          z: (x === 0 || x === gw - 1) ? 1 : 0,
          isWater: false, isPlatform: false, isFloatingIsland: false, isVoid: false
        };

        const baseIsoY = (x + y) * (this.tileHeight / 2);

        // 1. Open sky void (between floating islands)
        if (cell.isVoid) {
          continue;
        }

        // 2. If this is a jumping platform over water, render the water surface underneath first!
        if (cell.hasWaterUnderneath) {
          const waterIso = this.gridToIso(x, y, -0.35);
          const waterTile = this.add.image(waterIso.x, waterIso.y, 'tile_water');
          waterTile.setOrigin(0.5, 0.35);
          waterTile.setDepth(baseIsoY - 120);
          this.tileGroup.add(waterTile);
        }

        // 3. If solid ground cube has height z > 0 (and not a floating island or platform), stack support cubes underneath
        if (!cell.isPlatform && !cell.isFloatingIsland && !cell.isWater && cell.z > 0) {
          const stackKey = cell.stackBaseKey || 'tile_dirt';
          for (let sz = 0; sz < cell.z; sz++) {
            const sIso = this.gridToIso(x, y, sz);
            const sTile = this.add.image(sIso.x, sIso.y, stackKey);
            sTile.setOrigin(0.5, 0.35);
            sTile.setDepth(baseIsoY - 105 + sz * 2);
            this.tileGroup.add(sTile);
          }
        }

        // 4. Render top surface tile (ground, water, jumping platform, or floating island)
        if (cell.tileKey) {
          const iso = this.gridToIso(x, y, cell.z);
          const tile = this.add.image(iso.x, iso.y, cell.tileKey);
          tile.setOrigin(0.5, 0.35);
          const depthOffset = cell.isWater ? -115 : (-95 + cell.z * 2);
          tile.setDepth(baseIsoY + depthOffset);
          this.tileGroup.add(tile);

          if (cell.isPlatform) {
            this.platformSprites[`${x},${y}`] = tile;
          }
        }
      }
    }

    // Place Obstacles (Base + Procedural Labyrinth Cactuses + Dynamic Difficulty Obstacles)
    this.obstacles = [];
    const obsList = window.getLevelObstacles
      ? window.getLevelObstacles(this.levelData)
      : (this.levelData.obstacles || []).map(o => ({ ...o }));

    // Higher Difficulty = More barriers, traps, and hazards on standard levels!
    if (this.difficulty === 'hard' && !this.levelData.isTraining && (!this.levelData.layoutType || this.levelData.layoutType === 'standard')) {
      const gh = this.levelData.gridHeight || 24;
      const px = this.levelData.pathX !== undefined ? this.levelData.pathX : 5;
      
      const extraRows = [6, 10, 13, 17, 20];
      extraRows.forEach((ry, idx) => {
        if (ry < gh - 3 && ry > 3) {
          const type = (idx % 2 === 0) ? 'spikes' : 'thorn';
          const col = (idx % 3 === 0) ? px : (idx % 2 === 0 ? px - 1 : px + 1);
          if (!obsList.some(o => o.x === col && o.y === ry)) {
            obsList.push({ type: type, x: col, y: ry, z: 0 });
          }
        }
      });

      if (!obsList.some(o => o.y === 9)) {
        obsList.push({ type: 'mud', x: px, y: 9, z: 0 });
      }
      if (!obsList.some(o => o.y === 16 && Math.abs(o.x - px) <= 1)) {
        obsList.push({ type: 'mud', x: px - 1, y: 16, z: 0 });
      }
    }

    obsList.forEach(obs => {
      const oz = obs.z !== undefined ? obs.z : 0;
      const iso = this.gridToIso(obs.x, obs.y, oz);
      const baseIsoY = (obs.x + obs.y) * (this.tileHeight / 2);
      const sprite = this.add.image(iso.x, iso.y, obs.type);
      sprite.setOrigin(0.5, obs.type === 'cactus' ? 0.85 : 0.7);
      sprite.setDepth(baseIsoY + oz * 2);
      this.obstacles.push({
        type: obs.type,
        gridX: obs.x,
        gridY: obs.y,
        gridZ: oz,
        isWall: !!obs.isWall || obs.type === 'cactus',
        sprite: sprite,
        targetZ: obs.targetZ
      });
      this.obstaclesGroup.add(sprite);
    });

    // Place Collectibles
    this.items = [];
    (this.levelData.items || []).forEach(item => {
      const iz = item.z !== undefined ? item.z : 0;
      const iso = this.gridToIso(item.x, item.y, iz);
      const baseIsoY = (item.x + item.y) * (this.tileHeight / 2);
      const sprite = this.add.image(iso.x, iso.y - 10, item.type);
      sprite.setOrigin(0.5, 0.7);
      sprite.setDepth(baseIsoY + 6 + iz * 2);

      // Cute bobbing / floating animation for items
      this.tweens.add({
        targets: sprite,
        y: sprite.y - 6,
        duration: 900 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.items.push({
        type: item.type,
        gridX: item.x,
        gridY: item.y,
        gridZ: iz,
        sprite: sprite,
        collected: false
      });
      this.itemsGroup.add(sprite);
    });

    // Place Scenery (Barn Goal, Trees, Fences, Pumpkins)
    (this.levelData.scenery || []).forEach(sc => {
      const sz = sc.z !== undefined ? sc.z : 0;
      const iso = this.gridToIso(sc.x, sc.y, sz);
      const baseIsoY = (sc.x + sc.y) * (this.tileHeight / 2);
      const sprite = this.add.image(iso.x, iso.y, sc.type);
      if (sc.type === 'barn') {
        sprite.setOrigin(0.5, 0.85);
        sprite.setDepth(baseIsoY + 40 + sz * 2);
        this.barnSprite = sprite;
      } else {
        sprite.setOrigin(0.5, 0.85);
        sprite.setDepth(baseIsoY + sz * 2);
      }
      this.sceneryGroup.add(sprite);
    });

    // Place Tutorial Hints (for Training Mode)
    (this.levelData.tutorialHints || []).forEach(hint => {
      const iso = this.gridToIso(hint.x, hint.y, 0);
      const hintBox = this.add.container(iso.x, iso.y - 14);

      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.72);
      bg.fillRoundedRect(-110, -14, 220, 28, 8);
      bg.lineStyle(1.5, 0xf1c40f, 0.85);
      bg.strokeRoundedRect(-110, -14, 220, 28, 8);
      hintBox.add(bg);

      const txt = this.add.text(0, 0, hint.text, {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: '12px',
        color: '#ffffff'
      }).setOrigin(0.5);
      hintBox.add(txt);
      hintBox.setDepth(iso.y + 2);

      this.tweens.add({
        targets: hintBox,
        y: hintBox.y - 4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.sceneryGroup.add(hintBox);
    });

    // Goal position
    this.goalGrid = this.levelData.goal || { x: pathX, y: gh - 2, z: 0 };
  }

  createCharacters() {
    // 1. PIGGY (Hero)
    const pStart = this.levelData.piggyStart || { x: 5, y: 2, z: 0 };
    this.piggyGrid = { x: pStart.x, y: pStart.y, z: pStart.z || 0 };
    this.lastSafeGrid = { x: pStart.x, y: pStart.y, z: pStart.z || 0 };
    const pigIso = this.gridToIso(this.piggyGrid.x, this.piggyGrid.y, this.piggyGrid.z);

    this.piggy = this.add.sprite(pigIso.x, pigIso.y, 'piggy');
    this.piggy.setOrigin(0.5, 0.85);
    this.piggy.setDepth(pigIso.y + 10);

    // Easter egg: Tapping/clicking Piggy 5 times activates developer mode!
    this.piggy.setInteractive({ useHandCursor: true });
    let piggyTapCount = 0;
    let piggyTapTimer = null;
    this.piggy.on('pointerdown', () => {
      piggyTapCount++;
      clearTimeout(piggyTapTimer);
      piggyTapTimer = setTimeout(() => { piggyTapCount = 0; }, 2500);

      this.tweens.add({
        targets: this.piggy,
        scaleY: 0.8,
        scaleX: 1.15,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
      window.sounds?.playOink();

      if (piggyTapCount >= 5) {
        piggyTapCount = 0;
        window.activateDevMode();
      }
    });

    this.piggyBaseSpeed = 3.6; // grid units per second
    this.piggySpeed = this.piggyBaseSpeed;
    this.piggyFacing = 1; // 1 = right, -1 = left

    // 2. FARMER (Antagonist Chaser)
    const fStart = this.levelData.farmerStart || { x: 5, y: -1, z: 0 };
    this.farmerGrid = { x: fStart.x, y: fStart.y, z: fStart.z };
    const farmIso = this.gridToIso(this.farmerGrid.x, this.farmerGrid.y, this.farmerGrid.z);

    this.farmer = this.add.sprite(farmIso.x, farmIso.y, 'farmer');
    this.farmer.setOrigin(0.5, 0.85);
    this.farmer.setDepth(farmIso.y + 10);
    this.farmerFacing = 1;

    // In training mode, the farmer is snoozing peacefully!
    if (this.levelData.isTraining) {
      this.farmer.setAngle(-25);
      this.farmerZzz = this.add.text(farmIso.x, farmIso.y - 48, '💤 Zzz...', {
        fontFamily: 'Impact, Arial Black',
        fontSize: '15px',
        color: '#feca57',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(farmIso.y + 20);

      this.tweens.add({
        targets: this.farmerZzz,
        y: farmIso.y - 60,
        alpha: 0.35,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Pitchfork thrust effect indicator
    this.pitchforkGlow = this.add.graphics();
    this.pitchforkGlow.setDepth(farmIso.y + 12);
  }

  createParticleSystems() {
    this.dustEmitter = this.add.particles(0, 0, 'dust', {
      speed: { min: 20, max: 50 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.8, end: 0.1 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 350,
      emitting: false
    });
  }

  setupCamera() {
    const cam = this.cameras.main;
    cam.startFollow(this.piggy, true, 0.08, 0.08, 0, 30);

    const isMobileOrTablet = ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      (window.innerWidth <= 850);

    // On mobile / tablet, zoom in more (1.45) so Piggy, hazards, and items are clearly visible
    const defaultZoom = isMobileOrTablet ? 1.45 : 1.15;
    cam.setZoom(defaultZoom);

    const resizeHandler = (gameSize) => {
      const isMob = ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0) || 
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
        (gameSize.width <= 850);
      cam.setZoom(isMob ? 1.45 : 1.15);
    };
    this.scale.on('resize', resizeHandler);
    this.events.once('shutdown', () => {
      this.scale.off('resize', resizeHandler);
    });
  }

  applyCosmetics() {
    if (window.CosmeticsManager) {
      window.CosmeticsManager.generatePiggyTexture(this, 'piggy');
      this.cosmeticBonuses = window.CosmeticsManager.getActiveBonuses();
      if (this.piggy) {
        this.piggy.setTexture('piggy');
      }
    }
  }

  // Developer cheat option: Enables dev mode (unlocks all cosmetics & stocks all artifacts)
  enableDevMode() {
    this.isDevMode = true;
    if (window.CosmeticsManager) {
      window.CosmeticsManager.unlockAll();
      this.inventory = window.CosmeticsManager.getAllArtifacts();
      this.applyCosmetics();
    }
    this.events.emit('updateInventory', this.inventory);
    this.events.emit('devModeActivated');
    this.showFloatingText(this.piggy.x, this.piggy.y - 45, '🛠️ DEV MODE ACTIVATED! 🛠️', '#00d2d3');
    window.sounds?.playWin();
  }

  enableDevModeOnTraining() {
    this.enableDevMode();
  }

  // Developer cheat option: Instantly restocks all 5 artifacts into the inventory
  refillDevArtifacts() {
    if (window.CosmeticsManager) {
      this.inventory = window.CosmeticsManager.getAllArtifacts();
      this.events.emit('updateInventory', this.inventory);
      this.showFloatingText(this.piggy.x, this.piggy.y - 35, '🎒 ALL 5 ARTIFACTS RESTOCKED!', '#2ecc71');
      window.sounds?.playPowerup();
    }
  }

  requestJump() {
    if (this.isGameOver || this.isVictory) return;
    const curTile = this.getTileAt(this.piggyGrid.x, this.piggyGrid.y);
    // Allow jumping if on ground/platform OR wading in water
    if (this.isJumping && !(curTile.isWater && this.piggyZ < 0.35)) return;

    this.isJumping = true;
    const jMult = this.cosmeticBonuses?.jumpPowerMult || 1.0;
    let baseVZ = this.buffJump > 0 ? 10.8 : 7.5;

    if (curTile.isPlatform) {
      // Jumping platforms give a springy boost to clear wide water gaps and tall platforms!
      baseVZ *= 1.18;
      window.sounds?.playBounce();
      const pKey = `${curTile.x},${curTile.y}`;
      const pSprite = this.platformSprites && this.platformSprites[pKey];
      if (pSprite) {
        this.tweens.add({
          targets: pSprite,
          scaleY: 0.82,
          duration: 90,
          yoyo: true,
          ease: 'Quad.easeOut'
        });
      }
    } else if (curTile.isWater) {
      baseVZ = Math.max(baseVZ, 8.4);
      window.sounds?.playSplash();
    } else {
      window.sounds?.playJump();
    }

    this.piggyVZ = baseVZ * jMult;
    this.spawnDust(this.piggy.x, this.piggy.y, this.buffJump > 0 ? 8 : 5);
  }

  requestDash() {
    if (this.dashCooldown > 0 || this.isGameOver || this.isVictory) return;
    this.isDashing = true;
    this.dashDuration = 0.42; // Dash duration in seconds
    const cdMult = this.cosmeticBonuses?.dashCooldownMult || 1.0;
    this.dashCooldown = 2.2 * cdMult;  // Cooldown scaled by Superhero Cape etc.
    window.sounds?.playDash();
    this.spawnDust(this.piggy.x, this.piggy.y, 8);
    this.events.emit('updateDash', false);
  }

  spawnDust(x, y, count = 3) {
    if (!this.dustEmitter) return;
    for (let i = 0; i < count; i++) {
      this.dustEmitter.emitParticleAt(x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-4, 4));
    }
  }

  update(time, delta) {
    if (this.isGameOver || this.isVictory) return;
    
    // Slow-motion time dilation when inventory is open (gives player time to plan abilities)
    const timeScale = this.isInventoryOpen ? 0.18 : 1.0;
    const dt = (delta / 1000) * timeScale; // in seconds (slow-mo scaled)

    if (this.waterSplashCooldown > 0) this.waterSplashCooldown -= dt;
    if (this.cactusPrickCooldown > 0) this.cactusPrickCooldown -= dt;

    // Update Grace Period (Head Start)
    if (this.graceTime > 0) {
      this.graceTime -= dt;
      if (!this.levelData.isTraining) {
        if (this.graceTime > 1.2) {
          this.countdownText.setText('READY...');
          this.countdownText.setColor('#f1c40f');
        } else if (this.graceTime > 0) {
          this.countdownText.setText('RUN, PIGGY! 💨');
          this.countdownText.setColor('#2ecc71');
        } else {
          this.countdownText.setText('');
          window.sounds?.playFarmerAlert();
        }
      } else {
        if (this.graceTime <= 0) {
          this.tweens.add({
            targets: this.countdownText,
            alpha: 0,
            duration: 800
          });
        }
      }
    }

    // Update Timer
    this.timeLeft -= dt;
    this.events.emit('updateTime', this.timeLeft);
    if (this.timeLeft <= 0) {
      this.triggerGameOver('Time ran out! The farmer cornered Piggy!');
      return;
    }

    // Update Dash Cooldown
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
      if (this.dashCooldown <= 0) {
        this.events.emit('updateDash', true);
      }
    }
    if (this.isDashing) {
      this.dashDuration -= dt;
      if (this.dashDuration <= 0) {
        this.isDashing = false;
      }
    }

    // Update Buff Timers
    let buffsChanged = false;
    if (this.buffSpeed > 0) {
      this.buffSpeed -= dt;
      if (this.buffSpeed <= 0) this.buffSpeed = 0;
      buffsChanged = true;
    }
    if (this.buffJump > 0) {
      this.buffJump -= dt;
      if (this.buffJump <= 0) this.buffJump = 0;
      buffsChanged = true;
    }
    if (this.buffInvis > 0) {
      this.buffInvis -= dt;
      if (this.buffInvis <= 0) {
        this.buffInvis = 0;
        this.piggy.setAlpha(1.0);
      }
      buffsChanged = true;
    }
    if (this.buffClone > 0) {
      this.buffClone -= dt;
      this.updateClone(dt);
      if (this.buffClone <= 0) {
        this.buffClone = 0;
        this.removeClone();
      }
      buffsChanged = true;
    }
    if (buffsChanged) {
      this.events.emit('updateBuffs', {
        speed: this.buffSpeed,
        jump: this.buffJump,
        invis: this.buffInvis,
        clone: this.buffClone
      });
    }

    // Handle Piggy Input & Movement
    this.handlePiggyMovement(dt);

    // Handle Piggy Vertical Jump Physics (Z axis)
    this.handlePiggyJump(dt);

    // Handle Farmer AI Chase & Vertical Jump Physics
    this.handleFarmerAI(dt);
    this.handleFarmerJump(dt);

    // Update Depths for Proper 2.5D Isometric Sorting across multi-height cubes & platforms
    const pigTotalZ = (this.piggyGrid.z || 0) + (this.piggyZ || 0);
    const pigBaseIsoY = (this.piggyGrid.x + this.piggyGrid.y) * (this.tileHeight / 2);
    this.piggy.setDepth(pigBaseIsoY + 12 + pigTotalZ * 2);

    const farmTotalZ = (this.farmerGrid.z || 0) + (this.farmerZ || 0);
    const farmBaseIsoY = (this.farmerGrid.x + this.farmerGrid.y) * (this.tileHeight / 2);
    this.farmer.setDepth(farmBaseIsoY + 12 + farmTotalZ * 2);

    // Check Collisions (Items, Obstacles, Goal)
    this.checkInteractions();

    // Check Distance & Tension for HUD
    const distFarmer = Phaser.Math.Distance.Between(this.piggyGrid.x, this.piggyGrid.y, this.farmerGrid.x, this.farmerGrid.y);
    const distGoal = Phaser.Math.Distance.Between(this.piggyGrid.x, this.piggyGrid.y, this.goalGrid.x, this.goalGrid.y);
    this.events.emit('updateDistance', distFarmer, distGoal);
  }

  canPiggyEnter(tx, ty, totalZ) {
    const gw = this.levelData.gridWidth || 12;
    const gh = this.levelData.gridHeight || 24;
    if (tx < 0.45 || tx > gw - 1.45 || ty < 0 || ty > gh - 0.85) {
      return false;
    }

    // Check solid cactus labyrinth walls (unless vaulting high over them)
    for (const obs of this.obstacles) {
      if (obs.type === 'cactus') {
        const d = Math.hypot(tx - obs.gridX, ty - obs.gridY);
        if (d < 0.56 && totalZ < (obs.gridZ || 0) + 1.15) {
          if (this.cactusPrickCooldown <= 0) {
            this.cactusPrickCooldown = 0.75;
            if (!this.cosmeticBonuses?.hazardImmune) {
              window.sounds?.playHurt();
              this.cameras.main.shake(100, 0.008);
            }
            this.showFloatingText(this.piggy.x, this.piggy.y - 38, '🌵 PRICKLY CACTUS!', '#2ecc71');
          }
          return false;
        }
      }
    }

    // Check 3D terrain step height: if target ground cube or platform is higher than Piggy's feet + step ledge tolerance
    const targetTile = this.getTileAt(tx, ty);
    const targetSurfaceZ = targetTile.isVoid ? -10 : (targetTile.isWater ? -0.35 : targetTile.z);
    if (targetSurfaceZ > totalZ + 0.55) {
      return false;
    }

    return true;
  }

  handlePiggyMovement(dt) {
    let dx = 0;
    let dy = 0;

    // Analog Touch Joystick Input (Mobile/Tablet dragging dot)
    if (this.touchJoystick && this.touchJoystick.active) {
      dx += this.touchJoystick.x;
      dy += this.touchJoystick.y;
    }

    // Keyboard Inputs (WASD & Arrows)
    const k = this.keys;
    const c = this.cursors;

    if (k.w.isDown || c.up.isDown || this.touchInput.up) dy -= 1;
    if (k.s.isDown || c.down.isDown || this.touchInput.down) dy += 1;
    if (k.a.isDown || c.left.isDown || this.touchInput.left) dx -= 1;
    if (k.d.isDown || c.right.isDown || this.touchInput.right) dx += 1;

    if (Phaser.Input.Keyboard.JustDown(k.space) || Phaser.Input.Keyboard.JustDown(c.space)) {
      this.requestJump();
    }
    if (Phaser.Input.Keyboard.JustDown(k.shift) || Phaser.Input.Keyboard.JustDown(k.e) || Phaser.Input.Keyboard.JustDown(k.j) || Phaser.Input.Keyboard.JustDown(k.z)) {
      this.requestDash();
    }

    // Inventory Toggle with 'R'
    if (Phaser.Input.Keyboard.JustDown(k.r)) {
      const ui = this.scene.get('UIScene');
      if (ui) ui.toggleInventory();
    }

    // Quick Mud Throw with 'Q'
    if (Phaser.Input.Keyboard.JustDown(k.q)) {
      this.dropMudPatch();
    }

    // Number keys 1-5 for quick artifact activation
    if (Phaser.Input.Keyboard.JustDown(k.one)) this.activateArtifact(0);
    if (Phaser.Input.Keyboard.JustDown(k.two)) this.activateArtifact(1);
    if (Phaser.Input.Keyboard.JustDown(k.three)) this.activateArtifact(2);
    if (Phaser.Input.Keyboard.JustDown(k.four)) this.activateArtifact(3);
    if (Phaser.Input.Keyboard.JustDown(k.five)) this.activateArtifact(4);

    // Developer hotkey '0' to instantly restock all 5 artifacts
    if (this.isDevMode && Phaser.Input.Keyboard.JustDown(k.zero)) {
      this.refillDevArtifacts();
    }

    const curTileBefore = this.getTileAt(this.piggyGrid.x, this.piggyGrid.y);
    const totalZ = (this.piggyGrid.z || 0) + (this.piggyZ || 0);

    // Calculate movement vector
    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal speed
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      // Base speed calculation
      const speedMult = this.cosmeticBonuses?.speedMult || 1.0;
      let currentSpeed = this.piggyBaseSpeed * speedMult;
      if (this.isDashing) currentSpeed *= 1.85;
      if (this.buffSpeed > 0) currentSpeed *= 1.95; // Golden Pepper Speed Boost!

      // Apply Mud Slowdown (if not jumping and not wearing Mud Camo Overalls)
      if (!this.isJumping && this.isPiggyOnMud()) {
        if (!this.cosmeticBonuses?.mudImmune) {
          currentSpeed *= 0.42;
        }
      }

      // Apply Water Wading Slowdown when in water between platforms
      if (curTileBefore.isWater && this.piggyZ < 0.25) {
        currentSpeed *= 0.42;
      }

      // Screen-Relative Isometric Movement
      const scale = 0.55;
      const gridDeltaX = (dx + 2 * dy) * currentSpeed * scale * dt;
      const gridDeltaY = (2 * dy - dx) * currentSpeed * scale * dt;

      const oldX = this.piggyGrid.x;
      const oldY = this.piggyGrid.y;
      const nextX = oldX + gridDeltaX;
      const nextY = oldY + gridDeltaY;

      // 3D Step & Labyrinth Wall Collision with smooth axis sliding
      if (this.canPiggyEnter(nextX, nextY, totalZ)) {
        this.piggyGrid.x = nextX;
        this.piggyGrid.y = nextY;
      } else if (this.canPiggyEnter(nextX, oldY, totalZ)) {
        this.piggyGrid.x = nextX;
      } else if (this.canPiggyEnter(oldX, nextY, totalZ)) {
        this.piggyGrid.y = nextY;
      }

      // Clamp within map bounds
      this.piggyGrid.x = Phaser.Math.Clamp(this.piggyGrid.x, 0.5, this.levelData.gridWidth - 1.5);
      this.piggyGrid.y = Phaser.Math.Clamp(this.piggyGrid.y, 0, this.levelData.gridHeight - 1);

      // Resolve new ground elevation beneath Piggy
      const newTile = this.getTileAt(this.piggyGrid.x, this.piggyGrid.y);
      const newGroundZ = newTile.isVoid ? -10 : (newTile.isWater ? -0.35 : newTile.z);

      if (totalZ > newGroundZ + 0.04) {
        // Airborne above the new tile (either mid-jump or walked off a higher cube/platform)
        this.piggyGrid.z = newGroundZ;
        this.piggyZ = totalZ - newGroundZ;
        this.isJumping = true;
      } else {
        // Stepped onto the new tile surface
        this.piggyGrid.z = newGroundZ;
        this.piggyZ = 0;
        if (!newTile.isWater && !newTile.isVoid) {
          this.lastSafeGrid = { x: this.piggyGrid.x, y: this.piggyGrid.y, z: newGroundZ };
        }
      }

      // Facing based on screen direction
      if (dx > 0) this.piggy.setFlipX(false);
      else if (dx < 0) this.piggy.setFlipX(true);

      // Running trot / bounce animation
      const trot = Math.sin(Date.now() * 0.018) * 3;
      this.piggy.y = this.gridToIso(this.piggyGrid.x, this.piggyGrid.y, this.piggyGrid.z).y + trot - (this.piggyZ * this.elevationStep);

      // Emit running dust (or flame dust if speed buffed)
      if (Math.random() < 0.28) {
        this.spawnDust(this.piggy.x, this.piggy.y + 4, this.buffSpeed > 0 ? 3 : 1);
      }
    } else {
      // Idle breathing
      const idle = Math.sin(Date.now() * 0.005) * 1.5;
      this.piggy.y = this.gridToIso(this.piggyGrid.x, this.piggyGrid.y, this.piggyGrid.z).y + idle - (this.piggyZ * this.elevationStep);
    }

    // Sync X position to isometric projection
    this.piggy.x = this.gridToIso(this.piggyGrid.x, this.piggyGrid.y, this.piggyGrid.z).x;
  }

  handlePiggyJump(dt) {
    if (!this.isJumping) return;

    // Apply gravity
    this.piggyZ += this.piggyVZ * dt;
    this.piggyVZ -= 16.0 * dt; // gravity

    const curTile = this.getTileAt(this.piggyGrid.x, this.piggyGrid.y);
    const totalZ = (this.piggyGrid.z || 0) + this.piggyZ;

    // Check if Piggy fell into the open sky chasm around Floating Islands
    if (curTile.isVoid && totalZ < -0.5) {
      window.sounds?.playHurt();
      this.cameras.main.shake(180, 0.014);
      const safe = this.lastSafeGrid || this.levelData.piggyStart || { x: 7, y: 2, z: 0 };
      this.piggyGrid.x = safe.x;
      this.piggyGrid.y = safe.y;
      this.piggyGrid.z = safe.z || 0;
      this.piggyZ = 0.6;
      this.piggyVZ = 2.5;
      this.isJumping = true;
      const iso = this.gridToIso(this.piggyGrid.x, this.piggyGrid.y, this.piggyGrid.z + this.piggyZ);
      this.piggy.x = iso.x;
      this.piggy.y = iso.y;
      this.showFloatingText(iso.x, iso.y - 40, '☁️ RESCUED FROM SKY CHASM!', '#48dbfb');
      return;
    }

    if (this.piggyZ <= 0) {
      this.piggyZ = 0;
      this.piggyVZ = 0;
      this.isJumping = false;

      if (curTile.isWater) {
        if (this.waterSplashCooldown <= 0) {
          this.waterSplashCooldown = 1.2;
          window.sounds?.playSplash();
          this.showFloatingText(this.piggy.x, this.piggy.y - 34, '💧 SPLASH! JUMP TO PLATFORM!', '#48dbfb');
        }
        this.spawnDust(this.piggy.x, this.piggy.y, 5);
      } else {
        this.lastSafeGrid = { x: this.piggyGrid.x, y: this.piggyGrid.y, z: curTile.z || 0 };
        this.spawnDust(this.piggy.x, this.piggy.y, 4);

        if (curTile.isPlatform) {
          const pKey = `${curTile.x},${curTile.y}`;
          const pSprite = this.platformSprites && this.platformSprites[pKey];
          if (pSprite) {
            this.tweens.add({
              targets: pSprite,
              scaleY: 0.88,
              duration: 80,
              yoyo: true,
              ease: 'Quad.easeOut'
            });
          }
        }
      }
    }
  }

  handleFarmerJump(dt) {
    if (this.isFarmerJumping) {
      this.farmerZ += this.farmerVZ * dt;
      this.farmerVZ -= 16.0 * dt; // gravity

      if (this.farmerZ <= 0) {
        this.farmerZ = 0;
        this.farmerVZ = 0;
        this.isFarmerJumping = false;
        this.spawnDust(this.farmer.x, this.farmer.y, 4);
      }
    }
    if (this.farmerJumpCooldown > 0) {
      this.farmerJumpCooldown -= dt;
    }
  }

  // Lightweight BFS grid pathfinder so Farmer navigates Cactus Labyrinth corridors intelligently
  getNextLabyrinthStep(fromX, fromY, toX, toY) {
    const gw = this.levelData.gridWidth || 15;
    const gh = this.levelData.gridHeight || 30;
    const sx = Phaser.Math.Clamp(Math.round(fromX), 1, gw - 2);
    const sy = Phaser.Math.Clamp(Math.round(fromY), 0, gh - 1);
    const tx = Phaser.Math.Clamp(Math.round(toX), 1, gw - 2);
    const ty = Phaser.Math.Clamp(Math.round(toY), 0, gh - 1);

    if (sx === tx && sy === ty) return { x: toX, y: toY };

    const blocked = new Set();
    for (const obs of this.obstacles) {
      if (obs.type === 'cactus') {
        blocked.add(`${Math.round(obs.gridX)},${Math.round(obs.gridY)}`);
      }
    }

    const queue = [{ x: sx, y: sy, firstStep: null }];
    const visited = new Set([`${sx},${sy}`]);
    const dirs = [
      [0, 1], [1, 0], [-1, 0], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];

    let closestStep = null;
    let closestDist = Infinity;

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.x === tx && cur.y === ty) {
        return cur.firstStep || { x: toX, y: toY };
      }

      const dToTarget = Math.hypot(cur.x - tx, cur.y - ty);
      if (cur.firstStep && dToTarget < closestDist) {
        closestDist = dToTarget;
        closestStep = cur.firstStep;
      }

      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const key = `${nx},${ny}`;
        if (nx >= 1 && nx <= gw - 2 && ny >= 0 && ny < gh && !visited.has(key) && !blocked.has(key)) {
          // Prevent diagonal corner-cutting through two adjacent cactus walls
          if (dx !== 0 && dy !== 0) {
            if (blocked.has(`${cur.x + dx},${cur.y}`) || blocked.has(`${cur.x},${cur.y + dy}`)) {
              continue;
            }
          }
          visited.add(key);
          queue.push({
            x: nx,
            y: ny,
            firstStep: cur.firstStep || { x: nx, y: ny }
          });
        }
      }
    }

    return closestStep || { x: toX, y: toY };
  }

  handleFarmerAI(dt) {
    // In training mode, the farmer is asleep
    if (this.levelData.isTraining) {
      this.farmer.setAngle(-25 + Math.sin(Date.now() * 0.003) * 3);
      return;
    }

    // If farmer is stunned from spikes, cactus, or clone trick
    if (this.farmerStunTimer > 0) {
      this.farmerStunTimer -= dt;
      this.farmer.setAngle(-12 + Math.sin(Date.now() * 0.035) * 20);
      if (this.farmerStunTimer <= 0) {
        this.farmerStunTimer = 0;
        this.farmer.clearTint();
        this.farmer.setAngle(0);
      }
      return;
    }

    // If during head start grace period, farmer stays put and fumes!
    if (this.graceTime > 0) {
      this.farmer.setAngle(Math.sin(Date.now() * 0.035) * 10);
      return;
    }
    this.farmer.setAngle(0);

    const isAirborne = this.isFarmerJumping && this.farmerZ > 0.35;

    // Hazard Injury Check: Did the farmer hit spikes or thorns?
    if (!isAirborne) {
      for (const obs of this.obstacles) {
        if (obs.type === 'spikes' || obs.type === 'thorn') {
          const d = Math.hypot(this.farmerGrid.x - obs.gridX, this.farmerGrid.y - obs.gridY);
          if (d < 0.65) {
            this.injureFarmer(obs.type === 'spikes' ? 'SPIKES' : 'THORNS');
            return;
          }
        }
      }
    }

    // Target Selection: Decoy Clone vs Real Piggy
    let goalTargetX = this.piggyGrid.x;
    let goalTargetY = this.piggyGrid.y;
    let isTargetingClone = false;

    if (this.buffClone > 0 && this.cloneGrid) {
      goalTargetX = this.cloneGrid.x;
      goalTargetY = this.cloneGrid.y;
      isTargetingClone = true;
    } else if (this.buffInvis > 0) {
      // Invisibility Active: Farmer cannot see Piggy!
      const wander = Math.sin(Date.now() * 0.003) * 0.6;
      this.farmerGrid.x += wander * 0.4 * dt;
      this.farmer.setAngle(wander * 8);
      if (Math.random() < 0.02) {
        this.showFloatingText(this.farmer.x, this.farmer.y - 45, '❓ WHERE IS PIGGY?!', '#a29bfe');
      }
      return;
    }

    let steerX = goalTargetX;
    let steerY = goalTargetY;

    // In Cactus Labyrinth, navigate around cactus maze walls using BFS waypoint steering
    if (this.levelData.layoutType === 'cactus_labyrinth' && this.farmerGrid.y >= 2) {
      this.farmerPathTimer -= dt;
      if (this.farmerPathTimer <= 0 || !this.farmerNextWaypoint) {
        this.farmerPathTimer = 0.22;
        this.farmerNextWaypoint = this.getNextLabyrinthStep(this.farmerGrid.x, this.farmerGrid.y, goalTargetX, goalTargetY);
      }
      if (this.farmerNextWaypoint) {
        steerX = this.farmerNextWaypoint.x;
        steerY = this.farmerNextWaypoint.y;
      }
    }

    // Distance to immediate steering point vs actual target
    const sdx = steerX - this.farmerGrid.x;
    const sdy = steerY - this.farmerGrid.y;
    const steerDist = Math.hypot(sdx, sdy);

    const dx = goalTargetX - this.farmerGrid.x;
    const dy = goalTargetY - this.farmerGrid.y;
    const dist = Math.hypot(dx, dy);

    // ========================================================
    // Farmer Leaps across Water Gaps, Sky Chasms, Elevation Steps & Hard Mode Obstacles
    // ========================================================
    const curFarmerTile = this.getTileAt(this.farmerGrid.x, this.farmerGrid.y);
    if (!this.isFarmerJumping && this.farmerJumpCooldown <= 0 && steerDist > 0.25) {
      const moveDirX = sdx / steerDist;
      const moveDirY = sdy / steerDist;
      const lookAheadTile = this.getTileAt(this.farmerGrid.x + moveDirX * 1.1, this.farmerGrid.y + moveDirY * 1.1);

      let shouldJump = false;
      let jumpLabel = null;

      // Jump across water, sky void, or up onto higher platforms/cubes
      if (lookAheadTile.isWater || lookAheadTile.isVoid || lookAheadTile.z > (this.farmerGrid.z || 0) + 0.3) {
        shouldJump = true;
      }

      if (!shouldJump && this.difficulty === 'hard') {
        for (const obs of this.obstacles) {
          if (obs.type === 'spikes' || obs.type === 'thorn' || obs.type === 'mud' || obs.type === 'hay_spring') {
            const toObsX = obs.gridX - this.farmerGrid.x;
            const toObsY = obs.gridY - this.farmerGrid.y;
            const obsDist = Math.hypot(toObsX, toObsY);
            const dot = toObsX * moveDirX + toObsY * moveDirY;
            if (obsDist < 1.45 && dot > 0.35) {
              shouldJump = true;
              jumpLabel = '🦘 VAULT!';
              break;
            }
          }
        }
      }

      if (shouldJump) {
        this.isFarmerJumping = true;
        this.farmerVZ = 7.8;
        this.farmerJumpCooldown = 1.15;
        window.sounds?.playJump();
        this.spawnDust(this.farmer.x, this.farmer.y, 5);
        if (jumpLabel) {
          this.showFloatingText(this.farmer.x, this.farmer.y - 42, jumpLabel, '#ff4757');
        }
      }
    }

    // Speed calculation
    let speed = (this.farmerSpeed / 30); // scale to grid units/sec

    // Mud or Water slowdown for Farmer (if not airborne)
    if (!isAirborne && (this.isEntityOnMud(this.farmerGrid.x, this.farmerGrid.y) || curFarmerTile.isWater)) {
      speed *= 0.48;
    }

    // Farmer tracks target
    if (steerDist > 0.15) {
      const dirX = sdx / steerDist;
      const dirY = sdy / steerDist;

      this.farmerGrid.x += dirX * speed * dt;
      this.farmerGrid.y += dirY * speed * dt;

      // Update Farmer base elevation smoothly to match terrain
      const fTile = this.getTileAt(this.farmerGrid.x, this.farmerGrid.y);
      const targetGroundZ = fTile.isVoid ? Math.max(0, this.farmerGrid.z || 0) : (fTile.isWater ? -0.35 : fTile.z);
      this.farmerGrid.z = Phaser.Math.Linear(this.farmerGrid.z || 0, targetGroundZ, Math.min(1, dt * 8));

      // Facing
      if (dirX > 0) {
        this.farmer.setFlipX(false);
        this.farmerFacing = 1;
      } else if (dirX < 0) {
        this.farmer.setFlipX(true);
        this.farmerFacing = -1;
      }

      // Footstep walk bob vs jump elevation
      const bob = isAirborne ? 0 : Math.sin(Date.now() * 0.015) * 3;
      const fIso = this.gridToIso(this.farmerGrid.x, this.farmerGrid.y, this.farmerGrid.z || 0);
      this.farmer.x = fIso.x;
      this.farmer.y = fIso.y + bob - (this.farmerZ * this.elevationStep);

      // Pitchfork thrust effect follows farmer
      if (this.pitchforkGlow) {
        this.pitchforkGlow.setDepth(this.farmer.depth + 2);
      }

      if (isAirborne) {
        this.farmer.setAngle((this.farmerFacing || 1) * 14);
      }
    }

    // Clone catch check
    if (isTargetingClone && dist < 0.65) {
      this.removeClone();
      this.injureFarmer('CLONE FOOLED');
      return;
    }

    // Pitchfork Warning Lunge vs Catch (Only if real Piggy and not invisible)
    if (!isTargetingClone && this.buffInvis <= 0) {
      const pigTotalZ = (this.piggyGrid.z || 0) + (this.piggyZ || 0);
      const farmTotalZ = (this.farmerGrid.z || 0) + (this.farmerZ || 0);
      const zDiff = Math.abs(farmTotalZ - pigTotalZ);
      if (dist < 0.55 && zDiff < 1.1) {
        this.triggerGameOver('The farmer caught Piggy with his pitchfork!');
      } else if (dist < 1.2 && !isAirborne) {
        this.farmer.setAngle(this.farmer.flipX ? -15 : 15);
        if (Math.random() < 0.04) {
          window.sounds?.playFarmerAlert();
        }
      } else if (!isAirborne) {
        this.farmer.setAngle(0);
      }
    }
  }

  isPiggyOnMud() {
    return this.isEntityOnMud(this.piggyGrid.x, this.piggyGrid.y);
  }

  isEntityOnMud(gx, gy) {
    for (const obs of this.obstacles) {
      if (obs.type === 'mud') {
        const d = Math.hypot(gx - obs.gridX, gy - obs.gridY);
        if (d < 0.8) return true;
      }
    }
    return false;
  }

  checkInteractions() {
    const pigTotalZ = (this.piggyGrid.z || 0) + (this.piggyZ || 0);

    // 1. Collectibles & Artifacts Check (including elevated platforms & floating islands)
    for (const item of this.items) {
      if (!item.collected) {
        const d = Math.hypot(this.piggyGrid.x - item.gridX, this.piggyGrid.y - item.gridY);
        const zDiff = Math.abs(pigTotalZ - (item.gridZ || 0));
        if (d < 0.9 && zDiff < 1.4) {
          if (item.type.startsWith('artifact_')) {
            item.collected = true;
            window.sounds?.playPowerup();

            let artData = null;
            if (item.type === 'artifact_speed') {
              artData = { id: 'speed', name: 'Speed Pepper', icon: '🌶️', desc: 'Blazing 2x Speed for 6s', duration: 6, key: 'artifact_speed' };
            } else if (item.type === 'artifact_jump') {
              artData = { id: 'jump', name: 'Winged Feather', icon: '🪽', desc: 'Super High Jump for 7s', duration: 7, key: 'artifact_jump' };
            } else if (item.type === 'artifact_invis') {
              artData = { id: 'invis', name: 'Smoke Cloak', icon: '👻', desc: 'Invisible to Farmer for 5s', duration: 5, key: 'artifact_invis' };
            } else if (item.type === 'artifact_clone') {
              artData = { id: 'clone', name: 'Mirage Decoy', icon: '🐷', desc: 'Lures Farmer away for 6s', duration: 6, key: 'artifact_clone' };
            } else if (item.type === 'artifact_dirt') {
              artData = { id: 'dirt', name: 'Mud Bomb', icon: '🥔', desc: 'Throw Mud to Slow Farmer (Press Q)', duration: 0, key: 'artifact_dirt' };
            }

            if (artData) {
              this.inventory.push(artData);
              this.events.emit('updateInventory', this.inventory);
              this.showFloatingText(this.piggy.x, this.piggy.y - 40, `+ ${artData.icon} ${artData.name}! [R]`, '#feca57');
            }

            this.tweens.add({
              targets: item.sprite,
              y: item.sprite.y - 35,
              alpha: 0,
              scale: 1.5,
              duration: 350,
              onComplete: () => item.sprite.destroy()
            });
          } else {
            item.collected = true;
            window.sounds?.playCollect();

            // Points based on apple type (scaled by Golden Crown bonus)
            let pts = 50;
            if (item.type === 'apple_gold') pts = 150;
            else if (item.type === 'apple_green') pts = 75;
            else if (item.type === 'acorn') pts = 25;

            const scoreMult = this.cosmeticBonuses?.scoreMult || 1.0;
            pts = Math.round(pts * scoreMult);

            this.score += pts;
            this.events.emit('updateScore', this.score);

            // Pop tween and remove sprite
            this.tweens.add({
              targets: item.sprite,
              y: item.sprite.y - 30,
              alpha: 0,
              scale: 1.4,
              duration: 350,
              onComplete: () => item.sprite.destroy()
            });
          }
        }
      }
    }

    // 2. Obstacles Check (Spikes & Hay Spring & Thorns)
    for (const obs of this.obstacles) {
      const d = Math.hypot(this.piggyGrid.x - obs.gridX, this.piggyGrid.y - obs.gridY);
      const zDiff = Math.abs(pigTotalZ - (obs.gridZ || 0));
      if (d < 0.72 && zDiff < 0.9) {
        if (obs.type === 'hay_spring' && this.piggyVZ <= 0.5) {
          // Launch Piggy high! (boosted by Spring Cleats)
          window.sounds?.playBounce();
          this.isJumping = true;
          const sMult = this.cosmeticBonuses?.springBoostMult || 1.0;
          this.piggyVZ = 9.2 * sMult; // mega jump
          this.spawnDust(this.piggy.x, this.piggy.y, 8);
          // Spring squash and stretch tween
          this.tweens.add({
            targets: obs.sprite,
            scaleY: 0.6,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
          });
        } else if (obs.type === 'spikes' && !this.isJumping) {
          // Spikes trip Piggy! (deflected if wearing Knight Plate Armor)
          if (!this.cosmeticBonuses?.hazardImmune) {
            window.sounds?.playHurt();
            this.piggyGrid.y -= 0.35; // knock back
            this.cameras.main.shake(180, 0.015);
          }
        } else if (obs.type === 'thorn' && !this.isJumping) {
          // Thorn bush scratches Piggy
          if (!this.cosmeticBonuses?.hazardImmune) {
            window.sounds?.playHurt();
            this.piggyGrid.x += (this.piggyGrid.x > obs.gridX ? 0.3 : -0.3);
          }
        }
      }
    }

    // 3. Goal Reached Check (The Red Barn)
    const goalDist = Math.hypot(this.piggyGrid.x - this.goalGrid.x, this.piggyGrid.y - this.goalGrid.y);
    if (goalDist < 1.35) {
      this.triggerVictory();
    }
  }

  triggerGameOver(reason) {
    if (this.isGameOver || this.isVictory) return;
    this.isGameOver = true;
    this.cameras.main.shake(300, 0.02);

    // Piggy tumble animation
    this.tweens.add({
      targets: this.piggy,
      angle: 90,
      scaleX: 0.8,
      duration: 350
    });

    this.time.delayedCall(500, () => {
      this.events.emit('gameOver', reason);
    });
  }

  triggerVictory() {
    if (this.isVictory || this.isGameOver) return;
    this.isVictory = true;

    // Unlock any cosmetic rewards for completing this level
    const newUnlocks = window.CosmeticsManager ? window.CosmeticsManager.unlockLevelRewards(this.levelIndex) : [];

    // Victory celebration hop into the barn
    this.tweens.add({
      targets: this.piggy,
      y: this.barnSprite.y - 10,
      scale: 0.2,
      alpha: 0,
      duration: 700,
      ease: 'Quad.easeIn'
    });

    this.time.delayedCall(600, () => {
      this.events.emit('levelWon', {
        levelIndex: this.levelIndex,
        timeLeft: this.timeLeft,
        newUnlocks: newUnlocks
      });
    });
  }

  activateArtifact(index) {
    if (index < 0 || index >= this.inventory.length) return;
    const art = this.inventory[index];
    this.inventory.splice(index, 1);
    this.events.emit('updateInventory', this.inventory);

    window.sounds?.playPowerup();

    // Duration scaled by Wizard Hat etc.
    const durMult = this.cosmeticBonuses?.artifactDurationMult || 1.0;

    if (art.id === 'speed') {
      this.buffSpeed = 6.0 * durMult;
      this.showFloatingText(this.piggy.x, this.piggy.y - 35, '⚡ SPEED BOOST! ⚡', '#f39c12');
    } else if (art.id === 'jump') {
      this.buffJump = 7.0 * durMult;
      this.showFloatingText(this.piggy.x, this.piggy.y - 35, '🪽 SUPER JUMP READY! 🪽', '#00d2d3');
    } else if (art.id === 'invis') {
      this.buffInvis = 5.0 * durMult;
      this.piggy.setAlpha(0.35);
      window.sounds?.playInvis();
      this.showFloatingText(this.piggy.x, this.piggy.y - 35, '👻 INVISIBLE! 👻', '#a29bfe');
    } else if (art.id === 'clone') {
      this.spawnMirageClone();
      this.showFloatingText(this.piggy.x, this.piggy.y - 35, '🐷 DECOY CLONE SPAWNED! 🐷', '#ff9ff3');
    } else if (art.id === 'dirt') {
      this.dropMudPatch();
    }
  }

  dropMudPatch() {
    // Check if player has dirt in inventory
    const dirtIdx = this.inventory.findIndex(i => i.id === 'dirt');
    if (dirtIdx >= 0) {
      this.inventory.splice(dirtIdx, 1);
      this.events.emit('updateInventory', this.inventory);
    }
    const gx = Math.round(this.piggyGrid.x);
    const gy = Math.round(this.piggyGrid.y);
    const gz = Math.max(0, this.piggyGrid.z || 0);
    const iso = this.gridToIso(gx, gy, gz);
    const baseIsoY = (gx + gy) * (this.tileHeight / 2);

    const mudSprite = this.add.image(iso.x, iso.y, 'mud');
    mudSprite.setOrigin(0.5, 0.7);
    mudSprite.setDepth(baseIsoY + gz * 2 - 1);
    this.obstaclesGroup.add(mudSprite);

    this.obstacles.push({
      type: 'mud',
      gridX: gx,
      gridY: gy,
      gridZ: gz,
      sprite: mudSprite
    });

    window.sounds?.playDirtSplat();
    this.showFloatingText(iso.x, iso.y - 20, '🥔 MUD DROPPED!', '#835e3c');
  }

  spawnMirageClone() {
    this.buffClone = 6.0;
    this.cloneGrid = { x: this.piggyGrid.x, y: this.piggyGrid.y };
    // Run diagonally away
    this.cloneDir = { x: (Math.random() > 0.5 ? 1.6 : -1.6), y: -1.8 };
    const iso = this.gridToIso(this.cloneGrid.x, this.cloneGrid.y, 0);
    this.cloneSprite = this.add.sprite(iso.x, iso.y, 'piggy_clone');
    this.cloneSprite.setOrigin(0.5, 0.85);
    this.cloneSprite.setDepth(iso.y + 10);
  }

  updateClone(dt) {
    if (!this.cloneSprite || !this.cloneGrid) return;
    this.cloneGrid.x += this.cloneDir.x * dt;
    this.cloneGrid.y += this.cloneDir.y * dt;
    this.cloneGrid.x = Phaser.Math.Clamp(this.cloneGrid.x, 1, this.levelData.gridWidth - 2);
    this.cloneGrid.y = Phaser.Math.Clamp(this.cloneGrid.y, 0, this.levelData.gridHeight - 1);
    const iso = this.gridToIso(this.cloneGrid.x, this.cloneGrid.y, 0);
    this.cloneSprite.x = iso.x;
    this.cloneSprite.y = iso.y;
    this.cloneSprite.setDepth(iso.y + 10);
    this.spawnDust(iso.x, iso.y, 1);
  }

  removeClone() {
    if (this.cloneSprite) {
      this.spawnDust(this.cloneSprite.x, this.cloneSprite.y, 8);
      this.cloneSprite.destroy();
      this.cloneSprite = null;
      this.cloneGrid = null;
    }
  }

  injureFarmer(cause) {
    const stunDur = this.difficulty === 'easy' ? 3.5 : (this.difficulty === 'hard' ? 1.5 : 2.4);
    this.farmerStunTimer = stunDur;
    window.sounds?.playFarmerStun();
    this.farmer.setTint(0xff3838);
    // Knock back along Y away from hazard
    this.farmerGrid.y -= 0.65;
    const fIso = this.gridToIso(this.farmerGrid.x, this.farmerGrid.y, 0);
    this.farmer.x = fIso.x;
    this.farmer.y = fIso.y;
    this.showFloatingText(fIso.x, fIso.y - 50, `💥 ${cause}! STUNNED (${stunDur}s)!`, '#e74c3c');
  }

  showFloatingText(x, y, text, color = '#ffffff') {
    const txt = this.add.text(x, y, text, {
      fontFamily: 'Impact, Arial Black',
      fontSize: '15px',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(9999);

    this.tweens.add({
      targets: txt,
      y: y - 32,
      alpha: 0,
      duration: 1200,
      ease: 'Quad.easeOut',
      onComplete: () => txt.destroy()
    });
  }
}
