# Piggy Escape: Farmer Chase — Documentation Router (`docs/INDEX.md`)

> **Selective Loading Rule**: Agents must read this file first and load **only** the `docs/modules/<module>.md` file(s) relevant to their assigned task.

## 1. Project Overview

**Piggy Escape: Farmer Chase** is a 2.5D isometric voxel browser game built with **Phaser 3** (no bundler required; vanilla ES6 classes loaded in [`index.html`](file:///c:/nodejs/piggy-game/index.html) and served via [`server.js`](file:///c:/nodejs/piggy-game/server.js)).

## 2. Module Routing Table

| Module | Source Paths | Doc File | When to Load |
| :--- | :--- | :--- | :--- |
| **Levels & Map Data** | `src/levels.js` | [`docs/modules/levels.md`](file:///c:/nodejs/piggy-game/docs/modules/levels.md) | Adding or editing levels, custom tile grids, heightmaps, obstacles, items, or scenery. |
| **World Rendering & 3D Physics** | `src/scenes/BootScene.js`, `src/scenes/GameScene.js`, `src/audio.js` | [`docs/modules/world-physics.md`](file:///c:/nodejs/piggy-game/docs/modules/world-physics.md) | Modifying procedural voxel textures, isometric rendering, 3D elevation/platform physics, water/void hazards, cactus walls, or Farmer AI. |
| **Menus, Map Preview & UI** | `src/scenes/MenuScene.js`, `src/scenes/LevelPreviewScene.js`, `src/scenes/UIScene.js`, `src/cosmetics.js` | [`docs/modules/scenes-ui.md`](file:///c:/nodejs/piggy-game/docs/modules/scenes-ui.md) | Updating level selection UI, map preview rendering, HUD, RPG inventory, or cosmetics unlocks. |

## 3. Architecture Reference

- High-level system architecture and scene flow: [`docs/architecture.md`](file:///c:/nodejs/piggy-game/docs/architecture.md)

