# Module: Menus, Map Preview & UI (`docs/modules/scenes-ui.md`)

## 1. Purpose

Provides the main menu level/difficulty selector ([`MenuScene`](file:///c:/nodejs/piggy-game/src/scenes/MenuScene.js)), interactive isometric map inspector ([`LevelPreviewScene`](file:///c:/nodejs/piggy-game/src/scenes/LevelPreviewScene.js)), in-game HUD and RPG inventory ([`UIScene`](file:///c:/nodejs/piggy-game/src/scenes/UIScene.js)), and cosmetics manager ([`src/cosmetics.js`](file:///c:/nodejs/piggy-game/src/cosmetics.js)).

## 2. File & Folder Table

| File | Responsibility |
| :--- | :--- |
| [`src/scenes/MenuScene.js`](file:///c:/nodejs/piggy-game/src/scenes/MenuScene.js) | Main menu with level carousel (`◀` / `▶`), difficulty selector, and Play/Practice/Maps actions. |
| [`src/scenes/LevelPreviewScene.js`](file:///c:/nodejs/piggy-game/src/scenes/LevelPreviewScene.js) | Pan-and-zoom 2.5D map preview with top-bar level tabs and stats card. |
| [`src/scenes/UIScene.js`](file:///c:/nodejs/piggy-game/src/scenes/UIScene.js) | HUD, tension radar, touch controls, RPG inventory/cosmetics modal, and win/loss dialogs. |
| [`src/cosmetics.js`](file:///c:/nodejs/piggy-game/src/cosmetics.js) | Cosmetics catalog, passive bonuses, and level completion unlocks. |

## 3. Module Invariants

- `LevelPreviewScene` top-bar tabs must scale dynamically so that when 7+ levels exist (`Level 0` through `Level 6`), all level tabs fit cleanly on screen without overlapping the title.
- `LevelPreviewScene.renderLevelMap()` must render custom tile maps, stacked cube columns, water tiles, jumping platforms, cactuses, and floating islands identically to `GameScene`.

