# Module: Levels & Map Data (`docs/modules/levels.md`)

## 1. Purpose

Defines all playable levels in `window.GAME_LEVELS` ([`src/levels.js`](file:///c:/nodejs/piggy-game/src/levels.js)), including grid dimensions, spawn coordinates, terrain themes, custom tile/elevation maps, collectibles, obstacles, and scenery.

## 2. File & Folder Table

| File | Responsibility |
| :--- | :--- |
| [`src/levels.js`](file:///c:/nodejs/piggy-game/src/levels.js) | Exports `window.GAME_LEVELS` array containing level objects (`id: 0` through `id: 6`). |

## 3. Public Interfaces & Schema

Each level entry in `window.GAME_LEVELS` supports:
- `id`: Unique numeric level ID (`0` = Training Yard, `1..N` = main levels).
- `name`, `subtitle`, `theme`, `timeLimit`: Metadata and visual theme (`training`, `grass`, `dirt_mud`, `autumn`, `water_platforms`, `desert_labyrinth`, `sky_islands`).
- `gridWidth`, `gridHeight`, `pathX`: Isometric grid bounds and default path center.
- `piggyStart`, `farmerStart`, `goal`: `{ x, y, z }` coordinates.
- `farmerSpeed`, `farmerAggroRange`: Chaser AI parameters.
- `customGrid` / `platforms` / `heightMap` / `floatingIslands`: Optional declarative terrain descriptors for water-platform levels, desert labyrinths, multi-height ground cubes, and floating islands.
- `items`: Array of `{ type, x, y, z }` collectibles (`apple_red`, `apple_green`, `apple_gold`, `acorn`, `artifact_speed`, `artifact_jump`, `artifact_invis`, `artifact_clone`, `artifact_dirt`).
- `obstacles`: Array of `{ type, x, y, z, targetZ }` hazards/interactables (`spikes`, `mud`, `thorn`, `cactus`, `hay_spring`).
- `scenery`: Array of `{ type, x, y, z }` props (`barn`, `tree_green`, `tree_autumn`, `fence`, `rock`, `pumpkin`, `cactus`).

## 4. Module Invariants

- Both [`GameScene`](file:///c:/nodejs/piggy-game/src/scenes/GameScene.js) and [`LevelPreviewScene`](file:///c:/nodejs/piggy-game/src/scenes/LevelPreviewScene.js) must render the exact same terrain layout for any level in `window.GAME_LEVELS`.
- Every collectible or obstacle placed on a raised platform or cube must specify its matching `z` elevation so it renders and collides at the platform's height.

