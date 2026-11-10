# Development Plan: Three New Levels (Water Jumping Platforms, Cactus Labyrinth, Multi-Height Cubes & Floating Islands)

- **Plan Status**: `READY`
- **Target Workspace**: `c:\nodejs\piggy-game`

---

## 1. Requirements Summary

1. **Level 4 — Jumping Platforms Over Water ("Splashy Lagoon")**:
   - Solid ground exists **only at the beginning** (spawn bank) and **at the end** (barn goal bank).
   - Everything between the start bank and end bank is **water** (`tile_water`) populated with **jumping platforms** (`tile_platform`) at different heights (`z = 0, 1, 2`, plus bouncy spring platforms).
   - **Artifacts** and fruit collectibles spawn on top of those platforms at their corresponding heights.
2. **Level 5 — Labyrinth of Cactuses ("Cactus Labyrinth")**:
   - Desert canyon theme (`tile_sand` / `tile_sand_path`) featuring a full **labyrinth of voxel cactuses** (`cactus` wall obstacles).
   - Cactuses form winding maze corridors, branching paths, and treasure alcoves containing artifacts and golden apples.
   - Touching a cactus at ground level pricks/pushes Piggy back (unless jumping high with Winged Feather or wearing Knight Armor), and the Farmer navigates through corridors using grid pathfinding.
3. **Level 6 — Multi-Height Ground Cubes & Floating Islands ("Sky Terraces & Floating Islands")**:
   - Built of **ground cubes of different heights** (`z = 0, 1, 2, 3`) requiring the player to climb **up** (by jumping onto higher cube steps/terraces) and drop **down** across varied 3D terrain.
   - Includes **Floating Islands** suspended over open sky (`z = 2, 3`) with bridges of air/platforms where Piggy leaps across floating voxel islands to reach the Barn.

---

## 2. Question Gate (`[BLOCKING]` vs. `[NON-BLOCKING]`)

### Blocking Questions (`[BLOCKING]`)
- *None.* All core gameplay, level structures, and visual requirements are clearly specified.

### Non-Blocking Questions (`[NON-BLOCKING]`)
1. **[NON-BLOCKING] Water Hazard Behavior in Level 4**: What happens when Piggy misses a platform and lands in the water between platforms?
   - **Option A `(Recommended)`**: **Splash & Wade/Bounce Recovery** — Landing in water triggers a water splash effect (`💧 SPLASH!`) and slows movement (`0.38×` wading speed) while allowing Piggy to immediately jump out onto adjacent `z = 0` or `z = 1` platforms (or auto-boosts slightly so Piggy never gets stuck). This keeps platforming fast-paced while punishing missed jumps during the Farmer chase.
   - **Option B**: Instant Game Over on touching water.
   - *Decision*: Proceed with **Option A `(Recommended)`**.
2. **[NON-BLOCKING] Jumping Platform Behavior in Level 4**: Should platforms in the water level require manual jumping, auto-bounce Piggy, or combine both?
   - **Option A `(Recommended)`**: **Combined Jumping Platforms** — Every platform in the water zone has a springy voxel cushion top that gives a subtle helpful jump boost (`+20%` jump power when jumping from a platform) AND selected platforms feature auto-bounce spring pads (`hay_spring`) to launch Piggy onto high `z = 2` artifact platforms.
   - *Decision*: Proceed with **Option A `(Recommended)`**.
3. **[NON-BLOCKING] Open Sky Void Behavior Around Floating Islands in Level 6**: What happens if Piggy falls off a floating island into the open sky chasm?
   - **Option A `(Recommended)`**: **Cloud Rescue Respawn** — Falling into the sky void plays a whoosh/splash sound, flashes a `"☁️ FELL OFF ISLAND!"` notice, and pops Piggy back onto the last safe ground/island tile with a brief recovery hop (costing valuable time while the Farmer closes in).
   - *Decision*: Proceed with **Option A `(Recommended)`**.

