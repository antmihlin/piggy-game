// Level definitions for Piggy Escape
// Includes Levels 0-6 and shared 2.5D tile/elevation grid builder for GameScene & LevelPreviewScene.

window.GAME_LEVELS = [
  {
    id: 0,
    isTraining: true,
    name: "Training Yard",
    subtitle: "Practice moving, jumping, dashing & spring bouncing! (No chase)",
    timeLimit: 180,
    theme: "training",
    layoutType: "standard",
    gridWidth: 12,
    gridHeight: 22,
    piggyStart: { x: 5, y: 2, z: 0 },
    farmerStart: { x: 2, y: 19, z: 0 },
    farmerSpeed: 0,
    farmerAggroRange: 0,
    goal: { x: 5, y: 20, z: 0 },
    pathX: 5,
    tutorialHints: [
      { text: "WASD / Arrows to Move 🐾", x: 5, y: 3.2 },
      { text: "Press SPACE to Jump! ⬆️", x: 5, y: 7.2 },
      { text: "Press SHIFT or E to Dash! ⚡", x: 5, y: 11.2 },
      { text: "Step on Hay Spring to Bounce! 🚀", x: 3, y: 13.5 },
      { text: "Safe Barn Goal Ahead! 🏡", x: 5, y: 18.5 }
    ],
    items: [
      { type: 'apple_red', x: 5, y: 4, z: 0 },
      { type: 'artifact_speed', x: 3, y: 6, z: 0 },
      { type: 'artifact_jump', x: 7, y: 6, z: 0 },
      { type: 'apple_green', x: 5, y: 9, z: 0 },
      { type: 'artifact_invis', x: 3, y: 10, z: 0 },
      { type: 'artifact_clone', x: 7, y: 10, z: 0 },
      { type: 'apple_gold', x: 5, y: 12, z: 0 },
      { type: 'artifact_dirt', x: 5, y: 14, z: 0 },
      { type: 'acorn', x: 3, y: 16, z: 0 },
      { type: 'acorn', x: 7, y: 16, z: 0 },
    ],
    obstacles: [
      { type: 'spikes', x: 5, y: 8, z: 0 },
      { type: 'mud', x: 5, y: 15, z: 0 },
      { type: 'hay_spring', x: 3, y: 14, z: 0 },
      { type: 'thorn', x: 7, y: 14, z: 0 },
    ],
    scenery: [
      { type: 'fence', x: 3, y: 5 },
      { type: 'fence', x: 7, y: 5 },
      { type: 'tree_green', x: 1, y: 3 },
      { type: 'tree_green', x: 10, y: 4 },
      { type: 'tree_autumn', x: 1, y: 10 },
      { type: 'barn', x: 5, y: 21 },
    ]
  },
  {
    id: 1,
    name: "Sunny Pasture",
    subtitle: "Outrun the Farmer to the Red Barn!",
    timeLimit: 60,
    theme: "grass",
    layoutType: "standard",
    gridWidth: 12,
    gridHeight: 24,
    piggyStart: { x: 5, y: 3, z: 0 },
    farmerStart: { x: 5, y: -2, z: 0 },
    farmerSpeed: 82,
    farmerAggroRange: 12,
    goal: { x: 5, y: 22, z: 0 },
    pathX: 5,
    items: [
      { type: 'apple_red', x: 5, y: 5, z: 0 },
      { type: 'artifact_speed', x: 6, y: 7, z: 0 },
      { type: 'apple_green', x: 4, y: 8, z: 0 },
      { type: 'apple_gold', x: 7, y: 12, z: 1 },
      { type: 'artifact_dirt', x: 4, y: 13, z: 0 },
      { type: 'acorn', x: 5, y: 15, z: 0 },
      { type: 'apple_red', x: 5, y: 18, z: 0 },
      { type: 'acorn', x: 6, y: 20, z: 0 },
    ],
    obstacles: [
      { type: 'thorn', x: 4, y: 7, z: 0 },
      { type: 'thorn', x: 7, y: 9, z: 0 },
      { type: 'spikes', x: 5, y: 10, z: 0 },
      { type: 'mud', x: 5, y: 14, z: 0 },
      { type: 'hay_spring', x: 3, y: 12, z: 0, targetZ: 1 },
    ],
    scenery: [
      { type: 'tree_green', x: 1, y: 3 },
      { type: 'tree_green', x: 9, y: 4 },
      { type: 'fence', x: 2, y: 6 },
      { type: 'fence', x: 3, y: 6 },
      { type: 'fence', x: 8, y: 8 },
      { type: 'fence', x: 9, y: 8 },
      { type: 'tree_autumn', x: 10, y: 13 },
      { type: 'tree_green', x: 1, y: 16 },
      { type: 'barn', x: 5, y: 23 },
    ]
  },
  {
    id: 2,
    name: "Muddy Crossroad",
    subtitle: "Watch out for mud puddles and double pitchforks!",
    timeLimit: 55,
    theme: "dirt_mud",
    layoutType: "standard",
    gridWidth: 14,
    gridHeight: 26,
    piggyStart: { x: 6, y: 3, z: 0 },
    farmerStart: { x: 6, y: -3, z: 0 },
    farmerSpeed: 92,
    farmerAggroRange: 14,
    goal: { x: 6, y: 24, z: 0 },
    pathX: 6,
    items: [
      { type: 'apple_red', x: 6, y: 4, z: 0 },
      { type: 'artifact_jump', x: 6, y: 8, z: 0 },
      { type: 'apple_gold', x: 3, y: 8, z: 1 },
      { type: 'apple_green', x: 9, y: 10, z: 1 },
      { type: 'apple_red', x: 6, y: 13, z: 0 },
      { type: 'artifact_invis', x: 8, y: 14, z: 0 },
      { type: 'apple_gold', x: 6, y: 17, z: 0 },
      { type: 'acorn', x: 3, y: 20, z: 0 },
      { type: 'acorn', x: 9, y: 20, z: 0 },
    ],
    obstacles: [
      { type: 'mud', x: 6, y: 6, z: 0 },
      { type: 'spikes', x: 5, y: 9, z: 0 },
      { type: 'spikes', x: 7, y: 9, z: 0 },
      { type: 'mud', x: 4, y: 12, z: 0 },
      { type: 'mud', x: 6, y: 15, z: 0 },
      { type: 'thorn', x: 8, y: 15, z: 0 },
      { type: 'hay_spring', x: 2, y: 8, z: 0, targetZ: 1 },
      { type: 'hay_spring', x: 10, y: 10, z: 0, targetZ: 1 },
      { type: 'spikes', x: 6, y: 21, z: 0 },
    ],
    scenery: [
      { type: 'tree_autumn', x: 1, y: 4 },
      { type: 'tree_green', x: 12, y: 5 },
      { type: 'fence', x: 2, y: 10 },
      { type: 'fence', x: 11, y: 10 },
      { type: 'rock', x: 2, y: 14 },
      { type: 'rock', x: 11, y: 16 },
      { type: 'tree_autumn', x: 1, y: 19 },
      { type: 'barn', x: 6, y: 25 },
    ]
  },
  {
    id: 3,
    name: "Autumn Barnyard Chase",
    subtitle: "High speed sprint over wooden bridges and floating hay!",
    timeLimit: 50,
    theme: "autumn",
    layoutType: "standard",
    gridWidth: 14,
    gridHeight: 30,
    piggyStart: { x: 7, y: 3, z: 0 },
    farmerStart: { x: 7, y: -4, z: 0 },
    farmerSpeed: 100,
    farmerAggroRange: 16,
    goal: { x: 7, y: 28, z: 0 },
    pathX: 7,
    items: [
      { type: 'apple_gold', x: 7, y: 4, z: 0 },
      { type: 'apple_red', x: 5, y: 8, z: 0 },
      { type: 'artifact_clone', x: 9, y: 9, z: 0 },
      { type: 'apple_gold', x: 7, y: 12, z: 1 },
      { type: 'artifact_speed', x: 5, y: 14, z: 0 },
      { type: 'apple_green', x: 9, y: 16, z: 0 },
      { type: 'apple_gold', x: 7, y: 20, z: 1 },
      { type: 'acorn', x: 4, y: 24, z: 0 },
      { type: 'acorn', x: 10, y: 24, z: 0 },
    ],
    obstacles: [
      { type: 'spikes', x: 7, y: 6, z: 0 },
      { type: 'thorn', x: 5, y: 10, z: 0 },
      { type: 'thorn', x: 9, y: 10, z: 0 },
      { type: 'hay_spring', x: 7, y: 10, z: 0, targetZ: 1 },
      { type: 'mud', x: 6, y: 15, z: 0 },
      { type: 'mud', x: 8, y: 15, z: 0 },
      { type: 'spikes', x: 7, y: 18, z: 0 },
      { type: 'hay_spring', x: 5, y: 19, z: 0, targetZ: 1 },
      { type: 'thorn', x: 6, y: 23, z: 0 },
      { type: 'thorn', x: 8, y: 23, z: 0 },
      { type: 'spikes', x: 7, y: 25, z: 0 },
    ],
    scenery: [
      { type: 'tree_autumn', x: 1, y: 3 },
      { type: 'tree_autumn', x: 12, y: 4 },
      { type: 'tree_autumn', x: 1, y: 17 },
      { type: 'tree_autumn', x: 12, y: 18 },
      { type: 'fence', x: 3, y: 21 },
      { type: 'fence', x: 10, y: 21 },
      { type: 'barn', x: 7, y: 29 },
    ]
  },

  // =========================================================================
  // LEVEL 4: JUMPING PLATFORMS OVER WATER ("Splashy Lagoon")
  // Ground at the beginning (y=0..3) and end (y=26..29) only.
  // All the middle (y=4..25) is water with multi-height jumping platforms (z=0, 1, 2)
  // and artifacts spawning on those platforms!
  // =========================================================================
  {
    id: 4,
    name: "Splashy Lagoon",
    subtitle: "Ground at start & end only! Jump across platforms over deep water!",
    timeLimit: 65,
    theme: "water_platforms",
    layoutType: "water_platforms",
    gridWidth: 14,
    gridHeight: 30,
    piggyStart: { x: 7, y: 2, z: 0 },
    farmerStart: { x: 7, y: -2, z: 0 },
    farmerSpeed: 88,
    farmerAggroRange: 16,
    goal: { x: 7, y: 28, z: 0 },
    pathX: 7,
    startGroundMaxY: 3,
    endGroundMinY: 26,
    // Jumping platforms placed across the water (y = 4 .. 25) at varying heights (z = 0, 1, 2)
    platforms: [
      // Row cluster 1 (y = 5..6): Entry docks
      { x: 6, y: 5, w: 3, h: 2, z: 0 },
      { x: 2, y: 6, w: 2, h: 2, z: 1 },
      { x: 10, y: 6, w: 2, h: 2, z: 1 },

      // Row cluster 2 (y = 8..9): Twin elevated decks
      { x: 4, y: 8, w: 2, h: 2, z: 1 },
      { x: 8, y: 8, w: 2, h: 2, z: 0 },

      // Row cluster 3 (y = 11..12): High central lookout (z = 2) + side decks
      { x: 6, y: 11, w: 3, h: 2, z: 2 },
      { x: 2, y: 11, w: 2, h: 2, z: 0 },
      { x: 10, y: 11, w: 2, h: 2, z: 1 },

      // Row cluster 4 (y = 14..15): Mid-lagoon split platforms
      { x: 4, y: 14, w: 2, h: 2, z: 1 },
      { x: 8, y: 14, w: 2, h: 2, z: 1 },

      // Row cluster 5 (y = 17..18): Central spring deck + high outer towers (z = 2)
      { x: 6, y: 17, w: 3, h: 2, z: 0 },
      { x: 2, y: 17, w: 2, h: 2, z: 2 },
      { x: 10, y: 17, w: 2, h: 2, z: 2 },

      // Row cluster 6 (y = 20..21): High-low alternating pads
      { x: 4, y: 20, w: 2, h: 2, z: 2 },
      { x: 8, y: 20, w: 2, h: 2, z: 1 },

      // Row cluster 7 (y = 23..24): Final landing platforms before shore
      { x: 6, y: 23, w: 3, h: 2, z: 1 },
      { x: 3, y: 23, w: 2, h: 2, z: 0 },
      { x: 10, y: 23, w: 2, h: 2, z: 0 }
    ],
    items: [
      // Artifacts & Fruits on the Jumping Platforms at matching heights!
      { type: 'apple_red', x: 7, y: 5, z: 0 },
      { type: 'artifact_jump', x: 2.5, y: 6.5, z: 1 },
      { type: 'apple_gold', x: 10.5, y: 6.5, z: 1 },
      { type: 'apple_green', x: 4.5, y: 8.5, z: 1 },
      { type: 'artifact_speed', x: 8.5, y: 8.5, z: 0 },
      { type: 'artifact_invis', x: 7, y: 11.5, z: 2 },
      { type: 'apple_gold', x: 6, y: 11.5, z: 2 },
      { type: 'apple_green', x: 2.5, y: 11.5, z: 0 },
      { type: 'acorn', x: 10.5, y: 11.5, z: 1 },
      { type: 'artifact_clone', x: 4.5, y: 14.5, z: 1 },
      { type: 'apple_red', x: 8.5, y: 14.5, z: 1 },
      { type: 'apple_gold', x: 2.5, y: 17.5, z: 2 },
      { type: 'artifact_dirt', x: 10.5, y: 17.5, z: 2 },
      { type: 'apple_gold', x: 4.5, y: 20.5, z: 2 },
      { type: 'artifact_speed', x: 8.5, y: 20.5, z: 1 },
      { type: 'apple_green', x: 7, y: 23.5, z: 1 },
      { type: 'acorn', x: 3.5, y: 23.5, z: 0 },
      { type: 'acorn', x: 10.5, y: 23.5, z: 0 }
    ],
    obstacles: [
      // Hay springs on platforms to launch onto z=2 high platforms
      { type: 'hay_spring', x: 7, y: 6, z: 0, targetZ: 1 },
      { type: 'hay_spring', x: 5, y: 9, z: 1, targetZ: 2 },
      { type: 'hay_spring', x: 7, y: 18, z: 0, targetZ: 2 },
      { type: 'spikes', x: 8, y: 11.5, z: 2 },
      { type: 'spikes', x: 6, y: 23.5, z: 1 }
    ],
    scenery: [
      // Trees & fences on the start bank (y=0..3) and end bank (y=26..29) only
      { type: 'tree_green', x: 1, y: 1, z: 0 },
      { type: 'tree_green', x: 12, y: 1, z: 0 },
      { type: 'fence', x: 3, y: 3, z: 0 },
      { type: 'fence', x: 11, y: 3, z: 0 },
      { type: 'tree_green', x: 2, y: 27, z: 0 },
      { type: 'tree_green', x: 11, y: 27, z: 0 },
      { type: 'barn', x: 7, y: 29, z: 0 }
    ]
  },

  // =========================================================================
  // LEVEL 5: LABYRINTH OF CACTUSES ("Cactus Labyrinth")
  // Desert sandstone maze with winding cactus walls, treasure alcoves, and springs
  // =========================================================================
  {
    id: 5,
    name: "Cactus Labyrinth",
    subtitle: "Find your way through the prickly saguaro cactus maze!",
    timeLimit: 70,
    theme: "desert_labyrinth",
    layoutType: "cactus_labyrinth",
    gridWidth: 15,
    gridHeight: 30,
    piggyStart: { x: 7, y: 2, z: 0 },
    farmerStart: { x: 7, y: -2, z: 0 },
    farmerSpeed: 86,
    farmerAggroRange: 16,
    goal: { x: 7, y: 28, z: 0 },
    pathX: 7,
    // 15-column x 30-row Labyrinth Blueprint:
    // '#' = Cactus wall, '.' = Desert canyon path, ' ' = Desert sand
    mazeRows: [
      "               ", // y=0
      "      ...      ", // y=1
      "      ...      ", // y=2 (Piggy Start at 7,2)
      "    .......    ", // y=3
      " ##..#####..## ", // y=4
      " #...#   #...# ", // y=5
      " #.### . ###.# ", // y=6
      " #.....#.....# ", // y=7
      " #####.#.##### ", // y=8
      " #.....#.....# ", // y=9
      " #.#.#####.#.# ", // y=10
      " #.#.......#.# ", // y=11
      " #.###.#.###.# ", // y=12
      " #.....#.....# ", // y=13
      " ###.#####.### ", // y=14
      " #...#   #...# ", // y=15
      " #.### . ###.# ", // y=16
      " #.#.......#.# ", // y=17
      " #.#.#####.#.# ", // y=18
      " #.....#.....# ", // y=19
      " #####.#.##### ", // y=20
      " #.....#.....# ", // y=21
      " #.###...###.# ", // y=22
      " #...#.#.#...# ", // y=23
      " ##..#.#.#..## ", // y=24
      "  .....#.....  ", // y=25
      "     .....     ", // y=26
      "      ...      ", // y=27
      "      ...      ", // y=28 (Barn Goal at 7,28)
      "               "  // y=29
    ],
    items: [
      { type: 'apple_red', x: 4, y: 5, z: 0 },
      { type: 'apple_red', x: 10, y: 5, z: 0 },
      { type: 'artifact_speed', x: 2, y: 7, z: 0 },
      { type: 'apple_gold', x: 7, y: 6, z: 0 },
      { type: 'artifact_jump', x: 12, y: 7, z: 0 },
      { type: 'apple_green', x: 7, y: 11, z: 0 },
      { type: 'artifact_invis', x: 2, y: 13, z: 0 },
      { type: 'apple_gold', x: 12, y: 13, z: 0 },
      { type: 'artifact_clone', x: 7, y: 16, z: 0 },
      { type: 'apple_red', x: 4, y: 17, z: 0 },
      { type: 'apple_green', x: 10, y: 17, z: 0 },
      { type: 'artifact_dirt', x: 2, y: 21, z: 0 },
      { type: 'apple_gold', x: 12, y: 21, z: 0 },
      { type: 'acorn', x: 4, y: 25, z: 0 },
      { type: 'acorn', x: 10, y: 25, z: 0 }
    ],
    obstacles: [
      // Strategic Hay Springs allowing Piggy to vault over cactus walls!
      { type: 'hay_spring', x: 6, y: 7, z: 0, targetZ: 1 },
      { type: 'hay_spring', x: 8, y: 13, z: 0, targetZ: 1 },
      { type: 'hay_spring', x: 6, y: 19, z: 0, targetZ: 1 },
      { type: 'mud', x: 7, y: 9, z: 0 },
      { type: 'mud', x: 7, y: 17, z: 0 },
      { type: 'spikes', x: 5, y: 21, z: 0 },
      { type: 'spikes', x: 9, y: 21, z: 0 }
    ],
    scenery: [
      { type: 'rock', x: 2, y: 2, z: 0 },
      { type: 'rock', x: 12, y: 2, z: 0 },
      { type: 'rock', x: 2, y: 27, z: 0 },
      { type: 'rock', x: 12, y: 27, z: 0 },
      { type: 'barn', x: 7, y: 29, z: 0 }
    ]
  },

  // =========================================================================
  // LEVEL 6: MULTI-HEIGHT GROUND CUBES & FLOATING ISLANDS ("Sky Terraces & Floating Islands")
  // Ground cubes of varying heights (z = 0, 1, 2, 3) requiring climbing up and down,
  // combined with Floating Islands suspended over open sky chasms!
  // =========================================================================
  {
    id: 6,
    name: "Sky Cubes & Floating Islands",
    subtitle: "Climb up & down multi-height ground cubes and leap across floating islands!",
    timeLimit: 75,
    theme: "sky_islands",
    layoutType: "height_cubes_islands",
    gridWidth: 15,
    gridHeight: 32,
    piggyStart: { x: 7, y: 2, z: 0 },
    farmerStart: { x: 7, y: -2, z: 0 },
    farmerSpeed: 90,
    farmerAggroRange: 17,
    goal: { x: 7, y: 30, z: 2 },
    pathX: 7,
    items: [
      // Zone 1: Stepped Ground Cube Terraces (Up & Down)
      { type: 'apple_red', x: 7, y: 3.5, z: 1 },
      { type: 'apple_green', x: 7, y: 5.5, z: 2 },
      { type: 'artifact_jump', x: 3, y: 6.5, z: 3 },
      { type: 'apple_gold', x: 11, y: 6.5, z: 3 },
      { type: 'acorn', x: 7, y: 8.5, z: 1 },
      { type: 'artifact_speed', x: 7, y: 10.5, z: 1 },

      // Zone 2: First Floating Island Archipelago
      { type: 'apple_green', x: 7, y: 12.5, z: 2 },
      { type: 'apple_gold', x: 3, y: 14.5, z: 3 },
      { type: 'artifact_invis', x: 3, y: 15.2, z: 3 },
      { type: 'artifact_clone', x: 11, y: 14.5, z: 1 },
      { type: 'apple_red', x: 7, y: 16.5, z: 2 },

      // Zone 3: Midpoint Ground Cube Rollercoaster (Down & Up)
      { type: 'apple_green', x: 7, y: 20.5, z: 0 },
      { type: 'artifact_dirt', x: 4, y: 21, z: 1 },
      { type: 'apple_gold', x: 10, y: 22.5, z: 3 },

      // Zone 4: Upper Sky Floating Islands
      { type: 'artifact_jump', x: 4, y: 24.5, z: 3 },
      { type: 'apple_gold', x: 10, y: 24.5, z: 2 },
      { type: 'apple_green', x: 7, y: 26.5, z: 2 },

      // Zone 5: Summit Sanctuary
      { type: 'apple_gold', x: 7, y: 29, z: 2 }
    ],
    obstacles: [
      { type: 'hay_spring', x: 5, y: 5, z: 2, targetZ: 3 },
      { type: 'hay_spring', x: 9, y: 5, z: 2, targetZ: 3 },
      { type: 'spikes', x: 7, y: 7, z: 2 },
      { type: 'hay_spring', x: 7, y: 11, z: 1, targetZ: 2 },
      { type: 'hay_spring', x: 6, y: 13, z: 2, targetZ: 3 },
      { type: 'thorn', x: 5, y: 20, z: 0 },
      { type: 'thorn', x: 9, y: 20, z: 0 },
      { type: 'hay_spring', x: 7, y: 23, z: 2, targetZ: 3 },
      { type: 'spikes', x: 7, y: 28.5, z: 1 }
    ],
    scenery: [
      { type: 'tree_green', x: 2, y: 2, z: 1 },
      { type: 'tree_green', x: 12, y: 2, z: 1 },
      { type: 'rock', x: 2, y: 9, z: 2 },
      { type: 'rock', x: 12, y: 9, z: 2 },
      { type: 'tree_autumn', x: 3, y: 14, z: 3 },
      { type: 'tree_green', x: 11, y: 14, z: 1 },
      { type: 'tree_autumn', x: 4, y: 24, z: 3 },
      { type: 'tree_green', x: 3, y: 30, z: 2 },
      { type: 'tree_green', x: 11, y: 30, z: 2 },
      { type: 'barn', x: 7, y: 31, z: 2 }
    ]
  }
];

