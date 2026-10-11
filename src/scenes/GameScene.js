// GameScene: 2.5D Isometric World, Piggy Controller, Farmer AI, Obstacles, Physics & Camera

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.levelData = (window.GAME_LEVELS && window.GAME_LEVELS[this.levelIndex]) || window.GAME_LEVELS[0];
    
    // Isometric metrics matching 64x54 voxel cubes
    this.tileWidth = 64;
    this.tileHeight = 32;
    this.elevationStep = 18;

    // Game state
    this.score = 0;
    this.timeLeft = this.levelData.timeLimit || 60;
    this.isGameOver = false;
    this.isVictory = false;

    // Grace period (3 seconds head start for Piggy)
    this.graceTime = 3.0;

    // Dash state
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashDuration = 0;

    // Jump state (Z axis)
    this.piggyZ = 0;
    this.piggyVZ = 0;
    this.isJumping = false;

    // Farmer state
    this.farmerSpeed = this.levelData.farmerSpeed || 82;
    this.farmerMudSlow = 0;

    // Touch controls input state
    this.touchInput = { up: false, down: false, left: false, right: false };
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

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
      z: Phaser.Input.Keyboard.KeyCodes.Z
    });

    // Launch UI Scene
    this.scene.launch('UIScene', { levelIndex: this.levelIndex });

    // Initial event dispatch
    this.events.emit('updateScore', this.score);
    this.events.emit('updateTime', this.timeLeft);
    this.events.emit('updateDash', true);

    // Head Start / Training Banner
    const bannerStr = this.levelData.isTraining ? '🎓 TRAINING YARD 🎓\nPractice Movement, Jumping & Dashing!' : 'READY...';
    const bannerSize = this.levelData.isTraining ? '26px' : '44px';
    const bannerColor = this.levelData.isTraining ? '#2ecc71' : '#f1c40f';

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
      this.tweens.killAll();
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

    // Distant sky backdrop
    const sky = this.add.graphics().setScrollFactor(0);
    sky.fillGradientStyle(0x74b9ff, 0x74b9ff, 0xa1c4fd, 0xc2e9fb, 1);
    sky.fillRect(0, 0, w, h);

    // Parallax Mountain Silhouettes (matching background in world tilesheet)
    this.bgHills = this.add.graphics().setScrollFactor(0.08);
    this.bgHills.fillStyle(0x3d6f46, 0.45);
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
    this.bgSilos.fillStyle(0x274e2d, 0.55);
    // Draw distant barn/silo outlines
    [-50, 400, 900, 1500].forEach(bx => {
      this.bgSilos.fillRect(bx, 280, 50, 90);
      this.bgSilos.fillCircle(bx + 25, 280, 25);
      this.bgSilos.fillRect(bx + 60, 310, 80, 60);
    });
  }

  buildIsometricWorld() {
    const gw = this.levelData.gridWidth;
    const gh = this.levelData.gridHeight;
    const pathX = this.levelData.pathX || Math.floor(gw / 2);

    this.gridTiles = [];

    // Lay out isometric foundation
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        // Decide tile type: central path is dirt, surrounding is lush grass
        const isPath = Math.abs(x - pathX) <= 1;
        const tileKey = isPath ? 'tile_dirt' : 'tile_grass';

        // Elevation: raised terraces on borders
        let z = 0;
        if (x === 0 || x === gw - 1) {
          z = 1;
        }

        const iso = this.gridToIso(x, y, z);
        const tile = this.add.image(iso.x, iso.y, tileKey);
        tile.setOrigin(0.5, 0.35);
        tile.setDepth(iso.y - 100);
        this.tileGroup.add(tile);
      }
    }

    // Place Obstacles
    this.obstacles = [];
    (this.levelData.obstacles || []).forEach(obs => {
      const iso = this.gridToIso(obs.x, obs.y, obs.z || 0);
      const sprite = this.add.image(iso.x, iso.y, obs.type);
      sprite.setOrigin(0.5, 0.7);
      sprite.setDepth(iso.y);
      this.obstacles.push({
        type: obs.type,
        gridX: obs.x,
        gridY: obs.y,
        gridZ: obs.z || 0,
        sprite: sprite,
        targetZ: obs.targetZ
      });
      this.obstaclesGroup.add(sprite);
    });

    // Place Collectibles
    this.items = [];
    (this.levelData.items || []).forEach(item => {
      const iso = this.gridToIso(item.x, item.y, item.z || 0);
      const sprite = this.add.image(iso.x, iso.y - 10, item.type);
      sprite.setOrigin(0.5, 0.7);
      sprite.setDepth(iso.y + 5);

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
        gridZ: item.z || 0,
        sprite: sprite,
        collected: false
      });
      this.itemsGroup.add(sprite);
    });

    // Place Scenery (Barn Goal, Trees, Fences, Pumpkins)
    (this.levelData.scenery || []).forEach(sc => {
      const iso = this.gridToIso(sc.x, sc.y, sc.z || 0);
      const sprite = this.add.image(iso.x, iso.y, sc.type);
      if (sc.type === 'barn') {
        sprite.setOrigin(0.5, 0.85);
        sprite.setDepth(iso.y + 40);
        this.barnSprite = sprite;
      } else {
        sprite.setOrigin(0.5, 0.85);
        sprite.setDepth(iso.y);
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
    this.goalGrid = this.levelData.goal || { x: pathX, y: gh - 2 };
  }

  createCharacters() {
    // 1. PIGGY (Hero)
    const pStart = this.levelData.piggyStart || { x: 5, y: 2, z: 0 };
    this.piggyGrid = { x: pStart.x, y: pStart.y, z: pStart.z };
    const pigIso = this.gridToIso(this.piggyGrid.x, this.piggyGrid.y, this.piggyGrid.z);

    this.piggy = this.add.sprite(pigIso.x, pigIso.y, 'piggy');
    this.piggy.setOrigin(0.5, 0.85);
    this.piggy.setDepth(pigIso.y + 10);

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
    cam.startFollow(this.piggy, true, 0.08, 0.08, 0, 40);
    cam.setZoom(1.15);
  }

  requestJump() {
    if (this.isJumping || this.isGameOver || this.isVictory) return;
    this.isJumping = true;
    this.piggyVZ = 6.2;
    window.sounds?.playJump();
    this.spawnDust(this.piggy.x, this.piggy.y);
  }

  requestDash() {
    if (this.dashCooldown > 0 || this.isGameOver || this.isVictory) return;
    this.isDashing = true;
    this.dashDuration = 0.42; // Dash duration in seconds
    this.dashCooldown = 2.2;  // Cooldown in seconds
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
    const dt = delta / 1000; // in seconds

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

    // Handle Piggy Input & Movement
    this.handlePiggyMovement(dt);

    // Handle Piggy Vertical Jump Physics (Z axis)
    this.handlePiggyJump(dt);

    // Handle Farmer AI Chase
    this.handleFarmerAI(dt);

    // Update Depths for Proper 2.5D Isometric Sorting
    this.piggy.setDepth(this.piggy.y + 10);
    this.farmer.setDepth(this.farmer.y + 10);

    // Check Collisions (Items, Obstacles, Goal)
    this.checkInteractions();

    // Check Distance & Tension for HUD
    const distFarmer = Phaser.Math.Distance.Between(this.piggyGrid.x, this.piggyGrid.y, this.farmerGrid.x, this.farmerGrid.y);
    const distGoal = Phaser.Math.Distance.Between(this.piggyGrid.x, this.piggyGrid.y, this.goalGrid.x, this.goalGrid.y);
    this.events.emit('updateDistance', distFarmer, distGoal);
  }

  handlePiggyMovement(dt) {
    let dx = 0;
    let dy = 0;

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

    // Calculate movement vector
    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal speed
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      // Base speed calculation
      let currentSpeed = this.piggyBaseSpeed;
      if (this.isDashing) currentSpeed *= 1.85;

      // Apply Mud Slowdown (if not jumping)
      if (!this.isJumping && this.isPiggyOnMud()) {
        currentSpeed *= 0.42;
      }

      // Move in grid space
      this.piggyGrid.x += dx * currentSpeed * dt;
      this.piggyGrid.y += dy * currentSpeed * dt;

      // Clamp within map bounds
      this.piggyGrid.x = Phaser.Math.Clamp(this.piggyGrid.x, 0.5, this.levelData.gridWidth - 1.5);
      this.piggyGrid.y = Phaser.Math.Clamp(this.piggyGrid.y, 0, this.levelData.gridHeight - 1);

      // Facing
      if (dx > 0) this.piggy.setFlipX(false);
      else if (dx < 0) this.piggy.setFlipX(true);

      // Running trot / bounce animation
      const trot = Math.sin(Date.now() * 0.018) * 3;
      this.piggy.y = this.gridToIso(this.piggyGrid.x, this.piggyGrid.y, this.piggyGrid.z).y + trot - (this.piggyZ * this.elevationStep);

      // Emit running dust occasionally
      if (Math.random() < 0.25) {
        this.spawnDust(this.piggy.x, this.piggy.y + 4, 1);
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

    if (this.piggyZ <= 0) {
      this.piggyZ = 0;
      this.piggyVZ = 0;
      this.isJumping = false;
      this.spawnDust(this.piggy.x, this.piggy.y, 4);
    }
  }

  handleFarmerAI(dt) {
    // In training mode, the farmer is asleep
    if (this.levelData.isTraining) {
      this.farmer.setAngle(-25 + Math.sin(Date.now() * 0.003) * 3);
      return;
    }

    // If during head start grace period, farmer stays put and fumes!
    if (this.graceTime > 0) {
      this.farmer.setAngle(Math.sin(Date.now() * 0.035) * 10);
      return;
    }
    this.farmer.setAngle(0);

    // Distance from farmer to piggy
    const dx = this.piggyGrid.x - this.farmerGrid.x;
    const dy = this.piggyGrid.y - this.farmerGrid.y;
    const dist = Math.hypot(dx, dy);

    // Speed calculation
    let speed = (this.farmerSpeed / 30); // scale to grid units/sec

    // Mud check for Farmer
    if (this.isEntityOnMud(this.farmerGrid.x, this.farmerGrid.y)) {
      speed *= 0.45;
    }

    // Farmer tracks Piggy
    if (dist > 0.3) {
      const dirX = dx / dist;
      const dirY = dy / dist;

      this.farmerGrid.x += dirX * speed * dt;
      this.farmerGrid.y += dirY * speed * dt;

      // Facing
      if (dirX > 0) this.farmer.setFlipX(false);
      else if (dirX < 0) this.farmer.setFlipX(true);

      // Footstep walk bob
      const bob = Math.sin(Date.now() * 0.015) * 3;
      const fIso = this.gridToIso(this.farmerGrid.x, this.farmerGrid.y, this.farmerGrid.z);
      this.farmer.x = fIso.x;
      this.farmer.y = fIso.y + bob;
    }

    // Pitchfork Warning Lunge vs Catch
    if (dist < 0.55 && !this.isJumping) {
      this.triggerGameOver('The farmer caught Piggy with his pitchfork!');
    } else if (dist < 1.2 && !this.isJumping) {
      // Pitchfork thrust warning: farmer angles towards piggy
      this.farmer.setAngle(this.farmer.flipX ? -15 : 15);
      if (Math.random() < 0.04) {
        window.sounds?.playFarmerAlert();
      }
    } else {
      this.farmer.setAngle(0);
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
    // 1. Collectibles Check
    for (const item of this.items) {
      if (!item.collected) {
        const d = Math.hypot(this.piggyGrid.x - item.gridX, this.piggyGrid.y - item.gridY);
        if (d < 0.85) {
          item.collected = true;
          window.sounds?.playCollect();

          // Points based on apple type
          let pts = 50;
          if (item.type === 'apple_gold') pts = 150;
          else if (item.type === 'apple_green') pts = 75;
          else if (item.type === 'acorn') pts = 25;

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

    // 2. Obstacles Check (Spikes & Hay Spring & Thorns)
    for (const obs of this.obstacles) {
      const d = Math.hypot(this.piggyGrid.x - obs.gridX, this.piggyGrid.y - obs.gridY);
      if (d < 0.7) {
        if (obs.type === 'hay_spring' && !this.isJumping) {
          // Launch Piggy high!
          window.sounds?.playBounce();
          this.isJumping = true;
          this.piggyVZ = 8.5; // mega jump
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
          // Spikes trip Piggy!
          window.sounds?.playHurt();
          this.piggyGrid.y -= 0.35; // knock back
          this.cameras.main.shake(180, 0.015);
        } else if (obs.type === 'thorn' && !this.isJumping) {
          // Thorn bush scratches Piggy
          window.sounds?.playHurt();
          this.piggyGrid.x += (this.piggyGrid.x > obs.gridX ? 0.3 : -0.3);
        }
      }
    }

    // 3. Goal Reached Check (The Red Barn)
    const goalDist = Math.hypot(this.piggyGrid.x - this.goalGrid.x, this.piggyGrid.y - this.goalGrid.y);
    if (goalDist < 1.3) {
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
        timeLeft: this.timeLeft
      });
    });
  }
}
