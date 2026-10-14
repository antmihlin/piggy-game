# 🐷 Piggy Escape: Farmer Chase

An optimized 2.5D isometric voxel browser game built with **Phaser 3**, featuring smooth 60 FPS performance on both desktop and mobile devices, full RPG-style inventory management, dynamic appearance cosmetics with passive abilities, and progressive level unlocks.

---

## 🎮 How to Play

### 💻 Desktop Controls
- **Move:** `W`, `A`, `S`, `D` or `Arrow Keys` (Screen-relative intuitive isometric navigation)
- **Jump:** `Spacebar` (jump over spikes, mud, or leap high onto obstacles)
- **Dash:** `Shift` or `E` (speed boost with dust particle trail)
- **Open RPG Inventory / Bag:** `R` (or click `🎒 BAG [R]` in HUD)
- **Throw Mud Patch:** `Q` (drops a slippery mud patch behind Piggy)
- **Quick Artifact Hotkeys:** `1`–`5` (activate inventory slots instantly)
- **Dev Artifacts Restock:** `0` (restocks all 5 artifacts when Developer Mode is active)
- **Return to Menu:** Click `🏠 MENU` in the top-left HUD (or press `ESC` in inventory)
- **Developer Cheat Code:** Click or tap the character 5 times (or type `ant`) to unlock all cosmetics and restock all artifacts!

### 📱 Mobile & Tablet Controls (Visible on Touch Devices Only)
- **16:9 Display & Closer Zoom:** Automatically fits any screen in 16:9 aspect ratio with a closer camera zoom (1.45×) so Piggy and the world are large and easy to see.
- **Move:** Virtual Analog Joystick (smooth emerald dot you drag in any direction with automatic spring-back).
- **Jump:** Circular green `JUMP` button.
- **Dash:** Circular red `DASH` button.
- **Inventory:** Tap `🎒 BAG` button to view and use items in slow motion.
- **Menu:** Tap `🏠 MENU` button to return to the menu anytime.
*(Note: Touch joystick and action buttons automatically hide on desktop computers for a clean view!)*

---

## ⚔️ RPG Inventory & Appearance Cosmetics

Press **`[R]`** or tap the **`🎒 BAG`** button to open the RPG-style dual-panel window:

### 1. 🐽 Left Panel: The Character & Equipment Display
- **2.4× Voxel Character Doll:** Displays Piggy in full detail wearing your currently equipped gear, complete with a bouncy idle animation.
- **Equipped Gear Slots:** Shows what items are equipped across the 3 equipment slots:
  - `🧣 HEAD`
  - `🦺 BODY (Costume)`
  - `🐾 FEET (Boots)`
- **Active Passives Card:** Summarizes all active passive ability bonuses granted by equipped gear (e.g., `Speed +23% • Mud Immune • Jump +30% • Dash CD -40%`).

### 2. 📑 Right Panel: Tabbed Navigation
- **`🎒 INVENTORY` Tab (Default):**
  - Displays single-use consumable run artifacts collected on the map.
  - Dilates time into cinematic **0.18× Bullet Time slow-motion** so you can plan your next move.
  - Quick action buttons: Press `[1]`–`[5]` or click `USE` to activate artifacts.
- **`✨ COSMETICS` Tab:**
  - Browse all collectible appearance gear with category filter pills (`[ALL]`, `[🧣 HEAD]`, `[🦺 COSTUME]`, `[🐾 BOOTS]`).
  - Shows locked/unlocked state, unlock conditions, and RPG passive ability descriptions.
  - One-click `[EQUIP]` buttons dynamically re-skin Piggy in real-time and recalculate your passive stats!

---

## 🦺 Cosmetics Catalog & RPG Passive Abilities

Each cosmetic item visually modifies Piggy's sprite and provides unique RPG passive bonuses:

