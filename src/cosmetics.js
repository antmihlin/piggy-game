// Cosmetics System for Piggy Escape
// Manages appearance items (Head, Costume, Boots), RPG bonus abilities, and level unlocks.

const COSMETICS_DATA = [
  // --- HEAD CATEGORY ---
  {
    id: 'head_bandana',
    category: 'head',
    name: 'Ninja Bandana',
    icon: '🧣',
    unlockLevel: 0,
    isStarter: true,
    bonusText: '+8% Movement Speed',
    bonusDesc: 'Increases Piggy’s base movement velocity by 8%.',
    bonus: { speedMult: 1.08 }
  },
  {
    id: 'head_straw',
    category: 'head',
    name: 'Straw Farmer Hat',
    icon: '👒',
    unlockLevel: 0,
    isStarter: false,
    unlockDesc: 'Complete Training Yard (Level 0)',
    bonusText: 'Farmer Aggro Range -25%',
    bonusDesc: 'Blends into the fields. The Farmer must get closer to spot Piggy.',
    bonus: { stealth: 0.25 }
  },
  {
    id: 'head_wizard',
    category: 'head',
    name: 'Wizard Hat',
    icon: '🧙',
    unlockLevel: 2,
    isStarter: false,
    unlockDesc: 'Complete Muddy Crossroad (Level 2)',
    bonusText: 'Artifact Duration +40%',
    bonusDesc: 'All powerup artifacts (Speed, Wings, Invis) last 40% longer.',
    bonus: { artifactDurationMult: 1.40 }
  },
  {
    id: 'head_crown',
    category: 'head',
    name: 'Golden Crown',
    icon: '👑',
    unlockLevel: 3,
    isStarter: false,
    unlockDesc: 'Complete Autumn Chase (Level 3)',
    bonusText: '+50% Fruit Bonus Score',
    bonusDesc: 'Royal grace: Apples and acorns grant 50% more points.',
    bonus: { scoreMult: 1.50 }
  },

  // --- COSTUME CATEGORY ---
  {
    id: 'costume_classic',
    category: 'costume',
    name: 'Classic Pink',
    icon: '🐷',
    unlockLevel: 0,
    isStarter: true,
    bonusText: 'Standard Pig Agility',
    bonusDesc: 'Pure natural speed and balance.',
    bonus: {}
  },
  {
    id: 'costume_camo',
    category: 'costume',
    name: 'Mud Camo Overalls',
    icon: '🦺',
    unlockLevel: 1,
    isStarter: false,
    unlockDesc: 'Complete Sunny Pasture (Level 1)',
    bonusText: 'Immune to Mud Slowdown',
    bonusDesc: 'Waterproof mud guard. Mud traps do not slow Piggy down.',
    bonus: { mudImmune: true }
  },
  {
    id: 'costume_cape',
    category: 'costume',
    name: 'Superhero Cape',
    icon: '🦸',
    unlockLevel: 2,
    isStarter: false,
    unlockDesc: 'Complete Muddy Crossroad (Level 2)',
    bonusText: 'Dash Cooldown -40%',
    bonusDesc: 'Aerodynamic cape charges Piggy’s Dash burst 40% faster.',
    bonus: { dashCooldownMult: 0.60 }
  },
  {
    id: 'costume_armor',
    category: 'costume',
    name: 'Knight Plate Armor',
    icon: '🛡️',
    unlockLevel: 3,
    isStarter: false,
    unlockDesc: 'Complete Autumn Chase (Level 3)',
    bonusText: 'Immune to Spike & Thorn Trip',
    bonusDesc: 'Tough steel plates deflect sharp thorns and spike traps.',
    bonus: { hazardImmune: true }
  },

  // --- BOOTS CATEGORY ---
  {
    id: 'boots_bare',
    category: 'boots',
    name: 'Bare Hooves',
    icon: '🐾',
    unlockLevel: 0,
    isStarter: true,
    bonusText: 'Standard Trotters',
    bonusDesc: 'Natural hopping rhythm.',
    bonus: {}
  },
  {
    id: 'boots_sneakers',
    category: 'boots',
    name: 'Turbo Sneakers',
    icon: '👟',
    unlockLevel: 1,
    isStarter: false,
    unlockDesc: 'Complete Sunny Pasture (Level 1)',
    bonusText: '+15% Sprint Speed',
    bonusDesc: 'Grippy athletic runners give Piggy a +15% speed increase.',
    bonus: { speedMult: 1.15 }
  },
  {
    id: 'boots_winged',
    category: 'boots',
    name: 'Winged Hermes Boots',
    icon: '🪽',
    unlockLevel: 2,
    isStarter: false,
    unlockDesc: 'Complete Muddy Crossroad (Level 2)',
    bonusText: '+30% Jump Height',
    bonusDesc: 'Feathered wings grant a higher vertical leap over barriers.',
    bonus: { jumpPowerMult: 1.30 }
  },
  {
    id: 'boots_spring',
    category: 'boots',
    name: 'Spring Cleats',
    icon: '🥾',
    unlockLevel: 3,
    isStarter: false,
    unlockDesc: 'Complete Autumn Chase (Level 3)',
    bonusText: 'Hay Springs +50% Bounce',
    bonusDesc: 'Mechanical shock coils supercharge spring pads by +50%.',
    bonus: { springBoostMult: 1.50 }
  }
];

