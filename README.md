# 🐷 Piggy Escape: Farmer Chase

An optimized 2.5D isometric voxel browser game built with **Phaser 3**, featuring smooth 60 FPS performance on both desktop and mobile devices.

---

## 🎮 How to Play

### 💻 Desktop Controls
- **Move:** `W`, `A`, `S`, `D` or `Arrow Keys`
- **Jump:** `Spacebar` (jump over spikes, mud, or leap high onto obstacles)
- **Dash:** `Shift` (speed boost with dust particle trail)

### 📱 Mobile & Touch Controls
- **Move:** Responsive on-screen 4-way D-Pad
- **Jump:** Green `JUMP` button
- **Dash:** Red `DASH` button

---

## 🌟 Game Features

1. **2.5D Isometric Voxel World:**
   - Inspired directly by the world design spread sheet: grass cubes, dirt paths, modular red barn, wooden fences, blocky trees, pumpkins, and more.
2. **Farmer Chase AI:**
   - The angry farmer with his pitchfork chases Piggy down the path!
   - Stepping on mud slows down both Piggy and the Farmer — use mud tactically to shake off the chase!
3. **Interactables & Obstacles:**
   - **Hay Spring:** Stepping on the spring launches Piggy high into the air with a boing.
   - **Spikes & Thorns:** Cause damage, camera shake, and knock Piggy back.
   - **Mud Puddle:** Squelchy mud slowing entities down by 60%.
   - **Apples & Acorns:** Collect Red Apples (+50), Green Apples (+75), Golden Apples (+150), and Acorns (+25).
4. **🗺️ Interactive Level Maps Inspector:**
   - Click **`🗺️ LEVEL MAPS`** on the main menu to inspect the entire isometric terrain of any level before playing!
   - Pan around with mouse/touch drag, zoom in/out, view spawn pins (`🐷 START`, `👨‍🌾 CHASER`, `🏡 GOAL`), check item & trap statistics, and click `PLAY ▶` to launch immediately.
5. **Tension Radar:**
   - Real-time HUD bar tracking distances between `Farmer ➔ Piggy ➔ Barn Goal`.
6. **Procedural Web Audio FX:**
   - Built-in audio synthesizer for cute pig oinks, farmer alerts, pitchfork whooshes, item pickups, jump springs, and victory fanfares without external audio dependencies.
7. **Modular Level System (`src/levels.js`):**
   - Easily expand with unlimited levels by editing or adding objects in `src/levels.js`:
     - **Level 0 (Training Yard):** Safe practice course with floating tutorial signs, no farmer chase (farmer is asleep), low spikes, dash lanes, and hay spring bounce practice.
     - **Level 1:** Sunny Pasture (Introduction to movement, items, and farmer chase)
     - **Level 2:** Muddy Crossroad (Mud pits, spikes, and hay springs)
     - **Level 3:** Autumn Barnyard Chase (High-speed escape over obstacles)

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