| Category | Cosmetic Item | Icon | RPG Passive Bonus Ability | Unlock Condition |
| :--- | :--- | :---: | :--- | :--- |
| **Head** | **Ninja Bandana** | 🧣 | **+8% Movement Speed** (Base agility boost) | Starter Item |
| **Head** | **Straw Farmer Hat** | 👒 | **Farmer Aggro Range -25%** (Camouflage stealth) | Complete Training Yard (Level 0) |
| **Head** | **Wizard Hat** | 🧙 | **Artifact Duration +40%** (Potency multiplier) | Complete Muddy Crossroad (Level 2) |
| **Head** | **Golden Crown** | 👑 | **+50% Fruit Score** (Extra points from apples/acorns) | Complete Autumn Chase (Level 3) |
| **Costume** | **Classic Pink** | 🐷 | **Standard Agility** (Pure natural rhythm) | Starter Item |
| **Costume** | **Mud Camo Overalls** | 🦺 | **Immune to Mud Slowdown** (Runs full speed through mud) | Complete Sunny Pasture (Level 1) |
| **Costume** | **Superhero Cape** | 🦸 | **Dash Cooldown -40%** (Faster dash burst recharge) | Complete Muddy Crossroad (Level 2) |
| **Costume** | **Knight Plate Armor** | 🛡️ | **Hazard Shield** (Immune to spike & thorn knockback/trip) | Complete Autumn Chase (Level 3) |
| **Boots** | **Bare Hooves** | 🐾 | **Standard Trotters** (Natural stride) | Starter Item |
| **Boots** | **Turbo Sneakers** | 👟 | **+15% Sprint Speed** (Athletic runners) | Complete Sunny Pasture (Level 1) |
| **Boots** | **Winged Hermes Boots** | 🪽 | **+30% Jump Height** (Leap high over barriers) | Complete Muddy Crossroad (Level 2) |
| **Boots** | **Spring Cleats** | 🥾 | **Hay Springs +50% Bounce** (Super spring launch) | Complete Autumn Chase (Level 3) |

> [!NOTE]
> Progress and equipped cosmetics are automatically saved to `localStorage`, so your unlocked wardrobe persists across game sessions.

---

## 🛠️ Developer Mode & Testing Cheat Code

A developer shortcut is available to test all cosmetics and artifacts:

### 🔑 Activation:
- **Click or tap the Character 5 times:**
  - **In-Game:** Click/tap Piggy 5 times on the field.
  - **In Inventory:** Open your Bag (`[R]`) and click/tap the Character Doll on the left panel 5 times.
  - **In Main Menu:** Click/tap the `PIGGY ESCAPE` title logo 5 times.
- **Alternative:** Type `a` then `n` then `t` in sequence, or type `activateDevMode()` in the browser DevTools console.

### ⚡ What Happens Upon Activation:
1. **All 12 Cosmetics Unlocked:** Unlocks every headpiece, costume, and boot item immediately.
2. **Full Artifact Stocking:** Fills Piggy's inventory with all 5 artifacts:
   - 🌶️ `[1]` **Speed Pepper:** 2× blazing sprint
   - 🪽 `[2]` **Winged Feather:** Super jump
   - 👻 `[3]` **Smoke Cloak:** Invisibility to farmer
   - 🐷 `[4]` **Mirage Decoy:** Hologram clone lure
   - 🥔 `[5]` / `[Q]` **Mud Bomb:** Throw mud trap
3. **Instant Restock Hotkey:** Press **`[0]`** (number zero) at any time to instantly refill all 5 artifacts.
4. **HUD Restock Button:** A **`🛠️ RESTOCK [0]`** button appears in the top HUD.
5. **Modal Restock Button:** Inside the `🎒 INVENTORY` tab, click **`⚡ RESTOCK ALL 5 ARTIFACTS [0]`** to restock items without closing the inventory window.

---

## 🌟 Gameplay Mechanics & Hazards

1. **⏳ Slow-Motion Bullet Time:**
   - Opening Piggy's backpack (`R` key or `🎒 BAG` button) dilates time into cinematic **0.18× slow motion**.
   - Traps, chasers, and clocks slow down, giving you breathing room to trigger artifacts or switch cosmetics.

2. **⚔️ 3-Tier Difficulty Modes:**
   - 🟢 **Easy (Piglet):** Farmer speed -20%, longer hazard stun duration (3.5s), extra grace time.
   - 🟡 **Normal (Runner):** Standard balanced chase and obstacle density.
   - 🔴 **Hard (Farmer Frenzy):** Farmer speed +25%, shorter grace time, quick hazard recovery, and aggressive vaulting over obstacles.

3. **🌾 Obstacles & Interactables:**
   - **Hay Spring:** Bounces Piggy high into the air (boosted by Spring Cleats).
   - **Spikes & Thorns:** Cause damage, knockback, and camera shake (deflected by Knight Armor).
   - **Mud Puddles:** Squelchy mud slowing entities down by 58% (negated by Mud Camo Overalls).
   - **Apples & Acorns:** Red Apple (+50), Green Apple (+75), Golden Apple (+150), Acorn (+25) (boosted +50% by Golden Crown).

4. **🗺️ Interactive Level Maps Inspector:**
   - Click **`🗺️ MAPS`** on the main menu to inspect the entire isometric terrain, spawn markers, and trap locations before running a stage.

---

## 🚀 Running Locally

The local game server runs on Node.js:
- URL: **`http://localhost:3000`**

To start the server:
```bash
npm start
# or
node server.js
```
