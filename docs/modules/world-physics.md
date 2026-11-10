# Module: World Rendering & 3D Physics (`docs/modules/world-physics.md`)

## 1. Purpose

Generates procedural voxel textures in [`BootScene`](file:///c:/nodejs/piggy-game/src/scenes/BootScene.js), builds the 2.5D isometric terrain in [`GameScene`](file:///c:/nodejs/piggy-game/src/scenes/GameScene.js), and runs 3D elevation physics (`x, y, z`), platforming, water hazards, cactus wall collisions, and Farmer chase AI.

## 2. File & Folder Table

| File | Responsibility |
| :--- | :--- |
| [`src/scenes/BootScene.js`](file:///c:/nodejs/piggy-game/src/scenes/BootScene.js) | Procedural generation of voxel cube tiles, characters, obstacles (`cactus`, `spikes`, `mud`, `thorn`, `hay_spring`), and items. |
| [`src/scenes/GameScene.js`](file:///c:/nodejs/piggy-game/src/scenes/GameScene.js) | Isometric world builder, 3D elevation/platforming physics, water/void handling, obstacle collisions, and Farmer AI. |
| [`src/audio.js`](file:///c:/nodejs/piggy-game/src/audio.js) | Web Audio procedural sound effects (`window.sounds`). |

## 3. Public Interfaces

- `BootScene.createIsometricCube(key, topBright, topDark, leftColor, rightColor)`: Generates 64×54 isometric voxel block textures.
- `GameScene.gridToIso(gx, gy, gz)`: Maps 3D grid coordinates to 2D isometric screen coordinates.
- `GameScene.getTileAt(gx, gy)`: Returns tile metadata `{ type, z, isWater, isVoid, isPlatform }` for terrain collision and height resolution.

## 4. Module Invariants

- **Elevation & Step Physics**: Moving onto a tile with a higher `z` requires the entity's total vertical height (`baseZ + jumpZ`) to reach at least `targetZ - 0.35`, otherwise horizontal entry is blocked by the cube wall (unless jumping). Stepping onto a lower `z` smoothly drops the entity down under gravity.
- **Water & Void Safety**: Landing in water between jumping platforms triggers a splash penalty/slowdown or bounce-recovery; falling into open sky void around floating islands respawns Piggy onto the last safe tile with a brief stun/warning.
- **Labyrinth Navigation**: Cactus obstacles block direct walk-throughs (acting as prickly labyrinth walls) and Farmer AI navigates around solid maze walls rather than getting permanently stuck.