class CosmeticsManagerClass {
  constructor() {
    this.items = COSMETICS_DATA;
    this.storageKeyUnlocked = 'piggy_cosmetics_unlocked_v1';
    this.storageKeyEquipped = 'piggy_cosmetics_equipped_v1';

    this.unlockedIds = this.loadUnlocked();
    this.equipped = this.loadEquipped();
  }

  loadUnlocked() {
    try {
      const saved = localStorage.getItem(this.storageKeyUnlocked);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Always ensure starter items are present
          this.items.filter(i => i.isStarter).forEach(i => {
            if (!parsed.includes(i.id)) parsed.push(i.id);
          });
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read unlocked cosmetics from storage', e);
    }
    // Default starter items
    return this.items.filter(i => i.isStarter).map(i => i.id);
  }

  saveUnlocked() {
    try {
      localStorage.setItem(this.storageKeyUnlocked, JSON.stringify(this.unlockedIds));
    } catch (e) {}
  }

  loadEquipped() {
    try {
      const saved = localStorage.getItem(this.storageKeyEquipped);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            head: parsed.head || 'head_bandana',
            costume: parsed.costume || 'costume_classic',
            boots: parsed.boots || 'boots_bare'
          };
        }
      }
    } catch (e) {}
    return {
      head: 'head_bandana',
      costume: 'costume_classic',
      boots: 'boots_bare'
    };
  }

  saveEquipped() {
    try {
      localStorage.setItem(this.storageKeyEquipped, JSON.stringify(this.equipped));
    } catch (e) {}
  }

  getAllItems() {
    return this.items;
  }

  getItemById(id) {
    return this.items.find(i => i.id === id) || null;
  }

  isUnlocked(id) {
    return this.unlockedIds.includes(id);
  }

  getEquipped() {
    return { ...this.equipped };
  }

  equip(category, id) {
    if (!['head', 'costume', 'boots'].includes(category)) return false;
    if (!this.isUnlocked(id)) return false;

    this.equipped[category] = id;
    this.saveEquipped();
    return true;
  }

  // Called when a level is passed! Unlocks any reward cosmetics for that level.
  unlockLevelRewards(levelIndex) {
    const newlyUnlocked = [];
    this.items.forEach(item => {
      if (item.unlockLevel === levelIndex && !this.unlockedIds.includes(item.id)) {
        this.unlockedIds.push(item.id);
        newlyUnlocked.push(item);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveUnlocked();
    }
    return newlyUnlocked;
  }

  // Developer option: Unlocks all cosmetics for testing
  unlockAll() {
    this.unlockedIds = this.items.map(i => i.id);
    this.saveUnlocked();
    return this.unlockedIds;
  }

  // Developer option: Returns full set of all 5 artifacts
  getAllArtifacts() {
    return [
      { id: 'speed', name: 'Speed Pepper', icon: '🌶️', desc: 'Blazing 2x Speed for 6s', duration: 6, key: 'artifact_speed' },
      { id: 'jump', name: 'Winged Feather', icon: '🪽', desc: 'Super High Jump for 7s', duration: 7, key: 'artifact_jump' },
      { id: 'invis', name: 'Smoke Cloak', icon: '👻', desc: 'Invisible to Farmer for 5s', duration: 5, key: 'artifact_invis' },
      { id: 'clone', name: 'Mirage Decoy', icon: '🐷', desc: 'Lures Farmer away for 6s', duration: 6, key: 'artifact_clone' },
      { id: 'dirt', name: 'Mud Bomb', icon: '🥔', desc: 'Throw Mud to Slow Farmer (Press Q)', duration: 0, key: 'artifact_dirt' }
    ];
  }

  // Calculate combined bonus statistics from all equipped items
  getActiveBonuses() {
    let speedMult = 1.0;
    let jumpPowerMult = 1.0;
    let dashCooldownMult = 1.0;
    let artifactDurationMult = 1.0;
    let scoreMult = 1.0;
    let springBoostMult = 1.0;
    let stealth = 0;
    let mudImmune = false;
    let hazardImmune = false;

    const equippedIds = [this.equipped.head, this.equipped.costume, this.equipped.boots];
    equippedIds.forEach(id => {
      const item = this.getItemById(id);
      if (item && item.bonus) {
        if (item.bonus.speedMult) speedMult *= item.bonus.speedMult;
        if (item.bonus.jumpPowerMult) jumpPowerMult *= item.bonus.jumpPowerMult;
        if (item.bonus.dashCooldownMult) dashCooldownMult *= item.bonus.dashCooldownMult;
        if (item.bonus.artifactDurationMult) artifactDurationMult *= item.bonus.artifactDurationMult;
        if (item.bonus.scoreMult) scoreMult *= item.bonus.scoreMult;
        if (item.bonus.springBoostMult) springBoostMult *= item.bonus.springBoostMult;
        if (item.bonus.stealth) stealth += item.bonus.stealth;
        if (item.bonus.mudImmune) mudImmune = true;
        if (item.bonus.hazardImmune) hazardImmune = true;
      }
    });

    return {
      speedMult,
      jumpPowerMult,
      dashCooldownMult,
      artifactDurationMult,
      scoreMult,
      springBoostMult,
      stealth,
      mudImmune,
      hazardImmune
    };
  }

  // Draw Piggy with equipped cosmetics directly onto any Phaser.GameObjects.Graphics
  drawPiggyGraphics(g, x, y, scale = 1, equipped = null) {
    const eq = equipped || this.equipped;
    const head = eq.head;
    const costume = eq.costume;
    const boots = eq.boots;
    const s = scale;

    // 1. Drop shadow
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(x + 24 * s, y + 43 * s, 26 * s, 10 * s);

    // 2. Superhero Cape (drawn behind piggy body)
    if (costume === 'costume_cape') {
      g.fillStyle(0xc0392b, 1);
      g.beginPath();
      g.moveTo(x + 12 * s, y + 17 * s);
      g.lineTo(x + 3 * s, y + 36 * s);
      g.lineTo(x + 13 * s, y + 34 * s);
      g.lineTo(x + 23 * s, y + 37 * s);
      g.lineTo(x + 34 * s, y + 17 * s);
      g.closePath();
      g.fillPath();

      // Cape highlight fold
      g.fillStyle(0xe74c3c, 1);
      g.fillRect(x + 14 * s, y + 18 * s, 5 * s, 16 * s);
    }

    // 3. Voxel Pink Pig Body
    const pinkMain = 0xff99bb;
    const pinkShadow = 0xe07297;
    const pinkHighlight = 0xffb3cc;

    g.fillStyle(pinkShadow, 1);
    g.fillRect(x + 14 * s, y + 16 * s, 20 * s, 22 * s);
    g.fillStyle(pinkMain, 1);
    g.fillRect(x + 12 * s, y + 14 * s, 20 * s, 20 * s);

    // 4. Ears
    g.fillStyle(pinkShadow, 1);
    g.fillRect(x + 11 * s, y + 10 * s, 6 * s, 7 * s);
    g.fillRect(x + 27 * s, y + 10 * s, 6 * s, 7 * s);
    g.fillStyle(pinkHighlight, 1);
    g.fillRect(x + 12 * s, y + 11 * s, 4 * s, 5 * s);
    g.fillRect(x + 28 * s, y + 11 * s, 4 * s, 5 * s);

    // 5. Costume Overlay on Body
    if (costume === 'costume_camo') {
      // Camo Overalls Vest
      g.fillStyle(0x27ae60, 1);
      g.fillRect(x + 13 * s, y + 20 * s, 18 * s, 14 * s);
      g.fillStyle(0x1e824c, 1);
      g.fillRect(x + 15 * s, y + 22 * s, 5 * s, 4 * s);
      g.fillRect(x + 24 * s, y + 27 * s, 6 * s, 4 * s);
      g.fillStyle(0xd35400, 1);
      g.fillRect(x + 23 * s, y + 22 * s, 5 * s, 4 * s);
      // Utility Straps
      g.fillStyle(0x795548, 1);
      g.fillRect(x + 14 * s, y + 15 * s, 3 * s, 7 * s);
      g.fillRect(x + 27 * s, y + 15 * s, 3 * s, 7 * s);
    } else if (costume === 'costume_armor') {
      // Knight Steel Breastplate
      g.fillStyle(0x7f8c8d, 1);
      g.fillRect(x + 13 * s, y + 19 * s, 18 * s, 15 * s);
      g.fillStyle(0xbdc3c7, 1);
      g.fillRect(x + 14 * s, y + 20 * s, 16 * s, 13 * s);
      // Gold Crest
      g.fillStyle(0xf1c40f, 1);
      g.fillRect(x + 20 * s, y + 23 * s, 4 * s, 6 * s);
      g.fillRect(x + 18 * s, y + 25 * s, 8 * s, 2 * s);
      // Steel Rivets
      g.fillStyle(0x2c3e50, 1);
      g.fillRect(x + 14 * s, y + 20 * s, 2 * s, 2 * s);
      g.fillRect(x + 28 * s, y + 20 * s, 2 * s, 2 * s);
    } else if (costume === 'costume_cape') {
      // Golden buckle clasp on front
      g.fillStyle(0xf1c40f, 1);
      g.fillRect(x + 19 * s, y + 17 * s, 6 * s, 3 * s);
    }

    // 6. Snout & Nostrils
    g.fillStyle(pinkShadow, 1);
    g.fillRect(x + 19 * s, y + 23 * s, 10 * s, 7 * s);
    g.fillStyle(pinkHighlight, 1);
    g.fillRect(x + 20 * s, y + 24 * s, 8 * s, 5 * s);
    g.fillStyle(0x8a2846, 1);
    g.fillRect(x + 22 * s, y + 26 * s, 2 * s, 2 * s);
    g.fillRect(x + 25 * s, y + 26 * s, 2 * s, 2 * s);

    // 7. Eyes
    g.fillStyle(0x2d3436, 1);
    g.fillRect(x + 16 * s, y + 19 * s, 4 * s, 3 * s);
    g.fillRect(x + 28 * s, y + 19 * s, 4 * s, 3 * s);
    g.fillStyle(0xffffff, 1);
    g.fillRect(x + 17 * s, y + 19 * s, 1.5 * s, 1.5 * s);
    g.fillRect(x + 29 * s, y + 19 * s, 1.5 * s, 1.5 * s);

    // 8. Boots / Trotters
    if (boots === 'boots_bare') {
      g.fillStyle(pinkShadow, 1);
      g.fillRect(x + 15 * s, y + 34 * s, 5 * s, 8 * s);
      g.fillRect(x + 24 * s, y + 34 * s, 5 * s, 8 * s);
      g.fillStyle(0x8a2846, 1);
      g.fillRect(x + 15 * s, y + 40 * s, 5 * s, 2 * s);
      g.fillRect(x + 24 * s, y + 40 * s, 5 * s, 2 * s);
    } else if (boots === 'boots_sneakers') {
      g.fillStyle(pinkShadow, 1);
      g.fillRect(x + 15 * s, y + 34 * s, 5 * s, 3 * s);
      g.fillRect(x + 24 * s, y + 34 * s, 5 * s, 3 * s);
      // Red sneaker body
      g.fillStyle(0xe74c3c, 1);
      g.fillRect(x + 14 * s, y + 36 * s, 7 * s, 5 * s);
      g.fillRect(x + 23 * s, y + 36 * s, 7 * s, 5 * s);
      // White sole
      g.fillStyle(0xffffff, 1);
      g.fillRect(x + 13 * s, y + 40 * s, 8 * s, 2.5 * s);
      g.fillRect(x + 22 * s, y + 40 * s, 8 * s, 2.5 * s);
      // White racing stripe
      g.fillRect(x + 16 * s, y + 37 * s, 2 * s, 3 * s);
      g.fillRect(x + 25 * s, y + 37 * s, 2 * s, 3 * s);
    } else if (boots === 'boots_winged') {
      // Golden boots
      g.fillStyle(0xf1c40f, 1);
      g.fillRect(x + 14 * s, y + 35 * s, 6 * s, 7 * s);
      g.fillRect(x + 24 * s, y + 35 * s, 6 * s, 7 * s);
      // Angel Wings on ankles
      g.fillStyle(0xffffff, 1);
      g.fillRect(x + 9 * s, y + 34 * s, 5 * s, 3 * s);
      g.fillRect(x + 8 * s, y + 32 * s, 4 * s, 3 * s);
      g.fillRect(x + 30 * s, y + 34 * s, 5 * s, 3 * s);
      g.fillRect(x + 32 * s, y + 32 * s, 4 * s, 3 * s);
    } else if (boots === 'boots_spring') {
      // High-tech shock cleat top
      g.fillStyle(0x27ae60, 1);
      g.fillRect(x + 14 * s, y + 34 * s, 6 * s, 4 * s);
      g.fillRect(x + 24 * s, y + 34 * s, 6 * s, 4 * s);
      // Steel Coil spring
      g.fillStyle(0xbdc3c7, 1);
      g.fillRect(x + 15 * s, y + 38 * s, 4 * s, 2 * s);
      g.fillRect(x + 25 * s, y + 38 * s, 4 * s, 2 * s);
      // High-traction yellow bounce pad
      g.fillStyle(0xf1c40f, 1);
      g.fillRect(x + 13 * s, y + 40 * s, 8 * s, 2.5 * s);
      g.fillRect(x + 23 * s, y + 40 * s, 8 * s, 2.5 * s);
    }

    // 9. Headwear
    if (head === 'head_bandana') {
      // Red Ninja Headband with fluttering ribbon
      g.fillStyle(0xd63031, 1);
      g.fillRect(x + 10 * s, y + 15 * s, 24 * s, 6 * s);
      g.beginPath();
      g.moveTo(x + 10 * s, y + 17 * s);
      g.lineTo(x + 1 * s, y + 13 * s);
      g.lineTo(x + 3 * s, y + 21 * s);
      g.lineTo(x + 10 * s, y + 20 * s);
      g.closePath();
      g.fillPath();
    } else if (head === 'head_straw') {
      // Straw Farmer Hat
      g.fillStyle(0xf1c40f, 1);
      g.fillRect(x + 6 * s, y + 12 * s, 32 * s, 4 * s);
      g.fillStyle(0xf39c12, 1);
      g.fillRect(x + 14 * s, y + 4 * s, 16 * s, 8 * s);
      // Green hat ribbon
      g.fillStyle(0x27ae60, 1);
      g.fillRect(x + 14 * s, y + 10 * s, 16 * s, 2.5 * s);
    } else if (head === 'head_wizard') {
      // Indigo pointed wizard hat
      g.fillStyle(0x4834d4, 1);
      g.fillRect(x + 8 * s, y + 13 * s, 28 * s, 4 * s);
      g.beginPath();
      g.moveTo(x + 13 * s, y + 13 * s);
      g.lineTo(x + 20 * s, y + 1 * s);
      g.lineTo(x + 24 * s, y + 1 * s);
      g.lineTo(x + 31 * s, y + 13 * s);
      g.closePath();
      g.fillPath();
      // Glowing gold magic star
      g.fillStyle(0xf1c40f, 1);
      g.fillRect(x + 20 * s, y + 6 * s, 3.5 * s, 3.5 * s);
    } else if (head === 'head_crown') {
      // Royal Golden Crown
      g.fillStyle(0xf1c40f, 1);
      g.fillRect(x + 12 * s, y + 11 * s, 20 * s, 4 * s);
      // 3 Crown peaks
      g.fillRect(x + 12 * s, y + 7 * s, 4 * s, 4 * s);
      g.fillRect(x + 20 * s, y + 5 * s, 4 * s, 6 * s);
      g.fillRect(x + 28 * s, y + 7 * s, 4 * s, 4 * s);
      // Embedded gems (Ruby & Emerald)
      g.fillStyle(0xe74c3c, 1);
      g.fillRect(x + 21 * s, y + 12 * s, 2 * s, 2 * s);
      g.fillStyle(0x2ecc71, 1);
      g.fillRect(x + 15 * s, y + 12 * s, 2 * s, 2 * s);
      g.fillRect(x + 27 * s, y + 12 * s, 2 * s, 2 * s);
    }
  }

  // Generates or re-creates the Phaser texture 'piggy' to reflect equipped cosmetics
  generatePiggyTexture(scene, textureKey = 'piggy') {
    const w = 48;
    const h = 48;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    this.drawPiggyGraphics(g, 0, 0, 1, this.equipped);

    if (scene.textures.exists(textureKey)) {
      scene.textures.remove(textureKey);
    }
    g.generateTexture(textureKey, w, h);
    g.destroy();
  }
}

// Global Singleton
window.CosmeticsManager = new CosmeticsManagerClass();

// =========================================================================
// DEVELOPER OPTIONS: CTRL+a+n+t CHEAT CODE
// Unlocks all cosmetics & stocks all artifacts for testing on Training Level
// =========================================================================
window.activateDevMode = function() {
  window.isDevMode = true;
  if (window.CosmeticsManager) {
    window.CosmeticsManager.unlockAll();
  }

  window.sounds?.playWin();
  console.log('%c🛠️ [DEV MODE ACTIVATED] All cosmetics & artifacts ready!', 'background: #27ae60; color: #fff; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;');

  const game = window.game;
  if (game && game.scene) {
    const gameScene = game.scene.getScene('GameScene');
    const isGameActive = gameScene && gameScene.scene.isActive();

    if (isGameActive) {
      gameScene.enableDevMode();
    } else {
      ['MenuScene', 'LevelPreviewScene', 'GameScene', 'UIScene'].forEach(sKey => {
        const sc = game.scene.getScene(sKey);
        if (sc && sc.scene.isActive()) {
          sc.scene.stop();
        }
      });
      game.scene.start('GameScene', { levelIndex: 0, devMode: true });
    }
  }
};

// Also support typing simple 'a' -> 'n' -> 't' sequentially without Ctrl
(function setupSimpleAntCheatCode() {
  let plainSeq = [];
  let pTimer = null;

  window.addEventListener('keydown', (e) => {
    // Ignore if Ctrl or Alt is held to avoid browser shortcuts
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const k = e.key.toLowerCase();

    if (k === 'a' && plainSeq.length === 0) {
      plainSeq.push('a');
      clearTimeout(pTimer);
      pTimer = setTimeout(() => { plainSeq = []; }, 2000);
      return;
    }
    if (k === 'n' && plainSeq.length === 1 && plainSeq[0] === 'a') {
      plainSeq.push('n');
      clearTimeout(pTimer);
      pTimer = setTimeout(() => { plainSeq = []; }, 2000);
      return;
    }
    if (k === 't' && plainSeq.length === 2 && plainSeq[1] === 'n') {
      plainSeq = [];
      clearTimeout(pTimer);
      window.activateDevMode();
      return;
    }
    if (k !== 'shift') {
      plainSeq = [];
    }
  });
})();