---

## 3. Task Breakdown

### Task 1: Procedural Voxel Textures for New Tiles & Cactus (`BootScene.js` & `audio.js`)
- **Docs to Load**: [`docs/modules/world-physics.md`](file:///c:/nodejs/piggy-game/docs/modules/world-physics.md)
- **Files Touched**:
  - [`src/scenes/BootScene.js`](file:///c:/nodejs/piggy-game/src/scenes/BootScene.js)
  - [`src/audio.js`](file:///c:/nodejs/piggy-game/src/audio.js)
- **Implementation Details**:
  - Generate new isometric voxel textures in `BootScene`:
    - `tile_water`: Sparkling isometric water block with animated/rippled foam highlights.
    - `tile_platform`: Wooden/golden spring-rimmed jumping platform block with side struts.
    - `tile_sand` and `tile_sand_path`: Warm desert sandstone/dune voxel cubes for the Cactus Labyrinth.
    - `tile_island`: Lush sky-island cube with mossy/stone floating base trim.
    - `cactus`: Multi-armed 3D voxel saguaro cactus with prickly needles and desert flower crown.
  - Add `playSplash()` sound effect in `SoundManager` (`src/audio.js`).
- **Acceptance Criteria**:
  - All new textures (`tile_water`, `tile_platform`, `tile_sand`, `tile_sand_path`, `tile_island`, `cactus`) are registered in Phaser texture cache without console errors.
- **Verification**: Start server and verify `BootScene` transitions cleanly to `MenuScene`.

### Task 2: 3D Terrain Heightmap, Jumping Platforms, Water/Void & Labyrinth Physics (`GameScene.js`)
- **Docs to Load**: [`docs/modules/world-physics.md`](file:///c:/nodejs/piggy-game/docs/modules/world-physics.md), [`docs/modules/levels.md`](file:///c:/nodejs/piggy-game/docs/modules/levels.md)
- **Files Touched**:
  - [`src/scenes/GameScene.js`](file:///c:/nodejs/piggy-game/src/scenes/GameScene.js)
- **Implementation Details**:
  - Upgrade `buildIsometricWorld()` to build a 2D lookup table `this.tileMap[y][x] = { type, z, isWater, isVoid, isPlatform, bouncePad }` supporting:
    - Custom per-level terrain generators/maps (`layoutType`: `'standard'`, `'water_platforms'`, `'cactus_labyrinth'`, `'height_cubes_islands'`).
    - Multi-cube vertical column stacking: when a ground cube has `z >= 1`, render lower support cubes (`z - 1`, etc.) or floating island underside so tall cubes and floating islands look authentically 3D!
  - Upgrade Piggy & Farmer 3D elevation physics:
    - Track ground elevation `this.piggyGrid.z` dynamically based on `getTileAt(gx, gy)` and airborne offset `this.piggyZ` (so total world height is `totalZ = this.piggyGrid.z + this.piggyZ`).
    - **Step Blocking & Climbing**: When moving from `(oldX, oldY)` to `(newX, newY)`, if `targetTile.z > currentTotalZ + 0.35`, block horizontal entry into that cube face (sliding smoothly along the open axis) unless Piggy has jumped high enough!
    - **Stepping Off / Landing on Different Heights**: When walking off a higher cube or platform onto a lower `targetTile.z`, convert the height drop into airborne `this.piggyZ = oldTotalZ - targetTile.z` and let gravity land Piggy smoothly onto `targetTile.z`.
    - **Jumping Platforms (`isPlatform`)**: Landing on or jumping from a `tile_platform` gives a crisp spring bounce visual and `+20%` jump boost so Piggy can chain jumps across wide water gaps and tall platforms (`z = 0, 1, 2`).
    - **Water Hazard (`isWater`)**: Landing in water triggers `playSplash()`, water ripple particles, `"💧 SPLASH! JUMP TO PLATFORM!"` floating text, and `0.38×` wading speed; jumping out of water gives enough lift to get back onto `z = 0` or `z = 1` platforms.
    - **Sky Void (`isVoid`)**: Falling into open sky void (`totalZ < -0.6` over `isVoid`) rescues Piggy back to `this.lastSafeGrid` with a camera shake and `"☁️ SAVED FROM SKY CHASM!"`.
    - **Cactus Collision (`cactus`)**: Cactuses act as solid labyrinth barriers that also prick Piggy if bumped directly (`playHurt()`, slight knockback unless `hazardImmune` or airborne high above `z + 1.1`).
    - **Farmer AI Upgrades**:
      - On `water_platforms`, Farmer leaps from platform to platform (and slows down if he splashes into water).
      - On `cactus_labyrinth`, Farmer uses a lightweight grid BFS pathfinder to navigate around cactus maze walls toward Piggy instead of walking blindly into walls.
      - On `height_cubes_islands`, Farmer hops up/down elevation steps as he pursues Piggy.
- **Acceptance Criteria**:
  - Piggy can jump across platforms of heights `z = 0, 1, 2` over water, collect artifacts at `z = 1, 2`, navigate the cactus labyrinth, and climb up/down multi-height ground cubes and floating islands.
- **Verification**: Playtest Levels 4, 5, and 6 in `GameScene`.

### Task 3: Author Levels 4, 5, and 6 & Update Map Preview / UI (`levels.js`, `LevelPreviewScene.js`, `cosmetics.js`, `README.md`)
- **Docs to Load**: [`docs/modules/levels.md`](file:///c:/nodejs/piggy-game/docs/modules/levels.md), [`docs/modules/scenes-ui.md`](file:///c:/nodejs/piggy-game/docs/modules/scenes-ui.md)
- **Files Touched**:
  - [`src/levels.js`](file:///c:/nodejs/piggy-game/src/levels.js)
  - [`src/scenes/LevelPreviewScene.js`](file:///c:/nodejs/piggy-game/src/scenes/LevelPreviewScene.js)
  - [`src/cosmetics.js`](file:///c:/nodejs/piggy-game/src/cosmetics.js)
  - [`README.md`](file:///c:/nodejs/piggy-game/README.md)
- **Implementation Details**:
  - Add **Level 4 (`id: 4`, "Splashy Lagoon")**:
    - Ground at start (`y = 0..3`) and end (`y = 26..29`); water (`y = 4..25`) with a rich network of jumping platforms at heights `z = 0, 1, 2`.
    - Artifacts (`artifact_jump`, `artifact_speed`, `artifact_invis`, `artifact_clone`, `artifact_dirt`) and apples placed on elevated platforms (`z = 0, 1, 2`).
  - Add **Level 5 (`id: 5`, "Cactus Labyrinth")**:
    - Desert sand theme (`16 × 30` grid) with a structured cactus maze (`cactus` walls), multiple winding corridors, shortcut springs, and artifacts tucked into maze alcoves.
  - Add **Level 6 (`id: 6`, "Sky Cubes & Floating Islands")**:
    - Multi-height ground cube terraces (`z = 0, 1, 2, 3`) requiring Piggy to climb up and down, connected with **Floating Islands** (`z = 2, 3`) over open sky chasms, leading to the Sky Barn goal.
  - Update `LevelPreviewScene.js` so `renderLevelMap()` renders the exact custom tile maps, stacked cube columns, water, platforms, cactuses, and floating islands, and scales top-bar level tabs cleanly for all 7 levels (`YARD`, `LVL 1`..`LVL 6`).
- **Acceptance Criteria**:
  - Levels 4, 5, and 6 are selectable in `MenuScene`, inspectable in `LevelPreviewScene`, and fully playable from start to Barn goal in `GameScene`.
- **Verification**: Verify all 7 levels in `MenuScene`, `LevelPreviewScene`, and `GameScene`.

