# 🐷 Piggy Escape: Farmer Chase

An optimized 2.5D isometric voxel browser game built with **Phaser 3**, featuring smooth 60 FPS performance on both desktop and mobile devices.

---

## 🎮 How to Play

### 💻 Desktop Controls
- **Move:** `W`, `A`, `S`, `D` or `Arrow Keys` (Screen-relative intuitive isometric navigation)
- **Jump:** `Spacebar` (jump over spikes, mud, or leap high onto obstacles)
- **Dash:** `Shift` (speed boost with dust particle trail)
- **Open Inventory:** `R` (or click `🎒 BAG` in HUD)
- **Throw Mud Patch:** `Q` (drops a slippery mud patch behind Piggy)
- **Quick Artifact Hotkeys:** `1`–`5` (activate inventory slots instantly)
- **Return to Menu:** Click `🏠 MENU` in the top-left HUD (or press `ESC` in inventory)

### 📱 Mobile & Touch Controls
- **Move:** Responsive on-screen 4-way D-Pad
- **Jump:** Green `JUMP` button
- **Dash:** Red `DASH` button
- **Inventory:** Tap `🎒 BAG` button to view and use items
- **Menu:** Tap `🏠 MENU` button to exit level anytime

---

## 🌟 Game Features

1. **🎒 Artifact Inventory & Special Abilities:**
   - Collect unique single-use artifacts placed across levels or stored in Piggy's backpack:
     - 🌶️ **Hot Pepper (Speed Boost):** Hyper-speed sprint for 5 seconds.
     - 🪽 **Winged Feather (Long Jump):** Super-charged jump clearing multi-tile hazard zones.
     - 👻 **Smoke Cloak (Invisibility):** Blinds the farmer for 5 seconds—he wanders confused with question marks (`❓`) and cannot attack!
     - 🐷 **Decoy Piggy (Mirage Clone):** Spawns a life-sized clone doll that distracts and lures the farmer away until it pops in a puff of confetti!
     - 💩 **Mud Ball (Dirt Throw):** Press `Q` to splat mud on the ground, causing farmers to slip, stumble, and slow down by 60%.

2. **🌵 Farmer Hazard & Trap Reactions:**
   - The farmer is no longer invincible!
   - Bait the farmer into **spikes** or **thorns/cacti**: they will damage, knock back, and stun him for 2.4 seconds with cartoon dizzy stars (`⭐`), buying Piggy precious escape time!

3. **2.5D Isometric Voxel World:**
   - Inspired directly by the world design spreadsheet: grass cubes, dirt paths, modular red barn, wooden fences, blocky trees, pumpkins, and more.
   - Screen-relative inverse projection matrix provides smooth, intuitive movement without isometric diagonal disorientation.

4. **Farmer Chase AI:**
   - The angry farmer with his pitchfork chases Piggy down the path!
   - Stepping on mud slows down both Piggy and the Farmer — use mud tactically to shake off the chase!
   - Chases decoy clones and loses target during invisibility.

5. **Interactables & Obstacles:**
   - **Hay Spring:** Stepping on the spring launches Piggy high into the air with a boing.
   - **Spikes & Thorns:** Cause damage, camera shake, and knock Piggy or the Farmer back.
   - **Mud Puddle:** Squelchy mud slowing entities down by 60%.
   - **Apples & Acorns:** Collect Red Apples (+50), Green Apples (+75), Golden Apples (+150), and Acorns (+25).

6. **🗺️ Interactive Level Maps Inspector:**
   - Click **`🗺️ LEVEL MAPS`** on the main menu to inspect the entire isometric terrain of any level before playing!
   - Pan around with mouse/touch drag, zoom in/out, view spawn pins (`🐷 START`, `👨‍🌾 CHASER`, `🏡 GOAL`), check item & trap statistics, and click `PLAY ▶` to launch immediately.

7. **Tension Radar:**
   - Real-time HUD bar tracking distances between `Farmer ➔ Piggy ➔ Barn Goal`.

8. **Procedural Web Audio FX:**
   - Built-in audio synthesizer for cute pig oinks, farmer alerts, pitchfork whooshes, item pickups, jump springs, victory fanfares, powerups, invisibility whoosh, dirt splats, and farmer dizzy clangs without external audio dependencies.

9. **Modular Level System (`src/levels.js`):**
   - Easily expand with unlimited levels by editing or adding objects in `src/levels.js`:
     - **Level 0 (Training Yard):** Safe practice course with floating tutorial signs, all 5 artifact pickups to experiment with, low spikes, dash lanes, and bounce practice.
     - **Level 1:** Sunny Pasture (Introduction to movement, items, speed pepper, and farmer chase)
     - **Level 2:** Muddy Crossroad (Mud pits, spikes, decoy clone, invis cloak, and hay springs)
     - **Level 3:** Autumn Barnyard Chase (High-speed escape over obstacles with winged feathers and mud balls)

---

## 🚀 Running Locally

The local server is already running in the background:
- Open your browser to: **`http://localhost:3000`**

To restart manually at any time:
```bash
npm start
# or
node server.js
```

