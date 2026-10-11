// BootScene: Preloads assets, generates voxel textures matching the tilesheet, and sets up animations

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Show simple loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'LOADING PIGGY ESCAPE...', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 + 20, 320, 24, 6);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xff6b81, 1);
      progressBar.fillRoundedRect(width / 2 - 156, height / 2 + 24, 312 * value, 16, 4);
    });

    // Load uploaded assets
    this.load.image('menu_splash', 'public/assets/menu_splash.png');
    this.load.image('world_tilesheet', 'public/assets/world_tilesheet.jpg');

    this.load.on('loaderror', (fileObj) => {
      console.warn('Asset failed to load:', fileObj.key, fileObj.src);
    });
  }

  create() {
    // Generate voxel textures that replicate the 2.5D style in world_tilesheet.jpg
    this.generateIsometricVoxelTextures();

    // Start Menu
    this.scene.start('MenuScene');
  }

  generateIsometricVoxelTextures() {
    // 1. Isometric Block: Grass Cube (64x64)
    this.createIsometricCube('tile_grass', '#5dbb35', '#469b24', '#7d4a25', '#5b3214');
    
    // 2. Isometric Block: Dirt Path
    this.createIsometricCube('tile_dirt', '#966336', '#7a4e27', '#6b3f1b', '#4e2a10');

    // 3. Isometric Block: Stone Block
    this.createIsometricCube('tile_stone', '#8d99ae', '#6c7a89', '#556270', '#3b444e');

    // 4. Piggy Texture (Voxel Pig with Red Headband)
    this.createPiggyTexture();

    // 5. Farmer Texture (Voxel Farmer with Hat, Overalls, Red Plaid)
    this.createFarmerTexture();

    // 6. Obstacles & Scenery
    this.createSpikesTexture();
    this.createMudTexture();
    this.createThornTexture();
    this.createHaySpringTexture();
    this.createTreeTexture('tree_green', '#48b83e', '#358a2d');
    this.createTreeTexture('tree_autumn', '#e67e22', '#d35400');
    this.createBarnTexture();
    this.createFenceTexture();
    this.createPumpkinTexture();
    this.createRockTexture();

    // 7. Collectibles
    this.createItemTexture('apple_red', '#e74c3c');
    this.createItemTexture('apple_gold', '#f1c40f');
    this.createItemTexture('apple_green', '#2ecc71');
    this.createAcornTexture();

    // 8. Particles
    const dust = this.make.graphics({ x: 0, y: 0, add: false });
    dust.fillStyle(0xd2b48c, 0.7);
    dust.fillCircle(8, 8, 7);
    dust.generateTexture('dust', 16, 16);
  }

  createIsometricCube(key, topBright, topDark, leftColor, rightColor) {
    const w = 64;
    const h = 54;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    const cx = w / 2;
    const topY = 4;
    const midY = 22;
    const botY = 50;

    // Top Isometric Diamond
    g.fillStyle(Phaser.Display.Color.HexStringToColor(topBright).color, 1);
    g.beginPath();
    g.moveTo(cx, topY);
    g.lineTo(w - 2, midY - 9);
    g.lineTo(cx, midY);
    g.lineTo(2, midY - 9);
    g.closePath();
    g.fillPath();

    // Top texture detail / grass trim
    g.fillStyle(Phaser.Display.Color.HexStringToColor(topDark).color, 0.6);
    g.fillRect(cx - 10, midY - 14, 20, 6);

    // Left face
    g.fillStyle(Phaser.Display.Color.HexStringToColor(leftColor).color, 1);
    g.beginPath();
    g.moveTo(2, midY - 9);
    g.lineTo(cx, midY);
    g.lineTo(cx, botY);
    g.lineTo(2, botY - 9);
    g.closePath();
    g.fillPath();

    // Right face (darker shaded for 3D depth)
    g.fillStyle(Phaser.Display.Color.HexStringToColor(rightColor).color, 1);
    g.beginPath();
    g.moveTo(cx, midY);
    g.lineTo(w - 2, midY - 9);
    g.lineTo(w - 2, botY - 9);
    g.lineTo(cx, botY);
    g.closePath();
    g.fillPath();

    // Edge highlights for blocky voxel look
    g.lineStyle(1.5, 0xffffff, 0.25);
    g.beginPath();
    g.moveTo(cx, topY);
    g.lineTo(w - 2, midY - 9);
    g.lineTo(cx, midY);
    g.lineTo(2, midY - 9);
    g.closePath();
    g.strokePath();

    g.generateTexture(key, w, h);
  }

  createPiggyTexture() {
    const w = 48;
    const h = 48;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Drop shadow (3D ground contact)
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(w / 2, h - 5, 26, 10);

    // Voxel Body (Cubic Pink)
    const pinkMain = 0xff99bb;
    const pinkShadow = 0xe07297;
    const pinkHighlight = 0xffb3cc;

    // Body cube
    g.fillStyle(pinkShadow, 1);
    g.fillRect(14, 16, 20, 22);
    g.fillStyle(pinkMain, 1);
    g.fillRect(12, 14, 20, 20);

    // Ears
    g.fillStyle(pinkShadow, 1);
    g.fillRect(11, 10, 6, 7);
    g.fillRect(27, 10, 6, 7);
    g.fillStyle(pinkHighlight, 1);
    g.fillRect(12, 11, 4, 5);
    g.fillRect(28, 11, 4, 5);

    // Red Ninja Headband (Signature characteristic!)
    g.fillStyle(0xd63031, 1);
    g.fillRect(10, 15, 24, 6);
    // Headband ribbon tails flying backwards
    g.beginPath();
    g.moveTo(10, 17);
    g.lineTo(1, 13);
    g.lineTo(3, 21);
    g.lineTo(10, 20);
    g.closePath();
    g.fillPath();

    // Snout
    g.fillStyle(pinkShadow, 1);
    g.fillRect(19, 23, 10, 7);
    g.fillStyle(pinkHighlight, 1);
    g.fillRect(20, 24, 8, 5);
    // Nostrils
    g.fillStyle(0x8a2846, 1);
    g.fillRect(22, 26, 2, 2);
    g.fillRect(25, 26, 2, 2);

    // Determined Angry/Brave Eyes
    g.fillStyle(0x2d3436, 1);
    g.fillRect(16, 19, 4, 3);
    g.fillRect(28, 19, 4, 3);
    // White eye shine
    g.fillStyle(0xffffff, 1);
    g.fillRect(17, 19, 1.5, 1.5);
    g.fillRect(29, 19, 1.5, 1.5);

    // Trotters / Legs
    g.fillStyle(pinkShadow, 1);
    g.fillRect(15, 34, 5, 8);
    g.fillRect(24, 34, 5, 8);

    g.generateTexture('piggy', w, h);
  }

  createFarmerTexture() {
    const w = 56;
    const h = 60;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Drop shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(w / 2, h - 4, 28, 10);

    // Farmer Body: Blue Overalls & Red Flannel
    // Red Flannel Shirt
    g.fillStyle(0xc0392b, 1);
    g.fillRect(18, 26, 20, 16);
    // Flannel checks
    g.fillStyle(0x962d22, 1);
    g.fillRect(20, 26, 4, 16);
    g.fillRect(32, 26, 4, 16);

    // Blue Overalls
    g.fillStyle(0x2980b9, 1);
    g.fillRect(19, 32, 18, 14);
    // Suspenders
    g.fillStyle(0x1f618d, 1);
    g.fillRect(20, 26, 3, 10);
    g.fillRect(33, 26, 3, 10);

    // Boots
    g.fillStyle(0x422006, 1);
    g.fillRect(19, 46, 7, 10);
    g.fillRect(30, 46, 7, 10);

    // Farmer Face / Head (Cubic voxel)
    g.fillStyle(0xf5cd79, 1);
    g.fillRect(20, 16, 16, 13);
    // Furious Eyes
    g.fillStyle(0x1e272e, 1);
    g.fillRect(22, 20, 3, 3);
    g.fillRect(31, 20, 3, 3);
    // Angry eyebrows
    g.fillStyle(0x3e2723, 1);
    g.fillRect(21, 18, 5, 2);
    g.fillRect(30, 18, 5, 2);

    // Black Wide-Brim Farmer Hat
    g.fillStyle(0x2c3e50, 1);
    // Brim
    g.fillRect(10, 14, 36, 4);
    // Crown
    g.fillRect(16, 4, 24, 11);
    // Hat band
    g.fillStyle(0x7f8c8d, 1);
    g.fillRect(16, 12, 24, 2);

    // Pitchfork!
    // Handle (Wood)
    g.fillStyle(0x8d5b4c, 1);
    g.fillRect(40, 6, 4, 46);
    // Metal 3-prong fork head
    g.fillStyle(0xbdc3c7, 1);
    g.fillRect(35, 8, 14, 3);
    g.fillRect(35, 0, 3, 9);
    g.fillRect(41, 0, 3, 9);
    g.fillRect(47, 0, 3, 9);

    g.generateTexture('farmer', w, h);
  }

  createBarnTexture() {
    const w = 110;
    const h = 110;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Barn Body (Isometric Red Voxel Barn from the spread sheet)
    // Dark shadow base
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(w / 2, h - 10, 80, 24);

    // Front/Left Wall (Deep Barn Red)
    g.fillStyle(0xa93226, 1);
    g.beginPath();
    g.moveTo(20, 52);
    g.lineTo(55, 68);
    g.lineTo(55, 100);
    g.lineTo(20, 84);
    g.closePath();
    g.fillPath();

    // Right Wall (Shaded Barn Red)
    g.fillStyle(0x78281f, 1);
    g.beginPath();
    g.moveTo(55, 68);
    g.lineTo(95, 52);
    g.lineTo(95, 84);
    g.lineTo(55, 100);
    g.closePath();
    g.fillPath();

    // Gambrel Barn Roof (Charcoal / Slate blue)
    g.fillStyle(0x34495e, 1);
    g.beginPath();
    g.moveTo(55, 16);
    g.lineTo(95, 34);
    g.lineTo(95, 52);
    g.lineTo(55, 68);
    g.lineTo(20, 52);
    g.lineTo(20, 34);
    g.closePath();
    g.fillPath();

    // Roof Highlight
    g.fillStyle(0x4a6572, 1);
    g.beginPath();
    g.moveTo(55, 16);
    g.lineTo(55, 68);
    g.lineTo(20, 52);
    g.lineTo(20, 34);
    g.closePath();
    g.fillPath();

    // White Trim Barn Double Door
    g.fillStyle(0xffffff, 1);
    g.fillRect(32, 68, 16, 26);
    g.fillStyle(0x922b21, 1);
    g.fillRect(34, 70, 12, 24);
    // White X on barn door
    g.lineStyle(2, 0xffffff, 1);
    g.strokeLineShape(new Phaser.Geom.Line(34, 70, 46, 94));
    g.strokeLineShape(new Phaser.Geom.Line(34, 94, 46, 70));

    // Goal indicator banner / glow
    g.fillStyle(0xf1c40f, 0.85);
    g.fillTriangle(40, 55, 35, 63, 45, 63);

    g.generateTexture('barn', w, h);
  }

  createTreeTexture(key, leafColorHex, shadowColorHex) {
    const w = 64;
    const h = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Ground shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(w / 2, h - 6, 36, 12);

    // Trunk (wood brown)
    g.fillStyle(0x6e4526, 1);
    g.fillRect(w / 2 - 5, h - 35, 10, 30);
    g.fillStyle(0x4a2e16, 1);
    g.fillRect(w / 2, h - 35, 5, 30);

    // Voxel Foliage: Stacked isometric cubes
    const leaf = Phaser.Display.Color.HexStringToColor(leafColorHex).color;
    const shadow = Phaser.Display.Color.HexStringToColor(shadowColorHex).color;

    // Lower foliage tier
    g.fillStyle(shadow, 1);
    g.fillRect(10, 24, 44, 24);
    g.fillStyle(leaf, 1);
    g.fillRect(14, 20, 36, 22);

    // Top foliage tier
    g.fillStyle(shadow, 1);
    g.fillRect(16, 6, 32, 20);
    g.fillStyle(leaf, 1);
    g.fillRect(18, 4, 28, 18);

    g.generateTexture(key, w, h);
  }

  createSpikesTexture() {
    const w = 50;
    const h = 34;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Wooden spike base
    g.fillStyle(0x5c3d2e, 1);
    g.fillRect(4, 20, 42, 8);

    // Spikes (Grey Steel / Sharp wood)
    const pts = [
      [8, 20, 11, 4, 14, 20],
      [18, 20, 21, 2, 24, 20],
      [28, 20, 31, 3, 34, 20],
      [37, 20, 40, 5, 43, 20]
    ];
    pts.forEach(p => {
      g.fillStyle(0xdfe6e9, 1);
      g.fillTriangle(p[0], p[1], p[2], p[3], p[4], p[5]);
      g.fillStyle(0xb2bec3, 1);
      g.fillTriangle(p[2], p[3], p[4], p[5], p[2], p[1]);
    });

    g.generateTexture('spikes', w, h);
  }

  createMudTexture() {
    const w = 56;
    const h = 32;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Mud puddle with wet bubbles
    g.fillStyle(0x422a1d, 0.95);
    g.fillEllipse(w / 2, h / 2, 50, 24);

    g.fillStyle(0x583a29, 0.9);
    g.fillEllipse(w / 2 - 4, h / 2 - 2, 38, 16);

    // Squelchy mud bubbles
    g.fillStyle(0x734d36, 0.8);
    g.fillCircle(18, 14, 4);
    g.fillCircle(34, 18, 5);

    g.generateTexture('mud', w, h);
  }

  createThornTexture() {
    const w = 46;
    const h = 42;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Ground shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(w / 2, h - 4, 34, 10);

    // Thorny green bush (matching spread)
    g.fillStyle(0x27ae60, 1);
    g.fillCircle(w / 2, h / 2 - 2, 16);
    g.fillStyle(0x1e8449, 1);
    g.fillCircle(w / 2 + 4, h / 2 + 2, 12);

    // Red Thorns
    const thorns = [
      [10, 14, 6, 12, 12, 18],
      [36, 14, 40, 12, 34, 18],
      [22, 6, 24, 1, 27, 7],
      [14, 26, 9, 30, 16, 30],
      [32, 26, 37, 30, 30, 30]
    ];
    g.fillStyle(0xe74c3c, 1);
    thorns.forEach(t => g.fillTriangle(t[0], t[1], t[2], t[3], t[4], t[5]));

    g.generateTexture('thorn', w, h);
  }

  createHaySpringTexture() {
    const w = 48;
    const h = 50;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Spring base (metal coils)
    g.lineStyle(3, 0x95a5a6, 1);
    g.strokeEllipse(w / 2, 44, 20, 6);
    g.strokeEllipse(w / 2, 38, 18, 5);
    g.strokeEllipse(w / 2, 32, 16, 5);

    // Hay bale on top
    g.fillStyle(0xf39c12, 1);
    g.fillRect(8, 10, 32, 20);
    g.fillStyle(0xf1c40f, 1);
    g.fillRect(10, 8, 28, 18);

    // Hay binding twine
    g.fillStyle(0xd35400, 1);
    g.fillRect(16, 8, 2, 20);
    g.fillRect(30, 8, 2, 20);

    g.generateTexture('hay_spring', w, h);
  }

  createFenceTexture() {
    const w = 48;
    const h = 36;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Wooden posts
    g.fillStyle(0x784212, 1);
    g.fillRect(6, 6, 6, 28);
    g.fillRect(36, 6, 6, 28);

    // Rails
    g.fillStyle(0x935116, 1);
    g.fillRect(4, 12, 40, 5);
    g.fillRect(4, 22, 40, 5);

    g.generateTexture('fence', w, h);
  }

  createPumpkinTexture() {
    const w = 32;
    const h = 28;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Pumpkin body
    g.fillStyle(0xe67e22, 1);
    g.fillEllipse(w / 2, h / 2 + 2, 24, 18);
    g.fillStyle(0xd35400, 1);
    g.fillEllipse(w / 2, h / 2 + 2, 14, 18);

    // Stem
    g.fillStyle(0x27ae60, 1);
    g.fillRect(w / 2 - 2, 2, 4, 6);

    g.generateTexture('pumpkin', w, h);
  }

  createRockTexture() {
    const w = 40;
    const h = 32;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Ground shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(w / 2, h - 3, 30, 8);
    // Voxel boulder
    g.fillStyle(0x576574, 1);
    g.fillRect(8, 10, 24, 16);
    g.fillStyle(0x8395a7, 1);
    g.fillRect(10, 8, 20, 14);
    g.fillStyle(0xc8d6e5, 1);
    g.fillRect(12, 10, 8, 6);
    g.generateTexture('rock', w, h);
  }

  createItemTexture(key, colorHex) {
    const w = 26;
    const h = 26;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Apple
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(w / 2, h - 2, 14, 5);

    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    g.fillStyle(color, 1);
    g.fillCircle(w / 2, h / 2, 8);

    // Highlight
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(w / 2 - 3, h / 2 - 3, 2.5);

    // Leaf & stem
    g.fillStyle(0x27ae60, 1);
    g.fillTriangle(w / 2, 4, w / 2 + 5, 2, w / 2 + 3, 7);

    g.generateTexture(key, w, h);
  }

  createAcornTexture() {
    const w = 24;
    const h = 26;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Acorn nut
    g.fillStyle(0xa0522d, 1);
    g.fillEllipse(w / 2, 15, 12, 14);

    // Cap
    g.fillStyle(0x5c3317, 1);
    g.fillRect(5, 5, 14, 7);
    g.fillRect(w / 2 - 1, 2, 2, 4);

    g.generateTexture('acorn', w, h);
  }
}