// Shared deterministic 2.5D tile & heightmap builder used by both GameScene and LevelPreviewScene
window.buildLevelTileGrid = function(levelData) {
  const gw = levelData.gridWidth || 12;
  const gh = levelData.gridHeight || 24;
  const pathX = levelData.pathX !== undefined ? levelData.pathX : Math.floor(gw / 2);
  const layout = levelData.layoutType || 'standard';

  const grid = [];

  for (let y = 0; y < gh; y++) {
    const row = [];
    for (let x = 0; x < gw; x++) {
      // Default cell
      let cell = {
        x,
        y,
        tileKey: 'tile_grass',
        z: 0,
        isWater: false,
        isPlatform: false,
        isFloatingIsland: false,
        isVoid: false,
        stackBaseKey: 'tile_dirt'
      };

      if (layout === 'water_platforms') {
        const startMaxY = levelData.startGroundMaxY !== undefined ? levelData.startGroundMaxY : 3;
        const endMinY = levelData.endGroundMinY !== undefined ? levelData.endGroundMinY : gh - 4;

        if (y <= startMaxY || y >= endMinY) {
          // Solid ground at the beginning and end only
          const isPath = Math.abs(x - pathX) <= 1;
          cell.tileKey = isPath ? 'tile_dirt' : 'tile_grass';
          cell.z = (x === 0 || x === gw - 1) ? 1 : 0;
        } else {
          // Middle section: Water everywhere unless covered by a Jumping Platform
          cell.tileKey = 'tile_water';
          cell.z = -0.35;
          cell.isWater = true;
        }
      } else if (layout === 'cactus_labyrinth') {
        const mazeRows = levelData.mazeRows || [];
        const rStr = mazeRows[y] || '';
        const ch = rStr[x] || ' ';
        const isBorder = (x === 0 || x === gw - 1);

        if (isBorder) {
          cell.tileKey = 'tile_sand_path';
          cell.z = 1;
          cell.stackBaseKey = 'tile_sand_path';
        } else if (ch === '.') {
          cell.tileKey = 'tile_sand_path';
          cell.z = 0;
        } else {
          cell.tileKey = 'tile_sand';
          cell.z = 0;
        }
      } else if (layout === 'height_cubes_islands') {
        // Multi-height ground cubes (going up and down) + Floating Islands over open sky chasms
        const isInChasm1 = (y >= 12 && y <= 18);
        const isInChasm2 = (y >= 24 && y <= 27);

        if (isInChasm1 || isInChasm2) {
          // Default to open sky chasm unless a Floating Island is placed here
          cell.tileKey = null;
          cell.z = -10;
          cell.isVoid = true;

          // Place Floating Islands in Chasm 1 (y = 12..18)
          if (y >= 12 && y <= 13 && x >= 5 && x <= 9) {
            cell.tileKey = 'tile_island';
            cell.z = 2;
            cell.isVoid = false;
            cell.isFloatingIsland = true;
          } else if (y >= 14 && y <= 15 && x >= 2 && x <= 4) {
            cell.tileKey = 'tile_island';
            cell.z = 3;
            cell.isVoid = false;
            cell.isFloatingIsland = true;
          } else if (y >= 14 && y <= 15 && x >= 10 && x <= 12) {
            cell.tileKey = 'tile_island';
            cell.z = 1;
            cell.isVoid = false;
            cell.isFloatingIsland = true;
          } else if (y >= 14 && y <= 15 && x >= 6 && x <= 8) {
            cell.tileKey = 'tile_platform';
            cell.z = 2;
            cell.isVoid = false;
            cell.isPlatform = true;
          } else if (y >= 16 && y <= 18 && x >= 5 && x <= 9) {
            cell.tileKey = 'tile_island';
            cell.z = 2;
            cell.isVoid = false;
            cell.isFloatingIsland = true;
          }

          // Place Floating Islands in Chasm 2 (y = 24..27)
          if (y >= 24 && y <= 25 && x >= 3 && x <= 5) {
            cell.tileKey = 'tile_island';
            cell.z = 3;
            cell.isVoid = false;
            cell.isFloatingIsland = true;
          } else if (y >= 24 && y <= 25 && x >= 9 && x <= 11) {
            cell.tileKey = 'tile_island';
            cell.z = 2;
            cell.isVoid = false;
            cell.isFloatingIsland = true;
          } else if (y >= 24 && y <= 25 && x >= 6 && x <= 8) {
            cell.tileKey = 'tile_platform';
            cell.z = 2;
            cell.isVoid = false;
            cell.isPlatform = true;
          } else if (y >= 26 && y <= 27 && x >= 5 && x <= 9) {
            cell.tileKey = 'tile_island';
            cell.z = 2;
            cell.isVoid = false;
            cell.isFloatingIsland = true;
          }
        } else {
          // Multi-height Ground Cubes! Player climbs UP and drops DOWN across cube terraces
          let cubeZ = 0;
          if (y <= 2) {
            cubeZ = (x <= 1 || x >= gw - 2) ? 1 : 0;
          } else if (y === 3 || y === 4) {
            cubeZ = (x >= 3 && x <= 11) ? 1 : 2;
          } else if (y === 5 || y === 6) {
            if (x >= 2 && x <= 4) cubeZ = 3;
            else if (x >= 10 && x <= 12) cubeZ = 3;
            else cubeZ = 2;
          } else if (y === 7 || y === 8) {
            cubeZ = (x >= 4 && x <= 10) ? 1 : 2;
          } else if (y === 9) {
            cubeZ = (x >= 4 && x <= 10) ? 0 : 2;
          } else if (y === 10 || y === 11) {
            cubeZ = (y === 11 && x >= 5 && x <= 9) ? 2 : 1;
          } else if (y === 19) {
            cubeZ = (x >= 4 && x <= 10) ? 1 : 2;
          } else if (y === 20 || y === 21) {
            if (x >= 5 && x <= 9) cubeZ = 0;
            else cubeZ = 1;
          } else if (y === 22) {
            cubeZ = (x >= 9 && x <= 12) ? 2 : 1;
          } else if (y === 23) {
            cubeZ = (x >= 9 && x <= 12) ? 3 : 2;
          } else if (y === 28) {
            cubeZ = 1;
          } else {
            // y = 29..31: Summit Barn Plateau at z = 2
            cubeZ = (x === 0 || x === gw - 1) ? 3 : 2;
          }

          const isPath = Math.abs(x - pathX) <= 1;
          cell.z = cubeZ;
          if (cubeZ >= 3) {
            cell.tileKey = 'tile_stone';
            cell.stackBaseKey = 'tile_stone';
          } else if (cubeZ === 2) {
            cell.tileKey = isPath ? 'tile_dirt' : 'tile_grass';
            cell.stackBaseKey = 'tile_stone';
          } else {
            cell.tileKey = isPath ? 'tile_dirt' : 'tile_grass';
            cell.stackBaseKey = 'tile_dirt';
          }
        }
      } else {
        // Standard Levels 0, 1, 2, 3
        const isPath = Math.abs(x - pathX) <= 1;
        cell.tileKey = isPath ? 'tile_dirt' : 'tile_grass';
        cell.z = (x === 0 || x === gw - 1) ? 1 : 0;
      }

      row.push(cell);
    }
    grid.push(row);
  }

  // Overlay jumping platforms if defined in levelData.platforms
  if (Array.isArray(levelData.platforms)) {
    levelData.platforms.forEach(plat => {
      const pw = plat.w || 1;
      const ph = plat.h || 1;
      const pz = plat.z || 0;
      for (let py = plat.y; py < plat.y + ph; py++) {
        for (let px = plat.x; px < plat.x + pw; px++) {
          if (py >= 0 && py < gh && px >= 0 && px < gw) {
            grid[py][px] = {
              x: px,
              y: py,
              tileKey: 'tile_platform',
              z: pz,
              isWater: false,
              isPlatform: true,
              isFloatingIsland: false,
              isVoid: false,
              hasWaterUnderneath: (layout === 'water_platforms')
            };
          }
        }
      }
    });
  }

  return grid;
};

// Shared helper that combines explicit levelData.obstacles with procedural maze obstacles (e.g. Cactus Labyrinth)
window.getLevelObstacles = function(levelData) {
  const list = (levelData.obstacles || []).map(o => ({ ...o }));

  if (levelData.layoutType === 'cactus_labyrinth' && Array.isArray(levelData.mazeRows)) {
    const gw = levelData.gridWidth || 15;
    const gh = levelData.gridHeight || 30;
    for (let y = 0; y < gh; y++) {
      const rStr = levelData.mazeRows[y] || '';
      for (let x = 0; x < gw; x++) {
        if (rStr[x] === '#') {
          list.push({ type: 'cactus', x, y, z: 0, isWall: true });
        }
      }
    }
  }

  return list;
};

